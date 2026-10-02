# LKI Migration Register

Sites that must **not** be migrated mechanically by the phase-3 codemod. Each needs individual
review, and most need a behavior decision rather than a syntax change.

See [lki-redesign-decisions-and-insights.md](./lki-redesign-decisions-and-insights.md) §7 for the
migration plan, and [lki-redesign-special-cases.md](./lki-redesign-special-cases.md) for the
underlying analysis.

Status values: `pending` · `in-progress` · `done` · `deferred`.

---

## A. Behavior will change — needs per-case review

These hold an LKI-eligible reference while asking a live question. Under D-31 a properties object
answers about the moment it represents, so a footprint answers `isInPlay()` as `true` even though
the card is now in the discard. Each of these is a workaround for a separate triggering/rules
problem (an ability continuing to resolve after its source left play), tracked as future work.

| Site | Current use | Status |
|---|---|---|
| [PoeDameronOneHellOfAPilot.ts:24](../server/game/cards/04_JTL/units/PoeDameronOneHellOfAPilot.ts) | `thenCondition: context.source.isInPlay()` — "did Poe survive to be attached?" Canonical example. Existing spec covers the defeated case. | pending |
| [UnrefusableOffer.ts:34](../server/game/cards/02_SHD/upgrades/UnrefusableOffer.ts) | `ifYouDoCondition: context.source.isInPlay()` | pending |
| [ReySkywalker.ts:24](../server/game/cards/07_LAW/units/ReySkywalker.ts) | `context.source.isInPlay() && …` | pending |
| [MillenniumFalconLandosPride.ts:26](../server/game/cards/02_SHD/units/MillenniumFalconLandosPride.ts) | constant-ability `condition` reading `context.source.isInPlay()` | pending |
| [SneakAttack.ts:31](../server/game/cards/01_SOR/events/SneakAttack.ts) | `ifYouDoCondition: context.events[0].card.isInPlay()` | pending |
| [LuthenRaelDontYouWantToFightForReal.ts:23,44](../server/game/cards/06_SEC/leaders/LuthenRaelDontYouWantToFightForReal.ts) | `when` reading `event.card.isInPlay() && isAttacking()` | pending |
| [PunishingOne.ts:19](../server/game/cards/02_SHD/units/PunishingOne.ts) | `when` reading `event.card.isInPlay() && isUpgraded()` | pending |

**Baseline coverage:** all seven have existing specs. `PoeDameronOneHellOfAPilot.spec.ts:88`
covers the defeated case directly; `PunishingOne` and `LuthenRael` behavior is additionally pinned
by `test/scenarios/lki/LastKnownInformation.spec.ts`.

---

## B. Known bugs to fix as part of this work

| Site | Issue | Status |
|---|---|---|
| [DengarTakeYourShot.ts:42](../server/game/cards/07_LAW/units/DengarTakeYourShot.ts) | `event.lastKnownInformation.card.cost` hops through `.card` to the **live** object while the two reads above it use LKI. `cost` *is* captured on the struct, so this is inconsistent. The only such hop in the repo (SC-3). | pending |
| [UseWhenDefeatedSystem.ts:75](../server/game/gameSystems/UseWhenDefeatedSystem.ts) | `generateEvent(event.context, whenDefeatedSource, true)` passes a `Card` in the `additionalProperties` slot. Line 102 passes `{}` correctly. Harmless today because `this.properties` is assigned last and wins. | pending |
| [IStateWatcherLKIEntry](../server/game/core/stateWatcher/StateWatcher.ts) | `upgrades` is stored as `GameObjectId<IUpgradeCard>[]` with **no identity component**, so rehydration yields whatever identity the upgrade is at now rather than the captured one. `CardLeftPlayEntry` gets this right by storing `card` and `inPlayId` separately (D-23). | pending |
| [CardsDefeatedThisPhaseWatcher.ts:134](../server/game/stateWatchers/CardsDefeatedThisPhaseWatcher.ts), [CardsLeftPlayThisPhaseWatcher.ts:112](../server/game/stateWatchers/CardsLeftPlayThisPhaseWatcher.ts) | Store the event's `traits` `Set` **instance** directly into tracked state, so multiple readers share a mutable collection (D-17). | pending |

### B.2 Event-relative reads still using the transitional live-`Card` overload

`getLastKnownProperties(Card)` resolves through `getIdentity(card)`, which uses the card's **current**
`identityId`. That is wrong whenever the card has moved on since the event — not only the
leaves-play-twice case, but also a single visible → hidden move, which increments the counter (R4).
The event-bound `event.cardRef` is always correct and should be used instead.

Fixed in phase 1 where a bound reference already exists: `HelgaitDookuWasAVisionary`,
`TargetedForRemoval`, `HK47ExclamationDieMeatbag`.

