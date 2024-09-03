describe('Viper Probe Droid', function() {
    integration(function() {
        describe('Viper Probe Droid\'s Ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['viper-probe-droid']
                    },
                    player2: {
                        hand: ['wampa', 'battlefield-marine', 'pyke-sentinel'],
                        groundArena: ['scout-bike-pursuer']
                    }
                });
            });

            it('should reveal enemy hand', function () {
                this.player1.clickCard(this.viperProbeDroid);
                expect(this.viperProbeDroid.location).toBe('ground arena');
                expect(this.getChatLogs(1)).toContain('Viper Probe Droid sees Battlefield Marine, Pyke Sentinel, and Wampa');
                expect(this.player2).toBeActivePlayer();
            });

            it('should be playable when enemy hand is empty', function () {
                this.player2.setHand([]);
                this.player1.clickCard(this.viperProbeDroid);
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
