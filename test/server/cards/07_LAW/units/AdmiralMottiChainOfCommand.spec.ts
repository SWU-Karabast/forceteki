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

            expect(context.sabineWren.getPower()).toBe(2);
            expect(context.sabineWren.getHp()).toBe(5);
            expect(context.hanSolo.getPower()).toBe(5);
            expect(context.hanSolo.getHp()).toBe(8);
            expect(context.admiralMotti.getPower()).toBe(4);
            expect(context.admiralMotti.getHp()).toBe(5);
            expect(context.maceWindu.getPower()).toBe(5);
            expect(context.maceWindu.getHp()).toBe(7);
            expect(context.raxianAssembly.getPower()).toBe(6);
            expect(context.raxianAssembly.getHp()).toBe(5);
        });

        it('Admiral Motti\'s ability should grant +2/+2 to friendly leader pilot units that have lost abilities', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'darth-vader#victor-squadron-leader',
                    groundArena: ['admiral-motti#chain-of-command', 'mace-windu#party-crasher'],
                    spaceArena: ['lurking-tie-phantom']
                },
                player2: {
                    hand: ['force-lightning'],
                    groundArena: ['raxian-assembly'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.darthVader);
            context.player1.clickPrompt('Deploy Darth Vader as a Pilot');
            context.player1.clickCard(context.lurkingTiePhantom);

            expect(context.lurkingTiePhantom.getPower()).toBe(9);
            expect(context.lurkingTiePhantom.getHp()).toBe(9);

            context.player2.clickCard(context.forceLightning);
            context.player2.clickCard(context.lurkingTiePhantom);

            expect(context.lurkingTiePhantom.getPower()).toBe(9);
            expect(context.lurkingTiePhantom.getHp()).toBe(9);

            expect(context.sabineWren.getPower()).toBe(2);
            expect(context.sabineWren.getHp()).toBe(5);
        });
    });
});