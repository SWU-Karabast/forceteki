import type { GameEvent, ReducedState, PlayerState, CardInstanceState, Seat } from './types';

function emptyPlayer(seat: Seat): PlayerState {
    return {
        seat, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [],
        resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false,
        discard: [], cards: [],
    };
}

export function emptyState(): ReducedState {
    return { round: 0, phase: 'setup', initiative: null, initiativeTaken: false, players: { 1: emptyPlayer(1), 2: emptyPlayer(2) } };
}

/** The seat whose leader is `id`, if a keyframe or a DEPLOY_LEADER has told us. */
function leaderOwner(s: ReducedState, id: string): PlayerState | undefined {
    for (const seat of [1, 2] as Seat[]) {
        const ps = s.players[seat];
        if (ps?.leader?.id === id) {
            return ps;
        }
    }
    return undefined;
}

/** Set the ready/exhausted flag of `id` wherever it lives: an arena card, the leader, or both. */
function setExhausted(s: ReducedState, id: string, exhausted: boolean): void {
    const c = findCard(s, id);
    if (c) {
        c.exhausted = exhausted;
    }
    const owner = leaderOwner(s, id);
    if (owner?.leader) {
        owner.leader.exhausted = exhausted;
    }
}

/** `x` if it is an array, else `[]`. A file is untrusted input; `cards: 5` must not throw. */
function arr<T>(x: unknown): T[] {
    return Array.isArray(x) ? (x as T[]) : [];
}

/**
 * A keyframe REPLACES the reader's whole state, so one that is malformed or missing a seat
 * must not be snapped to: spec §13 says ignore it and keep folding. This is also the trust
 * boundary for a hostile file. Without it `keyframe: {}` or `cards: "x"` surfaces as an
 * uncaught TypeError in the browser rather than as a damaged checkpoint.
 */
export function isCompleteKeyframe(k: unknown): k is ReducedState {
    if (typeof k !== 'object' || k === null) {
        return false;
    }
    const players = (k as { players?: unknown }).players;
    if (typeof players !== 'object' || players === null) {
        return false;
    }
    for (const seat of [1, 2] as Seat[]) {
        const p = (players as Record<number, unknown>)[seat];
        if (typeof p !== 'object' || p === null) {
            return false;
        }
        const ps = p as Partial<PlayerState>;
        if (!Array.isArray(ps.cards) || !Array.isArray(ps.hand) || !Array.isArray(ps.discard)) {
            return false;
        }
        // Every card the fold later dereferences must actually carry the list it dereferences.
        // `upgrades` was checked nowhere: a keyframe card of `{id, zone}` passed as "complete",
        // the fold snapped to it, and the next exit from that arena crashed in detach() on
        // `c.upgrades.indexOf`. A keyframe is snapped to WHOLESALE, so a half-shaped card in one
        // is not a detail to tolerate -- it is a damaged checkpoint (spec §13).
        if (!ps.cards.every((c) => typeof c === 'object' && c !== null && Array.isArray((c as Partial<CardInstanceState>).upgrades))) {
            return false;
        }
    }
    return true;
}

/** True for a ROUND_START/ROUND_END that carries a keyframe a reader may snap to. */
export function hasSnapKeyframe(e: GameEvent): e is GameEvent & { keyframe: ReducedState } {
    return (e.t === 'ROUND_START' || e.t === 'ROUND_END') && isCompleteKeyframe(e.keyframe);
}

function snapTo(k: ReducedState): ReducedState {
    return JSON.parse(JSON.stringify(k)) as ReducedState;
}

/**
 * True only for a real seat number. `Seat` is erased at runtime, so a `p` field read out of
 * an untrusted `.swupgn` can be any JSON value -- including `"__proto__"`, which turns the
 * bracket access below into a write against `Object.prototype` for every object in the
 * process. Folding is a public API that runs in the browser on files a user supplies, so the
 * check belongs here, at the one point every seat lookup routes through.
 */
function isSeat(seat: unknown): seat is Seat {
    return seat === 1 || seat === 2;
}

