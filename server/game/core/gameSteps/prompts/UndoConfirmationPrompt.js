const { AlertType } = require('../../Constants.js');
const HandlerMenuPrompt = require('./HandlerMenuPrompt.js');

class UndoConfirmationPrompt extends HandlerMenuPrompt {
    constructor(game, player, promptTypeMessage, rollbackHandler) {
        const props = {
            activePromptTitle: `Your opponent would like to undo ${promptTypeMessage}`,
            waitingPromptTitle: 'Waiting for opponent to decide whether to allow undo',
            choices: ['Allow', 'Deny'],
            handlers: [
                () => {
                    rollbackHandler();
                },
                () => {
                    game.addAlert(AlertType.Notification, '{0} has denied the undo request', player.opponent);
                }
            ]
        };

        super(game, player, props);
    }

    /** @override */
    setRollbackConfirmation(_playersActiveForPrompt) {
        // No-op
    }
}

module.exports = UndoConfirmationPrompt;
