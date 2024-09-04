import { IStateListenerResetProperties, IStateListenerProperties } from '../../Interfaces';
import { StateWatcherName } from '../Constants';
import Player from '../Player';
import Contract from '../utils/Contract';
import { StateWatcherRegistrar } from './StateWatcherRegistrar';

export abstract class StateWatcher<TState> {
    public readonly abstract resetValue: TState;

    private readonly ownerKey: string;
    private stateUpdaters: IStateListenerProperties<TState>[] = [];
    private stateResetTrigger?: IStateListenerResetProperties = null;

    public constructor(
        public readonly name: StateWatcherName,
        private readonly registrar: StateWatcherRegistrar,
        isGlobalWatcher: boolean,
        owner?: Player
    ) {
        this.ownerKey = registrar.generateOwnerKey(isGlobalWatcher, owner);
        if (registrar.isRegistered(this.ownerKey, this.name)) {
            return;
        }

        this.registrar.register(this.ownerKey, this.name, this.generateListenerRegistrations());
    }

    protected abstract setupWatcher(): void;

    public getCurrentValue(): TState {
        return this.registrar.getStateValue(this.ownerKey, this.name) as TState;
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
            !Contract.assertTrue(this.stateUpdaters.length > 0, 'No state updaters registered') ||
            !Contract.assertNotNullLike(this.stateResetTrigger, 'State reset trigger not set')
        ) {
            return [];
        }

        const stateResetUpdater: IStateListenerProperties<TState> =
            Object.assign(this.stateResetTrigger, { update: () => this.resetValue });

        return this.stateUpdaters.concat(stateResetUpdater);
    }
}
