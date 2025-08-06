
describe('Undo', function() {
    undoIntegration(function(contextRef) {
        describe('Death Trooper\'s When Played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action', // 'regroup',
                    player1: {
                        hand: ['ardent-sympathizer', 'death-star-stormtrooper'],
                        resources: 2,
                        deck: [],
                    },
                    player2: {
                        hand: ['crafty-smuggler'],
                        resources: 2,
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
                expect(player1.resources.length).toBe(3);
                expect(player2.resources.length).toBe(3);
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
                expect(player1.resources.length).toBe(2);
                expect(player2.resources.length).toBe(3);
                expect(player1.base.damage).toBe(6);
                expect(player2.base.damage).toBe(6);
            });
        });
    });
});
