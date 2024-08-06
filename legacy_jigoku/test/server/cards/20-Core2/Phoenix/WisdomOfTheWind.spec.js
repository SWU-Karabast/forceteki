describe('Wisdom of the Wind', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kudaka', 'miya-mystic'],
                    hand: ['wisdom-of-the-wind']
                }
            });

            this.kudaka = this.player1.findCardByName('kudaka');
            this.mystic = this.player1.findCardByName('miya-mystic');
            this.wisdomOfTheWind = this.player1.findCardByName('wisdom-of-the-wind');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kudaka, this.mystic],
                defenders: [],
                type: 'political',
                ring: 'void'
            });
            this.player2.pass();
        });

        describe('without affinity', function () {
            beforeEach(function () {
                this.player1.moveCard(this.kudaka, 'dynasty discard pile');
            });

            it('honors a character', function () {
                this.player1.clickCard(this.wisdomOfTheWind);
                expect(this.player1).toHavePrompt('Choose a character');

                this.player1.clickCard(this.mystic);
                expect(this.getChatLogs(5)).toContain(
                    'player1 plays Wisdom of the Wind to honor or dishonor Miya Mystic'
                );
                expect(this.player1).toHavePrompt('Select an action:');
                expect(this.player1).toHavePromptButton('Honor this character');
                expect(this.player1).toHavePromptButton('Dishonor this character');

                this.player1.clickPrompt('Honor this character');
                expect(this.mystic.isHonored).toBe(true);
                expect(this.getChatLogs(5)).toContain('player1 chooses to honor Miya Mystic');
            });

            it('dishonors a character', function () {
                this.player1.clickCard(this.wisdomOfTheWind);
                expect(this.player1).toHavePrompt('Choose a character');

                this.player1.clickCard(this.mystic);
                expect(this.getChatLogs(5)).toContain(
                    'player1 plays Wisdom of the Wind to honor or dishonor Miya Mystic'
                );
                expect(this.player1).toHavePrompt('Select an action:');
                expect(this.player1).toHavePromptButton('Honor this character');
                expect(this.player1).toHavePromptButton('Dishonor this character');

                this.player1.clickPrompt('Dishonor this character');
                expect(this.mystic.isDishonored).toBe(true);
                expect(this.getChatLogs(5)).toContain('player1 chooses to dishonor Miya Mystic');
            });
        });

        describe('with affinity', function () {
            beforeEach(function () {
                this.kudaka.honor();
            });

            it('ignores other status tokens', function () {
                this.player1.clickCard(this.wisdomOfTheWind);
                expect(this.player1).toHavePrompt('Choose a character');

                this.player1.clickCard(this.mystic);
                expect(this.getChatLogs(5)).toContain(
                    'player1 plays Wisdom of the Wind to honor or dishonor Miya Mystic'
                );
                expect(this.player1).toHavePrompt('Select an action:');
                expect(this.player1).toHavePromptButton('Honor this character');
                expect(this.player1).toHavePromptButton('Dishonor this character');

                this.player1.clickPrompt('Honor this character');
                expect(this.mystic.isHonored).toBe(true);
                expect(this.getChatLogs(5)).toContain('player1 chooses to honor Miya Mystic');
                expect(this.player1).toHavePrompt('Make other status tokens be ignored?');
                expect(this.player1).toHavePromptButton('Yes');
                expect(this.player1).toHavePromptButton('No');

                this.player1.clickPrompt('Yes');
                expect(this.kudaka.getMilitarySkill()).toBe(3);
                expect(this.kudaka.getPoliticalSkill()).toBe(4);
                expect(this.mystic.getMilitarySkill()).toBe(2);
                expect(this.mystic.getPoliticalSkill()).toBe(2);
                expect(this.getChatLogs(5)).toContain(
                    'player1 channels their air affinity to make all other status be ignored during this conflict'
                );
            });
        });
    });
});