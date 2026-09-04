describe('Fambaa Shield Team', function() {
    integration(function(contextRef) {
        it('Fambaa Shield Team\'s ability should give a Shield token to each friendly ground unit without a Shield token', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fambaa-shield-team'],
                    groundArena: ['battlefield-marine', { card: 'gungan-warrior', upgrades: ['shield'] }],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fambaaShieldTeam);

            expect(context.player2).toBeActivePlayer();
            expect(context.fambaaShieldTeam).toHaveExactUpgradeNames(['shield']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.gunganWarrior).toHaveExactUpgradeNames(['shield']);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
        });
    });
});
