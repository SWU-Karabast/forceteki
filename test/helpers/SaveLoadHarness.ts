import { StateWatcherLibrary } from '../../server/game/stateWatchers/StateWatcherLibrary';
import { save } from '../../server/game/core/stateSerialization/MatchSerializer';
import { loadAsync } from '../../server/game/core/stateSerialization/MatchLoader';
import type { IMatchLoadResult } from '../../server/game/core/stateSerialization/MatchLoader';
import type { ISavedMatch } from '../../server/game/core/stateSerialization/SavedMatchInterfaces';
import type { Player } from '../../server/game/core/Player';
import { buildLoadConfig } from './MatchLoaderHarness';

// `PlayerInteractionWrapper.ts` ends with a raw `module.exports = PlayerInteractionWrapper` (for
// `GameFlowWrapper.js`'s own `require`), which overwrites its named export and defeats both a named and a
// default TS import's static typing (the compiler still sees the `export class` declaration's shape, not
// the reassignment). A plain runtime `require` sidesteps that; `PlayerInteractionWrapper` as a *type* is
// already declared ambient-global (`test/helpers/IntegrationHelper.d.ts:10`), so no type import is needed.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PlayerInteractionWrapperCtor: new (game: IMatchLoadResult['game'], player: Player, testContext: GameFlowWrapper) => PlayerInteractionWrapper = require('./PlayerInteractionWrapper');

/**
 * Cross-cutting helper for `P2-E`'s round-trip, degraded-save and continuation specs. See
 * `.anvil/p2-e/plan-rev1.md` §3 step 1 for the full derivation of each export below.
 */

interface INormalizeOptions {

    /** Drops `engineOnlyFacts` entirely; used only by the degraded-save round trip (AC3). */
    ignoreManifest?: boolean;

    /**
     * Reduces every `chat` entry to its `message`, dropping the wall-clock `date`. Used only by the
     * differential oracle: `chat[].date` is a real timestamp (`ChatScrubber`), so two separately-driven
     * games log the same message at different instants. Never used by the round-trip properties (AC1/AC3),
     * which keep `chat[].date` in the comparison -- a single game's own save/load/save cannot move its own
     * clock.
     */
    ignoreChatTimestamps?: boolean;
}

/**
 * Returns a structurally-cloned, normalized form of `document`:
 *  - `savedAt` is always excluded (both sides carry the moment `save()` happened to run).
 *  - `stateWatchers` is replaced by an object keyed on `watcher`, valued by its `entries` array. A section
 *    with an empty `entries` array is omitted from the result, so "absent" and "present but empty" compare
 *    equal -- the map form the plan's continuation/round-trip criteria require.
 *  - `engineOnlyFacts` is deleted under `ignoreManifest`.
 *  - `chat[].date` is dropped under `ignoreChatTimestamps`.
 *
 * `timers` is never excluded: this harness's `NoopActionTimer.mainTimeRemainingSeconds` returns a constant
 * (`ByoyomiTimer.MainTimeLimitSeconds`), so a timer divergence here is a real signal, not clock noise.
 */
export function normalizeSavedMatch(document: ISavedMatch, options: INormalizeOptions = {}): unknown {
    const clone = JSON.parse(JSON.stringify(document)) as Record<string, unknown> & Partial<ISavedMatch>;
    delete clone.savedAt;

    const watcherMap: Record<string, unknown> = {};
    for (const section of document.stateWatchers ?? []) {
        if (section.entries.length > 0) {
            watcherMap[section.watcher] = JSON.parse(JSON.stringify(section.entries));
        }
    }
    clone.stateWatchers = watcherMap as unknown as ISavedMatch['stateWatchers'];

    if (options.ignoreManifest) {
        delete clone.engineOnlyFacts;
    }

    if (options.ignoreChatTimestamps) {
        clone.chat = (document.chat ?? []).map((entry) => ({ message: entry.message })) as unknown as ISavedMatch['chat'];
    }

    return clone;
}

/**
 * Asserts `after` and `before` are equal under {@link normalizeSavedMatch}. Compares section-by-section
 * first (so a failure names the offending top-level key rather than dumping a full-document diff), then
 * the whole normalized document as a final check. `degraded` additionally asserts `after.engineOnlyFacts`
 * is empty -- the re-save of a genuinely degraded document must not re-detect the dropped facts.
 */
