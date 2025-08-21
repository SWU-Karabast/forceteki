import type { Card } from '../card/Card';
import type { MoveZoneDestination } from '../Constants';
import { ZoneName, DeckZoneDestination, WildcardRelativePlayer } from '../Constants';
import type { Player } from '../Player';
import * as Contract from '../utils/Contract';
import * as Helpers from '../utils/Helpers';
import type { IAddRemoveZone, IZoneCardFilterProperties } from './ZoneAbstract';
import { ZoneAbstract } from './ZoneAbstract';
import type { GameEvent } from '../event/GameEvent';
import type { IPlayableCard } from '../card/baseClasses/PlayableOrDeployableCard';
import type Game from '../Game';
import type { IRandomness } from '../Randomness';
import { registerState, undoArray } from '../GameObjectUtils';

@registerState()
export class DeckZone extends ZoneAbstract<IPlayableCard> implements IAddRemoveZone {
    public override readonly hiddenForPlayers: WildcardRelativePlayer.Any;
    public declare owner: Player;
    public override readonly name: ZoneName.Deck;

    @undoArray(false)
    private accessor _deck: IPlayableCard[] = [];

    @undoArray(false)
    private accessor _searchingCards: IPlayableCard[] = [];

    public override get cards(): IPlayableCard[] {
        return this._deck.concat(this._searchingCards);
    }

    public get deck(): readonly IPlayableCard[] {
        return this._deck;
    }

    public override get count() {
        return this._deck.length;
    }

    public get topCard(): IPlayableCard | null {
        return this._deck.length > 0 ? this._deck[0] : null;
    }

    public constructor(game: Game, owner: Player) {
        super(game, owner);

        this.hiddenForPlayers = WildcardRelativePlayer.Any;
        this.name = ZoneName.Deck;
    }

    public initialize(cards: IPlayableCard[]) {
        this._deck = cards;

        cards.forEach((card) => card.initializeZone(this));
    }

    public override getCards(filter?: IZoneCardFilterProperties): IPlayableCard[] {
        return this.cards.filter(this.buildFilterFn(filter));
    }

    public override hasSomeCard(filter: IZoneCardFilterProperties): boolean {
        return this.getCards(filter).length > 0;
    }

    public override hasCard(card: Card): boolean {
        const cardCount = this.cards.filter((zoneCard: IPlayableCard) => zoneCard === card).length;

        Contract.assertFalse(cardCount > 1, `Found ${cardCount} duplicates of ${card.internalName} in ${this.name}`);

        return cardCount === 1;
    }

    public getTopCards(numCards: number) {
        Contract.assertNonNegative(numCards);

        const deck = this.deck;
        const cardsToGet = Math.min(numCards, deck.length);
        return deck.slice(0, cardsToGet);
    }

    public addCardToTop(card: IPlayableCard) {
        this.addCard(card, DeckZoneDestination.DeckTop);
    }

    public addCardToBottom(card: IPlayableCard) {
        this.addCard(card, DeckZoneDestination.DeckBottom);
    }

    public addCard(card: IPlayableCard, zone: DeckZoneDestination) {
        Contract.assertTrue(card.isPlayable());
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

    public removeTopCard(): IPlayableCard | null {
        return this._deck.pop();
    }

    public removeCard(card: Card) {
        Contract.assertTrue(card.isPlayable());

        const foundCardInDeckIdx = this.tryGetCardIdx(card, this._deck);
        const foundCardInSearchingCardsIdx = this.tryGetCardIdx(card, this._searchingCards);

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

        this._searchingCards.splice(foundCardInSearchingCardsIdx, 1);
    }

    public shuffle(randomGenerator: IRandomness) {
        this._deck = Helpers.shuffle(this._deck, randomGenerator);
    }

    /**
     * Moves one or more cards to the "searching area" of the deck zone while they are being acted on by a search effect
     * @param cards Cards to move
     * @param triggeringEvent The event that triggered the search. A cleanup handler will be added in case any cards are left in the zone when it finishes resolving.
     */
    public moveCardsToSearching(cards: Card | Card[], triggeringEvent: GameEvent) {
        for (const card of Helpers.asArray(cards)) {
            Contract.assertTrue(card.isPlayable());

            const foundCardInDeckIdx = this.tryGetCardIdx(card, this._deck);
            Contract.assertNotNullLike(
                foundCardInDeckIdx,
                `Attempting to move card ${card.internalName} to the searching area of ${this} but it is not in the deck. Its current zone is ${card.zone}.`
            );

            this._deck.splice(foundCardInDeckIdx, 1);
            this._searchingCards.push(card);
        }

        triggeringEvent.addCleanupHandler(() => {
            const deck = this._deck;
            for (const card of this._searchingCards) {
                Contract.assertFalse(deck.some((x) => x === card), `Attempting to move ${card.internalName} back to deck from search area but it is already in the deck`);
                deck.push(card);
            }

            this._searchingCards = [];
        });
    }

    private tryGetCardIdx(card: IPlayableCard, list: readonly IPlayableCard[]): number | null {
        const idx = list.findIndex((x) => x === card);
        return idx === -1 ? null : idx;
    }

    protected override checkZoneMatches(card: Card, zone: MoveZoneDestination | null) {
        Contract.assertTrue(
            ([DeckZoneDestination.DeckBottom, DeckZoneDestination.DeckTop] as MoveZoneDestination[]).includes(zone),
            `Attempting to move ${card.internalName} to ${this} with incorrect zone parameter (must be DeckBottom or DeckTop): ${zone}`
        );
    }
}
