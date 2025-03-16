describe('Veteran Fleet Officer', function () {
    integration(function (contextRef) {
        it('Veteran Fleet Officer\'s ability should create a X-Wing token for the controller', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['veteran-fleet-officer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.veteranFleetOfficer);

            const xwings = context.player1.findCardsByName('xwing');
            expect(xwings.length).toBe(1);
            expect(xwings).toAllBeInZone('spaceArena');
            expect(xwings.every((token) => token.exhausted)).toBeTrue();
            expect(context.player2.getArenaCards().length).toBe(0);
        });
    });
});
