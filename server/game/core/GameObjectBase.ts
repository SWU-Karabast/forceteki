import type Game from './Game';
import * as Contract from './utils/Contract';

export interface IGameObjectBaseState {
    uuid: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
export interface GameObjectRef<T extends GameObjectBase = GameObjectBase> {
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
        this.onSetupDefaultState();
        this.game.registerGameObject(this);
    }

    /** A overridable method so a child can set defaults for it's state. Always ensure to call super.onSetupGameState() as the first line if you do override this.  */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected onSetupDefaultState() { }

    public setState(state: T) {
        this.state = state;
    }

    public getRef<T extends GameObjectBase = this>(): GameObjectRef<T> {
        return { uuid: this.state.uuid };
    }
}