# 07_LAW (LAW) card review

264 cards + 1 token, in set order. Review against the official card text (`test/json/Card/`), not our implementations.

### 001 - Saw Gerrera - Bring Down the Empire

- Internal name: `saw-gerrera#bring-down-the-empire`
- Type: Leader
- Text: Action [Exhaust]: Attack with a unit. It gets +2/+0 and gains Overwhelm for this attack. After completing this attack, defeat it.
- Deployed: When Attack Ends: If this unit survived, you may attack with another unit. It gets +2/+0 and gains Overwhelm for this attack. After completing this attack, defeat it.
- Rules: If you use Saw’s leader ability, you must attack with a unit, if able. Units must be ready in order to attack. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. "When Attack Ends" abilities trigger at the same time the attacking unit deals combat damage. Saw must survive the attack in order to attack with another unit. Resolve all triggered abilities from the attack before defeating the unit.
- Status: Unreviewed

### 002 - Tobias Beckett - People are Predictable

- Internal name: `tobias-beckett#people-are-predictable`
- Type: Leader
- Text: Action [Exhaust]: Choose a friendly unit. An opponent takes control of it. If they do, create a Credit token.
- Deployed: When Deployed: Defeat any number of units you own but don't control. For each unit defeated this way, create a Credit token and draw a card.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 003 - Agent Kallus - Reconsider Your Allegiance

- Internal name: `agent-kallus#reconsider-your-allegiance`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Play a card from your hand, ignoring its aspect penalties.
- Deployed: Action [1 resource]: Play a card from your hand, ignoring its aspect penalties. When you play a Heroism card: Heal 2 damage from your base.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 004 - Aurra Sing - Assassin

- Internal name: `aurra-sing#assassin`
- Type: Leader
- Text: Action [Exhaust]: Defeat a non‑leader unit with 1 or less remaining HP.
- Deployed: When Deployed: You may defeat a non‑leader unit with 5 or less remaining HP.
- Status: Unreviewed

### 005 - Jyn Erso - Time to Fight

- Internal name: `jyn-erso#time-to-fight`
- Type: Leader
- Text: Action [1 resource, Exhaust]: If a friendly Rebel unit was defeated this phase, search the top 3 cards of your deck for a card and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Deployed: On Attack: If a friendly Rebel unit was defeated this phase, search the top 3 cards of your deck for a card and draw it.
- Rules: Jyn’s leader ability still can be used as an action even if no friendly Rebel unit was defeated this phase (but you don't search or draw). After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 006 - Vel Sartha - Aldhani Insurgent

- Internal name: `vel-sartha#aldhani-insurgent`
- Type: Leader
- Text: Action [Exhaust]: Give an Experience token to a unit. An opponent creates a Credit token.
- Deployed: On Attack: You may give an Experience token to a unit. If you do, an opponent creates a Credit token.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 007 - Boba Fett - Krayt's Claw Commander

- Internal name: `boba-fett#krayts-claw-commander`
- Type: Leader
- Text: When a friendly Bounty Hunter unit's attack ends: If the defending unit was defeated, you may exhaust this leader. If you do, create a Credit token.
- Deployed: Raid 1 (This unit gets +1/+0 while attacking.) When a friendly Bounty Hunter unit's attack ends: If the defending unit was defeated, create a Credit token.
- Rules: "When Attack Ends" abilities trigger at the same time the attacking unit deals combat damage. The attacking Bounty Hunter unit doesn't need to survive the attack in order to create a Credit token.
- Status: Unreviewed

### 008 - Director Krennic - Amidst My Achievement

- Internal name: `director-krennic#amidst-my-achievement`
- Type: Leader
- Text: Action [Exhaust, defeat a friendly unit]: Create a Credit token.
- Deployed: When Deployed: Another friendly unit deals damage equal to its power to an enemy unit.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 009 - Hera Syndulla - Not Fighting Alone

- Internal name: `hera-syndulla#not-fighting-alone`
- Type: Leader
- Text: While you control 2 or more units, ignore the aspect penalties on Heroism units you play.
- Deployed: Restore 1 (When this unit attacks, heal 1 damage from your base.) While you control 2 or more units, ignore the aspect penalties on Heroism units you play.
- Status: Unreviewed

### 010 - Leia Organa - Someone Who Loves You

- Internal name: `leia-organa#someone-who-loves-you`
- Type: Leader
- Text: Action [2 resources, Exhaust]: For this phase, give a unit +1/+1 for each different aspect it has.
- Deployed: Overwhelm When Deployed: Choose a unit. Give an Experience token to that unit for each different aspect among units you control.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 011 - Darth Vader - Unstoppable

- Internal name: `darth-vader#unstoppable`
- Type: Leader
- Text: Action [Exhaust, discard a card from your hand]: Deal 1 damage to a unit or base.
- Deployed: On Attack: Discard any number of cards from your hand. Deal damage to a unit or base equal to the number of cards discarded this way.
- Status: Unreviewed

### 012 - Sebulba - Especially Dangerous Dug

- Internal name: `sebulba#especially-dangerous-dug`
- Type: Leader
- Text: Action [Exhaust, discard a card from your deck]: A friendly unit gains Raid 1 for this phase.
- Deployed: Raid 1 On Attack: Discard a card from your deck.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 013 - Chewbacca - Hero of Kessel

- Internal name: `chewbacca#hero-of-kessel`
- Type: Leader
- Text: Action [1 resource, Exhaust, defeat a friendly resource]: Deal 2 damage to a unit and create a Credit token.
- Deployed: On Attack: You may defeat a friendly resource. If you do, deal 2 damage to a unit and create a Credit token.
- Status: Unreviewed

### 014 - Enfys Nest - Until We Can Go No Higher

- Internal name: `enfys-nest#until-we-can-go-no-higher`
- Type: Leader
- Text: When you use an “On Attack” ability: You may pay 2 resources and exhaust this leader. If you do, use that ability again.
- Deployed: When you use an “On Attack” ability: You may use that ability again. Use this ability only once each round.
- Status: Unreviewed

### 015 - Jabba the Hutt - Crime Boss

- Internal name: `jabba-the-hutt#crime-boss`
- Type: Leader
- Text: Action [1 resource, Exhaust, return a friendly Underworld unit to its owner's hand]: Create a Credit token.
- Deployed: Action: Play an Underworld unit from your hand. If you defeated a Credit while paying its cost, that unit gains Ambush for this phase.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. Abilities that return a card to hand must choose a card in play unless otherwise specified. Jabba's action ability cannot be used as an action if you can't play a unit, as it would not change the game state.
- Status: Unreviewed

### 016 - The Client - Please Lower Your Blaster

- Internal name: `the-client#please-lower-your-blaster`
- Type: Leader
- Text: Action [Exhaust]: If you created a token this phase, exhaust an enemy unit.
- Deployed: Shielded (When you deploy this leader, give him a Shield token.) On Attack: If you created a token this phase, exhaust an enemy unit.
- Rules: The Client’s leader ability still can be used as an action even if you didn't create a token this phase (but you don't exhaust a unit).
- Status: Unreviewed

### 017 - Han Solo - I Got a Really Good Feeling

- Internal name: `han-solo#i-got-a-really-good-feeling`
- Type: Leader
- Text: Action [Exhaust, defeat a friendly token]: Deal 1 damage to a unit.
- Deployed: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) On Attack: Defeat any number of friendly tokens. Deal damage to a unit equal to the number of tokens defeated this way.
- Status: Unreviewed

### 018 - Lando Calrissian - Full Sabacc

- Internal name: `lando-calrissian#full-sabacc`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Choose an aspect, then discard a card from a deck. If it has the chosen aspect, create a Credit token.
- Deployed: When Deployed: You may defeat a friendly Credit token. If you do, create 3 Credit tokens.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 019 - Alliance Outpost

- Internal name: `alliance-outpost`
- Type: Base
- Text: Epic Action [defeat a friendly token]: Give an Experience or Shield token to a unit, or create a Credit token.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 020 - Daimyo's Palace

