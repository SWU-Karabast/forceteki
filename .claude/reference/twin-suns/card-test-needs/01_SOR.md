# SOR: multiplayer test needs

112 of the 179 reviewed SOR cards need Twin Suns or Always Two tests beyond the engine-level ones (see ../engine-test-notes.md). Cards not listed need none.

### Director Krennic — Aspiring to Authority #001

> Each friendly damaged unit gets +1/+0.  // Restore 2 (When this unit attacks, heal 2 damage from your base.) / Each friendly damaged unit gets +1/+0.

**Always Two**
- Ensure the teammate's damaged units also get +1/+0 (leader side and deployed).

### Iden Versio — Inferno Squad Commander #002

> Action [Exhaust]: If an enemy unit was defeated this phase, heal 1 damage from your base. // Shielded (When you deploy this leader, give her a Shield token.) / When an enemy unit is defeated: Heal 1 damage from your base.

**Twin Suns**
- Ensure the leader action heals only if an enemy unit of any opponent was defeated this phase, whichever opponent it belonged to.
- Ensure the deployed trigger fires when a unit of any opponent is defeated and heals only Iden's controller's base.

**Always Two**
- Ensure the heal triggers for a unit defeated from either enemy player, and does not trigger for a defeated teammate's unit.
- Ensure it heals only Iden's controller's base, not the teammate's base.

### Luke Skywalker — Faithful Friend #005

> Action [1 resource, exhaust]: Give a Shield token to a [Heroism] unit you played this phase.  // On Attack: You may give another unit a Shield token.

**Always Two**
- Ensure the leader action cannot target a Heroism unit the teammate played this phase.

### Emperor Palpatine — Galactic Ruler #006

> Action [1 resource, exhaust, defeat a friendly unit]: Deal 1 damage to a unit and draw a card. // When Deployed: Take control of a damaged non-leader unit. / On Attack: You may defeat another friendly unit. If you do, deal 1 damage to a unit and draw a card.

**Always Two**
- Ensure the leader-side cost and the deployed On Attack can defeat the teammate's unit, and the draw still goes to Palpatine's controller.
- Ensure the deployed When Deployed can take control of the teammate's damaged non-leader unit, moving it to Palpatine's controller.

### Hera Syndulla — Spectre Two #008

> Ignore the aspect penalty on SPECTRE cards you play. // Ignore the aspect penalty on SPECTRE cards you play. / On Attack: You may give an Experience token to another unique unit.

**Always Two**
- Ensure the aspect penalty is not ignored for Spectre cards the teammate plays.

### Leia Organa — Alliance General #009

> Action [exhaust]: Attack with a Rebel unit. Then, you may attack with another Rebel unit. // Raid 1 (This unit gets +1/+0 while attacking.) / When this unit completes an attack: You may attack with another Rebel unit.

**Always Two**
- Ensure that she cannot cause teammate’s Rebel to attack

### Darth Vader — Dark Lord of the Sith #010

> Action [1 resource, exhaust]: If you played a [Villainy] card this phase, deal 1 damage to a unit and 1 damage to a base. // On Attack: You may deal 2 damage to a unit.

**Twin Suns**
- Ensure only a Villainy card the controller played this phase enables the damage.
- Ensure the unit and the base can belong to any players (the base may be any opponent's or the controller's own), and need not belong to the same player.
- Ensure the deployed On Attack can deal 2 damage to a unit of any opponent.

**Always Two**
- Ensure a Villainy card played by the teammate this phase does not enable the damage.
- Ensure the 1 damage to a base can target the teammate's base, and the damage to a unit can target the teammate's unit.
- Ensure the deployed On Attack can target a teammate's unit.

### Grand Inquisitor — Hunting the Jedi #011

> Action [exhaust]: Deal 2 damage to a friendly unit with 3 or less power and ready it. // On Attack: You may deal 1 damage to another friendly unit with 3 or less power and ready it.

**Always Two**
- Ensure the leader-side action and the deployed On Attack can choose the teammate's unit with 3 or less power, which takes the damage and is readied.

### IG-88 — Ruthless Bounty Hunter #012

> Action [Exhaust]: Attack with a unit. If you control more units than the defending player, the attacker gets +1/+0 for this attack. // Each other friendly unit gains Raid 1. (They get +1/+0 while attacking.)

**Twin Suns**
- Ensure the +1/+0 compares the controller's unit count only with the defending player's units, not with the other opponents'.

**Always Two**
- Ensure the +1/+0 compares only the controller's own units (not the teammate's) with the defending enemy's units.
- Ensure the deployed IG-88 gives Raid 1 to the teammate's units too.
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Cassian Andor — Dedicated to the Rebellion #013

> Action [1 resource, Exhaust]: If you've dealt 3 or more damage to an enemy base this phase, draw a card. // Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) / When you deal damage to an enemy base: You may draw a card. Use this ability only once each round.

**Twin Suns**
- Ensure damage dealt to enemy bases of different opponents is counted correctly for the leader action condition.
- Ensure the deployed draw triggers on damage to any opponent's base and is limited to once each round.
- Ensure the 3 or more damage must be dealt to a single enemy base this phase; damage split across different enemy bases does not add up.

**Always Two**
- Ensure the leader action condition counts only damage dealt by Cassian's controller (and their cards), not damage dealt by the teammate.
- Ensure the deployed draw triggers on damage to either enemy base, never on damage to the teammate's base, and is once each round for Cassian's controller.
- Ensure the 3 or more damage must be dealt to a single enemy base this phase; damage split across the two enemy bases does not add up.

