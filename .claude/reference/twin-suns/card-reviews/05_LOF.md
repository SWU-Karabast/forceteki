# 05_LOF (LOF) card review

264 cards + 1 token, in set order. Review against the official card text (`test/json/Card/`), not our implementations.

### 001 - Kylo Ren - We're Not Done Yet

- Internal name: `kylo-ren#were-not-done-yet`
- Type: Leader
- Text: Action [Exhaust]: Discard a card from your hand. If you discarded an upgrade this way, draw a card.
- Deployed: Sentinel When Deployed: Play any number of upgrades from your discard pile on this unit (one at a time, paying their costs).
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. For abilities that encompass multiple actions, resolve each action (and any resulting triggers) sequentially.
- Status: Unreviewed

### 002 - Mother Talzin - Power Through Magick

- Internal name: `mother-talzin#power-through-magick`
- Type: Leader
- Text: Action [Exhaust, use the Force (lose your Force token)]: Give a unit –1/–1 for this phase.
- Deployed: On Attack: You may give a unit –1/–1 for this phase.
- Status: Unreviewed

### 003 - Ahsoka Tano - Fighting For Peace

- Internal name: `ahsoka-tano#fighting-for-peace`
- Type: Leader
- Text: Action [Exhaust, use the Force (lose your Force token)]: Give a friendly unit Sentinel for this phase. (Enemy units in its arena must attack a sentinel when they attack you.)
- Deployed: On Attack: You may give a friendly unit Sentinel for this phase.
- Rules: Ahsoka's unit side ability can be used to give herself Sentinel.
- Status: Unreviewed

### 004 - Kanan Jarrus - Help Us Survive

- Internal name: `kanan-jarrus#help-us-survive`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Give a Shield token to a Creature or Spectre unit.
- Deployed: Shielded (When you deploy this leader, give a Shield token to him.) While you control another Creature or Spectre unit, this unit gets +2/+2.
- Status: Unreviewed

### 005 - Morgan Elsbeth - Following the Call

- Internal name: `morgan-elsbeth#following-the-call`
- Type: Leader
- Text: Action [Exhaust]: Choose a friendly unit that attacked this phase. Play a unit from your hand that shares a keyword with the chosen unit. It costs 1 resource less.
- Deployed: On Attack: The next unit you play this phase costs 1 resource less if it shares a keyword with a friendly unit.
- Rules: In order to benefit from Morgan's cost reduction, the unit being played must already have a shared keyword while paying its cost. Effects that grant keywords like Ambush to units when you play them typically only grant them at the moment of play, which occurs after costs are paid. The cost reduction from Morgan's "On Attack" ability remains active even if she is defeated. Morgan's On Attack ability can discount the cost of a unit that is played and granted a keyword by a modified Play a Card action (e.g. "Play a unit and give it Ambush for this phase.").
- Status: Unreviewed

### 006 - Supreme Leader Snoke - In the Seat of Power

- Internal name: `supreme-leader-snoke#in-the-seat-of-power`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Give an Experience token to the unit with the most power among friendly Villainy units. (If multiple units are tied, choose one.)
- Deployed: On Attack: Give an Experience token to the unit with the most power among friendly Villainy units.
- Rules: Abilities that refer to a card’s power include temporary modifiers. Snoke's ability only considers friendly Villainy units when determining which has the most power, regardless of the power of friendly non-Villainy units.
- Status: Unreviewed

### 007 - Avar Kriss - Marshal of Starlight

- Internal name: `avar-kriss#marshal-of-starlight`
- Type: Leader
- Text: Action [Exhaust]: The Force is with you (create your Force token).
- Deployed: While the Force is with you, this unit gets +4/+0 and gains Overwhelm.
- Rules: If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.
- Status: Unreviewed

### 008 - Obi-Wan Kenobi - Courage Makes Heroes

- Internal name: `obiwan-kenobi#courage-makes-heroes`
- Type: Leader
- Text: Action [Exhaust, use the Force (lose your Force token)]: Give an Experience token to a unit without an Experience token on it.
- Deployed: On Attack: You may give an Experience token to another unit without an Experience token on it.
- Status: Unreviewed

### 009 - Darth Maul - Sith Revealed

- Internal name: `darth-maul#sith-revealed`
- Type: Leader
- Text: Action [Exhaust, use the Force (lose your Force token)]: Deal 1 damage to a unit and 1 damage to a different unit.
- Deployed: On Attack: Deal 1 damage to a unit and 1 damage to a different unit.
- Rules: All damage dealt by Maul's abilities is dealt simultaneously. When using Maul's ability, you must deal damage to 2 units if you can. You can use Maul's unit ability to damage himself.
- Status: Unreviewed

### 010 - Third Sister - Seething With Ambition

- Internal name: `third-sister#seething-with-ambition`
- Type: Leader
- Text: Action [Exhaust]: Play a unit from your hand. It gains Hidden for this phase. (It can't be attacked for this phase unless it has Sentinel.)
- Deployed: Hidden (This unit can't be attacked if she was deployed this phase.) On Attack: The next unit you play this phase gains Hidden.
- Rules: (ERRATA) On Attack: The next unit you play this phase gains Hidden for this phase. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. If a unit has Hidden and Sentinel at the same time, it can be attacked. Once it triggers, Third Sister's "On Attack" ability gives the next unit you play this phase Hidden even if she is defeated.
- Status: Unreviewed

### 011 - Kit Fisto - Focused Jedi Master

- Internal name: `kit-fisto#focused-jedi-master`
- Type: Leader
- Text: Action [1 resource, Exhaust]: If you attacked with a Jedi unit this phase, deal 2 damage to a unit.
- Deployed: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) This unit gets +1/+0 for each other friendly Jedi unit.
- Rules: Kit’s leader ability still can be used as an action even if you haven't attacked with a Jedi unit (but you don't deal damage).
- Status: Unreviewed

### 012 - Rey - Nobody

