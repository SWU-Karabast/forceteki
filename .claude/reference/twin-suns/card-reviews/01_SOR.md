# 01_SOR (SOR) card review

217 cards + 2 tokens, in set order. Review against the official card text (`test/json/Card/`), not our implementations.

### 001 - Director Krennic - Aspiring to Authority

- Internal name: `director-krennic#aspiring-to-authority`
- Type: Leader
- Text: Each friendly damaged unit gets +1/+0.
- Deployed: Restore 2 (When this unit attacks, heal 2 damage from your base.) Each friendly damaged unit gets +1/+0.
- Status: Unreviewed

### 002 - Iden Versio - Inferno Squad Commander

- Internal name: `iden-versio#inferno-squad-commander`
- Type: Leader
- Text: Action [Exhaust]: If an enemy unit was defeated this phase, heal 1 damage from your base.
- Deployed: Shielded (When you deploy this leader, give her a Shield token.) When an enemy unit is defeated: Heal 1 damage from your base.
- Rules: Iden’s leader ability still can be used as an action even if no enemy unit left play this phase (but it heals no damage from your base). If Iden is defeated simultaneously with other enemy units, you still get to heal damage.
- Status: Unreviewed

### 003 - Chewbacca - Walking Carpet

- Internal name: `chewbacca#walking-carpet`
- Type: Leader
- Text: Action [exhaust]: Play a unit that costs 3 or less from your hand (paying its cost). It gains Sentinel for this phase.
- Deployed: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) Grit (This unit gains +1/+0 for each damage on it.)
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 004 - Chirrut Îmwe - One With The Force

- Internal name: `chirrut-imwe#one-with-the-force`
- Type: Leader
- Text: Action [Exhaust]: Give a unit +0/+2 for this phase.
- Deployed: During the action phase, this unit isn’t defeated by having no remaining HP. (During the regroup phase, if he has no remaining HP, defeat him.)
- Rules: Chirrut can be assigned more damage than his remaining HP. Chirrut is defeated passively as soon as the regroup phase starts if he has damage on him equal to or greater than his remaining HP. If Chirrut is attacked by a unit with Overwhelm, there is no excess damage if he is not defeated.
- Status: Unreviewed

### 005 - Luke Skywalker - Faithful Friend

- Internal name: `luke-skywalker#faithful-friend`
- Type: Leader
- Text: Action [1 resource, exhaust]: Give a Shield token to a [Heroism] unit you played this phase.
- Deployed: On Attack: You may give another unit a Shield token.
- Status: Unreviewed

### 006 - Emperor Palpatine - Galactic Ruler

- Internal name: `emperor-palpatine#galactic-ruler`
- Type: Leader
- Text: Action [1 resource, exhaust, defeat a friendly unit]: Deal 1 damage to a unit and draw a card.
- Deployed: When Deployed: Take control of a damaged non-leader unit. On Attack: You may defeat another friendly unit. If you do, deal 1 damage to a unit and draw a card.
- Status: Unreviewed

### 007 - Grand Moff Tarkin - Oversector Governor

- Internal name: `grand-moff-tarkin#oversector-governor`
- Type: Leader
- Text: Action [1 resource, exhaust]: Give an Experience token to an Imperial unit.
- Deployed: On Attack: You may give an Experience token to another Imperial unit.
- Status: Unreviewed

### 008 - Hera Syndulla - Spectre Two

- Internal name: `hera-syndulla#spectre-two`
- Type: Leader
- Text: Ignore the aspect penalty on SPECTRE cards you play.
- Deployed: Ignore the aspect penalty on SPECTRE cards you play. On Attack: You may give an Experience token to another unique unit.
- Rules: (ERRATA) Templating update: "Aspect penalty" becomes "aspect penalties" when referring to multiple. (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 009 - Leia Organa - Alliance General

- Internal name: `leia-organa#alliance-general`
- Type: Leader
- Text: Action [exhaust]: Attack with a Rebel unit. Then, you may attack with another Rebel unit.
- Deployed: Raid 1 (This unit gets +1/+0 while attacking.) When this unit completes an attack: You may attack with another Rebel unit.
- Rules: If you use Leia’s leader ability, you must attack with a Rebel unit, if able. Units must be ready in order to attack. For abilities that encompass multiple actions, resolve each action (and any resulting triggers) sequentially. A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 010 - Darth Vader - Dark Lord of the Sith

- Internal name: `darth-vader#dark-lord-of-the-sith`
- Type: Leader
- Text: Action [1 resource, exhaust]: If you played a [Villainy] card this phase, deal 1 damage to a unit and 1 damage to a base.
- Deployed: On Attack: You may deal 2 damage to a unit.
- Rules: Vader’s leader ability still can be used as an action even if you haven’t played a Villain card this phase (but it deals no damage).
- Status: Unreviewed

### 011 - Grand Inquisitor - Hunting the Jedi

- Internal name: `grand-inquisitor#hunting-the-jedi`
- Type: Leader
- Text: Action [exhaust]: Deal 2 damage to a friendly unit with 3 or less power and ready it.
- Deployed: On Attack: You may deal 1 damage to another friendly unit with 3 or less power and ready it.
- Rules: Abilities that refer to a card’s power include temporary modifiers. The unit chosen by Grand Inquisitor’s ability can exceed 3 power after the damage is dealt (for example, if the unit has Grit).
- Status: Unreviewed

### 012 - IG-88 - Ruthless Bounty Hunter

- Internal name: `ig88#ruthless-bounty-hunter`
- Type: Leader
- Text: Action [Exhaust]: Attack with a unit. If you control more units than the defending player, the attacker gets +1/+0 for this attack.
- Deployed: Each other friendly unit gains Raid 1. (They get +1/+0 while attacking.)
- Rules: If you use IG-88’s leader ability, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 013 - Cassian Andor - Dedicated to the Rebellion

- Internal name: `cassian-andor#dedicated-to-the-rebellion`
- Type: Leader
- Text: Action [1 resource, Exhaust]: If you've dealt 3 or more damage to an enemy base this phase, draw a card.
- Deployed: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) When you deal damage to an enemy base: You may draw a card. Use this ability only once each round.
- Rules: Cassian’s leader ability can still be used as an action even if you haven’t dealt 3 or more damage to a base this phase (but you don't draw a card). Any card you control or ability you resolve that deals damage is considered damage dealt by you.
- Status: Unreviewed

### 014 - Sabine Wren - Galvanized Revolutionary

- Internal name: `sabine-wren#galvanized-revolutionary`
- Type: Leader
- Text: Action [exhaust]: Deal 1 damage to each base.
- Deployed: On Attack: Deal 1 damage to each enemy base.
- Status: Unreviewed

### 015 - Boba Fett - Collecting the Bounty

- Internal name: `boba-fett#collecting-the-bounty`
- Type: Leader
- Text: When an enemy unit leaves play: You may exhaust this leader. If you do, ready a resource.
- Deployed: When this unit completes an attack: If an enemy unit left play this phase, ready up to 2 resources.
- Rules: A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 016 - Grand Admiral Thrawn - Patient and Insightful

- Internal name: `grand-admiral-thrawn#patient-and-insightful`
- Type: Leader
- Text: When the action phase starts: Look at the top card of each player's deck. Action [1 resource, exhaust]: Reveal the top card of any player's deck. Exhaust a unit that costs the same as or less than the revealed card.
- Deployed: When the action phase starts: Look at the top card of each player's deck. On Attack: You may reveal the top card of any player's deck. Exhaust a unit that costs the same as or less than the revealed card.
- Status: Unreviewed

### 017 - Han Solo - Audacious Smuggler

- Internal name: `han-solo#audacious-smuggler`
- Type: Leader
- Text: Action [exhaust]: Put a card from your hand into play as a resource and ready it. At the start of the next action phase, defeat a resource you control.
- Deployed: On Attack: Put the top card of your deck into play as a resource and ready it. At the start of the next action phase, defeat a resource you control.
- Rules: Han’s ability’s requirement to defeat a resource remains active even if he is defeated or changes zones before the start of the next action phase.
- Status: Unreviewed

### 018 - Jyn Erso - Resisting Oppression

- Internal name: `jyn-erso#resisting-oppression`
- Type: Leader
- Text: Action [Exhaust]: Attack with a unit. The defender gets -1/-0 for this attack.
- Deployed: While a friendly unit is attacking, the defender gets -1/-0.
- Rules: If you use Jyn’s leader ability, you must attack with a unit, if able. Units must be ready in order to attack. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 019 - Security Complex

- Internal name: `security-complex`
- Type: Base
- Text: Epic Action: Give a Shield token to a non-leader unit.
- Status: Unreviewed

### 020 - Capital City

- Internal name: `capital-city`
- Type: Base
- Text: (none)
- Status: Finished

### 021 - Dagobah Swamp

- Internal name: `dagobah-swamp`
- Type: Base
- Text: (none)
- Status: Finished

### 022 - Energy Conversion Lab

- Internal name: `energy-conversion-lab`
- Type: Base
- Text: Epic Action: Play a unit that costs 6 resources or less from your hand. Give it AMBUSH for this phase.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 023 - Command Center

- Internal name: `command-center`
- Type: Base
- Text: (none)
- Status: Finished

### 024 - Echo Base

- Internal name: `echo-base`
- Type: Base
- Text: (none)
- Status: Finished

### 025 - Tarkintown

- Internal name: `tarkintown`
- Type: Base
- Text: Epic Action: Deal 3 damage to a damaged non-leader unit.
- Status: Unreviewed

### 026 - Catacombs of Cadera

- Internal name: `catacombs-of-cadera`
- Type: Base
- Text: (none)
- Status: Finished

### 027 - Kestro City

- Internal name: `kestro-city`
- Type: Base
- Text: (none)
- Status: Finished

### 028 - Jedha City

- Internal name: `jedha-city`
- Type: Base
- Text: Epic Action: Give a non-leader unit -4/-0 for this phase.
- Status: Unreviewed

### 029 - Administrator's Tower

- Internal name: `administrators-tower`
- Type: Base
- Text: (none)
- Status: Finished

### 031 - Inferno Four - Unforgetting

- Internal name: `inferno-four#unforgetting`
- Type: Unit
- Text: When Played/When Defeated: Look at the top 2 cards of your deck. Put any number of them on the bottom of your deck and the rest on top in any order.
- Status: Unreviewed

### 032 - Scout Bike Pursuer

- Internal name: `scout-bike-pursuer`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 034 - Del Meeko - Providing Overwatch

- Internal name: `del-meeko#providing-overwatch`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.) Each event an opponent plays costs [1 resource] more.
- Status: Unreviewed

