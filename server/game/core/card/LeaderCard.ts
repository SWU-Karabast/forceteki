import Card from './Card';
import type Player from '../Player';

export class LeaderCard extends Card {
    // TODO: add epic action and limit 1 per game

    // getSummary(activePlayer: Player, hideWhenFaceup = false) {
    //     const baseSummary = super.getSummary(activePlayer, hideWhenFaceup);
    //     return {
    //         ...baseSummary,
    //         isLeader: this.isLeader,
    //         childCards: this.childCards.map((card: Card) => card.getSummary(activePlayer, hideWhenFaceup)),
    //     };
    // }
}
