describe('Cripple Authority', function() {
    integration(function(contextRef) {
        describe('Cripple Authority\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cripple-authority'],
                    },
                    player2: {
                        hand: ['atst', 'wampa']
                    }
                });
            });

            it('draws a card and each opponent who controls more resources discards a card', function () {
                const { context } = contextRef;

                const reset = () => {
                    context.player2.passAction();

                    context.player1.moveCard(context.crippleAuthority, 'hand');
                };

                // Scenario 1: Same number of resources
                context.player1.clickCard(context.crippleAuthority);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(1);
                expect(context.player2.handSize).toBe(2);

                reset();

                // Scenario 2: Opponent controls less resources
                context.player1.setResourceCount(20);
                context.player2.setResourceCount(19);

                context.player1.clickCard(context.crippleAuthority);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(2);
                expect(context.player2.handSize).toBe(2);

                reset();

                // Scenario 3: Opponent controls more resources
                context.player1.setResourceCount(20);
                context.player2.setResourceCount(21);

                context.player1.clickCard(context.crippleAuthority);

                expect(context.player2).toHavePrompt('Choose a card to discard');
                expect(context.player2).toBeAbleToSelectExactly([context.atst, context.wampa]);
                context.player2.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(3);
                expect(context.player2.handSize).toBe(1);

                reset();
            });
        });
    });
});
