# 06_SEC (SEC) card review

264 cards + 1 token, in set order. Review against the official card text (`test/json/Card/`), not our implementations.

### 001 - Chancellor Palpatine - How Liberty Dies

- Internal name: `chancellor-palpatine#how-liberty-dies`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Search the top 5 cards of your deck for a card with Plot, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Deployed: When Deployed: The next card you play using Plot this phase costs 3 resources less.
- Rules: The cost discount from Palpatine's “When Deployed” ability remains active even if he is defeated before you play a card using Plot. After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 002 - Jabba the Hutt - Wonderful Human Being

- Internal name: `jabba-the-hutt#wonderful-human-being`
- Type: Leader
- Text: Action [1 resource, Exhaust]: A friendly damaged unit deals 1 damage to an enemy unit. If the friendly unit has 3 or more damage on it, it deals 2 damage instead.
- Deployed: When another friendly unit is dealt damage and survives: You may have that unit deal that much damage to an enemy unit. Use this ability only once each round.
- Rules: Jabba's ability triggers when a friendly unit is dealt combat damage or non-combat damage.
- Status: Unreviewed

### 003 - Lama Su - We Modified Their Genetics

- Internal name: `lama-su#we-modified-their-genetics`
- Type: Leader
- Text: Action [Exhaust]: Play an upgrade from your hand on a friendly non-Vehicle unit. It costs 1 resource less. If you do, deal 1 damage to that unit.
- Deployed: When this unit completes an attack (and survives): You may play an upgrade from your discard pile on a friendly non-Vehicle unit. It costs 1 resource less.
- Rules: When using Lama Su's leader ability, the damage is dealt to the unit before any triggered abilities resolve from playing the upgrade. A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 004 - Leia Organa - Of A Secret Bloodline

- Internal name: `leia-organa#of-a-secret-bloodline`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Disclose Vigilance, Command, Aggression, Cunning, or Heroism (reveal a card from your hand with this aspect icon). If you do, give an Experience token to a unit that doesn't share an aspect with the disclosed card.
- Deployed: On Attack: You may disclose Vigilance, Command, Aggression, Cunning, or Heroism. If you do, give an Experience token to a unit that doesn't share an aspect with the disclosed card.
- Rules: Leia's ability can only give an Experience token to a unit that shares no aspects with the disclosed card, regardless of which aspect was disclosed. You may use Leia's "On Attack" ability to give an Experience token to herself if the disclosed card doesn't share an aspect with her. This occurs before combat damage is dealt.
- Status: Unreviewed

### 005 - Satine Kryze - Standing on Principles

- Internal name: `satine-kryze#standing-on-principles`
- Type: Leader
- Text: Action [Exhaust]: Heal up to 2 damage from a unit. If you do, deal that much damage to your base.
- Deployed: Restore 4
- Rules: You can use Satine's leader ability and choose to heal 0 damage from a unit, but if you do, you are not considered to have healed any damage.
- Status: Unreviewed

### 006 - Colonel Yularen - This Is Why We Plan

- Internal name: `colonel-yularen#this-is-why-we-plan`
- Type: Leader
- Text: Action [Exhaust]: Attack with a unit. Then, you may attack with another unit that costs less than it.
- Deployed: When this unit completes an attack (and survives): You may attack with another unit that costs 4 or less.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. If you use Yularen’s leader ability, you must attack with a unit, if able. Units must be ready in order to attack. Fully resolve the first attack, including all triggers, before beginning the second attack. A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 007 - Dryden Vos - I Never Ask Twice

- Internal name: `dryden-vos#i-never-ask-twice`
- Type: Leader
- Text: Action [Exhaust, discard a card that costs 6 or more from your hand]: Play a unit that costs 5 or less from your hand (paying its cost). It gains Ambush for this phase.
- Deployed: Overwhelm Action [discard a card from your hand]: Play a unit from your hand (paying its cost). It gains Ambush for this phase.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 008 - Bail Organa - Doing Everything He Can

- Internal name: `bail-organa#doing-everything-he-can`
- Type: Leader
- Text: Action [1 resource, Exhaust]: If a friendly unit was defeated this phase, return a friendly resource to its owner's hand. If you do, put the top card of your deck into play as a resource.
- Deployed: When you play a card from your resources: Heal 1 damage from your base.
- Rules: Bail’s leader ability still can be used as an action even if no friendly units were defeated this phase (but no resource is returned). Bail does not use an Epic Action to deploy, so he may deploy multiple times in a game. Bail still deploys ready, even though his deploy action requires you to exhaust him. Bail's unit ability triggers when you play a card using Smuggle or Plot.
- Status: Unreviewed

### 009 - Mon Mothma - Forming a Coalition

- Internal name: `mon-mothma#forming-a-coalition`
- Type: Leader
- Text: Ignore the aspect penalties on non-Villainy Official units you play.
- Deployed: Ignore the aspect penalties on non‑Villainy Official units you play. Each other friendly Official unit gets +0/+1.
- Status: Unreviewed

### 010 - Dedra Meero - Not Wasting Time

- Internal name: `dedra-meero#not-wasting-time`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Choose an enemy unit. Its controller may deal 2 damage to it. If they don't, draw a card.
- Deployed: While you have more cards in hand than an opponent, this unit gains Raid 2. (She gets +2/+0 while attacking.)
- Rules: When using Dedra's leader ability, if the chosen unit's controller chooses to deal 2 damage to it, you don't draw a card, even if that damage is prevented. If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 011 - Governor Pryce - Tyrant of Lothal

- Internal name: `governor-pryce#tyrant-of-lothal`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Ready a token unit.
- Deployed: This unit gets +1/+0 for each ready friendly token unit. On Attack: Create a Spy token.
- Status: Unreviewed

### 012 - Cassian Andor - Climb!

- Internal name: `cassian-andor#climb`
- Type: Leader
- Text: Friendly units that have damaged an opponent's base this phase can't be attacked (unless they have Sentinel).
- Deployed: Overwhelm While you have the initiative, this unit isn't defeated by having no remaining HP and can't be defeated by enemy card abilities.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. Cassian's leader ability applies to all units that have dealt combat or non-combat damage to an opponent's base. If one of those units gains Sentinel, it can be attacked. Cassian can be assigned more damage than his remaining HP. While you have the initiative, he can't be defeated directly by card abilities that “defeat a unit” or by having 0 remaining HP. While you have the initiative, if Cassian is attacked by a unit with Overwhelm, there is no excess damage if he is not defeated.
- Status: Unreviewed

### 013 - Luthen Rael - Don't You Want to Fight For Real?

- Internal name: `luthen-rael#dont-you-want-to-fight-for-real`
- Type: Leader
- Text: When a friendly unit is defeated while attacking: You may exhaust this leader. If you do, deal 1 damage to a unit or base.
- Deployed: When a friendly unit is defeated while attacking: You may deal 2 damage to a unit or base.
- Rules: Luthen's ability resolves during the same window as any "When Defeated" abilities on the friendly unit. It is not considered a "When Defeated" ability.
- Status: Unreviewed

### 014 - Sly Moore - Cipher in the Dark

- Internal name: `sly-moore#cipher-in-the-dark`
- Type: Leader
- Text: Action [1 resource, Exhaust]: If there are 4 or more exhausted units in play, create a Spy token.
- Deployed: On Attack: You may deal 2 damage to an exhausted unit.
- Rules: Sly’s leader ability still can be used as an action even if fewer than 4 exhausted units are in play (but no Spy token is created).
- Status: Unreviewed

### 015 - C-3PO - Human-Cyborg Relations

- Internal name: `c3po#humancyborg-relations`
- Type: Leader
- Text: Action [1 resource, Exhaust]: If you control an exhausted unit, exhaust a unit.
- Deployed: On Attack: If you control another exhausted unit, you may exhaust a unit.
- Rules: C-3PO’s leader ability still can be used as an action even if you don't control an exhausted unit (but no unit gets exhausted).
- Status: Unreviewed

### 016 - Padmé Amidala - What Do You Have to Hide?

- Internal name: `padme-amidala#what-do-you-have-to-hide`
- Type: Leader
- Text: When you reveal or discard 1 or more cards from your hand: You may exhaust this leader. If you do, deal 1 damage to a unit.
- Deployed: When you reveal or discard 1 or more cards from your hand: You may deal 1 damage to a unit.
- Rules: If another player's ability discards a card from your hand, you are still considered to discard that card, and Padme's ability still triggers. Only effects that explicitly reveal cards from your hand can trigger Padme's ability. Padme's ability does not trigger if you show an opponent a card for game state purposes.
- Status: Unreviewed

### 017 - Sabé - Queen's Shadow

