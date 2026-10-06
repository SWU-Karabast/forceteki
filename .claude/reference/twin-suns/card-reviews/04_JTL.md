# 04_JTL (JTL) card review

258 cards + 2 tokens, in set order. Review against the official card text (`test/json/Card/`), not our implementations.

### 001 - Asajj Ventress - I Work Alone

- Internal name: `asajj-ventress#i-work-alone`
- Type: Leader
- Text: Action [Exhaust]: Deal 1 damage to a friendly unit. If you do, deal 1 damage to an enemy unit in the same arena.
- Deployed: Grit Attached unit is a leader unit. It gains Grit and: “On Attack: You may deal 1 damage to a friendly unit. If you do, deal 1 damage to an enemy unit in the same arena.”
- Rules: If the damage to a friendly unit from Asajj's ability is prevented or replaced, you still resolve the damage to an enemy unit.
- Status: Unreviewed

### 002 - Grand Admiral Thrawn - ...How Unfortunate

- Internal name: `grand-admiral-thrawn#how-unfortunate`
- Type: Leader
- Text: When you use a “When Defeated” ability: You may exhaust this leader. If you do, use that ability again.
- Deployed: When you use a “When Defeated” ability: You may use that ability again. Use this ability only once each round.
- Rules: Any ability whose trigger starts with "When defeated…" is considered a "When Defeated" ability.
- Status: Unreviewed

### 003 - Lando Calrissian - Buying Time

- Internal name: `lando-calrissian#buying-time`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Play a unit from your hand (paying its cost). If you do and you control a ground unit and a space unit, give a Shield token to a unit.
- Deployed: Sentinel Attached unit is a leader unit. Attached unit gains Sentinel. When deployed as an upgrade: You may give a Shield token to a unit in a different arena.
- Rules: The unit you play with the first part of Lando's leader ability can count as the ground unit or space unit for the second part of the ability. Abilities that let you play a card require you to pay that card’s cost unless specified otherwise. Give a unit a Shield before resolving any “When Played” abilities or other abilities that trigger when you play your unit.
- Status: Unreviewed

### 004 - Rose Tico - Saving What We Love

- Internal name: `rose-tico#saving-what-we-love`
- Type: Leader
- Text: Action [Exhaust]: Heal 2 damage from a Vehicle unit that attacked this phase.
- Deployed: On Attack: You may heal 2 damage from a Vehicle unit.
- Status: Unreviewed

### 005 - Admiral Piett - Commanding the Armada

- Internal name: `admiral-piett#commanding-the-armada`
- Type: Leader
- Text: Action [Exhaust]: Play a Capital Ship unit from your hand. It costs 1 resource less.
- Deployed: Each Capital Ship unit you play costs 2 resources less.
- Status: Unreviewed

### 006 - Darth Vader - Victor Squadron Leader

- Internal name: `darth-vader#victor-squadron-leader`
- Type: Leader
- Text: Action [Exhaust]: If you attacked with a non-token Vehicle unit this phase, create a TIE Fighter token.
- Deployed: Attached unit is a leader unit. When deployed as an upgrade: Create 2 TIE Fighter tokens.
- Rules: In order to deploy Vader as an upgrade, there needs to be a friendly Vehicle unit for him to attach to. You cannot deploy him as an upgrade and attach him to one of the TIE Fighter tokens he creates when deployed. Vader’s leader ability still can be used as an action even if you haven't attacked with a non-token Vehicle unit this phase (but no TIE Fighter token is created).
- Status: Unreviewed

### 007 - Admiral Holdo - We're Not Alone

- Internal name: `admiral-holdo#were-not-alone`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Give a Resistance unit or a unit with a Resistance upgrade on it +2/+2 for this phase.
- Deployed: On Attack: You may give another Resistance unit or a unit with a Resistance upgrade on it +2/+2 for this phase.
- Status: Unreviewed

### 008 - Wedge Antilles - Leader of Red Squadron

- Internal name: `wedge-antilles#leader-of-red-squadron`
- Type: Leader
- Text: Action [Exhaust]: Play a card from your hand using Piloting. It costs 1 resource less.
- Deployed: Attached unit is a leader unit. It gains: “On Attack: The next Pilot card you play this phase costs 1 resource less. (This includes Piloting costs.)”
- Rules: Wedge's leader ability requires that you use the Piloting keyword to play a Pilot as an upgrade. Wedge's upgrade ability reduces the cost of cards with the Pilot trait, regardless of how they are played. The discount from Wedge's “On Attack” ability remains active even if he is defeated.
- Status: Unreviewed

### 009 - Boba Fett - Any Methods Necessary

- Internal name: `boba-fett#any-methods-necessary`
- Type: Leader
- Text: When you deal non-combat damage: You may exhaust this leader. If you do, deal 1 indirect damage to a player. (That player assigns 1 unpreventable damage among their base and units.)
- Deployed: Attached unit is a leader unit. When deployed as an upgrade: Deal up to 4 damage divided as you choose among any number of units.
- Rules: “Non-combat damage” is any damage dealt outside the “deal combat damage” step of an attack. Damage dealt by "On Attack" abilities is non-combat damage. With Boba's "When Deployed" ability, you can choose to assign more damage to a unit than it has remaining HP. All damage dealt by Boba's "When Deployed" ability is dealt simultaneously.
- Status: Unreviewed

### 010 - Captain Phasma - Chrome Dome

- Internal name: `captain-phasma#chrome-dome`
- Type: Leader
- Text: Action [Exhaust]: If you played a First Order card this phase, deal 1 damage to a base.
- Deployed: On Attack: If you played another First Order card this phase, you may deal 1 damage to a unit. If you do, deal 1 damage to a base.
- Rules: Phasma’s leader ability still can be used as an action even if you haven't played a First Order card this phase (but no damage is dealt).
- Status: Unreviewed

### 011 - Major Vonreg - Red Baron

- Internal name: `major-vonreg#red-baron`
- Type: Leader
- Text: Action [Exhaust]: Play a Vehicle unit from your hand (paying its cost). If you do, give another unit +1/+0 for this phase.
- Deployed: Attached unit is a leader unit. It gains: “On Attack: You may give another unit in this arena +1/+0 for this phase.”
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 012 - Luke Skywalker - Hero of Yavin

- Internal name: `luke-skywalker#hero-of-yavin`
- Type: Leader
- Text: Action [Exhaust]: If you attacked with a Fighter unit this phase, deal 1 damage to a unit.
- Deployed: This upgrade can’t be defeated by enemy card abilities. Attached unit is a leader unit. If it’s a Fighter, it gains: “On Attack: You may deal 3 damage to a unit.”
- Rules: Luke’s leader ability still can be used as an action even if you haven't attacked with a Fighter unit this phase (but no damage is dealt).
- Status: Unreviewed

### 013 - Poe Dameron - I Can Fly Anything

- Internal name: `poe-dameron#i-can-fly-anything`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Flip this leader and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it.
- Deployed: Action [1 resource]: Attach this upgrade to a friendly Vehicle unit without a Pilot on it. Use this ability only once each round.
- Rules: Using Poe's action ability to flip and attach him to a unit allows him to enter play as an upgrade but is not considered deploying him. If he is defeated as an upgrade or unit without having used his Epic Action to deploy, it is still available to use. Poe attaching to a unit does not make it a Leader Unit, though he is a Leader Upgrade. If an opponent takes control of the unit Poe is on, Poe remains attached as an upgrade under your control. Only you may use his action ability, even while he is attached to an enemy unit.
- Status: Unreviewed

### 014 - Admiral Trench - Chk-chk-chk-chk

- Internal name: `admiral-trench#chkchkchkchk`
- Type: Leader
- Text: Action [Exhaust]: Discard a card that costs 3 or more from your hand. If you do, draw a card.
- Deployed: When Deployed: Reveal the top 4 cards of your deck. An opponent discards 2 of them. Draw 1 of the remaining cards and discard the other.
- Rules: Trench does not use an Epic Action to deploy, so he may deploy multiple times in a game. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 015 - Rio Durant - Wisecracking Wheelman

- Internal name: `rio-durant#wisecracking-wheelman`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Attack with a space unit. It gets +1/+0 and gains Saboteur for this attack. (Ignore Sentinel and defeat the defender's Shields.)
- Deployed: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender’s Shields.) Attached unit is a leader unit. It gains Saboteur. If it’s a Transport, it also gets +1/+0.
- Rules: If you use Rio’s leader ability, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 016 - Admiral Ackbar - It's A Trap!

- Internal name: `admiral-ackbar#its-a-trap`
- Type: Leader
- Text: Action [1 resource, Exhaust]: Exhaust a non-leader unit. If you do, its controller creates an X-Wing token.
- Deployed: On Attack: You may exhaust a unit. If you do, its controller creates an X-Wing token.
- Status: Unreviewed

