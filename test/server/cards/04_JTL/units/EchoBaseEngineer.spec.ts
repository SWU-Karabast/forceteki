
describe('Echo Base Defender', function () {
    integration(function (contextRef) {
        it('Echo Base Defender\'s ability should give a shield to a damaged Vehicle unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['echo-base-engineer'],
                    groundArena: [{ card: 'battlefield-marine', damage: 2 }],
                    spaceArena: [{ card: 'devastating-gunship' }, { card: 'black-sun-starfighter', damage: 1 }]
                },
                player2: {
                    spaceArena: [{ card: 'droid-missile-platform', damage: 1 }, 'swarming-vulture-droid']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.echoBaseEngineer);
            expect(context.player1).toBeAbleToSelectExactly([context.blackSunStarfighter, context.droidMissilePlatform]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.blackSunStarfighter);
            expect(context.blackSunStarfighter).toHaveExactUpgradeNames(['shield']);
        });
    });
});
