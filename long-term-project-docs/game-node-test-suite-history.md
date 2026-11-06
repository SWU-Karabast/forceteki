# Game Node Test Suite — history

The working record of the game node test suite, moved out of [the plan](game-node-test-suite.md) on 2026-11-05 so that the
plan holds only what is current. It is kept for the reasoning behind each decision and the evidence behind each finding.
The sections are as they were written, including the in-place notes added when later merges changed something. Phase names
inside them refer to the plan as it stood then: the remaining Phase 3–6 items now sit under the plan's roadmap steps (the
Phase 4 items and the connection items of Phase 5 are step 2, the refactor gate). A new section is added under *Progress*
for each merge evaluated; nothing else here is edited.

**Contents.** *Progress* (Phases 0–2.5, the two pre-PR review rounds, and the evaluations of what others merged, 2026-10-15
to 2026-11-05) · *The account-auth PR* (#3021: as built, then the plan as approved) · *Moved out of the plan on 2026-11-05*
(the finished backlog write-ups and the backlog's original order, the interface-migration note, the finished Phase 6 items,
and the resolved findings).

## Progress

### Phase 0 — headless server and HTTP coverage ✅

Landed in #2934 (`63853b15b`), with CI follow-ups in #2961 (`9a8730d12`). Branch commit: `Initial tests and basic testability changes`

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

Landed in #2934 (`63853b15b`). Branch commit: `Add timer injection`

**1a — scheduler.** `IScheduler` / `IScheduledTask` / `ISchedulerErrorContext` with `RealScheduler`
as the production default, threaded through `GameServer`, `Lobby`, `QueueHandler`,
`MatchmakingRules` and the engine timer types. Every timer and clock read in the game node now goes
through it. *(Re-audited 2026-10-15: still true of `server/gamenode/**`, apart from two diagnostic
profiling-dump timeouts in `GameServer`. It was not true of the wider server — `TimedCache` and
the four services built on it, `ModActionService`, both deck fetchers' abort timeouts and
`DynamoDBService`'s retry delay all used raw timers. Since #3021 `TimedCache` and the services built on it, including
`ModActionService`, take the scheduler; the deck fetchers and `DynamoDBService`'s retry delay still use raw timers.
See infrastructure backlog item I-1/I-3.)*

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

Landed in #2950 (`b90d3958b`). Branch commit: `Add fake transport and TestClient for socket connection testing`

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
suite's `integration()` ergonomics, handing the harness to the spec body via a `contextRef`. *(Since #3111 a
JWT-authenticated client is a seeded account in the fake DB, and its token resolves through `resolveUserFromTokenAsync`;
`verifyTokenAndCreateAuthenticatedUser` is gone.)*

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

Landed in #2950 (`b90d3958b`).

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
  spec runs without a `ModActionService` (the harness has none), so it never evaluates the restriction at all.
  Blocked on I-1 and I-2.
- **Username moderation.** Thorough at service level over an in-memory DB, but nothing drives the HTTP
  routes: `UsernameModerationFlow.spec.ts` re-implements `/api/get-user`'s notice-state derivation inside
  the spec because it cannot call the route. Two of these specs (`server/scripts/`, `server/services/`)
  also fell outside the non-game glob (see CI structure; fixed in the account-auth PR).
- **Identity hardening.** Covered well for lobbies and queues. The spectator registration path
  (`UserRole.Spectator` via `/api/spectate-game`) is not covered yet.
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
`pendingTaskCount` assertion and belong in `GameServerScheduling.spec.ts` as a permanent lock. *(The absolute counts have
moved since: #3111 added an hourly server interval, and the harness has a database by default. The lock counts from a
baseline; see Phase 4.)*

**Stability.** The non-game suite was run 7 times under CI's `--parallel=4 --random=true` (2,828 spec
executions): 0 failures, 6.2–6.9 s each.

### Merged since the account-auth PR — evaluation of 2026-11-01