export function expectRoundTripEqual(before: ISavedMatch, after: ISavedMatch, options: { degraded?: boolean } = {}): void {
    // A degraded document's own manifest is expected to diverge (the re-save's is empty, per the assertion
    // below), so the manifest is excluded from the equality comparison itself under `degraded`.
    const normalizedBefore = normalizeSavedMatch(before, { ignoreManifest: options.degraded }) as Record<string, unknown>;
    const normalizedAfter = normalizeSavedMatch(after, { ignoreManifest: options.degraded }) as Record<string, unknown>;

    const keys = new Set([...Object.keys(normalizedBefore), ...Object.keys(normalizedAfter)]);
    for (const key of keys) {
        expect(normalizedAfter[key]).withContext(`document section "${key}" diverged after save -> load -> save`)
            .toEqual(normalizedBefore[key]);
    }
    expect(normalizedAfter).toEqual(normalizedBefore);

    if (options.degraded) {
        expect(after.engineOnlyFacts).withContext('the re-save of a degraded document must not re-detect the dropped facts')
            .toEqual([]);
    }
}

/**
 * `save(context.game)` -> optional document mutation -> `loadAsync(document, buildLoadConfig(context))`.
 * Returns everything a spec typically needs, plus a `saveAgain()` convenience for the round-trip specs.
 */
export async function saveLoadSaveAsync(
    context: SwuTestContext,
    options: { mutate?: (document: ISavedMatch) => void } = {}
): Promise<{
        before: ISavedMatch;
        loadedGame: IMatchLoadResult['game'];
        playersBySeat: IMatchLoadResult['playersBySeat'];
        engineOnlyFacts: IMatchLoadResult['engineOnlyFacts'];
        p1: Player;
        p2: Player;
        saveAgain: () => ISavedMatch;
    }> {
    const before = save(context.game);
    options.mutate?.(before);

    const { game: loadedGame, playersBySeat, engineOnlyFacts } = await loadAsync(before, buildLoadConfig(context));

    return {
        before,
        loadedGame,
        playersBySeat,
        engineOnlyFacts,
        p1: playersBySeat.get('p1'),
        p2: playersBySeat.get('p2'),
        saveAgain: () => save(loadedGame),
    };
}

/**
 * Builds a `PlayerInteractionWrapper` per seat over `loadedGame`, so continuation specs can assert
 * behaviour with the standard matcher vocabulary instead of raw `Game` calls. `PlayerInteractionWrapper`
 * uses its `testContext` argument only for error-message formatting (`Util.formatBothPlayerPrompts`, which
 * reads only `.player1`/`.player2`), verified at `PlayerInteractionWrapper.ts:670,690,754,771,795,810,953`
 * -- so a two-field stub is sufficient and the loaded game never needs a real `GameFlowWrapper`.
 */
export function wrapLoadedGame(
    loadedGame: IMatchLoadResult['game'],
    playersBySeat: IMatchLoadResult['playersBySeat']
): { p1: PlayerInteractionWrapper; p2: PlayerInteractionWrapper } {
    const stubTestContext: Partial<GameFlowWrapper> = {};
    const p1 = new PlayerInteractionWrapperCtor(loadedGame, playersBySeat.get('p1'), stubTestContext as GameFlowWrapper);
    const p2 = new PlayerInteractionWrapperCtor(loadedGame, playersBySeat.get('p2'), stubTestContext as GameFlowWrapper);
    stubTestContext.player1 = p1;
    stubTestContext.player2 = p2;
    return { p1, p2 };
}

/**
 * Registers every state watcher type on `game`, the same stress registration
 * `GameStateBuilder.registerAllStateWatchers` performs on every harness-built game -- deliberately the same
 * reflective form over `StateWatcherLibrary.prototype`, so both stay in step with that class's own
 * "every non-constructor method registers a watcher" contract (`StateWatcherLibrary.ts:27-31`) without a
 * hand-maintained name list. Idempotent: `registerWatcher` returns an already-registered watcher untouched.
 */
function registerAllStateWatchers(game: IMatchLoadResult['game']): void {
    const library = new StateWatcherLibrary(game) as unknown as Record<string, () => unknown>;
    const registerMethods = Object.getOwnPropertyNames(StateWatcherLibrary.prototype)
        .filter((name) => name !== 'constructor' && typeof library[name] === 'function');

    for (const methodName of registerMethods) {
        library[methodName]();
    }
}

/**
 * The differential oracle (plan §3 step 1 / `02-semantic-save-load.md:754-757`): saves the original,
 * loads it, drives `sequence` in the loaded game and the *same* `sequence` in `context.game`, saves both,
 * and asserts the two documents are equal under `normalizeSavedMatch(..., { ignoreChatTimestamps: true })`.
 *
 * `sequence` is `(p1, p2) => void`, invoked once per game with that game's own wrapper pair -- it must
 * resolve cards through those wrappers (`p1.findCardByName('wampa')`), never through `context.<cardName>`
 * properties, since the two games hold entirely distinct card objects.
 */
