import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import type Game from '../Game';
import type { Player } from '../Player';
import type { IDefeatCreditTokensCostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster } from './CostAdjuster';
import type { ICostAdjustmentResolutionProperties } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';

export class DefeatCreditTokensCostAdjuster extends CostAdjuster {
    public constructor(
        game: Game,
        source: ICardWithCostProperty,
        properties: IDefeatCreditTokensCostAdjusterProperties
    ) {
        super(game, source, CostAdjustStage.Standard_0, {
            ...properties,
            matchAbilityCosts: true
        });
    }

    protected override canAdjust(
        card: Card,
        context: AbilityContext,
        evaluationResult: ICostAdjustmentResolutionProperties
    ): boolean {
        if (context.player.creditTokenCount === 0) {
            return false;
        }

        return super.canAdjust(card, context, evaluationResult);
    }

    protected override getAmount(card: Card, player: Player, context: AbilityContext): number {
        return player.creditTokenCount;
    }
}