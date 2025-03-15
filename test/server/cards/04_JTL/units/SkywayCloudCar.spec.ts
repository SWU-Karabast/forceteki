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
    });
});