export async function expectContinuationMatchesOriginalAsync(
    context: SwuTestContext,
    options: { sequence: (p1: PlayerInteractionWrapper, p2: PlayerInteractionWrapper) => void }
): Promise<{
        originalDocument: ISavedMatch;
        loadedDocument: ISavedMatch;
        loadedGame: IMatchLoadResult['game'];
        playersBySeat: IMatchLoadResult['playersBySeat'];
        loadedWrappers: { p1: PlayerInteractionWrapper; p2: PlayerInteractionWrapper };
    }> {
    const before = save(context.game);
    const { game: loadedGame, playersBySeat } = await loadAsync(before, buildLoadConfig(context));
    const loadedWrappers = wrapLoadedGame(loadedGame, playersBySeat);

    // The two games do not register the same watcher types by default, and the difference is pure harness
    // artefact rather than save/load behaviour. `context.game` has all 15 registered unconditionally by
    // this test harness's own stress helper (`GameStateBuilder.js:234`, `registerAllStateWatchers`), which
    // no production game does. `loadedGame` gets only the union of three much smaller sources:
    //   1. the 4 the core `UnitProperties` mixin registers for *every* unit card, regardless of the
    //      document (`server/game/core/card/propertyMixins/UnitProperties.ts:343-346`:
    //      `tokensCreatedThisPhase`, `cardsPlayedThisPhase`, `leadersDeployedThisPhase`,
    //      `cardsDefeatedThisPhase`);
    //   2. whatever the specific cards in the saved decklists ask for in their own `setupStateWatchers`;
    //   3. whatever `restoreStateWatchers` registers for the sections the document actually named, which
    //      is only the watchers that held entries when `save()` ran (`P2-C2` decision 6).
    // For a generic fixture that leaves the other 11 types registered on the source game and on neither
    // side of the comparison, so filtering them out -- by any predicate, whether "absent from `before`" or
    // "registered on the source but not the loaded game" -- silently drops exactly the content `sequence`
    // generates: the attack, damage, action and zone-movement tracking these scenarios exist to exercise.
    // A filtered comparison is vacuous for those types and still passes green.
    //
    // So instead of excluding, mirror: register every watcher type on `loadedGame` too, so both registrars
    // match and every section is compared. This is sound because a watcher's constructor only zeroes its
    // own `entries` and subscribes to game events (`StateWatcher.ts:66-76`) -- it never rescans history,
    // so a late registration cannot arrive partially populated. `registerWatcher` is idempotent
    // (`StateWatcherRegistrar.ts:40-47`), so the watchers `restoreStateWatchers` already rebuilt with their
    // restored entries are returned untouched, not reset. And the types this call adds are by construction
    // the ones the document did not name, i.e. the ones that held no entries at `save()` time, so starting
    // them empty here is the state the source game was also in at the save point. Registering after
    // `loadAsync` has fully returned (rather than mid-load) also keeps them out of the loader's own step-6
    // `resolveGameState` event window, which the source game never ran.
    registerAllStateWatchers(loadedGame);

    // Guard on the premise above rather than trusting it: if a future change makes the two registrars
    // disagree again, this fails loudly instead of quietly shrinking what gets compared.
    const watcherNamesOf = (game: IMatchLoadResult['game']) =>
        game.stateWatcherRegistrar.registeredWatchers.map((watcher) => watcher.name).sort();
    expect(watcherNamesOf(loadedGame))
        .withContext('the loaded game must register the same state watchers as the original, or the document comparison below silently skips sections')
        .toEqual(watcherNamesOf(context.game));

    options.sequence(loadedWrappers.p1, loadedWrappers.p2);
    options.sequence(context.player1, context.player2);

    const loadedDocument = save(loadedGame);
    const originalDocument = save(context.game);

    const normalizedOriginal = normalizeSavedMatch(originalDocument, { ignoreChatTimestamps: true });
    const normalizedLoaded = normalizeSavedMatch(loadedDocument, { ignoreChatTimestamps: true });

    expect(normalizedLoaded).withContext('the loaded game\'s continuation diverged from the unloaded original\'s')
        .toEqual(normalizedOriginal);

    return { originalDocument, loadedDocument, loadedGame, playersBySeat, loadedWrappers };
}
