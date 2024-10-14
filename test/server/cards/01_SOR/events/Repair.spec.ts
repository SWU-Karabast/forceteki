describe('Repair', function() {
    integration(function(contextRef) {
        describe('Repair\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
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

                context.wampa.damage = 3;
                context.player1.clickCard(context.repair);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.p1Base, context.wampa, context.imperialInterceptor, context.p2Base]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(0);
            });

            it('can heal a base', function () {
                const { context } = contextRef;

                context.p1Base.damage = 3;

                context.player1.clickCard(context.repair);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.p1Base, context.wampa, context.imperialInterceptor, context.p2Base]);

                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(0);
            });

            it('can select a target with no damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.repair);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.p1Base, context.wampa, context.imperialInterceptor, context.p2Base]);

                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(0);
            });

            it('will heal a target with 1 or 2 damage to full', function () {
                const { context } = contextRef;

                context.p1Base.damage = 2;

                context.player1.clickCard(context.repair);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.p1Base, context.wampa, context.imperialInterceptor, context.p2Base]);

                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(0);
            });
        });
    });
});
