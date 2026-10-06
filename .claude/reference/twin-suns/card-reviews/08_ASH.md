# 08_ASH (ASH) card review

263 cards + 2 tokens, in set order. Review against the official card text (`test/json/Card/`), not our implementations.

### 001 - The Armorer - Steel Shapes Us

- Internal name: `the-armorer#steel-shapes-us`
- Type: Leader
- Text: Action [Exhaust]: Play an upgrade from your resources on a unit that entered play this phase (paying its cost). If you do, resource the top card of your deck.
- Deployed: When Attack Ends: You may play an upgrade from your resources on a friendly unit. If you do, resource the top card of your deck.
- Rules: You can use The Armorer's ability to play any card that can be played as an upgrade, including Pilots. You may use the upgrade you play using The Armorer's ability to help pay for its cost, since it’s still a resource while paying costs. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. When Attack Ends abilities trigger at the same time as units deal combat damage. The Armorer does not need to survive the attack in order for you to play an upgrade, though you can't play an upgrade on her if she is defeated. Resources enter play exhausted.
- Status: Unreviewed

### 002 - Fennec Shand - Ready for War

- Internal name: `fennec-shand#ready-for-war`
- Type: Leader
- Text: Action [1 resource, Exhaust, exhaust a friendly unit]: Play a unit from your hand (paying its cost). It enters play ready.
- Deployed: Saboteur Action [1 resource, exhaust a friendly unit]: Play a unit from your hand. It enters play ready.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 003 - Baylan Skoll - Power Beyond Dream

- Internal name: `baylan-skoll#power-beyond-dream`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Give a friendly unit +2/+2 for this phase if it's the only unit you control in its arena.
- Deployed: On Attack: You may give a friendly unit +2/+2 and Sentinel for this phase if it's the only non-leader unit you control in its arena. (Enemy units in its arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 004 - Grand Admiral Thrawn - Victory is Mine

- Internal name: `grand-admiral-thrawn#victory-is-mine`
- Type: Leader
- Text: Action [Exhaust]: Attack with a unit. It gains Restore 2 for this attack if you control the same number of units as the defending player.
- Deployed: Restore 2 On Attack: If you control more units than the defending player, you may defeat a non-leader unit they control.
- Rules: If you use Thrawn’s leader ability, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 005 - Luke Skywalker - I Can Save Him

- Internal name: `luke-skywalker#i-can-save-him`
- Type: Leader
- Text: When a friendly unit's attack ends: You may exhaust this leader. If you do, heal 1 damage from that unit.
- Deployed: When a friendly unit's attack ends: Heal 2 damage from that unit or from your base.
- Rules: When Attack Ends abilities trigger at the same time as units deal combat damage. If the attacking unit is defeated by combat damage, you cannot heal it.
- Status: Unreviewed

### 006 - Sabine Wren - Bargaining on Belief

- Internal name: `sabine-wren#bargaining-on-belief`
- Type: Leader
- Text: Action [Exhaust]: An opponent gives 2 Advantage tokens to a unit they control. If they do, the next unit you play this phase gains Shielded for this phase. (When you play that unit, give a Shield token to it.)
- Deployed: On Attack: The next unit you play this phase gains Shielded for this phase.
- Rules: Once Sabine's “On Attack” ability resolves, it remains active even if she is defeated before you play your next unit. If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 007 - Grand Admiral Sloane - Holding the Empire Together

- Internal name: `grand-admiral-sloane#holding-the-empire-together`
- Type: Leader
- Text: Action [Exhaust]: Choose one: Give each ground unit Sentinel and Overwhelm for this phase. Give each space unit Sentinel and Overwhelm for this phase.
- Deployed: Overwhelm Each other friendly unit gains Overwhelm and Sentinel.
- Rules: Sloane's leader ability gives Sentinel and Overwhelm to each ground or space unit when the ability is used. Units that enter play after the ability is used don't gain Sentinel or Overwhelm. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 008 - Moff Gideon - Indomitable Warlord

- Internal name: `moff-gideon#indomitable-warlord`
- Type: Leader
- Text: Action [Exhaust]: If a friendly Imperial unit was defeated this phase, play a unit from your hand. It costs 1 resource less.
- Deployed: This unit gains each of the following keywords if it is on an Imperial unit in your discard pile: Ambush, Grit, Hidden, Overwhelm, Saboteur, Sentinel, Shielded, Support.
- Rules: Moff Gideon’s leader ability still can be used as an action even if no friendly Imperial units were defeated this phase (but you don't play a card). Moff Gideon does not gain conditional keywords on Imperial units in your discard pile, even if the condition is met. If an Imperial unit in your discard pile has Support, Moff Gideon's leader unit gains ""Support"" but not the unit's other abilities.
- Status: Unreviewed

### 009 - Ahsoka Tano - Trust in the Force

- Internal name: `ahsoka-tano#trust-in-the-force`
- Type: Leader
- Text: Action [Exhaust]: Choose a unit with less power than a friendly unit. It gets +2/+0 for this phase.
- Deployed: Support (When you deploy this leader, you may attack with another unit. It gains this unit's other abilities for this attack.) On Attack: You may give a unit with less power than this unit +2/+0 for this phase.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 010 - Bo-Katan Kryze - Reclaiming Mandalore

- Internal name: `bokatan-kryze#reclaiming-mandalore`
- Type: Leader
- Text: Action [2 resources, Exhaust]: If you control a unit in each arena, create a Mandalorian token.
- Deployed: Other friendly Mandalorian units get +1/+0. On Attack: If you control a unit in each arena, create a Mandalorian token.
- Rules: Bo-Katan’s leader ability still can be used as an action even if you don't control a unit in each arena (but you don't create a token).
- Status: Unreviewed

### 011 - Cad Bane - Still Faster than You

- Internal name: `cad-bane#still-faster-than-you`
- Type: Leader
- Text: Action [Exhaust]: Deal 1 damage to a unit with 2 or more remaining HP.
- Deployed: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) On Attack: You may deal 1 damage to a unit with 2 or more remaining HP.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 012 - Vane - Quarrelsome Pirate

- Internal name: `vane#quarrelsome-pirate`
- Type: Leader
- Text: Action [Exhaust, defeat a friendly upgrade]: Deal 2 damage to a base.
- Deployed: On Attack: You may defeat a friendly upgrade. If you do, deal 2 damage to the defending unit or a base.
- Rules: A friendly upgrade is any upgrade you put into play or any token upgrade on a friendly unit.
- Status: Unreviewed

### 013 - Ezra Bridger - It's Now or Never

- Internal name: `ezra-bridger#its-now-or-never`
- Type: Leader
- Text: When a friendly unit's attack ends: If it dealt 3 or more combat damage to a base, you may exhaust this leader. If you do, give an Advantage token to a different unit.
- Deployed: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) When a friendly unit's attack ends: If it dealt 3 or more combat damage to a base, you may give an Advantage token to a different unit.
- Rules: When Attack Ends abilities trigger at the same time as units deal combat damage. The attacking unit doesn't need to survive in order to give an Advantage token, so long as it dealt 3 or more combat damage to a base. Ezra's unit ability can give an Advantage token to himself when another friendly unit's attack ends. “Combat damage” is only the damage dealt during the “End attack” step of an attack.
- Status: Unreviewed

### 014 - The Mandalorian - We Can't Keep Running

