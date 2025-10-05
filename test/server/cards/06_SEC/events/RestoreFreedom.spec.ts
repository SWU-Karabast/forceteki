describe('Restore Freedom', function() {
    integration(function(contextRef) {
        it('Restore Freedom\'s ability should play a unit from hand and decrease cost for each heroism aspect among friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['avenger#hunting-the-rebels', 'chewbacca#faithful-first-mate', 'for-a-cause-i-believe-in', 'restore-freedom', 'protector'],
                    discard: ['cassian-andor#rebellions-are-built-on-hope'],
                    groundArena: ['wampa', 'atst', 'battlefield-marine', 'yoda#old-master'],
                    spaceArena: ['green-squadron-awing'],
                    leader: 'wedge-antilles#leader-of-red-squadron',
                },
                player2: {
                    hand: ['specforce-soldier']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.restoreFreedom);
            expect(context.player1).toBeAbleToSelectExactly([context.chewbacca, context.avenger]);
            context.player1.clickCard(context.chewbacca);

            expect(context.player2).toBeActivePlayer();
            expect(context.chewbacca).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(4); // 2 (restore freedom) + 5 (chewbacca) - 3 (restore freedom ability)
        });
    });
});