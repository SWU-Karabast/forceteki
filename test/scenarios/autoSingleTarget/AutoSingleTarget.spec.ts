describe('autoSingleTarget: single-target scenarios', function() {
    integration(function(contextRef) {
        // When the opponent is the one choosing the target, autoSingleTarget must be keyed off the
        // *choosing* player's setting, not the ability controller's.
        describe('when the opponent chooses the only available target', function() {
            it('auto-resolves when the choosing opponent has autoSingleTarget on, even if the controller has it off', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        autoSingleTarget: false,
                        hand: ['power-of-the-dark-side']
                    },
                    player2: {
                        autoSingleTarget: true,
                        groundArena: ['fleet-lieutenant']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.powerOfTheDarkSide);

                // opponent's single unit is defeated automatically with no selection prompt
                expect(context.fleetLieutenant).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('still prompts when the choosing opponent has autoSingleTarget off, even if the controller has it on', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        autoSingleTarget: true,
                        hand: ['power-of-the-dark-side']
                    },
                    player2: {
                        autoSingleTarget: false,
                        groundArena: ['fleet-lieutenant']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.powerOfTheDarkSide);

                // opponent must still be prompted to choose their single unit
                expect(context.fleetLieutenant).toBeInZone('groundArena');
                expect(context.player2).toBeAbleToSelectExactly([context.fleetLieutenant]);

                context.player2.clickCard(context.fleetLieutenant);
                expect(context.fleetLieutenant).toBeInZone('discard');
            });
        });

        describe('when playing an upgrade with a single valid target', function() {
            it('auto-attaches to the only unit when autoSingleTarget is on', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { autoSingleTarget: true, hand: ['protector'], groundArena: ['wampa'] }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.protector);

                expect(context.wampa).toHaveExactUpgradeNames(['protector']);
                expect(context.player2).toBeActivePlayer();
            });

            it('prompts for the unit when autoSingleTarget is off', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { autoSingleTarget: false, hand: ['protector'], groundArena: ['wampa'] }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.protector);

                expect(context.player1).toHavePrompt('Attach Protector to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['protector']);
            });
        });

        describe('when attacking with only one legal target', function() {
            it('auto-attacks the enemy base when autoSingleTarget is on', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { autoSingleTarget: true, groundArena: ['wampa'] }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);

                // the only legal attack target is the enemy base, so it resolves with no prompt
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('auto-attacks a lone sentinel when autoSingleTarget is on', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { autoSingleTarget: true, groundArena: ['wampa'] },
                    player2: { groundArena: ['niima-outpost-constables'] }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);

                // the only legal attack target is the lone sentinel, so it resolves with no prompt
                expect(context.niimaOutpostConstables.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('prompts for the attack target when autoSingleTarget is off', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { autoSingleTarget: false, groundArena: ['wampa'] }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
            });
        });

        describe('when an attack auto-resolves both the attack target and an On Attack ability', function() {
            it('auto-resolves both targets when autoSingleTarget is on', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        autoSingleTarget: true,
                        groundArena: [{ card: 'benthic-two-tubes#the-war-has-just-begun', upgrades: ['shield'] }]
                    },
                    player2: { groundArena: ['niima-outpost-constables'] }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.benthicTwoTubes);

                // 1 (On Attack ping) + 3 (Benthic power) = 4 damage, no prompts shown
                expect(context.niimaOutpostConstables.damage).toBe(4);
                expect(context.benthicTwoTubes).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('prompts for each target when autoSingleTarget is off', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        autoSingleTarget: false,
                        groundArena: [{ card: 'benthic-two-tubes#the-war-has-just-begun', upgrades: ['shield'] }]
                    },
                    player2: { groundArena: ['niima-outpost-constables'] }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.benthicTwoTubes);

                // Sentinel forces the attack target choice...
                expect(context.player1).toBeAbleToSelectExactly([context.niimaOutpostConstables]);
                context.player1.clickCard(context.niimaOutpostConstables);

                // ...then the On Attack ability requires its own target choice
                expect(context.player1).toBeAbleToSelectExactly([context.niimaOutpostConstables]);
                context.player1.clickCard(context.niimaOutpostConstables);

                expect(context.niimaOutpostConstables.damage).toBe(4);
            });
        });

        describe('when a played upgrade chains into a single-target When Played ability', function() {
            it('auto-attaches and auto-resolves triggered ability when autoSingleTarget is on', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        autoSingleTarget: true,
                        hand: ['moral-authority'],
                        groundArena: ['the-armorer#survival-is-strength']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moralAuthority);

                expect(context.theArmorer).toHaveExactUpgradeNames(['moral-authority']);
                expect(context.battlefieldMarine).toBeCapturedBy(context.theArmorer);
                expect(context.player2).toBeActivePlayer();
            });

            it('prompts for each target when autoSingleTarget is off', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        autoSingleTarget: false,
                        hand: ['moral-authority'],
                        groundArena: ['the-armorer#survival-is-strength']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moralAuthority);

                // choose the unit to attach to (only the friendly unique unit is eligible)
                expect(context.player1).toBeAbleToSelectExactly([context.theArmorer]);
                context.player1.clickCard(context.theArmorer);

                // then the When Played capture requires its own target choice
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeCapturedBy(context.theArmorer);
            });
        });

        describe('when an action ability plays a unit from the hidden hand zone', function() {
            describe('when the ability has no cost, so playing the unit is mandatory', function() {
                it('auto-plays the only Underworld unit when autoSingleTarget is on', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            autoSingleTarget: true,
                            leader: { card: 'jabba-the-hutt#crime-boss', deployed: true },
                            hand: ['nihil-marauder']
                        }
                    });
                    const { context } = contextRef;

                    context.player1.clickCard(context.jabbaTheHutt);
                    context.player1.clickPrompt('Play an Underworld unit unit from your hand');

                    // the play is mandatory, so the single Underworld unit is auto-played with no target prompt
                    expect(context.nihilMarauder).toBeInZone('groundArena', context.player1);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when the ability has an exhaust cost, so playing the unit is optional', function() {
                const hanSoloAbilityTitle = 'Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it.';
                const playBattlefieldMarineButton = `${hanSoloAbilityTitle} -> Battlefield Marine`;

                it('offers a play-or-pass choice instead of auto-playing the only unit when autoSingleTarget is on', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            autoSingleTarget: true,
                            leader: 'han-solo#worth-the-risk',
                            hand: ['battlefield-marine'],
                            resources: 6
                        }
                    });
                    const { context } = contextRef;

                    context.player1.clickCard(context.hanSolo);
                    context.player1.clickPrompt(hanSoloAbilityTitle);

                    // the single unit is NOT auto-played; the player is prompted to play it or pass
                    expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
                    expect(context.player1).toHaveExactPromptButtons([
                        playBattlefieldMarineButton,
                        'Pass'
                    ]);

                    context.player1.clickPrompt(playBattlefieldMarineButton);
                    expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                    expect(context.battlefieldMarine.damage).toBe(2);
                    expect(context.hanSolo.exhausted).toBeTrue();
                    expect(context.player2).toBeActivePlayer();
                });

                it('lets the player pass on the only unit, leaving it in hand with the leader still exhausted', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            autoSingleTarget: true,
                            leader: 'han-solo#worth-the-risk',
                            hand: ['battlefield-marine'],
                            resources: 6
                        }
                    });
                    const { context } = contextRef;

                    context.player1.clickCard(context.hanSolo);
                    context.player1.clickPrompt(hanSoloAbilityTitle);

                    // passing resolves in a single click (the Pass handler finalizes the resolution with no target)
                    context.player1.clickPrompt('Pass');

                    // the unit stays in hand, but the exhaust-self cost was still paid, so the action was legal
                    expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
                    expect(context.hanSolo.exhausted).toBeTrue();
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });

        describe('when deploying a pilot leader as an upgrade with one eligible vehicle', function() {
            const pilotDeployPrompt = 'Deploy Kazuda Xiono as a Pilot';

            it('keeps the deploy-mode choice but auto-resolves the vehicle when autoSingleTarget is on', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        autoSingleTarget: true,
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    }
                });
                const { context } = contextRef;

                // the modal deploy menu still appears (deploy as a unit vs. as a pilot)
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt(pilotDeployPrompt);

                // ...but the only eligible vehicle is chosen automatically
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['kazuda-xiono#best-pilot-in-the-galaxy']);
                expect(context.player2).toBeActivePlayer();
            });

            it('prompts for the vehicle when autoSingleTarget is off', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        autoSingleTarget: false,
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt(pilotDeployPrompt);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['kazuda-xiono#best-pilot-in-the-galaxy']);
            });
        });
    });
});
