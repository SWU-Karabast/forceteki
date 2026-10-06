# 02_SHD (SHD) card review

255 cards, in set order. Review against the official card text (`test/json/Card/`), not our implementations.

### 001 - Gar Saxon - Viceroy of Mandalore

- Internal name: `gar-saxon#viceroy-of-mandalore`
- Type: Leader
- Text: Each friendly upgraded unit gets +1/+0.
- Deployed: Each friendly upgraded unit gets +1/+0 and gains: “When Defeated: You may return an upgrade that was attached to this unit to its owner’s hand.”
- Rules: If Gar Saxon is defeated simultaneously with other friendly units, all “When Defeated” abilities still trigger. You may only use Gar Saxon’s unit side ability to return upgrades that were attached to the unit when it was defeated.
- Status: Unreviewed

### 002 - Qi'ra - I Alone Survived

- Internal name: `qira#i-alone-survived`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Deal 2 damage to a friendly unit. Then, give a Shield token to it.
- Deployed: Grit (This unit gets +1/+0 for each damage on her.) When Deployed: Heal all damage from each unit. Then, deal damage to each unit equal to half its remaining HP, rounded down.
- Rules: All damage dealt by Qi’ra’s “When Deployed” ability is dealt simultaneously.
- Status: Unreviewed

### 003 - Finn - This is a Rescue

- Internal name: `finn#this-is-a-rescue`
- Type: Leader
- Text: Action [Exhaust]: Defeat a friendly upgrade on a unit. If you do, give a Shield token to that unit.
- Deployed: On Attack: You may defeat a friendly upgrade on a unit. If you do, give a Shield token to that unit.
- Status: Unreviewed

### 004 - Rey - More Than a Scavenger

- Internal name: `rey#more-than-a-scavenger`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Give an Experience token to a unit with 2 or less power.
- Deployed: Restore 3 (When this unit attacks, heal 3 damage from your base.) On Attack: You may give an Experience token to a unit with 2 or less power.
- Rules: Abilities that refer to a card’s power include all modifiers, including upgrades and temporary effects.
- Status: Unreviewed

### 005 - Hondo Ohnaka - That's Good Business

- Internal name: `hondo-ohnaka#thats-good-business`
- Type: Leader
- Text: When you play a card using Smuggle: You may exhaust this leader. If you do, give an Experience token to a unit.
- Deployed: Raid 1 (This unit gets +1/+0 while attacking.) When you play a card using Smuggle: You may give an Experience token to a unit.
- Status: Unreviewed

### 006 - Jabba the Hutt - His High Exaltedness

- Internal name: `jabba-the-hutt#his-high-exaltedness`
- Type: Leader
- Text: Action [Exhaust]: Choose a unit. For this phase, it gains: “Bounty — The next unit you play this phase costs 1 resource less.”
- Deployed: When Deployed: Another friendly unit captures an enemy non-leader unit. Action [Exhaust]: Choose a unit. For this phase, it gains: “Bounty — The next unit you play this phase costs 2 resources less.”
- Status: Unreviewed

### 007 - Moff Gideon - Formidable Commander

- Internal name: `moff-gideon#formidable-commander`
- Type: Leader
- Text: Action [exhaust]: Attack with a unit that costs 3 or less. If it's attacking a unit, it gets +1/+0 for this attack.
- Deployed: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) Each friendly unit that costs 3 or less gets +1/+0 and gains Overwhelm while attacking an enemy unit.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. If you use Moff Gideon’s leader ability, you must attack with a unit that costs 3 or less, if able. Units must be ready in order to attack. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated before combat damage is dealt, the attacker is still considered to be attacking a unit, and all damage is considered excess damage for the purpose of Overwhelm.
- Status: Unreviewed

### 008 - Boba Fett - Daimyo

- Internal name: `boba-fett#daimyo`
- Type: Leader
- Text: When you play a unit that has 1 or more keywords: You may exhaust this leader. If you do, give a friendly unit +1/+0 for this phase.
- Deployed: Each other friendly unit that has 1 or more keywords gets +1/+0.
- Rules: A unit still has its keywords even if they don’t have any effect, as long as another ability has not made it lose those keywords Boba’s ability triggers if the played unit has a keyword upon entering play, so a unit with an active conditional keyword still triggers his ability.
- Status: Unreviewed

### 009 - Hunter - Outcast Sergeant

- Internal name: `hunter#outcast-sergeant`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Reveal a resource you control. If it shares a name with a friendly unique unit, return the resource to its owner's hand and put the top card of your deck into play as a resource.
- Deployed: Overwhelm On Attack: You may reveal a resource you control. If it shares a name with a friendly unique unit, return the resource to its owner’s hand and put the top card of your deck into play as a resource.
- Rules: Abilities that refer to a card’s “name” do not include the subtitle of the card. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”. (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 010 - Bossk - Hunting His Prey

- Internal name: `bossk#hunting-his-prey`
- Type: Leader
- Text: Action [Exhaust]: Deal 1 damage to a unit with a Bounty. You may give it +1/+0 for this phase.
- Deployed: When you collect a bounty: You may collect that bounty again. Use this ability only once each round.
- Status: Unreviewed

### 011 - Kylo Ren - Rash and Deadly

- Internal name: `kylo-ren#rash-and-deadly`
- Type: Leader
- Text: Action [Exhaust, discard a card from your hand]: Give a unit +2/+0 for this phase.
- Deployed: This unit gets –1/–0 for each card in your hand.
- Status: Unreviewed

### 012 - Bo-Katan Kryze - Princess in Exile

- Internal name: `bokatan-kryze#princess-in-exile`
- Type: Leader
- Text: Action [Exhaust]: If you attacked with a Mandalorian unit this phase, deal 1 damage to a unit.
- Deployed: On Attack: You may deal 1 damage to a unit. If you attacked with another Mandalorian unit this phase, you may deal 1 damage to a unit. (The same unit or a different unit.)
- Rules: Bo-Katan’s leader ability still can be used as an action even if you didn’t attack with a Mandalorian unit this phase (but it doesn’t deal damage). Bo-Katan’s “On Attack” ability deals 2 instances of damage. If both instances of instances of damage are dealt to a unit with a Shield token, the Shield will only prevent the first damage. (ERRATA) On Attack: You may deal 1 damage to a unit. Then, if you attacked with another Mandalorian unit this phase, you may deal 1 damage to a unit. (The same unit or a different unit.)
- Status: Unreviewed

### 013 - Han Solo - Worth the Risk

- Internal name: `han-solo#worth-the-risk`
- Type: Leader
- Text: Action [Exhaust]: Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it.
- Deployed: Action: Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it.
- Rules: The ability on Han’s unit side cannot be used as an action if you choose not to play a unit, as it would not change the game state. When using Han’s ability to play a unit, 2 damage is dealt to the played unit before resolving any “When Played” abilities.
- Status: Unreviewed

### 014 - Cad Bane - He Who Needs No Introduction

- Internal name: `cad-bane#he-who-needs-no-introduction`
- Type: Leader
- Text: When you play an Underworld card: You may exhaust this leader. If you do, an opponent chooses a unit they control. Deal 1 damage to it.
- Deployed: Raid 2 (This unit gets +2/+0 while attacking.) When you play an Underworld card: You may choose an opponent. They choose a unit they control. Deal 2 damage to it. Use this ability only once each round.
- Rules: If there are multiple opponents, Can Bane’s controller chooses which one will be “an opponent.”
- Status: Unreviewed

### 015 - Doctor Aphra - Rapacious Archaeologist

- Internal name: `doctor-aphra#rapacious-archaeologist`
- Type: Leader
- Text: When the regroup phase starts: Discard a card from your deck.
- Deployed: While there are 5 or more different costs among cards in your discard pile, this unit gets +3/+0. When Deployed: Choose 3 cards in your discard pile with different names. If you do, return 1 of them at random to your hand.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that refer to a card’s “name” do not include the subtitle of the card. Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 016 - Fennec Shand - Honoring the Deal

- Internal name: `fennec-shand#honoring-the-deal`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Play a unit that costs 4 or less from your hand (paying its cost). Give it Ambush for this phase. (After you play the unit, it may ready and attack an enemy unit.)
- Deployed: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender’s Shields.) Action: Play a unit that costs 4 or less from your hand (paying its cost). Give it Ambush for this phase.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. The ability on Fennec’s unit side cannot be used as an action if you choose not to play a unit, as it would not change the game state.
- Status: Unreviewed

### 017 - Lando Calrissian - With Impeccable Taste

