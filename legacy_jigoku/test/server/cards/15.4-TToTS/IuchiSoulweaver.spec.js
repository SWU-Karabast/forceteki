describe('Iuchi Soulweaver', function () {
    integration(function () {
        describe('Not Dire', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['iuchi-soulweaver', 'hantei-sotorii', 'iuchi-soulweaver', 'utaku-infantry'],
                        hand: ['duelist-training', 'ancient-master', 'unleash-the-djinn'],
                        dynastyDiscard: ['favorable-ground']
                    },
                    player2: {
                        inPlay: ['adept-of-the-waves'],
                        hand: ['way-of-the-scorpion', 'policy-debate']
                    }
                });

                this.soulweaver = this.player1.filterCardsByName('iuchi-soulweaver')[0];
                this.soulweaver2 = this.player1.filterCardsByName('iuchi-soulweaver')[1];
                this.soulweaver.fate = 1;
                this.soulweaver2.fate = 1;

                this.sotorii = this.player1.findCardByName('hantei-sotorii');
                this.infantry = this.player1.findCardByName('utaku-infantry');
                this.duelistTraining = this.player1.findCardByName('duelist-training');
                this.master = this.player1.findCardByName('ancient-master');
                this.djinn = this.player1.findCardByName('unleash-the-djinn');
                this.ground = this.player1.placeCardInProvince('favorable-ground', 'province 1');
                this.ground.facedown = false;

                this.adept = this.player2.findCardByName('adept-of-the-waves');
                this.scorp = this.player2.findCardByName('way-of-the-scorpion');
                this.pd = this.player2.findCardByName('policy-debate');

                this.player1.playAttachment(this.duelistTraining, this.soulweaver);
                this.player2.pass();
                this.player1.clickCard(this.master);
                this.player1.clickPrompt('Play Ancient Master as an attachment');
                this.player1.clickCard(this.soulweaver);
            });

            it('should not be consisdered participating', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.adept]
                });

                expect(this.soulweaver.isParticipating()).toBe(false);
            });

            it('should be targetable by favourable ground', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.adept]
                });

                this.player2.pass();
                this.player1.clickCard(this.ground);
                expect(this.player1).toHavePrompt('Favorable Ground');
                expect(this.player1).toBeAbleToSelect(this.soulweaver);
            });

            it('can\'t be dueled at home', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.adept]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.adept);
                expect(this.player2).toBeAbleToSelect(this.sotorii);
                expect(this.player2).not.toBeAbleToSelect(this.soulweaver);
                expect(this.player2).not.toBeAbleToSelect(this.soulweaver2);
                expect(this.player2).not.toBeAbleToSelect(this.infantry);
            });

            it('can\'t be targeted by effects referencing participants', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.adept]
                });

                this.player2.clickCard(this.scorp);
                expect(this.player2).toBeAbleToSelect(this.sotorii);
                expect(this.player2).not.toBeAbleToSelect(this.soulweaver);
            });

            it('can\'t initiate duels', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.adept]
                });

                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soulweaver);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('does not get hit by anthem effects', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.adept]
                });

                this.player2.pass();
                this.player1.clickCard(this.djinn);
                expect(this.sotorii.getMilitarySkill()).toBe(3);
                expect(this.adept.getMilitarySkill()).toBe(3);
                expect(this.soulweaver.getMilitarySkill()).toBe(this.soulweaver.getBaseMilitarySkill());
            });
        });

        describe('Dire', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['iuchi-soulweaver', 'hantei-sotorii', 'iuchi-soulweaver', 'utaku-infantry'],
                        hand: ['duelist-training', 'ancient-master', 'unleash-the-djinn'],
                        dynastyDiscard: ['favorable-ground']
                    },
                    player2: {
                        inPlay: ['adept-of-the-waves'],
                        hand: ['way-of-the-scorpion', 'policy-debate']
                    }
                });

                this.soulweaver = this.player1.filterCardsByName('iuchi-soulweaver')[0];
                this.soulweaver2 = this.player1.filterCardsByName('iuchi-soulweaver')[1];
                this.soulweaver.fate = 0;
                this.soulweaver2.fate = 1;

                this.sotorii = this.player1.findCardByName('hantei-sotorii');
                this.infantry = this.player1.findCardByName('utaku-infantry');
                this.duelistTraining = this.player1.findCardByName('duelist-training');
                this.master = this.player1.findCardByName('ancient-master');
                this.djinn = this.player1.findCardByName('unleash-the-djinn');
                this.ground = this.player1.placeCardInProvince('favorable-ground', 'province 1');
                this.ground.facedown = false;

                this.adept = this.player2.findCardByName('adept-of-the-waves');
                this.scorp = this.player2.findCardByName('way-of-the-scorpion');
                this.pd = this.player2.findCardByName('policy-debate');

                this.player1.playAttachment(this.duelistTraining, this.soulweaver);
                this.player2.pass();
                this.player1.clickCard(this.master);
                this.player1.clickPrompt('Play Ancient Master as an attachment');
                this.player1.clickCard(this.soulweaver);
            });

            it('should be consisdered participating', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.adept]
                });

                expect(this.soulweaver.isParticipating()).toBe(true);
            });

            it('should not be targetable by favourable ground', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.adept]
                });

                this.player2.pass();
                this.player1.clickCard(this.ground);
                expect(this.player1).toHavePrompt('Favorable Ground');
                expect(this.player1).not.toBeAbleToSelect(this.soulweaver);
            });

            it('can be dueled at home', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.adept]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.adept);
                expect(this.player2).toBeAbleToSelect(this.sotorii);
                expect(this.player2).toBeAbleToSelect(this.soulweaver);
            });

            it('can be targeted by effects referencing participants', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.adept]
                });

                this.player2.clickCard(this.scorp);
                expect(this.player2).toBeAbleToSelect(this.sotorii);
                expect(this.player2).toBeAbleToSelect(this.soulweaver);
                this.player2.clickCard(this.soulweaver);
                expect(this.soulweaver.isDishonored).toBe(true);
            });

            it('can initiate duels', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.adept]
                });

                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soulweaver);
                expect(this.player1).toBeAbleToSelect(this.adept);
                this.player1.clickCard(this.adept);
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                expect(this.soulweaver.bowed).toBe(true);
            });

            it('gets hit by anthem effects', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.adept]
                });

                this.player2.pass();
                this.player1.clickCard(this.djinn);
                expect(this.sotorii.getMilitarySkill()).toBe(3);
                expect(this.adept.getMilitarySkill()).toBe(3);
                expect(this.soulweaver.getMilitarySkill()).toBe(3);
            });

            it('considered to be participating (constant effects)', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.infantry],
                    defenders: [this.adept]
                });

                this.player2.pass();
                expect(this.infantry.getMilitarySkill()).toBe(2);
            });

            it('does not bow if its at home', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.infantry],
                    defenders: [this.adept]
                });

                this.noMoreActions();
                this.player1.clickPrompt('Don\'t Resolve');
                expect(this.infantry.bowed).toBe(true);
                expect(this.soulweaver.bowed).toBe(false);
            });

            it('can be committed and will trigger declared reactions', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.infantry, this.soulweaver]
                });
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.master);
            });

            it('can be committed and will bow at the end of conflict', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.infantry, this.soulweaver]
                });
                this.player1.pass(); //Ancient Master
                this.player2.clickCard(this.adept);
                this.player2.clickPrompt('Done');

                this.noMoreActions();
                this.player1.clickPrompt('Don\'t Resolve');
                expect(this.infantry.bowed).toBe(true);
                expect(this.soulweaver.bowed).toBe(true);
            });

            it('is not participating if there are no other participating characters', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.infantry],
                    defenders: [this.adept]
                });

                expect(this.game.currentConflict.attackerSkill).toBe(3);
                this.player2.pass();
                this.player1.clickCard(this.ground);
                this.player1.clickCard(this.infantry);
                expect(this.game.currentConflict.attackerSkill).toBe(0);
                expect(this.soulweaver.isParticipating()).toBe(false);
            });

            it('two should be able to keep each other participating', function () {
                this.soulweaver2.fate = 0;
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.infantry],
                    defenders: [this.adept]
                });

                expect(this.game.currentConflict.attackerSkill).toBe(5);
                this.player2.pass();
                this.player1.clickCard(this.ground);
                this.player1.clickCard(this.infantry);
                expect(this.game.currentConflict.attackerSkill).toBe(2);
                expect(this.soulweaver.isParticipating()).toBe(true);
                expect(this.soulweaver2.isParticipating()).toBe(true);
            });
        });
    });
});
