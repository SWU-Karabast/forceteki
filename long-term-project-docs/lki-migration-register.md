# LKI Migration Register

Sites that must **not** be migrated mechanically by the phase-3 codemod. Each needs individual
review, and most need a behavior decision rather than a syntax change.

See [lki-redesign-decisions-and-insights.md](./lki-redesign-decisions-and-insights.md) §7 for the
migration plan, and [lki-redesign-special-cases.md](./lki-redesign-special-cases.md) for the
underlying analysis.

Status values: `pending` · `in-progress` · `done` · `deferred`.

Every file and line anchor in this document was re-checked by content against `main` at `fa963ecc3`
on 2026-10-23, then adjusted for the two lines the opt-in flag adds to six card files (§I).

---

## A. Behavior will change — needs per-case review

These hold an LKI-eligible reference while asking a live question. Under D-31 a properties object
answers about the moment it represents, so a footprint answers `isInPlay()` as `true` even though
the card is now in the discard. Each of these is a workaround for a separate triggering/rules
problem (an ability continuing to resolve after its source left play), tracked as future work.

| Site | Current use | Status |
|---|---|---|
| [PoeDameronOneHellOfAPilot.ts:24](../server/game/cards/04_JTL/units/PoeDameronOneHellOfAPilot.ts) | `thenCondition: context.source.isInPlay()` — "did Poe survive to be attached?" Canonical example. Existing spec covers the defeated case. | pending |
| [UnrefusableOffer.ts:33](../server/game/cards/02_SHD/upgrades/UnrefusableOffer.ts) | `ifYouDoCondition: context.source.isInPlay()` | pending |
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

Done in phase 1, where a bound reference already exists: `HelgaitDookuWasAVisionary`,
`TargetedForRemoval` and `HK47ExclamationDieMeatbag` read `event.cardRef`. Each sets
`usesLkiRegistry = true` (D-35), as do the three below.

| Site | Why it is still on the overload | Status |
|---|---|---|
| [CalculatedLethality.ts:47](../server/game/cards/02_SHD/events/CalculatedLethality.ts) | Reads `thenContext.target`, a `Card` handed to a helper. Needs the resolved defeat event's `cardRef`. Low risk today — the read happens in the `then` immediately after the defeat, so nothing can move the card in between. | pending |
| [AsajjVentressIWorkAlone.ts:31,63](../server/game/cards/04_JTL/leaders/AsajjVentressIWorkAlone.ts) | Same shape via `ifYouDoContext.target`, twice. Same reasoning and same low risk. | pending |
| [RavagerFinalImperialCommand.ts:44,50](../server/game/cards/08_ASH/units/RavagerFinalImperialCommand.ts) | Triggers on `onCardPlayed`, which binds no `cardRef` — only events that record last known information do. The binding cannot simply be added where the event is created: `PlayUnitAction` builds the `PutIntoPlay` and `OnCardPlayed` events while the card is still in hand, and the `PutIntoPlay` handler then moves it into the arena, so an early binding names the identity from before the unit entered play. An earlier attempt to bind it at creation crashed the Ravager spec ("names an identity that no longer exists"). Phase 2 has to bind after the window's events resolve and before its triggers do (SC-14). | pending |

### B.1 Copy identity on the targeting path (SC-18, SC-20)

The question for each row: does an ability that holds a card across a gap act on it later without
checking that it is still the same copy? By `SWU 8.5.4` a unit that left play and returned is a
different unit, so the effect should not apply.

The first version of this table assumed every row was a bug that one generic identity check
(D-6, D-7) would fix. None of that had been reproduced. Measuring each row found one confirmed bug,
one case that is already correct and one that is guarded only against its crash, and the generic
check was not built (D-34).