- Internal name: `daimyos-palace`
- Type: Base
- Text: Epic Action: Play a card from your hand, ignoring 1 of its Vigilance, Command, Aggression, or Cunning aspect penalties.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 021 - Coaxium Mine

- Internal name: `coaxium-mine`
- Type: Base
- Text: Epic Action: Play a card from your hand, ignoring 1 of its Vigilance, Command, Aggression, or Cunning aspect penalties.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 022 - Aldhani Garrison

- Internal name: `aldhani-garrison`
- Type: Base
- Text: Epic Action: Play a card from your hand, ignoring 1 of its Vigilance, Command, Aggression, or Cunning aspect penalties.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 023 - Great Pit of Carkoon

- Internal name: `great-pit-of-carkoon`
- Type: Base
- Text: Epic Action [discard a unit from your hand]: Search your deck for a card named The Sarlacc of Carkoon, reveal it, and draw it.
- Rules: After searching your deck, shuffle it.
- Status: Unreviewed

### 024 - Imperial Command Complex

- Internal name: `imperial-command-complex`
- Type: Base
- Text: Epic Action: Play a card from your hand, ignoring 1 of its Vigilance, Command, Aggression, or Cunning aspect penalties.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 025 - Contested Caverns

- Internal name: `contested-caverns`
- Type: Base
- Text: Epic Action: Play a card from your hand, ignoring 1 of its Vigilance, Command, Aggression, or Cunning aspect penalties.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 026 - Shipbreaking Yard

- Internal name: `shipbreaking-yard`
- Type: Base
- Text: Epic Action: Discard 3 cards from your deck. You may return a card discarded this way to the top of your deck.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 027 - Stygeon Spire

- Internal name: `stygeon-spire`
- Type: Base
- Text: Epic Action: Play a card from your hand, ignoring 1 of its Vigilance, Command, Aggression, or Cunning aspect penalties.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 028 - Canto Bight

- Internal name: `canto-bight`
- Type: Base
- Text: Epic Action: Play a card from your hand, ignoring 1 of its Vigilance, Command, Aggression, or Cunning aspect penalties.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 029 - Citadel Research Center

- Internal name: `citadel-research-center`
- Type: Base
- Text: Epic Action [1 resource]: Return a friendly resource to its owner's hand. If you do, resource the top card of your deck.
- Rules: Resources enter play exhausted.
- Status: Unreviewed

### 030 - Partisan Hideout

- Internal name: `partisan-hideout`
- Type: Base
- Text: Epic Action: Play a card from your hand, ignoring 1 of its Vigilance, Command, Aggression, or Cunning aspect penalties.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 031 - Bossk - Join Our Merry Band

- Internal name: `bossk#join-our-merry-band`
- Type: Unit
- Text: On Attack: Give a unit +1/+1 for this phase. You may give a unit –1/–1 for this phase.
- Status: Unreviewed

### 032 - Cad Bane - Now It's My Turn

- Internal name: `cad-bane#now-its-my-turn`
- Type: Unit
- Text: Shielded Overwhelm On Attack: Defeat any number of friendly Credit tokens. Give an Experience token to this unit for each Credit defeated this way.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 033 - Hound's Tooth - Hunters' Approach

- Internal name: `hounds-tooth#hunters-approach`
- Type: Unit
- Text: When Attack Ends: If this unit survived, you may defeat a unit with less power than this unit.
- Rules: Abilities that refer to a card’s power include temporary modifiers. "When Attack Ends" abilities trigger at the same time the attacking unit deals combat damage. Hound’s Tooth must survive the attack in order to defeat a unit.
- Status: Unreviewed

### 034 - Chewbacca - Mighty Rescuer

- Internal name: `chewbacca#mighty-rescuer`
- Type: Unit
- Text: Overwhelm When Attack Ends: If the defending unit was defeated, give an Experience token to this unit and heal 3 damage from him.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. "When Attack Ends" abilities trigger at the same time the attacking unit deals combat damage. If Chewbacca is defeated by combat damage, you cannot heal him or give him an Experience token.
- Status: Unreviewed

### 035 - Ezra Bridger - Spectre Six

- Internal name: `ezra-bridger#spectre-six`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.) When Played: You may heal 2 damage from a unit. If you control a Aggression or Cunning unit, you may heal 4 damage from a unit instead.
- Status: Unreviewed

### 036 - Obi-Wan Kenobi - Protector of Felucia

- Internal name: `obiwan-kenobi#protector-of-felucia`
- Type: Unit
- Text: Sentinel While you control 7 or more units, their printed power is considered to be 7 and printed HP is considered to be 7.
- Rules: "Printed power" and "printed HP" refer to the numbers physically printed on the card. While you control 7 or more units, those numbers are both considered to be 7. These numbers can then be modified by other abilities and upgrades attached to those units. If multiple abilities or effects change the printed power or printed HP of a card, the most recent ability or effect to become active determines the card's printed values.
- Status: Unreviewed

### 037 - Han Solo - Hibernation Sick

- Internal name: `han-solo#hibernation-sick`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to him.) On Attack: Give an Experience token to this unit.
- Status: Unreviewed

### 038 - Lepi Lookout

- Internal name: `lepi-lookout`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.) Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 039 - Latts Razzi - Deadly Whipmaster

- Internal name: `latts-razzi#deadly-whipmaster`
- Type: Unit
- Text: When Played: Give a Shield token or an Experience token to this unit. Then, she deals damage equal to her power to an enemy ground unit.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 040 - Taramyn Barcona - Eyes Front!

- Internal name: `taramyn-barcona#eyes-front`
- Type: Unit
- Text: When Played: You may defeat a Credit token (belonging to any player). If you do, give an Experience token to this unit and another friendly unit.
- Rules: Taramyn's ability can defeat any Credit token in play, not just ones you control.
- Status: Unreviewed

### 041 - Nothing Left to Fear

- Internal name: `nothing-left-to-fear`
- Type: Event
- Text: Choose a friendly unit and give it +2/+2 for this phase. Then, you may defeat a non-leader unit with power equal to or less than the chosen unit.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 042 - IG-88 - Programmed to Kill

- Internal name: `ig88#programmed-to-kill`
- Type: Unit
- Text: Shielded
- Status: Unreviewed

### 043 - Shadow Cloaking

- Internal name: `shadow-cloaking`
- Type: Event
- Text: Ready a unit and give a Shield token to it.
- Status: Unreviewed

### 044 - Single Reactor Ignition

- Internal name: `single-reactor-ignition`
- Type: Event
- Text: Defeat all units. For each enemy unit defeated this way, deal 1 damage to its controller's base.
- Status: Unreviewed

### 045 - Zeb Orrelios - Spectre Four

- Internal name: `zeb-orrelios#spectre-four`
- Type: Unit
- Text: Sentinel When Played: You may deal 3 damage to a ground unit. If you control a Command or Cunning unit, you may deal 5 damage to a ground unit instead.
- Rules: (ERRATA) Name: "Zeb Orrelios"
- Status: Unreviewed

### 046 - Chirrut Îmwe - I Don't Need Luck

- Internal name: `chirrut-imwe#i-dont-need-luck`
- Type: Unit
- Text: Saboteur When Attack Ends: If this unit dealt combat damage to a base, you may heal 4 damage from another unit.
- Rules: "When Attack Ends" abilities trigger at the same time the attacking unit deals combat damage. Chirrut does not need to survive the attack in order to heal 4 damage from another unit.
- Status: Unreviewed

### 047 - Baze Malbus - Good Luck

- Internal name: `baze-malbus#good-luck`
- Type: Unit
- Text: Sentinel When 1 or more damage is healed from this unit: You may deal that much damage to a unit.
- Status: Unreviewed

### 048 - Chio Fain - Four-Armed Slicer

- Internal name: `chio-fain#fourarmed-slicer`
- Type: Unit
- Text: On Attack: You may choose 2 players. If you do, they each draw a card.
- Status: Unreviewed

### 049 - Bith Brute

- Internal name: `bith-brute`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 050 - Honnah - OINK! SQUEE!

