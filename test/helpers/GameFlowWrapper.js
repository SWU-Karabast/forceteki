/* global jasmine */

const Game = require('../../build/game/core/Game.js');
const PlayerInteractionWrapper = require('./PlayerInteractionWrapper.js');
const Settings = require('../../build/Settings.js');

class GameFlowWrapper {
    constructor() {
        var gameRouter = jasmine.createSpyObj('gameRouter', ['gameWon', 'playerLeft', 'handleError']);
        gameRouter.handleError.and.callFake((game, error) => {
            throw error;
        });
        var details = {
            name: 'player1\'s game',
            id: 12345,
            owner: 'player1',
            saveGameId: 12345,
            players: [
                { id: '111', user: Settings.getUserWithDefaultsSet({ username: 'player1' }) },
                { id: '222', user: Settings.getUserWithDefaultsSet({ username: 'player2' }) }
            ]
        };
        this.game = new Game(details, { router: gameRouter });
        this.game.started = true;

        this.player1 = new PlayerInteractionWrapper(this.game, this.game.getPlayerByName('player1'));
        this.player2 = new PlayerInteractionWrapper(this.game, this.game.getPlayerByName('player2'));
        this.player1.player.timerSettings.events = false;
        this.player2.player.timerSettings.events = false;
        this.allPlayers = [this.player1, this.player2];
    }

    get firstPlayer() {
        return this.allPlayers.find((player) => player.initiativePlayer);
    }

    eachPlayerInInitiativeOrder(handler) {
        var playersInOrder = this.allPlayers.sort((player) => !player.initiativePlayer);

        playersInOrder.forEach((player) => handler(player));
    }

    /**
     * Executes a function for each player, starting with the one prompted for action
     * @param {Function} handler - function of a player to be executed
     */
    eachPlayerStartingWithPrompted(handler) {
        var playersInPromptedOrder = this.allPlayers.sort((player) => player.hasPrompt('Waiting for opponent to take an action or pass'));
        playersInPromptedOrder.forEach((player) => handler(player));
    }

    /**
     * Resource any two cards in hand for each player
     */
    resourceAnyTwo() {
        this.guardCurrentPhase('setup');
        this.allPlayers.forEach((player) => player.clickAnyOfSelectableCards(2));
        this.game.continue();
    }

    startGame() {
        this.game.initialise();
    }

    /**
     * Keeps hand during prompt for conflict mulligan
     */
    keepStartingHand() {
        this.guardCurrentPhase('setup');
        this.eachPlayerInInitiativeOrder((player) => player.clickPrompt('No'));
    }


    /**
     * Skips setup phase with defaults
     */
    skipSetupPhase() {
        this.selectInitiativePlayer(this.player1);
        this.keepStartingHand();
        this.resourceAnyTwo();
    }

    /**
     * Both players pass for the rest of the action window
     */
    noMoreActions() {
        // if(this.game.currentPhase === 'dynasty') {
        //     // RelativePlayer that have already passed aren't prompted again in dynasty
        //     this.eachPlayerStartingWithPrompted(player => {
        //         if(!player.player.passedDynasty) {
        //             player.clickPrompt('Pass');
        //         }
        //     });
        // } else {
        //     this.eachPlayerStartingWithPrompted(player => player.clickPrompt('Pass'));
        // }
    }

    /**
     * Skips any remaining conflicts, skips the action window
     */
    finishConflictPhase() {
        this.guardCurrentPhase('conflict');
        while (this.player1.player.getConflictOpportunities() > 0 ||
            this.player2.player.getConflictOpportunities() > 0) {
            try {
                this.noMoreActions();
            } catch (e) {
                // Case: handle skipping a player's conflict
                var playersInPromptedOrder = this.allPlayers.sort((player) => player.hasPrompt('Waiting for opponent to declare conflict'));
                playersInPromptedOrder[0].clickPrompt('Pass Conflict');
                playersInPromptedOrder[0].clickPrompt('yes');
            }
        }
        this.noMoreActions();
        // Resolve claiming imperial favor, if any
        var claimingPlayer = this.allPlayers.find((player) => player.hasPrompt('Which side of the Imperial Favor would you like to claim?'));
        if (claimingPlayer) {
            claimingPlayer.clickPrompt('military');
        }
        // this.guardCurrentPhase('fate');
    }

