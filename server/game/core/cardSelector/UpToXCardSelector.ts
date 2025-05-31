import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import type { TargetMode } from '../Constants.js';
import type { IBaseCardSelectorProperties } from './BaseCardSelector.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export interface IUpToXCardSelectorProperties<TContext> extends IBaseCardSelectorProperties<TContext> {
    mode: TargetMode.UpTo;
    numCards: number;
}

export class UpToXCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public numCards: number;

    public constructor(properties: IUpToXCardSelectorProperties<TContext>) {
        super(properties);

        this.numCards = properties.numCards;
    }

    public override defaultPromptString() {
        const verb = this.numCards === 1 ? 'Choose' : 'Select';
        const { description, article } = BaseCardSelector.cardTypeFilterDescription(this.cardTypeFilter, this.numCards > 1);

        return `${verb} ${this.numCards === 1 ? article : `up to ${this.numCards}`} ${description}`;
    }

    public override hasReachedLimit(selectedCards: Card[]) {
        return selectedCards.length >= this.numCards;
    }

    public override hasExceededLimit(selectedCards: Card[]) {
        return selectedCards.length > this.numCards;
    }
}