### 035 - Lieutenant Childsen - Death Star Prison Warden

- Internal name: `lieutenant-childsen#death-star-prison-warden`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) When Played: Reveal up to 4 [Vigilance] cards from your hand. For each card revealed this way, give an Experience token to this unit.
- Status: Unreviewed

### 036 - Gideon Hask - Ruthless Loyalist

- Internal name: `gideon-hask#ruthless-loyalist`
- Type: Unit
- Text: When an enemy unit is defeated: Give an Experience token to a friendly unit.
- Rules: If Gideon Hask is defeated simultaneously with other enemy units, you still get to give Experience.
- Status: Unreviewed

### 037 - Academy Defense Walker

- Internal name: `academy-defense-walker`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) When Played: Give an Experience token to each friendly damaged unit.
- Status: Unreviewed

### 038 - Count Dooku - Darth Tyranus

- Internal name: `count-dooku#darth-tyranus`
- Type: Unit
- Text: Shielded (When you play this unit, give him a Shield token.) When Played: You may defeat a unit with 4 or less remaining HP.
- Status: Unreviewed

### 039 - AT-AT Suppressor

- Internal name: `atat-suppressor`
- Type: Unit
- Text: When Played: Exhaust all ground units.
- Status: Unreviewed

### 040 - Avenger - Hunting Star Destroyer

- Internal name: `avenger#hunting-star-destroyer`
- Type: Unit
- Text: When Played/On Attack: An opponent chooses a non‑leader unit they control. Defeat that unit.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 041 - Power of the Dark Side

- Internal name: `power-of-the-dark-side`
- Type: Event
- Text: An opponent chooses a unit they control. Defeat that unit.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 042 - Search Your Feelings

- Internal name: `search-your-feelings`
- Type: Event
- Text: Search your deck for a card and draw it. (Then, shuffle your deck.)
- Rules: After searching your deck, shuffle it.
- Status: Unreviewed

### 043 - Superlaser Blast

- Internal name: `superlaser-blast`
- Type: Event
- Text: Defeat all units.
- Status: Unreviewed

### 044 - Restored ARC-170

- Internal name: `restored-arc170`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.)
- Status: Unreviewed

### 045 - Yoda - Old Master

- Internal name: `yoda#old-master`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.) When Defeated: Choose any number of players. They each draw a card.
- Status: Unreviewed

### 046 - Consular Security Force

- Internal name: `consular-security-force`
- Type: Unit
- Text: (none)
- Status: Finished

### 047 - Kanan Jarrus - Revealed Jedi

- Internal name: `kanan-jarrus#revealed-jedi`
- Type: Unit
- Text: On Attack: You may discard 1 card from the defending player's deck for each friendly SPECTRE unit. Heal 1 damage from your base for each different aspect among the discarded cards.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 048 - Vigilant Honor Guards

- Internal name: `vigilant-honor-guards`
- Type: Unit
- Text: While this unit is undamaged, it gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 049 - Obi-Wan Kenobi - Following Fate

- Internal name: `obiwan-kenobi#following-fate`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) When Defeated: Give 2 Experience tokens to another friendly unit. If it's a Force unit, draw a card.
- Status: Unreviewed

### 050 - The Ghost - Spectre Home Base

- Internal name: `the-ghost#spectre-home-base`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.) When Played/On Attack: You may give a Shield token to another SPECTRE unit.
- Status: Unreviewed

### 051 - Luke Skywalker - Jedi Knight

