describe('Kachirho Militia', function () {
    integration(function (contextRef) {
        describe('Kachirho Militia\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'kachirho-militia', exhausted: true }, 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['atst', 'wampa'],
                        spaceArena: ['imperial-interceptor'],
                        hasInitiative: true
                    },
                });
            });

            it('should ready when an enemy ground unit attacks my base', function () {
                const { context } = contextRef;

                // a ground enemy unit attack base, ready
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);
                expect(context.kachirhoMilitia.exhausted).toBeFalse();

                context.player1.clickCard(context.kachirhoMilitia);
                context.player1.clickCard(context.p2Base);

                // wampa attack base, militia should stay exhausted
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);
                expect(context.kachirhoMilitia.exhausted).toBeTrue();
            });

            it('should not ready when an enemy space unit attacks my base', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.imperialInterceptor);
                context.player2.clickCard(context.p1Base);
                expect(context.kachirhoMilitia.exhausted).toBeTrue();
            });

            it('should not ready when a friendly ground unit attacks enemy base', function () {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.kachirhoMilitia.exhausted).toBeTrue();
            });
        });
    });
});