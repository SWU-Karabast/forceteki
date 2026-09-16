describe('Opee Sea Killer', function () {
    integration(function (contextRef) {
        it('should gain Grit while you control a Naboo base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'theed-palace',
                    groundArena: [{ card: 'opee-sea-killer', damage: 2 }]
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Grit: +1 power for each damage on it (5 power + 2 damage)
            expect(context.opeeSeaKiller.getPower()).toBe(7);

            context.player1.clickCard(context.opeeSeaKiller);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(7);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not gain Grit while you do not control a Naboo base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'tarkintown',
                    groundArena: [{ card: 'opee-sea-killer', damage: 2 }]
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            expect(context.opeeSeaKiller.getPower()).toBe(5);

            context.player1.clickCard(context.opeeSeaKiller);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });

        it('should have printed power while undamaged even with a Naboo base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'theed-palace',
                    groundArena: ['opee-sea-killer']
                }
            });

            const { context } = contextRef;

            expect(context.opeeSeaKiller.getPower()).toBe(5);

            // Grit kicks in as soon as it is damaged
            context.setDamage(context.opeeSeaKiller, 3);
            expect(context.opeeSeaKiller.getPower()).toBe(8);

            context.setDamage(context.opeeSeaKiller, 0);
            expect(context.opeeSeaKiller.getPower()).toBe(5);
        });
    });
});
