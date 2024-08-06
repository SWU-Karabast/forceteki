describe('Darkflame Purifier', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-whisperer', 'doji-challenger'],
                    hand: ['invocation-of-ash']
                },
                player2: {
                    inPlay: ['darkflame-purifier']
                }
            });

            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.challenger.fate = 3;
            this.invocation = this.player1.findCardByName('invocation-of-ash');

            this.darkflamePurifier = this.player2.findCardByName('darkflame-purifier');
            this.darkflamePurifier.fate = 1;

            this.player1.playAttachment(this.invocation, this.whisperer);
            this.player2.pass();
        });

        it('does not react during fate phase', function () {
            this.flow.finishConflictPhase();
            this.player1.clickPrompt('Done');

            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).not.toBeAbleToSelect(this.darkflamePurifier);
        });

        it('reacts when an opponents character loses fate', function () {
            this.player1.clickCard(this.invocation);
            this.player1.clickCard(this.challenger);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.darkflamePurifier);
        });

        it('chooses any character', function () {
            this.player1.clickCard(this.invocation);
            this.player1.clickCard(this.challenger);
            this.player2.clickCard(this.darkflamePurifier);

            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).toBeAbleToSelect(this.darkflamePurifier);
            expect(this.player2).toBeAbleToSelect(this.whisperer);
        });

        it('dishonors a character', function () {
            this.player1.clickCard(this.invocation);
            this.player1.clickCard(this.challenger);
            this.player2.clickCard(this.darkflamePurifier);
            this.player2.clickCard(this.challenger);

            expect(this.challenger.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 uses Darkflame Purifier to dishonor Doji Challenger');
        });
    });
});