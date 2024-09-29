import { GameObject } from '../GameObject';
import * as EnumHelpers from '../utils/EnumHelpers';
import type Game from '../Game';
import type { Card } from '../card/Card';
import * as Contract from '../utils/Contract';
import { CardWithDamageProperty, UnitCard } from '../card/CardTypes';
import { KeywordName } from '../Constants';


type StatisticTotal = number;

export class Attack extends GameObject {
    public previousAttack: Attack;

    public constructor(
        game: Game,
        public attacker: UnitCard,
        public target: CardWithDamageProperty
    ) {
        super(game, 'Attack');
    }

    public getAttackerTotalPower(): number | null {
        return this.getUnitPower(this.attacker);
    }

    public getTargetTotalPower(): number | null {
        return this.target.isBase()
            ? null
            : this.getUnitPower(this.target);
    }

    public hasOverwhelm(): boolean {
        return this.attacker.hasSomeKeyword(KeywordName.Overwhelm);
    }

    public isAttackerInPlay(): boolean {
        return EnumHelpers.isArena(this.attacker.location);
    }

    public isDefenderInPlay(): boolean {
        return this.target.isBase() || EnumHelpers.isArena(this.target.location);
    }

    public isInvolved(card: Card): boolean {
        return (
            ([this.attacker as Card, this.target as Card].includes(card))
        );
    }

    // TODO: if we end up using this we need to refactor it to reflect attacks in SWU (i.e., show HP)
    public getTotalsForDisplay(): string {
        return `${this.attacker.name}: ${this.getAttackerTotalPower()} vs ${this.getTargetTotalPower()}: ${this.target.name}`;
    }

    private getUnitPower(involvedUnit: UnitCard): StatisticTotal {
        Contract.assertTrue(EnumHelpers.isArena(involvedUnit.location), `Unit ${involvedUnit.name} location is ${involvedUnit.location}, cannot participate in combat`);

        return involvedUnit.getPower();
    }
}
