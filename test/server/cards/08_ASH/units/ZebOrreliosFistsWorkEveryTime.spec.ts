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

                // Condemn's gained on-attack disclose targets the defender, who can't disclose; skip the pause
                context.player2.clickPrompt('Skip');

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

        describe('Zeb Orrelios\'s triggered ability when he leaves play with his own upgrades attached (CR8)', function () {
            it('should trigger from his own upgrades when Zeb himself is defeated by an ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall'],
                        groundArena: [{ card: 'zeb-orrelios#fists-work-every-time', upgrades: ['experience'] }],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });
                const { context } = contextRef;

                // Defeat Zeb (who is carrying his own upgrade) with Rival's Fall
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.zebOrrelios);

                expect(context.zebOrrelios).toBeInZone('discard');

                // Zeb's own Experience upgrade was defeated simultaneously with him leaving play, so his ability triggers
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // player1 took the Rival's Fall action, so player2 is active once the trigger resolves
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });

            it('should trigger from his own upgrades when Zeb himself is defeated in combat', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'zeb-orrelios#fists-work-every-time', upgrades: ['experience'] }],
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['separatist-super-tank'],
                    }
                });
                const { context } = contextRef;

                // Separatist Super Tank (8/8) attacks Zeb (5/7 + Experience = 6/8) and defeats him
                context.player2.clickCard(context.separatistSuperTank);
                context.player2.clickCard(context.zebOrrelios);

                expect(context.zebOrrelios).toBeInZone('discard');

                // Zeb's own Experience upgrade was defeated when he left play, so his ability triggers
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });

            it('should trigger once per upgrade when Zeb himself is defeated with multiple of his own upgrades', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall'],
                        groundArena: [{ card: 'zeb-orrelios#fists-work-every-time', upgrades: ['experience', 'advantage'] }],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.zebOrrelios);

                expect(context.zebOrrelios).toBeInZone('discard');

                // Both of Zeb's own upgrades were defeated simultaneously with him, triggering his ability twice
                expect(context.player1).toHaveExactPromptButtons([
                    'Deal 1 damage to a base: Advantage',
                    'Deal 1 damage to a base: Experience'
                ]);
                context.player1.clickPrompt('Deal 1 damage to a base: Experience');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // player1 took the Rival's Fall action, so player2 is active once both triggers resolve
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(2);
            });

            it('should trigger from his own upgrades when Zeb himself is returned to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'zeb-orrelios#fists-work-every-time', upgrades: ['experience'] }],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['waylay'],
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.zebOrrelios);

                expect(context.zebOrrelios).toBeInZone('hand');

                // Zeb's own Experience upgrade was defeated when he was returned to hand, so his ability triggers
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });

            it('should trigger from his own upgrades when Zeb himself is captured', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'zeb-orrelios#fists-work-every-time', upgrades: ['experience'] }],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['take-captive'],
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                // player2's Wampa captures Zeb; Zeb leaves play and his own Experience upgrade is defeated
                context.player2.clickCard(context.takeCaptive);
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.zebOrrelios);

                expect(context.zebOrrelios).toBeCapturedBy(context.wampa);

                // Zeb's ability triggers off his own upgrade being defeated as he leaves play
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // player2 took the Take Captive action, so player1 is active once the trigger resolves
                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });
        });
    });
});
