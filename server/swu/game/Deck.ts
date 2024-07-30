import { GameModes } from '../GameModes';
import { CardTypes, Locations } from './Constants';
import { BaseLocationCard } from './card/baseLocationCard';
import { LeaderCard } from './card/leaderCard';
import BaseCard from './card/basecard';
import { cards } from './cards';
import Player from './player';

export class Deck {
    constructor(public data: any) {}

    prepare(player: Player) {
        const result = {
            deckCards: [] as BaseCard[],
            outOfPlayCards: [],
            outsideTheGameCards: [] as BaseCard[],
            base: undefined as BaseLocationCard | undefined,
            leader: undefined as LeaderCard | undefined,
            allCards: [] as BaseCard[]
        };

        //deck
        for (const { count, card } of this.data.deckCards ?? []) {
            for (let i = 0; i < count; i++) {
                const CardConstructor = cards.get(card.id) ?? BaseCard;
                // @ts-ignore
                const deckCard: BaseCard = new CardConstructor(player, card);
                deckCard.location = Locations.Deck;
                result.deckCards.push(deckCard);
            }
        }

        //leader & base
        for (const { count, card } of this.data.base ?? []) {
            for (let i = 0; i < count; i++) {
                if (card?.type === CardTypes.Base) {
                    const CardConstructor = cards.get(card.id) ?? BaseLocationCard;
                    // @ts-ignore
                    const baseCard: BaseLocationCard = new CardConstructor(player, card);
                    baseCard.location = '' as any;
                    result.base = baseCard;
                }
            }
        }
        for (const { count, card } of this.data.leader ?? []) {
            for (let i = 0; i < count; i++) {
                if (card?.type === CardTypes.Leader) {
                    const CardConstructor = cards.get(card.id) ?? LeaderCard;
                    // @ts-ignore
                    const leaderCard: LeaderCard = new CardConstructor(player, card);
                    result.leader = leaderCard;
                }
            }
        }

        for (const cardData of this.data.outsideTheGameCards ?? []) {
            const CardConstructor = cards.get(cardData.id) ?? BaseCard;
            // @ts-ignore
            const card: BaseCard = new CardConstructor(player, cardData);
            card.location = Locations.OutsideTheGame;
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