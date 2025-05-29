import type Game from '../Game';
import type { Card } from '../card/Card';
import * as Contract from '../utils/Contract';
import { EffectName, KeywordName } from '../Constants';
import type { IAttackableCard } from '../card/CardInterfaces';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { Player } from '../Player';

export class Attack {
    private readonly game: Game;
    public readonly attacker: IUnitCard;
    public readonly attackingPlayer: Player;
    public readonly attackerInPlayId: number;
    public readonly isAmbush: boolean;
    public readonly targetInPlayMap = new Map<IAttackableCard, number>();

    private unitControllersChanged = new Set<IAttackableCard>();
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
        this.attackingPlayer = attacker.controller;
        this.targets = targets;
        this.targetInPlayMap = new Map(targets.filter((target) => target.isUnit()).map((target) => [target, target.inPlayId]));

        // we grab the in-play IDs of the attacker and defender cards in case other abilities need to refer back to them later.
        // e.g., to check if the defender was defeated
        this.attackerInPlayId = attacker.inPlayId;

        this.isAmbush = isAmbush;
    }

    public getAttackerTotalPower(): number | null {
        return this.getUnitPower(this.attacker);
    }

    public unitChangedController(unit: IAttackableCard): void {
        Contract.assertTrue(
            unit === this.attacker || this.targets.includes(unit),
            `Attempting to register attack controller change for unit ${unit.internalName} that is not part of the attack`
        );
        this.unitControllersChanged.add(unit);
    }

    public getDefendingPlayer(): Player {
        Contract.assertTrue(this.targets.length > 0, 'Expected at least one target but there are none');
        return this.targets[0].controller;
    }

    public getSingleTarget(): IAttackableCard {
        Contract.assertTrue(this.targets.length === 1, `Expected one target but there are multiple (${this.targets.length})`);
        return this.targets[0];
    }

    public getAllTargets(): IAttackableCard[] {
        return this.targets;
    }

    public targetIsUnit(condition: (card: IUnitCard) => boolean = () => true, allowMultipleMatches: boolean = false): boolean {
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
            Contract.assertFalse(this.targets.length > 1, 'Expected at most one target');
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

    public getLegalTargets(): IAttackableCard[] {
        if (!this.isAttackerLegal()) {
            return [];
        }

        // filter out any defenders that have changed controllers
        return this.targets.filter((target) => !this.unitControllersChanged.has(target));
    }

    public isAttackerLegal(): boolean {
        return this.attacker.isInPlay() && !this.unitControllersChanged.has(this.attacker);
    }

    public isInvolved(card: Card): boolean {
        return (
            ([this.attacker as Card, this.targets as Card[]].includes(card))
        );
    }

    private getUnitPower(involvedUnit: IUnitCard): number {
        Contract.assertTrue(involvedUnit.isInPlay(), `Unit ${involvedUnit.title} zone is ${involvedUnit.zoneName}, cannot participate in combat`);

        return involvedUnit.getPower();
    }
}
