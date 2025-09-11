import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import type { TargetMode } from '../Constants.js';
import type { IBaseCardSelectorProperties } from './BaseCardSelector.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export interface IUpToVariableXCardSelectorProperties<TContext> extends IBaseCardSelectorProperties<TContext> {
    mode: TargetMode.UpToVariable;
    numCardsFunc: (context: TContext, selectedCards?: Card[]) => number;
}

export class UpToVariableXCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public numCardsFunc: (context: TContext, selectedCards?: Card[]) => number;

    public constructor(properties: IUpToVariableXCardSelectorProperties<TContext>) {
        super(properties);

        this.numCardsFunc = properties.numCardsFunc;
    }

    public override defaultPromptString(context: TContext) {
        const numCards = this.numCardsFunc(context);
        const verb = numCards === 1 ? 'Choose' : 'Select';
        const { description, article } = BaseCardSelector.cardTypeFilterDescription(this.cardTypeFilter, numCards > 1);

        return `${verb} ${numCards === 1 ? article : `up to ${numCards}`} ${description}`;
    }

    public override hasReachedLimit(selectedCards: Card[], context: TContext) {
        return selectedCards.length >= this.numCardsFunc(context, selectedCards);
    }

    public override hasExceededLimit(selectedCards: Card[], context: TContext) {
        return selectedCards.length > this.numCardsFunc(context, selectedCards);
    }

    public override hasEnoughTargets(context: TContext) {
        return this.numCardsFunc(context) > 0 && super.hasEnoughTargets(context);
    }
}
