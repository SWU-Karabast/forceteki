# LKI Redesign — Decisions and Insights

**Status:** living document. Updated as the design progresses.

Companion to [lki-redesign-special-cases.md](./lki-redesign-special-cases.md), which tracks
specific code sites needing special handling. This file tracks **what we have decided** and
**what we have learned about how the engine actually behaves today**.

---

## 1. Problem statement

Cards that leave the arena may still be referred to by lingering triggers. Per SWU 8.12, those
triggers refer to the card's *last known* state before it left, not its current state.

Today this is handled by an opt-in mechanism
([LastKnownInformation.ts](../server/game/core/event/LastKnownInformation.ts)): game systems
choose to attach an `ILastKnownInformation` struct to an event, and card implementations choose to
read it. Both halves are manual, so both can be forgotten.

Goals of the redesign:

- Correct LKI by **default**, not opt-in
- A single mechanism, rather than LKI structs plus a parallel state-watcher copy
- First-class **copy identity** (SWU 8.6.4 — a card entering play becomes a new copy)
- Card implementations interact with an accessor layer, not raw card objects

---

## 2. Decision log

| ID | Question | Decision | Status |
|---|---|---|---|
| D-0 | Does the LKI registry need to be rollback-safe / tracked state? | **No — transient.** The rollback-snapshot boundary coincides with the LKI flush boundary, so every snapshot is taken against a clean registry. Undo is out of scope. | Decided |
| D-1 | Is a snapshot a materialized value, or a reference? | **Reference handle** ("Model B"). Property reads dispatch through the registry at read time: read through to the live card while it is current, serve a frozen footprint once it has departed. | **Superseded by D-18** — the registry and read-through dispatch are retained, but authors hold materialized values rather than references |
| D-2 | Support on-demand point-in-time capture (`pin()`)? | **Deferred.** Scope is "current state, or last known state if departed". See special-cases D-2. | Deferred |
| D-3 | What discriminates a frozen read from a live read? | **Characteristics vs. location.** *Not* the property name, and *not* the ability slot. | Decided |
| D-5 | Is "left play" the same event as "became a new copy"? | **No — two independent lifecycle events.** See below. | Decided |
| D-6 | Who converts a handle back to a live `Card` for game systems to mutate? | **Automatic at the system boundary.** Card implementations pass handles; the framework dereferences internally and fizzles when the instance no longer matches. Preserves "correct by default" and matches today's behavior, where fizzling already happens invisibly via `canAffect`. | Decided |
| D-7 | *Where* exactly does the automatic dereference happen? | **`GameSystem.generatePropertiesFromContext`** — the single funnel for all card-valued properties. Fizzle reuses the existing two-phase legality check (`canAffect` at generation, `checkEventCondition` at resolution). See special-cases D-7. | Decided |
| D-8 | Where does instance identity live, and what is its value representation? | **Universal counter on `Card`, plus registry-vended interned handles.** See below. | Decided |
| D-9 | Is a `Proxy` pass-through viable for migration? | **No — ruled out entirely**, including as a measurement tool. See below. | Decided |
| D-10 | How is the handle type hierarchy expressed? | **Hybrid** — hand-write the type-guard signatures, derive the data surface from existing card interfaces via mapped types with a "characteristics only" filter. See below. | Decided |
| D-11 | Is instance-aware equality a deliberate behavior change? | **Yes — instance-aware equality is the default.** Rules-correct per SWU 8.5.4, already hand-rolled at 75 sites, and low-risk because most comparisons occur within a single ability resolution. See below. | Decided |
| D-12 | Which engine internals need *physical-card* identity rather than instance identity? | **Deferred** — expected to exist, but needs investigation. See special-cases D-12. | Deferred |
| D-13 | Do footprints capture the full derived characteristic set, or an enumerated subset? | **Enumerated subset.** Nuances must be explicitly considered whenever a new field is added — see below. | Decided |
| D-14 | What happens when a handle cannot serve a read? | **Throw.** Applies to uncaptured fields and to orphaned handles (case ④). Dereference failure is *not* an error — it fizzles (D-6). | Decided |
| D-15 | Shape of location queries on a handle (`currentZone` vs `isStillInPlay()`) | **Resolved by D-24 and D-27.** Location questions are asked of the game (`gameState.isInPlay(ref)`, `player.discardZone.contains(ref)`); the properties object exposes `isInPlay()` only as a type-narrowing guard over the represented moment. | Decided |
| D-16 | Is a handle read an independent copy, or a lookup into the live registry? | **A lookup.** A handle holds only `(card, instance)` and carries no data. This makes handles *names*, not *values* — with direct consequences for retention. See below. | Decided |
| D-17 | Are footprints mutable once minted? | **No — deeply immutable.** Collection reads return frozen collections or defensive copies. See below. | Decided |
| D-18 | Do card authors hold references or materialized values? | **Values.** This revises D-1. Authors extract a properties object and read from it; the reference itself is an opaque token. See below. | Decided |
| D-19 | How is extraction expressed? | **An external getter keyed by the reference** — `gameState.getCardProperties(cardRef)` — not a method on the reference. Names provisional. See below. | Decided |
| D-20 | When are footprints flushed? | **At the action boundary**, matching D-0's rollback boundary. This is a *correctness* requirement, not housekeeping — see below. | Decided |
| D-21 | How is a flushed-but-referenced instance detected? | **Tombstones** — retain the instance key after dropping its data, so a stale read throws instead of silently reading live. | Decided |
| D-22 | Is minting universal or opt-in? | **Universal**, from one central hook on leave-play event generation. | Decided |
| D-23 | May a `CardRef` enter tracked state? | **No — refs are transient** and must never appear in undo snapshots. Tracked state stores `(uuid, instance)` primitives and rehydrates on read. | Decided |
| D-24 | API surface: getter name, type name, relation traversal, location queries | `getPropertiesOrLki(ref)` returning `IUnitProperties`; getter supplied as a **setup-time parameter**; card-valued relations routed **through the getter**; location questions asked of the game, not the properties object. See below. | Decided |
| D-25 | How is the cost of materializing properties controlled? | **Polymorphic properties object**: a *live* variant holding a card reference with lazy pass-through getters, or a *snapshot* variant holding frozen captured values. No global memoization or invalidation. See below. | Decided |
| D-26 | Are the two variants one type or two? | **Two concrete types sharing one interface** — `IUnitPropertiesCaptured` and `IUnitPropertiesAccessor`, both satisfying `IUnitProperties`. Consumers that require durability (state watchers) declare the captured type explicitly. Names provisional. See below. | Decided |
| D-27 | How are in-play-only properties (`power`, `upgrades`, `activeAttack`) exposed? | **Type-level split with a narrowing guard**, preserving the existing `isInPlay()` guards and upgrading them from runtime throw to compile-time error. `power` and `printedPower` stay distinct concepts. See SC-17. | Decided |
| D-4 | How is current location expressed on a handle? | Options A (live on handle, zero migration), B (off the handle, ask live zones), C (on the handle with explicit `current*` naming, e.g. `currentZone` / `isStillInPlay()`). Scope shrank substantially under D-5 — see §3.8. | **Open** |

### D-5 in detail — two independent lifecycle events

This corrects an earlier conflation. Leaving play and losing copy identity are **orthogonal**:

| Event | Trigger | Consequence |
|---|---|---|
| **Footprint mint** | Leaving *play* (arena → anywhere) | Characteristics frozen per SWU 8.11.1 |
| **Copy identity break** | Re-entering play, **or** entering a hidden zone (Hand / Resource / Deck) | Old handles no longer resolve |

Verified against
[InPlayCard.initializeForCurrentZone](../server/game/core/card/baseClasses/InPlayCard.ts) and
[EnumHelpers.isHiddenFromOpponent](../server/game/core/utils/EnumHelpers.ts): only `Hand`,
`Resource` and `Deck` are hidden. **Discard and Capture are visible zones, so arena → discard
preserves copy identity.**

