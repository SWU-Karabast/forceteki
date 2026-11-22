describe('Dark Sanctum', function() {
    integration(function(contextRef) {
        it('Dark Sanctum\'s granted base ability should trigger at the start of the regroup phase, draw a card, and deal 2 damage to the base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['porg', 'atst', 'wampa'],
                    base: { card: 'kestro-city', upgrades: ['dark-sanctum'] },
                },
            });

            const { context } = contextRef;

            context.player1.claimInitiative();
            context.player2.passAction();

            expect(context.player1.hand.length).toBe(3);
            expect(context.p1Base.damage).toBe(2);
            expect(context.porg).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('hand', context.player1);
            expect(context.wampa).toBeInZone('hand', context.player1);
        });

        it('Dark Sanctum\'s granted base ability should trigger at the start of the regroup phase, draw a card, and deal 2 damage to the base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: [],
                    base: { card: 'kestro-city', upgrades: ['dark-sanctum'] },
                },
            });

            const { context } = contextRef;

            context.player1.claimInitiative();
            context.player2.passAction();

            expect(context.player1.hand.length).toBe(0);
            expect(context.p1Base.damage).toBe(11);
        });
    });
});
