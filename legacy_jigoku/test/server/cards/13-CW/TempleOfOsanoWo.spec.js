describe('Temple of Osano-Wo', function() {
    integration(function() {
        describe('Temple of Osano-Wo', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja']
                    },
                    player2: {
                        inPlay: ['miya-mystic'],
                        provinces: ['temple-of-osano-wo']
                    }
                });
                this.shugenja = this.player1.findCardByName('doomed-shugenja');
                this.mystic = this.player2.findCardByName('miya-mystic');
                this.temple = this.player2.findCardByName('temple-of-osano-wo');
                this.temple.facedown = false;
            });

            it('should have +2 strength if the earth ring is claimed', function() {
                expect(this.temple.getStrength()).toBe(4);
                this.player1.claimRing('earth');
                this.player1.pass();
                expect(this.temple.getStrength()).toBe(4 + 2);
            });

            it('should put a fate on the earth ring if it is unclaimed', function() {
                let fate = this.game.rings.earth.fate;
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shugenja],
                    province: this.temple
                });

                this.player2.clickPrompt('Done');
                expect(this.getChatLogs(3)).toContain('player2 uses Temple of Osano-wo to place 1 fate on Earth Ring');
                expect(this.game.rings.earth.fate).toBe(fate + 1);
            });

            it('should not put a fate on the earth ring if it is contested', function() {
                let fate = this.game.rings.earth.fate;
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shugenja],
                    province: this.temple,
                    ring: 'earth'
                });

                this.player2.clickPrompt('Done');
                expect(this.game.rings.earth.fate).toBe(fate);
            });
        });
    });
});
