describe('Deploy a Leader', function() {
    integration(function(contextRef) {
        describe('Leaders deploys', function() {
            it('asks for confirmation before deploying the leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'emperor-palpatine#galactic-ruler',
                        resources: 10,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                expect(context.player1).toHaveExactPromptButtons([
                    'Deploy Emperor Palpatine',
                    'Cancel',
                ]);

                context.player1.clickPrompt('Deploy Emperor Palpatine');
                expect(context.emperorPalpatine).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});