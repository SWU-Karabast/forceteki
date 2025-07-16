import type Game from '../../Game';
import type { GameStateManager } from '../../GameStateManager';
import type { IGetCurrentSnapshotHandler, IUpdateCurrentSnapshotHandler } from '../SnapshotFactory';
import type { IGameSnapshot } from '../SnapshotInterfaces';
import type { IClearNewerSnapshotsBinding } from './SnapshotContainerBase';
import { SnapshotContainerBase } from './SnapshotContainerBase';
import * as Contract from '../../utils/Contract.js';

/**
 * @deprecated This is implemented but not currently used or tested
 *
 * A {@link SnaphshotContainerBase} derived class that stores snapshots in a simple array representing a linear history.
 * The array is bounded by a maximum length, and the snapshots are indexed using a negative offset where 0 is the current action's snapshot, -1 is the previous snapshot, etc.
 */
export class SnapshotArray extends SnapshotContainerBase {
    public readonly maxLength: number;

    // Element 0 is always the _oldest_ snapshot
    private snapshots: IGameSnapshot[] = [];

    public constructor(
        maxLength: number,
        game: Game,
        gameStateManager: GameStateManager,
        getCurrentSnapshotFn: IGetCurrentSnapshotHandler,
        updateCurrentSnapshotFn: IUpdateCurrentSnapshotHandler,
        clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding
    ) {
        super(game, gameStateManager, getCurrentSnapshotFn, updateCurrentSnapshotFn, clearNewerSnapshotsBinding);
        this.maxLength = maxLength;
    }

    public takeSnapshot(): void {
        const currentSnapshot = this.getCurrentSnapshotFn();

        if (this.snapshots.length > 0 && this.snapshots[this.snapshots.length - 1].id === currentSnapshot.id) {
            // If the current snapshot is identical to the last one, do not add it again
            return;
        }

        // the array is bounded at maxLength + 1 to allow for the current snapshot
        if (this.snapshots.length >= this.maxLength + 1) {
            this.snapshots.shift(); // Remove the oldest snapshot if we exceed the max length
        }

        this.snapshots.push(currentSnapshot);
    }

    /**
     * Rolls back to a snapshot at the given offset from the current action point.
     *
     * @param offset The offset from the current action's snapshot to roll back to. -1 is the most recent snapshot (before current), -2 is the previous snapshot, etc.
     * Cannot be greater than the maximum history length (i.e. `-maxLength`).
     * @returns The ID of the snapshot that was rolled back to, or `null` if there is not enough snapshot history to go back that far
     */
    public rollbackToSnapshot(offset: number): number | null {
        Contract.assertTrue(offset < 0 && offset >= -this.maxLength, `Snapshot offset must be less than one and greater than or equal than max history length (-${this.maxLength}), got ${offset}`);

        if (Math.abs(offset) >= this.snapshots.length) {
            return null; // Cannot rollback further than the available snapshots
        }

        const snapshot = this.snapshots[this.snapshots.length + offset];
        super.rollbackToSnapshotInternal(snapshot);

        return snapshot.id;
    }

    public override clearNewerSnapshots(snapshotId: number): void {
        this.snapshots = this.snapshots.filter((snapshot) => snapshot.id <= snapshotId);
    }

    public override clearAllSnapshots(): void {
        this.snapshots = [];
    }
}