function player(s: ReducedState, seat: Seat): PlayerState | undefined {
    if (!isSeat(seat)) {
        return undefined;
    }
    const existing = s.players[seat];
    if (existing) {
        return existing;
    }
    const created = emptyPlayer(seat);
    s.players[seat] = created;
    return created;
}

/** Resolve a target ref like "base@2" or "SOR#095:2" to the owning seat (best-effort). */
function seatOfBaseRef(ref: string): Seat | null {
    const m = (/^base@([12])$/).exec(ref);
    return m ? (Number(m[1]) as Seat) : null;
}

/**
 * The two reserved token names (spec §6.1). A Credit token and the Force token are neither
 * units nor upgrades; they live in the `base` zone and are the only things that drive
 * `credits` and `hasForce`. They are recognised by the `TOKEN:<name>#` grammar, not by a card
 * database, because the format defines the two fields and so must define what feeds them.
 */
function isCreditToken(id: string): boolean {
    return typeof id === 'string' && id.startsWith('TOKEN:credit#');
}
function isForceToken(id: string): boolean {
    return typeof id === 'string' && id.startsWith('TOKEN:the-force#');
}
function isTokenId(id: string): boolean {
    return typeof id === 'string' && id.startsWith('TOKEN:');
}

function findCard(s: ReducedState, id: string): CardInstanceState | undefined {
    for (const seat of [1, 2] as Seat[]) {
        const c = s.players[seat]?.cards.find((x) => x.id === id);
        if (c) {
            return c;
        }
    }
    return undefined;
}

function newCard(id: string, zone: string): CardInstanceState {
    return { id, zone, damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {}, captured: [] };
}

/**
 * Put a card in an arena, ONCE.
 *
 * Placement is idempotent by id because a real stream reports the same arrival twice: the
 * engine emits the zone transition as a MOVE (the fold's source of truth) and a PLAY /
 * PLAY_SMUGGLE / DEPLOY_LEADER summary beside it. Pushing on both duplicated every unit in
 * play — invisible while keyframes kept snapping the state back, but wrong for `stateAt()`
 * anywhere between two keyframes, which is exactly what a replay scrubber asks for.
 */
/**
 * Hard ceiling on any per-seat list the fold grows from an untrusted file: arena cards, hand,
 * discard, resources. A real game never comes close; a crafted one is trying to make a reader
 * do unbounded work. Past it, records are dropped rather than folded.
 */
const MAX_ZONE_LIST = 1000;

function placeCard(s: ReducedState, seat: Seat, id: string, zone: string): void {
    const existing = findCard(s, id);
    if (existing) {
        existing.zone = zone;
        return;
    }
    const ps = player(s, seat);
    if (!ps) {
        return;
    }
    // Same cap, and for the same reason, as `addOnce` on the zone lists: this is the OTHER
    // unbounded growth path, and it is the expensive one. `findCard` scans every card in play,
    // so a file of N unique MOVEs into an arena folds in O(N^2) -- 40k records (under 4 MB,
    // schema-valid) took seconds of synchronous work, which in a browser is the tab and in Node
    // is the event loop. A real game never approaches this; only a crafted file does.
    if (ps.cards.length >= MAX_ZONE_LIST) {
        return;
    }
    ps.cards.push(newCard(id, zone));
}

/** Remove `id` from every seat's arena list, wherever it is. */
function removeFromArenas(s: ReducedState, id: string): void {
    for (const seat of [1, 2] as Seat[]) {
        const owner = s.players[seat];
        if (!owner) {
            continue;
        }
        const idx = owner.cards.findIndex((c) => c.id === id);
        if (idx >= 0) {
            owner.cards.splice(idx, 1);
            return;
        }
    }
}

/**
 * Attach `id` to `hostId`'s `upgrades`, once. Both the attaching MOVE (`attachedTo`) and the
 * PLAY_UPGRADE / DEPLOY_LEADER beside it (`target`) name the host, so this must be idempotent.
 * Token upgrades never go here: they are the shields/experience/statusTokens counters.
 */
function attachTo(s: ReducedState, hostId: string, id: string): void {
    if (isTokenId(id)) {
        return;
    }
    const host = findCard(s, hostId);
    if (host && !host.upgrades.includes(id)) {
        host.upgrades.push(id);
    }
}

