import type { Game } from '../Game';
import type { GameStateManager } from './GameStateManager';
import type { IDeltaSnapshot, IGameSnapshot } from './SnapshotInterfaces';
import { SnapshotTimepoint } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';
import { SnapshotArray } from './container/SnapshotArray';
import type { IClearNewerSnapshotsBinding, IClearNewerSnapshotsHandler } from './container/SnapshotContainerBase';
import { SnapshotMap } from './container/SnapshotMap';
import { SnapshotHistoryMap } from './container/SnapshotHistoryMap';
import type { PhaseName } from '../Constants';
import { DeltaSnapshotContainer } from './container/DeltaSnapshotContainer';

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
    private lastAssignedTimepointNumber = -1;

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

    public get currentSnapshottedTimepointNumber(): number | null {
        return this.currentActionSnapshot?.timepointNumber;
    }

    public get currentSnapshottedTimepointType(): SnapshotTimepoint | null {
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

    public createDeltaSnapshotContainer(): DeltaSnapshotContainer {
        return this.createSnapshotContainerWithClearSnapshotsBinding((clearNewerSnapshotsBinding) =>
            new DeltaSnapshotContainer(clearNewerSnapshotsBinding)
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
        const nextTimepointNumber = this.lastAssignedTimepointNumber + 1;

        const snapshot: IGameSnapshot = {
            id: nextSnapshotId,
            lastGameObjectId: this.gameStateManager.lastGameObjectId,
            actionNumber: this.game.actionNumber,
            roundNumber: this.game.roundNumber,
            timepoint,
            timepointNumber: nextTimepointNumber,
            phase: this.game.currentPhase,
            states: this.gameStateManager.buildGameStateForSnapshot(),
            rngState: structuredClone(this.game.randomGenerator.rngState),
            requiresConfirmationToRollback: false,
            activePlayerId: this.game.actionPhaseActivePlayer?.id
        };

        this.lastAssignedSnapshotId = nextSnapshotId;
        this.lastAssignedTimepointNumber = nextTimepointNumber;

        this.currentActionSnapshot = snapshot;
    }

    public createDeltaMetadataForCurrentTimepoint(timepoint: SnapshotTimepoint): Omit<IDeltaSnapshot, 'changedFields' | 'createdObjectUuids' | 'rngState' | 'lastGameObjectId'> {
        const nextSnapshotId = this.lastAssignedSnapshotId + 1;
        const nextTimepointNumber = this.lastAssignedTimepointNumber + 1;

        const metadata: Omit<IDeltaSnapshot, 'changedFields' | 'createdObjectUuids' | 'rngState' | 'lastGameObjectId'> = {
            id: nextSnapshotId,
            actionNumber: this.game.actionNumber,
            roundNumber: this.game.roundNumber,
            phase: this.game.currentPhase,
            timepoint,
            timepointNumber: nextTimepointNumber,
            activePlayerId: this.game.actionPhaseActivePlayer?.id,
            requiresConfirmationToRollback: false,
            nextSnapshotIsSamePlayer: undefined,
        };

        this.lastAssignedSnapshotId = nextSnapshotId;
        this.lastAssignedTimepointNumber = nextTimepointNumber;

        this.currentActionSnapshot = {
            id: metadata.id,
            lastGameObjectId: this.gameStateManager.lastGameObjectId,
            actionNumber: metadata.actionNumber,
            roundNumber: metadata.roundNumber,
            timepoint: metadata.timepoint,
            timepointNumber: metadata.timepointNumber,
            phase: metadata.phase,
            states: {},
            rngState: structuredClone(this.game.randomGenerator.rngState),
            requiresConfirmationToRollback: metadata.requiresConfirmationToRollback,
            activePlayerId: metadata.activePlayerId,
            nextSnapshotIsSamePlayer: metadata.nextSnapshotIsSamePlayer,
        };

        return metadata;
    }

    public updateCurrentSnapshotFromDelta(delta: IDeltaSnapshot): void {
        this.currentActionSnapshot = {
            id: delta.id,
            lastGameObjectId: delta.lastGameObjectId,
            actionNumber: delta.actionNumber,
            roundNumber: delta.roundNumber,
            timepoint: delta.timepoint,
            timepointNumber: delta.timepointNumber,
            phase: delta.phase,
            activePlayerId: delta.activePlayerId,
            requiresConfirmationToRollback: false,
            nextSnapshotIsSamePlayer: delta.nextSnapshotIsSamePlayer,
            // Delta rollback restores the live game object state in memory. The delta payload itself is only
            // the tracking-window anchor, so invalidate the cached full snapshot payload and force
            // later consumers to rematerialize from the restored live state.
            states: {},
            rngState: structuredClone(delta.rngState),
        };
        this.lastAssignedTimepointNumber = delta.timepointNumber;
    }

    public createRecoverySnapshot(): IGameSnapshot {
        return {
            id: this.currentActionSnapshot?.id ?? this.lastAssignedSnapshotId,
            lastGameObjectId: this.gameStateManager.lastGameObjectId,
            actionNumber: this.game.actionNumber,
            roundNumber: this.game.roundNumber,
            timepoint: this.currentActionSnapshot?.timepoint ?? SnapshotTimepoint.Action,
            timepointNumber: this.currentActionSnapshot?.timepointNumber ?? this.lastAssignedTimepointNumber,
            phase: this.game.currentPhase,
            states: this.gameStateManager.buildGameStateForSnapshot(),
            rngState: structuredClone(this.game.randomGenerator.rngState),
            requiresConfirmationToRollback: false,
            activePlayerId: this.game.actionPhaseActivePlayer?.id,
            nextSnapshotIsSamePlayer: this.currentActionSnapshot?.nextSnapshotIsSamePlayer,
        };
    }

    public materializeCurrentSnapshotState(): void {
        this.currentActionSnapshot = this.createRecoverySnapshot();
    }

    public getMaterializedCurrentSnapshot(): IGameSnapshot {
        return this.getCurrentActionSnapshot();
    }

    public getCurrentSnapshotIfMaterialized(): IGameSnapshot | null {
        if (!this.currentActionSnapshot || Object.keys(this.currentActionSnapshot.states).length === 0) {
            return null;
        }

        return this.currentActionSnapshot;
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

        if (Object.keys(this.currentActionSnapshot.states).length === 0) {
            this.materializeCurrentSnapshotState();
        }

        return this.currentActionSnapshot;
    }

    /**
     * Helper method to facilitate snapshot updating the current snapshot after a rollback
     */
    private updateCurrentActionSnapshot(snapshot: IGameSnapshot): void {
        Contract.assertNotNullLike(this.currentActionSnapshot, 'Attempting to read action snapshot before any is set, meaning the game is likely not initialized');

        this.currentActionSnapshot = snapshot;
        this.currentActionSnapshot.requiresConfirmationToRollback = false;
        this.lastAssignedTimepointNumber = snapshot.timepointNumber;
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
