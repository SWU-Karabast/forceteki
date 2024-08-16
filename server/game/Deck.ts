import { CardType, Location } from './core/Constants';
import { BaseCard } from './core/card/BaseCard';
import { LeaderCard } from './core/card/LeaderCard';
import Card from './core/card/Card';
import { cards } from './cardImplementations/Index';
import Player from './core/Player';

export class Deck {
    constructor(public data: any) {}

    prepare(player: Player) {
        const result = {
            deckCards: [] as Card[],
            outOfPlayCards: [],
            outsideTheGameCards: [] as Card[],
            base: undefined as BaseCard | undefined,
            leader: undefined as LeaderCard | undefined,
            allCards: [] as Card[]
        };

        //deck
        for (const { count, card } of this.data.deckCards ?? []) {
            for (let i = 0; i < count; i++) {
                const CardConstructor = cards.get(card.id) ?? Card;
                // @ts-expect-error
                const deckCard: Card = new CardConstructor(player, card);
                deckCard.location = Location.Deck;
                result.deckCards.push(deckCard);
            }
        }

        //leader & base
        for (const { count, card } of this.data.base ?? []) {
            for (let i = 0; i < count; i++) {
                if (card?.types.includes(CardType.Base)) {
                    const CardConstructor = cards.get(card.id) ?? BaseCard;
                    // @ts-expect-error
                    const baseCard: BaseCard = new CardConstructor(player, card);
                    baseCard.location = '' as any;
                    result.base = baseCard;
                }
            }
        }
        for (const { count, card } of this.data.leader ?? []) {
            for (let i = 0; i < count; i++) {
                if (card?.types.includes(CardType.Leader)) {
                    const CardConstructor = cards.get(card.id) ?? LeaderCard;
                    // @ts-expect-error
                    const leaderCard: LeaderCard = new CardConstructor(player, card);
                    result.leader = leaderCard;
                }
            }
        }

        for (const cardData of this.data.outsideTheGameCards ?? []) {
            const CardConstructor = cards.get(cardData.id) ?? Card;
            // @ts-expect-error
            const card: Card = new CardConstructor(player, cardData);
            card.location = Location.OutsideTheGame;
            result.outsideTheGameCards.push(card);
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
