import type { Game } from './Game';
import { registerStateBase, registerStateClassMarker, statePrimitive, type GameObjectId } from './GameObjectUtils';
import { getCurrentGameObjectState, hydrateGameObjectStateFromSnapshot } from './stateSerialization/StateSerialization';
import * as Contract from './utils/Contract';

export interface IGameObjectBaseState {
    uuid: string;
}

export interface IGameObjectBase {
    getObjectId(): GameObjectId<this>;
}

/**
 * A type that takes a type and creates a version of it where any properties of type GameObjectId<T> are replaced with T.
 * Used to enforce that any GameObjectId fields on the type are mapped to GameObjects.
 */
export type UnwrapRef<T> = T extends unknown[] ?
    (UnwrapRefArray<T>) :
    (T extends object ? UnwrapRefObject<T> : never);

/** If the type is an array, unpack the array and check if the elements are either GameObjectIds directly, or objects which can contain GameObjectIds. */
export type UnwrapRefArray<T extends unknown[]> = T extends (infer R)[] ? (R extends GameObjectId<infer U> ? U[] : UnwrapRefObject<R>[]) : never;

/** This loops through each property in T and maps it to a new type. */
export type UnwrapRefObject<T> = {
    [P in keyof T]: UnwrapRefProperty<T[P]>
};

/** Will directly return the type, or if it's a GameObjectId or array of GameObjectId, return the inner GameObject type of the GameObjectId instead. * */
type UnwrapRefProperty<T> = T extends GameObjectId<infer U> ?
    U :
    (T extends (infer R)[] ? (R extends GameObjectId<infer U> ? U[] : R[]) :
        T);

/** GameObjectBase simply defines this as an object with state, and with a unique identifier. */
@registerStateBase()
export abstract class GameObjectBase implements IGameObjectBase {
    public readonly game: Game;

    // The cast "as unknown as IGameObjectBaseState" is a work-around to let us instantiate it as an empty object initially.
    // While we need to declare the state here, unless manual usage is required, it should never be directly accessed.
    // If direct access is required, use "declare state: <SomeInterface>;" in the specific class that needs manual access.
    protected state: IGameObjectBaseState = {} as unknown as IGameObjectBaseState;

    private _cannotHaveRefs = false;
    private _initialized = false;

    public get cannotHaveRefs() {
        return this._cannotHaveRefs;
    }

    public get initialized() {
        return this._initialized;
    }

    /** ID given by the game engine. */
    @statePrimitive() private accessor _uuid: string;
    public get uuid() {
        return this._uuid;
    }

    public set uuid(value: string) {
        Contract.assertFalse(!!this._uuid, `Attempting to set uuid on ${this.getGameObjectName()} (UUID: ${this._uuid}) but it already has a uuid.`);
        this._uuid = value;
    }

    public constructor(game: Game) {
        this.game = game;

        const ctor = this.constructor as { [registerStateClassMarker]?: boolean; name: string };
        Contract.assertTrue(
            Object.prototype.hasOwnProperty.call(ctor, registerStateClassMarker) && ctor[registerStateClassMarker] === true,
            `Class "${ctor.name}" extends GameObjectBase but is missing @registerState() or @registerStateBase(). Please add one of these decorators to ensure the state of this class is properly tracked.`
        );

        this.game.gameObjectManager.register(this);
    }

    /** This function will be called after the class has initialized. Do not override this method, instead override onInitialize. */
    public initialize(): this {
        Contract.assertFalse(this._initialized, `Attempting to initialize an already initialized GameObject: ${this.getGameObjectName()} (UUID: ${this.uuid})`);

        this._initialized = true;
        this.onInitialize();
        return this;
    }

    /** A overridable method . Always ensure to call super.setupDefaultState() as the first line if you do override this.  */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected onInitialize() { }

    public setCannotHaveRefs() {
        this._cannotHaveRefs = true;
    }

    /** Sets the state.  */
    public setState(state: IGameObjectBaseState) {
        const oldState = getCurrentGameObjectState(this);
        this.state = state;
        hydrateGameObjectStateFromSnapshot(this, this.state);
        this.afterSetState(oldState);
    }

    /**
     * @deprecated Be ***very*** careful with this function. This returns the current snapshot-shaped state payload.
     * Runtime-mode classes return the live state object reference; compile-time classes reconstruct it from decorated fields.
     */
    public getStateUnsafe() {
        return getCurrentGameObjectState(this);
    }

    public getState() {
        const currentState = this.getStateUnsafe();

        // This *must* return a copy, without any references, hence the use of structuredClone.
        try {
            return structuredClone(currentState);
        } catch (ex) {
            throw new Error(`Unable to retrieve the copied state for ${this.getGameObjectName()}.\nError: ${ex.toString()}\nCurrent State:\n\n${JSON.stringify(currentState)}\n\n`);
        }
    }

    /** A function for game to call on all objects after all state has been rolled back. Intended to be used when a class has state changes that have external changes, for example, updating OngoingEffectEngine. */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public afterSetAllState(oldState: IGameObjectBaseState) { }

    /** A function for game to call after the state for this object has been rolled back. Intended to be used when a class has state changes that have internal changes, such as caching state. */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected afterSetState(oldState: IGameObjectBaseState) { }

    /**
     * A function for game to call on all objects if they are being removed from the GameObject list (typically after a rollback to before the object was created).
     * This is intended to be used for cleanup of any state that the object has that is not part of the state object.
     *
     * The most common example is removing event handlers that have been registered on Game.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public cleanupOnRemove(oldState: IGameObjectBaseState) { }

    private assertInitialized(operation: string) {
        Contract.assertTrue(this._initialized, `Attempting to ${operation} on uninitialized GameObject: ${this.getGameObjectName()} (UUID: ${this.uuid})`);
    }

    private assertCanCreateRefs(operation: string) {
        this.assertInitialized(operation);
        Contract.assertFalse(this.cannotHaveRefs, `Attempting to ${operation} for ${this.getGameObjectName()} (UUID: ${this.uuid}) but it cannot have refs (cannotHaveRefs: true)`);
    }


    /** Creates a typed ID to this GO that can be used to do a lookup to the object. */
    public getObjectId(): GameObjectId<this> {
        this.assertCanCreateRefs('create a state id');

        return this.uuid as GameObjectId<this>;
    }

    /** Shortcut to get the Game Object from an ID. This is intentionally an arrow function to cause structured clone to break if called on this class. */
    public getObject = <T extends GameObjectBase>(id: GameObjectId<T>): T => {
        return this.game.gameObjectManager.get(id);
    };

    public getGameObjectName(): string {
        return 'GameObject';
    }
}