- Internal name: `honnah#oink-squee`
- Type: Unit
- Text: Raid 2 (This unit gets +2/+0 while attacking.) Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 051 - Beilert Valance - Target: Vader

- Internal name: `beilert-valance#target-vader`
- Type: Unit
- Text: On Attack: Draw a card. You may deal damage to a ground unit equal to the number of cards you've drawn this phase.
- Status: Unreviewed

### 052 - The Mandalorian - Let's See the Puck

- Internal name: `the-mandalorian#lets-see-the-puck`
- Type: Unit
- Text: When Played: Draw a card. When you draw 1 or more cards during the action phase: Give a Shield token to this unit.
- Status: Unreviewed

### 053 - Dengar - Take Your Shot

- Internal name: `dengar#take-your-shot`
- Type: Unit
- Text: When a unit with the highest cost among enemy units is defeated: Create a Credit token. Use this ability only once each round.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. If multiple enemy unis are tied for the highest cost, defeating any of them will trigger Dengar's ability.
- Status: Unreviewed

### 054 - Maul - Master of the Shadow Collective

- Internal name: `maul#master-of-the-shadow-collective`
- Type: Unit
- Text: Overwhelm When Attack Ends: If this unit dealt combat damage to a player's base, you may take control of a non-leader unit that player controls. When this unit leaves play, that unit's owner takes control of that unit.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. "When Attack Ends" abilities trigger at the same time the attacking unit deals combat damage. Maul does not need to survive the attack for his ability to trigger, but if he is not in play when it resolves, you do not take control of a unit.
- Status: Unreviewed

### 055 - Chopper - Spectre Three

- Internal name: `chopper#spectre-three`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.) When Played: Give an Experience token to this unit. If you control a Cunning or Vigilance unit, give 2 Experience tokens to him instead.
- Status: Unreviewed

### 056 - Cassian Andor - Everything For the Rebellion

- Internal name: `cassian-andor#everything-for-the-rebellion`
- Type: Unit
- Text: When a friendly unit's attack ends: If the defending unit was defeated, deal 2 damage to a base.
- Rules: "When Attack Ends" abilities trigger at the same time the attacking unit deals combat damage. The attacking unit doesn't need to survive the attack in order to deal damage to a base.
- Status: Unreviewed

### 057 - Benthic "Two Tubes" - The War Has Just Begun

- Internal name: `benthic-two-tubes#the-war-has-just-begun`
- Type: Unit
- Text: On Attack: Deal 1 damage to an enemy ground unit. When Defeated: Deal 1 damage to a base.
- Status: Unreviewed

### 058 - Honor-Bound Partisan

- Internal name: `honorbound-partisan`
- Type: Unit
- Text: When Played: Deal 1 damage to a base. When Defeated: The next unit you play this phase costs 1 resource less.
- Status: Unreviewed

### 059 - Highsinger - Deadly Droid

- Internal name: `highsinger#deadly-droid`
- Type: Unit
- Text: When Played: Give an Experience token to another friendly Command unit. When Defeated: Give an Experience token to a friendly Aggression unit.
- Status: Unreviewed

### 060 - Quarren Contractor

- Internal name: `quarren-contractor`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 061 - Asajj Ventress - Reluctant Hunter

- Internal name: `asajj-ventress#reluctant-hunter`
- Type: Unit
- Text: When Played: You may ready another Bounty Hunter unit.
- Status: Unreviewed

### 062 - Defiant Hammerhead

- Internal name: `defiant-hammerhead`
- Type: Unit
- Text: On Attack: If this unit is attacking a unit, you may give this unit +4/+0 for this attack. If you do, defeat this unit after completing this attack.
- Rules: Resolve all triggered abilities from the attack before defeating the unit.
- Status: Unreviewed

### 063 - L3-37 - Radical Instigator

- Internal name: `l337#radical-instigator`
- Type: Unit
- Text: Hidden When Played: Search the top 10 cards of your deck for any number of Droid units with combined cost 5 or less and play each of them for free.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. After searching, put any cards not chosen on the bottom of your deck in a random order. "Play for free" ignores all resource costs, including aspect penalties, but not other additional costs. If playing multiple units, resolve all abilities triggered while playing each unit before playing the next unit.
- Status: Unreviewed

### 064 - Zuckuss - Dangerous

- Internal name: `zuckuss#dangerous`
- Type: Unit
- Text: Saboteur On Attack: If you control another Bounty Hunter unit, you may deal damage equal to this unit's power to a ground unit.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 065 - 4-LOM - Devious

- Internal name: `4lom#devious`
- Type: Unit
- Text: When Played: You may attack with a friendly Bounty Hunter unit, even if it's exhausted. It can't attack bases for this attack.
- Rules: Units that can’t attack bases can still damage bases through other abilities, like Overwhelm.
- Status: Unreviewed

### 066 - Tear This Ship Apart

- Internal name: `tear-this-ship-apart`
- Type: Event
- Text: Look at all of an opponent's resources. You may play 1 of those cards for free. If you do, that opponent resources the top card of their deck.
- Rules: Resources enter play exhausted. "Play for free" ignores all resource costs, including aspect penalties, but not other additional costs.
- Status: Unreviewed

### 067 - Jyn Erso - Take the Next Chance

- Internal name: `jyn-erso#take-the-next-chance`
- Type: Unit
- Text: When Played: Either give an Experience token to a unit or exhaust a unit.
- Status: Unreviewed

### 068 - Millennium Falcon - Dodging Patrols

- Internal name: `millennium-falcon#dodging-patrols`
- Type: Unit
- Text: On Attack: You may give a space unit –2/–0 for this phase. You may give a ground unit +2/+0 for this phase.
- Status: Unreviewed

### 069 - The Ghost - Home of the Spectres

- Internal name: `the-ghost#home-of-the-spectres`
- Type: Unit
- Text: When Played: You may give an Experience token and a Shield token to a unit. If you control a Vigilance or Aggression unit, you may give an Experience token and a Shield token to each of up to 2 units instead.
- Status: Unreviewed

### 070 - Devaronian Doorbuster

- Internal name: `devaronian-doorbuster`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.) Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 071 - The Max Rebo Band - Jatz-Wailers

- Internal name: `the-max-rebo-band#jatzwailers`
- Type: Unit
- Text: When the regroup phase starts: Create a Credit token.
- Status: Unreviewed

### 072 - Max Rebo - Encore!

- Internal name: `max-rebo#encore`
- Type: Unit
- Text: There is an additional regroup phase after the first regroup phase each round.
- Rules: The additional regroup phase includes drawing 2 cards, resourcing a card, and readying exhausted cards. Any abilities that trigger during the regroup phase trigger an additional time. If there are multiple Max Rebos in play, each Max Rebo causes its own additional regroup phase.
- Status: Unreviewed

### 073 - Patient Hunter

- Internal name: `patient-hunter`
- Type: Unit
- Text: When the regroup phase starts: You may give an Experience token to a non-leader unit. If you do, that unit can't ready during this regroup phase.
- Status: Unreviewed

### 074 - Maz Kanata - Where's My Boyfriend?

- Internal name: `maz-kanata#wheres-my-boyfriend`
- Type: Unit
- Text: When Attack Ends: If this unit survived, search the top 5 cards of your deck for an Underworld unit and play it. It costs 4 resources less and enters play ready. At the start of the regroup phase, put that unit on the bottom of your deck (if it is still in play).
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order. "When Attack Ends" abilities trigger at the same time the attacking unit deals combat damage. Putting a unit on the bottom of your deck from play does not trigger any “When Defeated” abilities on that unit.
- Status: Unreviewed

### 075 - Interrogation Droid

- Internal name: `interrogation-droid`
- Type: Unit
- Text: When Played: Exhaust an enemy unit. If you do and that unit costs 3 or less, its controller discards a card from their hand.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 076 - Vult Skerris's Defender - Secret Project

- Internal name: `vult-skerriss-defender#secret-project`
- Type: Unit
- Text: When Played: If you discarded a card from your hand or deck this phase, give a Shield token to this unit. On Attack: You may deal 1 damage to a space unit and exhaust it.
- Status: Unreviewed

