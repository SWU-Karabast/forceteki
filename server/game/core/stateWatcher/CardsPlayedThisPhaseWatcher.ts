import { StateWatcher } from './StateWatcher';
import { StateWatcherName } from '../Constants';
import { StateWatcherRegistrar } from './StateWatcherRegistrar';
import Player from '../Player';
import { PlayableCard } from '../card/CardTypes';
import Game from '../Game';
import { Card } from '../card/Card';

export interface PlayedCardEntry {
    card: PlayableCard,
    playedBy: Player
}

export type ICardsPlayedThisPhase = PlayedCardEntry[];

export class CardsPlayedThisPhaseWatcher extends StateWatcher<ICardsPlayedThisPhase> {
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

    protected override setupWatcher() {
        // on card played, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardPlayed: () => true,
            },
            update: (currentState: ICardsPlayedThisPhase, event: any) =>
                currentState.concat({ card: event.card, playedBy: event.card.controller })
        });
    }

    protected override getResetValue(): ICardsPlayedThisPhase {
        return [];
    }
}
