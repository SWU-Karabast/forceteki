describe('Drawing cards', function() {
    integration(function() {
        describe('When a player draws cards', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['patrolling-vwing', 'mission-briefing'],
                        deck: ['wampa']
                    },
                    player2: {
                        deck: ['cartel-spacer']
                    }
                });
            });

            it('over the amount in their deck, they should draw the remainder and take damage equal to thrice the difference', function () {
                this.player1.clickCard(this.missionBriefing);
                this.player1.clickPrompt('You');
                expect(this.player1.base.damage).toBe(3);
                expect(this.player1.hand.length).toBe(2);
                expect(this.wampa).toBeInLocation('hand');
                expect(this.player1.deck.length).toBe(0);
            });

            it('over the amount in their deck, they should draw the remainder and take damage equal to thrice the difference', function () {
                this.player1.clickCard(this.missionBriefing);
                this.player1.clickPrompt('Opponent');
                expect(this.player2.base.damage).toBe(3);
                expect(this.player2.hand.length).toBe(1);
                expect(this.player2.deck.length).toBe(0);
            });

            it('from an empty deck, they should take damage equal to thrice the number of draws', function () {
                this.player1.clickCard(this.patrollingVwing);
                expect(this.player1.base.damage).toBe(0);
                expect(this.player1.hand.length).toBe(2);
                expect(this.player1.deck.length).toBe(0);

                this.player2.passAction();

                this.player1.clickCard(this.missionBriefing);
                this.player1.clickPrompt('You');
                expect(this.player1.base.damage).toBe(6);
                expect(this.player1.hand.length).toBe(1);
                expect(this.player1.deck.length).toBe(0);
            });
        });
    });
});
