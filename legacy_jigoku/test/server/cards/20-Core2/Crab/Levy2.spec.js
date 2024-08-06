describe('Levy 2', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: [],
                    hand: ['levy-2']
                },
                player2: {
                    inPlay: [],
                    hand: ['a-new-name', 'ornate-fan']
                }
            });
            this.levy = this.player1.findCardByName('levy-2');
            this.ann = this.player2.findCardByName('a-new-name');
            this.fan = this.player2.findCardByName('ornate-fan');
        });

        it('taking fate option and drawing', function () {
            let fate = this.player1.fate;
            let fate2 = this.player2.fate;
            let hand = this.player1.hand.length;

            this.player1.clickCard(this.levy);
            this.player2.clickPrompt('Give your opponent 1 fate');

            expect(this.player1.fate).toBe(fate + 1);
            expect(this.player2.fate).toBe(fate2 - 1);
            expect(this.player1.hand.length).toBe(hand);

            expect(this.getChatLogs(5)).toContain('player1 plays Levy to take 1 fate from player2 and draw a card');
        });

        it('taking honor option and drawing', function () {
            let honor = this.player1.honor;
            let honor2 = this.player2.honor;
            let hand = this.player1.hand.length;

            this.player1.clickCard(this.levy);
            this.player2.clickPrompt('Give your opponent 1 honor');

            expect(this.player1.honor).toBe(honor + 1);
            expect(this.player2.honor).toBe(honor2 - 1);
            expect(this.player1.hand.length).toBe(hand);

            expect(this.getChatLogs(5)).toContain('player1 plays Levy to take 1 honor from player2 and draw a card');
        });

        it('should not draw if you have equal cards', function () {
            this.player2.moveCard(this.ann, 'conflict discard pile');
            this.player2.moveCard(this.fan, 'conflict discard pile');
            
            let honor = this.player1.honor;
            let honor2 = this.player2.honor;
            let hand = this.player1.hand.length;

            this.player1.clickCard(this.levy);
            this.player2.clickPrompt('Give your opponent 1 honor');

            expect(this.player1.honor).toBe(honor + 1);
            expect(this.player2.honor).toBe(honor2 - 1);
            expect(this.player1.hand.length).toBe(hand - 1);

            expect(this.getChatLogs(5)).toContain('player1 plays Levy to take 1 honor from player2');
        });

        it('should not allow picking invalid options', function () {
            this.player2.fate = 0;

            let honor = this.player1.honor;
            let honor2 = this.player2.honor;
            let hand = this.player1.hand.length;

            this.player1.clickCard(this.levy);
            expect(this.player2).toHavePrompt('Action Window');

            expect(this.player1.honor).toBe(honor + 1);
            expect(this.player2.honor).toBe(honor2 - 1);
            expect(this.player1.hand.length).toBe(hand);

            expect(this.getChatLogs(5)).toContain('player1 plays Levy to take 1 honor from player2 and draw a card');
        });
    });
});
