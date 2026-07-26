# Plan 2 — Semantic Save/Load v1

**Status:** Proposed (revised after adversarial review; product decisions folded in — bug-report customer, degrade+manifest writer)
**Depends on:** Nothing hard; Plan 1 recommended first
**Unblocks:** Plan 6 (the schema defined here grows into the full-fidelity format)
**Shape:** One feature arc, landable in 4–5 PRs (schema+writer+manifest, watcher encoding, loader+prompt driver, artifact plumbing, hardening). Work item D shrank under the bug-report decision — no lobby consent/sharing flow in v1 — and regained a small piece: the armed one-shot save trigger, so a save can be *requested* at any moment while still being *taken* at a boundary.

## Goal

**v1's customer is the bug-report attachment, not a player-facing save
button.** A match can be saved to a JSON document and attached to a bug
report; the dev team later loads it into a fresh server process, resuming at
the same board position to reproduce the reported behavior. The save captures
the **logical game position** (what a human would need to reconstruct the
board), not the engine's internal object graph. This makes saves robust to
engine changes: a loaded position picks up current card implementations and
rules, exactly as a physical game re-set-up would.

Because the customer is a bug report, a save of state the format cannot yet
fully represent is still valuable: the writer **saves degraded, with an
explicit machine-readable manifest of what was dropped** (`engineOnlyFacts`,
defined in work item A) rather than refusing. Invariant 4 is preserved —
what it forbids is *silent* degradation, and here every dropped fact is
enumerated. If a player-facing save button is wanted later, two things
change: a lobby consent/sharing flow (see D), and a product call on whether
degraded positions are acceptable to load at all.

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
  (set codes and `internalName`s are stable across card-data refreshes) and
  the schema itself, which is versioned and migratable.

## Existing machinery this builds on

- **Fresh-start path:** `Lobby.ts` builds `GameConfiguration` →
  `new Game(...)` → `selectDeck` → `initialiseAsync` (`Lobby.ts:1259-1289`).
  Card reconstruction from ids already exists
  (`Deck.buildCardsFromSetCodeAsync`, `server/utils/deck/Deck.ts:207-228` —
  note it is `private`, so the loader needs a small public surface added;
  token factories at `Game.ts:1578-1592`).
- **State injection:** `test/helpers/GameStateBuilder.js:95-256`
  (`setupGameStateAsync`) already does: real game start → advance phases →
  `moveAllNonBaseZonesToRemoved()` → place every card
  (`setGroundArenaUnits`, `setHand`, `setDeck`, `setLeaderStatus`, …) →
  `refreshGameState` → clear and re-seed snapshot history. This is the proof
  of concept for the *injection* half of the loader; the plan ports the
  pattern into engine code. Two caveats the loader must not inherit:
  GameStateBuilder never re-enters the pipeline (see "Load sequence" below),
  and its prompt-driving half lives in `GameFlowWrapper`, not
  `GameStateBuilder` (see C.3).
- **Pipeline contract:** rollback already never serializes the pipeline — it
  clears and re-enters at an enumerated safe point
  (`Game.postRollbackOperations`, `Game.ts:1964-1973`). Load uses the same
  contract, and this is the *only* resume mechanism (the GameStateBuilder
  pattern of leaving the pre-injection ActionWindow live is test-only and is
  explicitly not the loader's model — it cannot produce `roundNumber > 1` or
  a non-initiative active player).
- **RNG:** `seedrandom` state is a plain serializable object, already captured
  per snapshot (`Randomness.ts:19-29`, `SnapshotFactory.ts:157`).
- The empty directory `server/game/core/stateSerialization/` exists and is the
  natural home for this code.

## Schema (v1)

A versioned top-level document, `ISavedMatch`:

