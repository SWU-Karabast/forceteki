describe('Vernestra Rwoh, We Should Handle This Ourselves', function() {
    integration(function(contextRef) {
        describe('her additional play cost', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vernestra-rwoh#we-should-handle-this-ourselves'],
                        discard: ['favorable-delegate'],
                        deck: ['wampa'],
                        resources: 20
                    },
                    player2: {}
                });
            });

            it('puts a chosen unit on the bottom of the deck and gains its When Played ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.vernestraRwoh);

                // additional cost: choose up to 2 units (cost <= 5) from discard to put on the bottom of the deck
                context.player1.clickCard(context.favorableDelegate);
                context.player1.clickPrompt('Done');

                // the play message renders the cost verb ("moving", not "move")
                expect(context.getChatLogs(3)).toContain('player1 plays Vernestra Rwoh, moving a card to the bottom of their deck');

                // the cost was paid: the chosen unit is now in the deck (bottom)
                expect(context.favorableDelegate).toBeInZone('deck');
                expect(context.vernestraRwoh).toBeInZone('groundArena');

                // Vernestra gained Favorable Delegate's "When Played: Draw a card" ability, which drew from the top
                expect(context.wampa).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
