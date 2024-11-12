import { Card } from '../card/Card';
import { PlayableCard } from '../card/CardTypes';
import { Location, RelativePlayer } from '../Constants';
import Player from '../Player';
import * as Contract from '../utils/Contract';
import * as Helpers from '../utils/Helpers';
import { ICardFilterProperties, ZoneAbstract } from './ZoneAbstract';

export enum AddCardSide {
    Top = 'top',
    Bottom = 'bottom'
}

export class DeckZone extends ZoneAbstract<PlayableCard> {
    public override readonly hiddenForPlayers: RelativePlayer.Any;
    public override readonly owner: Player;
    public override readonly name: Location.Deck;

    protected deck: PlayableCard[] = [];

    public override get cards(): PlayableCard[] {
        return [...this.deck];
    }

    public override get count() {
        return this.deck.length;
    }

    public get topCard(): PlayableCard | null {
        return this.deck.length > 0 ? this.deck[0] : null;
    }

    public constructor(owner: Player, cards: PlayableCard[]) {
        super(owner);

        this.deck = cards;
    }

    public override getCards(filter?: ICardFilterProperties): PlayableCard[] {
        return this.deck.filter(this.buildFilterFn(filter));
    }

    public getTopCards(numCards: number) {
        Contract.assertNonNegative(numCards);

        const cardsToGet = Math.min(numCards, this.deck.length);
        return this.deck.slice(0, cardsToGet);
    }

    public addCardToTop(card: PlayableCard) {
        this.addCard(card, AddCardSide.Top);
    }

    public addCardToBottom(card: PlayableCard) {
        this.addCard(card, AddCardSide.Bottom);
    }

    public addCard(card: PlayableCard, side: AddCardSide) {
        Contract.assertEqual(card.controller, this.owner, `Attempting to add card ${card.internalName} to ${this} but its controller is ${card.controller}`);

        switch (side) {
            case AddCardSide.Top:
                this.deck.push(card);
                return;
            case AddCardSide.Bottom:
                this.deck.unshift(card);
                return;
            default:
                Contract.fail(`Unknown value for AddCardSide enum: ${side}`);
        }
    }

    public removeTopCard(): PlayableCard | null {
        return this.deck.pop() ?? null;
    }

    public removeCard(card: Card) {
        Contract.assertTrue(card.isTokenOrPlayable());

        const cardIdx = this.deck.indexOf(card);

        Contract.assertFalse(cardIdx === -1, `Attempting to remove card ${card.internalName} from ${this} but it is not there. Its current location is ${card.location}.`);

        this.deck.splice(cardIdx, 1);
    }

    public shuffle() {
        Helpers.shuffle(this.deck);
    }
}
