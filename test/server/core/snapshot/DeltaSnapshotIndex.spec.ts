import type { IClearNewerSnapshotsBinding } from '../../../../server/game/core/snapshot/container/SnapshotContainerBase';
import { DeltaChainBeyondHorizonError, DeltaSnapshotIndex, noRemovedObjectRecords, shouldUseDelta } from '../../../../server/game/core/snapshot/container/DeltaSnapshotIndex';
import { PhaseName } from '../../../../server/game/core/Constants';
import type { IDeltaSnapshot } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { DeltaSnapshotKind, SnapshotTimepoint } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { DeltaTrackerMode } from '../../../../server/game/core/snapshot/DeltaTracker';

/**
 * P4-E: the delta snapshot index and its chain builder (`docs/plans/04-delta-snapshots.md`, "As landed in P4-E"), exercised over
 * synthetic deltas so each failure mode is built exactly. No game is set up, so under `ENABLE_UNDO_ALL_TESTS` each body runs once.
 *
 * A timeline is described by snapshot ids and timepoint numbers: ids are never reused after a rollback, timepoint numbers are
 * rewound, so after a rollback to snapshot 2 the next snapshot is id 5 at timepoint number 3.
 */

interface IIndexInternals {
    deltasById: Map<number, IDeltaSnapshot>;
}

function makeDelta(id: number, anchorSnapshotId: number, timepointNumber: number, kind = DeltaSnapshotKind.Action): IDeltaSnapshot {
    return {
        id,
        timepoint: kind === DeltaSnapshotKind.Action ? SnapshotTimepoint.Action : SnapshotTimepoint.StartOfPhase,
        timepointNumber,
        kind,
        anchorSnapshotId,
        rngState: { seed: 0 } as unknown as IDeltaSnapshot['rngState'],
        lastGameObjectId: 0,
        mode: DeltaTrackerMode.CaptureOldValues,
        changedFields: new Map(),
        createdObjectUuids: new Set(),
        removedObjectRecords: noRemovedObjectRecords
    };
}

function makeIndex(): { index: DeltaSnapshotIndex; binding: IClearNewerSnapshotsBinding } {
    const binding: IClearNewerSnapshotsBinding = { clearNewerSnapshots: null };
    return { index: new DeltaSnapshotIndex(binding), binding };
}

/** Snapshot 0 is the bridge-less tracking anchor; ids 1..lastId each anchor at their predecessor, and snapshot n is at timepoint number n. */
function makeLinearIndex(lastId: number): ReturnType<typeof makeIndex> {
    const made = makeIndex();
    made.index.markTrackingAnchor(0);
    for (let id = 1; id <= lastId; id++) {
        made.index.record(makeDelta(id, id - 1, id));
    }
    return made;
}

/** The timeline after a rollback to snapshot 2 and two more snapshots: ids 3 and 4 are gone, 5 and 6 reuse timepoint numbers 3 and 4. */
function makeIndexWithSkippedIds(): ReturnType<typeof makeIndex> {
    const made = makeLinearIndex(4);
    made.binding.clearNewerSnapshots(2);
    made.index.record(makeDelta(5, 2, 3));
    made.index.record(makeDelta(6, 5, 4));
    return made;
}

function ids(chain: IDeltaSnapshot[]): number[] {
    return chain.map((delta) => delta.id);
}