### 077 - Shadow of Stygeon Prime

- Internal name: `shadow-of-stygeon-prime`
- Type: Upgrade
- Text: Attach to a non-leader unit. Attached unit can't ready. It gains: “When the regroup phase starts: Deal 2 damage to your base.”
- Status: Unreviewed

### 078 - Sabine Wren - Spectre Five

- Internal name: `sabine-wren#spectre-five`
- Type: Unit
- Text: Ambush (When you play this unit, she may attack an enemy unit.) When Played: You may defeat a non-<uq> upgrade. If you control a Vigilance or Command unit, you may defeat an upgrade instead.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 079 - K-2SO - Locking the Vault

- Internal name: `k2so#locking-the-vault`
- Type: Unit
- Text: Ambush On Attack: You may deal 3 damage to a damaged ground unit.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 080 - Luke Skywalker - Profit or Be Destroyed

- Internal name: `luke-skywalker#profit-or-be-destroyed`
- Type: Unit
- Text: When Played: An opponent chooses one: They create a Credit token. Ready this unit. You may deal 5 damage to a unit.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 081 - Sullustan Sapper

- Internal name: `sullustan-sapper`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 082 - Urrr'k - Elite Sharpshooter

- Internal name: `urrrk#elite-sharpshooter`
- Type: Unit
- Text: Hidden (This unit can't be attacked if she was played this phase.) Raid 4 (This unit gets +4/+0 while attacking.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 083 - Broken Horn - Vizago's Pride

- Internal name: `broken-horn#vizagos-pride`
- Type: Unit
- Text: When Played: If you have fewer cards in hand than an opponent, draw a card. If you control fewer resources than an opponent, resource the top card of your deck.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.” Resources enter play exhausted.
- Status: Unreviewed

### 084 - Krrsantan - Hit and Run

- Internal name: `krrsantan#hit-and-run`
- Type: Unit
- Text: Ambush Overwhelm Action [discard 2 cards from your hand]: Return this unit to your hand (from play).
- Rules: (ERRATA) "Return this unit to its owner's hand" Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 085 - You Hold This

- Internal name: `you-hold-this`
- Type: Event
- Text: Choose a friendly non-leader unit. An opponent takes control of it. If they do, deal 4 damage to another unit in the same arena.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 086 - The Stranger - No Survivors

- Internal name: `the-stranger#no-survivors`
- Type: Unit
- Text: Ambush Grit While attacking, you may have the defending unit deal combat damage before this unit.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack. If the defending unit deals combat damage first, and The Stranger is defeated by that damage, he does not deal combat damage back. If he survives, he deals bonus damage from Grit when dealing combat damage back.
- Status: Unreviewed

### 087 - Jango Fett - Wily Mercenary

- Internal name: `jango-fett#wily-mercenary`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to him.) On Attack: If this unit is upgraded, exhaust an enemy unit.
- Status: Unreviewed

### 088 - Anakin Skywalker - Prescient Podracer

- Internal name: `anakin-skywalker#prescient-podracer`
- Type: Unit
- Text: When a friendly unit's attack ends: If no other units have attacked this phase, you may return it to its owner's hand. If you do, heal 2 damage from your base.
- Rules: "No other units have attacked this phase" means that no player has made an attack with a unit this phase. "When Attack Ends" abilities trigger at the same time the attacking unit deals combat damage. If the attacking unit is defeated, it cannot be returned to hand by Anakin's ability.
- Status: Unreviewed

### 089 - Kanan Jarrus - Spectre One

- Internal name: `kanan-jarrus#spectre-one`
- Type: Unit
- Text: Restore 1 When Played: You may return a non-leader unit that costs 2 or less to its owner's hand. If you control a Command or Aggression unit, you may return a non-leader unit that costs 4 or less instead.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 090 - Toydarian Technician

- Internal name: `toydarian-technician`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.) Restore 1 (When this unit attacks, heal 1 damage from your base.)
- Status: Unreviewed

### 091 - Val - It's Been a Ride, Babe

- Internal name: `val#its-been-a-ride-babe`
- Type: Unit
- Text: When Played: Give a Shield token to another friendly unit. When Defeated: Give a Shield token to an enemy unit.
- Status: Unreviewed

### 092 - Two-Faced Troig

- Internal name: `twofaced-troig`
- Type: Unit
- Text: Sentinel When Played: You may have an opponent take control of this unit. If you do, create 2 Credit tokens.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 093 - Rio Durant - Beckett's Right Hands

- Internal name: `rio-durant#becketts-right-hands`
- Type: Unit
- Text: When Played: You may return a non-leader unit that costs 3 or less to its owner's hand. Then, its owner may play it for free. It gains Shielded for this phase.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that return a card to hand must choose a card in play unless otherwise specified. "Play for free" ignores all resource costs, including aspect penalties, but not other additional costs.
- Status: Unreviewed

### 094 - Hondo Ohnaka - Plays By His Own Rules

- Internal name: `hondo-ohnaka#plays-by-his-own-rules`
- Type: Unit
- Text: You may look at the top card of your deck at any time. Action: Play the top card of your deck (paying its cost). Use this ability only once each round.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. Hondo's action ability cannot be used as an action if you can't play the unit, as it would not change the game state.
- Status: Unreviewed

### 095 - Finn - Looking Closer

- Internal name: `finn#looking-closer`
- Type: Unit
- Text: Ambush (When you play this unit, he may attack an enemy unit.) On Attack: You may give a Shield token to a non-<uq> unit.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 096 - Rhydonium Detonation

- Internal name: `rhydonium-detonation`
- Type: Event
- Text: Each player may return a non-leader unit to its owner's hand. Then, defeat all non-leader units.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified. Starting with the active player, each player chooses a unit to return to its owner's hand. After all units are returned to hands, defeat all non-leader units.
- Status: Unreviewed

### 097 - Imperial Door Technician

- Internal name: `imperial-door-technician`
- Type: Unit
- Text: When Defeated: Heal 2 damage from your base.
- Status: Unreviewed

### 098 - Vandor Range Troopers

- Internal name: `vandor-range-troopers`
- Type: Unit
- Text: (none)
- Status: Finished

### 099 - Governor's Shuttle

- Internal name: `governors-shuttle`
- Type: Unit
- Text: When Played: Each player chooses a unit they control. Defeat those units.
- Status: Unreviewed

### 100 - IGV-55 Listener

- Internal name: `igv55-listener`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 101 - Lawbringer - Shadow Over Lothal

- Internal name: `lawbringer#shadow-over-lothal`
- Type: Unit
- Text: When Played/On Attack: Choose an aspect. Give each enemy unit with that aspect –2/–2 for this phase.
- Status: Unreviewed

### 102 - Choke on Aspirations

- Internal name: `choke-on-aspirations`
- Type: Event
- Text: Deal up to 5 damage to a friendly non-Vehicle unit. If it survives, heal damage from your base equal to the damage dealt this way.
- Rules: If this event's damage is prevented with a Shield or similar effect, no damage is healed from your base.
- Status: Unreviewed

### 103 - Display Piece

- Internal name: `display-piece`
- Type: Event
- Text: Defeat an enemy non-leader unit. Its controller resources it from its owner's discard pile.
- Rules: Resources enter play exhausted.
- Status: Unreviewed

### 104 - Bodhi Rook - Creating a Diversion

- Internal name: `bodhi-rook#creating-a-diversion`
- Type: Unit
- Text: On Attack: You may give a friendly Rebel unit Sentinel for this phase.
- Status: Unreviewed

### 105 - Cinta Kaz - Stone Cold and Fearless

- Internal name: `cinta-kaz#stone-cold-and-fearless`
- Type: Unit
- Text: While this unit is upgraded, she gains Sentinel. (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 106 - Defiant Scrapper

- Internal name: `defiant-scrapper`
- Type: Unit
- Text: When Played: You may defeat an enemy Credit token.
- Status: Unreviewed

### 107 - Swoop Bike Marauder

- Internal name: `swoop-bike-marauder`
- Type: Unit
- Text: On Attack: Draw a card.
- Status: Unreviewed

### 108 - Lando Calrissian - Eyes Open

- Internal name: `lando-calrissian#eyes-open`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) While this unit is defending, the attacker gets –1/–0.
- Status: Unreviewed

