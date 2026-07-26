# Plan 5 — GameObject Release & Recreation

**Status:** Proposed (revised after adversarial review)
**Depends on:** Plan 3 (class registry, per-class serializers); Plan 1 work item B (uuid counter restore + rollback registration guard). Coordinates with Plan 4 (its rollback-registration guard spec gains 5a's rehydration-scope companion case — see A2).
**Unblocks:** Plan 6 (full-fidelity save); bounded memory for long games
**Shape:** Three separately-landable stages (5a infrastructure + leaf recreation, 5b composite recreation + closure recipes, 5c release policy). Each stage is useful alone. Cards moved from 5a to 5b — see the staging note in 5a.

## Goal

Remove the engine's foundational workaround: every GameObject ever created is
currently kept in memory for the lifetime of the `Game`, because rollback can
only *mutate* live instances. After this plan, a GameObject absent at restore
time can be **recreated from its serialized state**, and objects no longer
reachable from any retained snapshot structure or live reference can be
**released**.

The codebase already anticipates this — `GameObjectUtils.ts:751` (pre-Plan-3):
`// STATE TODO: Once objects can be GC'd and we can recreate objects during
rollback, this will need to happen *after* the new objects are created.` —
and `GameStateManager._isRollingBack` exists (`GameStateManager.ts:35-36`),
which Plan 1B activates as a hard-fail registration guard. That guard and this
plan's recreation path must be reconciled explicitly; A2 does so.

## Ground truth: the six blockers (as of main `7a0526549`)

1. **No construction path in restore.** `rollbackToSnapshot` iterates live
   `allGameObjects` and calls `setState`; snapshot uuids with no live object
   are silently ignored (`GameStateManager.ts:157-175`).
2. **No class identity in serialized state.** The uuid prefix
   (`getGameObjectName()`) is a display label (~12 overrides; every card is
   `Card_N`). Only cards (`server/game/cards/Index.ts`), tokens
   (`Game.initialiseTokens`), and state watchers (`StateWatcherRegistrar`,
   idempotent by enum — the best in-repo model) have id→constructor maps. The
   ~85 `@registerState()` classes across 80 files have no factory registry —
   and two distinct gap sets must not be conflated: (i) three classes live
   under `server/game/cards/**` (`Bamboozle.ts`,
   `FirstLightHeadquartersOfTheCrimsonDawn.ts`, `Advantage.ts`), territory
   Plan 3's static generator explicitly treats as unresolvable; (ii) three
   classes are **non-exported** (module-local), so no generated registry can
   import them: `PlayBamboozleAction` (`Bamboozle.ts:55`),
   `FirstLightSmuggleAction` (`FirstLightHeadquartersOfTheCrimsonDawn.ts:40`),
   and `CustomDurationEvent` (`OngoingEffectEngine.ts:20` — in core, not
   cards; `AdvantageAbility` by contrast is exported, `Advantage.ts:26`).
   The factory registry must miss neither set; A1 records the decided
   handling.
3. **Fail-fast refs.** `getFromUuidUnsafe` escalates a miss to
   `SevereHaltGame`; no lazy/materialize-on-demand hook exists.
4. **Closures are object identity** for abilities/effects: props objects with
   up to 32 function-typed keys (`server/game/Interfaces.ts`), held outside
   state (`PlayerOrCardAbility.properties`, `OngoingEffect.ongoingEffect`,
   `DynamicOngoingEffectImpl.calculate`, `CustomDurationEvent.handler`).
5. **Listener identity on `Game`.** Five per-object holders register raw
   closures via `game.on` and unregister by function identity
   (`TriggeredAbility`, `StateWatcher`, `CustomDurationEvent`,
   `RepeatableAbilityLimit`, `EventRegistrar` users). (The sixth `game.on`
   site, `UnitProperties.ts:119-151`, is a static game-level rules
   registration, not a per-object holder — out of scope for recreation.)
   The current mitigation — an `isRegistered`
   boolean in state reconciled by `afterSetState` — works only because the
   object survives.
6. **Construction is not atomic.** The `@registerState` /
   `buildAutoInitializingCardClass` wrappers call `initialize()` *inside the
   constructor* (`GameObjectUtils.ts:263-268`, `:321-327`); for cards,
   `onInitialize` runs `setupStateWatchers` and `setupCardAbilities`
   (`Card.ts:382-386`, `StandardAbilitySetup.ts:25-40`,
   `NonLeaderUnitCard.ts:104`), which **constructs and organically registers
   more GameObjects**: every ability, every ability's `AbilityLimit`
   (`CardAbility.ts:22` mints an `UnlimitedAbilityLimit` when none is given),
   `InitiateAttackAction` (`UnitProperties.ts:330` — in the constructor chain,
   before `initialize()` even runs). "Construct an instance without side
   effects, link later" is structurally impossible for composites; the
   recreation protocol in 5b is designed around this.

Favorable facts: `Attack`, `GameEvent`, `AbilityContext`, `GameSystem`,
`TargetResolver`, and the entire pipeline are already outside the GameObject
graph and recreated freely. Rollback happens only at pipeline-quiescent
timepoints, so mid-resolution *pipeline* objects (`then`/`ifYouDo` steps, most
`createWithoutRefsUnsafe` sites) never survive to a snapshot boundary and need
no recreation story — but resolution-*created* lasting effects **do** survive
snapshot boundaries and are classified explicitly in 5b. Printed card
abilities are deterministically re-derivable (see 5b). 1,849 of ~1,935
concrete classes are cards, which share one construction path.

---

## Stage 5a — Lifecycle infrastructure + leaf-family recreation

**Staging note.** 5a's recreation targets are **leaf families only** — objects
whose constructors register nothing but themselves (`AbilityLimit` variants,
`TrackedGameCardMetric` at `GameStatisticsTracker.ts:40`). Cards and tokens are
composites (blocker 6) and move to 5b; a stage that included "a token card"
would drag the entire composite-matching machinery into 5a. The scope
mechanism in A2 is still built here, because even a leaf constructor registers
organically and the machinery is identical — a leaf is simply a scope that
collects exactly one object.

**A1. Class tags + factory registry.** Every serialized state record gains a
stable `classTag`. Extend the Plan-3 generated registry to also emit factory
entries: `classTag → (game, record, links) => instance`. Handle the
`@registerState` anonymous wrapper class (registry keys on the declared class
name, as `buildAutoInitializingCardClass` already does for cards) and both
gap sets from blocker 2. **Decided (resolves the open decision flagged in
`03-codegen-serializers.md`, "Plan 5 handoff"):** the three non-exported
`@registerState` classes — `PlayBamboozleAction`, `FirstLightSmuggleAction`,
`CustomDurationEvent` — are **exported** so the generated factory registry
can import them, and the generator **hard-forbids new module-local
`@registerState` classes** going forward (a non-exported `@registerState`
class is a generation-time failure, same enforcement tier as Plan 3's
coverage cross-check). No self-registration hook. The cards-directory
classes the static resolver can't traverse (`Bamboozle.ts`,
`FirstLightHeadquartersOfTheCrimsonDawn.ts`, `Advantage.ts`) get explicit
registry entries per Plan 3's coverage cross-check.
Cards use the card constructor map keyed by `cardData` id — but note
card construction today is **async** (`server/utils/deck/Deck.ts:207-228`
awaits `cardDataGetter.getCardBySetCodeAsync` at `:218`) and rollback is
synchronous, and a released card's `cardData` dies with it. Therefore: build a
game-lifetime synchronous `id → ICardDataJson` cache, populated at deck build
and token init (generalize the token pattern — `Game.initialiseTokens`
captures `cardData` in its factories, `Game.ts:1585-1591`), and persist the
set-code/id in each card's record. Tokens key by token enum; watchers by
`StateWatcherName`. **Flag for Plan 6:** `classTag` = TS class name is a
runtime coordinate, not a stable one (standing invariant 2 excludes class
names). Fine for in-memory rollback; when Plan 6 dumps records to disk, a
class rename invalidates saves — handed to Plan 6, which answered in its
work item D: **no aliasing layer** — the schema-surface hash makes a rename
a loud engine-tier incompatibility that degrades to the semantic tier, and
renaming a `@registerState` class becomes a release-noted save-breaking
change.

