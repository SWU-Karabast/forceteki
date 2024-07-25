import { GameObject } from '../GameObject';
import { EffectNames, EventNames, Locations, isArena } from '../Constants';
import { EventRegistrar } from '../EventRegistrar';
import type DeckCard from '../card/deckcard';
import type Game from '../game';
import type Player from '../player';
import { AbilityContext } from '../AbilityContext';
import type BaseCard from '../card/basecard';

export interface AttackAbilities {
    saboteur: boolean;
}

enum AttackParticipant {
    Challenger,
    Target
}

const InvalidStats = Symbol('Invalid stats');

type StatisticTotal = typeof InvalidStats | number;

export class Attack extends GameObject {
    #bidFinished = false;
    #modifiers = new WeakMap<Player, AttackAbilities>();
    loser?: DeckCard[];
    losingPlayer?: Player;
    previousAttack?: Attack;
    winner?: DeckCard[];
    winningPlayer?: Player;
    finalDifference?: number;
    private eventRegistrar?: EventRegistrar;

    constructor(
        public game: Game,
        public attacker: DeckCard,
        public target: DeckCard,
        public properties: {
            targetCondition?: (card: DeckCard, context: AbilityContext) => boolean;
        },
        public attackingPlayer = attacker.controller
    ) {
        super(game, 'Attack');
        this.#initializeDuelModifiers(attacker.controller);

        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnCardAbilityTriggered]);
    }

    get winnerController(): undefined | Player {
        return this.winner?.[0].controller;
    }

    get loserController(): undefined | Player {
        return this.loser?.[0].controller;
    }

    get participants(): undefined | DeckCard[] {
        return [...[this.attacker], this.target];
    }

    isInvolved(card: BaseCard): boolean {
        return (
            isArena(card.location) &&
            ([this.attacker as BaseCard, this.target as BaseCard].includes(card))
        );
    }

    getTotalsForDisplay(): string {
        const rawChallenger = this.#getTotalPower(this.attacker, this.attackingPlayer);
        const rawTarget = this.#getTotalPower(this.target, this.attackingPlayer.opponent);
        const [challengerTotal, targetTotal] = this.#getTotals(
            typeof rawChallenger === 'number' ? rawChallenger : 0,
            typeof rawTarget === 'number' ? rawTarget : 0
        );
        return `${this.attacker.name}: ${challengerTotal} vs ${targetTotal}: ${this.target.name}`;
    }

    determineResult(): void {
        const attackerStats = this.#getTotalPower(this.attacker, this.attackingPlayer);

        // TODO: logic for when the attack is against a base (there's no defender)
        const defenderStats = this.#getTotalPower(this.target, this.attackingPlayer.opponent);

        if (attackerStats === InvalidStats) {
            if (defenderStats !== InvalidStats && defenderStats > 0) {
                // Challenger dead, target alive
                this.#setWinner(AttackParticipant.Target);
            }
            // Both dead
        } else if (defenderStats === InvalidStats) {
            // Challenger alive, target dead
            if (attackerStats > 0) {
                this.#setWinner(AttackParticipant.Challenger);
            }
        } else {
            const [challengerStats2, targetStats2] = this.#getTotals(attackerStats, defenderStats);

            if (challengerStats2 > targetStats2) {
                // Both alive, challenger wins
                this.#setWinner(AttackParticipant.Challenger);
                this.#setLoser(AttackParticipant.Target);
            } else if (challengerStats2 < targetStats2) {
                // Both alive, target wins
                this.#setWinner(AttackParticipant.Target);
                this.#setLoser(AttackParticipant.Challenger);
            } else {
                // tie
                if (challengerWinsTies || targetWinsTies) {
                    if (challengerWinsTies) {
                        this.#setWinner(AttackParticipant.Challenger);
                    } else {
                        this.#setLoser(AttackParticipant.Challenger);
                    }
                    if (targetWinsTies) {
                        this.#setWinner(AttackParticipant.Target);
                    } else {
                        this.#setLoser(AttackParticipant.Target);
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

    #getTotalPower(involvedUnit: DeckCard, player: Player): StatisticTotal {
        if (!isArena(involvedUnit.location)) {
            return InvalidStats;
        }

        const rawEffects = involvedUnit.getRawEffects().filter((effect) => effect.type === EffectNames.ModifyPower);
        let effectModifier = 0;

        let result = involvedUnit.getBasePower();

        rawEffects.forEach((effect) => {
            const props = effect.getValue();

            // check that the effect is live for this attack (may be useful later if multiple attacks can happen at once)
            if (props.attack === this) {
                effectModifier += props.value;
            }
        });

        return result;
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
            challengerStats += this.attackingPlayer.honorBid;
            if (this.targets?.length > 0) {
                targetStats += this.attackingPlayer.opponent.honorBid;
            }
        }

        return [challengerStats, targetStats];
    }

    #setWinner(winner: AttackParticipant) {
        switch (winner) {
            case AttackParticipant.Challenger: {
                this.winner = [this.attacker];
                this.winningPlayer = this.attackingPlayer;
                return;
            }
            case AttackParticipant.Target: {
                this.winner = this.targets;
                this.winningPlayer = this.attackingPlayer.opponent;
                return;
            }
        }
    }

    #setLoser(loser: AttackParticipant) {
        switch (loser) {
            case AttackParticipant.Challenger: {
                this.loser = [this.attacker];
                this.losingPlayer = this.attackingPlayer;
                return;
            }
            case AttackParticipant.Target: {
                this.loser = this.targets;
                this.losingPlayer = this.attackingPlayer.opponent;
                return;
            }
        }
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