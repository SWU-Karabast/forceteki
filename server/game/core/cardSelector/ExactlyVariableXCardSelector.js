const BaseCardSelector = require('./BaseCardSelector.js');

class ExactlyVariableXCardSelector extends BaseCardSelector {
    constructor(numCardsFunc, properties) {
        super(properties);
        this.numCardsFunc = numCardsFunc;
    }

    /** @override */
    hasExceededLimit(selectedCards, context) {
        return selectedCards.length > this.numCardsFunc(context);
    }

    /** @override */
    defaultPromptString(context) {
        if (this.cardTypeFilter.length === 1) {
            return this.numCardsFunc(context) === 1 ? 'Choose a ' + this.cardTypeFilter[0] : `Choose ${this.numCardsFunc(context)} ${this.cardTypeFilter[0]}s`;
        }
        return this.numCardsFunc(context) === 1 ? 'Select a card' : `Select ${this.numCardsFunc(context)} cards`;
    }

    /** @override */
    hasEnoughSelected(selectedCards, context) {
        return selectedCards.length === this.numCardsFunc(context);
    }

    /** @override */
    hasEnoughTargets(context, choosingPlayer) {
        let numMatchingCards = context.game.allCards.reduce((total, card) => {
            if (this.canTarget(card, context, choosingPlayer)) {
                return total + 1;
            }
            return total;
        }, 0);

        return numMatchingCards >= this.numCardsFunc(context);
    }

    /** @override */
    hasReachedLimit(selectedCards, context) {
        return selectedCards.length >= this.numCardsFunc(context);
    }

    /** @override */
    automaticFireOnSelect(context) {
        return this.numCardsFunc(context) === 1;
    }
}

module.exports = ExactlyVariableXCardSelector;
