import https from 'https';
import http from 'http';
import { shuffleArray } from './game/core/utils/Helpers';
import { CardType, Location } from './game/core/Constants';

export function escapeRegex(regex: string): string {
    return regex.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

export function httpRequest(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        const request = lib.get(url, (response) => {
            if (response.statusCode < 200 || response.statusCode > 299) {
                return reject(new Error('Failed to request, status code: ' + response.statusCode));
            }

            const body = [];

            response.on('data', (chunk) => {
                body.push(chunk);
            });

            response.on('end', () => {
                resolve(body.join(''));
            });
        });

        request.on('error', (err) => reject(err));
    });
}

export function wrapAsync(fn: any): any {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
}

export function detectBinary(state: unknown, path = '', results = []): { path: string; type: string }[] {
    if (!state) {
        return results;
    }

    const type = state.constructor.name;
    if (
        type !== 'Array' &&
        type !== 'Boolean' &&
        type !== 'Date' &&
        type !== 'Number' &&
        type !== 'Object' &&
        type !== 'String'
    ) {
        results.push({ path: path, type });
    }

    if (type === 'Object') {
        for (const key in state as object) {
            detectBinary(state[key], `${path}.${key}`, results);
        }
    } else if (type === 'Array') {
        for (let i = 0; i < (state as unknown[]).length; ++i) {
            detectBinary(state[i], `${path}[${i}]`, results);
        }
    }

    return results;
}

export function shuffle<T>(array: T[]): T[] {
    const shuffleArray = [...array];
    for (let i = shuffleArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffleArray[i], shuffleArray[j]] = [shuffleArray[j], shuffleArray[i]];
    }
    return shuffleArray;
}

/** Get the default legal locations for a card type set (usually from {@link Card.types}) */
export function defaultLegalLocationsForCardTypes(cardTypes: Set<CardType> | CardType | CardType[]) {
    let compareFn: (CardType) => boolean;
    if (cardTypes instanceof Set) {
        compareFn = (type: CardType) => cardTypes.has(type);
    } else if (cardTypes instanceof Array) {
        compareFn = (type: CardType) => cardTypes.includes(type);
    } else {
        compareFn = (type: CardType) => cardTypes === type;
    }

    const drawCardLocations = [
        Location.Hand,
        Location.Deck,
        Location.Discard,
        Location.RemovedFromGame,
        Location.SpaceArena,
        Location.GroundArena,
        Location.Resource
    ];

    if (compareFn(CardType.Token)) {
        return [Location.SpaceArena, Location.GroundArena];
    } else if (compareFn(CardType.Base)) {
        return [Location.Base];
    } else if (compareFn(CardType.Unit)) {
        return drawCardLocations;
    } else if (compareFn(CardType.Leader)) {
        // since we've already checked if the leader is deployed ('leader unit' type), this means undeployed leader
        return [Location.Leader];
    } else if (compareFn(CardType.Event)) {
        return [...drawCardLocations, Location.BeingPlayed];
    } else if (compareFn(CardType.Upgrade)) {
        return drawCardLocations;
    }
    return null;
}

export function asArray(val: any) {
    if (val == null) {
        return [];
    }

    return Array.isArray(val) ? val : [val];
}