- Internal name: `the-mandalorian#we-cant-keep-running`
- Type: Leader
- Text: When you take the initiative: You may pay 1 resource. If you do, draw a card.
- Deployed: Support (When you deploy this leader, you may attack with another unit. It gains this unit's other abilities for this attack.) On Attack: If you have the initiative, you may draw a card.
- Status: Unreviewed

### 015 - Emperor Palpatine - According to My Design

- Internal name: `emperor-palpatine#according-to-my-design`
- Type: Leader
- Text: Action [Exhaust]: Choose an exhausted friendly unit. Give an Advantage token to it for each other friendly unit.
- Deployed: On Attack: You may choose another exhausted friendly unit. If you do, give an Advantage token to it for each other friendly unit.
- Rules: Emperor Palpatine's ability gives Advantage tokens equal to the number of friendly units minus 1.
- Status: Unreviewed

### 016 - Shin Hati - Eager Adversary

- Internal name: `shin-hati#eager-adversary`
- Type: Leader
- Text: When a friendly unit's attack ends: You may exhaust this leader. If you do, exhaust a unit that costs less than the amount of combat damage dealt to a base this attack.
- Deployed: When a friendly unit's attack ends: You may exhaust a unit that costs less than the amount of combat damage dealt to a base this attack. Use this ability only once each round.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. “Combat damage” is only the damage dealt during the “End attack” step of an attack.
- Status: Unreviewed

### 017 - Greef Karga - Gracious Magistrate

- Internal name: `greef-karga#gracious-magistrate`
- Type: Leader
- Text: When you play or create a unit: You may exhaust this leader. If you do, give an Advantage token to that unit.
- Deployed: When you play or create a unit: Give an Advantage token to that unit.
- Status: Unreviewed

### 018 - Grogu - Charming Companion

- Internal name: `grogu#charming-companion`
- Type: Leader
- Deployed: While another friendly unit is defending, it gets +1/+0. While another friendly unit is attacking, the defending unit gets –1/–0.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Playing a pilot as an upgrade does not count as playing a unit, so it would not let you deploy Grogu.
- Status: Unreviewed

### 019 - Fortress of the Great Mothers

- Internal name: `fortress-of-the-great-mothers`
- Type: Base
- Text: (none)
- Status: Finished

### 020 - Nevarro City, Restored

- Internal name: `nevarro-city-restored`
- Type: Base
- Text: (none)
- Status: Finished

### 021 - Emperor's Throne Room

- Internal name: `emperors-throne-room`
- Type: Base
- Text: (none)
- Status: Finished

### 022 - Kryze Castle

- Internal name: `kryze-castle`
- Type: Base
- Text: (none)
- Status: Finished

### 023 - Ancient Henge

- Internal name: `ancient-henge`
- Type: Base
- Text: (none)
- Status: Finished

### 024 - Dragonsnake Bog

- Internal name: `dragonsnake-bog`
- Type: Base
- Text: (none)
- Status: Finished

### 025 - Emperor's Observatory

- Internal name: `emperors-observatory`
- Type: Base
- Text: (none)
- Status: Finished

### 026 - Freetown

- Internal name: `freetown`
- Type: Base
- Text: (none)
- Status: Finished

### 027 - Enoch - Solemn Servant

- Internal name: `enoch#solemn-servant`
- Type: Unit
- Text: When Defeated: You may deal up to 6 damage to your base. The next unit you play this phase costs 1 resource less for every 2 damage dealt this way.
- Rules: If Enoch's ability's damage to your base is prevented, then there is no cost reduction.
- Status: Unreviewed

### 028 - Paz Vizsla - For a Brighter Future

- Internal name: `paz-vizsla#for-a-brighter-future`
- Type: Unit
- Text: Sentinel When Defeated: If this unit wasn't defeated by combat damage, create 2 Mandalorian tokens.
- Rules: “Combat damage” is only the damage dealt during the “End attack” step of an attack.
- Status: Unreviewed

### 029 - Scorpenek Annihilator Droid

- Internal name: `scorpenek-annihilator-droid`
- Type: Unit
- Text: Sentinel Shielded Overwhelm
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 030 - Marrok - Mysterious Warrior

- Internal name: `marrok#mysterious-warrior`
- Type: Unit
- Text: Sentinel While this unit is upgraded, he loses Sentinel and gains Saboteur.
- Rules: Losing Sentinel while upgraded means Marrok also can't gain Sentinel while upgraded.
- Status: Unreviewed

### 031 - Hera Syndulla - Renegade General

- Internal name: `hera-syndulla#renegade-general`
- Type: Unit
- Text: When Attack Ends: If this unit dealt combat damage to a base, heal that much damage from your base.
- Rules: “Combat damage” is only the damage dealt during the “End attack” step of an attack. When Attack Ends abilities trigger at the same time as units deal combat damage. Hera does not need to survive the attack in order to heal damage from your base.
- Status: Unreviewed

### 032 - Rancor Keeper

- Internal name: `rancor-keeper`
- Type: Unit
- Text: When a friendly unit is dealt damage and survives: Deal 1 damage to any number of bases. Use this ability only once each round.
- Rules: All damage dealt by Rancor Keeper's ability is dealt simultaneously.
- Status: Unreviewed

### 033 - Grand Admiral Thrawn - Orchestrating His Return

- Internal name: `grand-admiral-thrawn#orchestrating-his-return`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) When Attack Ends: If the defending unit was defeated, ready this unit.
- Rules: When Attack Ends abilities trigger at the same time as units deal combat damage. If you use Thrawn's Support ability to attack with another unit and the defending unit is defeated by that attack, the attacking unit readies.
- Status: Unreviewed

### 034 - Wicket - Yub Nub!

- Internal name: `wicket#yub-nub`
- Type: Unit
- Text: Saboteur This unit can't attack bases.
- Rules: Units that can’t attack bases can still damage bases through other abilities, like Overwhelm.
- Status: Unreviewed

### 035 - Tatooine Repulsor Train

- Internal name: `tatooine-repulsor-train`
- Type: Unit
- Text: This unit can't be attacked while you control 2 or more exhausted units (unless it gains Sentinel). On Attack: Deal 2 damage to a ground unit for each friendly exhausted unit.
- Rules: (ERRATA) On Attack: Choose a ground unit. Deal 2 damage to it for each friendly exhausted unit. If Tatooine Repulsor Train gains Sentinel, it can be attacked, even while you control 2 or more exhausted units.
- Status: Unreviewed

### 036 - Rukh - From the Shadows

- Internal name: `rukh#from-the-shadows`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) When Attack Ends: If the defending unit was defeated, you may give 3 Advantage tokens to a unit.
- Rules: When Attack Ends abilities trigger at the same time as units deal combat damage. Rukh (or the supported unit) does not need to survive the attack in order to give Advantage tokens, so long as the defending unit was defeated.
- Status: Unreviewed

### 037 - Red Leader - Strike the Reactor

- Internal name: `red-leader#strike-the-reactor`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) This unit may attack units in either arena.
- Status: Unreviewed

### 038 - Purrgil Ultra

- Internal name: `purrgil-ultra`
- Type: Unit
- Text: When Played/When Defeated: You may return another friendly non-leader unit to its owner's hand. If you do, deal damage to a unit equal to the returned unit's cost.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 039 - Baylan Skoll - Fallen Jedi

- Internal name: `baylan-skoll#fallen-jedi`
- Type: Unit
- Text: Overwhelm When Played/When Attack Ends: If an enemy base was damaged this phase, give an Advantage token to a unit. If a friendly upgrade was defeated this phase, you may exhaust a unit.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. When Attack Ends abilities trigger at the same time as units deal combat damage. Baylan does not need to survive the attack in order to resolve his ability, so long as the other conditions are met.
- Status: Unreviewed

### 040 - Poe Dameron - I'll Come Back For You

- Internal name: `poe-dameron#ill-come-back-for-you`
- Type: Unit
- Text: All units lose Sentinel.
- Rules: All units lose Sentinel and can't gain Sentinel while Poe is in play.
- Status: Unreviewed

### 041 - Outcast - Mercenary Starship

- Internal name: `outcast#mercenary-starship`
- Type: Unit
- Text: When a friendly unit enters play (including this one): It gets +1/+0 for this phase.
- Status: Unreviewed

### 042 - Jabba the Hutt - Eminence of Tatooine

- Internal name: `jabba-the-hutt#eminence-of-tatooine`
- Type: Unit
- Text: Restore 2 When Played: You may return an upgrade to its owner's hand. If it's returned to your hand, you may play it for free.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 043 - Corona Four - Justice for Alderaan

- Internal name: `corona-four#justice-for-alderaan`
- Type: Unit
- Text: On Attack: You may give a unit –2/–0 for this phase. When Defeated: You may defeat a non‑leader unit with 0 power.
- Rules: Abilities that refer to a card’s power include temporary modifiers. Power cannot be reduced below 0.
- Status: Unreviewed

### 044 - Barriss Offee - Redeeming Herself

- Internal name: `barriss-offee#redeeming-herself`
- Type: Unit
- Text: When Played: Heal up to 2 damage from a unit. Give an Advantage token to it for each damage healed this way.
- Status: Unreviewed

### 045 - Reanimated Night Trooper

- Internal name: `reanimated-night-trooper`
- Type: Unit
- Text: When Defeated: Look at the top card of a deck. You may discard it.
- Status: Unreviewed

### 046 - Scion Shuttle - At Morgan's Bidding

- Internal name: `scion-shuttle#at-morgans-bidding`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) While this unit is attacking, the defending unit gets –1/–1.
- Status: Unreviewed

### 047 - Gar Saxon - Coveting Power

