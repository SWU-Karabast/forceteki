import { Location } from '../Constants';
import Game from '../Game';
import Player from '../Player';
import { ConcreteArenaZone } from './ConcreteArenaZone';

export class GroundArenaZone extends ConcreteArenaZone {
    public override readonly name: Location.GroundArena;

    public constructor(owner: Game, player1: Player, player2: Player) {
        super(owner, player1, player2);

        this.name = Location.GroundArena;
    }
}
