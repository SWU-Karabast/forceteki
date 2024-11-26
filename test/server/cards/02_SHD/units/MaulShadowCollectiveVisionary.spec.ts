describe('Maul, Shadow Collective Visionary', function() {
    integration(function(contextRef) {
        describe('Maul\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['maul#shadow-collective-visionary', 'cantina-braggart', 'gamorrean-retainer', 'wampa']
                    },
                    player2: {
                        groundArena: ['krayt-dragon']
                    }
                });
            });

            it('can deal all combat damage that would be dealt to this unit during this attack to the chosen friendly underworld unit instead.', function () {
                const { context } = contextRef;

                const reset = (passAction = true) => {
                    context.maulShadowCollectiveVisionary.exhausted = false;
                    context.maulShadowCollectiveVisionary.damage = 0;
                    context.kraytDragon.damage = 0;
                    if (passAction) {
                        context.player2.passAction();
                    }
                };

                // CASE 1: Can deal all combat damage that would be dealt to this unit during this attack to the chosen friendly underworld unit instead.
                context.player1.clickCard(context.maulShadowCollectiveVisionary);
                expect(context.player1).toBeAbleToSelectExactly([context.kraytDragon, context.p2Base]);
                context.player1.clickCard(context.kraytDragon);
                expect(context.player1).toBeAbleToSelectExactly([context.cantinaBraggart, context.gamorreanRetainer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.cantinaBraggart);
                expect(context.cantinaBraggart).toBeInZone('discard');
                expect(context.maulShadowCollectiveVisionary.damage).toBe(0);
                expect(context.kraytDragon.damage).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