- Internal name: `luke-skywalker#jedi-knight`
- Type: Unit
- Text: Restore 3 When Played: Give an enemy unit –3/–3 for this phase. If a friendly unit was defeated this phase, give that enemy unit –6/–6 for this phase instead.
- Status: Unreviewed

### 052 - Redemption - Medical Frigate

- Internal name: `redemption#medical-frigate`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) When Played: Heal up to 8 total damage from any number of units and/or bases. Deal that much damage to this unit.
- Status: Unreviewed

### 053 - Luke's Lightsaber

- Internal name: `lukes-lightsaber`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. When Played: If attached unit is Luke Skywalker, heal all damage from him and give a Shield token to him.
- Status: Unreviewed

### 054 - Jedi Lightsaber

- Internal name: `jedi-lightsaber`
- Type: Upgrade
- Text: Attach to a non-VEHICLE unit. If attached unit is a FORCE unit, it gains: “On Attack: Give the defender –2/–2 for this phase.”
- Rules: (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 055 - The Force Is With Me

- Internal name: `the-force-is-with-me`
- Type: Event
- Text: Choose a friendly unit and give 2 Experience tokens to it. If you control a FORCE unit, also give a Shield token to the chosen unit. You may attack with the chosen unit.
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 056 - Bendu - The One in the Middle

- Internal name: `bendu#the-one-in-the-middle`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) On Attack: The next non-[Heroism], non-[Villainy] card you play this phase costs [2 resources] less.
- Rules: The cost reduction from Bendu’s “On Attack” ability remains active even if Bendu is defeated.
- Status: Unreviewed

### 057 - Protector

- Internal name: `protector`
- Type: Upgrade
- Text: Attached unit gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 058 - Vigilance

- Internal name: `vigilance`
- Type: Event
- Text: Choose two, in any order: Discard 6 cards from an opponent's deck. Heal 5 damage from a base. Defeat a unit with 3 or less remaining HP. Give a Shield token to a unit.
- Rules: Always discard from the top of a deck unless an ability says otherwise.
- Status: Unreviewed

### 059 - 2-1B Surgical Droid

- Internal name: `21b-surgical-droid`
- Type: Unit
- Text: On Attack: You may heal 2 damage from another unit.
- Status: Unreviewed

### 060 - Distant Patroller

- Internal name: `distant-patroller`
- Type: Unit
- Text: When Defeated: You may give a Shield token to a [Vigilance] unit.
- Status: Unreviewed

### 062 - Regional Governor

- Internal name: `regional-governor`
- Type: Unit
- Text: When Played: Name a card. While this unit is in play, opponents can't play the named card.
- Rules: Abilities that refer to a card’s “name” do not include the subtitle of the card. Until Regional Governor leaves play, your opponents can’t play the named card. This effect is not changed if an opponent takes control of Regional Governor. If Regional Governor is captured and then rescued, its "When Played" effect does not resume.
- Status: Unreviewed

### 063 - Cloud City Wing Guard

- Internal name: `cloud-city-wing-guard`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 064 - Wilderness Fighter

- Internal name: `wilderness-fighter`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 065 - Baze Malbus - Temple Guardian

- Internal name: `baze-malbus#temple-guardian`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on him.) While you have the initiative, this unit gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 067 - Rugged Survivors

- Internal name: `rugged-survivors`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.) On Attack: If you control a leader unit, you may draw a card.
- Status: Unreviewed

### 071 - Electrostaff

- Internal name: `electrostaff`
- Type: Upgrade
- Text: Attach to a non-VEHICLE unit. While attached unit is defending, the attacker gets –1/–0.
- Status: Unreviewed

### 072 - Entrenched

- Internal name: `entrenched`
- Type: Upgrade
- Text: Attached unit can't attack bases.
- Rules: Units that can’t attack bases can still damage bases through other abilities, like Overwhelm.
- Status: Unreviewed

### 073 - Moment of Peace

- Internal name: `moment-of-peace`
- Type: Event
- Text: Give a Shield token to a unit.
- Status: Unreviewed

### 075 - It Binds All Things

- Internal name: `it-binds-all-things`
- Type: Event
- Text: Heal up to 3 damage from a unit. If you control a FORCE unit, you may deal that much damage to another unit.
- Rules: You can only choose to deal damage equal to the amount of damage removed.
- Status: Unreviewed

### 076 - Make an Opening

- Internal name: `make-an-opening`
- Type: Event
- Text: Give a unit –2/–2 for this phase. Heal 2 damage from your base.
- Status: Unreviewed

### 077 - Takedown

- Internal name: `takedown`
- Type: Event
- Text: Defeat a unit with 5 or less remaining HP.
- Status: Unreviewed

### 079 - Admiral Piett - Captain of the Executor

- Internal name: `admiral-piett#captain-of-the-executor`
- Type: Unit
- Text: Each friendly non-leader unit that costs 6 or more gains Ambush. (After you play that unit, it may ready and attack an enemy unit.)
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 082 - Emperor's Royal Guard

- Internal name: `emperors-royal-guard`
- Type: Unit
- Text: While you control an OFFICIAL unit, this unit gains Sentinel. While you control Emperor Palpatine (as a leader or unit), this unit gets +0/+1.
- Status: Unreviewed

### 084 - Grand Moff Tarkin - Death Star Overseer

- Internal name: `grand-moff-tarkin#death-star-overseer`
- Type: Unit
- Text: When Played: Search the top 5 cards of your deck for up to 2 Imperial cards, reveal them, and draw them. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 085 - Rukh - Thrawn's Assassin

- Internal name: `rukh#thrawns-assassin`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.) When this unit deals combat damage to a non-leader unit while attacking: Defeat that unit.
- Rules: “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 086 - Gladiator Star Destroyer

- Internal name: `gladiator-star-destroyer`
- Type: Unit
- Text: When Played: Give a unit Sentinel for this phase. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 087 - Darth Vader - Commanding the First Legion

- Internal name: `darth-vader#commanding-the-first-legion`
- Type: Unit
- Text: Ambush When Played: Search the top 10 cards of your deck for any number of [Villainy] units with combined cost 3 or less and play each of them for free.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs. For abilities that encompass multiple actions, resolve each action (and any resulting triggers) sequentially. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. After searching, put any cards not chosen on the bottom of your deck in a random order. If you choose any Pilot units with your search, you may only play them as units.
- Status: Unreviewed

### 088 - Blizzard Assault AT-AT

- Internal name: `blizzard-assault-atat`
- Type: Unit
- Text: When this unit attacks and defeats a unit: You may deal the excess damage from this attack to an enemy ground unit.
- Rules: (ERRATA) While attacking, this unit may deal its excess damage to an enemy ground unit. If Blizzard Assault AT-AT is given Overwhelm, its controller chooses whether to apply the excess damage from its attack to a unit or to the defending player's base.
- Status: Unreviewed

### 089 - Relentless - Konstantine's Folly

- Internal name: `relentless#konstantines-folly`
- Type: Unit
- Text: The first event played by each opponent each round loses all abilities.
- Status: Unreviewed

### 090 - Devastator - Inescapable

