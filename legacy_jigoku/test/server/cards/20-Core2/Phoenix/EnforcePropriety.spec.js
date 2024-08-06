describe('Enforce Propriety', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-berserker', 'kitsu-spiritcaller'],
                    hand: ['a-perfect-cut']
                },
                player2: {
                    inPlay: ['adept-of-the-waves'],
                    hand: ['enforce-propriety']
                }
            });

            this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
            this.spiritcallerBowed = this.player1.findCardByName('kitsu-spiritcaller');
            this.spiritcallerBowed.bow();

            this.perfectCut = this.player1.findCardByName('a-perfect-cut');
            this.enforcePropriety = this.player2.findCardByName('enforce-propriety');
            this.adeptOfTheWaves = this.player2.findCardByName('adept-of-the-waves');

            this.noMoreActions();
        });

        it('tax events', function () {
            const initialFateP1 = this.player1.fate;
            const initialFateP2 = this.player2.fate;
            this.initiateConflict({
                type: 'military',
                attackers: [this.matsuBerserker],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.perfectCut);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.enforcePropriety);

            this.player2.clickCard(this.enforcePropriety);
            expect(this.getChatLogs(5)).toContain('player2 plays Enforce Propriety to enforce the proper protocol');
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('Give 1 fate to player2');
            expect(this.player1).toHavePromptButton('Let the effects be canceled');

            this.player1.clickPrompt('Give 1 fate to player2');
            expect(this.player1.fate).toBe(initialFateP1 - 1);
            expect(this.player2.fate).toBe(initialFateP2 + 1);
            expect(this.matsuBerserker.getMilitarySkill()).toBe(5);
            expect(this.getChatLogs(5)).toContain(
                'player1 gives 1 fate to player2 - the fortunes will be appeased, order is maintained'
            );
        });

        it('cancel events', function () {
            const initialFateP1 = this.player1.fate;
            const initialFateP2 = this.player2.fate;
            this.initiateConflict({
                type: 'military',
                attackers: [this.matsuBerserker],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.perfectCut);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.enforcePropriety);

            this.player2.clickCard(this.enforcePropriety);
            expect(this.getChatLogs(5)).toContain('player2 plays Enforce Propriety to enforce the proper protocol');
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('Give 1 fate to player2');
            expect(this.player1).toHavePromptButton('Let the effects be canceled');

            this.player1.clickPrompt('Let the effects be canceled');
            expect(this.player1.fate).toBe(initialFateP1);
            expect(this.player2.fate).toBe(initialFateP2);
            expect(this.matsuBerserker.getMilitarySkill()).toBe(3);
            expect(this.getChatLogs(5)).toContain(
                'player1 refuses to appease the fortunes - the effects of A Perfect Cut are canceled'
            );
        });
    });
});
