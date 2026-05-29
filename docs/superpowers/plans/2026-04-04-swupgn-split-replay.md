# Split SWU-PGN into Two Files with Full State Snapshots — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the single `.swupgn` file into a human-readable `.swupgn` and a machine-replay `.swureplay` file (with full `getState()` snapshots), packaged as a zip download.

**Architecture:** `SwuPgn` gets two new static methods (`formatHumanFile`, `formatReplayFile`) replacing `formatFile`. `PgnReplayRecorder.emitGameState()` captures the full serialized game state via a callback to `Game.getState()`. `Game.generateSwuPgn()` becomes `generateGameFiles()` returning both file contents. `Lobby.getGameLog()` returns both file strings to the client. Zip packaging is deferred to the client-side replay UI work (the server delivers both strings; the client can bundle them).

**Tech Stack:** TypeScript, Jasmine test framework

**Spec:** `docs/superpowers/specs/2026-04-04-swupgn-split-replay-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `server/game/core/chat/PgnTypes.ts` | Modify | Add `IGameFiles` interface, update `ISwuPgnData` |
| `server/game/core/chat/SwuPgn.ts` | Modify | Split `formatFile()` into `formatHumanFile()` + `formatReplayFile()` |
| `server/game/core/chat/PgnReplayRecorder.ts` | Modify | Capture full game state snapshots via callback |
| `server/game/core/Game.ts` | Modify | `generateGameFiles()` returns both files; zip packaging |
| `server/gamenode/Lobby.ts` | Modify | Update `getGameLog()` to return zip buffer |
| `test/server/chat/SwuPgn.spec.ts` | Modify | Update tests for new method signatures |

---

### Task 1: Update PgnTypes with new interfaces

**Files:**
- Modify: `server/game/core/chat/PgnTypes.ts`

- [ ] **Step 1: Add IGameFiles interface and update ISwuPgnData**

In `server/game/core/chat/PgnTypes.ts`, add the `IGameFiles` interface at the end of the file (before the closing of the module), and update `IPgnReplayRecord` to allow a nested object for the snapshot field:

```typescript
/** Return type for game file generation — both human-readable and replay files */
export interface IGameFiles {
    /** Human-readable .swupgn file content */
    swuPgn: string;
    /** Machine-replay .swureplay file content */
    swuReplay: string;
}
```

Also update the `IPgnReplayRecord` interface to allow the snapshot field. The current definition is:

```typescript
export interface IPgnReplayRecord extends IPgnReplayRecordBase {
    [key: string]: string | number | boolean | string[] | undefined;
}
```

Change it to:

```typescript
export interface IPgnReplayRecord extends IPgnReplayRecordBase {
    [key: string]: string | number | boolean | string[] | Record<string, any> | undefined;
}
```

This allows the `snapshot` field to hold the full `getState()` object.

- [ ] **Step 2: Commit**

```bash
git add server/game/core/chat/PgnTypes.ts
git commit -m "feat(pgn): add IGameFiles interface and update IPgnReplayRecord for snapshots"
```

---

### Task 2: Split SwuPgn.formatFile into two methods

**Files:**
- Modify: `server/game/core/chat/SwuPgn.ts`
- Modify: `test/server/chat/SwuPgn.spec.ts`

- [ ] **Step 1: Write failing tests for formatHumanFile and formatReplayFile**

In `test/server/chat/SwuPgn.spec.ts`, add two new `describe` blocks after the existing `formatFile` block. Keep the existing `formatFile` tests for now (they'll be updated in step 5).

```typescript
    // ── formatHumanFile ─────────────────────────────────────────────────────
    describe('formatHumanFile', function () {
        const header: IPgnHeader = {
            game: 'Star Wars: Unlimited',
            date: '2026.04.04',
            player1: 'P1',
            player2: 'P2',
            p1Leader: 'Luke Skywalker, Faithful Friend',
            p1Base: 'Echo Base',
            p2Leader: 'Darth Vader, Dark Lord of the Sith',
            p2Base: 'Command Center',
            result: 'P1',
            reason: 'Base Destroyed',
        };

        const p1Decklist: IPgnPlayerDecklist = {
            leader: { name: 'Luke Skywalker, Faithful Friend', setId: 'SOR#005', count: 1 },
            base: { name: 'Echo Base', setId: 'SOR#012', count: 1 },
            deck: [{ name: 'Wampa', setId: 'SOR#101', count: 2 }],
        };

        const p2Decklist: IPgnPlayerDecklist = {
            leader: { name: 'Darth Vader, Dark Lord of the Sith', setId: 'SOR#001', count: 1 },
            base: { name: 'Command Center', setId: 'SOR#020', count: 1 },
            deck: [{ name: 'Death Trooper', setId: 'SOR#201', count: 3 }],
        };

        const humanNotation = 'Round 1 started\nP1 played Wampa';

        it('contains the header', function () {
            const output = SwuPgn.formatHumanFile(header, humanNotation, p1Decklist, p2Decklist);
            expect(output).toContain('[Game "Star Wars: Unlimited"]');
        });

        it('contains the card index', function () {
            const output = SwuPgn.formatHumanFile(header, humanNotation, p1Decklist, p2Decklist);
            expect(output).toContain('\u2550\u2550\u2550 CARD INDEX \u2550\u2550\u2550');
        });

        it('contains the FREEFORM section marker', function () {
            const output = SwuPgn.formatHumanFile(header, humanNotation, p1Decklist, p2Decklist);
            expect(output).toContain('=== FREEFORM ===');
        });

        it('contains the human notation', function () {
            const output = SwuPgn.formatHumanFile(header, humanNotation, p1Decklist, p2Decklist);
            expect(output).toContain('Round 1 started');
            expect(output).toContain('P1 played Wampa');
        });

        it('does NOT contain PARSEABLE or REPLAY section marker', function () {
            const output = SwuPgn.formatHumanFile(header, humanNotation, p1Decklist, p2Decklist);
            expect(output).not.toContain('=== PARSEABLE ===');
            expect(output).not.toContain('=== REPLAY ===');
        });

        it('has sections in correct order: header, card index, freeform, notation', function () {
            const output = SwuPgn.formatHumanFile(header, humanNotation, p1Decklist, p2Decklist);
            const headerPos = output.indexOf('[Game');
            const cardIndexPos = output.indexOf('\u2550\u2550\u2550 CARD INDEX \u2550\u2550\u2550');
            const freeformPos = output.indexOf('=== FREEFORM ===');
            const notationPos = output.indexOf('Round 1 started');
            expect(headerPos).toBeLessThan(cardIndexPos);
            expect(cardIndexPos).toBeLessThan(freeformPos);
            expect(freeformPos).toBeLessThan(notationPos);
        });
    });

    // ── formatReplayFile ────────────────────────────────────────────────────
    describe('formatReplayFile', function () {
        const header: IPgnHeader = {
            game: 'Star Wars: Unlimited',
            date: '2026.04.04',
            player1: 'P1',
            player2: 'P2',
            p1Leader: 'Luke Skywalker, Faithful Friend',
            p1Base: 'Echo Base',
            p2Leader: 'Darth Vader, Dark Lord of the Sith',
            p2Base: 'Command Center',
            result: 'P1',
            reason: 'Base Destroyed',
        };

        const p1Decklist: IPgnPlayerDecklist = {
            leader: { name: 'Luke Skywalker, Faithful Friend', setId: 'SOR#005', count: 1 },
            base: { name: 'Echo Base', setId: 'SOR#012', count: 1 },
            deck: [{ name: 'Wampa', setId: 'SOR#101', count: 2 }],
        };

        const p2Decklist: IPgnPlayerDecklist = {
            leader: { name: 'Darth Vader, Dark Lord of the Sith', setId: 'SOR#001', count: 1 },
            base: { name: 'Command Center', setId: 'SOR#020', count: 1 },
            deck: [{ name: 'Death Trooper', setId: 'SOR#201', count: 3 }],
        };

        const replayData: IPgnReplayRecord[] = [
            { seq: '001', type: PgnActionType.RoundStart },
            { seq: '002', type: PgnActionType.Play, player: 'P1', card: 'SOR#055' },
        ];

        it('contains the header', function () {
            const output = SwuPgn.formatReplayFile(header, p1Decklist, p2Decklist, replayData);
            expect(output).toContain('[Game "Star Wars: Unlimited"]');
        });

        it('contains the card index', function () {
            const output = SwuPgn.formatReplayFile(header, p1Decklist, p2Decklist, replayData);
            expect(output).toContain('\u2550\u2550\u2550 CARD INDEX \u2550\u2550\u2550');
        });

        it('contains the REPLAY section marker (not PARSEABLE)', function () {
            const output = SwuPgn.formatReplayFile(header, p1Decklist, p2Decklist, replayData);
            expect(output).toContain('=== REPLAY ===');
            expect(output).not.toContain('=== PARSEABLE ===');
        });

        it('contains replay records as JSON lines', function () {
            const output = SwuPgn.formatReplayFile(header, p1Decklist, p2Decklist, replayData);
            expect(output).toContain(JSON.stringify(replayData[0]));
            expect(output).toContain(JSON.stringify(replayData[1]));
        });

        it('does NOT contain FREEFORM section marker', function () {
            const output = SwuPgn.formatReplayFile(header, p1Decklist, p2Decklist, replayData);
            expect(output).not.toContain('=== FREEFORM ===');
        });

        it('has sections in correct order: header, card index, replay', function () {
            const output = SwuPgn.formatReplayFile(header, p1Decklist, p2Decklist, replayData);
            const headerPos = output.indexOf('[Game');
            const cardIndexPos = output.indexOf('\u2550\u2550\u2550 CARD INDEX \u2550\u2550\u2550');
            const replayPos = output.indexOf('=== REPLAY ===');
            expect(headerPos).toBeLessThan(cardIndexPos);
            expect(cardIndexPos).toBeLessThan(replayPos);
        });
    });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test 2>&1 | grep -A 2 'formatHumanFile\|formatReplayFile'`

Expected: Failures because `formatHumanFile` and `formatReplayFile` don't exist yet.

- [ ] **Step 3: Implement formatHumanFile and formatReplayFile in SwuPgn.ts**

In `server/game/core/chat/SwuPgn.ts`, add two new methods and update `formatReplayData`:

Add `formatHumanFile` after the existing `formatFile` method:

```typescript
    /**
     * Formats the human-readable .swupgn file: header, card index, freeform notation.
     * Does NOT include machine-parseable replay data.
     */
    public static formatHumanFile(
        header: IPgnHeader,
        humanNotation: string,
        p1Decklist: IPgnPlayerDecklist,
        p2Decklist: IPgnPlayerDecklist
    ): string {
        const sections = [
            SwuPgn.formatHeader(header),
            SwuPgn.formatCardIndex(p1Decklist, p2Decklist),
            '=== FREEFORM ===',
            humanNotation,
        ];
        return sections.join('\n\n');
    }

    /**
     * Formats the machine-replay .swureplay file: header, card index, JSON-lines replay data.
     * Does NOT include human-readable notation.
     */
    public static formatReplayFile(
        header: IPgnHeader,
        p1Decklist: IPgnPlayerDecklist,
        p2Decklist: IPgnPlayerDecklist,
        replayData: IPgnReplayRecord[]
    ): string {
        const replayLines = replayData.map((r) => JSON.stringify(r));
        const sections = [
            SwuPgn.formatHeader(header),
            SwuPgn.formatCardIndex(p1Decklist, p2Decklist),
            '=== REPLAY ===\n' + replayLines.join('\n'),
        ];
        return sections.join('\n\n');
    }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test 2>&1 | tail -20`

Expected: All new tests pass. Existing `formatFile` tests still pass (we haven't removed the old method yet).

- [ ] **Step 5: Update existing formatFile tests and method**

Now update the existing `formatFile` tests in `test/server/chat/SwuPgn.spec.ts`. The `formatFile` method stays as a backward-compatible wrapper but its section order changes to match the new human file order (header, card index, freeform, parseable). Update the `formatReplayData` method to use `=== REPLAY ===` instead of `=== PARSEABLE ===`.

In `server/game/core/chat/SwuPgn.ts`, update the `formatReplayData` method:

```typescript
    public static formatReplayData(records: IPgnReplayRecord[]): string {
        const lines = ['=== REPLAY ===', ...records.map((r) => JSON.stringify(r))];
        return lines.join('\n');
    }
