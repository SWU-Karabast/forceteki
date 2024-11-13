import { PlayableCard } from '../card/CardTypes';
import { Location, RelativePlayer } from '../Constants';
import { SimpleZone } from './SimpleZone';

export class ResourceZone extends SimpleZone<PlayableCard> {
    public override readonly hiddenForPlayers: RelativePlayer.Opponent;
    public override readonly name: Location.Resource;

    public get exhaustedResourceCount() {
        return this.exhaustedResources.length;
    }

    public get exhaustedResources() {
        return this._cards.filter((card) => card.exhausted);
    }

    public get readyResourceCount() {
        return this.readyResources.length;
    }

    public get readyResources() {
        return this._cards.filter((card) => !card.exhausted);
    }
}
