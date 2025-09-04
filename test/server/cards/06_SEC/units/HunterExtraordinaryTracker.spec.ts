describe('Hunter, Extraordinary Tracker', function () {
    integration(function (contextRef) {
        describe('Hunter\'s on attack ability', function () {
            it('should give the exhausted defender -4/-0 for this attack', async function () {
                const { context } = contextRef;
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hunter#extraordinary-tracker']
                    },
                    player2: {
                        groundArena: [{ card: 'darth-vader#commanding-the-first-legion', exhausted: true }]
                    },
                });

                context.player1.clickCard(context.hunterExtraordinaryTracker);
                context.player1.clickCard(context.darthVader);

                // trigger prompt (saboteur is also shown)
                context.player1.clickPrompt('If the defender is exhausted, it gets –4/–0 for this attack');
                context.player1.clickPrompt('Trigger');

                expect(context.hunterExtraordinaryTracker.damage).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger is target is a base', async function () {
                const { context } = contextRef;
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hunter#extraordinary-tracker']
                    },
                    player2: {
                        groundArena: [{ card: 'darth-vader#commanding-the-first-legion', exhausted: true }]
                    },
                });

                context.player1.clickCard(context.hunterExtraordinaryTracker);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not apply when the defender is ready (not exhausted)', async function () {
                const { context } = contextRef;
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hunter#extraordinary-tracker']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    },
                });

                context.player1.clickCard(context.hunterExtraordinaryTracker);
                context.player1.clickCard(context.battlefieldMarine);

                // no prompt because defender is not exhausted

                expect(context.hunterExtraordinaryTracker.damage).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
