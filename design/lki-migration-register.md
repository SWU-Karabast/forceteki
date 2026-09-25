# LKI Migration Register

Sites that must **not** be migrated mechanically by the phase-2 codemod. Each needs individual
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
| [IStateWatcherLKIEntry](../server/game/core/stateWatcher/StateWatcher.ts) | `upgrades` is stored as `GameObjectId<IUpgradeCard>[]` with **no instance component**, so rehydration yields whatever instance the upgrade is at now rather than the captured one. `CardLeftPlayEntry` gets this right by storing `card` and `inPlayId` separately (D-23). | pending |
| [CardsDefeatedThisPhaseWatcher.ts:134](../server/game/stateWatchers/CardsDefeatedThisPhaseWatcher.ts), [CardsLeftPlayThisPhaseWatcher.ts:112](../server/game/stateWatchers/CardsLeftPlayThisPhaseWatcher.ts) | Store the event's `traits` `Set` **instance** directly into tracked state, so multiple readers share a mutable collection (D-17). | pending |

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

---

## E. Engine simplifications expected to fall out

Not migration hazards — these should get *simpler*, and are listed so the reduction is verified
rather than assumed.

| Site | Expected outcome |
|---|---|
| [TriggeredAbility.ts:184-185](../server/game/core/ability/TriggeredAbility.ts) | The `if (context.event.card === context.source && context.event.lastKnownInformation)` special case dissolves: reading `controller` through the properties object returns the footprint value automatically. Note this is a high-traffic engine-side ref-vs-`Card` comparison (D-8 constraint 3). |
| [UseWhenDefeatedSystem.ts:67-75](../server/game/gameSystems/UseWhenDefeatedSystem.ts) | The manual event regeneration for an in-play source becomes unnecessary — no footprint exists for an in-play card, so the getter returns a live accessor that reads current stats by construction. Pinned by `LastKnownInformation.spec.ts`. |
| [Attack.ts:17,44,49](../server/game/core/attack/Attack.ts) | `targetInPlayMap` and `attackerInPlayId` are a hand-rolled `(card, instance)` handle; they become redundant once references are interned (D-11). |
| The 7 SC-11 hand-rolled live/frozen fallbacks | Collapse to a plain property read. |
| The 75 hand-rolled `(card, inPlayId)` comparisons | Collapse to a single `===`. |
| The 6 hand-rolled zone-gated accessor ternaries | Identity becomes readable without throwing. |

---

## F. Known-broken cases the refactor should fix

| Site | Issue | Status |
|---|---|---|
| [LattsRazziDeadlyWhipmaster.spec.ts:148](../test/server/cards/07_LAW/units/LattsRazziDeadlyWhipmaster.spec.ts) | `xit('should read LKI from deck to deal damage from part of her ability')` — a **disabled** test documenting a case today's LKI mechanism cannot serve. The card reads `mostRecentCopy.lastKnownInformation.power` from the `cardsLeftPlayThisPhase` watcher. Re-enable and verify once the registry lands. | pending |

---

## G. Legality gaps to close before card implementations rely on fizzling

Found by the D-7 systems audit. Card-side checks are currently doing the framework's job.

| Site | Gap | Status |
|---|---|---|
| `GameSystem.canAffectInternal` | Base implementation is only `return this.isTargetTypeValid(target)`, so any system that does not override it accepts a target in **any zone**. | pending |
| [CaptureSystem.ts:33-39](../server/game/gameSystems/CaptureSystem.ts) | With `fromOutOfPlay: true` it checks only `card.isUnit()`, never that the card is still in the discard. This is why [Bothan5NewRepublicPrisonShip.ts:29](../server/game/cards/08_ASH/units/Bothan5NewRepublicPrisonShip.ts)'s hand-written zone check is load-bearing. | pending |
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
