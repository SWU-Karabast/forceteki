describe('Aurra Sing, Crackshot Sniper', function () {
    integration(function (contextRef) {
        describe('Aurra Sing\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['aurra-sing#crackshot-sniper'],
                    },
                    player2: {
                        groundArena: ['atst', 'wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('should ready when an enemy unit attacks my base', function () {
                const { context } = contextRef;

                context.aurraSing.exhausted = true;
                context.player1.passAction();

                // a ground enemy unit attack base, aurra sing ready
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);
                expect(context.aurraSing.exhausted).toBeFalse();

                context.aurraSing.exhausted = true;
                context.player1.passAction();

                // a space enemy unit attack base, aurra sing should be exhausted
                context.player2.clickCard(context.imperialInterceptor);
                expect(context.aurraSing.exhausted).toBeTrue();

                context.aurraSing.exhausted = true;
                context.player1.passAction();

                // wampa do not attack base, aurra sing should be exhausted
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.aurraSing);
                expect(context.aurraSing.exhausted).toBeTrue();
            });
        });
    });
});
