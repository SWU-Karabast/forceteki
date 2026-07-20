# SWU Clarifications — Flagged for Review

These are the clarifications that were **pinned for later review** during the coverage triage
(rather than turned into an `xit` stub, marked handled, or skipped). Each entry includes the full
clarification text and the findings/notes from the triage pass.

Reasons an item lands here: the engine behavior is uncertain, the ruling is hard to assert cleanly in
a test, an erratum may not be implemented yet, or we strongly suspect it's already covered somewhere
and want to confirm before adding a redundant stub.

---

## SOR / SHD / TWI

### 1. Superlaser Technician + Unrefusable Offer (SOR / SHD)

**Clarification (social-media bullets):**
> * Superlaser Technician and Unrefusable Offer do not play well together. (discord)
> * Superlaser Technician and Unrefusable Offer are mutually exclusive. (x.com/davflamerock/status/1810561816805695791)

**Context:** Superlaser Technician's When Defeated and Unrefusable Offer (a Bounty upgrade that plays
the defeated unit) fight over the same defeated unit; only one resolves.

**Findings:** No cross-interaction test in either `SuperlaserTechnician.spec.ts` or
`UnrefusableOffer.spec.ts`. The bullets are vague ("don't play well together / mutually exclusive")
without spelling out the exact resolution, so the precise assertion is unclear. Pinned to nail down
the intended behavior before stubbing.

---

### 2. Spare the Target on Unrefusable Offer when controller is not the owner (SHD)

**Clarification (full Q&A):**
> **Question: Does Spare The Target on Unrefusable Offer work if the controller is not the owner?**
>
> A follow up to an older question. A bounty is always resolved by the opponent of the controller of
> the unit which is USUALLY not the owner of said card. We know Spare The Target played on a unit with
> Unrefusable Offer attached results in not being able to play the unit when resolving the bounty
> because it's in your opponent's hand, which is a hidden zone. How does it change if Spare the Target
> returns the unit in question to your own hand, such as if it had previously been swapped control with
> Change of Heart? Are you then able to play it from your own hand since it is NOT in a zone hidden to
> the controller of the bounty when resolving?
>
> Comparing similar effects, we know the effect of A New Adventure works from your hand, or your
> opponent's hand, to play the unit for free. Does this mean STT+UR could actually play the unit if your
> opponent allowed you to, but normally it fails because there's no reason for them not to "fail to find"
> the unit that the effect is looking for?
>
> **Answer:** No, Spare the Target can never play a card from hand. Unrefusable Offer was a templating
> error and will be corrected in the coming errata.

**Context/target:** `test/server/cards/02_SHD/events/SpareTheTarget.spec.ts` — covers returning units
to hand and collecting bounties, but no Unrefusable Offer pairing.

**Findings:** The answer says Unrefusable Offer is a **templating error pending errata**, so intended
behavior may change. A test here risks asserting soon-to-be-errata'd behavior. Pinned until the errata
lands / behavior is settled.

---

### 3. Conditional Overwhelm lost before combat damage resolution (SHD)

**Clarification (social-media bullet):**
> * If conditional Overwhelm is lost before combat damage resolution, excess damage does not apply to
>   base. (x.com/davflamerock/status/1829563590640283671)

**Context:** A unit with conditionally-granted Overwhelm that loses the condition before combat damage
resolves no longer has Overwhelm at resolution time, so excess damage does NOT spill to the base.

**Findings:** Engine-level; no focused test found in `Overwhelm.spec.ts`. Pinned to find/construct a
concrete example (a card whose Overwhelm is conditional and can be turned off mid-attack).

---

### 4. Clone reverts completely when defeated (TWI)

**Clarification (social-media bullet):**
> * When defeated, Clone reverts completely, so it is not eligible for any effects based on traits it
>   had while it was a copy. (x.com/davflamerock/status/1845891268653556025)

**Context:** When Clone is defeated it reverts to its base (non-copy) state, so "when a [trait] unit is
defeated" effects don't see the copied traits.

**Findings:** `Clone.spec.ts` is thorough but has no "reverts before trait-based defeat effects
evaluate" test. Pinned (subtle timing assertion; needs a defeat-trigger that keys off a trait the
Clone only had while copying).

---

