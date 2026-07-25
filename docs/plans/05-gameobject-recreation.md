# Plan 5 — GameObject Release & Recreation

**Status:** Proposed
**Depends on:** Plan 3 (class registry, per-class serializers); Plan 1 work item B (uuid counter restore)
**Unblocks:** Plan 6 (full-fidelity save); bounded memory for long games
**Shape:** Three separately-landable stages (5a infrastructure, 5b closure recipes, 5c release policy). Each stage is useful alone.

## Goal

Remove the engine's foundational workaround: every GameObject ever created is
currently kept in memory for the lifetime of the `Game`, because rollback can
only *mutate* live instances. After this plan, a GameObject absent at restore
time can be **recreated from its serialized state**, and objects no longer
reachable from any retained snapshot or live reference can be **released**.

The codebase already anticipates this — `GameObjectUtils.ts:751` (pre-Plan-3):
`// STATE TODO: Once objects can be GC'd and we can recreate objects during
rollback, this will need to happen *after* the new objects are created.` —
and `GameStateManager._isRollingBack` exists, unused, "to detect GO creation
during the rollback process later on."

## Ground truth: the five blockers (as of main `7a0526549`)

1. **No construction path in restore.** `rollbackToSnapshot` iterates live
   `allGameObjects` and calls `setState`; snapshot uuids with no live object
   are silently ignored (`GameStateManager.ts:157-174`).
2. **No class identity in serialized state.** The uuid prefix
   (`getGameObjectName()`) is a display label (~12 overrides; every card is
   `Card_N`). Only cards (`server/game/cards/Index.ts`), tokens
   (`Game.initialiseTokens`), and state watchers (`StateWatcherRegistrar`,
   idempotent by enum — the best in-repo model) have id→constructor maps.
   ~86 engine classes have none.
3. **Fail-fast refs.** `getFromUuidUnsafe` escalates a miss to
   `SevereHaltGame`; no lazy/materialize-on-demand hook exists.
4. **Closures are object identity** for abilities/effects: props objects with
   up to 32 function-typed keys (`server/game/Interfaces.ts`), held outside
   state (`PlayerOrCardAbility.properties`, `OngoingEffect.ongoingEffect`,
   `DynamicOngoingEffectImpl.calculate`, `CustomDurationEvent.handler`).
5. **Listener identity on `Game`.** Six holders register raw closures via
   `game.on` and unregister by function identity (`TriggeredAbility`,
   `StateWatcher`, `CustomDurationEvent`, `RepeatableAbilityLimit`,
   `EventRegistrar` users). The current mitigation — an `isRegistered`
   boolean in state reconciled by `afterSetState` — works only because the
   object survives.

Favorable facts: `Attack`, `GameEvent`, `AbilityContext`, `GameSystem`,
`TargetResolver`, and the entire pipeline are already outside the GameObject
graph and recreated freely. Rollback happens only at pipeline-quiescent
timepoints, so mid-resolution objects (`then`/`ifYouDo` steps, most
`createWithoutRefsUnsafe` sites) never survive to a snapshot boundary and
need no recreation story. Printed card abilities are deterministically
re-derivable (see 5b). 1,849 of ~1,935 concrete classes are cards, which
already have a factory.

---

## Stage 5a — Lifecycle infrastructure

