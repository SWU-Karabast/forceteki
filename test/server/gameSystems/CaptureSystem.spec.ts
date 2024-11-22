describe('Capture mechanic', function() {
    integration(function (contextRef) {
        describe('When a unit is captured', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['discerning-veteran']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // capture Wampa with Discerning Veteran
                context.player1.clickCard(context.discerningVeteran);
            });

            it('it should be in the captor\'s capture zone', function () {
                const { context } = contextRef;

                expect(context.wampa).toBeCapturedBy(context.discerningVeteran);
            });

            it('and the captor is defeated, it should ', function () {
                const { context } = contextRef;

                expect(context.wampa).toBeCapturedBy(context.discerningVeteran);
            });
        });
    });
});