- Internal name: `rey#nobody`
- Type: Leader
- Text: Action [Exhaust]: If you played a non-unit Force card this phase, deal 1 damage to a unit.
- Deployed: When Deployed: You may discard your hand. If you do, draw 2 cards.
- Rules: If you have no cards in your hand, you may still choose to discard your hand in order to draw 2 cards. Playing a Pilot with the Force trait as an upgrade counts as a "non-unit Force card" for Rey's ability. Rey’s leader ability still can be used as an action even if you haven't played a non-unit Force card (but you don't deal damage).
- Status: Unreviewed

### 013 - Barriss Offee - We Have Become Villains

- Internal name: `barriss-offee#we-have-become-villains`
- Type: Leader
- Text: Action [Exhaust, use the Force (lose your Force token)]: Play an event from your hand. It costs 1 resource less.
- Deployed: Action [use the Force]: Play an event from your hand. It costs 1 resource less.
- Status: Unreviewed

### 014 - Grand Inquisitor - Stories Travel Quickly

- Internal name: `grand-inquisitor#stories-travel-quickly`
- Type: Leader
- Text: Action [Exhaust, use the Force (lose your Force token)]: Attack with a friendly unit. The defender gets –2/–0 for this attack.
- Deployed: Shielded (When you deploy this leader, give a Shield token to him.) On Attack: The defender gets –2/–0 for this attack.
- Rules: If you use Grand Inquisitor’s leader ability, you must attack with a unit, if able. Units must be ready in order to attack. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 015 - Cal Kestis - I Can't Keep Hiding

- Internal name: `cal-kestis#i-cant-keep-hiding`
- Type: Leader
- Text: Action [Exhaust, use the Force (lose your Force token)]: An opponent chooses a ready unit they control. Exhaust that unit.
- Deployed: On Attack: An opponent chooses a ready unit they control. Exhaust that unit.
- Rules: If there are multiple opponents, the controlling player chooses which one will be "an opponent."
- Status: Unreviewed

### 016 - Qui-Gon Jinn - Student of the Living Force

- Internal name: `quigon-jinn#student-of-the-living-force`
- Type: Leader
- Text: Action [Exhaust, use the Force (lose your Force token)]: Return a friendly non-leader unit to its owner's hand. Play a non-Villainy unit that costs less than the returned unit from your hand for free.
- Deployed: When this unit completes an attack (and survives): You may return a friendly non-leader unit to its owner's hand. Play a non-Villainy unit that costs less than the returned unit from your hand for free.
- Rules: "Play for free" ignores all resource costs, including the aspect penalty, but not other additional costs. A unit must survive an attack to trigger its "when this unit completes an attack" abilities. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that return a card to hand must choose a card in play unless otherwise specified. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 017 - Darth Revan - Scourge of the Old Republic

- Internal name: `darth-revan#scourge-of-the-old-republic`
- Type: Leader
- Text: When a friendly unit attacks and defeats a unit: You may exhaust this leader. If you do, give an Experience token to that friendly unit.
- Deployed: Restore 1 When a friendly unit attacks and defeats a unit: You may give an Experience token to that friendly unit.
- Rules: A unit "attacks and defeats a unit" if it defeats the defender at any point during the attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 018 - Anakin Skywalker - Tempted by the Dark Side

- Internal name: `anakin-skywalker#tempted-by-the-dark-side`
- Type: Leader
- Text: Action [Exhaust, use the Force (lose your Force token)]: Play a Villainy non-unit card from your hand, ignoring its aspect penalties.
- Deployed: Action [use the Force]: Play a Villainy non-unit card from your hand, ignoring its aspect penalties.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. Anakin's ability can be used to play Villainy Pilot cards as upgrades.
- Status: Unreviewed

### 019 - Vergence Temple

- Internal name: `vergence-temple`
- Type: Base
- Text: When the regroup phase starts: If you control a unit with 4 or more remaining HP, the Force is with you (create your Force token).
- Status: Unreviewed

### 020 - Nightsister Lair

- Internal name: `nightsister-lair`
- Type: Base
- Text: When a friendly Force unit attacks: The Force is with you (create your Force token).
- Status: Unreviewed

### 021 - Shadowed Undercity

- Internal name: `shadowed-undercity`
- Type: Base
- Text: When a friendly Force unit attacks: The Force is with you (create your Force token).
- Status: Unreviewed

### 022 - Mystic Monastery

- Internal name: `mystic-monastery`
- Type: Base
- Text: Action: The Force is with you (create your Force token). Use this ability no more than 3 times each game.
- Status: Unreviewed

### 023 - Jedi Temple

- Internal name: `jedi-temple`
- Type: Base
- Text: When a friendly Force unit attacks: The Force is with you (create your Force token).
- Status: Unreviewed

### 024 - Starlight Temple

- Internal name: `starlight-temple`
- Type: Base
- Text: When a friendly Force unit attacks: The Force is with you (create your Force token).
- Status: Unreviewed

### 025 - Temple of Destruction

- Internal name: `temple-of-destruction`
- Type: Base
- Text: When a friendly unit deals 3 or more combat damage to an enemy base: The Force is with you (create your Force token).
- Rules: "Combat damage" is only the damage dealt during the "deal combat damage" step of an attack.
- Status: Unreviewed

### 026 - Fortress Vader

- Internal name: `fortress-vader`
- Type: Base
- Text: When a friendly Force unit attacks: The Force is with you (create your Force token).
- Status: Unreviewed

### 027 - Strangled Cliffs

- Internal name: `strangled-cliffs`
- Type: Base
- Text: When a friendly Force unit attacks: The Force is with you (create your Force token).
- Status: Unreviewed

### 028 - Tomb of Eilram

- Internal name: `tomb-of-eilram`
- Type: Base
- Text: Action [exhaust a friendly unit]: The Force is with you (create your Force token).
- Status: Unreviewed

### 029 - Crystal Caves

- Internal name: `crystal-caves`
- Type: Base
- Text: When a friendly Force unit attacks: The Force is with you (create your Force token).
- Status: Unreviewed

### 030 - The Holy City

- Internal name: `the-holy-city`
- Type: Base
- Text: When a friendly Force unit attacks: The Force is with you (create your Force token).
- Status: Unreviewed

### 031 - Karis - We Don't Like Strangers

- Internal name: `karis#we-dont-like-strangers`
- Type: Unit
- Text: When Defeated: You may use the Force (lose your Force token). If you do, give a unit –2/–2 for this phase.
- Status: Unreviewed

### 032 - Magistrate's Scout

- Internal name: `magistrates-scout`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 033 - Nameless Terror

- Internal name: `nameless-terror`
- Type: Unit
- Text: When Played: You may exhaust a Force unit. On Attack: Each enemy unit loses the Force trait for this phase.
- Rules: Units affected by Nameless Terror's "On Attack" ability can't gain the Force trait for this phase.
- Status: Unreviewed

### 034 - Supremacy TIE/sf

- Internal name: `supremacy-tiesf`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 035 - Talzin's Assassin

- Internal name: `talzins-assassin`
- Type: Unit
- Text: When Played: You may use the Force (lose your Force token). If you do, give a unit –3/–3 for this phase.
- Status: Unreviewed

### 036 - Old Daka - Oldest and Wisest

- Internal name: `old-daka#oldest-and-wisest`
- Type: Unit
- Text: When Played: You may defeat a friendly Night unit not named Old Daka. Then, you may play that unit from your discard pile for free.
- Rules: "Play for free" ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 037 - Darth Vader - Twilight of the Apprentice

- Internal name: `darth-vader#twilight-of-the-apprentice`
- Type: Unit
- Text: When Played: Give a Shield token to a friendly unit and to an enemy unit. On Attack: Defeat an enemy unit with a Shield token on it.
- Status: Unreviewed

### 038 - Pong Krell - It's Treason, Then

- Internal name: `pong-krell#its-treason-then`
- Type: Unit
- Text: Grit When this unit completes an attack (and survives): You may defeat a unit with less remaining HP than this unit's power.
- Rules: A unit must survive an attack to trigger its "when this unit completes an attack" abilities. Abilities that refer to a card’s power include temporary modifiers. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 039 - Darth Sidious - The Phantom Menace

- Internal name: `darth-sidious#the-phantom-menace`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.) When Played: You may use the Force. If you do, defeat each non-Sith unit with 3 or less remaining HP.
- Status: Unreviewed

### 040 - Kylo Ren's Lightsaber

- Internal name: `kylo-rens-lightsaber`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. If attached unit is a Force unit, it gains: “This unit can't be exhausted by enemy card abilities.”
- Status: Unreviewed

### 041 - Drain Essence

- Internal name: `drain-essence`
- Type: Event
- Text: Deal 2 damage to a unit. The Force is with you (create your Force token).
- Status: Unreviewed

### 042 - Always Two

- Internal name: `always-two`
- Type: Event
- Text: Choose 2 friendly <uq> Sith units. If you do, give 2 Shield tokens and 2 Experience tokens to each chosen unit. Defeat all other friendly units.
- Status: Unreviewed

### 043 - The Tragedy of Plagueis

- Internal name: `the-tragedy-of-plagueis`
- Type: Event
- Text: Choose a friendly unit. For this phase, it can't be defeated by having no remaining HP. An opponent chooses a unit they control. Defeat that unit.
- Rules: If the chosen friendly unit is attacked by a unit with Overwhelm, there is no excess damage if the chosen unit is not defeated. If there are multiple opponents, the controlling player chooses which one will be "an opponent." The chosen friendly unit can be assigned more damage than its remaining HP. The chosen friendly unit is defeated passively as soon as the regroup phase starts if it has damage on it equal to or greater than its remaining HP.
- Status: Unreviewed

### 044 - Loth-Wolf

- Internal name: `lothwolf`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) This unit can't attack.
- Status: Unreviewed

### 045 - Yaddle - A Chance To Make Things Right

- Internal name: `yaddle#a-chance-to-make-things-right`
- Type: Unit
- Text: Restore 1 On Attack: Each other friendly Jedi unit gains Restore 1 for this phase.
- Status: Unreviewed

### 046 - Ezra Bridger - Attuned With Life

- Internal name: `ezra-bridger#attuned-with-life`
- Type: Unit
- Text: On Attack: You may give an Experience token to another Creature or Spectre unit.
- Status: Unreviewed

### 047 - T-6 Shuttle 1974 - Stay Close

- Internal name: `t6-shuttle-1974#stay-close`
- Type: Unit
- Text: When this unit is attacked (before damage is dealt): You may give an Experience token to this unit.
- Rules: "When this unit is attacked" triggers at the same time as "On Attack" abilities. On Defense abilities trigger when this unit is chosen as the defender for an attack, in the same window as the attacker's On Attack abilities.
- Status: Unreviewed

### 048 - Itinerant Warrior

- Internal name: `itinerant-warrior`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.) When Played: You may use the Force (lose your Force token). If you do, heal 3 damage from a base.
- Status: Unreviewed

### 049 - Jedi Guardian

- Internal name: `jedi-guardian`
- Type: Unit
- Text: While this unit is defending, it gets +2/+0.
- Status: Unreviewed

### 050 - Plo Koon - I Don't Believe in Chance

