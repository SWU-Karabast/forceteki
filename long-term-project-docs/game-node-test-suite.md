# Game Node Test Suite

Status: **in progress** — Phases 0–2.5 are merged to `main` (PRs #2934 and #2950). Subsequent PRs
(#2994, #3001, #3011, #3014) added substantial scenario coverage on the harness, which covers parts of
Phases 3–5. The plan below was re-evaluated against `main` @ `7e2e57541` on 2026-10-15; see
[Merged since Phase 2.5](#merged-since-phase-25--evaluation-of-2026-10-15) for what moved, and
[Test infrastructure backlog](#test-infrastructure-backlog) for the infrastructure work this
evaluation recommends. The **next PR** — account-auth guards (which needs DynamoDB mocked) plus suite guardrails
and cleanup — is planned under
[Next PR](#next-pr--account-auth-guards-and-suite-guardrails-planned-2026-10-15).

**Suite size (measured 2026-10-15):** 404 non-game specs (`jasmine-nongame.json`), ~6.3 s wall-clock
under `--parallel=4 --random=true`; 7 consecutive runs, 0 failures, 0 flakes. 8,971 game specs; 9,375
total.

## Why this exists

`GameServer`, `Lobby` and `QueueHandler` own everything between a user clicking "play" and a game
running: the HTTP API, socket.io lifecycle, lobby membership, matchmaking, disconnect handling, and
the stats reporting that follows a game. The socket management in particular is convoluted and
sparsely documented, and it is the part we most want to restructure.

When this project started we could not safely restructure it, because **there was no test coverage of
any of it**: the card suite (~8,700 specs at the time) constructs a `Game` directly with a stub
router and never touches `Lobby` or `GameServer`. That is no longer true — the connection layer now
has its own 404-spec suite — but coverage is uneven (deep on matchmaking, chat and identity; absent on
stats, spectating, timers and most of the HTTP surface), which the plan below tracks.

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
through it. *(Re-audited 2026-10-15: still true of `server/gamenode/**`, apart from two diagnostic
profiling-dump timeouts in `GameServer`. It is no longer true of the wider server — `TimedCache` and
the four services built on it, `ModActionService`, both deck fetchers' abort timeouts and
`DynamoDBService`'s retry delay all use raw timers. See infrastructure backlog item I-1/I-3.)*

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
`GameServerAnonymousRestrictions.spec.ts` was left as-is on the reasoning that its per-`describe`
config overrides did not fit the helper. **That reasoning was wrong:** `serverIntegration(definitions,
configOverrides)` takes overrides per call, and `GameServerMatchmaking.spec.ts` uses it exactly that
way. The file can be migrated (one `serverIntegration` call per `describe`); it is the only gamenode
spec still hand-rolling its harness lifecycle. Trivial consistency item, see I-9.

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

### Pre-PR review (round 2) — fixes applied ✅

A second design review, focused on the fake transport built in Phase 2, found two real gaps - both
confirmed empirically by deliberately reverting the fix and watching a new test fail before
restoring it:

1. **`FakeIoSocket.simulateClientEmit` dispatched to handlers even on an already-disconnected
   socket.** Real socket.io removes a socket from its namespace on disconnect, so nothing reaches a
   handler for it again; the fake had no equivalent check. This mattered because every lobby/game
   message runs `Lobby.updateUserLastActivity`, which unconditionally marks the user `'connected'` -
   so a single stale message after disconnect could silently cancel a pending grace-window removal,
   and the test would just look like the removal hadn't happened *yet* rather than failing outright.
   Fixed by throwing from `simulateClientEmit` when the socket is disconnected, except for
   `'disconnect'` itself (which `disconnect()` dispatches after already flipping the flag).

2. **`TestClient` had no way to observe what happened to a socket it reconnected away from.**
   `connectAsync` overwrote `_socket` outright, so a spec could never check that production actually
   disconnected the stale one (`Lobby.checkUpdateSocket`'s `user.socket.disconnect()` call) - that
   line could be deleted and nothing would notice. Added `TestClient.previousSocket`, capturing the
   prior socket on every reconnect, so a spec can assert `previousSocket.connected === false`. This
   also covers the Phase 5 multi-tab case, since a reconnect and a second tab are the same thing
   server-side.

Both landed as new specs in `LobbyConnectionManagement.spec.ts` rather than fixes alone, closing two
scenarios that section's own note had flagged as not yet written: an abrupt disconnect surviving to
(and being removed at) the grace window, and a reconnect swapping sockets. One spec in the first
scenario doubles as the regression lock for finding 1 (it deliberately attempts a stale send and
asserts it is rejected instead of reviving the user); the reconnect spec is the regression lock for
finding 2.

Not changed: `checkUpdateSocket` also calls `removeEventsListeners(['disconnect'])` on the old socket
before disconnecting it, and losing *that* line is just as invisible to every test above - but it's
genuinely harmless. Traced through `addLobbyUserAsync`: `existingUser.state = 'connected'` runs
before `checkUpdateSocket`, and `updateUserLastActivity` (which also sets `state = 'connected'`) runs
unconditionally right after it returns - so even if the old socket's stale disconnect listener fired
and flipped `state` back to `'disconnected'` in between, the very next line in the same synchronous
call overwrites it before anything else can observe it. Confirmed by reasoning through the exact
call order rather than adding a test for it, since the only way to assert it would mean asserting on
internal dispatch plumbing rather than observable behaviour (design goal 2).

**Gates:** both new specs fail when their respective fix is reverted (confirmed by deliberately
reverting each and restoring it), and pass with the fix in place; full `test/server/gamenode/` +
`test/server/utils/` sweep - 200/0; `tsc --noEmit` and `eslint --quiet` clean repo-wide. No
production code changed - both fixes are entirely in the test helpers.

### Merged since Phase 2.5 — evaluation of 2026-10-15

Four PRs touching the connection layer landed after Phase 2.5. One of them (#3014) came from another
contributor, who used the harness with no guidance beyond the code itself — the strongest evidence so far
that the infrastructure is usable, and (see I-10) also where the reinvented helpers below come from.
Everything below was verified against `main` rather than inferred from PR titles: spec files were read,
production diffs were read, and the allowlist was audited against the `forceteki-client` source.

| PR | What it added | Specs added (`it` blocks) |
|---|---|---|
| #2994 *disable reporting* | Backend for the mod-UI "disable reporting" action (`ModActionService`, `UserFactory`, `GameServer`, `Lobby`) | **none** |
| #3001 *matchmaking preference* | Competitive/casual preference, staged eligibility windows, absolute retry scheduling, `queueHeartbeat` status, `SchedulerTaskScope` | `GameServerMatchmaking` (36), `QueueHandler` (22), `SchedulerTaskScope` (9) |
| #3011 *username mod actions* | Forced-rename and block-username-change mod actions, `UsernameRules`, `ModActionSubmissionHandler` | `UsernameModerationFlow` (19), `ModActionSubmissionHandler` (17), `UsernameRules` (13), `UserFactory` (extended), `DynamoDBInterfaceSchemas` (11), `usernameBlockMigration` (13) |
| #3014 *game commands & anonymous players* | Command allowlists; server-side chat and report rules; anonymous-identity hardening (UUID ids, derived names, impersonation eviction); `PUT preferences` ownership check; test-game path-traversal fix | `AnonymousIdentity` (15), `ChatPermissions` (16), `LobbyReports` (3), `SocketCommandAllowlist` (4), `GameServerUserApi` (3), `GameServerTestGameSetups` (2) |

**Planned items now covered** — struck from *Remaining work* below:

| Original plan item | Status | Covered by |
|---|---|---|
| Phase 3a: replace `this[command]` dispatch with an allowlist (Open finding #4) | ✅ done | #3014. Every allowlisted name resolves to a real `Lobby`/`Game` method, and the allowlist is a superset of every command `forceteki-client` sends (audited, including the raw `emit('lobby', …)` forms and the special-cased `resetActionTimer`). Residual guards: Phase 3 |
| Create lobby (public/private) → connect → `lobbystate` | ✅ | `LobbyConnectionManagement`, `GameServerLobbyApi` (Phase 2; never struck from the old Phase 4 list) |
| Join via browse-and-join; via link; join nonexistent (HTTP 404) | ✅ | same. Full-lobby race and join-while-already-in-a-lobby remain: Phase 4 |
| Leave lobby; remaining user's `lobbystate` updates | ✅ | `LobbyConnectionManagement` |
| Reconnect: socket swap; beyond-grace removal | ✅ | `LobbyConnectionManagement` (round 2). Reconnect *inside* the window remains: Phase 4 |
| Queue: enter → connect → matchmake; solo wait + heartbeat | ✅ | `GameServerMatchmaking`, `QueueHandler` — immediate and windowed matches, partner selection, heartbeat stage transitions, retry deadlines |
| Queued reconnect; matchmaking variant (requeue + `matchmakingFailed`) | ✅ | `GameServerMatchmaking` — search age/context survives reconnect and refresh; opponent drop during countdown → `matchmakingFailed` + requeue; explicit post-game requeue |
| Matchmaking cooldown (Phase 5) | ✅ | `GameServerMatchmaking` / `QueueHandler` — rematch cooldown binds and can be disabled by config |
| Anonymous vs authenticated: chat | ✅ complete | `ChatPermissions` — public lobby, private lobby, game, and the local-dev override |
| Anonymous: Bo3 gating | ◐ 2 of 4 sites | `GameServerAnonymousRestrictions` covers `create-lobby` and `enter-queue`; `join-lobby` and join-via-link (the other two `validateBo3Access` call sites) are untested |
| Anonymous: spectator gating | ◐ HTTP only | `GameServerAnonymousRestrictions`; the socket-side gate in `onConnectionAsync` is untested |
| Socket auth failures | ◐ | invalid JWT (`SocketIoDriftGuard`) and non-UUID anonymous ids (`AnonymousIdentity`); malformed handshakes remain: Phase 5 |
| Open finding #5: uncancellable timers | ✅ resolved in production | #3001 `SchedulerTaskScope`; verified empirically (below). Regression lock still to add |
| External stats | ◐ | handler-level token refresh/link/unlink (Phase 2.5); game-result payloads remain: Phase 4 |
| ~~Ack-less client (Phase 5)~~ | ⊘ obsolete | the ack callback it modelled was deleted as dead code in #2950 |

**New categories that are incomplete, or that the plan now has to account for:**

- **Command allowlist.** Tested negatively (a server-internal method is ignored) and positively for only 2 of
  the 22 allowlisted commands. The spectator allowlist and the FE↔BE contract itself have no guard.
  → Phase 3 residual.
- **Reports.** Three specs cover the logged-in-only rule. The feature in #2994 (reporting disabled by a
  moderator) has **no tests at all**, nor do Discord failure paths. Worse, the "forwards a bug report" success
  spec passes through `submitReport`'s *fail-open* branch (the harness has no `ModActionService`, and the code
  then logs an error and allows the report without checking restrictions), so it never evaluates the restriction
  at all. Blocked on I-1 and I-2.
- **Username moderation.** Thorough at service level over an in-memory DB, but nothing drives the HTTP
  routes: `UsernameModerationFlow.spec.ts` re-implements `/api/get-user`'s notice-state derivation inside
  the spec because it cannot call the route. Two of these specs (`server/scripts/`, `server/services/`)
  also fall outside the non-game glob (see CI structure).
- **Identity hardening.** Lobby and queue impersonation are covered well. The spectator path
  (`UserRole.Spectator` registration via `/api/spectate-game`) is not.
- **Quick-lobby countdown.** Used as *setup* in five places across four spec files, but never the subject: the
  countdown text sequence, the "neither player connects" branch (`remainingSeconds ≤ -4` → `removeLobby` +
  requeue), and game-start gating are untested.
- **HTTP surface.** 39 of the 50 routes in `GameServer` are not referenced by any non-card spec or helper
  (a text search, so a lower bound on the gap rather than line coverage). Counted route by route: **32** are
  gated on DynamoDB-backed services the harness cannot reach (mod/admin, account and settings, linked accounts,
  deck CRUD, cosmetics), 5 need nothing at all (`health`, `ongoing-games`, `all-leaders`, `get-unimplemented`,
  `test-game-setups`), 1 needs the deck-fetcher HTTP seam (`resolve-deck-link`) and 1 is profiling. The DB gap is
  the single biggest lever in the backlog (I-1).

**Finding #5 verified, not assumed.** A throwaway probe (since deleted) confirmed both leaks the finding
originally cited are gone: an abrupt disconnect adds a pending grace timer (3 → 4 tasks) and shutdown
cancels it (→ 0); a live game with action timers enabled drains to 0 on shutdown. Both are a one-line
`pendingTaskCount` assertion and belong in `GameServerScheduling.spec.ts` as a permanent lock.

**Stability.** The non-game suite was run 7 times under CI's `--parallel=4 --random=true` (2,828 spec
executions): 0 failures, 6.2–6.9 s each.

## Remaining work

### Next PR — account-auth guards and suite guardrails (planned 2026-10-15)

Two priorities set the scope: (1) everything needed to write tests that guard **authentication and authorisation
for logged-in accounts**, which requires DynamoDB to be mocked; and (2) cleanup, so that the workarounds the last
three PRs had to invent (inline DB fakes, `as any` into private state, fixtures that ride on client-supplied data,
a game/non-game partition that drifts) are not built on further. Decisions taken: **one PR with ordered commits**
(each builds and passes the non-game suite on its own, so commits 1–2 can be split out if review stalls); a
**vertical slice** of the auth suite rather than the full matrix; the two security-relevant behaviours found along
the way are **pinned by specs, not fixed**; and the scheduler seam for the DB-backed caches is **included**. This
section supersedes the Phase 6 partition and fast-loop items, and the backlog's "Suggested order", for the items it
schedules.

**What the investigation established.** Read from the code and the FE, then confirmed with throwaway probe specs
against the real server (since deleted).

*How logged-in accounts authenticate.* The credential is a NextAuth JWT (HS256, signed with `NEXTAUTH_SECRET`): the
`next-auth.session-token` cookie (or `__Secure-next-auth.session-token`) on the API, `handshake.auth.token` on the
socket. Both entry points — `authMiddleware` and `GameServer.authenticateSocketAsync` — choose one of three paths:

| Path | Chosen when | What the server does | JWT claims it needs |
|---|---|---|---|
| Anonymous | no token | `createAnonymousUserFromQuery`: UUID id, derived name | — |
| Trust | token **and** `user.authenticated` | `verifyTokenAndCreateAuthenticatedUser`: verifies the JWT, takes only `id` from it; **every other field is client-supplied** | `userId` |
| DB | token, no `authenticated` flag | `createUserFromTokenAsync`: finds the account by OAuth link, then by email (adding the OAuth link), or creates it (profile, OAuth/email/username links, username-change record); records the login | `id`, `name`, `email`, `provider`, `providerId` |

The FE makes the split deliberate (`forceteki-client/src/app/_utils/auth.ts`, `_contexts/User.context.tsx`). Its JWT
callback sets `id = <provider>_<providerId>`, `provider`, `providerId`, `name` and `email`. The first
`/api/get-user` of a session takes the **DB path** and creates the account; the FE then stores the profile, sets
`authenticated: true` and adds `userId` to the JWT with `session.update`. From then on every request and socket takes
the **trust path**. So the trust path carries almost all traffic, while the DB path — where accounts are created and
looked up — runs once per session sync and has no coverage today.

*What the harness can reach today.* Only the trust path: `TestClient` mints `{ userId }` tokens and always sends
`authenticated: true`. `ENVIRONMENT=development` makes `getDynamoDbServiceAsync()` return null, and the harness
passes no role, settings, cosmetics or mod-action services. So the DB path cannot run, and **every role-gated route
answers 403 "Error checking user privileges" to every authenticated caller** (the role cache is undefined): the
success path of a moderator or admin route is unreachable.

*The HTTP surface: 50 routes, 46 in production.* Counts and statuses were **measured**: a probe recorded every route
registration and sent each one an unauthenticated request (no cookie, body `{}`) against the default harness.

| Protection | Routes | Unauthenticated result |
|---|---:|---|
| No middleware — public read | 6 | 200: `get-unimplemented`, `ongoing-games`, `available-lobbies`, `health`, `all-leaders`, `server-settings` |
| No middleware — shared secret | 2 | `link-swustats`, `link-swubase`: 403 "Forbidden" with a secret set; **fail open when it is unset outside development** (Open finding #7) |
| No middleware — API key | 1 | `run-profile`: 401 "Missing PROFILE_CAPTURE_SECRET" (fails *closed* when unset) |
| No middleware — dev-only | 2 | `test-game-setups` 200; `start-test-game` 500 (no `filename`) |
| Role-gated by the middleware | 8 | 401 "Authentication required". Moderator (5): `POST` and `DELETE` cosmetics, `mod/find-user`, `mod/submit-action`, `mod/cancel-action`. Admin (3): `mod/server-settings`, plus the dev-only `DELETE /api/cosmetics` and `cosmetics-reset` |
| `authMiddleware`, anonymous rejected by the handler | 20 | **401** ×13 (`swustatsLink`, `swustats/decks`, `swubaseLink`, `toggle-welcome-message`, both `*-popup-seen`, `get-change-username-info`, `change-username`, `PUT preferences`, `get-deck/:id`, `save-deck`, deck `favorite`, `delete-decks`); **403** ×7 (the three `set-*-seen`, both `unlink-*`, `get-decks`, `rename-deck`) |
| `authMiddleware`, anonymous accepted | 10 | reaches the handler: `get-user` 200, `GET cosmetics` 200, three `user-is-*` 200 (message "Error checking user privileges" while there is no role cache), `resolve-deck-link` 400, `join-lobby` 404, `enter-queue` 400, `change-deck` 403 (not a lobby member), `create-lobby` **500** on an empty body |
| `authMiddleware`, anonymous conditional | 1 | `spectate-game`: 401 while `allowAnonymousSpectators` is false |

The four dev-only routes are registered only when `process.env.ENVIRONMENT === 'development'`, which is what the
default harness runs as, so its route table has four routes production does not. The 401-versus-403 split for the
same condition (an anonymous caller) is inconsistent across the 20 rejecting routes; the manifest spec will pin it.

*Authorisation facts.* Admin satisfies every role check; Moderator and Developer do not imply each other; no route
requires Developer or Contributor. Only `PUT /api/user/:userId/preferences` reads `:userId` and compares it with the
caller (403). The other five `/api/user/:userId/…` routes (`swustatsLink`, `swustats/decks`, `swubaseLink`,
`undo-popup-seen`, `timer-popup-seen`) never read the parameter and act on the caller, so there is no IDOR today — but
nothing locks that in, and a refactor that starts honouring the URL parameter would create one. `save-deck` ignores a
body-supplied `deck.userId` (`DeckService.saveDeckAsync` stamps the caller's id). There is **no ban or suspension
concept**: `ModActionType` is Mute, Warning, Rename, ReportingDisabled, UsernameChangesBlocked and ChangeUsername
(earlier versions of this document listed "ban enforcement"; removed).

*Verified by the probes.*

- **The DB seam needs no production change.** Spying `getDynamoDbServiceAsync` before the harness builds the server
  reaches every `UserFactory`, including the per-route ones `authMiddleware` creates while routes are registered.
- **DB path.** The first `/api/get-user` created the profile plus OAuth, email and username links (`Probe User` →
  `ProbeUser`, `showWelcomeMessage: true`); the second login found the same account and recorded a login; an account
  found only by email gained the OAuth link.
- **Credentials.** Wrong secret, expired, `alg: none`, malformed, trust path without `userId`, DB path without `id`,
  and DB path without `name` all returned 401 "Authentication failed" and wrote nothing to the DB.
- **Roles with a real `ServerRoleUsersCache`.** Nobody, contributor and developer get 403 on a Moderator route;
  moderator and admin reach the handler; a moderator gets 403 on an Admin route; no cookie gets 401.
- **Production-like construction** (`ENVIRONMENT=production`) removes all four dev-only routes (404).
- **Two behaviours to pin, not fix** (Open findings #2 and #7). The link routes accept an unauthenticated request when
  `INTRASERVICE_SECRET` is unset outside development (it reached the outbound SWUStats call). And with a DB present
  the trust path still echoes a client-supplied username (`SpoofedName` came back over the stored `RealName`).
- **A local `.env` leaks into specs.** `ServerTestEnv` pins other variables so a developer's `.env` cannot change a
  spec, but not `INTRASERVICE_SECRET` or `PROFILE_CAPTURE_SECRET`. On this machine `.env` sets the first, so the link
  routes answered 403 where CI (no `.env`) would throw a 500.

**Commit plan.** Sizes use the backlog's scale (XS ≈ an hour, S ≈ a day, M ≈ a few days); by that scale the PR is
large, roughly two weeks.

| # | Commit | Category | Size | Production change |
|---|---|---|---|---|
| 1 | Partition repair and guard | cleanup | S | move `DiscordDispatcher` (two import paths) |
| 2 | Helper hygiene, de-duplication, fast loop (I-8, I-9, I-11, part of I-4) | cleanup | S | none |
| 3 | DB seam: scheduler seam and `FakeDynamoDbService` | auth prerequisite | M | `export` the DB service class; optional scheduler on `TimedCache` and its four users |
| 4 | Harness wiring, token helpers, route recorder | auth prerequisite | M | none |
| 5 | Auth guard specs (vertical slice) | auth guards | M | none |
| 6 | Retire workarounds, enforce, document (I-5, I-10) | cleanup | S | `lobbies` `private` → `protected` |

**Commit 1 — partition repair and guard.**

- Widen `jasmine-nongame.json` to `server/{utils,gamenode,services,scripts}/**` and mirror the negations in
  `jasmine-game.json`. This moves `usernameBlockMigration` and `DynamoDBInterfaceSchemas` (about 24 specs) into the
  non-game group.
- Move `DiscordDispatcher` out of `server/game/core/` (the rules engine) to `server/gamenode/`: its only importers
  are `GameServer` and `Lobby`. Its spec (4 specs) moves to `test/server/gamenode/` so the test tree keeps mirroring
  the source tree. This corrects the earlier suggestion to move only the spec under `server/utils/`, which would
  have broken that mirror.
- New `scripts/validateSpecs.ts` (`npm run validate-specs`), run as an extra step in the existing `validate-cards`
  CI job (one install, no new job). It fails when (a) a spec using the card `integration()` harness sits in a
  non-game directory; (b) a game-group spec that does not use it is not on an explicit exemption list (today: the
  seven `scenarios/undo/*` specs, which have their own harness, plus `GameObjectBaseInitialization` and
  `EventWindow`); or (c) the two configs' expanded file sets overlap, or their union differs from `jasmine.json`. It
  reads the source `.ts` tree with `glob` (already a dependency), so it needs no build.
- Point `jasmine-undo` and `jasmine-undo-parallel` at `jasmine-game.json`: undo mode does nothing for specs that
  never build a `Game`.
- Acceptance: game + non-game = 9,375 by the load-only count; the guard fails when each rule is deliberately broken
  once locally.

**Commit 2 — helper hygiene.**

- Export `buildTestConfig`; `QueueHandler.spec.ts` uses it instead of its hand-copied `IGameNodeConfig` literal (I-8).
- Delete the dead acknowledgement API — `FakeIoSocket.ackEvent`, `IFakeEmittedEvent.ack`, the trailing-function
  handling in `emit`, `TestClient.ackEvent` (I-9a) — and migrate `GameServerAnonymousRestrictions.spec.ts` to
  `serverIntegration` (I-9b).
- Delete the test-only `IMatchConfiguration` in favour of the production `IQueueFormatKey`; one exported match
  config replaces six local `matchConfig` definitions.
- Add `TestClient.lobbyId` (replaces eight URL-parsing copies across four specs) and `harness.startQuickGameAsync`
  (replaces five copies of queue → connect → countdown; two specs define their own `setUpGameAsync`). The rest of
  I-4 stays in the backlog.
- Add `npm run test-nongame`: fast build, then `jasmine-nongame.json`, serial (I-11).
- Acceptance: spec count unchanged; the diff is setup moving, not assertions changing.

**Commit 3 — DB seam.**

- Production, all behaviour-neutral (the defaults reproduce today's behaviour, and `GameServer.createAsync` passes
  nothing, so production keeps real timers):
  - `export` the `DynamoDBService` class so tests can type against it (two specs re-derive the type with
    `Awaited<ReturnType<…>>`).
  - `TimedCache` takes an optional `IScheduler` (default `RealScheduler`), schedules through it, and gains `stop()`.
  - `ServerRoleUsersCache`, `ServerSettingsCache`, `CosmeticsCache`/`CosmeticsService` and `ModActionService` accept
    an optional trailing scheduler in `createAsync`. `ModActionService`'s four wall-clock reads (`new Date()`)
    become `scheduler.currentDate()` so temporary mutes expire on the virtual clock; its development-only debug
    interval goes through the scheduler too.
- `test/helpers/server/FakeDynamoDbService.ts`:
  - `implements Pick<DynamoDBService, …>` over the methods it supplies, so a signature change in the real service
    fails the build instead of the fake silently drifting. Methods outside the slice throw a named
    "not implemented" error rather than "x is not a function".
  - Slice scope, about 30 methods: profiles (get, save, update, remove attribute, preferences, settings, record
    login), identity links, username changes, mod actions (save, get, activate, cancel, remove from the active
    index), role lists, server settings, cosmetics. Decks stay out until the deck suite, which also needs I-3.
  - Fidelity rules copied from the real service: the OAuth link is a **conditional put** (a duplicate throws an error
    named `ConditionalCheckFailedException`); email and username keys are **case-folded** on write and read; a
    missing profile returns `undefined`; missing role lists default to four empty arrays; missing settings default to
    `{ gamesEnabled: true }`; `getModActionsAsync` returns only entries still in the active index.
  - Seeding and inspection: `seedAccount`, `seedRoles`, `seedSettings`, `seedModAction`, plus read-only views of
    profiles, links and recorded logins.
- `InMemoryModerationDb` (in `UsernameModerationFlow.spec.ts`) moves into the fake and that spec imports it — a move,
  not a rewrite.
- Acceptance: the existing service-level specs (`UsernameModerationFlow`, `ModActionSubmissionHandler`,
  `UserFactory`, `SchedulerTaskScope`) pass unchanged, plus a small fidelity spec for the rules above.

**Commit 4 — harness wiring.**

- `ServerTestHarness.createAsync({ config, database, env })` and `serverIntegration(definitions, options)`, replacing
  the positional config argument (three callers pass one: `ChatPermissions` and two in `GameServerMatchmaking`).
- With `database: true` the harness installs the module spy **inside `createAsync`, before the server is built**.
  `GameServer`'s field initialisers and `authMiddleware`'s per-route `UserFactory` capture the DB promise at
  construction, so installing the spy afterwards silently does nothing. It then builds the real role, settings,
  cosmetics and mod-action services over the fake on the harness `TestScheduler` and hands them to `TestGameServer`'s
  constructor, which already forwards those four parameters but today hard-codes `undefined`. `harness.db` exposes the
  fake; `shutdownAsync` stops the caches and asserts nothing is left scheduled. Gotcha, read from the code:
  `CosmeticsService.createAsync` throws in development unless `USE_LOCAL_DYNAMODB=true`, so the harness sets that
  variable while it builds the services (it has no other effect once `getDynamoDbServiceAsync` is spied).
- The default stays **no database**, so every existing spec is unchanged. (Production always has a DB and "no DB"
  is the local-dev configuration, so the default should eventually flip. As part of this commit, do a one-off trial
  run with it flipped and record which specs break, so that follow-up is sized.)
- Env hygiene: pin `INTRASERVICE_SECRET` and `PROFILE_CAPTURE_SECRET` in `ServerTestEnv`. `options.env` overrides
  `process.env` entries for the life of one harness and restores them in `afterEach` — process-global, but jasmine
  workers are separate processes and specs within one run serially. It is what builds a production-like server
  (`ENVIRONMENT=production`, `INTRASERVICE_SECRET` unset). Caveat: `PROFILE_CAPTURE_SECRET` is read from
  `server/env.ts`'s import-time parse rather than `process.env`, so only its pinned (set) branch is testable unless
  that module export can be overridden; confirm in the commit, and otherwise leave the unset branch unpinned.
- `test/helpers/server/AuthTokens.ts`: `mintSessionToken(claims)` with FE-faithful claims (documented against the FE
  `auth.ts`), named bad tokens (wrong secret, already expired, `alg: none`, malformed, missing claim) and the two
  cookie names. JWT expiry is checked against the **real wall clock**, so expired-token specs mint an already-expired
  token rather than advancing the virtual clock.
- `TestClient` auth modes: `trusted-profile` (today's behaviour, the default) and `token-only` (the DB path: no
  `authenticated` flag, DB-path claims, profile comes from a seeded account); plus raw `get`/`post` with full control
  over cookie and body user, for the manifest spec.
- Route recorder. The Express app is not reachable through `httpServer.listeners('request')`, because socket.io
  re-wraps those listeners when it attaches (a first attempt failed on exactly this). Instead the harness records
  routes by wrapping `express.application`'s `get`/`post`/`put`/`delete`/`patch` with jasmine spies while the server
  is constructed (Express copies those functions onto each new app). **Verified: 50 routes recorded, no production
  change.** If routes later move into `express.Router` modules, wrap `express.Router` the same way.

**Commit 5 — auth guard specs (the vertical slice).** New folder `test/server/gamenode/auth/` (the non-game glob
already covers it). Roughly 130–180 specs, most of them parameterised rows.

1. `RouteAuthManifest.spec.ts` + `RouteAuthManifest.ts` — one row per route (`public`, `anonymous-ok`,
   `authenticated`, `role:moderator`, `role:admin`, `shared-secret`, `api-key`, `dev-only`) with the pinned
   unauthenticated status from the table above. A completeness spec fails if a route is registered but unclassified,
   or a row names a route that no longer exists, so **a PR that adds a route cannot skip deciding its auth**.
   Per-row specs assert the unauthenticated outcome and, for role routes, the role matrix. Under a production-like
   harness the four dev-only routes are asserted absent.
2. `CredentialVerification.spec.ts` — the bad-token table run through **both** HTTP and the socket: wrong secret,
   expired, `alg: none`, malformed, trust path without `userId`, DB path without `id`, DB path without `name` (and no
   partial account written). Also: both cookie names accepted; the JWT's `userId` wins over a different `id` in the
   payload; a socket with a token and non-authenticated user data takes the DB path; the dev test-user ids (`exe66`,
   `th3w4y`, honoured only when `ENVIRONMENT=development`) are rejected under a production-like harness.
3. `AccountLogin.spec.ts` — first login creates the profile and links (cleaned username, welcome flag, a
   username-change record); a returning login finds the account by OAuth and records the login; an email-only match
   (case-insensitive) adds the OAuth link; link present but profile missing recreates it; `get-user` response shape.
   Plus the **Finding #2 characterisation**: the trust path echoes client-supplied `username`, `preferences` and
   `moderation` (pinned), with pending specs (`xit`, naming the finding) stating the intended behaviour — a
   server-derived profile.
4. `RoleAuthorization.spec.ts` — the role matrix on a Moderator and an Admin route (nobody, contributor, developer,
   moderator, admin); no cookie → 401; `GET user-is-*` reflect the seeded roles; a role revoked in the DB takes effect
   only after the cache refresh (virtual clock); and the maintenance-mode round trip — an Admin toggles
   `mod/server-settings`, then `create-lobby`, `join-lobby` and `enter-queue` answer 503 (this unblocks the
   maintenance-mode item in Phase 5).
5. `ServiceCredentials.spec.ts` — `link-swustats` / `link-swubase`: wrong key → 403, right key → the account gains the
   refresh token and the token mapping is set (through `FakeHttpClient`), unset secret in development → 500, and
   **unset secret outside development pinned as accepted** (Open finding #7) with a pending spec for fail-closed;
   `run-profile` header and secret matrix.

**Commit 6 — retire workarounds, enforce, document.**

- `ChatPermissions`: the legacy-mute and chat-disabled fixtures are seeded through the fake DB using `token-only`
  clients instead of client-supplied `userData` (they rely on Open finding #2 and would break when it is fixed); the
  mod-action mute uses a real `ModActionService` over the fake. That removes
  `(harness.server as any).modActionService` and the `as any` preferences cast.
- `GameServerUserApi`: assert the persisted preferences in the fake instead of overwriting
  `userFactory.updateUserPreferencesAsync` through `as any`.
- I-5: `GameServer.lobbies` `private` → `protected`, plus typed read-only accessors on `TestGameServer`
  (`testLobbies`, `lobbyCount`, `testLobbyFor(userId)`), used by `GameServerTestGameSetups` and `LobbyReports`.
  `LobbyReports` still overwrites the private `discordDispatcher` (I-2, not in this PR); that is the one remaining
  `as any`, carried as an explicit `eslint-disable-next-line` that points at I-2.
- ESLint: a block for `test/server/gamenode/**` and `test/helpers/server/**` with `no-restricted-syntax` at **error**
  for `as any` (selector `TSAsExpression[typeAnnotation.type='TSAnyKeyword']`). Not `no-explicit-any`: it is `warn`
  repo-wide and CI runs `--quiet`, so the 43 violations in these directories are invisible today (mostly type-position
  `any` in `FakeIoSocket` and `TestClient`), and ESLint 9.8 has no bulk-suppression mechanism (added in 9.24; an
  upgrade would enable it, but that is a repo-wide dependency change outside this PR).
  Targeting the actual bad pattern — reaching into private state — blocks the harmful cases without a 43-site
  cleanup. Known loophole: bracket access (`server['lobbies']`); the guide says not to.
- `CLAUDE.md` gains a "Writing a server spec" section: which harness for which kind of spec (`integration()` is game,
  `serverIntegration()` is the connection layer, and the partition rule); the sanctioned seams (virtual clock,
  `FakeHttpClient`, `FakeDynamoDbService`, `TestClient`, `AuthTokens`) and when a spy object is still right (pure
  unit specs, as in `UserFactory.spec.ts`); what not to do (`as any` into the server, real sleeps, client-supplied
  `userData` to seed account state, inline DB fakes); the wall-clock gotcha for JWTs; where auth specs live;
  `npm run test-nongame` (I-10).
- Replace the two duplicated `type DynamoDBService = Awaited<ReturnType<…>>` aliases with the exported type.
- Update this document: I-1 (slice), I-5, I-8, I-9, I-10, I-11 and the Phase 6 partition and fast-loop items marked
  done, new spec counts, and the findings.

**Production footprint.** No change to routes, auth logic or either secret check.

| File | Change | Behaviour change |
|---|---|---|
| `server/services/DynamoDBService.ts` | `export` the class | none |
| `server/utils/TimedCache.ts` | optional `IScheduler`, `stop()` | none by default |
| `ServerRoleUsersCache`, `ServerSettingsCache`, `CosmeticsCache`, `CosmeticsService`, `ModActionService` | optional scheduler parameter; `ModActionService` clock reads via the scheduler | none by default |
| `server/gamenode/GameServer.ts` | `lobbies` `private` → `protected`; `DiscordDispatcher` import path | none |
| `server/gamenode/Lobby.ts` | `DiscordDispatcher` import path | none |
| `server/game/core/DiscordDispatcher.ts` → `server/gamenode/` | file move | none |
| `package.json`, `jasmine-*.json`, `.github/workflows/pullrequest.yml`, `eslint.config.mjs`, `scripts/validateSpecs.ts` | tooling | none |

**Explicitly not in this PR.** Fixing Open findings #2 or #7; decks (the deck suite and the fake's deck tables); the
`/api/mod/*` action flows and moderation state reaching the client (`get-user`'s derived mute and reporting-disabled
fields, the three `set-*-seen` routes); ownership-scoping specs beyond what the manifest pins; the Discord seam (I-2)
and deck-fetcher seam (I-3); spectator, timer and stats scenarios (Phases 4–5); flipping the harness default to
"database on". **If the PR needs to shrink**, cut in this order: commit 6's `ChatPermissions` migration, then
`ServiceCredentials` and `RoleAuthorization` (independent of the manifest, credential and login specs).

**Verification** (the card suites are not run): `npm run test-parallel-nongame` five times in random order; the
load-only count showing the two groups partition `jasmine.json` exactly (still 9,375 after commit 1; plus the new
specs after commit 5); `npm run validate-cards`, `validate-specs`, `npx eslint --quiet` and `tsc` clean; each of the
probes' scenarios present as a permanent spec; each commit building and passing the non-game suite on its own.

**Risks and mitigations.**

- *The fake drifts from DynamoDB.* `implements Pick<DynamoDBService, …>` catches signature drift at compile time; the
  fidelity rules are listed in the file header and covered by their own spec. Running the same spec against DynamoDB
  Local is a possible later step, not part of this PR.
- *Spy-before-construction ordering.* Installing the spy after the server exists silently does nothing. The harness
  installs it itself and fails loudly if `database` is requested while `getDynamoDbServiceAsync` is not spied.
- *Process-global state* (the DB spy, the Express recorder, `process.env`): restored by jasmine or `afterEach`;
  jasmine workers are separate processes.
- *The default harness is not production-like* (no DB, `ENVIRONMENT=development`, four extra routes). Opt-in
  production-like mode now; the trial run sizes the default flip.
- *Wall-clock dependence.* JWT expiry always uses the real clock. `ModActionService` uses the virtual clock once the
  seam lands; anything else in the DB path that reads `Date.now()` directly would not.
- *A large PR.* Commits 1–2 are independently mergeable, and commit 3's production changes can be reviewed alone.

### Phase 3 — protocol surface (3a done; residual guards + 3b remain)

**3a — command allowlist: ✅ landed in #3014.** What remains is turning it from "implemented" into
"guarded", since an allowlist fails *silently* (an unrecognised command is just dropped):

- Export the three sets (`Lobby.allowedLobbyCommands` / `allowedGameCommands` /
  `allowedSpectatorCommands`, currently `private static`) so a spec can iterate them.
- **Consistency guard:** for every allowlisted name, assert the method exists on `Lobby.prototype` /
  `Game.prototype`. A rename today silently disables the command; nothing fails.
- **FE contract guard:** a checked-in manifest of the commands `forceteki-client` sends, asserted to be a
  subset of the allowlists. This audit was done by hand on 2026-10-15 and found no gap (14 lobby + 8
  game commands, including `reportScreenResolution` / `retransmitGameMessages`, which the FE sends as raw
  `emit('lobby', …)`, and `resetActionTimer`, which `onGameMessage` special-cases before the allowlist).
  The manifest needs a refresh step whenever the FE adds a command; note that in the FE PR template.
- **Positive coverage:** 2 of the 22 allowlisted commands are asserted as accepted. Add one routed-and-effective
  assertion per command (a parameterised spec over the exported sets, using typed `TestClient` commands — I-6),
  plus the spectator allowlist (`retransmitGameMessages` accepted; everything else ignored).

**3b — `validateMatchConfiguration`: not started.** Add it mirroring the FE's `LobbyFormatConfigs` /
`QueueFormatConfigs`; see Open finding #3. Follow the house style `enter-queue` already uses for the new
preference field (`EnumHelpers.isEnumValue` → `400` with `Invalid <field> '<value>'`), and keep a
backward-compat spec for omitted fields the way the preference work does (`defaults an omitted preference…`).
`gamesToWinMode` is still the one field never enum-checked on either route.

**Interface migration — corrected.** The previous version of this plan said `IMatchConfiguration`
(`{ format, cardPool, gamesToWinMode }`, test-only in `TestClient.ts`) should be *migrated to
production*. That missed that production **already has it**: `IQueueFormatKey` in `QueueHandler.ts` is
structurally identical and is used in ~12 places (`GameServer`, `Lobby.queueFormatKey`, `QueueHandler`).
So: delete `IMatchConfiguration`, have `validateMatchConfiguration` take `IQueueFormatKey` (consider a
neutral name, since lobbies use it too and "queue" is misleading), and point the one consumer
(`GameServerMatchmaking.spec.ts`) and `TestClient` at it. `ITestUserPayload` (`{ id, username }`)
remains a mirror of the still-untyped `queryUser` in `UserFactory.createAnonymousUserFromQuery`; lower priority.

### Phase 4 — Tier 1 scenarios (remaining)

Everything already covered has been removed from this list (see the table in *Merged since Phase 2.5*).
Each item notes the production behaviour verified on 2026-10-15 so the spec author knows what to look
for, and any infrastructure it needs. Items with no dependency can be started immediately.

**Lobby lifecycle** — no new infrastructure:

- **Ownership.** `lobbystate.lobbyOwnerId` is on the wire. Assert the creator owns the lobby; that ownership
  moves to the remaining user when the owner leaves (`Lobby.removeUser`); and the fallback in
  `addLobbyUserAsync` (owner missing from `userLobbyMap` → the joiner becomes owner).
- **Full lobby, two branches.** `join-lobby` on a filled lobby returns `400 Lobby is full`. But seats are
  only taken at socket connect, so two users can both pass that check, and the second then receives
  `connection_error: 'Lobby is full'` (the race the code comments on). Also: connecting via link to a
  nonexistent, full, or in-game lobby (silent disconnect).
- **Join while already in a lobby.** `canUserJoinNewLobby` blocks for 60 s of lobby inactivity, then
  *evicts* the stale mapping and removes the user from the old lobby. Only the `403` side is tested, and only
  for `create-lobby`. Add `join-lobby` / `enter-queue` variants and the ≥ 60 s eviction on the virtual clock.
- **Empty-lobby cleanup.** Last user leaves → the lobby is removed from the server and from discovery; also the
  5-users-left-and-5-minutes `Lobby timed out` path (`checkIncrementUsersLeftCount`).
- **Reconnect inside the grace window.** Abrupt drop, then reconnect within 20 s: the seat is kept and the
  timer does not remove them. In a live game: `lobbystate` and `gamestate` are re-sent, and grace expiry
  mid-game ends the game with `PlayerLeft`. (The queued-player equivalent is covered.)
- **Matchmaking-disconnect penalty.** A player who drops during the countdown is refused `create-lobby`,
  `join-lobby` and `enter-queue` for 20 s (`playerMatchmakingDisconnectedTime`). Untested.
- **Bo3 gating, remaining call sites:** `join-lobby` and join-via-link.

**Quick-lobby countdown as the subject** — needs I-4 for tidy setup:

- the countdown text sequence (`Starts in 5` … `Starts in 0`, then `Waiting for opponent to connect...`);
- the game starts only when both players are `connected`;
- neither connects within the window → `removeLobby` and requeue (`remainingSeconds ≤ -4`).

(A player dropping *mid-countdown* → `matchmakingFailed` is already covered.)

**Timers** — no new infrastructure; set `actionTimersEnabled: true` and use the public `ByoyomiTimer.*`
constants rather than literals:

- Inactivity kick → `inactiveDisconnect` + `forceDisconnect`, then `handleIntentionalDisconnect`; no re-entry.
- `resetActionTimer` actually extends the timer (the FE sends it when opening the bug-report dialog), and
  every lobby/game message refreshes it via `updateUserLastActivity`.

**Stats** — needs a harness helper that plays a game to completion (I-4):

- External: SWUStats / SWUBase game-result payloads through `FakeHttpClient` (handler-level token flows
  are covered); `LoggedInOnly` / `SavedDecksOnly` skips. `DeckService` is DB-backed, so it also needs I-1.
- Internal: `statsSubmitNotification` payloads, including the repeated-send path
  (`Lobby.sendStatsMessageToUser`).

**Game-mode configuration matrix** — blocked on Phase 3b.

**Permanent regression locks** (cheap — each is a single `pendingTaskCount` assertion in
`GameServerScheduling.spec.ts`): abrupt disconnect → shutdown with the grace timer still pending; live
game with action timers → shutdown.

### Phase 5 — Tier 2 scenarios (remaining)

Struck as covered or obsolete: matchmaking cooldown (covered), ack-less client (obsolete), command allowlist
enforcement (moved to Phase 3), and the fidelity suite (landed in Phase 2 as `SocketIoDriftGuard.spec.ts`).

- **HTTP smoke coverage — no dependencies.** `GET /api/health`, `/api/ongoing-games`, `/api/all-leaders`,
  `/api/get-unimplemented` and `/api/test-game-setups` need no database and no spec references them.
  `/api/ongoing-games` is the substantive one (private games must be hidden).
- **Spectator flows.** Join mid-game, `allowSpectators: false`, the anonymous-spectator gate on the *socket*
  path (the HTTP gate is covered), state retransmission, and spectator-role impersonation (identity hardening
  covers lobby and queue only). Needs I-4 for the live-game setup.
- **Socket handshake failures** beyond an invalid JWT: missing or non-JSON `query.lobby` (`JSON.parse` /
  `Helpers.getSingleOrThrow` in `onConnectionAsync`), non-JSON `query.user`, and the JWT claim-name
  inconsistency (Open finding #2).
- **Multi-tab beyond lobbies.** A second connection for a spectator, a queued player and an in-game player (the
  lobby case is covered through `TestClient.previousSocket`).
- **Deck gates.** `change-deck` legality and the start-time deck-size check. (The identity gate on `change-deck`
  is covered by `AnonymousIdentity`; `TestClient.changeDeckAsync` already exists.)
- **Maintenance mode.** `create-lobby`, `join-lobby` and `enter-queue` return `503` with the maintenance message;
  `requeueUser` instead sends a `connection_error` carrying it (that path is shared with the automatic requeue
  after an opponent drops); dev-only `start-test-game` is gated too; `spectate-game` is **not**. **Blocked on
  I-1:** `areGamesEnabled()` reads `serverSettingsCache`, which the harness leaves `undefined`, so maintenance
  mode can never be switched on. The next PR's `RoleAuthorization` spec covers the Admin-toggle → 503 round trip for
  `create-lobby`, `join-lobby` and `enter-queue`; `requeueUser`, `start-test-game` and `spectate-game` remain.
- **Discovery filtering.** The remaining `lobbiesWithOpenSeat` filters (quick lobbies, in-game lobbies) and the
  `hasConnectedPlayer` ghost-lobby behaviour (Open finding #1).
- **Lobby name validation.** Profanity and length rejections in `create-lobby`. No spec currently asserts that a
  name is *rejected* — the one profanity-related spec only checks that harness-generated names are accepted.

### Phase 6 — CI wiring and parallel-safety review

- ~~Repair the game / non-game partition and add a guard against it drifting again~~ — scheduled for the
  [next PR](#next-pr--account-auth-guards-and-suite-guardrails-planned-2026-10-15), commit 1 (details under *CI
  structure*).
- ~~Add a one-command fast loop for server specs (I-11).~~ — scheduled for the next PR, commit 2.
- Decide whether to split the CI jobs. Not urgent: the non-game group is 4% of specs and ~6 s.
- Formal parallel-safety review. Informally sound (7 clean runs; each harness binds its own ephemeral port with
  `exclusive: true`; card data is built once per worker), but I-1 will add module-level state — a
  `getDynamoDbServiceAsync` spy and its singleton — that must be installed and torn down per spec.

## Test infrastructure backlog

Found by reading every spec added since Phase 2.5 for the workarounds their authors had to build. Each item
cites the evidence, the production change it needs (the project goal is to keep these minimal and never
add test-only code to production classes — design goal 4), and what it unblocks. Sizes: XS ≈ an hour, S ≈ a
day, M ≈ a few days.

| # | Item | Production change | Size | Unblocks |
|---|---|---|---|---|
| I-1 | DB-backed services seam | scheduler into `TimedCache` and its 4 users | M | 32 untested routes, maintenance mode, mute enforcement, reports, account/settings, cosmetics, decks |
| I-2 | Discord dispatcher seam | one `IGameServerOptions` field | S | report scenarios, server-error reporting |
| I-3 | Deck-fetcher HTTP seam | fetchers take `IHttpClient` + `IScheduler` | S | `resolve-deck-link`, `swudbLink` flows, deck management |
| I-4 | Scenario builders | none | S | removes 5 copies of game setup and 8 of link parsing |
| I-5 | Typed inspection surface | `lobbies` `private` → `protected` | XS | retires 2 `as any` touches |
| I-6 | Typed client commands and chat accessors | none | S | Phase 3 positive coverage; retires `JSON.stringify` searches |
| I-7 | Time helpers | none | XS | readability of ~40 boundary assertions |
| I-8 | Shared test config | none | XS | stops config drift between helpers and specs |
| I-9 | Helper hygiene | none | XS | dead code; one inconsistent spec |
| I-10 | Contributor guide | none | S | stops the reinvention seen below |
| I-11 | Fast loop script | `package.json` only | XS | server spec iteration without the card build |

**Scheduled for the [next PR](#next-pr--account-auth-guards-and-suite-guardrails-planned-2026-10-15):** I-1 (the
slice: fake DB without decks, harness wiring, scheduler seam), I-5, I-8, I-9, I-10, I-11, and the `lobbyId`,
quick-game and match-config parts of I-4. **Still in the backlog:** I-2, I-3, I-6, I-7 and the rest of I-4.

**I-1 — DB-backed services seam (largest lever).**
*Evidence:* `TestGameServer` passes `undefined` for `ModActionService`, `ServerSettingsCache`,
`ServerRoleUsersCache` and `CosmeticsService`, which `GameServer`/`Lobby` reference 90 times, so none of that
behaviour is reachable. 32 of the 39 unreferenced routes depend on them. Authors worked around it three
different ways: an inline `InMemoryModerationDb` class (`UsernameModerationFlow.spec.ts`),
`jasmine.createSpyObj<DynamoDBService>` (`UserFactory.spec.ts`), and overwriting private state through `as any`
(`ChatPermissions`, `GameServerUserApi`). `UsernameModerationFlow` even re-implements `/api/get-user`'s
notice-state derivation inside the spec because it cannot call the route.
*Shape:* a single module-level entry point, `getDynamoDbServiceAsync()`, feeds exactly seven services, so the
seam is small. (1) Production prerequisite: `TimedCache` has a raw `setInterval` and **no way to stop it**, and
`ModActionService` can add another (a development-only debug interval); give them an `IScheduler` (default
`RealScheduler`) and a `stop()`, and read `ModActionService`'s four wall-clock reads (`new Date()`) through the
scheduler so temporary mutes can be tested on the virtual clock. Without this, harness-level services leak timers,
and the jasmine mock clock the service-level specs use instead is process-global, so it would also intercept any
other use of the global timer functions within the same spec. (2) Promote `InMemoryModerationDb` to
`test/helpers/server/FakeDynamoDbService.ts` and extend it to the settings, role, cosmetics and saved-deck tables.
(3) Let `ServerTestHarness.createAsync({ database: true })` build the real services
over it and hand them to the `TestGameServer` constructor, which already accepts them. This is exactly design
goal 5: fake the outside world (DynamoDB), keep the inside real.
*Side effect:* it makes Open finding #2 fixable under test (see the register below).

**I-2 — Discord dispatcher seam.** *Evidence:* `LobbyReports.spec.ts` pulls the `Lobby` out of
`GameServer`'s private `lobbies` map and overwrites its private `discordDispatcher`. `DiscordDispatcher` already
`implements IDiscordDispatcher` but is constructed inline in `GameServer`, and it posts through a module-level
`httpPostFormData`, so `FakeHttpClient` cannot see it either. *Shape:* `IGameServerOptions.discordDispatcher`
(default `new DiscordDispatcher()`), threaded the way `httpClient` was, plus a recording `FakeDiscordDispatcher`.

**I-3 — Deck-fetcher HTTP seam.** `SwuDbDeckFetcher` and `MeleeDeckFetcher` still call the global `fetch` and use
a raw `setTimeout` to abort. Route both through `IHttpClient` and `IScheduler`, as Phase 2.5 anticipated. It is now
the largest remaining raw network path.

**I-4 — Scenario builders (test-only).** *Evidence:* the same setup is hand-written repeatedly.

| Boilerplate | Occurrences |
|---|---|
| queue → connect → `advanceAsync(6_000)` → assert game started | 5 (two specs each define their own `setUpGameAsync`) |
| `new URL(lobbyState.connectionLink).searchParams.get('lobbyId')` | 8 across 4 specs |
| the three-field match config redefined locally | 6 of 14 gamenode specs |
| local helper definitions (`setUp*`, `queue*`, `enterQueue*`) | 5 |

*Shape:* `harness.startQuickGameAsync(a, b?, config?)` (owns the countdown constant); `TestClient.lobbyId`;
`harness.createLobbyWithGuestAsync({ isPrivate?, ownerOptions?, guestOptions? })` returning `{ owner, guest,
lobbyId }` and choosing browse-and-join or link by privacy; and one exported match config. Use the existing
production `IQueueFormatKey` rather than a test-local type (see Phase 3).

**I-5 — Typed inspection surface.** The plan promised "a narrow, explicitly-internal inspection surface"
(design goal 2) and never built it. *Evidence:* two specs reach into the private `lobbies` map via `as any`
(`LobbyReports`, `GameServerTestGameSetups`). Make `lobbies` `protected` — the "protected members plus an
inherited test class" pattern the project already prefers — and expose typed read-only accessors on
`TestGameServer` (`testLobbies`, `lobbyCount`, `testLobbyFor(userId)`). `GameServerMatchmaking.spec.ts` already
leans on two public production methods as test hooks (`getUserLobbyId`, `recordExpiringMatchmakingEntry`); that
is fine, but a named test surface is clearer.

**I-6 — Typed client commands and chat accessors (test-only).** Specs send raw strings
(`sendLobbyMessageAsync('proceedToNextBo3Game')`), which is now the allowlist contract spelled by hand. Add one
named method per allowlisted command (`sendChatMessageAsync`, `concedeAsync`, `concedeBo3Async`,
`setReadyAsync`, `startGameAsync`, `submitReportAsync`, …), which also makes the command surface greppable. Add
`lobbyChat` / `gameChat` accessors (flattening `gameChat.messages` and `gamestate.newMessages`) to replace the
`JSON.stringify(...).includes(...)` searches in `ChatPermissions` and `SocketCommandAllowlist`.

**I-7 — Time helpers.** 40 assertions use the "advance to T−1, assert not yet, advance 1, assert now" idiom
(`GameServerMatchmaking` 24, `QueueHandler` 16), and the same literals recur. Two optional improvements: a
boundary helper on `TestScheduler`, worth it mainly because Bo3 timers, action timers and grace windows will all
need the idiom; and named test-side constants for behaviour that is *not* matchmaking policy — the 6 s quick-lobby
countdown, the 20 s disconnect grace, the 60 s stale-lobby rule, the 20 s matchmaking-disconnect penalty. Keep these
in the tests rather than importing them from production: if someone changes 20 s to 30 s, that is a behaviour change
and the test *should* fail. (Matchmaking's own literals are the behaviour spec and should stay literal.)

**I-8 — Shared test config.** `QueueHandler.spec.ts` hand-copies the whole `IGameNodeConfig` literal, which
duplicates `buildTestConfig` in `TestGameServer.ts` (not exported). The two already had to be edited in lockstep
once, when `allowAnonymousChat` was added. Export `buildTestConfig`.

**I-9 — Helper hygiene.** (a) Remove the dead acknowledgement API: `FakeIoSocket.ackEvent`,
`IFakeEmittedEvent.ack`, the trailing-function handling in `emit`, and `TestClient.ackEvent`. They modelled the
production ack callback deleted in #2950, and no spec uses them. (b) Migrate `GameServerAnonymousRestrictions.spec.ts`
to `serverIntegration` (see the correction under Phase 2).

**I-10 — Contributor guide.** The only description of the server harness is this progress log, and `CLAUDE.md`
documents only the card harness. #3014 was written with an AI assistant and, with no guide to follow,
reinvented `matchConfig`, a game-setup helper and a link parser — all things the harness could own. Add a short
"writing a server spec" section to `CLAUDE.md`: use `serverIntegration` and `TestClient`; never `as any` into the
server; drive time with the virtual clock; use the scenario builders; how to run the group quickly (I-11).

**I-11 — Fast loop.** `npm run test-fast` with no path runs all 9,375 specs, and `test-parallel-nongame` does a
full rebuild. Add `test-nongame` (fast build, then `jasmine-nongame.json`) so server work has a loop that is
seconds, not minutes.

**Suggested order** *(the next PR's commit plan supersedes this for the items it schedules)*. The items that need no behavioural production change (I-8, I-9, I-4, I-6, I-5, I-11 — I-5's
only production edit is one visibility keyword, and I-11 touches `package.json` alone) are independent, low-risk,
and retire most of the duplication and every `as any` except the DB-backed ones; do them first, roughly in that
order. Then I-2 and I-3, which are small seams. Start I-1 in parallel with its production prerequisite (the
`TimedCache` scheduler), since it gates the most untested surface. I-10 should land with the first scenario
builders so new specs use them.

**Considered, deferred.** A shared log-capture helper (one use — `RealScheduler.spec.ts` — so no pattern yet);
per-route wrappers on `TestClient` (add on demand rather than speculatively); splitting `test/server/gamenode/`
into subfolders (14 files is still easy to scan); making the quick-lobby countdown and disconnect grace
configurable through `IGameNodeConfig` (worth doing only if the refactor wants them configurable).

## Refactor-fragility register

Existing tests that are coupled to internals the refactor is expected to change. They are legitimate today; this
list exists so none is mistaken for a stable contract when the refactor starts.

| Test | Coupling | Retired by |
|---|---|---|
| `GameServerMatchmaking`: `spyOn(Lobby.prototype, 'addLobbyUserAsync')` (×2) | Pauses lobby setup mid-flight to prove shutdown waits for in-flight matchmaking; depends on `Lobby`'s prototype and call order | rewrite against whatever replaces `Lobby` setup |
| `ChatPermissions`: legacy-mute and chat-disabled fixtures | Seeds `moderation` / `preferences` through **client-supplied** `userData`, i.e. relies on Open finding #2 as its setup mechanism. When that is fixed these fixtures stop working | I-1 (seed profiles in the fake DB) |
| `LobbyReports`, `GameServerTestGameSetups`, `ChatPermissions`, `GameServerUserApi`: `as any` | 5 touches of private or readonly state across 4 specs | I-1, I-2, I-5 |
| `GameServerMatchmaking`: `recordExpiringMatchmakingEntry` seeding | Uses a public production method as a test hook | acceptable; replace if the cooldown store moves |
| `GameServerScheduling`: `harness.server.swuStatsTokenMapping` | Reads a public mutable field | acceptable; the hourly cleanup is the behaviour |

## CI structure

The suite is partitioned by a single property: **does the spec drive a `Game` through the
`integration()` harness?** That is what determines whether the undo suite is meaningful for it.

| Group | Config | Contents | Specs (2026-10-15) |
|---|---|---|---|
| Game | `jasmine-game.json` | cards, core, actions, gameSystems, scenarios | 8,971 |
| Non-game | `jasmine-nongame.json` | `server/utils/**`, `server/gamenode/**` | 404 |
| Everything | `jasmine.json` (what CI runs) | | 9,375 |

The two configs still partition the suite exactly: 8,971 + 404 = 9,375, no spec lost or double-run. (Counted
by loading each config's specs through Jasmine's API with every spec filtered out, so no spec body executed and
the card suite was not run.)

**The boundary is no longer clean.** The non-game config is a pair of directory globs, and #3011 added two
non-game specs in new directories: `test/server/scripts/usernameBlockMigration.spec.ts` and
`test/server/services/DynamoDBInterfaceSchemas.spec.ts`. Neither uses `integration()`, but they fall into the
*game* group, so they are counted there and re-run under the undo job. Harmless today, but the rule "non-game iff it
does not use `integration()`" now depends on each author knowing to place new specs under exactly two
directories. The game group also still contains `server/core/DiscordDispatcher.spec.ts`, which is non-game in
nature; the class it tests lives in `server/game/core/` but is only imported by `GameServer` and `Lobby`. Together
with `GameObjectBaseInitialization` and `EventWindow`, `core/` holds three specs that do not use `integration()`.

Recommended fix, in two parts:

1. Widen the non-game globs to `server/{utils,gamenode,services,scripts}/**`, mirror the exclusions in
   `jasmine-game.json`, and move `DiscordDispatcher` itself to `server/gamenode/` together with its spec, so the test
   tree keeps mirroring the source tree (moving only the spec would break that mirror).
2. Add a guard in the style of `validate-cards` that fails the build if (a) a spec using the game `integration()`
   harness sits in a non-game directory, or (b) a game-group spec does *not* use it and is not on a short,
   explicit exemption list (today: `scenarios/undo/*`, which use their own harness, and the two engine-adjacent
   unit tests `GameObjectBaseInitialization` and `EventWindow`).
   Both parts are scheduled for the
   [next PR](#next-pr--account-auth-guards-and-suite-guardrails-planned-2026-10-15), commit 1.

The CI workflow itself is unchanged: `test` runs `test-parallel` and `test-undo` runs `test-parallel-undo`,
both against `jasmine.json`, so the non-game specs run twice. That is cheap (~6.3 s, 4.3% of specs), so
splitting the jobs is still **not urgent**. The intended split, when it becomes worthwhile:

- `test-parallel-game` and `test-parallel-nongame` as separate jobs
- `test-parallel-undo` pointed at `jasmine-game.json`, since undo mode does nothing for specs that
  never construct a `Game` — it is wasted work in the non-game group

**Path-based filtering was considered and rejected.** GitHub Actions supports it, but workflow-level
`paths` never reports its checks, which would block a repo using merge queues; and job-level gating
needs a `dorny/paths-filter` step whose filter list would have to enumerate engine paths, because
the coupling runs both ways. `DecklistFixtures` scans the live card catalogue and validates through
the real `DeckValidator`, so a card-data or legality change can break the server suite; and the Phase 1
work itself reached into `Game.ts` and `SimpleActionTimer.ts`. A hand-maintained path
list guarding that relationship would rot silently. Splitting by *what a spec needs* is stable;
splitting by *what changed* is not.

## Open findings

Behaviours found while building the suite. Statuses were re-verified against `main` on 2026-10-15. Open items
are characterised in tests but **not fixed**; resolved items are kept, not renumbered, so earlier references
still make sense.

1. **Ghost lobbies — open, unchanged.** `createLobbyUser` sets `state: null` then immediately calls
   `updateUserLastActivity`, which sets `state = 'connected'` while `socket` is still null. Since
   `lobbiesWithOpenSeat()` filters on `hasConnectedPlayer()`, a lobby created over HTTP is advertised
   as joinable before any socket exists, and stays advertised indefinitely if the owner never
   connects (cleanup needs 5 users to have left *and* 5 minutes). Covering the client's navigation
   gap looks intentional; the never-connects case does not. Characterised by `GameServerLobbyApi`.

2. **Client-supplied identity fields are trusted — partially mitigated.**
   *Closed by #3014 (the anonymous half):* an anonymous id must be a UUID, the username is derived from the id
   (`UserFactory.createAnonymousUserFromQuery`), and an anonymous connection can no longer claim a logged-in
   user's id (`evictAnonymousClaimsOnId`, `ILobbyMapping.isAuthenticated`). `PUT preferences` now also checks the
   caller owns the target id.
   *Still open (the authenticated half):* `verifyTokenAndCreateAuthenticatedUser` — the trust path, which the real FE
   uses for every request and socket after its first sync (it sends `authenticated: true`) — verifies the JWT but
   then trusts the client's `userData`, overriding only `id` from `decoded.userId`. So `username`, `preferences` and
   **`moderation`** are client-controlled, and the chat rules read `getModeration()` off that object. HTTP is
   affected too: `authMiddleware` takes the same branch when `req.body.user.authenticated` is set. **Verified
   2026-10-15 with a DB present:** `/api/get-user` on the trust path returned the client-supplied username
   (`SpoofedName`) over the stored one (`RealName`). Only the DB path (`createUserFromTokenAsync`, used once per
   session sync) derives the profile from storage. The two claim names are not an inconsistency: the FE's JWT carries
   `id` from sign-in and gains `userId` only after its first sync, so the DB path needs `id` and the trust path needs
   `userId`. The fix is therefore a contract decision (load the profile per request or connection, cache it, or trust
   the client only for non-sensitive fields), not a one-line change. Pinned, not fixed, by the next PR's
   `AccountLogin` spec.
   **New coupling:** `ChatPermissions` seeds its legacy-mute and chat-disabled fixtures through exactly this
   channel (`userDataOverrides`), so fixing the finding will break those fixtures until I-1 gives specs a
   way to seed profiles server-side. Do I-1 first.

3. **Game-mode configuration is barely validated — open, partly improved.** `format` and `cardPool` are
   enum-checked with a `400` on both `create-lobby` and `enter-queue`, and #3001's new matchmaking
   preference is validated the same way (`EnumHelpers.isEnumValue` → `400`) — that is the house style for
   Phase 3b. But `gamesToWinMode` is **still never enum-checked** on either route, and there is no cross-field
   validation (nothing enforces "open is lobby-only", "queue is premier/eternal only", or "premier cannot use
   unlimited"); `fauxSuns` is accepted although the FE has no such value. Failure modes are unchanged: a bogus
   `gamesToWinMode` on `create-lobby` yields a **500**, premier+unlimited yields a **500** from a `Contract`
   assertion, and a bogus `gamesToWinMode` on `enter-queue` returns **`200 OK`** and then fails silently at
   socket-connect time, leaving the user on a "searching" screen forever. Queue keys are still
   `JSON.stringify`-based (`JSON.parse(queueKey)` in `QueueHandler`); they are built in a fixed order in
   production, so the property-order sensitivity is latent rather than live.

4. **`this[command]` dispatch — ✅ resolved by #3014.** All three dispatch sites (lobby, game, spectator) now
   check an allowlist before invoking a method. Residual guards are tracked under Phase 3.

5. **Timers that nothing can cancel — ✅ resolved by #3001.** `GameServer` now wraps its scheduler in a
   `SchedulerTaskScope` and hands the scope to everything it creates, so the disconnect-grace timeout, the
   requeue-after-disconnect timeout and a live game's action timers are all tracked and cancelled by
   `shutdownAsync()`. **Verified empirically on 2026-10-15** (a throwaway probe, since deleted): an abrupt
   disconnect raised the pending-task count 3 → 4 and shutdown returned it to 0; a live game with action timers
   enabled also drained to 0. The permanent regression lock is still to be added (Phase 4, "Permanent regression
   locks").

6. **Three scheduled callbacks still swallow their own errors — open, unchanged** (`cleanupInvalidTokens`,
   `QueueHandler.cleanupPreviousMatchEntries`, `QueueHandler.sendHeartbeat`; re-read after #3001's heavy
   `QueueHandler` changes), so the scheduler's guard — and therefore `assertNoScheduledErrors()` — cannot see
   them. These are defensive at the method level and reachable from non-timer callers, so removing the inner
   catches is a behaviour change rather than a simplification; revisit when those paths get direct coverage.
   Related observation: the hourly cleanup only prunes `swuStatsTokenMapping`; `swuBaseTokenMapping` is never
   pruned (entries are replaced on next use, so the impact is a few small objects per linked user, but the
   existing cleanup spec cannot reveal it because it only exercises the SWUStats map).

7. **Shared-secret guard fails open — open, new (2026-10-15).** `POST /api/link-swustats` and `/api/link-swubase`
   authenticate the FE *server* with `internalApiKey === process.env.INTRASERVICE_SECRET`, and only throw when the
   secret is unset in `development`. Anywhere else an unset secret turns the check into `undefined !== undefined`, so
   a request that omits the key is accepted. **Verified:** with `ENVIRONMENT=production` and the secret unset, a
   keyless request reached the outbound SWUStats token call (a wrong key still got 403); a successful response would
   have stored the caller's SWUStats refresh token on any `userId` in the body. Deployed environments presumably set
   the secret, so this is a latent misconfiguration hazard rather than a live hole, but `run-profile` — which fails
   *closed* when `PROFILE_CAPTURE_SECRET` is unset — shows the intent. Fix: reject when the secret is unset in every
   environment. It is about three lines, but it breaks linking anywhere the secret is missing, so confirm each
   deployment first. Pinned, not fixed, by the next PR's `ServiceCredentials` spec.
   Related: a local `.env` leaks into specs here. `ServerTestEnv` pins other variables for that reason but not this
   one, so on a machine whose `.env` sets it the routes answer 403 where CI (no `.env`) answers 500.

## Future test suites

After the connection-management suite is complete, the same harness should be extended to cover the areas
below. Several now have **service-level** coverage from #3011/#3014 (real services over an in-memory DB, no
HTTP); what is missing is the **route-level** half, which is gated on I-1. Each entry says what exists and what
is left. Dependencies refer to the infrastructure backlog.

- **Moderation.** *Done:* submitting and cancelling mod actions at service level
  (`ModActionSubmissionHandler`, `UsernameModerationFlow`, schema and migration specs); mute enforcement in
  chat, for both legacy moderation and mod-action mutes (`ChatPermissions`). *Left:* the `/api/mod/*` routes and
  their role checks (the role matrix itself is the next PR's `RoleAuthorization`), moderation state reaching the
  client (`/api/get-user`), the three "seen" acknowledgement routes, and the server-settings admin routes. Needs I-1.
  (There is no ban or suspension action: `ModActionType` has none.)
- **Reports** *(new)*. *Done:* the logged-in-only rule (`LobbyReports`). *Left:* the "disable reporting"
  moderator action from #2994 (**no tests at all**); the fail-open branch taken when the mod service is
  unavailable (which is the branch the existing success spec actually runs through — see Merged since
  Phase 2.5); Discord delivery failure → `success: false`; and the `reportedBugs` counter and in-game alert
  after a successful bug report. Needs I-1 and I-2.
- **User account management.** *Done:* username-change eligibility, rate limiting, forced rename, the
  block-username-changes flow, `UsernameRules` (service level). *Left:* `change-username` and
  `get-change-username-info` routes, the profanity check on the route (`GameServer`), and
  `mustRequestUsernameChange` over HTTP. Needs I-1.
- **Linked stat-site accounts** *(new)*. SWUStats / SWUBase link and unlink: six routes, none referenced.
  Handler-level coverage exists (Phase 2.5); the routes need I-1 plus the existing `FakeHttpClient`.
- **User settings and preferences.** *Done:* `PUT preferences` ownership and anonymous rejection
  (`GameServerUserApi`); `muteChat` as it affects chat. *Left:* persistence, the other per-account game
  options (card image locale, timer visibility), and welcome / undo / timer popup acknowledgement. Needs I-1.
- **Best-of-three flow.** *Done:* only that `concedeBo3` and `proceedToNextBo3Game` are allowlisted and take
  effect. *Left:* set progression, the sideboarding window, ready timer, timeout paths, and `winHistory` as
  sent to the client. Needs I-4 for game setup.
- **Game timer behaviour.** The inactivity kick and `resetActionTimer` moved into Phase 4 ("Timers"). *Left
  here:* the byoyomi main/turn countdown, warning and danger thresholds, and `timeRemainingStatus` as sent to
  the client. Unblocked by the scheduler work in Phase 1.
- **Deck management.** Save / rename / delete / favourite routes, deck-link resolution across the supported
  sources, and validation failures surfaced to the client. Needs I-1 and I-3.
- **Cosmetics.** Entitlement checks and moderator/admin-gated management endpoints (five routes, none
  referenced). Needs I-1.
- **Spectator experience.** The basics are in Phase 5. *Left here:* mid-game join state, retransmission,
  and the spectator allowlist beyond `retransmitGameMessages`.
- **Reconnect and resilience.** Message retransmission gaps (`retransmitGameMessages`, allowlisted but
  untested), serialization failure handling, and error reporting to Discord. Needs I-2.
