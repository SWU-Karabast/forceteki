describe('Clone Deserter', function() {
    integration(function(contextRef) {
        describe('Clone Deserter\'s Bounty ability', function() {
            it('should draw a card', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['clone-deserter']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cloneDeserter);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toHavePassAbilityPrompt('Bounty: Draw a card');
                context.player2.clickPrompt('Bounty: Draw a card');

                expect(context.player1.handSize).toBe(0);
                expect(context.player2.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
