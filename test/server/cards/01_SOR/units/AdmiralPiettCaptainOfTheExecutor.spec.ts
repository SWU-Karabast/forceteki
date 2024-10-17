describe('Admiral Piett, Captain of the Executor\'s Folly', function() {
    integration(function(contextRef) {
        describe('Admiral Piett\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['relentless#konstantines-folly'],
                        groundArena: ['admiral-piett#captain-of-the-executor']
                    },
                    player2: {
                        spaceArena: ['redemption#medical-frigate']
                    }
                });
            });

            it('should nullify the effects of the first event the opponent plays each round', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.relentless);
                expect(context.player1).toHaveExactPromptButtons(['Ambush', 'Pass']);
            });
        });
    });
});
