describe('Watto, No Money No Parts No Deal', function() {
    integration(function(contextRef) {
        it('Watto\'s ability allows opponent to allow you to give an experience token to a friendly unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['watto#no-money-no-parts-no-deal', 'battlefield-marine'],
                    hand: []
                },
                player2: {
                    groundArena: ['specforce-soldier']
                }
            });

            const { context } = contextRef;

            // Attack with Watto to trigger ability
            context.player1.clickCard(context.watto);
            context.player1.clickCard(context.p2Base);

            // Opponent chooses to give experience token
            expect(context.player2).toHavePrompt('Choose an effect for Watto');
            expect(context.player2).toHaveExactPromptButtons([
                'Your opponent gives an Experience token to a unit they control',
                'Your opponent draws a card'
            ]);
            expect(context.player1).toHavePrompt('Waiting for opponent to choose an effect for Watto');
            expect(context.player2.currentPrompt().promptDescription).toBe('You\'re choosing for your opponent\'s ability.');
            context.player2.clickPrompt('Your opponent gives an Experience token to a unit they control');

            // Player selects unit to receive experience token
            expect(context.player1).toHavePrompt('Give an Experience token to a friendly unit');
            expect(context.player1).toBeAbleToSelectExactly([context.watto, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            // Check that the unit received an experience token
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            expect(context.player1.hand.length).toBe(0); // No card drawn
        });

        it('Watto\'s ability allows opponent to make you draw', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['battlefield-marine', 'wampa'],
                    groundArena: ['watto#no-money-no-parts-no-deal'],
                },
            });

            const { context } = contextRef;

            // Attack with Watto to trigger ability
            context.player1.clickCard(context.watto);
            context.player1.clickCard(context.p2Base);

            // Opponent chooses to draw a card
            expect(context.player2).toHavePrompt('Choose an effect for Watto');
            expect(context.player1).toHavePrompt('Waiting for opponent to choose an effect for Watto');
            context.player2.clickPrompt('Your opponent draws a card');

            // Check that a card was drawn
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('hand');
            expect(context.getChatLogs(3)).toContain('player2 chooses "Your opponent draws a card"');
        });
    });
});