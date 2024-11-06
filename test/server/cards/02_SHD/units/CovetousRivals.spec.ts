describe('Covetous Rivals', function() {
    integration(function(contextRef) {
        describe('Covetous Rivals\'s ability', function() {
            it('should deal 2 damage to a unit with a Bounty', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['covetous-rivals'],
                        groundArena: ['fugitive-wookiee', 'battlefield-marine', { card: 'atst', upgrades: ['wanted'] }]
                    },
                    player2: {
                        groundArena: ['wampa', 'hylobon-enforcer'],
                        spaceArena: ['cartel-turncoat']
                    }
                });

                const { context } = contextRef;

                // CASE 1: play from hand
                context.player1.clickCard(context.covetousRivals);
                expect(context.player1).toBeAbleToSelectExactly([context.fugitiveWookiee, context.hylobonEnforcer, context.cartelTurncoat, context.atst]);

                context.player1.clickCard(context.cartelTurncoat);
                expect(context.cartelTurncoat.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();
                context.covetousRivals.exhausted = false;

                // CASE 2: attack
                context.player1.clickCard(context.covetousRivals);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.fugitiveWookiee, context.hylobonEnforcer, context.cartelTurncoat, context.atst]);

                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