### Sabine Wren — Galvanized Revolutionary #014

> Action [exhaust]: Deal 1 damage to each base. // On Attack: Deal 1 damage to each enemy base.

**Twin Suns**
- Ensure the leader-side action damages every non-eliminated player's base, including the controller's own.
- Ensure the deployed On Attack damages every opponent's base but not the controller's own base.

**Always Two**
- Ensure the leader-side action damages all four bases, including the teammate's and the controller's own.
- Ensure the deployed On Attack damages both enemy bases and not the teammate's base or the controller's own.
- Ensure damage is added even if base(s) are already at or beyond the damage that would be required to defeat them normally.

### Boba Fett — Collecting the Bounty #015

> When an enemy unit leaves play: You may exhaust this leader. If you do, ready a resource. // When this unit completes an attack: If an enemy unit left play this phase, ready up to 2 resources.

**Twin Suns**
- Ensure the leader-side trigger and the deployed condition fire when a unit of any one opponent leaves play, whichever opponent it was.
- Ensure the resource(s) readied can belong to any player, including each opponent.

**Always Two**
- Ensure the triggers and the deployed condition fire when either enemy's unit leaves play, and not when the teammate's unit leaves play.
- Ensure the resource(s) readied can be your own, your teammate's, or either enemy's.

### Grand Admiral Thrawn — Patient and Insightful #016

> When the action phase starts: Look at the top card of each player's deck. / Action [1 resource, exhaust]: Reveal the top card of any player's deck. Exhaust a unit that costs the same as or less than the revealed card. // When the action phase starts: Look at the top card of each player's deck. / On Attack: You may reveal the top card of any player's deck. Exhaust a unit that costs the same as or less than the revealed card.

**Twin Suns**
- Ensure the action-phase-start look shows the top card of every player's deck, and the reveal can name any player's deck.

**Always Two**
- Ensure the action-phase-start look includes the teammate's deck and both enemies' decks.
- Ensure the reveal can name the teammate's deck.

### Han Solo — Audacious Smuggler #017

> Action [exhaust]: Put a card from your hand into play as a resource and ready it. At the start of the next action phase, defeat a resource you control. // On Attack: Put the top card of your deck into play as a resource and ready it. At the start of the next action phase, defeat a resource you control.

**Always Two**
- Ensure the later defeat can only choose a resource the controller controls, never the teammate's.

### Jyn Erso — Resisting Oppression #018

> Action [Exhaust]: Attack with a unit. The defender gets -1/-0 for this attack. // While a friendly unit is attacking, the defender gets -1/-0.

**Always Two**
- Ensure the deployed -1/-0 also applies when the teammate's unit is attacking.
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Del Meeko — Providing Overwatch #034

> Restore 1 (When this unit attacks, heal 1 damage from your base.) / Each event an opponent plays costs [1 resource] more.

**Twin Suns**
- Ensure events played by every opponent cost 1 more, and events played by Del Meeko's controller do not.

**Always Two**
- Ensure events played by either enemy cost 1 more.
- Ensure events played by the teammate cost no more.

### Gideon Hask — Ruthless Loyalist #036

> When an enemy unit is defeated: Give an Experience token to a friendly unit.

**Twin Suns**
- Ensure the trigger fires when a unit of any one opponent is defeated, whichever opponent it was.

**Always Two**
- Ensure the trigger fires when either enemy's unit is defeated, and not when the teammate's unit is defeated.
- Ensure the Experience token can be given to the teammate's unit.

### Academy Defense Walker #037

> Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) / When Played: Give an Experience token to each friendly damaged unit.

**Always Two**
- Ensure Experience tokens also go to the teammate's damaged units.

### Avenger — Hunting Star Destroyer #040

> When Played/On Attack: An opponent chooses a non‑leader unit they control. Defeat that unit.

**Twin Suns**
- Ensure the controlling player chooses which opponent is "an opponent", and only that opponent chooses and defeats one of their own non-leader units, leaving the other opponents' units unaffected.

**Always Two**
- Ensure the controller chooses one of the two enemies, and only that enemy chooses and defeats a non-leader unit.
- Ensure the teammate is never the chosen opponent and the teammate's units are not defeated.

### Power of the Dark Side #041

> An opponent chooses a unit they control. Defeat that unit.

**Twin Suns**
- Ensure the player who plays the event chooses which opponent is "an opponent", and only that opponent chooses and loses one unit they control, leaving the other opponents' units unaffected.

**Always Two**
- Ensure the player chooses one of the two enemies, and only that enemy chooses and loses a unit.
- Ensure the teammate cannot be chosen as the opponent.
- Ensure the choice is either enemy, never the teammate.

### Yoda — Old Master #045

> Restore 2 (When this unit attacks, heal 2 damage from your base.) / When Defeated: Choose any number of players. They each draw a card.

**Twin Suns**
- Ensure any subset of the non-eliminated players can be chosen (none, one, several or all), including the controller, and each chosen player draws a card.

**Always Two**
- Ensure any combination of the four players can be chosen (none, one, some or all): the controller, the teammate and both enemies.
- Ensure each chosen player draws a card, the teammate drawing their own.

### Kanan Jarrus — Revealed Jedi #047

