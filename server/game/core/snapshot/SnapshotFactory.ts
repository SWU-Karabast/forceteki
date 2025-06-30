import type Game from '../Game';
import type { GameObjectBase } from '../GameObjectBase';
import type { GameStateManager } from '../GameStateManager';
import type { IGameSnapshot } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import { SnapshotArray } from './container/SnapshotArray';
import type { IClearNewerSnapshotsBinding, IClearNewerSnapshotsHandler, SnapshotContainerBase } from './container/SnapshotContainerBase';

export type IGetCurrentSnapshotHandler = () => IGameSnapshot;

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

    public clearNewerSnapshots(snapshotId: number): void {
        Contract.assertPositiveNonZero(snapshotId);

        for (const clearNewerSnapshots of this.clearNewerSnapshotsHandlers) {
            clearNewerSnapshots(snapshotId);
        }
    }

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

    private getCurrentActionSnapshot(): IGameSnapshot {
        Contract.assertNotNullLike(this.currentActionSnapshot, 'Attempting to read action snapshot before any is set, meaning the game is likely not initialized');

        return this.currentActionSnapshot;
    }

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
