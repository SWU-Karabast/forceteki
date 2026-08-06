import GameFlowWrapper from '../../helpers/GameFlowWrapper';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';

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
