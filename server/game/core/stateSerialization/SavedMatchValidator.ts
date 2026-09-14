import type { CardDataGetter } from '../../../utils/cardData/CardDataGetter';
import { ByoyomiTimer } from '../actionTimer/ByoyomiTimer';
import { PhaseName } from '../Constants';
import { isTokenCardName, isTokenUnitName, isTokenUpgradeName } from './GameStateInjector';
import { MatchLoadError } from './MatchLoadError';
import { SAVED_MATCH_FORMAT_VERSION } from './SavedMatchInterfaces';
import type { ISavedMatch, ISavedPlayer } from './SavedMatchInterfaces';

export interface IValidateOptions {
    cardDataGetter: CardDataGetter;

    /** Diagnostic only. Reported alongside the document's own value when a coordinate fails to resolve. */
    currentCardDataVersion?: string | null;
}

/** The seat labels every document this loader accepts must use, matching `MatchSerializer.save`'s `p${index + 1}` convention. */
const EXPECTED_SEATS = ['p1', 'p2'];

/** A conservative structural minimum: the driven setup draws a starting hand and then resources 2 cards from it. A card text effect can change the real starting hand size, but this check runs before any `Game` exists to evaluate one, so it is a backstop against a gutted decklist, not an exact simulation. */
const DEFAULT_STARTING_HAND_SIZE = 6;
const MINIMUM_DECK_SIZE = DEFAULT_STARTING_HAND_SIZE + 2;

/** No real game approaches this many credit tokens on one base; see the `creditTokens` check below for the measured failure modes an unbounded/fractional count causes. */
const MAX_PLAUSIBLE_CREDIT_TOKENS = 1000;

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Recursively collects every string found under a `card` key anywhere in `value`. Every referent shape in
 * this document (`ISavedCardRef`, `ISavedAttachedCard`) as well as every top-level entry shape
 * (`ISavedArenaEntry`, `ISavedBaseEntry`, `ISavedLeaderEntry`, `ISavedResourceEntry`) names its card the
 * same way, so a single structural walk finds every internal-name coordinate in the document without
 * needing one traversal per shape.
 */
function collectCardNames(value: unknown, into: Set<string>): void {
    if (Array.isArray(value)) {
        for (const element of value) {
            collectCardNames(element, into);
        }
        return;
    }

    if (!isPlainObject(value)) {
        return;
    }

    for (const [key, child] of Object.entries(value)) {
        if (key === 'card' && typeof child === 'string') {
            into.add(child);
            continue;
        }
        collectCardNames(child, into);
    }
}

