import type Game from './Game';
import { copyState, registerState } from './GameObjectUtils';
import * as Contract from './utils/Contract';
import * as Helpers from './utils/Helpers';

export interface IGameObjectBaseState {
    uuid: string;
}

export interface IGameObjectBase<T extends IGameObjectBaseState = IGameObjectBaseState> {
    getRef<TRef extends GameObjectBase<T>>(): GameObjectRef<TRef>;
}

/**
 * A wrapper object that contains a UUID. This should be used when saving any object reference to the state object.
 * Never create an object with this interface manually, instead always use {@link GameObjectBase.getRef} to create an instance.
 * @template T The template itself is unused, but it can provide some type safety, or at least awareness,
 * of what type the GameObjectRef was created from. See the Card.controller set property for an example.
 * @example this.state.controllerRef = player.getRef();
 * // ... elsewhere
 * const player = this.game.gameObjectManager.get(this.state.controllerRef);
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
export interface GameObjectRef<T extends GameObjectBase = GameObjectBase> {
    isRef: true;
    uuid: string;
}

/** GameObjectBase simply defines this as an object with state, and with a unique identifier. */
@registerState()
export abstract class GameObjectBase<T extends IGameObjectBaseState = IGameObjectBaseState> implements IGameObjectBase<T> {
    public readonly game: Game;

    protected state: T;

    private _hasRef = false;

    public get hasRef() {
        return this._hasRef || this.alwaysTrackState;
    }

    /** Subclasses can override this to force the state manager to keep track of this object, even if refs aren't created for it */
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    protected get alwaysTrackState() {
        return false;
    }

    /** ID given by the game engine. */
    public get uuid() {
        return this.state.uuid;
    }

    public set uuid(value) {
        Contract.assertIsNullLike(this.state.uuid, `Tried to set the engine ID of a object that already contains an ID: ${this.state.uuid}`);
        this.state.uuid = value;
    }

    public constructor(game: Game) {
        this.game = game;
        // @ts-expect-error state is a generic object that is defined by the deriving classes, it's essentially w/e the children want it to be.
        this.state = {};
        // All state defaults *must* happen before registration, so we can't rely on the derived constructor to set the defaults as register will already be called.
        this.setupDefaultState();
        this.game.gameObjectManager.register(this);
    }

    /** A overridable method so a child can set defaults for it's state. Always ensure to call super.setupDefaultState() as the first line if you do override this.  */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupDefaultState() { }

    /** Sets the state.  */
    public setState(state: T) {
        const oldState = this.state;
        this.state = structuredClone(state);
        copyState(this, state);
        this.afterSetState(oldState);
    }

    public getState() {
        // This *must* return a copy, without any references, hence the use of structuredClone.
        return structuredClone(this.state);
    }

    /** A function for game to call on all objects after all state has been rolled back. Intended to be used when a class has state changes that have external changes, for example, updating OngoingEffectEngine. */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public afterSetAllState(oldState: T) { }

    /** A function for game to call after the state for this object has been rolled back. Intended to be used when a class has state changes that have internal changes, such as caching state. */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected afterSetState(oldState: T) { }

    /**
     * A function for game to call on all objects if they are being removed from the GameObject list (typically after a rollback to before the object was created).
     * This is intended to be used for cleanup of any state that the object has that is not part of the state object.
     *
     * The most common example is removing event handlers that have been registered on Game.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public cleanupOnRemove(oldState: T) { }

    /** Creates a Ref to this GO that can be used to do a lookup to the object. This should be the *only* way a Ref is ever created. */
    public getRef<T extends GameObjectBase = this>(): GameObjectRef<T> {
        this._hasRef = true;

        const ref = { isRef: true, uuid: this.state.uuid };

        if (Helpers.isDevelopment()) {
            // This property is for debugging purposes only and should never be referenced within the code. It will be wiped in a rollback, but for non-Undo debugging this works.
            Object.defineProperty(ref, 'gameObject', {
                value: this,
                writable: false,
                enumerable: false,
                configurable: false,
            });
        }

        return ref as GameObjectRef<T>;
    }

    /** Shortcut to get the Game Object from a Ref. This is intentionally an arrow function to cause structured clone to break if called on this class. */
    public getObject = <T extends GameObjectBase>(ref: GameObjectRef<T>): T => {
        return this.game.gameObjectManager.get(ref);
    };

    public getGameObjectName(): string {
        return 'GameObject';
    }
}