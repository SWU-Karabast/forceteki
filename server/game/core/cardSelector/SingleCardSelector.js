const BaseCardSelector = require('./BaseCardSelector.js');
const { CardType } = require('../Constants.js');

class SingleCardSelector extends BaseCardSelector {
    constructor(properties) {
        super(properties);

        this.numCards = 1;
    }


    /** @override */
    defaultActivePromptTitle() {
        if(this.cardType.length === 1) {
            if(this.cardType[0] === CardType.Upgrade) {
                return 'Choose an upgrade';
            }
            return 'Choose a ' + this.cardType[0];
        }
        return 'Choose a card';
    }

    /** @override */
    automaticFireOnSelect() {
        return true;
    }

    /** @override */
    hasReachedLimit(selectedCards) {
        return selectedCards.length >= this.numCards;
    }

    /** @override */
    hasExceededLimit(selectedCards) {
        return selectedCards.length > this.numCards;
    }

    /** @override */
    formatSelectParam(cards) {
        return cards[0] ? cards[0] : cards;
    }
}

module.exports = SingleCardSelector;
