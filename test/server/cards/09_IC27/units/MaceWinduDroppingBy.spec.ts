describe('Mace Windu, Dropping By', function() {
    integration(function(contextRef) {
        it('should give an Experience token to itself when it attacks', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['mace-windu#dropping-by'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.maceWindu);
            context.player1.clickCard(context.p2Base);

            expect(context.maceWindu).toHaveExactUpgradeNames(['experience']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.p2Base.damage).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
