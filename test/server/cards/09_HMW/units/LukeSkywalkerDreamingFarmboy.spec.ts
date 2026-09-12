describe('Luke Skywalker, Dreaming Farmboy', function() {
    integration(function(contextRef) {
        describe('Luke Skywalker, Dreaming Farmboy\'s ability', function() {
            it('should enter play ready during the first round', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#dreaming-boy'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalkerDreamingBoy);

                expect(context.lukeSkywalkerDreamingBoy.exhausted).toBeFalse();
                expect(context.lukeSkywalkerDreamingBoy).toBeInZone('groundArena', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not enter play ready after the first round', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#dreaming-boy'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.moveToNextActionPhase();

                expect(context.game.roundNumber).toBe(2);

                context.player1.clickCard(context.lukeSkywalkerDreamingBoy);

                expect(context.lukeSkywalkerDreamingBoy.exhausted).toBeTrue();
                expect(context.lukeSkywalkerDreamingBoy).toBeInZone('groundArena', context.player1);
            });
        });
    });
});