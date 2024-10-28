import { GameObject } from '../GameObject';
import type Game from '../Game';
import type { Card } from '../card/Card';
import * as Contract from '../utils/Contract';
import { CardWithDamageProperty, UnitCard } from '../card/CardTypes';
import { EffectName, KeywordName } from '../Constants';


type StatisticTotal = number;

export class Attack extends GameObject {
    public previousAttack: Attack;

    public constructor(
        game: Game,
        public attacker: UnitCard,
        public target: CardWithDamageProperty,
        public isAmbush: boolean = false
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

    public attackerDealsDamageBeforeDefender(): boolean {
        return this.attacker.hasOngoingEffect(EffectName.DealsDamageBeforeDefender);
    }

    public isAttackerInPlay(): boolean {
        return this.attacker.isInPlay();
    }

    public isAttackTargetLegal(): boolean {
        return this.target.isBase() || this.target.isInPlay();
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
        Contract.assertTrue(involvedUnit.isInPlay(), `Unit ${involvedUnit.name} location is ${involvedUnit.location}, cannot participate in combat`);

        return involvedUnit.getPower();
    }
}
