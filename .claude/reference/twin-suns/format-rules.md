# Format rules: Twin Suns and Always Two (Doubles)

Purpose: the rules that are unique to each multiplayer format, so card text can be mined for phrases whose meaning changes in these formats. This replaces the old tag catalog (kept in `archive_old/`).

Sources and confidence:
- **Twin Suns**: Comprehensive Rules v7.0 §11 (multiplayer) and §12 (Twin Suns), plus the judge rulings in `archive_old/rules-rulings.md` (Anthony, 2026-10-06). Official.
- **Always Two (Doubles)**: announcement-stream slides plus verbal clarifications, 2026-11-18. **Not official; no written rules yet.** Anything marked *(open)* is unknown. Update this file as rules are published.

## Twin Suns (3-4 players, free-for-all)

| Area | Rule |
|---|---|
| Players | 3 or 4, each with their own deck, base and **two leaders**. Seat order random, turns clockwise. |
| "Opponent" | "An opponent" = any one other player, chosen by the player using the ability; the choice persists through the ability unless a later clause chooses again. "Each opponent" / "opponents" = all other (non-eliminated) players. |
| "Enemy" | A card any opponent controls. |
| "Each player" | Every non-eliminated player, including the controller. |
| Eliminated players | Not players for any effect. |
| Elimination | Base at 0 HP eliminates that player immediately. Owned cards are removed (not defeated, no triggers); captured units return to their owners; their upgrades on others' units are removed; initiative returns to center; Blast/Plan counters go to center but stay taken. Controlled-not-owned cards go to the owner's discard (tentative). |
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
| Base at 0 HP | The player is **not** eliminated. They stay in until both bases on the team are defeated. Bases at 0 remaining health can still be healed. |
| Information | Teammates may look at each other's hands and talk strategy. A "look at" effect lets only the player see it (they may tell their teammate). |
| Resources | You cannot spend a teammate's resources, and you do not get their aspects when paying costs. |
| Control | You cannot attack with, or play, a teammate's cards. An attack is never initiated with a teammate's unit. |
| Sentinel | Friendly Sentinels protect a teammate's units and bases. |
| "Friendly" | Abilities that say friendly units or friendly upgrades count the teammate's. |
| "You control" | Counts only your own cards (e.g. "if you control an Endor base"). |
| Overwhelm | Excess damage goes to the base of whoever controls the unit being attacked. |
| Decks | Built per the event format (30 Sealed / 50 Premier), independently per player, so both teammates may run 3 copies of a card. |

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
