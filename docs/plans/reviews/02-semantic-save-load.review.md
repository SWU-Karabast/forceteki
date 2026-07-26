# Adversarial Review: `docs/plans/02-semantic-save-load.md`

## Verdict

The plan's factual grounding is mostly excellent — I verified essentially every file/line citation against the tree (`Lobby.ts:1259-1289`, `Deck.ts:207-228`, `Game.ts:1578-1592/1964-1973/2006-2043`, `GameStateBuilder.js:95-256/237-253`, `SnapshotManager.ts:401,408`, `Randomness.ts:19-29`, `SnapshotFactory.ts:157`, `Card.ts:555-562`, `StateWatcher.ts:105-110`, the empty `server/game/core/stateSerialization/` dir, and `card-data-version.txt` = `20260423_00`) and they are all accurate. The problem is the schema and loader design, which is where the actual risk lives. The schema's `stateWatchers.entries: [...plain data...]` line is flatly wrong — watcher entries are built out of `GameObjectId` uuids by design — which violates the plan's own headline invariant and has no remapping design. The plan also under-specifies the resume path (it describes two mutually inconsistent mechanisms), omits `passedActionPhase`/claimed-initiative reconstruction, can't represent JTL pilot-leader deployment, and breaks its own duplicate-disambiguation rule in `abilityLimits`. None of these are fatal to the concept; all of them are fatal to "implement the schema as written." **Verdict: REJECTED in current form — the schema section needs a revision pass before PR 1 (schema+writer) starts.**

---

## Blocker

### B1. `stateWatchers.entries` cannot be "plain data" — watcher entries are full of GameObjectId uuids

- **Plan says:** `"stateWatchers": [ { "watcher": "cardsPlayedThisPhase", "entries": [ ...plain data... ] } ]` and, two rules later, "**No uuids anywhere in the file.**"
- **Code shows:** The dev assertion the plan itself cites as a model *mandates* uuid storage: `server/game/core/stateWatcher/StateWatcher.ts:106` — "Use GameObjectId instead and call go.getObjectId() to capture the reference in state." Concretely, `server/game/stateWatchers/CardsPlayedThisPhaseWatcher.ts:15-21` stores `card: GameObjectId<IPlayableCard>`, `playedBy: GameObjectId<Player>`, `parentCard?: GameObjectId<IInPlayCard>`, populated via `getObjectId()` at lines 67-73. `GameObjectId` is a branded runtime id (`server/game/core/GameObjectUtils.ts:29`).
- **Why it matters:** Serializing entries verbatim embeds runtime uuids (invariant 2 violation, and dangling after load). Translating them to stable coordinates is genuinely hard: an entry may reference the specific copy of a duplicate now in the discard, or a defeated token unit that no longer exists in any zone of the save. Watchers reset only at end of phase (`StateWatcher.ts:43-47`), and v1 saves are mid-phase action windows, so entries will routinely be non-empty. This is not an edge case; it is the schema's core unsolved problem.
- **Fix:** Add a work item defining a per-watcher semantic encoding (e.g., `{ internalName, controllerSeat, copyOrdinal | 'no-longer-in-game', capturedProps }`) with an explicit rule for referents that can't be re-identified — either writer refusal (consistent with invariant 4) or a documented lossy encoding per watcher. Do not start PR 1 until this is designed.

## Major

### M1. Claimed-initiative positions: `passedActionPhase` reconstruction is never mentioned, and the "proof of concept" can't produce such positions

