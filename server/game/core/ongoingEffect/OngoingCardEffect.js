const OngoingEffect = require('./OngoingEffect.js');
const { RelativePlayer, WildcardLocation, WildcardCardType } = require('../Constants.js');
const EnumHelpers = require('../utils/EnumHelpers.js');
const Contract = require('../utils/Contract.js');
const Helpers = require('../utils/Helpers.js');

// TODO: confusingly, this is not an implementation of IOngoingCardEffect. what's the relationship supposed to be?
class OngoingCardEffect extends OngoingEffect {
    constructor(game, source, properties, effect) {
        super(game, source, properties, effect);

        if (!properties.matchTarget) {
            // if there are no filters provided, effect only targets the source card
            if (!properties.targetLocationFilter && !properties.targetCardTypeFilter && !properties.targetController) {
                this.targetsSourceOnly = true;
                return;
            }

            properties.matchTarget = () => true;
        }

        this.targetsSourceOnly = false;

        if (!properties.targetLocationFilter) {
            this.targetLocationFilter = properties.sourceLocationFilter === WildcardLocation.Any
                ? WildcardLocation.Any
                : WildcardLocation.AnyArena;
        } else {
            this.targetLocationFilter = properties.targetLocationFilter;
        }

        this.targetController = properties.targetController || RelativePlayer.Self;

        // TODO: rework getTargets() so that we can provide an array while still not searching all cards in the game every time
        Contract.assertFalse(Array.isArray(properties.targetLocationFilter), 'Target location filter for an effect definition cannot be an array');

        this.targetCardTypeFilter = properties.targetCardTypeFilter ? Helpers.asArray(properties.targetCardTypeFilter) : [WildcardCardType.Unit];
    }

    /** @override */
    isValidTarget(target) {
        if (target === this.matchTarget) {
            // This is a hack to check whether this is a lasting effect
            return true;
        }

        if (this.targetsSourceOnly) {
            return target === this.context.source;
        }

        return (
            target.allowGameAction('applyEffect', this.context) &&
            (this.targetController !== RelativePlayer.Self || target.controller === this.source.controller) &&
            (this.targetController !== RelativePlayer.Opponent || target.controller !== this.source.controller) &&
            EnumHelpers.cardLocationMatches(target.location, this.targetLocationFilter) &&
            EnumHelpers.cardTypeMatches(target.type, this.targetCardTypeFilter) &&
            this.matchTarget(target, this.context)
        );
    }

    /** @override */
    getTargets() {
        if (this.targetsSourceOnly) {
            return [this.context.source];
        } else if (this.targetLocationFilter === WildcardLocation.Any) {
            return this.game.allCards;
        } else if (EnumHelpers.isArena(this.targetLocationFilter)) {
            return this.game.findAnyCardsInPlay();
        }
        return this.game.allCards;
    }
}

module.exports = OngoingCardEffect;