- Internal name: `plo-koon#i-dont-believe-in-chance`
- Type: Unit
- Text: While the Force is with you, this unit gains Grit. (He gets +1/+0 for each damage on him.)
- Status: Unreviewed

### 051 - Jedi Holocron

- Internal name: `jedi-holocron`
- Type: Upgrade
- Text: Attach to a Force unit. Attached unit gains: “On Attack: You may heal 3 damage from another unit.”
- Status: Unreviewed

### 052 - Jedi Trials

- Internal name: `jedi-trials`
- Type: Upgrade
- Text: Attach to a Force unit. Attached unit gains: “On Attack: Give an Experience token to this unit.” While attached unit has 4 or more upgrades on it, it gains the Jedi trait.
- Status: Unreviewed

### 053 - Heirloom Lightsaber

- Internal name: `heirloom-lightsaber`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. If attached unit is a Force unit, it gains Restore 1. (When this unit attacks, heal 1 damage from your base.)
- Status: Unreviewed

### 054 - Calm in the Storm

- Internal name: `calm-in-the-storm`
- Type: Event
- Text: Exhaust a friendly unit. If you do, give a Shield token and 2 Experience tokens to it.
- Status: Unreviewed

### 055 - Dume - Redeem the Future

- Internal name: `dume#redeem-the-future`
- Type: Unit
- Text: When the regroup phase starts: Give an Experience token to each other friendly non-Vehicle unit.
- Status: Unreviewed

### 056 - Size Matters Not

- Internal name: `size-matters-not`
- Type: Upgrade
- Text: If you control a Force unit, this upgrade costs 1 resource less to play. Attached unit's printed power is considered to be 5 and its printed HP is considered to be 5.
- Rules: "Printed power" and "printed HP" refer to the numbers physically printed on the card. While Size Matters Not is attached to a unit, those numbers are both considered to be 5. These numbers can then be modified by other abilities and upgrades attached to that unit. If multiple abilities or effects change the printed power or printed HP of a card, the most recent ability or effect to become active determines the card's printed values.
- Status: Unreviewed

### 057 - Owen Lars - Devoted Uncle

- Internal name: `owen-lars#devoted-uncle`
- Type: Unit
- Text: Restore 2 When Defeated: Search the top 5 cards of your deck for a Force unit, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 058 - Guardian of the Whills

- Internal name: `guardian-of-the-whills`
- Type: Unit
- Text: The first upgrade you play on this unit each round costs [1 resource] less.
- Rules: Abilities that give token upgrades are not discounted. Token upgrades are not “played.”
- Status: Unreviewed

### 059 - Nightsister Warrior

- Internal name: `nightsister-warrior`
- Type: Unit
- Text: When Defeated: Draw a card.
- Status: Unreviewed

### 060 - Padawan Starfighter

- Internal name: `padawan-starfighter`
- Type: Unit
- Text: While you control a Force unit or a Force upgrade, this unit gets +1/+1.
- Rules: Padawan Starfighter gets +1/+1 while you control a Force unit or a Force upgrade.
- Status: Unreviewed

### 061 - Secretive Sage

- Internal name: `secretive-sage`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 062 - Axe Woves - Accomplished Warrior

- Internal name: `axe-woves#accomplished-warrior`
- Type: Unit
- Text: Shielded This unit gets +1/+1 for each upgrade on him.
- Rules: A unit "attacks and defeats a unit" if it defeats the defender at any point during the attack.
- Status: Unreviewed

### 063 - Oggdo Bogdo - Bogano Brute

- Internal name: `oggdo-bogdo#bogano-brute`
- Type: Unit
- Text: This unit can't attack unless it's damaged. When this unit attacks and defeats a unit: Heal 2 damage from this unit.
- Rules: When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 064 - Tauntaun

- Internal name: `tauntaun`
- Type: Unit
- Text: When Defeated: You may give a Shield token to a damaged non-Vehicle unit.
- Status: Unreviewed

### 065 - Watto - No Money, No Parts, No Deal

- Internal name: `watto#no-money-no-parts-no-deal`
- Type: Unit
- Text: On Attack: An opponent chooses one: You give an Experience token to a friendly unit. You draw a card.
- Rules: If there are multiple opponents, the controlling player chooses which one will be "an opponent."
- Status: Unreviewed

### 066 - Awakened Specters

- Internal name: `awakened-specters`
- Type: Unit
- Text: (none)
- Status: Finished

### 067 - Chirrut Îmwe - Blind, but not Deaf

- Internal name: `chirrut-imwe#blind-but-not-deaf`
- Type: Unit
- Text: Sentinel When this unit is attacked (before damage is dealt): You may use the Force (lose your Force token). If you do, the attacker gets –2/–0 for this attack.
- Rules: "When this unit is attacked" triggers at the same time as "On Attack" abilities. On Defense abilities trigger when this unit is chosen as the defender for an attack, in the same window as the attacker's On Attack abilities.
- Status: Unreviewed

### 068 - Luthen Rael - Masquerading Antiquarian

- Internal name: `luthen-rael#masquerading-antiquarian`
- Type: Unit
- Text: On Attack: Search the top 5 cards of your deck for an Item upgrade, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 069 - Graceful Purrgil

- Internal name: `graceful-purrgil`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 070 - Anakin Skywalker - Champion of Mortis

- Internal name: `anakin-skywalker#champion-of-mortis`
- Type: Unit
- Text: When Played: If there is a Heroism card in your discard pile, you may give a unit –3/–3 for this phase. When Played: If there is a Villainy card in your discard pile, you may give a unit –3/–3 for this phase.
- Rules: Both of Anakin's "When Played" abilities trigger at the same time and can be resolved in any order. They can choose the same or different units.
- Status: Unreviewed

### 071 - Grappling Guardian

- Internal name: `grappling-guardian`
- Type: Unit
- Text: When Played: You may defeat a space unit with 6 or less remaining HP.
- Status: Unreviewed

### 072 - Priestesses of the Force - Eternal

- Internal name: `priestesses-of-the-force#eternal`
- Type: Unit
- Text: When Played: You may use the Force (lose your Force token). If you do, give a Shield token to each of up to 5 units.
- Status: Unreviewed

### 073 - Mythosaur - Folklore Awakened

- Internal name: `mythosaur#folklore-awakened`
- Type: Unit
- Text: Shielded Friendly upgraded units can't be exhausted or returned to hand by enemy card abilities. Friendly leaders gain the Mandalorian trait.
- Rules: Friendly upgraded units can be exhausted by other game effects, such as when attacking. Mythosaur gives friendly leaders, leader units, and leader upgrades the Mandalorian trait.
- Status: Unreviewed

### 074 - Bolstered Endurance

- Internal name: `bolstered-endurance`
- Type: Upgrade
- Text: Attach to a Force unit.
- Status: Unreviewed

### 075 - Cure Wounds

- Internal name: `cure-wounds`
- Type: Event
- Text: Use the Force (lose your Force token). If you do, heal 6 damage from a unit.
- Status: Unreviewed

### 076 - Soresu Stance

- Internal name: `soresu-stance`
- Type: Event
- Text: Play a Force unit from your hand (paying its cost) and give a Shield token to it.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 077 - Crushing Blow

- Internal name: `crushing-blow`
- Type: Event
- Text: Defeat a non-leader unit that costs 2 or less.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 078 - Whirlwind of Power

- Internal name: `whirlwind-of-power`
- Type: Event
- Text: Give a unit –2/–2 for this phase. If you control a Force unit, give it –3/–3 instead.
- Status: Unreviewed

### 079 - Shatterpoint

- Internal name: `shatterpoint`
- Type: Event
- Text: Choose one: Defeat a non-leader unit with 3 or less remaining HP. Use the Force (lose your Force token). If you do, defeat a non-leader unit.
- Status: Unreviewed

### 080 - Exegol Patroller

- Internal name: `exegol-patroller`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.
- Status: Unreviewed

### 081 - Sith Legionnaire

- Internal name: `sith-legionnaire`
- Type: Unit
- Text: While you control another Villainy unit, this unit gets +2/+0.
- Status: Unreviewed

### 082 - Vaneé - I Live to Serve

- Internal name: `vanee#i-live-to-serve`
- Type: Unit
- Text: When Played/On Attack: You may defeat an Experience token on a friendly unit. If you do, give an Experience token to a friendly unit.
- Rules: You may choose to defeat an Experience token on and give an Experience token to the same unit.
- Status: Unreviewed

### 083 - Captain Enoch - Captain of the Guard

- Internal name: `captain-enoch#captain-of-the-guard`
- Type: Unit
- Text: This unit gets +1/+0 for each Trooper unit in your discard pile.
- Status: Unreviewed

