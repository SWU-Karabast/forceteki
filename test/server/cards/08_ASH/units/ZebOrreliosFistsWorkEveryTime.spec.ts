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
            it('should deal 1 damage to a base when a unit you control with upgrade is defeated', async function () {
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
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(1);
            });

            it('should deal 1 damage to a base when an enemy unit with upgrade is defeated (No Glory Only Results)', async function () {
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

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(1);
            });

            it('should not trigger when a friendly unit without upgrades is defeated', async function () {
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
                expect(context.p2Base.damage).toBe(0);
            });

            it('should not trigger when a friendly unit with enemy upgrades is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['zeb-orrelios#fists-work-every-time'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['condemn'],
                        groundArena: ['atst'],
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.condemn);
                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.atst);

                expect(context.wampa).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(0);
            });

            it('should not trigger when an enemy unit with enemy upgrades is defeated', async function () {
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
                expect(context.p2Base.damage).toBe(0);
            });

            it('should trigger when a friendly upgrade is defeated (from friendly unit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zeb-orrelios#fists-work-every-time', { card: 'wampa', upgrades: ['experience'] }],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['outer-rim-constable'],
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.outerRimConstable);
                context.player2.clickCard(context.experience);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.p2Base.damage).toBe(1);
            });

            it('should trigger when a friendly upgrade is defeated (Pilot)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chewbacca#faithful-first-mate'],
                        groundArena: ['zeb-orrelios#fists-work-every-time'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        hand: ['outer-rim-constable'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca with Piloting');
                context.player1.clickCard(context.awing);

                context.player2.clickCard(context.outerRimConstable);
                context.player2.clickCard(context.chewbacca);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });

            it('should trigger when a friendly upgrade is defeated (from enemy unit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['condemn'],
                        groundArena: ['zeb-orrelios#fists-work-every-time'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['outer-rim-constable'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.condemn);
                context.player1.clickCard(context.wampa);

                context.player2.clickCard(context.outerRimConstable);
                context.player2.clickCard(context.condemn);

                // Should prompt to deal 1 damage to a base
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });

            it('should trigger when a multiple friendly upgrades are defeated (from friendly unit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zeb-orrelios#fists-work-every-time', { card: 'wampa', upgrades: ['experience', 'advantage'] }],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['kit-fistos-aethersprite#good-hunting'],
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.kitFistosAethersprite);
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.experience);
                context.player2.clickCard(context.advantage);
                context.player2.clickDone();

                expect(context.player1).toHaveExactPromptButtons([
                    'Deal 1 damage to a base: Advantage',
                    'Deal 1 damage to a base: Experience'
                ]);

                context.player1.clickPrompt('Deal 1 damage to a base: Experience');

                // Should prompt to deal 1 damage to a base
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // Should prompt to deal 1 damage to a base
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(2);
            });

            it('should trigger when a multiple friendly upgrades are defeated (from friendly unit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'hondo-ohnaka#superfluous-swindler']
                    },
                    player2: {
                        groundArena: ['zeb-orrelios#fists-work-every-time', {
                            card: 'wampa',
                            upgrades: ['experience', 'advantage']
                        }],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.hondoOhnaka);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.experience);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames(['advantage']);
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.p2Base.damage).toBe(3);
            });

            it('should not trigger when friendly upgrade are returned to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zeb-orrelios#fists-work-every-time', {
                            card: 'wampa',
                            upgrades: ['experience', 'advantage']
                        }],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['bamboozle'],
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
            });

            it('should trigger friendly upgraded unit is returned to hand, defeating friendly upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zeb-orrelios#fists-work-every-time', {
                            card: 'wampa',
                            upgrades: ['experience', 'advantage']
                        }],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['waylay'],
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toHaveExactPromptButtons([
                    'Deal 1 damage to a base: Advantage',
                    'Deal 1 damage to a base: Experience'
                ]);

                context.player1.clickPrompt('Deal 1 damage to a base: Experience');

                // Should prompt to deal 1 damage to a base
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // Should prompt to deal 1 damage to a base
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(2);
            });

            it('should trigger when enemy upgrade which had been took control is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['evidence-of-the-crime'],
                        groundArena: ['zeb-orrelios#fists-work-every-time']
                    },
                    player2: {
                        hand: ['outer-rim-constable'],
                        groundArena: [{ card: 'sabine-wren#explosives-artist', upgrades: ['sabines-lightsaber#not-alone'] }]
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.evidenceOfTheCrime);
                context.player1.clickCard(context.sabinesLightsaber);
                context.player1.clickCard(context.zebOrrelios);

                context.player2.clickCard(context.outerRimConstable);
                context.player2.clickCard(context.sabinesLightsaber);

                // Should prompt to deal 1 damage to a base
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });

            it('should not trigger when a friendly upgrade is protected from defeat by a replacement effect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'willrow-hood#on-the-run', upgrades: ['experience'] }, 'zeb-orrelios#fists-work-every-time']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['outer-rim-constable'],
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.outerRimConstable);
                context.player2.clickCard(context.experience);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
            });
        });
    });
});
