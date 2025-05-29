describe('Air Superiority', function () {
    integration(function (contextRef) {
        it('Air Superiority\'s ability should not deal any damage if we do not have more space units than opponents', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['air-superiority'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['imperial-interceptor'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.airSuperiority);
            context.player1.clickPrompt('Play anyway');
            expect(context.airSuperiority).toBeInZone('discard', context.player1);
            expect(context.player2).toBeActivePlayer();
        });

        it('Air Superiority\'s ability should deal 4 damage to a ground unit if we control more space units than opponents', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['air-superiority'],
                    spaceArena: ['imperial-interceptor', 'green-squadron-awing'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['inferno-four#unforgetting']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.airSuperiority);

            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
