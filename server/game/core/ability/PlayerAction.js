const { AbilityContext } = require('./AbilityContext.js');
const PlayerOrCardAbility = require('./PlayerOrCardAbility.js');
const { Stage } = require('../Constants.js');

class PlayerAction extends PlayerOrCardAbility {
    constructor(card, costs = [], target) {
        let properties = { cost: costs };
        if (target) {
            properties.target = target;
        }
        super(properties);
        this.card = card;
        this.abilityType = 'action';
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

    // TODO: replace 'fate' with 'resource' everywhere
    getReducedCost(context) {
        let fateCost = this.cost.find((cost) => cost.getReducedCost);
        return fateCost ? fateCost.getReducedCost(context) : 0;
    }

    /** @override */
    isAction() {
        return true;
    }
}

module.exports = PlayerAction;

