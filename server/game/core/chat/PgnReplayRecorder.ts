import type { Game } from '../Game';
import type { Player } from '../Player';
import { EventName, PhaseName, ZoneName } from '../Constants';
import { DefeatSourceType } from '../../IDamageOrDefeatSource';
import { logger } from '../../../logger';
import { SwuPgn } from './SwuPgn';
import { PgnActionType } from './PgnTypes';
import type { IPgnReplayRecord, IStructureMarker, IPgnGameStateSnapshot, IPgnPlayerStateSnapshot } from './PgnTypes';

/**
 * Records structured JSON replay data by listening to game events.
 * Wrap every handler in try/catch so recording bugs never crash gameplay.
 */
export class PgnReplayRecorder {
    private readonly game: Game;
    private readonly records: IPgnReplayRecord[] = [];
    private readonly structureMarkers: IStructureMarker[] = [];

    /** Callback to capture full game state for replay snapshots */
    private readonly getStateSnapshot: (() => Record<string, any>) | null;

    /** Replay records with full snapshots (used for .swureplay file) */
    private readonly replayRecords: IPgnReplayRecord[] = [];

    /** Map from player.id → 'Player 1' | 'Player 2' */
    private readonly playerMap: Map<string, string> = new Map();

    /** Map from player.name → 'Player 1' | 'Player 2' (fallback) */
    private readonly playerNameMap: Map<string, string> = new Map();

    /** Current round number */
    private currentRound: number = 0;

    /** Current phase abbreviation: 'S', 'A', or 'G' */
    private currentPhase: string = 'S';

    /** Current phase display name for freeform output */
    private currentPhaseDisplayName: string = 'Setup Phase';

    /** Last emitted game state as a JSON string, used for deduplication */
    private lastGameStateStr = '';

    /** Incremented for top-level player actions during Action Phase */
    private actionCounter: number = 0;

    /** Incremented for events in Setup/Regroup phases */
    private phaseEventCounter: number = 0;

    /** Incremented for sub-events within an action; reset when actionCounter increments */
    private subEventCounter: number = 0;

    /** Stable display id per card instance (uuid → e.g. SOR#095 / SOR#095:2) */
    private readonly cardIdByUuid: Map<string, string> = new Map();

    /** Count of distinct instances seen per base id, for assigning :N copy suffixes */
    private readonly copyCountByBase: Map<string, number> = new Map();

    /** Caps repeated recorder-error logging so a broken handler can't flood the logs */
    private static readonly maxLoggedErrors = 20;
    private loggedErrorCount = 0;

    /** Rollback checkpoints (array lengths + counters) keyed by snapshot id */
    private readonly checkpoints: {
        snapshotId: number;
        recordsLen: number;
        replayLen: number;
        markersLen: number;
        currentRound: number;
        currentPhase: string;
        currentPhaseDisplayName: string;
        actionCounter: number;
        phaseEventCounter: number;
        subEventCounter: number;
        lastGameStateStr: string;
    }[] = [];

    public constructor(game: Game, getStateSnapshot?: () => Record<string, any>) {
        this.game = game;
        this.getStateSnapshot = getStateSnapshot ?? null;
        this.registerListeners();
    }

    // ── Public Interface ─────────────────────────────────────────────────────

    public getRecords(): IPgnReplayRecord[] {
        return this.records;
    }

    public getReplayRecords(): IPgnReplayRecord[] {
        return this.replayRecords;
    }

    public addGameEndRecord(winner: string, reason: string): void {
        try {
            this.push({
                seq: `R${this.currentRound}.A.end`,
                type: PgnActionType.GameEnd,
                winner,
                reason,
            });
        } catch (error) {
            this.logError('event handler', error);
        }
    }

    public getStructureMarkers(): IStructureMarker[] {
        return this.structureMarkers;
    }

