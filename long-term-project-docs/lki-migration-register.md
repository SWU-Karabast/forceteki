# LKI Migration Register

The per-site work list for the LKI migration. Each entry is a site that needs individual review before
its card opts in to the registry (phase 4), and most need a behavior decision rather than a syntax change.

**The phase-3 sweep may rewrite reads in these sites.** Under D-35 a card that has not opted in reads live
state exactly as before. What must not happen without individual review is setting `usesLkiRegistry` on
one of these cards. The exception is delayed effects, which the sweep skips (SC-20).

See [lki-redesign-decisions-and-insights.md](./lki-redesign-decisions-and-insights.md) §7 for the
migration plan, and [lki-redesign-special-cases.md](./lki-redesign-special-cases.md) for the
underlying analysis. Two changes have merged so far:
[#2931](https://github.com/SWU-Karabast/forceteki/pull/2931)
([`49405da2d`](https://github.com/SWU-Karabast/forceteki/commit/49405da2d2bbcef67a4180e4f8ed081cbd33e4cd),
phases 0 and 1) and [#3030](https://github.com/SWU-Karabast/forceteki/pull/3030)
([`19421b9f3`](https://github.com/SWU-Karabast/forceteki/commit/19421b9f3fb6f8dc6250ea814d63fb57c5367b84),
the opt-in flag and a correction pass).

Status values: `pending` · `in-progress` · `done` · `deferred`.

**Since 2026-11-05, §A needs no per-site decisions.** D-37 replaced D-31, so a presence question (is it
in play, is it attached, where is it now) reads the present on every properties object, and those sites
keep today's behavior once their card opts in. §A still lists them, because step 3.1 has to keep them
that way and the behavior-delta audit (§G.2) checks it.

Every file and line anchor in this document was checked by reading the line it points at, against `main`
at `445792e61` on 2026-11-01 (§I). The anchors added on 2026-11-05 (§A, §B, §E, §F.1 and §G.2) were checked
the same way against `78124942f`, which is `445792e61` plus a commit that changed only documents and
comments. They drift: the linked file and the quoted content are the authority.

---

## A. Presence reads of a card that has left play — covered by D-37

These sites ask a presence question about a card that has just left play: is it still in play, is it
still attached, is it in the discard pile now. Under D-31 a properties object answered every question
about the moment it represented, so a record answered `isInPlay()` as `true` for a unit sitting in the
discard pile, and each of these cards would have changed behavior when it opted in. Under D-37 presence
reads the present on every properties object, recorded ones included, so each keeps today's behavior and
needs no decision. Several are workarounds for a separate rules problem, an ability that goes on
resolving after its source left play, which is tracked as future work.

The first seven were the whole section before the audit. The audit (§G.2) found the other twenty-one. The
first four of those had been filed in SC-12 as fizzle hacks for the identity check that D-34 dropped.
Seventeen were not in this register. Ten of those are not mentioned in any of the three documents, and
the other seven appear only in other roles: §3.21's accessor guards, the SC-11 fallbacks, or the record
fields in §B.

Status `pending` means step 3.1 has not been built. Each row is checked by re-running the audit after it
is: the site must still read the present.

| Site | Read | Source | Status |
|---|---|---|---|
| [PoeDameronOneHellOfAPilot.ts:24](../server/game/cards/04_JTL/units/PoeDameronOneHellOfAPilot.ts) | `thenCondition: context.source.isInPlay()`, "did Poe survive to be attached?" The canonical example; `PoeDameronOneHellOfAPilot.spec.ts:88` covers the defeated case | before the audit | pending |
| [UnrefusableOffer.ts:33](../server/game/cards/02_SHD/upgrades/UnrefusableOffer.ts) | `ifYouDoCondition: context.source.isInPlay()`. Line 23 also asks whether it is in the discard pile or captivity | before the audit | pending |
| [ReySkywalker.ts:24](../server/game/cards/07_LAW/units/ReySkywalker.ts) | `context.source.isInPlay() && …`. No spec reaches it with Rey having left play | before the audit | pending |
| [MillenniumFalconLandosPride.ts:26](../server/game/cards/02_SHD/units/MillenniumFalconLandosPride.ts) | constant-ability `condition` reading `context.source.isInPlay()`. No spec reaches it with the Falcon having left play | before the audit | pending |
| [SneakAttack.ts:31](../server/game/cards/01_SOR/events/SneakAttack.ts) | `ifYouDoCondition: context.events[0].card.isInPlay()` | before the audit | pending |
| [LuthenRaelDontYouWantToFightForReal.ts:23,44](../server/game/cards/06_SEC/leaders/LuthenRaelDontYouWantToFightForReal.ts) | `when` reading `event.card.isInPlay() && isAttacking()`; also pinned by `LastKnownInformation.spec.ts` | before the audit | pending |
| [PunishingOne.ts:19](../server/game/cards/02_SHD/units/PunishingOne.ts) | `when` reading `event.card.isInPlay() && isUpgraded()`; also pinned by `LastKnownInformation.spec.ts` | before the audit | pending |
| [Bothan5NewRepublicPrisonShip.ts:29](../server/game/cards/08_ASH/units/Bothan5NewRepublicPrisonShip.ts) | `context.event.card.zone === context.player.discardZone` | audit; SC-12 | pending |
| [DisplayPiece.ts:24](../server/game/cards/07_LAW/events/DisplayPiece.ts) | `ifYouDoContext.target.zoneName === ZoneName.Discard` | audit; SC-12 | pending |
| [OldDakaOldestAndWisest.ts:33](../server/game/cards/05_LOF/units/OldDakaOldestAndWisest.ts) | `this.getTarget(thenContext)?.zone === context.player.discardZone` | audit; SC-12 | pending |
| [OneMustDestroyToCreate.ts:29](../server/game/cards/08_ASH/events/OneMustDestroyToCreate.ts) | `this.getTarget(thenContext)?.zone === context.player.discardZone` | audit; SC-12 | pending |
| [SuperlaserTechnician.ts:19](../server/game/cards/01_SOR/units/SuperlaserTechnician.ts) | `context.source.zoneName === ZoneName.Discard`, in its own When Defeated | audit | pending |
| [ExpendableMercenary.ts:19](../server/game/cards/07_LAW/units/ExpendableMercenary.ts) | `context.source.zoneName === ZoneName.Discard`, in its own When Defeated | audit | pending |
| [EnterprisingLackeys.ts:26](../server/game/cards/02_SHD/units/EnterprisingLackeys.ts) | `context.source.zoneName === ZoneName.Discard`, in its own When Defeated | audit | pending |
| [YodaTricksterInExile.ts:23](../server/game/cards/09_HMW/units/YodaTricksterInExile.ts) | `context.source.zone === context.player.discardZone`, in its own When Defeated | audit | pending |
| [BladeOfTalzinAGiftOfShadows.ts:23](../server/game/cards/08_ASH/upgrades/BladeOfTalzinAGiftOfShadows.ts) | `context.source.zoneName === ZoneName.Discard` | audit | pending |
| [GeneralGrievousScuttlingToSafety.ts:18](../server/game/cards/06_SEC/units/GeneralGrievousScuttlingToSafety.ts) | `context.source.zoneName === ZoneName.GroundArena`, "is he still there to be returned to hand" | audit | pending |
| [SawGerreraBringDownTheEmpire.ts:32](../server/game/cards/07_LAW/leaders/SawGerreraBringDownTheEmpire.ts) | `context.target.zoneName` is an arena, "if this unit survived" | audit | pending |
| [KillSwitch.ts:17](../server/game/cards/07_LAW/upgrades/KillSwitch.ts) | `context.source.isInPlay() ? context.source.parentCard : null` | audit; §3.21 | pending |
| [PerilousPosition.ts:17](../server/game/cards/03_TWI/upgrades/PerilousPosition.ts) | `context.source.isInPlay() ? context.source.parentCard : null` | audit; §3.21 | pending |
| [GravCharge.ts:22](../server/game/cards/08_ASH/upgrades/GravCharge.ts) | `context.source.isAttached() ? context.source.parentCard : null` | audit | pending |
| [HanSoloHasHisMoments.ts:24](../server/game/cards/04_JTL/units/HanSoloHasHisMoments.ts) | `context.source.isAttached() ? context.source.parentCard : null` | audit | pending |
| [MaceWinduVaapadFormMaster.ts:26](../server/game/cards/03_TWI/leaders/MaceWinduVaapadFormMaster.ts) | `ifYouDoCondition` reading `context.target.isInPlay()` before its damage | audit; §3.21 | pending |
| [MirajScintelTheWeakDeserveToKneel.ts:31](../server/game/cards/06_SEC/units/MirajScintelTheWeakDeserveToKneel.ts) | `x.isInPlay()` for each target of an attack | audit; §3.21 | pending |
| [DoubleCross.ts:61](../server/game/cards/07_LAW/events/DoubleCross.ts) | `lowerCostUnit?.isInPlay()` in its `then` | audit | pending |
| [LattsRazziDeadlyWhipmaster.ts:34](../server/game/cards/07_LAW/units/LattsRazziDeadlyWhipmaster.ts) | `thenContext.source.isInPlay()`, the guard of an SC-11 fallback | audit; SC-12 | pending |
| [TheGreatProgenitorFirstOfTheDrengir.ts:44](../server/game/cards/09_HMW/units/TheGreatProgenitorFirstOfTheDrengir.ts) | `context.source.isInPlay()`, the guard of an SC-11 fallback | audit; SC-12 | pending |
| [SandoAquaMonster.ts:61](../server/game/cards/09_HMW/units/SandoAquaMonster.ts) | `context.source.isInPlay()`, the guard of a three-way fallback (§E) | audit | pending |

The SC-11 fallbacks at the end keep working as written, because their guard reads the present. Each can
also collapse to a single read of the record once its card opts in, which is the simplification §E
tracks.

---

## B. Known bugs to fix as part of this work

| Site | Issue | Status |
|---|---|---|
| [DengarTakeYourShot.ts:42](../server/game/cards/07_LAW/units/DengarTakeYourShot.ts) | `event.lastKnownInformation.card.cost` hops through `.card` to the **live** object while the two reads above it use LKI. `cost` *is* captured on the struct, so this is inconsistent. The only such hop in the repo (SC-3). | pending |
| [UseWhenDefeatedSystem.ts:75](../server/game/gameSystems/UseWhenDefeatedSystem.ts) | `generateEvent(event.context, whenDefeatedSource, true)` passes a `Card` in the `additionalProperties` slot. Line 102 passes `{}` correctly. Harmless today because `this.properties` is assigned last and wins. | pending |
| [IStateWatcherLKIEntry](../server/game/core/stateWatcher/StateWatcher.ts) | `upgrades` is stored as `GameObjectId<IUpgradeCard>[]` with **no identity component**, so rehydration yields whatever identity the upgrade is at now rather than the captured one. `CardLeftPlayEntry` gets this right by storing `card` and `inPlayId` separately (D-23). | pending |
| [CardsDefeatedThisPhaseWatcher.ts:134](../server/game/stateWatchers/CardsDefeatedThisPhaseWatcher.ts), [CardsLeftPlayThisPhaseWatcher.ts:112](../server/game/stateWatchers/CardsLeftPlayThisPhaseWatcher.ts) | Store the event's `traits` `Set` **instance** directly into tracked state, so multiple readers share a mutable collection (D-17). | pending |
| [LkiRegistry.buildRecord](../server/game/core/lki/LkiRegistry.ts) | Records for upgrades hold only the base fields: no `parentCard` and no `parentCardController`. Five cards read both off the legacy struct and cannot opt in until the record carries them: [FinnThisIsARescue](../server/game/cards/02_SHD/leaders/FinnThisIsARescue.ts), [RoseTicoDedicatedToTheCause](../server/game/cards/02_SHD/units/RoseTicoDedicatedToTheCause.ts), [SystemShock](../server/game/cards/04_JTL/events/SystemShock.ts), [Reforge](../server/game/cards/08_ASH/events/Reforge.ts) and [BladeOfTalzinAGiftOfShadows](../server/game/cards/08_ASH/upgrades/BladeOfTalzinAGiftOfShadows.ts) (SC-2). Part of the surface work in plan D-36 and phase 4. | pending |
| [LkiRegistry.commitPending](../server/game/core/lki/LkiRegistry.ts) | A card's leave-play record and its visible → hidden record (R4) share the key `(card, identityId)`, and a later commit replaces an earlier one. So a unit that is defeated and then moved from the discard pile into a hidden zone in the same action loses its leave-play record. Moff Gideon, Remnant Commander returning a unit defeated in the same wipe, or Yoda, Trickster in Exile moving himself to his deck, would do it. A trigger from the defeat that reads the record afterwards gets the discard pile's state: `wasInPlay` is false, so `asInPlay()` throws, and `controller` and `zoneName` are the discard pile's. SC-13's argument that keys cannot collide predates R4. Found by reading the code, not reproduced by a spec. Candidate fix: an identity keeps the first record it gets within an action. | pending |
| [ResourceCardSystem](../server/game/gameSystems/ResourceCardSystem.ts) | Writes no record when it moves a card from the discard pile to the resource zone, a visible → hidden move that changes the card's identity. When the card has no record already, as with a unit Spark of Hope resources after it was defeated in an earlier action, a reference bound while it sat in the discard pile is orphaned by the move. The departure assertion (§G.1) checks only moves out of play, so it cannot see this. | pending |

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
| [MaulMasterOfTheShadowCollective.ts:39](../server/game/cards/07_LAW/units/MaulMasterOfTheShadowCollective.ts) | **Confirmed bug.** The "return control" effect is a `WhileSourceInPlay` delayed effect, and `removeLastingEffects` ([OngoingEffectEngine.ts:428](../server/game/core/ongoingEffect/OngoingEffectEngine.ts)) exempts those from the cleanup above. If the stolen unit is bounced and replayed and a different effect then takes control of the new copy, Maul leaving play acts on that new copy. Reproduced by a pending spec in [MaulMasterOfTheShadowCollective.spec.ts](../test/server/cards/07_LAW/units/MaulMasterOfTheShadowCollective.spec.ts) that asserts the correct behavior. **Pre-existing:** that spec fails identically on `20f9e3ebe`, the commit before the LKI merge (#2931) — the exemption itself dates to #689 (Feb 2025), and Maul's card and the `WhenSourceLeavesPlayDelayedEffectSystem` it uses arrived in #2237 (Feb 2026). **Candidate fix, not applied:** drop the exemption. In a trial run without it the spec passed and the full suite stayed green. DJ shares the exemption, so it needs a spec of its own first. | **deferred** — decision 2026-10-23: "We'll do the fix later" |
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
instead of live discard state. Since D-37 that applies to its characteristics only: presence always
reads the present.

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
| The 7 SC-11 hand-rolled live/frozen fallbacks | Collapse to a plain property read. Two are done (`CalculatedLethality`, `AsajjVentressIWorkAlone`); five remain (SC-11). The audit (§G.2) found an eighth: [SandoAquaMonster.ts:60-64](../server/game/cards/09_HMW/units/SandoAquaMonster.ts), whose `sourcePower` is the same three-way fallback through the left-play watcher that Ravager had (SC-19). |
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

Under D-37 a characteristic of a card that left play during the action defaults to last known
information. So these are the places where a card has to ask for the present explicitly, the exceptions
the default cannot recognize by itself. The audit (§G.2) found no other.

| Site | Rule | Status |
|---|---|---|
| [TargetingComputer.spec.ts:68](../test/server/cards/04_JTL/upgrades/TargetingComputer.spec.ts) | A granted ability is not active from the discard pile while a When Defeated ability resolves (rulings 2025-03-25 and 2025-04-30), so Targeting Computer does not let its controller assign that indirect damage. | pending |
| [Clone.spec.ts:2027](../test/server/cards/03_TWI/units/Clone.spec.ts) | A defeated Clone reverts completely (ruling 2024), so it is not eligible for effects based on traits it had only while it was a copy. Under D-37 a trait read on the defeated Clone returns the copied traits, so the trigger that implements this must read the present explicitly. | pending |
| [DarthMaulsLightsaber.spec.ts:273](../test/server/cards/05_LOF/upgrades/DarthMaulsLightsaber.spec.ts) | An ability whose source left play before it resolved, asking about the source's *current* attachment, gets the present answer. A Lightsaber defeated by the uniqueness rule is attached to nothing, so its When Played grants no attack (ruling 2025-09-29). The card reads `context.source.parentCard`, a characteristic that D-37 serves from the record, so it must read the present explicitly when it migrates. | pending |

---

### G.1 The departure audit — D-22's scope, measured

D-22 says every departure that loses information writes a record. Phase 1 wired records at the seven
capture points the engine already used. To check whether any engine path departs a card without one,
temporarily assert, at the leave-play branch of
[InPlayCard.initializeForCurrentZone](../server/game/core/card/baseClasses/InPlayCard.ts), that a record
exists for the departing identity (the recipe is at the end of this section).

**Result: 27 of 9,690 specs trip it, and all 27 start in test code, not in the engine.** The stack in
each failure names the caller:

| Where the departure comes from | Specs |
|---|---:|
| `PlayerInteractionWrapper.moveCard`, the harness helper that teleports a card | 20 |
| `PlayerInteractionWrapper.setupMoveCard`, the same helper during test setup | 6 |
| A spec calling `card.moveTo('hand')` itself (the `reset()` in `IG2000AssassinsAggressor.spec.ts`) | 1 |

| Transition | Specs |
|---|---:|
| `groundArena -> hand` | 11 |
| `spaceArena -> hand` | 6 |
| `groundArena -> deck` | 5 |
| `groundArena -> discard` | 2 |
| `spaceArena -> discard` | 2 |
| `spaceArena -> deck` | 1 |

The count has been 27 each time it was measured: 27 of 8,506 in phase 0, of 9,633 on `main` at `fa963ecc3`
(2026-10-23), and of 9,690 at `445792e61` (2026-11-01), with the same transitions. Earlier versions of this
section called the arena → hand and deck group an engine coverage gap, and the arena → discard group the
likeliest real bug. Neither was true: every one of them is a harness move.

**What this shows, and what it does not.** No spec in the suite drives an engine path that departs a card
without a record. It does not show that no such path exists, because it only sees paths a spec
exercises. A static audit of the callers of `Card.moveTo` under `server/` has not been done.

**Enabling the assertion.** It cannot be turned on as written, because the harness moves cards without
going through an event window. Either the harness declares its moves as out of the pipeline and the
assertion honors that, or the assertion applies only while an event window is resolving. Neither depends
on the migration phases. Afterwards a failure means a real engine gap, and the count of 27 becomes 0.
[LkiRegistry.hasRecordFor](../server/game/core/lki/LkiRegistry.ts) exists as the hook for it.

**Re-measuring.** After `this.setPendingDefeatEnabled(false);` in the `else` branch of
`initializeForCurrentZone`, add the following, run the normal suite, and count the failures that say
`TEMP-LKI-AUDIT`. The failure list names the specs. Revert it afterwards and rebuild, so `build/` does not
keep the assertion.

```ts
if (wasInPlay && !this.game.lkiRegistry.hasRecordFor(this, this._mostRecentInPlayId)) {
    throw new Error(`TEMP-LKI-AUDIT ${prevZone} -> ${this.zoneName}`);
}
```

### G.2 The behavior-delta audit — what the default changes, measured

**The question.** Suppose every card read cards through the registry. Which reads would give a different
answer from today's, and is the new answer right? This audit answered that, and its results decided
D-37 to D-39.

**Method.** `npm run lki-audit` runs the game specs with
[audit-helper.js](../scripts/lki-audit/audit-helper.js) installed. The helper wraps the characteristic
and presence members of every card class. For each read, *from card code*, of a card that has left play
during the current action, it records the member, the call site, the live value, and the value last
known information would give. That last comes from a snapshot the helper takes at the moment the
registry writes its record. It also records reads of a card whose current identity is tombstoned, and of
a card whose record belongs to an earlier identity. [analyze.js](../scripts/lki-audit/analyze.js)
classifies every site and writes `build/lki-audit/analysis.md`. The helper only observes, so the suite
passes with it installed, and [run.js](../scripts/lki-audit/run.js) treats any spec failure as a failed
run. It also refuses to run on a stale `build/` (see the plan's *Environment gotchas*).

`npm run lki-audit -- --self-check` runs three cases with known answers and checks that the audit still
finds them. It was mutation-checked: with the helper's card-code filter broken, all three fail.

**Result, 2026-11-05, on `78124942f`.** 9,012 game specs and 0 failures; 5,027 reads at 234 sites in 118
card files.

| | Before D-37 to D-39 | Under D-37 to D-39 |
|---|---|---|
| The read throws (tombstoned identity) | 55 sites, 41 files | 0: reads the present (D-39) |
| A presence answer changes | 30 sites, 26 files | 0: reads the present (D-37) |
| A selector candidate's answer changes | 2 sites, 1 file | 0: reads the present (D-38) |
| Another characteristic's answer changes | 5 sites, 4 files | the same 5, each correct or without effect |

"Before" means the design as D-21 and D-31 left it, with every card opted in. In 67 card files it would
throw or give a wrong answer.

**Where it would have thrown** (55 sites in 41 files). Every one reads a card that left play in an earlier
action and kept its identity, so the card was picked up again, legitimately, from the zone it went to:

- 25 selector candidates, mostly from the discard pile: Spark of Hope, Rogue Squadron Skirmisher,
  Salvage, Admiral Trench, Unnatural Life, Maul (Old Master), Street Gang Recruiter, Home One, Grand Moff
  Tarkin, Boga and others.
- 8 trigger conditions in 7 files, on a card being played back from the discard pile or a leader being
  deployed again: Lady Proxima, Agent Kallus, Greef Karga, Leia Organa, Phee Genoa, Insurgent Camp, and
  Cad Bane (He Who Needs No Introduction).
- 16 filters that card code applies to a zone itself, outside any selector: The Emperor's Legion, Osha,
  Rule With Respect, Chancellor Palpatine, Padmé Amidala, Anakin Skywalker, Cassian Andor, Jar Jar Binks,
  Director Krennic, Retaliation, and Kylo's TIE Silencer.
- 6 others. Two are leaders reading themselves on their leader side after their unit side was defeated
  (Grogu, Bail Organa). The rest read a target chosen from the discard pile (Palpatine's Return,
  Psychometry, Consolidation of Power, A Fine Addition).

**Where a presence answer would have flipped** (30 sites in 26 files): the sites in §A. Every one wants
the present.

**Where a selector candidate's answer would have changed:**
[BrainInvaders.ts:20](../server/game/cards/03_TWI/units/BrainInvaders.ts), `card.isLeader() &&
!card.isUpgrade()` read for a candidate that had left play during the action.

**The five sites where the default changes the answer:**

| Site | Read | Live | Last known | Verdict |
|---|---|---|---|---|
| [GrandAdmiralThrawnHowUnfortunate.ts:17,24](../server/game/cards/04_JTL/leaders/GrandAdmiralThrawnHowUnfortunate.ts) | the defeated card's `title`, in two prompt titles | "Clone" | the name of the unit the Clone copied | Last known is right: it covers a Clone's copied name (the Annihilator ruling) |
| [ShadowCasterJustBusiness.ts:17](../server/game/cards/04_JTL/units/ShadowCasterJustBusiness.ts) | the same, in its prompt title | "Clone" | the copied unit's name | Last known is right, as above |
| [LuthenRaelDontYouWantToFightForReal.ts:22](../server/game/cards/06_SEC/leaders/LuthenRaelDontYouWantToFightForReal.ts) | `event.card.isUnit()` in a `when` | false | true | No effect: the same condition reads `isInPlay()`, false under either design |
| [BobaFettDaimyo.ts:20](../server/game/cards/02_SHD/leaders/BobaFettDaimyo.ts) | `event.card.keywords.length > 0` in a `when` | Sentinel | Sentinel, and a Bounty it had been given | No effect: the condition is true either way |

**Cards that became a new copy** (71 sites in 39 files). The card left play during the action and was then
returned to hand or played again, so it now has a new identity, and both designs read it as it is now.
Where the values differed, the present is the right answer, because the text is about the card where it
is now:

- [BaylanSkollEnigmaticMaster.ts:29,31](../server/game/cards/05_LOF/units/BaylanSkollEnigmaticMaster.ts)
  and [ANewAdventure.ts:27](../server/game/cards/02_SHD/events/ANewAdventure.ts) let a card's owner play
  it from hand, so the owner holding it is the player who can.
- [Condemn.ts:23,39](../server/game/cards/06_SEC/upgrades/Condemn.ts) was played again onto a different
  unit, so its attached unit is the new one.
- [QuiGonJinStudentOfTheLivingForce.ts:38](../server/game/cards/05_LOF/leaders/QuiGonJinStudentOfTheLivingForce.ts)
  reads a candidate in hand, the Clone just returned there, whose own cost is the right one.

Abilities that refer back to a bounced card's old values already ask for them through
`lastKnownInformation`, and they migrate to the event's reference.

**Members read on cards that left play during the action**, which sets what a record must hold (D-36):
title, traits, `unique`, cost, `owner`, controller, aspects, keywords, and the type checks `isUnit`,
`isLeader`, `isBase`, `isUpgrade` and `isForceToken`. Today's record holds the title, traits, cost,
controller and type. The rest would have to be added.

**Limits.**

- It sees only the paths the specs exercise, and it ran in normal mode, not undo.
- A card that test setup places in a discard pile has no record and no tombstone, so reads of it are not
  counted. The would-throw count is therefore a lower bound: in a real game most such cards left play.
- It compares values. Whether a difference changes the outcome is a judgment, made site by site above.
- Reads through `event.lastKnownInformation` are not reads of a card, so they are outside it. They belong
  to the cards that already ask for last known information explicitly.
- Some specs search a shuffled deck, so a site can appear in one run and not the next.
  [GrievoussWheelBike.ts:23](../server/game/cards/03_TWI/upgrades/GrievoussWheelBike.ts) is reached in
  about a third of the runs of its Triple Dark Raid spec, so totals can differ by one between runs.
- It wraps `Card` members, so it measures card code that reads cards directly. Once the sweep (phase 3)
  routes card code through the getter, the helper has to wrap the properties classes instead.

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
  across the suite (D-34, SC-21); departures that write no record still number 27 (§G.1, later traced
  to test-harness moves — see the 2026-11-01 entry); a probe in
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

**2026-11-01 — `main` at `445792e61`, after #3030 merged: the handoff review.** 19 commits had landed
since #3030.

- Nothing in the last-known-information machinery moved. The only change under the paths that matter was
  six lines in `InitiateAttackSystem.ts` (#3029, clean-up of early "for this attack" effects). Fifteen
  card files were added or changed, and none reads the legacy struct or the getter.
- A full run on `445792e61`, serial: 9,690 specs normal (80 pending) and 8,824 undo (86 pending), 0
  failures. The extra specs over the 2026-10-23 figures come from new cards.
- The departure audit (§G.1) was re-run: still 27 of 9,690 specs, and this time each one was traced by its
  call stack. **All 27 come from test code**, so the earlier reading of the count as an engine coverage
  gap was wrong. The temporary assertion was reverted and `build/` rebuilt, and the 16 LKI specs pass.
- The plan was reviewed against the code. The findings are in the plan document: the properties surface
  covers 19 of about 76 members (D-36); several *Decided* rows are not built (*Decided but not built*);
  and §1.1, the decision log and the terminology table now match the code.
- Figures re-measured: 654 card files with selector callbacks (743 occurrences, unchanged from the plan),
  49 card files mentioning `lastKnownInformation`, 25 direct `new GameEvent(` sites in 19 files, and 7
  call sites that bind `event.cardRef` (the plan said 6).

**2026-11-05 — branch `ammayberry1/lki-refactor-3` at `78124942f`: the takeover review and the
behavior-delta audit.** `78124942f` is `445792e61` plus one commit that changed only documents and
comments, so the code measured is the code on `main`.

- **Environment.** `node_modules` did not match the lockfile: zod 4, glob 14 and ts-to-zod 5 were
  installed where 3.x, 13.x and 3.x are locked, so nothing compiled until `npm ci`. The card data was
  stale (`npm run get-cards`). `build/` held 60 compiled files with no source, left from another branch:
  28 cards and 28 specs under `09_IC27` and four non-game files. And `build/test/json` was older than
  `test/json`, because fast builds never refresh it. A first full run failed 59 specs, every one from that
  stale output. After cleaning, 0. The audit runner now checks for both.
- **The finding that started it.** The registry-backed getter keys records by identity. A card that
  leaves play for a visible zone keeps its identity. So for such a card, the record stands in for the
  present for the rest of the action, and the tombstone then makes every later read of it throw. Card
  code asks about cards in exactly that state all the time, for example a unit in a discard pile.
- **Shown with real cards.** The codemod's rewrite and the opt-in flag were applied to two cards and then
  reverted. Superlaser Technician's spec failed 3 of 4: its "is it in my discard pile?" check read the
  arena from the record, so the ability never offered itself. A probe made Moff Gideon, Remnant
  Commander's discard-pile selector throw on a unit defeated in an earlier action. All three of his own
  specs still passed, because their discard piles come from test setup.
- **The behavior-delta audit**, now `npm run lki-audit`: method and results in §G.2. D-37 to D-39 follow
  from it, and so do D-36's answers. The full game suite passes with it installed (9,012 specs, 0
  failures). Its self-check was mutation-checked.
- **Changed in this pass:** §A (covered by D-37, with 21 sites added), §B (two rows: the record-key
  collision and the resource path), §E (Sando Aqua Monster's fallback), §F.1 (Darth Maul's Lightsaber, and
  a note on Clone), and §G.2 (new).