- Internal name: `gar-saxon#coveting-power`
- Type: Unit
- Text: When you play an upgrade on this unit: You may create a Mandalorian token. Use this ability only once each round.
- Rules: Attaching a token upgrade is not considered playing an upgrade and does not trigger Gar Saxon's ability.
- Status: Unreviewed

### 048 - Imperial Armored Commando

- Internal name: `imperial-armored-commando`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 049 - Shin Hati - Going Somewhere?

- Internal name: `shin-hati#going-somewhere`
- Type: Unit
- Text: While this is the only friendly non-leader ground unit, she gains Sentinel. (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 050 - Morgan Elsbeth - Life Abandoned

- Internal name: `morgan-elsbeth#life-abandoned`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) When Defeated: You may give a unit –2/–2 for this phase.
- Status: Unreviewed

### 051 - Reinforcing Light Cruiser

- Internal name: `reinforcing-light-cruiser`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.) When Played: You may exhaust a unit.
- Status: Unreviewed

### 052 - Chimaera - A Frightening Reality

- Internal name: `chimaera#a-frightening-reality`
- Type: Unit
- Text: When Played: You may choose a friendly unit and an enemy non-leader unit. If you do, defeat those units. When an enemy unit is defeated: Heal 2 damage from your base.
- Status: Unreviewed

### 053 - Pre Vizsla - Strong-Willed Ruler

- Internal name: `pre-vizsla#strongwilled-ruler`
- Type: Unit
- Text: When Played: Defeat any number of non‑leader units with a total of 6 or less remaining HP. Create a Mandalorian token for each unit defeated this way.
- Status: Unreviewed

### 054 - Pointless to Resist

- Internal name: `pointless-to-resist`
- Type: Upgrade
- Text: Attached unit gets –3/–0 while attacking a base.
- Status: Unreviewed

### 055 - Blade of Talzin - A Gift of Shadows

- Internal name: `blade-of-talzin#a-gift-of-shadows`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. When Defeated: If this upgrade was on a friendly Night unit, return this upgrade from your discard pile to your hand.
- Status: Unreviewed

### 056 - Huyang - Your Aptitude Falls Short

- Internal name: `huyang#your-aptitude-falls-short`
- Type: Unit
- Text: On Attack: You may give an upgraded unit –4/–0 for this phase.
- Status: Unreviewed

### 057 - Lothal E-Wing

- Internal name: `lothal-ewing`
- Type: Unit
- Text: While an enemy unit is upgraded, this unit gains Restore 2. (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 058 - Duchess's Protector

- Internal name: `duchesss-protector`
- Type: Unit
- Text: When Defeated: Create a Mandalorian token.
- Status: Unreviewed

### 059 - Leia Organa - Vigilant for Danger

- Internal name: `leia-organa#vigilant-for-danger`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) On Attack: You may deal 1 damage to this unit. If you do, heal 2 damage from your base.
- Status: Unreviewed

### 060 - Cobb Vanth - Let Me Handle This

- Internal name: `cobb-vanth#let-me-handle-this`
- Type: Unit
- Text: Grit When you play another unit: You may deal 2 damage to this unit. If you do, give a Shield token to that unit.
- Status: Unreviewed

### 061 - Strike Team Vanguard

- Internal name: `strike-team-vanguard`
- Type: Unit
- Text: (none)
- Status: Finished

### 062 - The Mandalorian - Devoted Rescuer

- Internal name: `the-mandalorian#devoted-rescuer`
- Type: Unit
- Text: Shielded If damage would be dealt to another friendly unit, you may defeat a Shield token on this unit. If you do, prevent that damage.
- Rules: If you control multiple effects that would be used to prevent the same damage, you choose which to resolve.
- Status: Unreviewed

### 063 - Bo-Katan's Gauntlet - Reinforce from Above

- Internal name: `bokatans-gauntlet#reinforce-from-above`
- Type: Unit
- Text: Restore 1 Each other friendly non-token unit gains: “When Defeated: Create a Mandalorian token.”
- Rules: If Bo-Katan's Gauntlet is defeated simultaneously with other friendly units, all “When Defeated” abilities still trigger.
- Status: Unreviewed

### 064 - The Armorer - Secrecy is Our Survival

- Internal name: `the-armorer#secrecy-is-our-survival`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to her.) When Played: Give a Shield token to each friendly unit with Shielded (including this one).
- Status: Unreviewed

### 065 - Home One - Heart of the Fleet

- Internal name: `home-one#heart-of-the-fleet`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) When Played: Heal all damage from each friendly unit.
- Status: Unreviewed

### 066 - Luke's Jedi Lightsaber - Constructed by Hand

- Internal name: `lukes-jedi-lightsaber#constructed-by-hand`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. If attached unit is Luke Skywalker, he gains Sentinel. (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 067 - Get Lost

- Internal name: `get-lost`
- Type: Event
- Text: Defeat an upgraded non-leader unit.
- Status: Unreviewed

### 068 - Domesticated Loth-Cat

- Internal name: `domesticated-lothcat`
- Type: Unit
- Text: Enemy units lose Ambush and Support.
- Rules: All enemy units lose and can't gain Ambush and Support while Domesticated Loth-Cat is in play. This ability applies to units as they are played.
- Status: Unreviewed

### 069 - Noti Nomad

- Internal name: `noti-nomad`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 070 - At Attin Safety Droid

- Internal name: `at-attin-safety-droid`
- Type: Unit
- Text: If your base would be dealt more than 4 damage, prevent all but 4 of that damage.
- Status: Unreviewed

### 071 - Battered Haulcraft

- Internal name: `battered-haulcraft`
- Type: Unit
- Text: When Played: Deal 1 damage to this unit and 1 damage to an enemy space unit.
- Status: Unreviewed

### 072 - Doctor Pershing - Dedicated to Research

- Internal name: `doctor-pershing#dedicated-to-research`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) On Attack: If this unit has 3 or more remaining HP, draw a card.
- Rules: If you use Doctor Pershing's Support ability to attack with another unit, you only draw a card from the ""On Attack"" ability if the attacking unit has 3 or more remaining HP.
- Status: Unreviewed

### 073 - Palace Chef Droid

- Internal name: `palace-chef-droid`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) This unit gets +2/+0 while defending.
- Status: Unreviewed

### 074 - Mos Eisley Modifier

- Internal name: `mos-eisley-modifier`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 075 - Pit Droid Team

- Internal name: `pit-droid-team`
- Type: Unit
- Text: The first upgrade you play on another friendly unit each phase costs 1 resource less.
- Status: Unreviewed

### 076 - Remnant Official

- Internal name: `remnant-official`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 077 - Ryder Azadi - Restored Governor

- Internal name: `ryder-azadi#restored-governor`
- Type: Unit
- Text: Restore 1 When Played: Name a card. While this unit is in play, opponents can't play cards with that name.
- Rules: Abilities that refer to a card’s “name” do not include the subtitle of the card. Until Ryder leaves play, opponents can't play cards with the chosen name. This effect is not changed if an opponent takes control of Ryder. If Ryder is captured and then rescued, his ""When Played"" effect does not resume.
- Status: Unreviewed

### 078 - B-Wing Rearguard

- Internal name: `bwing-rearguard`
- Type: Unit
- Text: While you control a ground unit, this unit gains Sentinel. (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 079 - Koska Reeves - Warrior of Mandalore

- Internal name: `koska-reeves#warrior-of-mandalore`
- Type: Unit
- Text: While you control a token unit, this unit gains Sentinel. When Played: If a friendly unit was defeated this phase, create a Mandalorian token.
- Status: Unreviewed

### 080 - Covert Believers

- Internal name: `covert-believers`
- Type: Unit
- Text: When Defeated: Create a Mandalorian token.
- Status: Unreviewed

### 081 - Nebulon-C Frigate

- Internal name: `nebulonc-frigate`
- Type: Unit
- Text: When Played: You may heal 3 damage from a unit or base.
- Status: Unreviewed

### 082 - Trexler Armored Marauder

- Internal name: `trexler-armored-marauder`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.) When Played: You may give a Shield token to a unit that costs 3 or less.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 083 - Summa-verminoth

- Internal name: `summaverminoth`
- Type: Unit
- Text: Sentinel On Attack: Defeat all other space units.
- Status: Unreviewed

### 084 - Arcana Star Map - Path to Peridea

- Internal name: `arcana-star-map#path-to-peridea`
- Type: Upgrade
- Text: Attached unit gains: “If you would search a number of cards from your deck, search twice that number of cards instead.”
- Status: Unreviewed

### 085 - Grav Charge

