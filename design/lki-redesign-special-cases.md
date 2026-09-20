# LKI Redesign — Special Cases and Deferred Decisions

**Status:** living document. Added to incrementally as the design progresses.

Companion to [lki-redesign-decisions-and-insights.md](./lki-redesign-decisions-and-insights.md),
which tracks decisions made and insights about current engine behavior.

This tracks cases that the general "last known information" (LKI) redesign does **not** cleanly
cover, plus decisions we have consciously deferred. Each entry should record what the case is,
where it lives in the code, why the current design direction does not handle it, and what we
decided to do for now.

This is a working document, not a specification. The design itself is still being iterated.

---

## Background

Cards that leave the arena may still be referred to by lingering triggers. Per SWU 8.12, those
triggers refer to the card's *last known* state before it left, not its current state. See
[LastKnownInformation.ts](../server/game/core/event/LastKnownInformation.ts) for the current
mechanism.

The redesign replaces today's opt-in, per-event LKI structs with an accessor layer: card
properties are reached through references that resolve against a transient registry, so that
correct LKI is the default rather than something each system and each card implementation has to
remember to do.

---

## Decision log

| ID | Decision | Date | Status |
|---|---|---|---|
| Q1 | Ability code holds a **reference handle**, not a materialized value. Property reads dispatch through the registry at read time: read through to the live card while it is current, serve a frozen footprint once it has left. | 2026-09-18 | Decided |
| Q1a | No `pin()` / on-demand point-in-time capture for now. Scope is limited to "current state, or last known state if the card has left." | 2026-09-18 | Deferred — see D-2 |

**Note:** the full decision log now lives in
[lki-redesign-decisions-and-insights.md](./lki-redesign-decisions-and-insights.md) §2. The two
entries above are retained for historical continuity; D-2 and D-7 and D-12 below are the deferred
items whose detail lives in this document.

---

## Deferred decisions

### D-2 — On-demand pinning (`pin()`) for true point-in-time capture

**Deferred.** We are proceeding with "current-or-last-known" only.

**What was deferred.** An explicit registry operation that mints a footprint at an arbitrary
moment, freezing all existing references to that card-copy even though the card is still in play.
This would support "what was this card's state at moment T", as opposed to only "what was this
card's state when it left".

**Why this is not just theoretical.** The attack flow already captures LKI at attack declaration,
for a card that is typically *still in play*:

[AttackFlow.ts:54-63](../server/game/core/attack/AttackFlow.ts) — `declareAttack()`

```ts
// Capture the attacker and defender's LKI on the event itself, before any "On Attack" / "On Defense"
// abilities can mutate or defeat the attacker. Read by triggers that resolve during the
// OnAttackDeclared window (e.g. Kragan Gorr's target resolver).
const captureLastKnownInformation = buildAttackLastKnownInformationHandler(this.attack);
```

Note the wording: **"mutate _or_ defeat"**. The "defeat" half is ordinary LKI and is covered by the
new design. The "mutate" half is genuine pinning — it implies declaration-time values should be
preserved even if the attacker survives and its stats change during the window.

**Why deferring looks safe today.** The only consumers of `attackerLastKnownInformation` from the
`OnAttackDeclared` window read `controller` and `arena`:

- [KachirhoMilitia.ts:20-21](../server/game/cards/08_ASH/units/KachirhoMilitia.ts) — reads
  `attackerLastKnownInformation.controller` and `.arena`
- [KraganGorrWarbirdCaptain.ts:22](../server/game/cards/02_SHD/units/KraganGorrWarbirdCaptain.ts) —
  reads `attackerLastKnownInformation.arena`

Neither `controller` nor `arena` typically changes during the declaration window, and the
motivating scenario in both cases is the attacker being *defeated* by an On Attack trigger before
these triggers resolve — which "current-or-last-known" handles correctly.

The other two attack-flow capture sites are plain LKI and are fully covered:

- [AttackFlow.ts:86-89](../server/game/core/attack/AttackFlow.ts) — `OnAttackDamageResolved`
- [AttackFlow.ts:105-108](../server/game/core/attack/AttackFlow.ts) — `OnAttackEnd`, read by
  [WhistlingBirds.ts:38](../server/game/cards/08_ASH/upgrades/WhistlingBirds.ts) whose comment is
  explicitly about the attacker having *been defeated*

**Behavioral risk to verify during migration.** Under the new design, a still-in-play attacker's
`controller` / `arena` will be read *live* at trigger resolution time rather than pinned at
declaration. Cases to construct tests for:

- Control of the attacker changes during the `OnAttackDeclared` window
- The attacker moves arenas during the `OnAttackDeclared` window

**Revisit if:** a card requires reading a past value for a card that is still in play, or the
above verification shows a real behavioral difference.

---

### D-7 — Where automatic dereference happens

**Deferred.** D-6 settled *that* handle-to-live-card conversion is automatic at the system
boundary. *Where* that conversion happens is deferred pending analysis of existing game systems.

