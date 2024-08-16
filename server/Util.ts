import https from 'https';
import http from 'http';
import { shuffleArray } from './game/core/utils/Helpers';

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