# SWU-PGN/1.0 — The Spec

**Name:** SWU-PGN/1.0-SPEC
**Status:** Draft Standard
**Editors:** Karabast Project
**Reference code:** the `swupgn/` folder in this repo

---

## Contents

1. [What this is](#1-what-this-is)
2. [How to read this spec](#2-how-to-read-this-spec)
3. [Who has to do what](#3-who-has-to-do-what)
4. [What a file looks like](#4-what-a-file-looks-like)
5. [The header tags](#5-the-header-tags)
6. [The names used inside a file](#6-the-names-used-inside-a-file)
7. [The DECKS section](#7-the-decks-section)
8. [The SETUP section](#8-the-setup-section)
9. [The EVENTS section and `seq` numbers](#9-the-events-section-and-seq-numbers)
10. [Every event type](#10-every-event-type) — including [10.3 Homeworlds: Fortify, Beast and Weakness](#103-homeworlds-fortify-beast-and-weakness) and [10.4 Grand Moff Tarkin and The Death Star](#104-grand-moff-tarkin-and-the-death-star)
11. [The board you build (ReducedState)](#11-the-board-you-build-reducedstate)
12. [Folding: turning lines into a board](#12-folding-turning-lines-into-a-board)
13. [Keyframes](#13-keyframes)
14. [Checking a file is honest](#14-checking-a-file-is-honest)
15. [Annotations](#15-annotations)
16. [Turning a file into a story](#16-turning-a-file-into-a-story)
17. [Privacy](#17-privacy)
18. [Versions and unknown things](#18-versions-and-unknown-things)
19. [File type](#19-file-type)
20. [Test vectors](#20-test-vectors)
21. [What is still not verified](#21-what-is-still-not-verified)
22. [Version history](#22-version-history)

[Appendix A: a whole tiny game](#appendix-a-a-whole-tiny-game)

---

## 1. What this is

A `.swupgn` file is a **text file that remembers a whole game of Star Wars: Unlimited**.

Chess has PGN. This is the same idea, for SWU.

The file is a list of lines. Each line says one thing that happened, in order. Read the
lines from top to bottom and you can rebuild the board exactly as it was — **without
needing the game engine**. That is the whole point.

You can:

- **read the game** like a story,
- **rebuild the board** at any moment — **without knowing the rules of the game**: every
  change to the board is a line, and no line's meaning depends on a rule (see
  [§11](#what-the-board-covers-against-the-rules)),
- **jump to any round** instantly (see [keyframes](#13-keyframes)),
- **add notes** afterwards ("this attack was a mistake"),
- **share it safely** — no real names are in the file.

---

## 2. How to read this spec

Some words are rules, not suggestions:

- **MUST** — you have to do this, or your file/reader is broken.
- **MUST NOT** — never do this.
- **SHOULD** — do this unless you have a real reason not to.
- **MAY** — your choice.

(This is [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) wording.)

**When this document and the code disagree, the code in `swupgn/` wins.** This document
is meant to describe that code exactly. If you find a difference, that's a bug in this
document — please fix it here.

---

## 3. Who has to do what

There are four jobs. You might do one, or all of them.

### The Writer (makes files)

- MUST write every required header tag ([§5](#5-the-header-tags)).
- MUST write one JSON object per line, in the right section.
- MUST write a line for **every** change to the board. Nothing silent.
- MUST run `checkKeyframes()` before saving, and MUST report a failure loudly
  ([§14](#14-checking-a-file-is-honest)).
- MUST NOT attach a keyframe that is missing a seat. Leave it off instead
  ([§13](#13-keyframes)).
- MUST record a removal for every token it records a gain for
  ([§10.1](#the-token-gainremoval-contract)).
- MUST NOT emit a `MOVE` with an empty `from`/`to`, or with `from` equal to `to` except to
  rebind an attachment that stays in its arena
  ([§10.1](#101-events-that-carry-board-detail), [the binding rule](#binding-an-attachment-to-its-host)).
- MUST put real values in `Engine` and `Seed` in production output
  ([§5.3](#53-provenance-engine-and-seed)).
- SHOULD emit `%%% CARDS` covering every id the file mentions, and `%%% STORY` matching
  what the renderer produces ([§6.5](#65-the-cards-index), [§16](#16-turning-a-file-into-a-story)).
- MUST NOT put real usernames or any real identifying info in the file.
- MUST record a control change as a `TAKE_CONTROL` carrying `zone` (and `from` when no
  `MOVE` carried the counts), and a leader deployed as a pilot as a `DEPLOY_LEADER` carrying
  `kind: "upgrade"` + `target` — neither is a zone move, so nothing else tells a reader
  ([§10.1](#101-events-that-carry-board-detail)).
- SHOULD write `WriterRevision` in the header, and bump it whenever a reader could see the
  difference in what it writes ([§5.2](#52-you-may-have-these), [§22](#22-version-history)).
- MUST write `RecorderErrors` in the header if any of its handlers failed
  ([§5.2](#52-you-may-have-these)); a silently under-recorded file must not look complete.
- MUST record the resource row as counts: an `EXHAUST_RESOURCES` for every resource that
  becomes exhausted (a cost paid, an ability, a card resourced exhausted), a `READY_RESOURCES`
  accounting for every one that readies — one record per unbroken run, not one per resource —
  and `exhausted: true` on a `MOVE` out of `resource` when the card left exhausted
  ([§10.1](#101-events-that-carry-board-detail)).
- MUST name the host with `attachedTo` on the `MOVE` that attaches a card, and MUST NOT name
  one on any `MOVE` out of an arena or out of `base` — exits are host-less
  ([§10.1](#binding-an-attachment-to-its-host)).
- MUST record a capture as a `CAPTURE` whose `p` is the seat that now holds the card and whose
  `by` is the captor — `base@N` when a base captures — and MUST carry each seat's
  `baseCaptured` in every keyframe, since a base's captive is held by no unit
  ([§10.1](#101-events-that-carry-board-detail)).
- MUST write an `EXHAUST` for a unit that enters play exhausted — the normal case, which no
  attack or ability announces — and nothing for one that enters ready
  ([§10.1](#101-events-that-carry-board-detail)).
- SHOULD stamp `for` on every record that belongs to an action announced after it, so no reader
  has to implement §9.1's heuristic ([§9.1](#91-how-seq-is-built)).
- MUST record the resource row's membership as well as its two counts, and a base's spent Epic
  Action as `baseEpicActionUsed` ([§11](#11-the-board-you-build-reducedstate)).
- MUST name the destination arena in a `CREATE_TOKEN`'s `zone`, and MUST omit `power`/`hp`
  rather than invent them when the token cannot yet report its live stats
  ([§10.1](#101-events-that-carry-board-detail)).
- MUST write a `LEADER_FLIP` whenever a double-sided leader turns over, carrying the face it
  landed on, and MUST carry `onStartingSide` in every keyframe for that leader — the flip is not
  a zone change, so nothing else records it ([§10.1](#101-events-that-carry-board-detail)).
- MUST write a `STATS` record whenever an in-play unit's live power, HP or keywords change,
  with the values the engine computed — a reader has no rules engine to derive them
  ([§10.1](#stats)).
- MUST mark a `DEPLOY_LEADER` or `ABILITY_ACTIVATE` that spends an Epic Action with `epic: true`,
  and MUST carry the leader's status, the deck count and the initiative counter's status in
  every keyframe ([§11](#11-the-board-you-build-reducedstate)).
- MUST take a keyframe's snapshot at the moment its `seq` names, **before** the engine cleans up
  after that moment. A `ROUND_END` snapshot taken a step late reports the between-rounds state —
  `initiativeTaken: false` for a round that claimed, `phase: "setup"` for a round that just
  finished its regroup — and fails [§14](#14-checking-a-file-is-honest) every time
  ([§13](#13-keyframes)).
- SHOULD say what KIND of ability an `ABILITY_ACTIVATE` was, and MUST give an action or Epic one
  its own step number rather than filing it under the last action — which for an ability used
  after the opponent's turn is the opponent's `PASS`
  ([§10.1](#101-events-that-carry-board-detail), [§9](#9-the-events-section-and-seq-numbers)).
- MUST write a `DEFEAT`'s `reason` from the closed set, and MUST NOT invent a value outside it
  ([§6.4](#64-small-vocabularies)).
- SHOULD name what healed with `src` on a `HEAL`: nothing later in the file can supply it
  ([§10.1](#101-events-that-carry-board-detail)).
- MUST NOT silently discard an undo. A writer that drops the retracted records MUST count them
  in `Undos` and SHOULD leave an `UNDO` note where the truncation happened
  ([§5.2](#52-you-may-have-these), [§10.2](#102-events-that-are-just-notes)).
- MUST NOT put `ms` on anything but a numbered action, a `ROUND_START` or a `PHASE_START`, and
  MUST write it as a duration from `Date` rather than a wall-clock time
  ([§5.2.1](#521-timing-ms)).
- MUST record an upgrade attached to a base (Fortify) as a `MOVE` into `base` with
  `attachedTo: "base@N"` and a `PLAY_UPGRADE` whose `target` is `base@N`, and MUST carry the
  seat's `baseUpgrades` in every keyframe — a base upgrade is in play in no arena, so `cards`
  cannot hold it ([§10.3](#103-homeworlds-fortify-beast-and-weakness)).
- SHOULD name the granting card in `grantedBy` when an `ABILITY_ACTIVATE` is an ability `card`
  does not print ([§10.1](#101-events-that-carry-board-detail)).
- MUST NOT write a `DAMAGE.src`, `HEAL.src` or `DEFEAT.defeatedBy` that is not a card id or
  `base@N`; when no card is responsible, it omits the field
  ([§10.1](#101-events-that-carry-board-detail)).
- MUST write a `DEFEAT` on `base@N` for every defeated base, before the `GAME_END` it causes —
  above all for a base defeated **outright** by an ability, whose HP does not show it
  ([§10.4](#104-grand-moff-tarkin-and-the-death-star)).
- MUST name a card with two sides by its printed **front** in `%%% CARDS`, with the other side as
  `backSideName` ([§6.5](#65-the-cards-index)), and MUST file a deploy performed by the leader's
  own Epic Action or Action ability as that ability's sub-step, not as a second action
  ([§10.1](#101-events-that-carry-board-detail)).

### The Folder (rebuilds the board)

- MUST read the file shape in [§4](#4-what-a-file-looks-like) without crashing.
- MUST apply every event exactly as [§12](#12-folding-turning-lines-into-a-board) says.
- MUST produce the same `.fold.json` as each test vector.
- MUST treat an event type it doesn't recognise as "do nothing" — a warning, never a crash.

### The Storyteller (makes readable text)

- MUST follow [§16](#16-turning-a-file-into-a-story) exactly.
- MUST produce the same `.render.txt` as each test vector.
- SHOULD resolve names from the file's own `%%% CARDS` index rather than requiring a card
  database, and MUST fall back to the raw id for an id the index doesn't cover.

### The Annotator (adds notes)

- MUST only **add** notes at the end. Never edit or delete an existing note.
- MUST point each note at a `seq` that really exists in the file.
- MUST NOT put a real name in the `by` field.

---

## 4. What a file looks like

A `.swupgn` file is UTF-8 text. Lines end with `\n` (a `\r\n` is tolerated — the parser
trims each line). Blank lines are ignored everywhere.

It has two parts:

```
[Tag "Value"]          ← the header. All the [ ] lines come first.
[Tag "Value"]

%%% STORY              ← the game, written out for a human. PLAIN TEXT, not JSON.
 1. Player 1 plays Wampa to ground (cost 2)
      ↳ 2 damage to Player 2's base — 28 HP left

%%% DECKS              ← every other banner is followed by NDJSON
{...}                  ← one JSON object per line
{...}

%%% CARDS              ← card id → display name, so the file explains itself
{...}

%%% SETUP
{...}

%%% EVENTS
{...}
{...}

%%% ANNOTATIONS
{...}
```

There are six sections. Four carry the game, two make the file usable on its own:

| Section | Contents | Needed? |
|---|---|---|
| `STORY` | the game as readable prose | optional, derived, advisory wording |
| `DECKS` | what each player brought | required in practice |
| `CARDS` | card id → display name | optional, derived |
| `SETUP` | shuffled deck order | required in practice |
| `EVENTS` | everything that happened | the actual game |
| `ANNOTATIONS` | notes added afterwards | optional |

`STORY` and `CARDS` are **derived**: everything in them can be rebuilt from `EVENTS`. They
exist so that a person can open the file and read it, and so that a program can show card
names without shipping a card database. A file without them is still valid — just harder to
use. See [§6.5](#65-the-cards-index) and [§16](#16-turning-a-file-into-a-story).

### The header lines

- Every header line starts with `[`.
- One line MAY hold several tags: `[Format "Premier"] [CardPool "SOR"]`.
- Tag names are letters and digits only, and are **case-sensitive**.
- Values are in double quotes. Inside a value, a backslash means "take the next
  character literally" — so `\"` is a quote and `\\` is a backslash.
- All header lines MUST come **before** the first `%%%` banner. Inside a section, a line
  starting with `[` is a record (a JSON array), not a header: it reaches the JSON path so
  that `validate()` can reject it.
- If the same tag appears twice, the **last one wins**.

The exact pattern used to find tags is:

```
/\[([A-Za-z0-9]+)\s+"((?:[^"\\]|\\.)*)"\]/g
```

### The section banners

A banner is a line starting with `%%%`, then the section name. The name is
case-insensitive (the parser uppercases it). There are exactly six:

`STORY`, `DECKS`, `CARDS`, `SETUP`, `EVENTS`, `ANNOTATIONS`

Sections MAY appear in any order. The canonical order is the one shown above — `STORY`
first, so that opening the file shows the game rather than 500 lines of JSON.

### The record lines

Every non-blank line in `DECKS`, `CARDS`, `SETUP`, `EVENTS` and `ANNOTATIONS` MUST be one
valid JSON object, on one line. That's it — this is NDJSON (newline-delimited JSON).

**`STORY` is the one exception**: it is prose, and its lines are plain text. A parser MUST
NOT try to JSON-parse them, and MUST keep them verbatim — blank lines inside the prose
included, since they are part of the layout. Read everything after the `%%% STORY` banner as
text until the next banner, then drop the blank lines at the very start and end: those are the
spacing around the banners, not part of the story.

### When to throw an error

| What went wrong | Error message |
|---|---|
| A required header tag is missing | `SWU-PGN: missing required header tag [TagName]` |
| A line isn't valid JSON | `SWU-PGN: invalid JSON on line N` |
| A JSON line appears before any banner | `SWU-PGN: record before any %%% section on line N` |

A JSON line under a banner that isn't one of the five NDJSON sections is **not** an error. It
belongs to a later version's section, so a reader skips it and keeps going
([§18](#18-versions-and-unknown-things)); `validate()` reports the section as a warning.

---

## 5. The header tags

### 5.1 You must have these

| Tag | What it holds |
|---|---|
| `Game` | Exactly `"SWU-PGN/1.0"`. |
| `GameId` | A unique id for this one game. Any opaque string. |
| `Date` | When the game started, ISO-8601 UTC, e.g. `"2026-09-04T15:58:16.695Z"`. |
| `CardPool` | Which sets were legal. **This is a comma-separated list**, e.g. `"ASH,HMW,IBH,IC27,JTL,LAW,LOF,SEC,SHD,SOR,TS26,TWI"`. A single set id like `"SOR"` is also valid. |
| `Engine` | Which build wrote the file, e.g. `"forceteki@a1b2c3d"` or `"forceteki@2.3.1"`. See §5.3. |
| `Seed` | The random seed this game actually ran on, e.g. a UUID. See §5.3. |
| `P1Id` / `P2Id` | A fake-but-stable id per player. MUST look like `sha256:<hex>`. See [§17](#17-privacy). |
| `P1` / `P2` | The name shown to humans. MUST be generic — use `"Player 1"` and `"Player 2"`. |
| `P1Leader` / `P1Base` | Player 1's leader and base card ids, e.g. `"ASH#017"`, `"JTL#024"`. |
| `P2Leader` / `P2Base` | Same for Player 2. |
| `Result` | One of `"P1"`, `"P2"`, `"Draw"`, `"Incomplete"`. |
| `Reason` | How it ended, in words, e.g. `"Base Destroyed"`. |
| `Rounds` | How many rounds were played, written as a string of digits, e.g. `"7"`. |

### 5.2 You may have these

| Tag | What it holds |
|---|---|
| `Format` | The tournament format, e.g. `"premier"`. Case is **not** standardised — accept any case. |
| `Perspective` | `"P1"` or `"P2"`. If it's there, the file was recorded through that player's eyes, so the other player's hidden cards MAY be missing. If it's absent, the file sees everything. |
| `EndDate` | When the game **ended**, ISO-8601 UTC. With `Date` (when it started) this gives the game's duration. Absent for an unfinished game, or a writer that cannot tell. |
| `Match` | An opaque id for the **match** this game belongs to, stable across the games of one Bo3. Lets a file that travels on its own — shared, archived, attached to a bug report — still say which match it came from, the way chess PGN's `Round` does. A writer MUST NOT put a host-internal lobby id here; the reference writer emits `sha256:<hex>` of it. |
| `GameNumber` | Which game of that match this is, 1-based, as digits. Meaningless without `Match`. The reference writer never sets it — a game does not know its own place in a series — so it is for whatever delivers the file. |
| `Undos` | How many times a player took a decision back, as digits. **Absent means none.** An undo removes the records it retracted, so a file with no tag and a file whose players undid six times are otherwise indistinguishable — and "was this line of play rehearsed" is a review question. The matching `UNDO` notes say WHERE ([§10.2](#102-events-that-are-just-notes)); this tag is the authoritative count. |
| `WriterRevision` | Which revision of its writer produced the file, as digits, e.g. `"1"`. The writer bumps it on every change to what it writes that a reader can observe, so two files that both say `SWU-PGN/1.0` can be told apart without guessing from their contents ([§22](#22-version-history)). **Absent** on files written before the tag existed — the 1.0 pilot. The reference writer puts it right after `Game`. It is not the build (`Engine` names that, §5.3): many builds share one revision, and a build that changes nothing a reader sees does not bump it. |
| `RecorderErrors` | How many of the writer's event handlers failed while recording, as digits, e.g. `"2"`. **Absent means none.** Present means some events were never written: the keyframes are still exact (they are read from the engine, not folded), but the deltas between them are incomplete, so `checkKeyframes()` will report mismatches and `stateAt()` between keyframes may be wrong. A reader SHOULD surface it. |

Unknown tags MUST be accepted and ignored.

### 5.2.1 Timing: `ms`

There are **no per-event timestamps**. There is one optional integer, `ms`, and it is a
**duration, not a clock**: milliseconds from the header's `Date` to that record.

A writer MAY put it on:

- every **numbered action** ([§16](#16-turning-a-file-into-a-story)) — the plays,
  `DEPLOY_LEADER`, `ATTACK`, `PASS`, `CLAIM_INITIATIVE`, an action or Epic `ABILITY_ACTIVATE`;
- `ROUND_START` and `PHASE_START`.

Nowhere else. A lettered consequence MUST NOT carry one: the engine resolves a play's damage,
defeats and triggers in the same instant as the play, so a number there measures the engine
rather than the player, and stamping every record would put a timing field on two thirds of the
file to say nothing.

The fold ignores it entirely, and so does the story. `Date` and `EndDate` give a game's total
duration and nothing else; "how long did this decision take" is a review question in exactly the
way chess PGN's `%clk` is, and no arrangement of the two header tags reaches it.

**What this costs, and it is not nothing.** Inter-action timing is a behavioural fingerprint.
[§17](#17-privacy) goes to some trouble to make a player unlinkable across files — the reference
salt is per-game, and a publishing deployment is required to switch to a keyed one — and a
corpus carrying `ms` can be clustered by playing rhythm even though every id in it differs. A
deployment publishing files at scale SHOULD weigh that; a writer MAY omit `ms` and stays
conformant, since it is optional everywhere.

### 5.3 Provenance: `Engine` and `Seed`

These two tags are what make a file traceable and replayable. **Production output MUST
carry real values in both.**

- **`Engine`** MUST name the build that produced the file — a git SHA, a release version,
  anything that identifies **one** build. Without it you cannot tell which build produced a
  bad replay, which is exactly the position a bug report leaves you in. The reference writer
  resolves, in order: the `FORCETEKI_VERSION` environment variable, the git SHA of its working
  tree, then its package version. The package version comes last because it never changes
  between deploys (`package.json` has said `0.1.0` for the project's whole life, so every
  production file once read `forceteki@0.1.0` and identified nothing). A deployed image has
  no `.git`, so **production MUST set `FORCETEKI_VERSION` from the commit CI built**.

  **A build identifier names the CODE THAT RAN, not the last commit.** A bare HEAD SHA does
  not: a day of writer changes on one commit stamps every file identically, and a reader
  holding a defective file and a fixed one cannot tell them apart from the header. So a writer
  resolving its own SHA MUST mark an uncommitted tree — the reference writer appends `-dirty`
  (`forceteki@7dd39a09-dirty`), the convention `git describe --dirty` uses. A reader SHOULD
  treat a `-dirty` build as a development build and not attribute it to the named commit.

  A writer that caches this value for its process lifetime (the reference writer does, because
  shelling out to git on a game-end path would block every concurrent game) MUST re-resolve it
  on restart. A long-running development server keeps stamping the SHA it started with.
- **`Seed`** MUST be the seed the game's RNG actually ran on. A writer whose RNG self-seeds
  from entropy MUST generate and record a seed instead, otherwise the seed is unrecoverable
  and [§8.1](#81-determinism)'s deterministic replay is impossible.

Two sentinel values are reserved for when a writer genuinely cannot do better. Both tags
are required and must be non-empty, so a sentinel is used rather than an empty string:

| Value | Means | What a reader may assume |
|---|---|---|
| `"forceteki@unknown"` (any `@unknown`) | Provenance unavailable | The file is **untraceable**. Do not attribute it to any known build. |
| `"unseeded"` | No seed was recorded | Deterministic replay is **impossible** for this file. The fold still works — it never needs the seed. |

A reader MUST accept a file carrying either sentinel; they mark missing information, not a
malformed file. A reader SHOULD surface them rather than presenting the file as fully
traceable.

---

## 6. The names used inside a file

Everything in a file refers to things by short strings. Here they all are.

### 6.1 Card ids

| Shape | Means |
|---|---|
| `SET#NUM` | A card, e.g. `ASH#017`. |
| `SET#NUM:N` | The Nth **copy** of the same card in the same game, e.g. `ASH#110:2` is the second copy. The first copy has no suffix. |
| `TOKEN:<name>#<id>` | A token, e.g. `TOKEN:advantage#5844562972`. |
| `TOKEN:<name>#<id>:N` | The Nth copy of a token, e.g. `TOKEN:advantage#5844562972:2`. |

#### The `TOKEN:` grammar

```
TOKEN:<internalName>#<cardId>[:<copy>]
  │        │            │        └── copy number, 2 and up; absent for the first copy
  │        │            └─────────── THE RESOLVABLE PART: the token's real numeric card id
  │        └──────────────────────── internal name, e.g. "advantage" — readable, not for lookup
  └───────────────────────────────── literal prefix marking this as a token, not a SET#NUM card
```

- The **`TOKEN:` prefix is normative**: a reader keys off it to tell a token from a
  `SET#NUM` card, so it MUST be present.
- **`<cardId>` is the part you resolve.** It is the same numeric id the card database and
  the token image pipeline use, so art and metadata are a direct lookup. Do not try to
  resolve `<internalName>` — it is there to keep the id readable.
- `TOKEN:<name>` with **no** `#<cardId>` is a degraded form, emitted only when a writer
  could not determine a numeric id. It is stable and usable as an identity, but a reader
  MUST NOT expect to resolve art from it. A writer MUST use this form rather than emit a
  non-numeric placeholder: some tokens carry ids like `weakness-id` in their card data, and
  `TOKEN:weakness#weakness-id` would look resolvable while being useless.

The `:N` suffix is what makes each card **unique for the whole game**, so `EXHAUST` on
`ASH#110:2` can never hit the wrong copy. When you look up a card's *display name*,
strip the `:N` first (`baseId()` does this).

#### Extracting the resolvable id — strip `:N` FIRST

The copy suffix is always **last**, so on a token it trails the numeric card id rather than
sitting between the name and the id:

```
TOKEN:advantage#5844562972:2
                └────────┘└┘
                  cardId  copy
```

A reader that splits on `#` before removing the suffix gets `5844562972:2`, which fails any
numeric check — the second copy of a token then silently loses its art, while the first copy
resolves fine, so the bug looks like bad data rather than bad parsing.

```js
// WRONG — yields "5844562972:2" for the second copy
const cardId = id.split('#')[1];

// RIGHT — strip the copy suffix, then split
const cardId = baseId(id).split('#')[1];   // baseId(x) = x.replace(/:\d+$/, '')
```

The same order applies to `SET#NUM:N`: strip `:N`, then read `SET` and `NUM`. Always
`baseId()` first, for both id shapes and for both art lookup and name lookup.

#### Two reserved token names

Two tokens are neither units nor upgrades, and the format has a field for each: a **Credit
token** (`TOKEN:credit#…`) feeds `credits`, and **the Force token** (`TOKEN:the-force#…`) feeds
`hasForce`. Both live in the `base` zone, arrive from and return to `outsideTheGame`, and are
recognised by these two names in the `TOKEN:<name>#` grammar — the format defines the two
fields, so it has to define what drives them ([§12.1](#121-the-move-rule-the-big-one)). No
other token name is reserved; every other token is classified by `kind`.

### 6.2 Zone names

These are the strings that appear in `from`, `to`, and `zone`:

| Zone | Means |
|---|---|
| `deck` | Face-down draw pile. |
| `hand` | A player's hand. |
| `resource` | The resource row. |
| `ground` | The ground arena. **In play.** |
| `space` | The space arena. **In play.** |
| `discard` | The discard pile. |
| `base` | The base zone: where an undeployed or defeated leader sits, where Credit tokens and the Force live, and where an upgrade with **Fortify** attaches ([§10.3](#103-homeworlds-fortify-beast-and-weakness)). |
| `outsideTheGame` | Nowhere — where tokens come from and go back to. |
| `capture` | Cards captured by an opponent. |

That is the **complete** list — it is the engine's zone set, with the two arenas written as
`ground` and `space` rather than `groundArena`/`spaceArena`. Any other string in a `from`,
`to` or `zone` field is non-conformant.

Only `ground` and `space` count as "in play". That matters a lot in
[§12](#12-folding-turning-lines-into-a-board).

### 6.3 Pointing at a base

A base is written `base@N`, where N is the seat number: `base@1`, `base@2`.

A base **activating its own ability** is `base@N` too, in `ABILITY_ACTIVATE.card`. That one is
load-bearing rather than cosmetic: a base's Epic Action and a leader's are separate abilities on
separate cards, and the folded board holds no base *card* id to match a `SET#NUM` against — the
seat ref is what lets a reader tell them apart ([§10.1](#101-events-that-carry-board-detail)).

Anything that is **not** `base@N` in a `tgt` / `def` / `CHOICE.offered` / `ABILITY_ACTIVATE.card`
/ `ABILITY_ACTIVATE.grantedBy` / `TRIGGER.card` / `PLAY_UPGRADE.target` / `MOVE.attachedTo` /
`DAMAGE.src` / `HEAL.src` / `DEFEAT.card` / `DEFEAT.defeatedBy` / `CAPTURE.by` field is a card id.
A base is `base@N` **everywhere** it is pointed at, including when a target prompt offered it,
when it is the host of a Fortify upgrade, when it captures a unit (Arrest), and when one of its
abilities dealt damage or healed —
never its `SET#NUM` card id. (The header's `P1Base`/`P2Base` and the `%%% CARDS` index name
the base *card*; a `base@N` ref names the *thing being hit*.)

### 6.4 Small vocabularies

| Field | Values seen in real files (more MAY appear) |
|---|---|
| `damageType` | `combat`, `ability`, `excess`. Overwhelm onto a base is written as its own `OVERWHELM` record, never as a `DAMAGE` with `damageType: "overwhelm"`. |
| `defenderType` | `unit`, `base` |
| `DEFEAT.reason` | **Closed — see below.** |
| `CHOICE.prompt` | The prompt's title as the engine built it. For an attack-target choice this is the attacking card's name. |
| `STATUS_TOKEN.token` | `advantage`, `weakness` — the internal name of any token upgrade that is not a Shield or an Experience, so a token upgrade printed tomorrow needs no format change |
| `PHASE_START.phase` | `setup`, `action`, `regroup` |
| `ABILITY_ACTIVATE.ability` | `card-slug#subtitle_triggered_N`, `card-slug_action_N`, `name_anonymous`. An engine-internal slug: useful in a bug report, **never** something to branch on. Its `kind` is the field for that ([§10.1](#101-events-that-carry-board-detail)). |

Treat all of these as **open lists**. A reader MUST NOT crash on a value it hasn't seen.

**`DEFEAT.reason` is the exception: it is CLOSED.** It is the only vocabulary a reader is meant
to branch on — "did this unit die in combat or to an effect" changes what a replay shows — so it
is pinned here and in the schema rather than left open:

| Value | What it means |
|---|---|
| `attack` | Combat damage from an attack killed it. `defeatedBy` names the unit that dealt that damage: the attacker, or the defender when the attacker dies to the defender's return damage. |
| `ability` | A card ability defeated it **outright**, with no damage: "defeat a unit" (Vanquish), "defeat a base" (Grand Moff Tarkin), a cost paid by defeating it. `defeatedBy` names that card. |
| `nonCombatDamage` | **Damage** from something that is not an attack killed it — an event, an ability, an ongoing effect. `defeatedBy` names the card that dealt it. |
| `uniqueRule` | The uniqueness rule: a second copy of a unique card that its controller already has in play. |
| `frameworkEffect` | The rules engine, with no card to blame. Four causes, and they are the whole set: an **upgrade whose host left play**; a unit whose **remaining HP fell to its damage without damage being dealt** — a modifier lowered its HP (a Weakness token attaching, a −X/−X effect) or an HP-granting effect expired or was removed; a **leader unit that would have changed control** (it is defeated instead); and a **base killed by damage no card dealt** — drawing from an empty deck. The `STATS` record with the lowered `hp` just before the `DEFEAT` is the reason ([§10.3](#103-homeworlds-fortify-beast-and-weakness)). |
| `unknown` | The writer could not resolve a cause. A reader SHOULD surface this the way it surfaces `RecorderErrors`; it should not appear in a healthy file. |

`frameworkEffect` is deliberately not split further. Its four causes are one thing from the
reader's side — nobody's card did it — and the split a reader would actually want (was this an
upgrade falling off its host?) is already answerable from the record itself: the defeated card
is an upgrade, and its host's own `DEFEAT` sits beside it.

Adding a value here is a **spec revision**: writer, schema and this table move together. A
reader still MUST NOT crash on a value from a newer writer ([§18](#18-versions-and-unknown-things));
treat one as `unknown`.

### 6.5 The CARDS index

Every id above is opaque on its own. `SEC#215` tells a human nothing, and tells a program
nothing unless it ships a card database. The `%%% CARDS` section fixes both: it maps every
id the file mentions to a display name.

One JSON object per line:

```json
{"id":"SOR#108","name":"Wampa","kind":"unit"}
{"id":"TOKEN:advantage#5844562972","name":"Advantage","kind":"upgrade"}
```

| Field | Type | Required | Means |
|---|---|---|---|
| `id` | string | Yes | A **base** id — no `:N` copy suffix, since every copy shares a name. |
| `name` | string | Yes | What to show a human. Include the subtitle: `"Greef Karga, Gracious Magistrate"`. |
| `kind` | `"unit"` or `"upgrade"` | No | What the card is. Lets a reader classify from the id alone — in particular which `TOKEN:` ids are upgrades. **Absent is meaningful: it means neither** — see below. |
| `backSideName` | string | No | The name of the card's **other side**, when it has a different one. `name` is then always the printed **front**. See below. |

**A card with two names.** A few leaders change identity: Grand Moff Tarkin, Tyrant of the
Outer Rim deploys as **The Death Star, Icon of Tyranny**, a different card (a space Vehicle);
Chancellor Palpatine flips to **Darth Sidious**. One id, two names:

```json
{"id":"HMW#004","name":"Grand Moff Tarkin, Tyrant of the Outer Rim","backSideName":"The Death Star, Icon of Tyranny"}
```

The index is an identity, so `name` is the printed front whatever side the card ended the game
on. Which side is up at a given moment is **game state**, carried by the events: a
`DEPLOY_LEADER` (or the leader's `MOVE` from `base` into an arena) shows the back of a deployed
leader with a `backSideName`, its `MOVE` back to `base` shows the front again, and a
`LEADER_FLIP` sets a double-sided leader's face. A keyframe's `leader.deployed` /
`leader.onStartingSide` says the same at a round boundary. A reader showing a name SHOULD show
the side that is up; the renderer does ([§16](#16-turning-a-file-into-a-story)).

**An absent `kind` means "neither a unit nor an upgrade", not "unknown".** `kind` is derived
from the card's printed type, so a writer emits it for every unit and every upgrade and omits
it exactly when the card is neither. That covers more than tokens:

| Card | `kind` | Why |
|---|---|---|
| Wampa, Battle Droid token | `"unit"` | Enters an arena. |
| Ascension Cable, Shield, Experience, Advantage | `"upgrade"` | Attaches to a unit; never enters an arena. |
| Vanquish and every other Event | *absent* | Resolves and goes to the discard pile. |
| A Credit token, the Force token | *absent* | Move `outsideTheGame` ↔ `base`; neither attaches nor takes an arena slot. They drive `credits` / `hasForce` instead ([§6.1](#two-reserved-token-names)). |
| A base, an undeployed leader | *absent* | Neither, by printed type. |

The same rule holds wherever `kind` appears — `%%% CARDS`, `MOVE`, `CREATE_TOKEN`: an Event's
and a Credit token's records carry no `kind`, and every unit's and upgrade's records do, with
one exception: a leader's **undeploy** `MOVE` (`ground` → `base`) is emitted after the engine
has already stopped counting the card as a unit, so it carries no `kind`. Leaving an arena
needs none.

Note that this index reports what a card **is** (its printed type), while the same field on an
event reports what that **event did**. They disagree for pilots, deliberately — see
[§10.1](#kind-on-an-event-is-a-role-kind-in-cards-is-an-identity).

In `%%% CARDS`, a reader MUST therefore treat an absent `kind` as **not an upgrade** (it never
attaches) and equally as **not a unit** (it never joins arena membership). Do not guess from
the id, and do not read the omission as a writer that forgot the field — absent is a positive
statement. A future card that is neither also carries no `kind` and needs no format change to
be handled.

On an **event** the fold never consults identity: a `MOVE` or `CREATE_TOKEN` whose `kind` is
absent is folded as a unit move ([§12.1](#121-the-move-rule-the-big-one) step 3), because
only `"upgrade"` switches that step off. That is deliberate: a writer that cannot report the
role omits `kind`, and the move still folds as the common case rather than being dropped.

Rules:

- A writer SHOULD emit an entry for **every** id that appears anywhere in the file: the
  header's leaders and bases, every `DECKS` entry, and every id an event writes. The reference
  writer takes the **union** of all three — the deck lists alone miss tokens, and the events
  alone miss a leader that was never deployed or a card that was never drawn.
- A reader looks up `baseId(ref)` — strip the `:N` first.
- An id with no entry falls back to **the id itself**. An incomplete index degrades to
  unreadable names, never to a lost event.
- The section is OPTIONAL. Without it a reader needs its own card database.

This is what makes a `.swupgn` self-describing, and it is cheap: about 3% of a real file.

---

## 7. The DECKS section

One line per player. Two lines total.

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | `1` or `2` | yes | Which seat. |
| `leader` | string | yes | Their leader's card id. |
| `base` | string | yes | Their base's card id. |
| `deck` | array of `[id, count]` | yes | The deck list. |
| `sideboard` | array of `[id, count]` | no | The sideboard, same shape. |

No other fields are allowed here (`additionalProperties: false`).

Example:

```json
{"p":1,"leader":"ASH#017","base":"JTL#024","deck":[["ASH#110",3],["ASH#208",3]],"sideboard":[["ASH#207",2]]}
```

---

## 8. The SETUP section

This section holds **one `INIT` line**, and MAY hold nothing else.

| Field | Type | Required | Means |
|---|---|---|---|
| `seq` | string | yes | Always the literal `"R1.S.0"`. |
| `t` | string | yes | Always `"INIT"`. |
| `p1DeckOrder` | string[] | yes | Player 1's whole deck, top card first, **after shuffling**. |
| `p2DeckOrder` | string[] | yes | Same for Player 2. |

The deck order is captured right after the shuffle and before the first card is drawn.
With it plus the `Seed` tag, an engine can replay the same game.

> **Odd but true:** `INIT` uses `seq: "R1.S.0"`, while the setup *events* in the EVENTS
> section use round **0** (`R0.S.1`, `R0.S.2`, …). Don't sort by `seq` string; keep file
> order.

### 8.1 Determinism

The `Seed` tag ([§5.3](#53-provenance-engine-and-seed)) plus these two deck orders are
enough for a compatible engine to re-run the game and get the same random outcomes.

That is a bonus, not the mechanism. Three rules:

- A reader **MUST NOT** need deterministic re-execution to rebuild state. Folding
  ([§12](#12-folding-turning-lines-into-a-board)) is sufficient on its own and needs no
  engine — that is the whole point of recording every delta.
- Seed-based replay is **OPTIONAL**, and exists for analysis (exploring what a different
  line would have done).
- It only holds for a **contemporary engine**. An engine whose game logic has changed since
  the file was written may diverge from the same seed. `Engine`
  ([§5.3](#53-provenance-engine-and-seed)) is what tells you which build to compare against.

---

## 9. The EVENTS section and `seq` numbers

Every line here is one event. Every event MUST have:

| Field | Type | Means |
|---|---|---|
| `seq` | string | A label for this line, unique in the file. |
| `t` | string | The event type. |

Everything else depends on `t`. `event.schema.json` stays open (unknown fields and unknown
types pass, [§18](#18-versions-and-unknown-things)) but pins, per known `t`, the **shape** of
the fields the fold dereferences — `cards` is an array, `amt`/`hp`/`count` are integers, a
`keyframe`'s per-seat lists are arrays — so a malformed file fails `validate()` instead of
throwing inside a reader. **The schema checks shape, not presence**: a field §10 marks
required is not always required by the schema (`DAMAGE.damageType`, `STATUS_TOKEN.token`,
`DRAW.count`, `p` on `PLAY` and `LEADER_FLIP` are not), so a file that omits one can still pass
`validate()`. A writer MUST still write every required field, and a reader MUST NOT throw on
a record that lacks one.

### 9.1 How `seq` is built

The pattern (from `event.schema.json`) is:

```
^R\d+\.(S|A|G)(\.[A-Za-z0-9-]+)?$|^R\d+\.(start|end)(-undo)?$
```

In plain words:

```
R<round>.<phase>.<step>
  │        │       └── action phase: a number, then optionally letters: 1, 2, 2a, 2b … 2z, 2aa, 2ab …
  │        │           setup and regroup: a number only (R8.G.1, R8.G.2 …), never lettered
  │        │           or a word: start, end, game-end
  │        └────────── S = setup, A = action, G = regroup
  └─────────────────── the round number (the setup phase is round 0: R0.S.1)
```

And two special ones per round: `R3.start` and `R3.end`. Any step, and `R3.start` / `R3.end`,
may carry `-undo` ([§10.2](#102-events-that-are-just-notes)).

The letters are **bijective base 26**: `a` … `z`, then `aa`, `ab` … `az`, `ba` …, so an action
with more than 26 consequences still gets a unique label (`R1.A.0ce` is the 83rd).

The numbers-and-letters rule is the useful part:

- **`R2.A.3`** — a *thing a player chose to do*. Play a card. Attack. Pass. Use a card's
  action ability (`ABILITY_ACTIVATE` with `kind: "action"` or `"epic"`).
- **`R2.A.3a`, `R2.A.3b`, `R2.A.3c`** — everything that *happened because of it*.
  The damage. The exhaust. The ability that triggered. In order.

So `3a`, `3b` … `3z`, `3aa` … all belong to action `3`. That's how a reader groups a play with
its consequences.

**One wrinkle, and it is in every real file.** The engine performs part of an action
*before* it announces the action: a card's `MOVE` into the arena lands before its `PLAY`, and
an attack's target `CHOICE` and the attacker's `EXHAUST` land before its `ATTACK`. Those
records are numbered when they arrive, so they carry the **previous** action's number. A real
file reads:

```
R2.A.0a  CHOICE   (target picked)
R2.A.0b  EXHAUST  (attacker exhausts)
R2.A.1   ATTACK
R2.A.1a  DAMAGE
```

**A writer SHOULD file these with `for`, so no reader has to implement that sentence.** `for`
names the action a record belongs to. From the `arrest` vector:

```json
{"seq":"R2.A.2a","t":"CHOICE","p":1,"prompt":"Peridea Bandit","offered":["base@2"],"chose":0,"for":"R2.A.3"}
{"seq":"R2.A.2b","t":"EXHAUST","card":"ASH#190","for":"R2.A.3"}
{"seq":"R2.A.3","t":"ATTACK","p":1,"atk":"ASH#190","def":"base@2","defenderType":"base","ms":7}
```

It is legal on **any** record, and OPTIONAL: a reader that ignores it loses the grouping and
nothing else. Nor does what it names have to be an action: **a resourcing is announced the same
way round** — the card's hand->`resource` `MOVE` lands first and the `RESOURCE` that summarises
it follows — so a writer SHOULD stamp that `MOVE` with the `RESOURCE`'s seq. Left unstamped it
carries the previous beat's number (the draw burst, or the other seat's commit) and a reader
that trusts `for` files the card under the wrong player.

The *recorder* genuinely cannot produce `for` — when those records arrive it does not
yet know an action is about to follow, and guessing would mis-file a previous action's genuine
consequences — but the **writer** holds the whole event list before serialising, so it fills them
in then. The reference writer does this in `linkActionSteps()`.

Its rule, and a writer MUST NOT be looser: walk back from an action over the contiguous run of
records that could precede it, stopping at the first top-level step or any other record type.
File the whole run **only if something in it is anchored to the action**. Without an anchor the
run is just as likely to be the previous action's tail, and a wrong link is worse than none.
There are two anchors:

- a record that **names the action's card** — `card`, or `atk` for an attack; and
- for an action or Epic `ABILITY_ACTIVATE`, a `CHOICE` or `MODAL_CHOICE` whose **chosen option
  is the ability's `title`** (`offered[chose] === title`). A menu prompt carries no card id, but
  the option the player picked is the ability, so it names it as exactly as a card id names a
  play.

`PASS` and `CLAIM_INITIATIVE` name no card, so nothing is ever filed under them.

**Another card arriving in play ends the run.** A `MOVE` of a different card into `ground` or
`space` (or into `base` as an upgrade) is that card's own story, and so are the records naming it
right after its arrival — its `STATS`, its entering `EXHAUST`. A start-of-phase trigger puts
exactly that in front of the first action: Beast Lair's Beast lands, gets its stats and exhausts,
then the player's first play begins with the same record types. The run starts after the
arrival. A card *leaving* (a discard paid as a cost) is not an arrival and stays in the run.

**Which types can precede depends on the action**, and a writer MUST NOT use one shared list:

| Action | May be preceded by |
|---|---|
| `ATTACK` | `CHOICE`, `MODAL_CHOICE`, `EXHAUST` |
| an action or Epic `ABILITY_ACTIVATE` | `CHOICE`, `MODAL_CHOICE` — the menu pick and the target. Its costs (the card exhausting, resources spent) are paid after it is announced, under its own step |
| the plays and `DEPLOY_LEADER` | `MOVE`, `CHOICE`, `MODAL_CHOICE`, `EXHAUST`, `STATS`, `EXHAUST_RESOURCES` |

An attack announces itself after picking a target and exhausting the attacker, and that is all:
it never moves a card or restates its stats. A play does the opposite — the card arrives, gets
its stats, enters exhausted, and the cost is paid — before the `PLAY` is announced. One shared
list gets an **Ambush** unit wrong: it is played and attacks in the same phase, so the play's own
`MOVE` and `STATS` sit immediately before the `ATTACK` and name the same card, and the card-name
anchor does not save you. Those records belong to the play, which already owns them through its
own step number.

So "everything action `N` did" is the `Na…` records *after* it, plus every record carrying
`for: "R<n>.<phase>.N"` — and, in a file whose writer did not stamp them, the trailing
`MOVE` / `CHOICE` / `EXHAUST` before it that name the same card.

An `UNDO` note ([§10.2](#102-events-that-are-just-notes)) takes the seq it reached back to plus
`-undo`: `R2.A.3-undo`. It MUST NOT reuse that seq bare — the writer's counters were rewound
along with the game, so the replay re-issues the very same number and the file would carry two
records claiming to be `R2.A.3`.

`R1.A.start` / `R1.A.end` mark the edges of a phase. `GAME_END` takes its own step,
`.game-end`, in the phase it happened in — `R7.A.game-end` for a base destroyed in the action
phase, `R5.G.game-end` for a concession during regroup. It is its own step because play may
continue after game end, in which case that phase's `PHASE_END` is written too, and every
`seq` in a file is unique.

---

## 10. Every event type

Two groups: events that **change the board**, and events that are **just notes**.

### 10.1 Events that carry board detail

Each one lists its fields, then what it does to the board. The exact code is in
[§12](#12-folding-turning-lines-into-a-board).

Most of these change the folded state. A few — `RESOURCE` is the clearest — are **summary
records** whose actual change is carried by a paired `MOVE`; each says so in its own entry,
and [§12.2](#122-every-other-rule-in-one-table) is the authoritative list of what does and
doesn't move the needle. They are documented here rather than with the pure notes in
[§10.2](#102-events-that-are-just-notes) because they have fields a reader needs.

---

**`MOVE` — a card went from one zone to another.**

| Field | Type | Required | Means |
|---|---|---|---|
| `card` | string | yes | The card id. |
| `from` | string | yes | Zone it left. |
| `to` | string | yes | Zone it arrived in. |
| `p` | 1 or 2 | no | Whose card. Real engine files always include this. |
| `attachedTo` | string | no | The host this move attaches the card to: the card id of a unit, or `base@N` for an upgrade with Fortify. REQUIRED on the move that attaches a card — **into an arena** for a token-upgrade, a printed upgrade or a pilot; **into `base`** for a Fortify upgrade — and ABSENT on every other move, a move **out of** an arena or out of `base` included: exits are host-less, and a reader detaches on the zone transition ([the binding rule](#binding-an-attachment-to-its-host)). |
| `exhausted` | boolean | no | On a move **out of `resource`** only: `true` when the card left the row exhausted, so the fold takes it from `resourcesExhausted` rather than `resourcesReady`. Absent means it left ready. A card played from the resource row pays for itself first, and a resource a friendly effect returns is swapped exhausted on the way out, so this is common. |
| `kind` | `"unit"` or `"upgrade"` | no | The **role this move enacts**, not what the card is. REQUIRED whenever determinable — see below. |

**`MOVE` is the most important event in the format.** It is the *single source of truth*
for hand size, the resource row, credits, the Force, which cards are in play and which cards
are attached to which. Every other "a card went somewhere" event (`DRAW`, `PLAY`, `DISCARD`,
`RESOURCE`) is a **summary** that sits next to the MOVEs, and MUST NOT be counted a second
time.

<a id="kind-on-an-event-is-a-role-kind-in-cards-is-an-identity"></a>
#### `kind` on an event is a ROLE. `kind` in `%%% CARDS` is an IDENTITY.

The field name is the same in both places and the meaning is not. Read it as:

| Where | Answers | Example |
|---|---|---|
| `%%% CARDS` | *What is this card?* | Academy Graduate is `"unit"` — it is a unit card. |
| `MOVE`, `CREATE_TOKEN` | *What did this event do?* | The move that flies it onto an X-Wing is `"upgrade"` — that move attached it. |

**Pilots are why this matters.** A Pilot (Academy Graduate; Han Solo, Has His Moments) is a
unit card that may be played onto a vehicle *as an upgrade*. The same card, in the same game,
is a standalone body when played normally and an attachment when played with Piloting. So a
writer MUST derive an event's `kind` from what the event does, not from the card's type:

```jsonc
// From the pilot vector. Drawn into hand: this move attaches nothing, so the card's own type stands.
{"seq":"R0.S.4","t":"MOVE","card":"JTL#058","from":"deck","to":"hand","p":1,"kind":"unit"}

// Flown onto the X-Wing: this move attaches, so it is an upgrade move.
{"seq":"R2.A.0d","t":"MOVE","card":"JTL#058","from":"hand","to":"space","p":1,"kind":"upgrade","attachedTo":"LAW#253","for":"R2.A.1"}
{"seq":"R2.A.1","t":"PLAY_UPGRADE","p":1,"card":"JTL#058","zone":"space","target":"LAW#253","cost":2,"ms":8}
```

A reader applies `kind` exactly as [§12.1](#121-the-move-rule-the-big-one) says: an
`"upgrade"` move never contributes arena membership. Getting this wrong puts a pilot in an
arena as its own unit — in the *space* arena, for a card whose printed arena is ground — and
no keyframe will agree with the resulting state.

**Every attaching move MUST also carry `attachedTo`, and the matching `PLAY_UPGRADE` MUST
carry `target`.** Without a host there is nothing to attach to: `kind: "upgrade"` correctly
keeps the card out of the arena, so a reader that is told the role but not the host loses the
card entirely and the replay shows the play doing nothing. Note the writer learns the host
only when the attachment happens, which is *after* the move is emitted — so both fields are
resolved at attach time, not at move time. The move **out** again — the pilot's vehicle is
destroyed, the upgrade is defeated — names no host and reports the card's type at that moment
(a pilot leaves as `kind: "unit"`, its role having reverted); a reader detaches on the zone
transition and never needs one ([the binding rule](#binding-an-attachment-to-its-host)).

**Rules for `from` and `to`:**

- Both are REQUIRED and MUST be **non-empty**. `""` is not a zone. A writer that can't
  determine where a card came from MUST NOT emit the event at all.
- Both MUST come from the zone vocabulary in [§6.2](#62-zone-names): `deck`, `hand`,
  `resource`, `ground`, `space`, `discard`, `base`, `outsideTheGame`, `capture`.
- `from` MUST NOT equal `to`. A move that doesn't change zone carries no information, and
  a reader gains nothing from it. Writers MUST drop these rather than emit them — with one
  exception that is not a `MOVE` at all: a Credit token that goes `base` → `base` has changed
  **bases**, because each seat has its own. That is how a Credit token changes hands, and the
  writer records it as the `TAKE_CONTROL` it is (`zone: "base"`, [below](#take_control)).
  The one `MOVE` that may name the same zone twice is an attachment changing while the card
  stays in its arena — an upgrade moved to another host there, or a pilot ejected from a ground
  vehicle. `from` and `to` are that arena, and the record carries the new role and host
  ([the binding rule](#binding-an-attachment-to-its-host)).
- **Building the decks is not a move.** Before the first shuffle every card enters its deck
  from `outsideTheGame`. That is the deck list, which `DECKS` already states and `INIT`
  already orders, so the reference writer does not emit those `outsideTheGame` → `deck`
  records (they were 40 of one organic game's 237 events). A token, or anything else, that
  later enters **play** from `outsideTheGame` is still recorded.

A reader that meets a MOVE breaking any of these rules SHOULD ignore that record and
report the file as non-conformant. It MUST NOT crash.

**Why `kind` exists, and why a reader cannot do without it.** An `upgrade` attaches to a unit
and is NEVER a member of `ground` or `space`; a `unit` is. For an ordinary card you might
guess from a card database, but **tokens make that impossible**: `Shield`, `Experience`,
`Advantage` and `Weakness` are token *upgrades*, while `Battle Droid`, `X-Wing`,
`TIE Fighter`, `Clone Trooper`, `Mandalorian`, `Spy` and `Beast` are token *units* — and every
one appears as `TOKEN:<name>#<id>`. There is nothing else in the record to branch on, and
hardcoding the upgrade names works right up until a new token upgrade is printed.

A writer MUST emit `kind` whenever it can determine it, and MUST derive it from the card's
**type** rather than a name list, so a newly printed token classifies itself. A reader MUST
NOT add a card to an arena when `kind` is `"upgrade"` — steps 1 and 2 of
[§12.1](#121-the-move-rule-the-big-one) still apply, since an upgrade really does leave the
hand.

---

**`PLAY` — a player played a card (usually a unit) from hand.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Who played it. |
| `card` | string | yes | The card id. |
| `zone` | string | no | Where it went. Defaults to `"ground"`. |
| `cost` | integer | no | The card's **printed** cost. Not the resources actually paid: aspect penalties, discounts and Exploit are settled inside the engine's cost payment and never reach the play event. What was paid is the `EXHAUST_RESOURCES` written beside this record ([below](#101-events-that-carry-board-detail)). |

Puts the card in play. The matching `MOVE` (hand → ground) handles the hand count, so
`PLAY` MUST NOT touch `handSize`.

---

**`PLAY_SMUGGLE`** — same fields, same effect as `PLAY`. Played using Smuggle.

---

**`PLAY_EVENT` — a player played an event card.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Who played it. |
| `card` | string | yes | The card id. |
| `zone` | string | no | Recorded for completeness; usually `"discard"`. |
| `cost` | integer | no | The card's **printed** cost. Not the resources actually paid: aspect penalties, discounts and Exploit are settled inside the engine's cost payment and never reach the play event. What was paid is the `EXHAUST_RESOURCES` written beside this record ([below](#101-events-that-carry-board-detail)). |

Event cards go straight to the discard pile — never into play.

---

**`PLAY_UPGRADE` — a player attached an upgrade to a unit, or (Fortify) to their base.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Who played it. |
| `card` | string | yes | The upgrade's card id. |
| `target` | string | no | The unit it went onto, or `base@N` for a Fortify upgrade ([§10.3](#103-homeworlds-fortify-beast-and-weakness)). |
| `zone` | string | no | Where the card went, recorded for completeness. It is **not** a fallback placement. |
| `cost` | integer | no | The card's **printed** cost. Not the resources actually paid: aspect penalties, discounts and Exploit are settled inside the engine's cost payment and never reach the play event. What was paid is the `EXHAUST_RESOURCES` written beside this record ([below](#101-events-that-carry-board-detail)). |

If `target` is given and that unit is on the board, the upgrade id is pushed onto that
unit's `upgrades` list — **idempotently**, because the attaching `MOVE` beside this record
already did the same through `attachedTo` ([§12.1](#121-the-move-rule-the-big-one)). If `target`
is `base@N`, the id goes onto that seat's `baseUpgrades` instead, just as idempotently. Otherwise
the event changes **nothing**: an upgrade is never an arena card, so there is no fallback
placement ([§12.2](#122-every-other-rule-in-one-table)).

---

**`DEPLOY_LEADER` — a leader stepped out of the base zone into an arena.**

Fields: `p`, `card`, optional `zone` (default `"ground"`), optional `cost`, optional `epic`,
and, together, optional `kind` + `target`.
Puts the leader in play — unless it deployed **as a pilot**: then `kind` is `"upgrade"`,
`target` is the vehicle it flew onto, and the leader is pushed onto that unit's `upgrades`
exactly as `PLAY_UPGRADE` does. It is never an arena card of its own.

**Deploying is one action.** When the leader's own Epic Action (or Action) ability deploys it,
that `ABILITY_ACTIVATE` is the numbered action and the `DEPLOY_LEADER` is one of its lettered
sub-steps (`R8.A.1` the Epic Action, `R8.A.1c` the deploy). The player spent one action, and a
reader counting actions counts one.

It also sets the seat's **leader status** ([§11](#11-the-board-you-build-reducedstate)): the
leader is `card`, it is `deployed`, and it is **ready** — a leader deploys ready whatever
state it was in (CR 3.4.4), so this record is where a reader that never saw a keyframe learns
which card the leader is. `epic: true` means the deploy spent the leader's Epic Action, which
is then `epicActionUsed` for the rest of the game (CR 1.16 counts that as game state); an
Action-ability deploy carries no `epic`. The move home is the leader's `MOVE` from the arena
to `base`, with an `EXHAUST` beside it (a defeated Leader Unit comes back exhausted, CR
3.4.5).

---

**`ABILITY_ACTIVATE` — a player used an ability.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Who used it. |
| `card` | string | yes | The card whose ability it is (`base@N` for a base's, [§6.3](#63-pointing-at-a-base)). |
| `kind` | string | no | What sort of ability: `action`, `epic`, `triggered`, `keyword`, `replacement`, `constant`, `event`, `delayed`. |
| `title` | string | no | The ability's printable name, as the card menu shows it. |
| `ability` | string | no | The engine's own identifier. Debugging aid; **not** a stable key. |
| `epic` | boolean | no | The ability was an Epic Action. Equivalent to `kind: "epic"`. |
| `grantedBy` | string | no | The card whose text **gave** `card` this ability — a Fortify upgrade's "Attached base gains: …", an upgrade's "Attached unit gains: …". A card id, or `base@N`. Absent when the ability is `card`'s own printed text. |

Changes nothing — except that `epic: true` marks an **Epic Action** as used. Everything an
ability *did* is recorded by the records that follow it.

**`grantedBy` is how a reader explains an ability `card` does not print.** When Kestro City uses
"Deal 2 damage to a unit", the base has no such text; Heavy Ion Cannon attached to it does. The
writer knows which card granted it and SHOULD say so: `ability` often spells the grantor out
(`gained_from_heavy-ion-cannon_constant_1`), but it is not a stable key, and a reader that parses
it is back to maintaining a regex.

**`kind` is what a reader should branch on.** Without it the only signal is the shape of
`ability` (`…_action_1`, `…_triggered_0`, `mandalorian_keyword_shielded_0`,
`shield_replacement_0`, `reforge_anonymous`) — an engine-internal string this format does not
promise to keep stable, so every reader ends up with its own regex for it. A writer knows the
answer from the ability itself and SHOULD state it.

| `kind` | What fired |
|---|---|
| `action` | A card's "Action:" ability, used as the player's action for the turn. |
| `epic` | An Epic Action. Its own kind because the rules track used/unused as game state (CR 1.16). |
| `triggered` | A "When played" / "On attack" / "When defeated" ability, fired by something else. |
| `keyword` | A keyword's ability (Shielded, Ambush, Restore, …). |
| `replacement` | An ability that replaces an effect before it happens, or modifies incoming damage. |
| `constant` | A continuous ability, active while the card is in play. |
| `event` | An **event card's** own ability. It follows the `PLAY_EVENT` that paid for it. |
| `delayed` | An effect set up earlier in the game that comes due now. |

A writer MUST NOT omit `kind` for an ability it can classify. The reference writer maps the
engine's ability types exhaustively, so a type nobody has mapped is a compile error rather than
a record that quietly ships without the field — which is how `event` reached a published export
missing its `kind` in the first place.

**`title` is the ability's full printed text, not a short caption.** It is whatever the card's
menu entry says, which for most cards is the entire rules text ("Choose a friendly unit and
give it +2/+2 for this phase. Then, …" — 140 characters). The engine has no shorter name to
offer, so a reader wanting a caption should build one from `kind` plus the card name and keep
`title` for a tooltip or detail line.

**`title` carries icon markup.** The engine writes keywords, resource costs and aspects as
tokens that a client draws as icons. There are three forms, and nothing else in `title` is
markup:

| Token | Means | Plain text |
|---|---|---|
| `{keyword:<name>}`, `{keyword:<name>:<n>}` | a keyword, with its number if it has one | the keyword, capitalised: `{keyword:restore:1}` → `Restore 1` |
| `{resource:<n>}` | a resource cost | `<n> resource` / `<n> resources` |
| `:<aspect>:` | an aspect icon: `vigilance`, `command`, `aggression`, `cunning`, `villainy`, `heroism` | the aspect, capitalised |

`<name>` and `<aspect>` are lowercase, and `<n>` is digits. Two aspect tokens can sit side
by side with nothing between them. From a real game:

```
"title":"Disclose :aggression::heroism: to create a Spy token and ready it"
"title":"Pay {resource:2} to move this unit to the ground arena and give 2 Experience tokens to it"
"title":"{keyword:shielded}"
```

A reader that draws no icons replaces each token with its plain text ("Disclose Aggression
Heroism to create a Spy token and ready it"). The test vectors carry no markup: the engine
writes the plain text itself when it runs under test, so a reader must handle both.

**`kind: "action"` and `kind: "epic"` are TOP-LEVEL ACTIONS** and take their own step number
([§9](#9-the-events-section-and-seq-numbers)): CR 6.1 lists "use an action ability" among the six things a player
may spend their action on, so it is the player's turn, not a consequence of anyone else's. A
writer that numbers it as a sub-event files it under whatever was numbered last — which for a
leader ability used after the opponent's turn is the **opponent's `PASS`**, and the ability's
own consequences then hang off the wrong player's action. Every other kind IS a consequence of
the action that caused it and stays a sub-step.

**Epic Actions come from two places, and they are separate.** `card` says which:

| `card` | What `epic: true` marks |
|---|---|
| `base@N` ([§6.3](#63-pointing-at-a-base)) | that seat's `baseEpicActionUsed`. A base may carry an Epic Action — 12 do, Tarkintown among them |
| a leader's card id | that leader's `epicActionUsed` |

A leader has exactly **one** Epic Action, its deploy, and both forms of it — deploying as a unit
and deploying as a pilot — share the same limit, so one flag covers it. A base's is a different
ability on a different card and gets its own. Do not collapse the two.

---

**`LEADER_FLIP` — a double-sided leader turned over.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Whose leader. |
| `card` | string | yes | The leader's card id. |
| `onStartingSide` | boolean | yes | The face **after** the flip. `true` is the printed front. |

A **double-sided leader** (Chancellor Palpatine, Playing Both Sides — `TWI#017`) never deploys.
Its Action turns the card over **in place in the base zone**, and the card that comes back up
has a different **title, aspects and traits**. That is not a zone change, so there is no `MOVE`;
it is not a deploy, so there is no `DEPLOY_LEADER`. Without this record nothing in the file says
the leader changed at all, and a reader shows the starting face for the whole game.

Sets the seat's `leader.onStartingSide` ([§11](#11-the-board-you-build-reducedstate)).

**`onStartingSide` is stated, never toggled.** The record carries the resulting face, not "it
flipped", for two reasons: a reader that snapped to a keyframe mid-game can apply it without
knowing the history, and a single dropped record cannot invert every face after it. Applying
the same record twice is therefore harmless.

A writer MUST emit one of these per flip, and MUST carry `onStartingSide` in every keyframe's
`leader` for a double-sided leader ([§13](#13-keyframes)). For any other leader the field is
**absent** — its presence is what tells a reader this leader has a second face at all.

---

<a id="take_control"></a>
**`TAKE_CONTROL` — `p` took control of `card`.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | The new controller. |
| `card` | string | yes | The card id. |
| `zone` | string | no | Where the card is now (`ground`, `space`, `resource`, `base`). |
| `from` | 1 or 2 | no | The seat it left. Present only when this record has to carry the counts (see below). |
| `exhausted` | boolean | no | `resource` only: the stolen resource is exhausted, so the exhausted count moves rather than the ready one. |

**A control change is not a zone change**, so no `MOVE` accompanies it: a stolen unit stays in
the same arena, a stolen resource stays a resource, a stolen Credit token stays in a base. This
record therefore re-seats the card itself:

- `zone` is an arena → take the card entry, with its damage, exhaustion, tokens, upgrades and
  captives, out of whichever seat's `cards` holds it and push it onto `players[p].cards`.
- `zone` is `resource` and `from` is present → one resource moves from `from` to `p`, in the
  bucket `exhausted` names: `resourcesExhausted` when `true`, `resourcesReady` otherwise
  (never below 0 on the losing side). The card moves with the count: take `card` out of
  `players[from].resources` and add it to `players[p].resources` (once by id). `resources` is
  gated ([§14](#14-checking-a-file-is-honest)), so a reader that moves only the count fails the
  check on both seats for the rest of the game.
- `zone` is `base` and `from` is present → a Credit token: `players[from].credits - 1`,
  `players[p].credits + 1`; the Force token: `players[from].hasForce = false`,
  `players[p].hasForce = true` ([§6.1](#two-reserved-token-names)).
- otherwise → nothing.

`from` is omitted when the steal **did** change zone (a unit taken straight into the resource
row): a `MOVE` was written beside it and already carried the counts, and shifting them twice
would be wrong. A Credit token steal is written as one of these per token, from the token's
own `base` → `base` move ([the `from`/`to` rules](#101-events-that-carry-board-detail)).

---

**`CAPTURE` — `p` captured `card` with `by`.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | The **captor's controller** — the seat that holds the card from now on. |
| `card` | string | yes | The captured card. |
| `by` | string | no | The captor: a unit id, or `base@N` when a base captures. |

The captured card's own `MOVE` (arena → `capture`) was written just before this and already
took it off the board. This record files it under its captor, idempotently:

- `by` is a unit you track → push `card` onto that unit's `captured` list.
- `by` is `base@N` → push `card` onto seat N's `baseCaptured` list, creating the list if the
  seat has none. A base captures only when an ability says so: Arrest (SEC#195), "Your base
  captures an enemy non-leader unit", whose captive is rescued at the start of the regroup
  phase.
- `by` is absent, or names nothing you track → the card is held nowhere in the fold. It is out
  of play either way.

**`RESCUE` — `card` returned to play under `p`, its owner.**

Fields: `p`, `card`. Take `card` off every card's `captured` list and every seat's
`baseCaptured` list. The `MOVE` out of `capture`
beside it places the card again, and the fold does not depend on which of the two arrives
first. A captor leaving play rescues everything it held: each captive gets its own `RESCUE`
and `MOVE`, and the captor's entry disappears with its list.

---

**`EXHAUST_RESOURCES` / `READY_RESOURCES` — `amount` of `p`'s resources changed ready state.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Whose row. |
| `amount` | integer | yes | How many. |

**The row's READY STATE is counted; its MEMBERSHIP is named.** Two different questions:

- *Which cards are in the row* is fully recoverable — every `MOVE` in and out names its card —
  and the fold keeps it in `resources[]` ([§11](#11-the-board-you-build-reducedstate)).
- *Which of them are exhausted* is not: no record names the individual card that exhausted, so
  that stays two numbers, `resourcesReady` and `resourcesExhausted`, and these two records move
  them.

A reader that draws the resource row needs both. `EXHAUST_RESOURCES` moves `min(amount, resourcesReady)` from ready to exhausted;
`READY_RESOURCES` moves `min(amount, resourcesExhausted)` back. The clamp is the engine's own
behaviour, not leniency: it exhausts as many as it can find.

A writer emits `EXHAUST_RESOURCES` for **every** way a resource becomes exhausted — a cost
paid (the `amount` is what was actually paid, after aspect penalties, discounts and Exploit;
`cost` on the play record stays the printed cost), an ability exhausting resources, a single
resource card exhausted by name, and a card an ability puts into the row exhausted (its `MOVE`
into `resource` counted it ready, so it is one more exhaustion). It emits `READY_RESOURCES` the
same way, and an ability that readies several says how many. A reader MUST tolerate an `amount`
larger than the number actually exhausted — it moves what it finds and no more.

**One record per run, not one per resource.** The engine readies the regroup row a card at a
time, but the row's ready state is a COUNT: there is no per-resource identity for a second
record to be about, and the fold does nothing with these but add `amount` up. A writer SHOULD
therefore fold each unbroken run of same-seat `READY_RESOURCES` with the same `for` (or none)
into a single `amount: N` (a seven-round game carried 54 of them, every one `amount: 1`).
Anything at all between two readyings breaks the run and they stay two records. A record that
another record's `for` or an annotation's `ref` points at is never merged away: merging deletes
its seq, and the pointer would be left citing nothing. Per-card `READY` is untouched — those name
a card, so each one says something.

A card that **leaves** the row is counted by its `MOVE`, in the bucket the move's `exhausted`
flag names ([`MOVE`](#101-events-that-carry-board-detail)).

---

**`CREATE_TOKEN` — a token card was made.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Whose token. |
| `token` | string | yes | The token's id. |
| `zone` | string | yes | The arena the token is **entering**. |
| `power` | integer | no | Its power, if the writer could read it at creation. |
| `hp` | integer | no | Likewise its HP. |
| `kind` | `"unit"` or `"upgrade"` | no | What this event did. |

Puts the token in play in `zone` — unless `kind` is `"upgrade"`, in which case it attaches to
a unit and is not an arena card at all, or `zone` is not an arena, in which case it places
nothing ([§12.2](#122-every-other-rule-in-one-table)).

**`zone` is the arena the token is entering, not wherever the writer found it.** An engine may
well create a token outside the game and move it into play as a separate step — the reference
writer's does — so the token's *current* zone at creation time is `outsideTheGame`. Writing that
would put a card in the folded `cards[]` with a non-arena zone, which no keyframe agrees with. A
reader is defended against it anyway (the fold places arena zones only), but a writer MUST name
the destination.

**`power` and `hp` are optional for the same reason.** A unit's live stats are computed from its
upgrades, which a not-yet-in-play token may not be able to report. Omit them rather than invent
them: the token's `STATS` record after its `MOVE` carries the real values
([§10.1](#stats)).

---

**`DAMAGE` — something took damage.**

| Field | Type | Required | Means |
|---|---|---|---|
| `src` | string | no | What dealt it: a card id, or `base@N` when a base's ability did ([§6.3](#63-pointing-at-a-base)). For combat damage it is the unit that dealt it, so the defender's return damage to the attacker names the **defender**. Absent **only** when the rules themselves dealt it and no card is responsible — drawing from an empty deck. |
| `tgt` | string | yes | `base@N` or a card id. |
| `amt` | integer | yes | How much. |
| `damageType` | string | yes | e.g. `"combat"`, `"ability"`. |
| `hp` | integer | yes | HP left **after** the damage. |

- Base: set that player's `baseHp` to `hp` (the file's number wins).
- Card: add `amt` to that card's `damage` (never below 0).

---

**`OVERWHELM` — spillover damage to a base.**

Fields: `p` (the attacker), `tgt`, `amt`, `hp`.
Only `base@N` targets do anything: set that base's `baseHp` to `hp`.

---

**`HEAL` — damage was removed.**

| Field | Type | Required | Means |
|---|---|---|---|
| `src` | string | no | What healed it, on the same terms as `DAMAGE.src`. |
| `tgt` | string | yes | `base@N` or a card id. |
| `amt` | integer | yes | How much. |
| `hp` | integer | yes | HP left **after** the heal. |

Base: set `baseHp` to `hp`. Card: subtract `amt` from `damage` (never below 0).

**Write `src` whenever you can.** A heal is always somebody's effect, and nothing else in the
file can supply it afterwards: `OVERWHELM` omits its source and a reader still recovers it from
the beat's `ATTACK`, but a heal has no attack to fall back on, so an unsourced `HEAL` says a base
gained 2 HP and nothing at all about why.

---

**`DEFEAT` — a card was destroyed.**

| Field | Type | Required | Means |
|---|---|---|---|
| `card` | string | yes | What was defeated: a card id, or `base@N` for a base. |
| `reason` | string (closed set, [§6.4](#64-small-vocabularies)) | yes | How it was defeated. |
| `defeatedBy` | string | no | The card responsible, or `base@N` when a base's ability did it ([§6.3](#63-pointing-at-a-base)). Absent when no card is responsible. |

Take the card out of play and push its id onto that player's discard pile — and take it off
every card's `upgrades` and `captured` lists and every seat's `baseCaptured`, because a
defeated card is nobody's attachment and nobody's captive. An upgrade was never an arena card, so for one only the detach applies.

**A base is defeated with a `DEFEAT` too**: `card` is `base@N`, and the fold sets that seat's
`baseDefeated`. Every defeated base gets one, whatever defeated it, written right after the
record that did it — the lethal `DAMAGE` or `OVERWHELM`, or the `ABILITY_ACTIVATE` that defeated
it outright — and so before the `GAME_END` it causes. A base that falls while the players
continue playing after the game has ended gets one too, though the engine ends the game only
once:

| How the base fell | `reason` | `defeatedBy` |
|---|---|---|
| An attack's damage (combat, or Overwhelm) took it to 0 | `attack` | the attacker |
| An ability's damage took it to 0 | `nonCombatDamage` | the card that dealt it |
| Damage no card dealt (drawing from an empty deck) | `frameworkEffect` | absent |
| An ability defeated it **outright** — "defeat a base" (Grand Moff Tarkin, Tyrant of the Outer Rim) | `ability` | the card whose ability it was |

The last row is why this exists. A base defeated outright still **has HP**, so `baseHp` alone
cannot tell a reader it fell — the `DEFEAT` is the only record that does
([§10.4](#104-grand-moff-tarkin-and-the-death-star)).

---

**`EXHAUST` / `READY`** — field `card`. Sets `exhausted` to `true` / `false` on the arena card
of that id, on the seat's leader if that is its id, or both. Never written for a card in the
resource row: the row is counted, and those are `EXHAUST_RESOURCES` / `READY_RESOURCES`
([above](#101-events-that-carry-board-detail)).

**Entering play is an `EXHAUST`.** A non-leader unit enters play exhausted (CR 5.4.5.a) — when
played, created, smuggled or rescued — and no attack or ability announces it, so the writer
does: an `EXHAUST` for the card right after its arrival. A unit that enters **ready** (an
"enters ready" effect) gets no record; Ambush is not one of those — an Ambush unit enters
exhausted and attacks anyway. A reader that starts every new card at `exhausted: false` and
applies these records is right; one that assumed the rule instead would be wrong for every
enters-ready unit. Before this record existed every replay showed a just-played unit ready
until the next regroup.

---

<a id="stats"></a>
**`STATS` — an in-play unit's live power, HP and keywords.**

| Field | Type | Required | Means |
|---|---|---|---|
| `card` | string | yes | The unit. |
| `power` | integer | yes | Its power right now, as the engine computes it. |
| `hp` | integer | yes | Its HP right now (the maximum, not remaining HP — damage is separate). |
| `keywords` | string[] | no | Its active keywords, sorted; a numeric one as `"raid 2"`. |

Sets those fields on the card. Printed values, upgrades, tokens, lasting effects ("+3/+0 for
this attack"), Raid while attacking, Grit — the engine has already added them up, and this
record states the result. The writer emits one whenever a unit's live values differ from the
last `STATS` it wrote for that unit, after **every** engine event, so a reader can show the
right numbers at every moment without evaluating a single card ability. A unit's first
`STATS` arrives right after it enters play; a unit that leaves and returns starts over.

**A `STATS` is filed under the action that caused it.** Some effects are applied a step after
the event that set them up: a Fortify upgrade grants its base an ability, and *that* ability
buffs units (Landing Pad's "Friendly space units get +1/+0"). The writer settles every unit's
stats again just before the turn passes, so such a change is a sub-step of the play that caused
it, never of the next player's action.

`keywords` covers what CR 1.16 calls a card's attributes as far as the text box goes: the
keyword abilities in effect (printed, granted by an upgrade, or given for a phase). Full
ability text is not recorded — it is card data, and the `%%% CARDS` index names the card.

---

**`DRAW` — a player drew cards.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Who drew. |
| `count` | integer | yes | How many were drawn: `cards.length` whenever the cards are known. Drawing from a deck with too few cards draws fewer than asked; each missing draw is a `DAMAGE` to the player's base with no `src`. |
| `cards` | string[] | yes | Which ones. MAY be empty if hidden. |

Adds those ids to the known `hand` list, **once by id**. **It does not change `handSize`**,
and it is not the authority on the hand's contents either — the matching deck→hand `MOVE`
lines already did both. `DRAW` is a summary, exactly like `RESOURCE`.

---

**`DISCARD` — a player discarded cards.**

Fields: `p`, `cards`. Adds those ids to the discard pile, **once by id**. **Does not change `handSize`.** The paired `MOVE` into `discard` is the pile's authority.

---

**`RESOURCE` — a player put a card into their resource row.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Who resourced it. |
| `card` | string | yes | The card id. |

**This event changes nothing in the fold.** The `MOVE` into `resource` does all the work;
`RESOURCE` is its human-readable summary, exactly as `DRAW` summarises the deck→hand moves
beside it. It is what lets a reader say "Player 1 resources Wampa" in the story
([§16](#16-turning-a-file-into-a-story)) — a `MOVE` renders nothing.

**Both are always present, and they are not alternatives.** A writer MUST emit exactly one
`RESOURCE` for every move into the `resource` zone, immediately after it. A reader:

- rebuilding the **board** MUST use the `MOVE` and ignore `RESOURCE`
  ([§12.1](#121-the-move-rule-the-big-one)) — counting both would double-count;
- telling the **story** uses `RESOURCE`.

---

**`SHIELD_GAIN` / `SHIELD_USE`** — fields `card`, optional `count` (default 1).
Adds / removes shields (never below 0).

**`EXPERIENCE_GAIN`** — fields `card`, `count`. Adds `count` experience counters.

**`STATUS_TOKEN`** — fields `card`, `token`, `count`. Adds `count` to
`statusTokens[token]`.

#### The token gain/removal contract

Shields, experience, advantage and weakness are all **token-upgrade cards**: a unit gains one
when a token is attached, and loses it when that token is defeated. Both directions MUST be
recorded. Shield and Experience have their own counters; **every other token upgrade is a
status token counted under its own name** — a writer classifies by the card's type, not by a
list, so a token upgrade printed later records itself. Token upgrades never appear in a host's
`upgrades[]`; that list is for printed cards ([§11](#11-the-board-you-build-reducedstate)).

**Gain** — the token attaches to a host:

| Token | Record |
|---|---|
| shield | `{"t":"SHIELD_GAIN","card":"<host>"}` |
| experience | `{"t":"EXPERIENCE_GAIN","card":"<host>","count":1}` |
| advantage, weakness, any other token upgrade | `{"t":"STATUS_TOKEN","card":"<host>","token":"<name>","count":1}` — `<name>` is the token's name, e.g. `advantage` |

**Removal** — the token leaves. This is the **same record with a negative count**:

| Token | Record |
|---|---|
| shield | `{"t":"SHIELD_USE","card":"<host>"}` |
| experience | `{"t":"EXPERIENCE_GAIN","card":"<host>","count":-1}` |
| advantage, weakness, any other token upgrade | `{"t":"STATUS_TOKEN","card":"<host>","token":"<name>","count":-1}` — the same `<name>` as the gain |

Four rules make this work:

1. **A writer MUST emit the decrement.** The token pseudo-card leaving play (its `MOVE` and
   `DEFEAT`) is **not** a removal record — it says a card moved, not that the host lost a
   token. Without the decrement a reader leaves the token on its host for the rest of the
   replay, while the engine's own keyframe reports the host as clean.
2. **`card` is the HOST, not the token.** The token names itself in its own `MOVE` /
   `DEFEAT` records; these records name the unit whose counter changes.
3. **Counts clamp at zero.** `max(0, current + count)`. A removal with no matching gain
   must not drive a counter negative.
4. **A key that reaches zero is DELETED**, not left as `{"advantage": 0}`. This is
   load-bearing: an engine keyframe writes a unit with no tokens as `statusTokens: {}`, and
   the integrity check ([§14](#14-checking-a-file-is-honest)) compares the two **as JSON**.
   `{"advantage": 0}` is not equal to `{}`, so a reader that keeps the zero key will fail
   the gate on a file that is perfectly correct. Same for `experience` and `shields`, which
   are plain numbers and simply clamp to `0`.

By the end of a game every gain has a matching removal, unless the token was still on its
host when the game ended.

#### Binding an attachment to its host

Every card that attaches — a token upgrade, a printed upgrade, a pilot — is bound to its host
by **`attachedTo`** on the `MOVE` that carries it **into the arena**. From the `upgrades` vector:

```json
{"seq":"R1.A.1b","t":"MOVE","card":"TOKEN:advantage#5844562972","from":"outsideTheGame","to":"ground","p":1,"kind":"upgrade","attachedTo":"ASH#251:2"}
{"seq":"R1.A.1c","t":"STATUS_TOKEN","card":"ASH#251:2","token":"advantage","count":1}

{"seq":"R3.A.0c","t":"MOVE","card":"LOF#215:2","from":"hand","to":"ground","p":1,"kind":"upgrade","attachedTo":"ASH#251:2","for":"R3.A.1"}
{"seq":"R3.A.1","t":"PLAY_UPGRADE","p":1,"card":"LOF#215:2","zone":"ground","target":"ASH#251:2","cost":2,"ms":28}
```

An attachment that changes while the card stays in its arena — a printed upgrade moved to
another host in the same arena, or a pilot ejected from a ground vehicle — is a `MOVE` whose
`from` and `to` are that arena: `kind: "upgrade"` with the new `attachedTo`, or `kind: "unit"`
with no host for the ejected pilot. A reader treats it like any other move: a card arriving
as a unit is no one's upgrade, and one arriving as an upgrade is on the host it names.

**A reader MUST use `attachedTo` and MUST NOT infer the host from event adjacency.** The
fact that the `STATUS_TOKEN` happens to be the next record is an accident of how the writer
emits them, not a guarantee. `attachedTo` is the normative binding, and the fold applies it
([§12.1](#121-the-move-rule-the-big-one) step 3): a printed card goes onto the host's
`upgrades`; a token upgrade goes into the host's counters through its own gain record.

**A base can be the host.** An upgrade with Fortify attaches to its player's base, which is not
an arena card, so its `MOVE` goes **into `base`** and names the base as `base@N`; the fold puts it
on that seat's `baseUpgrades` ([§12.1](#121-the-move-rule-the-big-one) step 2c). From the
`homeworlds` vector:

```json
{"seq":"R2.A.0k","t":"MOVE","card":"HMW#271","from":"hand","to":"base","p":1,"kind":"upgrade","attachedTo":"base@1","for":"R2.A.1"}
{"seq":"R2.A.1","t":"PLAY_UPGRADE","p":1,"card":"HMW#271","zone":"base","target":"base@1","cost":3,"ms":8}
```

**Exits are host-less.** The move back out — the token defeated, the upgrade destroyed, the
pilot's vehicle Vanquished, the Fortify upgrade sacrificed — carries no `attachedTo`, and its
`kind` is whatever the card is at that moment (a pilot leaves as `kind: "unit"`). A reader MUST
NOT wait for a host to be named on the way out: **a card leaving an arena or the `base` zone,
or being defeated, comes off every host** — keyed on the zone transition, not on `kind`
([§12.1](#121-the-move-rule-the-big-one) steps 0 and 2c). One shape for every exit, and nothing
for a writer to remember.

---

**`ROUND_START`** — field `round`; optional `active`, `ms` and `keyframe`. Sets the round
number, and `active` when present. See [§13](#13-keyframes) for what `keyframe` does.

**`PHASE_START`** — field `phase`; optional `active` and `ms`. Sets the phase, and `active`
when present.

`active` is the seat whose turn it is, `1` or `2`. The writer states it whenever the engine has
an action-phase active player, so the action phase's `PHASE_START` and every `ROUND_START`
carry it, and the setup and regroup `PHASE_START`s do not
([§11](#11-the-board-you-build-reducedstate)). `ms` is in [§5.2.1](#521-timing-ms).

**`CLAIM_INITIATIVE`** — field `p`. Sets who has initiative.

### 10.2 Events that are just notes

These never change the board. A folder MUST read them and do nothing.

| `t` | Fields | Means |
|---|---|---|
| `ATTACK` | `p`, `atk`, `def`, `defenderType` | An attack was declared. For a base attack, `def` is `base@N`. |
| `PASS` | `p` | A player took the **Pass** action. It is never written after a play, an attack, an action ability or a claimed counter — those are actions of their own, and the turn passing to the opponent afterwards is not a record. The action phase ends when both players pass one after the other, or a player passes after the other has claimed the initiative (CR 6). |
| `CHOICE` | `p`, `offered` (string[]), `chose` (index), `prompt` (optional) | A player picked from a list. |
| `MODAL_CHOICE` | `p`, `offered`, `chose` | A player picked an ability mode. |
| `MULLIGAN` | `p` | A player mulliganed. |
| `KEEP_HAND` | `p` | A player kept their hand. |
| `SHUFFLE` | `p` | A deck was shuffled. |
| `SEARCH` | `p`, `found` (optional), `zone` (optional) | A player searched. See the rule below. |
| `REVEAL` | `p`, `zone`, `cards` | Cards were shown. |
| `TRIGGER` | `card`, `p` (optional) | A triggered ability fired. |
| `PHASE_END` | `phase` | A phase ended. |
| `ROUND_END` | `round`, `keyframe` (optional) | A round ended. |
| `GAME_END` | `winner` (1, 2, or `"Draw"`), `reason` | The game is over. |
| `UNDO` | `at`, `by` (optional seat) | A player took a decision back. See the rule below. |

> **`UNDO` — the one record about the FILE rather than the game.** An undo deletes the records
> it retracted, so folding is already right without it: there is nothing left to undo. But
> without a note, a file that had six retractions reads exactly like one that had none, and a
> reader reviewing the game cannot tell a clean line of play from a rehearsed one. So the writer
> leaves a mark where the truncation happened.
>
> `at` is the seq of the first record that was dropped. This record's own seq is that value plus
> `-undo` (`R2.A.3-undo`), the same hyphen form `game-end` uses — it MUST NOT simply reuse `at`,
> because the writer's counters were rewound too and the replay re-issues that very number.
> `by` is the seat that asked for the undo, when the writer knows it.
>
> The header's `Undos` count is AUTHORITATIVE and these records are best-effort: an `UNDO` note
> is an ordinary record, so a later, deeper undo can truncate one away. `Undos` MAY therefore
> exceed the number of `UNDO` records in the file. It never goes the other way.

> `ROUND_END` is in this list because it has no delta of its own — but if it carries a
> `keyframe`, the fold still snaps to it. Same rule as `ROUND_START`.

### What a search emits

Searching a deck looks at cards and usually puts most of them back. A conformant search
emits:

1. one **`SEARCH`** record. `found` is optional, and the reference writer omits it: the
   engine announces the search before the player has chosen, and what left the deck is
   stated by the `MOVE` in step 3;
2. a **`REVEAL`** where the opponent gets to see the cards too;
3. a **`MOVE`** for **only** the card (or cards) that actually **leave** the searched zone.

**Examining a card produces no `MOVE`.** A card that is looked at and put back has not
changed zone, so there is nothing to record — and a `deck` → `deck` record would break the
`from` ≠ `to` rule above anyway. This matters more than it sounds: two searches in one real
game once produced 28 of that file's 136 MOVE records, all of them noise.

### 10.3 Homeworlds: Fortify, Beast and Weakness

Homeworlds (`HMW`) puts three things on the board that a reader has to get right. None of them
needs a new event type. Fortify needs one new board field, `baseUpgrades`
([§11](#11-the-board-you-build-reducedstate)), and a base as a host; Beast and Weakness tokens
follow the token rules that already exist. This section shows each one as it appears in a file.
Every record quoted is from the `homeworlds` test vector ([§20](#20-test-vectors)), which plays
all three in one real game. `swupgn/test-vectors/homeworlds.swupgn` is the file to test a reader
against.

#### Fortify: an upgrade on a base

> *Fortify (Attach this to your base, not a unit.)* Fifteen Homeworlds upgrades have it — Beast
> Lair, Landing Pad, Heavy Ion Cannon, Carbonite Chamber, Alliance Shield Generator, Military
> Academy, Verdant Fortress, … While attached, the base has whatever "Attached base gains: …"
> gives it.

**Attaching.** A Fortify upgrade's `MOVE` goes **into `base`**, not into an arena, and names the
base as its host. The `PLAY_UPGRADE` beside it points at the base the same way:

```json
{"seq":"R1.A.0c","t":"MOVE","card":"HMW#147","from":"hand","to":"base","p":1,"kind":"upgrade","attachedTo":"base@1","for":"R1.A.1"}
{"seq":"R1.A.1","t":"PLAY_UPGRADE","p":1,"card":"HMW#147","zone":"base","target":"base@1","cost":2,"ms":3}
```

The fold puts `HMW#147` on `players[1].baseUpgrades` ([§12.1](#121-the-move-rule-the-big-one)
step 2c). It is **never** in `cards`: it is in play, but in no arena. A board that draws a base
should draw its `baseUpgrades` on it. Every keyframe carries them, and the integrity check
compares them ([§14](#14-checking-a-file-is-honest)).

**What the base gains** shows up in the records the gained ability causes. There is no
"the base now has this ability" record, because the ability's text is card data:

- A **static** buff to units (Landing Pad's "Friendly space units get +1/+0", Military Academy's
  Overwhelm, Verdant Fortress's Raid 1) arrives as `STATS` on each affected unit, filed under the
  play that caused it ([§10.1](#stats)).
- A **triggered** or **action** ability the base gains is an `ABILITY_ACTIVATE` whose `card` is
  `base@N` and whose `grantedBy` names the upgrade:

```json
{"seq":"R2.A.0a","t":"ABILITY_ACTIVATE","p":1,"card":"base@1","ability":"gained_from_beast-lair_constant_0","kind":"triggered","title":"Discard a card from your hand to create a Beast token","grantedBy":"HMW#147"}
```

A gained Action (Heavy Ion Cannon's "Action [discard a card from your hand]: Deal 2 damage to a
unit") is `kind: "action"`, so it is the player's numbered action ([§9](#9-the-events-section-and-seq-numbers)).
Damage it deals is written with `src: "base@1"`: the base dealt it ([§6.3](#63-pointing-at-a-base)).

**The upgrade's own abilities** are its own: `card` is the upgrade's id and there is no
`grantedBy`. Carbonite Chamber's "Action [defeat this upgrade]: …" pays its cost by leaving the
base, and the exit is host-less like every other ([§10.1](#binding-an-attachment-to-its-host)):

```json
{"seq":"R2.A.2","t":"ABILITY_ACTIVATE","p":2,"card":"HMW#095","ability":"carbonite-chamber_action_0","kind":"action","title":"Choose a non-Vehicle unit. It doesn't ready during the next regroup phase","ms":9}
{"seq":"R2.A.2a","t":"MOVE","card":"HMW#095","from":"base","to":"discard","p":2,"kind":"upgrade"}
{"seq":"R2.A.2b","t":"DEFEAT","card":"HMW#095","reason":"ability","defeatedBy":"HMW#095"}
```

A **replacement** on a base upgrade (Alliance Shield Generator: "If attached base would be dealt
5 or more damage, prevent that damage") is an `ABILITY_ACTIVATE` with `kind: "replacement"` and
the upgrade as `card`. The prevented damage writes **no** `DAMAGE`, so base HP does not move.

**Leaving.** Any `MOVE` **out of `base`** takes the card off every seat's `baseUpgrades`, and so
does a `DEFEAT` naming it. A sacrificed or destroyed base upgrade goes to its owner's `discard`
on that move, like any other card.

**Who it belongs to.** The seat in `attachedTo` / `target` is the base it is on. The `MOVE`'s `p`
is its owner, whose discard pile it goes to when it leaves. The two are the same unless an
effect let a player attach an opponent's upgrade.

#### Beast tokens: a token unit, sometimes for the opponent

A **Beast** is a 3/3 Creature token **unit** — `TOKEN:beast#6445363199`, `kind: "unit"` in
`%%% CARDS`. It is created like every token unit ([§10.1](#101-events-that-carry-board-detail)):
a `CREATE_TOKEN`, then the `MOVE` from `outsideTheGame` that places it, its first `STATS`, and the
`EXHAUST` it enters play with:

```json
{"seq":"R2.A.0e","t":"CREATE_TOKEN","p":1,"token":"TOKEN:beast#6445363199","zone":"ground","kind":"unit"}
{"seq":"R2.A.0f","t":"MOVE","card":"TOKEN:beast#6445363199","from":"outsideTheGame","to":"ground","p":1,"kind":"unit"}
{"seq":"R2.A.0g","t":"STATS","card":"TOKEN:beast#6445363199","power":3,"hp":3,"keywords":[]}
{"seq":"R2.A.0h","t":"EXHAUST","card":"TOKEN:beast#6445363199"}
```

Three things to get right:

1. **`CREATE_TOKEN.p` is the seat that gets the Beast, not the seat whose ability made it.**
   Homeworlds is full of "An opponent creates a Beast token" (Easy Prey, Babwa Venomor,
   Mysterious Disappearance). If Player 1 plays Easy Prey, the Beast it gives the opponent has a
   `CREATE_TOKEN` and `MOVE` that both say `"p": 2`. Place by `p`, never by the acting player.
   (The `homeworlds` vector has no such Beast: every Beast in it is Player 1's.)
2. **"Create a Beast token and ready it"** (Catch the Scent, Eravana) is a `READY` after the
   `EXHAUST`. The unit was created exhausted and then readied; fold both.
3. **Every Beast is its own copy** (`TOKEN:beast#6445363199:2`, `:3`, …) for the whole game
   ([§6.1](#61-card-ids)). Two Beasts are never the same card.

**A defeated token unit goes back to `outsideTheGame`, not to `discard`.** Its exit `MOVE` says so
(`"from":"ground","to":"outsideTheGame"`), and it is followed by its `DEFEAT`. It never reaches a
discard pile, and a reader must not put it there.

#### Weakness tokens: a −1/−1 token upgrade

A **Weakness** is a token **upgrade** that gives its host −1/−1 — `TOKEN:weakness#7816991190`,
`kind: "upgrade"` in `%%% CARDS`. It follows [the token contract](#the-token-gainremoval-contract)
exactly: a status token counted under its own name, `statusTokens.weakness`:

```json
{"seq":"R3.A.4b","t":"MOVE","card":"TOKEN:weakness#7816991190:3","from":"outsideTheGame","to":"ground","p":1,"kind":"upgrade","attachedTo":"TOKEN:beast#6445363199"}
{"seq":"R3.A.4c","t":"STATUS_TOKEN","card":"TOKEN:beast#6445363199","token":"weakness","count":1}
{"seq":"R3.A.4d","t":"STATS","card":"TOKEN:beast#6445363199","power":0,"hp":0,"keywords":[]}
```

- **Tokens stack.** Each one is its own card (`:2`, `:3`, …) with its own `STATUS_TOKEN` +1, and
  the host's `statusTokens.weakness` is the count. A unit with two reads
  `"statusTokens":{"weakness":2}`.
- **The stat change is stated, not derived.** The `STATS` after the gain carries the result. Do
  not subtract 1 per token yourself: an effect that sets or ignores stats would make that wrong.
- **The `MOVE`'s `p` is the host's side of the board**, not the player who gave the Weakness:
  Player 2's Torrent on Player 1's Beast is a `MOVE` with `"p": 1`. The giver is the `p` of the
  action the token was given under.

**A Weakness can defeat a unit on its own.** Nothing deals damage: the token lowers the unit's HP
to its damage, and the rules defeat it. In the file, the `STATS` with the lowered `hp` comes
first, then the unit's attachments leave, then the unit:

```json
{"seq":"R3.A.4d","t":"STATS","card":"TOKEN:beast#6445363199","power":0,"hp":0,"keywords":[]}
{"seq":"R3.A.4e","t":"MOVE","card":"TOKEN:weakness#7816991190:3","from":"ground","to":"outsideTheGame","p":1,"kind":"upgrade"}
{"seq":"R3.A.4f","t":"STATS","card":"TOKEN:beast#6445363199","power":1,"hp":1,"keywords":[]}
{"seq":"R3.A.4g","t":"STATUS_TOKEN","card":"TOKEN:beast#6445363199","token":"weakness","count":-1}
   … the other two Weakness tokens leave the same way …
{"seq":"R3.A.4n","t":"MOVE","card":"TOKEN:beast#6445363199","from":"ground","to":"outsideTheGame","p":1,"kind":"unit"}
{"seq":"R3.A.4o","t":"DEFEAT","card":"TOKEN:beast#6445363199","reason":"frameworkEffect"}
```

Read this the way the engine resolved it:

- **The defeat is decided at the `hp: 0` `STATS`.** The `STATS` records between it and the
  `DEFEAT` (`1/1`, `2/2`, …) describe the unit as each attachment comes off a host that is
  already being defeated. They are correct values, not a recovery. A replay may show them or skip
  straight to the defeat, but it must not show the unit surviving.
- **The `DEFEAT.reason` is `frameworkEffect`, with no `defeatedBy`** ([§6.4](#64-small-vocabularies)).
  No card dealt damage, so no card is blamed. To say *what* killed it, look back to the action:
  the `STATUS_TOKEN` +1 that caused the `hp: 0` sits under the play that gave the token.
- **Every gain is balanced.** Each Weakness leaving its host has its `STATUS_TOKEN` −1, so the
  unit leaves play with `statusTokens` back to `{}` and no count is left behind.

#### Abilities that depend on a base, or on another card's trait

Many Homeworlds cards check something about **another** card: *"While you control a Kashyyyk
base, this unit gains Ambush"*, *"If an opponent controls an Endor, Kashyyyk, Naboo, or Tatooine
base, draw a card"*, *"When you play a Fortification upgrade: Exhaust an enemy unit"*. The
sixteen Homeworlds bases carry a planet trait (Endor, Kashyyyk, Naboo, Tatooine) for exactly
this.

**A reader never evaluates these conditions.** The engine already did, and the file records the
outcome in the records a reader already folds. Nothing about traits is in the file, and nothing
needs to be. Where each kind of outcome lands:

| The card says | Example | What the file carries |
|---|---|---|
| "While you control … this unit **gains** \<keyword\>" | Wookiee Rangers (Sentinel), Soaring Can-Cell (Ambush), Opee Sea Killer (Grit), Village Troublemaker (Hidden, Saboteur) | the keyword in that unit's `STATS.keywords`, filed under the play that made the condition true — and a fresh `STATS` without it when the condition stops holding (Gunga City Guard loses Shielded the moment the other Gungan is defeated) |
| "If you control … \<do something\>" | Torrent (2 Weakness instead of 1), Raiding Party, Surveillance Cruiser | the records the ability produced (`STATUS_TOKEN`, `EXHAUST`, `DRAW`, …), under the play. When the condition is false, those records are absent |
| "When you play a \<trait\> card" | The Tarkin Doctrine's base, on a Fortification upgrade | an `ABILITY_ACTIVATE` (`kind: "triggered"`, here `card: "base@1"` with `grantedBy`) and its consequences, under the play that met the condition |
| "… costs N less" | Sandstorm, Origin Tree Shyyyo, Queen Amidala ("If you control an upgraded base") | the `EXHAUST_RESOURCES` amount stamped `for` the play. `cost` stays the **printed** cost ([§10.1](#101-events-that-carry-board-detail)) |
| "Friendly units enter play ready" | Ritual Dragon (with a Tatooine base) | **no** `EXHAUST` after the unit arrives. A unit enters ready unless an `EXHAUST` says otherwise |

The one thing a reader may want that the file does not hold is *why*: which trait satisfied the
condition. That is card data. Look up the base in `%%% CARDS` / the header and read its traits
from a card database if you want to explain it.

#### A reader handles Homeworlds if…

| Check | Rule |
|---|---|
| A `MOVE` into `base` with `kind: "upgrade"` adds to `baseUpgrades`, not to `cards` | [§12.1](#121-the-move-rule-the-big-one) step 2c |
| A `MOVE` out of `base`, or a `DEFEAT`, removes from `baseUpgrades` | same |
| `PLAY_UPGRADE.target` and `attachedTo` may be `base@N` | [§6.3](#63-pointing-at-a-base) |
| `ABILITY_ACTIVATE.card` may be `base@N`, and `grantedBy` names the upgrade that gave the ability | [§10.1](#101-events-that-carry-board-detail) |
| `CREATE_TOKEN.p` and the `MOVE`'s `p` decide whose Beast it is | [§10.1](#101-events-that-carry-board-detail) |
| A defeated token unit leaves for `outsideTheGame` and never enters a discard pile | [§12.1](#121-the-move-rule-the-big-one) |
| `statusTokens.weakness` counts stacked tokens, and a key at 0 is deleted | [the token contract](#the-token-gainremoval-contract) |
| Power/HP come from `STATS`, never from counting Weakness tokens | [§10.1](#stats) |
| `DEFEAT` with `frameworkEffect` after an `hp: 0` `STATS` is a Weakness (or −X/−X) kill | [§6.4](#64-small-vocabularies) |
| The `homeworlds` vector folds to `homeworlds.fold.json` and renders to `homeworlds.render.txt` | [§20](#20-test-vectors) |
| Keywords and stats a base or a trait grants are read from `STATS`, never derived from the condition | [§10.1](#stats) |

### 10.4 Grand Moff Tarkin and The Death Star

> **Grand Moff Tarkin, Tyrant of the Outer Rim** (`HMW#004`). Epic Action: *If you control 9 or
> more resources, deploy this leader.* Deployed, he is a different card — **The Death Star, Icon
> of Tyranny**, a 2/12 space Vehicle — with *"When the regroup phase starts: You may defeat a base
> with 10 or less remaining HP."*

This is the first leader whose Leader Unit side has its own name, and the first card that
defeats a base without damaging it. Both need handling.

**The second name.** `%%% CARDS` names the front and gives the back as `backSideName`
([§6.5](#65-the-cards-index)):

```json
{"id":"HMW#004","name":"Grand Moff Tarkin, Tyrant of the Outer Rim","backSideName":"The Death Star, Icon of Tyranny"}
```

It is the **same card id** on both sides, so every rule keyed on the id is unchanged: the seat's
`leader.id`, its `epicActionUsed`, its `exhausted`. Only the name a reader *shows* changes. Show
`backSideName` while `leader.deployed` is true and `name` otherwise. Do not look for a new id:
there isn't one. (The engine's own prompt titles use whichever side is up, so a `CHOICE.prompt`
may read `"The Death Star"`. That field is advisory, [§6.4](#64-small-vocabularies).)

**The deploy is one action.** The Epic Action is the numbered action, and the deploy and the
arrival in **space** are its sub-steps:

```json
{"seq":"R8.A.1","t":"ABILITY_ACTIVATE","p":1,"card":"HMW#004","ability":"grand-moff-tarkin#tyrant-of-the-outer-rim_action_0","kind":"epic","title":"Deploy Grand Moff Tarkin","epic":true,"ms":35}
{"seq":"R8.A.1a","t":"MOVE","card":"HMW#004","from":"base","to":"space","p":1,"kind":"unit"}
{"seq":"R8.A.1c","t":"DEPLOY_LEADER","p":1,"card":"HMW#004","zone":"space","epic":true,"cost":9}
```

**Defeating a base.** At the start of the regroup phase, the Death Star may defeat a base with 10
or less remaining HP — **either** base, its controller's own included. No damage is dealt. The
base falls with its HP intact, and the `DEFEAT` on `base@N` is the only record that says so
([§10.1](#101-events-that-carry-board-detail)):

```json
{"seq":"R8.G.1","t":"CHOICE","p":1,"prompt":"The Death Star","offered":["base@2"],"chose":0}
{"seq":"R8.G.2","t":"ABILITY_ACTIVATE","p":1,"card":"HMW#004","ability":"grand-moff-tarkin#tyrant-of-the-outer-rim_triggered_3","kind":"triggered","title":"Defeat a base with 10 or less remaining HP"}
{"seq":"R8.G.3","t":"DEFEAT","card":"base@2","reason":"ability","defeatedBy":"HMW#004"}
{"seq":"R8.G.game-end","t":"GAME_END","winner":1,"reason":"Base Destroyed"}
```

The folded board ends with Player 2's `baseHp` at 9 **and** `baseDefeated: true`. A replay that
decides "destroyed" from `baseHp <= 0` shows a standing base losing the game. Read
`baseDefeated` instead: it is true for every defeated base, however it fell.

Declining is a `Pass` on the trigger's prompt and writes nothing, and the game goes on.

**The rest of the card** needs nothing new. "Ignore the aspect penalties on upgrades with Fortify
you play" shows up as a smaller `EXHAUST_RESOURCES` for those plays. And as a Vehicle the Death
Star is a legal or illegal target like any other unit: the engine decided, and the `CHOICE.offered`
says what was legal.

| Check | Rule |
|---|---|
| A leader with a `backSideName` is shown by that name while deployed, under the same id | [§6.5](#65-the-cards-index) |
| A deploy performed by the leader's own Epic Action counts as one action | [§10.1](#101-events-that-carry-board-detail) |
| A `DEFEAT` whose `card` is `base@N` sets `baseDefeated`, and nothing else | [§12.2](#122-every-other-rule-in-one-table) |
| "Base destroyed" is `baseDefeated`, not `baseHp <= 0` | [§11](#11-the-board-you-build-reducedstate) |
| The `death-star` vector folds to `death-star.fold.json` and renders to `death-star.render.txt` | [§20](#20-test-vectors) |

---

## 11. The board you build (ReducedState)

This is the whole board, and it's all you ever need to build.

```typescript
interface ReducedState {
    round: number;                            // 0 before the game starts
    phase: 'setup' | 'action' | 'regroup';
    initiative: 1 | 2 | null;                 // who holds the initiative counter
    initiativeTaken?: boolean;                // it was taken this round (back to false each round)
    active?: 1 | 2;                           // whose turn it is — STATED, not derived, see below
    players: Partial<Record<1 | 2, PlayerState>>;
}

interface PlayerState {
    seat: 1 | 2;
    baseHp: number;             // base HP right now
    baseMaxHp: number;          // the base card's printed HP
    handSize: number;           // how many cards in hand
    hand: string[];             // which cards, if we're allowed to know — exact, from MOVE
    deckSize?: number;          // cards left in the deck
    resourcesReady: number;     // ready resources
    resourcesExhausted: number; // spent resources
    resources?: string[];       // WHICH cards are in the row (the split above stays counted)
    baseEpicActionUsed?: boolean; // the BASE's Epic Action is spent (a base may have one)
    baseUpgrades?: string[];    // PRINTED upgrades attached to the BASE (Fortify) — never in `cards`
    baseCaptured?: string[];    // enemy units the BASE holds captured (Arrest) — never on a unit's `captured`
    baseDefeated?: boolean;     // the base has been defeated — by damage OR outright; absent = false
    credits: number;
    hasForce: boolean;
    discard: string[];          // discard pile, in order
    cards: CardInstanceState[]; // ONLY cards in the ground/space arenas (a base upgrade is not one)
    leader?: LeaderState;       // the leader card's status, wherever it is
}

interface LeaderState {
    id: string;                 // the leader card, by the id its own records use (§6.1): the
                                // printed id, except that in a mirror match one seat's copy is "SET#NUM:2"
    deployed: boolean;          // Leader Unit side in play (as a unit, or as a pilot upgrade)
    exhausted: boolean;         // its ready/exhausted flag
    epicActionUsed: boolean;    // its Epic Action is spent for the game
    onStartingSide?: boolean;   // DOUBLE-SIDED leaders only: which face is up. Absent otherwise
}

interface CardInstanceState {
    id: string;            // "ASH#110" or "ASH#110:2"
    zone: string;          // "ground" or "space"
    damage: number;
    exhausted: boolean;
    upgrades: string[];    // PRINTED cards attached to this one: upgrades and pilots
    shields: number;       // Shield tokens
    experience: number;    // Experience tokens
    statusTokens: Record<string, number>;   // every other token upgrade, by name: { advantage: 2 }
    captured: string[];    // enemy units this one holds captured
    power?: number;        // live power, ability effects included — from STATS / keyframes
    hp?: number;           // live HP, likewise
    keywords?: string[];   // active keywords, sorted; "raid 2" for a numeric one
}
```

Token upgrades are never in `upgrades[]`: they are the three counters. `captured` is absent in
files written before it existed; a reader treats absent as `[]`.

`power`, `hp` and `keywords` are the engine's **live** values, stated by `STATS` records
([§10.1](#stats)) and by keyframes. They are absent until the first `STATS` names the card
(older files never do), and a reader never computes them: it is told.

The optional fields marked `?` — `initiativeTaken`, `deckSize`, `leader`, `power`, `hp`,
`keywords`, `resources`, `baseEpicActionUsed`, `baseUpgrades`, `baseCaptured`, `onStartingSide` — are optional only because files
written before they existed lack them. A current writer fills every one that applies, and the
integrity check compares each whenever the keyframe carries it.

**`active` is the one exception, and it is a real one.** It is **stated, not derived**: the
fold takes it from `ROUND_START`, `PHASE_START` and keyframes, which carry it whenever the
engine has an action-phase active player ([§10.1](#101-events-that-carry-board-detail)), and
never works it out from the actions in between. Deriving whose turn it is from the action stream
means modelling passing and priority — exactly the rules knowledge this format exists to spare a
reader ([§11](#what-the-board-covers-against-the-rules)).

**`baseDefeated` is written only when true**, so absent means false — not "not recorded". It is set
by a `DEFEAT` on `base@N` ([§10.1](#101-events-that-carry-board-detail)), and it is the one way to
tell that a base fell: an ability can defeat a base that still has HP
([§10.4](#104-grand-moff-tarkin-and-the-death-star)). A keyframe carries it only once play has
continued past the end of the game.

So `active` is **exact at the start of each round and of each action phase**, and at every
keyframe — the places a scrubber jumps to — and **stale between them**. It is not part of the integrity gate for that reason
([§14](#14-checking-a-file-is-honest)). A reader that shows whose turn it is should show it at a
keyframe and treat it as unknown after the first action of the phase.

<a id="what-the-board-covers-against-the-rules"></a>
### What the board covers, against the rules

The Comprehensive Rules define "the game state" in one paragraph (CR 1.16.1, v8.0): each card's
zone, controller, attributes and status (ready/exhausted, faceup/facedown); the initiative
counter's controller and status; the status of open and hidden information; the status of
lasting and delayed effects; and the status of Epic Actions. The format's promise is that a
reader rebuilds **all of that** from the file with no knowledge of the rules — the engine
already applied the rules, and the file records what it decided. Where each part lives:

| Game state (CR 1.16) | Where the file carries it |
|---|---|
| Each card's **zone** | `MOVE` (every zone change, [§12.1](#121-the-move-rule-the-big-one)); `deckSize`, `handSize`, `hand`, `discard`, the resource counts, `cards`, `captured`, `baseUpgrades`, `baseCaptured`, `credits`, `hasForce`; the leader's `deployed` |
| Each card's **controller** | the seat whose lists hold it; `TAKE_CONTROL` re-seats a unit, a resource, a Credit token or the Force; an upgrade's controller is the `p` of its `PLAY_UPGRADE` |
| Each card's **attributes** — power, HP, keywords, modifiers | `STATS` after every change ([§10.1](#stats)), snapshotted in keyframes; `damage`, `upgrades`, `shields`, `experience`, `statusTokens`. An ability a card has only because another card granted it (a base's "Attached base gains: …") is named by `grantedBy` when it is used |
| Each card's **status** — ready/exhausted | `EXHAUST` / `READY` for arena cards and the leader, including the `EXHAUST` a unit gets on entering play; `EXHAUST_RESOURCES` / `READY_RESOURCES` and the `MOVE.exhausted` flag for the resource row |
| Each card's **status** — faceup/facedown | the leader's `deployed` (Leader Unit side up) and, for a double-sided leader, `onStartingSide` — set by `LEADER_FLIP` ([§10.1](#101-events-that-carry-board-detail)); resources are always facedown, and `RESOURCE` names the card for the omniscient reader |
| The **initiative counter**: controller and taken/available | `initiative` and `initiativeTaken`; `CLAIM_INITIATIVE`, reset at `ROUND_START` |
| **Open and hidden information** | the archive is omniscient ([§17](#17-privacy)): `DRAW`, `RESOURCE`, `SEARCH`, `REVEAL` and the keyframe's `hand` name the hidden cards; `Perspective` in the header says when a file is not |
| **Lasting effects** | by their observable consequences: `STATS` (a unit given +3/+0 for an attack shows it and shows it going away), `keywords` (Sentinel for a phase), and the records they cause. The effect's text is not recorded — the card is named, and card data has the text |
| **Delayed effects** | by the records they produce when they fire (a Change of Heart return is a `TAKE_CONTROL` at regroup); they are invisible until then, as they are on a table |
| **Epic Actions** used/unused | `epic: true` on `DEPLOY_LEADER` / `ABILITY_ACTIVATE`; the leader's `epicActionUsed`, and the seat's `baseEpicActionUsed` — a **base** may carry an Epic Action too (Tarkintown, Security Complex, Jedha City and 9 others), and it is a separate ability on a separate card from the leader's ([§10.1](#101-events-that-carry-board-detail)) |

What the file deliberately does **not** encode is the rulebook itself: why a cost was 4 and
not 5, what Sentinel means, that a unit dies at 0 remaining HP. Those are derivations, and
encoding them would make every file a copy of the engine. A human reads them off the card; a
computer replaying the board never needs them, because every consequence is already a line.
The format covers the two-player game; multiplayer formats (CR 11–12) are out of scope.

### The starting board

`emptyState()` gives you:

```
round: 0, phase: "setup", initiative: null, initiativeTaken: false
players 1 and 2, each:
  baseHp 30, baseMaxHp 30, handSize 0, hand [], resourcesReady 0,
  resourcesExhausted 0, credits 0, hasForce false, discard [], cards []
```

> **Read this bit carefully.** `30` is a **placeholder**, not the truth. Real bases have
> different HP (33, 28, …), and **no event carries a base's starting HP**. You only learn
> it from the **first keyframe**, which the fold then snaps to. So base HP is a guess
> until the first keyframe lands, and correct from then on — every `DAMAGE`, `HEAL` and
> `OVERWHELM` carries an absolute `hp`, so it stays correct. This is why the integrity
> check skips `baseHp` at the first keyframe ([§14](#14-checking-a-file-is-honest)).

---

## 12. Folding: turning lines into a board

**Fold** means: start with an empty board, then apply each event in order. That's it.

```
fold(events):
  state = emptyState()
  for each event e:
    if (e.t is ROUND_START or ROUND_END) and e.keyframe is not damaged:   # see §13
      state = deepCopy(e.keyframe)   # the keyframe is the truth
      continue                       # and skip the normal rule
    state = reduce(state, e)
  return state
```

**Every list the fold grows is capped at 1000 entries.** `cards`, `hand`, `discard`,
`resources`, `baseUpgrades`, `baseCaptured`, a card's `upgrades` and `captured`, and the
number of distinct names in a card's `statusTokens`: an id that would be entry 1001 is
dropped. No real game comes near it; the cap exists so a crafted file cannot make the fold grow
without bound or turn quadratic. A keyframe over the cap is damaged
([§13](#damaged-keyframe)), since snapping to it would bypass the cap.

### 12.1 The `MOVE` rule (the big one)

**0. Detach.** Before anything else: if `from` is an arena and `to` is not, or `from` is
`capture`, take `card` off every card's `upgrades` and `captured` lists and every seat's
`baseCaptured` (`detach`). A card
that leaves an arena is nobody's attachment any more, whatever its `kind` says and whether or
not anyone names a host — exits are host-less
([§10.1](#binding-an-attachment-to-its-host)). This step needs no `p`.

If `p` is missing: you can't attribute the counts to anyone. Just update the card's zone
if you already track it, and stop.

If `p` is there, do all of these.

**Whose pile.** `p` is the seat the card is with as the move happens: its **controller** for
a move into play or into `resource`, and its **owner** for a move into `hand`, `discard` or
`deck` (those zones only ever hold their owner's cards). So a card *arriving* in a pile goes
to `p`'s.
A card *leaving* a pile can be leaving the other seat's: Stolen AT-Hauler lets the opponent
play it out of its owner's discard, and that `MOVE` says `"p": 2` for Player 1's card. When a
card leaves `hand`, `discard` or `resource`, take it (and the count) from the seat whose list
holds it: `p`'s if it is there, else the other seat's, else `p`'s. Ids are unique for the whole
game ([§6.1](#61-card-ids)), so at most one list holds it. The `stolen-hauler` vector covers
this. The deck is counted, not listed, so a move out of `deck` is counted on `p`. That is
right because a card leaving a deck is still with its owner: every card that reaches into an
opponent's deck (Never Tell Me the Odds, Vigilance, Satine Kryze) discards from it, and the
writer records the owner (`SwuPgnCrossSeatPiles.spec.ts`).

**1. The hand — count AND contents**

- moving *into* `hand` from somewhere else → `handSize + 1`, and add `card` to `hand`
- moving *out of* `hand` to somewhere else → `handSize - 1` (never below 0), and remove
  `card` from `hand`

Adding is **once by id**: every id is unique for the whole game ([§6.1](#61-card-ids)), so a
list holds it at most once, and the `DRAW` beside the move naming the same card is harmless.
`hand` is exact at every moment, not only at a keyframe — the move names the card both ways.

**1a. The discard pile**

- moving *into* `discard` from somewhere else → add `card` to `discard` (once by id)
- moving *out of* `discard` to somewhere else → remove `card` from `discard`

**The `MOVE` is the pile's author, not `DEFEAT`.** A defeated unit's `MOVE` to `discard` is
emitted *before* its `DEFEAT`, in every test vector that defeats a unit. From the `capture`
vector, Open Fire defeating the captor:

```
{"seq":"R2.A.2c","t":"MOVE","card":"SOR#095","from":"ground","to":"discard","p":1,"kind":"unit"}
{"seq":"R2.A.2d","t":"DEFEAT","card":"SOR#095","reason":"nonCombatDamage","defeatedBy":"TWI#174:2"}
```

A reader that files the card on `DEFEAT` alone finds it already gone from `cards` and files nothing, so no
defeated unit ever reaches the pile. `DEFEAT`, `DISCARD` and `PLAY_EVENT` add once by id and
are no-ops beside their own move.

**1b. Deck count**, once a keyframe has supplied it (before that, leave it absent)

- moving *into* `deck` from somewhere else → `deckSize + 1`
- moving *out of* `deck` to somewhere else → `deckSize - 1` (never below 0)

**1c. The leader coming home**: a move from an arena to `base` by the card the seat's
`leader.id` names → `leader.deployed = false`. (An `EXHAUST` beside it sets its flag.)

**2. Resource row** — two counts, `resourcesReady` and `resourcesExhausted`

- moving *into* `resource` from somewhere else → `resourcesReady + 1`, and add `card` to
  `resources` (once by id). A card enters the row ready; if an ability put it there exhausted,
  an `EXHAUST_RESOURCES` beside the move says so ([§10.1](#101-events-that-carry-board-detail)).
- moving *out of* `resource` to somewhere else → `resourcesExhausted - 1` if the move
  carries `exhausted: true`, else `resourcesReady - 1` (never below 0); and remove `card` from
  `resources`.

`resources` stays **absent** until a move or a keyframe supplies one, so a file written before it
existed folds to a state with no `resources` rather than a misleading empty row.

**2b. Credits and the Force** — the two reserved token names
([§6.1](#two-reserved-token-names))

- a `TOKEN:credit#…` moving *into* `base` → `credits + 1`; *out of* `base` → `credits - 1`
  (never below 0)
- a `TOKEN:the-force#…` moving *into* `base` → `hasForce = true`; *out of* `base` →
  `hasForce = false`

**2c. Base attachments** (Fortify, [§10.3](#103-homeworlds-fortify-beast-and-weakness)) — this
step needs no `p` when `attachedTo` is there

- moving *out of* `base` to somewhere else → remove `card` from every seat's `baseUpgrades`.
  Keyed on the zone transition, like step 0: exits are host-less.
- moving *into* `base` from somewhere else with `kind: "upgrade"` → add `card` (once by id) to
  the `baseUpgrades` of the seat `attachedTo` names (`base@N`), or of `p` when a file predates
  `attachedTo` on base moves. A `TOKEN:` id is never added: no token upgrade attaches to a base.

`baseUpgrades` stays **absent** until a move or a keyframe supplies one, like `resources`.

Nothing else that enters or leaves `base` changes anything: a leader deploying or being
defeated is an arena move handled in step 3.

**3. In-play list** (in play = `ground` or `space`)

If `kind` is `"upgrade"`: this card never joins an arena. If the move is **into** an arena
and carries `attachedTo`, first `detach(state, card)` and take it out of every seat's `cards`
(an upgrade has one host, and a unit attached as a pilot stops being a unit), then
`attach(state, attachedTo, card)` — a printed card (an upgrade, a
pilot) goes onto that host's `upgrades`, idempotently, because the `PLAY_UPGRADE` /
`DEPLOY_LEADER` beside it names the same host; a token upgrade (`TOKEN:…`) does not, it is
counted by its own gain record. Then update the card's zone if you already track it, and
stop. Steps 1 and 2 still ran: an upgrade really does leave the hand.

- moving **into** an arena: `detach(state, card)` first — a unit is nobody's upgrade, and a
  pilot ejected from a vehicle moves arena to arena, so step 0 never detached it. Then, if
  you already track this card id, just set its zone. Otherwise create a fresh card and add it
  to `players[p].cards`.
- moving **out of** an arena: remove it from whichever player's `cards` holds it (step 0
  already took it off every host).
- moving between two non-arena zones: just update its zone if you track it.

Adding is *idempotent by id*, so a `PLAY` followed by its `MOVE` never adds the card
twice.

### 12.2 Every other rule, in one table

| `t` | What you do |
|---|---|
| `ROUND_START` | `round = event.round`; `initiativeTaken = false`; `active = event.active` when it is `1` or `2` |
| `PHASE_START` | `phase = event.phase`; `active = event.active` when it is `1` or `2` |
| `CLAIM_INITIATIVE` | `initiative = event.p`; `initiativeTaken = true` |
| `PLAY`, `PLAY_SMUGGLE` | place `card` in `zone ?? "ground"` — **idempotent by id**: if already tracked, just set its zone. The paired `MOVE` reports the same arrival, and pushing on both duplicates every unit in play |
| `PLAY_EVENT` | add `card` to `players[p].discard`, **once by id** — its own hand→discard `MOVE` files the same card |
| `PLAY_UPGRADE` | if `target` is `base@N` → add `card` to `players[N].baseUpgrades`, once by id; else if `target` is set → `attach(state, target, card)` (nothing if the host isn't tracked); otherwise **nothing**. An upgrade is never an arena card, so there is no fallback placement |
| `DEPLOY_LEADER` | ignored when it has no `card`. Otherwise `players[p].leader = { id: card, deployed: true, exhausted: false, epicActionUsed: (was already used) or epic === true }`; then if `kind` is `"upgrade"` → `attach(state, target, card)`; else place `card` in `zone ?? "ground"`, idempotent by id |
| `ABILITY_ACTIVATE` | if `epic`: `card` of `base@N` → `players[N].baseEpicActionUsed = true`; else if `card` is a seat's `leader.id` → that leader's `epicActionUsed = true`. Otherwise nothing |
| `LEADER_FLIP` | that seat's `leader.onStartingSide = event.onStartingSide` — the stated face, so applying it twice is the same as once. Find the leader by `card`, falling back to the record's `p` (these leaders never deploy, so early in a file no `DEPLOY_LEADER` has named the id). If that seat has no `leader` yet, create one first: `{ id: card, deployed: false, exhausted: false, epicActionUsed: false }`. A record with no `card` is ignored |
| `STATS` | if `card` is tracked → set its `power`, `hp`, and `keywords` (sorted) when given |
| `TAKE_CONTROL` | arena `zone` → move the card entry from the other seat's `cards` to `players[p].cards`; `resource` with `from` → shift one resource from `from` to `p`, in the exhausted bucket if `exhausted` else the ready one, and move `card` from `players[from].resources` to `players[p].resources`; `base` with `from` → shift one credit (or the Force) from `from` to `p`; otherwise nothing ([§10.1](#take_control)) |
| `CAPTURE` | remove `card` from every seat's `cards` (its `MOVE` already did); if `by` is `base@N`, push `card` onto `players[N].baseCaptured` (created if absent); else if `by` names a tracked card, push `card` onto its `captured`; both idempotently |
| `RESCUE` | `detach(state, card)` — the `MOVE` out of `capture` beside it places the card |
| `EXHAUST_RESOURCES` | `n = min(amount, resourcesReady)`; `resourcesReady -= n`; `resourcesExhausted += n` |
| `READY_RESOURCES` | `n = min(amount, resourcesExhausted)`; `resourcesExhausted -= n`; `resourcesReady += n` |
| `CREATE_TOKEN` | place `token` in `zone`, idempotent by id — unless `kind` is `"upgrade"`, or `zone` is not `ground`/`space`, then **nothing**. A token named outside an arena is not in play yet; its `MOVE` into the arena is what places it, exactly as for a printed card |
| `MOVE` | see [§12.1](#121-the-move-rule-the-big-one) |
| `DAMAGE` | `base@N` → `players[N].baseHp = hp`; else `card.damage = max(0, damage + amt)` |
| `OVERWHELM` | `base@N` → `players[N].baseHp = hp`; anything else → nothing |
| `HEAL` | `base@N` → `players[N].baseHp = hp`; else `card.damage = max(0, damage - amt)` |
| `DEFEAT` | if `card` is `base@N` → `players[N].baseDefeated = true`, and nothing else; otherwise `detach(state, card)`, and remove `card` from every seat's `baseUpgrades`; then, if the card is in someone's `cards`, remove it and add its id to that player's `discard`, **once by id**. In a real stream the `MOVE` to `discard` arrived first and already did both, so this does nothing — see the note under [§12.1](#121-the-move-rule-the-big-one) |
| `EXHAUST` | `exhausted = true` on the arena card of that id, and on `leader` if it is the leader's id |
| `READY` | `exhausted = false`, likewise |
| `DRAW` | add each id in `cards` to `players[p].hand`, **once by id**. **Nothing else** — the paired deck→hand `MOVE`s own both the count and the contents |
| `DISCARD` | add each id in `cards` to `players[p].discard`, **once by id**. **Nothing else.** |
| `RESOURCE` | **nothing** — the paired `MOVE` into `resource` carries the change ([§10.1](#101-events-that-carry-board-detail)) |
| `SHIELD_GAIN` | `card.shields += count ?? 1` |
| `SHIELD_USE` | `card.shields = max(0, shields - (count ?? 1))` |
| `EXPERIENCE_GAIN` | `card.experience = max(0, experience + count)` — `count` may be negative |
| `STATUS_TOKEN` | `n = max(0, (statusTokens[token] ?? 0) + count)`; if `n` is 0 **delete** `statusTokens[token]`, else set it to `n`. `count` may be negative — deleting the key at zero is required, see [the token contract](#the-token-gainremoval-contract) |
| anything in [§10.2](#102-events-that-are-just-notes) | nothing |
| an event type you don't know | nothing (and warn) |

Five small helpers:

- `newCard(id, zone)` → `{ id, zone, damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {}, captured: [] }`
- `attach(state, hostId, id)` → if `id` is a `TOKEN:` id, nothing (tokens are counters); else
  if `hostId` is tracked and `id` is not already in its `upgrades`, push it
- `detach(state, id)` → remove `id` from every card's `upgrades` and `captured`, and from every
  seat's `baseCaptured`
- `findCard(state, id)` → look through player 1's `cards`, then player 2's. **If it isn't
  there, silently do nothing.** Never crash.
- `seatOfBaseRef(ref)` → the N out of `base@N`, or `null` if it isn't a base.

### 12.3 Rewinding to a moment

`stateAt(events, seq)` = fold everything up to and including the event with that `seq`.
If no event has that `seq`, it folds the whole list.

The reference reader starts from the last usable keyframe at or before `seq` rather than
from the beginning — everything before a keyframe is disposable, so the result is identical
and a replay scrubber calling it once per position stays linear instead of quadratic.

---

## 13. Keyframes

A **keyframe** is a full photo of the board, saved inside a `ROUND_START` or `ROUND_END`
event.

When you hit one, **throw away** your running board and use the photo instead. Don't also
apply that event's normal rule.

Why bother?

1. **Jump anywhere fast** — want round 5? Load round 5's keyframe. No replaying.
2. **Catch mistakes** — compare your fold against the photo. They should match.
3. **Recover** — if something between two keyframes is broken, the next photo fixes it.

### The rules

**A keyframe REPLACES the reader's state.** It is not merged, not patched — the running
state is thrown away and the keyframe takes its place. Everything below follows from that.

**Writers:**

- A keyframe MUST contain **every seat** (both of them). A keyframe missing a player does
  not merely lose detail, it **erases that player's board** — hand size, resources, and
  every card in play reset. A keyframe with `"players":{}` erases both players, leaving a
  conforming reader with no players at all.
- A partial or empty `players` map is **non-conformant**. If you can't build a complete
  snapshot, **omit the keyframe entirely**. A `ROUND_START` or `ROUND_END` with no keyframe
  is perfectly valid and completely harmless — the reader just keeps folding deltas. Never
  ship a partial one.
- No list in a keyframe (`cards`, `hand`, `discard`, `resources`, `baseUpgrades`, `baseCaptured`, a card's
  `upgrades` and `captured`) may hold more than 1000 entries. A card's `captured` may be absent (a
  file older than the field), but when present it is a list. A real game never comes close; a reader treats a
  keyframe over that as damaged and ignores it, because a snapped keyframe bypasses the cap the
  fold puts on every list it grows itself ([§14](#14-checking-a-file-is-honest)).
- A keyframe's `cards` list contains **only** ground and space arena cards. Hand,
  resources and discard are described by their counts and lists, not by `cards`.
- A keyframe carries every field of [§11](#11-the-board-you-build-reducedstate): the
  initiative status, and per seat the deck count, the leader's status, and each card's live
  `power`/`hp`/`keywords`. A writer that cannot read one of them omits that field rather than
  inventing a value.
- Emit a keyframe on `ROUND_END` as well as `ROUND_START` when you can. It halves the
  window between checkpoints, so a round's worth of fold drift is caught a round earlier,
  and costs one snapshot.
- A keyframe describes the state **at its own seq**, so take the snapshot before the engine
  cleans up after that moment. A `ROUND_END` keyframe is the trap: an engine typically
  clears the initiative counter and leaves the current phase as it tears the round down, so
  a snapshot taken a step too late reports `"initiativeTaken": false` for a round that did
  claim, and `"phase": "setup"` for a round that just finished its regroup. Round-scoped
  fields that the engine has already reset are best recovered from the records you just
  wrote for that round (`CLAIM_INITIATIVE`, the last `PHASE_START`) — those are exactly what
  the reader folds, so the keyframe agrees with the fold by construction.

<a id="damaged-keyframe"></a>
**A keyframe is damaged** when any of these is true:

- it is not an object, or its `players` is not an object;
- either seat is missing, or is not an object;
- a seat's `cards`, `hand` or `discard` is not an array;
- a seat's `baseUpgrades`, `baseCaptured` or `resources` is present but not an array;
- any of those lists holds more than 1000 entries;
- a `cards` entry is not an object, or lacks an `upgrades` array (of at most 1000), a
  `statusTokens` object (not an array), or a number in each of `damage`, `shields` and
  `experience`;
- a `cards` entry has a `captured` that is present but not an array of at most 1000.

**Readers, on meeting a damaged keyframe:** do NOT snap to it — snapping
would delete a player you have correct state for. **Ignore the keyframe**, keep folding
your running state, and report the file as non-conformant. Treat it as a damaged
checkpoint, not as truth. (Files written before this rule was enforced are in the wild;
see [§22](#22-version-history).)

---

## 14. Checking a file is honest

Before saving, a writer MUST run `checkKeyframes(events)`.

What it does:

1. Start from `emptyState()`.
2. Fold forward normally.
3. At every keyframe: **compare** your fold against the photo, write down every
   difference, then snap to the photo and carry on.
4. Return `{ ok, mismatches }`.

If `ok` is `false`, the deltas between two keyframes don't add up to what the engine
reported — the file is under-recording something. A writer MUST report that loudly.

Whether to also *refuse to save* is the writer's call. This repo's writer logs the
mismatches at error level and still emits the file, on purpose: the keyframes themselves
are authoritative, so a reader that trusts them still gets every round boundary right,
and withholding the file would cost a player their whole replay to fix a partial-fidelity
problem. A writer that has no such cost SHOULD treat `ok: false` as fatal.

### What is compared, per seat

**Checked:**

- `baseHp` — **except at the very first keyframe**. Nothing in the stream carries a base's
  starting HP, so before the first keyframe there is nothing to compare against but the
  placeholder 30 ([§11](#11-the-board-you-build-reducedstate)). The first keyframe is what
  *supplies* the real number; every keyframe after it is compared normally.
- `deckSize` — **except at the very first keyframe**, for the same reason as `baseHp`: the
  starting deck is not in the stream.
- `handSize`, and `hand` **as a set** — a hand is unordered
- `discard` **in order** — the pile is ordered ([§11](#11-the-board-you-build-reducedstate))
- `resources` **as a set** whenever the keyframe carries it — the row's order is not part of the
  model, and its ready/exhausted split is the two counts, not this list
- `baseEpicActionUsed` whenever the keyframe carries it
- `baseUpgrades` **as a set** whenever the keyframe carries it — like a unit's `upgrades`,
  attachment order is not part of the model
- `baseCaptured` **as a set** whenever the keyframe carries it — like a unit's `captured`
- `baseDefeated`, absent on either side read as `false`
- `resourcesReady` and `resourcesExhausted`
- `credits` and `hasForce`
- the leader's `id`, `deployed`, `exhausted` and `epicActionUsed`, and `onStartingSide`
  whenever the keyframe states it (absent means "not a double-sided leader", never `false`) —
  **only when both the keyframe and the fold have a leader for that seat**. The fold learns a
  leader from a keyframe or a `DEPLOY_LEADER`; before either it has none to be wrong about, so
  the `minimal` vector's first keyframe, which names both leaders, reports nothing
- `initiativeTaken`, whenever the keyframe carries it, absent on the fold's side read as
  `false`. **Before comparing a `ROUND_START` keyframe, set the running `initiativeTaken` to
  `false`**: that keyframe describes a round that has begun, and the `ROUND_START` rule that
  would have reset it ([§12.2](#122-every-other-rule-in-one-table)) is skipped when the reader
  snaps
- for each in-play card matched by `id`: `zone`, `damage`, `exhausted`, `shields`,
  `experience`, `statusTokens`, `upgrades` and `captured` **as sets** (attachment order
  is not part of the model; a missing list counts as empty), `power`, `hp`, and `keywords`
  as a set
- a card being in one side but not the other (reported both ways)

Everything except `baseHp` and `deckSize` is compared at **every** keyframe, the first one
included. A field the keyframe does not carry — `deckSize`, `leader`, `initiativeTaken`, a
card's `power`/`hp`/`keywords` — is skipped, so a file written before the field existed still
passes: absent means "not recorded", never "zero".

**Every player and card field of [§11](#11-the-board-you-build-reducedstate) is checked.** A
passing check means the deltas between two keyframes add up to the whole board the engine
reported. **Not compared:** the top-level `round`, `phase`, `initiative` and `active`, and each
seat's `baseMaxHp` and `seat`. `round` and `phase` come straight from `ROUND_START` /
`PHASE_START`, `initiative` from `CLAIM_INITIATIVE`, and `baseMaxHp` and `seat` never change,
so none of them is a delta that could fail to add up.

**`active` is the one field deliberately NOT compared**, because it is stated rather than
reconstructed — see [§11](#11-the-board-you-build-reducedstate). Comparing the fold against
the keyframe would only restate that.

> **This changed.** Earlier text said `hand` and `discard` **contents** were not checked,
> because "only the counts are reconstructable". That was wrong. Every `MOVE` names its card,
> so both lists are exact at every moment, and both are now folded from `MOVE` and gated here.
> See [§22](#10-writer-changes-before-first-release) for how to spot a reader that
> still has the old behaviour.

A mismatch looks like:

```json
{ "seq": "R7.start", "path": "players.1.handSize", "expected": 3, "got": 2 }
```

`expected` is the keyframe (the engine's truth). `got` is what folding produced.

A keyframe that is **damaged** ([§13](#damaged-keyframe)) is never compared or snapped to. It is reported as one
mismatch with `path: "keyframe"`, and folding carries on from the running state.

---

## 15. Annotations

Notes people add after the game. One JSON object per line in `%%% ANNOTATIONS`.

| Field | Type | Required | Means |
|---|---|---|---|
| `ref` | string | yes | The `seq` this note is about. |
| `nag` | string | no | A short glyph (below). |
| `text` | string | no | What you want to say. |
| `by` | string | no | A fake name for the author. Never a real one. |
| `line` | GameEvent[] | no | A "what if" — a made-up sequence of events. |
| `id` | string | no | A stable id for this note, so another note can reply to it. Opaque; a UUID is fine. |
| `parent` | string | no | The `id` of the note this one replies to. Absent for a top-level note. |
| `ts` | integer | no | When the note was written, epoch milliseconds. Orders a thread; never a real-name timestamp. |

Other fields are allowed (`annotation.schema.json` has `additionalProperties: true`), so a later version can add one; a reader ignores a field it does not know ([§18](#18-versions-and-unknown-things)).

`id`, `parent` and `ts` are what let several notes form a **thread** on one `seq`. A reader
that does not thread simply ignores them and shows the notes in file order — they are optional
in both directions, and a note carrying none of them is a complete note. A `parent` that names
no `id` in the file is a reply to a note that is not there; show it as a top-level note rather
than dropping it.

### The glyphs

| Glyph | Means |
|---|---|
| `!` | Good move |
| `?` | Mistake |
| `!!` | Brilliant |
| `??` | Blunder |
| `!?` | Interesting, risky |
| `?!` | Dubious |

Other glyphs MAY appear. Treat one you don't know as "some kind of note".

### Two hard rules

- **Only add.** Never change or delete a note that's already there. That's what lets
  several people annotate the same file without stepping on each other.
- **Never fold a `line` into the real game.** It didn't happen. You MAY fold it on its
  own to explore the "what if".

---

## 16. Turning a file into a story

This is the specification of the `%%% STORY` section. A conforming renderer, given the same
events and the same card index, MUST produce exactly these lines — that is what lets a
reader verify the prose in a file against the events beside it.

Two helpers:

- `nm(id)` — the display name. **Strip the `:N` copy suffix**, look the base up in the
  `%%% CARDS` index ([§6.5](#65-the-cards-index)), then append ` #N` back for a copy, so two
  Wampas read as `Wampa` and `Wampa #2`. A `base@N` ref renders as `Player N's base`. For a card
  with a `backSideName`, `nm` gives the side that is **up**: the back from its `DEPLOY_LEADER`
  (or its `MOVE` from `base` into an arena) until its `MOVE` back to `base`, and for a
  double-sided leader per its last `LEADER_FLIP`. Each `ROUND_START` keyframe re-syncs this
  from the seat's `leader` (a `ROUND_END` keyframe does not). So a deployed Tarkin attacks, triggers and defeats bases as `The Death Star, Icon of
  Tyranny`. `front(id)` / `back(id)` are the index's `name` / `backSideName`.
- `who(p)` — `"Player 1"` for seat 1, `"Player 2"` for seat 2, `""` otherwise.

When no card index is supplied, the renderer uses the document's own — a file with a
`%%% CARDS` section renders with real names and **no external card database**.

### Numbering and indentation

Some events are **things a player chose to do**. Those get a number. Everything else is a
**consequence** of the numbered action above it, and is printed indented beneath it.

The numbered ones are exactly:

`PLAY`, `PLAY_EVENT`, `PLAY_UPGRADE`, `PLAY_SMUGGLE`, `DEPLOY_LEADER`, `ATTACK`,
`PASS`, `CLAIM_INITIATIVE`, and an `ABILITY_ACTIVATE` whose `kind` is `action` or `epic`

That last one is a whole action, not a consequence: CR 6.1 lets a player spend their action on
using a card's action ability, so it is their turn the same way a play or an attack is. An
`ABILITY_ACTIVATE` of any other `kind` — `triggered`, `keyword`, `replacement`, `constant`,
`event`, `delayed` — happened *because of* something else, and is indented under it.

**A lettered seq is never numbered**, whatever its type. A leader deployed *by* its own Epic
Action is the ability's consequence (`R8.A.1` `ABILITY_ACTIVATE`, `R8.A.1c` `DEPLOY_LEADER` in the
`death-star` vector): the player took one action, not two, so the `DEPLOY_LEADER` is indented.
Only a record whose step is a bare number (`R2.A.3`) can take a number.

This mirrors the `seq` scheme ([§9.1](#91-how-seq-is-built)), where an action is `R2.A.3`
and its consequences are `R2.A.3a`, `R2.A.3b`, … The grouping is already in the data;
indenting is what makes it visible.

The counter resets to 0 at every `ROUND_START` **and** every `PHASE_START`.

### The loop

For each event:

1. `ROUND_START` → print a blank line, a `═` rule 78 wide, the round banner, the **board
   summary** (below), the rule again, and a blank line. Reset the counter.
2. `PHASE_START` → print `" ── {phase} ──"`. Reset the counter.
3. Otherwise → build the line. If `null`, skip it. If the event is a numbered one, add 1 to
   the counter and print `" {n}. {text}"` (the number right-aligned in 2 columns). Otherwise
   print `"       ↳ {text}"`.

Join with `"\n"`.

### The round banner and board summary

The banner carries the round number, and the holder of initiative right-aligned to the rule
width: ` ROUND {n}` padded with spaces so that `initiative: {who(initiative)} `, **trailing space
included**, ends at column 78. Without a keyframe naming the initiative the banner is just
` ROUND {n}`. Then, from that round's keyframe, one block per seat:

```
══════════════════════════════════════════════════════════════════════════════
 ROUND 7                                                 initiative: Player 2 
 P1  base 16/33   hand 3   resources 7/7   deck 31   leader deployed
      ground: Kelleran Beq, The Sabered Hand 4/7
      space: Bravo Squadron Fighter 2/3  ·  Emissary's Sheathipede #2 2/3 [1 dmg]
 P2  base 22/28   hand 2   resources 5/5   deck 34   leader exhausted
      ground: Darth Maul, Sith Revealed 5/7 [exhausted]
══════════════════════════════════════════════════════════════════════════════
```

- One line per seat: `base {hp}/{max}   hand {n}   resources {ready}/{ready+exhausted}`, then
  `   deck {n}` when the keyframe has `deckSize`, then `   leader deployed|exhausted|ready`
  when it has `leader`.
- Then, when the keyframe's `baseUpgrades` or `baseCaptured` is not empty, a `      base: ` line
  naming each base upgrade, then `holds {name}` for each captive, joined by `  ·  ` — it comes
  before the arenas because all of them are on the base.
- Then a line per non-empty arena, cards joined by `  ·  `.
- A card is its name, then ` {power}/{hp}` when the keyframe has both, then its non-default
  state in `[...]`, comma-separated, in this order: damage (`3 dmg`), `exhausted`, shields
  (`2 shield`), experience (`1 xp`), each status token (`1 advantage`), each attached upgrade
  by name, then each captive as `holds {name}`.
- No keyframe on the `ROUND_START`, or a damaged one ([§13](#13-keyframes)) → no summary,
  just the banner.

This costs nothing to record: it is the keyframe the file already carries, laid out to be
read.

### The exact wording

`{names}` is `nm` of each id in the list, joined by ` · ` (a space, a middle dot, a space). Not
`, `: a card's name has its own comma between title and subtitle ("Leia Organa, These Are My
Friends"), so a comma-joined list could not be split back into cards.

| `t` | Line |
|---|---|
| `PLAY`, `PLAY_SMUGGLE` | `{who(p)} plays {nm(card)}` + ` to {zone}` if `zone` + ` (cost {cost})` if `cost` is present (`0` included) |
| `PLAY_UPGRADE` | `{who(p)} plays {nm(card)}` + ` on {nm(target)}` if `target`, else ` to {zone}` if `zone`; + ` (cost {cost})` if `cost` is present (`0` included) |
| `PLAY_EVENT` | `{who(p)} plays {nm(card)}` + ` (cost {cost})` if `cost` is present (`0` included) — no zone |
| `DEPLOY_LEADER` | `{who(p)} deploys {front(card)}` + ` as {back(card)}` if the card has a `backSideName` + ` as a pilot on {nm(target)}` if `target`. A sub-step when the leader's own Epic Action deployed it |
| `LEADER_FLIP` | `{who(p)} flips {nm(card)}` + ` to {the face it landed on}` if the card has a `backSideName` |
| `ATTACK` | base: `{who(p)} attacks {who(other)}'s base with {nm(atk)}` · unit: `{who(p)} attacks {nm(def)} with {nm(atk)}` |
| `PASS` | `{who(p)} passes` |
| `CLAIM_INITIATIVE` | `{who(p)} claims initiative` |
| `DAMAGE` | `{amt} damage to {nm(tgt)} — {hp} HP left` |
| `OVERWHELM` | `{amt} Overwhelm damage to {who(other)}'s base — {hp} HP left` |
| `HEAL` | `{amt} healed on {nm(tgt)} — {hp} HP left` |
| `UNDO` | Its own marker line, neither numbered nor indented: `    ·· {who(by)} undid back to {at} ··` (`A player` when `by` is absent) |
| `DEFEAT` | `{nm(card)} is defeated` + ` by {nm(defeatedBy)}` if present |
| `ABILITY_ACTIVATE` | `kind` `action`/`epic`: `{who(p)} uses {nm(card)}` (Epic Action: `…'s Epic Action`) — and it takes an action NUMBER. Otherwise `{nm(card)} uses an ability`. Either way, ` (granted by {nm(grantedBy)})` when `grantedBy` is present |
| `TRIGGER` | `{nm(card)} triggers` |
| `STATUS_TOKEN` | `{nm(card)} gains\|loses {abs(count)} {token}` — `loses` when `count` is negative |
| `SHIELD_GAIN` | `{nm(card)} gains {count ?? 1} shield` |
| `SHIELD_USE` | `{nm(card)} loses {count ?? 1} shield` |
| `EXPERIENCE_GAIN` | `{nm(card)} gains\|loses {abs(count)} experience` |
| `DRAW` | `{who(p)} draws {count}` + `: {names}` when `cards` is non-empty |
| `DISCARD` | `{who(p)} discards {names}` |
| `RESOURCE` | `{who(p)} resources {nm(card)}` |
| `REVEAL` | `{who(p)} reveals {names}` |
| `SEARCH` | with `found`: `{who(p)} searches, finds {names}` · without: `{who(p)} searches their deck` |
| `CREATE_TOKEN` | `{who(p)} creates {nm(token)} in {zone}` |
| `CAPTURE` | `{who(p)} captures {nm(card)}` + ` with {nm(by)}` if `by` |
| `RESCUE` / `TAKE_CONTROL` | `{who(p)} rescues\|takes control of {nm(card)}` |
| `MULLIGAN` | `{who(p)} mulligans` |
| `KEEP_HAND` | `{who(p)} keeps their hand` |
| `GAME_END` | `*** {who(winner)} wins — {reason} ***` · draw: `*** Game ends in a draw — {reason} ***` |

**These print nothing**: `MOVE`, `EXHAUST`, `READY`, `EXHAUST_RESOURCES`, `READY_RESOURCES`,
`STATS`, `CHOICE`, `MODAL_CHOICE`, `SHUFFLE`, `PHASE_END`, `ROUND_END`.

They are mechanism, not story. `MOVE` is the fold's source of truth and appears beside every
play, draw and discard — printing it would roughly triple the narrative for no reader
benefit. `EXHAUST`/`READY` fire on every attack and every regroup, and the resource counters
on every play; the board summary already shows what is exhausted at each round boundary,
which is where a reader actually wants it.

One detail that is easy to get wrong: "the other player" is `p === 1 ? 2 : 1`.

### How binding is the wording?

**The exact wording is advisory, not a wire format.** The table above is what the reference
renderer produces and what the test vectors pin, so an implementation that wants byte-identical
output has something to match. But `%%% STORY` is prose for humans: a renderer MAY word it
differently, and improving the wording is NOT a breaking change and does NOT require a version
bump.

What IS binding is the structure, because that is what a reader can rely on:

- numbered lines are actions a player chose, from the list above;
- indented lines are consequences of the numbered line above them;
- a round banner introduces each round, and carries the board when a keyframe is present.

A writer SHOULD keep `%%% STORY` consistent with its own renderer, so that regenerating it
reproduces what the file says. A reader that re-renders and finds a difference SHOULD NOT
treat the file as invalid — wording drifts between versions. **`%%% EVENTS` is always the
truth; `%%% STORY` is a convenience.** If they disagree about what happened, believe the
events.

---

## 17. Privacy

A `.swupgn` file MUST NOT contain a real username, account id, email address, IP address,
or anything else that points at a real person.

- `P1Id` / `P2Id` MUST be `sha256:<hex>` — the username, salted and hashed. The
  reference writer's salt is the **`GameId`**: `sha256("<GameId>:<username>")`.
- `P1` / `P2` MUST be generic labels like `"Player 1"`.
- `by` in an annotation MUST be a fake name.
- Spectator ids MUST NOT appear anywhere.

What a `GameId`-salted hash gives you, and what it does not:

- **per-game** — the same player hashes *differently* in every file. Ids cannot be joined
  across games; that is the point of a per-game salt.
- **not casually readable** — nobody opening the file sees a username.
- **not resistant to a targeted guess.** The salt sits two lines above the id, and usernames
  are low-entropy: anyone holding the file and a candidate list can confirm a player by
  re-hashing `"<GameId>:<candidate>"`.

A writer whose files are **published** SHOULD key an HMAC with a server-side secret instead.
That flips the first property — the same player then hashes the *same* across that server's
games, so a consumer can group one player's history without ever learning who they are — and
makes the id genuinely non-reversible. A reader cannot tell the two schemes apart (both are
`sha256:<hex>`), so this needs no format change and no version bump.

The reference writer implements both: setting `SWUPGN_ID_SECRET` switches it to the keyed
scheme, and leaving it unset keeps the `GameId` salt. **A deployment that publishes files MUST
set it.**

Either way, a consumer that attributes a file to an account MUST take the seat from the
authenticated delivery rather than by re-hashing candidate usernames against the file. Under the
keyed scheme that is not merely discouraged, it is impossible.

A writer MUST have a PII gate. The reference writer's gate is structural plus CI: no field is
ever built from a username except the salted id, and
`test/server/chat/SwuPgnPiiScan.spec.ts` stamps sentinel identities onto a live game and fails
if any of them survive into the file. A writer that builds strings from user data SHOULD also
scan the finished file, and MUST NOT write one the scan rejects.

`ms` ([§5.2.1](#521-timing-ms)) is the one field that works against all of this: a timing
fingerprint survives any id scheme. It is optional everywhere, and a deployment that publishes a
corpus SHOULD decide deliberately whether to emit it.

When `Perspective` is `P1` or `P2`, the other player's hidden cards SHOULD be missing or
blanked. Files that see everything MUST only be produced by a trusted server.

---

## 18. Versions and unknown things

The version lives in the `Game` tag: `"SWU-PGN/MAJOR.MINOR"`.

- **MAJOR** goes up when old readers would break. Readers MUST refuse a different major
  version.
- **MINOR** goes up for additions that don't break anything — a new optional tag, a new
  optional field, a new event type. Readers MUST accept a **higher** minor version.

To accept a higher minor version, a reader:

- MUST accept and ignore header tags it doesn't know;
- MUST accept event types it doesn't know, treat them as "do nothing", and warn;
- MUST NOT throw on an unknown `t`.

---

## 19. File type

- **MIME type:** `application/vnd.swu-pgn`
- **Extension:** `.swupgn`
- **Encoding:** UTF-8
- **Line endings:** `\n` (`\r\n` tolerated)

The MIME type isn't registered with IANA yet.

---

## 20. Test vectors

`swupgn/test-vectors/` holds the **normative** examples. They are part of this spec: if
your code doesn't reproduce them exactly, it isn't conformant.

Each vector is three files with the same base name:

| File | Holds |
|---|---|
| `.swupgn` | the input |
| `.fold.json` | the board `fold(events)` must produce |
| `.render.txt` | the text `render(doc, resolver)` must produce |

To be conformant:

1. `parse()` succeeds.
2. `validate()` returns no **errors** (warnings are fine).
3. Your fold matches `.fold.json`.
4. Your render matches `.render.txt` (if you render).
5. Your `checkKeyframes()` reports **no** mismatch. Every vector is internally consistent —
   each keyframe is exactly what folding the deltas before it produces — so a reader that
   reports one has a fold rule wrong, not a bad file.

| Vector | Covers |
|---|---|
| `minimal` | Hand-written, rules-legal. A setup phase (draws, resourcing, the `R1.start` keyframe it leads to), a unit played in round 1 (`EXHAUST_RESOURCES`, `MOVE`, `STATS`, `PLAY`, the entering `EXHAUST`), a regroup (`READY`, `READY_RESOURCES`, two more keyframes), and the attack in round 2. Appendix A walks through it. |
| `organic` | A real game the reference writer produced: natural setup with a mulligan, four rounds of plays, attacks and regroups, a concession. Keyframes at every round boundary. |
| `upgrades` | Real game: a printed upgrade (`PLAY_UPGRADE` + `attachedTo`) and Advantage and Experience tokens on one host (Zealous Soldier #2), defeated with all of it attached — every removal record, and the detach on exit. Shield tokens (`SHIELD_GAIN`) on a second unit (Cloaked StarViper), which survives, so they are never used: no vector has a `SHIELD_USE`. |
| `pilot` | Real game: a pilot flown onto a vehicle (`kind: "upgrade"` on a unit card, `%%% CARDS` saying `unit`), a second one, and a piloted vehicle Vanquished. |
| `capture` | Real game: a unit taken captive (`CAPTURE` with `by`, the `MOVE` into `capture`) and rescued when its captor is defeated. |
| `arrest` | Real game: a **base** as captor. Arrest twice (`CAPTURE` with `by: "base@1"`, the captive in `players[1].baseCaptured` until it is rescued), each captive rescued at the start of the next regroup phase (`RESCUE`, the `MOVE` out of `capture`). |
| `homeworlds` | Real game, Homeworlds mechanics ([§10.3](#103-homeworlds-fortify-beast-and-weakness)): Fortify upgrades on **both** bases (`MOVE` into `base` with `attachedTo: "base@N"`, `PLAY_UPGRADE.target` `base@N`, `baseUpgrades` in every keyframe); a base upgrade sacrificed to its own Action (Carbonite Chamber) leaving `base`; a base using a granted triggered ability every round (`ABILITY_ACTIVATE` on `base@1` with `grantedBy`); a static base buff arriving as `STATS` (Verdant Fortress's Raid 1 on each Beast; Landing Pad is attached too, but no unit enters space, so its +1/+0 never shows); Beast tokens from a granted trigger and from an event; Weakness tokens stacking on a Beast until it dies at 0 HP (`frameworkEffect`, the token unit leaving for `outsideTheGame`); an empty-deck draw dealing damage with no `src`. |
| `stolen-hauler` | Real game: Stolen AT-Hauler defeated by Power of the Dark Side into its owner's discard, then played from there by the **opponent** (`MOVE` from `discard` with `"p": 2` for Player 1's card), twice. Gates the "whose pile" rule of [§12.1](#121-the-move-rule-the-big-one): the card leaves Player 1's pile, not Player 2's. |
| `death-star` | Real game, eight rounds ([§10.4](#104-grand-moff-tarkin-and-the-death-star)): Grand Moff Tarkin builds to nine resources and deploys by Epic Action as **The Death Star** (`backSideName` in `%%% CARDS`, the `DEPLOY_LEADER` a sub-step of the Epic Action, arriving in `space`), then at the start of the regroup phase defeats Player 2's base with 9 HP left — a `DEFEAT` on `base@2`, `baseDefeated: true` beside a non-zero `baseHp`. Along the way a Weakness given to the player's own unit stacks to a kill. |

The eight real-game vectors are regenerated from the writer by
`test/server/chat/SwuPgnVectors.spec.ts` and `SwuPgnOrganicGame.spec.ts` with
`SWUPGN_WRITE_VECTORS=1`; those specs also pin the fold and story byte for byte, so the
writer cannot drift from its own vectors unnoticed.

---

## 21. What is still not verified

This document describes the format as the reference implementation actually writes it. It
was shaken out against a real 7-round game (551 events) that exposed nine writer defects —
partial keyframes, unrecorded token removals, unresolvable token ids, malformed and no-op
MOVEs, placeholder provenance, and a specified-but-never-emitted `RESOURCE` — all fixed
before this version was published. That game now folds with **zero** keyframe mismatches.

The writer contract is gated on a real completed game by
`test/server/chat/SwuPgnWriterContract.spec.ts`: every keyframe carries both seats, folding
the events forward reproduces every keyframe, every status-token gain has a matching removal
by game end, no `MOVE` has an empty or identical `from`/`to` (and every zone named is in the
vocabulary), and `Engine`/`Seed` are not placeholders.

It is gated again on **organic** games — a natural setup phase (initiative, mulligan,
resourcing) through several rounds of plays, attacks and regroup resourcing to a concession —
folded with **no** field excluded: `SwuPgnOrganicGame.spec.ts` (four rounds), and the seven
scenario games of `SwuPgnVectors.spec.ts` that are also the `upgrades`, `pilot`, `capture`,
`arrest`, `stolen-hauler`, `homeworlds` and `death-star` vectors ([§20](#20-test-vectors)). In every one, every keyframe field reproduces exactly:
`handSize`, `resourcesReady` **and `resourcesExhausted`**, `credits`, `hasForce`, and per card
`upgrades` and `captured` alongside the counters; `validate()` returns no issue at all;
`%%% CARDS` covers every leader, base and deck id; and `GAME_END` takes the `.game-end` step of
the phase it happened in. Two further real-game gates cover the cases that first broke the
fold: a Change of Heart steal and return (`TAKE_CONTROL` re-seating), and Kazuda Xiono
deploying as a pilot (`DEPLOY_LEADER` with `target`). Six more cover what a second reading of
that export turned up: the `ROUND_END` keyframe taken at the seq it names, an action ability
numbered as its own action with the opponent's `PASS` left childless, `for` on every resourcing
`MOVE` with the regroup row readied in one record, `HEAL.src` with each `DEFEAT` under its
closed-set reason, `kind` on every activation, and `ms` on the numbered actions and nowhere
else. The undo trace is gated separately, against a real rollback
(`test/scenarios/undo/SwuPgnUndoRetention.spec.ts`). (The other real-game specs bootstrap at
the action phase, which discards the natural hand without a `MOVE`, so they cannot assert the
hand and resource counts past `R1.start`.) The credit rule was additionally checked against a
real 10-round export in which one Credit token was created, held across two rounds and spent:
0 mismatches under the widened gate.

`hand` and `discard` **contents** used to be the one un-gated pair here, on the grounds that
only the counts were reconstructable. That was wrong, and it was found by an implementer
building a replay client against this document rather than by the gate. Every `MOVE` names its
card, so both lists are exact; the fold simply discarded the information — `DRAW` appended to
`hand` and nothing ever removed, and `discard` was left to `DEFEAT`, which fires *after* the
`MOVE` that already emptied `cards`. Folding the five vectors' deltas produced **45
mismatches** against their own keyframes before the fix and **none** after. Both are now
`MOVE`-driven and gated at every keyframe.

That leaves the fields §14 lists as not compared — the top-level `round`, `phase`,
`initiative` and `active`, and each seat's `baseMaxHp` and `seat`, none of which is a delta
([§14](#14-checking-a-file-is-honest)). Every player and card field of §11 is compared, and the eight real-game vectors — Raid, Grit, Sentinel, tokens, upgrades, a pilot, a capture,
a base as captor, a card played out of the opponent's discard, leaders in and out of the base zone, base upgrades, a base defeated outright — pass with nothing to report.

One caveat on `hand`, and it is about a test harness rather than the format: the integration
specs that bootstrap a game directly at the action phase tear down the natural opening hand
without emitting a `MOVE` for it, so the folded hand keeps those cards. Those two specs defer
`hand` past the first keyframe exactly as they already defer `handSize`. An organic game —
natural setup, one bootstrap — reconstructs both exactly, which is what
`SwuPgnOrganicGame.spec.ts` gates.

Three engine paths the resource rule covers by construction have no dedicated real-game gate
yet, and a reader should treat their split (not their total, which every regroup re-syncs) as
best-effort until one exists: a card Smuggled or played from the resource row (its exit `MOVE`
carries `exhausted: true`), a resource a friendly effect returns to hand (swapped exhausted on
the way out, same flag), and a resource stolen while exhausted (`TAKE_CONTROL` with
`exhausted`). Each is exercised by unit tests of the recorder against the engine's documented
behaviour, not by a played game.

The **base Epic Action** was the one genuine hole in [§11](#what-the-board-covers-against-the-rules)'s
claim to cover CR 1.16's definition of the game state, and it was found the same way the hand and
discard bugs were: by an implementer reading the document against a real client, not by the gate.
§11 tracked Epic Actions only on the leader, while 12 bases carry one of their own. It is now
`baseEpicActionUsed`, gated, with a real-game spec against Tarkintown.

That leaves the leader's own flag, which one implementer reasonably asked about: a leader has
exactly **one** Epic Action, its deploy, and both forms of it — as a unit and as a pilot — share
a single limit, so one boolean is right by construction rather than by luck. It would stop being
right only if the engine let a leader register a second Epic Action, which today it structurally
cannot.

`baseHp`/`baseMaxHp` are still absent from the SETUP `INIT` record. A reader that ships card
data can derive a base's starting HP itself, and the first keyframe supplies it either way,
so this is low priority — but emitting it would give the keyframe gate an independent value
to check the first keyframe against, which is the one place it currently can't
([§14](#14-checking-a-file-is-honest)).

**A base as captor** (Arrest, SEC#195) is gated by the `arrest` vector, where Player 1's base
captures twice and each captive is rescued at the next regroup, and by
`test/server/chat/SwuPgnBaseCapture.spec.ts`, which compares the fold mid-phase with the engine
(the base holds the unit in `baseCaptured`, and no unit holds it) and again after the rescue.
One limit: Arrest's captive is always rescued at the start of the regroup phase, before the
`ROUND_END` keyframe, so in a real game the keyframe gate only ever sees an **empty**
`baseCaptured`. The held state is checked by the fold, the vector's `stateAt`, and that spec, not
by a keyframe.

**Homeworlds** ([§10.3](#103-homeworlds-fortify-beast-and-weakness)) is gated by the
`homeworlds` vector (five organic rounds, Fortify on both bases, Beasts, stacked Weakness and a
Weakness kill) and by `test/server/chat/SwuPgnHomeworlds.spec.ts`. That spec plays each
mechanic through the engine: a Fortify upgrade attached and sacrificed, a base's gained Action
and gained trigger with `grantedBy`, Alliance Shield Generator's replacement, a Beast created
for the opponent, a Beast readied on creation, a Weakness kill, and two stacked Weakness tokens.
The same spec gates Grand Moff Tarkin (a deploy counted as one action and named The Death Star; a
base defeated outright; the Pass that declines it; a damage kill's `DEFEAT` on `base@N`) and six
cards whose abilities depend on a base or a trait (Kashyyyk keywords and discounts, Gunga City
Guard losing Shielded, Ritual Dragon's ready entry, Surveillance Cruiser on the opponent's base,
The Tarkin Doctrine on a Fortification upgrade, Queen Amidala on an upgraded base). Four paths
have **no** real-game gate, and a reader should treat them as best-effort until one exists:

- **Continued play after the game has ended.** The writer records it, and writes a `DEFEAT` for a
  second base that falls then (a real-engine test plays exactly that, through a heal). But the file
  the server hands out is frozen at the moment the game ended, so today no served file contains
  continued play at all.
- **Tarkin defeating his own base.** The trigger may target either base. The writer records it
  the same way (`DEFEAT` on `base@1`, the opponent winning), but only the opponent's base has been
  played.
- **A base upgrade changing control.** No Homeworlds card does it today. If one ever does, there
  is no `TAKE_CONTROL` shape for a base upgrade yet. `TAKE_CONTROL` with `zone: "base"` means a
  Credit token or the Force.
- **An opponent's Fortify upgrade attached to your base** (playing it from their discard with an
  effect such as A Fine Addition). The writer names the host base in `attachedTo` / `target` and
  the owner in the `MOVE`'s `p`, so the fold attaches it to the right base and discards it to the
  right pile. But no played game exercises that split.

Some defined event types still never appear in a given real file, simply because nothing in
that game triggers them (`OVERWHELM`, `SEARCH` and friends). That is absence of the situation,
not a gap — unlike `RESOURCE`, which was specified, folded and rendered but had no code path
that emitted it at all; it is now emitted for every resourcing
([§10.1](#101-events-that-carry-board-detail)). `CAPTURE` and `RESCUE` were in that position
for a board reader — recorded, but with nothing a reader could file the card under — until the
`capture` vector.

---

## 22. Version history

### 1.0 — first release

Nothing before this. SWU-PGN/1.0 is the first published version of the format, so there is
no earlier file in the wild and no migration to do: a file either declares
`[Game "SWU-PGN/1.0"]` and follows this document, or it isn't SWU-PGN.

1.0 ships six sections, of which two exist purely so the artifact stands on its own:
`%%% CARDS` ([§6.5](#65-the-cards-index)) so no card database is needed to name anything,
and `%%% STORY` ([§16](#16-turning-a-file-into-a-story)) so a person can open the file and
read the game. Both are derived from `%%% EVENTS` and verifiable against it, and together
they cost about a fifth of the file — on a real game, 23 KB instead of 18 KB.

Future versions follow the rules in [§18](#18-versions-and-unknown-things): a MINOR bump
for additions old readers can ignore, a MAJOR bump for anything that would break them. When
one lands, this section gains a row per behaviour change and how to detect it from the file,
so a reader can tell versions apart without trusting the header alone.

### 1.0 writer changes before first release

**1.0 is in a pilot until it is published, and pilot files are pre-release.** The reference
writer changed behaviour several times while 1.0 was being shaken out against real games, and
files from that period were shared with other readers. They all say `SWU-PGN/1.0`, and some of
these changes alter what a record **means** under that one version string, not only what it
adds. Two matter most: `PASS` is now written only for the Pass action, which renumbers every
later action in a round, and a leader deployed by its own Epic Action is now a lettered sub-step
of that action rather than a numbered action of its own. A reader that meets a pilot file
SHOULD treat it as pre-release and use the **Detect** column below to tell which behaviour it
has. Nothing in it is guaranteed.

**From `WriterRevision` 1 on, the header says which writer made the file**
([§5.2](#52-you-may-have-these)). A file with no `WriterRevision` is a pilot file. A file
with one was written by that revision, and every row added below from here on names the
revision that introduced it, so a reader can switch on the number instead of guessing from the
contents.

None of these bumped the version, because 1.0 had not been published. Most are additions or
corrections a 1.0 reader already tolerates; the `PASS` and Epic Action deploy rows are not, and
after publication a change like them would need a new version ([§18](#18-versions-and-unknown-things)).
Each is detectable from the file:

| Earlier 1.0 files | Current 1.0 files | Detect |
|---|---|---|
| Story wrote `(2 resources)` after a play | `(cost 2)` — it is the printed cost ([§10.1](#101-events-that-carry-board-detail)) | a story line containing `resources)` |
| `CHOICE.offered` named a base by its card id (`SOR#029`) | `base@N` ([§6.3](#63-pointing-at-a-base)) | `offered` entry matching `^base@[12]$` |
| Deck construction emitted 40 `MOVE`s `outsideTheGame` → `deck` | not recorded ([§10.1](#101-events-that-carry-board-detail)) | any `MOVE` with `from: "outsideTheGame"`, `to: "deck"` |
| `%%% CARDS.kind` followed the live role (a pilot said `upgrade` while attached) | the printed identity ([§10.1](#kind-on-an-event-is-a-role-kind-in-cards-is-an-identity)) | not detectable from the index alone; a pilot's `MOVE` `kind` disagreeing with its index `kind` shows the current writer |
| `%%% CARDS` covered only ids that events mentioned | also the header's leaders/bases and every deck id ([§6.5](#65-the-cards-index)) | an undeployed leader (`P1Leader`) absent from the index |
| `GAME_END` seq was `R<n>.A.end`, shared with that phase's `PHASE_END` | `R<n>.<phase>.game-end`, its own step ([§9.1](#91-how-seq-is-built)) | a `GAME_END` whose seq ends in `.game-end` |
| A control change (`TAKE_CONTROL`) was a note with no fold effect, so a stolen unit stayed under its old seat | it re-seats the card ([§10.1](#101-events-that-carry-board-detail)) | a `TAKE_CONTROL` carrying `zone` |
| A leader deployed as a pilot was a `DEPLOY_LEADER` with no host, folded as its own unit | `kind: "upgrade"` + `target` ([§10.1](#101-events-that-carry-board-detail)) | a `DEPLOY_LEADER` carrying `target` |
| No way to tell a complete file from one whose writer dropped events | header carries `RecorderErrors` when a handler failed ([§5.2](#52-you-may-have-these)) | the tag's presence |
| A malformed keyframe, or a non-array `cards`/`hand`/`discard`, crashed the reference reader | ignored and reported ([§13](#13-keyframes), [§14](#14-checking-a-file-is-honest)); `validate()` rejects the shapes the fold dereferences | `validate()` errors, or a `keyframe` mismatch |
| `Date` was when the file was written | when the game started ([§5.1](#51-you-must-have-these)) | not detectable; treat an early file's `Date` as "at or after game end" |
| Nothing recorded resources being spent: the row read "all ready" for a whole action phase | `EXHAUST_RESOURCES` / `READY_RESOURCES` counters, and `exhausted` on a `MOVE` out of the row ([§10.1](#101-events-that-carry-board-detail)); `resourcesExhausted` gated | any `EXHAUST_RESOURCES` record |
| A resource card readied at regroup was a per-card `READY` a reader had no card to apply to | the counter record ([§10.1](#101-events-that-carry-board-detail)) | a `READY` naming a card that was resourced shows the early writer |
| A token upgrade's exit `MOVE` named its host (`attachedTo`); a printed upgrade's and a pilot's did not | no exit names a host; readers detach on the zone transition ([§10.1](#binding-an-attachment-to-its-host)) | a `MOVE` out of an arena carrying `attachedTo` |
| The fold ignored `attachedTo` and never detached, so `upgrades[]` only grew | `attachedTo` attaches, exits and `DEFEAT` detach ([§12.1](#121-the-move-rule-the-big-one)); `upgrades` gated | not a file change; a reader's fold |
| Credit tokens and the Force moved on `MOVE`s the fold ignored; a Credit token changing hands was dropped as a `base` → `base` no-op | `credits` / `hasForce` folded from those moves ([§12.1](#121-the-move-rule-the-big-one)); the steal is a `TAKE_CONTROL` with `zone: "base"` | a `TAKE_CONTROL` whose `zone` is `base` |
| `CAPTURE.p` was the captured card's owner, and no field named the captor | `p` is the seat that now holds the card, `by` is the captor; `CardInstanceState.captured` ([§10.1](#101-events-that-carry-board-detail)) | a `CAPTURE` carrying `by` |
| A Weakness token (any token upgrade other than Shield/Experience/Advantage) was recorded as a printed upgrade | a `STATUS_TOKEN` under its own name, by type ([the token contract](#the-token-gainremoval-contract)) | a `STATUS_TOKEN` whose `token` is not `advantage` |
| Keyframe cards carried no stats and no captives | `power`, `hp` and `captured` ([§11](#11-the-board-you-build-reducedstate)) | the fields' presence |
| `Engine` preferred the package version, so every production file said `forceteki@0.1.0` | git SHA before package version ([§5.3](#53-provenance-engine-and-seed)) | an `Engine` that is a SHA |
| The `minimal` vector began at the `R1.start` keyframe and failed its own gate | a setup prologue; four real-game vectors added ([§20](#20-test-vectors)) | not a file change |
| A `ROUND_END` keyframe was snapshotted after the engine tore the round down, so it reported `phase: "setup"` and `initiativeTaken: false` for a round that claimed | snapshotted at the seq it names ([§13](#13-keyframes)) | a `ROUND_END` keyframe whose `phase` is `regroup` |
| An action ability was a sub-event, so it was filed under the last numbered action — the opponent's `PASS` — along with everything it did | its own numbered action ([§9](#9-the-events-section-and-seq-numbers), [§16](#16-turning-a-file-into-a-story)) | an `ABILITY_ACTIVATE` on a top-level step, or carrying `kind` |
| The only clue to what sort of ability fired was the shape of `ability` | `kind`, and `title` ([§10.1](#101-events-that-carry-board-detail)) | the fields' presence |
| The hand→`resource` `MOVE` carried the previous beat's number and no `for`, so a reader filed the card under the wrong player | stamped with its `RESOURCE`'s seq ([§9.1](#91-how-seq-is-built)) | a `MOVE` to `resource` carrying `for` |
| The regroup wrote one `READY_RESOURCES` per resource — 54 in a 7-round game, every one `amount: 1` | one per unbroken run ([§10.1](#101-events-that-carry-board-detail)) | a `READY_RESOURCES` whose `amount` is above 1 |
| `HEAL` said HP went up and nothing about what healed | optional `src`, on `DAMAGE.src`'s terms ([§10.1](#101-events-that-carry-board-detail)) | a `HEAL` carrying `src` |
| `DEFEAT.reason` was an open list, so a reader could not switch on it, and an unresolved cause wrote `""` | a closed set, `unknown` included ([§6.4](#64-small-vocabularies)) | a `DEFEAT` whose `reason` is `unknown`, or `validate()` rejecting one outside the set |
| An undo left no trace: a file where six decisions were retracted read like one where none were | `Undos` and `UNDO` notes ([§5.2](#52-you-may-have-these), [§10.2](#102-events-that-are-just-notes)) | the tag, or any `UNDO` record |
| Nothing in a file said how long a decision took; `Date` and `EndDate` give only the whole game | optional `ms` on numbered actions and round/phase starts ([§5.2.1](#521-timing-ms)) | any record carrying `ms` |
| A unit entering play exhausted was never written, so every replay showed a just-played unit ready | an `EXHAUST` right after its arrival ([§10.1](#101-events-that-carry-board-detail)) | an `EXHAUST` for a card in the same action as its `PLAY` |
| Nothing carried a unit's live stats between keyframes; keyframes carried none at all | `STATS` after every change; `power`/`hp`/`keywords` on keyframe cards, gated ([§10.1](#stats)) | any `STATS` record |
| The leader in the base zone, the deck count and the initiative counter's status were not in the board | `leader`, `deckSize`, `initiativeTaken` in every keyframe; `epic` on `DEPLOY_LEADER` / `ABILITY_ACTIVATE`; a returning Leader Unit's `EXHAUST` ([§11](#11-the-board-you-build-reducedstate)) | a keyframe carrying `leader` |
| The `minimal` vector attacked with a unit the turn it was played | rules-legal two-round game ([§20](#20-test-vectors)) | not a file change |
| The resource row was counted only, so a reader could not draw the cards in it | `resources[]` membership alongside the two counts ([§10.1](#101-events-that-carry-board-detail)) | a keyframe carrying `resources` |
| A base's Epic Action was not tracked at all, though 12 bases carry one | `baseEpicActionUsed`, set by an `ABILITY_ACTIVATE` whose `card` is `base@N` ([§10.1](#101-events-that-carry-board-detail)) | an `ABILITY_ACTIVATE` whose `card` matches `^base@[12]$` |
| A base activating its own ability named itself by card id | `base@N`, like every other reference to a base ([§6.3](#63-pointing-at-a-base)) | the same |
| Nothing linked a pre-announcement record to its action; readers had to implement §9.1's prose | `for` on each such record, stamped by the writer ([§9.1](#91-how-seq-is-built)) | any `for` field |
| Whose turn it is was not recorded | `active` in keyframes ([§11](#11-the-board-you-build-reducedstate)) | a keyframe carrying `active` |
| No game duration, no match grouping | `EndDate`, `Match`, `GameNumber` header tags ([§5.2](#52-you-may-have-these)) | the tags' presence |
| A token unit's `CREATE_TOKEN` was dropped and `RecorderErrors` set, because the writer read the token's live stats while it was still outside the game | stats guarded and omitted when unreadable; `zone` names the destination arena ([§10.1](#101-events-that-carry-board-detail)) | a game containing a token unit but no `CREATE_TOKEN`, and a `RecorderErrors` tag |
| A double-sided leader's face was not recorded, so a flipped leader replayed as its starting side for the whole game | `LEADER_FLIP` + `leader.onStartingSide` ([§10.1](#101-events-that-carry-board-detail)) | any `LEADER_FLIP` record, or a keyframe leader carrying `onStartingSide` |
| A Fortify upgrade (Homeworlds) was in no board field at all: its `MOVE` into `base` named no host, `PLAY_UPGRADE.target` was the base's card id, and no keyframe listed it, so a reader could not show what was on a base | `attachedTo` / `target` `base@N`, and `baseUpgrades` on the seat, folded and gated ([§10.3](#103-homeworlds-fortify-beast-and-weakness), [§12.1](#121-the-move-rule-the-big-one)) | a keyframe carrying `baseUpgrades` |
| An ability a base gained from an upgrade said only that the base used it; the grantor was inside the engine's `ability` string | `grantedBy` ([§10.1](#101-events-that-carry-board-detail)) | an `ABILITY_ACTIVATE` carrying `grantedBy` |
| Damage and heals dealt by a base, and units defeated by one, named the base by its card id | `base@N` in `DAMAGE.src`, `HEAL.src` and `DEFEAT.defeatedBy` ([§6.3](#63-pointing-at-a-base)) | a `src` or `defeatedBy` matching `^base@[12]$` |
| Damage the rules dealt with no card responsible (drawing from an empty deck) wrote the engine's display string as `src` — `"Framework effect"`, then `"Framework effect:2"` | `src` omitted ([§10.1](#101-events-that-carry-board-detail)) | a `DAMAGE` with no `src` |
| An effect applied a step after its event (a base's gained "+1/+0") had its `STATS` filed under the record after the action, and so `for` the opponent's next action | settled before the turn passes, under the action that caused it ([§10.1](#stats)) | not detectable from a single record |
| A unit arriving in play just before an action (a start-of-phase trigger's Beast) had its `MOVE`, `STATS` and `EXHAUST` stamped `for` that action | another card's arrival ends the run ([§9.1](#91-how-seq-is-built)) | not detectable from a single record |
| `PASS` was written every time the turn passed to the opponent, so every play and attack was followed by a `PASS` from the same player, and the story read "Player 1 passes" after each action | `PASS` only for the Pass action ([§10.2](#102-events-that-are-just-notes)); every action after the first renumbers | two `PASS` records in a row from the same player, or a `PASS` right after that player's own `PLAY`/`ATTACK`, shows the early writer |
| `DRAW.count` was the number of cards asked for, so a draw from a short deck said 2 and listed 1 | the cards actually drawn ([§10.1](#101-events-that-carry-board-detail)) | a `DRAW` whose `count` differs from `cards.length` |
| A keyframe's lists were snapped to at any length | over 1000 entries makes the keyframe damaged ([§13](#13-keyframes)) | not a file change; a reader's trust check |
| A base defeated outright by an ability (Grand Moff Tarkin) left no record: the game ended with the base standing at its HP | a `DEFEAT` on `base@N` for every defeated base, by damage or outright, and `baseDefeated` on the seat ([§10.1](#101-events-that-carry-board-detail), [§10.4](#104-grand-moff-tarkin-and-the-death-star)) | a `DEFEAT` whose `card` matches `^base@[12]$` |
| A leader whose deployed side is another card (Tarkin / The Death Star; also a flipped Palpatine) was named in `%%% CARDS` by whichever side ended the game up | the printed front as `name`, the other side as `backSideName` ([§6.5](#65-the-cards-index)) | an index entry carrying `backSideName` |
| A leader deployed by its own Epic Action was two numbered actions — the ability, then the `DEPLOY_LEADER` | the deploy is the ability's sub-step ([§10.1](#101-events-that-carry-board-detail)) | a `DEPLOY_LEADER` with a lettered seq |
| `hand[]` grew from `DRAW` and nothing removed, so a folded "hand" was a cumulative draw log; `discard` was filed by `DEFEAT`, which fires after the `MOVE` that already removed the card, so no defeated unit reached the pile | both are folded from `MOVE` and gated ([§12.1](#121-the-move-rule-the-big-one), [§14](#14-checking-a-file-is-honest)) | not a file change; a reader's fold. Fold any vector's deltas to a keyframe and compare `hand`/`discard` — 45 mismatches before, 0 after |
| No header tag said which writer made a file, so a pilot file and a current one were told apart only by their contents | `WriterRevision` ([§5.2](#52-you-may-have-these)); revision 1 is the first | the tag's presence |
| A unit captured by a **base** (Arrest) left the board and was held nowhere, so it vanished from the fold until its rescue, and §10.1 said no card captures with a base | the seat's `baseCaptured`, pushed by a `CAPTURE` whose `by` is `base@N`, cleared on leaving `capture`, carried in every keyframe and gated ([§10.1](#101-events-that-carry-board-detail), [§11](#11-the-board-you-build-reducedstate)). Revision 1 | a keyframe carrying `baseCaptured` |
| **Revision 2.** Story joined a list of cards with `, `, which a card's own title-and-subtitle comma made impossible to split | ` · ` between cards ([§16](#16-turning-a-file-into-a-story)) | `WriterRevision` 2 or later; in an older file, a `draws N:` story line whose names are separated by `, ` |

---

## Appendix A: a whole tiny game

This is the `minimal` test vector. It is normative — your code must turn A.1 into A.2 and
A.3 exactly.

### A.1 The file

```
[Game "SWU-PGN/1.0"]
[GameId "vector-minimal"]
[Date "2026-06-16T00:00:00Z"]
[Format "Premier"] [CardPool "SOR"] [Engine "forceteki@reference"]
[Seed "0"]
[P1Id "sha256:aaaa"] [P2Id "sha256:bbbb"] [P1 "Player 1"] [P2 "Player 2"]
[P1Leader "SOR#010"] [P1Base "SOR#028"] [P2Leader "SOR#005"] [P2Base "SOR#020"]
[Result "Incomplete"] [Reason "Sample"] [Rounds "2"]

%%% STORY
 ── setup ──
       ↳ Player 1 draws 3: Wampa · Wampa #2 · Wampa #3
       ↳ Player 2 draws 3: Cell Block Guard · Cell Block Guard #2 · Cell Block Guard #3
       ↳ Player 1 keeps their hand
       ↳ Player 2 keeps their hand
       ↳ Player 1 resources Wampa #2
       ↳ Player 1 resources Wampa #3
       ↳ Player 2 resources Cell Block Guard #2
       ↳ Player 2 resources Cell Block Guard #3

══════════════════════════════════════════════════════════════════════════════
 ROUND 1                                                 initiative: Player 1 
 P1  base 30/30   hand 1   resources 2/2   deck 2   leader ready
 P2  base 30/30   hand 1   resources 2/2   deck 2   leader ready
══════════════════════════════════════════════════════════════════════════════

 ── action ──
  1. Player 1 plays Wampa to ground (cost 2)
  2. Player 2 passes
  3. Player 1 passes
 ── regroup ──
       ↳ Player 1 draws 2: Wampa #4 · Wampa #5
       ↳ Player 2 draws 2: Cell Block Guard #4 · Cell Block Guard #5
       ↳ Player 1 resources Wampa #4
       ↳ Player 2 resources Cell Block Guard #4

══════════════════════════════════════════════════════════════════════════════
 ROUND 2                                                 initiative: Player 1 
 P1  base 30/30   hand 1   resources 3/3   deck 0   leader ready
      ground: Wampa 4/5
 P2  base 30/30   hand 2   resources 3/3   deck 0   leader ready
══════════════════════════════════════════════════════════════════════════════

 ── action ──
  1. Player 1 attacks Player 2's base with Wampa
       ↳ 4 damage to Player 2's base — 26 HP left

%%% DECKS
{"p":1,"leader":"SOR#010","base":"SOR#028","deck":[["SOR#108",5]]}
{"p":2,"leader":"SOR#005","base":"SOR#020","deck":[["SOR#045",5]]}

%%% CARDS
{"id":"SOR#005","name":"Darth Vader, Dark Lord of the Sith"}
{"id":"SOR#010","name":"Luke Skywalker, Faithful Friend"}
{"id":"SOR#020","name":"Command Center"}
{"id":"SOR#028","name":"Echo Base"}
{"id":"SOR#045","name":"Cell Block Guard","kind":"unit"}
{"id":"SOR#108","name":"Wampa","kind":"unit"}

%%% SETUP
{"seq":"R1.S.0","t":"INIT","p1DeckOrder":["SOR#108","SOR#108:2","SOR#108:3","SOR#108:4","SOR#108:5"],"p2DeckOrder":["SOR#045","SOR#045:2","SOR#045:3","SOR#045:4","SOR#045:5"]}

%%% EVENTS
{"seq":"R0.S.start","t":"PHASE_START","phase":"setup"}
{"seq":"R0.S.1","t":"MODAL_CHOICE","p":1,"offered":["Yourself","Opponent"],"chose":0}
{"seq":"R0.S.2","t":"SHUFFLE","p":1}
{"seq":"R0.S.3","t":"MOVE","card":"SOR#108","from":"deck","to":"hand","p":1,"kind":"unit"}
{"seq":"R0.S.4","t":"MOVE","card":"SOR#108:2","from":"deck","to":"hand","p":1,"kind":"unit"}
{"seq":"R0.S.5","t":"MOVE","card":"SOR#108:3","from":"deck","to":"hand","p":1,"kind":"unit"}
{"seq":"R0.S.6","t":"DRAW","p":1,"count":3,"cards":["SOR#108","SOR#108:2","SOR#108:3"]}
{"seq":"R0.S.7","t":"SHUFFLE","p":2}
{"seq":"R0.S.8","t":"MOVE","card":"SOR#045","from":"deck","to":"hand","p":2,"kind":"unit"}
{"seq":"R0.S.9","t":"MOVE","card":"SOR#045:2","from":"deck","to":"hand","p":2,"kind":"unit"}
{"seq":"R0.S.10","t":"MOVE","card":"SOR#045:3","from":"deck","to":"hand","p":2,"kind":"unit"}
{"seq":"R0.S.11","t":"DRAW","p":2,"count":3,"cards":["SOR#045","SOR#045:2","SOR#045:3"]}
{"seq":"R0.S.12","t":"KEEP_HAND","p":1}
{"seq":"R0.S.13","t":"KEEP_HAND","p":2}
{"seq":"R0.S.14","t":"MOVE","card":"SOR#108:2","from":"hand","to":"resource","p":1,"kind":"unit"}
{"seq":"R0.S.15","t":"RESOURCE","p":1,"card":"SOR#108:2"}
{"seq":"R0.S.16","t":"MOVE","card":"SOR#108:3","from":"hand","to":"resource","p":1,"kind":"unit"}
{"seq":"R0.S.17","t":"RESOURCE","p":1,"card":"SOR#108:3"}
{"seq":"R0.S.18","t":"MOVE","card":"SOR#045:2","from":"hand","to":"resource","p":2,"kind":"unit"}
{"seq":"R0.S.19","t":"RESOURCE","p":2,"card":"SOR#045:2"}
{"seq":"R0.S.20","t":"MOVE","card":"SOR#045:3","from":"hand","to":"resource","p":2,"kind":"unit"}
{"seq":"R0.S.21","t":"RESOURCE","p":2,"card":"SOR#045:3"}
{"seq":"R0.S.end","t":"PHASE_END","phase":"setup"}
{"seq":"R1.start","t":"ROUND_START","round":1,"keyframe":{"round":1,"phase":"action","initiative":1,"initiativeTaken":false,"players":{"1":{"seat":1,"baseHp":30,"baseMaxHp":30,"handSize":1,"hand":["SOR#108"],"resourcesReady":2,"resourcesExhausted":0,"credits":0,"hasForce":false,"discard":[],"cards":[],"deckSize":2,"leader":{"id":"SOR#010","deployed":false,"exhausted":false,"epicActionUsed":false}},"2":{"seat":2,"baseHp":30,"baseMaxHp":30,"handSize":1,"hand":["SOR#045"],"resourcesReady":2,"resourcesExhausted":0,"credits":0,"hasForce":false,"discard":[],"cards":[],"deckSize":2,"leader":{"id":"SOR#005","deployed":false,"exhausted":false,"epicActionUsed":false}}}}}
{"seq":"R1.A.start","t":"PHASE_START","phase":"action"}
{"seq":"R1.A.0a","t":"EXHAUST_RESOURCES","p":1,"amount":2}
{"seq":"R1.A.0b","t":"MOVE","card":"SOR#108","from":"hand","to":"ground","p":1,"kind":"unit"}
{"seq":"R1.A.0c","t":"STATS","card":"SOR#108","power":4,"hp":5,"keywords":["overwhelm"]}
{"seq":"R1.A.1","t":"PLAY","p":1,"card":"SOR#108","zone":"ground","cost":2}
{"seq":"R1.A.1a","t":"EXHAUST","card":"SOR#108"}
{"seq":"R1.A.2","t":"PASS","p":2}
{"seq":"R1.A.3","t":"PASS","p":1}
{"seq":"R1.A.end","t":"PHASE_END","phase":"action"}
{"seq":"R1.G.start","t":"PHASE_START","phase":"regroup"}
{"seq":"R1.G.1","t":"MOVE","card":"SOR#108:4","from":"deck","to":"hand","p":1,"kind":"unit"}
{"seq":"R1.G.2","t":"MOVE","card":"SOR#108:5","from":"deck","to":"hand","p":1,"kind":"unit"}
{"seq":"R1.G.3","t":"DRAW","p":1,"count":2,"cards":["SOR#108:4","SOR#108:5"]}
{"seq":"R1.G.4","t":"MOVE","card":"SOR#045:4","from":"deck","to":"hand","p":2,"kind":"unit"}
{"seq":"R1.G.5","t":"MOVE","card":"SOR#045:5","from":"deck","to":"hand","p":2,"kind":"unit"}
{"seq":"R1.G.6","t":"DRAW","p":2,"count":2,"cards":["SOR#045:4","SOR#045:5"]}
{"seq":"R1.G.7","t":"MOVE","card":"SOR#108:4","from":"hand","to":"resource","p":1,"kind":"unit"}
{"seq":"R1.G.8","t":"RESOURCE","p":1,"card":"SOR#108:4"}
{"seq":"R1.G.9","t":"MOVE","card":"SOR#045:4","from":"hand","to":"resource","p":2,"kind":"unit"}
{"seq":"R1.G.10","t":"RESOURCE","p":2,"card":"SOR#045:4"}
{"seq":"R1.G.11","t":"READY","card":"SOR#108"}
{"seq":"R1.G.12","t":"READY_RESOURCES","p":1,"amount":2}
{"seq":"R1.G.end","t":"PHASE_END","phase":"regroup"}
{"seq":"R1.end","t":"ROUND_END","round":1,"keyframe":{"round":1,"phase":"regroup","initiative":1,"initiativeTaken":false,"players":{"1":{"seat":1,"baseHp":30,"baseMaxHp":30,"handSize":1,"hand":["SOR#108:5"],"resourcesReady":3,"resourcesExhausted":0,"credits":0,"hasForce":false,"discard":[],"cards":[{"id":"SOR#108","zone":"ground","damage":0,"exhausted":false,"upgrades":[],"shields":0,"experience":0,"statusTokens":{},"captured":[],"power":4,"hp":5,"keywords":["overwhelm"]}],"deckSize":0,"leader":{"id":"SOR#010","deployed":false,"exhausted":false,"epicActionUsed":false}},"2":{"seat":2,"baseHp":30,"baseMaxHp":30,"handSize":2,"hand":["SOR#045","SOR#045:5"],"resourcesReady":3,"resourcesExhausted":0,"credits":0,"hasForce":false,"discard":[],"cards":[],"deckSize":0,"leader":{"id":"SOR#005","deployed":false,"exhausted":false,"epicActionUsed":false}}}}}
{"seq":"R2.start","t":"ROUND_START","round":2,"keyframe":{"round":2,"phase":"action","initiative":1,"initiativeTaken":false,"players":{"1":{"seat":1,"baseHp":30,"baseMaxHp":30,"handSize":1,"hand":["SOR#108:5"],"resourcesReady":3,"resourcesExhausted":0,"credits":0,"hasForce":false,"discard":[],"cards":[{"id":"SOR#108","zone":"ground","damage":0,"exhausted":false,"upgrades":[],"shields":0,"experience":0,"statusTokens":{},"captured":[],"power":4,"hp":5,"keywords":["overwhelm"]}],"deckSize":0,"leader":{"id":"SOR#010","deployed":false,"exhausted":false,"epicActionUsed":false}},"2":{"seat":2,"baseHp":30,"baseMaxHp":30,"handSize":2,"hand":["SOR#045","SOR#045:5"],"resourcesReady":3,"resourcesExhausted":0,"credits":0,"hasForce":false,"discard":[],"cards":[],"deckSize":0,"leader":{"id":"SOR#005","deployed":false,"exhausted":false,"epicActionUsed":false}}}}}
{"seq":"R2.A.start","t":"PHASE_START","phase":"action"}
{"seq":"R2.A.0a","t":"CHOICE","p":1,"prompt":"Wampa","offered":["base@2"],"chose":0}
{"seq":"R2.A.0b","t":"EXHAUST","card":"SOR#108"}
{"seq":"R2.A.1","t":"ATTACK","p":1,"atk":"SOR#108","def":"base@2","defenderType":"base"}
{"seq":"R2.A.1a","t":"DAMAGE","src":"SOR#108","tgt":"base@2","amt":4,"damageType":"combat","hp":26}

%%% ANNOTATIONS
{"ref":"R2.A.1","nag":"?!","text":"attacking the base rather than developing the board"}
```

### A.2 The board it folds to

```json
{
  "round": 2,
  "phase": "action",
  "initiative": 1,
  "initiativeTaken": false,
  "players": {
    "1": {
      "seat": 1,
      "baseHp": 30,
      "baseMaxHp": 30,
      "handSize": 1,
      "hand": [
        "SOR#108:5"
      ],
      "resourcesReady": 3,
      "resourcesExhausted": 0,
      "credits": 0,
      "hasForce": false,
      "discard": [],
      "cards": [
        {
          "id": "SOR#108",
          "zone": "ground",
          "damage": 0,
          "exhausted": true,
          "upgrades": [],
          "shields": 0,
          "experience": 0,
          "statusTokens": {},
          "captured": [],
          "power": 4,
          "hp": 5,
          "keywords": [
            "overwhelm"
          ]
        }
      ],
      "deckSize": 0,
      "leader": {
        "id": "SOR#010",
        "deployed": false,
        "exhausted": false,
        "epicActionUsed": false
      }
    },
    "2": {
      "seat": 2,
      "baseHp": 26,
      "baseMaxHp": 30,
      "handSize": 2,
      "hand": [
        "SOR#045",
        "SOR#045:5"
      ],
      "resourcesReady": 3,
      "resourcesExhausted": 0,
      "credits": 0,
      "hasForce": false,
      "discard": [],
      "cards": [],
      "deckSize": 0,
      "leader": {
        "id": "SOR#005",
        "deployed": false,
        "exhausted": false,
        "epicActionUsed": false
      }
    }
  }
}
```

### A.3 The story it renders to

```
 ── setup ──
       ↳ Player 1 draws 3: Wampa · Wampa #2 · Wampa #3
       ↳ Player 2 draws 3: Cell Block Guard · Cell Block Guard #2 · Cell Block Guard #3
       ↳ Player 1 keeps their hand
       ↳ Player 2 keeps their hand
       ↳ Player 1 resources Wampa #2
       ↳ Player 1 resources Wampa #3
       ↳ Player 2 resources Cell Block Guard #2
       ↳ Player 2 resources Cell Block Guard #3

══════════════════════════════════════════════════════════════════════════════
 ROUND 1                                                 initiative: Player 1 
 P1  base 30/30   hand 1   resources 2/2   deck 2   leader ready
 P2  base 30/30   hand 1   resources 2/2   deck 2   leader ready
══════════════════════════════════════════════════════════════════════════════

 ── action ──
  1. Player 1 plays Wampa to ground (cost 2)
  2. Player 2 passes
  3. Player 1 passes
 ── regroup ──
       ↳ Player 1 draws 2: Wampa #4 · Wampa #5
       ↳ Player 2 draws 2: Cell Block Guard #4 · Cell Block Guard #5
       ↳ Player 1 resources Wampa #4
       ↳ Player 2 resources Cell Block Guard #4

══════════════════════════════════════════════════════════════════════════════
 ROUND 2                                                 initiative: Player 1 
 P1  base 30/30   hand 1   resources 3/3   deck 0   leader ready
      ground: Wampa 4/5
 P2  base 30/30   hand 2   resources 3/3   deck 0   leader ready
══════════════════════════════════════════════════════════════════════════════

 ── action ──
  1. Player 1 attacks Player 2's base with Wampa
       ↳ 4 damage to Player 2's base — 26 HP left
```

### A.4 Step by step

**Header** — every `[Tag "Value"]` pair is pulled out, including the three on one line.

**STORY** — plain text, kept verbatim. It is what §16 produces from the sections below, so a
reader can check it rather than trust it.

**DECKS** — two lines, one per player. Player 1 runs 5 copies of `SOR#108`.

**CARDS** — six entries. This is why the story says `Wampa` and not `SOR#108`, with no card
database involved. The two units carry `kind: "unit"`; the leaders and bases carry none.

**SETUP** — `INIT` says Player 1's deck is five Wampas, `SOR#108` on top.

**EVENTS, folding** — the setup phase is round 0, and the first keyframe comes when round 1
begins, so the setup deltas are what it has to add up to:

| Event | What happens to the board |
|---|---|
| `PHASE_START {phase:"setup"}` | `phase = "setup"` |
| `MODAL_CHOICE` | nothing (a note: Player 1 chose to go first) |
| `SHUFFLE` | nothing |
| three `MOVE deck → hand` for Player 1 | `handSize` 0 → 3; `deckSize` is still unknown (no keyframe yet), so untouched; the cards are not in play, so `cards` stays empty |
| `DRAW {count:3, cards:[…]}` | the three ids go onto `hand`; **`handSize` is untouched** — the MOVEs did that |
| the same for Player 2 | `handSize` 3, `hand` filled |
| `KEEP_HAND` ×2 | nothing |
| `MOVE hand → resource` (`SOR#108:2`) + `RESOURCE` | `handSize` 3 → 2, `resourcesReady` 0 → 1; `RESOURCE` itself does nothing |
| `MOVE` + `RESOURCE` (`SOR#108:3`) | `handSize` 1, `resourcesReady` 2 |
| the same two for Player 2 | `handSize` 1, `resourcesReady` 2 |
| `PHASE_END` | nothing |
| `ROUND_START {round:1, keyframe}` | the keyframe says exactly what the fold has built — hand 1, resources 2, each seat — plus what the fold could not know: `deckSize` 2 and each `leader` (both in the base zone, ready, Epic Action unused). It is authoritative: the state is **replaced** by it. `checkKeyframes()` compares first and finds nothing to report (`baseHp` and `deckSize` are exempt here, [§14](#14-checking-a-file-is-honest)). |
| `PHASE_START {phase:"action"}` | `phase = "action"` |
| `EXHAUST_RESOURCES {p:1, amount:2}` | Player 1 pays for the Wampa: `resourcesReady` 2 → 0, `resourcesExhausted` 0 → 2. Under action `0`: the engine pays before it announces the play ([§9.1](#91-how-seq-is-built)). |
| `MOVE hand → ground` (`SOR#108`) | `handSize` 1 → 0; a fresh `SOR#108` is added to player 1's `cards` — `exhausted: false`, no stats yet |
| `STATS {power:4, hp:5, keywords:["overwhelm"]}` | the Wampa's live numbers, stated; nothing was derived |
| `PLAY {p:1, card:"SOR#108", zone:"ground"}` | already tracked: nothing but its zone, which is unchanged. **Not** added twice. |
| `EXHAUST {card:"SOR#108"}` | it entered play exhausted, as units do — this record is how the file says so |
| `PASS` ×2 | nothing |
| `PHASE_END`, `PHASE_START {regroup}` | `phase = "regroup"` |
| two `MOVE deck → hand` + `DRAW`, each player | `handSize` 0 → 2 / 1 → 3; `deckSize` 2 → 0 (known since the keyframe) |
| `MOVE hand → resource` + `RESOURCE`, each player | `handSize` 1 / 2; `resourcesReady` 0 → 1 for Player 1, whose other two are still exhausted from the Wampa, and 2 → 3 for Player 2 |
| `READY {card:"SOR#108"}` | the Wampa readies |
| `READY_RESOURCES {p:1, amount:2}` | Player 1's two exhausted resources ready, one record for the run: `resourcesExhausted` 2 → 0, `resourcesReady` 1 → 3 |
| `PHASE_END`, `ROUND_END {keyframe}` | compared — every field, `deckSize` now included — and matched; then snapped to |
| `ROUND_START {round:2, keyframe}` | likewise; `initiativeTaken` is `false` again |
| `PHASE_START {phase:"action"}` | `phase = "action"` |
| `CHOICE` | nothing (a note: the attack target was picked) |
| `EXHAUST {card:"SOR#108"}` | the attacker exhausts, before the attack is announced ([§9.1](#91-how-seq-is-built)) |
| `ATTACK` | nothing (it's just a note) |
| `DAMAGE {tgt:"base@2", amt:4, hp:26}` | `players[2].baseHp = 26` — a Wampa hits for 4 |

**ANNOTATIONS** — one note on `R2.A.1`, glyph `?!` ("dubious"), with a comment.

**EVENTS, rendering:**

| Event | What gets printed |
|---|---|
| `PHASE_START {setup}` | ` ── setup ──` · counter → 0 |
| `MODAL_CHOICE`, `SHUFFLE`, every `MOVE`, `STATS`, `EXHAUST`, `READY`, the resource counters | nothing — mechanism |
| `DRAW` | indented: `       ↳ Player 1 draws 3: Wampa · Wampa #2 · Wampa #3` — the `:N` copy suffix becomes ` #N` |
| `KEEP_HAND` | indented: `       ↳ Player 1 keeps their hand` |
| `RESOURCE` | indented: `       ↳ Player 1 resources Wampa #2` — this is what `RESOURCE` is for; its `MOVE` printed nothing |
| `ROUND_START` | blank, rule, ` ROUND 1` + initiative, the board from its keyframe (`resources 2/2   deck 2   leader ready`; in round 2 `ground: Wampa 4/5`), rule, blank · counter → 0 |
| `PHASE_START {action}` / `{regroup}` | ` ── action ──` / ` ── regroup ──` · counter → 0 |
| `PLAY` | numbered: `  1. Player 1 plays Wampa to ground (cost 2)` — the printed cost; what was paid is in the events |
| `PASS` | numbered: `  2. Player 2 passes` |
| `ATTACK` | numbered: `  1. Player 1 attacks Player 2's base with Wampa` |
| `DAMAGE` | indented under it: `       ↳ 4 damage to Player 2's base — 26 HP left` |