- Internal name: `lando-calrissian#with-impeccable-taste`
- Type: Leader
- Text: Action [Exhaust]: Play a card using Smuggle. It costs 2 resources less. Defeat a resource you own and control.
- Deployed: Action: Play a card using Smuggle. It costs 2 resources less. Defeat a resource you own and control. Use this ability only once each round.
- Rules: When using Lando’s ability to Smuggle a card, a resource is defeated after replacing the Smuggled card but before resolving any “When Played” abilities.
- Status: Unreviewed

### 018 - The Mandalorian - Sworn To The Creed

- Internal name: `the-mandalorian#sworn-to-the-creed`
- Type: Leader
- Text: When you play an upgrade: You may exhaust this leader. If you do, exhaust an enemy unit with 4 or less remaining HP.
- Deployed: When you play an upgrade: You may exhaust an enemy unit with 6 or less remaining HP.
- Status: Unreviewed

### 019 - Remnant Science Facility

- Internal name: `remnant-science-facility`
- Type: Base
- Text: (none)
- Status: Finished

### 020 - Remote Village

- Internal name: `remote-village`
- Type: Base
- Text: (none)
- Status: Finished

### 021 - Maz Kanata's Castle

- Internal name: `maz-kanatas-castle`
- Type: Base
- Text: (none)
- Status: Finished

### 022 - Nevarro City

- Internal name: `nevarro-city`
- Type: Base
- Text: (none)
- Status: Finished

### 023 - Death Watch Hideout

- Internal name: `death-watch-hideout`
- Type: Base
- Text: (none)
- Status: Finished

### 024 - Spice Mines

- Internal name: `spice-mines`
- Type: Base
- Text: (none)
- Status: Finished

### 025 - Coronet City

- Internal name: `coronet-city`
- Type: Base
- Text: (none)
- Status: Finished

### 026 - Jabba's Palace

- Internal name: `jabbas-palace`
- Type: Base
- Text: (none)
- Status: Finished

### 027 - Hylobon Enforcer

- Internal name: `hylobon-enforcer`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.) Bounty — Draw a card. (When this unit is defeated or captured, your opponent collects its bounty.)
- Status: Unreviewed

### 028 - Doctor Pershing - Experimenting With Life

- Internal name: `doctor-pershing#experimenting-with-life`
- Type: Unit
- Text: Action [Exhaust, deal 1 damage to a friendly unit]: Draw a card.
- Rules: Doctor Pershing can damage himself in order to draw a card, even if he is defeated by that damage.
- Status: Unreviewed

### 029 - Pyke Sentinel

- Internal name: `pyke-sentinel`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 031 - The Client - Dictated by Discretion

- Internal name: `the-client#dictated-by-discretion`
- Type: Unit
- Text: Shielded Action [Exhaust]: Choose a unit. For this phase, it gains: “Bounty — Heal 5 damage from a base.” (When that unit is defeated or captured, its opponent collects its bounty.)
- Status: Unreviewed

### 032 - Lom Pyke - Dealer in Truths

- Internal name: `lom-pyke#dealer-in-truths`
- Type: Unit
- Text: On Attack: You may give a Shield token to an enemy unit. If you do, give a Shield token to a friendly unit. Smuggle [5 resources Vigilance Villainy]
- Status: Unreviewed

### 033 - Synara San - Loyal to Kragan

- Internal name: `synara-san#loyal-to-kragan`
- Type: Unit
- Text: Grit While this unit is exhausted, she gains, “Bounty — Deal 5 damage to a base.” (When this unit is defeated or captured, your opponent collects its bounty.)
- Status: Unreviewed

### 034 - Supercommando Squad

- Internal name: `supercommando-squad`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.) While this unit is upgraded, it gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 035 - Clan Saxon Gauntlet

- Internal name: `clan-saxon-gauntlet`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) When this unit is attacked: You may give an Experience token to a unit (before damage is dealt).
- Rules: When this unit is attacked” triggers at the same time as “On Attack” abilities. On Defense abilities trigger when this unit is chosen as the defender for an attack, in the same window as the attacker's On Attack abilities. / updated templating
- Status: Unreviewed

### 036 - First Light - Headquarters of the Crimson Dawn

- Internal name: `first-light#headquarters-of-the-crimson-dawn`
- Type: Unit
- Text: Grit Each other friendly non-leader unit gains Grit. Smuggle [7 resources Vigilance Villainy, deal 4 damage to a friendly unit]
- Rules: First Light’s cannot damage itself to pay for its own Smuggle ability, since the ability’s cost must be paid before it enters play.
- Status: Unreviewed

### 037 - Supreme Leader Snoke - Shadow Ruler

- Internal name: `supreme-leader-snoke#shadow-ruler`
- Type: Unit
- Text: Each enemy non-leader unit gets –2/–2.
- Status: Unreviewed

### 038 - Brutal Traditions

- Internal name: `brutal-traditions`
- Type: Upgrade
- Text: Action: If an enemy unit was defeated this phase, play this upgrade from your discard pile (paying its cost).
- Rules: Brutal Traditions’ ability cannot be used as an action if no enemy unit left play this phase, as it would not change the game state. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 039 - Calculated Lethality

- Internal name: `calculated-lethality`
- Type: Event
- Text: Defeat a non-leader unit that costs 3 or less. For each upgrade that was on that unit, give an Experience token to a friendly unit.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Each Experience token can be given to any friendly unit.
- Status: Unreviewed

### 040 - Clan Wren Rescuer

- Internal name: `clan-wren-rescuer`
- Type: Unit
- Text: When Played: Give an Experience token to a unit.
- Status: Unreviewed

### 041 - Kuiil - I Have Spoken

- Internal name: `kuiil#i-have-spoken`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.) On Attack: Discard a card from your deck. If it shares an aspect with your base, return it to your hand.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 042 - Concord Dawn Interceptors

- Internal name: `concord-dawn-interceptors`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) This unit gets +2/+0 while defending.
- Status: Unreviewed

### 043 - Village Protectors

- Internal name: `village-protectors`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 044 - Razor Crest - Reliable Gunship

- Internal name: `razor-crest#reliable-gunship`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.) When Played: You may return an upgrade from your discard pile to your hand.
- Status: Unreviewed

### 045 - Rose Tico - Dedicated to the Cause

- Internal name: `rose-tico#dedicated-to-the-cause`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to her.) On Attack: You may defeat a Shield token on a friendly unit. If you do, give 2 Experience tokens to that unit.
- Status: Unreviewed

### 046 - Rey - Keeping the Past

- Internal name: `rey#keeping-the-past`
- Type: Unit
- Text: While playing this unit, ignore her Heroism aspect penalty if you control Kylo Ren. On Attack: You may heal 2 damage from a unit. If it's a non-Heroism unit, give a Shield token to it.
- Rules: You do not have to heal damage in order to give the Shield token.
- Status: Unreviewed

### 047 - The Armorer - Survival Is Strength

- Internal name: `the-armorer#survival-is-strength`
- Type: Unit
- Text: When Played: Give a Shield token to each of up to 3 Mandalorian units.
- Status: Unreviewed

### 048 - Gentle Giant

- Internal name: `gentle-giant`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.) On Attack: You may heal damage from another unit equal to the damage on this unit.
- Rules: If the chosen unit has less damage on it than Gentle Giant, heal all damage on it.
- Status: Unreviewed

### 049 - The Mandalorian - Wherever I Go, He Goes

- Internal name: `the-mandalorian#wherever-i-go-he-goes`
- Type: Unit
- Text: Sentinel When Played: You may heal all damage from a unit that costs 2 or less and give 2 Shield tokens to it.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 050 - Chewbacca - Pykesbane

- Internal name: `chewbacca#pykesbane`
- Type: Unit
- Text: Grit When Played: You may defeat a unit with 5 or less remaining HP. Smuggle [9 resources Aggression Heroism]
- Status: Unreviewed

### 051 - Mystic Reflection

- Internal name: `mystic-reflection`
- Type: Event
- Text: Give an enemy unit –2/–0 for this phase. If you control a Force unit, give the enemy unit –2/–2 for this phase instead.
- Status: Unreviewed

### 052 - Sugi - Hired Guardian

- Internal name: `sugi#hired-guardian`
- Type: Unit
- Text: While an enemy unit is upgraded, this unit gains Sentinel. Smuggle [6 resources Vigilance] (If this card is a resource, you may play her for her smuggle cost. Replace her with the top card of your deck.)
- Status: Unreviewed

### 053 - Second Chance

