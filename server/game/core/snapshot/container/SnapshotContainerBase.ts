import type { IGetCurrentSnapshotHandler } from '../SnapshotFactory';
import type { GameStateManager } from '../../GameStateManager';
import type Game from '../../Game';
import type { IGameSnapshot } from '../SnapshotInterfaces';

export type IClearNewerSnapshotsHandler = (snapshotId: number) => void;

export interface IClearNewerSnapshotsBinding {
    clearNewerSnapshots: IClearNewerSnapshotsHandler;
}

/**
 * Base class for snapshot containers.Any data structure for managing snapshots **must** inherit from this to ensure correct behavior
 * and to avoid causing memory issues by holding references to unused snapshots.
 *
 * This class manages the relationship with {@link SnapshotFactory} so that derived classes can focus on the data structure
 * and snapshot management logic. It holds a handle to the `getCurrentSnapshotFn` which is used to retrieve the current snapshot,
 * and it sends back a handle to the {@link SnapshotFactory} which is used to clear newer snapshots when a rollback occurs.
 */
export abstract class SnapshotContainerBase {
    protected readonly getCurrentSnapshotFn: IGetCurrentSnapshotHandler;

    private readonly game: Game;
    private readonly gameStateManager: GameStateManager;

    public constructor(
        game: Game,
        gameStateManager: GameStateManager,
        getCurrentSnapshotFn: IGetCurrentSnapshotHandler,
        clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding
    ) {
        this.game = game;
        this.gameStateManager = gameStateManager;
        this.getCurrentSnapshotFn = getCurrentSnapshotFn;

        clearNewerSnapshotsBinding.clearNewerSnapshots = (snapshotId: number) => this.clearNewerSnapshots(snapshotId);
    }

    /** Delete any snapshots newer than the given snapshotId. Used with undo to remove snapshots that are now invalid. */
    protected abstract clearNewerSnapshots(snapshotId: number): void;

    protected rollbackToSnapshotInternal(snapshot: IGameSnapshot): void {
        this.gameStateManager.rollbackToSnapshot(snapshot);
    }
}