Three merges after #3021 touched this area. Everything below was verified against `main` @ `445792e61`: the diffs were read, the
non-game suite was run on a clean build, the route and spec counts were re-measured, and the open findings' code paths were
re-read (the pending spec for #8 was enabled once and still fails for the stated reason).

| PR | What changed | Effect on the suite |
|---|---|---|
| #2655 *authenticated test users with and without local DynamoDB* | Local dev test users (`Order66`, `ThisIsTheWay`) are now accounts (provider `dev-user`) signed in with ordinary NextAuth sessions and seeded at start-up; the legacy fixed anonymous ids `exe66` / `th3w4y` and `isDevTestUser` are gone. `UserFactory` reads and writes accounts through a new `IUserStore` (`getUserStoreAsync()`): DynamoDB when a service exists, otherwise a process-wide `InMemoryUserStore` (development only). `PUT /api/user/:userId/preferences` is now `PUT /api/user/preferences` and acts on the authenticated caller. `POST /api/start-test-game` needs a signed-in dev test account, honours the maintenance switch and discards the lobby if its set-up fails. A missing role cache answers 403 "Server role service unavailable", and a missing mod-action service now throws unless the server is development without local DynamoDB. | +21 non-game specs: the new `DevelopmentUsers` suites (13), `GameServerTestGameSetups` 2 → 8, `GameServerUserApi` 5 → 6, and one manifest spec (`start-test-game` is now a signed-in route). `TestClient.savePreferencesAsync(preferences)` lost its id parameter, and the manifest, `CredentialVerification`, `AnonymousIdentity` and `ServerTestHarness` specs were updated to match. Adds hidden shared state, below. |
| #3031 *matchmaking preference logging* | `QueueHandler` logs the preference at queue join and when a match forms (new `LoggingConstants`); `findMatchInQueue` receives the format. No change to scheduling or matching. | None. Open finding #6's callbacks are unchanged. |
| #3038 *pin Node* | Node 26.12.1 is the single pinned version: `.tool-versions` (read by CI's `setup-node`), `engines` with `engine-strict` in `.npmrc`, `@types/node` ^26 and the `Dockerfile`. `GameServer.ts` imports `ELDHistogram` instead of the removed `IntervalHistogram`. | None functionally. The non-game suite runs in about 2.3 s in parallel on 26.13 (about 3.2 s on 22). |

(#3030, also merged, is LKI design documents in this folder; nothing else merged since touches the suite.)

**What this changes for the plan.**

- **Hidden shared state.** `getUserStoreAsync()` keeps the development store in a module-level variable that nothing resets, so
  every harness built without `database` in one worker shares one account store: accounts and preference changes made by one
  spec are visible to later ones. The current specs tolerate it (`Development preferences without DynamoDB` flips a preference
  relative to its starting value), but a spec that needs a clean slate does not have one. Established by reading the code, not
  by a failing spec. Tracked as I-12.
- **The default-flip follow-up is cheaper** than it was sized; see the re-run under *Trial run* in the account-auth section.
- **Statements about the 2026-10-15 state** are annotated where they appear: the HTTP-surface table and *What the harness can
  reach today* (the DB path now runs without a database too), *Authorisation facts* (no route compares a path `:userId` with
  the caller any more), the dev test-user ids in `CredentialVerification`, and the maintenance-mode items in Phase 5.

### Account resolution and the profile cache — evaluation of 2026-11-05

Two merges after 2026-11-01 touched this area. Verified against `main` @ `d392aa6ac`: both diffs and the FE half of #3111
(forceteki-client #875) were read; this branch was rebased onto it (the only conflict was open finding #8, which #3111 marked
fixed while this branch was rewriting it); the non-game suite was run on a clean build; and the counts were re-measured.

| Merge | What changed | Effect on the suite |
|---|---|---|
| #3110 *validate action window menu commands against offered buttons* | The game accepts an action-window menu command only while a matching button is offered. Engine only. | None today. Phase 3a's positive coverage per command needs a game state in which each command is offered. |
| #3111 *user improvements* | **One way to be signed in.** A session token now only resolves an existing account: `resolveUserFromTokenAsync` takes the identity from the signed `provider` and `providerId` claims, follows the OAuth link and reads the server's own profile. It never creates anything, and an unknown identity answers 401 with `code: 'ACCOUNT_NOT_FOUND'`. The synced path, where a client presented its own copy of its profile (`verifyTokenAndCreateAuthenticatedUser`), is gone. **Account creation** is the new `POST /api/create-user` (no middleware; reads the session cookie; idempotent). The FE (#875) signs in with `get-user` → 401 `ACCOUNT_NOT_FOUND` → `create-user` → `get-user`; its JWT no longer carries `userId`, and its socket handshake sends no `user` once it has a token. `get-user` records the login. **A profile cache**, `UserProfileCache`: an in-process LRU of 3,000 profiles and 6,000 identity links; a profile is kept for 4 h from when it was loaded, a link until it is evicted; concurrent loads are shared; every profile writer in `UserFactory` discards the cached copy. A new hourly server interval logs its stats. **Creation hardening:** concurrent creations for one identity share one attempt in-process; `name` and `email` are required before anything is written; the OAuth link is written last; a missing profile is recreated under its linked id (#8 and #9 fixed). **The link routes** `link-swustats` and `link-swubase` now also sit behind `authMiddleware` and need the session the FE server forwards along with `INTRASERVICE_SECRET`; `link-swubase` also checks the body's `expectedUserId` against that session (403). `authMiddleware` uses the server's one `UserFactory` (`getUserFactory()`) instead of one per route. | +89 non-game specs (677 → 766): the new `AccountResolution` and `UserFactoryProfileCache` suites and additions across the auth specs; the pending `AccountLogin` spec is enabled. `TestClient` lost its `synced-profile` / `token-only` modes and `userDataOverrides`: an authenticated client is always a seeded account, with a new `profile` option. `AuthTokens.syncedClaims` is gone. Six spec files had to opt in to `database: true` (`AnonymousIdentity`, `ChatPermissions`, `SocketIoDriftGuard`, `LobbyReports`, `SocketCommandAllowlist`, `GameServerMatchmaking`). The manifest has a new access class, `session-token`, for `create-user`: 51 routes, 47 in production. |

**What this changes for the plan.**

- **The auth description in the account-auth section is now history.** The three-path table, *What the harness can reach
  today*, the HTTP-surface table and the Phase 2 `TestClient` description describe the synced path; each is annotated in
  place. The Handoff, the decisions and the hazards are current.
- **Open findings #8 and #9 are fixed** (covered in `AccountLogin` and `CredentialVerification`). #9's product question,
  whether an account with no email should be accepted, stays open.
- **First-login races are partly covered.** `CredentialVerification` covers concurrent requests within one process and a
  lost cross-process race (by stubbing the conditional OAuth-link write). The second showed a new finding, #10.
- **Account time was on the wall clock**, against design goal 6. The cache lifetime and the legacy-moderation expiry read
  `Date.now()`, the harness passed the server no `UserFactory`, and the new unit specs controlled time with
  `spyOn(Date, 'now')`, a third mechanism beside the virtual clock and Jasmine's mock clock.
- **The database default could no longer wait for housekeeping:** a logged-in client throws without one, and six spec files
  had to opt in one at a time.
- **Absolute pending-task counts moved** (the new hourly interval, and the database services' refresh timers once the default
  flips), so the shutdown locks count from a baseline.
- **Not modelled:** the FE still puts `{ id, username }` in request bodies for a signed-in user, which `TestClient` does
  not. The server takes a token-bearing caller's identity from the token alone, so this affects fidelity only.

**Follow-up applied with this evaluation.**

- **The harness has a database by default.** `{ database: false }` opts out, and the three describes whose subject is the
  no-database server say so; the redundant `database: true` options were removed from the specs.
- **Account time is on the virtual clock.** `UserFactory` takes an optional clock (`now`, default `Date.now()`) for every
  time it reads or stamps, including the username-change cooldown it evaluates. `TestGameServer` passes
  `new UserFactory(new UserProfileCache({ now }), now)` through `GameServer`'s existing constructor parameter; the fake
  dates seeded accounts from its clock.
  Behaviour-neutral: the default is the expression it replaces. A new `AccountResolution` spec (a change written outside
  the server appears once the cached profile expires) fails if the harness stops passing the clocked factory, and
  replacing the default clock with a constant fails 4 unit specs.
- **`harness.databaseTaskCount`** is the database services' share of the clock's tasks. `GameServerMatchmaking`'s
  mid-shutdown assertion counts from it instead of 0.
- ***makes a single account when asked more than once at the same time* did not test the de-duplication.** Each request
  finished creating the account before the next reached the server, and with `accountCreations` removed the suite still
  passed. The spec now holds the first creation after its profile write until all three requests have reached the factory,
  and expects one profile write; removing the de-duplication fails it.
- **Socket identity is read from the wire.** `CredentialVerification` and `AccountResolution` read `lobbystate` (the client
  joins an open lobby by its link, so the lobby lists the identity its socket resolved to) instead of the server-side
  `socket.data.user`.
- **Finding #10** is recorded, with a `TODO` in the race spec.
- **Legacy moderation specs removed.** Legacy profile moderation (the `moderation` field on a profile, as opposed to mod
  actions) has been cleared from the database, so its specs went: the legacy-mute chat spec in `ChatPermissions`, the
  *legacy moderation* describe and the seen-notice case in `UserFactoryProfileCache`, and the moderation step in
  `DevelopmentUsers`. The production code that still reads the field (`processModerationAsync`, the expiry check in
  `resolveUserFromIdentityAsync`, `setModerationSeenAsync`) is now untested; removing it is a production change for its own
  PR. `set-moderation-seen` keeps its row in the route manifest while the route exists.


### Step 1 — scenario builders (2026-11-06)

Roadmap step 1 (backlog I-4's remainder and I-6), built on `main` @ `c6c71e058`. Test-only: no production file changed.

**Built.**

- `harness.openLobbyAsync(owner?, { isPrivate?, config?, deck?, connect? })`: a custom lobby from `create-lobby`, with the
  owner's socket connected unless `connect: false`. That leaves only the server's record of the HTTP call, the state the
  seat-takeover specs in `AnonymousIdentity` start from.
- `harness.createLobbyWithGuestAsync(owner?, guest?, options?)`, returning `{ owner, guest, lobbyId }`. The guest joins a
  public lobby through `join-lobby` and then its socket, and a private one by its link, as the real client does. Two
  departures from the plan's shape: the sides are positional, like `startQuickGameAsync`'s, each a client or the options to
  make one; and a public lobby is joined by id rather than found by browsing, because after the list the lobby browser makes
  the same `join-lobby` call, and `LobbyConnectionManagement` covers the browsing.
- `harness.startLiveGameAsync(owner?, guest?, { ...lobby options, guestDeck? })`: the guest picks its deck with
  `change-deck`, both players set ready, and the owner starts the game. A guest has no deck until then: `join-lobby` carries
  none, and `change-deck` needs the guest seated. Before this, no spec had started a custom-lobby game.
- The game-ending helper is `TestClient.concedeAsync()` rather than a harness method: conceding is one command, and the
  opponent is then the winner in `gamestate.winners`.
- Typed commands: one `TestClient` method per entry in `Lobby`'s lobby and game allowlists, plus `resetActionTimerAsync` and
  `clickPromptButtonAsync` (a button taken from the game state). Each sends the arguments the real client sends, read from
  forceteki-client `origin/main` @ `385539b`: for example, `concede` carries the player's name, which the server ignores,
  and `reportScreenResolution` a `{ width, height }` object. Names follow the command (`setReadyStatusAsync` rather than the
  plan's `setReadyAsync`), except where the command name alone is unclear: `sendGameChatAsync` (`chat`), `clickCardAsync`
  (`cardClicked`), and `submitBugReportAsync` / `submitPlayerReportAsync` (`submitReport`). `updateSettingAsync` takes the
  setting name as a string, since `Lobby`'s `LobbySettingKeys` is not exported. The raw `sendLobbyMessageAsync` and
  `sendGameMessageAsync` stay, for payloads no real client sends.
- Chat accessors: `lobbyChat` (the chat in the latest `lobbystate`) and `gameChat` (the `newMessages` of every `gamestate` on
  the current socket), as `IChatEntry { senderId?, alertType?, text }` entries (`ChatEntries.ts`), plus `lobbyChatFrom(sender)`
  and `gameChatFrom(sender)`. A player or card that a line names is shown by name.
- 8 wiring specs in `ServerTestHarness.spec.ts` (*scenario builders*, *reading the chat*): 763 → 771 non-game specs.

**Migrated.** `ChatPermissions` (its `setUpLobbyAsync` and three `JSON.stringify` search helpers), `SocketCommandAllowlist`
(two hand-built lobbies and two searches), `AnonymousIdentity` (its `create-lobby` helper, now
`openLobbyAsync(owner, { connect: false })`), `CredentialVerification` (`openLobbyToJoinAsync`) and `AccountResolution` (two
inline lobbies); and every well-formed raw command send in `ChatPermissions`, `SocketCommandAllowlist`, `LobbyReports` and
`GameServerMatchmaking`. `LobbyReports`' player report now carries a real report type (`chatHarrasment`) instead of
`'Harassment'`, which no client sends; its subject, the refusal for an anonymous opponent, is decided before the type is
read. Several "contains" checks became exact (`lobbyChatFrom(owner)` equals `['hello there']`, or `[]` for a dropped
message), and the malformed-typing-state check now asserts that no typing state was recorded, rather than that the
payload's text is absent.

**Left as they are, deliberately.** The explicit create-and-join calls in `LobbyConnectionManagement` and
`RoleAuthorization`, where the calls are the subject; the two in `ServerTestHarness.spec.ts` and the one in
`SocketIoDriftGuard`, which prove the tooling and the real transport; `GameServerMatchmaking`'s `enterQueueAsync` and
`queueClientAsync`, which are about matchmaking preferences and formats; `CredentialVerification`'s `joinersSeenBy`; and the
raw sends whose payload is the point (`cleanLobby`, `changeStat`, a non-boolean typing state, a non-string chat message, a
message on a disconnected socket).

**Verified.** The non-game group passes serially and in three parallel random runs, lint and `validate-specs` pass, and no
production file changed. The rewritten assertions were seen to fail when the behaviour they guard was broken: adding
`cleanLobby` and `changeStat` to the allowlists fails both allowlist specs, and letting every user chat (`checkUserCanChat`
returning true) fails all nine "drops" specs in `ChatPermissions`.

### Step 2 — refactor-gate scenarios (2026-11-06)

Roadmap step 2: the gaps the *Refactor readiness* checklist listed after step 1. Test-only: no production file changed.
40 specs, 771 → 811 non-game.

**New spec files**, each in its area folder:

| File | Covers |
|---|---|
| `lobby/SocketConnectionRouting` (10) | where `onConnectionAsync` sends a socket and what one it cannot place is told: a non-JSON user query; a spectator connecting as a player; a joiner whose lobby has closed; the `join-lobby` race; a seat that fails to set up; a link to a lobby that is gone, full or in game; a mapped user carrying another lobby's link; an anonymous link to a public best-of-three lobby |
| `lobby/SpectatorConnections` (6) | the spectator branches: admission and a second tab, an anonymous or unregistered socket, a spectator whose game has gone, a lobby that stops allowing spectators |
| `lobby/LobbyLifecycle` (11) | ownership and its hand-over; closing when the last player leaves or stays away; the `Lobby timed out` path and its five-minute boundary; a player making for another lobby or the queue (refused within 60 s, let go after it, never connected, taken out of the queue) |
| `lobby/InGameConnections` (4) | a reconnect inside the grace window; a drop mid-game and back; grace expiry ending the game with `PlayerLeft`; an in-game second tab |
| `matchmaking/QuickLobbyCountdown` (6) | the countdown's sequence; waiting for a player who dropped as it ended; the 20 s penalty at its boundary, over HTTP and by a link; the opponent's requeue; a requeue refused in maintenance mode |

Also: two shutdown checks in `GameServerScheduling` (a pending grace timer, and a live game's action timers, each
counted from a baseline), and the `join-lobby` call site of the best-of-three gate in `GameServerAnonymousRestrictions`.

**What the specs found.**

- *The fake socket shared the server's objects.* `FakeIoSocket` recorded each emit's arguments by reference, so a
  payload a spec had already received could change afterwards: the game state's `winners` is the server's own array,
  and a spec that kept an earlier `gamestate` saw it fill in. A real socket serializes what it sends, so the fake now
  records a JSON copy, as socket.io's encoder would (an `undefined` argument arrives as `null`). No existing spec
  depended on the shared references.
- *A lobby link does not reach `canUserJoinNewLobby` for a user the server has down for a lobby.* `onConnectionAsync`
  takes such a user back to their own lobby before it reads the link, so the planned "link while still playing elsewhere"
  case is the mapped-user branch instead (now a spec), and the only user a link can refuse is one with no lobby, such as
  a player under the matchmaking penalty.
- *The inactivity kick is gone, and `resetActionTimer` does nothing to the action timer* (open finding #11). The plan's
  timer items described behaviour from before the byoyomi timer (#2056). Checklist row L4 is waived for the refactor,
  and a `TODO` in `InGameConnections` marks the specs to add.
- *Two items the checklist expected cannot be reached through the API* and are waived with the reason in the checklist:
  the ownership fallback in `addLobbyUserAsync`, and `requeueUser`'s refusal for a player without a deck.
- *Some behaviour is held.* Parts of rows C1, C11 and L2 wait on production changes being decided with the maintainers;
  no spec asserts the current behaviour there.
- *Also noticed:* a player under the matchmaking penalty is refused with 403 `User is already in a lobby`, which says why
  only for the stale-lobby case. The specs assert the status, not the message.

**Verified.** The non-game group passes serially and in three parallel random runs, and lint and `validate-specs`
pass. The specs that passed on their first run were checked against deliberately broken behaviour: a spectator
registration kept after spectators are switched off, a 19-second penalty, a 59-second stale-lobby window, a six-departure
time-out, a player leaving without ending the game, the `Lobby does not exist` branch keeping the user's lobby entry, and
the `join-lobby` race check removed. Each failed the spec written for it.

**The plan this step followed**, as written on 2026-11-05:

Everything already covered has been removed from this list (see the table in *Merged since Phase 2.5* above). The checklist rows each group closes are given with it.

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

These close C11, C13 (in game), C15–C17, D1, D3, D4, D6, B2–B4, L1 and L3. The mid-game halves start from
`harness.startLiveGameAsync`.

**Quick-lobby countdown as the subject** — no new infrastructure:

- the countdown text sequence (`Starts in 5` … `Starts in 0`, then `Waiting for opponent to connect...`);
- the game starts only when both players are `connected`;
- neither connects within the window → `removeLobby` and requeue (`remainingSeconds ≤ -4`).

(A player dropping *mid-countdown* → `matchmakingFailed` is already covered.)

This closes L2.

**Timers** — no new infrastructure; set `actionTimersEnabled: true` and use the public `ByoyomiTimer.*`
constants rather than literals:

- Inactivity kick → `inactiveDisconnect` + `forceDisconnect`, then `handleIntentionalDisconnect`; no re-entry.
- `resetActionTimer` actually extends the timer (the FE sends it when opening the bug-report dialog), and
  every lobby/game message refreshes it via `updateUserLastActivity`.

These close L4.

**The connection path.** Moved here from the Tier 2 list, because they all sit inside `onConnectionAsync`:

- **Socket handshake failures** beyond an invalid JWT: missing or non-JSON `query.lobby` (`JSON.parse` /
  `Helpers.getSingleOrThrow` in `onConnectionAsync`) and non-JSON `query.user` (C1).
- **Multi-tab beyond lobbies.** A second connection for a spectator, a queued player and an in-game player (the
  lobby case is covered through `TestClient.previousSocket`) (C8, C13, C19).
- **The spectator branches:** the anonymous-spectator gate on the *socket* path (the HTTP gate is covered), a spectator
  who is not registered, one whose lobby is gone or has no game, `allowSpectators: false`, and admission (C4–C8). Start from
  `harness.startLiveGameAsync`.
- **The remaining edges:** a mapped user whose role is not Player or whose lobby is gone (C9, C10), `addLobbyUserAsync`
  failing (C12), a queued user who makes a lobby or queue call and is taken out of the queue (B5), and `requeueUser`'s two
  refusals (B6).

**Permanent regression locks** (cheap — each is a single `pendingTaskCount` assertion in
`GameServerScheduling.spec.ts`): abrupt disconnect → shutdown with the grace timer still pending; live
game with action timers → shutdown. Count from a baseline taken before the disconnect or the game, as
`GameServerMatchmaking` does, not from fixed numbers: the server's own background tasks (#3111 added one) and the
database services' refresh timers share the clock, and `harness.databaseTaskCount` is the latter's share.

This closes L5.

## The account-auth PR

### Account-auth guards and suite guardrails (merged in #3021, 2026-10-17)

*Merged as #3021 (`8ffb6130f0b126e681bfa40b08ff271ecb93c462`, 2026-10-17): one squash commit, built in six ordered stages.
**As built**, immediately below, records what the implementation found and where it differs from the plan. Everything after it
is the plan as it was approved (without the parts that were dropped), still in the future tense it was written in and kept for
the reasoning behind each decision. Where `main` has moved on since, the text is annotated in place; see
[Merged since the account-auth PR](#merged-since-the-account-auth-pr--evaluation-of-2026-11-01).*

**As built.** The work was done and verified in this order, each stage green before the next began. It merged as one
commit, so the stage boundaries below record how it was built, not the git history.

| # | Stage | Non-game specs after | What it contains |
|---|---|---:|---|
| 1 | Partition repair and guard | 432 | Globs widened to `server/{utils,gamenode,services,scripts}/**`; `DiscordDispatcher` and its spec moved to `server/gamenode/` and `test/server/gamenode/`; undo jobs point at `jasmine-game.json`; `scripts/validateSpecs.ts` (`npm run validate-specs`, an extra step in the `validate-cards` job) with four checks — the partition (no gap, overlap or extra file), a game-harness spec in a non-game directory, a non-game spec in the game group that is not exempt, and an exemption that no longer applies — each verified to fail when deliberately broken |
| 2 | Helper hygiene, fast loop | 432 | `buildTestConfig` exported; dead acknowledgement API deleted; `IMatchConfiguration` replaced by `MatchConfigs.ts`; `TestClient.lobbyId`, `harness.startQuickGameAsync` (waits `Lobby.QuickLobbyCountdownMs`, newly named in production); `GameServerAnonymousRestrictions` on `serverIntegration`; `npm run test-nongame` |
| 3 | DB seam | 455 | Production: `export class DynamoDBService`; optional `IScheduler` and `stop()` on `TimedCache` and the services built on it (`ServerRoleUsersCache`, `ServerSettingsCache`, `CosmeticsCache`/`CosmeticsService`, `ModActionService`, whose four `new Date()` reads now go through the scheduler). `FakeDynamoDbService` (about 30 methods, `implements Pick<DynamoDBService, …>`) with a 23-spec fidelity suite; `UsernameModerationFlow` now uses it instead of its inline copy |
| 4 | Harness wiring | 469 | `ServerTestHarness.createAsync({ config, database, env, recordRoutes })` and `serverIntegration(defs, options)`; `harness.db`, `harness.routes`, `harness.requestAsync`; `AuthTokens` and `TestClient`'s `token-only` mode; the route recorder; `INTRASERVICE_SECRET` and `PROFILE_CAPTURE_SECRET` pinned in `ServerTestEnv`; 14 wiring specs |
| 5 | Auth guard specs | 648 | `test/server/gamenode/auth/` (since split into `authentication/` and `authorization/`, see *Spec layout* below): `RouteAuthManifest` (95), `CredentialVerification` (30), `AccountLogin` (12), `RoleAuthorization` (27), `ServiceCredentials` (15); plus `harness.createAccountClient`, `RoleHolders`, and headers on `requestAsync` |
| 6 | Retire workarounds, enforce, document | 649 | `lobbies` `protected` with `testLobbies` / `lobbyCount` / `testLobbyFor`; `ChatPermissions` and `GameServerUserApi` migrated onto the fake DB; the `as any` ESLint rule; "Writing a server spec" in `CLAUDE.md`; the last duplicated `DynamoDBService` type alias; this document |

**Production footprint, as built.** Exactly what the table under *Production footprint* below lists: the class
`export`, the optional scheduler on the DB-backed caches (defaults reproduce today's behaviour; `GameServer.createAsync`
passes nothing), `lobbies` `private` → `protected`, the `DiscordDispatcher` move with its two import paths, the
quick-lobby countdown's start value and tick named as constants in `Lobby` (values unchanged), the role and settings
cache refresh interval named `GameServer.ServerCacheRefreshMinutes` (still 60), and `buildModerationFromCacheEntry`
reading the clock through the scheduler (`RealScheduler.currentDate()` is `new Date()`). No route, no auth logic and
neither secret check changed.

**Spec layout, applied last as a pure move.** `test/server/gamenode/` had grown to 16 specs in one flat folder next to
`auth/`. Every spec now sits in an area folder, grouped by what it is about rather than by the production file it covers
(the test tree does not have to mirror the source tree inside `gamenode/`):

| Folder | What belongs there | Specs |
|---|---|---|
| `auth/authentication/` | who the caller is: tokens and cookies, sign-in and account creation, anonymous identity, service secrets | `AccountLogin`, `AnonymousIdentity`, `CredentialVerification`, `ServiceCredentials` |
| `auth/authorization/` | what a known caller may do: the route manifest, roles, anonymous-versus-logged-in limits, chat permissions | `RouteAuthManifest` (and its `.ts`), `RoleAuthorization`, `GameServerAnonymousRestrictions`, `ChatPermissions` |
| `lobby/` | creating and joining lobbies, connection management, reports, the socket command allowlist, test game setups | `GameServerLobbyApi`, `LobbyConnectionManagement`, `LobbyReports`, `SocketCommandAllowlist`, `GameServerTestGameSetups`, `DiscordDispatcher` |
| `matchmaking/` | queues and matchmaking | `GameServerMatchmaking`, `QueueHandler` |
| `account/` | a logged-in user's own data routes; the seed for the deck, settings, cosmetics and linked-account suites listed under *Future test suites* | `GameServerUserApi` |
| `harness/` | specs of the test tooling, not of the server | `ServerTestHarness`, `RouteRecorder`, `FakeDynamoDbService`, `SocketIoDriftGuard`, `GameServerScheduling` |

Only relative import paths changed, plus the `__dirname`-relative path to `test/gameSetups` in
`GameServerTestGameSetups`; no assertion, spec name or spec count did (649 before and after the move). `CLAUDE.md` carries the
same list for contributors, and the globs, the ESLint scope and `validate-specs` already matched subfolders, so none of
them needed a change. File names were left alone so history follows the moves.

**What the specs found that the plan did not expect.** Two new open findings (#8 and #9 below), neither fixed and each
marked with a `TODO` where its spec belongs (both since fixed by #3111):

- The plan said an identity linked to an account *whose profile is missing* "recreates it". It does not: the recreation
  branch re-saves the OAuth link with a conditional put, which fails because the link already exists, so the owner
  gets a 401 on every attempt (#8).
- A first sign-in whose token has no `email` claim is refused *after* the profile, OAuth link and username link have
  been written; the next attempt then succeeds (#9). The plan's "nothing partial is written" holds for a missing `id`
  or `name`, not for `email`.

**Where the implementation differs from the plan.**

- The route manifest asserts an exact refusal code only where the FE reads it: `loadDecks` treats a 403 from `get-decks`
  as "not signed in", and `deleteDecks` and the three link-status routes treat a 401 that way. Every other refusal is
  checked only as a 401 or 403 that does not say `success: true`, because the routes disagree and a spec requiring
  today's choice everywhere would stand in the way of making them agree. An empty body to `create-lobby` is likewise
  checked only as "not turned away" (`start-test-game` was too, until #2655 made it a signed-in route that is refused
  without a session).
- `PROFILE_CAPTURE_SECRET` is parsed once, at import, so only its *set* branch is testable; the branch for an unset key
  is not covered (the plan allowed for this). `INTRASERVICE_SECRET` is read per request, so a spec can set or unset it
  for one harness.
- The mod-action mute in `ChatPermissions` is applied with the real `ModActionService.onActionSubmitted` to a seeded
  account, after the lobby is up, rather than by seeding a mod action: the real service refuses to mute a player who has
  no account, which the old stub never noticed.
- `TestClient.savePreferencesAsync` now sends what the FE sends (`{ preferences }` and the session cookie) for a
  `token-only` client; it used to add a user payload, which only existed to dodge the missing database. (Since #2655 it
  no longer takes a user id.)
- The harness imports the quick-lobby countdown from production instead of keeping a test-side copy, which the plan
  (I-7) had asked for. The maintainers judged it pacing rather than policy, so not worth gating changes on. In
  `Lobby.quickLobbyCountdownAsync` the literals `5` and `1000` became two private constants, and `QuickLobbyCountdownMs`
  (6 s) is derived from them and exported. Setting the start value to 2 s and to 8 s temporarily left every non-game
  spec green.
- Added beyond the plan: `harness.createAccountClient()` and `RoleHolders` (a seeder that grants each role to one
  account), which cut the boilerplate of every role spec; the cosmetics type split (a moderator may manage card backs,
  only an admin the rest) and the role-refresh window in `RoleAuthorization`; and the converse check in the
  manifest (a signed-in caller must not be turned away as unauthenticated by any `signed-in` route).

**Verified, not assumed.** Beyond the suite passing: the credential specs were run against a deliberately broken server
(JWTs decoded without verifying the signature: 12 specs fail, on both transports and both paths); the role specs against a
developer wrongly passing the moderator check (2 fail); the manifest against a route that stops refusing anonymous callers
and against a changed code on a route the FE reads (both caught), and against a changed code on a route it does not read
(correctly not caught); the pending spec was enabled once to confirm it fails for the stated reason; and the new ESLint
rule was shown to reject a deliberate `as any` and to pass the tree. Final gates: `npx eslint --quiet` on the whole repo, `validate-cards`,
`validate-specs`, `tsc` for both projects, and five parallel random runs, all clean.

**After an independent review of the branch.** A read-only review found no blockers and confirmed the production diff
is behaviour-neutral (the `TimedCache` refresh cannot reject, `RealScheduler` is still a raw `setInterval`, the
`DiscordDispatcher` move differs by eight import lines, and the `Lobby` constants and their initialisation order are
right). Its findings were addressed, with 8 specs added (657 in total), and each guard was then seen to fail when
deliberately broken:

- The route recorder only sees `app.get`/`post`/`put`/`delete`/`patch`, so a route added with `app.all`, `app.route()`,
  `app.head`/`options`, or inside a mounted `express.Router` or sub-app would have passed the "every route is
  classified" guard unseen. `harness.routes` now throws when the apps' routers hold more route layers than were
  recorded, or any mounted router or sub-app (`IRouteRecording.assertComplete`), and `RouteRecorder.spec.ts` covers
  each form. Moving one real route to `app.all` failed every spec that reads `harness.routes`.
- The role-gated "let in" check also rejects a 401, so it can no longer pass on an authentication failure; with token
  signing deliberately broken, all 8 of those specs fail.
- The role-refresh interval is production's own constant, `GameServer.ServerCacheRefreshMinutes`, instead of a copy in
  `TestDatabase`, so `RoleAuthorization` follows a change to it (set to 30 minutes, it still passes).
- `GameServer.buildModerationFromCacheEntry` read the wall clock while the harness's mod-action clock is virtual (it
  starts in 2025), so a muted user's `get-user` reported `daysRemaining: 0`. It now reads the scheduler's clock, and a
  `GameServerUserApi` spec holds it (reverting the line fails it with `Expected 0 to be 3`).

**Trial run: flipping the harness default to "database on".** Run on the tree after stage 4: 469 specs, 4 failures.
Three are `ServerTestHarness` specs whose subject is the no-database state. The fourth is `GameServerMatchmaking`'s
*waits for active matchmaking before cleanup and prevents timers from surviving shutdown*, which asserts the whole
clock's `pendingTaskCount` is 0 while shutdown is still waiting; with a database the four DB-backed services' refresh
timers are on that clock until shutdown completes, so it reads 4. The other 465 pass with a database. The flip is
therefore a small follow-up: make that one assertion relative to the harness's baseline, give the three harness specs an
explicit no-database option, then make the database the default and the no-database server the opt-in (it is the
local-dev configuration, not production's). **Done on 2026-11-05**, as sized here; see the evaluation of that date.

**Re-run on 2026-11-01** (`main` @ `445792e61`, 678 specs at the time): 3 failures, down from 4 of 469. Two are again the
`ServerTestHarness` specs whose subject is the no-database state, and one is the same `GameServerMatchmaking`
`pendingTaskCount` assertion. Everything #2655 added still passes with a database, but the specs that exist to exercise
development *without* DynamoDB (`Development preferences without DynamoDB`, and the default-harness describe in
`GameServerTestGameSetups`) would then run against the fake DB and stop covering the in-memory path, so they need an
explicit `database: false` when the default flips. The flip also removes most of the shared in-memory account store's reach
(I-12).

**Pending spec (1):** `AccountLogin` — signing an owner in to a freshly created profile when its account has no profile
(#8). It is the one to enable when that is fixed. Re-verified on 2026-11-01: enabled, it still fails with a 401 and no
profile created. *(Enabled by #3111, which fixed #8. No pending specs remain.)*

**Carried forward, not covered here.** Decks (the fake has no deck tables, so the deck routes' signed-in path answers
500 "not implemented", which the manifest tolerates by design); the `/api/mod/*` flows beyond their role gates and the
moderation state `get-user` derives (beyond the time left on a mod-action mute); the three `set-*-seen` routes; cross-user requests to the `/api/user/:userId/…`
routes; first-login *races* (two simultaneous first requests for one identity — the fake
resolves in microtasks, so a spec cannot interleave them; it needs injectable latency; *since #3111 covered in-process, by
holding a fake write, and for a lost cross-process race, by stubbing the conditional link write*); `requeueUser` and
`spectate-game` under maintenance mode (`start-test-game`'s gate has been covered since #2655).

Two priorities set the scope: (1) everything needed to write tests that guard **authentication and authorisation
for logged-in accounts**, which requires DynamoDB to be mocked; and (2) cleanup, so that the workarounds the last
three PRs had to invent (inline DB fakes, `as any` into private state, fixtures that seed account state through the client,
a game/non-game partition that drifts) are not built on further. Decisions taken: **one PR built in ordered stages**
(each stage built and passed the non-game suite before the next began; it merged as one commit); a
**vertical slice** of the auth suite rather than the full matrix; and the scheduler seam for the DB-backed caches is
**included**. This section supersedes the Phase 6 partition and fast-loop items, and the backlog's "Suggested order", for
the items it schedules.

**What the investigation established.** Read from the code and the FE, then confirmed with throwaway probe specs
against the real server (since deleted).

*How logged-in accounts authenticate.* The credential is a NextAuth JWT (HS256, signed with `NEXTAUTH_SECRET`): the
`next-auth.session-token` cookie (or `__Secure-next-auth.session-token`) on the API, `handshake.auth.token` on the
socket. Both entry points — `authMiddleware` and `GameServer.authenticateSocketAsync` — choose one of three paths:

| Path | Chosen when | What the server does | JWT claims it needs |
|---|---|---|---|
| Anonymous | no token | `createAnonymousUserFromQuery`: UUID id, derived name | — |
| Synced | token **and** `user.authenticated` | `verifyTokenAndCreateAuthenticatedUser`: verifies the JWT; no database access | `userId` |
| DB | token, no `authenticated` flag | `createUserFromTokenAsync`: finds the account by OAuth link, then by email (adding the OAuth link), or creates it (profile, OAuth/email/username links, username-change record); records the login | `id`, `name`, `email`, `provider`, `providerId` |

The FE makes the split deliberate (`forceteki-client/src/app/_utils/auth.ts`, `_contexts/User.context.tsx`). Its JWT
callback sets `id = <provider>_<providerId>`, `provider`, `providerId`, `name` and `email`. The first
`/api/get-user` of a session takes the **DB path** and creates the account; the FE then stores the profile, sets
`authenticated: true` and adds `userId` to the JWT with `session.update`. From then on every request and socket takes
the **synced path**. So the synced path carries almost all traffic, while the DB path — where accounts are created and
looked up — runs once per session sync and has no coverage today.

*(Superseded by #3111: a token now has one path. `resolveUserFromTokenAsync` follows the OAuth link from the `provider` /
`providerId` claims and reads the stored profile, never creating anything; `create-user` creates accounts; the FE no longer
adds `userId` or sends `authenticated: true`. See the evaluation of 2026-11-05.)*

*What the harness can reach today.* Only the synced path: `TestClient` mints `{ userId }` tokens and always sends
`authenticated: true`. `ENVIRONMENT=development` makes `getDynamoDbServiceAsync()` return null, and the harness
passes no role, settings, cosmetics or mod-action services. So the DB path cannot run, and **every role-gated route
answers 403 "Error checking user privileges" to every authenticated caller** (the role cache is undefined): the
success path of a moderator or admin route is unreachable. *(The state on 2026-10-15. Since #2655 a harness without a database
can run the DB path too, against a process-wide in-memory account store, and a missing role cache answers 403 "Server role
service unavailable". `database: true` is unchanged. Since #3111 the synced path is gone, and since 2026-11-05 the harness
has a database by default.)*

*The HTTP surface: 50 routes, 46 in production.* Counts and statuses were **measured**: a probe recorded every route
registration and sent each one an unauthenticated request (no cookie, body `{}`) against the default harness.

| Protection | Routes | Unauthenticated result |
|---|---:|---|
| No middleware — public read | 6 | 200: `get-unimplemented`, `ongoing-games`, `available-lobbies`, `health`, `all-leaders`, `server-settings` |
| No middleware — shared secret | 2 | `link-swustats`, `link-swubase`: 403 "Forbidden" without the right key |
| No middleware — API key | 1 | `run-profile`: 401 without a valid `Authorization: api-key` header |
| No middleware — dev-only | 2 | `test-game-setups` 200; `start-test-game` 500 (no `filename`). Since #2655 `start-test-game` goes through `authMiddleware` and is refused without a session |
| Role-gated by the middleware | 8 | 401 "Authentication required". Moderator (5): `POST` and `DELETE` cosmetics, `mod/find-user`, `mod/submit-action`, `mod/cancel-action`. Admin (3): `mod/server-settings`, plus the dev-only `DELETE /api/cosmetics` and `cosmetics-reset` |
| `authMiddleware`, anonymous rejected by the handler | 20 | **401** ×13 (`swustatsLink`, `swustats/decks`, `swubaseLink`, `toggle-welcome-message`, both `*-popup-seen`, `get-change-username-info`, `change-username`, `PUT preferences`, `get-deck/:id`, `save-deck`, deck `favorite`, `delete-decks`); **403** ×7 (the three `set-*-seen`, both `unlink-*`, `get-decks`, `rename-deck`) |
| `authMiddleware`, anonymous accepted | 10 | reaches the handler: `get-user` 200, `GET cosmetics` 200, three `user-is-*` 200 (message "Error checking user privileges" while there is no role cache; since #2655, "Server role service unavailable"), `resolve-deck-link` 400, `join-lobby` 404, `enter-queue` 400, `change-deck` 403 (not a lobby member), `create-lobby` **500** on an empty body |
| `authMiddleware`, anonymous conditional | 1 | `spectate-game`: 401 while `allowAnonymousSpectators` is false |

The four dev-only routes are registered only when `process.env.ENVIRONMENT === 'development'`, which is what the
default harness runs as, so its route table has four routes production does not. The 401-versus-403 split for the
same condition (an anonymous caller) is inconsistent across the 20 rejecting routes; the FE reads the exact code for five of them, and the manifest asserts only those exactly.

*(Since #3111: 51 routes, 47 in production. `create-user` is new, with its own access class, `session-token` (no
middleware; refused without a session). `link-swustats` and `link-swubase` also go through `authMiddleware`, for the session
the FE server forwards, and `link-swubase` checks `expectedUserId`. `RouteAuthManifest.ts` is the current table.)*

*Authorisation facts.* Admin satisfies every role check; Moderator and Developer do not imply each other; no route
requires Developer or Contributor. On 2026-10-15 only `PUT /api/user/:userId/preferences` read `:userId` and compared it
with the caller (403). Since #2655 that route is `PUT /api/user/preferences` and acts on the authenticated caller, so no
route compares a path `:userId` with the caller; the five `/api/user/:userId/…` routes (`swustatsLink`, `swustats/decks`,
`swubaseLink`, `undo-popup-seen`, `timer-popup-seen`) act on the caller. `ModActionType` is Mute, Warning, Rename, ReportingDisabled,
UsernameChangesBlocked and ChangeUsername.

*Verified by the probes.*

- **The DB seam needs no production change.** Spying `getDynamoDbServiceAsync` before the harness builds the server
  reaches every `UserFactory`, including the per-route ones `authMiddleware` creates while routes are registered.
  *(Since #3111 there is one, the server's.)*
- **DB path.** The first `/api/get-user` created the profile plus OAuth, email and username links (`Probe User` →
  `ProbeUser`, `showWelcomeMessage: true`); the second login found the same account and recorded a login; an account
  found only by email gained the OAuth link.
- **Credentials.** Wrong secret, expired, `alg: none`, malformed, synced request without `userId`, DB path without `id`,
  and DB path without `name` all returned 401 "Authentication failed" and wrote nothing to the DB.
- **Roles with a real `ServerRoleUsersCache`.** Nobody, contributor and developer get 403 on a Moderator route;
  moderator and admin reach the handler; a moderator gets 403 on an Admin route; no cookie gets 401.
- **Production-like construction** (`ENVIRONMENT=production`) removes all four dev-only routes (404).
- **A local `.env` leaks into specs.** `ServerTestEnv` pins other variables so a developer's `.env` cannot change a
  spec, but not `INTRASERVICE_SECRET` or `PROFILE_CAPTURE_SECRET`. On this machine `.env` sets the first, so the link
  routes answered 403 where CI (no `.env`) would throw a 500. (Both are now pinned in `ServerTestEnv`, as are
  `USE_LOCAL_DYNAMODB` and the stat-site credentials.)

**Stage plan.** Sizes use the backlog's scale (XS ≈ an hour, S ≈ a day, M ≈ a few days); by that scale the PR is
large, roughly two weeks.

| # | Stage | Category | Size | Production change |
|---|---|---|---|---|
| 1 | Partition repair and guard | cleanup | S | move `DiscordDispatcher` (two import paths) |
| 2 | Helper hygiene, de-duplication, fast loop (I-8, I-9, I-11, part of I-4) | cleanup | S | name the quick-lobby countdown's start and tick as constants in `Lobby` |
| 3 | DB seam: scheduler seam and `FakeDynamoDbService` | auth prerequisite | M | `export` the DB service class; optional scheduler on `TimedCache` and its four users |
| 4 | Harness wiring, token helpers, route recorder | auth prerequisite | M | none |
| 5 | Auth guard specs (vertical slice) | auth guards | M | none |
| 6 | Retire workarounds, enforce, document (I-5, I-10) | cleanup | S | `lobbies` `private` → `protected` |

**Stage 1 — partition repair and guard.**

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

**Stage 2 — helper hygiene.**

- Export `buildTestConfig`; `QueueHandler.spec.ts` uses it instead of its hand-copied `IGameNodeConfig` literal (I-8).
- Delete the dead acknowledgement API — `FakeIoSocket.ackEvent`, `IFakeEmittedEvent.ack`, the trailing-function
  handling in `emit`, `TestClient.ackEvent` (I-9a) — and migrate `GameServerAnonymousRestrictions.spec.ts` to
  `serverIntegration` (I-9b).
- Delete the test-only `IMatchConfiguration` in favour of the production `IQueueFormatKey`; one exported match
  config replaces six local `matchConfig` definitions.
- Add `TestClient.lobbyId` (replaces eight URL-parsing copies across four specs) and `harness.startQuickGameAsync`
  (replaces five copies of queue → connect → countdown; two specs define their own `setUpGameAsync`). The rest of
  I-4 stays in the backlog.
- Name the quick-lobby countdown in `Lobby` so the harness imports it instead of keeping a copy: the literals `5` and
  `1000` in `quickLobbyCountdownAsync` become private constants, and `public static readonly QuickLobbyCountdownMs`
  (6 s) is derived from them. Values and behaviour are unchanged.
- Add `npm run test-nongame`: fast build, then `jasmine-nongame.json`, serial (I-11).
- Acceptance: spec count unchanged; the diff is setup moving, not assertions changing.

**Stage 3 — DB seam.**

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

**Stage 4 — harness wiring.**

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
  is the local-dev configuration, so the default should eventually flip. As part of this stage, do a one-off trial
  run with it flipped and record which specs break, so that follow-up is sized.) *(Flipped on 2026-11-05.)*
- Env hygiene: pin `INTRASERVICE_SECRET` and `PROFILE_CAPTURE_SECRET` in `ServerTestEnv`. `options.env` overrides
  `process.env` entries for the life of one harness and restores them in `afterEach` — process-global, but jasmine
  workers are separate processes and specs within one run serially. It is what builds a production-like server
  (`ENVIRONMENT=production`). Caveat: `PROFILE_CAPTURE_SECRET` is read from
  `server/env.ts`'s import-time parse rather than `process.env`, so only its pinned (set) branch is testable unless
  that module export can be overridden; confirm in this stage, and otherwise leave the unset branch unpinned.
- `test/helpers/server/AuthTokens.ts`: `mintSessionToken(claims)` with FE-faithful claims (documented against the FE
  `auth.ts`), named bad tokens (wrong secret, already expired, `alg: none`, malformed, missing claim) and the two
  cookie names. JWT expiry is checked against the **real wall clock**, so expired-token specs mint an already-expired
  token rather than advancing the virtual clock.
- `TestClient` auth modes: `synced-profile` (today's behaviour, the default) and `token-only` (the DB path: no
  `authenticated` flag, DB-path claims, profile comes from a seeded account); plus raw `get`/`post` with full control
  over cookie and body user, for the manifest spec. *(#3111 removed both modes: every
  authenticated client is now token-only, against a seeded account.)*
- Route recorder. The Express app is not reachable through `httpServer.listeners('request')`, because socket.io
  re-wraps those listeners when it attaches (a first attempt failed on exactly this). Instead the harness records
  routes by wrapping `express.application`'s `get`/`post`/`put`/`delete`/`patch` with jasmine spies while the server
  is constructed (Express copies those functions onto each new app). **Verified: 50 routes recorded, no production
  change.** If routes later move into `express.Router` modules, the recorder now fails loudly rather than miss them
  (see *After an independent review of the branch*); extend it to wrap `express.Router` the same way.

**Stage 5 — auth guard specs (the vertical slice).** New folder `test/server/gamenode/auth/` (the non-game glob
already covers it). Roughly 130–180 specs, most of them parameterised rows.

1. `RouteAuthManifest.spec.ts` + `RouteAuthManifest.ts` — one row per route (`public`, `anonymous-ok`,
   `authenticated`, `role:moderator`, `role:admin`, `shared-secret`, `api-key`, `dev-only`) with its unauthenticated
   outcome from the table above (an exact refusal code only where the FE reads it). A completeness spec fails if a route
   is registered but unclassified,
   or a row names a route that no longer exists, so **a PR that adds a route cannot skip deciding its auth**.
   Per-row specs assert the unauthenticated outcome and, for role routes, the role matrix. Under a production-like
   harness the four dev-only routes are asserted absent.
2. `CredentialVerification.spec.ts` — the bad-token table run through **both** HTTP and the socket: wrong secret,
   expired, `alg: none`, malformed, synced request without `userId`, DB path without `id`, DB path without `name` (and no
   partial account written). Also: both cookie names accepted; the JWT's `userId` wins over a different `id` in the
   payload; a socket with a token and non-authenticated user data takes the DB path; the dev test-user ids (`exe66`,
   `th3w4y`, honoured only when `ENVIRONMENT=development`) are rejected under a production-like harness. *(Since #2655
   those fixed ids are rejected as anonymous ids everywhere, and the dev test users sign in as accounts.)*
3. `AccountLogin.spec.ts` — first login creates the profile and links (cleaned username, welcome flag, a
   username-change record); a returning login finds the account by OAuth and records the login; an email-only match
   (case-insensitive) adds the OAuth link; link present but profile missing recreates it; `get-user` response shape.
4. `RoleAuthorization.spec.ts` — the role matrix on a Moderator and an Admin route (nobody, contributor, developer,
   moderator, admin); no cookie → 401; `GET user-is-*` reflect the seeded roles; a role revoked in the DB takes effect
   only after the cache refresh (virtual clock); and the maintenance-mode round trip — an Admin toggles
   `mod/server-settings`, then `create-lobby`, `join-lobby` and `enter-queue` answer 503 (this unblocks the
   maintenance-mode item in Phase 5).
5. `ServiceCredentials.spec.ts` — `link-swustats` / `link-swubase`: wrong key → 403, right key → the account gains the
   refresh token and the token mapping is set (through `FakeHttpClient`), unset secret in development → 500;
   `run-profile` header and secret matrix.

**Stage 6 — retire workarounds, enforce, document.**

- `ChatPermissions`: the legacy-mute and chat-disabled fixtures are seeded through the fake DB using `token-only`
  clients instead of the client's own profile data; the
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
  unit specs, as in `UserFactory.spec.ts`); what not to do (`as any` into the server, real sleeps, seeding
  account state through the client, inline DB fakes); the wall-clock gotcha for JWTs; where auth specs live;
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
| `server/gamenode/GameServer.ts` | `lobbies` `private` → `protected`; `DiscordDispatcher` import path; `ServerCacheRefreshMinutes` names the role and settings cache interval; `buildModerationFromCacheEntry` reads the clock through the scheduler | none |
| `server/gamenode/Lobby.ts` | `DiscordDispatcher` import path; the quick-lobby countdown's start value and tick named as constants, with `QuickLobbyCountdownMs` derived from them and exported for the harness | none |
| `server/game/core/DiscordDispatcher.ts` → `server/gamenode/` | file move | none |
| `package.json`, `jasmine-*.json`, `.github/workflows/pullrequest.yml`, `eslint.config.mjs`, `scripts/validateSpecs.ts` | tooling | none |

**Explicitly not in this PR.** Decks (the deck suite and the fake's deck tables); the
`/api/mod/*` action flows and moderation state reaching the client (`get-user`'s derived mute and reporting-disabled
fields, the three `set-*-seen` routes); ownership-scoping specs beyond what the manifest pins; the Discord seam (I-2)
and deck-fetcher seam (I-3); spectator, timer and stats scenarios (Phases 4–5); flipping the harness default to
"database on". **If the PR needs to shrink**, cut in this order: stage 6's `ChatPermissions` migration, then
`ServiceCredentials` and `RoleAuthorization` (independent of the manifest, credential and login specs).

**Verification** (the card suites are not run): `npm run test-parallel-nongame` five times in random order; the
load-only count showing the two groups partition `jasmine.json` exactly (still 9,375 after stage 1; plus the new
specs after stage 5); `npm run validate-cards`, `validate-specs`, `npx eslint --quiet` and `tsc` clean; the probes'
scenarios that assert intended behaviour present as permanent specs; each stage building and passing the non-game suite
before the next began.

**Risks and mitigations.**

- *The fake drifts from DynamoDB.* `implements Pick<DynamoDBService, …>` catches signature drift at compile time; the
  fidelity rules are listed in the file header and covered by their own spec. Running the same spec against DynamoDB
  Local is a possible later step, not part of this PR.
- *Spy-before-construction ordering.* Installing the spy after the server exists silently does nothing. The harness
  installs it itself and fails loudly if `database` is requested while `getDynamoDbServiceAsync` is not spied.
- *Process-global state* (the DB spy, the Express recorder, `process.env`): restored by jasmine or `afterEach`;
  jasmine workers are separate processes.
- *The default harness is not production-like* (no DB, `ENVIRONMENT=development`, four extra routes). Opt-in
  production-like mode now; the trial run sizes the default flip. Since #2655 the no-database server also shares one
  in-memory account store per worker (I-12).
- *Wall-clock dependence.* JWT expiry always uses the real clock. `ModActionService` uses the virtual clock once the
  seam lands; anything else in the DB path that reads `Date.now()` directly would not.
- *A large PR.* Stages 1–2 were independently mergeable, and stage 3's production changes could be reviewed alone.


## Moved out of the plan on 2026-11-05

### Finished backlog items

**Done in the [account-auth PR](#account-auth-guards-and-suite-guardrails-merged-in-3021-2026-10-17):** I-1 (the
slice: fake DB without decks, harness wiring, scheduler seam), I-5, I-8, I-9, I-10, I-11, and the `lobbyId`,
quick-game and match-config parts of I-4. **Still in the backlog:** I-2, I-3, I-6, I-7, I-12 and the rest of I-4, plus what that
PR's *Carried forward* list names (chiefly the fake's deck tables). The paragraphs below are the original write-ups,
kept for their evidence; the status column above is current.

**I-1 — DB-backed services seam (largest lever). ✅ Slice done in the account-auth PR; the fake's deck tables remain.**
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

**I-5 — Typed inspection surface. ✅ Done (`lobbies` is `protected`; `TestGameServer.testLobbies`, `lobbyCount` and `testLobbyFor`).** The plan promised "a narrow, explicitly-internal inspection surface"
(design goal 2) and never built it. *Evidence:* two specs reach into the private `lobbies` map via `as any`
(`LobbyReports`, `GameServerTestGameSetups`). Make `lobbies` `protected` — the "protected members plus an
inherited test class" pattern the project already prefers — and expose typed read-only accessors on
`TestGameServer` (`testLobbies`, `lobbyCount`, `testLobbyFor(userId)`). `GameServerMatchmaking.spec.ts` already
leans on two public production methods as test hooks (`getUserLobbyId`, `recordExpiringMatchmakingEntry`); that
is fine, but a named test surface is clearer.

**I-8 — Shared test config. ✅ Done.** `QueueHandler.spec.ts` hand-copies the whole `IGameNodeConfig` literal, which
duplicates `buildTestConfig` in `TestGameServer.ts` (not exported). The two already had to be edited in lockstep
once, when `allowAnonymousChat` was added. Export `buildTestConfig`.

**I-9 — Helper hygiene. ✅ Done.** (a) Remove the dead acknowledgement API: `FakeIoSocket.ackEvent`,
`IFakeEmittedEvent.ack`, the trailing-function handling in `emit`, and `TestClient.ackEvent`. They modelled the
production ack callback deleted in #2950, and no spec uses them. (b) Migrate `GameServerAnonymousRestrictions.spec.ts`
to `serverIntegration` (see the correction under Phase 2).

**I-10 — Contributor guide. ✅ Done: "Writing a server spec" in `CLAUDE.md`, backed by an ESLint rule.** The only description of the server harness is this progress log, and `CLAUDE.md`
documents only the card harness. #3014 was written with an AI assistant and, with no guide to follow,
reinvented `matchConfig`, a game-setup helper and a link parser — all things the harness could own. Add a short
"writing a server spec" section to `CLAUDE.md`: use `serverIntegration` and `TestClient`; never `as any` into the
server; drive time with the virtual clock; use the scenario builders; how to run the group quickly (I-11).

**I-11 — Fast loop. ✅ Done (`npm run test-nongame`).** `npm run test-fast` with no path runs all 9,375 specs, and `test-parallel-nongame` does a
full rebuild. Add `test-nongame` (fast build, then `jasmine-nongame.json`) so server work has a loop that is
seconds, not minutes.

**Suggested order** *(historical: the account-auth PR took I-1's slice, I-5, I-8, I-9, I-10, I-11 and part of I-4; what is left
is I-2, I-3, I-6, I-7 and the rest of I-4)*. The items that need no behavioural production change (I-8, I-9, I-4, I-6, I-5, I-11 — I-5's
only production edit is one visibility keyword, and I-11 touches `package.json` alone) are independent, low-risk,
and retire most of the duplication and every `as any` except the DB-backed ones; do them first, roughly in that
order. Then I-2 and I-3, which are small seams. Start I-1 in parallel with its production prerequisite (the
`TimedCache` scheduler), since it gates the most untested surface. I-10 should land with the first scenario
builders so new specs use them.

**I-4 — Scenario builders (test-only). ◐ `TestClient.lobbyId`, `harness.startQuickGameAsync` and the shared match config are done; `createLobbyWithGuestAsync` is not.** *Evidence:* the same setup is hand-written repeatedly.

| Boilerplate | Occurrences |
|---|---|
| queue → connect → advance through the 6 s countdown → assert game started | 5 (two specs each define their own `setUpGameAsync`) |
| `new URL(lobbyState.connectionLink).searchParams.get('lobbyId')` | 8 across 4 specs |
| the three-field match config redefined locally | 6 of 14 gamenode specs |
| local helper definitions (`setUp*`, `queue*`, `enterQueue*`) | 5 |

*Shape:* `harness.startQuickGameAsync(a, b?, config?)` (waits `Lobby.QuickLobbyCountdownMs`); `TestClient.lobbyId`;
`harness.createLobbyWithGuestAsync({ isPrivate?, ownerOptions?, guestOptions? })` returning `{ owner, guest,
lobbyId }` and choosing browse-and-join or link by privacy; and one exported match config. Use the existing
production `IQueueFormatKey` rather than a test-local type (done in #3021).

*Remaining parts (2026-11-05), roadmap step 1.* Besides `createLobbyWithGuestAsync`: `harness.startLiveGameAsync(...)`,
which takes two clients from a custom lobby to a started game (both ready, the owner starts it) and returns them with the
lobby id, the lobby-game counterpart of `startQuickGameAsync`; and a game-ending helper (`harness.endGameAsync(first,
second)`, or `concedeAsync` on `TestClient` from I-6) that ends a running game by conceding, so a spec reaches game-end
behaviour (stats, best-of-three progression, the rematch cooldown) without playing a game out. Build them before the
scenarios that need them, so the spectator, reconnect-mid-game, timer, best-of-three and stats specs share one setup.

**I-6 — Typed client commands and chat accessors (test-only).** Specs send raw strings
(`sendLobbyMessageAsync('proceedToNextBo3Game')`), which is now the allowlist contract spelled by hand. Add one
named method per allowlisted command (`sendChatMessageAsync`, `concedeAsync`, `concedeBo3Async`,
`setReadyAsync`, `startGameAsync`, `submitReportAsync`, …), which also makes the command surface greppable. Add
`lobbyChat` / `gameChat` accessors (flattening `gameChat.messages` and `gamestate.newMessages`) to replace the
`JSON.stringify(...).includes(...)` searches in `ChatPermissions` and `SocketCommandAllowlist`.

I-4 and I-6 were done on 2026-11-06 (roadmap step 1); see *Step 1 — scenario builders* above.

### Interface migration (Phase 3)

**Interface migration — corrected.** The previous version of this plan said `IMatchConfiguration`
(`{ format, cardPool, gamesToWinMode }`, test-only in `TestClient.ts`) should be *migrated to
production*. That missed that production **already has it**: `IQueueFormatKey` in `QueueHandler.ts` is
structurally identical and is used in ~12 places (`GameServer`, `Lobby.queueFormatKey`, `QueueHandler`).
So: delete `IMatchConfiguration`, have `validateMatchConfiguration` take `IQueueFormatKey` (consider a
neutral name, since lobbies use it too and "queue" is misleading), and point the one consumer
(`GameServerMatchmaking.spec.ts`) and `TestClient` at it. `ITestUserPayload` (`{ id, username }`)
remains a mirror of the still-untyped `queryUser` in `UserFactory.createAnonymousUserFromQuery`; lower priority.

### Finished Phase 6 items

- ~~Repair the game / non-game partition and add a guard against it drifting again~~ — ✅ done in the
  [account-auth PR](#account-auth-guards-and-suite-guardrails-merged-in-3021-2026-10-17), stage 1 (`validate-specs`; details
  under *CI structure*).
- ~~Add a one-command fast loop for server specs (I-11).~~ — ✅ done: `npm run test-nongame`.

### Resolved findings

The numbers are the plan's *Open findings* numbers.

4. **`this[command]` dispatch — ✅ resolved by #3014.** All three dispatch sites (lobby, game, spectator) now
   check an allowlist before invoking a method. Residual guards are tracked under Phase 3.

5. **Timers that nothing can cancel — ✅ resolved by #3001.** `GameServer` now wraps its scheduler in a
   `SchedulerTaskScope` and hands the scope to everything it creates, so the disconnect-grace timeout, the
   requeue-after-disconnect timeout and a live game's action timers are all tracked and cancelled by
   `shutdownAsync()`. **Verified empirically on 2026-10-15** (a throwaway probe, since deleted): an abrupt
   disconnect raised the pending-task count 3 → 4 and shutdown returned it to 0; a live game with action timers
   enabled also drained to 0. The permanent regression lock is still to be added (Phase 4, "Permanent regression
   locks").

8. **An account whose profile is missing can never sign in — fixed.** A token's provider identity linked to a user id
   with no profile used to fall through to a recreate step whose conditional OAuth-link write always failed, so the
   owner was refused on every attempt. `UserFactory.findOrCreateAccountAsync` now recreates the profile under the
   linked id (which also reattaches the account's other stored data), keeps the existing link, and does not look the
   account up by email. Covered in `AccountLogin`.

9. **A first sign-in with no email claim half-creates the account — fixed.** A token with no `email` claim, like one
   missing `provider`, `providerId` or `name`, is now refused before anything is written, and the OAuth link is
   written last so a failed creation can be retried. Covered in `CredentialVerification`. Whether an account with no
   email should instead be accepted remains a product decision.
