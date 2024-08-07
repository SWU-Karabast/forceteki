import { GameObject } from '../GameObject';
import { EffectName, EventName, Location } from '../Constants';
import { isArena } from '../utils/EnumHelpers';
import { EventRegistrar } from '../event/EventRegistrar';
import type Game from '../Game';
import type Player from '../Player';
import { AbilityContext } from '../ability/AbilityContext';
import type Card from '../card/Card';

export interface IAttackAbilities {
    saboteur: boolean;
}

enum AttackParticipant {
    Attacker,
    Target
}

type StatisticTotal = number;

export class Attack extends GameObject {
    // #modifiers = new WeakMap<Player, IAttackAbilities>();
    previousAttack: Attack;

    constructor(
        game: Game,
        public attacker: Card,
        public target: Card
    ) {
        super(game, 'Attack');
    }

    get participants(): undefined | Card[] {
        return [...[this.attacker], this.target];
    }

    isInvolved(card: Card): boolean {
        return (
            isArena(card.location) &&
            ([this.attacker as Card, this.target as Card].includes(card))
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
    #getTotalPower(involvedUnit: Card): StatisticTotal {
        if (!isArena(involvedUnit.location)) {
            return null;
        }

        const rawEffects = involvedUnit.getRawEffects().filter((effect) => effect.type === EffectName.ModifyPower);
        let effectModifier = 0;

        const result = involvedUnit.getBasePower();

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