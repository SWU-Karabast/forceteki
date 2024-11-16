describe('Superlaser Technician', function() {
    integration(function(contextRef) {
        describe('Superlaser Technician\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['superlaser-technician']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });
            });

            it('should allow the controller to put the defeated Technician into play as a resource and ready it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.superlaserTechnician);
                context.player1.clickCard(context.sundariPeacekeeper);

                const readyResourcesBeforeTrigger = context.player1.readyResourceCount;
                expect(context.player1).toHavePassAbilityPrompt('Put Superlaser Technician into play as a resource and ready it');
                context.player1.clickPrompt('Put Superlaser Technician into play as a resource and ready it');

                expect(context.player1.readyResourceCount).toBe(readyResourcesBeforeTrigger + 1);
                expect(context.superlaserTechnician).toBeInZone('resource');
                expect(context.superlaserTechnician.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
