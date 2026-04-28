# PGN Replay Recorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add event-driven replay recording to produce structured JSON replay data in the parseable section of `.swupgn` files, and inject round/phase/action structure into the freeform notation layer.

**Architecture:** A `PgnReplayRecorder` class registers listeners on the Game's `EventEmitter` for ~20 game events. Each listener converts the event's structured data into an `IPgnReplayRecord`. The recorder also tracks structural state (round, phase, action counter, sub-event depth) and produces `IStructureMarker[]` that `generateHumanNotation` uses to inject round/phase headers and action numbering into the freeform layer.

**Tech Stack:** TypeScript, Jasmine (tests), Node.js EventEmitter pattern

**Spec:** `docs/superpowers/specs/2026-04-04-pgn-replay-recorder-design.md`

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `server/game/core/chat/PgnReplayRecorder.ts` | Event listeners, record building, seq numbering, structure markers |
| `test/server/chat/PgnReplayRecorder.spec.ts` | Tests for the recorder |

### Modified files
| File | Change |
|------|--------|
| `server/game/core/chat/PgnTypes.ts` | Add `IStructureMarker` interface |
| `server/game/core/chat/SwuPgn.ts` | Update `generateHumanNotation` to accept and apply structure markers |
| `server/game/core/Game.ts` | Instantiate recorder, pass recorder data to `generateSwuPgn()` and `getRawGameLog()` |
| `test/server/chat/SwuPgn.spec.ts` | Update tests for enhanced `generateHumanNotation` |

---

## Task 1: Add IStructureMarker to PgnTypes

**Files:**
- Modify: `server/game/core/chat/PgnTypes.ts`

- [ ] **Step 1: Add IStructureMarker interface**

Add at the end of `server/game/core/chat/PgnTypes.ts`:

```typescript
/** Marks where structural elements (round/phase/action boundaries) occur in the message stream */
export interface IStructureMarker {
    /** Index into GameChat.messages at the time this marker was recorded */
    messageIndex: number;
    /** Type of structural boundary */
    type: 'round' | 'phase' | 'action' | 'subEvent';
    /** Round number (for round/phase markers) */
    round?: number;
    /** Phase display name (for phase markers): 'Setup Phase', 'Action Phase', 'Regroup Phase' */
    phase?: string;
    /** Action number within the current action phase (for action/subEvent markers) */
    actionNumber?: number;
    /** Sub-event letter suffix: 'a', 'b', 'c', etc. (for subEvent markers) */
    subEventLetter?: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add server/game/core/chat/PgnTypes.ts
git commit -m "feat(pgn): add IStructureMarker interface"
```

---

## Task 2: Create PgnReplayRecorder - Core Class with Sequence Numbering

The recorder's core: sequence state management, player anonymization, card ID formatting, and the record storage array. No event listeners yet -- those come in Task 3.

**Files:**
- Create: `server/game/core/chat/PgnReplayRecorder.ts`
- Create: `test/server/chat/PgnReplayRecorder.spec.ts`

- [ ] **Step 1: Create the PgnReplayRecorder class skeleton**

