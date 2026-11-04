import type { SnapshotHistoryMap } from './SnapshotHistoryMap';
import type { SnapshotMap } from './SnapshotMap';
import { Contract } from '../../utils/Contract.js';
import type { IClearNewerSnapshotsBinding } from './SnapshotContainerBase';
import type { IDeltaSnapshot, ISnapshotProperties } from '../SnapshotInterfaces';
import { DeltaSnapshotKind } from '../SnapshotInterfaces';

export enum QuickRollbackPoint {
    Current = 'current',
    Previous = 'previous'
}

type RollbackHandler = () => number | null;
type AvailableHandler = () => boolean;
type SnapshotPropertiesHandler = () => ISnapshotProperties | null;

/** How to restore a snapshot, read its properties and tell whether it is still held, all through the snapshot's backing map. */
interface IFullSnapshotHandlers {
    rollback: RollbackHandler;
    checkAvailable: AvailableHandler;
    snapshotProperties: SnapshotPropertiesHandler;
}

/** An entry whose full snapshot is the only authority: every phase push, prompted-player push and bridge-timepoint action push. */
interface IFullQuickEntry extends IFullSnapshotHandlers {
    type: 'full';
    snapshotId: number;
    source: 'action' | 'phase';
}

/**
 * An entry for an action-phase Action timepoint, holding that timepoint's delta until the cap releases it. Its snapshot is hollow
 * (P4-F): the history map that holds it restores it through the delta chain and reports its metadata; a released entry is never
 * offered, because the history map has already dropped its snapshot.
 */
interface IDeltaQuickEntry {
    type: 'delta';
    snapshotId: number;
    delta: IDeltaSnapshot | null;
    snapshotHandlers: IFullSnapshotHandlers;
}

type QuickEntry = IFullQuickEntry | IDeltaQuickEntry;

export interface IQuickEntrySummary {
    type: 'full' | 'delta';
    snapshotId: number;

    /** False only for a delta entry whose payload the cap released. */
    live: boolean;
}

/**
 * One player's quick-undo entries, in push order, as typed entry points into the global delta index.
 * Replaces the `MetaSnapshotArray` with identical position arithmetic: `Current` and `Previous` are array positions
 * (docs/plans/04-delta-snapshots.md, "Known limitations"), so the cap never removes an entry.
 */
export class DeltaSnapshotContainer {
    /** Live action-delta entries a container may hold; the next one releases the oldest. */
    public static readonly MaxDeltaEntries = 3;

    private entries: QuickEntry[] = [];

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
        let rollbackEntry: QuickEntry | null;

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

