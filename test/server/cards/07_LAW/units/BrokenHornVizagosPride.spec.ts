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

            it('should deal three damage as there\'s no cards in deck and should not resource', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['broken-horn#vizagos-pride', 'battlefield-marine'],
                        deck: [],
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
                context.player1.clickCard(context.brokenHornVizagosPride);

                // Player 1 should draw a card and resource the top card of their deck since they have fewer cards in hand and fewer resources than Player 2
                expect(context.player1.hand.length).toBe(startingHandSize - 1);
                expect(context.player1.resources.length).toBe(startingResourcesP1); // Player should not resource as there are no cards in deck to resource
                expect(context.p1Base.damage).toBe(3); // Player should take 3 damage as there are no cards in deck to resource
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to draw a card but should not resource as there\'s only one card in deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['broken-horn#vizagos-pride', 'battlefield-marine'],
                        deck: ['green-squadron-awing'],
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
                context.player1.clickCard(context.brokenHornVizagosPride);

                // Player 1 should draw a card and resource the top card of their deck since they have fewer cards in hand and fewer resources than Player 2
                expect(context.player1.hand.length).toBe(startingHandSize);
                expect(context.player1.resources.length).toBe(startingResourcesP1); // Player should not resource as there are no cards in deck to resource
                expect(context.player2).toBeActivePlayer();
            });

            it('should not draw a card but should resource the top card of their deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['broken-horn#vizagos-pride', 'battlefield-marine', 'vanquish'],
                        deck: ['green-squadron-awing'],
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
                context.player1.clickCard(context.brokenHornVizagosPride);

                // Player 1 should not draw a card but should resource the top card of their deck
                expect(context.player1.hand.length).toBe(startingHandSize - 1);
                expect(context.player1.resources.length).toBe(startingResourcesP1 + 1);
                expect(context.greenSquadronAwing).toBeInZone('resource', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card but should not resource the top card of their deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['broken-horn#vizagos-pride', 'battlefield-marine'],
                        deck: ['green-squadron-awing', 'vanquish'],
                        resources: 10
                    },
                    player2: {
                        hand: ['greedo#slow-on-the-draw', 'atst'],
                        resources: 10,
                    }
                });

                const { context } = contextRef;

                const startingResourcesP1 = context.player1.resources.length;
                const startingHandSize = context.player1.hand.length;

                // Player 1 plays Broken Horn, Vizago's Pride
                context.player1.clickCard(context.brokenHornVizagosPride);

                // Player 1 should draw a card but should not resource the top card of their deck
                expect(context.player1.hand.length).toBe(startingHandSize);
                expect(context.player1.resources.length).toBe(startingResourcesP1);
                expect(context.greenSquadronAwing).toBeInZone('hand', context.player1);
                expect(context.vanquish).toBeInZone('deck', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});