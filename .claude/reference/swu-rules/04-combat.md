# 6. Action Timing and Clarifications — Combat

> Source: Star Wars Unlimited Comprehensive Rules v7.0 (3/6/26)
> See also: 05-keywords.md for Sentinel, Saboteur, Overwhelm, Grit, etc.

---

## 6.1 General Notes on Actions

- 6.1.1 For each action type (Play a Card, Attack With a Unit, Use an Action Ability), perform each step in order and as completely as possible.
- Note: Subheadings in this section begin with 0 for clarity when referring to steps.

---

## 6.2 Play a Card

### 6.2.0 General

- a. Follow these steps when taking the Play a Card action, or when resolving any ability that lets a player play a card.
- b. Player must have a card in hand or be resolving an ability that allows playing from another zone. Must be able to pay the cost.
- c. A player may play a card whose ability has no effect, as long as playing/paying changes the game state.
- d. Each time a card is played, it enters play as a new copy of that card.
- e. Unless an ability specifies otherwise, cards must be played from hand, and all costs must be paid.

**Five steps:**

### 6.2.1 Declare Intent
The player reveals the card they intend to play (and how, if it can be played as multiple types).
- a. If the card can be played as multiple types, declare which (e.g., unit vs. upgrade for a Piloting card).
- b. If a modified "Play a Card" action grants an ability conditional on a later step, the ability is granted immediately once the condition is satisfied.

### 6.2.2 Check Restrictions
Determine if any abilities, effects, or play restrictions would prevent the card from being played. If so, the card cannot be played.
- a. "Can't play" abilities are play restrictions.
- b. "Attach to" text is a play restriction for upgrades. If no eligible unit is in play, the upgrade can't be played.
- c. An event can be played even if none of its ability would change the game state.
- d. If the declared card can't be played: choose a different eligible card or take a different action.

### 6.2.3 Determine Cost(s)
Start with printed cost. Apply any modifiers that increase cost (including aspect penalty) before decreases. Result = modified cost.
- a. See 8.16 (Modifiers) for the full order.
- b. Cost can't be modified below 0.
- c. Also determine any additional costs at this step.
- d. "For free" bypasses all resource costs including aspect penalty; additional non-resource costs still apply.
- e. Cost modifiers may be applied in any order the player chooses, as long as increases are applied before decreases.

### 6.2.4 Pay Cost(s)
Exhaust resources equal to modified cost. Pay additional costs if any.
- a. If any cost can't be paid, cease without paying anything. Return game state to before step 1.
- b. Cannot pay resources in excess of modified cost.
- c. If a replacement effect replaces a cost, the cost is considered paid as long as the replacement can be resolved.
- d. Costs may be paid in any order.

### 6.2.5 Put Card Into Play / Discard
- a. **Unit**: Put into play in its designated arena (ground or space), exhausted.
- b. **Upgrade**: Put into play attached to an eligible unit.
- c. **Event**: Place in owner's discard pile, then resolve its ability.
- d. The card is "played" as soon as it enters play or, for events, the discard pile.

After playing the card: resolve any "When Played" abilities on the card and any other abilities that triggered while playing/resolving it, including Ambush and Shielded.

---

## 6.3 Attack With a Unit

### 6.3.0 General

- a. Follow these steps when taking the Attack With a Unit action, or when resolving an ability that allows attacking.
- b. Only one unit may attack at a time. Only ready units may attack unless otherwise specified. A player may only attack with units they control and only target enemy units or bases.
- c. **"Combat damage"**: damage dealt during the "End attack" step when units deal damage equal to their power. Damage outside this step is not combat damage. Damage from triggered abilities is not combat damage.
- d. When an ability allows attacking, the player must make an attack if possible. Attacking due to an ability is not an additional action.
- e. **Five steps**: Declare intent → Check restrictions → Begin attack → Calculate combat damage → End attack.

After ending the attack: resolve "When Attack Ends" abilities and any other triggered abilities, excluding those already resolved in the "On Attack" step.

### 6.3.1 Declare Intent
The attacking player chooses a ready unit they control (the **attacker**) and an enemy unit in the same arena or the opponent's base.
- a. The attacking player becomes the "attacking player." The opponent who controls the unit/base being attacked is the "defending player."
- b. If attacking a unit: that unit is the "defending unit," and the attacker is "attacking a unit." If attacking a base: there is no "defending unit," and the attacker is "attacking a base."

