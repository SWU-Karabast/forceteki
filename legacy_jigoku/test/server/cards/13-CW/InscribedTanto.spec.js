describe('Akodo Kaede', function() {
    integration(function() {
        describe('Akodo Kaede\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['hida-guardian']
                    },
                    player2: {
                        inPlay: ['togashi-mitsu', 'shrine-maiden'],
                        hand: ['inscribed-tanto']
                    }
                });
                this.hidaGuardian = this.player1.findCardByName('hida-guardian');
                this.mitsu = this.player2.findCardByName('togashi-mitsu');
                this.maiden = this.player2.findCardByName('shrine-maiden');
                this.tanto = this.player2.findCardByName('inscribed-tanto');

                this.player1.pass();
                this.player2.playAttachment(this.tanto, this.mitsu);

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.hidaGuardian],
                    defenders: [],
                    ring: 'fire'
                });
            });

            it('should make parent immune to ring effects if void ring is claimed', function() {
                this.player2.claimRing('void');
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Fire Ring');
                expect(this.player1).not.toBeAbleToSelect(this.mitsu);
                expect(this.player1).toBeAbleToSelect(this.maiden);
            });

            it('should not make parent immune to ring effects if void ring is not claimed', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Fire Ring');
                expect(this.player1).toBeAbleToSelect(this.mitsu);
                expect(this.player1).toBeAbleToSelect(this.maiden);
            });

            it('should not make parent immune to ring effects if void ring is claimed by opponent', function() {
                this.player1.claimRing('void');
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Fire Ring');
                expect(this.player1).toBeAbleToSelect(this.mitsu);
                expect(this.player1).toBeAbleToSelect(this.maiden);
            });
        });
    });
});

