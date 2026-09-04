# Prompt: SWU-PGN/1.0 replay support in forceteki-client

Paste this into forceteki-client. It is self-contained.

> **If the client already has a replay viewer** (it does, on `swu-game-notation`), use
> [client-swupgn-upgrade-prompt.md](client-swupgn-upgrade-prompt.md) instead — this document
> describes building one from scratch.

---

## What you're building

Replay support for **SWU-PGN/1.0**, the single-file game format forceteki now writes. One
`.swupgn` text file holds a complete game: readable prose, both decklists, a card-name
index, and every state change as a typed event.

Two deliverables:

1. **Read view** — show the game as a readable story. This is nearly free: the file already
   contains the rendered narrative.
2. **Replay view** — step/scrub through the game with a live board.

The normative spec is `docs/SWU-PGN-1.0-SPEC.md` in the forceteki repo. The executable
reference reader is the `swupgn/` module there — engine-free, dependency-light, and directly
reusable. **Reuse it rather than reimplementing the fold.**

## Where the file comes from

`Lobby.getGameLog(socket, callback)` over the existing socket, callback shape:

```ts
{ swuPgnFile?: string } | { error: string }
```

It is gated on the game having ended (`'Game is still in progress'` otherwise), because
mid-game the file would leak hidden information. Support file upload too — these are
portable artifacts people will share.

## The file

UTF-8 text, LF endings. Bracketed header tags, then six `%%%` sections.

```
[Game "SWU-PGN/1.0"]
[GameId "…"] [Date "2026-09-04T15:58:16.695Z"]
[Format "premier"] [CardPool "ASH,HMW,…"]
[Engine "forceteki@0.1.0"] [Seed "d6795517-…"]
[P1 "Player 1"] [P2 "Player 2"] [P1Leader "SOR#010"] [P1Base "SOR#027"] …
[Result "P1"] [Reason "Base Destroyed"] [Rounds "7"]

%%% STORY      ← PLAIN TEXT, not JSON. The game, written out.
%%% DECKS      ← NDJSON: one decklist per player
%%% CARDS      ← NDJSON: {"id":"SOR#108","name":"Wampa","kind":"unit"}
%%% SETUP      ← NDJSON: the INIT record (post-shuffle deck order)
%%% EVENTS     ← NDJSON: every state change, in order
%%% ANNOTATIONS← NDJSON: notes added afterwards (may be empty)
```

Every section except `STORY` is newline-delimited JSON, one object per line. **`STORY` is
prose** — do not `JSON.parse` it, keep its lines verbatim including blanks.

Sections may appear in any order; `STORY` is written first so opening the file shows the
game. A file may omit `STORY`, `CARDS` and `ANNOTATIONS` and still be valid.

## Two things that make this easy

**`%%% CARDS` means you need no card database to show names.** Every id the file mentions
maps to a display name. Strip the `:N` copy suffix before lookup (`baseId()`); fall back to
the raw id if an entry is missing.

**`%%% STORY` means the read view is already done.** It is the rendered narrative — render
it in a monospace block and you have a working feature. It is *derived*, so you can compare
it to `render(parse(text))` — but see the note at the bottom: its wording is advisory, so a
difference is not an error.

```
══════════════════════════════════════════════════════════════════════════════
 ROUND 7                                                 initiative: Player 2
 P1  base 16/33   hand 3   resources 7
      ground: Kelleran Beq, The Sabered Hand
      space: Bravo Squadron Fighter  ·  Emissary's Sheathipede #2 [1 dmg]
 P2  base 22/28   hand 2   resources 5
══════════════════════════════════════════════════════════════════════════════

 ── action ──
  1. Player 2 attacks Kelleran Beq, The Sabered Hand with Darth Maul, Sith Revealed
       ↳ 5 damage to Kelleran Beq, The Sabered Hand — 1 HP left
       ↳ Darth Maul, Sith Revealed is defeated
  2. Player 1 attacks Player 2's base with Kelleran Beq, The Sabered Hand
       ↳ 2 damage to Player 2's base — 0 HP left
       ↳ *** Player 1 wins — Base Destroyed ***
```

