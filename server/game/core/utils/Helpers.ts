import { Card } from '../card/Card';
import { Aspect, CardType, CardTypeFilter, ZoneName } from '../Constants';
import * as Contract from './Contract';
import * as EnumHelpers from './EnumHelpers';

/* Randomize array in-place using Durstenfeld shuffle algorithm */
export function shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export function randomItem<T>(array: T[]): undefined | T {
    const j = Math.floor(Math.random() * array.length);
    return array[j];
}

export type Derivable<T extends boolean | string | number | any[], C> = T | ((context: C) => T);

export function derive<T extends boolean | string | number | any[], C>(input: Derivable<T, C>, context: C): T {
    return typeof input === 'function' ? input(context) : input;
}

export function countUniqueAspects(cards: Card | Card[]): number {
    const aspects = new Set<Aspect>();
    const cardsArray = Array.isArray(cards) ? cards : [cards];
    cardsArray.forEach((card) => {
        card.aspects.forEach((aspect) => aspects.add(aspect));
    });
    return aspects.size;
}

export function shuffle<T>(array: T[]): T[] {
    const shuffleArray = [...array];
    for (let i = shuffleArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffleArray[i], shuffleArray[j]] = [shuffleArray[j], shuffleArray[i]];
    }
    return shuffleArray;
}

export function defaultLegalLocationsForCardTypeFilter(cardTypeFilter: CardTypeFilter) {
    const cardTypes = EnumHelpers.getCardTypesForFilter(cardTypeFilter);

    const locations = new Set<ZoneName>();

    cardTypes.forEach((cardType) => {
        const legalLocations = defaultLegalLocationsForCardType(cardType);
        legalLocations.forEach((location) => locations.add(location));
    });

    return Array.from(locations);
}

export function defaultLegalLocationsForCardType(cardType: CardType) {
    const drawCardLocations = [
        ZoneName.Hand,
        ZoneName.Deck,
        ZoneName.Discard,
        ZoneName.RemovedFromGame,
        ZoneName.SpaceArena,
        ZoneName.GroundArena,
        ZoneName.Resource
    ];

    switch (cardType) {
        case CardType.TokenUnit:
        case CardType.TokenUpgrade:
            return [ZoneName.SpaceArena, ZoneName.GroundArena, ZoneName.OutsideTheGame];
        case CardType.LeaderUnit:
            return [ZoneName.SpaceArena, ZoneName.GroundArena];
        case CardType.Base:
        case CardType.Leader:
            return [ZoneName.Base];
        case CardType.BasicUnit:
        case CardType.BasicUpgrade:
        case CardType.Event:
            return drawCardLocations;
        default:
            Contract.fail(`Unknown card type: ${cardType}`);
            return null;
    }
}

export function asArray<T>(val: T | T[]): T[] {
    if (val == null) {
        return [];
    }

    return Array.isArray(val) ? val : [val];
}