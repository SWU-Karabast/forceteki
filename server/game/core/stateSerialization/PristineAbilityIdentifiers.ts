import { cards as cardImplementations } from '../../cards/Index';
import { createUnimplementedCard } from '../card/CardHelpers';
import type { Card } from '../card/Card';
import type { StateWatcherName } from '../Constants';
import type { StateWatcher } from '../stateWatcher/StateWatcher';
import type { StateWatcherRegistrar } from '../stateWatcher/StateWatcherRegistrar';
import { getLimitBearingAbilitySurface } from './SharedAbilitySurface';

const pristineIdentifierCacheByCardDataId = new Map<string, ReadonlySet<string>>();

/**
 * Test-only. `test-parallel` runs four workers in random order over a shared process (`CLAUDE.md`), so a
 * cache left warm by an earlier spec would let the isolation assertions pass without this spec's own
 * construction actually happening. Cleared in `PristineAbilityIdentifiers.spec.ts`'s `beforeEach`.
 */
export function resetPristineAbilityIdentifierCacheForTests(): void {
    pristineIdentifierCacheByCardDataId.clear();
}

/**
 * A minimal recording stand-in for `StateWatcherRegistrar`, installed in place of `game.stateWatcherRegistrar`
 * only for the duration of pristine construction. It implements the only two members the construction path
 * uses (`registerWatcher`, `isRegistered`) so the teardown below can call `cleanupOnRemove` on exactly the
 * watchers construction created.
 *
 * It is a plain object, **not** a subclass: `StateWatcherRegistrar` is `@registerState()`, and a
 * `@registerState` class may not be extended (`CLAUDE.md`). Being a plain object also means it registers
 * nothing with the live snapshot machinery and doesn't pick up `alwaysTrackState`, which removes the
 * round-2 leak hazard entirely.
 */
class RecordingStateWatcherRegistrarStandIn {
    private readonly watchersByName = new Map<StateWatcherName, StateWatcher>();

    public get recordedWatchers(): StateWatcher[] {
        return [...this.watchersByName.values()];
    }

    public isRegistered(name: StateWatcherName): boolean {
        return this.watchersByName.has(name);
    }

    public registerWatcher<TWatcher extends StateWatcher>(
        name: StateWatcherName,
        watcherFactory: (registrar: StateWatcherRegistrar) => TWatcher
    ): TWatcher {
        // Mirrors the real StateWatcherRegistrar.registerWatcher's dedup: a pristine card's constructor
        // chain can legitimately request the same watcher name more than once (a mixin's constructor and
        // the card's own setupStateWatchers both call e.g. stateWatchers.cardsPlayedThisPhase()), and the
        // real registrar returns the existing instance rather than constructing a second one. A watcher's
        // own constructor asserts it is not already registered on the registrar it is given, so failing to
        // dedup here would trip that assertion on the second call.
        let watcher = this.watchersByName.get(name) as TWatcher;
        if (!watcher) {
            watcher = watcherFactory(this as unknown as StateWatcherRegistrar);
            this.watchersByName.set(name, watcher);
        }
        return watcher;
    }
}

/**
 * Derives the set of `abilityIdentifier`s that a **pristine** instance of `card`'s class would mint from
 * the same card data, by constructing a throwaway instance and reading {@link getLimitBearingAbilitySurface}
 * off it. Used by `AbilityLimitSerializer` as the coordinate-drift guard: if the live card is about to
 * emit an identifier this set doesn't contain, the writer refuses to save rather than publish an
 * untrustworthy coordinate.
 *
 * Pristine construction has four side effects on the live game, all of which are neutralised before this
 * function returns; see the ordered teardown in the `finally` block below. This must run as **one**
 * non-nesting `gameObjectManager.createWithoutRefsUnsafe(...)` call — `_disableRegistration` is a plain
 * boolean, not a depth counter, so a nested call would silently stop disabling registration too early.
 */
