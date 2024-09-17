const EventWindow = require('./EventWindow.js');
const { AbilityType } = require('../Constants.js');

/**
 * This window type is designed to handle "Then" abilities (SWU 8.29), in which
 * there are multiple steps to an ability ("Do X, then do Y") and all steps need
 * to resolve before any triggered events / effects are resolved.
 *
 * Any events triggered during execution of the window will be passed back to the
 * calling pipeline for execution after this window closes
 */
class ThenEventWindow extends EventWindow {
    /** @override */
    openTriggeredAbilityWindow() {
        // we are deliberately not activating triggers here because they are being passed back to the calling window
    }

    /** @override */
    resetCurrentEventWindow() {
        for (let event of this.events) {
            this.previousEventWindow.addEvent(event);
        }

        super.resetCurrentEventWindow();
    }
}

module.exports = ThenEventWindow;
