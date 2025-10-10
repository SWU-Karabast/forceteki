describe('Willrow Hood On the Run', function () {
    integration(function (contextRef) {
        describe('Willrow Hood On the Run\'s ability with one friendly upgrade', function () {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['confiscate', 'bamboozle'],
                        groundArena: [{ card: 'willrow-hood#on-the-run', upgrades: ['the-darksaber'] }],
                    },
                    player2: {
                        hand: ['disabling-fang-fighter', 'bamboozle']
                    }
                });
                const { context } = contextRef;
                context.p1Bamboozle = context.player1.findCardByName('bamboozle');
                context.p2Bamboozle = context.player2.findCardByName('bamboozle');
            });

            it('should prevent the upgrade from being defeated by an enemy ability', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.disablingFangFighter);
                context.player2.clickCard(context.theDarksaber);

                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames(['the-darksaber']);
            });

            it('should prevent the upgrade from being returned to hand by an enemy ability', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.p2Bamboozle);
                context.player2.clickCard(context.willrowHoodOnTheRun);

                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames(['the-darksaber']);
            });

            it('should not prevent the upgrade from being defeated by its owner', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.confiscate);
                context.player1.clickCard(context.theDarksaber);

                expect(context.theDarksaber.zoneName).toBe('discard');
                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames([]);
            });

            it('should not prevent the upgrade from being returned to hand by its owner', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.p1Bamboozle);
                context.player1.clickCard(context.willrowHoodOnTheRun);

                expect(context.theDarksaber.zoneName).toBe('hand');
                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames([]);
            });
        });

        describe('Willrow Hood On The Run\'s ability with one enemy upgrade', function () {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disabling-fang-fighter', 'bamboozle'],
                        groundArena: [{ card: 'willrow-hood#on-the-run' }],
                    },
                    player2: {
                        hand: ['disabling-fang-fighter', 'bamboozle', 'top-target']
                    }
                });
                const { context } = contextRef;
                context.p1disablingFangFighter = context.player1.findCardByName('disabling-fang-fighter');
                context.p2disablingFangFighter = context.player2.findCardByName('disabling-fang-fighter');
                context.p1Bamboozle = context.player1.findCardByName('bamboozle');
                context.p2Bamboozle = context.player2.findCardByName('bamboozle');
            });

            it('should not prevent an enemy ability from defeating an upgrade', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.willrowHoodOnTheRun);
                context.player1.passAction();
                context.player2.clickCard(context.p2disablingFangFighter);
                context.player2.clickCard(context.topTarget);

                expect(context.topTarget.zoneName).toBe('discard');
            });

            it('should not prevent an enemy ability from returning an upgrade to hand', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.willrowHoodOnTheRun);
                context.player1.passAction();
                context.player2.clickCard(context.p2Bamboozle);
                context.player2.clickCard(context.willrowHoodOnTheRun);

                expect(context.topTarget.zoneName).toBe('hand');
            });

            it('should not prevent a friendly ability from defeated an upgrade', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.willrowHoodOnTheRun);
                context.player1.clickCard(context.p1disablingFangFighter);
                context.player1.clickCard(context.topTarget);

                expect(context.topTarget.zoneName).toBe('discard');
            });

            it('should not prevent a friendly ability from returning an upgrade to hand', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.willrowHoodOnTheRun);
                context.player1.clickCard(context.p1Bamboozle);
                context.player1.clickCard(context.willrowHoodOnTheRun);

                expect(context.topTarget.zoneName).toBe('hand');
            });
        });

        describe('Willrow Hood On The Run\'s ability with multiple friendly upgrades', function () {
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

                expect(context.theDarksaber.zoneName).toBe('discard');
                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames(['jedi-lightsaber']);
            });

            it('should not prevent the upgrade from being returned to hand by an enemy ability', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.willrowHoodOnTheRun);

                expect(context.theDarksaber.zoneName).toBe('hand');
                expect(context.jediLightsaber.zoneName).toBe('hand');
                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames([]);
            });
        });

        describe('Willow Hood\'s ability with one friendly and one enemy upgrade present', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bamboozle', 'confiscate'],
                        groundArena: [{ card: 'willrow-hood#on-the-run', upgrades: ['the-darksaber'] }],
                    },
                    player2: {
                        hand: ['disabling-fang-fighter', 'bamboozle', 'top-target'],
                        groundArena: []
                    }
                });
                const { context } = contextRef;
                context.p1Bamboozle = context.player1.findCardByName('bamboozle');
                context.p2Bamboozle = context.player2.findCardByName('bamboozle');
            });

            it('should prevent the friendly upgrade from being defeated by an enemy ability', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.willrowHoodOnTheRun);
                context.player1.passAction();
                context.player2.clickCard(context.disablingFangFighter);
                context.player2.clickCard(context.theDarksaber);

                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames(['the-darksaber', 'top-target']);
            });

            it('should not prevent the enemy upgrade from being defeated by an enemy ability', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.willrowHoodOnTheRun);
                context.player1.passAction();
                context.player2.clickCard(context.disablingFangFighter);
                context.player2.clickCard(context.topTarget);

                expect(context.topTarget.zoneName).toBe('discard');
                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames(['the-darksaber']);
            });

            it('should prevent the friendly upgrade from being returned to hand by an enemy ability', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.willrowHoodOnTheRun);
                context.player1.passAction();
                context.player2.clickCard(context.p2Bamboozle);
                context.player2.clickCard(context.willrowHoodOnTheRun);

                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames(['the-darksaber']);
                expect(context.topTarget.zoneName).toBe('hand');
            });

            it('should not prevent the friendly upgrade from being defeated by friendly card ability', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.willrowHoodOnTheRun);
                context.player1.clickCard(context.confiscate);
                context.player1.clickCard(context.theDarksaber);

                expect(context.theDarksaber.zoneName).toBe('discard');
                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames(['top-target']);
            });

            it('should not prevent the freindly upgrade from being defeated by friendly card ability', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.willrowHoodOnTheRun);
                context.player1.clickCard(context.confiscate);
                context.player1.clickCard(context.topTarget);

                expect(context.topTarget.zoneName).toBe('discard');
                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames(['the-darksaber']);
            });

            it('should not prevent all upgrades from being reurned to hand by its owner', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.willrowHoodOnTheRun);
                context.player1.clickCard(context.p1Bamboozle);
                context.player1.clickCard(context.willrowHoodOnTheRun);

                expect(context.theDarksaber.zoneName).toBe('hand');
                expect(context.topTarget.zoneName).toBe('hand');
                expect(context.willrowHoodOnTheRun).toHaveExactUpgradeNames([]);
            });
        });

        it('should defeat the upgrade if Willrow Hood is defeated', async function () {
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

        it('should defeat the upgrade if Willrow Hood is returned to hand', async function () {
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