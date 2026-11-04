import type { Game } from '../../Game';
import type { GameStateManager } from '../GameStateManager';
import type { IGetCurrentSnapshotHandler, IRestoreThroughDeltaChainHandler, IUpdateCurrentSnapshotHandler } from '../SnapshotFactory';
import type { IGameSnapshot, ISnapshotProperties } from '../SnapshotInterfaces';
import type { IClearNewerSnapshotsBinding } from './SnapshotContainerBase';
import { SnapshotContainerBase } from './SnapshotContainerBase';

/**
 * A {@link SnaphshotContainerBase} derived class that stores snapshots in a map with a templated key type.
 * If a snapshot with the given key already exists, it will be overwritten with the new snapshot and no longer stored.
 */
export class SnapshotMap<T> extends SnapshotContainerBase {
    private snapshots = new Map<T, IGameSnapshot>();

    /** What {@link takeSnapshot} stores: the factory passes its materialization, so every stored snapshot is full (P4-F). Only `takeSnapshot` uses it; the memo anchor stays the raw current snapshot. */
    private readonly takeSnapshotSourceFn: IGetCurrentSnapshotHandler;

    public constructor(
        game: Game,
        gameStateManager: GameStateManager,
        getCurrentSnapshotFn: IGetCurrentSnapshotHandler,
        updateCurrentSnapshotFn: IUpdateCurrentSnapshotHandler,
        restoreThroughDeltaChainFn: IRestoreThroughDeltaChainHandler,
        takeSnapshotSourceFn: IGetCurrentSnapshotHandler,
        clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding
    ) {
        super(game, gameStateManager, getCurrentSnapshotFn, updateCurrentSnapshotFn, restoreThroughDeltaChainFn, clearNewerSnapshotsBinding);

        this.takeSnapshotSourceFn = takeSnapshotSourceFn;
    }

    public takeSnapshot(key: T): void {
        this.snapshots.set(key, this.takeSnapshotSourceFn());
    }

    public removeSnapshot(key: T): void {
        this.snapshots.delete(key);
    }

    public getSnapshotCount(): number {
        return this.snapshots.size;
    }

    /**
     * Get properties of a snapshot at the given key without exposing the full snapshot object.
     */
    public getSnapshotProperties(key: T): ISnapshotProperties | null {
        const snapshot = this.getSnapshot(key);
        return snapshot ? this.extractSnapshotProperties(snapshot) : null;
    }

    protected override getAllSnapshots(): IGameSnapshot[] {
        return Array.from(this.snapshots.values());
    }

    /**
     * Internal method to get a snapshot by key.
     */
    private getSnapshot(key: T): IGameSnapshot | null {
        return this.snapshots.get(key) ?? null;
    }

    /**
     * Rolls back to the snapshot at the given key, if it exists.
     *
     * @param key The key of the snapshot to roll back to if possible
     * @returns The ID of the snapshot that was rolled back to, or `null` if the key does not exist in the map
     */
    public rollbackToSnapshot(key: T): number | null {
        const snapshot = this.getSnapshot(key);
        if (!snapshot) {
            return null;
        }

        const success = super.rollbackToSnapshotInternal(snapshot);
        return success ? snapshot.id : null;
    }

    public override clearNewerSnapshots(snapshotId: number): void {
        const snapshotsWithKeys = Array.from(this.snapshots.entries());

        this.snapshots = new Map(snapshotsWithKeys.filter(([, snapshot]) => snapshot.id <= snapshotId));
    }

    public override clearAllSnapshots(): void {
        this.snapshots.clear();
    }
}
