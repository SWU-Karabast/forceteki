import type { AbilityContext } from '../core/ability/AbilityContext.js';
import type { Card } from '../core/card/Card.js';
import type { CardType, WildcardCardType } from '../core/Constants.js';
import { PlayType } from '../core/Constants.js';
import { CostAdjustType } from '../core/cost/CostAdjuster.js';
import type { IDisplayCardsSelectProperties } from '../core/gameSteps/PromptInterfaces.js';
import { PlayCardSystem } from './PlayCardSystem.js';
import { SearchDeckSystem, type ISearchDeckProperties } from './SearchDeckSystem.js';

export interface IPlayMultipleCardsFromDeckProperties<TContext extends AbilityContext = AbilityContext>
    extends Omit<ISearchDeckProperties<TContext>,
      | 'revealSelected'
      | 'selectedCardsImmediateEffect'
      | 'selectedCardsHandler'
      | 'remainingCardsHandler'> {
    multiSelectCondition?: (card: Card, currentlySelectedCards: Card[], context: TContext) => boolean;
    playAsType?: WildcardCardType.Upgrade | WildcardCardType.Unit | CardType.Event;
}

export class PlayMultipleCardsFromDeckSystem<TContext extends AbilityContext = AbilityContext> extends SearchDeckSystem<TContext, IPlayMultipleCardsFromDeckProperties<TContext>> {
    public override generatePropertiesFromContext(context: TContext, additionalProperties = {}): IPlayMultipleCardsFromDeckProperties<TContext> {
        const properties = super.generatePropertiesFromContext(context, additionalProperties) as IPlayMultipleCardsFromDeckProperties<TContext>;

        const selectedCardsImmediateEffect = new PlayCardSystem({
            playType: PlayType.PlayFromOutOfPlay,
            nested: true,
            adjustCost: {
                costAdjustType: CostAdjustType.Free
            },
            playAsType: properties.playAsType,
        });

        const propsWithViewType = { ...properties, selectedCardsImmediateEffect: selectedCardsImmediateEffect };

        return propsWithViewType as IPlayMultipleCardsFromDeckProperties<TContext>;
    }

    protected override buildPromptProperties(
        cards: Card[],
        properties: IPlayMultipleCardsFromDeckProperties<TContext>,
        context: TContext,
        title: string,
        selectAmount: number,
        event: any,
        additionalProperties: any
    ): IDisplayCardsSelectProperties {
        return {
            ...super.buildPromptProperties(cards, properties, context, title, selectAmount, event, additionalProperties),
            multiSelectCondition: (card: Card, currentlySelectedCards: Card[]) =>
                properties.multiSelectCondition(card, currentlySelectedCards, context),
            showSelectionOrder: true,
            selectedCardsButtonText: 'Play cards in selection order',
        };
    }
}