### 084 - Knight of Ren

- Internal name: `knight-of-ren`
- Type: Unit
- Text: (none)
- Status: Finished

### 085 - Praetorian Guard

- Internal name: `praetorian-guard`
- Type: Unit
- Text: While you control a unit with 4 or more power, this unit gains Sentinel. (Enemy units in this arena must attack a Sentinel when they attack you.)
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 086 - Drengir Spawn

- Internal name: `drengir-spawn`
- Type: Unit
- Text: Overwhelm When this unit attacks and defeats a unit: Give a number of Experience tokens to this unit equal to the defeated unit's cost.
- Rules: A unit "attacks and defeats a unit" if it defeats the defender at any point during the attack. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 087 - Eighth Brother - Hunt Together

- Internal name: `eighth-brother#hunt-together`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) When you play another unit: You may use the Force (lose your Force token). If you do, give a unit +2/+2 for this phase.
- Rules: Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 088 - Eye of Sion - To Peridea

- Internal name: `eye-of-sion#to-peridea`
- Type: Unit
- Text: Hidden Ambush Overwhelm Restore 1
- Rules: Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready. If a unit has Hidden and Sentinel at the same time, it can be attacked. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.
- Status: Unreviewed

### 089 - Supremacy - Of Unimaginable Size

- Internal name: `supremacy#of-unimaginable-size`
- Type: Unit
- Text: Ambush Other friendly Vehicle units get +6/+6.
- Rules: Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 090 - Inquisitor's Lightsaber

- Internal name: `inquisitors-lightsaber`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains: “While attacking a Force unit, this unit gets +2/+0.”
- Status: Unreviewed

### 091 - Craving Power

- Internal name: `craving-power`
- Type: Upgrade
- Text: Attach to a friendly unit. When Played: Deal damage to an enemy unit equal to attached unit's power.
- Rules: Abilities that refer to a card’s power include temporary modifiers (and, in this case, the power given by Craving Power).
- Status: Unreviewed

### 092 - Point Rain Reclaimer

- Internal name: `point-rain-reclaimer`
- Type: Unit
- Text: When Played: If you control a Jedi unit, you may give an Experience token to this unit.
- Status: Unreviewed

### 093 - Gungi - Finding Himself

- Internal name: `gungi#finding-himself`
- Type: Unit
- Text: (none)
- Status: Finished

### 094 - Jedi Consular

- Internal name: `jedi-consular`
- Type: Unit
- Text: Action [Exhaust, use the Force (lose your Force token)]: Play a unit from your hand. It costs 2 resources less.
- Status: Unreviewed

### 095 - Lor San Tekka - Secret Keeper

- Internal name: `lor-san-tekka#secret-keeper`
- Type: Unit
- Text: When Defeated: You may give an Experience token to a <uq> (unique) unit.
- Status: Unreviewed

### 096 - Obi-Wan Kenobi - Protective Padawan

- Internal name: `obiwan-kenobi#protective-padawan`
- Type: Unit
- Text: When you play a Force unit (including this one): This unit gains Sentinel for this phase.
- Status: Unreviewed

### 097 - Eeth Koth - Spiritual Warrior

- Internal name: `eeth-koth#spiritual-warrior`
- Type: Unit
- Text: When Defeated: You may use the Force. If you do, put this card into play as a resource.
- Rules: A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”.
- Status: Unreviewed

### 098 - Leia Organa - Extraordinary

- Internal name: `leia-organa#extraordinary`
- Type: Unit
- Text: While this unit is in the space arena, she can't ready and gains: “Action [use the Force]: Move this unit to the ground arena and give each friendly Heroism unit +2/+2 for this phase.”
- Status: Unreviewed

### 099 - Paladin Training Corvette

- Internal name: `paladin-training-corvette`
- Type: Unit
- Text: When Played: You may give an Experience token to each of up to 3 Force units.
- Status: Unreviewed

### 100 - Kelleran Beq - The Sabered Hand

- Internal name: `kelleran-beq#the-sabered-hand`
- Type: Unit
- Text: When Played: Search the top 7 cards of your deck for a unit, reveal it, and play it. It costs 3 resources less. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 101 - Yoda - My Ally is the Force

- Internal name: `yoda#my-ally-is-the-force`
- Type: Unit
- Text: When Played: You may use the Force. If you do, heal 5 damage from a base. When you use the Force: You may deal damage to a unit equal to twice the number of units you control.
- Rules: Using the Force for Yoda's "When Played" ability triggers his second ability.
- Status: Unreviewed

### 102 - Yoda's Lightsaber

- Internal name: `yodas-lightsaber`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. When Played: You may use the Force (lose your Force token). If you do, heal 3 damage from a base.
- Status: Unreviewed

### 103 - Following the Path

- Internal name: `following-the-path`
- Type: Event
- Text: Search the top 8 cards of your deck for up to 2 Force units, reveal them, and put them on top of your deck in any order. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 104 - Luminous Beings

- Internal name: `luminous-beings`
- Type: Event
- Text: Put up to 3 Force units from your discard pile on the bottom of your deck in a random order. Give that many units +4/+4 for this phase.
- Status: Unreviewed

### 105 - Oppo Rancisis - Ancient Councilor

- Internal name: `oppo-rancisis#ancient-councilor`
- Type: Unit
- Text: This unit gains Ambush while another friendly unit has Ambush. The same is true for Grit, Hidden, Overwhelm, Saboteur, Sentinel, and Shielded. This unit gains Raid 2 while another friendly unit has Raid. The same is true for Restore.
- Status: Unreviewed

### 106 - Acclamator Assault Ship

- Internal name: `acclamator-assault-ship`
- Type: Unit
- Text: On Attack: You may give another unit +5/+5 for this phase.
- Status: Unreviewed

### 107 - Village Tender

- Internal name: `village-tender`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) Restore 1 (When this unit attacks, heal 1 damage from your base.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 108 - Malakili - Loving Rancor Keeper

- Internal name: `malakili#loving-rancor-keeper`
- Type: Unit
- Text: The first Creature unit you play each phase costs 1 resource less. If a friendly Creature unit would deal damage to a friendly unit, prevent that damage.
- Rules: If an ability preceding "if you do" would deal damage to a friendly unit, but Malakili prevents that damage from being dealt to that unit, the effect following "if you do" still resolves.
- Status: Unreviewed

### 109 - Mynock

- Internal name: `mynock`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.
- Status: Unreviewed

### 110 - Hive Defense Wing

- Internal name: `hive-defense-wing`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.)
- Status: Unreviewed

### 111 - Maz Kanata - The Light Guides

- Internal name: `maz-kanata#the-light-guides`
- Type: Unit
- Text: When Played: You may attack with a Force unit. It gets +2/+0 for this attack.
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 112 - Outer Rim Mystic

- Internal name: `outer-rim-mystic`
- Type: Unit
- Text: (none)
- Status: Finished

### 113 - Jedi Temple Guards

- Internal name: `jedi-temple-guards`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Rules: Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 114 - Kaadu

