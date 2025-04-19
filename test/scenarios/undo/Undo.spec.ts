describe('Undo', function() {
    integration(function(contextRef) {
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
                    },
                    testUndo: true
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

                context.game.enableUndo(() => {
                    const snapshotId = context.game.takeSnapshot();

                    // TODO: A dumb check, but are the player 2 game objects created after player 1?
                    //          Right now the ability is removed immediately after snoke's state is set, but I don't know
                    //          how snoke's ability effects the health/power, IE does it directly effect the state or is it a modifier?
                    //          Basically, do we need afterSetState.afterSetState to be moved to afterSetAllState to ensure all objects are up to date?
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

                    context.game.rollbackToSnapshot(snapshotId);

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
                context.game.enableUndo(() => {
                    const snapshotId = context.game.takeSnapshot();

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

                    context.game.rollbackToSnapshot(snapshotId);

                    // noting happen from restore on our base
                    context.player1.clickCard(context.admiralAckbar);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p1Base.damage).toBe(4);

                    context.game.rollbackToSnapshot(snapshotId);

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

            it('should give each friendly unit, "When Defeated: Deal 2 damage to an enemy unit."', function () {
                const { context } = contextRef;

                context.game.enableUndo(() => {
                    const snapshotId = context.game.takeSnapshot();
                    context.player1.clickCard(context.pyrrhicAssault);
                    expect(context.player2).toBeActivePlayer();

                    context.player2.clickCard(context.gladiatorStarDestroyer);
                    context.player2.clickCard(context.republicArc170);
                    expect(context.player1).toHavePrompt('Deal 2 damage to an enemy unit.');
                    expect(context.player1).toBeAbleToSelectExactly([context.b2Legionnaires, context.gladiatorStarDestroyer]);
                    expect(context.republicArc170).toBeInZone('discard');

                    context.game.rollbackToSnapshot(snapshotId);
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
        });

        it('Huyang\'s ability gives another friendly unit +2/+2 until he leaves play', async function () {
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

            const { context } = contextRef;

            rollback(context, function() {
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
            }, function alt() {
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

                rollback(context, () => {
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

                rollback(context, () => {
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
        });
    });
});
