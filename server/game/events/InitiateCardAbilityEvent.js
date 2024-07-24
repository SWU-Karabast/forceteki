const _ = require('underscore');
const { Event } = require('./Event.js');
const { EventNames } = require('../Constants');

class InitiateCardAbilityEvent extends Event {
    constructor(params, handler) {
        super(EventNames.OnInitiateAbilityEffects, params, handler);
        if(!this.context.ability.doesNotTarget) {
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