### 017 - Han Solo - Never Tell Me the Odds

- Internal name: `han-solo#never-tell-me-the-odds`
- Type: Leader
- Text: Action [Exhaust]: Reveal the top card of your deck, then attack with a unit. If the revealed card and that unit have different odd costs, that unit gets +1/+0 for this attack.
- Deployed: Attached unit is a leader unit. When deployed as an upgrade: For each friendly unit or upgrade that has an odd cost, ready a resource.
- Rules: The revealed card stays on top of your deck. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. If you use Han’s leader ability, you must attack with a unit, if able. You choose which unit to attack with after revealing the top card of your deck. Units must be ready in order to attack. Zero is an even number.
- Status: Unreviewed

### 018 - Kazuda Xiono - Best Pilot in the Galaxy

- Internal name: `kazuda-xiono#best-pilot-in-the-galaxy`
- Type: Leader
- Text: Action [Exhaust]: A friendly unit loses all abilities for this round. Take an extra action after this one.
- Deployed: On Attack: Choose any number of friendly units. They lose all abilities for this round. Attached unit is a leader unit. It gains: “On Attack: Choose any number of friendly units. They lose all abilities for this round.”
- Rules: You may take any standard action as your extra action: Play a Card, Attack With a Unit, Use an Action Ability, Take the Initiative, or Pass. The chosen units for Kaz's “On Attack” ability lose all abilities for the round even if he is defeated. A friendly unit that has lost all abilities for the round cannot gain or be given any new abilities for the round.
- Status: Unreviewed

### 019 - City in the Clouds

- Internal name: `city-in-the-clouds`
- Type: Base
- Text: (none)
- Status: Finished

### 021 - Colossus

- Internal name: `colossus`
- Type: Base
- Text: Draw 1 less card in your starting hand.
- Rules: If you choose to mulligan your hand, you still draw 1 less card in your mulligan hand.
- Status: Unreviewed

### 022 - Resistance Headquarters

- Internal name: `resistance-headquarters`
- Type: Base
- Text: (none)
- Status: Finished

### 024 - Data Vault

- Internal name: `data-vault`
- Type: Base
- Text: Your minimum deck size is increased by 10 cards.
- Status: Unreviewed

### 025 - Thermal Oscillator

- Internal name: `thermal-oscillator`
- Type: Base
- Text: Your minimum deck size is decreased by 5 cards.
- Status: Unreviewed

### 026 - Massassi Temple

- Internal name: `massassi-temple`
- Type: Base
- Text: (none)
- Status: Finished

### 027 - Nadiri Dockyards

- Internal name: `nadiri-dockyards`
- Type: Base
- Text: (none)
- Status: Finished

### 028 - Nabat Village

- Internal name: `nabat-village`
- Type: Base
- Text: Draw 3 more cards in your starting hand. You can't take a mulligan. When the first action phase starts: Put 3 cards from your hand on the bottom of your deck in any order.
- Rules: Nabat Village's triggered ability is resolved at the start of the first action phase, after setup but before the player with initiative has taken their first action.
- Status: Unreviewed

### 029 - Chopper Base

- Internal name: `chopper-base`
- Type: Base
- Text: (none)
- Status: Finished

### 031 - Lake Country

- Internal name: `lake-country`
- Type: Base
- Text: (none)
- Status: Finished

### 032 - Director Krennic - On the Verge of Greatness

- Internal name: `director-krennic#on-the-verge-of-greatness`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.) The first unit you play each round that has a “When Defeated” ability costs 1 resource less.
- Rules: Any ability whose trigger starts with "When defeated…" is considered a "When Defeated" ability.
- Status: Unreviewed

### 033 - Onyx Squadron Brute

- Internal name: `onyx-squadron-brute`
- Type: Unit
- Text: When Defeated: Heal 2 damage from a base.
- Status: Unreviewed

### 034 - Interceptor Ace

- Internal name: `interceptor-ace`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Rules: Any ability whose trigger starts with "When defeated…" or includes "When Defeated" is considered a "When Defeated" ability. Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Unreviewed

### 035 - Tam Ryvora - Searching For Purpose

- Internal name: `tam-ryvora#searching-for-purpose`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 036 - Iden Versio - Adapt or Die

- Internal name: `iden-versio#adapt-or-die`
- Type: Unit
- Text: Shielded
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Unreviewed

### 037 - Banshee - Crippling Command

- Internal name: `banshee#crippling-command`
- Type: Unit
- Text: On Attack: You may deal damage to a unit equal to the amount of damage on this unit.
- Status: Unreviewed

### 038 - Corvus - Inferno Squadron Raider

- Internal name: `corvus#inferno-squadron-raider`
- Type: Unit
- Text: Restore 2 When Played: You may attach a friendly Pilot unit or upgrade to this unit. (Defeat all upgrades on that Pilot and remove all damage from it.)
- Rules: If you choose to attach a Pilot unit to Corvus as an upgrade, defeat all upgrades on that Pilot and remove all damage from it.
- Status: Unreviewed

### 039 - Chimaera - Reinforcing the Center

- Internal name: `chimaera#reinforcing-the-center`
- Type: Unit
- Text: When Played: You may use a “When Defeated” ability on another friendly unit. When Defeated: Create 2 TIE Fighter tokens.
- Rules: Any ability whose trigger starts with "When defeated…" is considered a "When Defeated" ability.
- Status: Unreviewed

### 040 - Fleet Interdictor

- Internal name: `fleet-interdictor`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) When Defeated: You may defeat a space unit that costs 3 or less.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 041 - Annihilator - Tagge's Flagship

- Internal name: `annihilator#tagges-flagship`
- Type: Unit
- Text: When Played/When Defeated: You may defeat an enemy unit. If you do, search its controller's deck and hand for each card with that unit's name and discard them. (They shuffle their deck.)
- Rules: After searching a deck, that deck's owner shuffles it. Abilities that refer to a card’s “name” do not include the subtitle of the card.
- Status: Unreviewed

### 042 - Power from Pain

- Internal name: `power-from-pain`
- Type: Event
- Text: Give a unit +1/+0 for this phase for each damage on it.
- Rules: The unit gets +1/+0 only for the damage on it when this event is played.
- Status: Unreviewed

### 043 - No Glory, Only Results

- Internal name: `no-glory-only-results`
- Type: Event
- Text: Take control of a non-leader unit, then defeat it.
- Status: Unreviewed

### 044 - Echo Base Engineer

- Internal name: `echo-base-engineer`
- Type: Unit
- Text: When Played: You may give a Shield token to a damaged Vehicle unit.
- Status: Unreviewed

### 045 - Hera Syndulla - We've Lost Enough

- Internal name: `hera-syndulla#weve-lost-enough`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.)
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Unreviewed

### 046 - Paige Tico - Dropping the Hammer

- Internal name: `paige-tico#dropping-the-hammer`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 047 - Admiral Yularen - Fleet Coordinator

- Internal name: `admiral-yularen#fleet-coordinator`
- Type: Unit
- Text: When Played: Choose Grit, Restore 1, Sentinel, or Shielded. While this unit is in play, each friendly Vehicle unit gains the chosen keyword.
- Rules: Until Yularen leaves play, each friendly Vehicle unit gains the chosen keyword. This effect is not changed if an opponent takes control of Yularen. If Yularen is captured and then rescued, his "When Played" effect does not resume. (ERRATA) When Played: Choose Grit, Restore 1, Sentinel, or Shielded. While this unit is in play, each Vehicle unit you control or play gains the chosen keyword.
- Status: Unreviewed

### 048 - Cassian Andor - Threading the Eye

- Internal name: `cassian-andor#threading-the-eye`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Always discard from the top of a deck, unless an ability specifies otherwise.
- Status: Finished

### 049 - L3-37 - Get Out Of My Seat

