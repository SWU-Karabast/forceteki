describe('Writ of Survey', function () {
    integration(function () {
        describe('play restriction', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja', 'matsu-berserker'],
                        hand: ['writ-of-survey', 'resourcefulness']
                    }
                });

                this.doomedShugenja = this.player1.findCardByName('doomed-shugenja');
                this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
                this.writOfSurvey = this.player1.findCardByName('writ-of-survey');
                this.resourcefulness = this.player1.findCardByName('resourcefulness');
            });

            it('should only be able to be played on a honored character', function () {
                this.doomedShugenja.honor();
                this.game.checkGameState(true);
                this.player1.clickCard(this.writOfSurvey);
                expect(this.player1).toHavePrompt('Choose a card');
                this.player1.clickCard(this.matsuBerserker);
                expect(this.player1).toHavePrompt('Choose a card');

                this.player1.clickCard(this.doomedShugenja);
                expect(this.getChatLogs(5)).toContain('player1 plays Writ of Survey, attaching it to Doomed Shugenja');
            });

            it('should not fall off when dishonored', function () {
                this.doomedShugenja.honor();
                this.game.checkGameState(true);
                this.player1.clickCard(this.writOfSurvey);
                expect(this.player1).toHavePrompt('Choose a card');
                this.player1.clickCard(this.matsuBerserker);
                expect(this.player1).toHavePrompt('Choose a card');

                this.player1.clickCard(this.doomedShugenja);
                expect(this.getChatLogs(5)).toContain('player1 plays Writ of Survey, attaching it to Doomed Shugenja');

                this.player2.pass();

                this.player1.clickCard(this.resourcefulness);
                this.player1.clickCard(this.matsuBerserker);
                this.player1.clickCard(this.doomedShugenja);
                expect(this.getChatLogs(5)).toContain('player1 plays Resourcefulness, dishonoring Doomed Shugenja to honor Matsu Berserker');
                expect(this.doomedShugenja.isHonored).toBe(false);
                expect(this.writOfSurvey.parent).toBe(this.doomedShugenja);
            });
        });

        describe('ancestral keyword', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja', 'matsu-berserker'],
                        hand: ['writ-of-survey']
                    }
                });

                this.doomedShugenja = this.player1.findCardByName('doomed-shugenja');
                this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
                this.writOfSurvey = this.player1.findCardByName('writ-of-survey');
            });

            it('should only have ancestral while the parent is honored', function () {
                this.doomedShugenja.honor();
                this.player1.clickCard(this.writOfSurvey);
                this.player1.clickCard(this.doomedShugenja);

                expect(this.writOfSurvey.hasKeyword('ancestral')).toBe(true);
                this.doomedShugenja.dishonor();
                this.player2.pass();

                expect(this.writOfSurvey.hasKeyword('ancestral')).toBe(false);
            });
        });

        describe('gained action ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja', 'matsu-berserker'],
                        hand: ['writ-of-survey']
                    },
                    player2: {
                        inPlay: ['goblin-sneak', 'jealous-ancestor']
                    }
                });

                this.doomedShugenja = this.player1.findCardByName('doomed-shugenja');
                this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
                this.writOfSurvey = this.player1.findCardByName('writ-of-survey');

                this.goblinSneak = this.player2.findCardByName('goblin-sneak');
                this.jealousAncestor = this.player2.findCardByName('jealous-ancestor');

                this.doomedShugenja.honor();
                this.goblinSneak.dishonor();
            });

            it('should not work outside a conflict', function () {
                this.player1.clickCard(this.writOfSurvey);
                this.player1.clickCard(this.doomedShugenja);

                this.player2.pass();

                this.player1.clickCard(this.doomedShugenja);

                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should not work when the bearer isnt participating', function () {
                this.player1.clickCard(this.writOfSurvey);
                this.player1.clickCard(this.doomedShugenja);

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.matsuBerserker],
                    defenders: [this.goblinSneak],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.doomedShugenja);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should not work when there isnt a participating dishonored character', function () {
                this.player1.clickCard(this.writOfSurvey);
                this.player1.clickCard(this.doomedShugenja);

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.doomedShugenja],
                    defenders: [this.jealousAncestor],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.doomedShugenja);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should be able to target a dishonored participating character and bow it', function () {
                this.player1.clickCard(this.writOfSurvey);
                this.player1.clickCard(this.doomedShugenja);

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.doomedShugenja, this.matsuBerserker],
                    defenders: [this.jealousAncestor, this.goblinSneak],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.doomedShugenja);
                expect(this.player1).toBeAbleToSelect(this.goblinSneak);
                expect(this.player1).not.toBeAbleToSelect(this.jealousAncestor);
                expect(this.player1).not.toBeAbleToSelect(this.matsuBerserker);
                expect(this.player1).not.toBeAbleToSelect(this.doomedShugenja);

                this.player1.clickCard(this.goblinSneak);
                expect(this.goblinSneak.bowed).toBe(true);
            });
        });
    });
});
