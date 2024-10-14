describe('Daring Raid', function() {
    integration(function(contextRef) {
        describe('Daring Raid\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('can deal damage to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.p1Base, context.wampa, context.imperialInterceptor, context.p2Base]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(2);
            });

            it('can deal damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.p1Base, context.wampa, context.imperialInterceptor, context.p2Base]);

                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);
            });
        });
    });
});