```typescript
// server/game/core/chat/PgnReplayRecorder.ts
import type { IPgnReplayRecord, IStructureMarker } from './PgnTypes';
import { PgnActionType } from './PgnTypes';
import { SwuPgn } from './SwuPgn';
import { EventName, PhaseName, ZoneName } from '../Constants';
import type { Game } from '../Game';

export class PgnReplayRecorder {
    private readonly game: Game;
    private readonly records: IPgnReplayRecord[] = [];
    private readonly structureMarkers: IStructureMarker[] = [];

    // Sequence numbering state
    private currentRound = 0;
    private currentPhase = 'S'; // 'S', 'A', 'G'
    private actionCounter = 0;
    private phaseEventCounter = 0;
    private subEventCounter = 0;
    private topLevelActionWindowDepth: number | null = null;

    // Player anonymization map: player.id -> 'P1' | 'P2'
    private playerMap: Map<string, string> = new Map();

    // Card instance tracking for duplicate disambiguation
    private cardInstanceMap: Map<string, number> = new Map(); // card setId key -> next instance number

    public constructor(game: Game) {
        this.game = game;
        this.registerListeners();
    }

    /** Returns all recorded replay records. */
    public getRecords(): IPgnReplayRecord[] {
        return this.records;
    }

    /** Returns all structure markers for freeform annotation. */
    public getStructureMarkers(): IStructureMarker[] {
        return this.structureMarkers;
    }

    /** Initialize the player anonymization map. Called once players are known. */
    public initPlayerMap(): void {
        const players = this.game.getPlayers();
        if (players.length >= 2) {
            this.playerMap.set(players[0].id, 'P1');
            this.playerMap.set(players[1].id, 'P2');
        }
    }

    /** Map a player to P1/P2. */
    private anonymizePlayer(player: any): string | undefined {
        if (!player) return undefined;
        const id = typeof player === 'string' ? player : player.id;
        return this.playerMap.get(id);
    }

    /** Format a card's set ID for replay data. */
    private formatCardId(card: any): string {
        if (!card || !card.setId) return 'unknown';
        if (card.isToken && card.isToken()) {
            return `TOKEN:${card.title?.toLowerCase().replace(/\s+/g, '-') ?? 'unknown'}`;
        }
        return SwuPgn.formatSetId(card.setId.set, card.setId.number);
    }

    /** Build the current sequence ID. */
    private buildSeq(isSubEvent = false): string {
        const round = `R${this.currentRound}`;
        const phase = this.currentPhase;

        if (isSubEvent) {
            const letter = String.fromCharCode(96 + this.subEventCounter); // a=1, b=2, etc.
            return `${round}.${phase}.${this.actionCounter}${letter}`;
        }

        if (phase === 'A') {
            return `${round}.${phase}.${this.actionCounter}`;
        }

        return `${round}.${phase}.${this.phaseEventCounter}`;
    }

    /** Add a replay record. */
    private addRecord(record: IPgnReplayRecord): void {
        this.records.push(record);
    }

    /** Add a structure marker at the current message index. */
    private addStructureMarker(marker: Omit<IStructureMarker, 'messageIndex'>): void {
        this.structureMarkers.push({
            messageIndex: this.game.gameChat.messages.length,
            ...marker,
        });
    }

    /** Check if the current event is a sub-event of the current top-level action. */
    private isSubEvent(): boolean {
        if (this.currentPhase !== 'A') return false;
        if (this.topLevelActionWindowDepth === null) return false;
        const currentDepth = this.game.currentEventWindow?.windowDepth ?? 0;
        return currentDepth > this.topLevelActionWindowDepth;
    }

    /** Start a new top-level action in the action phase. */
    private startNewAction(): void {
        this.actionCounter++;
        this.subEventCounter = 0;
        this.topLevelActionWindowDepth = this.game.currentEventWindow?.windowDepth ?? 0;
    }

    /** Register a sub-event and return its seq. */
    private nextSubEvent(): string {
        this.subEventCounter++;
        return this.buildSeq(true);
    }

    /** Register all event listeners. */
    private registerListeners(): void {
        // Implemented in Task 3
    }
}
```

- [ ] **Step 2: Write tests for core methods**

```typescript
// test/server/chat/PgnReplayRecorder.spec.ts
import { PgnReplayRecorder } from '../../../server/game/core/chat/PgnReplayRecorder';

describe('PgnReplayRecorder', function () {
    // We test the public interface: getRecords(), getStructureMarkers()
    // The recorder requires a Game instance, so we'll test through integration
    // For now, test the exported class exists and can be imported
    it('should be importable', function () {
        expect(PgnReplayRecorder).toBeDefined();
    });
});
```

- [ ] **Step 3: Commit**

```bash
git add server/game/core/chat/PgnReplayRecorder.ts test/server/chat/PgnReplayRecorder.spec.ts
git commit -m "feat(pgn): add PgnReplayRecorder core class with seq numbering"
```

---

## Task 3: Register Event Listeners - Structural Events

