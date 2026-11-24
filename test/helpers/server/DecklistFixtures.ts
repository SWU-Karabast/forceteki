import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import type { ISwuDbFormatDecklist } from '../../../server/utils/deck/DeckInterfaces';
import type { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { buildTestDecklist } from '../../../server/utils/deck/TestDecklistBuilder';

export interface IDecklistFixtureOptions {
    format?: SwuGameFormat;
    cardPool?: CardPool;
    name?: string;
    author?: string;
}

/**
 * Builds decklists in the SWUDB wire format that the lobby and queue endpoints accept.
 *
 * Legal decklists come from {@link buildTestDecklist}, the same builder behind the development-only
 * `/api/test-deck` route: it picks cards from whatever the local card data says is legal for the requested format
 * and card pool rather than hardcoding them, so the fixtures keep working across card data refreshes, and it runs
 * every decklist through the real validator, so a card data change that would invalidate one fails with a clear
 * message instead of surfacing as a confusing 400 in an unrelated spec.
 */
export class DecklistFixtures {
    public constructor(private readonly deckValidator: DeckValidator) {}

    /**
     * A decklist that passes validation for the given format and card pool.
     */
    public validDecklist(options: IDecklistFixtureOptions = {}): ISwuDbFormatDecklist {
        return buildTestDecklist(this.deckValidator, {
            format: options.format ?? SwuGameFormat.Premier,
            cardPool: options.cardPool ?? CardPool.Current,
            name: options.name,
            author: options.author ?? 'server-test',
        });
    }

    /**
     * A decklist that is structurally well formed but too small to be legal, for exercising the
     * rejection path on endpoints that validate decks.
     */
    public undersizedDecklist(options: IDecklistFixtureOptions = {}): ISwuDbFormatDecklist {
        const format = options.format ?? SwuGameFormat.Premier;
        const cardPool = options.cardPool ?? CardPool.Current;
        const { leaders, bases, deckCards } = this.deckValidator.getDeckbuildingCandidates(format, cardPool);

        return {
            metadata: {
                name: options.name ?? 'Undersized Test Deck',
                author: options.author ?? 'server-test',
            },
            leader: { id: leaders[0], count: 1 },
            base: { id: bases[0], count: 1 },
            deck: [{ id: deckCards[0], count: 1 }],
        };
    }
}
