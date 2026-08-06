import { DeckFetchError } from './DeckFetchError';
import { DeckSource, type ISwuDbFormatDecklist } from './DeckInterfaces';
import type { MeleeDeckFetcher } from './MeleeDeckFetcher';
import type { SwuDbDeckFetcher } from './SwuDbDeckFetcher';

const unsupportedLinkMessage = 'Only swudb.com and melee.gg links are supported by this endpoint';

export const DeckLinkResolver = {
    unsupportedLinkMessage,

    getDeckSource(deckLink?: string): DeckSource {
        if (typeof deckLink !== 'string') {
            return DeckSource.Unknown;
        }

        if (isSwuDbDeckLink(deckLink)) {
            return DeckSource.SWUDB;
        }
        if (isMeleeDeckLink(deckLink)) {
            return DeckSource.Melee;
        }

        return DeckSource.Unknown;
    },

    isSupportedDeckLink(deckLink: string): boolean {
        return this.getDeckSource(deckLink) !== DeckSource.Unknown;
    },

    fetchDeckLinkAsync(
        deckLink: string,
        swuDbDeckFetcher: SwuDbDeckFetcher,
        meleeDeckFetcher: MeleeDeckFetcher
    ): Promise<ISwuDbFormatDecklist> {
        switch (this.getDeckSource(deckLink)) {
            case DeckSource.SWUDB:
                return swuDbDeckFetcher.fetchAsync(deckLink);
            case DeckSource.Melee:
                return meleeDeckFetcher.fetchAsync(deckLink);
            default:
                throw new DeckFetchError(400, unsupportedLinkMessage);
        }
    },
};

function isSwuDbDeckLink(deckLink: string): boolean {
    return (/^https?:\/\/(?:www\.)?swudb\.com\/.+/i).test(deckLink.trim());
}

function isMeleeDeckLink(deckLink: string): boolean {
    return (/^https?:\/\/(?:www\.)?melee\.gg\/Decklist\/View\/[^/?#]+\/?(?:[?#].*)?$/i).test(deckLink.trim());
}
