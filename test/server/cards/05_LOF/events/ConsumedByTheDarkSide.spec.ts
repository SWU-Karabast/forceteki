describe('Consumed By The Dark Side', function() {
    integration(function(contextRef) {
        it('Consumed By The Dark Side\'s event ability should give 2 experience tokens to a unit and deal 2 damage to it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['consumed-by-the-dark-side'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst'],
                }
            });
            const { context } = contextRef;

            // Player 1 plays Consumed By The Dark Side
            context.player1.clickCard(context.consumedByTheDarkSide);

            // Player 1 selects a unit to give experience tokens and deal damage
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.atst]);
            context.player1.clickCard(context.battlefieldMarine);

            // Check that the unit received 2 experience tokens and 2 damage
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.battlefieldMarine.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});