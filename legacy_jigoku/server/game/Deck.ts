import { GameModes } from '../GameModes';
import { CardTypes, Locations } from './Constants';
import { ProvinceCard } from './ProvinceCard';
import { RoleCard } from './RoleCard';
import { StrongholdCard } from './StrongholdCard';
import BaseCard from './basecard';
import { cards } from './cards';
import DrawCard from './drawcard';
import Player from './player';

export class Deck {
    constructor(public data: any) {}

    prepare(player: Player) {
        const result = {
            faction: this.data.faction,
            conflictCards: [] as DrawCard[],
            dynastyCards: [] as DrawCard[],
            provinceCards: [] as ProvinceCard[],
            outOfPlayCards: [],
            outsideTheGameCards: [] as DrawCard[],
            stronghold: undefined as StrongholdCard | undefined,
            role: undefined as RoleCard | undefined,
            allCards: [] as BaseCard[]
        };

        //conflict
        for (const { count, card } of this.data.conflictCards ?? []) {
            for (let i = 0; i < count; i++) {
                if (card?.side === 'conflict') {
                    const CardConstructor = cards.get(card.id) ?? DrawCard;
                    // @ts-ignore
                    const conflictCard: DrawCard = new CardConstructor(player, card);
                    conflictCard.location = Locations.ConflictDeck;
                    result.conflictCards.push(conflictCard);
                }
            }
        }

        //dynasty
        for (const { count, card } of this.data.dynastyCards ?? []) {
            for (let i = 0; i < count; i++) {
                if (card?.side === 'dynasty') {
                    const CardConstructor = cards.get(card.id) ?? DrawCard;
                    // @ts-ignore
                    const dynastyCard: DrawCard = new CardConstructor(player, card);
                    dynastyCard.location = Locations.DynastyDeck;
                    result.dynastyCards.push(dynastyCard);
                }
            }
        }

        //provinces
        if (player.game.gameMode !== GameModes.Skirmish) {
            for (const { count, card } of this.data.provinceCards ?? []) {
                for (let i = 0; i < count; i++) {
                    if (card?.type === CardTypes.Province) {
                        const CardConstructor = cards.get(card.id) ?? ProvinceCard;
                        // @ts-ignore
                        const provinceCard: ProvinceCard = new CardConstructor(player, card);
                        provinceCard.location = Locations.ProvinceDeck;
                        result.provinceCards.push(provinceCard);
                    }
                }
            }
        } else {
            for (let i = 0; i < 3; i++) {
                const provinceCard = new ProvinceCard(player, this.#makeSkirmishProvinceCardData(i));
                provinceCard.location = Locations.ProvinceDeck;
                result.provinceCards.push(provinceCard);
            }
        }

        //stronghold & role
        if (player.game.gameMode !== GameModes.Skirmish) {
            for (const { count, card } of this.data.stronghold ?? []) {
                for (let i = 0; i < count; i++) {
                    if (card?.type === CardTypes.Stronghold) {
                        const CardConstructor = cards.get(card.id) ?? StrongholdCard;
                        // @ts-ignore
                        const strongholdCard: StrongholdCard = new CardConstructor(player, card);
                        strongholdCard.location = '' as any;
                        result.stronghold = strongholdCard;
                    }
                }
            }
            for (const { count, card } of this.data.role ?? []) {
                for (let i = 0; i < count; i++) {
                    if (card?.type === CardTypes.Role) {
                        const CardConstructor = cards.get(card.id) ?? RoleCard;
                        // @ts-ignore
                        const roleCard: RoleCard = new CardConstructor(player, card);
                        result.role = roleCard;
                    }
                }
            }
        }

        for (const cardData of this.data.outsideTheGameCards ?? []) {
            const CardConstructor = cards.get(cardData.id) ?? DrawCard;
            // @ts-ignore
            const card: DrawCard = new CardConstructor(player, cardData);
            card.location = Locations.OutsideTheGame;
            result.outsideTheGameCards.push(card);
        }

        result.allCards.push(...result.provinceCards, ...result.conflictCards, ...result.dynastyCards);

        if (result.stronghold) {
            result.allCards.push(result.stronghold);
        }
        if (result.role) {
            result.allCards.push(result.role);
        }

        return result;
    }

    #makeSkirmishProvinceCardData(provinceNumber: number) {
        return {
            strength: 3,
            element: [] as string[],
            type: 'province',
            side: 'province',
            name: 'Skirmish Province',
            id: `skirmish-province-${provinceNumber}`
        } as const;
    }
}
