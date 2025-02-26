describe('Coruscant Dissident', function() {
    integration(function(contextRef) {
        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'coruscant-dissident' }],
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });
        });

        it('should ready a resource on attack', function () {
            const { context } = contextRef;

            context.player1.exhaustResources(2);

            context.player1.clickCard(context.coruscantDissident);
            expect(context.player1).toHavePassAbilityPrompt('Ready a resource');
            context.player1.clickPrompt('Ready a resource');
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });
    });
});