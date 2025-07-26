describe('Recovery', function() {
    integration(function(contextRef) {
        describe('Recovery\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['recovery'],
                        groundArena: [{ card: 'wampa', damage: 2 }, { card: 'consular-security-force', damage: 6 }],
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 4 }, 'pyke-sentinel'],
                        spaceArena: [{ card: 'cartel-spacer', damage: 1 }]
                    }
                });
            });

            it('can heal a unit with less than 5 damage, removing all damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.recovery);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.pykeSentinel, context.atst, context.consularSecurityForce]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(0);
            });

            it('can heal a unit with more than 5 damage, reducing damage by 5', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.recovery);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.pykeSentinel, context.atst, context.consularSecurityForce]);

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(1);
            });

            it('can heal an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.recovery);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.pykeSentinel, context.atst, context.consularSecurityForce]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.damage).toBe(0);
            });
        });
    });
});