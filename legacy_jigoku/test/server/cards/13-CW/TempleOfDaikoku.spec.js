describe('Temple of Daikoku', function() {
    integration(function() {
        describe('Temple of Daikoku', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja']
                    },
                    player2: {
                        inPlay: ['miya-mystic'],
                        provinces: ['temple-of-daikoku']
                    }
                });
                this.shugenja = this.player1.findCardByName('doomed-shugenja');
                this.mystic = this.player2.findCardByName('miya-mystic');
                this.temple = this.player2.findCardByName('temple-of-daikoku');
                this.temple.facedown = false;
            });

            it('should have +2 strength if the water ring is claimed', function() {
                expect(this.temple.getStrength()).toBe(4);
                this.player1.claimRing('water');
                this.player1.pass();
                expect(this.temple.getStrength()).toBe(4 + 2);
            });

            it('should put a fate on the water ring if it is unclaimed', function() {
                let fate = this.game.rings.water.fate;
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shugenja],
                    province: this.temple
                });

                this.player2.clickPrompt('Done');
                expect(this.getChatLogs(3)).toContain('player2 uses Temple of Daikoku to place 1 fate on Water Ring');
                expect(this.game.rings.water.fate).toBe(fate + 1);
            });

            it('should not put a fate on the water ring if it is contested', function() {
                let fate = this.game.rings.water.fate;
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shugenja],
                    province: this.temple,
                    ring: 'water'
                });

                this.player2.clickPrompt('Done');
                expect(this.game.rings.water.fate).toBe(fate);
            });
        });
    });
});