/**
 * Take `id` off every card's `upgrades` and `captured` lists. Keyed on the zone transition
 * (a card left an arena, or the capture zone), not on `kind`: a pilot's exit says `kind:
 * "unit"`, and no exit record names a host (spec §10.1).
 */
function detach(s: ReducedState, id: string): void {
    for (const seat of [1, 2] as Seat[]) {
        for (const c of s.players[seat]?.cards ?? []) {
            const u = c.upgrades.indexOf(id);
            if (u >= 0) {
                c.upgrades.splice(u, 1);
            }
            const captured = arr<string>(c.captured);
            const k = captured.indexOf(id);
            if (k >= 0) {
                captured.splice(k, 1);
                c.captured = captured;
            }
        }
    }
}

/** Move `n` of `ps`'s resources from ready to exhausted (`n` > 0) or back (`n` < 0), clamped. */
function shiftResources(ps: PlayerState, n: number): void {
    if (n > 0) {
        const moved = Math.min(n, ps.resourcesReady);
        ps.resourcesReady -= moved;
        ps.resourcesExhausted += moved;
    } else if (n < 0) {
        const moved = Math.min(-n, ps.resourcesExhausted);
        ps.resourcesExhausted -= moved;
        ps.resourcesReady += moved;
    }
}

/** One resource entered (`+1`) or left (`-1`) the row, in the `exhausted` or ready bucket. */
function countResource(ps: PlayerState, delta: 1 | -1, exhausted: boolean): void {
    if (exhausted) {
        ps.resourcesExhausted = Math.max(0, ps.resourcesExhausted + delta);
    } else {
        ps.resourcesReady = Math.max(0, ps.resourcesReady + delta);
    }
}

/** A Credit or Force token arrived at (`+1`) or left (`-1`) `ps`'s base. */
function countBaseToken(ps: PlayerState, id: string, delta: 1 | -1): void {
    if (isCreditToken(id)) {
        ps.credits = Math.max(0, ps.credits + delta);
    } else if (isForceToken(id)) {
        ps.hasForce = delta > 0;
    }
}

const ARENA_ZONES = new Set(['ground', 'space']);
const isArena = (z: string): boolean => ARENA_ZONES.has(z);

/**
 * Zone-list membership. Every card id is unique for the whole game (the `:N` copy suffix, spec
 * §6.1), so a list can hold an id at most once and adding is idempotent by id. That is what lets
 * a MOVE and the summary record beside it (DRAW, DISCARD, DEFEAT, PLAY_EVENT) both name the same
 * card without the card landing in the pile twice.
 */
/**
 * Zone lists are bounded by the size of a deck, so a list longer than this cannot be a real game.
 * The cap exists because this parses UNTRUSTED files in a browser: `addOnce` scans the list, so a
 * single `{"t":"DRAW","cards":[...200k unique strings...]}` would otherwise cost ~2e10 string
 * comparisons and hang the tab. Past the cap the id is dropped rather than the file rejected --
 * degrading is the fold's contract, and no honest file reaches it.
 */
function addOnce(list: string[], id: string): void {
    if (list.length >= MAX_ZONE_LIST) {
        return;
    }
    if (!list.includes(id)) {
        list.push(id);
    }
}

/**
 * The seat's resource-row membership list, created on first use. It stays ABSENT until a MOVE
 * or a keyframe supplies one, so a file written before `resources` existed folds to a state
 * with no `resources` at all rather than to a misleading empty row.
 */
function resourceList(ps: PlayerState): string[] {
    if (!Array.isArray(ps.resources)) {
        ps.resources = [];
    }
    return ps.resources;
}

/**
 * Store the active seat only when the file actually names a seat. `Seat` is erased at runtime, so
 * an unguarded write puts arbitrary JSON in a field a reader will reasonably use as
 * `players[state.active]` -- the same prototype-pollution shape `isSeat` exists to stop.
 */
function setActive(s: ReducedState, active: unknown): void {
    if (isSeat(active)) {
        s.active = active;
    }
}

function removeOne(list: string[], id: string): void {
    const i = list.indexOf(id);
    if (i >= 0) {
        list.splice(i, 1);
    }
}

