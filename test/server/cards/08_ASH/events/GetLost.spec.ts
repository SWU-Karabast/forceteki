describe('Get Lost', function() {
    integration(function(contextRef) {
        it('Get Lost\'s ability should defeat an enemy upgraded non-leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['get-lost'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'awing', upgrades: ['shield'] }]
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.getLost);
            expect(context.player1).toHavePrompt('Defeat an upgraded non-leader unit');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.awing]);

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toBeInZone('discard', context.player2);
            expect(context.pointlessToResist).toBeInZone('discard', context.player2);
        });
    });
});