### 6.3.2 Check Restrictions
Determine if the attack is valid and no abilities prevent it.
- a. The attacker must be ready and in the same arena as the defending unit (if attacking a unit). Abilities may override.
- b. **Sentinel**: If the defending player has one or more units with Sentinel in the attacker's arena, one of those must be the defending unit — unless the attacker has **Saboteur**, which lets it ignore Sentinel.
- c. If the attack declaration is invalid, return the game state to before the attack was declared.

### 6.3.3 Begin Attack
**Exhaust the attacker.** "While attacking" and "while defending" abilities become active, including Raid.

Then, trigger all "On Attack" abilities on the attacker, all "On Defense" abilities on the defending unit/base, and any other abilities that trigger in this step, including Restore and Saboteur.

- a. "While attacking/defending" abilities with further conditions are only active while all conditions are true.
- b. All waiting abilities resolve before proceeding to the next step.
- c. If the attacker or defending unit is defeated or removed from play during this step, still proceed with the other steps.

### 6.3.4 Calculate Combat Damage
Determine how much damage will be dealt.
- a. If attacking a base: attacker deals damage equal to its current power to the base. If attacking a unit: both units simultaneously deal damage equal to their current power to each other.
- b. If the attacker is no longer in play: no combat damage is dealt. Proceed directly to the next step.
- c. If the defending unit is no longer in play: no combat damage is dealt unless the attacker has **Overwhelm**.
- d. **Overwhelm**: If attacking a unit, the attacker deals enough damage to defeat the defending unit, and all excess damage to the defending player's base. If the defending unit wouldn't be defeated (e.g., blocked by a Shield), there is no excess damage and no base damage.

### 6.3.5 End Attack
Attacking and defending units deal combat damage. "When Attack Ends" abilities trigger. Abilities active during the attack expire.
- a. If a unit has no remaining HP after combat damage, it is defeated immediately.
- b. If the attacker is defeated by combat damage, its "When Attack Ends" abilities still trigger.
- c. If an ability lets a unit deal combat damage before another unit, the second unit must survive the dealt damage before dealing back. If the second unit has **Grit**, it receives bonus power from damage already dealt to it.
- d. After all combat damage is dealt, resolve "When Defeated" abilities and other triggered abilities, including "When Attack Ends" abilities. Abilities that were active for the attack are no longer active while resolving these.

---

## 6.4 Use an Action Ability

### 6.4.0 General

- a. Follow these steps when taking the Use an Action Ability action, or when an ability allows using an action ability.
- b. Action abilities begin with bold "Action" or "Epic Action" followed by a cost in brackets, a colon, and an effect.
- c. To use an action ability, the player must be able to pay its cost (if any) and change the game state.
- d. A player may use an action ability whose effect doesn't change the game state, as long as paying the cost does.
- e. May use even if the ability references a unit type that's not in play, as long as the cost or effect changes the game state.
- f. May use a conditional action ability even if the condition is false, as long as the cost or effect changes the game state.

**Five steps:**

### 6.4.1 Declare Intent
Indicate the ability to resolve.

### 6.4.2 Check Restrictions
Determine if any abilities or restrictions would prevent it.
- a. The key restriction: paying the cost AND/OR resolving the effect must change the game state.

### 6.4.3 Determine Cost(s)
Determine the cost in brackets following "Action."
- a. If the cost uses the exhaust icon (◉), the card must exhaust to use the ability. If not, the card may be ready or exhausted.
- b. Costs with multiple parts are separated by commas.

### 6.4.4 Pay Cost(s)
Pay the determined cost. Skip if no cost.
- a. If any part can't be paid, cease without paying anything. Choose a different action.
- b. Cannot pay resources in excess of the determined cost.
- c. Replacement effects that replace a cost are still considered paid.

### 6.4.5 Resolve the Ability
Resolve as much as possible; ignore what can't resolve.
- a. If the ability causes an attack, resolve abilities triggered during the attack at the appropriate timing points.
- b. If the effect doesn't change the game state, it still counts as the player's action as long as the cost changed the game state.
