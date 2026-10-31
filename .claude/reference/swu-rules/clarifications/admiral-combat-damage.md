# Star Wars Unlimited Rules Clarifications — Admiral Q&A: Combat & Damage

> Answers from Ryan Serrano, SWU Rules Admiral. These are the highest-authority source on rules questions.
> This file covers: attack steps, Overwhelm, combat damage timing, power modifiers during combat, indirect damage, damage prevention.
> For other topics, see the other admiral-*.md files.

---

### Question: Can Excess damage rules language be updated to specify combat damage?

**CR 1.9.11** says:
*"Excess damage" refers to damage that would be dealt to a unit beyond the amount needed to defeat that unit. Abilities such as the Overwhelm keyword can affect excess damage. If a unit is defeated prior to being dealt combat damage by an attacker with Overwhelm, all combat damage that would have been dealt to the unit is considered excess damage.*

To prevent confusion it could be worded like:
*"Excess damage" refers to **combat** damage that would be dealt to a unit beyond the amount needed to defeat that unit...*

**Answer:**

I can't update 1.9.11, since "excess damage" might be used in a situation not involving combat damage someday. But I'll look at adding "combat damage" to the definition of Overwhelm.

`(Answer shared on 2026-02-10)`

-------------------------------------------------

### Question: Does "First" or "Next" apply differently if all damage was prevented?

**Umbaran Mobile Cannon**

*The first time this unit would take damage each phase, prevent that damage.*

**Vigil: Securing the Future**

*If damage would be dealt to another friendly unit, prevent 1 of that damage.*

**Shien Flurry**

*Play a Force unit from your hand. It gains Ambush for this phase. The next time it would be dealt damage this phase, prevent 2 of that damage.*

If Umbaran Mobile Cannon would take 1 damage and the controller uses Vigil's replacement effect instead, is the Cannon's "first time" used up?

Similarly, if a Shielded Force unit is played with Shien Flurry, and the controller resolves Shielded before Ambush, does the Shien Flurry damage replacement effect last beyond the consumption of the Shield token?

**Answer:**

Damage being prevented by a replacement effect does not affect whether it is the "first" or "next" time a unit would be dealt damage. In the first example, Umbaran Mobile Cannon would be dealt 1 damage, which is the first time it would be dealt damage this phase. Even if that damage is prevented by using Vigil's replacement effect instead of Umbaran Mobile Cannon's, the "first time" has occurred. If Umbaran Mobile Cannon would be dealt damage later in the phase, this is the second time it would be dealt damage this phase.

There is no rules difference between "be dealt damage" and "take damage", it's just a templating inconsistency.

The first example in 7.7.5E is indeed out of date and will be updated in CR7.

7.7.5D says: "If a replacement effect replaces all of the standard resolution of a condition, ability, or action step, the standard resolution does not resolve and is ignored. In such a case, abilities can only trigger off of the replacement effect, and not the standard resolution of the ability." This refers to triggered abilities.

`(Answer shared on 2026-02-10)`

-------------------------------------------------

### Question: If SEC Grievous is attacked by a unit with Overwhelm, is the base damaged?

**General Grievous - Scuttling to Safety** says:

***When this unit is attacked**: Return him to his owner's hand (before damage is dealt).*

**CR 6.3.2.B** says:

*If the defender is no longer in-play, no combat damage is dealt unless the attacker has Overwhelm.*

**CR 7.5.7.F** says:

*If an attacker with Overwhelm does not defeat the defender while attacking, no damage is dealt to the enemy base.*

Since Grievous will be returned to hand before combat damage is resolved, does the attacking unit with Overwhelm deal full damage to the defender's base, or does no damage occur since the defender was not actually defeated during the attack?

**Answer:**

6.3.2B is correct, and the base will be damaged by a unit with Overwhelm attacking SEC Grievous. 7.5.7F will be updated in CR7 to remove this inconsistency.

`(Answer shared on 2025-11-25)`

-------------------------------------------------

### Question: What is the timing of multiple conditional attribute modifiers?

**Gold Leader: Fastest Ship in the Fleet** says:

*While this unit is defending, the attacker gets -1/-0.*

**Vonreg's TIE Interceptor: Ace of the First Order** says:

*While this unit has 4 or more power, it gains Overwhelm. While this unit has 6 or more power, it gains Raid 1.*

**Battle Fury** says:

*Attached unit gains: "On Attack: Discard a card from your hand."*

Player A has Vonreg's TIE with Battle Fury attached, attacking Player B's Gold Leader.

For simultaneous conditional modifiers, do we add all positive modifiers before subtracting all negative modifiers, resulting in Vonreg's TIE reaching 7 power before Gold Leader brings it back down to 6? Or does the negative modifier prevent Vonreg's TIE from reaching the necessary 6 power to activate Raid?

**Answer:**

Vonreg's TIE Interceptor with an attached Battle Fury has Raid 1, which means it has +1/+0 while attacking. If it attacks Gold Leader with 6 power, its +1/+0 from Raid is applied simultaneously with Gold Leader's -1/-0, and its resulting power is 6.

To further clarify, let's say Vonreg's TIE Interceptor has been given Raid 3 by other effects. In this case, if it attacks Gold Leader, its +3/+0 from Raid still is applied simultaneously with Gold Leader's -1/-0, and its resulting power is 5. Note here that when calculating a modified power value, you add positive modifiers before subtracting negative modifiers as a way of calculating the correct power value, but the unit never actually has those power values during that calculation, only at the end. So in this example, Vonreg's TIE Interceptor never actually has 6 power for the additional Raid 1, even though you reach that value briefly while calculating its power.

`(Answer shared on 2025-11-25)`

-------------------------------------------------

### Question: For Each/Focus Fire simultaneously dealing damage?

"FOR EACH" Abilities that use the phrase "for each" to create multiple effects are resolved by determining how each effect of the ability will be resolved, then resolving all effects simultaneously.

The main point of contentions are that the clarifications seem to make a correlation that the word "simultaneously" means "combined", but nothing in the CR clarifies that.

The "FOR EACH" rule above seems pretty clear that I'm creating multiple effects in all the instances above, yet if I deal the damage all to the same target, the multiple effects get combined into one instance of damage. How is this supported in the CR?

**Answer:**

There will be an entry in CR5 to clear this up. An ability worded as "Deal 1 damage, then deal 1 damage" is two separate instances of damage. Something like "For each X, deal 1 damage" is calculated and applied as one instance of damage.

`(Answer shared on 2025-03-25)`

-------------------------------------------------

### Question: Does Lurking TIE Phantom take damage from indirect damage?

If not, is it a valid target to assign indirect damage to?

LTP text: *This unit can't be captured, damaged, or defeated by enemy card abilities.*

Indirect damage can't be "wasted" by assigning it to a unit with less remaining HP. LTP wouldn't be wasting it due to remaining HP. Damage can be assigned there; it isn't a "prevent damage" effect. It's a "can't" which takes precedence over the default rule of play.

**Answer:**

Lurking TIE Phantom can be assigned damage from indirect damage. "Can't be damaged" is a prevent effect, as clarified in CR4. We are considering the additional step of errataing LTP to use "prevent" wording but aren't 100% on that yet.

`(Answer shared on 2025-01-20)`
