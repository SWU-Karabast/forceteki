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
10. [Every event type](#10-every-event-type)
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
- **rebuild the board** at any moment,
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
- MUST NOT emit a `MOVE` with an empty `from`/`to`, or with `from` equal to `to`
  ([§10.1](#101-events-that-carry-board-detail)).
- MUST put real values in `Engine` and `Seed` in production output
  ([§5.3](#53-provenance-engine-and-seed)).
- SHOULD emit `%%% CARDS` covering every id the file mentions, and `%%% STORY` matching
  what the renderer produces ([§6.5](#65-the-cards-index), [§16](#16-turning-a-file-into-a-story)).
- MUST NOT put real usernames or any real identifying info in the file.

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
 1. Player 1 plays Wampa to ground (2 resources)
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
- All header lines MUST come **before** the first `%%%` banner.
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
NOT try to JSON-parse them, and MUST keep them verbatim — blank lines included, since they
are part of the layout. Read everything after the `%%% STORY` banner as text until the next
banner.

### When to throw an error

| What went wrong | Error message |
|---|---|
| A required header tag is missing | `SWU-PGN: missing required header tag [TagName]` |
| A line isn't valid JSON | `SWU-PGN: invalid JSON on line N` |
| A JSON line sits under a banner that isn't one of the four | `SWU-PGN: JSON record in unrecognized section on line N` |
| A JSON line appears before any banner | `SWU-PGN: record before any %%% section on line N` |

---

## 5. The header tags

### 5.1 You must have these

| Tag | What it holds |
|---|---|
| `Game` | Exactly `"SWU-PGN/1.0"`. |
| `GameId` | A unique id for this one game. Any opaque string. |
| `Date` | When the game started, ISO-8601 UTC, e.g. `"2026-09-04T15:58:16.695Z"`. |
| `CardPool` | Which sets were legal. **This is a comma-separated list**, e.g. `"ASH,HMW,IBH,IC27,JTL,LAW,LOF,SEC,SHD,SOR,TS26,TWI"`. A single set id like `"SOR"` is also valid. |
| `Engine` | Which build wrote the file, e.g. `"forceteki@0.1.0"` or `"forceteki@a1b2c3d"`. See §5.3. |
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

Unknown tags MUST be accepted and ignored.

### 5.3 Provenance: `Engine` and `Seed`

These two tags are what make a file traceable and replayable. **Production output MUST
carry real values in both.**

- **`Engine`** MUST name the build that produced the file — a package version, a git SHA,
  anything that identifies one build. Without it you cannot tell which build produced a bad
  replay, which is exactly the position a bug report leaves you in.
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
| `base` | The base zone (where an undeployed or defeated leader sits). |
| `outsideTheGame` | Nowhere — where tokens come from and go back to. |
| `capture` | Cards captured by an opponent. |

That is the **complete** list — it is the engine's zone set, with the two arenas written as
`ground` and `space` rather than `groundArena`/`spaceArena`. Any other string in a `from`,
`to` or `zone` field is non-conformant.

Only `ground` and `space` count as "in play". That matters a lot in
[§12](#12-folding-turning-lines-into-a-board).

### 6.3 Pointing at a base

A base is written `base@N`, where N is the seat number: `base@1`, `base@2`.

Anything that is **not** `base@N` in a `tgt` / `def` field is a card id.

### 6.4 Small vocabularies

| Field | Values seen in real files (more MAY appear) |
|---|---|
| `damageType` | `combat`, `ability` |
| `defenderType` | `unit`, `base` |
| `DEFEAT.reason` | `attack`, `ability`, `nonCombatDamage`, `frameworkEffect` |
| `STATUS_TOKEN.token` | `advantage` |
| `PHASE_START.phase` | `setup`, `action`, `regroup` |
| `ABILITY_ACTIVATE.ability` | `card-slug#subtitle_triggered_N`, `card-slug_action_N`, `name_anonymous` |

Treat all of these as **open lists**. A reader MUST NOT crash on a value it hasn't seen.

### 6.5 The CARDS index

Every id above is opaque on its own. `SEC#215` tells a human nothing, and tells a program
nothing unless it ships a card database. The `%%% CARDS` section fixes both: it maps every
id the file mentions to a display name.

One JSON object per line:

```json
{"id":"SOR#108","name":"Wampa"}
{"id":"TOKEN:advantage#5844562972","name":"Advantage"}
```

| Field | Type | Required | Means |
|---|---|---|---|
| `id` | string | Yes | A **base** id — no `:N` copy suffix, since every copy shares a name. |
| `name` | string | Yes | What to show a human. Include the subtitle: `"Greef Karga, Gracious Magistrate"`. |
| `kind` | `"unit"` or `"upgrade"` | No | What the card is. Lets a reader classify from the id alone — in particular which `TOKEN:` ids are upgrades. **Absent is meaningful: it means neither** — see below. |

**An absent `kind` means "neither a unit nor an upgrade", not "unknown".** `kind` is derived
from the card's printed type, so a writer emits it for every unit and every upgrade and omits
it exactly when the card is neither. That covers more than tokens:

| Card | `kind` | Why |
|---|---|---|
| Wampa, Battle Droid token | `"unit"` | Enters an arena. |
| Ascension Cable, Shield, Experience, Advantage | `"upgrade"` | Attaches to a unit; never enters an arena. |
| Vanquish and every other Event | *absent* | Resolves and goes to the discard pile. |
| A Credit token | *absent* | Moves `outsideTheGame` ↔ `base`; neither attaches nor takes an arena slot. |
| A base, an undeployed leader | *absent* | Neither, by printed type. |

The same rule holds wherever `kind` appears — `%%% CARDS`, `MOVE`, `CREATE_TOKEN`: an Event's
and a Credit token's records carry no `kind`, and every unit's and upgrade's records do.

A reader MUST therefore treat an absent `kind` as **not an upgrade** (it never attaches) and
equally as **not a unit** (it never joins arena membership). Do not guess from the id, and do
not read the omission as a writer that forgot the field — absent is a positive statement. A
future card that is neither also carries no `kind` and needs no format change to be handled.

Rules:

- A writer SHOULD emit an entry for **every** id that appears anywhere in the file, and
  MUST derive them from the ids actually written rather than from the decks (which miss
  tokens, and miss the opponent's revealed cards).
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

Everything else depends on `t`.

### 9.1 How `seq` is built

The pattern (from `event.schema.json`) is:

```
^R\d+\.(S|A|G)(\.[A-Za-z0-9-]+)?$|^R\d+\.(start|end)$
```

In plain words:

```
R<round>.<phase>.<step>
  │        │       └── a number, then optionally a letter: 1, 2, 2a, 2b, 2c …
  │        └────────── S = setup, A = action, G = regroup
  └─────────────────── the round number
```

And two special ones per round: `R3.start` and `R3.end`.

The numbers-and-letters rule is the useful part:

- **`R2.A.3`** — a *thing a player chose to do*. Play a card. Attack. Pass.
- **`R2.A.3a`, `R2.A.3b`, `R2.A.3c`** — everything that *happened because of it*.
  The damage. The exhaust. The ability that triggered. In order.

So `3a` through `3z` all belong to action `3`. That's how a reader groups a play with
its consequences.

`R1.A.start` / `R1.A.end` mark the edges of a phase. `GAME_END` is written with the
`.end` step of the phase it happened in (e.g. `R7.A.end`).

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
| `attachedTo` | string | no | For a token-upgrade (shield / experience / advantage), the card id of the unit it is bound to. REQUIRED whenever the moving card is a token-upgrade; absent otherwise. |
| `kind` | `"unit"` or `"upgrade"` | no | What the moving card **is**. REQUIRED whenever determinable — see below. |

**`MOVE` is the most important event in the format.** It is the *single source of truth*
for hand size, ready resources, and which cards are in play. Every other "a card went
somewhere" event (`DRAW`, `PLAY`, `DISCARD`, `RESOURCE`) is a **summary** that sits next
to the MOVEs, and MUST NOT be counted a second time.

**Rules for `from` and `to`:**

- Both are REQUIRED and MUST be **non-empty**. `""` is not a zone. A writer that can't
  determine where a card came from MUST NOT emit the event at all.
- Both MUST come from the zone vocabulary in [§6.2](#62-zone-names): `deck`, `hand`,
  `resource`, `ground`, `space`, `discard`, `base`, `outsideTheGame`, `capture`.
- `from` MUST NOT equal `to`. A move that doesn't change zone carries no information, and
  a reader gains nothing from it. Writers MUST drop these rather than emit them.

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
| `cost` | integer | no | Resources paid. |

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
| `cost` | integer | no | Resources paid. |

Event cards go straight to the discard pile — never into play.

---

**`PLAY_UPGRADE` — a player attached an upgrade to a unit.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Who played it. |
| `card` | string | yes | The upgrade's card id. |
| `target` | string | no | The unit it went onto. |
| `zone` | string | no | Fallback zone if the unit can't be found. |
| `cost` | integer | no | Resources paid. |

If `target` is given and that unit is on the board, the upgrade id is pushed onto that
unit's `upgrades` list. Otherwise the upgrade is tracked as its own card.

---

**`DEPLOY_LEADER` — a leader stepped out of the base zone into an arena.**

Fields: `p`, `card`, optional `zone` (default `"ground"`), optional `cost`.
Puts the leader in play.

---

**`CREATE_TOKEN` — a token card was made.**

| Field | Type | Required |
|---|---|---|
| `p` | 1 or 2 | yes |
| `token` | string | yes |
| `zone` | string | yes |
| `power` | integer | no |
| `hp` | integer | no |
| `kind` | `"unit"` or `"upgrade"` | no |

Puts the token in play in `zone` — unless `kind` is `"upgrade"`, in which case it attaches to
a unit and is not an arena card at all.

---

**`DAMAGE` — something took damage.**

| Field | Type | Required | Means |
|---|---|---|---|
| `src` | string | yes | What dealt it. |
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

Fields: `tgt`, `amt`, `hp`.
Base: set `baseHp` to `hp`. Card: subtract `amt` from `damage` (never below 0).

---

**`DEFEAT` — a card was destroyed.**

| Field | Type | Required |
|---|---|---|
| `card` | string | yes |
| `reason` | string | yes |
| `defeatedBy` | string | no |

Take the card out of play and push its id onto that player's discard pile.

---

**`EXHAUST` / `READY`** — field `card`. Sets `exhausted` to `true` / `false`.

---

**`DRAW` — a player drew cards.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Who drew. |
| `count` | integer | yes | How many. |
| `cards` | string[] | yes | Which ones. MAY be empty if hidden. |

Adds those ids to the known `hand` list. **It does not change `handSize`** — the
matching deck→hand `MOVE` lines already did that.

---

**`DISCARD` — a player discarded cards.**

Fields: `p`, `cards`. Adds those ids to the discard pile. **Does not change `handSize`.**

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

Shields, experience and advantage are all **token-upgrade cards**: a unit gains one when a
token is attached, and loses it when that token is defeated. Both directions MUST be
recorded.

**Gain** — the token attaches to a host:

| Token | Record |
|---|---|
| shield | `{"t":"SHIELD_GAIN","card":"<host>"}` |
| experience | `{"t":"EXPERIENCE_GAIN","card":"<host>","count":1}` |
| advantage (and any other status token) | `{"t":"STATUS_TOKEN","card":"<host>","token":"advantage","count":1}` |

**Removal** — the token leaves. This is the **same record with a negative count**:

| Token | Record |
|---|---|
| shield | `{"t":"SHIELD_USE","card":"<host>"}` |
| experience | `{"t":"EXPERIENCE_GAIN","card":"<host>","count":-1}` |
| advantage | `{"t":"STATUS_TOKEN","card":"<host>","token":"advantage","count":-1}` |

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

#### Binding a token to its host

A token-upgrade's own `MOVE` records carry **`attachedTo`**, the card id of the unit it is
bound to — on the move into play **and** the move out:

```json
{"seq":"R1.A.1f","t":"MOVE","card":"TOKEN:advantage#5844562972",
 "from":"outsideTheGame","to":"ground","p":1,"attachedTo":"SOR#095"}
{"seq":"R1.A.1g","t":"STATUS_TOKEN","card":"SOR#095","token":"advantage","count":1}
```

**A reader MUST use `attachedTo` and MUST NOT infer the host from event adjacency.** The
fact that the `STATUS_TOKEN` happens to be the next record is an accident of how the writer
emits them, not a guarantee. `attachedTo` is the normative binding.

---

**`ROUND_START`** — fields `round`, optional `keyframe`. Sets the round number.
See [§13](#13-keyframes) for what `keyframe` does.

**`PHASE_START`** — field `phase`. Sets the phase.

**`CLAIM_INITIATIVE`** — field `p`. Sets who has initiative.

### 10.2 Events that are just notes

These never change the board. A folder MUST read them and do nothing.

| `t` | Fields | Means |
|---|---|---|
| `ATTACK` | `p`, `atk`, `def`, `defenderType` | An attack was declared. For a base attack, `def` is `base@N`. |
| `PASS` | `p` | A player passed. |
| `CHOICE` | `p`, `offered` (string[]), `chose` (index), `prompt` (optional) | A player picked from a list. |
| `MODAL_CHOICE` | `p`, `offered`, `chose` | A player picked an ability mode. |
| `MULLIGAN` | `p` | A player mulliganed. |
| `KEEP_HAND` | `p` | A player kept their hand. |
| `ABILITY_ACTIVATE` | `p`, `card`, `ability` (optional) | An ability was used. |
| `SHUFFLE` | `p` | A deck was shuffled. |
| `CAPTURE` / `RESCUE` / `TAKE_CONTROL` | `p`, `card` | Captured / rescued / control taken. |
| `SEARCH` | `p`, `found` (optional), `zone` (optional) | A player searched. See the rule below. |
| `REVEAL` | `p`, `zone`, `cards` | Cards were shown. |
| `TRIGGER` | `card`, `p` (optional) | A triggered ability fired. |
| `PHASE_END` | `phase` | A phase ended. |
| `ROUND_END` | `round`, `keyframe` (optional) | A round ended. |
| `GAME_END` | `winner` (1, 2, or `"Draw"`), `reason` | The game is over. |

> `ROUND_END` is in this list because it has no delta of its own — but if it carries a
> `keyframe`, the fold still snaps to it. Same rule as `ROUND_START`.

### What a search emits

Searching a deck looks at cards and usually puts most of them back. A conformant search
emits:

1. one **`SEARCH`** record, with `found` when the searcher learns what they found;
2. a **`REVEAL`** where the opponent gets to see the cards too;
3. a **`MOVE`** for **only** the card (or cards) that actually **leave** the searched zone.

**Examining a card produces no `MOVE`.** A card that is looked at and put back has not
changed zone, so there is nothing to record — and a `deck` → `deck` record would break the
`from` ≠ `to` rule above anyway. This matters more than it sounds: two searches in one real
game once produced 28 of that file's 136 MOVE records, all of them noise.

---

## 11. The board you build (ReducedState)

This is the whole board, and it's all you ever need to build.

```typescript
interface ReducedState {
    round: number;                            // 0 before the game starts
    phase: 'setup' | 'action' | 'regroup';
    initiative: 1 | 2 | null;
    players: Partial<Record<1 | 2, PlayerState>>;
}

interface PlayerState {
    seat: 1 | 2;
    baseHp: number;             // base HP right now
    baseMaxHp: number;          // the base card's printed HP
    handSize: number;           // how many cards in hand
    hand: string[];             // which cards, if we're allowed to know
    resourcesReady: number;     // ready resources
    resourcesExhausted: number; // spent resources
    credits: number;
    hasForce: boolean;
    discard: string[];          // discard pile, in order
    cards: CardInstanceState[]; // ONLY cards in the ground/space arenas
}

interface CardInstanceState {
    id: string;            // "ASH#110" or "ASH#110:2"
    zone: string;          // "ground" or "space"
    damage: number;
    exhausted: boolean;
    upgrades: string[];    // card ids attached to this card
    shields: number;
    experience: number;
    statusTokens: Record<string, number>;
}
```

### The starting board

`emptyState()` gives you:

```
round: 0, phase: "setup", initiative: null
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
    if (e.t is ROUND_START or ROUND_END) and e.keyframe exists:
      state = deepCopy(e.keyframe)   # the keyframe is the truth
      continue                       # and skip the normal rule
    state = reduce(state, e)
  return state
```

### 12.1 The `MOVE` rule (the big one)

If `p` is missing: you can't attribute the counts to anyone. Just update the card's zone
if you already track it, and stop.

If `p` is there, do all three of these:

**1. Hand count**

- moving *into* `hand` from somewhere else → `handSize + 1`
- moving *out of* `hand` to somewhere else → `handSize - 1` (never below 0)

**2. Ready-resource count**

- moving *into* `resource` from somewhere else → `resourcesReady + 1`
- moving *out of* `resource` to somewhere else → `resourcesReady - 1` (never below 0)

**3. In-play list** (in play = `ground` or `space`)

If `kind` is `"upgrade"`, **skip this step entirely** — update the card's zone if you already
track it, and stop. Steps 1 and 2 still ran: an upgrade really does leave the hand.

- moving **into** an arena: if you already track this card id, just set its zone.
  Otherwise create a fresh card and add it to `players[p].cards`.
- moving **out of** an arena: remove it from whichever player's `cards` holds it.
- moving between two non-arena zones: just update its zone if you track it.

Adding is *idempotent by id*, so a `PLAY` followed by its `MOVE` never adds the card
twice.

### 12.2 Every other rule, in one table

| `t` | What you do |
|---|---|
| `ROUND_START` | `round = event.round` |
| `PHASE_START` | `phase = event.phase` |
| `CLAIM_INITIATIVE` | `initiative = event.p` |
| `PLAY`, `PLAY_SMUGGLE` | place `card` in `zone ?? "ground"` — **idempotent by id**: if already tracked, just set its zone. The paired `MOVE` reports the same arrival, and pushing on both duplicates every unit in play |
| `PLAY_EVENT` | push `card` onto `players[p].discard` |
| `PLAY_UPGRADE` | if `target` is set and that card is on the board → push `card` onto its `upgrades`; otherwise **nothing**. An upgrade is never an arena card, so there is no fallback placement |
| `DEPLOY_LEADER` | place `card` in `zone ?? "ground"`, idempotent by id |
| `CREATE_TOKEN` | place `token` in `zone`, idempotent by id — unless `kind` is `"upgrade"`, then nothing |
| `MOVE` | see [§12.1](#121-the-move-rule-the-big-one) |
| `DAMAGE` | `base@N` → `players[N].baseHp = hp`; else `card.damage = max(0, damage + amt)` |
| `OVERWHELM` | `base@N` → `players[N].baseHp = hp`; anything else → nothing |
| `HEAL` | `base@N` → `players[N].baseHp = hp`; else `card.damage = max(0, damage - amt)` |
| `DEFEAT` | find the card, remove it from `cards`, push its id onto that player's `discard` |
| `EXHAUST` | `card.exhausted = true` |
| `READY` | `card.exhausted = false` |
| `DRAW` | push each id in `cards` onto `players[p].hand`. **Nothing else.** |
| `DISCARD` | push each id in `cards` onto `players[p].discard`. **Nothing else.** |
| `RESOURCE` | **nothing** — the paired `MOVE` into `resource` carries the change ([§10.1](#101-events-that-carry-board-detail)) |
| `SHIELD_GAIN` | `card.shields += count ?? 1` |
| `SHIELD_USE` | `card.shields = max(0, shields - (count ?? 1))` |
| `EXPERIENCE_GAIN` | `card.experience = max(0, experience + count)` — `count` may be negative |
| `STATUS_TOKEN` | `n = max(0, (statusTokens[token] ?? 0) + count)`; if `n` is 0 **delete** `statusTokens[token]`, else set it to `n`. `count` may be negative — deleting the key at zero is required, see [the token contract](#the-token-gainremoval-contract) |
| anything in [§10.2](#102-events-that-are-just-notes) | nothing |
| an event type you don't know | nothing (and warn) |

Three small helpers:

- `newCard(id, zone)` → `{ id, zone, damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {} }`
- `findCard(state, id)` → look through player 1's `cards`, then player 2's. **If it isn't
  there, silently do nothing.** Never crash.
- `seatOfBaseRef(ref)` → the N out of `base@N`, or `null` if it isn't a base.

### 12.3 Rewinding to a moment

`stateAt(events, seq)` = fold everything up to and including the event with that `seq`.
If no event has that `seq`, it folds the whole list.

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
- A keyframe's `cards` list contains **only** ground and space arena cards. Hand,
  resources and discard are described by their counts and lists, not by `cards`.
- Emit a keyframe on `ROUND_END` as well as `ROUND_START` when you can. It halves the
  window between checkpoints, so a round's worth of fold drift is caught a round earlier,
  and costs one snapshot.

**Readers, on meeting a keyframe that is missing a seat:** do NOT snap to it — snapping
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
- `handSize`
- `resourcesReady`
- for each in-play card matched by `id`: `zone`, `damage`, `exhausted`, `shields`,
  `experience`, `statusTokens`
- a card being in one side but not the other (reported both ways)

Everything except `baseHp` is compared at **every** keyframe, the first one included.

**Not checked yet, and why:**

| Field | Why not |
|---|---|
| `credits` | No event carries credit changes yet. |
| `hasForce` | No event carries the Force yet. |
| `resourcesExhausted` | Nothing tracks resource exhaustion yet. |
| `hand` / `discard` **contents** | Only the counts are reconstructable today. |
| `upgrades` | Upgrade nesting isn't modelled in the fold. |

Closing these is future work. Until then, do not assume a passing check proves those
fields.

A mismatch looks like:

```json
{ "seq": "R7.start", "path": "players.1.handSize", "expected": 3, "got": 2 }
```

`expected` is the keyframe (the engine's truth). `got` is what folding produced.

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

No other fields are allowed.

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
  Wampas read as `Wampa` and `Wampa #2`. A `base@N` ref renders as `Player N's base`.
- `who(p)` — `"Player 1"` for seat 1, `"Player 2"` for seat 2, `""` otherwise.

When no card index is supplied, the renderer uses the document's own — a file with a
`%%% CARDS` section renders with real names and **no external card database**.

### Numbering and indentation

Some events are **things a player chose to do**. Those get a number. Everything else is a
**consequence** of the numbered action above it, and is printed indented beneath it.

The numbered ones are exactly:

`PLAY`, `PLAY_EVENT`, `PLAY_UPGRADE`, `PLAY_SMUGGLE`, `DEPLOY_LEADER`, `ATTACK`,
`PASS`, `CLAIM_INITIATIVE`

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
width. Then, from that round's keyframe, one block per seat:

```
══════════════════════════════════════════════════════════════════════════════
 ROUND 7                                                 initiative: Player 2
 P1  base 16/33   hand 3   resources 7
      ground: Kelleran Beq, The Sabered Hand
      space: Bravo Squadron Fighter  ·  Emissary's Sheathipede #2 [1 dmg]
 P2  base 22/28   hand 2   resources 5
      ground: Darth Maul, Sith Revealed [exhausted]
══════════════════════════════════════════════════════════════════════════════
```

- One line per seat: `base {hp}/{max}   hand {n}   resources {n}`.
- Then a line per non-empty arena, cards joined by `  ·  `.
- A card's non-default state goes in `[...]`, comma-separated, in this order: damage
  (`3 dmg`), `exhausted`, shields (`2 shield`), experience (`1 xp`), each status token
  (`1 advantage`), then each attached upgrade by name.
- A seat with no keyframe entry prints ` P{n}  (not recorded)` — see
  [§13](#13-keyframes); this should never happen in a conformant file.
- No keyframe on the `ROUND_START` → no summary, just the banner.

This costs nothing to record: it is the keyframe the file already carries, laid out to be
read.

### The exact wording

| `t` | Line |
|---|---|
| `PLAY`, `PLAY_UPGRADE`, `PLAY_SMUGGLE` | `{who(p)} plays {nm(card)}` + ` to {zone}` if `zone` + ` ({cost} resources)` if `cost` |
| `PLAY_EVENT` | `{who(p)} plays {nm(card)}` + ` ({cost} resources)` if `cost` — no zone |
| `DEPLOY_LEADER` | `{who(p)} deploys {nm(card)}` |
| `ATTACK` | base: `{who(p)} attacks {who(other)}'s base with {nm(atk)}` · unit: `{who(p)} attacks {nm(def)} with {nm(atk)}` |
| `PASS` | `{who(p)} passes` |
| `CLAIM_INITIATIVE` | `{who(p)} claims initiative` |
| `DAMAGE` | `{amt} damage to {nm(tgt)} — {hp} HP left` |
| `OVERWHELM` | `{amt} Overwhelm damage to {who(other)}'s base — {hp} HP left` |
| `HEAL` | `{amt} healed on {nm(tgt)} — {hp} HP left` |
| `DEFEAT` | `{nm(card)} is defeated` + ` by {nm(defeatedBy)}` if present |
| `ABILITY_ACTIVATE` | `{nm(card)} uses an ability` |
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
| `CAPTURE` / `RESCUE` / `TAKE_CONTROL` | `{who(p)} captures\|rescues\|takes control of {nm(card)}` |
| `MULLIGAN` | `{who(p)} mulligans` |
| `KEEP_HAND` | `{who(p)} keeps their hand` |
| `GAME_END` | `*** {who(winner)} wins — {reason} ***` · draw: `*** Game ends in a draw — {reason} ***` |

**These print nothing**: `MOVE`, `EXHAUST`, `READY`, `CHOICE`, `MODAL_CHOICE`, `SHUFFLE`,
`PHASE_END`, `ROUND_END`.

They are mechanism, not story. `MOVE` is the fold's source of truth and appears beside every
play, draw and discard — printing it would roughly triple the narrative for no reader
benefit. `EXHAUST`/`READY` fire on every attack and every regroup; the board summary already
shows what is exhausted at each round boundary, which is where a reader actually wants it.

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

- `P1Id` / `P2Id` MUST be `sha256:<hex>` — the real id plus a **secret server salt**,
  hashed. The salt MUST stay on the server and MUST NOT be in the file.
- `P1` / `P2` MUST be generic labels like `"Player 1"`.
- `by` in an annotation MUST be a fake name.
- Spectator ids MUST NOT appear anywhere.

The salted hash is:

- **stable** — the same player always hashes the same, so you can spot them across games;
- **not reversible** — you can't get the name back without the salt;
- **not global** — a different server (different salt) gives a different hash for the
  same person.

A writer MUST run a PII scan over every string in the file before saving. If the scan
finds anything, the file MUST NOT be written.

When `Perspective` is `P1` or `P2`, the other player's hidden cards SHOULD be missing or
blanked. Files that see everything MUST only be produced by a trusted server.

---

## 18. Versions and unknown things

The version lives in the `Game` tag: `"SWU-PGN/MAJOR.MINOR"`.

- **MAJOR** goes up when old readers would break. Readers MUST refuse a different major
  version.
- **MINOR** goes up for additions that don't break anything — a new optional tag, a new
  optional field, a new event type. Readers MUST accept a **higher** minor version.

> **One exception, and it is a real one.** Pre-release files exist that declare
> `SWU-PGN/1.1` and are **older** than 1.0 — the number was corrected downward at
> publication. Version numbers therefore do NOT order this format: a reader MUST match the
> version string **exactly** rather than comparing it numerically.
> See [§22.1](#221-files-that-say-swu-pgn11).

To make that work, a reader:

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

| Vector | Covers |
|---|---|
| `minimal` | One round: `PLAY`, `ATTACK`, `DAMAGE`, `EXHAUST`. |

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

What remains genuinely unverified is the un-gated field list in
[§14](#14-checking-a-file-is-honest): `credits`, `hasForce`, `resourcesExhausted`, the
**contents** of `hand` and `discard`, and `upgrades`. A passing integrity check says nothing
about those.

`baseHp`/`baseMaxHp` are still absent from the SETUP `INIT` record. A reader that ships card
data can derive a base's starting HP itself, and the first keyframe supplies it either way,
so this is low priority — but emitting it would give the keyframe gate an independent value
to check the first keyframe against, which is the one place it currently can't
([§14](#14-checking-a-file-is-honest)).

Closing those needs new events (there is no event for credits or the Force today) and a fold
rule for upgrade nesting.

Some defined event types still never appear in a real file, simply because nothing in a
given game triggers them (`CAPTURE`, `RESCUE`, `TAKE_CONTROL`, `OVERWHELM`, `MULLIGAN` and
friends). That is absence of the situation, not a gap — unlike `RESOURCE`, which was
specified, folded and rendered but had no code path that emitted it at all; it is now
emitted for every resourcing ([§10.1](#101-events-that-carry-board-detail)).

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

### 22.1 Files that say `SWU-PGN/1.1`

**These are older than 1.0, not newer.** During development the format was numbered 1.1;
the number was corrected to 1.0 at publication, but files written in that window exist in
the wild and declare `[Game "SWU-PGN/1.1"]`.

So **version numbers do not order this format**. A reader MUST NOT use "greater than" to
decide compatibility — match the version string exactly:

| `Game` tag | What to do |
|---|---|
| `SWU-PGN/1.0` | This document. |
| `SWU-PGN/1.1` | A pre-release file. Parse it as 1.0, with the allowances below. |
| another `SWU-PGN/1.x` | Same major version: accept it, ignore what you don't know ([§18](#18-versions-and-unknown-things)). |
| a different major version | Reject. |

A 1.1 file is structurally a 1.0 file — the grammar, the sections and the event types all
parse. It differs in what its **writer** did, and every difference is detectable from the
file itself:

| In a 1.1 file | What a reader should do |
|---|---|
| Tokens are `TOKEN:<Title>` / `TOKEN:<Title>:<copy>`, with no `#<numericId>` | Treat as an opaque identity; no art lookup. Detect: a `TOKEN:` id containing no `#`. |
| No `%%% CARDS` | Fall back to your own card database, or show raw ids. |
| No `%%% STORY` | Render it yourself ([§16](#16-turning-a-file-into-a-story)). |
| No `attachedTo` on a token's `MOVE` | The host is not stated. Do not guess it from event adjacency — leave the binding unknown. |
| No `kind` on `MOVE` / `CREATE_TOKEN` | You cannot tell a token upgrade from a token unit. See below. |
| No `RESOURCE` records | Recover resourcing from `MOVE` into the `resource` zone. |
| Token gains with no matching removal | Tokens never come off. Clamp at zero and expect `statusTokens` to disagree with keyframes. |
| `MOVE` with `from: ""`, or `from === to` | Skip the record; it carries no information. |
| Keyframes missing a seat, or `"players":{}` | **Ignore that keyframe** and keep folding ([§13](#13-keyframes)). |
| Duplicated arena cards when folding between keyframes | The 1.1 fold pushed a card for both the `MOVE` and the `PLAY`. Make placement idempotent by id ([§12.1](#121-the-move-rule-the-big-one)). |
| `Engine "forceteki@unknown"` / `Seed "unseeded"` | Untraceable / not deterministically replayable ([§5.3](#53-provenance-engine-and-seed)). |

**On the missing `kind`.** Without it a reader genuinely cannot tell which `TOKEN:` ids are
upgrades — Shield, Experience, Advantage, Weakness, which must never enter an arena — from
which are units — Battle Droid, X-Wing, TIE Fighter, Clone Trooper, Mandalorian, Spy, Beast,
which must. Both shapes are `TOKEN:<name>#<id>`. Hardcoding the upgrade names works until a
new token upgrade is printed, which is a latent bug rather than a fix. For a 1.1 file the
honest fallback is: treat a token as an upgrade when its `MOVE` carries `attachedTo`,
otherwise as a unit, and let the keyframe win when the two disagree. In 1.0, `kind` removes
the guess.

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
[Seed "0"] [Perspective "P1"]
[P1Id "sha256:aaaa"] [P2Id "sha256:bbbb"] [P1 "Player 1"] [P2 "Player 2"]
[P1Leader "SOR#010"] [P1Base "SOR#028"] [P2Leader "SOR#005"] [P2Base "SOR#020"]
[Result "Incomplete"] [Reason "Sample"] [Rounds "1"]

%%% STORY

══════════════════════════════════════════════════════════════════════════════
 ROUND 1                                                 initiative: Player 1 
 P1  base 30/30   hand 1   resources 2
 P2  base 30/30   hand 1   resources 2
══════════════════════════════════════════════════════════════════════════════

 ── action ──
  1. Player 1 plays Wampa to ground (2 resources)
  2. Player 1 attacks Player 2's base with Wampa
       ↳ 2 damage to Player 2's base — 28 HP left

%%% DECKS
{"p":1,"leader":"SOR#010","base":"SOR#028","deck":[["SOR#108",3]]}
{"p":2,"leader":"SOR#005","base":"SOR#020","deck":[["SOR#045",3]]}

%%% CARDS
{"id":"SOR#005","name":"Darth Vader, Dark Lord of the Sith"}
{"id":"SOR#010","name":"Luke Skywalker, Faithful Friend"}
{"id":"SOR#020","name":"Command Center"}
{"id":"SOR#028","name":"Echo Base"}
{"id":"SOR#045","name":"Cell Block Guard"}
{"id":"SOR#108","name":"Wampa"}

%%% SETUP
{"seq":"R1.S.0","t":"INIT","p1DeckOrder":["SOR#108"],"p2DeckOrder":["SOR#045"]}

%%% EVENTS
{"seq":"R1.start","t":"ROUND_START","round":1,"keyframe":{"round":1,"phase":"action","initiative":1,"players":{"1":{"seat":1,"baseHp":30,"baseMaxHp":30,"handSize":1,"hand":["SOR#108"],"resourcesReady":2,"resourcesExhausted":0,"credits":0,"hasForce":false,"discard":[],"cards":[]},"2":{"seat":2,"baseHp":30,"baseMaxHp":30,"handSize":1,"hand":["SOR#045"],"resourcesReady":2,"resourcesExhausted":0,"credits":0,"hasForce":false,"discard":[],"cards":[]}}}}
{"seq":"R1.A.start","t":"PHASE_START","phase":"action"}
{"seq":"R1.A.1","t":"PLAY","p":1,"card":"SOR#108","zone":"ground","cost":2}
{"seq":"R1.A.2","t":"ATTACK","p":1,"atk":"SOR#108","def":"base@2","defenderType":"base"}
{"seq":"R1.A.2a","t":"DAMAGE","src":"SOR#108","tgt":"base@2","amt":2,"damageType":"combat","hp":28}
{"seq":"R1.A.2b","t":"EXHAUST","card":"SOR#108"}

%%% ANNOTATIONS
{"ref":"R1.A.2","nag":"?!","text":"attacking the base too early"}
```

> This vector writes `"def":"base"`. Real engine files write `"def":"base@2"`. Both parse;
> prefer `base@N` in new files.

### A.2 The board it folds to

```json
{
  "round": 1,
  "phase": "action",
  "initiative": 1,
  "players": {
    "1": {
      "seat": 1,
      "baseHp": 30,
      "baseMaxHp": 30,
      "handSize": 1,
      "hand": [
        "SOR#108"
      ],
      "resourcesReady": 2,
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
          "statusTokens": {}
        }
      ]
    },
    "2": {
      "seat": 2,
      "baseHp": 28,
      "baseMaxHp": 30,
      "handSize": 1,
      "hand": [
        "SOR#045"
      ],
      "resourcesReady": 2,
      "resourcesExhausted": 0,
      "credits": 0,
      "hasForce": false,
      "discard": [],
      "cards": []
    }
  }
}
```

### A.3 The story it renders to

```

══════════════════════════════════════════════════════════════════════════════
 ROUND 1                                                 initiative: Player 1 
 P1  base 30/30   hand 1   resources 2
 P2  base 30/30   hand 1   resources 2
══════════════════════════════════════════════════════════════════════════════

 ── action ──
  1. Player 1 plays Wampa to ground (2 resources)
  2. Player 1 attacks Player 2's base with Wampa
       ↳ 2 damage to Player 2's base — 28 HP left
```

### A.4 Step by step

**Header** — every `[Tag "Value"]` pair is pulled out, including the three on one line.

**STORY** — plain text, kept verbatim. It is what §16 produces from the sections below, so a
reader can check it rather than trust it.

**DECKS** — two lines, one per player. Player 1 runs 3 copies of `SOR#108`.

**CARDS** — six entries. This is why the story says `Wampa` and not `SOR#108`, with no card
database involved.

**SETUP** — `INIT` says `SOR#108` is on top of Player 1's deck.

**EVENTS, folding:**

| Event | What happens to the board |
|---|---|
| `ROUND_START {round:1, keyframe}` | the keyframe is authoritative: the whole state is **replaced** by it, and the normal `round = 1` rule is skipped |
| `PHASE_START {phase:"action"}` | `phase = "action"` |
| `PLAY {p:1, card:"SOR#108", zone:"ground"}` | a fresh `SOR#108` is added to player 1's `cards` |
| `ATTACK` | nothing (it's just a note) |
| `DAMAGE {tgt:"base@2", hp:28}` | `players[2].baseHp = 28` |
| `EXHAUST {card:"SOR#108"}` | that card's `exhausted = true` |

**ANNOTATIONS** — one note on `R1.A.2`, glyph `?!` ("dubious"), with a comment.

**EVENTS, rendering:**

| Event | What gets printed |
|---|---|
| `ROUND_START` | blank, rule, ` ROUND 1` + initiative, the board from its keyframe, rule, blank · counter → 0 |
| `PHASE_START` | ` ── action ──` · counter → 0 |
| `PLAY` | numbered: `  1. Player 1 plays Wampa to ground (2 resources)` |
| `ATTACK` | numbered: `  2. Player 1 attacks Player 2's base with Wampa` |
| `DAMAGE` | indented under action 2: `       ↳ 2 damage to Player 2's base — 28 HP left` |
| `EXHAUST` | nothing — mechanism, not story; the board summary shows what is exhausted |