- Internal name: `kaadu`
- Type: Unit
- Text: When Played: You may give another friendly unit Overwhelm for this phase. (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.
- Status: Unreviewed

### 115 - Dagoyan Master

- Internal name: `dagoyan-master`
- Type: Unit
- Text: When Played/When Defeated: You may use the Force (lose your Force token). If you do, search the top 5 cards of your deck for a Force unit, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 116 - Relic Scavenger

- Internal name: `relic-scavenger`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 117 - Sifo-Dyas - Commissioning An Army

- Internal name: `sifodyas#commissioning-an-army`
- Type: Unit
- Text: When Defeated: Search the top 8 cards of your deck for any number of Clone units with combined cost 4 or less and discard them. (Put the other cards on the bottom of your deck in a random order.) For this phase, you may play those cards from your discard pile for free.
- Rules: "Play for free" ignores all resource costs, including the aspect penalty, but not other additional costs. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 118 - Terentatek

- Internal name: `terentatek`
- Type: Unit
- Text: While an opponent controls a Force unit, this unit gains Ambush. (When you play this unit, it may attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 119 - Hyperspace Wayfarer

- Internal name: `hyperspace-wayfarer`
- Type: Unit
- Text: (none)
- Status: Finished

### 120 - Trident Assault Ship

- Internal name: `trident-assault-ship`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.
- Status: Unreviewed

### 121 - The Purrgil King - Leading The Journey

- Internal name: `the-purrgil-king#leading-the-journey`
- Type: Unit
- Text: Restore 4 When Played: Draw a card for each friendly unit with 7 or more remaining HP.
- Status: Unreviewed

### 122 - Pillio Star Compass

- Internal name: `pillio-star-compass`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. When Played: Search the top 3 cards of your deck for a unit, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order).
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 123 - Directed by the Force

- Internal name: `directed-by-the-force`
- Type: Event
- Text: The Force is with you (create your Force token). You may play a unit from your hand (paying its cost).
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 124 - Niman Strike

- Internal name: `niman-strike`
- Type: Event
- Text: Attack with a Force unit, even if it's exhausted. It gets +1/+0 and can't attack bases for this attack.
- Rules: If you play Niman Strike, you must attack with a unit, if able. Units that can’t attack bases can still damage bases through other abilities, like Overwhelm.
- Status: Unreviewed

### 125 - The Burden of Masters

- Internal name: `the-burden-of-masters`
- Type: Event
- Text: Put a Force unit from your discard pile on the bottom of your deck. If you do, play a unit from your hand and give 2 Experience tokens to it.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 126 - Overpower

- Internal name: `overpower`
- Type: Event
- Text: Give a unit +3/+3 and Overwhelm for this phase. (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.
- Status: Unreviewed

### 127 - Rampage

- Internal name: `rampage`
- Type: Event
- Text: Each friendly Creature unit gets +2/+2 for this phase.
- Status: Unreviewed

### 128 - Protect the Pod

- Internal name: `protect-the-pod`
- Type: Event
- Text: A friendly non-Vehicle unit deals damage equal to its remaining HP to an enemy unit.
- Status: Unreviewed

### 129 - Acolyte of the Beyond

- Internal name: `acolyte-of-the-beyond`
- Type: Unit
- Text: On Attack/When Defeated: The Force is with you (create your Force token).
- Status: Unreviewed

### 130 - HK-47 - Exclamation: Die, Meatbag!

- Internal name: `hk47#exclamation-die-meatbag`
- Type: Unit
- Text: When an enemy unit is defeated: Deal 1 damage to its controller's base.
- Rules: If HK-47 is defeated simultaneously with other enemy units, you still get to deal damage.
- Status: Unreviewed

### 131 - Strikeship

- Internal name: `strikeship`
- Type: Unit
- Text: Raid 3 (This unit gets +3/+0 while attacking.) Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.
- Status: Unreviewed

### 132 - Grand Inquisitor - You're Right to Be Afraid

- Internal name: `grand-inquisitor#youre-right-to-be-afraid`
- Type: Unit
- Text: Hidden Raid 1 Other friendly Inquisitor units gain Hidden.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 133 - Purge Trooper

- Internal name: `purge-trooper`
- Type: Unit
- Text: When Played: You may deal 2 damage to a Force unit.
- Status: Unreviewed

### 134 - Heavy Missile Gunship

- Internal name: `heavy-missile-gunship`
- Type: Unit
- Text: Action [Exhaust]: Deal 2 damage to a ground unit.
- Status: Unreviewed

### 135 - Scythe - Intimidating Silhouette

- Internal name: `scythe#intimidating-silhouette`
- Type: Unit
- Text: On Attack: You may give another friendly Inquisitor unit +2/+0 for this phase.
- Status: Unreviewed

### 136 - Thralls of the Coven

- Internal name: `thralls-of-the-coven`
- Type: Unit
- Text: Raid 3 (This unit gets +3/+0 while attacking.)
- Status: Unreviewed

### 137 - Savage Opress - Imbued With Hate

- Internal name: `savage-opress#imbued-with-hate`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) When Played/When Defeated: You may use the Force (lose your Force token). If you don't, deal 9 damage to your base.
- Rules: If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.
- Status: Unreviewed

### 138 - Sith Holocron

- Internal name: `sith-holocron`
- Type: Upgrade
- Text: Attach to a Force unit. Attached unit gains: “On Attack: You may deal 2 damage to a friendly unit. If you do, this unit gets +2/+0 for this attack.”
- Rules: The attached unit can use Sith Holocron's ability to damage itself.
- Status: Unreviewed

### 139 - Battle Fury

- Internal name: `battle-fury`
- Type: Upgrade
- Text: Attached unit gains: “On Attack: Discard a card from your hand.”
- Status: Unreviewed

### 140 - Darth Maul's Lightsaber

- Internal name: `darth-mauls-lightsaber`
- Type: Upgrade
- Text: Attach to a friendly non-Vehicle unit. When Played: If attached unit is Darth Maul, you may attack with him. For this attack, he gains Overwhelm and can't attack bases.
- Rules: If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. The attached unit must be named exactly "Darth Maul" in order to benefit from the "When Played" ability. Units must be ready in order to attack. Units that can’t attack bases can still damage bases through other abilities, like Overwhelm.
- Status: Unreviewed

### 141 - Death Field

- Internal name: `death-field`
- Type: Event
- Text: Deal 2 damage to each non-Vehicle enemy unit. If you control a Force unit, draw a card.
- Status: Unreviewed

### 142 - Adi Gallia - Stern and Focused

- Internal name: `adi-gallia#stern-and-focused`
- Type: Unit
- Text: When an opponent plays an event: Deal 1 damage to that player's base.
- Status: Unreviewed

### 143 - Attuned Fyrnock

- Internal name: `attuned-fyrnock`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 144 - Jedi Starfighter

- Internal name: `jedi-starfighter`
- Type: Unit
- Text: On Attack: You may deal 1 damage to a space unit.
- Status: Unreviewed

### 145 - Jedi Knight

- Internal name: `jedi-knight`
- Type: Unit
- Text: When Played: If you have the initiative, deal 2 damage to an enemy ground unit.
- Status: Unreviewed

### 146 - Ki-Adi-Mundi - We Must Push On

- Internal name: `kiadimundi#we-must-push-on`
- Type: Unit
- Text: When Played: You may use the Force (lose your Force token). If you do, draw 2 cards.
- Status: Unreviewed

### 147 - Kit Fisto's Aethersprite - Good Hunting

- Internal name: `kit-fistos-aethersprite#good-hunting`
- Type: Unit
- Text: Saboteur When Played: You may defeat any number of upgrades on a unit.
- Status: Unreviewed

### 148 - Rey - With Palpatine's Power

- Internal name: `rey#with-palpatines-power`
- Type: Unit
- Text: When you draw this card during the action phase: If you control a Aggression leader or base, you may reveal this card from your hand. If you do, deal 2 damage to a unit and 2 damage to a base.
- Rules: If there are any other triggers waiting to resolve when you draw Rey, you must announce to your opponents that you have drawn and triggered Rey. Once drawn, Rey must be kept separate from the rest of the cards in your hand until revealed.
- Status: Unreviewed

### 149 - Mace Windu - Leaping into Action

- Internal name: `mace-windu#leaping-into-action`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) When Played: You may use the Force (lose your Force token). If you do, deal 4 damage to a unit.
- Rules: If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.
- Status: Unreviewed

### 150 - Cin Drallig - Esteemed Blademaster

- Internal name: `cin-drallig#esteemed-blademaster`
- Type: Unit
- Text: When Played: You may play a Lightsaber upgrade from your hand for free on this unit. If you do, ready him.
- Rules: "Play for free" ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 151 - Knight's Saber

- Internal name: `knights-saber`
- Type: Upgrade
- Text: Attach to a Jedi non-Vehicle unit.
- Status: Unreviewed

### 152 - Focus Determines Reality

- Internal name: `focus-determines-reality`
- Type: Event
- Text: Each friendly Force unit gains Raid 1 and Saboteur for this phase.
- Status: Unreviewed

### 153 - Paz Vizsla - Unyielding Warrior

- Internal name: `paz-vizsla#unyielding-warrior`
- Type: Unit
- Text: This unit gets +2/+0 for each damage on him.
- Status: Unreviewed

### 154 - Witch of the Mist

- Internal name: `witch-of-the-mist`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 155 - DRK-1 Probe Droid

- Internal name: `drk1-probe-droid`
- Type: Unit
- Text: When Played: You may defeat a non-<uq> (non-unique) upgrade.
- Status: Unreviewed

### 156 - Infused Brawler

- Internal name: `infused-brawler`
- Type: Unit
- Text: When Played: You may use the Force (lose your Force token). If you do, give 2 Experience tokens to this unit. When this unit completes an attack: Defeat an Experience token on it.
- Rules: A unit must survive an attack to trigger its "when this unit completes an attack" abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 157 - Cartel Interceptor

- Internal name: `cartel-interceptor`
- Type: Unit
- Text: Raid 2 (This unit gets +2/+0 while attacking.)
- Status: Unreviewed

### 158 - Hyena Bomber

