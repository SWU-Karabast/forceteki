# HMW: multiplayer test needs

133 of the 213 reviewed HMW cards need Twin Suns or Always Two tests beyond the engine-level ones (see ../engine-test-notes.md). Cards not listed need none.

### Asajj Ventress — No Time For Regret #001

> Action [Exhaust]: Attack with a unit. For this attack, replace any Raid it has or gains with Restore, or vice versa. // Restore 2 / Action: Attack with a unit. For this attack, replace any Raid it has or gains with Restore, or vice versa.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Grand Moff Tarkin — Tyrant of the Outer Rim #004

> Ignore the aspect penalties on upgrades with Fortify you play. // Ignore the aspect penalties on upgrades with Fortify you play. / When the regroup phase starts: You may defeat a base with 10 or less remaining HP.

**Twin Suns**
- Ensure the regroup-start trigger can defeat an opponent's base with exactly 10 remaining HP, which eliminates that player during the regroup phase, and cannot choose a base with 11 remaining HP.
- Ensure a base's remaining HP for the 10-or-less check is its health minus its damage (a damaged 25-health base with 15 damage qualifies).

**Always Two**
- Ensure the regroup-start trigger can defeat a base with exactly 10 remaining HP but not one with 11, using health minus damage.
- Ensure a base already at or past its health (0 remaining HP) is a legal choice for the regroup-start trigger.
- Ensure an upgrade with Fortify that you play ignores its aspect penalty on both the leader side and the unit side, but one the teammate plays still pays the aspect penalty.
- Ensure the regroup-start trigger happens only when your own deployed Tarkin is in play, and not for a teammate's.

### Jar Jar Binks — Bombad General #005

> Action [1 resource, Exhaust]: If you gave a token upgrade to a unit this phase, deal 1 damage to a unit and heal 1 damage from a base. // Shielded (When you deploy this leader, give a Shield token to him.) / On Attack: If you gave a token upgrade to a unit this phase, you may deal 1 damage to a unit and heal 1 damage from a base.

**Always Two**
- Ensure a token upgrade given by the teammate does not satisfy the condition.

### Omega — Close Your Eyes and Focus #006

> Action [1 resource, Exhaust]: Attack with a Heroism unit. It gains Grit for this attack. (It gets +1/+0 for each damage on it.) // Other friendly Heroism units gain Grit.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.
- Ensure the teammate's Heroism units gain Grit too while Omega is deployed.

### Darth Vader — Might of the Empire #007

> Friendly units that cost 3 or more gain Raid 1. // Raid 1 / Other friendly units that cost 3 or more gain Raid 1.

**Always Two**
- Ensure the teammate's units that cost 3 or more gain Raid 1 too (leader side and deployed).

### General Grievous — Separatist Warlord #008

> Action [Exhaust]: Play 2 units from your hand (one at a time, paying their costs). // While you control more units than an opponent, this unit gets +3/+0.

**Twin Suns**
- Ensure the +3/+0 applies while the controller controls more units than at least one opponent, even if another opponent controls as many or more; no opponent is chosen.

**Always Two**
- Ensure the +3/+0 applies while you control more units than either enemy individually; the teammate's units are not counted as yours.

### Chewbacca — Relentless Rebel #009

> Action [2 resources, Exhaust]: Attack with a unit, even if it's exhausted. It can't attack bases for this attack. // Action: Attack with a unit, even if it's exhausted. It can't attack bases for this attack. Use this ability only once each round.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Darth Sidious — There Is No Mercy #011

> When you deal 4 or more damage to a unit or base: You may exhaust this leader. If you do, deal 1 damage to a different unit or base. // Hidden (This unit can't be attacked if he was deployed this phase.) / When you deal 4 or more damage to a unit or base: You may deal 1 damage to a different unit or base.

**Always Two**
- Ensure damage dealt by the teammate's units or abilities does not trigger it.

### Poggle the Lesser — Let the Executions Begin #012

> Action [1 resource, Exhaust]: Ready a friendly Creature unit and deal 1 damage to it. // When Deployed: Create a Beast token. / On Attack: You may ready a friendly Creature unit and deal 1 damage to it.

**Always Two**
- Ensure the leader action and the deployed On Attack can choose the teammate's Creature unit as well as your own.

### Cham Syndulla — Hammer of Ryloth #013

> When non-combat damage is dealt to a friendly unit or base: You may exhaust this leader. If you do, deal 1 damage to an enemy unit or base. // When non-combat damage is dealt to a friendly unit or base: You may deal 1 damage to an enemy unit or base.

**Twin Suns**
- Ensure it does not trigger for non-combat damage dealt to any opponent's units or base.
- Ensure the enemy unit or base can be chosen from any opponent's units and bases.

**Always Two**
- Ensure it triggers for non-combat damage dealt to the teammate's units or base as well as your own.
- Ensure only an enemy's unit or base can be chosen, never the teammate's.

### Wicket — Few Greater Battles to Fight #014

> When a friendly unit attacks a unit that costs more than it: You may exhaust this leader. If you do, draw a card. // On Attack: If you control a unit that costs 3 or less, draw a card.

**Twin Suns**
- Ensure a cheap unit controlled by an opponent does not satisfy the deployed On Attack condition.

**Always Two**
- Ensure the leader-side trigger fires when the teammate's unit attacks a unit that costs more, with Wicket's controller exhausting it and drawing.
- Ensure the deployed On Attack counts only units you control, not the teammate's cheap unit.

### Maul — Old Master #016

