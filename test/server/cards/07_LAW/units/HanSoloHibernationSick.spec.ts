describe('Han Solo, Hibernation Sick', function() {
    integration(function(contextRef) {
        it('Han Solo\'s ability gives an Experience token to himself when he attacks', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['han-solo#hibernation-sick']
                },
            });

            const { context } = contextRef;

            // Attack the enemy base with Han
            context.player1.clickCard(context.hanSolo);
            context.player1.clickCard(context.p2Base);

            // On attack, Han should give an Experience token to himself
            expect(context.hanSolo).toHaveExactUpgradeNames(['experience']);

            // His attack should include the +1 from Experience (1 printed power + 1 token = 2)
            expect(context.p2Base.damage).toBe(2);
        });
    });
});
