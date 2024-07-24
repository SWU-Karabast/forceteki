import type { Locations, PlayTypes } from './Constants';
import type DeckCard from './card/deckcard';
import type Player from './player';

export class PlayableLocation {
    public constructor(
        public playingType: PlayTypes,
        private player: Player,
        private location: Locations,
        public cards = new Set<DeckCard>()
    ) {}

    public contains(card: DeckCard) {
        if (this.cards.size > 0 && !this.cards.has(card)) {
            return false;
        }

        return this.player.getSourceListForPile(this.location).contains(card);
    }
}
