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

        it('Executor\'s constant ability gives +1/+0 for each upgrade on other friendly units (count enemy upgrades on friendly unit and does not friendly upgrades on enemy units)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['top-target'],
                    spaceArena: ['executor#final-destruction-of-the-alliance', 'awing'],
                    groundArena: ['wampa', { card: 'atst', upgrades: ['champion', 'advantage'] }, 'hondo-ohnaka#superfluous-swindler'],
                },
                player2: {
                    hand: ['entrenched'],
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['fulcrum', 'experience'] }]
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.topTarget);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.executor.getPower()).toBe(7);
            expect(context.executor.getHp()).toBe(12);

            context.player2.clickCard(context.entrenched);
            context.player2.clickCard(context.atst);

            expect(context.executor.getPower()).toBe(8);
            expect(context.executor.getHp()).toBe(12);

            context.player1.clickCard(context.hondoOhnaka);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.experience);
            context.player1.clickCard(context.wampa);

            expect(context.executor.getPower()).toBe(9);
            expect(context.executor.getHp()).toBe(12);
        });
    });
});
