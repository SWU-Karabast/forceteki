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
                        groundArena: ['wampa'],
                        hand: ['vanquish', 'waylay']
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

            it('and the captor is defeated, it should return to its owner\'s arena exhausted', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                expect(context.discerningVeteran).toBeInZone('discard');
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.wampa.exhausted).toBeTrue();
            });

            it('and the captor is returned to hand, it should return to its owner\'s arena exhausted', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.waylay);
                expect(context.discerningVeteran).toBeInZone('hand');
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.wampa.exhausted).toBeTrue();
            });
        });
    });
});