The analysis needs to establish, across `server/game/gameSystems/**` and
`server/game/core/gameSystem/**`:

- which systems accept cards as targets, and through which property paths
- which read properties off a target *before* mutating it (those reads should go through the
  footprint, but the mutation needs the live object — so the two operations may need to happen at
  different points in the same system)
- which have **gaps in their current legality checks**, where a hand-written card-side check is
  silently doing the framework's job. [CaptureSystem](../server/game/gameSystems/CaptureSystem.ts)
  with `fromOutOfPlay: true` is a confirmed example (§3.8) — it checks only `card.isUnit()`, so
  `Bothan5`'s zone condition is load-bearing
- how aggregate/composite systems (`simultaneous`, `sequential`, `conditional`) propagate targets,
  since a handle passed to a composite must reach the right seam in each child
- how `CardTargetSystem.generateEvent`'s existing `addLastKnownInformation` flag interacts (SC-1)

**Constraint from SC-2:** whatever seam is chosen must give the Finn/Bothan5 pattern — a handle
used directly as a mutation target — defined fizzle semantics, replacing today's accidental
reliance on `canAffect` rejection.

---

### D-12 — Engine internals that need physical-card identity

**Deferred.** D-11 makes instance-aware equality the default, which is correct for game rules. But
engine bookkeeping is generally about the *physical card object*, not the rules-level instance, so
exceptions are expected.

**The working distinction:**

| Concern | Identity needed |
|---|---|
| Game rules — "is this the same unit the ability referred to?" | **Instance** (D-11) |
| Engine bookkeeping — "which object do I remove from this collection?" | **Physical card** |

**Why this may largely resolve itself.** Under D-6, card implementations receive handles while game
systems operate on live `Card` objects. Engine code comparing `Card` to `Card` gets physical
identity for free. The question is therefore narrower: **are there places that hold a handle but
need physical-card identity?**

**Candidates to audit:**

- **Zone membership and mutation** — `zone.addCard()` / `removeCard()`, `zone.cards.includes(...)`,
  `removeFromCurrentZone()` in [Card.ts](../server/game/core/card/Card.ts). These must find the
  physical object regardless of instance.
- **Ongoing effect bookkeeping** — `_ongoingEffects.filter((e) => e.uuid !== ...)` in
  [GameObject.ts](../server/game/core/GameObject.ts), and ability register/unregister, which attach
  to the physical card.
- **Serialization and identity mapping** — `getObjectId()` / `getFromId()` are keyed by `uuid`,
  which is per *physical card*. If a handle needs a stable serializable id (e.g. for watchers under
  D-8/Q3), it is `(uuid, instance)` and the two must not be confused.
- **Uniqueness rule** — [checkUnique()](../server/game/core/card/baseClasses/InPlayCard.ts) compares
  `title`/`subtitle`, but selecting *which physical card* to defeat may need physical identity.
- **Attack state** — `Attack.unitControllersChanged` is a `Set<IAttackableCard>` tracking control
  changes; confirm which identity it wants.
- **Upgrade attachment** — `parentCard` / `upgrades` hold physical cards and are mutated during
  attach/unattach.
- **`registerMovedCard`** — tracks which physical cards moved for state re-resolution.

**Open:** if handle-side physical comparison is genuinely needed, how is it expressed — an explicit
`samePhysicalCardAs()` escape hatch, or do those call sites simply keep using live `Card`
references? Prefer the latter if the D-6 boundary holds cleanly.

---

## Special cases

### SC-1 — Two LKI producers capture at different timepoints

There are currently two ways LKI gets attached to an event, and they do not capture at the same
instant:

1. [`addLastKnownInformationToEvent`](../server/game/core/event/LastKnownInformation.ts) — defers
   capture via `setPreResolutionEffect`, so it runs at the event window's `preResolutionEffects`
   step, batched across the whole window and before any handler executes.
2. [CardTargetSystem.ts:156](../server/game/core/gameSystem/CardTargetSystem.ts) —
   `generateEvent(context, additionalProperties, addLastKnownInformation = true)` calls
   `buildLastKnownInformation` **immediately at event-creation time**.

Both write to the same `event.lastKnownInformation` field, so a consumer cannot tell which timing
it received.

**Action:** when migrating, determine whether any consumer depends on the earlier capture point of
(2). The new design collapses both into read-through, which behaves like neither exactly.

---

### SC-2 — LKI fields used as live mutation targets

LKI is not always read as data — sometimes a field is pulled off the snapshot and fed straight
into a game system as a target to mutate:

[FinnThisIsARescue.ts:29,50](../server/game/cards/02_SHD/leaders/FinnThisIsARescue.ts)

```ts
immediateEffect: AbilityHelper.immediateEffects.giveShield({
    target: ifYouDoContext.events[0].lastKnownInformation.parentCard
}),
```

The upgrade has been defeated, so `parentCard` is read from LKI — but the resulting reference is
then used as a live object to receive a Shield token.

