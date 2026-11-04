# Plan 7 — Match Replay Recording

**Status:** Proposed, not scheduled (not part of `IMPLEMENTATION-ORDER.md`).
**Depends on:** Plan 1 item B (the rollback restores `lastGameObjectId`) and Plan 1 item C (the seeded RNG); both have landed.
**Coordinates with:** the SWU-PGN replay format ([SWU-Karabast/forceteki#2350](https://github.com/SWU-Karabast/forceteki/pull/2350)), which owns the file format this plan writes; the engine-owned per-viewer projection that format is built on, for which [SWU-Karabast/forceteki#3072](https://github.com/SWU-Karabast/forceteki/pull/3072)'s committed `getState()` fixtures are a guard; Plan 4 (the rollback exit that work item C hooks is the same one Plan 4's tracker stops and restarts at); Plan 2 (games loaded from a save are out of scope, see Non-goals).
**Shape:** Large on the server side, in seven work items (A–G); the CI parity gate (E) is the largest and has an open-ended divergence-fixing tail. The file format, its reader package and the client viewer are owned elsewhere and not sized here.

## Goal

Be the recording backend for SWU-PGN: produce, on request, a per-viewer replay file that tools on other sites can replay without our engine, while adding almost nothing to the CPU cost of a live game.

While the game runs, the server keeps only a header and an ordered list of player inputs: a few hundred small entries, tens of KB per game.
When a player asks for a replay, a runner rebuilds the game from the seed and the inputs, with the snapshot system switched off.
At every player decision it asks the engine for each viewer's board, diffs it against the previous step, and writes the differences as SWU-PGN records.
An undo in the live game also removes the inputs it undid, so the runner never has to roll anything back.
Each served file is one viewer's perspective: a card's identity appears only where that viewer saw it, and the omniscient log never leaves the server.

## Why an input log feeding an offline projection

- **Live recording is what blocked SWU-PGN.** The maintainer review of #2350 measured its live recorder at about 17% of engine time, paid by every game whether or not anyone downloads a file, on game nodes that already reach full CPU at peak. Appending an input to a log costs almost nothing, so recording here can stay on for every game.
- **The board the review asks for is projected after the game, not during it.** The review's direction is to project the full board at each player decision and store mechanical diffs. The runner does exactly that, but offline and only for games someone exports, so live games never pay for the projection.
- **Recording becomes lazy.** A file built from live events needs every event since the first shuffle, so it cannot be switched on late. A file built from the log can be generated for any game whose log still exists, including earlier games of a Bo3 set.
- **The log is never the file.** The review rejects an input log with seeded re-simulation as a file format because it breaks with every engine change and needs omniscient inputs. Both points apply to serving the log, which this plan never does: the log is server-internal and expires at the next deploy, and the served file is the engine-independent SWU-PGN output, already reduced to one viewer.
- **Inputs are recorded by stable identity, not by uuid.** The raw socket arguments carry prompt uuids and card uuids, and neither is reproducible in a second run (see Ground truth). This is standing invariant 2 (`README.md`) applied to the log.
- **Plan 4 deltas are the wrong source.** They store old values, are evicted by age, exist only in the action phase, are keyed by runtime uuids and are bound to the build's schema. The runner hooks the same timepoints but projects the viewer-level board instead.

## Ground truth this builds on

- **Seed.** `Game` takes `details.seed` or generates one with `randomBytes(16)` (`Game.ts:490`); `setRandomSeed` exists for repro runs (`Game.ts:860`). Every random call in game logic goes through `game.randomGenerator` (`Randomness.ts` wraps seedrandom): the deck shuffle (`Player.ts:741`), the first-player pick (`SetupPhase.ts:68`), the mulligan (`MulliganPrompt.ts:115-118`), random resource selection (`ResourceZone.ts:88`) and random discard (`DiscardCardsFromHandSystem.ts:107`). There is no `Math.random`, `Date.now`, `crypto` or `performance.now` in game logic.
- **Seed secrecy is already partial.** The seed is never sent to clients, but it is logged at info level when a test game starts (`Lobby.ts:1396`) and included in `captureGameState` (`Game.ts:2449`), which reaches bug-report Discord channels. The log follows the same rule: never in client-bound state, never in a served file.
- **Input dispatch.** Every client game command passes `Lobby.allowedGameCommands` and is dispatched as `await this.game[command](userId, ...args)` followed by `this.game.continue()` (`Lobby.ts:1803-1886`). If the command throws, `continue()` is skipped and the catch only logs (`Lobby.ts:1903-1905`), so the game stays in whatever state the command left. The allowlist is `cardClicked`, `chat`, `concede`, `menuButton`, `perCardMenuButton`, `rollbackToSnapshot`, `statefulPromptResults` and `toggleOptionSetting`.
- **Inputs that are not socket commands.** Timer expiry (`Game.onGameTimerExpired`, `Game.ts:969`, fired by `ByoyomiTimer` through `Player.ts:205`), the Bo3 concede path (`Lobby.concedeBo3ByUserId`, `Lobby.ts:990`, which calls `Game.concede` directly) and a player leaving (`Lobby.removeUser` ending the game with `PlayerLeft`, `Lobby.ts:1300-1306`). Neither timer expiry nor `removeUser` calls `continue()` afterwards. The reconnect and disconnect paths in `Lobby` make no game-state calls.
- **Prompt uuids are not reproducible.** `UiPrompt` assigns `uuid = v1()` from the `uuid` package (`UiPrompt.ts:1,12`), which is wall-clock time plus a random node id. `menuButton`, `perCardMenuButton` and `statefulPromptResults` carry that uuid, and `checkPlayerAndUuid` asserts it equals the open prompt's (`UiPrompt.ts:172-175`).
- **Card uuids are not reproducible either.** Uuids are `<getGameObjectName()>_N` from one counter (`GameStateManager.ts:121-125`). Three things make `N` differ between a live game and a rerun:
  - `Game.initialiseAsync` builds both players' decks under `Promise.all` (`Game.ts:1418`), and `Deck.buildCardsAsync` awaits a card-data read before constructing each card (`Deck.ts:232-237`). In production that read is uncached `fs.promises.readFile` (`LocalFolderCardDataGetter.ts`), so the interleaving of the two players' card creation depends on I/O completion order. Tests use `UnitTestCardDataGetter`, which resolves from a cache, so tests never show this.
  - A denied, blocked or failed undo request leaves the counter one higher: `UndoConfirmationPrompt` passes no `source`, so `HandlerMenuPrompt` creates and registers a fresh `OngoingEffectSource` (`HandlerMenuPrompt.js:33-34`). Only a successful rollback restores the counter.
  - A bug-report save made mid-game constructs throwaway cards for pristine ability identifiers (`PristineAbilityIdentifiers.ts:99-103`), and the counter still advances past them. That result is cached in a module-level map, so whether a given game's counter moves depends on what the process did earlier.
- **Card ids leak decklist order.** Within a player, cards are created from the decklist before the deck is shuffled (`Player.ts:776`), so a served file must never carry uuids.
- **Undo off.** `UndoMode.Disabled` makes `SnapshotManager.moveToNextTimepoint` skip snapshot creation and only call `removeUnusedGameObjects` (`SnapshotManager.ts:116-120`), and `Game.rollbackToSnapshot` returns `false` at once (`Game.ts:2103`). Production games always run with undo on (`Lobby.ts:267`); only tests exercise `Disabled`, so the runner is the first production-shaped user of that mode.
- **Rollback restores the RNG and the uuid counter.** A successful rollback restores `rngState` (`SnapshotContainerBase.ts:77-78`) and, as its last step, `lastGameObjectId` (`GameStateManager.ts:349-351`). It does not restore plain fields such as `Game._lastAttackId` (`Game.ts:428,866`), which `AttacksThisPhaseWatcher` copies into serialized state.
- **Rollback entry points.** Player undo goes through `Game.rollbackToSnapshot` (`Game.ts:2102`), which either rolls back at once or queues an `UndoConfirmationPrompt` for the opponent (`Game.ts:2153`). Cost-payment recovery is a second, engine-initiated rollback (`Game.ts:2249`). Both call `rollbackToSnapshotInternal` (`Game.ts:2291`), which runs the restore and, on success, `postRollbackOperations`, which calls `pipeline.continue` and can take new snapshots with fresh ids (`Game.ts:2302-2310`).
- **Some prompts differ by undo mode.** The cost-payment recovery prompt offers `Undo` or `Request undo` with undo on and `Abandon` with undo off (`Game.ts:2200-2221`, `CostPaymentRecovery.ts:65-69`), and HandlerMenu answers are choice indices (`HandlerMenuPrompt.js`). `PassDelayPrompt` exists in both modes; the `playerHasBeenPrompted` / `playerHasDecided` / hidden-information maps only feed undo classification.
- **Wall-clock reads.** The engine reads the clock only for metadata: chat timestamps (`GameChat.ts:34`, `:39`) and `createdAt` / `startedAt` / `finishedAt` on `Game`.
- **Per-viewer visibility already exists.** `Card.getSummary(viewer)` hides a card in a zone whose `hiddenForPlayers` covers that viewer, sending only controller, owner, zone, the uuid for its controller, and the viewer's selection state (`Card.ts:1478-1526`). The engine's `facedown` flag is `false` in hand (`Card.ts:1312`), so `facedown` is not the visibility test. Public reveals are a distinct system, `RevealSystem` (`EventName.OnCardRevealed`, `RevealSystem.ts:12-28`), and a deck's shown top card is exposed through `Player.isTopCardShown` (`Player.ts:1165-1186`); neither changes the card's zone.
- **Narrative text carries identities.** Chat and game-log messages are formatted at write time with each card's `getShortSummary()` (name, uuid, set id; `GameChat.ts:123-132`) and shipped to every viewer unfiltered (`Game.ts:1992-2003`). `Player.getStateSummary` ships the user object, including username and id (`Player.ts:1187-1188`).

## Work items

### A. Replay header

At game start, record what the runner needs to rebuild the same game:

- the seed;
- each player's card list in decklist order (set codes and `internalName`s, never a deck URL, which can change after the game): the pre-shuffle order decides the shuffle result;
- the game settings (format, game mode, undo mode, timer settings, `promptedActionWindows`), player ids and seats, and `preselectedFirstPlayerId` (`Lobby.ts:1643`), which decides whether the first-player pick uses the RNG;
- each player's initial option settings, in particular `autoSingleTarget`, which comes from user preferences (`Lobby.ts:1622-1626`) and decides whether some prompts appear at all; later changes arrive as `toggleOptionSetting` inputs;
- the build commit, the card-data hash (`card-data-hash.txt`) and the Node version (V8 behaviour such as sort stability is part of the build);
- how the game was constructed (normal start, Plan 2 load, dev test game), so the runner can refuse what it cannot rebuild;
- the Bo3 game number; each game of a Bo3 set has its own seed and its own log.

The header is written once and never changes, so it costs nothing per action.

### B. Input log with stable references

`Game` owns an `InputLog`: an ordered array of entries `{ seq, kind, playerId, command, args, at }`, where `kind` is `input`, `engineEvent` or `checkpoint` (see D), and `at` is the wall-clock time kept only for replay pacing.

**Recording point.** One `Game.handlePlayerInput(playerId, command, args)` dispatcher that records the entry, calls the command and calls `continue()`, used by `Lobby.onGameMessage` and by the test harness's player helpers (which today call `game.cardClicked` and friends directly). It reproduces `Lobby`'s semantics exactly: a command that throws is still recorded, `continue()` is skipped, and the error is logged, not rethrown. The runner uses the same dispatcher, so live and replay cannot drift on this.

**Stable references.** Before an entry is stored, every runtime identity in its arguments is rewritten:

- A prompt uuid becomes the sentinel "the prompt open for this player". At record time the recorder asserts the uuid matches that player's open prompt; an input with a stale uuid (which the live game rejects with a swallowed assertion) is recorded as a rejected no-op and never replayed. At replay time the dispatcher substitutes the uuid of the prompt open in the runner's game.
- A card uuid becomes a stable card coordinate: `(ownerSeat, decklistIndex)` for cards built from a decklist (including leader and base), and `(token, k)` for the `k`-th token created in the game, where `k` is a counter kept in decorated state so that rollback restores it. The coordinate is assigned when the card is created, independent of the uuid counter, so the deck-construction race, denied undo prompts and bug-report saves do not move it.
- A HandlerMenu answer records its choice index and the chosen button's text; the runner asserts the text matches before dispatching, so a prompt whose choices differ between runs fails loudly instead of choosing the wrong button.

**Engine events.** Each is recorded once, at the point it enters the engine, and replayed without a following `continue()`, matching the live code:

- timer expiry inside `onGameTimerExpired`;
- a player leaving inside `Lobby.removeUser`, before it ends the game;
- the Bo3 concede path inside `Lobby.concedeBo3ByUserId`; a `concede` socket command is already recorded by the dispatcher, so `Game.concede` itself does not record;
- not `Game.endGame`, which also runs for rule-driven endings the runner reproduces by itself.

**Other rules.**

- `chat` is not recorded. Player chat stays out of replay files, and it changes no game state, so leaving it out cannot cause a divergence.
- The log is server-side only, for the same reason the seed is: seed plus inputs reveals both decks' order.

### C. Rollback-aware truncation

When a rollback succeeds, the log is cut back to the length it had when the target snapshot was taken, so the log always describes one straight line from the seed to the current position.

- **The map.** The recorder keeps a `Map<snapshotId, logLength>`, written once per id when `SnapshotFactory.createSnapshotForCurrentTimepoint` assigns it. A manual snapshot does not write: it stores the same current-timepoint snapshot object (`SnapshotManager.ts:221`, `SnapshotMap.ts:11-15`), so a later write would record a length past the state the rollback restores. Keeping the map in the recorder instead of in `IGameSnapshot` keeps it out of the snapshot payload formats Plan 4 is changing. Entries for snapshots the containers have evicted are pruned with them.
- **Where to truncate.** `rollbackToSnapshotInternal` returns `{ success, snapshotId }`; snapshot ids start at 0, so a bare id would read as failure at every truthiness check, including `Game.ts:2135,2254` and the harness. The recorder truncates and drops map entries for newer ids immediately after the restore succeeds and before `postRollbackOperations`, because that call continues the pipeline and can take new snapshots whose map entries must see the truncated length.
- **Coverage.** The hook sits in the shared rollback exit, the same place Plan 4 restarts its tracker, so it covers player undo, the opponent-approved undo and cost-payment recovery with one call. Cost-payment recovery needs no special case: the inputs that led to the unpayable cost are newer than the target snapshot, so they are cut, and the runner never reaches that point. An approved undo removes itself: the `rollbackToSnapshot` request and the opponent's Allow click both come after the target snapshot.
- **A failed rollback invalidates the log.** On a restore failure, `GameStateManager.rollbackToSnapshot` recovers to the current timepoint's start snapshot, not to the live pre-rollback state, and returns without `postRollbackOperations` or an RNG restore (`SnapshotContainerBase.ts:70-78`, `GameStateManager.ts:283-319`). The live game then differs from what its log describes, so the recorder appends an `invalid` marker and the runner refuses any log that contains one (standing invariant 4).
- **Undo-only inputs are dropped.** Any input to a prompt that exists, or has different choices, only because undo is enabled is marked `undoOnly` at record time and left out of the replayed log. That covers a `rollbackToSnapshot` request that did not roll back (denied, blocked by `undoRequestsBlocked`, or failed), every answer to an `UndoConfirmationPrompt`, and the `Undo` / `Request undo` answers to the cost-payment recovery prompt. The recorder decides by the open prompt's class and, for prompts whose choices depend on `isUndoEnabled`, by the chosen button's text; work item E's parity gate proves the list complete.
- **Denied undo prompts shift the uuid counter.** The runner never builds those prompts, so its uuids differ from the live game's after the first denied request. Stable references (B) make this harmless for inputs, and checkpoints (D) never compare `lastGameObjectId`.

The correctness argument is the undo system's own: "rolled back to snapshot S, then continued" must behave exactly like "reached S without undoing".
`npm run test-undo` checks that for the end state of each spec, but not for everything a replay depends on, such as prompt state and the per-window flags that `resetPromptedPlayersTracking` clears.
Work items D and E catch the gaps.

### D. Divergence checkpoints

The runner fails loudly the moment its game stops matching the recorded one (standing invariant 4), and never writes a file from a diverged run.

- At every phase boundary, the live game appends a `checkpoint` entry holding the round, the phase, `actionNumber`, the RNG state, and a hash of each card's stable coordinate, zone, damage and exhausted state, ordered by coordinate. It holds no `lastGameObjectId` and no uuid, which legitimately differ between the live game and the runner.
- Checkpoints live in the log, so truncation in C removes the ones an undo invalidated, with no extra bookkeeping.
- At game end, a final checkpoint also records the winner and the end reason.
- The board hash is one pass over the cards a handful of times per game; it is measured with the benchmark harness and kept inside the live CPU budget (see Sequencing).

### E. Replay runner and CI parity gate

The runner rebuilds a game in a process with no players connected:

1. Construct a `Game` from the header with `undoMode: UndoMode.Disabled`, action timers off and the recorded seed and option settings, reusing the test harness's or `MatchLoader`'s lobby-free construction path. Refuse to run if the build commit, card-data hash or Node version differs from the header, if the header names a construction path the runner cannot rebuild, or if the log has an `invalid` marker.
2. Feed each non-`undoOnly` entry in order through the dispatcher from B, resolving stable references against the runner's game, and call `continue()` after input entries only.
3. After each input entry (one player decision), hand control to the projection step in F.
4. At each `checkpoint` entry, recompute the checkpoint and stop with an error naming the entry on a mismatch.

The runner runs only on request, for the game being exported, before the next deploy, and preferably on a worker outside the game node.
A re-simulation costs roughly the original game's engine time, so running it for every finished game would cost more than the live recorder that blocked SWU-PGN.

The CI parity gate works like `test-undo` and is the round-trip check the #2350 review asks for: under a new environment flag, each game spec records its log, then a fresh game is built with the same `setupTestAsync` options and undo off, the log is replayed into it, and the final state is compared with the live game's.
It is the largest item in this plan:

- **Specs change state directly, all the time.** About 600 of roughly 2,200 spec files call harness helpers such as `setDamage`, `moveCard`, `readyCard`, `exhaustCard`, `setHand`, `setDeck` or `moveToNextActionPhase` mid-test, and `GameStateBuilder.setupGameStateAsync` builds every board by direct zone writes followed by `clearAllSnapshots` and manual timepoint calls (`GameStateBuilder.js:119-259`). The harness helpers record themselves as `harnessEvent` log entries that the parity runner replays through the same helper; production never writes those entries.
- **The log slice starts after setup.** Setup-phase inputs the harness drives through `ScriptedSetupRunner` are reproduced by rebuilding with the same `setupTestAsync` options, so the replayed slice starts at the log length recorded when setup finished.
- **Seeds.** `GameFlowWrapper` takes no seed (`GameFlowWrapper.js:21-37`), so the fresh game calls `setRandomSeed` before `initialiseAsync`; specs that call `setRandomSeed` mid-test (at least 20) record it as a `harnessEvent`.
- **Comparison.** State is compared by stable coordinate, not by uuid, with attack ids normalised: `_lastAttackId` is a plain field that rollback does not restore, so any spec with an attack differs in `AttacksThisPhaseWatcher` state between an undo-on run and a fresh undo-off replay.
- **The production-only uuid race.** The test card-data getter hides the deck-construction race, so a dedicated spec constructs a game with a getter that resolves out of order and asserts the stable coordinates still match.
- **Real divergences.** Each one the gate finds is either an engine bug in rollback (fixed) or a missing `undoOnly` / `harnessEvent` case (added); neither weakens the gate. Their number is unknown until the gate first runs.

### F. Perspective projection and file writing

After each player decision, the runner projects the board once per viewer and writes that viewer's SWU-PGN records.
The record grammar, entity model, attribute registry, diffing and serialisation belong to the SWU-PGN format package; this plan drives them.

1. **Viewers.** One file per viewer: player 1, player 2, and a spectator who sees only public information. A served file is always a perspective file.
2. **Projection.** The board comes from the engine's own per-viewer projection, built on `getSummary(viewer)` and the hidden-information rules live games use (`zone.hiddenForPlayers`). The same projection is what #3072's committed `getState()` fixtures guard. Visibility is allow-listed: a card's identity is hidden for a viewer unless the engine shows it to that viewer.
3. **Diffs.** Each step's projected board is diffed mechanically against that viewer's previous step and written as generic entity records. Because every step is the engine's own board, the file cannot drift from the game.
4. **Reveals.** A card's identity enters a viewer's file through a reveal record addressed to that viewer, at the step where the viewer first saw it. Most reveals fall out of the diff (a card whose summary becomes visible to the viewer). The rest come from events within the step that leave no trace in the end-of-step board: `RevealSystem` reveals, a deck's shown top card, and a card that passes through a public zone and leaves it within one decision. The runner listens for these and adds the matching reveal records.
5. **Ids.** Every entity gets an opaque random id, drawn fresh per file, so ids carry neither decklist order, creation order nor copy counts.
6. **What a file never contains.** The seed, the input log, the opponent's decklist, sideboard or deck order, any card the viewer never saw, and either player's user object or account id; players are named by the export policy (open question 1).
7. **Selection state.** The viewer's selectable and selected flags are dropped for hidden cards: over time they would reveal a hidden hand card's cost, aspects and type.
8. **Narrative.** The narrative layer comes from the engine's game log, which spectators already see. Message arguments that name a card the viewer has not been shown are replaced with a generic "a card" argument, since log messages capture `getShortSummary()` at write time and do not pass through the visibility rules. Player chat is excluded.

Not in a file: timer warnings (`Player.ts:264-275`) and messages the lobby adds to the game log (`Lobby.ts:893-894,966,1016,1301`). They are not game state and are not in the log.

### G. Storage and expiry

A log is only valid on the build that recorded it, so a file can be generated until the next deploy and not after.

- **Log storage.** The log lives from game start until the next deploy. Where it lives between game end and the deploy (in memory on the game node, DynamoDB, object storage) is open question 2.
- **Generated files.** A generated perspective file is engine-independent and can be kept indefinitely; whether the server keeps it or only hands it to the requesting player is part of the same question.
- **Expiry.** A request after a deploy gets "this replay has expired". Keeping old builds able to run the runner is the only way past that and is not planned.

## Sequencing and size

Recording is not enabled in production until the runner and the parity gate exist, because a log format nobody has replayed is unvalidated data and a format change would invalidate everything collected.
The live cost of A–D gets an explicit CPU budget, measured recorder-on versus recorder-off on a realistic game mix, the way the #2350 review measured SWU-PGN.

1. B's dispatcher and stable references, C, D and E's parity mode, together behind the test flag.
2. The runner against production-shaped games, with the CPU budget measured.
3. F, once the SWU-PGN format package and the engine-owned projection exist.
4. G and production recording.

| Item | Size | Notes |
|---|---|---|
| A. Header | Small | |
| B. Input log and stable references | Medium | Includes the dispatcher refactor in `Lobby` and the harness, and the card-coordinate assignment. |
| C. Truncation | Small–Medium | Touches the rollback exit that Plan 4 also changes; land after `P4-A` or coordinate with it. |
| D. Checkpoints | Small | |
| E. Runner and parity gate | Large | Includes `harnessEvent` recording across the harness, plus an unknown number of divergence fixes. |
| F. Perspective projection and file writing | Medium | Assumes the SWU-PGN package provides the entity model, diff and serialiser, and the engine provides the per-viewer projection. |
| G. Storage | Depends on the decision | |

## Decisions

- **Stable references over deterministic uuids.** Making `Game.initialiseAsync` build decks sequentially would remove the construction race, but denied undo prompts and bug-report saves would still move the counter, and it changes the production start-up path. Recording stable coordinates touches only the recorder, the runner and card creation, and satisfies standing invariant 2.
- **One step per player decision.** It matches the review's cheaper option and the log's natural granularity. Finer steps (one per event window) would cost runner CPU only, not live CPU, so they remain possible later without touching recording.
- **Perspective files only.** Omniscient data stays on the server; each viewer's file is projected separately rather than filtered from an omniscient stream.

## Open questions

1. How players are named in a file (usernames, "Player 1/2", or the player's choice).
2. Where the log lives between game end and the next deploy, and whether generated files are kept by the server.
3. Whether the engine-owned projection is built on `getSummary(viewer)` or on typed accessors that `getSummary` is then built on; the #2350 review leaves this open and both this plan and SWU-PGN consume the answer.

## Non-goals

- Designing the replay file format, its reader or its package; SWU-PGN owns them.
- Serving omniscient files, or serving the input log.
- Generating files after the deploy that follows a game.
- Replays of games loaded from a Plan 2 save, or of dev test games started with `startTestGameAsync` (`Lobby.ts:1367-1405`), which inject state directly; the runner refuses both.
- Showing undos in a replay. Truncation removes them by design; showing them would need a separate, non-truncated record.
- Replacing the engine's string uuids with numbers.
- Any use of the log as a save format; Plan 2 and Plan 6 own that.