- Internal name: `devastator#inescapable`
- Type: Unit
- Text: Sentinel Overwhelm When Played: You may deal damage to a unit equal to the number of resources you control.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 091 - The Emperor's Legion

- Internal name: `the-emperors-legion`
- Type: Event
- Text: Return each unit in your discard pile that was defeated this phase to your hand.
- Status: Unreviewed

### 092 - Overwhelming Barrage

- Internal name: `overwhelming-barrage`
- Type: Event
- Text: Give a friendly unit +2/+2 for this phase. Then, it deals damage equal to its power divided as you choose among any number of other units.
- Rules: You can choose to assign more damage to a unit than it has remaining HP. All damage dealt by a single ability is dealt simultaneously.
- Status: Unreviewed

### 093 - Alliance Dispatcher

- Internal name: `alliance-dispatcher`
- Type: Unit
- Text: Action [exhaust]: Play a unit from your hand. It costs [1 resource] less.
- Status: Unreviewed

### 094 - Bail Organa - Rebel Councilor

- Internal name: `bail-organa#rebel-councilor`
- Type: Unit
- Text: Action [Exhaust]: Give an Experience token to another friendly unit.
- Status: Unreviewed

### 095 - Battlefield Marine

- Internal name: `battlefield-marine`
- Type: Unit
- Text: (none)
- Status: Finished

### 096 - Mon Mothma - Voice Of The Rebellion

- Internal name: `mon-mothma#voice-of-the-rebellion`
- Type: Unit
- Text: When Played: Search the top 5 cards of your deck for a REBEL card, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 097 - Admiral Ackbar - Brilliant Strategist

- Internal name: `admiral-ackbar#brilliant-strategist`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.) When Played: You may deal damage to a unit equal to the number of units you control in its arena.
- Status: Unreviewed

### 098 - Echo Base Defender

- Internal name: `echo-base-defender`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 099 - Bright Hope - The Last Transport

- Internal name: `bright-hope#the-last-transport`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) When Played: You may return a friendly non-leader ground unit to its owner's hand. If you do, draw a card.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 100 - Wedge Antilles - Star of the Rebellion

