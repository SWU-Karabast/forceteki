describe('Setup Phase', function() {
    integration(function(contextRef) {
        describe('Setup Phase', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'setup',
                    player1: {
                        resources: [],
                        deck: ['armed-to-the-teeth',
                            'collections-starhopper',
                            'covert-strength',
                            'chewbacca#pykesbane',
                            'battlefield-marine',
                            'moment-of-peace',
                        ],
                    },
                    player2: {
                        resources: [],
                        deck: [
                            'wampa',
                            'moisture-farmer',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                        ],
                    }
                });
            });

            it('should flow normally through each step', function () {
                const { context } = contextRef;

                // The setup phase is divided into 3 or 4 steps: choose Initiative player, Draw card step, mulligan step (optional), resource step
                // Choose Initiative Step
                context.selectInitiativePlayer(context.player1);

                // Draw cards step
                const expectedCards = [
                    context.armedToTheTeeth,
                    context.collectionsStarhopper,
                    context.covertStrength,
                    context.chewbacca,
                    context.battlefieldMarine,
                    context.momentOfPeace
                ];
                expect(context.player1.handSize).toBe(6);
                expect(context.player2.handSize).toBe(6);
                let allCardsPresentInPlayer1Hand = expectedCards.every((card) => context.player1.hand.includes(card));
                expect(allCardsPresentInPlayer1Hand).toBe(true);

                // Mulligan step
                context.player1.clickPrompt('yes');
                context.player2.clickPrompt('no');
                allCardsPresentInPlayer1Hand = expectedCards.every((card) => context.player1.hand.includes(card));
                expect(allCardsPresentInPlayer1Hand).toBe(true);

                // Resource step
                // check that no resource was automatically set
                expect(context.player1.resources.length).toBe(0);
                expect(context.player2.resources.length).toBe(0);

                // select 2 cards to resource
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.armedToTheTeeth);
                context.player2.clickCard(context.moistureFarmer);
                context.player2.clickCard(context.wampa);

                // Check that the hand doesn't contain the selected cards anymore
                expect(context.player1.hand).not.toContain(context.battlefieldMarine);
                expect(context.player1.hand).not.toContain(context.armedToTheTeeth);
                expect(context.player2.hand).not.toContain(context.wampa);
                expect(context.player2.hand).not.toContain(context.moistureFarmer);

                expect(context.player1.resources.length).toBe(2);
                expect(context.player2.resources.length).toBe(2);

                // Check if resources are correctly set
                expect(context.player1.resources).toContain(context.battlefieldMarine);
                expect(context.player1.resources).toContain(context.armedToTheTeeth);
                expect(context.player2.resources).toContain(context.wampa);
                expect(context.player2.resources).toContain(context.moistureFarmer);

                // check if player1 is the active player
                expect(context.player1).toBeActivePlayer();
                expect(context.player2).toHavePrompt('Waiting for opponent to take an action or pass');
            });
        });
    });
});
