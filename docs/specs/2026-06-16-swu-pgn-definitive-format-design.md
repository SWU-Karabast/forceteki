# SWU-PGN/1.1 — Definitive Game Format: Design

**Status:** Approved design (precursor to the normative spec + implementation plan)
**Date:** 2026-06-16
**Branch:** swu-game-notation
**Supersedes:** SWU-PGN v1.0 (prose `.swupgn` + NDJSON `.swureplay`, two-file format). v1.0 has no
external adopters yet, so 1.1 is a clean breaking redesign rather than a compatible increment.

---

## 1. Purpose

A single, self-contained text file that records a Star Wars Unlimited game so completely that it can be
**reconstructed perfectly, with no game engine, indefinitely**. It must support coaching annotation and
what-if exploration, be **cheap to generate** (no added load on the live system), and be specified to a
**W3C/RFC grade** so other tools can build on it as a standard.

This serves two phases:
- **Today:** a file a user downloads, replays, and gets coaching from.
- **Tomorrow (designed-for, not built here):** every game streamed to a data store for mining and discovery.

### Goals
1. Complete capture → perfect, engine-free reconstruction, forever.
2. Coaching annotation (notes, glyphs, alternate lines).
3. What-if: engine-free variation lines + seed-driven re-simulation.
4. Low generation cost (no added server load; generation gets *lighter* than v1.0).
5. Definitive, W3C/RFC-grade spec other tools rely on.

### Non-goals (this cycle)
- Interactive coaching / replay UI.
- Live streaming pipeline to a data store.
- Full legal-action-space enumeration at every priority window.

These are designed-for (the format and schema accommodate them) but not implemented in 1.1.

---

## 2. Locked decisions (with rationale)

| # | Decision | Choice | Why |
|---|----------|--------|-----|
| D1 | **Topology** | One file: readable tag-header + NDJSON body. Drop the stored prose file; define a normative renderer. | Kills dual-file drift + the PII surface; keeps a cozy human header; body is streamable/greppable/mine-able. Mirrors how SGF/PGN won as single self-describing text standards. |
| D2 | **Reconstruction** | **Event-sourcing**: a complete event-delta log is the self-contained source of truth, rebuilt by a trivial fold (no engine). Seed + inputs captured separately. | "Perfectly reconstructed years from now" argues *against* re-simulation as truth (engine/card drift breaks it). A complete delta log folds to state forever with no engine. Cheap to record (tap events the engine already fires). |
| D3 | **What-if** | Both: engine-free variation/annotation lines **and** seed+inputs re-sim hook. | Variations work forever with zero engine (archival). Seed+inputs let a contemporary engine produce real branches when available. |
| D4 | **Deliverable scope** | Normative spec + reworked generator + reference reader library. | Makes the download→replay→coach path real day one without pulling "tomorrow" (UI, streaming) into today. |
| D5 | **Identity/privacy** | Pseudonymous salted-hash player IDs + a `Perspective` tag. No real usernames. | Privacy-safe by construction; the PII gate stays enforceable; stable per-player linking for phase-2 mining; downloader still knows which seat is theirs. |
| D6 | **Decision context** | Capture choices **as presented** (`offered[]` + `chose`); defer full legal-action enumeration. | The engine already computes prompt options, so capture is near-free; turns every decision into a labeled coaching example without measurable load. |

**Resolved open items:** file extension stays `.swupgn` (single file, brand continuity); version label is
`SWU-PGN/1.1` (noting the breaking supersede of the unreleased 1.0).

### Cross-domain influences
- **Chess PGN:** tag-pair header; NAG annotation glyphs (`!`, `?`, `!!`, `?!`); parenthesized variation sub-lines.
- **Go SGF:** one self-describing text format that became the universal standard; tool ecosystem builds on it.
- **Poker hand histories:** complete, explicit per-action deltas so any consumer reconstructs without shared logic.
- **Esports replays / HSReplay:** event-sourced "powerlog" + seed-driven determinism; events are the truth, snapshots are derived.
- **Data engineering:** event sourcing + JSON Lines for stream alignment; columnar-friendly flat schemas; RFC/W3C conformance language, schema registries, and published test vectors for interoperability.

---

## 3. File format

One file, `.swupgn`, UTF-8, three plain-text layers.

```
[Header tags]              # PGN-style [Tag "Value"], human-cozy
%%% DECKS                  # section banner
{json record}
%%% SETUP
{json record}
%%% EVENTS
{json record}
%%% ANNOTATIONS            # optional, append-only
{json record}
```

**Parser rule (the entire grammar):**
- line starts with `[` → header tag
- line starts with `%%%` → section banner
- blank line → ignored
- otherwise → one NDJSON record belonging to the current section

Trivial to parse, trivial to grep, friendly to streaming and to columnar ingestion later.

Media type (to be registered in the spec): `application/vnd.swu-pgn`.

