import type { Game } from '../Game';
import { CardType, EventName, PhaseName, PlayType, ZoneName } from '../Constants';
import { DefeatSourceType } from '../../IDamageOrDefeatSource';
import { logger } from '../../../logger';
import type { Header, GameEvent, ReducedState, Seat, SetupInitRecord } from '../../../../swupgn/src/types';
import { saltedPlayerId, anonymizePlayerLabel } from './swuPgnIdentity';

export interface HeaderContext {
    gameId: string;
    date: string;            // ISO-8601 UTC
    format?: string;
    cardPool: string;
    engineVersion: string;   // "forceteki@<version>"
    seed: string;
    perspective: 'P1' | 'P2' | null;
    rounds: number;
    result: 'P1' | 'P2' | 'Draw' | 'Incomplete';
    reason: string;
    p1: { username: string; leader: string; base: string };
    p2: { username: string; leader: string; base: string };
}

export function buildHeader(ctx: HeaderContext): Header {
    return {
        game: 'SWU-PGN/1.0',
        gameId: ctx.gameId,
        date: ctx.date,
        format: ctx.format,
        cardPool: ctx.cardPool,
        engine: ctx.engineVersion,
        seed: ctx.seed,
        perspective: ctx.perspective,
        p1Id: saltedPlayerId(ctx.p1.username, ctx.gameId),
        p2Id: saltedPlayerId(ctx.p2.username, ctx.gameId),
        p1: anonymizePlayerLabel(1),
        p2: anonymizePlayerLabel(2),
        p1Leader: ctx.p1.leader, p1Base: ctx.p1.base,
        p2Leader: ctx.p2.leader, p2Base: ctx.p2.base,
        result: ctx.result, reason: ctx.reason, rounds: ctx.rounds,
    };
}

/**
 * Maps engine identities to the stable, anonymized identifiers used by SWU-PGN/1.0.
 * The Game-side implementation (Task 10) owns copy-suffix logic and the omniscient
 * keyframe/deck-order projections; the recorder only needs uuid->id and playerId->seat.
 *
 * `reducedState`/`deckOrder` are the omniscient projections required to emit round
 * keyframes and the SETUP INIT record. They are optional so the recorder stays usable
 * with just `{ cardId, seat }` (unit tests, partial setups); when absent the recorder
 * emits a valid ROUND_START with no keyframe and recordInit() is a safe no-op.
 */
export interface SwuPgnResolver {
    cardId(uuid: string): string;
    seat(playerId: string): Seat;
    reducedState?(round: number): ReducedState;                 // engine board → 1.1 reduced state
    deckOrder?(): { p1: string[]; p2: string[] };               // initial deck order after shuffle
}

/**
 * What a card is, for the fold's arena-membership decision.
 *
 * Read from the card TYPE rather than from isShield/isExperience/isAdvantage predicates, so
 * it is right for every token — including Weakness (a token upgrade matching none of those
 * predicates) and any upgrade token printed in future.
 */
export function cardKind(card: any): 'unit' | 'upgrade' | undefined {
    try {
        if (card?.isUpgrade?.()) {
            return 'upgrade';
        }
        if (card?.isUnit?.()) {
            return 'unit';
        }
    } catch {
        // fall through: an unclassifiable card simply omits `kind`
    }
    return undefined;
}

/** The three token-upgrade kinds the fold models, each with its own gain/removal record. */
type TokenUpgradeKind = 'shield' | 'experience' | 'advantage';

/**
 * Classify a token-upgrade card. Returns null for a normally-played (non-token) upgrade,
 * which is covered by PLAY_UPGRADE and must not produce a token record.
 */
function tokenUpgradeKind(upgrade: any): TokenUpgradeKind | null {
    if (upgrade?.isShield?.()) {
        return 'shield';
    }
    if (upgrade?.isExperience?.()) {
        return 'experience';
    }
    if (upgrade?.isAdvantage?.()) {
        return 'advantage';
    }
    return null;
}

/**
 * Emits SWU-PGN/1.0 `GameEvent`s by subscribing to engine events. Every handler is
 * wrapped in try/catch with rate-limited error logging so a recording bug can never
 * crash gameplay.
 */
export class SwuPgnRecorder {
    private readonly game: Game;
    private readonly resolver: SwuPgnResolver;
    private readonly events: GameEvent[] = [];

    /** %%% SETUP section records (currently the INIT deck-order record). */
    private readonly setup: (SetupInitRecord | GameEvent)[] = [];

    /** Current round number. */
    private currentRound: number = 0;

    /** Current phase abbreviation: 'S', 'A', or 'G' (port of v1.0 scheme). */
    private currentPhase: string = 'S';

    /** Incremented for top-level player actions during the Action Phase. */
    private actionCounter: number = 0;

    /** Incremented for events in Setup/Regroup phases. */
    private phaseEventCounter: number = 0;

    /** Incremented for sub-events within an action; reset when actionCounter increments. */
    private subEventCounter: number = 0;

    /** Caps repeated recorder-error logging so a broken handler can't flood the logs. */
    private static readonly maxLoggedErrors = 20;
    private loggedErrorCount = 0;

    /**
     * Remembers which unit each token-upgrade is attached to, and what kind it is
     * (token uuid → { parent unit object, kind }).
     *
     * Needed for every token REMOVAL record. A token-upgrade is removed by being defeated, but
     * DefeatCardSystem unattaches the upgrade in its eventHandler before our OnCardDefeated
     * `.on()` listener runs, so the token's parentCard is already null by then. We capture the
     * parent at attach time instead.
     *
     * This used to hold shields only, which is why SHIELD_USE was emitted but experience and
     * advantage were never decremented: a reader folding the stream kept every Advantage token
     * on its host for the rest of the replay. All three token kinds now round-trip.
     */
    private readonly tokenParents = new Map<string, { parent: any; kind: TokenUpgradeKind }>();

    /**
     * Rollback checkpoints (array lengths + counters + tokenParents snapshot) keyed by
     * snapshot id, so the recorder rewinds in lockstep with the game on undo.
     * tokenParents is captured here because a
     * rollback that rewinds past a token attach without restoring the map would make a
     * later removal record miss its parent.
     */
    private readonly checkpoints: {
        snapshotId: number;
        eventsLen: number;
        setupLen: number;
        currentRound: number;
        currentPhase: string;
        actionCounter: number;
        phaseEventCounter: number;
        subEventCounter: number;
        loggedErrorCount: number;
        tokenParents: [string, { parent: any; kind: TokenUpgradeKind }][];
    }[] = [];

