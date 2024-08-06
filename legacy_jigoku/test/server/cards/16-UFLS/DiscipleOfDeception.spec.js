describe('Disciple of Deception', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 12,
                    inPlay: ['disciple-of-deception', 'bayushi-dairu', 'young-rumormonger', 'soshi-illusionist']
                },
                player2: {
                    honor: 10,
                    inPlay: ['kakita-yoshi'],
                    hand: ['soul-beyond-reproach', 'assassination']
                }
            });
            this.bayushiDairu = this.player1.findCardByName('bayushi-dairu');
            this.youngRumormonger = this.player1.findCardByName('young-rumormonger');
            this.kakitaYoshi = this.player2.findCardByName('kakita-yoshi');
            this.illusionist = this.player1.findCardByName('soshi-illusionist');
            this.deception = this.player1.findCardByName('disciple-of-deception');
            this.soul = this.player2.findCardByName('soul-beyond-reproach');
            this.assassination = this.player2.findCardByName('assassination');

            this.youngRumormonger.dishonor();
            this.bayushiDairu.taint();
            this.bayushiDairu.dishonor();
            this.kakitaYoshi.honor();
            this.illusionist.taint();
        });

        it('should allow choosing a card with a status token', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.bayushiDairu],
                defenders: [this.kakitaYoshi]
            });

            this.player2.pass();
            this.player1.clickCard(this.deception);
            expect(this.player1).toHavePrompt('Choose the status token to copy');
            expect(this.player1).toBeAbleToSelect(this.kakitaYoshi);
            expect(this.player1).toBeAbleToSelect(this.youngRumormonger);
            expect(this.player1).toBeAbleToSelect(this.bayushiDairu);
            expect(this.player1).toBeAbleToSelect(this.illusionist);
            expect(this.player1).not.toBeAbleToSelect(this.deception);
        });

        it('should allow choosing a different card with a different status token', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.bayushiDairu],
                defenders: [this.kakitaYoshi]
            });

            this.player2.pass();
            this.player1.clickCard(this.deception);
            this.player1.clickCard(this.bayushiDairu);
            this.player1.clickPrompt('Dishonored Token');
            expect(this.player1).toHavePrompt('Choose the status token to overwrite');
            expect(this.player1).toBeAbleToSelect(this.kakitaYoshi);
            expect(this.player1).not.toBeAbleToSelect(this.youngRumormonger);
            expect(this.player1).not.toBeAbleToSelect(this.bayushiDairu);
            expect(this.player1).toBeAbleToSelect(this.illusionist);
            expect(this.player1).not.toBeAbleToSelect(this.deception);
        });

        it('should not let you put two of the same token on a character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.bayushiDairu],
                defenders: [this.kakitaYoshi]
            });

            this.player2.pass();
            this.player1.clickCard(this.deception);
            this.player1.clickCard(this.illusionist);
            expect(this.player1).toHavePrompt('Choose the status token to overwrite');
            expect(this.player1).toBeAbleToSelect(this.kakitaYoshi);
            expect(this.player1).toBeAbleToSelect(this.youngRumormonger);
            expect(this.player1).not.toBeAbleToSelect(this.bayushiDairu);
            expect(this.player1).not.toBeAbleToSelect(this.illusionist);
            expect(this.player1).not.toBeAbleToSelect(this.deception);
        });

        it('should replace the 2nd token with the first', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.bayushiDairu],
                defenders: [this.kakitaYoshi]
            });

            this.player2.pass();
            expect(this.youngRumormonger.isDishonored).toBe(true);
            this.player1.clickCard(this.deception);
            this.player1.clickCard(this.youngRumormonger);
            this.player1.clickCard(this.kakitaYoshi);
            expect(this.kakitaYoshi.isDishonored).toBe(true);
            expect(this.kakitaYoshi.isHonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 uses Disciple of Deception to replace Kakita Yoshi\'s Honored Token with Dishonored Token until the end of the conflict');
        });

        it('should annihilate honor and dishonor tokens if the target gets both', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.bayushiDairu],
                defenders: [this.kakitaYoshi]
            });

            this.player2.pass();
            this.player1.clickCard(this.deception);
            this.player1.clickCard(this.kakitaYoshi);
            this.player1.clickCard(this.bayushiDairu);
            this.player1.clickPrompt('Tainted Token');
            expect(this.bayushiDairu.isTainted).toBe(false);
            expect(this.bayushiDairu.isHonored).toBe(false);
            expect(this.bayushiDairu.isDishonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('Honored and Dishonored status tokens nullify each other and are both discarded from Bayushi Dairu');
        });

        it('should expire at the end of the conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.bayushiDairu],
                defenders: [this.kakitaYoshi]
            });

            this.bayushiDairu.bow();
            this.player2.pass();
            this.player1.clickCard(this.deception);
            this.player1.clickCard(this.youngRumormonger);
            this.player1.clickCard(this.kakitaYoshi);
            expect(this.kakitaYoshi.isDishonored).toBe(true);
            expect(this.kakitaYoshi.isHonored).toBe(false);
            expect(this.kakitaYoshi.getMilitarySkill()).toBe(0);
            expect(this.kakitaYoshi.getPoliticalSkill()).toBe(3);
            this.noMoreActions();

            expect(this.kakitaYoshi.isDishonored).toBe(false);
            expect(this.kakitaYoshi.isHonored).toBe(true);
            expect(this.kakitaYoshi.getMilitarySkill()).toBe(5);
            expect(this.kakitaYoshi.getPoliticalSkill()).toBe(9);
        });

        it('shouldn\'t revert anything if the token gets removed mid-conflict', function() {
            this.kakitaYoshi.dishonor();
            this.kakitaYoshi.taint();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.bayushiDairu],
                defenders: [this.kakitaYoshi]
            });

            this.bayushiDairu.bow();
            this.player2.pass();
            this.player1.clickCard(this.deception);
            this.player1.clickCard(this.youngRumormonger);
            this.player1.clickCard(this.kakitaYoshi);
            expect(this.kakitaYoshi.isDishonored).toBe(true);
            this.player2.clickCard(this.soul);
            this.player2.clickCard(this.kakitaYoshi);
            expect(this.kakitaYoshi.isDishonored).toBe(false);
            expect(this.kakitaYoshi.isHonored).toBe(true);
            this.noMoreActions();

            expect(this.kakitaYoshi.isDishonored).toBe(false);
            expect(this.kakitaYoshi.isHonored).toBe(true);
            expect(this.kakitaYoshi.isTainted).toBe(false);
            expect(this.kakitaYoshi.getMilitarySkill()).toBe(5);
            expect(this.kakitaYoshi.getPoliticalSkill()).toBe(9);
        });

        it('should expire at the end of the conflict even if Disciple leaves play', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.bayushiDairu],
                defenders: [this.kakitaYoshi]
            });

            this.bayushiDairu.bow();
            this.player2.pass();
            this.player1.clickCard(this.deception);
            this.player1.clickCard(this.youngRumormonger);
            this.player1.clickCard(this.kakitaYoshi);
            expect(this.kakitaYoshi.isDishonored).toBe(true);
            expect(this.kakitaYoshi.isHonored).toBe(false);
            expect(this.kakitaYoshi.getMilitarySkill()).toBe(0);
            expect(this.kakitaYoshi.getPoliticalSkill()).toBe(3);
            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.deception);
            expect(this.deception.location).toBe('dynasty discard pile');
            this.noMoreActions();

            expect(this.kakitaYoshi.isDishonored).toBe(false);
            expect(this.kakitaYoshi.isHonored).toBe(true);
            expect(this.kakitaYoshi.getMilitarySkill()).toBe(5);
            expect(this.kakitaYoshi.getPoliticalSkill()).toBe(9);
        });
    });
});