- Internal name: `sabe#queens-shadow`
- Type: Leader
- Text: When a friendly unit deals combat damage to a base: You may exhaust this leader. If you do, look at the top 2 cards of the defending player's deck. Discard 1 of those cards. (Put the other back on top.)
- Deployed: Raid 1 When this unit deals combat damage to a base: Look at the defending player's hand. You may discard a card from it. If you do, that player draws a card.
- Rules: “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 018 - DJ - Need a Lift?

- Internal name: `dj#need-a-lift`
- Type: Leader
- Text: Action [Exhaust]: Choose a friendly unit. If you do, play a unit from your hand. It costs 1 resource less. The chosen unit captures it. (When Played abilities resolve after the unit is captured.)
- Deployed: Saboteur Friendly units that are rescued enter play ready.
- Rules: When using DJ's leader ability, any abilities that trigger from playing the unit, including that unit's "When Played" abilities, still trigger. The played unit is captured before any of triggered abilities resolve.
- Status: Unreviewed

### 019 - Rix Road

- Internal name: `rix-road`
- Type: Base
- Text: (none)
- Status: Finished

### 020 - Uscru Entertainment District

- Internal name: `uscru-entertainment-district`
- Type: Base
- Text: (none)
- Status: Finished

### 021 - Republic City

- Internal name: `republic-city`
- Type: Base
- Text: (none)
- Status: Finished

### 022 - Senate Rotunda

- Internal name: `senate-rotunda`
- Type: Base
- Text: (none)
- Status: Finished

### 023 - Imperial Prison Complex

- Internal name: `imperial-prison-complex`
- Type: Base
- Text: (none)
- Status: Finished

### 024 - Naval Intelligence HQ

- Internal name: `naval-intelligence-hq`
- Type: Base
- Text: (none)
- Status: Finished

### 025 - Amnesty Housing

- Internal name: `amnesty-housing`
- Type: Base
- Text: (none)
- Status: Finished

### 026 - Mount Tantiss

- Internal name: `mount-tantiss`
- Type: Base
- Text: (none)
- Status: Finished

### 027 - The Chancellor's Shuttle - Grim Harbinger

- Internal name: `the-chancellors-shuttle#grim-harbinger`
- Type: Unit
- Text: Restore 1 When Defeated: If you control Chancellor Palpatine (as a leader or unit), you may give an Experience token to a unit.
- Status: Unreviewed

### 028 - Trayus Acolyte

- Internal name: `trayus-acolyte`
- Type: Unit
- Text: (none)
- Status: Finished

### 029 - Zam Wesell - Inconspicuous Assassin

- Internal name: `zam-wesell#inconspicuous-assassin`
- Type: Unit
- Text: While this unit is upgraded, she gains Grit. (She gets +1/+0 for each damage on her.)
- Status: Unreviewed

### 030 - Death Trooper

- Internal name: `death-trooper`
- Type: Unit
- Text: When Played: Deal 2 damage to a friendly ground unit and 2 damage to an enemy ground unit.
- Rules: If Death Trooper is the only friendly unit in play, it must be chosen by its “When Played” ability.
- Status: Unreviewed

### 031 - Nute Gunray - Escaping Justice

- Internal name: `nute-gunray#escaping-justice`
- Type: Unit
- Text: Grit When Played/On Attack: You may give another friendly Official unit Sentinel for this phase.
- Status: Unreviewed

### 032 - Kylo Ren's Command Shuttle - Icon of Authority

- Internal name: `kylo-rens-command-shuttle#icon-of-authority`
- Type: Unit
- Text: Each friendly ground unit with Sentinel gets +0/+2.
- Status: Unreviewed

### 033 - Sly Moore - Witness to Power

- Internal name: `sly-moore#witness-to-power`
- Type: Unit
- Text: When Played: For this phase, each enemy unit gets –2/–0 while it's attacking a base. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Rules: (ERRATA) When Played: For this phase, while a base is being attacked by an enemy unit, the attacker gets -2/-0.
- Status: Unreviewed

### 034 - Cad Bane - Impressed Now?

- Internal name: `cad-bane#impressed-now`
- Type: Unit
- Text: When Played: You may defeat a unit with 2 or less remaining HP. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 035 - Darth Sion - Lord of Pain

- Internal name: `darth-sion#lord-of-pain`
- Type: Unit
- Text: When Played: Give an Experience token to this unit for each enemy unit that was defeated this phase. When Defeated: If this unit had 7 or more power, return him to his owner's hand.
- Rules: Darth Sion's "When Defeated" ability references his power when he was defeated, which includes temporary modifiers. Darth Sion's "When Defeated" ability only returns him to hand if he is in the discard pile when it resolves.
- Status: Unreviewed

### 036 - Dogmatic Shock Squad

- Internal name: `dogmatic-shock-squad`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 037 - Cantwell Arrestor Cruiser

- Internal name: `cantwell-arrestor-cruiser`
- Type: Unit
- Text: When Played: You may disclose VigilanceVigilanceVillainy (reveal cards from your hand with these aspect icons among them). If you do, exhaust an enemy unit. That unit can't ready while this unit is in play.
- Rules: Until Cantwell Arrestor Cruiser leaves play, the chosen unit can't ready. This effect is not changed if an opponent takes control of Cantwell Arrestor Cruiser. If Cantwell Arrestor Cruiser is captured and then rescued, its "When Played" effect does not resume.
- Status: Unreviewed

### 038 - Condemn

- Internal name: `condemn`
- Type: Upgrade
- Text: While attached unit is attacking, it gains: “On Attack: The defending player may disclose VigilanceVillainy. If they do, this unit gets –6/–0 for this attack” and loses all other abilities.
- Rules: The attached unit can't gain abilities while attacking.
- Status: Unreviewed

### 039 - Creditor's Claim

- Internal name: `creditors-claim`
- Type: Upgrade
- Text: Attached unit gains: “When Defeated: You may defeat a unit with 3 or less remaining HP.”
- Rules: Because the attached unit gains the ability, the "You" in Creditor's Claim's "When Defeated" ability refers to the controller of the attached unit.
- Status: Unreviewed

### 040 - Emergency Powers

- Internal name: `emergency-powers`
- Type: Event
- Text: Choose a non-leader unit and pay any number of resources. For each resource paid this way, give an Experience token to the chosen unit.
- Status: Unreviewed

### 041 - Populist Advisor

- Internal name: `populist-advisor`
- Type: Unit
- Text: When an enemy unit deals combat damage to your base: This unit gains Sentinel for this phase. (Enemy units in this arena must attack a Sentinel when they attack you.)
- Rules: “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 042 - Cassian Andor - Lay Low

- Internal name: `cassian-andor#lay-low`
- Type: Unit
- Text: While this unit is defending, the attacker gets –2/–0. If an enemy card ability would deal damage to this unit, prevent 2 of that damage.
- Rules: Enemy card abilities include any ability controlled by an enemy on a unit, upgrade, or event. Combat damage is not a card ability. If Cassian has a Shield attached to him, you can choose in what order to resolve the damage prevention effects.
- Status: Unreviewed

### 043 - Chandrilan Sponsor

- Internal name: `chandrilan-sponsor`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 044 - Populist Champion

- Internal name: `populist-champion`
- Type: Unit
- Text: (none)
- Status: Finished

### 045 - Senator Chuchi - Voice for the Voiceless

- Internal name: `senator-chuchi#voice-for-the-voiceless`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.) On Attack: Give another friendly Official unit Restore 2 for this phase.
- Status: Unreviewed

### 046 - Galen Erso - You'll Never Win

- Internal name: `galen-erso#youll-never-win`
- Type: Unit
- Text: When Played: Name a card. While this unit is in play, each non-leader card an opponent owns with that name, including those not in play, loses all abilities (and can't gain abilities). Plot
- Rules: Abilities that refer to a card’s “name” do not include the subtitle of the card. Until Galen leaves play, the cards with the chosen name lose all abilities. This effect is not changed if an opponent takes control of Galen. If Galen is captured and then rescued, his "When Played" effect does not resume. Galen's ability affects each card owned by each opponent. Cards with the chosen name can't gain abilities while Galen is in play. You can name any card when using Galen's ability, including bases and tokens.
- Status: Unreviewed

### 047 - Coronet - Stately Vessel

- Internal name: `coronet#stately-vessel`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.) Each other friendly unit gains Restore 1.
- Status: Unreviewed

### 048 - Captain Rex - Into the Firefight

- Internal name: `captain-rex#into-the-firefight`
- Type: Unit
- Text: When Played/When this unit completes an attack: Give this unit and an enemy unit Sentinel for this phase.
- Rules: A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 049 - Jade Squadron Patrol

- Internal name: `jade-squadron-patrol`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 050 - Vigil - Securing the Future

