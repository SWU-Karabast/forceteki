describe('Perseverance', function () {
    integration(function (contextRef) {
        describe('Perseverance\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['perseverance'],
                        groundArena: [{ card: 'pyke-sentinel', damage: 1 }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, damage: 4 }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('can heal a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.perseverance);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.sabineWren, context.cartelSpacer, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.sabineWren);
                expect(context.sabineWren.damage).toBe(1);
                expect(context.sabineWren).toHaveExactUpgradeNames(['shield']);
            });

            it('can fully-heal a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.perseverance);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.sabineWren, context.cartelSpacer, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel.damage).toBe(0);
                expect(context.pykeSentinel).toHaveExactUpgradeNames(['shield']);
            });

            it('can select a target with no damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.perseverance);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.sabineWren, context.cartelSpacer, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});