Numbered lines are actions a player chose; indented `↳` lines are consequences of the action
above. That grouping is real data, not formatting — action `R2.A.3` owns `R2.A.3a`,
`R2.A.3b`, …

## The reader API

```ts
import { parse, validate, fold, stateAt, render, checkKeyframes, baseId } from 'swupgn';
import type { CardKind, ReducedState, GameEvent } from 'swupgn';

const doc = parse(text);          // { header, story, decks, cards, setup, events, annotations }
validate(text);                   // { valid, formatVersion, issues[] }  — warnings are OK
const board = fold(doc.events);   // final ReducedState
const at = stateAt(doc.events, 'R3.A.5');   // state after that event
render(doc);                      // the story; uses doc.cards, no card DB needed
checkKeyframes(doc.events);       // { ok, mismatches[] } — is the file honest?
```

`ReducedState` is the whole board:

```ts
{ round, phase: 'setup'|'action'|'regroup', initiative: 1|2|null,
  players: { 1?: PlayerState, 2?: PlayerState } }

PlayerState { seat, baseHp, baseMaxHp, handSize, hand[], resourcesReady,
              resourcesExhausted, credits, hasForce, discard[], cards[] }

CardInstanceState { id, zone, damage, exhausted, upgrades[], shields,
                    experience, statusTokens: Record<string, number> }
```

`cards[]` holds **only** ground/space arena cards. Hand, resources and discard are the
count fields and the `hand`/`discard` arrays.

## Rules you must not get wrong

These are the ones that produced real bugs. Each is cheap to honour and expensive to miss.

**1. `MOVE` is the single source of truth for zone changes.** Hand size, ready-resource
count and arena membership are all reconstructed from `MOVE`. `DRAW`, `RESOURCE`, `PLAY` and
`DISCARD` are *summaries* that sit beside the MOVEs — they exist for the narrative. Counting
both double-counts. If you use `fold()` this is already handled.

**2. A keyframe REPLACES your state — it is not a patch.** `ROUND_START` and `ROUND_END` may
carry a `keyframe`; when one does, throw away your running state and adopt it, and do *not*
also apply that event's normal rule. This gives you O(1) jump-to-round for the scrubber.
If you ever see a keyframe missing a seat, **ignore that keyframe** and keep folding —
adopting it would delete a player whose state you have correctly.

**3. A status token at zero is DELETED, not kept as `{advantage: 0}`.** Removal is the same
event with a negative count: `{"t":"STATUS_TOKEN","card":"SOR#095","token":"advantage","count":-1}`.
Clamp at zero and drop the key — engine keyframes write an untokened unit as `statusTokens: {}`,
and comparison is by JSON equality, so keeping the zero key fails against a correct file.
Same shape for `EXPERIENCE_GAIN` (negative count) and `SHIELD_GAIN`/`SHIELD_USE`.

**4. Never decide "is this in an arena?" from the card id — use `kind`.** `MOVE` and
`CREATE_TOKEN` carry `kind: 'unit' | 'upgrade'`, and `%%% CARDS` entries carry it too so you
can classify from an id alone. An `upgrade` attaches to a unit and is **never** a member of
`ground`/`space`. This matters because `Shield`, `Experience`, `Advantage` and `Weakness` are
token *upgrades* while `Battle Droid`, `X-Wing`, `TIE Fighter`, `Clone Trooper`, `Mandalorian`,
`Spy` and `Beast` are token *units* — and all of them are `TOKEN:<name>#<id>`. If you have
hardcoded a list of upgrade names, delete it: it breaks the day a new token upgrade prints.

**5. Placement is idempotent by id.** A card's arrival is reported twice — once as the `MOVE`
and once as the `PLAY`/`DEPLOY_LEADER` summary beside it. Place once. Getting this wrong
duplicates every unit in play, which keyframe snapping hides but `stateAt()` between two
keyframes does not.

