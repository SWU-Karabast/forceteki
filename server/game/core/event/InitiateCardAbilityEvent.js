const { GameEvent } = require('./GameEvent.js');
const { EventName } = require('../Constants.js');

class InitiateCardAbilityEvent extends GameEvent {
    constructor(params, handler) {
        super(EventName.OnInitiateAbilityEffects, params, handler);
        if (!this.context.ability.doesNotTarget) {
            this.cardTargets = Object.values(this.context.targets).flat();
            this.selectTargets = Object.values(this.context.selects).flat();
            this.tokenTargets = Object.values(this.context.tokens).flat();
        } else {
            this.cardTargets = [];
            this.selectTargets = [];
            this.tokenTargets = [];
        }
        this.allTargets = this.cardTargets.concat(this.selectTargets, this.tokenTargets);
    }
}

module.exports = InitiateCardAbilityEvent;
