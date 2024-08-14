/* global describe, beforeEach, jasmine */
/* eslint camelcase: 0, no-invalid-this: 0 */

const _ = require('underscore');
const { GameMode } = require('../../build/GameMode.js');
const Contract = require('../../build/game/core/utils/Contract.js');

require('./ObjectFormatters.js');

const DeckBuilder = require('./DeckBuilder.js');
const GameFlowWrapper = require('./GameFlowWrapper.js');

const deckBuilder = new DeckBuilder();

// TODO: why not just call these directly
const ProxiedGameFlowWrapperMethods = [
    'eachPlayerInFirstPlayerOrder',
    'startGame',
    'keepStartingHand',
    'keepConflict',
    'skipSetupPhase',
    'selectInitiativePlayer',
    'noMoreActions',
    'advancePhases',
    'getPromptedPlayer',
    'nextPhase',
    'getChatLogs',
    'getChatLog'
];

var customMatchers = {
    toHavePrompt: function () {
        return {
            compare: function (actual, expected) {
                var result = {};
                var currentPrompt = actual.currentPrompt();
                result.pass = actual.hasPrompt(expected);

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have prompt '${expected}' but it did.`;
                } else {
                    result.message = `Expected ${actual.name} to have prompt '${expected}' but it had menuTitle '${currentPrompt.menuTitle}' and promptTitle '${currentPrompt.promptTitle}'.`;
                }

                return result;
            }
        };
    },
    toHavePromptButton: function (util, customEqualityMatchers) {
        return {
            compare: function (actual, expected) {
                var buttons = actual.currentPrompt().buttons;
                var result = {};

                result.pass = _.any(
                    buttons,
                    (button) => !button.disabled && util.equals(button.text, expected, customEqualityMatchers)
                );

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have enabled prompt button '${expected}' but it did.`;
                } else {
                    var buttonText = _.map(
                        buttons,
                        (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                    ).join('\n');
                    result.message = `Expected ${actual.name} to have enabled prompt button '${expected}' but it had buttons:\n${buttonText}`;
                }

                return result;
            }
        };
    },
    toHaveDisabledPromptButton: function (util, customEqualityMatchers) {
        return {
            compare: function (actual, expected) {
                var buttons = actual.currentPrompt().buttons;
                var result = {};

                result.pass = _.any(
                    buttons,
                    (button) => button.disabled && util.equals(button.text, expected, customEqualityMatchers)
                );

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have disabled prompt button '${expected}' but it did.`;
                } else {
                    var buttonText = _.map(
                        buttons,
                        (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                    ).join('\n');
                    result.message = `Expected ${actual.name} to have disabled prompt button '${expected}' but it had buttons:\n${buttonText}`;
                }

                return result;
            }
        };
    },
    toBeAbleToSelect: function () {
        return {
            compare: function (player, card) {
                if (_.isString(card)) {
                    card = player.findCardByName(card);
                }
                let result = {};

                result.pass = player.currentActionTargets.includes(card);

                if (result.pass) {
                    result.message = `Expected ${card.name} not to be selectable by ${player.name} but it was.`;
                } else {
                    result.message = `Expected ${card.name} to be selectable by ${player.name} but it wasn't.`;
                }

                return result;
            }
        };
    },
    toBeAbleToSelectAllOf: function () {
        return {
            compare: function (player, cards) {
                if (!Array.isArray(cards)) {
                    cards = [cards];
                }

                let cardsPopulated = [];
                for (let card of cards) {
                    if (_.isString(card)) {
                        cardsPopulated.push(player.findCardByName(card));
                    } else {
                        cardsPopulated.push(card);
                    }
                }

                let result = {};

                let selectable = cardsPopulated.filter((x) => player.currentActionTargets.includes(x));
                let unselectable = cardsPopulated.filter((x) => !player.currentActionTargets.includes(x));

                result.pass = unselectable.length === 0;

                if (result.pass) {
                    if (selectable.length === 1) {
                        result.message = `Expected ${selectable[0].name} not to be selectable by ${player.name} but it was.`;
                    } else {
                        result.message = `Expected at least 1 of the following cards not to be selectable by ${player.name} but they all were: ${selectable.map((card) => card.name).join(', ')}`;
                    }
                } else {
                    if (unselectable.length === 1) {
                        result.message = `Expected ${unselectable[0].name} to be selectable by ${player.name} but it wasn't.`;
                    } else {
                        result.message = `Expected the following cards to be selectable by ${player.name} but they were not: ${unselectable.map((card) => card.name).join(', ')}`;
                    }
                }

                return result;
            }
        };
    },
    toBeAbleToSelectNoneOf: function () {
        return {
            compare: function (player, cards) {
                if (!Array.isArray(cards)) {
                    cards = [cards];
                }

                let cardsPopulated = [];
                for (let card of cards) {
                    if (_.isString(card)) {
                        cardsPopulated.push(player.findCardByName(card));
                    } else {
                        cardsPopulated.push(card);
                    }
                }

                let result = {};

                let selectable = cardsPopulated.filter((x) => player.currentActionTargets.includes(x));
                let unselectable = cardsPopulated.filter((x) => !player.currentActionTargets.includes(x));

                result.pass = selectable.length === 0;

                if (result.pass) {
                    if (unselectable.length === 1) {
                        result.message = `Expected ${unselectable[0].name} to be selectable by ${player.name} but it wasn't.`;
                    } else {
                        result.message = `Expected at least 1 of the following cards to be selectable by ${player.name} but they all were not: ${unselectable.map((card) => card.name).join(', ')}`;
                    }
                } else {
                    if (selectable.length === 1) {
                        result.message = `Expected ${selectable[0].name} not to be selectable by ${player.name} but it was.`;
                    } else {
                        result.message = `Expected the following cards to not be selectable by ${player.name} but they were: ${selectable.map((card) => card.name).join(', ')}`;
                    }
                }

                return result;
            }
        };
    },
    toHaveAvailableActionWhenClickedInActionPhaseBy: function () {
        return {
            compare: function (card, player) {
                if (_.isString(card)) {
                    card = player.findCardByName(card);
                }
                let result = {};

                player.clickCard(card);

                // this is the default action window prompt (meaning no action was available)
                result.pass = !player.hasPrompt('Action Window');
                var currentPrompt = player.currentPrompt();

                if (result.pass) {
                    result.message = `Expected ${card.name} not to have an action available when clicked by ${player.name} but it has ability prompt with menuTitle '${currentPrompt.menuTitle}' and promptTitle '${currentPrompt.promptTitle}'.`;
                } else {
                    result.message = `Expected ${card.name} to have an action available when clicked by ${player.name} but it did not.`;
                }

                return result;
            }
        };
    },
    toBeActivePlayer: function () {
        return {
            compare: function (player) {
                let result = {};

                // use player.player here because the received parameter is a PlayerInteractionWrapper
                result.pass = player.game.actionPhaseActivePlayer === player.player;

                if (result.pass) {
                    result.message = `Expected ${player.name} not to be the active player but they were.`;
                } else {
                    result.message = `Expected ${player.name} to be the active player but they were not.`;
                }

                return result;
            }
        };
    },
    toHavePassAbilityPrompt: function () {
        return {
            compare: function (player) {
                var result = {};
                const passPromptText = 'Do you want to trigger this ability or pass?';
                var currentPrompt = player.currentPrompt();
                result.pass = player.hasPrompt(passPromptText);

                if (result.pass) {
                    result.message = `Expected ${player.name} not to have pass prompt '${passPromptText}' but it did.`;
                } else {
                    result.message = `Expected ${player.name} to have pass prompt '${passPromptText}' but it had menuTitle '${currentPrompt.menuTitle}' and promptTitle '${currentPrompt.promptTitle}'.`;
                }

                return result;
            }
        };
    }
};

