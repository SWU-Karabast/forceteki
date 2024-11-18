import { Card } from '../card/Card';
import { ZoneName } from '../Constants';
import Player from '../Player';
import { SimpleZone } from './SimpleZone';

export class OutsideTheGameZone extends SimpleZone<Card> {
    public override readonly hiddenForPlayers: null;
    public override readonly name: ZoneName.OutsideTheGame;

    public constructor(owner: Player) {
        super(owner);

        this.name = ZoneName.OutsideTheGame;
    }
}
