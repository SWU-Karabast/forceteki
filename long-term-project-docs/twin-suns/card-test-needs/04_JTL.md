# JTL: multiplayer test needs

111 of the 189 reviewed JTL cards need Twin Suns or Always Two tests beyond the engine-level ones (see ../engine-test-notes.md). Cards not listed need none.

### Asajj Ventress — I Work Alone #001

> Action [Exhaust]: Deal 1 damage to a friendly unit. If you do, deal 1 damage to an enemy unit in the same arena. // Grit / Attached unit is a leader unit. It gains Grit and: “On Attack: You may deal 1 damage to a friendly unit. If you do, deal 1 damage to an enemy unit in the same arena.”

**Always Two**
- Ensure the leader-side action can damage the teammate's unit as the friendly unit, and the enemy unit damaged afterwards must be in the same arena as that teammate's unit.
- Ensure the enemy unit chosen by the leader-side action is only an enemy's unit, never the teammate's, even when the teammate's unit is in the same arena.
- Ensure that with Asajj attached as a Pilot to the teammate's Vehicle, when that Vehicle attacks, the Vehicle's controller (the teammate) makes the choices and the friendly unit can be that controller's own unit or their teammate's (Asajj's controller's) unit.
- Ensure that with Asajj attached to your own Vehicle, the friendly unit for the granted On Attack ability can be the teammate's unit, and the enemy unit is only an enemy's, in the same arena.

### Grand Admiral Thrawn — ...How Unfortunate #002

> When you use a “When Defeated” ability: You may exhaust this leader. If you do, use that ability again. // When you use a “When Defeated” ability: You may use that ability again. Use this ability only once each round.

**Always Two**
- Ensure a "When Defeated" ability the teammate uses for their own unit does not trigger it (only abilities you use do).

### Lando Calrissian — Buying Time #003

> Action [1 resource, Exhaust]: Play a unit from your hand (paying its cost). If you do and you control a ground unit and a space unit, give a Shield token to a unit. // Sentinel / Attached unit is a leader unit. / Attached unit gains Sentinel. / When deployed as an upgrade: You may give a Shield token to a unit in a different arena.

**Always Two**
- Ensure the ground and space unit condition counts only units you control, not the teammate's.

### Admiral Piett — Commanding the Armada #005

> Action [Exhaust]: Play a Capital Ship unit from your hand. It costs 1 resource less. // Each Capital Ship unit you play costs 2 resources less.

**Always Two**
- Ensure the deployed discount applies only to Capital Ship units you play, not to those the teammate plays.

### Darth Vader — Victor Squadron Leader #006

> Action [Exhaust]: If you attacked with a non-token Vehicle unit this phase, create a TIE Fighter token. // / Attached unit is a leader unit. / When deployed as an upgrade: Create 2 TIE Fighter tokens.

**Always Two**
- Ensure only a non-token Vehicle unit you attacked with counts; an attack by the teammate's Vehicle does not enable the token.

### Wedge Antilles — Leader of Red Squadron #008

> Action [Exhaust]: Play a card from your hand using Piloting. It costs 1 resource less. // / Attached unit is a leader unit. It gains: “On Attack: The next Pilot card you play this phase costs 1 resource less. (This includes Piloting costs.)”

**Always Two**
- Ensure only Pilot cards you play are discounted and use up the "next Pilot card" discount; the teammate's Pilot plays do not.

### Boba Fett — Any Methods Necessary #009

> When you deal non-combat damage: You may exhaust this leader. If you do, deal 1 indirect damage to a player. (That player assigns 1 unpreventable damage among their base and units.) // / Attached unit is a leader unit. / When deployed as an upgrade: Deal up to 4 damage divided as you choose among any number of units.

**Twin Suns**
- Ensure only non-combat damage dealt by the leader's controller (or their cards) triggers it, not damage dealt by other players.

**Always Two**
- Ensure non-combat damage dealt by the teammate or the teammate's cards does not trigger it, while non-combat damage dealt by you or your cards does.

### Captain Phasma — Chrome Dome #010

> Action [Exhaust]: If you played a First Order card this phase, deal 1 damage to a base. // On Attack: If you played another First Order card this phase, you may deal 1 damage to a unit. If you do, deal 1 damage to a base.

**Always Two**
- Ensure only First Order cards you played this phase count (leader side and deployed); the teammate's plays do not enable it.

### Luke Skywalker — Hero of Yavin #012

> Action [Exhaust]: If you attacked with a Fighter unit this phase, deal 1 damage to a unit. // / This upgrade can’t be defeated by enemy card abilities. / Attached unit is a leader unit. If it’s a Fighter, it gains: “On Attack: You may deal 3 damage to a unit.”

**Always Two**
- Ensure only a Fighter you attacked with counts; a teammate's Fighter attack does not enable the leader action.
- Ensure the deployed upgrade can be defeated by the teammate's card abilities (the teammate is not an enemy) but not by an enemy's.

### Poe Dameron — I Can Fly Anything #013

> Action [1 resource, Exhaust]: Flip this leader and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it. // / Action [1 resource]: Attach this upgrade to a friendly Vehicle unit without a Pilot on it. Use this ability only once each round.

**Always Two**
- Ensure the choice can be the teammate's Vehicle without a Pilot as well as your own, including when Poe is deployed with Piloting.
- Ensure Poe stays under the control of the player who deployed him while he is attached to the teammate's Vehicle, and that player (not the Vehicle's controller) uses his deployed action.

### Admiral Trench — Chk-chk-chk-chk #014

> Action [Exhaust]: Discard a card that costs 3 or more from your hand. If you do, draw a card. // When Deployed: Reveal the top 4 cards of your deck. An opponent discards 2 of them. Draw 1 of the remaining cards and discard the other.

