describe('Too Strong For Blasters', function() {
    integration(function(contextRef) {
        describe('Too Strong For Blasters\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['too-strong-for-blasters'],
                        groundArena: ['wampa', { card: 'yoda#old-master', damage: 3 }],
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: [{ card: 'cartel-spacer', damage: 1 }]
                    }
                });
            });

            it('can heal a unit with 1 damage, removing all damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.tooStrongForBlasters);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.pykeSentinel, context.yoda]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.cartelSpacer).toBeInZone('spaceArena', context.player2);
            });

            it('can heal a unit with more than 2 damage, reducing damage by 2', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.tooStrongForBlasters);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.pykeSentinel, context.yoda]);

                context.player1.clickCard(context.yoda);
                expect(context.yoda.damage).toBe(1);
            });

            it('can target an undamaged unit, but has no effect', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.tooStrongForBlasters);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.pykeSentinel, context.yoda]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(0);
            });
        });
    });
});