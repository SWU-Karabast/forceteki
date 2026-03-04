import type { IDeltaSnapshot, ISnapshotProperties } from '../SnapshotInterfaces';
import { SnapshotTimepoint } from '../SnapshotInterfaces';
import type { IClearNewerSnapshotsBinding } from './SnapshotContainerBase';
import type { SnapshotHistoryMap } from './SnapshotHistoryMap';
import type { SnapshotMap } from './SnapshotMap';
import { QuickRollbackPoint } from './MetaSnapshotArray';
import * as Contract from '../../utils/Contract.js';

interface IDeltaEntry {
    type: 'delta';
    delta: IDeltaSnapshot;
}

interface IFullSnapshotEntry {
    type: 'full';
    source: 'action' | 'phase';
    snapshotId: number;
    rollback: () => number | null;
    checkAvailable: () => boolean;
    snapshotProperties: () => ISnapshotProperties | null;
}

type QuickRollbackEntry = IDeltaEntry | IFullSnapshotEntry;

export class DeltaSnapshotContainer {
    private static readonly MaxDeltaEntries = 3;

    private entries: QuickRollbackEntry[] = [];

    public constructor(clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding) {
        clearNewerSnapshotsBinding.clearNewerSnapshots = (id) => this.clearNewerSnapshots(id);
    }

    public addDelta(delta: IDeltaSnapshot): void {
        this.removeExistingEntryBySnapshotId(delta.id);
        this.entries.push({ type: 'delta', delta });
        this.enforceMaxDeltaCount();
    }

    public addSnapshotFromMap<T>(snapshotMap: SnapshotMap<T> | SnapshotHistoryMap<T>, key: T, source: 'action' | 'phase' = 'phase'): void {
        const snapshotId = snapshotMap.getSnapshotProperties(key)?.snapshotId;
        Contract.assertNotNullLike(snapshotId);

        this.removeExistingEntryBySnapshotId(snapshotId);
        this.entries.push({
            type: 'full',
            source,
            snapshotId,
            rollback: () => snapshotMap.rollbackById(snapshotId),
            checkAvailable: () => snapshotMap.hasSnapshotId(snapshotId),
            snapshotProperties: () => snapshotMap.getSnapshotPropertiesById(snapshotId)
        });
    }

    public getMostRecentSnapshotId(): number | null {
        if (this.entries.length === 0) {
            return null;
        }

        return this.getEntrySnapshotId(this.entries[this.entries.length - 1]);
    }

    public getSnapshotProperties(rollbackPoint: QuickRollbackPoint): ISnapshotProperties | null {
        const entry = this.getEntry(rollbackPoint);
        if (!entry) {
            return null;
        }

        if (entry.type === 'full') {
            return entry.snapshotProperties();
        }

        return {
            roundNumber: entry.delta.roundNumber,
            actionNumber: entry.delta.actionNumber,
            currentPhase: entry.delta.phase,
            snapshotId: entry.delta.id,
            requiresConfirmationToRollback: entry.delta.requiresConfirmationToRollback,
            nextSnapshotIsSamePlayer: entry.delta.nextSnapshotIsSamePlayer,
            timepoint: entry.delta.timepoint,
            timepointNumber: entry.delta.timepointNumber,
        };
    }

    public hasQuickSnapshot(rollbackPoint: QuickRollbackPoint): boolean {
        const entry = this.getEntry(rollbackPoint);
        if (!entry) {
            return false;
        }

        if (entry.type === 'full') {
            return entry.checkAvailable();
        }

        return true;
    }

    public rollbackToSnapshot(rollbackPoint: QuickRollbackPoint): number | null {
        Contract.assertNonEmpty(this.entries, 'Attempting to quick rollback with no entries');

        const targetIdx = this.getEntryIndex(rollbackPoint);
        if (targetIdx == null || targetIdx < 0) {
            return null;
        }

        const entry = this.entries[targetIdx];
        if (entry.type === 'full') {
            return entry.rollback();
        }

        return entry.delta.id;
    }

