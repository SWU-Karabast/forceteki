import { StateWatcher } from './StateWatcher';
import { StateWatcherName } from '../Constants';
import { StateWatcherRegistrar } from './StateWatcherRegistrar';
import Player from '../Player';
import { PlayableCard } from '../card/CardTypes';
import Game from '../Game';
import { Card } from '../card/Card';

export type ICardsPlayedThisPhase = Map<Player, PlayableCard[]>;

export class CardsPlayedThisPhaseWatcher extends StateWatcher<ICardsPlayedThisPhase> {
    public override readonly resetValue = (game: Game) => {
        const result = new Map<Player, PlayableCard[]>();
        game.getPlayers().forEach((player) => result.set(player, []));
        return result;
    };

    public constructor(registrar: StateWatcherRegistrar, card: Card) {
        super(StateWatcherName.CardsPlayedThisPhase, registrar, card);
    }

    protected override setupWatcher() {
        // on card played, add the card to the player's list of cards played this phase
        this.addUpdater({
            when: {
                onCardPlayed: () => true,
            },
            update: (currentState: ICardsPlayedThisPhase, event: any) => {
                const { player, card } = event;
                const playerCards = currentState.get(player);
                playerCards.push(card);
                return currentState;
            }
        });
    }
}