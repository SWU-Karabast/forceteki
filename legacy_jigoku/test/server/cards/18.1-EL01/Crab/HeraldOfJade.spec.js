describe('Herald of Jade', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-hotaru', 'togashi-initiate'],
                    hand: ['herald-of-jade']
                },
                player2: {
                    inPlay: ['akodo-toturi', 'doji-whisperer']
                }
            });

            this.hotaru = this.player1.findCardByName('doji-hotaru');
            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.toturi = this.player2.findCardByName('akodo-toturi');
            this.whisperer = this.player2.findCardByName('doji-whisperer');

            this.herald = this.player1.findCardByName('herald-of-jade');
            this.hotaru.honor();
            this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.sd1.dishonor();
            this.toturi.taint();
        });

        it('should trigger when entering play', function() {
            this.player1.clickCard(this.herald);
            this.player1.clickPrompt('0');
            expect(this.player1).toBeAbleToSelect(this.herald);
        });

        it('should let you choose a card with a status token', function() {
            this.player1.clickCard(this.herald);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.herald);
            expect(this.player1).toBeAbleToSelect(this.hotaru);
            expect(this.player1).not.toBeAbleToSelect(this.initiate);
            expect(this.player1).toBeAbleToSelect(this.toturi);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.sd1);
        });

        it('should discard the chosen token and give you 1 honor', function() {
            let honor = this.player1.honor;
            this.player1.clickCard(this.herald);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.herald);
            expect(this.toturi.isTainted).toBe(true);
            this.player1.clickCard(this.toturi);
            expect(this.toturi.isTainted).toBe(false);
            expect(this.player1.honor).toBe(honor + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Herald of Jade to discard Akodo Toturi\'s Tainted Token and gain 1 honor');
        });
    });
});