**A2. Registration during rollback: the rehydration scope.** Plans 1B and 4
pin "rollback performs zero registrations" with a hard-fail guard
(`_isRollingBack` → `register()` asserts) and a dedicated spec. Recreation
requires registration during rollback, and — because of blocker 6 — those
registrations arrive through the *same organic* `register()` call in the
`GameObjectBase` constructor (`GameObjectBase.ts:87`), not through a separable
API. Naively disabling the guard reinvites exactly the silent uuid-drift bug
class it exists to catch (`register()` silently overwrites
`gameObjectMapping`, `GameStateManager.ts:93`). The design:

- **`GameStateManager.beginRehydrationScope(record)` / `endRehydrationScope()`**
  (only legal while `_isRollingBack`). While a scope is active, `register()`
  does not hard-fail; instead it assigns the object a **scratch uuid** from a
  reserved namespace (e.g. `rehydrating_<n>`, scope-local counter — never a
  real uuid shape) and collects it into the scope instead of the global
  containers. The global `_lastGameObjectId` is untouched by scope
  registrations — rehydration is counter-neutral by construction, which is
  what preserves Plan 1B's uuid reproducibility (the stated reason this plan
  depends on 1B).
- **The guard's contract is amended, not deleted:** "during rollback, any
  registration *outside an active rehydration scope* hard-fails." The Plan 1B
  assert and Plan 4's "registration during delta rollback asserts" spec keep
  their tests and gain a companion spec: registration *inside* a scope
  succeeds, is matched, and is rekeyed. (Cross-plan: Plan 1B's spec text
  changes from "zero registrations" to "zero *organic* registrations" —
  Plan 4's doc already uses the organic phrasing and anticipates this
  carve-out; the guard implementation gains the scope carve-out. Plan 4's
  delta-rollback path opens no scopes until this plan's delta integration
  lands, so its behavior is unchanged until then.)