- Internal name: `second-chance`
- Type: Upgrade
- Text: Attach to a non-leader unit. Attached unit gains: “When Defeated: For this phase, this unit's owner may play it from their discard pile for free.”
- Rules: “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs. If the attached unit is played from the discard pile, it enters play as a new copy of that unit. If it is defeated again in the same phase, it cannot be replayed from the discard pile as the new copy does not have Second Chance’s ability.
- Status: Unreviewed

### 054 - Midnight Repairs

- Internal name: `midnight-repairs`
- Type: Event
- Text: Heal up to 8 total damage from any number of units.
- Status: Unreviewed

### 055 - Moisture Farmer

- Internal name: `moisture-farmer`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 056 - Follower of The Way

- Internal name: `follower-of-the-way`
- Type: Unit
- Text: While this unit is upgraded, it gets +1/+1.
- Status: Unreviewed

### 058 - Val - Loyal to the End

- Internal name: `val#loyal-to-the-end`
- Type: Unit
- Text: Bounty — Deal 3 damage to a unit. When Defeated: Give 2 Experience tokens to a friendly unit. (The active player chooses the order of Val's abilities.)
- Status: Unreviewed

### 059 - Embo - Stoic and Resolute

- Internal name: `embo#stoic-and-resolute`
- Type: Unit
- Text: When this unit completes an attack: If the defender was defeated, heal up to 2 damage from a unit.
- Rules: A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 060 - HWK-290 Freighter

- Internal name: `hwk290-freighter`
- Type: Unit
- Text: (none)
- Status: Finished

### 061 - Wroshyr Tree Tender

- Internal name: `wroshyr-tree-tender`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 062 - Niima Outpost Constables

- Internal name: `niima-outpost-constables`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 063 - System Patrol Craft

- Internal name: `system-patrol-craft`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 064 - Survivors' Gauntlet

- Internal name: `survivors-gauntlet`
- Type: Unit
- Text: When Played/On Attack: You may attach an upgrade on a unit to another eligible unit controlled by the same player.
- Status: Unreviewed

### 065 - Vigilant Pursuit Craft

- Internal name: `vigilant-pursuit-craft`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) Smuggle [7 resources, vigilance] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 066 - Cargo Juggernaut

- Internal name: `cargo-juggernaut`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.) When Played: If you control another [Vigilance] unit, heal 4 damage from your base.
- Status: Unreviewed

### 067 - Fenn Rau - Protector of Concord Dawn

- Internal name: `fenn-rau#protector-of-concord-dawn`
- Type: Unit
- Text: When Played: You may play an upgrade from your hand. It costs 2 resources less. When you play an upgrade on this unit: Give an enemy unit –2/–2 for this phase.
- Status: Unreviewed

### 068 - Public Enemy

- Internal name: `public-enemy`
- Type: Upgrade
- Text: Attached unit gains: “Bounty — Give a Shield token to a unit.” (When this unit is defeated or captured, its opponent collects its bounty.)
- Status: Unreviewed

### 069 - Foundling

- Internal name: `foundling`
- Type: Upgrade
- Text: Attached unit gains the Mandalorian trait.
- Status: Unreviewed

### 070 - Resilient

- Internal name: `resilient`
- Type: Upgrade
- Text: (none)
- Status: Finished

### 071 - Top Target

- Internal name: `top-target`
- Type: Upgrade
- Text: Attached unit gains: “Bounty — Heal 4 damage from a unit or base. If this unit is unique, heal 6 damage instead.” (When this unit is defeated or captured, its opponent collects its bounty.)
- Rules: (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 072 - Imprisoned

- Internal name: `imprisoned`
- Type: Upgrade
- Text: Attach to a non-leader unit. Attached unit loses its current abilities and can't gain abilities.
- Rules: Other upgrades attached to the unit still provide their power and HP modifiers but cannot give the attached unit abilities. (ERRATA) Templating update: “Lose all abilities and can't gain abilities” becomes “lose all abilities”.
- Status: Unreviewed

### 073 - Mandalorian Armor

- Internal name: `mandalorian-armor`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. When Played: If attached unit is a Mandalorian, give a Shield token to it.
- Status: Unreviewed

### 074 - Vambrace Grappleshot

- Internal name: `vambrace-grappleshot`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains: “On Attack: Exhaust the defender.”
- Rules: (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 075 - Covert Strength

- Internal name: `covert-strength`
- Type: Event
- Text: Heal 2 damage from a unit and give an Experience token to it. Smuggle [3 resources Vigilance] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 076 - Unexpected Escape

- Internal name: `unexpected-escape`
- Type: Event
- Text: Exhaust a unit. You may rescue a captured card guarded by that unit.
- Status: Unreviewed

### 077 - Evidence of the Crime

- Internal name: `evidence-of-the-crime`
- Type: Event
- Text: Take control of an upgrade that costs 3 or less and attach it to an eligible unit of your choice.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 078 - Fell the Dragon

- Internal name: `fell-the-dragon`
- Type: Event
- Text: Defeat a non-leader unit with 5 or more power.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 079 - Rival's Fall

- Internal name: `rivals-fall`
- Type: Event
- Text: Defeat a unit.
- Status: Unreviewed

### 080 - Salacious Crumb - Obnoxious Pet

- Internal name: `salacious-crumb#obnoxious-pet`
- Type: Unit
- Text: When Played: Heal 1 damage from your base. Action [Exhaust, return this unit to his owner's hand]: Deal 1 damage to a ground unit.
- Status: Unreviewed

### 081 - General Tagge - Concerned Commander

- Internal name: `general-tagge#concerned-commander`
- Type: Unit
- Text: When Played: Give an Experience token to each of up to 3 TROOPER units.
- Status: Unreviewed

### 082 - Outland TIE Vanguard

- Internal name: `outland-tie-vanguard`
- Type: Unit
- Text: When Played: You may give an Experience token to another unit that costs 3 or less.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 083 - Seasoned Shoretrooper

- Internal name: `seasoned-shoretrooper`
- Type: Unit
- Text: While you control 6 or more resources, this unit gets +2/+0.
- Status: Unreviewed

### 084 - Phase-III Dark Trooper

- Internal name: `phaseiii-dark-trooper`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) When combat damage is dealt to this unit: Give an Experience token to this unit (if it survives the damage).
- Rules: Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 085 - Superlaser Technician

- Internal name: `superlaser-technician`
- Type: Unit
- Text: When Defeated: You may put this unit into play as a resource and ready it.
- Rules: (ERRATA) Templating update: “Put into play as a resource” becomes “resource”.
- Status: Unreviewed

### 086 - Warbird Stowaway

- Internal name: `warbird-stowaway`
- Type: Unit
- Text: While you have the initiative, this unit gets +2/+0. Smuggle [4 resources Command Villainy] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 087 - Crosshair - Following Orders

- Internal name: `crosshair#following-orders`
- Type: Unit
- Text: Action [2 resources]: This unit gets +1/+0 for this phase. Action [Exhaust]: This unit deals damage equal to his power to an enemy ground unit.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 088 - Ephant Mon - Head of Security

- Internal name: `ephant-mon#head-of-security`
- Type: Unit
- Text: On Attack: Choose an enemy non-leader unit that attacked your base this phase. A friendly unit in the same arena captures that unit. (Put the captured card facedown under the friendly unit until the friendly unit leaves play.)
- Rules: Ephant Mon can capture a unit with his own ability.
- Status: Unreviewed

### 089 - Pirate Battle Tank

- Internal name: `pirate-battle-tank`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) Smuggle [7 resources Command Villainy] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 090 - Maul - Shadow Collective Visionary

- Internal name: `maul#shadow-collective-visionary`
- Type: Unit
- Text: Ambush Overwhelm On Attack: You may choose another friendly Underworld unit. If you do, all combat damage that would be dealt to this unit during this attack is dealt to the chosen unit instead.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 091 - Jabba's Rancor - Pateesa

- Internal name: `jabbas-rancor#pateesa`
- Type: Unit
- Text: If you control Jabba the Hutt (as a leader or unit), this unit costs 1 resource less to play. When Played/On Attack: Deal 3 damage to another friendly ground unit and 3 damage to an enemy ground unit.
- Status: Unreviewed

### 092 - Finalizer - Might of the First Order

- Internal name: `finalizer#might-of-the-first-order`
- Type: Unit
- Text: Overwhelm When Played: Choose any number of friendly units. Each of those units captures an enemy non-leader unit in the same arena.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. If you choose more friendly units than there are enemy units, the extra chosen units do nothing.
- Status: Unreviewed

### 093 - Remnant Reserves

- Internal name: `remnant-reserves`
- Type: Event
- Text: Search the top 5 cards of your deck for up to 3 units, reveal them, and draw them. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 094 - Palpatine's Return

- Internal name: `palpatines-return`
- Type: Event
- Text: Play a unit from your discard pile. It costs 6 resources less. If it's a Force unit, it costs 8 resources less instead.
- Status: Unreviewed

### 095 - Clone Deserter

- Internal name: `clone-deserter`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.) Bounty — Draw a card. (When this unit is defeated or captured, your opponent collects its bounty.)
- Status: Unreviewed

