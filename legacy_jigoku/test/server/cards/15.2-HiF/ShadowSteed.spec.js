describe('Shadow Steed', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan', 'doji-whisperer'],
                    hand: ['shadow-steed'],
                    honor: 10
                },
                player2: {
                }
            });

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.kuwanan.fate = 1;
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.whisperer.fate = 1;
            this.steed = this.player1.findCardByName('shadow-steed');

        });

        it('should grant Cavalry', function() {
            expect(this.kuwanan.hasTrait('cavalry')).toBe(false);
            this.player1.playAttachment(this.steed, this.kuwanan);
            this.player1.clickCard(this.kuwanan);
            this.player1.clickPrompt('1');
            expect(this.kuwanan.hasTrait('cavalry')).toBe(true);
        });

        it('should ready the attached character when it has no fate on it ', function() {
            this.player1.playAttachment(this.steed, this.kuwanan);
            this.player1.clickCard(this.kuwanan);
            this.player1.clickPrompt('1');
            this.kuwanan.bowed = true;
            this.player2.pass();
            this.player1.clickCard(this.steed);
            expect(this.kuwanan.bowed).toBe(false);
            expect(this.getChatLogs(1)).toContain('player1 uses Shadow Steed, losing 1 honor to ready Doji Kuwanan');
            expect(this.player1.honor).toBe(9);
        });

        it('should not ready the attached character when it has no fate on it ', function() {
            this.player1.playAttachment(this.steed, this.kuwanan);
            this.player1.clickCard(this.whisperer);
            this.player1.clickPrompt('1');
            this.kuwanan.bowed = true;
            this.player2.pass();
            this.player1.clickCard(this.steed);
            expect(this.player1).toHavePrompt('Action Window');
        });

    });
});