Therefore a unit defeated into the discard is simultaneously:

- **Historical** in its characteristics — `power`, `upgrades`, `controller` resolve to the
  footprint, per 8.11.1 ("a snapshot of its status immediately before it left play")
- **Live-resolvable** — it is still the same copy, alive in the discard, so effects can act on it
- **Locatable** — its current zone is the discard

If it later moves to hand, is played, or is resourced, its copy id increments and handles held from
before stop resolving — which is exactly the fizzle behavior the rules require.

**Consequence for the design:** a footprint does *not* mean "this reference is now historical and
unusable". Footprint presence and reference validity are separate questions with separate answers.

### D-6 / D-7 in detail — dereference

Two distinct operations on a handle, which earlier drafts conflated under the word "resolution":

| Operation | Meaning | Returns | Status |
|---|---|---|---|
| **Property read** — `handle.power` | Registry serves footprint or reads through to live | a value | Settled by D-1 |
| **Dereference** — `handle` → `Card` | Recover the live object so a system can mutate it | the card, or failure | D-6 / D-7 |

Dereference is required because game systems do not read properties, they mutate:

```ts
// DefeatCardSystem.eventHandler
card.moveTo(ZoneName.Discard);

// CaptureSystem.eventHandler
event.card.moveToCaptureZone(event.captor.captureZone);
```

A footprint cannot do this, and per SWU 8.11.2 must not.

**D-6 (decided):** dereference is automatic. A card implementation passes a handle as a target
exactly as it passes a card today, and the framework converts it. If the instance no longer
matches, the effect fizzles.

**D-7 (deferred):** the seam at which conversion happens. Candidates in the current pipeline:

| Seam | Note |
|---|---|
| `generatePropertiesFromContext` | Where target properties are materialized |
| `canAffect` / `canAffectInternal` | **Where fizzle decisions already live today** |
| `addPropertiesToEvent` / `createEvent` | Event generation |
| `eventHandler` | Too late — mutation has begun |

`canAffect` is the apparent natural home, since it already decides "can this effect apply to this
card" and is what makes today's LKI-as-target pattern (SC-2) accidentally work. Confirming this
requires auditing existing systems: which ones take cards as targets, which read properties off
targets before mutating, and which (like `CaptureSystem`, see §3.8) have gaps in their legality
checks today.

### D-8 in detail — instance identity

**The counter moves to `Card`.** Today `_mostRecentInPlayId` lives on `InPlayCard`, so `BaseCard`
and `EventCard` have no identity at all, and Force/Credit tokens (which are `InPlayCard`s sitting
in the Base zone) would throw if asked (§3.18). A universal counter makes identity **total**.

Increment triggers are unchanged — re-entering play, or entering a hidden zone (Hand / Resource /
Deck) — now applied uniformly:

| Card kind | Behavior under a universal counter |
|---|---|
| `BaseCard` | never moves → permanently instance 0 |
| `EventCard` | increments on entering a hidden zone |
| Unit / upgrade | as today, plus correct coverage in non-arena zones |
| Force / Credit token | works in the Base zone; no longer throws |

**Extra increments are harmless.** Every one of the 75 existing usages (§3.17) is an equality
comparison, never arithmetic. A unit going arena → discard → hand → played increments twice, and
both increments correctly mean "a different instance".

**Identity is vended as an interned handle.** The registry returns one canonical handle object per
`(card, instance)` pair. Consequences:

- `handleA === handleB` is automatically instance-aware, so the ~359 reference comparisons (SC-9)
  keep working without migration, and the 75 hand-rolled pair comparisons collapse to a single `===`
- the handle is a natural registry key for footprint lookup
- identity becomes readable without throwing, removing the 6 hand-rolled ternaries and fixing the
  latent fragility in §3.19

**Constraints this imposes:**

1. **Handles must only ever come from the registry.** An ad-hoc constructed handle would break
   `===`. This needs enforcement — a private constructor, a factory-only API, or a lint rule.
2. **Interning needs a lifecycle.** The canonical-handle map is keyed by `(card, instance)` and
   must not grow without bound across a long game. Note this map is *not* the footprint cache and
   may not share its flush boundary — see open question Q3.
3. **Mixed comparison is a new silent hazard.** During incremental migration some values will be
   handles and some live `Card`s. `handle === card` is **always false**, with no error. This
   materially strengthens the case for type-level incompatibility in open question Q1, which would
   turn such comparisons into compile errors.

### D-9 in detail — why `Proxy` is ruled out

A `Proxy` wrapping the live card would intercept property reads and serve footprint values,
falling through to the live object otherwise. Its appeal was zero migration: the proxy is
structurally a `Card`, so all ~1,675 read sites and the 27 type guards keep working untouched.

There is precedent in the repo — [GameObjectUtils.ts:677](../server/game/core/GameObjectUtils.ts)
uses proxies for undo-safe records. **Note it traps `set` and `deleteProperty` only, never `get`**:
writes are rare, reads are the hot path.

Rejected for five reasons:

1. **Silent fall-through is the design.** Directly contradicts requirement 7. A missing footprint
   field yields the live value — reproducing today's bug class rather than fixing it.
2. **Identity breaks invisibly.** `new Proxy(card, …)` is a new object, so `proxy === card` is
   always `false`. Interning fixes proxy-vs-proxy but not proxy-vs-card, and because the proxy is
   type-compatible with `Card` the compiler cannot warn. This is D-8 constraint 3 made
   *undetectable*, across ~359 comparison sites.
3. **SWU 8.11.2 violation.** The proxy forwards methods too, re-exposing live ability machinery
   (`getTriggeredAbilities()`, `hasOngoingEffect()`) through what must be inert reference data.
4. **Performance on the hot path.** `get` traps are markedly slower than direct access, and the
   reads land on `cardCondition` predicates that sweep every legal target on every ability
   activation and UI legality check.
5. **Mutation forwards too.** `handle.moveTo(...)` would silently work, undermining D-6's
   controlled dereference.

A stricter variant (throw on uncaptured properties) would fix (1) but not (2), (4) or (5). Using a
permissive proxy purely as throwaway instrumentation was also considered and rejected.

**Consequence:** the type boundary must be enforced structurally. Q1 narrows to type-level
incompatibility, a lint rule, or both.

### D-10 in detail — handle type hierarchy

Handles are **not assignable to `Card`**, so the compiler enumerates migration sites and catches
the D-8 constraint 3 mixed-comparison hazard. The hierarchy is built as a hybrid:

- **Type guards are hand-written.** They are 26% of all card-member accesses (§3.20) and must
  narrow to handle types rather than card types:
  ```ts
  interface CardRef {
      isUnit(): this is UnitRef;
      isUpgrade(): this is UpgradeRef;
      // ~20 guard signatures
  }
  ```
- **The data surface is derived** from existing card interfaces via mapped types, so handle types
  stay in sync with card types automatically:
  ```ts
  type UnitRef = CardRef & ReadonlyCharacteristics<IUnitCard>;
  ```

The "characteristics only" filter in that mapped type is where **SWU 8.11.2 is enforced
structurally** — engine machinery and mutation methods are excluded by construction, not by
convention. §3.20 shows this costs almost nothing: card implementations touch engine machinery in
only ~0.7% of accesses.

**Types and lint are complementary, not alternatives:**

| Mechanism | Enforces |
|---|---|
| Type system | Assignability; `handle === card` becomes a compile error |
| Lint rule | D-8 constraint 1 — handles must come from the registry, never be constructed ad hoc (the type system cannot express this) |

### D-11 in detail — instance-aware equality

**Rules-correct.** SWU 8.5.4 says a card that left and re-entered play "does not regain any
modifiers or reapply any effects from when it was previously in play", with Regional Governor as
the worked example. Under physical-card equality a stale reference would still match the returned
card and effects would incorrectly reattach.

