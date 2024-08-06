describe('Asako Lawmaster', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['asako-lawmaster']
                },
                player2: {
                    inPlay: []
                }
            });

            this.lawmaster = this.player1.findCardByName('asako-lawmaster');
        });

        it('should trigger when you player pass a conflict declaration', function() {
            this.noMoreActions();
            this.player1.passConflict();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.lawmaster);
        });

        it('if triggered, should give you an honor', function() {
            let honor = this.player1.honor;
            this.noMoreActions();
            this.player1.passConflict();
            expect(this.player1).toBeAbleToSelect(this.lawmaster);
            this.player1.clickCard(this.lawmaster);
            expect(this.player1.honor).toBe(honor + 1);
        });

        it('should not trigger when opponent passes a conflict declaration', function() {
            this.noMoreActions();
            this.player1.passConflict();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.lawmaster);
            this.player1.clickPrompt('Pass');
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.player1).not.toBeAbleToSelect(this.lawmaster);
            expect(this.getChatLogs(1)).toContain('player2 passes their conflict opportunity as none of their characters can be declared as an attacker');
        });
    });
});
