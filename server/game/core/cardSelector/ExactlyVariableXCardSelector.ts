import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import type { TargetMode } from '../Constants.js';
import type { IBaseCardSelectorProperties } from './BaseCardSelector.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export interface IExactlyVariableXCardSelectorProperties<TContext> extends IBaseCardSelectorProperties<TContext> {
    mode: TargetMode.ExactlyVariable;
    numCardsFunc: (context: TContext) => number;
}

export class ExactlyVariableXCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public numCardsFunc: (context: TContext) => number;

    public constructor(properties: IExactlyVariableXCardSelectorProperties<TContext>) {
        super(properties);

        this.numCardsFunc = properties.numCardsFunc;
    }

    public override hasExceededLimit(selectedCards: Card[], context: TContext) {
        return selectedCards.length > this.numCardsFunc(context);
    }

    public override defaultPromptString(context: TContext) {
        if (this.cardTypeFilter.length === 1) {
            return this.numCardsFunc(context) === 1 ? 'Choose a ' + this.cardTypeFilter[0] : `Choose ${this.numCardsFunc(context)} ${this.cardTypeFilter[0]}s`;
        }
        return this.numCardsFunc(context) === 1 ? 'Select a card' : `Select ${this.numCardsFunc(context)} cards`;
    }

    public override hasEnoughSelected(selectedCards: Card[], context: TContext) {
        return selectedCards.length === this.numCardsFunc(context);
    }

    public override hasEnoughTargets(context: TContext) {
        const numMatchingCards = context.game.allCards.reduce((total, card) => {
            if (this.canTarget(card, context)) {
                return total + 1;
            }
            return total;
        }, 0);

        return numMatchingCards >= this.numCardsFunc(context);
    }

    public override hasReachedLimit(selectedCards: Card[], context: TContext) {
        return selectedCards.length >= this.numCardsFunc(context);
    }

    public override automaticFireOnSelect(context: TContext) {
        return this.numCardsFunc(context) === 1;
    }
}