Add listeners for round/phase boundary events that manage the recorder's sequence state and produce ROUND_START, ROUND_END, PHASE_START, PHASE_END records.

**Files:**
- Modify: `server/game/core/chat/PgnReplayRecorder.ts`

- [ ] **Step 1: Implement registerListeners with structural events**

Replace the empty `registerListeners` method in `PgnReplayRecorder`:

```typescript
    private registerListeners(): void {
        const game = this.game;

        // ── Structural events ──
        game.on(EventName.OnBeginRound, () => {
            if (this.playerMap.size === 0) {
                this.initPlayerMap();
            }
            this.currentRound = game.roundNumber;
            this.addRecord({ seq: `R${this.currentRound}.A.0`, type: PgnActionType.RoundStart, round: this.currentRound });
            this.addStructureMarker({ type: 'round', round: this.currentRound });
        });

        game.on(EventName.OnRoundEnded, () => {
            this.addRecord({ seq: `R${this.currentRound}.A.end`, type: PgnActionType.RoundEnd, round: this.currentRound });
        });

        game.on(EventName.OnPhaseStarted, (event: any) => {
            const phaseName: string = event.phase;
            if (phaseName === PhaseName.Setup) {
                this.currentPhase = 'S';
            } else if (phaseName === PhaseName.Action) {
                this.currentPhase = 'A';
            } else if (phaseName === PhaseName.Regroup) {
                this.currentPhase = 'G';
            }
            this.actionCounter = 0;
            this.phaseEventCounter = 0;
            this.subEventCounter = 0;
            this.topLevelActionWindowDepth = null;

            const phaseDisplayName = phaseName === PhaseName.Setup ? 'Setup Phase'
                : phaseName === PhaseName.Action ? 'Action Phase'
                    : 'Regroup Phase';

            this.addRecord({
                seq: `R${this.currentRound}.${this.currentPhase}.0`,
                type: PgnActionType.PhaseStart,
                phase: phaseDisplayName,
                round: this.currentRound,
            });
            this.addStructureMarker({ type: 'phase', round: this.currentRound, phase: phaseDisplayName });
        });

        game.on(EventName.OnPhaseEnded, (event: any) => {
            this.addRecord({
                seq: `R${this.currentRound}.${this.currentPhase}.end`,
                type: PgnActionType.PhaseEnd,
                phase: event.phase,
                round: this.currentRound,
            });
        });

        // ── Player action events (Task 4) ──
        this.registerPlayerActionListeners();

        // ── Sub-event listeners (Task 5) ──
        this.registerSubEventListeners();
    }

    private registerPlayerActionListeners(): void {
        // Implemented in Task 4
    }

    private registerSubEventListeners(): void {
        // Implemented in Task 5
    }
```

- [ ] **Step 2: Commit**

```bash
git add server/game/core/chat/PgnReplayRecorder.ts
git commit -m "feat(pgn): add structural event listeners (round/phase start/end)"
```

---

## Task 4: Register Event Listeners - Player Actions

Add listeners for top-level player actions: PLAY, ATTACK, PASS, CLAIM_INITIATIVE, DEPLOY_LEADER. These increment the action counter and mark new top-level actions.

**Files:**
- Modify: `server/game/core/chat/PgnReplayRecorder.ts`

- [ ] **Step 1: Implement registerPlayerActionListeners**

