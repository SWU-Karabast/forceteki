describe('Tarkintown', function() {
    integration(function() {
        describe('Tarkintown\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'tarkintown',
                    },
                    player2: {
                        groundArena: [
                            { card: 'frontier-atrt', damage: 1 },
                            'wampa'
                        ],
                    }
                });
            });

            it('should deal 3 damage to a damaged enemy unit', function () {
                this.player1.clickCard(this.tarkintown);

                // should resolve automatically since there's only one target
                expect(this.frontierAtrt.damage).toBe(4);
                expect(this.tarkintown.epicActionSpent).toBe(true);

                // confirm that the ability cannot be used again
                this.player2.passAction();
                expect(this.tarkintown).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);

                // skip to next turn so we can confirm that the ability is still unusable
                this.moveToNextActionPhase();
                expect(this.player1).toBeActivePlayer();
                expect(this.tarkintown).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
            });
        });
    });
});
