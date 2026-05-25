describe('Zeb Orrelios, Fists Work Every Time', function () {
    integration(function (contextRef) {
        describe('Zeb Orrelios\'s when played ability', function () {
            it('should give 3 Advantage tokens to another unit when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['zeb-orrelios#fists-work-every-time'],
                        groundArena: ['wampa'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.zebOrrelios);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing, context.atst]);
                expect(context.player1).not.toBeAbleToSelect(context.zebOrrelios);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.wampa).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
            });

            it('should give 3 Advantage tokens to an enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['zeb-orrelios#fists-work-every-time'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickCard(context.atst);

                expect(context.atst).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
            });
        });

        describe('Zeb Orrelios\'s triggered ability', function () {
            it('should deal 1 damage to a base when a unit you control with upgrades is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall'],
                        groundArena: ['zeb-orrelios#fists-work-every-time', { card: 'pyke-sentinel', upgrades: ['academy-training'] }],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });
                const { context } = contextRef;

                // Use rivals-fall to defeat the pyke sentinel with upgrades
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.pykeSentinel);

                // Pyke sentinel should be defeated
                expect(context.pykeSentinel).toBeInZone('discard');

                // Should prompt to deal 1 damage to a base
                expect(context.player1).toBeAbleToSelectExactly([context.player1.base, context.player2.base]);
                context.player1.clickCard(context.player2.base);

                expect(context.player2.base.damage).toBe(1);
            });

            it('should deal 1 damage to a base when a unit with upgrades is defeated (No Glory Only Results)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['zeb-orrelios#fists-work-every-time'],
                    },
                    player2: {
                        groundArena: [{ card: 'atst', upgrades: ['experience'] }],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.atst);

                expect(context.player1).toBeAbleToSelectExactly([context.player1.base, context.player2.base]);
                context.player1.clickCard(context.player2.base);

                expect(context.player2.base.damage).toBe(1);
            });

            it('should not trigger when a unit without upgrades is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['zeb-orrelios#fists-work-every-time'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.atst);

                expect(context.wampa).toBeInZone('discard');
                expect(context.player2.base.damage).toBe(0);
            });

            it('should not trigger when an enemy unit with upgrades is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['zeb-orrelios#fists-work-every-time', 'rivals-fall'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: [{ card: 'pyke-sentinel', upgrades: ['academy-training'] }],
                    }
                });
                const { context } = contextRef;

                // Use rivals-fall to defeat the enemy unit with upgrades
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.player2.base.damage).toBe(0);
            });
        });
    });
});
