describe('Broken Horn, Vizago\'s Pride', function () {
    integration(function (contextRef) {
        describe('Broken Horn, Vizago\'s Pride when played ability', function () {
            it('should let the player to draw a card and resource the top card of their deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['broken-horn#vizagos-pride', 'battlefield-marine'],
                        deck: ['green-squadron-awing', 'wampa', 'tieln-fighter'],
                        resources: 10
                    },
                    player2: {
                        hand: ['greedo#slow-on-the-draw', 'atst'],
                        resources: 12,
                    }
                });

                const { context } = contextRef;

                const startingResourcesP1 = context.player1.resources.length;
                const startingHandSize = context.player1.hand.length;

                // Player 1 plays Broken Horn, Vizago's Pride
                expect(context.greenSquadronAwing).toBeInZone('deck');
                context.player1.clickCard(context.brokenHornVizagosPride);

                // Player 1 should draw a card and resource the top card of their deck since they have fewer cards in hand and fewer resources than Player 2
                expect(context.player1.hand.length).toBe(startingHandSize); // As player drawed a card but also played a card
                expect(context.player1.resources.length).toBe(startingResourcesP1 + 1);
                expect(context.greenSquadronAwing).toBeInZone('hand', context.player1);
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});