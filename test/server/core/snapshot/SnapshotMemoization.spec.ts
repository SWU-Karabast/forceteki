import { GameErrorSeverity, SnapshotType, TokenUnitName } from '../../../../server/game/core/Constants';
import { GameObjectBase } from '../../../../server/game/core/GameObjectBase';
import { getRuntimeStateFieldModelByClassName, registerState, statePrimitive } from '../../../../server/game/core/GameObjectUtils';
import type { SerializedStateRecord } from '../../../../server/game/core/StateEncoding';
import * as StateSerializers from '../../../../server/game/core/StateSerializers';
import type { DeltaTracker, IDeltaTrackerWindow } from '../../../../server/game/core/snapshot/DeltaTracker';
import { DeltaTrackerMode } from '../../../../server/game/core/snapshot/DeltaTracker';
import type { IGameSnapshot, IRollbackResult } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { SnapshotTimepoint } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { exemptGameFromDeltaChainVerification } from '../../../helpers/DeltaChainVerifier';
import { exemptGameFromDeltaParity, withDeltaParitySuspended } from '../../../helpers/DeltaParityGate';
import { getParityHarnessStats, withParityHarnessSuspended } from '../../../helpers/ParityHarness';
import {
    getSnapshotMemoVerifierStats,
    isSnapshotMemoVerifierInstalled,
    withExpectedMemoMismatch,
    withSnapshotMemoVerifierSuspended
} from '../../../helpers/SnapshotMemoVerifier';

/**
 * P4-C: `GameStateManager.buildGameStateForSnapshot` reuses an object's record from the current snapshot when the
 * delta tracker saw the object untouched since that snapshot, and the outermost rollback pre-pass reuses it for the
 * same objects (`docs/plans/04-delta-snapshots.md`, "As landed in P4-C"). The test-mode verifier
 * (`test/helpers/SnapshotMemoVerifier.ts`) compares every built record with a fresh serialize in every run; the cases
 * below pin the reuse decision itself and the verifier's own discrimination.
 *
 * Every case ends with the factory's current snapshot and the tracker's window anchored at the same snapshot, because
 * the verifier would otherwise flag the harness's own start-of-test rollback. Under `ENABLE_UNDO_ALL_TESTS` each body
 * runs twice (a rollback to the start-of-test snapshot in between), so patches are plain assignments restored in a
 * `finally` (a second `spyOn` would throw) and a case that changes the tracker mode restores it.
 */

interface ISnapshotFactoryInternals {
    currentActionSnapshot: IGameSnapshot;
    createSnapshotForCurrentTimepoint(timepoint: SnapshotTimepoint): void;
}
interface ISnapshotManagerInternals {
    snapshotFactory: ISnapshotFactoryInternals;
    manualSnapshots: Map<string, { rollbackToSnapshot(snapshotId: number): number | null }>;
}
interface IStateManagerInternals {
    allGameObjects: GameObjectBase[];
    registeredObjectCount: number;
    lastGameObjectId: number;
    isRegistered(go: GameObjectBase): boolean;
    buildGameStateForSnapshot(previous?: IGameSnapshot | null): Record<string, SerializedStateRecord>;
    rollbackToSnapshot(snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot): boolean;
}
interface IDamageUnit {
    uuid: string;
    setDamageForStateInjection(value: number): void;
}
interface ITriggeredAbilityInternals {
    uuid: string;
    isRegistered: boolean;
    eventRegistrations: { name: string }[] | null;
}

const integrationWithUndo = integration as unknown as (
    definitions: (contextRef: SwuTestContextRef) => void,
    enableUndo: boolean
) => void;

const undoReplayEnabled = process.env.ENABLE_UNDO_ALL_TESTS === 'true';

// Spec-local fixture: the generator only scans the server tree, so it needs the registry entry below to be serialized
// like a real object. One primitive field is enough to tell two instances' records apart.
@registerState()
class SnapshotMemoFixture extends GameObjectBase {
    @statePrimitive() public accessor value: number = 0;
}

const fixtureFields = getRuntimeStateFieldModelByClassName('SnapshotMemoFixture');
StateSerializers.registerStateSerializers([{
    className: 'SnapshotMemoFixture',
    decorator: 'registerState',
    isAbstract: false,
    fields: fixtureFields,
    serializer: {
        serialize: (instance) => {
            const record: SerializedStateRecord = {};
            for (const field of fixtureFields) {
                record[field.name] = (instance as unknown as Record<string, unknown>)[field.name];
            }
            return record;
        },
        deserialize: (_game, instance, record) => {
            for (const field of fixtureFields) {
                (instance as unknown as Record<string, unknown>)[field.name] = record[field.name];
            }
        }
    }
}]);

function managerOf(game): ISnapshotManagerInternals {
    return game.snapshotManager as unknown as ISnapshotManagerInternals;
}

function factoryOf(game): ISnapshotFactoryInternals {
    return managerOf(game).snapshotFactory;
}

function stateManagerOf(game): IStateManagerInternals {
    return game.gameObjectManager as unknown as IStateManagerInternals;
}

function tracker(game): DeltaTracker {
    return game.deltaTracker as DeltaTracker;
}

