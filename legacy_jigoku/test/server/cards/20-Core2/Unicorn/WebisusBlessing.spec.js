describe('Webisus Blessing', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-whisperer', 'solemn-scholar'],
                    hand: ['webisu-s-blessing']
                },
                player2: {
                    inPlay: ['doji-kuwanan']
                }
            });

            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.scholar = this.player1.findCardByName('solemn-scholar');
            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.blessing = this.player1.findCardByName('webisu-s-blessing');

            this.whisperer.dishonor();
            this.whisperer.taint();
            this.kuwanan.honor();
        });

        it('select two tokens and discard', function () {
            this.player1.clickCard(this.blessing);

            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.kuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.scholar);

            this.player1.clickCard(this.whisperer);
            expect(this.player1).toHavePrompt('Which token do you wish to select?');
            expect(this.player1).toHavePromptButton('Dishonored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');

            this.player1.clickPrompt('Tainted Token');

            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.kuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.scholar);

            this.player1.clickCard(this.kuwanan);
            expect(this.getChatLogs(10)).toContain(
                "player1 plays Webisu's Blessing to discard Doji Whisperer's Tainted Token and Doji Kuwanan's Honored Token"
            );
        });

        it('two tokens from the same character', function () {
            this.player1.clickCard(this.blessing);

            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.kuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.scholar);

            this.player1.clickCard(this.whisperer);
            expect(this.player1).toHavePrompt('Which token do you wish to select?');
            expect(this.player1).toHavePromptButton('Dishonored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');

            this.player1.clickPrompt('Tainted Token');
            this.player1.clickCard(this.whisperer);
            expect(this.getChatLogs(10)).toContain(
                "player1 plays Webisu's Blessing to discard Doji Whisperer's Tainted Token and Doji Whisperer's Dishonored Token"
            );
        });

        it('only one token', function () {
            this.player1.clickCard(this.blessing);

            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.kuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.scholar);
            expect(this.player1).not.toHavePromptButton('Done');

            this.player1.clickCard(this.whisperer);
            expect(this.player1).toHavePrompt('Which token do you wish to select?');
            expect(this.player1).toHavePromptButton('Dishonored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');

            this.player1.clickPrompt('Tainted Token');

            expect(this.player1).toHavePromptButton('Done');
            this.player1.clickPrompt('Done');

            expect(this.getChatLogs(10)).toContain(
                "player1 plays Webisu's Blessing to discard Doji Whisperer's Tainted Token"
            );
        });
    });
});
