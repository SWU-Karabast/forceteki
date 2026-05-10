import type { IDecklistInternal, IInternalCardEntry } from '../../../server/utils/deck/DeckInterfaces';
import type { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { nonRotatingSets, rotationBlocks } from '../../../server/utils/deck/SwuSetData';
import { setCodeToString } from '../../../server/Util';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import type { ICardDataJson } from '../../../server/utils/cardData/CardDataInterfaces';

// Released set IDs (uppercase to match card.setId.set from JSON)
export const RELEASED_SETS = new Set<string>([
    ...rotationBlocks.flatMap((b) => b.sets).filter((s) => s.released).map((s) => s.id.toUpperCase()),
    ...nonRotatingSets.filter((s) => s.released).map((s) => s.id.toUpperCase()),
]);

export function makeDeckValidatorHelpers(cardDataGetter: UnitTestCardDataGetter) {
    /** Returns a set code string like "SOR_005" for a given internal card name. */
    function sc(internalName: string): string {
        const card = cardDataGetter.getCardByNameSync(internalName);
        return setCodeToString(card.setId);
    }

    /** Builds an IInternalCardEntry for a card looked up by internal name. */
    function entry(internalName: string, count = 1): IInternalCardEntry {
        return { id: sc(internalName), count, internalName };
    }

    /**
     * Returns `count` unique non-leader/non-base/non-token card entries from
     * legalSets (defaulting to all released sets). Each has count: 1.
     */
    function getDeckFiller(count: number, legalSets: Set<string> = RELEASED_SETS): IInternalCardEntry[] {
        const result: IInternalCardEntry[] = [];
        for (const cardId of cardDataGetter.cardIds) {
            if (result.length >= count) {
                break;
            }
            const card = cardDataGetter.getCardSync(cardId);
            const isPlayable = !card.types.includes('leader') &&
                !card.types.includes('base') &&
                !card.types[0].startsWith('token');
            if (!isPlayable) {
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
    function getFirstCardInSet(set: string): IInternalCardEntry {
        for (const cardId of cardDataGetter.cardIds) {
            const card = cardDataGetter.getCardSync(cardId);
            if (card.setId.set !== set) {
                continue;
            }
            const isPlayable = !card.types.includes('leader') &&
                !card.types.includes('base') &&
                !card.types[0].startsWith('token');
            if (isPlayable) {
                return { id: setCodeToString(card.setId), count: 1, internalName: card.internalName };
            }
        }
        throw new Error(`No playable card found in set '${set}'`);
    }

    /** Builds a minimal IDecklistInternal with the provided defaults overrideable via `overrides`. */
    function buildDeck(defaultLeader: string, defaultBase: string, deckCards: IInternalCardEntry[], overrides: Partial<IDecklistInternal> = {}): IDecklistInternal {
        return {
            leader: entry(defaultLeader),
            base: entry(defaultBase),
            deck: deckCards,
            ...overrides,
        };
    }

    /**
     * Creates a DeckValidator augmented with one synthetic card from an unrecognized set code ('TST_001').
     * Because 'TST' is not in SwuSetId, the card's `sets` array will be empty after `parseSets`,
     * making it illegal in every format regardless of card pool. Use the returned `unreleasedEntry`
     * to include this card in a deck under test.
     */
    function makeValidatorWithUnreleasedCard(): { validator: DeckValidator; unreleasedEntry: IInternalCardEntry } {
        const syntheticCard: ICardDataJson = {
            id: '__tst-unreleased-id__',
            title: 'Mock Unreleased Unit',
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
            internalName: '__tst-unreleased__',
            arena: 'ground',
        };

        const allCardsData: ICardDataJson[] = cardDataGetter.cardIds.map((id) => cardDataGetter.getCardSync(id));
        const extendedSetCodeMap = new Map(cardDataGetter.setCodeMap);
        extendedSetCodeMap.set('TST_001', '__tst-unreleased-id__');

        const augmentedValidator = DeckValidator.createForTesting(
            [...allCardsData, syntheticCard],
            extendedSetCodeMap
        );

        const unreleasedEntry: IInternalCardEntry = { id: 'TST_001', count: 1, internalName: '__tst-unreleased__' };
        return { validator: augmentedValidator, unreleasedEntry };
    }

    return { sc, entry, getDeckFiller, getFirstCardInSet, buildDeck, makeValidatorWithUnreleasedCard };
}
