import type Game from './Game';
import * as Contract from './utils/Contract';

export interface IGameObjectBaseState {
    uuid: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
export interface GameObjectRef<T extends GameObjectBase = GameObjectBase> {
    __isRef: true;
    uuid: string;
}

/** GameObjectBase simply defines this as an object with state, and with a unique identifier. */
export abstract class GameObjectBase<T extends IGameObjectBaseState = IGameObjectBaseState> {
    protected state: T;

    /** ID given by the game engine. */
    public get uuid() {
        return this.state.uuid;
    }

    public set uuid(value) {
        Contract.assertIsNullLike(this.state.uuid, `Tried to set the engine ID of a object that already contains an ID: ${this.state.uuid}`);
        this.state.uuid = value;
    }

    public constructor(
        public game: Game
    ) {
        // @ts-expect-error state is a generic object that is defined by the deriving classes, it's essentially w/e the children want it to be.
        this.state = {};
        // All state defaults *must* happen before registration, so we can't rely on the derived constructor to set the defaults as register will already be called.
        this.onSetupDefaultState();
        this.game.gameObjectManager.register(this);
    }

    /** A overridable method so a child can set defaults for it's state. Always ensure to call super.onSetupGameState() as the first line if you do override this.  */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected onSetupDefaultState() { }

    /** Sets the state.  */
    public setState(state: T) {
        this.state = state;
    }

    /** A function for game to call on all objects after all state has been set. for example, to cache calculated values. */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public onAfterSetState() { }

    public getRef<T extends GameObjectBase = this>(): GameObjectRef<T> {
        return { __isRef: true, uuid: this.state.uuid };
    }
}