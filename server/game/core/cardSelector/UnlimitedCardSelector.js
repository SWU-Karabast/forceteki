const BaseCardSelector = require('./BaseCardSelector.js');

/**
 * A simple concrete implementation that doesn't impose any limits on the number of cards that can be selected
 */
class UnlimitedCardSelector extends BaseCardSelector {
    /** @override */
    hasEnoughSelected(selectedCards, context) {
        return this.optional || selectedCards.length >= 0;
    }
}

module.exports = UnlimitedCardSelector;
