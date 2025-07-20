const { AllPlayerPrompt } = require('./AllPlayerPrompt');

class GameOverPrompt extends AllPlayerPrompt {
    constructor(game) {
        super(game);
        if (game.getWinnerNames.length === 0) {
            throw new Error('GameOverPrompt cannot be created when there is no winner');
        }
        this.clickedButton = {};
    }

    /** @override */
    completionCondition(player) {
        return !!this.clickedButton[player.name];
    }

    /** @override */
    activePromptInternal() {
        if (this.game.getWinnerNames.length > 1) {
            return {
                promptTitle: 'Tie Game',
                menuTitle: 'The game ended in a draw!',
                buttons: [{ text: 'Continue Playing', arg: 'continue' }],
                promptUuid: this.uuid
            };
        }
        return {
            promptTitle: 'Game Won',
            menuTitle: this.game.getWinnerNames[0] + ' has won the game!',
            buttons: [{ text: 'Continue Playing', arg: 'continue' }],
            promptUuid: this.uuid
        };
    }

    /** @override */
    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to choose to continue' };
    }

    /** @override */
    menuCommand(player) {
        this.game.addMessage('{0} wants to continue', player);

        this.clickedButton[player.name] = true;

        return true;
    }
}

module.exports = GameOverPrompt;
