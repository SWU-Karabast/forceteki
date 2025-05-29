describe('Jedi Starfighter', function() {
    integration(function(contextRef) {
        it('Jedi Starfighter\'s ability should allow dealing 1 damage to a space unit on attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['jedi-starfighter', 'phoenix-squadron-awing'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.jediStarfighter);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.phoenixSquadronAwing, context.jediStarfighter]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing.damage).toBe(1);
        });
    });
});