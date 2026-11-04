import { PhaseName } from '../../Constants';
import { Contract } from '../../utils/Contract.js';
import type { SerializedStateRecord } from '../../StateEncoding';
import type { IDeltaSnapshot } from '../SnapshotInterfaces';
import { SnapshotTimepoint } from '../SnapshotInterfaces';
import type { IClearNewerSnapshotsBinding } from './SnapshotContainerBase';

/** Whether a snapshot's delta is an `action` delta (a quick container holds an entry for it) rather than a bridge. */
export function shouldUseDelta(timepoint: SnapshotTimepoint, phase: PhaseName | null): boolean {
    return timepoint === SnapshotTimepoint.Action && phase === PhaseName.Action;
}

/** The `removedObjectRecords` of every delta until Plan 5 records first-removal full records into it. */
export const noRemovedObjectRecords: ReadonlyMap<string, SerializedStateRecord> = new Map<string, SerializedStateRecord>();

/** A chain walk reached an id that age eviction dropped, so the chain to that target no longer exists. Not a hole. */
export class DeltaChainBeyondHorizonError extends Error {
    public readonly targetSnapshotId: number;
    public readonly reachedSnapshotId: number;
    public readonly evictedThroughId: number;

    public constructor(targetSnapshotId: number, reachedSnapshotId: number, evictedThroughId: number) {
        super(`No delta chain to snapshot ${targetSnapshotId}: the walk reached snapshot ${reachedSnapshotId}, which was evicted (every delta through ${evictedThroughId} is gone)`);
        this.name = 'DeltaChainBeyondHorizonError';
        this.targetSnapshotId = targetSnapshotId;
        this.reachedSnapshotId = reachedSnapshotId;
        this.evictedThroughId = evictedThroughId;
    }
}

/**
 * The global, id-ordered index of the reverse deltas recorded beside the snapshots (P4-E); since P4-F a hollow snapshot restores through its chain.
 * Per-player quick containers hold entry points into it. It is plain bookkeeping owned by the `SnapshotFactory`:
 * not a `GameObjectBase`, no state decorators, and invisible to snapshots.
 *
 * Maintained by: `record` (every snapshot after the first of a tracking run), the factory's `clearNewerSnapshots` binding
 * (a restored rollback to T drops ids above T and makes T the head), `evictThrough` (age eviction behind the horizon) and
 * `clear` (`clearAllSnapshots`).
 */
export class DeltaSnapshotIndex {
    // Insertion order is ascending id: `record` requires each id to exceed the head.
    private readonly deltasById = new Map<number, IDeltaSnapshot>();
    private _headSnapshotId: number | null = null;
    private _trackingAnchorId: number | null = null;
    private _evictedThroughId = -1;

    /** The newest snapshot on the live timeline, the end of the chain every walk starts from. Null before the first snapshot. */
    public get headSnapshotId(): number | null {
        return this._headSnapshotId;
    }

    /** The first snapshot of the current tracking run: it has no delta because its window was never opened. */
    public get trackingAnchorId(): number | null {
        return this._trackingAnchorId;
    }

    /** Every id at or below this was dropped by age eviction; never decreases until `clear`. */
    public get evictedThroughId(): number {
        return this._evictedThroughId;
    }

    public get size(): number {
        return this.deltasById.size;
    }

    public constructor(clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding) {
        clearNewerSnapshotsBinding.clearNewerSnapshots = (snapshotId: number) => this.clearNewerSnapshots(snapshotId);
    }

    public get(snapshotId: number): IDeltaSnapshot | undefined {
        return this.deltasById.get(snapshotId);
    }

    /** The ids held, ascending. A copy. */
    public getIds(): number[] {
        return Array.from(this.deltasById.keys());
    }

    /** The first snapshot of a tracking run (a game's first, or the first after `clearAllSnapshots`) has no window to close, so it has no delta. */
    public markTrackingAnchor(snapshotId: number): void {
        this._headSnapshotId = snapshotId;
        this._trackingAnchorId = snapshotId;
    }

    public record(delta: IDeltaSnapshot): void {
        Contract.assertFalse(this.deltasById.has(delta.id), `A delta for snapshot ${delta.id} is already recorded`);
        Contract.assertTrue(
            this._headSnapshotId === null || delta.id > this._headSnapshotId,
            () => `Delta ${delta.id} must be newer than the head ${this._headSnapshotId}`
        );
        Contract.assertTrue(delta.anchorSnapshotId < delta.id, `Delta ${delta.id} anchors at ${delta.anchorSnapshotId}, which is not older than itself`);

        this.deltasById.set(delta.id, delta);
        this._headSnapshotId = delta.id;
    }

