import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Card } from '../core/card/Card';
import type { IPlayableCard } from '../core/card/baseClasses/PlayableOrDeployableCard';

export interface DeployedLeaderEntry {
    card: IPlayableCard;
}

export type ILeadersDeployedThisPhase = DeployedLeaderEntry[];

export class LeadersDeployedThisPhaseWatcher extends StateWatcher<ILeadersDeployedThisPhase> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.LeadersDeployedThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link DeployedLeaderEntry} objects representing every leader deployed
     * in this phase so far
     */
    public override getCurrentValue(): ILeadersDeployedThisPhase {
        return super.getCurrentValue();
    }

    /** Check the list of deployed leaders in the state if we found leaders that match filters */
    public someLeaderDeployed(filter: (entry: DeployedLeaderEntry) => boolean): boolean {
        return this.getCurrentValue().some(filter);
    }

    protected override setupWatcher() {
        // on card played, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onLeaderDeployed: () => true,
            },
            update: (currentState: ILeadersDeployedThisPhase, event: any) =>
                currentState.concat({
                    card: event.card,
                })
        });
    }

    protected override getResetValue(): ILeadersDeployedThisPhase {
        return [];
    }
}
