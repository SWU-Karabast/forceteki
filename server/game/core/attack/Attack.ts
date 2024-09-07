import { GameObject } from '../GameObject';
import { EffectName, EventName, Location } from '../Constants';
import * as EnumHelpers from '../utils/EnumHelpers';
import { EventRegistrar } from '../event/EventRegistrar';
import type Game from '../Game';
import type Player from '../Player';
import { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import Contract from '../utils/Contract';
import { NonLeaderUnitCard } from '../card/NonLeaderUnitCard';
import { CardWithDamageProperty, UnitCard } from '../card/CardTypes';

export interface IAttackAbilities {
    saboteur: boolean; // TODO: I think we can remove this?
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
        return this.target.isBase()
            ? null
            : this.getUnitPower(this.target);
    }

    public constructor(
        game: Game,
        public attacker: UnitCard,
        public target: CardWithDamageProperty
    ) {
        super(game, 'Attack');
    }

    public isValid(): boolean {
        if (!EnumHelpers.isArena(this.attacker.location)) {
            return false;
        }
        if (!this.target.isBase() && !EnumHelpers.isArena(this.target.location)) {
            return false;
        }
        return true;
    }

    public isInvolved(card: Card): boolean {
        return (
            ([this.attacker as Card, this.target as Card].includes(card))
        );
    }

    // TODO: if we end up using this we need to refactor it to reflect attacks in SWU (i.e., show HP)
    public getTotalsForDisplay(): string {
        return `${this.attacker.name}: ${this.attackerTotalPower} vs ${this.targetTotalPower}: ${this.target.name}`;
    }

    private getUnitPower(involvedUnit: UnitCard): StatisticTotal {
        if (!Contract.assertTrue(EnumHelpers.isArena(involvedUnit.location), `Unit ${involvedUnit.name} location is ${involvedUnit.location}, cannot participate in combat`)) {
            return null;
        }

        return involvedUnit.power;
    }
}