**Current behavior is accidental.** If the parent unit has itself left play by then, the effect
fizzles only because `canAffect` rejects it — not because anything checked that the snapshot still
refers to a valid, current copy.

**Action:** the new design needs explicit "resolve this reference to a live card, but only if it is
still the same copy" semantics, with a defined fizzle path. Verify this does not change behavior in
cases currently relying on the `canAffect` rejection.

---

### SC-3 — Live-object hops through `lki.card`

Today's `ILastKnownInformation` carries a `card` field holding the live card object, which makes it
trivial to read live state while believing you are reading LKI:

[DengarTakeYourShot.ts:28-42](../server/game/cards/07_LAW/units/DengarTakeYourShot.ts)

```ts
const isEnemyUnit = EnumHelpers.isUnit(event.lastKnownInformation.type) &&   // line 28
  event.lastKnownInformation.controller !== context.player;                  // line 29 — LKI
...
const defeatedUnitCost = event.lastKnownInformation.card.cost;               // line 42 — live read
```

`cost` *is* captured on the LKI struct, so this read is inconsistent with the two above it.

The new design removes the hop structurally (there is no `.card` to reach through), but that means
every existing `.card` hop has to be classified during migration.

**Action:** audit each `lastKnownInformation.card.*` read and decide per site whether live or
last-known was intended. Do not assume the current behavior is correct — at least one of these is a
latent bug.

---

### SC-4 — Shallow capture and the cyclic card graph

Today's capture is one level deep: `upgrades` and `parentCard` are stored as **live card
references**, not snapshots. So `lki.upgrades[0].getPower()` reads present-day state.

Making this transitive runs into a cycle: unit → `upgrades` → upgrade → `parentCard` → unit.

It is also the common case that the whole cluster leaves play *together* — attached upgrades are
defeated via contingent events generated in the same window
([CardTargetSystem.ts:214](../server/game/core/gameSystem/CardTargetSystem.ts)).

**Working assumption:** references resolve to other references through the registry, keyed by copy
identity, which handles the cycle naturally because nothing is eagerly expanded.

**Largely resolved by Q1.** The Model B decision (read-through handles, no eager materialization)
means `unit.upgrades` yields upgrade *handles* rather than expanded values, so the cycle cannot
recurse. What remains open is whether a footprint minted for a departing unit also guarantees
footprints for the upgrades that left with it — see the minting-policy question.

---

### SC-5 — Window-batched capture preserves simultaneity

Capture currently happens at the event window's `preResolutionEffects` step — that is, **batched
across every event in the window, before any handler runs**. This is what makes simultaneously
defeated units all snapshot at the same instant.

This is load-bearing:

- `test/scenarios/timingWindows/DefeatTiming.spec.ts`
- [DengarTakeYourShot.ts:36](../server/game/cards/07_LAW/units/DengarTakeYourShot.ts) compares cost
  against other units defeated in the same window via `event.window.events`

**Constraint:** footprints must be minted at the window-batched point, **not** lazily at the moment
of each individual zone move. A move-triggered mint would break simultaneity in ways these tests
may or may not catch.

---

### SC-6 — Parallel phase-scoped LKI in state watchers

State watchers keep their own, lossier copy of LKI, scoped to an entire phase rather than an
ability resolution:

[StateWatcher.ts:22](../server/game/core/stateWatcher/StateWatcher.ts)

```ts
export interface IStateWatcherLKIEntry {
    traits: Set<Trait>;
    type: CardType;
    power?: number;
    arena?: ZoneName;
    upgrades?: GameObjectId<IUpgradeCard>[];
    // TODO: Add more fields if needed
}
```

Consumers include
[CardsLeftPlayThisPhaseWatcher](../server/game/stateWatchers/CardsLeftPlayThisPhaseWatcher.ts) and
[CardsDefeatedThisPhaseWatcher](../server/game/stateWatchers/CardsDefeatedThisPhaseWatcher.ts).

Unlike event LKI, watcher state **is** tracked state (`@registerState()`, `GameObjectId` refs,
serializable), because it must survive rollback.

Since the new registry is transient and flushes at a boundary far finer than a phase, watchers
cannot simply read from it.

**Open:** whether unification is in scope, or watchers continue to persist their own extracts. The
`TODO: Add more fields if needed` suggests the lossy extract is already causing friction.

---

### SC-7 — Copy identity is zone-gated and overloaded

[InPlayCard.ts:92-114](../server/game/core/card/baseClasses/InPlayCard.ts) backs copy identity with
a single counter, `_mostRecentInPlayId`, exposed through two mutually exclusive accessors that
**throw** outside their applicable zone:

- `inPlayId` — asserts the card *is* in play
- `mostRecentInPlayId` — asserts the card is *not* in play and not in a hidden zone

The counter is incremented on two occasions
([InPlayCard.ts:420-440](../server/game/core/card/baseClasses/InPlayCard.ts)):

