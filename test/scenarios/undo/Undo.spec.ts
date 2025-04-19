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

                rollback(context, () => {
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

                rollback(context, () => {
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

                // Ro
                rollback(context, () => {
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
                rollback(context, () => {
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

                rollback(context, () => {
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

                rollback(context, () => {
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

                rollback(context, () => {
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
    });
});
