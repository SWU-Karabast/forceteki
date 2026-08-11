# Client-Side Replay Viewer & Zip Download — Implementation Prompt

## Background

We've split the server-side game notation into two files:

- **`.swupgn`** — Human-readable game notation (header, card index, freeform round-by-round log)
- **`.swureplay`** — Machine-replay file (header, card index, JSON-lines with granular events AND full `getState()` snapshots after every top-level action)

The server now sends both strings to the client:
- In `gameState` (sent via socket.io `gamestate` event): `gameState.swuPgn` and `gameState.swuReplay`
- Via `Lobby.getGameLog()` (socket.io callback): `{ rawLog, swuPgn, swuReplay }`

There are two pieces of client work to do:

1. **Update the download button** to produce a `.zip` containing both files (instead of separate downloads)
2. **Build a replay viewer** that lets someone upload a `.swureplay` file and watch the game play out visually

---

## Part 1: Zip Download

### Current State

The download UI lives in:
```
forceteki-client/src/app/_components/_sharedcomponents/Preferences/_subComponents/DownloadGameLog.tsx
```

It currently has two buttons:
- "Download Game Log" — downloads `gameState.rawGameLog` as `game-log.txt`
- "Download SWU-PGN" — downloads `gameState.swuPgn` as `game.swupgn`

### What to Change

Replace the "Download SWU-PGN" button with a "Download Game Files" button that creates a `.zip` containing:
```
game-YYYY-MM-DD.zip
  game.swupgn       # from gameState.swuPgn
  game.swureplay    # from gameState.swuReplay
```

