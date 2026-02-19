describe('Salvaged Blaster', function() {
    integration(function(contextRef) {
        it('should only attach to non-vehicle units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvaged-blaster'],
                    leader: 'luke-skywalker#faithful-friend',
                    groundArena: ['wampa'],
                    spaceArena: ['tie-fighter'],
                },
                player2: {}
            });

            const { context } = contextRef;

            // Play Salvaged Blaster from hand
            context.player1.clickCard(context.salvagedBlaster);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            expect(context.player1).not.toBeAbleToSelect(context.tieFighter);

            context.player1.clickCard(context.wampa);
            expect(context.salvagedBlaster).toBeInZone('groundArena', context.player1);
            expect(context.wampa.upgrades.length).toBe(1);
            expect(context.wampa.upgrades[0]).toBe(context.salvagedBlaster);
        });

        it('cannot be played from discard if not discarded this hand or deck this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    leader: 'luke-skywalker#faithful-friend',
                    discard: ['salvaged-blaster'],
                },
                player2: {}
            });

            const { context } = contextRef;

            // Salvaged Blaster should not be playable from discard
            expect(context.player1.currentActionTargets).not.toContain(context.salvagedBlaster);
        });
    });
});
