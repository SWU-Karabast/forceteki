describe('Yogo Paramour', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    inPlay: ['kakita-yoshi', 'yogo-paramour']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-challenger']
                }
            });

            this.paramour = this.player1.findCardByName('yogo-paramour');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.challenger = this.player2.findCardByName('doji-challenger');
        });

        it('should work outside of conflicts', function() {
            expect(this.player1).toHavePrompt('Play cards from provinces');
            this.player1.clickCard(this.paramour);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.dojiWhisperer);
            expect(this.paramour.bowed).toBe(true);
            expect(this.dojiWhisperer.isDishonored).toBe(true);
            expect(this.getChatLogs(10)).toContain('player1 uses Yogo Paramour, bowing Yogo Paramour to dishonor Doji Whisperer');
        });

        it('should not work if it\'s not dire', function() {
            this.paramour.fate = 5;
            this.game.checkGameState(true);

            expect(this.player1).toHavePrompt('Play cards from provinces');
            this.player1.clickCard(this.paramour);
            expect(this.player1).toHavePrompt('Play cards from provinces');
        });

        it('should work on a friendly character', function() {
            expect(this.player1).toHavePrompt('Play cards from provinces');
            this.player1.clickCard(this.paramour);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.yoshi);
            expect(this.paramour.bowed).toBe(true);
            expect(this.yoshi.isDishonored).toBe(true);
        });
    });
});
