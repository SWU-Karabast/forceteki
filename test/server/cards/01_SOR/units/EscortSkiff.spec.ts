describe('Escort Skiff', function() {
    integration(function(contextRef) {
        describe('Escort Skiff\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['escort-skiff'],
                        spaceArena: ['patrolling-vwing'],
                    },
                    player2: {
                        groundArena: ['grogu#irresistible'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should have Ambush while controlling a Command unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.escortSkiff);
                expect(context.player1).toHaveExactPromptButtons(['Ambush', 'Pass']);

                // ambush grogu
                context.player1.clickPrompt('Ambush');
                expect(context.escortSkiff.exhausted).toBeTrue();
                expect(context.escortSkiff.damage).toBe(0);
                expect(context.grogu.damage).toBe(4);
            });
        });

        describe('Escort Skiff\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['escort-skiff'],
                    },
                    player2: {
                        groundArena: ['grogu#irresistible'],
                    }
                });
            });

            it('should not have Ambush while we are not controlling a Command unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.escortSkiff);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
