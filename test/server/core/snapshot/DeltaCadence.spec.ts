import { GameObjectBase } from '../../../../server/game/core/GameObjectBase';
import { getRuntimeStateFieldModelByClassName, registerState, statePrimitive } from '../../../../server/game/core/GameObjectUtils';
import type { SerializedStateRecord } from '../../../../server/game/core/StateEncoding';
import * as StateSerializers from '../../../../server/game/core/StateSerializers';
import type { IDeltaTrackerAnchor } from '../../../../server/game/core/snapshot/DeltaTracker';
import { DeltaTracker, DeltaTrackerMode } from '../../../../server/game/core/snapshot/DeltaTracker';
import { GameStateManager } from '../../../../server/game/core/snapshot/GameStateManager';
import type { DeltaSnapshotContainer } from '../../../../server/game/core/snapshot/container/DeltaSnapshotContainer';
import type { DeltaSnapshotIndex } from '../../../../server/game/core/snapshot/container/DeltaSnapshotIndex';
import { shouldUseDelta } from '../../../../server/game/core/snapshot/container/DeltaSnapshotIndex';
import type { IDeltaSnapshot, IGameSnapshot, IGetSnapshotSettings } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { DeltaSnapshotKind, SnapshotTimepoint } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { SnapshotFactory } from '../../../../server/game/core/snapshot/SnapshotFactory';
import { PhaseName, SnapshotType } from '../../../../server/game/core/Constants';

/**
 * P4-E: every snapshot taken while the delta tracker is tracking records exactly one delta that shares its id, timepoint
 * and timepoint number (`docs/plans/04-delta-snapshots.md`, "As landed in P4-E"), and the index follows the rollbacks.
 *
 * Under `ENABLE_UNDO_ALL_TESTS` each case body runs twice (a rollback to the start-of-test snapshot in between), so rollback
 * cases only target snapshots the body took, the case that clears every snapshot is pending there, and patches on shared
 * prototypes are plain assignments restored in a `finally` (a second `spyOn` would throw).
 */

interface ISnapshotFactoryInternals {
    currentActionSnapshot: IGameSnapshot;
    currentSnapshotDelta: IDeltaSnapshot | null;
    deltaSnapshotIndex: DeltaSnapshotIndex;
    createSnapshotForCurrentTimepoint(timepoint: SnapshotTimepoint): void;
}
interface ISnapshotManagerInternals {
    snapshotFactory: ISnapshotFactoryInternals;
    quickSnapshots: Map<string, DeltaSnapshotContainer>;
}
interface IStateManagerInternals {
    isRegistered(go: GameObjectBase): boolean;
}

const integrationWithUndo = integration as unknown as (
    definitions: (contextRef: SwuTestContextRef) => void,
    enableUndo: boolean
) => void;

const undoReplayEnabled = process.env.ENABLE_UNDO_ALL_TESTS === 'true';

// Spec-local fixture, as in SnapshotMemoization.spec.ts: the generator only scans the server tree, so it needs the registry entry below.
@registerState()
class DeltaCadenceFixture extends GameObjectBase {
    @statePrimitive() public accessor value = 0;
}

