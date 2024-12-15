describe('Confederate Tri-Fighter', function () {
    integration(function (contextRef) {
        describe('Confederate Tri-Fighter\'s ability', function () {
            it('should cancel heal on bases', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['repair'],
                        groundArena: ['admiral-ackbar#brilliant-strategist'],
                        spaceArena: ['confederate-trifighter'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        hand: ['smugglers-aid'],
                        groundArena: ['yoda#old-master'],
                        spaceArena: ['corellian-freighter'],
                        base: { card: 'capital-city', damage: 5 }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                function reset() {
                    context.setDamage(context.p1Base, 5);
                    context.setDamage(context.p2Base, 5);
                }

                context.player1.clickCard(context.admiralAckbar);
                context.player1.clickCard(context.p2Base);

                // restore 1 from ackbar do not work
                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(5);

                reset();

                context.player2.clickCard(context.yoda);
                context.player2.clickCard(context.p1Base);

                // restore 2 from yoda do not work
                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);

                reset();

                // play repair
                context.player1.clickCard(context.repair);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.admiralAckbar, context.yoda, context.confederateTrifighter, context.corellianFreighter]);
                context.player1.clickCard(context.p1Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(5);

                context.player2.passAction();

                // kill confederate tri-fighter, base healing should work
                context.player1.clickCard(context.confederateTrifighter);
                expect(context.confederateTrifighter).toBeInZone('discard');

                // heal 3 damage from base
                context.player2.clickCard(context.smugglersAid);
                expect(context.p2Base.damage).toBe(2);
            });
        });
    });
});