describe('DeltaSnapshotIndex', function() {
    integration(function() {
        describe('shouldUseDelta', function() {
            it('is true only for an Action timepoint during the action phase', function() {
                expect(shouldUseDelta(SnapshotTimepoint.Action, PhaseName.Action)).toBeTrue();
                expect(shouldUseDelta(SnapshotTimepoint.Action, PhaseName.Regroup)).toBeFalse();
                expect(shouldUseDelta(SnapshotTimepoint.Action, null)).toBeFalse();
                expect(shouldUseDelta(SnapshotTimepoint.StartOfPhase, PhaseName.Action)).toBeFalse();
                expect(shouldUseDelta(SnapshotTimepoint.EndOfPhase, PhaseName.Action)).toBeFalse();
                expect(shouldUseDelta(SnapshotTimepoint.RegroupResource, PhaseName.Regroup)).toBeFalse();
            });
        });

        describe('buildChain', function() {
            it('returns the chain newest-first with consecutive timepoint numbers', function() {
                const { index } = makeLinearIndex(5);

                const chain = index.buildChain(1, 1);

                expect(ids(chain)).toEqual([5, 4, 3, 2]);
                expect(chain.map((delta) => delta.timepointNumber)).toEqual([5, 4, 3, 2]);
                expect(ids(index.buildChain(0, 0))).toEqual([5, 4, 3, 2, 1]);
            });

            it('returns an empty chain when the target is the head, not an error', function() {
                const { index } = makeLinearIndex(3);

                expect(index.buildChain(3, 3)).toEqual([]);
            });

            it('returns a contiguous chain across ids a rollback skipped', function() {
                const { index } = makeIndexWithSkippedIds();

                expect(index.getIds()).toEqual([1, 2, 5, 6]);
                expect(ids(index.buildChain(2, 2))).toEqual([6, 5]);
                expect(ids(index.buildChain(1, 1))).toEqual([6, 5, 2]);
                expect(ids(index.buildChain(0, 0))).toEqual([6, 5, 2, 1]);
            });

            it('fails naming the missing id when an intermediate delta was deleted', function() {
                const { index } = makeLinearIndex(4);
                (index as unknown as IIndexInternals).deltasById.delete(3);

                expect(() => index.buildChain(1, 1)).toThrowError(/hole: no delta for snapshot id 3/);
            });

            it('fails, and never returns null or an empty chain, for a target that is not on the timeline', function() {
                const { index } = makeIndexWithSkippedIds();

                // 3 was on the discarded timeline: the walk passes it.
                expect(() => index.buildChain(3, 3)).toThrowError(/target is not on the current timeline/);
                // Above the head.
                expect(() => index.buildChain(7, 5)).toThrowError(/newer than the head 6/);
                // An empty index has no head at all.
                expect(() => makeIndex().index.buildChain(0, 0)).toThrowError(/index has no head/);
            });

            it('fails for an entry in range that is not on the chain', function() {
                const { index } = makeIndexWithSkippedIds();
                // A leftover of the discarded timeline that a prune should have removed.
                (index as unknown as IIndexInternals).deltasById.set(3, makeDelta(3, 2, 3));

                expect(() => index.buildChain(1, 1)).toThrowError(/stray delta not on the chain: 3/);
            });

            it('fails when the target precedes the tracking anchor', function() {
                const { index } = makeIndex();
                index.markTrackingAnchor(5);
                index.record(makeDelta(6, 5, 6));
                index.record(makeDelta(7, 6, 7));

                expect(() => index.buildChain(3, 3)).toThrowError(/precedes the tracking anchor/);
                expect(ids(index.buildChain(5, 5))).toEqual([7, 6]);
            });

            it('throws DeltaChainBeyondHorizonError when the walk reaches an evicted id, and builds a chain to the horizon itself', function() {
                const { index } = makeLinearIndex(6);
                index.evictThrough(3);

                let thrown: unknown;
                try {
                    index.buildChain(2, 2);
                } catch (error) {
                    thrown = error;
                }
                expect(thrown).toBeInstanceOf(DeltaChainBeyondHorizonError);
                const horizonError = thrown as DeltaChainBeyondHorizonError;
                expect(horizonError.targetSnapshotId).toBe(2);
                expect(horizonError.reachedSnapshotId).toBe(3);
                expect(horizonError.evictedThroughId).toBe(3);

                // The horizon id needs only the ids above it.
                expect(ids(index.buildChain(3, 3))).toEqual([6, 5, 4]);
            });

            it('fails on a timepoint gap along the chain', function() {
                const { index } = makeIndex();
                index.markTrackingAnchor(0);
                index.record(makeDelta(1, 0, 1));
                index.record(makeDelta(2, 1, 3));

                expect(() => index.buildChain(0, 0)).toThrowError(/timepoint gap/);
            });

            it('fails when the target timepoint number does not match the oldest link', function() {
                const { index } = makeLinearIndex(3);

                expect(() => index.buildChain(1, 5)).toThrowError(/length mismatch/);
            });

            it('fails, and cannot loop, on a delta whose anchor link does not decrease', function() {
                const { index } = makeLinearIndex(3);
                (index as unknown as IIndexInternals).deltasById.set(2, makeDelta(2, 3, 2));

                expect(() => index.buildChain(0, 0)).toThrowError(/anchor link does not decrease/);
            });
        });

        describe('record, evictThrough, prune and clear', function() {
            it('rejects a repeated id, a non-increasing id and an anchor that is not older', function() {
                const { index } = makeLinearIndex(3);

                expect(() => index.record(makeDelta(3, 2, 3))).toThrowError(/already recorded/);
                expect(() => index.record(makeDelta(2, 1, 2))).toThrowError(/already recorded/);
                (index as unknown as IIndexInternals).deltasById.delete(2);
                expect(() => index.record(makeDelta(2, 1, 2))).toThrowError(/must be newer than the head 3/);
                expect(() => index.record(makeDelta(4, 4, 4))).toThrowError(/not older than itself/);
                expect(index.headSnapshotId).toBe(3);
            });

            it('evicts only ids at or below the horizon and never lowers evictedThroughId', function() {
                const { index } = makeLinearIndex(6);

                index.evictThrough(3);
                expect(index.getIds()).toEqual([4, 5, 6]);
                expect(index.evictedThroughId).toBe(3);

                index.evictThrough(2);
                expect(index.getIds()).toEqual([4, 5, 6]);
                expect(index.evictedThroughId).toBe(3);

                index.evictThrough(5);
                expect(index.getIds()).toEqual([6]);
                expect(index.evictedThroughId).toBe(5);
                expect(index.headSnapshotId).toBe(6);
            });

            it('prunes ids above the rollback target through the binding, keeps the rest and sets the head', function() {
                const { index, binding } = makeLinearIndex(5);

                binding.clearNewerSnapshots(3);

                expect(index.getIds()).toEqual([1, 2, 3]);
                expect(index.headSnapshotId).toBe(3);
                expect(index.size).toBe(3);
                expect(index.get(4)).toBeUndefined();
                expect(index.get(3).timepointNumber).toBe(3);
                expect(index.trackingAnchorId).toBe(0);
            });

            it('clear empties the index and resets head, tracking anchor and eviction floor', function() {
                const { index } = makeLinearIndex(5);
                index.evictThrough(2);

                index.clear();

                expect(index.size).toBe(0);
                expect(index.headSnapshotId).toBeNull();
                expect(index.trackingAnchorId).toBeNull();
                expect(index.evictedThroughId).toBe(-1);
            });

            it('markTrackingAnchor makes the snapshot head and anchor without recording a delta', function() {
                const { index } = makeIndex();

                index.markTrackingAnchor(4);

                expect(index.headSnapshotId).toBe(4);
                expect(index.trackingAnchorId).toBe(4);
                expect(index.get(4)).toBeUndefined();
                expect(index.buildChain(4, 4)).toEqual([]);
            });
        });
    });
});