**Already the de facto behavior.** 75 sites hand-roll `entry.card === X && entry.inPlayId ===
X.inPlayId` (§3.17), and [Attack.ts:17](../server/game/core/attack/Attack.ts) maintains a
`Map<IAttackableCard, number>` purely to do instance checking:

```ts
this.targetInPlayMap = new Map(targets.filter((t) => t.isUnit()).map((t) => [t, t.inPlayId]));
...
// If inPlayId has changed, the target has left and re-entered play
this.targetInPlayMap.get(target) === target.inPlayId
```

Under handles this Map becomes unnecessary.

**Risk is narrower than the ~359 comparison count suggests.** Most comparisons happen inside a
single ability resolution, where instances cannot change; the behavior only differs across a
leave-and-return, which is exactly when 8.5.4 says it should. Card-keyed `Map`/`Set` containers are
mostly engine-side and keep using live `Card`s; the three in `cards/`
(`NuteGunrayPerfectlyLegal`, `FinalizerMightOfTheFirstOrder`, `LetsCallItWar`) build their sets from
context within one resolution. Uniqueness checks compare `title`/`subtitle` and deck operations
compare `id`/`internalName`, so neither uses reference equality.

**Expected exceptions.** Engine internals are expected to need *physical-card* identity in places —
zone membership, cleanup, ability registration, serialization. Deferred as D-12.

**Cleanup opportunity:** once both sides of a comparison are handles, the 75 hand-rolled instance
checks and `Attack`'s tracking Map become redundant. Their removal is a useful migration signal.

### D-13 / D-14 in detail — capture scope and failure semantics

**D-13: enumerated field set.** Footprints capture an explicit list of characteristics rather than
everything derivable from the type system. Today's `ILastKnownInformation` has 13 fields; the set
will grow as cases demand.

**This makes D-14 load-bearing.** With an enumerated set, "field not captured" is reachable, so it
must fail loudly rather than silently fall through to live state (requirement 7, and consistent
with why `Proxy` fall-through was rejected in D-9).

**Nuances to consider explicitly whenever a field is added:**

- Is it a *characteristic* (frozen) or *location* (live)? See D-3.
- Is it derived from other captured fields (`remainingHp` = `getHp()` − `damage`), and should it be
  stored or recomputed from the footprint?
- Is it a collection of cards (`upgrades`, `parentCard`)? Those are captured as **handles**, so the
  cycle in SC-4 stays lazy.
- Does capturing it cost anything meaningful at mint time? Stats fold all ongoing effects.
- Do the state watchers need it too? They keep a separate, lossier extract (SC-6).

**D-14: throw.** Three failure situations, but only two are errors:

| Situation | Response |
|---|---|
| Footprint exists but lacks the requested field | **Throw** — programming error |
| Orphaned handle: instance mismatch *and* no footprint (case ④) | **Throw** — the handle outlived its data |
| Dereference fails: instance no longer matches | **Fizzle**, not an error — this is the SWU fizzle rule (D-6) |

The third row is the important distinction. A stale handle used as a mutation target is a
*legitimate game outcome*, not a bug; a stale handle used to read a characteristic means the data
should have been there.

**Constraint:** throwing on case ④ is only safe if long-lived handles cannot routinely become
orphaned. See SC-15.

### D-16 / D-17 in detail — handles are names, not values

A handle holds only `(card, instance)`. It carries no data, so every property read is a fresh
lookup into the registry:

```ts
get power() { return this.registry.read(this, 'power'); }   // → footprints.get(key).power
```

**The governing principle:**

> A handle is a **name**, not a **value**. A name is only meaningful while the registry that
> resolves it retains the binding. Anything that must outlive the registry's retention window needs
> a *value*, not a name.

This is D-1's Model A / Model B choice resurfacing at the lifetime level, and it yields a clean
rule for where each belongs:

| Scope | Representation | Why |
|---|---|---|
| Within an action | **Handle** | The registry retains the binding; cheap, automatic, correct |
| Across actions | **Materialized value** | The holder must extract at capture time |

**This vindicates the state watchers' current design.** They eagerly extract values
(`lastKnownInformation: { traits: …, power: … }`) rather than holding a reference, which is exactly
why they are immune to the flush problem in SC-15. Their extract is *architecturally correct*, not
a wart — what is wrong with it is only that the field set is hand-picked and incomplete
(`// TODO: Add more fields if needed`). A shared, complete extraction helper would be the
improvement, not unification onto the registry.

**Two read-result nuances:**

- **Primitives are independent once read.** `const p = handle.power` materializes a number that
  survives a flush. The caller has taken a value.
- **Objects are shared references.** `handle.traits` returns the `Set` stored in the footprint;
  `handle.upgrades` returns its array. These point into registry-owned state.

**D-17 follows from the second nuance.** A caller could otherwise corrupt a footprint for every
other reader:

```ts
const traits = handle.traits;
traits.add(Trait.Imperial);   // mutates the cached footprint
```

Footprints must therefore be deeply immutable once minted, with collection reads returning frozen
collections or defensive copies. Note [getTraits()](../server/game/core/card/Card.ts) already
allocates a fresh `Set` on every call, so defensive copying is no worse than current cost. The
hazard exists today in narrower form: multiple readers of one event's `lastKnownInformation.traits`
share a `Set`.

**Consequence for tombstones (SC-15).** Tombstones do not *solve* retention — they make its failure
loud instead of silent, which is D-14's purpose. The actual fix for a long-lived holder is to
materialize a value.

### D-18 / D-19 in detail — the value model

**D-18 revises D-1.** Card authors do not hold references with property accessors; they extract a
materialized properties object and read from that. The reference is an opaque token.

Why the value model won:

- **No D-16 trapdoor.** A value cannot silently start reading live state when the registry flushes,
  so authors need no knowledge of registry lifetimes (SC-15).
- **Internal coherence.** All fields in one extraction come from the same instant — which matters
  because `power` is *derived from* `upgrades`.
- **Immutability is natural** (D-17) — the caller holds their own copy.
- **Uniform with state watchers**, which already materialize values (§3.12, D-16). Watchers stop
  being a special case.
- **The translation layer is visible**, which was the deciding factor: card authors are not expected
  to understand engine internals, so a single consistent and explicit pattern is worth ceremony.

Cost, accepted knowingly: a one-line predicate typically becomes three to five lines, including on
the ~1,600 everyday reads where no translation is actually occurring (§3.20), and on the 347 files
that read 2+ properties off one receiver.

**D-19: extraction goes through an external getter**, not a method on the reference:

```ts
const card = gameState.getCardProperties(cardRef);   // not cardRef.snapshot()
```

- The reference stays a pure token with no readable surface, so it cannot be mistaken for the card
- The lookup is syntactically visible — it reads as "ask the layer", not "ask the reference"
- The bypass is symmetric and greppable: `gameState.getLiveCard(ref)` beside
  `gameState.getCardProperties(ref)`
- A single generic helper covers all card kinds, rather than a `snapshot()` method on each
  reference type

**Open sub-questions:**

1. **Naming.** "LKI" is a misnomer for the common case: by SWU 8.11 it means information about a card
   *no longer in play*, but this getter serves in-play cards in the large majority of calls. Prefer a
   neutral getter name with the returned **type** carrying the semantics
   (`const card: IUnitSnapshot = gameState.getCardProperties(ref)`).
2. **Where the getter comes from.** As a setup-time parameter alongside `registrar` and
   `AbilityHelper` (capturable as `this.gameState`, usable from private helpers such as
   `AdmiralAckbarBrilliantStrategist.getDamageFromContext`), or from `context` (naturally current,
   but must be threaded into helpers). A setup-time parameter must be a stable facade, since setup
   runs once at card construction while the registry is per-game-state.
