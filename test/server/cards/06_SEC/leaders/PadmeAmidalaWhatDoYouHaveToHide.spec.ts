describe('Padmé Amidala, What Do You Have To Hide?', function() {
    integration(function(contextRef) {
        describe('Unit Side', function() {
            it('only triggers one time when multiple cards are discarded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#what-do-you-have-to-hide',
                        hand: ['command', 'battlefield-marine']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['pillage'],
                        groundArena: ['reinforcement-walker']
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.pillage);
                context.player2.clickPrompt('Opponent discards');

                context.player1.clickCard('battlefield-marine');
                context.player1.clickCard('command');
                context.player1.clickPrompt('Done');
            });
        });
    });
});
