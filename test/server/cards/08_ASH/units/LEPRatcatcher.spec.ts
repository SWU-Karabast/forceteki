describe('LEP Ratcatcher', function() {
    integration(function(contextRef) {
        it('should deal 1 damage to a ground unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lep-ratcatcher'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lepRatcatcher);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.lepRatcatcher, context.atst]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(1);
        });
    });
});
