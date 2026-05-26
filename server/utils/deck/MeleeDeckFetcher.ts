import { logger } from '../../logger';
import type { CardDataGetter } from '../cardData/CardDataGetter';
import type { ISwuDbFormatCardEntry, ISwuDbFormatDecklist } from './DeckInterfaces';

export class MeleeFetchError extends Error {
    public readonly status: number;

    public constructor(status: number, message: string) {
        super(message);
        this.name = 'MeleeFetchError';
        this.status = status;
    }
}

interface IMeleeCardRecord {
    n?: string;
    s?: string | null;
    q?: number;
}

interface IMeleeComponent {
    ComponentDescription?: string;
    CardRecords?: IMeleeCardRecord[];
}

interface IMeleeDecklistResponse {
    Guid?: string;
    DecklistName?: string;
    Components?: IMeleeComponent[];
}

interface ICardLookupEntry {
    setCode: string;
}

export class MeleeDeckFetcher {
    private static readonly TIMEOUT_MS = 8000;
    private static readonly MAX_ATTEMPTS = 2;

    private readonly cardLookupPromise: Promise<Map<string, ICardLookupEntry[]>>;

    public constructor(cardDataGetter: CardDataGetter) {
        this.cardLookupPromise = this.buildCardLookupAsync(cardDataGetter);
    }

    public async fetchAsync(deckLink: string): Promise<ISwuDbFormatDecklist> {
        if (typeof deckLink !== 'string' || deckLink.trim().length === 0) {
            throw new MeleeFetchError(400, 'Invalid deckLink format');
        }

        const deckId = this.extractDeckId(deckLink);
        if (!deckId) {
            throw new MeleeFetchError(400, 'Invalid deckLink format');
        }

        const apiUrl = `https://melee.gg/Decklist/GetDecklistDetails?id=${encodeURIComponent(deckId)}`;
        const response = await this.fetchWithRetryAsync(apiUrl);

        if (!response.ok) {
            if (response.status === 404) {
                throw new MeleeFetchError(404, 'Deck not found. Make sure the deck exists on melee.gg.');
            }

            logger.error(`MeleeDeckFetcher: Melee API error: ${response.status} ${response.statusText}`);
            throw new MeleeFetchError(502, `Melee API error: ${response.statusText || response.status}`);
        }

        let raw: IMeleeDecklistResponse;
        try {
            raw = await response.json() as IMeleeDecklistResponse;
        } catch (err) {
            logger.error('MeleeDeckFetcher: Failed to parse Melee API response as JSON', err);
            throw new MeleeFetchError(502, 'Melee API error: invalid response body');
        }

        return this.convertToDecklist(raw, deckId, deckLink);
    }

    private extractDeckId(deckLink: string): string | null {
        try {
            const parsedUrl = new URL(deckLink);
            if (parsedUrl.hostname.replace(/^www\./, '').toLowerCase() !== 'melee.gg') {
                return null;
            }

            const match = parsedUrl.pathname.match(/\/Decklist\/View\/([^/]+)\/?$/i);
            return match?.[1] ?? null;
        } catch {
            return null;
        }
    }

    private async convertToDecklist(raw: IMeleeDecklistResponse, deckId: string, deckLink: string): Promise<ISwuDbFormatDecklist> {
        const components = raw.Components ?? [];
        const leader = await this.convertSingleCardRecord(this.getComponentRecords(components, 'Leader')[0], 'leader');
        const base = await this.convertSingleCardRecord(this.getComponentRecords(components, 'Base')[0], 'base');
        const deck = await this.convertCardRecords(
            components
                .filter((component) => !['Leader', 'Base', 'Sideboard'].includes(component.ComponentDescription ?? ''))
                .flatMap((component) => component.CardRecords ?? [])
        );
        const sideboard = await this.convertCardRecords(this.getComponentRecords(components, 'Sideboard'));

        return {
            metadata: {
                name: raw.DecklistName ?? '',
                author: '',
            },
            leader,
            secondleader: null,
            base,
            deck,
            sideboard,
            deckID: raw.Guid ?? deckId,
            deckLink,
        };
    }