1. the card enters play (new copy per SWU 8.6.4)
2. the card moves into a hidden zone — `Hand`, `Resource` or `Deck` per
   [EnumHelpers.isHiddenFromOpponent](../server/game/core/utils/EnumHelpers.ts) (information loss)

**These are correctly fused.** An earlier draft of this document suggested they might be two
distinct concepts that should be separated. That was wrong — both express the single idea
"identity continuity is broken": case 1 by rule (SWU 8.5.4), case 2 because once a card is in a
hidden zone all tracking information about it is lost, so it must be treated as a new instance
whenever it becomes visible again. Note that **`Discard` and `Capture` are visible zones, so
arena → discard preserves instance identity**: a defeated unit sitting in the discard is still the
same instance it was in the arena.

What genuinely needs separating is *footprint minting* (triggered by leaving play) from *identity
break* (triggered by the two cases above). See decisions doc D-5.

Callers currently work around the zone gating with expressions like
`card.isInPlay() ? card.inPlayId : card.mostRecentInPlayId`.

**Action:** the design needs one always-readable, never-throwing copy identity.

**Open:** what copy identity means for cards that are never in play — event cards, bases, cards in
hand or deck, tokens moved to `OutsideTheGame`.

---

### SC-8 — A single ability may need both frozen and live views of the same card

Whole-object freezing is **not sufficient**. At least one card needs last-known state *and*
current state of the same card, in the same ability:

[Bothan5NewRepublicPrisonShip.ts:18-32](../server/game/cards/08_ASH/units/Bothan5NewRepublicPrisonShip.ts)

```ts
contextTitle: (context) => `... captures ${context.event.card.title} ...`,   // line 18 — either
when: {
    onCardDefeated: (event, context) =>
        EnumHelpers.isUnit(event.lastKnownInformation.type) &&               // line 21 — FROZEN
        event.lastKnownInformation.controller === context.player &&          // line 22 — FROZEN
        event.card !== context.source &&                                     // line 23 — identity, see SC-9
        !event.lastKnownInformation.traits?.has(Trait.Vehicle),              // line 24 — FROZEN
},
immediateEffect: abilityHelper.immediateEffects.conditional({
    condition: (context) => context.event.card.zone === context.player.discardZone,  // line 29 — LIVE
    onTrue: abilityHelper.immediateEffects.capture((context) => ({
        captor: context.source,
        target: context.event.card,                                          // line 32 — LIVE object
        fromOutOfPlay: true,
    }))
})
```

The `condition` is asking "did this card actually end up in the discard pile" — a guard against it
having been moved elsewhere. If a footprint shadowed `zone`, that condition would read the arena
and **never be true**, so the capture would silently never happen.

**Action:** see the "characteristics vs. location" finding below — the discriminator is *not* the
property name and *not* the ability slot, but whether the read asks "what was this card?" or
"where is this card now?"

**Related timing subtlety.** [PunishingOne.ts:17-21](../server/game/cards/02_SHD/units/PunishingOne.ts)
and [LuthenRaelDontYouWantToFightForReal.ts:20-23](../server/game/cards/06_SEC/leaders/LuthenRaelDontYouWantToFightForReal.ts)
call `event.card.isInPlay()` inside a `when` condition. See SC-10 — `when` runs twice, so this is
evaluated both before and after the card moves.

---

### SC-9 — Reference identity comparisons (`===` / `!==` / `includes`)

Card implementations compare card references by identity in **~359 places across ~323 files**:

```ts
event.card !== context.source                  // Bothan5NewRepublicPrisonShip.ts:23
event.card === context.source                  // KyloRensLightsaber.ts:23, QiraIAloneSurvived.ts:34
context.source.parentCard === event.card       // InDebtToCrimsonDawn.ts:21
context.source.upgrades.includes(event.card)   // WillrowHoodOnTheRun.ts:17
```

Under the new design these compare a **handle** against either a live `Card` or another handle. If
handles are minted fresh per access, `===` is false even for the same card-copy, and every one of
these sites silently changes behavior with no compile error and no runtime error.

**Two sub-questions:**

1. ~~**Interning.**~~ **Resolved by D-8** — the registry vends interned handles, one canonical
   object per `(card, instance)` pair, so `===` continues to work and these ~359 sites need no
   migration.
2. **Copy-aware equality is a behavior change.** Today `===` compares *physical card* identity,
   ignoring instances. Under interned handles, equality becomes instance-aware, so a card that left
   play and returned is no longer equal to its earlier self. Per SWU 8.5.4 that is arguably *more*
   correct — and §3.17 shows the 75 `inPlayId` sites already hand-roll exactly this — but it is a
   silent behavior change across 359 sites and needs to be deliberate.

**New hazard introduced by D-8:** during incremental migration, some values will be handles and
some will still be live `Card` objects. `handle === card` is **always false**, silently. This is a
migration-ordering risk and a strong argument for making handles non-assignable to `Card` so the
compiler flags the mixing (open question 8).

**Action:** confirm the equality behavior change is intended, and sequence the migration so handle
and `Card` values are not compared. `test/scenarios/` coverage for cards that leave and re-enter
play is the relevant regression net.