- Internal name: `vigil#securing-the-future`
- Type: Unit
- Text: If damage would be dealt to another friendly unit, prevent 1 of that damage. If damage would be dealt to this unit by another card, deal that much damage plus 1 instead. Plot
- Rules: If the other friendly unit has a Shield attached, you can choose in what order to resolve the prevention effects. Vigil's ability applies to a single instance of damage once; after increasing or decreasing the total damage dealt by 1, Vigil's ability does not resolve again.
- Status: Unreviewed

### 051 - Bo-Katan Kryze - Alone

- Internal name: `bokatan-kryze#alone`
- Type: Unit
- Text: When Played: Give each enemy unit –3/–3 for this phase. When an enemy unit is defeated: Give an Experience token to a friendly unit.
- Rules: Bo-Katan's "When Played" ability can trigger her "When an enemy unit is defeated" ability if it defeats enemy units.
- Status: Unreviewed

### 052 - Diplomatic Immunity

- Internal name: `diplomatic-immunity`
- Type: Upgrade
- Text: Attached unit gains: “When this unit is attacked: You may disclose VigilanceVigilanceHeroismHeroism (reveal cards from your hand with these aspect icons among them). If you do, the attacker gets –2/–0 for this attack.”
- Rules: “When this unit is attacked” triggers at the same time as “On Attack” abilities. On Defense abilities trigger when this unit is chosen as the defender for an attack, in the same window as the attacker's On Attack abilities.
- Status: Unreviewed

### 053 - One in a Million

- Internal name: `one-in-a-million`
- Type: Event
- Text: This card can't be played from your hand. Defeat a unit with power and remaining HP both equal to the number of ready resources you control. Plot
- Rules: Abilities that refer to a card’s power include temporary modifiers. In order for a unit to be defeated by One in a Million, the unit's power and remaining HP must be equal to each other and equal to the number of ready resources you control after paying for One in a Million.
- Status: Unreviewed

### 054 - Exiled from the Force

- Internal name: `exiled-from-the-force`
- Type: Upgrade
- Text: Attached unit loses the Force trait and all abilities except for Grit. Attached unit gains Grit.
- Rules: The attached unit can't gain abilities other than Grit.
- Status: Unreviewed

### 055 - Dhani Pilgrim

- Internal name: `dhani-pilgrim`
- Type: Unit
- Text: When Played/When Defeated: Heal 1 damage from your base.
- Status: Unreviewed

### 056 - Escape Pod

- Internal name: `escape-pod`
- Type: Unit
- Text: When Played: You may have this unit capture a friendly non-Vehicle, non-leader unit.
- Status: Unreviewed

### 057 - Lobot - Cloud City Coordinator

- Internal name: `lobot#cloud-city-coordinator`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) Grit (This unit gets +1/+0 for each damage on him.)
- Status: Unreviewed

### 058 - Lost Jedi

- Internal name: `lost-jedi`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 059 - Senate Warden

- Internal name: `senate-warden`
- Type: Unit
- Text: When Defeated: You may disclose Vigilance (reveal a card from your hand with this aspect icon). If you do, give an Experience token to a unit.
- Status: Unreviewed

### 060 - Defense Fleet X-Wing

- Internal name: `defense-fleet-xwing`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 061 - Willrow Hood - On the Run

- Internal name: `willrow-hood#on-the-run`
- Type: Unit
- Text: While this unit has exactly 1 friendly upgrade on it, that upgrade can't be defeated or returned to hand by enemy card abilities.
- Status: Unreviewed

### 062 - Bardottan Ornithopter

- Internal name: `bardottan-ornithopter`
- Type: Unit
- Text: When Played: You may disclose Vigilance (reveal a card from your hand with this aspect icon). If you do, draw a card.
- Status: Unreviewed

### 063 - Rotunda Senate Guards

- Internal name: `rotunda-senate-guards`
- Type: Unit
- Text: While this unit is undamaged, it gains Sentinel. (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 064 - Congress of Malastare

- Internal name: `congress-of-malastare`
- Type: Unit
- Text: The first upgrade you play each phase costs 1 resource less.
- Status: Unreviewed

### 065 - Nala Se - Chief Medical Scientist

- Internal name: `nala-se#chief-medical-scientist`
- Type: Unit
- Text: On Attack: You may disclose VigilanceVigilance (reveal cards from your hand with these aspect icons among them). If you do, heal up to 4 damage from among other units.
- Status: Unreviewed

### 066 - Alderaanian Envoys

- Internal name: `alderaanian-envoys`
- Type: Unit
- Text: Restore 3 (When this unit attacks, heal 3 damage from your base.)
- Status: Unreviewed

### 067 - Umbaran Mobile Cannon

- Internal name: `umbaran-mobile-cannon`
- Type: Unit
- Text: The first time this unit would take damage each phase, prevent that damage.
- Status: Unreviewed

### 068 - Lando Calrissian - Trust Me

- Internal name: `lando-calrissian#trust-me`
- Type: Unit
- Text: Grit When Played: You may choose an enemy unit and another friendly non-leader unit. If you do, heal 6 damage from your base and the enemy unit captures the friendly unit.
- Status: Unreviewed

### 069 - Nimble Prowess

- Internal name: `nimble-prowess`
- Type: Upgrade
- Text: Attach to a friendly unit. When Played: You may exhaust a unit in attached unit's arena.
- Status: Unreviewed

### 070 - Armor of Fortune

- Internal name: `armor-of-fortune`
- Type: Upgrade
- Text: Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 071 - Disciples' Devotion

- Internal name: `disciples-devotion`
- Type: Upgrade
- Text: While attached unit is exhausted, it gains Sentinel. (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 072 - Scour the Archives

- Internal name: `scour-the-archives`
- Type: Event
- Text: Search the top 8 cards of your deck for an upgrade, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 073 - The Eye of Aldhani

- Internal name: `the-eye-of-aldhani`
- Type: Event
- Text: At the start of the next action phase, for each enemy unit, its controller must pay 1 resource or exhaust that unit.
- Status: Unreviewed

### 074 - Relief Request

- Internal name: `relief-request`
- Type: Event
- Text: Heal 3 damage from a unit. You may disclose Vigilance (reveal a card from your hand with this aspect icon). If you do, heal 3 damage from another unit.
- Status: Unreviewed

### 075 - Knowledge and Defense

- Internal name: `knowledge-and-defense`
- Type: Event
- Text: Give a unit –2/–2 for this phase. Draw a card.
- Status: Unreviewed

### 076 - Charged with Murder

- Internal name: `charged-with-murder`
- Type: Event
- Text: You may disclose VigilanceVigilance (reveal cards from your hand with these aspect icons among them). If you do, defeat a damaged non-leader unit.
- Status: Unreviewed

### 077 - Retaliation

- Internal name: `retaliation`
- Type: Event
- Text: Defeat a unit that dealt damage to a base this phase.
- Status: Unreviewed

### 078 - Hyperspace Disaster

- Internal name: `hyperspace-disaster`
- Type: Event
- Text: Defeat all space units.
- Status: Unreviewed

### 079 - Corrupt Politician

- Internal name: `corrupt-politician`
- Type: Unit
- Text: While you control more units than an opponent, this unit gains Sentinel.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 080 - Imperial Dark Trooper

- Internal name: `imperial-dark-trooper`
- Type: Unit
- Text: (none)
- Status: Finished

### 081 - Major Partagaz - Healthcare Provider

- Internal name: `major-partagaz#healthcare-provider`
- Type: Unit
- Text: Overwhelm When another friendly Official unit attacks: This unit gets +2/+2 for this phase.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 082 - Chancellor Palpatine - I Am the Senate

- Internal name: `chancellor-palpatine#i-am-the-senate`
- Type: Unit
- Text: When Played: If you control a leader unit, create 2 Spy tokens and give those tokens Sentinel for this phase. Plot
- Status: Unreviewed

### 083 - ISB Shuttle

- Internal name: `isb-shuttle`
- Type: Unit
- Text: When Played: If a friendly unit was defeated this phase, create a Spy token.
- Status: Unreviewed

### 084 - Mas Amedda - Accomplice to Power

- Internal name: `mas-amedda#accomplice-to-power`
- Type: Unit
- Text: When Played: Give an Experience token to each of up to 2 other Official units. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 085 - Vice Admiral Rampart - On Schedule

- Internal name: `vice-admiral-rampart#on-schedule`
- Type: Unit
- Text: On Attack: You may disclose CommandCommandVillainy (reveal cards from your hand with these aspect icons among them). If you do, give an Experience token to each of up to 2 other units.
- Status: Unreviewed

### 086 - Cruel Commandos

- Internal name: `cruel-commandos`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 087 - Dedra Meero - With Verifiable Data

- Internal name: `dedra-meero#with-verifiable-data`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) On Attack: Create a Spy token.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 088 - First Light - Threatening Elegance

- Internal name: `first-light#threatening-elegance`
- Type: Unit
- Text: Ambush When this unit attacks and defeats a unit: You may draw a card. Plot
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. A unit "attacks and defeats a unit" if it defeats the defender at any point during the attack.
- Status: Unreviewed

### 089 - PreMor Personnel Carrier

- Internal name: `premor-personnel-carrier`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) When Played: Give this unit an Experience token for each ground unit you control.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 090 - Director Krennic - I Lose Nothing But Time

