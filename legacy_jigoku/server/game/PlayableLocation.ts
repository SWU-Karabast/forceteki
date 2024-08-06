import type { Locations, PlayTypes } from './Constants';
import type DrawCard from './drawcard';
import type Player from './player';

export class PlayableLocation {
    public constructor(
        public playingType: PlayTypes,
        private player: Player,
        private location: Locations,
        public cards = new Set<DrawCard>()
    ) {}

    public contains(card: DrawCard) {
        if (this.cards.size > 0 && !this.cards.has(card)) {
            return false;
        }

        return this.player.getSourceList(this.location).contains(card);
    }
}