### 109 - Tantive IV - Carrying Hope

- Internal name: `tantive-iv#carrying-hope`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.) When Played: If a friendly unit was defeated this phase, heal 4 damage from your base.
- Status: Unreviewed

### 110 - Phoenix Squadron Fighters

- Internal name: `phoenix-squadron-fighters`
- Type: Unit
- Text: This unit costs 1 resource less to play for each friendly damaged unit.
- Status: Unreviewed

### 111 - Leia's Disguise

- Internal name: `leias-disguise`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains the Underworld trait. When Played: If attached unit is Leia Organa, give a Shield token to a friendly unit.
- Status: Unreviewed

### 112 - Boonta Eve Flagbearer

- Internal name: `boonta-eve-flagbearer`
- Type: Unit
- Text: When a friendly unit attacks: If no other units have attacked this phase (including enemy units), heal 2 damage from your base.
- Rules: "No other units have attacked this phase" means that no player has made an attack with a unit this phase.
- Status: Unreviewed

### 113 - Shield Drive Outfitter

- Internal name: `shield-drive-outfitter`
- Type: Unit
- Text: When Played: You may pay 1 resource. If you do, give a Shield token to a unit.
- Status: Unreviewed

### 114 - Alkenzi Patroller

- Internal name: `alkenzi-patroller`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 115 - Rickety Quadjumper

- Internal name: `rickety-quadjumper`
- Type: Unit
- Text: On Attack: You may reveal the top card of your deck. If it's not a unit, give an Experience token to another unit. (Leave the revealed card on top of your deck.)
- Status: Unreviewed

### 116 - Rodian Bondsman

- Internal name: `rodian-bondsman`
- Type: Unit
- Text: When Defeated: Each player creates a Credit token.
- Status: Unreviewed

### 117 - Conveyex Security Captain

- Internal name: `conveyex-security-captain`
- Type: Unit
- Text: Enemy Credit tokens lose all abilities.
- Status: Unreviewed

### 118 - Droid Laser Turret

- Internal name: `droid-laser-turret`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 119 - Rogue One - At Any Cost

- Internal name: `rogue-one#at-any-cost`
- Type: Unit
- Text: When a friendly unit is defeated: Look at the top 2 cards of your deck. Put any number of them on the bottom of your deck and the rest on top in any order.
- Status: Unreviewed

### 120 - Vigilant Scouts

- Internal name: `vigilant-scouts`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 121 - Canto Bight Security

- Internal name: `canto-bight-security`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) On Defense: Create a Credit token.
- Rules: “On Defense” abilities trigger at the same time as “On Attack” abilities.
- Status: Unreviewed

### 122 - Shielded Hauler

- Internal name: `shielded-hauler`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 123 - Syndicate Security

- Internal name: `syndicate-security`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 124 - Industrious Team

- Internal name: `industrious-team`
- Type: Unit
- Text: When Played: You may defeat a non-leader unit with 4 or less remaining HP.
- Status: Unreviewed

### 125 - Watchful

- Internal name: `watchful`
- Type: Upgrade
- Text: Attached unit gains: “On Attack: Look at the top card of a deck. You may put it on the bottom of that deck. (Otherwise, leave it on top.)”
- Status: Unreviewed

### 126 - Adventurer Sniper Rifle

- Internal name: `adventurer-sniper-rifle`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains: “Action [Exhaust]: Choose an undamaged non-leader ground unit. Its printed HP is considered to be 1 for this phase.”
- Rules: Printed HP refers to the number physically printed on the card. When a unit is chosen by Adventurer Sniper Rifle, its HP number is considered to be 1 for the phase. This number can then be modified by other abilities and upgrades attached to that unit. If multiple abilities or effects change the printed power or printed HP of a card, the most recent ability or effect to become active determines the card's printed values.
- Status: Unreviewed

### 127 - Kill Switch

- Internal name: `kill-switch`
- Type: Upgrade
- Text: When Played: Exhaust attached unit.
- Status: Unreviewed

### 128 - Veiled Strength

- Internal name: `veiled-strength`
- Type: Upgrade
- Text: Attach to a non-leader unit. Attached unit gains Grit.
- Status: Unreviewed

### 129 - Mastery

- Internal name: `mastery`
- Type: Upgrade
- Text: This upgrade costs 1 resource less to play on a <uq> unit.
- Status: Unreviewed

### 130 - Betrayed Trust

- Internal name: `betrayed-trust`
- Type: Event
- Text: Choose an enemy unit. For this phase, that unit can't deal combat damage.
- Rules: “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack.
- Status: Unreviewed

### 131 - Incapacitate

- Internal name: `incapacitate`
- Type: Event
- Text: Give a unit –2/–2 for this phase.
- Status: Unreviewed

### 132 - The Tree Remembers

- Internal name: `the-tree-remembers`
- Type: Event
- Text: An enemy unit loses all abilities for this phase. If it costs 3 or less, defeat it.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Losing all abilities means the chosen unit also can't gain abilities for this phase.
- Status: Unreviewed

### 133 - Lost and Forgotten

- Internal name: `lost-and-forgotten`
- Type: Event
- Text: Defeat a non-leader unit. If you do, heal 3 damage from your base.
- Status: Unreviewed

### 134 - Bib Fortuna - Die Wanna Wanga?

- Internal name: `bib-fortuna#die-wanna-wanga`
- Type: Unit
- Text: When Played: If you control another Underworld unit, create a Credit token.
- Status: Unreviewed

### 135 - Pirate Snub Fighter

- Internal name: `pirate-snub-fighter`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 136 - Syndicate Spice Runner

- Internal name: `syndicate-spice-runner`
- Type: Unit
- Text: When Played: Search the top 3 cards of your deck for an Underworld unit, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 137 - Ruthless Duo

- Internal name: `ruthless-duo`
- Type: Unit
- Text: When Played: If you control another Villainy unit, you may deal 2 damage to a ground unit.
- Status: Unreviewed

### 138 - Undercity Hunting Team

- Internal name: `undercity-hunting-team`
- Type: Unit
- Text: When Played: Search the top 5 cards of your deck for a Bounty Hunter unit, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 139 - Admiral Motti - Chain of Command

- Internal name: `admiral-motti#chain-of-command`
- Type: Unit
- Text: Friendly leader units get +2/+2.
- Status: Unreviewed

### 140 - Intimidator - Citadel Overwatch

- Internal name: `intimidator#citadel-overwatch`
- Type: Unit
- Text: When Played: Return any number of friendly resources to their owners' hands. For each resource returned this way, create a Credit token.
- Status: Unreviewed

### 141 - Targeted For Removal

- Internal name: `targeted-for-removal`
- Type: Upgrade
- Text: Attached unit gains: “When Defeated: An opponent creates Credit tokens equal to this unit's cost.”
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 142 - Scarif Lieutenant

- Internal name: `scarif-lieutenant`
- Type: Unit
- Text: When Defeated: Give an Experience token to a friendly Rebel unit.
- Status: Unreviewed

### 143 - Liberated Wookiee

- Internal name: `liberated-wookiee`
- Type: Unit
- Text: (none)
- Status: Finished

### 144 - Phantom - Spectre Shuttle

- Internal name: `phantom#spectre-shuttle`
- Type: Unit
- Text: When Played: You may play a Heroism unit from your hand (paying its cost) and give an Experience token to it.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 145 - R2-D2 - Part of the Plan

- Internal name: `r2d2#part-of-the-plan`
- Type: Unit
- Text: When Played: Search the top 5 cards of your deck for a unit that shares an aspect with a friendly unit, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 146 - Massassi Group Marines

- Internal name: `massassi-group-marines`
- Type: Unit
- Text: (none)
- Status: Finished

### 147 - Jaunty Light Freighter

- Internal name: `jaunty-light-freighter`
- Type: Unit
- Text: When Played: Give an Experience token to this unit for each different aspect among units you control.
- Status: Unreviewed

