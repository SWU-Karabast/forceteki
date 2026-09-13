import { EventName } from '../../../../server/game/core/Constants';
import { save } from '../../../../server/game/core/stateSerialization/MatchSerializer';
import { SaveIntegrityError } from '../../../../server/game/core/stateSerialization/SavedMatchInterfaces';
import { getPristineAbilityIdentifiers, resetPristineAbilityIdentifierCacheForTests } from '../../../../server/game/core/stateSerialization/PristineAbilityIdentifiers';

/**
 * Establishes AC6 (coordinate-drift hard fail) and AC7 (the writer returns the game exactly as it found
 * it) against a real `Game`. The module cache is cleared in `beforeEach` because `test-parallel` runs four
 * workers in random order over a shared process (`CLAUDE.md`), so a warm cache from an earlier spec would
 * make the isolation assertions pass without constructing anything.
 */
describe('PristineAbilityIdentifiers / the isolation helper', function() {
    beforeEach(function() {
        resetPristineAbilityIdentifierCacheForTests();
    });

    integration(function(contextRef) {
        describe('AC6 — Card.nextAbilityIdx coordinate drift hard-fails', function() {
            it('saves an unmodified position cleanly (the same position AC6 tampers with, before tampering)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['kachirho-militia'] },
                });

                const { context } = contextRef;
                expect(() => save(context.game)).not.toThrow();
            });

            it('throws SaveIntegrityError when a live ability identifier does not match the pristine set', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['kachirho-militia'] },
                });

                const { context } = contextRef;

                const ability = context.kachirhoMilitia.getTriggeredAbilities().find((a) => a.printedAbility);
                // Assignment, not a delta: safe to repeat identically if this spec replays under
                // whole-suite undo mode (ENABLE_UNDO_ALL_TESTS), since the mutated field isn't part of
                // engine state and so isn't restored by the rollback between the two `assertion()` calls.
                (ability as unknown as { abilityIdentifier: string }).abilityIdentifier = 'tampered-identifier-not-minted-by-a-pristine-instance';

                let thrown: unknown;
                try {
                    save(context.game);
                } catch (error) {
                    thrown = error;
                }

                expect(thrown).toBeInstanceOf(SaveIntegrityError);
                expect((thrown as Error).message).toContain('kachirho-militia');
                expect((thrown as Error).message).toContain('tampered-identifier-not-minted-by-a-pristine-instance');
            });
        });

        describe('AC7 — the writer returns the game exactly as it found it', function() {
            it('leaves registered watchers, object count, ongoing effects, and phase/round listener counts unchanged across a save', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    // MillenniumFalconPieceOfJunk registers a constant ability with sourceZoneFilter: Any at
                    // setup, exercising hazard 4 (ongoing-effect registration into the live engine).
                    player1: { spaceArena: ['millennium-falcon#piece-of-junk'] },
                });

                const { context } = contextRef;
                const game = context.game;

                // Cleared here (not just in the outer beforeEach): under whole-suite undo mode
                // (ENABLE_UNDO_ALL_TESTS) this test body runs twice — once, then again after a rollback —
                // and the module-level cache isn't part of engine state, so a `beforeEach` that only runs
                // once wouldn't reset it for the replay. Without this, the replay would see a warm cache
                // and the "cold-cache save advances lastGameObjectId" assertion below would fail exactly
                // the way a real regression would, but for an unrelated reason.
                resetPristineAbilityIdentifierCacheForTests();

                const watcherNamesBefore = game.stateWatcherRegistrar.registeredWatchers.map((w) => w.name).sort();
                const registeredObjectCountBefore = game.gameObjectManager.registeredObjectCount;
                const effectsLengthBefore = game.ongoingEffectEngine.effects.length;
                const effectsChangedSinceLastCheckBefore = game.ongoingEffectEngine.effectsChangedSinceLastCheck;
                const onPhaseEndedListenersBefore = game.listenerCount(EventName.OnPhaseEnded);
                const onRoundEndedListenersBefore = game.listenerCount(EventName.OnRoundEnded);
                const lastGameObjectIdBefore = game.gameObjectManager.lastGameObjectId;

                const firstDocument = save(game, { savedAt: '2020-01-01T00:00:00.000Z' });

                expect(game.stateWatcherRegistrar.registeredWatchers.map((w) => w.name).sort()).toEqual(watcherNamesBefore);
                expect(game.gameObjectManager.registeredObjectCount).toBe(registeredObjectCountBefore);
                expect(game.ongoingEffectEngine.effects.length).toBe(effectsLengthBefore);
                expect(game.ongoingEffectEngine.effectsChangedSinceLastCheck).toBe(effectsChangedSinceLastCheckBefore);
                expect(game.listenerCount(EventName.OnPhaseEnded)).toBe(onPhaseEndedListenersBefore);
                expect(game.listenerCount(EventName.OnRoundEnded)).toBe(onRoundEndedListenersBefore);

                // Cold-cache save: pristine construction allocated GameObjects (the card, its abilities,
                // limits, etc.), each taking an id even though none occupies a mapping slot. Monotonic, but
                // not a count of one, so this must never be toBe(lastGameObjectIdBefore + 1).
                expect(game.gameObjectManager.lastGameObjectId).toBeGreaterThan(lastGameObjectIdBefore);

                const lastGameObjectIdAfterFirstSave = game.gameObjectManager.lastGameObjectId;

                const secondDocument = save(game, { savedAt: '2020-01-01T00:00:00.000Z' });

                // Warm-cache save: the pristine identifier set is now cached, so no further construction
                // happens and the id counter does not move.
                expect(game.gameObjectManager.lastGameObjectId).toBe(lastGameObjectIdAfterFirstSave);

                expect(secondDocument).toEqual(firstDocument);
            });

            it('restores the live stateWatcherRegistrar even when an earlier teardown step throws (falsifier for the teardown-ordering finding)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'] },
                });

                const { context } = contextRef;
                const game = context.game;
                resetPristineAbilityIdentifierCacheForTests();

                const originalRegistrar = game.stateWatcherRegistrar;
                const originalUnapplyAndRemove = game.ongoingEffectEngine.unapplyAndRemove.bind(game.ongoingEffectEngine);

                // Stub the first teardown step to throw, simulating a future teardown step that isn't a
                // no-op. Before the fix, this would leave game.stateWatcherRegistrar pointed at the
                // throwaway stand-in for the rest of the live game; the assertion below fails on the
                // pre-fix ordering and passes once the registrar restore runs unconditionally.
                game.ongoingEffectEngine.unapplyAndRemove = () => {
                    throw new Error('injected teardown failure');
                };

                try {
                    expect(() => save(game)).toThrowError('injected teardown failure');
                } finally {
                    game.ongoingEffectEngine.unapplyAndRemove = originalUnapplyAndRemove;
                }

                expect(game.stateWatcherRegistrar).toBe(originalRegistrar);
            });

            it('still unregisters a repeatable ability-limit listener even when an earlier teardown step throws (falsifier for the P2AD-1 listener-leak residual, hazard 3)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    // kachirho-militia's printed triggered ability carries `limit: AbilityHelper.limit.perRound(1)`
                    // (a RepeatableAbilityLimit), which registers a real `game.on(EventName.OnRoundEnded, ...)`
                    // listener the moment pristine construction constructs its CardAbility (CardAbility's own
                    // constructor calls `this.limit.registerEvents()`).
                    player1: { groundArena: ['kachirho-militia'] },
                });

                const { context } = contextRef;
                const game = context.game;
                resetPristineAbilityIdentifierCacheForTests();

                const onRoundEndedListenersBefore = game.listenerCount(EventName.OnRoundEnded);
                const originalUnapplyAndRemove = game.ongoingEffectEngine.unapplyAndRemove.bind(game.ongoingEffectEngine);

                // Before the fix, a throw from this first teardown step (hazard 4) also skipped the
                // limit-unregister loop (hazard 3) entirely, leaving this OnRoundEnded listener registered on
                // the live `game` for the rest of the match. This assertion fails on that pre-fix flat
                // sequencing and passes once each teardown step is independently guarded.
                game.ongoingEffectEngine.unapplyAndRemove = () => {
                    throw new Error('injected teardown failure');
                };

                try {
                    expect(() => save(game)).toThrowError('injected teardown failure');
                } finally {
                    game.ongoingEffectEngine.unapplyAndRemove = originalUnapplyAndRemove;
                }

                expect(game.listenerCount(EventName.OnRoundEnded)).toBe(onRoundEndedListenersBefore);
            });

            it('still cleans up state-watcher listeners even when an earlier teardown step throws (falsifier for the P2AD-1 listener-leak residual, hazard 2)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    // guardian-of-the-whills registers a cardsPlayedThisPhase state watcher during pristine
                    // construction. Every StateWatcher listens for `onPhaseEnded` (its reset trigger; see
                    // StateWatcher.registerListeners), so a leaked watcher listener is visible as an inflated
                    // OnPhaseEnded count.
                    player1: { groundArena: ['guardian-of-the-whills'] },
                });

                const { context } = contextRef;
                const game = context.game;
                resetPristineAbilityIdentifierCacheForTests();

                const onPhaseEndedListenersBefore = game.listenerCount(EventName.OnPhaseEnded);
                const originalUnapplyAndRemove = game.ongoingEffectEngine.unapplyAndRemove.bind(game.ongoingEffectEngine);

                // Before the fix, a throw from this first teardown step (hazard 4) also skipped the
                // watcher-cleanup loop (hazard 2) entirely, leaving this OnPhaseEnded listener registered on
                // the live `game` for the rest of the match. This assertion fails on that pre-fix flat
                // sequencing and passes once each teardown step is independently guarded.
                game.ongoingEffectEngine.unapplyAndRemove = () => {
                    throw new Error('injected teardown failure');
                };

                try {
                    expect(() => save(game)).toThrowError('injected teardown failure');
                } finally {
                    game.ongoingEffectEngine.unapplyAndRemove = originalUnapplyAndRemove;
                }

                expect(game.listenerCount(EventName.OnPhaseEnded)).toBe(onPhaseEndedListenersBefore);
            });
        });

        describe('the shared ability surface includes a pilot-attached leader\'s piloting action', function() {
            it('derives an identifier set that makes a used piloting action limit representable, for a pilot-attached Poe Dameron', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: ['millennium-falcon#piece-of-junk'],
                        resources: 5,
                    },
                });

                const { context } = contextRef;

                // Resolve the pilot-deploy action with resources available, per the owning plan: the test
                // harness has no way to inject a pilot-deployed leader directly (DeployType.LeaderUpgrade
                // appears nowhere under test/helpers/).
                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Flip Poe Dameron and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it');
                context.player1.clickCard(context.millenniumFalcon);

                expect(context.poeDameron.isAttached()).toBeTrue();

                // Simulate having used the piloting action this round, which forces the writer to check its
                // abilityIdentifier against the pristine set derived for this leader's class.
                const pilotingAction = context.poeDameron.pilotingActionAbilities[0];
                pilotingAction.limit.increment(context.player1Object);

                expect(() => save(context.game)).not.toThrow();

                const document = save(context.game);
                const leaderEntry = document.players[0].leader;
                expect(leaderEntry.deployed).toBeFalse();
                expect(leaderEntry.limits.some((limit) => 'usesByPlayer' in limit && (limit as { usesByPlayer: Record<string, number> }).usesByPlayer.p1 === 1)).toBeTrue();
            });
        });
    });

    describe('module-level derivation (no live Game required beyond fixture setup)', function() {
        integration(function(contextRef) {
            it('caches the derived identifier set per card data id', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['kachirho-militia'] },
                });

                const { context } = contextRef;
                const first = getPristineAbilityIdentifiers(context.kachirhoMilitia);
                const second = getPristineAbilityIdentifiers(context.kachirhoMilitia);

                expect(second).toBe(first);
                expect(first.size).toBeGreaterThan(0);

                // Content, not just size: kachirho-militia's printed triggered ability actually carries a
                // limit and reaches AbilityLimitSerializer's pristineIdentifiers.has(...) comparison (unlike
                // MillenniumFalconPieceOfJunk in the AC7 spec above, whose only limit-bearing candidate is a
                // constant ability excluded from the surface by design, so "save doesn't throw" there
                // proves nothing about this set's actual content).
                const liveAbility = context.kachirhoMilitia.getTriggeredAbilities().find((a) => a.printedAbility);
                expect(liveAbility).toBeDefined();
                expect(first.has(liveAbility.abilityIdentifier)).toBeTrue();
            });
        });
    });
});
