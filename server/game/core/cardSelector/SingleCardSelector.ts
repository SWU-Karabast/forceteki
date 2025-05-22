import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import type { TargetMode } from '../Constants.js';
import type { IBaseCardSelectorProperties } from './BaseCardSelector.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export interface ISingleCardSelectorProperties<TContext> extends IBaseCardSelectorProperties<TContext> {
    mode: TargetMode.AutoSingle | TargetMode.Single;
}

export class SingleCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public numCards: number;

    public constructor(properties: ISingleCardSelectorProperties<TContext>) {
        super(properties);

        this.numCards = 1;
    }

    public override defaultPromptString() {
        const verb = 'Choose';
        const { description, article } = BaseCardSelector.cardTypeFilterDescription(this.cardTypeFilter, false);

        return `${verb} ${article} ${description}`;
    }

    public override automaticFireOnSelect() {
        return true;
    }

    public override hasReachedLimit(selectedCards: Card[]) {
        return selectedCards.length >= this.numCards;
    }

    public override hasExceededLimit(selectedCards: Card[]) {
        return selectedCards.length > this.numCards;
    }

    public override formatSelectParam(cards: Card[]) {
        return cards[0] ? cards[0] : cards;
    }
}
