
describe('Snapshot types', function() {
    undoIntegration(function(contextRef) {
        describe('Action snapshots', function() {
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

                // starting state:
                // p1Base damage: 0
                // p2Base damage: 0
                // Battlefield Marine in hand
                // Death Trooper in hand
                // No damage on units

                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                // state after pre-history actions (P2 action -2 offset):
                // p1Base damage: 0
                // p2Base damage: 2
                // Battlefield Marine in play
                // Death Trooper in hand
                // No damage on units

                context.p2Action1SnapshotId = contextRef.snapshot.currentSnapshotId;
                context.p2Action1ActionId = contextRef.snapshot.currentSnapshottedAction;

                context.player2.clickCard(context.superlaserTechnician);
                context.player2.clickCard(context.p1Base);

                // state after P2 first action (P1 action -2 offset):
                // p1Base damage: 2
                // p2Base damage: 2
                // Battlefield Marine in play
                // Death Trooper in hand
                // No damage on units

                context.p1Action1SnapshotId = contextRef.snapshot.currentSnapshotId;
                context.p1Action1ActionId = contextRef.snapshot.currentSnapshottedAction;

                // Play Death Trooper
                context.player1.clickCard(context.deathTrooper);

                // Choose Friendly
                context.player1.clickCard(context.deathTrooper);

                // Choose Enemy
                context.player1.clickCard(context.wampa);
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);

                // state after P1 first action (P2 action -1 offset):
                // p1Base damage: 2
                // p2Base damage: 2
                // Battlefield Marine in play
                // Death Trooper in play
                // Death Trooper damage: 2
                // Wampa damage: 2

                context.p2Action2SnapshotId = contextRef.snapshot.currentSnapshotId;
                context.p2Action2ActionId = contextRef.snapshot.currentSnapshottedAction;

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                // state after P2 first action (P1 action -1 offset):
                // p1Base damage: 6
                // p2Base damage: 2
                // Battlefield Marine in play
                // Death Trooper in play
                // Death Trooper damage: 2
                // Wampa damage: 2

                context.p1Action2SnapshotId = contextRef.snapshot.currentSnapshotId;
                context.p1Action2ActionId = contextRef.snapshot.currentSnapshottedAction;

                context.player1.clickCard(context.secretiveSage);
                context.player1.clickCard(context.p2Base);

                // state after P1 second action (P2 action 0 offset):
                // p1Base damage: 6
                // p2Base damage: 4
                // Battlefield Marine in play
                // Death Trooper in play
                // Death Trooper damage: 2
                // Wampa damage: 2

                context.p2Action3SnapshotId = contextRef.snapshot.currentSnapshotId;
                context.p2Action3ActionId = contextRef.snapshot.currentSnapshottedAction;

                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.p1Base);

                // state after P2 second action (P1 action 0 offset):
                // p1Base damage: 8
                // p2Base damage: 4
                // Battlefield Marine in play
                // Death Trooper in play
                // Death Trooper damage: 2
                // Wampa damage: 2

                context.finalSnapshotId = contextRef.snapshot.currentSnapshotId;
                context.finalActionId = contextRef.snapshot.currentSnapshottedAction;
            });

            const assertP1Action1State = (context) => {
                expect(contextRef.snapshot.currentSnapshotId).toEqual(context.p1Action1SnapshotId);
                expect(contextRef.snapshot.currentSnapshottedAction).toEqual(context.p1Action1ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('hand');
                expect(context.wampa.damage).toEqual(0);
                expect(context.p1Base.damage).toEqual(2);
                expect(context.p2Base.damage).toEqual(2);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(1);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(1);
            };

            const assertP1Action2State = (context) => {
                expect(contextRef.snapshot.currentSnapshotId).toEqual(context.p1Action2SnapshotId);
                expect(contextRef.snapshot.currentSnapshottedAction).toEqual(context.p1Action2ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(6);
                expect(context.p2Base.damage).toEqual(2);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(2);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(2);
            };

            const assertP1Action3State = (context) => {
                expect(contextRef.snapshot.currentSnapshotId).toEqual(context.p1Action2SnapshotId);
                expect(contextRef.snapshot.currentSnapshottedAction).toEqual(context.p1Action2ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(8);
                expect(context.p2Base.damage).toEqual(4);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(3);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(3);
            };

            const assertP2Action1State = (context) => {
                expect(contextRef.snapshot.currentSnapshotId).toEqual(context.p2Action1SnapshotId);
                expect(contextRef.snapshot.currentSnapshottedAction).toEqual(context.p2Action1ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('hand');
                expect(context.wampa.damage).toEqual(0);
                expect(context.p1Base.damage).toEqual(0);
                expect(context.p2Base.damage).toEqual(2);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(0);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(1);
            };

            const assertP2Action2State = (context) => {
                expect(contextRef.snapshot.currentSnapshotId).toEqual(context.p2Action2SnapshotId);
                expect(contextRef.snapshot.currentSnapshottedAction).toEqual(context.p2Action2ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(2);
                expect(context.p2Base.damage).toEqual(2);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(1);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(2);
            };

            const assertP2Action3State = (context) => {
                expect(contextRef.snapshot.currentSnapshotId).toEqual(context.p2Action3SnapshotId);
                expect(contextRef.snapshot.currentSnapshottedAction).toEqual(context.p2Action3ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(6);
                expect(context.p2Base.damage).toEqual(4);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(2);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(3);
            };

            it('are counted correctly for both players', function () {
                const { context } = contextRef;

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(3);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(3);
            });

            it('can revert back two actions for the active player', function () {
                const { context } = contextRef;

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    offset: -2
                });

                assertP1Action1State(context);

                // repeat action to ensure we can continue from this point

                // Play Death Trooper
                context.player1.clickCard(context.deathTrooper);

                // Choose Friendly
                context.player1.clickCard(context.deathTrooper);

                // Choose Enemy
                context.player1.clickCard(context.wampa);
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
            });

            it('can revert back one action for the active player', function () {
                const { context } = contextRef;

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    offset: -1
                });

                assertP1Action2State(context);

                // repeat action to ensure we can continue from this point
                context.player1.clickCard(context.secretiveSage);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toEqual(4);
            });

            it('can revert back to beginning of current action for the active player', function () {
                const { context } = contextRef;

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    offset: 0
                });

                assertP1Action3State(context);

                // do a new action to ensure we can continue from this point
                context.player1.passAction();
                expect(context.player2).toBeActivePlayer();
            });

            it('will revert to beginning of current action as the default for the active player', function () {
                const { context } = contextRef;

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id
                });

                assertP1Action3State(context);

                // do a new action to ensure we can continue from this point
                context.player1.passAction();
                expect(context.player2).toBeActivePlayer();
            });

            it('cannot revert back more than two actions for the active player', function () {
                const { context } = contextRef;

                expect(() => {
                    contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        offset: -3
                    });
                }).toThrowError(Error, 'Contract assertion failure: Snapshot offset must be less than 1 and greater than than max history length (-3), got -3');
            });

            it('cannot revert back further than the total history for the active player (1 + 2)', function () {
                const { context } = contextRef;

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    offset: -1
                });

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    offset: -2
                });

                expect(rollbackResult).toBeFalse();

                assertP1Action2State(context);
            });

            it('cannot revert back further than the total history for the active player (2 + 1)', function () {
                const { context } = contextRef;

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    offset: -2
                });

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    offset: -1
                });

                expect(rollbackResult).toBeFalse();

                assertP1Action1State(context);
            });

            it('can revert back three actions for the non-active player', function () {
                const { context } = contextRef;

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    offset: -2
                });

                assertP2Action1State(context);

                // repeat action to ensure we can continue from this point
                context.player2.clickCard(context.superlaserTechnician);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toEqual(2);
            });

            it('can revert back two actions for the non-active player', function () {
                const { context } = contextRef;

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    offset: -1
                });

                assertP2Action2State(context);

                // repeat action to ensure we can continue from this point
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toEqual(6);
            });

            it('can revert back one action for the non-active player', function () {
                const { context } = contextRef;

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    offset: 0
                });

                assertP2Action3State(context);

                // repeat action to ensure we can continue from this point
                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toEqual(8);
            });

            it('can revert back one action for the non-active player as the default', function () {
                const { context } = contextRef;

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id
                });

                assertP2Action3State(context);

                // repeat action to ensure we can continue from this point
                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toEqual(8);
            });

            it('cannot revert back more than three actions for the non-active player', function () {
                const { context } = contextRef;

                expect(() => {
                    contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        offset: -3
                    });
                }).toThrowError(Error, 'Contract assertion failure: Snapshot offset must be less than 1 and greater than than max history length (-3), got -3');
            });

            it('cannot revert back further than the total history for the non-active player (1 + 2)', function () {
                const { context } = contextRef;

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    offset: -1
                });

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    offset: -2
                });

                expect(rollbackResult).toBeFalse();

                assertP2Action2State(context);
            });

            it('cannot revert back further than the total history for the non-active player (2 + 1)', function () {
                const { context } = contextRef;

                contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    offset: -2
                });

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    offset: -1
                });

                expect(rollbackResult).toBeFalse();

                assertP2Action1State(context);
            });
        });
    });

    // TODO THIS PR:
    // - undo to furthest-back action, walk through the whole phase again, then undo again
    // - confirm that rollbacks of different types (action, manual, phase) will remove newer snapshots of other types
    // - test the current round and current phase snapshots
    // - test some manual snapshots

    // TODO: test going to beginning of current action when there are open prompts of different types. maybe different test file
});
