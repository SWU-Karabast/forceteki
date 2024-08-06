describe('Temple of Jikoju', function() {
    integration(function() {
        describe('Temple of Jikoju', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja']
                    },
                    player2: {
                        inPlay: ['miya-mystic'],
                        provinces: ['temple-of-jikoju']
                    }
                });
                this.shugenja = this.player1.findCardByName('doomed-shugenja');
                this.mystic = this.player2.findCardByName('miya-mystic');
                this.temple = this.player2.findCardByName('temple-of-jikoju');
                this.temple.facedown = false;
            });

            it('should have +2 strength if the air ring is claimed', function() {
                expect(this.temple.getStrength()).toBe(4);
                this.player1.claimRing('air');
                this.player1.pass();
                expect(this.temple.getStrength()).toBe(4 + 2);
            });

            it('should put a fate on the air ring if it is unclaimed', function() {
                let fate = this.game.rings.air.fate;
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shugenja],
                    province: this.temple,
                    ring: 'earth'
                });

                this.player2.clickPrompt('Done');
                expect(this.getChatLogs(3)).toContain('player2 uses Temple of Jikoju to place 1 fate on Air Ring');
                expect(this.game.rings.air.fate).toBe(fate + 1);
            });

            it('should not put a fate on the air ring if it is contested', function() {
                let fate = this.game.rings.air.fate;
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shugenja],
                    province: this.temple,
                    ring: 'air'
                });

                this.player2.clickPrompt('Done');
                expect(this.game.rings.air.fate).toBe(fate);
            });
        });
    });
});
