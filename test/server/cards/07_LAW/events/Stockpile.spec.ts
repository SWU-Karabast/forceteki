describe('Stockpile', function() {
    integration(function(contextRef) {
        describe('Stockpile\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['stockpile'],
                        deck: ['resupply'],
                        leader: 'leia-organa#alliance-general'
                    }
                });
            });

            it('should put Stockpile into play as a resource', function () {
                const { context } = contextRef;

                const startingResources = context.player1.readyResourceCount;

                context.player1.clickCard(context.stockpile);

                expect(context.stockpile).toBeInZone('resource');
                expect(context.stockpile.exhausted).toBe(true);
                expect(context.resupply).toBeInZone('resource');
                expect(context.resupply.exhausted).toBe(true);
                expect(context.player1.resources.length).toBe(startingResources + 2);
                expect(context.player1.readyResourceCount).toBe(startingResources - 6);
                expect(context.player1.exhaustedResourceCount).toBe(8);
                expect(context.getChatLogs(1)).toContain('player1 plays Stockpile to move Stockpile to their resources and to move a card to their resources');

                expect(context.player2).toBeActivePlayer();
            });
        });


        it('should still resource stockpile even if there are no cards in the deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['stockpile'],
                    deck: [],
                    leader: 'leia-organa#alliance-general'
                }
            });

            const { context } = contextRef;

            const startingResources = context.player1.readyResourceCount;

            context.player1.clickCard(context.stockpile);

            expect(context.stockpile).toBeInZone('resource');
            expect(context.stockpile.exhausted).toBe(true);
            expect(context.player1.resources.length).toBe(startingResources + 1);
            expect(context.player1.readyResourceCount).toBe(startingResources - 6);
            expect(context.player1.exhaustedResourceCount).toBe(7);
            expect(context.getChatLogs(1)).toContain('player1 plays Stockpile to move Stockpile to their resources');

            expect(context.player2).toBeActivePlayer();
        });
    });
});