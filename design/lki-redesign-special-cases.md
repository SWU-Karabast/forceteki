# LKI Redesign — Special Cases and Deferred Decisions

**Status:** living document. Added to incrementally as the design progresses.

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
| Q1a | No `pin()` / on-demand point-in-time capture for now. Scope is limited to "current state, or last known state if the card has left." | 2026-09-18 | Deferred — see D-1 |

---

## Deferred decisions

### D-1 — On-demand pinning (`pin()`) for true point-in-time capture

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

The counter is also incremented for two semantically distinct reasons
([InPlayCard.ts:420-440](../server/game/core/card/baseClasses/InPlayCard.ts)):

1. the card enters play (new copy per SWU 8.6.4)
2. the card moves into a hidden zone (information loss)

Callers currently work around the gating with expressions like
`card.isInPlay() ? card.inPlayId : card.mostRecentInPlayId`.

**Action:** the design needs one always-readable, never-throwing copy identity. Also decide whether
the two increment reasons should remain fused.

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

1. **Interning.** Must handles be canonical per card-copy so that `===` keeps working, or must all
   ~359 sites migrate to an explicit comparison?
2. **Copy-aware equality is a behavior change.** Today `===` compares *physical card* identity,
   ignoring copies. If handle equality is copy-aware, a card that left play and returned is no
   longer equal to its earlier self. Per SWU 8.6.4 that is arguably *more* correct — but it is a
   silent behavior change across 359 sites and needs to be deliberate, not incidental.

**Action:** decide interning and equality semantics before any migration begins. This is the
highest-risk silent-breakage surface identified so far.

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
A guard against the card having been replaced or redirected.

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

## Template for new entries

```markdown
### SC-n — Short title

**What.** One or two sentences.

**Where.** File references.

**Why it is a special case.** What the general design does not cover.

**Decision / action.** What we are doing for now, and what would make us revisit.
```
