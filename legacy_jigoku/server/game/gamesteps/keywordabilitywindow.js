const ForcedTriggeredAbilityWindow = require('./forcedtriggeredabilitywindow.js');

class KeywordAbilityWindow extends ForcedTriggeredAbilityWindow {
    constructor(game, abilityType, window, eventsToExclude = []) {
        super(game, abilityType, window, eventsToExclude);
    }

    addChoice(context) {
        if(!context.event.cancelled && !this.hasAbilityBeenTriggered(context) && context.ability && context.ability.isKeywordAbility()) {
            this.choices.push(context);
        }
    }
}

module.exports = KeywordAbilityWindow;
