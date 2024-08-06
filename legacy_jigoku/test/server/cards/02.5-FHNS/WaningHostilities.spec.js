describe('Waning Hostilities', function() {
    integration(function() {
        describe('Waning Hostilities\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['seppun-guardsman'],
                        hand: ['waning-hostilities']
                    },
                    player2: {
                        inPlay: ['bayushi-liar']
                    }
                });
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                this.noMoreActions();
            });

            it('should trigger at the start of the conflict phase', function() {
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect('waning-hostilities');
            });

            it('should reduce the conflict opportunities for both players to 1', function() {
                this.player1.clickCard('waning-hostilities');
                expect(this.player1.player.getConflictOpportunities()).toBe(1);
                expect(this.player2.player.getConflictOpportunities()).toBe(1);
            });

            it('passing conflicts should reduce the available conflict opportunities', function() {
                this.player1.clickCard('waning-hostilities');
                this.noMoreActions();
                expect(this.player1.player.getConflictOpportunities()).toBe(1);
                this.player1.passConflict();
                expect(this.player1.player.getConflictOpportunities()).toBe(0);
                this.noMoreActions();
                this.player2.passConflict();
                expect(this.player2.player.getConflictOpportunities()).toBe(0);
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Which side of the Imperial Favor would you like to claim?');
            });
        });
    });
});
