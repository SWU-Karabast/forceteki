import type { CardPool, SwuGameFormat } from '../../game/core/Constants';
import { Contract } from '../../game/core/utils/Contract';
import type { IDeckValidationFailures, ISwuDbFormatCardEntry, ISwuDbFormatDecklist } from './DeckInterfaces';
import type { DeckValidator } from './DeckValidator';
import { formatRules } from './SwuSetData';

export interface ITestDecklistOptions {
    format: SwuGameFormat;
    cardPool: CardPool;

    /** Default `Test deck (<format>/<cardPool>)`. */
    name?: string;

    /** Default `Karabast local test`. */
    author?: string;
}

/** Copies of each card in a format with no copy limit (Limited), which keeps the deck varied. */
const copiesWithoutLimit = 3;

/**
 * Builds a legal decklist for a format and card pool from the cards the server knows, for local testing: the
 * development-only `/api/test-deck` route and the server specs' deck fixtures. The cards come from
 * {@link DeckValidator.getDeckbuildingCandidates}, so the deck stays legal as sets rotate and uses cards whose
 * abilities are implemented first. The decklist is checked with the validator before it is returned.
 * @throws if no legal decklist can be built for that format and card pool
 */
export function buildTestDecklist(deckValidator: DeckValidator, options: ITestDecklistOptions): ISwuDbFormatDecklist {
    const { format, cardPool } = options;
    const rules = formatRules.get(format);
    Contract.assertNotNullLike(rules, `No format rules found for format '${format}'`);

    const { leaders, bases, deckCards } = deckValidator.getDeckbuildingCandidates(format, cardPool);
    if (leaders.length < rules.leaderCount || bases.length === 0) {
        throw new Error(`No legal leader or base for ${format}/${cardPool}`);
    }

    const base = bases[0];
    const deckSize = deckValidator.getMinimumSideboardedDeckSize(base, format);
    const copiesPerCard = rules.maxCardCopies ?? copiesWithoutLimit;

    const deck: ISwuDbFormatCardEntry[] = [];
    let cardCount = 0;
    for (const setCode of deckCards) {
        if (cardCount >= deckSize) {
            break;
        }

        const count = Math.min(copiesPerCard, deckSize - cardCount);
        deck.push({ id: setCode, count });
        cardCount += count;
    }
    if (cardCount < deckSize) {
        throw new Error(`Only ${cardCount} legal cards for ${format}/${cardPool}, a deck needs ${deckSize}`);
    }

    // a second leader must be a different card and not mix Heroism with Villainy, so the first one that validates is used
    const secondLeaderChoices = rules.leaderCount === 2 ? leaders.slice(1) : [undefined];
    let failures: IDeckValidationFailures = {};
    for (const secondLeader of secondLeaderChoices) {
        const decklist: ISwuDbFormatDecklist = {
            metadata: {
                name: options.name ?? `Test deck (${format}/${cardPool})`,
                author: options.author ?? 'Karabast local test',
            },
            leader: { id: leaders[0], count: 1 },
            ...(secondLeader ? { secondleader: { id: secondLeader, count: 1 } } : {}),
            base: { id: base, count: 1 },
            deck: deck.map((entry) => ({ ...entry })),
        };

        failures = deckValidator.validateSwuDbDeck(decklist, { format, cardPool });
        if (Object.keys(failures).length === 0) {
            return decklist;
        }
    }

    throw new Error(`Could not build a legal test deck for ${format}/${cardPool}: ${JSON.stringify(failures)}`);
}
