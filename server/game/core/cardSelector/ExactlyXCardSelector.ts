import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import type { TargetMode } from '../Constants.js';
import type { IBaseCardSelectorProperties } from './BaseCardSelector.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export interface IExactlyXCardSelectorProperties<TContext> extends IBaseCardSelectorProperties<TContext> {
    mode: TargetMode.Exactly;
    numCards: number;
}

export class ExactlyXCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public numCards: number;

    public constructor(properties: IExactlyXCardSelectorProperties<TContext>) {
        super(properties);

        this.numCards = properties.numCards;
    }

    public override defaultPromptString() {
        const verb = this.numCards === 1 ? 'Choose' : 'Select';
        const { description, article } = BaseCardSelector.cardTypeFilterDescription(this.cardTypeFilter, this.numCards > 1);

        return `${verb} ${this.numCards === 1 ? article : this.numCards} ${description}`;
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
