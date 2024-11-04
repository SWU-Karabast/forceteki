const { GameEvent } = require('./GameEvent.js');
const { EventName } = require('../Constants.js');

class InitiateCardAbilityEvent extends GameEvent {
    constructor(context, params, handler) {
        super(EventName.OnInitiateAbilityEffects, context, params, handler);

        const ability = this.context.ability;

        if (ability != null && (!('doesNotTarget' in ability) || !ability.doesNotTarget)) {
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