```jsonc
{
  "formatVersion": 1,
  "cardDataVersion": "20260423_00",       // diagnostic metadata only, NOT a load gate (see C.1)
  "savedAt": "2026-07-25T18:00:00Z",      // ISO 8601 string (never a Date object)
  "saveTrigger": {                        // how this save was taken — see "Requesting a save" below
    "kind": "deferred",                   // "immediate" = requested at a boundary; "deferred" = armed and fired later
    "requestedAtActionNumber": 16,        // action in progress when the save was *requested*
    "requestedAtPhase": "action"
  },
  "gameId": "...",
  "settings": { "gameMode": ..., "undoMode": ..., "useActionTimer": ... },
  "rng": { "seed": "...", "state": { /* seedrandom state */ } },
  "game": {
    "roundNumber": 3,
    "phase": "action",                    // always "action" in v1; kept for Plan 6 forward-compat
    "initiativePlayer": "p1",             // single source of truth for initiative
    "actionPhaseActivePlayer": "p2",
    "isInitiativeClaimed": false, "actionNumber": 17,
    "prevActionPhasePlayerPassed": false
  },
  "players": [
    {
      "seat": "p1",                       // abstract seat label; binding to real users happens at load (D)
      "name": "...",                      // display name at save time, informational only
      "decklist": { /* ISwuDbFormatDecklist as provided at lobby time */ },
      "base": { "card": "<internalName>", "damage": 4, "limits": [ ... ] },
      "leader": { "card": "...", "deployed": true, "exhausted": false,
                  "damage": 2, "epicDeployUsed": true, "upgrades": [...], "limits": [ ... ] },
      "hand": ["<internalName>", ...],                  // ordered
      "deck": ["<internalName>", ...],                  // ordered, top first
      "discard": ["..."],                               // ordered
      "resources": [ { "card": "...", "exhausted": true }, ... ],
      "groundArena": [ { "card": "...", "damage": 1, "exhausted": false,
                          "upgrades": [ { "card": "...", "ownerSeat": "p2" } ],
                          "capturedCards": [ { "card": "...", "ownerSeat": "p2" } ],
                          "limits": [ { "abilityIdentifier": "wampa_triggered_0",
                                        "usesByPlayer": { "p1": 1 } } ] } ],
      "spaceArena": [ ... ],
      "outsideTheGame": [ ... ],
      "hasTheForce": true, "creditTokens": 0
    }
  ],
  "stateWatchers": [ { "watcher": "cardsPlayedThisPhase",
                       "entries": [ /* semantic encoding — see work item A2 */ ] } ],
  "engineOnlyFacts": [ /* manifest of dropped facts — see A; empty ⇒ non-degraded save */
    { "category": "lastingEffect",      // | "gainedAbility" | "delayedEffect" | "watcherEntry" | "pilotLeader" | ...
      "source": { /* ISavedCardRef */ },
      "target": { /* ISavedCardRef, seat label, or null */ },
      "duration": "untilEndOfPhase",
      "description": "Wampa gets +2/+2 for this phase (Force Choke on p2's Wampa)" }
  ],
  "chat": [ /* uuid-scrubbed messages, ISO dates — see A */ ],
  "timers": { "p1": { "mainRemainingSeconds": 120 }, ... }  // main-timer remaining only — see C.5
}
```

Schema rules (these are the load-bearing decisions):

