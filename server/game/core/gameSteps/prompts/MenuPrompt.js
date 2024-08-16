const { UiPrompt } = require('./UiPrompt.js');

/**
 * General purpose menu prompt. By specifying a context object, the buttons in
 * the active prompt can call the corresponding method on the context object.
 * Methods on the contact object should return true in order to complete the
 * prompt.
 *
 * The properties option object may contain the following:
 * activePrompt       - the full prompt to display for the prompted player.
 * waitingPromptTitle - the title to display for opponents.
 * source             - what is at the origin of the user prompt, usually a card;
 *                      used to provide a default waitingPromptTitle, if missing
 */
class MenuPrompt extends UiPrompt {
    constructor(game, player, context, properties) {
        super(game);
        this.player = player;
        this.context = context;
        if (properties.source && !properties.waitingPromptTitle) {
            properties.waitingPromptTitle = 'Waiting for opponent to use ' + properties.source.name;
        }
        this.properties = properties;
        game.getPlayers().forEach((player) => player.clearSelectableCards());
    }

    /** @override */
    activeCondition(player) {
        return player === this.player;
    }

    /** @override */
    activePrompt() {
        let promptTitle = this.properties.promptTitle || (this.properties.source ? this.properties.source.name : undefined);
        return Object.assign({ promptTitle: promptTitle }, this.properties.activePrompt);
    }

    /** @override */
    waitingPrompt() {
        return { menuTitle: this.properties.waitingPromptTitle || 'Waiting for opponent' };
    }

    /** @override */
    menuCommand(player, arg, method) {
        if (!this.context[method]) {
            return false;
        }

        if (this.context[method](player, arg, this.properties.context)) {
            this.complete();
        }

        return true;
    }

    hasMethodButton(method) {
        return this.properties.activePrompt.buttons.some((button) => button.method === method);
    }
}

module.exports = MenuPrompt;