```typescript
    private registerPlayerActionListeners(): void {
        const game = this.game;

        // ── Card Played ──
        game.on(EventName.OnCardPlayed, (event: any) => {
            if (this.currentPhase === 'A') {
                this.startNewAction();
            } else {
                this.phaseEventCounter++;
            }

            const card = event.card;
            const player = this.anonymizePlayer(event.player);
            const cardId = this.formatCardId(card);
            const printedType = card.printedType?.toLowerCase() ?? '';
            const playType = event.playType ?? 'playFromHand';

            let type: PgnActionType;
            if (printedType === 'event') {
                type = PgnActionType.PlayEvent;
            } else if (printedType === 'upgrade') {
                type = PgnActionType.PlayUpgrade;
            } else if (playType === 'smuggle') {
                type = PgnActionType.PlaySmuggle;
            } else {
                type = PgnActionType.Play;
            }

            const zone = card.zoneName === ZoneName.GroundArena ? 'Ground'
                : card.zoneName === ZoneName.SpaceArena ? 'Space'
                    : card.zoneName?.toString() ?? '';

            this.addRecord({
                seq: this.buildSeq(),
                type,
                player,
                card: cardId,
                zone,
                playType,
            });

            if (this.currentPhase === 'A') {
                this.addStructureMarker({ type: 'action', actionNumber: this.actionCounter });
            }
        });

        // ── Leader Deployed ──
        game.on(EventName.OnLeaderDeployed, (event: any) => {
            if (this.currentPhase === 'A') {
                this.startNewAction();
            } else {
                this.phaseEventCounter++;
            }

            const card = event.card;
            const player = this.anonymizePlayer(card.owner);
            const cardId = this.formatCardId(card);
            const zone = card.zoneName === ZoneName.GroundArena ? 'Ground'
                : card.zoneName === ZoneName.SpaceArena ? 'Space' : '';

            this.addRecord({
                seq: this.buildSeq(),
                type: PgnActionType.DeployLeader,
                player,
                card: cardId,
                zone,
            });

            if (this.currentPhase === 'A') {
                this.addStructureMarker({ type: 'action', actionNumber: this.actionCounter });
            }
        });

        // ── Attack Declared ──
        game.on(EventName.OnAttackDeclared, (event: any) => {
            if (this.currentPhase === 'A') {
                this.startNewAction();
            }

            const attack = event.attack;
            if (!attack) return;

            const player = this.anonymizePlayer(attack.attackingPlayer);
            const attackerId = this.formatCardId(attack.attacker);
            const targets = attack.getAllTargets ? attack.getAllTargets() : [];
            const target = targets[0];
            const defenderId = target ? this.formatCardId(target) : 'unknown';
            const defenderType = target && target.isBase && target.isBase() ? 'base' : 'unit';

            this.addRecord({
                seq: this.buildSeq(),
                type: PgnActionType.Attack,
                player,
                attacker: attackerId,
                defender: defenderId,
                defenderType,
            });

            this.addStructureMarker({ type: 'action', actionNumber: this.actionCounter });
        });

        // ── Pass ──
        game.on(EventName.OnPassActionPhasePriority, (event: any) => {
            if (this.currentPhase === 'A') {
                this.startNewAction();
            }

            this.addRecord({
                seq: this.buildSeq(),
                type: PgnActionType.Pass,
                player: this.anonymizePlayer(event.player),
            });

            this.addStructureMarker({ type: 'action', actionNumber: this.actionCounter });
        });

        // ── Claim Initiative ──
        game.on(EventName.OnClaimInitiative, (event: any) => {
            if (this.currentPhase === 'A') {
                this.startNewAction();
            }

            this.addRecord({
                seq: this.buildSeq(),
                type: PgnActionType.ClaimInitiative,
                player: this.anonymizePlayer(event.player),
            });

            this.addStructureMarker({ type: 'action', actionNumber: this.actionCounter });
        });
    }
```

- [ ] **Step 2: Commit**

```bash
git add server/game/core/chat/PgnReplayRecorder.ts
git commit -m "feat(pgn): add player action event listeners (play, attack, pass, etc.)"
```

---

## Task 5: Register Event Listeners - Sub-Events

Add listeners for events that occur as consequences of player actions: damage, defeat, draw, exhaust, heal, tokens, capture, etc. These are recorded as sub-events with lettered suffixes.

**Files:**
- Modify: `server/game/core/chat/PgnReplayRecorder.ts`

- [ ] **Step 1: Implement registerSubEventListeners**

