import type { SnapshotHistoryMap } from './SnapshotHistoryMap';
import type { SnapshotMap } from './SnapshotMap';
import * as Contract from '../../utils/Contract.js';
import type { IClearNewerSnapshotsBinding } from './SnapshotContainerBase';

export enum QuickRollbackPoint {
    Current = 'current',
    Previous = 'previous'
}

type RollbackHandler = () => number | null;
type AvailableHandler = () => boolean;

interface IQuickRollbackEntry {
    rollback: RollbackHandler;
    checkAvailable: AvailableHandler;
    snapshotId: number;
}

export class MetaSnapshotArray {
    private entries: IQuickRollbackEntry[] = [];

    public constructor(clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding) {
        clearNewerSnapshotsBinding.clearNewerSnapshots = (snapshotId: number) => this.clearNewerSnapshots(snapshotId);
    }

    public getMostRecentSnapshotId(): number | null {
        if (this.entries.length === 0) {
            return null;
        }

        return this.entries[this.entries.length - 1].snapshotId;
    }

    public rollbackToSnapshot(rollbackPoint: QuickRollbackPoint): number | null {
        Contract.assertNonEmpty(this.entries, 'Attempting to quick rollback with no snapshots available');

        let rollbackEntry: IQuickRollbackEntry | null;

        switch (rollbackPoint) {
            case QuickRollbackPoint.Current:
                rollbackEntry = this.entries[this.entries.length - 1];
                break;
            case QuickRollbackPoint.Previous:
                rollbackEntry = this.entries[this.entries.length - 2];
                break;
            default:
                Contract.fail(`Unknown quick rollback point: ${rollbackPoint}`);
        }

        return rollbackEntry?.rollback();
    }

    public hasQuickSnapshot(rollbackPoint: QuickRollbackPoint): boolean {
        switch (rollbackPoint) {
            case QuickRollbackPoint.Current:
                return this.entries.length > 0 && this.entries[this.entries.length - 1].checkAvailable();
            case QuickRollbackPoint.Previous:
                return this.entries.length > 1 && this.entries[this.entries.length - 2].checkAvailable();
            default:
                Contract.fail(`Unknown quick rollback point: ${rollbackPoint}`);
        }
    }

    public addSnapshotFromMap<T>(snapshotMap: SnapshotMap<T> | SnapshotHistoryMap<T>, key: T): void {
        const snapshotId = snapshotMap.getSnapshotProperties(key)?.snapshotId;

        Contract.assertNotNullLike(snapshotId);

        this.entries.push({
            rollback: () => snapshotMap.rollbackById(snapshotId),
            checkAvailable: () => snapshotMap.hasSnapshotId(snapshotId),
            snapshotId
        });
    }

    private clearNewerSnapshots(snapshotId: number): void {
        this.entries = this.entries.filter((entry) => entry.snapshotId <= snapshotId);
    }
}