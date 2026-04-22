describe('Han Solo, It\'ll Work', function() {
    integration(function(contextRef) {
        it('Han Solo\'s ability should deal 3 damage to itself and give 3 advantage tokens to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['han-solo#itll-work'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['sundari-peacekeeper'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.hanSolo);

            expect(context.player1).toHavePrompt('Give 3 Advantage tokens to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.hanSolo, context.sundariPeacekeeper, context.awing]);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.hanSolo.damage).toBe(3);
            expect(context.wampa).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
        });
    });
});