/**
 * Engine truth: every zone transition is an OnCardMoved → MOVE event. handSize, the resource
 * counts, credits, the Force and the in-play `cards[]` set are therefore reconstructed from
 * MOVE (the single source of truth), NOT from DRAW/RESOURCE/PLAY, which are higher-level
 * summary records that always coincide with the underlying MOVEs (a DRAW carries the
 * cumulative count of the deck→hand MOVEs just emitted; double-counting them would
 * diverge from the keyframe). DRAW still records the omniscient `hand[]` contents and
 * PLAY/PLAY_UPGRADE still place a card so unit-level fold tests that drive PLAY without
 * a paired MOVE keep working; MOVE placement is idempotent by id so PLAY+MOVE in real
 * streams does not double-add.
 */
function applyMoveCounts(s: ReducedState, e: { card: string; from: string; to: string; p?: Seat; kind?: 'unit' | 'upgrade'; attachedTo?: string; exhausted?: boolean }): void {
    // Leaving an arena, or the capture zone, ends every attachment and every captivity of
    // this card, whatever `kind` says: a pilot's exit says `unit`, and exits name no host.
    if ((ARENA_ZONES.has(e.from) && !ARENA_ZONES.has(e.to)) || e.from === 'capture') {
        detach(s, e.card);
    }

    if (e.p == null) {
        // Without a seat we can only update zone on an already-tracked card; counts are
        // unattributable. Real engine streams always carry the seat.
        const c = findCard(s, e.card);
        if (c) {
            c.zone = e.to;
        }
        return;
    }
    const ps = player(s, e.p);
    if (!ps) {
        // Seat wasn't 1 or 2 -- a malformed or hostile file. Drop the record rather than
        // attributing its counts to an invented seat.
        return;
    }

    // Hand: the COUNT and the CONTENTS. Every MOVE names its card, so `hand[]` is exact at
    // every moment, not just at a keyframe — DRAW is only a summary of the deck→hand MOVEs
    // beside it. Before this, DRAW appended and nothing ever removed, so the "hand" was a
    // cumulative draw log that disagreed with every keyframe in every vector.
    if (e.to === 'hand' && e.from !== 'hand') {
        ps.handSize += 1;
        addOnce(ps.hand, e.card);
    } else if (e.from === 'hand' && e.to !== 'hand') {
        ps.handSize = Math.max(0, ps.handSize - 1);
        removeOne(ps.hand, e.card);
    }

    // Discard: likewise the pile's CONTENTS, in engine order. DEFEAT cannot be the author —
    // a defeated unit's MOVE to discard is emitted BEFORE its DEFEAT (R2.A.3c then R2.A.3d in
    // every vector), so by the time DEFEAT ran the card was already out of `cards[]` and the
    // pile stayed empty. The MOVE owns the pile; DEFEAT/DISCARD/PLAY_EVENT are summaries.
    if (e.to === 'discard' && e.from !== 'discard') {
        addOnce(ps.discard, e.card);
    } else if (e.from === 'discard' && e.to !== 'discard') {
        removeOne(ps.discard, e.card);
    }

    // Deck count, once a keyframe has told us where it started.
    if (typeof ps.deckSize === 'number') {
        if (e.to === 'deck' && e.from !== 'deck') {
            ps.deckSize += 1;
        } else if (e.from === 'deck' && e.to !== 'deck') {
            ps.deckSize = Math.max(0, ps.deckSize - 1);
        }
    }

    // The leader coming home: its Leader Unit side left play. The recorder writes an EXHAUST
    // beside this move when the card came back exhausted (CR 3.4.5), so nothing to guess here.
    if (e.to === 'base' && isArena(e.from)) {
        const owner = leaderOwner(s, e.card);
        if (owner?.leader) {
            owner.leader.deployed = false;
        }
    }

    // Resource row: the two COUNTS and the MEMBERSHIP. A card enters ready (an
    // EXHAUST_RESOURCES beside the move says otherwise); it leaves from whichever bucket
    // `exhausted` names. Which cards are in the row is a separate question from which of them
    // are exhausted -- the row's ready state stays counted, because no record names the
    // individual card that exhausted.
    if (e.to === 'resource' && e.from !== 'resource') {
        countResource(ps, 1, false);
        addOnce(resourceList(ps), e.card);
    } else if (e.from === 'resource' && e.to !== 'resource') {
        countResource(ps, -1, e.exhausted === true);
        removeOne(resourceList(ps), e.card);
    }

    // Credits and the Force: the only two things that live in `base` and are counted.
    if (e.to === 'base' && e.from !== 'base') {
        countBaseToken(ps, e.card, 1);
    } else if (e.from === 'base' && e.to !== 'base') {
        countBaseToken(ps, e.card, -1);
    }

    // In-play (arena) membership. An UPGRADE never has any: it attaches to a unit, and its
    // effect on the board is carried by the host's own records (SHIELD_GAIN, EXPERIENCE_GAIN,
    // STATUS_TOKEN) or by `attachedTo` here. Without `kind` a reader cannot tell a token
    // upgrade from a token unit — both are `TOKEN:<name>#<id>` — and folding the upgrade in
    // put a phantom card in the arena. The hand/resource counts above still apply: an upgrade
    // really does leave the hand.
    if (e.kind === 'upgrade') {
        if (ARENA_ZONES.has(e.to) && e.attachedTo) {
            attachTo(s, e.attachedTo, e.card);
        }
        const upgrade = findCard(s, e.card);
        if (upgrade) {
            upgrade.zone = e.to;
        }
        return;
    }

    const existing = findCard(s, e.card);
    if (ARENA_ZONES.has(e.to)) {
        if (existing) {
            existing.zone = e.to;
        } else if (ps.cards.length < MAX_ZONE_LIST) {
            // MOVE is the arena's real author (§12.1) -- PLAY only summarises -- so this is the
            // path a crafted file grows, and it must carry the same ceiling placeCard does.
            // findCard() scans every card in play, so an unbounded arena folds in O(n^2).
            ps.cards.push(newCard(e.card, e.to));
        }
    } else if (existing && ARENA_ZONES.has(existing.zone)) {
        removeFromArenas(s, e.card);
    } else if (existing) {
        existing.zone = e.to;
    }
}