- Internal name: `hyena-bomber`
- Type: Unit
- Text: When Played: If you control another Aggression unit, you may deal 2 damage to a ground unit.
- Status: Unreviewed

### 159 - Jedi In Hiding

- Internal name: `jedi-in-hiding`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) When Defeated: You may use the Force (lose your Force token). If you do, each opponent discards a card from their hand.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 160 - Merrin - Alone with the Dead

- Internal name: `merrin#alone-with-the-dead`
- Type: Unit
- Text: On Attack: You may discard a card from your hand. If you do, deal 2 damage to a unit.
- Status: Unreviewed

### 161 - Tuk'ata

- Internal name: `tukata`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 162 - Hunting Nexu

- Internal name: `hunting-nexu`
- Type: Unit
- Text: While you control another Aggression unit, this unit gains Raid 2. (It gets +2/+0 while attacking.)
- Status: Unreviewed

### 163 - Quinlan Vos - Dark Disciple

- Internal name: `quinlan-vos#dark-disciple`
- Type: Unit
- Text: On Attack: If this unit has 6 or more power, you may deal 2 damage to an enemy base.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 164 - Wampa

- Internal name: `wampa`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 165 - Asajj Ventress - Harden Your Heart

- Internal name: `asajj-ventress#harden-your-heart`
- Type: Unit
- Text: When Played/On Attack: Give another friendly Force unit +2/+0 for this phase.
- Rules: "Combat damage" is only the damage dealt during the "deal combat damage" step of an attack.
- Status: Unreviewed

### 166 - Blockade Runner

- Internal name: `blockade-runner`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) When this unit deals combat damage to a base: You may give an Experience token to this unit.
- Rules: When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 167 - Saesee Tiin - Courageous Warrior

- Internal name: `saesee-tiin#courageous-warrior`
- Type: Unit
- Text: When Played: If you have the initiative, deal 1 damage to each of up to 3 units.
- Rules: All damage dealt by Saesee Tiin's "When Played" ability is dealt simultaneously.
- Status: Unreviewed

### 168 - Ravenous Rathtar

- Internal name: `ravenous-rathtar`
- Type: Unit
- Text: (none)
- Status: Finished

### 169 - Invasion Control Ship

- Internal name: `invasion-control-ship`
- Type: Unit
- Text: Friendly Droid units gain Raid 2.
- Status: Unreviewed

### 170 - Bendu - Do You Fear the Storm?

- Internal name: `bendu#do-you-fear-the-storm`
- Type: Unit
- Text: On Attack: Deal 3 damage to each other unit.
- Rules: All damage dealt by Bendu's "On Attack" ability is dealt simultaneously.
- Status: Unreviewed

### 171 - Heavy Blaster Cannon

- Internal name: `heavy-blaster-cannon`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. When Played: You may deal 1 damage to a ground unit. Then, deal 1 damage to the same unit. Then, deal 1 damage to the same unit.
- Rules: Heavy Blaster Cannon’s When Played ability deals 3 instances of damage. If all instances of damage are dealt to a unit with a Shield token, the Shield will only prevent the first damage.
- Status: Unreviewed

### 172 - Sorcerous Blast

- Internal name: `sorcerous-blast`
- Type: Event
- Text: Use the Force (lose your Force token). If you do, deal 3 damage to a unit.
- Status: Unreviewed

### 173 - Unleash Rage

- Internal name: `unleash-rage`
- Type: Event
- Text: Use the Force (lose your Force token). If you do, give a friendly unit +3/+0 for this phase.
- Status: Unreviewed

### 174 - Ataru Onslaught

- Internal name: `ataru-onslaught`
- Type: Event
- Text: Ready a Force unit with 4 or less power.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 175 - Do or Do Not

- Internal name: `do-or-do-not`
- Type: Event
- Text: You may use the Force (lose your Force token). If you do, draw 2 cards. If you do not, draw a card.
- Status: Unreviewed

### 176 - Lightsaber Throw

- Internal name: `lightsaber-throw`
- Type: Event
- Text: Discard a Lightsaber card from your hand. If you do, deal 4 damage to a ground unit and draw a card.
- Status: Unreviewed

### 177 - Time of Crisis

- Internal name: `time-of-crisis`
- Type: Event
- Text: Each player chooses a unit they control. Deal 3 damage to each unit not chosen this way.
- Rules: All damage dealt by Time of Crisis is dealt simultaneously.
- Status: Unreviewed

### 178 - Adept of Anger

- Internal name: `adept-of-anger`
- Type: Unit
- Text: Action [Exhaust, use the Force (lose your Force token)]: Exhaust a unit.
- Status: Unreviewed

### 179 - Aurra Sing - Patient and Deadly

