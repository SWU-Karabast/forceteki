import type { Locations, PlayTypes } from './core/Constants';
import type Player from './core/player';
import BaseCard from './core/card/basecard';

export class PlayableLocation {
    public constructor(
        public playingType: PlayTypes,
        private player: Player,
        private location: Locations,
        public cards = new Set<BaseCard>()
    ) {}

    public contains(card: BaseCard) {
        if (this.cards.size > 0 && !this.cards.has(card)) {
            return false;
        }

        return this.player.getSourceListForPile(this.location).contains(card);
    }
}
