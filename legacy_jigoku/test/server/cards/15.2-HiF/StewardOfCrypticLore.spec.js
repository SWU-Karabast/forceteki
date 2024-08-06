describe('Steward of Cryptic Lore', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['chronicler-of-conquests'],
                    hand: ['total-warfare', 'way-with-words'],
                    dynastyDiscard: ['borderlands-fortifications'],
                    provinces: ['dishonorable-assault']
                },
                player2: {
                    inPlay: ['steward-of-cryptic-lore'],
                    hand: ['assassination', 'justicar-s-approach'],
                    provinces: ['fertile-fields']
                }
            });

            this.chronicler = this.player1.findCardByName('chronicler-of-conquests');
            this.assault = this.player1.findCardByName('dishonorable-assault');
            this.fortification = this.player1.findCardByName('borderlands-fortifications');
            this.words = this.player1.findCardByName('way-with-words');
            this.chronicler.honor();

            this.fields = this.player2.findCardByName('fertile-fields');
            this.steward = this.player2.findCardByName('steward-of-cryptic-lore');
            this.totalWarfare = this.player1.findCardByName('total-warfare');
            this.assassination = this.player2.findCardByName('assassination');
            this.approach = this.player2.findCardByName('justicar-s-approach');

        });

        it('should be useable when opponent attacks earth', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'earth',
                province: this.fields,
                attackers: [this.chronicler],
                defenders: []
            });
            this.player2.clickCard(this.steward);
            expect(this.player2).toHavePromptButton('Raise attacked province\'s strength by 3');
            expect(this.player2).toHavePromptButton('Lower attacked province\'s strength by 3');
            this.player2.clickPrompt('Raise attacked province\'s strength by 3');
            expect(this.fields.getStrength()).toBe(7);
            expect(this.getChatLogs(10)).toContain('player2 uses Steward of Cryptic Lore to change the province strength of an attacked province');
            expect(this.getChatLogs(10)).toContain('player2 chooses to increase Fertile Fields\'s strength by 3');
        });

        it('should only be useable when opponent attacks earth', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'air',
                province: this.fields,
                attackers: [this.chronicler],
                defenders: []
            });
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.steward);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('dire effect - should have +3 political strength', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'air',
                province: this.fields,
                attackers: [this.chronicler],
                defenders: [this.steward]
            });
            expect(this.steward.getPoliticalSkill()).toBe(6);
        });

        it('should be useable when player attacks earth', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.player1.pass();
            this.player2.pass();
            this.initiateConflict({
                type: 'political',
                ring: 'earth',
                province: this.assault,
                attackers: [this.steward],
                defenders: []
            });
            this.player1.pass();
            this.player2.clickCard(this.steward);
            expect(this.player2).toHavePromptButton('Raise attacked province\'s strength by 3');
            expect(this.player2).toHavePromptButton('Lower attacked province\'s strength by 3');
            this.player2.clickPrompt('Lower attacked province\'s strength by 3');
            expect(this.assault.getStrength()).toBe(1);
            expect(this.getChatLogs(10)).toContain('player2 uses Steward of Cryptic Lore to change the province strength of an attacked province');
            expect(this.getChatLogs(10)).toContain('player2 chooses to reduce Dishonorable Assault\'s strength by 3');
        });
    });
});
