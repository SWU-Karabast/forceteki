const BaseCardSelector = require('./BaseCardSelector.js');

class UpToXCardSelector extends BaseCardSelector {
    constructor(numCards, properties) {
        super(properties);

        this.numCards = numCards;
    }

    /** @override */
    defaultActivePromptTitle() {
        return this.numCards === 1 ? 'Select a character' : `Select ${this.numCards} characters`;
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