3. **Card-valued relations.** `parentCard`, `parentUnit` and `upgrades` are characteristics, so they
   carry the same now-versus-when-it-left-play distinction and must be read *through* the getter
   rather than off the reference. That means traversing a relation costs two lookups
   (`getCardProperties(getCardProperties(ref).parentUnit)`), across ~170 accesses. Correctness favours
   routing through the getter; ergonomics will push back.

These are resolved by D-24 below.

### D-24 in detail — the author-facing API

```ts
public override setupCardAbilities(
    registrar: IUpgradeAbilityRegistrar,
    AbilityHelper: IAbilityHelper,
    gameState: IGameStateGetter
) {
    registrar.addWhenPlayedAbility({
        title: 'Attached unit captures an enemy non-leader unit with less remaining HP than it',
        targetResolver: {
            controller: RelativePlayer.Opponent,
            cardCondition: (cardRef, context) => {
                const card = gameState.getPropertiesOrLki(cardRef);
                const source = gameState.getPropertiesOrLki(context.source);
                const attachedUnit = gameState.getPropertiesOrLki(source.parentUnit);
                return card.isUnit() && card.remainingHp < attachedUnit.remainingHp;
            },
            immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({
                captor: gameState.getPropertiesOrLki(context.source).parentUnit
            }))
        }
    });
}
```

- **Getter name `getPropertiesOrLki`** — provisional. It names the disjunction explicitly, which
  favours visibility; the counter-argument is that D-18's premise is that authors should *not* need
  to reason about which case they got. Left as-is for now.
- **Type name `IUnitProperties`**, not `IUnitState`. `I*State` is an established convention in this
  codebase for the `GameObjectBase` tracked-state bag (`IGameObjectState`, `IPlayerState`,
  `IOngoingEffectState`, `ITriggeredAbilityState`, `IStateWatcherState`, …), which is exactly the
  concept D-23 says the properties object must **not** be. Reusing the suffix would put two
  opposite-lifetime concepts under one name.
- **Setup-time parameter.** Non-breaking: TypeScript permits an override to declare fewer
  parameters, so cards that do not need it are untouched. Two constraints: the facade must resolve
  the registry lazily per call (it is captured once at construction, but the registry is
  per-game-state and is replaced on rollback), and every setup entry point needs it consistently
  (`setupCardAbilities`, `setupLeaderSideAbilities`, `setupLeaderUnitSideAbilities`,
  `setupStateWatchers`).
- **Relations route through the getter**, accepting the double lookup.
- **Location questions are asked of the game**, per D-15's resolution: `player.discardZone.contains(ref)`,
  `gameState.isInPlay(ref)`. Well-defined for stale references (that instance is not in play →
  `false`). This makes `gameState` a general game-state accessor rather than a property-only getter,
  consistent with the original "getter suite over a registry" framing.

### D-25 in detail — polymorphic properties object

Eager materialization is a real performance risk in target selection. `getPower()` / `getHp()` are
not field reads — `getStatModifiers()` filters every ongoing effect, wraps each, then folds in
upgrade bonuses, Grit and Raid. Paying that per candidate card on every legality check, plus D-24's
two extra loop-invariant lookups per candidate, would be a significant regression.

A global memo cache was considered and **rejected**: invalidating it would require a state-version
signal that does not exist today, and any mutation path bypassing the decorated accessors would
leave memos silently stale — trading a performance problem for a correctness one.

**The chosen approach makes invalidation unnecessary rather than solving it.** `IUnitProperties` is
an interface with two implementations, selected by the getter:

```ts
// departed card — footprint exists
class SnapshotProperties implements IUnitProperties {
    constructor(private readonly footprint: Footprint) {}
    get power() { return this.footprint.power; }        // frozen
}

// current card — no footprint
class LiveProperties implements IUnitProperties {
    constructor(private readonly card: Card) {}
    get power() { return this.card.getPower(); }        // lazy pass-through
}
```

The invalidation problem splits, and both halves vanish:

| Variant | Why no invalidation |
|---|---|
| Snapshot | Footprints are immutable once minted (D-17); the object dies at the action-boundary flush (D-20) |
| Live | Reads current state on every access, so it cannot be stale |

**Performance returns to today's baseline.** Getters are lazy, so
`card.isUnit() && card.remainingHp <= 3` computes only `remainingHp` — exactly what the current code
does. Both variants can also be cached per reference without any invalidation logic, since a
snapshot is immutable and a live wrapper holds only a pointer.

**This is not D-9's rejected `Proxy`.** The distinctions are structural:

| | `Proxy` (D-9) | Live variant |
|---|---|---|
| Surface | forwards everything, including methods and mutation | explicit interface, curated read-only characteristics |
| Type | structurally assignable to `Card` | not assignable to `Card` |
| SWU 8.11.2 | re-exposes ability machinery | cannot — machinery is not on the interface |
| Identity | `proxy === card` silently false | references are separate and interned (D-8) |

**Consequence for D-16 / D-18.** The properties object is a *view* for live cards and a *value* for
departed ones. Both implement the same interface, so this is invisible at the call site — it is not
the rejected "two modes" problem. But two second-order effects follow:

- **Coherence is per-read for the live variant**, not per-extraction. Reading `power` then `upgrades`
  across an intervening mutation could yield an inconsistent pair. In practice properties objects are
  short-lived (one predicate evaluation), so this is narrow.
- **A live properties object cannot enter tracked state.** It holds a card pointer, so
  `structuredClone` would throw — a loud failure, consistent with D-23. Watchers therefore still
  need a *durable* materialization distinct from the view.

**Open: zone-gated properties.** See SC-17 — the live variant inherits the throwing behavior of the
underlying accessors, which affects §3.21's conclusion.

### D-26 in detail — two concrete types, one interface

```ts
interface IUnitProperties { … }                                    // what card authors see
class  UnitPropertiesCaptured implements IUnitProperties { … }     // frozen values
class  UnitPropertiesAccessor implements IUnitProperties { … }     // live pass-through
```

`getPropertiesOrLki(ref)` returns `IUnitProperties`; consumers that require durability declare
`IUnitPropertiesCaptured` explicitly.

**This collapses what looked like a third form.** D-25 noted that watchers need a "durable
materialization distinct from the view" — but that durable form *is* the captured type. A footprint
and a watcher's stored properties are the same concept, so there are two types, not three.

**The main gain is compile-time enforcement of D-23:**

| | One polymorphic type | Two types, one interface |
|---|---|---|
| Storing a live view in tracked state | `structuredClone` throws at runtime | **compile error** |
| Watcher's declared intent | implicit | explicit in the signature |
| What card authors write | unchanged | unchanged |

**Capture becomes a named operation:** `gameState.capture(properties): IUnitPropertiesCaptured` —
identity for an already-captured object, full materialization for an accessor. This is what watchers
call, and it is the one place the distinction surfaces for anyone outside the engine.

**A serialization form still exists, but it is mechanical.** `IUnitPropertiesCaptured` holds
card-valued relations (`parentCard`, `upgrades`) as references, which D-23 forbids in tracked state.
Watchers therefore store a state form with `(uuid, instance)` primitives and rehydrate on read —
exactly the existing `GameObjectId` / `UnwrapRef` pattern already used for every watcher entry type.
So: two conceptual types plus one mechanical serialization shape.

**Liskov constraint.** A shared interface is only honest if both implementations answer the same way
for the same question. This is satisfied under D-27: the availability of `power` depends on whether
the object represents **in-play state**, not on which implementation is in use. A captured footprint
of a departed unit and a live accessor for an in-play unit both expose `power`; a live accessor for
a card in hand does not, and the type-level narrowing guard makes that explicit at compile time.

**Naming.** "Captured" describes state while "Accessor" describes mechanism, so the pair is not
parallel. Prefer symmetric naming — `…Captured` / `…Live`, or `…Snapshot` / `…View`.

**Interaction with D-10.** Both types derive from the same mapped-type machinery over the card
interfaces, with the "characteristics only" filter applied once and shared. Roughly 20 card
interfaces yield ~40 generated types, which is mechanical rather than hand-maintained.

