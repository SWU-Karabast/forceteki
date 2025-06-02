describe('Grappling Guardian', function () {
    integration(function (contextRef) {
        it('Grappling Guardian\'s ability should allow defeating a space unit with 6 or less remaining HP', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['grappling-guardian'],
                    spaceArena: ['resupply-carrier']
                },
                player2: {
                    spaceArena: [{
                        card: 'devastator#inescapable',
                        damage: 4
                    }, 'avenger#hunting-star-destroyer', 'green-squadron-awing'],
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;
            const { player1, player2 } = context;

            player1.clickCard(context.grapplingGuardian);
            expect(player1).toBeAbleToSelectExactly([context.devastator, context.greenSquadronAwing, context.resupplyCarrier]);
            expect(player1).toHavePassAbilityButton();
            player1.clickCard(context.devastator);

            expect(player2).toBeActivePlayer();
            expect(context.devastator).toBeInZone('discard');
        });
    });
});