export function getPristineAbilityIdentifiers(card: Card): ReadonlySet<string> {
    const cardData = card.printedCardData;

    const cached = pristineIdentifierCacheByCardDataId.get(cardData.id);
    if (cached) {
        return cached;
    }

    const game = card.game;
    const gameObjectManager = game.gameObjectManager;

    // Hazard 4 (ongoing-effect registration into the live engine): capture the effect set and the dirty
    // flag *before* construction, so the effect delta below is restoration (removing only what this
    // construction added moments earlier, identified by set difference) rather than mutation of anything
    // the game owned.
    const effectsBefore = new Set(game.ongoingEffectEngine.effects);
    const effectsChangedSinceLastCheckBefore = game.ongoingEffectEngine.effectsChangedSinceLastCheck;

    // Hazard 2 (state-watcher registration): swap in the recording stand-in for the duration of
    // construction only.
    const originalStateWatcherRegistrar = game.stateWatcherRegistrar;
    const standIn = new RecordingStateWatcherRegistrarStandIn();
    game.stateWatcherRegistrar = standIn as unknown as StateWatcherRegistrar;

    let pristineCard: Card | undefined;
    try {
        // Hazard 1 (object-manager registration): createWithoutRefsUnsafe suppresses mapping insertion for
        // everything allocated inside the handler (the card, each CardAbility, each AbilityLimit, each
        // ConstantAbility, each OngoingEffect/OngoingEffectImpl, each watcher the stand-in creates), so none
        // of it occupies a live uuid slot. lastGameObjectId still advances monotonically past it below.
        pristineCard = gameObjectManager.createWithoutRefsUnsafe(() => {
            // Selecting the constructor exactly as Deck.buildCardsFromSetCodeAsync does, so a class
            // mismatch (e.g. a stale implementation-id check) is itself caught by the guard rather than
            // silently constructing the wrong class.
            //
            // Deliberately not `Game.initialiseTokens`'s three-argument `new tokenConstructor(player,
            // cardData, additionalProperties)`: a token unit in an arena does reach this derivation (via
            // AbilityLimitSerializer), and a future token whose setupCardAbilities branches on
            // additionalProperties would derive a pristine identifier set that doesn't match its live
            // instance, tripping the drift guard on every save of a board containing it. Today only
            // Shield reads that argument (for highPriorityRemoval), which doesn't affect ability
            // registration, so no identifier set currently differs.
            const CardConstructor = cardImplementations.get(cardData.id) ?? createUnimplementedCard;
            return new CardConstructor(card.owner, cardData) as Card;
        });

        const identifiers = new Set<string>();
        for (const ability of getLimitBearingAbilitySurface(pristineCard)) {
            identifiers.add(ability.abilityIdentifier);
        }

        pristineIdentifierCacheByCardDataId.set(cardData.id, identifiers);
        return identifiers;
    } finally {
        // Ordered teardown of all four hazards, restoring the game exactly as pristine construction found
        // it (this is restoration, not mutation, in both the effect-delta and watcher-teardown senses).
        //
        // Each step below is independently guarded: a throw from one step must never prevent the others
        // from running. Before this, all three steps ran as a single unguarded sequence inside this
        // `finally`, so a throw from the first (`unapplyAndRemove`) would skip not only the
        // `effectsChangedSinceLastCheck` restore but also the watcher-cleanup and limit-unregister loops
        // entirely, leaving real listeners registered on the live `game` (via `game.on`) for the lifetime
        // of the match. None of today's concrete implementations of the steps below actually throws, but
        // this teardown does not rely on that holding. The first error encountered (if any) is rethrown
        // once every step has been attempted, so a teardown failure surfaces to the caller rather than
        // masquerading as a successful derivation; it is never silently swallowed.
        //
        // The registrar restore (hazard 2's field itself) is split into its own inner `finally` so it is
        // unconditional: a throw from any of the steps below must never leave the live game holding the
        // throwaway stand-in, since every subsequent Card.onInitialize -> setupStateWatchers in that game
        // would then silently register into the abandoned stand-in instead of the real registrar.
        try {
            let firstTeardownError: unknown;

            // Hazard 4a: remove only the effects this construction added.
            try {
                game.ongoingEffectEngine.unapplyAndRemove((effect) => !effectsBefore.has(effect));
            } catch (err) {
                firstTeardownError ??= err;
            }

            // Hazard 4b: restore the dirty flag regardless of whether the removal above succeeded, since
            // it is independent bookkeeping rather than a consequence of that call.
            try {
                game.ongoingEffectEngine.effectsChangedSinceLastCheck = effectsChangedSinceLastCheckBefore;
            } catch (err) {
                firstTeardownError ??= err;
            }

            // Hazard 2 (listener cleanup only; the registrar field itself is restored below): clean up
            // every watcher the stand-in recorded. `cleanupOnRemove`'s `oldState` argument is unused by
            // `StateWatcher`'s own implementation (it only unregisters listeners), so an empty record is
            // sufficient. P3-PB2: deliberately NOT `getStateSerializerFor(watcher).serializer.serialize(watcher)`
            // - a real encode can throw (a non-finite number, an undefined array element, ...), which would
            // make save-tier teardown newly fallible inside a `try` whose whole job is to run every remaining
            // teardown step, in exchange for a value nothing reads.
            try {
                for (const watcher of standIn.recordedWatchers) {
                    watcher.cleanupOnRemove({});
                }
            } catch (err) {
                firstTeardownError ??= err;
            }

            // Hazard 3 (limit event listeners): unregister every limit on every ability in the same shared
            // surface used above. This surface is exhaustive for a freshly constructed, ungained,
            // non-event card, which is every card this function is ever called with (`save()` derives
            // pristine sets only for arena cards, bases and leaders); an `EventCard`'s `EventAbility` also
            // carries a limit but is never reached here because no hand card is ever derived.
            try {
                if (pristineCard) {
                    for (const ability of getLimitBearingAbilitySurface(pristineCard)) {
                        ability.limit?.unregisterEvents();
                    }
                }
            } catch (err) {
                firstTeardownError ??= err;
            }

            if (firstTeardownError !== undefined) {
                throw firstTeardownError;
            }
        } finally {
            // Restore the real registrar unconditionally, even if a step above threw.
            game.stateWatcherRegistrar = originalStateWatcherRegistrar;
        }
    }
}
