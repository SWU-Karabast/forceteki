import type { Game } from '../Game';
import type { GameObjectBase } from '../GameObjectBase';
import { getStateDeltaSerializer } from '../StateSerializers';
import type { IDeltaSnapshot, IGameSnapshot } from './SnapshotInterfaces';
import * as Contract from '../utils/Contract.js';

export class DeltaTracker {
    readonly #game: Game;

    private _tracking = false;
    private changedFields = new Map<string, Record<string, unknown>>();
    private createdObjectUuids: string[] = [];

    private _windowStartRngState: IDeltaSnapshot['rngState'] | null = null;
    private _windowStartLastGameObjectId = 0;

    public get isTracking(): boolean {
        return this._tracking;
    }

    public constructor(game: Game) {
        this.#game = game;
    }

    public startTrackingFromSnapshot(windowStartSnapshot: Pick<IGameSnapshot, 'rngState' | 'lastGameObjectId'>): void {
        Contract.assertNotNullLike(this.#game.randomGenerator, 'Attempting to start delta tracking before Randomness is initialized');
        Contract.assertNotNullLike(this.#game.snapshotManager.currentSnapshotId, 'Attempting to start delta tracking before a snapshot anchor exists');
        Contract.assertNotNullLike(windowStartSnapshot, 'Attempting to start delta tracking without snapshot baseline data');
        Contract.assertNotNullLike(windowStartSnapshot.rngState, 'Attempting to start delta tracking without RNG state');

        this._tracking = true;
        this.changedFields.clear();
        this.createdObjectUuids = [];

        this._windowStartRngState = structuredClone(windowStartSnapshot.rngState);
        this._windowStartLastGameObjectId = windowStartSnapshot.lastGameObjectId;
    }

    public startTracking(): void {
        const currentSnapshot = this.#game.snapshotManager.getCurrentSnapshotIfMaterialized();
        if (currentSnapshot) {
            this.startTrackingFromSnapshot(currentSnapshot);
            return;
        }

        this.startTrackingFromSnapshot({
            rngState: this.#game.randomGenerator.rngState,
            lastGameObjectId: this.#game.snapshotManager.gameObjectManager.lastGameObjectId,
        });
    }

    public stopTracking(): void {
        this._tracking = false;
    }

    public hasTrackedWindow(): boolean {
        return this._windowStartRngState != null;
    }

    public recordFieldChange(go: GameObjectBase, fieldName: string): void {
        if (!this._tracking) {
            return;
        }

        let goEntry = this.changedFields.get(go.uuid);
        if (!goEntry) {
            goEntry = {};
            this.changedFields.set(go.uuid, goEntry);
        }

        const deltaSerializer = getStateDeltaSerializer(go);
        const fieldSerializer = deltaSerializer[fieldName];
        Contract.assertNotNullLike(fieldSerializer, `No generated delta serializer found for ${go.constructor.name}.${fieldName}`);

        if (fieldName in goEntry) {
            return;
        }

        const currentValue = (go as unknown as Record<string, unknown>)[fieldName];
        goEntry[fieldName] = fieldSerializer.serialize(currentValue);
    }

    public recordObjectCreation(uuid: string): void {
        if (!this._tracking) {
            return;
        }

        this.createdObjectUuids.push(uuid);
    }

    public checkpoint(metadata: Omit<IDeltaSnapshot, 'changedFields' | 'createdObjectUuids' | 'rngState' | 'lastGameObjectId'>): IDeltaSnapshot {
        Contract.assertNotNullLike(this._windowStartRngState, 'Delta checkpoint requested before startTracking captured RNG state');

        const delta: IDeltaSnapshot = {
            ...metadata,
            changedFields: this.changedFields,
            createdObjectUuids: this.createdObjectUuids,
            rngState: structuredClone(this._windowStartRngState),
            lastGameObjectId: this._windowStartLastGameObjectId,
        };

        this.changedFields = new Map();
        this.createdObjectUuids = [];

        return delta;
    }

    public createPendingRollbackDelta(): IDeltaSnapshot {
        Contract.assertNotNullLike(this._windowStartRngState, 'Pending delta requested before startTracking captured RNG state');

        const snapshotId = this.#game.snapshotManager.currentSnapshotId;
        const roundNumber = this.#game.snapshotManager.currentSnapshottedRound;
        const actionNumber = this.#game.snapshotManager.currentSnapshottedAction;
        const phase = this.#game.snapshotManager.currentSnapshottedPhase;
        const timepoint = this.#game.snapshotManager.currentSnapshottedTimepointType;
        const timepointNumber = this.#game.snapshotManager.currentSnapshottedTimepointNumber;

        Contract.assertNotNullLike(snapshotId, 'Pending delta requested without an active snapshot id');
        Contract.assertNotNullLike(roundNumber, 'Pending delta requested without an active round number');
        Contract.assertNotNullLike(actionNumber, 'Pending delta requested without an active action number');
        Contract.assertNotNullLike(phase, 'Pending delta requested without an active phase');
        Contract.assertNotNullLike(timepoint, 'Pending delta requested without an active timepoint');
        Contract.assertNotNullLike(timepointNumber, 'Pending delta requested without an active timepoint number');

        return {
            id: snapshotId,
            changedFields: this.changedFields,
            createdObjectUuids: this.createdObjectUuids,
            rngState: structuredClone(this._windowStartRngState),
            lastGameObjectId: this._windowStartLastGameObjectId,
            actionNumber,
            roundNumber,
            phase,
            timepoint,
            timepointNumber,
            activePlayerId: this.#game.snapshotManager.currentSnapshottedActivePlayer,
            requiresConfirmationToRollback: false,
            nextSnapshotIsSamePlayer: undefined,
        };
    }
}