---

### SC-10 — `when` conditions are evaluated twice, at two different timepoints

A trigger's `when` / `aggregateWhen` condition is **not** evaluated once. The event window emits
trigger events twice:

1. [EventWindow.ts:206-212](../server/game/core/event/EventWindow.ts) — inside `resolveEvents()`,
   **before** any handler runs, so the card is still in the arena:
   ```ts
   this._triggeredAbilityWindow.addTriggeringEvents(this._events);
   this._triggeredAbilityWindow.emitEvents(this._events);
   ```
2. [EventWindow.ts:248-259](../server/game/core/event/EventWindow.ts) — inside
   `postResolutionTriggers()`, **after** every handler has run, so the card has already moved:
   ```ts
   this._triggeredAbilityWindow.emitEvents(this.resolvedEvents);
   ```

Duplicate firing is prevented by `(ability, event)` pair tracking in
[TriggerWindowBase.ts:143-162](../server/game/core/gameSteps/abilityWindow/TriggerWindowBase.ts) —
so **whichever pass first returns `true` wins**, and if pass 1 returns `false` the condition gets a
second chance against post-move state.

**Why this matters.** A `when` condition that reads live state is non-deterministic with respect to
which pass evaluates it. [PunishingOne.ts:17-21](../server/game/cards/02_SHD/units/PunishingOne.ts)
reads `event.card.isInPlay()`, `isUpgraded()`, `controller` live: `true` on pass 1, different on
pass 2. It works today only because pass 1 happens to fire first.

This is a strong argument for resolving characteristic reads to the **event moment** regardless of
slot — it makes `when` deterministic across both passes. Note it would also *change* these two
cards' behavior from "accidentally correct" to "correct by construction".

**Action:** verify that making characteristic reads frozen does not cause `when` conditions that
currently fail on pass 1 to start succeeding (or vice versa). `test/scenarios/timingWindows/` is
the relevant coverage.

---

### SC-11 — Seven cards hand-roll the read-through fallback

The clearest evidence for the chosen design: multiple card implementations manually write
"use last-known if present, otherwise live", which is exactly what read-through handles do
automatically.

| File | Hand-rolled fallback |
|---|---|
| [CalculatedLethality.ts:22-25](../server/game/cards/02_SHD/events/CalculatedLethality.ts) | `target.isInPlay() ? target.upgrades.length : events[0].lastKnownInformation.upgrades.length` |
| [AsajjVentressIWorkAlone.ts:26,58](../server/game/cards/04_JTL/leaders/AsajjVentressIWorkAlone.ts) | `lastKnownInformation?.arena ?? ifYouDoContext.target.zoneName` |
| [QuiGonJinStudentOfTheLivingForce.ts:82](../server/game/cards/05_LOF/leaders/QuiGonJinStudentOfTheLivingForce.ts) | `?.lastKnownInformation?.cost ?? ifYouDoContext.target.cost` |
| [PurrgilUltra.ts:31](../server/game/cards/08_ASH/units/PurrgilUltra.ts) | `?.lastKnownInformation?.cost ?? ifYouDoContext.target.cost` |
| [LightspeedAssault.ts:39](../server/game/cards/04_JTL/events/LightspeedAssault.ts) | `lastKnownInformation?.power \|\| events[1].card.getPower()` |
| [ThirdSisterCycleOfVengeance.ts:25,36](../server/game/cards/09_HMW/units/ThirdSisterCycleOfVengeance.ts) | `lastKnownInformation?.controller ?? step1Context.target.controller` |
| [AlwaysABiggerFish.ts:26](../server/game/cards/09_HMW/events/AlwaysABiggerFish.ts) | `?.lastKnownInformation?.cost ?? 0` |

**Action:** all seven should collapse to a plain property read during migration. They are good
first migration candidates and good regression tests — the behavior must not change.

---

### SC-12 — Inventory: where card implementations read *current location*

Measured across `server/game/cards/**` (patterns: `.zoneName`, `.zone`, `.isInPlay()`).

**144 total location reads.** By subject:

| Subject | Count | Affected by freezing? |
|---|---:|---|
| Engine-supplied candidates (`cardCondition`, `matchTarget`, `attackerCondition`, `zoneFilter`, `arena:`) | ~62 | **No** — the `card` param comes from a live zone query by construction |
| `context.source` | ~30 | Only when the source itself departed |
| `target` / `events` after an effect | ~38 | Yes, when the target departed |
| `event.card` / watcher entry | ~10 | Yes |

Filtering to reads where the subject can actually be a departed card with a footprint yields
**two recognizable idioms, ~16 sites total**:

**Idiom 1 — "did it land where I expect?" (8 sites)**

