describe('Talzin\'s Assassin', function() {
    integration(function(contextRef) {
        describe('Talzin\'s Assassin\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['talzins-assassin'],
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should allow using the force to give a unit -3/-3 for the phase when played', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.talzinsAssassin);

                expect(context.player1).toHavePassAbilityPrompt('Use the Force');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.talzinsAssassin]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.getPower()).toBe(1);
                expect(context.wampa.getHp()).toBe(2);
            });

            it('should not allow using the force if player has not', function() {
                const { context } = contextRef;

                context.player1.setHasTheForce(false);
                context.player1.clickCard(context.talzinsAssassin);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});