/** Apply a single event to state, mutating and returning it. */
export function reduce(s: ReducedState, e: GameEvent): ReducedState {
    switch (e.t) {
        // `active` is stated rather than derived: working out whose turn it is from the last
        // action means modelling passing and priority, which is exactly the rules knowledge the
        // format exists to spare a reader. Absent leaves the previous value alone.
        case 'ROUND_START':
            s.round = e.round;
            s.initiativeTaken = false;
            setActive(s, e.active);
            break;
        case 'PHASE_START':
            s.phase = (e.phase as ReducedState['phase']);
            setActive(s, e.active);
            break;
        case 'CLAIM_INITIATIVE': s.initiative = e.p; s.initiativeTaken = true; break;
        // handSize/resourcesReady are driven by MOVE (the engine's source of truth for
        // zone transitions); see applyMoveCounts. PLAY only places the card in its zone —
        // the matching hand->zone MOVE accounts for the hand decrement.
        case 'PLAY': case 'PLAY_SMUGGLE':
            placeCard(s, e.p, e.card, e.zone ?? 'ground'); break;
        case 'PLAY_EVENT': {
            // Idempotent beside its own hand->discard MOVE, which is the pile's author.
            const ps = player(s, e.p);
            if (ps) {
                addOnce(ps.discard, e.card);
            }
            break;
        }
        case 'PLAY_UPGRADE': {
            // An upgrade is NEVER an arena card, so there is no fallback placement: if the
            // host isn't tracked the attachment is simply not modelled. Placing it instead
            // (as this used to) put a phantom "unit" in the arena that no keyframe agrees
            // with — a real upgrade, SEC#038, showed up that way in a recorded game.
            if (e.target) {
                attachTo(s, e.target, e.card);
            }
            break;
        }
        case 'DEPLOY_LEADER': {
            // The leader's status: this record names the leader (so a reader that saw no keyframe
            // yet learns which card it is), deploys it, and readies it -- a leader deploys ready
            // whatever state it was in (CR 3.4.4). An Epic Action deploy spends the Epic Action.
            const ps = player(s, e.p);
            if (ps) {
                const prev = ps.leader;
                ps.leader = {
                    id: e.card,
                    deployed: true,
                    exhausted: false,
                    epicActionUsed: (prev?.id === e.card && prev.epicActionUsed) || e.epic === true,
                };
            }
            // Deployed as a pilot: an attachment, never a body. Same rule as PLAY_UPGRADE.
            if (e.kind === 'upgrade') {
                if (e.target) {
                    attachTo(s, e.target, e.card);
                }
                break;
            }
            placeCard(s, e.p, e.card, e.zone ?? 'ground');
            break;
        }
        case 'ABILITY_ACTIVATE': {
            if (e.epic === true) {
                // A base's Epic Action and a leader's are separate abilities on separate cards.
                // The record tells them apart by its `card`: a base is `base@N` everywhere it is
                // pointed at (§6.3), so a base ref resolves straight to a seat, and anything else
                // is a card id matched against that seat's leader.
                const baseSeat = seatOfBaseRef(e.card);
                if (baseSeat != null) {
                    const ps = player(s, baseSeat);
                    if (ps) {
                        ps.baseEpicActionUsed = true;
                    }
                    break;
                }
                const owner = leaderOwner(s, e.card);
                if (owner?.leader) {
                    owner.leader.epicActionUsed = true;
                }
            }
            break;
        }
        case 'LEADER_FLIP': {
            // A double-sided leader flips IN PLACE in the base zone -- no MOVE, no deploy -- and
            // the flip changes its title, aspects and traits. `onStartingSide` is stated, not
            // toggled, so applying it is idempotent and a reader that snapped to a keyframe mid-
            // game still lands on the right face. Falls back to the seat on the record when the
            // leader's id is not yet known (no keyframe seen, no DEPLOY_LEADER -- these leaders
            // never deploy, so that is the normal case early in a file).
            const owner = leaderOwner(s, e.card) ?? player(s, e.p);
            if (owner) {
                // A double-sided leader NEVER deploys, so in a file with no keyframe yet nothing
                // has named the seat's leader and there is no record to update. Seed one from the
                // flip itself rather than dropping the face on the floor: the id is right there,
                // and a later keyframe overwrites the whole entry anyway.
                owner.leader ??= { id: e.card, deployed: false, exhausted: false, epicActionUsed: false };
                owner.leader.onStartingSide = e.onStartingSide;
            }
            break;
        }
        case 'STATS': {
            // The engine's live numbers, stated outright. Nothing here is derived.
            const c = findCard(s, e.card);
            if (c) {
                c.power = e.power;
                c.hp = e.hp;
                if (Array.isArray(e.keywords)) {
                    c.keywords = [...e.keywords].map(String).sort();
                }
            }
            break;
        }
        case 'TAKE_CONTROL': {
            // A control change moves nothing between zones, so no MOVE carries it: re-seat
            // the card here. An arena card moves between the seats' `cards` lists with its
            // state intact; a resource shifts one resource from `from` to `p`; a Credit or
            // Force token in `base` shifts one credit, or the Force, from `from` to `p`.
            const ps = player(s, e.p);
            if (!ps) {
                break;
            }
            if (e.zone === 'resource' || e.zone === 'base') {
                if (!isSeat(e.from)) {
                    break;
                }
                const fromPs = player(s, e.from);
                if (!fromPs) {
                    break;
                }
                if (e.zone === 'resource') {
                    countResource(fromPs, -1, e.exhausted === true);
                    countResource(ps, 1, e.exhausted === true);
                    // The row's MEMBERSHIP moves with the count. Without this the card stays in
                    // the losing seat's `resources` and never joins the winner's, and since every
                    // keyframe now carries `resources` the gate reports a mismatch on BOTH seats
                    // for the rest of the game.
                    removeOne(resourceList(fromPs), e.card);
                    addOnce(resourceList(ps), e.card);
                } else {
                    countBaseToken(fromPs, e.card, -1);
                    countBaseToken(ps, e.card, 1);
                }
                break;
            }
            if (!ARENA_ZONES.has(e.zone ?? '')) {
                break; // no zone (an early-1.0 note) or a zone the fold doesn't track: nothing to re-seat
            }
            for (const seat of [1, 2] as Seat[]) {
                const owner = s.players[seat];
                if (!owner || seat === e.p) {
                    continue;
                }
                const idx = owner.cards.findIndex((c) => c.id === e.card);
                if (idx >= 0) {
                    ps.cards.push(owner.cards.splice(idx, 1)[0]);
                    break;
                }
            }
            break;
        }
        case 'CAPTURE': {
            // The MOVE out of the arena already removed the card (idempotent here); the
            // captor now holds it. A base captor (`base@N`) is not modelled: nothing today
            // captures with a base, and the card is out of play either way.
            removeFromArenas(s, e.card);
            const captor = e.by ? findCard(s, e.by) : undefined;
            if (captor) {
                const captured = arr<string>(captor.captured);
                if (!captured.includes(e.card)) {
                    captured.push(e.card);
                }
                captor.captured = captured;
            }
            break;
        }
        case 'RESCUE':
            // Back to play: the paired MOVE out of `capture` places it and already detached
            // it from its captor. Detach again here so a RESCUE that arrives first is right too.
            detach(s, e.card);
            break;
        case 'CREATE_TOKEN':
            // Arena zones only. An `upgrade` token attaches and is never an arena card, and a
            // token named in any other zone is not in play yet -- placing it would put a card in
            // `cards[]` with a non-arena zone, which no keyframe agrees with. Its MOVE into the
            // arena is what puts it in play, exactly as for a printed card (§12.1 step 3).
            if (e.kind !== 'upgrade' && ARENA_ZONES.has(e.zone)) {
                placeCard(s, e.p, e.token, e.zone);
            }
            break;
        case 'EXHAUST_RESOURCES': case 'READY_RESOURCES': {
            // `amount | 0` turns a hostile non-number into 0 rather than NaN.
            const ps = player(s, e.p);
            if (ps) {
                shiftResources(ps, (e.t === 'EXHAUST_RESOURCES' ? 1 : -1) * Math.max(0, e.amount | 0));
            }
            break;
        }
        case 'DAMAGE': {
            const baseSeat = seatOfBaseRef(e.tgt);
            if (baseSeat) {
                const bp = player(s, baseSeat);
                if (bp) {
                    bp.baseHp = e.hp;
                }
            } else {
                const c = findCard(s, e.tgt);
                if (c) {
                    c.damage = Math.max(0, c.damage + e.amt);
                }
            }
            break;
        }
        case 'OVERWHELM': {
            const baseSeat = seatOfBaseRef(e.tgt);
            if (baseSeat) {
                const bp = player(s, baseSeat);
                if (bp) {
                    bp.baseHp = e.hp;
                }
            }
            break;
        }
        case 'HEAL': {
            const baseSeat = seatOfBaseRef(e.tgt);
            if (baseSeat) {
                const bp = player(s, baseSeat);
                if (bp) {
                    bp.baseHp = e.hp;
                }
            } else {
                const c = findCard(s, e.tgt);
                if (c) {
                    c.damage = Math.max(0, c.damage - e.amt);
                }
            }
            break;
        }
        case 'DEFEAT': {
            // A defeated card stops being anyone's upgrade or captive, whether or not it was
            // ever an arena card of its own (an upgrade never is).
            detach(s, e.card);
            for (const seat of [1, 2] as Seat[]) {
                const ps = s.players[seat];
                if (!ps) {
                    continue;
                }
                const idx = ps.cards.findIndex((c) => c.id === e.card);
                if (idx >= 0) {
                    // Idempotent: in a real stream the MOVE to discard already filed it, and
                    // already took it out of `cards`, so this loop finds nothing. It still runs
                    // for a fold driven by DEFEAT with no paired MOVE (unit-level tests).
                    addOnce(ps.discard, ps.cards[idx].id);
                    ps.cards.splice(idx, 1);
                }
            }
            break;
        }
        case 'EXHAUST': setExhausted(s, e.card, true); break;
        case 'READY': setExhausted(s, e.card, false); break;
        // MOVE is the single source of truth for handSize/resourcesReady and arena
        // membership (see applyMoveCounts). DRAW/DISCARD/RESOURCE no longer mutate those
        // counts — they coincide with the underlying MOVEs and would double-count.
        case 'MOVE': applyMoveCounts(s, e); break;
        case 'DRAW': {
            const ps = player(s, e.p);
            if (ps) {
                for (const c of arr<string>(e.cards)) {
                    addOnce(ps.hand, c);
                }
            }
            break;
        }
        case 'DISCARD': {
            const ps = player(s, e.p);
            if (ps) {
                for (const c of arr<string>(e.cards)) {
                    addOnce(ps.discard, c);
                }
            }
            break;
        }
        case 'RESOURCE': break;
        case 'SHIELD_GAIN': { const c = findCard(s, e.card); if (c) {
            c.shields += e.count ?? 1;
        } break; }
        case 'SHIELD_USE': { const c = findCard(s, e.card); if (c) {
            c.shields = Math.max(0, c.shields - (e.count ?? 1));
        } break; }
        // `count` may be negative: a token leaving its host is recorded as the same event with a
        // negative delta (see SwuPgnRecorder.tokenRecord). Counts clamp at 0, and a status token
        // that reaches 0 is DELETED rather than left as `{advantage: 0}` — an engine keyframe
        // reports a host with no tokens as `statusTokens: {}`, and the integrity gate compares
        // the two by JSON equality.
        case 'EXPERIENCE_GAIN': { const c = findCard(s, e.card); if (c) {
            c.experience = Math.max(0, c.experience + e.count);
        } break; }
        case 'STATUS_TOKEN': {
            const c = findCard(s, e.card);
            if (c) {
                const next = Math.max(0, (c.statusTokens[e.token] ?? 0) + e.count);
                c.statusTokens = Object.fromEntries(
                    Object.entries({ ...c.statusTokens, [e.token]: next }).filter(([, n]) => n > 0)
                );
            }
            break;
        }
        // Pure-log events with no state delta:
        case 'ATTACK': case 'PASS': case 'CHOICE': case 'MULLIGAN':
        case 'KEEP_HAND': case 'MODAL_CHOICE': case 'SHUFFLE':
        case 'SEARCH': case 'REVEAL':
        case 'TRIGGER': case 'PHASE_END': case 'ROUND_END': case 'GAME_END':
        // UNDO is a note ABOUT the file, not an event in the game: the records it retracted were
        // removed, so there is nothing left to undo when folding.
        case 'UNDO':
            break;
        default: { const _exhaustive: never = e; void _exhaustive; break; }
    }
    return s;
}