| Site | Read |
|---|---|
| [Bothan5NewRepublicPrisonShip.ts:29](../server/game/cards/08_ASH/units/Bothan5NewRepublicPrisonShip.ts) | `context.event.card.zone === context.player.discardZone` |
| [DisplayPiece.ts:24](../server/game/cards/07_LAW/events/DisplayPiece.ts) | `ifYouDoContext.target.zoneName === ZoneName.Discard` |
| [OldDakaOldestAndWisest.ts:33](../server/game/cards/05_LOF/units/OldDakaOldestAndWisest.ts) | `getTarget(thenContext)?.zone === context.player.discardZone` |
| [OneMustDestroyToCreate.ts:29](../server/game/cards/08_ASH/events/OneMustDestroyToCreate.ts) | `getTarget(thenContext)?.zone === context.player.discardZone` |
| [AFineAddition.ts:41](../server/game/cards/03_TWI/events/AFineAddition.ts) | `context.target.zoneName === ZoneName.Discard` |
| [BogaLoyalVaractyl.ts:34](../server/game/cards/09_HMW/units/BogaLoyalVaractyl.ts) | `card === context.target && card.zoneName === ZoneName.Discard` |
| [GideonsLightCruiserDarkTroopersStation.ts:26](../server/game/cards/02_SHD/units/GideonsLightCruiserDarkTroopersStation.ts) | `context.target.zoneName === ZoneName.Hand ? ... : ...` |
| [APrecariousPredicament.ts:41](../server/game/cards/05_LOF/events/APrecariousPredicament.ts) | `context.target?.zoneName === ZoneName.Resource ? ... : ...` |

Shape: *"defeat/move X, then confirm it actually ended up in zone Z, then act on it there."*

**These are mostly NOT location reads — they are fizzle hacks.** The rule being enforced is that an
effect targeting a card in the discard must not resolve if the card moved between the trigger and
the effect's resolution. Re-classified:

| Site | Kind |
|---|---|
| `Bothan5NewRepublicPrisonShip.ts:29` | Fizzle hack |
| `DisplayPiece.ts:24` | Fizzle hack |
| `OldDakaOldestAndWisest.ts:33` | Fizzle hack |
| `OneMustDestroyToCreate.ts:29` | Fizzle hack |
| `BogaLoyalVaractyl.ts:34` | Fizzle hack, **phase-scoped variant** — the predicate lives inside a cost adjuster that persists for the phase, so it is re-evaluated repeatedly and outlives the LKI flush boundary |
| `AFineAddition.ts:41` | **Play-origin branching** — `PlayFromOutOfPlay` vs `PlayFromHand` |
| `GideonsLightCruiserDarkTroopersStation.ts:26` | **Play-origin branching** |
| `APrecariousPredicament.ts:41` | **Play-origin branching** |

The three play-origin sites involve targets that **never left play**, so no footprint exists and
read-through gives live values. **Zero impact.**

The five fizzle hacks decompose into (1) reference validity — free from copy-id comparison under
D-5 — and (2) the ability's own zone requirement, which is a framework concern.

**These checks are load-bearing today, not redundant.**
[CaptureSystem.canAffectInternal](../server/game/gameSystems/CaptureSystem.ts) with
`fromOutOfPlay: true` only checks `card.isUnit()`; it does not verify the card is still in the
discard. Removing `Bothan5`'s condition without a replacement would let the capture succeed on a
card that had since moved to hand.

**Idiom 2 — "did it survive?" (13 sites, but ~5 collapse)**

`isInPlay()` guards on `context.source` / `target` / `events[n].card`:
`PerilousPosition.ts:17`, `KillSwitch.ts:17`, `UnrefusableOffer.ts:34`, `Shield.ts:40`,
`SneakAttack.ts:31`, `PoeDameronOneHellOfAPilot.ts:24`, `ReySkywalker.ts:24`,
`MillenniumFalconLandosPride.ts:26`, `MaceWinduVaapadFormMaster.ts:26`, plus the SC-11 group.

**Important:** ~5 of these exist *only* to choose between a live read and an LKI read — they are the
SC-11 hand-rolled fallbacks (`CalculatedLethality.ts:23`, `TheGreatProgenitorFirstOfTheDrengir.ts:44`,
`MonMothmaClingingToHope.ts:38`, `LattsRazziDeadlyWhipmaster.ts:34`). Under read-through these
guards **disappear entirely** along with the branch. Only genuine "did it survive" guards remain.

**Note:** the current code already distinguishes these two concepts ad hoc — `ILastKnownInformation`
carries `arena` (the zone it was in, frozen) as a field *separate* from a live `card.zoneName` read.
The redesign formalizes a split the codebase already makes informally.

---

### SC-13 — Multiple footprints for the same card within one action

A single action's trigger cascade can produce **several footprints for the same physical card**,
and each triggered ability must resolve against the correct one.

**Illustrative scenario** (hypothetical card "The Pointless Cycle": *when a friendly unit is
defeated, deal damage to the opponent's base equal to that unit's power, then play that unit from
your discard and defeat it — once per turn*). Three copies P1/P2/P3 in play; a Wampa (4/5) carries
a +1/+1 upgrade, so it is 5/6.