### D-20 to D-23 in detail — registry lifecycle

**D-20: flushing is a correctness requirement.** Memory is not the motivation — footprints are
keyed by `(card, instance)` with a monotonic counter, so a stale footprint can never be confused
with a newer one, and a whole game produces well under 100 KB.

The real reason is **rollback**. Stale footprints from an abandoned timeline are dangerous:

| Step | State |
|---|---|
| Timeline 1 | X enters play as instance 4 carrying an upgrade, later leaves → `footprint[X,4]` has power 5 |
| Rollback | to before that point; X's instance counter is restored |
| Timeline 2 | X enters play as instance 4 again, without the upgrade — power 4 |
| Read | `getCardProperties(ref(X,4))` checks footprints **first**, finds the timeline-1 entry, returns **5. Wrong.** |

So D-0's "clean registry at every snapshot point" is load-bearing. This also rules out never
flushing, and flushing per phase — both hit the same bug.

**D-21: tombstones.** Because flushing is forced, SC-15's false-current branch is forced too, and
D-18 does not remove it — long-lived reference holders still exist (delayed effects holding
`effect.context`, phase-long ongoing effects such as `BogaLoyalVaractyl`, events referenced from
later sub-windows). Retaining the instance key after dropping its data makes the read path sound:

```ts
read(ref, field) {
    const fp = this.footprints.get(ref.key);
    if (fp) return fp[field];
    if (this.tombstones.has(ref.key)) throw new Error(`footprint for ${ref.key} was flushed`);
    if (ref.instance === ref.card.instanceNumber) return ref.card[field];   // soundly "never departed"
    throw new Error(`orphaned ref ${ref.key}`);
}
```

"No footprint *and* no tombstone" then genuinely means "never departed". Cost is a `Set<string>`,
which is identity-only and therefore safe to keep for the game.

**D-22: universal minting** from a single hook on leave-play event generation, replacing the five
scattered call sites (`DefeatCardSystem`, `DamageSystem`, `UseTheForceSystem`, `CardTargetSystem`,
`AttackFlow`). Required by "correct by default", and affordable because leaving play is rare.
Cluster minting falls out for free — attached upgrades generate their own contingent leave-play
events in the same window.

**Footprints carry defeat provenance.** SWU 8.11.1 lists "how the card was defeated or removed from
play" as part of LKI, and `CardsDefeatedThisPhaseWatcher` already persists
`wasDefeatedWhileAttacking`, so demand outside the event context is proven.

**D-23: references are transient.** A `CardRef` must never enter tracked state or an undo snapshot.
The layering:

| | Tracked / serialized | Transient |
|---|---|---|
| Card `uuid`, instance counter, watcher entries | ✅ | |
| `CardRef`, footprints, tombstones, intern map, ability contexts | | ✅ |

Verified that this is satisfiable: `AbilityContext` is a plain class (not a `GameObjectBase`), and
`OngoingEffect.context` is a plain field, so delayed-effect closures holding references do not
violate the rule.

**This preserves D-8's interning.** The concern that interned object identity does not survive
`structuredClone` is moot if references are never cloned. Watchers store `(uuid, instance)`
primitives plus materialized values, and rehydrate to references and a values object in
`mapCurrentValue` — the existing `GameObjectId` / `UnwrapRef` pattern.

**Watchers store a complete properties snapshot** rather than hand-picked fields, removing the
`// TODO: Add more fields if needed` friction and giving card authors one object shape everywhere.
State growth is negligible at ~10–20 entries per phase.

**Gap to fix during migration:** `IStateWatcherLKIEntry.upgrades` is stored as
`GameObjectId<IUpgradeCard>[]` — uuid only, no instance — so rehydration yields whatever instance
the upgrade is at now rather than the captured one. `CardLeftPlayEntry` gets this right by storing
`card` and `inPlayId` separately; the nested entry does not.

### D-3 in detail

A card reference answers two different kinds of question:

**① "What was/is this card?" — characteristics.**
`power`, `hp`, `cost`, `type`, `traits`, `controller`, `damage`, `exhausted`, the arena it was in,
the upgrades it had, its parent card.

Resolves to the card-copy's last known state — which, while the card is still current, *is* its
live state. One timepoint per card-copy: the moment it departed. **Correct in every ability slot,
with no slot awareness required.**

**② "Where is this card now / act on it" — present game state.**
`zone`, zone membership, and passing the card to a system as a target.

Always live. Arguably not a property of a snapshot at all, but a query about present game state
that merely uses the card as an identifier.

### Framings that were considered and rejected

- **Per-property freeze classification** — rejected; the discriminator is the *kind of question*,
  not the property.
- **Per-ability-slot timepoint** ("trigger code is frozen, effect code is live") — rejected on
  evidence. Frozen reads dominate *late* slots too (~30 sites), and
  [GarSaxonViceroyofMandalore.ts](../server/game/cards/02_SHD/leaders/GarSaxonViceroyofMandalore.ts)
  needs both within a *single* `targetResolver`.
- **Materialized value snapshots** ("Model A") — rejected; conflicts with passing references
  around, and pays full derived-stat cost on every read.

---

## 3. Insights about current behavior

### 3.1 Card properties are derived, not stored

`getPower()` / `getHp()` do not read a field.
[getModifiedStatValue](../server/game/core/card/propertyMixins/UnitProperties.ts) folds printed
values with live ongoing effects, attached upgrades, Grit (reads current damage) and Raid (reads
attacking status). `traits`, `type`, keywords and restrictions are similarly computed.

**Consequence:** when a card leaves the arena its ongoing effects are torn down, so these values
become **unrecoverable**. Any footprint must be *eagerly materialized* at capture time. This is
the fundamental constraint that makes pure lazy evaluation impossible.

### 3.2 Property access is zone-gated by assertion

[assertPropertyEnabledForZone](../server/game/core/card/Card.ts) throws when a property is read in
a zone where it does not apply. `parentCard`, `upgrades`, `inPlayId`, `damage` and others do this.

**Consequence:** reading a departed card's state is frequently a hard crash, not merely a wrong
value. This is the pressure that produced the opt-in LKI mechanism.

### 3.3 `when` conditions are evaluated twice

Trigger conditions run once **before** handlers (card still in arena) and again **after** handlers
(card has moved), deduped by `(ability, event)`. See special-cases SC-10.

**Consequence:** a `when` that reads live state is non-deterministic with respect to which pass
evaluates it. Resolving characteristics to the event moment makes `when` deterministic — this is
an argument *for* D-3, not merely a compatibility concern.

### 3.4 LKI capture is window-batched, and that is load-bearing

Capture happens at the event window's `preResolutionEffects` step — batched across every event in
the window, before any handler runs. This is what makes simultaneously defeated units snapshot at
the same instant. See special-cases SC-5.

### 3.5 Today's LKI is shallow and opt-in

- A flat 13-field struct built by three hardcoded branches (non-arena / unit / upgrade)
- `upgrades` and `parentCard` are captured as **live card references**, not snapshots
- Attached via two producers that capture at **different timepoints** (SC-1)

### 3.6 There is a second, parallel LKI system

State watchers keep their own lossier copy (`IStateWatcherLKIEntry`: traits, type, power, arena,
upgrades, with a `TODO: Add more fields if needed`), scoped to an entire **phase** rather than an
ability resolution. Unlike event LKI it **is** tracked state. See special-cases SC-6.

### 3.7 Copy identity exists but is awkward to read

`_mostRecentInPlayId` is exposed through two mutually exclusive accessors that **throw** outside
their applicable zone. Callers work around this with
`card.isInPlay() ? card.inPlayId : card.mostRecentInPlayId`. See special-cases SC-7.

**Note:** the counter is incremented on entering play *and* on entering a hidden zone, but these
are **not** two different concepts — both express the single idea "identity continuity is broken"
(a new copy per SWU 8.6.4, or information loss). Fusing them is correct. What genuinely needs
separating is *footprint minting* from *identity break* — see D-5.

