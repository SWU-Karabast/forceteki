describe('Dire Prowess', function() {
    integration(function(contextRef) {
        it('Dire Prowess\'s ability should give a weakness token to a unit when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dire-prowess'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['clone-x-assassin', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.direProwess);
            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.cloneXAssassin]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toHaveExactUpgradeNames(['weakness']);
            expect(context.atst.getPower()).toBe(5);
            expect(context.atst.getHp()).toBe(6);
        });
    });
});
