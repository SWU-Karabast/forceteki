describe('TIE Dagger Vanguard', function () {
    integration(function (contextRef) {
        it('TIE Dagger Vanguard\'s ability should Deal 2 damage to a damaged unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tie-dagger-vanguard'],
                    groundArena: [{ card: 'battlefield-marine', damage: 2 }, { card: 'sabine-wren#explosives-artist' }],
                    spaceArena: [{ card: 'devastating-gunship' }, { card: 'black-sun-starfighter', damage: 1 }],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true, damage: 2 },
                },
                player2: {
                    groundArena: ['death-star-stormtrooper'],
                    spaceArena: [{ card: 'droid-missile-platform', damage: 1 }, { card: 'swarming-vulture-droid', damage: 1 }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.tieDaggerVanguard);
            expect(context.player1).toBeAbleToSelectExactly([
                context.battlefieldMarine,
                context.blackSunStarfighter,
                context.lukeSkywalker,
                context.droidMissilePlatform,
                context.swarmingVultureDroid
            ]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.lukeSkywalker);
            expect(context.lukeSkywalker.damage).toBe(4);
        });
    });
});
