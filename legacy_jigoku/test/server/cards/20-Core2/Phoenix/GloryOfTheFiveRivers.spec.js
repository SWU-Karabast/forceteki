describe('Glory of the Five Rivers', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['glory-of-the-five-rivers'],
                    inPlay: ['fire-tensai-initiate', 'solemn-scholar', 'seppun-truthseeker']
                },
                player2: {
                    inPlay: ['brash-samurai', 'doji-whisperer']
                }
            });

            this.collectionOfAlms = this.player1.findCardByName('glory-of-the-five-rivers');
            this.fireTensai = this.player1.findCardByName('fire-tensai-initiate');
            this.solemn = this.player1.findCardByName('solemn-scholar');

            this.brash = this.player2.findCardByName('brash-samurai');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
        });

        it('does a thing', function () {
            const p1InitialFate = this.player1.fate;
            const p2InitialFate = this.player2.fate;

            this.player1.clickCard(this.collectionOfAlms);
            expect(this.player1).toHavePrompt('Choose an amount of fate');
            expect(this.player1).toHavePromptButton('0');
            expect(this.player1).toHavePromptButton('1');
            expect(this.player1).toHavePromptButton('2');
            expect(this.player1).toHavePromptButton('3');
            expect(this.player1).toHavePromptButton('4');
            expect(this.player1).toHavePromptButton('5');
            expect(this.player1).toHavePromptButton('6');
            expect(this.player1).toHavePromptButton('7');
            expect(this.player1).toHavePromptButton('8');
            expect(this.player2).toHavePrompt('Choose an amount of fate');
            expect(this.player2).toHavePromptButton('0');
            expect(this.player2).toHavePromptButton('1');
            expect(this.player2).toHavePromptButton('2');
            expect(this.player2).toHavePromptButton('3');
            expect(this.player2).toHavePromptButton('4');
            expect(this.player2).toHavePromptButton('5');
            expect(this.player2).toHavePromptButton('6');
            expect(this.player2).toHavePromptButton('7');
            expect(this.player2).not.toHavePromptButton('8');

            this.player1.clickPrompt('0');
            this.player2.clickPrompt('2');

            expect(this.player1.fate).toBe(p1InitialFate - 0);
            expect(this.player2.fate).toBe(p2InitialFate - 2);
            expect(this.getChatLogs(5)).toContain('player1 plays Glory of the Five Rivers to collect offerings');
            expect(this.getChatLogs(5)).toContain('player1 spends 0 fate');
            expect(this.getChatLogs(5)).toContain('player2 spends 2 fate');

            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).not.toBeAbleToSelect(this.fireTensai);
            expect(this.player2).not.toBeAbleToSelect(this.solemn);
            expect(this.player2).toBeAbleToSelect(this.brash);
            expect(this.player2).toBeAbleToSelect(this.whisperer);

            this.player2.clickCard(this.brash);

            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.fireTensai);
            expect(this.player1).toBeAbleToSelect(this.solemn);
            expect(this.player1).not.toBeAbleToSelect(this.brash);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            this.player1.clickCard(this.solemn);

            expect(this.brash.isHonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 honors Brash Samurai');
            expect(this.solemn.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 dishonors Solemn Scholar');
        });
    });
});
