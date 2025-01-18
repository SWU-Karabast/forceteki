import type { AbilityContext } from '../core/ability/AbilityContext.js';
import type { Card } from '../core/card/Card.js';
import { PlayType } from '../core/Constants.js';
import { CostAdjustType } from '../core/cost/CostAdjuster.js';
import type { IDisplayCardsSelectProperties } from '../core/gameSteps/PromptInterfaces.js';
import { GameSystem } from '../core/gameSystem/GameSystem.js';
import { PlayCardSystem } from './PlayCardSystem.js';
import { SearchDeckSystem, type ISearchDeckProperties } from './SearchDeckSystem.js';

export interface IPlayMultipleCardsFromDeckProperties<TContext extends AbilityContext = AbilityContext>
    extends Omit<ISearchDeckProperties<TContext>,
      | 'revealSelected'
      | 'selectedCardsImmediateEffect'
      | 'selectedCardsHandler'
      | 'remainingCardsHandler'> {
    multiSelectCondition?: (card: Card, currentlySelectedCards: Card[], context: TContext) => boolean;
}

export class PlayMultipleCardsFromDeckSystem<TContext extends AbilityContext = AbilityContext> extends SearchDeckSystem<TContext, IPlayMultipleCardsFromDeckProperties<TContext>> {
    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: IPlayMultipleCardsFromDeckProperties<TContext> | ((context?: AbilityContext) => IPlayMultipleCardsFromDeckProperties<TContext>)) {
        const propsWithViewType = GameSystem.appendToPropertiesOrPropertyFactory<ISearchDeckProperties<TContext>, 'selectedCardsImmediateEffect'>(propertiesOrPropertyFactory,
            {
                selectedCardsImmediateEffect: new PlayCardSystem({
                    playType: PlayType.PlayFromOutOfPlay,
                    nested: true,
                    adjustCost: {
                        costAdjustType: CostAdjustType.Free
                    }
                })
            }
        );

        super(propsWithViewType);
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
