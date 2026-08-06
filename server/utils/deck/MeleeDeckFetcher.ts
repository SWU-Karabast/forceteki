import { logger } from '../../logger';
import type { CardDataGetter } from '../cardData/CardDataGetter';
import { DeckFetchError } from './DeckFetchError';
import type { ISwuDbFormatDecklist } from './DeckInterfaces';

export class MeleeFetchError extends DeckFetchError {
    public constructor(status: number, message: string) {
        super(status, message);
        this.name = 'MeleeFetchError';
    }
}

export class MeleeDeckFetcher {
    private static readonly TIMEOUT_MS = 8000;
    private static readonly MAX_ATTEMPTS = 2; // 1 initial + 1 retry on 5xx / network
    private static readonly DECK_LINK_REGEX = /^https?:\/\/(?:www\.)?melee\.gg\/Decklist\/View\/([^/?#]+)\/?(?:[?#].*)?$/i;

    public constructor(private readonly cardDataGetter: CardDataGetter) {
    }

    public async fetchAsync(deckLink: string): Promise<ISwuDbFormatDecklist> {
        const normalizedDeckLink = typeof deckLink === 'string' ? deckLink.trim() : '';
        const match = normalizedDeckLink.match(MeleeDeckFetcher.DECK_LINK_REGEX);
        const deckId = match ? match[1] : null;
        if (!deckId) {
            throw new MeleeFetchError(400, 'Invalid deckLink format');
        }

        const response = await this.fetchWithRetryAsync(normalizedDeckLink);

        if (!response.ok) {
            if (response.status === 404) {
                throw new MeleeFetchError(404, 'Deck not found. Make sure the deck exists on melee.gg.');
            }
            logger.error(`MeleeDeckFetcher: melee.gg error: ${response.status} ${response.statusText}`);
            throw new MeleeFetchError(502, `Melee API error: ${response.statusText || response.status}`);
        }

        let html: string;
        try {
            html = await response.text();
        } catch (err) {
            logger.error('MeleeDeckFetcher: Failed to read melee.gg response body', err);
            throw new MeleeFetchError(502, 'Melee deck import failed: invalid response body');
        }

        let deck: ISwuDbFormatDecklist | null;
        try {
            deck = this.parseDeckHtml(html, deckId, normalizedDeckLink);
        } catch (err) {
            logger.error('MeleeDeckFetcher: Failed to parse melee.gg deck page', err);
            throw new MeleeFetchError(502, 'Melee deck import failed: invalid deck page format');
        }

        if (!deck) {
            throw new MeleeFetchError(502, 'Melee deck import failed: invalid deck page format');
        }

        return deck;
    }

    private parseDeckHtml(html: string, deckId: string, deckLink: string): ISwuDbFormatDecklist | null {
        const deck: ISwuDbFormatDecklist = {
            metadata: {
                name: this.extractFirstClassText(html, 'decklist-title') ?? '',
                author: '',
            },
            leader: undefined,
            secondleader: undefined,
            base: undefined,
            deck: [],
            sideboard: [],
            deckID: deckId,
            deckLink,
        };

        const categories = this.extractClassBlocks(html, 'decklist-category');
        if (categories.length === 0) {
            logger.error('MeleeDeckFetcher: deck page did not contain decklist categories');
            return null;
        }

        for (const category of categories) {
            const categoryTitle = this.extractFirstClassText(category, 'decklist-category-title') ?? '';
            const records = this.extractClassBlocks(category, 'decklist-record');

            if (categoryTitle === 'Leader (1)' || categoryTitle === 'Base (1)') {
                const firstCardName = records.length > 0 ? this.extractFirstClassText(records[0], 'decklist-record-name') : null;
                const setCode = firstCardName ? this.getSetCodeFromMeleeName(firstCardName) : null;
                if (setCode && categoryTitle === 'Leader (1)') {
                    deck.leader = { id: setCode, count: 1 };
                } else if (setCode && categoryTitle === 'Base (1)') {
                    deck.base = { id: setCode, count: 1 };
                }
                continue;
            }

            for (const record of records) {
                const quantityText = this.extractFirstClassText(record, 'decklist-record-quantity');
                const cardName = this.extractFirstClassText(record, 'decklist-record-name');
                const count = quantityText ? Number.parseInt(quantityText, 10) : Number.NaN;
                const setCode = cardName ? this.getSetCodeFromMeleeName(cardName) : null;

                if (!Number.isFinite(count) || !setCode) {
                    continue;
                }

                const card = { id: setCode, count };
                if (categoryTitle.toLowerCase().includes('sideboard')) {
                    deck.sideboard.push(card);
                } else {
                    deck.deck.push(card);
                }
            }
        }

        if (!deck.leader?.id || !deck.base?.id) {
            logger.error('MeleeDeckFetcher: deck page did not contain a parseable leader and base');
            return null;
        }

        return deck;
    }

    private getSetCodeFromMeleeName(cardName: string): string | null {
        const [rawTitle, rawSubtitle] = cardName.split('|');
        const title = this.normalizeMeleeCardName(rawTitle);
        const subtitle = rawSubtitle ? this.normalizeMeleeCardName(rawSubtitle) : undefined;
        const key = subtitle ? `${title}|${subtitle}` : title;

        for (const [setCode, cardId] of this.cardDataGetter.setCodeMap.entries()) {
            const card = this.cardDataGetter.cardMap.get(cardId);
            if (!card) {
                continue;
            }

            const cardKey = card.subtitle
                ? `${this.normalizeMeleeCardName(card.title)}|${this.normalizeMeleeCardName(card.subtitle)}`
                : this.normalizeMeleeCardName(card.title);
            if (cardKey === key) {
                return setCode;
            }
        }

        logger.warn(`MeleeDeckFetcher: melee.gg card not found: ${cardName}`);
        return null;
    }

    private normalizeMeleeCardName(value: string): string {
        return value.trim()
            .replace(/["“”]/g, '\'')
            .replace(/\s+/g, ' ')
            .replace(/\bOrellios\b/g, 'Orrelios')
            .replace(/\bC-3P0\b/g, 'C-3PO');
    }

    private extractClassBlocks(html: string, className: string): string[] {
        const divRegex = /<div\b[^>]*class=["']([^"']*)["'][^>]*>/gi;
        const matches = Array.from(html.matchAll(divRegex))
            .filter((match) => this.hasClass(match[1], className));

        return matches.map((match, index) => {
            const start = match.index ?? 0;
            const end = matches[index + 1]?.index ?? html.length;
            return html.slice(start, end);
        });
    }

    private extractFirstClassText(html: string, className: string): string | null {
        const tagRegex = /<([a-z0-9]+)\b[^>]*class=["']([^"']*)["'][^>]*>/gi;
        for (const match of html.matchAll(tagRegex)) {
            if (this.hasClass(match[2], className)) {
                const contentStart = (match.index ?? 0) + match[0].length;
                const contentEnd = html.indexOf(`</${match[1]}>`, contentStart);
                if (contentEnd >= 0) {
                    return this.decodeHtml(this.stripTags(html.slice(contentStart, contentEnd))).trim();
                }
            }
        }

        return null;
    }

    private hasClass(classAttribute: string, className: string): boolean {
        return classAttribute.split(/\s+/).includes(className);
    }

    private stripTags(html: string): string {
        return html.replace(/<[^>]*>/g, '');
    }

    private decodeHtml(value: string): string {
        return value
            .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 10)))
            .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, '\'')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
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
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        },
                        signal: controller.signal,
                    });

                    if (response.status >= 500 && response.status < 600 && attempt < MeleeDeckFetcher.MAX_ATTEMPTS) {
                        logger.warn(`MeleeDeckFetcher: melee.gg returned ${response.status}, retrying (attempt ${attempt})`);
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

        logger.error('MeleeDeckFetcher: Failed to fetch from melee.gg', lastNetworkError);
        throw new MeleeFetchError(502, 'Melee API error: network failure');
    }
}
