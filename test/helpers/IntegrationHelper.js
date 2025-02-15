/* global describe, beforeEach, jasmine */
/* eslint camelcase: 0, no-invalid-this: 0 */

const Contract = require('../../server/game/core/utils/Contract.js');
const TestSetupError = require('./TestSetupError.js');
const { formatPrompt } = require('./Util.js');

require('./ObjectFormatters.js');

const GameFlowWrapper = require('./GameFlowWrapper.js');
const Util = require('./Util.js');
const GameStateBuilder = require('./GameStateBuilder.js');
const DeckBuilder = require('./DeckBuilder.js');
const { cards } = require('../../server/game/cards/Index.js');
const CardHelpers = require('../../server/game/core/card/CardHelpers.js');

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

const gameStateBuilder = new GameStateBuilder();

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
            var gameRouter = jasmine.createSpyObj('gameRouter', ['gameWon', 'playerLeft', 'handleError']);
            gameRouter.handleError.and.callFake((game, error) => {
                throw error;
            });

            const gameFlowWrapper = new GameFlowWrapper(
                gameRouter,
                { id: '111', username: 'player1', settings: { optionSettings: { autoSingleTarget: false } } },
                { id: '222', username: 'player2', settings: { optionSettings: { autoSingleTarget: false } } }
            );

            const newContext = {};
            contextRef.context = newContext;

            gameStateBuilder.attachTestInfoToObj(this, gameFlowWrapper, 'player1', 'player2');
            gameStateBuilder.attachTestInfoToObj(newContext, gameFlowWrapper, 'player1', 'player2');

            const setupGameStateWrapper = async (options) => {
                await gameStateBuilder.setupGameState(newContext, options);
                gameStateBuilder.attachAbbreviatedContextInfo(newContext, contextRef);
            };

            this.setupTest = newContext.setupTest = setupGameStateWrapper;

            // used only for the "import all cards" test
            contextRef.buildImportAllCardsTools = () => ({
                deckBuilder: new DeckBuilder(),
                implementedCardsCtors: cards,
                unimplementedCardCtor: CardHelpers.createUnimplementedCard
            });
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
