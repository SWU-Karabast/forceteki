import type { AbilityContext } from '../ability/AbilityContext';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { DamageType, EventName } from '../Constants';
import type { IDamageUnitsCostAdjusterProperties } from './CostAdjuster';
import { CostAdjustType } from './CostAdjuster';
import type { IAbilityCostAdjustmentProperties } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';
import { TargetedCostAdjuster } from './TargetedCostAdjuster';
import type { Game } from '../Game';
import type { GameSystem } from '../gameSystem/GameSystem';
import { DamageSystem } from '../../gameSystems/DamageSystem';
import { registerState, registerStateBase } from '../GameObjectUtils';

/**
 * Subclass of {@link TargetedCostAdjuster} for cost adjustment effects that let the player deal 1 damage
 * to any number of friendly units while playing a card, reducing its cost by 1 per unit (The Marauder).
 *
 * Structurally this is Exploit with the defeat swapped for damage and the discount halved.
 */
@registerStateBase()
export abstract class DamageUnitsCostAdjusterBase extends TargetedCostAdjuster {
    public static readonly contextPropertyName = 'damageUnits';

    public constructor(
        game: Game,
        source: ICardWithCostProperty,
        properties: IDamageUnitsCostAdjusterProperties
    ) {
        super(game, source, CostAdjustStage.DamageUnits_3,
            {
                ...properties,
                costAdjustType: CostAdjustType.DamageUnits,
                adjustAmountPerTarget: 1,
                costPropertyName: DamageUnitsCostAdjusterBase.contextPropertyName,
                useAdjusterButtonText: 'Damage friendly units to reduce cost',
                doNotUseAdjusterButtonText: 'Pay cost normally',
                eventName: EventName.OnDamageUnitsToPayCost,
                promptSuffix: 'to deal 1 damage to',
            }
        );
    }

    /**
     * Damaging a unit doesn't remove it from play, so it has no bearing on other adjusters (unlike Exploit, where
     * defeating a droid can cost you the ability to exhaust it under Vuutun Palaa). The one exception - damage that
     * happens to be lethal to such a unit - is not modelled here.
     */
    protected override doesAdjustmentUseOpportunityCost(_adjustmentProps: IAbilityCostAdjustmentProperties) {
        return false;
    }

    protected override buildEffectSystem(): GameSystem<AbilityContext<IUnitCard>> {
        return new DamageSystem({ type: DamageType.Ability, amount: 1, isCost: true });
    }
}

// This class intentionally adds no logic.
// @registerState classes are terminal (cannot be further extended), but we still need
// a concrete, instantiable type for DamageUnitsCostAdjusterBase.
@registerState()
export class DamageUnitsCostAdjuster extends DamageUnitsCostAdjusterBase { }
