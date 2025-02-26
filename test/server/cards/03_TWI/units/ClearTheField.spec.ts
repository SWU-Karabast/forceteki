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

        it('should only make unit return to hand and tokens go out of combat instead', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['clear-the-field'],
                    leader: { card: 'bokatan-kryze#princess-in-exile', deployed: true },
                    groundArena: ['battle-droid', 'bokatan-kryze#fighting-for-mandalore', 'bokatan-kryze#death-watch-lieutenant']
                },
                player2: {
                    hand: ['clear-the-field'],
                    leader: { card: 'bokatan-kryze#princess-in-exile', deployed: true },
                    groundArena: ['bokatan-kryze#fighting-for-mandalore', 'bokatan-kryze#death-watch-lieutenant', 'battle-droid'],
                },
            });
            const { context } = contextRef;

            // Player 1
            const bokatanLeaderP1 = context.player1.findCardByName('bokatan-kryze#princess-in-exile');
            const bokatanMandaloreP1 = context.player1.findCardByName('bokatan-kryze#fighting-for-mandalore');
            const bokatanDeathWatchP1 = context.player1.findCardByName('bokatan-kryze#death-watch-lieutenant');
            const clearTheFieldP1 = context.player1.findCardByName('clear-the-field');
            const droidToken1 = context.player1.findCardByName('battle-droid');
            // Player 2
            const bokatanLeaderP2 = context.player2.findCardByName('bokatan-kryze#princess-in-exile');
            const bokatanMandaloreP2 = context.player2.findCardByName('bokatan-kryze#fighting-for-mandalore');
            const bokatanDeathWatchP2 = context.player2.findCardByName('bokatan-kryze#death-watch-lieutenant');
            const clearTheFieldP2 = context.player2.findCardByName('clear-the-field');
            const droidToken2 = context.player2.findCardByName('battle-droid');

            // Case 1: Targeting a unit card doesn't return the deployed leader with same name
            context.player1.clickCard(clearTheFieldP1);
            expect(context.player1).toBeAbleToSelectExactly([bokatanMandaloreP1, bokatanDeathWatchP1, bokatanMandaloreP2, bokatanDeathWatchP2, droidToken1, droidToken2]);
            context.player1.clickCard(bokatanMandaloreP1);
            expect(context.player2).toBeActivePlayer();

            expect(bokatanLeaderP1).toBeInZone('groundArena', context.player1);
            // Check that if the target is an ally unit, return to hand as well
            expect(bokatanMandaloreP1).toBeInZone('hand', context.player1);
            // Check that only the target ally goes back to hand and not all matching cards
            expect(bokatanDeathWatchP1).toBeInZone('groundArena', context.player1);
            expect(droidToken1).toBeInZone('groundArena', context.player1);

            expect(bokatanLeaderP2).toBeInZone('groundArena', context.player2);
            expect(bokatanDeathWatchP2).toBeInZone('hand', context.player2);
            expect(bokatanMandaloreP2).toBeInZone('hand', context.player2);
            expect(droidToken2).toBeInZone('groundArena', context.player2);

            // Case 2: Targeting a token, will make it leave the game and not go to hand
            context.player2.clickCard(clearTheFieldP2);
            expect(context.player2).toBeAbleToSelectExactly([droidToken1, droidToken2, bokatanDeathWatchP1]);

            context.player2.clickCard(droidToken2);
            expect(context.player1).toBeActivePlayer();

            expect(droidToken1).toBeInZone('outsideTheGame');
            expect(droidToken2).toBeInZone('outsideTheGame');
        });

        it('should return owned unit into the owner\'s hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {

                    groundArena: ['bokatan-kryze#fighting-for-mandalore']
                },
                player2: {
                    hand: ['change-of-heart', 'clear-the-field'],
                    hasInitiative: true,
                },
            });
            const { context } = contextRef;
            const bokatanDeathWatch = context.player1.findCardByName('bokatan-kryze#fighting-for-mandalore');

            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(bokatanDeathWatch);
            expect(bokatanDeathWatch).toBeInZone('groundArena', context.player2);
            context.player1.passAction();
            // Check that the unit is returned to the hand of its owner
            context.player2.clickCard(context.clearTheField);
            context.player2.clickCard(bokatanDeathWatch);
            expect(bokatanDeathWatch).toBeInZone('hand', context.player1);
        });
    });
});