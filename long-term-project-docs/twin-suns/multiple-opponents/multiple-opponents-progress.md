# Multiple opponents: progress

This file tracks the status of the work in [multiple-opponents-plan.md](multiple-opponents-plan.md). The plan defines the
workstreams, decisions and milestones listed here. Each workstream's detail lives in its own document; this file holds
only status.

**Keeping it current:**

- Update your workstream's row, and any decision you settle, in the same PR that changes them.
- Add each merged PR to [Merged PRs](#merged-prs).
- Measure the [burn-down](#burn-down) again at each milestone, or whenever a PR moves one of its numbers.
- Each row has one owner. If two rows conflict in a merge, keep both changes.

**Last updated:** 2026-11-25. The plan is drafted and has been revised after an independent review. No workstream has
started.

## Milestones

| Milestone | What it means | State |
|---|---|---|
| M0 Kickoff | The scope and plan are agreed, owners are named, and the rules have been checked against the current CR. | ⬜ |
| M1 Foundation | MODEL, VOCAB and HARNESS are done. Games with 3–4 players can be set up in tests and their players can take turns. The vocabulary is merged. Every `.opponent` read fails loudly in such a game. Each shape the getter can't catch has an assert or a pending smoke spec. | ⬜ |
| M2 Engine | CHOICE, VISIBILITY, TRIGGER and DERIVED are done. The smoke suite passes in this project's areas, and the engine reads `.opponent` only in the asserting getter. | ⬜ |
| M3 Cards: project done | CARDS is done, and `.opponent` is gone from the codebase, including the test helpers. Every card that behaves differently with more players has a spec with 3 or more players. | ⬜ |

## Workstreams

**Stages:** ⬜ not started · **a** investigating · **b** deciding · **c** implementing · **d** closing · ✅ done.

"Waiting on" starts as what stage c needs, copied from the plan's
[dependency table](multiple-opponents-plan.md#dependencies-and-parallel-work). Once work starts, replace it with whatever
is actually blocking.

| ID | Workstream | Phase | Stage | Owner | Doc | Waiting on | Updated |
|---|---|---|---|---|---|---|---|
| RULES | The rules baseline | 0 | ⬜ | — | — | — | 2026-11-25 |
| MODEL | The player model, seat order, games with more players | 1 | ⬜ | — | — | First PR: MODEL-2. Second PR: HARNESS's first PR, held (V-39) | 2026-11-25 |
| VOCAB | The vocabulary for how players relate | 1 | ⬜ | — | — | MODEL's first PR, HARNESS's first PR | 2026-11-25 |
| HARNESS | Tests with more players, smoke suite, audit | 1 | ⬜ | — | — | MODEL's first PR | 2026-11-25 |
| CHOICE | Choosing a player; effects aimed at players | 2 | ⬜ | — | — | VOCAB's API, HARNESS, MODEL's second PR | 2026-11-25 |
| VISIBILITY | Hidden information | 2 | ⬜ | — | — | MODEL's second PR, HARNESS, VOCAB's API | 2026-11-25 |
| TRIGGER | Trigger order; abilities opponents can trigger | 2 | ⬜ | — | — | VOCAB's API, HARNESS, MODEL's second PR, RULES | 2026-11-25 |
| DERIVED | Players taken from events: Bounty, attacks, control | 2 | ⬜ | — | — | VOCAB's API, CHOICE's step, TRIGGER-2, RULES | 2026-11-25 |
| CARDS | Card implementations | 3 | ⬜ | — | — | VOCAB, CHOICE, DERIVED, TRIGGER-2, HARNESS, RULES, LKI step 3.2 | 2026-11-25 |

## Cross-cutting decisions

These are the decisions that constrain other workstreams or the held projects. Each is argued in its workstream's
document; this table holds only its state.

| ID | Question | Constrains | State |
|---|---|---|---|
| MODEL-1 | Once elimination exists, do eliminated players stay in `getPlayers()`, and are they left out of `opponents` and turn order? | Card semantics; the game-flow project | Open. Recommended: they stay, and are skipped. |
| MODEL-2 | What switch allows a game with more players (a stub format entry, or a game setting), and where does the player count live? | MODEL's first PR; HARNESS; the Twin Suns format project | Open |
| MODEL-3 | How is `.opponent` retired? | CARDS; the held projects, which inherit the explicit calls | Open. Recommended: an asserting getter, explicit single-opponent calls in held areas, and deleting the getter at M3. |
| VOCAB-1 | What is the vocabulary? It has four cases (filter, exactly one player, each opponent in turn, the player themself) and covers the types. | CHOICE, TRIGGER, DERIVED, CARDS | Open |
| VOCAB-2 | Where is a chosen opponent carried? | CARDS; LKI step 3.2 | Open. Recommended: in `context`. |
| VOCAB-3 | Where do the helpers for card code live? | CARDS; the LKI views | Open. Recommended: on `Player` and `Game`. |
| VOCAB-4 | What does a resolution that needs exactly one player do when it has more than one candidate, until CHOICE lands? | CHOICE, TRIGGER, DERIVED, CARDS | Open. Recommended: a `Contract` failure. |
| HARNESS-1 | What are the setup schema and the context names for players 3 and 4? | The server project (dev test games, the bug-report export) | Open |
| HARNESS-3 | Do prompts that only games with 3 or more players can reach get captures now? | The client project; `CLAUDE.md`'s captured-states section | Open. Recommended: yes. |
| CHOICE-1 | How is a player picked? | The client project | Open. Recommended: within today's prompt shapes, with one button per player, each with its own `arg`. |
| CHOICE-4 | Does the implicit default target survive? | CARDS' call sites that rely on it; this file's burn-down target | Open |
| VISIBILITY-1 | Is hidden information hidden from everyone but the controller, or does each player know different things, including what the log names? | The client project | Open |
| TRIGGER-2 | When an opponent can trigger an ability, which opponent does it belong to? | DERIVED, CARDS | Open |
| DERIVED-1 | Can one attack target units of different opponents? | The client project; CARDS | Open; waits on RULES |

## External gates and coordination

A **gate** blocks the work named. A **coordination point** doesn't block, but the two pieces of work change the same code.

| Item | Kind | Affects | State (2026-11-25) | Where to check |
|---|---|---|---|---|
| CR v9.0 checked against the repo's v7.0 copy | Gate | The decisions in TRIGGER and DERIVED; CARDS ("your opponent"); Appendix C for the held projects | Not started | RULES |
| V-39 | Gate | MODEL's second PR | Held by the maintainers | Maintainers only |
| LKI step 3.2, the codemod, merged | Gate | CARDS' stage c | Not started | The LKI decisions document, on `ammayberry1/lki-refactor-3` |
| LKI D-38: how a selector receives its candidate | Coordination | VOCAB and CHOICE (`BaseCardSelector`, `CardTargetResolver`, `matchTarget`, cost adjusters) | Open; option (a) recommended, which ships with the codemod | The same document |
| LKI's refactor of `controllerMeetsRequirements` | Coordination | VOCAB, TRIGGER, DERIVED | Planned (engine refactor); phase 4 removes `event.lastKnownInformation` | The same document |
| LKI step 3.4, the authoring guidance | Coordination | CARDS' guidance, which is a second pass after it | Not started; it ships in the codemod's PR | The same document |
| LKI phase 2, event plumbing | Coordination | MODEL (the flush in `ActionPhase`), DERIVED | Not started; it runs after LKI phase 3 | The same document |
| LKI phase 4, migrating cards | Coordination | CARDS (the same card files; D-28's lint rules) | Not started | The same document |

The LKI decisions document is at [../../lki-redesign-decisions-and-insights.md](../../lki-redesign-decisions-and-insights.md).
On `main` its decision log stops at D-35; read the branch copy with
`git show ammayberry1/lki-refactor-3:long-term-project-docs/lki-redesign-decisions-and-insights.md`.

## Burn-down

These metrics show how much of the code still assumes a single opponent. Each number should reach its target by the
milestone named.

| Metric | Target | 2026-11-25 (`4f5ac59b9`) |
|---|---|---|
| `.opponent` in engine code (outside `cards/`) | 0, apart from the getter (M2) | 67 lines in 35 files. 11 are in held projects' areas (game flow 6, undo 5); MODEL turns those into explicit single-opponent calls. |
| Explicit single-opponent calls left for held projects | Counted, not reduced: the held projects remove them | Not introduced yet. At kickoff, 11 reads plus conceding's `getOtherPlayer` call are to be converted. |
| `RelativePlayer.Opponent` in engine code | Every remaining line is in VOCAB's terms (M2) | 35 lines |
| Calls to `asConcretePlayer` / `asRelativePlayer` (the `RelativePlayer` round trips) | Each reviewed under VOCAB (M2) | Engine: 4 and 8. Cards: 1 and 13. |
| Calls to `getOtherPlayer()` | 0 (M3) | 3: MODEL 1, game flow 1 (becomes an explicit call), CARDS 1 |
| `.opponent` in card code | 0 (M3) | 300 lines in 232 files |
| `.opponent` in the test helpers | 0 (M3) | 3 lines |
| `RelativePlayer.Opponent` in card code | Rewritten in VOCAB's terms (M3) | 333 lines in 287 files. By property name (an approximation of what each use means): filter 225, actor 93, affected player 11, computed 4. |
| Player-targeting systems that default to the opponent | Resolved as CHOICE-4 decides | 10 systems. 37 calls in card code pass no `target`; roughly 18 of them rely on the default (a heuristic count). |
| Twin Suns TODO markers | All but Blast's are this project's. Blast's two belong to the Twin Suns format project | 11: 5 in the engine (2 of them Blast's), 6 in cards |
| Smoke suite, passing / pending | This project's specs all pass (M2). Specs in held projects' areas stay pending under the project's name | Not built yet (HARNESS) |

Until HARNESS's audit script replaces them, the commands below measure these numbers. Run them from the repo root in Git
Bash.

- In git's default pathspec, `*` matches across `/`. So `server/game/*.ts` covers every TypeScript file under
  `server/game/`, the top-level ones included (377 files with the `.js`).
- The commands that print `file:line` leave out comment lines. To count files instead of lines, replace `wc -l` with
  `cut -d: -f1 | sort -u | wc -l`.
- The role-split commands use `-h`, which drops the prefix, so they can't skip comments or count files.
- The TODO count includes comments, since TODOs are comments.
- The count of calls that rely on a default target came from a one-off scan, which the audit script will automate.
- MODEL adds a command for the explicit single-opponent call once the call has a name.

```bash
NC='^[^:]+:[0-9]+:\s*(//|\*|/\*)'
ENGINE=(-- 'server/game/*.ts' 'server/game/*.js' ':!server/game/cards/*')
CARDS=(-- 'server/game/cards/*.ts')
git grep -nE '\.opponent\b' "${ENGINE[@]}" | grep -vE "$NC" | wc -l                    # engine .opponent
git grep -nE 'RelativePlayer\.Opponent' "${ENGINE[@]}" | grep -vE "$NC" | wc -l        # engine RelativePlayer.Opponent
git grep -nE 'asConcretePlayer\(' "${ENGINE[@]}" | grep -vE "$NC|export const" | wc -l  # engine round trips: asConcretePlayer
git grep -nE 'asRelativePlayer\(' "${ENGINE[@]}" | grep -vE "$NC|export const" | wc -l  # engine round trips: asRelativePlayer
git grep -nE 'as(Concrete|Relative)Player\(' "${CARDS[@]}" | wc -l                      # card round trips (both)
git grep -nE 'getOtherPlayer\(' -- 'server/*.ts' | grep -vE "$NC|public getOtherPlayer" | wc -l   # getOtherPlayer calls
git grep -nE '\.opponent\b' "${CARDS[@]}" | grep -vE "$NC" | wc -l                     # card .opponent
git grep -nE '\.opponent\b' -- 'test/helpers/*' | grep -vE "$NC" | wc -l               # test helpers .opponent
git grep -nE 'RelativePlayer\.Opponent' "${CARDS[@]}" | grep -vE "$NC" | wc -l         # card RelativePlayer.Opponent
git grep -hoE '\b(controller|targetController)\??: *RelativePlayer\.Opponent' "${CARDS[@]}" | wc -l                                       # filter
git grep -hoE '(promptedPlayer|choosingPlayer|playerChoosingOptional|canBeTriggeredBy)\??: *RelativePlayer\.Opponent' "${CARDS[@]}" | wc -l  # actor
git grep -hoE '\b(targetPlayer|player|onlyFromPlayer|createdBy)\??: *RelativePlayer\.Opponent' "${CARDS[@]}" | wc -l                      # affected player
git grep -niE 'TSTODO|TODO.*twin ?suns' -- 'server/*.ts' | wc -l                        # TODO markers
```

**Log**, newest first:

| Date | Commit | Engine `.opponent` | Card `.opponent` | Card `RelativePlayer.Opponent` | Systems defaulting to the opponent | Smoke suite | Note |
|---|---|---|---|---|---|---|---|
| 2026-11-25 | `4f5ac59b9` | 67 lines, 35 files | 300 lines, 232 files | 333 lines, 287 files | 10 | — | Baseline. Measured again with the corrected pathspec, which covers 4 more top-level files; the numbers are unchanged. |

## Merged PRs

Newest first.

| Date | PR | Workstream | What it delivered |
|---|---|---|---|
| — | — | — | None yet |
