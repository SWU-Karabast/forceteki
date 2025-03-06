describe('Swarming Vulture Droid', function () {
    integration(function (contextRef) {
        it('Swarming Vulture Droid\'s ability should get +1/+0 for each other friendly swarming vulture droid', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['swarming-vulture-droid'],
                    spaceArena: ['swarming-vulture-droid', 'swarming-vulture-droid', 'green-squadron-awing'],
                },
                player2: {
                    spaceArena: ['swarming-vulture-droid'],
                }
            });

            const { context } = contextRef;

            let arenaSwarmingVultureDroids = context.player1.findCardsByName('swarming-vulture-droid', 'spaceArena');

            for (const droid of arenaSwarmingVultureDroids) {
                expect(droid.getPower()).toBe(3);
                expect(droid.getHp()).toBe(2);
            }

            context.player1.clickCard(context.player1.findCardByName('swarming-vulture-droid', 'hand'));
            arenaSwarmingVultureDroids = context.player1.findCardsByName('swarming-vulture-droid', 'spaceArena');

            for (const droid of arenaSwarmingVultureDroids) {
                expect(droid.getPower()).toBe(4);
                expect(droid.getHp()).toBe(2);
            }
        });
    });
});
