describe('Mediator of Hostilites', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['mediator-of-hostilities']
                },
                player2: {
                    inPlay: []
                }
            });

            this.mediator = this.player1.findCardByName('mediator-of-hostilities');
        });

        it('should trigger when a player passes a conflict declaration', function() {
            this.noMoreActions();
            this.player1.clickPrompt('Pass Conflict');
            this.player1.clickPrompt('Yes');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.mediator);
        });

        it('if triggered, should draw you a card', function() {
            let cards = this.player1.hand.length;
            this.noMoreActions();
            this.player1.clickPrompt('Pass Conflict');
            this.player1.clickPrompt('Yes');
            this.player1.clickCard(this.mediator);
            expect(this.player1.hand.length).toBe(cards + 1);
        });

        it('should be able to be triggered a maximum of 2 times per round', function() {
            this.noMoreActions();
            this.player1.clickPrompt('Pass Conflict');
            this.player1.clickPrompt('Yes');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.mediator);
            this.player1.clickCard(this.mediator);
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.mediator);
            this.player1.clickCard(this.mediator);
            this.noMoreActions();
            this.player1.clickPrompt('Pass Conflict');
            this.player1.clickPrompt('Yes');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.mediator);
        });
    });
});
