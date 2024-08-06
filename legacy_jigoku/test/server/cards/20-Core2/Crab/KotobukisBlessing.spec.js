describe('Kotobuki\'s Blessing', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['brash-samurai', 'doji-whisperer'],
                    hand: ['fine-katana', 'a-new-name', 'ornate-fan', 'kotobuki-s-blessing']
                },
                player2: {
                    inPlay: ['togashi-yokuni']
                }
            });
            this.brash = this.player1.findCardByName('brash-samurai');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.katana = this.player1.findCardByName('fine-katana');
            this.ann = this.player1.findCardByName('a-new-name');
            this.blessing = this.player1.findCardByName('kotobuki-s-blessing');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.yokuni = this.player2.findCardByName('togashi-yokuni');

            this.player1.playAttachment(this.fan, this.whisperer);
            this.player2.pass();
        });

        it('should put a fate on a character you control and prompt to discard attachment (discard)', function () {
            let fate = this.brash.fate;

            this.player1.playAttachment(this.katana, this.brash);
            this.player2.pass();
            this.player1.playAttachment(this.ann, this.brash);
            this.player2.pass();
            this.player1.clickCard(this.blessing);

            expect(this.player1).toBeAbleToSelect(this.brash);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.yokuni);

            this.player1.clickCard(this.brash);

            expect(this.brash.fate).toBe(fate + 1);
            expect(this.player1).toHavePrompt('Choose up to 1 attachment');
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.ann);
            expect(this.player1).not.toBeAbleToSelect(this.fan);
            expect(this.player1).toHavePromptButton('Done');

            this.player1.clickCard(this.katana);
            this.player1.clickPrompt('Done');
            expect(this.katana.location).toBe('conflict discard pile');
            expect(this.player2).toHavePrompt('Action Window');
            expect(this.getChatLogs(5)).toContain('player1 plays Kotobuki\'s Blessing to place 1 fate on Brash Samurai');
            expect(this.getChatLogs(5)).toContain('player1 chooses to discard Fine Katana from Brash Samurai');
        });
 
        it('should put a fate and prompt to discard attachment (no discard)', function () {
            let fate = this.brash.fate;

            this.player1.playAttachment(this.katana, this.brash);
            this.player2.pass();
            this.player1.playAttachment(this.ann, this.brash);
            this.player2.pass();
            this.player1.clickCard(this.blessing);
            this.player1.clickCard(this.brash);

            expect(this.brash.fate).toBe(fate + 1);
            expect(this.player1).toHavePrompt('Choose up to 1 attachment');
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.ann);
            expect(this.player1).not.toBeAbleToSelect(this.fan);
            expect(this.player1).toHavePromptButton('Done');

            this.player1.clickPrompt('Done');
            expect(this.player2).toHavePrompt('Action Window');
            expect(this.katana.parent).toBe(this.brash);
            expect(this.ann.parent).toBe(this.brash);
            expect(this.getChatLogs(5)).toContain('player1 plays Kotobuki\'s Blessing to place 1 fate on Brash Samurai');
        });

        it('target has no attachments', function () {
            let fate = this.brash.fate;

            this.player1.clickCard(this.blessing);
            this.player1.clickCard(this.brash);

            expect(this.brash.fate).toBe(fate + 1);
            expect(this.player1).not.toHavePrompt('Choose up to 1 attachment');
            expect(this.player2).toHavePrompt('Action Window');
            expect(this.getChatLogs(5)).toContain('player1 plays Kotobuki\'s Blessing to place 1 fate on Brash Samurai');
        });
    });
});
