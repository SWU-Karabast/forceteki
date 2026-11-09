# Game Node Test Suite

Status: **in progress.** Phases 0–2.5 and the account-auth guards are merged to `main` and CI-gated (PRs #2934, #2961,
#2950, #3021, #3117 and #3129). The remaining work is split by topic area (core server logic, game timers, stats and so on),
each taken through the same five steps, from planning to an independent review. The core area, which gates the lobby /
queue / connection refactor, is finished apart from four checklist rows held for security fixes. Game timers are done, apart from the client part of
open finding #11.

This document is the plan: the current state, the decisions in force, the roadmap, and the reference material for working
on the suite. The working record (what each phase built, what the reviews found, how each merge by other contributors was
evaluated, the account-auth PR's stage-by-stage record, and the resolved findings) is in
[game-node-test-suite-history.md](game-node-test-suite-history.md). Read the [Handoff](#handoff-2026-11-05) first, then
the [Roadmap](#roadmap).

## Handoff (2026-11-05)

**Map of this document.** *Handoff* (state, merges, decisions, roadmap, working agreements, running the suite, what the
harness depends on, hazards) · *Why this exists* · *Design goals* · *Approach* · *Refactor readiness* (core's definition of done) · *Topic areas* (each area's plan) · *Test infrastructure backlog* · *Refactor-fragility
register* · *CI structure* · *Open findings*.

### State

The connection layer (`GameServer`, `Lobby`, `QueueHandler`) has a working integration harness and a CI-gated suite. A spec
starts a real `GameServer` in-process on a virtual clock, drives it through the same HTTP calls and socket handshake as
`forceteki-client` (`TestClient`), and asserts on what the client receives and on what the fakes for the outside world
(stats-site HTTP, DynamoDB) were called with. Measured on 2026-11-09 on `ammayberry1/gameserver-timer-tests` with the game-timer area done (Node 26.13):

- **868 non-game specs** (`jasmine-nongame.json`): 0 failures, 0 pending; about 3.0 s serial, and clean in three runs under
  `--parallel=4 --random=true`.
- 9,246 game specs, so **10,114 in total**. The two configs partition the suite exactly (counted by loading each config with
  every spec filtered out, so no spec body runs and the card suites are not executed). For reference, the figures were
  677 / 9,012 / 9,689 on 2026-11-01 and 404 / 8,971 / 9,375 before #3021: widening the non-game globs moved 28 specs
  (`DiscordDispatcher`, `usernameBlockMigration`, `DynamoDBInterfaceSchemas`) out of the game group, #3111 added most of
  the non-game growth since, and card work has grown the game group.
- CI gates: `npx eslint --quiet`, `npm run validate-cards`, `npm run validate-specs`, `npm run test-parallel` and
  `npm run test-parallel-undo`.

*Covered:* the connection layer the refactor will move, branch by branch (see [Refactor readiness](#refactor-readiness)):
where a socket is routed, lobbies and their life, the queue and matchmaking, reconnects and grace windows in a lobby and in
a game, spectators, and shutdown; the action timer during a game (see [Game timers](#2-game-timers---done)); the
anonymous-versus-logged-in rules (chat, reports, best-of-three and spectator gating);
the command allowlist; stats-site token flows at handler level; and authentication and authorisation for logged-in accounts
(credential verification, account creation and login, account resolution and the server's profile cache, roles, service
secrets, and a manifest that forces every HTTP route to declare who may call it). *Not covered:* the game-mode
legal/illegal matrix (production does not validate it yet), stats payloads, the best-of-three and rematch flows,
spectator flows beyond the connection, decks, and most moderation and account routes beyond who may call them. The
[Roadmap](#roadmap) says where to begin.

### Core merges

The work landed on `main` as six squash merges, so the branch commits named in the history document no longer exist as
separate commits.

| PR | Commit | Merged | What it landed |
|---|---|---|---|
| #2934 | `63853b15be4d5c9f05328e28c03fcb76f946ba29` | 2026-10-02 | **Part 1.** Phase 0 (headless `GameServer`, `ServerTestHarness`, decklist fixtures) and Phase 1 (`IScheduler` / `RealScheduler`, `IGameNodeConfig`, `shutdownAsync()`, the two timer-leak fixes), with the pre-PR scheduler review fixes. The first 37 specs, and this document. |
| #2961 | `9a8730d12fc0e531e094081cdef651f21b80420f` | 2026-10-06 | **CI follow-up to part 1.** Deterministic lobby names (random text could trip the real profanity filter), application logging silenced during specs, and `RealScheduler` specs moved onto Jasmine's controlled timers instead of wall-clock waits. |
| #2950 | `b90d3958b92ea56b5b6f6744f5e552cff07212d0` | 2026-10-09 | **Part 2.** Phase 2 (the `IRawGameSocket` seam, `FakeIoSocket`, `TestClient`, `serverIntegration()`, `LobbyConnectionManagement`, `SocketIoDriftGuard`; the dead ack callback removed) and Phase 2.5 (`IHttpClient` / `FakeHttpClient` and the stats-handler specs), with the round-2 review fixes. |
| #3021 | `8ffb6130f0b126e681bfa40b08ff271ecb93c462` | 2026-10-17 | **Part 3.** The account-auth guards and suite guardrails: the fake DynamoDB and the scheduler seam on the DB-backed caches, harness options (`database`, `env`, `recordRoutes`), the auth specs and route-auth manifest, the spec-partition guard (`validate-specs`), helper hygiene, the `test/server/gamenode/` regrouping, the `as any` lint rule, "Writing a server spec" in `CLAUDE.md`, and the independent-review fixes. 58 files. |
| #3117 | `c6c71e058f6434956ef76960180f2ffb720a5004` | 2026-11-05 | **Part 4.** The follow-up to #3111: the harness database on by default, account time on the virtual clock (an optional clock on `UserFactory`), `harness.databaseTaskCount`, a de-duplication spec whose requests really overlap, socket identity read from `lobbystate`, open finding #10, the legacy-moderation specs removed, and this document and `CLAUDE.md` brought up to date. 25 files. |
| #3129 | `0746a81cbde9f9bb0c8e04d732436c31ca8ba454` | 2026-11-06 | **Part 5.** The core area's steps a to c: the scenario builders (`openLobbyAsync`, `createLobbyWithGuestAsync`, `startLiveGameAsync`, typed `TestClient` commands, chat accessors), the refactor-gate scenarios, the coupling clean-up (`hasNoPlaceAsync`), the readiness check, `FakeIoSocket`'s serialised emits, and the plan split by topic area. Core's steps d and e followed on `ammayberry1/gameserver-lobby-tests-6`. |

**Also on `main`, from other contributors.** Before #3021: #2994 (disable reporting), #3001 (matchmaking preference and
`SchedulerTaskScope`), #3011 (username moderation) and #3014 (command allowlists, anonymous-identity hardening, chat and report
rules), evaluated under [Merged since Phase 2.5](game-node-test-suite-history.md#merged-since-phase-25--evaluation-of-2026-10-15).
Between #3021 and #3117: #2655 (dev test accounts and an in-memory user store), #3031 (matchmaking logging) and #3038 (the Node
pin), evaluated under [Merged since the account-auth PR](game-node-test-suite-history.md#merged-since-the-account-auth-pr--evaluation-of-2026-11-01);
then #3110 (action-window menu commands checked against the buttons offered) and #3111 (account resolution, `create-user` and
the profile cache), evaluated under [Account resolution and the profile cache](game-node-test-suite-history.md#account-resolution-and-the-profile-cache--evaluation-of-2026-11-05).

### Decisions taken

| Topic | Decision | Where |
|---|---|---|
| Transport | Hybrid: an in-process fake transport that runs the *real* `io.use` middleware and `onConnectionAsync`, guarded by a few real `socket.io-client` specs that catch drift | *Approach*; history, Phase 2 |
| Production seams | Injected collaborators with production defaults (`IScheduler`, `IGameNodeConfig`, `IHttpClient`, an optional scheduler on the DB-backed caches, an optional clock on `UserFactory`). No test-only API on production classes: test construction lives in the `TestGameServer` subclass over `protected` members | *Design goals* 4 |
| Inspection surface | Specs assert what a client receives. Reading the server's own state (`testLobbies`, `lobbyCount`, `getUserLobbyId`, `pendingTaskCount`) is kept for what no client can see - resources the server holds, such as a closed lobby or a cancelled timer - and for set-ups whose ids never reach a client (`start-test-game`). Whether the server forgot a user is checked with `TestClient.hasNoPlaceAsync` | *Design goals* 2 |
| Lobby ids | `create-lobby` keeps not returning one (a deliberate anti-automation measure); the harness browses `available-lobbies` or joins by `connectionLink`, as the FE does | *Approach* |
| Command dispatch | Explicit allowlists (landed in #3014 by another contributor); the residual guards are in the protocol-surface area | *Topic areas* |
| Game-mode configurations | Wanted as Tier 1 (for example, Open is lobby-only and cannot be queued). Production does not validate them yet, so `validateMatchConfiguration` (Phase 3b) comes first | *Topic areas*, protocol surface; Open finding #3 |
| Dead ack callback | Removed from production, with the drift spec that watched it, rather than characterised | history, Phase 2 |
| Stats sites | An `IHttpClient` seam and handler-level specs now; game-result payloads are the stats area | history, Phase 2.5 |
| Test-only interfaces | Migrate to production only once Phase 3 starts. `IMatchConfiguration` was replaced by the production `IQueueFormatKey` in #3021; `ITestUserPayload` is still test-only | history |
| Moving socket handling out of `GameServer` | **Not yet.** Only the auth slice (`IRawGameSocket`, `SocketData`, `ISocketAuthResult`, `authenticateSocketAsync`, `runSocketAuthMiddlewareAsync`; about 90 lines) is isolated. `onConnectionAsync` (about 180 lines when assessed), `handleSocketConnectionAsync` and the disconnect paths are entangled with `lobbies`, `userLobbyMap`, `queue` and the matchmaking-penalty map, so a real extraction is the lobby / queue / connection refactor this suite exists to make safe. It starts when *Refactor readiness* is met | *Refactor readiness* |
| Refactor start | When every row of the *Refactor readiness* checklist is covered, or waived there with a reason, and a coverage run of the non-game group finds no unlisted gap in those paths | *Refactor readiness* |
| Topic areas | Since 2026-11-06 the remaining work is split by topic area, each taken through five steps: plan, set up, fill out the suite, resolve what it found, and finalise with an independent review. Areas follow their dependencies; game timers come straight after core | *Roadmap* |
| Fixing what the specs find | A production issue an area's specs find is fixed in that area's step d, as its own commit with the spec that was waiting on it, unless the owner says otherwise; never inside a test change. Security fixes are not part of step d: the owner makes them in dedicated commits, and each one found is called out to the owner for an acknowledgement | *Roadmap*, `CLAUDE.md` |
| Dead and unreachable code | Removed in the step d of the area it belongs to. A checklist row the API cannot reach is waived and goes on that area's list. An unreachable check that rejects or repairs a state other code maintains is kept as a safety net (core's step d, 2026-11-06); only code with no such purpose is removed. The inactivity kick is a dead feature to remove (decided 2026-11-06, game-timer area) | *Topic areas* |
| Plan and record | This document holds only what is current. The record of finished work is the history document, which gains a section for each merge evaluated and each area step finished, and is otherwise not edited | the history document |
| CI | No path-based filtering. A game / non-game job split is wanted eventually (undo mode is meaningless for the non-game group) but is not urgent; `validate-specs` keeps the two groups honest | *CI structure* |
| Account-auth PR shape | One PR, a vertical slice of the auth suite, the scheduler seam included. Findings were to be characterised rather than fixed; the next two rows replaced that | history, the account-auth PR |
| Specs never assert wrong behaviour | A spec that exposes wrong behaviour is not written: leave a `TODO` (and a pending spec when the intended behaviour is clear) and record the finding | `CLAUDE.md`, *Open findings* |
| Nothing exploitable is written down | Report it privately to the maintainers; describe it nowhere in this repository (specs, comments, `CLAUDE.md`, this document or its history). Gaps in the *Open findings* numbering are deliberate | `CLAUDE.md` |
| Spec layout | Area folders under `test/server/gamenode/` (`auth/authentication`, `auth/authorization`, `lobby`, `matchmaking`, `account`, `harness`), grouped by subject rather than mirroring `server/`; no automated check against a spec landing directly under `gamenode/` | history, the account-auth PR |
| Harness database | **On by default** (since 2026-11-05). `{ database: false }` is the local-dev configuration, used only by specs whose subject it is: the no-database block of `ServerTestHarness`, `Development preferences without DynamoDB` and the local-dev describe of `GameServerTestGameSetups` | *Hazards*, I-12 |
| Account time | On the virtual clock. `TestGameServer` hands the server a `UserFactory` whose profile cache and own time reads use `TestScheduler.now()`; production's defaults read `Date.now()`. JWT expiry stays on the wall clock | history, the 2026-11-05 evaluation |
| Profile cache staleness | Recorded as #3111's design: a profile written outside this process (another node, an admin edit, a migration) is seen within the 4 h lifetime; identity links are held until evicted, so re-pointing one needs a restart; every writer in this process discards the cached copy (only the login timestamp is left stale, and nothing reads it from the cache) | history, the 2026-11-05 evaluation |
| Quick-lobby countdown | Imported from production (`Lobby.QuickLobbyCountdownMs`), not copied; the 20 s grace, 60 s stale-lobby and 20 s matchmaking-penalty values stay literal in specs so that changing one fails a test, and so do the action timer's limits (`ActionTimerLimits`, since 2026-11-09) | I-7 |

### Roadmap

The remaining work is split by topic area, and each area goes through the same five steps:

- **a. Plan.** Investigate the area and write its plan under *Topic areas*: what it covers, what it depends on, and its
  definition of done (for core, the *Refactor readiness* checklist). Start by reading the maintainers' local security
  documents (the untracked `long-term-project-docs/*.local.md` files; a clone without them should ask the owner) for the
  findings and audit notes that touch the area, so its plan accounts for them. Tracked files refer to those only by `V-`
  number.
- **b. Set up.** The behaviour-neutral production seams the area needs to be testable, the test infrastructure for it, and a
  minimal set of "hello world" specs that prove the set-up works.
- **c. Fill out the suite**, as close to complete as the area allows, ending with a coverage run over the area's code.
- **d. Resolve what it found.** Discuss each production issue the specs found with the owner and, unless told otherwise, fix
  it as its own commit together with the spec that was waiting on it; remove the area's dead code; run the coverage check
  again. Security fixes are not part of this step: the owner makes them in dedicated commits, and each one found is called
  out to the owner, who acknowledges having seen it and planned for it.
- **e. Finalise.** A separate agent (Claude Opus 5.5 at extra-high effort) reviews the area's plan and changes: the definition
  of done, the suite's rules (assert on the wire, never assert wrong behaviour, nothing exploitable in the repository), the
  fragility register, and whether the area's test files are laid out intuitively or could be consolidated. Then the history
  document records the area.

The areas, in order. An area starts once the areas it depends on have finished step c; an area whose next step waits on a
product decision can run alongside the others. Areas 4, 5 and 13 were added on 2026-11-09, after a sweep of the server
code for anything the plan did not cover; the areas after protocol surface were renumbered.

| # | Area | Depends on | Status |
|---|---|---|---|
| 1 | **Core server logic:** connections, lobbies, the queue and matchmaking, spectators, and the harness itself | - | ✅ done (2026-11-06), apart from the held rows |
| 2 | **Game timers:** the action timer, its warnings and timeouts, and what a player's activity does to it | core | ✅ done (2026-11-09), apart from #11's client part |
| 3 | **Protocol surface:** the command allowlists and game-mode validation | core | step a; its step d waits on open finding #3 |
| 4 | **Undo in live games:** the undo policy each lobby runs, its limits, the confirmation flow over the wire, and undo past the end of a game | core; game timers | step a |
| 5 | **The database layer:** the real `DynamoDBService` against the fake every other spec uses, and the data migrations | core | step a |
| 6 | **Decks:** deck routes, deck-link resolution, and deck checks in lobbies and at game start | core; the database layer | step a |
| 7 | **Stats:** game results reported to Karabast, SWUStats and SWUBase | core; decks (the fake's deck tables) | step a |
| 8 | **Reports and moderation** | core | step a |
| 9 | **Best-of-three and rematch** | core; game timers | step a |
| 10 | **Accounts and settings** | core | step a; much is covered by the account-auth work |
| 11 | **Cosmetics** | core | step a |
| 12 | **Resilience:** error handling and reporting, retransmission, serialization failures | reports and moderation | step a |
| 13 | **Operations:** startup and configuration, metrics, the profiler, and the log format | core | step a |

Suite work that no single area owns (I-12, the CI split, the formal parallel-safety review) is listed under *Suite
infrastructure* and goes with the first area that needs it.

Open findings that still need a production fix or a decision are #1, #3, #10, #11 (its client part), #15 and #21;
each belongs to an area.
Anything exploitable is tracked privately with the maintainers, not here.

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
- **After pulling `main`.** If `tsc` fails in a file nobody touched, `node_modules` may be behind `package.json` (`npm ci`
  reinstalls from the lockfile); if the jasmine run stops on a card data hash mismatch, run `npm run get-cards`.
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
- **Production code that reaches past `IRawGameSocket`** (the raw socket.io socket behind the `Socket` wrapper) is not
  modelled by `FakeIoSocket`, so the call throws under the fake. A spec that fails that way has found production code using
  the raw socket directly; open finding #12 (since fixed) was one.
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
has its own 868-spec suite — but coverage is uneven (deep on matchmaking, chat, identity and authentication;
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

## Refactor readiness

The suite exists so that the lobby / queue / connection refactor can be done safely, so it needs a point at which coverage
is enough. The refactor moves `GameServer.onConnectionAsync` and the handshake around it, the disconnect paths, the
user-to-lobby bookkeeping (`userLobbyMap`, `canUserJoinNewLobby`, the matchmaking-penalty map, `requeueUser`) and the lobby
lifecycle the server drives. **The refactor can start when every row below is covered, or is waived here with a reason,
and a coverage run finds no unlisted gap in those paths.**

**How to measure.** A one-off run, not a CI gate: build once with `npm run test-nongame`, then
`npx c8 --reporter=text npm run jasmine-nongame` (`c8` is not a dependency; `npx` fetches it). Source maps are on in both
tsconfigs, so the report should be against the `.ts` files. Read the uncovered lines of `server/gamenode/GameServer.ts` and
`Lobby.ts` that fall in the paths below: each is either a row here or a row to add. Line coverage is the floor, not the
target. A line that runs without any spec asserting what the client then sees is still a gap.

**Coverage runs.** The first, at the end of core's step c (2026-11-06), found the gaps rows B7 to B9, C22, D7 and D8 were
added for, and sorted every other uncovered line: outside the refactor's paths, defensive catch blocks and logging (waived
as a class), or unreachable (core's step d). The history document records it in full.

**The current run: after core's step d (2026-11-06,** `main` @ `7fe6c797a` with step d applied**).** `GameServer.ts` 2,646 of 3,510
statement lines covered (it lost the removed dead code), `Lobby.ts` 1,909 of 2,703 (the rematch spec for C22 runs the rematch
path), `QueueHandler.ts` 508 of 520. The only uncovered lines left in the methods step d changed are the defensive checks it
kept and the cooldown-entry pruning, which no client can see. C22 is covered; C1, C11, L2 and C21 are still held, so the
result stands: not yet met.

*Status as of 2026-11-06, after core's step e: from the specs that cover each row, checked against the coverage runs
above.* Besides **covered**, a row is **waived**, with the reason given, or **held**: it waits on a production
change being decided with the maintainers, and closes when that change lands with its spec (the `V-` reference is to
their private tracking). A row waived as unreachable also goes on its area's dead-code list for step d.

**Socket connection (`onConnectionAsync`), in branch order.**

| # | Branch | What the client sees | Status |
|---|---|---|---|
| C1 | `query.lobby` missing or not JSON (`JSON.parse` of `Helpers.getSingleOrThrow`) | the handler throws before routing the socket; `handleSocketConnectionAsync` logs it | held (V-2) |
| C2 | an anonymous socket presents a logged-in user's id | `connection_error`, then disconnect | covered (`AnonymousIdentity`) |
| C3 | a logged-in socket finds an anonymous registration on its id | the impostor is evicted | covered (`AnonymousIdentity`) |
| C4 | spectator, anonymous, while `allowAnonymousSpectators` is false | disconnect | covered (`SpectatorConnections`). On the wire it cannot be told apart from C5: with the gate on, no anonymous user can register to spectate |
| C5 | spectator who is not registered as one | disconnect | covered (`SpectatorConnections`) |
| C6 | spectator whose lobby is gone or has no game running | mapping removed, disconnect | covered for a lobby that has gone (`SpectatorConnections`). "No game running" cannot happen once a lobby has had a game: `hasOngoingGame()` stays true between the games of a rematch (open finding #15) |
| C7 | spectator in a lobby that does not allow spectators | mapping removed, disconnect | covered (`SpectatorConnections`) |
| C8 | spectator admitted, including a second tab | the spectator's game state | covered (`SpectatorConnections`), including updates as the game goes on and the spectator's place in the players' lobby state |
| C9 | mapped user whose role is not Player | disconnect | covered (`SocketConnectionRouting`: a registered spectator connecting as a player) |
| C10 | mapped user whose lobby is gone | `connection_error: 'Lobby does not exist'` | covered (`SocketConnectionRouting`) |
| C11 | mapped user whose lobby filled meanwhile (the `join-lobby` race) | `connection_error: 'Lobby is full'` | covered for what the joiner is told and that the seat is forgotten (`SocketConnectionRouting`); otherwise held (V-2) |
| C12 | mapped user, `addLobbyUserAsync` throws | `connection_error: 'Error connecting to lobby'` | covered (`SocketConnectionRouting`) |
| C13 | mapped user joins, reconnects or opens a second tab | `lobbystate`; the old socket is disconnected | covered in a lobby (`LobbyConnectionManagement`) and in a game (`InGameConnections`). A mapped user is taken back to their lobby even when the socket carries another lobby's link (`SocketConnectionRouting`) |
| C14 | mapped user in a quick lobby, after a refresh | the requeue listener is registered again | covered (`QueueConnections`, the post-game requeue specs that refresh first) |
| C15 | link to a lobby that does not exist, is full or is in game | silent disconnect | covered (`SocketConnectionRouting`) |
| C16 | link while `canUserJoinNewLobby` refuses | disconnect | covered (`QuickLobbyCountdown`: a player under the matchmaking penalty). Because of C13, only a user the server has no lobby for reaches this branch |
| C17 | link to a public best-of-three lobby, anonymously | `connection_error` | covered (`SocketConnectionRouting`; the `join-lobby` call site in `GameServerAnonymousRestrictions`) |
| C18 | link admitted | `lobbystate`, mapping set | covered (`LobbyConnectionManagement`, the private lobby) |
| C19 | queued player connects, replacing any older socket | matchmaking runs | covered (`QueueConnections`) |
| C20 | none of the above | `connection_error: 'Connection error, please try again'` | covered (`GameServerMatchmaking`, `QueueConnections`, `SocketIoDriftGuard`) |
| C21 | an event the `Socket` wrapper (`server/socket.js`) handles itself rather than passing to the lobby | - | held (V-4) |
| C22 | spectator admitted between the games of a rematch | `lobbystate` | covered (`SpectatorConnections`; fixed in core's step d, finding #12). Whether a spectator should be admitted then at all is open finding #15 |

The branch for a socket with no user is left out: the auth middleware never lets one through; core's step d kept it as a defensive check. A non-JSON `query.user`
fails earlier, in that middleware, with `Authentication error` (covered, `SocketConnectionRouting`).

**Disconnects (`onSocketDisconnected`, `handleIntentionalDisconnect`).**

| # | Branch | Status |
|---|---|---|
| D1 | manual disconnect: queue entry and mapping removed, the lobby cleaned up if empty | covered (`LobbyConnectionManagement`; the clean-up in `LobbyLifecycle`; the queue entry in `QueueConnections`) |
| D2 | abrupt drop in a lobby: removed after the 20 s grace | covered (`LobbyConnectionManagement`; the last player's, with the clean-up, in `LobbyLifecycle`) |
| D3 | abrupt drop, then a reconnect inside the grace window: the seat is kept | covered (`LobbyConnectionManagement` in a lobby; `QueueConnections` for the queue) |
| D4 | abrupt drop in a live game: state re-sent on reconnect; grace expiry ends the game with `PlayerLeft` | covered (`InGameConnections`) |
| D5 | queued player drops: removed after the 3 s grace unless reconnected | covered (`QueueConnections`) |
| D6 | matched player drops during the countdown: `matchmakingFailed`, the opponent requeued, the 20 s penalty recorded | covered (`QueueConnections`, `QuickLobbyCountdown`) |
| D7 | a spectator leaves: removed, and the players' lobby state updated | covered (`SpectatorConnections`) |
| D8 | a spectator drops: kept inside the 20 s grace window, removed after it | covered (`SpectatorConnections`, at the boundary) |

**Bookkeeping (`canUserJoinNewLobby`, used by `create-lobby`, `join-lobby`, `enter-queue` and links; `requeueUser`).**

| # | Branch | Status |
|---|---|---|
| B1 | anonymous claims on a logged-in user's id evicted or refused | covered (`AnonymousIdentity`) |
| B2 | the matchmaking penalty: refused under 20 s, cleared after | covered (`QuickLobbyCountdown`: `enter-queue` at the boundary; `create-lobby`, `join-lobby` and a link inside it) |
| B3 | still a Player in another lobby and active within 60 s: refused | covered (`GameServerLobbyApi` for `create-lobby`, `LobbyLifecycle` for `join-lobby` and `enter-queue`, `SpectatorConnections` for `spectate-game`). A link does not reach this check for a mapped user (C13) |
| B4 | stale (60 s or more, or never active): evicted from the old lobby, which is cleaned up if empty, and taken out of the queue | covered (`LobbyLifecycle`, both cases and the boundary). The never-active case used to return early, skipping the eviction and the queue check (open finding #14, fixed in core's step e) |
| B5 | already queued: removed from the queue | covered (`LobbyLifecycle`) |
| B6 | `requeueUser`: refused in maintenance mode or without a deck; otherwise leaves the old lobby and queues | covered for maintenance mode (`QuickLobbyCountdown`) and the success path (`QueueConnections`). The refusal without a deck is waived: every queued and matched player has a deck, so it cannot be reached through the API (kept as a defensive check in core's step d) |
| B7 | down for a lobby that no longer exists: the entry is dropped and the call goes ahead | covered (`LobbyLifecycle`) |
| B8 | `join-lobby` for a lobby whose two seats are taken: `400 Lobby is full` | covered (`GameServerLobbyApi`) |
| B9 | `change-deck` for a lobby that has closed: `404 Lobby not found` | covered (`LobbyLifecycle`) |

**Lobby lifecycle the server drives.**

| # | Behaviour | Status |
|---|---|---|
| L1 | ownership: the creator owns the lobby, it passes to the remaining user, and the fallback in `addLobbyUserAsync` | covered for the creator and the hand-over (`LobbyLifecycle`). The fallback is waived: the server only drops an owner's lobby entry together with their seat, and dropping the seat hands ownership over, so no API sequence reaches it (kept as a defensive check in core's step d) |
| L2 | the quick-lobby countdown: the text sequence, a start only when both players are connected, and `removeLobby` with a requeue when neither connects | covered for the sequence and for waiting until both are connected (`QuickLobbyCountdown`); the removal branch is held (V-3) |
| L3 | the `Lobby timed out` path after 5 users have left and 5 minutes have passed | covered (`LobbyLifecycle`) |
| L4 | the inactivity kick (`inactiveDisconnect`, then a forced disconnect that the disconnect handler skips) and `resetActionTimer` | waived: nothing reaches the kick any more, and it is a dead feature to remove (the game-timer area's step d). `resetActionTimer` does not reach the action timer either, by design (open finding #11, decided 2026-11-08); the game-timer area's row T12 covers it |
| L5 | shutdown with a grace timer pending, and with a live game's action timers, counted from a baseline | covered (`GameServerScheduling`) |

## Topic areas

Each area's plan and status, in roadmap order. An item notes the production behaviour verified when it was planned (mostly
on 2026-10-15), so a spec author knows what to look for, and any infrastructure it needs.

### 1. Core server logic — ✅ done

Connections, lobbies, the queue and matchmaking, spectators, and the test harness itself.

- **a to c: ✅ done (2026-11-06)**, as roadmap steps 1 to 3 before the plan was split by area: the scenario builders, the
  refactor-gate scenarios and the readiness check, which the history document records. The definition of done is
  [Refactor readiness](#refactor-readiness). For a new spec, `harness.openLobbyAsync`, `createLobbyWithGuestAsync`,
  `startLiveGameAsync` and `startQuickGameAsync` build the set-ups; `TestClient` has one method per command the real client
  sends, `concedeAsync` ends a game, and `lobbyChat`, `gameChat`, `lobbyChatFrom` and `gameChatFrom` read the chat.
- **d: ✅ done (2026-11-06)**; the history document records it.
  - *Fixed*, each with the spec that was waiting on it: open finding #12 (a spectator admitted between rematch games is now
    sent the lobby state; checklist row C22 is covered), #6 (the three scheduled callbacks no longer catch their own errors,
    so the scheduler's guard logs them and the harness sees them; the hourly cleanup now prunes expired SWUBase tokens too),
    and #13, found during the step (a spectator was listed under their id rather than their username).
  - *Dead code removed:* the commented-out anonymous-join block in `onConnectionAsync`, `setupQueueSocketAsync`'s `requeue`
    registration (the listener `addLobbyUserAsync` registers was always there first), and the `Socket` wrapper's unused
    `joinChannel` and `leaveChannel`.
  - *Kept on purpose:* the unreachable branches that reject or repair a state other code maintains. These are the ownership
    fallback in `Lobby.addLobbyUserAsync` (row L1), the refusals without a deck in `requeueUser` and `Lobby`'s requeue paths
    (B6), `onConnectionAsync`'s branch for a socket with no user, `authenticateSocketAsync`'s refusal of a user that is
    neither anonymous nor logged in, `GameServer.createLobby`'s throws for a missing user, `setupQueueSocketAsync`'s return
    for a matched player with no socket, `Lobby.createLobbyUser`'s branch for a user already in the lobby, the role checks in
    `Lobby.addSpectator` and `addLobbyUserAsync`, `Lobby.setUserDisconnected`'s returns for a replaced socket,
    `Lobby.addSpectator`'s clearing of listeners a fresh socket never has, and `Lobby.handleMatchmakingDisconnect`'s early
    returns. Removing them would gain nothing and drop a safety net.
  - *Still held:* rows C1, C11, L2 and C21 wait on security fixes, which are not part of this step; their specs go in when
    those fixes land.
  - *The coverage run*, repeated: under *Refactor readiness*.
- **c, still open:** smaller items outside the refactor's gate.
  - **HTTP smoke coverage — no dependencies.** `GET /api/health`, `/api/ongoing-games`, `/api/all-leaders`,
    `/api/get-unimplemented` and `/api/test-game-setups` need no database. Only the route manifest requests them (to check
    who is let in); no spec asserts what they return. `/api/ongoing-games` is the substantive one (private games must be
    hidden).
  - **Spectator flows** beyond the connection: the state a spectator joining mid-game receives, and retransmission. Start
    from `harness.startLiveGameAsync`.
  - **Maintenance mode on `spectate-game`**, which is **not** gated (a product question: should it be?). `create-lobby`,
    `join-lobby`, `enter-queue`, `start-test-game` and `requeueUser` are covered (`RoleAuthorization`,
    `GameServerTestGameSetups`, `QuickLobbyCountdown`).
  - **Discovery filtering.** The remaining `lobbiesWithOpenSeat` filters (quick lobbies, in-game lobbies) and the listing of
    a lobby whose owner has not connected (Open finding #1; a `TODO` in `GameServerLobbyApi` marks the spec).
  - **Lobby settings.** `updateSetting`'s `allowSpectators` (the owner only, private lobbies only, announced in the chat)
    and its effect on `spectate-game`. The `requestUndo` setting is the undo area's.
  - **Lobby name validation.** Profanity and length rejections in `create-lobby`. No spec currently asserts that a name is
    *rejected*; the one profanity-related spec only checks that harness-generated names are accepted.
- **e: ✅ done (2026-11-06).** The independent review and the follow-up it led to are recorded in the history document: open
  findings #14 (fixed) and #15 (for the best-of-three and rematch area), more dead code removed, the null-token guard in
  the token cleanup, specs for the parts of #6 and D1 that were not pinned, the moves that made `QueueConnections` and
  `TestScheduler` their own files, and fixes to this document, the spec headers and the harness's documentation.
- **What remains:** the held rows (C1, C11, L2, C21), whose specs go in with their security fixes; the smaller step c items
  above; and, when the refactor starts, the specs the fragility register lists.

### 2. Game timers — ✅ done

The action timer during a game: the turn and main countdowns, the warning and danger thresholds, the timeout that ends a
game (a draw when both players are nearly out), the pauses, and what the client is sent; and what a player's activity
does to the timer. Depends only on core.

**What the code does** (read on 2026-11-08, with two throwaway probes, since deleted; updated for step d's changes):

- *Which games have timers.* Each player gets a `ByoyomiTimer` (`server/game/core/actionTimer/`) when the lobby's
  `useActionTimers` holds: a quick-match or public-lobby game, on a node with `actionTimersEnabled` on (off in development
  unless `USE_LOCAL_ACTION_TIMER` is set). Otherwise a `NoopActionTimer`, which reports no turn time, the full 120 s of
  main time and no running timer. Scripted test games (`start-test-game`) never have timers: `GameStateBuilder` builds them
  with a `NoopScheduler` and no timer option.
- *The two countdowns.* A `ByoyomiTimer` is two `GameActionTimer`s on the lobby's scheduler: a 20 s turn timer, and a
  120 s main timer, one budget for the whole game, which runs only once the turn time is spent. `UiPrompt.setPrompt`
  stops the timer of each player a prompt does not wait on, and starts (or, if paused, resumes) the timer of each player
  it does wait on whose timer is not running. So the turn time starts again when a player becomes active again, while
  consecutive prompts for a player who stays active share it. `ActionWindow` stops the active player's timer as each
  action starts, so every action starts with full turn time, and the regroup phase stops both players' timers before
  its resource step, so both start it with full turn time. Prompts built with `resetActionTimerOnComplete` (the
  initiative choice and the setup resource prompt) stop it when they complete.
- *What the client is sent.* The game state is pushed when the turn time runs out and at 30 s and 10 s of main time left;
  the two thresholds also add a chat alert. The client counts down between pushes. It reads `turnTimeRemainingSeconds`,
  `mainTimeRemainingSeconds` and `timerIsRunning` (`GameTimer.tsx`) and `timeRemainingStatus` (`TimerWarningIcon.tsx`)
  from each player's entry. `timeRemainingStatus` is derived: Warning or Danger only while main time is running and at or
  under the threshold.
- *Running out.* `Game.onGameTimerExpired` adds "Game ended due to … timing out" and ends the game for the opponent
  (`GameEndReason.Timeout`), or as a draw if the opponent's timer is counting down (running, or running out at that same
  moment) and they are 3 s or less from timing out, counting turn and main time (`ByoyomiTimer.TimeoutDrawMarginSeconds`,
  read before it stops their timer). In a best-of-three it first forfeits the set (`onBo3SetForfeit`), which is the
  best-of-three area's. A player with no main time left times out as soon as their turn time is gone, and a timer that has
  run out shows none left.
- *Pauses.* An undo request pauses the requester's timer while the opponent decides (`UndoConfirmationPrompt`), so the
  request gives no time back; the opponent can block requests after denying two. A cost-payment recovery rollback pauses
  the timer and resumes it (`Game.rollbackForCostPaymentRecovery`).
- *After the end.* `endGame` stops both timers, and `UiPrompt.startPlayerActionTimer` starts none while the game has
  ended, even if the players play on. Whether it has ended is game state, so an undo past the end lets the next prompt
  start them again. A stopped timer is off the clock even if its main time has run out. A game the lobby is done with
  is disposed of (`Lobby.replaceGame`, `Game.dispose`): its timers stop, it starts no new ones, and the lobby ignores a
  game that is no longer its own.

**The local security documents** (read 2026-11-08): V-29 and V-37 touch this area, and both were fixed in step d, by the
owner's decision. V-34's investigation could use the game driver this area builds. Nothing else in them concerns timers.

**Definition of done.** Every row below is covered, waived with a reason, or held; and a coverage run over
`server/game/core/actionTimer/` and the timer paths in `Game.ts`, `Player.ts`, `UiPrompt.ts`, `ActionWindow.ts`,
`UndoConfirmationPrompt.js` and `Lobby.ts` finds no unlisted gap. Every row is asserted on the wire: the timer fields in
each player's game state, the chat, and the winners.

| Row | Behaviour | Status |
|---|---|---|
| T1 | which games have timers: quick-match and public-lobby games with `actionTimersEnabled` on; not a private lobby, nor with the setting off (no running timer, full main time) | covered (`TimedGames`) |
| T2 | a player's turn time starts afresh when a prompt starts waiting on them, at each action, and for both players at the regroup phase's resource step (decided 2026-11-09); a player a prompt does not wait on has a stopped timer: the initiative choice (one player), the mulligan (both), an action, and a pass handing the timer over | covered (`ActionTimer`, *starting and stopping*) |
| T3 | the turn time running out starts the main time, and the game state is sent at that moment | covered (`ActionTimer`) |
| T4 | each new turn starts with full turn time; the main time keeps what is left, across actions, phases and rounds | covered (`ActionTimer`) |
| T5 | the warnings at 30 s and 10 s of main time: the status, the chat alert and a state push; the status clears once the player is no longer spending main time | covered (`ActionTimer`, *warnings*) |
| T6 | the main time running out: the opponent wins, with the timeout alert, and both timers stop | covered (`ActionTimer`, *running out*), for a waiting opponent and for one whose timer is running |
| T7 | the draw rule (decided 2026-11-08): when a player's main time runs out, the game is a draw if the opponent's timer is running and the opponent is 3 s or less from running out too, counting turn and main time; otherwise the opponent wins: a waiting opponent however little time they have, and a running one more than 3 s from timing out, counting their turn time | covered (`ActionTimer`, *running out*): a waiting opponent with 2 s of main time, and a running one either side of the 3 s margin. That the margin counts turn time is pinned in `ByoyomiTimer`'s unit spec, since without cards both timers always start together |
| T8 | both players running out at the same moment is a draw, and a timer that has run out shows no main time left | covered (`ActionTimer`, *running out*; `ByoyomiTimer` for the reading at the same instant) |
| T9 | an undo request pauses the requester's timer while the opponent's runs; if the opponent denies it the requester resumes where they were, and if they allow it no time comes back (the main time spent stays spent) | covered (`ActionTimerPauses`) |
| T10 | a cost-payment recovery rollback pauses and resumes the timer | waived unless the scripted-game seam below is added: it needs a board on which a cost cannot be paid |
| T11 | the end of a game (won, conceded, or a draw on time) stops both timers; a game that has ended sends no timer updates and times no one out, even if the players play on; and if an undo takes the game back before its end, the timers pick back up (decided 2026-11-09), with a player whose main time had run out off the clock while they wait | covered: running out (`ActionTimer`); a concession, playing on, and an undo past the end, after a concession or a timeout (`TimedGames`, *the end of a game*) |
| T12 | a player's messages do not change their timer (by design, decided 2026-11-08): chat, a click the prompt does not take, an option toggle, the client's automatic messages, a reconnect, and `resetActionTimer` while the client still sends it | covered (`ActionTimerPauses`, *a player's messages*, with a click on the opponent's base; the reconnect in `TimedGames`) |
| T13 | a reconnect does not reset the timer; a spectator is sent the same timer fields, as they stand when the spectator joins | covered (`TimedGames`) |
| T14 | shutdown cancels a live game's timers | covered (`GameServerScheduling`, row L5) |
| T15 | timers of a game the lobby is done with | fixed in step d (V-29), with no spec, by the owner's decision (2026-11-09) |

**Steps.**

- **a: ✅ done (2026-11-08).** The owner decided the open half of #11 (a player's messages do not affect the timer, so the
  check and `resetActionTimer` go) and the draw rule for #16 (row T7).
- **b: ✅ done (2026-11-09).** No production seam was needed: `startLiveGameAsync` (a public lobby by default) and
  `startQuickGameAsync` give timed games under `{ config: { actionTimersEnabled: true } }`. The test side:
  - a game driver on `TestClient`: `prompt` (the player's own prompt), `hand`, `clickButtonAsync(text)` (which names the
    buttons a prompt does have when the one asked for is missing or disabled), and `timerOf(player)` (a player's timer
    fields as the client reads them), so that specs do not dig through raw game state;
  - `harness.playThroughSetupAsync(player1, player2)`: plays a started game through setup to its first action (the flip's
    winner takes the initiative, both keep their hands, each resources the first two cards in hand) and returns the
    active and the waiting player. Passing into the regroup phase is `clickButtonAsync('Pass')` from each;
  - I-7's boundary helper, `TestScheduler.advanceToDeadlineAsync(ms, { justBefore, atDeadline })`;
  - `test/helpers/server/ActionTimerLimits.ts`: the 20 s turn time, the 120 s main time and the 30 s and 10 s warnings,
    written out rather than imported from `ByoyomiTimer`, so that changing one fails a spec (as the grace windows are;
    see *Decisions taken*);
  - the new `test/server/gamenode/timers/` area (with its bullet in `CLAUDE.md`). `ActionTimer` has its first two specs
    (rows T2 and T3, in part); `ActionTimerPauses` (T9, T10, T12) and `TimedGames` (T1, T11, T13) come with step c. The
    builder's and the driver's own specs are in `ServerTestHarness` (*playing a game*), and the clock helper's in
    `TestScheduler`;
  - a fragility-register row for the driver.

  Considered, not planned: a seam that lets a scripted test game run on the lobby's scheduler with real timers. It would
  cover T10 and help V-34; add it in step c only if a row needs it.
- **c: ✅ done (2026-11-09).** 19 specs (835 → 854): `ActionTimer` filled out, and `ActionTimerPauses` and `TimedGames`
  added. Rows T7 (in part), T8 and T11 (in part) wait on open findings #16 and #18, each with a `TODO` where its specs
  belong. Each spec was checked against a deliberate break of the behaviour it pins (the state push when the turn time runs
  out, the pause on an undo request, the guard on a game that has ended). The step found open finding #18.
  *The coverage run* (2026-11-09, the same `c8` run as core's, over `server/game/core/actionTimer/` and the timer paths in
  `Game.ts`, `Player.ts`, `UiPrompt.ts`, `ActionWindow.ts`, `UndoConfirmationPrompt.js` and `Lobby.ts`) finds no
  unlisted gap. Every timer path in `UiPrompt` and `ActionWindow` runs. What does not:
  - *dead code* for step d: `Game.restartAllActionTimers` and the `restartIfRunning` methods; `timeRemainingSeconds` on
    `ByoyomiTimer` and `NoopActionTimer`, which nothing reads; and, with #11, `Player.checkPlayerTimeoutConditions`,
    `SimpleActionTimer`'s stop when `shouldFireHandler` refuses, and `Lobby.userTimeoutDisconnect`;
  - *waiting on a fix:* the draw in `onGameTimerExpired` and `endGame` (#16, rows T7 and T8);
  - *waived:* the pause in `rollbackForCostPaymentRecovery` (row T10); defensive returns (`SimpleActionTimer.pause` when
    not running and `resume` when not paused or already out, `ByoyomiTimer.start` pausing a main timer still running,
    `Player.onMainTimerWarning` given no alert, `NoopActionTimer`'s `pause` and `resume`);
  - *the best-of-three area's:* the set forfeit (`onBo3SetForfeit`) and what only the ready timer uses
    (`SimpleActionTimer.timeRemainingStatus` and its base `shouldFireHandler`).
- **d: ✅ done (2026-11-09)**; the history document records it. Each fix is its own commit, with the specs that were
  waiting on it, each run against the code before the change (and failing):
  - *Fixed:* #16 (the draw rule as decided, row T7; a timer that has run out shows none left, T8), #18 (no timer while the
    game has ended; the timers pick back up after an undo past the end, T11), and #17 with the server's part of #11 (the
    inactivity kick and the activity check are gone, with the tracking only the check used).
  - *Security fixes,* by the owner's decision: V-29 and V-37, each its own neutrally worded commit.
  - *Dead code removed:* `Game.restartAllActionTimers` and the `restartIfRunning` methods; `timeRemainingSeconds` on
    `IActionTimer`, `ByoyomiTimer` and `NoopActionTimer`; `totalTimeRemainingSeconds` (replaced by what the draw rule
    reads); and `SimpleActionTimer`'s `shouldFireHandler` hook, which only the activity check overrode.
  - *Still open:* #11's client part. forceteki-client stops sending `resetActionTimer` (the bug-report and player-report
    dialogs in `CurrentGameTab.tsx`) and drops its `inactiveDisconnect` handler, in one change (made on forceteki-client
    branch `ammayberry1/timer-cleanup`, 2026-11-09; it does not depend on the server's changes); once that has shipped,
    `Lobby.onGameMessage`'s no-op branch for `resetActionTimer` goes (until then, removing it would log an unknown-command
    warning for each one an older client sends).
  - *The coverage run*, repeated (2026-11-09): no unlisted gap. All of `GameActionTimer` and every timer path in
    `UiPrompt` run. What does not: V-29's guards in `Lobby` (no spec, by decision); defensive returns (as before, plus the
    guard in `sendTimerUpdatedGameStateToPlayers`, which no timer reaches any more, and `NoopActionTimer`'s
    `isCountingDown` and `msUntilTimeout`, which nothing reads for a timer that never runs out); the cost-payment pause
    (T10, waived); and the best-of-three area's paths. Added by the independent review: the guards in `Game` for a
    disposed game (V-29's too); fallbacks no case reaches (the `?? 0` in `msUntilTimeout` and `resumeMainTimer`,
    `timeRemainingMs`'s `null`, and the `?? MainTimeLimitSeconds` in `ByoyomiTimer.timeRemainingStatus`); `resume()`'s
    route into the timeout, which nothing reaches; and `UndoConfirmationPrompt`'s "Deny and Block Requests" branch, which
    is not a timer path. The warning handler's own state push is redundant (the alert pushes the state as well), which
    is why removing it fails no spec.
  - 854 → 861 non-game specs.
- **e: ✅ done (2026-11-09).** The independent review and the follow-up it led to are recorded in the history document:
  open findings #19 (fixed: a stopped timer whose main time had run out still counted as on the clock) and #20 (fixed, by
  the owner's decision: both players start the regroup phase's resource step with full turn time), #21 recorded for the
  best-of-three area, a game the lobby is done with starting no timers, a unit spec for the draw rule's turn time (with
  a behaviour-neutral seam), specs for what the review found unpinned, the layout of `TimedGames` and
  `ActionTimerPauses`, and fixes to this document and the history. 861 → 868 non-game specs.
- **What remains:** #11's client part (forceteki-client branch `ammayberry1/timer-cleanup`), then, once it has shipped,
  `Lobby.onGameMessage`'s no-op branch for `resetActionTimer`.
- **Not this area's:** the best-of-three ready and transition timers, and the set forfeit on a timeout (the best-of-three
  area).

### 3. Protocol surface — step a

**3b — `validateMatchConfiguration`: not started.** Add it mirroring the FE's `LobbyFormatConfigs` /
`QueueFormatConfigs`; see Open finding #3. Follow the house style `enter-queue` already uses for the new
preference field (`EnumHelpers.isEnumValue` → `400` with `Invalid <field> '<value>'`), and keep a
backward-compat spec for omitted fields the way the preference work does (`defaults an omitted preference…`).
`gamesToWinMode` is still the one field never enum-checked on either route.

**Game-mode configuration matrix.** Once 3b lands: one spec per legal and illegal combination on `create-lobby` and
`enter-queue`, asserting the response decided for it.

**3a — command allowlist: ✅ landed in #3014.** What remains is turning it from "implemented" into
"guarded", since an allowlist fails *silently* (an unrecognised command is just dropped):

- Export the three sets (`Lobby.allowedLobbyCommands` / `allowedGameCommands` /
  `allowedSpectatorCommands`, currently `private static`) so a spec can iterate them.
- **Consistency guard:** for every allowlisted name, assert the method exists on `Lobby.prototype` /
  `Game.prototype`. A rename today silently disables the command; nothing fails.
- **FE contract guard:** a checked-in manifest of what `forceteki-client` relies on, asserted against the server and used
  by `TestClient`. For the socket commands, the manifest lists the commands the FE sends, asserted to be a subset of the
  allowlists. This audit was done by hand on 2026-10-15 and found no gap (14 lobby + 8 game commands, including
  `reportScreenResolution` / `retransmitGameMessages`, which the FE sends as raw `emit('lobby', …)`, and `resetActionTimer`,
  which `onGameMessage` special-cases before the allowlist). For sign-in, it lists the HTTP sequence the FE runs and the
  responses it branches on (`get-user`, a 401 with `code: 'ACCOUNT_NOT_FOUND'`, then `create-user` and `get-user` again) and
  the handshake fields it sends (`auth.token`; `query.user` only when anonymous). #3111 and forceteki-client #875 changed
  all three together and `TestClient` was updated by hand, so nothing would have flagged a half-made change. The manifest
  needs a refresh step whenever the FE changes either surface; note that in the FE PR template.
- **Positive coverage:** 2 of the 22 allowlisted commands are asserted as accepted. Add one routed-and-effective
  assertion per command (a parameterised spec over the exported sets, using typed `TestClient` commands — I-6),
  plus the spectator allowlist (`retransmitGameMessages` accepted; everything else ignored). Since #3110 the game accepts an
  action-window menu command only while a matching button is offered, so each positive spec needs a game state in which its
  command is offered (`harness.startLiveGameAsync`).

### 4. Undo in live games — step a

How undo works through the server, as opposed to the engine's rules for which rollbacks need the opponent's approval
(`test/scenarios/undo`, on the engine harness). Starts from the game-timer area's driver (`playThroughSetupAsync`,
`quickUndoAsync`).

- **The policy each lobby runs:** request mode (`UndoMode.Request`) in public and quick lobbies, free undo in private
  ones; and the owner's `requestUndo` lobby setting (`Lobby.updateSetting`: the owner only, a boolean, announced in the
  chat).
- **Limits:** one free undo per game in request mode (`PerGameUndoLimit`), the "Deny and Block Requests" choice after two
  denials, and a blocked player's requests.
- **The confirmation flow over the wire:** the request, the opponent's prompt, allowing and denying, the chat lines, and
  what each client is shown of the undo it can make (`availableSnapshots`, the lobby state's `requestUndo`).
- **Undo past the end of a game:** the result recorded and then reverted (`Lobby.handleUndoGameEnd`), and the timers (the
  game-timer area's row T11). Open finding #21 is the best-of-three area's.
- The local security documents touch this area (V-7, V-34); step a starts from them.

### 5. The database layer — step a

Every server spec runs over `FakeDynamoDbService`, which re-implements each `DynamoDBService` method rather than wrapping
it. So nothing exercises the real service's item construction, keys, conditional writes, queries or paging, and nothing
would notice the fake drifting from it. On the real side only `DynamoDBInterfaceSchemas` has specs.

- **A contract suite:** one set of specs per service method, run against both the fake and the real `DynamoDBService`, as
  the socket.io drift guard does for the transport. Step a decides how the real one runs: with its document client
  replaced by a stub that answers from in-memory tables and records each command (no network), or against DynamoDB Local
  in CI.
- **Migrations:** the scripts in `scripts/migration` rewrite production data, and only `usernameBlockMigration` has a
  spec. Each gets one over the same set-up: what it changes, what it leaves alone, and that running it again changes
  nothing.
- The decks area builds on it (the deck tables it adds to the fake should match the real service); stats, accounts and
  settings, cosmetics, and reports and moderation, all database-backed, gain from it too.
- The local security documents touch this area (V-19, V-23, both fixed); step a starts from them.

### 6. Decks — step a

- **Deck tables in the fake DB** for `DeckService`. Until they exist, the deck routes' signed-in path answers 500 in the
  suite. The stats area needs them too.
- **I-3, the deck-fetcher seam** (see the backlog), which unblocks deck-link resolution.
- **Deck management.** Save / rename / delete / favourite routes, deck-link resolution across the supported
  sources, and validation failures surfaced to the client. Needs I-1 and I-3.
- **Deck gates.** `change-deck` legality and the start-time deck-size check. (The identity gate on `change-deck`
  is covered by `AnonymousIdentity`; `TestClient.changeDeckAsync` already exists.)
- The deck checks found by core's coverage run: `change-deck` refusing a deck that cannot be resolved or applied, and the
  deck resolution in `create-lobby` and `enter-queue`.

### 7. Stats — step a

**Stats** — a game is ended with `TestClient.concedeAsync`:

- External: SWUStats / SWUBase game-result payloads through `FakeHttpClient` (handler-level token flows
  are covered); `LoggedInOnly` / `SavedDecksOnly` skips. `DeckService` is DB-backed, so it also needs I-1.
- Internal: `statsSubmitNotification` payloads, including the repeated-send path
  (`Lobby.sendStatsMessageToUser`).
- SWUBase card metrics: the per-card play and attack statistics sent with each result (`GameStatisticsTracker`,
  `SwuBaseHandler.buildCardMetricsForPlayer`).

Deck tables in the fake DB come first (the deck routes' signed-in path answers 500 in the suite until they exist).

### 8. Reports and moderation — step a

- **I-2, the Discord dispatcher seam** (see the backlog), which unblocks the report scenarios and retires the suite's last
  `as any`.
- **Moderation.** *Done:* submitting and cancelling mod actions at service level
  (`ModActionSubmissionHandler`, `UsernameModerationFlow`, schema and migration specs); mute enforcement in
  chat for mod-action mutes (`ChatPermissions`, now over the fake DB and the real
  `ModActionService`); who may call each `/api/mod/*`, cosmetics and server-settings route, and what each role
  satisfies (`RouteAuthManifest`, `RoleAuthorization`). *Left:* what those routes *do* for a caller who is let in
  (`submit-action`, `cancel-action`, `find-user` beyond a lookup), moderation state reaching the client
  (`/api/get-user`; only the time left on a mod-action mute is covered, in `GameServerUserApi`), and the three "seen" acknowledgement routes. Needs only the fake DB, which exists now.
- **Reports** *(new)*. *Done:* the logged-in-only rule (`LobbyReports`). *Left:* the "disable reporting"
  moderator action from #2994 (**no tests at all**); the existing success spec runs without a mod service, so it never
  evaluates the restriction (see *Merged since Phase 2.5* in the history document); Discord delivery failure → `success: false`; and the
  `reportedBugs` counter and in-game alert after a successful bug report. Needs I-1 and I-2.

### 9. Best-of-three and rematch — step a

- **Best-of-three flow.** *Done:* only that `concedeBo3` and `proceedToNextBo3Game` are allowlisted and take
  effect. *Left:* set progression, the sideboarding window, ready timer, timeout paths, and `winHistory` as
  sent to the client. Start from `harness.startQuickGameAsync` or `startLiveGameAsync` with `premierBestOfThree`.
- **Rematch:** `requestRematch` and `rematch` in each mode, who chooses who goes first in the next game, and a quick lobby
  becoming a public one. Open finding #15 (what `hasOngoingGame` means between games) belongs here.

### 10. Accounts and settings — step a

- **User account management.** *Done:* username-change eligibility, rate limiting, forced rename, the
  block-username-changes flow, `UsernameRules` (service level). *Left:* `change-username` and
  `get-change-username-info` routes, the profanity check on the route (`GameServer`), and
  `mustRequestUsernameChange` over HTTP. Needs I-1.
- **The profanity filter** (`server/utils/profanityFilter/`: the term lists and the matcher) as a unit, beyond the
  username and lobby-name routes that call it (`userOrLobbyNameContainsProfanity`).
- **Linked stat-site accounts** *(new)*. SWUStats / SWUBase link and unlink: six routes. *Done:* who may call the
  two link routes (the shared secret and, since #3111, the session the FE server forwards) and that a right key refreshes the token
  with the site and stores it on the account (`ServiceCredentials`, over `FakeHttpClient` and the fake DB); the anonymous
  refusal of every route (`RouteAuthManifest`). *Left:* `unlink-*` and the `swustatsLink` / `swubaseLink` status routes for
  a signed-in caller, `swustats/decks`, and failure responses from the site. Handler-level coverage exists (Phase 2.5).
- **User settings and preferences.** *Done:* `PUT /api/user/preferences` (it acts on the authenticated caller, and a supplied
  target is ignored, since #2655), anonymous rejection and persistence, through the fake DB and, for development without
  DynamoDB, the in-memory store (`GameServerUserApi`, `DevelopmentUsers`); `muteChat` as it affects chat. *Left:* the other
  per-account game options (card image locale, timer visibility) and welcome / undo / timer popup acknowledgement.
- **Legacy profile moderation** is dead code for this area's step d. The database no longer holds any, and the code that still
  reads it (`processModerationAsync`, the expiry check in `resolveUserFromIdentityAsync`, and `setModerationSeenAsync` with
  its `set-moderation-seen` route, which then also leaves the route manifest) has had no specs since #3117.
- Open finding #10 (a lost account-creation race leaves a profile behind) belongs here.

### 11. Cosmetics — step a

- **Cosmetics.** Entitlement checks and moderator/admin-gated management endpoints (five routes, none
  referenced). Needs I-1.

### 12. Resilience — step a

- **Reconnect and resilience.** Message retransmission gaps (`retransmitGameMessages`, allowlisted but
  untested), serialization failure handling, and error reporting to Discord. Needs I-2.
- Fault-injection specs for the defensive catch blocks that matter; core's coverage run waived them as a class.

### 13. Operations — step a

Startup, configuration and observability: what fails quietly in production when it breaks.

- **Startup and configuration:** `server/env.ts` (the environment's checks and defaults) and `GameNodeConfig` (the
  per-environment switches, such as `actionTimersEnabled`), and the card-data hash check at startup. None has specs beyond
  what the harness sets up.
- **Metrics:** the periodic metrics `GameServer` logs as CloudWatch EMF lines when `metricsLoggingEnabled` is on
  (`GameServerMetrics`: event-loop delay, and game, player and spectator counts). The scheduler drives them, so the
  virtual clock can.
- **The profiler:** `POST /api/run-profile` (`server/utils/profiler.ts`), gated by `PROFILE_CAPTURE_SECRET`. Only the route
  manifest's entry covers it. The local security documents touch it (V-26).
- **The log format:** the structured logging (`server/logger.ts`, `LoggingConstants`) that alerts and dashboards read.
- Lower priority: the seeding scripts and `syncS3.ts`.

### Suite infrastructure

Work no single area owns, which goes with the first area that needs it.

- Decide whether to split the CI jobs. Not urgent: the non-game group is 7% of specs and ~2 s.
- Formal parallel-safety review. Informally sound (7 clean runs on `main`, 5 more with the account-auth PR, 3 more on `main` @
  `445792e61`, 3 more with #3117's database default; each harness binds its own ephemeral port with `exclusive: true`; card data is built once per worker). The
  module-level state I-1 was expected to add is now there — the `getDynamoDbServiceAsync` spy (`routeDatabaseThrough`), the
  Express route recorder and `process.env` overrides — and is torn down per spec: jasmine removes the spies, `overrideEnv`
  restores the environment on harness shutdown, and the harness fails if scheduled tasks outlive it. **The exception** is the
  development `InMemoryUserStore` that #2655 keeps in a module-level variable (`UserStore.ts`): nothing resets it, so the
  no-database server (only `database: false` specs, since the default flip) shares it across specs in a worker (I-12).
- I-12; see the backlog.

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
| I-4 | Scenario builders | none | S | removes the hand-written lobby and game setups; the live-game and game-ending setups the later areas need | ✅ done (2026-11-06) |
| I-5 | Typed inspection surface | `lobbies` `private` → `protected` | XS | retires 2 `as any` touches | ✅ done |
| I-6 | Typed client commands and chat accessors | none | S | Phase 3 positive coverage; retires `JSON.stringify` searches | ✅ done (2026-11-06) |
| I-7 | Time helpers | none | XS | readability of ~40 boundary assertions | the helper is done (2026-11-09, game timers' step b); converting the existing assertions is open |
| I-8 | Shared test config | none | XS | stops config drift between helpers and specs | ✅ done |
| I-9 | Helper hygiene | none | XS | dead code; one inconsistent spec | ✅ done |
| I-10 | Contributor guide | none | S | stops the reinvention seen below | ✅ done (`CLAUDE.md`) |
| I-11 | Fast loop script | `package.json` only | XS | server spec iteration without the card build | ✅ done (`test-nongame`) |
| I-12 | Per-harness user store for the no-database server | none (a test-side spy) | XS | order-independent specs for development without DynamoDB | open, narrowed to the `database: false` specs |

The write-ups of the finished items (I-1, I-4, I-5, I-6 and I-8 to I-11) and the backlog's original suggested order are in the history
document. The write-ups below are the open items.

**I-2 — Discord dispatcher seam.** *Evidence:* `LobbyReports.spec.ts` pulls the `Lobby` out of
`GameServer`'s private `lobbies` map and overwrites its private `discordDispatcher`. `DiscordDispatcher` already
`implements IDiscordDispatcher` but is constructed inline in `GameServer`, and it posts through a module-level
`httpPostFormData`, so `FakeHttpClient` cannot see it either. *Shape:* `IGameServerOptions.discordDispatcher`
(default `new DiscordDispatcher()`), threaded the way `httpClient` was, plus a recording `FakeDiscordDispatcher`.

**I-3 — Deck-fetcher HTTP seam.** `SwuDbDeckFetcher` and `MeleeDeckFetcher` still call the global `fetch` and use
a raw `setTimeout` to abort. Route both through `IHttpClient` and `IScheduler`, as Phase 2.5 anticipated. It is now
the largest remaining raw network path.

**I-7 — Time helpers.** 40 assertions use the "advance to T−1, assert not yet, advance 1, assert now" idiom
(`GameServerMatchmaking` 24, `QueueHandler` 16), and the same literals recur. Two optional improvements: a
boundary helper on `TestScheduler`, worth it mainly because Bo3 timers, action timers and grace windows will all
need the idiom; and named test-side constants for behaviour that is *not* matchmaking policy — the 20 s disconnect
grace, the 60 s stale-lobby rule, the 20 s matchmaking-disconnect penalty. Keep these in the tests rather than
importing them from production: if someone changes 20 s to 30 s, that is a behaviour change and the test *should*
fail. (Matchmaking's own literals are the behaviour spec and should stay literal.) The 6 s quick-lobby countdown is
the exception and is imported (`Lobby.QuickLobbyCountdownMs`): it is pacing rather than policy, and the maintainers
decided it is not worth gating changes on. *Status (2026-11-09):* the boundary helper exists
(`TestScheduler.advanceToDeadlineAsync`, added in the game-timer area's step b, which uses it first), and so do the action
timer's named constants (`ActionTimerLimits`). The existing 40 assertions have not been converted.

**I-12 — Isolate the no-database account store (new, from #2655).** *Evidence:* `server/utils/user/UserStore.ts` holds the
development `InMemoryUserStore` in a module-level variable that nothing resets, and every `UserFactory` asks
`getUserStoreAsync()` for it, so all harnesses built without `database` in one jasmine worker share one account store. It is
not a problem today, but any spec that signs in, saves preferences or renames an account leaves that behind for the next spec
in the worker, and with the parallel runner and random order the next spec is arbitrary. This was established by reading the
code, not by a failing spec. *Shape:* spy `getUserStoreAsync` in `TestGameServer.startAsync` when no database is given,
resolving to a fresh `InMemoryUserStore` per harness, the way `routeDatabaseThrough` does for `getDynamoDbServiceAsync` and
`DevelopmentUsers.spec.ts` already does for its own store. No production change. The alternative, flipping the harness
default to "database on" (see the trial under *As built* in the history document), removes the problem for every spec that does not opt out; the two
are complementary. *(The default flipped on 2026-11-05, so only the three `database: false` describes still share the
store.)*

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
| `GameServerScheduling`: `harness.server.swuStatsTokenMapping` and `swuBaseTokenMapping` | Reads public mutable fields | acceptable; the hourly cleanup is the behaviour |
| `GameServerTestGameSetups`: `spyOn(Lobby.prototype, 'startTestGameAsync')` and `'cleanLobby'` | Forces a set-up failure and asserts the half-built lobby is discarded; depends on `Lobby`'s prototype and on `start-test-game` building the lobby before registering it | rewrite against whatever replaces `Lobby` set-up |
| `DevelopmentUsers`: `spyOn(UserStoreModule, 'getUserStoreAsync')` and direct `InMemoryUserStore` use | Couples to the user-store module layout and to `UserFactory` looking its store up once, at construction | moves with the user-store module |
| `AccountResolution`: read counts on `getUserIdByOAuthAsync` and `getUserProfileAsync` | Asserts how often the database is read, which is the profile cache's design (one read of each across requests and sockets; one reload after a save) | change with the cache design; what each request sees is asserted separately |
| `CredentialVerification`: the lost-race stub on `saveOAuthLinkAsync` | Simulates another process winning by writing the link inside the stub; depends on the OAuth link being the conditional write and coming last | rewrite if account creation's write order or its conflict signal changes |
| `CredentialVerification`: *makes a single account when asked more than once at the same time* | Holds `saveUserProfileAsync` and spies `getUserFactory().createUserFromTokenAsync` to see the requests arrive; depends on the profile being written before the link and on creation going through that method | rewrite against whatever owns account creation |
| `SocketConnectionRouting`: `spyOn(Lobby.prototype, 'addLobbyUserAsync').and.rejectWith(...)` | Forces a seat set-up failure (checklist row C12); depends on `onConnectionAsync` seating a mapped user through that method | rewrite against whatever replaces `Lobby` set-up |
| `LobbyLifecycle`, `GameServerTestGameSetups`, `GameServerMatchmaking`: reads of `testLobbies`, `lobbyCount`, `testLobbyFor` and `getUserLobbyId` | Check that the server let a closed lobby go, or find the lobbies `start-test-game` made, through the server's own lobby map (see the *Inspection surface* decision) | re-wire `TestGameServer`'s accessors to whatever holds lobbies after the refactor |
| `GameServerScheduling`: `spyOn(harness.server.swuStatsHandler, 'isTokenValid').and.throwError(...)` | Forces the hourly token cleanup to fail, to show the scheduler reports it; depends on the cleanup calling the handler's `isTokenValid` | rewrite if the token cleanup moves |
| `QueueHandler` (unit spec) | Drives `QueueHandler`'s own methods (`addPlayer`, `findPlayer`, `getNextMatchPair`, `getNextMatchAvailableAt`) directly, and spies the raw socket's `emit` to make a heartbeat fail | rewrite against whatever replaces the queue; the server-level behaviour is in `GameServerMatchmaking` and `QueueConnections` |
| `GameServerMatchmaking` (*absolute retry scheduling*) and `GameServerScheduling` (the grace-timer shutdown check): exact `pendingTaskCount` deltas | Asserts how many timers the server keeps (one retry task, one announcement task, one grace timer), not only that shutdown leaves none | change with the timer design; the shutdown checks count from a baseline |
| `GameServerUserApi`, `ChatPermissions`: `harness.server.modActionService.onActionSubmitted(...)` | Applies a mod-action mute through the service rather than the `/api/mod/submit-action` route | use the route once the reports and moderation area covers it |
| `TestClient.hasNoPlaceAsync` (used across the core specs) | Recognises "the server has this user down for nothing" by the catch-all `connection_error` text (checklist row C20) | update the helper if that message or branch changes |
| `SpectatorConnections` (C22) and the C6 note: `Lobby.hasOngoingGame()` staying true between games | The rematch spectator spec reaches `spectate-game` only because a lobby between games counts as having one (open finding #15) | rewrite with #15's decision |
| `ServerTestHarness.playThroughSetupAsync` and `TestClient.clickButtonAsync` (the timer specs) | Plays setup by its prompts' types and button texts (`initiative`, 'Yourself', 'Keep', 'Confirm Resources', `actionWindow`), and resources the first two cards in hand; the specs click 'Pass', 'Skip Resourcing', 'Allow' and 'Deny' by their text too | update the builder if setup changes; it throws, naming the prompt it found, rather than failing a spec obscurely |
| `ActionTimerPauses` and `TimedGames`: the undo request | Raises the request with the client's quick undo (`TestClient.quickUndoAsync`) at the first action, which needs the opponent's approval because it would undo the setup; depends on the snapshot rules for when a quick undo needs approval, and on where it lands: the setup's resource step, which waits on both players (the undo specs expect both timers there, or the requester back on the main time it had) | make the request another way if those rules change; the spec checks the opponent was asked before anything else |
| `ActionTimer` (*running out*): how the draw cases are built | The margin and same-moment cases rely on the mulligan waiting on both players, so both timers start together after the initiative choice | rebuild the cases if that changes; each spec checks it reached the mulligan |
| `ByoyomiTimer` (unit spec) | Builds the timer directly on a `TestScheduler`, through the narrow `IActionTimerPlayer` / `IActionTimerGame` types, to pin what no game without cards reaches | keep it while those types stay narrow; a card-driven wire spec could replace it |
| `TestGameServer`, `TestClient` and `FakeIoSocket`: `GameServer`'s `protected` constructor, `lobbies`, `httpServer`, `authenticateSocketAsync` and `handleSocketConnectionAsync` | The harness itself is the main consumer of these members (see *What the harness depends on in production* in the Handoff) | re-wire the three helpers to whatever replaces them; the behaviour specs should not change |

*Retired by the account-auth PR:* `ChatPermissions`'s legacy-mute and chat-disabled fixtures no longer seed their state
through the client (they seed accounts in the fake DB), and the `as any` touches in `GameServerUserApi`, `GameServerTestGameSetups`
and `ChatPermissions` are gone; the ESLint rule keeps them from coming back. *Retired on 2026-11-05:* `GameServerMatchmaking`'s
mid-shutdown `pendingTaskCount` assertion counts from `harness.databaseTaskCount` instead of 0, so it holds with a database.

## CI structure

The suite is partitioned by a single property: **does the spec drive a `Game` through the
`integration()` harness?** That is what determines whether the undo suite is meaningful for it.

| Group | Config | Contents | Specs (2026-11-09) |
|---|---|---|---|
| Game | `jasmine-game.json` | cards, core, actions, gameSystems, scenarios | 9,246 |
| Non-game | `jasmine-nongame.json` | `server/{utils,gamenode,services,scripts}/**` | 868 |
| Everything | `jasmine.json` (what CI runs) | | 10,114 |

The two configs partition the suite exactly: 9,246 + 868 = 10,114, no spec lost or double-run. (Counted
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

Behaviours found while building the suite that are still open. Open items are **not fixed**; where a spec would belong, a
`TODO` marks it. Numbers are never reused or renumbered, so gaps in the numbering are expected. Statuses were last
re-verified against `main` on 2026-11-01 (by re-reading the code paths); #10 was added on 2026-11-05, #11 and #12 on 2026-11-06, and #13 to #15 on 2026-11-06 (#13 and #14 were fixed the same day); #16 and #17 on 2026-11-08, and #18 to #21 on 2026-11-09 (#19
and #20 were fixed the same day).

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

10. **A lost account-creation race leaves the losing request's profile behind — open, new (2026-11-05).** When two
    processes create an account for one identity at the same moment, the one whose conditional OAuth-link write fails
    switches to the winner's account and deletes its own username link, but the profile it wrote stays in the profile
    table, although the code's comment says it drops what it wrote (the DB service has no profile delete today). Nothing
    links to the leftover profile, so it is not found by username, email or sign-in; the cost is one stray record per lost
    race. Within one process the race cannot happen, since #3111 shares concurrent creations. A `TODO` in
    `CredentialVerification`'s race spec says what to add once the profile is deleted.

11. **The inactivity kick and `resetActionTimer` no longer reach the action timer — open: fixed on the server
    (2026-11-09), the client's part to do.** Since the byoyomi timer (#2056), nothing calls the `userTimeoutDisconnect` callback a lobby hands its game, so
    `Lobby.userTimeoutDisconnect`, the `inactiveDisconnect` event, the `forceDisconnect` flag and the disconnect handler's
    check for it are unreachable; a player whose time runs out loses the game on timeout instead. And
    `GameActionTimer.shouldFireHandler` always returns true (the check that the player has not acted since the timer
    started is commented out, with a `TODO` about the initiative prompt), so a player's messages no longer hold the timer
    off. That includes `resetActionTimer`, which the client sends when the bug-report dialog opens and which
    `Lobby.onGameMessage` treats as having reset the timer. Established by reading the code. **Decided on 2026-11-06:**
    the inactivity kick is a dead feature, to be removed in the game-timer area's step d. **Decided on 2026-11-08:** a
    player's messages are meant not to affect the action timer, so the commented-out check, the tracking only it uses and
    `resetActionTimer` are removed too, in the same step (the area's plan lists them). The game-timer area's step a found
    that the check, as written, could not simply be restored in any case: when it fails it stops the timer outright rather
    than starting it again, and it fails once the player has sent any message since the timer started, chat included.
    The tracking it relies on is also what logs #17. Row T12 covers the decided behaviour. **Fixed on the server in the
    game-timer area's step d (2026-11-09):** the kick, the check and its tracking are gone (the history document lists
    them). What remains is the client's part: forceteki-client stops sending `resetActionTimer` and drops its
    `inactiveDisconnect` handler (made on its branch `ammayberry1/timer-cleanup`, 2026-11-09), then, once that has
    shipped, the server's no-op branch for `resetActionTimer` goes.

15. **`Lobby.hasOngoingGame()` means "a game has ever started" — open, new (2026-11-06).** It is `game !== undefined`, and
    `rematch()` and the best-of-three transition set `game = null`, so between the games of a rematch or a set the lobby
    still counts as having a game running: it is left off the open-seat list, a link to it is refused, and a spectator can be
    registered and admitted (who is then sent `gameOngoing: false`). Whether that is the meaning wanted is for the
    best-of-three and rematch area's step a. Checklist rows C6 and C22 depend on it, and the fragility register lists them.
    Found by the independent review of core.

21. **An undo past the end of a game leaves it marked finished — open, new (2026-11-09).** `Game.finishedAt` is a plain
    field that `endGame` sets and a rollback does not restore, so after an undo past the end a game that goes on still
    reads as finished. `Lobby.proceedToNextBo3Game` checks only that, so in a best-of-three, if both players confirm moving
    on, the set goes to the next game with no result recorded for this one; `concedeBo3ByUserId` and the lobby's other
    reads of `finishedAt` see the same. It needs both players. For the best-of-three and rematch area. Found by the
    game-timer area's independent review.

**Resolved** (the full entries are in the history document): #4, `this[command]` dispatch, resolved by #3014; #5, timers
nothing could cancel, resolved by #3001 (its regression lock is checklist row L5); #8, an account whose profile was missing
could never sign in, fixed by #3111; #9, a first sign-in with no email claim half-created the account, fixed by #3111
(whether an account with no email should be accepted is still a product decision); #6, three scheduled callbacks that
swallowed their own errors, #12, a spectator admitted between rematch games never sent the lobby, and #13, a spectator
listed under their id, all fixed in core's step d (2026-11-06); #14, a player who joined a lobby but never connected kept
their place in it when they entered the queue, fixed in core's step e (2026-11-06); and #16, a timeout's draw did not
follow the intended rule, #17, every timed game logged two errors as it started, and #18, a game that had ended started
its timers again, all fixed in the game-timer area's step d (2026-11-09); #19, a stopped timer whose main time had run
out still counted as on the clock, and #20, the last player to pass started the regroup phase's resource step without
fresh turn time, fixed in the game-timer area's step e (2026-11-09).

*Also noticed, not findings:* three responses spell the success field `succeess` (`toggle-welcome-message`, and
`change-username`'s two success paths; the FE never reads it, so correcting it is free); and the three deck routes'
signed-in path currently answers 500 in the suite because the fake has no deck tables yet. A player under the matchmaking
penalty is refused with 403 `User is already in a lobby`, which only describes the stale-lobby refusal it shares a check with.

