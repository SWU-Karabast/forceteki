import type Game from '../Game';
import type { Card } from '../card/Card';
import * as Contract from '../utils/Contract';
import { AbilityRestriction, EffectName, KeywordName } from '../Constants';
import type { IAttackableCard } from '../card/CardInterfaces';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { Player } from '../Player';
import type { AbilityContext } from '../ability/AbilityContext';

export class Attack {
    private readonly game: Game;
    public readonly attacker: IUnitCard;
    public readonly attackingPlayer: Player;
    public readonly attackerInPlayId: number;
    public readonly isAmbush: boolean;
    public readonly targetInPlayMap = new Map<IAttackableCard, number>();

    private readonly attackerCombatDamageOverride?: (attack: Attack, context: AbilityContext) => number;
    private unitControllersChanged = new Set<IAttackableCard>();
    private targets: IAttackableCard[];
    private defendingPlayer: Player;

    public previousAttack: Attack;

    public constructor(
        game: Game,
        attacker: IUnitCard,
        targets: IAttackableCard[],
        isAmbush: boolean = false,
        attackerCombatDamageOverride?: (attack: Attack, context: AbilityContext) => number
    ) {
        Contract.assertTrue(attacker.isInPlay(), `Attempting to construct an Attack but designated attacker ${attacker.internalName} is not in play`);

        const notInPlayTargets = targets.filter((target) => !target.isBase() && !target.isInPlay());
        Contract.assertTrue(notInPlayTargets.length === 0, `Attempting to construct an Attack but the following targets are not in play: ${notInPlayTargets.map((target) => target.internalName).join(', ')}`);

        this.game = game;
        this.attacker = attacker;
        this.attackingPlayer = attacker.controller;
        this.targets = targets;
        this.defendingPlayer = targets[0].controller;
        this.targetInPlayMap = new Map(targets.filter((target) => target.isUnit()).map((target) => [target, target.inPlayId]));
        this.attackerCombatDamageOverride = attackerCombatDamageOverride;

        // we grab the in-play IDs of the attacker and defender cards in case other abilities need to refer back to them later.
        // e.g., to check if the defender was defeated
        this.attackerInPlayId = attacker.inPlayId;

        this.isAmbush = isAmbush;
    }

    public getAttackerCombatDamage(context: AbilityContext): number | null {
        if (this.attacker.hasRestriction(AbilityRestriction.DealCombatDamage)) {
            return null;
        }

        const attackDamage = this.attackerCombatDamageOverride
            ? this.attackerCombatDamageOverride(this, context)
            : this.getUnitPower(this.attacker);

        Contract.assertNonNegative(attackDamage, `Attacker combat damage cannot be negative: ${attackDamage}`);

        return attackDamage;
    }

    public unitChangedController(unit: IAttackableCard): void {
        Contract.assertTrue(
            unit === this.attacker || this.targets.includes(unit),
            `Attempting to register attack controller change for unit ${unit.internalName} that is not part of the attack`
        );
        this.unitControllersChanged.add(unit);
    }

    public getDefendingPlayer(): Player {
        return this.defendingPlayer;
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


    /**
     * Get total combat damage from targets.
     * @param earlyOnly - true: only targets that deal damage first, false: only targets that don't deal damage first
     */
    public getTargetCombatDamage(
        _context: AbilityContext,
        earlyOnly: boolean = false
    ): number | null {
        if (this.targets.every((t) => t.hasRestriction(AbilityRestriction.DealCombatDamage))) {
            return null;
        }

        // If we ever need to override the combat damage for the defender, we can follow the same pattern as attackerCombatDamageOverride
        const reducer = (totalDamage: number, target: IAttackableCard): number => {
            if (target.isBase() || target.hasRestriction(AbilityRestriction.DealCombatDamage)) {
                return totalDamage;
            }
            return totalDamage + this.getUnitPower(target);
        };

        return this.targets
            .filter((t) => {
                const dealsFirst = this.targetDealsCombatDamageFirst(t);
                return earlyOnly ? dealsFirst : !dealsFirst;
            })
            .reduce(reducer, 0);
    }

    public hasOverwhelm(): boolean {
        return this.attacker.hasSomeKeyword(KeywordName.Overwhelm);
    }

    public attackerDealsCombatDamageFirst(): boolean {
        return this.attacker.hasOngoingEffect(EffectName.DealsCombatDamageFirst);
    }

    public targetDealsCombatDamageFirst(attackTarget: IAttackableCard): boolean {
        return this.targets.includes(attackTarget) &&
          !attackTarget.isBase() &&
          attackTarget.hasOngoingEffect(EffectName.DealsCombatDamageFirst);
    }

    public anyTargetDealsCombatDamageFirst(): boolean {
        return this.targets.some((t) => this.targetDealsCombatDamageFirst(t));
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

    public isTargetStillInPlay(target: IAttackableCard): boolean {
        return target.isBase() || (
            target.isInPlay() &&
            // If inPlayId has changed, the target has left and re-entered play
            this.targetInPlayMap.get(target) === target.inPlayId
        );
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
