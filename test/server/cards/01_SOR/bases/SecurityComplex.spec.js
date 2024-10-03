describe('SecurityComplex', function() {
    integration(function() {
        describe('Security Complex\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'security-complex',
                    },
                    player2: {
                        groundArena: [
                            { card: 'frontier-atrt', damage: 1 },
                            'wampa'
                        ],
                        leader: { card: 'boba-fett#daimyo', deployed: true, damage: 1 }
                    }
                });
            });

            it('should deal 3 damage to a damaged enemy non-leader unit', function () {
                this.player1.clickCard(this.securityComplex);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.frontierAtrt]);

                this.player1.clickCard(this.wampa);
                expect(this.wampa).toHaveExactUpgradeNames(['shield']);

                // skip to next turn so we can confirm that the ability is still unusable
                this.moveToNextActionPhase();
                expect(this.player1).toBeActivePlayer();
                expect(this.securityComplex).not.toHaveAvailableActionWhenClickedBy(this.player1);
            });
        });
    });
});
