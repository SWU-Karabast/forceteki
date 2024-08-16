import type { Location, PlayType } from './Constants';
import type Player from './Player';
import Card from './card/Card';

export class PlayableLocation {
    public constructor(
        public playingType: PlayType,
        private player: Player,
        private location: Location,
        public cards = new Set<Card>()
    ) {}

    public includes(card: Card) {
        if (this.cards.size > 0 && !this.cards.has(card)) {
            return false;
        }

        return this.player.getCardPile(this.location).includes(card);
    }
}
