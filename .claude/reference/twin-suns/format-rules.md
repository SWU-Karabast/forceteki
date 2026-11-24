# Format rules: Twin Suns and Always Two (Doubles)

Engine-level behaviors to test once (Sentinel as described for Doubles, Coordinate, Restore, Exploit, Overwhelm, any-number choices): see `engine-test-notes.md`.

Purpose: the rules that are unique to each multiplayer format, so card text can be mined for phrases whose meaning changes in these formats. This replaces the old tag catalog (kept in `archive_old/`).

Sources and confidence:
- **Twin Suns**: Comprehensive Rules v7.0 §11 (multiplayer) and §12 (Twin Suns), plus the judge rulings in `archive_old/rules-rulings.md` (Anthony, 2026-10-06). Official.
- **Always Two (Doubles)**: the announcement-stream slides and verbal clarifications (2026-11-18), plus the official one-page overview "Game Mode Overview: Doubles" (https://cdn.starwarsunlimited.com//SWH_OP_Doubles_Rules_f3d3a07209.pdf, published 2026-11-18; its rules are summarized in "Official Doubles overview" below). That overview is short; the full Comprehensive Rules for the mode are still not published. Anything marked *(open)* is unknown. Update this file as rules are published.

## Judge rulings from the card review (Anthony, 2026-11-18)
These supersede the "open" items and assumptions elsewhere in this file for the matching topics.

| # | Topic | Ruling |
|---|---|---|
| R1 | Twin Suns: static condition or comparison that says "an opponent" (no choice step) | **Any opponent qualifies.** The condition is true if at least one opponent meets it; no opponent is chosen. (This differs from abilities that choose "an opponent" when used, where the controller chooses and the choice persists.) Applies to the conditional wording on cards such as Corrupt Politician and Dedra Meero in place of the earlier "controller chooses" reading. |
| R2 | Always Two: the same condition or comparison with two enemies | Same as Twin Suns (R1): each enemy is an individual opponent and either one qualifying is enough. Nothing is summed across the two enemies; the teammate is never an opponent. |
| R3 | Always Two: reveal, look at, disclose | A "look at" is private to the player (they may tell their teammate). A reveal is seen by everyone, including the teammate. Disclose uses only your own hand and aspects; a teammate's hand or aspects never count. |
| R4 | Always Two: "an opponent" | Confirmed: the controller chooses either enemy player; the teammate is never an opponent. |
| R5 | Always Two: effects that say "a unit" / "a base" without "enemy" | A teammate's units and base are legal targets. An attack can only target an enemy unit or base, never a teammate's. |
| R6 | Always Two: "you" and shared turns | "You" is personal (your own plays, control, resources). The exception is "have the initiative", which is the team's: it applies when the teammate took it. |

| R7 | Twin Suns: "the player to their right" | Taken from each player's own perspective: it is the player **before them in turn order** (the neighbour on their counterclockwise side). Turns pass clockwise, so the player to your left acts after you and the player to your right acts before you. |

| R8 | Always Two: seating and "the player to their right" | The two teams sit across from each other, so teammates sit next to each other. "The player to their right" is taken from each player's own perspective: for one player on each team the player to their right is their **teammate**, and for the other it is an **enemy**. (Which seat each player takes within their team is not yet defined.) |

| R9 | Both formats: choices made in turn by each player | Player order always runs clockwise. Where each player makes a choice and the card gives no other start (e.g. Merciless Contest), it starts with the player who played the card. Rhydonium Detonation's own clarification says the same ("starting with the active player"). Where a card says "in player order", the official definition applies: it begins with the player to the active player's left and continues clockwise. In Always Two this follows the seating in R8. |

| R10 | Always Two: base damage | Base damage counts up toward the base's health and can exceed it. A player whose base is at or past its health is not eliminated and can keep doing things that put more damage on their base, such as paying "deal damage to your base" costs (e.g. playing an event under Saw Gerrera). Damage can be healed back down while the teammate's base is still healthy. |

| R11 | Always Two: "each player" | Includes the teammate (a teammate is another player in the game). Effects that are conditional on an *opponent* acting (e.g. "when an opponent draws") are not triggered by the teammate. Example: Crosshair — I've Changed has every player, teammate included, draw a card, but the teammate's draw does not cause the 2 damage. |

| R12 | Always Two: "a player" | Any player can be chosen: an enemy, the controller, or the teammate. This holds for every card that says "a player" (not "an opponent"). Example: Radiant VII — Ambassadors' Arrival's 5 indirect damage can be dealt to any player. |

| R13 | Always Two: "if you've (done something) this phase" | Counts only what you, or your own cards, did. A teammate's actions and cards do not count for "you". Example: Tempest Assault ("if you've dealt damage to an enemy base this phase") is not enabled by damage a teammate's units dealt. (Consistent with R6 and with the official overview: you do not own or control a teammate's cards. The initiative remains the team's.) |

| R14 | Always Two: "an opponent ... their (nth) card/action" | Counted per individual enemy player, not per team. Example: Ki-Adi-Mundi — Composed and Confident triggers on an enemy player's own second card this phase; cards played by the other enemy are not added in. |

| R15 | Always Two: Exploit | Exploit can only use (defeat) the player's own units. A teammate's units cannot be exploited, even though they are "friendly". Applies to every Exploit card (an engine-level rule). Example: The Invasion of Christophsis. |

| R16 | Both formats: "an opponent ... their previous action" | "Their" is the opponent who did the thing: it means that opponent's own most recent action this phase, even if other players acted in between. In Always Two this is per individual enemy player, not the team's last action (same per-player reading as R14). Example: Fully Armed and Operational. |

| R17 | Both formats: comparisons over "enemy units" | A comparison or total over "enemy units" (e.g. "the highest cost among enemy units") pools **all** opponents' units together, in both Twin Suns and Always Two. It is not evaluated per opponent. Example: Dengar — Take Your Shot. (Contrast with R14/R16, which are about "an opponent ... their ...", where it is per individual opponent.) |

| R18 | Both formats: "if [condition] an opponent, [effect on] that opponent" | When a card's effect refers back to the opponent in its condition (e.g. "if you control more space units than an opponent, deal 4 damage to a ground unit that opponent controls"), the controller chooses an opponent for whom the condition is true (one with fewer units, in this example), and the effect applies to that opponent. In Always Two the choice is between the two enemies; the teammate is never chosen. Example: Air Superiority. (Refines R1: a condition with no "that opponent" follow-up is true if any opponent qualifies.) |

| R19 | Both formats: Restore | Restore always heals the base of the **controller of the unit that has Restore**, however the keyword was gained. In Always Two, a teammate's unit with a granted Restore heals the teammate's base, not the base of the player whose card granted it. Engine-level rule; examples: Home One, Coronet, Yaddle, Obi-Wan, In Defense of Kamino, Figure of Unity, Mother Talzin. |

| R20 | Always Two: "you" in an ability granted to a unit | In an ability that a card grants to a unit, "you" is the controller of the unit that has the ability. A teammate's unit with a granted "When Defeated: You may draw a card" makes the teammate draw, not the player whose card granted it. Ruled for General Krell — Heartless Tactician; the same shape on other cards (Nala Se, Snoke, Payroll Heist) is confirmed card by card. |

| R21 | Always Two: "friendly resource" | The teammate's resources are friendly resources (the user's presumption; confirm if it conflicts with the full rules). They gain granted abilities (Tech — Source of Insight: the teammate uses a gained Smuggle from their own resources, paying with their own resources, since you can never pay for or play a teammate's cards) and can be chosen by effects that ready or otherwise act on a "friendly resource" (San Hill — Chairman of the Banking Clan may ready a teammate's resource). Sundari Palace's regroup defeat is still unknown (tagged "Always Two: Rules Unknown"). |