- **Plan says:** schema has `isInitiativeClaimed`, and C.5 restores "`Game.state` scalars"; the GameStateBuilder pattern is "the proof of concept for the loader."
- **Code shows:** `passedActionPhase` is *Player* state (`server/game/core/Player.ts:69,153`), set by initiative claim (`Game.ts:1345`) and consulted by action-window sequencing at exactly the save boundary (`Game.ts:648-658`, `ActionWindow.ts:200-204`). `GameStateBuilder`/`PlayerInteractionWrapper` have no facility to set it — test setups only support `hasInitiative` pre-game (`GameStateBuilder.js:115-119`).
- **Why it matters:** Save after player A claims initiative, load naively → A's `passedActionPhase` is null → A gets prompted for actions again. Wrong game. It is derivable (`isInitiativeClaimed && initiativePlayer === A ⇒ A.passedActionPhase = true`), but only if someone writes that line, and the plan's model code never will.
- **Fix:** State the derivation explicitly in C.5, and add a claimed-initiative save to the E-continuation test list (it's currently absent from "attack, play unit, use triggered ability, claim initiative" — claiming *before* save, not after load).

### M2. Leader-deployed-as-pilot (JTL) is unrepresentable and not on the refusal list

- **Plan says:** `"leader": { "card": "...", "deployed": true, "side": "front", ... }`.
- **Code shows:** `DeployType.LeaderUpgrade` (`server/game/core/Constants.ts:51-52`) — leaders deploy as pilot *upgrades attached to a unit* (`DeployAndAttachPilotLeaderSystem.ts`; four JTL leaders reference it, e.g. `LandoCalrissianBuyingTime.ts:56`). The test helper the loader ports only supports `DeployType.LeaderUnit` (`PlayerInteractionWrapper.ts:126`), and its epic-action bookkeeping fishes for an ability whose title `.includes('Deploy')` (line 129) — ambiguous for pilot leaders, which have two deploy actions.
- **Why it matters:** A boolean `deployed` can't say "attached to which unit, as a pilot." Writer would silently emit an unloadable/wrong position — a direct invariant-4 violation the plan's own unsupported-state detector doesn't list.
- **Fix:** Either extend the schema (`deployType: 'unit' | 'pilot'`, plus attachment target expressed as an in-file ordinal) or add pilot-deployed leaders to the v1 writer-refusal list. Also replace the title-string deploy-limit hack with `isEpicActionLimit()` when porting.

### M3. Top-level `abilityLimits` violates the plan's own duplicate-disambiguation rule

- **Plan says:** "where a player controls N copies of a card ... per-copy state travels with the entry, so no cross-references between copies are needed" — but then defines `abilityLimits` as a *top-level* array keyed by `(card, abilityIdentifier)`.
- **Code shows:** Limits are per-ability-*instance*, and each card copy constructs its own ability objects with their own `useCount` (`server/game/core/ability/AbilityLimit.ts:75,112,148`). Two Wampas both have `wampa_triggered_0`; the top-level entry `{ card: "wampa", abilityIdentifier: "wampa_triggered_0", usesByPlayer: {...} }` cannot say which copy spent its use.
- **Why it matters:** For once-per-round abilities this changes legal plays after load. The schema contradicts its own load-bearing rule.
- **Fix:** Move limit counts into the per-card zone entries (where copy identity is positional), keeping only card-independent limits (if any) top-level. Note also the defeated-leader case: `EpicActionLimit.reset()` is deliberately a no-op (`AbilityLimit.ts:263-265`), so "leader in base, deploy already used" is a real position; the ported `setLeaderStatus` only increments the limit when `deployed === true` (`PlayerInteractionWrapper.ts:125-132`), and a generic limit-restore pass layered on top of it would *double-count* for deployed leaders. Specify the ordering.

### M4. The plan describes two inconsistent resume mechanisms, and its cited model covers only the canonical round-1 first window

- **Plan says:** (a) "Load re-enters via the same entry-point machinery rollback uses (`SnapshotManager.getEntryPointAfterRollback` → `initializePipelineForRound`)"; (b) C.6: "clear + re-seed snapshot history (exactly as `GameStateBuilder.js:237-253` does), re-enter pipeline at the action window."
- **Code shows:** These are different mechanisms. `GameStateBuilder` never re-enters the pipeline — after `advancePhases` the game is *already sitting* in a live `ActionWindow` (round 1, active player = fresh-setup initiative player), and the manual `takeSnapshot` calls at `GameStateBuilder.js:242-252` exist precisely because no re-entry occurs. Rollback's path (`Game.postRollbackOperations`, `Game.ts:1964-1973` → `buildActionPhaseSteps` with `RollbackToWithinPhase`, `Game.ts:1234-1235`) clears the pipeline and rebuilds it, then immediately `pipeline.continue`s. A saved position with `actionPhaseActivePlayer !== initiativePlayer` or `roundNumber > 1` is unreachable by the GameStateBuilder pattern (setting `state.actionPhaseActivePlayer` after injection won't change the already-open ActionWindow's prompt). Also, `getEntryPointAfterRollback` is `private` and reads `currentSnapshottedTimepointType` (`SnapshotManager.ts:361-362`) — unusable as described for a fresh load; the loader would construct `{ type: Round, entryPoint: WithinActionPhase }` directly.
- **Why it matters:** Whoever implements PR 2/3 has to invent the actual sequence (set scalars → seed snapshots → `postRollbackOperations`? in which order relative to `resolveGameState(true)`? does the re-entered ActionPhase take its own action snapshot, duplicating the seeded one?). This is the highest-risk part of the loader and the plan hand-waves it with two contradictory pointers.
- **Fix:** Specify the exact load sequence and which mechanism owns snapshot seeding; add a continuation test where the loaded position is mid-phase with the non-initiative player active.

### M5. Hard-fail on `cardDataVersion` mismatch undercuts the plan's stated reason for existing

- **Plan says:** Goal: saves are "robust to engine changes: a loaded position picks up current card implementations and rules, exactly as a physical game re-set-up would." Then C.1: "mismatched card-data version: hard fail v1."
- **Why it matters:** `card-data-version.txt` bumps on every card-data refresh (new set, errata download). Under C.1, every data refresh bricks *all* existing saves, even though the identifiers the schema actually depends on (`internalName`, set codes) are stable across refreshes — as the plan itself says in the drift-surface paragraph. The durability pitch and the validation rule contradict each other.
- **Fix:** Validate what actually matters: every `internalName`/token/ability coordinate in the file resolves against current data; fail (loudly, per invariant 4) only on genuine resolution failures. Keep `cardDataVersion` as diagnostic metadata, not a gate. If the team insists on the hard gate for v1, the Goal section must stop claiming cross-version durability.

### M6. "Most transient state is already gone" at action boundaries is wrong, and the refusal rate is underplayed

- **Plan says:** "Because v1 saves only at action-window boundaries, most transient state is already gone; the writer asserts the rest."
- **Code shows:** Only `UntilEndOfAttack` effects are gone at an action boundary. `UntilEndOfPhase` and `UntilEndOfRound` effects survive across action windows within the phase (`OngoingEffectEngine.ts:271-279`), and "for this phase" buffs, gained abilities, and delayed effects are bread-and-butter SWU card text. All of these are on the v1 refusal list.
- **Why it matters:** In practice, a mid-round save will very frequently be refused; the reliably savable moments collapse to "start of round before anything interesting happened." That may still be an acceptable v1, but it's a product decision that should be made with eyes open — it also strengthens the plan's own closing suggestion that bug-report attachment, not player-facing save, is the highest-value v1 consumer.
- **Fix:** Add an honest estimate of refusal frequency (measurable by instrumenting the writer against existing integration-test positions) and let that drive whether v1 ships player-facing or engine/bug-report-only.

## Minor

### m1. Chat messages embed uuids (and `Date` objects), violating the no-uuid rule and breaking the round-trip test as specified

`GameChat.tryFormatPlaceholder` resolves GameObject args via `getShortSummary()` (`GameChat.ts:133-134`), which returns `{ id, name, uuid }` (`GameObject.ts:143-149`). So `chat: ISerializedMessage[]` verbatim puts uuids in the file — dead references after load. Additionally `ISerializedMessage.date` is a `Date` (`server/game/Interfaces.ts:440`); JSON round-trip yields strings, so E's "deeply equal" save→load→save comparison fails on dates (and on `savedAt`) unless the test normalizes. Fix: scrub uuids at write time (they're display-only) and define dates as ISO strings; exclude `savedAt` from the equality check.

