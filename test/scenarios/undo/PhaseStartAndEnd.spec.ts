describe('Start / end of phase snapshots', function() {
    undoIntegration(function(contextRef) {
        describe('Effects at the start of the regroup phase for one player', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['inferno-four#unforgetting', 'system-patrol-craft'],
                        hand: ['sneak-attack', 'ruthless-raider']
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Ruthless Raider from hand
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.ruthlessRaider);

                // Select Enemy Unit and Base. Not able to select friendly units
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa]);
                context.player1.clickCard(context.greenSquadronAwing);

                // Check damage on unit and base
                expect(context.p2Base.damage).toBe(2);
                expect(context.greenSquadronAwing.damage).toBe(2);

                context.moveToRegroupPhase();

                context.startOfPhaseSnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.startOfPhaseActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                // RR is defeated by Sneak Attack effect. Select Enemy Unit and Base. Not able to select friendly units
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa]);
                context.player1.clickCard(context.greenSquadronAwing);

                // Check damage on unit and base
                expect(context.p2Base.damage).toBe(4);
                expect(context.greenSquadronAwing).toBeInZone('discard');
            });

            const assertActionPhaseEndState = (context) => {
                expect(context.game.currentPhase).toBe('action');
                expect(context.ruthlessRaider).toBeInZone('spaceArena');
                expect(context.p2Base.damage).toBe(2);
                expect(context.greenSquadronAwing.damage).toBe(2);
            };

            const assertRegroupPhaseStartState = (context) => {
                expect(context.game.currentPhase).toBe('regroup');
                expect(context.ruthlessRaider).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(2);
                expect(context.greenSquadronAwing.damage).toBe(2);
            };

            const assertRegroupPhaseRaiderDefeatedState = (context) => {
                expect(context.game.currentPhase).toBe('regroup');
                expect(context.ruthlessRaider).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(4);
                expect(context.greenSquadronAwing).toBeInZone('discard');
            };

            it('should be repeated when rolling back to the start-of-regroup-phase snapshot from within the regroup phase', function () {
                const { context } = contextRef;

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'phase',
                    phaseName: 'regroup',
                    phaseOffset: 0
                });
                expect(rollbackResult).toBeTrue();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.startOfPhaseSnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.startOfPhaseActionId);

                assertRegroupPhaseStartState(context);

                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa]);
                context.player1.clickCard(context.greenSquadronAwing);

                assertRegroupPhaseRaiderDefeatedState(context);

                // move to action phase to confirm that everything still works
                context.player1.clickDone();
                context.player2.clickDone();
                context.player1.clickCard(context.systemPatrolCraft);
                context.player1.clickCard(context.p2Base);
            });

            it('should be repeated when rolling back to the start-of-regroup-phase snapshot from the next action phase', function () {
                const { context } = contextRef;

                // move to action phase
                context.player1.clickDone();
                context.player2.clickDone();
                context.player1.clickCard(context.systemPatrolCraft);
                context.player1.clickCard(context.p2Base);

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'phase',
                    phaseName: 'regroup',
                    phaseOffset: 0
                });
                expect(rollbackResult).toBeTrue();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.startOfPhaseSnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.startOfPhaseActionId);

                assertRegroupPhaseStartState(context);

                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa]);
                context.player1.clickCard(context.greenSquadronAwing);

                assertRegroupPhaseRaiderDefeatedState(context);

                // move to action phase to confirm that everything still works
                context.player1.clickDone();
                context.player2.clickDone();
                context.player1.clickCard(context.systemPatrolCraft);
                context.player1.clickCard(context.p2Base);
            });

            it('should create a quick rollback point for the prompted player, available at the next timepoint', function () {
                const { context } = contextRef;

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult).toBeTrue();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.startOfPhaseSnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.startOfPhaseActionId);

                assertRegroupPhaseStartState(context);

                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa]);
                context.player1.clickCard(context.greenSquadronAwing);

                assertRegroupPhaseRaiderDefeatedState(context);

                // move to action phase to confirm that everything still works
                context.player1.clickDone();
                context.player2.clickDone();
                context.player1.clickCard(context.systemPatrolCraft);
                context.player1.clickCard(context.p2Base);
            });

            it('should create a quick rollback point for the prompted player, available into the next phase', function () {
                const { context } = contextRef;

                context.player1.clickDone();
                context.player2.clickDone();

                // roll back to resource selection stage
                const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult1).toBeTrue();

                assertRegroupPhaseRaiderDefeatedState(context);

                // roll back to the RR defeat prompt
                const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult2).toBeTrue();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.startOfPhaseSnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.startOfPhaseActionId);

                assertRegroupPhaseStartState(context);

                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa]);
                context.player1.clickCard(context.greenSquadronAwing);

                assertRegroupPhaseRaiderDefeatedState(context);

                // move to action phase to confirm that everything still works
                context.player1.clickDone();
                context.player2.clickDone();
                context.player1.clickCard(context.systemPatrolCraft);
                context.player1.clickCard(context.p2Base);
            });

            it('should create a quick rollback point for the prompted player that can be rolled back past into the action phase', function () {
                const { context } = contextRef;

                // roll back to the RR defeat prompt
                const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult1).toBeTrue();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.startOfPhaseSnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.startOfPhaseActionId);

                assertRegroupPhaseStartState(context);

                // roll back to selecting "pass" to end the action phase
                const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult2).toBeTrue();

                assertActionPhaseEndState(context);
            });

            it('should create a quick rollback point for the prompted player, from which the non-prompted player can roll back into the action phase', function () {
                const { context } = contextRef;

                // roll back to the RR defeat prompt
                const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult1).toBeTrue();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.startOfPhaseSnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.startOfPhaseActionId);

                assertRegroupPhaseStartState(context);

                // roll back to selecting "pass" to end the action phase
                const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player2.id
                });
                expect(rollbackResult2).toBeTrue();

                assertActionPhaseEndState(context);
            });

            it('should create a quick rollback point for the prompted player, not available to the non-prompted player', function () {
                const { context } = contextRef;

                // roll back to pressing "pass" to end action phase
                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player2.id
                });
                expect(rollbackResult).toBeTrue();

                assertActionPhaseEndState(context);
            });
        });

        describe('Effects at the start of the regroup phase for both players', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['inferno-four#unforgetting', 'system-patrol-craft'],
                        hand: ['sneak-attack', 'ruthless-raider']
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['wampa'],
                        hand: ['sneak-attack', 'ruthless-raider']
                    }
                });

                const { context } = contextRef;

                context.p1SneakAttack = context.player1.findCardByName('sneak-attack');
                context.p2SneakAttack = context.player2.findCardByName('sneak-attack');
                context.p1RuthlessRaider = context.player1.findCardByName('ruthless-raider');
                context.p2RuthlessRaider = context.player2.findCardByName('ruthless-raider');

                // Play Ruthless Raider from hand (P1)
                context.player1.clickCard(context.p1SneakAttack);
                context.player1.clickCard(context.p1RuthlessRaider);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.p2Base.damage).toBe(2);
                expect(context.greenSquadronAwing.damage).toBe(2);

                // Play Ruthless Raider from hand (P2)
                context.player2.clickCard(context.p2SneakAttack);
                context.player2.clickCard(context.p2RuthlessRaider);
                context.player2.clickCard(context.systemPatrolCraft);
                expect(context.p1Base.damage).toBe(2);
                expect(context.systemPatrolCraft.damage).toBe(2);

                context.endOfActionPhaseSnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.endOfActionPhaseActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.moveToRegroupPhase();

                context.startOfRegroupPhaseSnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.startOfRegroupPhaseActionId = contextRef.snapshot.getCurrentSnapshottedAction();
            });

            const completeRuthlessRaiderActions = (context) => {
                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                context.player1.clickPrompt('You');
                context.player1.clickCard(context.greenSquadronAwing);
                context.player2.clickCard(context.systemPatrolCraft);
            };

            const assertActionPhaseEndState = (context) => {
                expect(context.game.currentPhase).toBe('action');
                expect(context.p1RuthlessRaider).toBeInZone('spaceArena');
                expect(context.p2RuthlessRaider).toBeInZone('spaceArena');

                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(2);
                expect(context.greenSquadronAwing.damage).toBe(2);
            };

            const assertRegroupPhaseStartState = (context) => {
                expect(context.game.currentPhase).toBe('regroup');
                expect(context.p1RuthlessRaider).toBeInZone('discard');
                expect(context.p2RuthlessRaider).toBeInZone('discard');

                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(2);
                expect(context.greenSquadronAwing.damage).toBe(2);
                expect(context.systemPatrolCraft.damage).toBe(2);
            };

            const assertRegroupPhaseRaiderDefeatedState = (context) => {
                expect(context.game.currentPhase).toBe('regroup');
                expect(context.p1RuthlessRaider).toBeInZone('discard');
                expect(context.p2RuthlessRaider).toBeInZone('discard');

                expect(context.p1Base.damage).toBe(4);
                expect(context.p2Base.damage).toBe(4);
                expect(context.greenSquadronAwing).toBeInZone('discard');
                expect(context.systemPatrolCraft).toBeInZone('discard');
            };

            it('should create a quick rollback point for the first prompted player, available at the next timepoint, which repeats the actions for both players', function () {
                const { context } = contextRef;

                completeRuthlessRaiderActions(context);

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult).toBeTrue();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.startOfRegroupPhaseSnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.startOfRegroupPhaseActionId);

                assertRegroupPhaseStartState(context);
                completeRuthlessRaiderActions(context);
                assertRegroupPhaseRaiderDefeatedState(context);
            });

            it('should create a quick rollback point for the first prompted player, available at the next timepoint, which can be rolled back through', function () {
                const { context } = contextRef;

                completeRuthlessRaiderActions(context);

                const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult1).toBeTrue();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.startOfRegroupPhaseSnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.startOfRegroupPhaseActionId);

                const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult2).toBeTrue();

                // should be at last step in the action phase now
                expect(context.game.currentPhase).toBe('action');
            });

            it('should create a quick rollback point for the second prompted player, available at the next timepoint, which repeats the actions for both players', function () {
                const { context } = contextRef;

                completeRuthlessRaiderActions(context);

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player2.id
                });
                expect(rollbackResult).toBeTrue();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.startOfRegroupPhaseSnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.startOfRegroupPhaseActionId);

                assertRegroupPhaseStartState(context);
                completeRuthlessRaiderActions(context);
                assertRegroupPhaseRaiderDefeatedState(context);
            });

            // TODO: ideally, if one player has finished their RR prompt and hits "undo", it could revert back to start of regroup phase
            // and not skip over their RR action
            it('should revert back to the last action of the action phase on undo', function () {
                const { context } = contextRef;

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult).toBeTrue();

                assertActionPhaseEndState(context);

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.endOfActionPhaseSnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.endOfActionPhaseActionId);

                context.player1.clickPrompt('Pass');
                context.player2.clickPrompt('Pass');

                assertRegroupPhaseStartState(context);
                completeRuthlessRaiderActions(context);
                assertRegroupPhaseRaiderDefeatedState(context);
            });
        });

        describe('Effects at the start of the action phase,', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        deck: ['takedown', 'vanquish', 'rivals-fall', 'cartel-spacer'],
                        leader: 'grand-admiral-thrawn#patient-and-insightful',
                        resources: 3,
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        deck: ['steadfast-battalion', 'avenger#hunting-star-destroyer', 'specforce-soldier']
                    },
                    phaseTransitionHandler: (phase) => {
                        if (phase === 'action') {
                            contextRef.context.player1.clickDone();
                        }
                    }
                });

                const { context } = contextRef;

                context.moveToRegroupPhase();

                context.regroupPhaseSnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.regroupPhaseActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                // move to action phase, Thrawn1 prompt triggers
                context.player1.clickDone();
                context.player2.clickDone();

                context.startOfPhaseSnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.startOfPhaseActionId = contextRef.snapshot.getCurrentSnapshottedAction();
            });

            const assertActionPhaseStartState = (context) => {
                expect(context.player1.handSize).toBe(2);
                expect(context.player2.handSize).toBe(2);

                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.p1Base.damage).toEqual(0);
                expect(context.p2Base.damage).toEqual(0);
            };

            it('during the prompt, should roll back to the regroup phase snapshot on undo', function () {
                const { context } = contextRef;

                // quick rollback for player1
                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult).toBeTrue();

                expect(context.game.currentPhase).toBe('regroup');

                // proceed back to action phase and Thrawn1 prompt
                context.player1.clickDone();
                context.player2.clickDone();

                assertActionPhaseStartState(context);

                expect(context.player1).toHaveExactViewableDisplayPromptCards([
                    { card: context.rivalsFall, displayText: 'Yourself' },
                    { card: context.specforceSoldier, displayText: 'Opponent' }
                ]);

                context.player1.clickDone();

                expect(context.player1).toBeActivePlayer();
            });

            describe('after the effect prompt has finished,', function () {
                beforeEach(function () {
                    const { context } = contextRef;

                    // thrawn ability reveal top deck of each player (happens at beginning of action phase)
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([
                        { card: context.rivalsFall, displayText: 'Yourself' },
                        { card: context.specforceSoldier, displayText: 'Opponent' }
                    ]);

                    context.player1.clickDone();

                    context.p1Action1SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                    context.p1Action1ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                    context.player1.clickCard(context.battlefieldMarine);
                    context.player1.clickCard(context.p2Base);

                    context.p2Action1SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                    context.p2Action1ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.p1Action2SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                    context.p1Action2ActionId = contextRef.snapshot.getCurrentSnapshottedAction();
                });

                it('should be repeated when rolling back to the start-of-action-phase snapshot', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'phase',
                        phaseName: 'action',
                        phaseOffset: 0
                    });
                    expect(rollbackResult).toBeTrue();

                    expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.startOfPhaseSnapshotId);
                    expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.startOfPhaseActionId);
                    assertActionPhaseStartState(context);

                    expect(context.player1).toHaveExactViewableDisplayPromptCards([
                        { card: context.rivalsFall, displayText: 'Yourself' },
                        { card: context.specforceSoldier, displayText: 'Opponent' }
                    ]);

                    context.player1.clickDone();

                    expect(context.player1).toBeActivePlayer();
                });

                it('should not be repeated when rolling back to the first action snapshot of the phase', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: -1
                    });
                    expect(rollbackResult).toBeTrue();

                    expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.p1Action1SnapshotId);
                    expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p1Action1ActionId);
                    assertActionPhaseStartState(context);

                    expect(context.player1).not.toHaveExactViewableDisplayPromptCards([
                        { card: context.rivalsFall, displayText: 'Yourself' },
                        { card: context.specforceSoldier, displayText: 'Opponent' }
                    ]);
                    expect(context.player1).toBeActivePlayer();
                });

                it('should create a quick snapshot for the prompted player', function () {
                    const { context } = contextRef;

                    // roll back to first action of phase
                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult1).toBeTrue();

                    // roll back to thrawn1 prompt
                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult2).toBeTrue();

                    expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.startOfPhaseSnapshotId);
                    expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.startOfPhaseActionId);
                    assertActionPhaseStartState(context);

                    expect(context.player1).toHaveExactViewableDisplayPromptCards([
                        { card: context.rivalsFall, displayText: 'Yourself' },
                        { card: context.specforceSoldier, displayText: 'Opponent' }
                    ]);

                    context.player1.clickDone();

                    expect(context.player1).toBeActivePlayer();
                });

                it('should create a quick snapshot for the prompted player which can be rolled back through', function () {
                    const { context } = contextRef;

                    // roll back to first action of phase
                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult1).toBeTrue();

                    // roll back to thrawn1 prompt
                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult2).toBeTrue();

                    // roll back to resourcing
                    const rollbackResult3 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult3).toBeTrue();

                    expect(context.game.currentPhase).toBe('regroup');
                    context.player1.clickDone();
                    context.player2.clickDone();

                    // done for Thrawn1 prompt
                    context.player1.clickDone();
                });

                it('should not create a quick snapshot for the non-prompted player', function () {
                    const { context } = contextRef;

                    // roll back to first action of phase
                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult1).toBeTrue();

                    // roll back to resource step
                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult2).toBeTrue();

                    // not checking snapshotId because it resets to start of regroup phase, but then immediately moves to the resourcing snapshot
                    expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.regroupPhaseActionId);
                    expect(context.game.currentPhase).toBe('regroup');

                    // finish resource prompts
                    context.player2.clickDone();
                    context.player1.clickDone();

                    // finish Thrawn1 prompt
                    context.player1.clickDone();
                });
            });
        });

        describe('Effects at the \'ready cards\' step of the regroup phase,', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['millennium-falcon#piece-of-junk'],
                    }
                });

                const { context } = contextRef;

                context.moveToRegroupPhase();

                context.resourceStepSnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.resourceStepActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                // move to end of phase and Falcon prompt
                context.player1.clickDone();
                context.player2.clickDone();
            });

            it('during the prompt, should roll back to the resource snapshot on undo', function () {
                const { context } = contextRef;

                // quick rollback for player1
                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult).toBeTrue();

                expect(context.game.currentPhase).toBe('regroup');

                // proceed back to action phase and Thrawn1 prompt
                context.player1.clickDone();
                context.player2.clickDone();

                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
            });

            describe('after the effect prompt has finished,', function () {
                beforeEach(function () {
                    const { context } = contextRef;

                    context.endOfPhaseSnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                    context.endOfPhaseActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                    // resolve Falcon prompt
                    context.player1.clickPrompt('Return this unit to her owner\'s hand');
                });

                it('should create a quick snapshot for the prompted player', function () {
                    const { context } = contextRef;

                    // roll back to Falcon prompt
                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult).toBeTrue();

                    expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.endOfPhaseSnapshotId);
                    expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.endOfPhaseActionId);
                    expect(context.game.currentPhase).toBe('regroup');

                    expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);

                    context.player1.clickPrompt('Pay 1 resource');

                    expect(context.millenniumFalcon).toBeInZone('spaceArena');
                    expect(context.player1.exhaustedResourceCount).toBe(1);
                    expect(context.player1).toBeActivePlayer();
                });

                it('should create a quick snapshot for the prompted player that can be rolled back again', function () {
                    const { context } = contextRef;

                    // roll back to Falcon prompt
                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult1).toBeTrue();

                    expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.endOfPhaseSnapshotId);
                    expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.endOfPhaseActionId);
                    expect(context.game.currentPhase).toBe('regroup');

                    expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);

                    // roll back to Falcon prompt
                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult2).toBeTrue();

                    expect(context.game.currentPhase).toBe('regroup');

                    // proceed back to action phase and Thrawn1 prompt
                    context.player1.clickDone();
                    context.player2.clickDone();

                    expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
                });

                it('should not create a quick snapshot for the non-prompted player', function () {
                    const { context } = contextRef;

                    // roll back to Falcon prompt
                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult).toBeTrue();

                    // not checking snapshotId because it resets to start of regroup phase, but then immediately moves to the resourcing snapshot
                    expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.resourceStepActionId);
                    expect(context.game.currentPhase).toBe('regroup');

                    context.player1.clickDone();
                    context.player2.clickDone();
                });
            });
        });

        describe('Effects at the end of the action phase', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tactical-advantage'],
                        spaceArena: ['onyx-squadron-brute'],
                        base: { card: 'chopper-base', damage: 5 }
                    },
                    player2: {
                        hand: ['open-fire']
                    }
                });

                const { context } = contextRef;

                // Buff Brute with Tactical Advantage
                context.player1.clickCard(context.tacticalAdvantage);
                context.player1.clickCard(context.onyxSquadronBrute);

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.onyxSquadronBrute);

                // end the phase, Brute trigger happens when it's defeated
                context.player1.passAction();
                context.player2.passAction();
            });

            const assertActionPhaseEndState = (context) => {
                // right now the phase is technically 'null' during the end-of-phase step
                expect(context.game.currentPhase).toBeNull();
                expect(context.onyxSquadronBrute).toBeInZone('discard');
                expect(context.p1Base.damage).toBe(5);
            };

            // const assertRegroupPhaseStartState = (context) => {
            //     expect(context.game.currentPhase).toBe('regroup');
            //     expect(context.ruthlessRaider).toBeInZone('discard');
            //     expect(context.p2Base.damage).toBe(2);
            //     expect(context.greenSquadronAwing.damage).toBe(2);
            // };

            // const assertRegroupPhaseRaiderDefeatedState = (context) => {
            //     expect(context.game.currentPhase).toBe('regroup');
            //     expect(context.ruthlessRaider).toBeInZone('discard');
            //     expect(context.p2Base.damage).toBe(4);
            //     expect(context.greenSquadronAwing).toBeInZone('discard');
            // };

            describe('after the effect prompt has finished,', function () {
                beforeEach(function () {
                    const { context } = contextRef;

                    context.endOfPhaseSnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                    context.endOfPhaseActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                    // choose p1 base for healing
                    context.player1.clickCard(context.p1Base);
                });

                it('should create a quick snapshot for the prompted player', function () {
                    const { context } = contextRef;

                    // roll back Brute prompt
                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult).toBeTrue();

                    expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.endOfPhaseSnapshotId);
                    expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.endOfPhaseActionId);
                    assertActionPhaseEndState(context);

                    // choose p1 base for healing
                    context.player1.clickCard(context.p1Base);
                    expect(context.p1Base.damage).toBe(3);

                    expect(context.player1).toBeActivePlayer();
                });
            });
        });

        // TODO
        // - Any action phase +hp buff for end of action phase
        // - Actual end of regroup phase (some double BHQ in the regroup phase shenanigans)
        // - If you are prompted for an opponent effect and want to undo the choice, need a good timepoint for that
    });
});