### 148 - Smuggler's YT-2400

- Internal name: `smugglers-yt2400`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) When Played: You may pay 1 resource. If you do, this unit gets +1/+1 for this phase.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 149 - Rey - Skywalker

- Internal name: `rey#skywalker`
- Type: Unit
- Text: Opponents can't take control of this unit. This unit can't be defeated by enemy card abilities.
- Rules: Rey can’t be defeated directly by card abilities that “defeat a unit”, but can still be defeated as a result of card abilities or game effects, such as abilities that give a unit -X/-X for the phase.
- Status: Unreviewed

### 150 - Fulcrum

- Internal name: `fulcrum`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains the Rebel trait and “Each other friendly Rebel unit gets +2/+2.”
- Status: Unreviewed

### 151 - Profiteering Hunter

- Internal name: `profiteering-hunter`
- Type: Unit
- Text: When Played: Another friendly unit gets +1/+1 for this phase.
- Status: Unreviewed

### 152 - C-3PO - Translation Protocol

- Internal name: `c3po#translation-protocol`
- Type: Unit
- Text: On Attack: You may give an Experience token to another non-leader unit that shares a Trait with a friendly leader.
- Status: Unreviewed

### 153 - Follower of the Code

- Internal name: `follower-of-the-code`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.)
- Status: Unreviewed

### 154 - Partisan Infantry

- Internal name: `partisan-infantry`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.)
- Status: Unreviewed

### 155 - Getaway Freighter

- Internal name: `getaway-freighter`
- Type: Unit
- Text: On Attack: If you control a ground unit, create a Credit token.
- Status: Unreviewed

### 156 - Hunter For Hire

- Internal name: `hunter-for-hire`
- Type: Unit
- Text: Action [defeat a friendly Credit token]: Take control of this unit. Any player may use this ability.
- Status: Unreviewed

### 157 - Target Tagger

- Internal name: `target-tagger`
- Type: Unit
- Text: When Played: You may attack with a unit. If it's a Bounty Hunter, it gets +2/+0 for this attack.
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 158 - Khetanna - Upon the Dune Sea

- Internal name: `khetanna#upon-the-dune-sea`
- Type: Unit
- Text: When Played/On Attack: The next Underworld unit you play this phase costs 1 resource less.
- Rules: The cost discount remains active even if Khetanna is defeated.
- Status: Unreviewed

### 159 - Expendable Mercenary

- Internal name: `expendable-mercenary`
- Type: Unit
- Text: When Defeated: You may resource this unit from its owner's discard pile.
- Rules: Resources enter play exhausted.
- Status: Unreviewed

### 160 - Hidden Hunters

- Internal name: `hidden-hunters`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 161 - Partisan U-Wing

- Internal name: `partisan-uwing`
- Type: Unit
- Text: When Played: If a friendly unit was defeated this phase, create a Credit token.
- Status: Unreviewed

### 162 - Beach Patrol AT-ACT

- Internal name: `beach-patrol-atact`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 163 - The Sarlacc of Carkoon - Horror of the Dune Sea

- Internal name: `the-sarlacc-of-carkoon#horror-of-the-dune-sea`
- Type: Unit
- Text: On Attack: Put a unit from your discard pile on the bottom of your deck. Deal damage equal to that unit's power to an enemy ground unit.
- Status: Unreviewed

### 164 - Mercenary Fleet

- Internal name: `mercenary-fleet`
- Type: Unit
- Text: (none)
- Status: Finished

### 165 - Combat Exercise

- Internal name: `combat-exercise`
- Type: Event
- Text: Exhaust a friendly unit. If you do, give 2 Experience tokens to it.
- Status: Unreviewed

### 166 - Putting a Team Together

- Internal name: `putting-a-team-together`
- Type: Event
- Text: Search the top 8 cards of your deck for a Vigilance, Aggression, or Cunning unit, reveal it, and draw it. (Put the rest of the cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 167 - Common Cause

- Internal name: `common-cause`
- Type: Event
- Text: Give a unit +1/+1 for this phase for each different aspect among units you control.
- Status: Unreviewed

### 168 - Haymaker

- Internal name: `haymaker`
- Type: Event
- Text: Give an Experience token to a friendly unit. That unit deals damage equal to its power to an enemy unit in the same arena.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 169 - Payroll Heist

- Internal name: `payroll-heist`
- Type: Event
- Text: For this phase, each friendly unit gains: “On Attack: Create a Credit token.”
- Status: Unreviewed

### 170 - Double-Cross

- Internal name: `doublecross`
- Type: Event
- Text: Choose a friendly non-leader unit and an enemy non-leader unit. Exchange control of those units. The player who takes control of the lower-cost unit creates Credit tokens equal to the difference between those units' costs.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 171 - Stockpile

- Internal name: `stockpile`
- Type: Event
- Text: Resource this event and the top card of your deck.
- Rules: Resources enter play exhausted.
- Status: Unreviewed

### 172 - Storm Raider

- Internal name: `storm-raider`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.)
- Status: Unreviewed

### 173 - BT-1 - Blastomech

- Internal name: `bt1#blastomech`
- Type: Unit
- Text: On Attack: Discard a card from your deck. If it's Aggression, you may deal 1 damage to a ground unit.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 174 - 0-0-0 - Translation and Torture

- Internal name: `000#translation-and-torture`
- Type: Unit
- Text: On Attack: You may put a Aggression card from your discard pile on the bottom of your deck. If you do, deal 1 damage to each enemy base.
- Status: Unreviewed

### 175 - Prototype TIE Advanced

- Internal name: `prototype-tie-advanced`
- Type: Unit
- Text: (none)
- Status: Finished

### 176 - Sebulba's Podracer - Taking the Lead

- Internal name: `sebulbas-podracer#taking-the-lead`
- Type: Unit
- Text: When you discard a card from your deck: You may ready this unit. Use this ability only once each round.
- Status: Unreviewed

### 177 - Son-tuul Berserkers

- Internal name: `sontuul-berserkers`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 178 - Persecutor - Fire Over Scarif

- Internal name: `persecutor#fire-over-scarif`
- Type: Unit
- Text: When Played/On Attack: Choose an arena. You may deal 3 damage to each unit in that arena.
- Status: Unreviewed

### 179 - Fear and Dead Men

- Internal name: `fear-and-dead-men`
- Type: Event
- Text: This card costs 1 resource less to play for each card discarded from your hand this phase. Deal 4 damage to each enemy ground unit.
- Status: Unreviewed

### 180 - Inspired Recruit

- Internal name: `inspired-recruit`
- Type: Unit
- Text: (none)
- Status: Finished

### 181 - Cloud-Rider Veteran

- Internal name: `cloudrider-veteran`
- Type: Unit
- Text: On Attack: Deal 2 damage to a base.
- Status: Unreviewed

### 182 - Weazel - Fighting Back

- Internal name: `weazel#fighting-back`
- Type: Unit
- Text: On Attack: Another friendly unit gains Raid 2 for this phase. (It gets +2/+0 while attacking.)
- Status: Unreviewed

### 183 - B-Wing Skirmisher

- Internal name: `bwing-skirmisher`
- Type: Unit
- Text: When Played: Deal 1 damage to each of up to 2 space units.
- Status: Unreviewed

### 184 - Aerie - Cloud-Rider Dropship

- Internal name: `aerie#cloudrider-dropship`
- Type: Unit
- Text: On Attack: Deal 2 damage to an enemy ground unit and 2 damage to a base.
- Status: Unreviewed

### 185 - Ben Solo - Facing the Light

- Internal name: `ben-solo#facing-the-light`
- Type: Unit
- Text: Hidden When Played/When Defeated: Ready another friendly unit. It can't be attacked this phase.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked. If the unit chosen by Ben Solo has or gains Sentinel, it can be attacked.
- Status: Unreviewed

### 186 - Enfys Nest's Helmet

- Internal name: `enfys-nests-helmet`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains: “On Attack: You may give another unit +3/+0 for this phase.”
- Status: Unreviewed

### 187 - "Staccato Lightning" Repeater