```typescript
    private registerSubEventListeners(): void {
        const game = this.game;

        // ── Damage Dealt ──
        game.on(EventName.OnDamageDealt, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            const target = event.card;
            const damageDealt = event.damageDealt ?? event.amount ?? 0;
            const damageType = event.type ?? 'ability';

            // Try to determine source card
            let sourceId = 'unknown';
            if (event.damageSource?.attack?.attacker) {
                sourceId = this.formatCardId(event.damageSource.attack.attacker);
            } else if (event.context?.source) {
                sourceId = this.formatCardId(event.context.source);
            }

            this.addRecord({
                seq,
                type: PgnActionType.Damage,
                source: sourceId,
                target: this.formatCardId(target),
                amount: damageDealt,
                damageType: String(damageType),
                remainingHp: target.remainingHp ?? undefined,
            });

            if (this.currentPhase === 'A' && this.actionCounter > 0) {
                this.addStructureMarker({ type: 'subEvent', actionNumber: this.actionCounter, subEventLetter: String.fromCharCode(96 + this.subEventCounter) });
            }
        });

        // ── Card Defeated ──
        game.on(EventName.OnCardDefeated, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            const card = event.card;
            let defeatedBy = 'unknown';
            if (event.defeatSource?.card) {
                defeatedBy = this.formatCardId(event.defeatSource.card);
            } else if (event.defeatSource?.attack?.attacker) {
                defeatedBy = this.formatCardId(event.defeatSource.attack.attacker);
            }

            const reason = event.defeatSource?.type ?? 'no_remaining_hp';

            this.addRecord({
                seq,
                type: PgnActionType.Defeat,
                card: this.formatCardId(card),
                reason: String(reason),
                defeatedBy,
            });
        });

        // ── Cards Drawn ──
        game.on(EventName.OnCardsDrawn, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            this.addRecord({
                seq,
                type: PgnActionType.Draw,
                player: this.anonymizePlayer(event.player),
                count: event.amount ?? event.cards?.length ?? 0,
            });
        });

        // ── Card Resourced ──
        game.on(EventName.OnCardResourced, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            this.addRecord({
                seq,
                type: PgnActionType.Resource,
                player: this.anonymizePlayer(event.resourceControllingPlayer ?? event.card?.owner),
                card: this.formatCardId(event.card),
            });
        });

        // ── Card Exhausted ──
        game.on(EventName.OnCardExhausted, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            this.addRecord({
                seq,
                type: PgnActionType.Exhaust,
                card: this.formatCardId(event.card),
            });
        });

        // ── Card Readied ──
        game.on(EventName.OnCardReadied, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            this.addRecord({
                seq,
                type: PgnActionType.Ready,
                card: this.formatCardId(event.card),
            });
        });

        // ── Damage Healed ──
        game.on(EventName.OnDamageHealed, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            this.addRecord({
                seq,
                type: PgnActionType.Heal,
                card: this.formatCardId(event.card),
                amount: event.amountHealed ?? 0,
                remainingHp: event.card?.remainingHp ?? undefined,
            });
        });

        // ── Tokens Created ──
        game.on(EventName.OnTokensCreated, (event: any) => {
            const tokens = event.tokens ?? [];
            for (const token of tokens) {
                const seq = this.currentPhase === 'A' && this.actionCounter > 0
                    ? this.nextSubEvent()
                    : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

                const zone = token.zoneName === ZoneName.GroundArena ? 'Ground'
                    : token.zoneName === ZoneName.SpaceArena ? 'Space' : '';

                this.addRecord({
                    seq,
                    type: PgnActionType.CreateToken,
                    player: this.anonymizePlayer(token.owner),
                    token: token.title ?? 'unknown',
                    zone,
                });
            }
        });

        // ── Card Captured ──
        game.on(EventName.OnCardCaptured, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            this.addRecord({
                seq,
                type: PgnActionType.Capture,
                card: this.formatCardId(event.card),
            });
        });

        // ── Rescue ──
        game.on(EventName.OnRescue, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            this.addRecord({
                seq,
                type: PgnActionType.Rescue,
                player: this.anonymizePlayer(event.card?.owner),
                card: this.formatCardId(event.card),
            });
        });

        // ── Card Ability Triggered ──
        game.on(EventName.OnCardAbilityTriggered, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            this.addRecord({
                seq,
                type: PgnActionType.Trigger,
                card: this.formatCardId(event.card),
                player: this.anonymizePlayer(event.player),
            });
        });

        // ── Card Discarded ──
        game.on(EventName.OnCardDiscarded, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            this.addRecord({
                seq,
                type: PgnActionType.Discard,
                card: this.formatCardId(event.card),
                player: this.anonymizePlayer(event.card?.owner),
            });
        });

        // ── Deck Shuffled ──
        game.on(EventName.OnDeckShuffled, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            this.addRecord({
                seq,
                type: PgnActionType.Shuffle,
                player: this.anonymizePlayer(event.player ?? event.card?.owner),
            });
        });

        // ── Take Control ──
        game.on(EventName.OnTakeControl, (event: any) => {
            const seq = this.currentPhase === 'A' && this.actionCounter > 0
                ? this.nextSubEvent()
                : `R${this.currentRound}.${this.currentPhase}.${++this.phaseEventCounter}`;

            this.addRecord({
                seq,
                type: PgnActionType.TakeControl,
                card: this.formatCardId(event.card),
                player: this.anonymizePlayer(event.newController ?? event.card?.controller),
            });
        });
    }
```

