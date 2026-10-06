# Game Node Test Suite

Status: **in progress** — Phases 0 and 1 landed on `ammayberry1/lobby-test-suite` (merged, PR #2934);
Phases 2 and 2.5 ✅ complete on `ammayberry1/lobby-tests-2`, pending PR.

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

Lobby names use per-harness counters, not random text that could trip the real profanity filter.
`ServerTestEnv` silences application log output during tests; production logging is unchanged, and
specs can still assert logger calls with spies. Scheduled errors remain checked at harness teardown.

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

`RealScheduler` specs exercise the production implementation with Jasmine-controlled timers rather
than wall-clock sleeps. Error-guard specs assert the reported error and context through a logger spy,
so deliberately thrown errors neither flood CI logs nor pass without checking the callback ran.

Known and accepted: `ServerTestEnv` sets `ENVIRONMENT=development` for the whole suite, which in CI
was previously unset. This enables some dev-only engine validation that was already active locally —
call it out in the PR description.

### Phase 2 — fake transport and test client ✅

Commit: `Add fake transport and TestClient for socket connection testing`

**Production seam.** `GameServer`'s inline `io.use(...)` / `io.on('connection', ...)` closures are
now named methods — `authenticateSocketAsync()`, `runSocketAuthMiddlewareAsync()`,
`handleSocketConnectionAsync()` — operating against a new `IRawGameSocket` interface (the subset of
socket.io's `Socket` that production code actually touches) instead of the concrete socket.io
generic type. `onConnectionAsync` now takes an `IRawGameSocket` rather than a real socket. This is
the seam the fake transport plugs into; behaviour is unchanged, confirmed by the existing Phase 0/1
specs passing unmodified throughout.

**`FakeIoSocket`.** An in-process implementation of `IRawGameSocket` that runs the *real* auth
middleware and *real* `onConnectionAsync` with no network involved — the "hybrid transport" the
Approach section above describes. Inbound (client→server) and outbound (server→client) traffic are
modelled as two independent surfaces: `inboundListeners` (populated by production code's `.on()`
calls, driven by tests via `simulateClientEmit()`) and `emittedEvents` (populated by production
code's `.emit()` calls, read by tests via `TestClient`'s inbox). `disconnect()` stays synchronous to
satisfy the real `Socket.disconnect(): this` signature structurally, but captures its async dispatch
chain in a promise a caller can await via `waitForDisconnectHandlingAsync()`.

**`TestClient`.** One per simulated user — anonymous or JWT-authenticated (mints a token against the
test secret, exercising the real `verifyTokenAndCreateAuthenticatedUser` path the FE uses, with no
DB access). HTTP helpers mirror the FE's actual calls (`createLobbyAsync`, `joinLobbyAsync`,
`enterQueueAsync`, `spectateGameAsync`, `findAvailableLobbyAsync`); `connectAsync` /
`attemptConnectAsync` drive the fake socket through the real seam; an inbox exposes `lobbyState`,
`gameState`, `connectionErrors` and raw `receivedEvents`. `serverIntegration()` mirrors the card
suite's `integration()` ergonomics, handing the harness to the spec body via a `contextRef`.

**Fidelity guard.** `SocketIoDriftGuard.spec.ts` runs a handful of specs over a *real*
`socket.io-client` against `TestGameServer`'s real bound port (lobbystate reachability, invalid-JWT
rejection, valid-JWT-but-nowhere-to-go rejection) to catch drift between the fake transport and the
real one.

