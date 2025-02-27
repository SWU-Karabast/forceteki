describe('Petition The Senate', function () {
    integration(function (contextRef) {
        describe('Petition The Senate\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['petition-the-senate'],
                        groundArena: ['general-tagge#concerned-commander',
                            'the-client#dictated-by-discretion',
                            'colonel-yularen#isb-director']
                    },
                    player2: {
                        groundArena: ['admiral-piett#captain-of-the-executor', 'rey#keeping-the-past']
                    }
                });
            });

            it('If control 3 Official units, draw 3 cards', function () {
                const { context } = contextRef;
                // controlling 3 officials, draw 3 cards
                context.player1.clickCard(context.petitionTheSenate);
                expect(context.player1.hand.length).toBe(3);

                context.player1.moveCard(context.petitionTheSenate, 'hand');

                // Defeat an official ready for below check, if needed.
                context.player2.clickCard(context.rey);
                context.player2.clickCard(context.colonelYularen);
                context.player2.clickCard(context.admiralPiett);

                // controlling less than 3 officials
                context.player1.clickCard(context.petitionTheSenate);
                expect(context.petitionTheSenate).toBeInZone('discard');
                expect(context.player1.hand.length).toBe(3);
            });
        });
    });
});
