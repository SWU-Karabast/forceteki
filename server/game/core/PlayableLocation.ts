import { Zone } from '../Interfaces';
import type { Location, PlayType } from './Constants';
import type Player from './Player';
import { Card } from './card/Card';

// TODO THIS PR: look into redesigning PlayableLocation
export class PlayableLocation {
    public constructor(
        public playingType: PlayType,
        private zone: Zone,
        public cards = new Set<Card>()
    ) {}

    public includes(card: Card) {
        if (this.cards.size > 0 && !this.cards.has(card)) {
            return false;
        }

        return this.zone.hasCard(card);
    }
}
