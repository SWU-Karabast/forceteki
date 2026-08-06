describe('Gorian Shard\'s Corsair, Pirate Warship', function () {
    integration(function (contextRef) {
        describe('its When Played/On Attack ability', function () {
            describe('When Played', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['gorian-shards-corsair#pirate-warship']
                        },
                        player2: {
                            spaceArena: ['green-squadron-awing'],
                            groundArena: ['wampa']
                        }
                    });
                });

                it('should deal 2 damage to a chosen unit when played', function () {
                    const { context } = contextRef;

                    // Play Corsair from hand; When Played ability triggers
                    context.player1.clickCard(context.gorianShardsCorsair);

                    // Optional triggered ability fires: player selects any unit or passes
                    expect(context.player1).toHavePrompt('Deal 2 damage to a unit');
                    expect(context.player1).toBeAbleToSelectExactly([context.gorianShardsCorsair, context.greenSquadronAwing, context.wampa]);
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickCard(context.wampa);

                    expect(context.wampa.damage).toBe(2);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should allow the player to decline the damage ("you may")', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.gorianShardsCorsair);

                    // Player passes the optional ability
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickPrompt('Pass');

                    // No damage dealt; Corsair entered play normally
                    expect(context.wampa.damage).toBe(0);
                    expect(context.greenSquadronAwing.damage).toBe(0);
                    expect(context.gorianShardsCorsair).toBeInZone('spaceArena');
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('On Attack', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['gorian-shards-corsair#pirate-warship', 'cartel-spacer'],
                        },
                        player2: {
                            spaceArena: ['green-squadron-awing'],
                            groundArena: ['wampa']
                        }
                    });
                });

                it('should deal 2 damage to a chosen unit before combat resolves', function () {
                    const { context } = contextRef;

                    // Attack p2 base with Corsair; On Attack ability triggers
                    context.player1.clickCard(context.gorianShardsCorsair);
                    context.player1.clickCard(context.p2Base);

                    // Can target any unit including ground units; choose Wampa
                    expect(context.player1).toBeAbleToSelectExactly([context.gorianShardsCorsair, context.cartelSpacer, context.greenSquadronAwing, context.wampa]);
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickCard(context.wampa);

                    // 2 ability damage to Wampa, plus 6 combat damage to base
                    expect(context.wampa.damage).toBe(2);
                    expect(context.p2Base.damage).toBe(6);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should allow targeting a friendly unit with the 2 damage', function () {
                    const { context } = contextRef;

                    // Attack p2 base; target a friendly unit with the On Attack ability
                    context.player1.clickCard(context.gorianShardsCorsair);
                    context.player1.clickCard(context.p2Base);

                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickCard(context.cartelSpacer);

                    // Cartel Spacer (3 HP) survived the 2 ability damage
                    expect(context.cartelSpacer.damage).toBe(2);
                    expect(context.cartelSpacer).toBeInZone('spaceArena');
                    expect(context.p2Base.damage).toBe(6);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should make the On Attack 2 damage bypass a Shield token (Corsair is Underworld)', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['gorian-shards-corsair#pirate-warship'],
                        },
                        player2: {
                            spaceArena: [{ card: 'hyperspace-wayfarer', upgrades: ['shield'] }]
                        }
                    });

                    const { context } = contextRef;

                    // Attack the Hyperspace Wayfarer (10 HP) with Corsair; On Attack triggers
                    context.player1.clickCard(context.gorianShardsCorsair);
                    context.player1.clickCard(context.hyperspaceWayfarer);

                    // Deal 2 ability damage to the shielded Hyperspace Wayfarer — damage is unpreventable
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickCard(context.hyperspaceWayfarer);

                    // Both the 2 ability damage and the 6 combat damage are unpreventable
                    // (Corsair is Underworld), so the Shield is never consumed and Wayfarer takes 8 damage total
                    expect(context.hyperspaceWayfarer).toHaveExactUpgradeNames(['shield']);
                    expect(context.hyperspaceWayfarer.damage).toBe(8);
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });

        describe('its constant ability', function () {
            describe('When Corsair is in play', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['gorian-shards-corsair#pirate-warship', 'cartel-spacer'],
                            hand: ['ma-klounkee'],
                            leader: 'cad-bane#still-faster-than-you'
                        },
                        player2: {
                            spaceArena: [{ card: 'green-squadron-awing', upgrades: ['shield'] }],
                            groundArena: [{ card: 'wampa', upgrades: ['shield'] }]
                        }
                    });
                });

                it('should make damage dealt by a friendly Underworld event bypass a Shield token', function () {
                    const { context } = contextRef;

                    // Play Ma Klounkee (Underworld event) — bounce Cartel Spacer back to hand, deal 3 damage to shielded Wampa
                    context.player1.clickCard(context.maKlounkee);
                    expect(context.player1).toBeAbleToSelectExactly([context.gorianShardsCorsair, context.cartelSpacer]);
                    context.player1.clickCard(context.cartelSpacer);

                    // Target the shielded Wampa — damage is unpreventable so Shield does not absorb it
                    // (Cartel Spacer was returned to hand and is no longer a valid target)
                    expect(context.player1).toBeAbleToSelectExactly([context.gorianShardsCorsair, context.wampa, context.greenSquadronAwing]);
                    context.player1.clickCard(context.wampa);

                    // Shield is still attached (not consumed) and Wampa has 3 damage
                    expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                    expect(context.wampa.damage).toBe(3);
                });

                it('should make ability damage dealt by a friendly Underworld unit bypass a Shield token', function () {
                    const { context } = contextRef;

                    // Attack the base with Corsair; use the On Attack ability to deal 2 damage to the shielded A-Wing
                    context.player1.clickCard(context.gorianShardsCorsair);
                    context.player1.clickCard(context.p2Base);

                    // Deal 2 damage to the shielded A-Wing via the On Attack ability (Corsair is Underworld)
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickCard(context.greenSquadronAwing);

                    // Shield is still attached (not consumed) and A-Wing has 2 damage
                    expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['shield']);
                    expect(context.greenSquadronAwing.damage).toBe(2);
                    expect(context.p2Base.damage).toBe(6);
                });

                it('should make combat damage dealt by a friendly Underworld unit bypass a Shield token', function () {
                    const { context } = contextRef;

                    // Attack the shielded A-Wing with Cartel Spacer (Underworld unit, 2 power)
                    context.player1.clickCard(context.cartelSpacer);
                    context.player1.clickCard(context.greenSquadronAwing);

                    // Shield is still attached (unpreventable bypasses Shield prevention); A-Wing has 2 damage
                    expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['shield']);
                    expect(context.greenSquadronAwing.damage).toBe(2);

                    // A-Wing's return combat damage (non-Underworld source) is still preventable but Cartel has no Shield
                    expect(context.cartelSpacer.damage).toBe(1);
                });

                it('should make damage dealt by a friendly Underworld leader (undeployed) bypass a Shield token', function () {
                    const { context } = contextRef;

                    // Use Cad Bane's leader-side action: "Deal 1 damage to a unit with 2 or more remaining HP"
                    context.player1.clickCard(context.cadBane);
                    context.player1.clickPrompt('Deal 1 damage to a unit with 2 or more remaining HP');
                    context.player1.clickCard(context.wampa);

                    // Cad Bane is an Underworld leader → his damage is unpreventable; Shield stays attached
                    expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                    expect(context.wampa.damage).toBe(1);
                });
            });

            it('should make damage dealt by a friendly Underworld leader unit (deployed) bypass a Shield token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['gorian-shards-corsair#pirate-warship'],
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true }
                    },
                    player2: {
                        groundArena: [{ card: 'atst', upgrades: ['shield'] }]
                    }
                });

                const { context } = contextRef;

                // Deployed Cad Bane (4/7, Underworld leader unit) attacks AT-ST (6/7) with a Shield
                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.atst);

                // On Attack ability: deal 1 damage to AT-ST — unpreventable
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.atst);

                // Both the On Attack 1 damage and the 4 combat damage are unpreventable;
                // Shield stays attached and AT-ST has 1 + 4 = 5 damage
                expect(context.atst).toHaveExactUpgradeNames(['shield']);
                expect(context.atst.damage).toBe(5);
            });

            it('should make combat damage dealt to a base by a friendly Underworld unit bypass Close the Shield Gate', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['gorian-shards-corsair#pirate-warship', 'cartel-spacer']
                    },
                    player2: {
                        hand: ['close-the-shield-gate'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // P2 plays Close the Shield Gate targeting their own base — prevent the next damage dealt to it
                context.player2.clickCard(context.closeTheShieldGate);
                context.player2.clickCard(context.p2Base);

                // P1 attacks p2 base with Cartel Spacer (Underworld, 2 power)
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                // The combat damage is unpreventable (Cartel Spacer is Underworld and Corsair is in play),
                // so Close the Shield Gate's prevention is bypassed and the base takes the full 2 damage
                expect(context.p2Base.damage).toBe(2);
            });

            it('should deal the damage to units that cannot be damaged by enemy card abilities (Lurking TIE Phantom)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['gorian-shards-corsair#pirate-warship'],
                    },
                    player2: {
                        spaceArena: ['lurking-tie-phantom']
                    }
                });

                const { context } = contextRef;

                // Attack the base with Corsair; use the On Attack ability to deal 2 damage to the Lurking TIE Phantom
                context.player1.clickCard(context.gorianShardsCorsair);
                context.player1.clickCard(context.p2Base);

                // Target the Lurking TIE Phantom with the On Attack ability
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.lurkingTiePhantom);

                // Damage cannot be prevented, so it takes the damage and is defeated
                expect(context.lurkingTiePhantom).toBeInZone('discard');
            });

            it('should deal the full amount of damage even if enemy units have partial damage prevention (Vigil)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['gorian-shards-corsair#pirate-warship'],
                    },
                    player2: {
                        spaceArena: ['vigil#securing-the-future'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Attack the base with Corsair; use the On Attack ability to deal 2 damage to Battlefield Marine
                context.player1.clickCard(context.gorianShardsCorsair);
                context.player1.clickCard(context.p2Base);

                // Target the Battlefield Marine with the On Attack ability
                context.player1.clickCard(context.battlefieldMarine);

                // Vigil's constant ability does not reduce the damage taken by Battlefield Marine
                expect(context.battlefieldMarine.damage).toBe(2);
            });

            it('should NOT make damage from an enemy Underworld card bypass a friendly Shield token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [
                            'gorian-shards-corsair#pirate-warship',
                            { card: 'green-squadron-awing', upgrades: ['shield'] }
                        ]
                    },
                    player2: {
                        spaceArena: ['cartel-spacer'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // P2 attacks the shielded A-Wing with Cartel Spacer (Underworld, but enemy from P1's perspective)
                // Corsair only grants unpreventable to friendly Underworld cards, so the Shield prevents the damage
                context.player2.clickCard(context.cartelSpacer);
                context.player2.clickCard(context.greenSquadronAwing);

                expect(context.greenSquadronAwing).not.toHaveExactUpgradeNames(['shield']);
                expect(context.greenSquadronAwing.damage).toBe(0);
            });

            it('should NOT make damage from a friendly non-Underworld card bypass a Shield token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['gorian-shards-corsair#pirate-warship'],
                        hand: ['battered-haulcraft'],
                    },
                    player2: {
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['shield'] }]
                    }
                });

                const { context } = contextRef;

                // Play Battered Haulcraft (Vehicle/Transport — not Underworld) — it deals 1 damage to an enemy space unit
                // The Corsair's effect only applies to Underworld cards, so the Shield absorbs the damage
                context.player1.clickCard(context.batteredHaulcraft);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing]);
                context.player1.clickCard(context.greenSquadronAwing);

                // Shield was consumed (defeated) by prevention; A-Wing has no damage
                expect(context.greenSquadronAwing).not.toHaveExactUpgradeNames(['shield']);
                expect(context.greenSquadronAwing.damage).toBe(0);
            });

            it('should NOT make friendly Underworld ability damage bypass a Shield when Corsair has left play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['gorian-shards-corsair#pirate-warship'],
                        hand: ['vanquish', 'ma-klounkee'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['shield'] }],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // P2 passes; P1 uses Vanquish to defeat the Corsair
                context.player2.passAction();
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.gorianShardsCorsair);
                expect(context.gorianShardsCorsair).toBeInZone('discard');

                context.player2.passAction();

                // Play Ma Klounkee (Underworld event) — bounce Pyke Sentinel, then deal 3 damage to shielded Wampa
                // Corsair is gone, so the damage is no longer unpreventable
                context.player1.clickCard(context.maKlounkee);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel]);
                context.player1.clickCard(context.pykeSentinel);

                // Select Wampa as the target for the 3 damage
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                // Shield absorbs the damage (damage was preventable without Corsair) and is defeated; Wampa has 0 damage
                expect(context.wampa).not.toHaveExactUpgradeNames(['shield']);
                expect(context.wampa.damage).toBe(0);
            });
        });
    });
});
