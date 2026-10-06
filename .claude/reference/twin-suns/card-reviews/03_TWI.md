# 03_TWI (TWI) card review

256 cards + 2 tokens, in set order. Review against the official card text (`test/json/Card/`), not our implementations.

### 001 - Nala Se - Clone Engineer

- Internal name: `nala-se#clone-engineer`
- Type: Leader
- Text: Ignore the aspect penalty on Clone units you play.
- Deployed: Ignore the aspect penalty on Clone units you play. Each friendly Clone unit gains: “When Defeated: Heal 2 damage from your base.”
- Rules: If Nala Se is defeated simultaneously with other friendly units, all “When Defeated” abilities still trigger.
- Status: Unreviewed

### 002 - Nute Gunray - Vindictive Viceroy

- Internal name: `nute-gunray#vindictive-viceroy`
- Type: Leader
- Text: Action [Exhaust]: If 2 or more friendly units were defeated this phase, create a Battle Droid token.
- Deployed: On Attack: Create a Battle Droid token.
- Rules: Nute's leader ability still can be used as an action even if fewer than 2 friendly units were defeated this phase (but no Battle Droid token is created). (ERRATA) Templating update: "Aspect penalty" becomes "aspect penalties" when referring to multiple.
- Status: Unreviewed

### 003 - Obi-Wan Kenobi - Patient Mentor

- Internal name: `obiwan-kenobi#patient-mentor`
- Type: Leader
- Text: Action [Exhaust]: Heal 1 damage from a unit.
- Deployed: Sentinel (Units in this arena can’t attack your non-Sentinel units or your base.) On Attack: Heal 1 damage from a unit. If you do, deal 1 damage to a different unit.
- Rules: "A different unit" in Obi-Wan's unit side ability refers to a unit other than the one healed. Obi-Wan's unit side ability may be used to deal 1 damage to Obi-Wan.
- Status: Unreviewed

### 004 - Yoda - Sensing Darkness

- Internal name: `yoda#sensing-darkness`
- Type: Leader
- Text: Action [Exhaust]: If a unit left play this phase, draw a card, then put a card from your hand on the top or bottom of your deck.
- Deployed: Restore 2 When Deployed: You may discard a card from your deck. If you do, defeat an enemy non-leader unit that costs the same as or less than the discarded card.
- Rules: Abilities that refer to a card's cost always refer to its printed cost, regardless of modifiers. Yoda's leader ability still can be used as an action even if no unit left play this phase (but you don't resolve any of the listed effects). Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 005 - Count Dooku - Face of the Confederacy

- Internal name: `count-dooku#face-of-the-confederacy`
- Type: Leader
- Text: Action [Exhaust]: Play a Separatist card from your hand. It gains Exploit 1. (You may defeat 1 unit you control. If you do, that card costs 2 resources less.)
- Deployed: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent’s base.) On Attack: The next Separatist card you play this phase gains Exploit 3.
- Rules: The Exploit 3 from Dooku's “On Attack” ability remains active even if he is defeated. Abilities that let you play a card require you to pay that card's cost unless specified otherwise. (ERRATA) Action [Exhaust]: Play a Separatist card from your hand. It gains Exploit 1 for this phase.
- Status: Unreviewed

### 006 - Wat Tambor - Techno Union Foreman

- Internal name: `wat-tambor#techno-union-foreman`
- Type: Leader
- Text: Action [Exhaust]: If a friendly unit was defeated this phase, give a unit +2/+2 for this phase.
- Deployed: On Attack: If a friendly unit was defeated this phase, you may give another unit +2/+2 for this phase.
- Rules: Wat's leader ability still can be used as an action even if no friendly unit left play this phase (but no unit gets +2/+2). Wat's "On Attack" ability can't be used to give himself +2/+2.
- Status: Unreviewed

### 007 - Captain Rex - Fighting For His Brothers

- Internal name: `captain-rex#fighting-for-his-brothers`
- Type: Leader
- Text: Action [2 resources, Exhaust]: If a friendly unit attacked this phase, create a Clone Trooper token.
- Deployed: When Deployed: Create a Clone Trooper token. Each other friendly Trooper unit gets +0/+1.
- Rules: Rex's leader ability still can be used as an action even if no friendly unit attacked this phase (but no token is created).
- Status: Unreviewed

### 008 - Padmé Amidala - Serving the Republic

- Internal name: `padme-amidala#serving-the-republic`
- Type: Leader
- Text: Coordinate — Action [1 resource, Exhaust]: Search the top 3 cards of your deck for a Republic card, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order. Gain this ability while you control 3 or more units.)
- Deployed: Restore 1 (When this unit attacks, heal 1 damage from your base.) Coordinate — On Attack: Search the top 3 cards of your deck for a Republic card, reveal it, and draw it.
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 009 - Maul - A Rival in Darkness

- Internal name: `maul#a-rival-in-darkness`
- Type: Leader
- Text: Action [Exhaust]: Attack with a unit. It gains Overwhelm for this attack. (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Deployed: Overwhelm Each other friendly unit gains Overwhelm.
- Rules: If you use Maul's leader ability, you must attack with a unit, if able. Units must be ready in order to attack. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 010 - Pre Vizsla - Pursuing the Throne

- Internal name: `pre-vizsla#pursuing-the-throne`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Deal damage to a unit equal to the number of cards you've drawn this phase. (This doesn't include cards drawn in the regroup phase.)
- Deployed: While you have 3 or more cards in your hand, this unit gains Saboteur. While you have 6 or more cards in your hand, this unit gets +2/+0.
- Status: Unreviewed

### 011 - Ahsoka Tano - Snips

- Internal name: `ahsoka-tano#snips`
- Type: Leader
- Text: Coordinate — Action [Exhaust]: Attack with a unit. It gets +1/+0 for this attack. (Gain this ability while you control 3 or more units.)
- Deployed: Coordinate — This unit gets +2/+0.
- Rules: If you use Ahsoka's leader ability, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 012 - Anakin Skywalker - What it Takes to Win

- Internal name: `anakin-skywalker#what-it-takes-to-win`
- Type: Leader
- Text: Action [Exhaust, deal 2 damage to your base]: Attack with a unit. If it's attacking a unit, it gets +2/+0 for this attack.
- Deployed: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent’s base.) This unit gets +1/+0 for every 5 damage on your base.
- Rules: If you use Anakin's leader ability, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 013 - Mace Windu - Vaapad Form Master

- Internal name: `mace-windu#vaapad-form-master`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Deal 1 damage to a damaged enemy unit. Then, if it has 5 or more damage on it, deal 1 damage to it.
- Deployed: When Deployed: Deal 2 damage to each damaged enemy unit.
- Rules: Mace's leader ability deals 2 instances of damage. If both instances of instances of damage are dealt to a unit with a Shield token, the Shield will only prevent the first damage.
- Status: Unreviewed

### 014 - Asajj Ventress - Unparalleled Adversary

- Internal name: `asajj-ventress#unparalleled-adversary`
- Type: Leader
- Text: Action [Exhaust]: Attack with a unit. If you played an event this phase, it gets +1/+0 for this attack.
- Deployed: On Attack: If you played an event this phase, this unit gets +1/+0 for this attack and deals combat damage before the defender. (If the defender is defeated, it deals no combat damage.)
- Rules: If you use Asajj's leader ability, you must attack with a unit, if able. Units must be ready in order to attack. “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. If Asajj deals combat damage first, and the defender is defeated by that damage, it does not deal combat damage back. If it survives and has Grit, it deals bonus damage from Grit when dealing combat damage back. If you play an event card that lets you make an attack with Asajj, you have played an event card this phase and her "On Attack" ability will trigger. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 015 - General Grievous - General of the Droid Armies

