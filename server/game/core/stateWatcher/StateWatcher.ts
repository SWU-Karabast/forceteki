import type { IStateListenerResetProperties, IStateListenerProperties } from '../../Interfaces';
import type { StateWatcherName } from '../Constants';
import { GameEvent } from '../event/GameEvent';
import type Game from '../Game';
import { GameObjectBase, type UnwrapRef } from '../GameObjectBase';
import * as Contract from '../utils/Contract';
import { isDevelopment } from '../utils/Helpers';
import { is } from '../utils/TypeHelpers';
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
export abstract class StateWatcher<TState = any> extends GameObjectBase {
    private stateUpdaters: IStateListenerProperties<TState>[] = [];
    private readonly allUpdaters;
    public readonly name: StateWatcherName;
    private readonly registrar: StateWatcherRegistrar;
    private eventNameMapping = new Map<string, (...args: any[]) => void>();

    // the state reset trigger is the end of the phase
    private stateResetTrigger: IStateListenerResetProperties = {
        when: {
            onPhaseEnded: () => true,
        }
    };

    public constructor(
        game: Game,
        name: StateWatcherName,
        registrar: StateWatcherRegistrar
    ) {
        super(game);
        this.name = name;
        this.registrar = registrar;

        this.setupWatcher();
        Contract.assertTrue(this.stateUpdaters.length > 0, 'No state updaters registered');

        const stateResetUpdater: IStateListenerProperties<TState> = Object.assign(this.stateResetTrigger, { update: () => this.getResetValue() });
        this.allUpdaters = this.stateUpdaters.concat(stateResetUpdater);
    }

    // This will remain for the life of the game, and will only be remove on rollback in the case of a token. At that point the associated card will also be removed, and it should be GC'd normally.
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    protected override get alwaysTrackState(): boolean {
        return true;
    }

    // Child classes override this method to perform their addUpdater() calls
    protected abstract setupWatcher(): void;

    // Returns the value that the state will be initialized to at the beginning of the phase
    protected abstract getResetValue(): TState;

    /** A function to map any GameObjectRefs in the stateValue to their game objects. If no GameObjectRefs are used, you can simply return the stateValue as-is. */
    protected abstract mapCurrentValue(stateValue: TState): UnwrapRef<TState>;

    public getCurrentValue(): UnwrapRef<TState> {
        return this.mapCurrentValue(this.state as TState);
    }

    protected addUpdater(properties: IStateListenerProperties<TState>) {
        if (isDevelopment()) {
            Object.keys(properties).forEach((prop) => {
                let value = properties[prop];
                if (!value) {
                    return;
                }
                if (is.array(value)) {
                    // No elements to check
                    if (value.length === 0) {
                        return;
                    }

                    value = value[0];
                }
                if (value instanceof GameObjectBase) {
                    throw new Error(`State Watcher contains invalid state. Property "${prop}" is GameObject which is not allowed. Use GameObjectRef instead and call go.getRef() to capture the reference in state.`);
                }
                if (value instanceof GameEvent) {
                    throw new Error(`State Watcher contains invalid state. Property "${prop}" is a GameEvent which is not allowed.Capture the relevant properties off the GameEvent instead and store them in the watcher state. See DamageDealtThisPhaseWatcher for an example.`);
                }
            });
        }
        this.stateUpdaters.push(properties);
    }

    private registerListeners() {
        Contract.assertTrue(this.eventNameMapping.size === 0, 'State Watacher listeners already registered.');
        const listeners = this.allUpdaters;

        for (const listener of listeners) {
            const eventNames = Object.keys(listener.when);

            // build a handler that will use the listener's update handler to generate a new state value and then store it
            const stateUpdateHandler = (event) => {
                if (!listener.when[event.name](event)) {
                    return;
                }

                const currentStateValue = this.registrar.getStateValue<TState>(this.registrationKey);
                const updatedStateValue = listener.update(currentStateValue, event);
                this.registrar.setStateValue(this.registrationKey, updatedStateValue);
            };

            eventNames.forEach((eventName) => {
                this.game.on(eventName, stateUpdateHandler);
                this.eventNameMapping.set(eventName, stateUpdateHandler);
            });
        }
    }

    private unregisterListeners() {
        this.eventNameMapping.forEach((stateUpdateHandler, eventName) => {
            this.game.off(eventName, stateUpdateHandler);
        });
        this.eventNameMapping.clear();
    }
}