```

In `test/server/chat/SwuPgn.spec.ts`, update the `formatReplayData` describe block:

Change `expect(output).toContain('=== PARSEABLE ===');` to `expect(output).toContain('=== REPLAY ===');`

Update the `formatFile` describe block's section order test to match the new order (header, card index, freeform, replay):

Replace the section order test:
```typescript
        it('has sections in correct order: header, card index, freeform, replay', function () {
            const output = SwuPgn.formatFile(header, humanNotation, p1Decklist, p2Decklist, replayData);
            const headerPos = output.indexOf('[Game');
            const cardIndexPos = output.indexOf('\u2550\u2550\u2550 CARD INDEX \u2550\u2550\u2550');
            const freeformPos = output.indexOf('=== FREEFORM ===');
            const replayPos = output.indexOf('=== REPLAY ===');
            expect(headerPos).toBeLessThan(cardIndexPos);
            expect(cardIndexPos).toBeLessThan(freeformPos);
            expect(freeformPos).toBeLessThan(replayPos);
        });
```

Also update the `formatFile` method itself to use the new section order:
```typescript
    public static formatFile(
        header: IPgnHeader,
        humanNotation: string,
        p1Decklist: IPgnPlayerDecklist,
        p2Decklist: IPgnPlayerDecklist,
        replayData: IPgnReplayRecord[]
    ): string {
        const sections = [
            SwuPgn.formatHeader(header),
            SwuPgn.formatCardIndex(p1Decklist, p2Decklist),
            '=== FREEFORM ===',
            humanNotation,
            SwuPgn.formatReplayData(replayData),
        ];
        return sections.join('\n\n');
    }