| Step | Effect |
|---|---|
| Wampa **copy 1** (instance *N*, power 5) is defeated | Trigger window opens with P1, P2, P3 all bound to the copy-1 defeat event |
| P1 resolves | Deals **5** — copy 1's footprint |
| P1 plays Wampa → **copy 2** (instance *N+1*, power **4** — the upgrade is gone), then defeats it | Re-triggers P2 and P3 in a **sub-window**, bound to the copy-2 event |
| Player passes P2 in the sub-window | P2's copy-1 trigger remains pending in the parent window |
| P3 resolves in the sub-window | Deals **4** — copy 2's footprint |
| P3 plays **copy 3** (instance *N+2*) and defeats it | Re-triggers P2 in a third sub-window; player passes again |
| Sub-windows close; P2 resolves in the **original** window | Deals **5** — copy 1's footprint. P3's parent-window entry fizzles (limit spent) |

**Rules basis.** SWU 8.5.4 makes each replay a new copy; the upgrade does not return, so copy 2 is
genuinely weaker. SWU 8.11.1 defines LKI as a snapshot "immediately before it left play" — i.e.
bound to a *specific* leave-play event, not to the card.

**The good news:** `(card, instance)` already distinguishes the three copies, because entering play
increments the counter. The D-8 key is sufficient; no new identity concept is needed. Nor can the
key collide — leaving play twice requires entering play in between, which increments.

**Three invariants this imposes:**

1. **Footprints are keyed by instance and coexist.** The registry must be
   `Map<(card, instance), Footprint>`, never `Map<Card, Footprint>`. Copy 1's footprint must
   survive while copies 2 and 3 are minted.
2. **Handles are bound at event time and never lazily re-resolved.** If `event.card` resolved to
   "whatever instance the card is now", P2's copy-1 trigger would read copy 3's footprint and deal
   the wrong damage. The handle must be captured once and frozen onto the event.
3. **Flush at the action boundary, not per ability resolution.** The whole cascade above is one
   action. Flushing after P1's resolution would destroy copy 1's footprint before P2 resolves
   against it.

**Note this is a regression risk, not a new problem.** Today `event.lastKnownInformation` is a
per-event struct, so the scenario already works for captured fields. Centralizing into a registry
is what could break it.

**Ordering is already favourable.** Footprints mint at `preResolutionEffects`, which runs before
`resolveEvents` emits triggers — so a footprint always exists by the time a trigger binds to its
event.

---

### SC-14 — Handle binding time differs for enter-play events

The engine emits trigger events and watcher events at **different points** relative to the handler:

- Triggered abilities: `emitEvents()` at the top of
  [resolveEvents](../server/game/core/event/EventWindow.ts) — **before** any handler runs
- State watchers: `game.on(eventName, ...)` in
  [StateWatcher.ts:148](../server/game/core/stateWatcher/StateWatcher.ts), which fires from
  `this.game.emit(event.name, event)` — **after** `executeHandler()`

For **leave-play** events this is harmless: leaving play does not increment the instance, so
pre- and post-handler observations agree. The footprint captures the state difference, not an
identity difference.

For **enter-play** events it matters. A card played from the discard is instance *N* before the
handler and *N+1* after. So "which instance is `event.card`?" depends on binding time.

**Concrete case.** [OldDakaOldestAndWisest.ts](../server/game/cards/05_LOF/units/OldDakaOldestAndWisest.ts)
— *"defeat a friendly Night unit… then you may play that unit from your discard pile for free"*:

```ts
private getTarget?(context): Card {
    return context.events.find((event) => event.name === EventName.OnCardDefeated)?.card;
}
```

The handle from the defeat event is instance *N*, still valid in the discard, so dereference
succeeds and the card is played — becoming *N+1*. Old Daka never refers to it afterwards, so it is
unaffected. But an ability that continues *"…then defeat it"* (as in SC-13) would find its original
handle stale, and must instead read the **play** event's handle.

**Proposed rule.** An event's handle is bound once, at the point where its subject is well defined:

| Event category | Bind at | Instance |
|---|---|---|
| Card leaves play | footprint mint (`preResolutionEffects`) | the departing instance |
| Card enters play | after the handler | the newly created instance |
| Everything else | any point — instance does not change | current |

Chained effects should therefore read the event that matches the instance they mean, which is the
`context.events` mechanism Old Daka already uses. This is the kind of detail D-6 anticipated would
be hidden inside `GameSystem` machinery, and it belongs in the D-7 systems audit.

---

### SC-15 — How a handle becomes orphaned (case ④)

Case ④ is "instance mismatch **and** no footprint". It arises from an asymmetry:

- Footprints are minted when a card **leaves play**
- Instance advances when a card **enters play**, or **enters a hidden zone** (Hand / Resource / Deck)

These are *different events*. Wherever an instance advances without a corresponding mint, a handle
to the old instance is orphaned.