- **Scope close: match → rekey → adopt.** Each collected object is matched to
  a serialized record (per-family coordinates — trivial for 5a leaves, the
  full table is in 5b), then **rekeyed**: scratch mapping entry dropped, the
  record's original uuid assigned via a rehydration-only internal setter
  (`GameObjectBase.ts:73-76`'s single-assignment assert gets a variant that
  permits exactly one scratch→real transition while the scope is active, and
  no other reassignment ever), and the object is inserted into
  `gameObjectMapping`/`allGameObjects` with a **new occupancy assert**: the
  key must be unoccupied (this also fixes the silent-overwrite hazard at
  `GameStateManager.ts:93` that Plan 1B flags). Collected objects with no
  matching record are discarded if `!hasRef` (the transient case — mirrors
  `removeUnusedGameObjects` culling) and are a hard failure if `hasRef`
  (coordinate scheme missed a family). A post-close dev sweep asserts no
  scratch-shaped uuid appears anywhere in the scope objects' serialized state.
  Implement scope close with the *match* step factored from the *rekey* step
  so the key policy is pluggable: Plan 6's loader (its work item C) reuses
  scope close in a pairing mode — match collected objects to records exactly
  as here, but record a `fileUuid → liveUuid` pairing and keep live uuids
  rather than adopting the record's uuid. The occupancy assert and the
  no-scratch-leak sweep apply unchanged under either key policy. (That load
  runs outside any rollback, so when Plan 6's work item C lands, the scope's
  only-while-`_isRollingBack` gate gains a load-mode counterpart — the
  amendment 06 C records.)
- **Failure mid-rehydration (the nested recovery path).** Order the restore so
  all recreation scopes run **before** any existing object's state is
  overwritten; a throw during recreation then leaves every pre-existing live
  object untouched. On any throw, the existing recovery path
  (`rollbackToSnapshot(beforeRollbackSnapshot)`, `GameStateManager.ts:190-199`)
  handles partially-recreated objects for free: `beforeRollbackSnapshot` was
  serialized from live state before the rollback, so recreated uuids absent
  from it are processed as removals by the standard path (`cleanupOnRemove` +
  registry drop) — provided (a) any scope active at throw time is force-closed
  with its scratch objects discarded, and (b) `cleanupOnRemove`
  implementations tolerate partially-initialized objects (audit + null-guards;
  a dedicated spec forces a mid-rehydration throw and asserts clean recovery
  and zero leaked registrations). The recovery rollback itself needs no
  recreation: every uuid in `beforeRollbackSnapshot` is live by construction.

**A3. Restore order: recreate → overlay → rehydrate.** Constructors need live
refs (`Card` needs `Player`; `CaptureZone` needs a captor `Card`;
`OngoingEffect` needs source `Card` + impl). Restore order becomes:

1. Determine the recreation set: snapshot uuids with no live instance. A
   composite closure (see the eviction-unit rule in 5b) appears here as one
   unit: its root plus its recorded constructor-time fan-out.
2. Recreate in **ascending numeric uuid order** — the numeric suffix is global
   creation order (`GameStateManager.ts:87-88`), so this reproduces original
   dependency order for the non-cyclic majority (Player before its cards,
   captor before its `CaptureZone`, source before its effect) with no
   deferred-link machinery. Each recreation runs the real factory inside a
   rehydration scope (A2); constructor arguments that are object refs resolve
   through the registry (already-live or already-recreated by ordering).
   Recreation-set uuids already produced by an earlier scope's composite
   fan-out are **skipped** — they were matched and rekeyed at that scope's
   close, not recreated standalone.
   Reserve a deferred-link variant for genuine cycles only if one is actually
   hit (none are known: `Player`/`Zone`/engine singletons are pinned by 5c
   policy and never in the recreation set).
3. Scope close registers everything under original uuids — now every ref
   resolves. **The `Game.state` container swap lands here, after all
   recreation scopes close and before any state overlay** (today
   `game.state = v8.deserialize(...)` runs first, `GameStateManager.ts:152` —
   this plan moves it). Placing the swap after recreation makes A2's
   failure-ordering claim true as stated: a throw during recreation leaves
   every pre-existing live object *and* the live `Game.state` untouched. If
   implementation finds recreation-time constructors genuinely need the
   restored `Game.state` (none is known to), the fallback is swap-before —
   in which case A2's "untouched" claim must be re-qualified to lean on the
   recovery path (`beforeRollbackSnapshot` also restores `Game.state`).
4. Deserialize state into every object (existing + recreated). This
   naturally lands where the old `copyState` ordering TODO pointed: ref
   hydration happens after the new objects exist. Recreated composites get
   their fan-out children's state overlaid too (limits' `useCount`,
   abilities' `isRegistered`, `nextAbilityIdx`, …).
5. `onRehydrate()` — new lifecycle hook, symmetric to `cleanupOnRemove`:
   re-register listeners, rebuild caches. Then the existing
   `afterSetState` / `afterSetAllState` passes.

