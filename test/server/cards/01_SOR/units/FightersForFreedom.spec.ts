describe('Fighters for Freedom', function() {
    integration(function(contextRef) {
        describe('Fighters for Freedom\'s ability', function() {
            it('should allow dealing 1 damage to a base when playing an aggression card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa', 'wilderness-fighter'],
                        groundArena: ['fighters-for-freedom']
                    },
                    player2: {
                        hand: ['death-star-stormtrooper'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);

                // Player1 playing aggression card triggers ability
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);

                // Player2 playing aggression does not trigger ability
                context.player2.clickCard(context.deathStarStormtrooper);
                expect(context.player1).toBeActivePlayer();

                // Player1 playing vigilance does not trigger ability
                context.player1.clickCard(context.wildernessFighter);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