    /**
     * Roll the recorded data back to a prior game state after an undo. `restoredSnapshotId`
     * is the snapshot the game was restored to (snapshotManager.currentSnapshotId after the
     * rollback). Truncates records/markers back to the boundary captured when that snapshot
     * was taken — dropping exactly the undone records — and discards that checkpoint and any
     * later ones so re-recording the redo starts clean.
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
            this.records.length = boundary.recordsLen;
            this.replayRecords.length = boundary.replayLen;
            this.structureMarkers.length = boundary.markersLen;
            this.currentRound = boundary.currentRound;
            this.currentPhase = boundary.currentPhase;
            this.currentPhaseDisplayName = boundary.currentPhaseDisplayName;
            this.actionCounter = boundary.actionCounter;
            this.phaseEventCounter = boundary.phaseEventCounter;
            this.subEventCounter = boundary.subEventCounter;
            this.lastGameStateStr = boundary.lastGameStateStr;
            // Drop this checkpoint and any later ones; the redo re-checkpoints as it records.
            this.checkpoints.length = idx;
        } catch (error) {
            this.logError('rollbackTo', error);
        }
    }

    /**
     * Release the in-memory recorded data once the game's files have been cached as
     * strings at game end. The cached .swupgn/.swureplay strings are the served
     * artifacts, so the raw record/marker/checkpoint arrays are redundant afterward.
     */
    public clearRecordedData(): void {
        this.records.length = 0;
        this.replayRecords.length = 0;
        this.structureMarkers.length = 0;
        this.checkpoints.length = 0;
    }

    /** Initialize the Player 1/Player 2 player map from game.getPlayers() order. */
    public initPlayerMap(): void {
        const players = this.game.getPlayers();
        if (players.length >= 1) {
            this.playerMap.set(players[0].id, 'Player 1');
            this.playerNameMap.set(players[0].name, 'Player 1');
        }
        if (players.length >= 2) {
            this.playerMap.set(players[1].id, 'Player 2');
            this.playerNameMap.set(players[1].name, 'Player 2');
        }
    }

    // ── Sequence helpers ─────────────────────────────────────────────────────

    /** Returns 'Player 1' or 'Player 2' for a player, with eager map init and name fallback. */
    private anonymizePlayer(player: Player | null | undefined): string {
        if (!player) {
            return 'unknown';
        }
        if (this.playerMap.size === 0) {
            this.initPlayerMap();
        }
        return this.playerMap.get(player.id) ?? this.playerNameMap.get(player.name) ?? 'unknown';
    }

    /**
     * Returns a SET#NUM identifier for a card, or TOKEN:{name} for tokens.
     */
    private cardId(card: any): string {
        if (!card) {
            return 'unknown';
        }

        // Base id: SET#NUM for normal cards, TOKEN:{name} for tokens, name as last resort.
        let base: string;
        try {
            if (card.isToken && card.isToken()) {
                base = `TOKEN:${card.title ?? card.name ?? 'unknown'}`;
            } else if (card.setId) {
                base = SwuPgn.formatSetId(card.setId.set, card.setId.number);
            } else {
                base = card.title ?? card.name ?? 'unknown';
            }
        } catch {
            base = card.title ?? card.name ?? 'unknown';
        }

        // Disambiguate multiple copies of the same card by appending a stable :N suffix
        // keyed off the card's instance uuid (first copy = base, second = base:2, …).
        // Without an instance identity we cannot disambiguate, so fall back to the base.
        let uuid: string | undefined;
        try {
            uuid = card.uuid;
        } catch {
            uuid = undefined;
        }
        if (uuid == null || base === 'unknown') {
            return base;
        }

        const cached = this.cardIdByUuid.get(uuid);
        if (cached != null) {
            return cached;
        }
        const copyNumber = (this.copyCountByBase.get(base) ?? 0) + 1;
        this.copyCountByBase.set(base, copyNumber);
        const id = copyNumber === 1 ? base : `${base}:${copyNumber}`;
        this.cardIdByUuid.set(uuid, id);
        return id;
    }

