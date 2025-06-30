import type { IGetCurrentSnapshotHandler } from '../SnapshotFactory';
import type { GameStateManager } from '../../GameStateManager';
import type Game from '../../Game';
import type { IGameSnapshot } from '../SnapshotInterfaces';

export type IClearNewerSnapshotsHandler = (snapshotId: number) => void;

export interface IClearNewerSnapshotsBinding {
    clearNewerSnapshots: IClearNewerSnapshotsHandler;
}

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