**Dead code found and removed: `gamestate`'s ack callback never fired against the real client.**
While building the fidelity guard, a library-level probe (real `socket.io`/`socket.io-client`, no
`TestGameServer` involved) confirmed that a server `emit(event, data, ackCallback)` only invokes
`ackCallback` if the receiving listener explicitly calls the extra trailing argument socket.io
injects. The FE's `gamestate` listener (`forceteki-client`'s `Game.context.tsx`) declares only one
parameter, so `Lobby.sendGameState`'s ack (`() => this.safeSetUserConnected(...)`) never fired
against a real client. Tracing every consumer of `user.state` showed nothing actually depended on
it: a genuine reconnect always gets a brand-new socket (no `connectionStateRecovery` configured) and
sets `state = 'connected'` directly in `addLobbyUserAsync`, and any inbound message already does the
same via `updateUserLastActivity` — both independent of the ack. Git history (`928673b64`, "Connection
improvements during matchmaking countdown") showed it was one of four defensive measures landed
together against a *suspected, not confirmed* flaky-connection bug; the other three still do
something, this one never did. Removed outright — the callback argument, `safeSetUserConnected`, and
the comment describing it — rather than carried forward as a characterised-but-unfixed finding.

**`LobbyConnectionManagement.spec.ts`** is the first scenario spec built on the full stack: public
lobby browse-and-join, lobby-full stops advertising, private lobby via connection-link only (no HTTP
join call), private lobby invisible to browsing, and graceful leave updating the other user's
`lobbystate`.

**Retrofit.** The two Phase 0/1 specs that use one fixed harness for the whole file
(`GameServerLobbyApi.spec.ts`, `GameServerScheduling.spec.ts`) now use `serverIntegration()`.
`GameServerAnonymousRestrictions.spec.ts` was deliberately left as-is — several of its scenarios need
a different config override per test or per `describe` block, which `serverIntegration()`'s
single-harness-per-file shape does not fit, and forcing it in would make that file worse, not
better.

**Established convention: discriminated-union narrowing needs an explicit type predicate.** This
project's `tsconfig.json` has no `strict` / `strictNullChecks`, and TypeScript's control-flow
narrowing of discriminated unions (`if (result.success) { ... } else { ... }`) depends on
`strictNullChecks` being on — without it, both branches keep seeing the full, un-narrowed union.
Confirmed in isolation: an extracted repro fails identically to the real failure under `tsc --noEmit`
without `--strict`, and compiles clean with `--strictNullChecks` added. `ISocketAuthResult`'s two
shapes are instead narrowed with explicit `function isX(result): result is {...}` predicates
(`isSuccessfulSocketAuth`, `isConnectionRejected`), which narrow by assertion rather than structural
inference and work regardless of the strictness setting. **Use this pattern for any new
discriminated-union code in this project** until/unless `strictNullChecks` is enabled project-wide.

**Gates:** targeted specs green — `GameServerLobbyApi`, `GameServerScheduling`,
`GameServerAnonymousRestrictions`, `SocketIoDriftGuard`, `LobbyConnectionManagement` (31
specs, 0 failures); `tsc --noEmit` clean on both `tsconfig.json` and `test/tsconfig.json`; `eslint
--quiet` clean repo-wide; `validate-cards` clean; `test-parallel` 8814/0 (9 pre-existing pending) ·
`test-parallel-undo` 8636/0 (15 pre-existing pending). Diff: 11 files, +1311 / −238; production
footprint is `GameServer.ts` alone, +145 / −61 (net +84, almost entirely extraction of existing
logic into named methods).

### Phase 2.5 — external stats HTTP mocking seam ✅

Raised while scoping Phase 4: `SwuStatsHandler` / `SwuBaseHandler` called the global `fetch` directly
and were constructed inline in `GameServer`'s constructor (`new SwuStatsHandler(this.userFactory)`),
with no injection seam — unlike every other external boundary, which the scheduler/config work
already covered. Without this, "external stats: exact payloads to SwuStats/SwuBase" (Phase 4) had no
way to intercept the request or control the response.

**Production seam**, mirroring `IScheduler`/`RealScheduler` exactly: `IHttpClient` (one method,
`fetch(url, init?)`) and `RealHttpClient` (a thin pass-through to the global `fetch`) in
`server/utils/`. `IGameServerOptions.httpClient` defaults to `new RealHttpClient()`; `GameServer`
stores it and passes it to both handlers' constructors, which now take `httpClient: IHttpClient` as
a required parameter (no default there, matching `QueueHandler`'s existing `scheduler` parameter) and
call `this.httpClient.fetch(...)` at all seven call sites (three in `SwuStatsHandler`, four in
`SwuBaseHandler`) instead of the bare global.

**`FakeHttpClient`** records every request (`requests` / `requestsTo(urlSubstring)`) and answers with
a configurable canned response (`setResponse` / `setDefaultResponse`), defaulting to a 200 with an
empty JSON body so a test only configures one when it cares about something else. Responses are real
`Response` instances (the global class), so handler code reading `.ok` / `.status` / `.json()` /
`.text()` gets genuinely spec-compliant behaviour rather than a hand-rolled approximation - the same
"mock the outside world, keep the inside real" principle as `TestScheduler` and `FakeIoSocket`.
`TestGameServer` creates one and exposes it as `testHttpClient`; `ServerTestHarness` re-exposes it as
`statsHttpClient`, named to read unambiguously alongside `api` (the opposite direction of traffic).

**`ServerTestEnv.ts`** gained dummy `SWUSTATS_*` / `SWUBASE_*` credentials. Both handlers read these
at construction time to populate fields sent in outgoing payloads (`apiKey`, `client_id`, ...); left
unset, every harness-built server would send `undefined` in those fields regardless of what a test
configures, which would silently misrepresent production.

**Demonstration specs** (not the Phase 4 scenario work itself, just proof the seam works):
`RealHttpClient.spec.ts` against a real local server, mirroring `RealScheduler.spec.ts`'s role; and
`SwuStatsHandler.spec.ts` / `SwuBaseHandler.spec.ts`, each constructing the handler directly with a
`FakeHttpClient` and covering one or two representative methods end-to-end (request sent, response
parsed, cache/error branches). `SwuStatsHandler.spec.ts` additionally confirms the harness-wired
instance (`harness.server.swuStatsHandler`) actually uses `harness.statsHttpClient`, proving the
injection chain itself; `SwuBaseHandler.spec.ts` skips repeating that check since the wiring is
identical for both handlers. Exhaustive per-method and full-game-flow coverage remains Phase 4's job.

**Scope note:** `SwuDbDeckFetcher` and `MeleeDeckFetcher` (external deck-link resolution) have the
identical bare-`fetch` pattern and could reuse `IHttpClient` the same way, but were left untouched -
out of scope for stats mocking and more naturally picked up alongside the "Deck management" future
test suite below, which already needs its own fixtures for the sources it resolves links against.

**Gates:** 13 new specs green (3 `RealHttpClient` + 6 `SwuStatsHandler` + 4 `SwuBaseHandler`);
`tsc --noEmit` and `eslint --quiet` clean on both touched trees; all of `test/server/gamenode/` +
`test/server/utils/` run together - every pre-existing spec in both directories plus these 13 -
196/0. Full `test-parallel` / `test-parallel-undo` / `validate-cards` intentionally not re-run for
this step - nothing under `server/game/**` changed, so the card suite is not in play; see the CI
structure section below, which already documents this exact split.

## Remaining work

### Phase 3 — protocol surface

Replace the dynamic `this[command]` dispatch in `Lobby.onLobbyMessage` / `onGameMessage` with an
explicit allowlist. Any connected client can currently invoke **any** method on `Lobby` or `Game`
with arbitrary arguments (`cleanLobby`, `removeUser`, `startGameAsync`, …); spectators have an
allowlist, players do not. Beyond the security fix, this gives the suite a declared protocol to test
against instead of an open-ended surface.

Add `validateMatchConfiguration(format, cardPool, gamesToWinMode, context)` mirroring the FE's
`LobbyFormatConfigs` / `QueueFormatConfigs`. See the game-mode matrix gap below.

**Interface migration to do alongside this:** `IMatchConfiguration` (`{ format, cardPool,
gamesToWinMode }`, currently test-only in `TestClient.ts`) mirrors fields `create-lobby` /
`enter-queue` destructure untyped off `req.body` - migrate it to production (precedent:
`IDeckValidationProperties` already does this for two of the three fields) and have
`validateMatchConfiguration` take it as its parameter, with `TestClient` importing the real type
instead of keeping a parallel copy. Weaker but related: `ITestUserPayload` (`{ id, username }`,
`ServerTestHarness.ts`) mirrors the entirely untyped `queryUser` in
`UserFactory.createAnonymousUserFromQuery` - worth a look in the same pass but lower priority.

### Phase 4 — Tier 1 scenarios

- Create lobby (public/private) → connect → `lobbystate`; owner assignment
- Join via browse-and-join; join via link; join-full race; join nonexistent; join while already in a lobby
- Queue: enter → connect → matchmake → quick lobby → countdown → game start; solo wait + heartbeat
- Leave lobby; empty-lobby cleanup; lobby owner reassignment
- Reconnect inside grace window (socket swap); beyond grace (removal); matchmaking variant (requeue + `matchmakingFailed`)
- Inactivity kick → `inactiveDisconnect` + `forceDisconnect`, no re-entry
- Anonymous vs authenticated: chat enabled/disabled, Bo3 gating, spectator gating
- External stats: exact payloads to SwuStats/SwuBase/DeckService; `LoggedInOnly` / `SavedDecksOnly`
  skips (mocking seam ready - see Phase 2.5)
- Internal stats: `statsSubmitNotification` payloads including the repeated-send path
- **Game-mode configuration matrix** (see below)

### Phase 5 — Tier 2 scenarios

Command allowlist enforcement · spectator flows and `allowSpectators` · socket auth failures ·
double-connect / multi-tab · deck gates (`change-deck`, start-time deck size) · maintenance mode
(503 across all four entry points) · discovery endpoint filtering · lobby name profanity/length ·
matchmaking cooldown · ack-less client.

The fidelity suite guarding the fake transport against drift landed early, in Phase 2
(`SocketIoDriftGuard.spec.ts`), since the handoff spec needed it as a safety net from the start.

### Phase 6 — CI wiring and parallel-safety review

## CI structure

The suite is partitioned by a single property: **does the spec drive a `Game` through the
`integration()` harness?** That is what determines whether the undo suite is meaningful for it.

| Group | Config | Contents | Specs |
|---|---|---|---|
| Game | `jasmine-game.json` | cards, core, actions, gameSystems, scenarios | 8562 |
| Non-game | `jasmine-nongame.json` | `server/utils/**` (deck validation, fetchers, scheduler), `server/gamenode/**` | 148 |

The boundary is clean today: every spec under `server/utils/**` and `server/gamenode/**` uses no
`integration()` block, and every spec outside them does (bar two engine unit tests in `core/` that
are engine-adjacent and cost nothing to leave in the game group). The two configs are verified to
partition the suite exactly — 8562 + 148 = 8710, with no spec lost or double-run.

`jasmine.json` still runs everything and remains what CI uses, so this changes no gate today. The
intended split, when the server suite grows enough to be worth a second runner:

- `test-parallel-game` and `test-parallel-nongame` as separate jobs
- `test-parallel-undo` pointed at `jasmine-game.json`, since undo mode does nothing for specs that
  never construct a `Game` — it is wasted work in the non-game group

**Path-based filtering was considered and rejected.** GitHub Actions supports it, but workflow-level
`paths` never reports its checks, which would block a repo using merge queues; and job-level gating
needs a `dorny/paths-filter` step whose filter list would have to enumerate engine paths, because
the coupling runs both ways. `DecklistFixtures` scans the live card catalogue and validates through
the real `DeckValidator`, so a card-data or legality change can break the server suite; and this very
PR shows gamenode work reaching into `Game.ts` and `SimpleActionTimer.ts`. A hand-maintained path
list guarding that relationship would rot silently. Splitting by *what a spec needs* is stable;
splitting by *what changed* is not.

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
   shutdown'` spec will start failing once a spec exercises an abrupt disconnect that reaches this
   branch — which is the correct outcome, and the fix belongs with that work. Still not triggered as
   of Phase 2: the one disconnect scenario built so far (`TestClient.manualDisconnectAsync`) takes
   `onSocketDisconnected`'s early-return "intentional disconnect" branch, which never registers the
   grace timer. The abrupt-drop variant (`TestClient.disconnectTransportAsync` exists but is not yet
   used by a spec) is Phase 4's "beyond grace window" scenario and will be the one to watch.

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
