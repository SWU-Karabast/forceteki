describe('SecurityComplex', function() {
    integration(function() {
        describe('Security Complex\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'security-complex',
                        groundArena: ['jedha-agitator'],
                    },
                    player2: {
                        groundArena: ['frontier-atrt', 'wampa'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
            });

            it('should give shield to non-leader unit', function () {
                this.player1.clickCard(this.securityComplex);
                expect(this.player1).toBeAbleToSelectExactly([this.jedhaAgitator, this.wampa, this.frontierAtrt]);

                this.player1.clickCard(this.jedhaAgitator);
                expect(this.jedhaAgitator).toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});
