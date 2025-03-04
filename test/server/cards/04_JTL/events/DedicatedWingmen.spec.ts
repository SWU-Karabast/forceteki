describe('Dedicated Wingmen', function () {
    integration(function (contextRef) {
        it('Dedicated Wingmen\'s ability should create two X-Wing tokens for the controller', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dedicated-wingmen'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dedicatedWingmen);

            const xwings = context.player1.findCardsByName('xwing');
            expect(xwings.length).toBe(2);
            expect(xwings).toAllBeInZone('spaceArena');
            expect(xwings.every((token) => token.exhausted)).toBeTrue();
            expect(context.player2.getArenaCards().length).toBe(0);
        });
    });
});
