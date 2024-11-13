import { Location } from '../Constants';
import { ConcreteArenaZone } from './ConcreteArenaZone';

export class GroundArenaZone extends ConcreteArenaZone {
    public override readonly name: Location.GroundArena;
}