- Internal name: `director-krennic#i-lose-nothing-but-time`
- Type: Unit
- Text: Sentinel When this unit is attacked: Discard a card from your deck. If it's a unit, you may return it to your hand.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise. “When this unit is attacked” triggers at the same time as “On Attack” abilities. On Defense abilities trigger when this unit is chosen as the defender for an attack, in the same window as the attacker's On Attack abilities.
- Status: Unreviewed

### 091 - Corporate Warmongering

- Internal name: `corporate-warmongering`
- Type: Event
- Text: Give a friendly unit +3/+3 for this phase. Give each other friendly unit +1/+1 for this phase.
- Status: Unreviewed

### 092 - I Am the Senate

- Internal name: `i-am-the-senate`
- Type: Event
- Text: Create 5 Spy tokens.
- Status: Unreviewed

### 093 - C-3PO - Anything I Might Do?

- Internal name: `c3po#anything-i-might-do`
- Type: Unit
- Text: Action [Exhaust, return this unit to its owner's hand]: Give a unit +2/+2 for this phase.
- Status: Unreviewed

### 094 - Mina Bonteri - Stop This War

- Internal name: `mina-bonteri#stop-this-war`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.) When Defeated: You may disclose CommandCommandHeroism (reveal cards from your hand with these aspect icons among them). If you do, draw a card.
- Status: Unreviewed

### 095 - Theed Security

- Internal name: `theed-security`
- Type: Unit
- Text: When Played: If an opponent controls an upgrade, give an Experience token to a unit.
- Status: Unreviewed

### 096 - Ahsoka Tano - I Learned It from You

- Internal name: `ahsoka-tano#i-learned-it-from-you`
- Type: Unit
- Text: When this unit completes an attack (and survives): You may disclose CommandHeroism. If you do, attack with another unit.
- Rules: If you use Ahsoka’s ability, you must attack with a unit, if able. Units must be ready in order to attack. A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 097 - Beloved Orator

- Internal name: `beloved-orator`
- Type: Unit
- Text: When Played: Create a Spy token.
- Status: Unreviewed

### 098 - Captain Typho - All Necessary Precautions

- Internal name: `captain-typho#all-necessary-precautions`
- Type: Unit
- Text: Sentinel When this unit is attacked: You may disclose CommandHeroism. If you do, heal 1 damage from your base.
- Rules: “When this unit is attacked” triggers at the same time as “On Attack” abilities. On Defense abilities trigger when this unit is chosen as the defender for an attack, in the same window as the attacker's On Attack abilities.
- Status: Unreviewed

### 099 - Naboo Royal Starship - Fit For A Queen

- Internal name: `naboo-royal-starship#fit-for-a-queen`
- Type: Unit
- Text: Each friendly leader unit gains Raid 2 and Overwhelm. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 100 - Dressellian Commandos

- Internal name: `dressellian-commandos`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 101 - Queen Amidala - Championing Her People

- Internal name: `queen-amidala#championing-her-people`
- Type: Unit
- Text: When Played: Create 2 Spy tokens. If damage would be dealt to this unit, you may defeat another friendly unit that shares a trait with this unit. If you do, prevent that damage.
- Rules: If Queen Amidala has a Shield attached to her, you can choose in what order to resolve the damage prevention effects.
- Status: Unreviewed

### 102 - Renowned Dignitaries

- Internal name: `renowned-dignitaries`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) When Played: Heal 2 damage from your base for each friendly Official unit.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 103 - Mon Mothma - Clinging to Hope

- Internal name: `mon-mothma#clinging-to-hope`
- Type: Unit
- Text: Restore 3 When Played: You may attack with any number of other units (one at a time), even if those units are exhausted. They can't attack bases for these attacks.
- Rules: Fully resolve the each attack, including all triggers, before beginning the next attack. You can't use Mon Mothma's "When Played" ability to attack with the same unit multiple times. Units that can’t attack bases can still damage bases through other abilities, like Overwhelm.
- Status: Unreviewed

### 104 - Figure of Unity

- Internal name: `figure-of-unity`
- Type: Upgrade
- Text: Attach to a <uq> unit. Attached unit gains: “While this unit is ready, each other friendly unit gains Overwhelm, Raid 1, and Restore 1.”
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 105 - Renewed Friendship

- Internal name: `renewed-friendship`
- Type: Event
- Text: Return a unit from your discard pile to your hand. Create 2 Spy tokens.
- Status: Unreviewed

### 106 - Dismantle the Conspiracy

- Internal name: `dismantle-the-conspiracy`
- Type: Event
- Text: A friendly unit captures any number of enemy non-leader units with a total of 7 or less remaining HP.
- Status: Unreviewed

### 107 - Chancellor Valorum - Civil Servant

- Internal name: `chancellor-valorum#civil-servant`
- Type: Unit
- Text: When this unit completes an attack: You may disclose CommandCommandCommand (reveal cards from your hand with these aspect icons among them). If you do, put the top card of your deck into play as a resource.
- Rules: A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 108 - Senator's Aide

- Internal name: `senators-aide`
- Type: Unit
- Text: While you have the initiative, this unit gets +2/+0.
- Status: Unreviewed

### 109 - Diplomatic Envoy

- Internal name: `diplomatic-envoy`
- Type: Unit
- Text: When Played: You may disclose Command (reveal a card from your hand with this aspect icon). If you do, the next unit you play this phase gains Ambush for this phase.
- Rules: The Ambush from Diplomatic Envoy's “When Played” ability remains active even if it is defeated before you play another unit. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 110 - GNK Power Droid

- Internal name: `gnk-power-droid`
- Type: Unit
- Text: On Attack: The next unit you play this phase costs 1 resource less.
- Rules: The cost discount from CNK Power Droid's “On Attack” ability remains active even if it is defeated before you play another unit.
- Status: Unreviewed

### 111 - Jar Jar Binks - Mesa Propose…

- Internal name: `jar-jar-binks#mesa-propose`
- Type: Unit
- Text: When Played: You may give another friendly unit +2/+2 for this phase. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 112 - Orn Free Taa - Political Power Broker

- Internal name: `orn-free-taa#political-power-broker`
- Type: Unit
- Text: This unit gets +1/+0 for each Law card in your discard pile. When Played: Search the top 10 cards of your deck for a Law card, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 113 - Daro Commando

- Internal name: `daro-commando`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 114 - Kino Loy - You Answer to Me

- Internal name: `kino-loy#you-answer-to-me`
- Type: Unit
- Text: This unit gets +1/+0 for each other exhausted friendly unit.
- Status: Unreviewed

### 115 - Taylander Shuttle

- Internal name: `taylander-shuttle`
- Type: Unit
- Text: On Attack: If you have the initiative, create a Spy token.
- Status: Unreviewed

### 116 - Nubian Star Skiff

