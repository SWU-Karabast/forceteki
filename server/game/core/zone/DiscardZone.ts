import { PlayableCard } from '../card/CardTypes';
import { Location } from '../Constants';
import { SimpleZone } from './SimpleZone';

export class DiscardZone extends SimpleZone<PlayableCard> {
    public override readonly hiddenForPlayers: null;
    public override readonly name: Location.Discard;
}
