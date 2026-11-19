# Guidelines for drafting multiplayer test notes

Every agent that drafts Twin Suns / Always Two notes for cards must read this file first. Add a line here whenever the reviewer gives a standing instruction, so it applies to every future batch.

## Scope: what a card note should (and should not) cover
- **Only describe what is specific to this card in the format.** If the card behaves as it does in 1v1, say so: "Ensure it behaves as in 1v1; no format-specific case."
- **Engine-level mechanics are tested once in the engine scenarios, not per card.** Do not write a note about them just because the card has the keyword or the effect: Overwhelm, Sentinel, Saboteur, the defending player, and the generic capture / rescue rules. Mention them only when this card does something unusual with one (for example, grants it conditionally in a way that depends on the number of opponents or on a teammate).
- Do not restate rules from the card's text. Write what a test must show, not what the card says.

## Cards not to draft
- Cards that depend on player order, seating or left/right neighbours (the "Player order / seating" group in `review-groups.json`, which includes "each player chooses / discards / returns" effects) are reviewed manually: the reviewer found them complicated in both formats. Do not draft notes for them; they are left out of the batches.

## Format
- One to three short lines per note. Each line starts with "Ensure ..." and states a testable expectation.
- Two notes per card: **Twin Suns** (3-4 players, free-for-all) and **Always Two** (2v2 teams).
- If a line depends on a rule the sources do not settle, start it with "Open:" and state the question. Never guess a ruling.
- Do not state rules you have not confirmed in the sources (CR v7.0, `format-rules.md`, `archive_old/rules-rulings.md`).

## Judge rulings to apply (Anthony, 2026-11-18; full table in `format-rules.md`)
- Twin Suns, "an opponent" in a static condition or comparison (no choice step): true if any one opponent qualifies. Abilities that choose "an opponent" when used still have the controller choose, and the choice persists.
- Always Two: the same conditions use either enemy individually (nothing summed across the two enemies); the teammate is never an opponent; the controller may choose either enemy.
- Always Two reveal is seen by everyone; "look at" is private; disclose uses only your own hand and aspects.
- Always Two: "a unit" / "a base" without "enemy" can target the teammate's cards; attacks only ever target enemies.
- Always Two: "you" is personal; "have the initiative" is the team's.
- Twin Suns, "the player to their right": from each player's own perspective it is the player before them in turn order (R7).
- Always Two seating: the two teams sit across from each other (teammates adjacent). "The player to their right" is a teammate for one player on each team and an enemy for the other (R8).
- Choices made in turn by each player: player order is always clockwise. If the card gives no other start (e.g. Merciless Contest), it starts with the player who played the card. "In player order" starts with the player to the active player's left (R9). In Always Two this follows the seating in R8.
- Working assumption (NOT yet ruled; the reviewer will confirm card by card): an ability or keyword that a card grants to a teammate's unit is used by that unit's controller, so "you" / "your base" in the granted text means the unit's controller (the teammate). Write notes under this assumption and do not raise an "Open:" line just for this.
- Always Two base damage (R10): a base has a health total and damage counts UP on it; it can exceed the health, and the player is not eliminated. Never describe base health as "HP counting down to 0". Paying damage-to-your-base costs and receiving damage on a base at or past its health are still allowed.
- Always Two "each player" includes the teammate; "when an opponent ..." effects are not triggered by the teammate (R11).
- Always Two "a player" (not "an opponent") can be any player: an enemy, the controller or the teammate (R12).
- Always Two "if you've (done X) this phase": counts only what you or your own cards did, not the teammate's (R13).
- Always Two "an opponent ... their (nth) card": counted per individual enemy player, not per team (R14).
- Always Two Exploit can only use the player's own units, never the teammate's (R15). This is an engine-level rule: do not write per-card notes about it.
- "An opponent ... their previous action": that opponent's own most recent action this phase, per individual player in both formats (R16).
- Comparisons or totals over "enemy units" (e.g. "highest cost among enemy units") pool all opponents' units together in both formats (R17).
- "If [condition] an opponent, [effect on] that opponent": the controller chooses an opponent for whom the condition is true, and the effect hits that opponent (R18). A condition with no "that opponent" follow-up is true if any opponent qualifies (R1).
- Restore always heals the base of the controller of the unit that has it, however it was gained, in both formats (R19). Engine-level: do not write per-card notes about whose base is healed.
- Always Two "friendly resource" includes the teammate's resources: they gain granted abilities and can be readied; the teammate still pays only with their own resources (R21). Defeating a "friendly resource" (Sundari Palace) is unknown: leave it flagged.
- Always Two, a card that makes you use a teammate's unit's When Defeated / When Played ability: "you" is you, the player using it (R25). An ability granted to a unit is different: "you" is the unit's controller (R20).
- "Ready a resource" / "ready N resources" with no qualifier can ready any player's resource: your own, the teammate's, or an opponent's (R26). "Friendly resource" follows R21.
- Always Two: "take control of a unit" with no "enemy" can take the teammate's unit; it moves to the player who played the card and the owner regains it as the card says (R27).
- Always Two: a base at or past its health has 0 remaining HP, can still be dealt damage, and still triggers "deals combat damage to a base" (R28).
- Several "enemy" cards chosen/revealed (e.g. 3 enemy resources) can come from any combination of opponents or enemies; "its controller" is each card's own controller (R29).
- "Choose any number of players / opponents / bases" allows any subset (none, one, several, all), including the controller and the teammate where "players" allows; both modes must support every combination (R30). Mention this requirement in the notes of these cards.
- Any card that initiates an attack gets this Always Two line: "Ensure the attack can only be initiated with a unit you control, never with the teammate's unit." (No shared control.)
- Always Two Coordinate counts only units controlled by the same player, not the team (R31), and Sentinel (shared by teammates in Always Two) is tested as described in `engine-test-notes.md`. Both are engine-level: do not write per-card notes about them.
- Unqualified "a base" (no "enemy", "friendly", "your" or "defending") can target any base in play, in both formats (R32). Do not write a line saying so ("can be your own, the teammate's or either enemy's"); mention a base only when the card does something specific with it (remaining-HP condition, elimination, who draws, the defending player).
- Do not write an "Open:" line for any of the questions above; apply the ruling.

## Format reminders
- Twin Suns: "an opponent" is chosen by the player using the ability and the choice persists through the ability; "each opponent" is every non-eliminated opponent; eliminated players are not players for any effect.
- Always Two: a teammate is never an opponent; "friendly" includes the teammate; "you control" counts only your own cards; you cannot spend a teammate's resources, use their aspects, or attack with or play their cards. A base at 0 HP does not eliminate its player.
