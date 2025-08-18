import type { StateWatcherName } from '../Constants';
import type Game from '../Game';
import { GameObjectBase } from '../GameObjectBase';
import { registerState, undoMap } from '../GameObjectUtils';
import type { StateWatcher } from './StateWatcher';

// TODO: This piece's job is now to simply register the names of the state watchers. If a name exists, return that instance.
/**
 * Helper for managing the operation of {@link StateWatcher} implementations.
 * Holds the state objects that the watchers interact with, registers the
 * triggers for updating them, and tracks which watcher types are registered.
 */
@registerState()
export class StateWatcherRegistrar extends GameObjectBase {
    @undoMap()
    private accessor watchers: ReadonlyMap<string, StateWatcher> = new Map();

    public constructor(game: Game) {
        super(game);
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public override get alwaysTrackState(): boolean {
        return true;
    }

    public isRegistered(watcherName: StateWatcherName) {
        return this.watchers.has(watcherName);
    }

    public registerWatcher<TWatcher extends StateWatcher>(name: StateWatcherName, watcherFactory: () => TWatcher): TWatcher {
        let watcher = this.watchers.get(name) as TWatcher;
        if (!watcher) {
            watcher = watcherFactory();
            const watchers = new Map(this.watchers).set(name, watcher);
            this.watchers = watchers;
        }
        return watcher;
    }

    public override getGameObjectName(): string {
        return 'StateWatcherRegistrar';
    }
}
