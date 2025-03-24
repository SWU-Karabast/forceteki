import type Game from './Game';
import type { GameObjectBase, GameObjectRef } from './GameObjectBase';
import * as Contract from './utils/Contract.js';
import * as Helpers from './utils/Helpers.js';

export class GameObjectManager {
    private _game: Game;
    private _allGameObjects: GameObjectBase[];
    private _gameObjectMapping: Map<string, GameObjectBase>;
    private _lastId = 0;

    public constructor(game: Game) {
        this._game = game;
        this._allGameObjects = [];
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

        for (const obj of gameObject) {
            Contract.assertIsNullLike(obj.uuid,
                `Tried to register a Game Object that was already registered ${obj.uuid}`
            );

            const nextId = this._lastId + 1;
            obj.uuid = 'GameObject_' + nextId;
            this._lastId = nextId;
            this._allGameObjects.push(obj);
            this._gameObjectMapping.set(obj.uuid, obj);
        }
    }
}