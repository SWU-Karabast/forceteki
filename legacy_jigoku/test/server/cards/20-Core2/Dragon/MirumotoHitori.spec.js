describe('Truth is in the Killing', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    inPlay: ['mirumoto-hitori']
                },
                player2: {}
            });

            this.hitori = this.player1.findCardByName('mirumoto-hitori');
        });

        it('should interrupt leaving play in the fate phase, remove from game, and re-enter at the start of the next round', function () {
            this.advancePhases('fate');
            this.player1.clickPrompt('Done');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.hitori);
            this.player1.clickCard(this.hitori);
            expect(this.hitori.location).toBe('removed from game');
            expect(this.getChatLogs(10)).toContain(
                'player1 uses Mirumoto Hitori to remove Mirumoto Hitori from play, to be put back into play next round'
            );

            this.player1.clickPrompt('Done');
            this.player2.clickPrompt('Done');

            this.player2.clickPrompt('End Round');
            this.player1.clickPrompt('End Round');

            expect(this.game.currentPhase).toBe('dynasty');
            expect(this.hitori.location).toBe('play area');
            expect(this.getChatLogs(10)).toContain("Mirumoto Hitori is put into play due to Mirumoto Hitori's effect");
        });
    });
});
