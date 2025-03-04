describe('Apology Accepted', function () {
    integration(function (contextRef) {
        describe('Apology Accepted\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['apology-accepted'],
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['imperial-interceptor'],
                    }
                });
            });

            it('should defeat a friendly unit then give 2 experience tokens to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.apologyAccepted);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tielnFighter]);
                context.player1.clickCard(context.tielnFighter);
                expect(context.tielnFighter).toBeInZone('discard');

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.imperialInterceptor, context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience']);
            });
        });
    });
});
