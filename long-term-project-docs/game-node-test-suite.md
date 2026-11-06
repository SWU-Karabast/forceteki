# Game Node Test Suite

Status: **in progress.** Phases 0–2.5 and the account-auth guards are merged to `main` and CI-gated (PRs #2934, #2961,
#2950, #3021 and #3117). What is left is the coverage the lobby / queue / connection refactor has to have before it starts,
the scenario builders that coverage needs, a few infrastructure seams and some cleanup.

This document is the plan: the current state, the decisions in force, the roadmap, and the reference material for working
on the suite. The working record (what each phase built, what the reviews found, how each merge by other contributors was
evaluated, the account-auth PR's stage-by-stage record, and the resolved findings) is in
[game-node-test-suite-history.md](game-node-test-suite-history.md). Read the [Handoff](#handoff-2026-11-05) first, then
the [Roadmap](#roadmap).

## Handoff (2026-11-05)

**Map of this document.** *Handoff* (state, merges, decisions, roadmap, working agreements, running the suite, what the
harness depends on, hazards) · *Why this exists* · *Design goals* · *Approach* · *Refactor readiness* (when the refactor can
start) · *Remaining work* (the detail behind each roadmap step) · *Test infrastructure backlog* · *Refactor-fragility
register* · *CI structure* · *Open findings* · *Future test suites*.

### State

The connection layer (`GameServer`, `Lobby`, `QueueHandler`) has a working integration harness and a CI-gated suite. A spec
starts a real `GameServer` in-process on a virtual clock, drives it through the same HTTP calls and socket handshake as
`forceteki-client` (`TestClient`), and asserts on what the client receives and on what the fakes for the outside world
(stats-site HTTP, DynamoDB) were called with. Measured on 2026-11-06 on `main` @ `c6c71e058` (#3117) with roadmap steps 1 to 3 applied (Node 26.13):

- **819 non-game specs** (`jasmine-nongame.json`): 0 failures, 0 pending; about 3.0 s serial, and clean in three runs under
  `--parallel=4 --random=true`.
- 9,153 game specs, so **9,972 in total**. The two configs partition the suite exactly (counted by loading each config with
  every spec filtered out, so no spec body runs and the card suites are not executed). For reference, the figures were
  677 / 9,012 / 9,689 on 2026-11-01 and 404 / 8,971 / 9,375 before #3021: widening the non-game globs moved 28 specs
  (`DiscordDispatcher`, `usernameBlockMigration`, `DynamoDBInterfaceSchemas`) out of the game group, #3111 added most of
  the non-game growth since, and card work has grown the game group.
- CI gates: `npx eslint --quiet`, `npm run validate-cards`, `npm run validate-specs`, `npm run test-parallel` and
  `npm run test-parallel-undo`.

*Covered:* the connection lifecycle over HTTP and socket (lobbies, queue and matchmaking, reconnect and grace-window removal,
multi-tab in a lobby), the anonymous-versus-logged-in rules (chat, reports, best-of-three and spectator gating at the HTTP
gate), the command allowlist, stats-site token flows at handler level, and authentication and authorisation for logged-in
accounts (credential verification, account creation and login, account resolution and the server's profile cache, roles,
service secrets, and a manifest that forces every HTTP route to declare who may call it). *Not covered:* about half the
branches of the socket connection path (see [Refactor readiness](#refactor-readiness)), the game-mode legal/illegal matrix
(production does not validate it yet), stats payloads, timers and the inactivity kick, best-of-three flow, spectator flows,
decks, and most moderation and account routes beyond who may call them. The [Roadmap](#roadmap) says where to begin.

### Core merges

The work landed on `main` as five squash merges, so the branch commits named in the history document no longer exist as
separate commits.

| PR | Commit | Merged | What it landed |
|---|---|---|---|
| #2934 | `63853b15be4d5c9f05328e28c03fcb76f946ba29` | 2026-10-02 | **Part 1.** Phase 0 (headless `GameServer`, `ServerTestHarness`, decklist fixtures) and Phase 1 (`IScheduler` / `RealScheduler`, `IGameNodeConfig`, `shutdownAsync()`, the two timer-leak fixes), with the pre-PR scheduler review fixes. The first 37 specs, and this document. |
| #2961 | `9a8730d12fc0e531e094081cdef651f21b80420f` | 2026-10-06 | **CI follow-up to part 1.** Deterministic lobby names (random text could trip the real profanity filter), application logging silenced during specs, and `RealScheduler` specs moved onto Jasmine's controlled timers instead of wall-clock waits. |
| #2950 | `b90d3958b92ea56b5b6f6744f5e552cff07212d0` | 2026-10-09 | **Part 2.** Phase 2 (the `IRawGameSocket` seam, `FakeIoSocket`, `TestClient`, `serverIntegration()`, `LobbyConnectionManagement`, `SocketIoDriftGuard`; the dead ack callback removed) and Phase 2.5 (`IHttpClient` / `FakeHttpClient` and the stats-handler specs), with the round-2 review fixes. |
| #3021 | `8ffb6130f0b126e681bfa40b08ff271ecb93c462` | 2026-10-17 | **Part 3.** The account-auth guards and suite guardrails: the fake DynamoDB and the scheduler seam on the DB-backed caches, harness options (`database`, `env`, `recordRoutes`), the auth specs and route-auth manifest, the spec-partition guard (`validate-specs`), helper hygiene, the `test/server/gamenode/` regrouping, the `as any` lint rule, "Writing a server spec" in `CLAUDE.md`, and the independent-review fixes. 58 files. |
| #3117 | `c6c71e058f6434956ef76960180f2ffb720a5004` | 2026-11-05 | **Part 4.** The follow-up to #3111: the harness database on by default, account time on the virtual clock (an optional clock on `UserFactory`), `harness.databaseTaskCount`, a de-duplication spec whose requests really overlap, socket identity read from `lobbystate`, open finding #10, the legacy-moderation specs removed, and this document and `CLAUDE.md` brought up to date. 25 files. |

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
| Command dispatch | Explicit allowlists (landed in #3014 by another contributor); the residual guards are roadmap step 4 | *Remaining work*, step 4 |
| Game-mode configurations | Wanted as Tier 1 (for example, Open is lobby-only and cannot be queued). Production does not validate them yet, so `validateMatchConfiguration` (Phase 3b) comes first | *Remaining work*, step 4; Open finding #3 |
| Dead ack callback | Removed from production, with the drift spec that watched it, rather than characterised | history, Phase 2 |
| Stats sites | An `IHttpClient` seam and handler-level specs now; game-result payloads are roadmap step 5 | history, Phase 2.5 |
| Test-only interfaces | Migrate to production only once Phase 3 starts. `IMatchConfiguration` was replaced by the production `IQueueFormatKey` in #3021; `ITestUserPayload` is still test-only | history |
| Moving socket handling out of `GameServer` | **Not yet.** Only the auth slice (`IRawGameSocket`, `SocketData`, `ISocketAuthResult`, `authenticateSocketAsync`, `runSocketAuthMiddlewareAsync`; about 90 lines) is isolated. `onConnectionAsync` (about 180 lines when assessed), `handleSocketConnectionAsync` and the disconnect paths are entangled with `lobbies`, `userLobbyMap`, `queue` and the matchmaking-penalty map, so a real extraction is the lobby / queue / connection refactor this suite exists to make safe. It starts when *Refactor readiness* is met | *Refactor readiness* |
| Refactor start | When every row of the *Refactor readiness* checklist is covered, or waived there with a reason, and a coverage run of the non-game group finds no unlisted gap in those paths | *Refactor readiness* |
| Order of work | By what the refactor will move: the builders the gate scenarios need, then the gate scenarios, then the readiness check, then everything else. Work that waits on a product decision runs alongside instead of holding up the line | *Roadmap* |
| Dead and unreachable code | Removed in one dedicated pass (roadmap step 8), never inside a test change. A checklist row the API cannot reach is waived and added to that pass's list. The inactivity kick is a dead feature to remove (decided 2026-11-06) | *Remaining work*, step 8 |
| Plan and record | This document holds only what is current. The record of finished work is the history document, which gains a section for each merge evaluated and is otherwise not edited | the history document |
| CI | No path-based filtering. A game / non-game job split is wanted eventually (undo mode is meaningless for the non-game group) but is not urgent; `validate-specs` keeps the two groups honest | *CI structure* |
| Account-auth PR shape | One PR, a vertical slice of the auth suite, the scheduler seam included. Findings were to be characterised rather than fixed; the next two rows replaced that | history, the account-auth PR |
| Specs never assert wrong behaviour | A spec that exposes wrong behaviour is not written: leave a `TODO` (and a pending spec when the intended behaviour is clear) and record the finding | `CLAUDE.md`, *Open findings* |
| Nothing exploitable is written down | Report it privately to the maintainers; describe it nowhere in this repository (specs, comments, `CLAUDE.md`, this document or its history). Gaps in the *Open findings* numbering are deliberate | `CLAUDE.md` |
| Spec layout | Area folders under `test/server/gamenode/` (`auth/authentication`, `auth/authorization`, `lobby`, `matchmaking`, `account`, `harness`), grouped by subject rather than mirroring `server/`; no automated check against a spec landing directly under `gamenode/` | history, the account-auth PR |
| Harness database | **On by default** (since 2026-11-05). `{ database: false }` is the local-dev configuration, used only by specs whose subject it is: the no-database block of `ServerTestHarness`, `Development preferences without DynamoDB` and the local-dev describe of `GameServerTestGameSetups` | *Hazards*, I-12 |
| Account time | On the virtual clock. `TestGameServer` hands the server a `UserFactory` whose profile cache and own time reads use `TestScheduler.now()`; production's defaults read `Date.now()`. JWT expiry stays on the wall clock | history, the 2026-11-05 evaluation |
| Profile cache staleness | Recorded as #3111's design: a profile written outside this process (another node, an admin edit, a migration) is seen within the 4 h lifetime; identity links are held until evicted, so re-pointing one needs a restart; every writer in this process discards the cached copy (only the login timestamp is left stale, and nothing reads it from the cache) | history, the 2026-11-05 evaluation |
| Quick-lobby countdown | Imported from production (`Lobby.QuickLobbyCountdownMs`), not copied; the 20 s grace, 60 s stale-lobby and 20 s matchmaking-penalty values stay literal in specs so that changing one fails a test | I-7 |

### Roadmap

The order follows what the lobby / queue / connection refactor will move. Coverage of those paths is the gate the refactor
waits on, so it comes first, preceded by the builders it needs; everything else follows. Work that waits on a product
decision runs alongside rather than holding up the line. *Remaining work* has the detail for each step.

1. **Scenario builders — ✅ done (2026-11-06).** `harness.openLobbyAsync`, `createLobbyWithGuestAsync` and
   `startLiveGameAsync`; `TestClient.concedeAsync` to end a game; one typed `TestClient` method per command the real client
   sends; and the `lobbyChat` / `gameChat` accessors (backlog I-4 and I-6). The history document records what was built.
2. **Refactor-gate scenarios — ✅ done (2026-11-06).** Every gap row of the *Refactor readiness* checklist is now covered,
   waived with a reason, or held for a production change being decided with the maintainers. The history document records
   what was built and what the specs found, including open finding #11.
3. **Readiness check — ✅ run (2026-11-06); not yet met.** The coverage run found more gaps, now covered, and two that wait
   on fixes. Rows C1, C11, L2 and C21 are held for production fixes being decided with the maintainers, and C22 waits on open
   finding #12. The refactor can start once those land with their specs, or the maintainers waive them; the behaviour specs
   are then its safety net, and the fragility register lists the specs that will need rewriting with it.
4. **Alongside, from now: the protocol surface.** Phase 3b (`validateMatchConfiguration` and the game-mode matrix) as soon as
   the response for each illegal combination is decided (open finding #3); then the Phase 3a guards: export the allowlists, a
   consistency check, an FE-contract manifest that covers the HTTP sign-in sequence as well as the socket commands, and a
   positive spec per command. Neither blocks the refactor.
5. **Stats.** Deck tables in the fake DB for `DeckService`, then the SWUStats / SWUBase game-result payloads through
   `FakeHttpClient` and the internal `statsSubmitNotification` payloads. A game ends with `TestClient.concedeAsync`.
6. **Seams: I-2 (Discord) and I-3 (deck fetchers).** I-2 unblocks the report scenarios and retires the last `as any`; I-3,
   with the deck tables from step 5, unblocks the deck suite.
7. **Tier 2 remainder:** spectator flows beyond the connection, deck gates, discovery filtering, lobby-name validation,
   maintenance mode on `spectate-game`, and checks of what the public read-only routes return.
8. **Dead-code removal.** One dedicated pass over the production code the specs found unreachable or no longer used: the
   inactivity kick (a dead feature, to be removed: open finding #11), the branches the readiness checklist waives as
   unreachable, and legacy profile moderation. *Remaining work* has the list.
9. **Housekeeping:** I-12 (only the `database: false` specs share the store), the I-7 time helpers, the formal
   parallel-safety review, and splitting the CI jobs when it is worth it.
10. **Future suites** (moderation and account routes beyond who may call them, linked stat-site accounts, best-of-three
    flow, game-timer behaviour, cosmetics, resilience): the last section.

Open findings that still need a production fix are #1, #3, #6, #10, #12 and the open half of #11. Anything exploitable is
tracked privately with the maintainers, not here.

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
  the raw socket directly; open finding #12 is one.
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
has its own 819-spec suite — but coverage is uneven (deep on matchmaking, chat, identity and authentication;
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

**Coverage run, 2026-11-06** (roadmap step 3; `main` @ `c6c71e058` with steps 1 to 3 applied). Command, over a fresh
build: `npx --yes c8@latest --reporter=json --reporter=text-summary --report-dir=<dir> npm run jasmine-nongame`. The JSON
report maps back to the `.ts` sources. Statement lines covered: `GameServer.ts` 2,656 of 3,526, `Lobby.ts` 1,836 of 2,703,
`QueueHandler.ts` 504 of 520, and all 197 of `MatchmakingRules.ts`. Every uncovered line in the paths above was then
sorted:

- *Gaps, now covered:* a spectator leaving, by a manual disconnect or by staying away past the grace window, and kept
  inside it (rows D7, D8); a spectator listed in the players' lobby state and kept up to date as the game goes on (C8);
  `spectate-game` refusing a player still active in a lobby (B3); `join-lobby` refusing a full lobby (B8); and a player
  whose lobby closed before their socket arrived, who gets a 404 from `change-deck` and may start somewhere else (B7, B9).
- *Gaps that wait on a fix:* rows C21 (held, V-4) and C22 (open finding #12).
- *Outside the refactor's paths*, left to their steps: deck checks in `change-deck`, `create-lobby` and `enter-queue` and at
  game start (step 7); the card-pool and other configuration checks, and a game message sent before any game (step 4);
  best-of-three, rematch and sideboarding flows, stats, error handling and reports (steps 5 and 10).
- *Defensive catch blocks and logging*, waived as a class: route catch-alls that hand an unexpected error to Express,
  `try` / `catch` blocks that log a fault and carry on (matchmaking a pair, requeueing, a disconnect, a game message), and
  the slow-command logs. None runs without a fault in production code; fault-injection specs for the ones that matter
  belong with the resilience suite.
- *Unreachable:* candidates for step 8, listed there.

**Result: not yet met.** Every row is covered or waived except C1 and C11 (held, V-2), L2 (held, V-3), C21 (held, V-4) and
C22 (open finding #12). The refactor waits on those production fixes, each landing with its spec, or on the maintainers
waiving a row; then the run is repeated.

*Status as of 2026-11-06, after roadmap step 3: from the specs that cover each row, checked against the coverage run
above.* Besides **covered**, a row is **waived**, with the reason given, or **held**: it waits on a production
change being decided with the maintainers, and closes when that change lands with its spec (the `V-` reference is to
their private tracking). A row waived as unreachable is also on the list for roadmap step 8, dead-code removal.

**Socket connection (`onConnectionAsync`), in branch order.**

| # | Branch | What the client sees | Status |
|---|---|---|---|
| C1 | `query.lobby` missing or not JSON (`JSON.parse` of `Helpers.getSingleOrThrow`) | the handler throws before routing the socket; `handleSocketConnectionAsync` logs it | held (V-2) |
| C2 | an anonymous socket presents a logged-in user's id | `connection_error`, then disconnect | covered (`AnonymousIdentity`) |
| C3 | a logged-in socket finds an anonymous registration on its id | the impostor is evicted | covered (`AnonymousIdentity`) |
| C4 | spectator, anonymous, while `allowAnonymousSpectators` is false | disconnect | covered (`SpectatorConnections`). On the wire it cannot be told apart from C5: with the gate on, no anonymous user can register to spectate |
| C5 | spectator who is not registered as one | disconnect | covered (`SpectatorConnections`) |
| C6 | spectator whose lobby is gone or has no game running | mapping removed, disconnect | covered (`SpectatorConnections`) |
| C7 | spectator in a lobby that does not allow spectators | mapping removed, disconnect | covered (`SpectatorConnections`) |
| C8 | spectator admitted, including a second tab | the spectator's game state | covered (`SpectatorConnections`), including updates as the game goes on and the spectator's place in the players' lobby state |
| C9 | mapped user whose role is not Player | disconnect | covered (`SocketConnectionRouting`: a registered spectator connecting as a player) |
| C10 | mapped user whose lobby is gone | `connection_error: 'Lobby does not exist'` | covered (`SocketConnectionRouting`) |
| C11 | mapped user whose lobby filled meanwhile (the `join-lobby` race) | `connection_error: 'Lobby is full'` | covered for what the joiner is told and that the seat is forgotten (`SocketConnectionRouting`); otherwise held (V-2) |
| C12 | mapped user, `addLobbyUserAsync` throws | `connection_error: 'Error connecting to lobby'` | covered (`SocketConnectionRouting`) |
| C13 | mapped user joins, reconnects or opens a second tab | `lobbystate`; the old socket is disconnected | covered in a lobby (`LobbyConnectionManagement`) and in a game (`InGameConnections`). A mapped user is taken back to their lobby even when the socket carries another lobby's link (`SocketConnectionRouting`) |
| C14 | mapped user in a quick lobby, after a refresh | the requeue listener is registered again | covered (`GameServerMatchmaking`, the post-game requeue specs that refresh first) |
| C15 | link to a lobby that does not exist, is full or is in game | silent disconnect | covered (`SocketConnectionRouting`) |
| C16 | link while `canUserJoinNewLobby` refuses | disconnect | covered (`QuickLobbyCountdown`: a player under the matchmaking penalty). Because of C13, only a user the server has no lobby for reaches this branch |
| C17 | link to a public best-of-three lobby, anonymously | `connection_error` | covered (`SocketConnectionRouting`; the `join-lobby` call site in `GameServerAnonymousRestrictions`) |
| C18 | link admitted | `lobbystate`, mapping set | covered (`LobbyConnectionManagement`, the private lobby) |
| C19 | queued player connects, replacing any older socket | matchmaking runs | covered (`GameServerMatchmaking`, search lifecycle) |
| C20 | none of the above | `connection_error: 'Connection error, please try again'` | covered (`GameServerMatchmaking`, `SocketIoDriftGuard`) |
| C21 | an event the `Socket` wrapper (`server/socket.js`) handles itself rather than passing to the lobby | - | held (V-4) |
| C22 | spectator admitted between the games of a rematch | `lobbystate` | gap: open finding #12 (a `TODO` in `SpectatorConnections`) |

The branch for a socket with no user is left out: the auth middleware never lets one through, so it is on the step 8 list. A non-JSON `query.user`
fails earlier, in that middleware, with `Authentication error` (covered, `SocketConnectionRouting`).

**Disconnects (`onSocketDisconnected`, `handleIntentionalDisconnect`).**

| # | Branch | Status |
|---|---|---|
| D1 | manual disconnect: queue entry and mapping removed, the lobby cleaned up if empty | covered (`LobbyConnectionManagement`; the clean-up in `LobbyLifecycle`) |
| D2 | abrupt drop in a lobby: removed after the 20 s grace | covered (`LobbyConnectionManagement`; the last player's, with the clean-up, in `LobbyLifecycle`) |
| D3 | abrupt drop, then a reconnect inside the grace window: the seat is kept | covered (`InGameConnections` in a lobby; `GameServerMatchmaking` for the queue) |
| D4 | abrupt drop in a live game: state re-sent on reconnect; grace expiry ends the game with `PlayerLeft` | covered (`InGameConnections`) |
| D5 | queued player drops: removed after the 3 s grace unless reconnected | covered (`GameServerMatchmaking`) |
| D6 | matched player drops during the countdown: `matchmakingFailed`, the opponent requeued, the 20 s penalty recorded | covered (`GameServerMatchmaking`, `QuickLobbyCountdown`) |
| D7 | a spectator leaves: removed, and the players' lobby state updated | covered (`SpectatorConnections`) |
| D8 | a spectator drops: kept inside the 20 s grace window, removed after it | covered (`SpectatorConnections`, at the boundary) |

**Bookkeeping (`canUserJoinNewLobby`, used by `create-lobby`, `join-lobby`, `enter-queue` and links; `requeueUser`).**

| # | Branch | Status |
|---|---|---|
| B1 | anonymous claims on a logged-in user's id evicted or refused | covered (`AnonymousIdentity`) |
| B2 | the matchmaking penalty: refused under 20 s, cleared after | covered (`QuickLobbyCountdown`: `enter-queue` at the boundary; `create-lobby`, `join-lobby` and a link inside it) |
| B3 | still a Player in another lobby and active within 60 s: refused | covered (`GameServerLobbyApi` for `create-lobby`, `LobbyLifecycle` for `join-lobby` and `enter-queue`, `SpectatorConnections` for `spectate-game`). A link does not reach this check for a mapped user (C13) |
| B4 | stale (60 s or more, or never active): evicted from the old lobby, which is cleaned up if empty | covered (`LobbyLifecycle`, both cases and the boundary) |
| B5 | already queued: removed from the queue | covered (`LobbyLifecycle`) |
| B6 | `requeueUser`: refused in maintenance mode or without a deck; otherwise leaves the old lobby and queues | covered for maintenance mode (`QuickLobbyCountdown`) and the success path (`GameServerMatchmaking`). The refusal without a deck is waived: every queued and matched player has a deck, so it cannot be reached through the API (to be removed, step 8) |
| B7 | down for a lobby that no longer exists: the entry is dropped and the call goes ahead | covered (`LobbyLifecycle`) |
| B8 | `join-lobby` for a lobby whose two seats are taken: `400 Lobby is full` | covered (`GameServerLobbyApi`) |
| B9 | `change-deck` for a lobby that has closed: `404 Lobby not found` | covered (`LobbyLifecycle`) |

**Lobby lifecycle the server drives.**

| # | Behaviour | Status |
|---|---|---|
| L1 | ownership: the creator owns the lobby, it passes to the remaining user, and the fallback in `addLobbyUserAsync` | covered for the creator and the hand-over (`LobbyLifecycle`). The fallback is waived: the server only drops an owner's lobby entry together with their seat, and dropping the seat hands ownership over, so no API sequence reaches it (to be removed, step 8) |
| L2 | the quick-lobby countdown: the text sequence, a start only when both players are connected, and `removeLobby` with a requeue when neither connects | covered for the sequence and for waiting until both are connected (`QuickLobbyCountdown`); the removal branch is held (V-3) |
| L3 | the `Lobby timed out` path after 5 users have left and 5 minutes have passed | covered (`LobbyLifecycle`) |
| L4 | the inactivity kick (`inactiveDisconnect`, then a forced disconnect that the disconnect handler skips) and `resetActionTimer` | waived: nothing reaches the kick any more, and it is a dead feature to remove (step 8). `resetActionTimer` does not reach the action timer either (open finding #11); a `TODO` in `InGameConnections` marks the specs to add if the timer is made to read player activity again |
| L5 | shutdown with a grace timer pending, and with a live game's action timers, counted from a baseline | covered (`GameServerScheduling`) |

## Remaining work

The detail behind each roadmap step. Each item notes the production behaviour verified when it was planned (mostly on
2026-10-15), so the spec author knows what to look for, and any infrastructure it needs.

### Step 1 — scenario builders ✅

Done on 2026-11-06; *Step 1 — scenario builders* in the history document records what was built and migrated. For a new
spec: `harness.openLobbyAsync`, `createLobbyWithGuestAsync`, `startLiveGameAsync` and `startQuickGameAsync` build the
setups; `TestClient` has one method per command the real client sends, and `concedeAsync` ends a game; `lobbyChat`,
`gameChat`, `lobbyChatFrom` and `gameChatFrom` read the chat.

### Step 2 — refactor-gate scenarios ✅

Done on 2026-11-06; *Step 2 — refactor-gate scenarios* in the history document records what was built, what the specs
found, and the plan the step followed. What is left of the checklist is in *Refactor readiness*: the held rows, and the
coverage run of step 3.

### Step 3 — readiness check ✅

Run on 2026-11-06. The result is under *Coverage run* in [Refactor readiness](#refactor-readiness), and *Step 3 — readiness
check* in the history document records how it went. Run it again, with the same command, once the held rows' fixes have
landed and before the refactor starts.

### Step 4 — protocol surface (Phase 3), alongside

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

### Step 5 — stats

**Stats** — a game is ended with `TestClient.concedeAsync`:

- External: SWUStats / SWUBase game-result payloads through `FakeHttpClient` (handler-level token flows
  are covered); `LoggedInOnly` / `SavedDecksOnly` skips. `DeckService` is DB-backed, so it also needs I-1.
- Internal: `statsSubmitNotification` payloads, including the repeated-send path
  (`Lobby.sendStatsMessageToUser`).

Deck tables in the fake DB come first (the deck routes' signed-in path answers 500 in the suite until they exist).

### Step 6 — seams

I-2 (Discord dispatcher) and I-3 (deck fetchers); see the backlog.

### Step 7 — Tier 2 remainder

Struck as covered or obsolete: matchmaking cooldown (covered), ack-less client (obsolete), command allowlist
enforcement (moved to Phase 3), and the fidelity suite (landed in Phase 2 as `SocketIoDriftGuard.spec.ts`).

Since the reorder, the handshake-failure, multi-tab and spectator-connection items are in step 2.

- **HTTP smoke coverage — no dependencies.** `GET /api/health`, `/api/ongoing-games`, `/api/all-leaders`,
  `/api/get-unimplemented` and `/api/test-game-setups` need no database. Only the route manifest requests them (to check who
  is let in); no spec asserts what they return. `/api/ongoing-games` is the substantive one (private games must be hidden).
- **Spectator flows** beyond the connection: the state a spectator joining mid-game receives, and retransmission. Start from
  `harness.startLiveGameAsync`.
- **Deck gates.** `change-deck` legality and the start-time deck-size check. (The identity gate on `change-deck`
  is covered by `AnonymousIdentity`; `TestClient.changeDeckAsync` already exists.)
- **Maintenance mode on `spectate-game`**, which is **not** gated. `create-lobby`, `join-lobby`, `enter-queue`,
  `start-test-game` and `requeueUser` are covered (`RoleAuthorization`, `GameServerTestGameSetups`, `QuickLobbyCountdown`).
- **Discovery filtering.** The remaining `lobbiesWithOpenSeat` filters (quick lobbies, in-game lobbies) and the listing of a
  lobby whose owner has not connected (Open finding #1; a `TODO` in `GameServerLobbyApi` marks the spec).
- **Lobby name validation.** Profanity and length rejections in `create-lobby`. No spec currently asserts that a
  name is *rejected* — the one profanity-related spec only checks that harness-generated names are accepted.

### Step 8 — dead-code removal

Production code the specs found unreachable or no longer used is removed in one dedicated pass, never inside a test change.
Each row the readiness checklist waives as unreachable adds to this list, and so does anything step 3's coverage run shows
can never run. Each removal is a production change: confirm the code is unreachable (the coverage run, a search for
callers, and forceteki-client for anything on the wire), remove it along with the checks that only guarded it, and keep the
suite green. It does not block the refactor, although doing it first leaves the refactor less code to move.

- **The inactivity kick** (a dead feature, to be removed: open finding #11): `Lobby.userTimeoutDisconnect`, the
  `userTimeoutDisconnect` field of the game configuration and its contract check (`GameInterfaces`, `Game`), the
  `inactiveDisconnect` event, and the `forceDisconnect` socket flag with `onSocketDisconnected`'s check for it. Check
  whether forceteki-client still listens for `inactiveDisconnect`. `resetActionTimer`'s special case in
  `Lobby.onGameMessage` goes too if #11's open half is settled that way.
- **The ownership fallback** in `Lobby.addLobbyUserAsync` (checklist row L1).
- **`requeueUser`'s refusal without a deck** (row B6), and the matching deck checks in `Lobby`'s requeue paths once they
  are confirmed unreachable too.
- **`onConnectionAsync`'s branch for a socket with no user**, which the auth middleware never lets through.
- **The commented-out anonymous-join block** in `onConnectionAsync`'s link branch.
- **Legacy profile moderation.** The database no longer holds any, and the code that still reads it
  (`processModerationAsync`, the expiry check in `resolveUserFromIdentityAsync`, and `setModerationSeenAsync` with its
  `set-moderation-seen` route, which then also leaves the route manifest) has had no specs since #3117.
- **Found by the step 3 coverage run** (candidates: confirm each before removing it):
  - `GameServer.createLobby`'s two throws for a missing user (every route passes one);
  - `authenticateSocketAsync`'s refusal of a user that is neither anonymous nor logged in;
  - `setupQueueSocketAsync`'s early return for a matched player with no socket, and its `requeue` registration (the
    listener `addLobbyUserAsync` registers is always there first);
  - `Lobby.createLobbyUser`'s branch for a user already in the lobby (it is only called on new lobbies);
  - `Lobby.addSpectator`'s branches for a player who connects as a spectator and for a socket already listening, and
    `addLobbyUserAsync`'s for a spectator who connects as a player (`onConnectionAsync` and `canUserJoinNewLobby` keep the
    two roles apart before either is reached);
  - `Lobby.setUserDisconnected`'s returns for a socket that is not the user's current one (a replaced socket loses its
    disconnect listener first);
  - `Lobby.handleMatchmakingDisconnect`'s returns for a lobby that is not a quick lobby, or that has a game;
  - the `Socket` wrapper's unused `joinChannel` and `leaveChannel`.

### Step 9 — housekeeping (formerly Phase 6)

- Decide whether to split the CI jobs. Not urgent: the non-game group is 7% of specs and ~2 s.
- Formal parallel-safety review. Informally sound (7 clean runs on `main`, 5 more with the account-auth PR, 3 more on `main` @
  `445792e61`, 3 more with #3117's database default; each harness binds its own ephemeral port with `exclusive: true`; card data is built once per worker). The
  module-level state I-1 was expected to add is now there — the `getDynamoDbServiceAsync` spy (`routeDatabaseThrough`), the
  Express route recorder and `process.env` overrides — and is torn down per spec: jasmine removes the spies, `overrideEnv`
  restores the environment on harness shutdown, and the harness fails if scheduled tasks outlive it. **The exception** is the
  development `InMemoryUserStore` that #2655 keeps in a module-level variable (`UserStore.ts`): nothing resets it, so the
  no-database server (only `database: false` specs, since the default flip) shares it across specs in a worker (I-12).
- I-12 and the I-7 time helpers; see the backlog.

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
| I-4 | Scenario builders | none | S | removes the hand-written lobby and game setups; the live-game and game-ending setups roadmap steps 2, 4, 5 and 7 need | ✅ done (2026-11-06) |
| I-5 | Typed inspection surface | `lobbies` `private` → `protected` | XS | retires 2 `as any` touches | ✅ done |
| I-6 | Typed client commands and chat accessors | none | S | Phase 3 positive coverage; retires `JSON.stringify` searches | ✅ done (2026-11-06) |
| I-7 | Time helpers | none | XS | readability of ~40 boundary assertions | open |
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
decided it is not worth gating changes on.

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
| `GameServerScheduling`: `harness.server.swuStatsTokenMapping` | Reads a public mutable field | acceptable; the hourly cleanup is the behaviour |
| `GameServerTestGameSetups`: `spyOn(Lobby.prototype, 'startTestGameAsync')` and `'cleanLobby'` | Forces a set-up failure and asserts the half-built lobby is discarded; depends on `Lobby`'s prototype and on `start-test-game` building the lobby before registering it | rewrite against whatever replaces `Lobby` set-up |
| `DevelopmentUsers`: `spyOn(UserStoreModule, 'getUserStoreAsync')` and direct `InMemoryUserStore` use | Couples to the user-store module layout and to `UserFactory` looking its store up once, at construction | moves with the user-store module |
| `AccountResolution`: read counts on `getUserIdByOAuthAsync` and `getUserProfileAsync` | Asserts how often the database is read, which is the profile cache's design (one read of each across requests and sockets; one reload after a save) | change with the cache design; what each request sees is asserted separately |
| `CredentialVerification`: the lost-race stub on `saveOAuthLinkAsync` | Simulates another process winning by writing the link inside the stub; depends on the OAuth link being the conditional write and coming last | rewrite if account creation's write order or its conflict signal changes |
| `CredentialVerification`: *makes a single account when asked more than once at the same time* | Holds `saveUserProfileAsync` and spies `getUserFactory().createUserFromTokenAsync` to see the requests arrive; depends on the profile being written before the link and on creation going through that method | rewrite against whatever owns account creation |
| `SocketConnectionRouting`: `spyOn(Lobby.prototype, 'addLobbyUserAsync').and.rejectWith(...)` | Forces a seat set-up failure (checklist row C12); depends on `onConnectionAsync` seating a mapped user through that method | rewrite against whatever replaces `Lobby` set-up |
| `LobbyLifecycle`, `GameServerTestGameSetups`, `GameServerMatchmaking`: reads of `testLobbies`, `lobbyCount`, `testLobbyFor` and `getUserLobbyId` | Check that the server let a closed lobby go, or find the lobbies `start-test-game` made, through the server's own lobby map (see the *Inspection surface* decision) | re-wire `TestGameServer`'s accessors to whatever holds lobbies after the refactor |
| `TestGameServer`, `TestClient` and `FakeIoSocket`: `GameServer`'s `protected` constructor, `lobbies`, `httpServer`, `authenticateSocketAsync` and `handleSocketConnectionAsync` | The harness itself is the main consumer of these members (see *What the harness depends on in production* in the Handoff) | re-wire the three helpers to whatever replaces them; the behaviour specs should not change |

*Retired by the account-auth PR:* `ChatPermissions`'s legacy-mute and chat-disabled fixtures no longer seed their state
through the client (they seed accounts in the fake DB), and the `as any` touches in `GameServerUserApi`, `GameServerTestGameSetups`
and `ChatPermissions` are gone; the ESLint rule keeps them from coming back. *Retired on 2026-11-05:* `GameServerMatchmaking`'s
mid-shutdown `pendingTaskCount` assertion counts from `harness.databaseTaskCount` instead of 0, so it holds with a database.

## CI structure

The suite is partitioned by a single property: **does the spec drive a `Game` through the
`integration()` harness?** That is what determines whether the undo suite is meaningful for it.

| Group | Config | Contents | Specs (2026-11-06) |
|---|---|---|---|
| Game | `jasmine-game.json` | cards, core, actions, gameSystems, scenarios | 9,153 |
| Non-game | `jasmine-nongame.json` | `server/{utils,gamenode,services,scripts}/**` | 819 |
| Everything | `jasmine.json` (what CI runs) | | 9,972 |

The two configs partition the suite exactly: 9,153 + 819 = 9,972, no spec lost or double-run. (Counted
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
re-verified against `main` on 2026-11-01 (by re-reading the code paths); #10 was added on 2026-11-05, and #11 and #12 on 2026-11-06.

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

6. **Three scheduled callbacks still swallow their own errors — open, unchanged** (`cleanupInvalidTokens`,
   `QueueHandler.cleanupPreviousMatchEntries`, `QueueHandler.sendHeartbeat`; re-read after #3001's heavy
   `QueueHandler` changes, and again on 2026-11-01 after #3031, which only added logging), so the scheduler's guard — and
   therefore `assertNoScheduledErrors()` — cannot see
   them. These are defensive at the method level and reachable from non-timer callers, so removing the inner
   catches is a behaviour change rather than a simplification; revisit when those paths get direct coverage.
   Related observation: the hourly cleanup only prunes `swuStatsTokenMapping`; `swuBaseTokenMapping` is never
   pruned (entries are replaced on next use, so the impact is a few small objects per linked user, but the
   existing cleanup spec cannot reveal it because it only exercises the SWUStats map).

10. **A lost account-creation race leaves the losing request's profile behind — open, new (2026-11-05).** When two
    processes create an account for one identity at the same moment, the one whose conditional OAuth-link write fails
    switches to the winner's account and deletes its own username link, but the profile it wrote stays in the profile
    table, although the code's comment says it drops what it wrote (the DB service has no profile delete today). Nothing
    links to the leftover profile, so it is not found by username, email or sign-in; the cost is one stray record per lost
    race. Within one process the race cannot happen, since #3111 shares concurrent creations. A `TODO` in
    `CredentialVerification`'s race spec says what to add once the profile is deleted.

11. **The inactivity kick and `resetActionTimer` no longer reach the action timer — open, new (2026-11-06).** Since the
    byoyomi timer (#2056), nothing calls the `userTimeoutDisconnect` callback a lobby hands its game, so
    `Lobby.userTimeoutDisconnect`, the `inactiveDisconnect` event, the `forceDisconnect` flag and the disconnect handler's
    check for it are unreachable; a player whose time runs out loses the game on timeout instead. And
    `GameActionTimer.shouldFireHandler` always returns true (the check that the player has not acted since the timer
    started is commented out, with a `TODO` about the initiative prompt), so a player's messages no longer hold the timer
    off. That includes `resetActionTimer`, which the client sends when the bug-report dialog opens and which
    `Lobby.onGameMessage` treats as having reset the timer. Established by reading the code. **Decided on 2026-11-06:**
    the inactivity kick is a dead feature, to be removed in roadmap step 8. Still open: whether the action timer should
    read player activity again (restoring the check, which would make `resetActionTimer` work) or `resetActionTimer`
    should go with the kick. A `TODO` in `InGameConnections` marks the specs to add if the check is restored.

12. **A spectator admitted between the games of a rematch is never sent the lobby — open, new (2026-11-06).** After a
    rematch is accepted the lobby has no game, so `Lobby.addSpectator` sends the spectator the lobby state through
    `sendLobbyStateToSpectator`, which calls the raw socket.io socket's `send` (`socket.socket.send('lobbystate', …)`) rather
    than the wrapper's. socket.io's `send` emits a `message` event carrying the arguments, so the client, which listens for
    `lobbystate`, receives nothing; under the fake transport, whose `IRawGameSocket` has no `send`, the call throws. The fix
    is the wrapper's `socket.send(...)`, which `sendGameStateToSpectator` already uses. Found by the step 3 coverage run; a
    `TODO` in `SpectatorConnections` describes the spec to add.

**Resolved** (the full entries are in the history document): #4, `this[command]` dispatch, resolved by #3014; #5, timers
nothing could cancel, resolved by #3001 (its regression lock is checklist row L5); #8, an account whose profile was missing
could never sign in, fixed by #3111; #9, a first sign-in with no email claim half-created the account, fixed by #3111
(whether an account with no email should be accepted is still a product decision).

*Also noticed, not findings:* three responses spell the success field `succeess` (`toggle-welcome-message`, and
`change-username`'s two success paths; the FE never reads it, so correcting it is free); and the three deck routes'
signed-in path currently answers 500 in the suite because the fake has no deck tables yet. A player under the matchmaking
penalty is refused with 403 `User is already in a lobby`, which only describes the stale-lobby refusal it shares a check with.

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
  evaluates the restriction (see *Merged since Phase 2.5* in the history document); Discord delivery failure → `success: false`; and the
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
  sent to the client. Start from `harness.startQuickGameAsync` or `startLiveGameAsync` with `premierBestOfThree`.
- **Game timer behaviour.** Open finding #11 comes first: the dead inactivity kick goes in roadmap step 8, and whether player activity should reach the action timer again is still to be decided. *Left
  here:* the byoyomi main/turn countdown, warning and danger thresholds, and `timeRemainingStatus` as sent to
  the client. Unblocked by the scheduler work in Phase 1.
- **Deck management.** Save / rename / delete / favourite routes, deck-link resolution across the supported
  sources, and validation failures surfaced to the client. Needs I-1 and I-3.
- **Cosmetics.** Entitlement checks and moderator/admin-gated management endpoints (five routes, none
  referenced). Needs I-1.
- **Spectator experience.** The connection branches are in roadmap step 2 and the remaining flows in step 7. *Left here:* mid-game join state, retransmission,
  and the spectator allowlist beyond `retransmitGameMessages`.
- **Reconnect and resilience.** Message retransmission gaps (`retransmitGameMessages`, allowlisted but
  untested), serialization failure handling, and error reporting to Discord. Needs I-2.
