describe('Grenade Strike', function() {
    integration(function(contextRef) {
        describe('Grenade Strike\'s ability -', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['grenade-strike'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['death-trooper', 'atst'],
                        spaceArena: ['corellian-freighter']
                    }
                });
            });

            it('should deal 2 damage to a unit and 1 damage to another unit in the same arena', function() {
                const { context } = contextRef;

                function reset() {
                    context.setDamage(context.wampa, 0);
                    context.setDamage(context.atst, 0);
                    context.setDamage(context.deathTrooper, 0);
                    context.setDamage(context.corellianFreighter, 0);
                    context.player1.moveCard(context.grenadeStrike, 'hand');
                    context.player2.passAction();
                }

                context.player1.clickCard(context.grenadeStrike);

                // can deal damage to each enemy units
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.deathTrooper, context.atst, context.corellianFreighter]);
                expect(context.player1).not.toHaveChooseNoTargetButton();

                context.player1.clickCard(context.deathTrooper);

                // damage a ground unit, only other ground units selectable
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                expect(context.player1).toHaveChooseNoTargetButton();

                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.deathTrooper.damage).toBe(2);
                expect(context.atst.damage).toBe(1);

                reset();

                context.player1.clickCard(context.grenadeStrike);
                context.player1.clickCard(context.corellianFreighter);

                // damage a space unit, no more unit to damage
                expect(context.player2).toBeActivePlayer();
                expect(context.corellianFreighter.damage).toBe(2);

                reset();

                context.player1.clickCard(context.grenadeStrike);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.wampa);

                // can damage unit not with same controller
                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(2);
                expect(context.wampa.damage).toBe(1);
            });
        });
    });
});