- Internal name: `aurra-sing#patient-and-deadly`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) Raid 2 (This unit gets +2/+0 while attacking.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 180 - Deceptive Shade

- Internal name: `deceptive-shade`
- Type: Unit
- Text: When Defeated: The next unit you play this phase gains Ambush for this phase.
- Rules: Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 181 - Banking Clan Shuttle

- Internal name: `banking-clan-shuttle`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 182 - Nihil Marauder

- Internal name: `nihil-marauder`
- Type: Unit
- Text: Raid 3 (This unit gets +3/+0 while attacking.)
- Status: Unreviewed

### 183 - Shin Hati - Overeager Apprentice

- Internal name: `shin-hati#overeager-apprentice`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) Shielded (When you play this unit, give a Shield token to her.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 184 - Second Sister - Seeking the Holocron

- Internal name: `second-sister#seeking-the-holocron`
- Type: Unit
- Text: On Attack: You may discard 2 cards from your deck. For each Force card discarded this way, ready a resource.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 185 - Baylan Skoll - Enigmatic Master

- Internal name: `baylan-skoll#enigmatic-master`
- Type: Unit
- Text: Hidden When Played: You may use the Force. If you do, return a non-leader unit that costs 4 or less to its owner's hand. Then, its owner may play it for free.
- Rules: "Play for free" ignores all resource costs, including the aspect penalty, but not other additional costs. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that return a card to hand must choose a card in play unless otherwise specified. If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 186 - Marchion Ro - Eye of the Nihil

- Internal name: `marchion-ro#eye-of-the-nihil`
- Type: Unit
- Text: Each friendly unit's Raid is doubled.
- Rules: Apply Marchion Ro's doubling ability as the last step of calculating a unit's Raid value. A unit with Raid 2 is considered to have Raid 4 while Marchion Ro is in play. If the unit then gains Raid 1, it is now considered to have Raid 6. If multiple abilities double a unit's Raid (such as a player controlling Marchion Ro and a Cloned copy), both abilities apply and the Raid value is quadrupled.
- Status: Unreviewed

### 187 - Corrupted Saber

- Internal name: `corrupted-saber`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. If attached unit is a Force unit, it gains: “On Attack: The defender gets –2/–0 for this attack.”
- Rules: (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 188 - As I Have Foreseen

- Internal name: `as-i-have-foreseen`
- Type: Event
- Text: Look at the top card of your deck. You may use the Force (lose your Force token). If you do, play that card. It costs 4 resources less.
- Status: Unreviewed

### 189 - Liberated by Darkness

- Internal name: `liberated-by-darkness`
- Type: Event
- Text: Use the Force (lose your Force token). If you do, take control of a non-leader unit. At the start of the regroup phase, its owner takes control of it.
- Status: Unreviewed

### 190 - Anakin Skywalker - Force Prodigy

- Internal name: `anakin-skywalker#force-prodigy`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) Shielded (When you play this unit, give a Shield token to him.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 191 - BD-1 - Beep Boo Boo Bweep

- Internal name: `bd1#beep-boo-boo-bweep`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) When Played: Choose another friendly unit. While this unit is in play, the chosen unit gets +1/+0 and gains Saboteur.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked. If BD-1 is captured and then rescued, his "When Played" effect does not resume. Until BD-1 leaves play, the friendly unit gets +1/+0 and Saboteur. This effect is not changed if an opponent takes control of BD-1.
- Status: Unreviewed

### 192 - N-1 Starfighter

- Internal name: `n1-starfighter`
- Type: Unit
- Text: (none)
- Status: Finished

### 193 - Youngling Padawan

- Internal name: `youngling-padawan`
- Type: Unit
- Text: When Played: The Force is with you (create your Force token).
- Status: Unreviewed

### 194 - J-Type Nubian Starship

- Internal name: `jtype-nubian-starship`
- Type: Unit
- Text: When Played: Draw a card. When Defeated: Discard a card from your hand.
- Status: Unreviewed

### 195 - Vernestra Rwoh - Precocious Knight

- Internal name: `vernestra-rwoh#precocious-knight`
- Type: Unit
- Text: When Played: You may use the Force (lose your Force token). If you do, ready this unit.
- Status: Unreviewed

### 196 - Jedi Sentinel

- Internal name: `jedi-sentinel`
- Type: Unit
- Text: While the Force is with you, this unit gains Sentinel. (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 197 - Qui-Gon Jinn's Aethersprite - Guided by the Force

- Internal name: `quigon-jinns-aethersprite#guided-by-the-force`
- Type: Unit
- Text: On Attack: The next time you use a “When Played” ability this phase, you may use that ability again.
- Rules: Any ability whose trigger starts with "When played…" is considered a "When Played" ability. Once it triggers, the Aethersprite's "On Attack" ability lets you reuse the next "When Played" ability you use even if it is defeated.
- Status: Unreviewed

### 198 - Stinger Mantis - Where Are We Going?

- Internal name: `stinger-mantis#where-are-we-going`
- Type: Unit
- Text: When Played: You may deal 2 damage to an exhausted unit.
- Status: Unreviewed

### 199 - Depa Billaba - A Higher Purpose

- Internal name: `depa-billaba#a-higher-purpose`
- Type: Unit
- Text: Ambush (When you play this unit, she may attack an enemy unit.) Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Rules: Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 200 - Qui-Gon Jinn - The Negotiations Will Be Short

- Internal name: `quigon-jinn#the-negotiations-will-be-short`
- Type: Unit
- Text: Ambush When Defeated: You may choose a non-leader ground unit. Its owner puts it on the top or bottom of their deck.
- Rules: Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready. The owner of the unit chosen with Qui-Gon's "When Defeated" ability decides whether to put it on the top or on the bottom of their deck.
- Status: Unreviewed

### 201 - Qui-Gon Jinn's Lightsaber

- Internal name: `quigon-jinns-lightsaber`
- Type: Upgrade
- Text: Attach to a friendly non-Vehicle unit. When Played: If attached unit is Qui-Gon Jinn, you may exhaust any number of units with combined cost 6 or less.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 202 - Mind Trick

- Internal name: `mind-trick`
- Type: Event
- Text: Exhaust any number of units with a combined power of 4 or less. If you control a Force unit, those units lose all abilities and can't gain abilities for this phase.
- Rules: Abilities that refer to a card’s power include temporary modifiers. (ERRATA) Templating update: “Lose all abilities and can't gain abilities” becomes “lose all abilities”.
- Status: Unreviewed

### 203 - Premonition of Doom

- Internal name: `premonition-of-doom`
- Type: Event
- Text: The next time you take the initiative this phase, exhaust all units.
- Status: Unreviewed

### 204 - Zuckuss - The Findsman

- Internal name: `zuckuss#the-findsman`
- Type: Unit
- Text: On Attack: Name a card, then discard the top card of the defending player's deck. If a card with that name is discarded, this unit gets +4/+0 for this attack.
- Rules: Abilities that refer to a card’s "name" do not include the subtitle of the card.
- Status: Unreviewed

### 205 - Force Speed

- Internal name: `force-speed`
- Type: Event
- Text: Attack with a unit. For this attack, it gains: “On Attack: Return any number of non-<uq> (non-unique) upgrades attached to the defender to their owners' hands.”
- Rules: If you play Forse Speed, you must attack with a unit, if able. Units must be ready in order to attack. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 206 - Babu Frik - Heyyy!

- Internal name: `babu-frik#heyyy`
- Type: Unit
- Text: Action [Exhaust]: You may attack with a friendly Droid unit. For this attack, it deals damage equal to its remaining HP instead of its power.
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 207 - Loth-Cat

- Internal name: `lothcat`
- Type: Unit
- Text: When Played/When Defeated: You may exhaust a ground unit.
- Status: Unreviewed

### 208 - Mysterious Hermit

- Internal name: `mysterious-hermit`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 209 - Tusken Tracker

- Internal name: `tusken-tracker`
- Type: Unit
- Text: Raid 2 (This unit gets +2/+0 while attacking.) When Played: Each enemy unit loses Hidden for this phase.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked. Only units in play when Tusken Tracker's "When Played" ability resolves lose Hidden.
- Status: Unreviewed

### 210 - Charging Phillak

- Internal name: `charging-phillak`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) Hidden (This unit can't be attacked if it was played this phase.)
- Rules: Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready. If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 211 - Dooku - It Is Too Late

- Internal name: `dooku#it-is-too-late`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) When Played: Each friendly unit with Hidden can't be attacked for this phase.
- Rules: Dooku's "When Played" ability affects each friendly unit with Hidden, even if it entered play in a previous round. If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 212 - Life Wind Sage

- Internal name: `life-wind-sage`
- Type: Unit
- Text: While an enemy unit is exhausted, this unit gains Raid 2. (This unit gets +2/+0 while attacking.)
- Status: Unreviewed

### 213 - The Legacy Run - Doomed Debris

- Internal name: `the-legacy-run#doomed-debris`
- Type: Unit
- Text: When Defeated: Deal 6 damage divided as you choose among enemy units.
- Rules: All damage dealt by The Legacy Run's "When Defeated" ability is dealt simultaneously. You can choose to assign more damage to a unit than it has remaining HP.
- Status: Unreviewed

### 214 - Sorcerers of Tund

- Internal name: `sorcerers-of-tund`
- Type: Unit
- Text: Shielded (When you play this card, give a Shield token to it.)
- Status: Unreviewed

### 215 - Ascension Cable

- Internal name: `ascension-cable`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains Saboteur. (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 216 - Disturbance in the Force

- Internal name: `disturbance-in-the-force`
- Type: Event
- Text: If a friendly unit left play this phase, the Force is with you (create your Force token) and you may give a Shield token to a unit.
- Status: Unreviewed

### 217 - Force Slow

- Internal name: `force-slow`
- Type: Event
- Text: Give an exhausted unit –8/–0 for this phase.
- Status: Unreviewed

### 218 - Impossible Escape

- Internal name: `impossible-escape`
- Type: Event
- Text: You may either exhaust a friendly unit or use the Force (lose your Force token). If you do either, exhaust an enemy unit and draw a card.
- Status: Unreviewed

### 219 - Psychometry

- Internal name: `psychometry`
- Type: Event
- Text: Choose another card in your discard pile. Search the top 5 cards of your deck for a card that shares a trait with the chosen card, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 220 - Shien Flurry

- Internal name: `shien-flurry`
- Type: Event
- Text: Play a Force unit from your hand (paying its cost). It gains Ambush for this phase. The next time it would be dealt damage this phase, prevent 2 of that damage.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 221 - Trust Your Instincts

- Internal name: `trust-your-instincts`
- Type: Event
- Text: Use the Force. If you do, attack with a unit. It gets +2/+0 for this attack and deals its combat damage before the defender. (If the defender is defeated, it deals no combat damage.)
- Rules: "Combat damage" is only the damage dealt during the "deal combat damage" step of an attack. If a unit deals combat damage first, and the defender is defeated by that damage, it does not deal combat damage back. If it survives and has Grit, it deals bonus damage from Grit when dealing combat damage back. If you play Trust Your Instincts and use the Force, you must attack with a unit, if able. Units must be ready in order to attack. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 222 - A Precarious Predicament

- Internal name: `a-precarious-predicament`
- Type: Event
- Text: Return an enemy non-leader unit to its owner's hand unless its controller says, “It could be worse.” If they do, you may play a card named It's Worse from your hand or resources for free.
- Rules: "Play for free" ignores all resource costs, including the aspect penalty, but not other additional costs. Abilities that return a card to hand must choose a card in play unless otherwise specified. You must choose a unit to return before your opponent chooses whether to say "it could be worse." Your opponent may opt to use another method instead of saying "it could be worse" as long as they clearly indicate which option they are choosing.
- Status: Unreviewed

### 223 - Force Illusion

- Internal name: `force-illusion`
- Type: Event
- Text: Exhaust an enemy unit. A friendly unit gains Sentinel for this phase.
- Status: Unreviewed

### 224 - Pounce

- Internal name: `pounce`
- Type: Event
- Text: Attack with a Creature unit. It gets +4/+0 for this attack.
- Rules: If you play Pounce, you must attack with a Creature unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 225 - Three Lessons

- Internal name: `three-lessons`
- Type: Event
- Text: Play a unit from your hand (paying its cost). It gains Hidden for this phase. Give an Experience token and a Shield token to it.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 226 - Tip the Scale

- Internal name: `tip-the-scale`
- Type: Event
- Text: Look at an opponent's hand and discard a non-unit card from it.
- Status: Unreviewed

### 227 - The Will of the Force

- Internal name: `the-will-of-the-force`
- Type: Event
- Text: Return a non-leader unit to its owner's hand. You may use the Force (lose your Force token). If you do, that player discards a random card from their hand.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 228 - Forged Starfighter

- Internal name: `forged-starfighter`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) Raid 1 (This unit gets +1/+0 while attacking.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 229 - Kylo Ren - I Know Your Story

- Internal name: `kylo-ren#i-know-your-story`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) When you play an upgrade on this unit: You may use the Force (lose your Force token). If you do, draw a card.
- Rules: Attaching an upgrade already in play or creating and attaching a token upgrade do not trigger Kylo Ren's ability. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.
- Status: Unreviewed

### 230 - Fallen Jedi

- Internal name: `fallen-jedi`
- Type: Unit
- Text: (none)
- Status: Finished

### 231 - Darth Tyranus - Servant of Sidious

- Internal name: `darth-tyranus#servant-of-sidious`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to him.) While the Force is with you, this unit gains Ambush. (When you play this unit, he may attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 232 - Sandtrooper Cavalry

- Internal name: `sandtrooper-cavalry`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 233 - Scimitar - Sith Infiltrator

- Internal name: `scimitar#sith-infiltrator`
- Type: Unit
- Text: While this unit is damaged, it gets +3/+0.
- Status: Unreviewed

### 234 - Darth Malak - Covetous Apprentice

- Internal name: `darth-malak#covetous-apprentice`
- Type: Unit
- Text: Overwhelm When Played: If you control a Sith leader unit, you may ready this unit.
- Rules: If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.
- Status: Unreviewed

### 235 - HK-87 Assassin Droid

- Internal name: `hk87-assassin-droid`
- Type: Unit
- Text: When Defeated: Deal 2 damage to each ground unit.
- Rules: All damage dealt by HK-87 Assassin Droid's "When Defeated" ability is dealt simultaneously.
- Status: Unreviewed

### 236 - Army of the Dead

- Internal name: `army-of-the-dead`
- Type: Unit
- Text: (none)
- Status: Finished

### 237 - The Son - Embodiment of Darkness

- Internal name: `the-son#embodiment-of-darkness`
- Type: Unit
- Text: While the Force is with you, each friendly unit gets +2/+0.
- Status: Unreviewed

### 238 - Darth Revan's Lightsabers

- Internal name: `darth-revans-lightsabers`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. If attached unit is a Sith, it gains Grit.
- Status: Unreviewed

### 239 - Consumed by the Dark Side

- Internal name: `consumed-by-the-dark-side`
- Type: Event
- Text: Give 2 Experience tokens to a unit, then deal 2 damage to it.
- Status: Unreviewed

### 240 - Flight of the Inquisitor

- Internal name: `flight-of-the-inquisitor`
- Type: Event
- Text: You may return a Force unit and a Lightsaber upgrade from your discard pile to your hand.
- Status: Unreviewed

### 241 - In the Shadows

- Internal name: `in-the-shadows`
- Type: Event
- Text: Give an Experience token to each of up to 3 friendly units with Hidden.
- Status: Unreviewed

### 242 - Refugee of The Path

- Internal name: `refugee-of-the-path`
- Type: Unit
- Text: When Played: You may give a Shield token to a unit with Sentinel.
- Status: Unreviewed

### 243 - Caretaker Matron

- Internal name: `caretaker-matron`
- Type: Unit
- Text: Action [Exhaust]: If you played a Force card this phase, draw a card.
- Rules: Caretaker Matron's ability can still be used as an action even if you haven't played a Force card this phase (but you don't draw a card).
- Status: Unreviewed

### 244 - Jedi Vector

- Internal name: `jedi-vector`
- Type: Unit
- Text: This unit gets +1/+0 if you control another Jedi unit and +1/+0 if you control a Lightsaber upgrade.
- Status: Unreviewed

### 245 - Vulptex

- Internal name: `vulptex`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 246 - Grogu - Mysterious Child

- Internal name: `grogu#mysterious-child`
- Type: Unit
- Text: Hidden Action [Exhaust]: Heal up to 2 damage from a unit. If you do, deal that much damage to a unit.
- Rules: Grogu's ability can still be used as an action even if you don't or can't heal damage from a unit (but you don't deal any damage to a unit). If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 247 - Gungan Warrior

- Internal name: `gungan-warrior`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.) Restore 1 (When this unit attacks, heal 1 damage from your base.)
- Status: Unreviewed

