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

                this.tarkintown = this.player1.base;
                this.atrt = this.player2.findCardByName('frontier-atrt');

                this.noMoreActions();
            });

            it('should deal 3 damage to a damaged enemy unit', function () {
                this.player1.clickCard(this.tarkintown);

                // should resolve automatically since there's only one target
                expect(this.atrt.damage).toBe(4);
                expect(this.tarkintown.epicActionSpent).toBe(true);

                // confirm that the ability cannot be used again
                this.player2.passAction();
                this.player1.clickCard(this.tarkintown);
                expect(this.tarkintown).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
            });
        });
    });
});