### 3.8 Idiom 1 is a reference-validity check, not a location read

The "did it land in the discard?" checks catalogued in special-cases SC-12 are mostly a **hack to
enforce fizzling**: an effect targeting a card in the discard must not resolve if the card has
moved between the trigger and the effect's resolution.

Re-classifying the 8 sites:

- **Fizzle hacks (~5)** — `Bothan5NewRepublicPrisonShip`, `DisplayPiece`, `OldDakaOldestAndWisest`,
  `OneMustDestroyToCreate`, and `BogaLoyalVaractyl` (a phase-scoped variant). These are asking
  *"is my reference still valid?"*, not *"where is this card?"*
- **Play-origin branching (3)** — `AFineAddition`, `GideonsLightCruiserDarkTroopersStation`,
  `APrecariousPredicament`. All choose between `PlayFromHand` and `PlayFromOutOfPlay` based on
  which zone the card is being played from. These targets **never left play**, so no footprint is
  involved and read-through gives live values anyway. **Zero impact.**

The fizzle hacks decompose into two separate mechanisms:

1. **Reference validity** — is this still the same copy? Comes **free** from copy-id comparison
   under D-5.
2. **Target legality** — does the card still satisfy the ability's stated zone requirement? A
   framework concern.

**Verified that (1) and (2) are not currently enforced for these cases.**
[CaptureSystem.canAffectInternal](../server/game/gameSystems/CaptureSystem.ts) with
`fromOutOfPlay: true` only checks `card.isUnit()` — it does not verify the card is still in the
discard. So `Bothan5`'s manual zone check is **load-bearing**, and without it the capture would
incorrectly succeed on a card that had since moved to hand.

**Consequence:** most of Idiom 1 should become reference-validity checks rather than location
reads, which shrinks D-4's scope considerably and promotes open question 7 (handle-to-live
resolution) ahead of it.

### 3.9 Rule 8.11 adds two requirements not currently captured

From the official rules text:

> 8.11.1. Last Known Information includes the attributes of the card, the controller of the card,
> the modifiers applied to that card, the card's ready/exhausted status, upgrades attached to that
> card, **and how the card was defeated or removed from play**.

Defeat provenance is part of LKI by rule. Today it lives as *event-level* metadata
(`defeatSource`, `isDefeatedByAttacker`, `isDefeatedWhileAttacking` set by
[DefeatCardSystem](../server/game/gameSystems/DefeatCardSystem.ts)), separate from
`ILastKnownInformation`. A footprint should arguably carry it.

> 8.11.2. Last Known Information is **only reference information**. Other abilities that were on a
> card that left play are not active while resolving its "When Defeated" abilities.

A footprint must be **pure data** — it must not resurrect constant abilities or ongoing effects.
This is a hard guardrail on any implementation that forwards unknown reads to the live card object
(see open question 8, `Proxy` pass-through), which could accidentally re-expose ability machinery.

Note also that 8.11.1 scopes LKI to a card "no longer **in play**" — confirming the mint trigger is
*leaving play*, not *changing zone*.

### 3.10 Engine-supplied selector params are live by construction

In `cardCondition`, `matchTarget`, `attackerCondition` and similar, the `card` parameter is handed
in by the engine *from a live zone query*. Such a card is present by definition, so frozen state
never applies. This accounts for **~43% of all location reads** in card implementations and means
they need no migration at all.

### 3.11 The codebase already gropes toward the characteristics/location split

`ILastKnownInformation` carries `arena` — the zone it was in, frozen — as a field *separate* from a
live `card.zoneName` read. And
[AsajjVentressIWorkAlone.ts](../server/game/cards/04_JTL/leaders/AsajjVentressIWorkAlone.ts) writes
`lastKnownInformation?.arena ?? ifYouDoContext.target.zoneName`, explicitly treating them as two
different things. D-3 formalizes a distinction the code already makes informally.

### 3.12 Card authors are already hand-rolling read-through

Seven cards manually implement "use last-known if present, otherwise live" — exactly the semantics
D-1 provides automatically. See special-cases SC-11. This is the strongest evidence that D-1
matches author intent.

### 3.13 SWU 8.5 uses "copy" for two unrelated concepts

This is a **naming hazard** for the design.

**8.5.1–8.5.3 — "copy" = printed-attribute equivalence between different physical cards.**
Two cards are copies if they share all printed attributes. Used by card text like
[InspectorsShuttle](../server/game/cards/06_SEC/units/InspectorsShuttle.ts)
("for each copy of the named card in their hand"),
[JumpToLightspeed](../server/game/cards/04_JTL/events/JumpToLightspeed.ts)
("the next time you play a copy of that unit"), and
[Clone](../server/game/cards/03_TWI/units/Clone.ts) ("enters play as a copy of").

**8.5.4 — "new copy" = a new instance of the *same* physical card**, created when it leaves and
re-enters play. This is the identity concept our design needs.

Naming a handle's identity field `copyId` / `CardCopyId` would collide with the 8.5.1 sense that
card authors already use. Prefer a term like *instance* or *incarnation*.

### 3.14 Identity break: re-entering play, or entering a hidden zone

> 8.5.4. Whenever a card leaves and later re-enters play, it is considered a "new copy"…
> **It continues to be considered a new copy even if it changes zones.**

The rule ties identity break to **re-entering play**, and confirms that ordinary zone changes do
not create further new copies.

The engine also increments on entering a hidden zone
([InPlayCard.ts](../server/game/core/card/baseClasses/InPlayCard.ts)), which is **correct and
necessary**: once a card enters Hand, Resource or Deck, all tracking information about it is lost,
so whenever it becomes visible again it must necessarily be treated as a new instance. For all
practical purposes, entering a hidden zone amounts to becoming a new copy.

So the two triggers are:

| Trigger | Zones | Rationale |
|---|---|---|
| Re-enters play | any → arena | SWU 8.5.4, new copy |
| Enters a hidden zone | any → Hand / Resource / Deck | Tracking information lost |

Note that **Discard and Capture are visible**, so arena → discard preserves instance identity: a
defeated unit in the discard is still the same instance it was in the arena.

### 3.17 Every `inPlayId` usage in the repo is an instance-equality comparison

75 sites reference `inPlayId` / `mostRecentInPlayId`: **35** in state watchers, **22** in core,
**18** in card implementations. Reviewing all of them, they do exactly one thing — compare a
`(card, instanceId)` pair against another to ask *"is this the same instance?"*

Every site hand-writes the pair comparison:

```ts
// VanguardAce.ts:28, LothalInsurgent.ts:29
cardPlay.card !== context.source || cardPlay.inPlayId !== context.source.inPlayId

// MillenniumFalconLandosPride.ts:26
entry.card === context.source && entry.inPlayId === context.source.inPlayId

// UndercoverOperation.ts:28
entry.card === card && card.canBeInPlay() && entry.inPlayId === card.inPlayId

// AsajjVentressCountDookusAssassin.ts:31, AnakinsPodracerSoWizard.ts:28
attackEvent.attacker !== context.source || attackEvent.attackerInPlayId !== context.source.inPlayId

// LattsRazziDeadlyWhipmaster.ts:37
x.card === thenContext.source && x.inPlayId === thenContext.source.mostRecentInPlayId

// ObiWanKenobiFindingWhatDoesntExist.ts:42
!card.canBeInPlay() || card.mostRecentInPlayId === targetedCard.mostRecentInPlayId

// TheEmperorsLegion.ts:30
unit.mostRecentInPlayId === defeatedInPlayId

// KylosTieSilencerRuthlesslyEfficient.ts:28, SalvagedBlaster.ts:30
entry.discardedPlayId === context.source.mostRecentInPlayId
```

