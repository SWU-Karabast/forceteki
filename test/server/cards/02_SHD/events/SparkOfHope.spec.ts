describe('Spark of Hope', function () {
    integration(function (contextRef) {
        describe('Spark of Hope\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['spark-of-hope'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['imperial-interceptor'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['mercenary-gunship']
                    }
                });
            });

            it('can resource a unit defeated this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.imperialInterceptor);
                context.player1.clickCard(context.mercenaryGunship);

                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.sparkOfHope);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.imperialInterceptor]);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.player2).toBeActivePlayer();
                expect(context.pykeSentinel).toBeInZone('resource');
                expect(context.imperialInterceptor).toBeInZone('discard');
            });
        });
    });
});
