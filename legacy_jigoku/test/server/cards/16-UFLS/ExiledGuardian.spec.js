describe('Exiled Guardian', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 12,
                    inPlay: ['exiled-guardian', 'bayushi-dairu', 'young-rumormonger', 'soshi-illusionist']
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
            this.guardian = this.player1.findCardByName('exiled-guardian');

            this.youngRumormonger.dishonor();
            this.bayushiDairu.taint();
            this.bayushiDairu.dishonor();
            this.kakitaYoshi.honor();

            this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.sd1.facedown = false;
            this.sd2.facedown = false;
            this.sd1.dishonor();
            this.sd1.taint();
            this.game.checkGameState(true);
        });

        it('should allow choosing a card with a status token', function() {
            this.player1.clickCard(this.guardian);
            expect(this.player1).toBeAbleToSelect(this.kakitaYoshi);
            expect(this.player1).toBeAbleToSelect(this.youngRumormonger);
            expect(this.player1).toBeAbleToSelect(this.bayushiDairu);
            expect(this.player1).toBeAbleToSelect(this.sd1);
            expect(this.player1).not.toBeAbleToSelect(this.sd2);
            expect(this.player1).not.toBeAbleToSelect(this.illusionist);
        });

        it('should sacrifice itself to discard a status token from the chosen a character (dishonor token)', function() {
            this.player1.clickCard(this.guardian);
            this.player1.clickCard(this.youngRumormonger);
            expect(this.youngRumormonger.isDishonored).toBe(false);
            expect(this.guardian.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(5)).toContain('player1 uses Exiled Guardian, sacrificing Exiled Guardian to discard Young Rumormonger\'s Dishonored Token');
        });

        it('should allow choosing a token if there are multiples', function() {
            this.player1.clickCard(this.guardian);
            this.player1.clickCard(this.bayushiDairu);
            expect(this.player1).toHavePrompt('Which token do you wish to select?');
            expect(this.player1).toHavePromptButton('Dishonored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');
            this.player1.clickPrompt('Tainted Token');

            expect(this.bayushiDairu.isTainted).toBe(false);
            expect(this.bayushiDairu.isDishonored).toBe(true);
            expect(this.player2).toHavePrompt('Action Window');
            expect(this.getChatLogs(8)).toContain('player1 uses Exiled Guardian, sacrificing Exiled Guardian to discard Bayushi Dairu\'s Tainted Token');
        });

        it('should allow choosing a token if there are multiples - from province', function() {
            this.player1.clickCard(this.guardian);
            this.player1.clickCard(this.sd1);
            expect(this.player1).toHavePrompt('Which token do you wish to select?');
            expect(this.player1).toHavePromptButton('Dishonored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');
            this.player1.clickPrompt('Tainted Token');

            expect(this.sd1.isTainted).toBe(false);
            expect(this.sd1.isDishonored).toBe(true);
            expect(this.player2).toHavePrompt('Action Window');
            expect(this.getChatLogs(8)).toContain('player1 uses Exiled Guardian, sacrificing Exiled Guardian to discard Shameful Display\'s Tainted Token');
        });
    });
});
