import { ZoneName } from '../Constants';
import type Game from '../Game';
import { ConcreteArenaZone } from './ConcreteArenaZone';

export class GroundArenaZone extends ConcreteArenaZone {
    public override readonly name: ZoneName.GroundArena;

    public constructor(owner: Game) {
        super(owner);

        this.name = ZoneName.GroundArena;
    }
}
