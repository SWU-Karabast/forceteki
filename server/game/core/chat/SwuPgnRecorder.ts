import type { Game } from '../Game';
import { EventName, PhaseName } from '../Constants';
import { DefeatSourceType } from '../../IDamageOrDefeatSource';
import { logger } from '../../../logger';
import type { Header, GameEvent, ReducedState, Seat } from '../../../../swupgn/src/types';
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
        game: 'SWU-PGN/1.1',
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
 * Maps engine identities to the stable, anonymized identifiers used by SWU-PGN/1.1.
 * The Game-side implementation (Task 10) owns copy-suffix logic and the omniscient
 * keyframe/deck-order projections; the recorder only needs uuid->id and playerId->seat.
 * Later tasks extend this with `reducedState`/`deckOrder` — declared optional here so
 * the interface is forward-compatible without the recorder depending on them yet.
 */
export interface SwuPgnResolver {
    cardId(uuid: string): string;
    seat(playerId: string): Seat;
    reducedState?(): ReducedState;
    deckOrder?(seat: Seat): string[];
}

/**
 * Emits SWU-PGN/1.1 `GameEvent`s by subscribing to the same engine events the v1.0
 * `PgnReplayRecorder` handles. Every handler is wrapped in try/catch with rate-limited
 * error logging so a recording bug can never crash gameplay.
 */
export class SwuPgnRecorder {
    private readonly game: Game;
    private readonly resolver: SwuPgnResolver;
    private readonly events: GameEvent[] = [];

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

    public constructor(game: Game, resolver: SwuPgnResolver) {
        this.game = game;
        this.resolver = resolver;
        this.registerListeners();
    }

    // ── Public interface ──────────────────────────────────────────────────────

    public getEvents(): GameEvent[] {
        return this.events;
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

    // ── Internals ─────────────────────────────────────────────────────────────

    private push(e: GameEvent): void {
        this.events.push(e);
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
     * Map engine zone names to the short SWU-PGN/1.1 vocabulary. Only the two arena
     * zones differ (`groundArena`→`ground`, `spaceArena`→`space`); all other engine
     * zone strings (`deck`, `discard`, `hand`, `resource`, `base`, …) already match the
     * spec vocabulary and pass through unchanged.
     */
    private normalizeZone(zoneName: string | undefined): string {
        switch (zoneName) {
            case 'groundArena': return 'ground';
            case 'spaceArena': return 'space';
            default: return zoneName ?? '';
        }
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
        return String.fromCharCode('a'.charCodeAt(0) + n);
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
    private phaseVocab(phase: string): string {
        switch (phase) {
            case PhaseName.Setup: return 'setup';
            case PhaseName.Action: return 'action';
            case PhaseName.Regroup: return 'regroup';
            default: return (phase ?? '').toLowerCase();
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
        this.push({
            seq: `R${this.currentRound}.start`,
            t: 'ROUND_START',
            round: this.currentRound,
        });
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
                this.push({ seq: `R${this.currentRound}.end`, t: 'ROUND_END', round: this.currentRound });
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
                if (printedType === 'event') {
                    t = 'PLAY_EVENT';
                } else if (playType === 'piloting' || printedType === 'basicUpgrade' || printedType === 'leaderUpgrade' || printedType === 'tokenUpgrade' || printedType === 'nonLeaderUnitUpgrade') {
                    t = 'PLAY_UPGRADE';
                } else if (playType === 'smuggle') {
                    t = 'PLAY_SMUGGLE';
                }
                const seq = this.nextSeq(true);
                this.push({
                    seq,
                    t,
                    p: this.seatOf(player),
                    card: this.idOf(card),
                    zone: this.normalizeZone(card?.zoneName),
                    cost: typeof event?.cost === 'number' ? event.cost : undefined,
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
                    cost: typeof event?.cost === 'number' ? event.cost : undefined,
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
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    t: 'DAMAGE',
                    src: this.idOf(source),
                    tgt: this.targetRef(card),
                    amt: event?.damageDealt ?? event?.amount ?? 0,
                    damageType: event?.type ?? '',
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

        this.game.on(EventName.OnCardResourced, (event: any) => {
            try {
                const card = event?.card;
                const player = event?.resourceControllingPlayer ?? card?.owner;
                const cardName = card?.title ? (card.subtitle ? `${card.title}, ${card.subtitle}` : card.title) : undefined;
                const seq = this.nextSeq(false);
                this.push({ seq, t: 'RESOURCE', p: this.seatOf(player), card: this.idOf(card), cardName });
            } catch (error) {
                this.logError('OnCardResourced', error);
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
                    const seq = this.nextSeq(false);
                    this.push({
                        seq,
                        t: 'CREATE_TOKEN',
                        p: this.seatOf(token?.owner),
                        token: token?.title ?? token?.name ?? 'unknown',
                        zone: this.normalizeZone(token?.zoneName),
                        power: typeof token?.getPower === 'function' ? token.getPower() : undefined,
                        hp: typeof token?.getHp === 'function' ? token.getHp() : undefined,
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

        this.game.on(EventName.OnCardAbilityTriggered, (event: any) => {
            try {
                const card = event?.card ?? event?.context?.source;
                const player = card?.controller ?? card?.owner;
                const seq = this.nextSeq(false);
                this.push({ seq, t: 'TRIGGER', p: player ? this.seatOf(player) : undefined, card: this.idOf(card) });
            } catch (error) {
                this.logError('OnCardAbilityTriggered', error);
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
    }
}
