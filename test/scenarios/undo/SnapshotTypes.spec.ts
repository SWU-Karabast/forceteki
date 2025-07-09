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

                context.p2Action1SnapshotId = contextRef.currentSnapshotId;
                context.p2Action1ActionId = contextRef.currentSnapshottedAction;

                context.player2.clickCard(context.superlaserTechnician);
                context.player2.clickCard(context.p1Base);

                // state after P2 first action (P1 action -2 offset):
                // p1Base damage: 2
                // p2Base damage: 2
                // Battlefield Marine in play
                // Death Trooper in hand
                // No damage on units

                context.p1Action1SnapshotId = contextRef.currentSnapshotId;
                context.p1Action1ActionId = contextRef.currentSnapshottedAction;

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

                context.p2Action2SnapshotId = contextRef.currentSnapshotId;
                context.p2Action2ActionId = contextRef.currentSnapshottedAction;

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                // state after P2 first action (P1 action -1 offset):
                // p1Base damage: 6
                // p2Base damage: 2
                // Battlefield Marine in play
                // Death Trooper in play
                // Death Trooper damage: 2
                // Wampa damage: 2

                context.p1Action2SnapshotId = contextRef.currentSnapshotId;
                context.p1Action2ActionId = contextRef.currentSnapshottedAction;

                context.player1.clickCard(context.secretiveSage);
                context.player1.clickCard(context.p2Base);

                // state after P1 second action (P2 action 0 offset):
                // p1Base damage: 6
                // p2Base damage: 4
                // Battlefield Marine in play
                // Death Trooper in play
                // Death Trooper damage: 2
                // Wampa damage: 2

                context.p2Action3SnapshotId = contextRef.currentSnapshotId;
                context.p2Action3ActionId = contextRef.currentSnapshottedAction;

                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.p1Base);

                // state after P2 second action (P1 action 0 offset):
                // p1Base damage: 8
                // p2Base damage: 4
                // Battlefield Marine in play
                // Death Trooper in play
                // Death Trooper damage: 2
                // Wampa damage: 2

                context.finalSnapshotId = contextRef.currentSnapshotId;
                context.finalActionId = contextRef.currentSnapshottedAction;
            });

            it('can revert back two actions for the active player', function () {
                const { context } = contextRef;

                contextRef.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    offset: -2
                });

                expect(contextRef.currentSnapshotId).toEqual(context.p1Action1SnapshotId);
                expect(contextRef.currentSnapshottedAction).toEqual(context.p1Action1ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('hand');
                expect(context.wampa.damage).toEqual(0);
                expect(context.p1Base.damage).toEqual(2);
                expect(context.p2Base.damage).toEqual(2);
            });

            it('can revert back one action for the active player', function () {
                const { context } = contextRef;

                contextRef.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    offset: -1
                });

                expect(contextRef.currentSnapshotId).toEqual(context.p1Action2SnapshotId);
                expect(contextRef.currentSnapshottedAction).toEqual(context.p1Action2ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(6);
                expect(context.p2Base.damage).toEqual(2);
            });

            it('can revert back to beginning of current action for the active player', function () {
                const { context } = contextRef;

                contextRef.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    offset: 0
                });

                expect(contextRef.currentSnapshotId).toEqual(context.p1Action2SnapshotId);
                expect(contextRef.currentSnapshottedAction).toEqual(context.p1Action2ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(8);
                expect(context.p2Base.damage).toEqual(4);
            });

            it('will revert to beginning of current action as the default for the active player', function () {
                const { context } = contextRef;

                contextRef.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id
                });

                expect(contextRef.currentSnapshotId).toEqual(context.p1Action2SnapshotId);
                expect(contextRef.currentSnapshottedAction).toEqual(context.p1Action2ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(8);
                expect(context.p2Base.damage).toEqual(4);
            });

            it('cannot revert back more than two actions for the active player', function () {
                const { context } = contextRef;

                expect(() => {
                    contextRef.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        offset: -3
                    });
                }).toThrowError(Error, 'Contract assertion failure: Snapshot offset must be less than 1 and greater than than max history length (-3), got -3');
            });

            it('can revert back three actions for the non-active player', function () {
                const { context } = contextRef;

                contextRef.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    offset: -2
                });

                expect(contextRef.currentSnapshotId).toEqual(context.p2Action1SnapshotId);
                expect(contextRef.currentSnapshottedAction).toEqual(context.p2Action1ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('hand');
                expect(context.wampa.damage).toEqual(0);
                expect(context.p1Base.damage).toEqual(0);
                expect(context.p2Base.damage).toEqual(2);
            });

            it('can revert back two actions for the non-active player', function () {
                const { context } = contextRef;

                contextRef.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    offset: -1
                });

                expect(contextRef.currentSnapshotId).toEqual(context.p2Action2SnapshotId);
                expect(contextRef.currentSnapshottedAction).toEqual(context.p2Action2ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(2);
                expect(context.p2Base.damage).toEqual(2);
            });

            it('can revert back one action for the non-active player', function () {
                const { context } = contextRef;

                contextRef.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    offset: 0
                });

                expect(contextRef.currentSnapshotId).toEqual(context.p2Action3SnapshotId);
                expect(contextRef.currentSnapshottedAction).toEqual(context.p2Action3ActionId);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(6);
                expect(context.p2Base.damage).toEqual(4);
            });

            it('cannot revert back more than three actions for the non-active player', function () {
                const { context } = contextRef;

                expect(() => {
                    contextRef.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        offset: -3
                    });
                }).toThrowError(Error, 'Contract assertion failure: Snapshot offset must be less than 1 and greater than than max history length (-3), got -3');
            });
        });
    });
});