> Action [Exhaust]: Play a unit from your hand. It costs 1 resource less. Then, defeat it. (When Played abilities resolve after the unit is defeated.) // Shielded / When Deployed: You may play a unit that was defeated this phase from your discard pile. It costs 5 resources less.

**Always Two**
- Ensure only units from your own discard pile can be played, never one in the teammate's discard pile, even if it was defeated this phase.

### Osha — Haunted By Her Past #017

> Action [Exhaust]: If a friendly Heroism unit was defeated this phase, play a Villainy unit from your resources, ignoring its Villainy aspect penalties. If you do, you may resource a card from your hand. // Saboteur / Action: Play a Villainy unit from your resources, ignoring its Villainy aspect penalties. If you do, you may resource a card from your hand.

**Twin Suns**
- Ensure a friendly Heroism unit removed or moved to its owner's discard pile because a player was eliminated does not satisfy the leader-side 'was defeated this phase' condition.

**Always Two**
- Ensure a Heroism unit of the teammate defeated this phase satisfies the leader-side condition.

### Hunter — Everyone Get to Cover! #035

> When Played: Choose two. You may choose the same option more than once: / Give a Shield token to a unit. / Attack with a unit, even if it's exhausted. It can't attack bases for this attack.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Kelnacca — Solitary Master #036

> Restore 2 / When Played: You may pay any number of resources. For every 3 resources paid this way, deal damage equal to this unit's power to an enemy unit.

**Always Two**
- Ensure only an enemy's unit can be chosen, never the teammate's.

### Mother Talzin — Pledged to the Sisterhood #039

> Raid 1 / Each other friendly unit gains Restore 1.

**Always Two**
- Ensure the teammate's units gain Restore 1 too.

### Talzin's Shuttle — Mysterious Arrival #040

> Raid 1 (This unit gets +1/+0 while attacking.) / When Played: If an opponent played 2 or more cards this phase, you may give 2 Weakness tokens to a unit.

**Twin Suns**
- Ensure the condition is met only when a single opponent played 2 or more cards this phase.
- Ensure cards played by different opponents are not added together.

**Always Two**
- Ensure only cards played by one enemy count toward 2 or more; cards played by the two enemies are not added together.
- Ensure cards played by you or the teammate do not count.

### Ima-Gun Di — Holding Out For Resupply #044

> When Defeated: If you control fewer resources than an opponent, you may resource a card from your hand. If you do, resource the top card of your deck.

**Twin Suns**
- Ensure the condition is true if the controller controls fewer resources than any one opponent; no opponent is chosen.

**Always Two**
- Ensure only your own resources count as yours; the teammate's resources are not added.
- Ensure the condition is true if you control fewer resources than either enemy individually.

### Logray — Bright Tree Shaman #045

> When another friendly unit that costs 3 or less is dealt damage: You may deal 1 damage to an enemy unit.

**Always Two**
- Ensure it triggers for damage dealt to the teammate's other units that cost 3 or less as well as your own.
- Ensure only an enemy's unit can be chosen, never the teammate's.

### Krrsantan — Santo #046

> When Played: You may deal damage equal to the number of resources you control minus 3 to a ground unit.

**Always Two**
- Ensure only the resources you control are counted, not the teammate's or an enemy's.

### Greater Sarlacc #049

> Overwhelm / While playing this unit, you may defeat any number of ready resources you control. For each resource defeated this way, this unit costs 3 resources less to play.

**Always Two**
- Ensure the teammate's resources are not offered to defeat and do not count toward the cost reduction.

### Low Altitude Combat #050

