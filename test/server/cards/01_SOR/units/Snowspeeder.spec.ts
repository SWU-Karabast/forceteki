describe('Snowspeeder', function() {
    integration(function (contextRef) {
        describe('Snowspeeder\'s ability -', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['snowspeeder'],
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                    },
                    player2: {
                        groundArena: ['cell-block-guard', 'atst', 'occupier-siege-tank']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should exhaust chosen enemy Vehicle ground unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.snowspeeder);
                context.player1.clickPrompt('Ambush');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.occupierSiegeTank]);

                context.player1.clickCard(context.atst);

                expect(context.atst.exhausted).toBe(true);
            });
        });
    });
});
