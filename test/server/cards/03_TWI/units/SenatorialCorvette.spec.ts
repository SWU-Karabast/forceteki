describe('Senatorial Corvette', function() {
    integration(function(contextRef) {
        it('should discard a card from opponents hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    spaceArena: ['senatorial-corvette'],
                },
                player2: {
                    hand: ['atst'],
                    spaceArena: ['ruthless-raider'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.senatorialCorvette);
            context.player1.clickCard(context.ruthlessRaider);
            context.player2.clickCard(context.atst);

            expect(context.player2.handSize).toBe(0);
            expect(context.atst).toBeInZone('discard');
            expect(context.player1.handSize).toBe(1);
            expect(context.wampa).toBeInZone('hand');
        });

        it('should make the original owner discard when defeated with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    spaceArena: ['senatorial-corvette'],
                },
                player2: {
                    hand: ['no-glory-only-results', 'atst'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.senatorialCorvette);

            expect(context.senatorialCorvette).toBeInZone('discard', context.player1);

            // Player 2 controlled the Corvette when it was defeated, so player 1 is the opponent who discards
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toBeInZone('discard', context.player1);
            expect(context.player1.handSize).toBe(0);
            expect(context.atst).toBeInZone('hand', context.player2);
            expect(context.player2.handSize).toBe(1);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
