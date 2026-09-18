describe('Chewbacca\'s Bowcaster, Handcrafted Tradition', function() {
    integration(function(contextRef) {
        it('Chewbacca\'s Bowcaster\'s ability should resource the top card of deck if played on Chewbacca (leader)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['porg'],
                    hand: ['chewbaccas-bowcaster#handcrafted-tradition'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: 'true' }
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.chewbaccasBowcaster);
            context.player1.clickCard(context.chewbacca);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('resource', context.player1);
        });

        it('Chewbacca\'s Bowcaster\'s ability should resource the top card of deck if played on Chewbacca (unit)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['porg'],
                    hand: ['chewbaccas-bowcaster#handcrafted-tradition'],
                    groundArena: ['chewbacca#faithful-first-mate']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.chewbaccasBowcaster);
            context.player1.clickCard(context.chewbacca);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('resource', context.player1);
        });

        it('Chewbacca\'s Bowcaster\'s ability should not resource the top card of deck if not played on Chewbacca', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['porg'],
                    hand: ['chewbaccas-bowcaster#handcrafted-tradition'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['mynock', 'awing']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.chewbaccasBowcaster);
            expect(context.player1).toBeAbleToSelectExactly([context.mynock, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('deck', context.player1);
        });
    });
});
