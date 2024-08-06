describe('Appeal to Sympathy', function() {
    integration(function() {
        describe('Appeal to Sympathy', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doji-whisperer'],
                        hand: ['way-of-the-crane', 'backhanded-compliment']
                    },
                    player2: {
                        hand: ['appeal-to-sympathy']
                    }
                });
                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.crane = this.player1.findCardByName('way-of-the-crane');
                this.bhc = this.player1.findCardByName('backhanded-compliment');
                this.appeal = this.player2.findCardByName('appeal-to-sympathy');
            });

            it('should allow events to be cancelled', function() {
                this.player1.clickCard(this.crane);
                this.player1.clickCard(this.whisperer);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.appeal);
            });

            it('should cancel the event', function() {
                this.player1.clickCard(this.crane);
                this.player1.clickCard(this.whisperer);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.appeal);
                this.player2.clickCard(this.appeal);
                expect(this.whisperer.isHonored).toBe(false);
                expect(this.appeal.location).toBe('conflict discard pile');
                expect(this.getChatLogs(3)).toContain('player2 plays Appeal to Sympathy to cancel the effects of Way of the Crane and place it on the top of player1\'s conflict deck');
            });

            it('should put the event on top of the deck', function() {
                let deckSize = this.player1.conflictDeck.length;
                this.player1.clickCard(this.crane);
                this.player1.clickCard(this.whisperer);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.appeal);
                this.player2.clickCard(this.appeal);
                expect(this.whisperer.isHonored).toBe(false);
                expect(this.crane.location).toBe('conflict deck');
                expect(this.player1.conflictDeck.length).toBe(deckSize + 1);
                expect(this.player1.conflictDeck[0]).toBe(this.crane);
            });

            it('should allow re-playing the event if you draw it', function() {
                this.player1.clickCard(this.crane);
                this.player1.clickCard(this.whisperer);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.appeal);
                this.player2.clickCard(this.appeal);
                expect(this.whisperer.isHonored).toBe(false);

                this.player2.pass();
                this.player1.clickCard(this.bhc);
                this.player1.clickPrompt('player1');
                expect(this.crane.location).toBe('hand');
                this.player2.pass();
                this.player1.clickCard(this.crane);
                this.player1.clickCard(this.whisperer);
                expect(this.whisperer.isHonored).toBe(true);
            });
        });
    });
});
