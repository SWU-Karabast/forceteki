import type Game from '../Game';
import type { GameObjectBase } from '../GameObjectBase';
import type { GameStateManager } from '../GameStateManager';
import type { IGameSnapshot } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import { SnapshotArray } from './container/SnapshotArray';
import type { IClearNewerSnapshotsBinding, IClearNewerSnapshotsHandler, SnapshotContainerBase } from './container/SnapshotContainerBase';
import { SnapshotMap } from './container/SnapshotMap';

export type IGetCurrentSnapshotHandler = () => IGameSnapshot;

/**
 * This class is the point of coordination for all snapshot creation and storage.
 * Snapshot containers are created through this factory, and then they can securely grab snapshots from
 * the factory in a way that doesn't expose the snapshot objects to the outside world.
 *
 * The SnapshotFactory must be called every time we hit a new "snapshottable" game point, such as a player action.
 * A snapshot will be taken and cached until the next action so it is available to all snapshot containers to read from.
 *
 * When a rollback happens, the `clearNewerSnapshots()` method must be called, which will in turn notify all
 * snapshot containers to clear any snapshots that are newer than the given snapshot ID.
 */
export class SnapshotFactory {
    private readonly allGameObjects: GameObjectBase[] = [];
    private readonly clearNewerSnapshotsHandlers: IClearNewerSnapshotsHandler[] = [];
    private readonly game: Game;
    private readonly gameStateManager: GameStateManager;

    /** Caches the snapshot for the current action  */
    private currentActionSnapshot: IGameSnapshot;

    private lastSnapshotId = -1;

    public constructor(game: Game, gameStateManager: GameStateManager) {
        this.game = game;
        this.gameStateManager = gameStateManager;
    }

    public createSnapshotArray(maxLength: number): SnapshotArray {
        return this.createSnapshotContainerWithClearSnapshotsBinding((clearNewerSnapshotsBinding) =>
            new SnapshotArray(
                maxLength,
                this.game,
                this.gameStateManager,
                () => this.getCurrentActionSnapshot(),
                clearNewerSnapshotsBinding
            )
        );
    }

    public createSnapshotMap<T>(): SnapshotMap<T> {
        return this.createSnapshotContainerWithClearSnapshotsBinding((clearNewerSnapshotsBinding) =>
            new SnapshotMap<T>(
                this.game,
                this.gameStateManager,
                () => this.getCurrentActionSnapshot(),
                clearNewerSnapshotsBinding
            )
        );
    }

    /**
     * Notifies all snapshot containers to clear any snapshots that were taken after the given snapshot ID.
     * @param snapshotId - The ID of the snapshot to clear newer snapshots for.
     */
    public clearNewerSnapshots(snapshotId: number): void {
        Contract.assertPositiveNonZero(snapshotId);

        for (const clearNewerSnapshots of this.clearNewerSnapshotsHandlers) {
            clearNewerSnapshots(snapshotId);
        }
    }

    /**
     * Called when we reach a new "snapshottable" game point (usually a new player action).
     * This will create a snapshot of the current game state and all game objects.
     */
    public createSnapshotForCurrentAction(): void {
        // TODO: add a guard here that will fail if the current action is already snapshotted,
        // this should be called exactly once per action

        const nextSnapshotId = this.lastSnapshotId + 1;

        const snapshot: IGameSnapshot = {
            id: nextSnapshotId,

            lastGameObjectId: this.gameStateManager.lastGameObjectId,
            gameState: structuredClone(this.game.state),
            states: this.allGameObjects.map((x) => x.getState()),
        };

        this.lastSnapshotId = nextSnapshotId;

        this.currentActionSnapshot = snapshot;
    }

    /**
     * Helper method to facilitate snapshot containers accessing the current snapshot for storage
     */
    private getCurrentActionSnapshot(): IGameSnapshot {
        Contract.assertNotNullLike(this.currentActionSnapshot, 'Attempting to read action snapshot before any is set, meaning the game is likely not initialized');

        return this.currentActionSnapshot;
    }

    /** Helper method for correctly building snapshot containers in a way that they can pass back a handle for calling the `clearNewerSnapshots()` method */
    private createSnapshotContainerWithClearSnapshotsBinding<T extends SnapshotContainerBase>(
        containerCreateHandler: (clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding) => T
    ): T {
        const clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding = { clearNewerSnapshots: null };

        const container = containerCreateHandler(clearNewerSnapshotsBinding);

        Contract.assertNotNullLike(
            clearNewerSnapshotsBinding.clearNewerSnapshots,
            'The clearNewerSnapshotsBinding was not set during SnaphshotContainer creation, this is likely a bug in the container creation code.'
        );

        this.clearNewerSnapshotsHandlers.push(clearNewerSnapshotsBinding.clearNewerSnapshots);

        return container;
    }
}
