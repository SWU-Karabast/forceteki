import type Game from '../../Game';
import type { GameStateManager } from '../../GameStateManager';
import type { IGetCurrentSnapshotHandler } from '../SnapshotFactory';
import type { IGameSnapshot } from '../SnapshotInterfaces';
import type { IClearNewerSnapshotsBinding } from './SnapshotContainerBase';
import { SnapshotContainerBase } from './SnapshotContainerBase';
import * as Contract from '../../utils/Contract.js';

export class SnapshotArray extends SnapshotContainerBase {
    public readonly maxLength: number;

    // Element 0 is always the _oldest_ snapshot
    private snapshots: IGameSnapshot[] = [];

    public constructor(
        maxLength: number,
        game: Game,
        gameStateManager: GameStateManager,
        getCurrentSnapshotFn: IGetCurrentSnapshotHandler,
        clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding
    ) {
        super(game, gameStateManager, getCurrentSnapshotFn, clearNewerSnapshotsBinding);
        this.maxLength = maxLength;
    }

    public takeSnapshot(): void {
        const currentSnapshot = this.getCurrentSnapshotFn();

        // the array is bounded at maxLength + 1 to allow for the current snapshot
        if (this.snapshots.length >= this.maxLength + 1) {
            this.snapshots.shift(); // Remove the oldest snapshot if we exceed the max length
        }

        this.snapshots.push(currentSnapshot);
    }

    /** @returns The ID of the snapshot that was rolled back to, or null if the rollback failed. */
    public rollbackToSnapshot(offset: number): number | null {
        Contract.assertTrue(offset < 0 && offset >= -this.snapshots.length, `Snapshot offset must be less than zero and greater than or equal than max history length (-${this.snapshots.length}), got ${offset}`);

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
}
