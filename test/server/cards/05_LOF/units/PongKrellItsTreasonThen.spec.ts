describe('Pong Krell, It\'s Treason Then', function() {
    integration(function(contextRef) {
        it('Pong Krell\'s ability should allow defeating a unit with less remaining HP than Pong Krell\'s power after completing an attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['pong-krell#its-treason-then'],
                },
                player2: {
                    groundArena: [{ card: 'wampa', damage: 4 }, 'porg', 'cantina-braggart'],
                }
            });

            const { context } = contextRef;

            // Attack with Pong Krell
            context.player1.clickCard(context.pongKrell);
            context.player1.clickCard(context.p2Base);

            // After attack completes, the ability should trigger
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.porg]);
            expect(context.player1).toHavePassAbilityButton();

            // Select Wampa to defeat it
            context.player1.clickCard(context.wampa);

            // Verify Wampa is defeated
            expect(context.wampa).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('Pong Krell\'s ability should allow defeating a unit with less remaining HP than Pong Krell\'s power after completing an attack (with damage to trigger grit)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'pong-krell#its-treason-then', damage: 6 }],
                },
                player2: {
                    groundArena: ['wampa', 'cantina-braggart'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.pongKrell);
            context.player1.clickCard(context.p2Base);

            // After attack completes, the ability should trigger
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cantinaBraggart, context.pongKrell]);
            expect(context.player1).toHavePassAbilityButton();

            // Select Wampa to defeat it
            context.player1.clickCard(context.wampa);

            // Verify Wampa is defeated
            expect(context.wampa).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
