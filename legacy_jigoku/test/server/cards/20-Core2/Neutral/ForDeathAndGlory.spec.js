describe('For Death and Glory', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['miya-mystic'],
                    hand: ['for-death-and-glory-']
                },
                player2: {
                    inPlay: ['doji-kuwanan']
                }
            });

            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.kuwanan.honor();
            this.miyaMystic = this.player1.findCardByName('miya-mystic');
            this.forDeathAndGlory = this.player1.findCardByName('for-death-and-glory-');
            this.noMoreActions();
        });

        it('should let you choose +2 or +4 and discard', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.miyaMystic],
                defenders: [this.kuwanan]
            });
            this.player2.pass();
            this.player1.clickCard(this.forDeathAndGlory);
            this.player1.clickCard(this.miyaMystic);

            expect(this.player1).toHavePrompt('For Death and Glory!');
            expect(this.player1).toHavePromptButton('Gain +2 skill');
            expect(this.player1).toHavePromptButton('Gain +4 skill, and get discarded when the conflict ends');
        });

        it('choosing +2', function () {
            let skill = this.miyaMystic.getMilitarySkill();

            this.initiateConflict({
                type: 'military',
                attackers: [this.miyaMystic],
                defenders: [this.kuwanan]
            });
            this.player2.pass();
            this.player1.clickCard(this.forDeathAndGlory);
            this.player1.clickCard(this.miyaMystic);

            expect(this.player1).toHavePrompt('For Death and Glory!');
            this.player1.clickPrompt('Gain +2 skill');

            expect(this.miyaMystic.getMilitarySkill()).toBe(skill + 2);
            this.noMoreActions();
            expect(this.miyaMystic.bowed).toBe(true);
            expect(this.miyaMystic.location).toBe('play area');
            expect(this.getChatLogs(10)).toContain(
                'player1 plays For Death and Glory! to grant 2 military skill to Miya Mystic'
            );
        });

        it('choosing +4', function () {
            let skill = this.miyaMystic.getMilitarySkill();

            this.initiateConflict({
                type: 'military',
                attackers: [this.miyaMystic],
                defenders: [this.kuwanan]
            });
            this.player2.pass();
            this.player1.clickCard(this.forDeathAndGlory);
            this.player1.clickCard(this.miyaMystic);

            expect(this.player1).toHavePrompt('For Death and Glory!');
            this.player1.clickPrompt('Gain +4 skill, and get discarded when the conflict ends');

            expect(this.miyaMystic.getMilitarySkill()).toBe(skill + 4);
            this.noMoreActions();
            expect(this.miyaMystic.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(10)).toContain(
                'player1 plays For Death and Glory! to grant 4 military skill to Miya Mystic, sacrificing them at the end of the conflict'
            );
            expect(this.getChatLogs(10)).toContain(
                'Miya Mystic is discarded from play due to the delayed effect of For Death and Glory!'
            );
        });
    });
});