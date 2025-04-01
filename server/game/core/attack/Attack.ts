import type Game from '../Game';
import type { Card } from '../card/Card';
import * as Contract from '../utils/Contract';
import { EffectName, KeywordName } from '../Constants';
import type { IAttackableCard } from '../card/CardInterfaces';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';


type StatisticTotal = number;

export class Attack {
    private readonly game: Game;
    public readonly attacker: IUnitCard;
    public readonly attackerInPlayId: number;
    public readonly isAmbush: boolean;
    private targets: IAttackableCard[];

    public previousAttack: Attack;

    public constructor(
        game: Game,
        attacker: IUnitCard,
        targets: IAttackableCard[],
        isAmbush: boolean = false
    ) {
        this.game = game;
        this.attacker = attacker;
        this.targets = targets;

        // we grab the in-play IDs of the attacker and defender cards in case other abilities need to refer back to them later.
        // e.g., to check if the defender was defeated
        this.attackerInPlayId = attacker.inPlayId;

        this.isAmbush = isAmbush;
    }

    public getAttackerTotalPower(): number | null {
        return this.getUnitPower(this.attacker);
    }

    public getSingleTarget(): IAttackableCard {
        Contract.assertTrue(this.targets.length === 1, 'Expected one target but there are multiple');
        return this.targets[0];
    }

    public getAllTargets(): IAttackableCard[] {
        return this.targets;
    }

    public isTargetUnit(allowMultipleMatches: boolean = false): boolean {
        const matchingUnits = [];

        for (const target of this.targets) {
            if (target.isUnit()) {
                matchingUnits.push(target);
            }
        }

        if (!allowMultipleMatches) {
            Contract.assertFalse(matchingUnits.length > 1, 'Expected at most one target to match the condition');
        }
        return matchingUnits.length > 0;
    }

    public isTargetUnitWithCondition(condition: (card: IUnitCard) => boolean, allowMultipleMatches: boolean = false): boolean {
        const matchingUnits = [];

        for (const target of this.targets) {
            if (!target.isUnit()) {
                continue;
            }
            if (!target.isInPlay()) {
                continue;
            }
            if (condition(target)) {
                matchingUnits.push(target);
            }
        }

        if (!allowMultipleMatches) {
            Contract.assertFalse(matchingUnits.length > 1, 'Expected at most one target to match the condition');
        }
        return matchingUnits.length > 0;
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
