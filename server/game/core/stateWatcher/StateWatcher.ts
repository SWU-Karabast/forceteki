import { IStateListenerResetProperties, IStateListenerProperties } from '../../Interfaces';
import { Card } from '../card/Card';
import { PhaseName, StateWatcherName } from '../Constants';
import Game from '../Game';
import Player from '../Player';
import Contract from '../utils/Contract';
import { StateWatcherRegistrar } from './StateWatcherRegistrar';

export abstract class StateWatcher<TState> {
    public readonly abstract resetValue: (game: Game) => TState;

    private readonly owner: Player;
    private readonly registrationKey: string;
    private stateUpdaters: IStateListenerProperties<TState>[] = [];

    // the default state reset trigger is the end of the phase
    private stateResetTrigger?: IStateListenerResetProperties = {
        when: {
            onPhaseEnded: (event) => event.phase === PhaseName.Action
        }
    };

    public constructor(
        public readonly name: StateWatcherName,
        private readonly registrar: StateWatcherRegistrar,
        card: Card
    ) {
        this.owner = card.owner;
        this.registrationKey = card.internalName + '.' + name;

        if (registrar.isRegistered(this.owner, this.registrationKey)) {
            return;
        }

        this.registrar.register(this.owner, this.registrationKey, this.generateListenerRegistrations());
    }

    protected abstract setupWatcher(): void;

    public getCurrentValue(): TState {
        return this.registrar.getStateValue(this.owner, this.registrationKey) as TState;
    }

    protected addUpdater(properties: IStateListenerProperties<TState>) {
        this.stateUpdaters.push(properties);
    }

    protected setResetTrigger(properties: IStateListenerResetProperties) {
        if (!Contract.assertTrue(this.stateResetTrigger === null, 'Reset trigger is already set')) {
            return;
        }

        this.stateResetTrigger = properties;
    }

    private generateListenerRegistrations(): IStateListenerProperties<TState>[] {
        this.setupWatcher();

        if (
            !Contract.assertTrue(this.stateUpdaters.length > 0, 'No state updaters registered')
        ) {
            return [];
        }

        const stateResetUpdater: IStateListenerProperties<TState> =
            Object.assign(this.stateResetTrigger, { update: () => this.resetValue(this.registrar.game) });

        return this.stateUpdaters.concat(stateResetUpdater);
    }
}
