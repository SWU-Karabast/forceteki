import { CardTypes, Locations } from '../Constants';
import DrawCard from '../drawcard';
import Player from '../player';

export default class Soldier<D extends DrawCard> extends DrawCard {
    static createDummy(owner: Player) {
        const dummyCard = new DrawCard(owner, {});
        return new Soldier(dummyCard);
    }

    constructor(facedownCard: D) {
        super(facedownCard.owner, {
            clan: 'neutral',
            cost: null,
            glory: null,
            id: 'soldier',
            military: null,
            military_bonus: '+1',
            political_bonus: '+1',
            name: 'Soldier',
            political: null,
            side: 'conflict',
            text: '',
            type: CardTypes.Attachment,
            traits: ['follower'],
            is_unique: false,
            attachment_allow_duplicates: true
        });
        this.facedownCard = facedownCard;
    }

    leavesPlay(destination = Locations.ConflictDiscardPile): void {
        this.owner.moveCard(this.facedownCard, destination);
        this.game.queueSimpleStep(() => {
            this.owner.removeCardFromPile(this);
            this.game.allCards = this.owner.removeCardByUuid(this.game.allCards, this.uuid);
        });
        super.leavesPlay();
    }

    getSummary(activePlayer: Player, hideWhenFaceup: boolean) {
        const summary = super.getSummary(activePlayer, hideWhenFaceup);
        const tokenProps = {
            isToken: true,
            id: activePlayer === this.controller ? this.facedownCard.cardData.id : undefined
        };
        return Object.assign(summary, tokenProps);
    }
}
