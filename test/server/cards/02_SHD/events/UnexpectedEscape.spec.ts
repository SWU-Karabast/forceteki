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

            context.discerningVeteran.exhausted = false;
            context.player1.clickCard(context.unexpectedEscape);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            context.player1.clickCard(context.wampa);

            expect(context.discerningVeteran.exhausted).toBeTrue();
            expect(context.wampa).not.toBeCapturedBy(context.discerningVeteran);
            expect(context.wampa).toBeInZone('groundArena');
            expect(context.wampa.exhausted).toBeTrue();
            expect(context.atst).toBeCapturedBy(context.discerningVeteran);
        });
    });
});
