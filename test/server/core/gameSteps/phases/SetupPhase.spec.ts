describe('Setup Phase', function() {
    integration(function(contextRef) {
        describe('Setup Phase', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'setup',
                    player1: {
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

                // The setup phase is divided into 3 or 4 steps: choose Initiative player, Draw card step, mulligan step (optional), resource step
                // Choose Initiative Step
                context.selectInitiativePlayer(context.player1);

                // Draw cards step
                expect(context.player1.handSize).toBe(6);
                expect(context.player2.handSize).toBe(6);
                const beforeMulliganHand = context.player1.hand;
                const beforePlayer2Hand = context.player2.hand;

                // Mulligan step
                // check if each player has correct prompt
                expect(context.player1).toHaveExactPromptButtons(['Yes', 'No']);
                expect(context.player2).toHaveExactPromptButtons(['Yes', 'No']);


                // Check if player2 can still mulligan after player1 selects yes.
                context.player1.clickPrompt('yes');
                expect(context.player1.hand).toEqual(beforeMulliganHand);
                expect(context.player2).toHaveExactPromptButtons(['Yes', 'No']);
                expect(context.player1).toHavePrompt('Waiting for opponent to choose whether to Mulligan or keep hand.');
                context.player2.clickPrompt('no');

                const afterMulliganHand = context.player1.hand;
                const afterPlayer2Hand = context.player2.hand;
                expect(beforeMulliganHand).not.toEqual(afterMulliganHand);
                expect(beforePlayer2Hand).toEqual(afterPlayer2Hand);

                // Resource step
                // check that no resource was automatically set
                expect(context.player1.resources.length).toBe(0);
                expect(context.player2.resources.length).toBe(0);

                const player1FirstCard = context.player1.hand[0];
                const player1SecondCard = context.player1.hand[1];

                // We check if player1's hand has the only selectable cards
                expect(context.player1).toBeAbleToSelectExactly(context.player1.hand);
                expect(context.player1.selectedCards.length).toBe(0);

                // we check if player2's hand has the only selectable cards
                expect(context.player2).toBeAbleToSelectExactly(context.player2.hand);
                expect(context.player2.selectedCards.length).toBe(0);

                // select 2 cards to resource player1 and check prompts
                context.player1.clickCard(context.player1.hand[0]);
                expect(context.player1.selectedCards.length).toBe(1);

                // We check if player1's hand has the only selectable cards
                expect(context.player1).toBeAbleToSelectExactly(context.player1.hand);
                expect(context.player1).toHaveExactPromptButtons(['Done']);
                expect(context.player2).toHaveExactPromptButtons(['Done']);

                context.player1.clickCard(context.player1.hand[1]);
                expect(context.player1).toHaveExactPromptButtons(['Done']);
                expect(context.player2).toHaveExactPromptButtons(['Done']);

                // Check that player1 cannot select any additional cards
                context.player1.clickCardNonChecking(context.player1.hand[2]);
                expect(context.player1.selectedCards.length).toBe(2);

                context.player1.clickPrompt('Done');
                expect(context.player1).toHavePrompt('Waiting for opponent to choose cards to resource');


                // Check if selecting any unavailable cards triggers resourcing
                context.player2.clickCardNonChecking(context.player2.deck[0]);
                expect(context.player2).toHavePrompt('Select 2 cards to resource');
                context.player2.clickCardNonChecking(context.player1.hand[0]);
                expect(context.player2).toHavePrompt('Select 2 cards to resource');
                context.player2.clickCardNonChecking(context.player1.deck[0]);
                expect(context.player2).toHavePrompt('Select 2 cards to resource');
                context.player2.clickCardNonChecking(context.p1Base);
                expect(context.player2).toHavePrompt('Select 2 cards to resource');
                context.player2.clickCardNonChecking(context.p2Base);
                expect(context.player2).toHavePrompt('Select 2 cards to resource');

                // Select 2 correct cards to resource player2 and check if correct prompts
                const player2FirstCard = context.player2.hand[0];
                const player2SecondCard = context.player2.hand[0];

                // Click the first card to resource
                context.player2.clickCard(context.player2.hand[0]);
                expect(context.player2.selectedCards.length).toBe(1);
                expect(context.player1).toHavePrompt('Waiting for opponent to choose cards to resource');
                expect(context.player2).toHaveExactPromptButtons(['Done']);

                // we check if player2's hand has the only selectable cards
                expect(context.player2).toBeAbleToSelectExactly(context.player2.hand);

                // click the second card to resource
                context.player2.clickCard(context.player2.hand[1]);
                expect(context.player1).toHavePrompt('Waiting for opponent to choose cards to resource');
                expect(context.player2).toHaveExactPromptButtons(['Done']);

                // Check that player2 cannot select any additional cards
                context.player2.clickCardNonChecking(context.player2.hand[2]);
                expect(context.player2.selectedCards.length).toBe(2);

                context.player2.clickPrompt('Done');

                // Check if resource length is correct
                expect(context.player1.resources.length).toBe(2);
                expect(context.player2.resources.length).toBe(2);

                // check if resources aren't exhausted
                expect(context.player1.countSpendableResources()).toBe(2);
                expect(context.player2.countSpendableResources()).toBe(2);

                // Check if resources are correctly set
                expect(context.player1.resources).toContain(player1FirstCard);
                expect(context.player1.resources).toContain(player1SecondCard);
                expect(context.player2.resources).toContain(player2FirstCard);
                expect(context.player2.resources).toContain(player2SecondCard);

                // Check if hand is correctly set
                expect(context.player1.handSize).toEqual(4);
                expect(context.player2.handSize).toEqual(4);

                // Check if player1 is the active player
                expect(context.player1).toBeActivePlayer();
                expect(context.player2).toHavePrompt('Waiting for opponent to take an action or pass');
            });

            it('should flow normally through each step with player2 as initiative player', function () {
                const { context } = contextRef;

                // The setup phase is divided into 3 or 4 steps: choose Initiative player, Draw card step, mulligan step (optional), resource step
                // Choose Initiative Step
                context.selectInitiativePlayer(context.player2);

                // Draw cards step
                expect(context.player1.handSize).toBe(6);
                expect(context.player2.handSize).toBe(6);

                // Mulligan step
                context.player1.clickPrompt('no');
                expect(context.player1).toHavePrompt('Waiting for opponent to choose whether to Mulligan or keep hand.');
                context.player2.clickPrompt('no');

                // We check if player1's hand has the only selectable cards
                expect(context.player1).toBeAbleToSelectExactly(context.player1.hand);

                // we check if player2's hand has the only selectable cards
                expect(context.player2).toBeAbleToSelectExactly(context.player2.hand);

                // select 2 cards to resource both players and confirm
                context.player1.clickCard(context.player1.hand[0]);
                context.player2.clickCard(context.player2.hand[0]);
                context.player1.clickCard(context.player1.hand[1]);
                context.player2.clickCard(context.player2.hand[1]);

                // finish resource step
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // Check if resource length is correct
                expect(context.player1.resources.length).toBe(2);
                expect(context.player2.resources.length).toBe(2);

                // Check if player2 is the active player
                expect(context.player2).toBeActivePlayer();
                expect(context.player1).toHavePrompt('Waiting for opponent to take an action or pass');
            });
        });
    });
});
