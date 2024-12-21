const { AbilityContext } = require('./AbilityContext.js');
const PlayerOrCardAbility = require('./PlayerOrCardAbility.js');
const { Stage, PhaseName } = require('../Constants.js');
const { TriggerHandlingMode } = require('../event/EventWindow.js');

class PlayerAction extends PlayerOrCardAbility {
    constructor(card, title, costs = [], targetResolver, triggerHandlingMode = TriggerHandlingMode.ResolvesTriggers) {
        let properties = { cost: costs, title, triggerHandlingMode };
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
