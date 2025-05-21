import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export class ExactlyXCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public constructor(
        public numCards: number,
        properties
    ) {
        super(properties);
    }

    public override defaultPromptString() {
        if (this.cardTypeFilter.length === 1) {
            return this.numCards === 1 ? 'Choose a ' + this.cardTypeFilter[0] : `Choose ${this.numCards} ${this.cardTypeFilter[0]}`;
        }
        return this.numCards === 1 ? 'Select a card' : `Select ${this.numCards} cards`;
    }

    public override hasEnoughSelected(selectedCards: Card[]) {
        return this.optional || selectedCards.length === this.numCards;
    }

    public override hasEnoughTargets(context: TContext) {
        const matchedCards: Card[] = [];
        const numMatchingCards = context.game.allCards.reduce((total, card) => {
            if (this.canTarget(card, context, matchedCards)) {
                matchedCards.push(card);
                return total + 1;
            }
            return total;
        }, 0);

        return numMatchingCards >= this.numCards;
    }

    public override hasReachedLimit(selectedCards: Card[]) {
        return selectedCards.length >= this.numCards;
    }

    public override automaticFireOnSelect() {
        return this.numCards === 1;
    }
}
