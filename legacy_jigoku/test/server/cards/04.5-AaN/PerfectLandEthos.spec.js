describe('Perfect Land Ethos', function() {
    integration(function() {
        describe('Perfect Land Ethos\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doji-hotaru', 'kakita-yoshi'],
                        hand: ['perfect-land-ethos']
                    },
                    player2: {
                        inPlay: ['bayushi-liar']
                    }
                });

                this.perfectLandEthos = this.player1.findCardByName('perfect-land-ethos');
                this.shameful = this.player1.findCardByName('shameful-display', 'province 1');
                this.hotaru = this.player1.findCardByName('doji-hotaru');
                this.hotaru.dishonor();
                this.yoshi = this.player1.findCardByName('kakita-yoshi');
                this.yoshi.honor();
                this.liar = this.player2.findCardByName('bayushi-liar');
                this.liar.dishonor();
                this.shameful.facedown = false;
                this.shameful.dishonor();
                this.shameful.taint();
                this.hotaru.taint();
            });

            it('should remove all status tokens', function() {
                this.player1.clickCard(this.perfectLandEthos);
                expect(this.hotaru.isHonored).toBe(false);
                expect(this.hotaru.isDishonored).toBe(false);
                expect(this.hotaru.isTainted).toBe(false);
                expect(this.yoshi.isHonored).toBe(false);
                expect(this.yoshi.isDishonored).toBe(false);
                expect(this.yoshi.isTainted).toBe(false);
                expect(this.liar.isHonored).toBe(false);
                expect(this.liar.isDishonored).toBe(false);
                expect(this.liar.isTainted).toBe(false);

                expect(this.shameful.isHonored).toBe(false);
                expect(this.shameful.isDishonored).toBe(false);
                expect(this.shameful.isTainted).toBe(false);
            });
        });
    });
});
