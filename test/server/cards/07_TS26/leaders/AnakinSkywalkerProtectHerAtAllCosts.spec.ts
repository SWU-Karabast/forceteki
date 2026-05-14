describe('Anakin Skywalker, Protect Her At All Costs', function() {
    integration(function(contextRef) {
        describe('Undeployed leader-side action ability', function() {
            const shieldPrompt = 'Give a Shield token to a unit that entered play this phase';

            it('gives a Shield token when 2 units have entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#protect-her-at-all-costs',
                        resources: 4,
                        hand: ['lothwolf', 'restored-arc170'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Play Lothwolf
                context.player1.clickCard(context.lothwolf);
                context.player2.clickCard(context.consularSecurityForce);

                // Play Restored ARC-170
                context.player1.clickCard(context.restoredArc170);
                context.player2.passAction();

                // Use Anakin's leader ability
                context.player1.clickCard(context.anakinSkywalker);

                // Can only target friendly units that entered play this phase
                expect(context.player1).toHavePrompt(shieldPrompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.lothwolf,
                    context.restoredArc170
                ]);
                context.player1.clickCard(context.lothwolf);

                // Anakin is exhausted and Lothwolf has a Shield
                expect(context.anakinSkywalker.exhausted).toBeTrue();
                expect(context.lothwolf).toHaveExactUpgradeNames(['shield']);
                expect(context.restoredArc170).toHaveExactUpgradeNames([]);
            });

            it('gives a Shield token when a token unit is one of the 2 units that entered play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#protect-her-at-all-costs',
                        base: 'echo-base',
                        resources: 4,
                        hand: ['veteran-fleet-officer'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Play Veteran Fleet Officer, which creates an X-Wing token
                context.player1.clickCard(context.veteranFleetOfficer);
                context.player2.passAction();

                // Use Anakin's leader ability
                context.player1.clickCard(context.anakinSkywalker);

                // Can target Veteran Fleet Officer or the X-Wing token
                const xwing = context.player1.findCardByName('xwing');
                expect(context.player1).toHavePrompt(shieldPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.veteranFleetOfficer, xwing]);
                context.player1.clickCard(xwing);

                // Anakin is exhausted and X-Wing has a Shield
                expect(context.anakinSkywalker.exhausted).toBeTrue();
                expect(xwing).toHaveExactUpgradeNames(['shield']);
            });

            it('does not give a Shield token when only 1 unit has entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#protect-her-at-all-costs',
                        resources: 4,
                        hand: ['lothwolf'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Play one unit
                context.player1.clickCard(context.lothwolf);
                context.player2.passAction();

                // Use Anakin's leader ability - shows no effect since < 2 units entered play
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toHaveNoEffectAbilityPrompt(shieldPrompt);
                context.player1.clickPrompt('Use it anyway');

                // Anakin is exhausted but no Shield is given (condition not met)
                expect(context.anakinSkywalker.exhausted).toBeTrue();
                expect(context.lothwolf).toHaveExactUpgradeNames([]);
            });

            it('gives a Shield token when 2 units entered play even if one was defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#protect-her-at-all-costs',
                        resources: 4,
                        hand: ['lothwolf', 'restored-arc170'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Play two units
                context.player1.clickCard(context.lothwolf);
                context.player2.passAction();
                context.player1.clickCard(context.restoredArc170);

                // Opponent defeats Lothwolf
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.lothwolf);

                // Use Anakin's leader ability - 2 friendly units entered play this phase (even though one is defeated),
                // so the condition is met and the surviving unit can receive a Shield
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toHavePrompt(shieldPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.restoredArc170]);
                context.player1.clickCard(context.restoredArc170);

                expect(context.anakinSkywalker.exhausted).toBeTrue();
                expect(context.restoredArc170).toHaveExactUpgradeNames(['shield']);
            });

            it('has no effect when no units have entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#protect-her-at-all-costs',
                        resources: 4,
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Use Anakin's leader ability - shows no effect since no units entered play
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toHaveNoEffectAbilityPrompt(shieldPrompt);
                context.player1.clickPrompt('Use it anyway');

                // Anakin is exhausted but no Shield is given
                expect(context.anakinSkywalker.exhausted).toBeTrue();
            });

            it('counts a unit that entered play under friendly control even if it is now under enemy control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#protect-her-at-all-costs',
                        base: 'chopper-base',
                        resources: 4,
                        hand: ['galen-erso#destroying-his-creation', 'populist-advisor'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Play Galen Erso and give control to opponent
                context.player1.clickCard(context.galenErso);
                context.player1.clickPrompt('Trigger');
                context.player2.passAction();

                // Play Populist Advisor
                context.player1.clickCard(context.populistAdvisor);
                context.player2.passAction();

                // Use Anakin's leader ability - both units entered play under P1 control, so both count
                // toward the 2+ condition and both are valid Shield targets (even Galen, now under enemy control)
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toHavePrompt(shieldPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.populistAdvisor, context.galenErso]);
                context.player1.clickCard(context.galenErso);

                expect(context.anakinSkywalker.exhausted).toBeTrue();
                expect(context.galenErso).toHaveExactUpgradeNames(['shield']);
                expect(context.populistAdvisor).toHaveExactUpgradeNames([]);
            });

            it('does not count a unit that entered play under enemy control even if it is now under friendly control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#protect-her-at-all-costs',
                        resources: 4,
                        hand: ['populist-advisor'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        base: 'chopper-base',
                        hand: ['galen-erso#destroying-his-creation']
                    }
                });

                const { context } = contextRef;

                // Play Populist Advisor (1 unit entered under P1 control)
                context.player1.clickCard(context.populistAdvisor);

                // Opponent plays Galen Erso and gives control to P1
                // Galen entered play under P2 control, so does not count toward the 2+ condition
                context.player2.clickCard(context.galenErso);
                context.player2.clickPrompt('Trigger');

                // Use Anakin's leader ability - only 1 unit entered play under friendly control
                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toHaveNoEffectAbilityPrompt(shieldPrompt);
                context.player1.clickPrompt('Use it anyway');

                expect(context.anakinSkywalker.exhausted).toBeTrue();
                expect(context.populistAdvisor).toHaveExactUpgradeNames([]);
                expect(context.galenErso).toHaveExactUpgradeNames([]);
            });
        });

        describe('Deployed unit-side On Attack ability', function() {
            it('gives a Shield token to another friendly unit that entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#protect-her-at-all-costs',
                        resources: 5,
                        hand: ['lothwolf'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Play a unit
                context.player1.clickCard(context.lothwolf);
                context.player2.passAction();

                // Deploy Anakin
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Deploy Anakin Skywalker');
                context.player2.passAction();

                // Attack with Anakin
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.p2Base);

                // Can only target Lothwolf (not Battlefield Marine, not Anakin himself)
                expect(context.player1).toBeAbleToSelectExactly([context.lothwolf]);
                context.player1.clickCard(context.lothwolf);

                expect(context.lothwolf).toHaveExactUpgradeNames(['shield']);
            });

            it('gives a Shield token when a token unit entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#protect-her-at-all-costs', deployed: true },
                        base: 'echo-base',
                        hand: ['veteran-fleet-officer'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Play Veteran Fleet Officer, which creates an X-Wing token
                context.player1.clickCard(context.veteranFleetOfficer);
                context.player2.passAction();

                // Attack with Anakin
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.p2Base);

                // Can target Veteran Fleet Officer or the X-Wing token
                const xwing = context.player1.findCardByName('xwing');
                expect(context.player1).toBeAbleToSelectExactly([context.veteranFleetOfficer, xwing]);
                context.player1.clickCard(xwing);

                expect(xwing).toHaveExactUpgradeNames(['shield']);
            });

            it('is skipped when no other friendly units have entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#protect-her-at-all-costs', deployed: true },
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Attack with Anakin — ability is skipped, no prompt
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('is skipped when the only unit that entered play was defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#protect-her-at-all-costs', deployed: true },
                        hand: ['lothwolf'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Play a unit
                context.player1.clickCard(context.lothwolf);

                // Opponent defeats Lothwolf
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.lothwolf);

                // Attack with Anakin — Lothwolf is defeated, Battlefield Marine didn't enter this phase; no valid targets
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('gives a Shield to a surviving entered-play unit when another entered-play unit was defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#protect-her-at-all-costs', deployed: true },
                        hand: ['lothwolf', 'restored-arc170'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Play two friendly units this phase
                context.player1.clickCard(context.lothwolf);
                context.player2.passAction();
                context.player1.clickCard(context.restoredArc170);

                // Opponent defeats Lothwolf — it still counts as having entered play this phase
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.lothwolf);

                // Attack with Anakin - the surviving Restored ARC-170 (which entered play this phase) can receive a Shield
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.restoredArc170]);
                context.player1.clickCard(context.restoredArc170);

                expect(context.restoredArc170).toHaveExactUpgradeNames(['shield']);
            });

            it('cannot target a unit that entered play under friendly control but is now under enemy control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#protect-her-at-all-costs', deployed: true },
                        base: 'chopper-base',
                        hand: ['galen-erso#destroying-his-creation'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Play Galen Erso and give control to opponent
                context.player1.clickCard(context.galenErso);
                context.player1.clickPrompt('Trigger');
                context.player2.passAction();

                // Attack with Anakin — Galen is no longer friendly; no other friendly unit entered play, so ability has no valid targets
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.galenErso).toHaveExactUpgradeNames([]);
            });

            it('does not count a unit that entered play under enemy control even if it is now under friendly control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#protect-her-at-all-costs', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        base: 'chopper-base',
                        hand: ['galen-erso#destroying-his-creation']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // Opponent plays Galen Erso and gives control to P1
                // Galen entered play under P2 control, so does not count as having entered under friendly control
                context.player2.clickCard(context.galenErso);
                context.player2.clickPrompt('Trigger');

                // Attack with Anakin — no friendly unit entered play under P1 control this phase
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.galenErso).toHaveExactUpgradeNames([]);
            });
        });
    });
});
