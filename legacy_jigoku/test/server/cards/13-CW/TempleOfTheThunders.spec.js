describe('Temple of The Thunders', function() {
    integration(function() {
        describe('Temple of The Thunders', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja']
                    },
                    player2: {
                        inPlay: ['miya-mystic'],
                        provinces: ['temple-of-the-thunders']
                    }
                });
                this.shugenja = this.player1.findCardByName('doomed-shugenja');
                this.mystic = this.player2.findCardByName('miya-mystic');
                this.temple = this.player2.findCardByName('temple-of-the-thunders');
                this.temple.facedown = false;
            });

            it('should have +2 strength if the fire ring is claimed', function() {
                expect(this.temple.getStrength()).toBe(4);
                this.player1.claimRing('fire');
                this.player1.pass();
                expect(this.temple.getStrength()).toBe(4 + 2);
            });

            it('should put a fate on the fire ring if it is unclaimed', function() {
                let fate = this.game.rings.fire.fate;
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shugenja],
                    province: this.temple,
                    ring: 'earth'
                });

                this.player2.clickPrompt('Done');
                expect(this.getChatLogs(3)).toContain('player2 uses Temple of the Thunders to place 1 fate on Fire Ring');
                expect(this.game.rings.fire.fate).toBe(fate + 1);
            });

            it('should not put a fate on the fire ring if it is contested', function() {
                let fate = this.game.rings.fire.fate;
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shugenja],
                    province: this.temple,
                    ring: 'fire'
                });

                this.player2.clickPrompt('Done');
                expect(this.game.rings.fire.fate).toBe(fate);
            });
        });
    });
});
