describe('Dispatch To Nowhere', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    dynastyDiscard: ['ride-at-dawn', 'daidoji-uji']
                },
                player2: {
                    hand: ['assassination', 'let-go']
                }
            });

            this.uji = this.player1.findCardByName('daidoji-uji');
            this.rideAtDawn = this.player1.findCardByName('ride-at-dawn');
            this.player1.placeCardInProvince(this.rideAtDawn, 'province 1');
            this.player1.placeCardInProvince(this.uji, 'province 2');
        });

        it('should react to you passing on dynasty if you are the first to pass', function() {
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.rideAtDawn);
        });

        it('should discard a card', function() {
            let hand = this.player2.hand.length;
            this.player1.pass();
            this.player1.clickCard(this.rideAtDawn);
            expect(this.player2.hand.length).toBe(hand - 1);
            expect(this.getChatLogs(3)).toContain('player1 plays Ride at Dawn to make player2 discard 1 card at random');
        });

        it('should not react if you pass second', function() {
            this.player1.clickCard(this.uji);
            this.player1.clickPrompt('0');
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