    public constructor(game: Game, resolver: SwuPgnResolver) {
        this.game = game;
        this.resolver = resolver;
        this.registerListeners();
    }

    // ── Public interface ──────────────────────────────────────────────────────

    public getEvents(): GameEvent[] {
        return this.events;
    }

    public getSetup(): (SetupInitRecord | GameEvent)[] {
        return this.setup;
    }

    /**
     * Record the `%%% SETUP` INIT entry: the post-shuffle initial deck order for both players.
     * Sourced from the omniscient `resolver.deckOrder()` projection (Task 10). No-op when the
     * resolver does not provide deckOrder (e.g. unit fakes built with just `{ cardId, seat }`).
     */
    public recordInit(): void {
        try {
            if (!this.resolver.deckOrder) {
                return;
            }
            const { p1, p2 } = this.resolver.deckOrder();
            this.setup.push({
                seq: 'R1.S.0',
                t: 'INIT',
                p1DeckOrder: p1,
                p2DeckOrder: p2,
            });
        } catch (error) {
            this.logError('recordInit', error);
        }
    }

    public addGameEndRecord(winner: Seat | 'Draw', reason: string): void {
        try {
            this.push({
                seq: `R${this.currentRound}.A.end`,
                t: 'GAME_END',
                winner,
                reason,
            });
        } catch (error) {
            this.logError('addGameEndRecord', error);
        }
    }

    /**
     * Roll the recorded SWU-PGN data back to a prior game state after an undo.
     * `restoredSnapshotId` is the snapshot the game was restored to
     * (snapshotManager.currentSnapshotId after the rollback). Truncates events/setup back to
     * the boundary captured when that snapshot was taken — dropping exactly the undone events —
     * restores all counters and the tokenParents map, and discards that checkpoint and any
     * later ones so re-recording the redo starts clean.
     * Safe no-op when the snapshot id is unknown (nothing was recorded after it).
     */
    public rollbackTo(restoredSnapshotId: number | null): void {
        try {
            if (restoredSnapshotId == null) {
                return;
            }
            let idx = -1;
            for (let i = this.checkpoints.length - 1; i >= 0; i--) {
                if (this.checkpoints[i].snapshotId === restoredSnapshotId) {
                    idx = i;
                    break;
                }
            }
            if (idx === -1) {
                return; // nothing was recorded after the restored snapshot
            }
            const boundary = this.checkpoints[idx];
            this.events.length = boundary.eventsLen;
            this.setup.length = boundary.setupLen;
            this.currentRound = boundary.currentRound;
            this.currentPhase = boundary.currentPhase;
            this.actionCounter = boundary.actionCounter;
            this.phaseEventCounter = boundary.phaseEventCounter;
            this.subEventCounter = boundary.subEventCounter;
            this.loggedErrorCount = boundary.loggedErrorCount;
            // Rebuild tokenParents from the snapshot taken at the boundary so a removal record for
            // a token gained after the boundary no longer finds a parent (and is skipped).
            this.tokenParents.clear();
            for (const [uuid, entry] of boundary.tokenParents) {
                this.tokenParents.set(uuid, entry);
            }
            // Drop this checkpoint and any later ones; the redo re-checkpoints as it records.
            this.checkpoints.length = idx;
        } catch (error) {
            this.logError('rollbackTo', error);
        }
    }

