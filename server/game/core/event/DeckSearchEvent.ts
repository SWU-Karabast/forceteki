import { Card } from '../card/Card';
import { EventName } from '../Constants';
import Player from '../Player';
import { GameEvent } from './GameEvent';

export class DeckSearchEvent extends GameEvent {
    public amount: number;
    public player: Player;
    public selectedCards: Card[];

    public constructor(params, handler) {
        super(EventName.OnDeckSearch, params, handler);
        this.amount = -1;
        this.player = this.context.player;
        this.selectedCards = [];
    }
}
