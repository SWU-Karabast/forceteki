describe('Imperial Defector', function() {
    integration(function(contextRef) {
        it('Imperial Defector\'s ability should reveal enemy hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['imperial-defector']
                },
                player2: {
                    hand: ['wampa', 'battlefield-marine', 'pyke-sentinel'],
                    groundArena: ['scout-bike-pursuer']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.imperialDefector);
            expect(context.imperialDefector.zoneName).toBe('groundArena');
            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.wampa, context.battlefieldMarine, context.pykeSentinel]);
            expect(context.getChatLogs(1)[0]).toEqual(
                'player1 uses Imperial Defector to look at the opponent\'s hand and sees Wampa, Battlefield Marine, and Pyke Sentinel',
            );
            context.player1.clickDone();
            expect(context.player2).toBeActivePlayer();
        });

        it('Imperial Defector\'s ability should be playable when enemy hand is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['imperial-defector']
                },
                player2: {
                    groundArena: ['scout-bike-pursuer']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.imperialDefector);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
