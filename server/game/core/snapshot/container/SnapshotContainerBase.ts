import type { IGetCurrentSnapshotHandler, IUpdateCurrentSnapshotHandler } from '../SnapshotFactory';
import type { GameStateManager } from '../GameStateManager';
import type Game from '../../Game';
import type { IGameSnapshot, ISnapshotProperties } from '../SnapshotInterfaces';

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
    protected readonly updateCurrentSnapshotFn: IUpdateCurrentSnapshotHandler;

    private readonly game: Game;
    private readonly gameStateManager: GameStateManager;

    public constructor(
        game: Game,
        gameStateManager: GameStateManager,
        getCurrentSnapshotFn: IGetCurrentSnapshotHandler,
        updateCurrentSnapshotFn: IUpdateCurrentSnapshotHandler,
        clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding
    ) {
        this.game = game;
        this.gameStateManager = gameStateManager;
        this.getCurrentSnapshotFn = getCurrentSnapshotFn;
        this.updateCurrentSnapshotFn = updateCurrentSnapshotFn;

        clearNewerSnapshotsBinding.clearNewerSnapshots = (snapshotId: number) => this.clearNewerSnapshots(snapshotId);
    }

    /** Delete any snapshots newer than the given snapshotId. Used with undo to remove snapshots that are now invalid. */
    protected abstract clearNewerSnapshots(snapshotId: number): void;

    protected abstract getAllSnapshots(): IGameSnapshot[];

    /** Get properties of a snapshot without exposing the full snapshot object. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public abstract getSnapshotProperties(...lookupArgs: any[]): ISnapshotProperties | null;

    public abstract clearAllSnapshots(): void;

    public hasSnapshotId(snapshotId: number): boolean {
        return this.getAllSnapshots().some((snapshot) => snapshot.id === snapshotId);
    }

    public rollbackById(snapshotId: number): number | null {
        const snapshot = this.getAllSnapshots().find((s) => s.id === snapshotId);
        if (snapshot) {
            const success = this.rollbackToSnapshotInternal(snapshot);
            return success ? snapshot.id : null;
        }
        return null;
    }

    public getSnapshotPropertiesById(snapshotId: number): ISnapshotProperties | null {
        const snapshot = this.getAllSnapshots().find((s) => s.id === snapshotId);
        return snapshot ? this.extractSnapshotProperties(snapshot) : null;
    }

    protected rollbackToSnapshotInternal(snapshot: IGameSnapshot): boolean {
        const success = this.gameStateManager.rollbackToSnapshot(snapshot, this.getCurrentSnapshotFn());
        if (!success) {
            return false;
        }

        this.updateCurrentSnapshotFn(snapshot);
        this.game.randomGenerator.restore(snapshot.rngState);
        return true;
    }

    /**
     * Extract properties from a snapshot without exposing the full object.
     */
    protected extractSnapshotProperties(snapshot: IGameSnapshot): ISnapshotProperties {
        return {
            roundNumber: snapshot.roundNumber,
            actionNumber: snapshot.actionNumber,
            currentPhase: snapshot.phase,
            snapshotId: snapshot.id,
            requiresConfirmationToRollback: snapshot.requiresConfirmationToRollback,
            nextSnapshotIsSamePlayer: snapshot.nextSnapshotIsSamePlayer,
        };
    }
}
