describe('Bounty Hunter Crew', function () {
    integration(function () {
        describe('Bounty Hunter Crew\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['bounty-hunter-crew'],
                        groundArena: ['pyke-sentinel'],
                        discard: ['keep-fighting', 'green-squadron-awing', 'disarm']
                    },
                    player2: {
                        discard: ['tactical-advantage']
                    }
                });
            });

            it('should return card to player hand', function () {
                this.player1.clickCard(this.bountyHunterCrew);
                this.player1.clickPrompt('Return an event from a discard pile');
                expect(this.player1).toBeAbleToSelectExactly([this.keepFighting, this.disarm, this.tacticalAdvantage]);
                this.player1.clickCard(this.disarm);
                expect(this.player1.hand.length).toBe(1);
            });

            it('should return card to opponent hand', function () {
                this.player1.clickCard(this.bountyHunterCrew);
                this.player1.clickPrompt('Return an event from a discard pile');
                expect(this.player1).toBeAbleToSelectExactly([this.keepFighting, this.disarm, this.tacticalAdvantage])
                this.player1.clickCard(this.tacticalAdvantage);
                expect(this.player2.hand.length).toBe(1)
            });
        });
    });
});
