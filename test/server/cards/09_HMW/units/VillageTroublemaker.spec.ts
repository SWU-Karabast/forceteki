describe('Village Troublemaker', function() {
    integration(function(contextRef) {
        it('should not have Hidden and Saboteur if the base is not Endor trait', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['village-troublemaker'],
                    base: 'echo-base'
                },
                player2: {
                    groundArena: ['porg'],
                }
            });

            const { context } = contextRef;

            expect(context.villageTroublemaker.hasSomeKeyword('hidden')).toBeFalse();
            expect(context.villageTroublemaker.hasSomeKeyword('saboteur')).toBeFalse();

            expect(context.player1).toBeActivePlayer();
        });

        it('should have Hidden and Saboteur if the base is Endor trait', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['village-troublemaker'],
                    base: 'shield-generator-complex'
                },
                player2: {
                    groundArena: ['porg'],
                }
            });

            const { context } = contextRef;

            expect(context.villageTroublemaker.hasSomeKeyword('hidden')).toBeTrue();
            expect(context.villageTroublemaker.hasSomeKeyword('saboteur')).toBeTrue();

            expect(context.player1).toBeActivePlayer();
        });
    });
});