- **Stable coordinates only.** Cards by `internalName` (+ owner seat where a
  card can be in an opponent's zone: upgrades, captures). Abilities by
  `abilityIdentifier` (`internalName_type_idx`, minted at
  `Card.buildGeneralAbilityProps`, `Card.ts:555-562`). Watchers keyed by the
  `StateWatcherName` enum (the *entries* need their own encoding — A2).
  Tokens by `TokenCardName` enums. Players by seat label. **No uuids, no
  `GameObjectId`s, no runtime counters (`playEventId`, `inPlayId`) anywhere
  in the file.**
- **Duplicate disambiguation:** where a player controls N copies of a card,
  entries are matched by position within the save's own arrays; per-copy state
  (damage, exhaust, upgrades, **ability-limit counts**) travels with the
  entry, so no cross-references between copies are needed. Where a field must
  reference a specific copy from elsewhere in the file (watcher entries do —
  see A2), it uses an in-file coordinate `(seat, zone, ordinal)` — never a
  uuid.
- **One canonical form per fact.** Initiative lives only in
  `game.initiativePlayer` (there is deliberately no `players[].hasInitiative`).
  Token upgrades (shield, experience) appear only as entries in the unit's
  `upgrades` array, identified by `TokenCardName` — there is no separate
  per-unit token-count map. This mirrors how injection actually creates them
  (`PlayerInteractionWrapper.setCardUpgrades` routes token names through
  `generateToken` + `attachTo`, `test/helpers/PlayerInteractionWrapper.ts:317-329`).
- **Ability limits are per-copy.** Limit counts live inside the card entry
  they belong to (arena entries, `base.limits`, `leader.limits`), because
  limits are per-ability-*instance* — each copy of a card constructs its own
  ability objects with their own use counts (`AbilityLimit.ts:75,112,148`).
  A top-level `(card, abilityIdentifier)` table cannot say which of two
  Wampas spent its once-per-round use. Note the engine keys per-player use
  maps by **player name** (`AbilityLimit.ts:102-104,180-182`); the file keys
  them by seat, and the loader remaps seat → loaded player name. One limit
  class does not fit the `usesByPlayer` map: `PerGameAbilityLimit` holds a
  single `@statePrimitive` `useCount` plus an **undecorated**
  `currentUser: string | null` (`AbilityLimit.ts:108-112`); it encodes as
  `{ "useCount": n, "currentUserSeat": "p1" | null }`, and the writer must
  read the undecorated `currentUser` field directly.
- Ordered zones (deck, discard, hand, resources) preserve order.
- **Leader deploy limit:** "leader in base but deploy already used" is a real
  position — `EpicActionLimit.reset()` is deliberately a no-op so defeat does
  not refund the deploy (`AbilityLimit.ts:263-265`). The leader entry
  therefore carries `epicDeployUsed` explicitly, independent of `deployed`.
  The deploy epic action is itself an action ability carrying that
  `EpicActionLimit`, so a generic limit walk would represent it twice:
  `epicDeployUsed` is the **only** representation of the deploy limit — the
  writer excludes it from `leader.limits`, and the loader restores it solely
  from `epicDeployUsed` (one canonical form per fact).
- **Leader deployed as a pilot is out of scope for v1 — decided.**
  `DeployType.LeaderUpgrade` (`server/game/core/Constants.ts:51-54`; used by
  the JTL pilot leaders via `DeployAndAttachPilotLeaderSystem.ts`) attaches
  the leader to a unit as an upgrade — a boolean `deployed` cannot represent
  it. v1: a pilot-deployed leader is state the format cannot represent, so
  the writer **saves degraded** with a `pilotLeader` manifest entry (see A);
  the save records the leader as undeployed. The schema reserves
  `leader.deployType: 'unit' | 'pilot'` plus an attachment coordinate as the
  v-next extension — documented but explicitly **not built in v1** — because
  the injection path being ported only supports `DeployType.LeaderUnit`
  (`PlayerInteractionWrapper.ts:125-126`) and pilot leaders have *two* deploy
  epic actions, which also breaks the helper's title-string limit bookkeeping
  (`.includes('Deploy')`, `PlayerInteractionWrapper.ts:129`) — the port must
  use `isEpicActionLimit()` instead regardless (see C.4; that correctness fix
  stands independent of the deploy-type question).
- **Chat is scrubbed at write time.** `GameChat.tryFormatPlaceholder` resolves
  GameObject args via `getShortSummary()`
  (`server/game/core/chat/GameChat.ts:133-134`), which embeds `uuid`
  (`GameObject.ts:143-149`), and `ISerializedMessage.date` is a `Date`
  (`server/game/Interfaces.ts:439-442`). The writer replaces object summaries
  with their display `name` (uuids are display-only in chat) and emits dates
  as ISO strings. Chat is cosmetic history; nothing at load time dereferences
  it.

## Save trigger and restore point

**v1 restriction: saves are taken only at action-window boundaries** — the
same quiescent points where snapshots are taken today
(`SnapshotTimepoint.Action`). This means: no pipeline state, no open prompts,
no in-flight event windows or attacks exist at save time.

Be precise about what "quiescent" does **not** mean: only `UntilEndOfAttack`
effects are guaranteed gone at an action boundary. `UntilEndOfPhase` and
`UntilEndOfRound` effects survive across action windows
(`OngoingEffectEngine.ts:270-280`), gained abilities and delayed effects
persist, and state watchers only reset at end of phase
(`StateWatcher.ts:43-47`). "For this phase" buffs are bread-and-butter SWU
card text, so mid-phase saves will **routinely** hit the writer's
unsupported-state checks — which is exactly why those checks degrade with a
manifest rather than refuse (the bug-report customer needs the artifact even
when it is degraded). See work item A (manifest categories), A2 (watchers are
encoded, not dropped, except unresolvable referents), and E (measure the
actual degradation rate).

### Requesting a save from a non-quiescent moment (the armed one-shot)

The restriction above governs where a save may be *taken*, not when a user
may *ask* for one — and those are rarely the same moment. A player notices a
bug precisely because a resolution did something wrong, so by the time they
open the report dialog the game is typically mid-prompt, mid-attack, or on
the opponent's turn. Gating the button on quiescence would therefore miss the
common reporting moment outright. A save request is instead **armed, not
executed**:

- If the game is already at an action-window boundary, save immediately
  (`saveTrigger.kind: "immediate"`).
- Otherwise record the current `actionNumber`/phase and set a one-shot armed
  flag. `ActionWindow.checkUpdateSnapshot` (`ActionWindow.ts:125-136`) is
  already reached on the first `continue()` of every action window, for
  *either* player, so the flag fires at the very next boundary — **bounded
  drift of at most one action** (`saveTrigger.kind: "deferred"`). The report
  submits when the save lands, not when the button is clicked.
- **Arm independently of `undoMode`.** Hook the boundary itself, not the
  snapshot: `SnapshotManager.moveToNextTimepoint`/`takeSnapshot` early-return
  when undo is disabled (`SnapshotManager.ts:116,134`), so a flag keyed to a
  snapshot actually being taken would never fire in undo-disabled games. The
  boundary is reached regardless; the save does not depend on undo history.

The drift is declared, never hidden: `saveTrigger.requestedAtActionNumber`
read against `game.actionNumber` tells the dev opening the artifact exactly
how far the saved position sits past the reported behavior (invariant 4 —
enumerated, not silent). A deferred save that never fires — game ends, player
disconnects, game halts — submits the report with no save attached; the
existing `captureGameState` Discord summary is unaffected and still goes out.

**This mechanism deliberately does not cover the automated error paths.**
`Lobby.handleError` (`Lobby.ts:1652`) and `handleSerializationFailure`
(`Lobby.ts:1686`) fire from arbitrary pipeline points, on states the engine
has already declared unrecoverable, with the game halted — there is no next
boundary to arm, and re-entering a crashed game to produce an artifact risks
turning one incident into two. Those paths keep the `captureGameState`
summary only. Closing the gap requires writing the save from the *last action
snapshot's buffers* instead of from the live game, which is deferred (see
non-goals and Plan 6 item B).

### Load sequence (the resume contract)

Load re-enters via **rollback's entry-point machinery** —
`Game.postRollbackOperations` (`Game.ts:1964-1973`) — not via the
GameStateBuilder pattern of leaving the pre-injection ActionWindow live.
The loader constructs the entry point value
`{ type: RollbackEntryPointType.Round, entryPoint: RollbackRoundEntryPoint.WithinActionPhase }`
**directly**: `SnapshotManager.getEntryPointAfterRollback` is `private` and
derives the entry point from snapshot-manager state
(`SnapshotManager.ts:361-362`) that does not exist for a fresh load.