- Internal name: `general-grievous#general-of-the-droid-armies`
- Type: Leader
- Text: Action [Exhaust]: Give a Droid unit Sentinel for this phase. (Units in its arena can't attack your non-Sentinel units or your base.)
- Deployed: On Attack: You may give a Droid unit +1/+0 and Sentinel for this phase.
- Status: Unreviewed

### 016 - Jango Fett - Concealing the Conspiracy

- Internal name: `jango-fett#concealing-the-conspiracy`
- Type: Leader
- Text: When a friendly unit deals damage to an enemy unit: You may exhaust this leader. If you do, exhaust that enemy unit.
- Deployed: When a friendly unit deals damage to an enemy unit: You may exhaust that unit.
- Status: Unreviewed

### 017 - Chancellor Palpatine - Playing Both Sides

- Internal name: `chancellor-palpatine#playing-both-sides`
- Type: Leader
- Text: This leader starts the game with this side faceup. Action [Exhaust]: If a friendly Heroism unit was defeated this phase, draw a card, heal 2 damage from your base, then flip this leader.
- Deployed: Action [Exhaust]: If you played a Villainy card this phase, create a Clone Trooper token, deal 2 damage to each enemy base, then flip this leader.
- Rules: Palpatine's leader ability still can be used as an action even if no friendly Heroism unit was defeated this phase (but you don't resolve any of the listed effects). The same applies to Sidious's leader ability. When Chancellor Palpatine or Darth Sidious flip due to their leader ability, they remain exhausted.
- Status: Unreviewed

### 018 - Quinlan Vos - Sticking the Landing

- Internal name: `quinlan-vos#sticking-the-landing`
- Type: Leader
- Text: When you play a unit: You may exhaust this leader. If you do, deal 1 damage to an enemy unit that costs the same as the played unit.
- Deployed: When you play a unit: You may deal 1 damage to an enemy unit that costs the same as or less than the played unit.
- Rules: Abilities that refer to a card's cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 019 - Pau City

- Internal name: `pau-city`
- Type: Base
- Text: Each leader unit you control gets +0/+1.
- Status: Unreviewed

### 020 - Sundari

- Internal name: `sundari`
- Type: Base
- Text: (none)
- Status: Finished

### 021 - The Crystal City

- Internal name: `the-crystal-city`
- Type: Base
- Text: (none)
- Status: Finished

### 022 - Droid Manufactory

- Internal name: `droid-manufactory`
- Type: Base
- Text: When you deploy a leader: Create 2 Battle Droid tokens.
- Status: Unreviewed

### 023 - Lair of Grievous

- Internal name: `lair-of-grievous`
- Type: Base
- Text: (none)
- Status: Finished

### 024 - Tipoca City

- Internal name: `tipoca-city`
- Type: Base
- Text: (none)
- Status: Finished

### 025 - Shadow Collective Camp

- Internal name: `shadow-collective-camp`
- Type: Base
- Text: When you deploy a leader: Draw a card.
- Status: Unreviewed

### 026 - KCM Mining Facility

- Internal name: `kcm-mining-facility`
- Type: Base
- Text: (none)
- Status: Finished

### 027 - The Nest

- Internal name: `the-nest`
- Type: Base
- Text: (none)
- Status: Finished

### 028 - Petranaki Arena

- Internal name: `petranaki-arena`
- Type: Base
- Text: Each leader unit you control gets +1/+0.
- Status: Unreviewed

### 029 - Level 1313

- Internal name: `level-1313`
- Type: Base
- Text: (none)
- Status: Finished

### 030 - Pyke Palace

- Internal name: `pyke-palace`
- Type: Base
- Text: (none)
- Status: Finished

### 031 - Rune Haako - Scheming Second

- Internal name: `rune-haako#scheming-second`
- Type: Unit
- Text: When Played: If a friendly unit was defeated this phase, you may give a unit –1/–1 for this phase.
- Status: Unreviewed

### 032 - Wartime Trade Official

- Internal name: `wartime-trade-official`
- Type: Unit
- Text: When Defeated: Create a Battle Droid token.
- Status: Unreviewed

### 033 - Calculating MagnaGuard

- Internal name: `calculating-magnaguard`
- Type: Unit
- Text: When Played/When a friendly unit is defeated: This unit gains Sentinel for this phase. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 034 - General Grievous - Trophy Collector

- Internal name: `general-grievous#trophy-collector`
- Type: Unit
- Text: Ignore the aspect penalty on each Lightsaber upgrade you play on this unit. On Attack: If this unit has 4 or more Lightsaber upgrades attached to him, defeat 4 enemy units.
- Rules: (ERRATA) Templating update: "Aspect penalty" becomes "aspect penalties" when referring to multiple.
- Status: Unreviewed

### 035 - Morgan Elsbeth - Keeper of Many Secrets

- Internal name: `morgan-elsbeth#keeper-of-many-secrets`
- Type: Unit
- Text: Restore 1 On Attack: You may defeat another friendly unit. If you do, draw a card.
- Status: Unreviewed

### 036 - Devastating Gunship

- Internal name: `devastating-gunship`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.) When Played: Defeat an enemy unit with 2 or less remaining HP.
- Status: Unreviewed

### 037 - Droideka Security

- Internal name: `droideka-security`
- Type: Unit
- Text: Exploit 2 (While playing this card, defeat up to 2 units you control. This card costs 2 resources less for each unit defeated this way.) Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 038 - Providence Destroyer

- Internal name: `providence-destroyer`
- Type: Unit
- Text: Exploit 2 (While playing this card, defeat up to 2 units you control. This card costs 2 resources less for each unit defeated this way.) On Attack: Give an enemy space unit –2/–2 for this phase.
- Status: Unreviewed

### 039 - Malevolence - Grievous's Secret Weapon

- Internal name: `malevolence#grievouss-secret-weapon`
- Type: Unit
- Text: Exploit 4 Restore 2 When Played: Give an enemy unit –4/–0 for this phase. It can't attack for this phase.
- Status: Unreviewed

### 040 - A Fine Addition

- Internal name: `a-fine-addition`
- Type: Event
- Text: If an enemy unit was defeated this phase, play an upgrade from your hand or from any player's discard pile, ignoring its aspect penalty.
- Rules: Abilities that let you play a card require you to pay that card's cost unless specified otherwise. (ERRATA) Templating update: "Aspect penalty" becomes "aspect penalties" when referring to multiple.
- Status: Unreviewed

### 041 - Lethal Crackdown

- Internal name: `lethal-crackdown`
- Type: Event
- Text: Defeat a non-leader unit. Deal damage to your base equal to that unit's power.
- Rules: Abilities that refer to a card's power include temporary modifiers.
- Status: Unreviewed

### 042 - Barriss Offee - Unassuming Apprentice

- Internal name: `barriss-offee#unassuming-apprentice`
- Type: Unit
- Text: Each friendly unit that was healed this phase gets +1/+0.
- Status: Unreviewed

### 043 - Outspoken Representative

- Internal name: `outspoken-representative`
- Type: Unit
- Text: While you control another Republic unit, this unit gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.) When Defeated: Create a Clone Trooper token.
- Status: Unreviewed

### 044 - Kashyyyk Defender

- Internal name: `kashyyyk-defender`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.) When Played: Heal up to 2 damage from another unit and deal that much damage to this unit.
- Status: Unreviewed

### 045 - 41st Elite Corps

- Internal name: `41st-elite-corps`
- Type: Unit
- Text: Coordinate — This unit gets +0/+3. (Gain this ability while you control 3 or more units.)
- Status: Unreviewed

### 046 - Captain Typho - Protecting the Senator

- Internal name: `captain-typho#protecting-the-senator`
- Type: Unit
- Text: When Played/On Attack: Give a unit Sentinel for this phase.
- Status: Unreviewed

### 047 - Satine Kryze - Committed to Peace

- Internal name: `satine-kryze#committed-to-peace`
- Type: Unit
- Text: Each unit (including enemy units) gains: “Action [Exhaust]: Discard cards from an opponent's deck equal to half this unit's remaining HP, rounded up.”
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Unreviewed

### 048 - Obi-Wan's Aethersprite - This is Why I Hate Flying

- Internal name: `obiwans-aethersprite#this-is-why-i-hate-flying`
- Type: Unit
- Text: When Played/On Attack: You may deal 1 damage to this unit and 2 damage to another space unit.
- Status: Unreviewed

### 049 - Knight of the Republic

- Internal name: `knight-of-the-republic`
- Type: Unit
- Text: When this unit is attacked: Create a Clone Trooper token.
- Rules: “When this unit is attacked” triggers at the same time as “On Attack” abilities. On Defense abilities trigger when this unit is chosen as the defender for an attack, in the same window as the attacker's On Attack abilities.
- Status: Unreviewed

### 050 - Luminara Unduli - Soft-Spoken Master

- Internal name: `luminara-unduli#softspoken-master`
- Type: Unit
- Text: Coordinate — Grit (Gain this keyword while you control 3 or more units. This unit gets +1/+0 for each damage on her.) When Played: Choose a base. Heal 1 damage from it for each unit you control.
- Status: Unreviewed