    /**
     * Completes the regroup phase
     */
    finishRegroupPhase() {
        this.guardCurrentPhase('regroup');
        var playersInPromptedOrder = this.allPlayers.sort((player) => player.hasPrompt('Waiting for opponent to discard dynasty cards'));
        playersInPromptedOrder.forEach((player) => player.clickPrompt('Done'));
        // End the round
        var promptedToEnd = this.allPlayers.sort((player) => player.hasPrompt('Waiting for opponent to end the round'));
        promptedToEnd.forEach((player) => player.clickPrompt('End Round'));
        this.guardCurrentPhase('dynasty');
    }

    /**
     * Moves to the next phase of the game
     * @return {number} value of phase change.
     * regroup -> dynasty value is 4
     * all other changes is -1
     */
    nextPhase() {
        var phaseChange = 0;
        switch (this.game.currentPhase) {
            case 'setup':
                this.skipSetupPhase();
                break;
            case 'action':
                this.finishConflictPhase();
                phaseChange = -1;
                break;
            case 'regroup':
                this.finishRegroupPhase();
                phaseChange = 4; //New turn
                break;
            default:
                break;
        }
        return phaseChange;
    }

    /**
     * Moves through phases, until a certain one is reached
     * @param {String} endphase - phase in which to end
     */
    advancePhases(endphase) {
        if (!endphase) {
            return;
        }

        while (this.game.currentPhase !== endphase) {
            this.nextPhase();
        }
    }

    /**
    *   Executes the honor bidding
    *   @param {?number} player1amt - amount for player1 to bid
    *   @param {?number} player2amt = amount for player2 to bid
    */
    bidHonor(player1amt, player2amt) {
        this.guardCurrentPhase('draw');
        this.player1.bidHonor(player1amt);
        this.player2.bidHonor(player2amt);
        if (this.game.currentPhase === 'draw') {
            this.eachPlayerInInitiativeOrder((player) => {
                if (player.hasPrompt('Triggered Abilities')) {
                    player.pass();
                }
            });
        }
        this.guardCurrentPhase('conflict');
    }

    /**
     * Asserts that the game is in the expected phase
     */
    guardCurrentPhase(phase) {
        if (this.game.currentPhase !== phase) {
            throw new Error(`Expected to be in the ${phase} phase but actually was ${this.game.currentPhase}`);
        }
    }

    getPromptedPlayer(title) {
        var promptedPlayer = this.allPlayers.find((p) => p.hasPrompt(title));

        if (!promptedPlayer) {
            var promptString = this.allPlayers.map((player) => player.name + ': ' + player.formatPrompt()).join('\n\n');
            throw new Error(`No players are being prompted with '${title}'. Current prompts are:\n\n${promptString}`);
        }

        return promptedPlayer;
    }

    selectInitiativePlayer(player) {
        var promptedPlayer = this.getPromptedPlayer('You won the flip. Do you want to start with initiative:');
        if (player === promptedPlayer) {
            promptedPlayer.clickPrompt('Yes');
        } else {
            promptedPlayer.clickPrompt('No');
        }
    }

    /**
     * Get an array of the latest chat messages
     * @param {Number} numBack - number of messages back from the latest to retrieve
     * @param {Boolean} reverse - reverse the retrieved elements so the array is easily read when printed
     */
    getChatLogs(numBack = 1, reverse = true) {
        let results = [];
        for (let i = 0; i < this.game.messages.length && i < numBack; i++) {
            let result = '';
            let chatMessage = this.game.messages[this.game.messages.length - i - 1];
            for (let j = 0; j < chatMessage.message.length; j++) {
                result += getChatString(chatMessage.message[j]);
            }
            results.push(result);
        }

        return reverse ? results.reverse() : results;

        function getChatString(item) {
            if (Array.isArray(item)) {
                return item.map((arrItem) => getChatString(arrItem)).join('');
            } else if (item instanceof Object) {
                if (item.name) {
                    return item.name;
                } else if (item.message) {
                    return getChatString(item.message);
                }
            }
            return item;
        }
    }

    /**
     * Get specified chat message or nothing
     * @param {Number} numBack - How far back you want to get a message, defaults to the latest chat message
     */
    getChatLog(numBack = 0) {
        let messages = this.getChatLogs(numBack + 1, false);
        return messages.length && messages[numBack] ? messages[numBack] : '<No Message Found>';
    }
}

module.exports = GameFlowWrapper;
