import { IStateListenerProperties } from '../../Interfaces';
import Game from '../Game';
import Player from '../Player';
import Contract from '../utils/Contract';

export class StateWatcherRegistrar {
    private watchedState = new Map<string, any>();

    public constructor(public readonly game: Game) {
    }

    public isRegistered(watcherKey: string) {
        return this.watchedState.has(watcherKey);
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

        return this.watchedState.get(watcherKey);
    }

    public setStateValue(watcherKey: string, newValue: any, initializing: boolean = false) {
        if (!initializing && !this.assertRegistered(watcherKey)) {
            return;
        }

        this.watchedState.set(watcherKey, newValue);
    }

    private assertRegistered(watcherKey: string) {
        if (
            !Contract.assertTrue(this.isRegistered(watcherKey),
                `Watcher '${watcherKey}' not found in registered watcher list: ${Array.from(this.watchedState.keys()).join(', ')}`)
        ) {
            return false;
        }

        return true;
    }
}
