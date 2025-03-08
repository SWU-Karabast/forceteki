describe('TIE AmbushSquadron', function () {
    integration(function (contextRef) {
        it('should create a TIE Fighter token when played and defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tie-ambush-squadron']
                },
                player2: {
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            function expectTieFighters(player, count) {
                const tieFighters = player.findCardsByName('tie-fighter');

                expect(tieFighters.length).toBe(count);
                expect(tieFighters).toAllBeInZone('spaceArena', player);
                expect(tieFighters.every((tie) => tie.exhausted)).toBeTrue();
            }

            context.player1.clickCard(context.tieAmbushSquadron);
            context.player1.clickPrompt('Create a TIE Fighter token.');
            expectTieFighters(context.player1, 1);
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.tieAmbushSquadron);
            expectTieFighters(context.player1, 2);
        });
    });
});