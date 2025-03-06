describe('They Hate That Ship', function () {
    integration(function (contextRef) {
        it('They Hate That Ship\'s should create 2 ready TIE Fighter for opponent and should play a vehicle unit from our hand, it costs 3 resources less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['they-hate-that-ship', 'strafing-gunship', 'green-squadron-awing', 'battlefield-marine'],
                    leader: 'sabine-wren#galvanized-revolutionary',
                    base: 'mos-eisley'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theyHateThatShip);

            const tieFighters = context.player2.findCardsByName('tie-fighter');
            expect(tieFighters.length).toBe(2);
            expect(tieFighters).toAllBeInZone('spaceArena', context.player2);
            expect(tieFighters.every((tie) => tie.exhausted)).toBeFalse();

            expect(context.player1).toBeAbleToSelectExactly([context.strafingGunship, context.greenSquadronAwing]);
            context.player1.clickCard(context.strafingGunship);

            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