### 5. Capturing a token with a bounty (TWI)

**Clarification (social-media bullet):**
> * Capture targeting a token with a bounty: it does count as captured when it is set aside, and the
>   bounty is collectable. (x.com/davflamerock/status/1852106904434282899)

**Context:** A token unit with a bounty, when captured, counts as captured at the moment it is set
aside (rather than just ceasing to exist), and its bounty is collectable.

**Findings:** Token+bounty+capture combination not found in capture specs (PrisonerOfWar, Take Captive,
Arrest). Home spec is open, and constructing a token that has a bounty needs the right setup. Pinned.

---

### 6. Once Per Round ability limit attaches to the card copy (TWI)

**Clarification (social-media bullet):**
> * A Once Per Round ability limit is attached to the copy of the card, not based on controller. It
>   can't be used again if control changes in the same phase after it's been used.
>   (bsky.app/profile/davflamerock.bsky.social/post/3lihoqgkac227)

**Context:** A "once per round" limit is tracked on the specific card copy. If you use it, then control
of the card changes in the same round, the new controller cannot use it again.

**Findings:** Engine-level ability-limit mechanic, not tied to one card. No dedicated spec located.
Needs a concrete card with a once-per-round ability plus a control-change effect (Change of Heart,
etc.). Home spec unclear. Pinned.

---

## JTL

### 7. Admiral Yularen (Fleet Coordinator) — applies to units played after the trigger (erratum)

**Clarification (full Q&A, condensed):**
> **Question: Does JTL Admiral Yularen ability apply to units not in play when the trigger resolves?**
>
> Admiral Yularen: *When played: Choose Grit, Restore 1, Sentinel, or Shielded. While this unit is in
> play, each friendly Vehicle unit gains the chosen Keyword.* [CR 7.7.3.D on lasting effects only
> applying to cards in play at creation; Rallying Cry example. Question of whether Yularen is a
> snapshot or dynamic like a constant ability.]
>
> **Answer:** Admiral Yularen's lasting effect is intended to function like a constant ability, much
> like SOR Admiral Piett unit. It applies both to units already in play and units that are played after
> the ability triggers. We'll make an erratum for this card.

**Context/target:** `test/server/cards/04_JTL/units/AdmiralYularenFleetCoordinator.spec.ts` — no
later-played-Vehicle test.

**Findings:** Answer explicitly says **"We'll make an erratum for this card"** — the engine may
currently implement it as a snapshot lasting-effect (not covering later units). A test could fail
against current behavior (like the SOR Luke leader case). Pinned pending the erratum.

---

### 8. JTL Han Solo (Never Tell Me The Odds) leader deploy + Plot

**Clarification (full Q&A, condensed):**
> **Question: How does JTL Han Solo Leader deploy interact with Plot?**
>
> JTL Han Solo - Never Tell Me The Odds: *When deployed as an upgrade: For each friendly unit or
> upgrade that has an odd cost, ready a resource.* [Plot behaves like a "when your leader deploys"
> trigger; can you ready resources with Han then play more Plot cards, or must all Plot resolve
> together?]
>
> **Answer:** All cards you intend to play with Plot must be revealed when you deploy your leader (in
> the same way as LOF Rey, to show that the ability is triggering). Then, each Plot must be played one
> at a time. Just like Smuggle, Plot cards and the cards that replace them from the deck enter play at
> the same time, so you will always have the same number of resources while you resolve Plots. JTL Han
> will be able to ready those resources if you sequence appropriately.

**Context/target:** `test/server/cards/04_JTL/leaders/HanSoloNeverTellMeTheOdds.spec.ts` — no Plot
interaction test.

**Findings:** Multi-step Plot + leader-deploy sequencing; asserting the resource-readying interleave
with Plot resolution is involved. Pinned.

---

### 9. Shadow Caster doubling Grim Valor's granted When Defeated

**Clarification (full Q&A, condensed):**
> **Question: How does Shadow Caster actually function? Can it double Grim Valor?**
>
> [Grim Valor grants a When Defeated to a unit. When Shadow Caster looks for When Defeated abilities to
> reuse, does the Grim-Valor-granted ability count via LKI?]
>
> **Answer:** In order for it to function, Shadow Caster's ability specifically asks you to care about
> what "When Defeated" abilities the defeated unit had, so which When Defeated abilities were on the
> unit are covered by LKI. ... Last Known Information specifically covers information that is necessary
> in order to resolve abilities.

