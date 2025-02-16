import type { Card } from '../../game/core/card/Card';
import { cards } from '../../game/cards/Index';
import type Player from '../../game/core/Player';
import * as CardHelpers from '../../game/core/card/CardHelpers';
import * as Contract from '../../game/core/utils/Contract';
import type { ISwuDbCardEntry, ISwuDbDecklist, ISwuDbDecklistShort } from './DeckInterfaces';
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

    public constructor(decklist: ISwuDbDecklist | ISwuDbDecklistShort) {
        this.base = decklist.base.id;
        this.leader = decklist.leader.id;

        const sideboard = decklist.sideboard ?? [];

        this.deckCards = this.convertCardListToMap(decklist.deck);
        this.sideboard = this.convertCardListToMap(sideboard);
    }

    private convertCardListToMap(cardList: ISwuDbCardEntry[]) {
        const cardsMap = new Map<string, number>();
        for (const cardEntry of cardList) {
            cardsMap.set(cardEntry.id, cardEntry.count);
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

        // Decrement sideboard count and remove the card if count reaches 0
        const newSideboardCount = sideboardCount - 1;
        if (newSideboardCount === 0) {
            this.sideboard.delete(cardId);
        } else {
            this.sideboard.set(cardId, newSideboardCount);
        }

        // increment deck count and create card if it wasn't in the deck before
        const deckCount = this.deckCards.get(cardId) || 0;
        this.deckCards.set(cardId, deckCount + 1);
    }

    public moveToSideboard(cardId: string) {
        const deckCount = this.deckCards.get(cardId);

        Contract.assertNotNullLike(deckCount, `Card '${cardId}' is not in the decklist`);
        Contract.assertFalse(deckCount === 0, `All copies of '${cardId}' are already in the sideboard and cannot be moved from deck`);

        // Decrement deck count and remove the card if count reaches 0
        const newDeckCount = deckCount - 1;
        if (newDeckCount === 0) {
            this.deckCards.delete(cardId);
        } else {
            this.deckCards.set(cardId, newDeckCount);
        }
        // increment sideboard count and create card if it wasn't in the sideboard before
        const sideBoardCount = this.sideboard.get(cardId) || 0;
        this.sideboard.set(cardId, sideBoardCount + 1);
    }

    public getDecklist(): ISwuDbDecklistShort {
        return {
            leader: { id: this.leader, count: 1 },
            base: { id: this.base, count: 1 },
            deck: this.convertMapToCardList(this.deckCards),
            sideboard: this.convertMapToCardList(this.sideboard),
        };
    }

    public async buildCardsAsync(player: Player, cardDataGetter: CardDataGetter) {
        const result = {
            // there isn't a type that excludes tokens b/c tokens inherit from non-token types, so we manually check that that deck cards aren't tokens
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
