// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/lines-around-comment: off */

import type { AbilityContext } from '../core/ability/AbilityContext.js';
import type { Card } from '../core/card/Card.js';
import type { TargetMode } from '../core/Constants.js';
import type { IDisplayCardsSelectProperties } from '../core/gameSteps/PromptInterfaces.js';
import { GameSystem } from '../core/gameSystem/GameSystem.js';
import { SearchDeckSystem, type ISearchDeckProperties } from './SearchDeckSystem.js';

export type ISearchEntireDeckProperties<TContext extends AbilityContext = AbilityContext> = Omit<ISearchDeckProperties<TContext>, 'searchCount' | 'multiSelectCondition' | 'remainingCardsHandler'> & {
    targetMode?: TargetMode.UpTo | TargetMode.Single | TargetMode.Unlimited;
};

/**
 * This system is a hack to address the fact that our display prompt doesn't have scroll and can't show the entire deck at once.
 * Instead, it will only show the selectable cards from the deck, or pass completely if there are none.
 *
 * Once we have fixed the prompt issue, this system can be removed completely.
 */
export class SearchEntireDeckSystem<TContext extends AbilityContext = AbilityContext> extends SearchDeckSystem<TContext, ISearchDeckProperties<TContext>> {
    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: ISearchEntireDeckProperties<TContext> | ((context?: AbilityContext) => ISearchEntireDeckProperties<TContext>)) {
        const propertyWithSearchCount = GameSystem.appendToPropertiesOrPropertyFactory<ISearchDeckProperties<TContext>, 'searchCount'>(propertiesOrPropertyFactory, { searchCount: -1 });
        super(propertyWithSearchCount);
    }

    protected override buildPromptProperties(
        cards: Card[],
        properties: ISearchDeckProperties<TContext>,
        context: TContext,
        title: string,
        selectAmount: number,
        event: any,
        additionalProperties: Partial<ISearchDeckProperties<TContext>>
    ): IDisplayCardsSelectProperties | null {
        const selectableCards = cards.filter((card) => properties.cardCondition(card, context));

        if (selectableCards.length === 0) {
            return null;
        }

        return {
            activePromptTitle: title,
            source: context.source,
            displayCards: selectableCards,
            maxCards: selectAmount,
            canChooseFewer: properties.canChooseFewer || true,
            validCardCondition: (card: Card) =>
                properties.cardCondition(card, context) &&
                (!properties.selectedCardsImmediateEffect || properties.selectedCardsImmediateEffect.canAffect(card, context, additionalProperties)),
            selectedCardsHandler: (selectedCards: Card[]) =>
                this.onSearchComplete(properties, context, event, selectedCards, cards)
        };
    }
}