**A4. Recipe data: the non-state constructor-config audit.** Serialized
records today carry only mutable-undo state; constructor configuration is
plain fields and **absent from the record** — e.g. `PerGameAbilityLimit.max`
is a plain `readonly` ctor arg and `currentUser` a plain mutable field
(`AbilityLimit.ts:107-117`), same for `PerPlayerPerGameAbilityLimitBase.max`
(`:146`) and `RepeatableAbilityLimit.eventName`. A factory cannot conjure
these from `(game, record, links)`; recreating without them silently produces
a wrong object (invariant 4 violation no test would catch). Work item, and
**the actual bulk of 5a — size it as such**: for every family in the
recreation set, audit non-state config; each field either becomes decorated
state or goes into a per-class **recipe section** of the record, emitted at
serialize time by the generated serializer (Plan 3's encoders; recipe values
must be JSON-safe per invariant 1 — enum sets, numbers, strings). Every
record's recipe section must also carry the object's **stable matching
coordinate** (the per-family coordinates tabulated in 5b —
`abilityIdentifier`, `(classTag, ordinal-within-scope)`, etc.): scope close
matches against it here, and Plan 6's loader (its work item C) matches file
records to live objects by exactly these coordinates. The audit
list is enumerable per family and grows with each family enabled in 5b.

**A5. Listener registration from state.** Generalize the `isRegistered`
pattern: registration state (which events, active or not) lives in state;
handlers are rebuilt in `onRehydrate` and tracked by registration record (not
raw function identity) so a recreated object can unregister listeners it
didn't originally register. Closes the TODOs at `Card.ts:1143` and
`TriggeredAbility.ts:242` ("aggregateWhen is readonly, which means we can
reliably recreate the eventRegistrations array" — literally this design; the
separate trigger-removal lifecycle TODO at `TriggeredAbility.ts:301` is not
this work item).

**A6. Inbound-pointer rule (applies from the first eviction).** Plain
(undecorated) JS fields are never rehydrated — only decorated fields pass
through restore. Evict X, recreate X′ under the same uuid, and any live
object holding a plain-field pointer to X keeps using X (increments its
counters, fires its handlers) while the registry, snapshots, and every
state-ref hydration use X′ — silent split-brain, no `SevereHaltGame`. This
hazard exists from 5a's very first force-evict test: the flagship eviction
target `AbilityLimit` is pointed to by exactly such a field
(`PlayerOrCardAbility.limit`, `PlayerOrCardAbility.ts:54`), and points back
via one (`AbilityLimit.ability`, `AbilityLimit.ts:29`). **Rule: a family may
enter the evictable set — even test-only — only after its inbound
plain-pointer audit is clean**: every live pointer to instances of that family
is either a decorated state ref or re-derived in `onRehydrate`. For 5a's leaf
families that means converting the `ability ↔ limit` link (both directions)
in this stage. The detection mechanism is part of acceptance, below.

**5a acceptance:**
- Force-evict a leaf object (a `PerGameAbilityLimit` with a non-default `max`,
  a `RepeatableAbilityLimit` with registered listeners, a
  `TrackedGameCardMetric`), roll back, assert recreation with identical
  serialized state (deep-compare recreated vs. pre-eviction record), working
  refs, functioning listeners, and correct recipe fields (`max`,
  `eventName`).
- **Stale-pointer detection:** in test mode, release/evict poisons the old
  instance (a `_released` flag asserted in hot `GameObjectBase` entry points
  such as `getObjectId`) and registers it with a `FinalizationRegistry`; the
  spec asserts the old instance is never touched again *and* becomes
  collectable (proving no lingering hard refs). This detects the split-brain
  failure the naive "assert on the new instance" test cannot.
- Mid-rehydration-throw spec: recovery restores pre-rollback state, no leaked
  registrations, no scratch uuids in any mapping.
- Registration-guard specs: organic registration during rollback still
  hard-fails; scope registration succeeds and rekeys; mapping-occupancy
  assert fires on collision.
- Full suite + undo-all-tests green with recreation active for the leaf
  families.

## Stage 5b — Composite recreation and closure recipes for the hard tail

### The composite protocol (cards and tokens)

Recreating a card is not one construction but a deterministic side-effect
fan-out (blocker 6). The mechanism: run the real card constructor inside a
rehydration scope; the scope collects the card **and** everything its
constructor chain and `setupCardAbilities`/`setupStateWatchers` registered;
match each collected object to a record; rekey; overlay state. Matching
coordinates, per family in the fan-out — every family must have one:

- **The root (card):** matched by construction — the scope was opened for its
  record.
- **Printed abilities:** `abilityIdentifier = internalName_type_idx`
  (`Card.ts:555-562`); re-running setup replays the same
  `nextAbilityIdx` sequence deterministically (the counter is in state,
  `Card.ts:319-320`, and is overlaid *after* matching).
- **Ability limits:** `(owning ability's coordinate, role='limit')` — exactly
  one limit per ability, reachable from the matched ability; classTag must
  agree with the record's.
- **State watchers:** not constructed anew — `StateWatcherRegistrar` is
  idempotent by `StateWatcherName` and watchers are pinned singletons; setup
  re-runs must resolve to the existing live instances (verify the registrar's
  dedupe path holds during rehydration).
