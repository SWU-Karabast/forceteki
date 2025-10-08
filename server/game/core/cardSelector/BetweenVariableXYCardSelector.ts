import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import type { TargetMode } from '../Constants.js';
import * as Contract from '../utils/Contract.js';
import type { IBaseCardSelectorProperties } from './BaseCardSelector.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export interface IBetweenVariableXYCardSelectorProperties<TContext> extends IBaseCardSelectorProperties<TContext> {
    mode: TargetMode.BetweenVariable;
    minNumCardsFunc: (context: TContext, selectedCards?: Card[]) => number;
    maxNumCardsFunc: (context: TContext, selectedCards?: Card[]) => number;
    useSingleSelectModeFunc?: (card: Card, selectedCards: Card[], context?: TContext) => boolean;
}

export class BetweenVariableXYCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public minNumCardsFunc: (context: TContext, selectedCards?: Card[]) => number;
    public maxNumCardsFunc: (context: TContext, selectedCards?: Card[]) => number;
    public useSingleSelectModeFunc?: (card: Card, selectedCards: Card[], context?: TContext) => boolean;

    public constructor(properties: IBetweenVariableXYCardSelectorProperties<TContext>) {
        super(properties);

        this.minNumCardsFunc = properties.minNumCardsFunc;
        this.maxNumCardsFunc = properties.maxNumCardsFunc;
        this.useSingleSelectModeFunc = properties.useSingleSelectModeFunc;
    }

    public override defaultPromptString(context: TContext) {
        const minCards = this.minNumCardsFunc(context);
        const maxCards = this.maxNumCardsFunc(context);

        Contract.assertNonNegative(minCards, `Expected minimum targetable cards to be non-negative: ${minCards}`);
        Contract.assertNonNegative(maxCards, `Expected maximum targetable cards to be non-negative: ${maxCards}`);
        Contract.assertTrue(minCards <= maxCards, `Expected minimum targetable cards (${minCards}) to be less than or equal to maximum targetable cards (${maxCards})`);

        const { description, article } = BaseCardSelector.cardTypeFilterDescription(this.cardTypeFilter, minCards > 1 || maxCards > 1);

        return minCards === maxCards
            ? `Select ${minCards === 1 ? article : minCards} ${description}`
            : `Select between ${minCards} and ${maxCards} ${description}`;
    }

    public override hasReachedLimit(selectedCards: Card[], context: TContext) {
        const matchingCards = this.getMatchingCards(context);
        const useSingleSelectMode = this.useSingleSelectModeFunc == null ? false : this.useSingleSelectModeFunc(context.source, matchingCards, context);
        return (useSingleSelectMode && selectedCards.length > 0) || selectedCards.length === this.maxNumCardsFunc(context, selectedCards) ||
          (this.minNumCardsFunc(context, selectedCards) === 1 && selectedCards.length === 1 && this.getMatchingCards(context).length === 1);
    }

    public override hasExceededLimit(selectedCards: Card[], context: TContext) {
        return selectedCards.length > this.maxNumCardsFunc(context, selectedCards);
    }

    public override hasEnoughSelected(selectedCards: Card[], context: TContext) {
        return selectedCards.length >= this.minNumCardsFunc(context, selectedCards);
    }

    public override hasEnoughTargets(context: TContext) {
        const numMatchingCards = this.getMatchingCards(context).length;

        return numMatchingCards >= this.minNumCardsFunc(context);
    }

    public override automaticFireOnSelect(context: TContext) {
        const matchingCards = this.getMatchingCards(context);
        if (this.useSingleSelectModeFunc != null) {
            return this.useSingleSelectModeFunc(context.source, matchingCards, context);
        }
        return false;
    }

    private getMatchingCards(context: TContext) {
        const matchedCards = [];
        context.game.allCards.reduce((total, card) => {
            if (this.canTarget(card, context, matchedCards)) {
                matchedCards.push(card);
                return total + 1;
            }
            return total;
        }, 0);

        return matchedCards;
    }
}
