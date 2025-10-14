import type Game from '../Game';
import type { GameStateManager } from './GameStateManager';
import type { IGameSnapshot, SnapshotTimepoint } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import { SnapshotArray } from './container/SnapshotArray';
import type { IClearNewerSnapshotsBinding, IClearNewerSnapshotsHandler } from './container/SnapshotContainerBase';
import { SnapshotMap } from './container/SnapshotMap';
import { SnapshotHistoryMap } from './container/SnapshotHistoryMap';
import type { PhaseName } from '../Constants';
import { MetaSnapshotArray } from './container/MetaSnapshotArray';
import v8 from 'node:v8';

export type IGetCurrentSnapshotHandler = () => IGameSnapshot;
export type IUpdateCurrentSnapshotHandler = (snapshot: IGameSnapshot) => void;

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
    private readonly clearNewerSnapshotsHandlers: IClearNewerSnapshotsHandler[] = [];
    private readonly game: Game;
    private readonly gameStateManager: GameStateManager;

    /** Caches the snapshot for the current action  */
    private currentActionSnapshot: IGameSnapshot;

    private lastAssignedSnapshotId = -1;

    public get currentSnapshotId(): number | null {
        return this.currentActionSnapshot?.id;
    }

    public get currentSnapshottedAction(): number | null {
        return this.currentActionSnapshot?.actionNumber;
    }

    public get currentSnapshottedActivePlayer(): string | null {
        return this.currentActionSnapshot?.activePlayerId;
    }

    public get currentSnapshottedPhase(): PhaseName | null {
        return this.currentActionSnapshot?.phase;
    }

    public get currentSnapshottedRound(): number | null {
        return this.currentActionSnapshot?.roundNumber;
    }

    public get currentSnapshottedTimepoint(): SnapshotTimepoint | null {
        return this.currentActionSnapshot?.timepoint;
    }

    public get currentSnapshotRequiresConfirmationToRollback(): boolean | null {
        return this.currentActionSnapshot?.requiresConfirmationToRollback;
    }

    public constructor(game: Game, gameStateManager: GameStateManager) {
        this.game = game;
        this.gameStateManager = gameStateManager;
    }

    /** @deprecated This is implemented but not currently used or tested */
    public createSnapshotArray(maxLength: number): SnapshotArray {
        return this.createSnapshotContainerWithClearSnapshotsBinding((clearNewerSnapshotsBinding) =>
            new SnapshotArray(
                maxLength,
                this.game,
                this.gameStateManager,
                () => this.getCurrentActionSnapshot(),
                (snapshot: IGameSnapshot) => this.updateCurrentActionSnapshot(snapshot),
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
                (snapshot: IGameSnapshot) => this.updateCurrentActionSnapshot(snapshot),
                clearNewerSnapshotsBinding
            )
        );
    }

    public createSnapshotHistoryMap<T>(maxHistoryLength: number): SnapshotHistoryMap<T> {
        return this.createSnapshotContainerWithClearSnapshotsBinding((clearNewerSnapshotsBinding) =>
            new SnapshotHistoryMap<T>(
                maxHistoryLength,
                this.game,
                this.gameStateManager,
                () => this.getCurrentActionSnapshot(),
                (snapshot: IGameSnapshot) => this.updateCurrentActionSnapshot(snapshot),
                clearNewerSnapshotsBinding
            )
        );
    }

    public createMetaSnapshotArray(): MetaSnapshotArray {
        return this.createSnapshotContainerWithClearSnapshotsBinding((clearNewerSnapshotsBinding) =>
            new MetaSnapshotArray(clearNewerSnapshotsBinding)
        );
    }

    public clearCurrentSnapshot(): void {
        this.currentActionSnapshot = null;
    }

    /**
     * Notifies all snapshot containers to clear any snapshots that were taken after the given snapshot ID.
     * @param snapshotId - The ID of the snapshot to clear newer snapshots for.
     */
    public clearNewerSnapshots(snapshotId: number): void {
        Contract.assertNonNegative(snapshotId);

        for (const clearNewerSnapshots of this.clearNewerSnapshotsHandlers) {
            clearNewerSnapshots(snapshotId);
        }
    }

    /**
     * Called when we reach a new "snapshottable" game point (usually a new player action).
     * This will create a snapshot of the current game state and all game objects.
     */
    public createSnapshotForCurrentTimepoint(timepoint: SnapshotTimepoint): void {
        // TODO: add a guard here that will fail if the current action is already snapshotted,
        // this should be called exactly once per action

        const nextSnapshotId = this.lastAssignedSnapshotId + 1;

        const snapshot: IGameSnapshot = {
            id: nextSnapshotId,
            lastGameObjectId: this.gameStateManager.lastGameObjectId,
            actionNumber: this.game.actionNumber,
            roundNumber: this.game.roundNumber,
            timepoint,
            phase: this.game.currentPhase,
            gameState: v8.serialize(this.game.state),
            states: this.gameStateManager.buildGameStateForSnapshot(),
            rngState: this.game.randomGenerator.rngState,
            requiresConfirmationToRollback: false,
            activePlayerId: this.game.actionPhaseActivePlayer?.id
        };

        this.lastAssignedSnapshotId = nextSnapshotId;

        this.currentActionSnapshot = snapshot;
    }

    public setNextSnapshotIsSamePlayer(value: boolean) {
        if (this.currentActionSnapshot) {
            this.currentActionSnapshot.nextSnapshotIsSamePlayer = value;
        }
    }

    /**
     * Helper method to facilitate snapshot containers accessing the current snapshot for storage
     */
    private getCurrentActionSnapshot(): IGameSnapshot {
        Contract.assertNotNullLike(this.currentActionSnapshot, 'Attempting to read action snapshot before any is set, meaning the game is likely not initialized');

        return this.currentActionSnapshot;
    }

    /**
     * Helper method to facilitate snapshot updating the current snapshot after a rollback
     */
    private updateCurrentActionSnapshot(snapshot: IGameSnapshot): void {
        Contract.assertNotNullLike(this.currentActionSnapshot, 'Attempting to read action snapshot before any is set, meaning the game is likely not initialized');

        this.currentActionSnapshot = snapshot;
        this.currentActionSnapshot.requiresConfirmationToRollback = false;
    }

    /** Helper method for correctly building snapshot containers in a way that they can pass back a handle for calling the `clearNewerSnapshots()` method */
    private createSnapshotContainerWithClearSnapshotsBinding<T>(
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
