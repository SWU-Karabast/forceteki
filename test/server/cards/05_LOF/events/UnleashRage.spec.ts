describe('Unleash Rage', function() {
    integration(function(contextRef) {
        describe('Unleash Rage\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        hand: ['unleash-rage'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('uses the Force and gives a unit +3/+0', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.unleashRage);
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.getPower()).toBe(6);
            });

            it('has no effect if the player does not have the force', function () {
                const { context } = contextRef;
                context.player1.setHasTheForce(false);

                context.player1.clickCard(context.unleashRage);
                context.player1.clickPrompt('Play anyway');

                expect(context.unleashRage).toBeInZone('discard', context.player1);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});