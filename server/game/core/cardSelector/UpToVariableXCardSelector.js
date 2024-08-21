const BaseCardSelector = require('./BaseCardSelector.js');

class UpToVariableXCardSelector extends BaseCardSelector {
    constructor(numCardsFunc, properties) {
        super(properties);
        this.numCardsFunc = numCardsFunc;
    }

    /** @override */
    defaultActivePromptTitle(context) {
        if (this.cardTypeFilter.length === 1) {
            return this.numCardsFunc(context) === 1 ? 'Select a ' + this.cardTypeFilter[0] : `Select up to ${this.numCardsFunc(context)} ${this.cardTypeFilter[0]}s`;
        }
        return this.numCardsFunc(context) === 1 ? 'Select a card' : `Select up to ${this.numCardsFunc(context)} cards`;
    }

    /** @override */
    hasReachedLimit(selectedCards, context) {
        return selectedCards.length >= this.numCardsFunc(context);
    }

    /** @override */
    hasExceededLimit(selectedCards, context) {
        return selectedCards.length > this.numCardsFunc(context);
    }

    /** @override */
    hasEnoughTargets(context, choosingPlayer) {
        return this.numCardsFunc(context) > 0 && super.hasEnoughTargets(context, choosingPlayer);
    }
}

module.exports = UpToVariableXCardSelector;