Why this mechanism and not GameStateBuilder's: after `advancePhases` the test
game is already sitting inside a live round-1 ActionWindow whose active player
was fixed at construction (`ActionWindow.ts:38` reads
`game.actionPhaseActivePlayer` in the constructor), so setting
`state.actionPhaseActivePlayer` after injection cannot change who is prompted,
and `roundNumber` is only advanced by `Game.beginRound` (`Game.ts:1186-1188`).
Rebuilding the pipeline is the only way to reach `roundNumber > 1` or
`actionPhaseActivePlayer !== initiativePlayer` — and it does reach them:

1. Injection and scalar restore happen first (see C for the full order).
   `game.state` scalars restored from the file include `roundNumber`,
   `actionNumber`, `initiativePlayer`, `actionPhaseActivePlayer`,
   `isInitiativeClaimed`, `prevActionPhasePlayerPassed`.
2. **Derive `passedActionPhase`** (it is Player state, not Game state —
   `Player.ts:153` — and is nulled between phases, `Player.ts:901`):
   `player.passedActionPhase = isInitiativeClaimed && player === game.initiativePlayer`,
   else `false`. Justification: at an open action window, the only reachable
   combinations are "no claim → both false" and "claimed by X → X true, other
   false" (`Game.ts:1342-1346`, `ActionWindow.ts:198-207`; the both-true case
   ends the phase immediately, so no action window exists there).
3. `resolveGameState(true)`, then `snapshotManager.clearAllSnapshots()`.
4. `game.postRollbackOperations({ Round, WithinActionPhase })`. With
   `PhaseInitializeMode.RollbackToWithinPhase` (mapped at `Game.ts:1234-1235`),
   the rebuilt `ActionPhase` **skips** `setupActionPhase`
   (`ActionPhase.ts:28-30`), so the loader-set `passedActionPhase` and
   `prevActionPhasePlayerPassed` are *not* clobbered by
   `resetForActionPhase` (`Player.ts:894`); `queueNextAction(game.actionNumber)`
   (`ActionPhase.ts:33-35`) constructs the new ActionWindow, which reads
   `game.actionPhaseActivePlayer` and `game.prevActionPhasePlayerPassed` —
   both already restored. `pipeline.continue()` fires and the correct player
   is prompted.
