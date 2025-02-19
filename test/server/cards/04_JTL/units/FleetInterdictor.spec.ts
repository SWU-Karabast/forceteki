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

            // TODO: Add a test when a space unit is upgraded with a leader unit and is considered a leader unit should be able to defeat it
        });
    });
});