- [ ] **Step 2: Commit**

```bash
git add server/game/core/chat/PgnReplayRecorder.ts
git commit -m "feat(pgn): add sub-event listeners (damage, defeat, draw, tokens, etc.)"
```

---

## Task 6: Wire Recorder into Game.ts

Instantiate the recorder in the Game constructor, and update `generateSwuPgn()` and `getRawGameLog()` to use the recorder's data.

**Files:**
- Modify: `server/game/core/Game.ts`

- [ ] **Step 1: Add recorder to Game**

Add import at the top of `server/game/core/Game.ts` (near existing PGN imports):

```typescript
import { PgnReplayRecorder } from './chat/PgnReplayRecorder';
```

Add property declaration (near the existing `_cachedSwuPgn` at ~line 321):

```typescript
private _replayRecorder: PgnReplayRecorder;
```

In the constructor, after line 345 (`this.gameChat = new GameChat(details.pushUpdate);`), add:

```typescript
this._replayRecorder = new PgnReplayRecorder(this);
```

- [ ] **Step 2: Update generateSwuPgn to use recorder data**

Replace the current `generateSwuPgn()` method:

```typescript
    public generateSwuPgn(): string {
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
        const replayData = this._replayRecorder.getRecords();
        return SwuPgn.formatFile(header, humanNotation, p1Decklist, p2Decklist, replayData);
    }
```

- [ ] **Step 3: Update getRawGameLog to use structure markers**

Replace the current `getRawGameLog()` method:

```typescript
    public getRawGameLog(): string {
        const players = this.getPlayers();
        const player1Name = players[0].name;
        const player2Name = players[1].name;
        const structureMarkers = this._replayRecorder.getStructureMarkers();
        return SwuPgn.generateHumanNotation(
            this.gameChat.messages, player1Name, player2Name, structureMarkers
        );
    }
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (the `generateHumanNotation` signature change will be addressed in Task 7)

- [ ] **Step 5: Commit**

```bash
git add server/game/core/Game.ts
git commit -m "feat(pgn): wire PgnReplayRecorder into Game class"
```

---

## Task 7: Update generateHumanNotation with Structure Markers

Update `SwuPgn.generateHumanNotation` to accept an optional `structureMarkers` parameter and inject round/phase headers and action numbering.

**Files:**
- Modify: `server/game/core/chat/SwuPgn.ts`
- Modify: `test/server/chat/SwuPgn.spec.ts`

- [ ] **Step 1: Update generateHumanNotation signature and implementation**

Replace the existing `generateHumanNotation` method in `server/game/core/chat/SwuPgn.ts`:

```typescript
    /**
     * Iterates game messages, skips player chat, flattens each to text, anonymizes, and joins with newlines.
     * When structureMarkers are provided, injects round/phase headers and action numbering.
     * Messages are ISerializedMessage objects with { date, message } structure.
     */
    public static generateHumanNotation(
        messages: any[],
        player1Name: string,
        player2Name: string,
        structureMarkers: IStructureMarker[] = []
    ): string {
        const lines: string[] = [];

        // Build a map of messageIndex -> markers for O(1) lookup
        const markersByIndex = new Map<number, IStructureMarker[]>();
        for (const marker of structureMarkers) {
            const existing = markersByIndex.get(marker.messageIndex) ?? [];
            existing.push(marker);
            markersByIndex.set(marker.messageIndex, existing);
        }

        for (let i = 0; i < messages.length; i++) {
            // Check for structural markers at this message index
            const markers = markersByIndex.get(i);
            if (markers) {
                for (const marker of markers) {
                    if (marker.type === 'round') {
                        if (lines.length > 0) lines.push('');
                        lines.push(`\u2550\u2550\u2550 ROUND ${marker.round} \u2550\u2550\u2550`);
                        lines.push('');
                    } else if (marker.type === 'phase') {
                        if (lines.length > 0 && lines[lines.length - 1] !== '') lines.push('');
                        lines.push(`\u2500\u2500\u2500 ${marker.phase} \u2500\u2500\u2500`);
                    }
                }
            }

            const entry = messages[i];
            const messageContent = entry?.message ?? entry;

            // Skip player chat messages
            if (Array.isArray(messageContent) && messageContent.length > 0 && messageContent[0]?.type === 'playerChat') {
                continue;
            }

            const text = SwuPgn.flattenMessage(messageContent);
            if (!text) continue;

            let line = SwuPgn.anonymizePlayers(text, player1Name, player2Name);

            // Apply action numbering if we have markers
            // Find the most recent action/subEvent marker at or before this index
            if (markers) {
                const actionMarker = markers.find((m) => m.type === 'action');
                const subEventMarker = markers.find((m) => m.type === 'subEvent');

                if (subEventMarker && subEventMarker.actionNumber && subEventMarker.subEventLetter) {
                    line = `  ${subEventMarker.actionNumber}${subEventMarker.subEventLetter}. ${line}`;
                } else if (actionMarker && actionMarker.actionNumber) {
                    line = `${actionMarker.actionNumber}. ${line}`;
                }
            }

            lines.push(line);
        }

        return lines.join('\n');
    }
```

Also add the import for `IStructureMarker` at the top of `SwuPgn.ts`:

```typescript
import type { IPgnHeader, IPgnPlayerDecklist, IPgnReplayRecord, IStructureMarker } from './PgnTypes';
```

- [ ] **Step 2: Update existing tests**

The existing `generateHumanNotation` tests should still pass since `structureMarkers` defaults to `[]`. Verify and add a new test:

Add to `test/server/chat/SwuPgn.spec.ts` in the `generateHumanNotation` describe block:

```typescript
        it('injects round and phase markers when structureMarkers provided', function () {
            const messages = [
                { date: new Date(), message: ['Player1 draws 6 cards'] },
                { date: new Date(), message: ['Player1 plays Wampa'] },
                { date: new Date(), message: ['Player2 passes'] },
            ];
            const markers: IStructureMarker[] = [
                { messageIndex: 0, type: 'round', round: 1 },
                { messageIndex: 0, type: 'phase', phase: 'Setup Phase' },
                { messageIndex: 1, type: 'phase', phase: 'Action Phase' },
                { messageIndex: 1, type: 'action', actionNumber: 1 },
                { messageIndex: 2, type: 'action', actionNumber: 2 },
            ];

            const output = SwuPgn.generateHumanNotation(messages, 'Player1', 'Player2', markers);
            expect(output).toContain('\u2550\u2550\u2550 ROUND 1 \u2550\u2550\u2550');
            expect(output).toContain('\u2500\u2500\u2500 Setup Phase \u2500\u2500\u2500');
            expect(output).toContain('\u2500\u2500\u2500 Action Phase \u2500\u2500\u2500');
            expect(output).toContain('1. P1 plays Wampa');
            expect(output).toContain('2. P2 passes');
        });

        it('injects sub-event indentation', function () {
            const messages = [
                { date: new Date(), message: ['Player1 plays Wampa'] },
                { date: new Date(), message: ['Wampa deals 4 damage'] },
            ];
            const markers: IStructureMarker[] = [
                { messageIndex: 0, type: 'action', actionNumber: 1 },
                { messageIndex: 1, type: 'subEvent', actionNumber: 1, subEventLetter: 'a' },
            ];

            const output = SwuPgn.generateHumanNotation(messages, 'Player1', 'Player2', markers);
            expect(output).toContain('1. P1 plays Wampa');
            expect(output).toContain('  1a. Wampa deals 4 damage');
        });
