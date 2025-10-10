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
const { SnapshotType, PhaseName } = require('../../server/game/core/Constants.js');
const { UndoMode } = require('../../server/game/core/snapshot/SnapshotManager.js');

// set to true to run all tests with undo enabled
const ENABLE_UNDO_ALL_TESTS = false;

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

function buildStartOfTestSnapshot(game) {
    if (game.currentPhase === PhaseName.Setup) {
        return {
            type: SnapshotType.Phase,
            PhaseName: PhaseName.Setup
        };
    }

    const activePlayer = game.getActivePlayer();

    return {
        player: activePlayer,
        snapshotId: game.takeManualSnapshot(activePlayer)
    };
}

global.integration = function (definitions, enableUndo = false) {
    describe('- integration -', function () {
        /**
         * @type {SwuTestContextRef}
         */
        const contextRef = {
            context: null,
            setupTestAsync: async function (options) {
                await this.context.setupTestAsync(options);
            }
        };
        beforeEach(function () {
            process.env.ENVIRONMENT = 'development';

            var gameRouter = jasmine.createSpyObj('gameRouter', ['gameWon', 'playerLeft', 'handleError', 'handleGameEnd']);
            gameRouter.handleError.and.callFake((game, error) => {
                throw error;
            });

            const gameFlowWrapper = new GameFlowWrapper(
                gameStateBuilder.cardDataGetter,
                gameRouter,
                { id: '111', username: 'player1', settings: { optionSettings: { autoSingleTarget: false } } },
                { id: '222', username: 'player2', settings: { optionSettings: { autoSingleTarget: false } } },
                enableUndo ? UndoMode.Full : UndoMode.Disabled
            );

            /** @type {SwuTestContext} */
            const newContext = {};
            this.contextRef = contextRef;
            contextRef.context = newContext;

            contextRef.snapshot = {
                getCurrentSnapshotId: () => gameFlowWrapper.snapshotManager?.currentSnapshotId,
                getCurrentSnapshottedAction: () => gameFlowWrapper.snapshotManager?.currentSnapshottedAction,
                rollbackToSnapshot: (settings) => newContext.game.rollbackToSnapshotInternal(settings),
                quickRollback: (playerId) => {
                    newContext.game.rollbackToSnapshot(playerId, { type: SnapshotType.Quick, playerId });
                    newContext.game.continue();
                },
                countAvailableActionSnapshots: (playerId) => newContext.game.countAvailableActionSnapshots(playerId),
                countAvailableManualSnapshots: (playerId) => newContext.game.countAvailableManualSnapshots(playerId),
                hasAvailableQuickSnapshot: (playerId) => newContext.game.hasAvailableQuickSnapshot(playerId),
                takeManualSnapshot: (playerId) => newContext.game.takeManualSnapshot(playerId),
            };

            gameStateBuilder.attachTestInfoToObj(this, gameFlowWrapper, 'player1', 'player2');
            gameStateBuilder.attachTestInfoToObj(newContext, gameFlowWrapper, 'player1', 'player2');

            /**
             * @param {SwuSetupTestOptions} options
             */
            const setupGameStateWrapperAsync = async (options) => {
                const maxSetupCount = newContext.isUndoTest ? 2 : 1;

                if (newContext.setupCallCount >= maxSetupCount) {
                    throw new TestSetupError(`There have been ${newContext.setupCallCount + 1} calls to setupTestAsync during the course of this test case (expected at most ${maxSetupCount}). This usually indicates that a test case has setupTestAsync both in a beforeEach and in the body of the test case itself.`);
                }

                newContext.setupCallCount++;

                // If this isn't an Undo Test, or this is an Undo Test that has the setup within the undoIt call rather than a beforeEach, run the setup.
                // this is to prevent repeated setup calls when we run the test twice in an Undo test.
                if (!newContext.isUndoTest || this.contextRef.snapshot?.startOfTestSnapshot == null) {
                    await gameStateBuilder.setupGameStateAsync(newContext, options);
                    gameStateBuilder.attachAbbreviatedContextInfo(newContext, contextRef);

                    newContext.hasSetupGame = true;

                    if (newContext.isUndoTest) {
                        contextRef.snapshot.startOfTestSnapshot = buildStartOfTestSnapshot(newContext.game);
                    }
                }
            };

            this.setupTestAsync = newContext.setupTestAsync = setupGameStateWrapperAsync;

            // used only for the "import all cards" test
            contextRef.buildImportAllCardsTools = () => ({
                deckBuilder: new DeckBuilder(gameStateBuilder.cardDataGetter),
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

            if (
                context.game.currentPhase === 'action' && context.ignoreUnresolvedActionPhasePrompts ||
                context.game.currentPhase === 'regroup' && !context.requireResolvedRegroupPhasePrompts ||
                context.game.currentPhase === 'setup' || // Unresolved setup phase prompts are always ignored
                context.game.currentPhase === null
            ) {
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
                throw new TestSetupError(`The test ended with an unresolved prompt in ${context.game.currentPhase} phase for one or both players. Unresolved prompts:\n${activePromptsText}`);
            }
            try {
                context.game.captureGameState('any');
            } catch (error) {
                throw new TestSetupError('Failed to correctly serialize post-test game state', { error: { message: error.message, stack: error.stack } });
            }
        });

        definitions(contextRef);
    });
};

const originalIntegration = global.integration;
global.undoIntegration = function (definitions) {
    originalIntegration(definitions, true);
};

const jit = it;
global.undoIt = function(expectation, assertion, timeout) {
    jit(expectation + ' (with Undo)', async function() {
        /** @type {SwuTestContext} */
        const context = this.contextRef.context;
        const snapshotUtils = this.contextRef.snapshot;
        context.isUndoTest = true;

        // If the game setup was in a beforeEach before this was called, take a snapshot.
        if (context.hasSetupGame) {
            snapshotUtils.startOfTestSnapshot = buildStartOfTestSnapshot(context.game);
        }

        if (snapshotUtils.startOfTestSnapshot?.snapshotId === -1) {
            throw new Error('Snapshot ID invalid');
        }

        const messagesBeforeAssertion = context.game.gameChat.messages.slice();

        await assertion();
        if (snapshotUtils.startOfTestSnapshot?.snapshotId == null) {
            // Snapshot was taken outside of the Action Phase. Not worth testing en-masse, just let the test end assuming no issues on the first run.
            return;
        }
        const rolledBack = context.game.rollbackToSnapshotInternal({
            type: SnapshotType.Manual,
            playerId: snapshotUtils.startOfTestSnapshot.player.id,
            snapshotId: snapshotUtils.startOfTestSnapshot.snapshotId
        });
        if (!rolledBack) {
            // Probably want this to throw an error later, but for now this will let us filter out tests outside the scope vs tests that are actually breaking rollback.
            return;
        }

        context.game.gameChat.messages = messagesBeforeAssertion;

        await assertion();
    }, timeout);
};
global.undoFit = function(expectation, assertion, timeout) {
    fit(expectation + ' (with Undo)', async function() {
        /** @type {SwuTestContext} */
        const context = this.contextRef.context;
        const snapshotUtils = this.contextRef.snapshot;
        context.isUndoTest = true;

        // If the game setup was in a beforeEach before this was called, take a snapshot.
        if (context.hasSetupGame) {
            snapshotUtils.startOfTestSnapshot = buildStartOfTestSnapshot(context.game);
        }

        if (snapshotUtils.startOfTestSnapshot?.snapshotId === -1) {
            throw new Error('Snapshot ID invalid');
        }

        const messagesBeforeAssertion = context.game.gameChat.messages.slice();

        await assertion();
        if (snapshotUtils.startOfTestSnapshot?.snapshotId == null) {
            // Snapshot was taken outside of the Action Phase. Not worth testing en-masse, just let the test end assuming no issues on the first run.
            return;
        }
        const rolledBack = context.game.rollbackToSnapshotInternal({
            type: SnapshotType.Manual,
            playerId: snapshotUtils.startOfTestSnapshot.player.id,
            snapshotId: snapshotUtils.startOfTestSnapshot.snapshotId
        });
        if (!rolledBack) {
            // Probably want this to throw an error later, but for now this will let us filter out tests outside the scope vs tests that are actually breaking rollback.
            return;
        }

        context.game.gameChat.messages = messagesBeforeAssertion;

        await assertion();
    }, timeout);
};

/**
 * A shortcut to repeat a test with a rollback in between, and optionally an alternate case afterwards
 * @param {SwuTestContextRef} contextRef
 * @param {() => void} assertion
 * @param {() => void} altAssertion
 */
global.rollback = function(contextRef, assertion, altAssertion) {
    const { context } = contextRef;

    const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
    expect(snapshotId).not.toBeUndefined('Snapshot ID was null, unable to rollback.');
    expect(snapshotId).not.toBeUndefined('Snapshot ID was undefined, unable to rollback.');
    expect(snapshotId).not.toBe(-1, 'Snapshot ID was -1, unable to rollback.');

    assertion();

    contextRef.snapshot.rollbackToSnapshot({
        type: 'manual',
        playerId: context.player1Object.id,
        snapshotId
    });

    assertion();

    if (altAssertion) {
        contextRef.snapshot.rollbackToSnapshot({
            type: 'manual',
            playerId: context.player1Object.id,
            snapshotId
        });
        altAssertion();
    }
};

if (ENABLE_UNDO_ALL_TESTS) {
    global.integration = global.undoIntegration;
    global.it = global.undoIt;
}