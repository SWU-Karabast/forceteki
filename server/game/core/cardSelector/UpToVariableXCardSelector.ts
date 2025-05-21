import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import type { TargetMode } from '../Constants.js';
import type { IBaseCardSelectorProperties } from './BaseCardSelector.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export interface IUpToVariableXCardSelectorProperties<TContext> extends IBaseCardSelectorProperties<TContext> {
    mode: TargetMode.UpToVariable;
    numCardsFunc: (context: TContext) => number;
}

export class UpToVariableXCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public numCardsFunc: (context: TContext) => number;

    public constructor(properties: IUpToVariableXCardSelectorProperties<TContext>) {
        super(properties);

        this.numCardsFunc = properties.numCardsFunc;
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