- Internal name: `grav-charge`
- Type: Upgrade
- Text: When attached unit's attack ends: Deal 4 damage to it and defeat this upgrade.
- Rules: When Attack Ends abilities trigger at the same time as units deal combat damage.
- Status: Unreviewed

### 086 - Durasteel Plating

- Internal name: `durasteel-plating`
- Type: Upgrade
- Text: When Played: Give a Shield token to attached unit.
- Status: Unreviewed

### 087 - Cybernetic Enhancements

- Internal name: `cybernetic-enhancements`
- Type: Upgrade
- Text: When Played: Draw a card.
- Status: Unreviewed

### 088 - The Conflict Within

- Internal name: `the-conflict-within`
- Type: Upgrade
- Text: Attached unit gains: “When this unit readies: You may pay 3 resources. If you don't, exhaust this unit.”
- Status: Unreviewed

### 089 - Perseverance

- Internal name: `perseverance`
- Type: Event
- Text: Heal 3 damage from a unit and give a Shield token to it.
- Status: Unreviewed

### 090 - Reforge

- Internal name: `reforge`
- Type: Event
- Text: Defeat an upgrade on a friendly unit. If you do, search the top 8 cards of your deck for an upgrade that can attach to that unit, reveal it, and play it on that unit. It costs 4 resources less.
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 091 - Buy Time

- Internal name: `buy-time`
- Type: Event
- Text: Create a Mandalorian token and give it Sentinel for this phase. (Enemy units in its arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 092 - Foundling Rescue

- Internal name: `foundling-rescue`
- Type: Event
- Text: You may defeat a unit with 2 or less remaining HP. Create a Mandalorian token.
- Status: Unreviewed

### 093 - Captain Pellaeon - Plotting from the Shadows

- Internal name: `captain-pellaeon#plotting-from-the-shadows`
- Type: Unit
- Text: While a leader unit has been defeated this phase, this unit gains Raid 3. (He gets +3/+0 while attacking.)
- Status: Unreviewed

### 094 - Moff Jerjerrod - We Shall Redouble Our Efforts

- Internal name: `moff-jerjerrod#we-shall-redouble-our-efforts`
- Type: Unit
- Text: If you would create a number of tokens, you may defeat this unit. If you do, create twice that number of tokens instead.
- Status: Unreviewed

### 095 - Remnant Interceptor

- Internal name: `remnant-interceptor`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) Restore 1 (When this unit attacks, heal 1 damage from your base.)
- Status: Unreviewed

### 096 - Forest Patroller

- Internal name: `forest-patroller`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) Restore 1 (When this unit attacks, heal 1 damage from your base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 097 - Moff Gideon - Remnant Commander

- Internal name: `moff-gideon#remnant-commander`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) When Defeated: You may return a non-<uq> Imperial unit from your discard pile to your hand.
- Status: Unreviewed

### 098 - AT-ST Raider

- Internal name: `atst-raider`
- Type: Unit
- Text: While you control another non-<uq> unit, this unit gains Ambush. (When you play this unit, it may attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 099 - Gozanti Assault Carrier

- Internal name: `gozanti-assault-carrier`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) On Attack: This unit gains Sentinel for this phase.
- Rules: If you use Gozanti Assault Carrier's Support ability to attack with another unit, the ""On Attack"" ability gives the attacking unit Sentinel for this phase.
- Status: Unreviewed

### 100 - Gallius Rax - Counselor to the Empire

- Internal name: `gallius-rax#counselor-to-the-empire`
- Type: Unit
- Text: Other friendly units with 2 or more different keywords get +2/+2.
- Rules: ""Different"" keywords means different words, regardless of numbers that might follow them. ""Raid 1"" and ""Raid 2"" do not count as different keywords.
- Status: Unreviewed

### 101 - The Great Mothers - With Strange Magicks

- Internal name: `the-great-mothers#with-strange-magicks`
- Type: Unit
- Text: Support When Attack Ends: If this unit dealt combat damage to 1 or more non-leader units, defeat those units.
- Rules: “Combat damage” is only the damage dealt during the “End attack” step of an attack. When Attack Ends abilities trigger at the same time as units deal combat damage. The Great Mothers do not need to survive the attack in order to resolve defeat units, so long as they dealt combat damage to those units.
- Status: Unreviewed

### 102 - Ravager - Final Imperial Command

- Internal name: `ravager#final-imperial-command`
- Type: Unit
- Text: Restore 2 When you play a unit: You may have it deal damage equal to its power to a unit in the same arena.
- Rules: Abilities that refer to a card’s power include temporary modifiers. When you play Ravager, its ability triggers, and you may have it deal damage equal to its power to a unit in the same arena.
- Status: Unreviewed

### 103 - Long Live the Empire

- Internal name: `long-live-the-empire`
- Type: Event
- Text: Defeat a friendly Imperial unit. If you do, resource the top card of your deck.
- Rules: Resources enter play exhausted.
- Status: Unreviewed

### 104 - Dathomiri Magicks

- Internal name: `dathomiri-magicks`
- Type: Event
- Text: If you control a Force unit, this event costs 1 resource less to play. Play up to 3 non-Vehicle units that each cost 2 or less from your discard pile for free.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 105 - Bo-Katan Kryze - For All of Mandalore

- Internal name: `bokatan-kryze#for-all-of-mandalore`
- Type: Unit
- Text: While you control another Mandalorian unit, this unit gains Raid 2.
- Status: Unreviewed

### 106 - Pathfinder Sergeant

- Internal name: `pathfinder-sergeant`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) Restore 1 (When this unit attacks, heal 1 damage from your base.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 107 - Clan Wren Loyalist

- Internal name: `clan-wren-loyalist`
- Type: Unit
- Text: When Played: Search the top 5 cards of your deck for a card that shares a Trait with a unit you control, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 108 - Crix Madine - Strike Team Strategist

- Internal name: `crix-madine#strike-team-strategist`
- Type: Unit
- Text: When Played: You may play a Heroism unit from your hand. It costs 2 resources less for each arena in which you control the most units.
- Rules: (ERRATA) When Played: You may play a Heroism unit from your hand. It costs 2 less for each arena in which you control more units than each opponent.
- Status: Unreviewed

### 109 - T-6 Shuttle 1974 - With a Mentor's Dedication

- Internal name: `t6-shuttle-1974#with-a-mentors-dedication`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) Action [Exhaust]: Give another unit +2/+2 for this phase. You may attack with that unit.
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 110 - Admiral Ackbar - Assume Attack Coordinates

- Internal name: `admiral-ackbar#assume-attack-coordinates`
- Type: Unit
- Text: When Played: You may defeat this unit. If you do, search the top 10 cards of your deck for any number of space units with combined cost 5 or less and play each of them for free.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. After searching, put any cards not chosen on the bottom of your deck in a random order. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 111 - Children of the Watch

- Internal name: `children-of-the-watch`
- Type: Unit
- Text: When Played: Create 2 Mandalorian tokens.
- Status: Unreviewed

### 112 - Luke Skywalker - Answering the Call

- Internal name: `luke-skywalker#answering-the-call`
- Type: Unit
- Text: Restore 1 When Played: If you control at least 4 units, deal 3 damage to each enemy unit.
- Rules: All damage dealt by Luke's ""When Played"" ability is dealt simultaneously.
- Status: Unreviewed

### 113 - Mandalorian Flagship - Captured from the Empire

- Internal name: `mandalorian-flagship#captured-from-the-empire`
- Type: Unit
- Text: While you control a leader unit, this unit gains Ambush. (When you play this unit, it may attack an enemy unit.) This unit gets +1/+0 for each other friendly Mandalorian unit.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 114 - Sabine's Lightsaber - Not Alone

- Internal name: `sabines-lightsaber#not-alone`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. If attached unit is Sabine Wren or a Force unit, it gains Restore 2.
- Status: Unreviewed

### 115 - The Student Guides the Master

- Internal name: `the-student-guides-the-master`
- Type: Event
- Text: Give a friendly unit +1/+0 for this phase for each other friendly unit with less power than it.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 116 - Ant Droid

- Internal name: `ant-droid`
- Type: Unit
- Text: When Defeated: Draw a card.
- Status: Unreviewed

### 117 - Outland Protector

- Internal name: `outland-protector`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 118 - 8D8 - Daimyo's Majordomo

- Internal name: `8d8#daimyos-majordomo`
- Type: Unit
- Text: Hidden Action [Exhaust]: Deal 1 damage to another friendly unit. If you do, search the top 5 cards of your deck for a unit, reveal it, and draw it.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked. After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 119 - Greef Karga - Introductions are in Order

