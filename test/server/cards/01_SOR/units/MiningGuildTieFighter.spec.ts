describe('Mining Guild TIE Fighter', function() {
    integration(function(contextRef) {
        describe('Mining Guild TIE Fighter\'s ability', function() {
            it('should pay 2 resources to draw', function () {
                const { context } = contextRef;

                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['mining-guild-tie-fighter'],
                    },
                });

                context.player1.clickCard(context.miningGuildTieFighter);
                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to draw');

                // pay 2 resources to draw
                context.player1.clickPrompt('Pay 2 resources to draw');
                expect(context.player1.hand.length).toBe(1);
                expect(context.player1.countExhaustedResources()).toBe(2);

                context.miningGuildTieFighter.exhausted = false;
                context.player2.passAction();

                context.player1.clickCard(context.miningGuildTieFighter);
                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to draw');
                context.player1.clickPrompt('Pass');

                // as we pass, nothing changed
                expect(context.player1.hand.length).toBe(1);
                expect(context.player1.countExhaustedResources()).toBe(2);
            });

            it('should not prompt as we do not have spendable resource', function () {
                const { context } = contextRef;

                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['mining-guild-tie-fighter'],
                        resources: 1
                    },
                });

                context.player1.clickCard(context.miningGuildTieFighter);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
