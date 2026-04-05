import type { Game } from '../Game';
import type { Player } from '../Player';
import { EventName, PhaseName, ZoneName } from '../Constants';
import { DefeatSourceType } from '../../IDamageOrDefeatSource';
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

    /** Map from player.id → 'Player 1' | 'Player 2' */
    private playerMap: Map<string, string> = new Map();

    /** Map from player.name → 'Player 1' | 'Player 2' (fallback) */
    private playerNameMap: Map<string, string> = new Map();

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

    public constructor(game: Game) {
        this.game = game;
        this.registerListeners();
    }

    // ── Public Interface ─────────────────────────────────────────────────────

    public getRecords(): IPgnReplayRecord[] {
        return this.records;
    }

    public addGameEndRecord(winner: string, reason: string): void {
        try {
            this.records.push({
                seq: `R${this.currentRound}.A.end`,
                type: PgnActionType.GameEnd,
                winner,
                reason,
            });
        } catch {
            // Recording error — do not crash gameplay
        }
    }

    public getStructureMarkers(): IStructureMarker[] {
        return this.structureMarkers;
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
        try {
            if (card.isToken && card.isToken()) {
                return `TOKEN:${card.title ?? card.name ?? 'unknown'}`;
            }
            if (card.setId) {
                return SwuPgn.formatSetId(card.setId.set, card.setId.number);
            }
        } catch {
            // Fall through to name-based fallback
        }
        return card.title ?? card.name ?? 'unknown';
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

    /** Push a record into the records array. */
    private push(record: IPgnReplayRecord): void {
        this.records.push(record);
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
            baseMaxHp: base?.getPrintedHp?.() ?? 30,
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

            // Add structure marker for freeform display
            this.structureMarkers.push({
                messageIndex: this.game.gameChat.messages.length,
                type: 'gameState',
                gameState: snapshot,
            });
        } catch {
            // Recording error — do not crash gameplay
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

    // ── Listener registration ─────────────────────────────────────────────────

    private registerListeners(): void {
        // Structural events
        this.game.on(EventName.OnBeginRound, (event: any) => {
            try {
                this.currentRound = this.game.roundNumber || (this.currentRound + 1);
                if (this.playerMap.size === 0) {
                    this.initPlayerMap();
                }
                this.addStructureMarker('round');
                this.phaseEventCounter = 0;
                this.actionCounter = 0;
                this.subEventCounter = 0;
                this.push({
                    seq: `R${this.currentRound}.start`,
                    type: PgnActionType.RoundStart,
                    round: this.currentRound,
                });
            } catch (err) {
                // Recording error — do not crash gameplay
            }
        });

        this.game.on(EventName.OnRoundEnded, (event: any) => {
            try {
                this.push({
                    seq: `R${this.currentRound}.end`,
                    type: PgnActionType.RoundEnd,
                    round: this.currentRound,
                });
            } catch (err) {
                // Recording error — do not crash gameplay
            }
        });

        this.game.on(EventName.OnPhaseStarted, (event: any) => {
            try {
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
            } catch (err) {
                // Recording error — do not crash gameplay
            }
        });

        this.game.on(EventName.OnPhaseEnded, (event: any) => {
            try {
                // Emit game state for the last action of the phase
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
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
            } catch (err) {
                // Recording error — do not crash gameplay
            }
        });
    }
}
