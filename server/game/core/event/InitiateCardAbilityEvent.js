const _ = require('underscore');
const { GameEvent } = require('./GameEvent.js');
const { EventName } = require('../Constants.js');

class InitiateCardAbilityEvent extends GameEvent {
    constructor(params, handler) {
        super(EventName.OnInitiateAbilityEffects, params, handler);
        if (!this.context.ability.doesNotTarget) {
            this.cardTargets = _.flatten(_.values(this.context.targets));
            this.selectTargets = _.flatten(_.values(this.context.selects));
            this.tokenTargets = _.flatten(_.values(this.context.tokens));
        } else {
            this.cardTargets = [];
            this.selectTargets = [];
            this.tokenTargets = [];
        }
        this.allTargets = this.cardTargets.concat(this.selectTargets, this.tokenTargets);
    }
}

module.exports = InitiateCardAbilityEvent;
