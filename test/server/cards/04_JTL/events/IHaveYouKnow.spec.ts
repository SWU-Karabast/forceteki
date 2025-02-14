describe('I Have You Now', function() {
    integration(function(contextRef) {
        it('I Have You Now\'s ability should start an attack with Vehicle unit and prevent all combat damage for that attack', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['i-have-you-now'],
                    groundArena: ['pyke-sentinel', 'atst'],
                    spaceArena: ['imperial-interceptor']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Play the event
            context.player1.clickCard(context.iHaveYouNow);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.imperialInterceptor]);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.wampa);

            // Assert prevented damage
            expect(context.atst.damage).toBe(0);
        });
    });
});
