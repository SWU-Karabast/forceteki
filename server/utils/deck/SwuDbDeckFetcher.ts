import { logger } from '../../logger';
import type { ISwuDbFormatDecklist } from './DeckInterfaces';
import { DeckFetchError } from './DeckFetchError';

/**
 * Typed error returned from {@link SwuDbDeckFetcher.fetchAsync}. The HTTP
 * `status` and user-facing `message` are designed to be passed through to the
 * client unchanged so the existing FE error-handling UX is preserved.
 */
export class SwuDbFetchError extends DeckFetchError {
    public constructor(status: number, message: string) {
        super(status, message);
        this.name = 'SwuDbFetchError';
    }
}

interface ISwuDbApiResponse {
    metadata?: { name?: string; author?: string };
    leader?: { id?: string; count?: number };
    secondleader?: { id?: string; count?: number } | null;
    base?: { id?: string; count?: number };
    deck?: { id?: string; count?: number }[];
    sideboard?: { id?: string; count?: number }[];
}

/**
 * Resolves a swudb.com deck-share URL into an {@link ISwuDbFormatDecklist} by
 * calling swudb's public deck-export API. Mirrors the upstream-error to
 * client-error mapping previously implemented in the Amplify Next.js route at
 * `forceteki-client/src/app/api/swudbdeck/route.ts` so the FE messaging is
 * preserved when the call is moved to the backend.
 */
export class SwuDbDeckFetcher {
    private static readonly TIMEOUT_MS = 8000;
    private static readonly MAX_ATTEMPTS = 2; // 1 initial + 1 retry on 5xx / network

    public async fetchAsync(deckLink: string): Promise<ISwuDbFormatDecklist> {
        if (typeof deckLink !== 'string' || deckLink.trim().length === 0) {
            throw new SwuDbFetchError(400, 'Invalid deckLink format');
        }

        if (!deckLink.includes('swudb.com')) {
            throw new SwuDbFetchError(400, 'Invalid deckLink format');
        }

        const match = deckLink.match(/\/([^\/]+)\/?$/);
        const deckId = match ? match[1] : null;
        if (!deckId) {
            throw new SwuDbFetchError(400, 'Invalid deckLink format');
        }

        const apiUrl = `https://swudb.com/api/getDeckJson/${deckId}`;
        const response = await this.fetchWithRetryAsync(apiUrl);

        if (!response.ok) {
            if (response.status === 403) {
                throw new SwuDbFetchError(403, 'Deck is set to Private. Change deck to unlisted on swudb');
            }
            if (response.status === 404) {
                throw new SwuDbFetchError(404, 'Deck not found. Make sure the deck exists on swudb.com.');
            }
            logger.error(`SwuDbDeckFetcher: SWUDB API error: ${response.status} ${response.statusText}`);
            throw new SwuDbFetchError(502, `SWUDB API error: ${response.statusText || response.status}`);
        }

        let raw: ISwuDbApiResponse;
        try {
            raw = await response.json() as ISwuDbApiResponse;
        } catch (err) {
            logger.error('SwuDbDeckFetcher: Failed to parse SWUDB API response as JSON', err);
            throw new SwuDbFetchError(502, 'SWUDB API error: invalid response body');
        }

        return {
            metadata: {
                name: raw.metadata?.name ?? '',
                author: raw.metadata?.author ?? '',
            },
            leader: raw.leader as ISwuDbFormatDecklist['leader'],
            secondleader: raw.secondleader as ISwuDbFormatDecklist['secondleader'],
            base: raw.base as ISwuDbFormatDecklist['base'],
            deck: raw.deck as ISwuDbFormatDecklist['deck'],
            sideboard: raw.sideboard as ISwuDbFormatDecklist['sideboard'],
            deckID: deckId,
            deckLink,
        };
    }

    private async fetchWithRetryAsync(apiUrl: string): Promise<Response> {
        let lastNetworkError: unknown = null;
        for (let attempt = 1; attempt <= SwuDbDeckFetcher.MAX_ATTEMPTS; attempt++) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), SwuDbDeckFetcher.TIMEOUT_MS);
                try {
                    const response = await fetch(apiUrl, {
                        method: 'GET',
                        signal: controller.signal,
                    });

                    // retry on 5xx
                    if (response.status >= 500 && response.status < 600 && attempt < SwuDbDeckFetcher.MAX_ATTEMPTS) {
                        logger.warn(`SwuDbDeckFetcher: SWUDB API returned ${response.status}, retrying (attempt ${attempt})`);
                        continue;
                    }

                    return response;
                } finally {
                    clearTimeout(timeout);
                }
            } catch (err) {
                lastNetworkError = err;
                const isAbort = err instanceof Error && err.name === 'AbortError';
                if (attempt < SwuDbDeckFetcher.MAX_ATTEMPTS && !isAbort) {
                    logger.warn(`SwuDbDeckFetcher: network error on attempt ${attempt}, retrying`, err);
                    continue;
                }
                if (isAbort) {
                    throw new SwuDbFetchError(504, 'SWUDB API request timed out');
                }
                break;
            }
        }

        logger.error('SwuDbDeckFetcher: Failed to fetch from SWUDB API', lastNetworkError);
        throw new SwuDbFetchError(502, 'SWUDB API error: network failure');
    }
}
