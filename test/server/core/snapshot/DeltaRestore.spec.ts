import { SnapshotType, TokenUnitName } from '../../../../server/game/core/Constants';
import type { GameObjectBase } from '../../../../server/game/core/GameObjectBase';
import { OngoingEffectSource } from '../../../../server/game/core/ongoingEffect/OngoingEffectSource';
import * as StateSerializers from '../../../../server/game/core/StateSerializers';
import type { FieldKind, SerializedStateRecord } from '../../../../server/game/core/StateEncoding';
import type { DeltaTracker } from '../../../../server/game/core/snapshot/DeltaTracker';
import * as DeltaTrackerModule from '../../../../server/game/core/snapshot/DeltaTracker';
import { DeltaTrackerMode, decodeDeltaFieldValue } from '../../../../server/game/core/snapshot/DeltaTracker';
import type { IDeltaRestoreLink } from '../../../../server/game/core/snapshot/GameStateManager';
import { GameStateManager } from '../../../../server/game/core/snapshot/GameStateManager';
import type { DeltaSnapshotIndex } from '../../../../server/game/core/snapshot/container/DeltaSnapshotIndex';
import type { IGameSnapshot, IRollbackResult } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { SnapshotTimepoint } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { compareLiveWithSnapshot, withExpectedRollbackFailure } from '../../../helpers/DeltaParityGate';

/**
 * P4-F delta restore (`docs/plans/04-delta-snapshots.md`, "Rollback protocol" and "Manual snapshots and the whole-suite gate"):
 * hollow action snapshots, the delta chain restore and its recovery, the current snapshot after a restore, materialized manual
 * snapshots and their aliasing through `source`. Both blocks use the card harness, integration(): the first runs in both suite modes
 * (undo enabled through a cast, as in RestoreParityHarness.spec.ts); the second holds the cases that select DirtyOnly, need the full
 * manual path or make a raw restore, so it is an `undoIntegration` block (pending under whole-suite undo).
 */

interface IFactoryInternals {
    currentActionSnapshot: IGameSnapshot;
    lastAssignedSnapshotId: number;
    lastAssignedTimepointNumber: number;
    createSnapshotForCurrentTimepoint(timepoint: SnapshotTimepoint): void;
}
interface IHistoryInternals {
    getAllSnapshots(): IGameSnapshot[];
}
interface IManagerInternals {
    snapshotFactory: IFactoryInternals;
    actionSnapshots: IHistoryInternals;
    phaseSnapshots: { getSnapshotProperties(key: string): { snapshotId: number } };
    manualSnapshots: Map<string, { snapshots: Map<number, IGameSnapshot> }>;
}
interface IStateManagerInternals {
    allGameObjects: GameObjectBase[];
}
interface IDamageUnit {
    damage: number;
    setDamageForStateInjection(value: number): void;
}

const integrationWithUndo = integration as unknown as (definitions: (contextRef: SwuTestContextRef) => void, enableUndo: boolean) => void;

function managerOf(game): IManagerInternals {
    return game.snapshotManager as unknown as IManagerInternals;
}

function factoryOf(game): IFactoryInternals {
    return managerOf(game).snapshotFactory;
}

function stateManagerOf(game): IStateManagerInternals {
    return game.gameObjectManager as unknown as IStateManagerInternals;
}

function tracker(game): DeltaTracker {
    return game.deltaTracker as DeltaTracker;
}

function indexOf(game): DeltaSnapshotIndex {
    return game.snapshotManager.deltaSnapshotIndex;
}

/** Live state in snapshot shape: every registered object's fresh record, the rng state and the object-id counter. */
function liveState(game): Pick<IGameSnapshot, 'states' | 'rngState' | 'lastGameObjectId'> {
    const states: Record<string, SerializedStateRecord> = {};
    for (const go of stateManagerOf(game).allGameObjects) {
        states[go.uuid] = StateSerializers.getStateSerializerFor(go).serializer.serialize(go);
    }
    return { states, rngState: game.randomGenerator.rngState, lastGameObjectId: game.gameObjectManager.lastGameObjectId };
}

function settle(game, result: IRollbackResult): void {
    expect(result.success).toBeTrue();
    if (result.success) {
        game.postRollbackOperations(result.entryPoint);
    }
}

/** Counts delta chain restores while `body` runs. */
function withDeltaRestoreCount<T>(body: (count: { restores: number }) => T): T {
    const count = { restores: 0 };
    const original = GameStateManager.prototype.rollbackToDeltaChain;
    GameStateManager.prototype.rollbackToDeltaChain = function(this: GameStateManager, ...args: Parameters<typeof original>) {
        count.restores++;
        return original.apply(this, args);
    };
    try {
        return body(count);
    } finally {
        GameStateManager.prototype.rollbackToDeltaChain = original;
    }
}

/** Shadows `instance[hook]` with `replacement` for the duration of `body` (own property, removed afterwards). */
function withHook<T>(instance: object, hook: string, replacement: (original: (...args: unknown[]) => unknown) => (...args: unknown[]) => unknown, body: () => T): T {
    const record = instance as Record<string, (...args: unknown[]) => unknown>;
    const original = record[hook].bind(instance);
    record[hook] = replacement(original);
    try {
        return body();
    } finally {
        Reflect.deleteProperty(record, hook);
    }
}

function attack(player, unit, target): void {
    player.clickCard(unit);
    player.clickCard(target);
}

// --- Aliasing sequences: base-tree APIs only, so the identical functions also run on the unmodified tree. ---

