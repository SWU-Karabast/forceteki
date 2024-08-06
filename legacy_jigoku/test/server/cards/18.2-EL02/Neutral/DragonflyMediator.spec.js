describe('Dragonfly Mediator', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['dragonfly-mediator'],
                    hand: ['i-can-swim', 'way-of-the-scorpion']
                },
                player2: {
                    hand: ['a-fate-worse-than-death', 'way-of-the-crane', 'let-go']
                }
            });

            this.mediator = this.player1.findCardByName('dragonfly-mediator');
            this.swim = this.player1.findCardByName('i-can-swim');
            this.scorpion = this.player1.findCardByName('way-of-the-scorpion');

            this.afwtd = this.player2.findCardByName('a-fate-worse-than-death');
            this.crane = this.player2.findCardByName('way-of-the-crane');
            this.letGo = this.player2.findCardByName('let-go');
        });

        it('should prompt each player to reveal a card from their hand', function() {
            this.player1.clickCard(this.mediator);
            expect(this.player1).toHavePrompt('Choose a card to reveal');
            expect(this.player1).toBeAbleToSelect(this.swim);
            expect(this.player1).toBeAbleToSelect(this.scorpion);

            this.player1.clickCard(this.swim);

            expect(this.getChatLogs(8)).not.toContain('player1 uses Dragonfly Mediator to have each player reveal cards from their hand');
            expect(this.getChatLogs(8)).not.toContain('Dragonfly Mediator sees I Can Swim from player1');

            expect(this.player2).toHavePrompt('Choose three cards to reveal');
            expect(this.player2).toBeAbleToSelect(this.afwtd);
            expect(this.player2).toBeAbleToSelect(this.crane);
            expect(this.player2).toBeAbleToSelect(this.letGo);

            this.player2.clickCard(this.crane);
            this.player2.clickCard(this.afwtd);
            this.player2.clickCard(this.letGo);
            this.player2.clickPrompt('Done');

            expect(this.getChatLogs(8)).toContain('player1 uses Dragonfly Mediator to have each player reveal cards from their hand');
            expect(this.getChatLogs(8)).toContain('Dragonfly Mediator sees I Can Swim from player1');
            expect(this.getChatLogs(8)).toContain('Dragonfly Mediator sees Way of the Crane, A Fate Worse Than Death and Let Go from player2');
        });
    });
});
