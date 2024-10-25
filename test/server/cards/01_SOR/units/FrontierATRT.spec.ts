describe('Frontier AT-RT', function() {
    integration(function(contextRef) {
        describe('Frontier AT-RT\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['frontier-atrt'],
                        spaceArena: ['patrolling-vwing'],
                    },
                    player2: {
                        groundArena: ['grogu#irresistible'],
                    }
                });
            });

            it('should have Ambush while controlling a Vehicle unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.frontierAtrt);
                expect(context.player1).toHaveExactPromptButtons(['Ambush', 'Pass']);

                // ambush grogu
                context.player1.clickPrompt('Ambush');
                expect(context.frontierAtrt.exhausted).toBeTrue();
                expect(context.frontierAtrt.damage).toBe(0);
                expect(context.grogu.damage).toBe(3);
            });
        });

        describe('Frontier AT-RT\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['frontier-atrt'],
                    },
                    player2: {
                        groundArena: ['grogu#irresistible'],
                    }
                });
            });

            it('should not have Ambush while we are not controlling a Command unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.frontierAtrt);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
