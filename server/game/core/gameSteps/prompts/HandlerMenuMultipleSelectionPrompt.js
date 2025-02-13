const HandlerMenuPrompt = require('./HandlerMenuPrompt.js');

/**
 * General purpose menu prompt that allows the user to submit multiple choices at once.
 * Takes a choices object with menu options and an overall handler that is called when the user is done choosing.
 * Handlers should return true in order to complete the prompt.
 *
 * The properties option object may contain the following:
 * choices            - an array of titles for menu buttons
 * maxSelected        - the maximum number of choices the player is allowed to submit. Leave undefined to allow the player to submit any number.
 * handler            - a handler function that is called with the results of the prompt(which choices were selected) after the user clicks 'Done'
 * activePromptTitle  - the title that should be used in the prompt for the choosing player.
 * waitingPromptTitle - the title to display for opponents.
 * source             - what is at the origin of the user prompt, usually a card; used to provide a default waitingPromptTitle, if missing
 */
class HandlerMenuMultipleSelectionPrompt extends HandlerMenuPrompt {
    constructor(game, player, properties) {
        const selectedOptions = [];
        properties.handlers = properties.choices.map((choice) => () => {
            if (selectedOptions.includes(choice)) {
                selectedOptions.splice(selectedOptions.indexOf(choice));
            } else {
                selectedOptions.push(choice);
            }
            return false; // Signals that the prompt as a whole is not fully done.
        });
        properties.choices.push('Done');
        properties.handlers.push(() => {
            // Small convenience feature: checking the selection maximum on submit rather than on selection means that the player can
            // temporarily go over the limit before deselecting excess choices, rather than forcing the opposite order.
            if (selectedOptions.length > properties.maxSelected) {
                // TODO: show the player a message explaining that they submitted an invalid number of options
                return false;
            }
            return properties.handler(selectedOptions);
        });

        super(game, player, properties);

        this.selectedOptions = selectedOptions;
    }

    /** @override */
    activePrompt() {
        let buttons = [];
        buttons = buttons.concat(this.properties.choices.map((choice, index) => {
            return { text: choice, arg: index, selected: this.selectedOptions.includes(choice) };
        }));
        if (this.game.manualMode && (!this.properties.choices || this.properties.choices.every((choice) => choice !== 'Cancel'))) {
            buttons = buttons.concat({ text: 'Cancel Prompt', arg: 'cancel' });
        }
        return {
            menuTitle: this.properties.activePromptTitle ??
              (this.properties.maxSelected
                  ? `Select up to ${this.properties.maxSelected} choices and then choose "Done"`
                  : 'Select any number of choices and then choose "Done"'),
            buttons,
            controls: this.getAdditionalPromptControls(),
            promptTitle: this.properties.source.name,
            promptUuid: this.uuid,
            promptType: this.properties.promptType
        };
    }

    getCurrentSelection() {
        return this.selectedOptions;
    }
}

module.exports = HandlerMenuMultipleSelectionPrompt;