The watchers additionally **store** the pair — `DefeatedCardEntry { card, inPlayId, ... }`,
`CardLeftPlayEntry { card, inPlayId, ... }`, `InPlayUnit { unit, inPlayId }` — which is the handle
concept, hand-rolled and duplicated per watcher.

Six sites must additionally hand-roll the zone-gated accessor workaround (SC-7):
`CardsDefeatedThisPhaseWatcher.ts:76`, `UnitsHealedThisPhaseWatcher.ts:41`,
`UnitsDamagedThisPhaseWatcher.ts:41`, `MonMothmaClingingToHope.ts:38`, and
`LastKnownInformation.ts:60,76`.

**Consequences for the design:**

1. Instance identity must be a **first-class comparable value**, so all 75 sites collapse to a
   single equality check rather than a hand-written pair comparison.
2. It must be readable **without throwing**, regardless of zone (removing the 6 ternaries).
3. Watcher entry types should store a handle rather than `(GameObjectId, number)` pairs.
4. Because every existing usage is already instance-aware, making handle equality instance-aware
   is **consistent with intent** at these 75 sites — the risk in open question 2 is confined to the
   ~359 sites that compare bare card references *without* an instance check.

---

### 3.15 8.5.4 reinforces that footprints are pure data

> …does not regain any modifiers or reapply any effects from when it was previously in play.

Combined with 8.11.2 ("only reference information"), this is a second, independent statement that a
returning card must not resurrect prior state — and that a footprint must never be a live view onto
ability machinery.

### 3.16 `MonMothma` already hand-rolls the handle concept

[MonMothmaClingingToHope.ts:24-42](../server/game/cards/06_SEC/units/MonMothmaClingingToHope.ts)
tracks chosen units as explicit `{ card, inPlayId }` pairs — a hand-rolled handle — and compares
identity copy-aware:

```ts
private attackWithUnitAbility(chosenCards: { card: IUnitCard; inPlayId: number }[], ...)
...
cardCondition: (card, context) => card !== context.source &&
    !chosenCards.some((chosen) => chosen.card === card && card.isUnit() && chosen.inPlayId === card.inPlayId),
...
const targetInPlayId = context.target.isUnit() && context.target.isInPlay()
    ? context.target.inPlayId : context.target.mostRecentInPlayId;
```

The last line is also a hand-rolled workaround for the zone-gated accessors of SC-7. This card is
strong evidence for both the handle abstraction and a total, never-throwing identity accessor.

### 3.18 Only `InPlayCard` descendants have an identity counter

The class hierarchy determines which cards can express instance identity at all:

| Card kind | Extends | Has counter? | Zones occupied |
|---|---|---|---|
| `BaseCard` | `Card` (via mixins) | ❌ | Base only — never moves |
| `EventCard` | `PlayableOrDeployableCard` | ❌ | Hand, Deck, Discard, Resource |
| `NonLeaderUnitCard` / `LeaderUnitCard` | `InPlayCard` | ✅ | Hand, Deck, Discard, Resource, Arenas, Capture |
| `UpgradeCard` | `InPlayCard` | ✅ | …plus Arena (attached), Base (Fortify) |
| `TokenUnitCard` / `TokenUpgradeCard` | `InPlayCard` | ✅ | Arena, OutsideTheGame |
| `TokenCard` (Force / Credit) | `InPlayCard` | ✅ | **Base**, OutsideTheGame |

Two structural problems:

1. **`BaseCard` and `EventCard` have no identity concept at all.** Any universal handle type must
   define what identity means for them.
2. **Force and Credit tokens are `InPlayCard`s that live in the Base zone**, where
   [isInPlay()](../server/game/core/card/baseClasses/InPlayCard.ts) returns `false` (it is true only
   for arenas, or Base for an attached upgrade). So `inPlayId` would **throw** for them. They avoid
   it today only because `buildLastKnownInformation`'s non-arena branch omits `inPlayId` entirely —
   meaning **LKI for non-arena cards currently carries no identity at all**, including the Force
   token captured by [UseTheForceSystem.ts:62](../server/game/gameSystems/UseTheForceSystem.ts).

### 3.19 The zone-gated accessors have produced latent fragility

[CardsPlayedThisPhaseWatcher.ts:71-72](../server/game/stateWatchers/CardsPlayedThisPhaseWatcher.ts):

```ts
parentCardInPlayId: event.card.isUpgrade() && event.card.parentCard?.canBeInPlay() ? event.card.parentCard.inPlayId : null,
inPlayId: event.card.inPlayId ?? null,
```

- Line 72's `?? null` **cannot** protect against a throw. It works only because `EventCard` lacks
  the property entirely (yielding `undefined`) while `InPlayCard` has a throwing getter — i.e. it
  depends on two different failure modes coincidentally producing the same result.
- Line 71 guards with `canBeInPlay()` (a type predicate, always true for `InPlayCard`) rather than
  `isInPlay()` (a zone check). An `InPlayCard` parent that is not in an arena would throw.

Both are symptoms of the same root cause as the 6 hand-rolled ternaries: there is no total,
never-throwing way to ask a card for its identity.

### 3.20 The handle interface is small, and card code barely touches engine machinery

Frequency analysis of member accesses on card-typed receivers across `server/game/cards/**`
(receivers: `context.source`, `context.target`, `thenContext.target`, `ifYouDoContext.target`,
`event.card`, and `card` / `unit` / `upgrade` / `attacker` parameters):

**76 distinct members, ~2,029 accesses.** The distribution is steeply power-law — the top 10
members account for ~67% of all accesses, the top 20 for ~84%.

By category:

| Category | Accesses | Examples |
|---|---:|---|
| **Type guards** | ~530 (26%) | `isUnit` 338, `isUpgrade` 50, `isNonLeaderUnit` 37, `isBase` 17, `hasCost` 19, `canBeExhausted` 14 |
| **Characteristics** | ~1,050 (52%) | `hasSomeTrait` 272, `controller` 139, `cost` 120, `title` 106, `getPower` 74, `damage` 54, `hasSomeAspect` 46, `exhausted` 40, `unique` 35, `remainingHp` 34, `upgrades` 29 |
| **Relational** | ~176 | `parentCard` 121, `isUpgraded` 29, `parentUnit` 21 |
| **Location** | ~134 | `zoneName` 78, `isInPlay` 37, `zone` 19 |
| **Attack state** | ~74 | `activeAttack` 37, `isAttacking` 23, `isDefending` 14 |
| **Identity** | ~17 | `inPlayId` 9, `mostRecentInPlayId` 5, `uuid` 3 |
| **Engine machinery** | **~15 (0.7%)** | `getTriggeredAbilities` 5, `canAttach` 5, `canRegisterTriggeredAbilities` 3, `game` 1 |

**Three consequences for the design:**

1. **The handle interface can be much smaller than `Card`.** Card implementations touch engine
   machinery in only ~0.7% of accesses, so excluding mutation and ability-registration methods from
   the handle costs almost nothing — and directly satisfies SWU 8.11.2 (§3.15). This is what makes
   a parallel handle hierarchy tractable rather than a full mirror of `Card`.
2. **Type guards must be first-class on handles.** At 26% of all accesses they are the single
   largest category after characteristics, so `isUnit()` and friends have to narrow to handle types,
   not card types. This is the main mirroring work.
3. **Handles need query methods, not just data fields.** `hasSomeTrait` (272) is the second most
   common access overall, and `remainingHp` (34) is derived from `getHp()` and `damage`. A plain
   frozen record would not serve these.

### 3.21 Most `isInPlay()` calls are accessor guards, not game questions

Of the 43 `isInPlay()` call sites in `server/game/cards/**`, the majority exist to prevent a
zone-gated accessor from throwing (§3.2), not to ask a rules question:

```ts
matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isAttacking() &&
    card.activeAttack.getAllTargets().includes(context.source.parentUnit),
//  ^^^^^^^^^^^^^^^ isInPlay() guards this from throwing
```

