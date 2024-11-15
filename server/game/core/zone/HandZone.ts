import { PlayableCard } from '../card/CardTypes';
import { Location, RelativePlayer } from '../Constants';
import Player from '../Player';
import { SimpleZone } from './SimpleZone';

export class HandZone extends SimpleZone<PlayableCard> {
    public override readonly hiddenForPlayers: RelativePlayer.Opponent;
    public override readonly name: Location.Hand;

    public constructor(owner: Player) {
        super(owner);

        this.name = Location.Hand;
    }
}
