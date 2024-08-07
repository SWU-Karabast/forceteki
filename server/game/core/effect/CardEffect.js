const Effect = require('./Effect.js');
const { RelativePlayer, WildcardLocation } = require('../Constants.js');
const { isArena } = require('../utils/EnumHelpers.js');

// TODO: confusingly, this is not an implementation of ICardEffect. what's the relationship supposed to be?
class CardEffect extends Effect {
    constructor(game, source, properties, effect) {
        if (!properties.match) {
            properties.match = (card, context) => card === context.source;
            if (properties.location === WildcardLocation.Any) {
                properties.targetLocation = WildcardLocation.Any;
            }
        }
        super(game, source, properties, effect);
        this.targetController = properties.targetController || RelativePlayer.Self;
        this.targetLocation = properties.targetLocation || WildcardLocation.AnyArena;
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
        if (this.targetLocation === WildcardLocation.Any) {
            return this.game.allCards.filter((card) => this.match(card, this.context));
        } else if (isArena(this.targetLocation)) {
            return this.game.findAnyCardsInPlay((card) => this.match(card, this.context));
        }
        return this.game.allCards.filter((card) => this.match(card, this.context) && card.location === this.targetLocation);
    }
}

module.exports = CardEffect;
