describe('Nabat Village', function() {
    integration(function(contextRef) {
        describe('Nabat Village should make the player 3 more cards in their starting hand and not be able to mulligan', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'setup',
                    player1: {
                        base: 'nabat-village',
                        deck: ['moisture-farmer', 'wampa', 'pyke-sentinel',
                            'lothal-insurgent', 'concord-dawn-interceptors', 'timely-intervention',
                            'battlefield-marine', 'confiscate', 'restock',
                            'surprise-strike'
                        ]
                    },
                    player2: {
                        deck: [
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst'
                        ],
                    }
                });
            });

            it('Should draw 3 extra cards in the starting hand and get no mulligan', function () {
                const { context } = contextRef;

                context.selectInitiativePlayer(context.player1);

                // Draw cards step
                expect(context.player1.handSize).toBe(9);
                expect(context.player1.deck.length).toBe(1);
                expect(context.player2.handSize).toBe(6);
                expect(context.player2.deck.length).toBe(3);

                // Mulligan step
                // check if each player has correct prompt
                expect(context.player1).toHavePrompt('Waiting for opponent to choose whether to Mulligan or keep hand.');
                expect(context.player2).toHaveExactPromptButtons(['Mulligan', 'Keep']);
                context.player2.clickPrompt('Keep');
            });

            it('should make its owner put 3 cards on the bottom of their deck at the start of the first action phase', function () {
                const { context } = contextRef;
                context.game.setRandomSeed('76234');

                context.selectInitiativePlayer(context.player1);
                context.player2.clickPrompt('Keep');

                // Resource step
                context.player1.clickCard(context.timelyIntervention);
                context.player1.clickCard(context.lothalInsurgent);
                context.player1.clickPrompt('Done');

                context.player2.clickCard(context.player2.hand[0]);
                context.player2.clickCard(context.player2.hand[1]);
                context.player2.clickPrompt('Done');

                // Check that Player 1 has to put three cards on the bottom of their deck
                expect(context.player1).toHavePrompt('Select 3 cards');
                expect(context.player1).toBeAbleToSelectExactly(context.player1.hand);
                expect(context.player2).toHavePrompt('Waiting for opponent to use Nabat Village');
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.wampa);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.concordDawnInterceptors);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.restock);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                expect([context.wampa, context.concordDawnInterceptors, context.restock]).toAllBeInBottomOfDeck(context.player1, 3);
                expect(context.player1).toBeActivePlayer();
                expect(context.getChatLogs(2)).toEqual([
                    'player1 uses Nabat Village to choose 3 cards to move to the bottom of their deck',
                    'player1 uses Nabat Village to move 3 cards to the bottom of their deck',
                ]);
            });

            it('should not make its owner put 3 cards on the bottom of their deck at the start of the second action phase', function () {
                const { context } = contextRef;
                context.game.setRandomSeed('76234');

                context.selectInitiativePlayer(context.player1);
                context.player2.clickPrompt('Keep');

                // Resource
                context.player1.clickCard(context.timelyIntervention);
                context.player1.clickCard(context.lothalInsurgent);
                context.player1.clickPrompt('Done');

                context.player2.clickCard(context.player2.hand[0]);
                context.player2.clickCard(context.player2.hand[1]);
                context.player2.clickPrompt('Done');

                // First action phase - use Nabat Village
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.concordDawnInterceptors);
                context.player1.clickCard(context.restock);
                context.player1.clickPrompt('Done');

                // Pass to second phase and skip resourcing
                context.player1.claimInitiative();
                context.player2.passAction();
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
