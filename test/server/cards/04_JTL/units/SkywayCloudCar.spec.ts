describe('Skyway Cloud Car', function() {
    integration(function(contextRef) {
        it('Skyway Cloud Car\'s ability should return a non-leader unit with 2 or less power to its owner\'s hand when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['separatist-commando', 'skyway-cloud-car']
                },
                player2: {
                    groundArena: [{ card: 'atst', damage: 1 }, 'battlefield-marine'],
                    spaceArena: ['pirated-starfighter', { card: 'system-patrol-craft', upgrades: ['perilous-position'] }],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.skywayCloudCar);
            expect(context.player1).toBeAbleToSelectExactly([context.separatistCommando, context.piratedStarfighter, context.systemPatrolCraft]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.systemPatrolCraft);
            expect(context.systemPatrolCraft).toBeInZone('hand');
        });

        it('Skyway Cloud Car\'s ability should be resolved by the new controller when defeated by No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['separatist-commando', 'skyway-cloud-car']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['pirated-starfighter'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.skywayCloudCar);

            // player2 controlled Skyway Cloud Car when it was defeated, so player2 chooses the target
            expect(context.player2).toHavePassAbilityButton();
            expect(context.player2).toBeAbleToSelectExactly([context.separatistCommando, context.piratedStarfighter]);
            context.player2.clickCard(context.separatistCommando);

            // the unit returns to its owner's hand
            expect(context.separatistCommando).toBeInZone('hand', context.player1);
            expect(context.skywayCloudCar).toBeInZone('discard', context.player1);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