- Internal name: `wedge-antilles#star-of-the-rebellion`
- Type: Unit
- Text: Each friendly VEHICLE unit gets +1/+1 and gains Ambush. (After you play that unit, it may ready and attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 101 - Rogue Squadron Skirmisher

- Internal name: `rogue-squadron-skirmisher`
- Type: Unit
- Text: Ambush (After you play this unit, it may ready and attack an enemy unit.) When Played: Return a unit that costs 2 or less from your discard pile to your hand.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 102 - Home One - Alliance Flagship

- Internal name: `home-one#alliance-flagship`
- Type: Unit
- Text: Restore 2 Each other friendly unit gains Restore 1. When Played: Play a [Heroism] unit from your discard pile. It costs [3 resources] less.
- Status: Unreviewed

### 103 - Rebel Assault

- Internal name: `rebel-assault`
- Type: Event
- Text: Attack with a REBEL unit. It gets +1/+0 for this attack. Then, attack with another REBEL unit. It gets +1/+0 for this attack.
- Rules: You must attack with a Rebel unit, if able. Units must be ready in order to attack. For abilities that encompass multiple actions, resolve each action (and any resulting triggers) sequentially.
- Status: Unreviewed

### 104 - U-Wing Reinforcement

- Internal name: `uwing-reinforcement`
- Type: Event
- Text: Search the top 10 cards of your deck for up to 3 units with combined cost 7 or less and play each of them for free. (Put the other cards on the bottom of your deck in a random order.)
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs. For abilities that encompass multiple actions, resolve each action (and any resulting triggers) sequentially. After searching, put any cards not chosen on the bottom of your deck in a random order. If you choose any Pilot units with your search, you may only play them as units.
- Status: Unreviewed

### 105 - General Krell - Heartless Tactician

- Internal name: `general-krell#heartless-tactician`
- Type: Unit
- Text: Each other friendly unit gains: “When Defeated: You may draw a card.”
- Rules: If General Krell is defeated simultaneously with other friendly units, all “When Defeated” abilities still trigger.
- Status: Unreviewed

### 106 - Attack Pattern Delta

- Internal name: `attack-pattern-delta`
- Type: Event
- Text: Give a friendly unit +3/+3 for this phase. Give another friendly unit +2/+2 for this phase. Give a third friendly unit +1/+1 for this phase.
- Status: Unreviewed

### 107 - Command

- Internal name: `command`
- Type: Event
- Text: Choose two, in any order: Give 2 Experience tokens to a unit. A friendly unit deals damage equal to its power to a non-unique enemy unit. Put this event into play as a resource. Return a unit from your discard pile to your hand.
- Rules: A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”. (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 108 - Vanguard Infantry

- Internal name: `vanguard-infantry`
- Type: Unit
- Text: When Defeated: You may give an Experience token to a unit.
- Status: Unreviewed

### 109 - Colonel Yularen - ISB Director

- Internal name: `colonel-yularen#isb-director`
- Type: Unit
- Text: When you play a [Command] unit (including this one): Heal 1 damage from your base.
- Status: Unreviewed

### 110 - Frontline Shuttle

- Internal name: `frontline-shuttle`
- Type: Unit
- Text: Action [defeat this unit]: Attack with a unit, even if it's exhausted. It can't attack bases for this attack.
- Rules: If you use Frontline Shuttle’s ability, you must attack with a unit, if able. Units that can’t attack bases can still damage bases through other abilities, like Overwhelm.
- Status: Unreviewed

### 112 - Consortium StarViper

- Internal name: `consortium-starviper`
- Type: Unit
- Text: While you have the initiative, this unit gains Restore 2. (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 114 - Escort Skiff

- Internal name: `escort-skiff`
- Type: Unit
- Text: While you control another [Command] unit, this unit gains Ambush. (After you play this unit, it may ready and attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 115 - Agent Kallus - Seeking the Rebels

- Internal name: `agent-kallus#seeking-the-rebels`
- Type: Unit
- Text: Ambush (After you play this unit, he may ready and attack an enemy unit.) When another unique unit is defeated: You may draw a card. Use this ability only once each round.
- Rules: If Agent Kallus is defeated simultaneously with other unique units, you still may draw a card. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 116 - Steadfast Battalion

- Internal name: `steadfast-battalion`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) On Attack: If you control a leader unit, give a friendly unit +2/+2 for this phase.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 118 - 97th Legion - Keeping the Peace on Sullust

- Internal name: `97th-legion#keeping-the-peace-on-sullust`
- Type: Unit
- Text: This unit gets +1/+1 for each resource you control.
- Status: Unreviewed

### 119 - Reinforcement Walker

- Internal name: `reinforcement-walker`
- Type: Unit
- Text: When Played/On Attack: Look at the top card of your deck. Either draw that card or discard it and heal 3 damage from your base.
- Rules: You may choose whether to draw a card or discard a card and heal 3 from your base.
- Status: Unreviewed

### 120 - Academy Training

- Internal name: `academy-training`
- Type: Upgrade
- Text: (none)
- Status: Finished

### 121 - Hardpoint Heavy Blaster

- Internal name: `hardpoint-heavy-blaster`
- Type: Upgrade
- Text: Attach to a VEHICLE unit. Attached unit gains: "On Attack: If this unit isn't attacking a base, you may deal 2 damage to a unit in the defender's arena."
- Rules: (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 122 - Traitorous

- Internal name: `traitorous`
- Type: Upgrade
- Text: When this upgrade becomes attached to a non‑leader unit that costs 3 or less: Take control of that unit. When this upgrade becomes unattached from a unit: That unit's owner takes control of it.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. (ERRATA) Templating update: “Becomes attached” changes to “attaches”. “Becomes unattached” updates to “detaches”.
- Status: Unreviewed

### 123 - Recruit

- Internal name: `recruit`
- Type: Event
- Text: Search the top 5 cards of your deck for a unit, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 127 - Strike True

- Internal name: `strike-true`
- Type: Event
- Text: A friendly unit deals damage equal to its power to an enemy unit.
- Status: Unreviewed

### 128 - Death Star Stormtrooper

- Internal name: `death-star-stormtrooper`
- Type: Unit
- Text: (none)
- Status: Finished

### 129 - Admiral Ozzel - Overconfident

- Internal name: `admiral-ozzel#overconfident`
- Type: Unit
- Text: Action [exhaust]: Play an Imperial unit from your hand (paying its cost). It enters play ready. Each opponent may ready a unit.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. Opponents choose and ready their units before resolving any “When Played” abilities or other abilities that trigger when you play your unit.
- Status: Unreviewed

### 130 - First Legion Snowtrooper

- Internal name: `first-legion-snowtrooper`
- Type: Unit
- Text: While attacking a damaged unit, this unit gets +2/+0 and gains Overwhelm. (Deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 131 - Fifth Brother - Fear Hunter

- Internal name: `fifth-brother#fear-hunter`
- Type: Unit
- Text: This unit gains Raid 1 for each damage on him. (He gets +1/+0 while attacking for each damage on him.) On Attack: You may deal 1 damage to this unit and 1 damage to another ground unit.
- Status: Unreviewed

### 132 - Imperial Interceptor

- Internal name: `imperial-interceptor`
- Type: Unit
- Text: When Played: You may deal 3 damage to a space unit.
- Status: Unreviewed

### 133 - Seventh Sister - Implacable Inquisitor

- Internal name: `seventh-sister#implacable-inquisitor`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) When this unit deals combat damage to an opponent's base: You may deal 3 damage to a ground unit that opponent controls.
- Rules: “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 134 - Ruthless Raider

- Internal name: `ruthless-raider`
- Type: Unit
- Text: When Played/When Defeated: Deal 2 damage to an enemy base and 2 damage to an enemy unit.
- Status: Unreviewed

### 135 - Emperor Palpatine - Master of the Dark Side

- Internal name: `emperor-palpatine#master-of-the-dark-side`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) When Played: Deal 6 damage divided as you choose among enemy units.
- Rules: You can choose to assign more damage to a unit than it has remaining HP. All damage dealt by a single ability is dealt simultaneously. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 136 - Vader's Lightsaber

- Internal name: `vaders-lightsaber`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. When Played: If attached unit is Darth Vader, you may deal 4 damage to a ground unit.
- Status: Unreviewed

### 137 - Fallen Lightsaber

- Internal name: `fallen-lightsaber`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. If attached unit is a Force unit, it gains: "On Attack: Deal 1 damage to each ground unit the defending player controls."
- Status: Unreviewed

### 138 - Force Lightning

- Internal name: `force-lightning`
- Type: Event
- Text: Choose a unit. It loses all abilities for this phase. Then, if you control a FORCE unit, pay any number of resources and deal 2 damage to the chosen unit for each resource paid this way.
- Rules: The chosen unit can still gain new abilities later in the phase, including the abilities it lost. All damage dealt by a single ability is dealt simultaneously. The chosen unit can't gain abilities for this phase.
- Status: Unreviewed

### 139 - Force Choke

- Internal name: `force-choke`
- Type: Event
- Text: If you control a FORCE unit, this event costs [1 resource] less to play. Deal 5 damage to a non-VEHICLE unit. That unit's controller draws a card.
- Status: Unreviewed

### 140 - SpecForce Soldier

- Internal name: `specforce-soldier`
- Type: Unit
- Text: When Played: A unit loses Sentinel for this phase.
- Rules: The chosen unit can still gain Sentinel later in the phase from another ability. The unit affected by SpecForce Soldier's "When Played" ability can't gain Sentinel for this phase.
- Status: Unreviewed

### 141 - Green Squadron A-Wing

- Internal name: `green-squadron-awing`
- Type: Unit
- Text: Raid 2 (This unit gets +2/+0 while attacking.)
- Status: Unreviewed

### 142 - Sabine Wren - Explosives Artist

- Internal name: `sabine-wren#explosives-artist`
- Type: Unit
- Text: While there are at least 3 aspects among other friendly units, this unit can't be attacked (unless she gains Sentinel). On Attack: You may deal 1 damage to the defender or to a base.
- Rules: Sabine’s first ability requires 3 different aspects among other friendly units. If a unit that can't be attacked gains Sentinel, it can be attacked. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 143 - Fighters for Freedom

- Internal name: `fighters-for-freedom`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) When you play another [Aggression] card: You may deal 1 damage to a base.
- Status: Unreviewed

### 144 - Red Three - Unstoppable

- Internal name: `red-three#unstoppable`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.) Each other friendly [Heroism] unit gains Raid 1.
- Status: Unreviewed

### 145 - K-2SO - Cassian's Counterpart

- Internal name: `k2so#cassians-counterpart`
- Type: Unit
- Text: Overwhelm When Defeated: For each opponent, choose one: either deal 3 damage to that player's base, or that player discards a card from their hand.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 146 - Zeb Orrelios - Headstrong Warrior

- Internal name: `zeb-orrelios#headstrong-warrior`
- Type: Unit
- Text: When this unit completes an attack: If the defender was defeated, you may deal 4 damage to a ground unit.
- Rules: A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 147 - Black One - Scourge of Starkiller Base

- Internal name: `black-one#scourge-of-starkiller-base`
- Type: Unit
- Text: When Played/When Defeated: You may discard your hand. If you do, draw 3 cards.
- Rules: If you have no cards in your hand, you may still choose to discard your hand in order to draw 3 cards.
- Status: Unreviewed

### 148 - Guerilla Attack Pod

- Internal name: `guerilla-attack-pod`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.) When Played: If a base has 15 or more damage on it, ready this unit.
- Status: Unreviewed

### 149 - Mace Windu - Party Crasher

- Internal name: `mace-windu#party-crasher`
- Type: Unit
- Text: Ambush When this unit attacks and defeats a unit: Ready him.
- Rules: A unit “attacks and defeats a unit” if it defeats the defender at any point during the attack. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 150 - Heroic Sacrifice

