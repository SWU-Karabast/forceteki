import Card from './Card';
import type Player from '../Player';

export class BaseCard extends Card {
    getStartingHealth(): number {
        return this.cardData.health;
    }

    // TODO: add epic action and limit 1 per game

    // getSummary(activePlayer: Player, hideWhenFaceup = false) {
    //     const baseSummary = super.getSummary(activePlayer, hideWhenFaceup);
    //     return {
    //         ...baseSummary,
    //         isBase: this.isBase,
    //         childCards: this.childCards.map((card: Card) => card.getSummary(activePlayer, hideWhenFaceup)),
    //     };
    // }
}
