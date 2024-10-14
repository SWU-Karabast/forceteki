describe('Covert Strength', function () {
    integration(function () {
        describe('Covert Strength\'s ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['covert-strength'],
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

                context.player1.clickCard(context.covertStrength);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.sabineWren, context.cartelSpacer, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.sabineWren);
                expect(context.sabineWren.damage).toBe(2);
                expect(context.sabineWren).toHaveExactUpgradeNames(['experience']);
            });

            it('can fully-heal a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.covertStrength);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.sabineWren, context.cartelSpacer, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel.damage).toBe(0);
                expect(context.pykeSentinel).toHaveExactUpgradeNames(['experience']);
            });

            it('can select a target with no damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.covertStrength);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.sabineWren, context.cartelSpacer, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