### 096 - Maz Kanata - Pirate Queen

- Internal name: `maz-kanata#pirate-queen`
- Type: Unit
- Text: When you play another unit: Give an Experience token to this unit.
- Status: Unreviewed

### 097 - Freetown Backup

- Internal name: `freetown-backup`
- Type: Unit
- Text: On Attack: Give another friendly unit +2/+2 for this phase. Smuggle [4 resources Command Heroism] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 098 - Sundari Peacekeeper

- Internal name: `sundari-peacekeeper`
- Type: Unit
- Text: Raid 2 (This unit gets +2/+0 while attacking.) Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 099 - Echo - Restored

- Internal name: `echo#restored`
- Type: Unit
- Text: Restore 2 When Played: You may discard a card from your hand. Give 2 Experience tokens to a unit in play with the same name as the discarded card.
- Rules: Abilities that refer to a card’s “name” do not include the subtitle of the card.
- Status: Unreviewed

### 100 - Modded Cohort

- Internal name: `modded-cohort`
- Type: Unit
- Text: Ambush (When you play this unit, it may ready and attack an enemy unit.) Raid 2 (This unit gets +2/+0 while attacking.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 101 - Adelphi Patrol Wing

- Internal name: `adelphi-patrol-wing`
- Type: Unit
- Text: When Played: You may attack with a unit. If you have the initiative, it gets +2/+0 for this attack.
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 102 - The Marauder - Shuttling the Bad Batch

- Internal name: `the-marauder#shuttling-the-bad-batch`
- Type: Unit
- Text: Ambush When Played: Choose a card in your discard pile. Put it into play as a resource if it shares a name with a unit you control.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. Abilities that refer to a card’s “name” do not include the subtitle of the card. A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”.
- Status: Unreviewed

### 103 - General Rieekan - Defensive Strategist

- Internal name: `general-rieekan#defensive-strategist`
- Type: Unit
- Text: When Played/On Attack: Choose a friendly unit. If it has Sentinel, give an Experience token to it. Otherwise, it gains Sentinel for this phase.
- Status: Unreviewed

### 104 - Inspiring Mentor

- Internal name: `inspiring-mentor`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains, “On Attack/When Defeated: Give an Experience token to another friendly unit.”
- Status: Unreviewed

### 105 - Spark of Hope

- Internal name: `spark-of-hope`
- Type: Event
- Text: Choose a unit in your discard pile. If it was defeated this phase, put it into play as a resource.
- Rules: The chosen unit must have been defeated as a unit this phase in order to put it into play as a resource. Spark of Hope cannot return a unit that was defeated as a resource or discarded in some other way. A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”.
- Status: Unreviewed

### 106 - Rule with Respect

- Internal name: `rule-with-respect`
- Type: Event
- Text: A friendly unit captures each enemy non-leader unit that attacked your base this phase.
- Status: Unreviewed

### 107 - Enterprising Lackeys

- Internal name: `enterprising-lackeys`
- Type: Unit
- Text: When Defeated: You may defeat a friendly resource. If you do, put this unit into play as a resource. Smuggle [6 resources Command Command]
- Rules: A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”.
- Status: Unreviewed

### 108 - Enforced Loyalty

- Internal name: `enforced-loyalty`
- Type: Event
- Text: Defeat a friendly unit. If you do, draw 2 cards.
- Status: Unreviewed

### 109 - Endless Legions

- Internal name: `endless-legions`
- Type: Event
- Text: Reveal any number of resources you control. Play each unit revealed this way for free (one at a time).
- Rules: If playing multiple units, resolve all abilities triggered while playing each unit before playing the next unit. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 110 - Warzone Lieutenant

- Internal name: `warzone-lieutenant`
- Type: Unit
- Text: (none)
- Status: Finished

### 111 - Collections Starhopper

- Internal name: `collections-starhopper`
- Type: Unit
- Text: Smuggle [3 resources Command] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 112 - Gamorrean Retainer

- Internal name: `gamorrean-retainer`
- Type: Unit
- Text: While you control another Command unit, this unit gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 113 - Privateer Crew

- Internal name: `privateer-crew`
- Type: Unit
- Text: Smuggle [6 resources, command] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.) When played using Smuggle: Give 3 Experience tokens to this unit.
- Status: Unreviewed

### 114 - Scanning Officer

- Internal name: `scanning-officer`
- Type: Unit
- Text: When Played: Reveal 3 enemy resources. Defeat each resource with the Smuggle keyword revealed this way. For each resource defeated this way, its controller puts the top card of their deck into play as a resource.
- Rules: New resources enter play exhausted, regardless of whether the defeated resource was ready. Scanning Officer defeats any cards with Smuggle, including resources that have gained Smuggle due to another card’s effect. A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”.
- Status: Unreviewed

### 115 - Cobb Vanth - The Marshal

- Internal name: `cobb-vanth#the-marshal`
- Type: Unit
- Text: When Defeated: Search the top 10 cards of your deck for a unit that costs 2 or less and discard it. For this phase, you may play that card from your discard pile for free.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. After searching, put any cards not chosen on the bottom of your deck in a random order. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs. When a unit is played through Cobb’s ability, it enters play as a new copy of that unit. If it is defeated that same phase, it cannot be replayed again from the discard pile, as the new copy is not considered the same copy as the card discarded through Cobb’s ability. Because Cobb Vanth's ability lets you "play that card" from your discard pile, you can play a Pilot unit as a unit or an upgrade.
- Status: Unreviewed

### 116 - Outlaw Corona

- Internal name: `outlaw-corona`
- Type: Unit
- Text: Bounty — Put the top card of your deck into play as a resource. (When this unit is defeated or captured, your opponent collects its bounty.)
- Rules: A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”.
- Status: Unreviewed

### 117 - Reputable Hunter

- Internal name: `reputable-hunter`
- Type: Unit
- Text: If an enemy unit has a Bounty, this unit costs 1 resource less to play.
- Status: Unreviewed

### 118 - Kihraxz Heavy Fighter

- Internal name: `kihraxz-heavy-fighter`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) On Attack: You may exhaust another friendly unit. If you do, this unit gets +3/+0 for this attack.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 119 - Weequay Pirate Gang

- Internal name: `weequay-pirate-gang`
- Type: Unit
- Text: Ambush (When you play this unit, it may ready and attack an enemy unit.) Smuggle [5 resources Command] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 120 - Discerning Veteran

- Internal name: `discerning-veteran`
- Type: Unit
- Text: When Played: This unit captures an enemy non-leader ground unit. (Put the captured card facedown under this unit until this unit leaves play.)
- Status: Unreviewed

### 121 - Mercenary Company

- Internal name: `mercenary-company`
- Type: Unit
- Text: Ambush (After you play this unit, it may ready and attack an enemy unit.) Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 122 - Arquitens Assault Cruiser

- Internal name: `arquitens-assault-cruiser`
- Type: Unit
- Text: Ambush When this unit attacks and defeats a non-leader unit: Put the defeated unit into play as a resource under your control.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. A unit “attacks and defeats a unit” if it defeats the defender at any point during the attack. A card put into play as a resource enters play exhausted. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve. (ERRATA) Templating update: “Defender” becomes “defending unit”. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”.
- Status: Unreviewed

### 123 - Bounty Hunter's Quarry

- Internal name: `bounty-hunters-quarry`
- Type: Upgrade
- Text: Attached unit gains: “Bounty — Search the top 5 cards of your deck, or 10 cards instead if this unit is unique, for a unit that costs 3 or less and play it for free.” (Put the other cards on the bottom of your deck in a random order.)
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. After searching, put any cards not chosen on the bottom of your deck in a random order. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs. If you choose a Pilot unit with your search, you may only play it as a unit. (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 124 - Legal Authority

- Internal name: `legal-authority`
- Type: Upgrade
- Text: Attach to a friendly unit. When Played: Attached unit captures an enemy non-leader unit with less power than it. (Put the captured card facedown under attached unit until attached unit leaves play.)
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 125 - Price on Your Head

- Internal name: `price-on-your-head`
- Type: Upgrade
- Text: Attached unit gains: “Bounty — Put the top card of your deck into play as a resource.” (When this unit is defeated or captured, its opponent collects its bounty.)
- Rules: A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”.
- Status: Unreviewed

### 126 - The Darksaber

- Internal name: `the-darksaber`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. While playing this upgrade on a Mandalorian unit, ignore its aspect penalty. Attached unit gains, “On Attack: Give an Experience token to each other friendly Mandalorian unit.”
- Status: Unreviewed

### 127 - Commission

- Internal name: `commission`
- Type: Event
- Text: Search the top 10 cards of your deck for a Bounty Hunter, Item, or Transport card, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.) Smuggle [3 resources Command]
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 129 - Timely Intervention

