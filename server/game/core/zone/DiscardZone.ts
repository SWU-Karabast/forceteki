import { PlayableCard } from '../card/CardTypes';
import { Location } from '../Constants';
import Player from '../Player';
import { SimpleZone } from './SimpleZone';

export class DiscardZone extends SimpleZone<PlayableCard> {
    public override readonly hiddenForPlayers: null;
    public override readonly name: Location.Discard;

    public constructor(owner: Player) {
        super(owner);

        this.name = Location.Discard;
    }
}