import { ZoneName } from '../Constants';
import type Game from '../Game';
import { registerState } from '../GameObjectUtils';
import { ConcreteArenaZone } from './ConcreteArenaZone';

@registerState()
export class SpaceArenaZone extends ConcreteArenaZone {
    public override readonly name: ZoneName.SpaceArena;

    public constructor(owner: Game) {
        super(owner);

        this.name = ZoneName.SpaceArena;
    }
}
