describe('Promising Youth', function () {
    integration(function () {
        describe('Promising Youth as an attachment', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doji-whisperer', 'doji-kuwanan', 'kitsu-spiritcaller'],
                        hand: ['a-new-name', 'promising-youth', 'backhanded-compliment']
                    },
                    player2: {
                        inPlay: [],
                        hand: ['backhanded-compliment', 'let-go', 'assassination']
                    }
                });

                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.kuwanan = this.player1.findCardByName('doji-kuwanan');
                this.newName = this.player1.findCardByName('a-new-name');
                this.youth = this.player1.findCardByName('promising-youth');
                this.spiritcaller = this.player1.findCardByName('kitsu-spiritcaller');
                this.p1BHC = this.player1.findCardByName('backhanded-compliment');
                this.p2BHC = this.player2.findCardByName('backhanded-compliment');
                this.assassination = this.player2.findCardByName('assassination');
                this.letGo = this.player2.findCardByName('let-go');
            });

            it('can be played as an attachment', function () {
                this.player1.clickCard(this.youth);
                this.player1.clickPrompt('Play Promising Youth as an attachment');
                this.player1.clickCard(this.whisperer);
                expect(this.whisperer.attachments.length).toBe(1);
                expect(this.whisperer.getMilitarySkill()).toBe(this.whisperer.printedMilitarySkill + 2);
                expect(this.whisperer.getPoliticalSkill()).toBe(this.whisperer.printedPoliticalSkill + 2);
            });

            it('should be treated as an attachment in play', function () {
                this.player1.clickCard(this.youth);
                this.player1.clickPrompt('Play Promising Youth as an attachment');
                this.player1.clickCard(this.whisperer);

                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.whisperer, this.kuwanan],
                    defenders: []
                });

                this.player2.clickCard(this.assassination);
                expect(this.player2).toBeAbleToSelect(this.whisperer);
                expect(this.player2).not.toBeAbleToSelect(this.youth);

                this.player2.clickPrompt('Cancel');

                this.player2.clickCard(this.letGo);
                expect(this.player2).toBeAbleToSelect(this.youth);
            });

            it('should be treated as a character if it goes to the discard pile', function () {
                this.player1.clickCard(this.youth);
                this.player1.clickPrompt('Play Promising Youth as an attachment');
                this.player1.clickCard(this.whisperer);

                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.whisperer, this.kuwanan],
                    defenders: []
                });

                this.player2.clickCard(this.letGo);
                this.player2.clickCard(this.youth);
                expect(this.youth.location).toBe('conflict discard pile');

                this.player1.clickCard(this.spiritcaller);
                expect(this.player1).toBeAbleToSelect(this.youth);
                this.player1.clickCard(this.youth);
                expect(this.youth.location).toBe('play area');
            });

            it('can be played as a character', function () {
                this.player1.clickCard(this.youth);
                this.player1.clickPrompt('Play this character');
                this.player1.clickPrompt('0');
                expect(this.youth.location).toBe('play area');
            });

            it('should detach after owner leaves play', function () {
                this.player1.clickCard(this.youth);
                this.player1.clickPrompt('Play Promising Youth as an attachment');
                this.player1.clickCard(this.whisperer);

                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.whisperer, this.kuwanan],
                    defenders: []
                });

                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.whisperer);
                this.player1.clickCard(this.youth);
                expect(this.whisperer.location).toBe('dynasty discard pile');
                expect(this.youth.location).toBe('play area');
            });
        });
    });
});
