describe('Cantina Bouncer', function() {
    integration(function(contextRef) {
        describe('Cantina Bouncer\'s ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cantina-bouncer'],
                        groundArena: ['viper-probe-droid'],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                });
            });

            it('should allow player to return an non-leader unit to its owner\'s hand', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.cantinaBouncer);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.cantinaBouncer, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('hand');
            });
        });
    });
});
