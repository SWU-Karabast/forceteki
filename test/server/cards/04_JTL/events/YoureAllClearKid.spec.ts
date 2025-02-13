describe('You\'re All Clear, Kid', function() {
    integration(function(contextRef) {
        it('You\'re All Clear, Kid\'s ability should defeat an enemy space unit with 3 or less remaining hp and give an experience token to a unit', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['youre-all-clear-kid', 'rivals-fall'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['black-sun-starfighter', { card: 'avenger#hunting-star-destroyer', damage: 6 }, 'corellian-freighter'],
                }
            });

            const { context } = contextRef;

            // kill a space unit with 3 or less remaining hp
            context.player1.clickCard(context.youreAllClearKid);
            expect(context.player1).toBeAbleToSelectExactly([context.blackSunStarfighter, context.avenger]);

            // kill avenger but there are other space unit, no experience token given
            context.player1.clickCard(context.avenger);
            expect(context.avenger).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();

            // kill corellian freighter
            context.player2.passAction();

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.corellianFreighter);

            context.player2.passAction();
            context.player1.moveCard(context.youreAllClearKid, 'hand');

            // kill black sun starfighter
            context.player1.clickCard(context.youreAllClearKid);
            context.player1.clickCard(context.blackSunStarfighter);

            // it was the last enemy space unit, you may give an experience token to a unit
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.wampa]);
            expect(context.player1).toHaveChooseNoTargetButton();

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
        });
    });
});