> On Attack: You may discard 1 card from the defending player's deck for each friendly SPECTRE unit. Heal 1 damage from your base for each different aspect among the discarded cards.

**Twin Suns**
- Ensure only the controller's own SPECTRE units count for the discard number, and the discard comes from the attacked opponent's deck only (not other opponents').

**Always Two**
- Ensure the teammate's SPECTRE units count for the discard number.
- Ensure the healing goes only to Kanan's controller's base, not the teammate's base.

### Obi-Wan Kenobi — Following Fate #049

> Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) / When Defeated: Give 2 Experience tokens to another friendly unit. If it's a Force unit, draw a card.

**Always Two**
- Ensure the When Defeated can give the 2 Experience tokens to the teammate's unit.
- Ensure that if the teammate's unit is a Force unit, Obi-Wan's controller draws the card, not the teammate.

### Luke Skywalker — Jedi Knight #051

> Restore 3 / When Played: Give an enemy unit –3/–3 for this phase. If a friendly unit was defeated this phase, give that enemy unit –6/–6 for this phase instead.

**Always Two**
- Ensure the target can be either enemy's unit but never the teammate's unit.
- Ensure the -6/-6 condition is met when the teammate's unit was defeated this phase.

### The Force Is With Me #055

> Choose a friendly unit and give 2 Experience tokens to it. If you control a FORCE unit, also give a Shield token to the chosen unit. You may attack with the chosen unit.

**Always Two**
- Ensure the teammate's unit can be chosen and receives the Experience tokens, and the Shield is given only if you control a Force unit (a Force unit only the teammate controls does not count).
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Bendu — The One in the Middle #056

> Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) / On Attack: The next non-[Heroism], non-[Villainy] card you play this phase costs [2 resources] less.

**Always Two**
- Ensure the cost reduction is not used up or applied by a card the teammate plays.

### Vigilance #058

> Choose two, in any order: / Discard 6 cards from an opponent's deck. / Heal 5 damage from a base. / Defeat a unit with 3 or less remaining HP. / Give a Shield token to a unit.

**Twin Suns**
- Ensure that if the discard mode is chosen, the player picks which single opponent's deck loses 6 cards from the top, and other opponents' decks are unchanged.
- Ensure the other modes (heal a base, defeat a unit, Shield) behave as in 1v1.

**Always Two**
- Ensure the discard mode can only target an enemy's deck, never the teammate's.
- Ensure "Heal 5 damage from a base", "Defeat a unit" and "Give a Shield token to a unit" can target the teammate's base and units (no "enemy" restriction), and a base at 0 HP can still be healed.

### Regional Governor #062

> When Played: Name a card. While this unit is in play, opponents can't play the named card.

**Twin Suns**
- Ensure the named card cannot be played by any opponent of Regional Governor's player (all 2-3 of them).
- Ensure an eliminated player is not affected (they are no longer a player).
- Ensure that if another player takes control of Regional Governor, the restriction still applies to the original player's opponents (effect is not changed).

**Always Two**
- Ensure the named card cannot be played by either enemy player.
- Ensure the named card can be played by the friendly teammate.

### Baze Malbus — Temple Guardian #065

> Grit (This unit gets +1/+0 for each damage on him.) / While you have the initiative, this unit gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)

**Always Two**
- Ensure it has Sentinel while the team has the initiative, including when the teammate took it.

### Rugged Survivors #067

> Grit (This unit gets +1/+0 for each damage on it.) / On Attack: If you control a leader unit, you may draw a card.

**Always Two**
- Ensure the draw is not enabled by the teammate's leader unit; only the controller's own leader unit counts.

### Entrenched #072

> Attached unit can't attack bases.

**Twin Suns**
- Ensure the attached unit cannot attack the base of any opponent, but can still attack units.

**Always Two**
- Ensure the attached unit cannot attack either enemy base, but can still attack units.
- Ensure it can be attached to a teammate's unit and restricts that unit.

### It Binds All Things #075

> Heal up to 3 damage from a unit. If you control a FORCE unit, you may deal that much damage to another unit.

**Always Two**
- Ensure a Force unit controlled by the teammate does not enable the damage; only the controller's own Force unit counts.

### Make an Opening #076

> Give a unit –2/–2 for this phase. Heal 2 damage from your base.

**Always Two**
- Ensure the 2 damage is healed only from the controller's own base, not the teammate's.

### Admiral Piett — Captain of the Executor #079

> Each friendly non-leader unit that costs 6 or more gains Ambush. (After you play that unit, it may ready and attack an enemy unit.)

**Always Two**
- Ensure the teammate's non-leader units with printed cost 6 or more also gain Ambush when the teammate plays them.

### Emperor's Royal Guard #082

> While you control an OFFICIAL unit, this unit gains Sentinel. / While you control Emperor Palpatine (as a leader or unit), this unit gets +0/+1.

**Always Two**
- Ensure Sentinel and the +0/+1 are not enabled by the teammate's Official unit or Emperor Palpatine; only the controller's own cards count.

### Blizzard Assault AT-AT #088

> While attacking, this unit may deal its excess damage to an enemy ground unit.

**Twin Suns**
- Ensure the excess damage can go to an enemy ground unit of an opponent other than the defender's controller.

**Always Two**
- Ensure the excess damage can go to a ground unit of the enemy who is not the defender's controller, and never to the teammate's unit.

### Relentless — Konstantine's Folly #089

> The first event played by each opponent each round loses all abilities.