        return rollbackEntry == null ? undefined : this.handlersOf(rollbackEntry).snapshotProperties();
    }

    public rollbackToSnapshot(rollbackPoint: QuickRollbackPoint): number | null {
        Contract.assertNonEmpty(this.entries, 'Attempting to quick rollback with no snapshots available');

        let rollbackEntry: QuickEntry | null;

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

        return rollbackEntry == null ? undefined : this.handlersOf(rollbackEntry).rollback();
    }

    public hasQuickSnapshot(rollbackPoint: QuickRollbackPoint): boolean {
        switch (rollbackPoint) {
            case QuickRollbackPoint.Current:
                return this.entries.length > 0 && this.handlersOf(this.entries[this.entries.length - 1]).checkAvailable();
            case QuickRollbackPoint.Previous:
                return this.entries.length > 1 && this.handlersOf(this.entries[this.entries.length - 2]).checkAvailable();
            default:
                Contract.fail(`Unknown quick rollback point: ${rollbackPoint}`);
        }
    }

    /** Pushes a full entry for the snapshot `key` holds in `snapshotMap`. No dedupe by snapshot id, as before. */
    public addFullEntry<T>(snapshotMap: SnapshotMap<T> | SnapshotHistoryMap<T>, key: T, source: 'action' | 'phase'): void {
        const snapshotId = snapshotMap.getSnapshotProperties(key)?.snapshotId;

        Contract.assertNotNullLike(snapshotId);

        this.entries.push({ type: 'full', snapshotId, source, ...this.buildFullHandlers(snapshotMap, snapshotId) });
    }

    /** Pushes a delta entry for `delta`, whose id must be the snapshot `key` holds in `snapshotMap`. Returns whether the cap released a payload. */
    public addDeltaEntry<T>(delta: IDeltaSnapshot, snapshotMap: SnapshotMap<T> | SnapshotHistoryMap<T>, key: T): boolean {
        const snapshotId = snapshotMap.getSnapshotProperties(key)?.snapshotId;

        Contract.assertNotNullLike(snapshotId);
        Contract.assertTrue(snapshotId === delta.id, `Delta ${delta.id} does not belong to the snapshot ${snapshotId} the map holds for this key`);
        Contract.assertTrue(delta.kind === DeltaSnapshotKind.Action, `Delta ${delta.id} is a ${delta.kind} delta; only action deltas get a quick entry`);

        this.entries.push({ type: 'delta', snapshotId, delta, snapshotHandlers: this.buildFullHandlers(snapshotMap, snapshotId) });

        return this.enforceMaxDeltaCount();
    }

    /** The id of the oldest delta entry that still holds its payload, or null when none does. */
    public getOldestLiveDeltaId(): number | null {
        for (const entry of this.entries) {
            if (entry.type === 'delta' && entry.delta !== null) {
                return entry.snapshotId;
            }
        }

        return null;
    }

    public getLiveDeltaCount(): number {
        return this.countLiveDeltas();
    }

    /** Drops every delta payload and keeps the entries, so positions are unchanged (`clearAllSnapshots`). */
    public releaseAllDeltas(): void {
        for (const entry of this.entries) {
            if (entry.type === 'delta') {
                entry.delta = null;
            }
        }
    }

    public getEntrySummaries(): readonly IQuickEntrySummary[] {
        return this.entries.map((entry) => ({
            type: entry.type,
            snapshotId: entry.snapshotId,
            live: entry.type === 'full' || entry.delta !== null
        }));
    }

    /**
     * Releases the payload of the oldest live delta entries until at most {@link MaxDeltaEntries} are live. A released entry keeps its
     * position and its full-snapshot handlers, because `Current` and `Previous` are array positions and removing an entry can change
     * which entry `Previous` resolves to after a rollback prunes the newer ones (`DeltaSnapshotContainer.spec.ts` pins this; a splice
     * fails it); full entries are never released.
     */
    private enforceMaxDeltaCount(): boolean {
        let released = false;

        while (this.countLiveDeltas() > DeltaSnapshotContainer.MaxDeltaEntries) {
            const oldest = this.entries.find((entry): entry is IDeltaQuickEntry => entry.type === 'delta' && entry.delta !== null);
            oldest.delta = null;
            released = true;
        }

        return released;
    }

    private countLiveDeltas(): number {
        let count = 0;
        for (const entry of this.entries) {
            if (entry.type === 'delta' && entry.delta !== null) {
                count++;
            }
        }

        return count;
    }

    /** Dispatch is by entry type only, never by index membership: a boundary id can be both a full entry and a bridge in the index. */
    private handlersOf(entry: QuickEntry): IFullSnapshotHandlers {
        switch (entry.type) {
            case 'full':
                return entry;
            case 'delta':
                // The entry's snapshot is hollow, so its handlers restore through the history map's dispatch, which takes the delta chain.
                // Availability already excludes a released entry (its snapshot left the history map before the cap released it).
                return {
                    ...entry.snapshotHandlers,
                    rollback: () => {
                        // Offering an entry implies its payload is live: the history map drops a snapshot no later than the cap releases
                        // its delta (both keep the newest three pushes, and every delta entry is also a history push). A rollback attempt on
                        // an entry that is not offered still returns null through the history map, as before; only an offered one is checked.
                        Contract.assertFalse(
                            entry.delta === null && entry.snapshotHandlers.checkAvailable(),
                            () => `Quick rollback to snapshot ${entry.snapshotId} is offered, but the cap released its delta payload`
                        );
                        return entry.snapshotHandlers.rollback();
                    }
                };
            default:
                return Contract.fail(`Unknown quick entry type: ${JSON.stringify(entry)}`);
        }
    }

    private buildFullHandlers<T>(snapshotMap: SnapshotMap<T> | SnapshotHistoryMap<T>, snapshotId: number): IFullSnapshotHandlers {
        return {
            rollback: () => snapshotMap.rollbackById(snapshotId),
            checkAvailable: () => snapshotMap.hasSnapshotId(snapshotId),
            snapshotProperties: () => snapshotMap.getSnapshotPropertiesById(snapshotId)
        };
    }

    private clearNewerSnapshots(snapshotId: number): void {
        this.entries = this.entries.filter((entry) => entry.snapshotId <= snapshotId);
    }
}
