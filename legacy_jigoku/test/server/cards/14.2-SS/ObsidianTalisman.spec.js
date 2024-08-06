describe('Obsidian Talisman', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 11,
                    inPlay: ['doji-challenger'],
                    hand: ['way-of-the-crane', 'obsidian-talisman']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.obsidianTalisman = this.player1.findCardByName('obsidian-talisman');
            this.wayCrane = this.player1.findCardByName('way-of-the-crane');
            this.player1.playAttachment(this.obsidianTalisman, this.challenger);
            this.player2.pass();
        });

        it('allow you to discard the attached character\'s status token for 1 honor', function() {
            this.challenger.honor();

            this.preTalismanHonor = this.player1.honor;

            expect(this.challenger.isHonored).toBe(true);
            expect(this.obsidianTalisman.parent).toBe(this.challenger);
            this.player1.clickCard(this.obsidianTalisman);
            expect(this.challenger.isHonored).toBe(false);
            expect(this.player1.honor).toBe(this.preTalismanHonor - 1);
        });

        it('allow you to choose which token to discard', function() {
            this.challenger.honor();
            this.challenger.taint();

            expect(this.challenger.isHonored).toBe(true);
            expect(this.challenger.isTainted).toBe(true);
            this.player1.clickCard(this.obsidianTalisman);
            expect(this.player1).toHavePrompt('Which token do you wish to discard?');
            expect(this.player1).toHavePromptButton('Honored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');
            this.player1.clickPrompt('Tainted Token');

            expect(this.challenger.isHonored).toBe(true);
            expect(this.challenger.isTainted).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 uses Obsidian Talisman, losing 1 honor to discard a status token from Doji Challenger');
            expect(this.getChatLogs(5)).toContain('player1 discards Tainted Token');
        });

        it('allow you to use it while you can pay the honor', function() {
            for(let x = 0; x < this.player1.honor; x++) {
                this.preTalismanHonor = this.player1.honor;
                this.challenger.honor();
                expect(this.challenger.isHonored).toBe(true);
                expect(this.obsidianTalisman.parent).toBe(this.challenger);
                this.player1.clickCard(this.obsidianTalisman);
                expect(this.challenger.isHonored).toBe(false);
                expect(this.player1.honor).toBe(this.preTalismanHonor - 1);
                this.player2.pass();
            }
        });
    });
});