- Internal name: `staccato-lightning-repeater`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. When Played: Deal 1 damage to each of up to 3 different ground units.
- Status: Unreviewed

### 188 - Savareen Survivor

- Internal name: `savareen-survivor`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 189 - Cavern Angels X-Wing

- Internal name: `cavern-angels-xwing`
- Type: Unit
- Text: When Defeated: Deal 2 damage to a base.
- Status: Unreviewed

### 190 - Haxion Aggressor

- Internal name: `haxion-aggressor`
- Type: Unit
- Text: Raid 2 (This unit gets +2/+0 while attacking.)
- Status: Unreviewed

### 191 - Arvel Skeen - Win and Walk Away

- Internal name: `arvel-skeen#win-and-walk-away`
- Type: Unit
- Text: When Played/On Attack: You may defeat a Credit token (belonging to any player). If you do, deal 1 damage to a unit or base.
- Status: Unreviewed

### 192 - Bracca Shipbreaker

- Internal name: `bracca-shipbreaker`
- Type: Unit
- Text: On Attack: Discard a card from your deck.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 193 - Mid Rim Sharpshooter

- Internal name: `mid-rim-sharpshooter`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) When Played: You may pay 1 resource. If you do, an opponent discards a card from their hand.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 194 - Doctor Aphra - Digging For Answers

- Internal name: `doctor-aphra#digging-for-answers`
- Type: Unit
- Text: On Attack: Discard 3 cards from your deck. You may return an Underworld card discarded this way to your hand.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 195 - Overcharged Transport

- Internal name: `overcharged-transport`
- Type: Unit
- Text: When Played/When Defeated: You may defeat an upgrade attached to a space unit.
- Status: Unreviewed

### 196 - Relentless Hunters

- Internal name: `relentless-hunters`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 197 - Shifty Suspects

- Internal name: `shifty-suspects`
- Type: Unit
- Text: On Attack: Bases can't be healed for this phase.
- Status: Unreviewed

### 198 - Dogged Pursuers

- Internal name: `dogged-pursuers`
- Type: Unit
- Text: When Played: You may pay 1 resource. If you do, deal 2 damage to a ground unit.
- Status: Unreviewed

### 199 - Ohnaka Gang Bandits

- Internal name: `ohnaka-gang-bandits`
- Type: Unit
- Text: Raid 3 (This unit gets +3/+0 while attacking.)
- Status: Unreviewed

### 200 - Salvaged Blaster

- Internal name: `salvaged-blaster`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Action: If this upgrade was discarded from your hand or deck this phase, play it from your discard pile (paying its cost).
- Rules: Salvaged Blaster’s ability cannot be used as an action if it wasn’t discarded from your hand or deck this phase, or if you can’t pay its cost, as that would not change the game state. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 201 - Thermal Detonator

- Internal name: `thermal-detonator`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains: “When Defeated: If this unit was ready, deal 2 damage to each enemy ground unit.”
- Status: Unreviewed

### 202 - Commence the Festivities

- Internal name: `commence-the-festivities`
- Type: Event
- Text: Attack with a unit. It gains Saboteur for this attack. If you control fewer resources than an opponent, it gets +2/+0 for this attack.
- Rules: You must attack with a unit, if able. Units must be ready in order to attack. If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 203 - Daring Delve

- Internal name: `daring-delve`
- Type: Event
- Text: Discard 2 cards from your deck. You may return a Aggression card discarded this way to your hand.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 204 - Every Day, More Lies

- Internal name: `every-day-more-lies`
- Type: Event
- Text: Each player discards a card from their hand.
- Status: Unreviewed

### 205 - Flash the Vents

- Internal name: `flash-the-vents`
- Type: Event
- Text: Attack with a unit. It gets +2/+0 and gains Overwhelm for this attack. After completing this attack, if that unit damaged a base, defeat that unit.
- Rules: You must attack with a unit, if able. Units must be ready in order to attack. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Resolve all triggered abilities from the attack before defeating the unit. Flash the Vents does not specify "combat damage," so if the unit deals damage to a base with an ability during the attack, it is defeated.
- Status: Unreviewed

### 206 - That's a Rock

- Internal name: `thats-a-rock`
- Type: Event
- Text: Deal 1 damage to a unit. When this event is discarded from your hand or deck: You may deal 1 damage to a unit.
- Status: Unreviewed

### 207 - Attack From All Sides

- Internal name: `attack-from-all-sides`
- Type: Event
- Text: Deal 3 damage to a unit. If there are 4 or more different aspects among friendly units, you may deal 5 damage to that unit instead.
- Status: Unreviewed

### 208 - Collateral Damage

- Internal name: `collateral-damage`
- Type: Event
- Text: Deal 2 damage to a unit. Then, deal 2 damage to a base or another unit in the same arena.
- Status: Unreviewed

### 209 - Nihil Stormsower

- Internal name: `nihil-stormsower`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 210 - Salacious Crumb - Cackling Companion

- Internal name: `salacious-crumb#cackling-companion`
- Type: Unit
- Text: Raid 2 If you control Jabba the Hutt (as a leader or unit), this unit enters play ready.
- Status: Unreviewed

### 211 - Black Sun Patroller

- Internal name: `black-sun-patroller`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 212 - Malakili - Keeper of the Menagerie

- Internal name: `malakili#keeper-of-the-menagerie`
- Type: Unit
- Text: Each friendly Creature unit and each Creature unit you own that isn't in play gains the Underworld trait.
- Status: Unreviewed

### 213 - Cutthroat Podracer

- Internal name: `cutthroat-podracer`
- Type: Unit
- Text: When Played: You may deal 2 damage to an exhausted ground unit.
- Status: Unreviewed

### 214 - Boba Fett - For a Price

- Internal name: `boba-fett#for-a-price`
- Type: Unit
- Text: When Played/On Attack: You may pay 1 resource. If you do, deal 3 damage to a ground unit.
- Status: Unreviewed

### 215 - Vermillion - Qi'ra's Auction House

- Internal name: `vermillion#qiras-auction-house`
- Type: Unit
- Text: When Attack Ends: If this unit survived, reveal the top card of a deck, then choose a player. They may play the revealed card for free. If they do, a different player creates Credit tokens equal to that card's cost.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. "When Attack Ends" abilities trigger at the same time the attacking unit deals combat damage. "Play for free" ignores all resource costs, including aspect penalties, but not other additional costs. The chosen player may choose not to play the revealed card.
- Status: Unreviewed

### 216 - Jabba's Rancor - Snack Time!

- Internal name: `jabbas-rancor#snack-time`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) On Attack: An opponent chooses a ground unit they control. You may deal 7 damage to that unit.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked. If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 217 - Hold For Questioning

- Internal name: `hold-for-questioning`
- Type: Event
- Text: Exhaust an enemy unit. If you do, look at its controller's hand and discard a card from it that shares an aspect with that unit.
- Status: Unreviewed

### 218 - Artful Pickpocket

- Internal name: `artful-pickpocket`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 219 - Anakin's Podracer - So Wizard!

- Internal name: `anakins-podracer#so-wizard`
- Type: Unit
- Text: Ambush While attacking, if no other units have attacked this phase, this unit deals combat damage before the defending unit.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack. If Anakin's Podracer deals combat damage first, and the defender is defeated by that damage, it does not deal combat damage back. If it survives and has Grit, it deals bonus damage from Grit when dealing combat damage back.
- Status: Unreviewed

### 220 - Wookiee Guerilla

