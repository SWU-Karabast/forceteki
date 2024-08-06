describe('Kami of Ancient Wisdom', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kami-of-ancient-wisdom', 'doji-challenger'],
                    hand: ['invocation-of-ash']
                },
                player2: {
                    inPlay: ['doji-whisperer']
                }
            });

            this.kami = this.player1.findCardByName('kami-of-ancient-wisdom');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.challenger.fate = 3;

            this.whisperer = this.player2.findCardByName('doji-whisperer');

            this.invocation = this.player1.findCardByName('invocation-of-ash');
            this.player1.playAttachment(this.invocation, this.kami);
            this.player2.pass();
        });

        it('should react when someone loses fate', function() {
            this.player1.clickCard(this.invocation);
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.kami);
        });

        it('should let you pick a character', function() {
            this.player1.clickCard(this.invocation);
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.kami);

            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.kami);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
        });

        it('should let you pick to give or take a fate', function() {
            this.player1.clickCard(this.invocation);
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.kami);
            this.player1.clickCard(this.challenger);

            expect(this.player1).toHavePromptButton('Place 1 Fate');
            expect(this.player1).toHavePromptButton('Remove 1 Fate');
        });

        it('should give fate', function() {
            this.player1.clickCard(this.invocation);
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.kami);
            this.player1.clickCard(this.challenger);

            let fate = this.challenger.fate;

            expect(this.player1).toHavePromptButton('Place 1 Fate');
            expect(this.player1).toHavePromptButton('Remove 1 Fate');

            this.player1.clickPrompt('Place 1 Fate');
            expect(this.challenger.fate).toBe(fate + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Kami of Ancient Wisdom to place 1 fate on Doji Challenger');
        });

        it('should take fate', function() {
            this.player1.clickCard(this.invocation);
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.kami);
            this.player1.clickCard(this.challenger);

            let fate = this.challenger.fate;

            expect(this.player1).toHavePromptButton('Place 1 Fate');
            expect(this.player1).toHavePromptButton('Remove 1 Fate');

            this.player1.clickPrompt('Remove 1 Fate');
            expect(this.challenger.fate).toBe(fate - 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Kami of Ancient Wisdom to remove 1 fate from Doji Challenger');
        });

        it('should not give you a choice if character has no fate', function() {
            let fate = this.kami.fate;

            this.player1.clickCard(this.invocation);
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.kami);
            this.player1.clickCard(this.kami);

            this.player1.clickPrompt('Place 1 Fate');

            expect(this.kami.fate).toBe(fate + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Kami of Ancient Wisdom to place 1 fate on Kami of Ancient Wisdom');
        });
    });
});