**Context/target:** `test/server/cards/04_JTL/units/ShadowCasterJustBusiness.spec.ts` (or
`GrimValor.spec.ts`) — no Grim Valor interaction.

**Findings:** LKI-dependent doubling of a granted When Defeated; pinned to decide home spec and exact
assertion.

---

### 10. Chewie and Han can pilot onto Falcon in either order

**Clarification (social-media bullet):**
> * Chewie and Han can pilot on to Falcon in either order. (x.com/davflamerock/status/1864356237212520768)

**Context:** Attaching Chewbacca and Han as pilots onto the Millennium Falcon works regardless of
order.

**Findings:** No named-pilot ordering test found. Pinned (likely a small test; just confirm which
Falcon/Chewie/Han versions and that both orders are valid).

---

### 11. Indirect damage ignores shields + must not be wasted

**Clarification (social-media bullet):**
> * Indirect damage ignores shields, and must be assigned to targets with sufficient remaining HP that
>   it is not wasted. (bsky.app/profile/davflamerock.bsky.social/post/3lcj5rjx27s2u)

**Context:** Indirect damage ignores Shield tokens and must be assigned so it isn't wasted (can't dump
it on a unit with less remaining HP than the damage if a better target exists).

**Findings:** Engine-level. No focused "ignores shields / no-waste" assertion located, but the user
believes there are tests for this somewhere. Pinned to confirm existing coverage before adding a
redundant stub.

---

### 12. Indirect damage to deployed Chirrut leader up to remaining HP

**Clarification (social-media bullet):**
> * Indirect damage can only be assigned to deployed Chirrut leader unit up to remaining HP.
>   (x.com/davflamerock/status/1879321937748652342)

