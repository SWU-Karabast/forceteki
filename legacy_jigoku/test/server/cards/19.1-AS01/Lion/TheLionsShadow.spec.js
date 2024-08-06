describe('The Lions Shadow', function () {
    integration(function () {
        describe('The Lions Shadow play restriction', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['matsu-berserker', 'ikoma-message-runner','meticulous-scout'],
                        hand: ['the-lion-s-shadow'],
                        conflictDeck: ['way-of-the-lion', 'for-shame']
                    }
                });

                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.messageRunner = this.player1.findCardByName('ikoma-message-runner');
                this.scout = this.player1.findCardByName('meticulous-scout');
                this.lionsShadow = this.player1.findCardByName('the-lion-s-shadow');
                this.berserker.bow();
            });

            it('should only be able to be played on a courtier or scout', function () {
                this.player1.clickCard(this.lionsShadow);
                expect(this.player1).not.toBeAbleToSelect(this.berserker);
                expect(this.player1).toBeAbleToSelect(this.messageRunner);
                expect(this.player1).toBeAbleToSelect(this.scout);

                this.player1.clickCard(this.messageRunner);
                expect(this.getChatLogs(5)).toContain('player1 plays The Lion\'s Shadow, attaching it to Ikoma Message Runner');
            });
        });

        describe('The Lions Shadow dishonor token interaction', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['matsu-berserker', 'ikoma-message-runner'],
                        hand: ['the-lion-s-shadow']
                    }
                });

                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.messageRunner = this.player1.findCardByName('ikoma-message-runner');
                this.lionsShadow = this.player1.findCardByName('the-lion-s-shadow');
                this.messageRunner.dishonor();
                this.game.checkGameState(true);
            });

            it('should make it so glory isn\'t affecting when dishonored', function () {
                expect(this.messageRunner.getPoliticalSkill()).toBe(0);

                this.player1.clickCard(this.lionsShadow);
                this.player1.clickCard(this.messageRunner);

                expect(this.messageRunner.getPoliticalSkill()).toBe(1);
            });
        });

        describe('The Lions Shadow fate phase ancestral keyword', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['matsu-berserker', 'ikoma-message-runner'],
                        hand: ['the-lion-s-shadow']
                    }
                });

                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.messageRunner = this.player1.findCardByName('ikoma-message-runner');
                this.lionsShadow = this.player1.findCardByName('the-lion-s-shadow');
                this.messageRunner.dishonor();
                this.game.checkGameState(true);
            });

            it('should gain ancestral in the fate phase', function () {
                this.player1.clickCard(this.lionsShadow);
                this.player1.clickCard(this.messageRunner);

                expect(this.lionsShadow.hasKeyword('ancestral')).toBe(false);

                this.flow.finishConflictPhase();
                expect(this.lionsShadow.hasKeyword('ancestral')).toBe(true);
            });
        });

        describe('The Lions Shadow covert', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['matsu-berserker', 'ikoma-message-runner'],
                        hand: ['the-lion-s-shadow']
                    },
                    player2: {
                        inPlay: ['hantei-sotorii', 'kakita-yoshi']
                    }
                });

                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.messageRunner = this.player1.findCardByName('ikoma-message-runner');
                this.lionsShadow = this.player1.findCardByName('the-lion-s-shadow');

                this.sotorii = this.player2.findCardByName('hantei-sotorii');
                this.yoshi = this.player2.findCardByName('kakita-yoshi');
                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');

                this.player1.playAttachment(this.lionsShadow, this.messageRunner);
            });

            it('should have covert when attacking alone', function () {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.messageRunner);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose covert target for Ikoma Message Runner');
                this.player1.clickCard(this.sotorii);
                expect(this.sotorii.covert).toBe(true);
                expect(this.player2).toHavePrompt('Choose Defenders');
                this.player2.clickCard(this.sotorii);
                this.player2.clickCard(this.yoshi);
                this.player2.clickPrompt('Done');
                expect(this.sotorii.isParticipating()).toBe(false);
                expect(this.yoshi.isParticipating()).toBe(true);
            });

            it('should not have covert when not attacking alone', function () {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.berserker);
                this.player1.clickCard(this.messageRunner);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).not.toHavePrompt('Choose covert target for Ikoma Message Runner');
                expect(this.player2).toHavePrompt('Choose Defenders');
                this.player2.clickCard(this.sotorii);
                this.player2.clickCard(this.yoshi);
                this.player2.clickPrompt('Done');
                expect(this.sotorii.isParticipating()).toBe(true);
                expect(this.yoshi.isParticipating()).toBe(true);
            });
        });
    });
});
