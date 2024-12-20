/* global describe, beforeEach, jasmine */
/* eslint camelcase: 0, no-invalid-this: 0 */

const { GameMode } = require('../../server/GameMode.js');
const Contract = require('../../server/game/core/utils/Contract.js');
const TestSetupError = require('./TestSetupError.js');
const { checkNullCard, formatPrompt, getPlayerPromptState, promptStatesEqual, stringArraysEqual } = require('./Util.js');

require('./ObjectFormatters.js');

const DeckBuilder = require('./DeckBuilder.js');
const GameFlowWrapper = require('./GameFlowWrapper.js');
const Util = require('./Util.js');

const deckBuilder = new DeckBuilder();

// TODO: why not just call these directly
const ProxiedGameFlowWrapperMethods = [
    'advancePhases',
    'allPlayersInInitiativeOrder',
    'getPlayableCardTitles',
    'getChatLog',
    'getChatLogs',
    'getPromptedPlayer',
    'keepStartingHand',
    'moveToNextActionPhase',
    'moveToRegroupPhase',
    'nextPhase',
    'selectInitiativePlayer',
    'setDamage',
    'skipSetupPhase',
    'startGame'
];

function validatePlayerOptions(playerOptions, playerName, startPhase) {
    // list of approved property names
    const noneSetupPhase = [
        'hasInitiative',
        'resources',
        'groundArena',
        'spaceArena',
        'hand',
        'discard',
        'leader',
        'base',
        'deck',
        'resource'
    ];
    // list of approved property names for setup phase
    const setupPhase = [
        'leader',
        'deck',
        'base'
    ];

    // Check for unknown properties
    for (const prop of Object.keys(playerOptions)) {
        if (!noneSetupPhase.includes(prop) && startPhase !== 'setup') {
            throw new Error(`${playerName} has an unknown property '${prop}'`);
        } else if (!setupPhase.includes(prop) && startPhase === 'setup') {
            throw new Error(`${playerName} has an unknown property '${prop}'`);
        }
    }
}

function validateTopLevelOptions(options) {
    const allowedPropertyNames = [
        'player1',
        'player2',
        'phase',
        'autoSingleTarget'
    ];

    // Check for unknown properties
    for (const prop of Object.keys(options)) {
        if (!allowedPropertyNames.includes(prop)) {
            throw new Error(`test setup options has an unknown property '${prop}'`);
        }
    }
}

// this is a hack to get around the fact that our method for checking spec failures doesn't work in parallel mode
if (!jasmine.getEnv().configuration().random) {
    jasmine.getEnv().addReporter({
        specStarted(result) {
            jasmine.getEnv().currentSpec = result;
        },
        specDone() {
            jasmine.getEnv().currentSpec = null;
        }
    });
}

