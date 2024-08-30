const OngoingEffect = require('./OngoingEffect.js');
const { RelativePlayer, WildcardLocation, WildcardCardType } = require('../Constants.js');
const EnumHelpers = require('../utils/EnumHelpers.js');
const { default: Contract } = require('../utils/Contract.js');
const Helpers = require('../utils/Helpers.js');

// TODO: confusingly, this is not an implementation of IOngoingCardEffect. what's the relationship supposed to be?
class OngoingCardEffect extends OngoingEffect {
    constructor(game, source, properties, effect) {
        if (!properties.matchTarget) {
            properties.matchTarget = (card, context) => card === context.source;
            if (properties.locationFilter === WildcardLocation.Any) {
                properties.targetLocationFilter = WildcardLocation.Any;
            }
        }
        super(game, source, properties, effect);
        this.targetController = properties.targetController || RelativePlayer.Self;

        // TODO: rework card search so that we can provide an array while still not searching all cards in the game every time
        Contract.assertFalse(Array.isArray(properties.targetLocationFilter), 'Target location filter for an effect definition cannot be an array');
        this.targetLocationFilter = properties.targetLocationFilter || WildcardLocation.AnyArena;

        this.targetCardTypeFilter = Helpers.asArray(properties.targetCardTypeFilter || [WildcardCardType.Unit]);
    }

    /** @override */
    isValidTarget(target) {
        if (target === this.matchTarget) {
            // This is a hack to check whether this is a lasting effect
            return true;
        }
        return (
            target.allowGameAction('applyEffect', this.context) &&
            (this.targetController !== RelativePlayer.Self || target.controller === this.source.controller) &&
            (this.targetController !== RelativePlayer.Opponent || target.controller !== this.source.controller)
        );
    }

    /** @override */
    getTargets() {
        if (this.targetLocationFilter === WildcardLocation.Any) {
            return this.game.allCards.filter((card) => this.matchTarget(card, this.context));
        } else if (EnumHelpers.isArena(this.targetLocationFilter)) {
            return this.game.findAnyCardsInPlay((card) => this.matchTarget(card, this.context));
        }
        return this.game.allCards.filter((card) =>
            EnumHelpers.cardLocationMatches(card.location, this.targetLocationFilter) &&
            EnumHelpers.cardTypeMatches(card.type, this.targetCardTypeFilter) &&
            this.matchTarget(card, this.context));
    }
}

module.exports = OngoingCardEffect;
