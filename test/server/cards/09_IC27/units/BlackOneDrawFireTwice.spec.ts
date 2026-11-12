describe('Black One, Draw Fire Twice', function () {
    integration(function (contextRef) {
        it('Black One\'s ability should draw a card when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['black-one#draw-fire-twice', 'wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.blackOne);

            // Black One leaves the hand but a card is drawn, so hand size stays the same
            expect(context.blackOne).toBeInZone('spaceArena');
            expect(context.player1.handSize).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Black One\'s ability should draw a card when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    spaceArena: ['black-one#draw-fire-twice'],
                },
                player2: {
                    spaceArena: ['tieln-fighter'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            const initialHandSize = context.player1.handSize;

            // TIE/LN Fighter deals exactly 2 damage to defeat Black One
            context.player2.clickCard(context.tielnFighter);
            context.player2.clickCard(context.blackOne);

            expect(context.player1).toBeActivePlayer();
            expect(context.blackOne).toBeInZone('discard');
            expect(context.player1.handSize).toBe(initialHandSize + 1);
            expect(context.player1).toBeActivePlayer();
        });

        it('Black One\'s ability should draw a card for the player controlling it when defeated (No Glory, Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['black-one#draw-fire-twice'],
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            const initialP1HandSize = context.player1.handSize;

            // Player 2 steals Black One and defeats it, so player 2 controls the When Defeated ability
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.blackOne);

            // Player 2 played No Glory, Only Results and drew a card, so their hand is back to 1
            expect(context.player1).toBeActivePlayer();
            expect(context.blackOne).toBeInZone('discard', context.player1);
            expect(context.player2.handSize).toBe(1);
            expect(context.player1.handSize).toBe(initialP1HandSize);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
