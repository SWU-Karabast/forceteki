describe('Purge Trooper', function() {
    integration(function(contextRef) {
        it('Purge Trooper\'s when played ability should deal 2 damage to a Force unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['purge-trooper'],
                    groundArena: ['yoda#old-master']
                },
                player2: {
                    groundArena: ['luke-skywalker#jedi-knight', 'battlefield-marine'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.purgeTrooper);
            expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.lukeSkywalker]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.lukeSkywalker);

            expect(context.player2).toBeActivePlayer();
            expect(context.lukeSkywalker.damage).toBe(2);
        });
    });
});