| Site | Why it is still on the overload | Status |
|---|---|---|
| [CalculatedLethality.ts:45](../server/game/cards/02_SHD/events/CalculatedLethality.ts) | Reads `thenContext.target`, a `Card` handed to a helper. Needs the resolved defeat event's `cardRef`. Low risk today — the read happens in the `then` immediately after the defeat, so nothing can move the card in between. | pending |
| [AsajjVentressIWorkAlone.ts:29,61](../server/game/cards/04_JTL/leaders/AsajjVentressIWorkAlone.ts) | Same shape via `ifYouDoContext.target`, twice. Same reasoning and same low risk. | pending |
| [RavagerFinalImperialCommand.ts:42,48](../server/game/cards/08_ASH/units/RavagerFinalImperialCommand.ts) | Triggers on `onCardPlayed`, which does **not** bind `cardRef` — only events that capture last known information do. Blocked until phase 2 generalizes the binding to every card event. | pending |

### B.1 Copy-identity gaps on the targeting path (SC-18, SC-20)

All of these hold a card reference across a gap and act on it later **without revalidating that it
is still the same copy**. By `SWU 8.5.4` a unit that left play and returned is a different unit and
the effect should fizzle. One generic identity check in `checkEventCondition` (D-6, D-7) resolves the
whole table, so these are deliberately **not** being fixed individually — they are listed so the
phase-2 change can be verified against a known set.

| Site | Gap | Status |
|---|---|---|
| `server/game/gameSystems/` (all) | **Zero** occurrences of `inPlayId` anywhere in the directory. Delayed and multi-step systems re-derive legality from `hasLegalTarget`, which is zone-based, so a replayed copy passes. This is the root cause for every row below. | pending |
| [Attack.ts:170](../server/game/core/attack/Attack.ts) | The **only** correct implementation in the engine: captures `attackerInPlayId` and a `targetInPlayMap`, then re-checks before applying damage. Not a bug — the reference implementation. **Delete once the generic check lands**, so there is one mechanism rather than two. | pending |
| [Commandeer.ts](../server/game/cards/04_JTL/events/Commandeer.ts) | Passes its target to `delayedCardEffect`; the engine's `matchTarget` resolves it at regroup. If the unit leaves and returns first, the wrong copy is returned to hand. Has an existing spec to extend. | pending |
| [MaulMasterOfTheShadowCollective.ts:39](../server/game/cards/07_LAW/units/MaulMasterOfTheShadowCollective.ts) | Captures `selectCardContext.target` in a closure and hands it back as the delayed effect's `target` when Maul leaves play. No spec. | pending |
| [DjBlatantThief.ts:22](../server/game/cards/02_SHD/units/DjBlatantThief.ts) | Same closure-capture shape for a resource. **Migrate by hand** — the inline comment shows it deliberately wants *live* `exhausted` state at fire time, so a blanket rewrite to recorded reads would break it. | pending |

---

## C. Type corrections

| Site | Change | Status |
|---|---|---|
| [TargetedCostAdjuster.ts:33,398](../server/game/core/cost/TargetedCostAdjuster.ts) | `selectedTargets?: IUnitCard[]` actually holds LKI structs and is read back as `ILastKnownInformation[]` by `CostHelpers.getExploitedUnits`. Becomes `IUnitPropertiesRecorded[]`. The existing code already holds **captured values**, which satisfies requirement 11 — only the declared type is wrong (R11). | pending |

---

## D. Code to delete

| Site | Reason | Status |
|---|---|---|
| [DamageSystem.ts:317-322](../server/game/gameSystems/DamageSystem.ts) | Attaches LKI to every non-base damage event. Sole consumer is [LetsCallItWar.ts:38-39](../server/game/cards/06_SEC/events/LetsCallItWar.ts), which reads only `arena` — correct from either the defeat footprint or a live accessor, so the producer is redundant (R11). | pending |
| [LastKnownInformation.ts:114](../server/game/core/event/LastKnownInformation.ts) | `event.defendersLastKnownInformation` is built but consumed nowhere. | pending |
| `CardTargetSystem.generateEvent`'s `addLastKnownInformation` flag | Exactly two call sites, both in `UseWhenDefeatedSystem` (lines 75, 102). Disappears under D-22's universal minting (SC-1). | pending |
| [`addLastKnownInformationToEvent`](../server/game/core/event/LastKnownInformation.ts) | The **non-recording** variant, split out in phase 1 to stop damage events writing records. Its only caller is `DamageSystem`'s attachment above, so it dies with it — leaving `addDepartureRecordToEvent` as the single helper. | pending |
| [`addAttackLastKnownInformationToEvent`](../server/game/core/event/LastKnownInformation.ts) | `defendersLastKnownInformation` has no consumers at all. `attackerLastKnownInformation` has three — [WhistlingBirds](../server/game/cards/08_ASH/upgrades/WhistlingBirds.ts), [KachirhoMilitia](../server/game/cards/08_ASH/units/KachirhoMilitia.ts), [KraganGorrWarbirdCaptain](../server/game/cards/02_SHD/units/KraganGorrWarbirdCaptain.ts) — all reading only `arena` or `controller`, which the registry serves from the attacker's bound reference. | pending |
| `bindCardRef` | Absorbed into event construction when phase 2 binds a reference on every card event, rather than being called per-system. | pending |

