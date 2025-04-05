const { match } = require('assert');
const Contract = require('../utils/Contract.js');
const BaseCardSelector = require('./BaseCardSelector.js');

class BetweenVariableXYCardSelector extends BaseCardSelector {
    constructor(minNumCardsFunc, maxNumCardsFunc, useSingleSelectModeFunc, properties) {
        super(properties);
        this.minNumCardsFunc = minNumCardsFunc;
        this.maxNumCardsFunc = maxNumCardsFunc;
        this.useSingleSelectModeFunc = useSingleSelectModeFunc;
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
    hasReachedLimit(selectedCards, context, choosingPlayer) {
        const matchingCards = this.getMatchingCards(context, choosingPlayer);
        const useSingleSelectMode = this.useSingleSelectModeFunc ? this.useSingleSelectModeFunc(matchingCards, context) : false;
        return (useSingleSelectMode && selectedCards.length > 0) ||
          (this.minNumCardsFunc(context) === 1 && selectedCards.length === 1 && this.getMatchingCards(context, choosingPlayer).length === 1);
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
        let numMatchingCards = this.getMatchingCards(context, choosingPlayer).length;

        return numMatchingCards >= this.minNumCardsFunc(context);
    }

    /** @override */
    automaticFireOnSelect(context, choosingPlayer) {
        let minCards = this.minNumCardsFunc(context);
        let maxCards = this.maxNumCardsFunc(context);
        const matchingCards = this.getMatchingCards(context, choosingPlayer);
        const useSingleSelectMode = this.useSingleSelectModeFunc ? this.useSingleSelectModeFunc(matchingCards, context) : false;
        return (minCards === 1 && maxCards === 1) || useSingleSelectMode || matchingCards.length === minCards;
    }

    getMatchingCards(context, choosingPlayer) {
        let matchedCards = [];
        context.game.allCards.reduce((total, card) => {
            if (this.canTarget(card, context, choosingPlayer, matchedCards)) {
                matchedCards.push(card);
                return total + 1;
            }
            return total;
        }, 0);

        return matchedCards;
    }
}

module.exports = BetweenVariableXYCardSelector;
