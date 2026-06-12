# PGN Replay Recorder Design Spec

## Overview

Add a `PgnReplayRecorder` class that listens to game events via the `Game` `EventEmitter` and produces structured `IPgnReplayRecord[]` for the parseable layer of `.swupgn` files. Additionally, use the recorder's structural state (round, phase, action numbering, event nesting) to inject round/phase markers and action numbering into the freeform notation layer.

This makes the parseable layer the authoritative machine-readable replay, while the freeform layer gains proper document structure derived from the same event stream.

---

## Architecture

### PgnReplayRecorder

A new class instantiated by `Game` during initialization. It:

1. Registers listeners on the Game's `EventEmitter` for key game events
2. Maintains sequence numbering state (round, phase, action counter, sub-event depth via EventWindow nesting)
3. Converts each event into an `IPgnReplayRecord` with structured fields
4. Tracks which `GameChat.messages` index corresponds to each structural transition (round start, phase start, action boundaries) to enable freeform annotation
5. Stores all records in an ordered array

### Event Listeners

The recorder registers `game.on(eventName, handler)` for these events:

| Game Event | Replay Type | Data Extracted |
|---|---|---|
| `OnBeginRound` | `ROUND_START` | `game.roundNumber` |
| `OnRoundEnded` | `ROUND_END` | `game.roundNumber` |
| `OnPhaseStarted` | `PHASE_START` | `event.phase` |
| `OnPhaseEnded` | `PHASE_END` | `event.phase` |
| `OnCardPlayed` | `PLAY` / `PLAY_EVENT` / `PLAY_UPGRADE` | `event.card` (setId, title, subtitle, printedType), `event.player`, `event.playType`, zone from card location |
| `OnLeaderDeployed` | `DEPLOY_LEADER` | `event.card` (setId, title, subtitle) |
| `OnAttackDeclared` | `ATTACK` | `event.attack.attacker` (setId), `event.attack.targets` (setId), attacking/defending player |
| `OnDamageDealt` | `DAMAGE` | `event.card` (target, setId), `event.damageDealt`, `event.type` (DamageType), source card from context/attack |
| `OnCardDefeated` | `DEFEAT` | `event.card` (setId), `event.defeatSource` |
| `OnCardsDrawn` | `DRAW` | `event.player`, `event.amount` |
| `OnCardResourced` | `RESOURCE` | `event.card` (setId), `event.resourceControllingPlayer` |
| `OnClaimInitiative` | `CLAIM_INITIATIVE` | `event.player` |
| `OnPassActionPhasePriority` | `PASS` | `event.player` |
| `OnTokensCreated` | `CREATE_TOKEN` | `event.tokens` (title, power, hp, zone), `event.tokenType` |
| `OnCardCaptured` | `CAPTURE` | `event.card` (setId), captor from context |
| `OnRescue` | `RESCUE` | `event.card` (setId), rescuing player |
| `OnDamageHealed` | `HEAL` | `event.card` (setId), `event.amountHealed` |
| `OnCardExhausted` | `EXHAUST` | `event.card` (setId) |
| `OnCardReadied` | `READY` | `event.card` (setId) |
| `OnCardAbilityTriggered` | `TRIGGER` | `event.card` (setId), ability type from context |
| `OnCardDiscarded` | `DISCARD` | `event.card` (setId), player |
| `OnCardRevealed` | `REVEAL` | `event.card` (setId), revealed to whom |
| `OnDeckShuffled` | `SHUFFLE` | player |
| `OnStatusTokenGained` | `SHIELD_GAIN` / `EXPERIENCE_GAIN` / `STATUS_TOKEN` | `event.card`, token type |
| `OnStatusTokenDiscarded` | `SHIELD_USE` | `event.card`, token type |
| `OnCardMoved` | `MOVE` | `event.card` (setId), source/destination zones |
| `OnTakeControl` | `TAKE_CONTROL` | `event.card` (setId), new controller |

Events NOT listened to (infrastructure/meta events): `AttackSteps`, `PlayCard`, `SelectCard`, `SelectPlayer`, `DistributeDamage`, `ReplacementEffect`, etc.

### Sequence Numbering

The recorder maintains:

- **`currentRound: number`** -- set from `game.roundNumber` on `OnBeginRound`
- **`currentPhase: string`** -- `'S'` (Setup), `'A'` (Action), `'G'` (Regroup), set on `OnPhaseStarted`
- **`actionCounter: number`** -- incremented for each top-level player action during Action Phase, reset to 0 on `OnPhaseStarted`
- **`phaseEventCounter: number`** -- incremented for each event during Setup/Regroup phases, reset on `OnPhaseStarted`
- **`subEventCounter: number`** -- tracks sub-events within a top-level action, reset when actionCounter increments

**Top-level actions** (increment `actionCounter`): Events that correspond to direct player choices during the Action Phase:
- `OnCardPlayed` (only at EventWindow depth 0 or 1 -- the play itself, not a triggered re-play)
- `OnLeaderDeployed`
- `OnAttackDeclared`
- `OnClaimInitiative`
- `OnPassActionPhasePriority`

