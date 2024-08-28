describe('Mon Mothma, Voice of the Rebellion', function() {
    integration(function() {
        describe('Mon Mothma\'s Ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['viper-probe-droid']
                    },
                    player2: {
                        hand: ['wampa', 'battlefield-marine', 'pyke-sentinel']
                    }
                });

                this.viperProbeDroid = this.player1.findCardByName('viper-probe-droid');
            });

            it('should reveal enemy hand', function () {
                this.player1.clickCard(this.viperProbeDroid);
                expect(this.player1).toHavePrompt('tbd');
            });

            it('should work when enemy hand is empty', function () {
                this.player1.clickCard(this.viperProbeDroid);
                expect(this.player1).toHavePrompt('tbd');
            });
        });
    });
});
