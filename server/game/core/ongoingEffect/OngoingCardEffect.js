const OngoingEffect = require('./OngoingEffect.js');
const { RelativePlayer, WildcardLocation } = require('../Constants.js');
const { isArena } = require('../utils/EnumHelpers.js');

// TODO: confusingly, this is not an implementation of IOngoingCardEffect. what's the relationship supposed to be?
class OngoingCardEffect extends OngoingEffect {
    constructor(game, source, properties, effect) {
        if (!properties.match) {
            properties.match = (card, context) => card === context.source;
            if (properties.locationFilter === WildcardLocation.Any) {
                properties.targetLocationFilter = WildcardLocation.Any;
            }
        }
        super(game, source, properties, effect);
        this.targetController = properties.targetController || RelativePlayer.Self;
        this.targetLocationFilter = properties.targetLocationFilter || WildcardLocation.AnyArena;
    }

    /** @override */
    isValidTarget(target) {
        if (target === this.match) {
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
            return this.game.allCards.filter((card) => this.match(card, this.context));
        } else if (isArena(this.targetLocationFilter)) {
            return this.game.findAnyCardsInPlay((card) => this.match(card, this.context));
        }
        return this.game.allCards.filter((card) => this.match(card, this.context) && card.location === this.targetLocationFilter);
    }
}

module.exports = OngoingCardEffect;
