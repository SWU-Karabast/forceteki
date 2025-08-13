import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Card } from '../core/card/Card';
import type { IPlayableCard } from '../core/card/baseClasses/PlayableOrDeployableCard';
import type Game from '../core/Game';
import type { GameObjectRef, UnwrapRef } from '../core/GameObjectBase';

export interface DeployedLeaderEntry {
    card: GameObjectRef<IPlayableCard>;
}

export class LeadersDeployedThisPhaseWatcher extends StateWatcher<DeployedLeaderEntry[]> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(game, StateWatcherName.LeadersDeployedThisPhase, registrar, card);
    }

    protected override mapCurrentValue(stateValue: DeployedLeaderEntry[]) {
        return stateValue.map((x) => ({ card: this.game.getFromRef(x.card) }));
    }

    /**
     * Returns an array of {@link DeployedLeaderEntry} objects representing every leader deployed
     * in this phase so far
     */
    public override getCurrentValue() {
        return super.getCurrentValue();
    }

    /** Check the list of deployed leaders in the state if we found leaders that match filters */
    public someLeaderDeployed(filter: (entry: UnwrapRef<DeployedLeaderEntry>) => boolean): boolean {
        return this.getCurrentValue().some(filter);
    }

    protected override setupWatcher() {
        // on card played, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onLeaderDeployed: () => true,
            },
            update: (currentState: DeployedLeaderEntry[], event: any) =>
                currentState.concat({
                    card: event.card.getRef(),
                })
        });
    }

    protected override getResetValue(): DeployedLeaderEntry[] {
        return [];
    }
}
