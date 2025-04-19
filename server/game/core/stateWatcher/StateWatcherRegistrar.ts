import type { IStateListenerProperties } from '../../Interfaces';
import { GameObjectBase, type IGameObjectBaseState } from '../GameObjectBase';
import * as Contract from '../utils/Contract';

export interface IStateWatcherRegistrarState extends IGameObjectBaseState {
    watchedState: Map<string, any>;
}

/**
 * Helper for managing the operation of {@link StateWatcher} implementations.
 * Holds the state objects that the watchers interact with, registers the
 * triggers for updating them, and tracks which watcher types are registered.
 */
export class StateWatcherRegistrar extends GameObjectBase<IStateWatcherRegistrarState> {
    public isRegistered(watcherKey: string) {
        return this.state.watchedState.has(watcherKey);
    }

    public register(watcherKey: string, initialValue: any, listeners: IStateListenerProperties<any>[]) {
        if (this.isRegistered(watcherKey)) {
            return;
        }

        // set the initial state value
        this.setStateValue(watcherKey, initialValue, true);

        for (const listener of listeners) {
            const eventNames = Object.keys(listener.when);

            // build a handler that will use the listener's update handler to generate a new state value and then store it
            const stateUpdateHandler = (event) => {
                if (!listener.when[event.name](event)) {
                    return;
                }

                const currentStateValue = this.getStateValue(watcherKey);
                const updatedStateValue = listener.update(currentStateValue, event);
                this.setStateValue(watcherKey, updatedStateValue);
            };

            eventNames.forEach((eventName) => this.game.on(eventName, stateUpdateHandler));
        }
    }

    public getStateValue(watcherKey: string): any {
        if (!this.assertRegistered(watcherKey)) {
            return null;
        }

        return this.state.watchedState.get(watcherKey);
    }

    public setStateValue(watcherKey: string, newValue: any, initializing: boolean = false) {
        if (!initializing && !this.assertRegistered(watcherKey)) {
            return;
        }

        this.state.watchedState.set(watcherKey, newValue);
    }

    protected override setupDefaultState() {
        super.setupDefaultState();
        this.state.watchedState = new Map<string, any>();
    }

    private assertRegistered(watcherKey: string) {
        Contract.assertTrue(this.isRegistered(watcherKey),
            `Watcher '${watcherKey}' not found in registered watcher list: ${Array.from(this.state.watchedState.keys()).join(', ')}`);

        return true;
    }
}