beforeEach(function () {
    jasmine.addMatchers(customMatchers);
});

global.integration = function (definitions) {
    describe('integration', function () {
        beforeEach(function () {
            Contract.configureAssertMode(Contract.AssertMode.Assert, true);

            this.flow = new GameFlowWrapper();

            this.game = this.flow.game;
            this.player1Object = this.game.getPlayerByName('player1');
            this.player2Object = this.game.getPlayerByName('player2');
            this.player1 = this.flow.player1;
            this.player2 = this.flow.player2;

            _.each(ProxiedGameFlowWrapperMethods, (method) => {
                this[method] = (...args) => this.flow[method].apply(this.flow, args);
            });

            this.buildDeck = function (faction, cards) {
                return deckBuilder.buildDeck(faction, cards);
            };

            /**
             * Factory method. Creates a new simulation of a game.
             * @param {Object} [options = {}] - specifies the state of the game
             */
            this.setupTest = function (options = {}) {
                //Set defaults
                if (!options.player1) {
                    options.player1 = {};
                }
                if (!options.player2) {
                    options.player2 = {};
                }
                this.game.gameMode = GameMode.Premier;

                // pass decklists to players. they are initialized into real card objects in the startGame() call
                this.player1.selectDeck(deckBuilder.customDeck(options.player1));
                this.player2.selectDeck(deckBuilder.customDeck(options.player2));

                this.startGame();

                if (options.phase !== 'setup') {
                    this.player1.player.promptedActionWindows[options.phase] = true;
                    this.player2.player.promptedActionWindows[options.phase] = true;

                    //Advance the phases to the specified
                    this.advancePhases(options.phase);
                }

                //Player stats
                this.player1.damageToBase = options.player1.damageToBase ?? 0;
                this.player2.damageToBase = options.player2.damageToBase ?? 0;

                // set cards below - the playerinteractionwrapper will convert string names to real cards
                // TODO: need to redesign the below, it's unintuitive to read and will probably lead to unintended side effects

                //Field
                this.player1.groundArena = options.player1.groundArena;
                this.player2.groundArena = options.player2.groundArena;
                this.player1.spaceArena = options.player1.spaceArena;
                this.player2.spaceArena = options.player2.spaceArena;
                //Resources
                this.player1.resources = options.player1.resources;
                this.player2.resources = options.player2.resources;
                //Deck + discard
                this.player1.hand = options.player1.hand;
                this.player2.hand = options.player2.hand;
                this.player1.discard = options.player1.discard;
                this.player2.discard = options.player2.discard;

                // TODO: re-enable
                // if (options.phase !== 'setup') {
                //     this.game.checkGameState(true);
                // }
            };

            this.initiateConflict = function (options = {}) {
                if (!options.type) {
                    options.type = 'military';
                }
                if (!options.ring) {
                    options.ring = 'air';
                }
                let attackingPlayer = this.getPromptedPlayer(
                    'Choose an elemental ring\n(click the ring again to change conflict type)'
                );
                if (!attackingPlayer) {
                    throw new Error('Neither player can declare a conflict');
                }
                attackingPlayer.declareConflict(options.type, options.province, options.attackers, options.ring);
                if (!options.defenders) {
                    return;
                }
                let defendingPlayer = this.getPromptedPlayer('Choose defenders');
                defendingPlayer.assignDefenders(options.defenders);
                if (!options.jumpTo) {
                    return;
                }
                this.noMoreActions();
            };
        });

        definitions();
    });
};
