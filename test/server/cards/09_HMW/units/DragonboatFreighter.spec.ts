describe('Dragonboat Freighter', function() {
    integration(function(contextRef) {
        it('should give a Weakness token to a non-unique unit without exhausting it', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dragonboat-freighter'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['cid-scaleback#cant-be-trusted'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dragonboatFreighter);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cidScaleback, context.dragonboatFreighter]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['weakness']);
            expect(context.wampa.exhausted).toBeFalse();
        });

        it('should give a Weakness token to a unique unit and exhaust it', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dragonboat-freighter'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['cid-scaleback#cant-be-trusted'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dragonboatFreighter);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cidScaleback, context.dragonboatFreighter]);

            context.player1.clickCard(context.cidScaleback);

            expect(context.player2).toBeActivePlayer();
            expect(context.cidScaleback).toHaveExactUpgradeNames(['weakness']);
            expect(context.cidScaleback.exhausted).toBeTrue();
        });

        it('may be passed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dragonboat-freighter'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['cid-scaleback#cant-be-trusted'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dragonboatFreighter);

            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.cidScaleback).toHaveExactUpgradeNames([]);
        });
    });
});
