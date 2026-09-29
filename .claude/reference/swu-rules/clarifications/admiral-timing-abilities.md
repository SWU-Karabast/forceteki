# Star Wars Unlimited Rules Clarifications — Admiral Q&A: Timing & Abilities

> Answers from Ryan Serrano, SWU Rules Admiral. These are the highest-authority source on rules questions.
> This file covers: modified actions, nested triggers, ability resolution windows, "during/after", sequential vs simultaneous, lasting effects timing, attack step timing.
> For other topics, see the other admiral-*.md files.

---

### Question: How do we handle Ambush triggered inside of an Attack Action?

**Jedi Starfighter** says:

***On Attack:** You may deal 1 damage to a space unit.*

**Chimaera: Reinforcing the Center** says:

***When Defeated:** Create 2 TIE Fighter tokens.*

**Wedge Antilles: Star of the Rebellion** says:

*Each friendly Vehicle unit gets +1/+1 and gains Ambush.*

**Change of Heart** says:

*Take control of a non-leader unit. At the start of the regroup phase, its owner takes control of it.*

Player A has Chimaera in play with 6 damage, and has taken control of Player B's Wedge Antilles. Player B has a Jedi Starfighter in play. Player B declares an attack using Jedi Starfighter with Chimaera defending, and resolves the On Attack ability to defeat Chimaera. Player A creates 2 TIE tokens with When Defeated; because of Wedge, those enter play with Ambush nested within the On Attack trigger.

Do we now resolve these attack actions by Player A within the attack action of Player B? If those TIE tokens ambush into Jedi Starfighter, does it still have the Raid power bonus while defending?

**Answer:**

Congratulations on finding one of my favorite weird situations! Yes, Player A's Ambushes are nested and resolve within Player B's attack. Since Player B's attack is ongoing, all "while attacking" abilities, including Raid, are still active.

`(Answer shared on 2026-02-10)`

-------------------------------------------------

### Question: Do we fully resolve a modified play a card action before applying game state checks?

**Three Lessons**
*Play a unit from your hand. It gains Hidden for this phase. Give an Experience token and a Shield token to it.*

**Supreme Leader Snoke: Shadow Ruler**
*Each enemy non-leader unit gets -2/-2.*

Player A has Supreme Leader Snoke in play. Player B plays Warzone Lieutenant (no abilities, 2 HP) using Three Lessons. Does the unit gain the Experience upgrade as it enters play in time to survive?

**CR 1.16.5.E** says: *If a unit has 0 remaining HP, it is defeated.*

Or should this be considered to only take priority AFTER a modified play a card action is fully resolved?

**Answer:**

The intention for modified Play a Card actions is that for something like "Play a unit and give an Experience token to it," the unit enters play and is given an Experience token simultaneously. I'm looking to expand the section on modified actions with CR8, which should hopefully provide more clarity.

`(Answer shared on 2026-02-10)`

-------------------------------------------------

### Question: If Corvus When Played ability is doubled, can two pilots be attached?

Player A has Qui-Gon Jinn's Aethersprite in play, and attacks, triggering the ability that the next "When Played" ability used this phase may be used again. Player A then plays Corvus.

**Corvus - Inferno Squadron Raider** says:

***When Played**: You may attach a friendly Pilot unit or upgrade to this unit.*

The attachment restriction for upgrades attached by Corvus appears to be only "attach to this unit" with no regard for how many pilots are present?

**Answer:**

Yes, the attachment restriction created by Corvus's "When Played" ability is "Attach to Corvus." If Corvus's "When Played" ability is doubled, two units may be attached to Corvus as upgrades. Note that if Corvus's "When Played" ability is used to attach a friendly Pilot upgrade to Corvus, that upgrade likely still has its original attachment restriction of "Attach to a friendly Vehicle unit without a Pilot on it." As a side-note, the example cited in 3.6.3B should say that Piloting establishes the attachment restriction "Attach to a friendly Vehicle unit without a Pilot on it." That will be fixed in CR7.

`(Answer shared on 2025-11-25)`

-------------------------------------------------

### Question: Does "during their previous action" mean "during their previous turn" or is it more strict than that?

**Fully Armed and Operational** says:

