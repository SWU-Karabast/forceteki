const Effect = require('./Effect.js');
const { Players, isArena, WildcardLocations } = require('../Constants.js');

class CardEffect extends Effect {
    constructor(game, source, properties, effect) {
        if(!properties.match) {
            properties.match = (card, context) => card === context.source;
            if(properties.location === WildcardLocations.Any) {
                properties.targetLocation = WildcardLocations.Any;
            }
        }
        super(game, source, properties, effect);
        this.targetController = properties.targetController || Players.Self;
        this.targetLocation = properties.targetLocation || WildcardLocations.AnyArena;
    }

    isValidTarget(target) {
        if(target === this.match) {
            // This is a hack to check whether this is a lasting effect
            return true;
        }
        return (
            target.allowGameAction('applyEffect', this.context) &&
            (this.targetController !== Players.Self || target.controller === this.source.controller) &&
            (this.targetController !== Players.Opponent || target.controller !== this.source.controller)
        );
    }

    getTargets() {
        if(this.targetLocation === WildcardLocations.Any) {
            return this.game.allCards.filter(card => this.match(card, this.context));
        } else if(isArena(this.targetLocation)) {
            return this.game.findAnyCardsInPlay(card => this.match(card, this.context));
        }
        return this.game.allCards.filter(card => this.match(card, this.context) && card.location === this.targetLocation);
    }
}

module.exports = CardEffect;
