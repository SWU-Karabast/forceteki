# Twin Suns / multiplayer rules pass (swu-rules-expert, first pass)

Source: `.claude/reference/swu-rules/` only (condensed CR v7.0 + clarifications). The agent did not read engine code. Citations are to files in that folder; "09 §11.x / §12.x" = `09-special-rules.md`. **This is an agent's reading, not an official ruling. Spot-check citations before relying on any of them, especially the clarification-file line references.**

Reading caveats from the agent:
- Base rules (01 §1.4.2, 02 §5.4/§5.6, 01 §1.15) are written for two players; §11/§12 govern where they conflict.
- Clarifications quote CR 11.3.1 as "all cards they **own** are removed"; the condensed 09 §11.3 says "**their** cards". Owner vs controller matters for elimination (see gaps).
- Several clarifications say more rules are pending (CR5).

## Judge rulings (Anthony, 2026-10-06) — these supersede the agent's "most literal reading" for the gaps below

| # | Gap | Ruling |
|---|---|---|
| 1 | Choosing "an opponent" | The player playing the card / using the ability (the active player) chooses the opponent. The chosen opponent **persists** through the rest of the ability unless a later clause says to choose a different opponent / choose an opponent. |
| 2 | Attacker takes control of the defending unit mid-attack | **TBD.** No printed card does this today (hypothetical; would require a triggered ability firing during an attack and taking control of a non-leader defender). Low priority. |
| 3a | Elimination: which cards are removed | All cards the eliminated player **owns** are removed. Cards they **control but do not own** go to their owner's discard pile. **Tentative; action item: confirm the controlled-not-owned ruling.** |
| 3b | Upgrades / counters of an eliminated player | Their upgrades attached to surviving units are removed. Blast/Plan counters they held go to center but stay "taken" (cannot be retaken this round). |
| 4 | Simultaneous elimination | The player responsible for bringing each base to 0 heals 5 (per base they brought to 0). |
| 5 | Concede / permanent disconnect | Treated as elimination; the game ends at the end of the phase. |
| 6 | Mid-phase elimination / next first player | Twin Suns always ends at the end of the phase in which a player is eliminated, so there is no next round. The player(s) with the most remaining base HP win. (Rotation presumably skips the eliminated player for the rest of the phase.) |
| 7 | Mulligan order | Simultaneous. Not important for this casual format. |
| 8a | Eliminated players as "players" | Eliminated players do **not** count for any effect ("each player", "each opponent", "an opponent", comparisons). |
| 8b | Simultaneous triggers across 3+ players | The active player picks the order. |
| 8c | Comparison cards ("most", "fewer than an opponent") | **No general rule; per-card ruling during the card review.** |
| 9 | Card effects that "take the initiative" | Take the initiative only: they ignore the once-per-round counter limit and do not give Blast/Plan effects. |
| 10 | Control taken then original owner eliminated | Resolved by 3a: the owner's elimination removes the card (owned cards are removed). |
| 11 | Can an eliminated player win/share a win (e.g. all bases at 0)? | **Open: ruling to be written in by Anthony.** |

### Remaining open items
- Gap 2 (TBD), Gap 3a (confirm controlled-not-owned), Gap 8c (per-card, during card review), Gap 11 (ruling pending).

## Status by question

| # | Topic | Status |
|---|---|---|
| 1 | "opponent" / "each opponent" / "enemy" | Definitions explicit; **who/when chooses "an opponent" not covered** |
| 2 | Sentinel scope | Explicit per-controller; Saboteur vs multiple opponents inferable |
| 3 | Defender changes controller mid-attack | Basic case explicit; **attacker takes control not covered** |
| 4 | Elimination | Core explicit; zones inferable; **controlled-but-not-owned cards, upgrades on others' units, held Blast/Plan counters not covered** |
| 5 | End of game (12.7) | Core explicit; **simultaneous elimination, concede/disconnect not covered** |
| 6 | Turn order / action phase | Counters + pass rules explicit; **mid-phase elimination, who is first player next round if initiative holder eliminated not covered** |
| 7 | Setup / regroup | Text explicit; **mulligan-order conflict between 02 §5.2e and 09 §11.2** |
| 8 | Cross-player comparisons/counts | Inferable at best; **ties, eliminated players, simultaneous trigger order (3-4p) not covered** |
| 9 | Capture / rescue / control / ownership | Captor eliminated explicit; owner-vs-controller on elimination inferable only |
| 10 | Blast/Plan counter + initiative interactions | Counter text explicit; **card effects that "take the initiative", once-per-round limit interaction not covered** |
| 11 | Other | Deckbuilding, two leaders, non-binding deals: explicit |

