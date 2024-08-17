const { AbilityContext } = require('./AbilityContext.js');
const PlayerOrCardAbility = require('./PlayerOrCardAbility.js');
const { Stage } = require('../Constants.js');

class PlayerAction extends PlayerOrCardAbility {
    constructor(card, title, costs = [], target) {
        let properties = { cost: costs };
        if (target) {
            properties.target = target;
        }
        super(properties, title);
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

    getReducedCost(context) {
        let resourceCost = this.cost.find((cost) => cost.getReducedCost);
        return resourceCost ? resourceCost.getReducedCost(context) : 0;
    }

    /** @override */
    isAction() {
        return true;
    }
}

module.exports = PlayerAction;
