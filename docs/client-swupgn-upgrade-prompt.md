# Prompt: bring forceteki-client onto the current SWU-PGN/1.0 writer

Paste into forceteki-client (branch `swu-game-notation`). It assumes the replay viewer that
is already there and only describes what changed.

---

## Context

forceteki's SWU-PGN writer and its reference `swupgn/` reader changed again. Your vendored
reader in `src/lib/swupgn/` is behind, and the two workarounds you documented in
`VERSION.md` can now be deleted because the stream states what they were guessing at.

Everything below is verified against the current forceteki `swu-game-notation` branch:
`docs/SWU-PGN-1.0-SPEC.md` is the spec, `swupgn/` is the executable reference, and its
suite is green at 8201 specs.

Your baseline: 124 tests passing, 17 files.

## 1. Delete the hardcoded token-upgrade list — the stream now states the kind

**This is the one you asked for.** `MOVE` and `CREATE_TOKEN` now carry
`kind: 'unit' | 'upgrade'`, and every `%%% CARDS` entry carries it too:

```json
{"t":"MOVE","card":"TOKEN:advantage#5844562972","to":"ground","kind":"upgrade","attachedTo":"SOR#095"}
{"id":"TOKEN:advantage#5844562972","name":"Advantage","kind":"upgrade"}
{"id":"SOR#095","name":"Battlefield Marine","kind":"unit"}
```

It is derived from the card's **type** (`isUpgrade()` / `isUnit()`), not from a name list, so
a token upgrade printed next year classifies itself.

First add the field to `src/lib/swupgn/types.ts`, which does not have it yet — there is no
`CardKind` type, `MOVE`/`CREATE_TOKEN` have no `kind`, and `CardIndexRecord` has only
`id`/`name`:

```ts
export type CardKind = 'unit' | 'upgrade';
// MOVE:              ... attachedTo?: string; kind?: CardKind;
// CREATE_TOKEN:      ... hp?: number; kind?: CardKind;
// CardIndexRecord:   ... name: string; kind?: CardKind;
```

Then in `src/lib/swupgn/tokens.ts`, `STATUS_TOKEN_NAMES` (line 35) and `isStatusTokenCard` are
the latent bug you flagged. Rework them so:

- when the record carries `kind`, that wins — no name matching at all;
- the name set survives **only** as the fallback for pre-1.0 files that have no `kind`, and
  its comment should say that is now its only job;
- `%%% CARDS` gives you `kind` by id, so classification works even for a record that lacks it.

Callers to update: `fold.ts:2,140`, and the re-export in `index.ts:16`.

## 2. Two fold bugs still in your copy

Both are fixed in the reference; port them.

**`fold.ts:158-166` — `PLAY_UPGRADE` puts a phantom card in the arena.** When `target` is
missing or its host isn't tracked, the fallback calls `placeInArena`. An upgrade is *never*
an arena card. This is not hypothetical: folding a real recorded game showed `SEC#038`, an
ordinary upgrade, sitting in P2's ground arena. Delete the fallback — if the host isn't
tracked, the attachment simply isn't modelled.

**`fold.ts:169-170` — `CREATE_TOKEN` pushes unconditionally.** Two problems: it is not
idempotent by id (unlike `placeInArena`, which you already fixed for `PLAY`), and it ignores
`kind`. Use `placeInArena`, and skip entirely when `kind === 'upgrade'`.

While you're in `applyMoveCounts`: when `kind === 'upgrade'`, skip the arena-membership block
but **keep** the hand and resource counts — an upgrade really does leave the hand.

## 3. Placeholder token ids are gone

`formatTokenId` now requires a numeric id, so Weakness and Beast — whose card data carries
`weakness-id` / `beast-id` — emit `TOKEN:weakness`, not `TOKEN:weakness#weakness-id`.

Your `tokenArtId()` already returns `undefined` for a non-numeric segment, so this needs no
change. Worth a test pinning it, since the shape now appears in real files.

## 4. `integrity.ts` will false-alarm on every current file

Your `checkKeyframes` compares `baseHp` at **every** keyframe, including the first. The
reference now exempts the first one, because nothing in the event stream carries a base's
starting HP: `emptyState()` seeds a placeholder 30, real bases are 33 and 28, and the first
keyframe is what *supplies* the true value. Comparing there tests the placeholder, not the
file — so a perfectly good game reports two spurious `players.N.baseHp` mismatches at
`R1.start`.

It is latent today: `checkKeyframes` is exported from `index.ts:17` but nothing in `src/app`
calls it. It stops being latent the moment you wire it in as a file-health check, which is
worth doing. Port the reference version — thread a `checkBaseHp` flag through
`diff`/`diffSeat`, false until the first keyframe has been seen. Every other field is still
compared at every keyframe, first included.

