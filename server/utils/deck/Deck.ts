import type { Card } from '../../game/core/card/Card';
import type { Player } from '../../game/core/Player';
import * as CardHelpers from '../../game/core/card/CardHelpers';
import * as Contract from '../../game/core/utils/Contract';
import type { ISwuDbFormatCardEntry, IDecklistInternal, IInternalCardEntry, ILeaderBaseInternal, IDeckListForLoading, ISwuDbFormatDecklist } from './DeckInterfaces';
import { DeckSource } from './DeckInterfaces';
import type { CardDataGetter } from '../cardData/CardDataGetter';
import { cards } from '../../game/cards/Index';

export class Deck {
    private static buildDecklistEntry(cardId: string, count: number, cardDataGetter: CardDataGetter): IInternalCardEntry {
        const internalId = cardDataGetter.setCodeMap.get(cardId);
        Contract.assertNotNullLike(internalId, `Card ${cardId} not found in set code map`);

        const mapEntry = cardDataGetter.cardMap.get(internalId);
        Contract.assertNotNullLike(mapEntry, `Card internal id ${internalId} for set code ${cardId} not found in card map`);

        return { id: cardId, count, internalName: mapEntry.id, cost: mapEntry.cost };
    }

    public readonly base: IInternalCardEntry;
    public readonly deckSource: DeckSource;
    public readonly leader: IInternalCardEntry;
    public readonly id?: string;
    public readonly isPresentInDb: boolean;
    public readonly deckLink?: string;
    public readonly name?: string;
    public readonly originalDeckList: ISwuDbFormatDecklist;

    private readonly cardDataGetter: CardDataGetter;

    private deckCards: Map<string, number>;
    private sideboard: Map<string, number>;

    public constructor(decklist: ISwuDbFormatDecklist, cardDataGetter: CardDataGetter) {
        this.base = Deck.buildDecklistEntry(decklist.base.id, 1, cardDataGetter);
        this.leader = Deck.buildDecklistEntry(decklist.leader.id, 1, cardDataGetter);
        this.id = decklist.deckID;

        this.cardDataGetter = cardDataGetter;
        this.originalDeckList = decklist;

        // initialize the cards in deck and sideboard
        this.resetSideboard();

        this.isPresentInDb = decklist.isPresentInDb;
        this.deckLink = decklist.deckLink;
        this.name = decklist.metadata?.name;
        this.deckSource = this.determineDeckSource(decklist.deckLink);
    }

    private convertCardListToMap(cardList: ISwuDbFormatCardEntry[], allCardIds: Set<string>) {
        const cardsMap = new Map<string, number>();
        const missingCardIds = new Set(allCardIds);

        for (const cardEntry of cardList) {
            cardsMap.set(cardEntry.id, cardEntry.count);
            missingCardIds.delete(cardEntry.id);
        }

        // add an entry with count 0 for cards that are in the other part of the decklist
        for (const cardId of missingCardIds) {
            cardsMap.set(cardId, 0);
        }

        return cardsMap;
    }

    /**
     * Helper method to determine deck source from deck link or other data
     */
    private determineDeckSource(deckLink?: string, deckSource?: string): DeckSource {
        if (deckSource) {
            const upperDeckSource = deckSource.toUpperCase();
            const enumValues = Object.values(DeckSource);

            for (const enumValue of enumValues) {
                if (enumValue.toUpperCase() === upperDeckSource) {
                    return enumValue;
                }
            }
        }
        // Fallback to determining from deckLink
        if (deckLink) {
            if (deckLink.includes('swustats.net')) {
                return DeckSource.SWUStats;
            } else if (deckLink.includes('swudb.com')) {
                return DeckSource.SWUDB;
            } else if (deckLink.includes('swunlimiteddb.com')) {
                return DeckSource.SWUnlimitedDB;
            } else if (deckLink.includes('swubase.com')) {
                return DeckSource.SWUBase;
            } else if (deckLink.includes('swucardhub.fr')) {
                return DeckSource.SWUCardHub;
            }
        }

        // Default fallback
        return DeckSource.Unknown;
    }

