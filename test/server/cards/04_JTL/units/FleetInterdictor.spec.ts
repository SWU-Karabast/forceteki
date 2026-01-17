describe('Fleet Interdictor', function() {
    integration(function(contextRef) {
        it('Fleet Interdictor\'s ability should defeat a space unit that cost 3 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['fleet-interdictor', 'tieln-fighter'],
                    groundArena: ['wampa']
                },
                player2: {
                    hand: ['vanquish'],
                    groundArena: ['atst'],
                    spaceArena: ['republic-arc170']
                }
            });

            const { context } = contextRef;

            // Trigger the defeat ability
            context.player1.passAction();
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.fleetInterdictor);

            // Assert ability
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.republicArc170]);
            context.player1.clickCard(context.republicArc170);

            expect(context.republicArc170).toBeInZone('discard', context.player2);
            expect(context.player1).toBeActivePlayer();
        });

        it('Fleet Interdictor\'s ability can target a space leader unit that cost 3 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['waylay'],
                    spaceArena: ['fleet-interdictor'],
                },
                player2: {
                    hand: ['vanquish'],
                    spaceArena: ['awing', 'seventh-fleet-defender'],
                    leader: 'asajj-ventress#i-work-alone',
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.asajjVentress);
            context.player2.clickPrompt('Deploy Asajj Ventress as a Pilot');
            context.player2.clickCard(context.awing);

            context.player1.clickCard(context.waylay);
            // cannot target a leader unit
            expect(context.player1).toBeAbleToSelectExactly([context.fleetInterdictor, context.seventhFleetDefender]);
            context.player1.clickCard(context.seventhFleetDefender);

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.fleetInterdictor);
            // can target a leader unit
            expect(context.player1).toBeAbleToSelectExactly([context.awing]);
            context.player1.clickCard(context.awing);

            expect(context.player1).toBeActivePlayer();
            expect(context.asajjVentress.deployed).toBeFalse();
            expect(context.awing).toBeInZone('discard', context.player2);
        });
    });
});