### 051 - For The Republic

- Internal name: `for-the-republic`
- Type: Upgrade
- Text: If you control 3 or more Republic units, this upgrade costs 2 resources less to play. Attached unit gains: “Coordinate — Restore 2.”
- Status: Unreviewed

### 052 - Hello There

- Internal name: `hello-there`
- Type: Event
- Text: Choose a unit that entered play this phase. It gets –4/–4 for this phase.
- Status: Unreviewed

### 053 - Finn - On the Run

- Internal name: `finn#on-the-run`
- Type: Unit
- Text: When this unit completes an attack: Choose a unique unit. For this phase, if damage would be dealt to that unit, prevent 1 of that damage.
- Rules: A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve. (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 054 - Duchess's Champion

- Internal name: `duchesss-champion`
- Type: Unit
- Text: While an opponent controls 3 or more units, this unit gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 055 - Equalize

- Internal name: `equalize`
- Type: Event
- Text: Give a unit –2/–2 for this phase. Then, if you control fewer units than that unit's controller, give another unit –2/–2 for this phase.
- Status: Unreviewed

### 056 - Compassionate Senator

- Internal name: `compassionate-senator`
- Type: Unit
- Text: Action [2 resources, Exhaust]: Heal 2 damage from a unit or base.
- Status: Unreviewed

### 057 - Warrior Drone

- Internal name: `warrior-drone`
- Type: Unit
- Text: (none)
- Status: Finished

### 059 - Royal Guard Attaché

- Internal name: `royal-guard-attache`
- Type: Unit
- Text: When Played: Deal 2 damage to this unit.
- Status: Unreviewed

### 060 - Trade Federation Shuttle

- Internal name: `trade-federation-shuttle`
- Type: Unit
- Text: When Played: If you control a damaged unit, create a Battle Droid token.
- Status: Unreviewed

### 061 - Infantry of the 212th

- Internal name: `infantry-of-the-212th`
- Type: Unit
- Text: Coordinate — Sentinel (Gain this keyword while you control 3 or more units. Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 062 - Daughter of Dathomir

- Internal name: `daughter-of-dathomir`
- Type: Unit
- Text: While this unit is undamaged, it gains Restore 2. (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 063 - Vulture Interceptor Wing

- Internal name: `vulture-interceptor-wing`
- Type: Unit
- Text: On Attack: Give an enemy unit –1/–1 for this phase.
- Status: Unreviewed

### 064 - Ki-Adi-Mundi - Composed and Confident

- Internal name: `kiadimundi#composed-and-confident`
- Type: Unit
- Text: Coordinate — When an opponent plays their second card each phase: You may draw 2 cards.
- Status: Unreviewed

### 065 - Falchion Ion Tank

- Internal name: `falchion-ion-tank`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 066 - Multi-Troop Transport

- Internal name: `multitroop-transport`
- Type: Unit
- Text: Exploit 2 (While playing this card, defeat up to 2 units you control. This card costs 2 resources less for each unit defeated this way.) On Attack: Create a Battle Droid token.
- Status: Unreviewed

### 067 - The Zillo Beast - Awoken From The Depths

- Internal name: `the-zillo-beast#awoken-from-the-depths`
- Type: Unit
- Text: When Played: Give each enemy ground unit –5/–0 for this phase. When the regroup phase starts: Heal 5 damage from this unit.
- Status: Unreviewed

### 068 - Foresight

- Internal name: `foresight`
- Type: Upgrade
- Text: Attached unit gains: “When the regroup phase starts (before drawing cards): Name a card, then look at the top card of your deck. If it's the named card, you may reveal and draw it.”
- Rules: Abilities that refer to a card's “name” do not include the subtitle of the card.
- Status: Unreviewed

### 069 - Roger Roger

- Internal name: `roger-roger`
- Type: Upgrade
- Text: When Defeated: Attach this upgrade to a friendly Battle Droid token.
- Status: Unreviewed

### 070 - Perilous Position

- Internal name: `perilous-position`
- Type: Upgrade
- Text: When Played: Exhaust attached unit.
- Status: Unreviewed

### 071 - Unshakeable Will

- Internal name: `unshakeable-will`
- Type: Upgrade
- Text: Attached unit gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 072 - I Have the High Ground

- Internal name: `i-have-the-high-ground`
- Type: Event
- Text: Choose a friendly unit. Each enemy unit gets –4/–0 while attacking that unit this phase.
- Rules: (ERRATA) Choose a friendly unit. For this phase, while that unit is defending, the attacker gets –4/–0.
- Status: Unreviewed

### 073 - Grievous Reassembly

- Internal name: `grievous-reassembly`
- Type: Event
- Text: Heal 3 damage from a unit. Create a Battle Droid token.
- Status: Unreviewed

### 074 - Guarding the Way

- Internal name: `guarding-the-way`
- Type: Event
- Text: Give a unit Sentinel for this phase. (Units in its arena can't attack your non-Sentinel units or your base.) If you have the initiative, also give that unit +2/+2 for this phase.
- Status: Unreviewed

### 075 - Disruptive Burst

- Internal name: `disruptive-burst`
- Type: Event
- Text: Give each enemy unit –1/–1 for this phase.
- Status: Unreviewed

### 076 - Death by Droids

- Internal name: `death-by-droids`
- Type: Event
- Text: Defeat a unit that costs 3 or less. Create 2 Battle Droid tokens.
- Rules: Abilities that refer to a card's cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 077 - Vanquish

- Internal name: `vanquish`
- Type: Event
- Text: Defeat a non-leader unit.
- Status: Unreviewed

### 078 - The Invasion of Christophsis

- Internal name: `the-invasion-of-christophsis`
- Type: Event
- Text: Exploit 4 Choose an opponent. Defeat each unit that player controls.
- Status: Unreviewed

### 079 - Confederate Courier

- Internal name: `confederate-courier`
- Type: Unit
- Text: When Defeated: Create a Battle Droid token.
- Status: Unreviewed

### 080 - Poggle the Lesser - Archduke of the Stalgasin Hive

- Internal name: `poggle-the-lesser#archduke-of-the-stalgasin-hive`
- Type: Unit
- Text: When you play another unit: You may exhaust this unit. If you do, create a Battle Droid token.
- Status: Unreviewed

### 081 - Droid Commando

- Internal name: `droid-commando`
- Type: Unit
- Text: While you control another Separatist unit, this unit gains Ambush. (When you play this unit, it may ready and attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 082 - MagnaGuard Wing Leader

- Internal name: `magnaguard-wing-leader`
- Type: Unit
- Text: Action: Attack with a Droid unit. Then, attack with another Droid unit. Use this ability only once each round.
- Rules: If you use MagnaGuard Wing Leader's ability, you must attack with two droid units, if able. Units must be ready in order to attack. Fully resolve the first attack, including all triggers, before beginning the second attack. MagnaGuard Wing Leader's action ability cannot be used as an action if you can't attack with a Droid unit, as it would not change the game state. MagnaGuard Wing Leader's action ability can be used as an action even if you can't attack with a Droid unit, since making the ability no longer usable changes the game state.
- Status: Unreviewed

### 083 - General's Guardian

- Internal name: `generals-guardian`
- Type: Unit
- Text: When this unit is attacked: Create a Battle Droid token.
- Rules: “When this unit is attacked” triggers at the same time as “On Attack” abilities. On Defense abilities trigger when this unit is chosen as the defender for an attack, in the same window as the attacker's On Attack abilities.
- Status: Unreviewed

### 084 - Kraken - Confederate Tactician

- Internal name: `kraken#confederate-tactician`
- Type: Unit
- Text: When Played: Create 2 Battle Droid tokens. On Attack: Give each friendly token unit +1/+1 for this phase.
- Status: Unreviewed

### 085 - Kalani - Analytical General

- Internal name: `kalani#analytical-general`
- Type: Unit
- Text: On Attack: You may choose another unit. If you have the initiative, you may choose up to 2 other units instead. Give each chosen unit +2/+2 for this phase.
- Status: Unreviewed

### 086 - Admiral Trench - Holding the Line

- Internal name: `admiral-trench#holding-the-line`
- Type: Unit
- Text: Exploit 1 When Played: Return up to 3 units that were defeated this phase from your discard pile to your hand.
- Status: Unreviewed

### 087 - Separatist Super Tank

- Internal name: `separatist-super-tank`
- Type: Unit
- Text: Exploit 3 (While playing this card, defeat up to 3 units you control. This card costs 2 resources less for each unit defeated this way.)
- Status: Unreviewed

### 088 - Reprocess

- Internal name: `reprocess`
- Type: Event
- Text: Choose up to 4 units in your discard pile. Put them on the bottom of your deck in a random order and create that many Battle Droid tokens.
- Status: Unreviewed

### 089 - Consolidation of Power

- Internal name: `consolidation-of-power`
- Type: Event
- Text: Choose any number of friendly units. You may play a unit from your hand if its cost is less than or equal to the combined power of the chosen units for free. Then, defeat the chosen units.
- Rules: Abilities that refer to a card's cost always refer to its printed cost, regardless of modifiers. Abilities that refer to a card's power include temporary modifiers. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs.
- Status: Unreviewed

### 090 - Echo - Valiant ARC Trooper

- Internal name: `echo#valiant-arc-trooper`
- Type: Unit
- Text: Coordinate — This unit gets +2/+2. (Gain this ability while you control 3 or more units.)
- Status: Unreviewed

### 091 - Republic Tactical Officer

- Internal name: `republic-tactical-officer`
- Type: Unit
- Text: When Played: You may attack with a Republic unit. It gets +2/+0 for this attack.
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 092 - Admiral Yularen - Advising Caution

- Internal name: `admiral-yularen#advising-caution`
- Type: Unit
- Text: Restore 1 Each other friendly Heroism unit gets +0/+1.
- Status: Unreviewed

### 093 - Advanced Recon Commando

- Internal name: `advanced-recon-commando`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 094 - Shaak Ti - Unity Wins Wars

- Internal name: `shaak-ti#unity-wins-wars`
- Type: Unit
- Text: Each friendly token unit gets +1/+0. On Attack: Create a Clone Trooper token.
- Status: Unreviewed

### 095 - Pelta Supply Frigate

- Internal name: `pelta-supply-frigate`
- Type: Unit
- Text: Coordinate — When Played: Create a Clone Trooper token. (Gain this ability while you control 3 or more units, including this one.)
- Rules: If you play Pelta Supply Frigate and control two other units, its "When Played" ability triggers.
- Status: Unreviewed

### 096 - Aayla Secura - Master of the Blade

- Internal name: `aayla-secura#master-of-the-blade`
- Type: Unit
- Text: Coordinate — On Attack: Prevent all combat damage that would be dealt to this unit for this attack.
- Rules: “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. (ERRATA) Trait(s): Force, Jedi, Republic, Twi'lek
- Status: Unreviewed

### 097 - Captain Rex - Lead by Example

- Internal name: `captain-rex#lead-by-example`
- Type: Unit
- Text: When Played: Create 2 Clone Trooper tokens.
- Status: Unreviewed

### 098 - Republic Defense Carrier

- Internal name: `republic-defense-carrier`
- Type: Unit
- Text: This unit costs 1 resource less to play for each unit controlled by the opponent who controls the most units. Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 099 - Synchronized Strike

- Internal name: `synchronized-strike`
- Type: Event
- Text: Deal damage to an enemy unit equal to the number of units you control in its arena.
- Status: Unreviewed

### 100 - Petition the Senate

- Internal name: `petition-the-senate`
- Type: Event
- Text: If you control 3 or more Official units, draw 3 cards.
- Status: Unreviewed

### 101 - Mas Amedda - Vice Chair

- Internal name: `mas-amedda#vice-chair`
- Type: Unit
- Text: When you play another unit: You may exhaust this unit. If you do, search the top 4 cards of your deck for a unit, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Status: Unreviewed

### 102 - Manufactured Soldiers

- Internal name: `manufactured-soldiers`
- Type: Event
- Text: Choose one: <bullet>Create 2 Clone Trooper tokens. Create 3 Battle Droid tokens.</bullet>
- Status: Unreviewed

### 103 - Pyrrhic Assault

- Internal name: `pyrrhic-assault`
- Type: Event
- Text: For this phase, each friendly unit gains: “When Defeated: Deal 2 damage to an enemy unit.”
- Status: Unreviewed

### 104 - Obedient Vanguard

- Internal name: `obedient-vanguard`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.) When Defeated: You may give a Trooper unit +2/+2 for this phase.
- Status: Unreviewed

### 105 - Steadfast Senator

- Internal name: `steadfast-senator`
- Type: Unit
- Text: Action [2 resources, Exhaust]: Attack with a unit. It gets +2/+0 for this attack.
- Rules: If you use Steadfast Senator's ability, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 106 - Coruscant Guard

- Internal name: `coruscant-guard`
- Type: Unit
- Text: Coordinate — Ambush (Gain this keyword while you control 3 or more units, including this one. When you play this unit, it may ready and attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. If you play Coruscant Guard and control two other units, its Ambush ability triggers.
- Status: Unreviewed

### 107 - Patrolling V-Wing

- Internal name: `patrolling-vwing`
- Type: Unit
- Text: When Played: Draw a card.
- Status: Unreviewed

### 108 - Ryloth Militia

- Internal name: `ryloth-militia`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.)
- Status: Unreviewed

### 109 - 501st Liberator

- Internal name: `501st-liberator`
- Type: Unit
- Text: When Played: If you control another Republic unit, you may heal 3 damage from a base.
- Status: Unreviewed

### 110 - Huyang - Enduring Instructor

- Internal name: `huyang#enduring-instructor`
- Type: Unit
- Text: When Played: Choose another friendly unit. While this unit is in play, the chosen unit gets +2/+2.
- Rules: Until Huyang leaves play, the friendly unit gets +2/+2. This effect is not changed if an opponent takes control of Huyang. If Huyang is captured and then rescued, his "When Played" effect does not resume.
- Status: Unreviewed

### 111 - Republic ARC-170

- Internal name: `republic-arc170`
- Type: Unit
- Text: (none)
- Status: Finished

### 112 - Subjugating Starfighter

- Internal name: `subjugating-starfighter`
- Type: Unit
- Text: Ambush (When you play this unit, it may ready and attack an enemy unit.) When Played: If you have the initiative, create a Battle Droid token.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 113 - B2 Legionnaires

- Internal name: `b2-legionnaires`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 114 - Clone Commander Cody - Commanding the 212th

- Internal name: `clone-commander-cody#commanding-the-212th`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) Coordinate — Each other friendly unit gets +1/+1 and gains Overwhelm. (Gain this ability while you control 3 or more units.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 115 - Osi Sobeck - Warden of the Citadel

- Internal name: `osi-sobeck#warden-of-the-citadel`
- Type: Unit
- Text: Exploit 3 When Played: This unit captures an enemy non-leader ground unit with cost equal to or less than the number of resources paid to play this unit.
- Rules: Abilities that refer to a card's cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 116 - Clone

- Internal name: `clone`
- Type: Unit
- Text: You may have this unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique. (Only the card's printed attributes are copied.)
- Rules: Clone remains in play as a modified copy of the chosen unit even if the chosen unit leaves play. If Clone is captured and later rescued, it may only enter play as a copy of a unit currently in play. (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 117 - Baktoid Spider Droid

- Internal name: `baktoid-spider-droid`
- Type: Unit
- Text: Exploit 2 (While playing this card, defeat up to 2 units you control. This card costs 2 resources less for each unit defeated this way.) Ambush (When you play this unit, it may ready and attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 118 - Gor - Grievous's Pet

- Internal name: `gor#grievouss-pet`
- Type: Unit
- Text: Exploit 3 Sentinel Ambush Overwhelm
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 119 - Nameless Valor

- Internal name: `nameless-valor`
- Type: Upgrade
- Text: Attach to a token unit. Attached unit gains Overwhelm. (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 120 - Strategic Acumen

- Internal name: `strategic-acumen`
- Type: Upgrade
- Text: Attached unit gains: “Action [Exhaust]: Play a unit from your hand. It costs 1 resource less.”
- Status: Unreviewed

### 121 - General's Blade

- Internal name: `generals-blade`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. If attached unit is a Jedi, it gains: “On Attack: The next unit you play this phase costs 2 resources less.”
- Rules: The cost reduction from General Blade's gained “On Attack” ability remains active even if General's Blade or the attached unit is defeated.
- Status: Unreviewed

### 122 - Squad Support

- Internal name: `squad-support`
- Type: Upgrade
- Text: Attach to a non-leader unit. Attached unit gains: “This unit gets +1/+1 for each Trooper unit you control.”
- Status: Unreviewed

### 123 - Outflank

- Internal name: `outflank`
- Type: Event
- Text: Attack with 2 units (one at a time).
- Rules: You must attack with two units, if able. Units must be ready in order to attack. Fully resolve the first attack, including all triggers, before beginning the second attack.
- Status: Unreviewed

### 124 - Tactical Advantage

- Internal name: `tactical-advantage`
- Type: Event
- Text: Give a unit +2/+2 for this phase.
- Status: Unreviewed

### 125 - The Clone Wars

- Internal name: `the-clone-wars`
- Type: Event
- Text: Pay any number of resources. Create that many Clone Trooper tokens. Each opponent creates that many Battle Droid tokens.
- Rules: The cost of the event doesn't count toward the number of tokens created.
- Status: Unreviewed

### 126 - Encouraging Leadership

- Internal name: `encouraging-leadership`
- Type: Event
- Text: Give each friendly unit +1/+1 for this phase.
- Status: Unreviewed

### 127 - Resupply

- Internal name: `resupply`
- Type: Event
- Text: Put this event into play as a resource.
- Rules: A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”.
- Status: Unreviewed

### 128 - Take Captive

- Internal name: `take-captive`
- Type: Event
- Text: A friendly unit captures an enemy non-leader unit in the same arena. (Put the captured card facedown under that unit until that unit leaves play.)
- Status: Unreviewed

### 129 - In Defense of Kamino

- Internal name: `in-defense-of-kamino`
- Type: Event
- Text: For this phase, each friendly Republic unit gains Restore 2 and: “When Defeated: Create a Clone Trooper token.”
- Status: Unreviewed

### 130 - Bo-Katan Kryze - Death Watch Lieutenant

- Internal name: `bokatan-kryze#death-watch-lieutenant`
- Type: Unit
- Text: While you control another Mandalorian unit, this unit gains Overwhelm and Saboteur. While you control another Trooper unit, this unit gets +1/+0.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 131 - OOM-Series Officer

- Internal name: `oomseries-officer`
- Type: Unit
- Text: When Defeated: Deal 2 damage to a base.
- Status: Unreviewed

### 132 - Confederate Tri-Fighter

- Internal name: `confederate-trifighter`
- Type: Unit
- Text: Bases can't be healed.
- Status: Unreviewed

### 133 - B1 Attack Platform

- Internal name: `b1-attack-platform`
- Type: Unit
- Text: (none)
- Status: Finished

### 134 - Asajj Ventress - Count Dooku's Assassin

- Internal name: `asajj-ventress#count-dookus-assassin`
- Type: Unit
- Text: Exploit 2 (While playing this card, defeat up to 2 units you control. This card costs 2 resources less for each unit defeated this way.) On Attack: If you've attacked with another Separatist unit this phase, this unit gets +3/+0 for this phase.
- Status: Unreviewed

### 135 - Darth Maul - Revenge At Last

- Internal name: `darth-maul#revenge-at-last`
- Type: Unit
- Text: This unit can attack 2 units instead of 1. (This unit deals its combat damage to both defenders and they both deal their combat damage to this unit. All damage is dealt simultaneously.)
- Rules: If Darth Maul attacks two units instead of one, both units are considered defenders of one attack. Each step of the attack and any triggered abilities only occur once, as usual. Darth Maul deals combat damage equal to his power to both defenders, and both defenders deal combat damage to Darth Maul. All combat damage is dealt simultaneously. Darth Maul may not attack a base and a unit simultaneously. If Darth Maul has Overwhelm, he may deal damage to the defending player's base equal to the combined excess damage of his attack on both defenders. If the defending player controls at least one unit with Sentinel, Darth Maul may only choose Sentinels as the defenders for his attack, unless he has Saboteur.
- Status: Unreviewed

### 136 - Squadron of Vultures

- Internal name: `squadron-of-vultures`
- Type: Unit
- Text: Exploit 3 (While playing this card, defeat up to 3 units you control. This card costs 2 resources less for each unit defeated this way.)
- Status: Unreviewed

### 137 - Savage Opress - Monster

- Internal name: `savage-opress#monster`
- Type: Unit
- Text: When Played: If you control fewer units (including this one) than an opponent, ready this unit.
- Status: Unreviewed

### 138 - Count Dooku - Fallen Jedi

- Internal name: `count-dooku#fallen-jedi`
- Type: Unit
- Text: Exploit 2 Overwhelm When Played: For each unit you exploited while playing this card, you may deal damage to an enemy unit equal to the power of the exploited unit.
- Rules: Abilities that refer to a card's power include temporary modifiers. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. All damage dealt by Count Dooku's "When Played" ability is dealt simultaneously.
- Status: Unreviewed

### 139 - Corner the Prey

- Internal name: `corner-the-prey`
- Type: Event
- Text: Attack with a unit. It gets +1/+0 for this attack for each damage on the defender at the start of this attack.
- Rules: If you play Corner the Prey, you must attack with a unit, if able. Units must be ready in order to attack. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 140 - Self-Destruct

- Internal name: `selfdestruct`
- Type: Event
- Text: Defeat a friendly unit. If you do, deal 4 damage to a unit.
- Status: Unreviewed

### 141 - Soldier of the 501st

- Internal name: `soldier-of-the-501st`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.)
- Status: Unreviewed

### 142 - Anakin's Interceptor - Where the Fun Begins

- Internal name: `anakins-interceptor#where-the-fun-begins`
- Type: Unit
- Text: While your base has 15 or more damage on it, this unit gets +2/+0.
- Status: Unreviewed

### 143 - Jyn Erso - Stardust

- Internal name: `jyn-erso#stardust`
- Type: Unit
- Text: While an enemy unit has been defeated this phase, this unit gets +1/+0 and gains Saboteur.
- Status: Unreviewed

### 144 - Batch Brothers

- Internal name: `batch-brothers`
- Type: Unit
- Text: When Played: Create a Clone Trooper token.
- Status: Unreviewed

### 145 - Jesse - Hard-Fighting Patriot

- Internal name: `jesse#hardfighting-patriot`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.) When Played: An opponent creates 2 Battle Droid tokens.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 146 - Steela Gerrera - Beloved Tactician

- Internal name: `steela-gerrera#beloved-tactician`
- Type: Unit
- Text: When Played/When Defeated: You may deal 2 damage to your base. If you do, search the top 8 cards of your deck for a Tactic card, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Status: Unreviewed

### 147 - Anakin Skywalker - Maverick Mentor

- Internal name: `anakin-skywalker#maverick-mentor`
- Type: Unit
- Text: Coordinate — On Attack: Draw a card. (Gain this ability while you control 3 or more units.)
- Status: Unreviewed

### 148 - Senatorial Corvette

- Internal name: `senatorial-corvette`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) When Defeated: Each opponent discards a card from their hand.
- Status: Unreviewed

### 149 - Low Altitude Gunship

- Internal name: `low-altitude-gunship`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) When Played: Choose an enemy unit. Deal 1 damage to it for each friendly Republic unit.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 150 - Saw Gerrera - Resistance is Not Terrorism

- Internal name: `saw-gerrera#resistance-is-not-terrorism`
- Type: Unit
- Text: Raid 2 On Attack: If your base has 15 or more damage on it, deal 1 damage to each enemy ground unit.
- Status: Unreviewed

### 151 - Resolute - Under Anakin's Command

- Internal name: `resolute#under-anakins-command`
- Type: Unit
- Text: This unit costs 1 resource less to play for every 5 damage on your base. When Played/On Attack: Deal 2 damage to an enemy unit and each other enemy unit with the same name as that unit.
- Rules: Abilities that refer to a card's “name” do not include the subtitle of the card.
- Status: Unreviewed

### 152 - Mace Windu's Lightsaber

- Internal name: `mace-windus-lightsaber`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. When Played: If attached unit is Mace Windu, draw 2 cards.
- Status: Unreviewed

### 153 - Bold Resistance

- Internal name: `bold-resistance`
- Type: Event
- Text: Choose up to 3 units that share the same Trait. Each of those units gets +2/+0 for this phase.
- Status: Unreviewed

### 154 - Mister Bones - I Performed Violence

- Internal name: `mister-bones#i-performed-violence`
- Type: Unit
- Text: On Attack: If you have no cards in your hand, you may deal 3 damage to a ground unit.
- Status: Unreviewed

### 155 - Twice the Pride

- Internal name: `twice-the-pride`
- Type: Upgrade
- Text: When Played: Deal 2 damage to attached unit.
- Status: Unreviewed

### 156 - Unlimited Power

- Internal name: `unlimited-power`
- Type: Event
- Text: Deal 4 damage to a unit, 3 damage to a second unit, 2 damage to a third unit, and 1 damage to a fourth unit. (All damage is dealt simultaneously.)
- Rules: All damage dealt by Unlimited Power is dealt simultaneously.
- Status: Unreviewed

### 157 - Disaffected Senator

- Internal name: `disaffected-senator`
- Type: Unit
- Text: Action [2 resources, Exhaust]: Deal 2 damage to a base.
- Status: Unreviewed

### 158 - Clone Heavy Gunner

- Internal name: `clone-heavy-gunner`
- Type: Unit
- Text: Coordinate — This unit gets +2/+0. (Gain this ability while you control 3 or more units.)
- Status: Unreviewed

### 159 - Dendup's Loyalist

- Internal name: `dendups-loyalist`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 160 - Vanguard Droid Bomber

- Internal name: `vanguard-droid-bomber`
- Type: Unit
- Text: When Played: If you control another Separatist unit, deal 2 damage to an enemy base.
- Status: Unreviewed

### 161 - Bold Recon Commando

- Internal name: `bold-recon-commando`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 162 - Reckless Torrent

- Internal name: `reckless-torrent`
- Type: Unit
- Text: Coordinate — When Played: You may deal 2 damage to a friendly unit and 2 damage to an enemy unit in the same arena. (Gain this ability while you control 3 or more units, including this one.)
- Status: Unreviewed

### 163 - Relentless Rocket Droid

- Internal name: `relentless-rocket-droid`
- Type: Unit
- Text: While you control another Trooper unit, this unit gets +2/+0.
- Status: Unreviewed

### 164 - Hevy - Staunch Martyr

- Internal name: `hevy#staunch-martyr`
- Type: Unit
- Text: Coordinate — Raid 2 (Gain this keyword while you control 3 or more units. This unit gets +2/+0 while attacking.) When Defeated: Deal 1 damage to each enemy ground unit.
- Status: Unreviewed

### 165 - Kit Fisto - The Smiling Jedi

- Internal name: `kit-fisto#the-smiling-jedi`
- Type: Unit
- Text: Saboteur Coordinate — On Attack: You may deal 3 damage to a ground unit. (Gain this ability while you control 3 or more units.)
- Status: Unreviewed

### 166 - Aurra Sing - Crackshot Sniper

- Internal name: `aurra-sing#crackshot-sniper`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) When an enemy ground unit attacks your base: Ready this unit.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 167 - Heavy Persuader Tank

- Internal name: `heavy-persuader-tank`
- Type: Unit
- Text: Exploit 2 (While playing this card, defeat up to 2 units you control. This card costs 2 resources less for each unit defeated this way.) When Played: You may deal 2 damage to a ground unit.
- Status: Unreviewed

### 168 - Old Access Codes

- Internal name: `old-access-codes`
- Type: Upgrade
- Text: When Played: If an opponent controls more units than you, draw a card.
- Status: Unreviewed

### 169 - Clone Cohort

- Internal name: `clone-cohort`
- Type: Upgrade
- Text: Attached unit gains Raid 2 and: “When Defeated: Create a Clone Trooper token.”
- Status: Unreviewed

### 170 - Daring Raid

- Internal name: `daring-raid`
- Type: Event
- Text: Deal 2 damage to a unit or base.
- Status: Unreviewed

### 171 - Grenade Strike

- Internal name: `grenade-strike`
- Type: Event
- Text: Deal 2 damage to a unit. You may deal 1 damage to another unit in the same arena.
- Status: Unreviewed

### 172 - Grim Resolve

- Internal name: `grim-resolve`
- Type: Event
- Text: Attack with a non-leader unit. It gains Grit for this attack. (It gets +1/+0 for each damage on it.)
- Rules: If you play Grim Resolve, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 173 - Blood Sport

- Internal name: `blood-sport`
- Type: Event
- Text: Deal 2 damage to each ground unit.
- Status: Unreviewed

### 174 - Open Fire

- Internal name: `open-fire`
- Type: Event
- Text: Deal 4 damage to a unit.
- Status: Unreviewed

### 175 - Strategic Analysis

- Internal name: `strategic-analysis`
- Type: Event
- Text: Draw 3 cards.
- Status: Unreviewed

### 176 - Caught in the Crossfire

- Internal name: `caught-in-the-crossfire`
- Type: Event
- Text: Choose 2 enemy units in the same arena. Each of those units deals damage equal to its power to the other.
- Rules: Abilities that refer to a card's power include temporary modifiers.
- Status: Unreviewed

### 177 - Guerilla Insurgency

- Internal name: `guerilla-insurgency`
- Type: Event
- Text: Each player defeats a resource they control and discards 2 cards from their hand. Deal 4 damage to each ground unit.
- Status: Unreviewed

### 178 - Planetary Invasion

- Internal name: `planetary-invasion`
- Type: Event
- Text: Exploit 3 Ready up to 3 units. Each of those units gets +1/+0 and gains Overwhelm for this phase.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 179 - Soulless One - Customized for Grievous

- Internal name: `soulless-one#customized-for-grievous`
- Type: Unit
- Text: On Attack: You may exhaust a friendly Droid unit or General Grievous (leader or unit). If you do, this unit gets +2/+0 for this attack.
- Status: Unreviewed

### 180 - Separatist Commando

- Internal name: `separatist-commando`
- Type: Unit
- Text: While you control another Separatist unit, this unit gains Raid 2. (It gets +2/+0 while attacking.)
- Status: Unreviewed

### 181 - Elite P-38 Starfighter

- Internal name: `elite-p38-starfighter`
- Type: Unit
- Text: When Played/When Defeated: You may deal 1 damage to a unit.
- Status: Unreviewed

### 182 - Infiltrating Demolisher

- Internal name: `infiltrating-demolisher`
- Type: Unit
- Text: Exploit 1 (While playing this card, defeat up to 1 unit you control. This card costs 2 resources less for each unit defeated this way.) Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 183 - Rush Clovis - Banking Clan Scion

- Internal name: `rush-clovis#banking-clan-scion`
- Type: Unit
- Text: Raid 2 On Attack: If the defending player controls no ready resources, create a Battle Droid token.
- Status: Unreviewed

### 184 - Tactical Droid Commander

- Internal name: `tactical-droid-commander`
- Type: Unit
- Text: Exploit 2 When you play another Separatist unit: You may exhaust a unit that costs the same as or less than the played unit.
- Rules: Abilities that refer to a card's cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 185 - Ziro the Hutt - Colorful Schemer

- Internal name: `ziro-the-hutt#colorful-schemer`
- Type: Unit
- Text: When Played: For each opponent, you may exhaust a unit that player controls. On Attack: For each opponent, you may exhaust a resource that player controls.
- Status: Unreviewed

### 186 - San Hill - Chairman of the Banking Clan

- Internal name: `san-hill#chairman-of-the-banking-clan`
- Type: Unit
- Text: Exploit 3 (While playing this card, defeat up to 3 units you control. This card costs 2 resources less for each unit defeated this way.) On Attack: For each friendly unit that was defeated this phase, ready a friendly resource.
- Status: Unreviewed

### 187 - Cad Bane - Hostage Taker

- Internal name: `cad-bane#hostage-taker`
- Type: Unit
- Text: When Played: This unit captures up to 3 enemy non-leader units with a total of 8 or less remaining HP. On Attack: The defending player may rescue a card they own guarded by this unit. If they do, draw 2 cards.
- Status: Unreviewed

### 188 - Wartime Profiteering

- Internal name: `wartime-profiteering`
- Type: Event
- Text: Look at cards from the top of your deck equal to the number of units that were defeated this phase. Draw 1 and put the others on the bottom of your deck in a random order.
- Status: Unreviewed

### 189 - Unnatural Life

- Internal name: `unnatural-life`
- Type: Event
- Text: Play a unit that was defeated this phase from your discard pile. It costs 2 resources less and enters play ready. At the start of the regroup phase, defeat it.
- Status: Unreviewed

### 190 - On the Doorstep

- Internal name: `on-the-doorstep`
- Type: Event
- Text: Create 3 Battle Droid tokens and ready them.
- Status: Unreviewed

### 191 - Wolf Pack Escort

- Internal name: `wolf-pack-escort`
- Type: Unit
- Text: When Played: You may return a friendly non-leader, non-Vehicle unit to its owner's hand.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 192 - Padmé Amidala - Pursuing Peace

- Internal name: `padme-amidala#pursuing-peace`
- Type: Unit
- Text: Coordinate — On Attack: Give an enemy unit –3/–0 for this phase. (Gain this ability while you control 3 or more units.)
- Status: Unreviewed

### 193 - R2-D2 - Full of Solutions

- Internal name: `r2d2#full-of-solutions`
- Type: Unit
- Text: When Played: You may discard a card from your hand. If you do, search the top 3 cards of your deck for a card and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Status: Unreviewed

### 194 - Ahsoka Tano - Always Ready For Trouble

- Internal name: `ahsoka-tano#always-ready-for-trouble`
- Type: Unit
- Text: While you control fewer units than an opponent (including this unit), this unit gains Ambush. Action [2 resources]: Return this unit and each upgrade on her to their owners' hands.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. Ahsoka's action ability may only be used if she is in play. If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 195 - Sabine Wren - You Can Count On Me

- Internal name: `sabine-wren#you-can-count-on-me`
- Type: Unit
- Text: While this unit is exhausted, she can't be attacked (unless she gains Sentinel). On Attack: You may discard a card from your deck. If it doesn't share an aspect with your base, deal 2 damage to a ground unit.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise. If a unit that can't be attacked gains Sentinel, it can be attacked.
- Status: Unreviewed

### 196 - Plo Koon - Koh-to-yah!

- Internal name: `plo-koon#kohtoyah`
- Type: Unit
- Text: Ambush (When you play this unit, it may ready and attack an enemy unit.) Coordinate — Raid 3 (Gain this keyword while you control 3 or more units. This unit gets +3/+0 while attacking.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 197 - Republic Attack Pod

- Internal name: `republic-attack-pod`
- Type: Unit
- Text: If you control 3 or more units, this unit costs 1 resource less to play.
- Status: Unreviewed

### 198 - Enfys Nest - Champion of Justice

- Internal name: `enfys-nest#champion-of-justice`
- Type: Unit
- Text: Saboteur When Played/On Attack: You may return an enemy non-leader unit with less power than this unit to its owner's hand.
- Rules: Abilities that refer to a card's power include temporary modifiers. Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 199 - Clear the Field

- Internal name: `clear-the-field`
- Type: Event
- Text: Choose a non-leader unit that costs 3 or less. Return it and each enemy non-leader unit with the same name as it to their owners' hands.
- Rules: Abilities that refer to a card's cost always refer to its printed cost, regardless of modifiers. Abilities that refer to a card's “name” do not include the subtitle of the card. Clear the Field requires you to choose a unit in play and only returns units in play to hand.
- Status: Unreviewed

### 200 - Creative Thinking

- Internal name: `creative-thinking`
- Type: Event
- Text: Exhaust a non-unique unit. Create a Clone Trooper token.
- Rules: (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 201 - Aid from the Innocent

- Internal name: `aid-from-the-innocent`
- Type: Event
- Text: Search the top 10 cards of your deck for 2 Heroism non-unit cards and discard them. (Put the other cards on the bottom of your deck in a random order.) For this phase, you may play the discarded cards, and they each cost 2 resources less.
- Status: Unreviewed

### 202 - Jar Jar Binks - Foolish Gungan

- Internal name: `jar-jar-binks#foolish-gungan`
- Type: Unit
- Text: On Attack: Deal 2 damage to a random unit or base.
- Rules: When choosing randomly from a set of options, any method agreed upon by both players is acceptable, so long as each option has an equal likelihood of being chosen.
- Status: Unreviewed

### 203 - Chancellor Palpatine - Wartime Chancellor

- Internal name: `chancellor-palpatine#wartime-chancellor`
- Type: Unit
- Text: Each token unit you create enters play ready. On Attack: If a unit left play this phase, create a Clone Trooper token.
- Status: Unreviewed

### 204 - Impropriety Among Thieves

- Internal name: `impropriety-among-thieves`
- Type: Event
- Text: Choose a ready non-leader unit controlled by each player. If you do, each player takes control of the chosen unit controlled by the player to their right. At the start of the regroup phase, each player takes control of each unit they own that was chosen for this ability.
- Status: Unreviewed

### 205 - Clone Dive Trooper

- Internal name: `clone-dive-trooper`
- Type: Unit
- Text: Coordinate — While this unit is attacking, the defender gets –2/–0. (Gain this ability while you control 3 or more units.)
- Rules: (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 206 - Independent Senator

- Internal name: `independent-senator`
- Type: Unit
- Text: Action [2 resources, Exhaust]: Exhaust a unit with 4 or less power.
- Rules: Abilities that refer to a card's power include temporary modifiers.
- Status: Unreviewed

### 207 - B1 Security Team

- Internal name: `b1-security-team`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 208 - Favorable Delegate

- Internal name: `favorable-delegate`
- Type: Unit
- Text: When Played: Draw a card. When Defeated: Discard a card from your hand.
- Status: Unreviewed

### 209 - Hotshot V-Wing

- Internal name: `hotshot-vwing`
- Type: Unit
- Text: (none)
- Status: Finished

### 210 - Lux Bonteri - Renegade Separatist

- Internal name: `lux-bonteri#renegade-separatist`
- Type: Unit
- Text: When an opponent plays a card: If that opponent paid less than the card's cost to play it, ready or exhaust a unit.
- Rules: Abilities that refer to a card's cost always refer to its printed cost, regardless of modifiers. "Paid less than the card's cost to play it" means the opponent paid fewer resources than the card's printed cost.
- Status: Unreviewed

### 211 - Sly Moore - Secretive Advisor

- Internal name: `sly-moore#secretive-advisor`
- Type: Unit
- Text: When Played: Take contol of an enemy token unit and ready it. At the start of the regroup phase, that token unit's owner takes control of it.
- Rules: The delayed effect of Sly Moore's "When Played" ability remains active even if Sly Moore is defeated. (ERRATA) When Played: Take control of an enemy token unit and ready it. At the start of the regroup phase, that token unit’s owner takes control of it.
- Status: Unreviewed

### 212 - Freelance Assassin

- Internal name: `freelance-assassin`
- Type: Unit
- Text: When Played: You may pay 2 resources. If you do, deal 2 damage to a unit.
- Status: Unreviewed

### 213 - Sanctioner's Shuttle

- Internal name: `sanctioners-shuttle`
- Type: Unit
- Text: Coordinate — When Played: This unit captures an enemy non-leader unit that costs 3 or less. (Gain this ability while you control 3 or more units, including this one.)
- Rules: Abilities that refer to a card's cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 214 - Hidden Sharpshooter

- Internal name: `hidden-sharpshooter`
- Type: Unit
- Text: Ambush (When you play this unit, it may ready and attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 215 - Geonosis Patrol Fighter

- Internal name: `geonosis-patrol-fighter`
- Type: Unit
- Text: Exploit 2 (While playing this card, defeat up to 2 units you control. This card costs 2 resources less for each unit defeated this way.) When Played: You may return a non-leader unit that costs 3 or less to its owner's hand.
- Rules: Abilities that refer to a card's cost always refer to its printed cost, regardless of modifiers. Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 216 - Fives - In Search of Truth

- Internal name: `fives#in-search-of-truth`
- Type: Unit
- Text: Saboteur When you play an event: You may put a Clone unit from your discard pile on the bottom of your deck. If you do, draw a card.
- Status: Unreviewed

### 217 - Tri-Droid Suppressor

- Internal name: `tridroid-suppressor`
- Type: Unit
- Text: Exploit 2 (While playing this card, defeat up to 2 units you control. This card costs 2 resources less for each unit defeated this way.) When Played: Exhaust an enemy ground unit.
- Status: Unreviewed

### 218 - Droid Cohort

- Internal name: `droid-cohort`
- Type: Upgrade
- Text: Attached unit gains, “When Defeated: Create a Battle Droid token.”
- Status: Unreviewed

### 219 - On Top of Things

- Internal name: `on-top-of-things`
- Type: Upgrade
- Text: When Played: Attached unit can't be attacked this phase (unless it has Sentinel).
- Rules: If a unit that can't be attacked gains Sentinel, it can be attacked.
- Status: Unreviewed

### 220 - Shadowed Intentions

- Internal name: `shadowed-intentions`
- Type: Upgrade
- Text: Attached unit gains: “This unit can't be captured, defeated, or returned to its owner's hand by enemy card abilities.”
- Status: Unreviewed

### 221 - In Pursuit

- Internal name: `in-pursuit`
- Type: Event
- Text: Exhaust a friendly unit. If you do, exhaust an enemy unit.
- Status: Unreviewed

### 222 - Political Pressure

- Internal name: `political-pressure`
- Type: Event
- Text: Choose an opponent. They may discard a random card from their hand. If they don't, create 2 Battle Droid tokens.
- Status: Unreviewed

### 223 - Unmasking the Conspiracy

- Internal name: `unmasking-the-conspiracy`
- Type: Event
- Text: Discard a card from your hand. If you do, look at an opponent's hand and discard a card from it.
- Status: Unreviewed

### 224 - Breaking In

- Internal name: `breaking-in`
- Type: Event
- Text: Attack with a unit. It gets +2/+0 and gains Saboteur for this attack. (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Rules: If you play Breaking In, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 225 - Now There Are Two of Them

- Internal name: `now-there-are-two-of-them`
- Type: Event
- Text: If you control exactly one unit, play a non-Vehicle unit from your hand that shares a Trait with the unit you control. It costs 5 resources less.
- Status: Unreviewed

### 226 - Waylay

- Internal name: `waylay`
- Type: Event
- Text: Return a non-leader unit to its owner's hand.
- Rules: Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 227 - Prisoner of War

- Internal name: `prisoner-of-war`
- Type: Event
- Text: A friendly unit captures an enemy non-leader, non-Vehicle unit. If the enemy unit costs less than the friendly unit, create 2 Battle Droid tokens. (Put the captured card facedown under the friendly unit until that unit leaves play.)
- Rules: Abilities that refer to a card's cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 228 - Droid Starfighter

- Internal name: `droid-starfighter`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 229 - Battle Droid Escort

- Internal name: `battle-droid-escort`
- Type: Unit
- Text: When Played/When Defeated: Create a Battle Droid token.
- Status: Unreviewed

### 230 - Super Battle Droid

- Internal name: `super-battle-droid`
- Type: Unit
- Text: (none)
- Status: Finished

### 231 - Dwarf Spider Droid

- Internal name: `dwarf-spider-droid`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 232 - Patrolling AAT

- Internal name: `patrolling-aat`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 233 - Hailfire Tank

- Internal name: `hailfire-tank`
- Type: Unit
- Text: Exploit 2 (While playing this card, defeat up to 2 units you control. This card costs 2 resources less for each unit defeated this way.)
- Status: Unreviewed

### 234 - The Invisible Hand - Imposing Flagship

- Internal name: `the-invisible-hand#imposing-flagship`
- Type: Unit
- Text: When Played: Create 4 Battle Droid tokens. On Attack: Exhaust any number of friendly Separatist units. Deal 1 damage to the defending player's base for each unit exhausted this way.
- Status: Unreviewed

### 235 - Battle Droid Legion

- Internal name: `battle-droid-legion`
- Type: Unit
- Text: Exploit 2 (While playing this card, defeat up to 2 units you control. This card costs 2 resources less for each unit defeated this way.) When Defeated: Create 3 Battle Droid tokens.
- Status: Unreviewed

### 236 - Grievous's Wheel Bike

- Internal name: `grievouss-wheel-bike`
- Type: Upgrade
- Text: While playing this upgrade on General Grievous, it costs 2 resources less to play. Attach to a non-Vehicle unit. Attached unit gains Overwhelm.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 237 - Droid Deployment

- Internal name: `droid-deployment`
- Type: Event
- Text: Create 2 Battle Droid tokens.
- Status: Unreviewed

### 238 - Merciless Contest

- Internal name: `merciless-contest`
- Type: Event
- Text: Each player chooses a non-leader unit they control. Defeat those units.
- Status: Unreviewed

### 239 - Execute Order 66

- Internal name: `execute-order-66`
- Type: Event
- Text: Deal 6 damage to each Jedi unit. For each unit defeated this way, its controller creates a Clone Trooper token.
- Status: Unreviewed

### 240 - 332nd Stalwart

- Internal name: `332nd-stalwart`
- Type: Unit
- Text: Coordinate — This unit gets +1/+1. (Gain this ability while you control 3 or more units.)
- Status: Unreviewed

### 241 - Phase I Clone Trooper

- Internal name: `phase-i-clone-trooper`
- Type: Unit
- Text: (none)
- Status: Finished

### 242 - Phase II Clone Trooper

- Internal name: `phase-ii-clone-trooper`
- Type: Unit
- Text: Ambush (When you play this unit, it may ready and attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 243 - Republic Commando

- Internal name: `republic-commando`
- Type: Unit
- Text: Coordinate — Saboteur (Gain this keyword while you control 3 or more units. When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 244 - Eta-2 Light Interceptor

- Internal name: `eta2-light-interceptor`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 245 - Armored Saber Tank

- Internal name: `armored-saber-tank`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 246 - Tranquility - Inspiring Flagship

- Internal name: `tranquility#inspiring-flagship`
- Type: Unit
- Text: When Played: You may return a Republic unit from your discard pile to your hand. On Attack: Each of the next 3 Republic cards you play this phase costs 1 resource less.
- Rules: The cost reduction from Tranquility's “On Attack” ability remains active even if Tranquility is defeated.
- Status: Unreviewed

### 247 - AT-TE Vanguard

- Internal name: `atte-vanguard`
- Type: Unit
- Text: Restore 3 (When this unit attacks, heal 3 damage from your base.) When Defeated: Create 2 Clone Trooper tokens.
- Status: Unreviewed

### 248 - Ahsoka's Padawan Lightsaber

- Internal name: `ahsokas-padawan-lightsaber`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. When Played: If attached unit is Ahsoka Tano, you may attack with a unit.
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 249 - Heroes on Both Sides

- Internal name: `heroes-on-both-sides`
- Type: Event
- Text: Choose up to 1 Republic unit and up to 1 Separatist unit. Give each chosen unit +2/+2 and Saboteur for this phase. (When either of those units attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 250 - Sword and Shield Maneuver

- Internal name: `sword-and-shield-maneuver`
- Type: Event
- Text: Give each friendly Trooper unit Raid 1 for this phase. Give each friendly Jedi unit Sentinel for this phase.
- Status: Unreviewed

### 251 - Drop In

- Internal name: `drop-in`
- Type: Event
- Text: Create 2 Clone Trooper tokens.
- Status: Unreviewed

### 252 - Aggrieved Parliamentarian

- Internal name: `aggrieved-parliamentarian`
- Type: Unit
- Text: When Played: Choose an opponent. They shuffle their discard pile and put it on the bottom of their deck.
- Status: Unreviewed

### 253 - Headhunter Squadron

- Internal name: `headhunter-squadron`
- Type: Unit
- Text: (none)
- Status: Finished

### 254 - Volunteer Soldier

- Internal name: `volunteer-soldier`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.) If you control a TROOPER unit, this unit costs [1 resource] less to play.
- Status: Unreviewed

### 255 - Brain Invaders

- Internal name: `brain-invaders`
- Type: Unit
- Text: Each leader loses all abilities except for epic actions and can't gain abilities.
- Rules: (ERRATA) Each non-upgrade leader loses all abilities except for epic actions. (ERRATA) Templating update: “Lose all abilities and can't gain abilities” becomes “lose all abilities”.
- Status: Unreviewed

### 256 - Hold-Out Blaster

- Internal name: `holdout-blaster`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. When Played: You may have attached unit deal 1 damage to a ground unit.
- Status: Unreviewed

### 257 - Private Manufacturing

- Internal name: `private-manufacturing`
- Type: Event
- Text: Draw 2 cards. If you control no token units, put 2 cards from your hand on the bottom of your deck in any order.
- Status: Unreviewed

## Tokens

### Token - Battle Droid

- Internal name: `battle-droid`
- Type: Token, Unit
- Text: (none)
- Status: Finished

### Token - Clone Trooper

- Internal name: `clone-trooper`
- Type: Token, Unit
- Text: (none)
- Status: Finished

