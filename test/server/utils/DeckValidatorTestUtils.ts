import type { IDecklistInternal, IInternalCardEntry } from '../../../server/utils/deck/DeckInterfaces';
import type { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { nonRotatingSets, rotationBlocks } from '../../../server/utils/deck/SwuSetData';
import { setCodeToString } from '../../../server/Util';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import type { CardDataGetter } from '../../../server/utils/cardData/CardDataGetter';
import type { ICardDataJson } from '../../../server/utils/cardData/CardDataInterfaces';
import type { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';

// Released set IDs (uppercase to match card.setId.set from JSON)
export const RELEASED_SETS = new Set<string>([
    ...rotationBlocks.flatMap((b) => b.sets).filter((s) => s.released)
        .map((s) => s.id.toUpperCase()),
    ...nonRotatingSets.filter((s) => s.released).map((s) => s.id.toUpperCase()),
]);

/** Uppercased legal set codes for a format + card pool, for matching against `card.setId.set`. */
export function getLegalSetCodes(format: SwuGameFormat, cardPool: CardPool): Set<string> {
    return new Set([...DeckValidator.getLegalSets(format, cardPool)].map((s) => s.toUpperCase()));
}

/** True if the card belongs in the main deck/sideboard (i.e. not a leader, base, or token). */
function isPlayableType(card: ICardDataJson): boolean {
    return !card.types.includes('leader') &&
      !card.types.includes('base') &&
      !card.types[0].startsWith('token');
}

/** Builds an IInternalCardEntry for a card looked up by internal name. */
export function buildCardEntry(cardDataGetter: UnitTestCardDataGetter, internalName: string, count = 1): IInternalCardEntry {
    const card = cardDataGetter.getCardByNameSync(internalName);
    return { id: setCodeToString(card.setId), count, internalName };
}

/**
 * Returns `count` unique non-leader/non-base/non-token card entries from
 * legalSets (defaulting to all released sets). Each has count: 1.
 */
export function getDeckFiller(cardDataGetter: UnitTestCardDataGetter, count: number, legalSets: Set<string> = RELEASED_SETS): IInternalCardEntry[] {
    const result: IInternalCardEntry[] = [];
    for (const cardId of cardDataGetter.cardIds) {
        if (result.length >= count) {
            break;
        }
        const card = cardDataGetter.getCardSync(cardId);
        if (!isPlayableType(card)) {
            continue;
        }
        if (!legalSets.has(card.setId.set)) {
            continue;
        }
        result.push({ id: setCodeToString(card.setId), count: 1, internalName: card.internalName });
    }
    return result;
}

/** Returns the first non-leader/non-base/non-token card entry from the given set, or throws if none found. */
export function getFirstCardInSet(cardDataGetter: UnitTestCardDataGetter, set: string): IInternalCardEntry {
    for (const cardId of cardDataGetter.cardIds) {
        const card = cardDataGetter.getCardSync(cardId);
        if (card.setId.set !== set) {
            continue;
        }
        if (isPlayableType(card)) {
            return { id: setCodeToString(card.setId), count: 1, internalName: card.internalName };
        }
    }
    throw new Error(`No playable card found in set '${set}'`);
}

/** Returns the first leader card entry from the given sets, or throws if none found. */
export function getFirstLeader(cardDataGetter: UnitTestCardDataGetter, legalSets: Set<string> = RELEASED_SETS): IInternalCardEntry {
    for (const cardId of cardDataGetter.cardIds) {
        const card = cardDataGetter.getCardSync(cardId);
        if (!legalSets.has(card.setId.set)) {
            continue;
        }
        if (card.types.includes('leader')) {
            return { id: setCodeToString(card.setId), count: 1, internalName: card.internalName };
        }
    }
    throw new Error('No leader found in provided sets');
}

/** Returns the first base card entry from the given sets, or throws if none found. */
export function getFirstBase(cardDataGetter: UnitTestCardDataGetter, legalSets: Set<string> = RELEASED_SETS): IInternalCardEntry {
    for (const cardId of cardDataGetter.cardIds) {
        const card = cardDataGetter.getCardSync(cardId);
        if (!legalSets.has(card.setId.set)) {
            continue;
        }
        if (card.types.includes('base')) {
            return { id: setCodeToString(card.setId), count: 1, internalName: card.internalName };
        }
    }
    throw new Error('No base found in provided sets');
}

/** Builds a minimal IDecklistInternal with the provided defaults overrideable via `overrides`. */
export function buildValidationTestDeck(
    cardDataGetter: UnitTestCardDataGetter,
    defaultLeader: string,
    defaultBase: string,
    deckCards: IInternalCardEntry[],
    overrides: Partial<IDecklistInternal> = {}
): IDecklistInternal {
    return {
        leader: buildCardEntry(cardDataGetter, defaultLeader),
        base: buildCardEntry(cardDataGetter, defaultBase),
        deck: deckCards,
        ...overrides,
    };
}

/**
 * Creates a DeckValidator augmented with one synthetic card from an unrecognized set code ('TST_001').
 * Because 'TST' is not in SwuSetId, the card's `sets` array will be empty after `parseSets`,
 * making it illegal in every format regardless of card pool. Use the returned `unknownSetEntry`
 * to include this card in a deck under test.
 *
 * The synthetic card is injected via a lightweight stand-in for the card data getter, so the validator is
 * still built through the normal `createAsync` path rather than a test-only constructor.
 */
export async function makeValidatorWithUnknownSetCard(cardDataGetter: UnitTestCardDataGetter): Promise<{ validator: DeckValidator; unknownSetEntry: IInternalCardEntry }> {
    const syntheticCard: ICardDataJson = {
        id: '__tst-unknown-set-id__',
        title: 'Mock Unknown Set Unit',
        subtitle: '',
        cost: 1,
        hp: 1,
        power: 1,
        text: '',
        deployBox: null,
        epicAction: '',
        unique: false,
        rules: null,
        upgradePower: null,
        upgradeHp: null,
        aspects: [],
        traits: [],
        keywords: [],
        types: ['unit'],
        setId: { set: 'TST', number: 1 },
        setCodes: [{ set: 'TST', number: 1 }],
        internalName: '__tst-unknown-set__',
        arena: 'ground',
    };

    const extendedSetCodeMap = new Map(cardDataGetter.setCodeMap);
    extendedSetCodeMap.set('TST_001', '__tst-unknown-set-id__');

    // Only the three members that createAsync reads are overridden; everything else delegates to the real getter.
    const augmentedGetter = {
        cardIds: [...cardDataGetter.cardIds, syntheticCard.id],
        setCodeMap: extendedSetCodeMap,
        getCardAsync: (id: string) => (id === syntheticCard.id ? Promise.resolve(syntheticCard) : cardDataGetter.getCardAsync(id)),
    } as unknown as CardDataGetter;

    const validator = await DeckValidator.createAsync(augmentedGetter);

    const unknownSetEntry: IInternalCardEntry = { id: 'TST_001', count: 1, internalName: '__tst-unknown-set__' };
    return { validator, unknownSetEntry };
}