    /**
     * Log a recorder error without ever crashing gameplay. Rate-limited so a handler
     * that throws every event can't flood the logs; recording stays best-effort.
     */
    private logError(where: string, error: unknown): void {
        if (this.loggedErrorCount >= PgnReplayRecorder.maxLoggedErrors) {
            return;
        }
        this.loggedErrorCount++;
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(`PgnReplayRecorder: error in ${where} (recording skipped): ${message}`);
        if (this.loggedErrorCount === PgnReplayRecorder.maxLoggedErrors) {
            logger.warn('PgnReplayRecorder: further recording errors will be suppressed for this game');
        }
    }

    /** Increment the action counter and reset sub-event counter. Emits game state for the previous action. */
    private incrementAction(): void {
        // Emit game state snapshot for the previous action (if there was one)
        if (this.actionCounter > 0) {
            this.emitGameState();
        }
        this.actionCounter++;
        this.subEventCounter = 0;
        this.addStructureMarker('action');
    }

    /** Convert a sub-event counter (0-based) to a letter suffix: 0→'a', 1→'b', … */
    private subEventLetter(n: number): string {
        return String.fromCharCode('a'.charCodeAt(0) + n);
    }

    /**
     * Build the seq string for the current position.
     *   Action phase top-level:  R{round}.{phase}.{action}
     *   Action phase sub-event:  R{round}.{phase}.{action}{letter}
     *   Setup / Regroup:         R{round}.{phase}.{counter}
     */
    private buildSeq(isTopLevel: boolean): string {
        const r = `R${this.currentRound}`;
        const p = this.currentPhase;

        if (p === 'A') {
            if (isTopLevel) {
                return `${r}.${p}.${this.actionCounter}`;
            }
            const letter = this.subEventLetter(this.subEventCounter);
            return `${r}.${p}.${this.actionCounter}${letter}`;
        }

        return `${r}.${p}.${this.phaseEventCounter}`;
    }

    /**
     * For Action Phase: increments actionCounter (top-level) and returns seq.
     * For Setup/Regroup: increments phaseEventCounter and returns seq.
     * For Action Phase sub-events: increments subEventCounter and returns seq.
     */
    private nextSeq(isTopLevelAction: boolean): string {
        if (this.currentPhase === 'A') {
            if (isTopLevelAction) {
                this.incrementAction();
                return this.buildSeq(true);
            }
            const seq = this.buildSeq(false);
            this.subEventCounter++;
            return seq;
        }
        this.phaseEventCounter++;
        return this.buildSeq(false);
    }

    /** Push a record into both the records and replayRecords arrays. */
    private push(record: IPgnReplayRecord): void {
        this.maybeCheckpoint();
        this.records.push(record);
        this.replayRecords.push(record);
    }

    /**
     * Capture a rollback checkpoint the first time a record is pushed under a new
     * snapshot id. The game takes a state snapshot (action/quick/phase) before the
     * effects it precedes, so the first push afterward captures the array lengths +
     * counters as they were *at that snapshot* (before its records). rollbackTo() then
     * truncates back to that boundary, dropping exactly the undone records. Keyed off
     * snapshotManager.currentSnapshotId, which is restored to the rolled-back value on
     * undo. No-op when there is no snapshot manager (unit-test stubs).
     */
    private maybeCheckpoint(): void {
        let snapshotId: number;
        try {
            snapshotId = this.game.snapshotManager?.currentSnapshotId ?? -1;
        } catch {
            return;
        }
        if (snapshotId < 0) {
            return;
        }
        const last = this.checkpoints[this.checkpoints.length - 1];
        if (last && last.snapshotId === snapshotId) {
            return;
        }
        this.checkpoints.push({
            snapshotId,
            recordsLen: this.records.length,
            replayLen: this.replayRecords.length,
            markersLen: this.structureMarkers.length,
            currentRound: this.currentRound,
            currentPhase: this.currentPhase,
            currentPhaseDisplayName: this.currentPhaseDisplayName,
            actionCounter: this.actionCounter,
            phaseEventCounter: this.phaseEventCounter,
            subEventCounter: this.subEventCounter,
            lastGameStateStr: this.lastGameStateStr,
        });
    }

