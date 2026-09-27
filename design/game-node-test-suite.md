# Game Node Test Suite

Status: **in progress** — Phases 0 and 1 landed on `ammayberry1/lobby-test-suite`.

## Why this exists

`GameServer`, `Lobby` and `QueueHandler` own everything between a user clicking "play" and a game
running: the HTTP API, socket.io lifecycle, lobby membership, matchmaking, disconnect handling, and
the stats reporting that follows a game. The socket management in particular is convoluted and
sparsely documented, and it is the part we most want to restructure.

We cannot safely restructure it, because **there is no test coverage of any of it**. The existing
suite (~8,700 specs) covers card behaviour by constructing a `Game` directly with a stub router; it
never touches `Lobby` or `GameServer`.

This project builds the test suite first, so the refactor that follows has a safety net. The suite is
the deliverable — broad behavioural coverage of connection scenarios, not deep coverage of the
current internals, most of which we expect to gut.

## Design goals

1. **Cover the connection lifecycle end to end.** A scenario starts with an HTTP call and hands off
   to a socket. That handoff is the highest-risk, least-understood part of the system, so the harness
   has to exercise both halves together rather than either in isolation.

2. **Assert on the wire, not on internals.** Tests drive the system through its two real entry
   points and assert on what a client *receives* (`lobbystate`, `gamestate`, `connection_error`,
   `matchmakingFailed`, `inactiveDisconnect`, `statsSubmitNotification`) and on what external service
   fakes *were called with*. Anything asserting on the shape of `userLobbyMap` is a test we would
   have to rewrite during the refactor. A narrow, explicitly-internal inspection surface covers the
   few cases that genuinely need it.

3. **Low boilerplate per scenario.** Individual cases should be a few lines. Shared setup, fixtures
   and client simulation belong in the harness.

4. **No test-only code in production classes.** Test-specific construction lives in a subclass under
   `test/helpers/server/`. Production seams are ordinary injected collaborators with production
   defaults.

5. **Mock the outside world, keep the inside real.** Auth, DynamoDB, the stats sites and the client
   are faked. The rules engine, deck validation and the real socket middleware are not.

6. **Control time rather than avoiding it.** Timeout behaviour is a first-class scenario, so the
   suite drives a virtual clock. Nothing is disabled to make tests runnable.

7. **Fast and parallel-safe.** The suite runs under `--parallel=4` alongside the card tests.

## Approach

**Hybrid transport.** An in-process fake transport that still runs the *real* `io.use` auth
middleware and the *real* `onConnectionAsync` handler, guarded by a handful of real `socket.io-client`
smoke tests to catch drift. Full fidelity is too slow and forces real-clock waits; a full fake would
skip the handshake parsing and auth that several target scenarios depend on.

**Clients mirror the real frontend.** The FE client contract was mapped from `forceteki-client`
first. Test clients use the same flows a browser would: browse `/api/available-lobbies` and
`POST /api/join-lobby` for public lobbies, and connect with `query.lobby` from `connectionLink` for
private ones. Notably, `create-lobby` deliberately does **not** return the lobby id — that is an
anti-automation measure — so the harness discovers lobbies the way a user does.

## Progress

### Phase 0 — headless server and HTTP coverage ✅

Commit: `Initial tests and basic testability changes`

| Change | Detail |
|---|---|
| `IGameServerOptions.listen` | Build the server without binding the configured port |
| `shutdownAsync()` | Releases intervals, pending timers, lobbies, socket.io and the HTTP listener |
| Interval tracking | All four constructor intervals retained for cleanup |
| `QueueHandler.shutdown()` | Its hourly cleanup interval was **never cleared** — a real leak |
| `Lobby.cleanLobby()` | Now clears the quick-lobby countdown, which kept firing against an emptied lobby |
| `protected` constructor + `httpServer` | Lets a test subclass construct and bind without public test API |

Test infrastructure: `ServerTestEnv` (env bootstrap, ordered first in `jasmine.json`),
`TestGameServer`, `ServerTestHarness`, `DecklistFixtures` (self-validating, built from live card
data). `supertest` added as a devDependency.

### Phase 1 — scheduler and config injection ✅

Commit: `Add timer injection`

**1a — scheduler.** `IScheduler` / `IScheduledTask` / `ISchedulerErrorContext` with `RealScheduler`
as the production default, threaded through `GameServer`, `Lobby`, `QueueHandler`,
`MatchmakingRules` and the engine timer types. Every timer and clock read in the game node now goes
through it.

Error guarding was folded into the scheduler implementations. The codebase previously had two
parallel mechanisms for the same hazard — `buildSafeTimeout` for the Lobby/Game sites, and
hand-rolled `try/catch` in *all seven* raw timer sites. Guarding at the scheduling layer makes safety
structural rather than dependent on the author remembering. This let the engine's
`buildSafeTimeout` plumbing (`GameConfiguration.buildSafeTimeout`, `Game.buildSafeTimeoutHandler`,
`SafeTimeoutBuilder`, the `GameActionTimer` pass-through) collapse to a plain `IScheduler`.