```

Add `IStructureMarker` import at the top of the test file:

```typescript
import type { IStructureMarker } from '../../../server/game/core/chat/PgnTypes';
```

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add server/game/core/chat/SwuPgn.ts test/server/chat/SwuPgn.spec.ts
git commit -m "feat(pgn): update generateHumanNotation with structure markers"
```

---

## Task 8: Add Game End Record

The `endGame()` method needs to add a `GAME_END` record to the recorder before caching.

**Files:**
- Modify: `server/game/core/Game.ts`

- [ ] **Step 1: Add GAME_END record before caching**

In `server/game/core/Game.ts`, in the `endGame()` method, just before the try block that caches the PGN (around line 1006), add:

```typescript
        // Record game end in replay data
        const endPlayer = winners.length === 1
            ? this._replayRecorder.getRecords().length > 0 ? (winners[0] === this.getPlayers()[0] ? 'P1' : 'P2') : undefined
            : undefined;
        const endReason = reasonCode === GameEndReason.Concede ? 'Concession'
            : reasonCode === GameEndReason.PlayerLeft ? 'Disconnection'
                : 'Base Destroyed';

        // Use a simple approach: push directly to records since we're outside event flow
        this._replayRecorder.getRecords().push({
            seq: `R${this.roundNumber}.A.end`,
            type: PgnActionType.GameEnd,
            winner: endPlayer ?? 'Draw',
            reason: endReason,
        });
```

Add import for `PgnActionType` if not already present:

```typescript
import { PgnActionType } from './chat/PgnTypes';
```

- [ ] **Step 2: Commit**

```bash
git add server/game/core/Game.ts
git commit -m "feat(pgn): add GAME_END replay record at end of game"
```

---

## Task 9: Integration Test and Full Verification

Run the complete test suite, verify TypeScript compilation, and test the full flow.

**Files:**
- Modify: `test/server/chat/PgnReplayRecorder.spec.ts` (if needed)

- [ ] **Step 1: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: All tests pass. The integration tests exercise the Game class which will now instantiate the recorder. Any test that calls `game.endGame()` or runs through game phases will exercise the recorder's event listeners.

- [ ] **Step 3: Fix any issues found**

If tests fail, diagnose and fix. Common issues:
- Event listener receiving unexpected event shapes (add null guards)
- Missing property on event objects (check with optional chaining)
- Sequence numbering off (adjust counter logic)

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(pgn): address integration test issues"
```

---

## Implementation Notes

### Error Resilience

The recorder wraps every event handler in a try/catch so a bug in replay recording never crashes a game. If a handler throws, the error is logged and the record is skipped.

Add this wrapper pattern to each handler:

```typescript
game.on(EventName.OnCardPlayed, (event: any) => {
    try {
        // ... handler logic ...
    } catch (e) {
        // Silently skip — replay recording should never break gameplay
    }
});
```

### What's NOT Included

- **Mulligan/KeepHand records**: These happen before the event system is fully active (during setup prompts). They'll appear in the freeform layer from chat messages but won't have parseable records. This can be added later by hooking into `MulliganPrompt`.
- **Modal choice records**: These are prompt-level decisions, not events. Can be added later.
- **Status token detail**: `OnStatusTokenGained`/`OnStatusTokenDiscarded` events may not carry enough info to distinguish Shield vs Experience vs other tokens. The recorder captures what's available.