5. **Snapshot seeding is owned by the re-entered ActionWindow**, not the
   loader. On its first `continue()`, `ActionWindow.checkUpdateSnapshot`
   (`ActionWindow.ts:125-136`) sees the cleared snapshot manager's timepoint
   is not `Action` (or the action number mismatches) and takes the first
   action snapshot itself. Do **not** port GameStateBuilder's manual
   `takeSnapshot` calls (`GameStateBuilder.js:237-253`) — they exist only
   because that path never re-enters the pipeline. The timepoint-ordering
   question is resolved from code: `moveToNextTimepoint` has no ordering
   assertion (`SnapshotManager.ts:113-131`), the snapshot-factory getters
   are null-safe (`SnapshotFactory.ts:38-60`), and `Phase.initialise` skips
   the start-of-phase snapshot in every rollback mode (`Phase.ts:46-49`) —
   today's rollback already takes an action snapshot with no fresh
   start-of-phase marker, so the loader needs no marker seeding.
   Once Plan 4's delta snapshots
   exist, this first full snapshot is also the delta tracker's window
   anchor: after load, the tracker must not start until it is taken —
   Plan 4's `startTracking` asserts an anchor snapshot exists (see Plan 4,
   "Cadence").

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
- Chat scrubbing per the schema rule above (name-only summaries, ISO dates).
- **Unsupported-state detection → degrade with manifest:** the writer must
  detect state the schema cannot represent and declare it rather than
  silently drop it (invariant 4 forbids *silent* degradation — degradation
  that is enumerated and explicit is the design). The detection list,
  detectable from the engine:
  - active ongoing effects with non-permanent durations
    (`UntilEndOfPhase`/`UntilEndOfRound` effects registered in
    `OngoingEffectEngine` beyond those re-derived from printed constant
    abilities);
  - gained abilities on cards (granted by another card's effect);
  - pending delayed effects / custom-duration events;
  - **leader deployed as a pilot** (`DeployType.LeaderUpgrade`);
  - **watcher entries whose referents cannot be re-identified** (see A2).
  For each detected fact the writer drops it from the saved position and
  appends an **`engineOnlyFacts` manifest entry** — one entry per dropped
  fact: `category` (from the list above), `source` (`ISavedCardRef` of the
  card whose effect/ability it is), `target` (`ISavedCardRef`, seat label,
  or null), `duration`, and a human-readable `description`. This is exactly
  the data the detection checks compute anyway — the checks produce the
  manifest instead of an error. The name and shape are shared with Plan 6,
  which inherits this schema for its engine-tier manifest. Do not assume
  these facts are rare: phase/round-duration effects survive at action
  boundaries, so degraded saves will be common mid-phase (measured in E).
  - **What still refuses at write time:** `Card.nextAbilityIdx` drift that
    would break `abilityIdentifier` matching is a coordinate-integrity
    failure, not unrepresentable state — a save whose coordinates cannot be
    trusted is corrupt, not degraded, so the writer hard-fails on it.
    The detection procedure (defined here because `nextAbilityIdx` is
    private and cannot be read directly — `Card.ts:319-320`): for every
    ability limit being serialized, the writer re-derives the identifier
    set from a pristine instance of the card class (fresh construction
    mints identifiers deterministically via `Card.buildGeneralAbilityProps`)
    and hard-fails if the identifier it is about to emit is absent from
    that set.
  - **The degrade+manifest rule is write-side only.** It applies to *game
    state the format cannot yet represent* — never to *files that cannot be
    trusted*. Load-side validation is unchanged: unresolvable card/ability
    coordinates, schema violations, and corrupt or truncated files still
    hard-fail loudly (see C).

### A2. State-watcher entry encoding

Watcher entries are **not** plain data: they store `GameObjectId` uuids by
design — the dev assertion the engine itself enforces says "Use GameObjectId
instead" (`StateWatcher.ts:106`), and e.g. `CardsPlayedThisPhaseWatcher`
stores `card`, `playedBy`, `parentCard` as `GameObjectId`s plus the runtime
counters `playEventId`, `inPlayId`, `parentCardInPlayId`
(`CardsPlayedThisPhaseWatcher.ts:14-25,66-76`). Watchers reset only at end of
phase, so mid-phase saves will routinely have non-empty entries. Serializing
entries verbatim would violate the no-uuid rule and dangle after load.

**Decision: per-watcher semantic encoding, with manifest-declared dropping
for unresolvable referents.** Reasoning: dropping *any* non-empty watcher
would degrade essentially every save past the first action of a phase for
most decks (any play/attack/action populates a registered watcher); whereas
the encoding work is mechanical — the ~15 watchers in
`server/game/stateWatchers/` have near-flat entry structs of GameObjectIds +
primitives. Two exceptions carry a `Set<Trait>` captured at event time
(`AttacksThisPhaseWatcher`'s `attackerAttributes: ICardAttributes`,
`AttacksThisPhaseWatcher.ts:17` / `Interfaces.ts:639-642`, and
`CardsDefeatedThisPhaseWatcher`'s `lastKnownInformation`,
`CardsDefeatedThisPhaseWatcher.ts:18-22`) — captured-at-event-time semantic
data that cannot be re-derived post-load, so it is serialized with the same
tagged-Set JSON encoding that B names for `Set` state, not dropped.

- Define one shared reference encoding used by all watcher serializers:
  `ISavedCardRef = { card: internalName, controllerSeat, zone, ordinal }`
  where `(zone, ordinal)` index into that seat's zone arrays *within this
  save file*; `Player` references encode as a seat label. The zone domain is
  **wider than the array zones**: it includes the singleton positions
  `leader` and `base` (with `ordinal: 0`), because watchers reference exactly
  those (`LeadersDeployedThisPhaseWatcher.ts:10-12`,
  `BasesHealedThisPhaseWatcher.ts:9-11`) — without them, every save in the
  phase after a leader deploy or base heal would degrade spuriously under the
  unresolvable-referent rule below. It also includes a sub-position form for
  cards nested inside an arena entry's `upgrades`/`capturedCards` arrays,
  since a card referenced by `CardsLeftPlayThisPhaseWatcher` or
  `CardsDefeatedThisPhaseWatcher` may now sit in a capture zone.
- **Unresolvable-referent rule:** if an entry references an object that no
  longer exists in any saved zone (a defeated token unit — tokens cease to
  exist; anything else outside the save's zones), the writer **drops that
  entry and appends a `watcherEntry` manifest entry** naming the watcher and
  the vanished referent (invariant 4: enumerated, never silent — a lossy
  encoding that *pretended* to be complete is what is forbidden). (Most
  defeated non-token cards land in discard and remain resolvable.) This
  raises the degradation rate — measured in E.
- **Runtime counters** in entries must be translated, not copied — and the
  `CardsPlayedThisPhaseWatcher` trio above is an example, not the inventory
  (`AttacksThisPhaseWatcher` adds `attackId`, `attackerInPlayId`,
  `targetInPlayId`, `actionNumber`; `DamageDealtThisPhaseWatcher` adds
  `damageSourceEventId`, `damageSourceInPlayIds[]`, `activeAttackId`). The
  A2 PR therefore produces a **per-watcher field inventory**: every
  non-`GameObjectId` field of every entry struct gets an explicit
  classification — semantic data, stint flag, order-only counter, or
  live-comparison counter — before its serializer is written. Translation by
  class:
  - *Order-only counters* (`playEventId`, …) are preserved only as entry
    ordering (entries are ordered arrays); cross-entry groupings (e.g.
    `activeAttackId` linking damage entries to one attack) are preserved as
    save-local ordinals.
  - *Stint flags* (`inPlayId`/`parentCardInPlayId`/…) are saved as a "refers
    to the referent's current stint in play" flag and rehydrated against the
    loaded card's fresh `inPlayId` (current stint) or a sentinel non-current
    value.
  - *Live-comparison counters* additionally need a **disjointness rule**:
    some saved counters are compared post-load against ids the live game
    generates — Ki-Adi-Mundi compares a saved `playEventId` to the live
    `event.eventId` (`KiAdiMundiComposedAndConfident.ts:41`), and Flash the
    Vents compares a saved `activeAttackId` to the live attack's id
    (`FlashTheVents.ts:42`). Live event ids come from
    `game.state.lastGameEventId` (`Game.ts:1663-1666`), which the loader does
    not restore, and live attack ids from `Game._lastAttackId`, an
    undecorated plain field that restarts at -1 in a fresh process
    (`Game.ts:303,669-672`) — so an order-preserving rewrite alone can equal
    a *future* live id (a rewritten `activeAttackId` of 2 colliding with the
    third post-load attack would make Flash the Vents count stale pre-save
    damage as dealt during that attack). **Decided: the loader mints
    rewritten counter ids from a negative range, order-preserving** — live
    generators only ever produce non-negative ids, so collision is
    impossible and no engine change is needed. (The alternative — adding
    `lastGameEventId` to the restored scalar list and bumping
    `_lastAttackId`, which is not part of `game.state` today — was rejected
    as the heavier engine change.)
- On load, each watcher's entries are rebuilt with the `GameObjectId`s of the
  newly constructed objects, so `mapCurrentValue`
  (`CardsPlayedThisPhaseWatcher.ts:35-37`) works unmodified.
- The writer serializes only watchers actually registered in the source game;
  see E for how tests compare watcher sets.

### B. JSON-safety dev assertion (the standing-invariant enforcement)

Add a dev-mode check in the decorator layer: `@stateValue` values must be
JSON-representable or of a known encodable type (`Map`/`Set` with JSON-safe
elements, `GameObjectId`). Model: the existing `StateWatcher` dev check
(`StateWatcher.ts:105-110`) which rejects GameObjects/GameEvents in watcher
entries. This does not change runtime behavior; it prevents new state from
violating the invariant that Plan 6 depends on. (Note the distinction from
A2: `GameObjectId`s are legal *in engine state* — invariant 2 only bans them
from *save files*.)

### C. Loader

- `MatchLoader.loadAsync(saved: ISavedMatch, config): Game`:
  1. Validate `formatVersion`. **Do not gate on `cardDataVersion`** — that
     would brick every existing save on every card-data refresh, contradicting
     the durability goal, even though the coordinates the schema depends on
     (`internalName`, set codes) are stable across refreshes. Instead,
     validate what actually matters: every `internalName`, token name, and
     `abilityIdentifier` in the file must resolve against current card data;
     fail loudly (invariant 4) on genuine resolution failures, reporting
     the saved vs. current `cardDataVersion` as diagnostics in the error.
  2. Bind seats to users: the loading lobby maps each user to a seat label
     and its decklist (see D). All seat-keyed data (`usesByPlayer`,
     `timers`, `ownerSeat`, watcher refs) is remapped through this binding;
     remember engine limit maps key by player *name* (`AbilityLimit.ts:102-104`).
  3. Fresh `Game` via the normal `Lobby` construction path with the saved
     decklists and settings, then advance through setup deterministically.
     This requires a **headless prompt driver** — a small engine-side scripted
     setup runner that answers the initiative flip, mulligan "Keep", and
     resource-two selection. The model code is in `GameFlowWrapper`
     (`selectInitiativePlayer` `test/helpers/GameFlowWrapper.js:205-212`,
     `keepStartingHand` `:99-102`, `resourceAnyTwo` `:82-90`), which drives
     prompts by title-string matching plus the pre-start
     `game.initiativePlayer` injection (`GameStateBuilder.js:115-119`). Port
     it as engine code answering prompts by prompt *type*, not title strings.
     (The saved RNG state is restored *after* injection, so setup-time
     shuffles don't matter.)
  4. Inject position: port the `GameStateBuilder` operations
     (`moveAllNonBaseZonesToRemoved`, `setGroundArenaUnits`, `setHand`,
     `setDeck`, `setLeaderStatus`, `setBaseStatus`, `setResourceCards`,
     `setDiscard`, `setHasTheForce`, `setCreditTokenCount`
     (`PlayerInteractionWrapper.ts:967,995`), upgrade/capture attachment,
     damage/exhaust state, and explicit `outsideTheGame` placement — the
     helpers only ever use that zone as staging, but it is a real schema
     zone the loader must populate deliberately)
     from `test/helpers/PlayerInteractionWrapper.ts` into engine-side code.
     The test helpers then become thin wrappers over the engine
     implementation (large incidental win: state injection becomes a
     supported engine feature instead of test-only code). Two mandatory
     deviations from the helpers:
     - the engine-side `setLeaderStatus` must **not** do implicit limit
       bookkeeping (the helper increments the deploy limit whenever
       `deployed === true`, found by title-string
       `.includes('Deploy')` — `PlayerInteractionWrapper.ts:125-132`);
       use `isEpicActionLimit()` for identification, and leave *all* limit
       counts to step 5 so a generic restore pass cannot double-count the
       deploy for deployed leaders;
     - after injection, **assert the staging zone is clean**:
       `moveAllNonBaseZonesToRemoved` stages every card in the
       `outsideTheGame` zone (`PlayerInteractionWrapper.ts:56-61`), which is
       also a real schema zone — any card the loader failed to place would
       silently remain there. Assert post-injection `outsideTheGame` contents
       equal the save's declared `outsideTheGame` arrays, else fail the load.
  5. Restore, in order: per-copy ability-limit counts (the single authority
     for all limits, including `epicDeployUsed` → the leader's
     `EpicActionLimit`), watcher entries (per A2), chat, timers, RNG state,
     `Game.state` scalars, and the `passedActionPhase` derivation — exactly
     as specified in "Load sequence" above. Two semantics to pin down here
     so PR 4 doesn't discover them by surprise:
     - **Chat restore replaces the message log**, never appends — the driven
       setup in step 3 generates its own messages, and appending would fail
       E's round-trip property on chat.
     - **Timer restore: the only durable fact is main-timer remaining.** The
       turn timer resets on every prompt by design, so `isOnMainTimer` is
       not persisted (the loaded player simply starts on a fresh turn
       timer). `ByoyomiTimer` has no restore surface today — `isOnMainTimer`
       and both inner timers are private (`ByoyomiTimer.ts:27-36`) — so PR 4
       adds a small public restore method for main-time remaining. Ordering
       is safe: the re-entered ActionWindow's constructor calls
       `activePlayer.actionTimer.stop()` (`ActionWindow.ts:41`), but
       `stop()` only stops the turn timer and *pauses* the main timer,
       preserving its remaining time (`ByoyomiTimer.ts:173-181`).
  6. `resolveGameState(true)`, `clearAllSnapshots()`, then
     `postRollbackOperations({ Round, WithinActionPhase })` per the load
     sequence; the re-entered ActionWindow takes the first action snapshot.
- Loading must be rejected cleanly (not crash) on: unknown card names or
  ability identifiers, invalid positions (e.g. upgrade on empty arena),
  format-version mismatch, corrupt or truncated files, staging-zone residue.
  The degrade+manifest rule never applies here — an untrustworthy *file*
  always hard-fails, regardless of how tolerant the *writer* is of
  unrepresentable state.
- A save with a non-empty `engineOnlyFacts` manifest loads normally — the
  loaded position simply lacks the dropped facts — and the loader surfaces
  the manifest to the caller (for the bug-report customer: the dev sees
  exactly what the reproduction is missing).

### D. Server plumbing (shrunk under the bug-report decision)

Saves go to the dev team via bug reports, not between players, so v1 needs
no lobby consent or sharing flow — only artifact production and a dev-facing
load path.

- Save: expose on the lobby/game socket surface. Output: JSON document to
  the client (download / bug-report attachment) — server-side storage is
  optional and out of scope for v1.
- **The armed one-shot trigger** (per "Requesting a save from a non-quiescent
  moment"): a request arriving at a boundary saves inline; otherwise the
  lobby stores `{ requestedAtActionNumber, requestedAtPhase }` and arms a
  one-shot flag that the next action-window boundary consumes, independent of
  `undoMode`. The request is attached to the in-flight bug report, which
  submits on completion. Bound the armed state to the current game instance
  and clear it on game end, phase exit to regroup, or disconnect — a stale
  flag firing into a later round would produce an artifact that silently
  misrepresents the reported moment.
- Load: dev-facing flow accepting an `ISavedMatch`, binding users to seats
  (each user picks or is assigned a seat; the seat determines their decklist
  and all seat-keyed state), constructing the game via `MatchLoader`, and
  surfacing the `engineOnlyFacts` manifest.
- **Hidden information — decided: documentation-only for v1.** Deck order
  and hands are in the file in cleartext. For the bug-report customer this
  is a feature, not a leak: the hidden information is exactly what makes a
  report reproducible, and the recipient is the dev team. Document the
  constraint here (a shared save reveals hands and deck order); a real
  scrubbing writer mode is required only when player-to-player sharing
  ships, and is deliberately not built in v1.

### E. Verification

- **Round-trip property tests:** build positions with `GameStateBuilder`
  (dozens of existing specs construct rich positions), save, load into a fresh
  game, save again → the two `ISavedMatch` documents must be deeply equal,
  with two defined normalizations: `savedAt` is excluded, and `stateWatchers`
  are compared as maps keyed by watcher name with **absent ≡ empty** —
  because `GameStateBuilder.registerAllStateWatchers` registers every watcher
  in the library (`GameStateBuilder.js:233,262-271`) while production games
  register only the watchers their cards request, the two sides will not have
  identical watcher sets. For a *degraded* first save, the property is:
  the two documents are equal after excluding `engineOnlyFacts` and
  `savedAt`, and the re-save's manifest is **empty** (the dropped facts no
  longer exist to drop).
- **Continuation tests** (must pass for **non-degraded** saves — empty
  manifest): save mid-game in an integration test, load, and play several
  representative actions asserting identical outcomes to the unloaded
  original. Required scenarios:
  - attack, play unit, use triggered ability;
  - claim initiative *after* load;
  - a save taken *after* initiative was claimed (exercises the
    `passedActionPhase` derivation);
  - a mid-phase save with the **non-initiative player active** in a round
    with `roundNumber > 1` (exercises the pipeline re-entry path that
    GameStateBuilder cannot reach);
  - a save with non-empty watcher entries consumed by a watcher-reading card
    post-load (exercises A2 end-to-end);
  - a save taken in the same phase as a leader deploy (the
    `LeadersDeployedThisPhaseWatcher` entry must round-trip via the `leader`
    singleton coordinate rather than degrade);
  - a once-per-round ability used by one of two copies pre-save: post-load,
    only the *other* copy may use it (exercises per-copy limits);
  - a deployed leader and a defeated-then-undeployed leader
    (exercises `epicDeployUsed` without double-count).
- **Degraded-save manifest tests:** for each manifest category (duration
  effects, gained abilities, delayed effects, pilot-deployed leader,
  unresolvable watcher referent), construct a position containing the fact,
  save, and assert the manifest **accurately enumerates exactly what was
  dropped** — correct category, source, target, duration — and nothing else.
- **Armed-one-shot trigger tests:** a request issued at a boundary saves
  inline with `saveTrigger.kind: "immediate"` and equal
  `requestedAtActionNumber`/`game.actionNumber`; a request issued mid-prompt
  and mid-attack fires at the next boundary with `kind: "deferred"` and a
  drift of exactly one action; a request in an **undo-disabled** game still
  fires (guards the `SnapshotManager.ts:116,134` early-return); an armed flag
  is cleared by game end and by phase exit rather than firing into a later
  round.
- Writer hard-refusal test for the remaining refusal case
  (`Card.nextAbilityIdx` coordinate drift), plus load-side rejection tests
  for untrustworthy files (unknown coordinates, schema violations,
  truncation).
- **Degradation-rate measurement:** instrument the writer against the
  positions constructed by the existing integration-test suite and report
  what fraction of action-window positions save degraded and by which
  manifest category. Worth measuring for visibility into how complete the
  format is; it is **not a ship gate** — the bug-report customer accepts
  degraded artifacts (it would become a gate only if a player-facing button
  is ever built).

## Explicit non-goals (v1)

- A player-facing save button (v1's customer is the bug-report attachment;
  a button would additionally need a lobby consent/sharing flow and a
  product call on loading degraded positions).
- Saving mid-prompt, mid-attack, or mid-ability resolution. (A save may be
  *requested* there; it is *taken* at the next boundary — see the armed
  one-shot.)
- **Semantic saves from the automated error paths** (`Lobby.handleError`,
  `handleSerializationFailure`). They fire on halted, unrecoverable states
  with no next boundary to arm, and keep the existing `captureGameState`
  Discord summary. The enabling mechanism — writing the save from the last
  action snapshot's buffers rather than the live game — is deferred to
  Plan 6 (item B), where the writer already reads serialized records and the
  second read path is far cheaper to add.
- Preserving active duration-bound ongoing effects, gained abilities, delayed
  effects (dropped with `engineOnlyFacts` manifest entries instead).
- Leader deployed as a pilot upgrade (dropped with a manifest entry; schema
  reserves the extension point, not built in v1).
- A scrubbing writer mode for hidden information (documentation-only in v1;
  required only when player-to-player sharing ships — see D).
- Preserving undo history across a load (snapshot history restarts).
- Schema migration between format versions (fail loudly instead; Plan 6).
- Server-side save storage/persistence infrastructure.

## Risks / open questions for reviewer

- **`abilityIdentifier` stability — decided: exact matching, loud refusal.**
  Identifiers embed a per-card ability index; card refactors that reorder
  ability registration change coordinates, and the worst case is a limit
  count that fails to resolve, refusing the load via C.1's resolution check.
  That is the accepted cost: v1 saves are short-lived bug-report artifacts,
  not a durable format (migration is a non-goal; Plan 6 fails loudly on
  version drift). The rejected alternative — keying limits by
  `(card, abilityType, ordinal)` with fuzzy matching — could silently bind a
  limit count to the *wrong* ability after a refactor, exactly the silent
  wrongness invariant 4 forbids. Both enforcement ends already exist: the
  writer hard-fails on identifier drift (pristine-instance re-derivation
  check, work item A), and the loader refuses unresolvable limits (C.1).
- **Setup determinism in the loader:** step C.3 assumes advancing a fresh game
  to the action phase is safe with arbitrary RNG (state is overwritten after
  injection). `GameStateBuilder` proves this for tests; confirm no
  setup-phase player choices leak into injected state (mulligan and resourcing
  are all overwritten by injection).
- **Snapshot-manager timepoint ordering on re-entry — resolved.** An action
  snapshot without a preceding start-of-phase timepoint is already today's
  rollback behavior (`Phase.ts:46-49`; no ordering assertion in
  `SnapshotManager.ts:113-131`); no marker seeding needed. See load sequence
  step 5.

---

## Performance capture (required on completion)

```bash
npm run benchmark -- --name after-plan-02 --compare initial-performance
```

Commit both generated files under `docs/plans/performance/`. See
[Plan 0](00-performance-benchmarks.md) for the method and
[the capture index](performance/README.md) for the rules.

**What this plan should move: nothing.** Save/load is an out-of-band operation
on an explicit request; it is not on the per-action or undo path. This capture
exists to prove that — specifically that the dev-mode JSON-representability
assertion introduced here has not been left enabled on a hot path.

**What would be a red flag.** Any movement in `manager/*` or `sustained/*`
beyond noise. If the assertion costs measurable time in dev mode, say so and
state where it is gated off.