function manualInfo(game, playerId: string, snapshotId: number) {
    return game.snapshotManager.getRollbackInformation({ type: SnapshotType.Manual, playerId, snapshotId });
}

function manualProperties(game, playerId: string, snapshotId: number) {
    return (game.snapshotManager as unknown as { manualSnapshots: Map<string, { getSnapshotProperties(key: number) }> }).manualSnapshots.get(playerId).getSnapshotProperties(snapshotId);
}

/** Bookmark mid-action, a reveal on the timepoint, a first run ending in player 1's action, rollback, then a redo followed by the same player's next action. */
function aliasingSequence(context, contextRef) {
    const game = context.game;
    const manager = game.snapshotManager;
    const p1 = context.player1.id;
    const readings: unknown[] = [];

    attack(context.player1, context.wampa, context.p2Base);
    attack(context.player2, context.frontierAtrt, context.p1Base);
    const bookmarkTimepoint = factoryOf(game).currentActionSnapshot;
    (context.atst as unknown as IDamageUnit).setDamageForStateInjection(1);
    const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
    const stored = managerOf(game).manualSnapshots.get(p1).snapshots.get(snapshotId);

    manager.setRequiresConfirmationToRollbackCurrentSnapshot(p1);
    readings.push(manualInfo(game, p1, snapshotId).requiresConfirmation);

    attack(context.player1, context.atst, context.p2Base);
    const result = manager.rollbackTo({ type: SnapshotType.Manual, playerId: p1, snapshotId });
    readings.push(result.success);
    game.postRollbackOperations(result.entryPoint);
    readings.push(factoryOf(game).currentActionSnapshot === bookmarkTimepoint);
    readings.push(manualInfo(game, p1, snapshotId).requiresConfirmation);
    readings.push(manager.getRollbackInformation({ type: SnapshotType.Action, playerId: p1 }));

    attack(context.player1, context.specforceSoldier, context.p2Base);
    context.player2.passAction();
    readings.push(manualProperties(game, p1, snapshotId).nextSnapshotIsSamePlayer);
    readings.push(manager.getRollbackInformation({ type: SnapshotType.Quick, playerId: p1 }));
    attack(context.player1, context.battlefieldMarine, context.p2Base);
    readings.push(manager.getRollbackInformation({ type: SnapshotType.Quick, playerId: p1 }));

    return { readings, bookmarkTimepoint, stored };
}

/** Bookmark mid-action, a reveal, four further actions by the bookmarking player (the history drops the timepoint), then rollback. */
function evictedAliasingSequence(context, contextRef) {
    const game = context.game;
    const manager = game.snapshotManager;
    const p1 = context.player1.id;
    const readings: unknown[] = [];

    // Opening actions, so the bookmarked timepoint is a fresh push into player 1's action history (also on an undo replay).
    attack(context.player1, context.wampa, context.p2Base);
    attack(context.player2, context.frontierAtrt, context.p1Base);
    const bookmarkTimepoint = factoryOf(game).currentActionSnapshot;
    (context.atst as unknown as IDamageUnit).setDamageForStateInjection(1);
    const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
    const stored = managerOf(game).manualSnapshots.get(p1).snapshots.get(snapshotId);
    manager.setRequiresConfirmationToRollbackCurrentSnapshot(p1);

    const units = [context.battlefieldMarine, context.atst, context.specforceSoldier, context.consularSecurityForce];
    for (const unit of units) {
        attack(context.player1, unit, context.p2Base);
        context.player2.passAction();
    }
    readings.push(managerOf(game).actionSnapshots.getAllSnapshots().some((snapshot) => snapshot === bookmarkTimepoint));
    readings.push(manualInfo(game, p1, snapshotId).requiresConfirmation);

    const result = manager.rollbackTo({ type: SnapshotType.Manual, playerId: p1, snapshotId });
    readings.push(result.success);
    game.postRollbackOperations(result.entryPoint);
    readings.push(factoryOf(game).currentActionSnapshot === bookmarkTimepoint);
    readings.push(manualInfo(game, p1, snapshotId).requiresConfirmation);

    return { readings, bookmarkTimepoint, stored };
}

// Captured on the unmodified tree (P4-E HEAD e16f1f283) by running the two functions above unchanged.
const expectedAliasingReadings: unknown[] = [
    true, true, true, false, { requiresConfirmation: false, isSameTimepoint: true }, false,
    { requiresConfirmation: true, isSameTimepoint: false }, { requiresConfirmation: false, isSameTimepoint: false }
];
const expectedEvictedAliasingReadings: unknown[] = [false, true, true, true, false];

