describe('Dragons Claw', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger', 'doji-kuwanan'],
                    hand: ['let-go']
                },
                player2: {
                    inPlay: ['kakita-yoshi'],
                    hand: ['dragon-s-claw', 'dragon-s-fang']
                }
            });

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');

            this.claw = this.player2.findCardByName('dragon-s-claw');
            this.fang = this.player2.findCardByName('dragon-s-fang');
            this.letGo = this.player1.findCardByName('let-go');

            this.player1.pass();
            this.player2.playAttachment(this.fang, this.yoshi);
        });

        it('should have sincerity', function() {
            let hand = this.player2.hand.length;
            this.player1.clickCard(this.letGo);
            this.player1.clickCard(this.fang);

            expect(this.player2.hand.length).toBe(hand + 1);
            expect(this.getChatLogs(5)).toContain('player2 draws a card due to Dragon\'s Fang\'s Sincerity');
        });
    });
});
