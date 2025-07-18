/* global jasmine */

const Game = require('../../server/game/core/Game.js');
const PlayerInteractionWrapper = require('./PlayerInteractionWrapper.js');
const Settings = require('../../server/Settings.js');
const TestSetupError = require('./TestSetupError.js');
const playableCardTitles = require('../json/_playableCardTitles.json');
const Util = require('./Util.js');
const { GameMode } = require('../../server/GameMode.js');

class GameFlowWrapper {
    /**
     * @param {any} router
     * @param {PlayerInfo} player1Info
     * @param {PlayerInfo} player2Info
     */
    constructor(cardDataGetter, router, player1Info, player2Info, enableUndo = false) {
        /** @type {import('../../server/game/core/GameInterfaces.js').GameConfiguration} */
        var details = {
            name: `${player1Info.username}'s game`,
            id: 12345,
            owner: player1Info.username,
            saveGameId: 12345,
            gameMode: GameMode.Premier,
            players: [
                Settings.getUserWithDefaultsSet(player1Info),
                Settings.getUserWithDefaultsSet(player2Info),
            ],
            cardDataGetter,
            pushUpdate: () => true,
            buildSafeTimeout: () => undefined,
            userTimeoutDisconnect: () => undefined,
            enableUndo,
        };

        this.game = new Game(details, { router });
        this.game.started = true;

        this.player1Id = player1Info.id;
        this.player2Id = player2Info.id;

        this.player1 = new PlayerInteractionWrapper(this.game, this.game.getPlayerById(this.player1Id), this);
        this.player2 = new PlayerInteractionWrapper(this.game, this.game.getPlayerById(this.player2Id), this);
        this.allPlayers = [this.player1, this.player2];

        this.snapshotManager = this.game.snapshotManager;
    }

    getPlayableCardTitles() {
        return playableCardTitles;
    }

    allPlayersInInitiativeOrder() {
        return [...this.allPlayers].sort((playerWrapper) => (this.game.initiativePlayer.id === playerWrapper.player.id ? -1 : 1));
    }

    /**
     * Executes a function for each player, starting with the one prompted for action
     * @param {Function} handler - function of a player to be executed
     */
    eachPlayerStartingWithPrompted(handler) {
        const playerPromptStateToSortOrder = (player) => {
            return player.hasPrompt('Waiting for opponent to take an action or pass') ? 1 : 0;
        };

        var playersInPromptedOrder = [...this.allPlayers].sort((playerA, playerB) =>
            playerPromptStateToSortOrder(playerA) - playerPromptStateToSortOrder(playerB)
        );
        playersInPromptedOrder.forEach((player) => handler(player));
    }

    /**
     * Resource any two cards in hand for each player
     */
    resourceAnyTwo() {
        this.guardCurrentPhase('setup');
        for (const player of this.allPlayersInInitiativeOrder()) {
            player.clickAnyOfSelectableCards(2);
            player.clickPrompt('Done');
        }

        this.game.continue();
    }

    startGameAsync() {
        return this.game.initialiseAsync();
    }

    /**
     * Keeps hand during prompt for conflict mulligan
     */
    keepStartingHand() {
        this.guardCurrentPhase('setup');
        this.allPlayersInInitiativeOrder().forEach((player) => player.clickPrompt('Keep'));
    }


    /**
     * Skips setup phase with defaults
     */
    skipSetupPhase() {
        const startingPlayer = (!!this.game.initiativePlayer ? this.allPlayers.find((playerWrapper) => playerWrapper.player.id === this.game.initiativePlayer.id) : this.player1) || this.player1;
        this.selectInitiativePlayer(startingPlayer);
        this.keepStartingHand();
        this.resourceAnyTwo();
    }

    /**
     * Both players pass for the rest of the action window
     */
    noMoreActions() {
        this.eachPlayerStartingWithPrompted((player) => {
            if (player.player.passedActionPhase === false) {
                player.clickPrompt('Pass');
            }
        });
    }

