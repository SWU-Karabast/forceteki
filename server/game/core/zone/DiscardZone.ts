import { TokenOrPlayableCard } from '../card/CardTypes';
import { ZoneName } from '../Constants';
import Player from '../Player';
import { SimpleZone } from './SimpleZone';

export class DiscardZone extends SimpleZone<TokenOrPlayableCard> {
    public override readonly hiddenForPlayers: null;
    public override readonly name: ZoneName.Discard;

    public constructor(owner: Player) {
        super(owner);

        this.hiddenForPlayers = null;
        this.name = ZoneName.Discard;
    }
}