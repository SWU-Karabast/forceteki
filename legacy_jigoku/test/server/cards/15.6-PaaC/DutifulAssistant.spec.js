describe('Dutiful Assistant', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi'],
                    hand: ['dutiful-assistant']
                },
                player2: {
                    inPlay: ['bayushi-liar']
                }
            });
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.assistant = this.player1.findCardByName('dutiful-assistant');
            this.player1.playAttachment(this.assistant, this.yoshi);
            this.glory = this.yoshi.getGlory();
        });

        it('should not give the attached character +2 glory when neutral', function() {
            expect(this.yoshi.getGlory()).toBe(this.glory);
        });

        it('should not give the attached character +2 glory when dishonored', function() {
            this.yoshi.dishonor();
            this.game.checkGameState(true);
            expect(this.yoshi.getGlory()).toBe(this.glory);
        });

        it('should give the attached character +2 glory when honored', function() {
            this.yoshi.honor();
            this.game.checkGameState(true);
            expect(this.yoshi.getGlory()).toBe(this.glory + 2);
            expect(this.yoshi.getPoliticalSkill()).toBe(this.yoshi.printedPoliticalSkill + this.glory + 2);
        });
    });
});
