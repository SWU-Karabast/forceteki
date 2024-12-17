describe('Coruscant Guard', function() {
    integration(function(contextRef) {
        it('Coruscant Guard\'s constant Coordinate ability should grant Ambush', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['wing-leader'],
                    hand: ['coruscant-guard']
                },
                player2: {
                    groundArena: ['hylobon-enforcer']
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;

            context.player1.clickCard(context.coruscantGuard);
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Ambush');
            expect(context.coruscantGuard.damage).toBe(1);
            expect(context.hylobonEnforcer.damage).toBe(3);
        });

        it('Coruscant Guard\'s constant Coordinate ability should do nothing if the Coordinate condition is not met', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    spaceArena: ['wing-leader'],
                    hand: ['coruscant-guard']
                },
                player2: {
                    groundArena: ['hylobon-enforcer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.coruscantGuard);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