**Path 1 — arena → hand (NOT orphaning).** Worth stating because it looks like it should orphan.
[PurrgilUltra](../server/game/cards/08_ASH/units/PurrgilUltra.ts) returns a unit to hand and then
reads `?.lastKnownInformation?.cost ?? ifYouDoContext.target.cost`. Returning to hand is *both* a
leave-play (mint) and a hidden-zone entry (increment), so footprint[N] exists alongside live
instance N+1. That is **case ③**, and reads succeed. This is the ordinary LKI path.

**Path 2 — visible non-play zone → hidden zone.** Discard or Capture → Hand / Deck / Resource.
Not a leave-play, so no mint, but the instance still increments. A handle obtained while the card
sat in the discard is orphaned once it moves to hand.

**Path 3 — hand → play.** Entering play increments the instance, and nothing was minted because the
card never left play. A handle to the in-hand instance is orphaned the moment the card is played.

**Path 4 — surviving the flush (the important one).** Footprints flush at the action boundary
(SC-13/I3), but some handles outlive that:

- **State watchers are phase-scoped.** A unit defeated in action 1 produces a handle plus
  footprint[N]; the action ends and footprints flush; in action 2 the unit is played from the
  discard, advancing to N+1. Any later query against that watcher entry is case ④.
- [BogaLoyalVaractyl](../server/game/cards/09_HMW/units/BogaLoyalVaractyl.ts) re-evaluates a
  predicate inside a phase-long cost adjuster (SC-12).

**Why watchers do not hit this today:** they store their own *extracted copy* of the LKI data in
tracked state (`IStateWatcherLKIEntry`), not a reference to the event's LKI. Per D-16 this is
architecturally correct — a holder that outlives the registry's retention window must materialize a
value rather than hold a name.

**The root cause is a false premise in the middle branch of `read()`:**

```ts
if (fp) return fp[field];                                    // departed → frozen
if (ref.instance === ref.card.instanceNumber) return ref.card[field];  // ← assumes "no footprint = never departed"
throw ...
```

After a flush that assumption is false. A card that left play in a previous action has no footprint
but an *unchanged* instance, so the registry wrongly concludes it is current and reads live. Note
this does **not** require an instance mismatch, so it is more common than case ④ — it needs only
the action boundary to pass.

Two failure modes, by field:

| Field kind | Live read on a departed card | Symptom |
|---|---|---|
| Zone-gated — `power`, `upgrades`, `damage` | `assertPropertyEnabledForZone(null)`; `setUpgradesEnabled(false)` nulls `_upgrades` on leaving the arena, and `getStatModifiers()` reads `this.upgrades` | **Throws** |
| Not gated — `traits`, `type`, `title`, `controller` | Returns post-teardown values | **Silently wrong** |

The silent case is the dangerous one, and it is exactly what
[MoffGideonIndomitableWarlord](../server/game/cards/08_ASH/leaders/MoffGideonIndomitableWarlord.ts),
[JynErsoTimeToFight](../server/game/cards/07_LAW/leaders/JynErsoTimeToFight.ts) and
[CaptainPellaeonPlottingFromTheShadows](../server/game/cards/08_ASH/units/CaptainPellaeonPlottingFromTheShadows.ts)
read (`traits`, `type`). The throwing case is real too:
[RavagerFinalImperialCommand.playedUnitPower](../server/game/cards/08_ASH/units/RavagerFinalImperialCommand.ts)
reads `.power` from a left-play entry.

**Constraint on D-14.** Throwing on case ④ is only safe if long-lived holders do not routinely
orphan. Concretely:

- Watchers must keep storing durable extracted values (D-16), not bare handles
- The same applies to anything persisting beyond an action — phase-long cost adjusters, delayed
  effects, "for this phase" ongoing effects
- **Tombstones** (retaining the instance key after discarding footprint data) would make the middle
  branch sound: "no footprint *and* no tombstone" then genuinely means "never departed", so a stale
  read throws rather than silently reading live

---

### SC-16 — Regression test to add: multi-footprint trigger cascade

**Add a test reproducing SC-13** before migrating to the registry.

The scenario passes today because `event.lastKnownInformation` is a per-event struct, so it is a
genuine before/after check on the centralization. It exercises all three invariants at once:
instance-keyed footprints (I1), event-time handle binding (I2), and action-boundary flush (I3).

Shape:

- A unit with a stat-modifying upgrade, so its first incarnation differs measurably from later ones
- A triggered ability that (a) reads a characteristic of the defeated unit via LKI, and (b) replays
  and re-defeats it, re-triggering peers into a sub-window
- Multiple copies of that ability, with once-per-turn limits, so some triggers resolve in
  sub-windows and at least one resolves later in the *parent* window
- Assert the parent-window resolution uses the **first** incarnation's value, not the latest

`test/scenarios/timingWindows/` is the natural home, alongside `DefeatTiming.spec.ts`.

---

## Template for new entries

```markdown
### SC-n — Short title

**What.** One or two sentences.

**Where.** File references.

**Why it is a special case.** What the general design does not cover.

**Decision / action.** What we are doing for now, and what would make us revisit.
```
