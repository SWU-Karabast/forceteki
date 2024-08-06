describe('Let Him Go By', function () {
    integration(function () {
        describe('Reaction side', function () {
            beforeEach(function () {
                this.setupTest({
                    gameMode: 'emerald',
                    phase: 'conflict',
                    player1: {
                        fate: 20,
                        inPlay: ['daidoji-akikore', 'kakita-yoshi'],
                        hand: ['one-with-the-sea', 'steward-of-law']
                    },
                    player2: {
                        inPlay: [],
                        hand: ['let-him-go-by']
                    }
                });

                this.akikore = this.player1.findCardByName('daidoji-akikore');
                this.yoshi = this.player1.findCardByName('kakita-yoshi');
                this.oneWithTheSea = this.player1.findCardByName('one-with-the-sea');
                this.stewardOfLaw = this.player1.findCardByName('steward-of-law');

                this.goBy = this.player2.findCardByName('let-him-go-by');

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.akikore],
                    defenders: []
                });
                this.player2.pass();
            });

            it('bows a character that moves into a conflict', function () {
                this.player1.clickCard(this.oneWithTheSea);
                this.player1.clickCard(this.yoshi);

                expect(this.player2).toHavePrompt('Triggered Abilities');
                this.player2.clickCard(this.goBy);
                expect(this.getChatLogs(10)).toContain('player2 plays Let Him Go By to bow Kakita Yoshi');
            });

            it('bows a character that is played into a conflict', function () {
                this.player1.clickCard(this.stewardOfLaw);
                this.player1.clickPrompt('0');
                this.player1.clickPrompt('Conflict');

                expect(this.player2).toHavePrompt('Triggered Abilities');
                this.player2.clickCard(this.goBy);
                expect(this.getChatLogs(10)).toContain('player2 plays Let Him Go By to bow Steward of Law');
            });
        });

        describe('Duel side', function () {
            beforeEach(function () {
                this.setupTest({
                    gameMode: 'emerald',
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kakita-taneharu', 'army-of-the-rising-wave'],
                        hand: ['let-him-go-by']
                    },
                    player2: {
                        inPlay: ['one-of-the-forgotten', 'miya-mystic'],
                        hand: ['fine-katana']
                    }
                });

                this.taneharu = this.player1.findCardByName('kakita-taneharu');
                this.army = this.player1.findCardByName('army-of-the-rising-wave');
                this.goBy = this.player1.findCardByName('let-him-go-by');

                this.oneOfTheForgotten = this.player2.findCardByName('one-of-the-forgotten');
                this.miyaMystic = this.player2.findCardByName('miya-mystic');
                this.fineKatana = this.player2.findCardByName('fine-katana');

                this.player1.pass();
                this.player2.playAttachment(this.fineKatana, this.oneOfTheForgotten);

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.taneharu],
                    defenders: [this.miyaMystic]
                });
            });

            it('is initiated by a participating character', function () {
                this.player2.pass();
                this.player1.clickCard(this.goBy);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).toBeAbleToSelect(this.taneharu);
                expect(this.player1).not.toBeAbleToSelect(this.army);
            });

            it('can challenge a character at home or in the conflict', function () {
                this.player2.pass();
                this.player1.clickCard(this.goBy);
                this.player1.clickCard(this.taneharu);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).toBeAbleToSelect(this.oneOfTheForgotten);
                expect(this.player1).toBeAbleToSelect(this.miyaMystic);
            });

            it('gives the winner a skill bonus equal to the loser', function () {
                this.player2.pass();
                this.player1.clickCard(this.goBy);
                this.player1.clickCard(this.taneharu);
                this.player1.clickCard(this.oneOfTheForgotten);
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                expect(this.getChatLogs(10)).toContain('Duel Effect: Kakita Taneharu gets +6military skill');
                expect(this.taneharu.getMilitarySkill()).toBe(12);
            });
        });
    });
});