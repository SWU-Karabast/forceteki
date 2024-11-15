import { Zone } from '../Interfaces';
import type { Location, PlayType } from './Constants';
import type Player from './Player';
import { Card } from './card/Card';

export class PlayableLocation {
    public constructor(
        public playingType: PlayType,
        private zone: Zone
    ) {}

    public includes(card: Card) {
        return this.zone.hasCard(card);
    }
}
