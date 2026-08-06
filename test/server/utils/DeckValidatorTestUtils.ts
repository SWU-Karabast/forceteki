import type { IDecklistInternal, IInternalCardEntry } from '../../../server/utils/deck/DeckInterfaces';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import type { ISetCatalog } from '../../../server/utils/deck/SwuSetData';
import { formatRules, nonRotatingSets, rotationBlocks, SwuSetId } from '../../../server/utils/deck/SwuSetData';
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
    return new Set([...DeckValidator.getLegalSets(format, cardPool, TEST_SET_CATALOG)].map((s) => s.toUpperCase()));
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

// ---------------------------------------------------------------------------
// Synthetic "preview" set support
// Whether a real set is an unreleased ("preview") mainline set changes over time, and there are periods with
// no preview set at all. To keep the preview/NextSet tests running unconditionally, we inject a synthetic
// preview set ('TPRV') that is always present: an unreleased mainline set with its own leader, base, and units.
// The validator reads this via an alternate ISetCatalog, and a subclass teaches the enum-based set parsing to
// recognize the synthetic set code. Production code and data are untouched.
// ---------------------------------------------------------------------------

/** Uppercase set code (matches `card.setId.set`) for the synthetic preview set. */
export const TEST_PREVIEW_SET_CODE = 'TPRV';

/** Lowercase set id (matches the `SwuSetId` enum-value convention) for the synthetic preview set. */
const TEST_PREVIEW_SET_ID = 'tprv';

/** Builds a synthetic preview-set card of the given printed type. */
function makePreviewCard(kind: 'leader' | 'base' | 'unit', num: number): ICardDataJson {
    const internalName = `__tprv-${kind}-${num}__`;
    return {
        id: `__tprv-${kind}-${num}-id__`,
        title: `TPRV ${kind} ${num}`,
        subtitle: '',
        cost: 1,
        hp: 1,
        power: 1,
        text: '',
        unique: false,
        aspects: [],
        traits: [],
        keywords: [],
        types: [kind],
        setId: { set: TEST_PREVIEW_SET_CODE, number: num },
        setCodes: [{ set: TEST_PREVIEW_SET_CODE, number: num }],
        internalName,
        arena: 'ground',
    };
}

// One leader, one base, and enough units to fill a minimum Limited deck (whose NextSet pool is this single set).
const PREVIEW_CARDS: ICardDataJson[] = [
    makePreviewCard('leader', 100),
    makePreviewCard('base', 101),
    ...Array.from({ length: 35 }, (_, i) => makePreviewCard('unit', i + 1)),
];

/**
 * The default set catalog with a synthetic unreleased mainline "preview" set appended to the latest block.
 * Under {@link CardPool.Current} it is excluded (unreleased), so current-pool legality is unchanged; under
 * {@link CardPool.NextSet} it becomes legal, which is what the preview tests exercise.
 */
export const TEST_SET_CATALOG: ISetCatalog = {
    rotationBlocks: rotationBlocks.map((block, i) => {
        return i === rotationBlocks.length - 1
            ? { ...block, sets: [...block.sets, { id: TEST_PREVIEW_SET_ID as SwuSetId, released: false, mainline: true }] }
            : { ...block, sets: [...block.sets] };
    }),
    nonRotatingSets,
    formatRules,
};

/** A {@link UnitTestCardDataGetter} that also serves the synthetic preview-set cards. */
class PreviewTestCardDataGetter extends UnitTestCardDataGetter {
    private readonly previewById = new Map<string, ICardDataJson>();
    private readonly previewByName = new Map<string, ICardDataJson>();

    public constructor(folderRoot: string) {
        super(folderRoot);
        for (const card of PREVIEW_CARDS) {
            this.previewById.set(card.id, card);
            this.previewByName.set(card.internalName, card);
            this.cardMap.set(card.id, { id: card.id, title: card.title, subtitle: card.subtitle, internalName: card.internalName, cost: card.cost });
            this.setCodeMap.set(setCodeToString(card.setId), card.id);
        }
    }

    public override getCardSync(id: string): ICardDataJson {
        return this.previewById.get(id) ?? super.getCardSync(id);
    }

    public override getCardByNameSync(internalName: string): ICardDataJson {
        return this.previewByName.get(internalName) ?? super.getCardByNameSync(internalName);
    }

    public override getCardAsync(id: string): Promise<ICardDataJson> {
        const preview = this.previewById.get(id);
        return preview ? Promise.resolve(preview) : super.getCardAsync(id);
    }
}

/**
 * A {@link DeckValidator} that validates against {@link TEST_SET_CATALOG} and recognizes the synthetic
 * preview set code that is absent from the real `SwuSetId` enum.
 */
class PreviewDeckValidator extends DeckValidator {
    public static async createPreviewAsync(cardDataGetter: CardDataGetter): Promise<PreviewDeckValidator> {
        const allCardsData: ICardDataJson[] = [];
        for (const cardId of cardDataGetter.cardIds) {
            allCardsData.push(await cardDataGetter.getCardAsync(cardId));
        }
        return new PreviewDeckValidator(allCardsData, cardDataGetter.setCodeMap);
    }

    protected override getSetCatalog(): ISetCatalog {
        return TEST_SET_CATALOG;
    }

    // The base implementation only recognizes real `SwuSetId` members; re-add the synthetic preview set so its
    // cards resolve to a real (illegal-under-Current, legal-under-NextSet) set rather than an unknown one.
    protected override parseSets(cardData: ICardDataJson): SwuSetId[] {
        const base = super.parseSets(cardData);
        const codes = (cardData.setCodes ?? [cardData.setId]).map((c) => c.set.toLowerCase());
        return codes.includes(TEST_PREVIEW_SET_ID) ? [...base, TEST_PREVIEW_SET_ID as SwuSetId] : base;
    }
}

/**
 * Builds a validator + card data getter that are aware of the synthetic preview set. Existing (current-pool)
 * behaviour is unchanged because the preview set is unreleased; only the preview/NextSet paths gain a target.
 */
export async function createPreviewValidatorSetup(): Promise<{ validator: DeckValidator; cardDataGetter: UnitTestCardDataGetter }> {
    const cardDataGetter = new PreviewTestCardDataGetter('test/json');
    const validator = await PreviewDeckValidator.createPreviewAsync(cardDataGetter);
    return { validator, cardDataGetter };
}
