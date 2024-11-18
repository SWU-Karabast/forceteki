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
                Contract.assertTrue(deckCard.isTokenOrPlayable());
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
}
