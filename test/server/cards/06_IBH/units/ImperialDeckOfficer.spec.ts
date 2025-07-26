describe('Imperial Deck Officer', function() {
    integration(function(contextRef) {
        it('Imperial Deck Officer\'s ability should heal 2 damage from a Villainy unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['imperial-deck-officer', { card: 'maul#shadow-collective-visionary', damage: 3 }, 'wampa']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.imperialDeckOfficer);
            context.player1.clickPrompt('Heal 2 damage from a Villainy unit');
            expect(context.player1).toBeAbleToSelectExactly([context.maul, context.atst]);
            context.player1.clickCard(context.maul);

            expect(context.maul.damage).toBe(1);
            expect(context.imperialDeckOfficer.exhausted).toBe(true);
        });
    });
});