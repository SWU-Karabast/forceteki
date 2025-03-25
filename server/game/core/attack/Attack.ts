import { GameObject } from '../GameObject';
import type Game from '../Game';
import type { Card } from '../card/Card';
import * as Contract from '../utils/Contract';
import { EffectName, KeywordName } from '../Constants';
import type { IAttackableCard } from '../card/CardInterfaces';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';


type StatisticTotal = number;

export class Attack extends GameObject {
    public readonly attacker: IUnitCard;
    public readonly attackerInPlayId: number;
    public readonly isAmbush: boolean;
    public readonly targets: IAttackableCard[];
    public readonly targetsInPlayId?: number[];

    public previousAttack: Attack;

    public constructor(
        game: Game,
        attacker: IUnitCard,
        targets: IAttackableCard[],
        isAmbush: boolean = false
    ) {
        super(game, 'Attack');

        this.attacker = attacker;
        this.targets = targets;

        // we grab the in-play IDs of the attacker and defender cards in case other abilities need to refer back to them later.
        // e.g., to check if the defender was defeated
        this.attackerInPlayId = attacker.inPlayId;
        this.targetsInPlayId = targets.map((target) => (target.canBeInPlay() ? target.inPlayId : null));

        this.isAmbush = isAmbush;
    }

    public getAttackerTotalPower(): number | null {
        return this.getUnitPower(this.attacker);
    }

    public getTargetTotalPower(): number | null {
        return this.targets.reduce((total, target) => total + (target.isBase() ? 0 : this.getUnitPower(target)), 0);
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
        for (const target of this.targets) {
            if (target.isBase() || target.isInPlay()) {
                continue;
            } else {
                return false;
            }
        }
        return true;
    }

    public isInvolved(card: Card): boolean {
        return (
            ([this.attacker as Card, this.targets as Card[]].includes(card))
        );
    }

    // TODO: if we end up using this we need to refactor it to reflect attacks in SWU (i.e., show HP)
    public getTotalsForDisplay(): string {
        return `${this.attacker.name}: ${this.getAttackerTotalPower()} vs ${this.getTargetTotalPower()}: ${this.targets.map((target) => target.name).join(', ')}`;
    }

    private getUnitPower(involvedUnit: IUnitCard): StatisticTotal {
        Contract.assertTrue(involvedUnit.isInPlay(), `Unit ${involvedUnit.name} zone is ${involvedUnit.zoneName}, cannot participate in combat`);

        return involvedUnit.getPower();
    }
}