*If an opponent attacked your base during their previous action this phase, play a unit from your hand. Give it Ambush for this phase.*

Player A attacks Player B's base with Ezra Bridger, then chooses to play the top card of their deck (from Ezra's "when this unit completes an attack" ability). If Player B then plays Fully Armed and Operational, do they get to play a unit (and give it Ambush)? Or does the intervening Play a Card from Ezra disrupt that?

Further, how far does this stretch in a Twin Suns game where nested abilities cause Player B to attack Player C's base?

**Answer:**

None of the above examples involve taking multiple actions in your turn for the purposes of Fully Armed and Operational, since those actions are all nested within the single Play a Card, Attack With a Unit, or Use an Action Ability action you take. So in all examples (except Twin Suns), your opponent is considered to have attacked your base during their previous action. Currently, the only card that allows more than one action in a turn is JTL Kazuda leader, which specifies that you take an "extra action." In the Twin Suns example, Fully Armed and Operational would not work, because Player B attacked Player C's base during Player A's turn/action.

`(Answer shared on 2025-11-25)`

-------------------------------------------------

### Question: What is the exact timing of a keyword being granted in a modified play a card action?

If Morgan Elsbeth and Third Sister leaders are both deployed and attack, the next unit played gains the Hidden keyword, and has a cost discount if it shares a Keyword with a friendly unit.

Since Third Sister leader unit has Hidden, does the next unit played gain the Hidden keyword at the Declare Intent step of the Play A Card action, thus benefiting from the cost discount?

This assumption is based on Count Dooku granting Exploit, which MUST be granted during or prior to the Determine Costs step in order to function.

Would it be correct to say that any keyword granted as part of a modified play a card action is always granted as if it was a "while playing" ability, thus happening at the **6.2.1 Declare intent** step?

**Answer:**

Yes, keywords that are granted as part of a modified Play a Card action are granted at the Declare Intent step and active throughout playing that unit.
This was a recent change the team decided, different from the temporary answer provided at Galactics.
All keywords will be granted at the same time to standardize the process and minimize casual players needing to know the intricacies of the Play a Card steps.
CR6 will further clarify this.

`(Answer shared on 2025-09-29)`

-------------------------------------------------

### Question: When is a conditional keyword checked?

Player A has SOR Admiral Ackbar in play, as well as LOF Oppo Rancisis, and has just played Clone as a copy of Oppo Rancisis.

Due to RESTORE 1 on Ackbar, both copies of Oppo have RESTORE 2.

Player B attacks and defeats Ackbar.

Do the Oppo units retain RESTORE 2 because they see it on each other, or do they both lose the keyword since no unit in play has it printed?

**CR 7.3.3** says:
*Some constant abilities continuously check the game for a specific condition to be met for their effects to apply to the game. These abilities usually include the word "while."*

**Answer:**

Once Ackbar leaves play, the Oppos no longer have Restore, as there must be a non-conditional ability or active conditional ability for them to "see" still in play.
The idea is that if the conditions of multiple conditional constant abilities only are met by each other, they are not considered met.
This will be clarified in CR6.

`(Answer shared on 2025-09-29)`

-------------------------------------------------

### Question: Does LOF Third Sister leader unit ability grant the Hidden keyword permanently?

LOF Third Sister - Seething With Ambition deployed as a unit has **On Attack:** *The next unit you play this phase gains Hidden.*

Most abilities that grant a keyword have specified a duration, including the other side of this leader. Is Third Sister's ability granting the keyword permanently?

Even though Hidden has an effect that only lasts for a phase, the existence of the keyword itself past that point matters for abilities that look for the existence of keywords.

**Answer:**

Third Sister does not give Hidden permanently. This has been addressed with an erratum which was released with LOF.

`(Answer shared on 2025-09-29)`

-------------------------------------------------

### Question: Does JTL Admiral Yularen ability apply to units not in play when the trigger resolves?

**Admiral Yularen** says:
*When played: Choose Grit, Restore 1, Sentinel, or Shielded. While this unit is in play, each friendly Vehicle unit gains the chosen Keyword.*

**CR 7.7.3.D** says:
*By default, a lasting effect only applies to a card that's in play at the time of the lasting effect's creation.*

