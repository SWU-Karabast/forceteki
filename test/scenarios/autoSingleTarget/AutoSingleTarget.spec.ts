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
                    player1: { autoSingleTarget: true, hand: ['protector'], groundArena: ['wampa'] },
                    player2: {}
                });
                const { context } = contextRef;

                context.player1.clickCard(context.protector);

                expect(context.wampa).toHaveExactUpgradeNames(['protector']);
                expect(context.player2).toBeActivePlayer();
            });

            it('prompts for the unit when autoSingleTarget is off', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { autoSingleTarget: false, hand: ['protector'], groundArena: ['wampa'] },
                    player2: {}
                });
                const { context } = contextRef;

                context.player1.clickCard(context.protector);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['protector']);
            });
        });

        describe('when attacking with only one legal target', function() {
            it('auto-attacks the enemy base when autoSingleTarget is on', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { autoSingleTarget: true, groundArena: ['wampa'] },
                    player2: {}
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);

                // the only legal attack target is the enemy base, so it resolves with no prompt
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('prompts for the attack target when autoSingleTarget is off', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { autoSingleTarget: false, groundArena: ['wampa'] },
                    player2: {}
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
            });
        });

        // A single attack can auto-resolve more than one targeting step: the attack's own target
        // (forced to the lone Sentinel) and the attacker's On Attack ability target (the only enemy
        // ground unit). The defender has 0 base power (+1 from Protector) so Benthic survives and its
        // own When Defeated doesn't fire an extra prompt.
        describe('when an attack auto-resolves both the attack target and an On Attack ability', function() {
            it('auto-resolves both targets when autoSingleTarget is on', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { autoSingleTarget: true, groundArena: ['benthic-two-tubes#the-war-has-just-begun'] },
                    player2: { groundArena: [{ card: 'disaffected-senator', upgrades: ['protector'] }] }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.benthicTwoTubes);

                // 1 (On Attack) + 3 (Benthic combat power) = 4 damage, no prompts shown
                expect(context.disaffectedSenator.damage).toBe(4);
                expect(context.benthicTwoTubes).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('prompts for each target when autoSingleTarget is off', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { autoSingleTarget: false, groundArena: ['benthic-two-tubes#the-war-has-just-begun'] },
                    player2: { groundArena: [{ card: 'disaffected-senator', upgrades: ['protector'] }] }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.benthicTwoTubes);

                // Sentinel forces the attack target choice...
                expect(context.player1).toBeAbleToSelectExactly([context.disaffectedSenator]);
                context.player1.clickCard(context.disaffectedSenator);

                // ...then the On Attack ability requires its own target choice
                expect(context.player1).toBeAbleToSelectExactly([context.disaffectedSenator]);
                context.player1.clickCard(context.disaffectedSenator);

                expect(context.disaffectedSenator.damage).toBe(4);
            });
        });

        // Chained single-target auto-resolution within one play: Moral Authority attaches only to a
        // friendly unique unit (one valid target) and its When Played captures the only enemy non-leader
        // unit with less remaining HP (a second single target) — both resolve with no prompts.
        describe('when a played upgrade chains into a single-target When Played ability', function() {
            it('auto-attaches and auto-captures when autoSingleTarget is on', async function() {
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

        // Deploying a pilot leader as an upgrade: the player still chooses the deploy *mode*
        // (deploy as a unit vs. attach as a pilot), but once piloting is chosen the single eligible
        // Vehicle target auto-resolves. (Deploying as a unit has no target, so nothing to auto-resolve there.)
        describe('when deploying a pilot leader as an upgrade with one eligible vehicle', function() {
            const pilotAttachPrompt = 'Flip Poe Dameron and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it';

            it('keeps the deploy-mode choice but auto-resolves the vehicle when autoSingleTarget is on', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        autoSingleTarget: true,
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    },
                    player2: {}
                });
                const { context } = contextRef;

                // the deploy-mode menu still appears (deploy as unit vs. attach as pilot)
                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt(pilotAttachPrompt);

                // ...but the only eligible vehicle is chosen automatically
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['poe-dameron#i-can-fly-anything']);
                expect(context.player2).toBeActivePlayer();
            });

            it('prompts for the vehicle when autoSingleTarget is off', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        autoSingleTarget: false,
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    },
                    player2: {}
                });
                const { context } = contextRef;

                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt(pilotAttachPrompt);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['poe-dameron#i-can-fly-anything']);
            });
        });
    });
});
