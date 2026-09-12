# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Forceteki is the fan-made rules engine for the card game Star Wars Unlimited (SWU), ported from the Ringteki (L5R) engine.
It is a Node 22 / TypeScript server (Express + Socket.IO); the web client lives in a separate repo.
The canonical contributor docs are the [GitHub wiki](https://github.com/SWU-Karabast/forceteki/wiki).
The files under `docs/*.md` are marked deprecated and still show the older `this.addXxx(...)` and `this.setupTest(...)` APIs; when they disagree with the code, the code wins, so model new work on a recently added card and its spec rather than on those docs.

## Commands

```bash
npm install
npm run get-cards        # downloads card JSON into gitignored test/json/; required before any test run
npm run build            # tsc -> build/server
npm run dev              # build-dev + start the game node (auto-creates .env with local defaults)
npm run lint             # eslint --quiet; lint-fix / lint-verbose also exist
npm run validate-cards   # card file naming + spec coverage check (runs in CI)
npm test                 # full build then jasmine, serial
npm run test-parallel    # 4 workers, random order
npm run test-parallel-undo   # same, with ENABLE_UNDO_ALL_TESTS=true
npm run test-fast        # skips the server tsc; inner-loop only
```

Running one spec: jasmine executes the compiled JS under `build/test`, so pass a glob on the `.js` name from the repo root.

```bash
npm test -- "**/FettsFirespraySettlingTheScore.spec.js"
```

```bash
npm run test-fast -- "**/FettsFirespraySettlingTheScore.spec.js"
```

`--filter=<pattern>` narrows by spec name. The README form `npm test test/server/cards/.../X.spec.js` is stale because no `.js` exists under `test/`.

Two environment failures to recognise:

- `Importing card class with repeated id!` means `build/` holds compiled output for a card file that was since renamed or deleted. Run `rm -r build/` and rebuild.
- `Card data hash file test\json\card-data-hash.txt not found` or a hash mismatch means `test/json` is stale relative to `card-data-version.txt`, `scripts/fetchdata.js`, or `scripts/mockdata.js`. Run `npm run get-cards`. Bump `card-data-version.txt` when upstream data changed but no script did, so CI's cache busts. `get-cards` downloads from FFG's API and hangs with no output when outbound network is blocked, so run it outside a sandbox.

CI on pull requests to `main` runs lint, `validate-cards`, `test-parallel`, and `test-parallel-undo`.

## Verification

Gate any engine change on lint plus the full suite in both modes, using the parallel forms:

```bash
npm run lint
npm run test-parallel
npm run test-parallel-undo
```

`test-parallel-undo` replays every spec through a snapshot rollback (`ENABLE_UNDO_ALL_TESTS=true`) and is the real gate for anything touching `server/game/core/snapshot/`, `GameObjectUtils.ts`, `GameObjectBase.ts`, or the ongoing-effect engine.
`npm run test-fast` skips part of the build and is for inner-loop iteration only; never use it as gating evidence.
Do not run `npm run benchmark` unless the task explicitly owns a performance capture (see `docs/plans/IMPLEMENTATION-ORDER.md`).
Known issue: a failure under `test-parallel` sometimes reports only the suite, not the spec; rerun with `npm test` to get specifics.

## Architecture

### Layers

- `server/gamenode/` is the network layer: `GameServer.ts` (Express, Socket.IO, auth) and `Lobby.ts` (one lobby, constructs the `Game`, relays messages). `server/utils/` holds card data fetching, deck building/validation, and stats. `server/services/` is DynamoDB.
- `server/game/core/` is the engine. `server/game/cards/<set>/<type>/` holds one class per card. `gameSystems/`, `ongoingEffects/`, `costs/`, `stateWatchers/`, and `abilities/` are the libraries card code composes.
- `server/game/core/Constants.ts` holds the enums nearly every card imports: `CardType`/`WildcardCardType`, `ZoneName`/`WildcardZoneName`, `RelativePlayer`, `Trait`, `Aspect`, `KeywordName`, `EventName`, `TargetMode`, `AbilityRestriction`, and more.

### Input flow and the pipeline

`Lobby.onGameMessage` dispatches client commands by method name (`this.game[command](userId, ...args)`) and then calls `game.continue()`, so every public method on `Game` is reachable from the client and renaming one silently breaks the UI.
The engine is a stack of steps in `core/GamePipeline.ts`. Each step's `continue()` runs; returning `false` pauses the pipeline to wait on a prompt, and the next click walks back down the step stack. Phases (`core/gameSteps/phases/`) and ability resolution (`AbilityResolver.ts`, `ActionWindow.ts`, `abilityWindow/`) are steps that own nested pipelines. Prompts (`core/gameSteps/prompts/`) write into `PlayerPromptState`, which `Game.getState(playerId)` serialises for the client.
Events flow through `core/event/` (`GameEvent`, `EventWindow`) and triggered abilities queue into `TriggeredAbilityWindow`. `docs/debugging-guide.md` describes where to breakpoint in this stack and is still accurate.

### Card model and loading

`core/card/Card.ts` is the root. Leaf classes are `NonLeaderUnitCard`, `LeaderUnitCard`, `DoubleSidedLeaderCard`, `EventCard`, `UpgradeCard`, `BaseCard`, and the token classes, built from `core/card/baseClasses/` and the mixins in `core/card/propertyMixins/` (damage, printed stats, ability registration, and so on).
`server/game/cards/Index.ts` discovers cards at require time by scanning the compiled `.js` files under `build/`, skipping `_`-prefixed files and `common/` directories, and throws on a duplicate id or class name. A card with no implementation falls back to a generic class via `CardHelpers.createUnimplementedCard`, which is why unimplemented cards still load in decks.

### Ability system

A card overrides `getImplementationId()` and `setupCardAbilities(registrar, AbilityHelper)`. The registrar type per card class is in `core/card/AbilityRegistrationInterfaces.ts` (`addActionAbility`, `addTriggeredAbility`, `addConstantAbility`, `addWhenPlayedAbility`, `addOnAttackAbility`, `addWhenDefeatedAbility`, `setEventAbility`, `setEpicActionAbility`, `addReplacementEffectAbility`, `addGainKeywordTargetingAttached`, and friends).
`AbilityHelper` (`server/game/AbilityHelper.ts`) is created per game and bundles `immediateEffects` (`gameSystems/GameSystemLibrary.ts`), `ongoingEffects` (`ongoingEffects/OngoingEffectLibrary.ts`), `costs` (`costs/CostLibrary.ts`), `limit`, and `stateWatchers` (`stateWatchers/StateWatcherLibrary.ts`).
Effects are `GameSystem` subclasses (`core/gameSystem/`): `canAffect()` filters candidates and must return true on every call, `generateEvent()` creates the event, `eventHandler()` mutates state. Targets are chosen by resolvers in `core/ability/abilityTargets/` from `targetResolver` / `targetResolvers` props, and the ability property shapes are typed in `server/game/Interfaces.ts` and `TargetInterfaces.ts`.
Constant abilities apply ongoing effects through `core/ongoingEffect/OngoingEffectEngine.ts`, which re-evaluates `condition` and `matchTarget` as state changes.
Assertions use the `Contract` namespace in `core/utils/Contract.ts`; failures route through `Game.reportError` instead of crashing the process.

### Snapshot and undo

Every engine object extends `core/GameObjectBase.ts`, registers with `game.gameObjectManager`, and keeps rollback-relevant data in a `state` object declared with the accessor decorators from `core/GameObjectUtils.ts` (`@statePrimitive`, `@stateValue`, `@stateRef`, `@stateRefArray`, `@stateRefMap/Set/Record`). The class must carry `@registerState()` or `@registerStateBase()` or construction throws, and a `@registerState` class may not extend another `@registerState` class.
References between objects are stored as ids and rehydrated on rollback; snapshots serialize `state` with `v8.serialize` (`GameStateManager.buildGameStateForSnapshot`, reading through `getStateUnsafe()`), so anything not structured-clone-compatible placed in `state` throws. Rollback (`core/snapshot/GameStateManager.rollbackToSnapshot`) mutates live instances in place, and `SnapshotManager.ts` is the facade the `Game` owns.
The engine is deterministic (seeded `seedrandom`, no `Math.random` under `server/`).

## Implementing a card

- Path is `server/game/cards/<set>/<units|events|upgrades|leaders|bases|tokens>/<PascalName>.ts` with `export default class <PascalName>`; `validate-cards` enforces that the class name matches the file name and that a spec exists at the mirrored path under `test/server/cards/`. Exemptions are `tokens/`, classes extending something in a `common/` dir, or a `// @no-test-required: <reason>` line.
- `getImplementationId()` returns the `id` and `internalName` from `test/json/_cardMap.json`. A card not yet in FFG's data is added to `scripts/mockdata.js` and gets the id `<internalName>-id`.
- Leaders extend `LeaderUnitCard` (never `LeaderCard`) and implement both `setupLeaderSideAbilities` and `setupLeaderUnitSideAbilities`. Share ability props between sides via a method that builds a fresh object each call; a shared field object gets mutated during setup and misbehaves.
- Printed keywords (Sentinel, Raid, Ambush, etc.) are parsed from card text automatically; only conditional or granted keywords need code.
- Inside ability callbacks use `context.source` and `context.player`, not `this`; for upgrade abilities that grant an ability to the attached unit, `context.source` is the attached unit.
- Chain effects with `immediateEffects.simultaneous([...])`, `sequential([...])`, `conditional({...})`, and the `then` prop; use `selectCard({ innerSystem })` to target inside a chain. Phase-long effects use `forThisPhaseCardEffect`; attack-long ones go on `initiateAttack.attackerLastingEffects`.
- State watchers (`setupStateWatchers(registrar)`) record past events; read the recorded fields such as `playedBy` rather than a card's current `controller`, which may have changed since.
- Custom lint rules under `eslint-rules/` apply to `server/game/**`: aspect and trait names in ability text go through `TextHelper` (`TextHelper.Aggression`, `TextHelper.trait(Trait.X)`) so the client can render icons; a `@stateRefArray` field must be typed `IStateArray<T>`; read `resolvedEvents[i]?.generatedTokens`, never `events[i].generatedTokens`.
- ESLint also requires explicit member accessibility on every class member, `import type` for type-only imports, `as` assertions, 4-space indent, single quotes, and braces on every block.
- Game messages start with the acting player, use present tense, and have no trailing punctuation. Targeting prompts read "Choose a unit", not "Choose a unit to damage".

## Writing a spec

Specs are `.spec.ts` files under `test/server/cards/<set>/<type>/` and follow this shape:

```typescript
describe('Card Title', function() {
    integration(function(contextRef) {
        it('does the thing', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['some-card'], groundArena: ['wampa'] },
                player2: { spaceArena: ['cartel-spacer'] }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.someCard);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard');
        });
    });
});
```

- Cards are named by internal name (`luke-skywalker#faithful-friend`) in setup and become camelCase properties on `context` (`context.lukeSkywalker` and `context.lukeSkywalkerFaithfulFriend`; a leading digit gets a `_` prefix). `context.p1Base`, `p2Base`, `p1Leader`, `p2Leader`, `player1`, `player2`, and `game` are always present.
- Avoid two copies of one card in a scenario; when unavoidable, no property is generated and you fetch with `player.findCardByName()` / `findCardsByName()`.
- The harness globals (`integration`, `undoIntegration`, `undoIt`, `rollback`) and the roughly sixty custom matchers are declared in `test/helpers/IntegrationHelper.d.ts`; matcher implementations are in `test/helpers/CustomMatchers.js`. Prefer `toBeInZone`, `toBeAbleToSelectExactly`, `toHaveExactPromptButtons`, `toHavePassAbilityButton`, and `toHaveExactUpgradeNames` over raw property checks.
- `autoSingleTarget: true` in setup is legacy; do not use it in new tests.
- Under `ENABLE_UNDO_ALL_TESTS=true` every `it` becomes `undoIt` and the dedicated undo specs in `test/scenarios/undo/` are skipped, since the whole suite already runs through rollback.
- `docs/test-cheat-sheet.md` lists the player actions and matchers with example specs; its matcher names are mostly current apart from `toBeInLocation`, which is now `toBeInZone`.

## Snapshot / save-load roadmap (`docs/plans/`)

Implementation units for the roadmap are defined in `docs/plans/IMPLEMENTATION-ORDER.md`; use its invocation blocks verbatim, including the `--fast` / `--tier N` routing and the `task_id`.
Anvil proof level for roadmap units marked 🔴 is `hardened`; `standard` otherwise.
Do not edit an existing benchmark scenario in `test/scenarios/undo/benchmark/BenchmarkScenarios.ts`, and do not redefine a headline benchmark (`manager/*`, `payload/*`, `sustained/*`) without saying so in the owning plan doc.
Roadmap commits go on `experimental/rollback-saves-optimizations`; the Anvil project log lives at `docs/plans/ANVIL-LOG.md` (created by the first roadmap run).
`docs/plans/README.md` states the standing invariants for all snapshot work: every piece of game state must be JSON-representable, persistent identity uses `internalName` and `abilityIdentifier` rather than uuids, rollback re-enters the pipeline only at declared safe points, and nothing degrades silently.