- **Everything else in the fan-out** (`InitiateAttackAction` and any
  non-`CardAbility` construct with no semantic identifier): `(classTag,
  ordinal-within-scope)`. This is sound because setup is deterministic — same
  code, same `cardData`, same construction sequence — which is already the
  premise of "printed abilities are re-derivable." The serializer records the
  ordinal at original creation time (scope-relative creation index, part of
  the record's recipe section). Dev-assert on any mismatch: collected count,
  classTag sequence, or coordinate collision is a hard failure, never a
  best-effort match.

**Eviction unit (decided): atomic, at exactly two granularities.** An
eviction is either (i) a **standalone-factory leaf** (5a families), or (ii) a
**composite closure** — a root plus its *entire* constructor-time fan-out,
evicted together. Partial eviction of a composite is unsupported and excluded
by construction, in both directions: a child evicted under a live root has no
standalone factory (a printed `TriggeredAbility` constructor requires
closure-bearing props, `PlayerOrCardAbility.ts:66,77`) and its card's uuid is
occupied by the live instance, so no scope can open — A3 step 2 would
hard-fail; a root evicted under live children would re-run setup and collide
freshly-constructed fan-out instances with uuids held by the live children at
scope close — the occupancy assert (A2) fires. **Fan-out membership is
recorded at construction time**: the rehydration scope already collects
exactly this set when a composite is first built (and the serializer records
scope-relative ordinals), so the composite closure's member uuids are
persisted with the root's record. Fuzz eligibility (see Verification) is
computed from per-family flags *plus this rule* — leaves are individually
eligible; a composite is eligible only as a whole closure. A3 step 1 treats a
closure as one recreation unit and step 2 skips member uuids already produced
by the root scope's fan-out.

Worked uuid walk-through (the contract, in one example): `wampa`'s
`TriggeredAbility` holds uuid `PlayerOrCardAbility_57` in the snapshot. The
card's factory re-runs setup; the ability registers into the scope as
`rehydrating_3`. Scope close matches it to the `PlayerOrCardAbility_57` record
via `wampa_triggered_0`; the scratch mapping entry is dropped, the
rehydration-only uuid setter assigns `PlayerOrCardAbility_57`, and the mapping
gains that key under the occupancy assert. `_212`-style ids are never minted:
scope registrations draw from the scratch namespace, `_lastGameObjectId` never
moves, and post-rollback organic creation continues from the Plan-1B-restored
counter. The card's `@stateRefArray` ability lists (`Card.ts:159-166`) hydrate
against the now-correct uuids in step 4 of A3.

### Closure-bearing families: recipes and honest classification

Each family below either gets a serializable **recipe** — the coordinates
needed to re-derive its closures, stored in the record — or is explicitly
classified non-recreatable and pinned.

- **Printed card abilities (re-derivable — wired by the composite protocol
  above).** Recipe is the card itself; state overlay restores limits,
  `isRegistered`, etc.
- **Gained abilities:** recorded today only by runtime uuid in
  `GainAbility._abilityUuidByTargetCard`, with a TODO admitting identifier
  collisions (`GainAbility.ts:82`). Recipe: `(sourceCardRef,
  sourceAbilityCoordinate, targetCardRef, gainKind)`; recreation re-derives
  props from the source card's definition and re-applies the grant. Requires
  fixing the gained-ability identifier scheme first (unique per grant
  instance). **Determinism caveat (mandatory):** the grant path consumes the
  *target* card's `nextAbilityIdx` (`addGained*Ability` →
  `createTriggeredAbility` → `buildGeneralAbilityProps`, `Card.ts:555-568`),
  and at re-grant time during rollback that counter holds either a
  fresh-construction or live post-timeline value — neither necessarily the
  original grant-time value — so any idx-derived coordinate drifts. The
  per-grant identifier must be **recorded in the snapshot record at grant
  time and never re-derived from `nextAbilityIdx` at re-grant time**; the
  re-grant-then-overlay ordering (A3 step 4 overlays state, including
  `nextAbilityIdx`, *after* the re-grant mutates it) is mandatory.
