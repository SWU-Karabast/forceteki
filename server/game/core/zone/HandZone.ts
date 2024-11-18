import { TokenOrPlayableCard } from '../card/CardTypes';
import { ZoneName, RelativePlayer } from '../Constants';
import Player from '../Player';
import { SimpleZone } from './SimpleZone';

export class HandZone extends SimpleZone<TokenOrPlayableCard> {
    public override readonly hiddenForPlayers: RelativePlayer.Opponent;
    public override readonly name: ZoneName.Hand;

    public constructor(owner: Player) {
        super(owner);

        this.name = ZoneName.Hand;
    }
}
