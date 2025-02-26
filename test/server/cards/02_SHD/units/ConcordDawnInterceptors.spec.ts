describe('Concord Dawn Interceptors', function() {
    integration(function(contextRef) {
        describe('Concord Dawn Interceptors\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['concord-dawn-interceptors']
                    },
                    player2: {
                        spaceArena: ['pirated-starfighter']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should has +2/+0 while defending', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.concordDawnInterceptors);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
                context.player2.clickCard(context.piratedStarfighter);
                expect(context.concordDawnInterceptors.damage).toBe(3);
                expect(context.concordDawnInterceptors.getPower()).toBe(1);
                expect(context.piratedStarfighter.damage).toBe(3);
            });
        });
    });
});
