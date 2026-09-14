import { save } from '../../../../server/game/core/stateSerialization/MatchSerializer';
import { loadAsync } from '../../../../server/game/core/stateSerialization/MatchLoader';
import { MatchLoadError } from '../../../../server/game/core/stateSerialization/MatchLoadError';
import { registeredWatcherDecoderNames } from '../../../../server/game/core/stateSerialization/StateWatcherDeserializer';
import { PhaseName, StateWatcherName, ZoneName } from '../../../../server/game/core/Constants';
import { PlayerTimeRemainingStatus } from '../../../../server/game/core/actionTimer/IActionTimer';
import { buildLoadConfig } from '../../../helpers/MatchLoaderHarness';
import { getUserWithDefaultsSet } from '../../../../server/Settings';
import { Game } from '../../../../server/game/core/Game';
import { UiPrompt } from '../../../../server/game/core/gameSteps/prompts/UiPrompt';

/**
 * Establishes `P2-C2`'s acceptance criteria for `MatchLoader.loadAsync` against real saved documents,
 * produced by `MatchSerializer.save` on a real `Game` (never hand-built), and loaded into a second,
 * independent headless `Game` via `buildLoadConfig`. See `docs/plans/02-semantic-save-load.md` work item C
 * for the full derivation.
 */
describe('MatchLoader.loadAsync', function() {
    integration(function(contextRef) {
        describe('AC1 — document round-trip', function() {
            it('reproduces a rich action-phase board losslessly, including a cross-owned resource', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish', 'strike-true', 'cure-wounds', 'vigilance', 'cripple-authority', 'death-star-stormtrooper'],
                        discard: ['takedown', 'waylay'],
                        // An explicit `resources` array is used verbatim (no default padding to 20, unlike
                        // an omitted one), so enough ready fillers are listed here to afford the extra hand
                        // cards played below (cure-wounds/vigilance/cripple-authority/death-star-stormtrooper).
                        resources: [
                            { card: 'disarm', exhausted: true },
                            { card: 'the-emperors-legion', exhausted: false },
                            // None of these off-aspect event cards share an aspect with this leader/base
                            // (command/villainy), so each pays the full aspect penalty; this many ready
                            // fillers comfortably covers all four plus a margin.
                            ...Array.from({ length: 40 }, () => ({ card: 'pyke-sentinel', exhausted: false })),
                        ],
                        groundArena: [
                            { card: 'lom-pyke#dealer-in-truths', damage: 1, exhausted: true, upgrades: ['academy-training'], capturedUnits: ['battlefield-marine'] },
                            'atat-suppressor',
                        ],
                        spaceArena: ['cartel-spacer'],
                        base: { card: 'echo-base', damage: 3, upgrades: ['military-academy'], capturedUnits: ['cartel-turncoat'] },
                        leader: { card: 'emperor-palpatine#galactic-ruler', deployed: true },
                        hasForceToken: true,
                    },
                    player2: {
                        hand: ['viper-probe-droid'],
                        groundArena: ['wampa'],
                        // Padded well past player1's own resource pool (see player1.resources' comment) so
                        // Cripple Authority's "controls more resources than you" condition -- compared by
                        // total resources controlled, not ready count -- is genuinely true when player1
                        // plays it below, causing a real discard (cardsDiscardedThisPhase) rather than one
                        // hand-tuned to barely pass.
                        resources: [
                            { card: 'vanquish', exhausted: false },
                            ...Array.from({ length: 45 }, () => ({ card: 'pyke-sentinel', exhausted: false })),
                        ],
                        credits: 2,
                    },
                });
                const { context } = contextRef;

                // A resolved attack so attacksThisPhase / damageDealtThisPhase / unitsDamagedThisPhase all
                // hold entries.
                context.player1.clickCard(context.atatSuppressor);
                context.player1.clickCard(context.wampa);

                // A cross-owned resource: p2 takes control of one of p1's resources, produced through the
                // real engine `takeControl` API (P2-C1's `IArenaUnitEntry.controller` pattern's resource
                // sibling), rather than hand-built into the document.
                const stolenResource = context.player1Object.resources.find((c) => c.internalName === 'the-emperors-legion');
                stolenResource.takeControl(context.player2Object, ZoneName.Resource);

                // Decision 4: exercise every state-watcher decoder that no other spec in this
                // suite ever decodes a real entry for (basesHealed, cardsDiscarded, cardsDrawn,
                // cardsEnteredPlay, forceUsed, tokensCreated, unitsHealed), so a wrong field mapping in one
                // of them cannot pass silently through an empty section. Each action below is a real,
                // in-game cause of the corresponding watcher entry; see the per-section assertions after the
                // round-trip below.
                context.player2.passAction();
                // Use the Force (forceUsedThisPhase) to heal 6 damage from a unit (unitsHealedThisPhase) --
                // atatSuppressor took combat damage from the attack above, so this is a genuine heal.
                context.player1.clickCard(context.cureWounds);
                context.player1.clickCard(context.atatSuppressor);

                context.player2.passAction();
                // "Choose two, in any order": heal damage from a base (basesHealedThisPhase -- echoBase
                // already carries damage from setup) and give a Shield token to a unit
                // (tokensCreatedThisPhase).
                context.player1.clickCard(context.vigilance);
                context.player1.clickPrompt('Heal 5 damage from a base.');
                context.player1.clickCard(context.p1Base);
                context.player1.clickPrompt('Give a Shield token to a unit.');
                context.player1.clickCard(context.cartelSpacer);

                context.player2.passAction();
                // Draws a card (cardsDrawnThisPhase); since the earlier resource steal leaves player2
                // controlling more resources than player1, player2 also discards a card from hand
                // (cardsDiscardedThisPhase -- viperProbeDroid, player2's only hand card).
                context.player1.clickCard(context.crippleAuthority);
                context.player2.clickCard(context.viperProbeDroid);

                context.player2.passAction();
                // Plays a vanilla ground unit from hand (cardsEnteredPlayThisPhase). Deliberately vanilla
                // (no When Played/lasting-effect ability): AC1's core claim is a *lossless* round-trip, and
                // any card here that leaves a for-this-phase effect behind would make `before`/`after`
                // diverge for a real reason unrelated to what this addition is exercising.
                context.player1.clickCard(context.deathStarStormtrooper);

                const before = save(context.game);
                for (const watcherName of [
                    StateWatcherName.BasesHealedThisPhase,
                    StateWatcherName.CardsDiscardedThisPhase,
                    StateWatcherName.CardsDrawnThisPhase,
                    StateWatcherName.CardsEnteredPlayThisPhase,
                    StateWatcherName.ForceUsedThisPhase,
                    StateWatcherName.TokensCreatedThisPhase,
                    StateWatcherName.UnitsHealedThisPhase,
                ]) {
                    const section = before.stateWatchers.find((candidate) => candidate.watcher === watcherName);
                    expect(section?.entries.length)
                        .withContext(`expected "${watcherName}" to have at least one entry to decode, so its decoder is actually exercised`)
                        .toBeGreaterThan(0);
                }
                const { game: loadedGame } = await loadAsync(before, buildLoadConfig(context));
                const after = save(loadedGame);

                expect(after).toEqual({ ...before, savedAt: after.savedAt });

                for (const zone of ['hand', 'deck', 'discard', 'outsideTheGame'] as const) {
                    expect(after.players[0][zone]).toEqual(before.players[0][zone]);
                    expect(after.players[1][zone]).toEqual(before.players[1][zone]);
                }
                expect(after.players[0].resources).toEqual(before.players[0].resources);
                expect(after.players[1].resources).toEqual(before.players[1].resources);
                expect(after.players[0].groundArena).toEqual(before.players[0].groundArena);
                expect(after.players[1].groundArena).toEqual(before.players[1].groundArena);

                // The cross-owned resource specifically: it must sit in the controller's live resources at
                // the document's ordinal with its ownerSeat preserved, not silently land back under its
                // owner (the defect §3.2 of the plan proves a naive pre-pass `takeControl` would cause).
                const loadedStolenEntry = after.players[1].resources.find((entry) => entry.card === 'the-emperors-legion');
                expect(loadedStolenEntry).toBeDefined();
                expect(loadedStolenEntry.ownerSeat).toBe('p1');
            });
        });

        describe('AC8 — chat replaces, never appends', function() {
            it('the loaded chat exactly matches the document and contains none of the driven setup\'s own messages', async function() {
                await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
                const { context } = contextRef;
                context.game.addMessage('{0} does a custom thing', context.player1Object);

                const document = save(context.game);
                const { game: loadedGame } = await loadAsync(document, buildLoadConfig(context));

                // The document's own chat legitimately contains the *source* game's real setup messages
                // (its own shuffle/mulligan/resourcing) -- those are not the concern. What must not happen
                // is the *driven setup that loadAsync itself runs* appending a second copy on top: the
                // loaded length must equal the document's exactly, and every entry must equal the document's
                // scrubbed form (an append would make the loaded array longer than the document's).
                expect(loadedGame.gameChat.messages.length).toBe(document.chat.length);
                expect(loadedGame.gameChat.messages.map((m) => JSON.stringify(m.message))).toEqual(document.chat.map((m) => JSON.stringify(m.message)));
            });
        });

        describe('AC9 — timers', function() {
            it('restores the main timer as paused with the exact saved remaining seconds, for both players', async function() {
                await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
                const { context } = contextRef;

                // The integration harness has no option to construct a timer-enabled source game (real
                // callers of `loadAsync` will pass a document whose `settings.useActionTimer` reflects a
                // production match); flipping the document's own field after a normal save is equivalent
                // for this purpose, since `MatchLoader` reads only `saved.settings.useActionTimer` to decide
                // which timer implementation the constructed `Game` uses.
                const document = save(context.game);
                document.settings.useActionTimer = true;
                document.timers['p1'].mainRemainingSeconds = 47;
                document.timers['p2'].mainRemainingSeconds = 118;

                const { game: loadedGame, playersBySeat } = await loadAsync(document, buildLoadConfig(context));

                // DISCLOSED LIMITATION: `loadAsync` is one atomic async call with no seam to observe state
                // between `restoreMainTimeRemainingSeconds` (step 5.4) and pipeline re-entry (step 6, which
                // re-opens the action-phase prompt and legitimately starts the *active* player's turn
                // timer). So `isRunning`/`timeRemainingStatus` are asserted only for the non-active player,
                // for whom no prompt fires and a left-running main timer would actually be observable; the
                // exact restored value is asserted for both, which is AC9's primary claim.
                const activeSeat = document.game.actionPhaseActivePlayer;
                for (const [seat, expected] of [['p1', 47], ['p2', 118]] as const) {
                    const timer = playersBySeat.get(seat).actionTimer;
                    expect(timer.mainTimeRemainingSeconds).toBe(expected);
                    if (seat !== activeSeat) {
                        expect(timer.isRunning).toBeFalse();
                        expect(timer.timeRemainingStatus).toBe(PlayerTimeRemainingStatus.NoAlert);
                    }
                }
                void loadedGame;
            });

            it('round-trips a non-default mainRemainingSeconds through save -> loadAsync -> save', async function() {
                await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
                const { context } = contextRef;

                const document = save(context.game);
                document.settings.useActionTimer = true;
                document.timers['p1'].mainRemainingSeconds = 63;

                const { game: loadedGame } = await loadAsync(document, buildLoadConfig(context));
                const reSaved = save(loadedGame);

                expect(reSaved.timers['p1'].mainRemainingSeconds).toBe(63);
            });

            it('round-trips the full default main time via NoopActionTimer when timers are disabled', async function() {
                await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
                const { context } = contextRef;

                const document = save(context.game);
                const { game: loadedGame } = await loadAsync(document, buildLoadConfig(context));
                const reSaved = save(loadedGame);

                expect(reSaved.timers).toEqual(document.timers);
            });
        });

        describe('AC10 — RNG', function() {
            it('restores the seed and generator state exactly', async function() {
                await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
                const { context } = contextRef;

                const document = save(context.game);
                const { game: loadedGame } = await loadAsync(document, buildLoadConfig(context));

                expect(loadedGame.randomSeed).toBe(document.rng.seed);
                expect(loadedGame.randomGenerator.rngState).toEqual(document.rng.state as object);
            });
        });

        describe('Seat binding', function() {
            it('binds each seat to the config-supplied user by identity, not by Game.getPlayers() array position', async function() {
                // Game.getPlayers() is Object.values(playersAndSpectators), keyed by player.id; JS orders
                // array-index-like string keys ('7') numerically ahead of every other key regardless of
                // insertion order, so a positional zip of orderedSeats against getPlayers() would bind p1's
                // document to whichever user id happens to sort first -- here, '7' (p2's id) sorts before
                // 'user-a' (p1's id), so a positional bind would silently swap every fact onto the wrong
                // player. Binding by game.getPlayerById(user.id) is immune to that ordering.
                await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
                const { context } = contextRef;

                const document = save(context.game);
                const config = buildLoadConfig(context, {
                    seats: [
                        { seat: 'p1', user: getUserWithDefaultsSet({ id: 'user-a', username: 'seat-binding-p1' }) },
                        { seat: 'p2', user: getUserWithDefaultsSet({ id: '7', username: 'seat-binding-p2' }) },
                    ],
                });

                const { playersBySeat } = await loadAsync(document, config);

                expect(playersBySeat.get('p1').id).toBe('user-a');
                expect(playersBySeat.get('p2').id).toBe('7');
            });
        });

        describe('AC12 — manifest passthrough', function() {
            it('surfaces a fabricated engineOnlyFacts entry unchanged and does not gate on it', async function() {
                await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
                const { context } = contextRef;

                const document = save(context.game);
                document.engineOnlyFacts = [
                    { category: 'lastingEffect', source: null, target: null, duration: null, description: 'a fabricated fact with no corresponding dropped effect' },
                ];

                const { engineOnlyFacts } = await loadAsync(document, buildLoadConfig(context));
                expect(engineOnlyFacts).toEqual(document.engineOnlyFacts);
            });
        });

        describe('AC14 — a genuinely degraded save', function() {
            it('loads a board whose only-for-this-phase buff was dropped, defeating the unit for real and naming the drop in the manifest', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['attack-pattern-delta'],
                        groundArena: ['wampa'],
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.attackPatternDelta);
                context.player1.clickCard(context.wampa);
                // The chain offers two further optional targets; there is only one friendly unit, so the
                // remaining steps have no legal target and resolve automatically.

                // Wampa's printed HP is 5 (test/json/Card/wampa.json); the +3/+3 buff brings it to 8. Damage
                // it above 5 but at/below 8 so it is alive only because of the dropped buff.
                context.wampa.setDamageForStateInjection(6);

                const document = save(context.game);
                expect(document.engineOnlyFacts.some((fact) => fact.category === 'lastingEffect')).toBeTrue();

                // RESOLVED DIVERGENCE (decision recorded in this unit's fix-pass COMPLETE report): a bare
                // `Game.resolveGameState(true)` call, with no live event window open, crashed here with an
                // unhandled `TypeError` (`Game.addSubwindowEvents` dereferencing a null
                // `currentEventWindow`) instead of resolving the defeat the dropped buff causes. `loadAsync`
                // now drives a real root `EventWindow` on `game.pipeline` itself (see its own comment on step
                // 6) so this resolves exactly as it would during live play: the load succeeds, and Wampa --
                // alive only because of the dropped buff -- is genuinely defeated and moved to discard. The
                // pinned restore order (position injected, then state resolved, then ability limits, then
                // `postRollbackOperations`) is unchanged. Wampa has no triggered ability, so this case alone
                // does not exercise a live trigger firing during the drive -- see the sibling case below for
                // that.
                const { game: loadedGame } = await loadAsync(document, buildLoadConfig(context));

                const loadedWampa = loadedGame.findAnyCardsInAnyList((card) => card.internalName === 'wampa')[0];
                expect(loadedWampa).toBeDefined();
                expect(loadedWampa.zoneName).toBe('discard');
                expect(loadedGame.findAnyCardsInPlay((card) => card.internalName === 'wampa').length).toBe(0);

                // The document's own chat predates the defeat (the buff was still active when it was
                // saved), so the loaded chat must contain every one of the document's messages unchanged,
                // plus exactly one new entry: the live engine's own narration of the defeat this load-time
                // resolution genuinely causes ("Wampa's ... is defeated due to having no remaining HP"),
                // proving step 6 resolves this "the way a live game would" rather than silently. Measured
                // against this fix: document chat 10, loaded chat 11.
                expect(loadedGame.gameChat.messages.length).toBe(document.chat.length + 1);
                expect(loadedGame.gameChat.messages.slice(0, document.chat.length).map((m) => JSON.stringify(m.message)))
                    .toEqual(document.chat.map((m) => JSON.stringify(m.message)));
            });

            it('loads a board whose dropped buff causes a genuinely triggered, mandatory, zero-target "when defeated" ability to fire for real', async function() {
                // confederate-courier (hp 1, "When Defeated: Create a Battle Droid token") is mandatory and
                // offers no choice and no target, so this is the narrowest possible case that still proves
                // this step's root fix: driving the load-time event window on `game.pipeline` itself (not a
                // standalone pipeline) so the triggered ability's own resolver -- queued via `game.queueStep`
                // -- actually runs instead of being queued onto `game.pipeline` and silently discarded by
                // `postRollbackOperations`'s `pipeline.clearSteps()`.
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['attack-pattern-delta'],
                        spaceArena: ['confederate-courier'],
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.attackPatternDelta);
                context.player1.clickCard(context.confederateCourier);
                // Confederate Courier's printed HP is 1; the +3/+3 buff brings it to 4. Damage it above 1
                // but at/below 4 so it is alive only because of the dropped buff.
                context.confederateCourier.setDamageForStateInjection(2);

                const document = save(context.game);
                expect(document.engineOnlyFacts.some((fact) => fact.category === 'lastingEffect')).toBeTrue();

                const { game: loadedGame } = await loadAsync(document, buildLoadConfig(context));

                const loadedCourier = loadedGame.findAnyCardsInAnyList((card) => card.internalName === 'confederate-courier')[0];
                expect(loadedCourier).toBeDefined();
                expect(loadedCourier.zoneName).toBe('discard');

                // The mandatory trigger actually fired: a Battle Droid token now exists in play on the
                // loaded game's side, genuinely created during the load-time resolution rather than dropped.
                const loadedBattleDroids = loadedGame.findAnyCardsInPlay((card) => card.internalName === 'battle-droid');
                expect(loadedBattleDroids.length).toBe(1);
            });
        });

        describe('Decoder completeness', function() {
            it('registers a decoder for every StateWatcherName', function() {
                expect(registeredWatcherDecoderNames().sort()).toEqual(Object.values(StateWatcherName).sort());
            });
        });

        describe('Step 6 event-window drive (root fix)', function() {
            it('rejects a genuine player decision, naming the actual pending prompt rather than asserting an unverified cause', async function() {
                // Two units simultaneously defeated by a dropped for-this-phase buff, each with the same
                // mandatory "when defeated" trigger (Confederate Courier -- create a Battle Droid token),
                // require the controller to choose an order to resolve them in: a genuine player decision
                // this loader cannot supply headlessly. Before this step's root fix, this same rejection
                // fired for the wrong reason (the resolver was queued onto a pipeline nothing drove); now it
                // fires because a real prompt is genuinely open, and the diagnostic names it instead of
                // guessing at a scenario.
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['attack-pattern-delta'], spaceArena: ['confederate-courier', 'confederate-courier'] },
                });
                const { context } = contextRef;
                context.player1.clickCard(context.attackPatternDelta);
                const couriers = context.player1.findCardsByName('confederate-courier');
                context.player1.clickCard(couriers[0]);
                context.player1.clickCard(couriers[1]);
                couriers[0].setDamageForStateInjection(2);
                couriers[1].setDamageForStateInjection(2);

                const document = save(context.game);
                let caught: unknown;
                try {
                    await loadAsync(document, buildLoadConfig(context));
                } catch (error) {
                    caught = error;
                }
                expect(caught).toBeInstanceOf(MatchLoadError);
                expect((caught as Error).message).toContain('paused instead of completing');
                expect((caught as Error).message).toContain('open player prompt');
            });

            it('rejects a degraded save that would end the game outright, after the router has already been told (disclosed)', async function() {
                // A base-lethal degraded save resolves through the real defeat/win-condition path during
                // step 6, which calls `Game.endGame()` for real -- this loader's rethrow scoping only covers
                // `handleError`, not `handleGameEnd`/`sendGameState`, so those genuinely fire against the
                // caller's real router *before* this guard can reject. The guard's job is only to stop
                // `loadAsync` from also returning a "successful" result on top of that; see `loadAsync`'s own
                // comment on `Lobby.handleGameEnd()`'s no-argument trap for why the already-fired calls
                // cannot be undone here. The harness's own router double (`buildLoadConfig`) has no
                // `sendGameState`, which would make `endGame()` fall back to queuing a `GameOverPrompt`
                // instead (a different, also-rejecting code path) -- this test supplies one to exercise the
                // production-shaped path instead.
                await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
                const { context } = contextRef;
                context.p1Base.setDamageForStateInjection(40);
                const document = save(context.game);

                const routerCalls: string[] = [];
                const router: any = {
                    id: 'p2c2-ended-guard-router',
                    handleError: () => { /* production-like: log only, never rethrow */ },
                    handleGameEnd: () => routerCalls.push('handleGameEnd'),
                    sendGameState: () => routerCalls.push('sendGameState'),
                    handleUndoGameEnd: () => routerCalls.push('handleUndoGameEnd'),
                };

                let caught: unknown;
                try {
                    await loadAsync(document, {
                        cardDataGetter: context.game.cardDataGetter,
                        router,
                        seats: [
                            { seat: 'p1', user: getUserWithDefaultsSet({ id: context.player1Object.id, username: context.player1Object.name }) },
                            { seat: 'p2', user: getUserWithDefaultsSet({ id: context.player2Object.id, username: context.player2Object.name }) },
                        ],
                    });
                } catch (error) {
                    caught = error;
                }
                expect(caught).toBeInstanceOf(MatchLoadError);
                expect((caught as Error).message).toContain('ended the game outright');
                // Disclosed, not fixed by this guard: the real router was already told.
                expect(routerCalls).toContain('handleGameEnd');
            });

            it('converts an internal engine exception raised during step 6 into a MatchLoadError instead of silently logging it', async function() {
                // The test harness's own router (`buildLoadConfig`) rethrows from `handleError`, which would
                // mask this exact defect in every other spec in this suite -- a reported error already fails
                // the spec regardless of whether `loadAsync`'s own rethrow-scoping works. This double instead
                // mimics real `Lobby.handleError` production semantics (log only, never rethrow), so this
                // test can only pass if `loadAsync` itself converts the swallowed exception back into a
                // throw.
                await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
                const { context } = contextRef;
                const document = save(context.game);

                const handleErrorCalls: { message: string }[] = [];
                const router: any = {
                    id: 'p2c2-non-rethrowing-router',
                    handleError: (game: unknown, error: Error) => {
                        handleErrorCalls.push({ message: error.message });
                        // production-like: log only, never rethrow
                    },
                    handleGameEnd: () => { /* no-op */ },
                    sendGameState: () => { /* no-op */ },
                    handleUndoGameEnd: () => { /* no-op */ },
                };

                // `checkUniqueRule` is an unconditional step inside every EventWindow resolution (including
                // step 6's), so patching it to throw reaches exactly the code path this guards. Gated to the
                // action phase so this spec exercises step 6's window specifically, distinct from the
                // dedicated step-3 (setup) spec below.
                const original = Game.prototype.checkUniqueRule;
                Game.prototype.checkUniqueRule = function(this: Game): void {
                    if (this.currentPhase === PhaseName.Action) {
                        throw new Error('P2C2 synthetic engine failure');
                    }
                };

                try {
                    let caught: unknown;
                    let resolvedGame: unknown;
                    try {
                        const result = await loadAsync(document, {
                            cardDataGetter: context.game.cardDataGetter,
                            router,
                            seats: [
                                { seat: 'p1', user: getUserWithDefaultsSet({ id: context.player1Object.id, username: context.player1Object.name }) },
                                { seat: 'p2', user: getUserWithDefaultsSet({ id: context.player2Object.id, username: context.player2Object.name }) },
                            ],
                        });
                        resolvedGame = result.game;
                    } catch (error) {
                        caught = error;
                    }

                    // The defect this guards against: loadAsync resolving "successfully" over a corrupted
                    // Game while the exception was merely logged via handleError (Normal severity, never
                    // surfaced). The rethrow window now covers this call too, so the real router's
                    // `handleError` is never reached at all -- the exception converts to a throw immediately.
                    expect(resolvedGame).toBeUndefined();
                    expect(handleErrorCalls.length).toBe(0);
                    expect(caught).toBeInstanceOf(MatchLoadError);
                    expect((caught as Error).message).toContain('P2C2 synthetic engine failure');
                } finally {
                    Game.prototype.checkUniqueRule = original;
                }
            });

            it('converts an internal engine exception raised during step 3 (driven setup) into a MatchLoadError instead of silently logging it', async function() {
                // Same shape as the step-6 spec above, but the synthetic failure is scoped to fire only
                // while the constructed game is in the setup phase -- i.e. inside step 3's `runSetupPhase`
                // drive, not step 6's resolution drive -- so this spec discriminates the two spans of the
                // rethrow window from each other. As above, this double mimics real `Lobby.handleError`
                // production semantics (log only, never rethrow); the harness's own router
                // (`buildLoadConfig`) rethrows and would mask the defect this guards against.
                await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
                const { context } = contextRef;
                const document = save(context.game);

                const handleErrorCalls: { message: string }[] = [];
                const router: any = {
                    id: 'p2c2-non-rethrowing-router-step3',
                    handleError: (game: unknown, error: Error) => {
                        handleErrorCalls.push({ message: error.message });
                        // production-like: log only, never rethrow
                    },
                    handleGameEnd: () => { /* no-op */ },
                    sendGameState: () => { /* no-op */ },
                    handleUndoGameEnd: () => { /* no-op */ },
                };

                // `checkUniqueRule` is an unconditional step inside every EventWindow resolution, including
                // the ones `runSetupPhase` drives through during deploys/draws/resource placement in step 3.
                // Gating on `currentPhase` confines the throw to that step so this spec cannot pass merely
                // because step 6's (already-covered) window happens to be reached.
                const original = Game.prototype.checkUniqueRule;
                Game.prototype.checkUniqueRule = function(this: Game): void {
                    if (this.currentPhase === PhaseName.Setup) {
                        throw new Error('P2C2 synthetic setup-phase engine failure');
                    }
                };

                try {
                    let caught: unknown;
                    let resolvedGame: unknown;
                    try {
                        const result = await loadAsync(document, {
                            cardDataGetter: context.game.cardDataGetter,
                            router,
                            seats: [
                                { seat: 'p1', user: getUserWithDefaultsSet({ id: context.player1Object.id, username: context.player1Object.name }) },
                                { seat: 'p2', user: getUserWithDefaultsSet({ id: context.player2Object.id, username: context.player2Object.name }) },
                            ],
                        });
                        resolvedGame = result.game;
                    } catch (error) {
                        caught = error;
                    }

                    // The defect this guards against: loadAsync resolving "successfully" over a Game whose
                    // driven setup silently swallowed an internal engine exception, contradicting this
                    // function's own doc comment that every load-side problem throws MatchLoadError and the
                    // loader never returns a partially loaded game.
                    expect(resolvedGame).toBeUndefined();
                    expect(handleErrorCalls.length).toBe(0);
                    expect(caught).toBeInstanceOf(MatchLoadError);
                    expect((caught as Error).message).toContain('P2C2 synthetic setup-phase engine failure');
                } finally {
                    Game.prototype.checkUniqueRule = original;
                }
            });

            it('converts an internal engine exception raised during postRollbackOperations\' own pipeline re-entry into a MatchLoadError instead of resolving with a Game', async function() {
                // Same shape as the two specs above, but scoped to the span *after* step 6's own resolution
                // drive completes: postRollbackOperations re-enters game.pipeline to resume the action phase,
                // and that re-entry drives its own real EventWindows/ActionWindow, capable of the identical
                // swallow the step-3 and step-6 specs guard against. As above, this double mimics real
                // `Lobby.handleError` production semantics (log only, never rethrow); the harness's own
                // router (`buildLoadConfig`) rethrows and would mask the defect this guards against.
                await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
                const { context } = contextRef;
                const document = save(context.game);

                const handleErrorCalls: { message: string }[] = [];
                const router: any = {
                    id: 'p2c2-non-rethrowing-router-postrollback',
                    handleError: (game: unknown, error: Error) => {
                        handleErrorCalls.push({ message: error.message });
                        // production-like: log only, never rethrow
                    },
                    handleGameEnd: () => { /* no-op */ },
                    sendGameState: () => { /* no-op */ },
                    handleUndoGameEnd: () => { /* no-op */ },
                };

                // `UiPrompt.setPrompt` is reached by the ActionWindow prompt postRollbackOperations' own
                // re-entered drive opens, but it also fires during step 3's driven setup and step 6's
                // resolution drive (already covered by the other two specs), so the throw is armed only for
                // the duration of the actual `postRollbackOperations` call by wrapping that method on the
                // prototype -- there is no other hook available from outside `loadAsync` to scope the window
                // this precisely.
                const originalPostRollback = Game.prototype.postRollbackOperations;
                const originalSetPrompt = UiPrompt.prototype.setPrompt;
                let armed = false;
                let thrown = false;
                Game.prototype.postRollbackOperations = function(this: Game, entryPoint: unknown): void {
                    armed = true;
                    try {
                        originalPostRollback.call(this, entryPoint as never);
                    } finally {
                        armed = false;
                    }
                };
                UiPrompt.prototype.setPrompt = function(this: UiPrompt) {
                    if (armed && !thrown) {
                        thrown = true;
                        throw new Error('P2C2 synthetic post-rollback engine failure');
                    }
                    return originalSetPrompt.call(this);
                };

                try {
                    let caught: unknown;
                    let resolvedGame: unknown;
                    try {
                        const result = await loadAsync(document, {
                            cardDataGetter: context.game.cardDataGetter,
                            router,
                            seats: [
                                { seat: 'p1', user: getUserWithDefaultsSet({ id: context.player1Object.id, username: context.player1Object.name }) },
                                { seat: 'p2', user: getUserWithDefaultsSet({ id: context.player2Object.id, username: context.player2Object.name }) },
                            ],
                        });
                        resolvedGame = result.game;
                    } catch (error) {
                        caught = error;
                    }

                    // The synthetic throw must actually have fired inside postRollbackOperations for this
                    // spec to mean anything; otherwise it would pass vacuously.
                    expect(thrown).toBe(true);
                    // The defect this guards against: loadAsync resolving "successfully" over a Game whose
                    // action-phase re-entry silently swallowed an internal engine exception via the router's
                    // ordinary report-and-continue convention, once the rethrow window had already closed.
                    expect(resolvedGame).toBeUndefined();
                    expect(handleErrorCalls.length).toBe(0);
                    expect(caught).toBeInstanceOf(MatchLoadError);
                    expect((caught as Error).message).toContain('P2C2 synthetic post-rollback engine failure');
                } finally {
                    Game.prototype.postRollbackOperations = originalPostRollback;
                    UiPrompt.prototype.setPrompt = originalSetPrompt;
                }
            });
        });
    });
});
