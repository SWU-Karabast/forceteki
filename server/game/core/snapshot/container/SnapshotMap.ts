import type { IGameSnapshot } from '../SnapshotInterfaces';
import { SnapshotContainerBase } from './SnapshotContainerBase';

/**
 * A {@link SnaphshotContainerBase} derived class that stores snapshots in a map with a templated key type.
 * If a snapshot with the given key already exists, it will be overwritten with the new snapshot and no longer stored.
 */
export class SnapshotMap<T> extends SnapshotContainerBase {
    private snapshots = new Map<T, IGameSnapshot>();

    public takeSnapshot(key: T): void {
        const currentSnapshot = this.getCurrentSnapshotFn();

        this.snapshots.set(key, currentSnapshot);
    }

    public removeSnapshot(key: T): void {
        this.snapshots.delete(key);
    }

    public getSnapshotCount(): number {
        return this.snapshots.size;
    }

    /**
     * Rolls back to the snapshot at the given key, if it exists.
     *
     * @param key The key of the snapshot to roll back to if possible
     * @returns The ID of the snapshot that was rolled back to, or `null` if the key does not exist in the map
     */
    public rollbackToSnapshot(key: T): number | null {
        const snapshot = this.snapshots.get(key);
        if (!snapshot) {
            return null;
        }

        super.rollbackToSnapshotInternal(snapshot);
        return snapshot.id;
    }

    public override clearNewerSnapshots(snapshotId: number): void {
        const snapshotsWithKeys = Array.from(this.snapshots.entries());

        this.snapshots = new Map(snapshotsWithKeys.filter(([, snapshot]) => snapshot.id <= snapshotId));
    }

    public override clearAllSnapshots(): void {
        this.snapshots.clear();
    }
}
