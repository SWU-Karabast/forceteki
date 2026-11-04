import type { Game } from '../Game';
import type { GameStateManager, IDeltaRestoreLink } from './GameStateManager';
import type { IDeltaTrackerAnchor } from './DeltaTracker';
import { DeltaTrackerMode } from './DeltaTracker';
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
export type IRestoreThroughDeltaChainHandler = (target: IGameSnapshot) => boolean;

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

    /** The global index of the reverse deltas recorded beside the snapshots; a hollow snapshot restores through its chain (P4-F). */
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
                (target: IGameSnapshot) => this.restoreThroughDeltaChain(target),
                () => this.materializeCurrentSnapshot(),
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
                (target: IGameSnapshot) => this.restoreThroughDeltaChain(target),
                clearNewerSnapshotsBinding
            )
        );
    }

    /**
     * Restores live state to `target` through the delta chain (P4-F): the held tracker window anchored at the index head (the pending
     * delta), then the stored deltas from the head back to `target`, newest first. Throws without writing anything when the chain
     * cannot be built (`DeltaSnapshotIndex.buildChain`) or no valid window is held: a held window is the only record of the writes
     * since the head, so restoring without it would silently keep them (C2). Returns the restore's result (false after a recovery).
     */
    private restoreThroughDeltaChain(target: IGameSnapshot): boolean {
        const index = this._deltaSnapshotIndex;
        const chain = index.buildChain(target.id, target.timepointNumber);

        const headId = index.headSnapshotId;
        Contract.assertTrue(headId === this.currentSnapshotId, () => `Delta restore to snapshot ${target.id}: the index head ${headId} is not the current snapshot ${this.currentSnapshotId}`);

        const window = this.game.deltaTracker.liveWindowAnchoredAt(headId);
        Contract.assertNotNullLike(window, () => `Delta restore to snapshot ${target.id}: no valid delta tracker window is anchored at the index head ${headId}, so the writes since it cannot be reverted (P4-F C2: a consumed or discarded window is never applied)`);

        const links: IDeltaRestoreLink[] = [window];
        for (const delta of chain) {
            links.push({
                anchor: { snapshotId: delta.anchorSnapshotId, rngState: delta.rngState, lastGameObjectId: delta.lastGameObjectId },
                mode: delta.mode,
                changedFields: delta.changedFields,
                createdObjectUuids: delta.createdObjectUuids
            });
        }

        for (const link of links) {
            Contract.assertTrue(link.mode === DeltaTrackerMode.CaptureOldValues, () => `Delta restore to snapshot ${target.id}: the link anchored at ${link.anchor.snapshotId} recorded ${link.mode}, which cannot be restored`);
        }

        // Checked here, before any write, so a violation leaves live state and the held window untouched; the restore checks the folded
        // counter again after its writes.
        const oldestAnchor = links[links.length - 1].anchor;
        Contract.assertTrue(oldestAnchor.lastGameObjectId === target.lastGameObjectId, () => `Delta restore to snapshot ${target.id}: the oldest link anchors at object id counter ${oldestAnchor.lastGameObjectId}, but the target records ${target.lastGameObjectId}`);

        return this.gameStateManager.rollbackToDeltaChain(links, target, this.currentActionSnapshot ?? null);
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

        // P4-F hollow rule: an action-phase Action checkpoint that closes a capture window and opens another builds no records; its
        // delta (recorded below) is the restore authority, and both windows being capture-mode means its own action can always be
        // reverted. Every other snapshot (StartOfPhase anchor, bridges, the first of a tracking run, the close of a DirtyOnly window) stays full.
        const deltaTracker = this.game.deltaTracker;
        const hollow = deltaTracker.isTracking &&
          shouldUseDelta(timepoint, this.game.currentPhase) &&
          deltaTracker.pendingWindow?.mode === DeltaTrackerMode.CaptureOldValues &&
          deltaTracker.mode === DeltaTrackerMode.CaptureOldValues;

        const snapshot: IGameSnapshot = {
            id: nextSnapshotId,
            lastGameObjectId: this.gameStateManager.lastGameObjectId,
            actionNumber: this.game.actionNumber,
            roundNumber: this.game.roundNumber,
            timepoint,
            timepointNumber: nextTimepointNumber,
            phase: this.game.currentPhase,
            // The current snapshot is both the memo and the delta tracker window's anchor: the build reuses its records for objects the
            // window shows untouched (none when the anchor is hollow, since it holds no records).
            states: hollow ? {} : this.gameStateManager.buildGameStateForSnapshot(this.currentActionSnapshot ?? null),
            rngState: this.game.randomGenerator.rngState,
            requiresConfirmationToRollback: false,
            activePlayerId: this.game.actionPhaseActivePlayer?.id
        };
        if (hollow) {
            snapshot.hollow = true;
        }

        this.lastAssignedSnapshotId = nextSnapshotId;
        this.lastAssignedTimepointNumber = nextTimepointNumber;

        this.currentActionSnapshot = snapshot;

        this.checkpointDelta(snapshot);

        const delta = this._currentSnapshotDelta;
        const restorableByDelta = delta !== null &&
          delta.kind === DeltaSnapshotKind.Action &&
          delta.mode === DeltaTrackerMode.CaptureOldValues &&
          deltaTracker.pendingWindow?.mode === DeltaTrackerMode.CaptureOldValues;
        Contract.assertTrue(hollow === restorableByDelta, () => `Snapshot ${snapshot.id} is ${hollow ? 'hollow' : 'full'}, but its checkpoint ${restorableByDelta ? 'recorded' : 'did not record'} a capture-mode action delta opening a capture-mode window`);
    }

    /**
     * The current snapshot as a full snapshot, without changing anything (P4-F). A full current snapshot is returned as itself. A hollow
     * one (an action-phase Action timepoint) is materialized at its true window-start state: every live object not created in the
     * held window is serialized, the window's recorded window-start value is laid over each (uuid, field) it changed, and the rng state
     * and object-id counter come from the window anchor. It consumes no snapshot id or timepoint number and writes nothing to the game,
     * the tracker window or the delta index.
     *
     * This is the documented entry point for every reader that needs the current snapshot's records: manual snapshots (bookmarks) and
     * the Plan 6 B snapshot-read save path. Cost: O(live objects) serializes plus O(pending window). The returned copy's `source` is the
     * hollow snapshot it was materialized from: an in-memory alias for the live flag bookkeeping (B2a: confirmation flags and the
     * current-snapshot identity after a rollback to it), never part of a written form. Fails with a `Contract` error when the current
     * snapshot is hollow and no valid capture-mode window is anchored at it, which the managed snapshot path never produces.
     */
    public materializeCurrentSnapshot(): IGameSnapshot {
        const current = this.getCurrentActionSnapshot();
        if (current.hollow !== true) {
            return current;
        }

        const window = this.game.deltaTracker.liveWindowAnchoredAt(current.id);
        Contract.assertNotNullLike(window, () => `Cannot materialize hollow snapshot ${current.id}: no valid delta tracker window is anchored at it`);
        Contract.assertTrue(window.mode === DeltaTrackerMode.CaptureOldValues, () => `Cannot materialize hollow snapshot ${current.id}: its window records ${window.mode}, not window-start values`);

        return {
            id: current.id,
            lastGameObjectId: window.anchor.lastGameObjectId,
            actionNumber: current.actionNumber,
            roundNumber: current.roundNumber,
            phase: current.phase,
            timepoint: current.timepoint,
            timepointNumber: current.timepointNumber,
            activePlayerId: current.activePlayerId,
            states: this.gameStateManager.buildWindowStartStates(window),
            rngState: window.anchor.rngState,
            requiresConfirmationToRollback: current.requiresConfirmationToRollback,
            nextSnapshotIsSamePlayer: current.nextSnapshotIsSamePlayer,
            source: current
        };
    }

    /**
     * The only window boundary: the tracker's window runs from one snapshot to the next, hollow or full, and the window just closed becomes
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