- Internal name: `timely-intervention`
- Type: Event
- Text: Play a unit from your hand. Give it Ambush for this phase. (When you play it, it may ready and attack an enemy unit.) Smuggle [2 resources, command] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does boba not ready.
- Status: Unreviewed

### 130 - Moment of Glory

- Internal name: `moment-of-glory`
- Type: Event
- Text: Give a unit +4/+4 for this phase.
- Status: Unreviewed

### 132 - Choose Sides

- Internal name: `choose-sides`
- Type: Event
- Text: Choose a friendly non-leader unit and an enemy non-leader unit. Exchange control of those units.
- Status: Unreviewed

### 133 - Dengar - The Demolisher

- Internal name: `dengar#the-demolisher`
- Type: Unit
- Text: When you play an upgrade on a unit: You may deal 1 damage to that unit.
- Status: Unreviewed

### 134 - Guavian Antagonizer

- Internal name: `guavian-antagonizer`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) Bounty — Draw a card. (When this unit is defeated or captured, your opponent collects its bounty.)
- Status: Unreviewed

### 135 - Kylo's TIE Silencer - Ruthlessly Efficient

- Internal name: `kylos-tie-silencer#ruthlessly-efficient`
- Type: Unit
- Text: Action: If this unit was discarded from your hand or deck this phase, play it from your discard pile (paying its cost).
- Rules: Kylo’s TIE Silencer’s ability cannot be used as an action if it wasn’t discarded from your hand or deck this phase, or if you can’t pay its cost, as that would not change the game state. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 136 - Death Watch Loyalist

- Internal name: `death-watch-loyalist`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.) Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 137 - Punishing One - Dengar's Jumpmaster

- Internal name: `punishing-one#dengars-jumpmaster`
- Type: Unit
- Text: When an upgraded enemy unit is defeated: You may ready this unit. Use this ability only once each round.
- Status: Unreviewed

### 138 - Jango Fett - Renowned Bounty Hunter

- Internal name: `jango-fett#renowned-bounty-hunter`
- Type: Unit
- Text: While attacking a unit with a Bounty, this unit gets +3/+0 and gains Overwhelm. When this unit attacks and defeats a unit: Draw a card.
- Rules: A unit “attacks and defeats a unit” if it defeats the defender at any point during the attack. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 139 - Krrsantan - Muscle for Hire

- Internal name: `krrsantan#muscle-for-hire`
- Type: Unit
- Text: When Played: If an enemy unit has a Bounty, you may ready this unit. On Attack: Choose a ground unit. You may deal 1 damage to it for each damage on this unit.
- Status: Unreviewed

### 140 - Trandoshan Hunters

- Internal name: `trandoshan-hunters`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) When Played: If an enemy unit has a Bounty, give an Experience token to this unit.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 141 - Kylo Ren - Killing the Past

- Internal name: `kylo-ren#killing-the-past`
- Type: Unit
- Text: While playing this unit, ignore his Villainy aspect penalty if you control Rey. On Attack: Give a unit +2/+0 for this phase. If it's a non-Villainy unit, also give an Experience token to it.
- Status: Unreviewed

### 142 - Pre Vizsla - Power Hungry

- Internal name: `pre-vizsla#power-hungry`
- Type: Unit
- Text: When Played/On Attack: You may pay the cost of an upgrade attached to another non-Vehicle unit. If you do, take control of that upgrade and attach it to this unit, if able. If it can't attach to this unit, defeat it instead.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Token upgrades are considered upgrades. Pre’s ability can be used to pay 0 and choose a token upgrade.
- Status: Unreviewed

### 143 - Ruthlessness

- Internal name: `ruthlessness`
- Type: Upgrade
- Text: Attached unit gains: “When this unit attacks and defeats a unit: Deal 2 damage to the defending player's base.”
- Rules: A unit “attacks and defeats a unit” if it defeats the defender at any point during the attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 144 - Give In to Your Anger

- Internal name: `give-in-to-your-anger`
- Type: Event
- Text: Deal 1 damage to an enemy unit. Its controller's next action this phase must be an attack action with that unit, if able. It must attack a unit, if able.
- Rules: Units must be ready in order to attack. Your opponent can’t play a card from hand or activate an ability to attack with that unit, they must take the “Attack With a Unit” action. Abilities that affect what a unit can attack, including abilities that prevent a unit from being attacked, still apply to the Give In to Your Anger attack. If the chosen unit can’t attack a unit, it must attack a base. If the chosen unit can’t legally attack, your opponent may take a different action.
- Status: Unreviewed

### 145 - Headhunting

- Internal name: `headhunting`
- Type: Event
- Text: Attack with up to 3 units (one at a time). They can't attack bases for these attacks. Each Bounty Hunter that attacks this way gets +2/+0 for its attack.
- Rules: Units must be ready in order to attack. Units that can’t attack bases can still damage bases through other abilities, like Overwhelm.
- Status: Unreviewed

### 146 - Heroic Renegade

- Internal name: `heroic-renegade`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 147 - Ketsu Onyo - Old Friend

- Internal name: `ketsu-onyo#old-friend`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) When this unit deals combat damage to a base: You may defeat an upgrade that costs 2 or less.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 148 - Cassian Andor - Rebellions Are Built On Hope

- Internal name: `cassian-andor#rebellions-are-built-on-hope`
- Type: Unit
- Text: Smuggle [5 resources Aggression Heroism] (If this card is a resource, you may play him for his smuggle cost. Replace it with the top card of your deck.) When played using Smuggle: Ready this unit.
- Status: Unreviewed

### 149 - Nite Owl Skirmisher

- Internal name: `nite-owl-skirmisher`
- Type: Unit
- Text: Smuggle [5 resources Aggression Heroism] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 150 - Koska Reeves - Loyal Nite Owl

- Internal name: `koska-reeves#loyal-nite-owl`
- Type: Unit
- Text: On Attack: If this unit is upgraded, you may deal 2 damage to a ground unit.
- Status: Unreviewed

### 151 - Valiant Assault Ship

- Internal name: `valiant-assault-ship`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) On Attack: If the defending player controls more resources than you, this unit gets +2/+0 for this attack.
- Status: Unreviewed

### 152 - Desperado Freighter

- Internal name: `desperado-freighter`
- Type: Unit
- Text: (none)
- Status: Finished

### 153 - Poe Dameron - Quick to Improvise

- Internal name: `poe-dameron#quick-to-improvise`
- Type: Unit
- Text: On Attack: Discard up to 3 cards from your hand. For each card discarded this way, choose a different option: <bullet>Deal 2 damage to a unit or base. Defeat an upgrade. An opponent discards a card from their hand.</bullet>
- Status: Unreviewed

### 154 - Wrecker - Boom!

- Internal name: `wrecker#boom`
- Type: Unit
- Text: Overwhelm When Played: You may defeat a friendly resource. If you do, deal 5 damage to a ground unit.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 155 - Heroic Resolve

- Internal name: `heroic-resolve`
- Type: Upgrade
- Text: Attached unit gains: “Action [2 resources, defeat a Heroic Resolve on this unit]: Attack with this unit. It gets +4/+0 and gains Overwhelm for this attack.”
- Rules: If you use Heroic Resolve’s ability, you must attack with the unit, if able. Units must be ready in order to attack. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 156 - Cripple Authority

- Internal name: `cripple-authority`
- Type: Event
- Text: Draw a card. Each opponent who controls more resources than you discards a card from their hand.
- Status: Unreviewed

### 157 - Bo-Katan Kryze - Fighting For Mandalore

- Internal name: `bokatan-kryze#fighting-for-mandalore`
- Type: Unit
- Text: When Defeated: For each player with 15 or more damage on their base, draw a card.
- Status: Unreviewed

### 158 - Wild Rancor

- Internal name: `wild-rancor`
- Type: Unit
- Text: Overwhelm When Played: Deal 2 damage to each other ground unit.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 159 - The Chaos of War

