import type { AbilityContext } from '../ability/AbilityContext';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import { EventName } from '../Constants';
import type Game from '../Game';
import type { IExhaustUnitsCostAdjusterProperties } from './CostAdjuster';
import { CostAdjustType } from './CostAdjuster';
import * as Contract from '../utils/Contract.js';
import { CostAdjustStage } from './CostInterfaces';
import { PerPlayerPerGameAbilityLimit } from '../ability/AbilityLimit';
import { TargetedCostAdjuster } from './TargetedCostAdjuster';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { ExhaustSystem } from '../../gameSystems/ExhaustSystem';

export class ExhaustUnitsCostAdjuster extends TargetedCostAdjuster {
    public constructor(
        game: Game,
        source: ICardWithCostProperty,
        properties: IExhaustUnitsCostAdjusterProperties
    ) {
        super(game, source,
            {
                limit: new PerPlayerPerGameAbilityLimit(game, 1),
                ...properties,
                costAdjustType: CostAdjustType.ExhaustUnits,
                adjustAmountPerTarget: 1,
                costPropertyName: 'exhaustUnits',
                useAdjusterButtonText: 'Pay cost by exhausting units',
                doNotUseAdjusterButtonText: 'Pay cost normally',
                eventName: EventName.OnExhaustUnitsToPayCost,
                promptSuffix: 'to exhaust as if they were resources',
                targetCondition: properties.canExhaustUnitCondition
            }
        );
    }

    protected override buildEffectSystem(): GameSystem<AbilityContext<IUnitCard>> {
        return new ExhaustSystem({ isCost: true });
    }

    protected override getCostStage(costAdjustType: CostAdjustType): CostAdjustStage {
        Contract.assertTrue(costAdjustType === CostAdjustType.ExhaustUnits, `ExhaustUnitsCostAdjuster must have costAdjustType of '${CostAdjustType.ExhaustUnits}', instead got '${costAdjustType}'`);
        return CostAdjustStage.ExhaustUnits_2;
    }
}