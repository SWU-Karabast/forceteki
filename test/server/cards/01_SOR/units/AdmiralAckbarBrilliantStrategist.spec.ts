describe('Wedge Antilles, Star of the Rebellion', function() {
    integration(function(contextRef) {
        describe('Wedge Antilles\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['admiral-ackbar#brilliant-strategist'],
                        groundArena: ['battlefield-marine', 'wampa'],
                        spaceArena: ['red-three#unstoppable']
                    },
                    player2: {
                        groundArena: ['atst'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    }
                });
            });

            it('should allow the player to deal damage to a unit equal to the number of units your control in its arena.', function () {
                // Setup
                const { context } = contextRef;
                const { admiralAckbar, player1 } = context;

                function reset() {
                    player1.moveCard(admiralAckbar, 'hand');
                    context.player2.passAction();
                }

                // Case 1: It allows the player to optionally select any units in play.
                player1.clickCard(admiralAckbar);

                expect(context.player1).toBeAbleToSelectExactly([
                    admiralAckbar,
                    context.battlefieldMarine,
                    context.wampa,
                    context.redThree,
                    context.atst,
                    context.lukeSkywalker,
                ]);
                expect(context.player1).toHavePassAbilityButton();

                // Case 1: It does damage to the selected ground arena unit equal to the conrolled units in that arena.
                player1.clickCard(context.atst);

                expect(context.atst.damage).toEqual(3);

                reset();

                // Case 2: It does damage to the selected space arena unit equal to the conrolled units in that arena.
                player1.clickCard(admiralAckbar);
                player1.clickCard(context.redThree);

                expect(context.redThree.damage).toEqual(1);
            });
        });
    });
});
