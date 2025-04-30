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
            context.player2.clickPrompt(`${context.player1.name} give an Experience token to a friendly unit`);

            // Player selects unit to receive experience token
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
                    hand: []
                },
            });

            const { context } = contextRef;

            // Attack with Watto to trigger ability
            context.player1.clickCard(context.watto);
            context.player1.clickCard(context.p2Base);

            // Opponent chooses to draw a card
            context.player2.clickPrompt(`${context.player1.name} draw a card`);

            // Check that a card was drawn
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('hand');
        });
    });
});