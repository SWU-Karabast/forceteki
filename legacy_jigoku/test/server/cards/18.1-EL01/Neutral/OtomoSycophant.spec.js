describe('Empress\'s Retainer', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['otomo-sycophant']
                },
                player2: {
                }
            });

            this.otomo = this.player1.findCardByName('otomo-sycophant');
        });

        it('should let you honor if you have favor', function() {
            this.player1.clickCard(this.otomo);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.player.imperialFavor = 'military';
            this.game.checkGameState(true);
            this.player1.clickCard(this.otomo);
            expect(this.otomo.isHonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Otomo Sycophant to honor Otomo Sycophant');
        });
    });
});
