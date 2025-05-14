describe('Dume, Redeem the Future', function () {
    integration(function (contextRef) {
        it('Dume\'s ability should give an experience to other friendly non-Vehicle unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['dume#redeem-the-future', 'wampa', 'finn#on-the-run'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });
            const { context } = contextRef;
            context.moveToRegroupPhase();

            expect(context.dume).toHaveExactUpgradeNames([]);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            expect(context.finn).toHaveExactUpgradeNames(['experience']);
        });
    });
});