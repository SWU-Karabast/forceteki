import https from 'https';
import http from 'http';
import type { ISetCode } from './utils/cardData/CardDataInterfaces';

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

export function stringArraysEqual(ara1: string[], ara2: string[]): boolean {
    if ((ara1 == null || ara2 == null) && (ara1 !== ara2)) {
        return false;
    }

    if (ara1.length !== ara2.length) {
        return false;
    }

    ara1.sort();
    ara2.sort();

    for (let i = 0; i < ara1.length; i++) {
        if (ara1[i] !== ara2[i]) {
            return false;
        }
    }

    return true;
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

export function setCodeToString(setCodeObj: ISetCode): string {
    return `${setCodeObj.set}_${String(setCodeObj.number).padStart(3, '0')}`;
}