    public rollbackToActionOffset(offset: number): number | null {
        Contract.assertTrue(offset <= 0 && offset > -DeltaSnapshotContainer.MaxDeltaEntries, `Snapshot offset must be less than 1 and greater than than max history length (-${DeltaSnapshotContainer.MaxDeltaEntries}), got ${offset}`);

        const actionEntries = this.entries.filter((entry) => this.isActionEntry(entry));
        const idx = actionEntries.length + offset - 1;
        if (idx < 0 || idx >= actionEntries.length) {
            return null;
        }

        const entry = actionEntries[idx];
        if (entry.type === 'full') {
            return entry.rollback();
        }

        return entry.delta.id;
    }

    public getActionSnapshotProperties(offset: number): ISnapshotProperties | null {
        Contract.assertTrue(offset <= 0 && offset > -DeltaSnapshotContainer.MaxDeltaEntries, `Snapshot offset must be less than 1 and greater than than max history length (-${DeltaSnapshotContainer.MaxDeltaEntries}), got ${offset}`);

        const actionEntries = this.entries.filter((entry) => this.isActionEntry(entry));
        const idx = actionEntries.length + offset - 1;
        if (idx < 0 || idx >= actionEntries.length) {
            return null;
        }

        const entry = actionEntries[idx];
        if (entry.type === 'full') {
            return entry.snapshotProperties();
        }

        return {
            roundNumber: entry.delta.roundNumber,
            actionNumber: entry.delta.actionNumber,
            currentPhase: entry.delta.phase,
            snapshotId: entry.delta.id,
            requiresConfirmationToRollback: entry.delta.requiresConfirmationToRollback,
            nextSnapshotIsSamePlayer: entry.delta.nextSnapshotIsSamePlayer,
            timepoint: entry.delta.timepoint,
            timepointNumber: entry.delta.timepointNumber,
        };
    }

    public getDeltaCount(): number {
        return this.entries.filter((entry) => entry.type === 'delta' && entry.delta.timepoint === SnapshotTimepoint.Action).length;
    }

    public setRequiresConfirmationOnMostRecentDelta(): void {
        for (let i = this.entries.length - 1; i >= 0; i--) {
            const entry = this.entries[i];
            if (entry.type === 'delta' && entry.delta.timepoint === SnapshotTimepoint.Action) {
                entry.delta.requiresConfirmationToRollback = true;
                return;
            }
        }
    }

    public clearAllSnapshots(): void {
        this.entries = [];
    }

    private getEntry(point: QuickRollbackPoint): QuickRollbackEntry | null {
        const idx = this.getEntryIndex(point);
        return idx != null ? this.entries[idx] : null;
    }

    private getEntryIndex(point: QuickRollbackPoint): number | null {
        switch (point) {
            case QuickRollbackPoint.Current:
                return this.entries.length > 0 ? this.entries.length - 1 : null;
            case QuickRollbackPoint.Previous:
                return this.entries.length > 1 ? this.entries.length - 2 : null;
            default:
                return null;
        }
    }

    private getEntrySnapshotId(entry: QuickRollbackEntry): number {
        return entry.type === 'delta' ? entry.delta.id : entry.snapshotId;
    }

    private removeExistingEntryBySnapshotId(snapshotId: number): void {
        this.entries = this.entries.filter((entry) => this.getEntrySnapshotId(entry) !== snapshotId);
    }

    private clearNewerSnapshots(snapshotId: number): void {
        this.entries = this.entries.filter((entry) => this.getEntrySnapshotId(entry) <= snapshotId);
    }

    private enforceMaxDeltaCount(): void {
        let deltaCount = this.getDeltaCount();
        while (deltaCount > DeltaSnapshotContainer.MaxDeltaEntries) {
            const oldestIdx = this.entries.findIndex((entry) => entry.type === 'delta' && entry.delta.timepoint === SnapshotTimepoint.Action);
            if (oldestIdx < 0) {
                break;
            }

            this.entries.splice(oldestIdx, 1);
            deltaCount--;
        }
    }

    private isActionEntry(entry: QuickRollbackEntry): boolean {
        return (entry.type === 'delta' && entry.delta.timepoint === SnapshotTimepoint.Action) ||
          (entry.type === 'full' && entry.source === 'action');
    }
}