### 248 - Jocasta Nu - The Gift of Knowledge

- Internal name: `jocasta-nu#the-gift-of-knowledge`
- Type: Unit
- Text: When Played: You may attach a friendly upgrade on a friendly unit to a different eligible unit.
- Rules: You can use Jocasta's ability to attach an upgrade to her.
- Status: Unreviewed

### 249 - Luke Skywalker - A Hero's Beginning

- Internal name: `luke-skywalker#a-heros-beginning`
- Type: Unit
- Text: When you play another <uq> (unique) unit: You may use the Force (lose your Force token). If you do, give an Experience token and a Shield token to this unit.
- Status: Unreviewed

### 250 - Medical Frigate

- Internal name: `medical-frigate`
- Type: Unit
- Text: On Attack: You may heal 2 damage from another unit.
- Status: Unreviewed

### 251 - Blue Squadron Assault Wing

- Internal name: `blue-squadron-assault-wing`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.)
- Status: Unreviewed

### 252 - The Daughter - Embodiment of Light

- Internal name: `the-daughter#embodiment-of-light`
- Type: Unit
- Text: When damage is dealt to your base: You may use the Force (lose your Force token). If you do, heal 2 damage from your base.
- Status: Unreviewed

### 253 - Longbeam Cruiser

- Internal name: `longbeam-cruiser`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.)
- Status: Unreviewed

### 254 - Porg

- Internal name: `porg`
- Type: Unit
- Text: (none)
- Status: Finished

### 255 - Curious Flock

- Internal name: `curious-flock`
- Type: Unit
- Text: When Played: Pay up to 6 resources. For each resource paid this way, give an Experience token to this unit.
- Rules: Curious Flock's "When Played" ability is not reduced by effects that reduce the cost of cards.
- Status: Unreviewed

### 256 - Gifted Urchin

- Internal name: `gifted-urchin`
- Type: Unit
- Text: (none)
- Status: Finished

### 257 - Kowakian Monkey-Lizard

- Internal name: `kowakian-monkeylizard`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as "When Played" abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 258 - Peli Motto - I Should Charge You More

- Internal name: `peli-motto#i-should-charge-you-more`
- Type: Unit
- Text: On Attack: Give an Experience token to a friendly Vehicle or Droid unit.
- Status: Unreviewed

### 259 - Ravening Gundark

- Internal name: `ravening-gundark`
- Type: Unit
- Text: When Played: Deal 1 damage to a ground unit.
- Status: Unreviewed

### 260 - The Father - Maintaining Balance

- Internal name: `the-father#maintaining-balance`
- Type: Unit
- Text: When you use the Force: You may deal 1 damage to this unit. If you do, the Force is with you.
- Rules: The Father's ability triggers when you use the Force but only resolves after any current ability is finished resolving.
- Status: Unreviewed

### 261 - Constructed Lightsaber

- Internal name: `constructed-lightsaber`
- Type: Upgrade
- Text: Attach to a Force unit. If attached unit is a Heroism unit, it gains Restore 2. If attached unit is a Villainy unit, it gains Raid 2. If attached unit is a non-Heroism, non-Villainy unit, it gains Sentinel.
- Status: Unreviewed

### 262 - Go Into Hiding

- Internal name: `go-into-hiding`
- Type: Event
- Text: Choose a unit. It can't be attacked this phase (unless it has Sentinel).
- Rules: If a unit that can't be attacked gains Sentinel, it can be attacked.
- Status: Unreviewed

### 263 - Last Words

- Internal name: `last-words`
- Type: Event
- Text: If a friendly unit was defeated this phase, give 2 Experience tokens to a unit.
- Status: Unreviewed

### 264 - It's Worse

- Internal name: `its-worse`
- Type: Event
- Text: Defeat a non-leader unit.
- Status: Unreviewed

## Tokens

### Token - The Force

- Internal name: `the-force`
- Type: Token
- Text: (The Force is with you. When you use the Force, remove this token from play.)
- Rules: An individual player may only control one Force token at a time. If a player already controls a Force token when they are instructed to create their Force token, nothing happens. Each player may create their own Force token. It is not shared between players.
- Status: Unreviewed

