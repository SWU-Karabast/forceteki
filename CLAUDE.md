# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Forceteki is the **server-side** implementation of the Star Wars Unlimited rules engine plus the node server (lobbies, matchmaking, decks, accounts) that hosts games. The web client lives in a separate repo (forceteki-client). The architecture is inherited from Ringteki/Throneteki (L5R), so some terminology and patterns come from there.

Node 22.x. TypeScript, CommonJS, compiled with `tsc` into `build/` and run from there — nothing runs from source.

## Commands

```bash
npm install
npm run get-cards          # downloads card data into test/json/ (gitignored); required before build/test
npm run check-card-data    # offline: is test/json/ current for this checkout? exit 1 = run get-cards
npm run build              # tsc -> build/server
npm run dev                # builds (server + tests) and starts the game node on port 9500
npm run lint               # eslint --quiet   (lint-fix / lint-verbose also available)
npm run validate-cards     # structural checks on card impls + their test files (CI gate)
npm run validate-specs     # every spec sits in the jasmine group (game / non-game) its harness belongs to (CI gate)
npm test                   # full build + whole jasmine suite
npm run test-fast          # skips the full rebuild path; still recompiles server+test via test/tsconfig.json
npm run test-nongame       # fast build + only the connection-layer / services / utils specs, serial (seconds)
npm run test-parallel      # 4 workers; on failure it may only name the suite — re-run with `npm test` for details
npm run test-undo          # runs every test twice with a snapshot rollback in between (see Undo below)
```

**Check the card data before you build, test or start the server, and again after switching branches or pulling.** The cached `test/json/` belongs to whichever branch last ran `get-cards`, and a branch that changes `card-data-version.txt`, `scripts/fetchdata.js` or `scripts/mockdata.js` expects different data. `npm run check-card-data` compares the two without downloading anything; when it exits 1, run `npm run get-cards` first. Otherwise the run stops partway with `Card data hash mismatch ... please run 'npm run get-cards'`.

### Running a single test

Jasmine's positional file argument is resolved **relative to cwd against the compiled output**, so it must be a `build/test/...` path ending in `.spec.js`, not the `test/...` source path:

```bash
npm run test-fast build/test/server/cards/01_SOR/bases/Tarkintown.spec.js
```