```

Update the existing `formatFile` test that checks for `'=== PARSEABLE ==='` to check for `'=== REPLAY ==='` instead.

- [ ] **Step 6: Run tests to verify all pass**

Run: `npm run test 2>&1 | tail -20`

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add server/game/core/chat/SwuPgn.ts test/server/chat/SwuPgn.spec.ts
git commit -m "feat(pgn): add formatHumanFile and formatReplayFile, rename PARSEABLE to REPLAY"
```

---

### Task 3: Add full game state snapshot capture to PgnReplayRecorder

**Files:**
- Modify: `server/game/core/chat/PgnReplayRecorder.ts`

- [ ] **Step 1: Add snapshot callback and update emitGameState**

The `PgnReplayRecorder` currently builds summary GAME_STATE records with flat fields (p1BaseHp, p1HandSize, etc). We need it to also capture the full `getState()` snapshot for the `.swureplay` file while keeping the summary for the `.swupgn` freeform display.

In `server/game/core/chat/PgnReplayRecorder.ts`:

1. Add a new property for the snapshot callback and a separate replay records array:

```typescript
    /** Callback to capture full game state for replay snapshots */
    private readonly getStateSnapshot: (() => Record<string, any>) | null;

    /** Replay records with full snapshots (used for .swureplay file) */
    private readonly replayRecords: IPgnReplayRecord[] = [];
```