- Internal name: `heroic-sacrifice`
- Type: Event
- Text: Draw a card, then attack with a unit. For this attack, it gets +2/+0 and gains: "When this unit deals combat damage: Defeat it."
- Rules: You must attack with a unit, if able. Units must be ready in order to attack. “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 151 - Karabast

- Internal name: `karabast`
- Type: Event
- Text: A friendly unit deals damage to an enemy unit equal to the amount of damage on the friendly unit plus 1.
- Status: Unreviewed

### 152 - For a Cause I Believe In

- Internal name: `for-a-cause-i-believe-in`
- Type: Event
- Text: Reveal the top 4 cards of your deck. For each [Heroism] card revealed this way, deal 1 damage to an enemy base. You may discard any of the revealed cards and put the rest back on top of your deck in any order.
- Status: Unreviewed

### 153 - Saw Gerrera - Extremist

- Internal name: `saw-gerrera#extremist`
- Type: Unit
- Text: As an additional cost for each opponent to play an event, they must deal 2 damage to their base.
- Rules: If an opponent’s base is defeated by the cost of playing an event, the event’s ability does not resolve.
- Status: Unreviewed

### 154 - Rallying Cry

- Internal name: `rallying-cry`
- Type: Event
- Text: Each friendly unit gains Raid 2 this phase. (They get +2/+0 while attacking.)
- Status: Unreviewed

### 155 - Aggression

- Internal name: `aggression`
- Type: Event
- Text: Choose two, in any order: Draw a card. Defeat up to 2 upgrades. Ready a unit with 3 or less power. Deal 4 damage to a unit.
- Status: Unreviewed

### 156 - Benthic "Two Tubes" - Partisan Lieutenant

- Internal name: `benthic-two-tubes#partisan-lieutenant`
- Type: Unit
- Text: On Attack: Another friendly [Aggression] unit gains Raid 2 for this phase. (It gets +2/+0 while attacking.)
- Status: Unreviewed

### 157 - Cantina Braggart

- Internal name: `cantina-braggart`
- Type: Unit
- Text: Raid 2 (This unit gets +2/+0 while attacking.)
- Status: Unreviewed

### 158 - Jedha Agitator

- Internal name: `jedha-agitator`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) On Attack: If you control a leader unit, deal 2 damage to a ground unit or a base.
- Status: Unreviewed

### 159 - Partisan Insurgent

- Internal name: `partisan-insurgent`
- Type: Unit
- Text: While you control another [Aggression] unit, this unit gains Raid 2. (It gets +2/+0 while attacking.)
- Status: Unreviewed

### 160 - Wolffe - Suspicious Veteran

- Internal name: `wolffe#suspicious-veteran`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) When Played/On Attack: Bases can't be healed for this phase.
- Rules: Bases can’t be healed for the phase even if Wolffe is defeated after triggering his ability.
- Status: Unreviewed

### 161 - Ardent Sympathizer

- Internal name: `ardent-sympathizer`
- Type: Unit
- Text: While you have the initiative, this unit gets +2/+0.
- Status: Unreviewed

### 163 - Star Wing Scout

- Internal name: `star-wing-scout`
- Type: Unit
- Text: When Defeated: If you have the initiative, draw 2 cards.
- Status: Unreviewed

### 166 - Infiltrator's Skill

- Internal name: `infiltrators-skill`
- Type: Upgrade
- Text: Attached unit gains Saboteur. (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 167 - Force Throw

- Internal name: `force-throw`
- Type: Event
- Text: Choose a player. That player discards a card from their hand. Then, if you control a FORCE unit, you may deal damage to a unit equal to the cost of the discarded card.
- Status: Unreviewed

### 168 - Precision Fire

- Internal name: `precision-fire`
- Type: Event
- Text: Attack with a unit. It gains Saboteur for this attack. If it's a TROOPER, it also gets +2/+0 for this attack. (Ignore Sentinel and defeat the defender's Shields.)
- Rules: You must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 169 - Keep Fighting

- Internal name: `keep-fighting`
- Type: Event
- Text: Ready a unit with 3 or less power.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 170 - Power Failure

- Internal name: `power-failure`
- Type: Event
- Text: Defeat any number of upgrades on a unit.
- Status: Unreviewed

### 171 - Mission Briefing

- Internal name: `mission-briefing`
- Type: Event
- Text: Choose a player. They draw 2 cards.
- Status: Unreviewed

### 173 - Bombing Run

- Internal name: `bombing-run`
- Type: Event
- Text: Choose an arena (ground or space). Deal 3 damage to each unit in that arena.
- Status: Unreviewed

### 174 - Smoke and Cinders

- Internal name: `smoke-and-cinders`
- Type: Event
- Text: Each player discards all but 2 cards (of their choice) from their hand.
- Status: Unreviewed

### 175 - Forced Surrender

- Internal name: `forced-surrender`
- Type: Event
- Text: Draw 2 cards. Each opponent whose base you've damaged this phase discards 2 cards from their hand.
- Status: Unreviewed

### 177 - Bib Fortuna - Jabba's Majordomo

- Internal name: `bib-fortuna#jabbas-majordomo`
- Type: Unit
- Text: Shielded (When you play this unit, give him a Shield token.) Action [Exhaust]: Play an event from your hand. It costs [1 resource] less.
- Status: Unreviewed

### 178 - Cartel Spacer

- Internal name: `cartel-spacer`
- Type: Unit
- Text: When Played: If you control another [Cunning] unit, exhaust an enemy unit that costs 4 or less.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 179 - Boba Fett - Disintegrator

- Internal name: `boba-fett#disintegrator`
- Type: Unit
- Text: On Attack: If this unit is attacking an exhausted unit that didn't enter play this round, deal 3 damage to the defender.
- Rules: Boba Fett’s ability will not deal damage to an exhausted leader unit the turn that leader deploys, since leader units are considered to enter play.
- Status: Unreviewed

### 180 - Seventh Fleet Defender

- Internal name: `seventh-fleet-defender`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 181 - Jabba the Hutt - Cunning Daimyo

- Internal name: `jabba-the-hutt#cunning-daimyo`
- Type: Unit
- Text: Each TRICK event you play costs [1 resource] less. When Played: Search the top 8 cards of your deck for a TRICK event, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 182 - Bossk - Deadly Stalker

- Internal name: `bossk#deadly-stalker`
- Type: Unit
- Text: Ambush (After you play this unit, he may ready and attack an enemy unit.) When you play an event: You may deal 2 damage to a unit.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. Bossk’s “When you play an event” ability triggers when an event is played but only resolves after the event has fully finished resolving.
- Status: Unreviewed

### 183 - Bounty Hunter Crew

- Internal name: `bounty-hunter-crew`
- Type: Unit
- Text: Ambush (After you play this unit, it may ready and attack an enemy unit.) When Played: You may return an event from a discard pile to its owner's hand.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 184 - Fett's Firespray - Pursuing the Bounty

