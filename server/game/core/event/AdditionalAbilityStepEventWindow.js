const EventWindow = require('./EventWindow.js');
const { AbilityType } = require('../Constants.js');

class AdditionalAbilityStepEventWindow extends EventWindow {
    /** @override */
    openWindow(abilityType) {
        if (abilityType !== AbilityType.ForcedReaction && abilityType !== AbilityType.Reaction) {
            super.openWindow(abilityType);
        }
    }

    /** @override */
    resetCurrentEventWindow() {
        for (let event of this.events) {
            this.previousEventWindow.addEvent(event);
        }
        super.resetCurrentEventWindow();
    }
}

module.exports = AdditionalAbilityStepEventWindow;
