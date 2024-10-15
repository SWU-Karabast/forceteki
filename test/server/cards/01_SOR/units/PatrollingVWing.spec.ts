describe('Patrolling V-Wing', function () {
    integration(function (contextRef) {
        describe('Patrolling V-Wing\'s ability', function () {
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
