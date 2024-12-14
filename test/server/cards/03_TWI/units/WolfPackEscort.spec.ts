describe('Wolf Pack Escort', function () {
    integration(function (contextRef) {
        describe('ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['wolf-pack-escort'],
                        groundArena: ['duchesss-champion', 'specforce-soldier'],
                        spaceArena: ['star-wing-scout'],
                    },
                    autoSingleTarget: true
                });
            });

            it('should return card to hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wolfPackEscort);

                // Checking we cannot select a vehicle
                expect(context.player1).toBeAbleToSelectExactly([context.duchesssChampion, context.specforceSoldier]);

                // Returning card to hand and checking it was returned
                context.player1.clickCard(context.specforceSoldier);
                expect(context.specforceSoldier).toBeInZone('hand');
            });

            it('can pass ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wolfPackEscort);
                context.player1.clickPrompt('Pass ability');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});