> Move a space unit to the ground arena (it's now a ground unit). If you do, you may attack with a ground unit. It gets +2/+0 for this attack.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Fett's Firespray — Settling the Score #053

> Friendly units can attack bases while using Ambush.

**Twin Suns**
- Ensure the Ambush attack can choose any opponent's base.

**Always Two**
- Ensure a unit the teammate plays with Ambush can attack an enemy base (either one).

### Seismic Detonation #054

> Choose an arena. At the start of the next regroup phase, deal 3 damage to each enemy unit in that arena.

**Twin Suns**
- Ensure 3 damage is dealt at the start of the next regroup phase to every opponent's unit in the chosen arena.

**Always Two**
- Ensure 3 damage is dealt at the start of the next regroup phase to both enemies' units in the chosen arena and not to the teammate's.

### Mysterious Disappearance #058

> A player chooses a non-leader unit they control. You may defeat that unit. If you do, that player creates a Beast token.

**Twin Suns**
- Ensure the player who plays it can choose any one opponent (or themselves) as the player who chooses.
- Ensure the Beast token goes to the chosen opponent, not to the player who played the event.

**Always Two**
- Ensure the chosen player can be you, the teammate or either enemy.
- Ensure a chosen teammate picks one of their own non-leader units and creates the Beast token for themselves.

### Vice Admiral Rampart — A New Era of Safety #060

> If an upgrade on your base would be defeated, you may defeat this unit instead.

**Always Two**
- Ensure an upgrade on the teammate's base does not trigger the replacement.

### Director Krennic — The Work Has Stalled #061

> On Attack: If your base is upgraded, draw a card.

**Always Two**
- Ensure an upgraded teammate base does not count; only your own base does.

### Nuvo Vindi — Blue Shadow Perfected #062

> When Played: You may give a Weakness token to a unit. / When an enemy unit with a Weakness token on it is defeated: You may give a Weakness token to a unit. Use this ability only once each round.

**Twin Suns**
- Ensure the second ability triggers when a Weakness-token unit of any opponent is defeated.

**Always Two**
- Ensure the second ability triggers when either enemy's Weakness-token unit is defeated but not when the teammate's is.

### Clone of the Zillo Beast — Emperor's Experiment #065

> Other friendly units get –2/–2. / On Attack: You may give a Weakness token to a unit.

**Always Two**
- Ensure the teammate's units get -2/-2 as well.

### Carrion Spike — Harbinger of Tyranny #066

> Shielded / For each upgrade on your base, this unit gets +1/+0 and gains Restore 1.

**Always Two**
- Ensure upgrades on the teammate's base are not counted for the bonus or Restore.

### Grand Army Marine #072

> When Played: Give a Shield token to a friendly Gungan unit.

**Always Two**
- Ensure the choice can be the teammate's Gungan unit as well as your own.

### Boss Nass — Otoh Gunga Boss #077

> When Played/On Attack: You may defeat a Shield token on a friendly Gungan unit. If you do, create a Beast token and give a Shield token to it.

**Always Two**
- Ensure the choice can be a Shield token on the teammate's Gungan unit as well as your own.

### Qui-Gon Jinn — We'll Handle This #078

> Grit / When Played: You may defeat a unit that attacked your base this phase. If it's a leader unit, defeat this unit.

**Always Two**
- Ensure a unit that attacked the teammate's base does not count.

### Fambaa Shield Team #080

> When Played: Give a Shield token to each friendly ground unit without a Shield token on it.

**Always Two**
- Ensure the teammate's ground units without a Shield token also receive one.

### Gunga City Guard #084

> Restore 1 / While you control another Gungan unit or a Naboo base, this unit gains Shielded.

**Twin Suns**
- Ensure an opponent's Naboo base does not grant Shielded.

**Always Two**
- Ensure the teammate's Gungan units and Naboo base do not grant Shielded.

### Opee Sea Killer #090

> While you control a Naboo base, this unit gains Grit. (This unit gets +1/+0 for each damage on it.)

**Always Two**
- Ensure the teammate's Naboo base does not grant Grit.

### Pelta Relief Frigate #091

> When Played: Heal 2 damage from a friendly base and 2 damage from a friendly unit.

**Always Two**
- Ensure the base choice can be the teammate's base as well as your own, and the unit choice the teammate's unit as well as your own.
- Ensure damage on a base at or past its health can be healed down.

### Sando Aqua Monster #094

> Grit / When Played: If you control a Naboo base, you may defeat any number of ground units with combined power equal to or less than this unit's power. Deal damage to this unit equal to the combined power of the defeated units.

**Twin Suns**
- Ensure an opponent's Naboo base does not enable the ability.

**Always Two**
- Ensure the teammate's Naboo base does not enable the ability.

### Resonate #098

> If a friendly non-leader unit shares a Trait with a friendly leader, heal 4 damage from a unit or base.

**Twin Suns**
- Ensure a trait on either leader counts for the healing.

**Always Two**
- Ensure the condition can be met by the teammate's non-leader unit or the teammate's leader as well as your own.

### Always a Bigger Fish #099

> Defeat a friendly Creature unit. If you do, play a Creature unit that costs up to 3 more than the defeated unit from your hand for free.

**Always Two**
- Ensure the choice can be the teammate's Creature unit as well as your own.

### Torrent #100

> Give a Weakness token to a unit. If you control a Naboo base, give 2 Weakness tokens to that unit instead.

**Always Two**
- Ensure the teammate's Naboo base does not give 2 Weakness tokens.

### Disposable B1 #103

> When Played: If another friendly unit entered play this phase (including leader and token units), draw a card.

**Always Two**
- Ensure a unit that entered play under the teammate this phase (including token and leader units) enables the draw, and you are the one who draws.

### Garnac — Let the Hunt Begin! #104

> While an opponent controls a  unit, this unit gains Hidden. / When Attack Ends: You may attack with another unit.

**Twin Suns**
- Ensure it has Hidden while at least one opponent controls a unique unit, and loses it only when no opponent does.

**Always Two**
- Ensure only a unique unit controlled by an enemy grants Hidden; a unique unit controlled by the teammate does not.
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Nute Gunray — Perfectly Legal #105

> When Played: Each friendly unit (including this one) deals 1 damage to a different enemy unit.

**Twin Suns**
- Ensure the enemy unit for each damage can be chosen from any opponent's units, and the targets may belong to different opponents.

**Always Two**
- Ensure the teammate's units each deal 1 damage to a different enemy unit too.
- Ensure only an enemy's unit can be chosen, never the teammate's.

### Stormtrooper Patrol #107

> Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) / While you control another unit that costs 3 or more, this unit gets +2/+0.

**Always Two**
- Ensure the teammate's units do not count toward the +2/+0.

### The First Legion — Vader's Fist #108

> On Attack: Name a trait. Enemy cards, including those not in play, lose that trait for this phase.

**Twin Suns**
- Ensure the named trait is lost by every opponent's cards (in play and not in play) for this phase, and not by the controller's own cards.

**Always Two**
- Ensure the named trait is lost by both enemies' cards (in play and not in play) for this phase, and not by the controller's or the teammate's cards.

### Emperor Palpatine — Consolidating Power #110

> When Played: You may take control of an enemy non-leader unit that costs 3 or less. If you do, give 2 Weakness tokens to it.

**Always Two**
- Ensure only an enemy's unit can be chosen, never the teammate's.

### Invasion Lander #111

> When Played: Give each other friendly unit +2/+2 for this phase.

**Always Two**
- Ensure the teammate's other units also get +2/+2 for this phase.

### Military Academy #112

