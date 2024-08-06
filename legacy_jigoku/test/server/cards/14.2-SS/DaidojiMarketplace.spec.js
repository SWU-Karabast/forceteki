describe('Daidoji Marketplace', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'draw',
                player1: {
                    dynastyDiscard: ['daidoji-marketplace']
                },
                player2: {
                }
            });

            this.marketplace = this.player1.findCardByName('daidoji-marketplace');
            this.shamefulDisplay1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            this.player1.moveCard(this.marketplace, this.shamefulDisplay1.location);
        });

        it('should trigger at the start of the conflict phase', function() {
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.marketplace);
        });

        it('should reveal the province', function() {
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.marketplace);
            expect(this.getChatLogs(1)).toContain('player1 uses Daidoji Marketplace to reveal Shameful Display');
        });

        it('should not trigger if the province is already faceup', function() {
            this.shamefulDisplay1.facedown = false;
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