describe('Delta restore', function() {
    integrationWithUndo(function(contextRef) {
        async function setupBoard() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa', 'battlefield-marine', 'atst', 'specforce-soldier', 'consular-security-force'], hand: ['daring-raid'], resources: 6 },
                player2: { groundArena: ['frontier-atrt', 'death-trooper'], spaceArena: ['cartel-spacer'] }
            });
            return contextRef.context;
        }

        it('current-undo-pending-only: a quick undo with an open prompt mid-action reverts the action through the pending window alone', async function() {
            const context = await setupBoard();
            const game = context.game;
            const current = factoryOf(game).currentActionSnapshot;
            expect(current.hollow).toBeTrue();
            // The window-start state (a transient registered with registration disabled since the checkpoint still advances the live
            // counter, so the reference counter is the window anchor's).
            const reference = game.snapshotManager.materializeCurrentSnapshot();

            (context.wampa as unknown as IDamageUnit).setDamageForStateInjection(3);
            context.player1.clickCard(context.daringRaid);
            expect(context.player1).toBeAbleToSelect(context.p2Base);
            expect(indexOf(game).buildChain(current.id, current.timepointNumber).length).toBe(0);

            const result = withDeltaRestoreCount((count) => {
                const rollback = game.snapshotManager.rollbackTo({ type: SnapshotType.Quick, playerId: context.player1.id });
                expect(count.restores).toBe(1);
                return rollback;
            });
            expect(result.success).toBeTrue();
            expect(game.snapshotManager.currentSnapshotId).toBe(current.id);
            expect(compareLiveWithSnapshot(game, reference)).toBeNull();
            settle(game, result);
        });

        it('cross-player-chain: an action rollback across the opponent\'s action restores the reference state of the target', async function() {
            const context = await setupBoard();
            const game = context.game;

            attack(context.player1, context.wampa, context.p2Base);
            const target = factoryOf(game).currentActionSnapshot;
            const reference = liveState(game);
            attack(context.player2, context.frontierAtrt, context.p1Base);
            attack(context.player1, context.atst, context.p2Base);
            attack(context.player2, context.deathTrooper, context.p1Base);

            const chain = indexOf(game).buildChain(target.id, target.timepointNumber);
            expect(chain.length).toBeGreaterThanOrEqual(3);
            const result = withDeltaRestoreCount((count) => {
                const rollback = game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player2.id, actionOffset: -1 });
                expect(count.restores).toBe(1);
                return rollback;
            });
            expect(result.success).toBeTrue();
            expect(game.snapshotManager.currentSnapshotId).toBe(target.id);
            expect(compareLiveWithSnapshot(game, reference)).toBeNull();
            settle(game, result);
        });

        // Invariant: restoring to one target again after a different timeline was played lands on the same stored snapshot, with the
        // index pruned back to it and an empty window anchored there. A consumed window or a stale first-timeline delta re-applied, an
        // unpruned index, or a mutated target would leave a field of timeline A or B in place.
        it('same-target-twice: rolling back to one snapshot after two different timelines lands on it unchanged each time', async function() {
            const context = await setupBoard();
            const game = context.game;

            attack(context.player1, context.wampa, context.p2Base);
            const target = factoryOf(game).currentActionSnapshot;
            const reference = liveState(game);

            const expectLandedOnTarget = (tokens: object[]) => {
                expect(game.snapshotManager.currentSnapshotId).toBe(target.id);
                expect(factoryOf(game).currentActionSnapshot).toBe(target);
                expect(compareLiveWithSnapshot(game, reference)).toBeNull();
                expect(indexOf(game).headSnapshotId).toBe(target.id);
                expect(indexOf(game).getIds()
                    .every((id) => id <= target.id)).toBeTrue();
                expect(tracker(game).pendingWindow.anchor.snapshotId).toBe(target.id);
                expect(tracker(game).pendingWindow.changedFields.size).toBe(0);
                for (const token of tokens) {
                    expect(game.gameObjectManager.isRegistered(token)).toBeFalse();
                }
            };

            // Timeline A.
            attack(context.player2, context.frontierAtrt, context.p1Base);
            const tokenA = game.generateToken(context.player1Object, TokenUnitName.BattleDroid);
            attack(context.player1, context.atst, context.p2Base);
            attack(context.player2, context.deathTrooper, context.p1Base);
            expect(game.gameObjectManager.isRegistered(tokenA)).toBeTrue();
            const resultA = withDeltaRestoreCount((count) => {
                const rollback = game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player2.id, actionOffset: -1 });
                expect(count.restores).toBe(1);
                return rollback;
            });
            expect(resultA.success).toBeTrue();
            expectLandedOnTarget([tokenA]);
            settle(game, resultA);

            // Timeline B: other attackers, a write on a unit timeline A never touched, a second token.
            attack(context.player2, context.deathTrooper, context.p1Base);
            (context.consularSecurityForce as unknown as IDamageUnit).setDamageForStateInjection(2);
            const tokenB = game.generateToken(context.player2Object, TokenUnitName.BattleDroid);
            attack(context.player1, context.battlefieldMarine, context.p2Base);
            attack(context.player2, context.cartelSpacer, context.p1Base);
            expect(game.gameObjectManager.isRegistered(tokenB)).toBeTrue();
            const resultB = withDeltaRestoreCount((count) => {
                const rollback = game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player2.id, actionOffset: -1 });
                expect(count.restores).toBe(1);
                return rollback;
            });
            expect(resultB.success).toBeTrue();
            expectLandedOnTarget([tokenA, tokenB]);
            settle(game, resultB);

            // Pending-only leg: an open attack prompt and an injected write, reverted through the held window alone.
            context.player2.clickCard(context.frontierAtrt);
            (context.specforceSoldier as unknown as IDamageUnit).setDamageForStateInjection(3);
            expect(indexOf(game).buildChain(target.id, target.timepointNumber).length).toBe(0);
            const resultC = withDeltaRestoreCount((count) => {
                const rollback = game.snapshotManager.rollbackTo({ type: SnapshotType.Quick, playerId: context.player2.id });
                expect(count.restores).toBe(1);
                return rollback;
            });
            expect(resultC.success).toBeTrue();
            expectLandedOnTarget([tokenA, tokenB]);
            settle(game, resultC);
        });

        // Invariant: a full restore to a phase snapshot, taken while the current snapshot is hollow and a window holds writes, leaves the
        // completed full restore alone (no pending window or stored delta applied over it), prunes the later snapshots and leaves the
        // timepoint counter on the restored timeline, so the next action's delta is anchored at the phase snapshot with the next number.
        it('delta-to-full-boundary: a full phase rollback from a hollow current snapshot restores the phase start, and the next delta chain restores the window start', async function() {
            const context = await setupBoard();
            const game = context.game;
            const units = {
                [context.player1.id]: [context.battlefieldMarine, context.specforceSoldier, context.atst],
                [context.player2.id]: [context.deathTrooper, context.cartelSpacer, context.frontierAtrt]
            };
            const act = (index: number) => {
                const player = game.actionPhaseActivePlayer === context.player1Object ? context.player1 : context.player2;
                const opponentBase = player === context.player1 ? context.p2Base : context.p1Base;
                attack(player, units[player.id][index], opponentBase);
            };

            attack(context.player1, context.wampa, context.p2Base);
            attack(context.player2, context.frontierAtrt, context.p1Base);
            context.moveToNextActionPhase();
            expect(game.currentPhase).toBe('action');

            // The first Action snapshot of the new phase is hollow, but its window start is not the StartOfPhase state (it is taken one game
            // event later: lastGameEventId differs), so the landed full phase snapshot is the reference for the full restore, not a materialization.
            const firstAction = factoryOf(game).currentActionSnapshot;
            expect(firstAction.hollow).toBeTrue();
            const phaseId = managerOf(game).phaseSnapshots.getSnapshotProperties('action').snapshotId;
            expect(phaseId).toBeLessThan(firstAction.id);

            act(0);
            act(1);
            (context.consularSecurityForce as unknown as IDamageUnit).setDamageForStateInjection(2);

            const result = withDeltaRestoreCount((count) => {
                const rollback = game.snapshotManager.rollbackTo({ type: SnapshotType.Phase, phaseName: 'action' });
                expect(count.restores).toBe(0);
                return rollback;
            });
            expect(result.success).toBeTrue();

            const landed = factoryOf(game).currentActionSnapshot;
            expect(landed.id).toBe(phaseId);
            expect(game.snapshotManager.currentSnapshotId).toBe(phaseId);
            expect(landed.hollow).toBeUndefined();
            expect(compareLiveWithSnapshot(game, landed)).toBeNull();
            expect(indexOf(game).headSnapshotId).toBe(phaseId);
            expect(indexOf(game).getIds()
                .every((id) => id <= phaseId)).toBeTrue();
            expect(managerOf(game).actionSnapshots.getAllSnapshots().every((snapshot) => snapshot.id <= phaseId)).toBeTrue();
            expect(tracker(game).pendingWindow.anchor.snapshotId).toBe(phaseId);
            expect(tracker(game).pendingWindow.changedFields.size).toBe(0);
            settle(game, result);

            // The Action snapshot the resumed window took: its delta is anchored at the phase snapshot and numbered after it.
            const resumed = factoryOf(game).currentActionSnapshot;
            expect(resumed.id).toBeGreaterThan(phaseId);
            expect(resumed.timepointNumber).toBe(landed.timepointNumber + 1);
            expect(indexOf(game).get(resumed.id).anchorSnapshotId).toBe(phaseId);

            // A delta rollback across the next action lands on the reference.
            const actingPlayer = game.actionPhaseActivePlayer === context.player1Object ? context.player1 : context.player2;
            const resumedReference = game.snapshotManager.materializeCurrentSnapshot();
            act(2);
            const deltaResult = withDeltaRestoreCount((count) => {
                const rollback = game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: actingPlayer.id });
                expect(count.restores).toBe(1);
                return rollback;
            });
            expect(deltaResult.success).toBeTrue();
            expect(game.snapshotManager.currentSnapshotId).toBe(resumed.id);
            expect(compareLiveWithSnapshot(game, resumedReference)).toBeNull();
            settle(game, deltaResult);
        });

        it('recovery-delta: a restore that throws part-way recovers the pre-attempt state from the pre-pass, with one serialize per object before recovery', async function() {
            const context = await setupBoard();
            const game = context.game;
            attack(context.player1, context.wampa, context.p2Base);
            attack(context.player2, context.frontierAtrt, context.p1Base);
            (context.atst as unknown as IDamageUnit).setDamageForStateInjection(2);

            const before = liveState(game);
            const window = tracker(game).pendingWindow;
            const liveCount = stateManagerOf(game).allGameObjects.length;
            const alerts: string[] = [];

            // Count serializes until the nested recovery frame starts: the recovery snapshot must come from the pre-pass, not a second serialize.
            const serializedBeforeRecovery = new Map<string, number>();
            let recoveryStarted = false;
            const originalFull = GameStateManager.prototype.rollbackToSnapshot;
            const originalLookup = StateSerializers.getStateSerializerFor;
            let calls = 0;
            let result: IRollbackResult;
            try {
                GameStateManager.prototype.rollbackToSnapshot = function(this: GameStateManager, ...args: Parameters<typeof originalFull>) {
                    recoveryStarted = true;
                    return originalFull.apply(this, args);
                };
                withHook(game, 'addAlert', (original) => (...args) => {
                    alerts.push(String(args[1]));
                    return original(...args);
                }, () => withHook(context.wampa, 'afterSetState', (original) => (...args) => {
                    calls++;
                    if (calls === 1) {
                        throw new Error('P4F_INJECTED_DELTA_RESTORE_FAILURE');
                    }
                    return original(...args);
                }, () => {
                    for (const go of stateManagerOf(game).allGameObjects) {
                        const entry = originalLookup(go);
                        const serializer = entry.serializer;
                        if (!Object.prototype.hasOwnProperty.call(serializer, 'p4fCounted')) {
                            const originalSerialize = serializer.serialize;
                            Object.defineProperty(serializer, 'p4fCounted', { value: originalSerialize, configurable: true });
                            serializer.serialize = function(instance) {
                                if (!recoveryStarted) {
                                    const uuid = (instance as unknown as GameObjectBase).uuid;
                                    serializedBeforeRecovery.set(uuid, (serializedBeforeRecovery.get(uuid) ?? 0) + 1);
                                }
                                return originalSerialize(instance);
                            };
                        }
                    }
                    result = withExpectedRollbackFailure(() => game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player1.id }));
                }));
            } finally {
                GameStateManager.prototype.rollbackToSnapshot = originalFull;
                for (const go of stateManagerOf(game).allGameObjects) {
                    const serializer = originalLookup(go).serializer as unknown as { p4fCounted?: unknown; serialize: unknown };
                    if (Object.prototype.hasOwnProperty.call(serializer, 'p4fCounted')) {
                        serializer.serialize = serializer.p4fCounted;
                        Reflect.deleteProperty(serializer, 'p4fCounted');
                    }
                }
            }

            expect(result.success).toBeFalse();
            expect(recoveryStarted).toBeTrue();
            expect(alerts.some((message) => message.includes('An error occurred during undo'))).toBeTrue();
            expect(compareLiveWithSnapshot(game, before)).toBeNull();
            expect(serializedBeforeRecovery.size).toBe(liveCount);
            expect([...serializedBeforeRecovery.values()].every((count) => count === 1)).toBeTrue();
            expect(tracker(game).isTracking).toBeTrue();
            expect(tracker(game).pendingWindow).toBe(window);
        });

        it('recovery-full-hollow-current: a full restore that throws while the current snapshot is hollow recovers the pre-attempt state', async function() {
            const context = await setupBoard();
            const game = context.game;
            attack(context.player1, context.wampa, context.p2Base);
            expect(factoryOf(game).currentActionSnapshot.hollow).toBeTrue();
            (context.atst as unknown as IDamageUnit).setDamageForStateInjection(1);
            const before = liveState(game);
            const window = tracker(game).pendingWindow;

            let calls = 0;
            const result = withHook(context.wampa, 'afterSetState', (original) => (...args) => {
                calls++;
                if (calls === 1) {
                    throw new Error('P4F_INJECTED_FULL_RESTORE_FAILURE');
                }
                return original(...args);
            }, () => withExpectedRollbackFailure(() => game.snapshotManager.rollbackTo({ type: SnapshotType.Phase, phaseName: 'action' })));

            expect(result.success).toBeFalse();
            expect(calls).toBeGreaterThan(1);
            expect(compareLiveWithSnapshot(game, before)).toBeNull();
            expect(tracker(game).pendingWindow).toBe(window);
            expect(tracker(game).isTracking).toBeTrue();
        });

        it('created-removed-culled-skipped: an object created and kept in the chain is removed with cleanupOnRemove; one culled inside its window is skipped', async function() {
            const context = await setupBoard();
            const game = context.game;
            attack(context.player1, context.wampa, context.p2Base);
            const target = factoryOf(game).currentActionSnapshot;
            const reference = liveState(game);

            const token = game.generateToken(context.player2Object, TokenUnitName.BattleDroid);
            const culled = new OngoingEffectSource(game);
            const culledUuid = culled.uuid;
            expect(tracker(game).pendingWindow.createdObjectUuids.has(token.uuid)).toBeTrue();
            expect(tracker(game).pendingWindow.createdObjectUuids.has(culledUuid)).toBeTrue();
            attack(context.player2, context.frontierAtrt, context.p1Base);
            expect(game.gameObjectManager.isRegistered(culled)).toBeFalse();
            expect(game.gameObjectManager.isRegistered(token)).toBeTrue();

            const cleanups: string[] = [];
            const result = withHook(token, 'cleanupOnRemove', (original) => (...args) => {
                cleanups.push(token.uuid);
                return original(...args);
            }, () => withHook(culled, 'cleanupOnRemove', (original) => (...args) => {
                cleanups.push(culledUuid);
                return original(...args);
            }, () => game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player2.id })));

            expect(result.success).toBeTrue();
            expect(game.snapshotManager.currentSnapshotId).toBe(target.id);
            expect(cleanups).toEqual([token.uuid]);
            expect(game.gameObjectManager.isRegistered(token)).toBeFalse();
            expect(compareLiveWithSnapshot(game, reference)).toBeNull();
            settle(game, result);
        });

        it('registration-guard: a registration during a delta rollback fails the rollback guard, recovers and leaves the registry unchanged', async function() {
            const context = await setupBoard();
            const game = context.game;
            attack(context.player1, context.wampa, context.p2Base);
            const before = liveState(game);
            const registered = game.gameObjectManager.registeredObjectCount;

            let guardError: Error = null;
            let injected = false;
            const result = withHook(context.wampa, 'afterSetState', (original) => (...args) => {
                if (!injected) {
                    injected = true;
                    try {
                        // eslint-disable-next-line no-new
                        new OngoingEffectSource(game);
                    } catch (error) {
                        guardError = error as Error;
                        throw error;
                    }
                }
                return original(...args);
            }, () => withExpectedRollbackFailure(() => game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player1.id })));

            expect(result.success).toBeFalse();
            expect(guardError).not.toBeNull();
            expect(guardError.message).toContain('during a rollback');
            expect(game.gameObjectManager.registeredObjectCount).toBe(registered);
            expect(compareLiveWithSnapshot(game, before)).toBeNull();
        });

        it('recovery-delta mid-chain: a decode failure on the second link, after the first link wrote its fields and rng, recovers the pre-attempt state', async function() {
            const context = await setupBoard();
            const game = context.game;
            attack(context.player1, context.wampa, context.p2Base);
            attack(context.player2, context.frontierAtrt, context.p1Base);
            attack(context.player1, context.atst, context.p2Base);
            attack(context.player2, context.deathTrooper, context.p1Base);
            (context.battlefieldMarine as unknown as IDamageUnit).setDamageForStateInjection(2);

            const before = liveState(game);
            const window = tracker(game).pendingWindow;
            const exports = DeltaTrackerModule as unknown as Record<string, unknown>;
            const originalDecode = exports.decodeDeltaFieldValue as typeof decodeDeltaFieldValue;
            const originalChain = GameStateManager.prototype.rollbackToDeltaChain;

            let firstLinkFields = -1;
            let linkCount = 0;
            let decodes = 0;
            let result: IRollbackResult;
            try {
                GameStateManager.prototype.rollbackToDeltaChain = function(this: GameStateManager, ...args: Parameters<typeof originalChain>) {
                    const links = args[0] as readonly IDeltaRestoreLink[];
                    linkCount = links.length;
                    firstLinkFields = [...links[0].changedFields.values()].reduce((total, fields) => total + Object.keys(fields).length, 0);
                    return originalChain.apply(this, args);
                };
                exports.decodeDeltaFieldValue = (...args: Parameters<typeof decodeDeltaFieldValue>) => {
                    decodes++;
                    if (decodes === firstLinkFields + 1) {
                        throw new Error('P4F_INJECTED_SECOND_LINK_DECODE_FAILURE');
                    }
                    return originalDecode(...args);
                };
                result = withExpectedRollbackFailure(() => game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player2.id, actionOffset: -1 }));
            } finally {
                exports.decodeDeltaFieldValue = originalDecode;
                GameStateManager.prototype.rollbackToDeltaChain = originalChain;
            }

            expect(linkCount).toBeGreaterThanOrEqual(3);
            expect(firstLinkFields).toBeGreaterThan(0);
            expect(decodes).toBe(firstLinkFields + 1);
            expect(result.success).toBeFalse();
            expect(compareLiveWithSnapshot(game, before)).toBeNull();
            expect(tracker(game).isTracking).toBeTrue();
            expect(tracker(game).pendingWindow).toBe(window);
        });

        it('counter-mismatch-before-write: a chain whose oldest anchor counter differs from the target fails before any write and keeps the window', async function() {
            const context = await setupBoard();
            const game = context.game;
            attack(context.player1, context.wampa, context.p2Base);
            attack(context.player2, context.frontierAtrt, context.p1Base);
            const target = factoryOf(game).currentActionSnapshot;
            expect(target.hollow).toBeTrue();
            (context.atst as unknown as IDamageUnit).setDamageForStateInjection(2);
            const before = liveState(game);
            const window = tracker(game).pendingWindow;

            const recorded = target.lastGameObjectId;
            let restores = 0;
            try {
                target.lastGameObjectId = recorded + 1000;
                withDeltaRestoreCount((count) => {
                    expect(() => game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player1.id }))
                        .toThrowError(/oldest link anchors at object id counter/);
                    restores = count.restores;
                });
            } finally {
                target.lastGameObjectId = recorded;
            }

            expect(restores).toBe(0);
            expect(compareLiveWithSnapshot(game, before)).toBeNull();
            expect(tracker(game).isTracking).toBeTrue();
            expect(tracker(game).pendingWindow).toBe(window);
        });

        it('current-after-delta: the current snapshot after a delta rollback is the stored hollow target, with the live rng state and counter', async function() {
            const context = await setupBoard();
            const game = context.game;

            // The window before T creates objects, so T's own delta anchor counter differs from T's.
            game.generateToken(context.player1Object, TokenUnitName.BattleDroid);
            attack(context.player1, context.wampa, context.p2Base);
            const target = factoryOf(game).currentActionSnapshot;
            const targetDelta = indexOf(game).get(target.id);
            expect(target.hollow).toBeTrue();
            expect(targetDelta.lastGameObjectId).not.toBe(target.lastGameObjectId);
            attack(context.player2, context.frontierAtrt, context.p1Base);
            attack(context.player1, context.atst, context.p2Base);

            const result = game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player2.id, actionOffset: -1 });
            expect(result.success).toBeTrue();

            const current = factoryOf(game).currentActionSnapshot;
            expect(current).toBe(target);
            expect(current.lastGameObjectId).toBe(game.gameObjectManager.lastGameObjectId);
            expect(current.rngState).toEqual(game.randomGenerator.rngState);
            expect(current.lastGameObjectId).not.toBe(targetDelta.lastGameObjectId);
            expect(indexOf(game).headSnapshotId).toBe(target.id);
            expect(indexOf(game).getIds()
                .every((id) => id <= target.id)).toBeTrue();
            expect(managerOf(game).actionSnapshots.getAllSnapshots().every((snapshot) => snapshot.id <= target.id)).toBeTrue();
            expect(tracker(game).pendingWindow.anchor.snapshotId).toBe(target.id);
            settle(game, result);
        });

        it('mid-window-manual: a manual snapshot mid-action stores the action-start state under the current id and consumes nothing', async function() {
            const context = await setupBoard();
            const game = context.game;
            attack(context.player1, context.wampa, context.p2Base);
            const current = factoryOf(game).currentActionSnapshot;
            const reference = liveState(game);

            (context.atst as unknown as IDamageUnit).setDamageForStateInjection(2);
            context.player2.clickCard(context.deathTrooper);
            const idBefore = factoryOf(game).lastAssignedSnapshotId;
            const timepointBefore = factoryOf(game).lastAssignedTimepointNumber;

            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player2Object);
            expect(snapshotId).toBe(current.id);
            expect(factoryOf(game).lastAssignedSnapshotId).toBe(idBefore);
            expect(factoryOf(game).lastAssignedTimepointNumber).toBe(timepointBefore);
            const stored = managerOf(game).manualSnapshots.get(context.player2.id).snapshots.get(snapshotId);
            expect(stored.hollow).toBeUndefined();
            expect(stored.source).toBe(current);
            expect(stored.states).toEqual(reference.states);
            expect(stored.rngState).toEqual(reference.rngState);
            expect(stored.lastGameObjectId).toBe(reference.lastGameObjectId);

            const result = game.snapshotManager.rollbackTo({ type: SnapshotType.Manual, playerId: context.player2.id, snapshotId });
            expect(result.success).toBeTrue();
            expect(compareLiveWithSnapshot(game, reference)).toBeNull();
            settle(game, result);
        });

        it('morph-regression: a manual snapshot taken after a delta rollback restores the state that rollback produced', async function() {
            const context = await setupBoard();
            const game = context.game;
            attack(context.player1, context.wampa, context.p2Base);
            attack(context.player2, context.frontierAtrt, context.p1Base);

            settle(game, game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player2.id }));
            const afterDelta = liveState(game);
            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player2Object);

            attack(context.player2, context.deathTrooper, context.p1Base);
            attack(context.player1, context.atst, context.p2Base);

            const result = game.snapshotManager.rollbackTo({ type: SnapshotType.Manual, playerId: context.player2.id, snapshotId });
            expect(result.success).toBeTrue();
            expect(compareLiveWithSnapshot(game, afterDelta)).toBeNull();
            settle(game, result);
        });

        // The two aliasing cases compare flag readings with the values the unmodified tree (P4-E, where the manual map stored the
        // current snapshot object itself) reports for the identical sequence; those values were captured by running the same two
        // sequence functions on that tree (P4-F evidence, base-aliasing log). The identity checks are P4-F's own.
        it('manual-rollback-current-aliases: after a rollback to a bookmark the flags live on the bookmark\'s source, as on the unmodified tree', async function() {
            const context = await setupBoard();
            const run = aliasingSequence(context, contextRef);
            expect(run.readings).toEqual(expectedAliasingReadings);
            expect(run.stored.source).toBe(run.bookmarkTimepoint);
        });

        it('manual-rollback-evicted-alias: a bookmark keeps reporting its timepoint\'s reveal after the history evicts it, and its rollback restores the source as current', async function() {
            const context = await setupBoard();
            const run = evictedAliasingSequence(context, contextRef);
            expect(run.readings).toEqual(expectedEvictedAliasingReadings);
            expect(run.stored.source).toBe(run.bookmarkTimepoint);
            expect(factoryOf(context.game).currentActionSnapshot).toBe(run.bookmarkTimepoint);
        });

        it('materialize-read-only: materializing the hollow current snapshot changes nothing in the game, window or index', async function() {
            const context = await setupBoard();
            const game = context.game;
            attack(context.player1, context.wampa, context.p2Base);
            (context.atst as unknown as IDamageUnit).setDamageForStateInjection(2);
            game.generateToken(context.player1Object, TokenUnitName.BattleDroid);

            const window = tracker(game).pendingWindow;
            const windowBefore = JSON.stringify([[...window.changedFields], [...window.createdObjectUuids]]);
            const live = liveState(game);
            const ids = indexOf(game).getIds();
            const factory = factoryOf(game);
            const counters = [factory.lastAssignedSnapshotId, factory.lastAssignedTimepointNumber, game.snapshotManager.currentSnapshotId];

            const materialized = game.snapshotManager.materializeCurrentSnapshot();
            expect(materialized.source).toBe(factory.currentActionSnapshot);
            expect(materialized.lastGameObjectId).toBe(window.anchor.lastGameObjectId);

            expect(tracker(game).pendingWindow).toBe(window);
            expect(JSON.stringify([[...window.changedFields], [...window.createdObjectUuids]])).toBe(windowBefore);
            expect(compareLiveWithSnapshot(game, live)).toBeNull();
            expect(indexOf(game).getIds()).toEqual(ids);
            expect([factory.lastAssignedSnapshotId, factory.lastAssignedTimepointNumber, game.snapshotManager.currentSnapshotId]).toEqual(counters);
        });

        it('field-kind-decode: a recorded value of every live field kind decodes and writes back to an identical record', async function() {
            const context = await setupBoard();
            const game = context.game;
            attack(context.player1, context.wampa, context.p2Base);

            const covered = new Set<FieldKind>();
            for (const go of stateManagerOf(game).allGameObjects) {
                const entry = StateSerializers.getStateSerializerFor(go);
                for (const field of entry.fields) {
                    if (covered.has(field.kind)) {
                        continue;
                    }
                    const record = entry.serializer.serialize(go);
                    (go as unknown as Record<string, unknown>)[field.name] = decodeDeltaFieldValue(game, go, field.name, record[field.name]);
                    expect(entry.serializer.serialize(go)).toEqual(record, `${entry.className}.${field.name} (${field.kind})`);
                    covered.add(field.kind);
                }
            }

            // refSet and refRecord have no live field (the generated serializers emit none), so they are not applicable here.
            expect([...covered].sort()).toEqual(['primitive', 'ref', 'refArray', 'refMap', 'value']);
        });
    }, true);

    undoIntegration(function(contextRef) {
        async function setupBoard() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa', 'atst'], hand: ['daring-raid'], resources: 6 },
                player2: { groundArena: ['frontier-atrt', 'death-trooper'] }
            });
            return contextRef.context;
        }

        it('hollow-cadence: action timepoints are hollow with readable flags; anchors, bridges, regroup and DirtyOnly-closing snapshots are full', async function() {
            const context = await setupBoard();
            const game = context.game;
            const taken: IGameSnapshot[] = [];
            const factory = factoryOf(game);
            const original = factory.createSnapshotForCurrentTimepoint;
            withHook(factory, 'createSnapshotForCurrentTimepoint', () => (timepoint) => {
                const result = original.call(factory, timepoint);
                taken.push(factory.currentActionSnapshot);
                return result;
            }, () => {
                attack(context.player1, context.wampa, context.p2Base);
                game.snapshotManager.setRequiresConfirmationToRollbackCurrentSnapshot(context.player2.id);
                expect(game.snapshotManager.getRollbackInformation({ type: SnapshotType.Action, playerId: context.player2.id }).requiresConfirmation).toBeTrue();

                // A DirtyOnly window: the snapshot that opens it and the one that closes it stay full.
                tracker(game).setMode(DeltaTrackerMode.DirtyOnly);
                attack(context.player2, context.frontierAtrt, context.p1Base);
                tracker(game).setMode(DeltaTrackerMode.CaptureOldValues);
                attack(context.player1, context.atst, context.p2Base);
                attack(context.player2, context.deathTrooper, context.p1Base);
                context.moveToRegroupPhase();
            });

            const action = (snapshot: IGameSnapshot) => snapshot.timepoint === SnapshotTimepoint.Action && snapshot.phase === 'action';
            expect(taken[0].hollow).toBeTrue();
            expect(taken[1].hollow).toBeUndefined();
            expect(taken[2].hollow).toBeUndefined();
            expect(taken[3].hollow).toBeTrue();
            for (const snapshot of taken.slice(4)) {
                expect(snapshot.hollow === true).toBe(action(snapshot), `snapshot ${snapshot.id} (${snapshot.timepoint}, ${snapshot.phase})`);
            }
            expect(taken.some((snapshot) => snapshot.timepoint === SnapshotTimepoint.EndOfPhase && snapshot.hollow === undefined)).toBeTrue();
            expect(taken.some((snapshot) => snapshot.phase === 'regroup' && snapshot.hollow === undefined)).toBeTrue();
            for (const snapshot of taken.filter((candidate) => candidate.hollow)) {
                expect(Object.keys(snapshot.states).length).toBe(0);
            }
        });

        it('full-mid-window-then-delta: a full manual rollback mid-window leaves no restore write in the next delta, and a delta rollback across it lands on its target', async function() {
            const context = await setupBoard();
            const game = context.game;
            const actionStart = factoryOf(game).currentActionSnapshot;
            const reference = liveState(game);
            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
            (context.atst as unknown as IDamageUnit).setDamageForStateInjection(3);

            // Full restore (parity mode is off outside whole-suite undo): the window it consumed is dropped and a fresh one opens.
            const consumed = tracker(game).pendingWindow;
            const fullRollback = game.snapshotManager.rollbackTo({ type: SnapshotType.Manual, playerId: context.player1.id, snapshotId });
            expect(tracker(game).pendingWindow).not.toBe(consumed);
            expect(tracker(game).pendingWindow.changedFields.size).toBe(0);
            settle(game, fullRollback);

            attack(context.player1, context.wampa, context.p2Base);
            const delta = indexOf(game).get(factoryOf(game).currentActionSnapshot.id);
            expect(delta.anchorSnapshotId).toBe(actionStart.id);
            for (const [uuid, fields] of delta.changedFields) {
                for (const [field, value] of Object.entries(fields)) {
                    expect(value).toEqual(reference.states[uuid]?.[field], `${uuid}.${field}`);
                }
            }

            const result = game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player1.id });
            expect(result.success).toBeTrue();
            expect(game.snapshotManager.currentSnapshotId).toBe(actionStart.id);
            expect(compareLiveWithSnapshot(game, reference)).toBeNull();
            settle(game, result);
        });

        it('window-dropped-after-consumption: a successful restore drops the window it consumed, so it can never be resumed or applied', async function() {
            const context = await setupBoard();
            const game = context.game;
            attack(context.player1, context.wampa, context.p2Base);
            const materialized = game.snapshotManager.materializeCurrentSnapshot();
            (context.atst as unknown as IDamageUnit).setDamageForStateInjection(3);

            // Managed: the consumed window is replaced by a fresh one at the restored snapshot.
            const consumed = tracker(game).pendingWindow;
            settle(game, game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player2.id }));
            expect(tracker(game).pendingWindow).not.toBe(consumed);
            expect(tracker(game).pendingWindow.anchor.snapshotId).toBe(materialized.id);

            // Raw (test-only, outside SnapshotManager): the window is dropped and nothing can resume or apply it.
            (context.atst as unknown as IDamageUnit).setDamageForStateInjection(3);
            expect((game.gameObjectManager as unknown as GameStateManager).rollbackToSnapshot(materialized)).toBeTrue();
            expect(tracker(game).pendingWindow).toBeNull();
            expect(tracker(game).isTracking).toBeFalse();
            expect(() => tracker(game).resumeTracking()).toThrowError(/requires a window/);
            expect(() => game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player2.id })).toThrowError(/no valid delta tracker window/);
        });
    });
});
