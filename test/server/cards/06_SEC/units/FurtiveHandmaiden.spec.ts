describe('Furtive Handmaiden', function() {
    integration(function(contextRef) {
        it('Furtive Handmaiden\'s ability should allow discarding a card to draw a card when attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['furtive-handmaiden'],
                    hand: ['wampa', 'takedown'],
                    deck: ['atst']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                },
            });

            const { context } = contextRef;

            // Attack with Furtive Handmaiden
            context.player1.clickCard(context.furtiveHandmaiden);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Discard a card from your hand. If you do, draw a card.');
            context.player1.clickPrompt('Trigger');

            // Discard a card
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.takedown]);
            context.player1.clickCard(context.wampa);

            // Verify the card was discarded and a new one drawn
            expect(context.wampa).toBeInZone('discard');
            expect(context.atst).toBeInZone('hand');
            expect(context.player1.handSize).toBe(2);
        });
    });
});