describe('Kuni Purifier', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['asako-tsuki'],
                    hand: ['against-the-waves', 'assassination']
                },
                player2: {
                    inPlay: ['kuni-purifier']
                }
            });
            this.asakoTsuki = this.player1.findCardByName('asako-tsuki');
            this.purifier = this.player2.findCardByName('kuni-purifier');
        });

        it('should prompt you to discard a card if opponent passes', function() {
            let hand = this.player1.hand.length;
            this.noMoreActions();
            this.player1.passConflict();
            expect(this.player2).toHavePrompt('Triggered abilities');
            expect(this.player2).toBeAbleToSelect(this.purifier);
            this.player2.clickCard(this.purifier);
            expect(this.player1.hand.length).toBe(hand - 1);
            expect(this.getChatLog(1)).toContain('at random');
        });

        it('should not prompt you to discard if you pass', function() {
            this.noMoreActions();
            this.player1.passConflict();
            expect(this.player2).toBeAbleToSelect(this.purifier);
            this.player2.clickPrompt('Pass');
            this.noMoreActions();
            this.player2.passConflict();

            expect(this.player2).not.toHavePrompt('Triggered abilities');
            expect(this.player2).not.toBeAbleToSelect(this.purifier);
        });
    });
});
