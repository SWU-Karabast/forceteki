---
name: patch-notes
description: >
  Draft user-facing patch notes for Karabast from the engine's git history.
  TRIGGER when: the user types /patch-notes or asks for patch notes / release notes covering a range of
  engine commits. Args: a start point (commit SHA or date) and optionally an end ref (defaults to origin/main).
  Scrapes the squash-merged PR history, sorts it into player-facing categories, drops internal work, and
  writes a markdown draft to the scratchpad for the user to edit.
---

You are drafting player-facing patch notes for the Karabast site from the forceteki engine's history. The audience is SWU players, not developers. The user edits the draft by hand afterward, so aim for a solid first pass, not a polished final.

## 1. Establish the range

- Start point comes from the args: a commit SHA (exclusive: notes cover commits *after* it) or a date (`--since=<date>`). If neither was given, ask.
- End ref defaults to `origin/main`. Run `git fetch -q origin` first so it's current. Don't assume the local checkout is on main.
- Dump the list to the scratchpad and read it:
  ```bash
  git log --date=short --pretty=format:'%h %ad | %s' <start>..origin/main > <scratchpad>/commits.txt
  ```
  Every commit is a squash-merged PR with `(#NNNN)` in the subject.

## 2. Work out the current set(s)

The newest numbered set directories under `server/game/cards/` (e.g. `09_HMW`, `09_IC27`) are the sets in preview or just released. Anything else is "pre-existing". Use touched file paths, not the commit title, to decide which set a fix belongs to:

```bash
git show --name-only --format= <sha> | grep -vE '^test/'
```

If it's unclear which set is "current" for this round (e.g. one set just launched and another started previews), check with the user rather than guessing.

## 3. Classify every commit

Titles alone are often not enough. For anything that isn't obviously a card implementation, read the PR body (`git show -s --format=%b <sha>`) and the non-test files it touches. Also grep each commit for the names of any unreleased features (see below): `git show <sha> | grep -ciE '<names>'`.

| Category | How to spot it | In the notes? |
|---|---|---|
| Card implementations | Title is just card name(s); adds files under `server/game/cards/<set>/` | Yes, summarized (see below) |
| Bug fixes | "Fix…", "bugfix", or a body describing wrong behavior | Yes, itemized, split current-set vs pre-existing |
| Site improvements | Non-bug UX, lobby, deckbuilding/format rules, ban lists, promo filters, admin/mod tools, log/summary readability | Yes, itemized |
| Tests only | "add test…", "… case", or only `test/` files changed (check! some titles read like fixes but only add a spec) | No |
| Mock data | "mockdata…", "mock for…", `scripts/mockdata.js` only | No |
| Internal | Refactors, cleanups, groundwork PRs, Claude tooling (`.claude/`, CLAUDE.md), CI, dev-only tooling like bug-report serialization | No, but pull out any bug fix buried inside a groundwork PR's body |
| Not-yet-public features | In-progress work players can't use yet (see below) | No |

**Not-yet-public features (exclude entirely):** Work on in-progress or unfinished features that players can't use yet: new game modes, formats, or systems still being built. Also leave out PRs whose only purpose is supporting such a feature, even if they don't name it; for example, plumbing for a mode that isn't live. Before classifying, ask the user which features are currently unreleased unless they already said so. Then grep each commit for those names.

**Card implementations:** Don't list every card when there are many. Count new card files per set and list the new leaders:
```bash
git log <range> --diff-filter=A --name-only --pretty=format: | grep -E 'server/game/cards/<SET>/.*\.ts$' | sort -u | wc -l
git log <range> --diff-filter=A --name-only --pretty=format: | grep -E 'server/game/cards/<SET>/leaders/' | sort -u
```
For a big round, give the count and highlight marquee leaders. For a small round (a handful of cards), just name them. Cards from a set still in previews are "Open format only". Also call out milestones like a set moving from mock data to official card data, or a new keyword/mechanic landing.

## 4. Write the draft

Save to `<scratchpad>/PATCH_NOTES_<M>-<D>.md` (today's date), then tell the user the path.

House style, based on past notes:
- Heading `## PATCH NOTES <M>/<D>`, then a one-line intro describing what the round was about.
- Sections in this order, and leave out any that are empty: `### Site Improvements`, `### New Cards`, `### <SET> Bug Fixes`, `### Pre-<SET> Bug Fixes`.
- Bullets use ` - `. Write in plain player language: what was wrong and what happens now. No PR numbers, file names, or engine terms (resolver, event window, system…).
- Put the set code before older card names (`ASH Ryder Azadi`, `JTL Asajj leader`). Current-set cards in the current-set section don't need one.
- Group closely related fixes into one bullet (e.g. several defeat-timing fixes) rather than listing each PR.
- Leave out fixes too internal or vague to explain to a player.

Example of the target voice:

```markdown
## PATCH NOTES 6/15
Handful of bug fixes for ASH cards as well as some older issues.

### ASH Bug Fixes
 - ASH Mandalorian unit's ability now functions correctly when multiple friendly units are damaged simultaneously - you can protect as many units as there are shields
 - Resolved an issue where using the Alliance Outpost ability on Mandalorian token's shield would incorrectly "double-click" and force the user to put the shield / xp on that Mandalorian token

### Pre-ASH Bug Fixes
 - JTL Yularen's effect now works correctly if he is played by the opponent
 - Fixed some niche timing issues with certain interactions: SHD Hondo + Timely Intervention, SHD Bossk + exploit
```

## 5. Report back

In your reply, besides the file path, list the judgment calls so the user can reverse them quickly:
- The exact range covered (first and last SHA).
- What was left out as not-yet-public, and anything left out as internal that a reasonable person might include.
- Fixes where the current-set vs pre-existing call was borderline.
