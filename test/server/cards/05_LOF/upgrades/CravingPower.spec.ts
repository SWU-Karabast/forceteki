describe('Craving Power', function () {
    integration(function (contextRef) {
        describe('When played', function () {
            it('deals damage to an enemy unit equal to the attached unit\'s power', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-vader#commanding-the-first-legion'],
                        spaceArena: ['arquitens-assault-cruiser'],
                        hand: ['craving-power'],
                    },
                    player2: {
                        groundArena: ['reinforcement-walker']
                    }
                });

                const { context } = contextRef;

                // Play Craving Power
                context.player1.clickCard(context.cravingPower);

                // Can only play on friendly units (including Vehicles)
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVader,
                    context.arquitensAssaultCruiser
                ]);

                // Attach to Darth Vader
                context.player1.clickCard(context.darthVader);
                expect(context.darthVader).toHaveExactUpgradeNames(['craving-power']);

                // Ability triggers
                expect(context.player1).toHavePrompt('Deal damage to an enemy unit equal to attached unit\'s power');
                expect(context.player1).toBeAbleToSelectExactly([context.reinforcementWalker]);

                // Select Reinforcement Walker
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.reinforcementWalker.damage).toBe(7); // Vader's power (5) + upgrade power (2)
            });

            it('does nothing if there are no enemy units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-vader#commanding-the-first-legion'],
                        spaceArena: ['arquitens-assault-cruiser'],
                        hand: ['craving-power'],
                    }
                });

                const { context } = contextRef;

                // Play Craving Power
                context.player1.clickCard(context.cravingPower);
                context.player1.clickCard(context.darthVader);
                expect(context.darthVader).toHaveExactUpgradeNames(['craving-power']);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});