describe('Discerning Veteran', function() {
    integration(function(contextRef) {
        describe('Discerning Veteran\'s when played ability', function() {
            it('should capture an enemy ground unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['discerning-veteran'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
                const { context } = contextRef;

                context.player1.clickCard(context.discerningVeteran);

                // Wampa auto-selected as only legal target
                expect(context.wampa).toBeCapturedBy(context.discerningVeteran);
            });
        });
    });
});
