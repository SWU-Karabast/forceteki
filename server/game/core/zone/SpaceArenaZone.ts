import { ZoneName } from '../Constants';
import type Game from '../Game';
import type Player from '../Player';
import { ConcreteArenaZone } from './ConcreteArenaZone';

export class SpaceArenaZone extends ConcreteArenaZone {
    public override readonly name: ZoneName.SpaceArena;

    public constructor(owner: Game, player1: Player, player2: Player) {
        super(owner, player1, player2);

        this.name = ZoneName.SpaceArena;
    }
}
