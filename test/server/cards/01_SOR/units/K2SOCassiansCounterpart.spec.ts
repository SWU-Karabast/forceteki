describe('K-2SO, Cassian\'s Counterpart', function() {
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
                    }
                });
            });

            it('should either deal 3 damage to the opponent\'s base or the opponent discards a card from their hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.k2so);
                context.player1.clickCard(context.kraytDragon);
                expect(context.player1).toHaveExactPromptButtons(['Deal 3 damage to opponent\'s base', 'The opponent discards a card']);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickPrompt('The opponent discards a card');
                context.player2.clickCard(context.wampa);
                expect(context.player2.handSize).toBe(0);
                expect(context.wampa).toBeInZone('discard');

                // Reset for next test
                context.player1.moveCard(context.k2so, 'groundArena');
                context.moveToNextActionPhase();

                context.player1.clickCard(context.k2so);
                context.player1.clickCard(context.kraytDragon);

                expect(context.player1).toHaveExactPromptButtons(['Deal 3 damage to opponent\'s base', 'The opponent discards a card']);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickPrompt('Deal 3 damage to opponent\'s base');

                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should work with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['k2so#cassians-counterpart', 'wampa']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['maul#shadow-collective-visionary'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.k2so);

            // Damage is automatically resolved since there are no cards in hand to discard
            expect(context.p1Base.damage).toBe(3);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
