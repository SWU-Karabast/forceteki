describe('Deployed Droideka', function() {
    integration(function(contextRef) {
        describe('Deployed Droideka\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['deployed-droideka'],
                        groundArena: ['wampa'],
                        base: 'jabbas-palace'
                    },
                });
            });

            it('should be able to pay 2 resource and give this unit a Shield token and an Experience token', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.deployedDroideka);
                context.player1.clickPrompt('(No effect) Ambush');
                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to give an Experience token and a Shield token to this unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.deployedDroideka).toHaveExactUpgradeNames(['shield', 'experience']);
            });

            it('should be able to pass on the ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.deployedDroideka);
                context.player1.clickPrompt('(No effect) Ambush');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.deployedDroideka).toHaveExactUpgradeNames([]);
            });
        });
    });
});
