describe('Forgery', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['doji-whisperer'],
                    hand: ['way-of-the-crane', 'backhanded-compliment']
                },
                player2: {
                    honor: 9,
                    hand: ['forgery']
                }
            });
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.crane = this.player1.findCardByName('way-of-the-crane');
            this.bhc = this.player1.findCardByName('backhanded-compliment');
            this.forgery = this.player2.findCardByName('forgery');
        });

        it('should allow events to be cancelled if less honorable', function() {
            this.player1.clickCard(this.crane);
            this.player1.clickCard(this.whisperer);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.forgery);
        });

        it('should cancel the event', function() {
            this.player1.clickCard(this.crane);
            this.player1.clickCard(this.whisperer);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.forgery);
            this.player2.clickCard(this.forgery);
            expect(this.whisperer.isHonored).toBe(false);
            expect(this.forgery.location).toBe('conflict discard pile');
            expect(this.getChatLogs(3)).toContain('player2 plays Forgery to cancel the effects of Way of the Crane');
        });

        it('should not allow events to be cancelled if equally honorable', function() {
            this.player1.honor = 10;
            this.player2.honor = 10;
            this.player1.clickCard(this.crane);
            this.player1.clickCard(this.whisperer);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).not.toBeAbleToSelect(this.forgery);
            expect(this.whisperer.isHonored).toBe(true);
        });

        it('should not allow events to be cancelled if more honorable', function() {
            this.player1.honor = 10;
            this.player2.honor = 11;
            this.player1.clickCard(this.crane);
            this.player1.clickCard(this.whisperer);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).not.toBeAbleToSelect(this.forgery);
            expect(this.whisperer.isHonored).toBe(true);
        });
    });
});