global.integration = function (definitions) {
    describe('- integration -', function () {
        /**
         * @type {SwuTestContextRef}
         */
        const contextRef = {
            context: null, setupTest: function (options) {
                this.context.setupTest(options);
            }
        };
        beforeEach(function () {
            const newContext = {};
            contextRef.context = newContext;

            var gameRouter = jasmine.createSpyObj('gameRouter', ['gameWon', 'playerLeft', 'handleError']);
            gameRouter.handleError.and.callFake((game, error) => {
                throw error;
            });

            this.flow = newContext.flow = new GameFlowWrapper(
                gameRouter,
                { id: '111', username: 'player1' },
                { id: '222', username: 'player2' }
            );

            this.game = newContext.game = this.flow.game;
            this.player1Object = newContext.player1Object = this.game.getPlayerByName('player1');
            this.player2Object = newContext.player2Object = this.game.getPlayerByName('player2');
            this.player1 = newContext.player1 = this.flow.player1;
            this.player2 = newContext.player2 = this.flow.player2;
            this.player1Name = newContext.player1Name = this.flow.player1Name;
            this.player2Name = newContext.player2Name = this.flow.player2Name;

            ProxiedGameFlowWrapperMethods.forEach((method) => {
                this[method] = newContext[method] = (...args) => this.flow[method].apply(this.flow, args);
            });

            this.buildDeck = newContext.buildDeck = function (faction, cards) {
                return deckBuilder.buildDeck(faction, cards);
            };

            /**
             * Factory method. Creates a new simulation of a game.
             * @param {Object} [options = {}] - specifies the state of the game
             */
            this.setupTest = newContext.setupTest = function (options = {}) {
                // Set defaults
                if (!options.player1) {
                    options.player1 = {};
                }
                if (!options.player2) {
                    options.player2 = {};
                }

                // validate supplied parameters
                validatePlayerOptions(options.player1, 'player1', options.phase);
                validatePlayerOptions(options.player2, 'player2', options.phase);
                validateTopLevelOptions(options, ['player1', 'player2', 'phase']);

                this.game.gameMode = GameMode.Premier;

                if (options.player1.hasInitiative) {
                    this.game.initiativePlayer = this.player1Object;
                } else if (options.player2.hasInitiative) {
                    this.game.initiativePlayer = this.player2Object;
                }

                const player1OwnedCards = deckBuilder.getOwnedCards(1, options.player1, options.player2);
                const player2OwnedCards = deckBuilder.getOwnedCards(2, options.player2, options.player1);

                const autoSingleTarget = !!options.autoSingleTarget;
                this.player1Object.autoSingleTarget = autoSingleTarget;
                this.player2Object.autoSingleTarget = autoSingleTarget;

                // pass decklists to players. they are initialized into real card objects in the startGame() call
                const [deck1, namedCards1, resources1, drawDeck1] = deckBuilder.customDeck(1, player1OwnedCards, options.phase);
                const [deck2, namedCards2, resources2, drawDeck2] = deckBuilder.customDeck(2, player2OwnedCards, options.phase);

                this.player1.selectDeck(deck1);
                this.player2.selectDeck(deck2);

                // pass the data for token cards to the game so it can generate them
                this.game.initialiseTokens(deckBuilder.getTokenData());

                // each player object will convert the card names to real cards on start
                this.startGame();

                if (options.phase !== 'setup') {
                    this.player1.player.promptedActionWindows[options.phase] = true;
                    this.player2.player.promptedActionWindows[options.phase] = true;

                    // Advance the phases to the specified
                    this.advancePhases(options.phase);
                } else {
                    // Set action window prompt
                    this.player1.player.promptedActionWindows['action'] = true;
                    this.player2.player.promptedActionWindows['action'] = true;
                }

                // return all zone cards to deck and then set them below
                this.player1.moveAllNonBaseZonesToRemoved();
                this.player2.moveAllNonBaseZonesToRemoved();

                if (options.phase !== 'setup') {
                    // Resources
                    this.player1.setResourceCards(resources1, ['outsideTheGame']);
                    this.player2.setResourceCards(resources2, ['outsideTheGame']);

                    // Arenas
                    this.player1.setGroundArenaUnits(options.player1.groundArena, ['outsideTheGame']);
                    this.player2.setGroundArenaUnits(options.player2.groundArena, ['outsideTheGame']);
                    this.player1.setSpaceArenaUnits(options.player1.spaceArena, ['outsideTheGame']);
                    this.player2.setSpaceArenaUnits(options.player2.spaceArena, ['outsideTheGame']);

                    // Hand + discard
                    this.player1.setHand(options.player1.hand, ['outsideTheGame']);
                    this.player2.setHand(options.player2.hand, ['outsideTheGame']);
                    this.player1.setDiscard(options.player1.discard, ['outsideTheGame']);
                    this.player2.setDiscard(options.player2.discard, ['outsideTheGame']);

                    // Set Leader state (deployed, exhausted, etc.)
                    this.player1.setLeaderStatus(options.player1.leader);
                    this.player2.setLeaderStatus(options.player2.leader);

                    this.player1.attachOpponentOwnedUpgrades(player2OwnedCards.opponentAttachedUpgrades);
                    this.player2.attachOpponentOwnedUpgrades(player1OwnedCards.opponentAttachedUpgrades);
                }

                // Set Base damage
                this.player1.setBaseStatus(options.player1.base);
                this.player2.setBaseStatus(options.player2.base);

                // Deck
                this.player1.setDeck(drawDeck1, ['outsideTheGame']);
                this.player2.setDeck(drawDeck2, ['outsideTheGame']);

                // add named cards to this for easy reference (allows us to do "this.<cardName>")
                // note that if cards map to the same property name (i.e., same title), then they won't be added
                const cardNamesAsProperties = Util.convertNonDuplicateCardNamesToProperties(
                    [this.player1, this.player2],
                    [namedCards1, namedCards2],
                    player1OwnedCards.opponentAttachedUpgrades.concat(player2OwnedCards.opponentAttachedUpgrades)
                );
                this.cardPropertyNames = newContext.cardPropertyNames = [];
                cardNamesAsProperties.forEach((card) => {
                    this[card.propertyName] = newContext[card.propertyName] = card.cardObj;
                    this.cardPropertyNames.push(card.propertyName);
                });

                this.p1Base = newContext.p1Base = this.player1.base;
                this.p1Leader = newContext.p1Leader = this.player1.leader;
                this.p2Base = newContext.p2Base = this.player2.base;
                this.p2Leader = newContext.p2Leader = this.player2.leader;

                this.game.resolveGameState(true);
            };
        });

        afterEach(function() {
            const { context } = contextRef;

            // this is a hack to get around the fact that our method for checking spec failures doesn't work in parallel mode
            const parallelMode = jasmine.getEnv().configuration().random;

            // if there were already exceptions in the test case, don't bother checking the prompts after
            if (
                !parallelMode && jasmine.getEnv().currentSpec.failedExpectations.some(
                    (expectation) => expectation.message.startsWith('Error:') ||
                      expectation.message.startsWith('TestSetupError:')
                )
            ) {
                return;
            }

            if (context.game.currentPhase !== 'action' || context.allowTestToEndWithOpenPrompt) {
                return;
            }

            const actionWindowMenuTitles = [
                'Waiting for opponent to take an action or pass',
                'Choose an action'
            ];

            const playersWithUnresolvedPrompts = [context.player1, context.player2]
                .filter((player) => player.currentPrompt().menuTitle !== 'Choose an action' && !player.currentPrompt().menuTitle.startsWith('Waiting for opponent'));

            if (playersWithUnresolvedPrompts.length > 0) {
                if (parallelMode) {
                    throw new TestSetupError('The test ended with an unresolved prompt for one or both players. If the test had other errors / failures, disregard this error. Run the test in non-parallel mode for additional details.');
                }

                let activePromptsText = playersWithUnresolvedPrompts.map((player) =>
                    `\n******* ${player.name.toUpperCase()} PROMPT *******\n${formatPrompt(player.currentPrompt(), player.currentActionTargets)}\n`
                ).join('');

                throw new TestSetupError(`The test ended with an unresolved prompt for one or both players. Unresolved prompts:\n${activePromptsText}`);
            }
        });

        definitions(contextRef);
    });
};
