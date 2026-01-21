describe('Jabba the Hutt, Crime Boss', function() {
    integration(function(contextRef) {
        describe('Leader unit side action ability', function() {
            it('should allow playing an Underworld unit from hand and granting Ambush if a Credit token was used to pay for it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jabba-the-hutt#crime-boss', deployed: true },
                        credits: 1,
                        hand: ['crafty-smuggler']
                    },
                    player2: {
                        groundArena: ['village-protectors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickPrompt('Play an Underworld unit unit from your hand');
                context.player1.clickCard(context.craftySmuggler);
                context.player1.clickPrompt('Use 1 Credit');
            });
        });
    });
});