describe('Shiro Yogo', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'draw',
                player1: {
                    stronghold: 'shiro-yogo',
                    inPlay: ['soshi-illusionist', 'bayushi-liar']
                },
                player2: {
                    inPlay: ['adept-of-shadows', 'beloved-advisor', 'doji-challenger']
                }
            });
            this.yogo = this.player1.findCardByName('shiro-yogo');
            this.liar = this.player1.findCardByName('bayushi-liar');
            this.illusionist = this.player1.findCardByName('soshi-illusionist');
            this.adept = this.player2.findCardByName('adept-of-shadows');
            this.advisor = this.player2.findCardByName('beloved-advisor');
            this.challenger = this.player2.findCardByName('doji-challenger');

            this.illusionist.dishonor();
            this.adept.dishonor();
            this.advisor.honor();
            this.challenger.taint();
            this.game.checkGameState(true);

            this.player1.player.promptedActionWindows.draw = true;
            this.player2.player.promptedActionWindows.draw = true;

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
        });

        it('should prompt to choose a dishonored character', function() {
            this.player1.clickCard(this.yogo);
            expect(this.player1).not.toBeAbleToSelect(this.liar);
            expect(this.player1).toBeAbleToSelect(this.illusionist);
            expect(this.player1).toBeAbleToSelect(this.adept);
            expect(this.player1).not.toBeAbleToSelect(this.advisor);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
        });

        it('should prevent the chosen character from triggering their abilities - self', function() {
            this.player1.clickCard(this.yogo);
            this.player1.clickCard(this.illusionist);
            this.player2.pass();
            expect(this.yogo.bowed).toBe(true);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.illusionist);
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.getChatLogs(5)).toContain('player1 uses Shiro Yogo, bowing Shiro Yogo to prevent Soshi Illusionist from triggering their abilities until the end of the phase');
        });

        it('should prevent the chosen character from triggering their abilities - opponent', function() {
            this.player1.clickCard(this.yogo);
            this.player1.clickCard(this.adept);
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.clickCard(this.adept);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should expire at the end of the phase', function() {
            this.player1.clickCard(this.yogo);
            this.player1.clickCard(this.illusionist);
            this.player2.pass();
            expect(this.yogo.bowed).toBe(true);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.illusionist);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.pass();

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.illusionist);
            expect(this.player1).toHavePrompt('Soshi Illusionist');
        });
    });
});
