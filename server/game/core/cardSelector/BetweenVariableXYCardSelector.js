const Contract = require('../utils/Contract.js');
const BaseCardSelector = require('./BaseCardSelector.js');

class BetweenVariableXYCardSelector extends BaseCardSelector {
    constructor(minNumCardsFunc, maxNumCardsFunc, properties) {
        super(properties);
        this.minNumCardsFunc = minNumCardsFunc;
        this.maxNumCardsFunc = maxNumCardsFunc;
    }

    /** @override */
    defaultPromptString(context) {
        const minCards = this.minNumCardsFunc(context);
        const maxCards = this.maxNumCardsFunc(context);

        Contract.assertNonNegative(minCards, `Expected minimum targetable cards to be non-negative: ${minCards}`);
        Contract.assertNonNegative(maxCards, `Expected maximum targetable cards to be non-negative: ${maxCards}`);
        Contract.assertTrue(minCards <= maxCards, `Expected minimum targetable cards (${minCards}) to be less than or equal to maximum targetable cards (${maxCards})`);

        return minCards === maxCards
            ? `Select ${minCards} cards`
            : `Select between ${minCards} and ${maxCards} cards`;
    }

    /** @override */
    hasReachedLimit(selectedCards, context) {
        return selectedCards.length >= this.maxNumCardsFunc(context);
    }

    /** @override */
    hasExceededLimit(selectedCards, context) {
        return selectedCards.length > this.maxNumCardsFunc(context);
    }

    /** @override */
    hasEnoughSelected(selectedCards, context) {
        return selectedCards.length >= this.minNumCardsFunc(context);
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

        return numMatchingCards >= this.minNumCardsFunc(context);
    }
}

module.exports = BetweenVariableXYCardSelector;
