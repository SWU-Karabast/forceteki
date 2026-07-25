# Plan 2 — Semantic Save/Load v1

**Status:** Proposed
**Depends on:** Nothing hard; Plan 1 recommended first
**Unblocks:** Plan 6 (the schema defined here grows into the full-fidelity format)
**Shape:** One feature arc, landable in 3–4 PRs (schema+writer, reader, server plumbing, hardening)

## Goal

Players can save a match to a JSON document and later load it into a fresh
server process, resuming at the same board position. The save captures the
**logical game position** (what a human would need to reconstruct the board),
not the engine's internal object graph. This makes saves robust to engine
changes: a loaded position picks up current card implementations and rules,
exactly as a physical game re-set-up would.

## Why semantic save (and not replay, and not v8 buffers)

- **Replay logs** (seed + decision log) only reproduce a position under the
  exact engine build that recorded them; any rules fix or prompt-order change
  silently corrupts everything downstream. Replay is a same-build repro tool,
  not a durable save format. (Plan 1 work item C keeps that door open.)
- **v8 snapshot buffers** cannot be loaded into a fresh process: restore
  requires the same live GameObject instances
  (`GameStateManager.rollbackToSnapshot` mutates existing objects only), and
  the buffers contain live `Map`/`Set` instances and are not JSON.
- **Semantic save** has a small, explicit drift surface: card identifiers
  (already pinned by `card-data-version.txt`; set codes and `internalName`s
  are stable) and the schema itself, which is versioned and migratable.

## Existing machinery this builds on

- **Fresh-start path:** `Lobby.ts` builds `GameConfiguration` →
  `new Game(...)` → `selectDeck` → `initialiseAsync` (`Lobby.ts:1259-1289`).
  Card reconstruction from ids already exists
  (`Deck.buildCardsFromSetCodeAsync`, `server/utils/deck/Deck.ts:207-228`;
  token factories at `Game.ts:1578-1592`).
- **State injection:** `test/helpers/GameStateBuilder.js:95-256`
  (`setupGameStateAsync`) already does: real game start → advance phases →
  `moveAllNonBaseZonesToRemoved()` → place every card
  (`setGroundArenaUnits`, `setHand`, `setDeck`, `setLeaderStatus`, …) →
  `refreshGameState` → clear and re-seed snapshot history. This is the proof
  of concept for the loader; the plan ports the pattern into engine code.
- **Pipeline contract:** rollback already never serializes the pipeline — it
  clears and re-enters at an enumerated safe point
  (`Game.postRollbackOperations`, `Game.ts:1964-1973`). Load uses the same
  contract.
- **RNG:** `seedrandom` state is a plain serializable object, already captured
  per snapshot (`Randomness.ts:19-29`, `SnapshotFactory.ts:157`).
- The empty directory `server/game/core/stateSerialization/` exists and is the
  natural home for this code.

## Schema (v1)

A versioned top-level document, `ISavedMatch`:

