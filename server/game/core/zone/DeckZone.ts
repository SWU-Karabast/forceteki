import { Card } from '../card/Card';
import { PlayableCard } from '../card/CardTypes';
import { Location, MoveLocation, MoveToDeckLocation, RelativePlayer } from '../Constants';
import Player from '../Player';
import * as Contract from '../utils/Contract';
import * as Helpers from '../utils/Helpers';
import { IAddRemoveZone, IZoneCardFilterProperties, ZoneAbstract } from './ZoneAbstract';

export class DeckZone extends ZoneAbstract<PlayableCard> implements IAddRemoveZone {
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

        this.name = Location.Deck;

        this.deck = cards;

        cards.forEach((card) => card.initializeLocation(this));
    }

    public override getCards(filter?: IZoneCardFilterProperties): PlayableCard[] {
        return this.deck.filter(this.buildFilterFn(filter));
    }

    public getTopCards(numCards: number) {
        Contract.assertNonNegative(numCards);

        const cardsToGet = Math.min(numCards, this.deck.length);
        return this.deck.slice(0, cardsToGet);
    }

    public addCardToTop(card: PlayableCard) {
        this.addCard(card, MoveToDeckLocation.DeckTop);
    }

    public addCardToBottom(card: PlayableCard) {
        this.addCard(card, MoveToDeckLocation.DeckTop);
    }

    public addCard(card: PlayableCard, location: MoveToDeckLocation) {
        Contract.assertEqual(card.controller, this.owner, `Attempting to add card ${card.internalName} to ${this} but its controller is ${card.controller}`);

        switch (location) {
            case MoveToDeckLocation.DeckTop:
                this.deck.unshift(card);
                return;
            case MoveToDeckLocation.DeckBottom:
                this.deck.push(card);
                return;
            default:
                Contract.fail(`Unknown value for MoveToDeckLocation enum: ${location}`);
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

    protected override checkLocationMatches(card: Card, location: MoveLocation | null) {
        Contract.assertTrue(
            ([MoveToDeckLocation.DeckBottom, MoveToDeckLocation.DeckTop] as MoveLocation[]).includes(location),
            `Attempting to move ${card.internalName} to ${this} with incorrect location parameter (must be DeckBottom or DeckTop): ${location}`
        );
    }
}