function currentSnapshot(game): IGameSnapshot {
    return factoryOf(game).currentActionSnapshot;
}

/** Takes a snapshot the way the engine does at a timepoint and returns it. */
function takeSnapshot(game): IGameSnapshot {
    factoryOf(game).createSnapshotForCurrentTimepoint(SnapshotTimepoint.Action);
    return currentSnapshot(game);
}

function freshRecord(go: unknown): SerializedStateRecord {
    const instance = go as GameObjectBase;
    return StateSerializers.getStateSerializerFor(instance).serializer.serialize(instance);
}

/**
 * The spec's own manual rollback. It always takes the full restore, even under the whole-suite delta-parity gate: the subject is
 * memoization around full snapshots and the full restore's pre-pass, and this spec's boards run in DirtyOnly mode, whose windows the
 * delta chain cannot restore by design (P4-F B1).
 */
function rollbackManual(context, snapshotId: number): IRollbackResult {
    return withDeltaParitySuspended(context.game, 'memoization spec: DirtyOnly boards and the full restore path are the subject', () =>
        context.game.snapshotManager.rollbackTo({ type: SnapshotType.Manual, playerId: context.player1Object.id, snapshotId }));
}

/** `rollbackTo` alone leaves the pipeline stale; the engine's own caller finishes with this. */
function settle(context, result: IRollbackResult): void {
    if (result.success) {
        context.game.postRollbackOperations(result.entryPoint);
    }
}

/**
 * Repairs a deliberate delta-lineage break (a write or registration the tracker never saw, or a DirtyOnly window) with a full managed
 * rollback to a snapshot taken before it, so the undo replay's delta-restored rollback to the start-of-test snapshot still applies.
 */
function rollbackPastLineageBreak(context, snapshotId: number): void {
    const result = rollbackManual(context, snapshotId);
    expect(result.success).toBeTrue();
    settle(context, result);
}

/** Patches `target[name]` for the duration of `body`, restoring in a finally. Not `spyOn`: the undo replay runs a case body twice. */
function withPatch<T>(target: object, name: string, replacement: unknown, body: () => T): T {
    const record = target as Record<string, unknown>;
    const hadOwn = Object.prototype.hasOwnProperty.call(target, name);
    const original = record[name];
    record[name] = replacement;
    try {
        return body();
    } finally {
        if (hadOwn) {
            record[name] = original;
        } else {
            Reflect.deleteProperty(target, name);
        }
    }
}

/**
 * For the pre-pass cases that count, or inject a failure into, the `serialize` calls of one rollback: neither the memoization verifier
 * nor the parity harness (whose own round-trip serializes every restored object) may add serialize traffic of its own.
 */
function withRollbackTrafficSuspended<T>(fn: () => T): T {
    const parityInstalledBefore = getParityHarnessStats().installedAtExit;
    const result = withParityHarnessSuspended(() => withSnapshotMemoVerifierSuspended(fn));
    expect(getParityHarnessStats().installedAtExit).toBe(parityInstalledBefore);
    return result;
}

/** Records the uuid of every object `serialize` is called on, in order, across every registered serializer entry. */
function withSerializeLog(log: string[], body: () => void): void {
    const entries = StateSerializers.getAllGeneratedSerializerEntries();
    const originals = entries.map((entry) => entry.serializer.serialize);
    entries.forEach((entry, index) => {
        const original = originals[index];
        entry.serializer.serialize = (instance) => {
            log.push((instance as unknown as { uuid: string }).uuid);
            return original(instance);
        };
    });
    try {
        body();
    } finally {
        entries.forEach((entry, index) => {
            entry.serializer.serialize = originals[index];
        });
    }
}

function expectNoSharedRecords(states: Record<string, SerializedStateRecord>, reference: IGameSnapshot): void {
    let compared = 0;
    for (const uuid of Object.keys(states)) {
        const referenceRecord = reference.states[uuid];
        if (referenceRecord !== undefined) {
            compared++;
            expect(states[uuid]).not.toBe(referenceRecord, `${uuid} was reused in a build that must serialize everything`);
        }
    }
    expect(compared).toBeGreaterThan(0);
}

/** Every uuid the window shows dirty or created must be fresh; every other uuid in the previous snapshot must be shared. */
function expectSharingMatchesWindow(window: IDeltaTrackerWindow, previous: IGameSnapshot, next: IGameSnapshot): void {
    const touched = new Set<string>([...window.changedFields.keys(), ...window.createdObjectUuids]);
    let shared = 0;
    for (const uuid of Object.keys(next.states)) {
        if (touched.has(uuid)) {
            expect(next.states[uuid]).not.toBe(previous.states[uuid], `${uuid} is dirty or created but its record was reused`);
        } else {
            shared++;
            expect(next.states[uuid]).toBe(previous.states[uuid], `${uuid} is untouched but its record was re-serialized`);
        }
    }
    expect(shared).toBeGreaterThan(0);
}

