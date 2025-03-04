describe('Independent Smuggler', function () {
    integration(function (contextRef) {
        it('Independent Smuggler\'s piloting ability should give Raid 1 to the attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['independent-smuggler'],
                    spaceArena: ['green-squadron-awing']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.independentSmuggler);
            context.player1.clickPrompt('Play Independent Smuggler with Piloting');
            context.player1.clickCard(context.greenSquadronAwing);

            context.player2.passAction();

            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
            // 1 (printed power) + 2 (printed raid 2) + 1 (independent smuggler) + 1 (independent smuggler ability)
        });
    });
});
