/* global describe, beforeEach, jasmine */
/* eslint camelcase: 0, no-invalid-this: 0 */

const Contract = require('../../server/game/core/utils/Contract.js');
const TestSetupError = require('./TestSetupError.js');
const { checkNullCard, formatPrompt, getPlayerPromptState, promptStatesEqual, stringArraysEqual } = require('./Util.js');

require('./ObjectFormatters.js');

const GameFlowWrapper = require('./GameFlowWrapper.js');
const Util = require('./Util.js');
const GameStateSetup = require('./GameStateSetup.js');

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
                { id: '111', username: 'player1' },
                { id: '222', username: 'player2' }
            );

            const newContext = {};
            contextRef.context = newContext;

            GameStateSetup.attachTestInfoToObj(this, gameFlowWrapper, 'player1', 'player2');
            GameStateSetup.attachTestInfoToObj(newContext, gameFlowWrapper, 'player1', 'player2');

            const setupGameStateWrapper = (options) => {
                GameStateSetup.setupGameState(newContext, options);
                GameStateSetup.attachAbbreviatedContextInfo(newContext, contextRef);
            };

            this.setupTest = newContext.setupTest = setupGameStateWrapper;
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
