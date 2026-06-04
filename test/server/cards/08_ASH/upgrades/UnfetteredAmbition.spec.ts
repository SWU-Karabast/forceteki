describe('Unfettered Ambition', function() {
    integration(function(contextRef) {
        it('should give 1 Advantage token when played on a unit with no other upgrades', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unfettered-ambition'],
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['advantage', 'shield', 'fulcrum'] }]
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.unfetteredAmbition);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();

            // unfettered ambition should create 3 Advantage tokens for Shield, Fulcrum and itself
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([
                'advantage', 'shield', 'fulcrum', 'unfettered-ambition',
                'advantage', 'advantage', 'advantage'
            ]);
        });
    });
});
