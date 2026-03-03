describe('Bardottan Ornithopter', function() {
    integration(function(contextRef) {
        it('Bardottan Ornithopter\'s when played ability should disclose Vigilance to draw a card', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [
                        'bardottan-ornithopter',
                        'duchesss-champion', // has Vigilance
                        'restock'            // neutral (no aspects)
                    ],
                    deck: ['wampa']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bardottanOrnithopter);

            // Prompt to disclose Vigilance to draw a card
            expect(context.player1).toHavePrompt('Disclose Vigilance to draw a card');
            expect(context.player1).toBeAbleToSelectExactly([context.duchesssChampion]);
            // "Choose nothing" is allowed (we won't use it in this test)
            expect(context.player1).toHaveChooseNothingButton();

            // Select the Vigilance card
            context.player1.clickCard(context.duchesssChampion);

            // Opponent sees the revealed card
            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.duchesssChampion]);
            context.player2.clickDone();

            // Draw 1 card occurred
            expect(context.player1.hand.length).toBe(3);
            expect(context.wampa).toBeInZone('hand', context.player1);
        });
    });
});