describe('Naboo Royal Starship, Fit For A Queen', function () {
    integration(function (contextRef) {
        it('Naboo Royal Starship\'s ability should grant Raid 2 and Overwhelm to friendly leader units ', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'han-solo#worth-the-risk', deployed: true },
                    spaceArena: ['naboo-royal-starship#fit-for-a-queen']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.hanSolo);
            context.player1.clickCard(context.battlefieldMarine);

            // han2 should have raid 2 and overwhelm
            expect(context.p2Base.damage).toBe(2);

            context.player2.clickCard(context.sabineWren);
            context.player2.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(3);
        });
    });
});