/** Fold `events[start..end]` (inclusive) onto `s`. */
function foldRange(events: GameEvent[], start: number, end: number, s: ReducedState): ReducedState {
    for (let i = start; i <= end; i++) {
        const e = events[i];
        // A keyframe is authoritative: snap to it, then continue folding. A damaged one is
        // ignored (spec §13) and the event falls through to its ordinary rule.
        if (hasSnapKeyframe(e)) {
            s = snapTo(e.keyframe);
            continue;
        }
        s = reduce(s, e);
    }
    return s;
}

export function fold(events: GameEvent[]): ReducedState {
    return foldRange(events, 0, events.length - 1, emptyState());
}

/**
 * Fold up to and including `seq`.
 *
 * Starts from the last usable keyframe at or before `seq` rather than from the beginning:
 * everything before a keyframe is disposable, and a replay scrubber calls this once per
 * position, which made a full scrub O(n^2) in the stream length.
 */
export function stateAt(events: GameEvent[], seq: string): ReducedState {
    const idx = events.findIndex((e) => e.seq === seq);
    // An unknown seq folds the whole list. That is the DOCUMENTED contract (spec §12.3), not an
    // oversight: an adversarial review flagged the fallback as a silent wrong answer, which it
    // is, but it is normative and external readers are built on it. The dangling-reference case
    // that motivated the objection is closed at its source instead -- the writer no longer
    // coalesces away a seq anything still points at (see coalesceResourceReadies).
    const end = idx >= 0 ? idx : events.length - 1;
    for (let i = end; i >= 0; i--) {
        const e = events[i];
        if (hasSnapKeyframe(e)) {
            return foldRange(events, i + 1, end, snapTo(e.keyframe));
        }
    }
    return foldRange(events, 0, end, emptyState());
}
