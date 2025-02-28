describe('Repair', function() {
    integration(function(contextRef) {
        describe('Repair\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['repair'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('can heal a unit', function () {
                const { context } = contextRef;

                context.setDamage(context.wampa, 3);
                context.player1.clickCard(context.repair);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.p1Base, context.wampa, context.imperialInterceptor, context.p2Base]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(0);
            });

            it('can heal a base', function () {
                const { context } = contextRef;

                context.setDamage(context.p1Base, 3);

                context.player1.clickCard(context.repair);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.p1Base, context.wampa, context.imperialInterceptor, context.p2Base]);

                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(0);
            });

            it('no prompt if there is not any unit or base with damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.repair);
                expect(context.player2).toBeActivePlayer();
                expect(context.repair).toBeInZone('discard');
                expect(context.p1Base.damage).toBe(0);

                // no unit or base with damage, no prompt happens
            });

            it('will heal a target with 1 or 2 damage to full', function () {
                const { context } = contextRef;

                context.setDamage(context.p1Base, 2);

                context.player1.clickCard(context.repair);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.p1Base, context.wampa, context.imperialInterceptor, context.p2Base]);

                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(0);
            });
        });
    });
});
