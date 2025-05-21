import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import type { TargetMode } from '../Constants.js';
import type { IBaseCardSelectorProperties } from './BaseCardSelector.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export interface IMaxStatCardSelectorProperties<TContext> extends IBaseCardSelectorProperties<TContext> {
    mode: TargetMode.MaxStat;
    cardStat: (card: Card) => number;
    maxStat: () => number;
    numCards: number;
}

export class MaxStatCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public cardStat: (card: Card) => number;
    public maxStat: () => number;
    public numCards: number;

    public constructor(properties: IMaxStatCardSelectorProperties<TContext>) {
        super(properties);

        this.cardStat = properties.cardStat;
        this.maxStat = properties.maxStat;
        this.numCards = properties.numCards;
    }

    public override canTarget(card: Card, context: TContext, selectedCards: Card[] = []) {
        return super.canTarget(card, context, selectedCards) && this.cardStat(card) <= this.maxStat();
    }

    public override wouldExceedLimit(selectedCards: Card[], card: Card) {
        const currentStatSum = selectedCards.reduce((sum, c) => sum + this.cardStat(c), 0);

        return this.cardStat(card) + currentStatSum > this.maxStat();
    }

    public override hasReachedLimit(selectedCards: Card[]) {
        return this.numCards > 0 && selectedCards.length >= this.numCards;
    }

    public override hasExceededLimit(selectedCards: Card[]) {
        const currentStatSum = selectedCards.reduce((sum, c) => sum + this.cardStat(c), 0);
        return currentStatSum > this.maxStat() || (this.numCards > 0 && selectedCards.length > this.numCards);
    }
}
