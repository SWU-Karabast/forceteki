describe('Baylan Skoll, Fallen Jedi', function() {
    integration(function(contextRef) {
        const advantagePromptTitle = 'Give an Advantage token to a unit';
        const exhaustPromptTitle = 'Exhaust a unit';

        describe('When Played/When Attack Ends ability', function() {
            describe('When Played trigger', function() {
                it('should give an Advantage token to a unit AND allow exhausting a unit when both conditions are met', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['baylan-skoll#fallen-jedi'],
                            groundArena: [{ card: 'wampa', upgrades: ['experience'] }]
                        },
                        player2: {
                            hand: ['confiscate'],
                            groundArena: ['atst'],
                        }
                    });

                    const { context } = contextRef;

                    // Damage the enemy base with Wampa (+1/+1 from Experience → 5 power) to satisfy the base-damaged condition
                    context.player1.clickCard(context.wampa);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(5);

                    // P2 defeats the friendly Experience upgrade via Confiscate to satisfy the upgrade-defeated condition
                    context.player2.clickCard(context.confiscate);
                    context.player2.clickCard(context.experience);
                    expect(context.wampa).toHaveExactUpgradeNames([]);

                    // Play Baylan — both conditions are met
                    context.player1.clickCard(context.baylanSkoll);

                    // Advantage prompt — valid targets are all units
                    expect(context.player1).toHavePrompt(advantagePromptTitle);
                    expect(context.player1).toBeAbleToSelectExactly([context.baylanSkoll, context.wampa, context.atst]);
                    context.player1.clickCard(context.baylanSkoll);

                    // Exhaust prompt with "Choose nothing" button (this part is optional)
                    expect(context.player1).toHavePrompt(exhaustPromptTitle);
                    expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                    expect(context.player1).toBeAbleToSelectExactly([context.baylanSkoll, context.wampa, context.atst]);
                    context.player1.clickCard(context.atst);

                    // Both effects resolve simultaneously after target selection
                    expect(context.baylanSkoll).toHaveExactUpgradeNames(['advantage']);
                    expect(context.atst.exhausted).toBeTrue();

                    expect(context.player2).toBeActivePlayer();
                });

                it('should give an Advantage token but not prompt for exhaust when only the enemy base was damaged', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['baylan-skoll#fallen-jedi'],
                            groundArena: ['wampa']
                        },
                        player2: {
                            groundArena: ['atst']
                        }
                    });

                    const { context } = contextRef;

                    // Damage the enemy base to satisfy the base-damaged condition
                    context.player1.clickCard(context.wampa);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(4);

                    // Play Baylan — only base-damaged condition is met
                    context.player2.passAction();
                    context.player1.clickCard(context.baylanSkoll);

                    // Advantage prompt — no exhaust prompt since no upgrade was defeated
                    expect(context.player1).toHavePrompt(advantagePromptTitle);
                    expect(context.player1).toBeAbleToSelectExactly([context.baylanSkoll, context.atst, context.wampa]);
                    context.player1.clickCard(context.wampa);
                    expect(context.wampa).toHaveExactUpgradeNames(['advantage']);

                    // No more prompts — it is now P2's action
                    expect(context.player2).toBeActivePlayer();
                });

                it('should prompt for optional exhaust but not give Advantage when only a friendly upgrade was defeated', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['baylan-skoll#fallen-jedi'],
                            groundArena: [{ card: 'wampa', upgrades: ['experience'] }]
                        },
                        player2: {
                            hasInitiative: true,
                            hand: ['confiscate'],
                            groundArena: ['atst']
                        }
                    });

                    const { context } = contextRef;

                    // P2 defeats the friendly Experience upgrade via Confiscate
                    context.player2.clickCard(context.confiscate);
                    context.player2.clickCard(context.experience);
                    expect(context.wampa).toHaveExactUpgradeNames([]);

                    // Play Baylan — only upgrade-defeated condition is met
                    context.player1.clickCard(context.baylanSkoll);

                    // No Advantage prompt; exhaust prompt with Pass appears since a friendly upgrade was defeated.
                    // Exhaust target accepts any unit (ready or exhausted)
                    expect(context.player1).toHavePrompt(exhaustPromptTitle);
                    expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                    expect(context.player1).toBeAbleToSelectExactly([context.baylanSkoll, context.wampa, context.atst]);
                    context.player1.clickCard(context.atst);

                    expect(context.atst.exhausted).toBeTrue();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should resolve with no prompts when neither condition is met', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['baylan-skoll#fallen-jedi'],
                            groundArena: ['wampa'],
                            resources: 10
                        },
                        player2: {
                            groundArena: ['atst']
                        }
                    });

                    const { context } = contextRef;

                    // Play Baylan — neither condition is met; no prior base damage, no upgrade defeated
                    context.player1.clickCard(context.baylanSkoll);

                    // No prompts from the ability; turn passes directly to player 2
                    expect(context.player2).toBeActivePlayer();
                    expect(context.baylanSkoll).toHaveExactUpgradeNames([]);
                    expect(context.atst.exhausted).toBeFalse();
                });

                it('should allow declining the optional exhaust when both conditions are met', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['baylan-skoll#fallen-jedi'],
                            groundArena: [{ card: 'wampa', upgrades: ['experience'] }]
                        },
                        player2: {
                            hand: ['confiscate'],
                            groundArena: ['atst']
                        }
                    });

                    const { context } = contextRef;

                    // Damage enemy base
                    context.player1.clickCard(context.wampa);
                    context.player1.clickCard(context.p2Base);

                    // Defeat the friendly Experience upgrade via Confiscate
                    context.player2.clickCard(context.confiscate);
                    context.player2.clickCard(context.experience);
                    expect(context.wampa).toHaveExactUpgradeNames([]);

                    // Play Baylan — both conditions are met
                    context.player1.clickCard(context.baylanSkoll);

                    // Advantage prompt — choose Wampa
                    expect(context.player1).toHavePrompt(advantagePromptTitle);
                    expect(context.player1).toBeAbleToSelectExactly([context.baylanSkoll, context.wampa, context.atst]);
                    context.player1.clickCard(context.wampa);

                    // Decline the optional exhaust
                    expect(context.player1).toHavePrompt(exhaustPromptTitle);
                    expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                    context.player1.clickPrompt('Choose nothing');

                    // Effects resolve after both prompts: Advantage attached, no unit exhausted by the ability
                    expect(context.wampa).toHaveExactUpgradeNames(['advantage']);
                    expect(context.atst.exhausted).toBeFalse();

                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('When Attack Ends trigger', function() {
                it('should give an Advantage token when Baylan attacks the enemy base directly', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['baylan-skoll#fallen-jedi']
                        },
                        player2: {
                            groundArena: ['wampa']
                        }
                    });

                    const { context } = contextRef;

                    // Baylan attacks the enemy base — base-damaged condition satisfied by this very attack
                    context.player1.clickCard(context.baylanSkoll);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(6);

                    // When Attack Ends fires — Advantage prompt; no exhaust prompt since no upgrade was defeated
                    expect(context.player1).toBeAbleToSelectExactly([context.baylanSkoll, context.wampa]);
                    context.player1.clickCard(context.baylanSkoll);
                    expect(context.baylanSkoll).toHaveExactUpgradeNames(['advantage']);

                    expect(context.player2).toBeActivePlayer();
                });

                it('should prompt for optional exhaust but not give Advantage when only an upgrade was defeated earlier and Baylan attacks a unit', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['baylan-skoll#fallen-jedi', { card: 'wampa', upgrades: ['experience'] }]
                        },
                        player2: {
                            // Alderaanian Envoys 3/7: Baylan deals 6 (not defeated), takes 3 back (Baylan survives with 3 HP)
                            hasInitiative: true,
                            hand: ['confiscate'],
                            groundArena: ['alderaanian-envoys']
                        }
                    });

                    const { context } = contextRef;

                    // Defeat the friendly Experience upgrade via Confiscate
                    context.player2.clickCard(context.confiscate);
                    context.player2.clickCard(context.experience);
                    expect(context.wampa).toHaveExactUpgradeNames([]);

                    // Baylan attacks Alderaanian Envoys — neither unit defeated, no base damage
                    context.player1.clickCard(context.baylanSkoll);
                    context.player1.clickCard(context.alderaanianEnvoys);
                    expect(context.alderaanianEnvoys.damage).toBe(6);
                    expect(context.baylanSkoll.damage).toBe(3);
                    expect(context.p2Base.damage).toBe(0);

                    // When Attack Ends fires — upgrade-defeated condition met, base-damaged is not.
                    // No Advantage prompt; exhaust target accepts any unit
                    expect(context.player1).toHavePrompt(exhaustPromptTitle);
                    expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                    expect(context.player1).toBeAbleToSelectExactly([context.baylanSkoll, context.wampa, context.alderaanianEnvoys]);
                    context.player1.clickCard(context.wampa);
                    expect(context.wampa.exhausted).toBeTrue();

                    expect(context.player2).toBeActivePlayer();
                });

                it('should resolve with no prompts when Baylan attacks a unit and neither condition is met', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['baylan-skoll#fallen-jedi', 'battlefield-marine']
                        },
                        player2: {
                            // Alderaanian Envoys 3/7 survives Baylan's 6 damage, so Overwhelm doesn't damage the base
                            groundArena: ['alderaanian-envoys']
                        }
                    });

                    const { context } = contextRef;

                    // Baylan attacks Alderaanian Envoys — neither defeated, no Overwhelm to base, no upgrade defeated
                    context.player1.clickCard(context.baylanSkoll);
                    context.player1.clickCard(context.alderaanianEnvoys);
                    expect(context.alderaanianEnvoys.damage).toBe(6);
                    expect(context.p2Base.damage).toBe(0);

                    // When Attack Ends fires with neither condition met — no prompts
                    expect(context.player2).toBeActivePlayer();
                    expect(context.baylanSkoll).toHaveExactUpgradeNames([]);
                    expect(context.battlefieldMarine.exhausted).toBeFalse();
                });
            });

            describe('target selection', function() {
                it('should allow giving Advantage to any unit (friendly or enemy, including leaders) when the base-damaged condition is met', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                            hand: ['baylan-skoll#fallen-jedi'],
                            groundArena: ['wampa'],
                            spaceArena: ['cartel-spacer']
                        },
                        player2: {
                            leader: { card: 'satine-kryze#standing-on-principles', deployed: true },
                            groundArena: ['atst'],
                            spaceArena: ['tieln-fighter']
                        }
                    });

                    const { context } = contextRef;

                    // Damage the enemy base with Wampa
                    context.player1.clickCard(context.wampa);
                    context.player1.clickCard(context.p2Base);

                    // Play Baylan
                    context.player2.passAction();
                    context.player1.clickCard(context.baylanSkoll);

                    // All units (friendly and enemy, both arenas, including leaders) are valid Advantage targets
                    expect(context.player1).toHavePrompt(advantagePromptTitle);
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.cadBane,
                        context.baylanSkoll,
                        context.wampa,
                        context.cartelSpacer,
                        context.satineKryze,
                        context.atst,
                        context.tielnFighter
                    ]);

                    // Place Advantage on the friendly leader unit
                    context.player1.clickCard(context.cadBane);
                    expect(context.cadBane).toHaveExactUpgradeNames(['advantage']);

                    expect(context.player2).toBeActivePlayer();
                });

                it('should NOT prompt for exhaust when a friendly upgrade was returned to hand (not defeated)', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['baylan-skoll#fallen-jedi'],
                            groundArena: [{ card: 'wampa', upgrades: ['entrenched'] }]
                        },
                        player2: {
                            hand: ['criminal-muscle'],
                            hasInitiative: true,
                            groundArena: ['atst']
                        }
                    });

                    const { context } = contextRef;

                    // P2 returns the friendly Entrenched upgrade to P1's hand (NOT defeated)
                    context.player2.clickCard(context.criminalMuscle);
                    context.player2.clickCard(context.entrenched);
                    expect(context.wampa).toHaveExactUpgradeNames([]);
                    expect(context.entrenched).toBeInZone('hand', context.player1);

                    // Play Baylan — neither condition is met (no base damage, no upgrade *defeated*)
                    context.player1.clickCard(context.baylanSkoll);

                    // No prompts — turn passes directly to P2
                    expect(context.player2).toBeActivePlayer();
                    expect(context.baylanSkoll).toHaveExactUpgradeNames([]);
                    expect(context.atst.exhausted).toBeFalse();
                });

                it('should count a Shield token defeat as a friendly upgrade defeated this phase', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['baylan-skoll#fallen-jedi'],
                            groundArena: [{ card: 'wampa', upgrades: ['shield'] }]
                        },
                        player2: {
                            groundArena: ['atst'],
                            hasInitiative: true
                        }
                    });

                    const { context } = contextRef;

                    // P2 attacks Wampa; the Shield token absorbs the damage and is defeated
                    context.player2.clickCard(context.atst);
                    context.player2.clickCard(context.wampa);
                    expect(context.wampa).toHaveExactUpgradeNames([]);
                    expect(context.wampa.damage).toBe(0);

                    // Play Baylan — enemy base not damaged, but a friendly Shield token (upgrade) was defeated
                    context.player1.clickCard(context.baylanSkoll);

                    // No Advantage prompt; exhaust prompt with Pass appears since a friendly upgrade (Shield) was defeated.
                    // Exhaust target accepts any unit (ready or exhausted)
                    expect(context.player1).toHavePrompt(exhaustPromptTitle);
                    expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                    expect(context.player1).toBeAbleToSelectExactly([context.baylanSkoll, context.wampa, context.atst]);
                    context.player1.clickCard(context.wampa);
                    expect(context.wampa.exhausted).toBeTrue();

                    expect(context.player2).toBeActivePlayer();
                });
            });
        });
    });
});
