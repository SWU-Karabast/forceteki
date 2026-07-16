# SWU Rules Clarifications — Organized by Set

---

## General (Non-Card-Specific)

### Question: Does 'exchange' allow for a one-sided trade?

**Double-Cross**
*Choose a friendly non-leader unit and an enemy non-leader unit. Exchange control of those units. The Player who takes control of the lower-cost unit created Credit tokens equal to the difference between those units' costs.*

**Rey: Skywalker**
*Opponents can't take control of this unit.*

'Exchange' is a common term in other games that may have very specific implications, however the mechanics of 'exchange' are not defined in the rules here.

Is 'exchanging control' distinct from 'taking control' in the rules?

Assume Player A has Rey in play, and Player B has a basic 5 cost unit such as **Desperado Freighter**. Player A plays Double-Cross.

What happens if Player A chooses Rey as their friendly unit?

* Is 'exchanging control' distinct from 'taking control' in the rules or is Rey immune to Double-Cross?
* If an opponent can't take control of Rey, does that mean nothing happens?
* Or does Player A take control of the chosen enemy unit and keep Rey?
  * If so, does Player A still gain credit tokens?

**Answer:**

“Exchange control” is a shorthand for “Two players each take control of a unit the other controls” and is governed by the same rules as “take control” effects. For Rey and Double-Cross:

* Yes, you can choose Rey with Double-Cross (she won't be swapped though).
* If you choose Rey and a lower-cost unit, the player who takes control of the lower-cost unit creates Credits.
* If you choose Rey and a higher-cost unit, no one creates Credits.

Basically, each reference to "those units" in Double-Cross refers to "the chosen units", regardless of whether they swapped.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: What is the timing of delayed effects vs triggering an ability?

**Sneak Attack**
*Play a unit from your hand. It costs 3 Resources less and enters play ready. At the start of the regroup phase, defeat it.*

**Contracted Hunter**
***When the regroup phase starts:** Defeat this unit.*

**Discerning Veteran**
***When Played:** This unit captures an enemy non-leader ground unit.*

Player A plays Discerning Veteran via Sneak Attack, and captures Player B's Contracted Hunter.

When regroup phase starts, the delayed effect from Sneak Attack defeats Discerning Veteran, rescuing Contracted Hunter.

Is Contracted Hunter back in play before or after the timing point of the triggering condition of "When the regroup phase starts" ?

**5.5.1.A**
***Start of the regroup phase.** Any lasting effects that expire when the regroup phase starts expire now. Any abilities or effects that trigger at the start of the regroup phase trigger now.*

Possible interpretations:

* Sneak Attack's delayed effect defeats the unit, rescuing Contracted Hunter. Contracted Hunter's Phase Trigger triggers when all Delayed Effects are done, and it is defeated.
* Contracted Hunter is not defeated until the next regroup phase, because it was out of play for the trigger condition timing of the start of this regroup phase.

Possible rewrite:

* 5.5.1.A
  * Start of the regroup phase. The following happens in order:
    * Expire any lasting effects that expire when the regroup phase starts.
    * Any triggered abilities that trigger at the start of the regroup phase trigger now.
    * Resolve any delayed effects that trigger at the start of the regroup phase.
    * Resolve any pending triggered abilities from the start of the phase, or the resolving or expiring of above effects.

Or

* 5.5.1.A
  * Start of the regroup phase. The following happens in order:
    * Any triggered abilities that trigger at the start of the regroup phase trigger now.
    * Expire any lasting effects that expire when the regroup phase starts.
    * Resolve any delayed effects that trigger at the start of the regroup phase.
    * Resolve any pending triggered abilities from the start of the phase, or the resolving or expiring of above effects.

**Answer:**

The start of the regroup phase is intended to be treated as a single moment in time, so lasting effects expire at the same moment the “When the regroup phase starts” trigger happens. This means that if a unit enters play as a result of a lasting effect expiring at that moment in time, it is not in play to see the trigger window. In the given example, Contracted Hunter’s ability does not trigger. We will discuss the idea of breaking these moments in time down into substeps.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: What defines if an action can be resolved simultaneously?

**Chopper: War Hero**
***When this unit deals combat damage to a base:** Each player discards a card from their hand.*

**CR 7.1.4**
*If an ability that affects both players can be resolved simultaneously, resolve the ability simultaneously. Otherwise, the player that controls the card with the ability can choose the order in which each player is affected by the ability.*

In order to resolve Chopper's ability, does the active player choose who discards first, or should this be resolved simultaneously?

If resolving simultaneously, a line in 7.1.4 could be added to address simultaneous card handling, such as: "Each player will first choose a card, and then perform the discard at the same time."

**Answer:**

Yes, multiple players discarding a card can be done simultaneously, so each player should choose a card in their hand and discard them at the same time. This is important for any effect that, if performed sequentially, would reveal information to one or more players that could influence their decisions. 

`(Answer shared on 2026-05-06)`

`Editorial note: The following guiding principle has been approved to share until the CR can be updated to flesh it out better:`

> If there's hidden information, players make the choice simultaneously, and then execute after all decisions have been made. (As covered explicitly in this question).
> 
> If it's open information (rhydonium) and a choice is made, it can't be simultaneous, and therefore is sequential.
> 
> If it's open information but no choice is made, it's simultaneous.

-------------------------------------------------


### Question: If multiple effects modify printed attributes, which takes precedence?

* Obi-Wan Kenobi: Protector of Felucia
  * While you control 7 or more units, their printed power is considered to be 7 and printed HP is considered to be 7.
* Size Matters Not
  * Attached unit's printed power is considered to be 5 and its printed HP is considered to be 5.
* Adventurer Sniper Rifle
  * Attached unit gains: "Action []: Choose an undamaged non-leader ground unit. Its printed HP is considered to be 1 for this phase."
* 7.7.3.C
  * Multiple lasting effects can apply to the same unit at the same time. If a new lasting effect conflicts with an existing lasting effect, the new effect takes precedence.

We now have more than 1 card that can apply a constant effect or a lasting effect that sets a printed attribute to be considered as a particular value.

If more than one of these effects are present, which one is used? if they were all lasting effects, we could apply 7.7.3.C, and always use the most recent, however there does not seem to be any rules text governing whether a lasting effect overrides a constant effect or vice versa.

**Answer:**

Yes, 7.7.3C is the same reasoning that applies in this case, and the most recent attribute adjustment applies. A relevant entry will be in CR8.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: Does a triggered ability doubled by a delayed effect nest in the same way as a triggered ability doubled by a triggered ability?

* Qui-Gon Jinn's Aethersprite: Guided by the Force
  * **On Attack:** The next time you use a "When Played" ability this phase, you may use that ability again.
* Ki-Adi-Mundi: We Must Push On
  * **When Played:** You may use the Force (lose your Force token). If you do, draw 2 cards.
* The Father: Maintaining Balance
  * **When you use the Force:** You may deal 1 damage to this unit. If you do, the Force is with you.
* 7.7.4.B
  * Delayed effects resolve automatically and immediately after their specified timing point or future condition occurs, before any other abilities triggered by that timing point or condition.
* 7.7.4.D
  * When a delayed effect resolves, it is not treated as a new triggered ability, even if the delayed effect was originally created by a triggered ability.
* 7.6.11
  * After resolving a triggered ability “A”, if any new abilities were triggered while resolving it, the new abilities are considered “nested abilities” and must be resolved before any other abilities triggered at the same time as ability “A”.*

Assume that Player A has The Father and Aethersprite in play, and attacks with Aethersprite.

* On their next turn they play Ki-Adi-Mundi, triggering Ki-Adi-Mundi's When Played ability.
* When resolving KAM's When Played ability, using the force triggers The Father, and also consumes the Aethersprite's delayed effect.
* We now have a second KAM's When Played ability and The Father pending resolution, nested inside KAM's first When Played ability.
* Can the resolution of those two nested abilities be ordered to generate the Force again before resolving the second KAM's When Played ability, or must the doubling of the ability be performed first because it results from a delayed effect instead of from a triggered ability?

**Answer:**

Qui-Gon Jinn’s Aethersprite will be errata’d to fall more in line with the existing structure. The additional “When Played” use will be handled the same rules that govern simultaneous and nested triggered abilities.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: When control is reverted immediately from a delayed effect expiring, do we apply game state checks?

* Maul: Master of the Shadow Collective
  * Overwhelm
  * **When Attack Ends:** If this unit dealt combat damage to a player's base, you may take control of a non-leader unit that player controls. When this unit leaves play, that unit's owner takes control of that unit.
* 7.7.4.F
  * If an ability creates a delayed effect such that the only possible timing point or condition of expiration has already occurred, the effect resolves immediately upon creation.
  * If DJ has already left play when this ability is resolved, the delayed effect resolves immediately, and the chosen resource’s owner takes control of that resource.
* 1.16.5
  * In order to maintain the game state, certain situations require immediate resolution and take priority over other waiting triggered abilities or action steps. If any of these situations arise, resolve them immediately as specified below before continuing with the game. If multiple situations are present at the same time, resolve them in the order of priority below until no such situations remain.

Assume Player A attacks a unit with Maul that will defeat him with combat damage, but he will also defeat the defender, such that Overwhelm damage is applied to base.

His "When Attack Ends" doesn't require him to survive the attack, so Player A takes control of Player B's Snoke, which is then immediately returned to Player B per 7.7.4.F.

Since this is a delayed effect resolving, and not a modified action, does Player B have to defeat all of their units with 2 or less remaining HP, or does Snoke change control back and forth before game state checks are resolved?

Both the resolution of delayed effects and game state checks are said to be "immediate" in the CR, which takes priority?

**Answer:**

7.7.4F will be adjusted in CR8 to cancel the effect entirely in a DJ/Maul situation, rather than the current “immediate undo”.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: How are Credits intended to work with edge case interactions?

**Curious Flock**:

***When Played:** Pay up to 6 Resources. For each resource paid this way, give an Experience token to this unit.*

**From the official database Additional Rulings**:

*07/14/2025 - Curious Flock's "When Played" ability is not reduced by effects that reduce the cost of cards.*

**Credit** token:

*While paying resources, you may defeat this token. If you do, pay 1 less.*

**3.7.13**:

*A Credit token is a type of token with name “Credit,” subtype “Credit Token,” the Supply trait, and ability “While paying resources, you may defeat this token. If you do, pay 1 less.” Credit tokens are created in a player’s resource zone but are not resources.*

**4.5.4**:

*Credit tokens are created in the resource zone but are not resources.*

It was stated on an FFG live stream that Credits can be used in place of resources for Curious Flock when creating Experience tokens via the When Played ability.

However, Curious Flock ability explicitly says "for each resource paid this way" and the use of Credit tokens is explicitly in the rules text not a resource.

In a similar vein, can Credits be used when paying costs that have been halved by Starhawk?

**The Starhawk: Prototype Battleship**:

*While paying costs, you pay half as many resources, rounded up.*

This seems like it is probably functional based on the rules changes, but is not entirely clear when Credit tokens would modify paying of resources.

**Answer:**

The FFG livestream was incorrect, and livestreams in general should be considered less authoritative than the printed rules (or these clarifications). Defeating credits doesn’t count as “paying resources”.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: Does 'name a card' require an exact card name, or do spelling variations count as the same name?

* Zeb Orrelios: Headstrong Warrior
* Zeb Orellios: Spectre Four

Player A resolves Regional Governor and names "Zeb Orrelios" or even just "Zeb". Player B has both **Zeb Orrelios: Headstrong Warrior** (two r's one l) and **Zeb Orellios: Spectre Four** (one r two l's) in hand.

Can Player B play one of the Zeb Orrelios cards, or should we treat them as having the same name?

Compare this case to naming Darth Maul vs. naming Maul, where the naming difference is intentional, while this naming difference appears unintentional. The presumption is that **Zeb Orellios: Spectre Four** should receive an erratum to correct the spelling of the name.

**Answer:**

“Name a card” requires the exact name of the card to match. Zeb’s misspelled last name will be errata’d.

`(Answer shared on 2026-05-06)`

`Editorial note: This has already received erratum.`

-------------------------------------------------


### Question: Is there a rules gap for When Defeated triggers on tokens units?

* Clone Cohort
  * Attached unit gains Raid 2 and: "**When Defeated**: Create a Clone Trooper token."
* CR 1.5.5.E
  * A token is defeated in the same manner as its non-token card type. When a token is defeated, it is set aside out-of-play.
* CR 3.7.7.2
  * Tokens cannot enter out-of-play zones such as a player’s hand or discard pile. If a token would leave play for any reason, set it aside. It is still considered to have left play.
* CR 7.6.14.A
  * Some triggered abilities are indicated with "When Defeated" in bold, followed by a colon and an effect. These abilities trigger when the card they’re on is defeated and resolve after the card is removed from play **and placed in its owner’s discard pile.**

Player A controls two Battle Droid token units. One of those tokens has **Clone Cohort** attached and is defeated.

How do "When Defeated" abilities on tokens resolve when tokens are set aside and do not ever enter the discard pile? Per 7.6.14.A those abilities resolve only from the discard pile. Should the last clause of 7.6.14.A be rephrased?

**Answer:**

Yes, 7.6.14A will be rephrased in CR8.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: Who is responsible for the damage from undeployed leader abilities?

* Jabba the Hutt: Wonderful Human Being
  * Action [1 Resource, ]: A friendly damaged unit deals 1 damage to an enemy unit. If the friendly unit has 3 or more damage on it, it deals 2 damage instead. (undeployed)
  * When another friendly unit is dealt damage and survives: You may have that unit deal that much damage to an enemy unit. Use this ability only once each round. (deployed)
* Jango Fett: Concealing the Conspiracy
  * When a friendly unit deals damage to an enemy unit: You may exhaust this leader. If you do, exhaust that enemy unit.
* Dedra Meero: Not Wasting Time
  * Action [1 Resource, ]: Choose an enemy unit. Its controller may deal 2 damage to it. If they don't, draw a card.
* CR 1.18.1.A
  * If a unit is defeated because of damage dealt by a unit a player controls, that player is considered to have defeated that unit.
* CR 1.18.1.B
  * If the above does not apply, and a unit is defeated by an ability controlled by a player, that player is considered to have defeated that unit.
* CR 8.32.2
  * If a triggered ability’s condition references when “you” do something, such as “When you deal damage,” it refers to any cards you control or abilities you resolve.
* CR 1.9.12
  * If a unit’s ability deals damage, that unit is considered to have dealt that damage.

Assume in a game of Twin Suns, Player A has SEC Jabba and Jango Leaders. Player A activate's Jabba's leader side ability. Since Jabba is a leader, and not a leader unit, does Jango trigger?

Do we consider the Jabba leader card in the base zone or the friendly damaged unit that deals the damage to be the source of the damage or both?

We suspect the answer is both, based on previous clarifications, however the CR text does not seem to be clear on this.

Similarly, with Dedra Leader ability, which says the opponent deals the damage, is Dedra and the opponent responsible for dealing the damage?

Can players be a source of damage, or is it only a card ability that can be "responsible" for damage?

Can multiple cards be considered the source of damage simultaneously?

Where in the CR is this covered?

Further scenarios where this matters:

* Can Dedra leader ability trigger JTL Boba leader?
* Can the player activating Dedra be considered responsible for defeating a unit for purposes of collecting the Bounty on it?

The CR currently reads like it was written mostly for unit-based damage and abilities, and as the leader ability range expands it is becoming more complex to evaluate.

**Answer:**

Jabba’s leader ability is considered both a leader dealing damage (as the card that originates the ability) and a unit dealing damage (in the execution of the ability). Dedra is considered to be the source of her damage as well, even if the opponent is choosing whether and where to deal that damage. Currently, players cannot be considered sources of damage directly, though they can be responsible for that damage for the purpose of e.g. Bounty, if they control the ability that deals the damage. Multiple cards can be considered the source of damage simultaneously. Dedra leader can trigger JTL Boba leader. Clarifying text will be added to 1.18 on this.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: Should both effects in a single sentence written with an "and" be considered simultaneous or sequential?

* Gar Saxon: Viceroy of Mandalore
  * Each friendly upgraded unit gets +1/+0 and gains "When Defeated: You may return an upgrade that was attached to this unit to its owner's hand."
* Let’s Call It War
  * Deal 3 damage to a unit. Then, if you have the initiative, you may deal 2 damage to another unit in the same arena.
* Grenade Strike
  * Deal 2 damage to a unit. You may deal 1 damage to another unit in the same arena.
* Unlimited Power
  * Deal 4 damage to a unit, 3 damage to a second unit, 2 damage to a third unit, and 1 damage to a fourth unit.
* CR 1.9.8
  * If an ability deals damage to multiple units, all damage is dealt simultaneously. If an ability deals multiple instances of damage to one unit, each instance of damage is dealt sequentially. Resolve any triggered abilities after all damage is dealt.
* CR 8.29.1
  * If an ability contains two effects separated by “then,” the ability is resolved by resolving the first effect, followed by resolving the second effect. If the first effect can be resolved, it must be resolved as completely as possible before the effect following “then” can be resolved. If the first effect cannot be resolved, the second effect is still resolved.

From a previous clarification:

* Does "and" templating refer to sequential or simultaneous ability resolution?
  * We have "then" and "if you do" and separate sentences of abilities defined as sequential. We know abilities can be considered simultaneous resolution.
  * Should both effects in a single sentence written with an "and" be considered simultaneous or sequential?
  * Example, SOR Palpatine leader action ability:
    * Deal 1 damage to a unit and draw a card.
* Answer
  * Resolve the ability in order. Deal 1 damage to a unit, then draw a card. We will consider making future templating use "then" in these instances to reduce confusion.

Assume that Player A has SHD Gar Saxon deployed, upgraded with Armor of Fortune, and 8 damage as well as Supercommando Squad upgraded with Sudden Ferocity and 3 damage. Player B has no units.

* Scenario 1: Player B plays Let's Call It War, choosing to do 3 damage to Gar then 2 damage to Supercommando Squad
* Scenario 2: Player B plays Grenade Strike, choosing to do 2 damage to Gar and 1 damage to Supercommando Squad
* Scenario 3: Player B plays Unlimited Power, choosing to do 4 to Gar and 3 to Supercommando Squad

For each Scenario, is the Gar player able to put Sudden Ferocity back in their hand?

For abilities without “then,” are effects resolved sequentially in written order even if it is two of the same type of effect?

**Answer:**

Scenario 1 is the only scenario in which the Gar player is not able to put Sudden Ferocity back in hand. 7.1.5 states: “When a player resolves an ability, they must resolve the effects of that ability in the order they are written.” This applies in general to any ability with multiple effects (such as SOR Palpatine). 1.9.8 clarifies that for abilities that deal damage to multiple units, that damage is dealt simultaneously, which overrules 7.1.5 and makes something like Grenade Strike or Unlimited Power deal their damage simultaneously. 8.29.1, however, governs all abilities that use “then” to separate effects, which takes priority over both 7.1.5 and 1.9.8. I’ll add some clauses into CR8 to clarify this priority.
As a side-note, I’m currently conducting an assessment of our ability templating more generally to try to improve clarity of resolution for multiple effects, but you won’t see any changes that come out of that until CR9.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: When instructed to "use multiple triggered abilities," when do you choose which abilities to resolve ?

* Fire Across the Galaxy
  * Use any number of "When Played" abilities on friendly Spectre units.

We know that to use an ability or to use an action means to resolve the ability or action in question.

* Do you need to choose up front every ability that you want to resolve, and then resolve each one sequentially, per 7.6.9?
* Or can you resolve one triggered ability, see the outcome of the resolution, and then choose the next one, similar to bullet pointed abilities?
  * If so, where is this covered in the CR?

We have rules text and clarifications covering this for bullet pointed lists, or for when a player is instructed to take multiple actions (attack with any number of units, or play any number of upgrades, etc.), but nothing covering the situation where you choose any number of triggered abilities.

* 7.1.7
  * If an ability instructs a player to take multiple actions (e.g. “Play three cards,” “Attack with two units”), that player performs each action sequentially. Any nested abilities must be resolved before proceeding to the next action.
* 7.6.9
  * If a player must resolve multiple triggered abilities on cards they control at the same time, that player chooses the order in which to resolve those abilities.
* 7.6.17
  * If a player is instructed to use a triggered ability outside of the normal conditions of its trigger (e.g. using a “When Defeated” ability while the unit is still in play), that player resolves as much of the ability as possible, ignoring any parts that are not relevant.
* 8.4.4
  * Some abilities instruct a player to “choose” a number of options from a bulleted list. When resolving these abilities, the player must choose a different bulleted option each time. A player chooses options one at a time, and may wait to see how one option resolves before choosing the next option.

Should 7.6.17 have more text to cover this case?

Example:

* 7.6.17
  * If a player is instructed to use a triggered ability outside of the normal conditions of its trigger (e.g. using a “When Defeated” ability while the unit is still in play), that player resolves as much of the ability as possible, ignoring any parts that are not relevant. The resolution of the triggered ability in this case behaves like a normal triggered ability in every way that it can.
* 7.6.17.A
  * If an ability instructs a player to use any number of triggered abilities, that player chooses and resolves each sequentially. Any nested abilities must be resolved before proceeding to the next ability.  

**Answer:**

You may see the resolution of each ability before choosing the next one to use. I’ll add additional text to cover this case in CR8.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: If a card creates a token for an opponent, which player is responsible for creating the token?

* The Client: Please Lower Your Blaster
  * **Action:** If you created a token this phase, exhaust an enemy unit.
* Val: It's Been a Ride, Babe  
  * **When Defeated:** Give a Shield token to an enemy unit.
* Vel Sartha: Aldhani Insurgent
  * **Action:** Give an Experience token to a unit. An opponent creates a Credit token.  

* 1.5.2.A
  * A player is the “owner” of a card that started the game in their deck. This includes the deck’s leader, base, and any events, units, and upgrades that started the game in that deck. A player is also the owner of any non-upgrade token they create.
* 1.5.2.F
  * A player owns and controls any token upgrades attached to units they control.
* 3.7.2
  * Tokens are set aside at the start of the game. They cannot be shuffled into decks, discarded, or enter out-of-play zones. Tokens are “created” rather than “played” (meaning they don’t trigger abilities that depend on a card being played), but are still considered to enter play when created and leave play when defeated. Tokens are considered to have a cost of 0.

The Client leader ability cares about who is responsible for creating a token. Both Vel Sartha and Val cause tokens to be created for an opponent. Vel Sartha says that the opponent creates the token, while Val says to give a token to an enemy unit.

* Should the controller of Val count as creating the token and attaching it to the enemy unit?
* Does the opponent count as creating the token that is attached to their unit?
* Do both players have responsibility for creating the token?
* Does "give a token" and "create a token" have the same mechanical meaning? It seems as though the language templating always uses "give" for token upgrades, and "create" for non-token upgrades.

**Answer:**

The controller of the ability that creates the token is responsible for creating the token, unless the ability specifies another player’s responsibility.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: Who is discarding when an opponent causes the discard from your hand?

**Padmé Amidala: What Do You Have To Hide** says:

***When you reveal or discard 1 or more cards from your hand:** You may deal 1 damage to a unit.*

**Spark of Rebellion** says:

*Look at an opponent's hand and discard a card from it.*

**CR 1.14.1** says:

*To “discard” a card means to move it to its owner’s discard pile from another zone, usually from a player’s hand or deck. Certain abilities can cause a player to discard a card.*

**CR 1.14.2** says:

*When an ability discards one or more cards from a player’s hand, the player resolving the ability chooses which card(s) to discard, unless otherwise specified. In most cases, the player discarding from their own hand chooses, but some abilities have their opponent choose instead, usually after the opponent has looked at the player’s hand.*

*For example, if Lin controls K-2S0 (SOR #145) and Becca defeats him, Lin can choose how to resolve K-2S0’s “When Defeated” ability, either dealing 3 damage to Becca’s base or making Becca discard a card from her hand. If Lin chooses the discard, Becca then chooses which card in her hand to discard; Lin does not choose for Becca.*

*For another example, if Lin later played Spark of Rebellion (SOR #200), its ability instructs Lin to look at his opponent’s hand and discard a card from it. For this ability, Lin chooses which of Becca’s cards is discarded.*

If Player A has Padmé leader and Player B plays Spark of Rebellion to force Player A to discard a card, does that trigger Player A's Padmé leader ability, or only if Player A discards a card due to an ability they control?

*Editorial note: 10/31/2025 - If another player's ability discards a card from your hand, you are still considered to discard that card, and Padme's ability still triggers.*

**Answer:**

We’ve been somewhat inconsistent in templating discard abilities in an attempt to avoid the awkward passive of “When a card is discarded from a player’s hand.” A player is always considered to be the one discarding a card from their hand for such abilities. So Padmé would trigger off a Spark of Rebellion, or any other ability that makes Padmé’s controller discard a card.

`(Answer shared on 2026-02-10)`

-------------------------------------------------


### Question: How does control of a token upgrade change with an ability that modifies control?

With the CR 6 update, **CR 1.5.2.F** says:

*A player owns and controls any token upgrades attached to units they control.*

**Shuttle ST-149: Under Krennic's Authority** says:

*Shielded*

*When Played/When Defeated: You may take control of a token upgrade on a unit and attach it to a different eligible unit.*

What impact does the Shuttle's ability have if it takes control of a token upgrade, accounting for this new rules change?

Assume Player A has a shielded unit, and an unshielded unit.
Player B uses the Shuttle to move the shield to Player A's unshielded unit.

Does the shield go through a process of being owned and controlled by Player A, and then Player B, and then Player A again?

How does this game rule resolve ownership and control vs. card abilities that change control?

Or is language referring to changing control of token upgrades simply extraneous now?

**Answer:**

Language regarding taking control of a token upgrade has been deprecated with the new token upgrade control/ownership rules. We’ll errata the affected cards.

`(Answer shared on 2026-02-10)`

-------------------------------------------------


### Question: How do we handle Ambush triggered inside of an Attack Action?

**Jedi Starfighter** says:

***On Attack:** You may deal 1 damage to a space unit.*

**Clone Cohort** says:

*Attached unit gains Raid 2 and: "**When Defeated:** Create a Clone Trooper token."*

**Chimaera: Reinforcing the Center** says:

***When Defeated:** Create 2 TIE Fighter tokens.*

**Wedge Antilles: Star of the Rebellion** says:

*Each friendly Vehicle unit gets +1/+1 and gains Ambush.*

**Change of Heart** says:

*Take control of a non-leader unit. At the start of the regroup phase, its owner takes control of it.*

Player A has **Chimaera: Reinforcing the Center** in play with 6 damage on it, and has recently played **Change of Heart** on Player B's **Wedge Antilles**, taking control of the unit.
Player B has a **Jedi Starfighter** in play with **Clone Cohort** attached.
Player B declares an attack using Jedi Starfighter with Chimaera defending, and resolves the On Attack ability to defeat Chimaera.
Player A now creates 2 TIE tokens, as the When Defeated trigger is nested within the On Attack trigger. Because of Wedge, those enter play with Ambush, also nested.

Do we now resolve these attack actions by Player A within the attack action of Player B?

If those TIE tokens ambush in to Jedi Starfighter, does it still have the Raid power bonus while defending, since it is currently in the middle of an attack action?

**CR 7.6.8** says:

*If an ability triggers during or as the result of a non-attack action, resolve that ability at the next available opportunity after that action is fully completed. If an ability triggers during an attack, resolve that ability at the appropriate timing point within that attack. Resolving a triggered ability never interrupts an action or ability that is currently resolving (other than the specified timing points during an attack), unless the currently resolving action or ability uses “after,” as described below.*
**CR 7.6.8.A** says:

*If an ability instructs a player to perform a modified action, resolve that action and any nested triggers before resolving any part of that ability that specifies it occurs “after” completing that action.*

**CR 6.3.0.B** says:

*Only one unit may attack at a time, and only ready units may perform an attack, unless otherwise specified. A player may only attack with units they control and may only attack enemy units or enemy bases. If an attacking player loses control of the attacker or gains control of the defender during an attack, proceed directly to the completion of the attack (after resolving any abilities that have already triggered). These restrictions apply even if the attack is prompted by another ability. If an ability triggers multiple attacks, resolve them sequentially.*

**Answer:**

Congratulations on finding one of my favorite weird situations! Yes, Player A’s Ambushes are nested and resolve within Player B’s attack. Since Player B’s attack is ongoing, all “while attacking” abilities, including Raid, are still active.

`(Answer shared on 2026-02-10)`

-------------------------------------------------


### Question: Can Excess damage rules language be updated to specify combat damage?

**CR 1.9.11** says:
*“Excess damage” refers to damage that would be dealt to a unit beyond the amount needed to defeat that unit. Abilities such as the Overwhelm keyword can affect excess damage. If a unit is defeated prior to being dealt combat damage by an attacker with Overwhelm, all combat damage that would have been dealt to the unit is considered excess damage.*

To prevent confusion it could be worded like:
*“Excess damage” refers to **combat** damage that would be dealt to a unit beyond the amount needed to defeat that unit. Abilities such as the Overwhelm keyword can affect excess damage. If a unit is defeated prior to being dealt combat damage by an attacker with Overwhelm, all combat damage that would have been dealt to the unit is considered excess damage.*

**Answer:**

I can’t update 1.9.11, since “excess damage” might be used in a situation not involving combat damage someday. But I’ll look at adding “combat damage” to the definition of Overwhelm.

`(Answer shared on 2026-02-10)`

-------------------------------------------------


### Question: Does "First" or "Next" apply differently if all damage was prevented?

**Umbaran Mobile Cannon**

*The first time this unit would take damage each phase, prevent that damage.*

**Vigil: Securing the Future**

*If damage would be dealt to another friendly unit, prevent 1 of that damage.*

**Shien Flurry**

*Play a Force unit from your hand. It gains Ambush for this phase. The next time it would be dealt damage this phase, prevent 2 of that damage.*

Player A has Umbaran Mobile Cannon and Vigil in play, and declares an attack with the Cannon into a 1 power unit.
Player A chooses to replace the 1 with Vigil replacement effect first. Is the cannon damage replacement effect used up as well?

Or if the damage was completely replaced, then the **first** time the Cannon **would take damage** this phase hasn't happened yet?

Similarly, if a Shielded Force unit is played with Shien Flurry, and the controller resolves Shielded before Ambush, does the Shien Flurry damage replacement effect last beyond the consumption of the Shield token?

Shien and Vigil effects are both templated as "would be dealt damage" while the Cannon as "would take damage" is that a meaningful language distinction?

The definition of Shield token upgrades uses similar language.

**CR 3.7.6**

*A Shield token is a type of token upgrade. A Shield token is an upgrade with the Armor trait that gives the unit it is attached to +0 power and +0 HP and has the text: “If damage would be dealt to attached unit, prevent that damage. If you do, defeat a Shield token on it.”*

**CR 8.9.1**

*Abilities that refer to the “first” occurrence in a phase or round (e.g. “The first event played this phase”) always refer to the very first occurrence in that phase or round, not the first after an ability becomes active. Abilities that affect the “first” occurrence in a phase or round do not apply their effects retroactively if they become active after the first occurrence has already taken place.*

**CR 7.7.5.E**

*If multiple replacement effects are prompted by the same condition, the player that controls the affected game object chooses to resolve effects in any order until the condition no longer applies. Once a particular effect has been replaced, other pending effects cannot replace that effect.*
*For example, if Ricardo and Amy each control a Shield token on Ricardo’s unit and that unit would be dealt damage, Ricardo decides which Shield token will prevent the damage and be defeated, since he is the controller of the affected unit.*
*For another example, Sage has a Tech (SHD #248) in play that grants each of their resources Smuggle. They play Bamboozle (SOR #199) from their resources using Smuggle. Smuggle replaces the normal cost of the card with the Smuggle cost, so Sage cannot use Bamboozle’s ability to replace the cost again by discarding a card from their hand.*

Note that it appears the first example in **7.7.5.E** is no longer correct with the changes to token upgrade ownership and control.

**CR 7.7.5.A**

*A replacement effect occurs when part or all of the standard resolution of a triggering condition or ability is replaced with an alternate resolution. This alternate resolution is the “replacement effect.”*

Here we see that replacement effects say nothing can trigger from the standard resolution if it was fully replaced. Does "trigger" refer to only triggered abilities specifically, or is that a more loosely defined casual English term?

Note that a strict reading of this rule would indicate that a cost or combat damage can't be replaced by a replacement effect, but we know that is not intended.

It's possible that we are basing our rules interpretation on a strict reading of language in the CR in one spot and a loose reading of it in another.

**Answer:**

Damage being prevented by a replacement effect does not affect whether it is the “first” or “next” time a unit would be dealt damage. In the first example, Umbaran Mobile Cannon would be dealt 1 damage, which is the first time it would be dealt damage this phase. Even if that damage is prevented by using Vigil’s replacement effect instead of Umbaran Mobile Cannon’s, the “first time” has occurred. If Umbaran Mobile Cannon would be dealt damage later in the phase, this is the second time it would be dealt damage this phase.

There is no rules difference between “be dealt damage” and “take damage”, it’s just a templating inconsistency.

The first example in 7.7.5E is indeed out of date and will be updated in CR7.

7.7.5D says: “If a replacement effect replaces all of the standard resolution of a condition, ability, or action step, the standard resolution does not resolve and is ignored. In such a case, abilities can only trigger off of the replacement effect, and not the standard resolution of the ability.” This refers to triggered abilities.

`(Answer shared on 2026-02-10)`

-------------------------------------------------


### Question: Do we fully resolve a modified play a card action before applying game state checks?

**Three Lessons**
*Play a unit from your hand. It gains Hidden for this phase. Give an Experience token and a Shield token to it.*

**Supreme Leader Snoke: Shadow Ruler**
*Each enemy non-leader unit gets -2/-2.*

**Stolen Landspeeder**
*Bounty - If you own this unit, play it from your discard pile for free and give an Experience token to it.*

Player A has Supreme Leader Snoke in play. Player B plays Warzone Lieutenant (no abilities, 2 HP) using Three Lessons. Does the unit gain the Experience upgrade as it enters play in time to survive?

A previous quick verbal clarification on the interaction of claiming the Stolen Landspeeder's Bounty vs. a Snoke effect indicated that "We resolve the whole of the ability - both "play this unit" and "give it an experience counter" before evaluating its HP" however this was from over a year ago, and CR updates in the intervening time don't seem to have explicitly supported this intent. If that is the intent still, how broadly should that be interpreted, and how do we know what does and does not bypass the Game State priority rules?

**CR 1.16.5**
*In order to maintain the game state, certain situations require immediate resolution and take priority over other waiting triggered abilities or action steps. If any of these situations arise, resolve them immediately as specified below before continuing with the game. If multiple situations are present at the same time, resolve them in the order of priority below until no such situations remain.*
*E. If a unit has 0 remaining HP, it is defeated.*

Or should this be considered to only take priority AFTER a modified play a card action is fully resolved?

**Answer:**

The intention for modified Play a Card actions is that for something like “Play a unit and give an Experience token to it,” the unit enters play and is given an Experience token simultaneously. I’m looking to expand the section on modified actions with CR8 (it didn’t quite make it into the CR7 update), which should hopefully provide more clarity and give specific entries to cite for these situations.

`(Answer shared on 2026-02-10)`

-------------------------------------------------


### Question: What is the timing of multiple conditional attribute modifiers?

**Gold Leader: Fastest Ship in the Fleet** says:

*While this unit is defending, the attacker gets -1/-0.*

Vonreg's TIE Interceptor: Ace of the First Order says:

While this unit has 4 or more power, it gains Overwhelm. While this unit has 6 or more power, it gains Raid 1.

**Battle Fury** says:

*Attached unit gains: "On Attack: Discard a card from your hand."*

Player A has Vonreg's TIE with Battle Fury attached, attacking Player B's Gold Leader.

**CR 6.3.1.F** says:

*Any abilities that activate while an attack is occurring become active for the duration of the attack. This includes Raid, “While this unit is attacking,” and “While this unit is defending” abilities. If the ability is subject to a further conditional (e.g. “While this unit is attacking a damaged unit”), it is only active while all of its conditions are true.*

So all of these modifiers are "activating" in the same timing. For simultaneous conditional modifiers, do we follow the rule of adding all positive modifiers before subtracting all negative modifiers, resulting in Vonreg's TIE reaching 7 power before Gold Leader brings it back down to 6? Or does the negative modifier prevent Vonreg's TIE from reaching the necessary 6 power to activate Raid?

**Answer:**
Vonreg’s TIE Interceptor with an attached Battle Fury has Raid 1, which means it has +1/+0 while attacking. If it attacks Gold Leader with 6 power, its +1/+0 from Raid is applied simultaneously with Gold Leader’s -1/-0, and its resulting power is 6.

To further clarify, let’s say Vonreg’s TIE Interceptor has been given Raid 3 by other effects. In this case, if it attacks Gold Leader, its +3/+0 from Raid still is applied simultaneously with Gold Leader’s -1/-0, and its resulting power is 5. Note here that when calculating a modified power value, you add positive modifiers before subtracting negative modifiers as a way of calculating the correct power value, but the unit never actually has those power values during that calculation, only at the end. So in this example, Vonreg’s TIE Interceptor never actually has 6 power for the additional Raid 1, even though you reach that value briefly while calculating its power.

`(Answer shared on 2025-11-25)`

-------------------------------------------------


### Question: Does "during their previous action" mean "during their previous turn" or is it more strict than that?

**Fully Armed and Operational** says:

*If an opponent attacked your base during their previous action this phase, play a unit from your hand. Give it Ambush for this phase.*

**Ezra Bridger: Resourceful Troublemaker** says:

*When this unit completes an attack: Look at the top card of your deck. You may play it, discard it, or leave it on top of your deck.*

Player A attacks Player B's base with Ezra Bridger, then chooses to play the top card of their deck.

If Player B then plays Fully Armed and Operational, do they get to play a unit (and give it Ambush)? Or does the intervening Play a Card from Ezra disrupt that?

Based on the following rules, it seems like this card templating language could have read If an opponent attacked your base during their previous turn this phase, play a unit from your hand.

**CR 6.2.0.E** says:

*The player is not considered to have taken an additional action if they played a card due to an ability.*

**CR 6.3.0.D** says:

*The player is not considered to have taken an additional action if they attack due to an ability.*

However there doesn't seem to be any similar language in 6.4 for Use an Action Ability.

If we use Bib Fortuna: Jabba's Majordomo to play Shoot First and Attack with Ezra, does this modify the outcome of the answer?

Further, how far does this language stretch if we assume a Twin Suns game:

Player A attacks Player B's base with Ezra, then uses Ezra's ability to play A New Adventure on Player B's Fleet Lieutenant. Player B now re-plays the Fleet Lieutenant and attacks player C's base with the When Played triggered ability. Can Player C make full use of Armed and Operational now, because Player B took an action that attacked Player C's base, or no, because it was Player A's turn/action that caused Player B to make the attack, and it was not during Player B's turn?

**Answer:**

None of the above examples involve taking multiple actions in your turn for the purposes of Fully Armed and Operational, since those actions are all nested within the single Play a Card, Attack With a Unit, or Use an Action Ability action you take. So in all examples (except Twin Suns), your opponent is considered to have attacked your base during their previous action. Currently, the only card that allows more than one action in a turn is JTL Kazuda leader, which specifies that you take an “extra action.” This templating continues to cause confusion, though, so we’ll consider a transition to using “turn” for similar effects in the future. In the Twin Suns example, Fully Armed and Operational would not work, because Player B attacked Player C’s base during Player A’s turn/action.

`(Answer shared on 2025-11-25)`

-------------------------------------------------


### Question: What counts as a cost?

The CR has many references to paying costs, but it is unclear on what counts as a "cost" in game terms for every scenario.

The Starhawk: Prototype Battleship says:

While paying costs, you pay half as many resources, rounded up.

Does Starhawk discount apply to:

* Force Lightning paying resources to deal damage?

* The Eye of Aldhani played by the same player three times in the previous action phase?

* Mining Guild TIE Fighter On Attack ability resolving?

* Steadfast Senator action ability?

Essentially, does paying a resource always count as a cost? Or only when the ability text or rules text refers to the word "cost" ?

**Answer:**

Something is only a cost if it is defined as such in CR 1.8. The amount of resources you pay to play a card, additional costs applied through effects, and anything in brackets following an action ability is a cost. Paying resources as a part of resolving an ability is not a cost. So the Force Lightning, The Eye of Aldhani, and Mining Guild TIE Fighter examples are not costs, while Steadfast Senator is.

`(Answer shared on 2025-11-25)`

-------------------------------------------------


### Question: What happens with two Condemn upgrades attached to the same unit?

**Condemn** says:

*While attached unit is attacking, it gains: "On Attack: The defending player may disclose VigilanceVillainy. If they do, this unit gets -6/-0 for this attack" and loses all other abilities.*

**CR 6.3.1** says:

*Declare the attack. The active player chooses and exhausts a ready unit they control and then chooses what to attack: either an enemy unit in the same arena as it or the opponent’s base. Any abilities that are active “while attacking” become active.*

If two Condemn upgrades are attached to the same unit, do they cancel each other out? Is it correct to say that "On Attack" triggered abilities trigger in step 6.3.1 but "while attacking" happens first, so both granted triggered abilities end up removed?

Or is it all simultaneous timing where On Attack triggered abilites still end up triggering, but they get removed? In which case, they would both still need to resolve.

Or does the active player need to choose one of the conflicting "loses all other abilities" to take precedence, and only one of the On Attack triggered abilities resolves?

**Answer:**

Both “On Attack” abilities are removed and do not trigger. Both of the Condemn abilities become active simultaneously, and each Condemn makes the attached unit lose the other Condemn’s gained ability. Or, if you prefer thinking about it another way, the first Condemn gives the attached unit the “On Attack” ability and makes it lose all other abilities, and the second Condemn’s “On Attack” ability can’t be gained, and makes the unit lose its “On Attack” ability.

`(Answer shared on 2025-11-25)`

-------------------------------------------------


### Question: What is the exact timing of a keyword being granted in a modified play a card action?

If we assume Twin Suns leaders **Morgan Elsbeth - Following the Call** and **Third Sister - Seething With Ambition** are both deployed as leader units, and both attack, then the next unit played gains the Hidden keyword, and has a cost discount if it shares a Keyword with a friendly unit.

Since Third Sister leader unit has Hidden, we assume that the next unit played does gain the Hidden keyword at the Declare Intent step of the Play A Card action, and thus would benefit from the cost discount. Is that correct?

This assumption is based on **Count Dooku - Face of the Confederacy** granting Exploit, which means it MUST be granted during or prior to the Determine Costs step in order to function.

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

Do our pair of Oppo units retain RESTORE 2 because they see it on each other, or do they both lose the keyword since no unit in play has it printed?

**CR 7.3.3** says:
*Some constant abilities continuously check the game for a specific condition to be met for their effects to apply to the game. These abilities usually include the word “while.”*

**Answer:**

Once Ackbar leaves play, the Oppos no longer have Restore, as there must be a non-conditional ability or active conditional ability for them to “see” still in play.
Intention is that it still works with Gamorrean Guards/Retainer and similar.
The idea is that if the conditions of multiple conditional constant abilities only are met by each other, they are not considered met.
This will be clarified in CR6.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: If a card under opponent's control becomes my leader, is it immediately defeated?

Player A has Brain Invaders in play.
Player B has JTL Darth Vader - Victor Squadron Leader attached to Victor Leader - Leading from the Front.
Player A plays Change of Heart on Victor Leader.
Player B defeats Brain Invaders with Takedown.
Is Victor Leader immediately defeated?

CR 3.4.6 says:

*If an ability would cause a Leader Unit to move to an out-of-play zone or change control for any reason, it is defeated instead.*

In this case, the unit is not changing control when it became a leader unit (again). Should there also be a rule such as “if a leader would ever be controlled by a player that is not the owner, it is defeated” ?

**Answer:**

Such a rule would mean that deploying a Pilot leader onto a Vehicle which you’ve taken control of from an opponent would immediately defeat that unit, which is not intended. However, Brain Invaders will be getting an erratum to no longer affect leader upgrades, which puts it in line with original intentions.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: Does a granted leader status get suppressed before other abilities would temporarily be suppressed?

Player A has JTL Darth Vader - Victor Squadron Leader attached to Victor Leader - Leading from the Front, as well as a TIE Fighter token with 1 damage.
Player B plays Brain Invaders.
Does Victor Leader briefly lose abilities, defeating the TIE Fighter token, or do "true" leaders lose their abilities first, so that Victor Leader's ability is never suppressed at any point?

**Answer:**

In this scenario, Victor Leader briefly loses its abilities, and the TIE Fighter token is defeated. However, Brain Invaders will be getting an erratum to no longer affect leader upgrades, which puts it in line with original intentions.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: What counts as "other units" when no unit is chosen?

**Always Two** says:
*Choose 2 friendly Sith units. If you do, give 2 Shield tokens and 2 Experience tokens to each chosen unit. Defeat all other friendly units.*

If we have units in play but none of them are unique Sith units, do all of our units get defeated?  If nothing is chosen, "other" could mean all units, or it could mean no units. Suspect the answer is yes, defeat all units, but properly determining what "other" means when the initial set of units does not exist is not entirely clear.

**CR 8.5.2** says:
*If instructed to “choose a unit,” that unit must be in play when resolving the ability, unless otherwise specified.*

**CR 8.19.2** says:
*An ability may use “other” or “another” to separate the first card it affects from a different card that it affects. For example, Overwhelming Barrage (SOR #092) is an event that gives a friendly unit +2/+2 for the phase, and deals damage to any number of “other” units. The “other” in this ability means that the damage cannot be applied to the friendly unit given +2/+2.*

**Answer:**

The "other" in Always Two separates the units chosen by the first half of the ability from the units not chosen by the first half of the ability. If no units are chosen by the first half of the ability, then all units have not been chosen, and all would be defeated.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: Previous clarifications indicated that cost discounts may be ordered as desired, but CR5 doesn't seem to have been updated to include that language?

Previous example was Director Krennic providing a cost discount while also being exploited for an additional cost discount.

In the Determine cost(s) step of play a card, **CR 6.2.3.A** says:
*When calculating a card’s modified cost, start with the card’s printed cost, then apply any modifiers that increase the cost of the card (including the aspect penalty) before any modifiers that decrease the cost of the card, including abilities like Exploit. The result is the card’s modified cost.*

**CR 7.5.16.C** says:
*Exploit is used during Step 3 of the “Play a Card” action: Determine cost(s).*

**CR 7.5.16.D** says:
*Abilities that trigger while defeating units using exploit (e.g. “When Defeated” abilities) resolve only after the “Play a Card” action has finished resolving, at the same time that a unit’s “When Played” abilities resolve.*

But this doesn't quite cover the timing of a unit being defeated during the determine costs step that is also providing a cost discount via a constant ability.

**Answer:**

Previous clarifications re: Krennic-like abilities still stand. CR6 will have more on this.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: What is a "subtype" and where is it defined?

CR 2.4.1 Defines what a card's type is, but we seem to have new rules that refer to "subtype" without defining that term.

**CR 3.7.1** says:
*A token is a type of card that doesn’t start the game in a player’s deck. If a token has a second type, such as a “token upgrade” or “token unit,” it has the same formatting as its non-token card type. If it doesn’t have a second type, the token is clarified with a **subtype** (e.g. “Force Token”).*

**CR 3.7.11** says:
*A Force token is a type of token with name “The Force,” **subtype** “Force Token,” and no traits. A player’s Force token is created in their base zone. A player can’t control more than one Force token.*

Similarly, "detach" is used on ability text of **Pantoran Starship Thief** and **Eject** but only "attached" and "unattached" is defined in the CR. We assume detached and unattached are being used as synonyms and this is just a templating mistake?

**Answer:**

Subtypes are only used for tokens, so are only referenced in 2.4.1. I’ll add further clarification in CR6. "Detach" is a templating adjustment that is replacing "unattached". It will be updated in CR6, and “unattached” will be deprecated.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: How much of pending trigger resolution can rely on Last Known Information?

LKI continues to cause disagreements in how it functions. Let's take **Darth Maul's Lightsaber** as an example:
***When Played:** If attached unit is Darth Maul, you may attack with him. For this attack, he gains Overwhelm and can't attack bases.*

Player A has **Darth Maul - Revenge At Last** unit in play with **Darth Maul's Lightsaber** attached and 6 damage.
Player B has 12 remaining base HP.
Player B plays a **Loth-Wolf** Sentinel.
Player A deploys **Darth Maul - Sith Revealed** leader.
Player B claims initiative.
Player A plays **Darth Maul's Lightsaber** on **Darth Maul - Sith Revealed**, and must immediately pick one of the upgrades to defeat due to uniqueness.
If Player A chooses to defeat the newly played upgrade so that the **Darth Maul - Revenge At Last** unit is not defeated and can still make an attack with the additional power bonus, does **Darth Maul - Sith Revealed** leader unit still get to make the attack against the enemy Sentinel with Overwhelm when resolving the When Played trigger, resulting in a game win?

Essentially, can LKI be used to determine what unit a defeated upgrade was attached to?

**CR 3.6.6** says:
*When an upgrade is attached to a unit, the unit also is attached to that upgrade. If an upgrade becomes unattached from a unit, the unit also becomes unattached from that upgrade.*

**CR 8.12.1** says:
*“Last Known Information” is information about a card that’s no longer in play that amounts to a snapshot of its status immediately before it left play. Last Known Information includes the attributes of the card, the controller of the card, the modifiers applied to that card, the card’s ready/exhausted status, upgrades attached to that card, and how the card was defeated or removed from play. Last Known Information is used primarily when resolving “When Defeated” abilities.*

**CR 8.12.2** says:
*Last Known Information is only reference information. Other abilities that were on a card that left play are not active while resolving its “When Defeated” abilities.*

Based on previous clarifications, we know LKI doesn't apply only to "When Defeated" abilities, and the more general description is:
*Last Known Information specifically covers information necessary for resolving abilities when the game state no longer holds that information.*

**Answer:**

When Darth Maul's Lightsaber's ability resolves, it checks the name of the unit it is attached to. If it is not attached to a unit, that unit cannot be named Darth Maul.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: How flexible is the application of effects to changing card types when resolving a triggered ability?

Example scenario:
Player A has **L3-37 - Get Out Of My Seat** in play as a unit, and a vehicle without a pilot. Player B has a Battlefield Marine in play.
Player A plays **Heroic Sacrifice** to attack Battlefield Marine with L3-37. Heroic Sacrifice triggers but has not yet resolved.
Since L3-37 would be defeated in combat, her replacement effect is activated and she attaches to the vehicle as an upgrade.
When we resolve the pending triggered ability, is L3-37 upgrade defeated?

**L3-37 - Get Out Of My Seat** says:
*If this unit would be defeated, you may instead attach her as an upgrade to a friendly Vehicle unit without a Pilot on it.*

**Heroic Sacrifice** says:
*Draw a card, then attack with a unit. For this attack, it gets +2/+0 and gains: "**When this unit deals combat damage:** Defeat it."*

Previously we had a clarification on a similar situation with Iden Pilot + Corvus + Sneak Attack:
*A unit played with Sneak Attack is defeated at the start of the regroup phase as long as it's still in play. Because Corvus's ability doesn't remove Iden from play to make her an upgrade, she's still under the lasting effect. If the unit leaves and then returns to play (e.g. A New Adventure) before the start of the regroup phase, the unit is not defeated.*

The timing of when the triggered ability resolves makes this not quite the same case as the existing clarification, but it seems likely it should stiill behave the same. However, the effect of the triggered ability is not already applied to the unit the way it is with the Iden pilot that was played with Sneak Attack.

So does "Defeat it" resolve correctly still, or is "it" looking for a unit that dealt combat damage that no longer exists?

Other piloting language clarifications have used "it" to refer back to the previous language on the ability of "card" or "unit" or "upgrade" in a way that determined how the card could be played, so ensuring that we're treating this correctly in all cases is the goal.

**Answer:**

The ruling from Iden+Corvus does apply here. Heroic Sacrifice’s ability triggers for the L3-37 unit, and when it resolves, L3-37 is still the same game object in play, even though it is now an upgrade instead of a unit. Heroic Sacrifice defeats the L3-37 card as long as it’s still in play.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: When does an action that creates a Modified Action begin nesting triggers?

Player A has LOF *Qui-Gon Jinn Student of the Living Force* leader, and the Force is with them. They have two units in play, *Yoda, My Ally is the Force* and a *Nightsister Warrior*.

Player B has a *Krayt Dragon* and *HK-47, Exclamation: Die Meatbag!* in play.

Player A activates the leader ability, paying the cost which triggers Yoda. Yoda is returned to hand to play a second *Nightsister Warrior* for free, triggering Krayt.

Do the pending triggers from Yoda and Krayt both resolve in the same layer nested in the Modified Play a Card action, since paying a cost is part of the ability that triggered it? Or does Yoda wait to resolve after the Modified Action, including Krayt, is resolved, as it was triggered by paying the cost and does not count as part of the Modified Action?

**CR 7.1.6.A** says:
*Some abilities instruct the controlling player to take an action (“Play a card,” “Attack with a unit,” or “Use an Action Ability”), often with additional effects attached; such an ability is considered a “modified action.” A modified action is resolved as though the player had taken the corresponding action, with any modifiers applied as appropriate.*

**CR 7.1.6.E** says:
*If an ability instructs a player to take a modified action, any abilities triggered during or as a result of that action are considered nested abilities.*

**CR 7.6.8** says:
*If an ability triggers during or as the result of a non-attack action, resolve that ability at the next available opportunity after that action is fully completed.*

Does this make *6.4.4 Pay cost(s)* of Use an Action Ability part of the Modified Play a Card Action, nesting the triggers from paying costs?

**Answer:**

In order to activate the leader ability, Player A takes the Use an Action Ability action. Yoda’s ability triggers as a part of the cost of this action (6.4.4). Qui-Gon Jinn’s action ability in turn tells the player to take a modified Play a Card action. Abilities triggered by this Play a Card action are nested and must resolve before the waiting abilities from the previous layer.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: Does consecutive apply to 'turn' or to 'action' when passing?

Scenario 1
P1 passes.  Player 2 uses Kazuda Xiono leader action then Claims initiative. This happened on 'consecutive turns' (2 actions but same turn) so the Action phase is over. Should P1 have had a chance to respond to the change in game state?

CR 1.15.5.c
*If a player takes the initiative on the turn immediately after their opponent passes, the action phase ends.*

Scenario 2
P1 passes.  Player 2 uses Kazuda Xiono leader action then also passes. Is the Action phase over?
Per is this considered to be 'consecutive'?  

CR 1.4.4
*The first active player in a game is the player that started the game with the initiative counter. Once that player takes their first action, their opponent becomes the active player and takes an action, then the first player becomes the active player again and takes an action, and so on. Players continue taking turns this way until each player has passed consecutively, which ends the action phase.*

CR 1.15.6.D
*When each player has passed consecutively (including when one player takes the initiative after their opponent passes), the action phase immediately ends and play proceeds to the regroup phase.*

CR 11.2.4
*Once each player passes consecutively, the action phase ends.*

In other words, does consecutive apply to 'turn' or to 'action'?

**Answer:**

The intention is that "consecutive" refers to actions, not turns. The appropriate CR entries will be updated in CR5 to make this clear. Kaz's leader ability being used to Pass will give the other player a chance to respond unless they've already claimed the Initiative.

`(Answer shared on 2025-05-19)`

-------------------------------------------------


### Question: Does the lasting effect of "Attached unit can't be attacked this phase" still protect the unit if the upgrade is defeated?

AP plays On Top of Things on a friendly unit.
NAP plays Confiscate to defeat the upgrade.
The When Played ability has already created the lasting effect of "Attached unit can't be attacked this phase" that continues to exist, but does it still protect the unit since it is no longer the "attached" unit, or is this now an "orphaned" lasting effect? In essence, how much of the ability text is relevant to the effect that is created?

**Answer:**

Because "Attached unit can't be attacked this phase" is a When Played ability, it is a lasting effect that continues to persist after the upgrade is defeated (CR 7.7.3B). When the ability resolves, it checks which unit is the "attached unit" and applies its effect. The lasting effect applies to that unit, regardless of what happens to the upgrade. As another example, if the upgrade were to be moved onto a different unit, the "can't be attacked" would not apply to the newly-attached unit.

`(Answer shared on 2025-05-19)`

-------------------------------------------------


### Question: If a lasting effect is created by another lasting effect expiring at the same timing point, what happens?

Assume Desperate Commando is buffed by Overwhelming Barrage, and has two damage tokens. At the end of the Action phase, the lasting effect expires, defeating the Desperate Commando. This triggers its When Defeated ability, which creates a lasting effect which would expire at the end of the phase, but we are already at that point.

Do we loop through the "cleanup" at the end of phase repeatedly until nothing remains, or have we passed the timing point and now "this phase" in the effect actually refers to the regroup phase? Or some other option?

If the lasting effect exists for a brief moment and then expires immediately, that would imply we are able to defeat a unit with 1 HP remaining, and if JTL Thrawn leader is triggered during this resolution, we are able to defeat two such units, or a single unit with 2 HP remaining. Is that correct?

Desperate Commando
*When Defeated: You may give a unit -1/-1 for this phase.*

Overwhelming Barrage
*Give a friendly unit +2/+2 for this phase.*

Grand Admiral Thrawn
*When you use a "When Defeated" ability: You may exhaust this leader. If you do, use that ability again.*

**Answer:**

The end of a phase is a moment in time. At the end of the action phase, Desperate Commando's buff wears off and it's defeated, which triggers its "When Defeated" ability. When resolving and applying the effects of this ability, the action phase is already over, so the debuff will last until the end of the regroup phase.

`(Answer shared on 2025-05-19)`

-------------------------------------------------


### Question: What Happens to Captured Cards When a Player Is Eliminated in Twin Suns?

In a Twin Suns game, when a player is eliminated, what happens to units captured by that player’s cards?

Is the guarding unit considered to “leave play” when removed as part of the player elimination process, which would normally rescue captured cards (per rule 8.34.4) or is this removal a distinct process that does not constitute "leaving play" in this specific case?

CR 8.13.1 says:
*A card leaves play when it moves from an in-play zone to an out-of-play zone or when it is turned facedown. Defeating a unit or returning a unit to hand from play both cause the unit to leave play. If a unit leaves play, any upgrades attached to it are defeated, but lasting or delayed effects from its abilities remain active.*

CR 8.34.4 says:
*If a unit that is guarding any number of captured units leaves play, immediately rescue all captured cards that were guarded by that unit.*

CR 11.3.1 says:
*Once a player’s base has no remaining HP, that player is eliminated from the game and they cannot take any more actions. All cards they own are removed from play and any cards owned by other players in their play area are placed in their owners’ discard piles. (The removed cards are not considered defeated or discarded, and do not cause abilities to trigger.) Any of their triggered abilities still waiting to resolve are ignored.*

**Answer:**

A unit captured by an eliminated player's unit does return to play under its owner's control. CR5 will have a clarifying note for this.

`(Answer shared on 2025-05-19)`

-------------------------------------------------


### Question: Further clarifications on Last Known Information behavior?

Regarding the previous answer to Targeting Computer not applying to “When Defeated: Indirect Damage” abilities, LKI applies to modified names (Clone), Power/HP (various) and other modified attributes, but does not apply to modified abilities/ability text?

How does this compare to General Krell - Heartless Tactician? If units defeated have that ability through LKI, gain “When Defeated” abilities from attached upgrades, etc... Should they not then have the ability from Targeting Computer as well based on LKI?

**Answer:**

As mentioned above, Last Known Information specifically covers information necessary for resolving abilities when the game state no longer holds that information. General Krell's ability and upgrades that grant "When Defeated" abilities do not use Last Known Information to apply their effects. At the moment of defeat, if a unit has a "When Defeated" ability, that ability triggers. Once the "When Defeated" ability is triggered, it must resolve. The game does not need to remember how the "When Defeated" ability existed.

`(Answer shared on 2025-04-30)`

-------------------------------------------------


### Question: Does a replacement effect on a defeat count for abilities that check for defeat?

If AP's JTL L3-37 would be defeated but is instead attached as a pilot, does NAP get the discount on Bravado, because of replacement effect rules, or no discount, because no unit was actually defeated? 1.18.1 tells us how to determine who is responsible. 7.7.5.D references the "trigger" of abilities only from the replacement effect, but this isn't a trigger. 8.10.2 only instructs us about a single ability with "if you do" templating.

1.18.1

*Some card abilities care about whether a player was responsible for defeating a unit (e.g. “If you defeated a unit this phase”). Players are always responsible for defeating units they are directly instructed to defeat (such as when resolving an ability that says “Choose a unit and defeat it” or when resolving the uniqueness rule). In all other cases, to determine player responsibility for defeat, follow the below steps in order until responsibility is determined.*

7.7.5.D

*If a replacement effect replaces all of the standard resolution of a condition, ability, or action step, the standard resolution does not resolve and is ignored. In such a case, abilities can only trigger off of the replacement effect, and not the standard resolution of the ability. If a replacement effect replaces part of the standard resolution of a condition, ability, or action step, the resolution of the replacement effect and unreplaced standard resolution occur simultaneously.*

8.10.2

*If a replacement effect replaces the resolution of the text before “If you do” with another effect, the controlling player is still considered to have resolved that text. That player still resolves the text after “If you do.”*

**Suspect the answer is "no" but this appears to be something we have to infer from silence in the CR**

**Answer:**

Your suspicions are correct - if an effect replaces a defeat, the unit is not considered defeated. 7.7.5D says the standard resolution (the unit being defeated) does not resolve and is ignored.

`(Answer shared on 2025-04-30)`

-------------------------------------------------


### Question: How does defeating upgrades that are providing HP to a unit factor into determining responsibility?

A player has a unit with 2 HP and an upgrade that gives +3 HP. Opponent deals three damage to the unit. Player gives the unit +1 HP through a lasting effect. Opponent defeats the upgrade.

Per 1.18.1.D, the player who controls the unit is the most recent player whose ability changed the remaining HP of the unit and they are responsible for it being defeated.

Does attaching or removing an upgrade from a unit count as an ability or effect changing the remaining HP? Should this say “reduce the remaining HP” instead of change?

**Answer:**

Yes, attaching or removing an upgrade from a unit can count as changing the remaining HP of the unit.

`(Answer shared on 2025-04-30)`

-------------------------------------------------


### Question: Does "and" templating refer to sequential or simultaneous ability resolution?

We have "then" and "if you do" and separate sentences of abilities defined as sequential. We know abilities can be considered simultaneous resolution.

Should both effects in a single sentence written with an "and" be considered simultaneous or sequential?

Example, SOR Palpatine leader action ability:

*Deal 1 damage to a unit and draw a card.*

**Answer:**

Resolve the ability in order. Deal 1 damage to a unit, then draw a card. We will consider making future templating use "then" in these instances to reduce confusion.

`(Answer shared on 2025-04-30)`

-------------------------------------------------


### Question: Should "instead" in rules text always be read as 'colloquial English' as opposed to the SWU specific term?

Previous clarification about token units being captured was that they counted as captured and you could collect bounties on them. This is somewhat difficult to justify in the rules text, however.

CR 8.34.5

*If a token unit would be captured, set it aside **instead**. It is still considered to leave play.*

Is this a replacement effect, or is that only the case when a card ability text uses the word "instead" in it?

Does this actually count as a capture? We believe so, but it seems that the CR text didn't get the additional text to support it.

CR 3.7.3

*Tokens cannot enter out-of-play zones such as a player’s hand or discard pile. If a token would leave play for any reason, set it aside.  It is still considered to have left play.*

Should 1.34.5 be read as:

*If a token becomes captured (thus satisfying Bounty requirements) it is set aside immediately afterward.*

or

*If a token unit would be captured, set it aside. It is still considered to leave play, and is still considered to have been captured.*

**Answer:**

I'll adjust templating here to clear up confusion. A token leaving play being set aside is not a replacement effect for it leaving play.

`(Answer shared on 2025-04-30)`

-------------------------------------------------


### Question: Timing in Twin Suns of when an opponent is defeated vs the healing reward?

If Confederate Tri-Fighter is in play preventing base healing in the final phase of the game and the controlling opponent is the first to be eliminated, would the player that caused that elimination be able to claim the healing?

Basically, is 11.3.1 resolved first, before 12.6.2 is applied?

CR 11.3.1

*Once a player’s base has no remaining HP, that player is eliminated from the game and they cannot take any more actions. All cards they own are removed from play and any cards owned by other players in their play area are placed in their owners’ discard piles. (The removed cards are not considered defeated or discarded, and do not cause abilities to trigger.) Any of their triggered abilities still waiting to resolve are ignored.*

CR 12.6.2

*Any player who eliminates another player (such as by being the last player to damage the eliminated player’s base) immediately heals 5 damage from their own base. If a player eliminates themself through an ability, no player heals damage from their base this way.*

**Answer:**

All of a defeated player's cards are removed from game before the player that knocked them out heals 5 damage from their base. CR5 will add more clarity to the order of operations here.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: Do triggered abilities resolve during attack steps or in between/after attack steps?

While it doesn't typically matter, in some cases the rules wording can leave us in an unclear timing point:

* Activate Leia leader with 4 ready Rebels
* Attack with Ezra
* Ezra completes an attack, triggering his ability
 * Reveals Rebel Assault
 * Plays Rebel Assault - is this "during the attack" or "after the attack" due to resolving at the end of "Complete the Attack" step?
 * Attack with 2 of the 3 ready Rebels 1 at a time (creating a 'nested' attack inside the Complete an Attack part of attacking?)
* Attack with last remaining Rebel to finalize Leia's leader action

Do you resolve the attacks from Rebel Assault (per CR 7.6.8) as part of Ezra's Complete an Attack trigger in the middle of combat, resulting in multiple simultaneously active "attack" actions or is there some kind of bookkeeping/cleanup timing point that is not specified in the rules?

**Answer:**

"When this unit completes an attack" has to see the attack complete in order to trigger, much like "When Played" has to see the card enter play in order to trigger. When resolving a "When this unit completes an attack" triggered ability, the attack has already been completed (6.3.3A). To give add some more details to your example:

* We use Leia leader's action ability, which lets us attack with 2 Rebel units. Since this is multiple attack actions in one ability, 7.1.7 tells us to make those attacks sequentially, with any nested abilities from the first attack resolved before moving on to the second attack.
* We use our first attack to make a modified attack action with Ezra. We follow all the normal rules for attacking with a unit in 6.3.1-3.
* We complete our attack with Ezra. Since he's still in play, his ability triggers on the completion of the attack. Since this triggered during or as a result of our first attack action, we need to resolve it before moving to our second attack action.
* We resolve Ezra's ability, revealing Rebel Assault. We know that wherever he is, the Rules Admiral's left ear just twitched involuntarily.
* We play Rebel Assault, which lets us attack with 2 Rebel units. Since this is multiple attack actions in one ability, 7.1.7 tells us to make those attacks sequentially, with any nested abilities from the first attack resolved before moving on to the second attack.
* We use our first attack to make a modified attack action with a Rebel unit. We follow all the normal rules for attacking with a unit in 6.3.1-3. Any abilities triggered during or as a result of this attack are resolved.
* We use our second attack to make a modified attack action with a Rebel unit. We follow all the normal rules for attacking with a unit in 6.3.1-3. Any abilities triggered during or as a result of this attack are resolved.
* We finally are done resolving abilities that triggered during our first Leia attack, so we can now proceed to our second Leia attack, which is with a Clone unit copying Ezra. Our opponent concedes.

`(Answer shared on 2025-03-25)`

`Editorial note: this is my favorite rules clarification ever.`

-------------------------------------------------


### Question: What happens to a captured unit guarded by a pilot unit that becomes an upgrade without leaving play?

Easiest example, a pilot is guarding a captured unit when Corvus is played, and the pilot is converted to an upgrade.

Is the captured unit rescued since the guarding unit is no longer a unit, or does the unit it becomes attached to become the new guard?

**Answer:**

If a PILOT is guarding a unit and becomes an upgrade, that upgrade is now guarding the unit.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: How does Last Known Information interact with constant abilities of an upgrade?

A Droid Missile Platform attached to Targeting Computer is defeated.

Does the ability to assign indirect damage still apply due to Last Known Info, or not because the upgrade is no longer attached and is in the discard after the unit is defeated?

**Answer:**

Last Known Information remembers values that the game state might have otherwise lost, like the power of a defeated unit whose When Defeated ability deals damage equal to its power. Abilities are not active from the discard pile while resolving the "When Defeated" abilities, however, so Targeting Computer does not let you assign the indirect damage.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: When "same arena" is referenced, how much can be resolved?

AP has 2 space units in play and NAP has a ground unit in play. When AP plays Reckless Torrent, is the When Played ability able to damage NAP ground unit based on "do as much as you can", or does it require a friendly and enemy unit to index what "same arena" means, thus nothing happens?

**Answer:**

This is a "do as much as you can" situation, and Reckless Torrent can deal 2 damage to an enemy unit if there's no friendly unit in the same arena. This is a somewhat awkwardly templated card and we will consider an errata to make it clearer.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: Is there any rules text mitigating an infinite loop?

Assume both players have a Snoke and 2 Clone cards in play that cloned Snoke. All were granted an experience token at some point.

We now have a constant -6/-6 aura applied to both sides of the board. One player plays a Stolen AT-Hauler.

If neither opponent refuses to play the free Hauler every time it is immediately defeated, we are now stuck in an infinite loop.

How do we handle this kind of loop per comprehensive rules? Or does this end up in a double DQ for stalling?

**Answer:**

So there are three kinds of infinite loops: a single-player loop that one player can pull off entirely by themselves, locking the game from continuing if their opponent can't disrupt the loop; a two-player loop in which both players must cooperate in order for the loop to go infinite; and a forced loop in which the game state can't resolve (or keeps resolving infinitely). I don't believe a single-player or forced loop is currently possible in the game, but it's a good idea to add a line or two to the CR on how to resolve these situations (most likely: decide an arbitrary number of loops and then move on). How to resolve a two-player loop falls more under the collusion rules of the Tournament Regulations.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: If a card that generated a trigger changes control before that trigger resolves, who controls that trigger?

The example given here is NAP controls a Krayt Dragon, and AP plays Change of Heart.

While they don’t control the Dragon when the ability triggers, AP does control the unit when the ability resolves.

It’s generally assumed/known to be that NAP retains control of the trigger based on previous clarifications, but having something explicit to support that would be great.

**Answer:**

Appreciate notes like this about things the CR could be doing to make y'all's lives easier. NAP controls the trigger, and I'll look into making that more explicit in CR5.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: Does a lasting effect update based on controller when the text refers to friendly units?

Comparing Admiral Yularen - Fleet Coordinator with Regional Governor, if they change control Regional Governor doesn't change which OPPONENT is impacted, but Yularen references FRIENDLY UNITS, so does his lasting effect now change who it applies to? Or is it locked in to friendly to the original controller?

**Answer:**

This one's already been answered in the card database: “Until Yularen leaves play, each friendly Vehicle unit gains the chosen keyword. This effect is not changed if an opponent takes control of Yularen.”

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: How to handle lasting effects, delayed effects, and change of control interactions?

Similar but different from previous Sneak Attack question.

If I play Triple Dark Raid and attach Chewbacca-Faithful First Mate via piloting on to that ship, then my opponent plays Traitorous and takes control of that ship with Chewbacca attached, will that ship return to my hand at regroup?

**Answer:**

No, it wouldn't be returned to your hand, since the unit now has the text "This unit can't be returned to hand by enemy card abilities" and, because it has changed control, the effect that would return it to hand is coming from an enemy card ability.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: Is a triggered ability with a '/' separating multiple triggering conditions one ability or multiple abilities?

From CR 7.6.2:
*If a triggered ability has a forward slash (‘/’) separating multiple triggering conditions, the ability triggers for each of those conditions. For example, an ability with a “When Played/When Defeated” condition triggers both when the card it is on is played and when the card is defeated. Such an ability is considered both a “When Played” and a “When Defeated” ability.*

The language here seems to be referencing one single ability that counts as both a When Defeated and a When Played ability. So does this mean that Grand Admiral Thrawn from JTL is able to double the ability when an Elite P-38 Starfighter is played, since per CR it counts as a When Defeated ability?

**Answer:**

“When Played/When Defeated” is a concatenation of two abilities, a “When Played” ability and a “When Defeated” ability. You cannot use Grand Admiral Thrawn to double the “When Played” ability.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: Based on the new upgrade eligibility restrictions rule 3.6.3.B hotfix, how should we interpret upgrade restrictions?

`Editorial note: Due to the multi-part complexity of this question and answer it is laid out a little differently from the others.`

*3.6.3B When an ability attaches a unit or leader to another unit as an upgrade (for example, the PILOTING keyword), any restriction from that ability continues to apply to that card until it leaves play. For a unit to be considered “eligible” for that upgrade, the upgrade must have been able to attach to that unit via the original ability.*

First, a general question

* Is printed text in the ability box of an upgrade that restricts attachment considered an ability or an effect of some kind?
* Are the "implied" restrictions caused by an ability that attaches a leader or unit as an upgrade considered to be a lasting effect attached to the upgrade, or something else?

**Answer:**

The implicit "Attach to a unit" attachment restriction of any upgrade is part of the card type and not an ability. Any printed attachment restriction for a given upgrade is an ability that modifies this implicit restriction. Restrictions put into place by abilities that attach a non-upgrade as an upgrade are lasting effects for that upgrade while it is in play as an upgrade. This will be clarified in CR5.

-------------------------------------------------

**Scenaro 1:**

Generic Pilot and Survivors Gauntlet

* Player A plays a pilot on one of their units.
* Player B takes control of that unit, while the upgrade remains controlled by Player A.
* Player B attacks with Survivors Gauntlet.
* Player B cannot move the pilot, as none of the elegible units for Survivors Gauntlet (under the same player's control) are considered friendly to the upgrade.

Is that correct?

In general, since Piloting keyword looks for friendly vehicle units, stolen vehicles with enemy pilots (that are not Sidon) cannot be moved by Survivors Gauntlet, due to the Pilot being attached to a non-friendly vehicle.

**Answer:**

This is correct. The attachment restriction for a PILOT is a "friendly Vehicle unit". For Survivors' Gauntlet's ability in this case, an "eligible" unit would be a "friendly Vehicle unit", where "friendly" is determined by that upgrade, whose controller is still Player A.

-------------------------------------------------

**Scenario 2:**

Sidon Ithano and Survivors Gauntlet

* Player A plays Sidon on Player B's Bright Hope.
* Player B plays a Lurking TIE Phantom.
* Player A attacks with Survivors Gauntlet.
* Player A can move Sidon to Player B's LTP.

In general, Survivors Gauntlet can move an upgrade to another unit controlled by the same player as the previous unit. Sidon's criteria is that the attached vehicle must be an enemy unit without a pilot on it, and Sidon is still controlled by player A, so Player B's Lurking TIE still is eligible.

**Answer:**

Yes, this is correct. The attachment restriction for Sidon Ithano is an "enemy Vehicle unit without a PILOT on it". For Survivors' Gauntlet's ability in this case, an "eligible" unit would be an "enemy Vehicle unit without a PILOT on it", where "enemy" is determined by that upgrade, whose controller is still Player A.

-------------------------------------------------

**Scenario 3:**

Legal Authority and Survivors Gauntlet

* Player A plays Legal Authority on their Bright Hope.
* Player B attacks Bright Hope with Survivors Gauntlet, moving Legal Authority to a ground unit controlled by Player A.

**Answer:**
Yes, this is correct. The attachment restriction for Legal Authority is a "friendly unit". For Survivors' Gauntlet's ability in this case, an "eligible" unit would be a "friendly unit", where "friendly" is determined by that upgrade, whose controller is Player A.

-------------------------------------------------

**Scenario 4:**

Iden Versio, Corvus, and Kazuda Xiono

* Player A Kazuda leader has a unit Iden Versio (Adapt or Die) in play, and use Kaz's leader ability to remove Iden's abilities.
* Player A plays Corvus, and attaches Iden to Corvus.
* Corvus does NOT get a shield token, but what are the upgrade attachment restrictions created at this point?

Corvus - Inferno Squadron Raider
When Played: You may attach a friendly Pilot unit or upgrade to this unit.

Does this mean that the restrictions on Iden as an upgrade is "must attach to this unit" and thus can't be moved?
Or does Kazuda's "blanking" of Iden result in a blank upgrade that only grants stat modifiers with no restrictions on where it can be moved?

**Answer:**
Corvus's ability is what makes Iden Versio an upgrade, so Corvus's ability determines the attachment restriction, regardless of whether Iden Versio has lost her abilities due to Kaz. Corvus's ability says that you may attach a friendly PILOT unit as an upgrade to this unit, so the attachment restriction is "Attach to this unit". In general, for cards that don't have the Upgrade card type, the attachment restriction is created by the ability that turns that card into an upgrade and persists while that card remains an upgrade in play.

-------------------------------------------------

**Scenario 5:**

Iden Versio, Corvus, and Eject

Does the eligibility restrictions go away when the upgrade stops being an upgrade?

* Play Iden on a Vehicle using piloting
* Play Eject on Iden, is now a unit on the ground
* Play Corvus to attach Iden as an upgrade

Iden never left play. Do both sets of eligibility restrictions now apply?
Does the first restriction apply since that's what initially turned her into an upgrade?
Does only the most recent restriction apply, since that's what most recently turned her into an upgrade?

What happens if you eject Iden again and play another Corvus? Can you not attach Iden because the previous restriction specified that unit, and the new Corvus isn't that unit?

What happens if you Eject Iden again and play another Corvus?

**Answer:**

For cards that don't have the Upgrade card type, attachment restrictions created by abilities that attach them as upgrades only persist as long as that card is in play as an upgrade. In your example, if Iden Versio is detached and becomes a unit via Eject, any attachment restrictions that applied to her while an upgrade no longer apply.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: What is the eligibility criteria of a Pilot attached as an upgrade determined by?

*7.5.17A “Piloting” is a keyword whose effect is the same as the constant ability: “You may play this unit as an upgrade on a friendly VEHICLE unit without a PILOT upgrade on it by paying cost Y instead of its printed cost,” where Y is the cost in brackets following “Piloting.” Paying this cost follows all normal rules for paying costs, including accounting for any aspect penalties that modify this cost.*

*2.12.3 Units with the PILOT trait can be in play either as a unit or as an upgrade.*

We have two clarifications of intent:

* Survivors Gauntlet can not move a Pilot to a non-Vehicle.
* Survivors Gauntlet can move a Pilot to a Vehicle that already has a Pilot.

Both the attachment to a Vehicle unit, and the limit of no pre-existing Pilot, come from the same text in the Piloting keyword that only references playing the upgrade, not what it's ongoing attachment eligibility should be.

We also have leaders with the Pilot trait and no Piloting keyword (Boba Fett, for example), as well as units like Sidon Ithano with the Pilot trait and no Piloting keyword, so their eligibility criteria for valid attachment can't be based on the keyword text.

It seems that the limit of 1 Pilot attachment was meant to be able to be bypassed in certain cases, while the limit of Vehicle attachment was not, so should it be baked in to the definition of the Pilot trait?

In other words, should 2.12.3 have been written as:
*2.12.3 Units with the PILOT trait can be in play either as a unit or as an upgrade **attached to a Vehicle unit.***

**Answer:**

CR5 will contain a small rework of upgrades to create a more robust picture of "attachment restrictions", rather than the current somewhat unwieldy "play restrictions" version.

Changes in CR5:

* All upgrades have implicit attachment restrictions. When playing an upgrade or attaching it to an "eligible" unit, you have to consider those restrictions.
* If an upgrade has no printed attachment restriction, the implicit restriction is "Attach to a unit."
* If an upgrade has a printed attachment restriction, use that.
* If a non-upgrade card is attached as an upgrade by an ability, the attachment restriction is created by the ability that turns that card into an upgrade. It persists while the card remains an upgrade in play.

Since this is too large of a change for CR4, the plan is to hotfix the issue by adding the following entry to a CR4 update:

CR4 Update (3.6.3B):

* **When an ability attaches a unit or leader to another unit as an upgrade (for example, the PILOTING keyword), any restriction from that ability continues to apply to that card until it leaves play. For a unit to be considered “eligible” for that upgrade, the upgrade must have been able to attach to that unit via the original ability.**

3.6.3B will be posted on websites and social media while the CR is updated behind the scenes, hopefully by next week. Judges should apply this rule when judging immediately.

* "One Pilot per vehicle" is a restriction.
* Phantom II's attachment to The Ghost is also a restriction.
* Both apply if you attempt to move the upgrade to a new unit.

`(Answer shared on 2025-03-06)`

`Editorial note: this supercedes previous clarifications related to Survivors' Gauntlet interacting with Phantom II and Pilots. They have been removed from this page.`

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

Explanation:

In the first example, both WPG’s Ambush and Hondo’s ability are "abilities triggered during or as a result of" the modified action that is Smuggling WPG. They are resolved in the same window (once the steps of the action are finished).

In the second example, Hondo is triggered as a result of playing TI and resolves after you’re finished resolving TI’s event ability. That event ability is taking another action, though, and that modified action triggers other abilities that need to resolve before you can go back and resolve Hondo.

`(Answer shared on 2025-03-06)`

-------------------------------------------------


### Question: Does sentinel granted by a triggered ability and then removed also turn off the triggered ability?

8.15.1 states that an ability giving the lost keyword is also lost for the duration of the lose effect. So if it is a conditional constant ability that is "on", it stops giving sentinel until the end of the phase, regardless of whether you turn it "off" then back "on". Such as with Gamorrean Guards vs SpecForce Soldier. Calculating Magnaguard can give sentinel more than once due to it having multiple trigger conditions for the triggered ability. If the sentinel granted by the When Played ability is removed by SpecForce Soldier, can the triggered ability still grant Sentinel again in that phase? Specific scenario: Player A controls a Battle Droid token and plays Calculating MagnaGuard, resolving its triggered ability to gain Sentinel. Player B plays SpecForce Soldier, resolving it's when played ability and removing Sentinel from Calculating MagnaGuard. Player A attacks the SpecForce Soldier with the Battle Droid, causing Calculating MagnaGuard to trigger to give itself Sentinel. As the new lasting effect originates from the same ability source, does the lose effect from SpecForce Soldier stop the Sentinel?

**Answer:**

We are changing how "lose" works in CR4 to simplify complex interactions like this. More info coming soon!

`(Answer shared on 2025-02-18)`

-------------------------------------------------


### Question: What timing needs to be considered in 6.2.3.A Determine Costs?

When calculating a card’s modified cost, start with the card’s printed cost, then apply any modifiers that increase the cost of the card (including the aspect penalty) before any modifiers that decrease the cost of the card, including abilities like Exploit. The result is the card’s modified cost. Example: Player A has a JTL Krennic unit in play. Player A plays a Battle Droid Legion, exploiting the Krennic unit. The Battle Droid Legion is the first unit played this round by player A. Does it cost 7 or 6, assuming no aspect penalty? Since Krennic is in play for determining costs, does his constant ability apply the discount, or does Exploit defeating Krennic mean his discount can't be applied?

**Answer:**

You can apply discounts in any order you want, so you can apply Krennic's -1 discount and then exploit him for an additional -2.

`(Answer shared on 2025-02-18)`

`Editorial note: this is expected to be clarified in CR5.`

-------------------------------------------------


### Question: Does “Starting Hand” also mean “Opening Hand” or does it mean “First opening hand”?

The CR references a player’s opening hand, but the base Colossus refers to Starting Hand.

**Answer:**

"Starting hand" is the same as "opening hand"; this is a templating inconsistency. If your base is Colossus, you draw one fewer card, even when you mulligan.

`(Answer shared on 2025-02-18)`

-------------------------------------------------


### Question: How does Piloting and Last Known Information interact?

Player A has Gar Saxon leader that is currently in play as a leader unit. A Pilot unit (let's say JTL Bossk, Hunt By Instinct) is played via piloting, and is attached to a TIE/LN Fighter. The TIE unit is defeated, sending the TIE and the attached upgrade that is Bossk to the discard. We now have a Pilot unit in the discard that was defeated in this phase, but it was an upgrade at the time of defeat. Is the pilot eligible to return to hand via Gar's leader ability? Is the pilot eligible to return to hand via The Emperor's Legion? Is the pilot eligible to be used by Spark of Hope to be converted in to a resource?

**Answer:**

Gar: Yes, Gar's ability only looks for whether a card was an upgrade attached to a unit, using last known information.

Emperor's Legion & Spark of Hope: Any card ability that cares about whether a certain card in your discard pile was defeated this phase cares about whether it was defeated as that type of card. (See the current Card Clarification for Spark of Hope that it does not work if a unit was defeated while a resource, e.g. by Han's leader ability.)

`(Answer shared on 2025-02-18)`

-------------------------------------------------


### Question: Is it the potential for multiple actions or the actual existence of multiple actions that requires the sequential resolution and thus nesting of triggered abilities in 7.1.7?

*7.1.7. If an ability instructs a player to take multiple actions (e.g. “Play three cards,” “Attack with two units”), that player performs each action sequentially. Any abilities triggered during or as a result of each action are considered nested abilities, and must be resolved before proceeding to the next action.*

If only a single unit is played by a U-Wing Reinforcements, are those When Played triggered abilities nested?

Fleshing out the example:

Say the single unit played by U-Wing Reinforcements is The Ghost, Specter Home Base, while the opponent has a Krayt Dragon in play. As a result, we will have 4 “When Played” pending abilities to resolve:

7 damage from Krayt, 6 damage from Krayt, Shielded from Ghost, and Shield another Spectre unit from Ghost. If we assume Active Player always resolves first, does this go

Shielded from Ghost and Shield another Spectre unit from Ghost in either order, and then 7 damage from Krayt and 6 damage from Krayt in either order.

OR

Shielded from Ghost and Shield another Spectre unit from Ghost in either order, and then 6 damage from Krayt, and then 7 damage from Krayt.

Another example:

If you have a Bossk, Deadly Stalker in play and play U-Wing Reinforcements, choosing to play only one unit from this ability, can Bossk's event trigger resolve prior to anything from the single unit played by U-Wing?

**Answer:**

This is a great thing to poke at, and we appreciate the attention to detail here and in your other questions! Having talked about some of the implications of the various answers to this question, we are going to move forward by separating the "nested" rule from the "sequential" rule in CR4. With some possible wording adjustments, CR4 will say: If an ability instructs a player to take a modified action, any abilities triggered during or as a result of that action are considered nested abilities. If an ability instructs a player to take multiple actions (e.g. “Play three cards,” “Attack with two units”), that player performs each action sequentially. Any nested abilities must be resolved before proceeding to the next action.

`Editorial note: this led to the change in CR4 that all triggers from a modified action are nested`

`(Answer shared on 2025-01-20)`

-------------------------------------------------


### Question: What is done with a card that becomes no longer valid to play, but was originally valid?

This is a complicated chain of events, but it’s all legal:

Play U-wing Reinforcements and choose Fleet Lieutenant x2. Play the first Fleet LT, which allows you to attack with an Ezra. Ezra attacks and, on completing his attack, his ability allows you to play A New Adventure, forcing your opponent to return and then replay Regional Governor. The opponent does so, naming Fleet Lieutenant. You no longer can play your second Fleet Lieutenant, despite being able to when you were initially choosing the cards for U-Wing.

Does the second Fleet Lieutenant return to the deck with the remainder of the searched cards, does it go to the discard, is it removed from the game, or does it somehow bypass the Regional Governor restriction?

**Answer:**

This was not covered adequately in CR3. Good catch! We have added wording in 8.27.8 to account for this situation.

`(Answer shared on 2025-01-20)`

-------------------------------------------------


* [When collecting the Stolen Landspeeder Bounty vs Snoke, it will have the additional HP added before the constant effect is checked.](https://discord.com/channels/1265343874105081856/1288101185508737044/1290821263270481991)

* [Can I rearrange my resources after Scanning Officer has chosen ready ones to make the chosen resources exhausted instead, and then defeat those resources? No.](https://discord.com/channels/1265343874105081856/1273307936155762830/1301624251043811390)

* [Constant abilities are "on" immediately when a unit enters play, even if game state checks (such as uniqueness) are currently preventing effects from resolving such as a unit being defeated due to remaining HP.](https://discord.com/channels/1265343874105081856/1273307936155762830/1311072296248541335)

* [If multiple units are defeated for a single exploit, they are all defeated simultaneously.](https://discord.com/channels/1265343874105081856/1273307936155762830/1311072296248541335)

* [A Fine Addition may not be played as a soft pass if an eligible target upgrade exists in any player's discard.](https://discord.com/channels/1265343874105081856/1273307936155762830/1311072296248541335)

* [Defeated tokens do leave play.](https://discord.com/channels/1079526508688847078/1079527291283067020/1214252641174028348)

* [Applying an effect to a token unit still counts for "if you do" effects. E.G. Bright Hope on a token unit, or capturing a token unit with a bounty.](https://discord.com/channels/1079526508688847078/1079527291283067020/1301646164634112121)

* Condemn says:
  * While attached unit is attacking
    * it gains: "On Attack: The defending player may disclose Vigilance Villainy. If they do, this unit gets -6/-0 for this attack"
    * and loses all other abilities

* Trigger timing is not the same as timing of resolution of that ability.

* Events only affect units that are in play when the event is played, unless explicitly stated otherwise.

* Overwhelm will still damage the base if the defending unit is defeated by an On Attack ability.

* Bounties are not inherently upgrades, but upgrades can give bounties to attached unit.

* Tokens and leaders enter play but are not played (for the purposes of When Played triggers).

* Fan made projects like Force Table and Karabast are not an official source of rules. If something seems off, double check with your friendly local judge and/or SWU discord rules chats, and let the maintainers know if you found something incorrect!

---

## Set 1: SOR — Spark of Rebellion (Block 0)

### Question: What is the timing of removing Traitorous from a pilot unit?

If a pilot unit changes control due to Traitorous, and then is attached as an upgrade, does this trigger the Traitorous "unattached" condition? Who ends up with control of the card?

**CR 3.5.6** says:

*Some units can also attach to units as upgrades. If an ability causes a unit in play to be attached as an upgrade, all damage is removed from that unit and all upgrades on that unit are defeated. While a unit is attached to another unit as an upgrade, it is considered an upgrade and not a unit for all purposes.*

**Traitorous** says:

***When this upgrade becomes attached to a non-leader unit that costs 3 or less**: Take control of that unit.*

***When this upgrade becomes unattached from a unit**: That unit's owner takes control of it.*

**L3-37 - Get Out Of My Seat** says:

*If this unit would be defeated, you may instead attach her as an upgrade to a friendly Vehicle unit without a Pilot on it. (She's no longer a unit. Defeat all upgrades on her and remove all damage from her.)*

**Luke Skywalker - You Still With Me?** says:

*If this upgrade would be defeated, you may instead move him to the ground arena as a unit and exhaust him.*

**Corvus - Inferno Squadron Raider** says:

***When Played**: You may attach a friendly Pilot unit or upgrade to this unit. (Defeat all upgrades on that Pilot and remove all damage from it.)*

Scenario 1:

Player A plays Traitorous on Player B's L3-37. Player B responds with Takedown defeating L3. Player A chooses to use L3's replacement effect, moving L3 to pilot a vehicle in play. Traitorous must now be unattached from L3, so does control of the unit change before defeat, control of the upgrade change after defeat, or no control change at all?

Scenario 2:

Player A plays Traitorous on Player B's Luke. Player B is unable to deal with this immediately, so on Player A's following turn, they play Corvus, attaching Luke as a pilot.

Traitorous must now be unattached from Luke, so does the current controller retain control or does the owner reclaim control of the upgrade? This will matter as soon as the upgrade is defeated and someone gets a Luke unit in the ground arena as a result.

Is the order of operations to change the card type from unit to upgrade before or after defeating attached upgrades and removing damage tokens, or is this considered all simultaneous?

**Answer:**

Traitorous behaves like other triggered abilities, in that it nests within the action/ability that triggers it and resolves only after that action/ability finishes resolving.

In Scenario 1, Player B plays Takedown and Player A chooses to use L3’s replacement effect, attaching L3 to a friendly Vehicle unit as a pilot. As part of attaching L3, Traitorous is defeated and detaches from L3. Once Takedown has finished resolving, Player A must resolve Traitorous’s triggered ability, which gives control of L3 back to Player B. The result of the play is that L3 is controlled by Player B and attached to Player A’s unit.

In Scenario 2, Player A plays Corvus, using its “When Played” ability to attach Luke to Corvus. As part of attaching Luke, Traitorous is defeated and detaches from Luke. Once the “When Played” ability has finished resolving, Player A must resolve Traitorous’s triggered ability, which gives control of Luke back to Player B. The result of the play is that Luke is controlled by Player B and attached to Player A’s Corvus. If Luke later would be defeated, Player B could instead move him to the ground arena as a unit (under their control) and exhaust him.

`(Answer shared on 2025-11-25)`

-------------------------------------------------


### Question: Is the text of Heroic Sacrifice all one modified action?

The "draw a card" portion of Heroic Sacrifice is written in the same sentence as the modified action created by the attack. Is it also part of the modifications that create a modified action, or is it a separate ability and thus not relevant for trigger nesting?

CR 7.1.6.A says:

*Some abilities instruct the controlling player to take an action (“Play a card,” “Attack with a unit,” or “Use an Action Ability”), often with additional effects attached; such an ability is considered a “modified action.” A modified action is resolved as though the player had taken the corresponding action, with any modifiers applied as appropriate. The player must perform the action if possible (unless it involves hidden information, as with “Play a card from your hand”) and complete each step of the action in order, applying any modifiers during the appropriate step.*

An example where this matters:
Active Player plays Heroic Sacrifice with an SOR Bossk in play. Non-Active Player has Seasoned Fleet Admiral in play. Since Seasoned Fleet Admiral triggers from the "draw a card" component, would it be Bossk resolving last and the Seasoned Fleet Admiral would resolve after the attack but before Bossk?

Or would Bossk and Seasoned Fleet Admiral pending triggered abilities be in the same window and thus can be resolved in either order?

**Answer:**

"Draw a card" is not part of the modified attack action. AP plays Heroic Sacrifice to draw a card and attack with a unit. Bossk triggers from playing the card, and Seasoned Fleet Admiral triggers from drawing a card, but neither can resolve until the current action is finished resolving. Heroic Sacrifice tells AP to take a modified Attack with a Unit action, and all the triggers resulting from that are nested. Once the attack and resulting triggers are fully resolved, we can turn to resolving waiting triggers (Bossk and SFA).

`(Answer shared on 2025-05-19)`

-------------------------------------------------


### Question: Does SOR Luke Leader ability mean [heroic unit] [played this round] or [heroic unit played this round] as it applies to piloting?

Player A plays JTL Luke Skywalker - You still with me? as a pilot upgrade on a Space Vehicle Unit. That unit is then defeated during the same phase, Luke pilot is then moved to the ground arena exhausted. Can Player A activate SOR Luke Skywalker - Faithful Friend leader ability to give that unit a Shield?

**Answer:**

SOR Luke leader's ability means [heroic unit played this round], so the JTL Luke pilot must have been played as a unit. In general, phrases that apply restrictions to cards like this should be treated holistically as opposed to breaking them apart into sub-restrictions.

`(Answer shared on 2025-04-30)`

-------------------------------------------------


### Question: Does SOR Falcon trigger if the controller doesn't ready any cards during regroup?

*This unit enters play ready.*

*When you ready cards during the regroup phase: Either pay 1 or return this unit to her owner's hand.*

The actual language of the ability implies if nothing is readied during regroup, then Falcon would not need to be paid for, while the timing point for other cards refer to actual steps in a phase. Is that the correct intent?

Furthermore, if a card is readied during regroup, outside of the ready step, such as if Super Laser Technician or Admiral Motti are defeated due to an effect like Sneak Attack’s delayed effect, does Falcon trigger?

**Answer:**

"When you ready cards during the regroup phase" refers to the step of the regroup phase during which cards ready (5.5.1D). This step occurs regardless of whether there are cards to ready, and readying that occurs outside of this step doesn't trigger the Falcon's ability.

`(Answer shared on 2025-04-30)`

-------------------------------------------------


### Question: Does Sneak Attack defeat a card it played as a unit that is no longer a unit at the start of regroup phase?

If we consider the new Iden Pilot unit played via Sneak Attack, and then attached to Corvus as a Piloting upgrade, would Iden still be defeated by Sneak Attack at the start of regroup phase, since it is still the same copy of the card that was played, or would the delayed effect "fail to find" the unit that it is looking for because it is no longer a unit?

**Answer:**

A unit played with Sneak Attack is defeated at the start of the regroup phase as long as it's still in play. Because Corvus's ability doesn't remove Iden from play to make her an upgrade, she's still under the lasting effect. If the unit leaves and then returns to play (e.g. A New Adventure) before the start of the regroup phase, the unit is not defeated.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: What is the exact timing of deployed leader unit Bossk's triggered ability?

Since it triggers on the collection of a bounty, it is always triggered by the resolution of a triggered ability. Does this mean the second bounty resolution is always nested inside the first bounty resolution, or since the trigger is the completion of the resolution of the first bounty does Bossk trigger at the end and it is sequential instead of nested?

Example 1:
Player 1: has deployed Bossk leader unit and Wampa in play, and a Snowtrooper Lieutenant in the top 5 of the deck.

Player 2: has Clone Trooper in play with Bounty Hunter's Quarry attached.

Player 1 attacks and defeats Clone Trooper with Bossk, resolves bounty by playing Snowtrooper Lieutenant. When Played ability from Snowtrooper is now nested within the first bounty resolution. Can Player 1 choose to resolve bounty again using Bossk's ability before resolving the Snowtrooper (granting an attack to Wampa) because it is also nested inside the first bounty, or is the second bounty only triggered after the first bounty is fully resolved, and thus is resolved at the top layer instead of in the nested layer?

**Answer:**

Bossk leader's triggered ability triggers when you collect a Bounty, which 7.5.13D defines as resolving a Bounty ability. 7.6.11 says that all abilities triggered while resolving a triggered ability A are nested, so Bossk's ability is always nested.

`(Answer shared on 2025-01-20)`

-------------------------------------------------



* [Regional Governor applies to multiple versions of units with the same name,but a partial name is insufficient to cover multiple names.](https://x.com/davflamerock/status/1724862181622112505)

* [Strafing Gunship opposing a space Sentinel can only attack Sentinels on Ground or Space arena.](https://x.com/davflamerock/status/1752360268795937096)

* [Ambush trigger must be resolved by the triggering player with a unit they control.](https://x.com/davflamerock/status/1796205663174922695)

* [Pick multiple option type abilities are resolved one at a time, and you can pick as you go.](https://x.com/davflamerock/status/1812910719815590221)

* [A player controls abilities on cards that they play and control, including events.](https://x.com/davflamerock/status/1811803903048241399)

* [For Palpatine leader sacrifice of a unit, When Defeated triggers resolve after card draw and 1 damage.](https://x.com/davflamerock/status/1810346572649033732)

* [You may fail to find hidden information even if the opponent knows it is present.](https://x.com/davflamerock/status/1792995929190007222)

* [SpecForce Soldier can choose any unit including itself to lose Sentinel.](https://x.com/davflamerock/status/1779968977122247105)

* [For A Cause I Believe In resolves as one single damage trigger for all revealed cards.](https://x.com/davflamerock/status/1778790979065004482)

* [All triggers caused by Vigilance choices wait to resolve until after event fully resolves.](https://x.com/davflamerock/status/1792353938160902455)

* [Chirrut does not die from -X/-X effects](https://x.com/davflamerock/status/1785035713974542630)

* [Rukh's ability does not resolve until end of combat damage step even with Shoot First.](https://x.com/davflamerock/status/1782834959062843438)

* [Limited format decks can change leaders and bases between games.](https://x.com/davflamerock/status/1805279225718464687)

* [Superlaser Technician and Unrefusable Offer do not play well together.](https://discord.com/channels/1079526508688847078/1079527291283067020/1252346793136754854)

* [When putting cards back after For A Cause I Believe In, the opponent DOES get to know the order of the cards since they are all revealed through the effect.](https://discord.com/channels/1079526508688847078/1079527291283067020/1186384076156977183)

* Pay costs as normal for ambushing a unit when using Energy Conversion Lab Epic Action.

---

## Set 2: SHD — Shadows of the Galaxy (Block 0)

### Question: Can A New Adventure on a pilot unit play the pilot as an upgrade?

If A New Adventure is played on a pilot unit in play, it is returned to hand, and then can be played again for free. Can the pilot be played for free as an upgrade, or is the "play it for free" on ANA referring to the unit mode only?

**Answer:**

No, you can't pick up a pilot unit and play it as an upgrade. "Unit" applies to the entire ability, the same as "search for a unit and play it".

`(Answer shared on 2025-02-18)`

-------------------------------------------------


### Question: Does Lurking TIE Phantom take damage from indirect damage?

If not, is it a valid target to assign indirect damage to?

What we know so far:
*8.4.2. When “can’t” is used in a card ability, that ability adjusts or overrides a default rule of play. The player controlling a card with such an ability must follow that ability over the default rule of play. 8.4.3. Restrictive abilities override permissive abilities. If an ability with the word “may” or “can” directly contradicts an ability that uses the word “can’t”, then the ability that uses “can’t” takes precedence.*

LTP text: *This unit can't be captured, damaged, or defeated by enemy card abilities.*

*3.7.6. A Shield token is a type of token upgrade. A Shield token is an upgrade with the Armor trait that gives the unit it is attached to +0 power and +0 HP and has the text: “If damage would be dealt to attached unit, prevent that damage. If you do, defeat a Shield token on it.” When an ability instructs a player to give a Shield token to a unit, they take a Shield token that has been set aside and attach it to that unit.*

Clarifications so far: *Indirect damage can't be "wasted" by assigning it to a unit with less remaining HP*
LTP wouldn't be wasting it due to remaining HP. Damage can be assigned there, it isn't a "prevent damage" effect. It's a "can't" which takes precedence over the default rule of play.

How should this actually be ruled?

**Answer:**

Lurking TIE Phantom can be assigned damage from indirect damage. "Can't be damaged" is a prevent effect, as clarified in CR4. We are considering the additional step of errataing LTP to use "prevent" wording but aren’t 100% on that yet.

`(Answer shared on 2025-01-20)`

-------------------------------------------------


### Question: Does Spare The Target on Unrefusable Offer work if the controller is not the owner?

A follow up to an older question. A bounty is always resolved by the opponent of the controller of the unit which is USUALLY not the owner of said card. We know Spare The Target played on a unit with Unrefusable Offer attached results in not being able to play the unit when resolving the bounty because it's in your opponent's hand, which is a hidden zone. How does it change if Spare the Target returns the unit in question to your own hand, such as if it had previously been swapped control with Change of Heart? Are you then able to play it from your own hand since it is NOT in a zone hidden to the controller of the bounty when resolving?

Comparing similar effects, we know the effect of A New Adventure works from your hand, or your opponent’s hand, to play the unit for free. Does this mean STT+UR could actually play the unit if your opponent allowed you to, but normally it fails because there’s no reason for them not to “fail to find” the unit that the effect is looking for?

**Answer:**

No, Spare the Target can never play a card from hand. Unrefusable Offer was a templating error and will be corrected in the coming errata.

`(Answer shared on 2025-01-20)`

-------------------------------------------------


* [Outflank must choose a different unit for the second attack.](https://x.com/davflamerock/status/1843713500058923218)

* [Spark of Hope does not work with units that were defeated as resources.](https://x.com/davflamerock/status/1800275651372408860)

* [Pre Visla stealing Entrenched while attacking a base does not stop the attack.](https://x.com/davflamerock/status/1799120916313481681)

* [Hero Boba Leader works with Conditional Keywords only when they are active.](https://x.com/davflamerock/status/1795608545112797520)

* [Force Lightning on friendly Kylo Ren can nullify the -1/0](https://x.com/davflamerock/status/1793036911675617543)

* [Bounties in multiplayer are collected by the player that defeats or captures the unit.](https://x.com/davflamerock/status/1775978346972684410)

* [Lasting effects fall off when changing zones.](https://x.com/davflamerock/status/1800674819769614362)

* [If the resolution of an ability you control defeats a unit, you have defeated that unit.](https://x.com/davflamerock/status/1811804055452197369)

* [Lurking TIE Phantom can be defeated by -X/-X.](https://x.com/davflamerock/status/1803083519872081928)

* [Lurking TIE Phantom can be chosen for Power of the Dark Side and will not be defeated.](https://x.com/davflamerock/status/1803083654538703155)

* [Lurking TIE Phantom can be defeated by Force Lightning.](https://x.com/davflamerock/status/1803472509183897671)

* [Lurking TIE Phantom can not be defeated by Overwhelming Barrage.](https://x.com/davflamerock/status/1811194315001245786)

* [Han2 leader unit playing Stolen Landspeeder defeats the unit before it would change control.](https://x.com/davflamerock/status/1803196374646948344)

* [Jabba leader ability works with Reputable Hunter on turn 1.](https://x.com/davflamerock/status/1803831022523470323)

* [Bounties stack and cost discounts stack.](https://x.com/davflamerock/status/1805679212197445980)

* ["Next unit" discounts are consumed by playing a unit for free.](https://x.com/davflamerock/status/1805700413985013808)

* [First Light cost can be paid by defeating a Shield token.](https://x.com/davflamerock/status/1805985459882889705)

* [Migs triggers on Spark of Rebellion.](https://x.com/davflamerock/status/1806694108305453377)

* [Unrefusable Offer fails to resolve if Spare the Target collects the bounty.](https://x.com/davflamerock/status/1808642970817564881)

* [Lando leader and Timely Intervention: defeat resource prior to resolving Ambush.](https://x.com/davflamerock/status/1809626326082449872)

* [Defeating DJ with unique rules does not allow you to keep the stolen resource permanently.](https://x.com/davflamerock/status/1810364597062307986)

* [Superlaser Technician and Unrefusable Offer are mutually exclusive.](https://x.com/davflamerock/status/1810561816805695791)

* [When Lando leader smuggles, replace the resource before destroying a resource.](https://x.com/davflamerock/status/1810561430271271234)

* [Omega does not ignore her own aspect penalty.](https://x.com/davflamerock/status/1811195783007596772)

* [Omega ability text is not active while playing her.](https://x.com/davflamerock/status/1824134630053761197)

* [Bravado is determined by who owns the ability that caused defeat, passive HP modifiers like Snoke still count.](https://x.com/davflamerock/status/1811545409707475391)

* [Calculated Lethality can target Lurking TIE Phantom, it will not be defeated, but you do gain experience per upgrade.](https://x.com/davflamerock/status/1811805407498616953)

* [Bossk leader does not double collect Bounty if simultaneously defeated in combat.](https://x.com/davflamerock/status/1811804215729160363)

* [Resolve Poe's chosen options in any order](https://x.com/davflamerock/status/1812904489281585571)

* [IG-11 damage effect replaces the capture effect, so it happens at that same timing point.](https://x.com/davflamerock/status/1813607378954461241)

* [Lurking TIE should be read as immune to "enemy" "card ability" not "enemy card" "ability", so it is immune to the bounty on a friendly Val.](https://x.com/davflamerock/status/1815966557694013696)

* [If you control a unit with an opponent's Heroic Resolve attached, you can use the ability, defeating the upgrade to pay the cost.](https://x.com/davflamerock/status/1818014745175392311)

* [Krayt vs Force Lightning: Krayt triggers, then ability is blanked, then the ability resolves and controller of ability deals 1 damage.](https://x.com/davflamerock/status/1824107830246326670)

* [Cost modifier on Bravado can apply when smuggling.](https://x.com/davflamerock/status/1826080749323178214)

* [Player A controls a Clone Deserter and Player B controls a Snoke, then Player C plays a Snoke. Player C will resolve the bounty.](https://x.com/davflamerock/status/1834683333877301725)

* [If conditional Overwhelm is lost before combat damage resolution, excess damage does not apply to base.](https://x.com/davflamerock/status/1829563590640283671)

* [All components of Reinforcement Walker ability are ignored on an empty deck.](https://discord.com/channels/1079526508688847078/1079527291283067020/1214252641174028348)

* [Moving Traitorous around with Survivors Gauntlet.](https://discord.com/channels/1079526508688847078/1173630114379079711/1240331386058051686)

* [For Moff Gideon, both the power and the Overwhelm are only while attacking a unit.](https://discord.com/channels/1079526508688847078/1079527291283067020/1225162007628484719)

* Chirrut doesn't die to negative HP modifiers during action phase.

* Krayt Dragon always triggers.

* Lurking TIE Phantom is immune explicitly to defeat, capture, and damage from enemy abilities (except indirect!), which means actual combat damage, HP modifiers, and return to hand are usually the best options for removing it.

---

## Set 3: TWI — Twilight of the Republic (Block 0)

### Question: If Caught In The Crossfire is played in Twin Suns by Player A and they select a unit from Player B and a unit from Player C in the same arena, and Player C's unit has a bounty and is defeated, does Player A or Player B get to collect the bounty?

And why? Does 1.18 apply to Bounty control? Following the current CR as written it seems that Player A, as the active player who played the event, would NOT collect the bounty, it would instead go to Player B, but this seems counter to other rulings such as how Lurking TIE Phantom functions.

**Answer:**

According to 1.18.1A, the player whose unit deals lethal damage is considered before the player whose ability is played, so in your example, Player B collects the Bounty.

`(Answer shared on 2025-01-20)`

-------------------------------------------------


* [If one of the defenders when Darth Maul attacks is upgraded with Electrostaff, the negative power modifier applies to the whole attack, including the other defender.](https://bsky.app/profile/davflamerock.bsky.social/post/3lct4xvzb5s27)

* [A unit with Coordinate always has that keyword regardless of unit counts.](https://x.com/davflamerock/status/1824086962552074461)

* [Darth Maul does one attack with two targets, dealing full damage to both and receives all the damage back.](https://x.com/davflamerock/status/1811218025653350831)

* [Han2 leader ability can combo with Exploit.](https://x.com/davflamerock/status/1829682524441743773)

* [Exploit unit is in play by the time When Defeated triggers resolve from "exploited" units.](https://x.com/davflamerock/status/1835807491357327579)

* [Jango Fett leader ability only triggers if unit actually takes damage (not replaced by shield, etc).](https://x.com/davflamerock/status/1836831008811012305)

* [Jango Leader + Overwhelming Barrage will exhaust one unit (front side) or all the units (deployed side), but the damage can't be dealt to Lurking TIE Phantom because it is still a card ability.](https://x.com/davflamerock/status/1836793952818594013)

* [Damage from an ability like Vambrace Flamethrower can't be dealt to Lurking TIE Phantom, but it is dealt from the attached unit, so Jango + Flamethrower will exhaust all damaged units. Also works with Bossk, Dengar, Emperor Palpatine (unit) abilities.](https://x.com/davflamerock/status/1836797062106485217)

* [Piett's passive ability goes away before the card is finished being played, so he wouldn't give Ambush if he's sacrificed to Exploit.](https://x.com/davflamerock/status/1839313379967775124)

* [Lando leader can be used as a soft pass but you must defeat a resource.](https://x.com/davflamerock/status/1841253357039579265)

* [Jar Jar Binks randomly picks from entire pool of bases and units of all players.](https://x.com/davflamerock/status/1841938532950278237)

* [Unlimited Power must be different units for each damage assignment.](https://x.com/davflamerock/status/1843867562079334541)

* [Using Clone on a card with Exploit does not allow Clone to use Exploit.](https://x.com/davflamerock/status/1845891327659061621)

* [When defeated, Clone reverts completely, so it is not eligible for any effects based on traits it had while it was a copy.](https://x.com/davflamerock/status/1845891268653556025)

* [If Clone copies an enemy Krayt, that opponent deals 9 damage when resolving the trigger from Krayt.](https://x.com/davflamerock/status/1845958005478633599)

* [Defense of Kamino only applies to units in play when the event is resolved.](https://x.com/davflamerock/status/1846774997496537597)

* ["Chancellor Palpatine Playing Both Sides" is Heroism for deck building in Twin Suns.](https://discord.com/channels/1079526508688847078/1108048788762931250/1296854323246137416)

* ["Chancellor Palpatine Playing Both Sides" will not flip without the defeated unit condition being met.](https://x.com/davflamerock/status/1847308603775934898)

* ["Chancellor Palpatine Playing Both Sides" stays exhausted when flipping.](https://x.com/davflamerock/status/1847313783707849198)

* ["Chancellor Palpatine Playing Both Sides" only provides access to the currently face up aspects.](https://x.com/davflamerock/status/1847640433100542417)

* [Clone will trigger and resolve the When Played abilities gained from the original cloned card.](https://x.com/davflamerock/status/1847640608460177576)

* [Barriss Offee's constant ability is a passive that applies to any unit that's been healed this phase while she's in play. It's not permanent or stacking.](https://x.com/davflamerock/status/1848861947288285480)

* [Darth Maul defeating two units at once does trigger Ruthlessness twice.](https://x.com/davflamerock/status/1850596777319121238)

* [Token unit custom substitutions will be up to TO.](https://x.com/davflamerock/status/1850965089362325948)

* [Darth Maul + Corner the Prey will get a single power bonus equal to the sum of both defender's damage.](https://x.com/davflamerock/status/1851353813304639801)

* [Darth Maul vs Sentinel, if the opponent has multiple units and only one Sentinel, Maul can only attack the Sentinel.](https://x.com/davflamerock/status/1851353813304639801)

* [If Bright Hope When Played targets a token unit, the controller still gets to draw a card.](https://x.com/davflamerock/status/1852106519082418337)

* [Capture targeting a token with a bounty: it does count as captured when it is set aside, and the bounty is collectable.](https://x.com/davflamerock/status/1852106904434282899)

* [Resources may be shuffled in any way if an opponent wishes to interact with them, as long as the NUMBER of ready is maintained, but not in the middle of resolving that interaction.](https://x.com/davflamerock/status/1852131316537426404)

* [Count Dooku Exploiting for When Played ability can assign all damage to one unit all at once, or assign the individual damage amounts to separate units.](https://x.com/davflamerock/status/1853189737781006429)

* [Chancellor Palpatine Playing Both Sides: leader ability can be used as a soft pass, but to resolve any of the ability the initial "if" condition must be true.](https://x.com/davflamerock/status/1852563553816834183)

* [Cloning a token unit doesn't make Clone behave like a token unit when leaving play, but it does count as a token unit while in play.](https://x.com/davflamerock/status/1857184457456750843)

* [Empty deck damage is caused by the player to their own base.](https://x.com/davflamerock/status/1857149881116144007)

* [I Have The High Ground event applies the lasting effect to the chosen friendly unit, so enemy units played later will still be impacted.](https://x.com/davflamerock/status/1858943562777264370)

* [Exploited units are defeated simultaneously. FFG Video time stamped at 40 minute mark.](https://youtu.be/rmGkF2R_UU8?t=2399)

* [Seventh Sister ability can trigger via Overwhelm.](https://x.com/davflamerock/status/1835550402848125366)

* [A Once Per Round ability limit is attached to the copy of the card, not based on controller. It can't be used again if control changes in the same phase after it's been used.](https://bsky.app/profile/davflamerock.bsky.social/post/3lihoqgkac227)

---

## Set 4: JTL — Jump to Lightspeed (Block A)

### Question: If Corvus When Played ability is doubled, can two pilots be attached?

Player A is playing **Chancellor Palpatine - Playing Both Sides** with a common Vigilance base. They have Qui-Gon Jinn's Aethersprite in play, as well as Astromech Pilot and Independent Smuggler as units in play.

Player A attacks with the Aethersprite, and then plays Corvus. Can Astromech Pilot and Independent Smuggler both be attached as pilot upgrades to Corvus?

**Qui-Gon Jinn's Aethersprite - Guided by the Force** says:

***On Attack**: The next time you use a "When Played" ability this phase, you may used that ability again.*

**Corvus - Inferno Squadron Raider** says:

***When Played**: You may attach a friendly Pilot unit or upgrade to this unit.*

**CR 3.6.3.B** says:

*While a non-upgrade card is attached as an upgrade, it is considered to have an attachment restriction including any attributes specified by the ability that attached it as an upgrade. If the card ceases to be in play as an upgrade, it loses this attachment restriction. For another unit to be considered “eligible” for that upgrade, it must account for this attachment restriction (i.e. the upgrade must have been able to attach to that unit via the original ability).*

*For example, a card with Piloting specifies that if the card is played as an upgrade, it must be played on a friendly Vehicle unit. If a player uses Piloting to play a card as an upgrade, that upgrade has the attachment restriction: “Attach to a friendly Vehicle unit”.*

*For another example, Phantom II (JTL #050) has an action ability that lets you attach it as an upgrade to The Ghost. If a player uses this ability to attach Phantom II as an upgrade, that upgrade has the attachment restriction: "Attach to The Ghost."*

The attachment restriction for upgrades attached by Corvus appears to be only "attach to this unit" with no regard for how many pilots are present?

**Answer:**

Yes, the attachment restriction created by Corvus’s “When Played” ability is “Attach to Corvus.” If Corvus’s “When Played” ability is doubled, two units may be attached to Corvus as upgrades. Note that if Corvus’s “When Played” ability is used to attach a friendly Pilot upgrade to Corvus, that upgrade likely still has its original attachment restriction of “Attach to a friendly Vehicle unit without a Pilot on it.” As a side-note, the example cited in 3.6.3B should say that Piloting establishes the attachment restriction “Attach to a friendly Vehicle unit without a Pilot on it.” That will be fixed in CR7.

`(Answer shared on 2025-11-25)`

-------------------------------------------------


### Question: Does JTL Admiral Yularen ability apply to units not in play when the trigger resolves?

**Admiral Yularen** says:
*When played: Choose Grit, Restore 1, Sentinel, or Shielded. While this unit is in play, each friendly Vehicle unit gains the chosen Keyword.*

**CR 7.7.3.D** says:
*By default, a lasting effect only applies to a card that’s in play at the time of the lasting effect’s creation. For a lasting effect to affect a card in an out-of-play zone, the ability that created that effect must explicitly state so.*
*For example, Rallying Cry (SOR #154) gives each friendly unit Raid 2 for the phase. Only friendly units that were in play when Rallying Cry was played get Raid 2 for the phase; any units that enter play after this time do not get Raid 2.*

Per this rules text, only things in play at the time the trigger resolves could benefit, which makes the use of Shielded as one of the keyword options seem strange, as it would be granting a keyword that can't trigger.

We know that Yularen's lasting effect "locks in" at the time of the resolution of the triggered ability so that change in control does not matter, similar to Regional Governor:
*Until Yularen leaves play, each friendly Vehicle unit gains the chosen keyword. This effect is not changed if an opponent takes control of Yularen.*

So does Yularen's "gain a keyword" apply to:

* Units in play when the trigger is resolved
* Units in play when the trigger is resolved and units that are played after

If the first option is not correct, and 7.7.3.D does not apply here, are there other cards that function similarly currently, and how do we differentiate that behavior in the future?

Previous related examples (besides Rallying Cry in 7.7.3.D) include how In Defense of Kamino does not apply to units that are played after the event, while I Have the High Ground does apply to units played after the event.

**Answer:**

Admiral Yularen's lasting effect is intended to function like a constant ability, much like SOR Admiral Piett unit. It applies both to units already in play and units that are played after the ability triggers. We’ll make an erratum for this card.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: How does JTL Han Solo Leader deploy interact with Plot?

**JTL Han Solo - Never Tell Me The Odds** says:
***When deployed as an upgrade:** For each friendly unit or upgrade that has an odd cost, ready a resource.*

The behavior of Plot keyword appears to be like a "when your leader deploys" triggered ability, and the instruction on stream was to play out all Plot cards before replenishing resources from your deck.

This is not a problem if you resolve all of your Plot keywords before you refill your resources, and then use Han's ability to ready those resources, but what if you want to ready resources with Han's deploy triggered ability to then play more plot cards?

Or must all Plot cards triggered by a leader deploy be resolved together as a single ability?

**Answer:**

All cards you intend to play with Plot must be revealed when you deploy your leader (in the same way as LOF Rey, to show that the ability is triggering). Then, each Plot must be played one at a time. Just like Smuggle, Plot cards and the cards that replace them from the deck enter play at the same time, so you will always have the same number of resources while you resolve Plots. JTL Han will be able to ready those resources if you sequence appropriately.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: Can deployed JTL Thrawn leader unit double SEC Arihnda Pryce if Thrawn is the chosen friendly unit?

Alternately, does a "when you use a X ability" triggering condition trigger when the ability STARTS to resolve, or only after it is finished resolving?

**Arihdna Pryce - On The Road To Power** says:
***When Defeated:** You may defeat another friendly unit. If you do, deal 4 damage to each enemy base.*

**Grand Admiral Thrawn - ...How Unfortunate** says:
***When you use a "When Defeated" ability:** You may use that ability again. Use this ability only once each round.*

**CR 7.6.11** says:
*After resolving a triggered ability “A”, if any new abilities were triggered while resolving it, the new abilities are considered “nested abilities” and must be resolved before any other abilities triggered at the same time as ability “A”.*

"While resolving" seems to indicate that if the ability has started to resolve at all that the triggering condition has been met.

Let's say that Thrawn is deployed in play as a unit, and Pryce is defeated. When resolving the When Defeated ability, the controller chooses Thrawn as the friendly unit to defeat. A When Defeated ability has begun to be resolved, so does Thrawn's ability trigger, and thus may still be resolved as a nested ability even though he is no longer in play?

**Answer:**

Thrawn’s ability will trigger in this scenario. Choosing to resolve an ability is “using the ability,” so Thrawn will see it happen even if he is defeated as part of that ability.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: If JTL Lando uses his leader ability to play Brain Invaders, is the shield token still able to be placed?

Assume there is already a friendly unit in the space arena.

Lando's ability says:
*Play a unit from your hand (paying its cost). If you do and you control a ground unit and a space unit, give a Shield token to a unit.*

Brain Invaders says:
*Each leader loses all abilities except for epic actions and can't gain abilities.*

CR 6.4.5 says:
*Resolve the action ability. If the cost was successfully paid, resolve as much of the ability as possible and ignore any part of the ability that cannot resolve.*

CR 7.2.2 says:
*A player must pay the full cost of an action ability in order to resolve that ability. After a player pays the cost to use an action ability, they resolve that ability’s effect, described by the non-bold text after the word “Action."*

Since the costs were paid, it seems the entire ability still needs to finish resolving and thus a shield token would be able to be placed, despite leaders losing their abilities when the unit enters play, prior to the shield token being placed. Is that correct?

**Answer:**

Brain Invaders cannot blank a currently resolving ability. Lando loses the ability, but the ability that has already begun resolving resolves in full.

`(Answer shared on 2025-05-19)`

-------------------------------------------------


### Question: How does Shadow Caster actually function? Can it double Grim Valor?

From a previous clarification:

*Last Known Information remembers values that the game state might have otherwise lost, like the power of a defeated unit whose When Defeated ability deals damage equal to its power. Abilities are not active from the discard pile while resolving the "When Defeated" abilities, however, so Targeting Computer does not let you assign the indirect damage.*

Grim Valor is granting a when defeated ability to a unit that triggers at the moment the unit is defeated. When Shadow Caster "looks" for When Defeated abilities that can be used again, when and how does it do this?

Is it Last Known Information based on the state of the unit at the moment it was defeated, including abilities granted, or does the ability granted by Grim Valor not count?

**Answer:**

In order for it to function, Shadow Caster's ability specifically asks you to care about what "When Defeated" abilities the defeated unit had, so which When Defeated abilities were on the unit are covered by LKI. Compare this to Targeting Computer - if a specific ability cared about "how many abilities" a unit had when it was defeated, LKI would cover the fact that the unit had been given an ability by Targeting Computer. However, the specific ability that Targeting Computer gives isn't still active on the unit. Last Known Information specifically covers information that is necessary in order to resolve abilities.

`(Answer shared on 2025-04-30)`

-------------------------------------------------


### Question: Must JTL Annihilator's ability discard from opponent’s hand?

AP uses JTL Annihilator to defeat a copy of *Kylo’s TIE Silencer* and finds a copy in NAP's hand, and one in the deck. It is clear that AP can "fail to find" the copy in NAP's deck due to hidden information rules, but is AP obligated to discard the copy in NAP's hand? Or does this also fall under hidden information rules and they may choose to "fail to find" the copy in hand as well?

1.17.2 *“Hidden information” refers to information that has restrictions on when it can be known, and by whom. All information that is not open is considered hidden, such as the order of cards in each player’s deck. Certain information may be considered hidden information for only one player and not both players, such as cards in a player’s hand or a player’s resources.*

1.17.4 *A player may choose to resolve an action or ability that involves information hidden to an opponent as though they have fewer options than they really do. That player still must do as much as they can when resolving such an ability, up to the point of hidden information being revealed. The player must still change the game state in some way for this to be considered an action.*

4.7.4 *The cards in a player’s hand may be looked at only by that player, and the faceup sides of those cards are considered hidden information for that player’s opponent. The number of cards in a player’s hand is considered open information.*

8.26.1 *To “reveal” a card means to make a card temporarily open information by showing it to both players. Abilities can cause a player to reveal cards from their deck, hand, or resource zone.*

8.27.3 *While searching a zone whose cards are hidden information, players must keep searched cards hidden from any player (other than themselves) to whom the cards are hidden information.*

**Answer:**

Yes, Annihilator's ability means you are obligated to discard named cards you find in your opponent's hand. You can't "fail to find" from that zone because that zone is not hidden information for your opponent.

`(Answer shared on 2025-04-30)`

-------------------------------------------------


### Question: What effect, if any, does Commandeer have when played on a unit you already control?

Consider the 3 sentences of card text:

1. *Take control of a non-leader Vehicle unit that costs 6 or less without a Pilot on it.*
2. *If you do, ready it.*
3. *At the start of the next regroup phase, return that unit to its owner's hand.*

CR 8.10.1

*Some abilities use the phrase “if you do.” In order to resolve the text following “if you do,” the text preceding “if you do” must be resolved in full. Additionally, the text following “if you do” must resolve if the text preceding “if you do” is resolved in full.*

CR 1.5.4.F

*A ready card can be chosen for a readying effect, but the chosen card does not change orientation and is not considered to have been readied for the purpose of “If you do” effects. An exhausted card can be chosen for a exhausting effect, but the chosen card does not change orientation and is not considered to have been exhausted for the purpose of “If you do” effects.*

Applying sentence 1 to a valid unit that we already control seems reasonable based on the precedent of CR 1.5.4.F, but then would likely not count for sentence 2 based on CR 8.10.1. Is that correct?

Then, does sentence 3 also fall under the "if you do" logic, or does it resolve separately, so that you could return the chosen unit to the owner's hand even if it was not readied by sentence 2?

**Answer:**

Yes, you can choose a unit you already control with Commandeer. You don't take control of it, so you don't ready it. The final sentence isn't under the "if you do" clause, so you do return it to its owner's hand. I'll update 8.10.1 to avoid ambiguity in CR5.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: For Each/Focus Fire simultaneously dealing damage?

“FOR EACH” Abilities that use the phrase “for each” to create multiple effects are resolved by determining how each effect of the ability will be resolved, then resolving all effects simultaneously.

The main point of contentions are that the clarifications seem to make a correlation that the word "simultaneously" means "combined", but nothing in the CR clarifies that.

The "FOR EACH" rule above seems pretty clear that I'm creating multiple effects in all the instances above, yet if I deal the damage all to the same target, the multiple effects get combined into one instance of damage. How is this supported in the CR?

**Answer:**

There will be an entry in CR5 to clear this up. An ability worded as "Deal 1 damage, then deal 1 damage" is two separate instances of damage. Something like "For each X, deal 1 damage" is calculated and applied as one instance of damage.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: Is Annihilator based on LKI when choosing a Clone in play?

If I use Annihilator's when played ability on a Clone card in play, do I discard Clones or or the cloned card from the deck and hand?

Essentially, if Chewbacca was cloned, would Annihilator be searching for Chewbacca or Clone?

**Answer:**

Yes, LKI covers attributes like names, so it searches for cards that share a name with the card Clone was a copy of while in play.

`(Answer shared on 2025-03-25)`

-------------------------------------------------


### Question: Does Red Leader discount for any friendly upgrade or only friendly PILOT upgrades?

Red Leader probably should be read as "each friendly PILOT (unit and upgrade)" however the language templating is very different on Padawan Starfighter.

**Answer:**

Red Leader discounts for each Pilot unit and Pilot upgrade.

`(Answer shared on 2025-02-18)`

-------------------------------------------------


* [Pilot leaders deployed as upgrades are vulnerable to upgrade removal.](https://x.com/davflamerock/status/1864353688514396577)

* [Chewie and Han can pilot on to Falcon in either order.](https://x.com/davflamerock/status/1864356237212520768)

* [Pilot leader upgrades affected by Bamboozle are defeated,](https://x.com/davflamerock/status/1864367348762771941) and [pilots that are in play as units count as having the keyword for Daimyō Boba.](https://x.com/davflamerock/status/1864372691974697291)

* [Piloting and Smuggle are both alternate costs, and can't be played together. Choose one or the other!](https://bsky.app/profile/davflamerock.bsky.social/post/3lcj5ajy3r222)

* [Indirect damage ignores shields, and must be assigned to targets with sufficient remaining HP that it is not wasted.](https://bsky.app/profile/davflamerock.bsky.social/post/3lcj5rjx27s2u)

* [Unique Pilot can't be in play as a unit and as an upgrade simultaneously.](https://x.com/davflamerock/status/1864441597783351536)

* [A Piloting keyworded card can be played via U-Wing Reinforcement (must come out as a unit), OR via A Fine Addition (must come out as an upgrade).](https://bsky.app/profile/davflamerock.bsky.social/post/3lcl2inaa2s2a)

* [Pilot upgrades do not ready attached unit when deployed.](https://bsky.app/profile/davflamerock.bsky.social/post/3lcjhaeyzok2y)

* [Pilot upgrades are defeated like any other upgrade if something happens to the attached unit.](https://x.com/davflamerock/status/1864467346284278118)

* [When a Pilot leader deploys as an upgrade and grants leader status to a unit, it does not alter the aspects provided by your deck construction.](https://bsky.app/profile/davflamerock.bsky.social/post/3lcl63bvc4k2o)

* [Pilot upgrades do not grant traits to attached units unless explicitly stated.](https://x.com/davflamerock/status/1877894904598106253)

* [Pilots can be played as upgrades by cards that explicitly play only upgrades, but they can't be searched for or drawn by cards that search for or draw upgrades specifically, as they still count as units while in deck and discard.](https://x.com/davflamerock/status/1878259405105639438)

* [Pilots that were defeated as upgrades can be returned to hand by Gar Saxon's deployed leader unit ability that grants a When Defeated to upgraded units, due to Last Known Information rules.](https://bsky.app/profile/davflamerock.bsky.social/post/3lgbyvy5quk2j)

* [Eligible Pilots can be played by Cobb Vanth ability as a unit or an upgrade.](https://bsky.app/profile/davflamerock.bsky.social/post/3lggq5zgctk2u)

* [Indirect damage can only be assigned to deployed Chirrut leader unit up to remaining HP.](https://x.com/davflamerock/status/1879321937748652342)

* [Red Leader cost discount benefits from friendly PILOT units and friendly PILOT upgrades. Source includes some language templating philosophy as well.](https://x.com/davflamerock/status/1879964533701398737)

* [JTL Thrawn does not work on bounties. Also, keywords don't actually count as the abilities that they shorthand represent.](https://bsky.app/profile/davflamerock.bsky.social/post/3lg6rycfxsk2b)

* [JTL Thrawn deployed as a leader unit needs to be in play when the ability resolves in order to trigger it again.](https://x.com/davflamerock/status/1881383305645613110)

* [JTL Thrawn does not double Gideon Hask's ability, it only works with abilities that explicitly say "When Defeated" and not other variations of that.](https://x.com/davflamerock/status/1881426616943100335)

* [Indirect damage caused by an ability from a unit does trigger TWI Jango leader ability.](https://x.com/davflamerock/status/1882442362418528612)

* [A "space unit" (when referring to units in play) is a unit in the space arena.](https://bsky.app/profile/davflamerock.bsky.social/post/3lhec62k5sk26)

* [Wingman Victor Three played via Piloting can't grant XP to the attached unit.](https://bsky.app/profile/davflamerock.bsky.social/post/3lhrrr5z3bc25)

* [JTL Poe can deploy as a unit even if he was previously in play due to a combo like playing him as an upgrade and then Eject. Since Poe does not make attached units in to leader units, those units can be successfuly stolen by change of control effects, and Poe remains attached. The player that owns Poe still controls Poe and thus can still activate his ability to move him to a friendly vehicle.](https://bsky.app/profile/davflamerock.bsky.social/post/3lhwet3vxss2c)

* [JTL Poe can not attach as a pilot where R2 is already piloting, R2 would have to be piloted on to vehicle after Poe.](https://bsky.app/profile/davflamerock.bsky.social/post/3lhwjohgqn22q)

* [JTL Luke leader as a pilot upgrade is defeated by Bamboozle despite the protection.](https://bsky.app/profile/davflamerock.bsky.social/post/3li3jimisw227)

* [JTL Admiral Trench leader deploying on an empty deck does not deal damage to your own base.](https://bsky.app/profile/davflamerock.bsky.social/post/3li3pm5fgic2w)

* [JTL Krennic can provide his discount while being Exploited for an additional discount. Cost discounts may be applied in any order, to be clarified in CR5 update.](https://bsky.app/profile/davflamerock.bsky.social/post/3li3ozosqoc2w)

* [JTL "No Glory, Only Results" event played on an opposing Snoke: Results in active player controlling the constant ability of -2/-2 for an instant long enough to defeat enemies with 2 HP remaining, prior to Snoke being defeated by the next part of the event card text.](https://bsky.app/profile/davflamerock.bsky.social/post/3li3oxlmbak2w)

* [JTL Ghost propagates the entire text of a BOUNTY keyword to other spectre units.](https://bsky.app/profile/davflamerock.bsky.social/post/3li5nkstkd22l)

* [JTL Swarming Vulture limit of 15 copies applies in Twin Suns as well as in Premier.](https://bsky.app/profile/davflamerock.bsky.social/post/3li5gsmdblk2q)

* [JTL Kazuda Xiono leader ability does not retroactively nullify effects generated by already resolved triggered abilities.](https://bsky.app/profile/davflamerock.bsky.social/post/3lihzv6hfts2n)

* [JTL Swarming Vulture limit of 15 applies to deck building, removing it during game play has no impact.](https://bsky.app/profile/davflamerock.bsky.social/post/3lihonvkyek27)

* [JTL CR4 update will alter how "Lose" an ability functions in the rules. Once an ability is lost, it can not be regained from another source. This is a change in rules that is not active until JTL set releases.](https://www.youtube.com/watch?v=LxzljnKY7Hw&t=294s)

* [Upgrade eligibilty should be checked any time the upgrade is attached, but the upgrade won't fall off if it becomes invalid later on (such as "Attach to a Force unit" temporarily losing the Force trait).](https://bsky.app/profile/davflamerock.bsky.social/post/3lj65yfns7s2c)

* [Pilots already in play can't be moved to a non-vehicle unit.](https://bsky.app/profile/davflamerock.bsky.social/post/3ljjsyboyb22x)

* [If a captured unit is guarded by a pilot unit that gets picked up by Corvus, making the pilot an upgrade, the captured card stays guarded by the (now upgrade) pilot. If the pilot (upgrade) leaves play, the card will be rescued.](https://bsky.app/profile/davflamerock.bsky.social/post/3lk2tcbqv7s2h)

* [If a leader pilot grants "Attached unit is a leader unit" and Brain Invaders is played, the attached unit no longer counts as a leader, and is unaffected by Brain Invaders.](https://bsky.app/profile/davflamerock.bsky.social/post/3lleqn52jxc2j)

---

## Set 5: LOF — Legends of the Force (Block A)

### Question: Does LOF Third Sister leader unit ability grant the Hidden keyword permanently?

LOF Third Sister - Seething With Ambition deployed as a unit has **On Attack:** *The next unit you play this phase gains Hidden.*

Most abilities that grant a keyword have specified a duration, including the other side of this leader. Is Third Sister's ability granting the keyword permanently?

Even though Hidden has an effect that only lasts for a phase, the existence of the keyword itself past that point matters for abilities that look for the existence of keywords.

**Answer:**

Third Sister does not give Hidden permanently. This has been addressed with an erratum which was released with LOF.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: How do Clone and Size Matters Not interact?

**Size Matters Not** says:
*Attached unit's printed power is considered to be 5 and its printed HP is considered to be 5.*

**CR 8.30.3** says:
*If a unique card has all of the same printed attributes as another unique card, it is considered a “copy” of that card and vice versa; but if one unique card has one or more different printed attributes from another unique card, it is not a “copy” of that card.*

We are told that Size Matters Not does NOT count to get around the unique card controlled by a player limit.

So does this mean that the language "printed attribute is considered to be X" does not actually change the printed attributes that Clone looks at when entering play?

**Answer:**

Size Matters Not makes the attached unit's power and HP considered as 5 when those stats are looked for by another ability, but not for the general game rule of determining what a “copy” is. This will be clarified in CR6, along with updates to the uniqueness rule.

`(Answer shared on 2025-09-29)`

`Editorial note: Clone makes a 5/5.`

-------------------------------------------------


### Question: How does LOF Rey actually work, exactly?

**Rey - With Palpatine's Power** says:
***When you draw this card during the action phase:** If you control a {aggression} leader or base, you may reveal this card from your hand. If you do, deal 2 damage to a unit and 2 damage to a base.*

**CR 1.3.2** says:
*Do as Much as You Can: While resolving a card ability, resolve as much of the ability as possible, and ignore any parts of the ability that cannot be resolved. (Note that you may choose to resolve abilities involving hidden information as though you have fewer options than you really do.)*

**CR 1.13.3** says:
*If a card’s ability triggers when that card is drawn, the drawn card must be revealed before being added to the other cards in a player’s hand.*

Assume Player A is playing **Yoda - Sensing Darkness** with a common Aggression base.

That leader ability says:
*If a unit left play this phase, draw a card, then put a card from your hand on the top or bottom of your deck.*

Scenario 1:
Player A plays **Do or do not**, and chooses to draw a single card. They draw a copy of Rey.

Prior to adding Rey to their hand, they reveal Rey to demonstrate the trigger, unless they wish to not use that ability, in which case they do not reveal the card.

Player A now has Rey in their hand, and a pending trigger to resolve. They reveal Rey as a part of the resolution, and deal 2 damage to a unit and 2 damage to a base.

Is this correct, or does the reveal during the trigger replace the reveal during resolution? The reveal during trigger is actually optional if Player A doesn't want to use the ability?

CR 1.3.2 currently only references hidden information with resolving abilities, not with triggering abilities.

Scenario 2:
Player A activates Yoda leader ability. They draw Rey and reveal Rey. If they put Rey back in to the deck, do they still resolve the ability? What if they have a second Rey in hand? In this case, this could have been considered a net effect of the same result, as either Rey could have validly been returned to the deck.

Scenario 3:
Player B plays Lothal Insurgent. Player A draws and reveals Rey. A random die roll forces that Rey to be discarded. Do they still resolve the pending triggered ability? What if they have a second Rey in hand?  In this case, this would not be a net effect of the same result, as one specific Rey MUST be returned to the deck.

If the reveal upon trigger alone is insufficient, are players expected to leave Rey revealed until fully resolved, or do they add Rey to their hand and then reveal any copy of Rey again when resolving the effect? Or must they keep that copy of the card distinct in some other way?

**Answer:**

Scenario 1 is correct, and Player A deals 2 damage to a unit and 2 damage to a base. Showing your opponent that you’ve drawn Rey isn't a "reveal" in a game sense, it is done to maintain the game state and inform your opponent that an ability has triggered from a hidden zone. However, if you don’t intend to use Rey’s ability, you don’t need to show her trigger to your opponent when you draw her. In Scenarios 2 & 3, if the drawn Rey is returned to the deck, it is not in hand to be revealed as part of resolving the triggered ability. In order to account for multiple Reys in hand, the revealed Rey should remain separate from the other cards in a player's hand until resolved. She is still considered part of that player's hand, though, similar to how searched cards are still part of a deck while being searched. CR6 will distinguish between a game-action “reveal” and showing your opponent a card to maintain a functioning game state.

`(Answer shared on 2025-09-29)`

`Editorial note: Jonah talks about this at length in this video: [L2-25 2:52](https://youtu.be/MtCP9bZgLuI&t=171).`

-------------------------------------------------


### Question: Can LOF Kylo Ren leader play an upgrade that entered the discard during resolution of the When Deployed trigger?

AP has 10 resources ready and controls *LOF Kylo Ren - We're Not Done Yet* leader:
***When Deployed:** Play any number of upgrades from your discard pile on this unit (one at a time, paying their costs).*

**Scenario 1:**
AP has an Aggression base, *Snapshot Reflexes* and *Battle Fury* in their discard pile, and *Sith Holocron* in hand.

AP deploys Kylo, triggering his When Deployed ability.
AP begins resolving the ability by playing *Battle Fury* on Kylo paying 2, then *Snapshot Reflexes* paying 3.
AP now resolves the When Played on *Snapshot Reflexes* as a nested trigger by attacking NAP's base. This triggers the On Attack ability as a nested trigger from *Battle Fury* so AP discards *Sith Holocron* from their hand.
Since AP is now done resolving the *Snapshot Reflexes* triggered ability, we return to the top layer of the nested triggers, where Kylo's When Deployed trigger is still resolving.
AP plays *Sith Holocron* for 1 on Kylo, since it is now also in the discard pile.

**Scenario 2:**
AP has a Command base, and *Pillio Star Compass* x2 in their discard pile.

AP deploys Kylo, triggering his When Deployed ability.
AP begins resolving the ability by playing *Pillio Star Compass* on Kylo paying 2.
AP resolves the nested trigger by searching, revealing, and drawing a unit.
AP plays *Pillio Star Compass* paying 2, defeating the existing *Pillio Star Compass*.
AP resolves the nested trigger by searching, revealing, and drawing a unit.
AP plays *Pillio Star Compass* paying 2, defeating the existing *Pillio Star Compass*.
AP resolves the nested trigger by searching, revealing, and drawing a unit.
AP plays *Pillio Star Compass* paying 2, defeating the existing *Pillio Star Compass*.
AP resolves the nested trigger by searching, revealing, and drawing a unit.
AP plays *Pillio Star Compass* paying 2, defeating the existing *Pillio Star Compass*.
AP resolves the nested trigger by searching, revealing, and drawing a unit.
AP has finally exhausted all available resources, and passes.

Essentially, can AP play an upgrade on Kylo that was placed in the discard as part of resolving the When Deployed trigger, or are only upgrades that were present in the discard pile when the triggered ability started resolving eligible?

**CR 8.5** defines the term "Choose" and **CR 8.5.6** defines "any number" where it says:
*When a player must choose “a number” or “any number,” they may choose any whole number they wish, including 0.*

However, Kylo's ablity says "Play any number" instead of "Choose" so it is unclear if AP had to specify ahead of time how many/which upgrades they were playing to resolve the triggered ability.

Other cards are worded differently where the set of cards to play must be chosen via a search or reveal mechanic prior to beginning to play them, such as U-Wing Reinforcements, so the cards that will be played in resolving that particular ability are clearly set and can't be changed.

**Answer:**

Yes, the ability instruction “Play any number of cards” does not create a subset of legal cards at the beginning, and only checks what cards are legal choices when you go to play a new card. “Attack with 2 units” functions similarly, where you can wait to see how the first attack resolves before choosing which unit to attack with second. Note that Scenario 2 only works because when you play Pillio Star Compass from the discard pile or play Pillio Star Compass from the discard pile or play Pillio Star Compass from the discard pile, it enters play as a new copy of Pillio Star Compass. For comparison, SEC Mon Mothma’s “Attack with any number of units, even if they’re exhausted” would not let you attack with the same unit twice (unless it somehow left and re-entered play as a new copy while the ability was resolving.)

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: How does a temporarily granted Hidden keyword that is removed interact with LOF Dooku?

AP has *Grand Inquisitor, You're Right to Be Afraid* and *Fifth Brother, Fear Hunter* in play, which grants Fifth Brother the Hidden keyword.

AP plays *Dooku, It Is Too Late* which says:
***When Played:** Each friendly unit with Hidden can't be attacked for this phase.*

NAP plays *Waylay* on Grand Inquisitor, removing Hidden from Fifth Brother.

Can Fifth Brother be attacked for this phase?

**CR 7.7.3.D** under **Lasting Effects** says:
*By default, a lasting effect only applies to a card that’s in play at the time of the lasting effect’s creation. For a lasting effect to affect a card in an out-of-play zone, the ability that created that effect must explicitly state so.*
*For example, Rallying Cry (SOR #154) gives each friendly unit Raid 2 for the phase. Only friendly units that were in play when Rallying Cry was played get Raid 2 for the phase; any units that enter play after this time do not get Raid 2.*

Does the lasting effect of Dooku's When Played ability resolving look like "X can't be attacked for this phase" where X is any unit that has the Hidden keyword at the time of resolving the trigger? Or is the lasting effect dynamically updating which units it applies to, as we have heard is the case with JTL *Admiral Yularen, Fleet Coordinator*?

**Answer:**

Dooku’s ability applies to every unit that has Hidden when his ability resolves. If that Hidden is removed later, the unit is still protected. Yularen and other cards that behave like him will be receiving errata.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


* [LOF Marchion Ro doubles RAID. If multiple sources of RAID exist on a friendly unit, first add up the RAID value, then double it. ](https://www.youtube.com/watch?v=4ub67FndBQA)

---

## Set 6: SEC — Secrets of Power (Block A)

### Question: If an attacker with overwhelm has two defenders how is Overwhelm damage resolved if Queen Amidala defeats the other unit to prevent damage to herself?

**Queen Amidala: Championing Her People**
Naboo • Official
5/3
*If damage would be dealt to this unit, you may defeat another friendly unit that shares a TRAIT with this unit. If you do, prevent that damage.*

**Furtive Handmaiden**
Naboo
2/2

**Darth Maul: Revenge At Last**
5/6
*This unit can attack 2 units instead of 1.*

**Darth Maul's Lightsaber**
***When Played**: If attached unit is Darth Maul, you may attack with him. For this attack, he gains Overwhelm and can't attack bases.*
+4/+2

Player A controls **Darth Maul – Revenge at Last**, and attaches **Darth Maul’s Lightsaber**.
Player B controls **Queen Amidala – Championing Her People** and **Furtive Handmaiden** shares a trait with her.
Darth Maul attacks both Queen Amidala and Furtive Handmaiden, gaining Overwhelm for the attack. 
Darth Maul’s power for the attack is 9.
Player B chooses to defeat Furtive Handmaiden using Amidala’s replacement effect to prevent damage that would be dealt to Queen Amidala.
Overwhelm does no damage to base through Amidala since she is not defeated. 

Does Player B's base take 9 or 7 from Furtive Handmaiden being defeated? 

Does Darth Maul take 5 from Amidala or 7 from both Amidala and Furtive Handmaiden?

CR 7.5.7.F:
*If an attacker with overwhelm does not defeat the defender while attacking, no damage is dealt to the enemy base.*
We know that this is no longer accurate due to previous clarification regarding Grievous.

CR 1.9.11:
*“Excess damage” refers to damage that would be dealt to a unit beyond the amount needed to defeat that unit. Abilities such as the {overwhelm} keyword can affect excess damage. If a unit is defeated prior to being dealt combat damage by an attacker with {overwhelm}, all combat damage that would have been dealt to the unit is considered excess damage.*

CR 7.7.5.D:
*If a replacement effect replaces all of the standard resolution of a condition, ability, or action step, the standard resolution does not resolve and is ignored. In such a case, abilities can only trigger off of the replacement effect, and not the standard resolution of the ability. If a replacement effect replaces part of the standard resolution of a condition, ability, or action step, the resolution of the replacement effect and unreplaced standard resolution occur simultaneously.*

From a previous clarification answer:
> Yes, Player A can defeat one of the Spy tokens to prevent the damage to Queen Amidala. Queen Amidala’s replacement effect replaces part of the standard resolution of Bombing Run: the damage that she would be dealt. As mentioned above in 7.7.5D, the resolution of this replacement effect (a Spy token is defeated and damage to Amidala is prevented) occurs simultaneously with the unreplaced standard resolution (Player A’s other ground units are dealt damage). The Spy token in question is defeated and dealt 2 damage simultaneously.

As a comparison case: if an effect like **Bombing Run** would deal damage to Queen Amidala and another friendly unit, and Amidala defeats the other unit to prevent damage to herself, is damage still considered dealt to other units? Would abilities that trigger when non-combat damage is dealt like JTL Boba Leader still trigger?

**Answer:**

Darth Maul attacks Furtive Handmaiden and Queen Amidala at the same time. When we reach the Calculate combat damage step of the attack, we calculate that Darth Maul will attempt to deal 9 damage to both Furtive Handmaiden and Queen Amidala, the Furtive Handmaiden will deal 2 damage to Darth Maul, and Queen Amidala will deal 5 damage to Darth Maul. Then, we proceed to the End Attack step. All damage attempts to be applied at the same time. The defending player chooses to defeat the Furtive Handmaiden in order to prevent the 9 damage directed to her. Furtive Handmaiden is defeated and dealt 9 damage simultaneously, so 7 of the damage directed to it is considered excess damage, which Overwhelm applies to the base. The defending player’s base takes 7 damage, and Darth Maul takes 7 damage.
In both the Maul example and the Bombing Run example, Furtive Handmaiden is defeated and deal damage simultaneously, and is considered to be dealt damage for any other relevant abilities.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: If SEC Galen Erso names "Shield" what happens?

**Galen Erso: You'll Never Win** says:

***When Played:** Name a card. While this unit is in play, each non-leader card an opponent owns with that name, including those not in play, loses all abilities.*

**Shield** Token Upgrade ability text says:

*If damage would be dealt to attached unit, prevent that damage. If you do, defeat a Shield token on it.*

**6.3.2.C** says:

*If either unit that would be dealt damage has one or more Shield tokens attached to it, remove a Shield token from that unit and don’t deal it any combat damage.*

It appears that the functionality of a Shield token is baked in to the rules text regardless of whether or not the ability text on the Shield Token card has been lost. Is this correct?

Separately, what happens if Galen names a particular token unit or token upgrade that then changes control?

*Editorial note: As of CR 6 token upgrades are owned and controlled by the controller of the unit they are attached to, token units are owned by the creator of the token unit. The likely intent is that naming "Shield" with Galen is that any Shield token attached to a unit controlled by an opponent has no effect.*

**Answer:**

If a player names “Shield” with Galen Erso’s ability, all Shield tokens lose their abilities. 6.3.2C is meant to explain a common interaction and not bake Shield tokens into the rules (this is a remnant from when the CR was pulling double duty as an introduction to the game). We’ll update this for CR7.

The Editorial Note is correct. When a player takes control of a token upgrade, they also become the owner of that upgrade, so Galen Erso’s effect could start/stop affecting it. A token unit’s owner is the player that created it, so Galen Erso’s effect would not be changed by its controller changing.

`(Answer shared on 2026-02-10)`

-------------------------------------------------


### Question: Can Let's Talk capture fewer units than would be possible?

**Let's Talk** says:
*Each friendly unit captures an enemy non-leader unit in the same arena.*

**IG-11: I Cannot Be Captured** says:
*If this unit would be captured, defeat him and deal 3 damage to each enemy ground unit instead.*

If Player A chooses to have multiple units capture the same opponent unit, can they avoid attempting to capture IG-11, or must they maximize the amount of captures performed?

**Answer:**

Let’s Talk doesn’t force a player to attempt to capture IG-11 multiple times. It will be errata’d to “different enemy non-leader unit” for clarity.

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


### Question: Can SEC Queen Amidala defeat a unit that would be defeated simultaneously?

**Queen Amidala: Championing Her People** says:

***When Played**: Create 2 Spy tokens.*

*If damage would be dealt to this unit, you may defeat another friendly unit that shares a TRAIT with this unit. If you do, prevent that damage.*

Player A plays Queen Amidala, creating two Spy tokens.

Player B plays Bombing Run on the ground arena.

Is player A able to defeat one of the Spy Tokens with Queen Amidala's ability before the Spy is defeated by the damage from Bombing Run?

**CR 1.16.5** says:

*In order to maintain the game state, certain situations require immediate resolution and take priority over other waiting triggered abilities or action steps. If any of these situations arise, resolve them immediately as specified below before continuing with the game. If multiple situations are present at the same time, resolve them in the order of priority below until no such situations remain.*

**CR 1.16.5.E** says:

*If a unit has 0 remaining HP, it is defeated.*

**CR 7.7.5.C** says:

*A replacement effect must be resolved immediately upon its condition being met, unless the effect uses the phrase “you may.” If the player cannot perform the replacement effect, they must resolve the original effect and ignore the replacement effect.*

**CR 7.7.5.D** says:

*If a replacement effect replaces all of the standard resolution of a condition, ability, or action step, the standard resolution does not resolve and is ignored. In such a case, abilities can only trigger off of the replacement effect, and not the standard resolution of the ability. If a replacement effect replaces part of the standard resolution of a condition, ability, or action step, the resolution of the replacement effect and unreplaced standard resolution occur simultaneously.*

Is there a timing point of when damage WOULD be applied but has not been placed yet in which the replacement effect from Queen Amidala is taking place?

**Answer:**

Yes, Player A can defeat one of the Spy tokens to prevent the damage to Queen Amidala. Queen Amidala’s replacement effect replaces part of the standard resolution of Bombing Run: the damage that she would be dealt. As mentioned above in 7.7.5D, the resolution of this replacement effect (a Spy token is defeated and damage to Amidala is prevented) occurs simultaneously with the unreplaced standard resolution (Player A’s other ground units are dealt damage). The Spy token in question is defeated and dealt 2 damage simultaneously.

`(Answer shared on 2025-11-25)`

-------------------------------------------------


### Question: Does Padme Amidala Leader unit trigger multiple times if Rey is drawn during action phase?

**SEC Padmé Amidala - What Do You Have To Hide** deployed as a unit:
***When you reveal or discard 1 or more cards from your hand:** You may deal 1 damage to a unit.*

**LOF Rey - With Palpatine's Power**:
***When you draw this card during the action phase:** If you control a  leader or base, you may reveal this card from your hand. If you do, deal 2 damage to a unit and 2 damage to a base.*

**CR 1.13.3:**
*If a card’s ability triggers when that card is drawn, the drawn card must be revealed before being added to the other cards in a player’s hand.*

If an event causes AP to draw Rey, she is in the hand zone and must be revealed prior to adding to the rest of the cards in hand. Does this "rules reveal" trigger Padme or is it only the "ability reveal" that is stated in resolving the triggered ability? Since Padme deployed has no restrictions such as "once per round" does this result in 3 or 4 damage being applied to a unit?

**Answer:**

 Showing Rey for game state purposes is not considered a “reveal” for Padme, whereas abilities like Disclose are. Wording will be adjusted in CR6 to reflect this.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


### Question: Does SEC Sly Moore When Played ability apply to units not in play when the trigger resolves?

**SEC Sly Moore - Witness to Power** says:
*When Played: For this phase, each enemy unit gets -2/-0 while it's attacking a base.*

Does that include units played after Sly, if we assume they are readied in the same phase?

**TWI I Have the High Ground** used to say:
*Choose a friendly unit. Each enemy unit gets -4-0 while attacking that unit for this phase.*

But was changed by errata to:
*Choose a friendly unit. For this phase, while that unit is defending, the attacker gets –4/–0.*

We are also told that JTL Admiral Yularen applies to units already in play as well as units played after Yularen.

**CR 7.7.3.A** says:
*A lasting effect is a part of an ability that affects the game for a specified duration of time. Most lasting effects include the phrase “for this phase” or “for this attack.”*

**CR 7.7.3.D** says:
*By default, a lasting effect only applies to a card that’s in play at the time of the lasting effect’s creation. For a lasting effect to affect a card in an out-of-play zone, the ability that created that effect must explicitly state so.*

Further clarification on how to determine which lasting effects do or don't apply to units played after the resolution of the ability would be helpful.

**Answer:**

Sly Moore will be receiving a similar erratum to I Have the High Ground, and will affect any unit that attacks a base the phase she is played, even units that enter play after she does that phase.

`(Answer shared on 2025-09-29)`

-------------------------------------------------


---

## Set 7: LAW — Law and Order (Block B)

### Question: How should Max Rebo's ability be understood?

**Max Rebo: Encore!**
*There is an additional regroup phase after the first regroup phase each round.*

We have heard the intent is that Max should stack, so 4+ regroup phases are possible in Twin Suns and/or with the use of Clone.

The templating language here does not seem to follow any of the usual language for timing points that would result in a delayed effect or lasting effect, and it is not a triggered ability.

As a constant ability, this effect can update dynamically as the game state changes, which leads to a variety of questions.

What happens if one or more Max units exist and are removed from play or put in to play during regroup phases?

* If Max is defeated during the first regroup phase, do the players have a second regroup phase?
* If Max is rescued from capture during the first regroup phase, do the players have a second regroup phase?
* If Player A and Player B both have a Max in play:
  * How do you determine who "controls" the creation of the second regroup phase vs. the third regroup phase? Does Active Player (currently controlling initiative token) choose?
  * If Player B's Max is defeated during a second regroup phase created by Player A's Max, is there a third regroup phase?
  * If during the action phase, Player A plays Max with Sneak Attack, and uses Arrest to capture Player B's Max, and Player B plays Unrefusable Offer on Player A's Max... What happens when that action phase ends?

**7.3.1**
*A constant ability is always in effect while the card it is on is in play. Constant abilities don’t have any special styling.*

**7.3.2**
*A constant ability immediately comes into effect when the card it is on enters play and remains in effect while the card is in play.*

**8.9.1**
*Abilities that refer to the “first” occurrence in a phase or round (e.g. “The first event played this phase”) always refer to the very first occurrence in that phase or round, not the first after an ability becomes active. Abilities that affect the “first” occurrence in a phase or round do not apply their effects retroactively if they become active after the first occurrence has already taken place.*

**11.4.3:**
*If an ability that affects multiple players can be resolved simultaneously, resolve that ability simultaneously. Otherwise, the player that controls the card with the ability can choose the order in which each player is affected by the ability.*

**Answer:**

As a constant ability, Max Rebo’s ability is in effect if he is in play. His ability can be understood as a card-specific override of the traditional game structure step of 5.5.2, so the correct time to check whether there should be an additional regroup phase is at the end of the first regroup phase. Each Max Rebo creates an additional regroup phase if he is in play at that point in time. So, in answer the specific questions:

* If Max is defeated during the first regroup phase, there is no second regroup phase.
* If Max is rescued from capture during the first regroup phase, there is a second regroup phase.
* If there are multiple Max Rebos in play during 5.5.2, they each create a hanging “additional regroup phase” that are executed sequentially. Nothing happens if those Max Rebos leave play during those regroup phases (as their regroup phases have already been “created”), or if other Max Rebos enter play since they only create another regroup phase at the end of the first regroup phase. If relevant, the active player chooses the order in which those multiple regroup phases occur.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: How does Choke on Aspirations interact with damage replacement effects?

* Choke on Aspirations
  * Deal up to 5 damage to a friendly non-Vehicle unit. If it survives, heal damage from your base equal to the damage dealt this way.
* 1.9.9
  * If an ability prevents some amount of damage from being dealt to a unit or base, that damage is not considered dealt to that unit or base, and any abilities that would have triggered if that damage was dealt don’t trigger.

As of CR6, **8.21.1** says:

*If an ability prevents all damage from being dealt to a unit or base, do not place any damage counters on that unit or base. Any abilities that would trigger when damage is dealt don’t trigger.*

But in CR1 it used to say:

*If an ability “prevents damage” from being dealt to a unit or base, do not place any damage counters on that unit or base. **Damage is not considered dealt to that unit or base,** and abilities that would trigger when damage is dealt don’t trigger.*

Since Choke is not a triggered ability, do we still apply 1.9.9 and/or 8.21.1, or is damage that is prevented by a replacement effect still considered dealt for purposes of healing your base?

**Answer:**

The first half of 1.9.9 cited above covers this situation: any of Choke on Aspirations’ damage prevented by an effect is not considered dealt, so you do not heal for the prevented damage.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


### Question: Do you finish resolving Tear This Ship Apart before you play the selected card?

* Tear This Ship Apart
  * Look at all of an opponent's resources. You may play 1 of those cards for free. If you do, that opponent resources the top card of their deck.*
* 7.1.6.A
  * A modified action is resolved as though the player had taken the corresponding action, with any modifiers applied as appropriate. The player must perform the action if possible and complete each step of the action in order, applying any modifiers during the appropriate step.
* 7.6.8
  * If an ability triggers during or as the result of a non-attack action, resolve that ability at the next available opportunity after that action is fully completed. If an ability triggers during an attack, resolve that ability at the appropriate timing point within that attack. Resolving a triggered ability never interrupts an action or ability that is currently resolving, unless the currently resolving action or ability uses “after,” as described below.
* 7.6.8.A
  * If an ability instructs a player to perform a modified action, resolve that action and any nested triggers before resolving any part of that ability that specifies it occurs “after” completing that action.

* Assume Player A plays Tear This Ship Apart, and finds Tear This Ship Apart in Player B's resources, and chooses to play that for free.
* Do you finish resolving Tear This Ship Apart before you play the selected card?
  * If yes, this would mean that if you select another Tear This Ship Apart, you would have access to the newly resourced card in your decisions of what to play.
  * If not, this would mean that selecting another Tear This Ship Apart would only give access to the same resources as the first.

There is no "after" used, however this is also not a triggered ability.

**Answer:**

“Playing” an event is defined as putting that event into its owner’s discard pile and resolving its ability, so that must occur before you resolve any text after “If you do”. In the Tear This Ship Apart example, you would not have access to the newly resourced card.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


---

## TS26 — Twin Suns (Eternal Non-Rotating)

### Question: How does Fives interact with pilots?

* Fives: I Have Proof!
  * You may have this unit enter play with the ”When Played” abilities of another unit in play.
* Sidon Ithano: The Crimson Corsair
  * **When played as a unit:** You may attach this unit as an upgrade to an enemy Vehicle unit without a Pilot on it.
* Corvus: Inferno Squadron Raider
  * **When Played:** You may attach a friendly Pilot unit or upgrade to this unit.
* CR 7.6.13.C
  * Any triggered ability whose triggering condition begins with “When played” is considered a “When Played” ability (e.g. “When played using Smuggle”).
* CR 2.12.3
  * Units with the Pilot trait can be in play either as a unit or as an upgrade.

In eternal or twin suns, Fives will be legal alongside units that allow other units to become upgrades (Pilots) without the use of the Piloting keyword. Bypassing that keyword means that we don't have the "attach to a friendly Vehicle unit" restriction included in the upgrade attachment eligibility.

* Player plays **Fives**, choosing to copy **Sidon Ithano’s** When played ability, attaching Fives to an enemy Vehicle unit.
* Player plays **Fives**, choosing to copy **Corvus’s** When Played ability, attaching a friendly Pilot unit to Fives as an upgrade.

What rules text governs this interaction?

We can't rule it as illegal based on Fives not having Power and HP Modifiers, as Phantom II is a legal example of a unit with no inherent Modifiers that can become an upgrade:

* Phantom II
  * **Action [1 Resource]:** If this card is a unit, attach it as an upgrade to The Ghost.
  * Attached unit gets +3/+3 and gains Grit.

**Answer:**

Both the interaction of Fives with Corvus and Fives with Sidon Ithano are legal, if odd.

`(Answer shared on 2026-05-06)`

-------------------------------------------------


