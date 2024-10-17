describe('Bounty Hunter Crew', function () {
    integration(function (contextRef) {
        describe('Bounty Hunter Crew\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
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

            it('should return card to player hand from a discard pile', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bountyHunterCrew);
                context.player1.clickPrompt('Return an event from a discard pile');
                expect(context.player1).toBeAbleToSelectExactly([context.keepFighting, context.disarm, context.tacticalAdvantage]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.disarm);
                expect(context.player1.hand.length).toBe(1);
                expect(context.disarm.location).toBe('hand');
            });

            it('should return card to opponent hand from a discard pile', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bountyHunterCrew);
                context.player1.clickPrompt('Return an event from a discard pile');
                expect(context.player1).toBeAbleToSelectExactly([context.keepFighting, context.disarm, context.tacticalAdvantage]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.tacticalAdvantage);
                expect(context.player2.hand.length).toBe(1);
                expect(context.tacticalAdvantage.location).toBe('hand');
            });
        });
    });
});
