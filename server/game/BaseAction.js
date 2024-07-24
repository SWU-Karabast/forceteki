const { AbilityContext } = require('./AbilityContext');
const BaseAbility = require('./baseability.js');
const { Stages } = require('./Constants.js');

class BaseAction extends BaseAbility {
    constructor(card, costs = [], target) {
        let properties = { cost: costs };
        if(target) {
            properties.target = target;
        }
        super(properties);
        this.card = card;
        this.abilityType = 'action';
        this.cannotBeCancelled = true;
    }

    meetsRequirements(context) {
        return super.meetsRequirements(context);
    }

    createContext(player = this.card.controller) {
        return new AbilityContext({
            ability: this,
            game: this.card.game,
            player: player,
            source: this.card,
            stage: Stages.PreTarget
        });
    }

    // TODO: replace 'fate' with 'resource' everywhere
    getReducedCost(context) {
        let fateCost = this.cost.find(cost => cost.getReducedCost);
        return fateCost ? fateCost.getReducedCost(context) : 0;
    }

    isAction() {
        return true;
    }
}

module.exports = BaseAction;