2. Update the constructor to accept the snapshot callback:

```typescript
    public constructor(game: Game, getStateSnapshot?: () => Record<string, any>) {
        this.game = game;
        this.getStateSnapshot = getStateSnapshot ?? null;
        this.registerListeners();
    }
```

3. Add a public getter for replay records:

```typescript
    public getReplayRecords(): IPgnReplayRecord[] {
        return this.replayRecords;
    }
```

4. Update the `push` method to also push to replay records:

```typescript
    /** Push a record into both the records and replayRecords arrays. */
    private push(record: IPgnReplayRecord): void {
        this.records.push(record);
        this.replayRecords.push(record);
    }
```

5. Update `emitGameState()` to also emit a full snapshot replay record. After the existing `this.push(...)` call that adds the summary GAME_STATE record, add:

```typescript
        // Emit full snapshot for replay file
        if (this.getStateSnapshot) {
            try {
                const fullSnapshot = this.getStateSnapshot();
                this.replayRecords.push({
                    seq: `${seq}-snapshot`,
                    type: PgnActionType.GameState,
                    snapshot: fullSnapshot,
                } as IPgnReplayRecord);
            } catch {
                // Snapshot capture error — do not crash gameplay
            }
        }
```

This way `getRecords()` returns the existing summary records (for `.swupgn` freeform display) and `getReplayRecords()` returns records with both the granular events AND full snapshots (for `.swureplay`).

