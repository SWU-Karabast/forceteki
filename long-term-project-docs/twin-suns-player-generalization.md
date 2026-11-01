# Twin Suns: Generic Player Handling

Status: **in progress** - pre-pass 1 is implemented and validated on
`ammayberry1/player-logic-cleanup` (pushed; no pull request yet; 47 commits behind `main`).
Pre-pass 2-4 have not started.

Initial investigation: 2026-10-10. Last updated: 2026-11-01.

## Handoff snapshot

State as of 2026-11-01. Refresh this section whenever the branch moves, and delete it once the
pre-pass 1 pull request has merged. The sections it links to hold the details.

### Where things stand

| Workstream | State | Next action |
| --- | --- | --- |
| 1. Target/system contract | Implemented, validated, and pushed as one WIP commit. No pull request. Three open decisions. | Owner answers the open decisions, then merge `main` and open the pull request. |
| 2. Player-target resolver correctness | Not started. Three defects confirmed in code. | Design discussion, then focused tests. |
| 3. Visibility and prompt cleanup | Not started. Starting points recorded. | Establish current behavior, then design discussion. |
| 4. Game-finalization correctness | Not started. Defect confirmed in code. | Regression test first, then the fix. |

### Branch and merge state

- Branch `ammayberry1/player-logic-cleanup`; local and `origin` are identical at `70ae3acca`, and
  the working tree is clean. Two commits: `bfb2d8bad` (initial doc) and `70ae3acca` ("WIP": the
  whole pre-pass 1 implementation, 105 files).
- No pull request exists for the branch.
- Based on `main` at `7440f7417` (2026-10-10). `origin/main` is at `445792e61` (2026-10-30), so
  the branch is 47 commits behind and 2 ahead.