function isParseableIsoDate(value: unknown): boolean {
    return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

function isNonNegativeInteger(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Validates a `v1` save document before any `Game` is constructed from it, so a bad document cannot leave
 * a half-built game behind. Collects every failure it finds before throwing, so one failed load names every
 * bad coordinate rather than the first.
 */
export function validate(saved: ISavedMatch, options: IValidateOptions): void {
    const issues: string[] = [];
    const fail = (message: string): void => {
        issues.push(message);
    };

    // --- formatVersion ---
    if (saved.formatVersion !== SAVED_MATCH_FORMAT_VERSION) {
        fail(`formatVersion ${saved.formatVersion} does not match the loader's supported version ${SAVED_MATCH_FORMAT_VERSION}.`);
    }

    // --- structural ---
    if (!Array.isArray(saved.players) || saved.players.length !== 2) {
        fail(`Expected exactly 2 players, found ${Array.isArray(saved.players) ? saved.players.length : 'none'}.`);
    } else {
        const seats = saved.players.map((player) => player.seat);
        const uniqueSeats = new Set(seats);
        if (seats.some((seat) => !seat) || uniqueSeats.size !== seats.length) {
            fail(`Player seats must be unique and non-empty; found [${seats.join(', ')}].`);
        } else if (EXPECTED_SEATS.some((seat) => !uniqueSeats.has(seat)) || uniqueSeats.size !== EXPECTED_SEATS.length) {
            fail(`Player seats must be exactly {${EXPECTED_SEATS.join(', ')}}; found {${seats.join(', ')}}.`);
        }
    }

    // `saved.players` may be non-null but not an array (an object, a string, ...): `?? []` only guards
    // null/undefined, so every subsequent read in this function goes through `playersArray` instead, which
    // is empty whenever `saved.players` fails the `Array.isArray` check above -- otherwise a non-array value
    // reaches `.map`/`.entries` here (before the structural `issues.length > 0` throw below) as a raw
    // TypeError instead of the collected `fail()` diagnostic the malformed-players case is supposed to get.
    const playersArray: readonly ISavedPlayer[] = Array.isArray(saved.players) ? saved.players : [];
    const knownSeats = new Set(playersArray.map((player) => player.seat));

    // Every subsequent `saved.game.*` read assumes `saved.game` itself is an object; a document missing it
    // entirely (a truncation, not just a missing member of it) would otherwise dereference `undefined` and
    // throw a raw TypeError instead of failing validation cleanly.
    if (!isPlainObject(saved.game)) {
        fail(`game is required and must be an object; found ${JSON.stringify(saved.game)}.`);
    } else {
        if (saved.game.phase !== PhaseName.Action) {
            fail(`Saved games can only be loaded at an action-phase boundary; found phase "${saved.game.phase}".`);
        }

        if (saved.game.initiativePlayer == null || !knownSeats.has(saved.game.initiativePlayer)) {
            fail(`game.initiativePlayer must name a real seat; found ${JSON.stringify(saved.game.initiativePlayer)}.`);
        }
        if (saved.game.actionPhaseActivePlayer == null || !knownSeats.has(saved.game.actionPhaseActivePlayer)) {
            fail(`game.actionPhaseActivePlayer must name a real seat; found ${JSON.stringify(saved.game.actionPhaseActivePlayer)}.`);
        }

        if (!isNonNegativeInteger(saved.game.roundNumber) || saved.game.roundNumber < 1) {
            fail(`game.roundNumber must be an integer >= 1; found ${JSON.stringify(saved.game.roundNumber)}.`);
        }
        if (!isNonNegativeInteger(saved.game.actionNumber)) {
            fail(`game.actionNumber must be a non-negative integer; found ${JSON.stringify(saved.game.actionNumber)}.`);
        }
        if (typeof saved.game.isInitiativeClaimed !== 'boolean') {
            fail(`game.isInitiativeClaimed must be a boolean; found ${JSON.stringify(saved.game.isInitiativeClaimed)}.`);
        }
    }

    if (typeof saved.rng?.seed !== 'string' || saved.rng.seed.length === 0) {
        fail('rng.seed must be a non-empty string.');
    }
    if (!isPlainObject(saved.rng?.state) && !Array.isArray(saved.rng?.state)) {
        fail('rng.state must be a non-null object.');
    } else if (isPlainObject(saved.rng?.state)) {
        // `seedrandom` accepts its `{i, j, S}` state without validating it, and a shape-valid-but-truncated
        // `S` (fewer than 256 entries) round-trips through `restore`/`rngState` verbatim -- so the loader's
        // own round-trip guard (comparing the state before/after restore) cannot catch it, and `next()`
        // silently returns `NaN` forever afterwards. This structural check is the only guard against that
        // specific corruption; a value-mutated (still 256-long, still in-range) `S` remains genuinely
        // undetectable and is a disclosed, accepted limitation, not something this check can close.
        const state = saved.rng.state as Record<string, unknown>;
        const isByteInt = (value: unknown): boolean => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 255;
        if ('S' in state || 'i' in state || 'j' in state) {
            if (!isByteInt(state.i)) {
                fail(`rng.state.i must be an integer in [0, 255]; found ${JSON.stringify(state.i)}.`);
            }
            if (!isByteInt(state.j)) {
                fail(`rng.state.j must be an integer in [0, 255]; found ${JSON.stringify(state.j)}.`);
            }
            if (!Array.isArray(state.S) || state.S.length !== 256 || !state.S.every(isByteInt)) {
                fail('rng.state.S must be an array of exactly 256 integers, each in [0, 255].');
            }
        }
    }

    if (!isParseableIsoDate(saved.savedAt)) {
        fail(`savedAt must be a parseable ISO string; found ${JSON.stringify(saved.savedAt)}.`);
    }
    if (saved.chat != null && !Array.isArray(saved.chat)) {
        fail(`chat must be an array; found ${JSON.stringify(saved.chat)}.`);
    } else {
        for (const [index, message] of (saved.chat ?? []).entries()) {
            if (!isPlainObject(message) || !isParseableIsoDate(message.date)) {
                fail(`chat[${index}].date must be a parseable ISO string; found ${JSON.stringify(message?.date)}.`);
            }
        }
    }

    for (const seat of knownSeats) {
        const timer = saved.timers?.[seat];
        const remaining = timer?.mainRemainingSeconds;
        if (!Number.isInteger(remaining) || remaining <= 0 || remaining > ByoyomiTimer.MainTimeLimitSeconds) {
            fail(`timers["${seat}"].mainRemainingSeconds must be an integer in (0, ${ByoyomiTimer.MainTimeLimitSeconds}]; found ${JSON.stringify(remaining)}.`);
        }
    }

    for (const [index, player] of playersArray.entries()) {
        const requiredArrays: [string, unknown][] = [
            ['hand', player.hand], ['deck', player.deck], ['discard', player.discard],
            ['resources', player.resources], ['groundArena', player.groundArena], ['spaceArena', player.spaceArena],
            ['outsideTheGame', player.outsideTheGame],
        ];
        for (const [name, value] of requiredArrays) {
            if (!Array.isArray(value)) {
                fail(`players[${index}].${name} must be an array.`);
            }
        }
        if (player.base == null) {
            fail(`players[${index}].base is required.`);
        }
        if (player.leader == null) {
            fail(`players[${index}].leader is required.`);
        }
        // `creditTokens` is a *count* MatchPositionInjector allocates that many real Card objects from
        // (see SavedMatchInterfaces.ts's note on counted positions); an unbounded or fractional value is
        // corrupt or hostile input, not a large-but-legitimate game state -- measured against the unfixed
        // loader: 5000 silently allocated 5000 Card objects, 2.5 loaded a fractional count, and 1e7 hung
        // for over 600s. No real game approaches even a few dozen.
        if (!Number.isInteger(player.creditTokens) || player.creditTokens < 0 || player.creditTokens > MAX_PLAUSIBLE_CREDIT_TOKENS) {
            fail(`players[${index}].creditTokens must be an integer in [0, ${MAX_PLAUSIBLE_CREDIT_TOKENS}]; found ${JSON.stringify(player.creditTokens)}.`);
        }
    }

    // --- decklist structural check ---
    for (const [index, player] of playersArray.entries()) {
        const decklist = player.decklist;
        const deckCount = (decklist?.deck ?? []).reduce((total, entry) => total + (entry.count ?? 0), 0);

        if (!decklist || !decklist.leader || !decklist.base || !decklist.deck || decklist.deck.length === 0) {
            fail(`players[${index}].decklist is missing a leader, base, or deck.`);
        } else if (deckCount < MINIMUM_DECK_SIZE) {
            fail(`players[${index}].decklist's deck has only ${deckCount} cards, fewer than the minimum ${MINIMUM_DECK_SIZE} needed to complete setup (a gutted or truncated decklist).`);
        }
    }

    if (issues.length > 0) {
        // Coordinate resolution and decklist/document coverage assume a structurally sound document; stop
        // here rather than compound a truncated document into confusing downstream diagnostics.
        throw new MatchLoadError(`Saved match failed structural validation:\n${issues.map((issue) => `- ${issue}`).join('\n')}`, {
            savedCardDataVersion: saved.cardDataVersion,
            currentCardDataVersion: options.currentCardDataVersion ?? null,
            issues,
        });
    }

    // --- coordinate resolution against current card data ---
    const knownInternalNames = new Set<string>();
    for (const entry of options.cardDataGetter.cardMap.values()) {
        knownInternalNames.add(entry.internalName);
    }

    const isKnownCardName = (name: string): boolean =>
        knownInternalNames.has(name) || isTokenUnitName(name) || isTokenUpgradeName(name) || isTokenCardName(name);

    const referencedCardNames = new Set<string>();
    collectCardNames(saved.players, referencedCardNames);
    collectCardNames(saved.stateWatchers, referencedCardNames);
    collectCardNames(saved.engineOnlyFacts, referencedCardNames);
    // `collectCardNames` only harvests string values under a key literally named `card`; hand/deck/discard/
    // outsideTheGame are bare `string[]` with no such key, so an unknown name there would otherwise reach
    // only the decklist/document coverage check below and get reported with its "likely a Bo3 sideboard"
    // diagnostic instead of the "not present in current card data" one this actually is.
    for (const player of playersArray) {
        for (const name of [...(player.hand ?? []), ...(player.deck ?? []), ...(player.discard ?? []), ...(player.outsideTheGame ?? [])]) {
            if (typeof name === 'string') {
                referencedCardNames.add(name);
            }
        }
    }

    const unresolvedCardNames = [...referencedCardNames].filter((name) => !isKnownCardName(name)).sort();
    if (unresolvedCardNames.length > 0) {
        fail(`The following card internal names are not present in the current card data and are not known token names: [${unresolvedCardNames.join(', ')}].`);
    }

    const unresolvedSetCodes: string[] = [];
    const addDecklistPosition = (setCode: string | undefined, count: number): void => {
        if (setCode == null) {
            return;
        }
        if (!options.cardDataGetter.setCodeMap.has(setCode)) {
            unresolvedSetCodes.push(setCode);
            return;
        }
        const internalId = options.cardDataGetter.setCodeMap.get(setCode);
        const internalName = options.cardDataGetter.cardMap.get(internalId)?.internalName;
        if (internalName == null) {
            unresolvedSetCodes.push(setCode);
        }
        // `count` is unused here: this pass only checks that every decklist set code resolves to a known
        // card. The actual per-card decklist totals used by the coverage check below are computed
        // separately, from the document's own decklist entries.
    };

    for (const player of playersArray) {
        addDecklistPosition(player.decklist?.leader?.id, 1);
        addDecklistPosition(player.decklist?.base?.id, 1);
        for (const entry of player.decklist?.deck ?? []) {
            addDecklistPosition(entry.id, entry.count ?? 0);
        }
    }

    if (unresolvedSetCodes.length > 0) {
        fail(`The following decklist set codes are not present in the current card data: [${[...new Set(unresolvedSetCodes)].sort().join(', ')}].`);
    }

    // --- decklist/document coverage check ---
    // The multiset of non-token card positions the document declares (per owning seat's pool) must be
    // coverable by that seat's reconstructed decklist. This is what turns the sideboarded-Bo3 case into a
    // named diagnostic instead of a confusing "no unclaimed <card> in the pool" failure deep inside setup.
    // Every position is attributed to its *owner*'s decklist coverage, never to the array it happens to sit
    // in: a cross-owned resource, arena unit, or attached card physically belongs to its owner's decklist
    // regardless of whose board array the document lists it under (`ownerSeat`, when present, is exactly
    // that owner).
    const documentPositionsBySeat = new Map<string, Map<string, number>>();
    const countsFor = (seat: string): Map<string, number> => {
        let counts = documentPositionsBySeat.get(seat);
        if (counts == null) {
            counts = new Map<string, number>();
            documentPositionsBySeat.set(seat, counts);
        }
        return counts;
    };
    const bumpFor = (seat: string, name: string): void => {
        if (isTokenUnitName(name) || isTokenUpgradeName(name) || isTokenCardName(name)) {
            return;
        }
        const counts = countsFor(seat);
        counts.set(name, (counts.get(name) ?? 0) + 1);
    };

    for (const player of playersArray) {
        for (const name of [...player.hand, ...player.deck, ...player.discard, ...player.outsideTheGame]) {
            bumpFor(player.seat, name);
        }
        for (const entry of player.resources) {
            bumpFor(entry.ownerSeat ?? player.seat, entry.card);
        }
        for (const arenaEntry of [...player.groundArena, ...player.spaceArena]) {
            bumpFor(arenaEntry.ownerSeat ?? player.seat, arenaEntry.card);
            for (const attached of [...(arenaEntry.upgrades ?? []), ...(arenaEntry.capturedCards ?? [])]) {
                bumpFor(attached.ownerSeat, attached.card);
            }
        }
        for (const attached of [...(player.base?.upgrades ?? []), ...(player.base?.capturedCards ?? [])]) {
            bumpFor(attached.ownerSeat, attached.card);
        }
        for (const attached of [...(player.leader?.upgrades ?? []), ...(player.leader?.capturedCards ?? [])]) {
            bumpFor(attached.ownerSeat, attached.card);
        }
    }

    const decklistBySeat = new Map<string, Map<string, number>>();
    for (const player of playersArray) {
        const counts = new Map<string, number>();
        const bump = (setCode: string | undefined, count: number): void => {
            if (setCode == null || !options.cardDataGetter.setCodeMap.has(setCode)) {
                return;
            }
            const internalId = options.cardDataGetter.setCodeMap.get(setCode);
            const internalName = options.cardDataGetter.cardMap.get(internalId)?.internalName;
            if (internalName == null) {
                return;
            }
            counts.set(internalName, (counts.get(internalName) ?? 0) + count);
        };
        bump(player.decklist?.leader?.id, 1);
        bump(player.decklist?.base?.id, 1);
        for (const entry of player.decklist?.deck ?? []) {
            bump(entry.id, entry.count ?? 0);
        }
        decklistBySeat.set(player.seat, counts);
    }

    const coverageShortfalls: string[] = [];
    for (const [seat, documentCounts] of documentPositionsBySeat) {
        const decklistCounts = decklistBySeat.get(seat) ?? new Map<string, number>();
        for (const [name, count] of documentCounts) {
            const available = decklistCounts.get(name) ?? 0;
            if (available < count) {
                coverageShortfalls.push(`seat "${seat}" needs ${count}x "${name}" but its decklist provides only ${available}`);
            }
        }
    }

    if (coverageShortfalls.length > 0) {
        fail(
            `document/decklist mismatch (likely a save taken after Bo3 sideboarding — the document records players[].decklist as originalDeckList, which does not reflect in-place sideboard moves): ${coverageShortfalls.join('; ')}.`
        );
    }

    if (issues.length > 0) {
        throw new MatchLoadError(`Saved match failed validation:\n${issues.map((issue) => `- ${issue}`).join('\n')}`, {
            savedCardDataVersion: saved.cardDataVersion,
            currentCardDataVersion: options.currentCardDataVersion ?? null,
            issues,
        });
    }
}