Per this rules text, only things in play at the time the trigger resolves could benefit, which makes the use of Shielded as one of the keyword options seem strange, as it would be granting a keyword that can't trigger.

**Answer:**

Admiral Yularen's lasting effect is intended to function like a constant ability, much like SOR Admiral Piett unit. It applies both to units already in play and units that are played after the ability triggers. We'll make an erratum for this card.

`(Answer shared on 2025-09-29)`

-------------------------------------------------

### Question: How does JTL Han Solo Leader deploy interact with Plot?

**JTL Han Solo - Never Tell Me The Odds** says:

***When deployed as an upgrade:** For each friendly unit or upgrade that has an odd cost, ready a resource.*

The behavior of Plot keyword appears to be like a "when your leader deploys" triggered ability. If you want to use Han's deploy triggered ability to ready resources in order to then play more plot cards, how does that work?

**Answer:**

All cards you intend to play with Plot must be revealed when you deploy your leader (in the same way as LOF Rey, to show that the ability is triggering). Then, each Plot must be played one at a time. Just like Smuggle, Plot cards and the cards that replace them from the deck enter play at the same time, so you will always have the same number of resources while you resolve Plots. JTL Han will be able to ready those resources if you sequence appropriately.

`(Answer shared on 2025-09-29)`

-------------------------------------------------

### Question: Can deployed JTL Thrawn leader unit double SEC Arihnda Pryce if Thrawn is the chosen friendly unit?

**Arihnda Pryce - On The Road To Power** says:

***When Defeated:** You may defeat another friendly unit. If you do, deal 4 damage to each enemy base.*

**Grand Admiral Thrawn - ...How Unfortunate** says:

***When you use a "When Defeated" ability:** You may use that ability again. Use this ability only once each round.*

Let's say that Thrawn is deployed in play as a unit, and Pryce is defeated. When resolving the When Defeated ability, the controller chooses Thrawn as the friendly unit to defeat. Does Thrawn's ability trigger, and can it still be resolved as a nested ability even though he is no longer in play?

**Answer:**

Thrawn's ability will trigger in this scenario. Choosing to resolve an ability is "using the ability," so Thrawn will see it happen even if he is defeated as part of that ability.

`(Answer shared on 2025-09-29)`

-------------------------------------------------

### Question: Does consecutive apply to 'turn' or to 'action' when passing?

Scenario 1: P1 passes. Player 2 uses Kazuda Xiono leader action then Claims initiative. Should P1 have had a chance to respond?

Scenario 2: P1 passes. Player 2 uses Kazuda Xiono leader action then also passes. Is the Action phase over?

**CR 1.4.4** says: *Players continue taking turns this way until each player has passed consecutively, which ends the action phase.*

**CR 1.15.6.D** says: *When each player has passed consecutively (including when one player takes the initiative after their opponent passes), the action phase immediately ends.*

Does consecutive apply to 'turn' or to 'action'?

**Answer:**

The intention is that "consecutive" refers to actions, not turns. The appropriate CR entries will be updated in CR5 to make this clear. Kaz's leader ability being used to Pass will give the other player a chance to respond unless they've already claimed the Initiative.

`(Answer shared on 2025-05-19)`

-------------------------------------------------

### Question: If JTL Lando uses his leader ability to play Brain Invaders, is the shield token still able to be placed?

Assume there is already a friendly unit in the space arena.

Lando's ability says:
*Play a unit from your hand (paying its cost). If you do and you control a ground unit and a space unit, give a Shield token to a unit.*

Brain Invaders says:
*Each leader loses all abilities except for epic actions and can't gain abilities.*

Since the costs were paid, it seems the entire ability still needs to finish resolving and thus a shield token would be able to be placed, despite leaders losing their abilities when the unit enters play, prior to the shield token being placed. Is that correct?

**Answer:**

Brain Invaders cannot blank a currently resolving ability. Lando loses the ability, but the ability that has already begun resolving resolves in full.

`(Answer shared on 2025-05-19)`

-------------------------------------------------

### Question: If a lasting effect is created by another lasting effect expiring at the same timing point, what happens?