**Sub-events** (increment `subEventCounter`): All other events that fire during an action's resolution:
- `OnDamageDealt`, `OnCardDefeated`, `OnCardsDrawn`, `OnCardExhausted`, `OnCardAbilityTriggered`, `OnTokensCreated`, `OnDamageHealed`, `OnStatusTokenGained`, etc.

**Determining nesting depth**: Use `event.window` (the EventWindow). The recorder tracks the EventWindow of the current top-level action. Any event whose window is the same or a descendant of the top-level action's window is a sub-event. Events in a new top-level window start a new action.

**Sequence ID format**: `R{round}.{phase}.{number}{sub}`
- Setup/Regroup: `R1.S.1`, `R1.S.2`, `R1.G.1`, `R1.G.2`
- Action top-level: `R1.A.1`, `R1.A.2`
- Action sub-events: `R1.A.1a`, `R1.A.1b`
- Phase boundaries: `R1.A.0` (PHASE_START), `R1.A.end` (PHASE_END)

### Player Anonymization

The recorder maps player IDs to `"P1"` / `"P2"` based on `game.getPlayers()` order (same as the freeform layer).

### Card ID Formatting

Cards are referenced as `SET#NUM` using `SwuPgn.formatSetId(card.setId.set, card.setId.number)`. Token cards use `TOKEN:{name}` with instance suffixes for multiples: `TOKEN:xwing-1`, `TOKEN:xwing-2`.

### Duplicate Card Disambiguation

When multiple copies of the same card are in play, instance suffixes are added:
- First instance: `SOR#095`
- Second instance: `SOR#095:2`
- Third instance: `SOR#095:3`

The recorder maintains a map of card UUID to instance-suffixed ID, assigned in order of entry to play.

---

## Freeform Structure Injection

### Message-to-Structure Mapping

The recorder maintains a `structureMarkers` array that records the `GameChat.messages` index at each structural transition:

```typescript
interface IStructureMarker {
    messageIndex: number;   // Index into GameChat.messages at time of event
    type: 'round' | 'phase' | 'action' | 'subEvent';
    round?: number;
    phase?: string;         // 'Setup Phase', 'Action Phase', 'Regroup Phase'
    actionNumber?: number;
    subEventLetter?: string;
}
```

On each event, the recorder snapshots `game.gameChat.messages.length` as the current message index. When a round starts, phase starts, or action boundary occurs, a structure marker is recorded.

### Enhanced Freeform Generation

`SwuPgn.generateHumanNotation` is updated to accept `structureMarkers: IStructureMarker[]` alongside the messages. As it iterates messages, it checks if any structure marker points to the current message index and injects:

- **Round marker**: `═══ ROUND N ═══` (blank line before and after)
- **Phase marker**: `─── Phase Name ───` (blank line before and after)
- **Action number**: Prepends `N. ` to the message text
- **Sub-event indent**: Prepends `  Na. ` to the message text

Messages in Setup and Regroup phases remain unnumbered (per the spec).

---

## Integration with Game.ts

### Initialization

In `Game` constructor or `initialize()`, after `GameChat` is created:

```typescript
this._replayRecorder = new PgnReplayRecorder(this);
```

### Game End

In `endGame()`, the cached PGN generation uses recorder data:

```typescript
this._cachedSwuPgn = this.generateSwuPgn();
```

### generateSwuPgn Update

`generateSwuPgn()` passes the recorder's records and structure markers:

```typescript
public generateSwuPgn(): string {
    // ... existing header/decklist building ...
    const replayData = this._replayRecorder.getRecords();
    const structureMarkers = this._replayRecorder.getStructureMarkers();
    const humanNotation = SwuPgn.generateHumanNotation(
        this.gameChat.messages, player1Name, player2Name, structureMarkers
    );
    return SwuPgn.formatFile(header, humanNotation, p1Decklist, p2Decklist, replayData);
}
```

`getRawGameLog()` also updated to pass structure markers for the raw log download.

---

## Files

| File | Change |
|---|---|
| Create: `server/game/core/chat/PgnReplayRecorder.ts` | New class -- event listeners, record building, seq numbering, structure markers |
| Modify: `server/game/core/chat/PgnTypes.ts` | Add `IStructureMarker` interface |
| Modify: `server/game/core/chat/SwuPgn.ts` | Update `generateHumanNotation` to accept and apply structure markers |
| Modify: `server/game/core/Game.ts` | Instantiate recorder, pass recorder data to generators |
| Create: `test/server/chat/PgnReplayRecorder.spec.ts` | Tests for event-to-record conversion, seq numbering, structure markers |
| Modify: `test/server/chat/SwuPgn.spec.ts` | Update tests for enhanced `generateHumanNotation` |

---

## What This Does NOT Change

- Existing `GameChat` message system -- still used for live chat during gameplay
- Existing game event emission -- no modifications to any event sources
- Client code -- the `.swupgn` file structure is the same, just with populated parseable section
- Any game logic or behavior