- Internal name: `fetts-firespray#pursuing-the-bounty`
- Type: Unit
- Text: When Played: If you control Boba Fett or Jango Fett (as a leader or unit), ready this unit. Action [2 resources]: Exhaust a non-unique unit.
- Rules: (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 185 - Chimaera - Flagship of the Seventh Fleet

- Internal name: `chimaera#flagship-of-the-seventh-fleet`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.) On Attack: Name a card. An opponent reveals their hand and discards a card with that name from it.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.” Abilities that refer to a card’s “name” do not include the subtitle of the card.
- Status: Unreviewed

### 186 - No Good to Me Dead

- Internal name: `no-good-to-me-dead`
- Type: Event
- Text: Exhaust a unit. That unit can't ready this round (including during the regroup phase).
- Status: Unreviewed

### 187 - I Had No Choice

- Internal name: `i-had-no-choice`
- Type: Event
- Text: Choose up to 2 non-leader units. An opponent chooses 1 of those units. Return that unit to its owner's hand and put the other on the bottom of its owner's deck.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.” Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 188 - Chopper - Metal Menace

- Internal name: `chopper#metal-menace`
- Type: Unit
- Text: While you control another SPECTRE unit, this unit gains Raid 1. On Attack: Discard a card from the defending player's deck. If it's an event, exhaust a resource that player controls.
- Rules: Always discard from the top of a deck unless an ability says otherwise.
- Status: Unreviewed

### 189 - Leia Organa - Defiant Princess

- Internal name: `leia-organa#defiant-princess`
- Type: Unit
- Text: When Played: Either ready a resource or exhaust a unit.
- Rules: You may choose whether to ready a resource or exhaust a unit.
- Status: Unreviewed

### 190 - Lothal Insurgent

- Internal name: `lothal-insurgent`
- Type: Unit
- Text: When Played: If you played another card this phase, each opponent draws a card then discards a random card from their hand.
- Rules: If Lothal Insurgent is played by an event, that event counts as another card played this phase.
- Status: Unreviewed

### 191 - Vanguard Ace

- Internal name: `vanguard-ace`
- Type: Unit
- Text: When Played: For each other card you played this phase, give an Experience token to this unit.
- Rules: If Vanguard Ace is played by an event, that event counts as another card played this phase.
- Status: Unreviewed

### 192 - Ezra Bridger - Resourceful Troublemaker

- Internal name: `ezra-bridger#resourceful-troublemaker`
- Type: Unit
- Text: When this unit completes an attack: Look at the top card of your deck. You may play it, discard it, or leave it on top of your deck.
- Rules: A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 193 - Millennium Falcon - Piece of Junk

- Internal name: `millennium-falcon#piece-of-junk`
- Type: Unit
- Text: This unit enters play ready. When you ready cards during the regroup phase: Either pay [1 resource] or return this unit to her owner's hand.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified. You may choose whether to pay 1 or return the Millennium Falcon to its owner’s hand.
- Status: Unreviewed

### 194 - Rogue Operative

- Internal name: `rogue-operative`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) Raid 2 (This unit gets +2/+0 while attacking.)
- Status: Unreviewed

### 195 - Auzituck Liberator Gunship

- Internal name: `auzituck-liberator-gunship`
- Type: Unit
- Text: Ambush (After you play this unit, it may ready and attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 196 - Chewbacca - Loyal Companion

- Internal name: `chewbacca#loyal-companion`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) When this unit is attacked: Ready him.
- Rules: “When this unit is attacked” triggers at the same time as “On Attack” abilities. On Defense abilities trigger when this unit is chosen as the defender for an attack, in the same window as the attacker's On Attack abilities.
- Status: Unreviewed

### 197 - Lando Calrissian - Responsible Businessman

- Internal name: `lando-calrissian#responsible-businessman`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) When Played: Return up to 2 friendly resources to their owners' hands.
- Status: Unreviewed

### 198 - Han Solo - Reluctant Hero

- Internal name: `han-solo#reluctant-hero`
- Type: Unit
- Text: Ambush (After you play this unit, he may ready and attack an enemy unit.) While attacking, this unit deals combat damage before the defender.
- Rules: “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. If the defender is defeated by Han Solo’s combat damage, it does not deal combat damage back. If it survives and has Grit, it deals bonus damage from Grit when dealing combat damage back. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 199 - Bamboozle

- Internal name: `bamboozle`
- Type: Event
- Text: You may discard a [Cunning] card from your hand instead of paying this event's cost. Exhaust a unit and return each upgrade on it to its owner's hand.
- Rules: Each upgrade is returned to the upgrade’s owner’s hand. If you discard a card instead of paying this event’s cost, you ignore all costs, including all additional costs. If Bamboozle is played using Smuggle (for example, when a player has Tech in play), a player cannot discard a Y card from hand instead of paying the Smuggle cost, as Bamboozle's ability only can replace the event's printed cost.
- Status: Unreviewed

### 200 - Spark of Rebellion

- Internal name: `spark-of-rebellion`
- Type: Event
- Text: Look at an opponent's hand and discard a card from it.
- Status: Unreviewed

### 201 - Bodhi Rook - Imperial Defector

- Internal name: `bodhi-rook#imperial-defector`
- Type: Unit
- Text: When Played: Look at an opponent's hand and discard a non-unit card from it.
- Status: Unreviewed

### 202 - Cantina Bouncer

- Internal name: `cantina-bouncer`
- Type: Unit
- Text: When Played: You may return a non-leader unit to its owner's hand.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 203 - Cunning

- Internal name: `cunning`
- Type: Event
- Text: Choose two, in any order: Return a non-leader unit with 4 or less power to its owner's hand. Give a unit +4/+0 for this phase. Exhaust up to 2 units. An opponent discards a random card from their hand.
- Rules: Abilities that refer to a card’s power include temporary modifiers. If there are multiple opponents, the controlling player chooses which one will be “an opponent.” Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 204 - Greedo - Slow on the Draw

- Internal name: `greedo#slow-on-the-draw`
- Type: Unit
- Text: When Defeated: You may discard a card from your deck. If it's not a unit, deal 2 damage to a ground unit.
- Rules: Always discard from the top of a deck unless an ability says otherwise.
- Status: Unreviewed

### 205 - Jawa Scavenger

- Internal name: `jawa-scavenger`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 206 - Mining Guild TIE Fighter

- Internal name: `mining-guild-tie-fighter`
- Type: Unit
- Text: On Attack: You may pay [2 resources]. If you do, draw a card.
- Status: Unreviewed

### 207 - Crafty Smuggler

- Internal name: `crafty-smuggler`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 208 - Outer Rim Headhunter

- Internal name: `outer-rim-headhunter`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.) On Attack: If you control a leader unit, you may exhaust a non-leader unit.
- Status: Unreviewed

### 209 - Pirated Starfighter

- Internal name: `pirated-starfighter`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.) When Played: Return a friendly non-leader unit to its owner's hand.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified. If Pirated Starfighter is the only friendly unit in play, it must be chosen by its “When Played” ability.
- Status: Unreviewed

### 210 - Swoop Racer

- Internal name: `swoop-racer`
- Type: Unit
- Text: (none)
- Status: Finished

### 211 - Gamorrean Guards

- Internal name: `gamorrean-guards`
- Type: Unit
- Text: While you control another [Cunning] unit, this unit gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 212 - Strafing Gunship

