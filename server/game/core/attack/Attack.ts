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
import { CardWithHp, UnitCard } from '../card/CardTypes';

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

    public get targetTotalPower(): number | null {
        return this.targetIsBase
            ? null
            : this.getUnitPower(this.target as UnitCard);
    }

    public get targetIsBase(): boolean {
        return this.target.isBase();
    }

    public constructor(
        game: Game,
        public attacker: UnitCard,
        public target: CardWithHp
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

    // TODO: if we end up using this we need to refactor it to reflect attacks in SWU (i.e., show HP)
    public getTotalsForDisplay(): string {
        return `${this.attacker.name}: ${this.attackerTotalPower} vs ${this.targetTotalPower}: ${this.target.name}`;
    }

    private getUnitPower(involvedUnit: UnitCard): StatisticTotal {
        if (!Contract.assertTrue(isArena(involvedUnit.location), `Unit ${involvedUnit.name} location is ${involvedUnit.location}, cannot participate in combat`)) {
            return null;
        }

        return involvedUnit.power;
    }
}
