describe('Prove Your Skill', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 12,
                    inPlay: ['bayushi-dairu', 'young-rumormonger', 'soshi-illusionist'],
                    hand: ['prove-your-skill']
                },
                player2: {
                    honor: 10,
                    inPlay: ['kakita-yoshi']
                }
            });
            this.bayushiDairu = this.player1.findCardByName('bayushi-dairu');
            this.youngRumormonger = this.player1.findCardByName('young-rumormonger');
            this.kakitaYoshi = this.player2.findCardByName('kakita-yoshi');
            this.illusionist = this.player1.findCardByName('soshi-illusionist');
            this.skill = this.player1.findCardByName('prove-your-skill');

            this.youngRumormonger.dishonor();
            this.bayushiDairu.taint();
            this.bayushiDairu.dishonor();
            this.kakitaYoshi.honor();
        });

        it('should not work if equally honorable', function() {
            this.player2.honor = this.player1.honor;
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.skill);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not work if less honorable', function() {
            this.player2.honor = this.player1.honor + 1;
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.skill);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should allow choosing a character a status token', function() {
            this.player1.clickCard(this.skill);
            expect(this.player1).toBeAbleToSelect(this.kakitaYoshi);
            expect(this.player1).toBeAbleToSelect(this.youngRumormonger);
            expect(this.player1).toBeAbleToSelect(this.bayushiDairu);
            expect(this.player1).not.toBeAbleToSelect(this.illusionist);
        });

        it('should discard a status token from the chosen a character (dishonor token)', function() {
            this.player1.clickCard(this.skill);
            this.player1.clickCard(this.youngRumormonger);
            expect(this.youngRumormonger.isDishonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 plays Prove Your Skill to discard Young Rumormonger\'s Dishonored Token');
        });

        it('should allow choosing a token if there are multiples', function() {
            this.player1.clickCard(this.skill);
            this.player1.clickCard(this.bayushiDairu);
            expect(this.player1).toHavePrompt('Which token do you wish to select?');
            expect(this.player1).toHavePromptButton('Dishonored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');
            this.player1.clickPrompt('Tainted Token');

            expect(this.bayushiDairu.isTainted).toBe(false);
            expect(this.bayushiDairu.isDishonored).toBe(true);
            expect(this.player2).toHavePrompt('Action Window');
            expect(this.getChatLogs(8)).toContain('player1 plays Prove Your Skill to discard Bayushi Dairu\'s Tainted Token');
        });
    });
});