## Explicit rulings (safe to build on)
- **Opponent definitions (09 §11.4):** "Opponent" = any one other player; "Opponents" = all other players. "Enemy" card = a card any opponent controls (01 §1.5.3b). Bounty is collected by the opponent who defeats/captures; if the controller defeats their own unit they choose an opponent.
- **Sentinel (09 §11.4; 05 Sentinel; 04 §6.3.2b):** only restricts attacks on *that Sentinel controller's* non-Sentinel units and base, for attackers in the same arena. Attacker chooses among multiple Sentinels. Saboteur ignores Sentinel.
- **Defender control change (09 §11.4):** if the defending player loses control of the defending unit to someone **other than the attacker**, the attack continues with the new controller as defending player.
- **Elimination (09 §11.3):** base at 0 HP -> eliminated immediately; their cards are removed from play and are **not** defeated/discarded (no triggers); units they captured return to play under their owners (exhausted, not "played"); their lasting/delayed effects persist and are resolved by remaining players; if they held initiative it returns to center available. The eliminator heals 5 from their own base **after** removal (not on self-elimination).
- **End of game (09 §12.7):** once one player is eliminated, the game ends at the end of the current phase; most base HP wins; **ties share the victory**; phase-ending effects/triggers still resolve.
- **Action phase (09 §11.2, §12.5, §12.6):** clockwise from first active player; phase ends when each player passes consecutively; actions are Play / Attack / Action Ability / Take an Available Counter; **cannot pass while a counter is available**, must pass after taking one; one counter taken per round via the action but a player may hold several; in 4p, once all 3 counters are taken the last remaining player may pass to end the phase. Blast and Plan return to center at start of regroup; initiative flips back at the start of the new round.
- **Counters (09 §12.5):** Blast = 1 damage to **each opponent's** base, immediately; Plan = draw 1 then put 1 card from hand on bottom of deck (may be the drawn card), immediately. "Have the initiative" checks control only.
- **Setup (09 §11.2, §12.4):** random first player; both leaders placed Leader-side up below base at setup step 2; Blast and Plan placed in center after the initiative counter is given.
- **Deckbuilding (09 §12.2/§12.3):** 2 different leaders (not both Villainy+Command), 1 base, 80+ cards, singleton; both leaders give aspects and deploy/defeat independently.

## Original gaps from the agent pass (see Judge rulings above for decisions)
1. **"An opponent" choice:** controller chooses (most literal), but not stated *when* (targeting vs resolution), whether "target opponent" differs, or whether the choice is remembered across sentences of one ability.
2. **Attacker takes control of the defending unit mid-attack:** excluded from the §11.4 continuation; behavior undefined. Also which player is "defending player" for Overwhelm/Restore/disclose after a control change (literal: new controller).
3. **Elimination scope:** do cards the eliminated player **controls but does not own** leave play? Cards they own but others control? Upgrades they own on surviving units (does the host update immediately)? Tokens? Held Blast/Plan counters? (Agent's literal reading by "own" wording: owned cards removed regardless of controller; controlled-not-owned stay.)
4. **Simultaneous elimination:** order of heal-5 / removal, and who "eliminated" whom.
5. **Concede / disconnect in 3-4p:** does it count as elimination, does it end the game at end of phase, are the conceder's cards removed?
6. **Mid-phase elimination:** presumably skipped in rotation; not stated. If the initiative holder is eliminated and it returns to center, who is first active player next round?
7. **Mulligan order conflict:** 02 §5.2e (initiative holder first) vs 09 §11.2 ("first player decides, then clockwise").
8. **Cross-player counts:** ties for "most"/"fewest", whether eliminated players count as players for "each player"/"opponents", order of simultaneous triggers beyond two players (06 §7.6.10 is two-player worded).
9. **Card effects that "take the initiative"** vs the Take an Available Counter action and the once-per-round limit; whether they trigger Blast/Plan effects.
10. **Taken control then original owner eliminated:** literal "own" wording says the unit is removed; unconfirmed.
11. **"Most HP" tiebreak for eliminated players** (0 HP) and whether an eliminated player can share a win if everyone is at 0.

## Engine-facing implications (draft)
- Opponent helpers need three modes: "an opponent" (controller chooses), "each opponent" (all others, ordered by the controller if it can't be simultaneous), and "defending player".
- Seat order list + `isEliminated` state + removal pipeline that bypasses defeat triggers but returns captured units and resolves leftover lasting/delayed effects.
- Game end becomes "ends at end of phase after any elimination" with HP-based winner(s), shared victory on ties.
