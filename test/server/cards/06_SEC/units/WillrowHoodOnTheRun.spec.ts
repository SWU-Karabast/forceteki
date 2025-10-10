describe('Willrow Hood On the Run', function () {
    integration(function (contextRef) {
        describe('Willrow Hood On the Run\'s ability with one upgrade', function () {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'willrow-hood#on-the-run', upgrades: ['the-darksaber'] }],
                    },
                    player2: {
                        hand: ['disabling-fang-fighter', 'bamboozle']
                    }
                });
            });

            it('should prevent the upgrade from being defeated by an enemy ability', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.disablingFangFighter);
                context.player2.clickCard(context.willrowHoodOnTheRun.upgrades[0]);

                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames(['the-darksaber']);
            });

            it('should prevent the upgrade from being returned to hand by an enemy ability', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.willrowHoodOnTheRun);

                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames(['the-darksaber']);
            });
        });

        describe('Willrow Hood On The Run\'s abilities with multiple upgrades', function () {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'willrow-hood#on-the-run', upgrades: ['the-darksaber', 'jedi-lightsaber'] }],
                    },
                    player2: {
                        hand: ['disabling-fang-fighter', 'bamboozle']
                    }
                });
            });


            it('should not prevent the upgrade from being defeated by an enemy ability', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.disablingFangFighter);
                context.player2.clickCard(context.theDarksaber);

                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames(['jedi-lightsaber']);
            });

            it('should not prevent the upgrade from being returned to hand by an enemy ability', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.willrowHoodOnTheRun);

                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames([]);
            });
        });

        it('should defeat the upgrade if unit is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'willrow-hood#on-the-run', upgrades: ['the-darksaber'] }],
                },
                player2: {
                    hand: ['vanquish'],
                },
            });
            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.willrowHoodOnTheRun);

            expect(context.willrowHoodOnTheRun.zoneName).toBe('discard');
            expect(context.theDarksaber.zoneName).toBe('discard');
        });

        it('should defeate the upgrade if unit is returned to hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'willrow-hood#on-the-run', upgrades: ['the-darksaber'] }],
                },
                player2: {
                    hand: ['waylay'],
                },
            });
            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.willrowHoodOnTheRun);

            expect(context.willrowHoodOnTheRun.zoneName).toBe('hand');
            expect(context.theDarksaber.zoneName).toBe('discard');
        });
    });
});