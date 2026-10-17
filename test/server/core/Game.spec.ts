import GameFlowWrapper from '../../helpers/GameFlowWrapper';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { GameErrorSeverity } from '../../../server/game/core/Constants';

describe('Overall game mechanics', function() {
    describe('game startup state', function() {
        it('should not serialize player state before game initialization has completed', function() {
            const gameFlowWrapper = new GameFlowWrapper(
                new UnitTestCardDataGetter('test/json'),
                jasmine.createSpyObj('router', ['handleError', 'handleSerializationFailure']),
                { id: 'player1', username: 'player1' },
                { id: 'player2', username: 'player2' }
            );

            expect(gameFlowWrapper.game.started).toBeFalse();
            expect(gameFlowWrapper.game.getState('player1')).toEqual({});
        });
    });

    describe('"name a card" title lists', function() {
        function buildGame(legalCardTitles?: ReadonlySet<string>) {
            return new GameFlowWrapper(
                new UnitTestCardDataGetter('test/json'),
                jasmine.createSpyObj('router', ['handleError', 'handleSerializationFailure']),
                { id: 'player1', username: 'player1' },
                { id: 'player2', username: 'player2' },
                undefined,
                legalCardTitles
            ).game;
        }

        it('should offer every title when no legal titles are given', function() {
            const cardDataGetter = new UnitTestCardDataGetter('test/json');
            const game = buildGame();

            expect(game.playableCardTitles).toEqual(cardDataGetter.playableCardTitles);
            expect(game.allNonLeaderCardTitles).toEqual(cardDataGetter.allNonLeaderCardTitles);
        });

        it('should offer only the legal titles, in their original order', function() {
            // 'Echo Base' is a base: only in the all-non-leader list, never in the playable one
            const game = buildGame(new Set(['Wampa', 'Echo Base', 'Battlefield Marine']));

            expect(game.playableCardTitles).toEqual(['Battlefield Marine', 'Wampa']);
            expect(game.allNonLeaderCardTitles).toEqual(['Battlefield Marine', 'Echo Base', 'Wampa']);
        });
    });

    describe('error history for bug reports', function() {
        function buildGame() {
            const router = jasmine.createSpyObj('router', ['handleError', 'handleSerializationFailure']);
            const game = new GameFlowWrapper(
                new UnitTestCardDataGetter('test/json'),
                router,
                { id: 'player1', username: 'player1' },
                { id: 'player2', username: 'player2' }
            ).game;
            return { game, router };
        }

        it('should start empty', function() {
            const { game } = buildGame();

            expect(game.getErrorHistory()).toEqual({ totalCount: 0, errors: [] });
        });

        it('should record reported errors with their severity and still pass them to the router', function() {
            const { game, router } = buildGame();
            const error = new Error('something broke');

            game.reportError(error, GameErrorSeverity.SevereGameMessageOnly);

            expect(router.handleError).toHaveBeenCalledWith(game, error, GameErrorSeverity.SevereGameMessageOnly);
            const history = game.getErrorHistory();
            expect(history.totalCount).toBe(1);
            expect(history.errors.length).toBe(1);
            expect(history.errors[0].message).toBe('something broke');
            expect(history.errors[0].severity).toBe(GameErrorSeverity.SevereGameMessageOnly);
            expect(history.errors[0].stack).toBe(error.stack);
            expect(Date.parse(history.errors[0].timestamp)).not.toBeNaN();
        });

        it('should record the same error object only once', function() {
            const { game } = buildGame();
            const error = new Error('reported, then rethrown');

            game.reportError(error, GameErrorSeverity.SevereHaltGame);
            game.recordError(error);

            expect(game.getErrorHistory().totalCount).toBe(1);
        });

        it('should record thrown values that are not Error objects', function() {
            const { game } = buildGame();

            game.recordError('plain string' as unknown as Error);

            expect(game.getErrorHistory().errors[0].message).toBe('plain string');
        });

        it('should keep only the most recent errors but count all of them', function() {
            const { game } = buildGame();

            for (let i = 0; i < 25; i++) {
                game.recordError(new Error(`error ${i}`));
            }

            const history = game.getErrorHistory();
            expect(history.totalCount).toBe(25);
            expect(history.errors.length).toBe(20);
            expect(history.errors[0].message).toBe('error 5');
            expect(history.errors[19].message).toBe('error 24');
        });

        it('should return a copy that later errors do not change', function() {
            const { game } = buildGame();
            game.recordError(new Error('first'));

            const history = game.getErrorHistory();
            game.recordError(new Error('second'));

            expect(history.errors.length).toBe(1);
        });
    });

    integration(function(contextRef) {
        describe('Game initialization', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'setup'
                });
            });

            it('should mark the game as started after initialization has completed', function () {
                const { context } = contextRef;

                expect(context.game.started).toBeTrue();
            });
        });

        describe('Simultaneous lethal damage to both bases', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sabine-wren#galvanized-revolutionary',
                        base: { card: 'chopper-base', damage: 29 }
                    },
                    player2: {
                        base: { card: 'administrators-tower', damage: 29 }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should result in the game ending in a draw', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickPrompt('Deal 1 damage to each base');
                expect(context.player1).toHavePrompt('The game ended in a draw!');
                expect(context.player2).toHavePrompt('The game ended in a draw!');

                context.ignoreUnresolvedActionPhasePrompts = true;
            });
        });

        describe('One player\'s base taking lethal damage', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rebel-pathfinder']
                    },
                    player2: {
                        base: { card: 'administrators-tower', damage: 29 }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should cause that player to lose the game', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.player1).toHavePrompt('player1 has won the game!');
                expect(context.player2).toHavePrompt('player1 has won the game!');
                expect(context.player1).toBeActivePlayer();

                context.ignoreUnresolvedActionPhasePrompts = true;
            });
        });
    });
});
