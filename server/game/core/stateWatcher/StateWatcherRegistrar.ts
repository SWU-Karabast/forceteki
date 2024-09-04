import { IStateListenerProperties } from '../../Interfaces';
import { StateWatcherName } from '../Constants';
import Game from '../Game';
import Player from '../Player';
import Contract from '../utils/Contract';

export class StateWatcherRegistrar {
    private watchedState = new Map<string, Map<StateWatcherName, any>>();

    public constructor(private game: Game) {
    }

    public generateOwnerKey(isGlobalWatcher: boolean, owner?: Player) {
        return isGlobalWatcher ? 'global' : 'p_' + owner.name;
    }

    public isRegistered(ownerKey: string, stateName: StateWatcherName) {
        return this.watchedState.has(ownerKey) && this.watchedState[ownerKey].has(stateName);
    }

    public register(ownerKey: string, stateName: StateWatcherName, listeners: IStateListenerProperties<any>[]) {
        if (this.isRegistered(ownerKey, stateName)) {
            return;
        }

        for (const listener of listeners) {
            const eventNames = Object.keys(listener.when);

            // build a handler that will use the listener's update handler to generate a new state value and then store it
            const stateUpdateHandler = (event) => {
                const currentStateValue = this.getStateValue(ownerKey, stateName);
                const updatedStateValue = listener.update(currentStateValue, event);
                this.setStateValue(ownerKey, stateName, updatedStateValue);
            };

            eventNames.forEach((eventName) => this.game.on(eventName, stateUpdateHandler));
        }
    }

    public getStateValue(ownerKey: string, stateName: StateWatcherName): any {
        const ownerStates = this.safeGetStates(ownerKey);
        this.assertStateExists(stateName, ownerStates, ownerKey);

        return ownerStates[stateName];
    }

    public setStateValue(ownerKey: string, stateName: StateWatcherName, newValue: any) {
        const ownerStates = this.safeGetStates(ownerKey);
        this.assertStateExists(stateName, ownerStates, ownerKey);

        ownerStates[stateName] = newValue;
    }

    private safeGetStates(ownerKey: string): Map<StateWatcherName, any> {
        if (!Contract.assertTrue(this.watchedState.has(ownerKey), `State owner '${ownerKey}' not in '${Array.from(this.watchedState.keys()).join(', ')}'`)) {
            return new Map();
        }

        return this.watchedState[ownerKey];
    }

    private assertStateExists(stateName: StateWatcherName, states: Map<StateWatcherName, any>, ownerKey: string) {
        if (!Contract.assertTrue(states.has(stateName), `State name ${stateName} not found in state list for state owner '${ownerKey}': ${Array.from(states.keys()).join(', ')}`)) {
            return false;
        }

        return true;
    }
}