- A trial merge of `origin/main` has 4 textual conflicts, and one new upstream system must be
  migrated by hand even though it may compile unchanged. See
  [Landing the branch](#landing-the-branch).
- All validation predates the merge. Nothing has been validated against current `main`, which now
  requires Node 26; the validation used Node 22.

### Decisions already made

The owner (AMMayberry1) decided:

- The pre-pass must not change player counts, the scalar `player.opponent`, turn scheduling, or
  external payload shapes.
- Consolidating the relative-player filters ("enemy", "friendly", "opponent") is out of the
  pre-pass: the final design needs "an opponent" versus "all opponents", so doing it now would be
  redone.
- Visibility only needs "self versus others". An opponent and a spectator are treated alike unless
  the code already distinguishes them, and there is no per-opponent visibility.
- The recipient-cardinality audit (which systems take one recipient versus several) waits for the
  main Twin Suns work.
- Finalization is limited to the end-reason overwrite fix plus tests.
- The pre-pass 1 design is approved as written under
  [Approved design and implementation](#approved-design-and-implementation).
- After an independent review, fixes 1-4 were applied: the event-condition guard, the
  `PayCardPrintedCostSystem` assertion, cleanup, and documentation. The spec readability audit and
  the annotation reduction were deliberately left for later.

### Open decisions

All three concern pre-pass 1 and are written up with options under
[Open decisions for pre-pass 1](#open-decisions-for-pre-pass-1): eager versus lazy property
generation at event resolution (recommended: restore lazy), the `IGameSystemInput` annotation load
(recommended: a shared alias), and how to land the work (recommended: one pull request with a
review guide).

### Resume checklist

1. Read this snapshot, then under pre-pass 1:
   [Behavior changes worth reviewing](#behavior-changes-worth-reviewing),
   [Open decisions for pre-pass 1](#open-decisions-for-pre-pass-1), and
   [Landing the branch](#landing-the-branch).
2. Get the owner's answers to the open decisions: eager versus lazy first (it can change code),
   then how to land, then the annotation alias.
3. Merge `origin/main` into the branch (the owner has used merge commits on other branches, and
   this one is already pushed), resolve the conflicts, migrate `SelectChoiceSystem`, and run
   `npm install` for the new toolchain.
4. Run the validation commands below and record the results under
   [Verification](#verification).
5. Do the spec readability pass, open the pull request with the [review guide](#review-guide), and
   update this document (statuses and verification).
6. Start pre-pass 2 with a design discussion; see [Working process](#working-process).

Validation commands, from the repository root:

```
npm run build-test -- --fast-build   # compile server and tests into build/
npm run test-fast -- build/test/server/gameSystems/GameSystemProperties.spec.js   # one spec file
npx eslint --quiet                   # CI gate
npm run validate-cards               # CI gate
npm run validate-specs               # CI gate on main only; not present on this branch's base
npm run test-parallel                # CI gate
npm run test-parallel-undo           # CI gate
```

Practical notes:

- A single spec must be passed as a compiled path under `build/test/` ending in `.spec.js`.
- `build/` is gitignored and never cleaned. Compiled specs left by other branches make the suite
  fail spuriously: delete `build/` (or the orphan) when a failing spec has no `.ts` source.
- Specs that spy on game objects must restore the originals in a `finally` block. The undo suite
  re-runs every spec with rollback, and method spies are not rolled back.

### Progress log

- 2026-10-10: investigated the two-player assumptions, wrote the categories below, agreed the
  four-workstream pre-pass, implemented pre-pass 1, had it reviewed, and applied the approved
  follow-ups. Committed as `70ae3acca` and pushed.
- 2026-11-01: handoff preparation. Found the branch 47 commits behind `main` with no pull request,
  and recorded merge expectations, open decisions, and code pointers for the pending workstreams.

## Why this exists

Forceteki currently supports 1v1 play. Preparing the engine and backend for the four-player Twin Suns
format requires making player handling more generic without enabling four-player games yet.

This living document tracks the major architecture areas identified during the initial repository
investigation and the agreed preparatory work. The architecture inventory remains a discovery
baseline. The pre-pass order and workstream 1 design are approved; later concrete designs remain open.

## Current scope

- Identify and track hardcoded two-player assumptions.
- Record the design decisions needed to generalize player handling.
- Preserve existing 1v1 behavior during eventual preparatory changes.
- Keep enabling four-player games and implementing Twin Suns-specific rules outside this step.

The initial textual scan found **386 direct `.opponent` references across 265 server TypeScript
files**, including **299 references across 230 card implementation files**. These counts include
comments and exclude indirect assumptions in defaults, enums, and pair-oriented interfaces.

## Approved pre-pass

Approved: 2026-10-10. This pass addresses existing inconsistencies without changing player counts,
the scalar opponent model, turn scheduling, or external payload shapes. Behavior-preserving cleanup
and existing correctness fixes must be distinguished; any intentional behavior correction needs
focused regression coverage.

### Pre-pass 1. Existing target/system contract inconsistencies

Status: **implemented and validated on the branch**. Open decisions and the merge with `main`
remain; see the [handoff snapshot](#handoff-snapshot).

- Investigate and resolve inconsistencies in currently supported target handling, normalization,
  and effect execution.
- Keep fixes grounded in existing 1v1 behavior.
- Defer auditing which systems should support one recipient versus multiple recipients until the
  main Twin Suns work introduces multiple-opponent semantics.
- Defer any individual fix that requires those future recipient-cardinality decisions.

This provides a more reliable underlying effect contract for the resolver work that follows.

#### Approved design and implementation

- Ordinary system properties describe the operational representation: `target` is a required array.
  Shared `IGameSystemInput<TProperties>` and `GameSystemPropsFactory<TProperties, TContext>` types
  retain scalar-or-array and omitted-target convenience at configuration boundaries. This applies
  to both card and player systems.
- The base class owns property merging and normalization. System-specific customization moved to
  `prepareProperties()` hooks. Existing explicit/factory, additional-property, and default
  precedence is preserved.
- Legality, message, and event implementation hooks receive the effective properties instead of
  independently re-merging optional additional properties. Wrapper systems retain the caller's
  additional properties for child calls without copying all parent defaults into children.
- Individual legality candidates remain scalar. Single-card events and singleton player events
  carry scalar recipients, while existing batched player-effect event construction is preserved.
  No recipient-cardinality audit or multiple-opponent behavior was added.
- Default target-choice metadata queries remain lazy: they must not evaluate factories depending
  on targets that have not yet been selected.
- Resource-readying checks, shuffle messages, and captor handling honor effective overrides.
  Function-valued damage costs receive individual units, not the configured target array.
- Legality checks and event-condition checks share one guard: an error is reported once and the
  check counts as failed (a failed event condition cancels that event) instead of being thrown,
  even if the error reporter itself throws. Event handlers remain unguarded, as before. A handler
  normally runs right after its own event's guarded condition check, which would already have
  caught a failing property factory. The exceptions are `DiscardFromDeckSystem` and
  `DiscardCardsFromHandSystem`, which force their top-level condition to pass.
- An event condition generates the effective properties once and reuses them for its per-candidate
  legality checks.

#### Behavior changes worth reviewing

The refactor is intended to preserve 1v1 behavior. These are the places where behavior is
deliberately or incidentally different from before, so reviewers can focus on them:

- **Eager property generation at resolution time.** Every system now generates its effective
  properties when its handler runs and when its event condition is checked. Previously only 4 of
  71 handlers did (three directly, `SearchDeckSystem` through a helper), and only card- and
  player-targeting systems did so for the condition, so the property factories of other systems
  were not evaluated at that point. Those factories must now remain valid at resolution time. A
  factory that throws there now cancels that event with a reported error. Whether to keep this
  eager model or make it lazy is still open; see
  [Open decisions for pre-pass 1](#open-decisions-for-pre-pass-1).
- **Additional properties are honored consistently.** About 58 hooks used to ignore
  `additionalProperties` (19 of them had it in scope). Only five production call sites inject
  non-empty additional properties (`MetaActionCost`, `ExhaustUnitsCostAdjuster`,
  `MoveCardSystem` cost messages, and the `replacementEffect` flag from `ReplacementEffectSystem`
  and `SimultaneousSystem`), and no difference is reachable from them today beyond the cases
  covered by regressions: resource-readying legality honoring `isCost`, shuffle messages honoring
  an additional target, and captor handling.
- **`UseWhenDefeatedSystem`** used to pass a `Card` where additional properties were expected; it
  now passes none.
- **`DamageSystem` cost messages** evaluate function-valued amounts per unit, matching legality.
- **`SelectPlayerSystem.canAffect`** now rebinds its inner default-target function, which the old
  path skipped. No reachable path where this matters was found.
- **`ReplacementEffectSystem` and `SimultaneousOrSequentialSystem`** now forward
  `additionalProperties`, like the other wrapper systems.
- The `getSelectCost` TODO in [CostLibrary](../server/game/costs/CostLibrary.ts) (inject
  `isCost` through additional properties) names a precondition that is now met, since hooks respect
  additional properties. It was intentionally not acted on here.

Relevant implementation:
[GameSystem](../server/game/core/gameSystem/GameSystem.ts),
[CardTargetSystem](../server/game/core/gameSystem/CardTargetSystem.ts),
[PlayerTargetSystem](../server/game/core/gameSystem/PlayerTargetSystem.ts), and
[contract regressions](../test/server/gameSystems/GameSystemProperties.spec.ts).

#### Verification

Run on 2026-10-10 on the working tree that became `70ae3acca`, with Node v22.22.2 and the
dependencies this branch pins, against `main` at `7440f7417`:

- Server and test compilation passed.
- 26 contract regressions: 23 from the initial work plus three event-condition regressions (single
  property generation for player-targeting and card-targeting conditions, and report-and-cancel
  for a factory that throws at resolution time). Those three fail against the pre-fix code.
- Full suite: 8,989 specs, zero failures, nine existing pending specs.
- Full undo suite: 8,801 specs, zero failures, 16 pending specs (including dedicated undo suites
  intentionally skipped in whole-suite undo mode).
- The CI gates that existed on this branch's base passed: repo-wide `npx eslint --quiet` and
  `npm run validate-cards` (2,071 card files and 2,048 test files checked), plus the two suites
  above.
- Lint diagnostics in the changed areas ended below the pre-change level (about 310 before the
  work, 499 right after the migration, 286 after cleanup), with no errors.

The initial full-suite run encountered two orphaned compiled matchmaking specs from a different
source-tree state. Only those generated spec files were removed; the current source suite passed
on rerun.

Re-checked on 2026-11-01 against the committed branch: the per-file diff statistics match the
validated tree, and `npx eslint --quiet` and `npm run validate-cards` still pass. The test suites
were not re-run: this machine now has Node v26.13.0 and `@types/node` 26 (the toolchain `main`
requires), and the shared `build/` directory holds output from other branches. Type-checking under
that toolchain reports only the two unrelated errors described under
[Landing the branch](#landing-the-branch).

#### Review follow-ups

Applied after an independent review of the implementation (no high-confidence defects were found):

- Event-condition checks run under the same report-and-fail guard as legality checks, and reuse
  already-generated properties instead of generating twice.
- `PayCardPrintedCostSystem`: an assertion added during the migration was replaced by a
  non-throwing check, so behavior matches the pre-refactor code.
- Cleanup: removed unused trailing hook parameters, collapsed leftover blank lines, corrected the
  `AttackHelpers` property annotation, and documented the property-generation and
  `prepareProperties` contract. Hook signatures on the base class and on intermediate classes
  that are extended keep their full parameter lists, so a few unused-parameter warnings remain by
  design.

Deliberately left for later: a readability audit of the new spec (the `test-auditor` agent could
not launch in the original session, so do it by hand against
`.claude/reference/test-conventions/` or retry the agent), and the annotation reduction below.

#### Open decisions for pre-pass 1

The owner has not decided these. They are listed in the recommended order. Numbers are from the
committed branch (`70ae3acca`).

**1. Eager versus lazy property generation at event resolution (behavioral; decide first).**
The base [GameSystem](../server/game/core/gameSystem/GameSystem.ts) `eventHandler` and
`checkEventCondition` now generate the effective properties before calling their `*Internal` hook.
Before the refactor only 4 of 71 handlers did that (three directly, `SearchDeckSystem` through a
helper), and only the card- and player-targeting systems did it for event conditions. The event
window checks every condition at least twice (in its own step, then again right before each
handler), so each system event now evaluates its property factory at resolution time, after earlier
events in the same window may already have resolved.

- Risk: a factory that is valid when the event is generated but not when it resolves used to be
  harmless for systems that never re-evaluated it. A failure in a condition check is now reported
  and cancels the event. `DiscardFromDeckSystem` and `DiscardCardsFromHandSystem` force their
  top-level condition to pass, so their first evaluation is inside the unguarded handler, where a
  failure throws.
- Evidence: both full suites pass. The roughly 2,000 card property factories were not audited, so
  this is a latent-risk judgment, not a known bug.
- Option A, keep eager: one uniform contract, with the latent risk above.
- Option B, restore the previous behavior: event-time hooks take the event instead of properties,
  the four handlers that read properties generate them on demand, and card and player conditions
  call `canAffect` again. No semantic change; an estimated dozen files plus a re-run of every gate.
- Option C, snapshot the properties when the event is created and reuse them: deterministic, but it
  deliberately changes card and player conditions, which re-evaluate today. Better decided together
  with the multiple-opponent design.
- Recommendation: B for the pre-pass; treat C as a main Twin Suns question.

**2. Annotation load (cosmetic; can follow the main change).**
`target` is now a required array on a system's own properties, so partial input needs
`IGameSystemInput`: the `additionalProperties` parameters and `defaultProperties`. It appears on
260 lines in 83 files (165 `additionalProperties` parameters, 44 `defaultProperties` declarations,
82 import lines). Before the refactor there were 277 annotated `additionalProperties` parameters,
so the count is down about 40%, but each remaining annotation is longer and needs an import. The
scalar-or-array convenience only matters at the boundary in
[GameSystemLibrary](../server/game/gameSystems/GameSystemLibrary.ts).

- Option A, leave it.
- Option B, one shared loose alias, as the TODO in `GameSystem` already proposes
  (`type AdditionalProperties = Record<string, any>`): removes the wrapper and import from about
  165 signatures, at the cost of key checking on overrides. Only five production call sites pass
  non-empty overrides, so the loss is small.
- Option C, type `defaultProperties` as `Partial<TProperties>`: drops the wrapper at 44 sites; not
  compiled yet.
- Option D, fold overrides into the effective properties so hooks lose the parameter entirely: it
  hides state on the properties object. Not recommended now.
- Recommendation: B, as a single mechanical commit after the main change.

**3. How to land the work (process).**
The change cannot be split by file: the base hook signatures changed, so every subclass must move
together, and an expand/contract sequence would need a compatibility adapter and a second round of
churn. `main` squash-merges, so commit structure only helps reviewers. Recommendation: one pull
request with the [review guide](#review-guide), optionally restructured into a few commits (core
contract, system migration, review follow-ups, tests, docs).

#### Landing the branch

Everything here comes from a trial merge of `origin/main` (`445792e61`, 2026-10-30) that changed
nothing in the working tree, plus a read of the upstream diffs. The merge itself has not been
attempted, so compile expectations are expectations, not results.

Seven upstream commits touch the refactored directories: LKI Refactor Part 1 (#2931), lasting
play-from-discard effects as play permissions (#2997), modal-ability rendering and opponent-chosen
modals (#3009, #3023), `SelectChoiceSystem` (#3027), animation records (#3002), and the "for this
attack" cleanup (#3029). Thirteen files changed both upstream and on this branch; four conflict:

| File | Upstream change | Resolution |
| --- | --- | --- |
| [CardTargetSystem](../server/game/core/gameSystem/CardTargetSystem.ts) | #2931 renamed `addLastKnownInformationToEvent` to `addDepartureRecordToEvent` and replaced assigning `buildLastKnownInformation(target)` with `addLastKnownInformationNow(event, target)` | Keep this branch's structure (one-target `generateEventInternal`, effective `properties`) and apply the upstream helper calls |
| [MoveCardSystem](../server/game/gameSystems/MoveCardSystem.ts) | #2931 added a `losesCardInformation` branch that records a departure | Keep both; the new conditional sits in `updateEvent`, which now takes `properties` |
| [DamageSystem](../server/game/gameSystems/DamageSystem.ts) | #3002 added `static getDamageSourceCards(event)` beside the handler | Keep both; the handler is `eventHandlerInternal` on this branch |
| [ChooseModalEffectsSystem](../server/game/gameSystems/ChooseModalEffectsSystem.ts) | #3009 and #3023 rewrote `queueGenerateEventGameSteps` (new `choosingPlayer`, card-button prompt) and added a public `hasLegalTarget` that calls `generatePropertiesFromContext` | Port both bodies into `queueGenerateEventGameStepsInternal` and `hasLegalTargetInternal`, using the passed-in `properties` |

Beyond the text conflicts:

- New `SelectChoiceSystem` (#3027) is written against the old contract and must be migrated by
  hand. It overrides `canAffectInternal` with `additionalProperties` in the third position, where
  this branch passes the effective properties. The types are compatible, so the compiler probably
  will not flag it, and it would then forward those properties to its child systems. It also
  overrides the public `hasLegalTarget` and `queueGenerateEventGameSteps`, calls
  `generatePropertiesFromContext` repeatedly, and types `defaultProperties` as `Partial<...>`.
  Move it to the `*Internal` hooks and `IGameSystemInput`.
- Its `selectChoice` factory and the 7 card call sites (6 cards) should need no change: this
  branch's `GameSystemLibrary` imports `GameSystemPropsFactory` under the name `PropsFactory`, so
  the new factory takes the input form automatically. Confirm when building.
- Small upstream edits to files this branch also changed should auto-merge but deserve a
  read-through: `Interfaces.ts`, `PlayCardSystem`, `DefeatCardSystem`, `InitiateAttackSystem`,
  `UseTheForceSystem`, `CardLastingEffectSystem`, `AllCardsForPlayerLastingEffectSystem`,
  `PlayerLastingEffectSystem`, and `GameSystemLibrary`.
- A scan of the lines upstream added to `server/` and `test/` for the contract's method and type
  names found hits only in `ChooseModalEffectsSystem`, `GameSystemLibrary`, and
  `SelectChoiceSystem`, so no upstream card or spec appears to depend on the old contract.

Toolchain and CI after the merge:

- `main` now declares `engines.node >=26.12.1 <27` and `@types/node ^26`. This branch pins
  `@types/node ^20.19.11` and was validated on Node v22.22.2. Run `npm install` after merging.
  Type-checking this branch under the newer types reports two errors in files it does not touch
  (`GameChat.ts` and `GameServer.ts`); upstream has since changed both.
- `main` adds the `npm run validate-specs` gate (every spec must sit in the jasmine group its
  harness belongs to). The new spec uses `integration()` and lives outside the non-game
  directories (`server/utils` and `server/gamenode`), so it should pass. It has not been run
  because the script only exists on `main`.

#### Review guide

For the pull request description.

1. Read [GameSystem](../server/game/core/gameSystem/GameSystem.ts) first: the property types,
   `generatePropertiesFromContext`, `prepareProperties`, the shared guard, and the split between
   public entry points and `*Internal` hooks. Then
   [CardTargetSystem](../server/game/core/gameSystem/CardTargetSystem.ts),
   [PlayerTargetSystem](../server/game/core/gameSystem/PlayerTargetSystem.ts), and
   [AggregateSystem](../server/game/core/gameSystem/AggregateSystem.ts).
2. Read the systems called out under
   [Behavior changes worth reviewing](#behavior-changes-worth-reviewing).
3. Skim the rest by pattern. The migration of the 91 files under `server/game/gameSystems/` is
   mechanical:
   - `public eventHandler(event, ...)` becomes
     `protected eventHandlerInternal(event, properties, ...)`.
   - `canAffectInternal(target, context, additionalProperties, mustChange)` that regenerated
     properties becomes `canAffectInternal(target, context, properties, mustChange, additionalProperties)`
     and reads `properties` directly.
   - An override of `generatePropertiesFromContext` becomes a `prepareProperties` override that
     calls `super` and mutates the properties in place.
   - Overrides of `getEffectMessage`, `getCostMessage`, `hasLegalTarget`, `allTargetsLegal`,
     `queueGenerateEventGameSteps`, and `checkEventCondition` become the matching `*Internal`
     hook, which receives `properties`.
   - `Partial<Props>` on overrides and defaults becomes `Partial<IGameSystemInput<Props>>`, and
     factories and constructors accept the input form (`GameSystemPropsFactory`, which
     `GameSystemLibrary` imports under the old name `PropsFactory`).
4. The contract regressions are in
   [GameSystemProperties.spec.ts](../test/server/gameSystems/GameSystemProperties.spec.ts)
   (26 specs). The new contract is described in the
   [debugging guide](../docs/debugging-guide.md) and the
   [developer guide](../.claude/reference/forceteki-dev-guide.md).

### Pre-pass 2. Player-target resolver correctness

Status: **pending** (not started).

- Address the chooser-query argument-shadowing inconsistency.
- Replace placeholder legality detection and membership-only validation with checks consistent
  with existing effect contracts.
- Preserve intentional no-effect, optional-choice, and targeting-timing behavior.

Continue using the existing two-player model. New opponent filters and automatic opponent
selection are outside this pass.

Confirmed in [PlayerTargetResolver](../server/game/core/ability/abilityTargets/PlayerTargetResolver.ts)
as of 2026-11-01:

- `hasLegalTarget` is a placeholder that always returns true. A comment at the top of the class
  says every player is assumed to be a legal target for any effect.
- `hasTargetsChosenByPlayerInternal` accepts a `player` argument, but its callback parameter is
  also named `player`, so the argument is ignored and both players are always evaluated.
- `checkTarget` only verifies that the chosen player or players are in the game. It does not check
  that the immediate effect can legally affect them.

### Pre-pass 3. Visibility and prompt cleanup

Status: **pending** (not started).

- Establish existing visibility behavior for self versus others, including spectators and
  temporary viewing or reveal behavior.
- Consolidate duplicated visibility logic and clarify its perspective.
- Consolidate selection-highlight cleanup while preserving existing prompt lifecycle behavior.

No individually configurable opponent visibility is needed. Preserve any deliberate existing
visibility exceptions.

Starting points as of 2026-11-01 (located, not yet analyzed in depth):

- Hidden-zone logic lives in `EnumHelpers.isHiddenFromOpponent`
  ([EnumHelpers](../server/game/core/utils/EnumHelpers.ts)); a TODO there notes that a simpler
  formulation breaks many tests. Callers include `Card.initializeForCurrentZone` and
  `Card.isHiddenForPlayer` in [Card](../server/game/core/card/Card.ts), the effect summaries in
  [OngoingEffectEngine](../server/game/core/ongoingEffect/OngoingEffectEngine.ts),
  `CardTargetResolver`, `KeywordInstance`, `InPlayCard`, and `OngoingCardEffect`.
- `Card.isHiddenForPlayer` handles only the controller and the controller's opponent and fails for
  any other player.
- Highlight cleanup: [ActionWindow](../server/game/core/gameSteps/ActionWindow.ts),
  [SelectCardPrompt](../server/game/core/gameSteps/prompts/SelectCardPrompt.ts), and
  [DistributeAmongTargetsPrompt](../server/game/core/gameSteps/prompts/DistributeAmongTargetsPrompt.ts)
  clear the opponent's selectable cards directly, while the base
  [UiPrompt](../server/game/core/gameSteps/prompts/UiPrompt.ts) iterates all players and
  [ResourcePrompt](../server/game/core/gameSteps/prompts/ResourcePrompt.ts) sets per-player lists.

### Pre-pass 4. Game-finalization correctness

Status: **pending** (not started).

- Address the end-reason overwrite that occurs before the already-ended guard.
- Add focused coverage confirming that repeated calls while already ended preserve the original
  result and do not repeat finalization side effects.

This is an existing correctness fix, not a Twin Suns prerequisite. Broader participant-lifecycle,
outcome-determination, and finalization restructuring is deferred to the main Twin Suns work.

Confirmed in `Game.endGame` ([Game](../server/game/core/Game.ts)) as of 2026-11-01:
`gameEndReason` is assigned on the first line, before the `isEnded` guard, so a later call (for
example a concession after a game-rules win) overwrites the recorded reason of a game that has
already ended, although the rest of finalization is correctly skipped. The only consumer in
`server/` is `Player.buildAvailableSnapshotsState` ([Player](../server/game/core/Player.ts)), which
reports no undo snapshot as available when the reason is a concession or a player leaving, so the
overwrite can change what the client is told.

### Working process

For each workstream:

1. Discuss its concrete design and agree on a bounded scope. The owner prefers the concerns
   elaborated with concrete examples and code snippets of the proposed changes, and approves the
   design before any implementation starts.
2. Establish focused regression coverage.
3. Implement and validate the agreed changes (commands in the
   [resume checklist](#resume-checklist)).
4. Have the result reviewed independently, apply only the follow-ups the owner approves, and
   record the rest as open decisions.
5. Update this document with decisions, progress, and deferred work.

Do not spend effort on timing or performance comparisons for this work.

Visibility and finalization are independent of targeting; their position is an execution order,
not a technical dependency.

### Explicitly deferred from the pre-pass

- Consolidating opponent filters before defining "an opponent" versus "all opponents" and their
  card-filter equivalents.
- Recipient-cardinality audits and multiple-opponent support decisions.
- Broad serialization or test-type restructuring; multi-player fixtures, ownership references,
  and diagnostic captures remain part of the main player-generalization work.
- Player elimination, format-specific match termination, group matchmaking, and multiplayer
  result semantics.

## Architecture categories and open design decisions

### 1. Player roster, relationships, and player-count invariants

**Current assumptions:** Each player has a scalar opponent. Looking up another player returns the
first other player, and game construction explicitly requires exactly two players.

**Open design decisions:**

- Permanent game roster versus currently participating players.
- Stored versus derived opponent relationships, including behavior after elimination.
- Stable player identity and explicit seat order versus an unordered player collection.
- Where the currently enforced two-player limit belongs.

**Relevant code:** [Player](../server/game/core/Player.ts),
[Game](../server/game/core/Game.ts), and
[GameConfiguration](../server/game/core/GameInterfaces.ts).

### 2. Consistent "enemy," "friendly," and player-filter semantics

**Current assumptions:** Relative-player filters distinguish self, opponent, and any, but their
implementations do not all mean the same thing. Card selectors enumerate one specific opponent;
ongoing card effects can match anything not controlled by self; ongoing player effects match one
specific opponent. These interpretations agree in 1v1 but diverge with more players.

**Open design decisions:**

- Relationship filters versus concrete player identities.
- Filters covering one player or a set of players.
- Owner versus controller semantics.
- Consistency across card targeting, costs, ongoing effects, damage restrictions, and state-watcher
  queries.

**Relevant code:** [RelativePlayer](../server/game/core/Constants.ts),
[BaseCardSelector](../server/game/core/cardSelector/BaseCardSelector.ts),
[OngoingCardEffect](../server/game/core/ongoingEffect/OngoingCardEffect.ts), and
[OngoingPlayerEffect](../server/game/core/ongoingEffect/OngoingPlayerEffect.ts).

### 3. Player selection, legality, and automatic resolution

**Current assumptions:** The player target resolver constructs two-player choices. Its legal-target
detection is explicitly a placeholder, and its interface lacks filtering facilities comparable to
card selectors.

**Open design decisions:**

- Expressing eligible players and filtering candidates by effect legality.
- Zero, one, or multiple eligible-player behavior.
- Single-player versus multiple-player selections.
- Stable selection identifiers and labels that distinguish multiple opponents.
- Automatically resolving a forced opponent choice in 1v1 while prompting when multiple opponents
  are eligible, without removing meaningful self-versus-opponent choices.

**Relevant code:**
[PlayerTargetResolver](../server/game/core/ability/abilityTargets/PlayerTargetResolver.ts),
[target interfaces](../server/game/TargetInterfaces.ts), and
[SelectPlayerSystem](../server/game/gameSystems/SelectPlayerSystem.ts).

### 4. Separating the actor, chooser, recipient, and ability beneficiary

**Current assumptions:** Target choosers, optional-ability decision makers, and ability controllers
can be inferred through self/opponent. Bounty abilities are a notable example where the ability's
beneficiary can differ from the card's controller.

**Open design decisions:**

- Eligible ability resolvers versus the actual resolver for a particular event.
- Carrying event-derived beneficiaries and choosing players through ability contexts.
- Distinguishing "choose an opponent" from "the affected card's controller makes this choice."
- Preserving pre-targeting, cost-payment, and optional-choice timing when another player chooses.

**Relevant code:** [TargetResolver](../server/game/core/ability/abilityTargets/TargetResolver.ts),
[AbilityResolver](../server/game/core/gameSteps/AbilityResolver.ts),
[PlayerOrCardAbility](../server/game/core/ability/PlayerOrCardAbility.ts),
[AbilityContext](../server/game/core/ability/AbilityContext.ts), and
[BountyAbility](../server/game/abilities/keyword/BountyAbility.ts).

### 5. Semantic migration of card implementations

**Current assumptions:** Card implementations directly access an opponent's hand, deck, discard,
base, and historical events. Other uses filter enemy cards or compare statistics between players.
These usages are not interchangeable.

**Open design decisions:**

- Classifying each usage as one selected opponent, every opponent, any enemy card, a particular
  event/card-associated player, or a comparison or aggregate over opponents.
- Preserving the intended player scope across conditions, follow-on effects, and historical queries.
- Identifying shared authoring patterns so individual cards do not duplicate selection logic.

Existing TODOs illustrate distinct cases: Aggrieved Parliamentarian accesses an opponent's discard,
while Single Reactor Ignition couples base damage to defeated units controlled by that opponent.

**Relevant code:** [card implementations](../server/game/cards/),
[AggrievedParliamentarian](../server/game/cards/03_TWI/units/AggrievedParliamentarian.ts), and
[SingleReactorIgnition](../server/game/cards/07_LAW/events/SingleReactorIgnition.ts).

### 6. Zone queries, ownership, and control transfers

**Current assumptions:** Arenas are already shared, game-owned collections, and player-specific zones
are instantiated per player. Stronger constraints exist in querying those zones and identifying
transfer participants. Some systems infer the recipient or donor through an opponent relationship.

**Open design decisions:**

- Queries across selected players or all enemies.
- Explicit donor and recipient identities for cross-player transfers.
- Ownership versus control for captured cards and upgrades.
- Cross-player zone behavior when a participant leaves play.

The shared arena structure does not appear to require a wholesale rewrite.

**Relevant code:** [AllArenasZone](../server/game/core/zone/AllArenasZone.ts),
[PlayerZone](../server/game/core/zone/PlayerZone.ts),
[BaseCardSelector](../server/game/core/cardSelector/BaseCardSelector.ts),
[ResourceCardSystem](../server/game/gameSystems/ResourceCardSystem.ts), and
[TakeControlOfResourceSystem](../server/game/gameSystems/TakeControlOfResourceSystem.ts).

### 7. Turn order, passing, initiative, and claim counters

**Current assumptions:** Active-player rotation alternates through the opponent property. Passing
uses a previous-pass boolean and can permanently pass both players. Initial initiative selection is
binary, and the existing Blast counter effect damages one opponent's base.

**Open design decisions:**

- Explicit cyclic seat order and eligibility for the next action.
- Consecutive passes versus permanent round passes and phase termination.
- Additional-action behavior within generalized turn progression.
- Which initiative and claim-counter behavior belongs to format policy rather than generic
  scheduling.

**Relevant code:** [Game](../server/game/core/Game.ts),
[ActionWindow](../server/game/core/gameSteps/ActionWindow.ts),
[ActionPhase](../server/game/core/gameSteps/phases/ActionPhase.ts),
[SetupPhase](../server/game/core/gameSteps/phases/SetupPhase.ts), and
[ClaimCounterSystem](../server/game/gameSystems/ClaimCounterSystem.ts).

### 8. Trigger ordering and multi-recipient effect resolution

**Current assumptions:** Trigger windows store unresolved abilities by player, but the
resolution-order prompt constructs only the two possible pair orderings. Player-target systems
accept arrays but default to one opponent. Array acceptance does not guarantee multi-recipient
behavior: indirect damage uses the first target when constructing damage distribution.

**Open design decisions:**

- Encoding format-required trigger order.
- Per-recipient versus aggregate events.
- Sequential versus simultaneous application to multiple players.
- Modifier accounting for multi-recipient effects.
- Trigger timing relative to affected players completing their choices.

**Relevant code:**
[TriggerWindowBase](../server/game/core/gameSteps/abilityWindow/TriggerWindowBase.ts),
[PlayerTargetSystem](../server/game/core/gameSystem/PlayerTargetSystem.ts), and
[IndirectDamageToPlayerSystem](../server/game/gameSystems/IndirectDamageToPlayerSystem.ts).

### 9. Combat participants and damage routing

**Current assumptions:** An attack stores one defending player from the first target. Combat damage
resolution explicitly notes this assumption when routing Overwhelm damage to one base. Some attack
targeting is already more general, including Sentinel checks against the selected target's
controller.

**Open design decisions:**

- Defending participants for multi-unit attacks.
- Per-target Overwhelm destinations.
- Combat-related ability roles.
- Preserving controller and last-known-information associations when targets leave play or change
  control.

**Relevant code:** [Attack](../server/game/core/attack/Attack.ts),
[AttackFlow](../server/game/core/attack/AttackFlow.ts), and
[AttackStepsSystem](../server/game/gameSystems/AttackStepsSystem.ts).

### 10. Player elimination versus game termination

**Current assumptions:** One defeated base ends the game; two defeated bases produce a draw.
Concession, timeouts, and lobby departures similarly award the game to another player.

**Open design decisions:**

- Player elimination state versus match termination.
- Format-defined result-finalization timing.
- Pending effects and prompts involving eliminated players.
- Cross-owned cards and counters after elimination.
- Distinct policies for concession, timeout, departure, and disconnection.

This is a future-format behavior seam even if elimination is not implemented during the preparatory
refactor.

**Relevant code:** [Game](../server/game/core/Game.ts),
[LoseGameSystem](../server/game/gameSystems/LoseGameSystem.ts), and
[Lobby](../server/gamenode/Lobby.ts).

### 11. Information visibility and prompt presentation

**Current assumptions:** Card visibility helpers recognize the controller and one opponent.
Ongoing-effect summaries also use that opponent relationship. Some prompts clear selection
highlights for one opponent, although the underlying prompt infrastructure already iterates over
all players.

**Open design decisions:**

- Visibility per viewer, including spectators and eliminated players.
- Private viewing versus public reveals.
- Identifying the actual waiting or choosing player.
- Resetting prompt and highlight state for every non-choosing participant.

**Relevant code:** [Card](../server/game/core/card/Card.ts),
[OngoingEffectEngine](../server/game/core/ongoingEffect/OngoingEffectEngine.ts),
[SelectCardPrompt](../server/game/core/gameSteps/prompts/SelectCardPrompt.ts), and
[UiPrompt](../server/game/core/gameSteps/prompts/UiPrompt.ts).

### 12. Undo consent, information exposure, and snapshots

**Current assumptions:** Rollback requests ask one opponent for confirmation, and confirmation checks
examine that opponent's activity. Snapshot management also contains timepoint-distance heuristics
whose correctness needs revisiting with arbitrary player order.

**Open design decisions:**

- Whose consent is required for a rollback.
- Detecting actions or information revealed by any other participant.
- Correctly snapshotting future seat-order, passing, and participation state.

Existing per-player snapshot collections are useful foundations.

**Relevant code:** [Game](../server/game/core/Game.ts),
[SnapshotManager](../server/game/core/snapshot/SnapshotManager.ts), and
[snapshot interfaces](../server/game/core/snapshot/SnapshotInterfaces.ts).

### 13. Lobby capacity, readiness, matchmaking, and rematches

**Current assumptions:** Lobby capacity is hardcoded to two seats. Connection/readiness and Bo3
transitions contain pair assumptions. Matchmaking finds pairs and returns a two-player tuple; rules
evaluate pairs and retain one previous opponent.

**Open design decisions:**

- A shared capacity or format-capability source.
- Ordered lobby participants.
- Group readiness and cancellation.
- Pairwise versus group matchmaking restrictions.
- Which rematch and Bo3 features remain explicitly duel-only.

**Relevant code:** [Lobby](../server/gamenode/Lobby.ts),
[QueueHandler](../server/gamenode/QueueHandler.ts),
[MatchmakingRules](../server/gamenode/MatchmakingRules.ts), and
[GameServer](../server/gamenode/GameServer.ts).

### 14. Client-facing contracts, bug captures, and player reports

**Current assumptions:** Normal live game state already uses a player-ID-keyed collection. Other
contracts are pair-oriented: game previews expose player-one/player-two fields, bug-state capture
rejects non-two-player games, and report schemas contain one opponent. Reporting infers the first
other participant.

**Open design decisions:**

- Stable participant IDs and seat/status metadata.
- Payload compatibility.
- Multi-player diagnostic captures.
- Explicit report-subject selection rather than assuming the opponent is the subject.

Client implementation consequences are outside this repository.

**Relevant code:** [Game](../server/game/core/Game.ts),
[Lobby](../server/gamenode/Lobby.ts), and
[serialization and report interfaces](../server/game/Interfaces.ts).

### 15. Results, deck statistics, and external integrations

**Current assumptions:** Lobby statistics processing explicitly requires two players and derives
one winner/loser pair. Matchup statistics describe one opposing deck. SWUStats payloads are
pair-shaped, while SWUBase submission also takes two players despite using an array in its payload.
Both submissions are currently gated to Premier.

**Open design decisions:**

- Per-player outcomes and matchup meaning in multiplayer.
- Result persistence.
- Which integrations remain deliberately unsupported rather than receiving an incorrectly adapted
  duel result.

**Relevant code:** [Lobby](../server/gamenode/Lobby.ts),
[DynamoDBInterfaces](../server/services/DynamoDBInterfaces.ts),
[SwuStatsHandler](../server/utils/statHandlers/SwuStatsHandler.ts), and
[SwuBaseHandler](../server/utils/statHandlers/SwuBaseHandler.ts).

### 16. Test harness and reproducible game setups

**Current assumptions:** The integration harness constructs two players and exposes two fixed
wrappers. Setup helpers handle ownership, decks, zones, and control-swapped cards as a pair.

**Open design decisions:**

- Collection-based fixtures while preserving existing test ergonomics.
- Unambiguous ownership and control references.
- Generalized prompt and phase-driving helpers.
- Testing preparatory abstractions without implicitly enabling unsupported four-player games.

**Relevant code:** [GameFlowWrapper](../test/helpers/GameFlowWrapper.js),
[GameStateBuilder](../test/helpers/GameStateBuilder.js), and
[IntegrationHelper types](../test/helpers/IntegrationHelper.d.ts).

## Cross-cutting distinction

The central distinction is between:

1. A relationship covering multiple players.
2. One concretely resolved player.
3. An ordered set of participating players.

These concepts currently collapse into "the opponent." Separating their meanings is the architecture
question; enabling four-player rules, lobbies, and outcomes is a separate step.
