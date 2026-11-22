describe('Clone X Assassin', function() {
    integration(function(contextRef) {
        it('Clone X Assassin\'s ability should give a weakness token to a unit when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['takedown'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['clone-x-assassin', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.cloneXAssassin);

            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst]);
            expect(context.player2).toHavePassAbilityButton();

            context.player2.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['weakness']);
            expect(context.wampa.getPower()).toBe(3);
            expect(context.wampa.getHp()).toBe(4);
        });

        it('Clone X Assassin\'s ability should give a weakness token to a unit when defeated (No Glory Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['clone-x-assassin', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.cloneXAssassin);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toHaveExactUpgradeNames(['weakness']);
            expect(context.atst.getPower()).toBe(5);
            expect(context.atst.getHp()).toBe(6);
        });
    });
});
