describe('Snub Fighter Squadron', function() {
    integration(function(contextRef) {
        it('Snub Fighter Squadron\'s ability should allow dealing 1 damage to a space unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['phoenix-squadron-awing'],
                    hand: ['snub-fighter-squadron']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.snubFighterSquadron);
            context.player1.clickPrompt('Deal 1 damage to a space unit');

            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.phoenixSquadronAwing, context.snubFighterSquadron]);
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.greenSquadronAwing);

            // Pass the Ambush
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing.damage).toBe(1);
        });
    });
});