- Internal name: `greef-karga#introductions-are-in-order`
- Type: Unit
- Text: Action [1 resource, Exhaust]: If your base was attacked this phase, create a Mandalorian token.
- Status: Unreviewed

### 120 - Warrior of Clan Kryze

- Internal name: `warrior-of-clan-kryze`
- Type: Unit
- Text: While you control another exhausted unit, this unit gains Sentinel. (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 121 - Blurrg

- Internal name: `blurrg`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 123 - Lang - Arrogant Mercenary

- Internal name: `lang#arrogant-mercenary`
- Type: Unit
- Text: Action [Exhaust]: This unit deals damage equal to his power to a ground unit.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 124 - Protectorate Fighter

- Internal name: `protectorate-fighter`
- Type: Unit
- Text: When Played: If you control a <uq> unit, create a Mandalorian token.
- Status: Unreviewed

### 125 - Stolen Eta Shuttle

- Internal name: `stolen-eta-shuttle`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) While you have the initiative, this unit gets +2/+0.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 126 - Survivors' Langskib

- Internal name: `survivors-langskib`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 127 - The Twins - We Don't Want War

- Internal name: `the-twins#we-dont-want-war`
- Type: Unit
- Text: When Played/On Attack: You may give another friendly unit Sentinel for this phase. When another friendly unit is defeated: Heal 1 damage from your base.
- Status: Unreviewed

### 128 - Bothan-5 - New Republic Prison Ship

- Internal name: `bothan5#new-republic-prison-ship`
- Type: Unit
- Text: When another friendly non-Vehicle unit is defeated: You may have this unit capture that unit from your discard pile. Use this ability only once each round.
- Status: Unreviewed

### 129 - Defenders of the Forest

- Internal name: `defenders-of-the-forest`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 130 - Fang Fighter Squadron

- Internal name: `fang-fighter-squadron`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.)
- Status: Unreviewed

### 131 - Dinosaur Turtle

- Internal name: `dinosaur-turtle`
- Type: Unit
- Text: (none)
- Status: Finished

### 132 - Queen Soruna - Willing to Fight

- Internal name: `queen-soruna#willing-to-fight`
- Type: Unit
- Text: When Played/On Attack: You may reveal a unit from your hand. If you do, deal 3 damage to a unit with the same cost as the revealed unit.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 133 - Trask Walker

- Internal name: `trask-walker`
- Type: Unit
- Text: When Played/On Attack: Choose a unit in your discard pile that costs 7 or less. Either put that card on the bottom of your deck and heal 3 damage from your base or return it to your hand.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 134 - Warrior's Legacy

- Internal name: `warriors-legacy`
- Type: Upgrade
- Text: Attached unit gains: “When Defeated: Create a Mandalorian token.”
- Status: Unreviewed

### 135 - The Darksaber - Icon of Leadership

- Internal name: `the-darksaber#icon-of-leadership`
- Type: Upgrade
- Text: Attach to a <uq> non-Vehicle unit. Attached unit is a leader unit and gains the Mandalorian trait. Attached unit gains: “While you are paying costs, this unit provides its aspect icons.”
- Status: Unreviewed

### 136 - Display of Strength

- Internal name: `display-of-strength`
- Type: Event
- Text: Give a unit +3/+3 for this phase.
- Status: Unreviewed

### 137 - Wipe Them Out

- Internal name: `wipe-them-out`
- Type: Event
- Text: Attack with a unit. For this attack, you may deal its excess damage to another unit in the same arena.
- Rules: You must attack with a unit, if able. Units must be ready in order to attack. If you attack with a unit that has Overwhelm, you may choose whether to deal its excess damage to the defending player's base or to another unit in the same arena.
- Status: Unreviewed

### 138 - Turning the Tide

- Internal name: `turning-the-tide`
- Type: Event
- Text: Choose a unit. Deal 1 damage to it for each friendly unit.
- Status: Unreviewed

### 139 - Hold Them Off

- Internal name: `hold-them-off`
- Type: Event
- Text: Choose a friendly unit. That unit deals damage equal to its power divided as you choose among any number of units in its arena.
- Rules: Abilities that refer to a card’s power include temporary modifiers. You can choose to assign more damage to a unit than it has remaining HP. All damage dealt by Hold Them Off is dealt simultaneously.
- Status: Unreviewed

### 140 - Stronger Together

- Internal name: `stronger-together`
- Type: Event
- Text: Create 2 Mandalorian tokens.
- Status: Unreviewed

### 141 - TIE Striker

- Internal name: `tie-striker`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 142 - Mortar Trooper

- Internal name: `mortar-trooper`
- Type: Unit
- Text: Action [Exhaust]: Deal 1 damage to each of up to 3 ground units.
- Rules: All damage dealt by Mortar Trooper's ability is dealt simultaneously.
- Status: Unreviewed

### 143 - Tempest Lieutenant

- Internal name: `tempest-lieutenant`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 144 - Vane's Snub Fighter - Brash and Proud

- Internal name: `vanes-snub-fighter#brash-and-proud`
- Type: Unit
- Text: When a friendly unit's attack ends: If it dealt combat damage to a base, give an Advantage token to this unit.
- Rules: When Attack Ends abilities trigger at the same time as units deal combat damage. The attacking unit doesn't need to survive in order to give an Advantage token, so long as it dealt combat damage to a base. “Combat damage” is only the damage dealt during the “End attack” step of an attack.
- Status: Unreviewed

### 145 - Praetorian Elite

- Internal name: `praetorian-elite`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 146 - Justifier - Relentless

- Internal name: `justifier#relentless`
- Type: Unit
- Text: When Played/On Attack: You may deal 1 damage to a unit. If that unit is defeated this way, give an Advantage token to a unit.
- Status: Unreviewed

### 147 - The Cyborg Mech - Mysterious Threat

- Internal name: `the-cyborg-mech#mysterious-threat`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.) When Played: Either deal 2 damage to an undamaged ground unit or 5 damage to a damaged ground unit.
- Status: Unreviewed

### 148 - Ninth Sister - Hulking Inquisitor

- Internal name: `ninth-sister#hulking-inquisitor`
- Type: Unit
- Text: Overwhelm When Played: An opponent discards a card from their hand. You may deal damage equal to its cost divided as you choose among any number of units.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. You can choose to assign more damage to a unit than it has remaining HP. All damage dealt by Ninth Sister's ""When Played"" ability is dealt simultaneously. If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 149 - Eviscerator - Burn Them Away

- Internal name: `eviscerator#burn-them-away`
- Type: Unit
- Text: Advantage tokens on friendly units lose all abilities. (They aren't defeated after combat.) When Played/On Attack: Give 2 Advantage tokens to each other friendly unit.
- Rules: Friendly Advantage tokens lose all abilities and can't gain abilities while Eviscerator is in play. This means they won't be defeated after combat.
- Status: Unreviewed

### 150 - Deadly Vulnerability

- Internal name: `deadly-vulnerability`
- Type: Upgrade
- Text: If attached unit would take damage, it takes twice as much damage instead. While attached unit is defending, the attacker loses Overwhelm.
- Rules: While attached unit is defending, the attacking unit loses Overwhelm and can't gain Overwhelm.
- Status: Unreviewed

### 151 - Operation Cinder

- Internal name: `operation-cinder`
- Type: Event
- Text: Deal 5 damage to your base. Then, deal 5 damage to each unit.
- Rules: All damage dealt to units by Operation Cinder is dealt simultaneously.
- Status: Unreviewed

### 153 - Green Leader - Crynyd's Sacrifice

- Internal name: `green-leader#crynyds-sacrifice`
- Type: Unit
- Text: When Defeated: You may deal 2 damage to a unit.
- Status: Unreviewed

### 154 - Honorable Nite Owl

- Internal name: `honorable-nite-owl`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) Raid 1 (This unit gets +1/+0 while attacking.)
- Status: Unreviewed

### 155 - Grogu - Yes. Yes. Yes.

- Internal name: `grogu#yes-yes-yes`
- Type: Unit
- Text: When you take the initiative: You may attack with a unit.
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 156 - R5-D4 - Built for Adventure

- Internal name: `r5d4#built-for-adventure`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) On Attack: Defeat all upgrades on the defending unit.
- Status: Unreviewed

### 157 - Danger Squadron Wingmen

- Internal name: `danger-squadron-wingmen`
- Type: Unit
- Text: On Attack: You may give an Advantage token to another unit.
- Status: Unreviewed

