describe('Backhanded Compliment 2', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['backhanded-compliment-2']
                },
                player2: {}
            });
            this.bhc2 = this.player1.findCardByName('backhanded-compliment-2', 'hand');
        });

        it('works on both players', function () {
            this.player1.clickCard(this.bhc2);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
        });

        it('causes target to draw a card and lose 1 honor', function () {
            const initialHonor = this.player2.honor;
            const cardsInHand = this.player2.hand.length;
            this.player1.clickCard(this.bhc2);
            this.player1.clickPrompt('player2');
            expect(this.player2.honor).toBe(initialHonor - 1);
            expect(this.player2.hand.length).toBe(cardsInHand + 1);
            expect(this.getChatLogs(5)).toContain(
                'player1 plays Backhanded Compliment to make player2 lose an honor and draw a card'
            );
        });

        it('is Ephemeral', function () {
            this.player1.clickCard(this.bhc2);
            this.player1.clickPrompt('player2');
            expect(this.bhc2.location).toBe('removed from game');
        });
    });
});
