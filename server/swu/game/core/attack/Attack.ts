import { GameObject } from '../GameObject';
import { EffectNames, EventNames, Locations, isArena } from '../Constants';
import { EventRegistrar } from '../event/EventRegistrar';
import type Game from '../game';
import type Player from '../player';
import { AbilityContext } from '../../AbilityContext';
import type BaseCard from '../card/basecard';

export interface AttackAbilities {
    saboteur: boolean;
}

enum AttackParticipant {
    Attacker,
    Target
}

type StatisticTotal = number;

export class Attack extends GameObject {
    #modifiers = new WeakMap<Player, AttackAbilities>();
    previousAttack: Attack;

    constructor(
        public game: Game,
        public attacker: BaseCard,
        public target: BaseCard
    ) {
        super(game, 'Attack');
    }

    get participants(): undefined | BaseCard[] {
        return [...[this.attacker], this.target];
    }

    isInvolved(card: BaseCard): boolean {
        return (
            isArena(card.location) &&
            ([this.attacker as BaseCard, this.target as BaseCard].includes(card))
        );
    }

    getTotalsForDisplay(): string {
        const rawAttacker = this.#getTotalPower(this.attacker);
        const rawTarget = this.#getTotalPower(this.target);

        return `${this.attacker.name}: ${typeof rawAttacker === 'number' ? rawAttacker : 0} vs ${typeof rawTarget === 'number' ? rawTarget : 0}: ${this.target.name}`;
    }

    get attackerTotalPower(): number | null {
        return this.#getTotalPower(this.attacker)
    }

    get defenderTotalPower(): number | null {
        return this.targetIsBase ? null : this.#getTotalPower(this.target);
    }

    get targetIsBase(): boolean {
        return this.target.isBase;
    }

    // TODO: could we just use the get power already implemented on basecard?
    #getTotalPower(involvedUnit: BaseCard): StatisticTotal {
        if (!isArena(involvedUnit.location)) {
            return null;
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
}