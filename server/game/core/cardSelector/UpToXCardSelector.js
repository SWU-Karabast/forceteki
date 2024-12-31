const BaseCardSelector = require('./BaseCardSelector.js');

class UpToXCardSelector extends BaseCardSelector {
    constructor(numCards, properties) {
        super(properties);

        this.numCards = numCards;
    }

    /** @override */
    defaultPromptString() {
        return this.numCards === 1 ? 'Select a card' : `Select ${this.numCards} cards`;
    }

    /** @override */
    hasReachedLimit(selectedCards) {
        return selectedCards.length >= this.numCards;
    }

    /** @override */
    hasExceededLimit(selectedCards) {
        return selectedCards.length > this.numCards;
    }
}

module.exports = UpToXCardSelector;
