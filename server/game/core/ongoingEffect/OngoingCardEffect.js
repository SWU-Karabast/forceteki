const OngoingEffect = require('./OngoingEffect.js');
const { RelativePlayer, WildcardZoneName, WildcardCardType } = require('../Constants.js');
const EnumHelpers = require('../utils/EnumHelpers.js');
const Contract = require('../utils/Contract.js');
const Helpers = require('../utils/Helpers.js');

class OngoingCardEffect extends OngoingEffect {
    constructor(game, source, properties, effect) {
        super(game, source, properties, effect);

        if (!properties.matchTarget) {
            // if there are no filters provided, effect only targets the source card
            if (!properties.targetZoneFilter && !properties.targetCardTypeFilter && !properties.targetController) {
                this.targetsSourceOnly = true;
                return;
            }

            properties.matchTarget = () => true;
        }

        this.targetsSourceOnly = false;

        if (!properties.targetZoneFilter) {
            this.targetZoneFilter = properties.sourceZoneFilter === WildcardZoneName.Any
                ? WildcardZoneName.Any
                : WildcardZoneName.AnyArena;
        } else {
            this.targetZoneFilter = properties.targetZoneFilter;
        }

        this.targetController = properties.targetController || RelativePlayer.Self;

        // TODO: rework getTargets() so that we can provide an array while still not searching all cards in the game every time
        Contract.assertFalse(Array.isArray(properties.targetZoneFilter), 'Target location filter for an effect definition cannot be an array');

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
            (this.targetController !== RelativePlayer.Self || target.controller === this.source.controller) &&
            (this.targetController !== RelativePlayer.Opponent || target.controller !== this.source.controller) &&
            EnumHelpers.cardLocationMatches(target.zoneName, this.targetZoneFilter) &&
            EnumHelpers.cardTypeMatches(target.type, this.targetCardTypeFilter) &&
            this.matchTarget(target, this.context)
        );
    }

    /** @override */
    getTargets() {
        if (this.targetsSourceOnly) {
            return [this.context.source];
        } else if (this.targetZoneFilter === WildcardZoneName.Any) {
            return this.game.allCards;
        } else if (EnumHelpers.isArena(this.targetZoneFilter)) {
            return this.game.findAnyCardsInPlay();
        }
        return this.game.allCards;
    }
}

module.exports = OngoingCardEffect;
