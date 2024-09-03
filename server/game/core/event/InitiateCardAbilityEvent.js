const { GameEvent } = require('./GameEvent.js');
const { EventName } = require('../Constants.js');

class InitiateCardAbilityEvent extends GameEvent {
    constructor(params, handler) {
        super(EventName.OnInitiateAbilityEffects, params, handler);
        if (!this.context.ability.doesNotTarget) {
            this.cardTargets = Object.values(this.context.targets).flat();
            this.selectTargets = Object.values(this.context.selects).flat();
        } else {
            this.cardTargets = [];
            this.selectTargets = [];
        }
        this.allTargets = this.cardTargets.concat(this.selectTargets);
    }
}

module.exports = InitiateCardAbilityEvent;
