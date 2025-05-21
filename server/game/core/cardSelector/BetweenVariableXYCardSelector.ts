import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import * as Contract from '../utils/Contract.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export class BetweenVariableXYCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public constructor(
        public minNumCardsFunc: (context: TContext) => number,
        public maxNumCardsFunc: (context: TContext) => number,
        public useSingleSelectModeFunc: ((card: Card, selectedCards: Card[], context?: TContext) => boolean) | undefined,
        properties
    ) {
        super(properties);
    }

    public override defaultPromptString(context: TContext) {
        const minCards = this.minNumCardsFunc(context);
        const maxCards = this.maxNumCardsFunc(context);

        Contract.assertNonNegative(minCards, `Expected minimum targetable cards to be non-negative: ${minCards}`);
        Contract.assertNonNegative(maxCards, `Expected maximum targetable cards to be non-negative: ${maxCards}`);
        Contract.assertTrue(minCards <= maxCards, `Expected minimum targetable cards (${minCards}) to be less than or equal to maximum targetable cards (${maxCards})`);

        return minCards === maxCards
            ? `Select ${minCards} cards`
            : `Select between ${minCards} and ${maxCards} cards`;
    }

    public override hasReachedLimit(selectedCards: Card[], context: TContext) {
        const matchingCards = this.getMatchingCards(context);
        const useSingleSelectMode = this.useSingleSelectModeFunc == null ? false : this.useSingleSelectModeFunc(context.source, matchingCards, context);
        return (useSingleSelectMode && selectedCards.length > 0) || selectedCards.length === this.maxNumCardsFunc(context) ||
          (this.minNumCardsFunc(context) === 1 && selectedCards.length === 1 && this.getMatchingCards(context).length === 1);
    }

    public override hasExceededLimit(selectedCards: Card[], context: TContext) {
        return selectedCards.length > this.maxNumCardsFunc(context);
    }

    public override hasEnoughSelected(selectedCards: Card[], context: TContext) {
        return selectedCards.length >= this.minNumCardsFunc(context);
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
