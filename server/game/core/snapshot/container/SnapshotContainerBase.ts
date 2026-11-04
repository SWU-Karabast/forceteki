import type { IGetCurrentSnapshotHandler, IRestoreThroughDeltaChainHandler, IUpdateCurrentSnapshotHandler } from '../SnapshotFactory';
import type { GameStateManager } from '../GameStateManager';
import type { Game } from '../../Game';
import type { IGameSnapshot, ISnapshotProperties } from '../SnapshotInterfaces';
import { Contract } from '../../utils/Contract.js';

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
 *
 * Every restore goes through {@link rollbackToSnapshotInternal}: a hollow snapshot through the factory's delta chain restore, a full one
 * through `GameStateManager.rollbackToSnapshot` with the current snapshot as its memo anchor only. A restore that throws recovers to the
 * pre-rollback live state from its own pre-pass records (P4-F G1/G2) and reports `false`.
 */
export abstract class SnapshotContainerBase {
    protected readonly getCurrentSnapshotFn: IGetCurrentSnapshotHandler;
    protected readonly updateCurrentSnapshotFn: IUpdateCurrentSnapshotHandler;
    private readonly restoreThroughDeltaChainFn: IRestoreThroughDeltaChainHandler;

    private readonly game: Game;
    private readonly gameStateManager: GameStateManager;

    public constructor(
        game: Game,
        gameStateManager: GameStateManager,
        getCurrentSnapshotFn: IGetCurrentSnapshotHandler,
        updateCurrentSnapshotFn: IUpdateCurrentSnapshotHandler,
        restoreThroughDeltaChainFn: IRestoreThroughDeltaChainHandler,
        clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding
    ) {
        this.game = game;
        this.gameStateManager = gameStateManager;
        this.getCurrentSnapshotFn = getCurrentSnapshotFn;
        this.updateCurrentSnapshotFn = updateCurrentSnapshotFn;
        this.restoreThroughDeltaChainFn = restoreThroughDeltaChainFn;

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

    /**
     * Test-mode only (the delta-parity gate, `SnapshotManager.setDeltaParityMode`): restores the snapshot with this id through the
     * delta chain even though it is full, so the restore can be compared with its records.
     */
    public rollbackByIdThroughDeltaChain(snapshotId: number): number | null {
        const snapshot = this.getAllSnapshots().find((s) => s.id === snapshotId);
        if (snapshot) {
            const success = this.rollbackToSnapshotInternal(snapshot, true);
            return success ? snapshot.id : null;
        }
        return null;
    }

    /**
     * The single restore dispatch (P4-F): a hollow snapshot has no records and restores through the delta chain, a full one through the
     * full restore. Dispatch keys on the snapshot's own kind, never on index membership.
     */
    protected rollbackToSnapshotInternal(snapshot: IGameSnapshot, viaDeltaChain: boolean = snapshot.hollow === true): boolean {
        const success = viaDeltaChain
            ? this.restoreThroughDeltaChainFn(snapshot)
            : this.gameStateManager.rollbackToSnapshot(snapshot, this.getCurrentSnapshotFn());
        if (!success) {
            return false;
        }

        // B2a: a bookmark materialized from a hollow snapshot hands the current-snapshot role back to that hollow object, so the flag
        // reset below and later same-player and confirmation writes land on the object the quick-undo policy reads, as they did when the
        // manual map stored the current snapshot itself. Its rng state is the same reference (the window anchor's, which is the source's).
        const source = snapshot.source;
        Contract.assertTrue(source == null || source.rngState === snapshot.rngState, () => `Snapshot ${snapshot.id} was materialized from snapshot ${source.id} but carries a different rng state`);

        this.updateCurrentSnapshotFn(source ?? snapshot);
        this.game.randomGenerator.restore(snapshot.rngState);
        return true;
    }

    /**
     * Extract properties from a snapshot without exposing the full object.
     */
    protected extractSnapshotProperties(snapshot: IGameSnapshot): ISnapshotProperties {
        // A materialized bookmark's flags track its source's (B2a), including after the history maps drop that source.
        const flags = snapshot.source ?? snapshot;
        return {
            roundNumber: snapshot.roundNumber,
            actionNumber: snapshot.actionNumber,
            currentPhase: snapshot.phase,
            snapshotId: snapshot.id,
            requiresConfirmationToRollback: flags.requiresConfirmationToRollback,
            nextSnapshotIsSamePlayer: flags.nextSnapshotIsSamePlayer,
            timepoint: snapshot.timepoint,
            timepointNumber: snapshot.timepointNumber
        };
    }
}
