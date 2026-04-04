import type { Game } from '../Game';
import type { Player } from '../Player';
import { EventName, PhaseName } from '../Constants';
import { DefeatSourceType } from '../../IDamageOrDefeatSource';
import { SwuPgn } from './SwuPgn';
import { PgnActionType } from './PgnTypes';
import type { IPgnReplayRecord, IStructureMarker } from './PgnTypes';

/**
 * Records structured JSON replay data by listening to game events.
 * Wrap every handler in try/catch so recording bugs never crash gameplay.
 */
export class PgnReplayRecorder {
    private readonly game: Game;
    private readonly records: IPgnReplayRecord[] = [];
    private readonly structureMarkers: IStructureMarker[] = [];

    /** Map from player.id → 'P1' | 'P2' */
    private playerMap: Map<string, string> = new Map();

    /** Current round number */
    private currentRound: number = 0;

    /** Current phase abbreviation: 'S', 'A', or 'G' */
    private currentPhase: string = 'S';

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

    public getStructureMarkers(): IStructureMarker[] {
        return this.structureMarkers;
    }

    /** Initialize the P1/P2 player map from game.getPlayers() order. */
    public initPlayerMap(): void {
        const players = this.game.getPlayers();
        if (players.length >= 1) {
            this.playerMap.set(players[0].id, 'P1');
        }
        if (players.length >= 2) {
            this.playerMap.set(players[1].id, 'P2');
        }
    }

    // ── Sequence helpers ─────────────────────────────────────────────────────

    /** Returns 'P1' or 'P2' for a player, falling back to the player name. */
    private anonymizePlayer(player: Player | null | undefined): string {
        if (!player) {
            return 'unknown';
        }
        return this.playerMap.get(player.id) ?? player.name;
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

    /** Increment the action counter and reset sub-event counter. */
    private incrementAction(): void {
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
            phase: this.currentPhase,
        };
        if (type === 'action') {
            marker.actionNumber = this.actionCounter;
        }
        this.structureMarkers.push(marker);
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
                this.currentRound = this.game.roundNumber;
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
                const count: number = event?.amount ?? event?.cards?.length ?? 0;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Draw,
                    player: this.anonymizePlayer(player),
                    count,
                });
            } catch (err) {
                // Recording error — do not crash gameplay
            }
        });

        this.game.on(EventName.OnCardResourced, (event: any) => {
            try {
                const card = event?.card;
                const player = event?.resourceControllingPlayer ?? card?.owner;
                const seq = this.nextSeq(false);
                this.push({
                    seq,
                    type: PgnActionType.Resource,
                    player: this.anonymizePlayer(player),
                    card: this.cardId(card),
                });
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
