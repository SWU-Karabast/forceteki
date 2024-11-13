import { Location } from '../Constants';
import { ConcreteArenaZone } from './ConcreteArenaZone';

export class SpaceArenaZone extends ConcreteArenaZone {
    public override readonly name: Location.SpaceArena;
}
