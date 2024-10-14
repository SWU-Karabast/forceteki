describe('Patrolling V-Wing', function () {
    integration(function () {
        describe('Patrolling V-Wing\'s ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['patrolling-vwing'],
                    },
                    player2: {}
                });
            });

            it('should draw', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.patrollingVwing);
                expect(context.player1.hand.length).toBe(1);
                expect(context.player2.hand.length).toBe(0);
            });
        });
    });
});
