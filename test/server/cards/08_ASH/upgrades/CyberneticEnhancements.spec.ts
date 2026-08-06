describe('Cybernetic Enhancements', function() {
    integration(function(contextRef) {
        it('Cybernetic Enhancements\'s ability should draw a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['cybernetic-enhancements'],
                    groundArena: ['battlefield-marine'],
                    deck: ['awing', 'atst']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.cyberneticEnhancements);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.hand.length).toBe(1);
            expect(context.awing).toBeInZone('hand', context.player1);
        });
    });
});