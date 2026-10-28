import type { AbilityUse, ActiveEffect, GameEvent, LimitPer, ReducedState, PlayerState, CardInstanceState, Seat } from './types';
import { RESERVED_KEYS } from './parse';
import { tokenNameOf } from './ids';

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

/**
 * The seat whose leader is `id`, if a keyframe or a DEPLOY_LEADER has told us. A record with no
 * `card` names no leader: without the guard `undefined` matched the first seat with no leader yet.
 */
function leaderOwner(s: ReducedState, id: string): PlayerState | undefined {
    if (typeof id !== 'string') {
        return undefined;
    }
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
        // A keyframe is snapped to wholesale, so its lists bypass the MAX_ZONE_LIST cap that
        // bounds everything the fold grows itself -- and every later DEFEAT or exit scans them.
        // A list no real game can reach is a damaged checkpoint, not a board.
        const optional = [ps.baseUpgrades, ps.baseCaptured, ps.resources, ps.foreignResources].filter((l) => l !== undefined);
        if (![ps.cards, ps.hand, ps.discard, ...optional].every((l) => Array.isArray(l) && l.length <= MAX_ZONE_LIST)) {
            return false;
        }
        // Every card the fold later dereferences must actually carry the list it dereferences.
        // `upgrades` was checked nowhere: a keyframe card of `{id, zone}` passed as "complete",
        // the fold snapped to it, and the next exit from that arena crashed in detach() on
        // `c.upgrades.indexOf`. A keyframe is snapped to WHOLESALE, so a half-shaped card in one
        // is not a detail to tolerate -- it is a damaged checkpoint (spec §13).
        if (!ps.cards.every(isCompleteKeyframeCard)) {
            return false;
        }
        // `abilityUses` is optional too, but when present a later ABILITY_ACTIVATE matches into it
        // by card and ability and adds to its count, so every entry must carry all three.
        const uses = ps.abilityUses as unknown;
        if (uses !== undefined && (!Array.isArray(uses) || uses.length > MAX_ZONE_LIST || !uses.every(isCompleteAbilityUse))) {
            return false;
        }
    }
    // `effects` is optional (a file older than it), but when present every entry is an effect the
    // fold may later end by id or by target: a list of capped size, each with a string id and,
    // if any, a capped list of targets.
    const effects = (k as { effects?: unknown }).effects;
    if (effects !== undefined) {
        if (!Array.isArray(effects) || effects.length > MAX_ZONE_LIST) {
            return false;
        }
        for (const fx of effects as unknown[]) {
            const targets = typeof fx === 'object' && fx !== null ? (fx as { targets?: unknown }).targets : undefined;
            if (typeof fx !== 'object' || fx === null || typeof (fx as { id?: unknown }).id !== 'string' ||
              (targets !== undefined && (!Array.isArray(targets) || targets.length > MAX_ZONE_LIST))) {
                return false;
            }
        }
    }
    return true;
}

/**
 * A keyframe card carries everything later records dereference or add to: the `upgrades` list
 * (capped like every list), the `statusTokens` map STATUS_TOKEN indexes into, and the counters
 * DAMAGE, SHIELD_* and EXPERIENCE_GAIN do arithmetic on. `captured` may be absent (a file older
 * than the field), but when present it is a capped list too: `captured: 5` used to pass, and the
 * renderer threw iterating it.
 */
function isCompleteKeyframeCard(c: unknown): boolean {
    if (typeof c !== 'object' || c === null) {
        return false;
    }
    const card = c as Partial<CardInstanceState>;
    const tokens = card.statusTokens as unknown;
    const captured = card.captured as unknown;
    // `upgradeControllers` is optional, but a later TAKE_CONTROL of an upgrade or of its host
    // reads and rewrites it, so when present it is a map, not a list or a scalar.
    const controllers = card.upgradeControllers as unknown;
    return Array.isArray(card.upgrades) && card.upgrades.length <= MAX_ZONE_LIST &&
      (captured === undefined || (Array.isArray(captured) && captured.length <= MAX_ZONE_LIST)) &&
      (controllers === undefined || (typeof controllers === 'object' && controllers !== null && !Array.isArray(controllers))) &&
      typeof tokens === 'object' && tokens !== null && !Array.isArray(tokens) &&
      typeof card.damage === 'number' && typeof card.shields === 'number' && typeof card.experience === 'number';
}

/** A keyframe `abilityUses` entry the fold can match and count on. */
function isCompleteAbilityUse(u: unknown): boolean {
    if (typeof u !== 'object' || u === null) {
        return false;
    }
    const use = u as Partial<AbilityUse>;
    return typeof use.card === 'string' && typeof use.ability === 'string' && typeof use.count === 'number';
}

