describe('Flarestar Attack Shuttle', function () {
    integration(function (contextRef) {
        it('should give an Advantage token to a unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['flarestar-attack-shuttle'],
                    spaceArena: ['awing'],
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['tie-fighter'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flarestarAttackShuttle);

            expect(context.player1).toHavePrompt('Give an Advantage token to a unit');
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.wampa, context.atst, context.tieFighter, context.flarestarAttackShuttle]);

            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toHaveExactUpgradeNames(['advantage']);
        });

        it('should give an Advantage token to a unit when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['awing', 'flarestar-attack-shuttle'],
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['tie-fighter'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flarestarAttackShuttle);
            context.player1.clickCard(context.tieFighter);

            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.wampa, context.atst]);

            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['advantage']);
        });

        it('should work with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    spaceArena: ['flarestar-attack-shuttle'],
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['maul#shadow-collective-visionary'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.flarestarAttackShuttle);

            expect(context.player2).toBeAbleToSelectExactly([context.maul, context.wampa]);
            context.player2.clickCard(context.maul);

            expect(context.player1).toBeActivePlayer();
            expect(context.maul).toHaveExactUpgradeNames(['advantage']);
        });
    });
});
