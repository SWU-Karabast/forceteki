describe('Padawan Star Fighter', function () {
    integration(function (contextRef) {
        describe('Padawan Star Fighter\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['padawan-starfighter'],
                        groundArena: ['duchesss-champion'],
                        hand: ['obiwan-kenobi#following-fate', 'jedi-lightsaber']
                    },
                    player2: {
                        groundArena: ['luke-skywalker#jedi-knight'],
                        spaceArena: ['mining-guild-tie-fighter']
                    }
                });
            });

            it('should have +1/+1 because a unit with Force trait is controlled by player', function () {
                const { context } = contextRef;

                // Player 2 Luke should not impact Padawan Star Fighter
                expect(context.padawanStarfighter.getHp()).toBe(3);
                expect(context.padawanStarfighter.getPower()).toBe(1);

                // Player 1 plays Obi-Wan Kenobi
                context.player1.clickCard(context.obiwanKenobi);

                // Padawan Star Fighter should have +1/+1
                expect(context.padawanStarfighter.getHp()).toBe(4);
                expect(context.padawanStarfighter.getPower()).toBe(2);
            });

            // TODO: Add test for an upgrade with Force trait when one will exist
        });
    });
});