- Internal name: `l337#get-out-of-my-seat`
- Type: Unit
- Text: If this unit would be defeated, you may instead attach her as an upgrade to a friendly Vehicle unit without a Pilot on it. (She's no longer a unit. Defeat all upgrades on her and remove all damage from her.)
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. If you choose to attach L3-37 to a unit as an upgrade when she would be defeated, defeat all upgrades on her and remove all damage from her.
- Status: Unreviewed

### 050 - Phantom II - Modified to Dock

- Internal name: `phantom-ii#modified-to-dock`
- Type: Unit
- Text: Grit Action [1 resource]: If this card is a unit, attach it as an upgrade to The Ghost. (It's no longer a unit. Defeat all upgrades on it and remove all damage from it.) Attached unit gets +3/+3 and gains Grit.
- Rules: If you use Phantom II's ability to attach it to a unit as an upgrade, defeat all upgrades on it and remove all damage from it. It is considered an upgrade while attached and it still has its text.
- Status: Unreviewed

### 051 - Red Squadron X-Wing

- Internal name: `red-squadron-xwing`
- Type: Unit
- Text: When Played: You may deal 2 damage to this unit. If you do, draw a card.
- Status: Unreviewed

### 052 - D'Qar Cargo Frigate

- Internal name: `dqar-cargo-frigate`
- Type: Unit
- Text: This unit gets –1/–0 for each damage on it.
- Status: Unreviewed

### 053 - The Ghost - Heart of the Family

- Internal name: `the-ghost#heart-of-the-family`
- Type: Unit
- Text: Each other friendly Spectre unit gains this unit's keywords. While this unit is upgraded, it gains Sentinel.
- Status: Unreviewed

### 054 - Gold Leader - Fastest Ship in the Fleet

- Internal name: `gold-leader#fastest-ship-in-the-fleet`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.) While this unit is defending, the attacker gets –1/–0.
- Status: Unreviewed

### 055 - You're All Clear, Kid

- Internal name: `youre-all-clear-kid`
- Type: Event
- Text: Defeat an enemy space unit with 3 or less remaining HP. If you do and an opponent controls no space units, you may give an Experience token to a unit.
- Rules: If you defeat an opponent's last space unit with this event, you may give an Experience token to a unit, even if that unit has a "When Defeated" ability that would put a new space unit into play.
- Status: Unreviewed

### 056 - Hondo Ohnaka - Superfluous Swindler

- Internal name: `hondo-ohnaka#superfluous-swindler`
- Type: Unit
- Text: Shielded On Attack: You may take control of a non-Pilot upgrade on a unit and attach it to a different eligible unit.
- Rules: You can use Hondo's ability to attach an upgrade to himself.
- Status: Unreviewed

### 057 - Astromech Pilot

- Internal name: `astromech-pilot`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 058 - Academy Graduate

- Internal name: `academy-graduate`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Unreviewed

### 059 - Corporate Defense Shuttle

- Internal name: `corporate-defense-shuttle`
- Type: Unit
- Text: This unit can't attack.
- Status: Unreviewed

### 060 - Desperate Commando

- Internal name: `desperate-commando`
- Type: Unit
- Text: When Defeated: You may give a unit –1/–1 for this phase.
- Status: Unreviewed

### 061 - Royal Security Fighter

- Internal name: `royal-security-fighter`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 062 - Silver Angel - Trace's Hope

- Internal name: `silver-angel#traces-hope`
- Type: Unit
- Text: When 1 or more damage is healed from this unit: You may deal 1 damage to a space unit.
- Status: Unreviewed

### 063 - Landing Shuttle

- Internal name: `landing-shuttle`
- Type: Unit
- Text: When Defeated: You may draw a card.
- Status: Unreviewed

### 064 - Omicron Strike Craft

- Internal name: `omicron-strike-craft`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 065 - Outer Rim Outlaws

- Internal name: `outer-rim-outlaws`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 066 - Trace Martez - Trusting Sister

- Internal name: `trace-martez#trusting-sister`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 067 - Cloaked StarViper

- Internal name: `cloaked-starviper`
- Type: Unit
- Text: When Played: Give 2 Shield tokens to this unit.
- Status: Unreviewed

### 068 - Perimeter AT-RT

- Internal name: `perimeter-atrt`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 069 - Munificent Frigate

- Internal name: `munificent-frigate`
- Type: Unit
- Text: (none)
- Status: Finished

### 070 - U-Wing Lander

- Internal name: `uwing-lander`
- Type: Unit
- Text: When Played: Give 3 Experience tokens to this unit. When this unit completes an attack (and survives): You may attach an upgrade on this unit to another eligible friendly Vehicle unit.
- Rules: A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 071 - CR90 Relief Runner

- Internal name: `cr90-relief-runner`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.) When Defeated: Heal up to 3 damage from a unit or base.
- Status: Unreviewed

### 072 - Wing Guard Security Team

- Internal name: `wing-guard-security-team`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) When Played: Give a Shield token to each of up to 2 Fringe units.
- Status: Unreviewed

### 073 - Grim Valor

- Internal name: `grim-valor`
- Type: Upgrade
- Text: Attached unit gains: “When Defeated: You may exhaust a unit.”
- Status: Unreviewed

### 074 - Close the Shield Gate

- Internal name: `close-the-shield-gate`
- Type: Event
- Text: Choose a base. The next time damage would be dealt to it this phase, prevent that damage.
- Status: Unreviewed

### 075 - Repair

- Internal name: `repair`
- Type: Event
- Text: Heal 3 damage from a unit or base.
- Status: Unreviewed

### 076 - Covering the Wing

- Internal name: `covering-the-wing`
- Type: Event
- Text: Create an X-Wing token. You may give a Shield token to another unit.
- Status: Unreviewed

### 077 - In the Heat of Battle

- Internal name: `in-the-heat-of-battle`
- Type: Event
- Text: Each unit gains Sentinel and loses Saboteur for this phase.
- Rules: Events only affect units that are in play when the event is played, unless specified otherwise. Affected units can't gain Saboteur for this phase.
- Status: Unreviewed

### 078 - Direct Hit

- Internal name: `direct-hit`
- Type: Event
- Text: Defeat a non-leader Vehicle unit.
- Status: Unreviewed

### 079 - Out the Airlock

- Internal name: `out-the-airlock`
- Type: Event
- Text: Give a unit –5/–5 for this phase.
- Status: Unreviewed

### 080 - Nebula Ignition

- Internal name: `nebula-ignition`
- Type: Event
- Text: Defeat each unit that isn't upgraded.
- Status: Unreviewed

### 081 - First Order TIE Fighter

- Internal name: `first-order-tie-fighter`
- Type: Unit
- Text: While you control a token unit, this unit gains Raid 1. (It gets +1/+0 while attacking.)
- Status: Unreviewed

### 082 - Kijimi Patrollers

- Internal name: `kijimi-patrollers`
- Type: Unit
- Text: When Played: Create a TIE Fighter token.
- Status: Unreviewed

### 083 - Pantoran Starship Thief

- Internal name: `pantoran-starship-thief`
- Type: Unit
- Text: When Played: You may pay 3 resources. If you do, attach this unit as an upgrade to a Fighter or Transport unit without a Pilot on it. Take control of that unit.
- Rules: Pilots are considered units while not in play. Pantoran Starship Thief doesn't have the Piloting keyword and can only attach to a unit as a Pilot through its "When Played" ability.
- Status: Unreviewed

### 084 - Wingman Victor Two - Mauler Mithel

- Internal name: `wingman-victor-two#mauler-mithel`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 085 - Victor Leader - Leading from the Front

- Internal name: `victor-leader#leading-from-the-front`
- Type: Unit
- Text: Each other friendly space unit gets +1/+1.
- Status: Unreviewed

### 086 - Wingman Victor Three - Backstabber

- Internal name: `wingman-victor-three#backstabber`
- Type: Unit
- Rules: (ERRATA) When played as an upgrade: You may give an Experience token to a unit other than the attached unit. Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 087 - TIE Ambush Squadron

- Internal name: `tie-ambush-squadron`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) When Played/When Defeated: Create a TIE Fighter token.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 088 - Captain Phasma - On My Command

- Internal name: `captain-phasma#on-my-command`
- Type: Unit
- Text: When Played/On Attack: You may give another First Order unit +2/+2 for this phase.
- Status: Unreviewed

### 089 - The Invisible Hand - Crawling With Vultures

- Internal name: `the-invisible-hand#crawling-with-vultures`
- Type: Unit
- Text: When Played/When this unit completes an attack (and survives): You may search the top 8 cards of your deck for a Droid unit, reveal it, and draw it. If it costs 2 or less, you may play it for free. (Put the other cards on the bottom of your deck in a random order.)
- Rules: A unit must survive an attack to trigger its “when this unit completes an attack” abilities. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs. After searching, put any cards not chosen on the bottom of your deck in a random order. If you choose any Pilot units with your search, you may only play them as units. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 090 - Executor - Might of the Empire

- Internal name: `executor#might-of-the-empire`
- Type: Unit
- Text: Overwhelm When Played/On Attack/When Defeated: Create 3 TIE Fighter tokens.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 091 - Apology Accepted

- Internal name: `apology-accepted`
- Type: Event
- Text: Defeat a friendly unit. You may give 2 Experience tokens to a unit.
- Status: Unreviewed

### 092 - Scramble Fighters

- Internal name: `scramble-fighters`
- Type: Event
- Text: Create 8 TIE Fighter tokens and ready them. They can't attack bases for this phase.
- Rules: Units that can’t attack bases can still damage bases through other abilities, like Overwhelm.
- Status: Unreviewed

