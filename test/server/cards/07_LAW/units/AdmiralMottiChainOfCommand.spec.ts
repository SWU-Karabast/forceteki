describe('Admiral Motti, Chain of Command', function () {
    integration(function (contextRef) {
        it('Admiral Motti\'s ability should grant +2/+2 to friendly leader units ', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'han-solo#worth-the-risk', deployed: true },
                    groundArena: ['admiral-motti#chain-of-command', 'mace-windu#party-crasher']
                },
                player2: {
                    groundArena: ['raxian-assembly'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.hanSolo);
            context.player1.clickCard(context.raxianAssembly);

            // han2 should have raid 2 and overwhelm
            expect(context.hanSolo.damage).toBe(6);
            expect(context.raxianAssembly).toBeInZone('discard');

            context.player2.clickCard(context.sabineWren);
            context.player2.clickCard(context.maceWinduPartyCrasher);

            expect(context.sabineWren).toBeInZone('base');
            expect(context.maceWinduPartyCrasher.damage).toBe(2);
        });
    });
});