describe('Hondo Ohnaka, You Better Hurry', function() {
    integration(function(contextRef) {
        describe('Hondo Ohnaka\'s ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hondo-ohnaka#you-better-hurry', 'pyke-sentinel']
                    },
                    player2: {
                        groundArena: ['jawa-scavenger']
                    },
                });
            });

            it('gives each other friendly unit Raid 1 (not self)', function () {
                const { context } = contextRef;

                // Attack with Pyke Sentinel; with Raid 1 it should deal 3 damage to base (power 2 + 1)
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                // Now attack with Hondo himself; he should not gain his own Raid 1 (base 6 damage)
                context.player2.passAction();
                context.player1.clickCard(context.hondoOhnaka);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3 + 6);
            });

            it('affects only friendly units', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // Opponent Jawa Scavenger should not get Raid 1 from your Hondo
                context.player2.clickCard(context.jawaScavenger);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2); // baseline power 4
            });
        });
    });
});
