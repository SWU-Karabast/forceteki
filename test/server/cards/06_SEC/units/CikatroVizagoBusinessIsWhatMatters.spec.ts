describe('Cikatro Vizago, Business is What Matters', function() {
    integration(function(contextRef) {
        describe('Cikatro\'s On Attack ability', function() {
            it('reveals a card from the top of the deck. Opponent pays 1 resource to prevent player from drawing it.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['cikatro-vizago#business-is-what-matters'],
                        deck: ['cantina-bouncer', 'awing', 'tie-bomber']
                    }
                });

                const { context } = contextRef;
                const initialHandSize = context.player1.hand.length;

                // P1 attacks the base with Cikatro
                context.player1.clickCard(context.cikatroVizago);
                context.player1.clickCard(context.p2Base);

                // Top card (cantina-bouncer) should be revealed in display prompt
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.cantinaBouncer]);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickDone();

                // Opponent should be prompted to choose
                expect(context.player2).toHaveEnabledPromptButtons(['Pay 1 resource', 'Opponent draws Cantina Bouncer']);
                context.player2.clickPrompt('Pay 1 resource');

                // Verify opponent paid 1 resource and we didn't draw the card
                expect(context.player2.exhaustedResourceCount).toBe(1);
                expect(context.player1.hand.length).toBe(initialHandSize);
                expect(context.cantinaBouncer).toBeInZone('deck', context.player1); // Card remains on top of deck
            });

            it('reveals a card from the top of the deck. Opponent chooses to let us draw it.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['cikatro-vizago#business-is-what-matters'],
                        deck: ['cantina-bouncer', 'awing', 'tie-bomber']
                    }
                });

                const { context } = contextRef;
                const initialHandSize = context.player1.hand.length;

                // P1 attacks the base with Cikatro
                context.player1.clickCard(context.cikatroVizago);
                context.player1.clickCard(context.p2Base);

                // Top card (cantina-bouncer) should be revealed in display prompt
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.cantinaBouncer]);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickDone();

                // Opponent chooses to let us draw
                expect(context.player2).toHaveEnabledPromptButtons(['Pay 1 resource', 'Opponent draws Cantina Bouncer']);
                context.player2.clickPrompt('Opponent draws Cantina Bouncer');

                // Verify we drew the card and opponent didn't pay resources
                expect(context.player2.exhaustedResourceCount).toBe(0);
                expect(context.player1.hand.length).toBe(initialHandSize + 1);
                expect(context.cantinaBouncer).toBeInZone('hand', context.player1);
            });

            it('ability is automatically skipped if the player has no cards in deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['cikatro-vizago#business-is-what-matters'],
                        deck: [] // Empty deck
                    }
                });

                const { context } = contextRef;
                const initialHandSize = context.player1.hand.length;

                // P1 attacks the base with Cikatro
                context.player1.clickCard(context.cikatroVizago);
                context.player1.clickCard(context.p2Base);

                // Combat should resolve without any prompts since deck is empty
                expect(context.player1.hand.length).toBe(initialHandSize); // No cards drawn
                expect(context.player2.exhaustedResourceCount).toBe(0); // No resources paid
                expect(context.player2).toBeActivePlayer(); // Combat ended, P2's turn
            });

            it('card is automatically drawn without prompt if opponent has no ready resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['cikatro-vizago#business-is-what-matters'],
                        deck: ['cantina-bouncer', 'awing', 'tie-bomber']
                    },
                    player2: {
                        resources: {
                            exhaustedCount: 6,
                            readyCount: 0
                        }
                    }
                });

                const { context } = contextRef;
                const initialHandSize = context.player1.hand.length;

                // P1 attacks the base with Cikatro
                context.player1.clickCard(context.cikatroVizago);
                context.player1.clickCard(context.p2Base);

                // Top card (cantina-bouncer) should be revealed in display prompt
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.cantinaBouncer]);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickDone();

                // Since opponent has no resources, card should be automatically drawn
                expect(context.player1.hand.length).toBe(initialHandSize + 1);
                expect(context.cantinaBouncer).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer(); // Combat ended, P2's turn
            });
        });
    });
});