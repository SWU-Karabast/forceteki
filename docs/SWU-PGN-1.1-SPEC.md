# SWU-PGN/1.1 Normative Specification

**Document identifier:** SWU-PGN/1.1-SPEC  
**Date:** 2026-06-16  
**Status:** Draft Standard  
**Editors:** Karabast Project  
**Repository:** https://github.com/nikolat/karabast (reference implementation: `swupgn/`)

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Status of This Document](#2-status-of-this-document)
3. [Conformance](#3-conformance)
4. [Terminology](#4-terminology)
5. [File Grammar](#5-file-grammar)
6. [Header Tags](#6-header-tags)
7. [Record Schemas](#7-record-schemas)
8. [State Model and Fold](#8-state-model-and-fold)
9. [Determinism](#9-determinism)
10. [Annotations](#10-annotations)
11. [Completeness Contract](#11-completeness-contract)
12. [Rendering](#12-rendering)
13. [Security and Privacy Considerations](#13-security-and-privacy-considerations)
14. [Versioning and Evolution](#14-versioning-and-evolution)
15. [Media Type](#15-media-type)
16. [Test Vectors](#16-test-vectors)

[Appendix A: Worked Example](#appendix-a-worked-example)

---

## 1. Abstract

SWU-PGN (Star Wars: Unlimited Portable Game Notation) is a line-oriented, human-readable format for archiving, replaying, and annotating games of Star Wars: Unlimited. Version 1.1 defines a four-section envelope (DECKS, SETUP, EVENTS, ANNOTATIONS) whose header uses bracketed tag-value pairs and whose body sections carry Newline-Delimited JSON (NDJSON) records.

The format provides:

- **Complete replay**: every game-state mutation is represented as a typed event record carrying the resulting delta, so any Reader can reconstruct the exact board state at any point without re-running the engine.
- **Folded state**: a deterministic reduce function maps the ordered event stream onto a `ReducedState` object, enabling O(n) state reconstruction.
- **Keyframes**: authoritative snapshots embedded at round boundaries, enabling O(1) jump-to-round and integrity checking.
- **Annotations**: append-only analysis records, engine-free variation lines, and NAG glyphs.
- **Privacy**: no real player identifiers; salted-hash pseudonyms are stable per player but non-reversible.

---

## 2. Status of This Document

This document is a **draft standard**. It follows [SemVer 2.0.0](https://semver.org/): the format version string `SWU-PGN/1.1` encodes MAJOR.MINOR. Backwards-incompatible changes increment the major component. Additive changes that do not break existing readers increment the minor component.

The **reference implementation** is the `swupgn/` TypeScript module in the Karabast repository. In all cases of conflict between this document and the reference implementation, **the reference implementation is authoritative**. This document is intended to accurately describe the implementation.

The test vectors in `swupgn/test-vectors/` are **normative**: a conforming implementation must reproduce each vector's `.fold.json` output and `.render.txt` output exactly, and must pass `validate()` on each `.swupgn` file without errors.

---

## 3. Conformance

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

### 3.1 Conformance Classes

This specification defines four conformance classes.

**Producer**
A system that generates `.swupgn` files. A conforming Producer:

- MUST emit all required header tags (§6).
- MUST emit well-formed NDJSON records in the correct sections.
- MUST emit an event record for every game-state mutation (§11).
- MUST verify that `fold(events)` equals each embedded keyframe by calling `checkKeyframes()` before writing the file.
- MUST NOT include real player usernames or non-anonymized identifiers.
- MUST pass a PII scan before writing.

**Reader-fold**
A system that parses a `.swupgn` file and computes folded state. A conforming Reader-fold:

- MUST parse the file grammar of §5 without error on valid files.
- MUST implement the `reduce()` rule for every event type in §8 exactly as specified.
- MUST reproduce the `.fold.json` output of each normative test vector.
- MUST treat unknown event `t` values as no-op (warning, not error).

**Reader-render**
A system that produces a human-readable narrative from the event stream. A conforming Reader-render:

- MUST implement the rendering rules of §12 exactly.
- MUST reproduce the `.render.txt` output of each normative test vector.

**Annotator**
A system that appends or reads `%%% ANNOTATIONS` records. A conforming Annotator:

- MUST only append records; it MUST NOT modify existing records.
- MUST set `ref` to a valid `seq` value that exists in the file's EVENTS section.
- MUST NOT include real identifiers in the `by` field.

---

## 4. Terminology

**seq**
A sequence identifier string that uniquely identifies a record within a game. The normative format is defined in §7.1. Examples: `R1.A.1`, `R1.start`, `R2.G.3`.

**event**
A single JSON record in the `%%% EVENTS` section, carrying a `seq`, a discriminant type `t`, and type-specific fields encoding the game action and its resulting state delta.

**delta**
The change in `ReducedState` produced by applying a single event via `reduce()`. Some events are "pure-log" events that carry no delta.

**fold**
The process of applying `reduce()` to each event in sequence to produce a final `ReducedState`. Equivalent to a left-fold over the event stream with `emptyState()` as the initial accumulator.

**keyframe**
An authoritative `ReducedState` snapshot embedded in a `ROUND_START` or `ROUND_END` event. When a Reader encounters a keyframe, it MUST snap its running state to the keyframe and continue folding from there, rather than continuing to accumulate from the previous state.

**perspective**
The seat (`P1` or `P2`) from whose viewpoint the file was recorded, or `null`/absent for an omniscient archive. Affects which information is visible in hidden zones (e.g., the opponent's hand).

**card pool**
The set/legality identifier (e.g., `"SOR"`, `"LOF"`) that identifies which cards and rules are in effect for this game.

**NAG (Numeric Annotation Glyph)**
A symbolic annotation glyph borrowed from chess notation (§10.2).

---

## 5. File Grammar

### 5.1 Overview

A `.swupgn` file is a UTF-8 text file. Line endings are LF (`\n`); CR+LF sequences are tolerated by the reference parser (which trims each line). The file consists of:

1. Zero or more **header tag lines** (before any `%%%` banner).
2. One or more **section banners** (`%%% SECTION_NAME`) each followed by zero or more **NDJSON record lines**.
3. Blank lines are ignored everywhere.

### 5.2 ABNF-Style Grammar (Informative Sketch)

```
swupgn-file   = *( header-line / blank-line )
                1*( banner-line *( record-line / blank-line ) )

header-line   = 1*tag-pair LF
banner-line   = "%%%" SP section-name LF
record-line   = json-object LF
blank-line    = *SP LF

tag-pair      = "[" tag-name SP DQUOTE tag-value DQUOTE "]"
tag-name      = 1*( ALPHA / DIGIT )
tag-value     = *( safe-char / escape-seq )
safe-char     = %x20-21 / %x23-5B / %x5D-7E  ; printable ASCII except DQUOTE and BACKSLASH
escape-seq    = BACKSLASH ANY-CHAR

section-name  = "DECKS" / "SETUP" / "EVENTS" / "ANNOTATIONS"
```

### 5.3 Header Tag Lines

- A header tag line MAY contain one or more `[TagName "Value"]` pairs on the same line (as demonstrated in the minimal vector: `[Format "Premier"] [CardPool "SOR"] [Engine "forceteki@reference"]`).
- Tag names consist of ASCII letters and digits; they are case-sensitive.
- Tag values are enclosed in double-quotes. Within the value, a backslash followed by any character is an escape sequence: the backslash is removed and the following character is taken literally. This permits embedding double-quotes as `\"` and backslashes as `\\`.
- Header tag lines MUST appear before the first `%%%` banner.

### 5.4 Section Banners

A section banner is a line beginning with `%%%`, followed by optional whitespace and then the section name, case-insensitive (the parser uppercases the name). The four defined section names are `DECKS`, `SETUP`, `EVENTS`, and `ANNOTATIONS`.

If a JSON record appears in an unrecognized section (a section with a banner name other than the four defined names), the parser MUST throw an error. If a JSON record appears before any `%%%` banner, the parser MUST throw an error.

Sections may appear in any order, though the canonical order is DECKS → SETUP → EVENTS → ANNOTATIONS.

### 5.5 NDJSON Record Lines

Each non-blank, non-banner line within a section MUST be a valid JSON object. The parser calls `JSON.parse()` on the trimmed line. A parse failure MUST be reported as an error identifying the line number.

### 5.6 Error Conditions

| Condition | Error |
|-----------|-------|
| Missing required header tag | `SWU-PGN: missing required header tag [TagName]` |
| Invalid JSON on a record line | `SWU-PGN: invalid JSON on line N` |
| JSON record in an unrecognized section | `SWU-PGN: JSON record in unrecognized section on line N` |
| JSON record before any `%%%` section | `SWU-PGN: record before any %%% section on line N` |

---

## 6. Header Tags

Header tags are collected from all header tag lines before the first `%%%` banner. Duplicate tag names: the last occurrence wins (consistent with the map-building in `buildHeader`).

### 6.1 Required Tags

| Tag | Type | Description |
|-----|------|-------------|
| `Game` | string | MUST be exactly `"SWU-PGN/1.1"`. |
| `GameId` | string | Unique opaque identifier for this game instance. |
| `Date` | string | ISO-8601 UTC timestamp of game start (e.g., `"2026-06-16T00:00:00Z"`). |
| `CardPool` | string | Set/legality version identifier (e.g., `"SOR"`, `"LOF"`). |
| `Engine` | string | Producer engine identifier including version (e.g., `"forceteki@2.3.1"`). |
| `Seed` | string | RNG seed used for this game. See §9. |
| `P1Id` | string | Anonymized identifier for Player 1. MUST be of the form `sha256:<salted-hex>`. |
| `P2Id` | string | Anonymized identifier for Player 2. MUST be of the form `sha256:<salted-hex>`. |
| `P1` | string | Display label for Player 1. MUST be anonymized (e.g., `"Player 1"`). |
| `P2` | string | Display label for Player 2. MUST be anonymized (e.g., `"Player 2"`). |
| `P1Leader` | string | Card identifier for Player 1's leader (e.g., `"SOR#010"`). |
| `P1Base` | string | Card identifier for Player 1's base (e.g., `"SOR#028"`). |
| `P2Leader` | string | Card identifier for Player 2's leader. |
| `P2Base` | string | Card identifier for Player 2's base. |
| `Result` | enum | One of `"P1"`, `"P2"`, `"Draw"`, `"Incomplete"`. |
| `Reason` | string | Human-readable description of how the game ended. |
| `Rounds` | integer (as string) | Number of complete rounds played. |

### 6.2 Optional Tags

| Tag | Type | Description |
|-----|------|-------------|
| `Format` | string | Tournament format (e.g., `"Premier"`, `"Unlimited"`). |
| `Perspective` | enum | `"P1"` or `"P2"`. When present, the file was recorded from that player's perspective and hidden-zone data for the opponent MAY be absent. When absent or `null`, the file is an omniscient archive. |

### 6.3 Anonymization Rules

- The `P1` and `P2` display labels MUST NOT contain real usernames. The reference implementation uses `"Player 1"` and `"Player 2"`.
- `P1Id` and `P2Id` MUST be salted cryptographic hashes of the real player identifier. The hash is non-reversible but stable per player per salt, enabling cross-game correlation without revealing real identities.
- Producers MUST pass a PII scan before emitting a file. See §13.

---

## 7. Record Schemas

The four JSON schemas are published at:

- `swupgn/schema/header.schema.json` (`$id`: `https://karabast.net/swu-pgn/1.1/header.schema.json`)
- `swupgn/schema/event.schema.json` (`$id`: `https://karabast.net/swu-pgn/1.1/event.schema.json`)
- `swupgn/schema/deck.schema.json` (`$id`: `https://karabast.net/swu-pgn/1.1/deck.schema.json`)
- `swupgn/schema/annotation.schema.json` (`$id`: `https://karabast.net/swu-pgn/1.1/annotation.schema.json`)

All schemas use JSON Schema draft 2020-12. The event and header schemas set `additionalProperties: true` to allow forward-compatible extensions.

### 7.1 The `seq` Field

Every event record (and the SETUP INIT record) carries a `seq` field that uniquely identifies it within the game. The normative pattern (from `event.schema.json`) is:

```
^R\d+\.(S|A|G)(\.[A-Za-z0-9-]+)?$|^R\d+\.(start|end)$
```

In prose:

- `R<round>.<phase-code>[.<step>]` where phase codes are `S` (setup), `A` (action), `G` (regroup).
- `R<round>.start` and `R<round>.end` for round boundary events.
- Step identifiers within a phase are alphanumeric with hyphens and typically encode a numeric action counter followed by an optional sub-step letter (e.g., `R1.A.1`, `R1.A.2a`, `R1.A.2b`).

The SETUP INIT record uses the fixed seq `"R1.S.0"`.

### 7.2 DECKS Section Records

Each record in the `%%% DECKS` section is a `DeckRecord` with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `p` | integer (1 or 2) | Yes | Seat number. |
| `leader` | string | Yes | Card identifier for this player's leader. |
| `base` | string | Yes | Card identifier for this player's base. |
| `deck` | array of `[string, integer]` | Yes | List of `[SET#NUM, count]` pairs representing the deck composition. |
| `sideboard` | array of `[string, integer]` | No | Same structure as `deck`, for sideboard cards. |

No additional properties are permitted (`additionalProperties: false`).

### 7.3 SETUP Section Records

The `%%% SETUP` section contains exactly one record of type `INIT`, followed optionally by early game-phase events (mulligan decisions, initial draws) that are structurally identical to EVENTS records.

**INIT record fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seq` | string | Yes | Always `"R1.S.0"`. |
| `t` | string | Yes | Always `"INIT"`. |
| `p1DeckOrder` | string[] | Yes | Ordered list of card identifiers giving Player 1's deck order after shuffling. |
| `p2DeckOrder` | string[] | Yes | Ordered list of card identifiers giving Player 2's deck order after shuffling. |

### 7.4 EVENTS Section Records

Every event record MUST carry at minimum:

| Field | Type | Required |
|-------|------|----------|
| `seq` | string | Yes — matches the pattern in §7.1 |
| `t` | string | Yes — the event type discriminant |

Additional fields depend on `t`. The complete set of defined `t` values, their fields, and their state deltas are enumerated below.

#### 7.4.1 Event Types with State Deltas

These events carry a delta that Reader-fold implementations MUST apply via `reduce()`.

---

**`PLAY`** — Play a non-event, non-upgrade, non-smuggle card (typically a unit) from hand.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `p` | 1 or 2 | Yes | The acting player. |
| `card` | string | Yes | Card identifier. |
| `zone` | string | No | Destination zone (defaults to `"ground"` when absent). |
| `cost` | integer | No | Resource cost paid. |

Delta: A new `CardInstanceState` for `card` in `zone` (or `"ground"`) is appended to `players[p].cards`.

---

**`PLAY_EVENT`** — Play an event card from hand.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `p` | 1 or 2 | Yes | The acting player. |
| `card` | string | Yes | Card identifier. |
| `zone` | string | No | Not used for state delta; included for completeness. |
| `cost` | integer | No | Resource cost paid. |

Delta: `card` is appended to `players[p].discard`. Event cards go directly to the discard pile, not to play.

---

**`PLAY_UPGRADE`** — Play an upgrade card from hand, attaching it to a unit.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `p` | 1 or 2 | Yes | The acting player. |
| `card` | string | Yes | Card identifier of the upgrade. |
| `target` | string | No | Card identifier of the host unit. When present and the host is found in `cards`, the upgrade is appended to the host's `upgrades[]`. |
| `zone` | string | No | Used as fallback zone when host is unknown. |
| `cost` | integer | No | Resource cost paid. |

Delta: If `target` is present and the host card is found in the current state, `card` is pushed to `host.upgrades`. Otherwise (host unknown), a new `CardInstanceState` for `card` is appended to `players[p].cards` at `zone` (or `"ground"`).

---

**`PLAY_SMUGGLE`** — Play a card using the Smuggle keyword (pays with resources on the card).

Fields and delta are identical to `PLAY`. A new `CardInstanceState` for `card` in `zone` (or `"ground"`) is appended to `players[p].cards`.

---

**`DEPLOY_LEADER`** — Deploy a leader from the leader zone to the ground arena.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `p` | 1 or 2 | Yes | The acting player. |
| `card` | string | Yes | Card identifier of the leader unit. |
| `zone` | string | No | Destination zone (defaults to `"ground"`). |
| `cost` | integer | No | Resource cost paid. |

Delta: A new `CardInstanceState` for `card` in `zone` (or `"ground"`) is appended to `players[p].cards`.

---

**`CREATE_TOKEN`** — Create a token card and place it in a zone.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `p` | 1 or 2 | Yes | The acting player. |
| `token` | string | Yes | Token card identifier. |
| `zone` | string | Yes | Destination zone. |
| `power` | integer | No | Token's power value. |
| `hp` | integer | No | Token's HP value. |

Delta: A new `CardInstanceState` for `token` in `zone` is appended to `players[p].cards`.

---

**`DAMAGE`** — Deal damage to a unit or a player's base.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `src` | string | Yes | Card identifier of the damage source. |
| `tgt` | string | Yes | Target reference: either `base@N` (where N is the seat number) or a card identifier. |
| `amt` | integer | Yes | Amount of damage dealt. |
| `damageType` | string | Yes | Type of damage (e.g., `"combat"`, `"ability"`). |
| `hp` | integer | Yes | Remaining HP of the target after damage. |

Delta:
- If `tgt` matches `^base@(\d)$`: set `players[seat].baseHp = hp`.
- Otherwise: find the card by `tgt` in all players' `cards`; set `card.damage = max(0, card.damage + amt)`.

Note: `hp` is the authoritative post-damage HP value, and for bases it is written directly to `baseHp`. For card damage, the delta accumulates on `card.damage`.

---

**`OVERWHELM`** — Apply overflow damage to a player's base via the Overwhelm keyword.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `p` | 1 or 2 | Yes | The attacking player. |
| `tgt` | string | Yes | Target base reference (typically `base@N`). |
| `amt` | integer | Yes | Amount of overwhelm damage. |
| `hp` | integer | Yes | Remaining base HP after overwhelm. |

Delta: If `tgt` matches `^base@(\d)$`: set `players[seat].baseHp = hp`. Non-base targets are not processed (the parser matches only `base@N`).

---

**`HEAL`** — Heal damage from a unit or a player's base.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tgt` | string | Yes | Target reference: `base@N` or a card identifier. |
| `amt` | integer | Yes | Amount healed. |
| `hp` | integer | Yes | Remaining HP after healing. |

Delta:
- If `tgt` matches `^base@(\d)$`: set `players[seat].baseHp = hp`.
- Otherwise: find the card; set `card.damage = max(0, card.damage - amt)`.

---

**`DEFEAT`** — Remove a card from play and place it in the discard pile.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `card` | string | Yes | Card identifier of the defeated card. |
| `reason` | string | Yes | Reason for defeat (e.g., `"combat"`, `"ability"`). |
| `defeatedBy` | string | No | Card identifier of what caused the defeat. |

Delta: Search all players' `cards` for the card by `id`. When found, remove it from `cards` and push its `id` to `discard`.

---

**`EXHAUST`** — Mark a card as exhausted.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `card` | string | Yes | Card identifier. |

Delta: Find the card; set `card.exhausted = true`.

---

**`READY`** — Mark a card as ready (un-exhausted).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `card` | string | Yes | Card identifier. |

Delta: Find the card; set `card.exhausted = false`.

---

**`MOVE`** — Move a card from one zone to another.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `card` | string | Yes | Card identifier. |
| `from` | string | Yes | Source zone. |
| `to` | string | Yes | Destination zone. |

Delta: Find the card; set `card.zone = to`.

---

**`DRAW`** — A player draws one or more cards.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `p` | 1 or 2 | Yes | The drawing player. |
| `count` | integer | Yes | Number of cards drawn. |
| `cards` | string[] | Yes | Card identifiers drawn (may be empty if hidden from perspective). |

Delta: `players[p].handSize += count`; each card id in `cards` is appended to `players[p].hand`.

---

**`DISCARD`** — A player discards one or more cards.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `p` | 1 or 2 | Yes | The discarding player. |
| `cards` | string[] | Yes | Card identifiers discarded. |

Delta: `players[p].handSize = max(0, handSize - cards.length)`; each card id in `cards` is appended to `players[p].discard`.

---

**`RESOURCE`** — A player resources a card (moves it face-down to the resource zone).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `p` | 1 or 2 | Yes | The acting player. |
| `card` | string | Yes | Card identifier being resourced. |
| `cardName` | string | No | Human-readable card name (optional metadata). |

Delta: `players[p].handSize = max(0, handSize - 1)`; `players[p].resourcesReady += 1`.

---

**`SHIELD_GAIN`** — A card gains one or more shield tokens.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `card` | string | Yes | Card identifier. |
| `count` | integer | No | Number of shields gained (defaults to 1 when absent). |

Delta: Find the card; `card.shields += count ?? 1`.

---

**`SHIELD_USE`** — A card uses (loses) one or more shield tokens.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `card` | string | Yes | Card identifier. |
| `count` | integer | No | Number of shields used (defaults to 1 when absent). |

Delta: Find the card; `card.shields = max(0, card.shields - (count ?? 1))`.

---

**`EXPERIENCE_GAIN`** — A card gains experience counters.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `card` | string | Yes | Card identifier. |
| `count` | integer | Yes | Number of experience counters gained. |

Delta: Find the card; `card.experience += count`.

---

**`STATUS_TOKEN`** — Apply a status token to a card.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `card` | string | Yes | Card identifier. |
| `token` | string | Yes | Token type name (e.g., `"stun"`, `"capture"`). |
| `count` | integer | Yes | Number of tokens applied. |

Delta: Find the card; `card.statusTokens[token] = (statusTokens[token] ?? 0) + count`.

---

**`ROUND_START`** — Signal the beginning of a round.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `round` | integer | Yes | The round number beginning. |
| `keyframe` | ReducedState | No | Authoritative state snapshot. |

Delta: `state.round = round`. If `keyframe` is present, the entire running state is snapped to the keyframe and further reduction of prior incremental events is skipped for that keyframe.

---

**`PHASE_START`** — Signal the beginning of a game phase.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phase` | string | Yes | Phase name: `"setup"`, `"action"`, or `"regroup"`. |

Delta: `state.phase = phase`.

---

**`CLAIM_INITIATIVE`** — A player claims initiative and passes their action.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `p` | 1 or 2 | Yes | The player claiming initiative. |

Delta: `state.initiative = p`.

#### 7.4.2 Pure-Log Events (No State Delta)

These events are recorded for narrative and audit purposes. Reader-fold implementations MUST process them without modifying `ReducedState` (the `reduce()` function returns the state unchanged for these types).

| `t` value | Fields | Description |
|-----------|--------|-------------|
| `ATTACK` | `p`, `atk` (string), `def` (string), `defenderType` ("unit" or "base") | Declares a combat attack. |
| `PASS` | `p` | Player passes their action. |
| `CHOICE` | `p`, `offered` (string[]), `chose` (integer), `prompt` (string, optional) | Player selects from offered options. |
| `MULLIGAN` | `p` | Player mulligans their opening hand. |
| `KEEP_HAND` | `p` | Player keeps their opening hand. |
| `MODAL_CHOICE` | `p`, `offered` (string[]), `chose` (integer) | Player selects a modal ability option. |
| `ABILITY_ACTIVATE` | `p`, `card` (string), `ability` (string, optional) | Player activates a card ability. |
| `SHUFFLE` | `p` | A player's deck is shuffled. |
| `CAPTURE` | `p`, `card` (string) | A card is captured. |
| `RESCUE` | `p`, `card` (string) | A captured card is rescued. |
| `TAKE_CONTROL` | `p`, `card` (string) | A player takes control of a card. |
| `SEARCH` | `p`, `found` (string[], optional), `zone` (string, optional) | Player searches a zone. `found` lists found cards if revealed. |
| `REVEAL` | `p`, `zone` (string), `cards` (string[]) | Cards in a zone are revealed. |
| `TRIGGER` | `p` (optional), `card` (string) | A triggered ability fires. |
| `PHASE_END` | `phase` (string) | End of a game phase. |
| `ROUND_END` | `round` (integer), `keyframe` (ReducedState, optional) | End of a round. Keyframe semantics same as `ROUND_START`. |
| `GAME_END` | `winner` (1, 2, or "Draw"), `reason` (string) | The game concludes. |

Note: `ROUND_END` is listed here as a pure-log event because `reduce()` does not apply a state delta for it. However, if `keyframe` is present on a `ROUND_END` event, the fold snaps to the keyframe (same as `ROUND_START`).

---

## 8. State Model and Fold

### 8.1 ReducedState

The complete game state reconstructable from the event stream is represented by `ReducedState`:

```typescript
interface ReducedState {
    round: number;                            // current round number (0 before game starts)
    phase: 'setup' | 'action' | 'regroup';   // current phase
    initiative: Seat | null;                  // which player holds initiative, or null
    players: Partial<Record<Seat, PlayerState>>;
}
```

Each player's state is a `PlayerState`:

```typescript
interface PlayerState {
    seat: Seat;                        // 1 or 2
    baseHp: number;                    // current base HP
    baseMaxHp: number;                 // maximum base HP (30 at game start)
    handSize: number;                  // number of cards in hand (count only)
    hand: string[];                    // known card ids (omniscient archive; may be empty)
    resourcesReady: number;            // number of ready resource cards
    resourcesExhausted: number;        // number of exhausted resource cards
    credits: number;                   // available credits
    hasForce: boolean;                 // whether this player controls the Force
    discard: string[];                 // ordered discard pile (card ids)
    cards: CardInstanceState[];        // units, leaders, upgrades currently in play
}
```

Each card in play is a `CardInstanceState`:

```typescript
interface CardInstanceState {
    id: string;            // card identifier, e.g. "SOR#108" or "SOR#108:2" for copies
    zone: string;          // zone this card occupies (e.g., "ground", "space")
    damage: number;        // damage counters on this card
    exhausted: boolean;    // whether this card is exhausted
    upgrades: string[];    // card ids of upgrades attached to this card
    shields: number;       // shield token count
    experience: number;    // experience counter count
    statusTokens: Record<string, number>; // status token counts by token type
}
```

### 8.2 Initial State

The fold begins with `emptyState()`:

```
round: 0
phase: "setup"
initiative: null
players:
  1: { seat:1, baseHp:30, baseMaxHp:30, handSize:0, hand:[], resourcesReady:0,
       resourcesExhausted:0, credits:0, hasForce:false, discard:[], cards:[] }
  2: { seat:2, baseHp:30, baseMaxHp:30, handSize:0, hand:[], resourcesReady:0,
       resourcesExhausted:0, credits:0, hasForce:false, discard:[], cards:[] }
```

### 8.3 The `reduce()` Function

`reduce(state, event)` mutates and returns the state according to the following rules (one rule per event type). For types not listed here, no mutation is performed (see §7.4.2 for the pure-log list).

| Event `t` | Mutation |
|-----------|----------|
| `ROUND_START` | `state.round = event.round` |
| `PHASE_START` | `state.phase = event.phase` |
| `CLAIM_INITIATIVE` | `state.initiative = event.p` |
| `PLAY` | Append `newCard(event.card, event.zone ?? "ground")` to `players[p].cards` |
| `PLAY_SMUGGLE` | Same as `PLAY` |
| `PLAY_EVENT` | Append `event.card` to `players[p].discard` |
| `PLAY_UPGRADE` | If `event.target` is set and the host card is found: push `event.card` to `host.upgrades`. Otherwise: append `newCard(event.card, event.zone ?? "ground")` to `players[p].cards` |
| `DEPLOY_LEADER` | Append `newCard(event.card, event.zone ?? "ground")` to `players[p].cards` |
| `CREATE_TOKEN` | Append `newCard(event.token, event.zone)` to `players[p].cards` |
| `DAMAGE` | If `tgt == "base@N"`: `players[N].baseHp = event.hp`. Else: find card; `card.damage = max(0, card.damage + event.amt)` |
| `OVERWHELM` | If `tgt == "base@N"`: `players[N].baseHp = event.hp` |
| `HEAL` | If `tgt == "base@N"`: `players[N].baseHp = event.hp`. Else: find card; `card.damage = max(0, card.damage - event.amt)` |
| `DEFEAT` | Find card in any player's `cards`; remove from `cards`; push `card.id` to that player's `discard` |
| `EXHAUST` | Find card; `card.exhausted = true` |
| `READY` | Find card; `card.exhausted = false` |
| `MOVE` | Find card; `card.zone = event.to` |
| `DRAW` | `players[p].handSize += event.count`; push each id in `event.cards` to `players[p].hand` |
| `DISCARD` | `players[p].handSize = max(0, handSize - cards.length)`; push each id in `event.cards` to `players[p].discard` |
| `RESOURCE` | `players[p].handSize = max(0, handSize - 1)`; `players[p].resourcesReady += 1` |
| `SHIELD_GAIN` | Find card; `card.shields += event.count ?? 1` |
| `SHIELD_USE` | Find card; `card.shields = max(0, card.shields - (event.count ?? 1))` |
| `EXPERIENCE_GAIN` | Find card; `card.experience += event.count` |
| `STATUS_TOKEN` | Find card; `card.statusTokens[event.token] = (statusTokens[event.token] ?? 0) + event.count` |

`newCard(id, zone)` initializes: `{ id, zone, damage:0, exhausted:false, upgrades:[], shields:0, experience:0, statusTokens:{} }`.

`findCard(state, id)` searches `players[1].cards` then `players[2].cards` for a card with matching `id`. If not found, the event is silently ignored.

`seatOfBaseRef(ref)` extracts the seat number from a `base@N` reference string. Returns `null` for non-base refs.

### 8.4 The `fold()` Function

```
fold(events):
  state = emptyState()
  for each event e in events:
    if (e.t === "ROUND_START" or e.t === "ROUND_END") and e.keyframe is present:
      state = deepCopy(e.keyframe)   // snap: keyframe is authoritative
      continue                       // do NOT apply reduce() for this event
    state = reduce(state, e)
  return state
```

Keyframes are processed first: when a keyframe is present, the running state is replaced with the keyframe snapshot and `reduce()` is NOT called for that event. This means the keyframe value overrides any delta that would have been computed from the event's other fields.

### 8.5 The `stateAt()` Function

`stateAt(events, seq)` returns the reduced state after and including the event with the given `seq`. It slices the events array up through the matching event and calls `fold()` on the slice. If no event with the given `seq` is found, `fold()` is called on the full array.

### 8.6 Keyframes are Authoritative

A Reader-fold MUST treat keyframe values as ground truth. When a `ROUND_START` or `ROUND_END` event carries a `keyframe` field, the Reader MUST snap its running state to that keyframe. This design allows:

1. **Random access**: jump to any round boundary in O(1) by loading the keyframe.
2. **Integrity checking**: verify that the incremental fold equals the keyframe (§11).
3. **Recovery**: if events between keyframes are corrupted or missing, the keyframe provides a clean restart point.

---

## 9. Determinism

The `Seed` header tag, combined with the `p1DeckOrder`/`p2DeckOrder` arrays in the INIT record, provides enough information for a compatible engine to re-execute the game and produce the same sequence of random outcomes.

Deterministic replay from seed SHOULD be supported by conforming engines but:

- Readers MUST NOT rely on deterministic re-execution for archival state reconstruction. The fold (§8) is sufficient and engine-independent.
- Seed-based replay is OPTIONAL and is provided for analysis purposes (e.g., exploring alternative lines).
- Determinism guarantees apply only within a "contemporary engine" — an engine version close to the one that recorded the file. Engine upgrades that change game logic may break seed-based replay even for the same `Seed` value.

---

## 10. Annotations

### 10.1 ANNOTATIONS Section Records

Each record in the `%%% ANNOTATIONS` section is an `Annotation`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ref` | string | Yes | The `seq` of the event being annotated. |
| `nag` | string | No | A NAG glyph (§10.2). |
| `text` | string | No | Free-form annotation text. |
| `by` | string | No | Pseudonymous author identifier. MUST NOT be a real username. |
| `line` | array of GameEvent | No | An engine-free variation line: an ordered array of hypothetical events that branch from the annotated position. |

No additional properties are permitted (`additionalProperties: false`).

### 10.2 NAG Glyph Table

The following NAG glyphs are defined for SWU-PGN, derived from chess annotation conventions:

| Glyph | Meaning |
|-------|---------|
| `!` | Good move / strong play |
| `?` | Mistake |
| `!!` | Brilliant move |
| `??` | Blunder |
| `!?` | Interesting move (speculative) |
| `?!` | Dubious move |

Additional glyphs MAY be used; unrecognized glyphs SHOULD be treated as unclassified annotation markers.

### 10.3 Append-Only Semantics

Annotations MUST only be appended to the `%%% ANNOTATIONS` section. Existing annotation records MUST NOT be modified or deleted. This append-only guarantee enables multi-author annotation workflows where multiple parties can independently add analysis without conflicting edits.

### 10.4 Variation Lines

The `line` field carries an array of hypothetical `GameEvent` objects representing an alternative sequence branching from the annotated position. These events are engine-free: they describe what might have happened, not what did happen. A Reader MUST NOT apply variation line events to the main game fold. Variation lines may themselves be folded independently to explore the hypothetical state.

---

## 11. Completeness Contract

### 11.1 Producer Obligations

Every change to observable game state MUST be represented by at least one event record whose delta accounts for that change. A Producer MUST NOT:

- Batch multiple distinct state mutations into a single event unless the event type's semantics explicitly represent that batch (e.g., `DRAW` with `count > 1`).
- Omit events for state changes that are visible to either player.
- Emit events with incorrect delta fields (e.g., a `DAMAGE` event with an `hp` value that does not match the resulting base HP).

### 11.2 `checkKeyframes()` Verification

Before emitting a file, a Producer MUST call `checkKeyframes(events)` and verify that `result.ok === true`. The `checkKeyframes` function:

1. Begins with `emptyState()`.
2. Folds forward through all events using `reduce()`.
3. At each `ROUND_START` or `ROUND_END` event that carries a `keyframe` field:
   - Compares the running folded state against the keyframe.
   - Records any mismatches as `KeyframeMismatch` objects.
   - Snaps to the keyframe and continues.
4. Returns `{ ok: boolean, mismatches: KeyframeMismatch[] }`.

A `ConformanceReport` with `valid: false` and mismatches MUST be treated as a fatal error by the Producer.

Note: the current implementation of `diff()` in `integrity.ts` checks only `players[seat].baseHp` against each keyframe. Future versions MAY extend this check to cover additional fields.

---

## 12. Rendering

### 12.1 Overview

A Reader-render translates the event stream into a human-readable narrative. The narrative is line-oriented text. Rendering is deterministic given the same event stream and card name resolver.

### 12.2 Structure

The output consists of:

- **Round banners**: emitted for `ROUND_START` events.
- **Phase banners**: emitted for `PHASE_START` events.
- **Numbered top-level actions**: emitted for the subset of events classified as top-level actions.
- **Unnumbered sub-event lines**: emitted for events that are consequences of a top-level action.
- **Blank lines**: emitted before and after round banners for visual separation.

### 12.3 Top-Level Actions

The following event types are classified as top-level actions (they receive a sequential action number):

- `PLAY`
- `PLAY_EVENT`
- `PLAY_UPGRADE`
- `PLAY_SMUGGLE`
- `DEPLOY_LEADER`
- `ATTACK`
- `PASS`
- `CLAIM_INITIATIVE`

### 12.4 Action Numbering

The action counter resets to 0 on each `ROUND_START` and each `PHASE_START`. Each top-level action increments the counter and is prefixed with `N. ` (e.g., `1. `, `2. `).

### 12.5 Normative Per-Event Render Strings

The following table gives the exact rendering string for each event type. `nm(id)` resolves a card identifier to its display name. `who(p)` returns `"Player 1"` for seat 1 and `"Player 2"` for seat 2.

| Event `t` | Render Output |
|-----------|---------------|
| `ROUND_START` | Banner: `""` + `"═══ ROUND {round} ═══"` + `""` (three output lines); reset action counter |
| `PHASE_START` | Banner: `"─── {phase} ───"`; reset action counter |
| `PLAY` | `"{who(p)} plays {nm(card)}{' to ' + zone if zone present}{' (cost N)' if cost present}"` |
| `PLAY_UPGRADE` | Same format as `PLAY` |
| `PLAY_SMUGGLE` | Same format as `PLAY` |
| `PLAY_EVENT` | `"{who(p)} plays {nm(card)}{' (cost N)' if cost present}"` (no zone suffix) |
| `DEPLOY_LEADER` | `"{who(p)} deploys {nm(card)}{' to ' + zone if zone present}"` |
| `ATTACK` | If `defenderType === "base"`: `"{who(p)} attacks {who(opponent)}'s base with {nm(atk)}"`. Otherwise: `"{who(p)} attacks {nm(def)} with {nm(atk)}"` |
| `PASS` | `"{who(p)} passes"` |
| `CLAIM_INITIATIVE` | `"{who(p)} claims initiative and passes"` |
| `DAMAGE` | If `tgt` starts with `"base@"`: `"{nm(src)} deals {amt} damage to Player {tgt.slice(5)}'s base ({hp} remaining HP)"`. Otherwise: `"{nm(src)} deals {amt} damage to {nm(tgt)} ({hp} remaining HP)"` |
| `HEAL` | If `tgt` starts with `"base@"`: `"{amt} damage healed from Player {tgt.slice(5)}'s base ({hp} remaining HP)"`. Otherwise: `"{amt} damage healed from {nm(tgt)} ({hp} remaining HP)"` |
| `DEFEAT` | `"{nm(card)} is defeated{' by ' + nm(defeatedBy) if defeatedBy present}"` |
| `EXHAUST` | `"{nm(card)} is exhausted"` |
| `READY` | `"{nm(card)} is readied"` |
| `OVERWHELM` | `"{amt} Overwhelm damage dealt to {who(opponent)}'s base ({hp} remaining HP)"` where opponent is `p === 1 ? 2 : 1` |
| `DRAW` | `"{who(p)} draws {count} card{s if count != 1}: {nm(cards[0])}, {nm(cards[1])}, ..."` |
| `RESOURCE` | `"{who(p)} resources {nm(card)}"` |
| `REVEAL` | `"{who(p)}'s {zone} revealed: {nm(cards[0])}, {nm(cards[1])}, ..."` |
| `SEARCH` | If `found` is present: `"{who(p)} finds {nm(found[0])}, ..."`. Otherwise: `"{who(p)} searches their deck"` |
| `CREATE_TOKEN` | `"{who(p)} creates {nm(token)} in {zone}"` |
| `MULLIGAN` | `"{who(p)} mulligans"` |
| `KEEP_HAND` | `"{who(p)} keeps their hand"` |
| `TRIGGER` | `"{nm(card)} triggers"` |
| `GAME_END` | If `winner === "Draw"`: `"Game ends in a draw ({reason})"`. Otherwise: `"{who(winner)} wins ({reason})"` |
| `CHOICE` | *(renders nothing — `null`)* |
| `PHASE_END` | *(renders nothing — `null`)* |
| `ROUND_END` | *(renders nothing — `null`)* |
| `SHUFFLE` | *(renders nothing — `null`)* |
| `MODAL_CHOICE` | *(renders nothing — `null`)* |
| `ABILITY_ACTIVATE` | *(renders nothing — `null`)* |
| `DISCARD` | *(renders nothing — `null`)* |
| `MOVE` | *(renders nothing — `null`)* |
| `CAPTURE` | *(renders nothing — `null`)* |
| `RESCUE` | *(renders nothing — `null`)* |
| `TAKE_CONTROL` | *(renders nothing — `null`)* |
| `SHIELD_GAIN` | *(renders nothing — `null`)* |
| `SHIELD_USE` | *(renders nothing — `null`)* |
| `EXPERIENCE_GAIN` | *(renders nothing — `null`)* |
| `STATUS_TOKEN` | *(renders nothing — `null`)* |

Note on opponent resolution for `ATTACK` and `OVERWHELM`: the opponent seat is computed as `p === 1 ? 2 : 1`.

Note on base references in `DAMAGE` and `HEAL`: the player number is extracted by taking the substring from index 5 of the `tgt` string (`tgt.slice(5)`, i.e., everything after the literal `"base@"`).

### 12.6 Output Assembly

Events are iterated in order. For each event:

1. If `ROUND_START`: push `""`, `"═══ ROUND {round} ═══"`, `""` to output; reset counter.
2. If `PHASE_START`: push `"─── {phase} ───"` to output; reset counter.
3. Otherwise: call `line(event)`. If `null`, skip. If not `null` and the event is a top-level action, increment counter and push `"{counter}. {text}"`. If not `null` and not a top-level action, push `"{text}"` (unnumbered).

The final output is the output array joined with `"\n"`.

---

## 13. Security and Privacy Considerations

### 13.1 Player Identification

SWU-PGN files MUST NOT contain real player usernames, account IDs, email addresses, IP addresses, or any other directly identifying information.

- `P1Id` and `P2Id` MUST be of the form `sha256:<salted-hex>`: a SHA-256 hash of the real player identifier concatenated with a server-side salt. The salt MUST be kept secret and MUST NOT be embedded in the file.
- `P1` and `P2` MUST use generic display labels such as `"Player 1"` and `"Player 2"`.
- The `by` field in annotations MUST use a pseudonymous identifier.

### 13.2 Stability and Non-Reversibility

The salted hash in `P1Id`/`P2Id` is:

- **Stable**: the same player always produces the same hash given the same server-side salt, enabling cross-game correlation.
- **Non-reversible**: without knowledge of the salt and the original identifier, the hash cannot be reversed to the real identity.
- **Not globally unique**: different salts (e.g., different server deployments) will produce different hashes for the same player.

### 13.3 Perspective and Hidden Information

When `Perspective` is set to `P1` or `P2`, the file was recorded from that player's point of view. Hidden-zone information for the opponent (e.g., opponent's hand contents) SHOULD be absent or anonymized. Omniscient archives (`Perspective: null`) MUST only be generated by trusted backend systems with access to all game state.

### 13.4 PII Scan

Producers MUST perform a PII scan on all string fields before emitting a file. The scan SHOULD check for patterns matching email addresses, URLs with usernames, common username formats, and other identifiable strings. A failed scan MUST prevent file emission.

### 13.5 Spectators

Spectator identifiers MUST NOT appear in any field of a SWU-PGN file.

---

## 14. Versioning and Evolution

### 14.1 Version Identifier

The format version is encoded in the `Game` header tag as `"SWU-PGN/MAJOR.MINOR"`. This document specifies version `1.1`.

### 14.2 SemVer Rules

- **MAJOR** increment: backwards-incompatible changes to the file grammar, the fold semantics, or the required header tags. Readers MUST reject files with a different major version.
- **MINOR** increment: backwards-compatible additions (new optional header tags, new optional event fields, new event `t` values). Readers MUST accept files with a higher minor version within the same major version.

### 14.3 Unknown Tags and Events

A conforming Reader:

- MUST accept and ignore unknown header tag names (the header schema sets `additionalProperties: true`).
- MUST accept and ignore unknown event `t` values. Unknown events MUST be treated as pure-log no-ops (no state delta). The Reader SHOULD emit a warning indicating the unknown event type.
- MUST NOT throw an error for unknown `t` values. The `validate()` function issues warnings (not errors) for unknown event types.

This forward-compatibility guarantee enables new event types to be introduced in minor versions without breaking existing readers.

---

## 15. Media Type

**MIME type:** `application/vnd.swu-pgn`  
**File extension:** `.swupgn`  
**Encoding:** UTF-8  
**Line endings:** LF (CR+LF tolerated)

The MIME type is not yet registered with IANA. Producers and Readers SHOULD use `application/vnd.swu-pgn` for HTTP Content-Type and Accept headers when transferring `.swupgn` files.

---

## 16. Test Vectors

The directory `swupgn/test-vectors/` in the reference implementation repository contains **normative test vectors**. These vectors are part of the specification: a conforming implementation MUST produce outputs that match them exactly.

### 16.1 Vector Format

Each vector consists of three files sharing a base name:

| Extension | Contents |
|-----------|----------|
| `.swupgn` | The input SWU-PGN file |
| `.fold.json` | The expected `ReducedState` output of `fold(events)` |
| `.render.txt` | The expected output of `render(doc, nameResolver)` |

### 16.2 Conformance Check

A Reader-fold implementation is conformant if, for each vector:

1. `parse(readFile(vector.swupgn))` succeeds without error.
2. `validate(doc)` returns `{ valid: true, issues: [] }` (or issues of severity `"warning"` only).
3. `JSON.stringify(fold(doc.events))` (after canonical normalization) equals the contents of `vector.fold.json`.

A Reader-render implementation is conformant if, for each vector:

1. Steps 1-2 above pass.
2. `render(doc, nameResolver)` equals the contents of `vector.render.txt`.

### 16.3 Available Vectors

| Base name | Description |
|-----------|-------------|
| `minimal` | A single-round game fragment covering PLAY, ATTACK, DAMAGE, and EXHAUST events. |

---

## Appendix A: Worked Example

This appendix embeds the `minimal` test vector in full. This content is normative: a conforming implementation must reproduce the `.fold.json` and `.render.txt` outputs from the `.swupgn` input.

### A.1 Input File (`minimal.swupgn`)

```
[Game "SWU-PGN/1.1"]
[GameId "vector-minimal"]
[Date "2026-06-16T00:00:00Z"]
[Format "Premier"] [CardPool "SOR"] [Engine "forceteki@reference"]
[Seed "0"] [Perspective "P1"]
[P1Id "sha256:aaaa"] [P2Id "sha256:bbbb"] [P1 "Player 1"] [P2 "Player 2"]
[P1Leader "SOR#010"] [P1Base "SOR#028"] [P2Leader "SOR#005"] [P2Base "SOR#020"]
[Result "Incomplete"] [Reason "Sample"] [Rounds "1"]

%%% DECKS
{"p":1,"leader":"SOR#010","base":"SOR#028","deck":[["SOR#108",3]]}
{"p":2,"leader":"SOR#005","base":"SOR#020","deck":[["SOR#045",3]]}

%%% SETUP
{"seq":"R1.S.0","t":"INIT","p1DeckOrder":["SOR#108"],"p2DeckOrder":["SOR#045"]}

%%% EVENTS
{"seq":"R1.start","t":"ROUND_START","round":1}
{"seq":"R1.A.start","t":"PHASE_START","phase":"action"}
{"seq":"R1.A.1","t":"PLAY","p":1,"card":"SOR#108","zone":"ground","cost":2}
{"seq":"R1.A.2","t":"ATTACK","p":1,"atk":"SOR#108","def":"base","defenderType":"base"}
{"seq":"R1.A.2a","t":"DAMAGE","src":"SOR#108","tgt":"base@2","amt":2,"damageType":"combat","hp":28}
{"seq":"R1.A.2b","t":"EXHAUST","card":"SOR#108"}

%%% ANNOTATIONS
{"ref":"R1.A.2","nag":"?!","text":"attacking the base too early"}
```

### A.2 Expected Folded State (`minimal.fold.json`)

```json
{
  "round": 1,
  "phase": "action",
  "initiative": null,
  "players": {
    "1": { "seat": 1, "baseHp": 30, "baseMaxHp": 30, "handSize": 0, "hand": [], "resourcesReady": 0, "resourcesExhausted": 0, "credits": 0, "hasForce": false, "discard": [],
           "cards": [ { "id": "SOR#108", "zone": "ground", "damage": 0, "exhausted": true, "upgrades": [], "shields": 0, "experience": 0, "statusTokens": {} } ] },
    "2": { "seat": 2, "baseHp": 28, "baseMaxHp": 30, "handSize": 0, "hand": [], "resourcesReady": 0, "resourcesExhausted": 0, "credits": 0, "hasForce": false, "discard": [], "cards": [] }
  }
}
```

### A.3 Expected Rendered Output (`minimal.render.txt`)

```

═══ ROUND 1 ═══

─── action ───
1. Player 1 plays SOR#108 to ground (cost 2)
2. Player 1 attacks Player 2's base with SOR#108
SOR#108 deals 2 damage to Player 2's base (28 remaining HP)
SOR#108 is exhausted
```

### A.4 Walkthrough

1. **Header parsing**: The parser extracts all tag-value pairs from lines beginning with `[`. Multiple tags on one line (e.g., `[Format "Premier"] [CardPool "SOR"] [Engine "forceteki@reference"]`) are parsed in a single pass using the `/\[([A-Za-z0-9]+)\s+"((?:[^"\\]|\\.)*)"\]/g` regex.

2. **DECKS section**: Two `DeckRecord` objects are parsed. Player 1 has three copies of `SOR#108`; Player 2 has three copies of `SOR#045`.

3. **SETUP section**: The `INIT` record establishes deck order. `p1DeckOrder: ["SOR#108"]` indicates the top card of Player 1's deck.

4. **EVENTS section, fold trace**:
   - `ROUND_START {round:1}` → `state.round = 1`
   - `PHASE_START {phase:"action"}` → `state.phase = "action"`
   - `PLAY {p:1, card:"SOR#108", zone:"ground"}` → append `{id:"SOR#108", zone:"ground", damage:0, exhausted:false, upgrades:[], shields:0, experience:0, statusTokens:{}}` to `players[1].cards`
   - `ATTACK` (pure-log) → no state change
   - `DAMAGE {tgt:"base@2", amt:2, hp:28}` → `players[2].baseHp = 28`
   - `EXHAUST {card:"SOR#108"}` → `players[1].cards[0].exhausted = true`

5. **ANNOTATIONS section**: One annotation references `R1.A.2` (the ATTACK event) with NAG `?!` ("dubious move") and explanatory text.

6. **Render trace**:
   - `ROUND_START` → `""`, `"═══ ROUND 1 ═══"`, `""`; counter reset to 0
   - `PHASE_START` → `"─── action ───"`; counter reset to 0
   - `PLAY` (top-level) → counter=1; `"1. Player 1 plays SOR#108 to ground (cost 2)"`
   - `ATTACK` (top-level) → counter=2; `"2. Player 1 attacks Player 2's base with SOR#108"`
   - `DAMAGE` (sub-event) → `"SOR#108 deals 2 damage to Player 2's base (28 remaining HP)"`
   - `EXHAUST` (sub-event) → `"SOR#108 is exhausted"`