**Twin Suns**
- Ensure the controlling player chooses which opponent is "an opponent" and the choice persists through the ability; only that opponent discards 2 of the revealed cards.

**Always Two**
- Ensure the choice is either enemy, never the teammate; only that enemy discards 2 of the revealed cards.

### Rio Durant — Wisecracking Wheelman #015

> Action [1 resource, Exhaust]: Attack with a space unit. It gets +1/+0 and gains Saboteur for this attack. (Ignore Sentinel and defeat the defender's Shields.) // Saboteur (When this unit attacks, ignore Sentinel and defeat the defender’s Shields.) / Attached unit is a leader unit. It gains Saboteur. If it’s a Transport, it also gets +1/+0.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Admiral Ackbar — It's A Trap! #016

> Action [1 resource, Exhaust]: Exhaust a non-leader unit. If you do, its controller creates an X-Wing token. // On Attack: You may exhaust a unit. If you do, its controller creates an X-Wing token.

**Twin Suns**
- Ensure the X-Wing token is created by the exhausted unit's own controller, whichever opponent that is (leader side and deployed).

**Always Two**
- Ensure a teammate's exhausted unit makes the teammate create the X-Wing token, and an enemy's unit makes that enemy create it.

### Han Solo — Never Tell Me the Odds #017

> Action [Exhaust]: Reveal the top card of your deck, then attack with a unit. If the revealed card and that unit have different odd costs, that unit gets +1/+0 for this attack. // / Attached unit is a leader unit. / When deployed as an upgrade: For each friendly unit or upgrade that has an odd cost, ready a resource.

**Twin Suns**
- Ensure that when Han is deployed as an upgrade, the readied resources are counted per friendly odd-cost unit or upgrade (the deployer's only) and each resource readied can be chosen from any player's resources (yours or any opponent's).

**Always Two**
- Ensure the leader's attack can only be initiated with a unit you control, never with the teammate's unit.
- Ensure that when Han is deployed as an upgrade, the count includes the teammate's odd-cost units and upgrades as well as your own.
- Ensure each resource readied by the deploy trigger can be chosen from any player's resources: yours, the teammate's, or either enemy's.
- Ensure that when Han is deployed as an upgrade on the teammate's Vehicle, you control the upgrade, and the deploy trigger counts your friendly cards including your teammate's.

### Kazuda Xiono — Best Pilot in the Galaxy #018

> Action [Exhaust]: A friendly unit loses all abilities for this round. Take an extra action after this one. // On Attack: Choose any number of friendly units. They lose all abilities for this round. / Attached unit is a leader unit. It gains: “On Attack: Choose any number of friendly units. They lose all abilities for this round.”

**Twin Suns**
- Ensure the extra action from the leader side is taken by the controller immediately after the leader action, before the next player acts.

**Always Two**
- Ensure the leader-side Action can choose the teammate's unit as well as your own, and that unit loses all abilities for the round.
- Ensure the extra action after the leader-side Action is taken only by Kazuda's controller, never by the teammate.
- Ensure the On Attack (deployed or Pilot-granted) can choose any subset of friendly units, including none, only the teammate's units, or a mix of both players' units, and every chosen unit loses all abilities for the round.
- Ensure that when Kazuda is attached as a Pilot to a teammate's Vehicle, the Vehicle's controller (not the Pilot's controller) makes the On Attack choice.

### Colossus #021

> Draw 1 less card in your starting hand.

**Always Two**
- Ensure this only affects its controller’s hand.

### Data Vault #024

> Your minimum deck size is increased by 10 cards.

**Always Two**
- Ensure that the deck minimum only applies to its controller.

### Thermal Oscillator #025

> Your minimum deck size is decreased by 5 cards.

**Always Two**
- Ensure that the deck minimum only applies to its controller.

### Nabat Village #028

> Draw 3 more cards in your starting hand. You can't take a mulligan. / When the first action phase starts: Put 3 cards from your hand on the bottom of your deck in any order.

**Always Two**
- Ensure that the opening hand changes only apply to its controller.

### Director Krennic — On the Verge of Greatness #032

> Shielded (When you play this unit, give a Shield token to it.) / The first unit you play each round that has a “When Defeated” ability costs 1 resource less.

**Always Two**
- Ensure only units you play count as "the first unit you play each round"; the teammate's plays neither use up nor receive the discount.

### Corvus — Inferno Squadron Raider #038

> Restore 2 / When Played: You may attach a friendly Pilot unit or upgrade to this unit. (Defeat all upgrades on that Pilot and remove all damage from it.)

**Always Two**
- Ensure the choice can be the teammate's Pilot unit or Pilot upgrade as well as your own.
- Ensure a teammate's Pilot attached to your Corvus stays controlled by the teammate (Corvus keeps its controller).
- Ensure that for the teammate's Pilot attached to your Corvus, text granted to Corvus uses Corvus's controller, while the Pilot's own text that is not granted to Corvus (for example 'this upgrade can't be defeated by enemy card abilities') still uses the teammate as its controller.
- Ensure a teammate's Pilot unit attached this way has all its upgrades defeated and its damage removed, and it ends up as an upgrade on Corvus still controlled by the teammate.

### Chimaera — Reinforcing the Center #039

> When Played: You may use a “When Defeated” ability on another friendly unit. / When Defeated: Create 2 TIE Fighter tokens.

**Always Two**
- Ensure the choice can be the teammate's unit with a When Defeated ability as well as your own.
- Ensure when Chimaera's controller uses a teammate's unit's When Defeated ability, "you" is Chimaera's controller (a teammate's Night Sister Warrior that says "draw a card" makes Chimaera's controller draw).

### Annihilator — Tagge's Flagship #041

> When Played/When Defeated: You may defeat an enemy unit. If you do, search its controller's deck and hand for each card with that unit's name and discard them. (They shuffle their deck.)

**Twin Suns**
- Ensure the enemy unit can be chosen from any opponent's units, from both When Played and When Defeated.
- Ensure only the defeated unit's controller's deck and hand are searched and shuffled, not the other opponents'.

**Always Two**
- Ensure only an enemy's unit can be chosen, never the teammate's.
- Ensure only the defeated unit's controller's deck and hand are searched; the other enemy's and the teammate's are not.

### No Glory, Only Results #043

> Take control of a non-leader unit, then defeat it.

**Always Two**
- Ensure that if the teammate's unit is chosen, you take control of it before it is defeated (so its When Defeated is yours) and it goes to its owner's discard pile.

### Admiral Yularen — Fleet Coordinator #047

> When Played: Choose Grit, Restore 1, Sentinel, or Shielded. While this unit is in play, each Vehicle unit you control or play gains the chosen keyword.

**Always Two**
- Ensure the teammate's Vehicle units gain the chosen keyword.

### L3-37 — Get Out Of My Seat #049

> If this unit would be defeated, you may instead attach her as an upgrade to a friendly Vehicle unit without a Pilot on it. (She's no longer a unit. Defeat all upgrades on her and remove all damage from her.)

**Always Two**
- Ensure a teammate's Vehicle without a Pilot is a legal choice for the replacement.

### Phantom II — Modified to Dock #050

> Grit / Action [1 resource]: If this card is a unit, attach it as an upgrade to The Ghost. (It's no longer a unit. Defeat all upgrades on it and remove all damage from it.) / Attached unit gets +3/+3 and gains Grit.

**Always Two**
- Ensure Phantom II can be attached to the teammate's The Ghost and remains controlled by the player who used the ability.

### The Ghost — Heart of the Family #053

> Each other friendly Spectre unit gains this unit's keywords. / While this unit is upgraded, it gains Sentinel.

**Always Two**
- Ensure the teammate's Spectre units gain this unit's keywords too, including Sentinel while it is upgraded.

### You're All Clear, Kid #055

> Defeat an enemy space unit with 3 or less remaining HP. If you do and an opponent controls no space units, you may give an Experience token to a unit.

**Twin Suns**
- Ensure the defeated unit can be any opponent's space unit.
- Ensure the controller chooses which opponent the "controls no space units" condition is checked against, and may choose one who controls space units (no Experience token then).

**Always Two**
- Ensure only an enemy's space unit can be chosen, never the teammate's.
- Ensure the controller chooses either enemy for the "controls no space units" condition, and may choose one who controls space units. The teammate's space units are not counted.

### U-Wing Lander #070

> When Played: Give 3 Experience tokens to this unit. / When this unit completes an attack (and survives): You may attach an upgrade on this unit to another eligible friendly Vehicle unit.

**Always Two**
- Ensure the choice of another eligible friendly Vehicle can be the teammate's Vehicle as well as your own.

### In the Heat of Battle #077

> Each unit gains Sentinel and loses Saboteur for this phase.

**Twin Suns**
- Ensure every unit in play, including every opponent's units, gains Sentinel and loses Saboteur for the phase.
- Ensure units that enter play after the event do not gain it.

**Always Two**
- Ensure every unit in play, including the teammate's and both enemies' units, gains Sentinel and loses Saboteur for the phase.
- Ensure units that enter play after the event do not gain it.

### First Order TIE Fighter #081

> While you control a token unit, this unit gains Raid 1. (It gets +1/+0 while attacking.)

**Twin Suns**
- Ensure only a token unit you control enables Raid 1; an opponent's token unit does not.

**Always Two**
- Ensure only a token unit you control enables Raid 1; the teammate's token unit does not.

### Pantoran Starship Thief #083

> When Played: You may pay 3 resources. If you do, attach this unit as an upgrade to a Fighter or Transport unit without a Pilot on it. Take control of that unit.

**Always Two**
- Ensure the teammate's Fighter or Transport unit without a Pilot can be chosen as well as either enemy's.
- Ensure attaching to the teammate's unit moves control of that unit to the Thief's controller, while the teammate still owns it.
- Ensure the Thief upgrade is controlled by the player who played it, not by the former controller of the unit.

### Victor Leader — Leading from the Front #085

> Each other friendly space unit gets +1/+1.

**Always Two**
- Ensure the teammate's space units get +1/+1 too.

### Scramble Fighters #092

> Create 8 TIE Fighter tokens and ready them. They can't attack bases for this phase.

**Twin Suns**
- Ensure the TIE Fighters cannot attack the base of any opponent this phase.

**Always Two**
- Ensure the TIE Fighters cannot attack either enemy base this phase.

### Nien Nunb — Loyal Co-Pilot #093

> This unit gets +1/+0 for each other friendly Pilot unit and upgrade.

**Always Two**
- Ensure the teammate's Pilot units and Pilot upgrades also count for the bonus.

### Leia Organa — Pilots, To Your Stations #097

> Restore 1 (When this unit attacks, heal 1 damage from your base.) / When Played: You may attack with a Pilot unit or a unit with a Pilot on it. It gets +1/+0 and gains Restore 1 for this attack.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Snap Wexley — Resistance Recon Flier #098

> When played as a unit/On Attack: The next Resistance card you play this phase costs 1 resource less.

**Always Two**
- Ensure only the next Resistance card you play gets and uses up the discount; a Resistance card the teammate plays does not.

### Poe Dameron — One Hell of a Pilot #100

> When played as a unit: Create an X-Wing token. You may attach this unit as an upgrade to a friendly Vehicle unit without a Pilot on it.

**Always Two**
- Ensure the X-Wing token is created under your control, not your teammate's.
- Ensure a teammate's Vehicle without a Pilot can be chosen for the attach.

### Red Leader — Form Up #101

> This unit costs 1 resource less to play for each friendly Pilot unit and upgrade. / When a Pilot upgrade attaches to this unit: Create an X-Wing token.

**Always Two**
- Ensure the cost reduction counts the teammate's Pilot units and the teammate's Pilot upgrades as well as your own.
- Ensure that when the teammate attaches their Pilot upgrade to your Red Leader, the X-Wing token is created for you (Red Leader's controller), not for the teammate.

### Resistance Blue Squadron #102

> When Played: You may deal damage to a unit equal to the number of friendly space units.

**Always Two**
- Ensure the teammate's space units are counted for the damage as well as your own.

### Chewbacca — Faithful First Mate #103

> This unit can't be defeated or returned to hand by enemy card abilities.

**Twin Suns**
- Ensure Chewbacca is removed from the game when his owner is eliminated, even though enemy abilities cannot defeat him.

**Always Two**
- Ensure Chewbacca or the piloted ship can be returned to hand or defeated by teammate’s abilities.

### Raddus — Holdo's Final Command #104

> While you control another Resistance card (unit, upgrade, or leader), this unit gains Sentinel. / When Defeated: Deal damage equal to this unit's power to an enemy unit.

**Twin Suns**
- Ensure an opponent's Resistance card does not give Sentinel; only Resistance cards you control count.
- Ensure the When Defeated damage can target any opponent's unit.

**Always Two**
- Ensure a Resistance card controlled by the teammate does not give Sentinel; only your own Resistance cards count.
- Ensure the When Defeated damage can target either enemy's unit but never the teammate's.

### The Starhawk — Prototype Battleship #105

> Ambush / While paying costs, you pay half as many resources, rounded up.

**Always Two**
- Ensure the halving applies only to costs you pay; the teammate pays full costs.

### Unity of Purpose #106

> For each friendly unit with a different name, give each unit you control +1/+1 for this phase.

**Always Two**
- Ensure the teammate's units with different names are counted.
- Ensure only units you control receive the +1/+1; the teammate's units do not.

### Bunker Defender #107

> While you control a Vehicle unit, this unit gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)

**Twin Suns**
- Ensure only a Vehicle unit you control grants Sentinel; an opponent's Vehicle does not.

**Always Two**
- Ensure only a Vehicle unit you control grants Sentinel; the teammate's Vehicle does not.

### Seasoned Fleet Admiral #111

> Raid 1 / When an opponent draws 1 or more cards during the action phase: You may give an Experience token to a unit.

**Twin Suns**
- Ensure it triggers when any one opponent draws 1 or more cards during the action phase, including an opponent who is not the active player.

**Always Two**
- Ensure it triggers when either enemy draws 1 or more cards during the action phase.
- Ensure it does not trigger when the teammate draws.

### Clone Combat Squadron #115

> This unit gets +1/+1 for each other friendly space unit.

**Always Two**
- Ensure the teammate's space units add to the bonus.

### Dornean Gunship #116

> When Played: Deal indirect damage to a player equal to the number of Vehicle units you control. (That player assigns that much unpreventable damage among their base and units.)

**Always Two**
- Ensure only Vehicle units you control are counted, never the teammate's.

### All Wings Report In #122

> Exhaust up to 2 friendly space units. For each unit exhausted this way, create an X-Wing token.

**Always Two**
- Ensure the choice can be the teammate's space units as well as your own.
- Open: for a teammate's unit exhausted this way, which player controls the X-Wing token created?

### Air Superiority #125

> If you control more space units than an opponent, deal 4 damage to a ground unit that opponent controls.

**Twin Suns**
- Ensure the controller chooses which opponent the comparison is made against and the 4 damage goes to a ground unit that opponent controls. If the chosen opponent has as many or more space units, nothing happens, even if another opponent has fewer.

**Always Two**
- Ensure only the space units you control count for you; the teammate's space units count for no one.
- Ensure the controller chooses either enemy, never the teammate, and the 4 damage goes to a ground unit that enemy controls. If the chosen enemy has as many or more space units, nothing happens.

### Lightspeed Assault #127

> Defeat a friendly space unit and deal damage equal to its power to an enemy space unit. If you do, deal indirect damage equal to the enemy unit's power to its controller.

**Twin Suns**
- Ensure the indirect damage goes only to the controller of the chosen enemy space unit and still happens if the damage defeated that unit.

**Always Two**
- Ensure the defeated friendly space unit can be the teammate's as well as your own.
- Ensure the indirect damage goes only to the controller of the chosen enemy space unit (not the other enemy, not the teammate) and still happens if the damage defeated that unit.

### Focus Fire #129

> Choose a unit. Each friendly Vehicle unit in the same arena deals damage equal to its power to that unit.

**Always Two**
- Ensure the teammate's Vehicle units in the same arena also deal damage.

### Timely Reinforcements #130

> Choose an opponent. For every 2 resources they control, create an X-Wing token and give it Sentinel for this phase. (Units in its arena can't attack your non-Sentinel units or your base.)

**Twin Suns**
- Ensure the controller chooses which opponent, and the choice persists through the ability.
- Ensure the number of X-Wing tokens is based only on the chosen opponent's resources.

**Always Two**
- Ensure the choice is either enemy, never the teammate.
- Ensure the number of X-Wing tokens is based only on the chosen enemy's resources; the teammate's are not counted.

### Turbolaser Salvo #131

> Choose an arena. A friendly space unit deals damage equal to its power to each enemy unit in that arena.

**Twin Suns**
- Ensure every opponent's units in the chosen arena take the damage.

**Always Two**
- Ensure the choice of the friendly space unit can be the teammate's as well as your own.
- Ensure both enemies' units in the chosen arena are damaged and the teammate's are not.

### Allegiant General Pryde — Ruthless and Loyal #133

> When indirect damage is dealt to a unit: You may defeat a non-unique upgrade on it. / On Attack: If you have the initiative, deal 2 indirect damage to a player.

**Twin Suns**
- Ensure that when indirect damage is dealt to any player's unit, Pryde's controller may defeat a non-unique upgrade on that unit, including an upgrade controlled by another player.

**Always Two**
- Ensure that if Pryde's team has the initiative, the On Attack deals its indirect damage whichever teammate claimed it, and that if the enemy team has the initiative it does not.
- Ensure that when indirect damage is assigned to the teammate's or an enemy's unit, Pryde's controller may defeat a non-unique upgrade on that unit, whoever controls the upgrade.

### General Hux — No Terms, No Surrender #134

> Each other friendly First Order unit gains Raid 1. (They get +1/+0 while attacking.) / Action [Exhaust]: If you played a First Order card this phase, draw a card.

**Always Two**
- Ensure the teammate's First Order units also gain Raid 1.
- Ensure a First Order card played by the teammate does not enable the draw; only your own plays count.

### Decimator of Dissidents #138

> If you dealt indirect damage this phase, this unit costs 1 resource less to play. / Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)

**Always Two**
- Ensure the discount applies only if you dealt indirect damage this phase; indirect damage the teammate dealt does not count.

### IG-88 — Murderous Phlutdroid #141

> While an enemy unit is damaged, this unit gets +3/+0.

**Twin Suns**
- Ensure IG-88 gets +3/+0 when a unit controlled by any one opponent is damaged, and loses it when no opponent's unit is damaged.

**Always Two**
- Ensure a damaged unit of either enemy gives +3/+0, and a damaged teammate's unit does not.
- Ensure the bonus is applied once even if units of both enemies are damaged.

### Devastator — Hunting the Rebellion #143

> You assign all indirect damage you deal to opponents. / When Played: Deal 4 indirect damage to each opponent.

**Twin Suns**
- Ensure the Devastator controller (not the receiving opponent) assigns all indirect damage they deal to opponents, including indirect damage from their other cards while Devastator is in play.
- Ensure indirect damage dealt by an opponent's card is assigned by the player receiving it, not by the Devastator controller.

**Always Two**
- Ensure the Devastator controller assigns all indirect damage they deal to enemies, including indirect damage from their other cards while Devastator is in play.
- Ensure indirect damage dealt by the teammate's card to an enemy is assigned by that enemy, and indirect damage dealt by an enemy's card is assigned by the receiving player, not by the Devastator controller.

### Massassi Tactical Officer #146

> Action [Exhaust]: Attack with a Fighter unit. It gets +2/+0 for this attack.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Black One — Straight At Them #147

> While this unit is upgraded, it gets +1/+0. / On Attack: If you control Poe Dameron (as a unit, upgrade, or leader), you may deal 1 damage to a unit.

**Twin Suns**
- Ensure Poe Dameron counts when he is either of your two leaders, as well as a unit or upgrade you control.

**Always Two**
- Ensure only a Poe Dameron you control counts; the teammate's Poe (unit, upgrade or leader) does not.

### Tactical Heavy Bomber #152

> On Attack: Deal indirect damage equal to this unit's power to the defending player. If a base is damaged this way, draw a card. (That player assigns that much unpreventable damage among their base and units.)

**Twin Suns**
- Ensure that if the attacked opponent assigns at least one point of the indirect damage to their base, the Bomber's controller draws a card (not the defending player), and that no card is drawn when all of it is assigned to units.

**Always Two**
- Ensure the defending player is only the enemy who controls the attacked unit or base (the other enemy and the teammate take none).
- Ensure that if the attacked enemy assigns at least one point of the indirect damage to their base, the Bomber's controller draws a card (not the defending enemy or the teammate), and that no card is drawn when all of it is assigned to units.

### Profundity — We Fight! #154

> Overwhelm / When Played/When Defeated: Choose a player. They discard a card from their hand. Then, if they have more cards in their hand than you, they discard a card from their hand.

**Twin Suns**
- Ensure the chosen player can be any non-eliminated opponent or yourself.
- Ensure the hand comparison is the chosen player's hand against yours only.

**Always Two**
- Ensure the chosen player can be either enemy, you or the teammate, and a chosen teammate discards from their own hand.
- Ensure the hand comparison is the chosen player's hand against yours only.

### They Hate That Ship #155

> An opponent creates 2 TIE Fighter tokens and readies them. Then, play a Vehicle unit from your hand. It costs 3 resources less.

**Twin Suns**
- Ensure the controller chooses which opponent, and the choice persists through the ability.
- Ensure only the chosen opponent creates and readies the 2 TIE Fighter tokens.

**Always Two**
- Ensure the choice is either enemy, never the teammate.
- Ensure only the chosen enemy receives the TIE Fighter tokens.

### Trench Run #156

> Attack with a Fighter unit. For this attack, it gets +4/+0 and gains: “On Attack: Discard 2 cards from the defending player's deck. Deal unpreventable damage equal to the difference in the discarded cards' costs to this unit.”

**Twin Suns**
- Ensure the 2 cards are discarded from the top of the deck of the opponent attacked, not another opponent's.

**Always Two**
- Ensure the 2 cards are discarded from the deck of the defending enemy, not the other enemy's or the teammate's.
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Crackshot V-Wing #158

> When Played: If you control no other Fighter units, deal 1 damage to this unit.

**Always Two**
- Ensure a teammate's Fighter does not prevent the damage; only another Fighter you control counts.

### Captain Tarkin — Full Forward Assault #161

> Each friendly Vehicle unit gets +1/+0 and gains Overwhelm. (When attacking an enemy unit, deal excess damage to the opponent's base.)

**Always Two**
- Ensure the teammate's Vehicle units also get +1/+0 and Overwhelm.

### AT-DP Occupier #163

> This unit costs 1 resource less to play for each damaged ground unit. / Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)

**Twin Suns**
- Ensure damaged ground units of every player (own and all opponents') are counted together for the discount.

**Always Two**
- Ensure damaged ground units of every player (own, teammate's and both enemies') are counted together for the discount.

### Hunting Aggressor #165

> Indirect damage you deal to opponents is increased by 1.

**Twin Suns**
- Ensure an effect of yours that deals indirect damage to several opponents at once (e.g. Devastator's 4 to each opponent) deals 1 more to each opponent who receives it.
- Ensure indirect damage dealt by an opponent's card is not increased, whoever receives it, including you.
- Ensure indirect damage you deal to yourself is not increased.

**Always Two**
- Ensure an effect of yours that deals indirect damage to both enemies at once deals 1 more to each enemy.
- Ensure indirect damage dealt by the teammate's cards is not increased, even when it is dealt to an enemy.
- Ensure indirect damage you deal to yourself or to the teammate is not increased.

### Shadow Caster — Just Business #169

> When a friendly unit is defeated: You may use all of its “When Defeated” abilities again.

**Always Two**
- Ensure it triggers when a teammate's unit is defeated.
- Ensure when Shadow Caster reuses a teammate's defeated unit's When Defeated abilities, "you" is Shadow Caster's controller.

### Targeting Computer #171

> Attached unit gains: “You assign all indirect damage dealt by this unit.”

**Twin Suns**
- Ensure that when the upgrade is attached to a unit an opponent controls, that unit's controller (not the player who played the upgrade) assigns all indirect damage the unit deals.

**Always Two**
- Ensure that when the upgrade is attached to the teammate's unit, the teammate who controls it assigns all indirect damage the unit deals, not the player who played the upgrade.
- Ensure that when the upgrade is attached to an enemy's unit, that enemy assigns all indirect damage the unit deals.

### Fight Fire With Fire #173

> Choose a friendly unit and an enemy unit in the same arena. If you do, deal 3 damage to each of them.

**Always Two**
- Ensure the choice can be the teammate's unit as well as your own.
- Ensure only an enemy's unit can be chosen, never the teammate's.

### Hotshot Maneuver #174

> Choose a friendly unit. For each of its “On Attack” abilities, deal 2 damage to a different enemy unit. Then, attack with the chosen unit.

**Always Two**
- Ensure the chosen unit can be the teammate's as well as your own.
- Ensure that if the chosen unit is the teammate's, the 2 damage instances (one per On Attack ability, each to a different enemy unit) still resolve but the attack does not happen, since you can never attack with the teammate's unit.
- Ensure the 2-damage targets can only be enemy units, never the teammate's, and can be split freely across both enemies.
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Stay on Target #177

> Attack with a Vehicle unit. For this attack, it gets +2/+0 and gains: “When this unit deals damage to a base: Draw a card.”

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Face Off #178

> If no player has taken the initiative this phase, you may ready an enemy unit. If you do, ready a friendly unit in the same arena.

**Twin Suns**
- Ensure the ability still works when only the blast or plan counter has been taken this phase, and does nothing once the initiative counter was taken.

**Always Two**
- Ensure only an enemy's unit can be chosen, never the teammate's.
- Ensure the choice of friendly unit can be the teammate's unit as well as your own.

### Planetary Bombardment #181

> Deal 8 indirect damage to a player. If you control a Capital Ship unit, deal 12 indirect damage instead.

**Twin Suns**
- Ensure the damage is 12 when the controller controls a Capital Ship unit, and stays 8 when only an opponent controls a Capital Ship unit.

**Always Two**
- Ensure the damage is 12 when the controller controls a Capital Ship unit, including when the teammate is the chosen player.
- Ensure the damage stays 8 when only the teammate or only an enemy controls a Capital Ship unit.

### Mist Hunter — The Findsman's Pursuit #186

> On Attack: If you played a Bounty Hunter or Pilot card this phase, you may draw a card.

**Always Two**
- Ensure a Bounty Hunter or Pilot card played by the teammate does not enable the draw.

### Moff Gideon — I Know Everything #188

> When this unit deals combat damage to an opponent's base: Each unit that opponent plays this phase costs 1 resource more.

**Twin Suns**
- Ensure that when Gideon deals combat damage to a base, only the opponent who controls that base has their played units cost 1 more this phase, and other opponents are unaffected.

**Always Two**
- Ensure only the enemy whose base was damaged has their played units cost 1 more this phase; the other enemy, you and your teammate are unaffected.

### Invincible — Naval Adversary #191

> If you control a unique Separatist card, this unit costs 1 resource less to play. / When you deploy a leader: You may return a non-leader unit that costs 3 or less to its owner's hand.

**Twin Suns**
- Ensure the 'when you deploy a leader' trigger fires when either of the controller's two leaders is deployed.

**Always Two**
- Ensure the cost reduction counts only a unique Separatist card you control, not the teammate's.
- Ensure the trigger fires only when you deploy your own leader, not when the teammate deploys one.

### In Debt to Crimson Dawn #192

> When attached unit readies: Exhaust it unless its controller pays 2 resources.

**Always Two**
- Ensure on a teammate's unit the teammate (its controller) decides and pays the 2 resources from their own resources, never the player who attached it.

### I Have You Now #193

> Attack with a Vehicle unit. Prevent all damage that would be dealt to it during this attack.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Cat and Mouse #195

> Exhaust an enemy unit. If you do, ready a friendly unit in the same arena with power equal to or less than that enemy unit.

**Always Two**
- Ensure only an enemy's unit can be chosen, never the teammate's.
- Ensure the choice of friendly unit to ready can be the teammate's unit as well as your own.

### Blade Squadron B-Wing #199

> When Played: If another player controls 3 or more exhausted units, give a Shield token to a unit.

**Twin Suns**
- Ensure the condition is true if any single other player controls 3 or more exhausted units, not summed across players.

**Always Two**
- Ensure the condition counts each other player individually and nothing is summed across players.

### Ahsoka Tano — Chasing Whispers #201

> When Played: An opponent discards a card from their hand. If it's a unit, you may exhaust a unit.

**Twin Suns**
- Ensure the controller chooses which opponent, and the choice persists through the ability.
- Ensure other opponents' hands are untouched.

**Always Two**
- Ensure the choice is either enemy, never the teammate.

### Black Squadron Scout Wing #202

> When you play an upgrade on this unit: You may attack with this unit. It gets +1/+0 for this attack.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Home One — On My Mark #204

> If an opponent controls 3 or more space units, this unit costs 3 resources less to play. / Ambush

**Twin Suns**
- Ensure the cost reduction applies if any one opponent controls 3 or more space units; space units are not combined across opponents (2 and 2 does not qualify).

**Always Two**
- Ensure the teammate's space units do not count, and the discount applies when either enemy individually controls 3 or more space units; 2 and 2 across the two enemies does not qualify.

### Jam Communications #207

> Look at an opponent's hand and discard an event from it.

**Twin Suns**
- Ensure the controller chooses which opponent, and the choice persists through the ability.
- Ensure only that opponent's hand is seen and has an event discarded.

**Always Two**
- Ensure the choice is either enemy, never the teammate.

### Never Tell Me the Odds #208

> Discard 3 cards from an opponent's deck and 3 cards from your deck. Deal damage to a unit equal to the number of cards with an odd cost discarded this way.

**Twin Suns**
- Ensure the controller chooses which opponent, and the choice persists through the ability.
- Ensure only that opponent's deck loses cards, besides your own.

**Always Two**
- Ensure the choice is either enemy, never the teammate.
- Ensure the teammate's deck is not affected.

### It's a Trap #209

> If an opponent controls more space units than you, ready each space unit you control.

**Twin Suns**
- Ensure the controller chooses which opponent the condition is checked against, and may choose an opponent for whom it is not met (the effect then does nothing), even if another opponent would meet it.

**Always Two**
- Ensure the controller chooses either enemy (never the teammate) for the condition, and may choose an enemy for whom it is not met.
- Ensure the teammate's space units are not counted as yours and are not readied; only your own space units ready.

### Sidon Ithano — The Crimson Corsair #213

> When played as a unit: You may attach this unit as an upgrade to an enemy Vehicle unit without a Pilot on it.

**Always Two**
- Ensure only an enemy's Vehicle unit can be chosen, never the teammate's.

### Death Space Skirmisher #217

> When Played: If you control another space unit, you may exhaust a unit.

**Always Two**
- Ensure a space unit controlled only by the teammate does not enable the ability; only another space unit you control counts.

### Guerilla Soldier #218

> When Played: Deal 3 indirect damage to a player. If a base is damaged this way, ready this unit. (That player assigns 3 unpreventable damage among their base and units.)

**Twin Suns**
- Ensure the Soldier readies when the chosen player assigns at least one point to their base, and stays exhausted when all 3 go to that player's units.

**Always Two**
- Ensure the Soldier readies when the chosen player (the controller, the teammate or an enemy) assigns at least one point to their base, and stays exhausted when all 3 go to that player's units.

### Rafa Martez — Shrewd Sister #219

> When Played/On Attack: Deal 1 damage to a friendly unit and ready a resource.

**Twin Suns**
- Ensure the resource can be readied for you or for any one opponent, with the player choosing which opponent.

**Always Two**
- Ensure the choice of friendly unit for the 1 damage can be the teammate's unit as well as your own.
- Ensure the resource readied can be your own, your teammate's, or either enemy's.

### Stolen AT-Hauler #221

> When Defeated: Choose an opponent. For this phase, they may play this unit from its owner's discard pile for free.

**Twin Suns**
- Ensure the controller chooses which opponent, and the choice persists through the ability.
- Ensure the other opponents cannot play it from the discard pile.

**Always Two**
- Ensure the choice is either enemy, never the teammate.
- Ensure the teammate and the other enemy gain no permission to play it.

### Kimogila Heavy Fighter #222

> When Played: Deal 3 indirect damage to a player. Exhaust each unit damaged this way. (That player assigns 3 unpreventable damage among their base and units.)

**Twin Suns**
- Ensure only the units the chosen player assigned damage to are exhausted, including the controller's own units when they chose themselves; undamaged units stay ready.

**Always Two**
- Ensure only the units the chosen player assigned damage to are exhausted: the teammate's damaged units when the teammate is chosen, the controller's own when they choose themselves; the other players' units are unaffected.

### Razor Crest — Ride For Hire #223

> When a Pilot attaches to this unit: You may return a non-leader unit that costs 2 or less or an exhausted non-leader unit that costs 4 or less to its owner's hand.

**Twin Suns**
- Ensure a unit that is controlled by one player but owned by another (taken by an effect) returns to its owner's hand, not the controller's.

**Always Two**
- Ensure a Pilot the teammate plays or deploys onto your Razor Crest triggers it, and you (Razor Crest's controller) make the choice, not the teammate.
- Ensure the returned unit can be yours, the teammate's or an enemy's, whichever matches the cost condition.
- Ensure a unit controlled by one player but owned by another returns to its owner's hand, which may be a different player than its controller.

### Radiant VII — Ambassadors' Arrival #226

> Each enemy non-leader unit gets –1/–0 for each damage on it. / When Played: Deal 5 indirect damage to a player.

**Twin Suns**
- Ensure every opponent's damaged non-leader units get -1/-0 for each damage on them, while your own units are unaffected.

**Always Two**
- Ensure both enemies' damaged non-leader units get -1/-0 for each damage on them, and the teammate's damaged units and your own are not reduced.

### Superheavy Ion Cannon #227

> Attach to a Capital Ship or Transport unit. / Attached unit gains: “On Attack: You may exhaust a non-leader unit the defending player controls. If you do, deal indirect damage equal to its power to that player.”

**Twin Suns**
- Ensure that when an opponent's attached unit attacks, that opponent chooses whether to exhaust a unit of the defending player, and the indirect damage goes to the controller of the exhausted unit.

**Always Two**
- Ensure the upgrade can be attached to the teammate's or an enemy's Capital Ship or Transport as well as your own, and the player who played it controls the upgrade.
- Ensure that when the attached unit is the teammate's or an enemy's, that unit's controller makes the On Attack choice and deals the indirect damage, which goes to the controller of the exhausted unit.

### Barrel Roll #228

> Attack with a space unit. After completing this attack, you may exhaust a space unit.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Punch It #231

> Attack with a Vehicle unit. It gets +2/+0 for this attack.

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.

### Jump to Lightspeed #232

> Return a friendly space unit and any number of non-leader upgrades on it to their owners' hands. The next time you play a copy of that unit this phase, you may play it for free.

**Always Two**
- Ensure the choice can be the teammate's space unit as well as your own, and it returns to its owner's hand.
- Ensure the free play applies only to you, not your teammate.

### Commandeer #235

> Take control of a non-leader Vehicle unit that costs 6 or less without a Pilot on it. If you do, ready it. At the start of the next regroup phase, return that unit to its owner's hand.

**Always Two**
- Ensure taking the teammate's Vehicle moves it to the player who played the event, and it returns to the teammate's hand at the next regroup.

### Sith Trooper #238

> On Attack: This unit gets +1/+0 for this attack for each damaged unit the defending player controls.

**Twin Suns**
- Ensure only damaged units of the attacked opponent count, not those of other opponents.

**Always Two**
- Ensure only damaged units of the defending enemy count, not those of the other enemy or the teammate.

### Fett's Firespray — Feared Silhouette #240

> When Played/On Attack: Deal 1 indirect damage to a player. If you control Boba Fett (as a unit, upgrade, or leader), deal 2 indirect damage instead. (They assign unpreventable damage among their base and units.)

**Twin Suns**
- Ensure the 2 indirect damage mode applies when the controller controls Boba Fett as a unit, as an upgrade, or as either of their two leaders (leader side or deployed), and 1 applies when none is controlled.

**Always Two**
- Ensure a Boba Fett the teammate controls (unit, upgrade or leader) does not enable the 2 indirect damage mode, and 1 is dealt.
- Ensure a Boba Fett Pilot the controller played or deployed onto the teammate's Vehicle enables the 2 indirect damage mode, while a Boba Fett upgrade the teammate attached to the controller's unit does not.

### There Is No Escape #244

> Choose up to 3 units. Those units lose all abilities and can't gain abilities for this round.

**Always Two**
- Ensure the up to 3 units can include your teammate's units and either enemy's units, and each chosen unit loses all abilities for the round.

### Sabine's Masterpiece — Crazy Colorful #250

> On Attack: If you control a: / Vigilance unit, heal 2 damage from a base. / Command unit, give an Experience token to a unit. / Aggression unit, deal 1 damage to a unit or a base. / Cunning unit, exhaust or ready a resource.

**Twin Suns**
- Ensure the resource exhausted or readied can belong to any opponent or yourself.

**Always Two**
- Ensure a teammate's unit of an aspect does not enable that bullet; only units you control count.

### Swarming Vulture Droid #256

> A deck can have up to 15 copies of this card. / This unit gets +1/+0 for each other friendly Swarming Vulture Droid.

**Twin Suns**
- Ensure this bypasses the singleton rule.

**Always Two**
- Ensure the teammate's Swarming Vulture Droids also add to the bonus.

### Flanking Fang Fighter #257

> While you control another Fighter unit, this unit gains Raid 2. (It gets +2/+0 while attacking.)

**Always Two**
- Ensure a teammate's Fighter does not give Raid 2; only another Fighter you control counts.

### Death Star Plans #260

> When attached unit is attacked: The attacking player takes control of this upgrade and attaches it to a unit they control. / Attached unit gains: “The first unit you play each round costs 2 resources less.”

**Twin Suns**
- Ensure this can be used by up to four players.

**Always Two**
- Ensure the discount goes to the controller of the attached unit: on a teammate's unit it discounts the teammate's first unit each round, not yours.
- Ensure the discount can be used by all players.

### Attack Run #261

> Attack with 2 space units (one at a time).

**Always Two**
- Ensure the attack can only be initiated with a unit you control, never with the teammate's unit.
