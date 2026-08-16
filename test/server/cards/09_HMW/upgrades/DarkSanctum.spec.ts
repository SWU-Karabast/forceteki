describe('Dark Sanctum', function() {
    integration(function(contextRef) {
        it('Dark Sanctum\'s granted base ability should trigger at the start of the regroup phase, draw a card, and deal 2 damage to the base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dark-sanctum'],
                    deck: ['porg', 'atst', 'wampa']
                },
            });

            const { context } = contextRef;

            // Attach Dark Sanctum to the base
            context.player1.clickCard(context.darkSanctum);
            context.player1.clickCard(context.p1Base);

            context.player2.passAction();
            context.player1.claimInitiative();

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
                    hand: ['dark-sanctum'],
                    deck: []
                },
            });

            const { context } = contextRef;

            // Attach Dark Sanctum to the base
            context.player1.clickCard(context.darkSanctum);
            context.player1.clickCard(context.p1Base);

            context.player2.passAction();
            context.player1.claimInitiative();

            expect(context.player1.hand.length).toBe(0);
            expect(context.p1Base.damage).toBe(11);
        });
    });
});