    /** Drops every delta with an id at or below the horizon. Called only after a container released a delta payload; see `SnapshotManager.evictDeltaIndex`. */
    public evictThrough(horizonId: number): void {
        for (const id of this.deltasById.keys()) {
            if (id > horizonId) {
                break;
            }
            this.deltasById.delete(id);
        }

        this._evictedThroughId = Math.max(this._evictedThroughId, horizonId);
    }

    public clear(): void {
        this.deltasById.clear();
        this._headSnapshotId = null;
        this._trackingAnchorId = null;
        this._evictedThroughId = -1;
    }

    /**
     * The chain of deltas that revert the live timeline from its head back to the snapshot `targetSnapshotId`, newest first.
     * An empty chain means the target is the head.
     *
     * Contiguity is defined by anchor links, not integer ids: snapshot ids are never reused after a rollback, so the ids in
     * `(target, head]` legitimately skip a discarded timeline. The walk follows each delta's window anchor from the head to the
     * target; every link must exist, the timepoint numbers along the chain must be strictly consecutive (they are rewound on
     * rollback, so they are contiguous on any live timeline), the chain length must equal the timepoint distance, and every index
     * id in `(target, head]` must lie on the chain. A failure is a `Contract` failure (inside a rollback that is the
     * `SevereHaltGame`-class path); a walk that reaches an id age eviction dropped throws `DeltaChainBeyondHorizonError` instead.
     * It never returns null.
     */
    public buildChain(targetSnapshotId: number, targetTimepointNumber: number): IDeltaSnapshot[] {
        const head = this._headSnapshotId;
        Contract.assertNotNullLike(head, `Cannot build a delta chain to snapshot ${targetSnapshotId}: the index has no head`);
        Contract.assertTrue(targetSnapshotId <= head, `Cannot build a delta chain to snapshot ${targetSnapshotId}: it is newer than the head ${head}`);

        const chain: IDeltaSnapshot[] = [];
        let id = head;
        while (id !== targetSnapshotId) {
            if (id < targetSnapshotId) {
                Contract.fail(`Delta chain to snapshot ${targetSnapshotId} passed it at snapshot ${id}: the target is not on the current timeline`);
            }

            const delta = this.deltasById.get(id);
            if (delta === undefined) {
                if (id === this._trackingAnchorId) {
                    Contract.fail(`Delta chain to snapshot ${targetSnapshotId} reached the tracking anchor ${id}: the target precedes the tracking anchor`);
                }
                if (id <= this._evictedThroughId) {
                    throw new DeltaChainBeyondHorizonError(targetSnapshotId, id, this._evictedThroughId);
                }
                Contract.fail(`Delta chain to snapshot ${targetSnapshotId} has a hole: no delta for snapshot id ${id}`);
            }

            if (delta.anchorSnapshotId >= delta.id) {
                Contract.fail(`Delta ${delta.id} anchors at ${delta.anchorSnapshotId}: the anchor link does not decrease`);
            }

            if (chain.length > 0) {
                const previous = chain[chain.length - 1];
                if (delta.timepointNumber !== previous.timepointNumber - 1) {
                    Contract.fail(`Delta chain to snapshot ${targetSnapshotId} has a timepoint gap: delta ${delta.id} is at timepoint ${delta.timepointNumber} but delta ${previous.id} after it is at ${previous.timepointNumber}`);
                }
            }

            chain.push(delta);
            id = delta.anchorSnapshotId;
        }

        if (chain.length > 0) {
            const oldest = chain[chain.length - 1];
            if (oldest.timepointNumber - 1 !== targetTimepointNumber) {
                Contract.fail(`Delta chain to snapshot ${targetSnapshotId} has a length mismatch: its oldest delta ${oldest.id} is at timepoint ${oldest.timepointNumber}, so the target should be at ${oldest.timepointNumber - 1}, not ${targetTimepointNumber}`);
            }
        }

        const onChain = new Set<number>(chain.map((delta) => delta.id));
        const stray: number[] = [];
        for (const indexedId of this.deltasById.keys()) {
            if (indexedId > targetSnapshotId && indexedId <= head && !onChain.has(indexedId)) {
                stray.push(indexedId);
            }
        }
        if (stray.length > 0) {
            Contract.fail(`Delta chain to snapshot ${targetSnapshotId} found a stray delta not on the chain: ${stray.join(', ')}`);
        }

        return chain;
    }

    /** Runs inside a rollback, so it asserts nothing. */
    private clearNewerSnapshots(snapshotId: number): void {
        for (const id of Array.from(this.deltasById.keys())) {
            if (id > snapshotId) {
                this.deltasById.delete(id);
            }
        }

        this._headSnapshotId = snapshotId;
    }
}
