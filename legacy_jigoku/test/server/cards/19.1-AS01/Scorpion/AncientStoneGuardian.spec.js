describe('Ancient Stone Guardian', function () {
    integration(function () {
        describe('Cannot be evaded', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['ikoma-ikehata']
                    },
                    player2: {
                        inPlay: ['ancient-stone-guardian', 'shika-matchmaker'],
                        provinces: ['shameful-display']
                    }
                });

                this.ikehata = this.player1.findCardByName('ikoma-ikehata');

                this.stoneGuardian = this.player2.findCardByName('ancient-stone-guardian');
                this.matchmaker = this.player2.findCardByName('shika-matchmaker');
                this.shamefulDisplay1 = this.player2.findCardByName('shameful-display', 'province 1');
            });

            it('should not be able to be evaded by covert', function () {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('initiate conflict');
                this.player1.clickCard(this.ikehata);
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay1);

                expect(this.player1).toHavePromptButton('Initiate Conflict');
                this.player1.clickPrompt('Initiate Conflict');

                expect(this.player1).toHavePrompt('Choose covert target for Ikoma Ikehata');
                expect(this.stoneGuardian.covert).toBe(false);
                this.player2.clickCard(this.stoneGuardian);
                expect(this.player1).toHavePrompt('Choose covert target for Ikoma Ikehata');
                expect(this.stoneGuardian.covert).toBe(false);
                this.player1.clickPrompt('No Target');

                expect(this.player2).toHavePrompt('Choose defenders');
                this.player2.clickCard(this.stoneGuardian);
                expect(this.stoneGuardian.isDefending()).toBe(true);
                expect(this.ikehata.isAttacking()).toBe(true);
            });
        });

        describe('Cannot participate as atacker', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['shinjo-archer', 'isawa-tadaka']
                    },
                    player2: {
                        inPlay: ['solemn-scholar', 'ancient-stone-guardian'],
                        hand: ['assassination']
                    }
                });

                this.shinjoArcher = this.player1.findCardByName('shinjo-archer');
                this.isawaTadaka = this.player1.findCardByName('isawa-tadaka');

                this.solemnScholar = this.player2.findCardByName('solemn-scholar');
                this.stoneGuardian = this.player2.findCardByName('ancient-stone-guardian');
                this.assassination = this.player2.findCardByName('assassination');
            });

            it('should not be able to declare as an attacker ', function () {
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();

                this.initiateConflict({
                    type: 'military',
                    attackers: [this.stoneGuardian, this.solemnScholar],
                    defenders: []
                });
                expect(this.game.currentConflict.attackers).toContain(this.solemnScholar);
                expect(this.game.currentConflict.attackers).not.toContain(this.stoneGuardian);
            });
        });

        describe('forced interrupt', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['shinjo-archer', 'isawa-tadaka']
                    },
                    player2: {
                        inPlay: ['solemn-scholar', 'ancient-stone-guardian'],
                        hand: ['assassination']
                    }
                });

                this.shinjoArcher = this.player1.findCardByName('shinjo-archer');
                this.isawaTadaka = this.player1.findCardByName('isawa-tadaka');
                this.isawaTadaka.dishonor();

                this.solemnScholar = this.player2.findCardByName('solemn-scholar');
                this.stoneGuardian = this.player2.findCardByName('ancient-stone-guardian');
                this.assassination = this.player2.findCardByName('assassination');
            });

            it('lets players dishonor characters to draw cards', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shinjoArcher],
                    defenders: [this.solemnScholar],
                    type: 'military'
                });

                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.stoneGuardian);

                let p1HandSizeInit = this.player1.hand.length;
                let p2HandSizeInit = this.player2.hand.length;

                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).toHavePromptButton('Done');
                expect(this.player1).toBeAbleToSelect(this.shinjoArcher);
                expect(this.player1).not.toBeAbleToSelect(this.isawaTadaka);

                this.player1.clickCard(this.shinjoArcher);

                expect(this.player2).toHavePrompt('Choose a character');
                expect(this.player2).toHavePromptButton('Done');
                expect(this.player2).toBeAbleToSelect(this.solemnScholar);
                expect(this.player2).not.toBeAbleToSelect(this.stoneGuardian);

                this.player2.clickPrompt('Done');

                expect(this.shinjoArcher.isDishonored).toBe(true);
                expect(this.player1.hand.length).toBe(p1HandSizeInit + 1);
                expect(this.solemnScholar.isDishonored).toBe(false);
                expect(this.player2.hand.length).toBe(p2HandSizeInit);

                expect(this.getChatLogs(3)).toContain(
                    'player2 uses Ancient Stone Guardian to present an opportunity to sneak around Ancient Stone Guardian and find some secrets! player1 dishonors Shinjo Archer to draw a card.'
                );
            });

            it('skips a player prompt if they have no character to dishonor', function () {
                this.shinjoArcher.dishonor();

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shinjoArcher],
                    defenders: [this.solemnScholar],
                    type: 'military'
                });

                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.stoneGuardian);

                let p2HandSizeInit = this.player2.hand.length;

                expect(this.player1).not.toHavePrompt('Choose a character');

                expect(this.player2).toHavePrompt('Choose a character');
                expect(this.player2).toHavePromptButton('Done');
                expect(this.player2).toBeAbleToSelect(this.solemnScholar);
                expect(this.player2).not.toBeAbleToSelect(this.stoneGuardian);

                this.player2.clickCard(this.solemnScholar);

                expect(this.shinjoArcher.isDishonored).toBe(true);
                expect(this.solemnScholar.isDishonored).toBe(true);
                expect(this.player2.hand.length).toBe(p2HandSizeInit + 1);

                expect(this.getChatLogs(3)).toContain(
                    'player2 uses Ancient Stone Guardian to present an opportunity to sneak around Ancient Stone Guardian and find some secrets! player2 dishonors Solemn Scholar to draw a card.'
                );
            });
        });
    });
});
