describe('Snapshot types', function() {
    undoIntegration(function(contextRef) {
        describe('During the setup phase,', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'setup',
                    player1: {
                        deck: ['armed-to-the-teeth',
                            'collections-starhopper',
                            'covert-strength',
                            'chewbacca#pykesbane',
                            'battlefield-marine',
                            'battlefield-marine',
                            'battlefield-marine',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                        ],
                    },
                    player2: {
                        deck: [
                            'moisture-farmer',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'wampa',
                            'atst',
                            'atst',
                        ],
                    }
                });

                const { context } = contextRef;

                // Determine the first player
                context.selectInitiativePlayer(context.player1);

                // Draw starting hands
                expect(context.player1.handSize).toBe(6);
                expect(context.player2.handSize).toBe(6);

                // Choose whether to take a mulligan
                context.player1.clickPrompt('Mulligan');
                context.player2.clickPrompt('Keep');

                // Resource two cards
                context.player1.clickFirstCardInHand();
                context.player1.clickCard(context.player1.hand[1]);
                context.player1.clickDone();
                context.player2.clickFirstCardInHand();
                context.player2.clickCard(context.player2.hand[1]);
                context.player2.clickDone();

                // Start of the action phase
                expect(context.player1).toBeActivePlayer();
                expect(context.player2).toHavePrompt('Waiting for opponent to take an action or pass');
            });

            const assertSetupPhaseStartState = (context) => {
                expect(context.game.initiativePlayer).toBeNull();
                expect(context.player1.handSize).toBe(0);
                expect(context.player2.handSize).toBe(0);
                expect(context.player1.deckSize).toBe(11);
                expect(context.player2.deckSize).toBe(11);
            };

            describe('phase snapshots', function () {
                it('can revert back to the beginning of the setup phase', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'phase',
                        phaseName: 'setup'
                    });
                    expect(rollbackResult).toBeTrue();

                    assertSetupPhaseStartState(context);

                    // Determine the first player
                    context.selectInitiativePlayer(context.player1);

                    // Draw starting hands
                    expect(context.player1.handSize).toBe(6);
                    expect(context.player2.handSize).toBe(6);
                });
            });
        });

        describe('During the action phase,', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['death-trooper', 'daring-raid'],
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

                contextRef.snapshot.takeManualSnapshot(context.player1Object);
                context.p1ManualSnapshot1Id = contextRef.snapshot.getCurrentSnapshotId();
                context.p1ManualSnapshot1ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                // state after pre-history actions (P2 action -2 offset):
                // p1Base damage: 0
                // p2Base damage: 2
                // Battlefield Marine in play
                // Death Trooper in hand
                // No damage on units

                context.p2Action1SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p2Action1ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.player2.clickCard(context.superlaserTechnician);
                context.player2.clickCard(context.p1Base);

                // state after P2 first action (P1 action -2 offset):
                // p1Base damage: 2
                // p2Base damage: 2
                // Battlefield Marine in play
                // Death Trooper in hand
                // No damage on units

                context.p1Action1SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p1Action1ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

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

                contextRef.snapshot.takeManualSnapshot(context.player2Object);
                context.p2ManualSnapshot1Id = contextRef.snapshot.getCurrentSnapshotId();
                context.p2ManualSnapshot1ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.p2Action2SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p2Action2ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                // state after P2 first action (P1 action -1 offset):
                // p1Base damage: 6
                // p2Base damage: 2
                // Battlefield Marine in play
                // Death Trooper in play
                // Death Trooper damage: 2
                // Wampa damage: 2

                context.p1Action2SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p1Action2ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.player1.clickCard(context.secretiveSage);
                context.player1.clickCard(context.p2Base);

                // state after P1 second action (P2 action 0 offset):
                // p1Base damage: 6
                // p2Base damage: 4
                // Battlefield Marine in play
                // Death Trooper in play
                // Death Trooper damage: 2
                // Wampa damage: 2

                context.p2Action3SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p2Action3ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.p1Base);

                // state after P2 second action (P1 action 0 offset):
                // p1Base damage: 8
                // p2Base damage: 4
                // Battlefield Marine in play
                // Death Trooper in play
                // Death Trooper damage: 2
                // Wampa damage: 2

                contextRef.snapshot.takeManualSnapshot(context.player1Object);
                context.p1ManualSnapshot2Id = contextRef.snapshot.getCurrentSnapshotId();
                context.p1ManualSnapshot2ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.p1Action3SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p1Action3ActionId = contextRef.snapshot.getCurrentSnapshottedAction();
            });

            const assertActionPhaseStartState = (context, checkManualSnapshots = true) => {
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(0);

                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.deathTrooper).toBeInZone('hand');
                expect(context.wampa.damage).toEqual(0);
                expect(context.p1Base.damage).toEqual(0);
                expect(context.p2Base.damage).toEqual(0);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(0);

                // one action snapshot is available for P2 because it was just taken after the rollback
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(1);

                if (checkManualSnapshots) {
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player1.id)).toEqual(0);
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player2.id)).toEqual(0);
                }
            };

            const assertP1Action1State = (context, snapshotId = null, checkManualSnapshots = true) => {
                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(snapshotId ?? context.p1Action1SnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p1Action1ActionId);

                expect(context.player1).toBeActivePlayer();

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('hand');
                expect(context.wampa.damage).toEqual(0);
                expect(context.p1Base.damage).toEqual(2);
                expect(context.p2Base.damage).toEqual(2);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(1);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(1);

                if (checkManualSnapshots) {
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player1.id)).toEqual(1);
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player2.id)).toEqual(0);
                }
            };

            const assertP1Action2State = (context, snapshotId = null, checkManualSnapshots = true) => {
                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(snapshotId ?? context.p1Action2SnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p1Action2ActionId);

                expect(context.player1).toBeActivePlayer();

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(6);
                expect(context.p2Base.damage).toEqual(2);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(2);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(2);

                if (checkManualSnapshots) {
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player1.id)).toEqual(1);
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player2.id)).toEqual(1);
                }
            };

            const assertP1Action3State = (context, snapshotId = null, checkManualSnapshots = true) => {
                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(snapshotId ?? context.p1Action3SnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p1Action3ActionId);

                expect(context.player1).toBeActivePlayer();

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(8);
                expect(context.p2Base.damage).toEqual(4);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(3);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(3);

                if (checkManualSnapshots) {
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player1.id)).toEqual(2);
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player2.id)).toEqual(1);
                }
            };

            const assertP2Action1State = (context, snapshotId = null, checkManualSnapshots = true) => {
                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(snapshotId ?? context.p2Action1SnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p2Action1ActionId);

                expect(context.player2).toBeActivePlayer();

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('hand');
                expect(context.wampa.damage).toEqual(0);
                expect(context.p1Base.damage).toEqual(0);
                expect(context.p2Base.damage).toEqual(2);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(0);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(1);

                if (checkManualSnapshots) {
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player1.id)).toEqual(1);
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player2.id)).toEqual(0);
                }
            };

            const assertP2Action2State = (context, snapshotId = null, checkManualSnapshots = true) => {
                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(snapshotId ?? context.p2Action2SnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p2Action2ActionId);

                expect(context.player2).toBeActivePlayer();

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(2);
                expect(context.p2Base.damage).toEqual(2);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(1);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(2);

                if (checkManualSnapshots) {
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player1.id)).toEqual(1);
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player2.id)).toEqual(1);
                }
            };

            const assertP2Action3State = (context, snapshotId = null, checkManualSnapshots = true) => {
                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(snapshotId ?? context.p2Action3SnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p2Action3ActionId);

                expect(context.player2).toBeActivePlayer();

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(6);
                expect(context.p2Base.damage).toEqual(4);

                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(2);
                expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(3);

                if (checkManualSnapshots) {
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player1.id)).toEqual(1);
                    expect(contextRef.snapshot.countAvailableManualSnapshots(context.player2.id)).toEqual(1);
                }
            };

            describe('action snapshots', function () {
                it('are counted correctly for both players', function () {
                    const { context } = contextRef;

                    expect(contextRef.snapshot.countAvailableActionSnapshots(context.player1.id)).toEqual(3);
                    expect(contextRef.snapshot.countAvailableActionSnapshots(context.player2.id)).toEqual(3);
                });

                it('can revert back two actions for the active player', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: -2
                    });
                    expect(rollbackResult).toBeTrue();

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

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: -1
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP1Action2State(context);

                    // repeat action to ensure we can continue from this point
                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toEqual(4);
                });

                it('can revert back to beginning of current action for the active player', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: 0
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP1Action3State(context);

                    // do a new action to ensure we can continue from this point
                    context.player1.passAction();
                    expect(context.player2).toBeActivePlayer();
                });

                it('will revert to beginning of current action as the default for the active player', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP1Action3State(context);

                    // do a new action to ensure we can continue from this point
                    context.player1.passAction();
                    expect(context.player2).toBeActivePlayer();
                });

                it('cannot attempt to revert back more than two actions for the active player', function () {
                    const { context } = contextRef;

                    expect(() => {
                        contextRef.snapshot.rollbackToSnapshot({
                            type: 'action',
                            playerId: context.player1.id,
                            actionOffset: -3
                        });
                    }).toThrowError(Error, 'Contract assertion failure: Snapshot offset must be less than 1 and greater than than max history length (-3), got -3');
                });

                it('cannot revert back further than the total history for the active player (1 + 2)', function () {
                    const { context } = contextRef;

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: -1
                    });
                    expect(rollbackResult1).toBeTrue();

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: -2
                    });
                    expect(rollbackResult2).toBeFalse();

                    assertP1Action2State(context);
                });

                it('cannot revert back further than the total history for the active player (2 + 1)', function () {
                    const { context } = contextRef;

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: -2
                    });
                    expect(rollbackResult1).toBeTrue();

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: -1
                    });
                    expect(rollbackResult2).toBeFalse();

                    assertP1Action1State(context);
                });

                it('can revert back three actions for the non-active player', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: -2
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP2Action1State(context);

                    // repeat action to ensure we can continue from this point
                    context.player2.clickCard(context.superlaserTechnician);
                    context.player2.clickCard(context.p1Base);
                    expect(context.p1Base.damage).toEqual(2);
                });

                it('can revert back two actions for the non-active player', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: -1
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP2Action2State(context);

                    // repeat action to ensure we can continue from this point
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);
                    expect(context.p1Base.damage).toEqual(6);
                });

                it('can revert back one action for the non-active player', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: 0
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP2Action3State(context);

                    // repeat action to ensure we can continue from this point
                    context.player2.clickCard(context.tielnFighter);
                    context.player2.clickCard(context.p1Base);
                    expect(context.p1Base.damage).toEqual(8);
                });

                it('can revert back one action for the non-active player as the default', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP2Action3State(context);

                    // repeat action to ensure we can continue from this point
                    context.player2.clickCard(context.tielnFighter);
                    context.player2.clickCard(context.p1Base);
                    expect(context.p1Base.damage).toEqual(8);
                });

                it('cannot attempt to revert back more than three actions for the non-active player', function () {
                    const { context } = contextRef;

                    expect(() => {
                        contextRef.snapshot.rollbackToSnapshot({
                            type: 'action',
                            playerId: context.player2.id,
                            actionOffset: -3
                        });
                    }).toThrowError(Error, 'Contract assertion failure: Snapshot offset must be less than 1 and greater than than max history length (-3), got -3');
                });

                it('cannot revert back further than the total history for the non-active player (1 + 2)', function () {
                    const { context } = contextRef;

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: -1
                    });
                    expect(rollbackResult1).toBeTrue();

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: -2
                    });
                    expect(rollbackResult2).toBeFalse();

                    assertP2Action2State(context);
                });

                it('cannot revert back further than the total history for the non-active player (2 + 1)', function () {
                    const { context } = contextRef;

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: -2
                    });
                    expect(rollbackResult1).toBeTrue();

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: -1
                    });
                    expect(rollbackResult2).toBeFalse();

                    assertP2Action1State(context);
                });

                it('can undo to earliest available action for the active player, repeat the actions, then undo again', function () {
                    const { context } = contextRef;

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: -2
                    });
                    expect(rollbackResult1).toBeTrue();

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

                    assertP1Action3State(context, contextRef.snapshot.getCurrentSnapshotId(), false);

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: -2
                    });
                    expect(rollbackResult2).toBeTrue();

                    assertP1Action1State(context, contextRef.snapshot.getCurrentSnapshotId(), false);
                });

                it('can undo to earliest available action for the non-active player, repeat the actions, then undo again', function () {
                    const { context } = contextRef;

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: -2
                    });
                    expect(rollbackResult1).toBeTrue();

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

                    assertP1Action3State(context, contextRef.snapshot.getCurrentSnapshotId(), false);

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: -2
                    });
                    expect(rollbackResult2).toBeTrue();

                    assertP2Action1State(context, contextRef.snapshot.getCurrentSnapshotId(), false);
                });

                it('can walk back through the action history, alternating player actions', function () {
                    const { context } = contextRef;

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: 0
                    });
                    expect(rollbackResult1).toBeTrue();

                    assertP2Action3State(context);

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: 0
                    });
                    expect(rollbackResult2).toBeTrue();

                    assertP1Action2State(context);

                    const rollbackResult3 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: 0
                    });
                    expect(rollbackResult3).toBeTrue();

                    assertP2Action2State(context);

                    const rollbackResult4 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: 0
                    });
                    expect(rollbackResult4).toBeTrue();

                    assertP1Action1State(context);

                    const rollbackResult5 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: 0
                    });
                    expect(rollbackResult5).toBeTrue();

                    assertP2Action1State(context);
                });
            });

            describe('quick snapshots', function () {
                it('are reported as available when there is an action snapshot available', function () {
                    const { context } = contextRef;

                    expect(contextRef.snapshot.hasAvailableQuickSnapshot(context.player1.id)).toBeTrue();
                    expect(contextRef.snapshot.hasAvailableQuickSnapshot(context.player2.id)).toBeTrue();
                });

                it('can revert back two actions for the active player', function () {
                    const { context } = contextRef;

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult1).toBeTrue();

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult2).toBeTrue();

                    assertP1Action1State(context);
                });

                it('will revert back one action for the active player when at the action window prompt', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP1Action2State(context);
                });

                it('will revert back to beginning of current action for the active player if a prompt is open', function () {
                    const { context } = contextRef;

                    // open target prompt for Daring Raid
                    context.player1.clickCard(context.daringRaid);

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP1Action3State(context);
                });

                it('cannot revert back further than the total history for the active player, and will report no quick undo available - but non-active player can still revert one more time', function () {
                    const { context } = contextRef;

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult1).toBeTrue();

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult2).toBeTrue();

                    assertP1Action1State(context);

                    expect(contextRef.snapshot.hasAvailableQuickSnapshot(context.player1.id)).toBeFalse();
                    const rollbackResult3 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult3).toBeFalse();

                    expect(contextRef.snapshot.hasAvailableQuickSnapshot(context.player2.id)).toBeTrue();
                    const rollbackResult4 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult4).toBeTrue();

                    assertP2Action1State(context);
                });

                it('can revert back three actions for the non-active player', function () {
                    const { context } = contextRef;

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult1).toBeTrue();

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult2).toBeTrue();

                    const rollbackResult3 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult3).toBeTrue();

                    assertP2Action1State(context);
                });

                it('can revert back two actions for the non-active player', function () {
                    const { context } = contextRef;

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult1).toBeTrue();

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult2).toBeTrue();

                    assertP2Action2State(context);
                });

                it('can revert back one action for the non-active player when the active player is still at the action window prompt', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP2Action3State(context);
                });

                it('can revert back one action for the non-active player when the active player has a prompt open', function () {
                    const { context } = contextRef;

                    // active opens prompt for Daring Raid targeting
                    context.player1.clickCard(context.daringRaid);

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP2Action3State(context);
                });

                it('after reverting back three actions for the non-active player, will report no quick undo available and will fail to quick undo further', function () {
                    const { context } = contextRef;

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult1).toBeTrue();

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult2).toBeTrue();

                    const rollbackResult3 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult3).toBeTrue();

                    // confirm that no more quick action snapshots are available
                    expect(contextRef.snapshot.hasAvailableQuickSnapshot(context.player2.id)).toBeFalse();
                    const rollbackResult4 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult4).toBeFalse();

                    assertP2Action1State(context);
                });

                it('can walk back through the action history, alternating player actions', function () {
                    const { context } = contextRef;

                    // player 1 clicks Daring Raid to open a prompt
                    context.player1.clickCard(context.daringRaid);

                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult1).toBeTrue();

                    assertP1Action3State(context);

                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult2).toBeTrue();

                    assertP2Action3State(context);

                    const rollbackResult3 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult3).toBeTrue();

                    assertP1Action2State(context);

                    const rollbackResult4 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult4).toBeTrue();

                    assertP2Action2State(context);

                    const rollbackResult5 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult5).toBeTrue();

                    assertP1Action1State(context);

                    const rollbackResult6 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult6).toBeTrue();

                    assertP2Action1State(context);
                });
            });

            describe('phase snapshots', function () {
                it('can revert back to the beginning of the current action phase', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'phase',
                        phaseName: 'action',
                        phaseOffset: 0
                    });
                    expect(rollbackResult).toBeTrue();

                    assertActionPhaseStartState(context);

                    // do a new action to ensure we can continue from this point
                    context.player2.clickCard(context.battlefieldMarine);
                });

                it('can revert back to the beginning of the current action phase as the default', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'phase',
                        phaseName: 'action'
                    });
                    expect(rollbackResult).toBeTrue();

                    assertActionPhaseStartState(context);

                    // do a new action to ensure we can continue from this point
                    context.player2.clickCard(context.battlefieldMarine);
                });

                it('cannot revert any player actions after rolling back to start of phase if there have been too many actions since start of phase', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'phase',
                        phaseName: 'action',
                        phaseOffset: 0
                    });
                    expect(rollbackResult).toBeTrue();

                    assertActionPhaseStartState(context);

                    const p1RollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: 0
                    });
                    expect(p1RollbackResult).toBeFalse();

                    // Player 2 should still be able to roll back to the start of current action since they're the active player
                    const p2RollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: 0
                    });
                    expect(p2RollbackResult).toBeTrue();
                });

                it('cannot attempt to revert back more than two phases', function () {
                    expect(() => {
                        contextRef.snapshot.rollbackToSnapshot({
                            type: 'phase',
                            phaseName: 'action',
                            phaseOffset: -2
                        });
                    }).toThrowError(Error, 'Contract assertion failure: Snapshot offset must be less than 1 and greater than than max history length (-2), got -2');
                });

                it('cannot revert back further than the available phase history', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'phase',
                        phaseName: 'action',
                        phaseOffset: -1
                    });
                    expect(rollbackResult).toBeFalse();

                    assertP1Action3State(context);
                });

                it('can revert back to the last action from the regroup phase for the active player', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: 0
                    });
                    expect(rollbackResult).toBeTrue();

                    expect(context.game.currentPhase).toEqual('action');

                    assertP2Action3State(context);

                    // do a new action to ensure we can continue from this point
                    context.player2.clickCard(context.tielnFighter);
                    context.player2.clickCard(context.p1Base);
                });

                it('can revert back to the last action from the regroup phase for the non-active player', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: 0
                    });
                    expect(rollbackResult).toBeTrue();

                    expect(context.game.currentPhase).toEqual('action');

                    assertP1Action3State(context);

                    // do a new action to ensure we can continue from this point
                    context.player1.claimInitiative();
                });
            });
        });

        describe('After multiple rounds,', function() {
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

                context.moveToRegroupPhase();

                context.regroupPhase1ManualSnapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                context.regroupPhase1ActionId = contextRef.snapshot.getCurrentSnapshottedAction();
                context.regroupPhase1SnapshotId = contextRef.snapshot.getCurrentSnapshotId();

                context.player2.clickDone();
                context.player1.clickDone();

                context.actionPhase2ActionId = contextRef.snapshot.getCurrentSnapshottedAction();
                context.actionPhase2SnapshotId = contextRef.snapshot.getCurrentSnapshotId();

                // state after first action phase:
                // p1Base damage: 2
                // p2Base damage: 2
                // Battlefield Marine in play
                // Death Trooper in play
                // Death Trooper damage: 2
                // Wampa damage: 2

                context.p2Round2SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p2Round2ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                context.p1Round2SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p1Round2ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.player1.clickCard(context.secretiveSage);
                context.player1.clickCard(context.p2Base);

                context.moveToRegroupPhase();

                context.regroupPhase2ManualSnapshotId = contextRef.snapshot.takeManualSnapshot(context.player2Object);
                context.regroupPhase2ActionId = contextRef.snapshot.getCurrentSnapshottedAction();
                context.regroupPhase2SnapshotId = contextRef.snapshot.getCurrentSnapshotId();

                context.player2.clickDone();
                context.player1.clickDone();

                context.actionPhase3ActionId = contextRef.snapshot.getCurrentSnapshottedAction();
                context.actionPhase3SnapshotId = contextRef.snapshot.getCurrentSnapshotId();

                // state after second action phase:
                // p1Base damage: 6
                // p2Base damage: 4
                // Battlefield Marine in play
                // Death Trooper in play
                // Death Trooper damage: 2
                // Wampa damage: 2

                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.p1Base);
            });

            const assertRegroupPhase1State = (context) => {
                expect(context.game.currentPhase).toEqual('regroup');
                expect(context.game.roundNumber).toEqual(1);

                expect(context.player1Object.promptState.promptTitle).toEqual('Resource Step');
                expect(context.player1Object.promptState.selectedCards.length).toEqual(0);
                expect(context.player2Object.promptState.promptTitle).toEqual('Resource Step');
                expect(context.player2Object.promptState.selectedCards.length).toEqual(0);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(2);
                expect(context.p2Base.damage).toEqual(2);
            };

            const assertRegroupPhase2State = (context) => {
                expect(context.game.currentPhase).toEqual('regroup');
                expect(context.game.roundNumber).toEqual(2);

                expect(context.player1Object.promptState.promptTitle).toEqual('Resource Step');
                expect(context.player1Object.promptState.selectedCards.length).toEqual(0);
                expect(context.player2Object.promptState.promptTitle).toEqual('Resource Step');
                expect(context.player2Object.promptState.selectedCards.length).toEqual(0);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(6);
                expect(context.p2Base.damage).toEqual(4);
            };

            const assertFinalState = (context) => {
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(8);
                expect(context.p2Base.damage).toEqual(4);
            };

            const assertP2Round2ActionState = (context) => {
                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.p2Round2SnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p2Round2ActionId);

                expect(context.player2).toBeActivePlayer();
                expect(context.game.roundNumber).toEqual(2);
                expect(context.game.currentPhase).toEqual('action');

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(2);
                expect(context.p2Base.damage).toEqual(2);
            };

            const assertP1Round2ActionState = (context) => {
                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.p1Round2SnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p1Round2ActionId);

                expect(context.player1).toBeActivePlayer();
                expect(context.game.roundNumber).toEqual(2);
                expect(context.game.currentPhase).toEqual('action');

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
                expect(context.p1Base.damage).toEqual(6);
                expect(context.p2Base.damage).toEqual(2);
            };

            it('regroup snapshots can revert back to the previous state', function () {
                const { context } = contextRef;

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'phase',
                    phaseName: 'regroup',
                    actionOffset: 0
                });
                expect(rollbackResult).toBeTrue();

                assertRegroupPhase2State(context);

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.regroupPhase2SnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.regroupPhase2ActionId);

                context.player2.clickDone();
                context.player1.clickDone();

                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.p1Base);

                assertFinalState(context);
            });

            describe('action snapshots', function() {
                it('can revert back to a previous round for the non-active player', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player2.id,
                        actionOffset: -2
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP2Round2ActionState(context);

                    // repeat action to ensure we can continue from this point
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);
                    expect(context.p1Base.damage).toEqual(6);
                });

                it('can revert back to a previous round for the active player', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'action',
                        playerId: context.player1.id,
                        actionOffset: -2
                    });
                    expect(rollbackResult).toBeTrue();

                    assertP1Round2ActionState(context);

                    // repeat action to ensure we can continue from this point
                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toEqual(4);
                });
            });

            describe('quick snapshots', function() {
                it('will revert through the regroup phase into the previous action phase and to another regroup phase for the non-active player', function () {
                    const { context } = contextRef;

                    // roll back to first action in round 3
                    const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult1).toBeTrue();

                    // roll back to regroup phase in round 2
                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult2).toBeTrue();

                    assertRegroupPhase2State(context);

                    // roll back to pass button click for ending action phase
                    const rollbackResult3 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult3).toBeTrue();

                    // roll back to actual action taken in action phase
                    expect(contextRef.snapshot.hasAvailableQuickSnapshot(context.player2.id)).toBeTrue();
                    const rollbackResult4 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult4).toBeTrue();

                    assertP2Round2ActionState(context);

                    // roll back to phase 1 regroup even though there are no more action snapshots
                    expect(contextRef.snapshot.hasAvailableQuickSnapshot(context.player2.id)).toBeTrue();
                    const rollbackResult5 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult5).toBeTrue();

                    assertRegroupPhase1State(context);

                    // no more quick rollbacks available
                    expect(contextRef.snapshot.hasAvailableQuickSnapshot(context.player2.id)).toBeFalse();
                    const rollbackResult6 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player2.id
                    });
                    expect(rollbackResult6).toBeFalse();
                });

                it('will revert through the regroup phase into the previous action phase and to another regroup phase for the active player', function () {
                    const { context } = contextRef;

                    // roll back to regroup phase in round 2
                    const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult2).toBeTrue();

                    assertRegroupPhase2State(context);

                    // roll back to pass button click for ending action phase
                    const rollbackResult3 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult3).toBeTrue();

                    // roll back to actual action take in action phase
                    const rollbackResult4 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult4).toBeTrue();

                    assertP1Round2ActionState(context);

                    // roll back to phase 1 regroup even though there are no more action snapshots
                    expect(contextRef.snapshot.hasAvailableQuickSnapshot(context.player1.id)).toBeTrue();
                    const rollbackResult5 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult5).toBeTrue();

                    assertRegroupPhase1State(context);

                    // no more quick rollbacks available
                    expect(contextRef.snapshot.hasAvailableQuickSnapshot(context.player1.id)).toBeFalse();
                    const rollbackResult6 = contextRef.snapshot.rollbackToSnapshot({
                        type: 'quick',
                        playerId: context.player1.id
                    });
                    expect(rollbackResult6).toBeFalse();
                });
            });

            describe('regroup snapshots', function() {
                it('can revert back to the previous state as the default', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'phase',
                        phaseName: 'regroup'
                    });
                    expect(rollbackResult).toBeTrue();

                    assertRegroupPhase2State(context);

                    expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.regroupPhase2SnapshotId);
                    expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.regroupPhase2ActionId);

                    context.player2.clickDone();
                    context.player1.clickDone();

                    context.player2.clickCard(context.tielnFighter);
                    context.player2.clickCard(context.p1Base);

                    assertFinalState(context);
                });

                it('can revert back two regroup phases', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'phase',
                        phaseName: 'regroup',
                        phaseOffset: -1
                    });
                    expect(rollbackResult).toBeTrue();

                    assertRegroupPhase1State(context);

                    expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.regroupPhase1SnapshotId);
                    expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.regroupPhase1ActionId);

                    context.player2.clickDone();
                    context.player1.clickDone();

                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);

                    context.moveToRegroupPhase();

                    assertRegroupPhase2State(context);
                });
            });

            describe('manual snapshots', function() {
                it('for the non-active player can revert back to a regroup phase', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'manual',
                        playerId: context.player1.id,
                        snapshotId: context.regroupPhase1ManualSnapshotId
                    });
                    expect(rollbackResult).toBeTrue();

                    assertRegroupPhase1State(context);

                    expect(context.game.currentPhase).toEqual('regroup');

                    expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.regroupPhase1SnapshotId);
                    expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.regroupPhase1ActionId);

                    context.player2.clickDone();
                    context.player1.clickDone();

                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);

                    context.player1.clickCard(context.secretiveSage);
                    context.player1.clickCard(context.p2Base);

                    context.moveToRegroupPhase();

                    assertRegroupPhase2State(context);
                });

                it('for the active player can revert back to a regroup phase', function () {
                    const { context } = contextRef;

                    const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                        type: 'manual',
                        playerId: context.player2.id,
                        snapshotId: context.regroupPhase2ManualSnapshotId
                    });
                    expect(rollbackResult).toBeTrue();

                    expect(context.game.currentPhase).toEqual('regroup');

                    assertRegroupPhase2State(context);

                    expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.regroupPhase2SnapshotId);
                    expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.regroupPhase2ActionId);

                    context.player2.clickDone();
                    context.player1.clickDone();

                    context.player2.clickCard(context.tielnFighter);
                    context.player2.clickCard(context.p1Base);

                    assertFinalState(context);
                });
            });
        });

        describe('During a short first action phase,', function() {
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

                context.p2Action1SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p2Action1ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.player2.clickCard(context.battlefieldMarine);

                context.p1Action1SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p1Action1ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                context.p2Action2SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p2Action2ActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.player2.clickCard(context.superlaserTechnician);
                context.player2.clickCard(context.p1Base);

                context.p1Action2SnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p1Action2ActionId = contextRef.snapshot.getCurrentSnapshottedAction();
            });

            it('action snapshots cannot revert back further than the beginning of the phase for the non-active player', function () {
                const { context } = contextRef;

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    actionOffset: -2
                });
                expect(rollbackResult).toBeFalse();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.p1Action2SnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p1Action2ActionId);
            });

            it('action snapshots cannot revert back further than the beginning of the phase for the active player', function () {
                const { context } = contextRef;

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    actionOffset: -2
                });
                expect(rollbackResult).toBeFalse();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.p1Action2SnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p1Action2ActionId);
            });

            it('action snapshots can revert back to the first action of the phase', function () {
                const { context } = contextRef;

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    actionOffset: -1
                });
                expect(rollbackResult).toBeTrue();

                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(0);
            });
        });

        describe('During a short action phase after a regroup phase,', function() {
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

                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.superlaserTechnician);
                context.player2.clickCard(context.p1Base);

                context.p1FurthestSnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p1FurthestSnapshotActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.player1.clickCard(context.secretiveSage);
                context.player1.clickCard(context.p2Base);

                // move to next action phase - involves one additional action from each player
                context.p2FurthestSnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.p2FurthestSnapshotActionId = contextRef.snapshot.getCurrentSnapshottedAction();

                context.player2.clickPrompt('Pass');
                context.player1.clickPrompt('Pass');
                context.player2.clickDone();
                context.player1.clickDone();

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);
            });

            it('action snapshots can revert back into the previous action phase for the active player', function () {
                const { context } = contextRef;

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player2.id,
                    actionOffset: -2
                });
                expect(rollbackResult).toBeTrue();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.p2FurthestSnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p2FurthestSnapshotActionId);
                expect(context.game.roundNumber).toEqual(1);
                expect(context.p1Base.damage).toEqual(2);
                expect(context.p2Base.damage).toEqual(4);
            });

            it('action snapshots can revert back into the previous action phase for the non-active player', function () {
                const { context } = contextRef;

                const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                    type: 'action',
                    playerId: context.player1.id,
                    actionOffset: -2
                });
                expect(rollbackResult).toBeTrue();

                expect(contextRef.snapshot.getCurrentSnapshotId()).toEqual(context.p1FurthestSnapshotId);
                expect(contextRef.snapshot.getCurrentSnapshottedAction()).toEqual(context.p1FurthestSnapshotActionId);
                expect(context.game.roundNumber).toEqual(1);
                expect(context.p1Base.damage).toEqual(2);
                expect(context.p2Base.damage).toEqual(2);
            });
        });

        describe('effects at the start of the action phase', function () {
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

                context.moveToNextActionPhase();

                context.startOfPhaseSnapshotId = contextRef.snapshot.getCurrentSnapshotId();
                context.startOfPhaseActionId = contextRef.snapshot.getCurrentSnapshottedAction();

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

            const assertActionPhaseStartState = (context) => {
                expect(context.player1.handSize).toBe(2);
                expect(context.player2.handSize).toBe(2);

                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.p1Base.damage).toEqual(0);
                expect(context.p2Base.damage).toEqual(0);
            };

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
        });

        describe('effects at the start of the regroup phase', function () {
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

            const assertRegroupPhaseStartState = (context) => {
                expect(context.ruthlessRaider).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(2);
                expect(context.greenSquadronAwing.damage).toBe(2);
            };

            const assertRegroupPhaseRaiderDefeatedState = (context) => {
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
        });

        describe('After a sequence of short action phases,', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action'
                });

                const { context } = contextRef;

                context.moveToNextActionPhase();
                context.moveToNextActionPhase();
                context.moveToNextActionPhase();
            });

            it('quick snapshots can go back as far as the last action and and no further if a required regroup phase snapshot is not available', function () {
                const { context } = contextRef;

                // roll back to regroup phase
                const rollbackResult1 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult1).toBeTrue();

                // roll back to pass button click for ending action phase
                const rollbackResult2 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult2).toBeTrue();

                // roll back to regroup phase
                const rollbackResult3 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult3).toBeTrue();

                // roll back to pass button click for ending action phase
                const rollbackResult4 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult4).toBeTrue();

                // no more quick rollbacks available, out of regroup phase snapshots
                expect(contextRef.snapshot.hasAvailableQuickSnapshot(context.player1.id)).toBeFalse();
                const rollbackResult5 = contextRef.snapshot.rollbackToSnapshot({
                    type: 'quick',
                    playerId: context.player1.id
                });
                expect(rollbackResult5).toBeFalse();
            });
        });
    });

    // TODO: test going to beginning of current action when there are open prompts of different types. maybe different test file
    // TODO: setup phase tests
    // TODO: decide the details of how we want manual snapshots to work, and test them in-depth
});