### m2. Player identity remapping is unaddressed

Schema stores player `id`/`name` and keys `usesByPlayer`, `timers`, `ownerId` by them; D recommends "anyone with the file" may load. The loading lobby's user ids will not match the saved ids (and limit maps are keyed by player *name* in code — `AbilityLimit.ts:102-104`). The plan never defines the seat-mapping step (who becomes "p1", how decklists bind to consenting users). Fix: define in-file ids as abstract seat labels and specify the seat→user binding in work item D.

### m3. Redundant dual representations invite writer/reader divergence

(a) Initiative appears twice: `game.initiativePlayer` and `players[].hasInitiative`. (b) Token upgrades appear both as attachment-path upgrades (that's how injection actually creates them — `PlayerInteractionWrapper.ts:317-329` routes `shield`/`experience` through `generateToken` + `attachTo`) and as a per-unit `tokens: { shield: 1, experience: 2 }` count map. Which one is authoritative when they disagree? Pick one canonical form for each.

### m4. "Advance through setup deterministically" hides a new engine feature: a headless prompt driver

Getting a fresh game to the first action window requires *answering prompts*: initiative-flip choice (`GameFlowWrapper.selectInitiativePlayer:205-212`), mulligan "Keep" (`:99-102`), resource-two selection via `clickAnyOfSelectableCards` (`:82-90`) — all test-only machinery driven by prompt-title string matching, plus the pre-start `game.initiativePlayer` injection (`GameStateBuilder.js:115-119`) that makes the flip moot. Work item C.4 lists only the zone-injection methods to port; the prompt-driving half of the model is in `GameFlowWrapper`, which the plan never mentions. Not a design flaw, but the C-sized estimate ("landable in 3-4 PRs") should account for it.

### m5. Loader should assert the staging zone is empty after injection

`moveAllNonBaseZonesToRemoved` actually stages everything in the `outsideTheGame` zone (`PlayerInteractionWrapper.ts:56-61`), which is *also* a real semantic zone in the schema (`outsideTheGame: [...]`). Any card the loader fails to place silently remains there — exactly the "silent degradation" invariant 4 forbids. Fix: after injection, assert staging residue equals the save's declared `outsideTheGame` contents.

### m6. Round-trip tests via GameStateBuilder won't reflect production watcher registration

`GameStateBuilder.registerAllStateWatchers` registers every watcher in the library "to stress test them" (`GameStateBuilder.js:233,262-271`); production games register only the watchers their cards request. Save-from-test-position vs save-from-loaded-production-game will differ in which `stateWatchers` entries exist at all. The E work item should state how the comparison handles absent-vs-empty watchers.

## Nit

- `Deck.buildCardsFromSetCodeAsync` is `private` (`Deck.ts:207`) — fine as a pointer to "machinery exists," but the loader needs a public surface; worth a word.
- "Watchers by `StateWatcherName` enum" — true for the watcher *key*; the misleading part is the entries (see B1).
- Schema example `"phase": "action"` is dead weight in v1 (always `action` by the restriction); either drop it or note it's future-proofing for Plan 6.

---

## What I'd ask the author

1. For a watcher entry that references a specific dead copy (defeated token, one-of-N duplicate now in discard), what does the save file actually store — and is writer refusal on unresolvable watcher refs acceptable, given that would push the refusal rate from M6 even higher?
2. Walk me through the exact load sequence for a save where p2 is active mid-phase in round 4 with initiative claimed by p1: which state is set before `postRollbackOperations`, who takes the first action snapshot, and what does the pipeline look like the moment `continue()` fires?
3. Given M6 (frequent writer refusals) — is the real v1 customer the player-facing save button, or the bug-report attachment you tucked into the last bullet? If it's the latter, does the refusal behavior flip to "save degraded with a warning" instead of "refuse"?
