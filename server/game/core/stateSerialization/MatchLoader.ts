import type { Lobby } from '../../../gamenode/Lobby';
import type { IUser } from '../../../Settings';
import type { CardDataGetter } from '../../../utils/cardData/CardDataGetter';
import { Deck } from '../../../utils/deck/Deck';
import { Game } from '../Game';
import { EventName, PhaseName, RollbackRoundEntryPoint } from '../Constants';
import { EventWindow, TriggerHandlingMode } from '../event/EventWindow';
import { GameEvent } from '../event/GameEvent';
import type { Player } from '../Player';
import { RollbackEntryPointType } from '../snapshot/SnapshotInterfaces';
import { restoreCardAbilityLimits, restoreEpicDeployUsed } from './AbilityLimitRestorer';
import { restoreChatMessages } from './ChatRestorer';
import { injectPositions } from './MatchPositionInjector';
import { MatchLoadError } from './MatchLoadError';
import { runSetupPhase } from './ScriptedSetupRunner';
import { validate } from './SavedMatchValidator';
import { restoreStateWatchers } from './StateWatcherDeserializer';
import type { IEngineOnlyFact, ISavedMatch, ISavedPlayer } from './SavedMatchInterfaces';

export interface IMatchLoadSeat {

    /** Seat label exactly as it appears in the document (`"p1"` / `"p2"`). */
    seat: string;

    /** The user identity that takes this seat. `username` becomes `Player.name`, which ability-limit maps key on. */
    user: IUser;
}

export interface IMatchLoadConfig {
    cardDataGetter: CardDataGetter;
    router: Lobby;

    /** One entry per seat in the document, in any order; every document seat must be bound exactly once. */
    seats: readonly IMatchLoadSeat[];

    /** Diagnostic only. Reported alongside the document's own value when a coordinate fails to resolve. */
    currentCardDataVersion?: string | null;

    gameId?: string;
    owner?: string;
    allowSpectators?: boolean;

    /** Real callers (`P2-D`) pass real ones; these default to no-ops so a headless load needs no lobby. */
    pushUpdate?: () => void;
    buildSafeTimeout?: (callback: () => void, delayMs: number, errorMessage: string) => NodeJS.Timeout;
    userTimeoutDisconnect?: (userId: string) => void;
}

export interface IMatchLoadResult {
    game: Game;

    /** The document's manifest, verbatim. Non-empty means the reproduction is missing these facts. */
    engineOnlyFacts: readonly IEngineOnlyFact[];

    /** seat label -> the live Player bound to it, so a caller can address seats without re-deriving order. */
    playersBySeat: ReadonlyMap<string, Player>;
}

function bindSeats(saved: ISavedMatch, seats: readonly IMatchLoadSeat[]): Map<string, IUser> {
    const seatToUser = new Map<string, IUser>();
    const usedUserIds = new Set<string>();
    const usedUsernames = new Set<string>();

    for (const { seat, user } of seats) {
        if (seatToUser.has(seat)) {
            throw new MatchLoadError(`Seat "${seat}" is bound to more than one user.`);
        }
        if (usedUserIds.has(user.id)) {
            throw new MatchLoadError(`User id "${user.id}" is bound to more than one seat.`);
        }
        if (usedUsernames.has(user.username)) {
            // PerPlayerPerGameAbilityLimitBase keys its use map by player.name; two seats sharing a
            // username would silently merge their limit counts, so this rejects rather than merging.
            throw new MatchLoadError(`Username "${user.username}" is bound to more than one seat, which would silently merge their ability-limit counts.`);
        }
        seatToUser.set(seat, user);
        usedUserIds.add(user.id);
        usedUsernames.add(user.username);
    }

    const documentSeats = new Set(saved.players.map((player) => player.seat));
    for (const seat of documentSeats) {
        if (!seatToUser.has(seat)) {
            throw new MatchLoadError(`Document seat "${seat}" is not bound to a user.`);
        }
    }
    for (const seat of seatToUser.keys()) {
        if (!documentSeats.has(seat)) {
            throw new MatchLoadError(`Config binds seat "${seat}", which is not present in the document.`);
        }
    }

    return seatToUser;
}

