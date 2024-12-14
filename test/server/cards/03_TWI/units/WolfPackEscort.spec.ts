describe('Wolf Pack Escort\'s', function () {
    integration(function (contextRef) {
        describe('ability', function () {
            it('should return card', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['wolf-pack-escort'],
                        groundArena: ['duchesss-champion', 'specforce-soldier'],
                        spaceArena: ['star-wing-scout'],
                    },
                    autoSingleTarget: true
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wolfPackEscort);

                // Checking we cannot select a vehicle
                expect(context.player1).toBeAbleToSelectExactly([context.duchesssChampion, context.specforceSoldier]);

                // Returning card to hand and checking it was returned
                context.player1.clickCard(context.specforceSoldier);
                expect(context.specforceSoldier).toBeInZone('hand');
            });
        });
    });
});