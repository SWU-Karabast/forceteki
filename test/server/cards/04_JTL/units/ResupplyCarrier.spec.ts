describe('Resupply Carrier', function() {
    integration(function(contextRef) {
        it('Resupply Carrier\'s ability should add the top deck card as a resource', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resupply-carrier']
                }
            });

            const { context } = contextRef;

            const startingResources = context.player1.resources.length;
            const startingDeckSize = context.player1.deck.length;

            context.player1.clickCard(context.resupplyCarrier);

            expect(context.player1).toHavePassAbilityPrompt('Put the top card of your deck into play as a resource');

            context.player1.clickPrompt('Trigger');

            expect(context.player1.resources.length).toBe(startingResources + 1);
            expect(context.player1.deck.length).toBe(startingDeckSize - 1);
            expect(context.player2).toBeActivePlayer();
            expect(context.getChatLogs(1)).toContain('player1 uses Resupply Carrier to move a card to their resources');
        });
    });
});