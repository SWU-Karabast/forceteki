describe('Heavy Blaster Cannon', function () {
    integration(function (contextRef) {
        describe('When played', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-vader#commanding-the-first-legion'],
                        spaceArena: ['arquitens-assault-cruiser'],
                        hand: ['heavy-blaster-cannon'],
                    },
                    player2: {
                        groundArena: [
                            'death-star-stormtrooper',
                            {
                                card: 'reinforcement-walker',
                                upgrades: [
                                    'shield',
                                    'shield'
                                ]
                            },
                        ]
                    }
                });
            });

            it('deals 1 damage to the same ground unit three times', function () {
                const { context } = contextRef;

                // Play Heavy Blaster Cannon
                context.player1.clickCard(context.heavyBlasterCannon);

                // Can play on non-Vehicle units
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVader,
                    context.deathStarStormtrooper
                ]);

                // Attach to Darth Vader
                context.player1.clickCard(context.darthVader);
                expect(context.darthVader).toHaveExactUpgradeNames(['heavy-blaster-cannon']);

                // Trigger ability
                expect(context.player1).toHavePrompt('You may deal 1 damage to a ground unit. Then, deal 1 damage to the same unit. Then, deal 1 damage to the same unit.');
                expect(context.player1).toHavePassAbilityButton();

                // It can target any ground unit
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVader,
                    context.reinforcementWalker,
                    context.deathStarStormtrooper
                ]);

                // Select Reinforcement Walker
                context.player1.clickCard(context.reinforcementWalker);

                // Both shields are defeated and it takes 1 damage
                expect(context.reinforcementWalker).toHaveExactUpgradeNames([]);
                expect(context.reinforcementWalker.damage).toBe(1);
            });

            it('works if the unit is defeated after the first damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heavyBlasterCannon);
                context.player1.clickCard(context.darthVader);

                expect(context.darthVader).toHaveExactUpgradeNames(['heavy-blaster-cannon']);
                expect(context.player1).toHavePrompt('You may deal 1 damage to a ground unit. Then, deal 1 damage to the same unit. Then, deal 1 damage to the same unit.');

                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('is optional and can be passed', function () {
                const { context } = contextRef;

                // Play Heavy Blaster Cannon
                context.player1.clickCard(context.heavyBlasterCannon);
                context.player1.clickCard(context.darthVader);

                expect(context.darthVader).toHaveExactUpgradeNames(['heavy-blaster-cannon']);
                expect(context.player1).toHavePrompt('You may deal 1 damage to a ground unit. Then, deal 1 damage to the same unit. Then, deal 1 damage to the same unit.');
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});