[activeAttack](../server/game/core/card/propertyMixins/Damage.ts) asserts
`assertPropertyEnabledForZoneBoolean(this._attackEnabled, 'activeAttack')`, so reading it out of
play is a crash rather than a wrong answer.

| Category | Count | Fate under the snapshot model |
|---|---:|---|
| Guards against a throwing accessor | ~17 | **Evaporate** — captured characteristics never throw |
| SC-11 hand-rolled live/frozen fallbacks | ~7 | **Collapse** — read-through removes the branch |
| Genuine "did it survive?" questions | ~19 | Need an explicit live query |

Guard breakdown: `activeAttack` / `isAttacking()` / `isDefending()` — 12 sites (`JynErsoResistingOppression`,
`Electrostaff`, `DeadlyVulnerability`, `IHaveTheHighGround`, `VelSarthaOnePathOneChoice`,
`ScionShuttleAtMorgansBidding`, `LandoCalrissianEyesOpen`, `CassianAndorLayLow`, `CloneDiveTrooper`,
`AwakenedExogorth`, `GoldLeaderFastestShipInTheFleet`, `MirajScintelTheWeakDeserveToKneel`);
`parentCard` — 3 (`PerilousPosition`, `KillSwitch`, `Shield`); `getPower()` / `damage` — 2
(`InsurgentCamp`, `MaceWinduVaapadFormMaster`).

**Consequence:** roughly 24 of 43 sites disappear rather than migrate. This is an argument for the
snapshot model independent of LKI correctness — it removes a class of defensive boilerplate that
exists only because live property access is zone-gated. Net line count in card implementations
likely decreases.

> **Correction (see SC-17 and D-27).** The conclusion above is wrong for the ~17 accessor guards.
> Those guards encode a real semantic distinction — `power` is a property of a unit *in play* (or of
> the LKI of a unit that was in play), while `printedPower` is the distinct concept for a card that
> is not in play. The guards are therefore **preserved as type-narrowing guards** in nearly identical
> syntax, and the gain is safety (compile-time instead of runtime) rather than line count. Only the
> ~7 SC-11 fallbacks genuinely collapse.

---

## 4. Measurements

Useful for sizing the migration and for sanity-checking claims.

| Metric | Value |
|---|---:|
| `.ts` files under `server/` | 2,455 |
| Card implementation files | 2,058 |
| Card files reading card properties directly | ~1,028 |
| Direct property read sites in `cards/` | ~1,675 |
| Spec files / `describe` blocks | 2,116 / 4,221 |
| Type-guard methods on `Card` (`this is X`) | 27 |
| LKI consumers (all slots) | ~50 across ~45 files |
| — of which in `when` / `aggregateWhen` | ~21 |
| — of which in late slots (`condition`, `then`, `ifYouDo`, `immediateEffect`, `contextTitle`, `targetResolver`) | ~30 |
| Hand-rolled live/frozen fallbacks | 7 |
| Hops through `lastKnownInformation.card` to live state | **1** (Dengar) |
| Reference identity comparisons (`===`/`!==`/`includes`) | ~359 across ~323 files |
| Location reads (`.zoneName`, `.zone`, `.isInPlay()`) | 144 |
| — structurally immune (engine-supplied candidates) | ~62 |
| — genuinely affected by freezing | **~16** |
| `inPlayId` / `mostRecentInPlayId` sites | 75 |
| — in state watchers | 35 |
| — in `core/` | 22 |
| — in `cards/` | 18 |
| — hand-rolling the zone-gated accessor ternary | 6 |
| Distinct members accessed on card receivers in `cards/` | 76 |
| — total accesses | ~2,029 |
| — share taken by top 10 members | ~67% |
| — share that is engine machinery | **~0.7%** |
| Files reading 2+ properties off one receiver in an expression | 347 |
| `isInPlay()` sites in `cards/` | 43 |
| — accessor guards that evaporate under snapshots | ~17 |
| — SC-11 fallbacks that collapse | ~7 |
| — genuine live "did it survive?" queries | ~19 |

---

## 5. Requirements derived so far

1. **Correct by default.** A card implementation that does nothing special must get last-known
   state for a departed card.
2. **Eager materialization at departure.** Derived values cannot be reconstructed after ongoing
   effects are torn down (3.1).
3. **Window-batched capture.** Simultaneity semantics must be preserved (3.4).
4. **References must survive being passed around** and stored across steps.
5. **Instance identity must be comparable** and available without throwing, for every card kind. It
   must be a first-class value so the 75 hand-rolled pair comparisons (§3.17) collapse to one check.
6. **References must dereference back to live objects** for game systems to act on, automatically
   at the system boundary (D-6), with fizzle semantics when the instance no longer matches.
7. **No silent fallback to live state.** A read that cannot be served correctly should fail loudly
   rather than return a wrong value — this is the failure mode of the current design.
8. **Incrementally migratable.** A big-bang change across ~1,028 files is not viable.
9. **Reference validity must be first-class.** Most "is it still in the discard?" checks are really
   "is this reference still valid?" — see §3.8 and special-cases SC-12. Copy-id comparison answers
   this; the ability's own zone requirements remain a framework concern.
10. **Footprints are pure reference data** (SWU 8.11.2) — they must not reactivate abilities or
    ongoing effects that were on the card — and are **deeply immutable** once minted (D-17).
11. **Holders that outlive the registry's retention window must materialize values, not hold
    handles** (D-16). This applies to state watchers, phase-long cost adjusters, delayed effects,
    and "for this phase" ongoing effects.
12. **Multiple footprints for one card must coexist** within an action, keyed by instance, with
    handles bound at event time (SC-13).

---

## 6. Open questions

The design questions are settled. What remains is rollout, plus two deferred investigations
(D-7 and D-12) that gate it.

---

### Q1. Migration sequencing and rollout

Larger under D-18 than it would have been under D-1: every property read site changes, not just
LKI consumers. The compensation is that type-level separation (D-10) makes `tsc` enumerate the work
exhaustively.

**Prerequisites:**

- ~~D-7's systems audit~~ — **complete**; dereference happens in
  `GameSystem.generatePropertiesFromContext`, fizzle reuses the existing two-phase legality check
- **The SC-16 regression test** — add it *before* migrating, since it passes today and is the
  before/after check on centralizing footprints
- **Close the legality gaps found by the D-7 audit** — systems that do not override
  `canAffectInternal` accept targets in any zone, and extra card-valued properties (`captor`,
  `upgrade`, `parentCard`, `attacker`) are validated inconsistently

**Sequencing questions:**

- First vertical slice: the 7 hand-rolled fallbacks (SC-11) are good candidates — small,
  well-tested, and they should *simplify* rather than change behavior
- In what order do `event.card`, `context.source`, `context.target` become references?
- When do the 75 hand-rolled instance checks and `Attack`'s tracking Map get removed (D-11)?
- When does `IStateWatcherLKIEntry.upgrades` gain its missing instance component (D-23)?
- When is performance measured? D-25's memoization should be validated early, since the cost lands
  on target selection and would be expensive to discover late.

---

### Deferred investigations

| ID | Question |
|---|---|
| D-2 | On-demand pinning (`pin()`) for true point-in-time capture — only if a card needs a past value for a card still in play |
| D-12 | Which engine internals need *physical-card* identity rather than instance identity |

---

## 7. Assets working in our favour

- **4,221 tests across 2,116 spec files.** The success criterion for this refactor is behavior
  preservation, and the regression net is unusually strong.
- **State is already separated from behavior.** `GameObjectBase` keeps mutable state in a
  serializable bag behind `@statePrimitive` / `@stateRef` accessors, so "properties behind
  accessors" is an established pattern here.
- **Custom lint rules already exist** ([eslint-rules/](../eslint-rules)), so lint-level enforcement
  of migration rules is a proven option in this repo.
- **Only one `.card` hop** exists in the entire repo, so the most dangerous existing escape hatch
  is a single-site fix.
