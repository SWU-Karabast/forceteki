describe('Security Complex', function() {
    integration(function(contextRef) {
        describe('Security Complex\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'security-complex',
                        groundArena: ['jedha-agitator'],
                    },
                    player2: {
                        groundArena: ['frontier-atrt', 'wampa'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
            });

            it('should give shield to non-leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.securityComplex);
                expect(context.player1).toBeAbleToSelectExactly([context.jedhaAgitator, context.wampa, context.frontierAtrt]);

                context.player1.clickCard(context.jedhaAgitator);
                expect(context.jedhaAgitator).toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});
