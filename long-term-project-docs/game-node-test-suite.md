# Game Node Test Suite

Status: **handed off.** Phases 0–2.5 and the account-auth guards are merged to `main` (PRs #2934, #2961, #2950 and #3021)
and CI-gated; what is left is scenario coverage, a few infrastructure seams and some cleanup. Read
[Handoff](#handoff-2026-11-05) first: it has the current numbers, the core merge commits, the decisions taken, what to do
next and how to work with the suite. Everything after it is the working record: why the suite exists, the design goals,
what each phase built and what the reviews found, and the plan for what remains. The plan was last re-evaluated against
`main` @ `d392aa6ac` on 2026-11-05; [Merged since the account-auth PR](#merged-since-the-account-auth-pr--evaluation-of-2026-11-01)
and [Account resolution and the profile cache](#account-resolution-and-the-profile-cache--evaluation-of-2026-11-05) cover what others merged since.

## Handoff (2026-11-05)

**Map of this document.** *Why this exists*, *Design goals* and *Approach* · *Progress* (Phases 0–2.5, the review rounds, and
the evaluations of what others merged) · *Remaining work* (the account-auth PR's record, then Phases 3–6) · *Test
infrastructure backlog* (I-1 … I-12) · *Refactor-fragility register* · *CI structure* · *Open findings* · *Future test suites*.

### State

The connection layer (`GameServer`, `Lobby`, `QueueHandler`) has a working integration harness and a CI-gated suite. A spec
starts a real `GameServer` in-process on a virtual clock, drives it through the same HTTP calls and socket handshake as
`forceteki-client` (`TestClient`), and asserts on what the client receives and on what the fakes for the outside world
(stats-site HTTP, DynamoDB) were called with. Measured on 2026-11-05 on `main` @ `d392aa6ac` with the follow-up described
under [Account resolution and the profile cache](#account-resolution-and-the-profile-cache--evaluation-of-2026-11-05) applied (Node 26.13):

- **763 non-game specs** (`jasmine-nongame.json`): 0 failures, 0 pending; about 2.4 s serial, and clean in three runs under
  `--parallel=4 --random=true`.
- 9,137 game specs, so **9,900 in total**. The two configs partition the suite exactly (counted by loading each config with
  every spec filtered out, so no spec body runs and the card suites are not executed). For reference, the figures were
  677 / 9,012 / 9,689 on 2026-11-01 and 404 / 8,971 / 9,375 before #3021: widening the non-game globs moved 28 specs
  (`DiscordDispatcher`, `usernameBlockMigration`, `DynamoDBInterfaceSchemas`) out of the game group, #3111 added most of
  the non-game growth since, and card work has grown the game group.
- CI gates: `npx eslint --quiet`, `npm run validate-cards`, `npm run validate-specs`, `npm run test-parallel` and
  `npm run test-parallel-undo`.

*Covered:* the connection lifecycle over HTTP and socket (lobbies, queue and matchmaking, reconnect and grace-window removal,
multi-tab), the anonymous-versus-logged-in rules (chat, reports, best-of-three and spectator gating at the HTTP gate), the
command allowlist, stats-site token flows at handler level, and authentication and authorisation for logged-in accounts
(credential verification, account creation and login, account resolution and the server's profile cache, roles, service secrets, and a manifest that forces every HTTP route
to declare who may call it). *Not covered:* the game-mode legal/illegal matrix (production does not validate it yet), stats
payloads, timers and the inactivity kick, best-of-three flow, spectator flows, decks, and most moderation and account routes
beyond who may call them. [What is left](#what-is-left-in-suggested-order) says where to begin.

### Core merges

The work landed on `main` as four squash merges, so the branch commits named in the phase sections below no longer exist as
separate commits.

| PR | Commit | Merged | What it landed |
|---|---|---|---|
| #2934 | `63853b15be4d5c9f05328e28c03fcb76f946ba29` | 2026-10-02 | **Part 1.** Phase 0 (headless `GameServer`, `ServerTestHarness`, decklist fixtures) and Phase 1 (`IScheduler` / `RealScheduler`, `IGameNodeConfig`, `shutdownAsync()`, the two timer-leak fixes), with the pre-PR scheduler review fixes. The first 37 specs, and this document. |
| #2961 | `9a8730d12fc0e531e094081cdef651f21b80420f` | 2026-10-06 | **CI follow-up to part 1.** Deterministic lobby names (random text could trip the real profanity filter), application logging silenced during specs, and `RealScheduler` specs moved onto Jasmine's controlled timers instead of wall-clock waits. |
| #2950 | `b90d3958b92ea56b5b6f6744f5e552cff07212d0` | 2026-10-09 | **Part 2.** Phase 2 (the `IRawGameSocket` seam, `FakeIoSocket`, `TestClient`, `serverIntegration()`, `LobbyConnectionManagement`, `SocketIoDriftGuard`; the dead ack callback removed) and Phase 2.5 (`IHttpClient` / `FakeHttpClient` and the stats-handler specs), with the round-2 review fixes. |
| #3021 | `8ffb6130f0b126e681bfa40b08ff271ecb93c462` | 2026-10-17 | **Part 3.** The account-auth guards and suite guardrails: the fake DynamoDB and the scheduler seam on the DB-backed caches, harness options (`database`, `env`, `recordRoutes`), the auth specs and route-auth manifest, the spec-partition guard (`validate-specs`), helper hygiene, the `test/server/gamenode/` regrouping, the `as any` lint rule, "Writing a server spec" in `CLAUDE.md`, and the independent-review fixes. 58 files. |

**Also on `main`, from other contributors.** Before #3021: #2994 (disable reporting), #3001 (matchmaking preference and
`SchedulerTaskScope`), #3011 (username moderation) and #3014 (command allowlists, anonymous-identity hardening, chat and report
rules), evaluated under [Merged since Phase 2.5](#merged-since-phase-25--evaluation-of-2026-10-15). Since #3021: #2655 (dev
test accounts and an in-memory user store), #3031 (matchmaking logging) and #3038 (the Node pin), evaluated under
[Merged since the account-auth PR](#merged-since-the-account-auth-pr--evaluation-of-2026-11-01). Since then: #3110 (action-window
menu commands checked against the buttons offered) and #3111 (account resolution, `create-user` and the profile cache), evaluated
under [Account resolution and the profile cache](#account-resolution-and-the-profile-cache--evaluation-of-2026-11-05).

### Decisions taken

| Topic | Decision | Where |
|---|---|---|
| Transport | Hybrid: an in-process fake transport that runs the *real* `io.use` middleware and `onConnectionAsync`, guarded by a few real `socket.io-client` specs that catch drift | *Approach*, Phase 2 |
| Production seams | Injected collaborators with production defaults (`IScheduler`, `IGameNodeConfig`, `IHttpClient`, an optional scheduler on the DB-backed caches). No test-only API on production classes: test construction lives in the `TestGameServer` subclass over `protected` members | *Design goals* 4 |
| Lobby ids | `create-lobby` keeps not returning one (a deliberate anti-automation measure); the harness browses `available-lobbies` or joins by `connectionLink`, as the FE does | *Approach* |
| Command dispatch | Explicit allowlists (landed in #3014 by another contributor); the residual guards are Phase 3 | Phase 3 |
| Game-mode configurations | Wanted as Tier 1 (for example, Open is lobby-only and cannot be queued). Production does not validate them yet, so `validateMatchConfiguration` (Phase 3b) comes first | Phase 3b, Open finding #3 |
| Dead ack callback | Removed from production, with the drift spec that watched it, rather than characterised | Phase 2 |
| Stats sites | An `IHttpClient` seam and handler-level specs now; game-result payloads wait for Phase 4 | Phase 2.5 |
| Test-only interfaces | Migrate to production only once Phase 3 starts. `IMatchConfiguration` was replaced by the production `IQueueFormatKey` in #3021; `ITestUserPayload` is still test-only | Phase 3 |
| Moving socket handling out of `GameServer` | **Not now.** Only the auth slice (`IRawGameSocket`, `SocketData`, `ISocketAuthResult`, `authenticateSocketAsync`, `runSocketAuthMiddlewareAsync`; about 90 lines) is isolated. `onConnectionAsync` (about 180 lines when assessed), `handleSocketConnectionAsync` and the disconnect paths are entangled with `lobbies`, `userLobbyMap`, `queue` and the matchmaking-penalty map, so a real extraction is the lobby / queue / connection refactor this suite exists to make safe | this table |
| CI | No path-based filtering. A game / non-game job split is wanted eventually (undo mode is meaningless for the non-game group) but is not urgent; `validate-specs` keeps the two groups honest | *CI structure* |
| Account-auth PR shape | One PR, a vertical slice of the auth suite, the scheduler seam included. Findings were to be characterised rather than fixed; the next two rows replaced that | the account-auth section |
| Specs never assert wrong behaviour | A spec that exposes wrong behaviour is not written: leave a `TODO` (and a pending spec when the intended behaviour is clear) and record the finding | `CLAUDE.md`, *Open findings* |
| Nothing exploitable is written down | Report it privately to the maintainers; describe it nowhere in this repository (specs, comments, `CLAUDE.md`, this document). Gaps in the *Open findings* numbering are deliberate | `CLAUDE.md` |
| Spec layout | Area folders under `test/server/gamenode/` (`auth/authentication`, `auth/authorization`, `lobby`, `matchmaking`, `account`, `harness`), grouped by subject rather than mirroring `server/`; no automated check against a spec landing directly under `gamenode/` | the account-auth section |
| Harness database | **On by default** (since 2026-11-05). `{ database: false }` is the local-dev configuration, used only by specs whose subject it is: the no-database block of `ServerTestHarness`, `Development preferences without DynamoDB` and the local-dev describe of `GameServerTestGameSetups` | *Hazards*, I-12 |
| Account time | On the virtual clock. `TestGameServer` hands the server a `UserFactory` whose profile cache and own time reads use `TestScheduler.now()`; production's defaults read `Date.now()`. JWT expiry stays on the wall clock | the 2026-11-05 evaluation |
| Profile cache staleness | Recorded as #3111's design: a profile written outside this process (another node, an admin edit, a migration) is seen within the 4 h lifetime; identity links are held until evicted, so re-pointing one needs a restart; every writer in this process discards the cached copy (only the login timestamp is left stale, and nothing reads it from the cache) | the 2026-11-05 evaluation |
| Quick-lobby countdown | Imported from production (`Lobby.QuickLobbyCountdownMs`), not copied; the 20 s grace, 60 s stale-lobby and 20 s matchmaking-penalty values stay literal in specs so that changing one fails a test | I-7 |

### What is left, in suggested order

1. **The gaps no infrastructure blocks** (Phase 4): reconnect inside the grace window and grace expiry mid-game, the
   inactivity kick and `resetActionTimer`, ownership and empty-lobby cleanup, the full-lobby race and join-while-in-a-lobby,
   the matchmaking-disconnect penalty, the quick-lobby countdown as the subject, and the two cheap shutdown regression
   locks (written against a baseline, see Phase 4). These are the paths the socket refactor will move.
2. **I-4's remainder and I-6, first or alongside:** `createLobbyWithGuestAsync` and typed client commands
   (`sendChatMessageAsync`, `concedeAsync`, …) remove the boilerplate before it multiplies.
3. **Phase 3b and the game-mode matrix**, the one original goal with no coverage at all. It needs a small production change
   (`validateMatchConfiguration`, mirroring the FE's `LobbyFormatConfigs` / `QueueFormatConfigs`) and a decision on the
   response for each illegal combination (Open finding #3); then the Phase 3a residual guards (export the allowlists, a
   consistency guard, an FE-contract manifest, positive coverage per command).
4. **Stats.** A harness helper that plays a game to completion, plus deck tables in the fake DB for `DeckService`; then
   external payloads (SWUStats / SWUBase through `FakeHttpClient`) and internal `statsSubmitNotification` payloads.
5. **I-2 (Discord seam)**, which unblocks the report scenarios and retires the last `as any`; **I-3 (deck-fetcher seam)**
   with the fake's deck tables, which unblocks the deck suite.
6. **Phase 5 leftovers:** spectator flows, handshake failures, multi-tab beyond lobbies, deck gates, discovery filtering,
   lobby-name validation, HTTP smoke coverage.
7. **Housekeeping:** I-12 (since the default flip, only the `database: false` specs share the store), the
   I-7 time helpers, the formal parallel-safety review, and splitting the CI jobs when it is worth it.
8. **Future suites** (moderation and account routes beyond who may call them, linked stat-site accounts, best-of-three
   flow, game-timer behaviour, cosmetics, resilience): the last section.

Open findings that still need a production fix are #1, #3, #6 and #10; #8 and #9 were fixed by #3111. Anything exploitable is tracked privately with the
maintainers, not here.

### Working agreements

- **Production changes are behaviour-neutral seams.** Read every production hunk and show that each default reproduces the old
  behaviour (break it, watch a spec fail, restore it). No test-only API on production classes.
- **Write specs the way `CLAUDE.md` says** ("Writing a server spec": which harness, the sanctioned seams, no `as any` into the
  server). A spec that exposes wrong behaviour does not assert it: leave a `TODO` where it belongs and record the finding.
- **Server-only work does not need the card suites.** `npm run test-nongame` is the loop; CI runs everything.
- **The owner reviews, stages and commits.** An assistant working on this does not run `git commit`.

### Running and verifying

```bash
npm run test-nongame               # fast build, then the non-game group, serial: the everyday loop
npm run test-fast build/test/server/gamenode/lobby/LobbyReports.spec.js    # one spec file: a build/ path ending in .spec.js
npm run jasmine-parallel-nongame   # CI's flags (4 workers, random order) over the existing build
npm run validate-specs; npm run validate-cards; npx eslint --quiet
npx tsc -p ./test/tsconfig.json --noEmit
```

- **Stale build output.** `build/` is never cleaned, so a `.spec.js` left behind by another branch still runs and fails. On
  2026-11-01, right after a branch switch, three compiled specs from an unmerged branch produced 19 failures. If a failing
  spec has no `.ts` source, delete its compiled file (or `build/`) and rebuild.
- **Counting specs without running them.** Load a config through Jasmine's API with `specFilter: () => false` and read
  `totalSpecsDefined` from the `jasmineStarted` event; nothing executes, so the card suites cost seconds.

### What the harness depends on in production

The refactor has to keep these working or re-wire `TestGameServer` / `TestClient` to their replacements. The behaviour specs
should not need to change.

| Production member | Used by | For |
|---|---|---|
| `GameServer`'s `protected` constructor, with `IGameServerOptions` (`listen`, `scheduler`, `config`, `httpClient`) and its optional `userFactory`; `lobbies`, `httpServer`, `config` and `httpClient`; `getUserLobbyId()` and `shutdownAsync()` | `TestGameServer` | building the server headless on injected collaborators, the inspection surface, teardown |
| `UserFactory`'s constructor (`cache`, `now`) and `UserProfileCache`'s `now` option; `defaultProfileTtlMs` | `TestGameServer`, `AccountResolution` | account time on the virtual clock; the profile lifetime imported, not copied |
| `GameServer.getUserFactory()` (`createUserFromTokenAsync` is spied) | `CredentialVerification` | seeing concurrent `create-user` requests arrive; listed in the fragility register |
| `authenticateSocketAsync()`, `handleSocketConnectionAsync()`, `isSuccessfulSocketAuth()`, `IRawGameSocket`, `SocketData` | `TestClient`, `FakeIoSocket` | the fake transport running the real auth middleware and connection handler |
| `getDynamoDbServiceAsync()` (spied before the server is built); `createAsync(…, scheduler)` on `ServerRoleUsersCache`, `ServerSettingsCache`, `CosmeticsService` and `ModActionService` | `TestDatabase` | the fake DynamoDB and the real DB-backed services on the virtual clock |
| Express `application.get/post/put/delete/patch` | `RouteRecorder` | the route census behind the route-auth manifest; `assertComplete()` fails if a route is registered any other way |
| `Lobby.QuickLobbyCountdownMs`, `GameServer.ServerCacheRefreshMinutes` | the harness, `TestDatabase`, specs | production values imported, not copied |
| `Lobby.prototype` (`addLobbyUserAsync`, `startTestGameAsync` and `cleanLobby` are spied) and `Lobby`'s private `discordDispatcher` (overwritten in `LobbyReports`, the one `eslint-disable`) | specs | listed in the fragility register |

### Hazards to know about

- **Stale build output** (above).
- **The no-database server shares one in-memory account store per worker** (since #2655; I-12). Only a spec that asks for
  `{ database: false }` gets that server; accounts and preferences it creates there are visible to later such specs in the
  same worker.
- **The default harness is not production-like:** `ENVIRONMENT=development` and four extra routes (it has had a database by
  default since 2026-11-05). Add `env: { ENVIRONMENT: 'production' }` for a production-like server.
- **Logged-in clients need the database.** `createClient({ authenticated: true })` seeds an account in `harness.db` (with
  `profile` for extra fields), and `createAccountClient(account)` signs in to one already seeded; both throw under
  `{ database: false }`.
- **The server caches profiles** (since #3111). Once any request or socket has resolved a user, a write to that profile
  straight into `harness.db` is not seen until the cached copy expires (4 h of virtual time). Seed what the server owns
  (mutes, preferences, usernames) before the client's first signed-in request; to change it mid-spec, go through the route
  that changes it, since every writer in the server discards the cached copy.

## Why this exists

`GameServer`, `Lobby` and `QueueHandler` own everything between a user clicking "play" and a game
running: the HTTP API, socket.io lifecycle, lobby membership, matchmaking, disconnect handling, and
the stats reporting that follows a game. The socket management in particular is convoluted and
sparsely documented, and it is the part we most want to restructure.

When this project started we could not safely restructure it, because **there was no test coverage of
any of it**: the card suite (~8,700 specs at the time) constructs a `Game` directly with a stub
router and never touches `Lobby` or `GameServer`. That is no longer true — the connection layer now
has its own 763-spec suite — but coverage is uneven (deep on matchmaking, chat, identity and authentication;
absent on stats, spectating, timers and decks), which the plan below tracks.

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

## Remaining work

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
game with action timers → shutdown. Count from a baseline taken before the disconnect or the game, as
`GameServerMatchmaking` does, not from fixed numbers: the server's own background tasks (#3111 added one) and the
database services' refresh timers share the clock, and `harness.databaseTaskCount` is the latter's share.

### Phase 5 — Tier 2 scenarios (remaining)

Struck as covered or obsolete: matchmaking cooldown (covered), ack-less client (obsolete), command allowlist
enforcement (moved to Phase 3), and the fidelity suite (landed in Phase 2 as `SocketIoDriftGuard.spec.ts`).

- **HTTP smoke coverage — no dependencies.** `GET /api/health`, `/api/ongoing-games`, `/api/all-leaders`,
  `/api/get-unimplemented` and `/api/test-game-setups` need no database. Only the route manifest requests them (to check who
  is let in); no spec asserts what they return. `/api/ongoing-games` is the substantive one (private games must be hidden).
- **Spectator flows.** Join mid-game, `allowSpectators: false`, the anonymous-spectator gate on the *socket*
  path (the HTTP gate is covered) and state retransmission. Needs I-4 for the live-game setup.
- **Socket handshake failures** beyond an invalid JWT: missing or non-JSON `query.lobby` (`JSON.parse` /
  `Helpers.getSingleOrThrow` in `onConnectionAsync`) and non-JSON `query.user`.
- **Multi-tab beyond lobbies.** A second connection for a spectator, a queued player and an in-game player (the
  lobby case is covered through `TestClient.previousSocket`).
- **Deck gates.** `change-deck` legality and the start-time deck-size check. (The identity gate on `change-deck`
  is covered by `AnonymousIdentity`; `TestClient.changeDeckAsync` already exists.)
- **Maintenance mode.** `create-lobby`, `join-lobby` and `enter-queue` return `503` with the maintenance message;
  `requeueUser` instead sends a `connection_error` carrying it (that path is shared with the automatic requeue
  after an opponent drops); dev-only `start-test-game` is gated too; `spectate-game` is **not**. **Blocked on
  I-1:** `areGamesEnabled()` reads `serverSettingsCache`, which the harness leaves `undefined`, so maintenance
  mode can never be switched on. `RoleAuthorization` (landed with the account-auth PR) now covers the Admin-toggle → 503 round trip for
  `create-lobby`, `join-lobby` and `enter-queue`, and `GameServerTestGameSetups` covers `start-test-game` since #2655;
  `requeueUser` and `spectate-game` remain.
- **Discovery filtering.** The remaining `lobbiesWithOpenSeat` filters (quick lobbies, in-game lobbies) and the listing of a
  lobby whose owner has not connected (Open finding #1; a `TODO` in `GameServerLobbyApi` marks the spec).
- **Lobby name validation.** Profanity and length rejections in `create-lobby`. No spec currently asserts that a
  name is *rejected* — the one profanity-related spec only checks that harness-generated names are accepted.

### Phase 6 — CI wiring and parallel-safety review

- ~~Repair the game / non-game partition and add a guard against it drifting again~~ — ✅ done in the
  [account-auth PR](#account-auth-guards-and-suite-guardrails-merged-in-3021-2026-10-17), stage 1 (`validate-specs`; details
  under *CI structure*).
- ~~Add a one-command fast loop for server specs (I-11).~~ — ✅ done: `npm run test-nongame`.
- Decide whether to split the CI jobs. Not urgent: the non-game group is 7% of specs and ~2 s.
- Formal parallel-safety review. Informally sound (7 clean runs on `main`, 5 more with the account-auth PR, 3 more on `main` @
  `445792e61`; each harness binds its own ephemeral port with `exclusive: true`; card data is built once per worker). The
  module-level state I-1 was expected to add is now there — the `getDynamoDbServiceAsync` spy (`routeDatabaseThrough`), the
  Express route recorder and `process.env` overrides — and is torn down per spec: jasmine removes the spies, `overrideEnv`
  restores the environment on harness shutdown, and the harness fails if scheduled tasks outlive it. **The exception** is the
  development `InMemoryUserStore` that #2655 keeps in a module-level variable (`UserStore.ts`): nothing resets it, so the
  no-database server (only `database: false` specs, since the default flip) shares it across specs in a worker (I-12).

## Test infrastructure backlog

Found by reading every spec added since Phase 2.5 for the workarounds their authors had to build. Each item
cites the evidence, the production change it needs (the project goal is to keep these minimal and never
add test-only code to production classes — design goal 4), and what it unblocks. Sizes: XS ≈ an hour, S ≈ a
day, M ≈ a few days.

| # | Item | Production change | Size | Unblocks | Status |
|---|---|---|---|---|---|
| I-1 | DB-backed services seam | scheduler into `TimedCache` and its 4 users | M | 32 untested routes, maintenance mode, mute enforcement, reports, account/settings, cosmetics, decks | ✅ slice done (decks not yet) |
| I-2 | Discord dispatcher seam | one `IGameServerOptions` field | S | report scenarios, server-error reporting | open |
| I-3 | Deck-fetcher HTTP seam | fetchers take `IHttpClient` + `IScheduler` | S | `resolve-deck-link`, `swudbLink` flows, deck management | open |
| I-4 | Scenario builders | none | S | removes 5 copies of game setup and 8 of link parsing | ◐ `lobbyId`, quick game and match config done |
| I-5 | Typed inspection surface | `lobbies` `private` → `protected` | XS | retires 2 `as any` touches | ✅ done |
| I-6 | Typed client commands and chat accessors | none | S | Phase 3 positive coverage; retires `JSON.stringify` searches | open |
| I-7 | Time helpers | none | XS | readability of ~40 boundary assertions | open |
| I-8 | Shared test config | none | XS | stops config drift between helpers and specs | ✅ done |
| I-9 | Helper hygiene | none | XS | dead code; one inconsistent spec | ✅ done |
| I-10 | Contributor guide | none | S | stops the reinvention seen below | ✅ done (`CLAUDE.md`) |
| I-11 | Fast loop script | `package.json` only | XS | server spec iteration without the card build | ✅ done (`test-nongame`) |
| I-12 | Per-harness user store for the no-database server | none (a test-side spy) | XS | order-independent specs for development without DynamoDB | open, narrowed to the `database: false` specs |

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

**I-2 — Discord dispatcher seam.** *Evidence:* `LobbyReports.spec.ts` pulls the `Lobby` out of
`GameServer`'s private `lobbies` map and overwrites its private `discordDispatcher`. `DiscordDispatcher` already
`implements IDiscordDispatcher` but is constructed inline in `GameServer`, and it posts through a module-level
`httpPostFormData`, so `FakeHttpClient` cannot see it either. *Shape:* `IGameServerOptions.discordDispatcher`
(default `new DiscordDispatcher()`), threaded the way `httpClient` was, plus a recording `FakeDiscordDispatcher`.

**I-3 — Deck-fetcher HTTP seam.** `SwuDbDeckFetcher` and `MeleeDeckFetcher` still call the global `fetch` and use
a raw `setTimeout` to abort. Route both through `IHttpClient` and `IScheduler`, as Phase 2.5 anticipated. It is now
the largest remaining raw network path.

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
production `IQueueFormatKey` rather than a test-local type (see Phase 3).

**I-5 — Typed inspection surface. ✅ Done (`lobbies` is `protected`; `TestGameServer.testLobbies`, `lobbyCount` and `testLobbyFor`).** The plan promised "a narrow, explicitly-internal inspection surface"
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
need the idiom; and named test-side constants for behaviour that is *not* matchmaking policy — the 20 s disconnect
grace, the 60 s stale-lobby rule, the 20 s matchmaking-disconnect penalty. Keep these in the tests rather than
importing them from production: if someone changes 20 s to 30 s, that is a behaviour change and the test *should*
fail. (Matchmaking's own literals are the behaviour spec and should stay literal.) The 6 s quick-lobby countdown is
the exception and is imported (`Lobby.QuickLobbyCountdownMs`): it is pacing rather than policy, and the maintainers
decided it is not worth gating changes on.

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

**I-12 — Isolate the no-database account store (new, from #2655).** *Evidence:* `server/utils/user/UserStore.ts` holds the
development `InMemoryUserStore` in a module-level variable that nothing resets, and every `UserFactory` asks
`getUserStoreAsync()` for it, so all harnesses built without `database` in one jasmine worker share one account store. It is
not a problem today, but any spec that signs in, saves preferences or renames an account leaves that behind for the next spec
in the worker, and with the parallel runner and random order the next spec is arbitrary. This was established by reading the
code, not by a failing spec. *Shape:* spy `getUserStoreAsync` in `TestGameServer.startAsync` when no database is given,
resolving to a fresh `InMemoryUserStore` per harness, the way `routeDatabaseThrough` does for `getDynamoDbServiceAsync` and
`DevelopmentUsers.spec.ts` already does for its own store. No production change. The alternative, flipping the harness
default to "database on" (see the trial under *As built*), removes the problem for every spec that does not opt out; the two
are complementary. *(The default flipped on 2026-11-05, so only the three `database: false` describes still share the
store.)*

**Suggested order** *(historical: the account-auth PR took I-1's slice, I-5, I-8, I-9, I-10, I-11 and part of I-4; what is left
is I-2, I-3, I-6, I-7 and the rest of I-4)*. The items that need no behavioural production change (I-8, I-9, I-4, I-6, I-5, I-11 — I-5's
only production edit is one visibility keyword, and I-11 touches `package.json` alone) are independent, low-risk,
and retire most of the duplication and every `as any` except the DB-backed ones; do them first, roughly in that
order. Then I-2 and I-3, which are small seams. Start I-1 in parallel with its production prerequisite (the
`TimedCache` scheduler), since it gates the most untested surface. I-10 should land with the first scenario
builders so new specs use them.

**Considered, deferred.** A shared log-capture helper (one use — `RealScheduler.spec.ts` — so no pattern yet);
per-route wrappers on `TestClient` (add on demand rather than speculatively); making the quick-lobby countdown and
disconnect grace configurable through `IGameNodeConfig` (worth doing only if the refactor wants them configurable).

## Refactor-fragility register

Existing tests that are coupled to internals the refactor is expected to change. They are legitimate today; this
list exists so none is mistaken for a stable contract when the refactor starts.

| Test | Coupling | Retired by |
|---|---|---|
| `GameServerMatchmaking`: `spyOn(Lobby.prototype, 'addLobbyUserAsync')` (×2) | Pauses lobby setup mid-flight to prove shutdown waits for in-flight matchmaking; depends on `Lobby`'s prototype and call order | rewrite against whatever replaces `Lobby` setup |
| `LobbyReports`: one `as any` | Overwrites `Lobby`'s private `discordDispatcher`; carries an explicit `eslint-disable-next-line` pointing here | I-2 |
| `RoleAuthorization`: the role refresh window | Asserts that a change in the database takes effect at the next refresh of the role lists; the interval is `GameServer.ServerCacheRefreshMinutes`, so changing it needs no spec change | change deliberately, if the refresh mechanism or invalidation changes |
| `GameServerMatchmaking`: `recordExpiringMatchmakingEntry` seeding | Uses a public production method as a test hook | acceptable; replace if the cooldown store moves |
| `GameServerScheduling`: `harness.server.swuStatsTokenMapping` | Reads a public mutable field | acceptable; the hourly cleanup is the behaviour |
| `GameServerTestGameSetups`: `spyOn(Lobby.prototype, 'startTestGameAsync')` and `'cleanLobby'` | Forces a set-up failure and asserts the half-built lobby is discarded; depends on `Lobby`'s prototype and on `start-test-game` building the lobby before registering it | rewrite against whatever replaces `Lobby` set-up |
| `DevelopmentUsers`: `spyOn(UserStoreModule, 'getUserStoreAsync')` and direct `InMemoryUserStore` use | Couples to the user-store module layout and to `UserFactory` looking its store up once, at construction | moves with the user-store module |
| `AccountResolution`: read counts on `getUserIdByOAuthAsync` and `getUserProfileAsync` | Asserts how often the database is read, which is the profile cache's design (one read of each across requests and sockets; one reload after a save) | change with the cache design; what each request sees is asserted separately |
| `CredentialVerification`: the lost-race stub on `saveOAuthLinkAsync` | Simulates another process winning by writing the link inside the stub; depends on the OAuth link being the conditional write and coming last | rewrite if account creation's write order or its conflict signal changes |
| `CredentialVerification`: *makes a single account when asked more than once at the same time* | Holds `saveUserProfileAsync` and spies `getUserFactory().createUserFromTokenAsync` to see the requests arrive; depends on the profile being written before the link and on creation going through that method | rewrite against whatever owns account creation |
| `TestGameServer`, `TestClient` and `FakeIoSocket`: `GameServer`'s `protected` constructor, `lobbies`, `httpServer`, `authenticateSocketAsync` and `handleSocketConnectionAsync` | The harness itself is the main consumer of these members (see *What the harness depends on in production* in the Handoff) | re-wire the three helpers to whatever replaces them; the behaviour specs should not change |

*Retired by the account-auth PR:* `ChatPermissions`'s legacy-mute and chat-disabled fixtures no longer seed their state
through the client (they seed accounts in the fake DB), and the `as any` touches in `GameServerUserApi`, `GameServerTestGameSetups`
and `ChatPermissions` are gone; the ESLint rule keeps them from coming back. *Retired on 2026-11-05:* `GameServerMatchmaking`'s
mid-shutdown `pendingTaskCount` assertion counts from `harness.databaseTaskCount` instead of 0, so it holds with a database.

## CI structure

The suite is partitioned by a single property: **does the spec drive a `Game` through the
`integration()` harness?** That is what determines whether the undo suite is meaningful for it.

| Group | Config | Contents | Specs (2026-11-01) |
|---|---|---|---|
| Game | `jasmine-game.json` | cards, core, actions, gameSystems, scenarios | 9,012 |
| Non-game | `jasmine-nongame.json` | `server/{utils,gamenode,services,scripts}/**` | 677 |
| Everything | `jasmine.json` (what CI runs) | | 9,689 |

The two configs partition the suite exactly: 9,012 + 677 = 9,689, no spec lost or double-run. (Counted
by loading each config's specs through Jasmine's API with every spec filtered out, so no spec body executed and
the card suite was not run.)

**The boundary was not clean, and now is guarded.** The non-game config used to be a pair of directory globs, and #3011
added two non-game specs in new directories (`test/server/scripts/usernameBlockMigration.spec.ts` and
`test/server/services/DynamoDBInterfaceSchemas.spec.ts`), which fell into the *game* group and were re-run under the undo
job; `server/core/DiscordDispatcher.spec.ts` sat there too, for a class only `GameServer` and `Lobby` import. The account-auth
PR fixed both halves:

1. The non-game globs are `server/{utils,gamenode,services,scripts}/**`, mirrored as exclusions in `jasmine-game.json`,
   and `DiscordDispatcher` moved to `server/gamenode/` together with its spec (now `test/server/gamenode/lobby/`), so both
   stay under their `gamenode` directories. The two undo scripts now run `jasmine-game.json`.
2. `scripts/validateSpecs.ts` (`npm run validate-specs`, a step in the `validate-cards` CI job) fails the build if the two
   groups do not partition `jasmine.json` exactly, if a spec using the game `integration()` harness sits in a non-game
   directory, if a game-group spec that does *not* use it is not on the exemption list (today nine files: the seven
   `scenarios/undo/*` specs, which have their own harness, plus `GameObjectBaseInitialization` and `EventWindow`), or
   if an exemption no longer applies. It reads the source `.ts` tree, so it needs no build.

CI otherwise runs as before: `test` runs `test-parallel` against `jasmine.json` (everything, once), and `test-undo` runs
`test-parallel-undo`, now against `jasmine-game.json`, so the non-game specs no longer run a second time under the undo
harness, where they proved nothing. Splitting the jobs further is still **not urgent** (the non-game group is 7% of specs
and ~2 s). The intended split, when it becomes worthwhile: `test-parallel-game` and `test-parallel-nongame` as separate
jobs (both scripts already exist in `package.json`; no job uses them yet). Since #3038 CI takes its Node version from
`.tool-versions`.

**Path-based filtering was considered and rejected.** GitHub Actions supports it, but workflow-level
`paths` never reports its checks, which would block a repo using merge queues; and job-level gating
needs a `dorny/paths-filter` step whose filter list would have to enumerate engine paths, because
the coupling runs both ways. `DecklistFixtures` scans the live card catalogue and validates through
the real `DeckValidator`, so a card-data or legality change can break the server suite; and the Phase 1
work itself reached into `Game.ts` and `SimpleActionTimer.ts`. A hand-maintained path
list guarding that relationship would rot silently. Splitting by *what a spec needs* is stable;
splitting by *what changed* is not.

## Open findings

Behaviours found while building the suite. Statuses were re-verified against `main` on 2026-11-01 (by re-reading the code
paths; #8 also by enabling its pending spec); #8 and #9 were fixed by #3111, and #10 was added on 2026-11-05. Open items are **not fixed**; where a spec would belong, a `TODO` marks it.
Numbers are never reused or renumbered, so gaps in the numbering are expected.

1. **Lobby listing and cleanup around an owner who has not connected — open, needs a fix.** What `lobbiesWithOpenSeat()`
   and `hasConnectedPlayer()` treat as a connected player needs correcting for a lobby whose owner has not connected a
   socket. **Not fixed**, and no spec asserts the current behaviour: a `TODO` in `GameServerLobbyApi` marks the spec to add
   once it is.

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
   production, so the property-order sensitivity is latent rather than live. Re-verified on 2026-11-01: `gamesToWinMode` is
   still not enum-checked on either route.

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
   `QueueHandler` changes, and again on 2026-11-01 after #3031, which only added logging), so the scheduler's guard — and
   therefore `assertNoScheduledErrors()` — cannot see
   them. These are defensive at the method level and reachable from non-timer callers, so removing the inner
   catches is a behaviour change rather than a simplification; revisit when those paths get direct coverage.
   Related observation: the hourly cleanup only prunes `swuStatsTokenMapping`; `swuBaseTokenMapping` is never
   pruned (entries are replaced on next use, so the impact is a few small objects per linked user, but the
   existing cleanup spec cannot reveal it because it only exercises the SWUStats map).

8. **An account whose profile is missing can never sign in — fixed.** A token's provider identity linked to a user id
   with no profile used to fall through to a recreate step whose conditional OAuth-link write always failed, so the
   owner was refused on every attempt. `UserFactory.findOrCreateAccountAsync` now recreates the profile under the
   linked id (which also reattaches the account's other stored data), keeps the existing link, and does not look the
   account up by email. Covered in `AccountLogin`.

9. **A first sign-in with no email claim half-creates the account — fixed.** A token with no `email` claim, like one
   missing `provider`, `providerId` or `name`, is now refused before anything is written, and the OAuth link is
   written last so a failed creation can be retried. Covered in `CredentialVerification`. Whether an account with no
   email should instead be accepted remains a product decision.

10. **A lost account-creation race leaves the losing request's profile behind — open, new (2026-11-05).** When two
    processes create an account for one identity at the same moment, the one whose conditional OAuth-link write fails
    switches to the winner's account and deletes its own username link, but the profile it wrote stays in the profile
    table, although the code's comment says it drops what it wrote (the DB service has no profile delete today). Nothing
    links to the leftover profile, so it is not found by username, email or sign-in; the cost is one stray record per lost
    race. Within one process the race cannot happen, since #3111 shares concurrent creations. A `TODO` in
    `CredentialVerification`'s race spec says what to add once the profile is deleted.

*Also noticed, not findings:* three responses spell the success field `succeess` (`toggle-welcome-message`, and
`change-username`'s two success paths; the FE never reads it, so correcting it is free); and the three deck routes'
signed-in path currently answers 500 in the suite because the fake has no deck tables yet.

## Future test suites

After the connection-management suite is complete, the same harness should be extended to cover the areas
below. Several now have **service-level** coverage from #3011/#3014 (real services over an in-memory DB, no
HTTP); what is missing is the **route-level** half, which is gated on I-1. Each entry says what exists and what
is left. Dependencies refer to the infrastructure backlog.

- **Moderation.** *Done:* submitting and cancelling mod actions at service level
  (`ModActionSubmissionHandler`, `UsernameModerationFlow`, schema and migration specs); mute enforcement in
  chat for mod-action mutes (`ChatPermissions`, now over the fake DB and the real
  `ModActionService`); who may call each `/api/mod/*`, cosmetics and server-settings route, and what each role
  satisfies (`RouteAuthManifest`, `RoleAuthorization`). *Left:* what those routes *do* for a caller who is let in
  (`submit-action`, `cancel-action`, `find-user` beyond a lookup), moderation state reaching the client
  (`/api/get-user`; only the time left on a mod-action mute is covered, in `GameServerUserApi`), and the three "seen" acknowledgement routes. Needs only the fake DB, which exists now.
- **Reports** *(new)*. *Done:* the logged-in-only rule (`LobbyReports`). *Left:* the "disable reporting"
  moderator action from #2994 (**no tests at all**); the existing success spec runs without a mod service, so it never
  evaluates the restriction (see Merged since Phase 2.5); Discord delivery failure → `success: false`; and the
  `reportedBugs` counter and in-game alert after a successful bug report. Needs I-1 and I-2.
- **User account management.** *Done:* username-change eligibility, rate limiting, forced rename, the
  block-username-changes flow, `UsernameRules` (service level). *Left:* `change-username` and
  `get-change-username-info` routes, the profanity check on the route (`GameServer`), and
  `mustRequestUsernameChange` over HTTP. Needs I-1.
- **Linked stat-site accounts** *(new)*. SWUStats / SWUBase link and unlink: six routes. *Done:* who may call the
  two link routes (the shared secret and, since #3111, the session the FE server forwards) and that a right key refreshes the token
  with the site and stores it on the account (`ServiceCredentials`, over `FakeHttpClient` and the fake DB); the anonymous
  refusal of every route (`RouteAuthManifest`). *Left:* `unlink-*` and the `swustatsLink` / `swubaseLink` status routes for
  a signed-in caller, `swustats/decks`, and failure responses from the site. Handler-level coverage exists (Phase 2.5).
- **User settings and preferences.** *Done:* `PUT /api/user/preferences` (it acts on the authenticated caller, and a supplied
  target is ignored, since #2655), anonymous rejection and persistence, through the fake DB and, for development without
  DynamoDB, the in-memory store (`GameServerUserApi`, `DevelopmentUsers`); `muteChat` as it affects chat. *Left:* the other
  per-account game options (card image locale, timer visibility) and welcome / undo / timer popup acknowledgement.
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