### D.1 The two-helper split is temporary

Phase 1 had to split `addLastKnownInformationToEvent` because the legacy struct is attached to events
the card **survives** (damage), while a registry record means "this identity is gone". Those two
jobs cannot share a function.

The split does not have to survive the migration, and it collapses the right way round — by deleting
the non-recording side, not by merging the two back together:

| Helper | Today | After migration |
|---|---|---|
| `buildLastKnownInformation` | builds the legacy struct | deleted with `ILastKnownInformation` |
| `addLastKnownInformationToEvent` | legacy struct + ref, no record | **deleted** — its only caller goes (§D above) |
| `addAttackLastKnownInformationToEvent` | attacker/defender structs | deleted; the three consumers read the registry |
| `bindCardRef` | called per-system | absorbed into universal event construction (phase 2) |
| `addDepartureRecordToEvent` | legacy struct + ref + record | **the single survivor**, reduced to just recording |

The end state is one helper whose name states the only thing it does. That is also safer than what
exists today: calling the sole remaining helper for an event the card survives is an obvious misuse,
whereas today the general-sounding `addLastKnownInformationToEvent` was the one that silently wrote
records for surviving units.

---

### D.2 Flush boundary is incomplete, and deliberately deferred to phase 2

Phase 1 flushes records between actions (`ActionPhase.queueNextAction`) and at every phase start
(`Phase.startPhase`). Two windows remain uncovered:

- records created by end-of-phase triggers survive through `OnPhaseEnded`
- records created during regroup persist for the rest of regroup

The symptom of over-retention is a card that departed to a **visible** zone — where identity is
preserved and `identityId` does not increment — continuing to report its pre-departure arena state
instead of live discard state.

**Deferring this cannot affect any card migrated in phase 1.** All seven read within the same action
as the event that created the record:

| Card | Read point |
|---|---|
| `HelgaitDookuWasAVisionary` | its own When Defeated, same window as the defeat |
| `TargetedForRemoval` | When Defeated on the attached unit, same window |
| `HK47ExclamationDieMeatbag` | `onCardDefeated` trigger, same window |
| `CalculatedLethality` | `then`, immediately after its own defeat effect |
| `AsajjVentressIWorkAlone` | `ifYouDo`, immediately after its own damage effect |
| `RavagerFinalImperialCommand` | `onCardPlayed` trigger, same action as the play |
| `MonMothmaClingingToHope` | no property reads at all — only `getIdentity` identity, served by the intern map, which is never flushed |

Confirmed empirically: with **both** flush sites disabled, the full suite reports only 2 failures,
and both are the lifecycle tests that assert flushing happens. No migrated-card spec, and no card
spec anywhere, is sensitive to flush timing — non-migrated cards read `event.lastKnownInformation`,
which is per-event and unaffected.

The converse also holds: the phase-1 flush points cannot fire *too early* for these cards, because a
phase boundary never falls inside an action.

---

## E. Engine simplifications expected to fall out

Not migration hazards — these should get *simpler*, and are listed so the reduction is verified
rather than assumed.

| Site | Expected outcome |
|---|---|
| [TriggeredAbility.ts:184-185](../server/game/core/ability/TriggeredAbility.ts) | The `if (context.event.card === context.source && context.event.lastKnownInformation)` special case dissolves: reading `controller` through the properties object returns the footprint value automatically. Note this is a high-traffic engine-side ref-vs-`Card` comparison (D-8 constraint 3). |
| [UseWhenDefeatedSystem.ts:67-75](../server/game/gameSystems/UseWhenDefeatedSystem.ts) | The manual event regeneration for an in-play source becomes unnecessary — no footprint exists for an in-play card, so the getter returns a live accessor that reads current stats by construction. Pinned by `LastKnownInformation.spec.ts`. |
| [Attack.ts:17,44,49](../server/game/core/attack/Attack.ts) | `targetInPlayMap` and `attackerInPlayId` are a hand-rolled `(card, identity)` handle; they become redundant once references are interned (D-11). |
| The 7 SC-11 hand-rolled live/frozen fallbacks | Collapse to a plain property read. |
| The 75 hand-rolled `(card, inPlayId)` comparisons | Collapse to a single `===`. |
| The 6 hand-rolled zone-gated accessor ternaries | Identity becomes readable without throwing. |

