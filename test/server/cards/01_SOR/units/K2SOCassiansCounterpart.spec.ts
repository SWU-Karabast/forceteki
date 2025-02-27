describe('K-2SO', function() {
    integration(function(contextRef) {
        describe('K-2SO\'s When Defeated ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['k2so#cassians-counterpart'],
                    },
                    player2: {
                        hand: ['wampa'],
                        groundArena: ['krayt-dragon'],
                    },
                    autoSingleTarget: true
                });
            });

            it('should either deal 3 damage to the opponent\'s base or the opponent discards a card from their hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.k2so);
                context.player1.clickCard(context.kraytDragon);
                expect(context.player1).toHaveExactPromptButtons(['Deal 3 damage to opponent\'s base', 'The opponent discards a card']);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickPrompt('The opponent discards a card');
                expect(context.player2.handSize).toBe(0);
                expect(context.wampa).toBeInZone('discard');

                context.player1.moveCard(context.k2so, 'groundArena');
                context.player2.clickCard(context.kraytDragon);
                context.player2.clickCard(context.k2so);
                expect(context.player1).toHaveExactPromptButtons(['Deal 3 damage to opponent\'s base', 'The opponent discards a card']);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickPrompt('The opponent discards a card');
                expect(context.player2.handSize).toBe(0);

                context.player1.moveCard(context.k2so, 'groundArena');
                context.moveToNextActionPhase();

                context.player1.clickCard(context.k2so);
                context.player1.clickCard(context.kraytDragon);
                expect(context.p2Base.damage).toBe(2);

                expect(context.player1).toHaveExactPromptButtons(['Deal 3 damage to opponent\'s base', 'The opponent discards a card']);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickPrompt('Deal 3 damage to opponent\'s base');
                expect(context.p2Base.damage).toBe(5);
            });
        });
    });
});
