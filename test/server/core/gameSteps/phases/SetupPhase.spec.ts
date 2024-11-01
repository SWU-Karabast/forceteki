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
                            'battlefield-marine',
                            'battlefield-marine',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                        ],
                    },
                    player2: {
                        resources: [],
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

                // Mulligan step
                context.player1.clickPrompt('yes');
                context.player2.clickPrompt('no');
                const afterMulliganHand = context.player1.hand;
                expect(beforeMulliganHand).not.toEqual(afterMulliganHand);

                // Resource step
                // check that no resource was automatically set
                expect(context.player1.resources.length).toBe(0);
                expect(context.player2.resources.length).toBe(0);

                const player1FirstCard = context.player1.hand[0];
                const player1SecondCard = context.player1.hand[1];

                // select 2 cards to resource
                context.player1.clickCard(context.player1.hand[0]);
                context.player1.clickCard(context.player1.hand[1]);

                // Check if selecting any unavailable cards triggers resourcing
                context.player2.clickCardNonChecking(context.player2.deck[0]);
                context.player2.clickCardNonChecking(context.player1.hand[0]);
                context.player2.clickCardNonChecking(context.player1.deck[0]);
                context.player2.clickCardNonChecking(context.p1Base);
                context.player2.clickCardNonChecking(context.p2Base);

                // Select 2 correct cards to resource
                context.player2.clickCard(context.player2.hand[0]);
                context.player2.clickCard(context.player2.hand[1]);

                // Check if resource length is correct
                expect(context.player1.resources.length).toBe(2);
                expect(context.player2.resources.length).toBe(2);

                // Check if resources are correctly set
                expect(context.player1.resources).toContain(player1FirstCard);
                expect(context.player1.resources).toContain(player1SecondCard);

                // Check if hand is correctly set
                expect(context.player1.handSize).toEqual(4);
                expect(context.player2.handSize).toEqual(4);

                // Check if player1 is the active player
                expect(context.player1).toBeActivePlayer();
                expect(context.player2).toHavePrompt('Waiting for opponent to take an action or pass');
            });
        });
    });
});
