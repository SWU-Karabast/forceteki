describe('Smuggler\'s YT-2400', function() {
    integration(function(contextRef) {
        describe('Smuggler\'s YT-2400\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['smugglers-yt2400'],
                        leader: 'captain-rex#fighting-for-his-brothers'
                    },
                });
            });

            it('should be able to pass on the ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.smugglersYt2400);
                context.player1.clickPrompt('(No effect) Ambush');
                expect(context.player1).toHavePassAbilityPrompt('Pay 1 resource to give this unit +1/+1 for this phase');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.smugglersYt2400.getPower()).toBe(4);
                expect(context.smugglersYt2400.getHp()).toBe(5);
            });

            it('should be able to pay 1 resource and give this unit +1/+1 for this phase', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.smugglersYt2400);
                context.player1.clickPrompt('(No effect) Ambush');
                expect(context.player1).toHavePassAbilityPrompt('Pay 1 resource to give this unit +1/+1 for this phase');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.smugglersYt2400.getPower()).toBe(5);
                expect(context.smugglersYt2400.getHp()).toBe(6);

                context.moveToNextActionPhase();

                expect(context.smugglersYt2400.getPower()).toBe(4);
                expect(context.smugglersYt2400.getHp()).toBe(5);
            });
        });
    });
});
