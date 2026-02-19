describe('Commence The Festivities', function() {
    integration(function(contextRef) {
        it('should allow attack with +2/+0 when controlling fewer resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['commence-the-festivities'],
                    groundArena: ['wampa'],
                    resources: 2,
                },
                player2: {
                    groundArena: ['first-order-stormtrooper'],
                    resources: 5, // More resources than player1
                }
            });

            const { context } = contextRef;

            // Play Commence The Festivities
            context.player1.clickCard(context.commenceTheFestivities);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.firstOrderStormtrooper);
            
            // Wampa should have +2 power for this attack (base appears to be 4, so with +2 it's 6)
            expect(context.wampa.getPower()).toBe(6);
            expect(context.wampa.getHp()).toBe(5);
            
            // Handle any pending prompts
            if (context.player2.currentPrompt) {
                context.player2.clickPrompt('Deal indirect damage to yourself');
            }
        });

        it('should allow attack with no bonus when controlling equal or more resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['commence-the-festivities'],
                    groundArena: ['wampa'],
                    resources: 5,
                },
                player2: {
                    groundArena: ['first-order-stormtrooper'],
                    resources: 3, // Fewer resources than player1
                }
            });

            const { context } = contextRef;

            // Play Commence The Festivities
            context.player1.clickCard(context.commenceTheFestivities);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.firstOrderStormtrooper);
            
            // Wampa should have no power bonus (base stats)
            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
            
            // Handle any pending prompts
            if (context.player2.currentPrompt) {
                context.player2.clickPrompt('Deal indirect damage to yourself');
            }
        });
    });
});
