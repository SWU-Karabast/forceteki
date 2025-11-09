import type Game from '../../Game';
import type { GameStateManager } from '../GameStateManager';
import type { IGetCurrentSnapshotHandler, IUpdateCurrentSnapshotHandler } from '../SnapshotFactory';
import type { IGameSnapshot, ISnapshotProperties } from '../SnapshotInterfaces';
import type { IClearNewerSnapshotsBinding } from './SnapshotContainerBase';
import { SnapshotContainerBase } from './SnapshotContainerBase';
import * as Contract from '../../utils/Contract.js';

/**
 * A {@link SnaphshotContainerBase} derived class that stores snapshots in a two-layer data structure.
 * The first layer is a Map where the keys are of type T, and the values are arrays of snapshots.
 *
 * This allows for multiple snapshots to be stored under a single key, effectively creating a history of snapshots.
 * New snapshots are appended to the end of the array for each key.
 */
export class SnapshotHistoryMap<T> extends SnapshotContainerBase {
    private readonly maxHistoryLength: number;

    private snapshots = new Map<T, IGameSnapshot[]>();

    public constructor(
        maxHistoryLength: number,
        game: Game,
        gameStateManager: GameStateManager,
        getCurrentSnapshotFn: IGetCurrentSnapshotHandler,
        updateCurrentSnapshotFn: IUpdateCurrentSnapshotHandler,
        clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding
    ) {
        super(game, gameStateManager, getCurrentSnapshotFn, updateCurrentSnapshotFn, clearNewerSnapshotsBinding);

        this.maxHistoryLength = maxHistoryLength;
    }

    public getSnapshotCount(key: T): number {
        return this.snapshots.get(key)?.length ?? 0;
    }

    public takeSnapshot(key: T): number {
        const currentSnapshot = this.getCurrentSnapshotFn();

        const snapshotHistory = this.snapshots.get(key);
        if (!snapshotHistory || snapshotHistory.length === 0) {
            this.snapshots.set(key, [currentSnapshot]);
            return currentSnapshot.id;
        }

        if (snapshotHistory[snapshotHistory.length - 1].id === currentSnapshot.id) {
            // If the current snapshot is identical to the last one, do not add it again
            return currentSnapshot.id;
        }

        snapshotHistory.push(currentSnapshot);

        if (snapshotHistory.length > this.maxHistoryLength) {
            snapshotHistory.shift();
        }

        return currentSnapshot.id;
    }

    public removeSnapshot(key: T): void {
        this.snapshots.delete(key);
    }

    /**
     * Get properties of a snapshot at the given key and offset without exposing the full snapshot object.
     */
    public getSnapshotProperties(key: T, offset = 0): ISnapshotProperties | null {
        const snapshot = this.getSnapshot(key, offset);
        return snapshot ? this.extractSnapshotProperties(snapshot) : null;
    }

    /**
     * Internal method to get a snapshot by key and offset.
     */
    private getSnapshot(key: T, offset: number): IGameSnapshot | null {
        Contract.assertTrue(offset <= 0 && offset > -this.maxHistoryLength, `Snapshot offset must be less than 1 and greater than than max history length (-${this.maxHistoryLength}), got ${offset}`);

        const snapshotHistory = this.snapshots.get(key);
        if (!snapshotHistory) {
            return null;    // No snapshots available for this key
        }

        if (Math.abs(offset) >= snapshotHistory.length) {
            return null;    // Cannot rollback further than the available snapshots for this key
        }

        return snapshotHistory[snapshotHistory.length + offset - 1];
    }

    protected override getAllSnapshots(): IGameSnapshot[] {
        const allSnapshots: IGameSnapshot[] = [];
        for (const snapshotHistory of this.snapshots.values()) {
            allSnapshots.push(...snapshotHistory);
        }
        return allSnapshots;
    }

    /**
     * Rolls back to the snapshot at the given key with the specified offset, if it exists.
     *
     * @param key The key of the snapshot to roll back to if possible
     * @param offset The offset from the key's latest snapshot to roll back to. 0 is current snapshot, -1 is the most recent snapshot before current, -2 is the previous snapshot, etc.
     * Cannot be greater than the maximum history length (i.e. `-maxHistoryLength`).
     * @returns The ID of the snapshot that was rolled back to, or `null` if it does not exist
     */
    public rollbackToSnapshot(key: T, offset: number): number | null {
        const snapshot = this.getSnapshot(key, offset);
        if (!snapshot) {
            return null;
        }

        const success = super.rollbackToSnapshotInternal(snapshot);
        return success ? snapshot.id : null;
    }

    public override clearNewerSnapshots(snapshotId: number): void {
        const snapshotHistoriesWithKeys = Array.from(this.snapshots.entries());

        for (const [key, snapshotHistory] of snapshotHistoriesWithKeys) {
            const filteredSnapshots = snapshotHistory.filter((snapshot) => snapshot.id <= snapshotId);

            // Update the map with the filtered snapshots
            this.snapshots.set(key, filteredSnapshots);
        }
    }

    public override clearAllSnapshots(): void {
        this.snapshots.clear();
    }

    public setRequiresConfirmationToRollbackCurrentSnapshot(key: T) {
        const snapshot = this.getSnapshot(key, 0);
        if (snapshot) {
            snapshot.requiresConfirmationToRollback = true;
        }
    }
}
