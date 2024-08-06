describe('Hida Kisada', function() {
    integration(function() {
        describe('Hida Kisada\'s constant effect', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['hida-kisada'],
                        dynastyDiscard: ['hida-kisada'],
                        conflictDiscard: ['defend-your-honor']
                    },
                    player2: {
                        inPlay: ['akodo-toturi'],
                        hand: ['banzai', 'iuchi-wayfinder', 'stoke-insurrection']
                    }
                });
                this.hidaKisada = this.player1.findCardByName('hida-kisada', 'play area');
                this.hidaKisada2 = this.player1.findCardByName('hida-kisada', 'dynasty discard pile');
                this.player1.placeCardInProvince(this.hidaKisada2, 'province 1');
                this.defendYourHonor = this.player1.findCardByName('defend-your-honor');

                this.akodoToturi = this.player2.findCardByName('akodo-toturi');
                this.banzai = this.player2.findCardByName('banzai');
                this.iuchiWayfinder = this.player2.findCardByName('iuchi-wayfinder');
                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
            });

            it('should cancel the first action ability triggered by your opponent', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.hidaKisada],
                    defenders: [this.akodoToturi]
                });
                this.player2.clickCard(this.banzai);
                this.player2.clickCard(this.akodoToturi);
                expect(this.getChatLogs(3)).toContain('player2 attempts to initiate Banzai!, but Hida Kisada cancels it');
                expect(this.akodoToturi.getMilitarySkill()).toBe(6);
            });

            it('should not cancel the second action ability triggered by your opponent', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.hidaKisada],
                    defenders: [this.akodoToturi]
                });
                this.player2.clickCard(this.shamefulDisplay);
                this.player2.clickCard(this.akodoToturi);
                this.player2.clickCard(this.hidaKisada);
                this.player2.clickPrompt('Done');
                expect(this.getChatLogs(3)).toContain('player2 attempts to initiate Shameful Display\'s ability, but Hida Kisada cancels it');
                this.player1.pass();
                this.player2.clickCard(this.banzai);
                this.player2.clickCard(this.akodoToturi);
                this.player2.clickPrompt('Done');
                expect(this.akodoToturi.getMilitarySkill()).toBe(8);
            });

            it('should not cancel reactions triggered by your opponent', function() {
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.akodoToturi],
                    defenders: []
                });
                this.noMoreActions();
                this.player2.clickPrompt('No');
                this.player2.clickPrompt('Don\'t Resolve');
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.akodoToturi);
                this.player2.clickCard(this.akodoToturi);
                expect(this.player2).toHavePrompt('Air Ring');
            });

            it('should not cancel actions once you have lost a conflict', function() {
                this.noMoreActions();
                this.player1.passConflict();
                this.player1.pass();
                this.player2.clickCard(this.iuchiWayfinder);
                this.player2.clickPrompt('0');
                this.player2.clickPrompt('Pass');
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.iuchiWayfinder],
                    defenders: []
                });
                this.noMoreActions();
                this.player2.clickPrompt('Don\'t Resolve');
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.hidaKisada],
                    defenders: [this.akodoToturi],
                    ring: 'fire'
                });
                this.player2.clickCard(this.banzai);
                this.player2.clickCard(this.akodoToturi);
                this.player2.clickPrompt('Done');
                expect(this.akodoToturi.getMilitarySkill()).toBe(8);
            });

            it('should not cancel the second action if the first is cancelled', function() {
                this.player1.moveCard(this.defendYourHonor, 'hand');
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.hidaKisada],
                    defenders: [this.akodoToturi]
                });
                this.player2.clickCard(this.banzai);
                this.player2.clickCard(this.akodoToturi);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.defendYourHonor);
                this.player1.clickCard(this.defendYourHonor);
                this.player1.clickCard(this.hidaKisada);
                this.player2.clickCard(this.akodoToturi);
                this.player1.clickPrompt('5');
                this.player2.clickPrompt('1');
                expect(this.getChatLogs(3)).toContain('Duel Effect: cancel the effects of Banzai!');
                expect(this.akodoToturi.getMilitarySkill()).toBe(6);
                this.player1.pass();
                this.player2.clickCard(this.shamefulDisplay);
                this.player2.clickCard(this.akodoToturi);
                this.player2.clickCard(this.hidaKisada);
                this.player2.clickPrompt('Done');
                expect(this.player2).toHavePrompt('Shameful Display');
            });
        });
        describe('Hida Kisada\'s constant effect when switching controller', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player2: {
                        dynastyDiscard: ['hida-kisada'],
                        hand: ['assassination']
                    },
                    player1: {
                        inPlay: ['akodo-toturi', 'matsu-berserker'],
                        hand: ['banzai', 'stoke-insurrection']
                    }
                });
                this.hidaKisada = this.player2.findCardByName('hida-kisada', 'dynasty discard pile');
                this.player2.placeCardInProvince(this.hidaKisada, 'province 1');
                this.assassination = this.player2.findCardByName('assassination');

                this.akodoToturi = this.player1.findCardByName('akodo-toturi');
                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.banzai = this.player1.findCardByName('banzai');
                this.stoke = this.player1.findCardByName('stoke-insurrection');
                this.shamefulDisplay = this.player1.findCardByName('shameful-display', 'province 1');
            });

            it('should properly cancel the first event played by the now new opponent, not count the event played by the original opponent', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.akodoToturi],
                    defenders: []
                });

                this.player2.pass();

                this.player1.clickCard(this.stoke);
                expect(this.player1).toBeAbleToSelect(this.hidaKisada);
                this.player1.clickCard(this.hidaKisada);
                this.player1.clickPrompt('Done');

                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.berserker);

                expect(this.getChatLogs(5)).toContain('player2 attempts to initiate Assassination, but Hida Kisada cancels it');
                expect(this.berserker.location).toBe('play area');
            });
        });

        describe('Hida Kisada\'s constant effect with covert', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['underhanded-samurai'],
                        hand: ['banzai']
                    },
                    player2: {
                        inPlay: ['hida-kisada']
                    }
                });

                this.samurai = this.player1.findCardByName('underhanded-samurai');
                this.banzai = this.player1.findCardByName('banzai');
                this.hidaKisada = this.player2.findCardByName('hida-kisada');
                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
            });

            it('should not cancel covert', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.samurai);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose covert target for Underhanded Samurai');
                this.player1.clickCard(this.hidaKisada);
                this.player2.clickCard(this.hidaKisada);
                this.player2.clickPrompt('Done');
                expect(this.hidaKisada.inConflict).toBe(false);
                this.player2.pass();
                this.player1.clickCard(this.banzai);
                this.player1.clickCard(this.samurai);
                expect(this.getChatLogs(10)).toContain('player1 attempts to initiate Banzai!, but Hida Kisada cancels it');
            });
        });
    });
});
