import { Card } from '../../../server/game/core/card/Card';
import { CardPool, CardType, SwuGameFormat } from '../../../server/game/core/Constants';
import { EnumHelpers } from '../../../server/game/core/utils/EnumHelpers';
import type { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import type { ISwuDbFormatDecklist } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { SwuSetId } from '../../../server/utils/deck/SwuSetData';

export interface IDecklistFixtureOptions {
    format?: SwuGameFormat;
    cardPool?: CardPool;
    name?: string;
    author?: string;
}

interface ICandidateCards {
    leaders: string[];
    bases: string[];
    playable: string[];
}

/**
 * Builds decklists in the SWUDB wire format that the lobby and queue endpoints accept.
 *
 * The cards are chosen from whatever the local card data says is legal for the requested format and
 * card pool rather than being hardcoded, so the fixtures keep working across card data refreshes.
 * Every decklist is run through the real {@link DeckValidator} before being returned, so a card data
 * change that would invalidate the fixture fails here with a clear message instead of surfacing as a
 * confusing 400 in an unrelated spec.
 */
export class DecklistFixtures {
    private readonly candidatesByPool = new Map<string, ICandidateCards>();

    public constructor(
        private readonly cardDataGetter: UnitTestCardDataGetter,
        private readonly deckValidator: DeckValidator
    ) {}

    /**
     * A decklist that passes validation for the given format and card pool.
     */
    public validDecklist(options: IDecklistFixtureOptions = {}): ISwuDbFormatDecklist {
        const format = options.format ?? SwuGameFormat.Premier;
        const cardPool = options.cardPool ?? CardPool.Current;
        const { leaders, bases, playable } = this.getCandidates(format, cardPool);

        const minDeckSize = this.deckValidator.getMinimumSideboardedDeckSize(bases[0], format);

        // three copies is the common per-card limit, so this needs a third of the deck size in
        // distinct cards plus a little headroom for cards with a lower override
        const distinctCardsNeeded = Math.ceil(minDeckSize / 3) + 4;
        if (playable.length < distinctCardsNeeded) {
            throw new Error(
                `DecklistFixtures: only ${playable.length} legal playable cards found for ${format}/${cardPool}, ` +
                `need at least ${distinctCardsNeeded} to build a ${minDeckSize} card deck`
            );
        }

        const deck = this.buildDeckEntries(playable, minDeckSize);

        const decklist: ISwuDbFormatDecklist = {
            metadata: {
                name: options.name ?? `Test Deck (${format}/${cardPool})`,
                author: options.author ?? 'server-test',
            },
            leader: { id: leaders[0], count: 1 },
            base: { id: bases[0], count: 1 },
            deck,
        };

        this.assertValid(decklist, format, cardPool);

        return decklist;
    }

    /**
     * A decklist that is structurally well formed but too small to be legal, for exercising the
     * rejection path on endpoints that validate decks.
     */
    public undersizedDecklist(options: IDecklistFixtureOptions = {}): ISwuDbFormatDecklist {
        const format = options.format ?? SwuGameFormat.Premier;
        const cardPool = options.cardPool ?? CardPool.Current;
        const { leaders, bases, playable } = this.getCandidates(format, cardPool);

        return {
            metadata: {
                name: options.name ?? 'Undersized Test Deck',
                author: options.author ?? 'server-test',
            },
            leader: { id: leaders[0], count: 1 },
            base: { id: bases[0], count: 1 },
            deck: [{ id: playable[0], count: 1 }],
        };
    }

    private buildDeckEntries(playable: string[], minDeckSize: number) {
        const deck: { id: string; count: number }[] = [];
        let total = 0;

        for (const setCode of playable) {
            if (total >= minDeckSize) {
                break;
            }

            const count = Math.min(3, minDeckSize - total);
            deck.push({ id: setCode, count });
            total += count;
        }

        return deck;
    }

    private assertValid(decklist: ISwuDbFormatDecklist, format: SwuGameFormat, cardPool: CardPool): void {
        const failures = this.deckValidator.validateSwuDbDeck(decklist, { format, cardPool });

        if (Object.keys(failures).length > 0) {
            throw new Error(
                `DecklistFixtures: generated an invalid decklist for ${format}/${cardPool}. ` +
                `Validation failures: ${JSON.stringify(failures)}`
            );
        }
    }

    /**
     * Buckets every set code in the card data into leaders, bases and mainboard-playable cards,
     * keeping only those legal in the requested format and card pool.
     */
    private getCandidates(format: SwuGameFormat, cardPool: CardPool): ICandidateCards {
        const cacheKey = `${format}/${cardPool}`;
        const cached = this.candidatesByPool.get(cacheKey);
        if (cached) {
            return cached;
        }

        const legalSets = DeckValidator.getLegalSets(format, cardPool);
        const candidates: ICandidateCards = { leaders: [], bases: [], playable: [] };

        for (const [setCode, cardId] of this.cardDataGetter.setCodeMap) {
            const cardData = this.cardDataGetter.getCardSync(cardId);

            // card data spells set codes in upper case while SwuSetId values are lower case, so the
            // same conversion the validator uses is applied here rather than comparing raw strings
            const cardSets = EnumHelpers.tryConvertToEnum(
                (cardData.setCodes ?? [cardData.setId]).map((code) => code.set),
                SwuSetId
            );

            if (!cardSets.some((set) => legalSets.has(set))) {
                continue;
            }

            switch (Card.buildTypeFromPrinted(cardData.types)) {
                case CardType.Leader:
                    candidates.leaders.push(setCode);
                    break;
                case CardType.Base:
                    candidates.bases.push(setCode);
                    break;
                case CardType.Event:
                case CardType.BasicUnit:
                case CardType.BasicUpgrade:
                    candidates.playable.push(setCode);
                    break;
                default:
                    break;
            }
        }

        if (candidates.leaders.length === 0 || candidates.bases.length === 0) {
            throw new Error(`DecklistFixtures: no legal leader or base found for ${format}/${cardPool}`);
        }

        // sort so fixtures are stable across runs regardless of card data iteration order
        candidates.leaders.sort();
        candidates.bases.sort();
        candidates.playable.sort();

        this.candidatesByPool.set(cacheKey, candidates);
        return candidates;
    }
}