- Internal name: `the-chaos-of-war`
- Type: Event
- Text: Deal damage to each player's base equal to the number of cards in that player's hand.
- Status: Unreviewed

### 160 - Reckless Gunslinger

- Internal name: `reckless-gunslinger`
- Type: Unit
- Text: When Played: Deal 1 damage to each base. Smuggle [3 resources Aggression] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 161 - Stolen Landspeeder

- Internal name: `stolen-landspeeder`
- Type: Unit
- Text: When Played: If you played this unit from your hand, an opponent takes control of it. Bounty — If you own this unit, play it from your discard pile for free and give an Experience token to it.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.” “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs. If Stolen Landspeeder is given Ambush, you may choose to resolve its attack prior to resolving its “When Played”. If you choose to resolve its “When Played” first, you may no longer attack with the unit, since you do not control it. Stolen Landspeeder’s Bounty is only triggered if you own the unit and collect its Bounty while it is controlled by an opponent.
- Status: Unreviewed

### 162 - House Kast Soldier

- Internal name: `house-kast-soldier`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 163 - Migs Mayfeld - Triggerman

- Internal name: `migs-mayfeld#triggerman`
- Type: Unit
- Text: When a player discards a card from their hand: You may deal 2 damage to a unit or base. Use this ability only once each round.
- Rules: (ERRATA) When a player discards a card from a hand: You may deal 2 damage to a unit or base. Use this ability only once each round.
- Status: Unreviewed

### 164 - Rhokai Gunship

- Internal name: `rhokai-gunship`
- Type: Unit
- Text: When Defeated: Deal 1 damage to a unit or base.
- Status: Unreviewed

### 165 - Unlicensed Headhunter

- Internal name: `unlicensed-headhunter`
- Type: Unit
- Text: Saboteur While this unit is exhausted, it gains: “Bounty — Heal 5 damage from your base.” (When this unit is defeated or captured, your opponent collects its bounty.)
- Status: Unreviewed

### 166 - Disabling Fang Fighter

- Internal name: `disabling-fang-fighter`
- Type: Unit
- Text: When Played: You may defeat an upgrade.
- Status: Unreviewed

### 167 - Wanted Insurgents

- Internal name: `wanted-insurgents`
- Type: Unit
- Text: Bounty — Deal 2 damage to a unit. (When this unit is defeated or captured, your opponent collects its bounty.)
- Status: Unreviewed

### 169 - Clan Challengers

- Internal name: `clan-challengers`
- Type: Unit
- Text: Raid 3 (This unit gets +3/+0 while attacking.) While this unit is upgraded, it gains Overwhelm. (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 170 - IG-11 - I Cannot Be Captured

- Internal name: `ig11#i-cannot-be-captured`
- Type: Unit
- Text: If this unit would be captured, defeat him and deal 3 damage to each enemy ground unit instead. On Attack: You may deal 3 damage to a damaged ground unit.
- Status: Unreviewed

### 171 - Covetous Rivals

- Internal name: `covetous-rivals`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.) When Played/On Attack: You may deal 2 damage to a unit with a Bounty.
- Status: Unreviewed

### 172 - Krayt Dragon

- Internal name: `krayt-dragon`
- Type: Unit
- Text: Overwhelm When an opponent plays a card: You may deal damage equal to that card's cost to their base or a ground unit they control.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. If Krayt Dragon is defeated by your opponent playing a card, its ability still triggers.
- Status: Unreviewed

### 173 - Guild Target

