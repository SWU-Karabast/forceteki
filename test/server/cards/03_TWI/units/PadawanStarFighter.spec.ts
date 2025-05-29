describe('Padawan Star Fighter', function () {
    integration(function (contextRef) {
        describe('Padawan Star Fighter\'s ability', function () {
            it('should have +1/+1 because a unit with Force trait is controlled by player', async function () {
                await contextRef.setupTestAsync({
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

            it('should have +1/+1 when controlling a Force upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'padawan-starfighter', upgrades: ['luke-skywalker#you-still-with-me'] }]
                    }
                });

                const { context } = contextRef;

                // Padawan Star Fighter should have +1/+1 (in addition to +3/+2 from Luke)
                expect(context.padawanStarfighter.getPower()).toBe(5);
                expect(context.padawanStarfighter.getHp()).toBe(6);
            });
        });
    });
});
