import { CardType, ZoneName } from './core/Constants';
import { BaseCard } from './core/card/BaseCard';
import { LeaderCard } from './core/card/LeaderCard';
import { Card } from './core/card/Card';
import { cards } from './cards/Index';
import Player from './core/Player';
import * as CardHelpers from './core/card/CardHelpers';
import { TokenOrPlayableCard, TokenCard } from './core/card/CardTypes';
import * as Contract from './core/utils/Contract';

export class Deck {
    public constructor(public data: any) {}

    public prepare(player: Player) {
        const result = {
            // there isn't a type that excludes tokens b/c tokens inherit from non-token types, so we manually check that that deck cards aren't tokens
            deckCards: [] as TokenOrPlayableCard[],
            outOfPlayCards: [],
            outsideTheGameCards: [] as Card[],
            tokens: [] as TokenCard[],
            base: undefined as BaseCard | undefined,
            leader: undefined as LeaderCard | undefined,
            allCards: [] as Card[]
        };

        // deck
        for (const { count, card } of this.data.deckCards ?? []) {
            for (let i = 0; i < count; i++) {
                const CardConstructor = cards.get(card.id) ?? CardHelpers.createUnimplementedCard;
                const deckCard: Card = new CardConstructor(player, card);
                Contract.assertTrue(deckCard.isTokenOrPlayable() && !deckCard.isToken());
                result.deckCards.push(deckCard);
            }
        }

        // leader & base
        for (const { count, card } of this.data.base ?? []) {
            for (let i = 0; i < count; i++) {
                if (card?.types.includes(CardType.Base)) {
                    const CardConstructor = cards.get(card.id) ?? CardHelpers.createUnimplementedCard;
                    const baseCard = new CardConstructor(player, card);
                    Contract.assertTrue(baseCard.isBase());
                    result.base = baseCard;
                }
            }
        }
        for (const { count, card } of this.data.leader ?? []) {
            for (let i = 0; i < count; i++) {
                if (card?.types.includes(CardType.Leader)) {
                    const CardConstructor = cards.get(card.id) ?? CardHelpers.createUnimplementedCard;
                    const leaderCard = new CardConstructor(player, card);
                    Contract.assertTrue(leaderCard.isLeader());
                    result.leader = leaderCard;
                }
            }
        }

        result.allCards.push(...result.deckCards);

        if (result.base) {
            result.allCards.push(result.base);
        }
        if (result.leader) {
            result.allCards.push(result.leader);
        }

        return result;
    }

    public convertFromSwuDeck () {
        const result = {
            // there isn't a type that excludes tokens b/c tokens inherit from non-token types, so we manually check that that deck cards aren't tokens
            deckCards: [] as TokenOrPlayableCard[],
            base: [] as BaseCard[] | undefined,
            leader: [] as LeaderCard[] | undefined,
            sideboard: [] as TokenOrPlayableCard[],
            allCards: [] as Card[]
        };
        const deckCards = this.data.deck.map(({ id, count }) => {
            const cardData = { id: id };
            if (!cardData) {
                console.warn(`Card with ID ${id} not found.`);
            }
            return {
                count: count,
                card: cardData,
            };
        });
        const leader = [];
        if (this.data.leader) {
            const cardData = { id: this.data.leader.id };
            if (!cardData) {
                console.warn(`Leader card with ID ${this.data.leader.id} not found.`);
            }
            leader.push({
                count: this.data.leader.count,
                card: cardData,
            });
        }
        const base = [];
        if (this.data.base) {
            const cardData = { id: this.data.base.id };
            base.push({
                count: this.data.base.count,
                card: cardData,
            });
        }
        const sideboardCards = this.data.sideboard.map(({ id, count }) => {
            const cardData = { id: this.data.id };
            if (!cardData) {
                console.warn(`Sideboard card with ID ${id} not found.`);
            }
            return {
                count: count,
                card: cardData,
            };
        });
        result.deckCards = deckCards;
        result.leader = leader;
        result.base = base;
        result.sideboard = sideboardCards;
        result.allCards.push(...result.deckCards);

        if (result.base) {
            result.allCards.push(...result.base);
        }
        if (result.leader) {
            result.allCards.push(...result.leader);
        }
        if (result.sideboard) {
            result.allCards.push(...result.sideboard);
        }

        return result;
    }
}
