describe('Clear the Field\'s ability', function () {
    integration(function (contextRef) {
        it('should make all matching cards return to hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['clear-the-field'],
                    groundArena: ['duchesss-champion', 'specforce-soldier']
                },
                player2: {
                    groundArena: ['specforce-soldier', 'specforce-soldier', 'yoda#old-master'],
                },
            });
            const { context } = contextRef;
            const specforceSoldierP1 = context.player1.findCardByName('specforce-soldier');
            const specforceSoldiersP2 = context.player2.findCardsByName('specforce-soldier');
            context.player1.clickCard(context.clearTheField);

            // Check that card with cost higher than 3 cannot be selected
            expect(context.player1).toBeAbleToSelectExactly([specforceSoldierP1, specforceSoldiersP2[0], specforceSoldiersP2[1], context.yoda]);

            context.player1.clickCard(specforceSoldiersP2[0]);
            expect(specforceSoldiersP2[0]).toBeInZone('hand', context.player2);
            expect(specforceSoldiersP2[1]).toBeInZone('hand', context.player2);

            // Check ally card that matches the target name doesn't go back to hand
            expect(specforceSoldierP1).toBeInZone('groundArena', context.player1);

            // Check card that doesn't match the selected card's name stays in play
            expect(context.duchesssChampion).toBeInZone('groundArena');
            expect(context.yoda).toBeInZone('groundArena');
        });
    });
});