describe('Patrolling V-Wing', function () {
    integration(function () {
        describe('Patrolling V-Wing\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['patrolling-vwing'],
                    },
                    player2: {}
                });
            });

            it('should draw', function () {
                this.player1.clickCard(this.patrollingVwing);
                expect(this.player1.hand.length).toBe(1);
                expect(this.player2.hand.length).toBe(0);
            });
        });
    });
});