`SimpleActionTimer` also routes its clock reads through the scheduler, so game action timers are
fully clock-controllable — a prerequisite for the future inactivity-timer tests.

**1b — config.** `IGameNodeConfig` replaces the scattered `process.env.ENVIRONMENT` behaviour
switches, with `buildGameNodeConfigFromEnvironment()` preserving current semantics exactly.
`TestGameServer` defaults to the **restrictive deployed profile**, because tests must run as
`development` to avoid AWS credentials and `development` silently switches off every anonymous-user
restriction — precisely the rules most worth testing.

`TestScheduler` guards *and records* callback errors. Production must swallow them so one failure
cannot take the node down, but a test that swallowed silently would report a false pass, so
`harness.assertNoScheduledErrors()` surfaces them.

**Gates:** `test-parallel` 8698/0 · `test-parallel-undo` 8520/0 · `validate-cards` · `eslint`.
Branch diff: 23 files, +1671 / −136; production footprint ~330 lines across 9 files.

### Pre-PR review — fixes applied ✅

A design review of the branch found three blocking defects in the scheduler, all confirmed
empirically and since fixed:

1. **The error guard did not cover async callbacks.** `runGuarded` was a synchronous `try/catch`, but
   `Lobby.quickLobbyCountdownAsync` and `GameServer.matchmakeAllQueuesAsync` are async and their
   promises were discarded. A rejection from either became an unhandled rejection — which terminates
   the process on Node 22, the exact failure the guard exists to prevent. There is no
   `unhandledRejection` handler anywhere in the repo. Reproduced by crashing a probe process.
   `ScheduledCallback` now returns `unknown` and both implementations attach a rejection handler.

2. **`TestScheduler.advanceAsync` hung forever on a non-positive interval.** A repeating entry with
   `intervalMs <= 0` never advanced past its own due time. Worse, the loop only awaited microtasks,
   so jasmine's spec timeout could never fire — CI would hang with no diagnostic. Delays are now
   clamped to 1ms (matching Node) and a task cap turns a runaway loop into a clear failure.

3. **`advanceAsync` only flushed microtasks.** Anything awaiting a macrotask (`setImmediate`, I/O, a
   socket.io ack) was still pending when the advance returned. Harmless today, but every Phase 4
   scenario runs through `startGameAsync`; specs would have observed stale state and the natural
   workaround is the ad-hoc `setTimeout(0)` sprinkling this harness exists to eliminate. Renamed to
   `settlePendingWorkAsync` and now yields to the macrotask queue.

Also addressed: `assertNoScheduledErrors()` now runs from `shutdownAsync()` so it is structural
rather than opt-in; the card suite uses a `NoopScheduler` to preserve its previous
"a live timer is impossible" invariant; `RealScheduler` gained direct test coverage (it had none,
despite being the production safety claim); and two inaccurate spec assertions were tightened.

Known and accepted: `ServerTestEnv` sets `ENVIRONMENT=development` for the whole suite, which in CI
was previously unset. This enables some dev-only engine validation that was already active locally —
call it out in the PR description.

## Remaining work

### Phase 2 — fake transport and test client

`FakeSocketIo` implementing only the surface production touches — `io.use` chain, `connection`, and
per-socket `id` / `data` / `connected` / `emit` / `on` / `removeAllListeners` / `eventNames` /
`join` / `leave` / `disconnect`. **Must model ack callbacks**: `sendGameState` emits with an ack
whose absence is meaningful, and a test needs to be able to withhold it to simulate a wedged client.

`TestClient` — one per user, anonymous or authenticated (minting a real JWT against the test secret,
exercising the real `verifyTokenAndCreateAuthenticatedUser` path the FE uses, with no DB access).
Records every inbound event in an inbox. Plus a `serverIntegration()` global mirroring the existing
`integration()` ergonomics.

### Phase 3 — protocol surface

Replace the dynamic `this[command]` dispatch in `Lobby.onLobbyMessage` / `onGameMessage` with an
explicit allowlist. Any connected client can currently invoke **any** method on `Lobby` or `Game`
with arbitrary arguments (`cleanLobby`, `removeUser`, `startGameAsync`, …); spectators have an
allowlist, players do not. Beyond the security fix, this gives the suite a declared protocol to test
against instead of an open-ended surface.

Add `validateMatchConfiguration(format, cardPool, gamesToWinMode, context)` mirroring the FE's
`LobbyFormatConfigs` / `QueueFormatConfigs`. See the game-mode matrix gap below.

### Phase 4 — Tier 1 scenarios

- Create lobby (public/private) → connect → `lobbystate`; owner assignment
- Join via browse-and-join; join via link; join-full race; join nonexistent; join while already in a lobby
- Queue: enter → connect → matchmake → quick lobby → countdown → game start; solo wait + heartbeat
- Leave lobby; empty-lobby cleanup; lobby owner reassignment
- Reconnect inside grace window (socket swap); beyond grace (removal); matchmaking variant (requeue + `matchmakingFailed`)
- Inactivity kick → `inactiveDisconnect` + `forceDisconnect`, no re-entry
- Anonymous vs authenticated: chat enabled/disabled, Bo3 gating, spectator gating
- External stats: exact payloads to SwuStats/SwuBase/DeckService; `LoggedInOnly` / `SavedDecksOnly` skips
- Internal stats: `statsSubmitNotification` payloads including the repeated-send path
- **Game-mode configuration matrix** (see below)