    /**
     * Pass any remaining player actions
     */
    moveToRegroupPhase() {
        this.guardCurrentPhase('action');
        this.noMoreActions();
        this.guardCurrentPhase('regroup');
    }

    moveToNextActionPhase() {
        this.moveToRegroupPhase();
        this.skipRegroupPhase();
    }

    /**
     * Completes the regroup phase
     */
    skipRegroupPhase() {
        this.guardCurrentPhase('regroup');
        var playersInPromptedOrder = [...this.allPlayers].sort((player) => player.hasPrompt('Waiting for opponent to choose cards to resource'));
        playersInPromptedOrder.forEach((player) => player.clickPrompt('Done'));
        this.guardCurrentPhase('action');
    }

    /**
     * Moves to the next phase of the game
     */
    nextPhase(transitionHandler = () => undefined) {
        switch (this.game.currentPhase) {
            case 'setup':
                this.skipSetupPhase();
                break;
            case 'action':
                this.moveToRegroupPhase();
                break;
            case 'regroup':
                this.skipRegroupPhase();
                break;
            default:
                throw new TestSetupError(`Unknown current phase: ${this.game.currentPhase}`);
        }

        transitionHandler(this.game.currentPhase);
    }

    /**
     * Moves through phases, until a certain one is reached
     * @param {String} endphase - phase in which to end
     */
    advancePhases(endphase, transitionHandler = () => undefined) {
        if (!endphase) {
            return;
        }

        while (this.game.currentPhase !== endphase) {
            this.nextPhase(transitionHandler);
        }
    }

    /**
     * Asserts that the game is in the expected phase
     */
    guardCurrentPhase(phase) {
        if (this.game.currentPhase !== phase) {
            throw new TestSetupError(`Expected to be in the ${phase} phase but actually was ${this.game.currentPhase}`);
        }
    }

    getPromptedPlayer(title) {
        var promptedPlayer = this.allPlayers.find((p) => p.hasPrompt(title));

        if (!promptedPlayer) {
            var promptString = this.allPlayers.map((player) => player.name + ': ' + Util.formatPrompt(player.currentPrompt(), player.currentActionTargets)).join('\n\n');
            throw new TestSetupError(`No players are being prompted with '${title}'. Current prompts are:\n\n${promptString}`);
        }

        return promptedPlayer;
    }

    selectInitiativePlayer(player) {
        var promptedPlayer = this.getPromptedPlayer('You won the flip. Choose the player to start with initiative:');
        if (player === promptedPlayer) {
            promptedPlayer.clickPrompt('Yourself');
        } else {
            promptedPlayer.clickPrompt('Opponent');
        }
    }

    setDamage(card, damage) {
        if (card == null) {
            throw new TestSetupError('Null unit passed to helper');
        }

        if (typeof card === 'string') {
            throw new TestSetupError('Must pass card object, not string name');
        }

        if (card.damage === damage) {
            return;
        }

        const damageDiff = damage - card.damage;

        // pass in an empty object as the "damage source"
        if (damageDiff > 0) {
            card.addDamage(damageDiff, {});
        } else if (damageDiff < 0) {
            card.removeDamage(-damageDiff, {});
        }

        Util.refreshGameState(this.game);
    }

    exhaustCard(card) {
        card.exhaust();
        Util.refreshGameState(this.game);
    }

    readyCard(card) {
        card.ready();
        Util.refreshGameState(this.game);
    }

    /**
     * Get an array of the latest chat messages
     * @param {Number} numBack - number of messages back from the latest to retrieve
     * @param {Boolean} inOrder - reverse the retrieved elements so the array is displayed in the order the messages occurred.
     */
    getChatLogs(numBack = 1, inOrder = true) {
        let results = [];
        for (let i = 0; i < this.game.messages.length && i < numBack; i++) {
            let result = '';
            let chatMessage = this.game.messages[this.game.messages.length - i - 1];
            for (let j = 0; j < chatMessage.message.length; j++) {
                result += getChatString(chatMessage.message[j]);
            }
            results.push(result);
        }

        return inOrder ? results.reverse() : results;

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