- **OngoingEffect — split into two sub-families; do not conflate them:**
  - **(a) Constant-ability effects** (`persistent()` from
    `setupCardAbilities`, `OngoingEffectSource.ts:20-23`): genuinely
    re-derivable. Recipe: source card + an effect coordinate minted at
    registration (`internalName_kind_idx`, same pattern as abilities);
    recreation re-runs the `propertyFactory` from the source card's
    definition. `DynamicOngoingEffectImpl.calculate` rides along (same props).
  - **(b) Resolution-created lasting effects: non-recreatable — pinned.**
    Their props are *resolution data, not definition data*:
    `CardLastingEffectSystem.getEffectFactoriesAndProperties` builds
    `{ matchTarget: card, ability: context.ability, ...otherProperties }`
    from the **resolved target** and context
    (`CardLastingEffectSystem.ts:111-119`), and `OngoingEffect` pins these as
    plain readonly fields plus closures (`OngoingEffect.ts:48-57`). `until`
    closures in card files capture resolution objects (e.g.
    `cards/02_SHD/events/GiveInToYourAnger.ts:23-27`). No
    registration-time coordinate can re-run this at rollback; recreating
    would mean replaying resolution (impossible at a quiescent point) or a
    parameter-capture recipe (serialize resolved `matchTarget` ref, duration,
    a JSON-safe parameter bag; hard-fail on `until` closures, which appear in
    only ~3 card files today) — real design work, **out of scope here and
    scheduled as a Plan 6 prerequisite (Plan 6 work item A)**, since
    full-fidelity save of a mid-phase game hits the same wall. Capture is
    scheduled, not optional, for two reasons recorded here: (1) the
    alternative exit — restricting full-fidelity saves to
    lasting-effect-free boundaries — is closed, because end-of-action-phase
    is **not** lasting-effect-free: per this plan's survey (below), ~12 card
    implementations create effects that survive it (`forThisRoundCardEffect`
    ×5 → `UntilEndOfRound`, `whileSourceInPlayCardEffect` ×4,
    `Duration.Custom` ×3); (2) v1 save/load's customer is bug-report
    attachment, and bugs occur mid-phase, so mid-phase saves are required.
    None of this changes the decision *here*: for in-memory rollback the
    family is pinned (never released) — capture does not weaken that — and
    the classification is **dev-asserted, not assumed** — the snapshot-time
    check below fails loudly if a non-recreatable, non-pinned object is
    alive.
  - Survey (this branch): 266 of 1,852 card impls register constant
    abilities; 239 (~13%) use resolution-created lasting-effect systems
    (`forThisPhaseCardEffect` ×217 dominates; `forThisPhasePlayerEffect` ×30,
    `forThisAttackCardEffect` ×26, `forThisRoundCardEffect` ×5,
    `whileSourceInPlayCardEffect` ×4, raw
    `cardLastingEffect`/`playerLastingEffect` in 11 files, 3 with
    `Duration.Custom`). Attack-duration effects expire inside the action and
    never reach a snapshot boundary; phase/round/custom ones survive many. At
    a typical boundary the *standing population* is dominated by
    constant-ability effects (one per registered constant ability per in-play
    card) with a handful of live lasting effects — but lasting effects are
    created and expire every phase in normal games, so the pinned set grows
    O(lasting effects per game). That is a linear, small-constant term (see
    5c's memory statement), acceptable to pin.
- **`OngoingEffectValueWrapper` (the headline memory family):** the wrapped
  `value` is a plain non-decorated field
  (`OngoingEffectValueWrapper.ts:11`) and Plan 1 deliberately keeps
  function-typed/GameObject-bearing values out of state. Split: **JSON-safe
  raw values** move into the record's recipe section at serialize time —
  exactly the JSON-safe decorated-value subset Plan 1A option 1 establishes
  (option 1 puts the values in decorated state; 5b serializes that subset
  into recipes — the stated reason Plan 1 prefers option 1; cross-plan
  note) — making those wrappers recreatable. **Function- or GameObject-bearing values and all
  wrapper subclasses** (e.g. `GainAbility`, `AdditionalPhaseEffect`,
  `GainKeyword`, `CloneUnitEffect`, `CopyStandardTriggeredAbilitiesEffect`,
  `GainNonKeywordAbilitiesFromUnitEffect`, `Restriction`,
  `UnitsEnterPlayReadyForPlayer`) are non-recreatable and pinned, enforced by
  the family flag. Note 5c's tier-1 release makes
  most wrapper release *independent of recreation* — see 5c — so this split
  costs less than it appears.
- **`CustomDurationEvent`: pinned-with-its-effect (decided).**
  `CustomDurationEvent`s are created in exactly one place, gated on
  `effect.duration === Duration.Custom` (`OngoingEffectEngine.ts:90-94`), and
  every `Duration.Custom` producer in the codebase is resolution-created —
  `Clone.ts:32`, `GiveInToYourAnger.ts:23`, `FivesIHaveProof.ts:30`, all
  inside `immediateEffect` closures; `DelayedEffectSystem` forbids Custom
  (`DelayedEffectSystem.ts:147-150`); constant abilities go through
  `persistent()`/`whileSourceInPlay()` (`OngoingEffectSource.ts`) and never
  mint Custom (`lastingEffect()`, the one other Custom site, has no callers).
  So every effect owning a `CustomDurationEvent` is in pinned sub-family (b),
  and the event is classified **unconditionally pinned with its effect** for
  in-memory rollback (it holds plain refs to the effect,
  `OngoingEffectEngine.ts:20-33`). Its recreation recipe — effect ref,
  re-derived by re-calling
  `OngoingEffectEngine.createCustomDurationHandler(effect)`
  (`OngoingEffectEngine.ts:313-320`) — is **deferred to Plan 6 work item A**,
  alongside `until` capture (the handler and the `until` closures are the
  same capture problem). The classification dev-assert (below) covers
  `CustomDurationEvent` explicitly.
- **Out of scope by design:** `then`/`ifYouDo` sub-steps and
  `createWithoutRefsUnsafe` transients (never survive to a snapshot
  boundary). **Assert the whole classification rather than assume it:** a dev
  check at snapshot time walks live tracked objects and hard-fails if any
  object is not in a recognized class — this is the
  same check that catches an un-flagged resolution-created lasting effect.
  The recognized classes are three: (recreatable family), (pinned family),
  and — once Plan 6's lasting-effect parameter capture lands (its work item
  A) — **(recreatable by capture)**, for lasting effects carrying capture
  recipes. In-memory rollback treats captured effects exactly as pinned;
  the third class only changes what the assert accepts and what save/load
  may recreate.

**5b acceptance:** undo-all-tests green with recreation enabled for cards,
tokens, and all recipe families; recreation-fuzz mode (see Verification)
covering composites; targeted specs: rollback recreates an evicted token card
end-to-end (fan-out matched, stale-pointer detection clean); rollback
recreates a card with an active gained ability; rollback recreates a
constant-ability ongoing effect with a dynamic value; a pinned custom-duration
lasting effect and its `CustomDurationEvent`s survive a rollback with
recreation active for other families (evictions exercised in the same
rollback) and still fire correctly afterwards; the classification dev-assert
demonstrably fails when a lasting effect is force-marked recreatable, and
covers `CustomDurationEvent` (pinned-with-its-effect).