### Phase 5 — Tier 2 scenarios and fidelity suite

Command allowlist enforcement · spectator flows and `allowSpectators` · socket auth failures ·
double-connect / multi-tab · deck gates (`change-deck`, start-time deck size) · maintenance mode
(503 across all four entry points) · discovery endpoint filtering · lobby name profanity/length ·
matchmaking cooldown · ack-less client.

Plus 3–5 real `socket.io-client` tests over a real port to guard the fake's fidelity.
`TestGameServer` already binds socket.io on its ephemeral port, so this path is reachable.

### Phase 6 — CI wiring and parallel-safety review

## Open findings

Behaviours found while building the suite, characterised in tests but **not fixed**:

1. **Ghost lobbies.** `createLobbyUser` sets `state: null` then immediately calls
   `updateUserLastActivity`, which sets `state = 'connected'` while `socket` is still null. Since
   `lobbiesWithOpenSeat()` filters on `hasConnectedPlayer()`, a lobby created over HTTP is advertised
   as joinable before any socket exists, and stays advertised indefinitely if the owner never
   connects (cleanup needs 5 users to have left *and* 5 minutes). Covering the client's navigation
   gap looks intentional; the never-connects case does not.

2. **Client-supplied identity fields are trusted.** `verifyTokenAndCreateAuthenticatedUser` — the
   path the real FE uses — verifies the JWT but then trusts the client's `userData` wholesale,
   overriding only `id` from `decoded.userId`. So `username`, `preferences` and **`moderation`** come
   from the client, and `isUserChatDisabled` reads `getModeration()` off that object. Also
   inconsistent claim names: `decoded.userId` here vs `decoded.id` in `authenticateWithTokenAsync`.

3. **Game-mode configuration is barely validated.** `gamesToWinMode` is never enum-checked on
   `create-lobby` or `enter-queue`; there is no cross-field validation (nothing enforces "open is
   lobby-only", "queue is premier/eternal only", or "premier cannot use unlimited"); and `fauxSuns`
   is accepted although the FE has no such value. Failure modes are poor: a bogus `gamesToWinMode` on
   `create-lobby` yields a **500**, premier+unlimited yields a **500** from a `Contract` assertion,
   and a bogus `gamesToWinMode` on `enter-queue` returns **`200 OK`** and then fails silently at
   socket-connect time, leaving the user on a "searching" screen forever. Queue keys are also
   `JSON.stringify`-based and therefore property-order sensitive.

4. **`this[command]` dispatch** (see Phase 3) — arbitrary method invocation by any connected client.

5. **Timers that nothing can cancel.** The disconnect-grace timeout (`GameServer.onSocketDisconnected`)
   and the requeue-after-disconnect timeout (`Lobby.handleMatchmakingDisconnect`) discard their
   `IScheduledTask`, and `Lobby.cleanLobby()` does not stop a running game's `GameActionTimer`s. So
   `shutdownAsync()` leaks one timer per disconnected socket and per cleaned lobby with a live game.
   Harmless in production (the node does not shut down) but the `'cancels every scheduled task on
   shutdown'` spec will start failing once Phase 2 introduces real disconnects — which is the correct
   outcome, and the fix belongs with that work.

6. **Three scheduled callbacks still swallow their own errors** (`cleanupInvalidTokens`,
   `QueueHandler.cleanupPreviousMatchEntries`, `QueueHandler.sendHeartbeat`), so the scheduler's guard
   — and therefore `assertNoScheduledErrors()` — cannot see them. These are defensive at the method
   level and reachable from non-timer callers, so removing the inner catches is a behaviour change
   rather than a simplification; revisit when those paths get direct coverage.

## Future test suites

After the connection-management suite is complete, the same harness should be extended to cover:

- **Moderation** — moderator actions (`/api/mod/*`), applying and cancelling actions, mute/ban
  enforcement in lobby and chat, moderation state reaching the client, and the "seen" acknowledgement
  flows.
- **User account management** — username change eligibility and rate limiting, rename history,
  the `mustRequestUsernameChange` flow, and profanity checks on usernames.
- **User settings and preferences** — preference persistence, per-account game options
  (`muteChat`, card image locale, timer visibility), welcome/undo/timer popup acknowledgement.
- **Best-of-three flow** — set progression, sideboarding window, ready timer, concede and timeout
  paths, `winHistory` as sent to the client.
- **Game timer behaviour** — action timers counting down, warning thresholds, and kicking inactive
  players. Unblocked by the scheduler work in Phase 1.
- **Deck management** — save/rename/delete/favourite, deck-link resolution across the supported
  sources, and validation failures surfaced to the client.
- **Cosmetics** — entitlement checks and moderator/admin-gated management endpoints.
- **Spectator experience** — joining mid-game, state retransmission, and the spectator command allowlist.
- **Reconnect and resilience** — message retransmission gaps (`retransmitGameMessages`), serialization
  failure handling, and error reporting to Discord.
