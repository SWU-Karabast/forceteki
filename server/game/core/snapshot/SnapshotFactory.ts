import type { Game } from '../Game';
import type { GameStateManager } from './GameStateManager';
import type { IDeltaTrackerAnchor } from './DeltaTracker';
import type { IDeltaSnapshot, IGameSnapshot, SnapshotTimepoint } from './SnapshotInterfaces';
import { DeltaSnapshotKind } from './SnapshotInterfaces';
import { Contract } from '../utils/Contract.js';
import type { IClearNewerSnapshotsBinding, IClearNewerSnapshotsHandler } from './container/SnapshotContainerBase';
import { SnapshotMap } from './container/SnapshotMap';
import { SnapshotHistoryMap } from './container/SnapshotHistoryMap';
import type { PhaseName } from '../Constants';
import { DeltaSnapshotContainer } from './container/DeltaSnapshotContainer';
import { DeltaSnapshotIndex, noRemovedObjectRecords, shouldUseDelta } from './container/DeltaSnapshotIndex';

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

    private readonly _deltaSnapshotIndex: DeltaSnapshotIndex;

    /** The delta that shares the current snapshot's id. Set only by a checkpoint; null for a bridge-less snapshot and after a rollback or clear. */
    private _currentSnapshotDelta: IDeltaSnapshot | null = null;

    /** The global index of the reverse deltas recorded beside the full snapshots. */
    public get deltaSnapshotIndex(): DeltaSnapshotIndex {
        return this._deltaSnapshotIndex;
    }

    public get currentSnapshotDelta(): IDeltaSnapshot | null {
        return this._currentSnapshotDelta;
    }

    public get currentSnapshotId(): number | null {
        return this.currentActionSnapshot?.id;
    }

    /** The current snapshot as a delta-tracker window anchor, or null when no snapshot is current. */
    public get currentSnapshotAnchor(): IDeltaTrackerAnchor | null {
        const snapshot = this.currentActionSnapshot;
        if (snapshot == null) {
            return null;
        }

        return { snapshotId: snapshot.id, rngState: snapshot.rngState, lastGameObjectId: snapshot.lastGameObjectId };
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
        this._deltaSnapshotIndex = this.createSnapshotContainerWithClearSnapshotsBinding((clearNewerSnapshotsBinding) =>
            new DeltaSnapshotIndex(clearNewerSnapshotsBinding)
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
        this._currentSnapshotDelta = null;
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

        // Must stay first at every checkpoint, before the tracker checkpoint below: no object without a ref survives to a snapshot
        // boundary, so the delta and the full snapshot agree on which objects exist (docs/plans/04-delta-snapshots.md, "Rollback protocol"
        // step 5). The full build's own first-statement cull is then a no-op scan, kept for its other callers.
        this.gameStateManager.removeUnusedGameObjects();

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
            // The current snapshot is both the memo and the delta tracker window's anchor: the build reuses its records for objects the window shows untouched.
            states: this.gameStateManager.buildGameStateForSnapshot(this.currentActionSnapshot ?? null),
            rngState: this.game.randomGenerator.rngState,
            requiresConfirmationToRollback: false,
            activePlayerId: this.game.actionPhaseActivePlayer?.id
        };

        this.lastAssignedSnapshotId = nextSnapshotId;
        this.lastAssignedTimepointNumber = nextTimepointNumber;

        this.currentActionSnapshot = snapshot;

        this.checkpointDelta(snapshot);
    }

    /**
     * The only window boundary: the tracker's window runs from one full snapshot to the next, and the window just closed becomes
     * the delta that shares `snapshot`'s id and timepoint number (so no bridge consumes an id of its own), recorded even when empty.
     * The first snapshot of a tracking run (a game's first, or the first after `clearAllSnapshots`) has no window to close and no delta.
     */
    private checkpointDelta(snapshot: IGameSnapshot): void {
        const deltaTracker = this.game.deltaTracker;
        const anchor = this.currentSnapshotAnchor;

        if (!deltaTracker.isTracking) {
            deltaTracker.startTracking(anchor);
            this._deltaSnapshotIndex.markTrackingAnchor(snapshot.id);
            this._currentSnapshotDelta = null;
            return;
        }

        const closed = deltaTracker.checkpoint(anchor);
        const delta: IDeltaSnapshot = {
            id: snapshot.id,
            timepoint: snapshot.timepoint,
            timepointNumber: snapshot.timepointNumber,
            kind: shouldUseDelta(snapshot.timepoint, snapshot.phase) ? DeltaSnapshotKind.Action : DeltaSnapshotKind.Bridge,
            anchorSnapshotId: closed.anchor.snapshotId,
            rngState: closed.anchor.rngState,
            lastGameObjectId: closed.anchor.lastGameObjectId,
            mode: closed.mode,
            changedFields: closed.changedFields,
            createdObjectUuids: closed.createdObjectUuids,
            removedObjectRecords: noRemovedObjectRecords
        };

        this._deltaSnapshotIndex.record(delta);
        this._currentSnapshotDelta = delta;
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
        this._currentSnapshotDelta = null;
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