## Stage 5c — Release policy (the payoff)

- **Define the retained reference set precisely.** An object's uuid is
  *retained* if it appears in any of: (i) full-snapshot records in any
  retention window (per-player action containers, phase containers); (ii)
  under Plan 4 — recorded old values in the global delta index, the pending
  live-tracker window, and any hollow current snapshot's materialization
  sources (delta rollback writes old uuid refs back through field
  deserializers; a released referent is a `SevereHaltGame`); (iii) manual
  snapshots (test-only today; per Plan 1 item D — a documented prerequisite,
  not scheduled work — a count bound must land with any feature that exposes
  them to clients).
- **Two-tier release criterion**, replacing the monotonic `hasRef` latch with
  per-uuid liveness:
  - **Tier 1 (no recreation story needed):** releasable when the uuid is in
    no part of the retained reference set *and* no live object holds a hard
    reference. Correctness cannot depend on recreation because nothing can
    ever reference the object again. This tier is where the memory claim
    lives: superseded value wrappers, expired ongoing effects (including
    pinned-family lasting effects *after* they expire and age out), their
    impls and `CustomDurationEvent`s, and removed gained-ability objects all
    age out of the retention windows naturally. **Pinned ≠ unreleasable
    forever; pinned = not releasable while still referenced.** The residual
    memory bound, stated honestly: bounded live set + bounded retention
    windows + (manual snapshots × objects per snapshot — test-only and few
    today; the cap arrives with client-facing bookmarks per Plan 1 item D's
    prerequisite contract) — the unbounded growth term is gone even though
    the non-recreatable families exist.
  - **Tier 2 (recreation-backed, per-family flag):** families with a
    *complete* recreation story (5a leaves, 5b recipe families — not Cards,
    which are pinned by the family policy below) may additionally
    be released while still referenced **only by manual snapshots**; a manual
    restore recreates them. This resolves the previous draft's contradiction
    (release criterion forbade the very scenario its acceptance test
    required): manual snapshots pin non-recreatable families (tier 1) and do
    not pin recreatable ones (tier 2). Never release anything referenced by a
    quick/delta window regardless of tier.
