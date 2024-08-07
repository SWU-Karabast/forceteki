const { AllPlayerPrompt } = require('./AllPlayerPrompt');

class GameWonPrompt extends AllPlayerPrompt {
    constructor(game, winner) {
        super(game);
        this.winner = winner;
        this.clickedButton = {};
    }

    /** @override */
    completionCondition(player) {
        return !!this.clickedButton[player.name];
    }

    /** @override */
    activePrompt() {
        return {
            promptTitle: 'Game Won',
            menuTitle: this.winner.name + ' has won the game!',
            buttons: [{ text: 'Continue Playing' }]
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

module.exports = GameWonPrompt;