Assume Desperate Commando is buffed by Overwhelming Barrage, and has two damage tokens. At the end of the Action phase, the lasting effect expires, defeating the Desperate Commando. This triggers its When Defeated ability, which creates a lasting effect which would expire at the end of the phase, but we are already at that point.

Do we loop through the "cleanup" at the end of phase repeatedly until nothing remains, or have we passed the timing point and now "this phase" in the effect actually refers to the regroup phase?

**Desperate Commando**: *When Defeated: You may give a unit -1/-1 for this phase.*

**Answer:**

The end of a phase is a moment in time. At the end of the action phase, Desperate Commando's buff wears off and it's defeated, which triggers its "When Defeated" ability. When resolving and applying the effects of this ability, the action phase is already over, so the debuff will last until the end of the regroup phase.

`(Answer shared on 2025-05-19)`

-------------------------------------------------

### Question: Is the text of Heroic Sacrifice all one modified action?

The "draw a card" portion of Heroic Sacrifice is written in the same sentence as the modified action created by the attack. Is it also part of the modifications that create a modified action, or is it a separate ability?

An example where this matters: Active Player plays Heroic Sacrifice with an SOR Bossk in play. Non-Active Player has Seasoned Fleet Admiral in play. Since Seasoned Fleet Admiral triggers from the "draw a card" component, would it be Bossk resolving last and the Seasoned Fleet Admiral would resolve after the attack but before Bossk?

**Answer:**

"Draw a card" is not part of the modified attack action. AP plays Heroic Sacrifice to draw a card and attack with a unit. Bossk triggers from playing the card, and Seasoned Fleet Admiral triggers from drawing a card, but neither can resolve until the current action is finished resolving. Heroic Sacrifice tells AP to take a modified Attack with a Unit action, and all the triggers resulting from that are nested. Once the attack and resulting triggers are fully resolved, we can turn to resolving waiting triggers (Bossk and SFA).

`(Answer shared on 2025-05-19)`

-------------------------------------------------

### Question: When does an action that creates a Modified Action begin nesting triggers?

Player A has LOF *Qui-Gon Jinn Student of the Living Force* leader, and the Force is with them. They have two units in play, *Yoda, My Ally is the Force* and a *Nightsister Warrior*.

Player A activates the leader ability, paying the cost which triggers Yoda. Yoda is returned to hand to play a second *Nightsister Warrior* for free, triggering Krayt Dragon.

Do the pending triggers from Yoda and Krayt both resolve in the same layer nested in the Modified Play a Card action? Or does Yoda wait to resolve after the Modified Action, including Krayt, is resolved, as it was triggered by paying the cost?

**Answer:**

In order to activate the leader ability, Player A takes the Use an Action Ability action. Yoda's ability triggers as a part of the cost of this action (6.4.4). Qui-Gon Jinn's action ability in turn tells the player to take a modified Play a Card action. Abilities triggered by this Play a Card action are nested and must resolve before the waiting abilities from the previous layer.

`(Answer shared on 2025-09-29)`

-------------------------------------------------

### Question: Can LOF Kylo Ren leader play an upgrade that entered the discard during resolution of the When Deployed trigger?

**LOF Kylo Ren - We're Not Done Yet** leader:
***When Deployed:** Play any number of upgrades from your discard pile on this unit (one at a time, paying their costs).*

Scenario 1: AP has Snapshot Reflexes and Battle Fury in discard. AP deploys Kylo, plays Battle Fury, then Snapshot Reflexes. Snapshot Reflexes triggers an attack via Ambush, and Battle Fury's On Attack discards Sith Holocron from hand. Since Kylo's When Deployed trigger is still resolving, can AP now play Sith Holocron?

Scenario 2: AP has Pillio Star Compass x2 in discard. AP deploys Kylo, plays Pillio Star Compass x1 from discard, searches/draws via its WP ability. The existing Pillio is defeated and goes back to discard. Can AP play Pillio Star Compass from discard again as part of the same When Deployed trigger?

**Answer:**

Yes, the ability instruction "Play any number of cards" does not create a subset of legal cards at the beginning, and only checks what cards are legal choices when you go to play a new card. "Attack with 2 units" functions similarly, where you can wait to see how the first attack resolves before choosing which unit to attack with second. Note that Scenario 2 only works because when you play Pillio Star Compass from the discard pile, it enters play as a new copy of Pillio Star Compass.

