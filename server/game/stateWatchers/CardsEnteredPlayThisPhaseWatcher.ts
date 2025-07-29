import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import type { IInPlayCard } from '../core/card/baseClasses/InPlayCard';
import type Game from '../core/Game';

export interface EnteredCardEntry {
    card: IInPlayCard;
    playedBy: Player;
}

export type ICardsEnteredPlayThisPhase = EnteredCardEntry[];

// there is a known issue where CardsEnteredPlayThisPhaseWatcher currently doesn't work with leaders
export class CardsEnteredPlayThisPhaseWatcher extends StateWatcher<EnteredCardEntry[]> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(game, StateWatcherName.CardsEnteredPlayThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link EnteredCardEntry} objects representing every card entering play
     * in this phase so far and the player who played that card
     */
    public override getCurrentValue(): ICardsEnteredPlayThisPhase {
        return super.getCurrentValue();
    }

    /** Filters the list of entered play cards in the state and returns the cards that match */
    public getCardsEnteredPlay(filter: (entry: EnteredCardEntry) => boolean): Card[] {
        return this.getCurrentValue()
            .filter(filter)
            .map((entry) => entry.card);
    }

    /** Checks the state for cards that entered play and match the provided filter */
    public someCardEnteredPlay(filter: (entry: EnteredCardEntry) => boolean): boolean {
        return this.getCardsEnteredPlay(filter).length > 0;
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
