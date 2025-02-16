import type { Card } from '../../game/core/card/Card';
import type Player from '../../game/core/Player';
import * as CardHelpers from '../../game/core/card/CardHelpers';
import * as Contract from '../../game/core/utils/Contract';
import type { ISwuDbCardEntry, ISwuDbDecklist, IDecklistInternal } from './DeckInterfaces';
import type { CardDataGetter } from '../cardData/CardDataGetter';
import type { IPlayableCard } from '../../game/core/card/baseClasses/PlayableOrDeployableCard';
import type { ITokenCard } from '../../game/core/card/propertyMixins/Token';
import type { IBaseCard } from '../../game/core/card/BaseCard';
import type { ILeaderCard } from '../../game/core/card/propertyMixins/LeaderProperties';
import { cards } from '../../game/cards/Index';

export class Deck {
    public readonly base: string;
    public readonly leader: string;

    private deckCards: Map<string, number>;
    private sideboard: Map<string, number>;

    public constructor(decklist: ISwuDbDecklist | IDecklistInternal) {
        this.base = decklist.base.id;
        this.leader = decklist.leader.id;

        const sideboard = decklist.sideboard ?? [];

        const allCardIds = new Set(
            decklist.deck.map((cardEntry) => cardEntry.id).concat(
                sideboard.map((cardEntry) => cardEntry.id)
            )
        );

        this.deckCards = this.convertCardListToMap(decklist.deck, allCardIds);
        this.sideboard = this.convertCardListToMap(sideboard, allCardIds);
    }

    private convertCardListToMap(cardList: ISwuDbCardEntry[], allCardIds: Set<string>) {
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

    private convertMapToCardList(cardsMap: Map<string, number>): ISwuDbCardEntry[] {
        return Array.from(cardsMap.entries()).map(([id, count]) => ({ id, count }));
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
            leader: { id: this.leader, count: 1 },
            base: { id: this.base, count: 1 },
            deck: this.convertMapToCardList(this.deckCards),
            sideboard: this.convertMapToCardList(this.sideboard),
        };
    }

    public async buildCardsAsync(player: Player, cardDataGetter: CardDataGetter) {
        const result = {
            deckCards: [] as IPlayableCard[],
            outOfPlayCards: [],
            outsideTheGameCards: [] as Card[],
            tokens: [] as ITokenCard[],
            base: undefined as IBaseCard | undefined,
            leader: undefined as ILeaderCard | undefined,
            allCards: [] as Card[]
        };

        // TODO THIS PR: get all card data at once to reduce async calls

        // deck
        for (const [cardSetCode, count] of this.deckCards ?? []) {
            const cardCopies = await this.buildCardsFromSetCodeAsync(cardSetCode, player, cardDataGetter, count);

            for (const cardCopy of cardCopies) {
                Contract.assertTrue(cardCopy.isPlayable());
                result.deckCards.push(cardCopy);
            }
        }

        // base
        const baseCard = await this.buildCardsFromSetCodeAsync(this.base, player, cardDataGetter, 1)[0];
        Contract.assertTrue(baseCard.isBase());
        result.base = baseCard;

        // leader
        const leaderCard = await this.buildCardsFromSetCodeAsync(this.leader, player, cardDataGetter, 1)[0];
        Contract.assertTrue(leaderCard.isLeader());
        result.leader = leaderCard;

        result.allCards.push(...result.deckCards);
        result.allCards.push(result.base);
        result.allCards.push(result.leader);

        return result;
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

        const cardData = await cardDataGetter.getCardBySetCodeAsync(setCode);
        const generatedCards = [];

        for (let i = 0; i < count; i++) {
            const CardConstructor = cards.get(cardData.id) ?? CardHelpers.createUnimplementedCard;
            const card: Card = new CardConstructor(player, cardData);
            generatedCards.push(card);
        }

        return generatedCards;
    }
}
