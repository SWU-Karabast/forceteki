const { AbilityContext } = require('./AbilityContext.js');
const PlayerOrCardAbility = require('./PlayerOrCardAbility.js');
const { Stage } = require('../Constants.js');

class PlayerAction extends PlayerOrCardAbility {
    constructor(card, title, costs = [], targetResolver, resolveTriggersAfter = true) {
        let properties = { cost: costs, title, resolveTriggersAfter: resolveTriggersAfter };
        if (targetResolver) {
            properties.targetResolver = targetResolver;
        }
        super(properties);
        this.card = card;
        this.cannotBeCancelled = true;
    }

    createContext(player = this.card.controller) {
        return new AbilityContext({
            ability: this,
            game: this.card.game,
            player: player,
            source: this.card,
            stage: Stage.PreTarget
        });
    }

    getAdjustedCost(context) {
        let resourceCost = this.cost.find((cost) => cost.getAdjustedCost);
        return resourceCost ? resourceCost.getAdjustedCost(context) : 0;
    }
}

module.exports = PlayerAction;