**Twin Suns**
- Ensure the first event played by each opponent each round loses all abilities, tracked separately per opponent (opponent B's first event is affected even if opponent A already played one).
- Ensure an opponent's second and later events that round are unaffected, and that the tracking resets next round.
- Ensure that events played before this enters play are still counted as the first event - so if a player plays an  event before Relentless enters play and then plays one afterward, the first one played after is not blanked.

**Always Two**
- Ensure the first event played by each enemy player each round loses all abilities, tracked separately per enemy.
- Ensure the friendly teammate's events are never affected.

### Devastator — Inescapable #090

> Sentinel / Overwhelm / When Played: You may deal damage to a unit equal to the number of resources you control.

**Always Two**
- Ensure the damage counts only the controller's own resources, not the teammate's.

### The Emperor's Legion #091

> Return each unit in your discard pile that was defeated this phase to your hand.

**Always Two**
- Ensure it returns only units from the controller's own discard pile, not the teammate's.

### Overwhelming Barrage #092

> Give a friendly unit +2/+2 for this phase. Then, it deals damage equal to its power divided as you choose among any number of other units.

**Always Two**
- Ensure the teammate's unit can be chosen to get +2/+2 and it deals the damage, divided as the event's controller chooses.

### Bail Organa — Rebel Councilor #094

> Action [Exhaust]: Give an Experience token to another friendly unit.

**Always Two**
- Ensure the Experience token can go to the teammate's unit.
- Ensure only Bail Organa's controller can use the action ability, never the teammate.

### Admiral Ackbar — Brilliant Strategist #097

> Restore 1 (When this unit attacks, heal 1 damage from your base.) / When Played: You may deal damage to a unit equal to the number of units you control in its arena.

**Always Two**
- Ensure the damage does not count the teammate's units in the arena; only the controller's own units count.

### Bright Hope — The Last Transport #099

> Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) / When Played: You may return a friendly non-leader ground unit to its owner's hand. If you do, draw a card.

**Always Two**
- Ensure the teammate's non-leader ground unit can be returned to the teammate's hand, and Bright Hope's controller draws the card.

### Wedge Antilles — Star of the Rebellion #100

> Each friendly VEHICLE unit gets +1/+1 and gains Ambush. (After you play that unit, it may ready and attack an enemy unit.)

**Always Two**
- Ensure the teammate's VEHICLE units also get +1/+1 and Ambush when the teammate plays them.

### Home One — Alliance Flagship #102

> Restore 2 / Each other friendly unit gains Restore 1. / When Played: Play a [Heroism] unit from your discard pile. It costs [3 resources] less.

**Always Two**
- Ensure the teammate's units also gain Restore 1.
- Ensure the Heroism unit is played only from the discard pile of Home One's controller, never the teammate's.

### General Krell — Heartless Tactician #105

> Each other friendly unit gains: “When Defeated: You may draw a card.”

**Always Two**
- Ensure the teammate's other units gain the When Defeated ability, and the teammate (the unit's controller) may draw when one is defeated, not Krell's controller.

### Attack Pattern Delta #106

> Give a friendly unit +3/+3 for this phase. / Give another friendly unit +2/+2 for this phase. / Give a third friendly unit +1/+1 for this phase.

**Always Two**
- Ensure the three different units can be any mix of your own and the teammate's units, including all three being the teammate's.

### Command #107

> Choose two, in any order: / Give 2 Experience tokens to a unit. / A friendly unit deals damage equal to its power to a non-unique enemy unit. / Put this event into play as a resource. / Return a unit from your discard pile to your hand.

**Always Two**
- Ensure the damage mode can use the teammate's unit as the source, and the target is a non-unique unit of either enemy, never the teammate's.
- Ensure the return mode only returns a unit from your own discard pile, not the teammate's.

### Colonel Yularen — ISB Director #109

> When you play a [Command] unit (including this one): Heal 1 damage from your base.

**Always Two**
- Ensure the trigger fires only when you play a Command unit, not when the teammate plays one.
- Ensure it heals your own base, not the teammate's.

### Frontline Shuttle #110

> Action [defeat this unit]: Attack with a unit, even if it's exhausted. It can't attack bases for this attack.

**Twin Suns**
- Ensure the unit chosen to attack is one you control and the attack targets a unit controlled by any one opponent you choose, never a base.

**Always Two**
- Ensure a teammate's unit cannot be chosen to attack.
- Ensure the attack can target a unit of either enemy, never the teammate's units or any base.
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Consortium StarViper #112

> While you have the initiative, this unit gains Restore 2. (When this unit attacks, heal 2 damage from your base.)

**Always Two**
- Ensure Restore 2 applies while the teammate has taken the initiative (the initiative is the team's).

### Escort Skiff #114

> While you control another [Command] unit, this unit gains Ambush. (After you play this unit, it may ready and attack an enemy unit.)

**Always Two**
- Ensure a teammate's Command unit does not give Ambush; only another Command unit you control counts.

### Steadfast Battalion #116

> Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) / On Attack: If you control a leader unit, give a friendly unit +2/+2 for this phase.

**Twin Suns**
- Ensure a deployed leader unit controlled by an opponent does not enable the +2/+2 (only your own leader unit does).

**Always Two**
- Ensure a deployed leader unit controlled only by the teammate does not enable the effect, but your own does.
- Ensure the +2/+2 can be given to the teammate's unit.

### 97th Legion — Keeping the Peace on Sullust #118

