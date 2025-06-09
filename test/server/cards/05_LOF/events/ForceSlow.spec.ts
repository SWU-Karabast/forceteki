describe('Force Slow', function() {
    integration(function(contextRef) {
        describe('Force Slow\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        hand: ['force-slow'],
                        groundArena: [{ card: 'atat-suppressor', exhausted: true }],
                    },
                    player2: {
                        groundArena: [{ card: 'blizzard-assault-atat', exhausted: true }],
                    }
                });
            });

            it('gives friendly exhausted unit -8/-0', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.forceSlow);
                expect(context.player1).toBeAbleToSelectExactly([context.atatSuppressor, context.blizzardAssaultAtat]);

                context.player1.clickCard(context.atatSuppressor);
                expect(context.atatSuppressor.getPower()).toBe(0);
            });

            it('gives enemy exhausted unit -8/-0', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.forceSlow);
                expect(context.player1).toBeAbleToSelectExactly([context.atatSuppressor, context.blizzardAssaultAtat]);

                context.player1.clickCard(context.blizzardAssaultAtat);
                expect(context.blizzardAssaultAtat.getPower()).toBe(1);

                context.moveToNextActionPhase();
                expect(context.blizzardAssaultAtat.getPower()).toBe(9);
            });

            it('has no effect if there are no exhausted units', function () {
                const { context } = contextRef;
                context.moveToNextActionPhase();
                context.player1.moveCard(context.forceSlow, 'hand');

                context.player1.clickCard(context.forceSlow);
                context.player1.clickPrompt('Play anyway');

                expect(context.forceSlow).toBeInZone('discard', context.player1);
                expect(context.atatSuppressor.getPower()).toBe(8);
                expect(context.blizzardAssaultAtat.getPower()).toBe(9);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});