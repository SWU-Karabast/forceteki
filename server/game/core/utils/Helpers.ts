import type seedrandom from 'seedrandom';
import type { Card } from '../card/Card';
import type { Aspect, CardTypeFilter } from '../Constants';
import { CardType, ZoneName } from '../Constants';
import * as Contract from './Contract';
import * as EnumHelpers from './EnumHelpers';

/* Randomize array in-place using Durstenfeld shuffle algorithm */
export function shuffleArray<T>(array: T[], randomGenerator: seedrandom): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(randomGenerator() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export function randomItem<T>(array: T[], randomGenerator: seedrandom): undefined | T {
    const j = Math.floor(randomGenerator() * array.length);
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

// TODO: remove this
/** @deprecated Use `shuffleArray` instead */
export function shuffle<T>(array: T[], randomGenerator: seedrandom): T[] {
    const shuffleArray = [...array];
    for (let i = shuffleArray.length - 1; i > 0; i--) {
        const j = Math.floor(randomGenerator() * (i + 1));
        [shuffleArray[i], shuffleArray[j]] = [shuffleArray[j], shuffleArray[i]];
    }
    return shuffleArray;
}

export function defaultLegalZonesForCardTypeFilter(cardTypeFilter: CardTypeFilter) {
    const cardTypes = EnumHelpers.getCardTypesForFilter(cardTypeFilter);

    const zones = new Set<ZoneName>();

    cardTypes.forEach((cardType) => {
        const legalZones = defaultLegalZonesForCardType(cardType);
        legalZones.forEach((zone) => zones.add(zone));
    });

    return Array.from(zones);
}

export function defaultLegalZonesForCardType(cardType: CardType) {
    const drawCardZones = [
        ZoneName.Hand,
        ZoneName.Deck,
        ZoneName.Discard,
        ZoneName.OutsideTheGame,
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
            return drawCardZones;
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

export function getRandomArrayElements(array: any[], nValues: number, randomGenerator: seedrandom) {
    Contract.assertTrue(nValues <= array.length, `Attempting to retrieve ${nValues} random elements from an array of length ${array.length}`);

    const chosenItems = [];
    for (let i = 0; i < nValues; i++) {
        const index = Math.floor(randomGenerator() * array.length);
        const choice = array.splice(index, 1)[0];

        chosenItems.push(choice);
    }

    return chosenItems;
}

export class IntersectingSet<T> extends Set<T> {
    public intersect(inputSet: Set<T>): void {
        for (const item of this) {
            if (!inputSet.has(item)) {
                this.delete(item);
            }
        }
    }
}

/**
 * Splits an array into two based on a condition applied to each element.
 */
export function splitArray<T>(ara: T[], condition: (item: T) => boolean) {
    const results = {
        trueAra: [] as T[],
        falseAra: [] as T[]
    };

    for (const item of ara) {
        if (condition(item)) {
            results.trueAra.push(item);
        } else {
            results.falseAra.push(item);
        }
    }

    return results;
}

export function mergeNumericProperty<TPropertySet extends { [key in TPropName]?: number }, TPropName extends string>(
    propertySet: TPropertySet,
    newPropName: TPropName,
    newPropValue: number
): TPropertySet {
    return mergeProperty(propertySet, newPropName, newPropValue, (oldValue, newValue) => oldValue + newValue);
}

export function mergeArrayProperty<TPropertySet extends { [key in TPropName]?: any[] }, TPropName extends string>(
    propertySet: TPropertySet,
    newPropName: TPropName,
    newPropValue: any[]
): TPropertySet {
    return mergeProperty(propertySet, newPropName, newPropValue, (oldValue, newValue) => oldValue.concat(newValue));
}

function mergeProperty<TPropertySet extends { [key in TPropName]?: TMergeProperty }, TMergeProperty, TPropName extends string>(
    propertySet: TPropertySet,
    newPropName: TPropName,
    newPropValue: TMergeProperty,
    mergeFn: (oldValue: TMergeProperty, newValue: TMergeProperty) => TMergeProperty
): TPropertySet {
    if (propertySet == null) {
        return Object.assign({}, { [newPropName]: newPropValue }) as TPropertySet;
    }

    if (!propertySet.hasOwnProperty(newPropName)) {
        return { ...propertySet, [newPropName]: newPropValue };
    }

    const oldPropValue = propertySet[newPropName] as TMergeProperty;
    return { ...propertySet, [newPropName]: mergeFn(oldPropValue, newPropValue) };
}
