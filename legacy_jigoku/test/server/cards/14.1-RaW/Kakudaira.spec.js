describe('Kakudaira', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    dynastyDiscard: ['doji-challenger', 'doji-whisperer'],
                    provinces: ['kakudaira']
                },
                player2: {
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.kakudaira = this.player1.findCardByName('kakudaira');
            this.kakudaira.facedown = false;
        });

        it('should turn faceup at the start of the draw phase', function() {
            this.player1.placeCardInProvince(this.challenger, this.kakudaira.location);
            this.challenger.facedown = true;
            this.player1.player.promptedActionWindows.draw = true;
            this.player2.player.promptedActionWindows.draw = true;
            this.noMoreActions();
            expect(this.game.currentPhase).toBe('draw');
            expect(this.challenger.facedown).toBe(false);
            expect(this.getChatLogs(3)).toContain('player1 reveals Doji Challenger due to the constant effect of Kakudaira');
        });

        it('should turn faceup at the start of the conflict phase', function() {
            this.player1.player.promptedActionWindows.draw = true;
            this.player2.player.promptedActionWindows.draw = true;
            this.noMoreActions();
            expect(this.game.currentPhase).toBe('draw');
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            this.player1.placeCardInProvince(this.challenger, this.kakudaira.location);
            this.challenger.facedown = true;
            expect(this.game.currentPhase).toBe('draw');
            this.noMoreActions();
            expect(this.game.currentPhase).toBe('conflict');
            expect(this.challenger.facedown).toBe(false);
            expect(this.getChatLogs(3)).toContain('player1 reveals Doji Challenger due to the constant effect of Kakudaira');
        });

        it('should turn faceup at the start of the fate phase', function() {
            this.noMoreActions();
            expect(this.game.currentPhase).toBe('draw');
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.game.currentPhase).toBe('conflict');
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.placeCardInProvince(this.challenger, this.kakudaira.location);
            this.challenger.facedown = true;
            this.noMoreActions();
            this.noMoreActions();
            this.noMoreActions();
            this.noMoreActions();
            this.noMoreActions();

            expect(this.game.currentPhase).toBe('fate');
            expect(this.challenger.facedown).toBe(false);
            expect(this.getChatLogs(3)).toContain('player1 reveals Doji Challenger due to the constant effect of Kakudaira');
        });

        it('should not turn faceup if the province is broken', function() {
            this.kakudaira.isBroken = true;
            this.player1.placeCardInProvince(this.challenger, this.kakudaira.location);
            this.challenger.facedown = true;
            this.player1.player.promptedActionWindows.draw = true;
            this.player2.player.promptedActionWindows.draw = true;
            this.noMoreActions();
            expect(this.game.currentPhase).toBe('draw');
            expect(this.challenger.facedown).toBe(true);
        });

        it('should turn all cards faceup', function() {
            this.player1.placeCardInProvince(this.challenger, this.kakudaira.location);
            this.player1.moveCard(this.whisperer, this.kakudaira.location);
            this.challenger.facedown = true;
            this.whisperer.facedown = true;
            this.player1.player.promptedActionWindows.draw = true;
            this.player2.player.promptedActionWindows.draw = true;
            this.noMoreActions();
            expect(this.game.currentPhase).toBe('draw');
            expect(this.challenger.facedown).toBe(false);
            expect(this.whisperer.facedown).toBe(false);
            expect(this.getChatLogs(3)).toContain('player1 reveals Doji Challenger and Doji Whisperer due to the constant effect of Kakudaira');
        });

    });
});