- Internal name: `wookiee-guerilla`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) Raid 2 (This unit gets +2/+0 while attacking.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 221 - Lieutenant Gorn - I Deserve Worse

- Internal name: `lieutenant-gorn#i-deserve-worse`
- Type: Unit
- Text: On Attack: Take control of an enemy Credit token.
- Status: Unreviewed

### 222 - Rebel Blockade Runner

- Internal name: `rebel-blockade-runner`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 223 - Rose Tico - Now It's Worth It

- Internal name: `rose-tico#now-its-worth-it`
- Type: Unit
- Text: If you control a non-<uq> unit, this unit enters play ready.
- Status: Unreviewed

### 224 - Liberty - Draw Their Fire!

- Internal name: `liberty#draw-their-fire`
- Type: Unit
- Text: Sentinel When Played/On Attack: Exhaust an enemy unit and return all upgrades on it that cost 4 or less to their owner's hands.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 225 - Han's Golden Dice

- Internal name: `hans-golden-dice`
- Type: Upgrade
- Text: Attached unit gains: “On Attack: Discard a card from your deck. If its cost is odd, create a Credit token.”
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 226 - Secret Battle of Pretend

- Internal name: `secret-battle-of-pretend`
- Type: Event
- Text: Exhaust a friendly unit. If you do, for each different aspect it has, exhaust an enemy unit in the same arena.
- Status: Unreviewed

### 227 - Rookie Rocket-jumper

- Internal name: `rookie-rocketjumper`
- Type: Unit
- Text: When Played: You may pay 1 resource. If you do, give a Shield token to this unit.
- Status: Unreviewed

### 228 - Canyon Frontrunner

- Internal name: `canyon-frontrunner`
- Type: Unit
- Text: On Attack: If no other units have attacked this phase (including enemy units), you may give a unit –2/–0 for this phase.
- Status: Unreviewed

### 229 - The Master Codebreaker - High Stakes

- Internal name: `the-master-codebreaker#high-stakes`
- Type: Unit
- Text: The first Gambit card you play each round costs 1 resource less. When Played: Search the top 8 cards of your deck for a Gambit card, reveal it, and draw it.
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 230 - Ohnaka Gang Starhopper

- Internal name: `ohnaka-gang-starhopper`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 231 - Weequay Pirate

- Internal name: `weequay-pirate`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) When Played: If no resources were paid to play this unit, give an Experience token to it.
- Status: Unreviewed

### 232 - Champion's KT9 Podracer

- Internal name: `champions-kt9-podracer`
- Type: Unit
- Text: When Played: Create a Credit token.
- Status: Unreviewed

### 233 - Galen Erso - Destroying His Creation

- Internal name: `galen-erso#destroying-his-creation`
- Type: Unit
- Text: When Played: You may have an opponent take control of this unit. Enemy units gain Raid 1 and Saboteur.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 234 - Kage Elite

- Internal name: `kage-elite`
- Type: Unit
- Text: Raid 2 (This unit gets +2/+0 while attacking.) Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 235 - Lady Proxima - Where's the Money?

- Internal name: `lady-proxima#wheres-the-money`
- Type: Unit
- Text: Action [Exhaust]: Create a Credit token.
- Status: Unreviewed

### 236 - Bix Caleen - Selling Scrap

- Internal name: `bix-caleen#selling-scrap`
- Type: Unit
- Text: When Played/On Attack: You may discard a card from your hand. If you do, create a Credit token.
- Status: Unreviewed

### 237 - Qui-Gon Jinn - Influencing Chance

- Internal name: `quigon-jinn#influencing-chance`
- Type: Unit
- Text: Sentinel When Played/On Attack: Look at the top 3 cards of your deck. You may discard 1 of them. Put the rest back on top in any order.
- Status: Unreviewed

### 238 - Scavenging Sandcrawler

- Internal name: `scavenging-sandcrawler`
- Type: Unit
- Text: On Attack: You may put a card from your discard pile on the bottom of your deck. If you do, create a Credit token.
- Status: Unreviewed

### 239 - Guild Ambush Team

- Internal name: `guild-ambush-team`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 240 - Milodon Rider

- Internal name: `milodon-rider`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) When Played: You may return another friendly non-leader unit to its owner's hand.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack. Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 241 - The Blade Wing - The Secret of Shantipole

- Internal name: `the-blade-wing#the-secret-of-shantipole`
- Type: Unit
- Text: When Played: You may return a non-leader unit to its owner's hand.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 242 - Improvise

- Internal name: `improvise`
- Type: Event
- Text: Look at the top card of your deck. You may play it. It costs 1 resource less. If you don't, you may discard it.
- Status: Unreviewed

### 243 - Transmission Jamming

- Internal name: `transmission-jamming`
- Type: Event
- Text: Name a card. Cards with that name can't be played this phase.
- Rules: Abilities that refer to a card’s “name” do not include the subtitle of the card.
- Status: Unreviewed

### 244 - Unmarked Credits

- Internal name: `unmarked-credits`
- Type: Event
- Text: Create a Credit token.
- Status: Unreviewed

### 245 - Salvaged Materials

- Internal name: `salvaged-materials`
- Type: Event
- Text: Play an Item upgrade from your discard pile. It costs 3 resources less. At the start of the next regroup phase, defeat it.
- Status: Unreviewed

### 246 - The Axe Forgets

- Internal name: `the-axe-forgets`
- Type: Event
- Text: Return a non-leader unit that costs 3 or less to its owner's hand.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 247 - Backed by the Hutts

- Internal name: `backed-by-the-hutts`
- Type: Event
- Text: Create a Credit token. You may deal damage to a unit equal to the number of friendly Credit tokens.
- Status: Unreviewed

### 248 - Windfall

- Internal name: `windfall`
- Type: Event
- Text: Create 3 Credit tokens.
- Status: Unreviewed

### 249 - Black Sun Cabalist

- Internal name: `black-sun-cabalist`
- Type: Unit
- Text: When Played: Give an Experience token to another friendly Underworld unit.
- Status: Unreviewed

### 250 - Callous Bounty Hunter

- Internal name: `callous-bounty-hunter`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 251 - Night Wind Assailants

- Internal name: `night-wind-assailants`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 252 - Fett's Firespray - In Pursuit

- Internal name: `fetts-firespray#in-pursuit`
- Type: Unit
- Text: Ambush When Attack Ends: If the defending unit was defeated, create a Credit token.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack. "When Attack Ends" abilities trigger at the same time the attacking unit deals combat damage.
- Status: Unreviewed

### 253 - Alliance X-Wing

- Internal name: `alliance-xwing`
- Type: Unit
- Text: (none)
- Status: Finished

### 254 - Stalwart Fleet Trooper

- Internal name: `stalwart-fleet-trooper`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 255 - Circuit Challenger

- Internal name: `circuit-challenger`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 256 - Fire Across the Galaxy

- Internal name: `fire-across-the-galaxy`
- Type: Event
- Text: Use any number of “When Played” abilities on friendly Spectre units.
- Rules: Any ability whose trigger starts with "When played…" is considered a "When Played" ability.
- Status: Unreviewed

### 257 - Hidden Hand Supplier

- Internal name: `hidden-hand-supplier`
- Type: Unit
- Text: When Played: You may pay 1 resource. If you do, give an Experience token to another unit.
- Status: Unreviewed

### 258 - Criminal Contact

- Internal name: `criminal-contact`
- Type: Unit
- Text: On Attack: You may pay 2 resources. If you do, create a Credit token.
- Status: Unreviewed

### 259 - Cartel Heavy Fighter

- Internal name: `cartel-heavy-fighter`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 260 - Seasoned Tracker

- Internal name: `seasoned-tracker`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 261 - Street Gang Recruiter

- Internal name: `street-gang-recruiter`
- Type: Unit
- Text: When Played: You may return an Underworld card from your discard pile to your hand.
- Rules: Street Gang Recruiter can return itself to hand if defeated before its “When Played” is resolved.
- Status: Unreviewed

### 262 - Bank Job Fugitives

- Internal name: `bank-job-fugitives`
- Type: Unit
- Text: When Played: Create a Credit token.
- Status: Unreviewed

### 263 - Kessel Hulk

- Internal name: `kessel-hulk`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 264 - From a Certain Point of View

- Internal name: `from-a-certain-point-of-view`
- Type: Event
- Text: Play a card from your hand, ignoring its aspect penalties.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

## Tokens

### Token - Credit

- Internal name: `credit`
- Type: Token
- Text: While paying resources, you may defeat this token. If you do, pay 1 resource less.
- Rules: You may defeat Credit tokens while paying resources to play cards or use abilities.
- Status: Unreviewed

