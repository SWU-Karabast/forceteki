describe('Guavian Antagonizer', function() {
    integration(function(contextRef) {
        describe('Guavian Antagonizer\'s Bounty ability', function() {
            it('should draw a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['guavian-antagonizer']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.guavianAntagonizer);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player2.clickPrompt('Collect Bounty: Draw a card');

                expect(context.player1.handSize).toBe(0);
                expect(context.player2.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