---

## F. Known-broken cases the refactor should fix

| Site | Issue | Status |
|---|---|---|
| [LattsRazziDeadlyWhipmaster.spec.ts:148](../test/server/cards/07_LAW/units/LattsRazziDeadlyWhipmaster.spec.ts) | `xit('should read LKI from deck to deal damage from part of her ability')` — a **disabled** test documenting a case today's LKI mechanism cannot serve. The card reads `mostRecentCopy.lastKnownInformation.power` from the `cardsLeftPlayThisPhase` watcher. Re-enable and verify once the registry lands. | pending |

---

### G.1 Departures that capture no last known information — D-22's scope, measured

Phase 1 replicates today's LKI capture points exactly, and those points do **not** cover every
departure. Measured by temporarily asserting, at the leave-play branch of
[InPlayCard.initializeForCurrentZone](../server/game/core/card/baseClasses/InPlayCard.ts), that a
record exists for the departing identity:

| Transition | Failing specs |
|---|---|
| `groundArena -> hand` | 11 |
| `spaceArena -> hand` | 6 |
| `groundArena -> deck` | 5 |
| `groundArena -> discard` | 2 |
| `spaceArena -> discard` | 2 |
| `spaceArena -> deck` | 1 |
| **Total** | **27 of 8,506** |

Two groups, with different causes:

- **Arena → hand / deck (23).** `MoveCardSystem` only records when
  `EnumHelpers.zoneMoveLosesCardInformation` is true, which covers *visible → hidden* (discard or
  capture into hand or deck). A unit bounced straight out of the arena is a departure but not a
  visible → hidden move, so it falls between the two conditions.
- **Arena → discard (4).** Defeats reaching the discard without going through `DefeatCardSystem`.
  Worth identifying individually — these are the ones most likely to be a real bug rather than a
  coverage gap. Observed on `cartel-spacer`, `fallen-lightsaber`,
  `millennium-falcon#piece-of-junk`.

**Do not enable the assertion until D-22 lands.** It is a deliberate behavior change with its own
tests, and phase 1's rule is that engine changes stay behavior-preserving.
[LkiRegistry.hasRecordFor](../server/game/core/lki/LkiRegistry.ts) exists as the hook for it.

---

## G. Legality gaps to close before card implementations rely on fizzling

Found by the D-7 systems audit. Card-side checks are currently doing the framework's job.

| Site | Gap | Status |
|---|---|---|
| `GameSystem.canAffectInternal` | Base implementation is only `return this.isTargetTypeValid(target)`, so any system that does not override it accepts a target in **any zone**. | pending |
| [CaptureSystem.ts:33-39](../server/game/gameSystems/CaptureSystem.ts) | With `fromOutOfPlay: true` it checks only `card.isUnitCard()`, never that the card is still in the discard. This is why [Bothan5NewRepublicPrisonShip.ts:29](../server/game/cards/08_ASH/units/Bothan5NewRepublicPrisonShip.ts)'s hand-written zone check is load-bearing. | pending |
| Extra card-valued properties | `captor`, `upgrade`, `parentCard`, `attacker`, `leaderPilotCard` are validated inconsistently. These cannot be cleaned up by `properties.target.filter(Boolean)` — a stale one must make the whole system fizzle via `canAffectInternal`. | pending |
| [CardTargetSystem.ts:146-148](../server/game/core/gameSystem/CardTargetSystem.ts) | `generateEvent` does not degrade to "no target": after `filter(Boolean)` the `Contract.assertTrue(target.length === 1, …)` **throws**. | pending |

---

## H. Baseline

Established in phase 0, before any production change:

| | |
|---|---|
| Full suite | **8,500 specs, 0 failures**, 9 pre-existing `xit`/`xdescribe` pending |
| LKI characterization | `test/scenarios/lki/LastKnownInformation.spec.ts` — 5 specs, passing under both normal and undo modes |
| Rollback coverage | `undoIt` (used by `npm run test-undo`) runs every assertion, rolls back to the start-of-test snapshot, then **runs it again**. The LKI spec therefore doubles as the D-29 regression guard: a footprint leaking across a rollback would make the second run disagree with the first. No bespoke rollback test is needed. |

**Environment note:** `scripts/build-test.js` never cleans `build/`, so compiled output for deleted
spec files lingers and jasmine keeps loading it. Seven orphaned specs from removed "TwinSuns" work
were breaking every run at module-load time. If a run fails inside a spec that no longer exists in
source, delete the stale `build/test/**` artifact.
