describe('Kylo Ren, Relentless', function() {
    integration(function(contextRef) {
        describe('its On Attack ability', function() {
            it('readies himself after his first attack this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['kylo-ren#relentless']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.kyloRen);
                context.player1.clickCard(context.p2Base);

                expect(context.kyloRen.exhausted).toBeFalse();
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('can attack again in the same phase, and stays exhausted after the second attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['kylo-ren#relentless']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.passAction();

                // First attack — Kylo readies
                context.player1.clickCard(context.kyloRen);
                context.player1.clickCard(context.p2Base);
                expect(context.kyloRen.exhausted).toBeFalse();

                context.player2.passAction();

                // Second attack — no ready this time
                context.player1.clickCard(context.kyloRen);
                context.player1.clickCard(context.p2Base);

                expect(context.kyloRen.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(10);
                expect(context.player2).toBeActivePlayer();
            });

            it('readies again if he attacks after being defeated and revived this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['takedown', 'nightbrother#mauls-gauntlet'],
                        groundArena: ['kylo-ren#relentless']
                    },
                    player2: {
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;
                const nightbrother = context.player1.findCardByName('nightbrother#mauls-gauntlet', 'hand');

                context.player2.passAction();

                // First attack — Kylo readies
                context.player1.clickCard(context.kyloRen);
                context.player1.clickCard(context.p2Base);
                expect(context.kyloRen.exhausted).toBeFalse();

                context.player2.passAction();

                // Defeat Kylo with Takedown (5 HP remaining)
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.kyloRen);
                expect(context.kyloRen).toBeInZone('discard');

                context.player2.passAction();

                // Nightbrother's When Played revives Kylo for 2 (5 - 3) and he enters play ready
                context.player1.clickCard(nightbrother);
                context.player1.clickCard(context.kyloRen);
                expect(context.kyloRen).toBeInZone('groundArena');
                expect(context.kyloRen.exhausted).toBeFalse();
                context.player2.passAction();

                // Re-entered Kylo is a new game object — his first attack this phase readies him again
                context.player1.clickCard(context.kyloRen);
                context.player1.clickCard(context.p2Base);

                expect(context.kyloRen.exhausted).toBeFalse();
                expect(context.p2Base.damage).toBe(10);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