function findSavedPlayer(saved: ISavedMatch, seat: string): ISavedPlayer {
    const savedPlayer = saved.players.find((player) => player.seat === seat);
    if (savedPlayer == null) {
        throw new MatchLoadError(`Document does not contain a player for seat "${seat}".`);
    }
    return savedPlayer;
}

function deepEqualJson(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Wraps `real` in a `Proxy` that forwards every member unchanged except `handleError`, which -- only while
 * `setRethrowErrors(true)` is in effect -- throws the reported error instead of forwarding it.
 *
 * Exists because `BaseStepWithPipeline.continue()` (the base class `EventWindow` inherits and does not
 * override) catches *any* exception thrown while driving its inner pipeline, routes it to
 * `Game.reportError` -> `router.handleError`, and returns `true` -- reporting the step complete. The real
 * `Lobby.handleError` only logs for `Normal` severity and returns, so a genuine engine exception raised
 * while driving the game (setup in step 3, or resolving loaded state in step 6) would otherwise vanish into
 * a log line and `loadAsync` would resolve successfully over a corrupted `Game`, contradicting this
 * function's own contract. `Game`'s `_router` field is private and set once at construction, so the swap
 * has to happen *before* `new Game(...)`, by handing the constructor this proxy instead of the caller's
 * router directly and flipping the rethrow flag on for the whole span from before `new Game(...)` through
 * `loadAsync`'s own return or throw -- which includes the pipeline re-entry `postRollbackOperations`
 * triggers -- so a swallow anywhere in that span converts back into a throw instead of a silent
 * report-and-continue.
 */
function createRethrowingRouterProxy(real: Lobby): { proxy: Lobby; setRethrowErrors: (value: boolean) => void } {
    let rethrowErrors = false;
    const proxy = new Proxy(real as unknown as Record<string, unknown>, {
        get(target, prop) {
            if (prop === 'handleError') {
                return (game: Game, error: Error, severity?: unknown) => {
                    if (rethrowErrors) {
                        throw error;
                    }
                    return (target.handleError as (...args: unknown[]) => unknown).call(target, game, error, severity);
                };
            }
            const value = Reflect.get(target, prop);
            return typeof value === 'function' ? value.bind(target) : value;
        },
    }) as unknown as Lobby;
    const setRethrowErrors = (value: boolean): void => {
        rethrowErrors = value;
    };
    return { proxy, setRethrowErrors };
}

/**
 * Loads `saved` into a fresh, headless `Game`: validates the document, constructs a `Game` from its
 * decklists/settings and drives it to the action phase via `ScriptedSetupRunner`, injects the saved board
 * position, restores every other fact in the plan's fixed order, and re-enters the pipeline mid-action-phase
 * via `postRollbackOperations`.
 *
 * Every load-side problem throws `MatchLoadError`; the loader itself never calls `game.reportError`, never
 * returns a partially loaded game, and never drops a document fact. See the owning plan
 * (`docs/plans/02-semantic-save-load.md` work item C) for the full derivation of this order; the
 * load-bearing points are recapped inline below.
 *
 * Two caveats step 6's own comment goes into in more depth: (1) an internal engine error raised anywhere
 * from the start of step 3 (game construction and driven setup) through the end of `postRollbackOperations`'
 * own re-entry drive is converted back into a throw via a router proxy scoped to that whole span, not
 * suppressed -- see `createRethrowingRouterProxy`; the flag is not cleared until this function is about to
 * return or throw, so nothing between game construction and the function's own exit can silently downgrade
 * into a logged-and-swallowed `reportError` call.
 * (2) a degraded save that resolves into an outright win calls the *real* router's
 * `handleGameEnd()`/`sendGameState()` before this function can reject, because `Lobby.handleGameEnd()`
 * takes no argument and acts on the router's own stored game rather than the one this function builds --
 * P2-D needs to account for that when it becomes this loader's first real caller.
 */
export async function loadAsync(saved: ISavedMatch, config: IMatchLoadConfig): Promise<IMatchLoadResult> {
    // Step 1: validate the document. No Game is constructed until this passes.
    validate(saved, { cardDataGetter: config.cardDataGetter, currentCardDataVersion: config.currentCardDataVersion });

    // Step 2: bind seats, then build details.players in ascending seat order (Game.getPlayers() returns
    // players in details.players insertion order, and MatchSerializer.save assigned seats by that order).
    const seatToUser = bindSeats(saved, config.seats);
    const orderedSeats = [...seatToUser.keys()].sort();

    // Step 3: construct the Game and drive setup with the saved initiative player. Wrapped: a
    // document-caused problem here (a short decklist, an unbuildable card) would otherwise surface as a
    // confusing setup-phase Contract/bare Error rather than a MatchLoadError.
    let game: Game;
    let playerBySeat: Map<string, Player>;
    // See `createRethrowingRouterProxy`'s doc comment: the constructed `Game` is handed this proxy, not
    // `config.router`, directly, so this function can scope a rethrow-on-error window around its own live
    // event drives. Every other call this loader or the engine makes through the router forwards unchanged.
    const { proxy: routerProxy, setRethrowErrors } = createRethrowingRouterProxy(config.router);
    // The rethrow window opens here, before `new Game(...)`, and stays open through step 3's driven setup,
    // step 6's resolution drive, and `postRollbackOperations`' own pipeline re-entry: `runSetupPhase`
    // (step 3) drives the same `BaseStepWithPipeline.continue()` swallow this proxy exists to close, through
    // the setup phase's own real EventWindows (deploys, draws, resource placement), and
    // `postRollbackOperations` re-enters the pipeline the same way to resume the action phase, so an
    // internal engine exception raised in any of the three is exactly as capable of silently returning a
    // corrupted `Game` as one raised anywhere else in this span. The whole-body `try`/`finally` below is
    // what turns it off again, right before this function returns or throws -- see this function's own doc
    // comment for why the window now runs that long.
    setRethrowErrors(true);
    try {
        try {
            game = new Game(
                {
                    id: config.gameId ?? saved.gameId,
                    owner: config.owner ?? seatToUser.get(orderedSeats[0]).username,
                    players: orderedSeats.map((seat) => seatToUser.get(seat)),
                    allowSpectators: config.allowSpectators ?? false,
                    gameMode: saved.settings.gameMode,
                    cardDataGetter: config.cardDataGetter,
                    useActionTimer: saved.settings.useActionTimer,
                    undoMode: saved.settings.undoMode,
                    seed: saved.rng.seed,
                    pushUpdate: config.pushUpdate ?? (() => { /* no-op */ }),
                    buildSafeTimeout: config.buildSafeTimeout ?? ((callback: () => void, delayMs: number) => setTimeout(callback, delayMs)),
                    userTimeoutDisconnect: config.userTimeoutDisconnect ?? (() => { /* no-op */ }),
                },
                { router: routerProxy }
            );

            for (const seat of orderedSeats) {
                const savedPlayer = findSavedPlayer(saved, seat);
                const user = seatToUser.get(seat);
                game.selectDeck(user.id, new Deck(savedPlayer.decklist, config.cardDataGetter));
            }

            await game.initialiseAsync();

            // Bind by identity, not by position: Game.getPlayers() returns Object.values(playersAndSpectators),
            // which is keyed by player.id, and JS orders array-index-like string keys numerically ahead of
            // insertion order, so a positional zip here can silently swap seats for caller-supplied ids.
            playerBySeat = new Map<string, Player>();
            orderedSeats.forEach((seat) => {
                const user = seatToUser.get(seat);
                const player = game.getPlayerById(user.id);
                playerBySeat.set(seat, player);
            });

            const initiativePlayer = playerBySeat.get(saved.game.initiativePlayer);
            runSetupPhase(game, { initiativePlayer });

            if (game.currentPhase !== PhaseName.Action) {
                throw new MatchLoadError(`Expected the driven setup to end in the action phase, but the game is in "${game.currentPhase}".`);
            }
        } catch (error) {
            if (error instanceof MatchLoadError) {
                throw error;
            }
            throw new MatchLoadError(`Failed to construct the game and drive setup from the saved decklists: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
        }

        // Steps 4-6 run against a live Game whose setup phase already armed a real per-player action timer
        // (UiPrompt.setPrompt, reached by runSetupPhase's driven ActionWindow prompt, calls a genuine
        // startPlayerActionTimer with the caller's real buildSafeTimeout). Any failure below this point must
        // stop both timers before propagating, or the abandoned setTimeout fires 20-140s later into
        // Game.onGameTimerExpired -> endGame() -> the caller's real router.handleGameEnd()/sendGameState() for
        // a Game the caller never received (it already got a rejected loadAsync). The success path does not
        // need this: postRollbackOperations' re-entered ActionWindow prompt stops/restarts timers itself via
        // the same UiPrompt.setPrompt cycle.
        try {
            // Step 4: inject the saved board position, in explicit across-all-seats phases.
            const index = injectPositions(saved, playerBySeat);

            // Step 5: restore, in the plan's fixed order.

            // 5.2 Watcher entries -- after injection, since every stint field resolves against the loaded card's
            // own live key.
            restoreStateWatchers(game, saved, index, playerBySeat);

            // 5.3 Chat -- whole-array assignment, replacing (never appending to) the driven setup's own messages.
            game.gameChat.messages = restoreChatMessages(saved.chat);

            // 5.4 Timers.
            for (const seat of orderedSeats) {
                const player = playerBySeat.get(seat);
                const timer = saved.timers[seat];
                player.actionTimer.restoreMainTimeRemainingSeconds(timer.mainRemainingSeconds);
            }

            // 5.5 RNG -- restored after injection so setup-time shuffles cannot advance it afterwards, then
            // verified by reading the generator back: rng.state is typed unknown and seedrandom accepts a
            // malformed state without complaint, so this exact round-trip is the only guard against a corrupt one.
            game.randomGenerator.restore(saved.rng.state as never);
            if (!deepEqualJson(game.randomGenerator.rngState, saved.rng.state)) {
                throw new MatchLoadError('The restored RNG state does not match the saved rng.state; the document may be corrupt.');
            }

            // 5.6 Game.state scalars.
            game.roundNumber = saved.game.roundNumber;
            game.actionNumber = saved.game.actionNumber;
            game.initiativePlayer = playerBySeat.get(saved.game.initiativePlayer);
            game.actionPhaseActivePlayer = playerBySeat.get(saved.game.actionPhaseActivePlayer);
            game.isInitiativeClaimed = saved.game.isInitiativeClaimed;
            game.prevActionPhasePlayerPassed = saved.game.prevActionPhasePlayerPassed;

            // 5.7 passedActionPhase derivation -- setupActionPhase is skipped by the rollback re-entry mode below,
            // so this is the only writer of this fact.
            for (const player of playerBySeat.values()) {
                player.passedActionPhase = saved.game.isInitiativeClaimed && player === game.initiativePlayer;
            }

            // Step 6: resolve game state the way a live game would. Game.resolveGameState(true), called bare,
            // needs an open currentEventWindow to record a resulting defeat -- Game.addSubwindowEvents
            // dereferences it unconditionally -- and nothing has opened one yet: postRollbackOperations (below)
            // is the only call on this path that calls initializeCurrentlyResolving(), and it has not run.
            // Without a window, a defeat caused by state that changed on injection (most commonly a
            // for-this-phase stat buff the loader cannot reproduce, dropping a unit's HP below its damage) threw
            // a raw TypeError instead of resolving.
            //
            // Fix: open a real root EventWindow (no parent, ResolvesTriggers, matching the pattern
            // Game.claimInitiative/OnBeginRound/OnRoundEnded use) around a single no-op framework event, and
            // drive it to completion on **game.pipeline itself**, not a standalone one (the deepest defect in
            // an earlier version of this step). `game.queueStep` -- which
            // `Game.resolveAbility`, every prompt helper, and `InPlayCard.checkUnique`'s select prompt all go
            // through -- routes to `game.pipeline`, not to whatever pipeline is driving the EventWindow from the
            // outside; queueing the window onto a separate pipeline meant every ability resolver and prompt the
            // window's own resolution queued was silently dropped (never run, then discarded by
            // `postRollbackOperations`'s `pipeline.clearSteps()`), even though the window's *own* internal steps
            // (which route through its own nested pipeline via `BaseStepWithPipeline`) ran fine. Making the
            // EventWindow itself the pipeline's current step closes that gap: `Game.queueStep` ->
            // `GamePipeline.queueStep` -> `currentStep.queueStep` -> `BaseStepWithPipeline.queueStep` now reaches
            // the EventWindow's own `stepsQueuedDuringCurrentStep`, so a resolver or prompt genuinely runs.
            // `game.pipeline` currently holds the setup `ActionWindow` `runSetupPhase` drove to and left waiting
            // on a player action; that is discarded here (`postRollbackOperations` discards it the same way on
            // every load, successful or not) so the EventWindow can become the pipeline's only step.
            //
            // EventWindow's own step sequence calls Game.resolveGameState(hasChanged, resolvedEvents) itself,
            // with hasChanged forced true because the event carries a handler -- exactly the call this step used
            // to make directly -- but now with a live window open, so a resulting FrameworkDefeatCardSystem
            // event is captured via addSubwindowEvents and then genuinely resolved (card moved to discard, "when
            // defeated" abilities triggered, including ones with mandatory zero-target effects -- see AC14 and
            // its trigger-bearing sibling below) by the window's own
            // resolveSubwindowEvents/resolveTriggersIfNecessary steps, the same as it would during live play.
            //
            // The rethrow window opened back in step 3 (see the comment there) is still in effect here, so an
            // internal engine exception raised anywhere in this resolution (not just the one scenario the tests
            // exercise) converts back into a throw via `createRethrowingRouterProxy` instead of being silently
            // logged and reported as a completed step.
            //
            // If the drive does not cleanly finish -- it returns false, or steps/an open prompt remain queued --
            // that is a genuine unresolved decision (or an unresolved engine step) this loader cannot supply
            // headlessly, and the document is rejected rather than left half-resolved with an unreachable
            // prompt. The rejection below names the actual pipeline/prompt state it observed rather than
            // asserting a specific scenario, since which scenarios reach here changed with this fix (see this
            // function's own note above -- update it if that changes again).
            game.pipeline.clearSteps();
            game.initializeCurrentlyResolving();
            const loadStateEvent = new GameEvent(EventName.OnLoadStateResolution, game.getFrameworkContext(), {}, () => { /* no-op: only exists to open a real event window */ });
            game.queueStep(new EventWindow(game, [loadStateEvent], TriggerHandlingMode.ResolvesTriggers));
            // The rethrow window opened in step 3 is still in effect here and stays open past this call, through
            // `postRollbackOperations` below -- see the whole-body `try`/`finally` this function wraps its body
            // in for where it finally closes.
            const resolutionCompleted = game.pipeline.continue(game);

            const openPrompt = game.getCurrentOpenPrompt();
            if (!resolutionCompleted || game.pipeline.length !== 0 || openPrompt != null) {
                const currentStep = game.pipeline.length > 0 ? game.pipeline.currentStep : null;
                const pendingStepName = currentStep == null ? null : typeof currentStep === 'function' ? currentStep.name : currentStep.constructor.name;
                const cause = openPrompt != null
                    ? `an open player prompt (${openPrompt.constructor.name})`
                    : pendingStepName != null
                        ? `a "${pendingStepName}" step still queued on the pipeline`
                        : 'the resolution pipeline reporting incomplete with no queued step or open prompt (an internal engine inconsistency)';
                throw new MatchLoadError(`Resolving game state after loading the position paused instead of completing, on ${cause}; this degraded save cannot be reproduced headlessly.`);
            }

            // A degraded save can resolve into an outright win (most commonly base-lethal damage the loader
            // cannot reproduce as a for-this-phase effect). `checkWinCondition`, called from inside the drive
            // above via `resolveGameState`, calls `endGame()` for real, which calls the router's
            // `handleGameEnd()`/`sendGameState()` unconditionally (through the real router this loader was
            // handed -- rethrowing is scoped to `handleError` only, not these calls) *before* this function ever
            // returns a `Game` to its caller. This guard stops `loadAsync` from also returning a "successful"
            // result on top of that; it does not (and, with `Lobby.handleGameEnd()` taking no argument and
            // acting on the router's own stored `this.game` rather than the `Game` this function constructed,
            // cannot cheaply) undo the router calls that already fired. P2-D, which is what will give this
            // loader its first real router, needs to either register this `Game` as the router's `game` before
            // any restoration step that can trigger `endGame()`, or accept that a base-lethal degraded save
            // reports a game end against whatever game the router currently thinks is active.
            if (game.isEnded) {
                throw new MatchLoadError('Resolving game state after loading the position ended the game outright (e.g. lethal base damage this loader could not avoid reproducing); this degraded save cannot be returned as a live, in-progress game.');
            }

            // 5.1 Ability limits -- the single authority for every limit count, including epicDeployUsed. Applied
            // *after* resolveGameState, not in the plan's literal step order, because of a defect that order did
            // not account for: resolveGameState's moved-card pass calls Card.resolveAbilitiesForNewZone() for every
            // card the injector placed (every one of them "moved," since injection always transits a non-arena zone
            // to reach its position), and that unconditionally calls limit.reset() on every action/triggered ability
            // whose move was not arena-to-arena (Card.ts updateActionAbilitiesForZoneInternal /
            // updateTriggeredAbilityEventsInternal). Restoring limits before that pass, as the plan's step numbering
            // literally reads, means every restored count is silently wiped moments later by step 6 -- confirmed via
            // AC4's per-copy-limit spec, which failed with exactly this symptom (a limit that was proven applied at
            // the point of the call reading back at zero once loadAsync returned) until the restore was moved here.
            // Moving it past resolveGameState is safe because resolveAbilitiesForNewZone only fires from
            // resolveGameState's own moved-card sweep, which runs once and clears its list before returning; nothing
            // between here and the function's return re-triggers it.
            for (const seat of orderedSeats) {
                const savedPlayer = findSavedPlayer(saved, seat);
                const player = playerBySeat.get(seat);

                for (const [zone, entries] of [['groundArena', savedPlayer.groundArena], ['spaceArena', savedPlayer.spaceArena]] as const) {
                    entries.forEach((entry, ordinal) => {
                        const card = index.resolveRef({ card: entry.card, controllerSeat: seat, zone, ordinal, parent: undefined });
                        restoreCardAbilityLimits(card, entry.limits, playerBySeat);
                    });
                }

                const baseCard = index.resolveRef({ card: savedPlayer.base.card, controllerSeat: seat, zone: 'base', ordinal: 0 });
                restoreCardAbilityLimits(baseCard, savedPlayer.base.limits, playerBySeat);

                const leaderCard = index.resolveRef({ card: savedPlayer.leader.card, controllerSeat: seat, zone: 'leader', ordinal: 0 });
                restoreCardAbilityLimits(leaderCard, savedPlayer.leader.limits, playerBySeat);
                restoreEpicDeployUsed(leaderCard, savedPlayer.leader.epicDeployUsed, player);
            }

            game.snapshotManager.clearAllSnapshots();
            // No game.continue() afterwards; postRollbackOperations already calls pipeline.continue. No
            // snapshot seeding: the re-entered ActionWindow takes the first action snapshot itself.
            game.postRollbackOperations({ type: RollbackEntryPointType.Round, entryPoint: RollbackRoundEntryPoint.WithinActionPhase });
        } catch (error) {
            for (const player of playerBySeat.values()) {
                player.actionTimer.stop();
            }
            if (error instanceof MatchLoadError) {
                throw error;
            }
            throw new MatchLoadError(`Failed to restore the saved position into the constructed game: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
        }

        return { game, engineOnlyFacts: saved.engineOnlyFacts, playersBySeat: playerBySeat };
    } finally {
        // Closes the rethrow window opened above, now that this function is about to return or
        // throw for real: every call this loader or the engine makes through the router from here on
        // (including any made by a caller now holding the returned `Game`) forwards to the real
        // router with its normal, non-rethrowing production semantics.
        setRethrowErrors(false);
    }
}
