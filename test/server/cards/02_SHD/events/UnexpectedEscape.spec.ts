describe('Unexpected Escape', function() {
    integration(function(contextRef) {
        it('Unexpected Escape\'s event ability', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['unexpected-escape'],
                    groundArena: ['wampa', 'atst']
                },
                player2: {
                    hand: ['discerning-veteran', 'take-captive']
                }
            });

            const { context } = contextRef;

            // setup for Discerning Veteran to have multiple captured cards
            context.player1.passAction();
            context.player2.clickCard(context.discerningVeteran);
            context.player2.clickCard(context.wampa);
            context.player1.passAction();
            context.player2.clickCard(context.takeCaptive);
            // Take Captive automatically resolves

            expect(context.wampa).toBeCapturedBy(context.discerningVeteran);
            expect(context.atst).toBeCapturedBy(context.discerningVeteran);

            context.discerningVeteran.exhausted = false;
            context.player1.clickCard(context.unexpectedEscape);
            expect(context.discerningVeteran.exhausted).toBeTrue();
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
        });
    });
});
