import { GameObject } from '../GameObject';
import { EffectName, EventName, Location } from '../Constants';
import { isArena } from '../utils/EnumHelpers';
import { EventRegistrar } from '../event/EventRegistrar';
import type Game from '../Game';
import type Player from '../Player';
import { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import Contract from '../utils/Contract';
import { NonLeaderUnitCard } from '../card/NonLeaderUnitCard';

export interface IAttackAbilities {
    saboteur: boolean;
}

type StatisticTotal = number;

export class Attack extends GameObject {
    public previousAttack: Attack;

    public get participants(): undefined | Card[] {
        return [...[this.attacker], this.target];
    }

    public get attackerTotalPower(): number | null {
        return this.getUnitPower(this.attacker);
    }

    public get defenderTotalPower(): number | null {
        return this.targetIsBase ? null : this.getUnitPower(this.target);
    }

    public get targetIsBase(): boolean {
        return this.target.isBase();
    }

    public constructor(
        game: Game,
        public attacker: NonLeaderUnitCard,
        public target: NonLeaderUnitCard
    ) {
        super(game, 'Attack');
    }

    public isInvolved(card: Card): boolean {
        return (
            (card.isUnit() || card.isBase()) &&
            isArena(card.location) &&
            ([this.attacker as Card, this.target as Card].includes(card))
        );
    }

    public getTotalsForDisplay(): string {
        const rawAttacker = this.getUnitPower(this.attacker);
        const rawTarget = this.getUnitPower(this.target);

        return `${this.attacker.name}: ${typeof rawAttacker === 'number' ? rawAttacker : 0} vs ${typeof rawTarget === 'number' ? rawTarget : 0}: ${this.target.name}`;
    }

    private getUnitPower(involvedUnit: NonLeaderUnitCard): StatisticTotal {
        if (!Contract.assertTrue(isArena(involvedUnit.location), `Unit ${involvedUnit.name} location is ${involvedUnit.location}, cannot participate in combat`)) {
            return null;
        }

        return involvedUnit.power;
    }
}
