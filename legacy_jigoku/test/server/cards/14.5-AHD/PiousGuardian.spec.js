describe('Pious Guardian', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['pious-guardian']
                },
                player2: {
                    inPlay: ['masterpiece-painter']
                }
            });

            this.player1.player.promptedActionWindows.fate = true;
            this.player2.player.promptedActionWindows.fate = true;

            this.pious = this.player1.findCardByName('pious-guardian');
            this.painter = this.player2.findCardByName('masterpiece-painter');

            this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.painter.fate = 10;
            this.pious.fate = 10;

            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.passConflict();
        });

        it('should trigger at the end of the conflict phase if you have no broken provinces', function() {
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.pious);
        });

        it('should gain 1 honor', function() {
            let honor = this.player1.honor;
            this.noMoreActions();
            this.player1.clickCard(this.pious);
            expect(this.player1.honor).toBe(honor + 1);
        });

        it('should trigger at the end of the conflict phase if you have 1 broken province', function() {
            this.sd1.isBroken = true;
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.pious);
        });

        it('should not trigger if you have 2 broken provinces', function() {
            this.sd1.isBroken = true;
            this.sd2.isBroken = true;
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
