describe('Start / end of phase snapshots', function() {
    undoIntegration(function(contextRef) {
        describe('Effects at the start of the regroup phase', function () {
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

            it('should create a quick rollback point for the prompted player, available immediately', function () {
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
    });
});