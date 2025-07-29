import type { Card } from '../card/Card';
import type { Aspect, CardTypeFilter } from '../Constants';
import type { IRandomness } from '../GameInterfaces';
import { CardType, ZoneName } from '../Constants';
import * as Contract from './Contract';
import * as EnumHelpers from './EnumHelpers';

/* Randomize array in-place using Durstenfeld shuffle algorithm */
export function shuffleArray<T>(array: T[], randomGenerator: IRandomness): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(randomGenerator.next() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export function randomItem<T>(array: T[], randomGenerator: IRandomness): undefined | T {
    const j = Math.floor(randomGenerator.next() * array.length);
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
export function shuffle<T>(array: T[], randomGenerator: IRandomness): T[] {
    const shuffleArray = [...array];
    for (let i = shuffleArray.length - 1; i > 0; i--) {
        const j = Math.floor(randomGenerator.next() * (i + 1));
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
        case CardType.NonLeaderUnitUpgrade:
        case CardType.LeaderUpgrade:
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

export const isDevelopment = () => process.env.ENVIRONMENT === 'development';

export function getSingleOrThrow<T>(val: T | T[]): T {
    Contract.assertNotNullLike(val);

    if (!Array.isArray(val)) {
        return val;
    }

    Contract.assertArraySize(val, 1);
    return val[0];
}

export function getRandomArrayElements(array: any[], nValues: number, randomGenerator: IRandomness) {
    Contract.assertTrue(nValues <= array.length, `Attempting to retrieve ${nValues} random elements from an array of length ${array.length}`);

    const chosenItems = [];
    for (let i = 0; i < nValues; i++) {
        const index = Math.floor(randomGenerator.next() * array.length);
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

/**
 * Splits an array into two based on a condition applied to each element.
 */
export function partitionArray<T>(ara: T[], condition: (item: T) => boolean) {
    const trueCases: T[] = [];
    const falseCases: T[] = [];

    for (const item of ara) {
        if (condition(item)) {
            trueCases.push(item);
        } else {
            falseCases.push(item);
        }
    }

    return [trueCases, falseCases];
}

const defaultFilterCallback = (item) => item != null;

/** Combined array map then filter function. If filterCallback is not provided, it will default to "mapValue => mapValue != null" */
export function mapFilter<T extends Record<any, any>, U = any>(obj: T, mapCallback: (item: keyof T) => U, filterCallback?: (mapValue: U) => boolean) {
    const results: U[] = [];
    filterCallback ??= defaultFilterCallback;

    for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            const value = mapCallback(prop);
            if (filterCallback(value)) {
                results.push(value);
            }
        }
    }

    return results;
}

/** Combined array filter then map function. If filterCallback is not provided, it will default to "mapValue => mapValue != null" */
export function filterMap<T extends Record<any, any>, U = any>(obj: T, mapCallback: (item: keyof T) => U, filterCallback?: (mapValue: keyof T) => boolean) {
    const results: U[] = [];
    filterCallback ??= defaultFilterCallback;

    for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            if (filterCallback(prop)) {
                const value = mapCallback(prop);
                results.push(value);
            }
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

export function hasSomeMatch(text: string, regex: RegExp) {
    const matchIter = text.matchAll(regex);
    const match = matchIter.next();
    return !match.done;
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

    if (newPropValue == null) {
        return propertySet;
    }

    if (!propertySet.hasOwnProperty(newPropName) || propertySet[newPropName] == null) {
        return { ...propertySet, [newPropName]: newPropValue };
    }

    const oldPropValue = propertySet[newPropName] as TMergeProperty;
    return { ...propertySet, [newPropName]: mergeFn(oldPropValue, newPropValue) };
}

export function objectForEach<T extends Record<any, any>, TK extends Extract<keyof T, string> = Extract<keyof T, string>>(obj: T, fcn: (prop: TK, value?: T[TK]) => void) {
    for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            fcn(prop as TK, obj[prop] as T[TK]);
        }
    }
}

export type DistributiveOmit<T, K extends keyof T> = T extends any ? Omit<T, K> : never;

export function equalArrays<T>(first: T[], second: T[]): boolean {
    if (first === second) {
        return true;
    }

    if (first.length !== second.length) {
        return false;
    }

    for (let i = 0; i < first.length; i++) {
        if (first[i] !== second[i]) {
            return false;
        }
    }

    return true;
}

export function upperCaseFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function setIntersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    const intersection = new Set<T>();
    for (const item of setA) {
        if (setB.has(item)) {
            intersection.add(item);
        }
    }
    return intersection;
}

export function setUnion<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    const union = new Set<T>(setA);
    for (const item of setB) {
        union.add(item);
    }
    return union;
}

/**
 * Recurses through an object's properties and removes any properties that are null or undefined.
 * This is an _in-place_ operation, meaning it modifies the original object.
 */
export function deleteEmptyPropertiesRecursiveInPlace(obj) {
    deleteEmptyPropertiesRecursiveInPlaceInternal(obj, []);
}

function deleteEmptyPropertiesRecursiveInPlaceInternal(obj, visited) {
    if (obj == null || visited.includes(obj)) {
        return;
    }

    visited.push(obj);

    const keysToDelete = [];
    for (const key in obj) {
        if (obj[key] == null) {
            keysToDelete.push(key);
        } else if (obj[key] instanceof Object) {
            deleteEmptyPropertiesRecursiveInPlaceInternal(obj[key], visited);
        }
    }

    for (const key of keysToDelete) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete obj[key];
    }
}