### 3.1 Header / provenance
```
[Game "SWU-PGN/1.1"] [GameId "01J…"] [Date "2026-06-16T14:22:01Z"]
[Format "Premier"] [CardPool "LOF"] [Engine "forceteki@2.3.1"]
[Seed "a3f9c1…"] [Perspective "P1"]
[P1Id "sha256:9f3a…"] [P2Id "sha256:1c77…"] [P1 "Player 1"] [P2 "Player 2"]
[P1Leader "SOR#010"] [P1Base "SOR#028"] [P2Leader "SOR#005"] [P2Base "SOR#020"]
[Result "P1"] [Reason "BaseDestroyed"] [Rounds "4"]
```
- `CardPool` + `Engine`: provenance that keeps the file interpretable and joinable as the game evolves.
- `Seed` + `Perspective` + salted `P1Id`/`P2Id`: per D5 (privacy) and D3 (re-sim).
- `Date` is full ISO-8601 UTC.

### 3.2 Entity reference model
- Cards: `SET#NUM`, with per-instance copy suffix (`SOR#095:2`).
- Tokens: `TOKEN:Name:n`.
- Addressable bases/zones/instances (e.g. `base@2`, `ground:SOR#108:1`).
- Card **stats are never embedded** — readers join to the card DB by id, pinned by `CardPool`. Keeps files
  small, normalized, and reproducible.

---

## 4. Event model (the core)

Every record shares an envelope: `{ "seq": string, "t": string, "p": 1|2?, …delta }`.

**Completeness contract (normative):** every state mutation MUST emit an event carrying its own outcome as an
explicit delta. Examples:
- `DAMAGE` carries `hp` (remaining), `src`, `tgt`, `amt`, `damageType`
- `MOVE` carries `from`, `to`
- `DRAW` carries `cards[]`
- `TOKEN_GAIN`/`STATUS_TOKEN`/`SHIELD_GAIN`/`EXPERIENCE_GAIN` carry counts/targets
- `PLAY`/`DEPLOY_LEADER` carry `card`, `zone`, `cost`
- `ATTACK` carries `atk`, `def`/`defenderType`

This explicitness is what makes the fold (§5) engine-free.

### 4.1 Events to wire for completeness
v1.0 leaves several mutations un-emitted (the "reserved" enum values + others). 1.1 wires them so the stream
folds to full state: `MULLIGAN`, `KEEP_HAND`, `MODAL_CHOICE`, `ABILITY_ACTIVATE`, `SHIELD_GAIN`/`SHIELD_USE`,
`EXPERIENCE_GAIN`, `STATUS_TOKEN`, `MOVE`, `OVERWHELM`, upgrade attach/detach, `EXHAUST`/`READY`, initiative
pass/claim. The completeness check (§5) is the backstop that proves nothing is missing.

### 4.2 Decision context
A `CHOICE` record captures what the engine offered and what was picked:
```
{"seq":"R2.A.3","t":"CHOICE","p":1,"prompt":"play/attack/pass",
 "offered":["PLAY SOR#108","ATTACK SOR#108->base","PASS"],"chose":1}
```
Sourced from the prompt the engine already built → near-zero added load. Each decision becomes a labeled
coaching example ("you had ATTACK available and passed").

### 4.3 Determinism inputs
`%%% SETUP` records the seed-driven initial deck order and every player input in order, enabling re-simulation:
```
{"seq":"R1.S.0","t":"INIT","p1DeckOrder":["SOR#087", …],"p2DeckOrder":[ … ]}
```

---

## 5. State reconstruction — the fold

The spec defines:
1. A **canonical reduced-state shape** (the materialized board: per-player zones, per-instance damage/upgrades/
   tokens/exhaust, resources, base HP, initiative, phase, round).
2. A **per-event reduction rule**: `reduce(state, event) → state`.

The reference reader implements a dumb deterministic fold — **no rules engine**. `stateAt(seq)` folds up to
that seq.

**Sparse keyframes** (~1 per round) are written inline:
```
{"seq":"R2.start","t":"ROUND_START","keyframe":{ …full reduced state… }}
```
They serve two jobs:
- **Fast seek/scrub** for a viewer (jump to nearest keyframe, fold forward).
- **Completeness checksum:** in CI/dev the generator asserts `fold(events_up_to_keyframe) ==
  engine.getState()`. If they ever diverge, an event delta is missing — the contract is enforced mechanically.

Keyframes are an optimization + assertion, **not** the source of truth. The full event log alone is sufficient
to reconstruct everything.

---

## 6. Determinism & re-simulation

`Seed` + initial deck order (§4.3) + the ordered input log = enough for a contemporary engine to reproduce the
game and to explore real branches (change an input, re-run). This is a **bonus capability**, never a
reconstruction dependency — engine drift would break re-sim, but the event fold never breaks.

---