    public resetSideboard() {
        const sideboard = this.originalDeckList.sideboard ?? [];

        const allCardIds = new Set(
            this.originalDeckList.deck.map((cardEntry) => cardEntry.id).concat(
                sideboard.map((cardEntry) => cardEntry.id)
            )
        );

        this.deckCards = this.convertCardListToMap(this.originalDeckList.deck, allCardIds);
        this.sideboard = this.convertCardListToMap(sideboard, allCardIds);
    }

    public moveToDeck(cardId: string) {
        const sideboardCount = this.sideboard.get(cardId);

        Contract.assertNotNullLike(sideboardCount, `Card '${cardId}' is not in the decklist`);
        Contract.assertFalse(sideboardCount === 0, `All copies of '${cardId}' are already in the deck and cannot be moved from sideboard`);

        this.sideboard.set(cardId, sideboardCount - 1);
        this.deckCards.set(cardId, this.deckCards.get(cardId) + 1);
    }

    public moveToSideboard(cardId: string) {
        const deckCount = this.deckCards.get(cardId);

        Contract.assertNotNullLike(deckCount, `Card '${cardId}' is not in the decklist`);
        Contract.assertFalse(deckCount === 0, `All copies of '${cardId}' are already in the sideboard and cannot be moved from deck`);

        this.deckCards.set(cardId, deckCount - 1);
        this.sideboard.set(cardId, this.sideboard.get(cardId) + 1);
    }

    public getDecklist(): IDecklistInternal {
        return {
            name: this.name,
            leader: this.leader,
            base: this.base,
            deck: this.convertMapToCardList(this.deckCards),
            sideboard: this.convertMapToCardList(this.sideboard),
        };
    }

    public getLeaderBase(): ILeaderBaseInternal {
        return {
            leader: this.leader,
            base: this.base
        };
    }

    public async buildCardsAsync(player: Player, cardDataGetter: CardDataGetter): Promise<IDeckListForLoading> {
        const result: IDeckListForLoading = {
            deckCards: [],
            outOfPlayCards: [],
            outsideTheGameCards: [],
            tokens: [],
            base: undefined,
            leader: undefined,
            allCards: []
        };

        // TODO: get all card data at once to reduce async calls

        // deck
        for (const [cardSetCode, count] of this.deckCards ?? []) {
            const cardCopies = await this.buildCardsFromSetCodeAsync(cardSetCode, player, cardDataGetter, count);

            for (const cardCopy of cardCopies) {
                Contract.assertTrue(cardCopy.isPlayable(), `Card ${cardCopy.internalName} cannot be in the deck`);
                result.deckCards.push(cardCopy.getRef());
            }
        }

        // base
        const baseCard = (await this.buildCardsFromSetCodeAsync(this.base.id, player, cardDataGetter, 1))[0];
        Contract.assertTrue(baseCard.isBase());
        result.base = baseCard.getRef();

        // leader
        const leaderCard = (await this.buildCardsFromSetCodeAsync(this.leader.id, player, cardDataGetter, 1))[0];
        Contract.assertTrue(leaderCard.isLeader(), `${leaderCard.internalName} is not a leader`);
        result.leader = leaderCard.getRef();

        result.allCards.push(...result.deckCards);
        result.allCards.push(result.base);
        result.allCards.push(result.leader);

        return result;
    }

    private convertMapToCardList(cardsMap: Map<string, number>): IInternalCardEntry[] {
        const cardList: IInternalCardEntry[] = [];
        for (const [id, count] of cardsMap.entries()) {
            if (count === 0) {
                continue;
            }

            cardList.push(Deck.buildDecklistEntry(id, count, this.cardDataGetter));
        }

        return cardList;
    }

    private async buildCardsFromSetCodeAsync(
        setCode: string,
        player: Player,
        cardDataGetter: CardDataGetter,
        count: number
    ) {
        if (count === 0) {
            return [];
        }

        // TODO: use Object.freeze() to make card data immutable
        const cardData = await cardDataGetter.getCardBySetCodeAsync(setCode);
        const generatedCards: Card[] = [];

        for (let i = 0; i < count; i++) {
            const CardConstructor = cards.get(cardData.id) ?? CardHelpers.createUnimplementedCard;
            const card: Card = new CardConstructor(player, cardData);
            generatedCards.push(card);
        }

        return generatedCards;
    }
}