- **Liveness must see uuids inside `stateValue` payloads.** A third reference
  category hides from any decorated-ref graph: raw uuid strings in opaque
  state values — `GainAbility._abilityUuidByTargetCard` (`@stateValue`
  `Map<string,string>`, `GainAbility.ts:28`, dereferenced at `:129-158`) and
  StateWatcher entries (arbitrary `TState[]` containing `GameObjectId`
  strings; dev-enforced detectable in `StateWatcher.ts:90-114`). Work item:
  inventory uuid-bearing `stateValue` fields (bounded — the decorated-field
  list is enumerable); for each, either migrate to real ref decorators or
  register a per-field **ref extractor** the liveness tracker calls. Shape
  the extractor interface as extract-**and-rewrite**, not extract-only:
  Plan 6's load-time uuid translation (its work item C) reuses these same
  extractors to rewrite refs inside opaque `stateValue` payloads through its
  translation table. Enforced
  complete by a dev-mode deep scan for uuid-shaped strings at sweep time in
  tests — an extractor miss hard-fails. (Optional cheapening: Plan 3's JSON
  encoders could brand `GameObjectId` strings in `stateValue` payloads —
  coordinate, don't block on it.)
- **Hard-ref → state-ref conversion is staged per family with that family's
  release enablement** (rule A6), not batched here. The audit surface is
  larger and more bidirectional than the obvious three: `Player.playableZones`
  (`Player.ts:772` STATE note), `ZoneAbstract.owner`,
  `PlayerOrCardAbility.card`/`.properties` (`PlayerOrCardAbility.ts:65-66`),
  `ability ↔ limit` (done in 5a), `OngoingEffect.source/.impl/.matchTarget/
  .ongoingEffect` (`OngoingEffect.ts:48-57`), `CaptureZone.captor`
  (`CaptureZone.ts:18-21`, own STATE TODO),
  `UnitProperties.defaultAttackAction` (`UnitProperties.ts:330`) — plus a
  sweep for others (`Attack.previousAttack` and `GameEvent` chains pin cards
  indirectly; transient, but verify).
- **Release = unregister + `cleanupOnRemove`** (now with more implementations
  from 5a's listener work) and drop from both registry containers; in test
  mode also poison + `FinalizationRegistry`-track (5a's detection mechanism);
  the instance becomes GC-able. The latch replacement must also handle
  `alwaysTrackState` objects (`hasRef` is hard-true for them,
  `GameObjectBase.ts:53-55`): `alwaysTrackState` governs snapshot inclusion,
  not release policy — a released object is simply out of the registry and no
  longer serialized.
- **Sweep wiring:** `afterTakeSnapshot()` is currently a dead private stub
  with exactly this TODO and **no caller** (`GameStateManager.ts:225-228`) —
  wire it into the snapshot path, and define its interaction with the
  existing pre-serialize `removeUnusedGameObjects()`
  (`GameStateManager.ts:98-118`, called at `:136-141`). Under Plan 4, sweep
  only at **full-snapshot boundaries**, never per action delta — a mid-chain
  sweep races the delta window's recorded values (covered by criterion (ii),
  but don't rely on the backstop).
- **Family policy, reconciled:** pinned by policy — `Player`, Zones, engine
  singletons, state watchers, and **all Cards including tokens** (tokens are
  Cards; `Card.alwaysTrackState` is true, `Card.ts:229-231` — the previous
  draft's "dead tokens" churn-family entry contradicted this). Release
  targets: superseded value wrappers, expired effects + impls + custom
  duration events, removed gained-ability objects and their limits.
  **Card/token release is deferred indefinitely (decided):** pinning all
  Cards, defeated tokens included, is accepted. Plan 1's wrapper work plus
  tier-1 release already address the dominant memory term, and Cards are the
  worst family to release — the largest constructor fan-out (the 5b
  composite protocol exists because of it) and the largest inbound
  stale-pointer surface (rule A6). Revisit only if the retained-card
  instrumentation in 5c acceptance shows the retained count is materially
  large in long games; any revisit is its own follow-up with its own
  inbound-pointer audit.

**5c acceptance:** long-game memory benchmark shows bounded GameObject count
(the tier-1 claim, measured), and instruments retained-card count and total
retained-object count over long games — the measurement that gates any future
card/token-release follow-up (see family policy); a released tier-1 object's
uuid appears nowhere
in any retained structure (assert by scan); a tier-2 object created,
referenced, expired, aged out of all quick windows but still referenced by a
manual snapshot is released and then recreated correctly when that manual
snapshot is restored; stale-pointer detection (poison + `FinalizationRegistry`)
clean across the whole undo-all-tests run with release enabled; the
ref-extractor deep-scan spec demonstrably fails when an extractor is removed.

## Verification (plan-wide)

`ENABLE_UNDO_ALL_TESTS=true` is the primary gate for every stage. Add a
"recreation fuzz" mode to the undo harness: randomly evict eligible objects
before each rollback in test mode. **Eligibility is computed from per-family
flags plus the eviction-unit rule (5b):** an object is eligible if its
family's recreation flag is enabled *and* it is either a standalone-factory
leaf (evicted individually) or the root of a composite closure (evicted
atomically with its entire recorded constructor-time fan-out); fan-out
members are never individually eligible. This forces the recreation path
constantly —
with the stale-pointer poison + `FinalizationRegistry` checks active so
split-brain and leaked-retainer failures are loud, not silent. Deep-compare
recreated objects' serialized state against their pre-eviction records in
fuzz mode (recreation parity, invariant 4).

## Risks / notes for reviewer

- **Biggest plan in the set.** Stage boundaries are the risk control: 5a
  lands with recreation limited to leaf families; 5b expands family by family
  behind per-family flags (composites last); 5c only after 5a+5b soak, with
  release enablement per family gated on the A6 pointer audit.
- **Interaction with Plan 4 deltas, both directions:** (a) delta restore must
  recreate objects removed *within* the chain window — `createdObjectUuids`
  gives removal; the symmetric case needs the object's full record captured
  at first-removal time (design the delta payload with this in mind if Plan 4
  lands first); (b) release must never touch anything referenced by the delta
  index, pending window, or hollow-current materialization (5c criterion
  (ii)); (c) the delta-rollback registration spec gains the scope carve-out
  (A2) only when Plan 5's delta integration lands.
- **`getFrameworkContext` / transient `OngoingEffectSource`** allocations
  should already be tamed by Plan 1A; otherwise they churn the release
  machinery.
- The ordinal-within-scope matching coordinate rides on setup determinism. It
  is dev-asserted per scope (count + classTag sequence), so a card whose setup
  becomes nondeterministic fails loudly in the fuzz gate, not silently.

---

## Performance capture (required on completion)

Capture after **each stage**, since each is separately landable:

```bash
npm run benchmark -- --name after-plan-05a --compare initial-performance
npm run benchmark -- --name after-plan-05b --compare initial-performance
npm run benchmark -- --name after-plan-05c --compare initial-performance
```

Commit both generated files under `docs/plans/performance/`. See
[Plan 0](00-performance-benchmarks.md) for the method and
[the capture index](performance/README.md) for the rules.

**What this plan should move.** Stage 5c is the one with a performance thesis:
once GameObjects can be released, the live-object count drops, and snapshot cost
is O(live objects). Watch the `live GameObjects` count printed per scenario,
then `payload/fullSnapshotTotal` and `payload/retainedChain`. The standalone
card-allocation benchmark — bytes per `Card` object, 6.3 KiB at baseline — is the
other number this plan owns.

**What would be a red flag.** Stages 5a and 5b add recreation machinery without
yet releasing anything, so they should be roughly performance-neutral. A
regression there is pure overhead with no offsetting win yet, and needs an
explanation. In 5c, watch `manager/rollbackTo(Manual)`: recreating released
objects during rollback is new work on the undo path.

**Caveat on the harness.** The benchmark scenarios set up a board and mutate it
in place; they do not play a long game, which is where release has the most
effect. If 5c's benefit does not show up here, say whether that is a limitation
of the harness or of the change — and if it is the harness, add a new long-game
scenario rather than editing an existing one.
