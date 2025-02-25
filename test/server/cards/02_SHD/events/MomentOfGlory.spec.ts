describe('Moment of Glory', function () {
    integration(function (contextRef) {
        describe('Moment of Glory\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['moment-of-glory'],
                        groundArena: [{ card: 'pyke-sentinel' }],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, damage: 4 }
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['imperial-interceptor']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('can buff a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.momentOfGlory);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.atst, context.sabineWren, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel.getPower()).toBe(6);
                expect(context.pykeSentinel.getHp()).toBe(7);

                context.player2.clickCard(context.atst);
                // pyke sentinel is automatically choose
                expect(context.atst.damage).toBe(6);
                expect(context.pykeSentinel.damage).toBe(6);
                expect(context.pykeSentinel).toBeInZone('groundArena');
            });
        });
    });
});
