import type { IStateListenerResetProperties, IStateListenerProperties } from '../../Interfaces';
import type { Card } from '../card/Card';
import type { StateWatcherName } from '../Constants';
import type Player from '../Player';
import * as Contract from '../utils/Contract';
import type { StateWatcherRegistrar } from './StateWatcherRegistrar';

/**
 * State watchers are used for cards that need to refer to events that happened in the past.
 * They work by interacting with a {@link StateWatcherRegistrar} which holds all watcher state
 * for the game. Each state watcher owns a specific entry in the registrar which it modifies
 * based on game events.
 *
 * All watchers reset at the end of the phase to an established "reset" state value. Each watcher
 * type will be registered at most once and then all instances of that watcher will access the same
 * state object, which reduces redundant operations.
 *
 * Each state watcher type will declare:
 * - a state type that it uses (the TState)
 * - a state reset method that provides an initial state to reset to
 * - a set of event triggers which will update the stored state to keep the history
 */
export abstract class StateWatcher<TState> {
    private readonly owner: Player;
    private readonly registrationKey: string;
    private stateUpdaters: IStateListenerProperties<TState>[] = [];

    // the state reset trigger is the end of the phase
    private stateResetTrigger: IStateListenerResetProperties = {
        when: {
            onPhaseEnded: () => true,
        }
    };

    public constructor(
        public readonly name: StateWatcherName,
        private readonly registrar: StateWatcherRegistrar,
        card: Card
    ) {
        this.owner = card.owner;
        this.registrationKey = card.internalName + '.' + name;

        if (registrar.isRegistered(this.registrationKey)) {
            return;
        }

        this.registrar.register(this.registrationKey, this.getResetValue(), this.generateListenerRegistrations());
    }

    // Child classes override this method to perform their addUpdater() calls
    protected abstract setupWatcher(): void;

    // Returns the value that the state will be initialized to at the beginning of the phase
    protected abstract getResetValue(): TState;

    public getCurrentValue(): TState {
        return this.registrar.getStateValue(this.registrationKey) as TState;
    }

    protected addUpdater(properties: IStateListenerProperties<TState>) {
        this.stateUpdaters.push(properties);
    }

    /** Generates a set of properties for registering the triggers of this watcher */
    private generateListenerRegistrations(): IStateListenerProperties<TState>[] {
        this.setupWatcher();

        Contract.assertTrue(this.stateUpdaters.length > 0, 'No state updaters registered');

        const stateResetUpdater: IStateListenerProperties<TState> =
            Object.assign(this.stateResetTrigger, { update: () => this.getResetValue() });

        return this.stateUpdaters.concat(stateResetUpdater);
    }
}
