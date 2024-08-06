import { GameObject } from './GameObject';
import { DuelTypes, EffectNames, EventNames, Locations } from './Constants';
import { GameMode, parseGameMode } from './GameMode';
import { EventRegistrar } from './EventRegistrar';
import type DrawCard from './drawcard';
import type Game from './game';
import type Player from './player';
import { AbilityContext } from './AbilityContext';
import type BaseCard from './basecard';

/**
 * Used to track whether a player has played a specific type of duel effect yet
 */
export interface DuelAbilities {
    challenge: boolean;
    focus: boolean;
    strike: boolean;
}

enum DuelParticipants {
    Challenger,
    Target
}

const InvalidStats = Symbol('Invalid stats');

type StatisticTotal = typeof InvalidStats | number;

const listFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

export class Duel extends GameObject {
    #bidFinished = false;
    #modifiers = new WeakMap<Player, DuelAbilities>();
    loser?: DrawCard[];
    losingPlayer?: Player;
    previousDuel?: Duel;
    winner?: DrawCard[];
    winningPlayer?: Player;
    gameModeOpts: GameMode;
    finalDifference?: number;
    private eventRegistrar?: EventRegistrar;

    constructor(
        public game: Game,
        public challenger: DrawCard,
        public targets: DrawCard[],
        public duelType: DuelTypes,
        public properties: {
            requiresConflict?: boolean;
            targetCondition?: (card: DrawCard, context: AbilityContext) => boolean;
        },
        private statistic?: (card: DrawCard, duelRules: 'currentSkill' | 'printedSkill' | 'skirmish') => number,
        public challengingPlayer = challenger.controller
    ) {
        super(game, 'Duel');
        this.gameModeOpts = parseGameMode(this.game.gameMode);
        this.#initializeDuelModifiers(challenger.controller);

        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnCardAbilityTriggered]);
    }

    get winnerController(): undefined | Player {
        return this.winner?.[0].controller;
    }

    get loserController(): undefined | Player {
        return this.loser?.[0].controller;
    }

    get participants(): undefined | DrawCard[] {
        return [...[this.challenger], ...this.targets];
    }

    public playerCanTriggerChallenge(player: Player): boolean {
        return !this.#modifiers.get(player)?.challenge ?? false;
    }

    public playerCanTriggerFocus(player: Player): boolean {
        return !this.#modifiers.get(player)?.focus ?? false;
    }

    public playerCanTriggerStrike(player: Player): boolean {
        return !this.#modifiers.get(player)?.strike ?? false;
    }

    addTargetToDuel(card: DrawCard) {
        this.targets.push(card);
    }

    replaceTargetInDuel(oldTarget: DrawCard, newTarget: DrawCard) {
        this.targets = this.targets.filter((a) => a !== oldTarget);
        this.targets.push(newTarget);
    }

    canAddToDuel(card: DrawCard, context: AbilityContext) {
        return (
            !this.participants.includes(card) &&
            card.controller !== this.challengingPlayer &&
            this.#allowedTargetCondition(card, context)
        );
    }

    #allowedTargetCondition(card: DrawCard, context: AbilityContext) {
        return this.properties.targetCondition
            ? this.properties.targetCondition(card, context)
            : !this.properties.requiresConflict || card.isParticipating();
    }

    isInvolved(card: BaseCard): boolean {
        return (
            card.location === Locations.PlayArea &&
            (card === this.challenger || this.targets.includes(card as DrawCard))
        );
    }

    isInvolvedInAnyDuel(card: DrawCard): boolean {
        return this.isInvolved(card) || (this.previousDuel && this.previousDuel.isInvolvedInAnyDuel(card));
    }

    getTotalsForDisplay(): string {
        const rawChallenger = this.#getStatsTotal([this.challenger], this.challengingPlayer);
        const rawTarget = this.#getStatsTotal(this.targets, this.challengingPlayer.opponent);
        const [challengerTotal, targetTotal] = this.#getTotals(
            typeof rawChallenger === 'number' ? rawChallenger : 0,
            typeof rawTarget === 'number' ? rawTarget : 0
        );
        return `${this.challenger.name}: ${challengerTotal} vs ${targetTotal}: ${this.#getTargetName()}`;
    }

    modifyDuelingSkill(): void {
        this.#bidFinished = true;
    }

    determineResult(): void {
        const challengerWins = this.challenger.mostRecentEffect(EffectNames.WinDuel) === this;
        const challengerWinsTies = this.challenger.anyEffect(EffectNames.WinDuelTies);
        const targetWinsTies = this.targets.filter((target) => target.anyEffect(EffectNames.WinDuelTies)).length > 0;

        this.#setDuelDifference();

        if (challengerWins) {
            this.#setWinner(DuelParticipants.Challenger);
            this.#setLoser(DuelParticipants.Target);
        } else {
            const challengerStats = this.#getStatsTotal([this.challenger], this.challengingPlayer);
            const targetStats = this.#getStatsTotal(this.targets, this.challengingPlayer.opponent);
            if (challengerStats === InvalidStats) {
                if (targetStats !== InvalidStats && targetStats > 0) {
                    // Challenger dead, target alive
                    this.#setWinner(DuelParticipants.Target);
                }
                // Both dead
            } else if (targetStats === InvalidStats) {
                // Challenger alive, target dead
                if (challengerStats > 0) {
                    this.#setWinner(DuelParticipants.Challenger);
                }
            } else {
                const [challengerStats2, targetStats2] = this.#getTotals(challengerStats, targetStats);

                if (challengerStats2 > targetStats2) {
                    // Both alive, challenger wins
                    this.#setWinner(DuelParticipants.Challenger);
                    this.#setLoser(DuelParticipants.Target);
                } else if (challengerStats2 < targetStats2) {
                    // Both alive, target wins
                    this.#setWinner(DuelParticipants.Target);
                    this.#setLoser(DuelParticipants.Challenger);
                } else {
                    // tie
                    if (challengerWinsTies || targetWinsTies) {
                        if (challengerWinsTies) {
                            this.#setWinner(DuelParticipants.Challenger);
                        } else {
                            this.#setLoser(DuelParticipants.Challenger);
                        }
                        if (targetWinsTies) {
                            this.#setWinner(DuelParticipants.Target);
                        } else {
                            this.#setLoser(DuelParticipants.Target);
                        }
                    }
                }
            }
        }

        const losers =
            this.loser?.filter((card) => card.checkRestrictions('loseDuels', card.game.getFrameworkContext())) ?? [];
        if (losers.length > 0) {
            this.loser = losers;
        } else {
            this.loser = undefined;
            this.losingPlayer = undefined;
        }

        if ((this.winner?.length ?? 0) > 0) {
            this.winner = this.winner;
        } else {
            this.winner = undefined;
            this.winningPlayer = undefined;
        }
    }

    #getStatsTotal(charactersOnSameSide: DrawCard[], player: Player): StatisticTotal {
        let result = 0;
        const ignoreSkill = this.participants.filter((card) => card.anyEffect(EffectNames.IgnoreDuelSkill)).length > 0;
        const duelLevelModifier = this.getRawEffects().filter((effect) => effect.type === EffectNames.ModifyDuelSkill);

        for (const effect of duelLevelModifier) {
            const effectProps = effect.value.value;
            if (effectProps.player === player) {
                result += effectProps.amount;
            }
        }

        for (const card of charactersOnSameSide) {
            if (card.location !== Locations.PlayArea) {
                return InvalidStats;
            }
            if (!ignoreSkill) {
                result += this.getSkillStatistic(card);
            }
            result += this.#getDuelModifiers(card);
        }
        return result;
    }

    #getDuelModifiers(card: DrawCard): number {
        const rawEffects = card.getRawEffects().filter((effect) => effect.type === EffectNames.ModifyDuelistSkill);
        let effectModifier = 0;

        rawEffects.forEach((effect) => {
            const props = effect.getValue();
            if (props.duel === this) {
                effectModifier += props.value;
            }
        });

        return effectModifier;
    }

    #deriveBaseStatistic(card: DrawCard): number {
        switch (this.duelType) {
            case DuelTypes.Military:
                return this.gameModeOpts.duelRules === 'printedSkill'
                    ? card.printedMilitarySkill
                    : card.getMilitarySkill();
            case DuelTypes.Political:
                return this.gameModeOpts.duelRules === 'printedSkill'
                    ? card.printedPoliticalSkill
                    : card.getPoliticalSkill();
            case DuelTypes.Glory:
                return this.gameModeOpts.duelRules === 'printedSkill' ? card.printedGlory : card.glory;
        }
    }

    getSkillStatistic(card: DrawCard): number {
        if (typeof this.statistic === 'function') {
            return this.statistic(card, this.gameModeOpts.duelRules);
        }

        let baseStatistic = this.#deriveBaseStatistic(card);

        // Some effects for the new duel framework
        if (this.gameModeOpts.duelRules === 'printedSkill') {
            let statusTokenBonus = 0;
            const useStatusTokens = this.getEffects(EffectNames.ApplyStatusTokensToDuel).length > 0;
            const ignorePrintedSkill = this.getEffects(EffectNames.DuelIgnorePrintedSkill).length > 0;

            if (ignorePrintedSkill) {
                baseStatistic = 0;
            }
            if (useStatusTokens) {
                statusTokenBonus = card.getStatusTokenSkill();
            }
            return baseStatistic + statusTokenBonus;
        }

        return baseStatistic;
    }

    #getTotals(challengerStats: number, targetStats: number): [number, number] {
        if (this.gameModeOpts.duelRules === 'skirmish') {
            if (challengerStats > targetStats) {
                challengerStats = 1;
                targetStats = 0;
            } else if (challengerStats < targetStats) {
                challengerStats = 0;
                targetStats = 1;
            } else {
                challengerStats = 0;
                targetStats = 0;
            }
        }

        if (this.#bidFinished) {
            challengerStats += this.challengingPlayer.honorBid;
            if (this.targets?.length > 0) {
                targetStats += this.challengingPlayer.opponent.honorBid;
            }
        }

        return [challengerStats, targetStats];
    }

    #getTargetName() {
        return listFormatter.format(this.targets.map((c) => c.name));
    }

    #setWinner(winner: DuelParticipants) {
        switch (winner) {
            case DuelParticipants.Challenger: {
                this.winner = [this.challenger];
                this.winningPlayer = this.challengingPlayer;
                return;
            }
            case DuelParticipants.Target: {
                this.winner = this.targets;
                this.winningPlayer = this.challengingPlayer.opponent;
                return;
            }
        }
    }

    #setLoser(loser: DuelParticipants) {
        switch (loser) {
            case DuelParticipants.Challenger: {
                this.loser = [this.challenger];
                this.losingPlayer = this.challengingPlayer;
                return;
            }
            case DuelParticipants.Target: {
                this.loser = this.targets;
                this.losingPlayer = this.challengingPlayer.opponent;
                return;
            }
        }
    }

    #setDuelDifference() {
        const challengerStats = this.#getStatsTotal([this.challenger], this.challengingPlayer);
        const targetStats = this.#getStatsTotal(this.targets, this.challengingPlayer.opponent);

        const [challengerStats2, targetStats2] = this.#getTotals(
            challengerStats === InvalidStats ? 0 : challengerStats,
            targetStats === InvalidStats ? 0 : targetStats
        );

        const difference = Math.abs(
            (challengerStats === InvalidStats ? 0 : challengerStats2) -
                (targetStats === InvalidStats ? 0 : targetStats2)
        );

        this.finalDifference = difference;
    }

    #initializeDuelModifiers(challengingPlayer: Player) {
        this.#modifiers.set(challengingPlayer, {
            challenge: false,
            focus: false,
            strike: false
        });
        if (challengingPlayer.opponent) {
            this.#modifiers.set(challengingPlayer.opponent, {
                challenge: false,
                focus: false,
                strike: false
            });
        }
    }

    cleanup() {
        this.eventRegistrar.unregisterAll();
    }

    onCardAbilityTriggered({
        context: { event, player }
    }: {
        context: { event?: { duel?: Duel; name: EventNames }; player: Player };
    }): void {
        if (event?.duel !== this) {
            return;
        }

        const playersModifiers = this.#modifiers.get(player);
        if (!playersModifiers) {
            return;
        }

        switch (event.name) {
            case EventNames.OnDuelChallenge:
                playersModifiers.challenge = true;
                break;

            case EventNames.OnDuelFocus:
                playersModifiers.focus = true;
                break;

            case EventNames.OnDuelStrike:
                playersModifiers.strike = true;
                break;
        }
    }
}