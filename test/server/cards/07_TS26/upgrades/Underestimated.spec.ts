describe('Underestimated', function() {
    integration(function(contextRef) {
        it('Underestimated can only attach to units with cost 4 or less', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['underestimated'],
                    groundArena: ['wampa', 'atst'],
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.underestimated);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.consularSecurityForce]);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['underestimated']);
        });
    });
});
