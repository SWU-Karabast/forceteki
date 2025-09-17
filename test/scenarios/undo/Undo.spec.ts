
describe('Undo', function() {
    undoIntegration(function(contextRef) {
        describe('Death Trooper\'s When Played ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['death-trooper'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            undoIt('can only target ground units & can damage itself', function () {
                const { context } = contextRef;

                // Play Death Trooper
                context.player1.clickCard(context.deathTrooper);

                // Choose Friendly
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.deathTrooper]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.deathTrooper);

                // Choose Enemy
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.superlaserTechnician]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
            });

            undoIt('works when no enemy ground units', function () {
                const { context } = contextRef;

                // Play Death Trooper
                context.player2.setGroundArenaUnits([]);
                context.player1.clickCard(context.deathTrooper);

                // Choose Friendly
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.deathTrooper]);
                expect(context.player1).not.toHavePassAbilityPrompt('Deal 2 damage to a friendly ground unit and an enemy ground unit');
                context.player1.clickCard(context.deathTrooper);
                expect(context.deathTrooper.damage).toEqual(2);
            });
        });

        describe('2-1B Surgical Droid\'s ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: '21b-surgical-droid' },
                            { card: 'r2d2#ignoring-protocol', damage: 3 },
                            { card: 'c3po#protocol-droid', damage: 1 }],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 2 }]
                    }
                });
            });

            undoIt('should heal a target with 1 damage to full', function () {
                const { context } = contextRef;

                // Attack
                context.player1.clickCard(context._21bSurgicalDroid);
                expect(context._21bSurgicalDroid).toBeInZone('groundArena');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);
                context.player1.clickCard(context.p2Base);

                // Healing Target
                expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.c3po, context.wampa]);
                context.player1.clickCard(context.c3po);

                // Confirm Results
                expect(context._21bSurgicalDroid.exhausted).toBe(true);
                expect(context.c3po.damage).toBe(0);
            });

            undoIt('should heal 2 damage from a unit', function () {
                const { context } = contextRef;

                // Attack
                context.player1.clickCard(context._21bSurgicalDroid);
                expect(context._21bSurgicalDroid).toBeInZone('groundArena');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);
                context.player1.clickCard(context.p2Base);

                // Healing Target
                expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.c3po, context.wampa]);
                context.player1.clickCard(context.r2d2);

                // Confirm Results
                expect(context._21bSurgicalDroid.exhausted).toBe(true);
                expect(context.r2d2.damage).toBe(1);
            });

            undoIt('should be able to heal an enemy unit', function () {
                const { context } = contextRef;

                // Attack
                context.player1.clickCard(context._21bSurgicalDroid);
                expect(context.wampa.damage).toBe(2);
                expect(context._21bSurgicalDroid).toBeInZone('groundArena');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);
                context.player1.clickCard(context.p2Base);

                // Healing Target
                expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.c3po, context.wampa]);
                context.player1.clickCard(context.wampa);

                // Confirm Results
                expect(context._21bSurgicalDroid.exhausted).toBe(true);
                expect(context.wampa.damage).toBe(0);
            });

            undoIt('should be able to be passed', function () {
                const { context } = contextRef;

                expect(context.r2d2.damage).toBe(3);
                context.player1.clickCard(context._21bSurgicalDroid);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Pass');
                expect(context._21bSurgicalDroid.exhausted).toBe(true);
                expect(context.r2d2.damage).toBe(3);
            });
        });

        describe('Snoke\'s constant ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['supreme-leader-snoke#shadow-ruler'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        hand: ['death-star-stormtrooper'],
                        groundArena: ['wampa', 'specforce-soldier'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'jyn-erso#resisting-oppression', deployed: true }
                    }
                });
            });

            it('should give -2/-2 to all enemy non-leader units', function () {
                const { context } = contextRef;

                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                context.player1.clickCard(context.supremeLeaderSnoke);

                // Allied BM should not be affected.
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                expect(context.wampa.getPower()).toBe(2);
                expect(context.wampa.getHp()).toBe(3);

                expect(context.cartelSpacer.getPower()).toBe(0);
                expect(context.cartelSpacer.getHp()).toBe(1);

                expect(context.specforceSoldier).toBeInZone('discard');

                // Leader Unit, should be unaffected.
                expect(context.jynErso.getPower()).toBe(4);
                expect(context.jynErso.getHp()).toBe(7);

                context.player2.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper).toBeInZone('discard');

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'manual',
                    playerId: context.player1Object.id,
                    snapshotId
                });

                expect(context.cartelSpacer.getPower()).toBe(2);
                expect(context.cartelSpacer.getHp()).toBe(3);

                expect(context.specforceSoldier).toBeInZone('groundArena');
                expect(context.specforceSoldier.getPower()).toBe(2);
                expect(context.specforceSoldier.getHp()).toBe(2);

                expect(context.deathStarStormtrooper).toBeInZone('hand');

                // Leader Unit, should be unaffected.
                expect(context.jynErso.getPower()).toBe(4);
                expect(context.jynErso.getHp()).toBe(7);
            });
        });

        describe('Wolffe\'s ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wolffe#suspicious-veteran'],
                        groundArena: ['admiral-ackbar#brilliant-strategist'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        hand: ['smugglers-aid'],
                        groundArena: ['yoda#old-master'],
                        base: { card: 'capital-city', damage: 5 }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            // PARTIAL TEST: We cannot move to the next phase yet so this is only a partial test.
            it('should cancel heal on bases', function () {
                const { context } = contextRef;

                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                // play wolffe, bases can't be healed for the phase
                context.player1.clickCard(context.wolffe);
                expect(context.player2).toBeActivePlayer();

                // nothing happen from this event
                context.player2.clickCard(context.smugglersAid);
                expect(context.p2Base.damage).toBe(5);

                // noting happen from restore on our base
                context.player1.clickCard(context.admiralAckbar);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(5);

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'manual',
                    playerId: context.player1Object.id,
                    snapshotId
                });

                // noting happen from restore on our base
                context.player1.clickCard(context.admiralAckbar);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(4);

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'manual',
                    playerId: context.player1Object.id,
                    snapshotId
                });

                context.player1.passAction();

                // nothing happen from this event
                context.player2.clickCard(context.smugglersAid);
                expect(context.p2Base.damage).toBe(2);

                // ISSUE: Unable to move to next action phase.
                // reset();
                // context.moveToNextActionPhase();

                // // effect stop at the end of phase, if opponent attack before wolffe, he can heal
                // context.player1.passAction();
                // context.player2.clickCard(context.yoda);
                // context.player2.clickCard(context.p1Base);
                // expect(context.p2Base.damage).toBe(3);

                // // attack with wolffe, bases can't be healed for this phase
                // context.player1.clickCard(context.wolffe);
                // context.player1.clickCard(context.p2Base);

                // // saboteur give him a prompt too
                // context.player1.clickPrompt('Bases can\'t be healed');

                // reset();
                // context.player2.passAction();

                // // nothing happen from restore
                // context.player1.clickCard(context.admiralAckbar);
                // context.player1.clickCard(context.p2Base);
                // expect(context.p1Base.damage).toBe(5);
            });
        });


        describe('Pyrrhic Assault\'s ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['pyrrhic-assault'],
                        groundArena: ['ryloth-militia'],
                        spaceArena: ['republic-arc170']
                    },
                    player2: {
                        groundArena: ['b2-legionnaires'],
                        spaceArena: ['gladiator-star-destroyer']
                    }
                });
            });

            // PARTIAL TEST: We cannot move to the next phase yet so this is only a partial test.
            it('should give each friendly unit, "When Defeated: Deal 2 damage to an enemy unit."', function () {
                const { context } = contextRef;

                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                context.player1.clickCard(context.pyrrhicAssault);
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.gladiatorStarDestroyer);
                context.player2.clickCard(context.republicArc170);
                expect(context.player1).toHavePrompt('Deal 2 damage to an enemy unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.b2Legionnaires, context.gladiatorStarDestroyer]);
                expect(context.republicArc170).toBeInZone('discard');

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'manual',
                    playerId: context.player1Object.id,
                    snapshotId
                });

                context.player1.passAction();

                context.player2.clickCard(context.gladiatorStarDestroyer);
                context.player2.clickCard(context.republicArc170);
                expect(context.player1).not.toHavePrompt('Deal 2 damage to an enemy unit.');
                expect(context.republicArc170).toBeInZone('discard');

                // context.player1.clickCard(context.b2Legionnaires);
                // expect(context.b2Legionnaires.damage).toBe(2);

                // context.player1.clickCard(context.rylothMilitia);
                // context.player1.clickCard(context.b2Legionnaires);
                // expect(context.player1).toHavePrompt('Deal 2 damage to an enemy unit.');
                // expect(context.player1).toBeAbleToSelectExactly([context.gladiatorStarDestroyer]);
                // expect(context.rylothMilitia).toBeInZone('discard');

                // // Expect the Gladiator Star Destroyer to have a total of 5 damage, 3 from attack and 2 from the trigger
                // context.player1.clickCard(context.gladiatorStarDestroyer);
                // expect(context.gladiatorStarDestroyer.damage).toBe(5);
            });
        });

        describe('Huyang\'s ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['huyang#enduring-instructor'],
                        groundArena: ['wampa', 'death-star-stormtrooper']
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });
            });

            it('gives another friendly unit +2/+2 until he leaves play', function () {
                const { context } = contextRef;
                rollback(contextRef, function leavesPlay() {
                    context.player1.clickCard(context.huyang);
                    expect(context.player1).toBeAbleToSelect(context.wampa);
                    context.player1.clickCard(context.wampa);

                    expect(context.wampa.getPower()).toBe(6);
                    expect(context.wampa.getHp()).toBe(7);
                    expect(context.huyang.getPower()).toBe(2);
                    expect(context.huyang.getHp()).toBe(4);

                    // Defeat Huyang, effect goes away
                    context.player2.clickCard(context.atst);
                    context.player2.clickCard(context.huyang);

                    expect(context.wampa.getPower()).toBe(4);
                    expect(context.wampa.getHp()).toBe(5);
                }, function checkForLingeringEffects() {
                    // Verify that Wampa is at printed stats
                    expect(context.wampa.getPower()).toBe(4);
                    expect(context.wampa.getHp()).toBe(5);

                    // Pick a card other than Wampa
                    context.player1.clickCard(context.huyang);
                    expect(context.player1).toBeAbleToSelect(context.deathStarStormtrooper);
                    context.player1.clickCard(context.deathStarStormtrooper);

                    // Defeat Huyang, effect goes away
                    context.player2.clickCard(context.atst);
                    context.player2.clickCard(context.huyang);

                    // Ensure that Wampa still remains at same power. Testing that there aren't lingering effects from previous rollback that target this card.
                    expect(context.wampa.getPower()).toBe(4);
                    expect(context.wampa.getHp()).toBe(5);
                });
            });

            it('should rollback properly if Huyang remains in play', function () {
                const { context } = contextRef;
                rollback(contextRef, function() {
                    expect(context.wampa.getPower()).toBe(4);
                    expect(context.wampa.getHp()).toBe(5);

                    context.player1.clickCard(context.huyang);
                    expect(context.player1).toBeAbleToSelect(context.wampa);
                    context.player1.clickCard(context.wampa);

                    expect(context.wampa.getPower()).toBe(6);
                    expect(context.wampa.getHp()).toBe(7);
                    expect(context.huyang.getPower()).toBe(2);
                    expect(context.huyang.getHp()).toBe(4);

                    // Defeat Huyang, effect goes away
                    context.player2.clickCard(context.atst);
                    context.player2.clickCard(context.huyang);
                });
            });
        });

        describe('DJ\'s when played ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['strafing-gunship'],
                        // 10 resources total
                        resources: [
                            'dj#blatant-thief', 'atst', 'atst', 'atst', 'atst',
                            'atst', 'atst', 'atst', 'atst', 'atst'
                        ]
                    },
                    player2: {
                        groundArena: ['atat-suppressor'],
                        resources: 10
                    }
                });
            });

            it('should take control of a resource until he leaves play, taking a ready resource if available', function () {
                const { context } = contextRef;

                rollback(contextRef, function leavesPlay() {
                    context.player1.clickCard(context.djBlatantThief);

                    expect(context.player1.resources.length).toBe(11);
                    expect(context.player2.resources.length).toBe(9);
                    expect(context.player1.readyResourceCount).toBe(4);
                    expect(context.player1.exhaustedResourceCount).toBe(7);
                    expect(context.player2.readyResourceCount).toBe(9);
                    expect(context.player2.exhaustedResourceCount).toBe(0);

                    // check that stolen resource maintained its ready state
                    const stolenResourceList = context.player1.resources.filter((resource) => resource.owner === context.player2Object);
                    expect(stolenResourceList.length).toBe(1);
                    const stolenResource = stolenResourceList[0];
                    expect(stolenResource.exhausted).toBeFalse();

                    // confirm that player1 can spend with it
                    context.player2.passAction();
                    expect(context.player1.readyResourceCount).toBe(4);
                    context.player1.clickCard(context.strafingGunship);
                    expect(context.strafingGunship).toBeInZone('spaceArena');
                    expect(context.player1.exhaustedResourceCount).toBe(11);
                    expect(stolenResource.exhausted).toBeTrue();

                    // DJ is defeated, resource goes back to owner's resource zone and stays exhausted
                    context.player2.clickCard(context.atatSuppressor);
                    context.player2.clickCard(context.dj);

                    expect(context.player1.resources.length).toBe(10);
                    expect(context.player2.resources.length).toBe(10);
                    expect(context.player2.exhaustedResourceCount).toBe(1);
                    expect(context.player2.readyResourceCount).toBe(9);
                    expect(context.player1.exhaustedResourceCount).toBe(10);
                    expect(context.player1.readyResourceCount).toBe(0);

                    expect(stolenResource.controller).toBe(context.player2Object);
                    expect(stolenResource.exhausted).toBeTrue();
                });
            });

            // PARTIAL TEST: We cannot move to the next phase yet so this is only a partial test.
            it('should take control of a resource until he leaves play, taking an exhausted resource if required', function () {
                const { context } = contextRef;

                rollback(contextRef, () => {
                    context.player2.exhaustResources(10);

                    context.player1.clickCard(context.djBlatantThief);

                    expect(context.player1.resources.length).toBe(11);
                    expect(context.player2.resources.length).toBe(9);
                    expect(context.player1.readyResourceCount).toBe(3);
                    expect(context.player1.exhaustedResourceCount).toBe(8);
                    expect(context.player2.readyResourceCount).toBe(0);
                    expect(context.player2.exhaustedResourceCount).toBe(9);

                    // check that stolen resource maintained its ready state
                    const stolenResourceList = context.player1.resources.filter((resource) => resource.owner === context.player2Object);
                    expect(stolenResourceList.length).toBe(1);
                    const stolenResource = stolenResourceList[0];
                    expect(stolenResource.exhausted).toBeTrue();

                    // ISSUE: Unable to move to next action phase.
                    // // move to next action phase so that resources are all readied
                    // context.moveToNextActionPhase();

                    // // DJ is defeated, resource goes back to owner's resource zone and stays ready
                    // context.player1.passAction();
                    // context.player2.clickCard(context.atatSuppressor);
                    // context.player2.clickCard(context.dj);

                    // expect(context.player1.resources.length).toBe(10);
                    // expect(context.player2.resources.length).toBe(10);
                    // expect(context.player2.exhaustedResourceCount).toBe(0);
                    // expect(context.player2.readyResourceCount).toBe(10);
                    // expect(context.player1.exhaustedResourceCount).toBe(0);
                    // expect(context.player1.readyResourceCount).toBe(10);

                    // expect(stolenResource.controller).toBe(context.player2Object);
                    // expect(stolenResource.exhausted).toBeFalse();
                });
            });

            it('should rollback properly if DJ remains in play', function () {
                const { context } = contextRef;

                rollback(contextRef, function() {
                    expect(context.player1.resources.length).toBe(10);
                    expect(context.player2.resources.length).toBe(10);

                    context.player1.clickCard(context.djBlatantThief);

                    expect(context.player1.resources.length).toBe(11);
                    expect(context.player2.resources.length).toBe(9);
                    expect(context.player1.readyResourceCount).toBe(4);
                    expect(context.player1.exhaustedResourceCount).toBe(7);
                    expect(context.player2.readyResourceCount).toBe(9);
                    expect(context.player2.exhaustedResourceCount).toBe(0);

                    // check that stolen resource maintained its ready state
                    const stolenResourceList = context.player1.resources.filter((resource) => resource.owner === context.player2Object);
                    expect(stolenResourceList.length).toBe(1);
                    const stolenResource = stolenResourceList[0];
                    expect(stolenResource.exhausted).toBeFalse();

                    // confirm that player1 can spend with it
                    context.player2.passAction();
                    expect(context.player1.readyResourceCount).toBe(4);
                    context.player1.clickCard(context.strafingGunship);
                    expect(context.strafingGunship).toBeInZone('spaceArena');
                    expect(context.player1.exhaustedResourceCount).toBe(11);
                    expect(stolenResource.exhausted).toBeTrue();
                });
            });
        });

        describe('War Juggernaut\'s constant ability', function() {
            it('should get +1/0 for each damaged unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'war-juggernaut', damage: 4 }, 'pyke-sentinel'],
                        spaceArena: [{ card: 'inferno-four#unforgetting', damage: 2 }]
                    },
                    player2: {
                        groundArena: ['first-legion-snowtrooper', { card: 'maul#shadow-collective-visionary', damage: 3 }],
                        spaceArena: [{ card: 'imperial-interceptor', damage: 1 }, 'ruthless-raider']
                    }
                });

                const { context } = contextRef;

                rollback(contextRef, () => {
                    // War Juggernaut should have 7 power (3 from card and 4 from damaged units)
                    expect(context.warJuggernaut.getPower()).toBe(7);

                    context.player1.clickCard(context.pykeSentinel);
                    context.player1.clickCard(context.firstLegionSnowtrooper);

                    // War Juggernaut should have 9 power (3 from card and 6 from damaged units)
                    expect(context.warJuggernaut.getPower()).toBe(9);
                });
            });

            it('should not get +1/0 because there are no damaged units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['war-juggernaut', 'pyke-sentinel'],
                        spaceArena: ['inferno-four#unforgetting']
                    },
                    player2: {
                        groundArena: ['first-legion-snowtrooper', 'maul#shadow-collective-visionary'],
                        spaceArena: ['imperial-interceptor', 'ruthless-raider']
                    }
                });

                const { context } = contextRef;

                rollback(contextRef, () => {
                    // War Juggernaut should have 3 power (3 from card and 0 from damaged units)
                    expect(context.warJuggernaut.getPower()).toBe(3);

                    context.player1.clickCard(context.pykeSentinel);
                    context.player1.clickCard(context.firstLegionSnowtrooper);

                    // War Juggernaut should have 5 power (3 from card and 2 from damaged units)
                    expect(context.warJuggernaut.getPower()).toBe(5);
                });
            });
        });


        describe('Echo, Valiant Arc Trooper\'s constant Coordinate ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['echo#valiant-arc-trooper'],
                        spaceArena: ['wing-leader'],
                        hand: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['hylobon-enforcer'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should be able to rollback from active to inactive', function () {
                const { context } = contextRef;

                rollback(contextRef, () => {
                    expect(context.echo.getPower()).toBe(2);
                    expect(context.echo.getHp()).toBe(2);

                    context.player1.clickCard(context.battlefieldMarine);
                    expect(context.echo.getPower()).toBe(4);
                    expect(context.echo.getHp()).toBe(4);
                });
            });

            it('should be able to rollback from inactive to active', function () {
                const { context } = contextRef;
                expect(context.echo.getPower()).toBe(2);
                expect(context.echo.getHp()).toBe(2);
                context.player1.clickCard(context.battlefieldMarine);

                // Rollback from inactive to active.
                rollback(contextRef, () => {
                    expect(context.echo.getPower()).toBe(4);
                    expect(context.echo.getHp()).toBe(4);

                    context.player2.clickCard(context.cartelSpacer);
                    context.player2.clickCard(context.wingLeader);
                    expect(context.echo.getPower()).toBe(2);
                    expect(context.echo.getHp()).toBe(2);
                });
            });
        });

        describe('Punch It\'s ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['punch-it'],
                        groundArena: ['liberated-slaves', 'escort-skiff'],
                        spaceArena: ['millennium-falcon#piece-of-junk']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'guerilla-attack-pod'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should attack with a space Vehicle unit giving it +2/0 for the attack', function () {
                const { context } = contextRef;

                rollback(contextRef, () => {
                    context.player1.clickCard(context.punchIt);

                    expect(context.player1).toBeAbleToSelectExactly([context.escortSkiff, context.millenniumFalconPieceOfJunk]);

                    context.player1.clickCard(context.millenniumFalconPieceOfJunk);

                    expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.p2Base]);

                    context.player1.clickCard(context.p2Base);

                    // 3 damage from Millennium Falcon + 2 from Punch It
                    expect(context.p2Base.damage).toBe(5);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            it('should attack with a ground Vehicle unit giving it +2/0 for the attack', function () {
                const { context } = contextRef;

                rollback(contextRef, () => {
                    context.player1.clickCard(context.punchIt);

                    expect(context.player1).toBeAbleToSelectExactly([context.escortSkiff, context.millenniumFalconPieceOfJunk]);

                    context.player1.clickCard(context.escortSkiff);

                    expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.guerillaAttackPod, context.p2Base]);

                    context.player1.clickCard(context.p2Base);

                    // 4 damage from Escort Skiff + 2 from Punch It
                    expect(context.p2Base.damage).toBe(6);
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });

        describe('Tactical Advantage\'s ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tactical-advantage'],
                        groundArena: ['pyke-sentinel']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('can buff a unit', function () {
                const { context } = contextRef;

                rollback(contextRef, () => {
                    expect(context.pykeSentinel.getPower()).toBe(2);
                    expect(context.pykeSentinel.getHp()).toBe(3);
                    context.player1.clickCard(context.tacticalAdvantage);
                    expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa]);
                    expect(context.player1).toHaveEnabledPromptButton('Cancel');

                    context.player1.clickCard(context.pykeSentinel);
                    expect(context.pykeSentinel.getPower()).toBe(4);
                    expect(context.pykeSentinel.getHp()).toBe(5);

                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.pykeSentinel);
                    expect(context.wampa.damage).toBe(4);
                    expect(context.pykeSentinel.damage).toBe(4);
                    expect(context.pykeSentinel).toBeInZone('groundArena');
                });
            });
        });

        describe('Bendu\'s on-attack ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'cloud-city-wing-guard',
                            'echo-base-defender',
                            'emperors-royal-guard',
                            'wilderness-fighter',
                            'consortium-starviper',
                            'homestead-militia',
                            'vanquish',
                            'hwk290-freighter',
                            'wroshyr-tree-tender'
                        ],
                        groundArena: ['bendu#the-one-in-the-middle'],
                        leader: 'luke-skywalker#faithful-friend',
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine']
                    }
                });
            });

            // PARTIAL TEST: We cannot move to the next phase yet so this is only a partial test.
            it('should decrease the cost of the next non-Heroism, non-Villainy played by the controller by 2', function () {
                const { context } = contextRef;

                const resetState = () => {
                    context.player1.readyResources(10);
                    context.player2.passAction();
                };

                const benduAttack = () => {
                    context.player1.clickCard(context.bendu);
                    context.player1.clickCard(context.wampa);
                    context.setDamage(context.wampa, 0);
                    context.setDamage(context.bendu, 0);
                    context.readyCard(context.bendu);
                    context.player2.passAction();
                };

                // CASE 1: play non-Heroism, non-Villainy (NHNV) card before Bendu attacks - no discount
                context.player1.clickCard(context.cloudCityWingGuard);
                expect(context.cloudCityWingGuard).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);

                resetState();

                // Bendu attacks to active discount
                benduAttack();

                // CASE 2: Heroism card played after Bendu attacks - no discount
                context.player1.clickCard(context.echoBaseDefender);
                expect(context.echoBaseDefender).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);

                resetState();

                // CASE 3: Villainy card played after Bendu attacks - no discount
                context.player1.clickCard(context.emperorsRoyalGuard);
                expect(context.emperorsRoyalGuard).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(5);  // 5 because of Villainy penalty

                resetState();

                // CASE 4: first NHNV card played after Bendu attacks - discount applied
                context.player1.clickCard(context.wildernessFighter);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.wildernessFighter).toBeInZone('groundArena');

                resetState();

                // CASE 5: second NHNV card played after Bendu attacks - no discount
                context.player1.clickCard(context.consortiumStarviper);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.consortiumStarviper).toBeInZone('spaceArena');

                resetState();

                // // Bendu attacks again, pass phase
                // benduAttack();
                // context.moveToNextActionPhase();

                // // CASE 6: NHNV card played after Bendu attacks in previous phase - no discount
                // context.player1.clickCard(context.homesteadMilitia);
                // expect(context.player1.exhaustedResourceCount).toBe(3);
                // expect(context.homesteadMilitia).toBeInZone('groundArena');

                // // Bendu attacks twice in a row to get double discount
                // resetState();
                // benduAttack();
                // benduAttack();

                // // CASE 7: next NHNV card played after two Bendu activations gets discount of 4
                // context.player1.clickCard(context.vanquish);
                // context.player1.clickCard(context.battlefieldMarine);
                // expect(context.player1.exhaustedResourceCount).toBe(1);

                // resetState();

                // // CASE 8: second NHNV card played after Bendu double attack - no discount
                // context.player1.clickCard(context.hwk290Freighter);
                // expect(context.player1.exhaustedResourceCount).toBe(3);
                // expect(context.hwk290Freighter).toBeInZone('spaceArena');

                // // Bendu defeated due to combat
                // resetState();
                // context.setDamage(context.bendu, 5);
                // context.player1.clickCard(context.bendu);
                // context.player1.clickCard(context.wampa);
                // context.player2.passAction();

                // // CASE 9: NHNV card played after Bendu defeated during attack - discount applied
                // context.player1.clickCard(context.wroshyrTreeTender);
                // expect(context.player1.exhaustedResourceCount).toBe(1);
                // expect(context.wroshyrTreeTender).toBeInZone('groundArena');
            });
        });

        describe('State Watchers', function() {
            describe('AttacksThisPhaseWatcher', function() {
                describe('Medal Ceremony\'s ability', function() {
                    beforeEach(function () {
                        return contextRef.setupTestAsync({
                            phase: 'action',
                            player1: {
                                hand: ['medal-ceremony'],
                                groundArena: ['battlefield-marine', 'frontier-atrt', 'specforce-soldier', 'regional-sympathizers'],
                                leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                            },
                            player2: {
                                groundArena: ['wampa', 'consular-security-force'],
                                spaceArena: ['alliance-xwing'],
                                hand: ['waylay']
                            },

                            // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                            autoSingleTarget: true
                        });
                    });

                    undoIt('should give an experience to any Rebel units that attacked this phase, up to 3', function () {
                        const { context } = contextRef;

                        // attack 1: our rebel
                        context.player1.clickCard(context.battlefieldMarine);
                        context.player1.clickCard(context.p2Base);

                        // attack 2: their non-rebel
                        context.player2.clickCard(context.wampa);
                        context.player2.clickCard(context.p1Base);

                        // attack 3: our rebel (leader)
                        context.player1.clickCard(context.chirrutImwe);
                        context.player1.clickCard(context.wampa);

                        // attack 4: their rebel
                        context.player2.clickCard(context.consularSecurityForce);
                        context.player2.clickCard(context.p1Base);

                        // attack 5: our non-rebel
                        context.player1.clickCard(context.frontierAtrt);
                        context.player1.clickCard(context.p2Base);

                        // attack 6: their rebel
                        context.player2.clickCard(context.allianceXwing);

                        // attack 7: our rebel (goes to discard)
                        context.player1.clickCard(context.specforceSoldier);
                        context.player1.clickCard(context.wampa);
                        context.player2.passAction();

                        // attack 8: our rebel, but then it is waylaid and played back out so that a previous copy is what did the attacks
                        context.player1.clickCard(context.regionalSympathizers);
                        context.player1.clickCard(context.p2Base);
                        context.player2.clickCard(context.waylay);
                        context.player2.clickCard(context.regionalSympathizers);
                        context.player1.clickCard(context.regionalSympathizers);

                        context.player2.passAction();

                        context.player1.clickCard(context.medalCeremony);
                        expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.chirrutImwe, context.consularSecurityForce, context.allianceXwing]);

                        context.player1.clickCard(context.battlefieldMarine);
                        context.player1.clickCard(context.chirrutImwe);
                        context.player1.clickCard(context.allianceXwing);

                        // click on a fourth card just to confirm it doesn't work
                        context.player1.clickCardNonChecking(context.consularSecurityForce);

                        context.player1.clickDone();
                        expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                        expect(context.chirrutImwe).toHaveExactUpgradeNames(['experience']);
                        expect(context.allianceXwing).toHaveExactUpgradeNames(['experience']);
                        expect(context.consularSecurityForce.isUpgraded()).toBe(false);
                    });
                });
            });

            describe('CardsDiscardedThisPhaseWatcher', function () {
                integration(function (contextRef) {
                    undoIt('Kylo\'s TIE Silencer\'s can be played from the discard when it was discarded from hand or deck this phase', async function () {
                        await contextRef.setupTestAsync({
                            phase: 'action',
                            player1: {
                                hand: ['rogue-squadron-skirmisher'],
                                leader: 'kylo-ren#rash-and-deadly',
                                deck: ['kylos-tie-silencer#ruthlessly-efficient'],
                            },
                            player2: {
                                groundArena: ['kanan-jarrus#revealed-jedi'],
                                spaceArena: ['home-one#alliance-flagship'],
                                hand: ['spark-of-rebellion'],
                            }
                        });

                        const { context } = contextRef;

                        context.player1.passAction();

                        // Player 2 attacks with Kanan Jarrus and discards Kylo's TIE Silencer
                        context.player2.clickCard(context.kananJarrus);
                        context.player2.clickCard(context.p1Base);
                        context.player2.clickPrompt('Discard a card from the defending player\'s deck for each Spectre you control. Heal 1 damage for each aspect among the discarded cards.');
                        context.player2.clickPrompt('Trigger');
                        expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);
                        expect(context.player1.currentActionTargets).toContain(context.kylosTieSilencer);

                        // Player 1 plays Kylo's TIE Silencer from the discard
                        {
                            const readyResourcesBeforePlayingCard = context.player1.readyResourceCount;
                            context.player1.clickCard(context.kylosTieSilencer);
                            expect(context.player1.readyResourceCount).toBe(readyResourcesBeforePlayingCard - 2);
                        }
                        expect(context.kylosTieSilencer).toBeInZone('spaceArena', context.player1);

                        // Player 2 kills Kylo's TIE Silencer and Player 1 cannot play it from the discard again
                        context.player2.clickCard(context.homeOne);
                        context.player2.clickCard(context.kylosTieSilencer);
                        expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);
                        expect(context.player1.currentActionTargets).not.toContain(context.kylosTieSilencer);

                        // Player 1 plays Rogue Squadron Skirmisher and returns Kylo's TIE Silencer to their hand
                        context.player1.clickCard(context.rogueSquadronSkirmisher);
                        context.player1.clickPrompt('Return a unit that costs 2 or less from your discard pile to your hand.');
                        context.player1.clickCard(context.kylosTieSilencer);
                        context.player1.passAction();
                        expect(context.kylosTieSilencer).toBeInZone('hand', context.player1);

                        // Player 2 discards Kylo's TIE Silencer from hand using Spark of Rebellion
                        context.player2.clickCard(context.sparkOfRebellion);
                        context.player2.clickCardInDisplayCardPrompt(context.kylosTieSilencer);
                        expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);

                        // Player 1 plays Kylo's TIE Silencer from the discard
                        {
                            const readyResourcesBeforePlayingCard = context.player1.readyResourceCount;
                            context.player1.clickCard(context.kylosTieSilencer);
                            expect(context.player1.readyResourceCount).toBe(readyResourcesBeforePlayingCard - 2);
                        }
                        expect(context.kylosTieSilencer).toBeInZone('spaceArena', context.player1);
                    });
                });
            });

            describe('CardsDrawnThisPhaseWatcher', function() {
                undoIt('Pre Vizsla\'s leader undeployed ability should deal damage to a unit equal to the number of cards drawn this phase', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['mission-briefing', 'search-your-feelings'],
                            leader: 'pre-vizsla#pursuing-the-throne',
                            deck: ['superlaser-blast', 'atst', 'avenger#hunting-star-destroyer'],
                            groundArena: ['battlefield-marine']
                        },
                        player2: {
                            hand: ['strategic-analysis'],
                            groundArena: ['wampa'],
                            spaceArena: ['green-squadron-awing'],
                        },
                    });

                    const { context } = contextRef;

                    // draw 2 cards
                    context.player1.clickCard(context.missionBriefing);
                    context.player1.clickPrompt('You');

                    // opponent draw 3 cards
                    context.player2.clickCard(context.strategicAnalysis);
                    expect(context.player2.hand.length).toBe(3);

                    // draw a specific cards
                    context.player1.clickCard(context.searchYourFeelings);
                    context.player2.passAction();

                    const exhaustedResourceCount = context.player1.exhaustedResourceCount;

                    context.player1.clickCard(context.preVizsla);
                    context.player1.clickPrompt('Deal damage to a unit equal to the number of cards you\'ve drawn this phase');

                    // can select all unit
                    expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.greenSquadronAwing]);
                    context.player1.clickCard(context.wampa);

                    expect(context.wampa.damage).toBe(3);
                    expect(context.player1.exhaustedResourceCount - exhaustedResourceCount).toBe(1);
                    expect(context.preVizsla.exhausted).toBeTrue();

                    context.moveToNextActionPhase();

                    // no card drawn this phase
                    context.player1.clickCard(context.preVizsla);
                    context.player1.clickPrompt('Deal damage to a unit equal to the number of cards you\'ve drawn this phase');
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('CardsEnteredPlayThisPhaseWatcher', function() {
                describe('Boba Fett, Disintegrator\'s ability', function () {
                    beforeEach(function () {
                        return contextRef.setupTestAsync({
                            phase: 'action',
                            player1: {
                                hand: ['vambrace-grappleshot'],
                                groundArena: ['boba-fett#disintegrator'],
                            },
                            player2: {
                                leader: 'luke-skywalker#faithful-friend',
                                hand: ['lom-pyke#dealer-in-truths', 'consular-security-force', 'entrenched'],
                            }
                        });
                    });

                    undoIt('while attacking an exhausted unit that didn\'t enter play this round, should deal 3 damage to the defender', function () {
                        const { context } = contextRef;

                        const reset = () => {
                            context.setDamage(context.bobaFett, 0);
                            context.readyCard(context.bobaFett);
                            context.setDamage(context.consularSecurityForce, 0);
                            context.readyCard(context.consularSecurityForce);
                        };
                        // Case 1 attacking a ready card
                        context.player1.passAction();
                        context.player2.clickCard(context.consularSecurityForce);
                        context.player1.passAction();

                        context.player2.clickCard(context.lukeSkywalker);
                        context.player2.clickPrompt('Deploy Luke Skywalker');
                        context.moveToNextActionPhase();

                        context.player1.clickCard(context.bobaFett);
                        context.player1.clickCard(context.consularSecurityForce);

                        // check board state
                        expect(context.consularSecurityForce.damage).toBe(3);
                        expect(context.bobaFett.damage).toBe(3);

                        // reset board state
                        reset();

                        // Case 2 attacking a card played this turn
                        expect(context.player2).toBeActivePlayer();
                        context.player2.clickCard(context.lomPyke);
                        context.player1.clickCard(context.bobaFett);
                        context.player1.clickCard(context.lomPyke);

                        // check board state
                        expect(context.player2).toBeActivePlayer();
                        expect(context.lomPyke.damage).toBe(3);
                        expect(context.bobaFett.damage).toBe(4);

                        // reset state
                        reset();

                        // Case 3 Ability activates when attacking an exhausted unit not played in this phase
                        context.exhaustCard(context.consularSecurityForce);
                        context.player2.passAction();
                        context.player1.clickCard(context.bobaFett);
                        context.player1.clickCard(context.consularSecurityForce);

                        // check board state
                        expect(context.bobaFett.damage).toBe(3);
                        expect(context.consularSecurityForce.damage).toBe(6);

                        // reset state
                        reset();

                        context.player2.passAction();

                        // Case 4 Ability should activate when attacking leader deployed previous phase
                        // TODO QIRA The card enteres play event doesn't handle leader deployment correctly so we need to wait for the fix before uncommenting this test.
                        /* context.exhaustCard(context.lukeSkywalker);
                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.lukeSkywalker);

                // check board state
                expect(context.lukeSkywalker.damage).toBe(6);
                expect(context.bobaFett.damage).toBe(4);*/

                        // Case 5 Ability shouldn't activate when selecting BobaFett's ability first.
                        context.player1.clickCard(context.vambraceGrappleshot);
                        context.player1.clickCard(context.bobaFett);
                        context.player2.passAction();

                        context.player1.clickCard(context.bobaFett);
                        context.player1.clickCard(context.consularSecurityForce);
                        context.player1.clickPrompt('(No effect) If this unit is attacking an exhausted unit that didn\'t enter play this round, deal 3 damage to the defender.');

                        // check game state
                        expect(context.consularSecurityForce.damage).toBe(5);
                        expect(context.consularSecurityForce.exhausted).toBe(true);

                        // reset state
                        reset();

                        // Case 6 Ability should activate when selecting vambrace-grappleshots ability before Boba Fetts.
                        context.player2.clickCard(context.entrenched);
                        context.player2.clickCard(context.consularSecurityForce);

                        context.player1.clickCard(context.bobaFett);
                        context.player1.clickCard(context.consularSecurityForce);
                        context.player1.clickPrompt('Exhaust the defender on attack');

                        // check game state
                        expect(context.consularSecurityForce.damage).toBe(8);

                        // TODO check with units rescued from being captured
                    });
                });
            });

            describe('CardsLeftPlayThisPhaseWatcher', function() {
                undoIt('The force token does not have any error when using a CardsLeftPlayThisPhaseWatcher', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'yoda#sensing-darkness',
                            hand: ['cure-wounds'],
                            hasForceToken: true
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.cureWounds);
                    expect(context.player1.hasTheForce).toBe(false);
                });
            });

            describe('CardsPlayedThisPhaseWatcher', function() {
                describe('Vanguard Ace\'s ability', function() {
                    beforeEach(function () {
                        return contextRef.setupTestAsync({
                            phase: 'action',
                            player1: {
                                hand: ['vanguard-ace', 'daring-raid', 'battlefield-marine', 'academy-training', 'frontier-atrt'],
                            },
                            player2: {
                                hand: ['wampa', 'atst']
                            }
                        });
                    });

                    undoIt('gains 1 experience for each other card played by the controller this phase', function () {
                        const { context } = contextRef;

                        context.player1.clickCard(context.daringRaid);
                        context.player1.clickCard(context.p2Base);

                        context.player2.clickCard(context.wampa);

                        context.player1.clickCard(context.battlefieldMarine);

                        context.player2.clickCard(context.atst);

                        context.player1.clickCard(context.academyTraining);
                        context.player1.clickCard(context.battlefieldMarine);

                        context.player2.passAction();

                        context.player1.clickCard(context.vanguardAce);
                        expect(context.vanguardAce).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
                    });

                    undoIt('gains no experience if no other cards have been played', function () {
                        const { context } = contextRef;

                        context.player1.clickCard(context.vanguardAce);
                        expect(context.vanguardAce.isUpgraded()).toBe(false);
                    });

                    undoIt('does not count cards played in the previous phase', function () {
                        const { context } = contextRef;

                        context.player1.clickCard(context.daringRaid);
                        context.player1.clickCard(context.p2Base);

                        context.moveToNextActionPhase();

                        context.player1.clickCard(context.battlefieldMarine);

                        context.player2.clickCard(context.atst);

                        context.player1.clickCard(context.vanguardAce);
                        expect(context.vanguardAce).toHaveExactUpgradeNames(['experience']);
                    });
                });
            });

            describe('DamageDealtThisPhaseWatcher', function() {
                describe('Decimator of Dissidents\'s ability ', function () {
                    beforeEach(function() {
                        return contextRef.setupTestAsync({
                            phase: 'action',
                            player1: {
                                hand: ['decimator-of-dissidents', 'torpedo-barrage'],
                            },
                            player2: {
                                hand: ['planetary-bombardment']
                            }
                        });
                    });

                    undoIt('should not decrease cost by 1 if we did not deal indirect damage', function () {
                        const { context } = contextRef;

                        context.player1.clickCard(context.decimatorOfDissidents);
                        expect(context.player2).toBeActivePlayer();
                        expect(context.player1.exhaustedResourceCount).toBe(4);
                    });

                    undoIt('should decrease cost by 1 if we did not deal indirect damage in this phase', function () {
                        const { context } = contextRef;

                        context.player1.clickCard(context.torpedoBarrage);
                        context.player1.clickPrompt('Deal indirect damage to opponent');

                        context.moveToNextActionPhase();

                        context.player1.clickCard(context.decimatorOfDissidents);
                        expect(context.player2).toBeActivePlayer();
                        expect(context.player1.exhaustedResourceCount).toBe(4);
                    });

                    undoIt('should decrease cost if we did not deal indirect damage (opponent did)', function () {
                        const { context } = contextRef;

                        context.player1.passAction();

                        context.player2.clickCard(context.planetaryBombardment);
                        context.player2.clickPrompt('Deal indirect damage to opponent');

                        context.player1.clickCard(context.decimatorOfDissidents);
                        expect(context.player2).toBeActivePlayer();
                        expect(context.player1.exhaustedResourceCount).toBe(4);
                    });

                    undoIt('should decrease cost by 1 because we dealt indirect in this phase', function () {
                        const { context } = contextRef;

                        context.player1.clickCard(context.torpedoBarrage);
                        context.player1.clickPrompt('Deal indirect damage to opponent');

                        context.player2.passAction();

                        context.player1.clickCard(context.decimatorOfDissidents);
                        expect(context.player2).toBeActivePlayer();
                        expect(context.player1.exhaustedResourceCount).toBe(8); // 5+3
                    });
                });
            });

            describe('ForceUsedThisPhaseWatcher', function() {
                describe('Avar Kriss\'s deploy epic action', function () {
                    beforeEach(function () {
                        return contextRef.setupTestAsync({
                            phase: 'action',
                            player1: {
                                leader: 'avar-kriss#marshal-of-starlight',
                                hand: ['cure-wounds', 'infused-brawler'],
                                groundArena: ['eeth-koth#spiritual-warrior'],
                                base: 'mystic-monastery',
                                hasForceToken: true,
                                resources: 7
                            },
                            player2: {
                                hasForceToken: true,
                                hand: ['vernestra-rwoh#precocious-knight', 'vanquish']
                            }
                        });
                    });

                    undoIt('should work when the player controls less than 9 resources but has used the Force enough times to reach a sum of 9', function () {
                        const { context } = contextRef;

                        // use the Force - sum is 8
                        context.player1.clickCard(context.cureWounds);
                        context.player2.passAction();

                        // gain the Force
                        context.player1.clickCard(context.avarKriss);
                        expect(context.player1.hasTheForce).toBe(true);
                        context.player2.passAction();

                        // use the Force again - sum is 9
                        context.player1.clickCard(context.infusedBrawler);
                        context.player1.clickPrompt('Trigger');
                        context.player2.passAction();

                        // Avar can deploy
                        context.player1.clickCard(context.avarKriss);
                        context.player1.clickPrompt('Deploy Avar Kriss');

                        expect(context.avarKriss.deployed).toBe(true);
                        expect(context.avarKriss).toBeInZone('groundArena');
                    });

                    undoIt('should not count an opponent\'s uses of the Force', function () {
                        const { context } = contextRef;

                        context.player1.clickCard(context.cureWounds);
                        context.player2.passAction();

                        // use Avar's ability so she has no action available later
                        context.player1.clickCard(context.avarKriss);
                        expect(context.player1.hasTheForce).toBe(true);

                        context.player2.clickCard(context.vernestraRwoh);
                        context.player2.clickPrompt('Trigger');

                        expect(context.player1).not.toBeAbleToSelect(context.avarKriss);
                        expect(context.avarKriss).not.toHaveAvailableActionWhenClickedBy(context.player1);
                    });

                    undoIt('should work when the sum is greater than 9', function () {
                        const { context } = contextRef;

                        // use the Force - sum is 8
                        context.player1.clickCard(context.cureWounds);
                        context.player2.passAction();

                        // gain the Force
                        context.player1.clickCard(context.avarKriss);
                        expect(context.player1.hasTheForce).toBe(true);
                        context.player2.passAction();

                        // use the Force again - sum is 9
                        context.player1.clickCard(context.infusedBrawler);
                        context.player1.clickPrompt('Trigger');
                        context.player2.passAction();

                        // gain the Force
                        context.player1.clickCard(context.mysticMonastery);

                        // use the Force again - sum is 10
                        context.player2.clickCard(context.vanquish);
                        context.player2.clickCard(context.eethKoth);
                        context.player1.clickPrompt('Trigger');

                        // Avar can deploy
                        context.player1.clickCard(context.avarKriss);
                        context.player1.clickPrompt('Deploy Avar Kriss');

                        expect(context.avarKriss.deployed).toBe(true);
                        expect(context.avarKriss).toBeInZone('groundArena');
                    });
                });
            });

            // TODO: LeadersDeployedThisPhaseWatcher is not used directly, need to find an example.
            // describe('LeadersDeployedThisPhaseWatcher', function () { });

            describe('UnitsDefeatedThisPhaseWatcher', function() {
                undoIt('Bravado readies unit with cost reduction when smuggled', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'battlefield-marine', exhausted: true }, 'tech#source-of-insight'],
                            hand: ['takedown', 'bravado']
                        },
                        player2: {
                            groundArena: ['rebel-pathfinder']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.moveCard(context.bravado, 'resource');
                    context.player1.readyResources(10);

                    context.player1.clickCard(context.takedown);
                    context.player1.clickCard(context.rebelPathfinder);

                    context.player2.passAction();
                    context.player1.readyResources(10);

                    expect(context.battlefieldMarine.exhausted).toBe(true);
                    context.player1.clickCard(context.bravado);
                    context.player1.clickCard(context.battlefieldMarine);
                    // Base cost of 5 plus Tech cost add-on of 2, minus Bravado cost reduction of 2
                    expect(context.player1.exhaustedResourceCount).toBe(5);
                    expect(context.battlefieldMarine.exhausted).toBe(false);
                });
            });

            describe('UnitsHealedThisPhaseWatcher', function() {
                undoIt('Barriss Offee Unassuming Apprentice ability\'s should give +1/0 to all friendly units healed this phase', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['repair', 'redemption#medical-frigate'],
                            groundArena: [
                                { card: 'barriss-offee#unassuming-apprentice', damage: 1, upgrades: ['resilient'] },
                                { card: 'battlefield-marine', damage: 2 },
                                { card: 'consular-security-force', damage: 0 },
                                'wampa'
                            ],
                            spaceArena: [
                                'alliance-xwing',
                                { card: 'green-squadron-awing', damage: 2 },
                            ],
                        },
                        player2: {
                            hand: ['waylay'],
                            groundArena: [{ card: 'atst', damage: 3 }, 'reinforcement-walker'],
                            spaceArena: ['tieln-fighter'],
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.redemption);
                    context.player1.setDistributeHealingPromptState(new Map([
                        [context.battlefieldMarine, 2],
                        [context.consularSecurityForce, 1], // If undamaged it should not give +1/+0
                        [context.greenSquadronAwing, 1], // It works also for space units
                        [context.atst, 1], // We can heal opponent's unit but it should not give +1/+0
                    ]));

                    // Units who should get +1/+0
                    expect(context.battlefieldMarine.getPower()).toBe(4);
                    expect(context.battlefieldMarine.getHp()).toBe(3);
                    expect(context.greenSquadronAwing.getPower()).toBe(2);
                    expect(context.greenSquadronAwing.getHp()).toBe(3);

                    // UNits who should not get +1/+0
                    expect(context.consularSecurityForce.getPower()).toBe(3);
                    expect(context.consularSecurityForce.getHp()).toBe(7);
                    expect(context.atst.getPower()).toBe(6);
                    expect(context.atst.getHp()).toBe(7);
                    expect(context.barrissOffee.getPower()).toBe(1);
                    expect(context.barrissOffee.getHp()).toBe(4);
                    expect(context.wampa.getPower()).toBe(4);
                    expect(context.wampa.getHp()).toBe(5);
                    expect(context.reinforcementWalker.getPower()).toBe(6);
                    expect(context.reinforcementWalker.getHp()).toBe(9);
                    expect(context.tielnFighter.getPower()).toBe(2);
                    expect(context.tielnFighter.getHp()).toBe(1);
                    expect(context.redemption.getPower()).toBe(6);
                    expect(context.redemption.getHp()).toBe(9);
                    context.player2.passAction();

                    // If we heal Barriss Offee, it should get +1/+0 too
                    context.player1.clickCard(context.repair);
                    context.player1.clickCard(context.barrissOffee);
                    expect(context.barrissOffee.getPower()).toBe(2);
                    expect(context.barrissOffee.getHp()).toBe(4);

                    // It should end at the end of the phase
                    context.moveToNextActionPhase();
                    expect(context.battlefieldMarine.getPower()).toBe(3);
                    expect(context.battlefieldMarine.getHp()).toBe(3);
                    expect(context.greenSquadronAwing.getPower()).toBe(1);
                    expect(context.greenSquadronAwing.getHp()).toBe(3);
                    expect(context.barrissOffee.getPower()).toBe(1);
                    expect(context.barrissOffee.getHp()).toBe(4);

                    // It should also end if Barriss Offee is defeated
                    context.player1.passAction();
                    context.player2.clickCard(context.waylay);
                    context.player2.clickCard(context.redemption);

                    context.player1.clickCard(context.redemption);
                    context.player1.setDistributeHealingPromptState(new Map([
                        [context.greenSquadronAwing, 1],
                    ]));
                    expect(context.greenSquadronAwing.getPower()).toBe(2);
                    expect(context.greenSquadronAwing.getHp()).toBe(3);

                    context.player2.clickCard(context.atst);
                    context.player2.clickCard(context.barrissOffee);
                    expect(context.barrissOffee).toBeInZone('discard');
                    expect(context.greenSquadronAwing.getPower()).toBe(1);
                    expect(context.greenSquadronAwing.getHp()).toBe(3);
                });
            });
        });

        describe('Randomness cases', function () {
            it('should discard the same card after undo', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['political-pressure'],
                        resources: 2,
                        leader: 'han-solo#audacious-smuggler',
                        base: 'chopper-base',
                    },
                    player2: {
                        hand: ['pyke-sentinel', 'b2-legionnaires', 'gladiator-star-destroyer', 'republic-arc170', 'ryloth-militia'],
                        resources: 2
                    }
                });
                const discardPrompt = 'Trigger';
                const { context } = contextRef;
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                context.player1.clickFirstCardInHand();
                expect(context.player2).toHaveEnabledPromptButton(discardPrompt);

                context.player2.clickPrompt(discardPrompt);
                expect(context.player2.hand.length).toBe(4);

                const discardedCard = context.player2.discard[0];
                expect(context.player2.hand).not.toContain(discardedCard);

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'manual',
                    playerId: context.player1Object.id,
                    snapshotId
                });

                context.player1.clickFirstCardInHand();
                context.player2.clickPrompt(discardPrompt);
                expect(context.player2.hand.length).toBe(4);
                expect(context.player2.discard.length).toBe(1);
                expect(context.player2.discard[0]).toBe(discardedCard);
            });

            it('should give the same top deck after shuffle', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: [
                            'death-trooper',
                            'pyke-sentinel',
                            'cartel-spacer',
                            'wampa',
                            'superlaser-technician',
                            'tieln-fighter',
                            '21b-surgical-droid',
                            'r2d2#ignoring-protocol',
                            'c3po#protocol-droid',
                            'wolffe#suspicious-veteran'
                        ],
                        resources: 2,
                        leader: 'han-solo#audacious-smuggler',
                        base: 'chopper-base',
                    },
                    player2: {
                        resources: 2
                    }
                });

                const { context } = contextRef;

                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                context.game.shuffleDeck(context.player1Object.id);
                const topDeck = context.player1.deck[0];

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'manual',
                    playerId: context.player1Object.id,
                    snapshotId
                });
                context.game.shuffleDeck(context.player1Object.id);

                expect(context.player1.deck[0]).toBe(topDeck);
            });

            it('should give the same top deck after two snapshots', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: [
                            'death-trooper',
                            'pyke-sentinel',
                            'cartel-spacer',
                            'wampa',
                            'superlaser-technician',
                            'tieln-fighter',
                            '21b-surgical-droid',
                            'r2d2#ignoring-protocol',
                            'c3po#protocol-droid',
                            'wolffe#suspicious-veteran'
                        ],
                        resources: 2,
                        leader: 'han-solo#audacious-smuggler',
                        base: 'chopper-base',
                    },
                    player2: {
                        resources: 2
                    }
                });
                const { context } = contextRef;

                context.game.shuffleDeck(context.player1Object.id);
                const topDeck = context.player1.deck[0];

                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                context.game.shuffleDeck(context.player1Object.id);
                contextRef.snapshot.takeManualSnapshot(context.player1Object);
                context.game.shuffleDeck(context.player1Object.id);
                contextRef.snapshot.rollbackToSnapshot({
                    type: 'manual',
                    playerId: context.player1Object.id,
                    snapshotId
                });
                context.game.shuffleDeck(context.player1Object.id);

                expect(context.player1.deck[0]).toBe(topDeck);
            });
        });

        describe('Action Phase Claim/Pass Cases', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ardent-sympathizer'],
                        resources: 3,
                        groundArena: [],
                    },
                    player2: {
                        hand: ['crafty-smuggler'],
                        resources: 3,
                        groundArena: [],
                    },
                });
            });

            it('should allow a player to undo then claim initiative after other player already claimed', function() {
                const { context } = contextRef;
                const { player1, player2 } = context;
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                player1.claimInitiative();
                contextRef.snapshot.takeManualSnapshot(context.player1Object);

                player2.passAction();
                player1.clickDone();
                player2.clickDone();

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'manual',
                    playerId: context.player1Object.id,
                    snapshotId
                });

                player1.passAction();
                player2.claimInitiative();
                player2.clickDone();
                player1.clickDone();

                expect(context.game.roundNumber).toBe(2);
                expect(player2).toBeActivePlayer();
            });

            it('should allow a player to undo then play a card after passing', function() {
                const { context } = contextRef;
                const { player1, player2 } = context;
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                player1.passAction();
                player2.clickFirstCardInHand();

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'manual',
                    playerId: context.player1Object.id,
                    snapshotId
                });

                player1.clickFirstCardInHand();
                player2.clickFirstCardInHand();

                expect(player1.hand.length).toBe(0);
                expect(player2.hand.length).toBe(0);
                expect(player1.groundArenaUnits.length).toBe(1);
                expect(player2.groundArenaUnits.length).toBe(1);
            });
        });

        describe('Regroup Phase Resource/Pass Cases', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action', // 'regroup',
                    player1: {
                        hand: ['ardent-sympathizer', 'death-star-stormtrooper'],
                        resources: 6,
                        deck: [],
                    },
                    player2: {
                        hand: ['crafty-smuggler'],
                        resources: 6,
                        deck: []
                    }
                });
            });

            it('should allow a player to resource after undo if they passed on resourcing before', function() {
                const { context } = contextRef;
                const { player1, player2 } = context;
                // TODO: look into why we can't start from regroup phase
                context.moveToRegroupPhase();
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                player1.clickDone();
                player2.clickFirstCardInHand();
                player2.clickDone();

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'manual',
                    playerId: context.player1Object.id,
                    snapshotId
                });

                player1.clickFirstCardInHand();
                player1.clickDone();
                player2.clickFirstCardInHand();
                player2.clickDone();
                player1.clickFirstCardInHand();

                expect(context.game.roundNumber).toBe(2);
                expect(player2).toBeActivePlayer();
                expect(player1.hand.length).toBe(0);
                expect(player1.resources.length).toBe(7);
                expect(player2.resources.length).toBe(7);
                expect(player1.groundArenaUnits.length).toBe(1);
                expect(player1.base.damage).toBe(6);
                expect(player2.base.damage).toBe(6);
            });

            it('should allow a player to undo then pass on resourcing after already resourcing', function() {
                const { context } = contextRef;
                const { player1, player2 } = context;
                // TODO: look into why we can't start from regroup phase
                context.moveToRegroupPhase();
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                player1.clickFirstCardInHand();
                player1.clickDone();
                player2.clickFirstCardInHand();
                player2.clickDone();

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'manual',
                    playerId: context.player1Object.id,
                    snapshotId
                });

                player1.clickDone();
                player2.clickFirstCardInHand();
                player2.clickDone();

                expect(context.game.roundNumber).toBe(2);
                expect(player1).toBeActivePlayer();
                expect(player1.hand.length).toBe(2);
                expect(player1.resources.length).toBe(6);
                expect(player2.resources.length).toBe(7);
                expect(player1.base.damage).toBe(6);
                expect(player2.base.damage).toBe(6);
            });
        });

        describe('Detached ongoing effect state', function() {
            undoIt(' - Republic attack pod should cost 1 less if there is 3 friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['republic-attack-pod'],
                        groundArena: ['fleet-lieutenant', 'battlefield-marine', 'pyke-sentinel'],
                        leader: 'fennec-shand#honoring-the-deal',
                        resources: 6
                    },
                    player2: {
                        hand: ['waylay'],
                        groundArena: ['greedo#slow-on-the-draw', 'rey#keeping-the-past'],
                    }
                });

                const { context } = contextRef;

                const reset = () => {
                    context.player2.clickCard(context.waylay);
                    context.player2.clickCard(context.republicAttackPod);
                    context.player1.readyResources(6);
                };

                // case 1: costs 5 to deploy when 3 units out
                context.player1.clickCard(context.republicAttackPod);
                expect(context.player1.exhaustedResourceCount).toBe(5);

                reset();

                // case 2: costs 6 to deploy when less than 3 units out (3 units present across board)
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.greedo);
                context.player2.passAction();
                context.player2.passAction();
                context.player1.clickCard(context.republicAttackPod);
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });
        });

        describe('Card stats', function() {
            undoIt('should log card stats', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bazine-netal#spy-for-the-first-order'],
                    },
                    player2: {
                        hand: ['atst', 'waylay'],
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                expect(context.game.statsTracker.cardMetrics.length).toBe(16);
                const cardMetrics = context.game.statsTracker.cardMetrics;

                context.player1.clickCard(context.bazineNetal);
                context.player1.clickCardInDisplayCardPrompt(context.waylay);

                expect(context.game.statsTracker.cardMetrics).toEqualArray([
                    ...cardMetrics,
                    context.player1.played(context.bazineNetal),
                    context.player2.discarded(context.waylay),
                    context.player2.drew(context.wampa),
                ]);
            });
        });

        describe('Rollback confirmation', function() {
            undoIt('should not require confirmation to rollback if no randomness or new information was revealed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['jar-jar-binks#foolish-gungan'],
                        spaceArena: ['republic-arc170']
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                // Generate a quick snapshot
                context.player2.passAction();

                context.player1.clickCard(context.republicArc170);
                context.player1.clickCard(context.p2Base);

                expect(context.game.snapshotManager.canQuickRollbackWithoutConfirmation(context.player1.id)).toBeTrue();
                expect(context.game.snapshotManager.canQuickRollbackWithoutConfirmation(context.player2.id)).toBeTrue();
            });

            undoIt('should require confirmation to rollback after random selection', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['jar-jar-binks#foolish-gungan'],
                        spaceArena: ['republic-arc170']
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['restored-arc170'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;
                context.game.setRandomSeed('khgfk');

                // Generate a quick snapshot
                context.player2.passAction();

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickCard(context.p2Base);

                expect(context.game.snapshotManager.canQuickRollbackWithoutConfirmation(context.player1.id)).toBeFalse();
                expect(context.game.snapshotManager.canQuickRollbackWithoutConfirmation(context.player2.id)).toBeFalse();
            });

            undoIt('should require confirmation to rollback after game end', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['republic-arc170']
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        base: { card: 'energy-conversion-lab', damage: 24 },
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;
                context.ignoreUnresolvedActionPhasePrompts = true;

                // Generate a quick snapshot
                context.player2.passAction();

                context.player1.clickCard(context.republicArc170);
                context.player1.clickCard(context.p2Base);

                expect(context.game.snapshotManager.canQuickRollbackWithoutConfirmation(context.player1.id)).toBeFalse();
                expect(context.game.snapshotManager.canQuickRollbackWithoutConfirmation(context.player2.id)).toBeFalse();
            });
        });
    });
});
