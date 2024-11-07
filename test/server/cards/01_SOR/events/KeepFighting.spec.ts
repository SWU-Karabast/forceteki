describe('Keep Fighting', function () {
    integration(function (contextRef) {
        describe('Keep Fighting\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['keep-fighting'],
                        groundArena: ['pyke-sentinel', 'wampa'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, damage: 4 }
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('should ready a unit', function () {
                const { context } = contextRef;

                context.pykeSentinel.exhausted = true;
                context.wampa.exhausted = true;

                // ready pyke sentinel (sabine is not exhausted and wampa is too powerful)
                context.player1.clickCard(context.keepFighting);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.sabineWren, context.imperialInterceptor]);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel.exhausted).toBeFalse();
                expect(context.keepFighting.location).toBe('discard');
                context.player2.passAction();

                // attack again with pyke sentinel
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickCard(context.p2Base);

                // damage should be 2 here
                expect(context.p2Base.damage).toBe(2);
                expect(context.pykeSentinel.exhausted).toBeTrue();
            });

            it('should skip target selection if there are no exhausted targets', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.keepFighting);
                expect(context.keepFighting.location).toBe('discard');
                context.player2.passAction();
            });
        });
    });
});
