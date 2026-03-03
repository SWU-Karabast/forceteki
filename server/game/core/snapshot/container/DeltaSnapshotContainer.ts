import type { IDeltaSnapshot, ISnapshotProperties } from '../SnapshotInterfaces';
import type { IClearNewerSnapshotsBinding } from './SnapshotContainerBase';
import type { GameStateManager } from '../GameStateManager';
import type { IGameSnapshot } from '../SnapshotInterfaces';
import * as Contract from '../../utils/Contract.js';

export type IGetCurrentDeltaSnapshotHandler = () => IDeltaSnapshot;
export type IUpdateCurrentDeltaSnapshotHandler = (snapshot: IDeltaSnapshot) => void;
export type IGetCurrentFullSnapshotHandler = () => IGameSnapshot | null;

export class DeltaSnapshotContainer<TKey> {
    private readonly maxHistoryLength: number;
    private readonly gameStateManager: GameStateManager;
    private readonly getCurrentDeltaSnapshotFn: IGetCurrentDeltaSnapshotHandler;
    private readonly updateCurrentDeltaSnapshotFn: IUpdateCurrentDeltaSnapshotHandler;
    private readonly getCurrentFullSnapshotFn: IGetCurrentFullSnapshotHandler;

    private snapshots = new Map<TKey, IDeltaSnapshot[]>();

    public constructor(
        maxHistoryLength: number,
        gameStateManager: GameStateManager,
        getCurrentDeltaSnapshotFn: IGetCurrentDeltaSnapshotHandler,
        updateCurrentDeltaSnapshotFn: IUpdateCurrentDeltaSnapshotHandler,
        getCurrentFullSnapshotFn: IGetCurrentFullSnapshotHandler,
        clearNewerSnapshotsBinding: IClearNewerSnapshotsBinding
    ) {
        this.maxHistoryLength = maxHistoryLength;
        this.gameStateManager = gameStateManager;
        this.getCurrentDeltaSnapshotFn = getCurrentDeltaSnapshotFn;
        this.updateCurrentDeltaSnapshotFn = updateCurrentDeltaSnapshotFn;
        this.getCurrentFullSnapshotFn = getCurrentFullSnapshotFn;

        clearNewerSnapshotsBinding.clearNewerSnapshots = (snapshotId: number) => this.clearNewerSnapshots(snapshotId);
    }

    public takeSnapshot(key: TKey): number {
        const currentSnapshot = this.getCurrentDeltaSnapshotFn();

        const snapshotHistory = this.snapshots.get(key);
        if (!snapshotHistory || snapshotHistory.length === 0) {
            this.snapshots.set(key, [currentSnapshot]);
            return currentSnapshot.id;
        }

        if (snapshotHistory[snapshotHistory.length - 1].id === currentSnapshot.id) {
            return currentSnapshot.id;
        }

        snapshotHistory.push(currentSnapshot);

        if (snapshotHistory.length > this.maxHistoryLength) {
            snapshotHistory.shift();
        }

        return currentSnapshot.id;
    }

    public getSnapshotCount(key: TKey): number {
        return this.snapshots.get(key)?.length ?? 0;
    }

    public getSnapshotProperties(key: TKey, offset = 0): ISnapshotProperties | null {
        const snapshot = this.getSnapshot(key, offset);
        return snapshot ? this.extractSnapshotProperties(snapshot) : null;
    }

    public getSnapshotPropertiesById(snapshotId: number): ISnapshotProperties | null {
        const snapshot = this.getAllSnapshots().find((s) => s.id === snapshotId);
        return snapshot ? this.extractSnapshotProperties(snapshot) : null;
    }

    public setRequiresConfirmationToRollbackCurrentSnapshot(key: TKey): void {
        const snapshot = this.getSnapshot(key, 0);
        if (snapshot) {
            snapshot.requiresConfirmationToRollback = true;
        }
    }

    public rollbackToSnapshot(key: TKey, offset: number): number | null {
        const snapshotHistory = this.snapshots.get(key);
        if (!snapshotHistory || snapshotHistory.length === 0) {
            return null;
        }

        const targetIndex = this.resolveTargetIndex(snapshotHistory.length, offset);
        if (targetIndex == null) {
            return null;
        }

        const deltas = snapshotHistory.slice(targetIndex).reverse();
        const success = this.gameStateManager.rollbackToDeltaChain(deltas, this.getCurrentFullSnapshotFn() ?? undefined);
        if (!success) {
            return null;
        }

        this.updateCurrentDeltaSnapshotFn(snapshotHistory[targetIndex]);
        return snapshotHistory[targetIndex].id;
    }

    public rollbackById(snapshotId: number): number | null {
        for (const [, snapshotHistory] of this.snapshots.entries()) {
            const targetIndex = snapshotHistory.findIndex((snapshot) => snapshot.id === snapshotId);
            if (targetIndex < 0) {
                continue;
            }

            const deltas = snapshotHistory.slice(targetIndex).reverse();
            const success = this.gameStateManager.rollbackToDeltaChain(deltas, this.getCurrentFullSnapshotFn() ?? undefined);
            if (!success) {
                return null;
            }

            this.updateCurrentDeltaSnapshotFn(snapshotHistory[targetIndex]);
            return snapshotHistory[targetIndex].id;
        }

        return null;
    }

    public hasSnapshotId(snapshotId: number): boolean {
        return this.getAllSnapshots().some((snapshot) => snapshot.id === snapshotId);
    }

    public clearAllSnapshots(): void {
        this.snapshots.clear();
    }

    public clearNewerSnapshots(snapshotId: number): void {
        for (const [key, snapshotHistory] of this.snapshots.entries()) {
            this.snapshots.set(key, snapshotHistory.filter((snapshot) => snapshot.id <= snapshotId));
        }
    }

    private getSnapshot(key: TKey, offset: number): IDeltaSnapshot | null {
        Contract.assertTrue(offset <= 0 && offset > -this.maxHistoryLength, `Snapshot offset must be less than 1 and greater than than max history length (-${this.maxHistoryLength}), got ${offset}`);

        const snapshotHistory = this.snapshots.get(key);
        if (!snapshotHistory) {
            return null;
        }

        const targetIndex = this.resolveTargetIndex(snapshotHistory.length, offset);
        return targetIndex == null ? null : snapshotHistory[targetIndex];
    }

    private resolveTargetIndex(historyLength: number, offset: number): number | null {
        if (Math.abs(offset) >= historyLength) {
            return null;
        }

        return historyLength + offset - 1;
    }

    private getAllSnapshots(): IDeltaSnapshot[] {
        const allSnapshots: IDeltaSnapshot[] = [];
        for (const snapshotHistory of this.snapshots.values()) {
            allSnapshots.push(...snapshotHistory);
        }
        return allSnapshots;
    }

    private extractSnapshotProperties(snapshot: IDeltaSnapshot): ISnapshotProperties {
        return {
            roundNumber: snapshot.roundNumber,
            actionNumber: snapshot.actionNumber,
            currentPhase: snapshot.phase,
            snapshotId: snapshot.id,
            requiresConfirmationToRollback: snapshot.requiresConfirmationToRollback,
            nextSnapshotIsSamePlayer: snapshot.nextSnapshotIsSamePlayer,
            timepoint: snapshot.timepoint,
            timepointNumber: snapshot.timepointNumber
        };
    }
}
