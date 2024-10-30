describe('Target resolvers for cards', function() {
    integration(function(contextRef) {
        describe('Abilities that require a player to choose cards from a zone hidden from their opponents', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'energy-conversion-lab',
                        hand: ['reinforcement-walker', 'rebel-pathfinder', 'alliance-xwing', 'atst']
                    }
                });
            });

            it('should always let the player choose nothing, and the prompt should explain to the player why this is the case', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.energyConversionLab);
                expect(context.player1.currentPrompt().menuTitle).toContain(' (because you are choosing from a hidden zone you may choose nothing)');
                expect(context.player1).toHaveChooseNoTargetButton();

                context.player1.clickPrompt('Choose no target');
                context.player1.clickPrompt('Done');
                expect(context.player2).toBeActivePlayer();

                // confirm that the epic action is used
                context.player2.passAction();
                expect(context.energyConversionLab).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });
    });
});
