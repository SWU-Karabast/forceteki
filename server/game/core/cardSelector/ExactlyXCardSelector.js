const BaseCardSelector = require('./BaseCardSelector.js');

class ExactlyXCardSelector extends BaseCardSelector {
    constructor(numCards, properties) {
        super(properties);

        this.numCards = numCards;
    }

    /** @override */
    defaultActivePromptTitle() {
        if (this.cardTypeFilter.length === 1) {
            return this.numCards === 1 ? 'Choose a ' + this.cardTypeFilter[0] : `Choose ${this.numCards} ${this.cardTypeFilter[0]}`;
        }
        return this.numCards === 1 ? 'Select a card' : `Select ${this.numCards} cards`;
    }

    /** @override */
    hasEnoughSelected(selectedCards) {
        return selectedCards.length === this.numCards;
    }

    /** @override */
    hasEnoughTargets(context, choosingPlayer) {
        let matchedCards = [];
        let numMatchingCards = context.game.allCards.reduce((total, card) => {
            if (this.canTarget(card, context, choosingPlayer, matchedCards)) {
                matchedCards.push(card);
                return total + 1;
            }
            return total;
        }, 0);

        return numMatchingCards >= this.numCards;
    }

    /** @override */
    hasReachedLimit(selectedCards) {
        return selectedCards.length >= this.numCards;
    }

    /** @override */
    automaticFireOnSelect() {
        return this.numCards === 1;
    }
}

module.exports = ExactlyXCardSelector;
