import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import Player from '../core/Player';
import { Card } from '../core/card/Card';
import { InPlayCard } from '../core/card/baseClasses/InPlayCard';

export interface EnteredCardEntry {
    card: InPlayCard;
    playedBy: Player;
}

export type ICardsEnteredPlayThisPhase = EnteredCardEntry[];

// there is a known issue where CardsEnteredPlayThisPhaseWatcher currently doesn't work with leaders
export class CardsEnteredPlayThisPhaseWatcher extends StateWatcher<EnteredCardEntry[]> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.CardsEnteredPlayThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link EnteredCardEntry} objects representing every card entering play
     * in this phase so far and the player who played that card
     */
    public override getCurrentValue(): ICardsEnteredPlayThisPhase {
        return super.getCurrentValue();
    }

    /** Filters the list of entered play cards in the state and returns the cards that match */
    public getCardsPlayed(filter: (entry: EnteredCardEntry) => boolean): Card[] {
        return this.getCurrentValue()
            .filter(filter)
            .map((entry) => entry.card);
    }

    protected override setupWatcher() {
        // on card entered play, add the card to the player's list of cards entered play this phase
        this.addUpdater({
            when: {
                onUnitEntersPlay: () => true,
            },
            update: (currentState: ICardsEnteredPlayThisPhase, event: any) =>
                currentState.concat({ card: event.card, playedBy: event.card.controller })
        });
    }

    protected override getResetValue(): ICardsEnteredPlayThisPhase {
        return [];
    }
}
