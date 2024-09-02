/* global describe, beforeEach, jasmine */
/* eslint camelcase: 0, no-invalid-this: 0 */

const { select } = require('underscore');
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
    'moveToNextActionPhase',
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
    toHaveEnabledPromptButton: function (util, customEqualityMatchers) {
        return {
            compare: function (actual, expected) {
                var buttons = actual.currentPrompt().buttons;
                var result = {};

                result.pass = buttons.some(
                    (button) => !button.disabled && util.equals(button.text, expected, customEqualityMatchers)
                );

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have enabled prompt button '${expected}' but it did.`;
                } else {
                    var buttonText = buttons.map(
                        (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                    ).join('\n');
                    result.message = `Expected ${actual.name} to have enabled prompt button '${expected}' but it had buttons:\n${buttonText}`;
                }

                result.message += `\n${generatePromptTitlesMessage(actual)}`;

                return result;
            }
        };
    },
    toHaveEnabledPromptButtons: function (util, customEqualityMatchers) {
        return {
            compare: function (actual, expecteds) {
                if (!Array.isArray(expecteds)) {
                    expecteds = [expecteds];
                }

                var buttons = actual.currentPrompt().buttons;
                var result = {};

                for (let expected of expecteds) {
                    result.pass = buttons.some(
                        (button) => !button.disabled && util.equals(button.text, expected, customEqualityMatchers)
                    );

                    if (result.pass) {
                        result.message = `Expected ${actual.name} not to have enabled prompt button '${expected}' but it did.`;
                    } else {
                        var buttonText = buttons.map(
                            (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                        ).join('\n');
                        result.message = `Expected ${actual.name} to have enabled prompt button '${expected}' but it had buttons:\n${buttonText}`;
                    }
                }

                result.message += `\n${generatePromptTitlesMessage(actual)}`;

                return result;
            }
        };
    },
    toHaveDisabledPromptButton: function (util, customEqualityMatchers) {
        return {
            compare: function (actual, expected) {
                var buttons = actual.currentPrompt().buttons;
                var result = {};

                result.pass = buttons.some(
                    (button) => button.disabled && util.equals(button.text, expected, customEqualityMatchers)
                );

                if (result.pass) {
                    result.message = `Expected ${actual.name} not to have disabled prompt button '${expected}' but it did.`;
                } else {
                    var buttonText = buttons.map(
                        (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                    ).join('\n');
                    result.message = `Expected ${actual.name} to have disabled prompt button '${expected}' but it had buttons:\n${buttonText}`;
                }

                result.message += `\n${generatePromptTitlesMessage(actual)}`;

                return result;
            }
        };
    },
    toHaveDisabledPromptButtons: function (util, customEqualityMatchers) {
        return {
            compare: function (actual, expecteds) {
                if (!Array.isArray(expecteds)) {
                    expecteds = [expecteds];
                }

                var buttons = actual.currentPrompt().buttons;
                var result = {};

                for (let expected of expecteds) {
                    result.pass = buttons.some(
                        (button) => button.disabled && util.equals(button.text, expected, customEqualityMatchers)
                    );

                    if (result.pass) {
                        result.message = `Expected ${actual.name} not to have disabled prompt button '${expected}' but it did.`;
                    } else {
                        var buttonText = buttons.map(
                            (button) => '[' + button.text + (button.disabled ? ' (disabled) ' : '') + ']'
                        ).join('\n');
                        result.message = `Expected ${actual.name} to have disabled prompt button '${expected}' but it had buttons:\n${buttonText}`;
                    }
                }

                result.message += `\n${generatePromptTitlesMessage(actual)}`;

                return result;
            }
        };
    },
    toBeAbleToSelect: function () {
        return {
            compare: function (player, card) {
                if (typeof card === 'string') {
                    card = player.findCardByName(card);
                }
                let result = {};

                result.pass = player.currentActionTargets.includes(card);

                if (result.pass) {
                    result.message = `Expected ${card.name} not to be selectable by ${player.name} but it was.`;
                } else {
                    result.message = `Expected ${card.name} to be selectable by ${player.name} but it wasn't.`;
                }

                result.message += `\n${generatePromptTitlesMessage(player)}`;

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
                    if (typeof card === 'string') {
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

                result.message += `\n${generatePromptTitlesMessage(player)}`;

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
                    if (typeof card === 'string') {
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

                result.message += `\n${generatePromptTitlesMessage(player)}`;

                return result;
            }
        };
    },
    toBeAbleToSelectExactly: function () {
        return {
            compare: function (player, cards) {
                if (!Array.isArray(cards)) {
                    cards = [cards];
                }

                let cardsPopulated = [];
                for (let card of cards) {
                    if (typeof card === 'string') {
                        cardsPopulated.push(player.findCardByName(card));
                    } else {
                        cardsPopulated.push(card);
                    }
                }

                let result = {};

                let expectedSelectable = cardsPopulated.filter((x) => player.currentActionTargets.includes(x));
                let unexpectedUnselectable = cardsPopulated.filter((x) => !player.currentActionTargets.includes(x));
                let unexpectedSelectable = player.currentActionTargets.filter((x) => !cardsPopulated.includes(x));

                result.pass = unexpectedUnselectable.length === 0 && unexpectedSelectable.length === 0;

                if (result.pass) {
                    result.message = `Expected ${player.name} not to be able to select exactly these cards but they can: ${expectedSelectable.map((card) => card.name).join(', ')}`;
                } else {
                    let message = '';

                    if (unexpectedUnselectable.length > 0) {
                        message = `Expected the following cards to be selectable by ${player.name} but they were not: ${unexpectedUnselectable.map((card) => card.name).join(', ')}`;
                    }
                    if (unexpectedSelectable.length > 0) {
                        if (message.length > 0) {
                            message += '\n';
                        }
                        message += `Expected the following cards not to be selectable by ${player.name} but they were: ${unexpectedSelectable.map((card) => card.name).join(', ')}`;
                    }
                    result.message = message;
                }

                result.message += `\n${generatePromptTitlesMessage(player)}`;

                return result;
            }
        };
    },
    toHaveAvailableActionWhenClickedInActionPhaseBy: function () {
        return {
            compare: function (card, player) {
                if (typeof card === 'string') {
                    card = player.findCardByName(card);
                }
                let result = {};

                player.clickCardNonChecking(card);

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
    },
    toBeInBottomOfDeck: function () {
        return {
            compare: function (card, player, numCards) {
                var result = {};
                const deck = player.deck;
                const L = deck.length;
                result.pass = L >= numCards;
                if (result.pass) {
                    result.pass = card.location === 'deck';
                    if (!result.pass) {
                        result.message = `Expected ${card.title} to be in the deck.`;
                    } else {
                        var onBottom = false;
                        for (let i = 1; i <= numCards; i++) {
                            if (deck[L - i] === card) {
                                onBottom = true;
                                break;
                            }
                        }
                        result.pass = onBottom;
                        if (!onBottom) {
                            result.message = `Expected ${card.title} to be on the bottom of the deck.`;
                        }
                    }
                } else {
                    result.message = 'Deck is smaller than parameter numCards';
                }
                return result;
            }
        };
    },
    toAllBeInBottomOfDeck: function () {
        return {
            compare: function (cards, player, numCards) {
                var result = {};
                const deck = player.deck;
                const L = deck.length;
                result.pass = L >= numCards;
                if (result.pass) {
                    var notInDeck = [];
                    var notOnBottom = [];
                    for (let card of cards) {
                        thisCardPass = card.location === 'deck';
                        if (!thisCardPass) {
                            result.pass = thisCardPass;
                            notInDeck.push(card.title);
                        } else {
                            var onBottom = false;
                            for (let i = 1; i <= numCards; i++) {
                                if (deck[L - i] === card) {
                                    onBottom = true;
                                    break;
                                }
                            }
                            thisCardPass = onBottom;
                            if (!onBottom) {
                                result.pass = onBottom;
                                notOnBottom.push(card.title);
                            }
                        }
                    }

                    if (!result.pass) {
                        result.message = '';
                        if (notInDeck.length > 0) {
                            result.message += `Expected ${notInDeck.join(', ')} to be in the deck.`;
                        }
                        if (notOnBottom.length > 0) {
                            result.message += ` Expected ${notOnBottom.join(', ')} to be on the bottom of the deck`;
                        }
                    }
                } else {
                    result.message = 'Deck is smaller than parameter numCards';
                }
                return result;
            }
        };
    },
    toBeInLocation: function () {
        return {
            compare: function (card, location, player = null) {
                if (typeof card === 'string') {
                    throw new Error('This expectation requires a card object, not a name');
                }
                let result = {};

                const pileOwningPlayer = player?.player || card.owner;

                const correctProperty = card.location === location;
                const correctPile = pileOwningPlayer.getCardPile(location).includes(card);

                if (correctProperty !== correctPile) {
                    result.pass = false;
                    result.message = `Card ${card.internalName} has inconsistent location state, card.location is '${card.location}' but it is not in the corresponding pile for ${pileOwningPlayer.name}'`;
                    return result;
                }

                result.pass = correctProperty && correctPile;

                if (result.pass) {
                    result.message = `Expected ${card.internalName} not to be in location '${location}' but it is`;
                } else {
                    result.message = `Expected ${card.internalName} to be in location '${location}' but it is in location '${card.location}'`;
                }

                return result;
            }
        };
    }
};

function generatePromptTitlesMessage(player) {
    const currentPrompt = player.currentPrompt();
    return `Current prompt for ${player.name}: menuTitle = '${currentPrompt.menuTitle}', promptTitle = '${currentPrompt.promptTitle}'`;
}

beforeEach(function () {
    jasmine.addMatchers(customMatchers);
});

global.integration = function (definitions) {
    describe('- integration -', function () {
        beforeEach(function () {
            Contract.configureAssertMode(Contract.AssertMode.Assert, true);

            this.flow = new GameFlowWrapper();

            this.game = this.flow.game;
            this.player1Object = this.game.getPlayerByName('player1');
            this.player2Object = this.game.getPlayerByName('player2');
            this.player1 = this.flow.player1;
            this.player2 = this.flow.player2;

            ProxiedGameFlowWrapperMethods.forEach((method) => {
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
                this.player1.selectDeck(deckBuilder.customDeck(1, options.player1));
                this.player2.selectDeck(deckBuilder.customDeck(2, options.player2));

                // pass the data for token cards to the game so it can generate them
                this.game.initialiseTokens(deckBuilder.getTokenData());

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

                // return all zone cards to deck and then set them below - the playerinteractionwrapper will convert string names to real cards
                this.player1.moveAllNonBaseZonesToRemoved();
                this.player2.moveAllNonBaseZonesToRemoved();

                // Resources
                this.player1.setResourceCards(options.player1.resources, ['removed from game']);
                this.player2.setResourceCards(options.player2.resources, ['removed from game']);

                // Arenas
                this.player1.setGroundArenaUnits(options.player1.groundArena, ['removed from game']);
                this.player2.setGroundArenaUnits(options.player2.groundArena, ['removed from game']);
                this.player1.setSpaceArenaUnits(options.player1.spaceArena, ['removed from game']);
                this.player2.setSpaceArenaUnits(options.player2.spaceArena, ['removed from game']);

                // Hand + discard
                this.player1.setHand(options.player1.hand, ['removed from game']);
                this.player2.setHand(options.player2.hand, ['removed from game']);
                this.player1.setDiscard(options.player1.discard, ['removed from game']);
                this.player2.setDiscard(options.player2.discard, ['removed from game']);

                // Deck
                this.player1.setDeck(options.player1.deck, ['removed from game']);
                this.player2.setDeck(options.player2.deck, ['removed from game']);

                // TODO: re-enable when we have tests to do during setup phase
                // if (options.phase !== 'setup') {
                //     this.game.resolveGameState(true);
                // }
            };
        });

        definitions();
    });
};
