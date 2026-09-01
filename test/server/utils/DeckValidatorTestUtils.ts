import type { IDecklistInternal, IInternalCardEntry } from '../../../server/utils/deck/DeckInterfaces';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import type { IFormatRules, ISetCatalog } from '../../../server/utils/deck/SwuSetData';
import { formatRules, isReleased, nonRotatingSets, ReleaseStage, rotationBlocks, SwuSetId } from '../../../server/utils/deck/SwuSetData';
import { setCodeToString } from '../../../server/Util';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import type { CardDataGetter } from '../../../server/utils/cardData/CardDataGetter';
import type { ICardDataJson } from '../../../server/utils/cardData/CardDataInterfaces';
import { SwuGameFormat } from '../../../server/game/core/Constants';
import type { CardPool } from '../../../server/game/core/Constants';

// Released set IDs (uppercase to match card.setId.set from JSON)
export const RELEASED_SETS = new Set<string>([
    ...rotationBlocks.flatMap((b) => b.sets).filter(isReleased)
        .map((s) => s.id.toUpperCase()),
    ...nonRotatingSets.filter(isReleased).map((s) => s.id.toUpperCase()),
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
        // Skip synthetic fixture cards (preview/future/banned stand-ins, all prefixed with `__`) so they never
        // leak into generic filler — some live in real legal sets and must only appear when a test adds them.
        if (card.internalName.startsWith('__')) {
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
// Synthetic set + ban fixtures
// The real release calendar and ban list change over time, so tests that must keep exercising the preview,
// future-set, and ban-expiry logic use synthetic stand-ins injected via an alternate ISetCatalog instead of
// pinning to real sets/cards. There are three:
//   - TPRV: a `Next` mainline set (the upcoming set) — legal under NextSet, excluded from Current.
//   - TFUT: a `Future` set (previews further out than the next set) — excluded from every constructed pool.
//   - a synthetic suspended card in a released set whose ban `expiresWith` TPRV — active under Current, lifted
//     under NextSet (mirrors the real "ban expires with the next set's release" behavior, durably).
// A subclass teaches the enum-based set parsing to recognize the synthetic set codes. Production code/data are
// untouched. All synthetic cards use a `__` internal-name prefix so getDeckFiller skips them.
// ---------------------------------------------------------------------------

/** Uppercase set code (matches `card.setId.set`) for the synthetic preview ("next") set. */
export const TEST_PREVIEW_SET_CODE = 'TPRV';

/** Lowercase set id (matches the `SwuSetId` enum-value convention) for the synthetic preview set. */
const TEST_PREVIEW_SET_ID = 'tprv';

/** Uppercase set code for the synthetic future set (previews beyond the next set). */
export const TEST_FUTURE_SET_CODE = 'TFUT';

/** Lowercase set id for the synthetic future set. */
const TEST_FUTURE_SET_ID = 'tfut';

/** Builds a synthetic card of the given set/type. Internal name is `__`-prefixed so filler skips it. */
function makeSyntheticCard(setCode: string, kind: 'leader' | 'base' | 'unit', num: number): ICardDataJson {
    const slug = setCode.toLowerCase();
    const internalName = `__${slug}-${kind}-${num}__`;
    return {
        id: `${internalName}-id__`,
        title: `${setCode} ${kind} ${num}`,
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
        setId: { set: setCode, number: num },
        setCodes: [{ set: setCode, number: num }],
        internalName,
        arena: 'ground',
    };
}

// One leader, one base, and enough units to fill a minimum Limited deck (whose NextSet pool is this single set).
const PREVIEW_CARDS: ICardDataJson[] = [
    makeSyntheticCard(TEST_PREVIEW_SET_CODE, 'leader', 100),
    makeSyntheticCard(TEST_PREVIEW_SET_CODE, 'base', 101),
    ...Array.from({ length: 35 }, (_, i) => makeSyntheticCard(TEST_PREVIEW_SET_CODE, 'unit', i + 1)),
];

// A few playable cards suffice: future-set tests only ever add a single TFUT card to an otherwise-legal deck.
const FUTURE_CARDS: ICardDataJson[] = Array.from({ length: 3 }, (_, i) => makeSyntheticCard(TEST_FUTURE_SET_CODE, 'unit', i + 1));

// The synthetic suspended card lives in the latest released mainline set (derived, so it stays a real, always-
// legal set regardless of the calendar) — and, critically, one getFirstCardInSet never probes, so it can't leak
// into another test. Number 999 avoids colliding with a real card in that set.
const bannedCardSetCode = ([...rotationBlocks.flatMap((b) => b.sets)].reverse().find((s) => isReleased(s) && s.mainline)?.id ?? SwuSetId.SOR).toUpperCase();
const TEST_BANNED_CARD: ICardDataJson = makeSyntheticCard(bannedCardSetCode, 'unit', 999);

/** Internal name of the synthetic suspended card whose ban expires with the synthetic next (TPRV) set. */
export const TEST_BANNED_CARD_NAME = TEST_BANNED_CARD.internalName;

/** All synthetic cards served by the preview card-data getter. */
const SYNTHETIC_CARDS: ICardDataJson[] = [...PREVIEW_CARDS, ...FUTURE_CARDS, TEST_BANNED_CARD];

/** formatRules with a synthetic Eternal suspension added (expiring with TPRV) so ban-expiry is testable. */
function buildTestFormatRules(): Map<SwuGameFormat, IFormatRules> {
    const testRules = new Map(formatRules);
    const eternalRules = testRules.get(SwuGameFormat.Eternal);
    const eternalBans = new Map(eternalRules.bannedCards);
    eternalBans.set(TEST_BANNED_CARD.id, { name: TEST_BANNED_CARD_NAME, expiresWith: TEST_PREVIEW_SET_ID as SwuSetId });
    testRules.set(SwuGameFormat.Eternal, { ...eternalRules, bannedCards: eternalBans });
    return testRules;
}

/**
 * The default set catalog with the synthetic sets appended to the latest block (TPRV as `Next`, TFUT as
 * `Future`) and a synthetic Eternal suspension. Under {@link CardPool.Current} TPRV/TFUT are excluded, so
 * current-pool legality is unchanged; under {@link CardPool.NextSet} TPRV becomes legal (TFUT never does).
 */
export const TEST_SET_CATALOG: ISetCatalog = {
    rotationBlocks: rotationBlocks.map((block, i) => {
        return i === rotationBlocks.length - 1
            ? { ...block, sets: [...block.sets,
                { id: TEST_PREVIEW_SET_ID as SwuSetId, releaseStage: ReleaseStage.Next, mainline: true },
                { id: TEST_FUTURE_SET_ID as SwuSetId, releaseStage: ReleaseStage.Future, mainline: false },
            ] }
            : { ...block, sets: [...block.sets] };
    }),
    nonRotatingSets,
    formatRules: buildTestFormatRules(),
};

/** A {@link UnitTestCardDataGetter} that also serves the synthetic preview-set cards. */
class PreviewTestCardDataGetter extends UnitTestCardDataGetter {
    private readonly previewById = new Map<string, ICardDataJson>();
    private readonly previewByName = new Map<string, ICardDataJson>();

    public constructor(folderRoot: string) {
        super(folderRoot);
        for (const card of SYNTHETIC_CARDS) {
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

    // The base implementation only recognizes real `SwuSetId` members; re-add the synthetic set codes so their
    // cards resolve to a recognized set (with the intended pool legality) rather than an unknown one. The
    // synthetic banned card uses a real released set code, so the base implementation already handles it.
    protected override parseSets(cardData: ICardDataJson): SwuSetId[] {
        const base = super.parseSets(cardData);
        const codes = (cardData.setCodes ?? [cardData.setId]).map((c) => c.set.toLowerCase());
        const extra = [TEST_PREVIEW_SET_ID, TEST_FUTURE_SET_ID].filter((id) => codes.includes(id)) as SwuSetId[];
        return [...base, ...extra];
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
