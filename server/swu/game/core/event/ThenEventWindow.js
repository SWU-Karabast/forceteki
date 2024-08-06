const EventWindow = require('./EventWindow.js');
const { AbilityType } = require('../Constants.js');

class ThenEventWindow extends EventWindow {
    openWindow(abilityType) {
        if(abilityType !== AbilityType.ForcedReaction && abilityType !== AbilityType.Reaction) {
            super.openWindow(abilityType);
        }
    }

    resetCurrentEventWindow() {
        for(let event of this.events) {
            this.previousEventWindow.addEvent(event);
        }
        super.resetCurrentEventWindow();
    }
}

module.exports = ThenEventWindow;
