import type { Card } from '../../game/core/card/Card';
import { cards } from '../../game/cards/Index';
import type Player from '../../game/core/Player';
import * as CardHelpers from '../../game/core/card/CardHelpers';
import * as Contract from '../../game/core/utils/Contract';
import type { ISwuDbCardEntry, ISwuDbDecklist, IDecklistInternal } from './DeckInterfaces';
import type { CardDataGetter } from '../cardData/CardDataGetter';
import type { IPlayableCard } from '../../game/core/card/baseClasses/PlayableOrDeployableCard';
import type { ITokenCard } from '../../game/core/card/propertyMixins/Token';
import type { IBaseCard } from '../../game/core/card/BaseCard';
import type { ILeaderCard } from '../../game/core/card/propertyMixins/LeaderProperties';

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
            for (let i = 0; i < count; i++) {
                const deckCard = await this.buildCardFromSetCodeAsync(cardSetCode, player, cardDataGetter);
                Contract.assertTrue(deckCard.isPlayable());
                result.deckCards.push(deckCard);
            }
        }

        // base
        const baseCard = await this.buildCardFromSetCodeAsync(this.base, player, cardDataGetter);
        Contract.assertTrue(baseCard.isBase());
        result.base = baseCard;

        // leader
        const leaderCard = await this.buildCardFromSetCodeAsync(this.leader, player, cardDataGetter);
        Contract.assertTrue(leaderCard.isLeader());
        result.leader = leaderCard;

        result.allCards.push(...result.deckCards);
        result.allCards.push(result.base);
        result.allCards.push(result.leader);

        return result;
    }

    private convertMapToCardList(cardsMap: Map<string, number>): ISwuDbCardEntry[] {
        return Array.from(cardsMap.entries())
            .filter(([_id, count]) => count > 0)
            .map(([id, count]) => ({ id, count }));
    }

    private async buildCardFromSetCodeAsync(
        setCode: string,
        player: Player,
        cardDataGetter: CardDataGetter
    ) {
        const cardData = await cardDataGetter.getCardBySetCodeAsync(setCode);

        const CardConstructor = cards.get(cardData.id) ?? CardHelpers.createUnimplementedCard;
        const card: Card = new CardConstructor(player, cardData);

        return card;
    }
}
