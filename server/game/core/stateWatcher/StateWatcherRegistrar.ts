import type { StateWatcherName } from '../Constants';
import type Game from '../Game';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import { GameObjectBase } from '../GameObjectBase';
import type { StateWatcher } from './StateWatcher';

export interface IStateWatcherRegistrarState extends IGameObjectBaseState {
    watchers: Map<string, GameObjectRef<StateWatcher>>;
}
// TODO: This piece's job is now to simply register the names of the state watchers. If a name exists, return that instance.
/**
 * Helper for managing the operation of {@link StateWatcher} implementations.
 * Holds the state objects that the watchers interact with, registers the
 * triggers for updating them, and tracks which watcher types are registered.
 */
export class StateWatcherRegistrar extends GameObjectBase<IStateWatcherRegistrarState> {
    private get watchers() {
        return this.state.watchers;
    }

    public constructor(game: Game) {
        super(game);
    }

    protected override setupDefaultState() {
        this.state.watchers = new Map();
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public override get alwaysTrackState(): boolean {
        return true;
    }

    public isRegistered(name: StateWatcherName) {
        return this.state.watchers.has(name);
    }

    public registerWatcher(name: StateWatcherName, watcherFactory: () => StateWatcher) {
        const watcherRef = this.state.watchers.get(name);
        if (!this.isRegistered(name)) {
            const watcher = watcherFactory();
            this.state.watchers.set(name, watcher.getRef());
            return watcher;
        }
        return this.game.getFromRef(watcherRef);
    }

    // public register(watcherKey: string, initialValue: unknown) {
    //     if (this.isRegistered(watcherKey)) {
    //         return;
    //     }

    //     // set the initial state value
    //     this.setStateValue(watcherKey, initialValue, true);
    // }

    // public getStateValue<T = unknown>(watcherKey: string): T {
    //     if (!this.assertRegistered(watcherKey)) {
    //         return null;
    //     }

    //     return this.watchedState.get(watcherKey);
    // }

    // public setStateValue(watcherKey: string, newValue: unknown, initializing: boolean = false) {
    //     if (!initializing && !this.assertRegistered(watcherKey)) {
    //         return;
    //     }

    //     this.state.watchedState.set(watcherKey, newValue);
    // }

    // private assertRegistered(watcherKey: string) {
    //     Contract.assertTrue(this.isRegistered(watcherKey),
    //         () => `Watcher '${watcherKey}' not found in registered watcher list: ${Array.from(this.watchedState.keys()).join(', ')}`);

    //     return true;
    // }

    // protected override afterSetState(oldState: IStateWatcherRegistrarState): void {

    // }

    public override getGameObjectName(): string {
        return 'StateWatcherRegistrar';
    }
}