Use the [JSZip](https://stuk.github.io/jszip/) library (or `fflate` which is lighter-weight) to create the zip client-side. No server changes needed.

The "Download Game Log" (txt) button can stay as-is for people who just want a quick text dump.

### Key File
```
forceteki-client/src/app/_components/_sharedcomponents/Preferences/_subComponents/DownloadGameLog.tsx
```

The existing `triggerDownload()` helper creates a Blob and triggers a download via a temporary `<a>` element — same pattern works for the zip blob.

---

## Part 2: Replay Viewer

### Overview

Build a new `/replay` page that lets someone upload a `.swureplay` file and watch the game play out visually — like spectate mode, but for an already-completed game, with transport controls (play/pause, speed, step forward/back, scrub bar).

### The `.swureplay` File Format

The file has three sections:
```
[Header]                    ← Chess-PGN style metadata tags
═══ CARD INDEX ═══          ← Full decklists with set IDs
=== REPLAY ===              ← JSON-lines: events + full state snapshots
```

After the `=== REPLAY ===` marker, each line is a JSON object. There are two kinds:

**Granular events** (for narration/animation):
```json
{"seq":"R1.A.1","type":"PLAY","player":"Player 1","card":"JTL#133","zone":"groundArena","playType":"playFromHand"}
{"seq":"R1.A.1a","type":"TRIGGER","card":"JTL#133","player":"Player 1"}
{"seq":"R1.A.1b","type":"DAMAGE","source":"JTL#133","target":"JTL#026","amount":2,"damageType":"ability","remainingHp":28}
```

**Full state snapshots** (for rendering the board):
```json
{"seq":"R1.A.1c-snapshot","type":"GAME_STATE","snapshot":{ ...full getState() object... }}
```

The `snapshot` field contains the exact same object shape that `Game.getState()` returns to spectators — the same shape that the existing `GameBoard`, `Board`, `OpponentCardTray`, `PlayerCardTray`, and card components already know how to render. **This is the key insight: you don't need to build new board rendering — you feed snapshots to the existing components.**

Snapshot records have a seq ending in `-snapshot`. They appear after every top-level player action (PLAY, ATTACK, PASS, CLAIM_INITIATIVE, DEPLOY_LEADER, etc.).

### Architecture

```
/replay page
  ├── File upload dropzone (accepts .swureplay or .zip)
  ├── ReplayParser (parses the file, extracts events + snapshots)
  ├── ReplayController (manages playback state: current position, speed, play/pause)
  ├── TransportControls (UI: play/pause, speed slider, step fwd/back, scrub bar, round nav)
  ├── GameBoard (existing component, fed snapshots as gameState)
  └── EventLog (shows freeform notation synced to current position)
```

### How Playback Works

1. **Parse** the `.swureplay` file into an ordered array of events
2. **Extract snapshots** — filter for records where `seq` ends with `-snapshot`. These are the "keyframes"
3. **Playback** steps through snapshots sequentially. Each snapshot IS a complete `gameState` object
4. **Between snapshots**, show the granular events (PLAY, ATTACK, DAMAGE, etc.) as narration text
5. **Transport controls** let the user:
   - **Play/Pause** — auto-advance through snapshots on a timer
   - **Speed** — 0.5x, 1x, 2x, 4x (controls the timer interval between snapshots)
   - **Step forward/back** — jump to next/previous snapshot
   - **Scrub bar** — slider from 0 to N (total snapshots), jump to any point
   - **Round navigation** — dropdown or buttons to jump to "Round 3, Action Phase"

### Feeding Snapshots to Existing Components

The `GameBoard` page (`forceteki-client/src/app/GameBoard/page.tsx`) reads game state from the `useGame()` context:
```typescript
const { getOpponent, connectedPlayer, gameState, lobbyState, isSpectator } = useGame();
```

For the replay viewer, you have two options:

**Option A (recommended): Create a ReplayProvider context** that mimics the `GameProvider` interface but is backed by the parsed replay data instead of a live socket. The replay page wraps its content in `<ReplayProvider>` instead of `<GameProvider>`. The existing board components work unchanged since they only read from context.

The `ReplayProvider` would expose:
- `gameState` — the current snapshot
- `connectedPlayer` — `"Player 1"` (default viewing perspective)
- `getOpponent()` — returns the other player ID
- `isSpectator` — always `true` (disable all interactive controls)
- `gameMessages` — empty or populated from event narration

**Option B: Wrap existing GameProvider** with replay-specific state overrides.

Option A is cleaner because it avoids socket.io connection logic entirely.

### Important: Player IDs in Snapshots

The snapshots have anonymized player data. The `players` object in each snapshot is keyed by `"Player 1"` and `"Player 2"` (not real user IDs). The `connectedPlayer` for the replay viewer should default to `"Player 1"` with a toggle to flip perspective.

### File Upload

The replay page should accept:
- Drag-and-drop a `.swureplay` file
- Drag-and-drop a `.zip` file (extract the `.swureplay` from within)
- Click to browse for a file

Use the same `JSZip`/`fflate` library from Part 1 for zip extraction.

### Routing

The client uses Next.js App Router. Create a new page at:
```
forceteki-client/src/app/replay/page.tsx
```

This page does NOT need the WebSocket provider. Check `forceteki-client/src/app/_components/ClientLayout.tsx` — it conditionally wraps pages with `GameProvider` based on the path. The `/replay` route should NOT be in the `pagesWithWebsocket` list.

### Existing Component Reuse

These existing components render the game board from `gameState`:

| Component | Path | What it does |
|-----------|------|-------------|
| `Board` | `_components/Gameboard/Board/Board.tsx` | Center area: ground/space arenas, leaders, bases |
| `OpponentCardTray` | `_components/Gameboard/OpponentCardTray/OpponentCardTray.tsx` | Top: opponent hand, resources, HP |
| `PlayerCardTray` | `_components/Gameboard/PlayerCardTray/PlayerCardTray.tsx` | Bottom: player hand, resources, HP |
| `GameCard` | `_components/_sharedcomponents/Cards/GameCard.tsx` | Individual card rendering with damage, upgrades, etc. |
| `LeaderBaseCard` | `_components/_sharedcomponents/Cards/LeaderBaseCard.tsx` | Leader and base card rendering |

These all read from the `useGame()` context. If your `ReplayProvider` provides the same interface, they should render correctly.

### Card Images

Card images are served from S3 and resolved via `s3Utils.ts`:
```typescript
s3CardImageURL(card, cardStyle?, cardback?)
// Returns: https://karabast-data.s3.amazonaws.com/cards/{set}/{format}/large/{number}.webp?v=2
```

Cards in the snapshot include `setId: { set, number }` which is what the image URL builder needs. This should work without changes.

### UI Design Notes

- **Theme**: The app uses MUI with a dark theme. Follow existing patterns (see `forceteki-client/src/app/_theme/theme.ts`)
- **Background**: Use the same board background as the game (`s3ImageURL('ui/board-background-1.webp')`)
- **Transport controls**: Position at the bottom of the screen as an overlay bar, similar to a video player
- **Event log sidebar**: Optional collapsible sidebar showing the freeform notation with the current position highlighted
- **Header info**: Show the game metadata (leaders, bases, result) from the file header at the top

### Implementation Order

1. **Install JSZip** (or fflate) in the client
2. **Update DownloadGameLog.tsx** — add zip download button
3. **Create `.swureplay` parser** — utility function that reads the file, extracts header, card index, events, and snapshots
4. **Create ReplayProvider context** — mimics GameProvider interface, backed by parsed replay data
5. **Create transport controls component** — play/pause, speed, step, scrub bar
6. **Create `/replay` page** — file upload, wires together parser + provider + existing board components + transport controls
7. **Test with real `.swureplay` files** — play a game on the server, download the files, upload to replay viewer

### Key Risks / Things to Watch

1. **Snapshot compatibility**: The snapshots contain the full `getState()` output. If the board components expect fields that aren't in the snapshot (e.g., `promptState` with specific button data), you may need to provide defaults. The spectator view already handles most of this since spectators don't get prompt data.

2. **Player ID mismatch**: The existing components use real player UUIDs as keys. The snapshots use `"Player 1"` and `"Player 2"`. Make sure the `connectedPlayer` and `getOpponent()` values match what's in the snapshot's `players` object.

3. **Missing messages**: The board components may expect `gameMessages` for the chat sidebar. For replay, you can either populate this from the granular events or leave it empty and hide the chat drawer.

4. **Animation/transitions**: The existing board has no transition animations between states — it just renders whatever `gameState` is. This actually works well for replay since each snapshot is a complete state.

5. **Large files**: A long game might have hundreds of snapshots. The parser should be efficient. Consider lazy parsing (only parse snapshot JSON when you navigate to it, not all upfront).

---

## Files Summary

### New Files
- `forceteki-client/src/app/replay/page.tsx` — Replay viewer page
- `forceteki-client/src/app/_contexts/Replay.context.tsx` — ReplayProvider context
- `forceteki-client/src/app/_utils/replayParser.ts` — .swureplay file parser
- `forceteki-client/src/app/_components/Replay/TransportControls.tsx` — Playback controls
- `forceteki-client/src/app/_components/Replay/FileUpload.tsx` — Drag-and-drop file upload

### Modified Files
- `forceteki-client/src/app/_components/_sharedcomponents/Preferences/_subComponents/DownloadGameLog.tsx` — Add zip download
- `forceteki-client/package.json` — Add JSZip/fflate dependency