- Internal name: `strafing-gunship`
- Type: Unit
- Text: This unit can attack units in the ground arena. While this unit is attacking a ground unit, the defender gets –2/–0.
- Rules: If an enemy space unit has Sentinel, Strafing Gunship cannot attack non-Sentinel ground units. Enemy ground units with Sentinel do not affect Strafing Gunship’s ability to attack ground units. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 213 - Syndicate Lackeys

- Internal name: `syndicate-lackeys`
- Type: Unit
- Text: Ambush (After you play this unit, it may ready and attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 214 - Smuggling Compartment

- Internal name: `smuggling-compartment`
- Type: Upgrade
- Text: Attach to a VEHICLE unit. Attached unit gains: "On Attack: Ready a resource."
- Status: Unreviewed

### 216 - Disarm

- Internal name: `disarm`
- Type: Event
- Text: Give an enemy unit –4/–0 for this phase.
- Status: Unreviewed

### 217 - Shoot First

- Internal name: `shoot-first`
- Type: Event
- Text: Attack with a unit. It gets +1/+0 for this attack and deals its combat damage before the defender. (If the defender is defeated, it deals no combat damage.)
- Rules: You must attack with a unit, if able. Units must be ready in order to attack. “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. If the defender is defeated by the attacked, it does not deal combat damage back. If it survives and has Grit, it deals bonus damage from Grit when dealing combat damage back. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 218 - Asteroid Sanctuary

- Internal name: `asteroid-sanctuary`
- Type: Event
- Text: Exhaust an enemy unit. Give a Shield token to a friendly unit that costs 3 or less.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 219 - Sneak Attack

- Internal name: `sneak-attack`
- Type: Event
- Text: Play a unit from your hand. It costs [3 resources] less and enters play ready. At the start of the regroup phase, defeat it.
- Status: Unreviewed

### 221 - Outmaneuver

- Internal name: `outmaneuver`
- Type: Event
- Text: Choose an arena (ground or space). Exhaust each unit in that arena.
- Status: Unreviewed

### 223 - Don't Get Cocky

- Internal name: `dont-get-cocky`
- Type: Event
- Text: Choose a unit. One at a time, reveal cards from your deck until you choose to stop or have revealed 7 cards. If the combined cost of the revealed cards is 7 or less, deal that much damage to the chosen unit. Put the revealed cards on the bottom of your deck in a random order.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Always reveal from the top of a deck unless an ability says otherwise.
- Status: Unreviewed

### 224 - Change of Heart

- Internal name: `change-of-heart`
- Type: Event
- Text: Take control of a non-leader unit. At the start of the regroup phase, its owner takes control of it.
- Status: Unreviewed

### 225 - TIE/ln Fighter

- Internal name: `tieln-fighter`
- Type: Unit
- Text: (none)
- Status: Finished

### 226 - Admiral Motti - Brazen and Scornful

- Internal name: `admiral-motti#brazen-and-scornful`
- Type: Unit
- Text: When Defeated: You may ready a [Villainy] unit.
- Status: Unreviewed

### 230 - General Veers - Blizzard Force Commander

- Internal name: `general-veers#blizzard-force-commander`
- Type: Unit
- Text: Other friendly Imperial units get +1/+1.
- Status: Unreviewed

### 231 - TIE Advanced

- Internal name: `tie-advanced`
- Type: Unit
- Text: When Played: Give 2 Experience tokens to another friendly IMPERIAL unit.
- Status: Unreviewed

### 232 - AT-ST

- Internal name: `atst`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 233 - I Am Your Father

- Internal name: `i-am-your-father`
- Type: Event
- Text: Deal 7 damage to an enemy unit unless its controller says "no." If they do, draw 3 cards.
- Rules: You must choose a unit before your opponent chooses whether to say “no.” Your opponent may opt to use another method instead of saying “no” as long as they clearly indicate which option they are choosing.
- Status: Unreviewed

### 234 - Maximum Firepower

- Internal name: `maximum-firepower`
- Type: Event
- Text: A friendly Imperial unit deals damage equal to its power to a unit. Then, another friendly Imperial unit deals damage equal to its power to the same unit.
- Status: Unreviewed

### 235 - Galactic Ambition

- Internal name: `galactic-ambition`
- Type: Event
- Text: Play a non-[Heroism] unit from your hand for free. Deal damage to your base equal to its cost.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 236 - R2-D2 - Ignoring Protocol

- Internal name: `r2d2#ignoring-protocol`
- Type: Unit
- Text: When Played/On Attack: Look at the top card of your deck. You may put it on the bottom of your deck. (Otherwise, leave it on top of your deck.)
- Status: Unreviewed

### 238 - C-3PO - Protocol Droid

- Internal name: `c3po#protocol-droid`
- Type: Unit
- Text: When Played/On Attack: Choose a number, then look at the top card of your deck. If its cost is the chosen number, you may reveal and draw it. (Otherwise, leave it on top of your deck.)
- Status: Unreviewed

### 240 - Fleet Lieutenant

- Internal name: `fleet-lieutenant`
- Type: Unit
- Text: When Played: You may attack with a unit. If it's a Rebel unit, it gets +2/+0 for this attack.
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 241 - Wing Leader

- Internal name: `wing-leader`
- Type: Unit
- Text: When Played: Give 2 Experience tokens to another friendly REBEL unit.
- Status: Unreviewed

### 242 - General Dodonna - Massassi Group Commander

- Internal name: `general-dodonna#massassi-group-commander`
- Type: Unit
- Text: Other friendly Rebel units get +1/+1.
- Status: Unreviewed

### 243 - Regional Sympathizers

- Internal name: `regional-sympathizers`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 244 - Snowspeeder

- Internal name: `snowspeeder`
- Type: Unit
- Text: Ambush (After you play this unit, it may ready and attack an enemy unit.) On Attack: Exhaust an enemy Vehicle ground unit.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 245 - Medal Ceremony

- Internal name: `medal-ceremony`
- Type: Event
- Text: Give an Experience token to each of up to 3 REBEL units that attacked this phase.
- Status: Unreviewed

### 246 - You're My Only Hope

- Internal name: `youre-my-only-hope`
- Type: Event
- Text: Look at the top card of your deck. You may play it. It costs [5 resources] less. If your base has 5 or less remaining HP, you may play it for free instead.
- Rules: “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 249 - Frontier AT-RT

- Internal name: `frontier-atrt`
- Type: Unit
- Text: While you control another VEHICLE unit, this unit gains Ambush. (After you play this unit, it may ready and attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 252 - Restock

- Internal name: `restock`
- Type: Event
- Text: Choose up to 4 cards in a discard pile. Put them on the bottom of their owner's deck in a random order.
- Status: Unreviewed

## Tokens

### Token - Experience

- Internal name: `experience`
- Type: Token, Upgrade
- Text: (none)
- Status: Finished

### Token - Shield

- Internal name: `shield`
- Type: Token, Upgrade
- Text: If damage would be dealt to attached unit, prevent that damage. If you do, defeat a Shield token on it.
- Status: Unreviewed

