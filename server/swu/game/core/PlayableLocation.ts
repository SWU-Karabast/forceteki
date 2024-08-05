import type { Locations, PlayTypes } from './Constants';
import type Player from './Player';
import Card from './card/Card';

export class PlayableLocation {
    public constructor(
        public playingType: PlayTypes,
        private player: Player,
        private location: Locations,
        public cards = new Set<Card>()
    ) {}

    public contains(card: Card) {
        if (this.cards.size > 0 && !this.cards.has(card)) {
            return false;
        }

        return this.player.getSourceListForPile(this.location).contains(card);
    }
}
