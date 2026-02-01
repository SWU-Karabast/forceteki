describe('Abilities with multiple triggers track type', function() {
    const whenDefeatedPrompt = (cardTitle: string) => `Exhaust Grand Admiral Thrawn to use ${cardTitle}'s "When Defeated" ability again`;
    integration(function(contextRef) {
        it('Thrawn should not trigger when playing a unit with played/defeated trigger that was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'grand-admiral-thrawn#how-unfortunate',
                    hand: [
                        'salvage'
                    ],
                    spaceArena: [
                        'ruthless-raider'
                    ]
                },
                player2: {
                    hand: [
                        'vanquish'
                    ]
                }
            });
            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.ruthlessRaider);

            expect(context.player1).toHavePassAbilityPrompt(whenDefeatedPrompt(context.ruthlessRaider.title));
            context.player1.clickPrompt('Pass');

            context.player1.clickCard(context.salvage);
            context.player1.clickCard(context.ruthlessRaider);

            expect(context.player1).not.toHavePassAbilityPrompt(whenDefeatedPrompt(context.ruthlessRaider.title));
        });
    });
});