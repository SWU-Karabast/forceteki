import { Card } from '../card/Card';
import { Location } from '../Constants';
import { SimpleZone } from './SimpleZone';

export class OutsideTheGameZone extends SimpleZone<Card> {
    public override readonly hiddenForPlayers: null;
    public override readonly name: Location.OutsideTheGame;
}
