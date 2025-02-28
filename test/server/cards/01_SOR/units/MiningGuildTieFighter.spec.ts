describe('Mining Guild TIE Fighter', function() {
    integration(function(contextRef) {
        describe('Mining Guild TIE Fighter\'s ability', function() {
            it('should pay 2 resources to draw', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['mining-guild-tie-fighter'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                context.player1.clickCard(context.miningGuildTieFighter);
                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to draw');

                // pay 2 resources to draw
                context.player1.clickPrompt('Pay 2 resources to draw');
                expect(context.player1.hand.length).toBe(1);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.miningGuildTieFighter.exhausted = false;
                context.player2.passAction();

                context.player1.clickCard(context.miningGuildTieFighter);
                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to draw');
                context.player1.clickPrompt('Pass');

                // as we pass, nothing changed
                expect(context.player1.hand.length).toBe(1);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should not prompt as we do not have spendable resource', async function () {
                const { context } = contextRef;

                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['mining-guild-tie-fighter'],
                        resources: 1
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                context.player1.clickCard(context.miningGuildTieFighter);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
