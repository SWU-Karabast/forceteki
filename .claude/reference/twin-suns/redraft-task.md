# Redraft task for drafting agents

Instructions for an agent that redrafts Twin Suns / Always Two test notes for a batch of Star Wars: Unlimited cards. The batch input and output paths are given in the request.

Read first, in full: `drafting-guidelines.md` and `format-rules.md` in this folder (rulings R1-R35 and the official Doubles overview), and `engine-test-notes.md` (engine-level items are tested once and must not be repeated per card).

Input: a JSON array. Each entry has id, name, set, type, official card text, optional official rules, and `current` (the existing draft: ts = Twin Suns note, a2 = Always Two note; lines separated by newlines).

These cards contain phrases such as "each opponent", "an opponent", "each player", "friendly/enemy units" or "a friendly / an enemy ...". They are more likely than average to need multiplayer tests, so be careful not to over-trim.

Goal: every note must say only what the existing 1v1 test suite cannot already show.

1. Decide what is format-specific from the OFFICIAL CARD TEXT and the rulings. Never decide what the card does from our implementation.
2. YOU MUST READ THE SPEC for every card. Glob for `test/server/cards/**/<CardName>.spec.ts` under `C:\Users\Anthony\Documents\GitHub\forceteki` (PascalCase of the title; search by title words) and Read it. Remove a line only if the spec already asserts that exact behavior in 1v1. If the spec does not cover a behavior that matters to 3+ players or teams (several opponents, the teammate, per-player counting, who controls what, or the case that an opponent's card does NOT count when the spec never tests it), keep the line. If there is no spec, say so in `spec` and judge from the text.
3. No control qualifier ("another unit", "another Unique unit", "a unit"): no note. Unqualified "a base": no note about which base. Upgrades: see the guidelines. Apply the standard qualifier lines listed in the guidelines ("a friendly X", "an opponent", "each enemy X", "each friendly X", "an enemy unit").
4. If nothing format-specific remains, return empty strings for both ts and a2 (empty = no concern). Never write the "Ensure it behaves as in 1v1" placeholder.
5. If a question is not settled by the sources, do not decide it yourself: keep it as an "Open:" line. Do not turn an open question into a statement of how it works. Keep an existing open question on a card if the sources still do not settle it.
6. NEVER write a ruling number (R5, R13...) in any note or in "why". State the behavior in plain words.
7. Format: lines start with "Ensure ...", at most three short lines per note. A card that itself starts an attack (Attack with a unit, "attack with a friendly unit" effects) gets the Always Two line "Ensure the attack can only be initiated with a unit you control, never with the teammate's unit." Do NOT add that line for Ambush or for a unit's own On Attack abilities.

Output: write a JSON object to the output path with one key per input id:
`{"<id>": {"ts": "line1\nline2", "a2": "...", "spec": "<spec path or none>", "why": "<one short sentence>"}}`.
Include every id from the input. Write valid JSON (escape quotes inside strings; use \n for line breaks) and re-read the whole file to check it. Edit no other file. Reply with just the count written and how many have both notes empty.
