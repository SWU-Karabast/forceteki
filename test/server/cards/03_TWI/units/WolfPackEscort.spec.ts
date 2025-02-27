describe('Wolf Pack Escort', function () {
    integration(function (contextRef) {
        it('should return card to hand when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wolf-pack-escort'],
                    groundArena: ['duchesss-champion', 'specforce-soldier'],
                    spaceArena: ['star-wing-scout'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wolfPackEscort);

            // Checking we can pass the ability
            expect(context.player1).toHavePassAbilityButton();

            // Checking we cannot select a vehicle
            expect(context.player1).toBeAbleToSelectExactly([context.duchesssChampion, context.specforceSoldier]);

            // Returning card to hand and checking it was returned
            context.player1.clickCard(context.specforceSoldier);
            expect(context.specforceSoldier).toBeInZone('hand');
        });
    });
});