    private getComponentRecords(components: IMeleeComponent[], description: string): IMeleeCardRecord[] {
        return components.find((component) => component.ComponentDescription === description)?.CardRecords ?? [];
    }

    private async convertSingleCardRecord(record: IMeleeCardRecord | undefined, location: string): Promise<ISwuDbFormatCardEntry> {
        if (!record) {
            throw new MeleeFetchError(502, `Melee API error: missing ${location}`);
        }

        const [converted] = await this.convertCardRecords([record]);
        return { ...converted, count: 1 };
    }

    private async convertCardRecords(records: IMeleeCardRecord[]): Promise<ISwuDbFormatCardEntry[]> {
        const lookup = await this.cardLookupPromise;
        return records.map((record) => {
            const key = MeleeDeckFetcher.buildCardLookupKey(record.n, record.s);
            const matches = lookup.get(key) ?? [];
            if (matches.length === 0) {
                throw new MeleeFetchError(502, `Melee API error: unknown card ${record.n}${record.s ? `, ${record.s}` : ''}`);
            }

            return {
                id: matches[0].setCode,
                count: record.q ?? 0,
            };
        });
    }

    private async buildCardLookupAsync(cardDataGetter: CardDataGetter): Promise<Map<string, ICardLookupEntry[]>> {
        const lookup = new Map<string, ICardLookupEntry[]>();
        for (const cardId of cardDataGetter.cardIds) {
            const cardData = await cardDataGetter.getCardAsync(cardId);
            const key = MeleeDeckFetcher.buildCardLookupKey(cardData.title, cardData.subtitle);
            const entries = lookup.get(key) ?? [];
            entries.push({
                setCode: `${cardData.setId.set}_${String(cardData.setId.number).padStart(3, '0')}`,
            });
            lookup.set(key, entries);
        }

        return lookup;
    }

    private static buildCardLookupKey(title?: string, subtitle?: string | null): string {
        return `${MeleeDeckFetcher.normalizeCardName(title)}|${MeleeDeckFetcher.normalizeCardName(subtitle ?? '')}`;
    }

    private static normalizeCardName(value?: string | null): string {
        return (value ?? '')
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '')
            .toLowerCase();
    }

    private async fetchWithRetryAsync(apiUrl: string): Promise<Response> {
        let lastNetworkError: unknown = null;
        for (let attempt = 1; attempt <= MeleeDeckFetcher.MAX_ATTEMPTS; attempt++) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), MeleeDeckFetcher.TIMEOUT_MS);
                try {
                    const response = await fetch(apiUrl, {
                        method: 'GET',
                        signal: controller.signal,
                    });

                    if (response.status >= 500 && response.status < 600 && attempt < MeleeDeckFetcher.MAX_ATTEMPTS) {
                        logger.warn(`MeleeDeckFetcher: Melee API returned ${response.status}, retrying (attempt ${attempt})`);
                        continue;
                    }

                    return response;
                } finally {
                    clearTimeout(timeout);
                }
            } catch (err) {
                lastNetworkError = err;
                const isAbort = err instanceof Error && err.name === 'AbortError';
                if (attempt < MeleeDeckFetcher.MAX_ATTEMPTS && !isAbort) {
                    logger.warn(`MeleeDeckFetcher: network error on attempt ${attempt}, retrying`, err);
                    continue;
                }
                if (isAbort) {
                    throw new MeleeFetchError(504, 'Melee API request timed out');
                }
                break;
            }
        }

        logger.error('MeleeDeckFetcher: Failed to fetch from Melee API', lastNetworkError);
        throw new MeleeFetchError(502, 'Melee API error: network failure');
    }
}
