describe('Steed of the Steppes', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan'],
                    hand: ['steed-of-the-steppes']
                },
                player2: {
                }
            });

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.steed = this.player1.findCardByName('steed-of-the-steppes');

            this.p1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.p2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.p4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.pStronghold = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.p1.facedown = true;
            this.p2.facedown = true;
            this.p3.facedown = true;
            this.p4.facedown = true;
            this.pStronghold.facedown = true;
        });

        it('should grant Cavalry', function() {
            expect(this.kuwanan.hasTrait('cavalry')).toBe(false);
            this.player1.playAttachment(this.steed, this.kuwanan);
            expect(this.kuwanan.hasTrait('cavalry')).toBe(true);
        });

        it('should ready the attached character when opponent has  at least 3 faceup provinces', function() {
            this.player1.playAttachment(this.steed, this.kuwanan);
            this.kuwanan.bowed = true;
            this.player2.pass();

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.steed);
            expect(this.player1).toHavePrompt('Action Window');
            this.p1.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.steed);
            expect(this.player1).toHavePrompt('Action Window');
            this.p2.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.steed);
            expect(this.player1).toHavePrompt('Action Window');
            this.p3.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.steed);
            expect(this.kuwanan.bowed).toBe(false);
            expect(this.steed.location).toBe('conflict discard pile');
            expect(this.getChatLogs(1)).toContain('player1 uses Steed of the Steppes, sacrificing Steed of the Steppes to ready Doji Kuwanan');
        });
    });
});
