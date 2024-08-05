import BaseCard from './basecard';
import type Player from '../Player';

export class LeaderCard extends BaseCard {
    isLeader = true;

    // TODO: add epic action and limit 1 per game

    getSummary(activePlayer: Player, hideWhenFaceup = false) {
        const baseSummary = super.getSummary(activePlayer, hideWhenFaceup);
        return {
            ...baseSummary,
            isLeader: this.isLeader,
            childCards: this.childCards.map((card: BaseCard) => card.getSummary(activePlayer, hideWhenFaceup)),
        };
    }
}
