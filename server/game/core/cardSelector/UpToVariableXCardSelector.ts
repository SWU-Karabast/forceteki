import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export class UpToVariableXCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public constructor(
        public numCardsFunc: (context: TContext) => number,
        properties
    ) {
        super(properties);
    }

    public override defaultPromptString(context: TContext) {
        if (this.cardTypeFilter.length === 1) {
            return this.numCardsFunc(context) === 1 ? 'Select a ' + this.cardTypeFilter[0] : `Select up to ${this.numCardsFunc(context)} ${this.cardTypeFilter[0]}s`;
        }
        return this.numCardsFunc(context) === 1 ? 'Select a card' : `Select up to ${this.numCardsFunc(context)} cards`;
    }

    public override hasReachedLimit(selectedCards: Card[], context: TContext) {
        return selectedCards.length >= this.numCardsFunc(context);
    }

    public override hasExceededLimit(selectedCards: Card[], context: TContext) {
        return selectedCards.length > this.numCardsFunc(context);
    }

    public override hasEnoughTargets(context: TContext) {
        return this.numCardsFunc(context) > 0 && super.hasEnoughTargets(context);
    }
}
