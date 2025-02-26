describe('Executor, Might of the Empire', function () {
    integration(function (contextRef) {
        it('Executor\'s ability should create three Tie Fighter tokens When Played, On Attack, and When Defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['executor#might-of-the-empire'],
                },
                player2: {
                    hand: ['fell-the-dragon'],
                    spaceArena: ['tie-bomber']
                }
            });

            const { context } = contextRef;

            function expectTieFighters(player, count) {
                const tieFighters = player.findCardsByName('tie-fighter');

                expect(tieFighters.length).toBe(count);
                expect(tieFighters).toAllBeInZone('spaceArena', player);
            }

            context.player1.clickCard(context.executor);

            expectTieFighters(context.player1, 3);

            context.moveToNextActionPhase();
            context.player1.clickCard(context.executor);
            context.player1.clickCard(context.tieBomber);

            expectTieFighters(context.player1, 6);

            context.player2.clickCard(context.fellTheDragon);
            context.player2.clickCard(context.executor);

            expectTieFighters(context.player1, 9);
        });
    });
});
