import type { SnapshotHistoryMap } from './SnapshotHistoryMap';
import type { SnapshotMap } from './SnapshotMap';
import * as Contract from '../../utils/Contract.js';
import type { IClearNewerSnapshotsBinding } from './SnapshotContainerBase';
import type { ISnapshotProperties } from '../SnapshotInterfaces';

export enum QuickRollbackPoint {
    Current = 'current',
    Previous = 'previous'
}

type RollbackHandler = () => number | null;
type AvailableHandler = () => boolean;
type SnapshotPropertiesHandler = () => ISnapshotProperties | null;

interface IQuickRollbackEntry {
    rollback: RollbackHandler;
    checkAvailable: AvailableHandler;
    snapshotProperties: SnapshotPropertiesHandler;
    snapshotId: number;
}

interface IQuickSnapshotSource<T> {
    rollbackById(snapshotId: number): number | null;
    hasSnapshotId(snapshotId: number): boolean;
    getSnapshotPropertiesById(snapshotId: number): ISnapshotProperties | null;
    getSnapshotProperties(key: T): ISnapshotProperties | null;
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

    public getSnapshotProperties(rollbackPoint: QuickRollbackPoint): ISnapshotProperties | null {
        let rollbackEntry: IQuickRollbackEntry | null;

        switch (rollbackPoint) {
            case QuickRollbackPoint.Current:
                rollbackEntry = this.entries[this.entries.length - 1];
                break;
            case QuickRollbackPoint.Previous:
                rollbackEntry = this.entries[this.entries.length - 2];
                break;
            default:
                rollbackEntry = null;
                break;
        }

        return rollbackEntry?.snapshotProperties();
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
        this.addSnapshotFromSource(snapshotMap, key);
    }

    public addSnapshotFromSource<T>(snapshotSource: IQuickSnapshotSource<T>, key: T): void {
        const snapshotId = snapshotSource.getSnapshotProperties(key)?.snapshotId;

        Contract.assertNotNullLike(snapshotId);

        this.entries.push({
            rollback: () => snapshotSource.rollbackById(snapshotId),
            checkAvailable: () => snapshotSource.hasSnapshotId(snapshotId),
            snapshotProperties: () => snapshotSource.getSnapshotPropertiesById(snapshotId),
            snapshotId
        });
    }

    private clearNewerSnapshots(snapshotId: number): void {
        this.entries = this.entries.filter((entry) => entry.snapshotId <= snapshotId);
    }
}