## 5. `%%% STORY` is parsed but never shown — that's the cheapest feature left

`parse.ts` fills `doc.story` and nothing reads it. The file carries a complete, readable
narrative with real card names, board summaries at every round, and consequences indented
under the action that caused them:

```
══════════════════════════════════════════════════════════════════════════════
 ROUND 2                                                 initiative: Player 2
 P1  base 28/30   hand 3   resources 5
      ground: Battlefield Marine
 P2  base 25/30   hand 2   resources 5
══════════════════════════════════════════════════════════════════════════════

 ── action ──
  1. Player 2 plays Vanquish (5 resources)
       ↳ Gallofree Transport is defeated by Vanquish
       ↳ Battlefield Marine gains 1 advantage
  7. Player 1 attacks Player 2's base with Battlefield Marine
       ↳ 5 damage to Player 2's base — 25 HP left
```

Add a **Story** tab to `ReplayPanel.tsx` (`TabKey` at line 18) that renders `doc.story` in a
monospace block, and make each numbered line clickable to `seekToSeq` — `TurnDigests.tsx`
already does that, so the pattern exists.

Two rules:

- **Do not parse it.** Its wording is advisory and may change between writer versions.
  `%%% EVENTS` is always the truth.
- Do not reject a file because re-rendering produces different prose. Log at most.

What *is* stable is the structure: numbered lines are player actions, indented `↳` lines are
consequences of the line above, banners introduce rounds.

Fall back to your own `render(doc)` when `doc.story` is empty, so pre-1.0 files still get a
Story tab.

## 6. Let people watch a replay without a round trip through the filesystem

`DownloadGameLog.tsx:17` already calls `getGameLog` and downloads the file. Add a
**"Watch replay"** action beside it that hands the same string straight to the replay viewer.
Today the only route in is `FileUpload.tsx`, so a player has to download and re-upload their
own game.

## 7. Re-vendor, and shrink `VERSION.md`

Re-vendor `src/lib/swupgn/` from forceteki `swupgn/src/`. Two of your documented divergences
are now upstream and should be **deleted from `VERSION.md`**, not re-applied:

- **`parse.ts` `[Rounds]` fallback** — upstream now does `Number.isFinite(n) ? n : 0`.
- **`fold.ts` keeping token upgrades out of arenas** — upstream does this via `kind`.

Keep and keep documenting:

- **`types.ts`** — your `Annotation` extras (`id`/`parent`/`ts`) for threaded discussion.
- **`fold.ts` `snapToKeyframe()` merging per seat.** Upstream *replaces* wholesale, and the
  spec now says a reader meeting a keyframe missing a seat should ignore it. Your merge is
  strictly friendlier for the 1.1 files already in the wild — keep it, and note that current
  writers always emit both seats so it is a compatibility shim, not a permanent divergence.
- **`tokens.ts`** — reduced to pre-1.0 fallbacks per item 1.
- **`serialize.ts`** — client-owned.

`validate.ts` stays omitted (Node-only).

## 8. Version numbers do not order this format

**A file that says `SWU-PGN/1.1` is OLDER than `1.0`.** The format was numbered 1.1 during
development and corrected at publication. Match the `Game` tag exactly; never `>=`.

Your fixture `src/lib/swupgn/__tests__/fixtures/sample-game.swupgn` and several
`parse.test.ts` cases still say `1.1`. Keep at least one of each on purpose — you want
coverage of both shapes — but make the intent explicit in the test names, because right now
it reads as staleness rather than as a compatibility test.

Differences you will see in a `1.1` file, all detectable from the file itself:
`TOKEN:<Title>` ids with no `#<numericId>`; no `%%% CARDS`; no `%%% STORY`; no `attachedTo`;
no `kind`; no `RESOURCE` records; token gains with no matching removal; `MOVE`s with
`from: ""` or `from === to`; possibly keyframes missing a seat. Spec §22.1 has the
row-by-row table.

## Definition of done

- `STATUS_TOKEN_NAMES` is fallback-only, and a comment says so.
- Folding a current file leaves **no** upgrade in either arena and **no** duplicate ids —
  assert this in a test that folds the fixture without keyframe snapping, which is what
  hid these bugs.
- A Story tab renders `doc.story`, with `render(doc)` as the fallback.
- `checkKeyframes` on a current file returns `ok: true` — no spurious first-keyframe
  `baseHp` mismatch.
- "Watch replay" opens a finished game directly from the lobby.
- `VERSION.md` lists only divergences that still exist.
- `npx vitest run` green (baseline: 124 tests).