> This unit gets +1/+1 for each resource you control.

**Always Two**
- Ensure the bonus counts only your own resources, not the teammate's.

### Reinforcement Walker #119

> When Played/On Attack: Look at the top card of your deck. Either draw that card or discard it and heal 3 damage from your base.

**Always Two**
- Ensure the heal goes to your own base, not the teammate's.

### Traitorous #122

> When this upgrade becomes attached to a non‑leader unit that costs 3 or less: Take control of that unit. / When this upgrade becomes unattached from a unit: That unit's owner takes control of it.

**Always Two**
- Ensure Traitorous can take control of the teammate's non-leader unit costing 3 or less; it moves to the player who attached it and the owner (the teammate) regains it on detach.

### Strike True #127

> A friendly unit deals damage equal to its power to an enemy unit.

**Always Two**
- Ensure the enemy unit can be either enemy's unit, never the teammate's.
- Ensure the friendly unit can be the teammate's unit and deals damage equal to its own power.

### Admiral Ozzel — Overconfident #129

> Action [exhaust]: Play an Imperial unit from your hand (paying its cost). It enters play ready. Each opponent may ready a unit.

**Twin Suns**
- Ensure every opponent may ready one unit of their own, each choosing independently, before the played Imperial unit's When Played abilities resolve.
- Ensure eliminated players are not offered the choice.

**Always Two**
- Ensure both enemy players may ready a unit.
- Ensure the friendly teammate is not offered the choice (not an opponent) and the played Imperial unit comes from your own hand only.

### Seventh Sister — Implacable Inquisitor #133

> Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) / When this unit deals combat damage to an opponent's base: You may deal 3 damage to a ground unit that opponent controls.

**Twin Suns**
- Ensure the attacker picks which opponent's base to attack, and the trigger's "that opponent" is the owner of the damaged base.
- Ensure the 3 damage can only go to a ground unit controlled by that opponent, not another opponent's ground units.

**Always Two**
- Ensure the trigger fires when combat damage is dealt to an enemy base and the 3 damage can only go to a ground unit that enemy controls.
- Ensure a teammate's units cannot be chosen as the target, and a teammate's base cannot be attacked, so the trigger never fires for it.

### Ruthless Raider #134

> When Played/When Defeated: Deal 2 damage to an enemy base and 2 damage to an enemy unit.

**Twin Suns**
- Ensure the enemy base and the enemy unit are chosen independently, so they can belong to different opponents, and a which-base choice is offered between all opponents' bases.
- Ensure both When Played and When Defeated work this way.

**Always Two**
- Ensure the base can be either enemy's base and the unit can belong to either enemy, independent of each other, never the teammate's base or unit.
- Ensure both When Played and When Defeated work this way.

### Emperor Palpatine — Master of the Dark Side #135

> Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) / When Played: Deal 6 damage divided as you choose among enemy units.

**Twin Suns**
- Ensure the 6 damage can be divided among units of different opponents in one resolution.

**Always Two**
- Ensure the 6 damage can be divided among units of both enemy players in one resolution.
- Ensure the teammate's units cannot be assigned damage.

### Fallen Lightsaber #137

> Attach to a non-Vehicle unit. / If attached unit is a Force unit, it gains: "On Attack: Deal 1 damage to each ground unit the defending player controls."

**Twin Suns**
- Ensure the 1 damage hits only the ground units of the defending player, not of the other opponents.

**Always Two**
- Ensure the 1 damage hits only the ground units of the defending enemy, not the other enemy's or the teammate's.

### Force Lightning #138

> Choose a unit. It loses all abilities for this phase. Then, if you control a FORCE unit, pay any number of resources and deal 2 damage to the chosen unit for each resource paid this way.

**Always Two**
- Ensure a teammate's Force unit does not enable the damage and that resources are paid only from your own.

### Force Choke #139

> If you control a FORCE unit, this event costs [1 resource] less to play. / Deal 5 damage to a non-VEHICLE unit. That unit's controller draws a card.

**Twin Suns**
- Ensure the controller of the chosen unit draws a card, whichever opponent that is.

**Always Two**
- Ensure the teammate draws when their non-Vehicle unit is chosen.
- Ensure a teammate's Force unit does not give the cost reduction.

### SpecForce Soldier #140

> When Played: A unit loses Sentinel for this phase.

**Always Two**
- Ensure a teammate's unit can be chosen.
- Ensure the Sentinel loss does not remove protection from other friendly units' Sentinels.

### Sabine Wren — Explosives Artist #142

> While there are at least 3 aspects among other friendly units, this unit can't be attacked (unless she gains Sentinel). / On Attack: You may deal 1 damage to the defender or to a base.

**Twin Suns**
- Ensure only the controller's own other units count toward the 3 aspects, and while met no opponent can attack Sabine.
- Ensure Sabine's On Attack damage can target the defending unit or any base (any opponent's, or the controller's own).

**Always Two**
- Ensure the teammate's units count toward the 3 aspects, and while met neither enemy can attack Sabine.
- Ensure Sabine's On Attack damage can target the defending unit or any base, including the teammate's base.

### Fighters for Freedom #143

> Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) / When you play another [Aggression] card: You may deal 1 damage to a base.

**Twin Suns**
- Ensure the trigger fires only when you play another Aggression card, and the damage can go to any player's base including your own.

**Always Two**
- Ensure the teammate playing an Aggression card does not trigger it.
- Ensure the damage can target either enemy base, the teammate's base or your own.

