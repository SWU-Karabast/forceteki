const BaseCardSelector = require('./BaseCardSelector.js');

class MaxStatCardSelector extends BaseCardSelector {
    constructor(properties) {
        super(properties);

        this.cardStat = properties.cardStat;
        this.maxStat = properties.maxStat;
        this.numCards = properties.numCards;
    }

    /** @override */
    canTarget(card, context, choosingPlayer, selectedCards = []) {
        return super.canTarget(card, context, choosingPlayer, selectedCards) && this.cardStat(card) <= this.maxStat();
    }

    /** @override */
    wouldExceedLimit(selectedCards, card) {
        let currentStatSum = selectedCards.reduce((sum, c) => sum + this.cardStat(c), 0);

        return this.cardStat(card) + currentStatSum > this.maxStat();
    }

    /** @override */
    hasReachedLimit(selectedCards) {
        return this.numCards > 0 && selectedCards.length >= this.numCards;
    }

    /** @override */
    hasExceededLimit(selectedCards) {
        let currentStatSum = selectedCards.reduce((sum, c) => sum + this.cardStat(c), 0);
        return currentStatSum > this.maxStat() || (this.numCards > 0 && selectedCards.length > this.numCards);
    }
}

module.exports = MaxStatCardSelector;
