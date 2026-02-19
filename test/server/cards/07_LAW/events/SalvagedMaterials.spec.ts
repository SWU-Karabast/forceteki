describe('Salvaged Materials', function() {
    integration(function(contextRef) {
        it('should play an Item upgrade from discard for 3 less resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvaged-materials'],
                    discard: ['thermal-detonator'],
                    groundArena: ['wampa'],
                    resources: 5,
                },
                player2: {}
            });

            const { context } = contextRef;

            // Play Salvaged Materials
            context.player1.clickCard(context.salvagedMaterials);
            
            // Should be able to target Thermal Detonator (Item upgrade) in discard
            expect(context.player1).toBeAbleToSelectExactly([context.thermalDetonator]);
            
            context.player1.clickCard(context.thermalDetonator);
            
            // Need a unit to attach the upgrade to
            context.player1.clickCard(context.wampa);
            
            // Thermal Detonator should be played and attached to Wampa
            expect(context.thermalDetonator).toBeInZone('groundArena', context.player1);
            expect(context.wampa.upgrades.length).toBe(1);
            expect(context.wampa.upgrades[0]).toBe(context.thermalDetonator);
            expect(context.player1.resources.length).toBe(5); // No resources spent due to cost reduction
        });

        it('should only target Item upgrades in discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvaged-materials'],
                    discard: ['thermal-detonator', 'veiled-strength'], // veiled-strength is not an Item
                    resources: 5,
                },
                player2: {}
            });

            const { context } = contextRef;

            // Play Salvaged Materials
            context.player1.clickCard(context.salvagedMaterials);
            
            // Should only be able to target Thermal Detonator (Item upgrade), not Veiled Strength
            expect(context.player1).toBeAbleToSelectExactly([context.thermalDetonator]);
            expect(context.player1).not.toBeAbleToSelect(context.veiledStrength);
            
            // Cancel the action to end test cleanly
            context.player1.clickPrompt('Cancel');
        });
    });
});