```jsonc
{
  "formatVersion": 1,
  "cardDataVersion": "20260423_00",       // from card-data-version.txt
  "savedAt": "...", "gameId": "...",
  "settings": { "gameMode": ..., "undoMode": ..., "useActionTimer": ... },
  "rng": { "seed": "...", "state": { /* seedrandom state */ } },
  "game": {
    "roundNumber": 3, "phase": "action",
    "initiativePlayer": "p1", "actionPhaseActivePlayer": "p2",
    "isInitiativeClaimed": false, "actionNumber": 17,
    "prevActionPhasePlayerPassed": false
  },
  "players": [
    {
      "id": "...", "name": "...",
      "decklist": { /* ISwuDbFormatDecklist as provided at lobby time */ },
      "base": { "card": "<internalName>", "damage": 4 },
      "leader": { "card": "...", "deployed": true, "side": "front", "exhausted": false, "damage": 2, "upgrades": [...] },
      "hand": ["<internalName>", ...],                  // ordered
      "deck": ["<internalName>", ...],                  // ordered, top first
      "discard": ["..."],                               // ordered
      "resources": [ { "card": "...", "exhausted": true }, ... ],
      "groundArena": [ { "card": "...", "damage": 1, "exhausted": false,
                          "upgrades": [ { "card": "...", "ownerId": "..." } ],
                          "capturedCards": [ { "card": "...", "ownerId": "..." } ],
                          "tokens": { "shield": 1, "experience": 2 } } ],
      "spaceArena": [ ... ],
      "outsideTheGame": [ ... ],
      "hasTheForce": true, "creditTokens": 0,
      "hasInitiative": false
    }
  ],
  "abilityLimits": [ { "card": "...", "abilityIdentifier": "wampa_triggered_0", "usesByPlayer": { "p1": 1 } } ],
  "stateWatchers": [ { "watcher": "cardsPlayedThisPhase", "entries": [ ...plain data... ] } ],
  "chat": [ ...ISerializedMessage[] ... ],
  "timers": { "p1": { "remainingSeconds": 120, "isOnMainTimer": true }, ... }
}
```

Schema rules (these are the load-bearing decisions):

- **Stable coordinates only.** Cards by `internalName` (+ owner where a card
  can be in an opponent's zone: upgrades, captures). Abilities by
  `abilityIdentifier` (`internalName_type_idx`, minted at
  `Card.buildGeneralAbilityProps`, `Card.ts:555-562`). Watchers by
  `StateWatcherName` enum. Tokens by `TokenCardName` enums. **No uuids
  anywhere in the file.**
- **Duplicate disambiguation:** where a player controls N copies of a card,
  entries are matched by position within the save's own arrays; per-copy state
  travels with the entry, so no cross-references between copies are needed.
  If a future field must reference a specific copy, add an in-file ordinal —
  never a uuid.
- Ordered zones (deck, discard, hand, resources) preserve order.

## Save trigger and restore point

**v1 restriction: saves are taken only at action-window boundaries** — the
same quiescent points where snapshots are taken today (`SnapshotTimepoint.Action`).
This means: no pipeline state, no open prompts, no in-flight event windows or
attacks exist at save time. Load re-enters via the same entry-point machinery
rollback uses (`SnapshotManager.getEntryPointAfterRollback` →
`initializePipelineForRound`), landing the loaded game at the start of the
saved action window.

Note: two timepoints currently `throw` in `getEntryPointAfterRollback`
(end-of-setup, end-of-regroup — `SnapshotManager.ts:401,408`). v1 sidesteps
them by only saving at action timepoints in the action phase.

## Work items

### A. Schema + writer

- Define `ISavedMatch` interfaces + `formatVersion` in
  `server/game/core/stateSerialization/`.
- Implement `MatchSerializer.save(game): ISavedMatch` walking the live game.
  This is a production-grade sibling of `Game.captureGameState`
  (`Game.ts:2006-2043`) but **lossless for the schema's scope** (that method
  deliberately truncates: top-5 deck cards only, no limits/effects — do not
  reuse it).
