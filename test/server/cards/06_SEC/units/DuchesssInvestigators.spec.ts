describe('Duchess\'s Investigators', function() {
    integration(function(contextRef) {
        it('Duchess\'s Investigators\'s when played ability should disclose Vigilance to make the opponent discard a random card', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [
                        'duchesss-investigators',
                        'surprise-strike',
                        'restock'
                    ],
                    deck: ['wampa']
                },
                player2: {
                    hand: ['pillage', 'cunning', 'daring-raid']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.duchesssInvestigators);

            expect(context.player1).toHavePrompt('Disclose Cunning to make your opponent discard a random card from their hand');
            expect(context.player1).toBeAbleToSelectExactly([context.surpriseStrike]);
            expect(context.player1).toHaveChooseNothingButton();

            context.player1.clickCard(context.surpriseStrike);

            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.surpriseStrike]);
            context.player2.clickPrompt('Done');

            expect(context.player2.hand.length).toBe(2);
        });
    });
});