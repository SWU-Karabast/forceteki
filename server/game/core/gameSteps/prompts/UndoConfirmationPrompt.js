const { AlertType } = require('../../Constants.js');
const HandlerMenuPrompt = require('./HandlerMenuPrompt.js');

class UndoConfirmationPrompt extends HandlerMenuPrompt {
    /**
     * @param {import('../../Game')} game
     * @param {import('../../Player').Player} promptedPlayer
     * @param {string} promptTypeMessage
     * @param {function} rollbackHandler
     */
    constructor(game, promptedPlayer, promptTypeMessage, rollbackHandler) {
        const choices = ['Allow', 'Deny'];

        const handlers = [
            () => {
                rollbackHandler();
            },
            () => {
                promptedPlayer.incrementRejectedOpponentUndoRequests();
                game.addAlert(AlertType.Notification, '{0} has denied the undo request', promptedPlayer.opponent);
            }
        ];

        if (promptedPlayer.rejectedOpponentUndoRequests >= 2) {
            choices.push('Deny and Block Requests');
            handlers.push(() => {
                promptedPlayer.opponent.setUndoRequestsBlocked(true);
                game.addAlert(AlertType.Warning, '{0} has denied the undo request and blocked further undo requests from {1}', promptedPlayer.opponent, promptedPlayer);
            });
        }

        const props = {
            activePromptTitle: `Your opponent would like to undo ${promptTypeMessage}`,
            waitingPromptTitle: 'Waiting for opponent to decide whether to allow undo',
            choices,
            handlers
        };

        super(game, promptedPlayer, props);
    }

    /** @override */
    setRollbackConfirmation(_playersActiveForPrompt) {
        // No-op
    }
}

module.exports = UndoConfirmationPrompt;