**Context:** Deployed Chirrut (can't be defeated by damage during the action phase) can only be
assigned indirect damage up to his remaining HP — you can't overload it onto him to waste it.

**Findings:** `ChirrutImweOneWithTheForce.spec.ts` has deployed-ability tests but none involving
indirect damage. Pinned.

---

### 13. Upgrade eligibility checked on attach, doesn't fall off if invalid later

**Clarification (social-media bullet):**
> * Upgrade eligibility should be checked any time the upgrade is attached, but the upgrade won't fall
>   off if it becomes invalid later on (such as "Attach to a Force unit" temporarily losing the Force
>   trait). (bsky.app/profile/davflamerock.bsky.social/post/3lj65yfns7s2c)

**Context:** Attachment eligibility is checked at attach time; the upgrade stays attached even if the
host later becomes invalid (e.g. host temporarily loses the required trait).

**Findings:** Engine-level upgrade-eligibility behavior. Several eligibility-adjacent tests exist but
none clearly cover "stays attached when host becomes invalid." Pinned (mechanics/keyword spec, not a
single card).

---

### 14. Pilots already in play can't be moved to a non-vehicle unit

**Clarification (social-media bullet):**
> * Pilots already in play can't be moved to a non-vehicle unit.
>   (bsky.app/profile/davflamerock.bsky.social/post/3ljjsyboyb22x)

**Context:** A pilot already in play (as an upgrade) can only be moved to another Vehicle, not a
non-vehicle unit.

**Findings:** `Piloting.spec.ts:264` tests the one-pilot-per-vehicle limit, but not the non-vehicle
restriction specifically. Pinned.

---

### 15. Leader pilot grants leader status + Brain Invaders (errata to consider)

**Clarification (social-media bullet):**
> * If a leader pilot grants "Attached unit is a leader unit" and Brain Invaders is played, the attached
>   unit no longer counts as a leader, and is unaffected by Brain Invaders.
>   (bsky.app/profile/davflamerock.bsky.social/post/3lleqn52jxc2j)

**Context:** A leader-pilot upgrade that grants "Attached unit is a leader unit" — Brain Invaders
blanks the leader pilot, so the grant disappears and the host is no longer a leader (and thus
unaffected by Brain Invaders).

**RESOLVED — OBSOLETE (superseded by errata).** Brain Invaders was errata'd to only affect
non-upgrade leaders; it no longer affects leader *upgrades*. So a leader pilot is NOT blanked, its
"attached unit is a leader unit" grant persists, and the host stays a leader — the opposite of this
(pre-errata) ruling. The current, errata'd behavior is already tested at
`test/server/cards/03_TWI/units/BrainInvaders.spec.ts:192` ("does not remove abilities from Leader
Upgrades"). No stub added; this ruling is out of date.

---

## SEC

### 16. Queen Amidala + Overwhelm — excess damage when she defeats another defender

**Clarification (full Q&A, condensed):**
> **Question: If an attacker with overwhelm has two defenders how is Overwhelm damage resolved if Queen
> Amidala defeats the other unit to prevent damage to herself?**
>
> [Darth Maul (Revenge at Last) + Darth Maul's Lightsaber gains Overwhelm, attacks both Queen Amidala
> and Furtive Handmaiden; Maul's power for the attack is 9. Player B defeats Furtive Handmaiden via
> Amidala's replacement to prevent damage to Amidala. Does the base take 9 or 7? Does Maul take 5 or 7?]
>
> **Answer:** ...Furtive Handmaiden is defeated and dealt 9 damage simultaneously, so 7 of the damage
> directed to it is considered excess damage, which Overwhelm applies to the base. The defending
> player's base takes 7 damage, and Darth Maul takes 7 damage. In both the Maul example and the Bombing
> Run example, Furtive Handmaiden is defeated and dealt damage simultaneously, and is considered to be
> dealt damage for any other relevant abilities.

**Context/target:** `test/server/cards/06_SEC/units/QueenAmidalaChampioningHerPeople.spec.ts:295` —
*"should prevent damage just to Amidala from Maul..."* but that is the **non-Overwhelm** Maul (no
Lightsaber). The Overwhelm-excess-to-base case (base takes 7, Maul takes 7) is not covered.

**Findings:** Gap, but a fairly involved combat-math assertion (two defenders, Overwhelm, replacement
defeat, excess-to-base, attacker damage). Pinned for review to construct precisely.

---

## LAW

### 17. Tear This Ship Apart — finish playing the selected card before "if you do"

**Clarification (full Q&A, condensed):**
> **Question: Do you finish resolving Tear This Ship Apart before you play the selected card?**
>
> Tear This Ship Apart: *Look at all of an opponent's resources. You may play 1 of those cards for free.
> If you do, that opponent resources the top card of their deck.* [If you select another Tear This Ship
> Apart, would you have access to the newly-resourced card?]
>
> **Answer:** "Playing" an event is defined as putting that event into its owner's discard pile and
> resolving its ability, so that must occur before you resolve any text after "If you do". In the Tear
> This Ship Apart example, you would not have access to the newly resourced card.

**Context/target:** `test/server/cards/07_LAW/events/TearThisShipApart.spec.ts:151` — already has an
explicit **TODO at line 191** (*"follow clarifications for the order of resolving nested and if you
do"*) with commented-out expectations (lines 194-195).

**Findings:** Known gap, flagged in-code. The recursive case (playing a second Tear This Ship Apart and
NOT seeing the newly-resourced card) and the play-before-"if you do" ordering need a dedicated test.
Pinned (tie it to resolving the existing TODO).

---

## General (engine / rules-level)

### 18. Fire Across the Galaxy — choose-as-you-go vs choose-up-front

**Clarification (full Q&A, condensed):**
> **Question: When instructed to "use multiple triggered abilities," when do you choose which to resolve?**
> Fire Across the Galaxy: *Use any number of "When Played" abilities on friendly Spectre units.*
> **Answer:** You may see the resolution of each ability before choosing the next one to use. I'll add additional text to cover this case in CR8.

**Context/target:** `test/server/cards/07_LAW/events/FireAcrossTheGalaxy.spec.ts:60-67`.

**Findings:** The engine currently makes you select the whole set of abilities **up front**, then resolves
them — the **opposite** of the ruling (choose one, see result, then choose the next). A correct test
would fail against current behavior (like the SOR Luke leader case). Pinned (engine-vs-ruling mismatch).

---

### 19. Umbaran Mobile Cannon — "first time would take damage" vs another replacement

**Clarification (full Q&A, condensed):**
> **Question: Does "First" or "Next" apply differently if all damage was prevented?**
> Umbaran Mobile Cannon: *The first time this unit would take damage each phase, prevent that damage.*
> Vigil: *If damage would be dealt to another friendly unit, prevent 1 of that damage.*
> **Answer:** Damage being prevented by a replacement effect does not affect whether it is the "first" or
> "next" time a unit would be dealt damage... even if that damage is prevented by Vigil's replacement
> instead of the Cannon's, the "first time" has occurred.

**Context/target:** `test/server/cards/06_SEC/units/UmbaranMobileCannon.spec.ts:139` (the shield variant).

**Findings:** The Vigil scenario isn't directly tested. The closest existing test prevents the Cannon's
first damage with a Shield, then shows a second hit still leaving it at 0 — i.e. the "first time"
appears NOT consumed by the other replacement, which may contradict the ruling (or Shields are special).
Pinned (possible engine/ruling mismatch to investigate).

---

### 20. Fully Armed and Operational — base attack followed by a nested play (Ezra)

**Clarification (full Q&A, condensed):**
> **Question: Does "during their previous action" mean "during their previous turn" or stricter?**
> **Answer:** Nested actions (e.g. Ezra attacks the base, then plays a card via his own trigger) are all
> within the single action, so your opponent is still considered to have attacked your base during their
> previous action (except in Twin Suns).

**Context/target:** `test/server/cards/06_SEC/events/FullyArmedAndOperational.spec.ts` (core covered at
:140 / :151).

**Findings:** Core "attacked base last action → works" is handled. The specific sub-case — a unit attacks
the base and *then plays a card via its own nested trigger* (Ezra), still counting — isn't tested. Pinned.

---

### 21. Darth Maul's Lightsaber — LKI when the upgrade is defeated by uniqueness

**Clarification (full Q&A, condensed):**
> **Question: How much of pending trigger resolution can rely on Last Known Information?**
> Darth Maul's Lightsaber: ***When Played:** If attached unit is Darth Maul, you may attack with him...*
> **Answer:** When the ability resolves, it checks the name of the unit it is attached to. If it is not
> attached to a unit, that unit cannot be named Darth Maul.

**Context/target:** `test/server/cards/05_LOF/upgrades/DarthMaulsLightsaber.spec.ts` (has a "not named
Darth Maul" block, but not the defeated-upgrade case).

**Findings:** The specific scenario — the Lightsaber itself defeated by the uniqueness rule before its
When Played resolves, so "if attached unit is Darth Maul" fails (no attached unit) — isn't covered. Pinned.

---

### 22. Chopper: War Hero — simultaneous discard (no information leak)

**Clarification (full Q&A, condensed):**
> **Question: What defines if an action can be resolved simultaneously?**
> Chopper: War Hero: ***When this unit deals combat damage to a base:** Each player discards a card.*
> **Answer:** Multiple players discarding can be done simultaneously — each chooses a card and discards at
> the same time. [Guiding principle: hidden-info choices simultaneous; open-info choices sequential.]

**Context/target:** `test/server/cards/06_SEC/units/ChopperWarHero.spec.ts:3`.

**Findings:** Both players discarding is functionally covered, but the test prompts sequentially
("starting with the active player"). The ruling's point — choices are simultaneous so no information
leaks between players — isn't asserted (and is hard to assert). Pinned.

---

### 23. Damage responsibility from undeployed leader abilities (Jabba / Jango / Dedra)

**Clarification (full Q&A, condensed):**
> **Question: Who is responsible for the damage from undeployed leader abilities?**
> **Answer:** Jabba's leader ability is considered both a leader dealing damage and a unit dealing damage.
> Dedra is the source of her damage even if the opponent chooses where. Players can't be sources of damage
> directly but can be responsible (e.g. for Bounty). Multiple cards can be the source simultaneously.
> Dedra leader can trigger JTL Boba leader.

**Context/target:** `DedraMeeroNotWastingTime.spec.ts`, Jabba (*Wonderful Human Being*), Jango leader.

**Findings:** The Jabba→Jango, Dedra→Boba, and Dedra→Bounty responsibility interactions aren't covered.
Sprawling, partly Twin-Suns. Pinned ("can't tackle until later").

---

### 24. Timing of a keyword granted in a modified play a card action

**Clarification (full Q&A, condensed):**
> **Question: What is the exact timing of a keyword being granted in a modified play a card action?**
> **Answer:** Keywords granted as part of a modified Play a Card action are granted at the Declare Intent
> step and active throughout playing that unit.

**Context/target:** Principle exercised by `BobaFettDaimyo.spec.ts:133` and
`MorganElsbethFollowingTheCall.spec.ts:200`.

**Findings:** The principle is covered. The exact combo — a unit that *gains* a keyword during the modified
play and that gained keyword enabling a cost discount (Twin Suns: Third Sister + Morgan Elsbeth) — isn't
directly tested. Pinned ("can't tackle until later").

---

### 25. Cost trigger vs modified-action nesting (Qui-Gon / Yoda / Krayt)

**Clarification (full Q&A, condensed):**
> **Question: When does an action that creates a Modified Action begin nesting triggers?**
> **Answer:** Yoda's ability triggers as part of the cost (6.4.4). Qui-Gon's action ability tells the
> player to take a modified Play a Card action; abilities triggered by that action are nested and resolve
> before the waiting abilities (Yoda) from the previous layer.

**Findings:** No coverage. A trigger from paying the *cost* of the action waits at the outer layer while
triggers from the *modified action itself* nest and resolve first. Deeply nested timing case. Pinned.

---

### 26. "Consecutive" applies to action vs turn (Kazuda pass)

**Clarification (full Q&A, condensed):**
> **Question: Does consecutive apply to 'turn' or to 'action' when passing?**
> **Answer:** "Consecutive" refers to actions, not turns. Kaz's leader ability being used to Pass will give
> the other player a chance to respond unless they've already claimed the Initiative.

**Context/target:** `KazudaXionoBestPilotInTheGalaxy.spec.ts` (both-pass-ends-phase covered at :82-84).

**Findings:** Core both-pass-ends-phase covered. The Kazuda extra-action-then-pass → opponent gets a
response window (consecutive = actions, not turns) nuance isn't tested. Pinned.

---

### 27. Defeating an HP-providing upgrade and defeat responsibility

**Clarification (full Q&A):**
> **Question: How does defeating upgrades that are providing HP to a unit factor into determining
> responsibility?**
> **Answer:** Yes, attaching or removing an upgrade from a unit can count as changing the remaining HP of
> the unit. [1.18.1.D — most recent player whose ability changed remaining HP is responsible.]

**Findings:** No coverage. Niche defeat-responsibility rule; needs a responsibility-observing effect
(Bounty / "if you defeated a unit") to test. Pinned.

---

### 28. Upgrade eligibility restrictions 3.6.3.B (Survivors' Gauntlet scenarios)

**Clarification (full Q&A, condensed):** Multi-scenario ruling on how attachment restrictions created by
the ability that made a card an upgrade persist (and "friendly"/"enemy" is determined by the upgrade's
controller) while in play — covering pilots on stolen units, Sidon Ithano, Legal Authority, and
Iden+Corvus+Eject.

**Context/target:** `test/server/cards/02_SHD/units/SurvivorsGauntlet.spec.ts` (core covered at :22, :103,
:118, :178).

**Findings:** The core eligibility principle is well-covered. The remaining sub-scenarios — Sidon to an
enemy Vehicle (Scenario 2) and Iden+Corvus+Eject (Scenarios 4/5) — may not all be present. Pinned.

---

### 29. Constant abilities are "on" immediately during game-state checks

**Clarification (social-media bullet):**
> * Constant abilities are "on" immediately when a unit enters play, even if game state checks (such as
>   uniqueness) are currently preventing effects from resolving such as a unit being defeated due to
>   remaining HP.

**Findings:** Abstract engine principle — likely exercised implicitly by +HP/aura cards, but no focused
test asserts it. Pinned.

---

## Summary

All 29 items have been addressed this pass. Most are now documented in-code as `xit` stubs; the
exceptions (handled / obsolete / deferred / already-stubbed) are noted below.

| # | Section | Item | Disposition (this pass) |
|---|---------|------|-------------------------|
| 1 | SOR/SHD | Superlaser Technician + Unrefusable Offer | **xit** — `UnrefusableOffer.spec.ts` (commented block converted to xit) |
| 2 | SHD | Spare the Target + Unrefusable Offer | **xit** — `SpareTheTarget.spec.ts` (NOTE: errata) |
| 3 | SHD | Conditional Overwhelm lost before damage | **xit** — `keyword/Overwhelm.spec.ts` |
| 4 | TWI | Clone reverts completely when defeated | **xit** — `Clone.spec.ts` |
| 5 | TWI | Capturing a token with a bounty | **xit** — `gameSystems/CaptureSystem.spec.ts` |
| 6 | TWI | Once-per-round limit on card copy | **xit** — new `scenarios/ability/AbilityLimits.spec.ts` |
| 7 | JTL | Admiral Yularen applies to later units | **xit** — `AdmiralYularenFleetCoordinator.spec.ts` (errata has landed) |
| 8 | JTL | Han Solo (Never Tell) + Plot | **xit** — `HanSoloNeverTellMeTheOdds.spec.ts` |
| 9 | JTL | Shadow Caster doubling Grim Valor | **xit** — `ShadowCasterJustBusiness.spec.ts` |
| 10 | JTL | Chewie/Han pilot onto Falcon either order | **xit** — `MillenniumFalconGetOutAndPush.spec.ts` (leader + non-leader pilot) |
| 11 | JTL | Indirect damage ignores shields / no waste | **HANDLED** — `PlanetaryBombardment.spec.ts:45` (shielded unit takes indirect, keeps shield) |
| 12 | JTL | Indirect damage to deployed Chirrut | **xit** — `ChirrutImweOneWithTheForce.spec.ts` |
| 13 | JTL | Upgrade eligibility stays when host invalid | **xit** — `core/card/Upgrade.spec.ts` |
| 14 | JTL | Pilots can't move to non-vehicle | **xit** — `keyword/Piloting.spec.ts` |
| 15 | JTL | Leader-pilot grant + Brain Invaders | **OBSOLETE** — superseded by errata; covered by `BrainInvaders.spec.ts:192` |
| 16 | SEC | Queen Amidala + Overwhelm excess-to-base | **xit** — `keyword/Overwhelm.spec.ts` |
| 17 | LAW | Tear This Ship Apart ordering | **xit** — `TearThisShipApart.spec.ts` (ties to existing TODO) |
| 18 | General | Fire Across the Galaxy choose-as-you-go | **xit** — `FireAcrossTheGalaxy.spec.ts` (NOTE: engine chooses up-front — mismatch) |
| 19 | General | Umbaran Mobile Cannon "first time" vs replacement | **xit** — `UmbaranMobileCannon.spec.ts` (NOTE: possible mismatch) |
| 20 | General | Fully Armed and Operational + nested play (Ezra) | **xit** — `FullyArmedAndOperational.spec.ts` |
| 21 | General | Darth Maul's Lightsaber LKI (defeated by uniqueness) | **xit** — `DarthMaulsLightsaber.spec.ts` |
| 22 | General | Chopper: War Hero simultaneous discard | **xit** — `ChopperWarHero.spec.ts` (NOTE: possible engine change) |
| 23 | General | Undeployed leader ability damage responsibility | **DEFERRED** — `swu_clarifications_twin_suns.md` (deeper review later) |
| 24 | General | Keyword granted at Declare Intent (gained-keyword discount) | **DEFERRED** — `swu_clarifications_twin_suns.md` (Twin Suns combo) |
| 25 | General | Qui-Gon/Yoda cost trigger vs Krayt nesting | **ALREADY STUBBED** — `KraytDragon.spec.ts:221` |
| 26 | General | Kazuda consecutive action vs turn | **xit** — `KazudaXionoBestPilotInTheGalaxy.spec.ts` |
| 27 | General | Defeating HP-providing upgrade responsibility | **xit** — `scenarios/DefeatAttribution.spec.ts` |
| 28 | General | Survivors' Gauntlet eligibility sub-scenarios | **xit** — `SurvivorsGauntlet.spec.ts` (2 stubs: Sidon, Iden+Corvus+Eject) |
| 29 | General | Constant abilities "on" during game-state checks | **xit** — `scenarios/timingWindows/DefeatTiming.spec.ts` |
