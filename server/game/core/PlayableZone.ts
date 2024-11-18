import { Zone } from '../Interfaces';
import type { PlayType } from './Constants';
import { Card } from './card/Card';

export class PlayableZone {
    public constructor(
        public playingType: PlayType,
        private zone: Zone
    ) {}

    public includes(card: Card) {
        return this.zone.hasCard(card);
    }
}
