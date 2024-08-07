const BaseCardSelector = require('./BaseCardSelector.js');

/**
 * A simple concrete implementation that doesn't impose any limits on the number of cards that can be selected
 */
class UnlimitedCardSelector extends BaseCardSelector {
}

module.exports = UnlimitedCardSelector;
