describe('J-Type Nubian Starship', function () {
    integration(function (contextRef) {
        it('J-Type Nubian Starship\'s when played ability should draw a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jtype-nubian-starship'],
                    deck: ['porg', 'wampa']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jtypeNubianStarship);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('hand', context.player1);
            expect(context.player1.handSize).toBe(1);
        });

        it('J-Type Nubian Starship\'s when defeated ability should discard a card from our hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['jtype-nubian-starship'],
                    hand: ['porg', 'wampa']
                },
                player2: {
                    hand: ['takedown'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.jtypeNubianStarship);

            expect(context.player1).toBeAbleToSelectExactly([context.porg, context.wampa]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            context.player1.clickCard(context.porg);

            expect(context.player1).toBeActivePlayer();
            expect(context.porg).toBeInZone('discard');
        });

        it('J-Type Nubian Starship\'s when defeated ability should discard a card from our hand (no glory only results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['jtype-nubian-starship'],
                    hand: ['battlefield-marine']
                },
                player2: {
                    hand: ['no-glory-only-results', 'porg', 'wampa'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.jtypeNubianStarship);

            expect(context.player2).toBeAbleToSelectExactly([context.porg, context.wampa]);
            expect(context.player2).not.toHavePassAbilityButton();
            expect(context.player2).not.toHaveChooseNothingButton();

            context.player2.clickCard(context.porg);

            expect(context.player1).toBeActivePlayer();
            expect(context.porg).toBeInZone('discard');
        });
    });
});
