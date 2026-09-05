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
- MUST NOT emit a `MOVE` with an empty `from`/`to`, or with `from` equal to `to`
  ([§10.1](#101-events-that-carry-board-detail)).
- MUST put real values in `Engine` and `Seed` in production output
  ([§5.3](#53-provenance-engine-and-seed)).
- SHOULD emit `%%% CARDS` covering every id the file mentions, and `%%% STORY` matching
  what the renderer produces ([§6.5](#65-the-cards-index), [§16](#16-turning-a-file-into-a-story)).
- MUST NOT put real usernames or any real identifying info in the file.
- MUST record a control change as a `TAKE_CONTROL` carrying `zone` (and `from` when no
  `MOVE` carried the counts), and a leader deployed as a pilot as a `DEPLOY_LEADER` carrying
  `kind: "upgrade"` + `target` — neither is a zone move, so nothing else tells a reader
  ([§10.1](#101-events-that-carry-board-detail)).
- MUST write `RecorderErrors` in the header if any of its handlers failed
  ([§5.2](#52-you-may-have-these)); a silently under-recorded file must not look complete.
- MUST record the resource row as counts: an `EXHAUST_RESOURCES` for every resource that
  becomes exhausted (a cost paid, an ability, a card resourced exhausted), a `READY_RESOURCES`
  for every one that readies, and `exhausted: true` on a `MOVE` out of `resource` when the
  card left exhausted ([§10.1](#101-events-that-carry-board-detail)).
- MUST name the host with `attachedTo` on the `MOVE` that attaches a card, and MUST NOT name
  one on any `MOVE` out of an arena — exits are host-less
  ([§10.1](#binding-an-attachment-to-its-host)).
- MUST record a capture as a `CAPTURE` whose `p` is the seat that now holds the card and whose
  `by` is the captor ([§10.1](#101-events-that-carry-board-detail)).
- MUST write an `EXHAUST` for a unit that enters play exhausted — the normal case, which no
  attack or ability announces — and nothing for one that enters ready
  ([§10.1](#101-events-that-carry-board-detail)).
- MUST write a `STATS` record whenever an in-play unit's live power, HP or keywords change,
  with the values the engine computed — a reader has no rules engine to derive them
  ([§10.1](#stats)).
- MUST mark a `DEPLOY_LEADER` or `ABILITY_ACTIVATE` that spends an Epic Action with `epic: true`,
  and MUST carry the leader's status, the deck count and the initiative counter's status in
  every keyframe ([§11](#11-the-board-you-build-reducedstate)).

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
NOT try to JSON-parse them, and MUST keep them verbatim — blank lines included, since they
are part of the layout. Read everything after the `%%% STORY` banner as text until the next
banner.

### When to throw an error

| What went wrong | Error message |
|---|---|
| A required header tag is missing | `SWU-PGN: missing required header tag [TagName]` |
| A line isn't valid JSON | `SWU-PGN: invalid JSON on line N` |
| A JSON line sits under a banner that isn't one of the five NDJSON sections | `SWU-PGN: JSON record in unrecognized section on line N` |
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
| `RecorderErrors` | How many of the writer's event handlers failed while recording, as digits, e.g. `"2"`. **Absent means none.** Present means some events were never written: the keyframes are still exact (they are read from the engine, not folded), but the deltas between them are incomplete, so `checkKeyframes()` will report mismatches and `stateAt()` between keyframes may be wrong. A reader SHOULD surface it. |

Unknown tags MUST be accepted and ignored.

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

Anything that is **not** `base@N` in a `tgt` / `def` / `CHOICE.offered` field is a card id.
A base is `base@N` **everywhere** it is pointed at, including when a target prompt offered it —
never its `SET#NUM` card id. (The header's `P1Base`/`P2Base` and the `%%% CARDS` index name
the base *card*; a `base@N` ref names the *thing being hit*.)

### 6.4 Small vocabularies

| Field | Values seen in real files (more MAY appear) |
|---|---|
| `damageType` | `combat`, `ability`, `excess`. Overwhelm onto a base is written as its own `OVERWHELM` record, never as a `DAMAGE` with `damageType: "overwhelm"`. |
| `defenderType` | `unit`, `base` |
| `DEFEAT.reason` | `attack`, `ability`, `nonCombatDamage`, `frameworkEffect`, `uniqueRule` |
| `CHOICE.prompt` | The prompt's title as the engine built it. For an attack-target choice this is the attacking card's name. |
| `STATUS_TOKEN.token` | `advantage`, `weakness` — the internal name of any token upgrade that is not a Shield or an Experience, so a token upgrade printed tomorrow needs no format change |
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
| A Credit token, the Force token | *absent* | Move `outsideTheGame` ↔ `base`; neither attaches nor takes an arena slot. They drive `credits` / `hasForce` instead ([§6.1](#two-reserved-token-names)). |
| A base, an undeployed leader | *absent* | Neither, by printed type. |

The same rule holds wherever `kind` appears — `%%% CARDS`, `MOVE`, `CREATE_TOKEN`: an Event's
and a Credit token's records carry no `kind`, and every unit's and upgrade's records do, with
one exception: a leader's **undeploy** `MOVE` (`ground` → `base`) is emitted after the engine
has already stopped counting the card as a unit, so it carries no `kind`. Leaving an arena
needs none.

Note that this index reports what a card **is** (its printed type), while the same field on an
event reports what that **event did**. They disagree for pilots, deliberately — see
[§10.1](#kind-on-an-event-is-a-role-kind-in--cards-is-an-identity).

In `%%% CARDS`, a reader MUST therefore treat an absent `kind` as **not an upgrade** (it never
attaches) and equally as **not a unit** (it never joins arena membership). Do not guess from
the id, and do not read the omission as a writer that forgot the field — absent is a positive
statement. A future card that is neither also carries no `kind` and needs no format change to
be handled.

On an **event** the fold never consults identity: a `MOVE` or `CREATE_TOKEN` whose `kind` is
absent is folded as a unit move ([§12.1](#121-the-move-rule-the-big-one) step 3), because
only `"upgrade"` switches that step off. That is deliberate — every pre-release 1.1 file
consists of kind-less `MOVE`s ([§22.1](#221-files-that-say-swu-pgn11)), and they fold.

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
throwing inside a reader.

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

So "everything action `N` did" is the `Na…` records *after* it, **plus** any trailing
`MOVE` / `CHOICE` / `EXHAUST` immediately *before* it that name the same card. The writer does
not re-number them: when they arrive it cannot know that an action is about to follow, and
guessing would mis-file a previous action's genuine consequences.

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
| `attachedTo` | string | no | The card id of the unit this move attaches the card to. REQUIRED on the move **into an arena** that attaches a card — a token-upgrade, a printed upgrade, or a pilot — and ABSENT on every other move, a move **out of** an arena included: exits are host-less, and a reader detaches on the zone transition ([the binding rule](#binding-an-attachment-to-its-host)). |
| `exhausted` | boolean | no | On a move **out of `resource`** only: `true` when the card left the row exhausted, so the fold takes it from `resourcesExhausted` rather than `resourcesReady`. Absent means it left ready. A card played from the resource row pays for itself first, and a resource a friendly effect returns is swapped exhausted on the way out, so this is common. |
| `kind` | `"unit"` or `"upgrade"` | no | The **role this move enacts**, not what the card is. REQUIRED whenever determinable — see below. |

**`MOVE` is the most important event in the format.** It is the *single source of truth*
for hand size, the resource row, credits, the Force, which cards are in play and which cards
are attached to which. Every other "a card went somewhere" event (`DRAW`, `PLAY`, `DISCARD`,
`RESOURCE`) is a **summary** that sits next to the MOVEs, and MUST NOT be counted a second
time.

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
// Drawn into hand: this move attaches nothing, so the card's own type stands.
{"seq":"R1.A.0ce","t":"MOVE","card":"JTL#058","from":"outsideTheGame","to":"hand","p":1,"kind":"unit"}

// Flown onto the X-Wing: this move attaches, so it is an upgrade move.
{"seq":"R1.A.0cn","t":"MOVE","card":"JTL#058","from":"hand","to":"space","p":1,
 "kind":"upgrade","attachedTo":"LAW#253"}
{"seq":"R1.A.1","t":"PLAY_UPGRADE","p":1,"card":"JTL#058","zone":"space","target":"LAW#253","cost":5}
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

**`PLAY_UPGRADE` — a player attached an upgrade to a unit.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Who played it. |
| `card` | string | yes | The upgrade's card id. |
| `target` | string | no | The unit it went onto. |
| `zone` | string | no | Where the card went, recorded for completeness. It is **not** a fallback placement. |
| `cost` | integer | no | The card's **printed** cost. Not the resources actually paid: aspect penalties, discounts and Exploit are settled inside the engine's cost payment and never reach the play event. What was paid is the `EXHAUST_RESOURCES` written beside this record ([below](#101-events-that-carry-board-detail)). |

If `target` is given and that unit is on the board, the upgrade id is pushed onto that
unit's `upgrades` list — **idempotently**, because the attaching `MOVE` beside this record
already did the same through `attachedTo` ([§12.1](#121-the-move-rule-the-big-one)). Otherwise
the event changes **nothing**: an upgrade is never an arena card, so there is no fallback
placement ([§12.2](#122-every-other-rule-in-one-table)).

---

**`DEPLOY_LEADER` — a leader stepped out of the base zone into an arena.**

Fields: `p`, `card`, optional `zone` (default `"ground"`), optional `cost`, optional `epic`,
and, together, optional `kind` + `target`.
Puts the leader in play — unless it deployed **as a pilot**: then `kind` is `"upgrade"`,
`target` is the vehicle it flew onto, and the leader is pushed onto that unit's `upgrades`
exactly as `PLAY_UPGRADE` does. It is never an arena card of its own.

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

Fields: `p`, `card`, optional `ability` (the engine's identifier), optional `epic`.
Changes nothing — except that `epic: true` marks the leader's Epic Action as used when `card`
is the leader. Everything an ability *did* is recorded by the records that follow it.

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
  (never below 0 on the losing side).
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
| `by` | string | no | The captor: a unit id, or `base@N` for the rare base captor. |

The captured card's own `MOVE` (arena → `capture`) was written just before this and already
took it off the board. This record files it under its captor: push `card` onto `by`'s
`captured` list, idempotently, when `by` names a card you track. A base captor holds it
nowhere in the fold — the card is out of play either way, and nothing today captures with a
base.

**`RESCUE` — `card` returned to play under `p`, its owner.**

Fields: `p`, `card`. Take `card` off every card's `captured` list. The `MOVE` out of `capture`
beside it places the card again, and the fold does not depend on which of the two arrives
first. A captor leaving play rescues everything it held: each captive gets its own `RESCUE`
and `MOVE`, and the captor's entry disappears with its list.

---

**`EXHAUST_RESOURCES` / `READY_RESOURCES` — `amount` of `p`'s resources changed ready state.**

| Field | Type | Required | Means |
|---|---|---|---|
| `p` | 1 or 2 | yes | Whose row. |
| `amount` | integer | yes | How many. |

Resources are **counted, never named**: a reader never knows which card in the row is which,
so the row is two numbers, `resourcesReady` and `resourcesExhausted`, and these two records
move them. `EXHAUST_RESOURCES` moves `min(amount, resourcesReady)` from ready to exhausted;
`READY_RESOURCES` moves `min(amount, resourcesExhausted)` back. The clamp is the engine's own
behaviour, not leniency: it exhausts as many as it can find.

A writer emits `EXHAUST_RESOURCES` for **every** way a resource becomes exhausted — a cost
paid (the `amount` is what was actually paid, after aspect penalties, discounts and Exploit;
`cost` on the play record stays the printed cost), an ability exhausting resources, a single
resource card exhausted by name, and a card an ability puts into the row exhausted (its `MOVE`
into `resource` counted it ready, so it is one more exhaustion). It emits `READY_RESOURCES` the
same way: the regroup step readies the exhausted resources one record at a time (a reader
MUST tolerate a record for a resource that was already ready — it finds nothing to move), and
an ability that readies several says how many.

A card that **leaves** the row is counted by its `MOVE`, in the bucket the move's `exhausted`
flag names ([`MOVE`](#101-events-that-carry-board-detail)).

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

Take the card out of play and push its id onto that player's discard pile — and take it off
every card's `upgrades` and `captured` lists, because a defeated card is nobody's attachment
and nobody's captive. An upgrade was never an arena card, so for one only the detach applies.

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

`keywords` covers what CR 1.16 calls a card's attributes as far as the text box goes: the
keyword abilities in effect (printed, granted by an upgrade, or given for a phase). Full
ability text is not recorded — it is card data, and the `%%% CARDS` index names the card.

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
| advantage, weakness, any other token upgrade | `{"t":"STATUS_TOKEN","card":"<host>","token":"advantage","count":1}` — `token` is the token's name |

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

#### Binding an attachment to its host

Every card that attaches — a token upgrade, a printed upgrade, a pilot — is bound to its host
by **`attachedTo`** on the `MOVE` that carries it **into the arena**:

```json
{"seq":"R1.A.1f","t":"MOVE","card":"TOKEN:advantage#5844562972",
 "from":"outsideTheGame","to":"ground","p":1,"kind":"upgrade","attachedTo":"SOR#095"}
{"seq":"R1.A.1g","t":"STATUS_TOKEN","card":"SOR#095","token":"advantage","count":1}

{"seq":"R2.A.0b","t":"MOVE","card":"LOF#215","from":"hand","to":"ground","p":1,
 "kind":"upgrade","attachedTo":"SOR#095"}
{"seq":"R2.A.1","t":"PLAY_UPGRADE","p":1,"card":"LOF#215","zone":"ground","target":"SOR#095","cost":2}
```

**A reader MUST use `attachedTo` and MUST NOT infer the host from event adjacency.** The
fact that the `STATUS_TOKEN` happens to be the next record is an accident of how the writer
emits them, not a guarantee. `attachedTo` is the normative binding, and the fold applies it
([§12.1](#121-the-move-rule-the-big-one) step 3): a printed card goes onto the host's
`upgrades`; a token upgrade goes into the host's counters through its own gain record.

**Exits are host-less.** The move back out — the token defeated, the upgrade destroyed, the
pilot's vehicle Vanquished — carries no `attachedTo`, and its `kind` is whatever the card is at
that moment (a pilot leaves as `kind: "unit"`). A reader MUST NOT wait for a host to be named
on the way out: **a card leaving an arena, or being defeated, comes off every host** — keyed
on the zone transition, not on `kind` ([§12.1](#121-the-move-rule-the-big-one) step 0). One
shape for every exit, and nothing for a writer to remember.

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
| `SHUFFLE` | `p` | A deck was shuffled. |
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

1. one **`SEARCH`** record. `found` is optional, and the reference writer omits it: the
   engine announces the search before the player has chosen, and what left the deck is
   stated by the `MOVE` in step 3;
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
    initiative: 1 | 2 | null;                 // who holds the initiative counter
    initiativeTaken?: boolean;                // it was taken this round (back to false each round)
    players: Partial<Record<1 | 2, PlayerState>>;
}

interface PlayerState {
    seat: 1 | 2;
    baseHp: number;             // base HP right now
    baseMaxHp: number;          // the base card's printed HP
    handSize: number;           // how many cards in hand
    hand: string[];             // which cards, if we're allowed to know
    deckSize?: number;          // cards left in the deck
    resourcesReady: number;     // ready resources
    resourcesExhausted: number; // spent resources
    credits: number;
    hasForce: boolean;
    discard: string[];          // discard pile, in order
    cards: CardInstanceState[]; // ONLY cards in the ground/space arenas
    leader?: LeaderState;       // the leader card's status, wherever it is
}

interface LeaderState {
    id: string;                 // the leader card
    deployed: boolean;          // Leader Unit side in play (as a unit, or as a pilot upgrade)
    exhausted: boolean;         // its ready/exhausted flag
    epicActionUsed: boolean;    // its Epic Action is spent for the game
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
`keywords` — are optional only because files written before they existed lack them. A
current writer fills every one, and the integrity check compares each whenever the keyframe
carries it.

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
| Each card's **zone** | `MOVE` (every zone change, [§12.1](#121-the-move-rule-the-big-one)); `deckSize`, `handSize`, `hand`, `discard`, the resource counts, `cards`, `captured`, `credits`, `hasForce`; the leader's `deployed` |
| Each card's **controller** | the seat whose lists hold it; `TAKE_CONTROL` re-seats a unit, a resource, a Credit token or the Force; an upgrade's controller is the `p` of its `PLAY_UPGRADE` |
| Each card's **attributes** — power, HP, keywords, modifiers | `STATS` after every change ([§10.1](#stats)), snapshotted in keyframes; `damage`, `upgrades`, `shields`, `experience`, `statusTokens` |
| Each card's **status** — ready/exhausted | `EXHAUST` / `READY` for arena cards and the leader, including the `EXHAUST` a unit gets on entering play; `EXHAUST_RESOURCES` / `READY_RESOURCES` and the `MOVE.exhausted` flag for the resource row |
| Each card's **status** — faceup/facedown | the leader's `deployed` (Leader Unit side up); resources are always facedown, and `RESOURCE` names the card for the omniscient reader |
| The **initiative counter**: controller and taken/available | `initiative` and `initiativeTaken`; `CLAIM_INITIATIVE`, reset at `ROUND_START` |
| **Open and hidden information** | the archive is omniscient ([§17](#17-privacy)): `DRAW`, `RESOURCE`, `SEARCH`, `REVEAL` and the keyframe's `hand` name the hidden cards; `Perspective` in the header says when a file is not |
| **Lasting effects** | by their observable consequences: `STATS` (a unit given +3/+0 for an attack shows it and shows it going away), `keywords` (Sentinel for a phase), and the records they cause. The effect's text is not recorded — the card is named, and card data has the text |
| **Delayed effects** | by the records they produce when they fire (a Change of Heart return is a `TAKE_CONTROL` at regroup); they are invisible until then, as they are on a table |
| **Epic Actions** used/unused | `epic: true` on `DEPLOY_LEADER` / `ABILITY_ACTIVATE`; the leader's `epicActionUsed` |

What the file deliberately does **not** encode is the rulebook itself: why a cost was 4 and
not 5, what Sentinel means, that a unit dies at 0 remaining HP. Those are derivations, and
encoding them would make every file a copy of the engine. A human reads them off the card; a
computer replaying the board never needs them, because every consequence is already a line.
The format covers the two-player game; multiplayer formats (CR 11–12) are out of scope.

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
    if (e.t is ROUND_START or ROUND_END) and e.keyframe is complete:   # both seats, see §13
      state = deepCopy(e.keyframe)   # the keyframe is the truth
      continue                       # and skip the normal rule
    state = reduce(state, e)
  return state
```

### 12.1 The `MOVE` rule (the big one)

**0. Detach.** Before anything else: if `from` is an arena and `to` is not, or `from` is
`capture`, take `card` off every card's `upgrades` and `captured` lists (`detach`). A card
that leaves an arena is nobody's attachment any more, whatever its `kind` says and whether or
not anyone names a host — exits are host-less
([§10.1](#binding-an-attachment-to-its-host)). This step needs no `p`.

If `p` is missing: you can't attribute the counts to anyone. Just update the card's zone
if you already track it, and stop.

If `p` is there, do all of these:

**1. Hand count**

- moving *into* `hand` from somewhere else → `handSize + 1`
- moving *out of* `hand` to somewhere else → `handSize - 1` (never below 0)

**1b. Deck count**, once a keyframe has supplied it (before that, leave it absent)

- moving *into* `deck` from somewhere else → `deckSize + 1`
- moving *out of* `deck` to somewhere else → `deckSize - 1` (never below 0)

**1c. The leader coming home**: a move from an arena to `base` by the card the seat's
`leader.id` names → `leader.deployed = false`. (An `EXHAUST` beside it sets its flag.)

**2. Resource row** — two counts, `resourcesReady` and `resourcesExhausted`

- moving *into* `resource` from somewhere else → `resourcesReady + 1`. A card enters the
  row ready; if an ability put it there exhausted, an `EXHAUST_RESOURCES` beside the move
  says so ([§10.1](#101-events-that-carry-board-detail)).
- moving *out of* `resource` to somewhere else → `resourcesExhausted - 1` if the move
  carries `exhausted: true`, else `resourcesReady - 1` (never below 0).

**2b. Credits and the Force** — the two reserved token names
([§6.1](#two-reserved-token-names))

- a `TOKEN:credit#…` moving *into* `base` → `credits + 1`; *out of* `base` → `credits - 1`
  (never below 0)
- a `TOKEN:the-force#…` moving *into* `base` → `hasForce = true`; *out of* `base` →
  `hasForce = false`

Nothing else that enters or leaves `base` changes anything: a leader deploying or being
defeated is an arena move handled in step 3.

**3. In-play list** (in play = `ground` or `space`)

If `kind` is `"upgrade"`: this card never joins an arena. If the move is **into** an arena
and carries `attachedTo`, `attach(state, attachedTo, card)` — a printed card (an upgrade, a
pilot) goes onto that host's `upgrades`, idempotently, because the `PLAY_UPGRADE` /
`DEPLOY_LEADER` beside it names the same host; a token upgrade (`TOKEN:…`) does not, it is
counted by its own gain record. Then update the card's zone if you already track it, and
stop. Steps 1 and 2 still ran: an upgrade really does leave the hand.

- moving **into** an arena: if you already track this card id, just set its zone.
  Otherwise create a fresh card and add it to `players[p].cards`.
- moving **out of** an arena: remove it from whichever player's `cards` holds it (step 0
  already took it off every host).
- moving between two non-arena zones: just update its zone if you track it.

Adding is *idempotent by id*, so a `PLAY` followed by its `MOVE` never adds the card
twice.

### 12.2 Every other rule, in one table

| `t` | What you do |
|---|---|
| `ROUND_START` | `round = event.round`; `initiativeTaken = false` |
| `PHASE_START` | `phase = event.phase` |
| `CLAIM_INITIATIVE` | `initiative = event.p`; `initiativeTaken = true` |
| `PLAY`, `PLAY_SMUGGLE` | place `card` in `zone ?? "ground"` — **idempotent by id**: if already tracked, just set its zone. The paired `MOVE` reports the same arrival, and pushing on both duplicates every unit in play |
| `PLAY_EVENT` | push `card` onto `players[p].discard` |
| `PLAY_UPGRADE` | if `target` is set → `attach(state, target, card)` (nothing if the host isn't tracked); otherwise **nothing**. An upgrade is never an arena card, so there is no fallback placement |
| `DEPLOY_LEADER` | `players[p].leader = { id: card, deployed: true, exhausted: false, epicActionUsed: (was already used) or epic === true }`; then if `kind` is `"upgrade"` → `attach(state, target, card)`; else place `card` in `zone ?? "ground"`, idempotent by id |
| `ABILITY_ACTIVATE` | if `epic` and `card` is a seat's `leader.id` → that leader's `epicActionUsed = true`; otherwise nothing |
| `STATS` | if `card` is tracked → set its `power`, `hp`, and `keywords` (sorted) when given |
| `TAKE_CONTROL` | arena `zone` → move the card entry from the other seat's `cards` to `players[p].cards`; `resource` with `from` → shift one resource from `from` to `p`, in the exhausted bucket if `exhausted` else the ready one; `base` with `from` → shift one credit (or the Force) from `from` to `p`; otherwise nothing ([§10.1](#take_control)) |
| `CAPTURE` | remove `card` from every seat's `cards` (its `MOVE` already did); if `by` names a tracked card, push `card` onto its `captured`, idempotently |
| `RESCUE` | `detach(state, card)` — the `MOVE` out of `capture` beside it places the card |
| `EXHAUST_RESOURCES` | `n = min(amount, resourcesReady)`; `resourcesReady -= n`; `resourcesExhausted += n` |
| `READY_RESOURCES` | `n = min(amount, resourcesExhausted)`; `resourcesExhausted -= n`; `resourcesReady += n` |
| `CREATE_TOKEN` | place `token` in `zone`, idempotent by id — unless `kind` is `"upgrade"`, then nothing |
| `MOVE` | see [§12.1](#121-the-move-rule-the-big-one) |
| `DAMAGE` | `base@N` → `players[N].baseHp = hp`; else `card.damage = max(0, damage + amt)` |
| `OVERWHELM` | `base@N` → `players[N].baseHp = hp`; anything else → nothing |
| `HEAL` | `base@N` → `players[N].baseHp = hp`; else `card.damage = max(0, damage - amt)` |
| `DEFEAT` | `detach(state, card)`; then, if the card is in someone's `cards`, remove it and push its id onto that player's `discard` |
| `EXHAUST` | `exhausted = true` on the arena card of that id, and on `leader` if it is the leader's id |
| `READY` | `exhausted = false`, likewise |
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

- `newCard(id, zone)` → `{ id, zone, damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {}, captured: [] }`
- `attach(state, hostId, id)` → if `id` is a `TOKEN:` id, nothing (tokens are counters); else
  if `hostId` is tracked and `id` is not already in its `upgrades`, push it
- `detach(state, id)` → remove `id` from every card's `upgrades` and `captured`
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
- A keyframe's `cards` list contains **only** ground and space arena cards. Hand,
  resources and discard are described by their counts and lists, not by `cards`.
- A keyframe carries every field of [§11](#11-the-board-you-build-reducedstate): the
  initiative status, and per seat the deck count, the leader's status, and each card's live
  `power`/`hp`/`keywords`. A writer that cannot read one of them omits that field rather than
  inventing a value.
- Emit a keyframe on `ROUND_END` as well as `ROUND_START` when you can. It halves the
  window between checkpoints, so a round's worth of fold drift is caught a round earlier,
  and costs one snapshot.

**Readers, on meeting a keyframe that is missing a seat, or malformed** (a `cards`, `hand`
or `discard` that is not an array, or a `cards` entry that is not an object)**:** do NOT snap to it — snapping
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
- `handSize`
- `resourcesReady` and `resourcesExhausted`
- `credits` and `hasForce`
- the leader's `id`, `deployed`, `exhausted` and `epicActionUsed`
- `initiativeTaken`
- for each in-play card matched by `id`: `zone`, `damage`, `exhausted`, `shields`,
  `experience`, `statusTokens`, `upgrades` and `captured` **as sets** (attachment order
  is not part of the model; a missing list counts as empty), `power`, `hp`, and `keywords`
  as a set
- a card being in one side but not the other (reported both ways)

Everything except `baseHp` and `deckSize` is compared at **every** keyframe, the first one
included. A field the keyframe does not carry — `deckSize`, `leader`, `initiativeTaken`, a
card's `power`/`hp`/`keywords` — is skipped, so a file written before the field existed still
passes: absent means "not recorded", never "zero".

**Not checked, and why:**

| Field | Why not |
|---|---|
| `hand` / `discard` **contents** | Only the counts are reconstructable: `DRAW` appends to `hand`, nothing removes from it. |

Do not assume a passing check proves that one.

A mismatch looks like:

```json
{ "seq": "R7.start", "path": "players.1.handSize", "expected": 3, "got": 2 }
```

`expected` is the keyframe (the engine's truth). `got` is what folding produced.

A keyframe that is **damaged** — missing a seat, or with `cards`/`hand`/`discard` that are
not arrays — is never compared or snapped to ([§13](#13-keyframes)). It is reported as one
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

No other fields are allowed.

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
- Then a line per non-empty arena, cards joined by `  ·  `.
- A card is its name, then ` {power}/{hp}` when the keyframe has both, then its non-default
  state in `[...]`, comma-separated, in this order: damage (`3 dmg`), `exhausted`, shields
  (`2 shield`), experience (`1 xp`), each status token (`1 advantage`), each attached upgrade
  by name, then each captive as `holds {name}`.
- A seat with no keyframe entry prints ` P{n}  (not recorded)` — see
  [§13](#13-keyframes); this should never happen in a conformant file.
- No keyframe on the `ROUND_START`, or a damaged one ([§13](#13-keyframes)) → no summary,
  just the banner.

This costs nothing to record: it is the keyframe the file already carries, laid out to be
read.

### The exact wording

| `t` | Line |
|---|---|
| `PLAY`, `PLAY_SMUGGLE` | `{who(p)} plays {nm(card)}` + ` to {zone}` if `zone` + ` (cost {cost})` if `cost` |
| `PLAY_UPGRADE` | `{who(p)} plays {nm(card)}` + ` on {nm(target)}` if `target`, else ` to {zone}` if `zone`; + ` (cost {cost})` if `cost` |
| `PLAY_EVENT` | `{who(p)} plays {nm(card)}` + ` (cost {cost})` if `cost` — no zone |
| `DEPLOY_LEADER` | `{who(p)} deploys {nm(card)}` + ` as a pilot on {nm(target)}` if `target` |
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

A writer whose files are **published** SHOULD salt with a server-side secret instead (an HMAC
keyed by an environment variable). That flips the first property — the same player then hashes
the *same* across that server's games — and makes the id genuinely non-reversible. It costs one
env var, and a reader cannot tell the two schemes apart, so it needs no format change.

A writer MUST have a PII gate. The reference writer's gate is structural plus CI: no field is
ever built from a username except the salted id, and
`test/server/chat/SwuPgnPiiScan.spec.ts` stamps sentinel identities onto a live game and fails
if any of them survive into the file. A writer that builds strings from user data SHOULD also
scan the finished file, and MUST NOT write one the scan rejects.

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
5. Your `checkKeyframes()` reports **no** mismatch. Every vector is internally consistent —
   each keyframe is exactly what folding the deltas before it produces — so a reader that
   reports one has a fold rule wrong, not a bad file.

| Vector | Covers |
|---|---|
| `minimal` | Hand-written, rules-legal. A setup phase (draws, resourcing, the `R1.start` keyframe it leads to), a unit played in round 1 (`EXHAUST_RESOURCES`, `MOVE`, `STATS`, `PLAY`, the entering `EXHAUST`), a regroup (`READY`, `READY_RESOURCES`, two more keyframes), and the attack in round 2. Appendix A walks through it. |
| `organic` | A real game the reference writer produced: natural setup with a mulligan, four rounds of plays, attacks and regroups, a concession. Keyframes at every round boundary. |
| `upgrades` | Real game: a printed upgrade (`PLAY_UPGRADE` + `attachedTo`), Advantage and Experience tokens, Shield tokens, and the host defeated with all of it attached — every removal record, and the detach on exit. |
| `pilot` | Real game: a pilot flown onto a vehicle (`kind: "upgrade"` on a unit card, `%%% CARDS` saying `unit`), a second one, and a piloted vehicle Vanquished. |
| `capture` | Real game: a unit taken captive (`CAPTURE` with `by`, the `MOVE` into `capture`) and rescued when its captor is defeated. |

The four real-game vectors are regenerated from the writer by
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
folded with **no** field excluded: `SwuPgnOrganicGame.spec.ts` (four rounds), and the three
scenario games of `SwuPgnVectors.spec.ts` that are also the `upgrades`, `pilot` and `capture`
vectors ([§20](#20-test-vectors)). In every one, every keyframe field reproduces exactly:
`handSize`, `resourcesReady` **and `resourcesExhausted`**, `credits`, `hasForce`, and per card
`upgrades` and `captured` alongside the counters; `validate()` returns no issue at all;
`%%% CARDS` covers every leader, base and deck id; and `GAME_END` takes the `.game-end` step of
the phase it happened in. Two further real-game gates cover the cases that first broke the
fold: a Change of Heart steal and return (`TAKE_CONTROL` re-seating), and Kazuda Xiono
deploying as a pilot (`DEPLOY_LEADER` with `target`). (The other real-game specs bootstrap at
the action phase, which discards the natural hand without a `MOVE`, so they cannot assert the
hand and resource counts past `R1.start`.) The credit rule was additionally checked against a
real 10-round export in which one Credit token was created, held across two rounds and spent:
0 mismatches under the widened gate.

What remains genuinely unverified is the one un-gated field in
[§14](#14-checking-a-file-is-honest): the **contents** of `hand` and `discard`. A passing
integrity check says nothing about those. Everything else in CR 1.16's definition of the game
state ([§11](#what-the-board-covers-against-the-rules)) is reconstructed and gated, and the
four real-game vectors — Raid, Grit, Sentinel, tokens, upgrades, a pilot, a capture, leaders
in and out of the base zone — pass with nothing to report.

Three engine paths the resource rule covers by construction have no dedicated real-game gate
yet, and a reader should treat their split (not their total, which every regroup re-syncs) as
best-effort until one exists: a card Smuggled or played from the resource row (its exit `MOVE`
carries `exhausted: true`), a resource a friendly effect returns to hand (swapped exhausted on
the way out, same flag), and a resource stolen while exhausted (`TAKE_CONTROL` with
`exhausted`). Each is exercised by unit tests of the recorder against the engine's documented
behaviour, not by a played game.

`baseHp`/`baseMaxHp` are still absent from the SETUP `INIT` record. A reader that ships card
data can derive a base's starting HP itself, and the first keyframe supplies it either way,
so this is low priority — but emitting it would give the keyframe gate an independent value
to check the first keyframe against, which is the one place it currently can't
([§14](#14-checking-a-file-is-honest)).

A `CAPTURE` whose captor is a base (`by: "base@N"`) is recorded but not held anywhere in the
fold: no card today captures with a base, and the card is out of play either way.

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

The reference writer changed behaviour several times while 1.0 was being shaken out against
real games, before any 1.0 file was published. None of these needed a version bump — every
one is an addition, a correction, or a wording change that a 1.0 reader already tolerates —
but each is detectable from the file, so a reader that meets an early 1.0 file can tell:

| Earlier 1.0 files | Current 1.0 files | Detect |
|---|---|---|
| Story wrote `(2 resources)` after a play | `(cost 2)` — it is the printed cost ([§10.1](#101-events-that-carry-board-detail)) | a story line containing `resources)` |
| `CHOICE.offered` named a base by its card id (`SOR#029`) | `base@N` ([§6.3](#63-pointing-at-a-base)) | `offered` entry matching `^base@[12]$` |
| Deck construction emitted 40 `MOVE`s `outsideTheGame` → `deck` | not recorded ([§10.1](#101-events-that-carry-board-detail)) | any `MOVE` with `from: "outsideTheGame"`, `to: "deck"` |
| `%%% CARDS.kind` followed the live role (a pilot said `upgrade` while attached) | the printed identity ([§10.1](#kind-on-an-event-is-a-role-kind-in--cards-is-an-identity)) | not detectable from the index alone; a pilot's `MOVE` `kind` disagreeing with its index `kind` shows the current writer |
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
| A unit entering play exhausted was never written, so every replay showed a just-played unit ready | an `EXHAUST` right after its arrival ([§10.1](#101-events-that-carry-board-detail)) | an `EXHAUST` for a card in the same action as its `PLAY` |
| Nothing carried a unit's live stats between keyframes; keyframes carried none at all | `STATS` after every change; `power`/`hp`/`keywords` on keyframe cards, gated ([§10.1](#stats)) | any `STATS` record |
| The leader in the base zone, the deck count and the initiative counter's status were not in the board | `leader`, `deckSize`, `initiativeTaken` in every keyframe; `epic` on `DEPLOY_LEADER` / `ABILITY_ACTIVATE`; a returning Leader Unit's `EXHAUST` ([§11](#11-the-board-you-build-reducedstate)) | a keyframe carrying `leader` |
| The `minimal` vector attacked with a unit the turn it was played | rules-legal two-round game ([§20](#20-test-vectors)) | not a file change |

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
[Seed "0"]
[P1Id "sha256:aaaa"] [P2Id "sha256:bbbb"] [P1 "Player 1"] [P2 "Player 2"]
[P1Leader "SOR#010"] [P1Base "SOR#028"] [P2Leader "SOR#005"] [P2Base "SOR#020"]
[Result "Incomplete"] [Reason "Sample"] [Rounds "2"]

%%% STORY
 ── setup ──
       ↳ Player 1 draws 3: Wampa, Wampa #2, Wampa #3
       ↳ Player 2 draws 3: Cell Block Guard, Cell Block Guard #2, Cell Block Guard #3
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
       ↳ Player 1 draws 2: Wampa #4, Wampa #5
       ↳ Player 2 draws 2: Cell Block Guard #4, Cell Block Guard #5
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
{"seq":"R1.G.12","t":"READY_RESOURCES","p":1,"amount":1}
{"seq":"R1.G.13","t":"READY_RESOURCES","p":1,"amount":1}
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
       ↳ Player 1 draws 3: Wampa, Wampa #2, Wampa #3
       ↳ Player 2 draws 3: Cell Block Guard, Cell Block Guard #2, Cell Block Guard #3
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
       ↳ Player 1 draws 2: Wampa #4, Wampa #5
       ↳ Player 2 draws 2: Cell Block Guard #4, Cell Block Guard #5
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
| `MOVE hand → resource` + `RESOURCE`, each player | `handSize` 1 / 2, `resourcesReady` 3 |
| `READY {card:"SOR#108"}` | the Wampa readies |
| `READY_RESOURCES {p:1, amount:1}` ×2 | Player 1's two exhausted resources ready, one record each: `resourcesExhausted` 2 → 0, `resourcesReady` 1 → 3 |
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
| `DRAW` | indented: `       ↳ Player 1 draws 3: Wampa, Wampa #2, Wampa #3` — the `:N` copy suffix becomes ` #N` |
| `KEEP_HAND` | indented: `       ↳ Player 1 keeps their hand` |
| `RESOURCE` | indented: `       ↳ Player 1 resources Wampa #2` — this is what `RESOURCE` is for; its `MOVE` printed nothing |
| `ROUND_START` | blank, rule, ` ROUND 1` + initiative, the board from its keyframe (`resources 2/2   deck 2   leader ready`; in round 2 `ground: Wampa 4/5`), rule, blank · counter → 0 |
| `PHASE_START {action}` / `{regroup}` | ` ── action ──` / ` ── regroup ──` · counter → 0 |
| `PLAY` | numbered: `  1. Player 1 plays Wampa to ground (cost 2)` — the printed cost; what was paid is in the events |
| `PASS` | numbered: `  2. Player 2 passes` |
| `ATTACK` | numbered: `  1. Player 1 attacks Player 2's base with Wampa` |
| `DAMAGE` | indented under it: `       ↳ 4 damage to Player 2's base — 26 HP left` |
