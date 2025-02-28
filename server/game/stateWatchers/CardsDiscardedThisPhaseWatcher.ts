import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { ZoneName } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type Player from '../core/Player';
import type { Card } from '../core/card/Card';
import * as Contract from '../core/utils/Contract';

export interface DiscardedCardEntry {
    card: Card;
    discardedFromPlayer: Player;
    discardedFromZone: ZoneName;
    discardedPlayId: number;
}

export class CardsDiscardedThisPhaseWatcher extends StateWatcher<DiscardedCardEntry[]> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.CardsDiscardedThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link DiscardedCardEntry} objects representing every card discarded in this phase so far and the player who drew that card
     */
    public override getCurrentValue(): DiscardedCardEntry[] {
        return super.getCurrentValue();
    }

    protected override setupWatcher() {
        // on cards discarded, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardDiscarded: () => true,
            },
            update: (currentState: DiscardedCardEntry[], event: any) => {
                Contract.assertTrue(event.card != null);
                Contract.assertTrue(event.discardedFromZone != null);
                return currentState.concat({
                    card: event.card,
                    discardedFromPlayer: event.card.controller,
                    discardedFromZone: event.discardedFromZone,
                    discardedPlayId: event.card.mostRecentInPlayId,
                });
            }
        });
    }

    protected override getResetValue(): DiscardedCardEntry[] {
        return [];
    }
}