| Site | Finding | Status |
|---|---|---|
| `server/game/gameSystems/` (all) | No identity check of any kind (`inPlayId`, `identityId`, `getIdentity`). That is not by itself a defect: a check on events would fizzle 23 follow-through events that are correct today (D-34, SC-21). No change planned. | done |
| [Attack.ts:171](../server/game/core/attack/Attack.ts) | The only identity guard in the engine: captures `attackerInPlayId` and a `targetInPlayMap`, then re-checks before applying damage. **It stays.** The plan was to delete it once a generic check landed, and that check is not being built. | done |
| [Commandeer.ts](../server/game/cards/04_JTL/events/Commandeer.ts) | **Correct today.** The engine removes a default-duration delayed effect when its target leaves play (`removeLastingEffects`, #689), so a unit bounced and replayed before regroup is not returned a second time. Pinned by the "leaves play and returns before the regroup phase" spec in [Commandeer.spec.ts](../test/server/cards/04_JTL/events/Commandeer.spec.ts). Mutation-checked: disabling the target-based removal fails it. | done |
| [MaulMasterOfTheShadowCollective.ts:39](../server/game/cards/07_LAW/units/MaulMasterOfTheShadowCollective.ts) | **Confirmed bug.** The "return control" effect is a `WhileSourceInPlay` delayed effect, and `removeLastingEffects` ([OngoingEffectEngine.ts:428](../server/game/core/ongoingEffect/OngoingEffectEngine.ts)) exempts those from the cleanup above. If the stolen unit is bounced and replayed and a different effect then takes control of the new copy, Maul leaving play acts on that new copy. Reproduced by a pending spec in [MaulMasterOfTheShadowCollective.spec.ts](../test/server/cards/07_LAW/units/MaulMasterOfTheShadowCollective.spec.ts) that asserts the correct behavior. **Pre-existing:** that spec fails identically on `20f9e3ebe`, the commit before the LKI merge (#2931) — the exemption itself dates to #689 (Feb 2025), and Maul's card and the `WhenSourceLeavesPlayDelayedEffectSystem` it uses arrived in #2237 (Feb 2026). **Candidate fix, not applied:** drop the exemption. In a trial run without it the spec passed and the full suite stayed green. DJ shares the exemption, so it needs a spec of its own first. | pending |
| [DjBlatantThief.ts:22](../server/game/cards/02_SHD/units/DjBlatantThief.ts) | Same exemption, with a closure-captured `target` for a resource. #2955 guards the crash case — the stolen card is no longer a resource — with an `isResource()` check, which is a zone check rather than an identity check. Whether a replacement copy that is a resource again slips through is **unverified**, and #689's commit message already says DJ "will probably need some additional tests". **Migrate by hand:** the inline comment shows it deliberately wants *live* `exhausted` state at fire time, so a blanket rewrite to recorded reads would break it. | pending |

The regression coverage that already exists for this family is
[MoveBetweenZones.spec.ts](../test/scenarios/ability/MoveBetweenZones.spec.ts): Unrefusable Offer with
Superlaser Technician, and Commandeer with Tobias and Chewbacca.

---

## C. Type corrections

| Site | Change | Status |
|---|---|---|
| [TargetedCostAdjuster.ts:51,507](../server/game/core/cost/TargetedCostAdjuster.ts) | `selectedTargets?: Card[]` actually holds LKI structs — line 507 pushes `targetEvent.lastKnownInformation ?? targetEvent.card` — and is read back as `ILastKnownInformation[]` by `CostHelpers.getExploitedUnits` ([CostHelpers.ts:64](../server/game/core/cost/CostHelpers.ts)). Becomes `IUnitProperties[]` (D-26 calls it `IUnitPropertiesRecorded`). The existing code already holds **captured values**, which satisfies requirement 11 — only the declared type is wrong (R11). The declared type was `IUnitCard[]` until `main` changed it to `Card[]`, which is no closer to correct. | pending |

---

## D. Code to delete

| Site | Reason | Status |
|---|---|---|
| [DamageSystem.ts:348-350](../server/game/gameSystems/DamageSystem.ts) | Attaches LKI to every non-base damage event. Sole consumer is [LetsCallItWar.ts:38-39](../server/game/cards/06_SEC/events/LetsCallItWar.ts), which reads only `arena` — correct from either the defeat footprint or a live accessor, so the producer is redundant (R11). | pending |
| [LastKnownInformation.ts:162](../server/game/core/event/LastKnownInformation.ts) | `event.defendersLastKnownInformation` is built but consumed nowhere. | pending |
| `CardTargetSystem.generateEvent`'s `addLastKnownInformation` flag | Exactly two call sites, both in `UseWhenDefeatedSystem` (lines 75, 102). It routes to `addLastKnownInformationNow`, the synchronous variant for synthetic events that never enter a window, which goes with it. Disappears under D-22's universal minting (SC-1). | pending |
| [`addLastKnownInformationToEvent`](../server/game/core/event/LastKnownInformation.ts) | The **non-recording** variant, split out in phase 1 to stop damage events writing records. Its only caller is `DamageSystem`'s attachment above, so it dies with it — leaving `addDepartureRecordToEvent` as the single helper. | pending |
| [`addAttackLastKnownInformationToEvent`](../server/game/core/event/LastKnownInformation.ts) | `defendersLastKnownInformation` has no consumers at all. `attackerLastKnownInformation` has three — [WhistlingBirds](../server/game/cards/08_ASH/upgrades/WhistlingBirds.ts), [KachirhoMilitia](../server/game/cards/08_ASH/units/KachirhoMilitia.ts), [KraganGorrWarbirdCaptain](../server/game/cards/02_SHD/units/KraganGorrWarbirdCaptain.ts) — all reading only `arena` or `controller`, which the registry serves from the attacker's bound reference. | pending |
| `GameEvent.setLastKnownInformation` | The only place `event.cardRef` is set, and it takes the reference together with the legacy struct. Phase 2 binds the reference where an event's `card` is assigned, so this setter stops binding it, and the method goes with the struct in phase 4. | pending |

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
| `addLastKnownInformationNow` | synchronous variant, for synthetic events | deleted with the `addLastKnownInformation` flag that is its only caller |
| `GameEvent.setLastKnownInformation` | the only place `event.cardRef` is set | stops binding the reference once phase 2 binds it where `card` is assigned; deleted with the struct |
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

**Plan.** Phase 2 adds flush points where no trigger can still be pending — the end of the action
phase, and after the phase-start and phase-end windows — each with a spec: a Grogu claim-attack
defeat, and a defeat at regroup start (plan §7, phase 2, item 4).

---

## E. Engine simplifications expected to fall out

Not migration hazards — these should get *simpler*, and are listed so the reduction is verified
rather than assumed.

| Site | Expected outcome |
|---|---|
| [TriggeredAbility.ts:205-206](../server/game/core/ability/TriggeredAbility.ts) | The `if (context.event.card === context.source && context.event.lastKnownInformation)` special case dissolves: reading `controller` through the properties object returns the footprint value automatically. Note this is a high-traffic engine-side ref-vs-`Card` comparison (D-8 constraint 3). |
| [UseWhenDefeatedSystem.ts:67-75](../server/game/gameSystems/UseWhenDefeatedSystem.ts) | The manual event regeneration for an in-play source becomes unnecessary — no footprint exists for an in-play card, so the getter returns a live accessor that reads current stats by construction. Pinned by `LastKnownInformation.spec.ts`. |
| [Attack.ts:17,45,50](../server/game/core/attack/Attack.ts) | `targetInPlayMap` and `attackerInPlayId` are a hand-rolled `(card, identity)` pair. The guard itself stays (§B.1), but it can hold `CardRef`s instead of pairs once references are interned (D-11). |
| The 7 SC-11 hand-rolled live/frozen fallbacks | Collapse to a plain property read. Two are done (`CalculatedLethality`, `AsajjVentressIWorkAlone`); five remain (SC-11). |
| The ~75 hand-rolled `(card, inPlayId)` comparisons | Collapse to a single `===`. 75 is the phase-0 count; 87 lines mention `inPlayId` today, which includes declarations, so it is not a like-for-like figure. Twelve card files hand-roll it, one line each. |
| The 6 hand-rolled zone-gated accessor ternaries | Identity becomes readable without throwing. Five remain (three state watchers and two in `LastKnownInformation.ts`); `MonMothmaClingingToHope` had the sixth and was migrated in phase 1. |

---

## F. Known-broken cases the refactor should fix

Pending specs that document a case today's mechanism cannot serve. Each is a phase-4 target, and none
passes today.

| Site | Issue | Status |
|---|---|---|
| [LattsRazziDeadlyWhipmaster.spec.ts:148](../test/server/cards/07_LAW/units/LattsRazziDeadlyWhipmaster.spec.ts) | `xit('should read LKI from deck to deal damage from part of her ability')` — a **disabled** test documenting a case today's LKI mechanism cannot serve. The card reads `mostRecentCopy.lastKnownInformation.power` from the `cardsLeftPlayThisPhase` watcher. Re-enable and verify once the registry lands. | pending |
| [Clone.spec.ts:2014](../test/server/cards/03_TWI/units/Clone.spec.ts) | `xit('is treated by Annihilator as having the name of the copied card (LKI)')` — an ability that defeats a Clone and then uses its name must see the name of the card it was copying, not "Clone" (ruling 2025-03-25). | pending |
| [ShadowCasterJustBusiness.spec.ts:247](../test/server/cards/04_JTL/units/ShadowCasterJustBusiness.spec.ts) | `xit('can double a "When Defeated" ability granted to the unit by Grim Valor (LKI)')` — the defeated unit keeps the ability that was granted to it (ruling 2025-04-30). | pending |

### F.1 Boundaries: where LKI deliberately does not apply

Last known information covers the *information* needed to resolve an ability. It does not decide
which abilities or characteristics are active. These pending specs mark that edge, so migrating the
cards around them must not start serving last known information here.

| Site | Rule | Status |
|---|---|---|
| [TargetingComputer.spec.ts:68](../test/server/cards/04_JTL/upgrades/TargetingComputer.spec.ts) | A granted ability is not active from the discard pile while a When Defeated ability resolves (rulings 2025-03-25 and 2025-04-30), so Targeting Computer does not let its controller assign that indirect damage. | pending |
| [Clone.spec.ts:2027](../test/server/cards/03_TWI/units/Clone.spec.ts) | A defeated Clone reverts completely (ruling 2024), so it is not eligible for effects based on traits it had only while it was a copy. | pending |

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
| **Total** | **27 of 9,633** |

Phase 0 measured 27 of 8,506. Re-measured on `main` at `fa963ecc3` (2026-10-23) with the same
assertion: still 27, with the same breakdown by transition.

Two groups. **Neither has been attributed to a code path.** An earlier version of this section
explained the first group by saying `MoveCardSystem` records only visible → hidden moves. That does
not hold: `MoveCardSystem` takes its leave-play branch for an arena → hand or deck move and records
it, so these departures reach the zone change some other way. The first step of D-22's work is to
attribute each of the 27 specs to the path that moved the card, and the counts above are the checklist.

- **Arena → hand / deck (23).**
- **Arena → discard (4).** Observed on `cartel-spacer`, `fallen-lightsaber` and
  `millennium-falcon#piece-of-junk`. Worth identifying individually.

**Do not enable the assertion until D-22 lands.** It is a deliberate behavior change with its own
tests, and phase 1's rule is that engine changes stay behavior-preserving.
[LkiRegistry.hasRecordFor](../server/game/core/lki/LkiRegistry.ts) exists as the hook for it.

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

## H. Phase-0 baseline

Established in phase 0, before any production change. The current figures are in §I.

| | |
|---|---|
| Full suite | **8,500 specs, 0 failures**, 9 pre-existing `xit`/`xdescribe` pending |
| LKI characterization | `test/scenarios/lki/LastKnownInformation.spec.ts` — 5 specs, passing under both normal and undo modes |
| Rollback coverage | `undoIt` (used by `npm run test-undo`) runs every assertion, rolls back to the start-of-test snapshot, then **runs it again**. The LKI spec therefore doubles as the D-29 regression guard: a footprint leaking across a rollback would make the second run disagree with the first. No bespoke rollback test is needed. |

**Environment note:** `scripts/build-test.js` never cleans `build/`, so compiled output for deleted
spec files lingers and jasmine keeps loading it. Seven orphaned specs from removed "TwinSuns" work
were breaking every run at module-load time. If a run fails inside a spec that no longer exists in
source, delete the stale `build/test/**` artifact.

---

## I. Verification log

Current figures. §H holds the phase-0 baseline.

**2026-10-23 — `main` at `fa963ecc3`, before the opt-in flag.** A re-evaluation after #2931 merged,
with 22 commits landed since.

- Nothing in the last-known-information machinery moved: `core/lki/`, `GameEvent`, the phase files,
  the snapshot code, `Attack` and all seven migrated cards are unchanged. The commits that did touch
  neighbouring engine code include #3006 (`EventWindow`: contingent and replacement checks), #2997
  (play permissions: `ActionWindow`, Boga and two other SC-12 cards) and the prompt and animation
  work (for example #3002, #3008 and #3009).
- A clean build and a full run: 9,633 specs normal (79 pending) and 8,788 undo (85 pending), 0
  failures. `validate-cards`, `validate-specs` and `eslint --quiet` pass.
- Temporary log-only audits, all reverted: the identity check on events would have fired 23 times
  across the suite (D-34, SC-21); departures that write no record still number 27 (§G.1); a probe in
  a Darth Vader sub-window showed the record lifecycle intact.

**2026-10-23 — branch `ammayberry1/lki-part2`, after the opt-in flag (D-35) and the corrections to
this document.**

- `Card.usesLkiRegistry`, `ICardStateInternal.forCard` and `LiveOnlyCardStateGetter` are added, and the
  six card files that read through `getLastKnownProperties` set the flag. That moved lines in those
  files, so the §B.2 anchors changed.
- New specs, each checked by mutation: [LkiOptIn.spec.ts](../test/scenarios/lki/LkiOptIn.spec.ts) (5),
  the Commandeer replayed-copy spec (1), and a pending spec for the Maul bug (1). For the flag, four
  mutations were tried — everyone gets the registry getter, nobody does, the live-only getter
  consults records, and a clone takes the receiving card's flag — and each fails the specs written
  for it. Disabling Commandeer's target-based cleanup fails its spec. With the `WhileSourceInPlay`
  exemption removed, the Maul spec passes as a normal spec and the full suite stays green; that change
  is **not applied**.
- Maul provenance, measured in a scratch checkout of `20f9e3ebe` (the commit before #2931, with card
  data fetched for that commit by `get-cards`): the pending spec, enabled, fails at the same final
  assertion as on this branch after every earlier expectation passes, and the Commandeer
  replayed-copy spec passes there. So the Maul bug is not a result of the LKI work. The checkout has
  been removed.
- Full gates, all with 0 failures: 9,640 specs normal (80 pending) and 8,795 undo (86 pending), each
  run serially and in the parallel mode CI uses. `tsc --noEmit`, `eslint --quiet`, `validate-cards`
  and `validate-specs` pass.
- Every `file:line` anchor in this document was checked by printing the line it points at. Several had
  drifted, in §A through §E, and were corrected.
- Corrected in this pass because the earlier text did not hold: §B.1 (Commandeer was listed as a bug
  and is correct; Maul was listed as unspecced and is a confirmed bug; DJ is unverified rather than
  broken), §D (`bindCardRef` does not exist; the real mechanism is `GameEvent.setLastKnownInformation`),
  and §G.1 (the attribution of the arena → hand departures was wrong and has been removed).
