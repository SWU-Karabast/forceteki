describe('Belief in the Little Teacher', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 11,
                    inPlay: ['doji-challenger'],
                    hand: ['belief-in-the-little-teacher']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.belief = this.player1.findCardByName('belief-in-the-little-teacher');
            this.player1.playAttachment(this.belief, this.challenger);
            this.player2.pass();
        });

        it('should grant the ability to the attached character and discard the attached character\'s honored token', function() {
            this.challenger.honor();
            expect(this.challenger.isHonored).toBe(true);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.belief);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.challenger);
            expect(this.challenger.isHonored).toBe(false);
            expect(this.getChatLogs(3)).toContain('player1 uses Doji Challenger\'s gained ability from Belief in the Little Teacher to discard a status token from Doji Challenger');
        });

        it('allow you to choose which token to discard', function() {
            this.challenger.honor();
            this.challenger.taint();

            expect(this.challenger.isHonored).toBe(true);
            expect(this.challenger.isTainted).toBe(true);
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Which token do you wish to discard?');
            expect(this.player1).toHavePromptButton('Honored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');
            this.player1.clickPrompt('Tainted Token');

            expect(this.challenger.isHonored).toBe(true);
            expect(this.challenger.isTainted).toBe(false);
            expect(this.getChatLogs(3)).toContain('player1 uses Doji Challenger\'s gained ability from Belief in the Little Teacher to discard a status token from Doji Challenger');
            expect(this.getChatLogs(5)).toContain('player1 discards Tainted Token');
        });

        it('should grant the ability to the attached character and discard the attached character\'s dishonored token', function() {
            this.challenger.dishonor();
            expect(this.challenger.isDishonored).toBe(true);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.belief);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.challenger);
            expect(this.challenger.isDishonored).toBe(false);
            expect(this.getChatLogs(3)).toContain('player1 uses Doji Challenger\'s gained ability from Belief in the Little Teacher to discard a status token from Doji Challenger');
        });

    });
});
