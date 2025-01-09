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
                    hand: ['clear-the-field'],
                    groundArena: ['specforce-soldier', 'specforce-soldier', 'yoda#old-master'],
                },
            });
            const { context } = contextRef;

            const clearTheFieldP = context.player1.findCardByName('clear-the-field');
            const specforceSoldierP1 = context.player1.findCardByName('specforce-soldier');
            const specforceSoldiersP2 = context.player2.findCardsByName('specforce-soldier');

            context.player1.clickCard(clearTheFieldP);

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
        fit('should make unit only return to hand and token go out of combat', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['clear-the-field'],
                    leader: { card: 'jyn-erso#resisting-oppression', deployed: true },
                    groundArena: ['battle-droid', 'jyn-erso#stardust']
                },
                player2: {
                    hand: ['clear-the-field'],
                    leader: { card: 'jyn-erso#resisting-oppression', deployed: true },
                    groundArena: ['jyn-erso#stardust', 'battle-droid'],
                },
            });
            const { context } = contextRef;

            // Player 1
            const jynLeaderP1 = context.player1.findCardByName('jyn-erso#resisting-oppression');
            const jynUnitP1 = context.player1.findCardByName('jyn-erso#stardust');
            const clearTheFieldP1 = context.player1.findCardByName('clear-the-field');
            const droidToken1 = context.player1.findCardByName('battle-droid');
            // Player 2
            const jynLeaderP2 = context.player2.findCardByName('jyn-erso#resisting-oppression');
            const jynUnitP2 = context.player2.findCardByName('jyn-erso#stardust');
            const clearTheFieldP2 = context.player2.findCardByName('clear-the-field');
            const droidToken2 = context.player2.findCardByName('battle-droid');

            // Case 1: Targeting a unit card doesn't return the deployed leader with same name
            context.player1.clickCard(clearTheFieldP1);
            expect(context.player1).toBeAbleToSelectExactly([jynUnitP1, jynUnitP2, droidToken1, droidToken2]);
            context.player1.clickCard(jynUnitP1);
            expect(context.player2).toBeActivePlayer();

            expect(jynLeaderP1).toBeInZone('groundArena', context.player1);
            // Check that if the target is an ally unit, return to hand as well
            expect(jynUnitP1).toBeInZone('hand', context.player1);
            expect(droidToken1).toBeInZone('groundArena', context.player1);

            expect(jynLeaderP2).toBeInZone('groundArena', context.player2);
            expect(jynUnitP2).toBeInZone('hand', context.player2);
            expect(droidToken2).toBeInZone('groundArena', context.player2);

            // Case 2: Targeting a token, will make it leave the game and not go to hand
            context.player2.clickCard(clearTheFieldP2);
            expect(context.player2).toBeAbleToSelectExactly([droidToken1, droidToken2]);

            context.player2.clickCard(droidToken1);
            expect(context.player1).toBeActivePlayer();

            expect(droidToken1).toBeInZone('outsideTheGame');
            expect(droidToken2).toBeInZone('outsideTheGame');
        });
    });
});