    /**
     * Capture a rollback checkpoint for `snapshotId`, recording the current array lengths,
     * counters, and a snapshot of the tokenParents map. Mirrors v1.0's checkpoint semantics:
     * if the most recent checkpoint already belongs to this snapshot id it is a no-op (one
     * checkpoint per snapshot boundary). Exposed publicly so tests (and any explicit Game-side
     * hook) can checkpoint deterministically; gameplay drives it lazily via push().
     */
    public checkpoint(snapshotId: number): void {
        try {
            if (snapshotId < 0) {
                return;
            }
            const last = this.checkpoints[this.checkpoints.length - 1];
            if (last && last.snapshotId === snapshotId) {
                return;
            }
            this.checkpoints.push({
                snapshotId,
                eventsLen: this.events.length,
                setupLen: this.setup.length,
                currentRound: this.currentRound,
                currentPhase: this.currentPhase,
                actionCounter: this.actionCounter,
                phaseEventCounter: this.phaseEventCounter,
                subEventCounter: this.subEventCounter,
                loggedErrorCount: this.loggedErrorCount,
                tokenParents: [...this.tokenParents.entries()],
            });
        } catch (error) {
            this.logError('checkpoint', error);
        }
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    private push(e: GameEvent): void {
        this.maybeCheckpoint();
        this.events.push(e);
    }

    /**
     * Capture a rollback checkpoint the first time an event is pushed under a new snapshot id.
     * The game takes a state snapshot before the effects it precedes, so the first push afterward
     * captures the lengths + counters + tokenParents as they were *at that snapshot* (before its
     * events). Keyed off snapshotManager.currentSnapshotId, which is restored to the rolled-back
     * value on undo. No-op when there is no snapshot manager (unit-test stubs). Mirrors v1.0.
     */
    private maybeCheckpoint(): void {
        let snapshotId: number;
        try {
            snapshotId = this.game.snapshotManager?.currentSnapshotId ?? -1;
        } catch {
            return;
        }
        this.checkpoint(snapshotId);
    }

    /**
     * Resolve a player to its seat. Accepts an engine Player-like object (with `id`)
     * or returns seat 1 as a defensive fallback when the player is missing.
     */
    private seatOf(player: any): Seat {
        if (player?.id == null) {
            return 1;
        }
        return this.resolver.seat(player.id);
    }

    /** Resolve a card-like engine object to its stable SET#NUM[:copy] id. */
    private idOf(card: any): string {
        if (card?.uuid == null) {
            return 'unknown';
        }
        return this.resolver.cardId(card.uuid);
    }

    /**
     * Map an engine damage/heal target to either a base ref `base@<seat>` or a card id.
     * Mirrors how the v1.0 `OnDamageDealt` handler resolves the target card, but adds
     * the 1.1 base-vs-card distinction the fold relies on (`base@<seat>` snaps baseHp).
     */
    private targetRef(target: any): string {
        try {
            if (target?.isBase?.()) {
                const owner = target.controller ?? target.owner;
                return `base@${this.seatOf(owner)}`;
            }
        } catch {
            // fall through to card id
        }
        return this.idOf(target);
    }

    /**
     * Resolve the unit a (token-)upgrade is attached to. The public `parentCard` getter throws
     * once an upgrade has been unattached (which happens during shield defeat), so we read the
     * internal `_parentCard` first and only fall back to the guarded getter. Returns null when the
     * parent can't be resolved, so callers can skip rather than emit a bogus record.
     */
    private parentOf(upgrade: any): any {
        try {
            const internal = upgrade?._parentCard;
            if (internal != null) {
                return internal;
            }
            return upgrade?.parentCard ?? null;
        } catch {
            return null;
        }
    }

    /**
     * Map engine zone names to the short SWU-PGN/1.0 vocabulary. Only the two arena
     * zones differ (`groundArena`→`ground`, `spaceArena`→`space`); all other engine
     * zone strings (`deck`, `discard`, `hand`, `resource`, `base`, …) already match the
     * spec vocabulary and pass through unchanged.
     */
    private normalizeZone(zoneName: string | undefined): string {
        switch (zoneName) {
            case ZoneName.GroundArena: return 'ground';
            case ZoneName.SpaceArena: return 'space';
            default: return zoneName ?? '';
        }
    }

    /**
     * The record for a token-upgrade gain (`delta` 1) or removal (`delta` -1), against `hostId`.
     *
     * Gain and removal go through this one place so a kind can never be recorded on the way on
     * but forgotten on the way off — which is exactly how advantage and experience ended up
     * permanently stuck on their hosts.
     */
    private tokenRecord(seq: string, kind: TokenUpgradeKind, hostId: string, delta: 1 | -1): GameEvent {
        switch (kind) {
            case 'shield':
                return delta === 1
                    ? { seq, t: 'SHIELD_GAIN', card: hostId }
                    : { seq, t: 'SHIELD_USE', card: hostId };
            case 'experience':
                return { seq, t: 'EXPERIENCE_GAIN', card: hostId, count: delta };
            case 'advantage':
                return { seq, t: 'STATUS_TOKEN', card: hostId, token: 'advantage', count: delta };
        }
    }

    /**
     * True when `seq` belongs to the action currently being recorded.
     *
     * Sub-events share their action's seq and add a letter (`R1.A.7` -> `R1.A.7a`), so a prefix
     * match is right as long as the next character isn't a digit -- otherwise `R1.A.7` would also
     * claim `R1.A.70`.
     */
    private inCurrentAction(seq: string): boolean {
        const prefix = this.buildSeq(true);
        if (seq === prefix) {
            return true;
        }
        return seq.startsWith(prefix) && !(/^[0-9]/).test(seq.slice(prefix.length));
    }

    /**
     * Name `hostId` on the upgrade's entry MOVE and, for a played upgrade, on its PLAY_UPGRADE.
     *
     * The engine moves an upgrade into play BEFORE attaching it, so both records were emitted
     * while the host was still unknown. The scan is bounded to the action being recorded: an
     * earlier action's MOVE of the same card belongs to a different attachment and must not be
     * rewritten. (A played upgrade emits MOVE then PLAY_UPGRADE then the attach, so looking only
     * at the immediately preceding event -- which is all the token path needed -- misses it.)
     */
    private backfillAttachedTo(upgradeId: string, hostId: string): void {
        for (let i = this.events.length - 1; i >= 0; i--) {
            const e = this.events[i];
            if (!this.inCurrentAction(e.seq)) {
                return;
            }
            if (e.t === 'MOVE' && e.card === upgradeId && e.attachedTo == null) {
                e.attachedTo = hostId;
            } else if (e.t === 'PLAY_UPGRADE' && e.card === upgradeId && e.target == null) {
                e.target = hostId;
            }
        }
    }

    /**
     * The unit a token-upgrade is bound to, or null if the card isn't one.
     *
     * Checks the remembered attach-time host first, because by the time a token is moved out of
     * play it has already been unattached and its live parent is gone.
     */
    private tokenHostOf(card: any): any | null {
        if (!tokenUpgradeKind(card)) {
            return null;
        }
        const remembered = card?.uuid != null ? this.tokenParents.get(card.uuid) : undefined;
        return remembered?.parent ?? this.parentOf(card) ?? null;
    }

    private logError(where: string, error: unknown): void {
        if (this.loggedErrorCount >= SwuPgnRecorder.maxLoggedErrors) {
            return;
        }
        this.loggedErrorCount++;
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(`SwuPgnRecorder: error in ${where} (recording skipped): ${message}`);
        if (this.loggedErrorCount === SwuPgnRecorder.maxLoggedErrors) {
            logger.warn('SwuPgnRecorder: further recording errors will be suppressed for this game');
        }
    }

    // ── Sequence helpers (port of v1.0 scheme) ─────────────────────────────────

    private subEventLetter(n: number): string {
        // Bijective base-26 (a, b, ..., z, aa, ab, ...) so an action with more
        // than 26 sub-events still produces unique, schema-valid suffixes
        // (the seq pattern allows only [A-Za-z0-9-]). A naive 'a'+n overflows
        // past 'z' into '{', '|', ... which fail validation.
        let s = '';
        let i = n + 1;
        while (i > 0) {
            i -= 1;
            s = String.fromCharCode('a'.charCodeAt(0) + (i % 26)) + s;
            i = Math.floor(i / 26);
        }
        return s;
    }

    private buildSeq(isTopLevel: boolean): string {
        const r = `R${this.currentRound}`;
        const p = this.currentPhase;
        if (p === 'A') {
            if (isTopLevel) {
                return `${r}.${p}.${this.actionCounter}`;
            }
            return `${r}.${p}.${this.actionCounter}${this.subEventLetter(this.subEventCounter)}`;
        }
        return `${r}.${p}.${this.phaseEventCounter}`;
    }

    private nextSeq(isTopLevelAction: boolean): string {
        if (this.currentPhase === 'A') {
            if (isTopLevelAction) {
                this.actionCounter++;
                this.subEventCounter = 0;
                return this.buildSeq(true);
            }
            const seq = this.buildSeq(false);
            this.subEventCounter++;
            return seq;
        }
        this.phaseEventCounter++;
        return this.buildSeq(false);
    }

    /** Engine PhaseName → v1.0 abbreviation (S/A/G) for seq strings. */
    private phaseAbbr(phase: string): string {
        switch (phase) {
            case PhaseName.Setup: return 'S';
            case PhaseName.Action: return 'A';
            case PhaseName.Regroup: return 'G';
            default: return phase?.charAt(0).toUpperCase() ?? '?';
        }
    }

    /** Engine PhaseName → 1.1 reader vocabulary ('setup'|'action'|'regroup'). */
    private phaseVocab(phase: string): ReducedState['phase'] {
        switch (phase) {
            case PhaseName.Setup: return 'setup';
            case PhaseName.Action: return 'action';
            case PhaseName.Regroup: return 'regroup';
            // Spec §6.4 fixes PHASE_START.phase to exactly setup/action/regroup. Lowercasing an
            // unknown engine phase would silently emit a value outside that vocabulary, which a
            // conforming reader is entitled to reject. Clamp instead, and say so in the log.
            default:
                this.logError('phaseVocab', new Error(`unknown engine phase "${phase}", recorded as "setup"`));
                return 'setup';
        }
    }

    /**
     * Advance round tracking when a new round begins, emitting ROUND_START exactly once
     * per round. Driven by `game.roundNumber` rather than OnBeginRound: that event never
     * reaches `.on()` listeners (known engine quirk), but OnPhaseStarted does fire, so we
     * re-sync the round there. Idempotent.
     */
    private syncRound(): void {
        const round = this.game.roundNumber ?? this.currentRound;
        if (round <= this.currentRound) {
            return;
        }
        this.currentRound = round;
        this.phaseEventCounter = 0;
        this.actionCounter = 0;
        this.subEventCounter = 0;
        // Emit a full ReducedState keyframe when the resolver can project one (Task 10). The
        // 1.1 reader uses it both as a fast-forward anchor and as an integrity checkpoint
        // (checkKeyframes folds forward and asserts the running fold equals each keyframe).
        // Absent a resolver projection, ROUND_START stays valid without a keyframe.
        const event: GameEvent = {
            seq: `R${this.currentRound}.start`,
            t: 'ROUND_START',
            round: this.currentRound,
        };
        const keyframe = this.projectKeyframe();
        if (keyframe) {
            event.keyframe = keyframe;
        }
        this.push(event);
    }

    /**
     * Project a round keyframe, or `undefined` if a complete one can't be produced.
     *
     * A keyframe is authoritative: the reader REPLACES its whole running state with it
     * (spec §13). So a keyframe that is missing a seat does not merely lose detail, it
     * ERASES that player's board — hand size, resources and in-play cards all reset, and
     * every later fold is wrong. An absent keyframe is harmless by comparison: the reader
     * just keeps folding deltas. Therefore a keyframe is attached only when it is complete
     * for both seats; anything else is dropped and logged.
     */
    private projectKeyframe(): ReducedState | undefined {
        if (!this.resolver.reducedState) {
            return undefined;
        }
        try {
            const keyframe = this.resolver.reducedState(this.currentRound);
            const seatedPlayerCount = this.game.getPlayers?.()?.length ?? 2;
            const missing = ([1, 2] as Seat[]).filter((seat) => keyframe.players[seat] == null);
            // Before both seats exist there is nothing to be incomplete about; once the game
            // is seated, a missing seat means a failed projection.
            if (seatedPlayerCount >= 2 && missing.length > 0) {
                this.logError(
                    'projectKeyframe',
                    new Error(`incomplete keyframe at R${this.currentRound}.start: no state for seat(s) ${missing.join(', ')}`)
                );
                return undefined;
            }
            return keyframe;
        } catch (error) {
            this.logError('projectKeyframe', error);
            return undefined;
        }
    }

    // ── Listener registration ──────────────────────────────────────────────────

    private registerListeners(): void {
        // Structural events. OnBeginRound does not reach .on() listeners; round tracking
        // is driven by syncRound() from OnPhaseStarted. Kept for correctness if fixed.
        this.game.on(EventName.OnBeginRound, () => {
            try {
                this.syncRound();
            } catch (error) {
                this.logError('OnBeginRound', error);
            }
        });

        this.game.on(EventName.OnRoundEnded, () => {
            try {
                // ROUND_END carries a keyframe too. Now that keyframes are complete and
                // trustworthy, an end-of-round snapshot is the cheapest place to catch a round's
                // worth of fold drift: it halves the window between checkpoints at the cost of
                // one snapshot per round.
                const event: GameEvent = { seq: `R${this.currentRound}.end`, t: 'ROUND_END', round: this.currentRound };
                const keyframe = this.projectKeyframe();
                if (keyframe) {
                    event.keyframe = keyframe;
                }
                this.push(event);
            } catch (error) {
                this.logError('OnRoundEnded', error);
            }
        });

        this.game.on(EventName.OnPhaseStarted, (event: any) => {
            try {
                this.syncRound();
                const phaseName: string = event?.phase ?? this.game.currentPhase ?? '';
                this.currentPhase = this.phaseAbbr(phaseName);
                this.phaseEventCounter = 0;
                this.actionCounter = 0;
                this.subEventCounter = 0;
                this.push({
                    seq: `R${this.currentRound}.${this.currentPhase}.start`,
                    t: 'PHASE_START',
                    phase: this.phaseVocab(phaseName),
                });
            } catch (error) {
                this.logError('OnPhaseStarted', error);
            }
        });

        this.game.on(EventName.OnPhaseEnded, (event: any) => {
            try {
                const phaseName: string = event?.phase ?? this.game.currentPhase ?? '';
                this.push({
                    seq: `R${this.currentRound}.${this.phaseAbbr(phaseName)}.end`,
                    t: 'PHASE_END',
                    phase: this.phaseVocab(phaseName),
                });
            } catch (error) {
                this.logError('OnPhaseEnded', error);
            }
        });

        // ── Top-level player actions ─────────────────────────────────────────

        this.game.on(EventName.OnCardPlayed, (event: any) => {
            try {
                const card = event?.card;
                const player = event?.player ?? card?.owner;
                const playType: string = event?.playType ?? '';
                const printedType: string = card?.printedType ?? '';
                let t: GameEvent['t'] = 'PLAY';
                if (printedType === CardType.Event) {
                    t = 'PLAY_EVENT';
                } else if (
                    playType === PlayType.Piloting ||
                    printedType === CardType.BasicUpgrade ||
                    printedType === CardType.LeaderUpgrade ||
                    printedType === CardType.TokenUpgrade ||
                    printedType === CardType.NonLeaderUnitUpgrade
                ) {
                    t = 'PLAY_UPGRADE';
                } else if (playType === PlayType.Smuggle) {
                    t = 'PLAY_SMUGGLE';
                }
                // Name the host on the way out. The engine attaches an upgrade BEFORE it emits
                // OnCardPlayed, so the parent is already reachable here -- and it has to be
                // recorded, because `kind: 'upgrade'` keeps the card out of the arena and
                // `PLAY_UPGRADE.target` is the only thing left that tells a reader where it went.
                // Without it the fold has nowhere to put the card and the upgrade disappears from
                // the replay entirely. (backfillAttachedTo covers the reverse order, where the
                // attach lands after the play.)
                const host = t === 'PLAY_UPGRADE' ? this.parentOf(card) : null;
                const seq = this.nextSeq(true);
                this.push({
                    seq,
                    t,
                    p: this.seatOf(player),
                    card: this.idOf(card),
                    zone: this.normalizeZone(card?.zoneName),
                    target: host ? this.idOf(host) : undefined,
                    // The OnCardPlayed/OnLeaderDeployed event carries `costs` (resolved cost objects),
                    // not a numeric `cost`; read the card's effective cost instead so the notation
                    // records a real resource cost rather than always-undefined.
                    cost: typeof card?.cost === 'number' ? card.cost : undefined,
                } as GameEvent);
            } catch (error) {
                this.logError('OnCardPlayed', error);
            }
        });

        this.game.on(EventName.OnLeaderDeployed, (event: any) => {
            try {
                const card = event?.card;
                const player = card?.owner ?? event?.player;
                const seq = this.nextSeq(true);
                this.push({
                    seq,
                    t: 'DEPLOY_LEADER',
                    p: this.seatOf(player),
                    card: this.idOf(card),
                    zone: this.normalizeZone(card?.zoneName),
                    // The OnCardPlayed/OnLeaderDeployed event carries `costs` (resolved cost objects),
                    // not a numeric `cost`; read the card's effective cost instead so the notation
                    // records a real resource cost rather than always-undefined.
                    cost: typeof card?.cost === 'number' ? card.cost : undefined,
                });
            } catch (error) {
                this.logError('OnLeaderDeployed', error);
            }
        });

        this.game.on(EventName.OnAttackDeclared, (event: any) => {
            try {
                const attack = event?.attack;
                const attacker = attack?.attacker;
                const attackingPlayer = attack?.attackingPlayer;
                const targets = attack?.getAllTargets?.() ?? [];
                const defender = targets[0] ?? null;
                const defenderType: 'unit' | 'base' = defender?.isBase?.() ? 'base' : 'unit';
                const seq = this.nextSeq(true);
                this.push({
                    seq,
                    t: 'ATTACK',
                    p: this.seatOf(attackingPlayer),
                    atk: this.idOf(attacker),
                    def: defender?.isBase?.() ? `base@${this.seatOf(defender.controller ?? defender.owner)}` : this.idOf(defender),
                    defenderType,
                });
            } catch (error) {
                this.logError('OnAttackDeclared', error);
            }
        });

        this.game.on(EventName.OnPassActionPhasePriority, (event: any) => {
            try {
                const seq = this.nextSeq(true);
                this.push({ seq, t: 'PASS', p: this.seatOf(event?.player) });
            } catch (error) {
                this.logError('OnPassActionPhasePriority', error);
            }
        });

        this.game.on(EventName.OnClaimInitiative, (event: any) => {
            try {
                const seq = this.nextSeq(true);
                this.push({ seq, t: 'CLAIM_INITIATIVE', p: this.seatOf(event?.player) });
            } catch (error) {
                this.logError('OnClaimInitiative', error);
            }
        });

        // ── Sub-events ────────────────────────────────────────────────────────

        this.game.on(EventName.OnDamageDealt, (event: any) => {
            try {
                const card = event?.card;
                let source: any = null;
                if (event?.damageSource?.attack?.attacker) {
                    source = event.damageSource.attack.attacker;
                } else if (event?.context?.source) {
                    source = event.context.source;
                }
                const amt = event?.damageDealt ?? event?.amount ?? 0;
                const damageType: string = event?.type ?? '';
                const seq = this.nextSeq(false);

                // OVERWHELM is not a distinct engine event: in SWU it is excess combat damage that
                // rolls onto the defending base, emitted by AttackFlow as an OnDamageDealt with
                // DamageType.Overwhelm ('overwhelm') targeting that base (see attack/AttackFlow.ts).
                // We surface it as a dedicated OVERWHELM record (instead of DAMAGE) when the engine
                // tags the damage as overwhelm-type onto a base; the 1.1 OVERWHELM reducer snaps base
                // hp exactly like a DAMAGE-to-base record.
                if (damageType === 'overwhelm' && card?.isBase?.()) {
                    this.push({
                        seq,
                        t: 'OVERWHELM',
                        p: this.seatOf(source?.controller ?? source?.owner),
                        tgt: this.targetRef(card),
                        amt,
                        hp: card?.remainingHp ?? 0,
                    });
                    return;
                }

                this.push({
                    seq,
                    t: 'DAMAGE',
                    src: this.idOf(source),
                    tgt: this.targetRef(card),
                    amt,
                    damageType,
                    hp: card?.remainingHp ?? 0,
                });
            } catch (error) {
                this.logError('OnDamageDealt', error);
            }
        });

        this.game.on(EventName.OnDamageHealed, (event: any) => {
            try {
                const card = event?.card;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    t: 'HEAL',
                    tgt: this.targetRef(card),
                    amt: event?.damageHealed ?? event?.amount ?? 0,
                    hp: card?.remainingHp ?? 0,
                });
            } catch (error) {
                this.logError('OnDamageHealed', error);
            }
        });

