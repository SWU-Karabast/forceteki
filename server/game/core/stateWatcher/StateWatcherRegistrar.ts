import { IStateListenerProperties } from '../../Interfaces';
import Game from '../Game';
import Player from '../Player';
import Contract from '../utils/Contract';

export class StateWatcherRegistrar {
    private watchedState = new Map<Player, Map<string, any>>();

    public constructor(public readonly game: Game) {
    }

    public isRegistered(owner: Player, watcherKey: string) {
        return this.watchedState.has(owner) && this.watchedState.get(owner).has(watcherKey);
    }

    public register(owner: Player, watcherKey: string, initialValue: any, listeners: IStateListenerProperties<any>[]) {
        if (this.isRegistered(owner, watcherKey)) {
            return;
        }

        // set the initial state value
        this.setStateValue(owner, watcherKey, initialValue);

        for (const listener of listeners) {
            const eventNames = Object.keys(listener.when);

            // build a handler that will use the listener's update handler to generate a new state value and then store it
            const stateUpdateHandler = (event) => {
                const currentStateValue = this.getStateValue(owner, watcherKey);
                const updatedStateValue = listener.update(currentStateValue, event);
                this.setStateValue(owner, watcherKey, updatedStateValue);
            };

            eventNames.forEach((eventName) => this.game.on(eventName, stateUpdateHandler));
        }
    }

    public getStateValue(owner: Player, watcherKey: string): any {
        const ownerStates = this.safeGetStates(owner);
        this.assertStateExists(watcherKey, ownerStates, owner);

        return ownerStates[watcherKey];
    }

    public setStateValue(owner: Player, watcherKey: string, newValue: any) {
        const ownerStates = this.safeGetStates(owner);
        this.assertStateExists(watcherKey, ownerStates, owner);

        ownerStates.set(watcherKey, newValue);
    }

    private safeGetStates(owner: Player): Map<string, any> {
        if (!Contract.assertTrue(this.watchedState.has(owner), `Player '${owner.name}' not in '${Array.from(this.watchedState.keys()).join(', ')}'`)) {
            return new Map();
        }

        return this.watchedState.get(owner);
    }

    private assertStateExists(watcherKey: string, states: Map<string, any>, owner: Player) {
        if (!Contract.assertTrue(states.has(watcherKey), `Watcher '${watcherKey}' not found in watcher list for '${owner.name}': ${Array.from(states.keys()).join(', ')}`)) {
            return false;
        }

        return true;
    }
}
