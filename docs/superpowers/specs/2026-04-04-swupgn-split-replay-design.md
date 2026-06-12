# Split SWU-PGN into Two Files with Full State Snapshots

**Date:** 2026-04-04
**Status:** Approved

## Problem

The current `.swupgn` file combines human-readable notation and machine-parseable replay data in a single file. The machine replay section only captures summary game state (aggregate counts like `p1GroundUnits: 3`) rather than full board state, making it impossible to build a visual game replay viewer without reconstructing state from scratch. Additionally, adding full `getState()` snapshots to the parseable section would make the combined file much larger.

## Solution

Split the single `.swupgn` file into two files, packaged as a zip download:

- **`.swupgn`** — Human-readable file (header + card index + freeform notation)
- **`.swureplay`** — Machine replay file (header + card index + JSON-lines with full state snapshots)

## File Formats

### `.swupgn` (Human-Readable)

Structure unchanged from current format, minus the `=== PARSEABLE ===` section:

```
[Header Block]           <- Chess-PGN style metadata tags (unchanged)

═══ CARD INDEX ═══       <- Full decklists (unchanged)
── P1 Decklist ──
...
── P2 Decklist ──
...

=== FREEFORM ===         <- Section marker
[Game Notation]          <- Round-by-round human notation (unchanged)
```

### `.swureplay` (Machine Replay)

```
[Header Block]           <- Same header as .swupgn

═══ CARD INDEX ═══       <- Same card index as .swupgn
...

=== REPLAY ===           <- Section marker (was "PARSEABLE")
{"seq":"R1.A.1","type":"PLAY","player":"Player 1","card":"JTL#133",...}
{"seq":"R1.A.1a","type":"TRIGGER","card":"JTL#133","player":"Player 1"}
{"seq":"R1.A.1b","type":"GAME_STATE","snapshot":{...full getState() object...}}
{"seq":"R1.A.2","type":"ATTACK",...}
...
```

The `GAME_STATE` records now contain a `snapshot` field with the full serialized game state — the same object shape that `Game.getState()` produces for spectators. This is emitted after every top-level action.

### Zip Package

```
game-YYYY-MM-DD-{shortId}.zip
  game.swupgn       # Human-readable
  game.swureplay    # Machine replay
```

## Snapshot Details

### What the snapshot contains

The snapshot is the output of `player.getStateSummary(anonymousSpectator)` for each player, plus game-level fields. This includes:

- Per-player: full card state for every zone (ground arena, space arena, resources, discard, hand size, base, leader), including individual card damage, upgrades, exhausted status, tokens
- Game-level: phase, initiative, round number, game mode

### Anonymization

Before serialization into the replay file:
- Player names replaced with "Player 1" / "Player 2"
- Player IDs replaced with "P1" / "P2"
- Same anonymization rules already used for freeform notation

### Size estimate

Full `getState()` snapshots are ~2-5KB each as JSON. A 6-round game with ~60 top-level actions produces ~120-300KB of replay data. In a zip, this compresses to ~30-60KB.

## Files to Modify

| File | Change |
|------|--------|
| `server/game/core/chat/PgnTypes.ts` | Add `ISwuReplayData` interface; update `ISwuPgnData` for two-file output |
| `server/game/core/chat/PgnReplayRecorder.ts` | Modify `emitGameState()` to capture full `getState()` snapshot; store snapshots alongside event records |
| `server/game/core/chat/SwuPgn.ts` | Split `formatFile()` into `formatHumanFile()` and `formatReplayFile()`; change replay section marker from `PARSEABLE` to `REPLAY` |
| `server/game/core/Game.ts` | Update `generateSwuPgn()` to produce both files; cache both; update `getState()` to send both to clients |
| `server/gamenode/Lobby.ts` | Update `getGameLog()` to return both files; add zip packaging using `archiver` or `jszip` |
| `package.json` | Add zip library dependency if needed |

## What Does NOT Change

- All granular event recording (PLAY, ATTACK, DAMAGE, TRIGGER, etc.) — stays in `.swureplay` alongside snapshots
- Human-readable freeform notation generation
- Card index format
- Header format
- Event types and sequence numbering

## Design Decisions

1. **Both files include header + card index** — Makes each file self-contained; either can be opened standalone without the other. The overhead is minimal (a few KB).

2. **Granular events kept alongside snapshots** — Events enable animation/narration in a future replay viewer ("Player 1 attacks with X" before showing the resulting state). They're tiny compared to snapshots.

3. **Section marker changed to `=== REPLAY ===`** — Distinguishes from the old `=== PARSEABLE ===` format and communicates the file's purpose.

4. **`.swureplay` extension** — Clean, distinct from `.swupgn`, clearly communicates purpose, keeps the `swu` prefix.

5. **Zip packaging** — Keeps the two files together as a single download. Good compression ratio on JSON data.
