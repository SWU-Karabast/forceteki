describe('Underground Ophidiarium', function () {
    integration(function () {
        describe('Underground Ophidiarium\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['wandering-ronin'],
                        dynastyDiscard: ['underground-ophidiarium'],
                        conflictDeck: [
                            'fiery-madness',
                            'backhanded-compliment',
                            'kirei-ko'
                        ]
                    }
                });

                this.undergroundOphidiarium = this.player1.placeCardInProvince(
                    'underground-ophidiarium',
                    'province 1'
                );
            });

            it('should prompt the player to choose a card', function () {
                this.player1.clickCard(this.undergroundOphidiarium);
                expect(this.player1).toHavePrompt('Underground Ophidiarium');
            });

            it('should prompt for only poison attachments', function () {
                this.player1.clickCard(this.undergroundOphidiarium);
                expect(this.player1).toHavePrompt('Select a card to reveal');
                expect(this.player1).toHavePromptButton('Fiery Madness');
                expect(this.player1).not.toHavePromptButton(
                    'Backhanded Compliment'
                );
                expect(this.player1).not.toHavePromptButton('Kirei-ko');
            });

            it('should put the card in the player\'s hand', function () {
                let handsize = this.player1.player.hand.size();
                this.player1.clickCard(this.undergroundOphidiarium);
                this.player1.clickPrompt('Fiery Madness');
                expect(this.player1.player.hand.size()).toBe(handsize + 1);
            });

            it('should display message with chosen card name', function () {
                this.player1.clickCard(this.undergroundOphidiarium);
                this.player1.clickPrompt('Fiery Madness');
                expect(this.getChatLogs(3)).toContain(
                    'player1 uses Underground Ophidiarium, sacrificing Underground Ophidiarium to search conflict deck to reveal a poison attachment and add it to their hand'
                );
                expect(this.getChatLogs(2)).toContain(
                    'player1 takes Fiery Madness'
                );
                expect(this.getChatLogs(1)).toContain(
                    'player1 is shuffling their conflict deck'
                );
            });
        });
    });
});