> Fortify (Attach this to your base, not a unit.) / Attached base gains: “Friendly units gain Overwhelm. (When attacking an enemy unit, deal excess damage to the opponent's base.)”

**Always Two**
- Ensure the teammate's units gain Overwhelm.

### Sinister War Memorial #113

> Fortify (Attach this to your base, not a unit.) / Attached base gains: “When a friendly unit is defeated: Heal 1 damage from this base.”

**Always Two**
- Ensure it heals the attached base when the teammate's unit is defeated.

### Breach #114

> A friendly unit deals damage equal to its power to an enemy unit in its arena. If the friendly unit has Overwhelm, deal the excess damage to an enemy base.

**Twin Suns**
- Ensure the enemy unit can be chosen from any opponent's units in the friendly unit's arena.
- Ensure the Overwhelm excess damage can go to an enemy base chosen from any opponent's base.

**Always Two**
- Ensure the friendly unit can be the teammate's as well as your own.
- Ensure only an enemy's unit can be chosen, never the teammate's.
- Ensure the Overwhelm excess damage can go to either enemy's base, never the teammate's.

### Leia Organa — These Are My Friends #115

> When you play another unit that costs 3 or less: Heal 1 damage from your base.

**Always Two**
- Ensure the teammate playing a unit does not trigger it.

### Chewbacca — Resourceful Wookiee #117

> This unit gains Raid 1 for each exhausted resource you control. / While each resource you control is exhausted, this unit gains Overwhelm.

**Twin Suns**
- Ensure Raid and Overwhelm look only at the resources you control, never an opponent's.

**Always Two**
- Ensure Raid and Overwhelm look only at the resources you control, not the teammate's.

### Ryyk Blademaster #118

> While you control 6 or more resources, this unit gains Ambush and Overwhelm.

**Always Two**
- Ensure the teammate's resources are not added to reach 6.

### Saw Gerrera — Shadowlands Insurgent #119

> When an opponent plays an event: Resource the top card of your deck.

**Twin Suns**
- Ensure it triggers once for an event played by any opponent, whichever opponent plays it.

**Always Two**
- Ensure it triggers when either enemy plays an event.
- Ensure it does not trigger when the teammate plays an event.

### Boga — Loyal Varactyl #122

> When Played/When Defeated: Choose a non-vehicle unit in your discard pile not named Boga. For this phase, you may play that unit from your discard pile. It costs 1 resource less.

**Always Two**
- Ensure units in the teammate's discard pile are not offered.

### King Grakchawwaa — King of Kashyyyk #123

> When Played: For each other friendly Wookiee unit, resource the top card of your deck. Ready each card resourced this way.

**Always Two**
- Ensure the teammate's other Wookiee units are counted.

### Luminara Unduli — Besieged General #124

> When you play a unit (including this one): You may attack with a unit. It gets +2/+0 for this attack.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### The Marauder — A New Home #125

> While playing this unit, you may choose any number of friendly units. Deal 1 damage to each of them. For each unit chosen this way, this unit costs 1 resource less.

**Always Two**
- Ensure the teammate's units can be chosen for the damage, and each one chosen reduces the cost by 1.

### Verdant Fortress #126

> Fortify (Attach this to your base, not a unit.) / Attached base gains: “Friendly units gain Raid 1. (They get +1/+0 while attacking.)”

**Always Two**
- Ensure the teammate's units gain Raid 1 and it applies when the teammate's unit attacks.

### Chewbacca's Bowcaster — Handcrafted Tradition #127

> Attach to a non-Vehicle unit. / When Played: If attached unit is Chewbacca, resource the top card of your deck. (It enters play exhausted.)

**Twin Suns**
- Ensure that if the attached unit is an opponent's Chewbacca, you resource the top card of your own deck.

**Always Two**
- Ensure that if the attached unit is the teammate's Chewbacca, you resource the top card of your own deck, not the teammate's.

### Child of Dathomir #129

> While you control 3 or more units (including this one), this unit gets +2/+0.

**Always Two**
- Ensure only units you control count toward 3 or more; the teammate's units do not.

### Emerie Karr — For Your Own Good #130

> When Played: You may deal 1 damage to another ground unit. If you control that unit, the next unit you play this phase costs 1 resource less.

**Always Two**
- Ensure damaging a teammate's ground unit does not give the discount, since you do not control it.
- Ensure a unit the teammate plays does not get the discount and does not use it up.

### Soaring Can-Cell #131

> Raid 1 / While you control a Kashyyyk base, this unit gains Ambush.

**Twin Suns**
- Ensure Ambush is not gained when only an opponent controls a Kashyyyk base.

**Always Two**
- Ensure Ambush is not gained when only the teammate controls a Kashyyyk base.

### Wroshyr Rebel #133

> This unit gets +1/+0 for every 2 resources you control.

**Always Two**
- Ensure only your own resources count toward the power bonus; the teammate's resources do not.

### Zam Wesell — Not What She Seems #134

> Hidden / This unit gains each friendly leader's traits except Force, even while she's not in play.

**Twin Suns**
- Ensure Zam gains the traits (except Force) of both of the controller's leaders, deployed or not, including while she is not in play.

**Always Two**
- Ensure Zam gains the traits (except Force) of the teammate's leader as well as your own, including while she is not in play.

### Lifetree Caravan #136

> When Played: If you control 3 or more units (including this one), you may resource the top card of your deck.

**Always Two**
- Ensure only units you control count toward 3 or more; the teammate's units do not.

### V-19 Skirmisher #137

> While you control 3 or more units, this unit gains Sentinel. (Enemy units in this arena must attack a Sentinel when they attack you.)

**Always Two**
- Ensure only units you control count toward 3 or more; the teammate's units do not.

### Commander Gree — Of the 41st Elite Corps #138

> While there are 3 or more Command aspect icons among friendly units (including this one) and upgrades, this unit gains Raid 4.

**Always Two**
- Ensure Command icons on the teammate's units and upgrades count toward the 3 icons.

### Rex — Outserved His Purpose #141

> Friendly units with no abilities get +1/+1.

**Always Two**
- Ensure the teammate's units with no abilities get +1/+1.

### Wookiee Rangers #142

> While you control another Wookiee unit or a Kashyyyk base, this unit gains Sentinel. (Enemy units in this arena must attack a Sentinel when they attack you.)

**Twin Suns**
- Ensure Sentinel is not gained when only an opponent controls another Wookiee unit or a Kashyyyk base.

**Always Two**
- Ensure Sentinel is not gained when only the teammate controls another Wookiee unit or a Kashyyyk base.

### Origin Tree Shyyyo #145

> Restore 1 / While you control a Kashyyyk base, the first, second, and third units you play each round cost 1 resource less, 2 resources less, and 3 resources less, respectively.

**Twin Suns**
- Ensure no discount is given when only an opponent controls a Kashyyyk base.

**Always Two**
- Ensure a teammate's Kashyyyk base does not enable the discounts.
- Ensure units the teammate plays do not count toward first, second and third and get no discount.

### Local Support #148

> When Played: Reveal the top card of your deck. If it shares a trait with a friendly unit, draw it.

**Always Two**
- Ensure a teammate's unit sharing a trait with the revealed card enables the draw, and you draw the card.

### Log Trap #149

> Attack with a friendly unit. Then attack with it again, even if it's exhausted. It can't attack bases for the second attack.

**Twin Suns**
- Ensure the second attack can choose a different opponent's unit than the first attack did.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Migrate #150

> For every 3 resources you control, create a Beast token.

**Always Two**
- Ensure only your own resources count; the teammate's resources do not add Beast tokens.

### Overgrowth #151

> If you control a Kashyyyk base, a friendly unit deals damage equal to its power to an enemy unit. / Resource this card.

**Twin Suns**
- Ensure an opponent's Kashyyyk base does not satisfy the condition; only a base you control counts.

**Always Two**
- Ensure a Kashyyyk base controlled by the teammate does not satisfy the condition.
- Ensure the friendly unit can be the teammate's as well as your own.
- Ensure only an enemy's unit can be chosen, never the teammate's.

### Babwa Venomor — Burning Kashyyyk #152

> Overwhelm / When Played: An opponent creates a Beast token.

**Twin Suns**
- Ensure the controller chooses which opponent creates the Beast token, and the choice persists through the ability.
- Ensure only the chosen opponent creates and controls the Beast token.

**Always Two**
- Ensure the choice is either enemy, never the teammate.
- Ensure only the chosen enemy creates and controls the Beast token.

### Dooku's Solar Sailer — Droid Army Portent #154

> When Played: If you control a unit that costs 1 or less, each opponent discards a card from their hand.

**Twin Suns**
- Ensure every opponent discards a card from their hand.

**Always Two**
- Ensure both enemies each discard a card and the teammate does not.
- Ensure a teammate's unit costing 1 or less does not satisfy the condition.

### Arena Acklay — Screaming Predator #156

> When this unit is dealt damage and survives: Deal 2 damage to each enemy base.

**Twin Suns**
- Ensure every opponent's base takes 2 damage.

**Always Two**
- Ensure both enemy bases take 2 damage and the teammate's base does not.

### Battle-Scarred Destroyer #158

> When Played: Deal 4 damage to a friendly unit.

**Always Two**
- Ensure the choice can be the teammate's unit as well as your own.

### General Grievous — Scourge of Dathomir #159

> Bases can't be healed. / When Played: Deal 4 damage to a base.

**Twin Suns**
- Ensure that if the 4 damage eliminates an opponent, the elimination heal of 5 does not happen while Grievous is in play, because bases can't be healed.

### Noxious Refinery #160

> Fortify (Attach this to your base, not a unit.) / Attached base gains: “When the regroup phase starts: Reveal the top card of your deck. If it's Aggression, deal 1 damage to an enemy unit.”

**Always Two**
- Ensure only an enemy's unit can be chosen, never the teammate's.

### Raze to Ruin #161

> Each player discards all but 3 cards from their hand.

**Twin Suns**
- Ensure every player discards all but 3 cards from their own hand, each choosing independently, and a player with 3 or fewer cards discards nothing.

**Always Two**
- Ensure the teammate also discards all but 3 cards from their own hand, choosing for themselves, along with you and both enemies.

### Teebo — Striped Hunter #162

> Hidden (This unit can't be attacked if he was played this phase.) / Other friendly Ewok units gain Hidden.

**Always Two**
- Ensure the teammate's other Ewok units gain Hidden.

### Chief Chirpa — Defiant Elder #164

> This unit gets +1/+0 for each other friendly Ewok unit.

**Always Two**
- Ensure the teammate's Ewok units count toward the bonus.

### Ezra Bridger — What Are You Afraid Of? #168

> When you take the initiative: You may deal 3 damage to your base. If you do, create a Beast token.

**Twin Suns**
- Ensure the trigger fires only when the unit's controller takes the initiative, not when another player takes it.
- Ensure that if the 3 damage eliminates the controller, no Beast token is created.

**Always Two**
- Ensure the trigger fires only when the unit's controller takes the initiative, not when an enemy takes it.
- Ensure the 3 damage can only go to the controller's own base, never the teammate's.
- Ensure that if the controller's base is already at or past its health, the 3 damage can still be dealt, the player is not eliminated, and the Beast token is still created.

### Crosshair — I've Changed #169

> When this unit is dealt damage and survives: Each player draws a card. / When an opponent draws 1 or more cards during the action phase: Deal 2 damage to their base.

**Twin Suns**
- Ensure when it survives damage every player draws a card, including the controller.
- Ensure each opponent who draws during the action phase takes 2 damage to their own base, separately per opponent; the controller's own draw does not trigger it.
- Ensure an opponent drawing from taking the Plan counter during the action phase also triggers it.

**Always Two**
- Ensure when it survives damage every player draws a card, including the teammate.
- Ensure an enemy drawing during the action phase takes 2 damage to their own base; the other enemy's base is not damaged unless they also drew.
- Ensure the teammate drawing does not trigger the damage.

### Rebel Operation #173

> This card costs 1 resource less to play for each friendly Rebel unit and leader. / Draw 2 cards.

**Twin Suns**
- Ensure each of the controller's Rebel leaders counts toward the cost reduction when both leaders are Rebel.

**Always Two**
- Ensure the teammate's Rebel units and Rebel leader reduce the cost.

### Village Troublemaker #176

> While you control an Endor base, this unit gains Hidden and Saboteur.

**Twin Suns**
- Ensure Hidden and Saboteur are not gained when only an opponent controls an Endor base.

**Always Two**
- Ensure Hidden and Saboteur are not gained when only the teammate controls an Endor base.

### Adamant Ewoks #177

> When Played: If you control another Ewok unit or an Endor base, you may deal 1 damage to a base and 1 damage to an enemy unit.

**Always Two**
- Ensure only an enemy's unit can be chosen, never the teammate's.
- Ensure a teammate's Ewok unit or Endor base does not satisfy the condition.

### Stormchaser #180

> When Played: You may reveal a Disaster card from your hand. If you do or if there's a Disaster card in your discard pile, draw a card.

**Twin Suns**
- Ensure an opponent's discard pile with a Disaster card does not trigger the draw.

**Always Two**
- Ensure a Disaster card in the teammate's discard pile does not trigger the draw.

### Arena Nexu — Starved for Prey #182

> Grit / On Attack: You may deal 3 damage to a friendly Creature unit (including this one) and ready this unit. Use this ability only once each round.

**Always Two**
- Ensure the choice can be the teammate's Creature unit as well as your own.

### Aggrocrab #184

> While you have the initiative, this unit costs 1 resource less to play.

**Always Two**
- Ensure it costs 1 less to play when the team has the initiative, including when the teammate took it.

### Ty Yorrick — Monster Hunter #185

> If a friendly ability would deal damage, you may have that ability deal that much damage plus 1 instead. / On Attack: You may deal 1 damage to a Creature unit.

**Twin Suns**
- Ensure damage dealt by an opponent's ability gets no +1 from Ty Yorrick, while damage dealt by the controller's own abilities can.

**Always Two**
- Ensure damage dealt by an ability on the teammate's card can get the +1 from Ty Yorrick, and Ty Yorrick's controller (not the teammate) decides whether to use it.
- Ensure damage dealt by an enemy's ability gets no +1 from Ty Yorrick.

### Mining Guild Trespasser #186

> When Played: You may deal 2 damage to a base and 2 damage to an enemy unit.

**Always Two**
- Ensure only an enemy's unit can be chosen, never the teammate's.

### Giant Gorax #188

> Overwhelm / On Attack/When Defeated: If you control an Endor base, each opponent chooses one: / You deal 3 damage to a unit or base they control. / They discard a card from their hand and defeat a resource they control.

**Twin Suns**
- Ensure every opponent separately chooses one option, and the 3 damage can only hit a unit or base controlled by the opponent who chose it.
- Ensure each opponent's discard and defeated resource come from their own hand and resources.

**Always Two**
- Ensure only an Endor base you control enables it; a teammate's Endor base does not.
- Ensure both enemies each choose separately, the teammate chooses nothing, and the 3 damage can only hit a unit or base of the choosing enemy.

### Volley Fire #192

> A friendly unit deals damage equal to its Raid to an enemy unit.

**Always Two**
- Ensure the choice can be the teammate's unit as well as your own.
- Ensure only an enemy's unit can be chosen as the damage target, never the teammate's.

### Nightfall #193

> Deal 1 damage to an enemy unit. / If you control an Endor base, you may attack with a unit. It gets +2/+0 for this attack.

**Always Two**
- Ensure only an enemy's unit can be chosen for the damage, never the teammate's.
- Ensure only an Endor base you control enables the attack; a teammate's does not.
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Run Amok #194

> Create a Beast token. / Deal 1 damage to a friendly ground unit and 1 damage to an enemy ground unit.

**Twin Suns**
- Ensure the enemy ground unit can be chosen from any opponent's ground units.

**Always Two**
- Ensure the choice can be the teammate's ground unit as well as your own.
- Ensure only an enemy's ground unit can be chosen for the enemy damage, never the teammate's.

### Qimir — Everyone Has a Weakness #196

> When Defeated: You may discard the top card of your deck. If it's not Villainy, give a Weakness token to an enemy unit.

**Twin Suns**
- Ensure the Weakness token can be given to a unit of any opponent.

**Always Two**
- Ensure only an enemy's unit can be given the Weakness token, never the teammate's.

### Cid Scaleback — Can't Be Trusted #197

> When Played: An opponent chooses a unit they control. Give a Weakness token to it.

**Twin Suns**
- Ensure the controller chooses which opponent, and the choice persists through the ability.
- Ensure only units controlled by that chosen opponent can be selected for the Weakness token.

**Always Two**
- Ensure the choice is either enemy, never the teammate.
- Ensure only units controlled by the chosen enemy can be selected, not the teammate's or the other enemy's.

### Geonosian Picador #199

> When Played: Create a Beast token. Then, give a Weakness token to a friendly unit.

**Always Two**
- Ensure the choice can be the teammate's unit as well as your own.

### Rish Loo — Traitorous Minister #200

> Hidden / When Played: Take control of an enemy non‑leader unit with a Weakness token on it. At the start of the next regroup phase, its owner takes control of it.

**Twin Suns**
- Ensure the unit returns to its owner at the start of the next regroup phase, even if a different opponent controlled it when taken.
- Ensure that if the taken unit's owner is eliminated before the regroup it is removed from the game, and if Rish Loo's controller is eliminated while controlling it the unit goes to its owner's discard pile with no return.

**Always Two**
- Ensure only an enemy's non-leader unit with a Weakness token can be chosen, never the teammate's.
- Ensure the unit returns to its owner at the start of the next regroup phase, including a teammate-owned unit that an enemy controlled.

### Nightbrother — Maul's Gauntlet #204

> When Played: You may play a unit from your discard pile. It costs 3 resources less and enters play ready. At the start of the next regroup phase, defeat it.

**Always Two**
- Ensure the unit cannot be played from the teammate's discard pile.

### Intelligence Agency #205

> Fortify (Attach this to your base, not a unit.) / Attached base gains: “You may look at the top card of your deck at any time.” / When Played: Look at an opponent's hand. You may discard a card from it. If you do, they draw a card.

**Twin Suns**
- Ensure the controller chooses which opponent, and the choice persists through the ability.
- Ensure only the chosen opponent's hand is looked at, and that same opponent draws if a card is discarded.

**Always Two**
- Ensure the choice is either enemy, never the teammate, and the same enemy draws if a card is discarded.

### The Tarkin Doctrine — Protect and Punish #206

> Fortify (Attach this to your base, not a unit.) / Attached base gains: “When you play a Fortification upgrade: Exhaust an enemy unit.” / When Played: If you control Grand Moff Tarkin, give an enemy unit –3/–0 for this phase.

**Twin Suns**
- Ensure both enemy unit choices (the exhaust and the -3/-0) can be chosen from any opponent's units.

**Always Two**
- Ensure the granted ability triggers only when you play a Fortification, not when the teammate does.
- Ensure only a Grand Moff Tarkin you control satisfies the condition; a teammate's does not.
- Ensure both enemy unit choices allow only an enemy's unit, never the teammate's.

### Corona Squadron X-Wing #209

> On Attack: You may ready a resource.

**Twin Suns**
- Ensure the resource readied can belong to you or to any one opponent, whichever the controller chooses.

**Always Two**
- Ensure the resource readied can belong to you, the teammate or either enemy.

### The Chieftain — Here Since the Oceans Dried #212

> This unit gains Raid 1 for each other friendly Tusken unit. / While a friendly Tusken unit is defending, it gets +1/+0 for each Raid it has.

**Always Two**
- Ensure the teammate's other Tusken units add to the Chieftain's Raid.
- Ensure the teammate's Tusken unit defending gets +1/+0 for each Raid it has.

### Phee Genoa — Liberator of Ancient Wonders #214

> Hidden / When an enemy leader deploys: Its controller may pay 2 resources. If they don't, exhaust that leader.

**Twin Suns**
- Ensure it triggers when any opponent's leader deploys, and that leader's controller decides whether to pay 2 from their own resources.

**Always Two**
- Ensure it triggers when either enemy's leader deploys, and the deploying enemy pays (or not) from their own resources.
- Ensure it does not trigger when your teammate's leader deploys.

### Teeka — You're in Luck #221

> When Played: Choose one: / Give a unit Sentinel for this phase. / A unit loses Sentinel for this phase.

**Twin Suns**
- Ensure a Sentinel given to an opponent's unit works for that unit's controller.

**Always Two**
- Ensure both modes can target the teammate's unit as well as enemy units.
- Ensure a Sentinel given to the teammate's unit protects the teammate's units and base.

### Sandcrawler Sales Team #222

> Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) / When Played: If you control a Tatooine base, you may return an upgrade that costs 3 or less to its owner's hand.

**Twin Suns**
- Ensure the When Played effect does nothing when only an opponent controls a Tatooine base.

**Always Two**
- Ensure the When Played effect does nothing when only the teammate controls a Tatooine base.

### Therm Scissorpunch — Boastful Gambler #223

> When the action phase starts: Reveal the top card of your deck and an opponent's deck. For each card that costs 3 or more revealed this way, this unit gets –2/–2 for this phase.

**Twin Suns**
- Ensure the controller chooses which opponent, and the choice persists through the ability.
- Ensure only the chosen opponent's top card is revealed, together with the top card of the controller's own deck.

**Always Two**
- Ensure the choice is either enemy, never the teammate.

### Boba Fett — Family Found #225

> Ambush / When a friendly unit with Ambush enters play: Give it Raid 1 and Saboteur for this phase.

**Always Two**
- Ensure a teammate's unit with Ambush entering play gains Raid 1 and Saboteur for this phase, as well as your own.

### Lakeside Shaaks #228

> When Played: Ready a friendly resource.

**Always Two**
- Ensure the choice can be the teammate's resource as well as your own.

### Raiding Party #230

> Raid 6 (This unit gets +6/+0 while attacking.) / When Played: If you control another Tusken unit or a Tatooine base, you may exhaust a ground unit.

**Twin Suns**
- Ensure the condition is not met when only an opponent controls another Tusken unit or a Tatooine base.

**Always Two**
- Ensure the condition is not met when only the teammate controls another Tusken unit or a Tatooine base.

### Mon Cal Cruiser #232

> When Played: Choose one: / Attack with a unit. It gets +2/+0 for this attack. / Look at an opponent's hand. You may discard a card from it. If you do, they draw a card.

**Twin Suns**
- Ensure that with the hand mode the controller chooses which opponent, the choice persists, and only that opponent's hand is looked at and that same opponent draws if a card is discarded.

**Always Two**
- Ensure the hand mode targets an enemy, never the teammate, and the same enemy draws if a card is discarded.
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Ritual Dragon #234

> Saboteur / While you control a Tatooine base, friendly units enter play ready (including this one).

**Always Two**
- Ensure the teammate's units enter play ready while the Dragon's controller controls a Tatooine base.
- Ensure a Tatooine base controlled only by the teammate does not satisfy the condition.

### Easy Prey #237

> Create a Beast token. / An opponent creates a Beast token. Give a Weakness token to it.

**Twin Suns**
- Ensure the controller chooses which opponent, and the choice persists through the ability.
- Ensure only the chosen opponent creates a Beast token and the Weakness token goes on that token; other opponents get nothing.

**Always Two**
- Ensure the choice is either enemy, never the teammate.
- Ensure only the chosen enemy creates the Beast and gets the Weakness token; the other enemy and the teammate get nothing.

### Sandstorm #240

> While you control a Tatooine base, this event costs 1 resource less to play. / Choose an arena. Give a Weakness token to each exhausted enemy unit in that arena.

**Twin Suns**
- Ensure the cost reduction is not applied when only an opponent controls a Tatooine base.
- Ensure Weakness tokens go to the exhausted units of every opponent in the chosen arena, and not to your own.

**Always Two**
- Ensure the cost reduction is not applied when only the teammate controls a Tatooine base.
- Ensure Weakness tokens go to the exhausted units of both enemies in the chosen arena, and not to the teammate's units.

### Occupation Officer #242

> When Played: If you control 6 or more resources, you may give a Weakness token to a unit.

**Always Two**
- Ensure only your own resources count toward the 6; the teammate's resources do not.

### Separatist Harbinger #244

> When Played/On Attack: An opponent chooses a unit or base they control. You may deal 2 damage to it.

**Twin Suns**
- Ensure the controller chooses which opponent, and the choice persists through the ability.
- Ensure only units or the base controlled by the chosen opponent are selectable.

**Always Two**
- Ensure the choice is either enemy, never the teammate.
- Ensure only units or the base controlled by the chosen enemy are selectable, not the teammate's or the other enemy's.

### Surveillance Cruiser #247

> When Played: If an opponent controls an Endor, Kashyyyk, Naboo, or Tatooine base, draw a card.

**Twin Suns**
- Ensure it draws a card if any one opponent controls a qualifying base; no opponent is chosen.

**Always Two**
- Ensure a qualifying base controlled by the teammate does not count, and a qualifying base held by either enemy is enough.

### Imperial Cavalry #250

> When Played: Create a Beast token and deal 1 damage to an enemy unit.

**Always Two**
- Ensure only an enemy's unit can be chosen, never the teammate's.

### Blockade Ship #251

> Sentinel (Enemy units in this arena must attack a Sentinel when they attack you.) / Enemy ground units get –1/–0 while attacking.

**Twin Suns**
- Ensure every opponent's ground units are affected.

**Always Two**
- Ensure both enemies' ground units are affected and the teammate's are not.

### Forced Pacification #253

> Defeat any number of friendly units. For each friendly unit defeated this way, exhaust 2 enemy units.

**Twin Suns**
- Ensure the 2 enemy units per defeated friendly unit can be chosen from any combination of opponents' units.

**Always Two**
- Ensure the teammate's units can be chosen to be defeated, and each counts toward the number of enemy units exhausted.
- Ensure the exhausted enemy units can be any combination of both enemies' units, never the teammate's.

### Jedi Interceptor #256

> While you control 6 or more resources, this unit gets +2/+0.

**Always Two**
- Ensure only your own resources count toward the 6; the teammate's resources do not.

### Ewok Archers #257

> While you control another unit that costs 3 or less, this unit gains Ambush. (When you play this unit, it may attack an enemy unit.)

**Always Two**
- Ensure a teammate's unit that costs 3 or less does not grant Ambush; only your own other units count.

### Queen Amidala — Retaking Theed #260

> If you control an upgraded base, this unit costs 2 resources less to play. / Restore 2

**Always Two**
- Ensure the cost reduction does not apply when only the teammate's base is upgraded.

### Mylaya Rider #262

> When Played: Create a Beast token and heal 2 damage from your base.

**Always Two**
- Ensure the damage is healed from your own base only, not the teammate's base.

### Familiar Strategem #266

> Attack with a unit. If it shares a Trait with another friendly unit, it gets +2/+0 for this attack.

**Always Two**
- Ensure a teammate's unit sharing a trait with the attacker gives it +2/+0.
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Renew #267

> You may defeat a Condition upgrade. / Heal 3 damage from your base.

**Always Two**
- Ensure the damage is healed from your own base only, not the teammate's base.

### Landing Pad #271

> Fortify (Attach this to your base, not a unit.) / Attached base gains: “Friendly space units get +1/+0.”

**Always Two**
- Ensure the teammate's space units get +1/+0 from the attached base.

### Growth #272

> Create a Beast token. / Heal 3 damage from your base. / Draw a card.

**Always Two**
- Ensure the damage is healed from your own base only, not the teammate's base.