- Internal name: `guild-target`
- Type: Upgrade
- Text: Attached unit gains: “Bounty — Deal 2 damage to a base. If this unit is unique, deal 3 damage instead.” (When this unit is defeated or captured, its opponent collects its bounty.)
- Rules: (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 174 - Hotshot DL-44 Blaster

- Internal name: `hotshot-dl44-blaster`
- Type: Upgrade
- Text: Attach to a non-VEHICLE unit. Smuggle [3 resources, cunning] When played using Smuggle: Attack with attached unit.
- Rules: If you play the Blaster using Smuggle, you must attack with the attached unit, if able. Units must be ready in order to attack. You can only attack with units you control, so using Smuggle to play Hotshot DL-44 Blaster on an enemy unit does not begin an attack.
- Status: Unreviewed

### 175 - Armed to the Teeth

- Internal name: `armed-to-the-teeth`
- Type: Upgrade
- Text: Attached unit gains: “On Attack: Give another friendly unit +2/+0 for this phase.” Smuggle [4 resources Aggression] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 176 - Death Mark

- Internal name: `death-mark`
- Type: Upgrade
- Text: Attached unit gains: “Bounty — Draw 2 cards.” (When this unit is defeated or captured, its opponent collects its bounty.)
- Status: Unreviewed

### 177 - Vambrace Flamethrower

- Internal name: `vambrace-flamethrower`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains: “On Attack: You may deal 3 damage divided as you choose among enemy ground units.”
- Rules: You can choose to assign more damage to a unit than it has remaining HP. All damage dealt by a single ability is dealt simultaneously.
- Status: Unreviewed

### 179 - Desperate Attack

- Internal name: `desperate-attack`
- Type: Event
- Text: Attack with a damaged unit. It gets +2/+0 for this attack.
- Rules: You must attack with a damaged unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 180 - Detention Block Rescue

- Internal name: `detention-block-rescue`
- Type: Event
- Text: Deal 3 damage to a unit. If that unit is guarding any captured cards, deal 6 damage instead.
- Status: Unreviewed

### 181 - Pillage

- Internal name: `pillage`
- Type: Event
- Text: Choose a player. They discard 2 cards from their hand.
- Status: Unreviewed

### 182 - Bravado

- Internal name: `bravado`
- Type: Event
- Text: If you've defeated an enemy unit this phase, this event costs 2 resources less to play. Ready a unit.
- Rules: Any card you control or ability you resolve that defeats a unit is considered you defeating that unit.
- Status: Unreviewed

### 183 - Kintan Intimidator

- Internal name: `kintan-intimidator`
- Type: Unit
- Text: On Attack: Exhaust the defender.
- Status: Unreviewed

### 184 - Bazine Netal - Spy for the First Order

- Internal name: `bazine-netal#spy-for-the-first-order`
- Type: Unit
- Text: When Played: Look at an opponent's hand. You may discard 1 of those cards. If you do, that player draws a card. Smuggle [4 resources Cunning Villainy]
- Rules: (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 185 - Doctor Evazan - Wanted on Twelve Systems

- Internal name: `doctor-evazan#wanted-on-twelve-systems`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to him.) Bounty — Ready up to 12 resources. (When this unit is defeated or captured, your opponent collects his bounty.)
- Status: Unreviewed

### 186 - Hunter of the Haxion Brood

- Internal name: `hunter-of-the-haxion-brood`
- Type: Unit
- Text: While an enemy unit has a Bounty, this unit gains Shielded. (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 187 - Lurking TIE Phantom

- Internal name: `lurking-tie-phantom`
- Type: Unit
- Text: Raid 2 (This unit gets +2/+0 while attacking.) This unit can't be captured, damaged, or defeated by enemy card abilities.
- Rules: Lurking TIE Phantom can’t be defeated directly by card abilities that “defeat a unit”, but it can still be defeated as a result of card abilities, such as abilities that give a unit -X/-X for the phase. Lurking TIE Phantom can’t be damaged directly by card abilities that deal damage, regardless of how those abilities deal damage. Lurking TIE Phantom can be dealt combat damage during an attack, even if that attack occurs as part of an ability. Lurking TIE Phantom's ability is a "prevent" effect, so it still can be damaged by unpreventable damage.
- Status: Unreviewed

### 188 - 4-LOM - Bounty Hunter for Hire

- Internal name: `4lom#bounty-hunter-for-hire`
- Type: Unit
- Text: Ambush (When you play this unit, it may ready and attack an enemy unit.) Each friendly unit named Zuckuss gets +1/+1 and gains Ambush.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 189 - Slaver's Freighter

- Internal name: `slavers-freighter`
- Type: Unit
- Text: When Played: You may ready another unit with power equal to or less than the number of upgrades on enemy units.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 190 - Zuckuss - Bounty Hunter for Hire

- Internal name: `zuckuss#bounty-hunter-for-hire`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) Each friendly unit named 4-LOM gets +1/+1 and gains Saboteur.
- Status: Unreviewed

### 191 - Xanadu Blood - Cad Bane's Reward

- Internal name: `xanadu-blood#cad-banes-reward`
- Type: Unit
- Text: Raid 2 When Played/On Attack: You may return another friendly non-leader Underworld unit to its owner's hand. If you do, exhaust an enemy unit or resource.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 192 - Dryden Vos - Offering No Escape

- Internal name: `dryden-vos#offering-no-escape`
- Type: Unit
- Text: Shielded When Played: Choose a captured card guarded by a unit you control. You may play it for free under your control.
- Rules: “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 193 - Frozen in Carbonite

- Internal name: `frozen-in-carbonite`
- Type: Upgrade
- Text: Attach to a non-leader unit. Attached unit can't ready. When Played: Exhaust attached unit.
- Status: Unreviewed

### 194 - Triple Dark Raid

- Internal name: `triple-dark-raid`
- Type: Event
- Text: Search the top 7 cards of your deck for a Vehicle and play it. (Put the other cards on the bottom of your deck in a random order.) It costs 5 resources less and enters play ready. Return it to its owner's hand at the end of the phase.
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order. Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 195 - Cartel Turncoat

- Internal name: `cartel-turncoat`
- Type: Unit
- Text: Bounty — Draw a card. (When this unit is defeated or captured, your opponent collects its bounty.)
- Status: Unreviewed

### 196 - Grogu - Irresistible

- Internal name: `grogu#irresistible`
- Type: Unit
- Text: Action [exhaust]: Exhaust an enemy unit.
- Status: Unreviewed

### 197 - L3-37 - Droid Revolutionary

- Internal name: `l337#droid-revolutionary`
- Type: Unit
- Text: When Played: You may rescue a captured card. If you don't, give a Shield token to this unit. Smuggle [4 resources Cunning Heroism] (If this card is a resource, you may play her for her smuggle cost. Replace her with the top card of your deck.)
- Status: Unreviewed

### 198 - Omega - Part of the Squad

- Internal name: `omega#part-of-the-squad`
- Type: Unit
- Text: Ignore the aspect penalty on the first Clone unit you play each round. When Played: Search the top 5 cards of your deck for a Clone card, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order. (ERRATA) Templating update: "Aspect penalty" becomes "aspect penalties" when referring to multiple.
- Status: Unreviewed

### 199 - Coruscant Dissident

- Internal name: `coruscant-dissident`
- Type: Unit
- Text: On Attack: You may ready a resource.
- Status: Unreviewed

### 200 - Liberated Slaves

- Internal name: `liberated-slaves`
- Type: Unit
- Text: (none)
- Status: Finished

### 201 - Principled Outlaw

- Internal name: `principled-outlaw`
- Type: Unit
- Text: On Attack: You may exhaust a ground unit. Smuggle [6 resources Cunning Heroism] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 202 - Qi'ra - Playing Her Part

- Internal name: `qira#playing-her-part`
- Type: Unit
- Text: When Played: Look at an opponent's hand, then name a card. While this unit is in play, each card with that name costs 3 resources more for your opponents to play.
- Rules: Abilities that refer to a card’s “name” do not include the subtitle of the card. Until Qi'ra leaves play, your opponents's cards cost more. This effect is not changed if an opponent takes control of Qi'ra. If Qi'ra is captured and then rescued, her "When Played" effect does not resume.
- Status: Unreviewed

### 203 - Zorii Bliss - Valiant Smuggler

- Internal name: `zorii-bliss#valiant-smuggler`
- Type: Unit
- Text: On Attack: Draw a card. At the start of the regroup phase, discard a card from your hand. Smuggle [6 resources Cunning Heroism]
- Rules: Zorii’s ability’s requirement to discard a card remains active even if she is defeated or leaves play before the start of the next regroup phase.
- Status: Unreviewed

### 204 - Millennium Falcon - Lando's Pride

- Internal name: `millennium-falcon#landos-pride`
- Type: Unit
- Text: If you play this unit from your hand, it gains Ambush. Smuggle [6 resources Cunning Heroism] (If this card is a resource, you may play her for her smuggle cost. Replace her with the top card of your deck.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. (ERRATA) If you play this unit from your hand, it gains Ambush for this phase.
- Status: Unreviewed

### 205 - Let the Wookiee Win

- Internal name: `let-the-wookiee-win`
- Type: Event
- Text: An opponent chooses one: <bullet>You ready up to 6 resources. You ready a friendly unit. If it's a Wookiee unit, attack with it. It gets +2/+0 for this attack.</bullet>
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 206 - Spare the Target

- Internal name: `spare-the-target`
- Type: Event
- Text: Return an enemy non-leader unit to its owner's hand. Collect that unit's Bounties.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 207 - A New Adventure

- Internal name: `a-new-adventure`
- Type: Event
- Text: Return a non-leader unit that costs 6 or less to its owner's hand. Then, its owner may play it for free.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs. Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 208 - Final Showdown

- Internal name: `final-showdown`
- Type: Event
- Text: Ready each unit you control. At the start of the regroup phase, you lose the game.
- Status: Unreviewed

### 209 - Criminal Muscle

- Internal name: `criminal-muscle`
- Type: Unit
- Text: When Played: You may return a non-unique upgrade to its owner's hand.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified. (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 210 - Cloud-Rider

- Internal name: `cloudrider`
- Type: Unit
- Text: Ambush (When you play this unit, it may ready and attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 211 - Fugitive Wookiee

- Internal name: `fugitive-wookiee`
- Type: Unit
- Text: Bounty — Exhaust a unit. (When this unit is defeated or captured, your opponent collects its bounty.)
- Status: Unreviewed

### 212 - Privateer Scyk

- Internal name: `privateer-scyk`
- Type: Unit
- Text: While you control another Cunning unit, this unit gains Shielded. (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 213 - DJ - Blatant Thief

- Internal name: `dj#blatant-thief`
- Type: Unit
- Text: Smuggle [7 resources Cunning Cunning] When played using Smuggle: Take control of an enemy resource. When this unit leaves play, that resource's owner takes control of it.
- Rules: If DJ has already left play when you resolve his "When Played" ability, immediately return the stolen resource to its owner's control.
- Status: Unreviewed

### 214 - Frontier Trader

- Internal name: `frontier-trader`
- Type: Unit
- Text: When Played: You may return a resource you control to its owner's hand. If you do, you may put the top card of your deck into play as a resource.
- Rules: A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”.
- Status: Unreviewed

### 215 - Smuggler's Starfighter

- Internal name: `smugglers-starfighter`
- Type: Unit
- Text: When Played: If you control another Underworld unit, give an enemy unit –3/–0 for this phase. Smuggle [4 resources Cunning] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 216 - Chain Code Collector

- Internal name: `chain-code-collector`
- Type: Unit
- Text: Ambush (When you play this unit, it may ready and attack an enemy unit.) On Attack: If the defender has a Bounty, it gets –4/–0 for this attack.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 217 - Tobias Beckett - I Trust No One

- Internal name: `tobias-beckett#i-trust-no-one`
- Type: Unit
- Text: When you play a non-unit card: You may exhaust a unit that costs the same as or less than the card you played. Use this ability only once each round. Smuggle [5 resources Vigilance]
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 218 - Resourceful Pursuers

- Internal name: `resourceful-pursuers`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 219 - Enfys Nest - Marauder

- Internal name: `enfys-nest#marauder`
- Type: Unit
- Text: Ambush (When you play this unit, it may ready and attack an enemy unit.) While a friendly unit (including this one) is attacking using Ambush, the defender gets –3/–0.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 220 - Fennec Shand - Loyal Sharpshooter

- Internal name: `fennec-shand#loyal-sharpshooter`
- Type: Unit
- Text: Ambush (When you play this unit, it may ready and attack an enemy unit.) On Attack: Deal 1 damage to the defender (if it's a unit) for each different cost among cards in your discard pile.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 221 - Wanted

- Internal name: `wanted`
- Type: Upgrade
- Text: Attached unit gains: “Bounty — Ready 2 friendly resources.” (When this unit is defeated or captured, its opponent collects its bounty.)
- Status: Unreviewed

### 222 - Enticing Reward

- Internal name: `enticing-reward`
- Type: Upgrade
- Text: Attached unit gains: “Bounty — Search the top 10 cards of your deck for 2 non-unit cards, reveal them, and draw them. (Put the other cards on the bottom of your deck in a random order.) Then, if this unit isn't unique, discard a card from your hand.”
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order. (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 223 - Snapshot Reflexes

- Internal name: `snapshot-reflexes`
- Type: Upgrade
- Text: When Played: You may attack with attached unit.
- Rules: You may only attack with your own units. Units must be ready in order to attack.
- Status: Unreviewed

### 224 - Boba Fett's Armor

- Internal name: `boba-fetts-armor`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. If attached unit is Boba Fett and damage would be dealt to him, prevent 2 of that damage.
- Rules: If your Boba Fett unit has both his Armor and another damage prevention effect (e.g. Shield), you can choose in what order to resolve the prevention effects.
- Status: Unreviewed

### 225 - Jetpack

- Internal name: `jetpack`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. When Played: Give a Shield token to attached unit. At the start of the regroup phase, defeat that token. Smuggle [4 resources Cunning]
- Rules: Jetpack’s ability’s requirement to defeat the Shield token remains active even if the Jetpack is defeated or changes zones before the start of the next regroup phase.
- Status: Unreviewed

### 226 - Unrefusable Offer

- Internal name: `unrefusable-offer`
- Type: Upgrade
- Text: Attach to a non-leader unit. Attached unit gains: “Bounty — Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it.”
- Rules: “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs. (ERRATA) Attach to a non-leader unit. Attached unit gains: “Bounty — Play this unit from its owner's discard pile or from capture for free (under your control). It enters play ready. At the start of the regroup phase, defeat it.”
- Status: Unreviewed

### 227 - Look the Other Way

- Internal name: `look-the-other-way`
- Type: Event
- Text: Exhaust a unit unless its controller pays 2 resources.
- Status: Unreviewed

### 228 - Bounty Posting

- Internal name: `bounty-posting`
- Type: Event
- Text: Search your deck for a Bounty upgrade, reveal it, and draw it. (Shuffle your deck.) You may play that upgrade (paying its cost).
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. After searching your deck, shuffle it.
- Status: Unreviewed

### 229 - Ma Klounkee

- Internal name: `ma-klounkee`
- Type: Event
- Text: Return a friendly non-leader Underworld unit to its owner's hand. If you do, deal 3 damage to a unit.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 230 - Swoop Down

- Internal name: `swoop-down`
- Type: Event
- Text: Attack with a space unit. It gains Saboteur and can attack ground units for this attack. If it attacks a ground unit, it gets +2/+0 and the defender gets –2/–0 for this attack.
- Rules: You must attack with a space unit, if able. Units must be ready in order to attack. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 231 - Surprise Strike

- Internal name: `surprise-strike`
- Type: Event
- Text: Attack with a unit. It gets +3/+0 for this attack.
- Rules: You must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 232 - Relentless Pursuit

- Internal name: `relentless-pursuit`
- Type: Event
- Text: Choose a friendly unit. It captures an enemy non-leader unit that costs the same as or less than it. If the friendly unit is a Bounty Hunter, give a Shield token to it. (Put the captured card facedown under the friendly unit until it leaves play.)
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 233 - Evacuate

- Internal name: `evacuate`
- Type: Event
- Text: Return each non-leader unit to its owner's hand.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 234 - Incinerator Trooper

- Internal name: `incinerator-trooper`
- Type: Unit
- Text: While attacking, this unit deals combat damage before the defender. (If the defender is defeated, it deals no combat damage.)
- Rules: Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 235 - Ruthless Assassin

- Internal name: `ruthless-assassin`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) When Played: Deal 2 damage to a friendly unit.
- Rules: If Ruthless Assassin is the only friendly unit in play, it must be chosen by its “When Played” ability. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 236 - Snowtrooper Lieutenant

- Internal name: `snowtrooper-lieutenant`
- Type: Unit
- Text: When Played: You may attack with a unit. If it's an Imperial unit, it gets +2/+0 for this attack.
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 237 - Black Sun Starfighter

- Internal name: `black-sun-starfighter`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 238 - Cell Block Guard

- Internal name: `cell-block-guard`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 239 - Toro Calican - Ambitious Upstart

- Internal name: `toro-calican#ambitious-upstart`
- Type: Unit
- Text: When you play another Bounty Hunter unit: You may deal 1 damage to it. If you do, ready this unit. Use this ability only once each round.
- Status: Unreviewed

### 240 - Hutt's Henchmen

- Internal name: `hutts-henchmen`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 241 - Kragan Gorr - Warbird Captain

- Internal name: `kragan-gorr#warbird-captain`
- Type: Unit
- Text: When an enemy unit attacks your base: Give a Shield token to a friendly unit in the same arena as the attacker.
- Rules: When an enemy unit attacks your base” triggers at the same time as “On Attack” abilities.
- Status: Unreviewed

### 242 - Gideon's Light Cruiser - Dark Troopers' Station

- Internal name: `gideons-light-cruiser#dark-troopers-station`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) When Played: If you control Moff Gideon (as a leader or unit), play a [villainy] unit that costs 3 or less from your hand or discard pile for free.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 243 - Altering the Deal

- Internal name: `altering-the-deal`
- Type: Event
- Text: Discard a captured card guarded by a friendly unit.
- Status: Unreviewed

### 244 - No Bargain

- Internal name: `no-bargain`
- Type: Event
- Text: Each opponent discards a card from their hand. Draw a card.
- Status: Unreviewed

### 245 - Greef Karga - Affable Commissioner

- Internal name: `greef-karga#affable-commissioner`
- Type: Unit
- Text: When Played: Search the top 5 cards of your deck for an upgrade, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 246 - Grey Squadron Y-Wing

- Internal name: `grey-squadron-ywing`
- Type: Unit
- Text: On Attack: An opponent chooses a unit or base they control. You may deal 2 damage to it.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 247 - Protector of the Throne

- Internal name: `protector-of-the-throne`
- Type: Unit
- Text: While this unit is upgraded, it gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 248 - Tech - Source of Insight

- Internal name: `tech#source-of-insight`
- Type: Unit
- Text: Each friendly resource gains Smuggle. The gained Smuggle cost is that card's cost plus 2 resources and its aspect icons. Smuggle [4 resources Heroism]
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 249 - Wookiee Warrior

- Internal name: `wookiee-warrior`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.) When Played: If you control another Wookiee unit, draw a card.
- Status: Unreviewed

### 250 - Tarfful - Kashyyyk Chieftain

- Internal name: `tarfful#kashyyyk-chieftain`
- Type: Unit
- Text: Restore 2 When a friendly Wookiee unit is dealt combat damage and isn't defeated: That unit deals that much damage to an enemy ground unit.
- Rules: Combat damage” is only the damage dealt during the “deal combat damage” step of an attack.
- Status: Unreviewed

### 251 - The Mandalorian's Rifle

- Internal name: `the-mandalorians-rifle`
- Type: Upgrade
- Text: Attach to a friendly non-VEHICLE unit. When Played: If attached unit is The Mandalorian, he captures an exhausted enemy non-leader unit. (Put the captured card facedown under him until he leaves play.)
- Status: Unreviewed

### 252 - Smuggler's Aid

- Internal name: `smugglers-aid`
- Type: Event
- Text: Heal 3 damage from your base. Smuggle [3 resources Heroism] (If this card is a resource, you may play it for its smuggle cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 253 - This Is The Way

- Internal name: `this-is-the-way`
- Type: Event
- Text: Search the top 8 cards of your deck for up to 2 Mandalorian and/or upgrade cards, reveal them, and draw them. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 254 - Bounty Guild Initiate

- Internal name: `bounty-guild-initiate`
- Type: Unit
- Text: When Played: If you control another Bounty Hunter unit, you may deal 2 damage to a ground unit.
- Status: Unreviewed

### 255 - Lady Proxima - White Worm Matriarch

- Internal name: `lady-proxima#white-worm-matriarch`
- Type: Unit
- Text: When you play another Underworld card: You may deal 1 damage to a base.
- Status: Unreviewed

### 256 - Mercenary Gunship

- Internal name: `mercenary-gunship`
- Type: Unit
- Text: Action [4 resources]: Take control of this unit. Any player may use this ability.
- Status: Unreviewed

### 257 - Underworld Thug

- Internal name: `underworld-thug`
- Type: Unit
- Text: (none)
- Status: Finished

### 258 - Mandalorian Warrior

- Internal name: `mandalorian-warrior`
- Type: Unit
- Text: When Played: You may give an Experience token to another Mandalorian unit.
- Status: Unreviewed

### 259 - Twin Pod Cloud Car

- Internal name: `twin-pod-cloud-car`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 261 - Rich Reward

- Internal name: `rich-reward`
- Type: Upgrade
- Text: Attached unit gains: “Bounty — Give an Experience token to each of up to 2 units.” (When this unit is defeated or captured, its opponent collects its bounty.)
- Status: Unreviewed

### 262 - Confiscate

- Internal name: `confiscate`
- Type: Event
- Text: Defeat an upgrade.
- Status: Unreviewed