const fixtureFields = getRuntimeStateFieldModelByClassName('DeltaCadenceFixture');
StateSerializers.registerStateSerializers([{
    className: 'DeltaCadenceFixture',
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

function factoryOf(game): ISnapshotFactoryInternals {
    return (game.snapshotManager as unknown as ISnapshotManagerInternals).snapshotFactory;
}

function indexOf(game): DeltaSnapshotIndex {
    return game.snapshotManager.deltaSnapshotIndex;
}

function quickContainerOf(game, playerId: string): DeltaSnapshotContainer {
    return (game.snapshotManager as unknown as ISnapshotManagerInternals).quickSnapshots.get(playerId);
}

/** `expect` with a failure label. */
function check<T>(actual: T, label: string): jasmine.Matchers<T> {
    return expect(actual).withContext(label);
}

interface ITakenSnapshot {
    id: number;
    timepoint: SnapshotTimepoint;
    timepointNumber: number;
    phase: PhaseName | null;
    delta: IDeltaSnapshot | undefined;
}

/** Patches `target[name]` for the duration of `body`, restoring in a finally. Not `spyOn`: the undo replay runs a case body twice in one spec. */
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

describe('Delta cadence', function() {
    integrationWithUndo(function(contextRef) {
        async function setupBoard() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa', 'battlefield-marine'] },
                player2: { groundArena: ['atst'], spaceArena: ['cartel-spacer'] }
            });
            return contextRef.context;
        }

        function attack(player, attacker, target): void {
            player.clickCard(attacker);
            player.clickCard(target);
        }

        /** Four actions: P1, P2, P1, P2, leaving P1 to act. */
        function playFourActions(context): void {
            attack(context.player1, context.wampa, context.p2Base);
            attack(context.player2, context.atst, context.p1Base);
            attack(context.player1, context.battlefieldMarine, context.p2Base);
            attack(context.player2, context.cartelSpacer, context.p1Base);
        }

        describe('pairing', function() {
            it('records one delta per snapshot sharing its id, timepoint and timepoint number, from an action through the regroup phase to the next action phase', async function() {
                const context = await setupBoard();
                const game = context.game;
                const factory = factoryOf(game);

                const taken: ITakenSnapshot[] = [];
                // Under the undo replay the second pass starts after a rollback, so its first delta anchors at the restored snapshot, not at id - 1.
                const idBeforeBody = factory.currentActionSnapshot.id;
                const original = SnapshotFactory.prototype.createSnapshotForCurrentTimepoint;
                const patched = {
                    createSnapshotForCurrentTimepoint(this: SnapshotFactory, timepoint: SnapshotTimepoint) {
                        original.call(this, timepoint);
                        taken.push({
                            id: this.currentSnapshotId,
                            timepoint: this.currentSnapshottedTimepointType,
                            timepointNumber: this.currentSnapshottedTimepointNumber,
                            phase: this.currentSnapshottedPhase,
                            delta: this.deltaSnapshotIndex.get(this.currentSnapshotId)
                        });
                    }
                };

                withPatch(SnapshotFactory.prototype, 'createSnapshotForCurrentTimepoint', patched.createSnapshotForCurrentTimepoint, () => {
                    attack(context.player1, context.wampa, context.p2Base);
                    context.moveToNextActionPhase();
                });

                const timepoints = new Set(taken.map((entry) => entry.timepoint));
                for (const expected of [SnapshotTimepoint.Action, SnapshotTimepoint.EndOfPhase, SnapshotTimepoint.StartOfPhase, SnapshotTimepoint.RegroupResource, SnapshotTimepoint.RegroupReadyCards]) {
                    check(timepoints.has(expected), expected).toBeTrue();
                }
                const lastReadyCards = taken.map((entry) => entry.timepoint).lastIndexOf(SnapshotTimepoint.RegroupReadyCards);
                expect(taken.slice(lastReadyCards + 1).some((entry) => entry.timepoint === SnapshotTimepoint.StartOfPhase && entry.phase === PhaseName.Action)).toBeTrue();
                expect(factory.currentActionSnapshot.id).toBe(taken[taken.length - 1].id);

                taken.forEach((entry, i) => {
                    const label = `snapshot ${entry.id} (${entry.timepoint} in ${entry.phase})`;

                    // No rollback happened, so no snapshot or timepoint number is skipped or shared: a bridge consumes none of its own.
                    if (i > 0) {
                        check(entry.id, label).toBe(taken[i - 1].id + 1);
                        check(entry.timepointNumber, label).toBe(taken[i - 1].timepointNumber + 1);
                    }

                    check(entry.delta, label).toBeDefined();
                    check(entry.delta.id, label).toBe(entry.id);
                    check(entry.delta.timepoint, label).toBe(entry.timepoint);
                    check(entry.delta.timepointNumber, label).toBe(entry.timepointNumber);
                    check(entry.delta.anchorSnapshotId, label).toBe(i > 0 ? taken[i - 1].id : idBeforeBody);

                    const expectedKind = entry.timepoint === SnapshotTimepoint.Action && entry.phase === PhaseName.Action ? DeltaSnapshotKind.Action : DeltaSnapshotKind.Bridge;
                    check(entry.delta.kind, label).toBe(expectedKind);
                    check(shouldUseDelta(entry.timepoint, entry.phase), label).toBe(expectedKind === DeltaSnapshotKind.Action);
                });

                expect(taken.some((entry) => entry.delta.kind === DeltaSnapshotKind.Action)).toBeTrue();
                expect(taken.some((entry) => entry.delta.kind === DeltaSnapshotKind.Bridge)).toBeTrue();
            });
        });

        describe('bridge-less snapshots', function() {
            it('records no delta for the first snapshot of a game, which is the tracking anchor and below every recorded delta', async function() {
                const context = await setupBoard();
                const index = indexOf(context.game);

                expect(index.trackingAnchorId).not.toBeNull();
                expect(index.get(index.trackingAnchorId)).toBeUndefined();
                expect(index.getIds().every((id) => id > index.trackingAnchorId)).toBeTrue();
                expect(index.headSnapshotId).toBe(factoryOf(context.game).currentActionSnapshot.id);
            });

            it('records no delta for the first snapshot after clearAllSnapshots, then deltas again', async function() {
                const context = await setupBoard();
                if (undoReplayEnabled) {
                    pending('clearAllSnapshots removes the start-of-test snapshot the undo replay rolls back to');
                }
                const game = context.game;
                const factory = factoryOf(game);
                const index = indexOf(game);
                playFourActions(context);
                expect(index.size).toBeGreaterThan(0);
                const containersBefore = [context.player1.id, context.player2.id].map((playerId) => quickContainerOf(game, playerId));
                const summariesBefore = containersBefore.map((container) => container.getEntrySummaries().map((entry) => entry.snapshotId));
                expect(containersBefore.some((container) => container.getLiveDeltaCount() > 0)).toBeTrue();

                game.snapshotManager.clearAllSnapshots();

                // The containers release every delta payload in place: positions are unchanged, so Current and Previous keep their meaning.
                containersBefore.forEach((container, i) => {
                    expect(container.getLiveDeltaCount()).toBe(0);
                    expect(container.getEntrySummaries().map((entry) => entry.snapshotId)).toEqual(summariesBefore[i]);
                });
                expect(index.size).toBe(0);
                expect(index.headSnapshotId).toBeNull();
                expect(index.trackingAnchorId).toBeNull();
                expect(index.evictedThroughId).toBe(-1);
                expect(factory.currentSnapshotDelta).toBeNull();

                factory.createSnapshotForCurrentTimepoint(SnapshotTimepoint.Action);
                const first = factory.currentActionSnapshot.id;
                expect(index.get(first)).toBeUndefined();
                expect(index.headSnapshotId).toBe(first);
                expect(index.trackingAnchorId).toBe(first);
                expect(factory.currentSnapshotDelta).toBeNull();

                factory.createSnapshotForCurrentTimepoint(SnapshotTimepoint.Action);
                const second = index.get(factory.currentActionSnapshot.id);
                expect(second).toBeDefined();
                expect(second.anchorSnapshotId).toBe(first);
                expect(factory.currentSnapshotDelta).toBe(second);
            });
        });

        describe('windows', function() {
            it('records a bridge for a window in which nothing was written', async function() {
                const context = await setupBoard();
                const game = context.game;
                const factory = factoryOf(game);
                const index = indexOf(game);

                game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.StartOfPhase);
                const firstId = factory.currentActionSnapshot.id;
                game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.StartOfPhase);

                const secondId = factory.currentActionSnapshot.id;
                const bridge = index.get(secondId);
                expect(secondId).toBe(firstId + 1);
                expect(bridge).toBeDefined();
                expect(bridge.kind).toBe(DeltaSnapshotKind.Bridge);
                expect(bridge.anchorSnapshotId).toBe(firstId);
                // The emptiness this case relies on: nothing wrote a field or registered an object between the two snapshots.
                expect(bridge.changedFields.size).toBe(0);
                expect(bridge.createdObjectUuids.size).toBe(0);
                expect(factory.currentSnapshotDelta).toBe(bridge);
            });

            it('holds the window-start value of every written field, and the window-start rng state and object id counter, of the anchor snapshot', async function() {
                const context = await setupBoard();
                const game = context.game;
                const factory = factoryOf(game);
                const index = indexOf(game);

                // The anchor is a hollow action snapshot since P4-F; its records are read through the materialization.
                const anchor = context.game.snapshotManager.materializeCurrentSnapshot();
                attack(context.player1, context.wampa, context.p2Base);

                const delta = index.get(factory.currentActionSnapshot.id);
                expect(delta.anchorSnapshotId).toBe(anchor.id);
                expect(delta.kind).toBe(DeltaSnapshotKind.Action);
                expect(delta.mode).toBe(DeltaTrackerMode.CaptureOldValues);
                expect(delta.changedFields.size).toBeGreaterThan(0);

                let comparedFields = 0;
                for (const [uuid, fields] of delta.changedFields) {
                    const anchorRecord = anchor.states[uuid];
                    check(anchorRecord, uuid).toBeDefined();
                    for (const [field, value] of Object.entries(fields)) {
                        check(value, `${uuid}.${field}`).toEqual(anchorRecord[field]);
                        comparedFields++;
                    }
                }
                expect(comparedFields).toBeGreaterThan(1);
                expect(delta.rngState).toEqual(anchor.rngState);
                expect(delta.lastGameObjectId).toBe(anchor.lastGameObjectId);
            });

            it('reserves an empty first-removal record slot on every delta', async function() {
                const context = await setupBoard();
                const index = indexOf(context.game);

                playFourActions(context);

                expect(index.size).toBeGreaterThan(2);
                for (const id of index.getIds()) {
                    const slot = index.get(id).removedObjectRecords;
                    check(slot, `delta ${id}`).toBeInstanceOf(Map);
                    check(slot.size, `delta ${id}`).toBe(0);
                }
            });
        });

        describe('cull order', function() {
            it('culls objects without a ref before the build and before the tracker checkpoint at an action and a bridge checkpoint, and drops a no-ref object registered in the window', async function() {
                const context = await setupBoard();
                const game = context.game;
                const stateManager = game.gameObjectManager as unknown as IStateManagerInternals;

                const calls: string[] = [];
                const originalCull = GameStateManager.prototype.removeUnusedGameObjects;
                const originalBuild = GameStateManager.prototype.buildGameStateForSnapshot;
                const originalCheckpoint = DeltaTracker.prototype.checkpoint;
                const patched = {
                    removeUnusedGameObjects(this: GameStateManager) {
                        calls.push('cull');
                        return originalCull.call(this);
                    },
                    buildGameStateForSnapshot(this: GameStateManager, previous: IGameSnapshot | null) {
                        calls.push('build');
                        return originalBuild.call(this, previous);
                    },
                    checkpoint(this: DeltaTracker, anchor: IDeltaTrackerAnchor) {
                        calls.push('checkpoint');
                        return originalCheckpoint.call(this, anchor);
                    }
                };

                let orphan: DeltaCadenceFixture;
                withPatch(GameStateManager.prototype, 'removeUnusedGameObjects', patched.removeUnusedGameObjects, () => withPatch(GameStateManager.prototype, 'buildGameStateForSnapshot', patched.buildGameStateForSnapshot, () => withPatch(DeltaTracker.prototype, 'checkpoint', patched.checkpoint, () => {
                    // An action checkpoint.
                    attack(context.player1, context.wampa, context.p2Base);

                    // A bridge checkpoint, with an object that nothing references registered in its window.
                    orphan = new DeltaCadenceFixture(game);
                    expect(stateManager.isRegistered(orphan)).toBeTrue();
                    game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.StartOfPhase);
                })));

                // Each checkpoint is the explicit cull, then the build (whose own first statement culls again), then the tracker checkpoint.
                expect(calls.filter((call) => call === 'checkpoint').length).toBeGreaterThanOrEqual(2);
                const segments: string[][] = [];
                let segment: string[] = [];
                for (const call of calls) {
                    segment.push(call);
                    if (call === 'checkpoint') {
                        segments.push(segment);
                        segment = [];
                    }
                }
                // P4-F: a hollow action checkpoint builds no records, so its segment is the explicit cull then the checkpoint; a full
                // (bridge) checkpoint still culls, builds, culls again and checkpoints. Both kinds must occur here.
                let fullSegments = 0;
                let hollowSegments = 0;
                for (const checkpointCalls of segments) {
                    if (checkpointCalls.includes('build')) {
                        fullSegments++;
                        expect(checkpointCalls.slice(-3)).toEqual(['build', 'cull', 'checkpoint']);
                        expect(checkpointCalls.indexOf('cull')).toBeLessThan(checkpointCalls.indexOf('build'));
                    } else {
                        hollowSegments++;
                        expect(checkpointCalls.slice(-2)).toEqual(['cull', 'checkpoint']);
                    }
                }
                expect(fullSegments).toBeGreaterThan(0);
                expect(hollowSegments).toBeGreaterThan(0);

                expect(stateManager.isRegistered(orphan)).toBeFalse();
            });
        });

        describe('rollback pruning', function() {
            /** The manager's own restore, without the pipeline re-entry `Game.rollbackToSnapshot` adds, which would take more snapshots after the restore. */
            function rollbackTo(context, settings: IGetSnapshotSettings): boolean {
                return context.game.snapshotManager.rollbackTo(settings).success;
            }

            function expectPrunedTo(context, targetId: number, idsBefore: number[]): void {
                const factory = factoryOf(context.game);
                const index = indexOf(context.game);

                expect(factory.currentActionSnapshot.id).toBe(targetId);
                expect(index.headSnapshotId).toBe(targetId);
                expect(index.getIds().every((id) => id <= targetId)).toBeTrue();
                // Everything at or below the target is kept.
                expect(index.getIds()).toEqual(idsBefore.filter((id) => id <= targetId));
                expect(idsBefore.some((id) => id > targetId)).toBeTrue();

                // The next snapshot continues from the target: its delta anchors there and the chain to the target is that one delta.
                const timepointNumber = factory.currentActionSnapshot.timepointNumber;
                context.game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.StartOfPhase);
                const next = index.get(factory.currentActionSnapshot.id);
                expect(next.anchorSnapshotId).toBe(targetId);
                expect(next.timepointNumber).toBe(timepointNumber + 1);
                expect(index.buildChain(targetId, timepointNumber).map((delta) => delta.id)).toEqual([next.id]);
            }

            it('drops the ids above the target and makes it the head after a Quick rollback', async function() {
                const context = await setupBoard();
                const startOfTestId = factoryOf(context.game).currentActionSnapshot.id;
                playFourActions(context);
                const idsBefore = indexOf(context.game).getIds();

                expect(rollbackTo(context, { type: SnapshotType.Quick, playerId: context.player1.id })).toBeTrue();

                const targetId = factoryOf(context.game).currentActionSnapshot.id;
                expect(targetId).toBeGreaterThan(startOfTestId);
                expectPrunedTo(context, targetId, idsBefore);
            });

            it('drops the ids above the target and makes it the head after an Action rollback', async function() {
                const context = await setupBoard();
                const startOfTestId = factoryOf(context.game).currentActionSnapshot.id;
                playFourActions(context);
                const idsBefore = indexOf(context.game).getIds();

                expect(rollbackTo(context, { type: SnapshotType.Action, playerId: context.player1.id, actionOffset: -1 })).toBeTrue();

                const targetId = factoryOf(context.game).currentActionSnapshot.id;
                expect(targetId).toBeGreaterThan(startOfTestId);
                expectPrunedTo(context, targetId, idsBefore);
            });

            it('drops the ids above the target and makes it the head after a Phase rollback', async function() {
                const context = await setupBoard();
                const startOfTestId = factoryOf(context.game).currentActionSnapshot.id;
                context.moveToNextActionPhase();
                attack(context.player1, context.wampa, context.p2Base);
                const idsBefore = indexOf(context.game).getIds();

                expect(rollbackTo(context, { type: SnapshotType.Phase, phaseName: PhaseName.Regroup })).toBeTrue();

                const targetId = factoryOf(context.game).currentActionSnapshot.id;
                expect(targetId).toBeGreaterThan(startOfTestId);
                expectPrunedTo(context, targetId, idsBefore);
            });

            it('leaves the index ids, the head and the current delta unchanged when a rollback restores nothing', async function() {
                const context = await setupBoard();
                const game = context.game;
                const factory = factoryOf(game);
                const index = indexOf(game);
                playFourActions(context);
                const idsBefore = index.getIds();
                const headBefore = index.headSnapshotId;
                const currentIdBefore = factory.currentActionSnapshot.id;
                const deltaBefore = factory.currentSnapshotDelta;
                expect(deltaBefore).not.toBeNull();

                // No Regroup snapshot exists in the action phase, so the container has nothing to restore and the prune never runs.
                expect(rollbackTo(context, { type: SnapshotType.Phase, phaseName: PhaseName.Regroup })).toBeFalse();

                expect(index.getIds()).toEqual(idsBefore);
                expect(index.headSnapshotId).toBe(headBefore);
                expect(factory.currentActionSnapshot.id).toBe(currentIdBefore);
                expect(factory.currentSnapshotDelta).toBe(deltaBefore);
                expect(index.get(currentIdBefore)).toBe(deltaBefore);
            });

            it('drops the ids above the target and makes it the head after a Manual rollback', async function() {
                const context = await setupBoard();
                attack(context.player1, context.wampa, context.p2Base);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                attack(context.player2, context.atst, context.p1Base);
                attack(context.player1, context.battlefieldMarine, context.p2Base);
                const idsBefore = indexOf(context.game).getIds();

                expect(rollbackTo(context, { type: SnapshotType.Manual, playerId: context.player1Object.id, snapshotId })).toBeTrue();

                expect(factoryOf(context.game).currentActionSnapshot.id).toBe(snapshotId);
                expectPrunedTo(context, snapshotId, idsBefore);
            });
        });
    }, true);

    // The harness runs `integration()` at UndoMode.Disabled unless the whole suite is replayed under undo, so the
    // disabled case needs the plain form.
    integration(function(contextRef) {
        it('records no delta in a game with undo disabled', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['atst'] }
            });
            if (undoReplayEnabled) {
                pending('the whole suite is replayed with undo enabled');
            }
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            const index = indexOf(context.game);
            expect(index.size).toBe(0);
            expect(index.headSnapshotId).toBeNull();
            expect(index.trackingAnchorId).toBeNull();
        });
    });
});
