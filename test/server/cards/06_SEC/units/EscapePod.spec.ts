describe('Escape Pod', function () {
    integration(function (contextRef) {
        describe('Escape Pod\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['escape-pod'],
                        groundArena: ['clone-deserter', 'atst'],
                        spaceArena: ['awing', 'mynock'],
                        leader: { card: 'wedge-antilles#leader-of-red-squadron', deployed: true }
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('may capture a friendly non-Vehicle, non-leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.escapePod);

                expect(context.player1).toBeAbleToSelectExactly([context.cloneDeserter, context.mynock]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.cloneDeserter);

                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player2.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player2.handSize).toBe(1);
                expect(context.cloneDeserter).toBeCapturedBy(context.escapePod);
            });
        });
    });
});