### Red Three — Unstoppable #144

> Raid 1 (This unit gets +1/+0 while attacking.) / Each other friendly [Heroism] unit gains Raid 1.

**Always Two**
- Ensure the teammate's other Heroism units also gain Raid 1.

### K-2SO — Cassian's Counterpart #145

> Overwhelm / When Defeated: For each opponent, choose one: either deal 3 damage to that player's base, or that player discards a card from their hand.

**Twin Suns**
- Ensure that on defeat, the choice (3 damage to that player's base or discard a card) is made separately for each opponent, and each opponent's own base or hand is affected.
- Ensure that when Overwhelm triggers on an attack in a 3-4 player game, the excess damage goes to the base of the defending player (the controller of the attacked unit).

**Always Two**
- Ensure the When Defeated choice is made separately for each of the two enemy players, and the teammate is not affected.
- Ensure Overwhelm excess damage goes to the base of whichever enemy controls the attacked unit.

### Guerilla Attack Pod #148

> Grit (This unit gets +1/+0 for each damage on it.) / When Played: If a base has 15 or more damage on it, ready this unit.

**Twin Suns**
- Ensure it readies if any player's base, including yours, has 15 or more damage.

**Always Two**
- Ensure it readies if any base, including the teammate's, has 15 or more damage, even when damage exceeds the base's health.

### Karabast #151

> A friendly unit deals damage to an enemy unit equal to the amount of damage on the friendly unit plus 1.

**Twin Suns**
- Ensure the enemy unit can be chosen from any opponent's units, while the friendly unit can only be one you control.

**Always Two**
- Ensure the enemy unit can be either enemy's unit, never the teammate's.
- Ensure the friendly unit can be the teammate's unit and the damage is based on the damage on that unit.

### For a Cause I Believe In #152

> Reveal the top 4 cards of your deck. For each [Heroism] card revealed this way, deal 1 damage to an enemy base. You may discard any of the revealed cards and put the rest back on top of your deck in any order.

**Twin Suns**
- Ensure the total damage equals the number of Heroism cards revealed (up to 4), split among enemy bases as the player chooses (for example 4 to one base, or 2 and 2).

**Always Two**
- Ensure the total damage equals the number of Heroism cards revealed (up to 4), split between the two enemies' bases as the player chooses (4 to one, or 2 and 2), never to the teammate's base.

### Saw Gerrera — Extremist #153

> As an additional cost for each opponent to play an event, they must deal 2 damage to their base.

**Twin Suns**
- Ensure every opponent must deal 2 damage to their own base as an additional cost to play an event, not just one.
- Ensure that if paying the cost brings an opponent's base to its health, that opponent is eliminated and the event's ability does not resolve.
- Ensure that in that case Saw Gerrera's controller heals 5 damage from their own base, after the elimination is resolved, even though the event's player paid the cost.

**Always Two**
- Ensure both enemy players must pay the 2 damage to their own base to play an event; the friendly teammate does not.
- Ensure an enemy whose base is already at or past its health can still pay the 2 damage, is not eliminated, and the event still resolves.

### Rallying Cry #154

> Each friendly unit gains Raid 2 this phase. (They get +2/+0 while attacking.)

**Always Two**
- Ensure the teammate's units also gain Raid 2 this phase.

### Benthic "Two Tubes" — Partisan Lieutenant #156

> On Attack: Another friendly [Aggression] unit gains Raid 2 for this phase. (It gets +2/+0 while attacking.)

**Always Two**
- Ensure the teammate's Aggression unit can be chosen to gain Raid 2, and it applies when the teammate attacks with it.

### Jedha Agitator #158

> Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) / On Attack: If you control a leader unit, deal 2 damage to a ground unit or a base.

**Twin Suns**
- Ensure the trigger requires a leader unit you control, and the damage can target a ground unit or base of any player.

**Always Two**
- Ensure a teammate's leader unit does not satisfy the condition.
- Ensure the damage can target a ground unit or base of either enemy, the teammate or your own.

### Partisan Insurgent #159

> While you control another [Aggression] unit, this unit gains Raid 2. (It gets +2/+0 while attacking.)

**Always Two**
- Ensure a teammate's Aggression unit does not give Raid 2; only another Aggression unit you control counts.

### Wolffe — Suspicious Veteran #160

> Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) / When Played/On Attack: Bases can't be healed for this phase.

**Twin Suns**
- Ensure no base of any player can be healed this phase, including by Restore.

**Always Two**
- Ensure no base can be healed this phase, including the teammate's and your own, including by Restore.

### Ardent Sympathizer #161

> While you have the initiative, this unit gets +2/+0.