    /** Add a structure marker at the current message log position. */
    private addStructureMarker(type: IStructureMarker['type']): void {
        const marker: IStructureMarker = {
            messageIndex: this.game.gameChat.messages.length,
            type,
            round: this.currentRound,
            phase: type === 'phase' ? this.currentPhaseDisplayName : this.currentPhase,
        };
        if (type === 'action') {
            marker.actionNumber = this.actionCounter;
        }
        this.structureMarkers.push(marker);
    }

    /**
     * Capture a single player's state snapshot.
     */
    private capturePlayerState(player: Player): IPgnPlayerStateSnapshot {
        const base = player.base;
        return {
            baseHp: base?.remainingHp ?? 0,
            baseMaxHp: base?.getPrintedHp?.() ?? 30, // 30 is the standard base HP; fallback for when getter is unavailable
            handSize: player.hand?.length ?? 0,
            resourcesReady: player.readyResourceCount ?? 0,
            resourcesExhausted: player.exhaustedResourceCount ?? 0,
            resourcesTotal: (player.readyResourceCount ?? 0) + (player.exhaustedResourceCount ?? 0),
            credits: player.creditTokenCount ?? 0,
            hasForce: player.hasTheForce ?? false,
            hasInitiative: player.hasInitiative?.() ?? false,
            groundUnits: player.getCardsInZone?.(ZoneName.GroundArena)?.length ?? 0,
            spaceUnits: player.getCardsInZone?.(ZoneName.SpaceArena)?.length ?? 0,
        };
    }

    /**
     * Emit a GAME_STATE record and structure marker with full game state snapshot.
     * Called after every top-level player action completes (all sub-events resolved).
     */
    private emitGameState(): void {
        try {
            const players = this.game.getPlayers();
            if (players.length < 2) return;

            const p1State = this.capturePlayerState(players[0]);
            const p2State = this.capturePlayerState(players[1]);
            const snapshot: IPgnGameStateSnapshot = { p1: p1State, p2: p2State };

            // Deduplicate: skip if identical to last GAME_STATE
            const snapshotStr = JSON.stringify(snapshot);
            if (snapshotStr === this.lastGameStateStr) {
                return; // Skip duplicate
            }
            this.lastGameStateStr = snapshotStr;

            const seq = this.nextSeq(false);
            this.push({
                seq,
                type: PgnActionType.GameState,
                p1BaseHp: p1State.baseHp,
                p1BaseMaxHp: p1State.baseMaxHp,
                p1HandSize: p1State.handSize,
                p1ResourcesReady: p1State.resourcesReady,
                p1ResourcesExhausted: p1State.resourcesExhausted,
                p1Credits: p1State.credits,
                p1HasForce: p1State.hasForce,
                p1HasInitiative: p1State.hasInitiative,
                p1GroundUnits: p1State.groundUnits,
                p1SpaceUnits: p1State.spaceUnits,
                p2BaseHp: p2State.baseHp,
                p2BaseMaxHp: p2State.baseMaxHp,
                p2HandSize: p2State.handSize,
                p2ResourcesReady: p2State.resourcesReady,
                p2ResourcesExhausted: p2State.resourcesExhausted,
                p2Credits: p2State.credits,
                p2HasForce: p2State.hasForce,
                p2HasInitiative: p2State.hasInitiative,
                p2GroundUnits: p2State.groundUnits,
                p2SpaceUnits: p2State.spaceUnits,
            });

            // Emit the full state snapshot for the .swureplay file once per top-level
            // action, paired with the summary GAME_STATE record just pushed. The replay
            // viewer steps through these snapshot records, so per-action granularity is
            // what produces smooth action-by-action playback (vs. per-phase, which jumps
            // a whole phase/round per step). The dedup early-return above already skips
            // identical consecutive states, so no redundant snapshots are written.
            if (this.getStateSnapshot) {
                try {
                    const fullSnapshot = this.getStateSnapshot();
                    this.replayRecords.push({
                        seq: `${seq}-snapshot`,
                        type: PgnActionType.GameState,
                        snapshot: fullSnapshot,
                    } as IPgnReplayRecord);
                } catch (error) {
                    this.logError('action snapshot', error);
                }
            }

            // Add structure marker for freeform display
            this.structureMarkers.push({
                messageIndex: this.game.gameChat.messages.length,
                type: 'gameState',
                gameState: snapshot,
            });
        } catch (error) {
            this.logError('event handler', error);
        }
    }