/** True for a ROUND_START/ROUND_END that carries a keyframe a reader may snap to. */
export function hasSnapKeyframe(e: GameEvent): e is GameEvent & { keyframe: ReducedState } {
    return (e.t === 'ROUND_START' || e.t === 'ROUND_END') && isCompleteKeyframe(e.keyframe);
}

/**
 * A fresh copy of a keyframe to fold on from. A card from a file older than `captured` gets an
 * empty list, the shape `newCard` gives every card, so a consumer never meets it undefined.
 */
export function snapTo(k: ReducedState): ReducedState {
    const s = JSON.parse(JSON.stringify(k)) as ReducedState;
    for (const seat of [1, 2] as Seat[]) {
        for (const c of s.players[seat]?.cards ?? []) {
            c.captured ??= [];
        }
    }
    return s;
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
 * `credits` and `hasForce`. They are recognised by the name part of their `TOKEN:` id
 * (`tokenNameOf`, which the validator reads too), not by a card database, because the format
 * defines the two fields and so must define what feeds them.
 */
function isCreditToken(id: string): boolean {
    return tokenNameOf(id) === 'credit';
}
function isForceToken(id: string): boolean {
    return tokenNameOf(id) === 'the-force';
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

/** A record's `count`, or `fallback` when the file gives something that is not a finite number. */
function countOr(count: unknown, fallback: number): number {
    return typeof count === 'number' && Number.isFinite(count) ? count : fallback;
}

function newCard(id: string, zone: string): CardInstanceState {
    return { id, zone, damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {}, captured: [] };
}

/**
 * Hard ceiling on any per-seat list the fold grows from an untrusted file: arena cards, hand,
 * discard, resources. A real game never comes close; a crafted one is trying to make a reader
 * do unbounded work. Past it, records are dropped rather than folded.
 */
export const MAX_ZONE_LIST = 1000;

/**
 * Put a card in an arena, ONCE.
 *
 * Placement is idempotent by id because a real stream reports the same arrival twice: the
 * engine emits the zone transition as a MOVE (the fold's source of truth) and a PLAY /
 * PLAY_SMUGGLE / DEPLOY_LEADER summary beside it. Pushing on both duplicated every unit in
 * play — invisible while keyframes kept snapping the state back, but wrong for `stateAt()`
 * anywhere between two keyframes, which is exactly what a replay scrubber asks for.
 */
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
    if (host) {
        addOnce(host.upgrades, id);
    }
}

/**
 * Take `id` off every card's `upgrades` and `captured` lists, and off every base's captives.
 * Keyed on the zone transition (a card left an arena, or the capture zone), not on `kind`: a
 * pilot's exit says `kind: "unit"`, and no exit record names a host (spec §10.1).
 */
function detach(s: ReducedState, id: string): void {
    for (const seat of [1, 2] as Seat[]) {
        const held = s.players[seat]?.baseCaptured;
        if (Array.isArray(held)) {
            removeOne(held, id);
        }
        for (const c of s.players[seat]?.cards ?? []) {
            const u = c.upgrades.indexOf(id);
            if (u >= 0) {
                c.upgrades.splice(u, 1);
            }
            // Off its host, an upgrade has no entry in the host's controllers either.
            if (c.upgradeControllers && Object.prototype.hasOwnProperty.call(c.upgradeControllers, id)) {
                Reflect.deleteProperty(c.upgradeControllers, id);
                if (Object.keys(c.upgradeControllers).length === 0) {
                    delete c.upgradeControllers;
                }
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

/**
 * The seat's base-upgrade list, created on first use. Like `resources`, it stays ABSENT until a
 * move or a keyframe supplies one, so a file written before `baseUpgrades` existed folds to a
 * state with no `baseUpgrades` rather than to a base that misleadingly holds nothing.
 */
function baseUpgradeList(ps: PlayerState): string[] {
    if (!Array.isArray(ps.baseUpgrades)) {
        ps.baseUpgrades = [];
    }
    return ps.baseUpgrades;
}

/**
 * Attach a printed upgrade to seat `seat`'s base, once (Fortify). The attaching MOVE and the
 * PLAY_UPGRADE beside it both name the base, so this is idempotent. Token upgrades never attach
 * to a base, and the two reserved base tokens (credits, the Force) are counted, not attached.
 */
function attachToBase(s: ReducedState, seat: Seat, id: string): void {
    if (isTokenId(id)) {
        return;
    }
    const ps = player(s, seat);
    if (ps) {
        addOnce(baseUpgradeList(ps), id);
    }
}

/** Take `id` off every seat's base. Keyed on the zone transition, like `detach`: exits name no host. */
function detachFromBases(s: ReducedState, id: string): void {
    for (const seat of [1, 2] as Seat[]) {
        const list = s.players[seat]?.baseUpgrades;
        if (Array.isArray(list)) {
            removeOne(list, id);
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

/** A zone whose arrival puts a card in play: `ground` or `space`. */
export const isArena = (z: string): boolean => ARENA_ZONES.has(z);

/**
 * Zone-list membership. Every card id is unique for the whole game (the `:N` copy suffix, spec
 * §6.1), so a list can hold an id at most once and adding is idempotent by id. That is what lets
 * a MOVE and the summary record beside it (DRAW, DISCARD, DEFEAT, PLAY_EVENT) both name the same
 * card without the card landing in the pile twice.
 *
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

/** The string ids of an untrusted `targets` value, capped like every list the fold grows. */
function targetList(x: unknown): string[] {
    return arr<unknown>(x).filter((t): t is string => typeof t === 'string')
        .slice(0, MAX_ZONE_LIST);
}

/**
 * EFFECT_START: add the effect, in start order. The list is created by the first one, so a file
 * written before effects existed folds with no `effects` at all ("not recorded", spec §11). A
 * repeated id replaces the effect in place rather than listing it twice.
 */
function startEffect(s: ReducedState, e: Extract<GameEvent, { t: 'EFFECT_START' }>): void {
    if (typeof e.id !== 'string' || typeof e.src !== 'string' || !isSeat(e.p) || typeof e.duration !== 'string') {
        return;
    }
    const fx: ActiveEffect = {
        id: e.id, src: e.src, p: e.p,
        ...(Array.isArray(e.targets) ? { targets: targetList(e.targets) } : {}),
        ...(isSeat(e.seat) ? { seat: e.seat } : {}),
        duration: e.duration,
    };
    const effects = s.effects ??= [];
    const at = effects.findIndex((x) => x.id === e.id);
    if (at >= 0) {
        effects[at] = fx;
    } else if (effects.length < MAX_ZONE_LIST) {
        effects.push(fx);
    }
}

/**
 * EFFECT_END: without `targets` the effect is gone; with them only those targets leave it, and an
 * effect left with no targets is gone too. The fold never drops a target on its own: a target
 * leaving play is the writer's partial EFFECT_END to state (spec §10.1).
 */
function endEffect(s: ReducedState, e: Extract<GameEvent, { t: 'EFFECT_END' }>): void {
    const effects = s.effects;
    const at = effects ? effects.findIndex((x) => x.id === e.id) : -1;
    if (!effects || at < 0) {
        return;
    }
    const gone = targetList(e.targets);
    const fx = effects[at];
    if (gone.length === 0) {
        effects.splice(at, 1);
        return;
    }
    if (!fx.targets) {
        return;
    }
    fx.targets = fx.targets.filter((t) => !gone.includes(t));
    if (fx.targets.length === 0) {
        effects.splice(at, 1);
    }
}

/** The `per` values this reader knows (spec §6.4). A newer minor version may add one (§18). */
const LIMIT_PERS: ReadonlySet<string> = new Set<LimitPer>(['phase', 'round', 'game']);

/**
 * ABILITY_ACTIVATE with `limit`: one more use of (`card`, `ability`) for seat `p`. The list is
 * created by the first one, so a file with no limited abilities folds with no `abilityUses`
 * ("not recorded", spec §11). Ignored unless `card` and `ability` are strings, `p` is a seat and
 * `per` is a value this reader knows: one it does not know has a reset point it cannot apply.
 */
function countUse(s: ReducedState, e: Extract<GameEvent, { t: 'ABILITY_ACTIVATE' }>): void {
    const limit = e.limit as { per?: unknown; max?: unknown } | undefined;
    const per = limit?.per;
    const max = typeof limit?.max === 'number' && Number.isFinite(limit.max) ? limit.max : 0;
    if (typeof per !== 'string' || !LIMIT_PERS.has(per) || typeof e.card !== 'string' || typeof e.ability !== 'string') {
        return;
    }
    const ps = player(s, e.p);
    if (!ps) {
        return;
    }
    const uses = ps.abilityUses ??= [];
    const held = uses.find((u) => u.card === e.card && u.ability === e.ability);
    if (held) {
        held.count += 1;
        held.per = per as LimitPer;
        held.max = max;
    } else if (uses.length < MAX_ZONE_LIST) {
        uses.push({ card: e.card, ability: e.ability, count: 1, per: per as LimitPer, max });
    }
}

/**
 * ABILITY_RESET: `card`'s uses were reset off the `per` boundary (it changed zone and is a new
 * object). Removes every seat's entries for `card`, only the one for `ability` when it is a string.
 * A seat without the list keeps none.
 */
function resetUses(s: ReducedState, e: Extract<GameEvent, { t: 'ABILITY_RESET' }>): void {
    if (typeof e.card !== 'string') {
        return;
    }
    const only = typeof e.ability === 'string' ? e.ability : undefined;
    for (const seat of [1, 2] as Seat[]) {
        const ps = s.players[seat];
        if (ps && Array.isArray(ps.abilityUses)) {
            ps.abilityUses = ps.abilityUses.filter((u) => u.card !== e.card || (only !== undefined && u.ability !== only));
        }
    }
}

/**
 * Drop every seat's uses whose `per` is in `pers`: `PHASE_START` clears `phase`, `ROUND_START`
 * clears `phase` and `round` (spec §12.2). A seat with no list keeps none.
 */
export function clearAbilityUses(s: ReducedState, pers: readonly LimitPer[]): void {
    for (const seat of [1, 2] as Seat[]) {
        const ps = s.players[seat];
        if (ps && Array.isArray(ps.abilityUses)) {
            ps.abilityUses = ps.abilityUses.filter((u) => !pers.includes(u.per));
        }
    }
}

function removeOne(list: string[], id: string): void {
    const i = list.indexOf(id);
    if (i >= 0) {
        list.splice(i, 1);
    }
}

/** The seat whose `cards` hold `id`, if any. */
function seatHolding(s: ReducedState, id: string): Seat | undefined {
    return ([1, 2] as Seat[]).find((seat) => s.players[seat]?.cards.some((c) => c.id === id));
}

/** The arena card that has `id` among its `upgrades`, and the seat that holds it. */
function hostOf(s: ReducedState, id: string): { host: CardInstanceState; seat: Seat } | undefined {
    for (const seat of [1, 2] as Seat[]) {
        const host = s.players[seat]?.cards.find((c) => c.upgrades.includes(id));
        if (host) {
            return { host, seat };
        }
    }
    return undefined;
}

/**
 * Record that upgrade `id` on `host` (held by `hostSeat`) is controlled by `controller`: listed in the
 * host's `upgradeControllers` when that is not the host's seat, taken off it when it is, and the map
 * dropped once empty so a host with no foreign upgrade carries none (spec §11). The id comes from the
 * file and becomes a key, so a reserved name is never written and the key is defined, not assigned (§23).
 */
function setUpgradeController(host: CardInstanceState, hostSeat: Seat, id: string, controller: Seat): void {
    if (RESERVED_KEYS.has(id)) {
        return;
    }
    const map = host.upgradeControllers;
    if (controller !== hostSeat) {
        const next = map ?? {};
        Object.defineProperty(next, id, { value: controller, enumerable: true, writable: true, configurable: true });
        host.upgradeControllers = next;
    } else if (map && Object.prototype.hasOwnProperty.call(map, id)) {
        Reflect.deleteProperty(map, id);
    }
    if (host.upgradeControllers && Object.keys(host.upgradeControllers).length === 0) {
        delete host.upgradeControllers;
    }
}

/**
 * Upgrade `id` just attached to `hostId` is controlled by `controller` (the attaching record's `p`):
 * note it on the host when the host is tracked and holds it. A token upgrade is never in `upgrades`,
 * so it is never noted.
 */
function noteUpgradeController(s: ReducedState, hostId: string, id: string, controller: unknown): void {
    const seat = seatHolding(s, hostId);
    const host = seat ? s.players[seat]?.cards.find((c) => c.id === hostId) : undefined;
    if (seat && host && isSeat(controller) && host.upgrades.includes(id)) {
        setUpgradeController(host, seat, id, controller);
    }
}

/** The seat's foreign-resource list, created on first use like `resources` (absent = not recorded). */
function foreignList(ps: PlayerState): string[] {
    if (!Array.isArray(ps.foreignResources)) {
        ps.foreignResources = [];
    }
    return ps.foreignResources;
}

/** Set `owner` on an arena entry, or drop it when the owner is the seat that holds the entry. */
function setOwner(c: CardInstanceState, holder: Seat, owner: Seat): void {
    if (owner === holder) {
        delete c.owner;
    } else {
        c.owner = owner;
    }
}

/**
 * The seat whose pile a card LEAVES: `p`'s if it holds the card, else the other seat's, else `p`'s.
 * `p` is the card's controller as the move is recorded, which is not always the pile's owner --
 * Stolen AT-Hauler is played by the opponent out of its owner's discard -- and a pile only ever
 * holds its owner's cards. A copy's id is unique, so whichever pile holds it is the right one.
 * Arriving cards need no lookup: the writer records the owner's seat on a move into a pile.
 */
function holder(s: ReducedState, seat: Seat, ps: PlayerState, id: string, pile: (x: PlayerState) => string[] | undefined): PlayerState {
    if (pile(ps)?.includes(id)) {
        return ps;
    }
    const other = s.players[seat === 1 ? 2 : 1];
    return other && pile(other)?.includes(id) ? other : ps;
}

/**
 * Engine truth: every zone transition is an OnCardMoved → MOVE event. handSize, the resource
 * counts, credits, the Force and the in-play `cards[]` set are therefore reconstructed from
 * MOVE (the single source of truth), NOT from DRAW/RESOURCE/PLAY, which are higher-level
 * summary records that always coincide with the underlying MOVEs (a DRAW carries the
 * cumulative count of the deck→hand MOVEs just emitted; double-counting them would
 * diverge from the keyframe). `hand[]` and `discard[]` contents are MOVE-driven too; DRAW
 * is only a summary of the deck→hand MOVEs beside it. PLAY/PLAY_UPGRADE still place a card so unit-level fold tests that drive PLAY without
 * a paired MOVE keep working; MOVE placement is idempotent by id so PLAY+MOVE in real
 * streams does not double-add.
 */
function applyMoveCounts(s: ReducedState, e: { card: string; from: string; to: string; p?: Seat; kind?: 'unit' | 'upgrade'; attachedTo?: string; exhausted?: boolean }): void {
    // Leaving an arena, or the capture zone, ends every attachment and every captivity of
    // this card, whatever `kind` says: a pilot's exit says `unit`, and exits name no host.
    if ((ARENA_ZONES.has(e.from) && !ARENA_ZONES.has(e.to)) || e.from === 'capture') {
        detach(s, e.card);
    }

    // A base's own attachments (Fortify), by the same two rules: leaving `base` ends the
    // attachment whatever the record says, and arriving as an upgrade attaches it to the base
    // `attachedTo` names. Neither needs `p` -- the base ref names the seat -- but a writer that
    // predates `attachedTo` on base moves is read by its `p`.
    if (e.from === 'base' && e.to !== 'base') {
        detachFromBases(s, e.card);
    } else if (e.to === 'base' && e.from !== 'base' && e.kind === 'upgrade') {
        const seat = (e.attachedTo != null ? seatOfBaseRef(e.attachedTo) : null) ?? e.p;
        if (seat != null) {
            attachToBase(s, seat, e.card);
        }
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
    // The card's owner, when the pile it leaves says it is not `p`'s: the other seat's hand,
    // discard or row held it, or `p`'s row held it as a foreign resource. A unit that arrives in
    // an arena this way is recorded with that owner (spec §12.1, "Whose pile").
    let ownerSeat: Seat | undefined;
    const otherSeat: Seat = e.p === 1 ? 2 : 1;

    // Hand: the COUNT and the CONTENTS. Every MOVE names its card, so `hand[]` is exact at
    // every moment, not just at a keyframe — DRAW is only a summary of the deck→hand MOVEs
    // beside it. Before this, DRAW appended and nothing ever removed, so the "hand" was a
    // cumulative draw log that disagreed with every keyframe in every vector.
    if (e.to === 'hand' && e.from !== 'hand') {
        ps.handSize += 1;
        addOnce(ps.hand, e.card);
    } else if (e.from === 'hand' && e.to !== 'hand') {
        const from = holder(s, e.p, ps, e.card, (x) => x.hand);
        from.handSize = Math.max(0, from.handSize - 1);
        removeOne(from.hand, e.card);
        ownerSeat = from.seat;
    }

    // Discard: likewise the pile's CONTENTS, in engine order. DEFEAT cannot be the author —
    // a defeated unit's MOVE to discard is emitted BEFORE its DEFEAT (R2.A.3c then R2.A.3d in
    // every vector), so by the time DEFEAT ran the card was already out of `cards[]` and the
    // pile stayed empty. The MOVE owns the pile; DEFEAT/DISCARD/PLAY_EVENT are summaries.
    if (e.to === 'discard' && e.from !== 'discard') {
        addOnce(ps.discard, e.card);
    } else if (e.from === 'discard' && e.to !== 'discard') {
        const from = holder(s, e.p, ps, e.card, (x) => x.discard);
        removeOne(from.discard, e.card);
        ownerSeat = from.seat;
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
    // The mirror: a leader that reaches an arena from its base is a Leader Unit in play, whether
    // or not a DEPLOY_LEADER was written (CR 3.4.4.b puts one into play without deploying).
    if (e.from === 'base' && ARENA_ZONES.has(e.to)) {
        const owner = leaderOwner(s, e.card);
        if (owner?.leader) {
            owner.leader.deployed = true;
        }
    }

    // Resource row: the two COUNTS and the MEMBERSHIP. A card enters ready unless the move
    // says `exhausted` (a regroup resource does, CR 5.5.1.c); it leaves from whichever bucket
    // `exhausted` names. Which cards are in the row is a separate question from which of them
    // are exhausted -- the row's ready state stays counted, because no record names the
    // individual card that exhausted.
    if (e.to === 'resource' && e.from !== 'resource') {
        countResource(ps, 1, e.exhausted === true);
        addOnce(resourceList(ps), e.card);
    } else if (e.from === 'resource' && e.to !== 'resource') {
        const from = holder(s, e.p, ps, e.card, (x) => x.resources);
        countResource(from, -1, e.exhausted === true);
        removeOne(resourceList(from), e.card);
        const foreign = Array.isArray(from.foreignResources) && from.foreignResources.includes(e.card);
        if (foreign) {
            removeOne(from.foreignResources as string[], e.card);
        }
        ownerSeat = foreign ? (from.seat === 1 ? 2 : 1) : from.seat;
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
            // An upgrade has one host. One that arrives naming a host comes off any other (moved
            // between hosts across arenas), and a unit in play that is attached as a pilot stops
            // being a unit: arena `cards[]` holds units only, as the keyframe does.
            detach(s, e.card);
            removeFromArenas(s, e.card);
            attachTo(s, e.attachedTo, e.card);
            // `p` is the upgrade's controller as it attaches (§12.1, "Whose pile").
            noteUpgradeController(s, e.attachedTo, e.card, e.p);
        }
        const upgrade = findCard(s, e.card);
        if (upgrade) {
            upgrade.zone = e.to;
        }
        return;
    }

    // A unit is never anyone's upgrade. A pilot ejected from a space vehicle moves
    // space -> ground, arena to arena, so the exit rule above never detached it.
    if (ARENA_ZONES.has(e.to)) {
        detach(s, e.card);
    }
    const existing = findCard(s, e.card);
    if (ARENA_ZONES.has(e.to)) {
        if (existing) {
            existing.zone = e.to;
            // A PLAY written before its MOVE already placed the entry, without an owner.
            if (ownerSeat === otherSeat) {
                existing.owner = otherSeat;
            }
        } else if (ps.cards.length < MAX_ZONE_LIST) {
            // MOVE is the arena's real author (§12.1) -- PLAY only summarises -- so this is the
            // path a crafted file grows, and it must carry the same ceiling placeCard does.
            // findCard() scans every card in play, so an unbounded arena folds in O(n^2).
            const entry = newCard(e.card, e.to);
            if (ownerSeat === otherSeat) {
                entry.owner = otherSeat;
            }
            ps.cards.push(entry);
        }
    } else if (existing && ARENA_ZONES.has(existing.zone)) {
        removeFromArenas(s, e.card);
    } else if (existing) {
        existing.zone = e.to;
    }
}

/**
 * STATS states the unit's whole attribute set (spec §10.1), so each of these is replaced: a field the
 * record carries is set, one it leaves out is removed (a blanked unit regains its text, a copy ends).
 */
function applyAttributes(c: CardInstanceState, e: Extract<GameEvent, { t: 'STATS' }>): void {
    const strings = (x: unknown): string[] | undefined => (Array.isArray(x) ? x.slice(0, MAX_ZONE_LIST).map(String) : undefined);
    const traits = strings(e.traits);
    const aspects = strings(e.aspects);
    const set = <K extends keyof CardInstanceState>(key: K, value: CardInstanceState[K] | undefined): void => {
        if (value === undefined) {
            Reflect.deleteProperty(c, key);
        } else {
            c[key] = value;
        }
    };
    set('traits', traits?.sort());
    set('blank', e.blank === true ? true : undefined);
    set('leaderUnit', e.leaderUnit === true ? true : undefined);
    set('copyOf', typeof e.copyOf === 'string' ? e.copyOf : undefined);
    set('name', typeof e.name === 'string' ? e.name : undefined);
    set('cost', typeof e.cost === 'number' && Number.isFinite(e.cost) ? e.cost : undefined);
    set('aspects', aspects);
}

/**
 * A unit entry moving from seat `from` to seat `to` (an arena TAKE_CONTROL): its owner is the seat it
 * came from unless it already names one, and a unit going home names none. Each upgrade on it keeps
 * its own controller -- the host changing hands does not change theirs -- so `upgradeControllers` is
 * rebuilt against the new seat (spec §12.2).
 */
function reseat(c: CardInstanceState, from: Seat, to: Seat): void {
    setOwner(c, to, c.owner ?? from);
    const before = c.upgradeControllers;
    delete c.upgradeControllers;
    for (const u of c.upgrades) {
        const own = before && Object.prototype.hasOwnProperty.call(before, u) && isSeat(before[u]) ? before[u] : from;
        setUpgradeController(c, to, u, own);
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
            clearAbilityUses(s, ['phase', 'round']);
            setActive(s, e.active);
            // The initiative holder is the round's first active player (CR 5.4.1.b).
            if (isSeat(e.active)) {
                s.initiative = e.active;
            }
            break;
        case 'PHASE_START':
            s.phase = (e.phase as ReducedState['phase']);
            clearAbilityUses(s, ['phase']);
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
                const baseSeat = seatOfBaseRef(e.target);
                if (baseSeat != null) {
                    // Fortify: the host is a base, which no `cards` entry stands for.
                    attachToBase(s, baseSeat, e.card);
                } else {
                    attachTo(s, e.target, e.card);
                    noteUpgradeController(s, e.target, e.card, e.p);
                }
            }
            break;
        }
        case 'DEPLOY_LEADER': {
            // The leader's status: this record names the leader (so a reader that saw no keyframe
            // yet learns which card it is), deploys it, and readies it -- a leader deploys ready
            // whatever state it was in (CR 3.4.4). An Epic Action deploy spends the Epic Action.
            // A record with no `card` (schema-invalid) names nothing to deploy, so it is dropped.
            if (typeof e.card !== 'string') {
                break;
            }
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
                    noteUpgradeController(s, e.target, e.card, e.p);
                }
                break;
            }
            placeCard(s, e.p, e.card, e.zone ?? 'ground');
            break;
        }
        case 'ABILITY_ACTIVATE': {
            // A limited ability's use is game state (CR 7.2.5, 1.16.3); `usedBy` is a note.
            if (e.limit !== undefined) {
                countUse(s, e);
            }
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
            if (typeof e.card !== 'string') {
                break; // schema-invalid: no leader to seed, and the seat alone names no face
            }
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
                applyAttributes(c, e);
            }
            break;
        }
        case 'TAKE_CONTROL': {
            // A control change moves nothing between zones, so no MOVE carries it: re-seat
            // the card here. An arena card moves between the seats' `cards` lists with its
            // state intact (and its owner noted); an attached upgrade stays on its host, whose
            // `upgradeControllers` notes the new controller; a resource shifts one resource from
            // `from` to `p`; a Credit or Force token in `base` shifts one credit, or the Force.
            const ps = player(s, e.p);
            if (!ps) {
                break;
            }
            if (e.zone === 'resource' && !isSeat(e.from)) {
                // The steal changed zone (a unit put into the row under `p`): the MOVE beside it
                // carried the counts and the membership, so only ownership is left to record, and
                // `owner` states it (spec §10.1).
                if (isSeat(e.owner) && typeof e.card === 'string') {
                    const other = s.players[e.p === 1 ? 2 : 1];
                    if (other && Array.isArray(other.foreignResources)) {
                        removeOne(other.foreignResources, e.card);
                    }
                    if (e.owner !== e.p) {
                        addOnce(foreignList(ps), e.card);
                    } else if (Array.isArray(ps.foreignResources)) {
                        removeOne(ps.foreignResources, e.card);
                    }
                }
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
                    // Ownership: a card that was foreign in the losing row goes home; any other
                    // card becomes foreign in the winning one (spec §11, `foreignResources`).
                    if (Array.isArray(fromPs.foreignResources) && fromPs.foreignResources.includes(e.card)) {
                        removeOne(fromPs.foreignResources, e.card);
                    } else {
                        addOnce(foreignList(ps), e.card);
                    }
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
                const prev = s.players[seat];
                if (!prev || seat === e.p) {
                    continue;
                }
                const idx = prev.cards.findIndex((c) => c.id === e.card);
                if (idx >= 0 && ps.cards.length < MAX_ZONE_LIST) {
                    const moved = prev.cards.splice(idx, 1)[0];
                    reseat(moved, seat, e.p);
                    ps.cards.push(moved);
                    return s;
                }
            }
            // Not a unit entry: an attached upgrade changing hands while it stays on its host.
            const held = typeof e.card === 'string' ? hostOf(s, e.card) : undefined;
            if (held) {
                setUpgradeController(held.host, held.seat, e.card, e.p);
            }
            break;
        }
        case 'CAPTURE': {
            // The MOVE out of the arena already removed the card (idempotent here); the
            // captor now holds it: a unit in its `captured`, a base (Arrest) in its seat's
            // `baseCaptured`, created on first use like `baseUpgrades`.
            removeFromArenas(s, e.card);
            // A token that leaves play ceases to exist (CR 3.7.3): nothing holds it.
            if (isTokenId(e.card)) {
                break;
            }
            const baseSeat = typeof e.by === 'string' ? seatOfBaseRef(e.by) : null;
            const holder = baseSeat != null ? player(s, baseSeat) : undefined;
            if (holder) {
                if (!Array.isArray(holder.baseCaptured)) {
                    holder.baseCaptured = [];
                }
                addOnce(holder.baseCaptured, e.card);
                break;
            }
            const captor = e.by ? findCard(s, e.by) : undefined;
            if (captor) {
                const captured = arr<string>(captor.captured);
                addOnce(captured, e.card);
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
            // A base: it is nobody's attachment and in no list; it is defeated, which its HP
            // need not show (an ability can defeat a base outright).
            const baseSeat = seatOfBaseRef(e.card);
            if (baseSeat != null) {
                const ps = player(s, baseSeat);
                if (ps) {
                    ps.baseDefeated = true;
                }
                break;
            }
            // A defeated card stops being anyone's upgrade or captive, whether or not it was
            // ever an arena card of its own (an upgrade never is) -- and that includes a base's.
            detach(s, e.card);
            detachFromBases(s, e.card);
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
            c.shields += countOr(e.count, 1);
        } break; }
        case 'SHIELD_USE': { const c = findCard(s, e.card); if (c) {
            c.shields = Math.max(0, c.shields - countOr(e.count, 1));
        } break; }
        // `count` may be negative: a token leaving its host is recorded as the same event with a
        // negative delta (see SwuPgnRecorder.tokenRecord). Counts clamp at 0, and a status token
        // that reaches 0 is DELETED rather than left as `{advantage: 0}` — an engine keyframe
        // reports a host with no tokens as `statusTokens: {}`, and the integrity gate counts a
        // zero entry as a difference.
        case 'EXPERIENCE_GAIN': { const c = findCard(s, e.card); if (c) {
            c.experience = Math.max(0, c.experience + countOr(e.count, 0));
        } break; }
        case 'STATUS_TOKEN': {
            const c = findCard(s, e.card);
            // A reserved name is refused by parse() (§23); fold() is public too, so events built
            // without parse() get the same guard: such a record does nothing.
            if (c && typeof e.token === 'string' && !RESERVED_KEYS.has(e.token)) {
                // Updated in place, on own keys only: the token name comes from the file, so it
                // must never read or write an inherited property, and copying the whole map per
                // record made a file with many token names fold in quadratic time.
                const tokens = c.statusTokens;
                const held = Object.prototype.hasOwnProperty.call(tokens, e.token);
                const next = Math.max(0, (held ? tokens[e.token] : 0) + countOr(e.count, 0));
                if (next > 0 && (held || Object.keys(tokens).length < MAX_ZONE_LIST)) {
                    Object.defineProperty(tokens, e.token, { value: next, enumerable: true, writable: true, configurable: true });
                } else if (held && next === 0) {
                    Reflect.deleteProperty(tokens, e.token);
                }
            }
            break;
        }
        case 'EFFECT_START': startEffect(s, e); break;
        case 'EFFECT_END': endEffect(s, e); break;
        case 'ABILITY_RESET': resetUses(s, e); break;
        // Pure-log events with no state delta:
        case 'ATTACK': case 'PASS': case 'CHOICE': case 'MULLIGAN':
        case 'KEEP_HAND': case 'MODAL_CHOICE': case 'SHUFFLE':
        case 'SEARCH': case 'REVEAL': case 'LOOK': case 'NAME':
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
