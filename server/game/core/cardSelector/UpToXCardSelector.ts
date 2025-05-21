import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export class UpToXCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public constructor(public numCards: number, properties) {
        super(properties);
    }

    public override defaultPromptString() {
        return this.numCards === 1 ? 'Select a card' : `Select ${this.numCards} cards`;
    }

    public override hasReachedLimit(selectedCards: Card[]) {
        return selectedCards.length >= this.numCards;
    }

    public override hasExceededLimit(selectedCards: Card[]) {
        return selectedCards.length > this.numCards;
    }
}