/** After a rollback to `restored`, the next build (before the pipeline restarts) holds exactly `restored`'s record objects. */
function expectNextBuildReusesRestored(game, restored: IGameSnapshot, discarded: IGameSnapshot[], changedUuids: string[]): IGameSnapshot {
    const next = takeSnapshot(game);
    expect(Object.keys(next.states).sort()).toEqual(Object.keys(restored.states).sort());
    for (const uuid of Object.keys(restored.states)) {
        expect(next.states[uuid]).toBe(restored.states[uuid], `${uuid} was not taken from the restored snapshot`);
    }
    // An object written after the restored snapshot differs from it in the discarded snapshots taken after the write.
    const differing = new Set<string>();
    for (const discardedSnapshot of discarded) {
        for (const uuid of changedUuids) {
            if (JSON.stringify(discardedSnapshot.states[uuid]) === JSON.stringify(restored.states[uuid])) {
                continue;
            }
            differing.add(uuid);
            expect(next.states[uuid]).not.toBe(discardedSnapshot.states[uuid], `${uuid} was taken from discarded snapshot ${discardedSnapshot.id}`);
            expect(next.states[uuid]).not.toEqual(discardedSnapshot.states[uuid], `${uuid} carries a value from discarded snapshot ${discardedSnapshot.id}`);
        }
    }
    expect(differing.size).toBe(changedUuids.length);
    return next;
}

