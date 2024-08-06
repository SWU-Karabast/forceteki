describe('Merchant of Desires', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['merchant-of-desires']
                }
            });
            this.merchant = this.player1.findCardByName('merchant-of-desires');
        });

        it('draw 1 card on your own', function () {
            const p1Hand = this.player1.hand.length;
            const p2Hand = this.player2.hand.length;
            const p2Honor = this.player2.honor;
            this.player1.clickCard(this.merchant);

            expect(this.player2).toHavePrompt('Lose 1 honor to draw a card?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');

            this.player2.clickPrompt('No');

            expect(this.player1.hand.length).toBe(p1Hand + 1);
            expect(this.player2.hand.length).toBe(p2Hand + 0);
            expect(this.player2.honor).toBe(p2Honor - 0);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Merchant of Desires, losing 1 honor to draw a card. player2 resists the temptation'
            );
        });

        it('draw 1 card on your own, and opponent pays 1 honor to also draw 1 card', function () {
            const p1Hand = this.player1.hand.length;
            const p2Hand = this.player2.hand.length;
            const p2Honor = this.player2.honor;
            this.player1.clickCard(this.merchant);

            expect(this.player2).toHavePrompt('Lose 1 honor to draw a card?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');

            this.player2.clickPrompt('Yes');

            expect(this.player1.hand.length).toBe(p1Hand + 1);
            expect(this.player2.hand.length).toBe(p2Hand + 1);
            expect(this.player2.honor).toBe(p2Honor - 1);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Merchant of Desires, losing 1 honor to draw a card. player2 does not resist and lose 1 honor to also draw a card'
            );
        });
    });
});
