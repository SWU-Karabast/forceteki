
describe('Tandem Assualt', function() {
    integration(function(contextRef) {
        it('Tandem Assualt\'s ability should attack with a space unit and if you do, attack with a ground unit and that gets +2/0', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['tandem-assault'],
                    groundArena: [{ card: 'atst', damage: 4 }],
                    spaceArena: ['padawan-starfighter', 'tieln-fighter']
                },
                player2: {
                    hand: ['takedown'],
                    groundArena: ['death-star-stormtrooper'],
                    spaceArena: ['imperial-interceptor', { card: 'resupply-carrier', damage: 4 }]
                }

            });
            const { context } = contextRef;
            // Play Tandem Assault, attack with space unit and then attack with ground unit.
            context.player1.clickCard(context.tandemAssault);
            expect(context.player1).toBeAbleToSelectExactly([context.padawanStarfighter, context.tielnFighter]);
            context.player1.clickCard(context.padawanStarfighter);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(9);

            // Defeat ground unit ready for next test
            context.player2.clickCard(context.deathStarStormtrooper);
            context.player2.clickCard(context.atst);

            context.tandemAssault.moveTo('hand');

            // Play Tandem Assault, attack with space unit, No viable target on the ground
            context.player1.clickCard(context.tandemAssault);
            context.player1.clickCard(context.tielnFighter);
            context.player1.clickCard(context.resupplyCarrier);

            // Remove space unit for next test
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.padawanStarfighter);

            context.tandemAssault.moveTo('hand');

            // Tandem Assault played, no viable targets
            context.player1.clickCard(context.tandemAssault);
            expect(context.tandemAssault).toBeInZone('discard');
        });
    });
});
