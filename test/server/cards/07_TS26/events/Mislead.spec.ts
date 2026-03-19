describe('Mislead', function() {
    integration(function(contextRef) {
        it('Mislead\'s ability should give Shield to one unit and -3/0 power to another unit for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mislead'],
                    groundArena: ['luke-skywalker#jedi-knight'],
                    spaceArena: ['xwing']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['tie-fighter']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.mislead);
            expect(context.player1).toHavePrompt('Give a Shield token to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.xwing, context.atst, context.tieFighter]);

            context.player1.clickCard(context.lukeSkywalker);

            // Should prompt for -3/0 target
            expect(context.player1).toHavePrompt('Give a unit –3/–0 for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.xwing, context.atst, context.tieFighter]);

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.lukeSkywalker).toHaveExactUpgradeNames(['shield']);
            expect(context.atst.getPower()).toBe(3);
            expect(context.atst.getHp()).toBe(7);

            context.moveToNextActionPhase();

            expect(context.atst.getPower()).toBe(6);
            expect(context.atst.getHp()).toBe(7);
        });
    });
});
