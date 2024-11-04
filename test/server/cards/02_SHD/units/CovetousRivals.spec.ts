describe('Covetous Rivals', function() {
    integration(function(contextRef) {
        describe('Covetous Rivals\'s ability', function() {
            it('should deal 2 damage to a unit with a Bounty', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['covetous-rivals'],
                        groundArena: ['fugitive-wookiee', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa', 'hylobon-enforcer'],
                        spaceArena: ['cartel-turncoat']
                    }
                });

                const { context } = contextRef;

                // CASE 1: play from hand
                context.player1.clickCard(context.covetousRivals);
                expect(context.player1).toBeAbleToSelectExactly([context.fugitiveWookiee, context.hylobonEnforcer, context.cartelTurncoat]);

                context.player1.clickCard(context.cartelTurncoat);
                expect(context.cartelTurncoat.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();
                context.covetousRivals.exhausted = false;

                // CASE 2: attack
                context.player1.clickCard(context.covetousRivals);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.fugitiveWookiee, context.hylobonEnforcer, context.cartelTurncoat]);

                context.player1.clickCard(context.fugitiveWookiee);
                expect(context.fugitiveWookiee.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();

                // TODO: when "gain Bounty" is working, add a test here
            });
        });
    });
});
