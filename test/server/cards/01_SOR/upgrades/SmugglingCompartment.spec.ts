describe('Smuggling Compartment', function() {
    integration(function(contextRef) {
        describe('Smuggling Compartment\'s on attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'atst', upgrades: ['smuggling-compartment'] }],
                    },
                    player2: {
                        groundArena: ['snowspeeder']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should ready a resource on attack', function () {
                const { context } = contextRef;

                context.player1.exhaustResources(2);

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.snowspeeder);

                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('Smuggling Compartment', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['smuggling-compartment'],
                        groundArena: ['snowspeeder', 'battlefield-marine']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should not be playable on non-vehicles', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.smugglingCompartment);
                expect(context.snowspeeder).toHaveExactUpgradeNames(['smuggling-compartment']);
            });
        });
    });
});
