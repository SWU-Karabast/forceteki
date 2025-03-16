describe('Dilapidated Ski Speeder', function () {
    integration(function (contextRef) {
        it('Dilapidated Ski Speeder\'s ability should deal himself 3 damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dilapidated-ski-speeder'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dilapidatedSkiSpeeder);
            expect(context.player2).toBeActivePlayer();
            expect(context.dilapidatedSkiSpeeder.damage).toBe(3);
        });
    });
});