    // ── Map PhaseName → abbreviation ─────────────────────────────────────────

    private phaseAbbr(phase: string): string {
        switch (phase) {
            case PhaseName.Setup:
                return 'S';
            case PhaseName.Action:
                return 'A';
            case PhaseName.Regroup:
                return 'G';
            default:
                return phase?.charAt(0).toUpperCase() ?? '?';
        }
    }

    /**
     * Advances round tracking when a new round begins, emitting the ROUND_START
     * record + round structure marker exactly once per round.
     *
     * Driven by the reliable `game.roundNumber` rather than the OnBeginRound event:
     * the begin-round step's event window never resolves to EventEmitter (`.on`)
     * listeners, so OnBeginRound never reaches this recorder. OnPhaseStarted does
     * fire reliably, so we re-sync the round there. Idempotent — only acts when the
     * game's round number has advanced past the last one we recorded, so it is safe
     * to call from multiple listeners (and recovers correctly after a rollback reset,
     * which zeroes currentRound).
     */
    private syncRound(): void {
        const round = this.game.roundNumber ?? this.currentRound;
        if (round <= this.currentRound) {
            return;
        }
        this.currentRound = round;
        if (this.playerMap.size === 0) {
            this.initPlayerMap();
        }
        this.phaseEventCounter = 0;
        this.actionCounter = 0;
        this.subEventCounter = 0;
        // Note: no human round-header marker is emitted. The freeform log already shows
        // round boundaries via the game's own "Round: N - Phase" chat lines, so a
        // separate "ROUND N" marker would just duplicate them. We still record the
        // machine-readable ROUND_START below with the correct round number.
        this.push({
            seq: `R${this.currentRound}.start`,
            type: PgnActionType.RoundStart,
            round: this.currentRound,
        });
    }

    // ── Listener registration ─────────────────────────────────────────────────

