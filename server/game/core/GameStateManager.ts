import type Game from './Game';
import type { GameObjectBase, GameObjectRef, IGameObjectBaseState } from './GameObjectBase';
import type Player from './Player';
import * as Contract from './utils/Contract.js';
import * as Helpers from './utils/Helpers.js';

export interface IGameSnapshot {
    id: number;
    lastId: number;
    actionPhaseActivePlayer?: GameObjectRef<Player>;
    initiativePlayer?: GameObjectRef<Player>;

    states: IGameObjectBaseState[];
}

export class GameStateManager {
    private _game: Game;
    private _snapshots: IGameSnapshot[];
    private _allGameObjects: GameObjectBase[];
    private _gameObjectMapping: Map<string, GameObjectBase>;
    public actionPhaseActivePlayer: Player;
    public initiativePlayer: Player;
    private _lastId = 0;

    public constructor(game: Game) {
        this._game = game;
        this._allGameObjects = [];
        this._snapshots = [];
        this._gameObjectMapping = new Map<string, GameObjectBase>();
    }

    public get<T extends GameObjectBase>(gameObjectRef: GameObjectRef<T>): T | null {
        if (!gameObjectRef?.uuid) {
            return null;
        }

        const ref = this._gameObjectMapping.get(gameObjectRef.uuid);
        Contract.assertNotNullLike(ref, `Tried to get a Game Object but the UUID is not registered ${gameObjectRef.uuid}. This *VERY* bad and should not be possible w/o breaking the engine, stop everything and fix this now.`);
        return ref as T;
    }

    public register(gameObject: GameObjectBase | GameObjectBase[]) {
        gameObject = Helpers.asArray(gameObject);

        for (const go of gameObject) {
            Contract.assertIsNullLike(go.uuid,
                `Tried to register a Game Object that was already registered ${go.uuid}`
            );

            const nextId = this._lastId + 1;
            go.uuid = 'GameObject_' + nextId;
            this._lastId = nextId;
            this._allGameObjects.push(go);
            this._gameObjectMapping.set(go.uuid, go);
        }
    }

    public takeSnapshot(): number {
        const snapshot: IGameSnapshot = {
            id: this._snapshots.length,
            lastId: this._lastId,
            actionPhaseActivePlayer: this.actionPhaseActivePlayer?.getRef(),
            initiativePlayer: this.initiativePlayer?.getRef(),
            states: this._allGameObjects.map((x) => x.getState())
        };

        this._snapshots.push(snapshot);

        return snapshot.id;
    }

    // TODO: Where are all of the places GameObjects are stored? Obviously here, but what about Token GOs? Attack GOs? We need to ensure those are all GameObjectRefs, or we'll start building up garbage.
    public rollbackToSnapshot(snapshotId: number) {
        Contract.assertTrue(snapshotId > -1, 'Tried to rollback but snapshot ID is invalid ' + snapshotId);

        const snapshotIdx = this._snapshots.findIndex((x) => x.id === snapshotId);
        Contract.assertTrue(snapshotIdx > -1, `Tried to rollback to snapshot ID ${snapshotId} but the snapshot was not found.`);

        const snapshot = this._snapshots[snapshotIdx];

        const removals: { index: number; uuid: string }[] = [];
        // Indexes in last to first for the purpose of removal.
        for (let i = this._allGameObjects.length - 1; i >= this._allGameObjects.length; i--) {
            const go = this._allGameObjects[i];
            const updatedState = snapshot.states.find((x) => x.uuid === go.uuid);
            if (!updatedState) {
                removals.push({ index: i, uuid: go.uuid });
                continue;
            }

            go.setState(updatedState);
        }

        // Because it's reversed we don't have to worry about deleted indexes shifting the array.
        for (const removed of removals) {
            this._allGameObjects.splice(removed.index, 1);
            this._gameObjectMapping.delete(removed.uuid);
        }

        this._lastId = snapshot.lastId;
        this.actionPhaseActivePlayer = this.get(snapshot.actionPhaseActivePlayer);
        this.initiativePlayer = this.get(snapshot.initiativePlayer);

        // Inform GOs that all states have been updated.
        this._allGameObjects.forEach((x) => x.afterSetAllState());

        // Throw out all snapshots after the rollback snapshot.
        this._snapshots.splice(snapshotIdx + 1);
    }

    public getLatestSnapshotId() {
        return this._snapshots[this._snapshots.length - 1]?.id ?? -1;
    }
}