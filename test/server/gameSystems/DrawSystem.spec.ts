describe('Drawing cards', function() {
    integration(function (contextRef) {
        describe('When a player draws cards', function() {
            beforeEach(function () {
                contextRef.setupTest({
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

            it('over the amount in their deck due to their own action, they should draw the remainder and take damage equal to thrice the difference', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.missionBriefing);
                context.player1.clickPrompt('You');
                expect(context.player1.base.damage).toBe(3);
                expect(context.player1.hand.length).toBe(2);
                expect(context.wampa).toBeInLocation('hand');
                expect(context.player1.deck.length).toBe(0);
            });

            it('over the amount in their deck due to and during an opponent\'s action, they should draw the remainder and take damage equal to thrice the difference', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.missionBriefing);
                context.player1.clickPrompt('Opponent');
                expect(context.player2.base.damage).toBe(3);
                expect(context.player2.hand.length).toBe(1);
                expect(context.player2.deck.length).toBe(0);
            });

            it('from an empty deck, they should take damage equal to thrice the number of draws', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.patrollingVwing);
                expect(context.player1.base.damage).toBe(0);
                expect(context.player1.hand.length).toBe(2);
                expect(context.player1.deck.length).toBe(0);

                context.player2.passAction();

                context.player1.clickCard(context.missionBriefing);
                context.player1.clickPrompt('You');
                expect(context.player1.base.damage).toBe(6);
                expect(context.player1.hand.length).toBe(1);
                expect(context.player1.deck.length).toBe(0);
            });
        });
    });
});