**Always Two**
- Ensure +2/+0 applies while the teammate has taken the initiative (the initiative is the team's).

### Star Wing Scout #163

> When Defeated: If you have the initiative, draw 2 cards.

**Always Two**
- Ensure it draws 2 for the controller when the teammate holds the initiative (the initiative is the team's).

### Force Throw #167

> Choose a player. That player discards a card from their hand. Then, if you control a FORCE unit, you may deal damage to a unit equal to the cost of the discarded card.

**Twin Suns**
- Ensure the chosen player can be yourself or any one of the opponents, and that player discards from their own hand.

**Always Two**
- Ensure the chosen player can be you, the teammate or either enemy, and that player discards from their own hand.
- Ensure only your own Force unit enables the damage option, not the teammate's.

### Mission Briefing #171

> Choose a player. They draw 2 cards.

**Twin Suns**
- Ensure the chosen player can be yourself or any one of the opponents.

**Always Two**
- Ensure the chosen player can be you, the teammate or either enemy.

### Forced Surrender #175

> Draw 2 cards. Each opponent whose base you've damaged this phase discards 2 cards from their hand.

**Twin Suns**
- Ensure only opponents whose base you damaged this phase discard 2 cards; opponents you did not damage are unaffected.
- Ensure the draw 2 happens regardless of whether any opponent qualifies.

**Always Two**
- Ensure only enemy players whose base you damaged this phase discard 2 cards.
- Ensure damage dealt to the friendly teammate's base, or damage dealt by the teammate, does not count and the teammate never discards.

### Cartel Spacer #178

> When Played: If you control another [Cunning] unit, exhaust an enemy unit that costs 4 or less.

**Twin Suns**
- Ensure the exhaust target can be a unit of any opponent that costs 4 or less.
- Ensure the condition is not met by an opponent's Cunning unit (only another Cunning unit you control counts).

**Always Two**
- Ensure the exhaust target can be either enemy's unit, never the teammate's.
- Ensure the condition is not met by the teammate's Cunning unit.

### Jabba the Hutt — Cunning Daimyo #181

> Each TRICK event you play costs [1 resource] less. / When Played: Search the top 8 cards of your deck for a TRICK event, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)

**Always Two**
- Ensure the discount does not apply to TRICK events the teammate plays.

### Bounty Hunter Crew #183

> Ambush (After you play this unit, it may ready and attack an enemy unit.) / When Played: You may return an event from a discard pile to its owner's hand.

**Always Two**
- Ensure the event can be chosen from the teammate's discard pile, and a teammate's event returns to the teammate's hand.

### Fett's Firespray — Pursuing the Bounty #184

> When Played: If you control Boba Fett or Jango Fett (as a leader or unit), ready this unit. / Action [2 resources]: Exhaust a non-unique unit.

**Twin Suns**
- Ensure the ready triggers if either of the controller's two leaders (leader side or deployed) is Boba Fett or Jango Fett.

**Always Two**
- Ensure the ready does not trigger for a teammate's Boba Fett or Jango Fett; only your own cards count.

### Chimaera — Flagship of the Seventh Fleet #185

> Shielded (When you play this unit, give a Shield token to it.) / On Attack: Name a card. An opponent reveals their hand and discards a card with that name from it.

**Twin Suns**
- Ensure the controller chooses which opponent is "an opponent"; only that opponent reveals their hand and discards a card with the named name.
- Ensure the other opponents' hands are not revealed.

**Always Two**
- Ensure the controller chooses one of the two enemies; only that enemy reveals their hand and discards.
- Ensure the teammate's hand is not revealed or discarded from.

### I Had No Choice #187

> Choose up to 2 non-leader units. An opponent chooses 1 of those units. Return that unit to its owner's hand and put the other on the bottom of its owner's deck.

**Twin Suns**
- Ensure the controller chooses which opponent is "an opponent", and that opponent (not the controller) chooses which of the units is returned to hand.
- Ensure the chosen opponent makes the choice even when the selected units belong to different players.

**Always Two**
- Ensure the chooser is one of the two enemies picked by the controller, never the teammate.

### Chopper — Metal Menace #188

> While you control another SPECTRE unit, this unit gains Raid 1. / On Attack: Discard a card from the defending player's deck. If it's an event, exhaust a resource that player controls.

**Twin Suns**
- Ensure only the defending player's deck and resources are affected, not those of other opponents.

**Always Two**
- Ensure Raid 1 is not gained from a teammate's SPECTRE unit; only SPECTRE units you control count.
- Ensure only the defending enemy's deck and resources are affected, not the other enemy's or the teammate's.

### Leia Organa — Defiant Princess #189

> When Played: Either ready a resource or exhaust a unit.

**Twin Suns**
- Ensure the readied resource can belong to any player, including an opponent (no qualifier on the card).

**Always Two**
- Ensure the readied resource can be your own, your teammate's, or an enemy's.

### Lothal Insurgent #190

> When Played: If you played another card this phase, each opponent draws a card then discards a random card from their hand.

**Twin Suns**
- Ensure that if you played another card this phase, every opponent draws a card and then discards a random card from their hand.

**Always Two**
- Ensure both enemy players draw then discard a random card when you played another card this phase.
- Ensure a card played only by the teammate this phase does not satisfy the condition, and the teammate is not affected.

### Millennium Falcon — Piece of Junk #193

> This unit enters play ready. / When you ready cards during the regroup phase: Either pay [1 resource] or return this unit to her owner's hand.

**Always Two**
- Ensure the trigger happens only when you ready your cards, not when the teammate readies theirs.

### Lando Calrissian — Responsible Businessman #197

> Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) / When Played: Return up to 2 friendly resources to their owners' hands.

**Always Two**
- Ensure the teammate's resources can be chosen and return to the teammate's hand.
- Ensure the up to 2 resources can be split between your own and the teammate's.

### Spark of Rebellion #200

> Look at an opponent's hand and discard a card from it.

**Twin Suns**
- Ensure the player chooses which single opponent's hand is looked at and discards a card from it; other opponents' hands are unaffected.

**Always Two**
- Ensure the player chooses one of the two enemies' hands to look at and discard from, never the teammate's.

