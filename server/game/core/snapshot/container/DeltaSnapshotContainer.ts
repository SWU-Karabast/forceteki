import type { IClearNewerSnapshotsBinding } from './SnapshotContainerBase';
import type { IDeltaSnapshot, ISnapshotProperties } from '../SnapshotInterfaces';

/**
 * Container for delta snapshots, which are lightweight reverse deltas
 * used for action undo during the action phase instead of full v8.serialize snapshots.
 *
 * Stores deltas as a global linear sequence (not per-player) since delta windows
 * span the entire game state, not a single player's actions. The per-player aspect
 * is handled by quick snapshot references in MetaSnapshotArray.
 *
 * Participates in the clearNewerSnapshots broadcast from SnapshotFactory.
 */
export class DeltaSnapshotContainer {
    private readonly maxHistoryLength: number;
    private deltas: IDeltaSnapshot[] = [];

    public constructor(
        maxHistoryLength: number,
        clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding
    ) {
        this.maxHistoryLength = maxHistoryLength;
        clearNewerSnapshotsBinding.clearNewerSnapshots = (snapshotId: number) => this.clearNewerSnapshots(snapshotId);
    }

    /**
     * Store a delta in the global sequence.
     */
    public addDelta(delta: IDeltaSnapshot): void {
        this.deltas.push(delta);

        if (this.deltas.length > this.maxHistoryLength) {
            this.deltas.shift();
        }
    }

    /**
     * Get all deltas with id > targetSnapshotId, in reverse chronological order (most recent first).
     * Used for chained rollback: these are the deltas that need to be undone to roll back to the target.
     */
    public getDeltasNewerThan(targetSnapshotId: number): IDeltaSnapshot[] {
        return this.deltas.filter((d) => d.id > targetSnapshotId).reverse();
    }

    /**
     * Get the number of deltas available.
     */
    public getDeltaCount(): number {
        return this.deltas.length;
    }

    /**
     * Get the most recent delta.
     */
    public getMostRecentDelta(): IDeltaSnapshot | null {
        if (this.deltas.length === 0) {
            return null;
        }
        return this.deltas[this.deltas.length - 1];
    }

    /**
     * Check if a specific snapshot ID exists.
     */
    public hasSnapshotId(snapshotId: number): boolean {
        return this.deltas.some((d) => d.id === snapshotId);
    }

    /**
     * Extract snapshot properties from a delta.
     */
    public extractSnapshotProperties(delta: IDeltaSnapshot): ISnapshotProperties {
        return {
            roundNumber: delta.roundNumber,
            actionNumber: delta.actionNumber,
            currentPhase: delta.phase,
            snapshotId: delta.id,
            requiresConfirmationToRollback: delta.requiresConfirmationToRollback,
            nextSnapshotIsSamePlayer: delta.nextSnapshotIsSamePlayer,
            timepoint: delta.timepoint,
            timepointNumber: delta.timepointNumber
        };
    }

    /**
     * Get snapshot properties for a delta by snapshot ID.
     */
    public getSnapshotPropertiesById(snapshotId: number): ISnapshotProperties | null {
        const delta = this.deltas.find((d) => d.id === snapshotId);
        if (delta) {
            return this.extractSnapshotProperties(delta);
        }
        return null;
    }

    /**
     * Set the most recent delta to require confirmation for rollback.
     */
    public setRequiresConfirmationToRollback(): void {
        const delta = this.getMostRecentDelta();
        if (delta) {
            delta.requiresConfirmationToRollback = true;
        }
    }

    private clearNewerSnapshots(snapshotId: number): void {
        this.deltas = this.deltas.filter((d) => d.id <= snapshotId);
    }

    public clearAllSnapshots(): void {
        this.deltas = [];
    }
}