- [ ] **Step 2: Commit**

```bash
git add server/game/core/chat/PgnReplayRecorder.ts
git commit -m "feat(pgn): capture full getState() snapshots in PgnReplayRecorder"
```

---

### Task 4: Update Game.ts to generate both files

**Files:**
- Modify: `server/game/core/Game.ts`

- [ ] **Step 1: Update PgnReplayRecorder construction to pass snapshot callback**

In `server/game/core/Game.ts`, find where `_replayRecorder` is constructed. It's currently:

```typescript
this._replayRecorder = new PgnReplayRecorder(this);
```

Update it to pass a snapshot callback:

```typescript
this._replayRecorder = new PgnReplayRecorder(this, () => this.captureAnonymizedState());
```

- [ ] **Step 2: Add captureAnonymizedState method**

Add a new private method to Game.ts that captures the full game state as a spectator would see it, with player names anonymized:

```typescript
    /**
     * Captures the full game state as an anonymous spectator would see it,
     * with player names/IDs anonymized to Player 1/Player 2.
     */
    private captureAnonymizedState(): Record<string, any> {
        const state = this.getState('__replay_spectator__');
        if (!state) {
            return {};
        }

        // Anonymize player data
        const players = this.getPlayers();
        const anonymizedPlayers: Record<string, any> = {};
        for (let i = 0; i < players.length; i++) {
            const playerLabel = `Player ${i + 1}`;
            const playerState = state.players?.[players[i].id];
            if (playerState) {
                // Replace identifying info
                anonymizedPlayers[playerLabel] = {
                    ...playerState,
                    id: playerLabel,
                    name: playerLabel,
                    user: { username: playerLabel },
                };
            }
        }

        return {
            ...state,
            players: anonymizedPlayers,
            // Strip messages from snapshot (they're in the freeform file)
            newMessages: undefined,
            messageOffset: undefined,
            totalMessages: undefined,
            // Strip PGN data from snapshot (circular reference)
            swuPgn: undefined,
            rawGameLog: undefined,
        };
    }
```

- [ ] **Step 3: Add generateGameFiles method and update caching**

Add the new method that generates both files, and update the import for `IGameFiles`:

Add to imports at top of file:
```typescript
import type { IGameFiles } from './chat/PgnTypes';
```

Add method:

```typescript
    /**
     * Generates both game files: human-readable .swupgn and machine-replay .swureplay.
     */
    public generateGameFiles(): IGameFiles {
        const players = this.getPlayers();
        const player1 = players[0];
        const player2 = players[1];
        const header = this.buildPgnHeader(player1, player2);
        const structureMarkers = this._replayRecorder.getStructureMarkers();
        const humanNotation = SwuPgn.generateHumanNotation(
            this.gameChat.messages, player1.name, player2.name, structureMarkers
        );
        const p1Decklist = this.buildPlayerDecklist(player1);
        const p2Decklist = this.buildPlayerDecklist(player2);

        const swuPgn = SwuPgn.formatHumanFile(header, humanNotation, p1Decklist, p2Decklist);
        const swuReplay = SwuPgn.formatReplayFile(header, p1Decklist, p2Decklist, this._replayRecorder.getReplayRecords());

        return { swuPgn, swuReplay };
    }
```

- [ ] **Step 4: Update caching fields and game-end caching**

Change the cached fields. Replace:

```typescript
    private _cachedSwuPgn?: string;
    private _cachedRawGameLog?: string;
```

With:

```typescript
    private _cachedSwuPgn?: string;
    private _cachedSwuReplay?: string;
    private _cachedRawGameLog?: string;
```

Add a getter:

```typescript
    public get cachedSwuReplay(): string | undefined {
        return this._cachedSwuReplay;
    }
```

Update the game-end caching block. Find this code:

