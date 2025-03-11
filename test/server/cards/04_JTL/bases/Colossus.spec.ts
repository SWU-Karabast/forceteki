describe('Colossus', function() {
    integration(function(contextRef) {
        describe('Colossus should make the player draw 1 less card in their starting hand', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'setup',
                    player1: {
                        base: 'colossus',
                        deck: ['armed-to-the-teeth',
                            'collections-starhopper',
                            'covert-strength',
                            'chewbacca#pykesbane',
                            'battlefield-marine',
                            'battlefield-marine',
                            'battlefield-marine',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                        ],
                    },
                    player2: {
                        deck: [
                            'moisture-farmer',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'wampa',
                            'atst',
                            'atst',
                        ],
                    }
                });
            });

            it('should flow normally through each step', function () {
                const { context } = contextRef;

                context.selectInitiativePlayer(context.player1);

                // Draw cards step
                expect(context.player1.handSize).toBe(5);
                expect(context.player2.handSize).toBe(6);
            });

            it('should draw 5 cards on mulligan', function () {
                const { context } = contextRef;

                context.selectInitiativePlayer(context.player1);

                // Draw cards step
                expect(context.player1.handSize).toBe(5);
                expect(context.player2.handSize).toBe(6);

                context.player1.clickPrompt('Mulligan');
                context.player2.clickPrompt('Mulligan');

                expect(context.player1.handSize).toBe(5);
                expect(context.player2.handSize).toBe(6);
            });
        });
    });
});
