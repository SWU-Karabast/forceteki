const { AbilityContext } = require('./AbilityContext.js');
const PlayerOrCardAbility = require('./PlayerOrCardAbility.js');
const { Stage, PhaseName } = require('../Constants.js');
const { TriggerHandlingMode } = require('../event/EventWindow.js');

class PlayerAction extends PlayerOrCardAbility {
    constructor(game, card, title, costs = [], targetResolver, triggerHandlingMode = TriggerHandlingMode.ResolvesTriggers) {
        let properties = { cost: costs, title, triggerHandlingMode };
        if (targetResolver) {
            properties.targetResolver = targetResolver;
        }
        super(game, card, properties);
        this.cannotBeCancelled = true;
    }

    getAdjustedCost(context) {
        let resourceCost = this.getCosts(context).find((cost) => cost.getAdjustedCost);
        return resourceCost ? resourceCost.getAdjustedCost(context) : 0;
    }
}

module.exports = PlayerAction;