| R22 | Always Two: exchanging control with a teammate's unit | When "exchange control" is done using a teammate's unit as the chosen friendly unit, each unit goes to the other unit's controller: the enemy unit goes to the teammate (the former controller of the unit you chose), not to the player who played the event. Any Credit tokens for Doublecross go to whoever takes control of the lower-cost unit. Examples: Choose Sides, Doublecross. |

| R23 | Always Two: "friendly Credit tokens" | A teammate's Credit tokens are friendly Credit tokens in every use: they are counted (Backed by the Hutts) and can be defeated as a cost or effect (Han Solo — I Got a Really Good Feeling, Cad Bane — Now It's My Turn). Ruled for Credit tokens; other kinds of friendly tokens are not covered by this ruling. |

| R24 | Always Two: "friendly" includes the teammate's cards (general, with exceptions to be listed) | Most effects, conditions and costs that say "friendly" apply to the teammate's cards as well as your own (the user's ruling: "most of those would apply to teammates"). Applied now to conditions about friendly units leaving play or being defeated this phase (Disturbance in the Force, Last Words, Bail Organa — Doing Everything He Can, Moff Gideon) and to friendly Battle Droid tokens (Roger Roger). Exceptions already known: playing a teammate's cards, attacking with their units, paying with their resources, and Exploit (R15). Costs that exhaust, defeat or return a friendly card can also use the teammate's cards (the user: "I think these probably apply"): Emperor Palpatine, Tomb of Eilram, Fennec Shand, Vane, Jabba — Crime Boss, Alliance Outpost, and Darth Vader — No One to Stop Us. |

| R25 | Always Two: using a teammate's unit's ability through your own card | When your card lets you use a "When Defeated" (or similar) ability that belongs to a teammate's unit, you are the player using the ability, so "you" in that ability is **you**, the controller of the card that uses it. Example: with Chimaera — Reinforcing the Center, a teammate's Night Sister Warrior's "draw a card" makes Chimaera's controller draw. Applied to Shadow Caster — Just Business by the same pattern. (This is the opposite of R20, which covers an ability that a card grants to a unit: there "you" is the unit's controller.) Only the controller of a card can use that card's own action abilities (e.g. Bail Organa — Rebel Councilor). Fire Across the Galaxy is still unknown. |

| R26 | Both formats: effects that ready "a resource" / "N resources" with no qualifier | With no qualifier ("friendly", "your", "an opponent's"), the effect can ready any player's resource: your own, the teammate's in Always Two, or an opponent's. (Cards that say "friendly resource" follow R21.) Examples: Rafa Martez, Coruscant Dissident, Leia Organa — Defiant Princess, R2-D2 — The First Protagonist, Boba Fett — Compensated If He Dies, Corona Squadron X-Wing, Emperor's Messenger, Second Sister. |

| R27 | Always Two: taking control of a teammate's unit | An effect that says "take control of a unit" (no "enemy") can take control of the teammate's unit: it moves to the player who played the card, and the owner regains it as the card says (Rehabilitation at regroup, Traitorous on detach). Applied to Rehabilitation and Traitorous. Pantoran Starship Thief also involves attaching as a Pilot, which is unknown, so it is tagged "Always Two: Rules Unknown". |

| R28 | Always Two: a base at or past its health | Its remaining HP is 0 (never negative), so effects that use remaining HP see 0 (e.g. Supremacy — Destroy the Resistance deals 0). Damage can still be dealt to it, and "when this unit deals combat damage to a base" abilities still trigger (Blockade Runner). |

| R29 | Both formats: choosing several "enemy" cards | When a card has you reveal, look at or choose several enemy cards (e.g. "3 enemy resources"), they can come from any combination of opponents (Twin Suns) or enemies (Always Two), unless the card says they must belong to one player. Where the card then refers to "its controller", that is each card's own controller. Examples: Scanning Officer, Elia Kane — False Convert. |

| R30 | Both formats: "choose any number of players / opponents / bases" | Any subset can be chosen: none, one, several, or all legal choices, including the controller where "players" allows it and, in Always Two, the teammate (R12). Each chosen target is affected once. **Engine requirement:** the current engine is not set up for arbitrary subsets of players, so Twin Suns and Always Two both need full support and tests for every combination (the user's note). Examples: Yoda — Old Master, Coruscanti Spy, Rancor Keeper. "Choose 2 players" (an exact count) works the same way for any N legal players: Chio Fain, Count Dooku — Offering Aid. |

| R31 | Always Two: Coordinate | Coordinate counts only units controlled by the same player, not the team as a whole: a teammate's units do not count toward it. Applies to the keyword and to Coordinate granted by another card. An engine-level rule to be tested once (see `engine-test-notes.md`); no per-card notes needed. |
| R32 | Both formats: unqualified "a base" | "A base" with no qualifier (not "enemy", "friendly", "your", "defending") has no restriction on which base it targets: any base in play, including the controller's own, the teammate's and every opponent's. Do not write a note that just says the base can be any base. Keep a base line only when the card does something specific with it (a remaining-HP condition, elimination, the base's controller draws, the defending player). |
| R33 | Both formats: "another unit", "another Unique unit", "a unit" and similar with no control qualifier | No format-specific handling and no note: the choice is open to any unit, the same as in 1v1, and the existing 1v1 suite already tests it. A note is needed only when the card names who controls the card ("friendly", "enemy", "your", "an opponent's") or does something with players or bases that 1v1 cannot show. (Anthony, 2026-11-19, on Hera Syndulla — Spectre Two.) |
| R34 | Always Two: upgrades and discounts | An upgrade can be played on any unit, including the teammate's, unless the card restricts it (for example "Attach to a friendly unit"). A discount on a card applies to whoever is playing it, unless the text limits it to its controller (for example Guardian of the Whills: "the first unit YOU play on this card", so an upgrade the teammate plays does not count). (Anthony, 2026-11-19, on Faith in the Empire and The Way of the Mand'alor.) |
| R35 | Both formats: choosing "an enemy unit" | Twin Suns: the unit can be any opponent's unit, but this is not worth a note on each card (Anthony, 2026-11-22: the phrase is irrelevant, removed everywhere). Always Two: only an enemy's unit can be chosen, never the teammate's; every card with a chosen enemy unit keeps that line. (Anthony, 2026-11-19.) |
| R36 | Always Two: Pilots | A Pilot can be played or deployed (a leader with Piloting) as an upgrade onto a teammate's Vehicle, as well as onto your own. The player who plays or deploys the Pilot controls the upgrade; the Vehicle stays under the control of whoever controlled it before. Whose triggers and "you" apply to the Pilot's own text and to the abilities it grants is still partly open: keep those questions as Open lines. (Anthony, 2026-11-19.) |
| R37 | Twin Suns: elimination and owned cards | When a player is eliminated, every card that player owns is removed from the game immediately, whoever controls it. Whether effects still resolve mid-way is not settled. A card the eliminated player controls but does not own goes to its owner's discard pile (R42). (Anthony, 2026-11-19; CR v8.0 11.3.1.) |
| R38 | Twin Suns: removal by elimination is not leaving play | Cards removed from the game because their owner was eliminated are not counted as having left play, so "when this unit leaves play" and "if a unit left play this phase" are not triggered or satisfied by them. (Anthony, 2026-11-19.) |
| R39 | Twin Suns: an effect that finishes a player's base | If an effect eliminates a player partway through, most of the rest of the effect that refers to that player's cards fizzles, because those cards are gone (for example Maul cannot take control of a unit of the player whose base his combat damage just finished). Cards are reviewed one by one for the exceptions. (Anthony, 2026-11-19.) |
| R40 | Both formats: "an opponent" in a condition of a resolved effect | In an effect that resolves (When Played, On Attack, an event) and compares or checks "an opponent" ("if you have fewer cards in hand than an opponent", "if an opponent controls more units than you"), the controlling player chooses which opponent (Always Two: which enemy) the condition is checked against, and may choose one for whom it is not met. This replaces R1 and R2 for such effects. Believed, not yet confirmed officially; applies to Broken Horn, Old Access Codes, It's a Trap, Theed Security, Commence the Festivities, You're All Clear, Kid, Air Superiority. Whether Broken Horn's two comparisons share one choice is still open. Constant abilities ("While an opponent controls...", cost reductions, enters play ready) are not covered and keep R1/R2 for now. (Anthony, 2026-11-20.) |
| R41 | Both formats: who collects a Bounty | A Bounty is always collected by an opponent of the player who controls the unit. If the controller defeats the unit (or, in Always Two, the controller's teammate does), the player who defeated it chooses which opponent (Always Two: which enemy) collects it. Anthony, 2026-11-23; believed, not confirmed. This is tested once under the keyword, not per card. |
| R42 | Twin Suns: a card moved to its owner's discard pile by an elimination | A unit (or other card) the eliminated player controls but does not own is placed in its owner's discard pile (CR v8.0 11.3.1). That move is not a defeat and is not leaving play, so no When Defeated, Bounty or leaves-play trigger happens, except that an effect lasting "until it leaves play" (Galen Erso, Regional Governor) does end. A "for this phase" or regroup-return effect on it simply ends (Change of Heart: the unit does not return at regroup). Anthony, 2026-11-23. |
| R43 | Twin Suns: eliminating yourself | The player who brings a base to 0 HP heals 5 from their own base after the elimination is resolved. If a player eliminates themself through an ability (Lethal Crackdown), no player heals (CR v8.0 12.6.2). Anthony, 2026-11-23. Engine-level: tested once, not per card. |
| R44 | Both formats: who resources a defeated card | A When Defeated ability that puts the defeated card into a resource zone (Expendable Mercenary) is resolved by the player who controlled the unit when it was defeated, and the card enters that player's resource zone, whoever owns it. Anthony, 2026-11-23. |

Deferred rulings (still open): Always Two "When you take the initiative" with a teammate taking it (unknown; the cards stay as open questions), Always Two indirect damage assigned to a base past its health (unknown; best reading: units can never be over-assigned, but a base might be, with the excess staying on it; CR v9.0 8.35.3 caps units only), Twin Suns attacker takes control of the defender mid-attack, whether an eliminated player can share a win; Always Two base at 0 HP edge cases, seating and choice order, whether a teammate's plays satisfy "you play" effects beyond R6.

## Twin Suns (3-4 players, free-for-all)

| Area | Rule |
|---|---|
| Players | 3 or 4, each with their own deck, base and **two leaders**. Seat order random, turns clockwise. |
| "Opponent" | "An opponent" = any one other player, chosen by the player using the ability; the choice persists through the ability unless a later clause chooses again. "Each opponent" / "opponents" = all other (non-eliminated) players. |
| "Enemy" | A card any opponent controls. |
| "Each player" | Every non-eliminated player, including the controller. |
| Eliminated players | Not players for any effect. |
| Elimination | Base at 0 HP eliminates that player immediately. Owned cards are removed (not defeated, no triggers); captured units return to their owners; their upgrades on others' units are removed; initiative returns to center; Blast/Plan counters go to center but stay taken. Controlled-not-owned cards go to the owner's discard pile (CR v8.0 11.3.1; R42). |
| Heal | The player who brought a base to 0 heals 5 on their own base (per base). |
| Game end | Ends at the end of the phase in which anyone is eliminated. The player(s) with the most base HP win; ties share. Concede/disconnect counts as elimination. |
| Sentinel | Protects only its controller's own units and base. Saboteur ignores it. |
| Combat | Attacker picks which opponent to attack. If the defender's controller changes to someone other than the attacker, the attack continues with the new controller as defending player. |
| Action phase | Pass is blocked while a counter is available; counters (Initiative, Blast, Plan) taken once per round by action. Blast = 1 damage to each opponent's base; Plan = draw 1 then bottom 1. Card effects that "take the initiative" take the initiative only. |
| Simultaneous triggers | The active player chooses the order. |
| Deckbuilding | Two different leaders, singleton, 80+ cards. |

Deferred rulings: attacker takes control of the defender mid-attack, controlled-not-owned cards on elimination, per-card comparison cards ("most", "fewer than"), whether an eliminated player can share a win.

## Always Two / Doubles (2v2, teams) — from the announcement

| Area | Rule |
|---|---|
| Teams | Two teams of two. Each player has their own leader, base and deck. |
| Win | Defeat **both** enemy bases. |
| Turns | Shared: the team gets **one action per turn**, taken by either teammate. |
| Initiative | Shared. If one teammate takes the initiative, neither can take actions for the rest of the round. |
| Passing | Not allowed. |
| Base damage reaches its health | A base has a health total, and damage counts **up** on it (it does not count down from the total). The player is **not** eliminated when their base takes damage equal to its health: they stay in until both bases on the team are defeated. In Always Two a base can be damaged **beyond** its health and healed back down, as long as the teammate's base is still healthy. (The announcement's "0 HP / no remaining health" wording means damage has reached the base's health.) |
| Information | Teammates may look at each other's hands and talk strategy. A "look at" effect lets only the player see it (they may tell their teammate). |
| Resources | You cannot spend a teammate's resources, and you do not get their aspects when paying costs. |
| Control | You cannot attack with, or play, a teammate's cards. An attack is never initiated with a teammate's unit. |
| Sentinel | Friendly Sentinels protect a teammate's units and bases. |
| "Friendly" | Abilities that say friendly units or friendly upgrades count the teammate's. |
| "You control" | Counts only your own cards (e.g. "if you control an Endor base"). |
| Overwhelm | Excess damage goes to the base of whoever controls the unit being attacked. |
| Decks | Built per the event format (30 Sealed / 50 Premier), independently per player, so both teammates may run 3 copies of a card. |

### Official Doubles overview (published 2026-11-18)
Source: "Game Mode Overview: Doubles" PDF. The official text, close to verbatim:
- **Overview / decks:** Doubles is for casual play; two friends team up against two opponents. No special deckbuilding requirements; each player builds per the Organized Play event format (30-card Sealed, 50-card Premier). Each player's deck is independent, so both teammates may include 3 copies of the same card.
- **Teams:** Teams of 2, each player with their own leader, base and deck. **Objective:** defeat BOTH enemy bases.
- **Shared turns:** Teams take their turn together. On a given turn, 1 player may take 1 action, then play alternates to the other team. Either player may take their team's action, but only 1 player can take an action per turn.
- **Shared information:** Players may look at each other's hands, strategize and advise. They may look at each other's **hands and resources**. If an ability tells a player to "look at" a card, their teammate may not look at it, but the information gained can be discussed freely.
- **Shared initiative:** The initiative counter is shared by each player on the team (both players have the initiative). When 1 member takes the initiative, neither teammate can take further actions that round.
- **No passing:** Players may not take the "pass" action.
- **Simultaneous victory:** The game is not won when a single enemy base is reduced to 0 HP. That player (and their base) remain in the game until both of that team's bases are reduced to 0 HP. They are **not eliminated**, their cards remain in play, and they may still take actions and go through the phases as normal. A base with 0 HP remaining may still be healed.
- **Friendly cards:** Each player's cards are "friendly" to their teammate. **Shared Sentinels:** friendly Sentinel units protect their teammate's other units and base.
- **"An opponent":** when a card indicates "an opponent", one opponent must be chosen.
- **Communication:** teammates may communicate verbally or in writing.
- **No shared control:** players may not exhaust their resources to help pay for a teammate's card, may not attack with their teammate's units, and may not play cards from their teammate's hand.
- **Overwhelm:** excess damage dealt to a unit by Overwhelm is applied to that unit's controller's base.
- **Ownership:** although your teammate's cards are friendly to you, you do not "own" or "control" them for gameplay purposes.
- **Teammate:** a teammate is another player in the game. Teammates are **not opponents**. If one teammate wins the game via a card ability, they both win.

How this relates to the earlier rulings: it agrees with R3 ("look at" is private; hands and resources are visible), R4 ("an opponent" is chosen, teammate is never an opponent) and R6 ("you" is personal; you do not own or control a teammate's cards). It does not say how base damage beyond the base's health works (see R10), or how granted abilities work on a teammate's cards.

### Open for Always Two (no ruling yet)
- Meaning of "an opponent" / "each opponent" with two enemy players (assumed: either/both enemy players, as in Twin Suns).
- "Each player" and "each other player": does it include the teammate? Assumed yes (they are players).
- "Your base" / "friendly base" / "an enemy base" with a teammate base present.
- Teammate's zones (hand, deck, discard, resources): are they "yours" for any effect? Assumed no, except the hand being viewable.
- "Reveal" and "disclose" effects: who sees them, and can the teammate's aspects satisfy them?
- Leader deploy, Bounty, capture/rescue, and "defeat a unit you own" where owner and controller can be on the same team.
- Who the "defending player" is and how Restore applies (the unit's controller's base, presumably).
- How a base at 0 HP interacts with "defeat the base" effects and with effects that care about base damage or health.

## Shared vocabulary: where the formats change card text

Card text assumes a 1v1 vocabulary of **you / your opponent**. The two formats break it in different ways:

| Phrase in card text | 1v1 | Twin Suns | Always Two |
|---|---|---|---|
| "your opponent" / "an opponent" | The one opponent | Controller chooses one of 2-3 | Controller chooses one of 2 enemies *(open)* |
| "each opponent" | The one opponent | All 2-3 others | Both enemies |
| "each player" | Both players | All players | Both teams' players, including the teammate *(assumed)* |
| "enemy unit/base/card" | Opponent's card | Any opponent's card | Either enemy's card |
| "friendly unit/upgrade" | Your card | Your card | Yours **or** your teammate's |
| "you control" | Your cards | Your cards | Only your own cards |
| "your base" | Your base | Your base | Your base (teammate has another) |
| "the initiative" | Held by one player | Held by one player; counters | Held by a team |
| "Sentinel" | Protects own side | Protects only its controller | Protects the controller **and teammate** |
| "look at" | You see | You see | You see; teammate cannot *(may be told)* |

The review will classify card text against this table. The phrase list for the batch pass is built from the rows above.
