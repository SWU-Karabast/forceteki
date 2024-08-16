const EventWindow = require('./EventWindow.js');
const { AbilityType } = require('../Constants.js');

// UP NEXT: rename this and related back to "Then"
class AdditionalAbilityStepEventWindow extends EventWindow {
    /** @override */
    openWindow(abilityType) {
        if (abilityType !== AbilityType.TriggeredAbility) {
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
