import type { AbilityContext } from '../ability/AbilityContext.js';
import type { Card } from '../card/Card.js';
import { WildcardCardType } from '../Constants.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export class SingleCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public numCards: number;

    public constructor(properties) {
        super(properties);

        this.numCards = 1;
    }

    public override defaultPromptString() {
        if (this.cardTypeFilter.length === 1 && this.cardTypeFilter[0] !== WildcardCardType.Any) {
            if (this.cardTypeFilter[0] === WildcardCardType.Upgrade) {
                return 'Choose an upgrade';
            }
            return 'Choose a ' + this.cardTypeFilter[0];
        }
        return 'Choose a card';
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