`(Answer shared on 2025-09-29)`

-------------------------------------------------

### Question: Does "and" templating refer to sequential or simultaneous ability resolution?

Should both effects in a single sentence written with an "and" be considered simultaneous or sequential?

Example, SOR Palpatine leader action ability:

*Deal 1 damage to a unit and draw a card.*

**Answer:**

Resolve the ability in order. Deal 1 damage to a unit, then draw a card. We will consider making future templating use "then" in these instances to reduce confusion.

`(Answer shared on 2025-04-30)`

-------------------------------------------------

### Question: Timing in Twin Suns of when an opponent is defeated vs the healing reward?

If Confederate Tri-Fighter is in play preventing base healing in the final phase of the game and the controlling opponent is the first to be eliminated, would the player that caused that elimination be able to claim the healing?

Basically, is 11.3.1 resolved first, before 12.6.2 is applied?

**CR 12.6.2** says: *Any player who eliminates another player immediately heals 5 damage from their own base.*

**Answer:**

All of a defeated player's cards are removed from game before the player that knocked them out heals 5 damage from their base. CR5 will add more clarity to the order of operations here.

`(Answer shared on 2025-03-25)`

-------------------------------------------------

### Question: Do triggered abilities resolve during attack steps or in between/after attack steps?

Using Leia leader with 4 ready Rebels: Attack with Ezra, complete the attack, triggering Ezra's "when this unit completes an attack" ability to reveal and play Rebel Assault. Rebel Assault allows attacking with 2 more Rebel units. Do the attacks from Rebel Assault occur as part of Ezra's trigger (in the middle of the Leia attack) or after?

**Answer:**

"When this unit completes an attack" has to see the attack complete in order to trigger, much like "When Played" has to see the card enter play. When resolving a "When this unit completes an attack" triggered ability, the attack has already been completed (6.3.3A). The full resolution sequence:

* We use Leia leader's action ability, which lets us attack with 2 Rebel units. 7.1.7 tells us to make those attacks sequentially, with any nested abilities from the first attack resolved before moving on to the second.
* We use our first attack to make a modified attack action with Ezra. We follow all the normal rules for attacking with a unit in 6.3.1-3.
* We complete our attack with Ezra. Since he's still in play, his ability triggers on the completion of the attack. Since this triggered during or as a result of our first attack action, we need to resolve it before moving to our second attack action.
* We resolve Ezra's ability, revealing Rebel Assault.
* We play Rebel Assault, which lets us attack with 2 Rebel units. 7.1.7 tells us to make those attacks sequentially, with any nested abilities from the first attack resolved before moving on to the second.
* We make two more modified attack actions with Rebel units.
* We finally are done resolving abilities that triggered during our first Leia attack, so we can now proceed to our second Leia attack.

`(Answer shared on 2025-03-25)`

-------------------------------------------------

### Question: Is there any rules text mitigating an infinite loop?

Assume both players have a Snoke and 2 Clone cards in play that cloned Snoke, all with an experience token. A player plays a Stolen AT-Hauler. If neither player refuses to play the free Hauler every time it is immediately defeated, we are now stuck in an infinite loop.

How do we handle this kind of loop per comprehensive rules?

**Answer:**

There are three kinds of infinite loops: a single-player loop that one player can pull off entirely by themselves; a two-player loop in which both players must cooperate; and a forced loop in which the game state can't resolve. A single-player or forced loop is not currently possible in the game, but it's a good idea to add a line or two to the CR (most likely: decide an arbitrary number of loops and then move on). How to resolve a two-player loop falls more under the collusion rules of the Tournament Regulations.

`(Answer shared on 2025-03-25)`

-------------------------------------------------

### Question: Is a triggered ability with a '/' separating multiple triggering conditions one ability or multiple abilities?

**CR 7.6.2** says: *If a triggered ability has a forward slash ('/') separating multiple triggering conditions, the ability triggers for each of those conditions. Such an ability is considered both a "When Played" and a "When Defeated" ability.*

The language here seems to reference one single ability. So does Grand Admiral Thrawn double the "When Played" ability on an Elite P-38 Starfighter, since per CR it counts as a When Defeated ability?

