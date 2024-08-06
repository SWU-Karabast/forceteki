describe("Ankoku's Blessing", function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'fate',
                player1: {
                    hand: ['ankoku-s-blessing', 'let-go', 'fine-katana']
                },
                player2: {
                    inPlay: ['fushicho']
                }
            });
            this.blessing = this.player1.findCardByName('ankoku-s-blessing');
            this.letGo = this.player1.findCardByName('let-go');
            this.katana = this.player1.findCardByName('fine-katana');
        });

        it('should discard a card from hand to gain 2 fate and draw 2 cards', function () {
            let fate = this.player1.fate;
            let hand = this.player1.hand.length;

            this.player1.clickCard(this.blessing);
            expect(this.player1).toHavePrompt('Select card to discard');
            expect(this.player1).toBeAbleToSelect(this.letGo);
            expect(this.player1).toBeAbleToSelect(this.katana);

            this.player1.clickCard(this.letGo);

            expect(this.player1.fate).toBe(fate + 1);
            expect(this.player1.hand.length).toBe(hand);
            expect(this.letGo.location).toBe('conflict discard pile');

            expect(this.getChatLogs(5)).toContain(
                "player1 plays Ankoku's Blessing, discarding Let Go to draw 2 cards and gain 2 fate"
            );
        });
    });
});