    private registerListeners(): void {
        // Structural events.
        // NOTE: OnBeginRound does not reach .on() listeners (its event window never
        // resolves to EventEmitter listeners), so round tracking is actually driven by
        // syncRound() from OnPhaseStarted below. This listener is kept for correctness
        // if that engine behavior is ever fixed; syncRound() is idempotent.
        this.game.on(EventName.OnBeginRound, (event: any) => {
            try {
                this.syncRound();
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnRoundEnded, (event: any) => {
            try {
                this.push({
                    seq: `R${this.currentRound}.end`,
                    type: PgnActionType.RoundEnd,
                    round: this.currentRound,
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnPhaseStarted, (event: any) => {
            try {
                // OnBeginRound never reaches us, so detect a new round here (where
                // game.roundNumber is reliably up to date) before recording the phase.
                this.syncRound();
                const phaseName: string = event?.phase ?? this.game.currentPhase ?? '';
                this.currentPhase = this.phaseAbbr(phaseName);
                this.currentPhaseDisplayName = phaseName === PhaseName.Setup ? 'Setup Phase'
                    : phaseName === PhaseName.Action ? 'Action Phase' : 'Regroup Phase';
                this.phaseEventCounter = 0;
                this.actionCounter = 0;
                this.subEventCounter = 0;
                this.addStructureMarker('phase');
                this.push({
                    seq: `R${this.currentRound}.${this.currentPhase}.start`,
                    type: PgnActionType.PhaseStart,
                    phase: this.currentPhase,
                    round: this.currentRound,
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnPhaseEnded, (event: any) => {
            try {
                // Emit game state (summary + full snapshot) for the last action of the
                // phase. emitGameState() now writes the per-action full snapshot itself,
                // so there is no separate per-phase snapshot.
                if (this.actionCounter > 0 || this.phaseEventCounter > 0) {
                    this.emitGameState();
                }

                const phaseName: string = event?.phase ?? this.game.currentPhase ?? '';
                const phaseAbbr = this.phaseAbbr(phaseName);
                this.push({
                    seq: `R${this.currentRound}.${phaseAbbr}.end`,
                    type: PgnActionType.PhaseEnd,
                    phase: phaseAbbr,
                    round: this.currentRound,
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        // ── Top-level player actions ─────────────────────────────────────────

        this.game.on(EventName.OnCardPlayed, (event: any) => {
            try {
                const card = event?.card;
                const player = event?.player ?? card?.owner;
                const playType: string = event?.playType ?? '';
                let actionType = PgnActionType.Play;
                const printedType: string = card?.printedType ?? '';
                if (printedType === 'event') {
                    actionType = PgnActionType.PlayEvent;
                } else if (playType === 'piloting' || printedType === 'basicUpgrade' || printedType === 'leaderUpgrade' || printedType === 'tokenUpgrade' || printedType === 'nonLeaderUnitUpgrade') {
                    actionType = PgnActionType.PlayUpgrade;
                } else if (playType === 'smuggle') {
                    actionType = PgnActionType.PlaySmuggle;
                }
                const seq = this.nextSeq(true);
                this.push({
                    seq,
                    type: actionType,
                    player: this.anonymizePlayer(player),
                    card: this.cardId(card),
                    zone: card?.zoneName ?? '',
                    playType,
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnLeaderDeployed, (event: any) => {
            try {
                const card = event?.card;
                const player = card?.owner ?? event?.player;
                const seq = this.nextSeq(true);
                this.push({
                    seq,
                    type: PgnActionType.DeployLeader,
                    player: this.anonymizePlayer(player),
                    card: this.cardId(card),
                    zone: card?.zoneName ?? '',
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnAttackDeclared, (event: any) => {
            try {
                const attack = event?.attack;
                const attacker = attack?.attacker;
                const attackingPlayer = attack?.attackingPlayer;
                const targets = attack?.getAllTargets?.() ?? [];
                const defender = targets[0] ?? null;
                const defenderType: string = defender?.printedType ?? '';
                const seq = this.nextSeq(true);
                this.push({
                    seq,
                    type: PgnActionType.Attack,
                    player: this.anonymizePlayer(attackingPlayer),
                    attacker: this.cardId(attacker),
                    defender: this.cardId(defender),
                    defenderType,
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnPassActionPhasePriority, (event: any) => {
            try {
                const player = event?.player;
                const seq = this.nextSeq(true);
                this.push({
                    seq,
                    type: PgnActionType.Pass,
                    player: this.anonymizePlayer(player),
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnClaimInitiative, (event: any) => {
            try {
                const player = event?.player;
                const seq = this.nextSeq(true);
                this.push({
                    seq,
                    type: PgnActionType.ClaimInitiative,
                    player: this.anonymizePlayer(player),
                });
            } catch (error) {
                this.logError('event handler', error);
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
                    type: PgnActionType.Damage,
                    source: this.cardId(source),
                    target: this.cardId(card),
                    amount: event?.damageDealt ?? event?.amount ?? 0,
                    damageType: event?.type ?? '',
                    remainingHp: card?.remainingHp ?? 0,
                });
            } catch (error) {
                this.logError('event handler', error);
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
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Defeat,
                    card: this.cardId(card),
                    reason,
                    defeatedBy: this.cardId(defeatedBy),
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnCardsDrawn, (event: any) => {
            try {
                const player = event?.player;
                const cards: any[] = event?.cards ?? [];
                const count: number = event?.amount ?? cards.length ?? 0;
                const cardIds = cards.map((c: any) => this.cardId(c)).filter((id: string) => id !== 'unknown');
                const cardNames = cards.map((c: any) => SwuPgn.formatCardName(c?.title, c?.subtitle)).filter(Boolean);
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Draw,
                    player: this.anonymizePlayer(player),
                    count,
                    cards: cardIds.length > 0 ? cardIds : undefined,
                });
                // Add structure marker with card names for freeform display
                if (cardNames.length > 0) {
                    this.structureMarkers.push({
                        messageIndex: this.game.gameChat.messages.length,
                        type: 'drawnCards',
                        drawnCards: cardNames,
                        player: this.anonymizePlayer(player),
                    });
                }
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnCardResourced, (event: any) => {
            try {
                const card = event?.card;
                const player = event?.resourceControllingPlayer ?? card?.owner;
                const cardName = card ? SwuPgn.formatCardName(card.title, card.subtitle) : undefined;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Resource,
                    player: this.anonymizePlayer(player),
                    card: this.cardId(card),
                    cardName,
                });
                // Add structure marker with card name for freeform display
                if (cardName) {
                    this.structureMarkers.push({
                        messageIndex: this.game.gameChat.messages.length,
                        type: 'resourcedCard',
                        resourcedCard: cardName,
                        player: this.anonymizePlayer(player),
                    });
                }
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnCardExhausted, (event: any) => {
            try {
                const card = event?.card;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Exhaust,
                    card: this.cardId(card),
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnCardReadied, (event: any) => {
            try {
                const card = event?.card;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Ready,
                    card: this.cardId(card),
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnDamageHealed, (event: any) => {
            try {
                const card = event?.card;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Heal,
                    card: this.cardId(card),
                    amount: event?.damageHealed ?? event?.amount ?? 0,
                    remainingHp: card?.remainingHp ?? 0,
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnTokensCreated, (event: any) => {
            try {
                const tokens: any[] = event?.generatedTokens ?? [];
                for (const token of tokens) {
                    const player = token?.owner;
                    const seq = this.nextSeq(false);
                    this.push({
                        seq,
                        type: PgnActionType.CreateToken,
                        player: this.anonymizePlayer(player),
                        token: token?.title ?? token?.name ?? 'unknown',
                        zone: token?.zoneName ?? '',
                    });
                }
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnCardCaptured, (event: any) => {
            try {
                const card = event?.card;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Capture,
                    card: this.cardId(card),
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnRescue, (event: any) => {
            try {
                const card = event?.card;
                const player = card?.owner;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Rescue,
                    player: this.anonymizePlayer(player),
                    card: this.cardId(card),
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnCardAbilityTriggered, (event: any) => {
            try {
                const card = event?.card ?? event?.context?.source;
                const player = card?.controller ?? card?.owner;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Trigger,
                    card: this.cardId(card),
                    player: this.anonymizePlayer(player),
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnCardDiscarded, (event: any) => {
            try {
                const card = event?.card;
                const player = card?.owner;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Discard,
                    card: this.cardId(card),
                    player: this.anonymizePlayer(player),
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnDeckShuffled, (event: any) => {
            try {
                const player = event?.player ?? event?.card?.owner;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Shuffle,
                    player: this.anonymizePlayer(player),
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnTakeControl, (event: any) => {
            try {
                const card = event?.card;
                const player = event?.newController ?? card?.controller;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.TakeControl,
                    card: this.cardId(card),
                    player: this.anonymizePlayer(player),
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnCardRevealed, (event: any) => {
            try {
                const cards: any[] = event?.cards ?? [];
                if (cards.length === 0) {
                    return;
                }
                const owner = cards[0]?.controller ?? cards[0]?.owner;
                const cardIds = cards.map((c: any) => this.cardId(c)).filter((id: string) => id !== 'unknown');
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Reveal,
                    player: this.anonymizePlayer(owner),
                    zone: event?.revealedFromZone ?? cards[0]?.zoneName ?? '',
                    cards: cardIds.length > 0 ? cardIds : undefined,
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });

        this.game.on(EventName.OnDeckSearch, (event: any) => {
            try {
                const player = event?.player;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Search,
                    player: this.anonymizePlayer(player),
                    count: event?.searchWholeDeck ? undefined : (event?.amount ?? undefined),
                    wholeDeck: event?.searchWholeDeck ? true : undefined,
                });
            } catch (error) {
                this.logError('event handler', error);
            }
        });
    }
}
