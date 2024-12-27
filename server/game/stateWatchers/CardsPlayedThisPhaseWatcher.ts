import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import Player from '../core/Player';
import { TokenOrPlayableCard } from '../core/card/CardTypes';
import { Card } from '../core/card/Card';
import { InPlayCard } from '../core/card/baseClasses/InPlayCard';

export interface PlayedCardEntry {
    card: TokenOrPlayableCard;
    inPlayId?: number;
    playedBy: Player;
    parentCard: InPlayCard;
    parentCardInPlayId: number;
}

export type ICardsPlayedThisPhase = PlayedCardEntry[];

export class CardsPlayedThisPhaseWatcher extends StateWatcher<PlayedCardEntry[]> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.CardsPlayedThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link PlayedCardEntry} objects representing every card played
     * in this phase so far and the player who played that card
     */
    public override getCurrentValue(): ICardsPlayedThisPhase {
        return super.getCurrentValue();
    }

    /** Filters the list of played cards in the state and returns the cards that match */
    public getCardsPlayed(filter: (entry: PlayedCardEntry) => boolean): Card[] {
        return this.getCurrentValue()
            .filter(filter)
            .map((entry) => entry.card);
    }

    /** Check the list of played cards in the state if we found cards that match filters */
    public someCardPlayed(filter: (entry: PlayedCardEntry) => boolean): boolean {
        return this.getCardsPlayed(filter).length > 0;
    }

    protected override setupWatcher() {
        // on card played, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardPlayed: () => true,
            },
            update: (currentState: ICardsPlayedThisPhase, event: any) =>
                currentState.concat({
                    card: event.card,
                    parentCard: event.card.parentCard,
                    parentCardInPlayId: event.card.parentCard?.canBeInPlay() ? event.card.parentCard.inPlayId : null,
                    inPlayId: event.card.canBeInPlay() ? event.card.inPlayId : null,
                    playedBy: event.card.controller
                })
        });
    }

    protected override getResetValue(): ICardsPlayedThisPhase {
        return [];
    }
}
