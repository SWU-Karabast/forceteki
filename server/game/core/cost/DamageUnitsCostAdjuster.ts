import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { DamageType, EventName } from '../Constants';
import type { Game } from '../Game';
import type { GameSystem } from '../gameSystem/GameSystem';
import { DamageSystem } from '../../gameSystems/DamageSystem';
import { TextHelper } from '../utils/TextHelper';
import type { IDamageUnitsCostAdjusterProperties, ITriggerStageTargetSelection } from './CostAdjuster';
import { CostAdjustType } from './CostAdjuster';
import * as CostHelpers from './CostHelpers';
import type { ICostAdjustTriggerResult } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';
import { TargetedCostAdjuster } from './TargetedCostAdjuster';

import { registerState } from '../GameObjectUtils';

/**
 * Subclass of {@link TargetedCostAdjuster} for effects that allow dealing damage to friendly units to reduce a card's cost
 * (e.g. Marauder: "While playing this unit, you may choose any number of friendly units. Deal 1 damage to each of them.
 * For each unit chosen this way, this unit costs 1 resource less.").
 *
 * This behaves like Exploit, except that damage only removes a unit from play if it defeats it. Whether it does depends on
 * damage modification effects and on choices made while the damage resolves (e.g. a Shield preventing it, or Queen Amidala
 * defeating a different friendly unit instead), which can't be reliably predicted. So when evaluating the cost, choosing a unit
 * is assumed not to remove it. If it does remove a unit that was providing a downstream cost adjustment (e.g. The Starhawk) and
 * the cost becomes unpayable as a result, that is handled by the cost payment recovery flow (see `CostPaymentRecovery`).
 *
 * The discount is for each unit chosen, not each unit damaged, so it still applies if the damage is prevented.
 */
@registerState()
export class DamageUnitsCostAdjuster extends TargetedCostAdjuster {
    public static readonly contextPropertyName = 'damageUnits';

    private readonly damagePerUnit: number;

    public constructor(
        game: Game,
        source: ICardWithCostProperty,
        properties: IDamageUnitsCostAdjusterProperties
    ) {
        super(game, source, CostAdjustStage.DamageUnits_3,
            {
                ...properties,
                costAdjustType: CostAdjustType.DamageUnits,
                adjustAmountPerTarget: properties.amountPerUnit,
                costPropertyName: DamageUnitsCostAdjuster.contextPropertyName,
                eventName: EventName.OnDamageUnitsToPayCost,
                promptSuffix: 'to deal damage to',
                targetCondition: properties.canDamageUnitCondition
            }
        );

        this.damagePerUnit = properties.damagePerUnit;
    }

    protected override buildEffectSystem(): GameSystem<AbilityContext<IUnitCard>> {
        // this is called from the base constructor before damagePerUnit is set, so the amount is read lazily
        return new DamageSystem<AbilityContext<IUnitCard>>({
            type: DamageType.Ability,
            amount: () => this.damagePerUnit,
            isCost: true
        });
    }

    /** Always evaluate downstream adjusters in full, so that the target prompt can show how many units are required to pay */
    protected override doesAdjustmentUseOpportunityCost(): boolean {
        return true;
    }

    /** The player goes directly to choosing units to damage, and may choose nothing if it isn't required to pay */
    protected override usesPayModePrompt(): boolean {
        return false;
    }

    /** Counts units that could have been chosen but were removed by an upstream stage (e.g. Exploit) */
    protected override getNumberOfRemovedTargets(previousTargetSelections: ITriggerStageTargetSelection[], context: AbilityContext): number {
        const legalTargets = new Set(this.defaultTargetResolver.getAllLegalTargets(context));

        return previousTargetSelections.filter((selection) =>
            CostHelpers.isUnitRemovingStage(selection.stage) &&
            legalTargets.has(selection.card)
        ).length;
    }

    protected override onTargetsSelected(selectedTargets: Card[], triggerResult: ICostAdjustTriggerResult, context: AbilityContext) {
        const discount = Math.min(selectedTargets.length * this.adjustAmountPerTarget, triggerResult.adjustedCost.value);

        context.game.addMessage(
            '{0} deals {1} damage to {2} to pay {3} less for {4}',
            this.getPayingPlayer(context),
            this.damagePerUnit + context.pendingAbilityDamageIncrease,
            selectedTargets,
            TextHelper.resource(discount),
            context.source
        );
    }

    /** "Choose any number of friendly units...", "Choose N friendly units..." or "Choose at least N friendly units...", depending on the required minimum */
    protected override buildActivePromptTitleHandler(
        triggerResult: ICostAdjustTriggerResult,
        context: AbilityContext,
        minimumTargets: number
    ): (context: AbilityContext, selectedCards: Card[]) => string {
        const maxTargets = this.getNumberOfLegalTargets(this.defaultTargetResolver, context, triggerResult);
        const damageText = `to deal ${this.damagePerUnit} damage to`;

        let title: string;
        if (minimumTargets === 0) {
            title = `Choose any number of friendly units ${damageText}`;
        } else if (minimumTargets === maxTargets) {
            title = `Choose ${maxTargets} friendly ${maxTargets === 1 ? 'unit' : 'units'} ${damageText}`;
        } else {
            title = `Choose at least ${minimumTargets} friendly ${minimumTargets === 1 ? 'unit' : 'units'} ${damageText}`;
        }

        return () => title;
    }
}