### Bodhi Rook — Imperial Defector #201

> When Played: Look at an opponent's hand and discard a non-unit card from it.

**Twin Suns**
- Ensure the controller chooses which single opponent's hand is looked at and discards a non-unit card from it; other opponents' hands are unaffected.

**Always Two**
- Ensure the controller chooses one of the two enemies' hands, never the teammate's.

### Cunning #203

> Choose two, in any order: / Return a non-leader unit with 4 or less power to its owner's hand. / Give a unit +4/+0 for this phase. / Exhaust up to 2 units. / An opponent discards a random card from their hand.

**Twin Suns**
- Ensure that if the discard mode is chosen, the player picks which single opponent discards a random card from their hand; other opponents are unaffected.

**Always Two**
- Ensure the discard mode can only be aimed at one of the two enemies, never the teammate.

### Outer Rim Headhunter #208

> Raid 1 (This unit gets +1/+0 while attacking.) / On Attack: If you control a leader unit, you may exhaust a non-leader unit.

**Always Two**
- Ensure the condition is not met by a teammate's leader unit; only your own leader unit counts.

### Pirated Starfighter #209

> Raid 1 (This unit gets +1/+0 while attacking.) / When Played: Return a friendly non-leader unit to its owner's hand.

**Always Two**
- Ensure the teammate's non-leader unit can be chosen and returns to the teammate's hand.
- Ensure Pirated Starfighter need not choose itself when the teammate has a non-leader unit.

### Gamorrean Guards #211

> While you control another [Cunning] unit, this unit gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)

**Always Two**
- Ensure Sentinel is not gained from a teammate's Cunning unit; only another Cunning unit you control counts.

### Smuggling Compartment #214

> Attach to a VEHICLE unit. / Attached unit gains: "On Attack: Ready a resource."

**Twin Suns**
- Ensure the readied resource can belong to any player, including an opponent (no qualifier on the card).

**Always Two**
- Ensure the readied resource can be your own, your teammate's, or an enemy's.

### Disarm #216

> Give an enemy unit –4/–0 for this phase.

**Always Two**
- Ensure the target can be either enemy's unit, never the teammate's.

### Asteroid Sanctuary #218

> Exhaust an enemy unit. / Give a Shield token to a friendly unit that costs 3 or less.

**Twin Suns**
- Ensure the exhaust target can be any opponent's unit, while the Shield goes only to a unit you control that costs 3 or less.

**Always Two**
- Ensure the exhaust target can be either enemy's unit, never the teammate's.
- Ensure the Shield can be given to the teammate's unit that costs 3 or less.

### Change of Heart #224

> Take control of a non-leader unit. At the start of the regroup phase, its owner takes control of it.

**Twin Suns**
- Ensure that if the player who took control of a unit with Change of Heart is eliminated, the unit goes to its owner's discard pile without being defeated and is not returned to play at the start of regroup.

**Always Two**
- Ensure it can take control of the teammate's non-leader unit: it moves to the player who played the event, and at the start of the regroup phase the owner (the teammate) takes control of it again.
- Ensure that while you control a unit taken from the teammate, you can attack with it this phase and its owner (the teammate) cannot.

### General Veers — Blizzard Force Commander #230

> Other friendly Imperial units get +1/+1.

**Always Two**
- Ensure the teammate's other Imperial units also get +1/+1.

### TIE Advanced #231

> When Played: Give 2 Experience tokens to another friendly IMPERIAL unit.

**Always Two**
- Ensure the teammate's Imperial unit can receive the 2 Experience tokens.
- Ensure an enemy's Imperial unit cannot.

### Maximum Firepower #234

> A friendly Imperial unit deals damage equal to its power to a unit. / Then, another friendly Imperial unit deals damage equal to its power to the same unit.

**Always Two**
- Ensure the two damage-dealing Imperial units can be your own or the teammate's, in any mix, as two different units.

### Galactic Ambition #235

> Play a non-[Heroism] unit from your hand for free. Deal damage to your base equal to its cost.

**Twin Suns**
- Ensure that if the damage brings your base to 0 HP, you are eliminated.

**Always Two**
- Ensure the unit is played only from your own hand, not the teammate's.
- Ensure the damage goes to your own base and can reach or exceed its health without eliminating you.

### Wing Leader #241

> When Played: Give 2 Experience tokens to another friendly REBEL unit.

**Always Two**
- Ensure the teammate's Rebel unit can be chosen and receives both Experience tokens.
- Ensure an enemy's Rebel unit cannot.

### General Dodonna — Massassi Group Commander #242

> Other friendly Rebel units get +1/+1.

**Always Two**
- Ensure the teammate's other Rebel units also get +1/+1.

### Snowspeeder #244

> Ambush (After you play this unit, it may ready and attack an enemy unit.) / On Attack: Exhaust an enemy Vehicle ground unit.

**Twin Suns**
- Ensure the On Attack exhaust can choose an enemy Vehicle ground unit of any opponent, not only the defender's controller.

**Always Two**
- Ensure the On Attack exhaust can choose an enemy Vehicle ground unit of either enemy, not only the defender's controller, never the teammate's.

### Frontier AT-RT #249

> While you control another VEHICLE unit, this unit gains Ambush. (After you play this unit, it may ready and attack an enemy unit.)

**Always Two**
- Ensure a teammate's Vehicle unit does not give Ambush; only another Vehicle unit you control counts.