## 7. Annotation & variation layer

Append-only `%%% ANNOTATIONS`; never mutates the canonical game.
```
{"ref":"R1.A.5","nag":"?!","text":"hold Viper for tempo","by":"coach:9f3a"}
{"ref":"R2.A.3","line":[{"t":"PLAY","card":"SOR#137","zone":"ground"}],"text":"AT-ST tempo line"}
```
- `nag`: chess-style annotation glyphs.
- `line[]`: an engine-free variation (a hypothetical sequence of events/inputs).
- `by`: pseudonymous author; multiple annotation sets (different coaches) merge cleanly.

This is the coaching substrate, and it keeps the recorded game immutable.

---

## 8. Normative human renderer

The spec defines the exact `events → prose story` mapping (the readable account that v1.0 stored as the second
file). The reference reader ships `render(events) → text`, deterministic so any conforming tool renders
byte-identically. This is how "one file" still gives humans the readable story on demand.

---

## 9. Versioning & governance (W3C/RFC-grade)

- **RFC-2119** conformance language (MUST/SHOULD/MAY).
- **Conformance classes:** Producer, Reader-fold, Reader-render, Annotator. A tool declares which it implements.
- **Schemas:** a published JSON Schema per record type + an ABNF for the file envelope.
- **Test-vector suite:** canonical sample `.swupgn` files + expected folded states + expected renders, so any
  third party can self-certify.
- **SemVer** + a documented deprecation/evolution policy; readers MUST tolerate unknown record types and tags
  (forward compatibility).
- **Media type** registered (`application/vnd.swu-pgn`).
- **Spec document structure:** Abstract · Status · Conformance · Terminology · File grammar (ABNF) · Header tags
  · Record schemas · State model & fold · Determinism · Annotations · Rendering · Security & Privacy
  Considerations · Versioning & evolution · IANA media type · Test vectors · Appendices.

---

## 10. Privacy & security

- Salted-hash player IDs (§3.1); `Perspective` tag; spectators stripped (already fixed on this branch).
- **Automated PII gate in CI:** assert no real username/id appears in any generated file (regression guard for
  the spectator-leak class we just fixed).
- Dedicated **Security & Privacy Considerations** section in the spec (salt management, what is/ isn't
  reversible, perspective leakage, annotation authorship).

---

## 11. Reference reader library (in-repo, no engine dependency)

A small TypeScript package exposing:
- `parse(file) → { header, decks, events, annotations }`
- `fold(events) → state`, `stateAt(events, seq) → state`
- `render(events) → string` (normative human story)
- `validate(file) → ConformanceReport`

No dependency on the SWU rules engine. This is what makes the downloaded file genuinely replayable and
coachable on day one, and it is the executable reference for the spec.

---

## 12. Generator changes (low-load discipline)

Evolve the existing `PgnReplayRecorder` + `Game` wiring to emit the single `.swupgn` file:
- **Drop per-action `getState()` full snapshots** (v1.0's main generation cost) in favor of event deltas +
  sparse keyframes. Net generation cost goes *down*.
- Add: `Seed` capture, initial deck order, provenance tags (`CardPool`, `Engine`, `GameId`, `Date`), salted-hash
  IDs, `Perspective`, `CHOICE` capture from existing prompts.
- Wire the missing events (§4.1).
- The fold-vs-engine completeness check runs in **CI only**, never in production request handling.
- Continue to serve only after game end (existing `isEnded` gate) and via the existing cached-artifact path.

---

## 13. Migration & testing

- **Migration:** 1.1 cleanly supersedes the unreleased 1.0; remove the prose-file generation path and the
  two-file packaging.
- **Tests:**
  - Generator completeness: `fold(events) == engine.getState()` at every keyframe.
  - Determinism: re-simulation from `Seed` + inputs reproduces the event log.
  - Reader: `parse`/`fold`/`render`/`validate` against the test vectors.
  - Schema validation of every emitted record.
  - **PII scan**: no real username/id in any generated file (the regression we just fixed, now a gate).
  - Full round-trip: generate → parse → fold → render.

---

## 14. Phase-2 forward-compat (design-for, build-none)

- Keep event fields **flat and typed** so they map 1:1 to a columnar sink (Parquet/Arrow) later.
- Reserve a **streaming envelope** shape so per-game NDJSON lines can be appended to a stream without reshaping.
- No streaming, no warehouse, no UI in 1.1.

---

## 15. Deliverables for this plan

1. The normative **SWU-PGN/1.1 specification** document (W3C/RFC-grade, §9 structure) + JSON Schemas + ABNF +
   test vectors.
2. The reworked **generator** producing the single `.swupgn` file (§12).
3. The **reference reader library** (§11).
4. Test suites (§13), including the CI completeness, determinism, and PII gates.

Next step: an implementation plan (writing-plans) decomposing these into ordered, testable units.
