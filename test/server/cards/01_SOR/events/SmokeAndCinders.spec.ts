describe('Smoke and Cinders', function() {
    integration(function(contextRef) {
        describe('Smoke and Cinders\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['smoke-and-cinders', 'forced-surrender', 'yoda#old-master'],
                    },
                    player2: {
                        hand: ['gamorrean-guards']
                    }
                });
            });

            it('discards all but 2 cards from each player hand', function () {
                const { context } = contextRef;

                const reset = () => {
                    context.player2.passAction();

                    context.player1.moveCard(context.smokeAndCinders, 'hand');
                    context.player1.claimInitiative();

                    context.player2.clickPrompt('Done');
                    context.player1.clickPrompt('Done');
                };

                // Scenario 1: Both players have 2 or less cards in hand
                const p1HandSizeBeforeEvent = context.player1.handSize;
                const p2HandSizeBeforeEvent = context.player2.handSize;
                context.player1.clickCard(context.smokeAndCinders);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(p1HandSizeBeforeEvent - 1);
                expect(context.player2.handSize).toBe(p2HandSizeBeforeEvent);

                reset();

                // Scenario 2: Both players have more than 2 cards in hand
                context.player1.clickCard(context.smokeAndCinders);

                expect(context.player1).toHavePrompt('Choose 2 cards to discard');
                expect(context.player1).toBeAbleToSelectExactly(context.player1.hand);
                context.player1.hand
                    .filter((card) => card.name === 'Underworld Thug')
                    .forEach((card) => context.player1.clickCard(card));
                context.player1.clickCardNonChecking(context.yoda);
                context.player1.clickPrompt('Done');

                expect(context.player2).toHavePrompt('Choose a card to discard');
                expect(context.player2).toBeAbleToSelectExactly(context.player2.hand);
                context.player2.clickCard(context.player2.hand.find((card) => card.name === 'Underworld Thug'));

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(2);
                expect(context.player2.handSize).toBe(2);

                reset();

                // Scenario 3: Only one player has more than 2 cards in hand
                context.player1.hand
                    .filter((card) => card.name === 'Underworld Thug')
                    .forEach((card) => context.player1.moveCard(card, 'discard'));
                expect(context.player1.handSize).toBeLessThanOrEqual(3);

                context.player1.clickCard(context.smokeAndCinders);

                expect(context.player2).toHavePrompt('Choose 2 cards to discard');
                expect(context.player2).toBeAbleToSelectExactly(context.player2.hand);
                context.player2.hand
                    .filter((card) => card.name === 'Underworld Thug')
                    .slice(0, 2)
                    .forEach((card) => context.player2.clickCard(card));
                context.player2.clickCardNonChecking(context.gamorreanGuards);
                context.player2.clickPrompt('Done');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(2);
                expect(context.player2.handSize).toBe(2);

                reset();
            });
        });
    });
});