**A1. Class tags + factory registry.** Every serialized state record gains a
stable `classTag`. Extend the Plan-3 generated registry to also emit factory
entries for the ~86 engine classes: `classTag → (game, record, links) =>
instance`. Handle the `@registerState` anonymous wrapper class (registry must
key on the declared class, as `buildAutoInitializingCardClass` already does
for cards). Cards use the existing card factory keyed by `cardData` id
(persist the id in the card's record); tokens by token enum; watchers by
`StateWatcherName`.

**A2. uuid assignment from state.** Recreated objects must reclaim their
original uuid. Allow explicit uuid assignment at registration (bypassing the
counter) for the rehydration path; keep counter assignment for organic
creation. The single-assignment assert on the uuid setter
(`GameObjectBase.ts:73-76`) gets a rehydration-aware variant. Depends on
Plan 1B (counter restored on rollback) so organic post-rollback creation and
rehydration cannot collide.

**A3. Two-phase construct → link → rehydrate.** Constructors need live refs in
cycles (`Card` needs `Player`; `Player` builds Zones; `CaptureZone` needs a
captor `Card`; `OngoingEffect` needs source `Card` + impl). Restore order
becomes:

1. Determine the recreation set: snapshot uuids with no live instance.
2. Construct all missing instances **unlinked** (factories may need a
   deferred-link mode; `initialize()` is currently single-shot and asserted
   non-reentrant — add a distinct rehydration entry point rather than
   loosening the assert).
3. Register all (uuids from state) — now every ref resolves.
4. Deserialize state into every object (existing + recreated). This
   naturally lands where the old `copyState` ordering TODO pointed: ref
   hydration happens after the new objects exist.
5. `onRehydrate()` — new lifecycle hook, symmetric to `cleanupOnRemove`:
   re-register listeners, rebuild caches. Then the existing
   `afterSetState` / `afterSetAllState` passes.

**A4. Listener registration from state.** Generalize the `isRegistered`
pattern: registration state (which events, active or not) lives in state;
handlers are rebuilt in `onRehydrate` and tracked by registration record (not
raw function identity) so a recreated object can unregister listeners it
didn't originally register. Closes the TODOs at `Card.ts:1143` and
`TriggeredAbility.ts:301`.

**5a acceptance:** a test that force-evicts a recreatable object (e.g. an
`AbilityLimit`, a `TrackedGameCardMetric`, a token card) from the registry,
rolls back, and asserts it is recreated with identical state, working refs,
and functioning listeners. Full suite + undo-all-tests green with recreation
active for the pure-data families.

## Stage 5b — Closure recipes for the hard tail

Each closure-bearing family gets a serializable **recipe** — the coordinates
needed to re-derive its closures — stored in state.

- **Printed card abilities (already re-derivable — wire it up):** recreating a
  card re-runs `setupCardAbilities()`/`setupStateWatchers()` deterministically
  (`onInitialize` path). `abilityIdentifier = internalName_type_idx`
  (`Card.ts:555-562`) plus the already-in-state `nextAbilityIdx` counter give
  each ability object its coordinate; recreated ability objects are matched to
  their serialized state records by identifier, then state is overlaid
  (limits, `isRegistered`, etc.).
- **Gained abilities:** recorded today only by runtime uuid in
  `GainAbility._abilityUuidByTargetCard`, with a TODO admitting identifier
  collisions. Recipe: `(sourceCardRef, sourceAbilityCoordinate, targetCardRef,
  gainKind)`; recreation re-derives the props from the source card's
  definition and re-applies the grant. Requires fixing the gained-ability
  identifier scheme first (make identifiers unique per grant instance).
- **OngoingEffect props:** captured via `propertyFactory()` closures at
  `addEffectToEngine` time and held as a raw `ongoingEffect` field. Recipe:
  source card + an effect coordinate minted at registration (same
  `internalName_kind_idx` pattern as abilities); recreation re-runs the
  factory from the source card's definition. `DynamicOngoingEffectImpl.calculate`
  rides along (it comes from the same props).
- **`CustomDurationEvent.handler`:** built by
  `OngoingEffectEngine.createCustomDurationHandler(effect)` — recipe is just
  the effect ref; the handler is re-derived by calling the same builder.
- **Out of scope by design:** `then`/`ifYouDo` sub-steps and
  `createWithoutRefsUnsafe` transients (never survive to a snapshot
  boundary — assert this rather than assume it: add a dev check that no
  unrecreatable object is alive at snapshot time).

**5b acceptance:** undo-all-tests green with recreation enabled for all
families; targeted specs: rollback recreates a card with an active gained
ability; rollback recreates an ongoing effect with a dynamic value; custom
duration event fires correctly after its holder was evicted and recreated.

## Stage 5c — Release policy (the payoff)

- **Track reference liveness per uuid** instead of the monotonic `hasRef`
  latch: an object is releasable when (a) its uuid appears in no *retained*
  snapshot (track a per-uuid last-retained-generation against the containers'
  retention windows), and (b) no live object holds a hard reference.
- **Convert the remaining hard references to state refs** so (b) becomes
  enforceable: `Player.playableZones` (`Player.ts:772` STATE note),
  `ZoneAbstract.owner`, `AbilityLimit.ability` — plus an audit pass for
  others (`Attack.previousAttack` and `GameEvent` chains pin cards
  indirectly; they are transient but verify).
- **Release = unregister + `cleanupOnRemove`** (now with more implementations
  from 5a's listener work) and drop from both registry containers; the
  instance becomes GC-able.
- Sweep opportunistically at the existing hook: `afterTakeSnapshot()`
  (currently an empty stub with exactly this TODO).
- `alwaysTrackState` families (Cards, Players, Zones, engine singletons) stay
  pinned by policy — release targets the churn families (value wrappers,
  expired effects, dead tokens, stale ability objects). Revisit card release
  (defeated tokens especially) once confidence is built.

**5c acceptance:** long-game memory benchmark shows bounded GameObject count;
a game object created, referenced, expired, and aged out of all snapshots is
verifiably absent from the registry and recreated correctly if an old manual
snapshot referencing it is restored.

## Verification (plan-wide)

`ENABLE_UNDO_ALL_TESTS=true` is the primary gate for every stage. Add a
"recreation fuzz" mode to the undo harness: randomly evict eligible objects
before each rollback in test mode, forcing the recreation path constantly.

## Risks / open questions for reviewer

- **Biggest plan in the set.** Stage boundaries are the risk control: 5a
  lands with recreation limited to pure-data families; 5b expands family by
  family behind per-family flags; 5c only after 5a+5b soak.
- **Recreation ordering** with nested dependencies (recreated effect needs
  recreated source card needs recreated zone) — the construct-all-then-link
  protocol handles the refs, but factory *construction* argument needs
  (owner Player, captor Card) mean construction itself needs a dependency
  order or deferred-link constructor variants. Reviewer should scrutinize A3
  step 2.
- **Interaction with Plan 4 deltas:** delta restore must recreate objects
  removed *within* the chain window. `createdObjectUuids` gives removal; the
  symmetric recreated-from-delta case needs the object's full record captured
  at first-removal time. Design the delta payload with this in mind if
  Plan 4 lands first.
- **`getFrameworkContext` / transient `OngoingEffectSource`** allocations
  should already be tamed by Plan 1A; otherwise they churn the release
  machinery.