(The README's `npm test test/server/.../X.spec.js` form is stale — all specs are `.ts` now and that glob matches nothing, silently reporting "No specs found".)

To filter by describe/it name instead, re-run jasmine alone against the existing build: `npm run jasmine -- --filter="Tarkintown"`. (A `--filter=` passed to `npm test`/`npm run test-fast` is swallowed by npm as a config flag and silently runs the whole suite; only positional paths get forwarded.)

If you hit `Importing card class with repeated id!`, delete `build/` and rebuild — stale card output.

### CI gates (`.github/workflows/pullrequest.yml`)

`npx eslint --quiet`, `npm run validate-cards`, `npm run validate-specs`, `npm run test-parallel`, `npm run test-parallel-undo`.

## Architecture

### Layers

- `server/gamenode/` — express + socket.io entrypoint. `GameServer.ts` owns the HTTP API (`/api/*`), auth middleware, and the socket layer; `Lobby.ts` owns one lobby/game and routes player input into the engine. `QueueHandler`/`MatchmakingRules` handle matchmaking.
- `server/game/core/` — the rules engine. `Game.ts` is the root object; `GamePipeline.ts` runs a stack of nested windows/steps (`gameSteps/`, `AbilityResolver`, `ActionWindow`, phase steps, prompts). When user input is needed the pipeline unwinds to the caller and resumes on the next click.
- `server/game/cards/` — ~2000 card implementations, one class per card, grouped by set (`01_SOR`, `02_SHD`, …) then card type.
- `server/services/`, `server/utils/` — DynamoDB, deck fetching/validation, stats, cosmetics, profanity filter, moderation.

### Action & trigger flow

Action phase: `ActionWindow` alternates players → a player selects an ability → an `AbilityResolver` is queued in `GamePipeline` → costs checked → targets chosen → costs paid → `GameSystem.resolve()` executes → `GameEvent`s fire. Events are collected into an `EventWindow`; after every event in a window resolves, a `TriggeredAbilityWindow` checks each registered `when` condition and queues the matching triggered abilities. Abilities triggered while resolving another trigger are nested and resolve before earlier-queued ones.

### Card implementations

`server/game/cards/Index.ts` recursively `require`s every built card file and registers it by implementation id. Consequences:

- Every card file must `export default class <Name>` where `<Name>` matches the filename (PascalCase), and must override `getImplementationId()` returning the `id`/`internalName` from `server/utils/cardData/_cardMap.json` (generated by `get-cards`).
- Directories named `common/` are skipped by the loader and hold abstract/shared base classes.
- Base class per type: `NonLeaderUnitCard`, `EventCard`, `UpgradeCard`, `BaseCard`, `LeaderUnitCard` (leaders must extend `LeaderUnitCard`, never `LeaderCard`).

Abilities are declared in `setupCardAbilities(registrar, AbilityHelper)` — both are **injected parameters**, not `this.*` methods or a module import:

```ts
public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
    registrar.addActionAbility({ title: '…', cost: AbilityHelper.costs.exhaustSelf(), targetResolver: { … } });
}
```

Leaders instead implement `setupLeaderSideAbilities` and `setupLeaderUnitSideAbilities` (both required). If both sides share an ability, build the props from a **method call**, never a shared field — the props object is mutated during setup. Cards needing "X this phase" queries declare watchers in `setupStateWatchers(registrar, AbilityHelper)` (see `server/game/stateWatchers/`). Keywords are parsed from card data automatically; only implement them when conditionally granted.

The building blocks reachable from `AbilityHelper`:

- `immediateEffects.*` → `GameSystem` subclasses in `server/game/gameSystems/` (registry: `GameSystemLibrary.ts`). Each has `canAffect()` (called repeatedly; must return true *every* time for the target to be legal) and `eventHandler()` (mutates state). This is the first place to debug an ability that triggers but does nothing.
- `ongoingEffects.*` → `server/game/ongoingEffects/OngoingEffectLibrary.ts`, used by constant abilities; application/removal as cards enter and leave play is automatic.
- `costs.*` → `server/game/costs/CostLibrary.ts`.

### State tracking, snapshots, and undo

Every engine object extends `GameObjectBase` and must carry `@registerState()` / `@registerStateBase()` — the constructor throws otherwise. Card implementation classes are the exception: the loader wraps them via `buildAutoInitializingCardClass`, and adding the decorator to one throws. Helper game objects declared next to a card (a custom ability or play action class) still need it. Mutable state lives behind accessor decorators from `core/GameObjectUtils.ts` (`@statePrimitive`, `@stateRef`, `@stateRefArray`, `@stateRefMap`, `@stateRefSet`, `@stateRefRecord`, `@stateValue`) so the snapshot system in `core/snapshot/` can copy and roll back the whole game. Plain fields are invisible to undo. `@stateRefArray(false)` accessors must be typed `IStateArray<T>` (enforced by a custom lint rule).

`npm run test-undo` exercises this: each test runs, rolls back to its starting snapshot, and runs again. Files under `test/scenarios/undo/` are skipped in that mode since they already cover it.

### Card data pipeline

`npm run get-cards` (`scripts/fetchdata.js`) downloads FFG card JSON into `test/json/` (gitignored) and generates `_cardMap.json` and friends. Cards FFG hasn't published yet are hand-defined in `scripts/mockdata.js`. `card-data-version.txt` + `fetchdata.js` + `mockdata.js` hash into `card-data-hash.txt`, which busts the CI cache and is checked at server startup — bump `card-data-version.txt` to force a refresh. `npm run check-card-data` (`scripts/checkCardData.js`) makes the same comparison on demand.

## Testing

Specs live at `test/server/cards/<set>/<type>/<CardName>.spec.ts`, mirroring the impl path. `npm run validate-cards` enforces that mirror: every card impl needs a matching `.spec.ts` unless it is under `tokens/`, extends a class from a `common/` module, or carries a `// @no-test-required: <reason>` marker (a reason is mandatory, and a stale marker alongside an existing test is also a violation).

Tests use the custom integration harness (`test/helpers/`), not bare jasmine:

```ts
describe('Tarkintown', function() {
    integration(function(contextRef) {
        it('should deal 3 damage…', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { base: 'tarkintown' },
                player2: { groundArena: [{ card: 'frontier-atrt', damage: 1 }, 'wampa'] },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.tarkintown);
            expect(context.player1).toBeAbleToSelectExactly([context.frontierAtrt]);
        });
    });
});
```

- Cards are named by **internal name** (`'luke-skywalker#faithful-friend'`) in setup and reached as camelCase props on `context` (`context.lukeSkywalker`, `context.lukeSkywalkerFaithfulFriend`). `p1Base`/`p2Base`/`p1Leader`/`p2Leader` are always generated. Duplicate identical names generate no prop — use `player.findCardByName()` / `findCardsByName()`.
- Only one `setupTestAsync` per test case (harness throws if a `beforeEach` and the body both call it).
- Custom matchers in `test/helpers/CustomMatchers.js`: `toBeAbleToSelectExactly`, `toHaveExactPromptButtons`, `toBeInZone`, `toHaveExactUpgradeNames`, `toHaveAvailableActionWhenClickedBy`, `toBeActivePlayer`, `toHavePassAbilityButton`, etc. Prefer these over raw property assertions — several also validate game-state consistency.
- Engine-level scenarios (costs, timing windows, search, undo, …) live under `test/scenarios/`.

### Writing a server spec (the HTTP / socket connection layer)

Specs for `server/gamenode/`, `server/services/`, `server/utils/` and `server/scripts/` are the **non-game** group (`jasmine-nongame.json`); everything else is the **game** group (`jasmine-game.json`). `npm run validate-specs` fails CI if a spec's harness does not match its group, so an `integration()` spec cannot sit in a non-game directory or the reverse. `npm run test-nongame` runs the non-game group in seconds. The plan, the backlog and the list of known findings are in `long-term-project-docs/game-node-test-suite.md`; the record of finished work is `game-node-test-suite-history.md` beside it.

Pick the harness by what the spec drives: `integration()` for the rules engine; `serverIntegration()` (`test/helpers/server/`) for the connection layer — it builds a real `GameServer` in-process on a virtual clock, and `harness.createClient()` makes the same HTTP calls and socket handshake `forceteki-client` does; plain jasmine with spies only for a pure unit (as `UserFactory.spec.ts` does).

Server specs live in `test/server/gamenode/<area>/`, grouped by what they are about rather than by the production file they cover; put a new spec in its area, never directly under `gamenode/`:

- `auth/authentication/` — who the caller is: tokens and cookies, sign-in and account creation, anonymous identity, service secrets.
- `auth/authorization/` — what a known caller may do: the route manifest, roles, anonymous-versus-logged-in limits, chat permissions.
- `lobby/` — creating and joining lobbies, where a socket is routed, spectators, the lobby lifecycle, in-game connections, reports, the socket command allowlist, test game setups.
- `matchmaking/` — queues, matchmaking and the quick-lobby countdown.
- `account/` — a logged-in user's own data routes (preferences now; decks, settings and cosmetics as they get specs).
- `harness/` — specs of the test tooling itself (the harness, the fake DB, the socket.io drift guard, the scheduler), not of the server.

Use the seams the harness provides rather than reaching into the server:

- **Time:** `harness.clock.advanceAsync(ms)`. Never sleep in real time. Account time (the profile cache, moderation expiry, the username-change cooldown) is on the same virtual clock. JWT expiry is the exception: `jsonwebtoken` reads the *wall* clock, so to test an expired token mint one that is already expired (`AuthTokens.badSessionTokens`).
- **DynamoDB:** every harness has one by default: an empty `FakeDynamoDbService`, or pass a seeding function as `serverIntegration(defs, { database: (db) => ... })`, which runs before the server starts (roles, settings and mod actions are read at startup and then hourly). Seed and read through `harness.db`; the real role, settings, cosmetics and mod-action services run over it. Extend the fake rather than writing an inline one. `{ database: false }` is the local-dev configuration (no role can be granted, no client can be logged in, and dev accounts live in a per-worker in-memory store); use it only when that is the subject. A production-like server is `env: { ENVIRONMENT: 'production' }`.
- **Logged-in users:** a signed-in client presents only its session token, and the server finds the account from it, as the FE does. `harness.createClient({ authenticated: true, profile })` seeds a new account (with `profile` for fields such as `preferences` or `moderation`); `harness.createAccountClient(account)` signs in to one you seeded with `harness.db.seedAccount()`. The server caches a profile once any request or socket has resolved it, so seed what it owns (mutes, preferences, usernames) before the client's first signed-in request; a later write straight into `harness.db` is not seen until the cached copy expires, whereas a change made through a route is.
- **Assert on the wire:** check what a client receives. Read the server's own state (`harness.server.testLobbies`, `lobbyCount`, `getUserLobbyId`, `harness.clock.pendingTaskCount`) only for what no client can see, such as a lobby or timer the server should have let go, and say why in the spec. Whether the server has forgotten a user is `TestClient.hasNoPlaceAsync()` (it reconnects the client, so use it last).
- **Setups and commands:** `harness.openLobbyAsync`, `createLobbyWithGuestAsync`, `startLiveGameAsync` and `startQuickGameAsync` build lobbies and games, and throw if a step is refused. `TestClient` has one method per command the real client sends (`sendChatMessageAsync`, `setReadyStatusAsync`, `concedeAsync`, …), and `lobbyChat`, `gameChat`, `lobbyChatFrom` and `gameChatFrom` read the chat. Use the raw `sendLobbyMessageAsync` / `sendGameMessageAsync` only for a payload no real client sends.
- **Stats sites:** `harness.statsHttpClient` (`FakeHttpClient`). **Env:** `{ env: { ... } }`, restored on shutdown. **Raw requests:** `harness.requestAsync(method, path, { cookie, headers, body })`.
- **Routes:** every HTTP route has a row in `test/server/gamenode/auth/authorization/RouteAuthManifest.ts`; adding a route fails `RouteAuthManifest.spec.ts` until you say who may call it.

Do not cast to `any` to reach into `GameServer` or `Lobby` (ESLint errors on `as any` in `test/server/gamenode` and `test/helpers/server`, but it does not catch bracket access or `as unknown as`, which are the same smell, so keep them out in review) — add a seam to the server or the harness instead, and if a reach cannot be avoided yet, disable the rule on that line and say what removes the need. When a spec exposes behaviour that looks wrong, do not write a spec that asserts it (that makes the bug a requirement) and do not fix it inside a test change. If it could be exploited, do not describe it anywhere in the repository (specs, comments, the plan document): report it to the maintainers privately (security fixes are made separately, in dedicated commits). Otherwise leave a `TODO` where the spec belongs saying what to add, and record it in the plan document's open findings; the fix comes in that topic area's step d (see the plan's roadmap), as its own commit together with the spec.

## Manual testing against the client

`npm run dev` creates a default `.env` if missing and starts the node on 9500. With `ENVIRONMENT=development` the server loads the test harness, so you can boot a scripted board:

```bash
curl -s -X POST http://localhost:9500/api/start-test-game -H "Content-Type: application/json" -d '{"filename":"myScenario.json"}'
```

which reads `test/gameSetups/<filename>` using the same setup schema as `setupTestAsync`. Those files are gitignored apart from `testGameTemplate.json`.

## Conventions and gotchas

- **`docs/` is deprecated and partially stale** — it still shows the old `this.addActionAbility(...)` / `AbilityHelper` import style and the old `this.setupTest` test harness. The current source is the truth; the maintained prose is the [wiki](https://github.com/SWU-Karabast/forceteki/wiki). `docs/debugging-guide.md` is still useful for pipeline/breakpoint technique.
- Custom lint rules in `eslint-rules/` apply to `server/game/**`:
  - `no-raw-token-text` — never put aspect/trait/keyword names or resource costs in raw strings in ability text; use `TextHelper` constants/helpers so the client can render icons.
  - `state-ref-array-requires-istatearray` — see State tracking above.
  - `no-event-generated-tokens` — read `resolvedEvents[...]?.generatedTokens`, not `events[...].generatedTokens`, so replaced token-creation events resolve correctly.
- Style is enforced, not advisory: 4-space indent, single quotes, `curly: all`, `eqeqeq`, explicit member accessibility on every TS member, `import type` for type-only imports, `override` required.
- `legacy_jigoku/` (ported L5R reference code) is referenced by `docs/`, tsconfig and eslint ignores but no longer exists in the repo — ignore those pointers.

## Claude tooling (`.claude/`)

This repo carries a depth layer for card-development work with Claude Code. It is committed (so it reaches everyone on a plain `git pull`, no install) and versions with the engine it describes:

- `.claude/reference/swu-rules/` — the SWU Comprehensive Rules v7.0 + official clarifications, indexed in `INDEX.md`. Grep it by topic/card name; never read a file in full. Backing store for the `swu-rules-expert` agent.
- `.claude/reference/forceteki-dev-guide.md` — deep card/test authoring templates and the AbilityHelper/registrar surface (the fuller companion to this file).
- `.claude/reference/test-conventions/` — baseline spec-file conventions (read-only seed for `test-auditor`).
- `.claude/agents/` — `card-implementer`, `card-test-writer`, `card-librarian`, `swu-rules-expert`, `test-auditor`.
- `.claude/skills/implement-card/` — end-to-end "implement a new card" workflow that orchestrates the agents above.
- `.claude/agent-memory/` — per-agent local learnings; **gitignored** (never committed), so it never shows up in feature diffs.