### 158 - Han Solo - It'll Work

- Internal name: `han-solo#itll-work`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) When Played: Deal 3 damage to this unit. Give 3 Advantage tokens to a unit.
- Status: Unreviewed

### 159 - Alphabet Squadron U-Wing - Quiet Devotion

- Internal name: `alphabet-squadron-uwing#quiet-devotion`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) When the regroup phase starts: Give an Advantage token to a unit.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 160 - Kachirho Militia

- Internal name: `kachirho-militia`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) When an enemy ground unit attacks your base: Ready this unit. Use this ability only once each round.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 161 - Zeb Orrelios - Fists Work Every Time

- Internal name: `zeb-orrelios#fists-work-every-time`
- Type: Unit
- Text: When Played: Give 3 Advantage tokens to another unit. When a friendly upgrade is defeated: Deal 1 damage to a base.
- Status: Unreviewed

### 162 - Rash Action

- Internal name: `rash-action`
- Type: Event
- Text: Attack with a unit. For this attack, it gets +1/+0 and gains: “When Attack Ends: If this unit dealt combat damage to an opponent's base, that opponent discards a card.”
- Rules: You must attack with a unit, if able. Units must be ready in order to attack. “Combat damage” is only the damage dealt during the “End attack” step of an attack. When Attack Ends abilities trigger at the same timeas units deal combat damage. The attacking unit does not need to survive the attack in order to make your opponent discard, so long as it dealt combat damage to that opponent's base.
- Status: Unreviewed

### 163 - Reckless Sacrifice

- Internal name: `reckless-sacrifice`
- Type: Event
- Text: Discard a unit from your hand. Deal 5 damage to a unit that costs more than the discarded card.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 164 - Alamite Hunter

- Internal name: `alamite-hunter`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 165 - Clan Vizsla Soldier

- Internal name: `clan-vizsla-soldier`
- Type: Unit
- Text: When Defeated: You may defeat an upgrade.
- Status: Unreviewed

### 166 - Ewok Warrior

- Internal name: `ewok-warrior`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 167 - Flarestar Attack Shuttle

- Internal name: `flarestar-attack-shuttle`
- Type: Unit
- Text: When Played/When Defeated: You may give an Advantage token to a unit.
- Status: Unreviewed

### 168 - Migs Mayfeld - How About a Toast?

- Internal name: `migs-mayfeld#how-about-a-toast`
- Type: Unit
- Text: Support On Attack: Deal 1 damage to the defending unit. If this unit is upgraded, deal 2 damage to the defending unit instead.
- Rules: Migs' ""On Attack"" ability deals 2 damage to the defending unit if the attacking unit is upgraded.
- Status: Unreviewed

### 169 - Axe Woves - Undaunted

- Internal name: `axe-woves#undaunted`
- Type: Unit
- Text: When you draw 1 or more cards (including during the regroup phase): Give an Advantage token to this unit.
- Status: Unreviewed

### 170 - Desert Sharpshooter

- Internal name: `desert-sharpshooter`
- Type: Unit
- Text: When Played: You may deal 2 damage to an upgraded ground unit.
- Status: Unreviewed

### 171 - Pegasus Tri-Wing

- Internal name: `pegasus-triwing`
- Type: Unit
- Text: When Played: You may defeat a friendly upgrade. If you do, ready this unit.
- Status: Unreviewed

### 172 - Razor Crest - Outfitted Armament

- Internal name: `razor-crest#outfitted-armament`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) On Attack: You may discard a card from your hand. If you do, this unit gets +2/+0 for this attack.
- Status: Unreviewed

### 173 - Shydopp Pirate Skiff

- Internal name: `shydopp-pirate-skiff`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 174 - StarFortress Heavy Bomber

- Internal name: `starfortress-heavy-bomber`
- Type: Unit
- Text: When Played: You may deal 6 damage to a non-<uq> ground unit.
- Status: Unreviewed

### 175 - Wookiee Chieftain

- Internal name: `wookiee-chieftain`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 176 - Imposing Scout Walker

- Internal name: `imposing-scout-walker`
- Type: Unit
- Text: When Played: You may deal 3 damage to a ground unit. If it's defeated this way, give 3 Advantage tokens to this unit.
- Status: Unreviewed

### 177 - Onyx Cinder - Adventure Awaits

- Internal name: `onyx-cinder#adventure-awaits`
- Type: Unit
- Text: Hidden Other friendly units gain Hidden.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 178 - Knobby White Ice Spider

- Internal name: `knobby-white-ice-spider`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) When Played: For each enemy unit, give an Advantage token to this unit.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 179 - Boba Fett's Rancor - Emotionally Complex Creature

- Internal name: `boba-fetts-rancor#emotionally-complex-creature`
- Type: Unit
- Text: When Played: Deal 5 damage to your base. Then, deal 5 damage to an enemy ground unit. Then, deal 5 damage to the same unit. On Attack: You may deal 1 damage to a base for every 5 damage on your base.
- Rules: (ERRATA) On Attack: Choose a base. You may deal 1 damage to it for every 5 damage on your base. Boba Fett's Rancor's ""When Played"" ability deals 2 instances of damage to a unit. If both instances of damage are dealt to a unit with a Shield token, the Shield will only prevent the first damage.
- Status: Unreviewed

### 180 - Bokken Saber

- Internal name: `bokken-saber`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains: “When Attack Ends: Give an Advantage token to this unit.”
- Rules: When Attack Ends abilities trigger at the same time as units deal combat damage.
- Status: Unreviewed

### 181 - Mark My Words

- Internal name: `mark-my-words`
- Type: Upgrade
- Text: Attach to a damaged unit. Attached unit gains Overwhelm. (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 182 - Unfettered Ambition

- Internal name: `unfettered-ambition`
- Type: Upgrade
- Text: When Played: For each upgrade on attached unit not named Advantage (including this one), give an Advantage token to attached unit.
- Status: Unreviewed

### 183 - Whistling Birds

- Internal name: `whistling-birds`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains: “When Attack Ends: If this unit dealt combat damage to an opponent's base, deal 2 damage to each unit that opponent controls in this unit's arena.”
- Rules: “Combat damage” is only the damage dealt during the “End attack” step of an attack. When Attack Ends abilities trigger at the same time as units deal combat damage. The attached unit does not need to survive the attack in order to deal damage to an opponent's units, so long as it dealt combat damage to that opponent's base. All damage dealt by Whistling Birds' granted ability is dealt simultaneously.
- Status: Unreviewed

### 184 - Follow Me

- Internal name: `follow-me`
- Type: Event
- Text: Attack with a unit. After completing the attack, give 3 Advantage tokens to a unit.
- Rules: You must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 185 - Intimidation

- Internal name: `intimidation`
- Type: Event
- Text: If you control a unit with 4 or more power, draw 2 cards.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 186 - Treacherous Minefield

- Internal name: `treacherous-minefield`
- Type: Event
- Text: Choose an arena. For this phase, each unit in that arena gains: “On Attack: Deal 2 damage to this unit.”
- Rules: Treacherous Minefield gives the ""On Attack"" ability to each unit in the chosen arena when the event is played. Units that enter play after the event is played don't gain the ""On Attack"" ability.
- Status: Unreviewed

### 187 - Reckoning

- Internal name: `reckoning`
- Type: Event
- Text: Deal damage to a unit equal to the total amount of damage on all units you control.
- Status: Unreviewed

### 188 - Galvanized Leap

- Internal name: `galvanized-leap`
- Type: Event
- Text: Ready a unit that was damaged this phase.
- Status: Unreviewed

### 189 - Emperor's Messenger

- Internal name: `emperors-messenger`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) On Attack: Ready a resource.
- Status: Unreviewed

### 190 - Peridea Bandit

- Internal name: `peridea-bandit`
- Type: Unit
- Text: (none)
- Status: Finished

### 191 - Shin Hati's Fiend Fighter - Compact and Agile

- Internal name: `shin-hatis-fiend-fighter#compact-and-agile`
- Type: Unit
- Text: When Defeated: You may give 2 Advantage tokens to a unit. If this unit wasn't defeated by combat damage, you may give 3 Advantage tokens to that unit instead.
- Rules: “Combat damage” is only the damage dealt during the “End attack” step of an attack.
- Status: Unreviewed

### 192 - Fennec Shand - The Galaxy Is Dangerous

- Internal name: `fennec-shand#the-galaxy-is-dangerous`
- Type: Unit
- Text: Ambush (When you play this unit, she may attack an enemy unit.) Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 193 - Emperor's Champion

