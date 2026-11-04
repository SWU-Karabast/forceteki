# SWU-PGN 0.1: Star Wars: Unlimited game records

**Name:** SWU-PGN/0.1
**Status:** experimental 0.1, 2026-11-03
**Package:** `@swupgn/format` 0.1.0. This document is the package's `SPEC.md`. The package also holds
the JSON Schema (`schema/swupgn.schema.json`), the registries (`registry/*.json`) and the
conformance vectors (`vectors/`).
**Editors:** the SWU-PGN editors
**Feedback:** an issue or pull request on the package's source repository, with `SWU-PGN` in its
title.

---

## Abstract

SWU-PGN is a plain-text format that records one game of the Star Wars: Unlimited trading card
game. A file holds a header of tag pairs, both decks, an index of card names, and an ordered
stream of JSON records. The records create, change and remove the things on the board, and mark
each point where the board is consistent. A reader rebuilds the board at any of those points by
applying the records in order. It needs no rules engine and no card database.

One game can be written three ways. A `full` file holds everything. A `perspective` file holds
only what one seat was allowed to know. A `public` file holds only what both seats knew. This
document defines the syntax, the records, how to apply them, and the one algorithm that turns a
`full` file into the other two.

## Status of this document

This is an **experimental** version, 0.1. Any later 0.x version MAY change anything in it,
including the meaning of a record. Implementations are invited to write and read 0.1 and to
report what is wrong with it.

