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
                    context.player1.clickCard(context.pyrrhicAssault);
                    expect(context.player2).toBeActivePlayer();

                    context.player2.clickCard(context.gladiatorStarDestroyer);
                    context.player2.clickCard(context.republicArc170);
                    expect(context.player1).toHavePrompt('Deal 2 damage to an enemy unit.');
                    expect(context.player1).toBeAbleToSelectExactly([context.b2Legionnaires, context.gladiatorStarDestroyer]);
                    expect(context.republicArc170).toBeInZone('discard');

                    context.player1.clickCard(context.b2Legionnaires);
                    expect(context.b2Legionnaires.damage).toBe(2);

                    context.player1.clickCard(context.rylothMilitia);
                    context.player1.clickCard(context.b2Legionnaires);
                    expect(context.player1).toHavePrompt('Deal 2 damage to an enemy unit.');
                    expect(context.player1).toBeAbleToSelectExactly([context.gladiatorStarDestroyer]);
                    expect(context.rylothMilitia).toBeInZone('discard');

                    // Expect the Gladiator Star Destroyer to have a total of 5 damage, 3 from attack and 2 from the trigger
                    context.player1.clickCard(context.gladiatorStarDestroyer);
                    expect(context.gladiatorStarDestroyer.damage).toBe(5);
                });
            });
        });
    });
});