describe('Snapshot memoization', function() {
    integrationWithUndo(function(contextRef) {
        /**
         * P4-F: an action snapshot is hollow (no records) when the windows on both sides of it capture old values, and this spec's
         * subject is memoization of consecutive full snapshots, so every board runs with the tracker in DirtyOnly mode, where every
         * snapshot stays full (plan B7). A DirtyOnly window cannot be restored through the delta chain, so under whole-suite undo
         * each case ends with {@link memoIt}'s repair: a full rollback to the board's setup snapshot before the harness's
         * delta-restored replay rollback.
         */
        let fullSnapshotBoard: { context: SwuTestContext; setupSnapshotId: number } | null = null;

        function enterFullSnapshotMode(context: SwuTestContext): void {
            fullSnapshotBoard = { context, setupSnapshotId: contextRef.snapshot.takeManualSnapshot(context.player1Object) };
            tracker(context.game).setMode(DeltaTrackerMode.DirtyOnly);
        }

        function memoIt(expectation: string, body: () => Promise<void>): void {
            it(expectation, async function() {
                fullSnapshotBoard = null;
                await body();

                const board = fullSnapshotBoard;
                fullSnapshotBoard = null;
                if (board !== null && board.context.isUndoTest) {
                    tracker(board.context.game).setMode(DeltaTrackerMode.CaptureOldValues);
                    rollbackPastLineageBreak(board.context, board.setupSnapshotId);
                }
            });
        }

        async function setupBoard() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'], hand: ['battlefield-marine'], resources: 6 },
                player2: { spaceArena: ['cartel-spacer'] }
            });
            enterFullSnapshotMode(contextRef.context);
            return contextRef.context;
        }

        /** A registered, referenced fixture, i.e. state that exists when the next snapshot is taken. */
        function newFixture(context, value: number): SnapshotMemoFixture {
            const fixture = new SnapshotMemoFixture(context.game);
            fixture.value = value;
            fixture.getObjectId();
            return fixture;
        }

        describe('build', function() {
            for (const mode of [DeltaTrackerMode.DirtyOnly, DeltaTrackerMode.CaptureOldValues]) {
                memoIt(`AC1 and AC8 share the record of an untouched object and re-serialize a written or created one (${mode} window)`, async function() {
                    const context = await setupBoard();
                    const game = context.game;
                    const wampa = context.wampa as unknown as IDamageUnit;
                    // Close the setup's capture window first, so `first` closes a DirtyOnly window and is full in either mode (P4-F).
                    takeSnapshot(game);
                    tracker(game).setMode(mode);

                    try {
                        const first = takeSnapshot(game);
                        expect(tracker(game).pendingWindow.mode).toBe(mode);
                        wampa.setDamageForStateInjection(2);
                        const token = game.generateToken(context.player1Object, TokenUnitName.BattleDroid);
                        const window = tracker(game).pendingWindow;
                        // The window after `second` is DirtyOnly, so `second` is full and memoizes over the `mode` window (P4-F).
                        tracker(game).setMode(DeltaTrackerMode.DirtyOnly);
                        const second = takeSnapshot(game);

                        expect(second.states).not.toBe(first.states);
                        expect(second.states[context.cartelSpacer.uuid]).toBe(first.states[context.cartelSpacer.uuid]);
                        expect(second.states[wampa.uuid]).not.toBe(first.states[wampa.uuid]);
                        expect(second.states[wampa.uuid]).toEqual(freshRecord(wampa));
                        expect(first.states[token.uuid]).toBeUndefined();
                        expect(second.states[token.uuid]).toEqual(freshRecord(token));
                        expectSharingMatchesWindow(window, first, second);
                    } finally {
                        tracker(game).setMode(DeltaTrackerMode.DirtyOnly);
                    }
                });
            }

            memoIt('AC1 places a fresh record for a uuid reissued after a raw restore, not the removed instance\'s record', async function() {
                const context = await setupBoard();
                const game = context.game;
                const manager = stateManagerOf(game);

                const older = takeSnapshot(game);
                const removed = newFixture(context, 1);
                const reissuedUuid = removed.uuid;
                const current = takeSnapshot(game);
                expect(current.states[reissuedUuid]).toEqual(freshRecord(removed));

                // A raw restore with the tracker running rewinds the uuid counter and leaves the current snapshot alone; since P4-F it
                // drops the window its writes bypassed, so the next snapshot starts a new tracking run and nothing is reused.
                expect(tracker(game).isTracking).toBeTrue();
                exemptGameFromDeltaChainVerification(game, 'a raw restore drops the tracker window, so the next snapshot starts a new tracking run the undo replay\'s chain cannot cross');
                exemptGameFromDeltaParity(game, 'a raw GameStateManager restore outside SnapshotManager drops the tracker window and starts a new tracking run');
                expect(manager.rollbackToSnapshot(older)).toBeTrue();
                expect(manager.isRegistered(removed)).toBeFalse();
                expect(tracker(game).pendingWindow).toBeNull();
                expect(tracker(game).isTracking).toBeFalse();

                const reissued = newFixture(context, 2);
                expect(reissued.uuid).toBe(reissuedUuid);

                const next = takeSnapshot(game);
                expect(next.states[reissuedUuid]).not.toBe(current.states[reissuedUuid]);
                expect((next.states[reissuedUuid] as { value: number }).value).toBe(2);
                expect(next.states[reissuedUuid]).toEqual(freshRecord(reissued));
            });

            memoIt('AC2 serializes every object for a build with the tracker stopped, a window anchored elsewhere, no window, and no previous snapshot', async function() {
                const context = await setupBoard();
                const game = context.game;
                const manager = stateManagerOf(game);
                const trackerInstance = tracker(game);
                exemptGameFromDeltaChainVerification(game, 'a raw restore restarts the tracker window at an older snapshot while the factory\'s current snapshot stays newer, so the next delta anchors off the index head');
                exemptGameFromDeltaParity(game, 'a raw GameStateManager restore outside SnapshotManager restarts the tracker window at an older snapshot off the index head');

                // The tracker stopped: the factory restarts the window afterwards.
                const stopped = takeSnapshot(game);
                trackerInstance.stopTracking();
                const afterStopped = takeSnapshot(game);
                expectNoSharedRecords(afterStopped.states, stopped);
                expect(trackerInstance.isTracking).toBeTrue();

                // A zero-argument call is a full serialize.
                expectNoSharedRecords(manager.buildGameStateForSnapshot(), afterStopped);

                // A raw restore whose window was restarted at another snapshot (the benchmark's restoreUntracked shape).
                const older = takeSnapshot(game);
                const newer = takeSnapshot(game);
                trackerInstance.stopTracking();
                try {
                    expect(manager.rollbackToSnapshot(older)).toBeTrue();
                } finally {
                    trackerInstance.startTracking({ snapshotId: older.id, rngState: older.rngState, lastGameObjectId: older.lastGameObjectId });
                }
                expect(trackerInstance.pendingWindow.anchor.snapshotId).not.toBe(newer.id);
                expectNoSharedRecords(takeSnapshot(game).states, newer);

                // No previous snapshot: what the factory passes before its first snapshot and after clearAllSnapshots.
                const reference = currentSnapshot(game);
                expectNoSharedRecords(manager.buildGameStateForSnapshot(null), reference);
            });

            memoIt('AC2 serializes every object for the first snapshot after clearAllSnapshots', async function() {
                const context = await setupBoard();
                if (undoReplayEnabled) {
                    pending('clearAllSnapshots removes the start-of-test snapshot the undo replay rolls back to');
                }
                const game = context.game;
                const reference = takeSnapshot(game);

                game.snapshotManager.clearAllSnapshots();
                expect(tracker(game).pendingWindow).toBeNull();

                const first = takeSnapshot(game);
                expectNoSharedRecords(first.states, reference);
                // The window starts again at the new snapshot, so the next build shares.
                const second = takeSnapshot(game);
                expect(second.states[context.cartelSpacer.uuid]).toBe(first.states[context.cartelSpacer.uuid]);
            });

            memoIt('AC3 culls an unreferenced object registered in the window before any record is chosen, and the key count equals the live count', async function() {
                const context = await setupBoard();
                const game = context.game;
                const manager = stateManagerOf(game);

                takeSnapshot(game);
                const orphan = new SnapshotMemoFixture(game);
                const referenced = newFixture(context, 3);
                expect(manager.isRegistered(orphan)).toBeTrue();

                const next = takeSnapshot(game);

                expect(next.states[orphan.uuid]).toBeUndefined();
                expect(manager.isRegistered(orphan)).toBeFalse();
                expect(next.states[referenced.uuid]).toEqual(freshRecord(referenced));
                expect(Object.keys(next.states).length).toBe(manager.registeredObjectCount);
            });
        });

        describe('rollback', function() {
            /** S1, write A, S2, write B, S3 (the harness's helper calls only), returning what the case needs to roll back and compare. */
            function writeAcrossSnapshots(context, snapshotAfterEachWrite: () => IGameSnapshot) {
                const wampa = context.wampa as unknown as IDamageUnit;
                const spacer = context.cartelSpacer as unknown as IDamageUnit;
                wampa.setDamageForStateInjection(1);
                const second = snapshotAfterEachWrite();
                spacer.setDamageForStateInjection(1);
                const third = snapshotAfterEachWrite();
                return { wampa, spacer, second, third };
            }

            memoIt('AC4 resets the memo to the restored snapshot after a manual rollback', async function() {
                const context = await setupBoard();
                const game = context.game;

                const first = takeSnapshot(game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                const { wampa, spacer, second, third } = writeAcrossSnapshots(context, () => takeSnapshot(game));

                const result = rollbackManual(context, snapshotId);
                expect(result.success).toBeTrue();
                expect(currentSnapshot(game)).toBe(first);

                expectNextBuildReusesRestored(game, first, [second, third], [wampa.uuid, spacer.uuid]);
                settle(context, result);
            });

            memoIt('AC4 resets the memo to the restored snapshot after an action rollback', async function() {
                const context = await setupBoard();
                const game = context.game;
                const playerId = context.player1Object.id;

                game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
                game.snapshotManager.takeSnapshot({ type: SnapshotType.Action, playerId });
                const restored = currentSnapshot(game);
                const { wampa, spacer, second, third } = writeAcrossSnapshots(context, () => {
                    game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
                    return currentSnapshot(game);
                });

                const result: IRollbackResult = game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId });
                expect(result.success).toBeTrue();
                expect(currentSnapshot(game)).toBe(restored);

                expectNextBuildReusesRestored(game, restored, [second, third], [wampa.uuid, spacer.uuid]);
                settle(context, result);
            });

            memoIt('AC4 resets the memo to the restored snapshot after a quick rollback', async function() {
                const context = await setupBoard();
                const game = context.game;
                const playerId = context.player1Object.id;
                const wampa = context.wampa as unknown as IDamageUnit;

                // P4-F: the setup's action snapshot is hollow and its chain would cross this board's DirtyOnly window, so the quick
                // target is a full action snapshot taken first.
                game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
                game.snapshotManager.takeSnapshot({ type: SnapshotType.Action, playerId });

                wampa.setDamageForStateInjection(1);
                game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
                game.snapshotManager.takeSnapshot({ type: SnapshotType.Action, playerId });
                const discarded = currentSnapshot(game);

                const result: IRollbackResult = game.snapshotManager.rollbackTo({ type: SnapshotType.Quick, playerId });
                expect(result.success).toBeTrue();
                const restored = currentSnapshot(game);
                expect(restored).not.toBe(discarded);

                expectNextBuildReusesRestored(game, restored, [discarded], [wampa.uuid]);
                settle(context, result);
            });

            memoIt('AC4 keeps the held window, and re-serializes an object written before it, when a rollback enters rollbackToInternal and restores nothing', async function() {
                const context = await setupBoard();
                const game = context.game;
                const wampa = context.wampa as unknown as IDamageUnit;
                const trackerInstance = tracker(game);

                const first = takeSnapshot(game);
                wampa.setDamageForStateInjection(2);
                const window = trackerInstance.pendingWindow;
                expect(window.changedFields.has(wampa.uuid)).toBeTrue();

                // This player has no action snapshot, so the container returns nothing to restore (a request refused by
                // rollbackTo's undo-mode check would return before the tracker is touched and prove nothing).
                const refused: IRollbackResult = game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: context.player2Object.id });
                expect(refused.success).toBeFalse();
                expect(trackerInstance.pendingWindow).toBe(window);
                expect(trackerInstance.isTracking).toBeTrue();

                const next = takeSnapshot(game);
                expect(next.states[wampa.uuid]).not.toBe(first.states[wampa.uuid]);
                expect(next.states[wampa.uuid]).toEqual(freshRecord(wampa));
                expect(next.states[context.cartelSpacer.uuid]).toBe(first.states[context.cartelSpacer.uuid]);
            });
        });

        describe('verifier', function() {
            memoIt('AC5 is installed and its counts grow across a scripted action and a manual rollback', async function() {
                const context = await setupBoard();
                if (!isSnapshotMemoVerifierInstalled()) {
                    pending('the verifier is not installed when RUN_PERF_BENCHMARKS is set');
                }

                takeSnapshot(context.game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                const before = getSnapshotMemoVerifierStats();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                const result = rollbackManual(context, snapshotId);
                expect(result.success).toBeTrue();
                settle(context, result);

                const after = getSnapshotMemoVerifierStats();
                expect(after.buildsVerified).toBeGreaterThan(before.buildsVerified);
                expect(after.recordsVerifiedAtBuilds).toBeGreaterThan(before.recordsVerifiedAtBuilds);
                expect(after.recordsReusedAtBuilds).toBeGreaterThan(before.recordsReusedAtBuilds);
                expect(after.prepassRecordsReusedAndVerified).toBeGreaterThan(before.prepassRecordsReusedAndVerified);
                expect(after.recordsFrozen).toBeGreaterThanOrEqual(before.recordsFrozen);
                expect(after.failures).toBe(before.failures);
            });

            memoIt('AC6 reports a field write made while the tracker was stopped, naming the object and field, at the next build', async function() {
                const context = await setupBoard();
                const game = context.game;
                const wampa = context.wampa as unknown as IDamageUnit;
                const trackerInstance = tracker(game);

                takeSnapshot(game);
                trackerInstance.stopTracking();
                wampa.setDamageForStateInjection(3);
                trackerInstance.resumeTracking();

                const reported = withExpectedMemoMismatch(() => {
                    takeSnapshot(game);
                });

                expect(reported.length).toBe(1);
                expect(reported[0].site).toBe('build');
                expect(reported[0].uuid).toBe(wampa.uuid);
                expect(reported[0].field).toBe('_damage');

                // Undo the change, re-dirty the object through a hooked write and snapshot again, so no stale record survives the case.
                wampa.setDamageForStateInjection(0);
                takeSnapshot(game);
            });

            memoIt('AC6 reports an in-place push onto a Player decklist list, naming the Player and its _decklist, at the next build', async function() {
                const context = await setupBoard();
                const game = context.game;
                const player = context.player1Object;

                takeSnapshot(game);
                const original = [...player.decklist.tokens];
                player.decklist.tokens.push('MemoVerifierProbe');

                const reported = withExpectedMemoMismatch(() => {
                    takeSnapshot(game);
                });

                expect(reported.length).toBe(1);
                expect(reported[0].site).toBe('build');
                expect(reported[0].uuid).toBe(player.uuid);
                expect(reported[0].field).toMatch(/^_decklist/);

                // Remove the probe, re-dirty the Player through a hooked write and snapshot again.
                player.decklist.tokens.length = 0;
                player.decklist.tokens.push(...original);
                const passed = player.passedActionPhase;
                player.passedActionPhase = !passed;
                player.passedActionPhase = passed;
                takeSnapshot(game);
            });

            memoIt('AC7 leaves every retained record and every shared identity unchanged across rollbacks and in-place mutation of live collections', async function() {
                const context = await setupBoard();
                const game = context.game;
                const deckZone = context.player1Object.deckZone;

                const first = takeSnapshot(game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                const { wampa, spacer, second, third } = (() => {
                    (context.wampa as unknown as IDamageUnit).setDamageForStateInjection(1);
                    const afterA = takeSnapshot(game);
                    (context.cartelSpacer as unknown as IDamageUnit).setDamageForStateInjection(1);
                    const afterB = takeSnapshot(game);
                    return { wampa: context.wampa as IDamageUnit, spacer: context.cartelSpacer as IDamageUnit, second: afterA, third: afterB };
                })();

                const firstRollback = rollbackManual(context, snapshotId);
                expect(firstRollback.success).toBeTrue();
                const fourth = expectNextBuildReusesRestored(game, first, [second, third], [wampa.uuid, spacer.uuid]);

                const retained = [first, second, third, fourth];
                const jsonBefore = retained.map((snapshot) => JSON.stringify(snapshot.states));
                const deckRecordBefore = JSON.stringify(first.states[deckZone.uuid]);

                // Hooked in-place mutations of live collections whose records are shared by S1 and S4.
                const deckSizeBefore = deckZone.deck.length;
                deckZone.removeTopCard();
                game.state.allCards.push('MemoMutationProbe');
                game.state.movedCards.push('MemoMutationProbe');
                expect(deckZone.deck.length).toBe(deckSizeBefore - 1);

                const secondRollback = rollbackManual(context, snapshotId);
                expect(secondRollback.success).toBeTrue();

                expect(retained.map((snapshot) => JSON.stringify(snapshot.states))).toEqual(jsonBefore);
                expect(JSON.stringify(first.states[deckZone.uuid])).toBe(deckRecordBefore);
                for (const uuid of Object.keys(first.states)) {
                    expect(fourth.states[uuid]).toBe(first.states[uuid], `${uuid} lost its shared identity`);
                }
                expect(second.states[wampa.uuid]).not.toBe(first.states[wampa.uuid]);
                expect(third.states[spacer.uuid]).not.toBe(first.states[spacer.uuid]);
                // Restored collections are copies, never the record's own arrays.
                expect(deckZone.deck.length).toBe(deckSizeBefore);
                expect(deckZone.deck).not.toBe(first.states[deckZone.uuid]._deck);
                expect([...game.state.allCards]).not.toContain('MemoMutationProbe');

                settle(context, secondRollback);
            });
        });

        describe('token decklist', function() {
            memoIt('AC9 lists a generated token in the next Player record and restores the decklist around it', async function() {
                const context = await setupBoard();
                const game = context.game;
                const player = context.player1Object;

                takeSnapshot(game);
                const beforeId = contextRef.snapshot.takeManualSnapshot(player);
                const token = game.generateToken(player, TokenUnitName.BattleDroid);
                const tokenId = token.getObjectId();
                const afterSnapshot = takeSnapshot(game);
                const afterId = contextRef.snapshot.takeManualSnapshot(player);

                const playerRecord = afterSnapshot.states[player.uuid] as { _decklist: { tokens: string[]; allCards: string[] } };
                expect(playerRecord._decklist.tokens).toContain(tokenId);
                expect(playerRecord._decklist.allCards).toContain(tokenId);

                // A second token, newer than the snapshot after the first.
                const second = game.generateToken(player, TokenUnitName.BattleDroid);
                takeSnapshot(game);
                expect(player.decklist.tokens).toContain(second.getObjectId());

                const toAfter = rollbackManual(context, afterId);
                expect(toAfter.success).toBeTrue();
                expect(player.decklist.tokens).toContain(tokenId);
                expect(player.decklist.allCards).toContain(tokenId);
                expect(player.decklist.tokens.length).toBe(playerRecord._decklist.tokens.length);

                const toBefore = rollbackManual(context, beforeId);
                expect(toBefore.success).toBeTrue();
                expect(player.decklist.tokens).not.toContain(tokenId);
                expect(player.decklist.allCards).not.toContain(tokenId);
                expect(player.decklist.tokens.length).toBe(playerRecord._decklist.tokens.length - 1);
                settle(context, toBefore);
            });
        });

        describe('pre-pass', function() {
            memoIt('AC10 hands the outermost pre-pass the current snapshot\'s record for a clean object and a fresh record for a written one', async function() {
                const context = await setupBoard();
                const game = context.game;
                const wampa = context.wampa as unknown as IDamageUnit;
                const spacer = context.cartelSpacer as unknown as IDamageUnit;

                takeSnapshot(game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                wampa.setDamageForStateInjection(2);
                const current = takeSnapshot(game);
                wampa.setDamageForStateInjection(3);
                const wampaBeforeRollback = freshRecord(wampa);

                const captured = new Map<string, SerializedStateRecord>();
                const capture = (go: IDamageUnit) => {
                    const original = (go as unknown as GameObjectBase).afterSetAllState;
                    return (oldState: SerializedStateRecord) => {
                        captured.set(go.uuid, oldState);
                        original.call(go, oldState);
                    };
                };

                let result: IRollbackResult;
                withPatch(wampa, 'afterSetAllState', capture(wampa), () => withPatch(spacer, 'afterSetAllState', capture(spacer), () => {
                    result = rollbackManual(context, snapshotId);
                }));

                expect(result.success).toBeTrue();
                expect(captured.get(spacer.uuid)).toBe(current.states[spacer.uuid]);
                expect(captured.get(wampa.uuid)).not.toBe(current.states[wampa.uuid]);
                expect(captured.get(wampa.uuid)).toEqual(wampaBeforeRollback);
                settle(context, result);
            });

            memoIt('AC10 serializes only the written, created and unrecorded objects in the outermost pre-pass', async function() {
                const context = await setupBoard();
                const game = context.game;
                const manager = stateManagerOf(game);
                const trackerInstance = tracker(game);
                const wampa = context.wampa as unknown as IDamageUnit;

                takeSnapshot(game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                takeSnapshot(game);
                wampa.setDamageForStateInjection(2);
                const created = newFixture(context, 1);
                // Registered while the tracker is stopped: not in the window, not in the current snapshot.
                trackerInstance.stopTracking();
                const unrecorded = newFixture(context, 2);
                trackerInstance.resumeTracking();

                const window = trackerInstance.pendingWindow;
                const live = new Set(manager.allGameObjects.map((go) => go.uuid));
                const expected = new Set<string>([...window.changedFields.keys(), ...window.createdObjectUuids].filter((uuid) => live.has(uuid)));
                expected.add(unrecorded.uuid);
                expect(expected.has(wampa.uuid)).toBeTrue();
                expect(expected.has(created.uuid)).toBeTrue();
                expect(expected.has(context.cartelSpacer.uuid)).toBeFalse();
                const liveCount = manager.registeredObjectCount;

                const serialized: string[] = [];
                let result: IRollbackResult;
                withRollbackTrafficSuspended(() => withSerializeLog(serialized, () => {
                    result = rollbackManual(context, snapshotId);
                }));

                expect(result.success).toBeTrue();
                expect(new Set(serialized)).toEqual(expected);
                expect(serialized.length).toBe(expected.size);
                expect(serialized.length).toBeLessThan(liveCount);
                settle(context, result);
            });

            memoIt('AC10 serializes every object in the nested recovery frame, so a clean triggered ability whose registration differed is registered again', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['cartel-spacer'], groundArena: ['wampa'], resources: 6 },
                    player2: { groundArena: ['battlefield-marine'] }
                });
                const { context } = contextRef;
                enterFullSnapshotMode(context);
                const game = context.game;
                const spacer = context.cartelSpacer;
                const abilities = [...spacer.triggeredAbilities] as ITriggeredAbilityInternals[];
                expect(abilities.length).toBeGreaterThan(0);

                const target = takeSnapshot(game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                const unregisteredAtTarget = abilities.filter((ability) => !ability.isRegistered);
                expect(unregisteredAtTarget.length).toBeGreaterThan(0);

                context.player1.clickCard(spacer);
                expect(spacer).toBeInZone('spaceArena');
                const current = currentSnapshot(game);
                expect(current).not.toBe(target);

                const ability = unregisteredAtTarget.find((candidate) => candidate.isRegistered);
                expect(ability).toBeDefined('no triggered ability registered when the unit entered play');
                const eventNames = ability.eventRegistrations.map((event) => event.name);
                const listenersBefore = eventNames.map((name) => game.listenerCount(name));
                expect(tracker(game).pendingWindow.changedFields.has(ability.uuid)).toBeFalse();

                const stateEntry = StateSerializers.getStateSerializerFor(game.state);
                const marker = '--restore failed--';
                const serialized: string[] = [];
                let failed = false;

                withRollbackTrafficSuspended(() => withSerializeLog(serialized, () => {
                    // Read inside the suspension: before it, this is the parity harness's wrapper, which would still compare Game.state.
                    const originalDeserialize = stateEntry.serializer.deserialize;
                    withPatch(stateEntry.serializer, 'deserialize', (gameArg, instance, record) => {
                        if (!failed && instance === game.state) {
                            failed = true;
                            serialized.push(marker);
                            throw new Error('injected restore failure on Game.state');
                        }
                        originalDeserialize(gameArg, instance, record);
                    }, () => {
                        // A recovered failure makes the manual container assert a restored id, as DeltaTracker.spec's equivalent case does.
                        expect(() => rollbackManual(context, snapshotId)).toThrowError(/does not exist/);
                    });
                }));

                expect(failed).toBeTrue();
                const failureIndex = serialized.indexOf(marker);
                const outerFrame = serialized.slice(0, failureIndex);
                const nestedFrame = serialized.slice(failureIndex + 1);
                expect(outerFrame).not.toContain(ability.uuid);
                expect(nestedFrame).toContain(ability.uuid);
                expect(new Set(nestedFrame).size).toBe(stateManagerOf(game).registeredObjectCount);

                expect(ability.isRegistered).toBeTrue();
                expect(ability.eventRegistrations).not.toBeNull();
                expect(eventNames.map((name) => game.listenerCount(name))).toEqual(listenersBefore);
                expect(spacer).toBeInZone('spaceArena');
            });

            memoIt('AC10 does not reach a pre-pass encode failure injected on a clean object, and still aborts, writing nothing, for one on a written object', async function() {
                const context = await setupBoard();
                const game = context.game;
                const wampa = context.wampa as unknown as IDamageUnit;
                const spacer = context.cartelSpacer as unknown as GameObjectBase;
                const playerId = context.player1Object.id;

                takeSnapshot(game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                wampa.setDamageForStateInjection(2);
                takeSnapshot(game);
                wampa.setDamageForStateInjection(3);

                const injectEncodeFailure = (target: GameObjectBase, body: () => void) => {
                    const entry = StateSerializers.getStateSerializerFor(target);
                    const originalSerialize = entry.serializer.serialize;
                    entry.serializer.serialize = function(instance) {
                        if (instance === target) {
                            throw new Error('P4C_AC10_INJECTED_ENCODE_FAILURE');
                        }
                        return originalSerialize(instance);
                    };
                    try {
                        body();
                    } finally {
                        entry.serializer.serialize = originalSerialize;
                    }
                };

                // On a written object the pre-pass serializes it, fails, and aborts before anything is restored.
                // The router spy rethrows every severity, where the lobby returns normally for SevereGameMessageOnly, so the report is stubbed.
                const reportedSeverities: unknown[] = [];
                let aborted: number | null | undefined;
                withRollbackTrafficSuspended(() => withPatch(game, 'reportError', (_error: Error, severity: unknown) => {
                    reportedSeverities.push(severity);
                }, () => injectEncodeFailure(wampa as unknown as GameObjectBase, () => {
                    aborted = managerOf(game).manualSnapshots.get(playerId).rollbackToSnapshot(snapshotId);
                })));
                expect(aborted).toBeNull();
                expect(reportedSeverities).toEqual([GameErrorSeverity.SevereGameMessageOnly]);
                expect((wampa as unknown as { damage: number }).damage).toBe(3);

                // On a clean object the pre-pass never serializes it, so the rollback succeeds.
                let result: IRollbackResult;
                withRollbackTrafficSuspended(() => injectEncodeFailure(spacer, () => {
                    result = rollbackManual(context, snapshotId);
                }));
                expect(result.success).toBeTrue();
                expect((wampa as unknown as { damage: number }).damage).toBe(0);
                settle(context, result);
            });
        });
    }, true);

    // The harness runs `integration()` at UndoMode.Disabled unless the whole suite is replayed under undo, so the
    // disabled case needs the plain form.
    integration(function(contextRef) {
        it('AC2 serializes every object, whatever previous snapshot it is given, in a game with undo disabled', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'], hand: ['battlefield-marine'], resources: 6 },
                player2: { spaceArena: ['cartel-spacer'] }
            });
            if (undoReplayEnabled) {
                pending('the whole suite is replayed with undo enabled');
            }
            const { context } = contextRef;
            const game = context.game;
            const manager = stateManagerOf(game);

            // Undo disabled: no snapshot is ever built and the tracker never runs, so there is no window to trust.
            expect(tracker(game).isTracking).toBeFalse();
            const previous = { id: 0, states: manager.buildGameStateForSnapshot() } as unknown as IGameSnapshot;

            expectNoSharedRecords(manager.buildGameStateForSnapshot(previous), previous);
        });
    });
});
