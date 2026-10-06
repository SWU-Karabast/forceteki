# Twin Suns 3-4 player: card test pattern catalog (draft v0)

Planning only. No harness or tests are written yet; specs wait for the opponent refactor and the N-player harness.

## Conventions (decided)
- **Where:** add a nested `describe` to each card's **existing** spec (`test/server/cards/<set>/<type>/<Card>.spec.ts`), e.g. `describe('in a Twin Suns 3-4 player game', ...)`. Engine-level mechanics go in `test/scenarios/TwinSuns/`. Existing 2-player tests must stay untouched and green.
- **Setup shape (provisional, depends on harness):** a `TwinSuns` format and a player count in `setupTestAsync`, with `context.player3` / `context.player4` mirroring `player1` / `player2`. Seat order is randomized at runtime, so tests must set or read seating explicitly rather than assume P1 -> P2 -> P3.
- **Source of truth for expected behavior:** official card text + `rules-rulings.md` judge rulings. Not our implementation.
- A card needs a 3-4p test only if its behavior changes or branches with the number of opponents. Cards with no opponent-dependent behavior are marked `None`.

## Rulings the patterns rely on (from `rules-rulings.md`)
- "An opponent" is chosen by the player using the ability and the choice persists through the ability unless a later clause chooses again. "Each opponent" = all non-eliminated opponents.
- Eliminated players do not count as players for any effect.
- Simultaneous triggers across 3+ players: the active player picks the order.
- Cards that "take the initiative" take only the initiative counter and ignore the once-per-round counter limit.
- Open (deferred): gap 2 attacker steals defender mid-attack, gap 3a controlled-not-owned on elimination, gap 8c comparison cards per card, gap 11 eliminated player winning.

## Pattern catalog
Tag each card with the patterns it needs (a card can carry several). Each pattern lists what a good test must show.

| Tag | Pattern | What the test must show |
|---|---|---|
| `OPP-CHOOSE` | Card says "an opponent" / "target opponent" | With 2+ opponents the controller is prompted to choose; the chosen opponent persists to later clauses; the choice excludes eliminated players; with exactly one legal opponent it auto-selects. |
| `OPP-EACH` | Card says "each opponent" / "opponents" | Effect applies to every non-eliminated opponent; order is the active player's choice if it can't be simultaneous; the controller is not affected. |
| `OPP-BASE` | Targets or counts an enemy/opponent's base | Which base: single choice vs each base; damage/heal goes to the chosen base only; blast-style effects hit every opponent base. |
| `OPP-ZONE` | Touches an opponent's hand / deck / resources / discard | Prompt to choose which opponent's zone; effect hits only that zone; hidden-info handling in 3-4p. |
| `ENEMY-UNIT` | "Enemy unit" / "each enemy" / arena-wide targeting | Targets units of every opponent, not just one; arena sections per player don't restrict targeting unless the card says so. |
| `MULTI-CHOOSE` | Choose any number / up to N of something: players, opponents, bases, zones. | With 3-4 players the controller can pick zero, one or several; each chosen target is affected exactly once; unchosen and eliminated players are unaffected; choosing the controller (where "players" allows it) works; the 2p case still behaves as before. |
| `SENTINEL` | Interacts with Sentinel / Saboteur / attack targeting | Sentinel only restricts attacks into that Sentinel controller's own units/base; Saboteur ignores it; attacker can still hit another opponent. |
| `DEFENDER` | "Defending player" / defending unit effects | The defending player is the controller of the attacked unit/base; Overwhelm, Restore, disclose etc. use the right player; control change to a third player mid-attack moves the defending player. |
| `COMPARE` | "Most / fewest / fewer than an opponent / each player" comparison | Behavior with 3-4 players and ties; per-card ruling required (gap 8c). |
| `CONTROL` | Take control / give control / ownership vs control | Control changes with 3-4 players; unit owner vs controller; owner eliminated removes owned cards (gap 3a pending for controlled-not-owned). |
| `CAPTURE` | Capture / rescue | Captor choice among opponents; captured unit returns to owner on captor elimination/leaving play; Bounty collected by the opponent who defeated/captured. |
| `INITIATIVE` | Initiative / Blast / Plan counters | Card effects that take initiative follow ruling 9; Blast hits each opponent base; counters return at regroup; once-per-round limit only applies to the take-a-counter action. |
| `ELIM` | Interacts with elimination | Card removal without defeat triggers; lasting/delayed effects of an eliminated player still resolve; cards removed don't count as defeated. |
| `TRIGGER-ORDER` | Simultaneous triggers across 3+ players | Active player picks the order among players, each player orders their own; nested triggers still resolve first. |
| `TWO-LEADER` | Leader / deck-construction interaction | Both leaders count for aspects, deploy independently, defeat independently, 1-of-each deck limit. |
| `NONE` | No opponent-dependent behavior | No 3-4p test needed; record why. |

## Engine scenario tests (test/scenarios/TwinSuns/, not per card)
- **Setup & seating:** random first player; seat order list fixed for the game; both leaders in play.
- **Turn flow:** clockwise rotation; pass rules (cannot pass with counters available; 4p last-player pass); counter-taking once per round; Blast/Plan resolve on taking.
- **Combat:** per-opponent attack targeting; Sentinel scope; defending player after control change to a third player.
- **Elimination:** immediate at 0 base HP; owned cards removed with no defeat triggers; captured units return; upgrades removed; initiative to center; counters to center but stay taken; heal 5 for the player who brought the base to 0 (simultaneous: per responsible player).
- **Game end:** ends at end of phase after any elimination; winner(s) = most base HP among remaining players; concede/permanent disconnect counts as elimination.
- **Undo/snapshot:** N-player rollback; run all new scenarios under `npm run test-undo`.

## Per-card field
Each entry in `card-reviews/` gets a `Multiplayer tests:` line. Values: `None` (with reason), or a comma list of the tags above plus a short note. Default for reviewed-but-not-yet-planned cards: `TBD`.
