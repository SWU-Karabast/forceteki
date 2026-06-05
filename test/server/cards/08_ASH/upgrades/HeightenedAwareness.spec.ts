describe('Heightened Awareness', function() {
    integration(function(contextRef) {
        it('Heightened Awareness\' ability should give Advantage token at the start of regroup phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['heightened-awareness'] }],
                },
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.passAction();

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['heightened-awareness', 'advantage']);
        });
    });
});
