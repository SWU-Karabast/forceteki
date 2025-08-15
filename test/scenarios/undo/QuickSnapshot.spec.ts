describe('Quick snapshots', function() {
    undoIntegration(function(contextRef) {
        describe('During action phase - basic functionality', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['death-trooper'],
                        groundArena: ['secretive-sage'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: ['tieln-fighter'],
                        hand: ['battlefield-marine'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Create action sequence similar to SnapshotTypes.spec.ts
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.superlaserTechnician);
                context.player2.clickCard(context.p1Base);

                // Play Death Trooper
                context.player1.clickCard(context.deathTrooper);
                // Choose Friendly
                context.player1.clickCard(context.deathTrooper);
                // Choose Enemy
                context.player1.clickCard(context.wampa);
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.secretiveSage);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.p1Base);
            });

            const assertP1FinalState = (context) => {
                expect(context.p1Base.damage).toBe(8);
                expect(context.p2Base.damage).toBe(4);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
            };

            const assertP1Action2State = (context) => {
                expect(context.p1Base.damage).toBe(6);
                expect(context.p2Base.damage).toBe(2);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
            };

            const assertP2Action2State = (context) => {
                expect(context.p1Base.damage).toBe(6);
                expect(context.p2Base.damage).toBe(4);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
            };

            it('can perform quick rollback to most recent action snapshot for active player', function () {
                const { context } = contextRef;

                // Verify final state
                assertP1FinalState(context);

                // Perform quick rollback for P1 (active player) - should go to beginning of P1's last action
                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1Object.id
                });

                expect(rollbackResult).toBe(true);
                assertP2Action2State(context);
            });

            it('can perform quick rollback to most recent action snapshot for non-active player', function () {
                const { context } = contextRef;

                // Verify final state
                assertP1FinalState(context);

                // Perform quick rollback for P2 (non-active player) - should go to beginning of P2's last action
                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player2Object.id
                });

                expect(rollbackResult).toBe(true);
                assertP1Action2State(context);
            });

            it('handles case where no action snapshots are available but regroup snapshot matches', function () {
                const { context } = contextRef;

                // Move to regroup phase to create regroup snapshot
                context.moveToRegroupPhase();

                // Clear action snapshots by moving to next action phase and doing many actions
                context.skipRegroupPhase();

                // Do enough actions to clear old action snapshots (more than max of 3)
                for (let i = 0; i < 4; i++) {
                    context.player2.clickPrompt('Pass');
                    context.player1.clickPrompt('Pass');
                }

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1Object.id
                });

                // Should succeed by rolling back to regroup snapshot
                expect(rollbackResult).toBe(true);
            });

            it('returns failure when no snapshots are available', async function () {
                // Start fresh game without any actions to have minimal snapshots
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['death-trooper'] },
                    player2: { groundArena: ['wampa'], hasInitiative: true }
                });

                const { context } = contextRef;

                // Store initial state
                const initialP1BaseDamage = context.p1Base.damage;
                const initialP2BaseDamage = context.p2Base.damage;

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1Object.id
                });

                // Should fail since no previous actions to rollback to
                expect(rollbackResult).toBe(false);

                // Game state should be unchanged
                expect(context.p1Base.damage).toBe(initialP1BaseDamage);
                expect(context.p2Base.damage).toBe(initialP2BaseDamage);
            });
        });

        describe('During regroup phase - priority override', function() {
            describe('with regroup phase between actions', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['death-trooper'],
                            groundArena: ['secretive-sage']
                        },
                        player2: {
                            groundArena: ['wampa'],
                            hasInitiative: true
                        }
                    });

                    const { context } = contextRef;

                    // P2 action 1
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    // P1 action 1
                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.deathTrooper); // choose friendly
                    context.player1.clickCard(context.wampa); // choose enemy target
                    expect(context.deathTrooper.damage).toBe(2);
                    expect(context.wampa.damage).toBe(2);

                    // Move to regroup phase
                    context.moveToRegroupPhase();
                });

                const assertRegroupPhaseState = (context) => {
                    expect(context.game.currentPhase).toBe('regroup');
                    expect(context.p1Base.damage).toBe(4);
                    expect(context.p2Base.damage).toBe(0);
                    expect(context.deathTrooper.damage).toBe(2);
                    expect(context.wampa.damage).toBe(2);
                };

                it('always rolls back to regroup snapshot ignoring available action snapshots', function () {
                    const { context } = contextRef;

                    assertRegroupPhaseState(context);

                    // Verify we have action snapshots available
                    expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1Object.id)).toBeGreaterThan(0);
                    expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2Object.id)).toBeGreaterThan(0);

                    // Quick rollback should ignore action snapshots and use regroup
                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });

                    expect(rollbackResult).toBe(true);
                    // Should still be in regroup phase, rolled back to beginning of regroup
                    expect(context.game.currentPhase).toBe('regroup');
                });

                it('rolls back to regroup after multiple quick undos exhaust action history', function () {
                    const { context } = contextRef;

                    assertRegroupPhaseState(context);

                    // Multiple quick rollbacks should all go to regroup snapshot
                    for (let i = 0; i < 3; i++) {
                        const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                            type: 'quick',
                            playerId: context.player1Object.id
                        });
                        expect(rollbackResult).toBe(true);
                        expect(context.game.currentPhase).toBe('regroup');
                    }
                });
            });

            describe('with regroup phase just before action sequence', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['death-trooper'],
                            groundArena: ['secretive-sage']
                        },
                        player2: {
                            groundArena: ['wampa'],
                            hasInitiative: true
                        }
                    });

                    const { context } = contextRef;

                    // First regroup phase
                    context.moveToNextActionPhase();

                    // Action sequence in new round
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.wampa);

                    context.player2.clickPrompt('Pass');
                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);

                    // Second regroup phase (current)
                    context.moveToRegroupPhase();
                });

                it('rolls back to most recent regroup snapshot', function () {
                    const { context } = contextRef;

                    expect(context.game.currentPhase).toBe('regroup');

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });

                    expect(rollbackResult).toBe(true);
                    // Should roll back to beginning of current regroup, not the older one
                    expect(context.game.currentPhase).toBe('regroup');
                });

                it('cannot reach older regroup snapshot through multiple quick undos', function () {
                    const { context } = contextRef;

                    expect(context.game.currentPhase).toBe('regroup');

                    // Multiple rollbacks should stay at most recent regroup
                    for (let i = 0; i < 5; i++) {
                        const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                            type: 'quick',
                            playerId: context.player1Object.id
                        });
                        expect(rollbackResult).toBe(true);
                        expect(context.game.currentPhase).toBe('regroup');
                    }
                });
            });

            it('rolls back to most recent regroup when older regroup is beyond action history', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['death-trooper', 'battlefield-marine'],
                        groundArena: ['secretive-sage']
                    },
                    player2: {
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: ['tieln-fighter'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Create old regroup phase
                context.moveToNextActionPhase();

                // Create many actions (more than max history of 3)
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.deathTrooper);
                context.player1.clickCard(context.deathTrooper);
                context.player1.clickCard(context.wampa);

                context.player2.clickCard(context.superlaserTechnician);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.secretiveSage);
                context.player1.clickCard(context.p2Base);

                // Create recent regroup phase
                context.moveToNextActionPhase();

                // More actions, then final regroup
                context.player2.clickPrompt('Pass');
                context.player1.clickPrompt('Pass');
                context.moveToRegroupPhase();

                expect(context.game.currentPhase).toBe('regroup');

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1Object.id
                });

                expect(rollbackResult).toBe(true);
                // Should use most recent regroup, not the very old one
                expect(context.game.currentPhase).toBe('regroup');
            });
        });

        it('rolls back to regroup snapshot when action is from previous round', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['death-trooper'],
                    groundArena: ['secretive-sage']
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // Create actions in round 1
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            context.player1.clickCard(context.deathTrooper);
            context.player1.clickCard(context.deathTrooper);
            context.player1.clickCard(context.wampa);

            // Move through complete round cycle to next action phase
            context.moveToNextActionPhase();

            // Create new actions in round 2
            context.player2.clickPrompt('Pass');
            context.player1.clickCard(context.secretiveSage);
            context.player1.clickCard(context.p2Base);

            // Now we're in round 2, with action snapshots from round 1 still available
            // Quick rollback should prefer regroup snapshot over previous round action
            const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                type: 'quick',
                playerId: context.player2Object.id
            });

            expect(rollbackResult).toBe(true);
            // Should have rolled back to regroup snapshot, not previous round action
        });

        describe('Integration testing', function() {
            describe('multiple sequential quick rollbacks', function() {
                it('can perform multiple sequential quick rollbacks in same action phase', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['death-trooper'],
                            groundArena: ['secretive-sage', 'battlefield-marine']
                        },
                        player2: {
                            groundArena: ['wampa'],
                            hasInitiative: true
                        }
                    });

                    const { context } = contextRef;

                    // Create action sequence suitable for 3 sequential rollbacks
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.wampa);

                    context.player2.clickPrompt('Pass');

                    context.player1.clickCard(context.battlefieldMarine);

                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);

                    // Test 3 sequential Quick rollbacks within action phase
                    for (let i = 0; i < 3; i++) {
                        const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                            type: 'quick',
                            playerId: context.player1Object.id
                        });
                        expect(rollbackResult).toBe(true);
                        expect(context.game.currentPhase).toBe('action');
                    }
                });

                it('can perform multiple sequential quick rollbacks across regroup phase boundary', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['death-trooper'],
                            groundArena: ['secretive-sage']
                        },
                        player2: {
                            groundArena: ['wampa'],
                            hasInitiative: true
                        }
                    });

                    const { context } = contextRef;

                    // Create action -> regroup -> action sequence
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.wampa);

                    context.moveToNextActionPhase();

                    context.player2.clickPrompt('Pass');
                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);

                    // Test Quick rollbacks that span action→regroup→action
                    let rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);

                    rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);
                });

                it('can perform multiple sequential quick rollbacks with mixed snapshot types', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['death-trooper'],
                            groundArena: ['secretive-sage']
                        },
                        player2: {
                            groundArena: ['wampa'],
                            hasInitiative: true
                        }
                    });

                    const { context } = contextRef;

                    // Create complex sequence with different snapshot types
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.wampa);

                    context.moveToRegroupPhase(); // Creates regroup snapshot
                    context.skipRegroupPhase();   // Creates new action snapshots

                    context.player2.clickPrompt('Pass');
                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);

                    // Test sequential Quick rollbacks - should get different snapshot types
                    let rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);

                    rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);

                    rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);
                });
            });

            describe('complex scenarios', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['death-trooper', 'battlefield-marine'],
                            groundArena: ['secretive-sage']
                        },
                        player2: {
                            groundArena: ['wampa', 'superlaser-technician'],
                            hasInitiative: true
                        }
                    });

                    const { context } = contextRef;

                    // Create multi-round scenario with various snapshot types and phases
                    // Round 1
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.wampa);

                    // Move to regroup and next action phase (Round 2)
                    context.moveToNextActionPhase();

                    context.player2.clickCard(context.superlaserTechnician);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.battlefieldMarine);

                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);

                    // Move to regroup and next action phase (Round 3)
                    context.moveToNextActionPhase();
                });

                it('handles complex multi-round scenario with mixed snapshots', function () {
                    const { context } = contextRef;

                    // We should be in Round 3 action phase
                    expect(context.game.currentPhase).toBe('action');

                    // Quick rollback should work correctly with complex history
                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });

                    expect(rollbackResult).toBe(true);
                });

                it('handles transition from action phase to regroup phase behavior', function () {
                    const { context } = contextRef;

                    // Start in action phase
                    expect(context.game.currentPhase).toBe('action');

                    // Quick rollback in action phase
                    let rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);

                    // Move to regroup phase
                    context.moveToRegroupPhase();
                    expect(context.game.currentPhase).toBe('regroup');

                    // Quick rollback in regroup phase should behave differently
                    rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);
                    expect(context.game.currentPhase).toBe('regroup');
                });
            });
        });
    });
});
    undoIntegration(function(contextRef) {
        describe('During action phase - basic functionality', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['death-trooper'],
                        groundArena: ['secretive-sage'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: ['tieln-fighter'],
                        hand: ['battlefield-marine'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Create action sequence similar to SnapshotTypes.spec.ts
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.superlaserTechnician);
                context.player2.clickCard(context.p1Base);

                // Play Death Trooper
                context.player1.clickCard(context.deathTrooper);
                // Choose Friendly
                context.player1.clickCard(context.deathTrooper);
                // Choose Enemy
                context.player1.clickCard(context.wampa);
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.secretiveSage);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.p1Base);
            });

            const assertP1FinalState = (context) => {
                expect(context.p1Base.damage).toBe(8);
                expect(context.p2Base.damage).toBe(4);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
            };

            const assertP1Action2State = (context) => {
                expect(context.p1Base.damage).toBe(6);
                expect(context.p2Base.damage).toBe(2);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
            };

            const assertP2Action2State = (context) => {
                expect(context.p1Base.damage).toBe(6);
                expect(context.p2Base.damage).toBe(4);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
            };

            it('can perform quick rollback to most recent action snapshot for active player', function () {
                const { context } = contextRef;

                // Verify final state
                assertP1FinalState(context);

                // Perform quick rollback for P1 (active player) - should go to beginning of P1's last action
                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1Object.id
                });

                expect(rollbackResult).toBe(true);
                assertP2Action2State(context);
            });

            it('can perform quick rollback to most recent action snapshot for non-active player', function () {
                const { context } = contextRef;

                // Verify final state
                assertP1FinalState(context);

                // Perform quick rollback for P2 (non-active player) - should go to beginning of P2's last action
                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player2Object.id
                });

                expect(rollbackResult).toBe(true);
                assertP1Action2State(context);
            });

            it('handles case where no action snapshots are available but regroup snapshot matches', function () {
                const { context } = contextRef;

                // Move to regroup phase to create regroup snapshot
                context.moveToRegroupPhase();

                // Clear action snapshots by moving to next action phase and doing many actions
                context.skipRegroupPhase();

                // Do enough actions to clear old action snapshots (more than max of 3)
                for (let i = 0; i < 4; i++) {
                    context.player2.clickPrompt('Pass');
                    context.player1.clickPrompt('Pass');
                }

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1Object.id
                });

                // Should succeed by rolling back to regroup snapshot
                expect(rollbackResult).toBe(true);
            });

            it('returns failure when no snapshots are available', function () {
                const { context } = contextRef;

                // Start fresh game without any actions to have minimal snapshots
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['death-trooper'] },
                    player2: { groundArena: ['wampa'], hasInitiative: true }
                });

                // Store initial state
                const initialP1BaseDamage = context.p1Base.damage;
                const initialP2BaseDamage = context.p2Base.damage;

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1Object.id
                });

                // Should fail
                expect(rollbackResult).toBe(false);

                // Game state should be unchanged
                expect(context.p1Base.damage).toBe(initialP1BaseDamage);
                expect(context.p2Base.damage).toBe(initialP2BaseDamage);
            });
        });

        describe('During regroup phase - priority override', function() {
            describe('with regroup phase between actions', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['death-trooper'],
                            groundArena: ['secretive-sage']
                        },
                        player2: {
                            groundArena: ['wampa'],
                            hasInitiative: true
                        }
                    });

                    const { context } = contextRef;

                    // P2 action 1
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    // P1 action 1
                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.deathTrooper); // choose friendly
                    context.player1.clickCard(context.wampa); // choose enemy target
                    expect(context.deathTrooper.damage).toBe(2);
                    expect(context.wampa.damage).toBe(2);

                    // Move to regroup phase
                    context.moveToRegroupPhase();
                });

                const assertRegroupPhaseState = (context) => {
                    expect(context.game.currentPhase).toBe('regroup');
                    expect(context.p1Base.damage).toBe(4);
                    expect(context.p2Base.damage).toBe(0);
                    expect(context.deathTrooper.damage).toBe(2);
                    expect(context.wampa.damage).toBe(2);
                };

                it('always rolls back to regroup snapshot ignoring available action snapshots', function () {
                    const { context } = contextRef;

                    assertRegroupPhaseState(context);

                    // Verify we have action snapshots available
                    expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1Object.id)).toBeGreaterThan(0);
                    expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2Object.id)).toBeGreaterThan(0);

                    // Quick rollback should ignore action snapshots and use regroup
                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });

                    expect(rollbackResult).toBe(true);
                    // Should still be in regroup phase, rolled back to beginning of regroup
                    expect(context.game.currentPhase).toBe('regroup');
                });

                it('rolls back to regroup after multiple quick undos exhaust action history', function () {
                    const { context } = contextRef;

                    assertRegroupPhaseState(context);

                    // Multiple quick rollbacks should all go to regroup snapshot
                    for (let i = 0; i < 3; i++) {
                        const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                            type: 'quick',
                            playerId: context.player1Object.id
                        });
                        expect(rollbackResult).toBe(true);
                        expect(context.game.currentPhase).toBe('regroup');
                    }
                });
            });

            describe('with regroup phase just before action sequence', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['death-trooper'],
                            groundArena: ['secretive-sage']
                        },
                        player2: {
                            groundArena: ['wampa'],
                            hasInitiative: true
                        }
                    });

                    const { context } = contextRef;

                    // First regroup phase
                    context.moveToNextActionPhase();

                    // Action sequence in new round
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.wampa);

                    context.player2.clickPrompt('Pass');
                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);

                    // Second regroup phase (current)
                    context.moveToRegroupPhase();
                });

                it('rolls back to most recent regroup snapshot', function () {
                    const { context } = contextRef;

                    expect(context.game.currentPhase).toBe('regroup');

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });

                    expect(rollbackResult).toBe(true);
                    // Should roll back to beginning of current regroup, not the older one
                    expect(context.game.currentPhase).toBe('regroup');
                });

                it('cannot reach older regroup snapshot through multiple quick undos', function () {
                    const { context } = contextRef;

                    expect(context.game.currentPhase).toBe('regroup');

                    // Multiple rollbacks should stay at most recent regroup
                    for (let i = 0; i < 5; i++) {
                        const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                            type: 'quick',
                            playerId: context.player1Object.id
                        });
                        expect(rollbackResult).toBe(true);
                        expect(context.game.currentPhase).toBe('regroup');
                    }
                });
            });

            it('rolls back to most recent regroup when older regroup is beyond action history', function () {
                const { context } = contextRef;

                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['death-trooper', 'battlefield-marine'],
                        groundArena: ['secretive-sage']
                    },
                    player2: {
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: ['tieln-fighter'],
                        hasInitiative: true
                    }
                });

                // Create old regroup phase
                context.moveToNextActionPhase();

                // Create many actions (more than max history of 3)
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.deathTrooper);
                context.player1.clickCard(context.deathTrooper);
                context.player1.clickCard(context.wampa);

                context.player2.clickCard(context.superlaserTechnician);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.secretiveSage);
                context.player1.clickCard(context.p2Base);

                // Create recent regroup phase
                context.moveToNextActionPhase();

                // More actions, then final regroup
                context.player2.clickPrompt('Pass');
                context.player1.clickPrompt('Pass');
                context.moveToRegroupPhase();

                expect(context.game.currentPhase).toBe('regroup');

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1Object.id
                });

                expect(rollbackResult).toBe(true);
                // Should use most recent regroup, not the very old one
                expect(context.game.currentPhase).toBe('regroup');
            });
        });

        it('rolls back to regroup snapshot when action is from previous round', function () {
            const { context } = contextRef;

            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['death-trooper'],
                    groundArena: ['secretive-sage']
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true
                }
            });

            // Create actions in round 1
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            context.player1.clickCard(context.deathTrooper);
            context.player1.clickCard(context.deathTrooper);
            context.player1.clickCard(context.wampa);

            // Move through complete round cycle to next action phase
            context.moveToNextActionPhase();

            // Create new actions in round 2
            context.player2.clickPrompt('Pass');
            context.player1.clickCard(context.secretiveSage);
            context.player1.clickCard(context.p2Base);

            // Now we're in round 2, with action snapshots from round 1 still available
            // Quick rollback should prefer regroup snapshot over previous round action
            const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                type: 'quick',
                playerId: context.player2Object.id
            });

            expect(rollbackResult).toBe(true);
            // Should have rolled back to regroup snapshot, not previous round action
        });

        describe('Integration testing', function() {
            describe('multiple sequential quick rollbacks', function() {
                it('can perform multiple sequential quick rollbacks in same action phase', function () {
                    const { context } = contextRef;

                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['death-trooper'],
                            groundArena: ['secretive-sage', 'battlefield-marine']
                        },
                        player2: {
                            groundArena: ['wampa'],
                            hasInitiative: true
                        }
                    });

                    // Create action sequence suitable for 3 sequential rollbacks
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.wampa);

                    context.player2.clickPrompt('Pass');

                    context.player1.clickCard(context.battlefieldMarine);

                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);

                    // Test 3 sequential Quick rollbacks within action phase
                    for (let i = 0; i < 3; i++) {
                        const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                            type: 'quick',
                            playerId: context.player1Object.id
                        });
                        expect(rollbackResult).toBe(true);
                        expect(context.game.currentPhase).toBe('action');
                    }
                });

                it('can perform multiple sequential quick rollbacks across regroup phase boundary', function () {
                    const { context } = contextRef;

                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['death-trooper'],
                            groundArena: ['secretive-sage']
                        },
                        player2: {
                            groundArena: ['wampa'],
                            hasInitiative: true
                        }
                    });

                    // Create action -> regroup -> action sequence
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.wampa);

                    context.moveToNextActionPhase();

                    context.player2.clickPrompt('Pass');
                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);

                    // Test Quick rollbacks that span action→regroup→action
                    let rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);

                    rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);
                });

                it('can perform multiple sequential quick rollbacks with mixed snapshot types', function () {
                    const { context } = contextRef;

                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['death-trooper'],
                            groundArena: ['secretive-sage']
                        },
                        player2: {
                            groundArena: ['wampa'],
                            hasInitiative: true
                        }
                    });

                    // Create complex sequence with different snapshot types
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.wampa);

                    context.moveToRegroupPhase(); // Creates regroup snapshot
                    context.skipRegroupPhase();   // Creates new action snapshots

                    context.player2.clickPrompt('Pass');
                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);

                    // Test sequential Quick rollbacks - should get different snapshot types
                    let rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);

                    rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);

                    rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);
                });
            });

            describe('complex scenarios', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['death-trooper', 'battlefield-marine'],
                            groundArena: ['secretive-sage']
                        },
                        player2: {
                            groundArena: ['wampa', 'superlaser-technician'],
                            hasInitiative: true
                        }
                    });

                    const { context } = contextRef;

                    // Create multi-round scenario with various snapshot types and phases
                    // Round 1
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.deathTrooper);
                    context.player1.clickCard(context.wampa);

                    // Move to regroup and next action phase (Round 2)
                    context.moveToNextActionPhase();

                    context.player2.clickCard(context.superlaserTechnician);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.battlefieldMarine);

                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);

                    // Move to regroup and next action phase (Round 3)
                    context.moveToNextActionPhase();
                });

                it('handles complex multi-round scenario with mixed snapshots', function () {
                    const { context } = contextRef;

                    // We should be in Round 3 action phase
                    expect(context.game.currentPhase).toBe('action');

                    // Quick rollback should work correctly with complex history
                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });

                    expect(rollbackResult).toBe(true);
                });

                it('handles transition from action phase to regroup phase behavior', function () {
                    const { context } = contextRef;

                    // Start in action phase
                    expect(context.game.currentPhase).toBe('action');

                    // Quick rollback in action phase
                    let rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);

                    // Move to regroup phase
                    context.moveToRegroupPhase();
                    expect(context.game.currentPhase).toBe('regroup');

                    // Quick rollback in regroup phase should behave differently
                    rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1Object.id
                    });
                    expect(rollbackResult).toBe(true);
                    expect(context.game.currentPhase).toBe('regroup');
                });
            });
        });
    });
});
