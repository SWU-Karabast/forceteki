describe('Overall game mechanics', function() {
    integration(function(contextRef) {
        describe('Simultaneous lethal damage to both bases', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'sabine-wren#galvanized-revolutionary',
                        base: { card: 'chopper-base', damage: 29 }
                    },
                    player2: {
                        base: { card: 'administrators-tower', damage: 29 }
                    }
                });
            });

            it('should result in the game ending in a draw', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickPrompt('Deal 1 damage to each base');
                expect(context.player1).toHavePrompt('The game ended in a draw!');
                expect(context.player2).toHavePrompt('The game ended in a draw!');

                context.allowTestToEndWithOpenPrompt = true;
            });
        });

        describe('One player\'s base taking lethal damage', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['rebel-pathfinder']
                    },
                    player2: {
                        base: { card: 'administrators-tower', damage: 29 }
                    }
                });
            });

            it('should cause that player to lose the game', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.player1).toHavePrompt('player1 has won the game!');
                expect(context.player2).toHavePrompt('player1 has won the game!');
                expect(context.player1).toBeActivePlayer();

                context.allowTestToEndWithOpenPrompt = true;
            });
        });
    });
});
