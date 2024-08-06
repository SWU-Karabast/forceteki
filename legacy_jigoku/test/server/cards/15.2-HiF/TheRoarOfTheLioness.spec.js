describe('The Roar Of The Lioness', function() {
    integration(function() {
        describe('The Roar Of The Lioness\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['soshi-illusionist']
                    },
                    player2: {
                        role: 'seeker-of-air',
                        hand: ['assassination'],
                        provinces: ['the-roar-of-the-lioness'],
                        honor:15
                    }
                });
                this.soshi = this.player1.findCardByName('soshi-illusionist');

                this.Roar = this.player2.findCardByName('the-roar-of-the-lioness');
                this.assassination = this.player2.findCardByName('assassination');

            });

            it('should have a strength of 8', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    province: this.Roar,
                    attackers: [this.soshi],
                    defenders: []
                });
                expect(this.Roar.getStrength()).toBe(8);
            });

            it('provice should update if the player loses honor', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    province: this.Roar,
                    attackers: [this.soshi],
                    defenders: []
                });
                expect(this.Roar.getStrength()).toBe(8);
                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.soshi);
                expect(this.Roar.getStrength()).toBe(6);
            });

        });
    });
});