```typescript
        try {
            this._cachedRawGameLog = this.getRawGameLog();
            this._cachedSwuPgn = this.generateSwuPgn();
        } catch (e) {
            logger.error(`Error caching game log at end of game: ${e}`);
        }
```

Replace with:

```typescript
        try {
            this._cachedRawGameLog = this.getRawGameLog();
            const gameFiles = this.generateGameFiles();
            this._cachedSwuPgn = gameFiles.swuPgn;
            this._cachedSwuReplay = gameFiles.swuReplay;
        } catch (e) {
            logger.error(`Error caching game log at end of game: ${e}`);
        }
```

- [ ] **Step 5: Update getState() to include swuReplay**

In the `getState()` method, find:

```typescript
                    swuPgn: this._cachedSwuPgn,
                    rawGameLog: this._cachedRawGameLog,
```

Add the replay data:

```typescript
                    swuPgn: this._cachedSwuPgn,
                    swuReplay: this._cachedSwuReplay,
                    rawGameLog: this._cachedRawGameLog,
```

- [ ] **Step 6: Keep generateSwuPgn for backward compatibility**

The existing `generateSwuPgn()` method is still called by `Lobby.getGameLog()`. Update it to use the new method internally:

```typescript
    public generateSwuPgn(): string {
        return this.generateGameFiles().swuPgn;
    }
```

- [ ] **Step 7: Commit**

```bash
git add server/game/core/Game.ts
git commit -m "feat(pgn): generate both .swupgn and .swureplay files with full state snapshots"
```

---

### Task 5: Update Lobby.getGameLog to return both files with zip packaging

**Files:**
- Modify: `server/gamenode/Lobby.ts`

- [ ] **Step 1: Update getGameLog to return both files**

In `server/gamenode/Lobby.ts`, find the `getGameLog` method and update it to return the replay data too:

```typescript
    public getGameLog(socket: any, callback: (data: { rawLog: string; swuPgn: string; swuReplay: string } | { error: string }) => void): void {
        if (!this.game) {
            if (typeof callback === 'function') {
                callback({ error: 'No active game' });
            }
            return;
        }

        try {
            const rawLog = this.game.cachedRawGameLog ?? this.game.getRawGameLog();
            const gameFiles = this.game.cachedSwuPgn && this.game.cachedSwuReplay
                ? { swuPgn: this.game.cachedSwuPgn, swuReplay: this.game.cachedSwuReplay }
                : this.game.generateGameFiles();

            if (typeof callback === 'function') {
                callback({ rawLog, swuPgn: gameFiles.swuPgn, swuReplay: gameFiles.swuReplay });
            }
        } catch (e) {
            logger.error(`Error generating game log: ${e}`);
            if (typeof callback === 'function') {
                callback({ error: 'Failed to generate game log' });
            }
        }
    }
```

- [ ] **Step 2: Commit**

```bash
git add server/gamenode/Lobby.ts
git commit -m "feat(pgn): update Lobby.getGameLog to return both swupgn and swureplay"
```

---

### Task 6: Build and verify

- [ ] **Step 1: Run the full build**

Run: `npm run build 2>&1 | tail -20`

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 2: Run the full test suite**

Run: `npm run test 2>&1 | tail -30`

Expected: All tests pass.

- [ ] **Step 3: Fix any issues**

If there are build or test failures, fix them before committing.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(pgn): resolve build/test issues from swupgn split"
```

---

### Task 7: Update SWU-PGN format docs

**Files:**
- Modify: `docs/SWU-PGN-FORMAT.md`

- [ ] **Step 1: Update the format documentation**

Update `docs/SWU-PGN-FORMAT.md` to document:
- The two-file format (.swupgn and .swureplay)
- The `=== REPLAY ===` section marker replacing `=== PARSEABLE ===`
- The full snapshot GAME_STATE records with `snapshot` field
- The zip packaging
- That both files are self-contained with header + card index

Keep the existing documentation for individual sections (header format, card index format, event types) as they haven't changed. Focus on updating the high-level structure section and the replay data section.

- [ ] **Step 2: Commit**

```bash
git add docs/SWU-PGN-FORMAT.md
git commit -m "docs: update SWU-PGN format spec for two-file split and full snapshots"
```
