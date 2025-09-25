import type { IExhaustSystemProperties } from '../../gameSystems/ExhaustSystem';
import { ExhaustSystem } from '../../gameSystems/ExhaustSystem';
import type { AbilityContext } from '../ability/AbilityContext';
import { CardTargetResolver } from '../ability/abilityTargets/CardTargetResolver';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { RelativePlayer, TargetMode, WildcardCardType } from '../Constants';
import type Game from '../Game';
import type { IModifyPayStageCostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster } from './CostAdjuster';

export interface IExhaustUnitsCostAdjusterProperties<TContext extends AbilityContext> extends IModifyPayStageCostAdjusterProperties {
    cardCondition: (card: IUnitCard, context: TContext) => boolean;
}

export class ExhaustUnitCostAdjuster extends CostAdjuster {
    private numExhaustedUnits = 0;

    private readonly exhaustSystem: ExhaustSystem;
    private readonly targetResolver: CardTargetResolver;

    public constructor(
        game: Game,
        source: ICardWithCostProperty,
        properties: IExhaustUnitsCostAdjusterProperties<AbilityContext>
    ) {
        super(game, source,
            {
                ...properties,
                amount: (_card, _player, context) => this.getMaxExhaustableCount(context)
            }
        );

        const exhaustProps: IExhaustSystemProperties = { isCost: true };
        this.exhaustSystem = new ExhaustSystem(exhaustProps);

        this.targetResolver = new CardTargetResolver(
            'exhaustUnitsCostAdjuster', {
                mode: TargetMode.UpToVariable,
                numCardsFunc: (context) => Math.min(this.getMaxExhaustableCount(context), source.cost),
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.isUnit() && properties.cardCondition(card, context),
                immediateEffect: this.exhaustSystem,
                controller: RelativePlayer.Self,
                appendToDefaultTitle: 'to exhaust',
            }
        );
    }

    private getMaxExhaustableCount(context: AbilityContext) {
        return this.targetResolver.getAllLegalTargets(context).length;
    }
}