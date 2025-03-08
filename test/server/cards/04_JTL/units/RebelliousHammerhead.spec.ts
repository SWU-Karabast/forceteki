describe('Rebellious Hammerhead\'s ability', function () {
    integration(function (contextRef) {
        it('should deal damage to a unit equal to the number of cards in hand when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rebellious-hammerhead', 'confiscate', 'atst', 'command', 'darth-vader#scourge-of-squadrons', 'vanquish'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    spaceArena: ['ruthless-raider'],
                }
            });

            const { context } = contextRef;

            // Play Rebellious Hammerhead
            context.player1.clickCard(context.rebelliousHammerhead);

            // Prompt to deal damage to a unit equal to the number of cards in hand
            expect(context.player1).toHavePrompt('Deal damage to a unit equal to the number of cards in your hand');
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.ruthlessRaider, context.rebelliousHammerhead, context.battlefieldMarine]);
            context.player1.clickCard(context.ruthlessRaider);

            // Assert that the damage was dealt
            expect(context.ruthlessRaider.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });

        it('should deal not trigger the ability as player has no cards in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rebellious-hammerhead'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    spaceArena: ['ruthless-raider'],
                }
            });

            const { context } = contextRef;

            // Play Rebellious Hammerhead
            context.player1.clickCard(context.rebelliousHammerhead);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
