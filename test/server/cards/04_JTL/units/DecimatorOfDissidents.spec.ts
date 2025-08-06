describe('Decimator of Dissidents', function() {
    integration(function(contextRef) {
        describe('Decimator of Dissidents\'s ability ', function () {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['decimator-of-dissidents', 'torpedo-barrage'],
                    },
                    player2: {
                        hand: ['planetary-bombardment']
                    }
                });
            });

            it('should not decrease cost by 1 if we did not deal indirect damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.decimatorOfDissidents);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should decrease cost by 1 if we did not deal indirect damage in this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.torpedoBarrage);
                context.player1.clickPrompt('Deal indirect damage to opponent');

                context.moveToNextActionPhase();

                context.player1.clickCard(context.decimatorOfDissidents);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should decrease cost if we did not deal indirect damage (opponent did)', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.planetaryBombardment);
                context.player2.clickPrompt('Deal indirect damage to opponent');

                context.player1.clickCard(context.decimatorOfDissidents);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should decrease cost by 1 because we dealt indirect in this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.torpedoBarrage);
                context.player1.clickPrompt('Deal indirect damage to opponent');

                context.player2.passAction();

                context.player1.clickCard(context.decimatorOfDissidents);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(8); // 5+3
            });
        });
    });
});
