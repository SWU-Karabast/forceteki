import type seedrandom from 'seedrandom';
import type { Card } from '../card/Card';
import type { TokenOrPlayableCard } from '../card/CardTypes';
import type { MoveZoneDestination } from '../Constants';
import { ZoneName, DeckZoneDestination, WildcardRelativePlayer } from '../Constants';
import type Player from '../Player';
import * as Contract from '../utils/Contract';
import * as Helpers from '../utils/Helpers';
import type { IAddRemoveZone, IZoneCardFilterProperties } from './ZoneAbstract';
import { ZoneAbstract } from './ZoneAbstract';
import type { GameEvent } from '../event/GameEvent';

export class DeckZone extends ZoneAbstract<TokenOrPlayableCard> implements IAddRemoveZone {
    public override readonly hiddenForPlayers: WildcardRelativePlayer.Any;
    public override readonly owner: Player;
    public override readonly name: ZoneName.Deck;

    protected _deck: TokenOrPlayableCard[] = [];

    // cards that have been selected for a search effect are considered "in the deck zone" but not "in the deck"
    // while the effect is resolving (see SWU 8.27.7).
    // These cards will be moved back to deck if they are somehow still there at the end of the action (e.g. the
    // U-Wing into ... into opponent Regional Governor scenario).
    protected searchingCards: TokenOrPlayableCard[] = [];

    public override get cards(): TokenOrPlayableCard[] {
        return [...this._deck, ...this.searchingCards];
    }

    public get deck(): TokenOrPlayableCard[] {
        return [...this._deck];
    }

    public override get count() {
        return this._deck.length;
    }

    public get topCard(): TokenOrPlayableCard | null {
        return this._deck.length > 0 ? this._deck[0] : null;
    }

    public constructor(owner: Player, cards: TokenOrPlayableCard[]) {
        super(owner);

        this.hiddenForPlayers = WildcardRelativePlayer.Any;
        this.name = ZoneName.Deck;

        this._deck = cards;

        cards.forEach((card) => card.initializeZone(this));
    }

    public override getCards(filter?: IZoneCardFilterProperties): TokenOrPlayableCard[] {
        return this.cards.filter(this.buildFilterFn(filter));
    }

    public override hasSomeCard(filter: IZoneCardFilterProperties): boolean {
        return this.getCards(filter).length > 0;
    }

    public override hasCard(card: Card): boolean {
        const cardCount = this.cards.filter((zoneCard: TokenOrPlayableCard) => zoneCard === card).length;

        Contract.assertFalse(cardCount > 1, `Found ${cardCount} duplicates of ${card.internalName} in ${this.name}`);

        return cardCount === 1;
    }

    public getTopCards(numCards: number) {
        Contract.assertNonNegative(numCards);

        const cardsToGet = Math.min(numCards, this._deck.length);
        return this._deck.slice(0, cardsToGet);
    }

    public addCardToTop(card: TokenOrPlayableCard) {
        this.addCard(card, DeckZoneDestination.DeckTop);
    }

    public addCardToBottom(card: TokenOrPlayableCard) {
        this.addCard(card, DeckZoneDestination.DeckTop);
    }

    public addCard(card: TokenOrPlayableCard, zone: DeckZoneDestination) {
        Contract.assertTrue(card.isTokenOrPlayable() && !card.isToken());
        Contract.assertEqual(card.controller, this.owner, `Attempting to add card ${card.internalName} to ${this} but its controller is ${card.controller}`);
        Contract.assertFalse(this.cards.includes(card), `Attempting to add card ${card.internalName} to ${this} but it is already there`);

        switch (zone) {
            case DeckZoneDestination.DeckTop:
                this._deck.unshift(card);
                return;
            case DeckZoneDestination.DeckBottom:
                this._deck.push(card);
                return;
            default:
                Contract.fail(`Unknown value for DeckZoneDestination enum: ${zone}`);
        }
    }

    public removeTopCard(): TokenOrPlayableCard | null {
        return this._deck.pop() ?? null;
    }

    public removeCard(card: Card) {
        Contract.assertTrue(card.isTokenOrPlayable() && !card.isToken());

        const foundCardInDeckIdx = this.tryGetCardIdx(card, this._deck);
        const foundCardInSearchingCardsIdx = this.tryGetCardIdx(card, this.searchingCards);

        Contract.assertFalse(
            foundCardInDeckIdx == null && foundCardInSearchingCardsIdx == null,
            `Attempting to remove card ${card.internalName} from ${this} but it is not there. Its current zone is ${card.zone}.`
        );
        Contract.assertFalse(
            foundCardInDeckIdx != null && foundCardInSearchingCardsIdx != null,
            `Attempting to remove card ${card.internalName} from ${this} but found duplicate entries for it in both the deck and searched cards piles`
        );

        if (foundCardInDeckIdx != null) {
            this._deck.splice(foundCardInDeckIdx, 1);
            return;
        }

        this.searchingCards.splice(foundCardInSearchingCardsIdx, 1);
    }

    public shuffle(randomGenerator: seedrandom) {
        this._deck = Helpers.shuffle(this._deck, randomGenerator);
    }

    /**
     * Moves one or more cards to the "searching area" of the deck zone while they are being acted on by a search effect
     * @param cards Cards to move
     * @param triggeringEvent The event that triggered the search. A cleanup handler will be added in case any cards are left in the zone when it finishes resolving.
     */
    public moveCardsToSearching(cards: Card | Card[], triggeringEvent: GameEvent) {
        for (const card of Helpers.asArray(cards)) {
            Contract.assertTrue(card.isTokenOrPlayable() && !card.isToken());

            const foundCardInDeckIdx = this.tryGetCardIdx(card, this._deck);
            Contract.assertNotNullLike(
                foundCardInDeckIdx,
                `Attempting to move card ${card.internalName} to the searching area of ${this} but it is not in the deck. Its current zone is ${card.zone}.`
            );

            this._deck.splice(foundCardInDeckIdx, 1);
            this.searchingCards.push(card);
        }

        triggeringEvent.addCleanupHandler(() => {
            for (const card of this.searchingCards) {
                Contract.assertFalse(this._deck.includes(card), `Attempting to move ${card.internalName} back to deck from search area but it is already in the deck`);
                this._deck.push(card);
            }

            this.searchingCards = [];
        });
    }

    private tryGetCardIdx(card: TokenOrPlayableCard, list: TokenOrPlayableCard[]): number | null {
        const idx = list.indexOf(card);
        return idx === -1 ? null : idx;
    }

    protected override checkZoneMatches(card: Card, zone: MoveZoneDestination | null) {
        Contract.assertTrue(
            ([DeckZoneDestination.DeckBottom, DeckZoneDestination.DeckTop] as MoveZoneDestination[]).includes(zone),
            `Attempting to move ${card.internalName} to ${this} with incorrect zone parameter (must be DeckBottom or DeckTop): ${zone}`
        );
    }
}
