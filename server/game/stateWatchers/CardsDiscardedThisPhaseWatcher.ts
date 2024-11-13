import { InPlayCard } from '../core/card/baseClasses/InPlayCard';
import Player from '../core/Player';
import { Card } from '../core/card/Card';
import type { Location } from '../core/Constants';
import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';

export interface CardDiscardedEntry {
    card: Card;
    controlledBy: Player;
    discardedFromLocation: Location;
}

export type ICardsDiscardedThisPhase = CardDiscardedEntry[];

export class CardsDiscardsThisPhaseWatcher extends StateWatcher<ICardsDiscardedThisPhase> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.CardsDiscardedThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link CardDiscardEntry} objects representing every card discard this
     * phase so far. Lists the card, controller and discarded location from which the card was discarded
     */
    public override getCurrentValue(): ICardsDiscardedThisPhase {
        return super.getCurrentValue();
    }

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onCardsDiscarded: () => true,
            },
            update: (currentState: ICardsDiscardedThisPhase, event: any) =>
                currentState.concat({
                    card: event.card,
                    controlledBy: event.card.controller,
                    discardedFromLocation: event.discardedFromLocation,
                })
        });
    }

    protected override getResetValue(): ICardsDiscardedThisPhase {
        return [];
    }
}