- Internal name: `emperors-champion`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.) Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 194 - Snub Fighter Squadron

- Internal name: `snub-fighter-squadron`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) When Played: Deal 1 damage to a space unit.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 195 - Helgait - Dooku Was a Visionary

- Internal name: `helgait#dooku-was-a-visionary`
- Type: Unit
- Text: When Defeated: You may distribute a number of Advantage tokens equal to this unit's power among friendly units (divided as you choose).
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 196 - Gorian Shard's Corsair - Pirate Warship

- Internal name: `gorian-shards-corsair#pirate-warship`
- Type: Unit
- Text: Damage dealt by friendly Underworld cards is unpreventable. When Played/On Attack: You may deal 2 damage to a unit.
- Status: Unreviewed

### 197 - Executor - Final Destruction of the Alliance

- Internal name: `executor#final-destruction-of-the-alliance`
- Type: Unit
- Text: This unit gets +1/+0 for each upgrade on other friendly units. When Played: Give an Advantage token to each other friendly unit.
- Status: Unreviewed

### 198 - Nowhere to Hide

- Internal name: `nowhere-to-hide`
- Type: Upgrade
- Text: Attached unit gains Sentinel. (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 199 - There Is No Conflict

- Internal name: `there-is-no-conflict`
- Type: Upgrade
- Text: When Played: Return any number of other upgrades on attached unit to their owners' hands.
- Status: Unreviewed

### 200 - Rehabilitation

- Internal name: `rehabilitation`
- Type: Event
- Text: Choose a non-leader unit. Give that unit –3/–0 for this phase, then take control of it. At the start of the regroup phase, its owner takes control of it.
- Status: Unreviewed

### 201 - Open Circle Ace

- Internal name: `open-circle-ace`
- Type: Unit
- Text: (none)
- Status: Finished

### 202 - Carson Teva - There's Something Going On

- Internal name: `carson-teva#theres-something-going-on`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) While attacking, this unit deals combat damage before the defender.
- Rules: If an attacking unit deals combat damage first, and the defending unit is defeated by that damage, it does not deal combat damage back. If it survives and has Grit, it deals bonus damage from Grit when dealing combat damage back.
- Status: Unreviewed

### 203 - Mando's N-1 Starfighter - Faster than a Fathier

- Internal name: `mandos-n1-starfighter#faster-than-a-fathier`
- Type: Unit
- Text: Support On Attack: You may exhaust a friendly (non-upgrade) leader. If you do, this unit gets +2/+0 for this attack.
- Rules: You may exhaust leaders or leader units as part of Mando's N-1 Starfighter's ""On Attack"" ability. Upgrades can't be exhausted.
- Status: Unreviewed

### 204 - Blade Three - Bane of the Devastator

- Internal name: `blade-three#bane-of-the-devastator`
- Type: Unit
- Text: When your base is dealt damage: Give an Advantage token to this unit.
- Status: Unreviewed

### 205 - Inspiring Veteran

- Internal name: `inspiring-veteran`
- Type: Unit
- Text: When Played: Give an Advantage token to each of up to 3 exhausted units.
- Status: Unreviewed

### 206 - Kelleran Beq - Where are the Others?

- Internal name: `kelleran-beq#where-are-the-others`
- Type: Unit
- Text: Ambush This unit gets +1/+0 for each other unit (friendly and enemy) with 0 power.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack. Abilities that refer to a card’s power include temporary modifiers. Power cannot be reduced below 0.
- Status: Unreviewed

### 207 - Heroic Purrgil

- Internal name: `heroic-purrgil`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) While attacking using Ambush, this unit gets +2/+0.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. The unit does not have to be ready in order to attack.
- Status: Unreviewed

### 208 - Sabine Wren - I Learned the Hard Way

- Internal name: `sabine-wren#i-learned-the-hard-way`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to her.) When 1 or more upgrades attach to this unit (including from Shielded): You may exhaust a ground unit.
- Status: Unreviewed

### 209 - Ezra Bridger - The Force is All I Need

- Internal name: `ezra-bridger#the-force-is-all-i-need`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) On Attack: If this unit is upgraded, you may give a unit –3/–0 for this phase.
- Rules: Ezra's ""On Attack"" ability gives a unit -3/-0 if the attacking unit is upgraded.
- Status: Unreviewed

### 210 - DDC Defender

- Internal name: `ddc-defender`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains: “On Defense: You may deal 1 damage to a unit in this unit's arena and exhaust it.”
- Rules: “On Defense” abilities trigger at the same time as “On Attack” abilities.
- Status: Unreviewed

### 211 - Fateful Goodbye

- Internal name: `fateful-goodbye`
- Type: Event
- Text: If a friendly unit left play this phase, distribute 3 Advantage tokens among friendly units. If a friendly leader unit left play this phase, distribute 5 Advantage tokens instead.
- Status: Unreviewed

### 212 - Peli Motto - You Bring the Cash?

- Internal name: `peli-motto#you-bring-the-cash`
- Type: Unit
- Text: Shielded Ignore the aspect penalties of the first non‑unit card you play each phase.
- Status: Unreviewed

### 213 - Womp Rat

- Internal name: `womp-rat`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 214 - Amnesty Officer

- Internal name: `amnesty-officer`
- Type: Unit
- Text: When Played: You may exhaust a unit with one or more keywords.
- Status: Unreviewed

### 215 - Flanking TIE Interceptor

- Internal name: `flanking-tie-interceptor`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.)
- Status: Unreviewed

### 216 - Mandalorian Scout

- Internal name: `mandalorian-scout`
- Type: Unit
- Text: When Defeated: Exhaust a ready friendly resource.
- Status: Unreviewed

### 217 - Mayor's Majordomo - No Problem Groveling

- Internal name: `mayors-majordomo#no-problem-groveling`
- Type: Unit
- Text: Action [Exhaust, discard a card from your hand]: Exhaust a unit.
- Status: Unreviewed

### 218 - Ferry Droid

- Internal name: `ferry-droid`
- Type: Unit
- Text: When Played: Give 4 Advantage tokens to this unit.
- Status: Unreviewed

### 219 - Jod Na Nawood - Keeping Secrets

- Internal name: `jod-na-nawood#keeping-secrets`
- Type: Unit
- Text: Sentinel When Played: You may pay 4 resources. If you do, choose an arena. Exhaust each unit in that arena.
- Status: Unreviewed

### 220 - Remnant Lookouts

- Internal name: `remnant-lookouts`
- Type: Unit
- Text: When Played: Look at an opponent's hand. You may discard a card from it. If you do, they draw a card.
- Status: Unreviewed

### 221 - Helix Starfighter

- Internal name: `helix-starfighter`
- Type: Unit
- Text: When Played: If an opponent controls a space unit, give a Shield token to this unit. Otherwise, give 2 Advantage tokens to this unit.
- Status: Unreviewed

### 222 - Unsanctioned Patrol

- Internal name: `unsanctioned-patrol`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 223 - Halo - Not According to Plan

- Internal name: `halo#not-according-to-plan`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) When Attack Ends: If the defending unit was defeated, give a Shield token to this unit.
- Rules: When Attack Ends abilities trigger at the same time as units deal combat damage. If the defending unit was defeated, give a Shield token to the attacking unit.
- Status: Unreviewed

### 224 - Elzar Mann - Haunted by a Vision

- Internal name: `elzar-mann#haunted-by-a-vision`
- Type: Unit
- Text: While you control a Force leader, this unit enters play ready. When Played: Distribute up to 5 Advantage tokens among other friendly units. Then, an opponent searches twice that many cards from the top of their deck for an event, reveals it, and draws it.
- Rules: After searching, your opponent puts any cards not chosen on the bottom of their deck in a random order. If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 225 - Tatooine Sand Beast

- Internal name: `tatooine-sand-beast`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 226 - Qi'ra - Master of Teräs Käsi

- Internal name: `qira#master-of-teras-kasi`
- Type: Unit
- Text: This unit gets –1/–0 for each card in your hand. When Played: You may discard a card from your hand. If you do, deal 3 damage to a unit.
- Status: Unreviewed

### 227 - Heightened Awareness

- Internal name: `heightened-awareness`
- Type: Upgrade
- Text: Attached unit gains: “When the regroup phase starts: Give an Advantage token to this unit.”
- Status: Unreviewed

### 228 - Preparation

- Internal name: `preparation`
- Type: Upgrade
- Text: When Played: Exhaust attached unit.
- Status: Unreviewed

### 229 - Camtono

