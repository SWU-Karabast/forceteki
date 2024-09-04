import { StateWatcher } from './StateWatcher';
import { StateWatcherName } from '../Constants';
import { StateWatcherRegistrar } from './StateWatcherRegistrar';
import Player from '../Player';
import { PlayableCard } from '../card/CardTypes';
import Game from '../Game';
import { Card } from '../card/Card';

export type ICardsPlayedThisPhase = PlayableCard[];

export class CardsPlayedThisPhaseWatcher extends StateWatcher<ICardsPlayedThisPhase> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card,
        private readonly filter: (card: PlayableCard) => boolean = () => true
    ) {
        super(StateWatcherName.CardsPlayedThisPhase, registrar, card);
    }

    protected override setupWatcher() {
        // on card played, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardPlayed: () => true,
            },
            update: (currentState: ICardsPlayedThisPhase, event: any) => {
                return this.filter(event.card) ? currentState.concat(event.card) : currentState;
            }
        });
    }

    protected override getResetValue(): ICardsPlayedThisPhase {
        return [];
    }
}