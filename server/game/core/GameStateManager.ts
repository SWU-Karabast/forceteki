import type Game from './Game';
import type { GameObjectBase, GameObjectRef, IGameObjectBaseState } from './GameObjectBase';
import type { IGameSnapshot } from './snapshot/SnapshotInterfaces';
import * as Contract from './utils/Contract.js';
import * as Helpers from './utils/Helpers.js';

export interface IGameObjectRegistrar {
    register(gameObject: GameObjectBase | GameObjectBase[]): void;
    get<T extends GameObjectBase>(gameObjectRef: GameObjectRef<T>): T | null;
}

export class GameStateManager implements IGameObjectRegistrar {
    private readonly allGameObjects: GameObjectBase[] = [];
    private readonly game: Game;
    private readonly gameObjectMapping = new Map<string, GameObjectBase>();

    private _lastGameObjectId = -1;

    public get lastGameObjectId(): number {
        return this._lastGameObjectId;
    }

    public constructor(game: Game) {
        this.game = game;
    }

    public get<T extends GameObjectBase>(gameObjectRef: GameObjectRef<T>): T | null {
        if (!gameObjectRef?.uuid) {
            return null;
        }

        const ref = this.gameObjectMapping.get(gameObjectRef.uuid);
        Contract.assertNotNullLike(ref, `Tried to get a Game Object but the UUID is not registered ${gameObjectRef.uuid}. This *VERY* bad and should not be possible w/o breaking the engine, stop everything and fix this now.`);
        return ref as T;
    }

    public register(gameObject: GameObjectBase | GameObjectBase[]) {
        gameObject = Helpers.asArray(gameObject);

        for (const go of gameObject) {
            Contract.assertIsNullLike(go.uuid,
                `Tried to register a Game Object that was already registered ${go.uuid}`
            );

            const nextId = this._lastGameObjectId + 1;
            go.uuid = 'GameObject_' + nextId;
            this._lastGameObjectId = nextId;
            this.allGameObjects.push(go);
            this.gameObjectMapping.set(go.uuid, go);
        }
    }

    public getAllGameStates(): IGameObjectBaseState[] {
        return this.allGameObjects.map((go) => go.getState());
    }

    public rollbackToSnapshot(snapshot: IGameSnapshot) {
        Contract.assertNotNullLike(snapshot, 'Empty snapshot provided for rollback');

        this.game.state = structuredClone(snapshot.gameState);

        const removals: { index: number; uuid: string }[] = [];
        // Indexes in last to first for the purpose of removal.
        for (let i = this.allGameObjects.length - 1; i >= 0; i--) {
            const go = this.allGameObjects[i];
            const updatedState = snapshot.states.find((x) => x.uuid === go.uuid);
            if (!updatedState) {
                removals.push({ index: i, uuid: go.uuid });
                continue;
            }

            go.setState(updatedState);
        }

        // Because it's reversed we don't have to worry about deleted indexes shifting the array.
        for (const removed of removals) {
            this.allGameObjects.splice(removed.index, 1);
            this.gameObjectMapping.delete(removed.uuid);
        }

        this._lastGameObjectId = snapshot.lastGameObjectId;

        // Inform GOs that all states have been updated.
        this.allGameObjects.forEach((x) => x.afterSetAllState());
    }
}