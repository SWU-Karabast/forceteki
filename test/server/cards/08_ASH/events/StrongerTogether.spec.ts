describe('Stronger Together', function () {
    integration(function (contextRef) {
        it('Stronger Together\'s ability should create two Mandalorian tokens for the controller', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['stronger-together'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.strongerTogether);
            context.player1.clickPrompt('Resolve all (2)');

            expect(context.player2).toBeActivePlayer();

            const mandalorians = context.player1.findCardsByName('mandalorian');

            expect(mandalorians.length).toBe(2);
            expect(mandalorians).toAllBeInZone('groundArena');
            expect(mandalorians.every((m) => m.exhausted)).toBeTrue();

            expect(context.player2.getArenaCards().length).toBe(0);
            expect(context.getChatLog(2)).toEqual('player1 plays Stronger Together to create 2 Mandalorian tokens');
        });
    });
});
