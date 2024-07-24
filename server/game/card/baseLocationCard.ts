import BaseCard from './basecard';
import type Player from '../player';

export class BaseLocationCard extends BaseCard {
    isBase = true;

    getStartingHealth(): number {
        return this.cardData.health;
    }

    // TODO: add epic action and limit 1 per game

    getSummary(activePlayer: Player, hideWhenFaceup = false) {
        const baseSummary = super.getSummary(activePlayer, hideWhenFaceup);
        return {
            ...baseSummary,
            isBase: this.isBase,
            childCards: this.childCards.map((card: BaseCard) => card.getSummary(activePlayer, hideWhenFaceup)),
        };
    }
}