### 093 - Nien Nunb - Loyal Co-Pilot

- Internal name: `nien-nunb#loyal-copilot`
- Type: Unit
- Text: This unit gets +1/+0 for each other friendly Pilot unit and upgrade.
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. Nien Nunb only gets +1/+0 for Pilot units and Pilot upgrades.
- Status: Unreviewed

### 094 - Luke Skywalker - You Still With Me?

- Internal name: `luke-skywalker#you-still-with-me`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. If the vehicle Luke is piloting is defeated, Luke would be defeated as a result, so he may be moved to the ground arena instead.
- Status: Finished

### 095 - Phoenix Squadron A-Wing

- Internal name: `phoenix-squadron-awing`
- Type: Unit
- Text: (none)
- Status: Finished

### 096 - Blue Leader - Scarif Air Support

- Internal name: `blue-leader#scarif-air-support`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) When Played: You may pay 2 resources. If you do, move this unit to the ground arena and give 2 Experience tokens to it. (It's a ground unit.)
- Rules: Blue Leader's Ambush keyword and "When Played" ability can be resolved in either order. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 097 - Leia Organa - Pilots, To Your Stations

- Internal name: `leia-organa#pilots-to-your-stations`
- Type: Unit
- Text: Restore 1 (When this unit attacks, heal 1 damage from your base.) When Played: You may attack with a Pilot unit or a unit with a Pilot on it. It gets +1/+0 and gains Restore 1 for this attack.
- Rules: Units must be ready in order to attack.
- Status: Unreviewed

### 098 - Snap Wexley - Resistance Recon Flier

- Internal name: `snap-wexley#resistance-recon-flier`
- Type: Unit
- Text: When played as a unit/On Attack: The next Resistance card you play this phase costs 1 resource less.
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. The discount from Snap's “On Attack” ability remains active even if he is defeated. After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 099 - Veteran Fleet Officer

- Internal name: `veteran-fleet-officer`
- Type: Unit
- Text: When Played: Create an X-Wing token.
- Status: Unreviewed

### 100 - Poe Dameron - One Hell of a Pilot

- Internal name: `poe-dameron#one-hell-of-a-pilot`
- Type: Unit
- Text: When played as a unit: Create an X-Wing token. You may attach this unit as an upgrade to a friendly Vehicle unit without a Pilot on it.
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. Poe may attach to the X-Wing created by his "When Played" ability.
- Status: Unreviewed

### 101 - Red Leader - Form Up

- Internal name: `red-leader#form-up`
- Type: Unit
- Text: This unit costs 1 resource less to play for each friendly Pilot unit and upgrade. When a Pilot upgrade attaches to this unit: Create an X-Wing token.
- Rules: Red Leader's cost only gets reduced for Pilot units and Pilot upgrades.
- Status: Unreviewed

### 102 - Resistance Blue Squadron

- Internal name: `resistance-blue-squadron`
- Type: Unit
- Text: When Played: You may deal damage to a unit equal to the number of friendly space units.
- Status: Unreviewed

### 103 - Chewbacca - Faithful First Mate

- Internal name: `chewbacca#faithful-first-mate`
- Type: Unit
- Text: This unit can't be defeated or returned to hand by enemy card abilities.
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. Chewbacca or the unit he is attached to can be defeated by game effects, like having 0 remaining HP.
- Status: Unreviewed

### 104 - Raddus - Holdo's Final Command

- Internal name: `raddus#holdos-final-command`
- Type: Unit
- Text: While you control another Resistance card (unit, upgrade, or leader), this unit gains Sentinel. When Defeated: Deal damage equal to this unit's power to an enemy unit.
- Rules: Damage dealt by Raddus' "When Defeated" ability includes any modifiers to Raddus' power when it was defeated.
- Status: Unreviewed

### 105 - The Starhawk - Prototype Battleship

- Internal name: `the-starhawk#prototype-battleship`
- Type: Unit
- Text: Ambush While paying costs, you pay half as many resources, rounded up.
- Rules: The Starhawk's ability applies to both the costs of cards and the costs of abilities. When paying a cost, you only need to pay resources up to half of the determined cost (rounded up) in order to consider the cost paid. This ability does not affect any non-resource costs. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 106 - Unity of Purpose

- Internal name: `unity-of-purpose`
- Type: Event
- Text: For each friendly unit with a different name, give each unit you control +1/+1 for this phase.
- Rules: Abilities that refer to a card’s “name” do not include the subtitle of the card.
- Status: Unreviewed

### 107 - Bunker Defender

- Internal name: `bunker-defender`
- Type: Unit
- Text: While you control a Vehicle unit, this unit gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 108 - Clone Pilot

- Internal name: `clone-pilot`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 109 - Jarek Yeager - Coordinating With The Resistance

- Internal name: `jarek-yeager#coordinating-with-the-resistance`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 110 - Scouting Headhunter

- Internal name: `scouting-headhunter`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 111 - Seasoned Fleet Admiral

- Internal name: `seasoned-fleet-admiral`
- Type: Unit
- Text: Raid 1 When an opponent draws 1 or more cards during the action phase: You may give an Experience token to a unit.
- Status: Unreviewed

### 112 - Eager Escort Fighter

- Internal name: `eager-escort-fighter`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 113 - Homestead Militia

- Internal name: `homestead-militia`
- Type: Unit
- Text: While you control 6 or more resources, this unit gains Sentinel. (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 114 - Adept ARC-170

- Internal name: `adept-arc170`
- Type: Unit
- Text: Restore 2 (When this unit attacks, heal 2 damage from your base.)
- Status: Unreviewed

### 115 - Clone Combat Squadron

- Internal name: `clone-combat-squadron`
- Type: Unit
- Text: This unit gets +1/+1 for each other friendly space unit.
- Status: Unreviewed

### 116 - Dornean Gunship

- Internal name: `dornean-gunship`
- Type: Unit
- Text: When Played: Deal indirect damage to a player equal to the number of Vehicle units you control. (That player assigns that much unpreventable damage among their base and units.)
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 117 - General Draven - Doing What Must Be Done

- Internal name: `general-draven#doing-what-must-be-done`
- Type: Unit
- Text: When Played/On Attack: Create an X-Wing token.
- Status: Unreviewed

### 118 - MC30 Assault Frigate

- Internal name: `mc30-assault-frigate`
- Type: Unit
- Text: Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.) Raid 1 (This unit gets +1/+0 while attacking.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 119 - Resupply Carrier

- Internal name: `resupply-carrier`
- Type: Unit
- Text: When Played: You may put the top card of your deck into play as a resource.
- Rules: A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”.
- Status: Unreviewed

### 120 - Dorsal Turret

- Internal name: `dorsal-turret`
- Type: Upgrade
- Text: Attach to a Vehicle unit. Attached unit gains: “When this unit deals combat damage to a unit while attacking: Defeat that unit.”
- Rules: “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack.
- Status: Unreviewed

### 121 - Salvage

- Internal name: `salvage`
- Type: Event
- Text: Play a Vehicle unit from your discard pile (paying its cost). Then, deal 1 damage to it.
- Rules: Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.
- Status: Unreviewed

### 122 - All Wings Report In

- Internal name: `all-wings-report-in`
- Type: Event
- Text: Exhaust up to 2 friendly space units. For each unit exhausted this way, create an X-Wing token.
- Status: Unreviewed

### 123 - Dogfight

- Internal name: `dogfight`
- Type: Event
- Text: Attack with a unit, even if it's exhausted. That unit can't attack bases for this attack.
- Rules: If you play Dogfight, you must attack with a unit, if able. Units that can’t attack bases can still damage bases through other abilities, like Overwhelm.
- Status: Unreviewed

### 124 - Tandem Assault

- Internal name: `tandem-assault`
- Type: Event
- Text: Attack with a space unit. If you do, attack with a ground unit, and that ground unit gets +2/+0 for this attack.
- Rules: If you play Tandem Assault, you must attack with a space unit, if able. If you do, you must attack with a ground unit, if able. Units must be ready in order to attack. Fully resolve the first attack, including all triggers, before beginning the second attack.
- Status: Unreviewed

### 125 - Air Superiority

- Internal name: `air-superiority`
- Type: Event
- Text: If you control more space units than an opponent, deal 4 damage to a ground unit that opponent controls.
- Status: Unreviewed

### 126 - Eject

- Internal name: `eject`
- Type: Event
- Text: Detach a Pilot upgrade, move it to the ground arena as a unit, and exhaust it. Draw a card.
- Rules: Moving the Pilot doesn't cause it to leave or enter play.
- Status: Unreviewed

### 127 - Lightspeed Assault

- Internal name: `lightspeed-assault`
- Type: Event
- Text: Defeat a friendly space unit and deal damage equal to its power to an enemy space unit. If you do, deal indirect damage equal to the enemy unit's power to its controller.
- Rules: When determining a defeated unit's power, include any modifiers to its power when it was defeated. Lightspeed Assault still does indirect damage even if the enemy unit is defeated.
- Status: Unreviewed

### 128 - Prepare for Takeoff

- Internal name: `prepare-for-takeoff`
- Type: Event
- Text: Search the top 8 cards of your deck for up to 2 Vehicle units, reveal them, and draw them. (Put the other cards on the bottom of your deck in a random order.)
- Rules: After searching, put any cards not chosen on the bottom of your deck in a random order.
- Status: Unreviewed

### 129 - Focus Fire

- Internal name: `focus-fire`
- Type: Event
- Text: Choose a unit. Each friendly Vehicle unit in the same arena deals damage equal to its power to that unit.
- Status: Unreviewed

### 130 - Timely Reinforcements

- Internal name: `timely-reinforcements`
- Type: Event
- Text: Choose an opponent. For every 2 resources they control, create an X-Wing token and give it Sentinel for this phase. (Units in its arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 131 - Turbolaser Salvo

- Internal name: `turbolaser-salvo`
- Type: Event
- Text: Choose an arena. A friendly space unit deals damage equal to its power to each enemy unit in that arena.
- Rules: All damage dealt by Turbolaser Salvo is dealt simultaneously.
- Status: Unreviewed

### 132 - First Order Stormtrooper

- Internal name: `first-order-stormtrooper`
- Type: Unit
- Text: On Attack/When Defeated: Deal 1 indirect damage to a player. (They assign 1 unpreventable damage among their base and units.)
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 133 - Allegiant General Pryde - Ruthless and Loyal

- Internal name: `allegiant-general-pryde#ruthless-and-loyal`
- Type: Unit
- Text: When indirect damage is dealt to a unit: You may defeat a non-unique upgrade on it. On Attack: If you have the initiative, deal 2 indirect damage to a player.
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields. (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 134 - General Hux - No Terms, No Surrender

- Internal name: `general-hux#no-terms-no-surrender`
- Type: Unit
- Text: Each other friendly First Order unit gains Raid 1. (They get +1/+0 while attacking.) Action [Exhaust]: If you played a First Order card this phase, draw a card.
- Rules: Hux’s action ability still can be used as an action even if you haven't played a First Order card this phase (but no card is drawn).
- Status: Unreviewed

### 135 - Special Forces TIE Fighter

- Internal name: `special-forces-tie-fighter`
- Type: Unit
- Text: When Played: If an opponent controls more space units than you, ready this unit.
- Status: Unreviewed

### 137 - Vonreg's TIE Interceptor - Ace of the First Order

- Internal name: `vonregs-tie-interceptor#ace-of-the-first-order`
- Type: Unit
- Text: While this unit has 4 or more power, it gains Overwhelm. (When attacking an enemy unit, deal excess damage to the opponent's base.) While this unit has 6 or more power, it gains Raid 1. (It gets +1/+0 while attacking.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 138 - Decimator of Dissidents

- Internal name: `decimator-of-dissidents`
- Type: Unit
- Text: If you dealt indirect damage this phase, this unit costs 1 resource less to play. Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 139 - Dengar - Crude and Slovenly

- Internal name: `dengar#crude-and-slovenly`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Finished

### 140 - IG-2000 - Assassin's Aggressor

- Internal name: `ig2000#assassins-aggressor`
- Type: Unit
- Text: Overwhelm When Played: Deal 1 damage to each of up to 3 units.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 141 - IG-88 - Murderous Phlutdroid

- Internal name: `ig88#murderous-phlutdroid`
- Type: Unit
- Text: While an enemy unit is damaged, this unit gets +3/+0.
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Unreviewed

### 142 - Darth Vader - Scourge of Squadrons

- Internal name: `darth-vader#scourge-of-squadrons`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 143 - Devastator - Hunting the Rebellion

- Internal name: `devastator#hunting-the-rebellion`
- Type: Unit
- Text: You assign all indirect damage you deal to opponents. When Played: Deal 4 indirect damage to each opponent.
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields. All damage dealt by Devastator's "When Played" ability is dealt simultaneously.
- Status: Unreviewed

### 144 - No Disintegrations

- Internal name: `no-disintegrations`
- Type: Event
- Text: Deal damage to a non-leader unit equal to 1 less than its remaining HP.
- Status: Unreviewed

### 145 - BB-8 - Happy Beeps

- Internal name: `bb8#happy-beeps`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 146 - Massassi Tactical Officer

- Internal name: `massassi-tactical-officer`
- Type: Unit
- Text: Action [Exhaust]: Attack with a Fighter unit. It gets +2/+0 for this attack.
- Rules: If you use Massassi Tactical Officer’s ability, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 147 - Black One - Straight At Them

- Internal name: `black-one#straight-at-them`
- Type: Unit
- Text: While this unit is upgraded, it gets +1/+0. On Attack: If you control Poe Dameron (as a unit, upgrade, or leader), you may deal 1 damage to a unit.
- Status: Unreviewed

### 148 - Frisk - Vanguard Loudmouth

- Internal name: `frisk#vanguard-loudmouth`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Finished

### 149 - Red Squadron Y-Wing

- Internal name: `red-squadron-ywing`
- Type: Unit
- Text: On Attack: Deal 3 indirect damage to the defending player. (They assign 3 unpreventable damage among their base and units.)
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 150 - Biggs Darklighter - They'll Never Stop Us

- Internal name: `biggs-darklighter#theyll-never-stop-us`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Finished

### 151 - Red Five - Running the Trench

- Internal name: `red-five#running-the-trench`
- Type: Unit
- Text: On Attack: You may deal 2 damage to a damaged unit.
- Status: Unreviewed

### 152 - Tactical Heavy Bomber

- Internal name: `tactical-heavy-bomber`
- Type: Unit
- Text: On Attack: Deal indirect damage equal to this unit's power to the defending player. If a base is damaged this way, draw a card. (That player assigns that much unpreventable damage among their base and units.)
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 153 - Rebellious Hammerhead

- Internal name: `rebellious-hammerhead`
- Type: Unit
- Text: When Played: You may deal damage to a unit equal to the number of cards in your hand.
- Status: Unreviewed

### 154 - Profundity - We Fight!

- Internal name: `profundity#we-fight`
- Type: Unit
- Text: Overwhelm When Played/When Defeated: Choose a player. They discard a card from their hand. Then, if they have more cards in their hand than you, they discard a card from their hand.
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 155 - They Hate That Ship

- Internal name: `they-hate-that-ship`
- Type: Event
- Text: An opponent creates 2 TIE Fighter tokens and readies them. Then, play a Vehicle unit from your hand. It costs 3 resources less.
- Rules: Any abilities that trigger from an opponent creating the TIE Fighter tokens resolve after the event is finished resolving. If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 156 - Trench Run

- Internal name: `trench-run`
- Type: Event
- Text: Attack with a Fighter unit. For this attack, it gets +4/+0 and gains: “On Attack: Discard 2 cards from the defending player's deck. Deal unpreventable damage equal to the difference in the discarded cards' costs to this unit.”
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Always discard from the top of a deck, unless an ability specifies otherwise. If you play Trench Run, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 157 - Relentless Firespray

- Internal name: `relentless-firespray`
- Type: Unit
- Text: On Attack: Ready this unit. Use this ability only once each round.
- Status: Unreviewed

### 158 - Crackshot V-Wing

- Internal name: `crackshot-vwing`
- Type: Unit
- Text: When Played: If you control no other Fighter units, deal 1 damage to this unit.
- Status: Unreviewed

### 159 - Determined Recruit

- Internal name: `determined-recruit`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 160 - Supporting Eta-2

- Internal name: `supporting-eta2`
- Type: Unit
- Text: On Attack: You may give a ground unit +2/+0 for this phase.
- Status: Unreviewed

### 161 - Captain Tarkin - Full Forward Assault

- Internal name: `captain-tarkin#full-forward-assault`
- Type: Unit
- Text: Each friendly Vehicle unit gets +1/+0 and gains Overwhelm. (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 162 - Droid Missile Platform

- Internal name: `droid-missile-platform`
- Type: Unit
- Text: When Defeated: Deal 3 indirect damage to a player. (They assign 3 unpreventable damage among their base and units.)
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 163 - AT-DP Occupier

- Internal name: `atdp-occupier`
- Type: Unit
- Text: This unit costs 1 resource less to play for each damaged ground unit. Overwhelm (When attacking an enemy unit, deal excess damage to the opponent's base.)
- Rules: Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated. If the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.
- Status: Unreviewed

### 164 - Cham Syndulla - Rallying Ryloth

- Internal name: `cham-syndulla#rallying-ryloth`
- Type: Unit
- Text: When Played: If an opponent controls more resources than you, you may put the top card of your deck into play as a resource.
- Rules: A card put into play as a resource enters play exhausted. (ERRATA) Templating update: “Put into play as a resource” becomes “resource”. "Controls more" becomes "control fewer".
- Status: Unreviewed

### 165 - Hunting Aggressor

- Internal name: `hunting-aggressor`
- Type: Unit
- Text: Indirect damage you deal to opponents is increased by 1.
- Status: Unreviewed

### 166 - Orbiting K-Wing

- Internal name: `orbiting-kwing`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.)
- Status: Unreviewed

### 167 - Occupier Siege Tank

- Internal name: `occupier-siege-tank`
- Type: Unit
- Text: Grit (This unit gets +1/+0 for each damage on it.)
- Status: Unreviewed

### 168 - Insurgent Saboteurs

- Internal name: `insurgent-saboteurs`
- Type: Unit
- Text: Saboteur (When this unit attacks, ignore Sentinel and defeat the defender's Shields.) On Attack: You may defeat an upgrade.
- Status: Unreviewed

### 169 - Shadow Caster - Just Business

- Internal name: `shadow-caster#just-business`
- Type: Unit
- Text: When a friendly unit is defeated: You may use all of its “When Defeated” abilities again.
- Rules: Any ability whose trigger starts with "When defeated…" is considered a "When Defeated" ability.
- Status: Unreviewed

### 170 - War Juggernaut

- Internal name: `war-juggernaut`
- Type: Unit
- Text: This unit gets +1/+0 for each damaged unit. When Played: Deal 1 damage to each of any number of units.
- Status: Unreviewed

### 171 - Targeting Computer

- Internal name: `targeting-computer`
- Type: Upgrade
- Text: Attached unit gains: “You assign all indirect damage dealt by this unit.”
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 172 - Twin Laser Turret

- Internal name: `twin-laser-turret`
- Type: Upgrade
- Text: Attach to a Vehicle unit. Attached unit gains: “On Attack: Deal 1 damage to each of up to 2 units in this arena.”
- Status: Unreviewed

### 173 - Fight Fire With Fire

- Internal name: `fight-fire-with-fire`
- Type: Event
- Text: Choose a friendly unit and an enemy unit in the same arena. If you do, deal 3 damage to each of them.
- Rules: If there aren't a friendly and enemy unit in the same arena to choose, deal no damage.
- Status: Unreviewed

### 174 - Hotshot Maneuver

- Internal name: `hotshot-maneuver`
- Type: Event
- Text: Choose a friendly unit. For each of its “On Attack” abilities, deal 2 damage to a different enemy unit. Then, attack with the chosen unit.
- Rules: Each instance of 2 damage must be dealt to a different unit. All damage is dealt simultaneously. If you play Hotshot Maneuvers, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 175 - System Shock

- Internal name: `system-shock`
- Type: Event
- Text: Defeat a non-leader upgrade attached to a unit. If you do, deal 1 damage to that unit.
- Status: Unreviewed

### 176 - Shoot Down

- Internal name: `shoot-down`
- Type: Event
- Text: Deal 3 damage to a space unit. If that unit is defeated this way, you may deal 2 damage to a base.
- Status: Unreviewed

### 177 - Stay on Target

- Internal name: `stay-on-target`
- Type: Event
- Text: Attack with a Vehicle unit. For this attack, it gets +2/+0 and gains: “When this unit deals damage to a base: Draw a card.”
- Rules: If you play Stay on Target, you must attack with a unit, if able. Units must be ready in order to attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 178 - Face Off

- Internal name: `face-off`
- Type: Event
- Text: If no player has taken the initiative this phase, you may ready an enemy unit. If you do, ready a friendly unit in the same arena.
- Status: Unreviewed

### 179 - Koiogran Turn

- Internal name: `koiogran-turn`
- Type: Event
- Text: Ready a Fighter or Transport unit with 6 or less power.
- Rules: Abilities that refer to a card’s power include temporary modifiers.
- Status: Unreviewed

### 180 - Piercing Shot

- Internal name: `piercing-shot`
- Type: Event
- Text: Defeat all Shield tokens on a unit. Deal 3 damage to that unit.
- Status: Unreviewed

### 181 - Planetary Bombardment

- Internal name: `planetary-bombardment`
- Type: Event
- Text: Deal 8 indirect damage to a player. If you control a Capital Ship unit, deal 12 indirect damage instead.
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 182 - Rampart - Enjoy the Exit

- Internal name: `rampart#enjoy-the-exit`
- Type: Unit
- Text: This unit doesn't ready during the regroup phase unless its power is 4 or more.
- Status: Unreviewed

### 183 - Zygerrian Starhopper

- Internal name: `zygerrian-starhopper`
- Type: Unit
- Text: When Defeated: Deal 2 indirect damage to a player. (They assign 2 unpreventable damage among their base and units.)
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 184 - Contracted Jumpmaster

- Internal name: `contracted-jumpmaster`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 185 - Hound's Tooth - Reliable and Deadly

- Internal name: `hounds-tooth#reliable-and-deadly`
- Type: Unit
- Text: While attacking an exhausted unit that didn't enter play this phase, this unit deals combat damage before the defender.
- Rules: “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. If Hound's Tooth deals combat damage first, and the defender is defeated by that damage, it does not deal combat damage back. If it survives and has Grit, it deals bonus damage from Grit when dealing combat damage back. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 186 - Mist Hunter - The Findsman's Pursuit

- Internal name: `mist-hunter#the-findsmans-pursuit`
- Type: Unit
- Text: On Attack: If you played a Bounty Hunter or Pilot card this phase, you may draw a card.
- Status: Unreviewed

### 187 - Bossk - Hunt By Instinct

- Internal name: `bossk#hunt-by-instinct`
- Type: Unit
- Text: On Attack: Exhaust the defender and deal 1 damage to it (if it's a unit).
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 188 - Moff Gideon - I Know Everything

- Internal name: `moff-gideon#i-know-everything`
- Type: Unit
- Text: When this unit deals combat damage to an opponent's base: Each unit that opponent plays this phase costs 1 resource more.
- Rules: The cost increase from Gideon's ability remains active even if he is defeated. “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Unreviewed

### 189 - Boba Fett - Feared Bounty Hunter

- Internal name: `boba-fett#feared-bounty-hunter`
- Type: Unit
- Text: Shielded
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Unreviewed

### 190 - Techno Union Transport

- Internal name: `techno-union-transport`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.)
- Status: Unreviewed

### 191 - Invincible - Naval Adversary

- Internal name: `invincible#naval-adversary`
- Type: Unit
- Text: If you control a unique Separatist card, this unit costs 1 resource less to play. When you deploy a leader: You may return a non-leader unit that costs 3 or less to its owner's hand.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that return a card to hand must choose a card in play unless otherwise specified. (ERRATA) Templating update: “Unique” becomes “<uq>”.
- Status: Unreviewed

### 192 - In Debt to Crimson Dawn

- Internal name: `in-debt-to-crimson-dawn`
- Type: Upgrade
- Text: When attached unit readies: Exhaust it unless its controller pays 2 resources.
- Status: Unreviewed

### 193 - I Have You Now

- Internal name: `i-have-you-now`
- Type: Event
- Text: Attack with a Vehicle unit. Prevent all damage that would be dealt to it during this attack.
- Rules: If you play I Have You Now, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 194 - Heartless Tactics

- Internal name: `heartless-tactics`
- Type: Event
- Text: Exhaust a unit and give it –2/–0 for this phase. Then, if it has 0 power and isn't a leader, you may return it to its owner's hand.
- Rules: If a unit's power is modified below 0, it is considered to have 0 power.
- Status: Unreviewed

### 195 - Cat and Mouse

- Internal name: `cat-and-mouse`
- Type: Event
- Text: Exhaust an enemy unit. If you do, ready a friendly unit in the same arena with power equal to or less than that enemy unit.
- Status: Unreviewed

### 196 - Dagger Squadron Pilot

- Internal name: `dagger-squadron-pilot`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 197 - Anakin Skywalker - I'll Try Spinning

- Internal name: `anakin-skywalker#ill-try-spinning`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. A unit must survive an attack to trigger its “when this unit completes an attack” abilities. When Attack Ends abilities trigger when combat damage is dealt. The attacker doesn’t need to survive for the ability to trigger unless the ability says otherwise. The unit isn’t considered to be attacking when these abilities resolve.
- Status: Finished

### 198 - Fireball - An Explosion With Wings

- Internal name: `fireball#an-explosion-with-wings`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) When the regroup phase starts: Deal 1 damage to this unit.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 199 - Blade Squadron B-Wing

- Internal name: `blade-squadron-bwing`
- Type: Unit
- Text: When Played: If another player controls 3 or more exhausted units, give a Shield token to a unit.
- Status: Unreviewed

### 200 - Shuttle Tydirium - Fly Casual

- Internal name: `shuttle-tydirium#fly-casual`
- Type: Unit
- Text: On Attack: Discard a card from your deck. If it has an odd cost, you may give an Experience token to another unit.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Always discard from the top of a deck, unless an ability specifies otherwise. Zero is an even number.
- Status: Unreviewed

### 201 - Ahsoka Tano - Chasing Whispers

- Internal name: `ahsoka-tano#chasing-whispers`
- Type: Unit
- Text: When Played: An opponent discards a card from their hand. If it's a unit, you may exhaust a unit.
- Rules: If there are multiple opponents, the controlling player chooses which one will be “an opponent.”
- Status: Unreviewed

### 202 - Black Squadron Scout Wing

- Internal name: `black-squadron-scout-wing`
- Type: Unit
- Text: When you play an upgrade on this unit: You may attack with this unit. It gets +1/+0 for this attack.
- Rules: Attaching an upgrade or creating and attaching a token upgrade do not trigger Black Squadron Scout Wing's ability. Units must be ready in order to attack.
- Status: Unreviewed

### 203 - Han Solo - Has His Moments

- Internal name: `han-solo#has-his-moments`
- Type: Unit
- Text: Ambush
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready. Units must be ready in order to attack. “Combat damage” is only the damage dealt during the “deal combat damage” step of an attack. If the Millennium Falcon piloted by Han deals combat damage first, and the defender is defeated by that damage, it does not deal combat damage back. If it survives and has Grit, it deals bonus damage from Grit when dealing combat damage back. (ERRATA) Templating update: “Defender” becomes “defending unit”.
- Status: Unreviewed

### 204 - Home One - On My Mark

- Internal name: `home-one#on-my-mark`
- Type: Unit
- Text: If an opponent controls 3 or more space units, this unit costs 3 resources less to play. Ambush
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 205 - Commence Patrol

- Internal name: `commence-patrol`
- Type: Event
- Text: Put another card in a discard pile on the bottom of its owner's deck. If you do, create an X-Wing token.
- Status: Unreviewed

### 206 - Fly Casual

- Internal name: `fly-casual`
- Type: Event
- Text: Ready a Vehicle unit. It can't attack bases for this phase.
- Rules: Units that can’t attack bases can still damage bases through other abilities, like Overwhelm.
- Status: Unreviewed

### 207 - Jam Communications

- Internal name: `jam-communications`
- Type: Event
- Text: Look at an opponent's hand and discard an event from it.
- Status: Unreviewed

### 208 - Never Tell Me the Odds

- Internal name: `never-tell-me-the-odds`
- Type: Event
- Text: Discard 3 cards from an opponent's deck and 3 cards from your deck. Deal damage to a unit equal to the number of cards with an odd cost discarded this way.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Always discard from the top of a deck, unless an ability specifies otherwise. Zero is an even number.
- Status: Unreviewed

### 209 - It's a Trap

- Internal name: `its-a-trap`
- Type: Event
- Text: If an opponent controls more space units than you, ready each space unit you control.
- Status: Unreviewed

### 210 - The Mandalorian - Weathered Pilot

- Internal name: `the-mandalorian#weathered-pilot`
- Type: Unit
- Text: When played as a unit: Exhaust up to 2 ground units.
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Unreviewed

### 211 - Independent Smuggler

- Internal name: `independent-smuggler`
- Type: Unit
- Text: Raid 1 (This unit gets +1/+0 while attacking.)
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Unreviewed

### 212 - Republic Y-Wing

- Internal name: `republic-ywing`
- Type: Unit
- Text: (none)
- Status: Finished

### 213 - Sidon Ithano - The Crimson Corsair

- Internal name: `sidon-ithano#the-crimson-corsair`
- Type: Unit
- Text: When played as a unit: You may attach this unit as an upgrade to an enemy Vehicle unit without a Pilot on it.
- Rules: Pilots are considered units while not in play. Sidon Ithano doesn't have the Piloting keyword and can only attach to a unit as a Pilot through his "When Played" ability.
- Status: Unreviewed

### 214 - X-34 Landspeeder

- Internal name: `x34-landspeeder`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 215 - BoShek - Charismatic Smuggler

- Internal name: `boshek#charismatic-smuggler`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Always discard from the top of a deck, unless an ability specifies otherwise. Zero is an even number.
- Status: Finished

### 216 - Contracted Hunter

- Internal name: `contracted-hunter`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) When the regroup phase starts: Defeat this unit.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 217 - Death Space Skirmisher

- Internal name: `death-space-skirmisher`
- Type: Unit
- Text: When Played: If you control another space unit, you may exhaust a unit.
- Status: Unreviewed

### 218 - Guerilla Soldier

- Internal name: `guerilla-soldier`
- Type: Unit
- Text: When Played: Deal 3 indirect damage to a player. If a base is damaged this way, ready this unit. (That player assigns 3 unpreventable damage among their base and units.)
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 219 - Rafa Martez - Shrewd Sister

- Internal name: `rafa-martez#shrewd-sister`
- Type: Unit
- Text: When Played/On Attack: Deal 1 damage to a friendly unit and ready a resource.
- Status: Unreviewed

### 220 - Skyway Cloud Car

- Internal name: `skyway-cloud-car`
- Type: Unit
- Text: When Defeated: You may return a non-leader unit with 2 or less power to its owner's hand.
- Rules: Abilities that refer to a card’s power include temporary modifiers. Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 221 - Stolen AT-Hauler

- Internal name: `stolen-athauler`
- Type: Unit
- Text: When Defeated: Choose an opponent. For this phase, they may play this unit from its owner's discard pile for free.
- Rules: “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs. An opponent can't play Stolen AT-Hauler if they can't take an action to play it, such as if they have already taken the initiative or the unit is defeated during the regroup phase.
- Status: Unreviewed

### 222 - Kimogila Heavy Fighter

- Internal name: `kimogila-heavy-fighter`
- Type: Unit
- Text: When Played: Deal 3 indirect damage to a player. Exhaust each unit damaged this way. (That player assigns 3 unpreventable damage among their base and units.)
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 223 - Razor Crest - Ride For Hire

- Internal name: `razor-crest#ride-for-hire`
- Type: Unit
- Text: When a Pilot attaches to this unit: You may return a non-leader unit that costs 2 or less or an exhausted non-leader unit that costs 4 or less to its owner's hand.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 224 - Shadowed Hover Tank

- Internal name: `shadowed-hover-tank`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 225 - Corporate Light Cruiser

- Internal name: `corporate-light-cruiser`
- Type: Unit
- Text: Ambush (When you play this unit, it may attack an enemy unit.) Raid 1 (This unit gets +1/+0 while attacking.)
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 226 - Radiant VII - Ambassadors' Arrival

- Internal name: `radiant-vii#ambassadors-arrival`
- Type: Unit
- Text: Each enemy non-leader unit gets –1/–0 for each damage on it. When Played: Deal 5 indirect damage to a player.
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 227 - Superheavy Ion Cannon

- Internal name: `superheavy-ion-cannon`
- Type: Upgrade
- Text: Attach to a Capital Ship or Transport unit. Attached unit gains: “On Attack: You may exhaust a non-leader unit the defending player controls. If you do, deal indirect damage equal to its power to that player.”
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 228 - Barrel Roll

- Internal name: `barrel-roll`
- Type: Event
- Text: Attack with a space unit. After completing this attack, you may exhaust a space unit.
- Rules: If you play Barrel Roll, you must attack with a unit, if able. Units must be ready in order to attack. Resolve all triggered abilities from the attack before exhausting a unit.
- Status: Unreviewed

### 229 - Diversion

- Internal name: `diversion`
- Type: Event
- Text: Give a unit Sentinel for this phase. (Units in its arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 230 - Electromagnetic Pulse

- Internal name: `electromagnetic-pulse`
- Type: Event
- Text: Deal 2 damage to a Droid or Vehicle unit and exhaust it.
- Status: Unreviewed

### 231 - Punch It

- Internal name: `punch-it`
- Type: Event
- Text: Attack with a Vehicle unit. It gets +2/+0 for this attack.
- Rules: If you play Punch It, you must attack with a unit, if able. Units must be ready in order to attack.
- Status: Unreviewed

### 232 - Jump to Lightspeed

- Internal name: `jump-to-lightspeed`
- Type: Event
- Text: Return a friendly space unit and any number of non-leader upgrades on it to their owners' hands. The next time you play a copy of that unit this phase, you may play it for free.
- Rules: Any upgrades on the unit not returned to their owners' hands are defeated. “Play for free” ignores all resource costs, including the aspect penalty, but not other additional costs. Abilities that return a card to hand must choose a card in play unless otherwise specified.
- Status: Unreviewed

### 233 - Sweep the Area

- Internal name: `sweep-the-area`
- Type: Event
- Text: Return up to 2 non-leader units in the same arena with a combined cost 3 or less to their owners' hands.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.
- Status: Unreviewed

### 234 - Torpedo Barrage

- Internal name: `torpedo-barrage`
- Type: Event
- Text: Deal 5 indirect damage to a player. (They assign 5 unpreventable damage among their base and units.)
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 235 - Commandeer

- Internal name: `commandeer`
- Type: Event
- Text: Take control of a non-leader Vehicle unit that costs 6 or less without a Pilot on it. If you do, ready it. At the start of the next regroup phase, return that unit to its owner's hand.
- Rules: Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers. Commandeer only returns the unit to hand if it's in play.
- Status: Unreviewed

### 236 - Indoctrinated Conscript

- Internal name: `indoctrinated-conscript`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 237 - TIE Bomber

- Internal name: `tie-bomber`
- Type: Unit
- Text: On Attack: Deal 3 indirect damage to the defending player. (They assign 3 unpreventable damage among their base and units.)
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 238 - Sith Trooper

- Internal name: `sith-trooper`
- Type: Unit
- Text: On Attack: This unit gets +1/+0 for this attack for each damaged unit the defending player controls.
- Status: Unreviewed

### 239 - TIE Dagger Vanguard

- Internal name: `tie-dagger-vanguard`
- Type: Unit
- Text: When Played: You may deal 2 damage to a damaged unit.
- Status: Unreviewed

### 240 - Fett's Firespray - Feared Silhouette

- Internal name: `fetts-firespray#feared-silhouette`
- Type: Unit
- Text: When Played/On Attack: Deal 1 indirect damage to a player. If you control Boba Fett (as a unit, upgrade, or leader), deal 2 indirect damage instead. (They assign unpreventable damage among their base and units.)
- Rules: A player can't assign more indirect damage to a unit than it has remaining HP. Indirect damage is unpreventable and ignores Shields.
- Status: Unreviewed

### 241 - Rogue-class Starfighter

- Internal name: `rogueclass-starfighter`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 242 - Shuttle ST-149 - Under Krennic's Authority

- Internal name: `shuttle-st149#under-krennics-authority`
- Type: Unit
- Text: Shielded (When you play this unit, give a Shield token to it.) When Played/When Defeated: You may take control of a token upgrade on a unit and attach it to a different eligible unit.
- Rules: You can use Shuttle ST-149's ability to attach an upgrade to itself or attach its Shield to another unit.
- Status: Unreviewed

### 243 - Quasar TIE Carrier

- Internal name: `quasar-tie-carrier`
- Type: Unit
- Text: On Attack: Create a TIE Fighter token.
- Status: Unreviewed

### 244 - There Is No Escape

- Internal name: `there-is-no-escape`
- Type: Event
- Text: Choose up to 3 units. Those units lose all abilities and can't gain abilities for this round.
- Rules: (ERRATA) Templating update: “Lose all abilities and can't gain abilities” becomes “lose all abilities”.
- Status: Unreviewed

### 245 - R2-D2 - Artooooooooo!

- Internal name: `r2d2#artooooooooo`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either. R2-D2's ability overrides the usual restriction of the Piloting keyword and Pilot leader deploy ability that specifies they must be attached to a unit without a Pilot on it. If R2-D2 is attached to a unit, another Pilot still can be played or deployed on that unit. Multiple such abilities are additive.
- Status: Finished

### 246 - Hopeful Volunteer

- Internal name: `hopeful-volunteer`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 247 - Resistance X-Wing

- Internal name: `resistance-xwing`
- Type: Unit
- Text: While this unit has a Pilot on it, it gets +1/+1.
- Status: Unreviewed

### 248 - Dilapidated Ski Speeder

- Internal name: `dilapidated-ski-speeder`
- Type: Unit
- Text: When Played: Deal 3 damage to this unit.
- Status: Unreviewed

### 249 - Millennium Falcon - Get Out And Push

- Internal name: `millennium-falcon#get-out-and-push`
- Type: Unit
- Text: You may play or deploy 1 additional Pilot on this unit. This unit gets +1/+0 for each Pilot on it.
- Rules: Millennium Falcon's ability overrides the usual restriction of the Piloting keyword and Pilot leader deploy ability that specifies they must be attached to a unit without a Pilot on it. If Millennium Falcon has a Pilot attached to it, another Pilot still can be played or deployed on it. Multiple such abilities are additive.
- Status: Unreviewed

### 250 - Sabine's Masterpiece - Crazy Colorful

- Internal name: `sabines-masterpiece#crazy-colorful`
- Type: Unit
- Text: On Attack: If you control a: <bullet>Vigilance unit, heal 2 damage from a base. Command unit, give an Experience token to a unit. Aggression unit, deal 1 damage to a unit or a base. Cunning unit, exhaust or ready a resource.</bullet>
- Status: Unreviewed

### 251 - Jedi Light Cruiser

- Internal name: `jedi-light-cruiser`
- Type: Unit
- Text: (none)
- Status: Finished

### 252 - Tantive IV - Fleeing the Empire

- Internal name: `tantive-iv#fleeing-the-empire`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.) When Played: Create an X-Wing token.
- Status: Unreviewed

### 253 - Coordinated Front

- Internal name: `coordinated-front`
- Type: Event
- Text: You may give a ground unit +2/+2 for this phase. You may give a space unit +2/+2 for this phase.
- Status: Unreviewed

### 254 - Dedicated Wingmen

- Internal name: `dedicated-wingmen`
- Type: Event
- Text: Create 2 X-Wing tokens.
- Status: Unreviewed

### 255 - Sullustan Spacer

- Internal name: `sullustan-spacer`
- Type: Unit
- Rules: Pilots are considered units while not in play. If you use a "play a unit" ability, you may only play a Pilot as a unit. If you use a "play an upgrade" ability, you may only play a Pilot as an upgrade. If you use a "play a card" ability, you may do either.
- Status: Finished

### 256 - Swarming Vulture Droid

- Internal name: `swarming-vulture-droid`
- Type: Unit
- Text: A deck can have up to 15 copies of this card. This unit gets +1/+0 for each other friendly Swarming Vulture Droid.
- Status: Unreviewed

### 257 - Flanking Fang Fighter

- Internal name: `flanking-fang-fighter`
- Type: Unit
- Text: While you control another Fighter unit, this unit gains Raid 2. (It gets +2/+0 while attacking.)
- Status: Unreviewed

### 258 - Corellian Freighter

- Internal name: `corellian-freighter`
- Type: Unit
- Text: Sentinel (Units in this arena can't attack your non-Sentinel units or your base.)
- Status: Unreviewed

### 259 - Retrofitted Airspeeder

- Internal name: `retrofitted-airspeeder`
- Type: Unit
- Text: Ambush This unit can attack space units. While attacking a space unit, this unit gets –1/–0.
- Rules: Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.
- Status: Unreviewed

### 260 - Death Star Plans

- Internal name: `death-star-plans`
- Type: Upgrade
- Text: When attached unit is attacked: The attacking player takes control of this upgrade and attaches it to a unit they control. Attached unit gains: “The first unit you play each round costs 2 resources less.”
- Rules: “When attached unit is attacked” triggers at the same time as “On Attack” abilities. Multiple players can benefit from the discount ability in the same round. On Defense abilities trigger when this unit is chosen as the defender for an attack, in the same window as the attacker's On Attack abilities.
- Status: Unreviewed

### 261 - Attack Run

- Internal name: `attack-run`
- Type: Event
- Text: Attack with 2 space units (one at a time).
- Rules: If you play Attack Run, you must attack with two units, if able. Units must be ready in order to attack. Fully resolve the first attack, including all triggers, before beginning the second attack.
- Status: Unreviewed

### 262 - Evasive Maneuver

- Internal name: `evasive-maneuver`
- Type: Event
- Text: Exhaust a unit.
- Status: Unreviewed

## Tokens

### Token - TIE Fighter

- Internal name: `tie-fighter`
- Type: Token, Unit
- Text: (none)
- Status: Finished

### Token - X-Wing

- Internal name: `xwing`
- Type: Token, Unit
- Text: (none)
- Status: Finished

