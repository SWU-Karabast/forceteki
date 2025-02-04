describe('Elite P-38 Starfighter', function() {
    integration(function(contextRef) {
        describe('Elite P-38 Starfighter\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['system-patrol-craft'],
                        hand: ['elite-p38-starfighter']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['vanquish']
                    }
                });
            });

            it('should optionally deal 1 damage to a unit on play and defeat', function () {
                const { context } = contextRef;

                // Play P38 from hand
                context.player1.clickCard(context.eliteP38Starfighter);
                expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.eliteP38Starfighter, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);

                // Defeat P38
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.eliteP38Starfighter);

                // Can Pass on Damage
                expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