**6. Card ids.** `SET#NUM` (`SOR#108`), with `:N` for the Nth copy in the game
(`SOR#108:2` — a stable per-instance identity, so `EXHAUST` never hits the wrong copy).
Tokens are `TOKEN:<name>#<numericId>`, e.g. `TOKEN:advantage#5844562972`. The number is the
real card id your image pipeline keys on. Strip `:N` for name and art lookup; keep the full
id for identity.

**7. Token-upgrade `MOVE`s carry `attachedTo`** naming their host unit. Use it. Do not infer
the host from which event happens to sit next to it.

**8. `from`/`to` on a `MOVE` are always non-empty and always different.** Legal zones, and
this list is complete: `deck`, `hand`, `resource`, `ground`, `space`, `discard`, `base`,
`outsideTheGame`, `capture`. Only `ground` and `space` are "in play".

**9. Unknown event types are no-ops.** Warn, never throw. This is the forward-compatibility
contract that lets new event types ship in a minor version.

**10. Base targets are `base@N`** (`base@1`, `base@2`). Anything else in a `tgt`/`def` field
is a card id.

## Suggested build

**Phase 1 — read view.** Parse, show the header as a match summary (leaders, bases, result,
reason, rounds), render `%%% STORY` in a monospace block. Verify it against
`render(parse(text))` and warn if they differ. Add a download button. This is most of the
value.

**Phase 2 — replay view.** Transport controls (play/pause, speed, step, scrub). Seek by
`stateAt(events, seq)`; for scrubbing, jump to the nearest preceding keyframe and fold
forward from there rather than folding from zero. Render the board from `ReducedState`:
two bases with HP, resource counts, hand counts, the two arenas with damage / exhausted /
shields / experience / status tokens per card. Highlight the card an event touches. Show
the current story line beside the board — you already have it, and it tells the viewer
*why* the board just changed.

**Phase 3 — analysis.** `%%% ANNOTATIONS` are append-only notes keyed to a `seq`, with
optional chess-style NAG glyphs (`!`, `?`, `!!`, `??`, `!?`, `?!`) and an optional `line`
holding a hypothetical variation. Never fold a variation into the real game. `CHOICE` events
record what a player was *offered* and what they took — that is the raw material for "what
did they pass up?".

## Sanity checks worth wiring in

Cheap, and they catch a bad file before a user reports a confusing replay:

- `validate(text).valid` — errors are fatal, warnings are fine.
- `checkKeyframes(events).ok` — the fold reproduces every keyframe.
- `render(doc)` matches `%%% STORY` — a mismatch is worth logging, not rejecting.
- Every card id you display resolves in `%%% CARDS`.
- `header.engine` is not `forceteki@unknown` and `header.seed` is not `unseeded` — both are
  sentinels meaning the file is untraceable / not deterministically replayable. Not errors;
  worth surfacing.

## Version: match the string, do not compare it

**A file that says `SWU-PGN/1.1` is OLDER than `1.0`, not newer.** The format was numbered
1.1 during development and corrected to 1.0 at publication, so version numbers do not order
this format. Match the `Game` tag exactly; never use `>=`.

If you support pre-release files, these are the differences you will see, all detectable
from the file: tokens as `TOKEN:<Title>` with no `#<numericId>`; no `%%% CARDS`; no
`%%% STORY`; no `attachedTo`; no `kind`; no `RESOURCE` records; token gains with no matching
removal; `MOVE`s with `from: ""` or `from === to`; and possibly keyframes missing a seat.
Spec §22.1 lists what to do about each. Without `kind` you cannot classify a token at all —
the least-bad fallback is to treat a token as an upgrade when its `MOVE` carries
`attachedTo`, otherwise as a unit, and let the keyframe win when they disagree.

## A note on `%%% STORY`

Its wording is **advisory**, not a wire format. Render it as prose; do not parse it, and do
not reject a file because re-rendering produces different wording — that will drift between
versions. What is stable is the structure: numbered lines are player actions, indented `↳`
lines are consequences of the line above, round banners introduce rounds. **`%%% EVENTS` is
always the truth.**

## Scale

A 7-round game is ~23 KB, ~250 lines. Parsing is `JSON.parse` per line. Do not build
streaming, virtualisation or a worker until you measure something slow.