- Internal name: `nubian-star-skiff`
- Type: Unit
- Text: While you control an Official unit, this unit gains Restore 2. (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 117 - Consular's Cruiser

- Internal name: `consulars-cruiser`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 118 - Raxian Assembly

- Internal name: `raxian-assembly`
- Type: Unit
- Text: (none)
- Status: Finished

### 119 - Crucible - Centuries of Wisdom

- Internal name: `crucible#centuries-of-wisdom`
- Type: Unit
- Text: When Played/When Defeated: Give an Experience token to each other friendly unit.
- Status: Unreviewed

### 120 - Naboo Security Force

- Internal name: `naboo-security-force`
- Type: Unit
- Text: When Played/When Defeated: You may disclose Command (reveal a card from your hand with this aspect icon). If you do, give a friendly unit Sentinel for this phase.
- Status: Unreviewed

### 121 - Shadow Crawler

- Internal name: `shadow-crawler`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 122 - Vuutun Palaa - Droid Control Ship

- Internal name: `vuutun-palaa#droid-control-ship`
- Type: Unit
- Text: This unit costs 1 resource less to play for each friendly Droid unit. Each friendly Droid unit may be exhausted to pay costs as if it were a resource.
- Rules: Vuutun Palaa's second ability is only in effect once Vuutun Palaa is in play. Friendly Droid units can't be exhausted to pay for Vuutun Palaa.
- Status: Unreviewed

### 123 - Unveiled Might

- Internal name: `unveiled-might`
- Type: Upgrade
- Text: Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 124 - Budget Scheming

- Internal name: `budget-scheming`
- Type: Event
- Text: Give an Experience token to each of up to 3 Official units.
- Status: Unreviewed

### 125 - Reconnaissance

- Internal name: `reconnaissance`
- Type: Event
- Text: If you control a ground unit and a space unit, draw 2 cards.
- Status: Unreviewed

### 126 - Trade Route Taxation

- Internal name: `trade-route-taxation`
- Type: Event
- Text: Choose an opponent. If you control more units than that opponent, they can't play events for this phase. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 127 - Charged with Corruption

- Internal name: `charged-with-corruption`
- Type: Event
- Text: You may disclose CommandCommand (reveal cards from your hand with these aspect icons among them). If you do, a friendly unit captures an enemy non-leader unit. (Put the captured card facedown under that unit until that unit leaves play.)
- Status: Unreviewed

### 128 - Convene the Senate

- Internal name: `convene-the-senate`
- Type: Event
- Text: Search the top 8 cards of your deck for up to 2 Official units, reveal them, and draw them. (Put the other cards on the bottom of your deck in a random order.) Create a Spy token.
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 129 - With Thunderous Applause

- Internal name: `with-thunderous-applause`
- Type: Event
- Text: Give a unit +2/+2 for this phase. You may disclose Command (reveal a card from your hand with this aspect icon). If you do, give another unit +2/+2 for this phase.
- Status: Unreviewed

### 130 - Ferrix Uprising

- Internal name: `ferrix-uprising`
- Type: Event
- Text: Deal damage to a unit equal to twice the number of units you control in its arena.
- Status: Unreviewed

### 131 - Let's Talk

- Internal name: `lets-talk`
- Type: Event
- Text: If a friendly unit left play this phase, this event costs 3 resources less to play. Each friendly unit captures an enemy non-leader unit in the same arena.
- Status: Unreviewed

### 132 - Imperial Occupier

- Internal name: `imperial-occupier`
- Type: Unit
- Text: When Defeated: Create a Spy token.
- Status: Unreviewed

### 133 - Syril Karn - Where Is He?

- Internal name: `syril-karn#where-is-he`
- Type: Unit
- Text: On Attack: You may disclose AggressionAggressionVillainy (reveal cards from your hand with these aspect icons among them). If you do, choose a unit. Deal 2 damage to that unit unless its controller discards a card from their hand.
- Status: Unreviewed

### 134 - Hunting Assassin Droid

- Internal name: `hunting-assassin-droid`
- Type: Unit
- Text: While an enemy unit is damaged, this unit gains Raid 2. (It gets +2/+0 while attacking.)
- Status: Unreviewed

### 135 - Muckraker Crab Droid

- Internal name: `muckraker-crab-droid`
- Type: Unit
- Text: While this unit is ready, it can't be attacked.
- Rules: If a unit that can't be attacked gains Sentinel, it can be attacked.
- Status: Unreviewed

### 136 - Arihnda Pryce - On the Road to Power

- Internal name: `arihnda-pryce#on-the-road-to-power`
- Type: Unit
- Text: When Defeated: You may defeat another friendly unit. If you do, deal 4 damage to each enemy base.
- Status: Unreviewed

### 137 - Dryden Vos - I Get All Worked Up

- Internal name: `dryden-vos#i-get-all-worked-up`
- Type: Unit
- Text: On Attack: You may double this unit's power for this attack. If you do, this unit doesn't ready during the next regroup phase.
- Rules: Abilities that refer to a card’s power include temporary modifiers. Dryden Vos doubles whatever his power is when his "On Attack" ability resolves, which includes temporary attack power modifiers like Raid.
- Status: Unreviewed

### 138 - Enforcer Squadron

- Internal name: `enforcer-squadron`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Status: Unreviewed

### 139 - Miraj Scintel - The Weak Deserve to Kneel

- Internal name: `miraj-scintel#the-weak-deserve-to-kneel`
- Type: Unit
- Text: While a friendly unit is attacking a damaged unit, the attacker gains Overwhelm. When Played: You may deal 3 damage to an undamaged unit.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 140 - Hondo Ohnaka - You Better Hurry

- Internal name: `hondo-ohnaka#you-better-hurry`
- Type: Unit
- Text: Each other friendly unit gains Raid 1. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 141 - The Galleon - Marauding Pirate Ship

- Internal name: `the-galleon#marauding-pirate-ship`
- Type: Unit
- Text: When Played: You may disclose AggressionAggressionVillainy (reveal cards from your hand with these aspect icons among them). If you do, create 3 Spy tokens.
- Status: Unreviewed

### 142 - Fulminatrix - Fleet Killer

- Internal name: `fulminatrix#fleet-killer`
- Type: Unit
- Text: When Played/On Attack: You may deal 4 damage to a ground unit.
- Status: Unreviewed

### 143 - The Elite Squad - Neutralizing Insurgents

- Internal name: `the-elite-squad#neutralizing-insurgents`
- Type: Unit
- Text: Grit When Played/When damage is dealt to this unit: You may deal 2 damage to another <uq> (unique) unit.
- Status: Unreviewed

### 144 - Tempest Assault

- Internal name: `tempest-assault`
- Type: Event
- Text: If you've dealt damage to an enemy base this phase, deal 2 damage to each enemy space unit.
- Status: Unreviewed

### 145 - Confidence in Victory

- Internal name: `confidence-in-victory`
- Type: Event
- Text: Play only as your first action in the action phase. Choose an arena. At the start of the regroup phase, if you are the only player who controls units in that arena, you win the game.
- Rules: Confidence in Victory can only be played by taking the "Play a Card" action to play it as your first action in the action phase. It can't be played as the result of another action, even if it it's still your first turn.
- Status: Unreviewed

### 146 - Rebellious Functionary

- Internal name: `rebellious-functionary`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Status: Unreviewed

### 147 - Chopper - War Hero

- Internal name: `chopper#war-hero`
- Type: Unit
- Text: When this unit deals combat damage to a base: Each player discards a card from their hand.
- Rules: “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 148 - Karis Nemik - Freedom is a Pure Idea

- Internal name: `karis-nemik#freedom-is-a-pure-idea`
- Type: Unit
- Text: Hidden When Defeated: You may disclose AggressionHeroism (reveal cards from your hand with these aspect icons among them). If you do, create a Spy token and ready it.
- Status: Unreviewed

### 149 - Kaydel Connix - For Our Survival

- Internal name: `kaydel-connix#for-our-survival`
- Type: Unit
- Text: When Played: You may defeat all non-<uq> (non-unique) upgrades on a unit. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 150 - Valiant Commando

- Internal name: `valiant-commando`
- Type: Unit
- Text: When this unit deals combat damage to a base: You may defeat this unit. If you do, deal 3 damage to that base.
- Rules: “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 151 - Kazuda Xiono - I'm Not A Spy

- Internal name: `kazuda-xiono#im-not-a-spy`
- Type: Unit
- Text: Raid 2 (This unit gets +2/+0 while attacking.) While you control fewer resources than an opponent, this unit gets +2/+0.
- Status: Unreviewed

### 152 - Strike Force X-Wing

- Internal name: `strike-force-xwing`
- Type: Unit
- Text: When Played: You may deal 2 damage to a ready unit. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 153 - Luthen's Haulcraft - Countermeasures Armed

- Internal name: `luthens-haulcraft#countermeasures-armed`
- Type: Unit
- Text: When Defeated: You may choose an opponent and disclose AggressionAggressionHeroism (reveal cards from your hand with these aspect icons among them). If you do, that opponent discards 2 cards from their hand.
- Status: Unreviewed

### 154 - Inner Rim Coalition

- Internal name: `inner-rim-coalition`
- Type: Unit
- Text: When Defeated: You may ready a unit that costs 5 or less.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 155 - Alexsandr Kallus - With New Purpose

- Internal name: `alexsandr-kallus#with-new-purpose`
- Type: Unit
- Text: While you have the initiative, each other friendly <uq> (unique) unit gains Raid 2. When Played: Deal 2 damage to each of up to 3 ground units.
- Status: Unreviewed

### 156 - Nemik's Manifesto

- Internal name: `nemiks-manifesto`
- Type: Upgrade
- Text: Attach to a non-Vehicle unit. Attached unit gains the Rebel trait and: “When Defeated: Deal 1 damage to each enemy base for each other friendly Rebel unit.”
- Status: Unreviewed

### 157 - One Way Out

- Internal name: `one-way-out`
- Type: Event
- Text: Attack with a unit. It gets +1/+0 and gains Overwhelm for this attack. If it attacks a unit, the defender loses all abilities for this attack.
- Rules: If you play One Way Out, you must attack with a unit, if able. Units must be ready in order to attack. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm. The defending unit also can't gain abilities for this attack. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 158 - Oppression Breeds Rebellion

- Internal name: `oppression-breeds-rebellion`
- Type: Event
- Text: If a friendly unit was defeated while attacking this phase, draw 3 cards.
- Status: Unreviewed

### 159 - Chairman Papanoida - Undaunted Diplomat

- Internal name: `chairman-papanoida#undaunted-diplomat`
- Type: Unit
- Text: When a player draws 1 or more cards during the action phase: You may disclose AggressionAggression (reveal cards from your hand with these aspect icons among them). If you do, create a Spy token.
- Status: Unreviewed

### 160 - Reckless Rebel

- Internal name: `reckless-rebel`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 161 - Contraband Starhopper

- Internal name: `contraband-starhopper`
- Type: Unit
- Text: (none)
- Status: Finished

### 162 - Crosshair - Filled With Doubt

- Internal name: `crosshair#filled-with-doubt`
- Type: Unit
- Text: On Attack: You may deal 1 damage to another friendly unit. If you do, deal 2 damage to the defending player's base.
- Status: Unreviewed

### 163 - Outer Rim Constable

- Internal name: `outer-rim-constable`
- Type: Unit
- Text: When Played: You may defeat an upgrade.
- Status: Unreviewed

### 164 - Warrior of Clan Ordo

- Internal name: `warrior-of-clan-ordo`
- Type: Unit
- Text: On Attack: You may disclose Aggression (reveal a card from your hand with this aspect icon). If you don't, deal 2 damage to your base.
- Status: Unreviewed

### 165 - Academy Disciplinarian

- Internal name: `academy-disciplinarian`
- Type: Unit
- Text: When Played: You may deal 1 damage to a friendly unit with 2 or less power and ready it.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 166 - Republic Aurek Starfighter

- Internal name: `republic-aurek-starfighter`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 167 - Coruscant Undercity Police

- Internal name: `coruscant-undercity-police`
- Type: Unit
- Text: (none)
- Status: Finished

### 168 - Ziton Moj - Black Sun Bully

- Internal name: `ziton-moj#black-sun-bully`
- Type: Unit
- Text: When you take the initiative: Deal 2 damage to a base.
- Status: Unreviewed

### 169 - AAT Incinerator

- Internal name: `aat-incinerator`
- Type: Unit
- Text: When Played: Deal 1 damage to each of up to 4 other ground units. If no friendly units were damaged by this ability, deal 2 damage to your base.
- Status: Unreviewed

### 170 - Corellian Hounds

- Internal name: `corellian-hounds`
- Type: Unit
- Text: If an opponent controls no ground units, this unit enters play ready.
- Status: Unreviewed

### 171 - Punishing One - Takes No Prisoners

- Internal name: `punishing-one#takes-no-prisoners`
- Type: Unit
- Text: This unit gains Raid 1 for each damaged enemy unit. When Played/On Attack: You may deal 1 damage to a unit.
- Rules: If Punishing One damages an undamaged unit with its "On Attack" ability during an attack, it immediately gains Raid 1 for that attack.
- Status: Unreviewed

### 172 - Cinta Kaz - The Struggle Comes First

- Internal name: `cinta-kaz#the-struggle-comes-first`
- Type: Unit
- Text: When Played: You may attack with a unit. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 173 - Republic War Walker

- Internal name: `republic-war-walker`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 174 - Saw Gerrera's U-Wing - Breaking the Rules

- Internal name: `saw-gerreras-uwing#breaking-the-rules`
- Type: Unit
- Text: Saboteur When this unit completes an attack (and survives): You may attack with another Aggression unit.
- Rules: A unit must survive an attack to trigger its “when this unit completes an attack” abilities. Units must be ready in order to attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 175 - Ambition's Reward

- Internal name: `ambitions-reward`
- Type: Upgrade
- Text: When Played: Create a Spy token.
- Status: Unreviewed

### 176 - Sudden Ferocity

- Internal name: `sudden-ferocity`
- Type: Upgrade
- Text: Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 177 - It's Not Over Yet

- Internal name: `its-not-over-yet`
- Type: Event
- Text: You may ready a unit that didn't attack or enter play this phase. Create a Spy token.
- Status: Unreviewed

### 178 - Pursue the Lead

- Internal name: `pursue-the-lead`
- Type: Event
- Text: Choose a player. That player discards a card from their hand. If it costs 3 or less, create a Spy token.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 179 - Aggressive Negotiations

- Internal name: `aggressive-negotiations`
- Type: Event
- Text: Attack with a unit. For this attack, it gets +1/+0 for each card in your hand.
- Rules: If you play Aggressive Negotiations, you must attack with a unit, if able. Units must be ready in order to attack. The attacking unit gets +1/+0 for each card in your hand at the start of the attack (not counting Aggressive Negotiations). This power increase doesn't change if you draw or discard cards as part of the attack.
- Status: Unreviewed

### 180 - Let's Call It War

- Internal name: `lets-call-it-war`
- Type: Event
- Text: Deal 3 damage to a unit. Then, if you have the initiative, you may deal 2 damage to another unit in the same arena.
- Status: Unreviewed

### 181 - Unauthorized Investigation

- Internal name: `unauthorized-investigation`
- Type: Event
- Text: Create a Spy token. You may disclose Aggression (reveal a card from your hand with this aspect icon). If you do, create another Spy token.
- Status: Unreviewed

### 182 - Charged with Treason

- Internal name: `charged-with-treason`
- Type: Event
- Text: You may disclose AggressionAggression (reveal cards from your hand with these aspect icons among them). If you do, deal 5 damage to a unit.
- Status: Unreviewed

### 183 - Topple the Summit

- Internal name: `topple-the-summit`
- Type: Event
- Text: Deal 3 damage to each damaged unit. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 184 - ISB Agent

- Internal name: `isb-agent`
- Type: Unit
- Text: When Played: You may reveal an event from your hand. If you do, deal 1 damage to a unit.
- Status: Unreviewed

### 185 - Screeching TIE Fighter

- Internal name: `screeching-tie-fighter`
- Type: Unit
- Text: On Attack: You may choose a ground unit. If you do, it loses its keywords (and can't gain keywords) for this phase.
- Rules: The unit chosen for Screeching TIE Fighter's "On Attack" ability also can't gain keywords for this phase.
- Status: Unreviewed

### 186 - Garindan - Information Broker

- Internal name: `garindan#information-broker`
- Type: Unit
- Text: When Played: Name a card. Look at an opponent's hand and discard a card with that name from it. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Rules: Abilities that refer to a card’s “name” do not include the subtitle of the card.
- Status: Unreviewed

### 187 - General Grievous - Scuttling to Safety

- Internal name: `general-grievous#scuttling-to-safety`
- Type: Unit
- Text: Hidden (This unit can't be attacked if he was played this phase.) When this unit is attacked: Return him to his owner's hand (before damage is dealt).
- Rules: “When this unit is attacked” triggers at the same time as “On Attack” abilities. Grievous can only be returned to hand by his ability if he is in play when it is resolves. If a unit with Overwhelm attacks General Grievous and he returns to his owner's hand, all combat damage is considered excess damage and dealt to the defending player's base. On Defense abilities trigger when this unit is chosen as the defender for an attack, in the same window as the attacker's On Attack abilities.
- Status: Unreviewed

### 188 - Darth Traya - Lord of Betrayal

- Internal name: `darth-traya#lord-of-betrayal`
- Type: Unit
- Text: On Attack: You may ready a non-unit leader.
- Status: Unreviewed

### 189 - Lurking Snub Fighter

- Internal name: `lurking-snub-fighter`
- Type: Unit
- Text: When Played: You may exhaust a unit. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 190 - Soulless One - Swift and Agile

- Internal name: `soulless-one#swift-and-agile`
- Type: Unit
- Text: On Attack: You may disclose CunningCunningVillainy (reveal cards from your hand with these aspect icons among them). If you do, ready 2 resources.
- Status: Unreviewed

### 191 - Trade Federation Delegates

- Internal name: `trade-federation-delegates`
- Type: Unit
- Text: When Played: Create 2 Spy tokens.
- Status: Unreviewed

### 192 - Grand Moff Tarkin - Taking Krennic's Achievement

- Internal name: `grand-moff-tarkin#taking-krennics-achievement`
- Type: Unit
- Text: When Played: Take control of an enemy non-leader Vehicle unit. When this unit leaves play, that unit's owner takes control of that unit.
- Rules: If Tarkin has already left play when you resolve his "When Played" ability, immediately return the stolen unit to its owner's control.
- Status: Unreviewed

### 193 - Grand Admiral Thrawn - Grand Schemer

- Internal name: `grand-admiral-thrawn#grand-schemer`
- Type: Unit
- Text: When Played: An opponent may choose a non-leader unit they control. If they do, this unit captures that unit. If they don't, ready this unit. When Defeated: A friendly unit captures an enemy non-leader unit in the same arena.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 194 - Fully Armed and Operational

- Internal name: `fully-armed-and-operational`
- Type: Event
- Text: If an opponent attacked your base during their previous action this phase, play a unit from your hand. Give it Ambush for this phase. Plot
- Rules: An opponent must have declared an attack against your base during their previous action for Fully Armed and Operational to let you play a unit from your hand. This can be from taking an action or using an ability to make an attack, but does not count Overwhelm damage from an attack on a unit. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 195 - Arrest

- Internal name: `arrest`
- Type: Event
- Text: Your base captures an enemy non-leader unit. At the start of the regroup phase, its owner rescues it.
- Rules: A base capturing a unit functions similarly to a unit capturing another unit. The captured unit is placed facedown under the base, out of play, and the base guards that unit. The captured unit can be rescued so long as the rescue ability doesn't specify that a unit is guarding the captured unit.
- Status: Unreviewed

### 196 - No One Ever Knew

- Internal name: `no-one-ever-knew`
- Type: Event
- Text: For each friendly Official unit, exhaust an enemy unit.
- Status: Unreviewed

### 197 - Furtive Handmaiden

- Internal name: `furtive-handmaiden`
- Type: Unit
- Text: On Attack: You may discard a card from your hand. If you do, draw a card.
- Status: Unreviewed

### 198 - Bail Organa - Responding to Catastrophe

- Internal name: `bail-organa#responding-to-catastrophe`
- Type: Unit
- Text: On Attack: You may discard a card from your hand. If you do, create a Spy token.
- Status: Unreviewed

### 199 - Bravo Squadron Fighter

- Internal name: `bravo-squadron-fighter`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 200 - Junior Senator

- Internal name: `junior-senator`
- Type: Unit
- Text: When Played: You may return an upgrade that costs 3 or less to its owner's hand.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 201 - Anakin Skywalker - Secret Husband

- Internal name: `anakin-skywalker#secret-husband`
- Type: Unit
- Text: Hidden (This unit can't be attacked if he was played this phase.) While you control Padmé Amidala (as a leader or unit), this unit gains Raid 2.
- Status: Unreviewed

### 202 - Rebel Propagandist

- Internal name: `rebel-propagandist`
- Type: Unit
- Text: When Played/When Defeated: Give another friendly unit +1/+0 and Saboteur for this phase. (When that unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 203 - Tala Durith - I Can Get You Inside

- Internal name: `tala-durith#i-can-get-you-inside`
- Type: Unit
- Text: Each other friendly unit gains Hidden. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Rules: Hidden prevents a unit from being attacked during the same phase it enters play, so Tala Durith's ability means each other friendly unit can't be attacked the phase it enters play.
- Status: Unreviewed

### 204 - Blue Ace - Colorful Racer

- Internal name: `blue-ace#colorful-racer`
- Type: Unit
- Text: Ambush On Attack: Ready an exhausted enemy unit.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 205 - Obi-Wan Kenobi - Finding What Doesn't Exist

- Internal name: `obiwan-kenobi#finding-what-doesnt-exist`
- Type: Unit
- Text: When this unit deals combat damage to a base: Discard a card from the defending player's deck. For this phase, you may play that card from their discard pile, ignoring its aspect penalties.
- Rules: Always discard from the top of a deck, unless an ability specifies otherwise. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 206 - Emissaries from Ryloth

- Internal name: `emissaries-from-ryloth`
- Type: Unit
- Text: When Played: You may give a unit –3/–0 for this phase.
- Status: Unreviewed

### 207 - Lightmaker - I Have An Idea

- Internal name: `lightmaker#i-have-an-idea`
- Type: Unit
- Text: Raid 4 When Defeated: Choose an arena. Exhaust each enemy unit in that arena.
- Status: Unreviewed

### 208 - Hunter - Extraordinary Tracker

- Internal name: `hunter#extraordinary-tracker`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) On Attack: If the defender is exhausted, it gets –4/–0 for this attack.
- Rules: (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 209 - The Mandalorian - Cleaning Up Nevarro

- Internal name: `the-mandalorian#cleaning-up-nevarro`
- Type: Unit
- Text: Ambush When this unit attacks and defeats a unit: You may choose an enemy non-leader unit. This unit captures it.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. A unit "attacks and defeats a unit" if it defeats the defender at any point during the attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 210 - Stolen Starpath Unit

- Internal name: `stolen-starpath-unit`
- Type: Upgrade
- Text: Attached unit gains: “On Attack: Name a card. The defending player reveals their hand. For each card in their hand with that name, create a Spy token.”
- Rules: Abilities that refer to a card’s “name” do not include the subtitle of the card.
- Status: Unreviewed

### 211 - Faith in Your Friends

- Internal name: `faith-in-your-friends`
- Type: Event
- Text: Search the top 3 cards of your deck for a card and draw it. Then, you may disclose CunningCunningCunningHeroismHeroism (reveal cards from your hand with these aspect icons among them). If you do, create 2 Spy tokens.
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 212 - Libertine - Under New Ownership

- Internal name: `libertine#under-new-ownership`
- Type: Unit
- Text: This unit gets +1/+0 for each captured card it's guarding. When Played: Choose an enemy unit and a non-leader friendly unit. The enemy unit captures the friendly unit.
- Status: Unreviewed

### 213 - A-Wing

- Internal name: `awing`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.)
- Status: Unreviewed

### 214 - Skyhopper Canyon Runner

- Internal name: `skyhopper-canyon-runner`
- Type: Unit
- Text: (none)
- Status: Finished

### 215 - Emissary's Sheathipede

- Internal name: `emissarys-sheathipede`
- Type: Unit
- Text: When Defeated: Each opponent may ready a resource.
- Status: Unreviewed

### 216 - Regulations Bureaucrat

- Internal name: `regulations-bureaucrat`
- Type: Unit
- Text: Action [Exhaust]: Exhaust a resource.
- Status: Unreviewed

### 217 - Zenuas Shadow Fighter

- Internal name: `zenuas-shadow-fighter`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Status: Unreviewed

### 218 - Cikatro Vizago - Business is What Matters

- Internal name: `cikatro-vizago#business-is-what-matters`
- Type: Unit
- Text: On Attack: Reveal the top card of your deck. An opponent may pay 1 resource. If they don't, draw that card.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.” If an opponent pays 1, put the revealed card facedown on top of your deck.
- Status: Unreviewed

### 219 - Ebon Hawk - Cause and Effect

- Internal name: `ebon-hawk#cause-and-effect`
- Type: Unit
- Text: On Attack: You may disclose Heroism and/or Villainy. If you disclosed Heroism, this unit gets +2/+0 for this attack. If you disclosed Villainy, give the defender –4/–0 for this attack.
- Rules: (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 220 - Hired Slicer

- Internal name: `hired-slicer`
- Type: Unit
- Text: On Attack: Reveal the top 2 cards of a deck. If you do, you may exhaust a unit that shares a Trait with one of those cards. Put those cards on the bottom of that deck in a random order.
- Status: Unreviewed

### 221 - Unruly Astromech

- Internal name: `unruly-astromech`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.) When Defeated: Exhaust an enemy unit.
- Status: Unreviewed

### 222 - Loan Shark

- Internal name: `loan-shark`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) Raid 1 (This unit gets +1/+0 while attacking.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 223 - Duchess's Investigators

- Internal name: `duchesss-investigators`
- Type: Unit
- Text: When Played: You may disclose Cunning (reveal a card from your hand with this aspect icon). If you do, each opponent discards a random card from their hand.
- Status: Unreviewed

### 224 - Vel Sartha - One Path, One Choice

- Internal name: `vel-sartha#one-path-one-choice`
- Type: Unit
- Text: Raid 2 (This unit gets +2/+0 while attacking.) Each exhausted enemy unit gets –2/–0 while defending.
- Status: Unreviewed

### 225 - Synara San - Harboring a Secret

- Internal name: `synara-san#harboring-a-secret`
- Type: Unit
- Text: Hidden On Attack: For each friendly unit, ready a friendly resource.
- Status: Unreviewed

### 226 - Sneaking Suspicion

- Internal name: `sneaking-suspicion`
- Type: Upgrade
- Text: Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 227 - Special Modifications

- Internal name: `special-modifications`
- Type: Upgrade
- Text: Attach to a Vehicle unit. When Played: If attached unit is a Transport, you may create a Spy token.
- Status: Unreviewed

### 228 - Accelerate Our Plans

- Internal name: `accelerate-our-plans`
- Type: Event
- Text: Exhaust a friendly unit. If you do, attack with another unit. It gets +3/+0 for this attack.
- Rules: If you exhaust a friendly unit with Accelerate Our Plans, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 229 - Catch Unawares

- Internal name: `catch-unawares`
- Type: Event
- Text: Attack with a unit. The defender gets –4/–0 for this attack.
- Rules: If you play Catch Unawares, you must attack with a unit, if able. Units must be ready in order to attack. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 230 - Charged with Espionage

- Internal name: `charged-with-espionage`
- Type: Event
- Text: You may disclose CunningCunning (reveal cards from your hand with these aspect icons among them). If you do, look at an opponent's hand and discard a unit from it.
- Status: Unreviewed

### 231 - Implicate

- Internal name: `implicate`
- Type: Event
- Text: Choose a unit. For this phase, it gains Sentinel and: “When this unit is attacked: Create a Spy token.”
- Rules: “When this unit is attacked” triggers at the same time as “On Attack” abilities. On Defense abilities trigger when this unit is chosen as the defender for an attack, in the same window as the attacker's On Attack abilities.
- Status: Unreviewed

### 232 - Kreia's Whispers

- Internal name: `kreias-whispers`
- Type: Event
- Text: Draw 3 cards, then put a card from your hand on the top of your deck and another card from your hand on the bottom of your deck.
- Status: Unreviewed

### 233 - Beguile

- Internal name: `beguile`
- Type: Event
- Text: Look at an opponent's hand. Then, choose a non-leader unit that opponent controls that costs 6 or less and return it to its owner's hand.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 234 - Bog Down in Procedure

- Internal name: `bog-down-in-procedure`
- Type: Event
- Text: Exhaust a unit. You may disclose Cunning (reveal a card from your hand with this aspect icon). If you do, exhaust another unit.
- Status: Unreviewed

### 235 - The Wrong Ride

- Internal name: `the-wrong-ride`
- Type: Event
- Text: Exhaust 2 enemy resources. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 236 - Undercover Operation

- Internal name: `undercover-operation`
- Type: Event
- Text: Ready a unit that was played this phase. If it costs 3 or less, create a Spy token.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 237 - Supreme Council Aide

- Internal name: `supreme-council-aide`
- Type: Unit
- Text: (none)
- Status: Finished

### 238 - Sith Assassin

- Internal name: `sith-assassin`
- Type: Unit
- Text: Hidden (This unit can't be attacked if it was played this phase.)
- Status: Unreviewed

### 239 - Viper Probe Droid

- Internal name: `viper-probe-droid`
- Type: Unit
- Text: When Played: Look at an opponent's hand.
- Status: Unreviewed

### 240 - Hutt Cartel Starfighter

- Internal name: `hutt-cartel-starfighter`
- Type: Unit
- Text: When Played: Deal 2 damage to this unit.
- Status: Unreviewed

### 241 - Political Bully

- Internal name: `political-bully`
- Type: Unit
- Text: When Played: If you control another Official unit, you may deal 2 damage to a ground unit.
- Status: Unreviewed

### 242 - Elia Kane - False Convert

- Internal name: `elia-kane#false-convert`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.) When Played: Look at 3 enemy resources. You may defeat 1 of them. If you do, its controller puts the top card of their deck into play as a resource and readies it.
- Status: Unreviewed

### 243 - FN Trooper Corps

- Internal name: `fn-trooper-corps`
- Type: Unit
- Text: When Played: Give an Experience token to another friendly unit. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 244 - Darth Nihilus - Lord of Hunger

- Internal name: `darth-nihilus#lord-of-hunger`
- Type: Unit
- Text: When Played/On Attack: Deal 3 damage to the unit with the least remaining HP among other units. (If multiple units are tied, choose one.). If it's a non-Vehicle unit, give an Experience token to this unit.
- Status: Unreviewed

### 245 - When Has Become Now

- Internal name: `when-has-become-now`
- Type: Event
- Text: Play a card with Plot from your resources (paying its cost). Put the top card of your deck into play as a resource.
- Rules: (ERRATA) Play a card with Plot from your resources (paying its cost). If you do, put the top card of your deck into play as a resource. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 246 - Contempt for Culture

- Internal name: `contempt-for-culture`
- Type: Event
- Text: Deal 2 damage to a non-Vehicle unit. Create a Spy token.
- Status: Unreviewed

### 247 - Evil is Everywhere

- Internal name: `evil-is-everywhere`
- Type: Event
- Text: Defeat a unit with cost equal to or less than the number of Villainy aspect icons among friendly units.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 248 - B2EMO - That's Two Lies

- Internal name: `b2emo#thats-two-lies`
- Type: Unit
- Text: Restore 1 On Attack: You may disclose HeroismHeroism (reveal cards from your hand with these aspect icons among them). If you do, give a unit Sentinel for this phase.
- Status: Unreviewed

### 249 - High Command Councilor

- Internal name: `high-command-councilor`
- Type: Unit
- Text: While you control another Official unit, this unit gains Raid 2. (It gets +2/+0 while attacking.)
- Status: Unreviewed

### 250 - Rebel Pathfinder

- Internal name: `rebel-pathfinder`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 251 - Crait Veteran

- Internal name: `crait-veteran`
- Type: Unit
- Text: (none)
- Status: Finished

### 252 - Maarva Andor - We've Been Sleeping

- Internal name: `maarva-andor#weve-been-sleeping`
- Type: Unit
- Text: When Defeated: Give an Experience token to each friendly Rebel unit.
- Status: Unreviewed

### 253 - Covert Operative

- Internal name: `covert-operative`
- Type: Unit
- Text: When Played: This unit captures an enemy non-leader unit that costs 2 or less. (Put the captured card facedown under this unit until this unit leaves play.)
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 254 - Heroic ARC-170

- Internal name: `heroic-arc170`
- Type: Unit
- Text: When Played: If you control a damaged unit, you may deal 2 damage to an enemy unit.
- Status: Unreviewed

### 255 - Remote Escort Tank

- Internal name: `remote-escort-tank`
- Type: Unit
- Text: When Played: Give a unit Sentinel for this phase. Plot (When you deploy a leader, you may play this card from your resources, paying its cost. Replace it with the top card of your deck.)
- Status: Unreviewed

### 256 - Moral Authority

- Internal name: `moral-authority`
- Type: Upgrade
- Text: Attach to a friendly <uq> (unique) unit. When Played: Attached unit captures an enemy non-leader unit with less remaining HP than it.
- Status: Unreviewed

### 257 - Restore Freedom

- Internal name: `restore-freedom`
- Type: Event
- Text: Play a unit from your hand. It costs 1 resource less for each Heroism aspect icon among friendly units.
- Status: Unreviewed

### 258 - Grassroots Resistance

- Internal name: `grassroots-resistance`
- Type: Event
- Text: Deal 3 damage to a unit. Heal 3 damage from your base.
- Status: Unreviewed

### 259 - ASP Laborer

- Internal name: `asp-laborer`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.)
- Status: Unreviewed

### 260 - Inspector's Shuttle

- Internal name: `inspectors-shuttle`
- Type: Unit
- Text: When Played: Name a card, then an opponent reveals their hand. For each copy of the named card in their hand, give an Experience token to this unit.
- Rules: (ERRATA) When Played: Name a card, then an opponent reveals their hand. For each card with that name in their hand, give an Experience token to this unit. Abilities that refer to a card’s “name” do not include the subtitle of the card. If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 261 - Inspiring Senator

- Internal name: `inspiring-senator`
- Type: Unit
- Text: When Defeated: The next Official unit you play this phase costs 1 resource less.
- Status: Unreviewed

### 262 - Ando Commission

- Internal name: `ando-commission`
- Type: Unit
- Text: Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.)
- Status: Unreviewed

### 263 - Assassin Probe

- Internal name: `assassin-probe`
- Type: Unit
- Text: When Defeated: Deal 1 damage to each exhausted enemy ground unit.
- Status: Unreviewed

### 264 - Clandestine Connections

- Internal name: `clandestine-connections`
- Type: Upgrade
- Text: Attached unit gains: “On Attack: You may pay 2 resources. If you do, deal 2 damage to a base.”
- Status: Unreviewed

## Tokens

### Token - Spy

- Internal name: `spy`
- Type: Token, Unit
- Text: Raid 2 (This unit gets +2/+0 while attacking.)
- Status: Unreviewed

