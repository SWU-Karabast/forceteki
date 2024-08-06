describe('Asceticism', function() {
    integration(function() {
        describe('Asceticism on a friendly character with all provinces facedown', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['agasha-swordsmith', 'shrewd-investigator', 'togashi-initiate'],
                        hand: ['asceticism']
                    },
                    player2: {
                        inPlay:['vanguard-warrior'],
                        hand: ['court-games', 'assassination']
                    }
                });

                this.agashaSwordsmith = this.player1.findCardByName('agasha-swordsmith');
                this.shrewdInvestigator = this.player1.findCardByName('shrewd-investigator');
                this.togashiInitiate = this.player1.findCardByName('togashi-initiate');
                this.asceticism = this.player1.findCardByName('asceticism');
                this.courtGames = this.player2.findCardByName('court-games');
                this.assassination = this.player2.findCardByName('assassination');
                this.vanguardWarrior = this.player2.findCardByName('vanguard-warrior');
                this.player1.playAttachment(this.asceticism, this.agashaSwordsmith);
                this.noMoreActions();
            });

            it('should forbid opponent\'s events to target attached character', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.agashaSwordsmith],
                    defenders: []
                });
                this.player2.clickCard(this.assassination);
                expect(this.player2).toBeAbleToSelect(this.shrewdInvestigator);
                expect(this.player2).toBeAbleToSelect(this.togashiInitiate);
                expect(this.player2).not.toBeAbleToSelect(this.agashaSwordsmith);
            });

            it('should forbid opponent\'s character actions to target attached character', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.agashaSwordsmith],
                    defenders: []
                });
                this.player2.clickCard(this.vanguardWarrior);
                expect(this.player2).toBeAbleToSelect(this.shrewdInvestigator);
                expect(this.player2).toBeAbleToSelect(this.togashiInitiate);
                expect(this.player2).not.toBeAbleToSelect(this.agashaSwordsmith);
            });

            it('should forbid opponent\'s events to target attached character, even when chosen by its controller', function() {
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.agashaSwordsmith, this.shrewdInvestigator],
                    defenders: []
                });
                this.player2.clickCard(this.courtGames);
                this.player2.clickPrompt('Dishonor an opposing character');
                expect(this.player1).toBeAbleToSelect(this.shrewdInvestigator);
                expect(this.player1).not.toBeAbleToSelect(this.agashaSwordsmith);
            });
        });

        describe('Asceticism on an opponent\'s character with all provinces facedown', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['agasha-swordsmith','agasha-prodigy'],
                        hand: ['asceticism', 'court-games']
                    },
                    player2: {
                        inPlay: ['hantei-sotorii', 'vanguard-warrior'],
                        hand: ['defend-your-honor', 'banzai']
                    }
                });

                this.agashaProdigy = this.player1.findCardByName('agasha-prodigy');
                this.agashaSwordsmith = this.player1.findCardByName('agasha-swordsmith');
                this.asceticism = this.player1.findCardByName('asceticism');
                this.courtGames = this.player1.findCardByName('court-games');
                this.hanteiSotorii = this.player2.findCardByName('hantei-sotorii');
                this.vanguardWarrior = this.player2.findCardByName('vanguard-warrior');
                this.defendYourHonor = this.player2.findCardByName('defend-your-honor');
                this.banzai = this.player2.findCardByName('banzai');
                this.player1.playAttachment(this.asceticism, this.hanteiSotorii);
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
            });

            it('should not forbid your own events to target attached character', function() {
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.hanteiSotorii, this.vanguardWarrior],
                    defenders: []
                });
                this.player1.clickCard(this.courtGames);
                this.player1.clickPrompt('Dishonor an opposing character');
                expect(this.player2).toBeAbleToSelect(this.hanteiSotorii);
                expect(this.player2).toBeAbleToSelect(this.vanguardWarrior);
            });

            it('should forbid opponent\'s events to target attached character', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.hanteiSotorii, this.vanguardWarrior],
                    defenders: []
                });
                this.player1.pass();
                this.player2.clickCard(this.banzai);
                expect(this.player2).not.toBeAbleToSelect(this.hanteiSotorii);
                expect(this.player2).toBeAbleToSelect(this.vanguardWarrior);
            });

            it('should forbid opponent\'s events to target attached character, even when chosen by its controller', function() {
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.hanteiSotorii, this.vanguardWarrior],
                    defenders: [this.agashaSwordsmith]
                });
                this.player1.clickCard(this.courtGames);
                this.player1.clickPrompt('Honor a friendly character');
                this.player2.clickCard(this.defendYourHonor);
                expect(this.player2).not.toBeAbleToSelect(this.hanteiSotorii);
                expect(this.player2).toBeAbleToSelect(this.vanguardWarrior);
            });

            it('should forbid opponent\'s character abilities to target attached character', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.hanteiSotorii, this.vanguardWarrior],
                    defenders: []
                });
                this.player1.pass();
                this.player2.clickCard(this.hanteiSotorii);
                expect(this.player2).not.toBeAbleToSelect(this.hanteiSotorii);
                expect(this.player2).toBeAbleToSelect(this.vanguardWarrior);
            });

            it('should not forbid player1\'s character abilities to target attached character', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.hanteiSotorii, this.vanguardWarrior],
                    defenders: []
                });
                this.player1.clickCard(this.agashaProdigy);
                expect(this.player1).toBeAbleToSelect(this.hanteiSotorii);
                expect(this.player1).toBeAbleToSelect(this.vanguardWarrior);
            });
        });

        describe('Asceticism on a friendly character with one non-SH provinces facedown', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['agasha-swordsmith', 'shrewd-investigator', 'togashi-initiate'],
                        hand: ['asceticism'],
                        provinces: ['manicured-garden','scene-of-the-crime','public-forum']
                    },
                    player2: {
                        inPlay:['vanguard-warrior'],
                        hand: ['court-games', 'assassination'],
                        provinces: ['fertile-fields']
                    }
                });

                this.manicured = this.player1.findCardByName('manicured-garden');
                this.forum = this.player1.findCardByName('public-forum');
                this.crimeScene = this.player1.findCardByName('scene-of-the-crime');

                this.fertile = this.player2.findCardByName('fertile-fields');

                this.agashaSwordsmith = this.player1.findCardByName('agasha-swordsmith');
                this.shrewdInvestigator = this.player1.findCardByName('shrewd-investigator');
                this.togashiInitiate = this.player1.findCardByName('togashi-initiate');
                this.asceticism = this.player1.findCardByName('asceticism');
                this.courtGames = this.player2.findCardByName('court-games');
                this.assassination = this.player2.findCardByName('assassination');
                this.vanguardWarrior = this.player2.findCardByName('vanguard-warrior');
                this.player1.playAttachment(this.asceticism, this.agashaSwordsmith);
                this.noMoreActions();
            });

            it('should not work when only one of your non SH provinces is faceup ', function() {
                this.manicured.facedown = false;
                this.forum.facedown = false;
                this.crimeScene.facedown = false;
                this.game.checkGameState(true);
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.agashaSwordsmith],
                    defenders: []
                });

                this.player2.clickCard(this.assassination);
                expect(this.player2).toBeAbleToSelect(this.shrewdInvestigator);
                expect(this.player2).toBeAbleToSelect(this.togashiInitiate);
                expect(this.player2).toBeAbleToSelect(this.agashaSwordsmith);
            });
        });
    });
});