        this.game.on(EventName.OnCardDefeated, (event: any) => {
            try {
                const card = event?.card;

                // Token-upgrade REMOVAL. There is no dedicated removal event for any of the three
                // token kinds: shields, experience and advantage are all token-upgrade cards, and
                // each is removed by being defeated (a shield's damage-modification replaces the
                // damage with defeat(); an Advantage defeats itself when the attack ends). So the
                // removal surfaces here, as OnCardDefeated on the token itself.
                //
                // Only shields used to be handled, which meant a gained Advantage or Experience was
                // never taken back off its host: a reader folding the stream kept the token for the
                // rest of the replay while the engine's own keyframe showed statusTokens {}. Every
                // kind now emits its decrement, so gains and removals balance.
                const removed = card?.uuid != null ? this.tokenParents.get(card.uuid) : undefined;
                const removedKind = removed?.kind ?? tokenUpgradeKind(card);
                if (removedKind) {
                    // Prefer the parent remembered at attach time (the upgrade is already unattached
                    // by now); fall back to a live lookup if it wasn't recorded.
                    const parent = removed?.parent ?? this.parentOf(card);
                    if (parent) {
                        this.push(this.tokenRecord(this.nextSeq(false), removedKind, this.idOf(parent), -1));
                    }
                    // The entry is deliberately NOT deleted here: the token's exit MOVE is emitted
                    // after this handler, and it still needs the host to fill in `attachedTo`. A
                    // re-attach overwrites the entry, so a stale host can't be read back.
                    return;
                }

                const defeatSource = event?.defeatSource;
                const reason: string = defeatSource?.type ?? '';
                let defeatedBy: any = null;
                if (defeatSource?.type === DefeatSourceType.Attack) {
                    defeatedBy = defeatSource?.attack?.attacker;
                } else {
                    defeatedBy = defeatSource?.card;
                }
                const defeatedById = this.idOf(defeatedBy);
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    t: 'DEFEAT',
                    card: this.idOf(card),
                    reason,
                    defeatedBy: defeatedById === 'unknown' ? undefined : defeatedById,
                });
            } catch (error) {
                this.logError('OnCardDefeated', error);
            }
        });

        this.game.on(EventName.OnCardMoved, (event: any) => {
            try {
                const card = event?.card;

                // OnCardMoved is emitted TWICE for an ability-driven move: once by
                // MoveCardSystem (whose props are destination/context — no zones) and once by
                // Card.postMoveSteps, which carries the authoritative originalZone/newZone. Only
                // the second describes a move, so the first is dropped. Recording it produced
                // `"from": ""` records, which are not a zone at all and forced every reader to
                // special-case the required field.
                if (event?.originalZone == null) {
                    return;
                }

                const from = this.normalizeZone(event.originalZone);
                const to = this.normalizeZone(event?.newZone ?? card?.zoneName);

                // A move that doesn't change zone carries no information. Searching a deck moves
                // each examined card deck->deck on the way back, which is how two SEARCHes came to
                // produce 20% of a real game's MOVE records. Examining a card is reported by
                // SEARCH (and REVEAL); only a card that actually leaves its zone gets a MOVE.
                if (from === to || from === '' || to === '') {
                    return;
                }

                const seq = this.nextSeq(false);
                // Seat lets the 1.1 fold attribute zone-membership counts (handSize,
                // resourcesReady) and arena-card placement to a player: the engine performs
                // these via card moves, not via DRAW/RESOURCE/PLAY summary events, so MOVE is
                // the fold's source of truth for those counts.
                // For a token-upgrade, also name the unit it is bound to. Without it a reader can
                // only infer the binding from the accident that the token's gain/removal record
                // happens to be the adjacent event; `attachedTo` states it outright.
                const host = this.tokenHostOf(card);
                const seat = this.seatOf(card?.controller ?? card?.owner);
                const kind = cardKind(card);
                this.push({
                    seq,
                    t: 'MOVE',
                    card: this.idOf(card),
                    from,
                    to,
                    p: seat,
                    ...(host ? { attachedTo: this.idOf(host) } : {}),
                    ...(kind ? { kind } : {}),
                });

                // RESOURCE is the human-readable summary of "a card became a resource", the way
                // DRAW summarises the deck->hand MOVEs beside it. It is derived from the move
                // rather than from OnCardResourced because that engine event only fires for
                // ability-driven resourcing: the setup and regroup resource steps call
                // Player.resourceCard() directly (ResourcePrompt.resourceSelectedCards), so
                // listening for it produced ZERO records across a full game's 15 resourcings.
                // Every resourcing — routine or ability-driven, including takeControl into the
                // resource zone — ends in this move, so this sees all of them exactly once.
                if (to === 'resource') {
                    this.push({ seq: this.nextSeq(false), t: 'RESOURCE', p: seat, card: this.idOf(card) });
                }
            } catch (error) {
                this.logError('OnCardMoved', error);
            }
        });

        // SHIELD_GAIN: no dedicated event. A Shield is given by generating a Shield token-upgrade
        // (GiveShieldSystem → OnTokensCreated) and then attaching it (contingent OnUpgradeAttached).
        // We emit SHIELD_GAIN only when the attached upgrade isShield(); other upgrade attachments
        // are not board-mutation gap events handled in this task. Recorded against the parent unit;
        // the 1.1 reducer increments shields by `count` (default 1).
        //
        // EXPERIENCE_GAIN and STATUS_TOKEN ride the same OnUpgradeAttached event because, like
        // shields, experience and advantage are token-upgrade cards (Experience/Advantage extend
        // TokenUpgradeCard); they are "gained" by generating the token-upgrade (GiveExperienceSystem /
        // GiveAdvantageSystem → OnTokensCreated) and attaching it (contingent OnUpgradeAttached, one
        // event per token). We disambiguate by upgrade predicate so each token type maps to exactly one
        // record and we never double-count:
        //   isShield()      → SHIELD_GAIN      (dedicated event, shields counter)
        //   isExperience()  → EXPERIENCE_GAIN  (experience counter, +1 per attach)
        //   isAdvantage()   → STATUS_TOKEN     (generic statusTokens['advantage'], +1 per attach)
        // Normally-played, non-token upgrades are already covered by OnCardPlayed→PLAY_UPGRADE and the
        // fold does not model upgrade nesting, so we deliberately emit nothing for them here (emitting a
        // second PLAY_UPGRADE would corrupt the fold). New token-upgrade types should get an explicit
        // branch rather than silently falling through.
        this.game.on(EventName.OnUpgradeAttached, (event: any) => {
            try {
                const upgrade = event?.upgradeCard;
                const parent = event?.parentCard ?? this.parentOf(upgrade);
                if (!parent) {
                    return;
                }
                const kind = tokenUpgradeKind(upgrade);
                if (!kind) {
                    // An ordinary printed upgrade. It gets no token record -- a second
                    // PLAY_UPGRADE would corrupt the fold -- but it still needs its host named.
                    // `kind: 'upgrade'` correctly keeps it out of the arena, so without a host
                    // there is nothing to attach it to and it folds to nowhere at all: the player
                    // plays an upgrade and the replay shows nothing happening.
                    this.backfillAttachedTo(this.idOf(upgrade), this.idOf(parent));
                    return;
                }
                // Remember the host for the matching removal record: by the time the token is
                // defeated it has already been unattached, so its parent is unreachable then.
                if (upgrade?.uuid != null) {
                    this.tokenParents.set(upgrade.uuid, { parent, kind });
                }
                // The engine moves the token into play BEFORE attaching it, so its entry MOVE was
                // emitted while the host was still unknown. Name the host on it now, so a reader
                // never has to infer the binding from event adjacency.
                this.backfillAttachedTo(this.idOf(upgrade), this.idOf(parent));
                this.push(this.tokenRecord(this.nextSeq(false), kind, this.idOf(parent), 1));
            } catch (error) {
                this.logError('OnUpgradeAttached', error);
            }
        });

        this.game.on(EventName.OnCardExhausted, (event: any) => {
            try {
                const seq = this.nextSeq(false);
                this.push({ seq, t: 'EXHAUST', card: this.idOf(event?.card) });
            } catch (error) {
                this.logError('OnCardExhausted', error);
            }
        });

        this.game.on(EventName.OnCardReadied, (event: any) => {
            try {
                const seq = this.nextSeq(false);
                this.push({ seq, t: 'READY', card: this.idOf(event?.card) });
            } catch (error) {
                this.logError('OnCardReadied', error);
            }
        });

        this.game.on(EventName.OnCardsDrawn, (event: any) => {
            try {
                const player = event?.player;
                const cards: any[] = event?.cards ?? [];
                const count: number = event?.amount ?? cards.length ?? 0;
                const cardIds = cards.map((c: any) => this.idOf(c)).filter((id: string) => id !== 'unknown');
                const seq = this.nextSeq(false);
                this.push({ seq, t: 'DRAW', p: this.seatOf(player), count, cards: cardIds });
            } catch (error) {
                this.logError('OnCardsDrawn', error);
            }
        });

        this.game.on(EventName.OnCardDiscarded, (event: any) => {
            try {
                const card = event?.card;
                const player = card?.owner;
                const id = this.idOf(card);
                const seq = this.nextSeq(false);
                this.push({ seq, t: 'DISCARD', p: this.seatOf(player), cards: id === 'unknown' ? [] : [id] });
            } catch (error) {
                this.logError('OnCardDiscarded', error);
            }
        });

        this.game.on(EventName.OnDeckShuffled, (event: any) => {
            try {
                const player = event?.player ?? event?.card?.owner;
                const seq = this.nextSeq(false);
                this.push({ seq, t: 'SHUFFLE', p: this.seatOf(player) });
            } catch (error) {
                this.logError('OnDeckShuffled', error);
            }
        });

        this.game.on(EventName.OnTokensCreated, (event: any) => {
            try {
                const tokens: any[] = event?.generatedTokens ?? [];
                for (const token of tokens) {
                    // Only UNIT tokens are arena cards in the fold. OnTokensCreated also fires for
                    // token-upgrades (shield/experience/advantage — recorded via OnUpgradeAttached as
                    // SHIELD_GAIN/EXPERIENCE_GAIN/STATUS_TOKEN) and for credit/force tokens, none of
                    // which are arena units; emitting CREATE_TOKEN for them would push a phantom card
                    // into the folded board.
                    if (typeof token?.isUnit !== 'function' || !token.isUnit()) {
                        continue;
                    }
                    const seq = this.nextSeq(false);
                    this.push({
                        seq,
                        t: 'CREATE_TOKEN',
                        p: this.seatOf(token?.owner),
                        // Stable SET#NUM[:copy]/TOKEN:<name> id, consistent with the later MOVE/DAMAGE/
                        // EXHAUST events that reference this token (those use idOf too). Emitting the
                        // display title here instead would alias same-name tokens and orphan every
                        // subsequent token event from this card in the fold.
                        token: this.idOf(token),
                        zone: this.normalizeZone(token?.zoneName),
                        power: typeof token?.getPower === 'function' ? token.getPower() : undefined,
                        hp: typeof token?.getHp === 'function' ? token.getHp() : undefined,
                        // Always 'unit' here (the guard above skips non-units), but stated
                        // explicitly so a reader never has to infer it from the event type.
                        kind: cardKind(token),
                    });
                }
            } catch (error) {
                this.logError('OnTokensCreated', error);
            }
        });

        this.game.on(EventName.OnCardCaptured, (event: any) => {
            try {
                const card = event?.card;
                const seq = this.nextSeq(false);
                this.push({ seq, t: 'CAPTURE', p: this.seatOf(card?.owner), card: this.idOf(card) });
            } catch (error) {
                this.logError('OnCardCaptured', error);
            }
        });

        this.game.on(EventName.OnRescue, (event: any) => {
            try {
                const card = event?.card;
                const seq = this.nextSeq(false);
                this.push({ seq, t: 'RESCUE', p: this.seatOf(card?.owner), card: this.idOf(card) });
            } catch (error) {
                this.logError('OnRescue', error);
            }
        });

        this.game.on(EventName.OnTakeControl, (event: any) => {
            try {
                const card = event?.card;
                const player = event?.newController ?? card?.controller;
                const seq = this.nextSeq(false);
                this.push({ seq, t: 'TAKE_CONTROL', p: this.seatOf(player), card: this.idOf(card) });
            } catch (error) {
                this.logError('OnTakeControl', error);
            }
        });

        // TRIGGER / ABILITY_ACTIVATE dedup: AbilityResolver pushes BOTH OnCardAbilityTriggered
        // (only for activated abilities) and OnCardAbilityInitiated (for every card ability) into
        // the same event window for one activation, so an activated ability would otherwise record
        // two adjacent pure-log lines for the same card. OnCardAbilityInitiated → ABILITY_ACTIVATE
        // is the richer record (it carries the ability identifier) and is a superset of the
        // TRIGGER cases, so we collapse the pair into the single ABILITY_ACTIVATE. The collapse is
        // adjacency-based and bidirectional so it holds whichever event the window emits first; a
        // standalone TRIGGER (no adjacent ABILITY_ACTIVATE for the same card) is still recorded.
        this.game.on(EventName.OnCardAbilityTriggered, (event: any) => {
            try {
                const card = event?.card ?? event?.context?.source;
                const cardId = this.idOf(card);
                const last = this.events[this.events.length - 1];
                if (last && last.t === 'ABILITY_ACTIVATE' && (last as any).card === cardId) {
                    return; // ABILITY_ACTIVATE for this card already recorded the activation
                }
                const player = card?.controller ?? card?.owner;
                const seq = this.nextSeq(false);
                this.push({ seq, t: 'TRIGGER', p: player ? this.seatOf(player) : undefined, card: cardId });
            } catch (error) {
                this.logError('OnCardAbilityTriggered', error);
            }
        });

        this.game.on(EventName.OnCardAbilityInitiated, (event: any) => {
            try {
                const card = event?.card ?? event?.context?.source;
                const cardId = this.idOf(card);
                const player = card?.controller ?? card?.owner;
                const ability = event?.ability?.abilityIdentifier;
                // Drop a just-recorded paired TRIGGER for the same card; this single record subsumes
                // it. Reuse the popped TRIGGER's seq for this record (rather than allocating a fresh
                // one) so the collapse leaves no skipped seq number behind it.
                const last = this.events[this.events.length - 1];
                let seq: string;
                if (last && last.t === 'TRIGGER' && (last as any).card === cardId) {
                    seq = last.seq;
                    this.events.pop();
                } else {
                    seq = this.nextSeq(false);
                }
                this.push({
                    seq,
                    t: 'ABILITY_ACTIVATE',
                    p: this.seatOf(player),
                    card: cardId,
                    ability: typeof ability === 'string' ? ability : undefined,
                });
            } catch (error) {
                this.logError('OnCardAbilityInitiated', error);
            }
        });

        this.game.on(EventName.OnCardRevealed, (event: any) => {
            try {
                const cards: any[] = event?.cards ?? [];
                if (cards.length === 0) {
                    return;
                }
                const owner = cards[0]?.controller ?? cards[0]?.owner;
                const cardIds = cards.map((c: any) => this.idOf(c)).filter((id: string) => id !== 'unknown');
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    t: 'REVEAL',
                    p: this.seatOf(owner),
                    zone: this.normalizeZone(event?.revealedFromZone ?? cards[0]?.zoneName),
                    cards: cardIds,
                });
            } catch (error) {
                this.logError('OnCardRevealed', error);
            }
        });

        this.game.on(EventName.OnDeckSearch, (event: any) => {
            try {
                const player = event?.player;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    t: 'SEARCH',
                    p: this.seatOf(player),
                    zone: event?.searchWholeDeck ? 'deck' : undefined,
                });
            } catch (error) {
                this.logError('OnDeckSearch', error);
            }
        });

        // ── Decision context (pure-log; no fold delta) ────────────────────────
        //
        // There is no pre-existing engine event carrying a player's prompt selection: prompt
        // results are known only inside the prompt's menuCommand handler (UiPrompt subclasses).
        // Per design §4.2, CHOICE/MODAL_CHOICE are "sourced from the prompt the engine already
        // built", so we added two minimal engine-side emits at the prompt-completion sites that
        // already know both the option menu and the chosen option (see MulliganPrompt and
        // HandlerMenuPrompt). The recorder only listens; gameplay logic is untouched.

        // MULLIGAN / KEEP_HAND: emitted by MulliganPrompt.menuCommand when a player resolves their
        // mulligan decision (mulligan === true → MULLIGAN, otherwise → KEEP_HAND). Pure log.
        this.game.on(EventName.OnMulliganDecision, (event: any) => {
            try {
                this.push({
                    seq: this.nextSeq(false),
                    t: event?.mulligan ? 'MULLIGAN' : 'KEEP_HAND',
                    p: this.seatOf(event?.player),
                });
            } catch (error) {
                this.logError('OnMulliganDecision', error);
            }
        });

        // MODAL_CHOICE: emitted by HandlerMenuPrompt.menuCommand — the engine's general menu/button
        // prompt with a fixed list of options. We classify menu/button prompts as MODAL_CHOICE
        // (fixed option list) and reserve CHOICE for free card-selection prompts; HandlerMenuPrompt
        // is the menu/button case, so it maps to MODAL_CHOICE. `offered` is the human-readable
        // button label list the prompt built; `chose` is the index of the selected option. Pure log.
        this.game.on(EventName.OnModalChoice, (event: any) => {
            try {
                const offered: string[] = Array.isArray(event?.offered) ? event.offered : [];
                // `chose` is the selected option index; without a valid number the record would be
                // malformed. Mirror the other handlers (e.g. OnCardRevealed) and skip the push
                // rather than emit a sentinel.
                if (typeof event?.chose !== 'number') {
                    return;
                }
                const chose: number = event.chose;
                this.push({
                    seq: this.nextSeq(false),
                    t: 'MODAL_CHOICE',
                    p: this.seatOf(event?.player),
                    offered,
                    chose,
                });
            } catch (error) {
                this.logError('OnModalChoice', error);
            }
        });

        // CHOICE: a free card-selection prompt (SelectCardPrompt.emitCardSelection) — distinct from
        // MODAL_CHOICE's fixed menu/button list. `offered` is the candidate-card pool the prompt
        // presented; `chosen` is the single selected card; we record the stable card-id list and the
        // chosen card's index within it. The engine only emits this for single-card selections, and
        // we additionally skip the record if the chosen card isn't resolvable or isn't in the offered
        // pool (a malformed pairing) rather than emit a sentinel. Pure log — no fold delta.
        this.game.on(EventName.OnCardSelection, (event: any) => {
            try {
                const offeredCards: any[] = Array.isArray(event?.offered) ? event.offered : [];
                const offered = offeredCards
                    .map((c: any) => this.idOf(c))
                    .filter((id: string) => id !== 'unknown');
                const chosen = event?.chosen;
                if (chosen?.uuid == null) {
                    return;
                }
                const chose = offered.indexOf(this.idOf(chosen));
                if (chose < 0) {
                    return;
                }
                this.push({
                    seq: this.nextSeq(false),
                    t: 'CHOICE',
                    p: this.seatOf(event?.player),
                    prompt: typeof event?.prompt === 'string' ? event.prompt : undefined,
                    offered,
                    chose,
                });
            } catch (error) {
                this.logError('OnCardSelection', error);
            }
        });
    }
}
