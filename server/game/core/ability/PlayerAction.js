const { AbilityContext } = require('./AbilityContext.js');
const PlayerOrCardAbility = require('./PlayerOrCardAbility.js');
const { Stage, PhaseName } = require('../Constants.js');
const { TriggerHandlingMode } = require('../event/EventWindow.js');

class PlayerAction extends PlayerOrCardAbility {
    /**
     * @param {import('../event/EventWindow.js').IEventWindowTriggerProps} triggerProps
     */
    constructor(game, card, title, costs = [], targetResolver, triggerProps = null) {
        let properties = { cost: costs, title, triggerProps };
        if (targetResolver) {
            properties.targetResolver = targetResolver;
        }
        super(game, card, properties);
        this.cannotBeCancelled = true;
    }

    /** @override */
    meetsRequirements(context, ignoredRequirements = []) {
        if (
            !ignoredRequirements.includes('phase') &&
            context.game.currentPhase !== PhaseName.Action
        ) {
            return 'phase';
        }

        return super.meetsRequirements(context, ignoredRequirements);
    }

    getAdjustedCost(context) {
        let resourceCost = this.getCosts(context).find((cost) => cost.getAdjustedCost);
        return resourceCost ? resourceCost.getAdjustedCost(context) : 0;
    }
}

module.exports = PlayerAction;