- **Unsupported-state detection:** the writer must detect state the schema
  cannot represent and refuse (or mark the save degraded) rather than silently
  drop it. v1 exclusion list, detectable from the engine:
  - active ongoing effects with non-permanent durations (for-this-phase /
    for-this-attack effects registered in `OngoingEffectEngine` beyond those
    re-derived from printed constant abilities);
  - gained abilities on cards (granted by another card's effect);
  - pending delayed effects / custom-duration events;
  - `Card.nextAbilityIdx` drift that would break `abilityIdentifier` matching.
  Because v1 saves only at action-window boundaries, most transient state is
  already gone; the writer asserts the rest.

### B. JSON-safety dev assertion (the standing-invariant enforcement)

Add a dev-mode check in the decorator layer: `@stateValue` values must be
JSON-representable or of a known encodable type (`Map`/`Set` with JSON-safe
elements). Model: the existing `StateWatcher` dev check
(`StateWatcher.ts:105-110`) which rejects GameObjects/GameEvents in watcher
entries. This does not change runtime behavior; it prevents new state from
violating the invariant that Plan 6 depends on.

### C. Loader

- `MatchLoader.loadAsync(saved: ISavedMatch, config): Game`:
  1. Validate `formatVersion` + `cardDataVersion` (mismatched card-data
     version: hard fail v1; migration is a Plan 6 concern).
  2. Fresh `Game` via the normal `Lobby` construction path with the saved
     decklists and settings.
  3. Advance through setup deterministically (the saved RNG state is restored
     *after* injection, so setup-time shuffles don't matter).
  4. Inject position: port the `GameStateBuilder` operations
     (`moveAllNonBaseZonesToRemoved`, `setGroundArenaUnits`, `setHand`,
     `setDeck`, `setLeaderStatus`, `setBaseStatus`, `setResourceCards`,
     `setDiscard`, upgrade/capture attachment, damage/exhaust/token state)
     from `test/helpers/PlayerInteractionWrapper.ts` into engine-side code.
     The test helpers then become thin wrappers over the engine
     implementation (large incidental win: state injection becomes a
     supported engine feature instead of test-only code).
  5. Restore ability-limit counts, watcher entries, chat, timers, RNG state,
     `Game.state` scalars.
  6. `resolveGameState(true)`, clear + re-seed snapshot history (exactly as
     `GameStateBuilder.js:237-253` does), re-enter pipeline at the action
     window.
- Loading must be rejected cleanly (not crash) on: unknown card names, invalid
  positions (e.g. upgrade on empty arena), version mismatch.

### D. Server plumbing

- Save: expose on the lobby/game socket surface; gate on game settings
  (private lobbies first). Output: JSON document to the client (download) —
  server-side storage is optional and out of scope for v1.
- Load: lobby flow accepting an uploaded `ISavedMatch`, validating both
  players' consent, constructing the game via `MatchLoader`.
- Decide and document: who may load (both original players? anyone with the
  file? — recommend: anyone, it's a card game position, there is no hidden
  secret beyond deck order, but flag that **deck order and hands are in the
  file in cleartext**, so sharing a save leaks hidden information; consider a
  "scrubbed" variant later).

### E. Verification

- **Round-trip property tests:** build positions with `GameStateBuilder`
  (dozens of existing specs construct rich positions), save, load into a fresh
  game, save again → the two `ISavedMatch` documents must be deeply equal.
- **Continuation tests:** save mid-game in an integration test, load, and play
  several representative actions (attack, play unit, use triggered ability,
  claim initiative) asserting identical outcomes to the unloaded original.
- Writer-refusal tests for each exclusion-list category.

## Explicit non-goals (v1)

- Saving mid-prompt, mid-attack, or mid-ability resolution.
- Preserving active duration-bound ongoing effects, gained abilities, delayed
  effects (writer refuses instead).
- Preserving undo history across a load (snapshot history restarts).
- Schema migration between format versions (fail loudly instead; Plan 6).
- Server-side save storage/persistence infrastructure.

## Risks / open questions for reviewer

- **`abilityIdentifier` stability:** identifiers embed a per-card ability
  index; card refactors that reorder ability registration change coordinates.
  Acceptable for ability-limit matching in v1 (worst case: a limit count fails
  to match and resets)? Or should limits be keyed by `(card, abilityType,
  ordinal)` with fuzzy matching?
- **Setup determinism in the loader:** step C.3 assumes advancing a fresh game
  to the action phase is safe with arbitrary RNG (state is overwritten after
  injection). `GameStateBuilder` proves this for tests; confirm no
  setup-phase player choices leak into injected state (mulligan and resourcing
  are all overwritten by injection).
- **Hidden-information handling** in shared save files (see D).
- Should v1 include spectator/bug-report integration (attach `ISavedMatch` to
  bug reports)? Cheap and high-value; recommend yes if scope allows.