When the format freezes, the frozen version will be **2.0**, not 1.0. The name 1.0 belongs to an
earlier pilot format that 0.x readers do not read ([Appendix C](#appendix-c-legacy-10-pilot-files-informative)).

## Licence

The text of this specification is licensed under the Creative Commons Attribution 4.0
International License (CC BY 4.0). The JSON Schema, the registries, the conformance vectors and
the software in the `@swupgn/format` package are licensed under the MIT License.

## Trademarks

Star Wars and related names are trademarks of Lucasfilm Ltd. Star Wars: Unlimited is published by
Fantasy Flight Games. This specification is an independent fan project. It is not affiliated
with, endorsed by or sponsored by Lucasfilm, Disney or Fantasy Flight Games. Card names and set
codes appear only to identify cards.

---

## Contents

1. [Introduction and terminology](#1-introduction-and-terminology)
2. [Conventions and conformance levels](#2-conventions-and-conformance-levels)
3. [Conformance classes](#3-conformance-classes)
4. [File syntax](#4-file-syntax)
5. [Header tags](#5-header-tags)
6. [Identifiers](#6-identifiers)
7. [Entities and the board](#7-entities-and-the-board)
8. [Records](#8-records)
9. [Applying](#9-applying)
10. [Visibility and profiles](#10-visibility-and-profiles)
11. [Redaction](#11-redaction)
12. [`DECKS` and `CARDS`](#12-decks-and-cards)
13. [Narrative: blocks and `STORY`](#13-narrative-blocks-and-story)
14. [Annotations](#14-annotations)
15. [Rendering (informative)](#15-rendering-informative)
16. [Privacy considerations](#16-privacy-considerations)
17. [Versioning and extensibility](#17-versioning-and-extensibility)
18. [Media type and file extension](#18-media-type-and-file-extension)
19. [Conformance suite](#19-conformance-suite)
20. [Security considerations](#20-security-considerations)
21. [Error model](#21-error-model)
22. [Registries](#22-registries)
23. [Open issues](#23-open-issues)
24. [References](#24-references)

Appendices:
[A. Example](#appendix-a-example-informative) ·
[B. Grammar (ABNF)](#appendix-b-grammar-abnf) ·
[C. Legacy 1.0 pilot files](#appendix-c-legacy-10-pilot-files-informative) ·
[D. Acknowledgements](#appendix-d-acknowledgements-informative)

---

## 1. Introduction and terminology

A `.swupgn` file is a text file that records one game of Star Wars: Unlimited. Chess has PGN; this
is the same idea for SWU.

The file describes the board, not the rules. Every change to the board is a record, and no
record's meaning depends on a game rule. So a reader can rebuild the board at any recorded moment
without knowing the rules and without a card database. A reader can also tell the game as a
story, from narrative records that sit beside the board records but never change the board.

The format covers the two-player game. Multiplayer formats are out of scope.

- **[W-01]** A writer MUST NOT write a game with more than two players.

### 1.1 Terminology

| Term | Means |
|---|---|
| **file** | One `.swupgn` document. It records one game. |
| **seat** | Player 1 or Player 2. Written `1` or `2` in records, `"p1"` or `"p2"` as an entity id, and `P1` or `P2` in the header. |
| **entity** | Anything on the board a reader tracks: a card outside a deck, a token, a base, a leader, a lasting or delayed effect, the game, or a seat ([§7](#7-entities-and-the-board)). |
| **entity id** | An entity's name in one file: a positive integer, or one of the reserved strings `"g"`, `"p1"`, `"p2"` ([§6.2](#62-entity-ids)). |
| **identity** | Which card an entity is, written as a card id ([§6.1](#61-card-ids)). A file may hold an entity without its identity. |
| **attribute** | A named value on an entity, such as `damage` or `exhausted` ([§7.3](#73-attributes)). |
| **record** | One JSON object on one line of the `RECORDS` section ([§8](#8-records)). |
| **step** | A `step` record. It marks a point where the board is consistent: a decision point ([§8.2](#82-order-and-steps)). |
| **step group** | The records after one `step` up to and including the next `step`. One atomic change to the board. |
| **board** | The set of entities, with their fields and attributes, that applying the records gives ([§9](#9-applying)). |
| **profile** | Which hidden information a file holds: `full`, `perspective:1`, `perspective:2` or `public` ([§10](#10-visibility-and-profiles)). |
| **viewer** | The seat a `perspective` file is written for. A `public` file has no viewer. |
| **audience** | The seats that know an entity's identity: `"all"`, or a list of seats ([§10.2](#102-audience-and-knowledge)). |
| **known** | An entity whose identity the viewer knows. |
| **anonymous** | An entity the viewer can see and track but whose identity the viewer does not know, such as an opponent's resource. |
| **unmaterialized** | An entity the viewer cannot track at all, such as a card in the opponent's hand. A file written for that viewer holds no entity for it. |
| **writer, reader** | A program that makes files; a program that reads them. Every class of [§3](#3-conformance-classes) other than the writer, the annotator and the host is a reader. |
| **in an arena** | In the `ground` or `space` zone. |

---

## 2. Conventions and conformance levels

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT",
"RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as
described in BCP 14 [[RFC2119](#24-references)] [[RFC8174](#24-references)] when, and only when,
they appear in all capitals, as shown here.

**What is normative.** This text is normative, and so are the JSON Schema
(`schema/swupgn.schema.json`), the registries (`registry/*.json`) and the conformance vectors
(`vectors/`). The registry tables in this document are generated from the registry files. If the
text, the schema, a registry file or a vector disagree, the disagreement is an erratum; until it
is corrected, this text governs.

**What is informative.** Examples, the appendices whose heading says "(informative)", and any
block that begins `> **Note (informative):**` are informative, wherever they appear.

> **Note (informative):** A note like this one explains why a rule exists. It never adds a rule.

**Requirement ids.** Each requirement that a conformance class must meet, and that the
conformance suite can check, has an id such as `[W-01]`. The letter is the class:

| Letter | Class |
|---|---|
| **W** | Writer |
| **P** | Parser |
| **A** | Applier |
| **R** | Redactor |
| **V** | Validator |
| **H** | Host |

Requirements on a renderer, an annotator or a consumer are stated in prose and carry no id.

### 2.1 Document conformance levels

A file is at one of three levels. Each level includes the one before it.

| Level | A file at this level… | Checked by |
|---|---|---|
| **malformed** | does not parse: it breaks the syntax of [§4](#4-file-syntax) and [Appendix B](#appendix-b-grammar-abnf), or exceeds a reader's limits ([§20](#20-security-considerations)). | a parser |
| **well-formed** | parses. It may still break the schema or a rule that spans records. | a parser |
| **valid** | is well-formed, and a validator finds no issue of severity `error` in it ([§9.5](#95-what-a-validator-checks)). | a validator |

Each issue a reader can find has a code and a severity ([§21](#21-error-model)). A `fatal` issue
makes the file malformed. An `error` issue makes it at most well-formed. A `warning` does not
change the level.

---

## 3. Conformance classes

There are nine classes. One program may implement several.

| Class | Does | Produces | Accepts |
|---|---|---|---|
| **Writer** | Records a game. | valid files | — |
| **Parser** | Reads the syntax into a header, sections and records. | a parsed file, or one fatal issue | any input |
| **Validator** | Says how good a file is. | a level and a list of issues | any input |
| **Applier** | Applies records to a board ([§9](#9-applying)). | a board | every well-formed file |
| **Redactor** | Turns a `full` file into a `perspective` or `public` file ([§11](#11-redaction)). | a valid file of the asked profile | every valid `full` file |
| **Renderer** | Tells the game as text ([§15](#15-rendering-informative)). | prose | every well-formed file |
| **Annotator** | Adds notes to a file ([§14](#14-annotations)). | the file with notes added | every well-formed file |
| **Consumer** | Uses boards and files: a replay viewer, a stats site, a deck tracker. | — | every valid file |
| **Host** | Runs games and gives files to people ([§10.1](#101-the-visibility-header)). | — | — |

A writer's requirements carry `W` ids, and so on as in [§2](#2-conventions-and-conformance-levels).
Each requirement is defined in the section that explains it. The requirements of a class are the
ones with its letter, throughout this document.

- **[W-02]** A writer MUST produce valid files ([§2.1](#21-document-conformance-levels)).
- **[P-01]** A parser MUST accept every well-formed file.
- **[A-01]** An applier MUST build the board from the records alone. It MUST NOT need a card database or a rules engine to do so.

A consumer SHOULD tell its user when a file is not valid, when its `WriterErrors` tag is above
zero, or when its `Engine` tag marks a development build or unknown provenance
([§5.3](#53-provenance-engine-and-seed)).

---

## 4. File syntax

A `.swupgn` file is UTF-8 text [[RFC3629](#24-references)] in lines.

- **[W-03]** A writer MUST write UTF-8, MUST end each line with `\n` (LF), MUST end the file with `\n`, and MUST NOT begin the file with a byte order mark.
- **[P-02]** A parser MUST strip a leading byte order mark, MUST accept `\r\n` line ends, and MUST accept a file whose last line has no line end.

Blank lines are ignored everywhere except inside `STORY`. The grammar is in
[Appendix B](#appendix-b-grammar-abnf).

A file has a header and then sections:

```
[Game "SWU-PGN/0.1"]      ← the header: every [ ] line comes first
[Visibility "full"]
[Steps "decision"]
…

%%% STORY                 ← the game as prose for a human. Plain text, not JSON.
 1. Player 1 plays Wampa to ground

%%% DECKS                 ← every other banner is followed by NDJSON
{…}

%%% CARDS
{…}

%%% RECORDS
{…}

%%% ANNOTATIONS
{…}
```

| Section | Contents | Required |
|---|---|---|
| `STORY` | the game as prose ([§13.3](#133-story)) | no |
| `DECKS` | what each seat brought ([§12.1](#121-decks)) | yes |
| `CARDS` | card id to display name ([§12.2](#122-cards)) | no |
| `RECORDS` | the board records and the narrative records ([§8](#8-records)) | yes |
| `ANNOTATIONS` | notes added after the game ([§14](#14-annotations)) | no |

- **[W-04]** A writer MUST write a `DECKS` and a `RECORDS` section.

### 4.1 The header lines

- **[W-05]** The first line of the file MUST be the `Game` tag, alone on its line: `[Game "SWU-PGN/0.1"]`.
- **[P-03]** A parser whose first non-blank line is not a `Game` tag naming `SWU-PGN/<major>.<minor>` MUST reject the input (`not-swupgn`). An empty input is rejected the same way.

Every header line starts with `[` and holds one or more `[Tag "Value"]` pairs separated by
spaces. A writer SHOULD write one tag per line.

- **[P-04]** A parser MUST reject a header line that holds anything other than tag pairs (`bad-header-line`). It MUST NOT skip the line, because a skipped fragment can be half of a tag.
- **[P-05]** Values are in double quotes. The only escapes are `\"` (a quote) and `\\` (a backslash). A parser MUST reject any other backslash in a value (`bad-escape`). A value cannot hold a line break.
- **[P-06]** A parser MUST reject a file in which a tag appears twice (`duplicate-tag`).

Tag names are ASCII letters and digits, and are case-sensitive. All header lines come before the
first banner. Inside a section, a line that starts with `[` is not a header line.

- **[P-07]** A parser MUST reject a non-blank line that is neither a header line nor a banner and comes before the first banner (`record-outside-section`).

### 4.2 The section banners

A banner is a line that starts with `%%%`, then the section name. The name is case-insensitive: a
parser compares it in upper case. This version defines five sections: `STORY`, `DECKS`, `CARDS`,
`RECORDS`, `ANNOTATIONS`.

- **[P-08]** A parser MUST reject a file in which two banners name the same section (`duplicate-section`).
- **[P-09]** A parser MUST skip every line of a section whose name this version does not define, up to the next banner, without parsing it. Its lines need not be JSON.

### 4.3 The record lines

Every non-blank line in `DECKS`, `CARDS`, `RECORDS` and `ANNOTATIONS` is one JSON object
[[RFC8259](#24-references)] on one line (NDJSON).

- **[W-06]** A writer MUST write each line of those sections as one JSON object that is I-JSON [[RFC7493](#24-references)]: no object repeats a key, and every number is an integer within ±(2^53−1).
- **[P-10]** A parser MUST reject a file in which a line of those sections is not JSON (`bad-json`), or repeats a key within one object (`duplicate-key`). One bad line rejects the whole file.

A validator, not a parser, reports a line that is JSON but not an object (`not-object`) and a
number that is not an integer within ±(2^53−1) (`number-range`).

> **Note (informative):** Common JSON parsers keep the last of two equal keys and others keep the
> first, so two readers would apply a repeated key differently. That is why a repeated key is
> fatal rather than an error.

`STORY` is prose.

- **[P-11]** A parser MUST NOT parse `STORY` lines as JSON, and MUST keep them verbatim, blank lines inside the prose included. It drops only the blank lines at the very start and end of the section.

### 4.4 When to reject a file

- **[P-12]** A parser that finds a fatal issue MUST reject the whole file, MUST NOT return part of it, and MUST report the issue's code and the 1-based line number where it was found, as [§21](#21-error-model) defines it for an issue that no one line holds (`missing-tag`).

Messages that go with a code are free text. They are not part of this specification, and a
program MUST NOT match them.

### 4.5 Canonical form

The canonical form fixes every order that the format leaves free, so that two writers can
produce the same bytes for the same game.

- **[W-07]** A writer SHOULD write the canonical form:
  - header tags in this order: `Game`, `Visibility`, `Steps`, then the remaining tags of [§5](#5-header-tags) in the order of [§5.4](#54-tag-order), then unknown tags in ascending order of their names (compared by code point);
  - sections in this order: `STORY`, `DECKS`, `CARDS`, `RECORDS`, `ANNOTATIONS`, then unknown sections in the order they were read;
  - every JSON string written with every character as itself (non-ASCII included, `/` not escaped), except `"` as `\"`, `\` as `\\`, and U+0000 to U+001F as `\b`, `\t`, `\n`, `\f`, `\r` where JSON has a short escape and otherwise as `\u00XX` with lower-case hex digits; every number in its shortest form, with no exponent, sign `+` or fraction for an integer;
  - every JSON line with no whitespace outside strings, and with its keys in the order its schema lists its properties. For records, `t` comes first, and then:
    - `create`: `e`, `zone`, `owner`, `controller`, `parent`, `rel`, `card`, `to`, `a`
    - `set`: `e`, `zone`, `owner`, `controller`, `parent`, `rel`, `a`
    - `remove`: `e`
    - `reveal`: `e`, `card`, `to`
    - `step`: `seq`, `ms`
    - `block`: `id`, `kind`, `p`, `src`, `targets`, `options`, `amount`, `parent`, `via`, `group`, `text`
  - every `a` object (in a `create`, a `set`, or a board) with its keys in the order of the attribute registry (`registry/attributes.json`), then every unregistered name in ascending order of code points; a `create` with no attributes has no `a` key, never `"a":{}`;
  - `DECKS` lines with keys `p`, `leaders`, `base`, `complete`, `main`, `sideboard`, `order`, one line per seat, seat 1 first; `CARDS` lines with keys `id`, `name`, `backSideName`; annotation lines with keys `seq`, `text`, `nag`, `by`, `id`, `parent`;
  - this layout, line by line ([Appendix B.4](#b4-canonical-layout)):
    - UTF-8 with no byte order mark, every line ended by `\n` (LF) and none by `\r\n`, and no line ending in a space or tab;
    - the header first: one tag per line, written `[Tag "Value"]` with one space between the name and the opening quote and nothing else on the line, a value escaping only `"` and `\` ([P-05]), and no blank line among the header lines;
    - then each section: one blank line, the banner `%%% NAME` (three `%`, one space, the section name in upper case, nothing after it), then the section's lines;
    - in `DECKS`, `CARDS`, `RECORDS`, `ANNOTATIONS` and an unknown section, no blank line; in `STORY`, its lines as kept ([P-11]), with no blank line first or last;
    - no section that has no lines, except `DECKS` and `RECORDS`, which are always written ([W-04]);
    - the file ends with the `\n` of its last line: no blank line after it.
- **[P-13]** A reader MUST NOT depend on the order of header tags, of sections, or of keys within a JSON object. The one exception is that the `Game` tag is the first line ([W-05]).

The order of keys inside `a` follows the registry so that two programs that build the same
attributes write the same bytes; a redactor builds `a` objects of its own in steps 3 and 5
([R-03], [R-05]).

---

## 5. Header tags

Every value is a string in the file. Where this section gives a value a format, a value outside it
fails the schema (`schema`). Dates follow RFC 3339 [[RFC3339](#24-references)] with a seconds
field and an explicit offset, such as `2026-09-04T15:58:16.695Z`. A writer SHOULD use UTC (`Z`).
A count is base-10 digits with no sign, space or exponent.

### 5.1 Required tags

| Tag | Format | Holds |
|---|---|---|
| `Game` | `SWU-PGN/<major>.<minor>` | The format version. A 0.1 writer writes `SWU-PGN/0.1`. Always the first line. |
| `Visibility` | `full`, `perspective:1`, `perspective:2` or `public` | The file's profile ([§10](#10-visibility-and-profiles)). |
| `Steps` | `decision` or `event` | What a `step` record marks ([§8.2](#82-order-and-steps)). |
| `GameId` | 1 to 128 characters | A unique, opaque id for this game ([§16](#16-privacy-considerations)). |
| `Date` | RFC 3339 | When the game started. |
| `CardPool` | set codes joined by `,` | Which sets were legal, such as `"SOR,SHD,TWI"`. Each is a set code ([§6.1](#61-card-ids)). |
| `Engine` | `<product>@<build>` | Which build wrote the file ([§5.3](#53-provenance-engine-and-seed)). |
| `P1Id`, `P2Id` | `sha256:` and 64 lowercase hex digits | A pseudonymous id per player ([§16](#16-privacy-considerations)). |
| `P1`, `P2` | any | The name shown to humans. Generic: `"Player 1"`, `"Player 2"`. |
| `P1Leader`, `P2Leader` | card ids joined by `,` | The seat's leaders. One id, or two for a two-leader deck, in the order of the seat's `DECKS` `leaders`. |
| `P1Base`, `P2Base` | card id | The seat's base. |
| `Result` | `P1`, `P2`, `Draw` or `Incomplete` | Who won. Case-sensitive. A game that did not end is `Incomplete`. |
| `Reason` | any | How the game ended, in words, such as `"Base destroyed"`. An open vocabulary: show it, never branch on it. |
| `Rounds` | count | How many rounds were started. For an `Incomplete` game, the round it stopped in. |

- **[W-08]** A writer MUST write every tag of the table above, each in its format.
- **[P-14]** A parser MUST reject a file that lacks a tag of the table above (`missing-tag`).

### 5.2 Optional tags

| Tag | Format | Holds |
|---|---|---|
| `EndDate` | RFC 3339 | When the game ended. Absent for an unfinished game. |
| `Format` | any | The tournament format, such as `"premier"`. Case is not standardised. An open vocabulary. |
| `Match` | `sha256:` and 64 lowercase hex digits | An opaque id for the match (a series of games, such as a best of three) this game belongs to, the same for every game of the match. |
| `GameNumber` | count, 1 or more | Which game of that match this is. Meaningless without `Match`. |
| `Undos` | count | How many times a player took a decision back ([§8.2](#82-order-and-steps)). Absent means none. |
| `Seed` | any | The random seed the game ran on. `full` files only ([§5.3](#53-provenance-engine-and-seed)). |
| `WriterRevision` | count, 1 or more | Which revision of its writer produced the file. Scoped to the product named in `Engine`. Diagnostic only. |
| `WriterErrors` | count | How many changes the writer failed to record. Absent means none. |

- **[P-15]** A parser MUST accept and keep a header tag it does not know.
- **[P-16]** A parser MUST reject a file in which `Rounds`, or a present `Undos`, `GameNumber`, `WriterRevision` or `WriterErrors`, is not a count within ±(2^53−1) (`bad-count`).
- **[W-09]** A writer MUST NOT change what a record means through `WriterRevision`. A change of meaning needs a new version of the format ([§17](#17-versioning-and-extensibility)).
- **[W-10]** A writer that failed to record a change MUST write `WriterErrors` with the number of failures.

A file whose `WriterErrors` is above zero has a board that may be wrong between some steps.
A validator reports it (`writer-errors`, warning).

> **Note (informative):** A `WriterErrors` file can still be valid: every record in it may be
> well shaped. The tag says the writer knows it lost something, which no structural check can see.

The `Result` tag says the same thing as the game entity's `result` attribute at the last step
([§7.3](#73-attributes)): `P1` is `"p1"`, `P2` is `"p2"`, `Draw` is `"draw"`, and `Incomplete`
means the attribute is absent.

- **[W-11]** A writer MUST write a `Result` that agrees with `g.result` at the last step.

### 5.3 Provenance: `Engine` and `Seed`

- **[W-12]** `Engine` MUST name the one build that produced the file, as `<product>@<build>`: a release version, a commit, anything that names one build. A writer that names a build by a commit MUST add `-dirty` to a build from a tree with uncommitted changes (`examplewriter@7dd39a09-dirty`).
- **[W-13]** A writer that cannot name its build MUST write `<product>@unknown`.

A reader SHOULD treat a `-dirty` build as a development build, and an `@unknown` build as
untraceable.

`Seed` is optional.

- **[W-14]** A writer that writes `Seed` MUST write the seed the game's random number generator actually ran on.
- **[W-15]** A writer MUST NOT write `Seed` in a file whose `Visibility` is not `full`.

> **Note (informative):** With `Seed` and the starting deck orders of a `full` file
> ([§12.1](#121-decks)), a compatible rules engine can re-run the game. No reader of this format
> needs either: applying never uses the seed.

### 5.4 Tag order

The canonical order of the tags after `Game`, `Visibility` and `Steps` ([§4.5](#45-canonical-form)):
`GameId`, `Date`, `EndDate`, `CardPool`, `Engine`, `P1Id`, `P2Id`, `P1`, `P2`, `Result`,
`Reason`, `Rounds`, `Format`, `Match`, `GameNumber`, `Undos`, `P1Leader`, `P2Leader`, `P1Base`,
`P2Base`, `Seed`, `WriterRevision`, `WriterErrors`.

### 5.5 Timing: `ms`

There are no timestamps on records. There is one optional integer, `ms`, on `step` records only.
It is a duration, not a clock: the milliseconds from the header's `Date` to the moment the board
reached that step.

- **[W-16]** A writer that writes `ms` MUST write it only on `step` records, and the values MUST NOT decrease from one step to the next.

Applying ignores `ms`. It is a behavioural fingerprint ([§16](#16-privacy-considerations)), and a
writer MAY leave it out.

---

## 6. Identifiers

### 6.1 Card ids

A card id names a card's identity. It has one of these shapes:

| Shape | Means |
|---|---|
| `SET#NUM` | A printed card, such as `SOR#010`. |
| `TOKEN:<name>#<cardId>` | A token, such as `TOKEN:shield#8752877738`. |
| `TOKEN:<name>` | A token whose numeric card id the writer could not find. |

Two copies of one card are two entities with the same card id. A card id has no copy suffix.

**Where set codes and numbers come from.** The authority for every card id is the official
Star Wars: Unlimited card database published by Fantasy Flight Games [[SWU-Cards](#24-references)],
as it stood when the file was written.

- `SET` is the card's set code in upper case, from the set code registry ([§22](#22-registries)).
- `NUM` is the card's collector number in that set, in base 10, zero-padded to at least three digits: `SOR#010`, never `SOR#10`.
- A token's `<cardId>` is the token card's own numeric id in that database.

- **[W-17]** A card printed in more than one set may be written with any of its printings, but a writer MUST name a card by one id throughout one file.
- **[W-18]** A writer MUST write a variant printing (Hyperspace, Showcase, foil and the like) or a promotional printing as the standard printing it is a variant of.
- **[W-19]** A writer MUST write every token id with the `TOKEN:` prefix, and MUST write the form without `#<cardId>` only when it cannot find the numeric id. It MUST NOT write a non-numeric `<cardId>`.
- **[W-20]** A writer MUST derive a token's `<name>` from its English printed title: apply Unicode NFKD; delete every combining mark (U+0300 to U+036F); lowercase; delete every character that is not `a` to `z`, `0` to `9` or a space; trim; replace each run of spaces with one `-`. (`X-Wing` is `xwing`, `TIE Fighter` is `tie-fighter`.)

A card id that breaks the grammar of [Appendix B](#appendix-b-grammar-abnf) fails the schema
(`schema`). A card that the database does not list yet has no authority to name it; a writer
SHOULD use the id the card will have when it is published.

- **[P-17]** A reader MUST accept a well-formed card id it cannot resolve, and a set code it does not know.

Display names come from `CARDS` ([§12.2](#122-cards)), not from the id. A reader resolves a
token's art or data from its `<cardId>`, never from its `<name>`.

### 6.2 Entity ids

A card, token or effect entity's id is a positive integer. `"g"` (the game), `"p1"` and `"p2"`
(the seats) are reserved.

An entity id carries no information. A writer MAY use any scheme to choose its ids, and a
redactor renumbers every file it writes ([R-14]).

- **[W-21]** A writer MUST NOT reuse an entity id within a file. Once an entity is removed, its id is retired.
- **[W-22]** A card that leaves the board's tracked zones and later comes back (shuffled into the deck and drawn again, for instance) MUST be a new entity with a new id.

> **Note (informative):** Never reusing an id is what makes a `perspective` file safe: if a card
> kept its id through the deck, a viewer could link the card that went in to the card that came
> out. A writer whose game objects keep one identifier for their whole life can add a counter
> that goes up each time the card enters a deck.

> **Note (informative):** Ids are per file. The files of different profiles of one game do not
> share ids: entity 5 in one is unrelated to entity 5 in another, and a reader cannot join them
> by id. Each viewer's file gives an entity a new id where that viewer loses track of it
> ([§10.3](#103-what-a-viewer-can-track)), so ids shared across files would link exactly the moves
> each file hides. A view that holds both hands is the `full` file ([H-05]).

### 6.3 Block ids

A narrative block ([§13](#13-narrative-blocks-and-story)) has its own id, a positive integer.
Block ids and entity ids are separate: block 5 and entity 5 are unrelated.

- **[W-23]** A writer MUST give each block an id that is unique in the file and greater than the id of every block before it.

---

## 7. Entities and the board

### 7.1 What is an entity

An entity is anything on the board a reader tracks:

- every card outside a deck: in a hand, the resource row, an arena, the discard pile, the base zone, captured, or set aside
- every token (Shield, Experience, Advantage, Weakness, Beast, Credit and the like) while it exists
- every base and every leader
- every lasting or delayed effect
- the game (`"g"`) and the two seats (`"p1"`, `"p2"`)

A card in a deck is not an entity. A deck is the seat's `deckCount` attribute. One exception: a
deck card becomes a temporary entity in zone `deck` while someone looks at it or it is revealed
(a search, "look at the top card").

- **[W-24]** When a card enters a deck, a writer MUST remove its entity. When a temporary deck entity goes back unseen, or its deck is shuffled, the writer MUST remove it.
- **[W-25]** When a token leaves play, a writer MUST remove its entity.

`"g"`, `"p1"` and `"p2"` exist from the start of every file. They have attributes only: no zone,
owner, controller, parent or identity.

- **[W-26]** A writer MUST NOT write `zone`, `owner`, `controller`, `parent` or `rel` on a `set` of `"g"`, `"p1"` or `"p2"`.

### 7.2 Fixed fields

Every card, token and effect entity has these fields. They are not attributes.

| Field | Type | Means |
|---|---|---|
| `zone` | zone name | Where it is (the zone registry, [§22](#22-registries)). Absent for an effect. |
| `owner` | seat | Who owns it (CR 1.5.2). |
| `controller` | seat | Who controls it (CR 1.7). Absent means the owner. |
| `parent` | entity id | What it belongs to: the unit or base an upgrade is attached to, the unit or base holding a captured card, the vehicle a pilot is on. |
| `rel` | relation name | How it relates to `parent` (the relation registry, [§22](#22-registries)). |

An entity's identity is a separate field, `card`, set only by `create` and `reveal`
([§8](#8-records)).

- **[W-27]** An entity MUST have `rel` if and only if it has `parent`.
- **[W-28]** After each record applies, every entity that has a `parent` MUST have a parent that is in `ground`, `space` or `base`, and MUST have the same `zone` as its parent, or `captured` when its `rel` is `captured`. A writer that moves a unit into play and attaches something to it in one action writes the unit's `set` (or `create`) first.
- **[W-29]** A writer SHOULD leave `controller` absent when the controller is the owner.
- **[W-30]** Before a writer removes an entity, it MUST remove or detach every entity whose `parent` it is.

### 7.3 Attributes

Every other piece of state is an attribute in an entity's `a` object. The attribute registry
([§22](#22-registries)) gives each attribute a name, a type, a visibility class, the entities it
applies to, and its meaning.

**Types.** `bool`; `int` (may be negative); `count` (0 or more); `string`; `string[]`; `seat`
(`1` or `2`); `ref` (an entity id); `ref[]`; `object` and `object[]` (shape given in the
registry row). A type written `seat|null` may also be `null` in a `set`, which deletes it
([§9.2](#92-applying-each-record)).

**Visibility classes**, used by the redactor ([§11](#11-redaction)):

- `public`: may be shown for any entity whose identity the viewer knows, and is public game state
  while that identity is public.
- `identity`: shown only for an entity whose identity the viewer knows.
- An attribute name that is not in the registry, including every `x_` extension
  ([§17.2](#172-extensions)), is `identity`.

**Face-down attributes.** Of an anonymous entity ([§10.3](#103-what-a-viewer-can-track)) a viewer
sees only what a face-down card shows: the attributes whose registry row has `faceDown` `true`
(the "Face down" column of [§22.1](#221-attributes)). Only `exhausted` is face-down in this
version. An attribute that is not in the registry is never face-down.

> **Note (informative):** Treating an unregistered name as `identity` is an allow-list. An
> attribute nobody classified fails safe: it is dropped from every entity the viewer does not
> know.

> **Note (informative):** `power`, `hp`, `traits`, `keywords` and the like are `public` only while
> the card's identity is: they describe a card the viewer can read. On a face-down card they would
> name it (a resource with `power` 3 and `hp` 3 is not the one with `power` 2), so a redactor keeps
> only face-down attributes on an anonymous entity, whatever a writer left on the card.

**Kinds.** A card or token entity's `kind` attribute says what it is now: `unit`, `upgrade`,
`event`, `leader`, `base` or `token`. An effect entity has `kind` `effect`. A leader's `kind` stays
`leader` on either side, deployed or not, and while it is attached as a pilot: `deployed` and its
`parent` and `rel` say the rest.

**Effects.** A lasting or delayed effect is an entity with `kind` `effect` and no `zone`. Its
`controller` (or its `owner`, when `controller` is absent) is the seat that controls the effect.
Its `src` names the card whose ability created it, and its `targets` name what it applies to,
seats included (`"p1"`). Its `ability` attribute is the writer's id for the ability: for display,
never for branching.

- **[W-31]** A writer MUST create an entity for every lasting or delayed effect while it lasts, with `kind` `effect`, no `zone`, and a `to`, and MUST remove it when the effect ends. The effect's `to` MUST be the audience of its `src` card's identity when the effect is created ([§10.2](#102-audience-and-knowledge)): `"all"` when the source is public.

**Keeping attributes current.**

- **[W-32]** A writer MUST keep current every attribute it writes: once an attribute is written on an entity, the writer updates it whenever its value changes and deletes it when it no longer has one, so that at every step the board ([§9](#9-applying)) equals the writer's game state for every fixed field and every attribute the file holds. It never leaves one stale.
- **[W-62]** A writer SHOULD write `kind` for every card and token entity whose identity the file holds, and SHOULD write each other registered attribute that applies to an entity and that its game state holds.
- **[W-33]** Attributes whose value comes from effects (`power`, `hp`, `keywords`, `traits`, `blank` and the like) MUST hold the current value after every effect, not the printed one.

An absent attribute has no value in the file: either it has none in the game (`g.active` outside
the action phase), or the writer does not record it ([W-62] is a SHOULD).

### 7.4 What the board covers

Every part of the game state that the Comprehensive Rules define as game state is on the board.
This table says where. The attribute names are the registry's ([§22](#22-registries)).

| Game state | On the board |
|---|---|
| Round, phase, active seat, initiative and whether it was taken | `g` attributes `round`, `phase`, `active`, `initiative`, `initiativeTaken` |
| Who won | `g.result` |
| Deck and hand sizes | seat attributes `deckCount`, `handCount` |
| Credits and the Force | seat attributes `credits`, `force` |
| Each card's zone, owner and controller | the fixed fields `zone`, `owner`, `controller` |
| Damage, exhausted, current power and HP, keywords, traits | the same-named attributes |
| A base's remaining HP | `hp` − `damage` on the base entity |
| A base defeated without damage | the base's `defeated` |
| Upgrades on a unit or base, including tokens and Fortify upgrades | entities with that `parent` and `rel` `attached` |
| A pilot on a vehicle | an entity with that `parent` and `rel` `pilot` |
| Captured cards | entities with that `parent` (the captor) and `rel` `captured` |
| Leaders, deployed or not, either side up, two per seat or one | leader entities with `deployed`, `onStartingSide`, `exhausted`, `epicActionUsed` |
| A base's Epic Action | the base's `epicActionUsed` |
| Lasting and delayed effects | effect entities ([§7.3](#73-attributes)) |
| Limited-use abilities | `abilityUses` on the card |
| Lost abilities, an ability-made leader unit, a copy | `blank`, `leaderUnit`, `copyOf` |
| A resource entering exhausted | the resource entity's `exhausted` when it is created or moved there |
| An upgrade played with no legal host | the upgrade entity moved to `discard` |
| Who has seen a hidden card | the `to` of `create` and `reveal` ([§10.2](#102-audience-and-knowledge)) |
| A card named by an ability | a block of kind `name` with `text` ([§13](#13-narrative-blocks-and-story)) |
| Blind choices and simultaneous resolutions | blocks sharing a `group` |

> **Note (informative):** A leader whose deployed side is a different card (one that deploys as a
> Vehicle, for instance) is one entity. Its `CARDS` line carries the back side's name as
> `backSideName`, and its `deployed` attribute says which side is up.

---

## 8. Records

### 8.1 The record types

Every line in `RECORDS` is one JSON object with a `t` field. There are six types. Their exact
shapes are the `create`, `set`, `remove`, `reveal`, `step` and `block` definitions of the schema.

| `t` | Fields | Means |
|---|---|---|
| `create` | `e`, `zone`, `owner`, `controller`, `parent`, `rel`, `card`, `to`, `a` | A new entity. |
| `set` | `e`, then any of `zone`, `owner`, `controller`, `parent`, `rel`, `a` | Fields and attributes of an entity change. |
| `remove` | `e` | An entity leaves the board. Its id is retired. |
| `reveal` | `e`, `card`, `to` | An entity's identity becomes known to the seats in `to`. |
| `step` | `seq`, `ms` | The board is consistent here. |
| `block` | see [§13](#13-narrative-blocks-and-story) | What happened. It never changes the board. |

**`create`.** `e` is a positive integer. `zone` is required except for an effect. `owner` is
required. `parent` and `rel` come together. `card` is a card id; a `create` without `card` is an
entity whose identity this file does not hold. `to` is `"all"` or a list of seats (`[1]`, `[2]`,
`[1,2]`); a `create` with `card` and no `to` has `to` `"all"`. `a` holds the starting attributes.

**`set`.** `e` is any entity id, `"g"`, `"p1"` and `"p2"` included. Each field present overwrites
that field. In `a`, each key overwrites that attribute, and a value of `null` deletes it.
`controller: null` means the controller is the owner again. `parent: null` detaches the entity.

- **[W-34]** A `set` with `parent: null` MUST carry `rel: null`.
- **[W-35]** A `set` whose `parent` is not `null` MUST also carry a `rel` that is not `null`, even when the relation is unchanged.

**`reveal`.** `card` is the entity's identity, and the seats in `to` now know it.

**`step`.** `seq` counts the steps ([§8.2](#82-order-and-steps)). `ms` is optional ([§5.5](#55-timing-ms)).

**`block`.** A narrative record ([§13](#13-narrative-blocks-and-story)). A reader that ignores
every block still applies the board correctly.

- **[W-36]** In `a`, a writer MUST write registered attributes with their registry type, and MUST write `null` only in a `set`, to delete an attribute.

### 8.2 Order and steps

- **[W-37]** A record MAY refer only to entities that exist when it applies. A writer that needs to name an entity in the middle of an action (a drawn card in a `draw` block, a token created and used inside one action) MUST write its `create` first. Every entity that exists at any point during a step group MUST be created, even when it is removed in the same step group: a card drawn and discarded in one decision, a token created and defeated in one action. A drawn card MUST be created in, or moved to (when it is already a temporary deck entity), its owner's `hand`, with a `to` that holds its owner.
- **[W-38]** The first `step` MUST have `seq` 0, and each later `step` MUST have the `seq` of the one before plus one.
- **[W-39]** A writer MUST write `step` 0 after the starting board: setup done, mulligans taken, opening resources chosen, before the first action.
- **[W-40]** A writer SHOULD end `RECORDS` with a `step`.

> **Note (informative):** A writer that only compares the board at one decision point with the
> board at the next cannot meet [W-37]: a card drawn and discarded between them, or a token created
> and defeated, is on neither board. It must also capture the entities created and removed inside
> the step.

The board is promised consistent only at a `step`. The board at step k is what applying every
record up to and including `step` k gives.

**What a step marks** is set by the `Steps` header tag:

- `decision`: each `step` marks a point where a seat is about to make a decision, and each step group is what one decision did.
- `event`: steps are finer than decisions: a writer may also mark points inside the resolution of one decision. The exact granularity is an open issue ([§23](#23-open-issues)).

- **[W-41]** A writer SHOULD write `Steps` `decision`.
- **[A-02]** An applier and a validator MUST treat both values of `Steps` alike: the records mean the same under either.

**Undo.** A platform may let a player take a decision back.

- **[W-42]** A writer MUST NOT write the step groups that an undo took back, MUST number the remaining steps without a gap ([W-38]), and MUST count each undo in `Undos`.

### 8.3 Looks

A private look is a `reveal` with `to` set to the looking seat. The narrative of the look is a
`block` of kind `look`. There is no separate look record: who knows what is carried entirely by
the `to` of `create` and `reveal`.

A hand, or cards from it, revealed to every seat (an effect that makes a seat reveal its hand) is
a look too: it is recorded with a block of kind `look` by the seat that saw the cards, `p` that
seat, `targets` the cards revealed.

### 8.4 Unknown record types

- **[A-03]** An applier MUST ignore a record whose `t` it does not know, and MUST NOT fail on it.

A validator reports such a record as a warning (`unknown-type`), except when `t` begins with
`x_` ([§17.2](#172-extensions)).

---

## 9. Applying

### 9.1 The board

A board has a `seq` (the last step applied, or `null` before the first) and its entities, keyed
by id. Its exact shape is the schema's `board` definition. Each entity holds its `zone`, `owner`,
`controller`, `parent`, `rel`, `card` and `to` when present, and its attributes in `a`.

- **[A-04]** Before the first record, the board MUST hold `"g"`, `"p1"` and `"p2"`, each with empty attributes, and `seq` `null`.

### 9.2 Applying each record

- **[A-05]** An applier MUST apply the records of `RECORDS` in file order.
- **[A-06]** `create`: add the entity with each field the record gives. A `create` with `card` and no `to` stores `to` `"all"`.
- **[A-07]** `set`: overwrite each field the record gives. For each key of `a`, replace the attribute's value whole (an array or object is not merged), or delete the attribute when the value is `null`. `controller: null` deletes `controller`. `parent: null` deletes `parent` and `rel`.
- **[A-08]** `remove`: delete the entity, and retire its id.
- **[A-09]** `reveal`: set the entity's `card`, and merge `to` into its stored `to`: the merge of anything with `"all"` is `"all"`; otherwise it is the union of the seats, in ascending order.
- **[A-10]** `step`: set the board's `seq`. A `step` changes no entity.
- **[A-11]** `block`: change nothing.
- **[A-12]** An applier MUST keep attributes it does not know, `x_` extensions included, and MUST keep zone and relation names it does not know, as written.

### 9.3 Errors while applying

- **[A-13]** A record whose `e`, or whose `parent`, names an entity that does not exist when it applies is an error (`unknown-entity`). So is a `remove` or `reveal` of `"g"`, `"p1"` or `"p2"`.
- **[A-14]** A `create` whose `e` names an existing entity is an error (`duplicate-entity`).
- **[A-15]** A `create` whose `e` names a retired id is an error (`reused-id`).
- **[A-16]** An applier that meets one of these errors MUST stop, and MUST report the code and the 1-based line number of the record in the file. It MUST NOT return a board as if the record had applied.

### 9.4 The board at a step

- **[A-17]** An applier asked for the board at step k MUST apply every record up to and including `step` k, and no record after it.

Every step is reached by applying the file from the start. There are no snapshots in 0.1
([§17](#17-versioning-and-extensibility)).

> **Note (informative):** Applying a whole game takes well under a millisecond on ordinary
> hardware, so a viewer that seeks re-applies from the start.

### 9.5 What a validator checks

- **[V-01]** A validator MUST report every issue it finds as a code from [§21](#21-error-model), the code's severity, and the 1-based line number where it applies, as [§21](#21-error-model) defines it for an issue that no one line holds, and MUST report the file's level ([§2.1](#21-document-conformance-levels)).
- **[V-02]** A validator MUST NOT fail on any input. After a non-fatal issue it MUST keep checking the rest of the file. A record that breaks a rule of [§9.3](#93-errors-while-applying) is reported and not applied, and checking continues with the next record.
- **[V-03]** A validator MUST check the header, each `DECKS` line, each `CARDS` line, each annotation and each record whose `t` it knows against its schema definition (`schema`), and MUST report a line that is not an object (`not-object`) and a number that is not an integer within ±(2^53−1) (`number-range`).
- **[V-04]** A validator MUST apply the records ([§9.2](#92-applying-each-record)) and report `unknown-entity`, `duplicate-entity` and `reused-id` where [§9.3](#93-errors-while-applying) says. It MUST report `unknown-entity` on a `remove` of an entity that is the `parent` of another existing entity.
- **[V-05]** A validator MUST report `parent-rel` on the record that causes an entity to have `parent` without `rel`, or `rel` without `parent`. A condition that lasts is reported once, on that record, not again on the records after it.
- **[V-06]** A validator MUST report `seq-order` on a `step` whose `seq` is not the previous step's plus one, or not 0 for the first step.
- **[V-07]** A validator MUST report a `zone` that is not in its zone registry (`bad-zone`) and a `rel` that is not in its relation registry (`bad-relation`).
- **[V-08]** A validator MUST report every breach of the profile rules of [§10.4](#104-profile-rules) (`profile`).
- **[V-09]** When the file has a `CARDS` section, a validator MUST report a `create` or `reveal` whose `card` has no `CARDS` line (`card-not-indexed`), and a `CARDS` line without a string `id` and a string `name` (`card-index`).
- **[V-10]** A validator MUST report as `schema` a `DECKS` section that does not hold exactly one line for each seat, and a `DECKS` line that breaks [§12.1](#121-decks).
- **[V-11]** A validator MUST report `result-mismatch` when the `Result` tag disagrees with `g.result` at the last step ([§5.2](#52-optional-tags)).
- **[V-12]** A validator MUST report these warnings: `writer-errors` when `WriterErrors` is above zero; `newer-minor` when the file's minor version is above its own; `unknown-type` for a record whose `t` it does not know and that does not begin with `x_`; `unknown-section` for a section it does not know whose name does not begin with `X_`; `dangling-annotation` for an annotation whose `seq` names no step in the file.
- **[V-13]** A validator MAY stop listing issues after a cap of at least 1000. It then reports `too-many-issues` once. The level still counts every issue, listed or not.
- **[V-14]** A validator MUST report `parent-rel` on the record that causes an entity to break [W-28]: after it, the entity's parent is not in `ground`, `space` or `base`, or its `zone` does not match its parent's. A condition that lasts is reported once, on that record.
- **[V-15]** When an issue code other than `schema` covers the condition a line breaks (a `CARDS` line without a `name` is `card-index`; a `create` with `parent` and no `rel` is `parent-rel`), a validator MUST report that code and MUST NOT also report `schema` for the same line and condition.

> **Note (informative):** The registries are additive ([§17](#17-versioning-and-extensibility)): a
> zone or relation added after a validator was built is reported as `bad-zone` or `bad-relation`
> by that validator, while an applier keeps it ([A-12]). A validator should use the
> newest registry it can.

---

## 10. Visibility and profiles

### 10.1 The `Visibility` header

The `Visibility` tag names the file's profile: `full`, `perspective:1`, `perspective:2` or
`public`.

| | `full` | `perspective:N` | `public` |
|---|---|---|---|
| Seat N's own hidden cards | yes | yes | no |
| The opponent's hidden cards | yes | only those revealed to N | no |
| `Seed` | MAY | MUST NOT | MUST NOT |
| `DECKS` | MAY be complete for both seats | seat N's line complete (main deck and sideboard); the opponent's partial | both partial |
| `DECKS` `order` | MAY | MUST NOT | MUST NOT |
| `CARDS` | any | only identities the file reveals | only identities the file reveals |

A `full` file is for archives, organisers and self-recorded games. The other profiles are for
players and everyone else.

- **[H-01]** A host that serves files to players MUST serve each player only the `perspective` file for their seat, except as [H-05] allows.
- **[H-02]** A host that serves files to anyone who is not a player of the game, such as a spectator, MUST serve them only the `public` file, except an archive or an organiser it gives the `full` file to.
- **[H-03]** A host that gives a `full` file to an archive or an organiser MUST NOT let it reach a player of the game, directly or through anyone else it serves, before the match is over.
- **[H-05]** After the match is over, a host MAY give the `full` file of a game to a player of that game, but only when the players of every seat of the game have agreed to it. A host need not offer the `full` file at all.

### 10.2 Audience and knowledge

Each entity in a file has an **audience**: the seats that know its identity.

- An entity's audience starts as its `create`'s `to`: `"all"`, a list of seats, or none when the `create` has neither `card` nor `to`. A `create` with `card` and no `to` has audience `"all"`.
- Each `reveal` widens it, as [A-09] merges `to`.

A seat V is **in** an audience when the audience is `"all"`, or is a list that holds V. In a
`public` file there is no viewer, and no seat is in an audience unless it is `"all"`.

- **[W-43]** A writer MUST give each `create` with a `card` a `to` that holds exactly the seats that know the identity when the entity is created, and each `reveal` a `to` that holds every seat that sees the card at that moment, whether or not the seat already knows it.
- **[W-44]** Before an entity is in `ground`, `space`, `discard`, `base`, `captured` or `setAside`, a writer MUST make its audience `"all"`: by its `create`, or by a `reveal` written before the `set` that moves it there. A card that moves there from a zone whose opponent visibility is not `public` (`hand`, `deck`, `resource`, or a zone not in the registry) needs that `reveal` even when its audience is already `"all"`, because a seat that lost track of it ([§10.3](#103-what-a-viewer-can-track)) sees it again.

For a viewer V, an entity is **known** once V is in its audience. A known entity stays known
until it is removed, or until V loses track of it in a hidden hand
([§10.3](#103-what-a-viewer-can-track)). A card returned from play to its owner's hand stays known
to the opponent who saw it, until a card leaves that hand face down.

### 10.3 What a viewer can track

When V is not in an entity's audience, its zone decides whether V can still track it. The zone
registry ([§22](#22-registries)) gives each zone's visibility for the entity's own seat (its
`controller`, or its `owner` when it has no controller) and for the opponent.

| Zone | The entity's own seat | The opponent |
|---|---|---|
| `deck` | count only | count only |
| `hand` | known | count only, unless known |
| `resource` | known | tracked anonymously: face down, but each resource's place and exhausted state are public |
| `ground`, `space`, `discard`, `base`, `captured`, `setAside` | public: the identity is revealed to all on entry | public |

For redaction ([§11](#11-redaction)), an entity that is not known to V (V is not in its audience,
or V lost track of it) is:

- **anonymous** when its zone is one whose opponent visibility is `anonymous` or `public`;
- **unmaterialized** when its zone is one whose opponent visibility is `count`, when its zone is not in the registry, or when it has no zone (an effect).

When a card V cannot track becomes trackable, or an anonymous card moves, V sees a fresh entity.
So V can never link an anonymous card's past to its future.

**Losing track in a hidden hand.** A hand that is not V's is hidden from V: V sees how many cards
it holds, but cannot follow one face-down card within it. When a card leaves such a hand for a
zone whose opponent visibility is not `public` (`resource`, `deck`, or a zone not in the
registry), V cannot tell which card left. So V loses track of **every** card it knows in that
hand, the one that left included: none of them is known to V any more, though each still counts
in `handCount`. Forgetting only the card that left would name it. A forgotten card is known to V again once it is revealed to V, or once
it enters a zone whose opponent visibility is `public`. The audience in the file is not changed:
losing track is a property of V's view, which the redactor keeps ([R-17]). In a `public` file
every hand is hidden, and the cards known in it are those whose audience is `"all"`.

A card in a hidden hand is never named by a block or a `ref` attribute of a `perspective` or
`public` file, even when V knows it: the redactor drops such references ([R-09], [§11.1](#111-state)).
A block that names a card the viewer should see leave the hand comes after the move ([W-66]).

> **Note (informative):** Losing track is deliberately lossy. Even when V was shown the card a
> moment before it left (a card revealed from the hand by an effect, then resourced in the same
> decision), V loses track of every card it knew in that hand. Telling those cases apart would
> need the redactor to judge what V saw and remembers; forgetting always is safe. For the same reason, a block that names a card still in a hand that
> is not V's loses that reference in V's file, even when the card was shown to everyone (a "reveal a
> card from your hand" cost, a look at the opponent's hand).

> **Note (informative):** A zone this registry does not list is treated as count-only for the
> same reason an unregistered attribute is `identity`: what nobody classified fails safe.

### 10.4 Profile rules

- **[W-45]** A writer MUST write a file that meets the rules of its profile in this section.

A file whose `Visibility` is `perspective:N`:

- has no `Seed` tag;
- has a `DECKS` line for seat N with `complete` `true`, and a `DECKS` line for the other seat with `complete` `false`;
- has no `DECKS` line with `order`;
- has no `create` or `reveal` with a `card` whose `to` (or, for a `create` with `card` and no `to`, `"all"`) does not hold N;
- has no `CARDS` line whose `id` does not appear in the file's header, `DECKS` or `RECORDS`.

A file whose `Visibility` is `public`:

- has no `Seed` tag;
- has both `DECKS` lines with `complete` `false`;
- has no `DECKS` line with `order`;
- has no `create` or `reveal` with a `card` whose `to` is not `"all"` (a `create` with `card` and no `to` is `"all"`);
- has no `CARDS` line whose `id` does not appear in the file's header, `DECKS` or `RECORDS`.

A file whose `Visibility` is `full` has no profile rules beyond the rest of this document.

---

## 11. Redaction

A redactor reads a `full` file and writes the `perspective:V` file for a seat V, or the `public`
file. For `public`, V is nobody: V is in an audience only when it is `"all"`.

The redactor handles `RECORDS` one record at a time, in file order, and never looks ahead. It
rewrites the header, `DECKS` and `CARDS` once `RECORDS` is done (step 11). Its output is a
function of the `full` file and the asked profile alone.

### 11.1 State

The redactor reads `RECORDS` in order. While it reads, it keeps:

- the board of the `full` file, applied record by record ([§9](#9-applying)), so it always knows each entity's current zone, fields, attributes and audience;
- for the record being handled, the `zone`, `owner` and `controller` that the entity it names had before the record applied (step 0 needs them, and a `remove` deletes them from the board);
- for each entity of the `full` file, its status for V: **known**, **anonymous** or **unmaterialized** ([§10](#10-visibility-and-profiles));
- the set of **forgotten** entities: those V lost track of in a hidden hand (step 0, [R-17]);
- a map from `full` ids to output ids, for every entity that is known or anonymous.

`"g"`, `"p1"` and `"p2"` are always known, and map to themselves.

**Forgotten entities.** A forgotten entity is not known to V, though its audience in the `full`
board may still hold V. Wherever a step below asks whether an entity's audience holds V, or
whether it is known, a forgotten entity counts as one whose audience does not hold V; only step 5,
which decides whether V knows it again, reads its audience on the `full` board. It stops being
forgotten when step 3 or step 5 makes it known again. Forgetting never changes the `full` board.

**Fresh ids.** Each time a step below says "a fresh id", the redactor hands out the next integer
of 1, 2, 3, … in the order the output first uses them.

**Mapping.** Wherever an emitted record holds an entity id (`e`, `parent`, a `ref` or `ref[]`
attribute), the redactor writes the mapped output id. A `ref` or `ref[]` attribute keeps only
references to `"g"`, `"p1"`, `"p2"` and entities known to V that are not in a `hand` whose seat
is not V, the same rule as step 9 for blocks: a `ref` attribute that names any other entity is
dropped, and a `ref[]` attribute drops each such
element and keeps the array, even when it ends up empty. A reference to an anonymous entity is
dropped too, because an attribute that followed it would link the entity across re-ids. A
reference to a known card in a hidden hand is dropped because the card may leave that hand face
down, and a reference written just before it left would name it ([R-17]).

**Free text goes with a dropped reference.** When the redactor drops any reference from a record
it emits, it also drops that record's `text`, `untilText` and `ability` attributes, because words
can name what the reference pointed at.

**Face-down attributes** of an entity are its attributes whose registry row has `faceDown` `true`
([§7.3](#73-attributes)). They are the only attributes an anonymous entity carries. Unregistered
attributes, including every `x_` extension, are not face-down.

### 11.2 The steps

For each record of the `full` file, the redactor applies it to its `full` board, runs step 0, and
then emits what the first matching step of steps 1 to 10 says. Step 0 runs before the others
because what it emits comes before the record's own output. Steps 1 to 10 see the statuses step 0
leaves.

- **[R-17]** Step 0, losing track in a hidden hand ([§10.3](#103-what-a-viewer-can-track)). Step 0 applies to a `set` that moves an entity out of zone `hand` into a zone whose opponent visibility is not `public` (or that is not in the zone registry), and to a `remove` of an entity that was in zone `hand` (it went into a deck, [W-24]), when that hand is not V's: the entity's seat (its `controller`, or its `owner` when it has none) before the record was not V. In a `public` file every hand is not V's. It applies even when the moving entity was revealed to V earlier in the same step group. When it applies, before anything else for this record, the redactor takes every entity in that hand that is known to V, the moving one included, in ascending order of output id; emits a `remove` of each one's output id; and marks each one forgotten and unmaterialized. Then the record goes on to steps 1 to 10 with the moving entity unmaterialized: step 5 makes a fresh anonymous entity of it when it lands in the resource row, and step 8 emits nothing for its `remove`.
- **[R-01]** Step 1, a `create` whose audience holds V: emit it with a fresh id, its `card` included. The entity is known.
- **[R-02]** Step 2, a `create` whose audience does not hold V: if the entity would be anonymous for V ([§10.3](#103-what-a-viewer-can-track)), emit it with a fresh id, without `card`, with `to` set to the entity's own seat (its `controller`, or its `owner` when it has none) as a one-seat list, and with only its face-down attributes (no `a` when it has none); the entity is anonymous. Otherwise emit nothing; the entity is unmaterialized.
- **[R-03]** Step 3, a `reveal` whose `to` holds V: if the entity is known, emit the `reveal` with the mapped id. If it is anonymous, emit a `remove` of its output id, then a `create` with a fresh id. If it is unmaterialized, emit only that `create` with a fresh id. That `create` carries the entity's current `zone`, `owner`, `controller`, `parent` and `rel`, its `card`, its current audience as `to`, and all its current attributes, in canonical key order ([W-07]), with no `a` when it has none. From then on the entity is known, and no longer forgotten.
- **[R-04]** Step 4, a `reveal` whose `to` does not hold V: emit nothing.
- **[R-05]** Step 5, a `set` of an unmaterialized entity: if the entity is forgotten and, after the `set`, its audience holds V and it is in a zone whose opponent visibility is `public`, emit the `create` that step 3 emits for an unmaterialized entity; the entity is known, and no longer forgotten. Otherwise, if the entity, after the `set`, would be anonymous for V, emit a `create` with a fresh id, without `card`, with its current `zone`, `owner`, `controller`, `parent` and `rel`, `to` set to the entity's own seat as a one-seat list (as in step 2), and only its face-down attributes, in canonical key order ([W-07]); the entity is anonymous. Otherwise emit nothing.
- **[R-06]** Step 6, a `set` that changes the `zone` of an anonymous entity: emit a `remove` of its output id. The entity is then unmaterialized, and step 5 applies to the same `set`.
- **[R-07]** Step 7, any other `set`: emit it with mapped ids. For an anonymous entity, drop from `a` every attribute that is not face-down. If nothing is left but `t` and `e`, emit nothing.
- **[R-08]** Step 8, a `remove`: for an unmaterialized entity, emit nothing. Otherwise emit it with the mapped id.
- **[R-09]** Step 9, a `block`: keep a reference (`src`, `via`, and each element of `targets` and `options`) only when it names `"g"`, `"p1"`, `"p2"` or an entity known to V that is not, when the block applies, in a `hand` whose seat is not V, mapped. Remove `src` or `via` when it is dropped. Remove `targets` or `options` when no element is left. If any reference was dropped, also remove `text`, except the `text` of a `name` block, which is the chosen name ([W-54]). Emit the block, with its `id`, `kind`, `p`, `amount`, `parent` and `group` unchanged.
- **[R-10]** Step 10, a `step`: emit it unchanged.
- **[R-11]** Step 11, the rest of the file:
  - **Header:** keep every tag of the `full` file except `Seed`, with every value unchanged except `Visibility`, which becomes `perspective:V` or `public`.
  - **`DECKS`:** keep V's own line unchanged except that `order` is removed. Rewrite the opponent's line (in a `public` file, both lines) as partial: keep `p`, `leaders` and `base`; set `complete` to `false`; remove `sideboard` and `order`; and set `main` to one `[id]` entry for each distinct card id that the output's `create` and `reveal` records give to an entity whose `owner` is that seat, leaving out `TOKEN:` ids and the line's own `leaders` and `base`, in the order the output first gives each.
  - **`CARDS`:** keep the `full` file's lines, in their order, whose `id` appears in the output's header, `DECKS` or `RECORDS` (a `card` field or a `copyOf` attribute).

- **[R-12]** A redactor MUST refuse a file whose `Visibility` is not `full` (`not-full`). It MUST NOT redact a file that was already redacted.
- **[R-13]** A redactor MUST NOT copy into its output a record whose `t` it does not know, the `STORY` section, the `ANNOTATIONS` section, or a section it does not know.
- **[R-14]** Every entity id in the output MUST be a fresh id as [§11.1](#111-state) defines it, so the output's ids are 1, 2, 3, … in order of first use, and no output id is used for two entities.
- **[R-15]** A redactor given a valid `full` file MUST write a valid file of the asked profile when the asked profile is `public`, and when it is `perspective:V` and V's `DECKS` line in the `full` file is complete.
- **[R-16]** A redactor MUST refuse an input in which a `parent` names an entity it cannot map to an output entity (`parent-rel`). It MUST NOT emit the record without its `parent`.
- **[W-46]** A writer MAY produce `perspective` and `public` files some other way, but each MUST equal, byte for byte in canonical form ([§4.5](#45-canonical-form)), what this section yields from the writer's `full` file.
- **[W-63]** A writer that writes a `perspective` or `public` file some other way MUST lose track of known cards in a hidden hand as step 0 ([R-17]) does: the same `remove` records, at the same place, and fresh entities afterwards. A writer that keeps knowing a card the viewer lost track of breaks [W-46].

> **Note (informative):** Step 9 keeps every block, because that something happened is public;
> it drops only what the block says about cards the viewer cannot see. Block `text` goes with any
> dropped reference because words can name the card the reference pointed at.

> **Note (informative):** If V's own `DECKS` line in the `full` file is not complete, the output
> cannot meet the `perspective` profile ([§10.4](#104-profile-rules)). A writer that means to
> redact its `full` files writes both lines complete.

> **Note (informative):** A redactor may write a fresh `STORY` from its own output with a
> renderer; it never copies the `full` file's prose, which names cards V never saw.

---

## 12. `DECKS` and `CARDS`

### 12.1 `DECKS`

One line per seat. Its exact shape is the schema's `deckLine` definition.

```json
{"p":1,"leaders":["SOR#005"],"base":"SOR#026","complete":true,"main":[["SOR#095",3],["SOR#160",2]],"sideboard":[["SOR#210",1]],"order":["SOR#160","SOR#095"]}
{"p":2,"leaders":["SOR#010"],"base":"SOR#029","complete":false,"main":[["SOR#130"],["SOR#201"]]}
```

| Field | Means |
|---|---|
| `p` | The seat. |
| `leaders` | The seat's leaders: one, or two for a two-leader deck. Always present: leaders are public from setup. |
| `base` | The seat's base. Always present. |
| `complete` | `true`: `main` and `sideboard` are the whole lists. `false`: `main` holds only the cards this file reveals. |
| `main` | With `complete` `true`, `[id, count]` entries. With `complete` `false`, `[id]` entries with no count. |
| `sideboard` | `[id, count]` entries. Only with `complete` `true`. |
| `order` | The starting deck order, top first, as card ids. Only in a `full` file. |

- **[W-47]** A writer MUST write exactly one `DECKS` line for each seat.
- **[W-48]** With `complete` `true`, every `main` entry MUST have a count and the counts MUST be the whole main deck. With `complete` `false`, every `main` entry MUST be an id with no count, and `sideboard` MUST be absent.
- **[W-49]** A seat's `leaders` and `base` MUST name the same cards as its `P1Leader`/`P2Leader` and `P1Base`/`P2Base` tags.

> **Note (informative):** A partial list has no counts because one physical copy can appear as two
> entities to a viewer (it went into the deck and came out again), so any count would be a guess.
> Deck order after setup is not tracked.

### 12.2 `CARDS`

Card ids are opaque. `SEC#215` tells a human nothing, and tells a program nothing unless it ships
a card database. The `CARDS` section maps each card id the file mentions to a display name. Its
exact shape is the schema's `cardLine` definition.

```json
{"id":"SOR#108","name":"Wampa"}
{"id":"TOKEN:shield#8752877738","name":"Shield"}
```

| Field | Required | Means |
|---|---|---|
| `id` | yes | A card id. |
| `name` | yes | What to show a human, subtitle included: `"Greef Karga, Gracious Magistrate"`. The card's English printed name, which a writer SHOULD write in Unicode Normalization Form C. A reader MAY show a translated name from its own card database. |
| `backSideName` | no | The name of the card's other side, when it has a different one. `name` is then always the printed front. |

```json
{"id":"HMW#004","name":"Grand Moff Tarkin, Tyrant of the Outer Rim","backSideName":"The Death Star, Icon of Tyranny"}
```

Which side is up at a given moment is board state (`deployed`, `onStartingSide`), not part of
the index. A reader showing a name SHOULD show the side that is up.

- **[W-50]** A writer MUST NOT write two `CARDS` lines with the same `id`.
- **[W-51]** A writer that writes `CARDS` MUST write a line for every card id the file mentions: the header's leaders and bases, every `DECKS` entry, and every `card` and `copyOf` in `RECORDS`.

`CARDS` is optional. Without it a reader needs its own card database.

- **[P-18]** A reader MUST show a card id that has no `CARDS` line as the id itself. An incomplete index degrades to unreadable names, never to a lost record.

---

## 13. Narrative: blocks and `STORY`

### 13.1 Block fields

A `block` record says what happened. Its exact shape is the schema's `block` definition. Its
kind and its fields are normative: a consumer such as a statistics site may count attacks, damage
and draws from them. Only its `text` is for a human.

| Field | Type | Means |
|---|---|---|
| `id` | block id | Unique in the file, counting up ([§6.3](#63-block-ids)). |
| `kind` | string | What happened, from the block kind registry ([§22](#22-registries)). |
| `p` | seat | The seat that acted. |
| `src` | entity id | The card (or base) that did it. |
| `targets` | entity ids | What it was done to. Seats are allowed (`"p2"`). |
| `options` | entity ids | What could have been chosen. |
| `amount` | integer | How much: damage dealt, cards drawn. |
| `parent` | block id | The enclosing block: an attack's damage under the attack, a trigger under what caused it. |
| `via` | entity id | The card that caused an ability to be used, or granted it. |
| `group` | integer | Blocks with the same `group` happened at the same time (combat damage, CR 6.3.5), or were blind choices made without seeing each other (CR 7.1.4a). |
| `text` | string | Words for a human, such as the name of a triggered ability. |

The table gives each field's general meaning. Which fields a block of a registered kind carries,
and what each means for that kind, is the kind's **field contract** in the block kind registry
([§22.4](#224-block-kinds)): each field is **required** or **optional**, and a field the contract
does not list MUST NOT appear. `id` and `kind` are always required. `text` and `parent` are always
allowed; `text` is required only where a contract says so (the chosen name of a `name` block).

A block is one point record. There are no open and close pairs: nesting is `parent`.

- **[W-52]** A block's `parent` MUST name a block earlier in the file.
- **[W-53]** A block's `src`, `targets`, `options` and `via` MUST name entities that exist when the block is applied ([W-37]).
- **[W-54]** A block's `text` MUST NOT name or describe any card or entity other than the ones the block references, so that a reader who knows every entity the block references learns nothing hidden from it. A `name` block is exempt: its `text` is the chosen name, which was announced to both seats, and it MUST hold that name and nothing else.
- **[W-66]** A block that names a card leaving a hand for a zone whose opponent visibility is `public` (a card played, or discarded from hand) MUST be written after the `set` that moves it, so that the reference survives redaction ([R-09]). A block that names a card leaving a hand face down (into the resource row or a deck) MUST be written before the record that moves it: a `full` file keeps the name, and a `perspective` or `public` file drops it.

> **Note (informative):** A played event therefore moves to `discard` before its `play` block, and
> resolves from there. Only the boards at step boundaries are states a viewer sees ([§9.4](#94-the-board-at-a-step));
> where a card sits between two records of one step is not.

Blocks are never state. The board is whatever `create`, `set`, `remove` and `reveal` say.

- **[A-18]** An applier MUST NOT change the board because of a block.

### 13.2 Block kinds

The block kind registry ([§22](#22-registries)) is an open list.

- **[P-19]** A reader MUST accept a block whose `kind` it does not know.

Each kind's meaning in the registry says what one occurrence of it is: one card played, one
attack, one amount of damage dealt at once, one triggered ability resolved.

**Precedence.** An event that a more specific kind records is not also an occurrence of a more
generic kind:

- a search is a `search` block, never also a `look`;
- deploying a leader is a `deploy`, never also an `ability`;
- a choice that another block records in its `targets` or `options` (the target of an attack, an ability, a play, a search) is not also a `choice`: `choice` is only for a choice no other block records, such as a mode, a yes or no, a number, a player or an order;
- every triggered ability that resolves is a `trigger`, keyword triggers (Restore, Ambush, Shielded, Bounty and the like) included;
- cards of a hand revealed to the other seat are a `look` by that seat ([§8.3](#83-looks)), not a `choice`.

Events of different kinds that happen together are each an occurrence: an attack is an `attack`,
and its combat damage is a `damage` block under it.

- **[W-64]** A writer MUST write every block of a registered kind by that kind's field contract ([§22.4](#224-block-kinds)): with every required field, with only the fields the contract lists (and `id`, `kind`, `text`, `parent`), and with each field meaning what the contract says. A required reference field (`src`, `via`, `targets`, `options`) is required in a `full` file; in a `perspective` or `public` file it is absent when the redactor dropped it ([R-09]). A required `p`, `amount` or `text` is required in every profile.
- **[W-65]** A writer that writes any block in a file MUST write a block of the matching kind for every occurrence, in the recorded game, of every registered kind. A writer MAY write no block at all. Blocks of an unregistered kind ([§17.2](#172-extensions)) are free: a writer need not write one for every occurrence.
- **[V-16]** A validator MUST report `block-fields` on a block of a registered kind that lacks a field its contract requires, or that carries a field the contract does not list. In a file whose `Visibility` is not `full`, it MUST NOT report a missing `src`, `via`, `targets` or `options`.

A validator cannot check [W-65]: knowing which events a game had takes the rules. Because the
redactor keeps every block ([R-09]), a `perspective` or `public` file made from a `full` file that
meets [W-65] meets it too.

### 13.3 `STORY`

`STORY` is the game as prose. It is optional, derived from the records, and its wording is
advisory: no rule depends on it. The same holds for the wording of a block's `text`, except the chosen name a `name` block holds ([W-54]).

- **[W-55]** A `STORY` MUST NOT hold anything the file's profile hides ([§10](#10-visibility-and-profiles)).

---

## 14. Annotations

Notes people add after the game. One JSON object per line in `ANNOTATIONS`. Its exact shape is
the schema's `annotation` definition.

| Field | Type | Required | Means |
|---|---|---|---|
| `seq` | integer | yes | The step this note is about. |
| `text` | string | no | What the note says. A writer SHOULD write it, like `by`, in Unicode Normalization Form C. |
| `nag` | string | no | A short glyph (below). |
| `by` | string | no | A made-up name for the author. Never a real one. |
| `id` | string | no | A stable id for this note, so another note can reply to it. Opaque. |
| `parent` | string | no | The `id` of the note this one replies to. |

An annotation whose `seq` names no step in the file is a warning (`dangling-annotation`). A
`parent` that names no note is a reply to a note that is not there: a reader shows it as a
top-level note.

**The glyphs.**

| Glyph | Means |
|---|---|
| `!` | Good move |
| `?` | Mistake |
| `!!` | Brilliant |
| `??` | Blunder |
| `!?` | Interesting, risky |
| `?!` | Dubious |

Other glyphs MAY appear. A reader treats one it does not know as "some kind of note".

**Rules for an annotator.** An annotator MUST only add notes, after the ones already there. It
MUST NOT change or delete an existing note. It MUST point each note at a `seq` that a step in the
file has. It MUST NOT put a real name in `by`, or anything that identifies a person in `text`
([§16](#16-privacy-considerations)).

---

## 15. Rendering (informative)

A renderer tells the game as text from the blocks. The wording is not normative; the structure
below is a suggestion that makes stories from different programs look alike.

- One numbered line per top-level block (a block with no `parent`), numbered within its step.
- A block's children, indented under it and lettered.
- Card names from `CARDS`, falling back to the card id, then to "a card" for an entity with no
  identity.
- A banner whenever `g.round` changes.
- A block whose `kind` the renderer does not know gets a generic line rather than being dropped.

A renderer that shows a `perspective` or `public` file names only the cards that file holds; it
never needs to name more. Escaping rules for every renderer are in
[§20](#20-security-considerations).

---

## 16. Privacy considerations

A file is about two real people. It may be shared, archived and published. This section says what
keeps it from identifying them, and what each profile keeps from the other seat.

### 16.1 Identifying data

- **[W-56]** A writer MUST NOT put a real account name, account id, email address, IP address, or anything else that points at a real person in a file.
- **[W-57]** `P1Id` and `P2Id` MUST be `sha256:` and 64 lowercase hex digits [[FIPS180-4](#24-references)]: a pseudonym derived from the player's account, never the account itself.
- **[W-58]** `GameId` and `Match` MUST be opaque. Neither may be, or reveal, an identifier the platform uses for the game or the match: a room id, a database key, an id that appears in its logs.

A writer derives `P1Id` and `P2Id` in one of two ways:

- **Keyed (RECOMMENDED):** an HMAC-SHA-256 [[RFC2104](#24-references)] of the player's account identifier, keyed with a secret held by the platform. The same player has the same id across that platform's games, so a consumer can group one player's games without learning who they are, and without the key nobody can confirm a guess.
- **Per-game salt (fallback):** a SHA-256 of the platform's own id for the game joined to the player's account identifier. The same player has a different id in every file. The salt is not secret, so this stops ids being joined across files, but not someone who took part in or watched the game from confirming a guess.

- **[H-04]** A host that publishes files MUST derive `P1Id` and `P2Id` with the keyed scheme.

A consumer MUST NOT attribute a file to an account by hashing candidate account identifiers
against the file's ids. It takes the seat from the authenticated delivery instead.

**Pseudonymous is not anonymous.** A keyed id is stable across a host's games, so a corpus of files
is pseudonymous personal data about the players. **Deck lists are a fingerprint**: a player who
plays one list across many games is recognisable from a `complete` `DECKS` line whatever the id
scheme. **Timing is a fingerprint**: the `ms` of each step ([§5.5](#55-timing-ms)) is a playing
rhythm that survives any id scheme. A host publishing a corpus SHOULD decide deliberately whether
to keep `ms`.

### 16.2 What the profiles hide

A `full` file holds every hand, both deck lists and sideboards, the starting deck order and
possibly the seed. Before a match is over, that is everything a player must not know about an
opponent. That is why a host serves players only their `perspective` file ([H-01]) and
everyone else only the `public` file ([H-02]). After the match, a player may have the `full`
file only when every seat has agreed ([H-05]).

A `perspective` file is built so that it holds nothing its viewer did not see during the game.
Each way a game record could leak is closed by a rule of this document:

- **The opponent's draws.** A draw is a `create` whose `to` is the drawing seat. For the opponent it is unmaterialized ([R-02]): the file holds no entity for it, only the new `handCount`.
- **Which card was resourced.** A card moved from a hand the viewer cannot see into the resource row appears as a fresh anonymous entity ([R-05]) whose `to` is always the owner's seat alone, whoever had seen the card, and which carries only face-down attributes such as `exhausted`, whatever the writer left on the card ([R-02], [R-05], [§7.3](#73-attributes)). The viewer sees that a resource arrived, not which card it was: resourcing a card the viewer knew and resourcing one it never saw give the same records.
- **Moves between hidden zones.** An anonymous entity that changes zone is removed and, if still trackable, created afresh ([R-06]). An anonymous card can never be linked across a move.
- **Searches and looks.** The cards a seat looks at are temporary deck entities whose `to` is the looking seat, so they are unmaterialized for the opponent ([R-02]); a private `reveal` is not emitted ([R-04]); and the narrative of the search keeps no reference to them ([R-09]).
- **Blind choices.** A block's `options` that name cards the viewer does not know are dropped, and its `text` with them ([R-09]).
- **Effects that name hidden cards.** An effect is materialized for V only when V knows its source ([W-31], [R-02]). A reference attribute (`src`, `targets`) keeps only references to entities V knows, so it cannot name a hidden card or follow an anonymous one across re-ids ([§11.1](#111-state)).
- **Words that name hidden cards.** When a reference is dropped, the record's `text`, `untilText` and `ability` attributes go with it ([§11.1](#111-state)), as a block's `text` does ([R-09]). `abilityUses` is `identity`-class, so its ability ids are dropped from every entity V does not know ([R-02], [R-05], [R-07]).
- **How long a card sat in hand.** The opponent's hand is a count, not a list of entities ([§10.3](#103-what-a-viewer-can-track)). A viewer cannot follow one hidden card through the rounds. Only a card the viewer already knows stays an entity in the opponent's hand, and only until a card leaves that hand face down.
- **Which known card left a hidden hand.** When any card leaves a hand the viewer cannot see face down (into the resource row or a deck), the viewer loses track of every card it knew in that hand, and each is removed from the file ([R-17], [W-63]). Removing only the card that left would name it. It applies even when the card was revealed to the viewer a moment before. No block or `ref` attribute names a card in a hidden hand ([R-09], [§11.1](#111-state)), so a block written before the move cannot name the card either ([W-66]). A forgotten card comes back, as a fresh entity, only once the viewer sees it again ([W-43], [W-44]).
- **Ids that carry history.** Entity ids carry no information and are renumbered by order of first use ([R-14]); a card that comes back from the deck is a new entity ([W-22]). Ids are per file: an id in one profile's file says nothing about the same id in another's ([§6.2](#62-entity-ids)), so two players' files cannot be joined to rebuild both hands.
- **The seed, the deck order, the opponent's deck list and sideboard, and names of unseen cards.** `Seed` is dropped, `order` is dropped, the opponent's `DECKS` line lists only cards the file reveals, and `CARDS` keeps only ids the file uses ([R-11]).
- **Notes and prose.** `STORY` and `ANNOTATIONS` of a `full` file are not copied ([R-13]).

A block of an unseen action is kept, without its references: that the opponent drew, searched or
resourced is public, and only what they drew, found or resourced is hidden.

> **Note (informative):** Treating the opponent's hand as a count costs a viewer nothing it was
> allowed to know. A face-down card in hand has no public state, so an entity for it could only
> ever carry its own history, and that history is exactly the leak.

---

## 17. Versioning and extensibility

The version is in the `Game` tag: `SWU-PGN/<major>.<minor>`. This document is version 0.1.

- **[P-20]** A parser MUST refuse a file whose major version is not 0 (`unsupported-major`).
- **[P-21]** A parser MAY read a file whose 0.x minor version is above its own, and MUST then report `newer-minor` (warning). In 0.x, a minor version may change the meaning of any part of the format, so a reader SHOULD tell its user that it may misread such a file.

What can change, and how:

- **The envelope** (the syntax, the sections, the six record types, the header rules, the profiles and the redaction algorithm) changes only with the version. In 0.x a minor version MAY change it in a way that breaks older readers. From 2.0 on, only a major version may.
- **The registries** (attributes, zones, relations, block kinds, set codes) grow by adding rows. A new row needs no new version.
- **Blocks** are normative in their kind and their fields: the block kind registry gives each kind a field contract ([§13.1](#131-block-fields)), and it grows by adding kinds, like every registry. An existing kind's contract changes only with the version.
- **The wording** of block `text` and of `STORY` is advisory and never normative. The one exception is a `name` block's `text`, which is the chosen name ([W-54]).

- **[P-22]** A reader MUST keep attributes it does not know, and MUST accept block kinds, zones, relations and set codes it does not know.

There are no snapshots in 0.1. The record type `snapshot` is reserved for a later minor version
that adds snapshots for seeking.

- **[W-59]** A writer MUST NOT write a record whose `t` is `snapshot`.

### 17.1 Freezing

When the format freezes, the frozen version is 2.0. A 0.x reader refuses a 2.x file ([P-20]).

### 17.2 Extensions

A writer may carry data this document does not define, under a name that says whose it is:

| What | Name | Example |
|---|---|---|
| attribute | `x_<product>_<name>` | `"x_examplewriter_deckName":"Wampa Rush"` |
| record type | `x_<product>_<name>` | `{"t":"x_examplewriter_hint", …}` |
| section | `X_<PRODUCT>_<NAME>` | `%%% X_EXAMPLEWRITER_STATS` |
| header tag | `X<Product><Name>` (tag names are letters and digits) | `[XExamplewriterDeckId "…"]` |

- **[W-60]** An extension MUST NOT change the meaning of anything this document defines: a file stripped of every extension MUST apply to the same board, apart from the extension attributes themselves.
- **[W-61]** A writer MUST NOT add fields to a record beyond those its schema definition lists. Data about an entity goes in `a`, as an `x_` attribute.

An `x_` attribute is `identity`-class unless it is registered ([§7.3](#73-attributes)), so a
redactor drops it from every entity the viewer does not know. A reader ignores an extension
record type and an extension section without a warning.

---

## 18. Media type and file extension

| | |
|---|---|
| **Media type** | `text/x-swu-pgn` |
| **Extension** | `.swupgn` |
| **Encoding** | UTF-8, always ([§4](#4-file-syntax)). A `charset` parameter, if present, is `utf-8`. |
| **Line endings** | `\n` (`\r\n` accepted) |
| **Magic number** | the first line begins `[Game "SWU-PGN/` |

The media type is not registered, so it carries the `x-` prefix. A server SHOULD serve a
`.swupgn` with it, and SHOULD compress the transfer.

**Fragment identifiers.** A URL fragment that is a step's `seq` names the board at that step:
`game.swupgn#12`. A viewer opening such a link SHOULD show the board at step 12. A fragment that
names no step SHOULD open the file at its start.

The details a registration needs:

- **Type name / subtype:** `text` / `x-swu-pgn`
- **Required parameters:** none. **Optional parameters:** `charset` (only `utf-8`).
- **Encoding considerations:** 8bit; UTF-8 text with LF line ends.
- **Security considerations:** [§20](#20-security-considerations).
- **Interoperability considerations:** [§17](#17-versioning-and-extensibility), [§19](#19-conformance-suite).
- **Published specification:** this document.
- **Applications that use this media type:** game servers, replay viewers, deck trackers and statistics sites for Star Wars: Unlimited.
- **Fragment identifier considerations:** above.
- **File extension:** `.swupgn`.
- **Person to contact / change controller:** the editors, through the package's source repository.

---

## 19. Conformance suite

The `vectors/` folder of the package is the conformance suite. Its vectors are normative: code
that does not reproduce them is not conformant. Where a vector disagrees with this text,
[§2](#2-conventions-and-conformance-levels) applies.

`vectors/manifest.json` lists every vector:

- a **positive vector** `N` has one file per profile, `vectors/N.full.swupgn`, `vectors/N.p1.swupgn`, `vectors/N.p2.swupgn` and `vectors/N.public.swupgn`, and for each a `vectors/N.<profile>.board.json`: the board at the file's last step. Its manifest row names the requirements it covers.
- a **negative vector** is a file under `vectors/negative/`, with the code it must produce and the line where it must be found.

Every positive file is valid and written in canonical form ([§4.5](#45-canonical-form)).

**Pass criteria.**

1. **Parser:** every positive file parses. Every negative file whose code is `fatal` is rejected with that code at that line.
2. **Validator:** every positive file is valid with no issues. Every negative file reports its code at its line.
3. **Applier:** for every positive file, the board at its last step equals its `board.json` as JSON values: key order is not significant, array order is, and an absent field is not equal to `null`.
4. **Redactor:** for every positive vector, redacting `N.full` for seat 1, for seat 2 and for `public`, and writing the result in canonical form, gives `N.p1`, `N.p2` and `N.public` byte for byte.

A platform that writes files may contribute a real game as a vector. The file MUST hold no
identifying data ([§16](#16-privacy-considerations)), and it is accepted once it is valid and
every implementation in the suite reproduces its boards and its redactions.

---

## 20. Security considerations

A `.swupgn` file is untrusted input: readers open files that people upload, share and download.

**Resource limits.**

- **[P-23]** A parser MAY cap the size of the input, the length of a line, the number of records and the nesting depth of a JSON value, and MUST reject a file over a cap (`too-large`, `line-too-long`, `too-many-records`, `too-deep`) rather than read part of it.
- **[A-19]** An applier MAY cap the number of entities that exist at once, and MUST reject a file over that cap (`too-many-records`) rather than apply part of it.

Caps of 16 MiB per file, 1 MiB per line, 1 000 000 records, a depth of 64 and 100 000 entities
are ample. A real game is under 100 KB, with lines under 4 KB and a few hundred entities.

> **Note (informative):** A truncated game applies to a plausible but wrong board, which is worse
> than no board. That is why a reader rejects rather than truncates.

**Keys from the file.** Attribute names, header tag names and every other object key come from
the file. Thirteen names belong to the object model of common languages rather than to data:
`__proto__`, `__defineGetter__`, `__defineSetter__`, `__lookupGetter__`, `__lookupSetter__`,
`constructor`, `hasOwnProperty`, `isPrototypeOf`, `propertyIsEnumerable`, `toLocaleString`,
`toString`, `valueOf` and `prototype`.

- **[P-24]** A parser MUST reject a file in which any JSON object, at any depth, has one of those names as a key, or a header tag has one as its name (`reserved-key`).
- **[P-25]** A reader MUST NOT let a key read from a file reach an object's prototype: it uses own-property checks, maps without a prototype, or explicit property definitions.

**Numbers.** Every number in a valid file is an integer within ±(2^53−1), but a reader cannot
assume a file is valid.

- **[A-20]** An applier MUST NOT let a number's value make it loop, allocate or index out of bounds: a count of `1e308` or a negative `amount` is data, not a size.

**Display injection.** `CARDS` `name` and `backSideName`, `Reason`, block `text`, the `text`,
`untilText` and `ability` attributes of an effect, `name`, `traits`, `keywords` and `aspects`,
annotation `text` and `by`, `STORY` lines, and every unknown attribute or tag are text an
attacker controls. A renderer and a consumer MUST escape them for the medium they display in
(HTML, Markdown, a terminal), and SHOULD neutralise bidirectional-override and control
characters, which can make a line read differently from what it says.

**Integrity is not authenticity.** A valid file is consistent with itself. It does not prove that
the game happened, or that a particular server wrote it: anyone can write a valid file by hand. A
consumer MUST NOT treat a valid file as evidence of a result. A host that needs to vouch for a
file must sign it or serve it over an authenticated channel. This version defines neither.

**Full files reveal hidden information.** See [§10.1](#101-the-visibility-header) and
[§16.2](#162-what-the-profiles-hide). A seed matters beyond its own game: a host whose random
number generator carries state from one game to the next must not reveal a seed while a later game
that depends on it is unplayed.

---

## 21. Error model

Every problem a reader can find has a code. Codes are stable identifiers. Messages are free text,
are not part of this specification, and a program MUST NOT match them.

Each code has a severity:

- **fatal**: the file is malformed. A parser rejects it ([P-12]), and nothing in it is read. One bad line rejects the whole file: skipping it would apply a game with a hole in it, and a reader cannot know what the hole held.
- **error**: the file parses but is not valid. A reader MAY still apply and show it, and SHOULD say it is not valid.
- **warning**: the file is as valid as its level says, and something is worth telling the user.

One line can break a schema and a more specific rule at once. A validator then reports only the
specific code ([V-15]): a `CARDS` line with no `name` is `card-index`, not also `schema`.

A code that "applies to an SDK call" is not a property of a file: it is what a call returns when
it is given the wrong kind of file, such as `not-full` from a redactor ([R-12]).

**The line of an issue.** Every issue a parser or a validator reports carries the 1-based line
number of the line that holds it ([P-12], [V-01]): the header line, banner, `DECKS`, `CARDS` or
annotation line, or record. Three codes describe something no one line holds, and are reported at
a fixed line:

- `missing-tag`: the line of the first banner, where the header ended; the last line of the file
  when it has no banner.
- `result-mismatch`: the line of the `Result` tag.
- `profile`: the line that breaks the profile rule: the `Seed` tag, the `DECKS` line, the `CARDS`
  line, or the `create` or `reveal`.

`too-many-issues` is the only issue reported with no line.

A reader that meets a code it does not know treats it by its severity. The table is the error
code registry.

<!-- registry:errorCodes -->
| Code | Severity | Applies to | Condition |
|---|---|---|---|
| `not-swupgn` | fatal | a file | The first line is not a SWU-PGN Game tag. |
| `unsupported-major` | fatal | a file | The major version is not supported. |
| `too-large` | fatal | a file | The input exceeds the size limit. |
| `line-too-long` | fatal | a file | A line exceeds the length limit. |
| `too-many-records` | fatal | a file | The record count, or the number of entities that exist at once, exceeds the limit. |
| `too-deep` | fatal | a file | Nesting exceeds the depth limit. |
| `bad-header-line` | fatal | a file | A header line is not a well-formed tag pair. |
| `bad-escape` | fatal | a file | A header value has an invalid escape. |
| `duplicate-tag` | fatal | a file | A header tag appears twice. |
| `missing-tag` | fatal | a file | A required header tag is missing. |
| `bad-count` | fatal | a file | A count header tag (Rounds, or a present Undos, GameNumber, WriterRevision or WriterErrors) is not base-10 digits within the integer range. |
| `duplicate-section` | fatal | a file | A section appears twice. |
| `record-outside-section` | fatal | a file | A record line is outside any section. |
| `bad-json` | fatal | a file | A line is not valid JSON. |
| `duplicate-key` | fatal | a file | An object has a duplicate key. |
| `reserved-key` | fatal | a file | An object uses a reserved key such as __proto__. |
| `schema` | error | a file | A line does not match its schema. |
| `not-object` | error | a file | A record line is not a JSON object. |
| `number-range` | error | a file | A number is outside its allowed range. |
| `card-index` | error | a file | A CARDS line lacks a string id or a string name. |
| `unknown-entity` | error | a file | A record refers to an entity that does not exist. |
| `duplicate-entity` | error | a file | A create uses an id that already exists. |
| `reused-id` | error | a file | A create uses an id that was retired. |
| `parent-rel` | error | a file | parent and rel are not present together, or, after a record applies, an entity's parent is not in ground, space or base, or the entity's zone does not match its parent's. |
| `seq-order` | error | a file | Step seq values do not count 0, 1, 2, … in file order with no gap. |
| `bad-zone` | error | a file | A zone name is not in the registry. |
| `bad-relation` | error | a file | A relation name is not in the registry. |
| `profile` | error | a file | The file breaks the rules of its Visibility profile. |
| `card-not-indexed` | error | a file | The file has a CARDS section, and a create or reveal names a card id that has no CARDS line. |
| `result-mismatch` | error | a file | The Result tag disagrees with the game result. |
| `block-fields` | error | a file | A block of a registered kind lacks a field its contract requires, or carries a field its contract does not list. In a file whose Visibility is not full, a missing src, via, targets or options is not reported. |
| `writer-errors` | warning | a file | The writer reported errors while recording. |
| `newer-minor` | warning | a file | The file has a newer minor version. |
| `unknown-type` | warning | a file | A record has an unknown t. |
| `unknown-section` | warning | a file | A section name is unknown. |
| `dangling-annotation` | warning | a file | An annotation refers to a missing step. |
| `too-many-issues` | warning | a file | The issue limit was reached. |
| `not-full` | fatal | an SDK call | redact was given a file whose Visibility is not full. |
<!-- /registry:errorCodes -->

---

## 22. Registries

A registry is a vocabulary that grows without a new version of the format. Each lives in a file in
the package's `registry/` folder, and the tables below are generated from those files. Adding a
row is a change to the registry file, made by a pull request to the package's source repository.

| Registry | File | Open or closed |
|---|---|---|
| Attributes | `registry/attributes.json` | open: unknown attributes are kept, and are `identity`-class |
| Zones | `registry/zones.json` | open: an applier keeps an unknown zone; a validator reports it |
| Relations | `registry/relations.json` | open: an applier keeps an unknown relation; a validator reports it |
| Block kinds | `registry/blockKinds.json` | open: an unknown kind is accepted |
| Set codes | `registry/setCodes.json` | open: an unknown set code is accepted |
| Error codes | `registry/errorCodes.json` | open: an unknown code is treated by its severity ([§21](#21-error-model)) |
| Header tags | [§5](#5-header-tags) | open: an unknown tag is kept |
| Sections | [§4.2](#42-the-section-banners) | open: an unknown section is skipped |
| Record types | [§8.1](#81-the-record-types) | closed: an unknown type is ignored ([A-03]) |
| `Visibility`, `Steps` values | [§5.1](#51-required-tags) | closed |
| Annotation glyphs | [§14](#14-annotations) | open |

### 22.1 Attributes

"On" says which entities an attribute applies to: `game` is `"g"`, `seat` is `"p1"` and `"p2"`,
`card` is every card and token entity, `effect` is every effect entity, and `unit`, `leader`,
`base`, `resource` and `upgrade` are card entities of that kind or in that zone. "Face down" says
whether a redactor keeps the attribute on an anonymous entity ([§7.3](#73-attributes)): the
registry field `faceDown`, absent meaning no.

<!-- registry:attributes -->
| Name | Type | Class | Face down | On | Meaning | CR |
|---|---|---|---|---|---|---|
| `round` | `count` | public | no | game | The current round number (0 during setup). | 5.1 |
| `phase` | `string` | public | no | game | setup, action or regroup. | 5.1 |
| `active` | `seat\|null` | public | no | game | Whose turn it is in the action phase; null otherwise. | 5.3 |
| `initiative` | `seat` | public | no | game | Who holds the initiative counter. | 1.16.1, 5.4.1.b |
| `initiativeTaken` | `bool` | public | no | game | Whether initiative was taken this round. | 1.16.1 |
| `result` | `string` | public | no | game | p1, p2 or draw, once the game is over. | 5.6 |
| `deckCount` | `count` | public | no | seat | Cards in the deck. | 4.6 |
| `handCount` | `count` | public | no | seat | Cards in hand, known or not. | 4.7 |
| `credits` | `count` | public | no | seat | Credit tokens. | 7.5.x (Credits) |
| `force` | `bool` | public | no | seat | Whether the seat has the Force. | 8.x (the Force) |
| `kind` | `string` | identity | no | card | unit, upgrade, event, leader, base or token; effect on effect entities. | 3 |
| `exhausted` | `bool` | public | yes | unit, leader, resource, upgrade | Ready or exhausted (upgrades that can exhaust). | 1.16.1 |
| `damage` | `count` | public | no | unit, base | Damage on it. | 1.9 |
| `power` | `int` | public | no | unit | Current power, after every effect. | 3.x |
| `hp` | `int` | public | no | unit, base | Current max HP, after every effect (remaining = hp - damage). | 3.x |
| `keywords` | `string[]` | public | no | unit | Current keywords; numbered ones once with their sum (raid 2); cost and dash ones once per instance. | 7.5.4 |
| `traits` | `string[]` | public | no | unit, upgrade | Current traits, lower case. | 1.16.1 |
| `aspects` | `string[]` | identity | no | card | Aspect icons, one entry per icon. | 2.x |
| `cost` | `int` | identity | no | card | Printed cost (copy effects: copied cost). | — |
| `name` | `string` | identity | no | card | The name to show, only when it differs from the CARDS name (copy effects, a leader's other side). | — |
| `blank` | `bool` | public | no | unit | Has lost all abilities. | 8.14.2 |
| `leaderUnit` | `bool` | public | no | unit | An ability made it a leader unit. | 3.4.7 |
| `copyOf` | `string` | public | no | unit | The card id whose printed attributes it now has. | 8.5 |
| `deployed` | `bool` | public | no | leader | Leader Unit side up. | 3.4 |
| `onStartingSide` | `bool` | public | no | leader | Which side of a double-sided leader is up. | 3.4 |
| `epicActionUsed` | `bool` | public | no | leader, base | Epic Action spent. | 1.16.1 |
| `defeated` | `bool` | public | no | base | Defeated (also without damage: the Death Star). | 5.6 |
| `abilityUses` | `object[]` | identity | no | card | One entry per limited ability used at least once: {ability: string, seat, count, per: "phase"\|"round"\|"game", max}. | 7.2.5, 1.16.3 |
| `src` | `ref` | public | no | effect | The card (or base) whose ability created it. | — |
| `targets` | `ref[]` | public | no | effect | The entities it applies to (seats allowed: "p1"). | — |
| `duration` | `string` | public | no | effect | attack, phase, round, whileSourceInPlay, until, delayed or game. | — |
| `untilText` | `string` | public | no | effect | Words for an until condition. | — |
| `ability` | `string` | public | no | effect | The writer's ability id (display only, never branched on). | — |
| `text` | `string` | public | no | effect | The effect in words. | — |
<!-- /registry:attributes -->

The `abilityUses` attribute holds one object per limited ability that has been used at least once,
with the fields `ability` (the writer's id for the ability, for display only), `seat` (who used
it), `count`, `per` (`phase`, `round` or `game`) and `max`.

### 22.2 Zones

"Owner sees" and "Opponent sees" say what the seat that controls an entity in the zone, and the
other seat, can track when they are not in its audience ([§10.3](#103-what-a-viewer-can-track)):
`known` (always in the audience), `count` (only a count), `anonymous` (tracked without identity)
or `public` (identity revealed to all).

<!-- registry:zones -->
| Zone | Meaning | Owner sees | Opponent sees |
|---|---|---|---|
| `deck` | The draw pile (only temporary looked-at entities). | count | count |
| `hand` | A hand. | known | count |
| `resource` | The resource row. | known | anonymous |
| `ground` | The ground arena. | known | public |
| `space` | The space arena. | known | public |
| `discard` | The discard pile. | known | public |
| `base` | The base zone: base, undeployed leader, Fortify upgrades. | known | public |
| `captured` | Held under a unit or base (parent is the captor, rel is captured). | known | public |
| `setAside` | Outside the game. | known | public |
<!-- /registry:zones -->

An attached upgrade's or a pilot's `zone` is its parent's zone ([W-28]).

### 22.3 Relations

<!-- registry:relations -->
| Relation | Parent | Meaning |
|---|---|---|
| `attached` | unit or base | An upgrade (card or token) on its host. A Fortify upgrade is attached to the base. |
| `pilot` | vehicle unit | A pilot upgrade (a unit or leader with Piloting). |
| `captured` | unit or base | A captured card (base: Arrest). |
<!-- /registry:relations -->

### 22.4 Block kinds

Each row is a kind and its field contract ([§13.1](#131-block-fields)). "Required" and "Optional"
list the fields among `p`, `src`, `targets`, `options`, `amount`, `via`, `group` and `text` that a block of
the kind must and may carry; a field in neither column MUST NOT appear ([W-64]). `id` and `kind`
are always required. `text` and `parent` are always allowed, and `text` is required only where
the "Required" column lists it. "Fields mean" says what a field
means for the kind where the general meaning of [§13.1](#131-block-fields) is not enough.

<!-- registry:blockKinds -->
| Kind | Meaning | Required | Optional | Fields mean |
|---|---|---|---|---|
| `play` | A card is played. | `p`, `src` | `targets`, `amount`, `via` | `p`: The seat that played it. `src`: The card played. `targets`: What was chosen while playing it, such as an upgrade's host. `amount`: The resources paid. `via`: The card whose ability let it be played. |
| `deploy` | A leader is deployed. | `p`, `src` | `targets` | `p`: The seat that deployed it. `src`: The leader. `targets`: The unit it deploys onto, when it deploys as an upgrade. |
| `attack` | A unit attacks. | `p`, `src`, `targets` | `via` | `p`: The attacking seat. `src`: The attacker. `targets`: The defender: the unit or base attacked. `via`: The card whose ability made the attack. |
| `ability` | An action ability is used, or an Epic Action other than deploying a leader. One use is one occurrence. | `p`, `src` | `targets`, `via` | `p`: The seat that used it. `src`: The card (or base) whose ability it is. `targets`: What it was used on. `via`: The card that granted the ability. |
| `trigger` | A triggered ability resolves, keyword triggers (Restore, Ambush, Shielded, Bounty and the like) included. Each resolution is one occurrence. | `p`, `src` | `targets`, `via` | `p`: The seat that controls the ability. `src`: The card (or base) whose ability it is. `targets`: What it was used on. `via`: The card that granted the ability. |
| `damage` | Damage is dealt. One occurrence is one amount of damage dealt at once to one or more targets. | `targets`, `amount` | `p`, `src`, `group` | `p`: The seat whose card dealt it; absent with src. `src`: The card that dealt it; absent only when no card did (a draw from an empty deck). `targets`: What took the damage. `amount`: The damage each target took, after prevention. Damage of different amounts is separate blocks. `group`: Shared by damage dealt at the same time, such as combat damage. |
| `heal` | Damage is healed. | `p`, `src`, `targets`, `amount` | `group` | `p`: The seat whose card healed it. `src`: The card that healed it. `targets`: What was healed. `amount`: The damage removed from each target. Different amounts are separate blocks. `group`: Shared by healing done at the same time. |
| `defeat` | Entities are defeated. Each event that defeats one or more entities at once is one occurrence. | `targets` | `p`, `src`, `group` | `p`: The seat whose card defeated them. `src`: The card whose damage or ability defeated them. `targets`: What was defeated. `group`: Shared by defeats at the same time. |
| `capture` | A card is captured. | `p`, `src`, `targets` | `via` | `p`: The seat that controls the captor. `src`: The captor: the unit or base that holds the card. `targets`: The captured cards. `via`: The card whose ability made the capture. |
| `rescue` | A captured card is rescued. | `p`, `targets` | `src` | `p`: The seat the rescued cards return to. `src`: The card whose ability rescued them. `targets`: The rescued cards. |
| `draw` | Cards are drawn. Each draw instruction is one occurrence. A draw from an empty deck draws no card and is no draw block. | `p`, `targets`, `amount` | `src`, `group` | `p`: The drawing seat. `src`: The card whose ability made the draw; absent for the draws of setup and regroup. `targets`: The drawn card entities. `amount`: The cards drawn. `group`: Shared by draws at the same time, such as both seats' regroup draws. |
| `discard` | Cards are discarded from a hand or a deck. | `p`, `targets`, `amount` | `src`, `group` | `p`: The seat whose cards were discarded. `src`: The card whose ability discarded them. `targets`: The discarded cards. `amount`: The cards discarded. `group`: Shared by discards at the same time. |
| `resource` | Cards are put into the resource row. | `p`, `targets`, `amount` | `src`, `group` | `p`: The seat whose resources they become. `src`: The card whose ability resourced them; absent for the resources of setup and regroup. `targets`: The resourced cards. `amount`: The cards resourced. `group`: Shared by resources chosen at the same time, such as at setup. |
| `search` | A deck is searched. A search is a search block only, never also a look block. | `p`, `src`, `amount` | `targets`, `options` | `p`: The searching seat. `src`: The card whose ability searched. `targets`: The cards chosen. `options`: The cards looked at. `amount`: How many cards were looked at. |
| `look` | Cards are looked at, other than in a search. | `p`, `targets`, `amount` | `src` | `p`: The seat that looked. `src`: The card whose ability let it look. `targets`: The cards looked at. `amount`: How many cards were looked at. |
| `choice` | A choice that no other block's targets or options records is made: a mode, a yes or no, a number, a player, an order. | `p` | `src`, `targets`, `options`, `amount`, `group` | `p`: The choosing seat. `src`: The card whose ability asked for the choice. `targets`: What was chosen. `options`: What could have been chosen. `amount`: The number chosen, when the choice is a number. `group`: Shared by blind choices made without seeing each other. |
| `name` | A name is chosen. | `p`, `src`, `text` | — | `p`: The naming seat. `src`: The card whose ability asked for the name. `text`: The chosen name, and nothing else. |
| `shuffle` | A deck is shuffled, with or without entities shuffled into it. | `p`, `amount` | `src`, `targets` | `p`: The seat whose deck it is. `src`: The card whose ability shuffled it. `targets`: The entities shuffled into the deck. `amount`: The entities shuffled into the deck: 0 when none were. |
| `pass` | A seat passes. | `p` | — | `p`: The passing seat. |
| `initiative` | The initiative is taken. | `p` | `src` | `p`: The seat that took it. `src`: The card whose ability gave it. |
| `mulligan` | A mulligan decision. | `p`, `amount` | — | `p`: The deciding seat. `amount`: The cards shuffled back: 0 when the seat kept its hand. |
| `regroup` | The regroup phase happens. | — | — | — |
| `gameEnd` | The game ends. | — | `p` | `p`: The winning seat; absent for a draw. |
<!-- /registry:blockKinds -->

### 22.5 Set codes

In release order.

<!-- registry:setCodes -->
| Release | Code |
|---|---|
| 1 | `SOR` |
| 2 | `SHD` |
| 3 | `TWI` |
| 4 | `JTL` |
| 5 | `LOF` |
| 6 | `IBH` |
| 7 | `SEC` |
| 8 | `LAW` |
| 9 | `TS26` |
| 10 | `ASH` |
| 11 | `HMW` |
| 12 | `IC27` |
<!-- /registry:setCodes -->

---

## 23. Open issues

- **Steps finer than a decision.** `Steps` `event` is reserved for a granularity finer than one decision ([§8.2](#82-order-and-steps)). Which points inside a decision it marks is not yet defined.
- **Snapshots for seeking.** 0.1 has none ([§9.4](#94-the-board-at-a-step)). A later minor version may add a `snapshot` record so a viewer can seek without applying from the start.
- **Deck positions.** Only the starting deck order of a `full` file is recorded. Where a card goes when it is put into a deck (top, bottom, shuffled) is not board state in 0.1.
- **Multiplayer.** Games with more than two players are out of scope ([§1](#1-introduction-and-terminology)).

---

## 24. References

**Normative:**

- **[RFC2119]** Bradner, S., "Key words for use in RFCs to Indicate Requirement Levels", BCP 14, RFC 2119, March 1997. <https://www.rfc-editor.org/rfc/rfc2119>
- **[RFC8174]** Leiba, B., "Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words", BCP 14, RFC 8174, May 2017. <https://www.rfc-editor.org/rfc/rfc8174>
- **[RFC8259]** Bray, T., Ed., "The JavaScript Object Notation (JSON) Data Interchange Format", STD 90, RFC 8259, December 2017. <https://www.rfc-editor.org/rfc/rfc8259>
- **[RFC7493]** Bray, T., Ed., "The I-JSON Message Format", RFC 7493, March 2015. <https://www.rfc-editor.org/rfc/rfc7493>
- **[RFC3339]** Klyne, G. and C. Newman, "Date and Time on the Internet: Timestamps", RFC 3339, July 2002. <https://www.rfc-editor.org/rfc/rfc3339>
- **[RFC3629]** Yergeau, F., "UTF-8, a transformation format of ISO 10646", STD 63, RFC 3629, November 2003. <https://www.rfc-editor.org/rfc/rfc3629>
- **[RFC5234]** Crocker, D., Ed. and P. Overell, "Augmented BNF for Syntax Specifications: ABNF", STD 68, RFC 5234, January 2008. <https://www.rfc-editor.org/rfc/rfc5234>
- **[RFC2104]** Krawczyk, H., Bellare, M. and R. Canetti, "HMAC: Keyed-Hashing for Message Authentication", RFC 2104, February 1997. <https://www.rfc-editor.org/rfc/rfc2104>
- **[FIPS180-4]** NIST, "Secure Hash Standard (SHS)", FIPS PUB 180-4, August 2015. <https://doi.org/10.6028/NIST.FIPS.180-4>
- **[JSON-Schema]** Wright, A., Andrews, H., Hutton, B. and G. Dennis, "JSON Schema: A Media Type for Describing JSON Documents", draft 2020-12. <https://json-schema.org/draft/2020-12>
- **[SWU-Cards]** Fantasy Flight Games, the official Star Wars: Unlimited card database. <https://starwarsunlimited.com/cards>
- **[SWU-CR]** Fantasy Flight Games, "Star Wars: Unlimited Comprehensive Rules", version 9.0. Every "CR" citation in this document, and in the registries, is to that version.

**Informative:**

- **[PGN]** Edwards, S. J., "Portable Game Notation Specification and Implementation Guide", 1994. The chess format this one is named after.
- **[JSON-Lines]** "JSON Lines". <https://jsonlines.org/>

---

## Appendix A: Example (informative)

This appendix reproduces the `RECORDS` of the conformance vector `tiny`: one short game in which
a card is searched out of a deck, put back on top of it and drawn again. The vector's other
sections, and its `perspective:2` and `public` files, are in `vectors/` with notes that say which
step of [§11.2](#112-the-steps) made each line. If this appendix and the vector disagree, the
vector is right.

In that game Player 2 plays Bodhi Rook, whose When Played looks at Player 1's hand and discards
an event from it. Player 2's Trust Yourself then gives Bodhi a Shield token and searches the top
three cards of Player 2's deck. Player 1's New Tactics puts Bodhi on top of Player 2's deck, and
Player 2 draws him again at regroup. Each card played from a hand is revealed, then moved, then
named by its `play` block ([W-44], [W-66]). The Shield token is created after the unit it is
attached to is in play, as [W-28] requires.

`RECORDS` of `vectors/tiny.full.swupgn`, the game as it was:

```ndjson
{"t":"set","e":"g","a":{"round":1,"phase":"action","active":1,"initiative":1,"initiativeTaken":false}}
{"t":"set","e":"p1","a":{"deckCount":44,"handCount":3,"credits":0,"force":false}}
{"t":"set","e":"p2","a":{"deckCount":45,"handCount":2,"credits":0,"force":false}}
{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","damage":0,"hp":30}}
{"t":"create","e":2,"zone":"base","owner":1,"card":"SOR#005","a":{"kind":"leader","exhausted":false,"deployed":false,"epicActionUsed":false}}
{"t":"create","e":3,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}
{"t":"create","e":4,"zone":"base","owner":2,"card":"SOR#010","a":{"kind":"leader","exhausted":false,"deployed":false,"epicActionUsed":false}}
{"t":"create","e":5,"zone":"hand","owner":1,"card":"SOR#095","to":[1]}
{"t":"create","e":6,"zone":"hand","owner":1,"card":"HMW#218","to":[1]}
{"t":"create","e":7,"zone":"hand","owner":1,"card":"SOR#103","to":[1]}
{"t":"create","e":8,"zone":"hand","owner":2,"card":"SOR#201","to":[2]}
{"t":"create","e":9,"zone":"hand","owner":2,"card":"HMW#101","to":[2]}
{"t":"create","e":10,"zone":"resource","owner":1,"card":"SOR#060","to":[1],"a":{"exhausted":false}}
{"t":"create","e":11,"zone":"resource","owner":2,"card":"SOR#061","to":[2],"a":{"exhausted":false}}
{"t":"step","seq":0}
{"t":"reveal","e":5,"card":"SOR#095","to":"all"}
{"t":"set","e":5,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}
{"t":"block","id":1,"kind":"play","p":1,"src":5}
{"t":"set","e":10,"a":{"exhausted":true}}
{"t":"set","e":"p1","a":{"handCount":2}}
{"t":"set","e":"g","a":{"active":2}}
{"t":"step","seq":1}
{"t":"reveal","e":8,"card":"SOR#201","to":"all"}
{"t":"set","e":8,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}
{"t":"block","id":2,"kind":"play","p":2,"src":8}
{"t":"set","e":11,"a":{"exhausted":true}}
{"t":"block","id":3,"kind":"trigger","p":2,"src":8,"parent":2}
{"t":"reveal","e":6,"card":"HMW#218","to":[2]}
{"t":"reveal","e":7,"card":"SOR#103","to":[2]}
{"t":"block","id":4,"kind":"look","p":2,"src":8,"targets":[6,7],"amount":2,"parent":3}
{"t":"reveal","e":7,"card":"SOR#103","to":"all"}
{"t":"set","e":7,"zone":"discard","a":{"kind":"event"}}
{"t":"block","id":5,"kind":"discard","p":1,"src":8,"targets":[7],"amount":1,"parent":3}
{"t":"set","e":"p1","a":{"handCount":1}}
{"t":"set","e":"p2","a":{"handCount":1}}
{"t":"set","e":"g","a":{"active":1}}
{"t":"step","seq":2}
{"t":"block","id":6,"kind":"pass","p":1}
{"t":"set","e":"g","a":{"active":2}}
{"t":"step","seq":3}
{"t":"reveal","e":9,"card":"HMW#101","to":"all"}
{"t":"set","e":9,"zone":"discard","a":{"kind":"event"}}
{"t":"block","id":7,"kind":"play","p":2,"src":9,"targets":[8]}
{"t":"create","e":12,"zone":"ground","owner":2,"parent":8,"rel":"attached","card":"TOKEN:shield#8752877738","a":{"kind":"token"}}
{"t":"create","e":13,"zone":"deck","owner":2,"card":"SOR#200","to":[2]}
{"t":"create","e":14,"zone":"deck","owner":2,"card":"SOR#202","to":[2]}
{"t":"create","e":15,"zone":"deck","owner":2,"card":"SOR#212","to":[2]}
{"t":"block","id":8,"kind":"search","p":2,"src":9,"targets":[15],"options":[13,14,15],"amount":3,"parent":7}
{"t":"set","e":15,"zone":"hand"}
{"t":"block","id":9,"kind":"draw","p":2,"src":9,"targets":[15],"amount":1,"parent":7}
{"t":"remove","e":13}
{"t":"remove","e":14}
{"t":"set","e":"p2","a":{"deckCount":44}}
{"t":"set","e":"g","a":{"active":1}}
{"t":"step","seq":4}
{"t":"reveal","e":6,"card":"HMW#218","to":"all"}
{"t":"set","e":6,"zone":"discard","a":{"kind":"event"}}
{"t":"block","id":10,"kind":"play","p":1,"src":6,"targets":[8]}
{"t":"block","id":11,"kind":"choice","p":2,"src":6,"parent":10,"text":"Top of the deck"}
{"t":"block","id":12,"kind":"defeat","p":1,"src":6,"targets":[12],"parent":10}
{"t":"remove","e":12}
{"t":"remove","e":8}
{"t":"set","e":"p1","a":{"handCount":0}}
{"t":"set","e":"p2","a":{"deckCount":45}}
{"t":"set","e":"g","a":{"active":2}}
{"t":"step","seq":5}
{"t":"block","id":13,"kind":"pass","p":2}
{"t":"set","e":"g","a":{"active":1}}
{"t":"step","seq":6}
{"t":"block","id":14,"kind":"pass","p":1}
{"t":"block","id":15,"kind":"regroup"}
{"t":"create","e":16,"zone":"hand","owner":1,"card":"SOR#210","to":[1]}
{"t":"create","e":17,"zone":"hand","owner":1,"card":"SOR#211","to":[1]}
{"t":"create","e":18,"zone":"hand","owner":2,"card":"SOR#201","to":[2]}
{"t":"create","e":19,"zone":"hand","owner":2,"card":"SOR#214","to":[2]}
{"t":"block","id":16,"kind":"draw","p":1,"targets":[16,17],"amount":2,"parent":15,"group":1}
{"t":"block","id":17,"kind":"draw","p":2,"targets":[18,19],"amount":2,"parent":15,"group":1}
{"t":"set","e":"p1","a":{"deckCount":42,"handCount":2}}
{"t":"set","e":"p2","a":{"deckCount":43,"handCount":3}}
{"t":"set","e":"g","a":{"phase":"regroup","active":null}}
{"t":"step","seq":7}
{"t":"block","id":18,"kind":"resource","p":1,"targets":[16],"amount":1,"parent":15}
{"t":"set","e":16,"zone":"resource","a":{"exhausted":true}}
{"t":"set","e":"p1","a":{"handCount":1}}
{"t":"step","seq":8}
```

`RECORDS` of `vectors/tiny.p1.swupgn`, the same game as Player 1 saw it. Player 2's hand is a
count, Player 2's resource is anonymous, and the cards Player 2 searched are not there. Bodhi
Rook's look at Player 1's own hand emits no `reveal`, and each of Player 2's cards appears when
it is revealed:

```ndjson
{"t":"set","e":"g","a":{"round":1,"phase":"action","active":1,"initiative":1,"initiativeTaken":false}}
{"t":"set","e":"p1","a":{"deckCount":44,"handCount":3,"credits":0,"force":false}}
{"t":"set","e":"p2","a":{"deckCount":45,"handCount":2,"credits":0,"force":false}}
{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","damage":0,"hp":30}}
{"t":"create","e":2,"zone":"base","owner":1,"card":"SOR#005","a":{"kind":"leader","exhausted":false,"deployed":false,"epicActionUsed":false}}
{"t":"create","e":3,"zone":"base","owner":2,"card":"SOR#029","a":{"kind":"base","damage":0,"hp":28}}
{"t":"create","e":4,"zone":"base","owner":2,"card":"SOR#010","a":{"kind":"leader","exhausted":false,"deployed":false,"epicActionUsed":false}}
{"t":"create","e":5,"zone":"hand","owner":1,"card":"SOR#095","to":[1]}
{"t":"create","e":6,"zone":"hand","owner":1,"card":"HMW#218","to":[1]}
{"t":"create","e":7,"zone":"hand","owner":1,"card":"SOR#103","to":[1]}
{"t":"create","e":8,"zone":"resource","owner":1,"card":"SOR#060","to":[1],"a":{"exhausted":false}}
{"t":"create","e":9,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":false}}
{"t":"step","seq":0}
{"t":"reveal","e":5,"card":"SOR#095","to":"all"}
{"t":"set","e":5,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}
{"t":"block","id":1,"kind":"play","p":1,"src":5}
{"t":"set","e":8,"a":{"exhausted":true}}
{"t":"set","e":"p1","a":{"handCount":2}}
{"t":"set","e":"g","a":{"active":2}}
{"t":"step","seq":1}
{"t":"create","e":10,"zone":"hand","owner":2,"card":"SOR#201","to":"all"}
{"t":"set","e":10,"zone":"ground","a":{"kind":"unit","exhausted":true,"damage":0,"power":3,"hp":3}}
{"t":"block","id":2,"kind":"play","p":2,"src":10}
{"t":"set","e":9,"a":{"exhausted":true}}
{"t":"block","id":3,"kind":"trigger","p":2,"src":10,"parent":2}
{"t":"block","id":4,"kind":"look","p":2,"src":10,"targets":[6,7],"amount":2,"parent":3}
{"t":"reveal","e":7,"card":"SOR#103","to":"all"}
{"t":"set","e":7,"zone":"discard","a":{"kind":"event"}}
{"t":"block","id":5,"kind":"discard","p":1,"src":10,"targets":[7],"amount":1,"parent":3}
{"t":"set","e":"p1","a":{"handCount":1}}
{"t":"set","e":"p2","a":{"handCount":1}}
{"t":"set","e":"g","a":{"active":1}}
{"t":"step","seq":2}
{"t":"block","id":6,"kind":"pass","p":1}
{"t":"set","e":"g","a":{"active":2}}
{"t":"step","seq":3}
{"t":"create","e":11,"zone":"hand","owner":2,"card":"HMW#101","to":"all"}
{"t":"set","e":11,"zone":"discard","a":{"kind":"event"}}
{"t":"block","id":7,"kind":"play","p":2,"src":11,"targets":[10]}
{"t":"create","e":12,"zone":"ground","owner":2,"parent":10,"rel":"attached","card":"TOKEN:shield#8752877738","a":{"kind":"token"}}
{"t":"block","id":8,"kind":"search","p":2,"src":11,"amount":3,"parent":7}
{"t":"block","id":9,"kind":"draw","p":2,"src":11,"amount":1,"parent":7}
{"t":"set","e":"p2","a":{"deckCount":44}}
{"t":"set","e":"g","a":{"active":1}}
{"t":"step","seq":4}
{"t":"reveal","e":6,"card":"HMW#218","to":"all"}
{"t":"set","e":6,"zone":"discard","a":{"kind":"event"}}
{"t":"block","id":10,"kind":"play","p":1,"src":6,"targets":[10]}
{"t":"block","id":11,"kind":"choice","p":2,"src":6,"parent":10,"text":"Top of the deck"}
{"t":"block","id":12,"kind":"defeat","p":1,"src":6,"targets":[12],"parent":10}
{"t":"remove","e":12}
{"t":"remove","e":10}
{"t":"set","e":"p1","a":{"handCount":0}}
{"t":"set","e":"p2","a":{"deckCount":45}}
{"t":"set","e":"g","a":{"active":2}}
{"t":"step","seq":5}
{"t":"block","id":13,"kind":"pass","p":2}
{"t":"set","e":"g","a":{"active":1}}
{"t":"step","seq":6}
{"t":"block","id":14,"kind":"pass","p":1}
{"t":"block","id":15,"kind":"regroup"}
{"t":"create","e":13,"zone":"hand","owner":1,"card":"SOR#210","to":[1]}
{"t":"create","e":14,"zone":"hand","owner":1,"card":"SOR#211","to":[1]}
{"t":"block","id":16,"kind":"draw","p":1,"targets":[13,14],"amount":2,"parent":15,"group":1}
{"t":"block","id":17,"kind":"draw","p":2,"amount":2,"parent":15,"group":1}
{"t":"set","e":"p1","a":{"deckCount":42,"handCount":2}}
{"t":"set","e":"p2","a":{"deckCount":43,"handCount":3}}
{"t":"set","e":"g","a":{"phase":"regroup","active":null}}
{"t":"step","seq":7}
{"t":"block","id":18,"kind":"resource","p":1,"targets":[13],"amount":1,"parent":15}
{"t":"set","e":13,"zone":"resource","a":{"exhausted":true}}
{"t":"set","e":"p1","a":{"handCount":1}}
{"t":"step","seq":8}
```

---

## Appendix B: Grammar (ABNF)

This grammar is normative for the header, the banners and card ids. It uses ABNF
[[RFC5234](#24-references)] and its core rules (`ALPHA`, `DIGIT`, `DQUOTE`, `WSP`, `LF`, `CRLF`).
The JSON lines of each section are defined by the schema, not by this grammar. A `json-text` is a
JSON text as RFC 8259 defines it, restricted to I-JSON [[RFC7493](#24-references)].

### B.1 The file

```abnf
swupgn-file     = [bom] *blank-line game-line *( header-line / blank-line ) *section [last-line]
bom             = %xFEFF                 ; readers strip it; writers never write it
game-line       = "[Game" 1*WSP DQUOTE "SWU-PGN/" major "." minor DQUOTE "]" *WSP eol
major           = 1*DIGIT                ; "0" for this version
minor           = 1*DIGIT
header-line     = *WSP tag-pair *( *WSP tag-pair ) *WSP eol
tag-pair        = "[" tag-name 1*WSP DQUOTE tag-value DQUOTE "]"
tag-name        = 1*( ALPHA / DIGIT )    ; case-sensitive; unique in the file
tag-value       = *( tag-char / escape )
tag-char        = %x20-21 / %x23-5B / %x5D-7E / %x80-10FFFF
                                         ; any character but DQUOTE, "\" and controls
escape          = "\" ( DQUOTE / "\" )   ; the only two escapes
section         = json-section / story-section / unknown-section
json-section    = banner *( record-line / blank-line )
                                         ; banner name DECKS, CARDS, RECORDS or ANNOTATIONS
story-section   = banner *story-line     ; banner name STORY
unknown-section = banner *any-line       ; skipped unread
banner          = *WSP "%%%" *WSP section-name *WSP eol
section-name    = 1*( ALPHA / DIGIT / "_" )
                                         ; case-insensitive; each name at most once
record-line     = *WSP json-text *WSP eol
story-line      = any-line               ; any line that does not start with "%%%"
any-line        = *( %x09 / %x20-10FFFF ) eol
blank-line      = *WSP eol
eol             = LF / CRLF
last-line       = *( %x09 / %x20-10FFFF ) ; a final line with no line end
```

### B.2 Header values

```abnf
date-time       = full-date "T" full-time    ; RFC 3339, seconds and offset required
full-date       = 4DIGIT "-" 2DIGIT "-" 2DIGIT
full-time       = 2DIGIT ":" 2DIGIT ":" 2DIGIT [ "." 1*9DIGIT ] ( "Z" / ( "+" / "-" ) 2DIGIT ":" 2DIGIT )
count           = 1*DIGIT                    ; base 10, no sign
sha256-id       = "sha256:" 64hex-lower      ; P1Id, P2Id, Match
hex-lower       = DIGIT / %x61-66
card-pool       = set-code *( "," set-code )
leader-list     = card-id [ "," card-id ]    ; P1Leader, P2Leader
engine          = product "@" build          ; e.g. examplewriter@7dd39a09-dirty
product         = 1*( ALPHA / DIGIT / "-" / "_" / "." )
build           = 1*%x21-7E
visibility      = %s"full" / %s"perspective:1" / %s"perspective:2" / %s"public"
steps           = %s"decision" / %s"event"
result          = %s"P1" / %s"P2" / %s"Draw" / %s"Incomplete"
```

### B.3 Card ids

```abnf
card-id         = printed-card / token-card
printed-card    = set-code "#" collector
set-code        = 1*( %x41-5A / DIGIT )      ; upper case
collector       = 3*DIGIT                    ; zero-padded to at least 3
token-card      = %s"TOKEN:" token-name [ "#" 1*DIGIT ]
token-name      = 1*( %x61-7A / DIGIT ) *( "-" 1*( %x61-7A / DIGIT ) )
```

### B.4 Canonical layout

The layout of a file in canonical form ([W-07]). Every canonical file is also a `swupgn-file`; the
grammar adds no reading rule, it only pins the bytes a writer writes. Key orders inside each JSON
line are given by [W-07], not here.

```abnf
canonical-file  = canon-header 1*canon-section
canon-header    = canon-game *canon-tag  ; no blank line among the tags
canon-game      = "[Game" SP DQUOTE "SWU-PGN/" major "." minor DQUOTE "]" LF
canon-tag       = "[" tag-name SP DQUOTE tag-value DQUOTE "]" LF
                                         ; one tag per line, nothing else on it
canon-section   = LF canon-banner *canon-line
                                         ; one blank line before every banner
canon-banner    = "%%%" SP canon-name LF ; no space or tab after the name
canon-name      = 1*( %x41-5A / DIGIT / "_" )
                                         ; the section name in upper case
canon-line      = canon-text LF          ; in STORY, canon-text may be empty
                                         ; (a blank line inside the prose), but
                                         ; never on the first or last line of it;
                                         ; in every other section it is never empty
canon-text      = [ *( %x09 / %x20-10FFFF ) ( %x21-10FFFF ) ]
                                         ; does not end in a space or tab
```

A canonical file has no byte order mark, no `CR`, and ends with the `LF` of its last line.

---

## Appendix C: Legacy 1.0 pilot files (informative)

An earlier, incompatible format called SWU-PGN 1.0 was piloted before this one. Its files begin
`[Game "SWU-PGN/1.0"]`. A 0.x reader does not read them: it refuses them as an unsupported major
version ([P-20]). They are not converted by this specification; a platform that holds them can
re-record the games with a 0.x writer if it still has what it needs to replay them. To keep the
two apart for good, this format will freeze as 2.0, never as 1.0.

---

## Appendix D: Acknowledgements (informative)

The teams who implemented the 1.0 pilot on their own platforms read its text against their code
and reported what it got wrong. Their reports shaped this redesign. The format is named after,
and owes its shape to, Steven J. Edwards's Portable Game Notation for chess.