**Answer:**

"When Played/When Defeated" is a concatenation of two abilities, a "When Played" ability and a "When Defeated" ability. You cannot use Grand Admiral Thrawn to double the "When Played" ability.

`(Answer shared on 2025-03-25)`

-------------------------------------------------

### Question: With the changes to smuggle explicitly stating that it is always a modified action, how does this impact nested triggers and especially Hondo Leader?

**Answer:**

Nested Trigger Scenarios with Hondo

Scenario #1

Board state: Hondo leader
* I take a modified Play a Card action to Smuggle Weequay Pirate Gang from my resource row (Hondo and Ambush trigger).
  * I resolve Hondo/Ambush in either order.

Scenario #2

Board state: Hondo leader
* I take a modified Play a Card action to Smuggle Timely Intervention from my resource row (Hondo triggers).
  * TI tells me to take a modified Play a Card action. I play Lieutenant Childsen from hand (Ambush and Childsen's WP trigger).
  * I resolve the WP/Ambush in either order.
* I resolve Hondo.

In the first example, both WPG's Ambush and Hondo's ability are "abilities triggered during or as a result of" the modified action that is Smuggling WPG. They are resolved in the same window.

In the second example, Hondo is triggered as a result of playing TI and resolves after you're finished resolving TI's event ability. That event ability is taking another action, though, and that modified action triggers other abilities that need to resolve before you can go back and resolve Hondo.

`(Answer shared on 2025-03-06)`

-------------------------------------------------

### Question: What timing needs to be considered in 6.2.3.A Determine Costs?

Player A has a JTL Krennic unit in play. Player A plays a Battle Droid Legion, exploiting the Krennic unit. The Battle Droid Legion is the first unit played this round by Player A. Does it cost 7 or 6, assuming no aspect penalty? Since Krennic is in play for determining costs, does his constant ability apply the discount, or does Exploit defeating Krennic mean his discount can't be applied?

**Answer:**

You can apply discounts in any order you want, so you can apply Krennic's -1 discount and then exploit him for an additional -2.

`(Answer shared on 2025-02-18)`

-------------------------------------------------

### Question: Is it the potential for multiple actions or the actual existence of multiple actions that requires the sequential resolution and thus nesting of triggered abilities in 7.1.7?

**CR 7.1.7** says: *If an ability instructs a player to take multiple actions (e.g. "Play three cards," "Attack with two units"), that player performs each action sequentially. Any abilities triggered during or as a result of each action are considered nested abilities, and must be resolved before proceeding to the next action.*

If only a single unit is played by a U-Wing Reinforcements, are those When Played triggered abilities nested?

**Answer:**

We are moving forward by separating the "nested" rule from the "sequential" rule in CR4. With some possible wording adjustments, CR4 will say: If an ability instructs a player to take a modified action, any abilities triggered during or as a result of that action are considered nested abilities. If an ability instructs a player to take multiple actions, that player performs each action sequentially. Any nested abilities must be resolved before proceeding to the next action.

`(Answer shared on 2025-01-20)` `(Editorial note: this led to the change in CR4 that all triggers from a modified action are nested)`

-------------------------------------------------

### Question: What is the exact timing of deployed leader unit Bossk's triggered ability?

Since it triggers on the collection of a bounty, it is always triggered by the resolution of a triggered ability. Does this mean the second bounty resolution is always nested inside the first bounty resolution?

Example: Player 1 has deployed Bossk and Wampa in play, and a Snowtrooper Lieutenant in the top 5 of the deck. Player 2 has Clone Trooper with Bounty Hunter's Quarry attached. Player 1 attacks and defeats Clone Trooper with Bossk, resolves bounty by playing Snowtrooper Lieutenant. Can Player 1 choose to resolve Bossk's ability again before resolving the Snowtrooper (granting an attack to Wampa)?

**Answer:**

Bossk leader's triggered ability triggers when you collect a Bounty, which 7.5.13D defines as resolving a Bounty ability. 7.6.11 says that all abilities triggered while resolving a triggered ability A are nested, so Bossk's ability is always nested.

`(Answer shared on 2025-01-20)`
