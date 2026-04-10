describe('Executor, Final Destruction of the Alliance', function() {
    integration(function(contextRef) {
        it('Executor\'s when played ability gives Advantage tokens to each other friendly unit and constant ability give +1/+0 for each upgrade on other friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['executor#final-destruction-of-the-alliance'],
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.executor);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['advantage']);
            expect(context.atst).toHaveExactUpgradeNames(['advantage']);
            expect(context.awing).toHaveExactUpgradeNames(['advantage']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);

            expect(context.executor.getPower()).toBe(8);
            expect(context.executor.getHp()).toBe(12);
        });

        it('Executor\'s constant ability gives +1/+0 for each upgrade on other friendly units (does not count himself, enemy units and count multiple upgrades on same unit)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'executor#final-destruction-of-the-alliance', upgrades: ['shield'] }, 'awing'],
                    groundArena: ['wampa', { card: 'atst', upgrades: ['champion', 'advantage'] }],
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['fulcrum'] }]
                },
            });

            const { context } = contextRef;

            expect(context.executor.getPower()).toBe(7);
            expect(context.executor.getHp()).toBe(12);
        });
    });
});
