describe('Political Pressure', function() {
    integration(function(contextRef) {
        describe('Political Pressure\'s ability', function () {
            it('should prompt Opponent to discard a card or let the opponent create 2 Battle Droids tokens', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['political-pressure'],
                    },
                    player2: {
                        hand: ['karabast', 'battlefield-marine', 'atst'],
                    }
                });

                const { context } = contextRef;

                const reset = () => {
                    context.player1.moveCard(context.politicalPressure, 'hand');
                    context.player2.passAction();
                };

                // Opponent discards a card no Battle Droids tokens are created
                context.player1.clickCard(context.politicalPressure);

                expect(context.player2).toHaveEnabledPromptButtons(['Discard a random card from your hand', 'Opponent creates 2 Battle Droid Tokens']);
                context.player2.clickPrompt('Discard a random card from your hand');
                expect(context.player2.getCardsInZone('discard').length).toBe(1);
                expect(context.player1.getCardsInZone('groundArena').length).toBe(0); // No Battle Droids tokens are created
                expect(context.player2.hand.length).toBe(2);

                // Reset
                reset();

                // Opponent decides to create Battle Droids tokens
                context.player1.clickCard(context.politicalPressure);
                expect(context.player2).toHaveEnabledPromptButtons(['Discard a random card from your hand', 'Opponent creates 2 Battle Droid Tokens']);
                context.player2.clickPrompt('Opponent creates 2 Battle Droid Tokens');
                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(2);
                expect(battleDroids).toAllBeInZone('groundArena');
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
                expect(context.player2.getArenaCards().length).toBe(0);
                expect(context.player2.hand.length).toBe(2);
            });

            it('should be skipped as Opponent does not have any cards in hand', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['political-pressure'],
                    }
                });

                const { context } = contextRef;

                // Opponent choose to discard a card with empty hand and no Battle Droids tokens are created
                context.player1.clickCard(context.politicalPressure);

                // TODO: this probably shouldn't show a prompt at all since the discard effect won't fire, likely our resolution checks need some additional work around the optional: true case
                expect(context.player2).toHaveEnabledPromptButtons(['Discard a random card from your hand', 'Opponent creates 2 Battle Droid Tokens']);
                context.player2.clickPrompt('Discard a random card from your hand');
                expect(context.player2.getCardsInZone('discard').length).toBe(0);
                expect(context.player1.getCardsInZone('groundArena').length).toBe(2); // Battle Droids tokens are created
            });
        });
    });
});