- Internal name: `camtono`
- Type: Upgrade
- Text: Attached unit gains: “When Attack Ends: Look at the top card of your deck. If it costs 2 or less, you may play it for free.”
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. When Attack Ends abilities trigger at the same time as units deal combat damage. The attached unit does not need to survive the attack in order to resolve the ability. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 230 - Improvised Identity

- Internal name: `improvised-identity`
- Type: Upgrade
- Text: Attach to a ground unit. Attached unit gains: “Action: Search the top 3 cards of your deck for a ground unit and discard it. Then, you may attack with this unit. For this attack, this unit gains the discarded unit's abilities. Use this ability only once each round.”
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order. Units must be ready in order to attack.
- Status: Unreviewed

### 231 - Diplomatic Pageantry

- Internal name: `diplomatic-pageantry`
- Type: Event
- Text: Exhaust a friendly unit and an enemy unit. If you do, give 2 Advantage tokens to that friendly unit.
- Status: Unreviewed

### 232 - Full of Surprises

- Internal name: `full-of-surprises`
- Type: Event
- Text: Return an upgrade that costs 2 or less to its owner's hand. Give a Shield token to a unit.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 233 - Keep Them Talking

- Internal name: `keep-them-talking`
- Type: Event
- Text: Exhaust up to 2 units that each cost 3 or less.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 234 - Masterstroke

- Internal name: `masterstroke`
- Type: Event
- Text: Attack with a unit. It gets +1/+0 for this attack for each unit the defending player controls in its arena.
- Rules: You must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 235 - Sense Through the Force

- Internal name: `sense-through-the-force`
- Type: Event
- Text: Choose a number, then search the top 5 cards of your deck for a card, reveal it, and draw it. If its cost is the chosen number, you may give 3 Advantage tokens to a Force unit.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 236 - Far Far Away

- Internal name: `far-far-away`
- Type: Event
- Text: Return a friendly non-leader unit to its owner's hand. If you do, return an enemy non-leader unit to its owner's hand.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 237 - Mouse Droid

- Internal name: `mouse-droid`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.) When Played: The next Imperial unit you play this phase costs 1 resource less.
- Rules: Once Mouse Droid's “When Played” ability resolves, it remains active even if it is defeated before you play your next Imperial unit.
- Status: Unreviewed

### 238 - Attendant Navigator

- Internal name: `attendant-navigator`
- Type: Unit
- Text: When Played: You may give 2 Advantage tokens to a space unit.
- Status: Unreviewed

### 239 - Imperial Loyalist

- Internal name: `imperial-loyalist`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 240 - Mandalorian Super Commandos

- Internal name: `mandalorian-super-commandos`
- Type: Unit
- Text: While you control a leader unit, this unit gets +2/+0.
- Status: Unreviewed

### 241 - Marrok's Fiend Fighter - Formidable Pursuer

- Internal name: `marroks-fiend-fighter#formidable-pursuer`
- Type: Unit
- Text: Support Overwhelm This unit gets +2/+0 while attacking a damaged unit.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 242 - Death Trooper Squad

- Internal name: `death-trooper-squad`
- Type: Unit
- Text: (none)
- Status: Finished

### 243 - Darth Vader - Meet Your Destiny

- Internal name: `darth-vader#meet-your-destiny`
- Type: Unit
- Text: Shielded While this unit is ready, he gains Sentinel.
- Status: Unreviewed

### 244 - Remnant Trooper Corps

- Internal name: `remnant-trooper-corps`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 245 - Eye of Sion - Delivered from Exile

- Internal name: `eye-of-sion#delivered-from-exile`
- Type: Unit
- Text: Action [Exhaust]: Search the top 8 cards of your deck for a unit that costs the same as or less than this unit's power. Play it for free. It enters play ready.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. After searching, put any cards not chosen on the bottom of your deck in a random order. Abilities that refer to a card’s power include temporary modifiers. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 246 - Exploit Advantage

- Internal name: `exploit-advantage`
- Type: Event
- Text: Defeat a friendly upgrade. If you do, draw 2 cards.
- Rules: A friendly upgrade is any upgrade you put into play or any token upgrade on a friendly unit.
- Status: Unreviewed

### 247 - One Must Destroy to Create

- Internal name: `one-must-destroy-to-create`
- Type: Event
- Text: Defeat a friendly non-leader unit. Then, you may play that unit from your discard pile for free.
- Rules: “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 248 - Neel - The Cutest Boy

- Internal name: `neel#the-cutest-boy`
- Type: Unit
- Text: When Played/On Attack: The next unit you play this phase with 1 or less power enters play ready.
- Rules: (ERRATA) When Played/On Attack: The next unit you play this phase with 1 or less printed power enters play ready. Once Neel's “When Played/On Attack” ability resolves, it remains active even if it is defeated before you play your next unit with 1 or less printed power.
- Status: Unreviewed

### 249 - Covert Veteran

- Internal name: `covert-veteran`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 250 - Imperial Defector

- Internal name: `imperial-defector`
- Type: Unit
- Text: When Played: Look at an opponent's hand.
- Status: Unreviewed

### 251 - Zealous Soldier

- Internal name: `zealous-soldier`
- Type: Unit
- Text: When Played: Give an Advantage token to this unit.
- Status: Unreviewed

### 252 - N5 Sentry Droid

- Internal name: `n5-sentry-droid`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 253 - Yellow Aces Bomber

- Internal name: `yellow-aces-bomber`
- Type: Unit
- Text: Support (When you play this unit, you may attack with another unit. It gains this unit's other abilities for this attack.) On Attack: If this unit is upgraded, deal 2 damage to a base.
- Rules: Yellow Aces Bomber's ""On Attack"" ability deals 2 damage to the a base if the attacking unit is upgraded.
- Status: Unreviewed

### 254 - Gallofree Transport

- Internal name: `gallofree-transport`
- Type: Unit
- Text: When Defeated: Give 2 Advantage tokens to a friendly unit.
- Status: Unreviewed

### 255 - Anakin Skywalker - You Were Right About Me

- Internal name: `anakin-skywalker#you-were-right-about-me`
- Type: Unit
- Text: Hidden Saboteur When Played: Give a Shield token to another friendly unit.
- Rules: If a unit has Hidden and Sentinel at the same time, it can be attacked.
- Status: Unreviewed

### 256 - Rebel Infiltrators

- Internal name: `rebel-infiltrators`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.) Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 257 - Choose Your Path

- Internal name: `choose-your-path`
- Type: Event
- Text: Choose one: If you control a Force unit, heal 5 damage from your base. If you control a Mandalorian unit, create a Mandalorian token and give an Advantage token to it.
- Status: Unreviewed

### 259 - LEP Ratcatcher

- Internal name: `lep-ratcatcher`
- Type: Unit
- Text: When Played: You may deal 1 damage to a ground unit.
- Status: Unreviewed

### 260 - Mos Espa Watermonger

- Internal name: `mos-espa-watermonger`
- Type: Unit
- Text: When Played: You may draw a card. If you do, discard a card.
- Status: Unreviewed

### 261 - Noti Mobile Pod

- Internal name: `noti-mobile-pod`
- Type: Unit
- Text: (none)
- Status: Finished

### 262 - Faith in the Empire

- Internal name: `faith-in-the-empire`
- Type: Upgrade
- Text: This upgrade costs 1 resource less to play on an Imperial unit.
- Status: Unreviewed

### 263 - The Way of the Mand'alor

- Internal name: `the-way-of-the-mandalor`
- Type: Upgrade
- Text: This upgrade costs 1 resource less to play on a Mandalorian unit.
- Status: Unreviewed

### 264 - A New Order

- Internal name: `a-new-order`
- Type: Event
- Text: Give an Advantage token to each of up to 2 units.
- Status: Unreviewed

### 997 - Wimpy Wampa

- Internal name: `wimpy-wampa`
- Type: Unit
- Text: mock ability text
- Status: Unreviewed

### 998 - Reckless Wookiee

- Internal name: `reckless-wookiee`
- Type: Unit
- Text: mock ability text
- Status: Unreviewed

## Tokens

### Token - Advantage

- Internal name: `advantage`
- Type: Token, Upgrade
- Text: When attached unit's attack or defense ends: Defeat this upgrade.
- Rules: When Attack Ends/When Defense Ends abilities trigger at the same time as units deal combat damage.
- Status: Unreviewed

### Token - Mandalorian

- Internal name: `mandalorian`
- Type: Token, Unit
- Text: Shielded (When you create this token, give a Shield token to it.)
- Status: Unreviewed

