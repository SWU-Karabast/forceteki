describe('Chewbacca, Walking Carpet', function() {
    integration(function(contextRef) {
        describe('Chewbacca, Walking Carpet\'s undeployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['alliance-xwing', 'liberated-slaves', 'cell-block-guard'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'administrators-tower'
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('should let the controller play a unit with printed cost 3 or less and give it sentinel for the phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                expect(context.player1).toHaveEnabledPromptButtons(['Play a unit that costs 3 or less. It gains sentinel for this phase', 'Deploy Chewbacca']);

                context.player1.clickPrompt('Play a unit that costs 3 or less. It gains sentinel for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.liberatedSlaves]);
            });
        });
    });
});
