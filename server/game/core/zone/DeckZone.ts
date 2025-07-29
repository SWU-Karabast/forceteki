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
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import type { IRandomness } from '../GameInterfaces';

export interface IDeckZoneState extends IGameObjectBaseState {
    deck: GameObjectRef<IPlayableCard>[];

    // cards that have been selected for a search effect are considered "in the deck zone" but not "in the deck"
    // while the effect is resolving (see SWU 8.27.7).
    // These cards will be moved back to deck if they are somehow still there at the end of the action (e.g. the
    // U-Wing into ... into opponent Regional Governor scenario).
    searchingCards: GameObjectRef<IPlayableCard>[];
}

export class DeckZone extends ZoneAbstract<IPlayableCard, IDeckZoneState> implements IAddRemoveZone {
    public override readonly hiddenForPlayers: WildcardRelativePlayer.Any;
    public override readonly owner: Player;
    public override readonly name: ZoneName.Deck;

    public override get cards(): IPlayableCard[] {
        return this.state.deck.concat(this.state.searchingCards).map((x) => this.game.gameObjectManager.get(x));
    }

    public get deck(): IPlayableCard[] {
        return this.state.deck.map((x) => this.game.gameObjectManager.get(x));
    }

    public get searchingCards(): IPlayableCard[] {
        return this.state.searchingCards.map((x) => this.game.gameObjectManager.get(x));
    }

    public override get count() {
        return this.state.deck.length;
    }

    public get topCard(): IPlayableCard | null {
        return this.state.deck.length > 0 ? this.game.gameObjectManager.get(this.state.deck[0]) : null;
    }

    public constructor(game: Game, owner: Player) {
        super(game, owner);

        this.hiddenForPlayers = WildcardRelativePlayer.Any;
        this.name = ZoneName.Deck;
    }

    protected override setupDefaultState(): void {
        super.setupDefaultState();
        this.state.deck = [];
        this.state.searchingCards = [];
    }

    public initialize(cards: IPlayableCard[]) {
        this.state.deck = cards.map((x) => x.getRef());

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
        this.addCard(card, DeckZoneDestination.DeckTop);
    }

    public addCard(card: IPlayableCard, zone: DeckZoneDestination) {
        Contract.assertTrue(card.isPlayable());
        Contract.assertEqual(card.controller, this.owner, `Attempting to add card ${card.internalName} to ${this} but its controller is ${card.controller}`);
        Contract.assertFalse(this.cards.includes(card), `Attempting to add card ${card.internalName} to ${this} but it is already there`);

        switch (zone) {
            case DeckZoneDestination.DeckTop:
                this.state.deck.unshift(card.getRef());
                return;
            case DeckZoneDestination.DeckBottom:
                this.state.deck.push(card.getRef());
                return;
            default:
                Contract.fail(`Unknown value for DeckZoneDestination enum: ${zone}`);
        }
    }

    public removeTopCard(): IPlayableCard | null {
        const card = this.state.deck.pop();
        return this.game.gameObjectManager.get(card);
    }

    public removeCard(card: Card) {
        Contract.assertTrue(card.isPlayable());

        const foundCardInDeckIdx = this.tryGetCardIdx(card, this.state.deck);
        const foundCardInSearchingCardsIdx = this.tryGetCardIdx(card, this.state.searchingCards);

        Contract.assertFalse(
            foundCardInDeckIdx == null && foundCardInSearchingCardsIdx == null,
            `Attempting to remove card ${card.internalName} from ${this} but it is not there. Its current zone is ${card.zone}.`
        );
        Contract.assertFalse(
            foundCardInDeckIdx != null && foundCardInSearchingCardsIdx != null,
            `Attempting to remove card ${card.internalName} from ${this} but found duplicate entries for it in both the deck and searched cards piles`
        );

        if (foundCardInDeckIdx != null) {
            this.state.deck.splice(foundCardInDeckIdx, 1);
            return;
        }

        this.state.searchingCards.splice(foundCardInSearchingCardsIdx, 1);
    }

    public shuffle(randomGenerator: IRandomness) {
        this.state.deck = Helpers.shuffle(this.state.deck, randomGenerator);
    }

    /**
     * Moves one or more cards to the "searching area" of the deck zone while they are being acted on by a search effect
     * @param cards Cards to move
     * @param triggeringEvent The event that triggered the search. A cleanup handler will be added in case any cards are left in the zone when it finishes resolving.
     */
    public moveCardsToSearching(cards: Card | Card[], triggeringEvent: GameEvent) {
        for (const card of Helpers.asArray(cards)) {
            Contract.assertTrue(card.isPlayable());

            const foundCardInDeckIdx = this.tryGetCardIdx(card, this.state.deck);
            Contract.assertNotNullLike(
                foundCardInDeckIdx,
                `Attempting to move card ${card.internalName} to the searching area of ${this} but it is not in the deck. Its current zone is ${card.zone}.`
            );

            this.state.deck.splice(foundCardInDeckIdx, 1);
            this.state.searchingCards.push(card.getRef());
        }

        triggeringEvent.addCleanupHandler(() => {
            for (const card of this.searchingCards) {
                Contract.assertFalse(this.state.deck.some((x) => x.uuid === card.uuid), `Attempting to move ${card.internalName} back to deck from search area but it is already in the deck`);
                this.state.deck.push(card.getRef());
            }

            this.state.searchingCards = [];
        });
    }

    private tryGetCardIdx(card: IPlayableCard, list: GameObjectRef<IPlayableCard>[]): number | null {
        const idx = list.findIndex((x) => x.uuid === card.uuid);
        return idx === -1 ? null : idx;
    }

    protected override checkZoneMatches(card: Card, zone: MoveZoneDestination | null) {
        Contract.assertTrue(
            ([DeckZoneDestination.DeckBottom, DeckZoneDestination.DeckTop] as MoveZoneDestination[]).includes(zone),
            `Attempting to move ${card.internalName} to ${this} with incorrect zone parameter (must be DeckBottom or DeckTop): ${zone}`
        );
    }
}
