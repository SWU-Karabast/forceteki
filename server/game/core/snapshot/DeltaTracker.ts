import type { Game } from '../Game';
import type { GameObjectBase } from '../GameObjectBase';
import { getStateDeltaSerializer } from '../StateSerializers';
import type { IDeltaSnapshot } from './SnapshotInterfaces';
import v8 from 'node:v8';
import * as Contract from '../utils/Contract.js';

export class DeltaTracker {
    readonly #game: Game;

    private _tracking = false;
    private changedFields = new Map<string, Record<string, unknown>>();
    private createdObjectUuids: string[] = [];

    private _windowStartGameState: Buffer | null = null;
    private _windowStartStates: Buffer | null = null;
    private _windowStartRngState: IDeltaSnapshot['rngState'] | null = null;
    private _windowStartLastGameObjectId = 0;

    public get isTracking(): boolean {
        return this._tracking;
    }

    public constructor(game: Game) {
        this.#game = game;
    }

    public startTracking(windowStartStates: Buffer): void {
        Contract.assertNotNullLike(this.#game.randomGenerator, 'Attempting to start delta tracking before Randomness is initialized');
        Contract.assertNotNullLike(this.#game.snapshotManager.currentSnapshotId, 'Attempting to start delta tracking before a snapshot anchor exists');
        Contract.assertNotNullLike(windowStartStates, 'Attempting to start delta tracking without serialized object state');

        this._tracking = true;
        this.changedFields.clear();
        this.createdObjectUuids = [];

        this._windowStartGameState = v8.serialize(this.#game.state);
        this._windowStartStates = windowStartStates;
        this._windowStartRngState = this.#game.randomGenerator.rngState;
        this._windowStartLastGameObjectId = this.#game.snapshotManager.gameObjectManager.lastGameObjectId;
    }

    public stopTracking(): void {
        this._tracking = false;
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

        const currentValue = (go as unknown as Record<string, unknown>)[fieldName];
        goEntry[fieldName] = fieldSerializer.serialize(currentValue);
    }

    public recordObjectCreation(uuid: string): void {
        if (!this._tracking) {
            return;
        }

        this.createdObjectUuids.push(uuid);
    }

    public checkpoint(metadata: Omit<IDeltaSnapshot, 'changedFields' | 'createdObjectUuids' | 'gameState' | 'states' | 'rngState' | 'lastGameObjectId'>): IDeltaSnapshot {
        Contract.assertNotNullLike(this._windowStartGameState, 'Delta checkpoint requested before startTracking captured game state');
        Contract.assertNotNullLike(this._windowStartStates, 'Delta checkpoint requested before startTracking captured object states');
        Contract.assertNotNullLike(this._windowStartRngState, 'Delta checkpoint requested before startTracking captured RNG state');

        const delta: IDeltaSnapshot = {
            ...metadata,
            changedFields: this.changedFields,
            createdObjectUuids: this.createdObjectUuids,
            gameState: this._windowStartGameState,
            states: this._windowStartStates,
            rngState: this._windowStartRngState,
            lastGameObjectId: this._windowStartLastGameObjectId,
        };

        this.changedFields = new Map();
        this.createdObjectUuids = [];

        return delta;
    }
}
