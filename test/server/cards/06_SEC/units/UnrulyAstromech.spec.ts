describe('Unruly Astromech', function () {
    integration(function (contextRef) {
        it('Unruly Astromech\'s when defeated ability should exhaust an enemy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['unruly-astromech']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['vanquish'],
                    groundArena: ['wampa', 'battlefield-marine']
                }
            });

            const { context } = contextRef;

            // Opponent defeats Unruly Astromech
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.unrulyAstromech);

            // When defeated trigger should prompt the controller (player1) to exhaust an enemy unit
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.exhausted).toBeTrue();
            expect(context.player1).toBeActivePlayer();
        });

        it('Unruly Astromech\'s when defeated ability should exhaust a friendly unit (when defeated by No Glory Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['unruly-astromech', 'wampa', 'battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['atst'],
                    hand: ['no-glory-only-results'],
                }
            });

            const { context } = contextRef;

            // Opponent defeats Unruly Astromech
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.unrulyAstromech);

            // When defeated trigger should prompt the controller (player1) to exhaust an enemy unit
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.awing, context.battlefieldMarine]);
            context.player2.clickCard(context.awing);

            expect(context.awing.exhausted).toBeTrue();
            expect(context.player1).toBeActivePlayer();
        });
    });
});
